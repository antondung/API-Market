import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { ApiError } from "./auth.js";
import { RedisMeter } from "./redis-meter.js";
import { UsageService, type UsageResult } from "./usage-service.js";
import { checkCostBudget } from "./cost-guard.js";
type Identity = { id: string; userId: string; apiId: string };
type Subscription = {
  id: string;
  plan_id: number;
  price_amount: string;
  price_currency: string;
  quota_limit: string;
  quota_reset_at: Date;
  quota_period: string;
  quota_used: string;
  rate_limit_per_minute: number;
};
const activeSubscription = `SELECT s.id,s.plan_id,s.price_amount,s.price_currency,s.quota_limit,
    s.quota_reset_at,s.quota_reset_at::text AS quota_period,s.quota_used,s.rate_limit_per_minute
  FROM subscriptions s JOIN api_plans p ON p.id=s.plan_id
  WHERE s.consumer_id=$1 AND s.api_id=$2 AND s.status='Active' AND s.current_period_end>NOW()
    AND (s.expires_at IS NULL OR s.expires_at>NOW()) AND p.is_active`;
const validKey = `SELECT k.id FROM api_keys k
  JOIN users u ON u.id=k.user_id JOIN roles r ON r.id=u.role_id
  JOIN apis a ON a.id=k.api_id JOIN api_providers p ON p.id=a.provider_id JOIN users pu ON pu.id=p.user_id
  WHERE k.user_id=$1 AND k.api_id=$2 AND k.id=$3 AND k.is_active AND k.revoked_at IS NULL
    AND u.is_active AND r.name IN ('USER','API_PROVIDER') AND pu.is_active AND a.status='Published'`;
const subscriptionRequired = () => new ApiError(403, "SUBSCRIPTION_REQUIRED", "Active subscription required");
const invalidKey = () => new ApiError(401, "INVALID_API_KEY", "Invalid API key");
export interface GatewayAdmission {
  reserve(
    identity: Identity,
    endpointId: string,
  ): Promise<{ complete(result: UsageResult): Promise<void> }>;
}
export class GatewayEntitlement implements GatewayAdmission {
  constructor(
    readonly pool: Pool,
    readonly meter: RedisMeter,
    readonly usage: UsageService,
  ) {}
  private async consume(identity: Identity, endpointId: string, s: Subscription) {
    const period = s.quota_reset_at;
    await this.meter.consume({
      apiKeyId: identity.id,
      rateScope: `buyer:${identity.userId}:api:${identity.apiId}`,
      endpointId,
      subscriptionId: s.id,
      periodStart: period.toISOString(),
      expiresAt: period.getTime(),
      floor: Number(s.quota_used),
      quota: Number(s.quota_limit),
      rateLimit: s.rate_limit_per_minute,
    });
  }
  async reserve(identity: Identity, endpointId: string) {
    const occurredAt = new Date();
    const requestId = randomUUID();
    const subscription = (await this.pool.query<Subscription>({
      name: "gateway-subscription-snapshot",
      text: activeSubscription,
      values: [identity.userId, identity.apiId],
    })).rows[0];
    if (!subscription) throw subscriptionRequired();
    if (Number(subscription.price_amount) === 0) {
      // A Redis admission is provisional. PostgreSQL still enforces quota after a Redis reset.
      await this.consume(identity, endpointId, subscription);
      const { result } = (await this.pool.query<{ result: string }>({
        name: "gateway-reserve-free",
        text: `WITH eligible AS MATERIALIZED (
          ${activeSubscription}
          AND s.id=$4 AND s.quota_reset_at=$5::timestamptz AND s.plan_id=$6
          AND s.price_amount=0 AND s.quota_limit=$7 AND s.rate_limit_per_minute=$8
          FOR UPDATE OF s
        ), authorized AS MATERIALIZED (
          ${validKey} AND EXISTS (SELECT 1 FROM eligible) FOR SHARE OF k
        ), reserved AS (
          UPDATE subscriptions s SET quota_used=s.quota_used+1 FROM eligible e
          WHERE s.id=e.id AND e.quota_used<e.quota_limit AND EXISTS (SELECT 1 FROM authorized)
          RETURNING s.id,s.price_currency
        ), enqueued AS (
          INSERT INTO usage_outbox(occurred_at,request_id,api_key_id,subscription_id,consumer_id,api_id,endpoint_id,cost_currency,estimated_cost)
          SELECT $9,$10,$3,id,$1,$2,$11,price_currency,0 FROM reserved RETURNING 1
        )
        SELECT CASE
          WHEN EXISTS (SELECT 1 FROM enqueued) THEN 'accepted'
          WHEN NOT EXISTS (SELECT 1 FROM eligible) THEN 'subscription'
          WHEN NOT EXISTS (SELECT 1 FROM authorized) THEN 'key'
          ELSE 'quota'
        END AS result`,
        values: [
          identity.userId, identity.apiId, identity.id, subscription.id,
          subscription.quota_period, subscription.plan_id, subscription.quota_limit,
          subscription.rate_limit_per_minute, occurredAt, requestId, endpointId,
        ],
      })).rows[0]!;
      if (result === "subscription") throw subscriptionRequired();
      if (result === "key") throw invalidKey();
      if (result === "quota") throw new ApiError(403, "QUOTA_EXHAUSTED", "Subscription quota exhausted");
    } else {
      await this.reservePaid(identity, endpointId, occurredAt, requestId);
    }
    return {
      complete: (result: UsageResult) => this.usage.complete(requestId, occurredAt, result),
    };
  }

  private async reservePaid(identity: Identity, endpointId: string, occurredAt: Date, requestId: string) {
    const c = await this.pool.connect();
    try {
      await c.query("BEGIN");
      const s = (
        await c.query<Subscription>({
          name: "gateway-active-subscription",
          text: `${activeSubscription} FOR UPDATE OF s`,
          values: [identity.userId, identity.apiId],
        })
      ).rows[0];
      if (!s) throw subscriptionRequired();
      const price = { amount: s.price_amount, currency: s.price_currency, quota: s.quota_limit };
      await checkCostBudget(c, identity.userId, price, occurredAt);
      // Short row lock serializes durable quota and Redis floor; released before upstream I/O.
      await this.consume(identity, endpointId, s);
      // Recheck revocation/publication at the reservation boundary, not only at key lookup.
      const valid = await c.query({
        name: "gateway-recheck-api-key",
        text: `${validKey} FOR SHARE OF k`,
        values: [identity.userId, identity.apiId, identity.id],
      });
      if (!valid.rowCount)
        throw invalidKey();
      await this.usage.enqueue(c, {
        requestId,
        occurredAt,
        apiKeyId: identity.id,
        subscriptionId: String(s.id),
        consumerId: identity.userId,
        apiId: identity.apiId,
        endpointId,
        price,
      }, true);
      await c.query("COMMIT");
    } catch (e) {
      await c.query("ROLLBACK");
      throw e;
    } finally {
      c.release();
    }
  }
}
