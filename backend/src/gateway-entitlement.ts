import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { ApiError } from "./auth.js";
import { RedisMeter } from "./redis-meter.js";
import { UsageService, type UsageResult } from "./usage-service.js";
export interface GatewayAdmission {
  reserve(
    identity: { id: string; userId: string; apiId: string },
    endpointId: string,
  ): Promise<{ complete(result: UsageResult): Promise<void> }>;
}
export class GatewayEntitlement implements GatewayAdmission {
  constructor(
    readonly pool: Pool,
    readonly meter: RedisMeter,
    readonly usage: UsageService,
  ) {}
  async reserve(
    identity: { id: string; userId: string; apiId: string },
    endpointId: string,
  ) {
    const c = await this.pool.connect();
    const occurredAt = new Date(),
      requestId = randomUUID();
    try {
      await c.query("BEGIN");
      const s = (
        await c.query(
          `SELECT s.* FROM subscriptions s JOIN api_plans p ON p.id=s.plan_id WHERE s.consumer_id=$1 AND s.api_id=$2 AND s.status='Active' AND s.current_period_end>NOW() AND (s.expires_at IS NULL OR s.expires_at>NOW()) AND p.is_active FOR UPDATE OF s`,
          [identity.userId, identity.apiId],
        )
      ).rows[0];
      if (!s)
        throw new ApiError(
          403,
          "SUBSCRIPTION_REQUIRED",
          "Active subscription required",
        );
      // Short row lock serializes durable quota and Redis floor; released before upstream I/O.
      await this.meter.consume({
        apiKeyId: identity.id,
        endpointId,
        subscriptionId: String(s.id),
        periodStart: new Date(s.quota_reset_at).toISOString(),
        expiresAt: new Date(s.quota_reset_at).getTime(),
        floor: Number(s.quota_used),
        quota: Number(s.quota_limit),
        rateLimit: s.rate_limit_per_minute,
      });
      // Recheck revocation/publication at the reservation boundary, not only at key lookup.
      const valid = await c.query(
        `SELECT k.id FROM api_keys k JOIN users u ON u.id=k.user_id JOIN apis a ON a.id=k.api_id JOIN api_providers p ON p.id=a.provider_id JOIN users pu ON pu.id=p.user_id WHERE k.id=$1 AND k.user_id=$2 AND k.api_id=$3 AND k.is_active AND k.revoked_at IS NULL AND u.is_active AND pu.is_active AND a.status='Published'`,
        [identity.id, identity.userId, identity.apiId],
      );
      if (!valid.rowCount)
        throw new ApiError(401, "INVALID_API_KEY", "Invalid API key");
      await c.query(
        "UPDATE subscriptions SET quota_used=quota_used+1 WHERE id=$1",
        [s.id],
      );
      await this.usage.enqueue(c, {
        requestId,
        occurredAt,
        apiKeyId: identity.id,
        subscriptionId: String(s.id),
        consumerId: identity.userId,
        apiId: identity.apiId,
        endpointId,
      });
      await c.query("COMMIT");
    } catch (e) {
      await c.query("ROLLBACK");
      throw e;
    } finally {
      c.release();
    }
    return {
      complete: (result: UsageResult) =>
        this.usage.complete(requestId, occurredAt, result),
    };
  }
}
