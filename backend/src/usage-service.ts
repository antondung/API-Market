import type { Pool, PoolClient } from "pg";
export interface UsageRecord {
  requestId: string;
  apiKeyId: string;
  subscriptionId: string;
  consumerId: string;
  apiId: string;
  endpointId: string;
  occurredAt: Date;
  price?: { amount: string; currency: string; quota: string };
}
export interface UsageResult {
  statusCode: number;
  errorCode?: string;
  latencyMs: number;
  upstreamLatencyMs: number;
  responseBytes: number;
  gatewayOverheadMs: number;
}
/** Only an explicit metadata whitelist crosses this boundary. Credentials and payloads are never serialized. */
export class UsageService {
  private timer?: NodeJS.Timeout;
  private pending = new Set<Promise<unknown>>();
  constructor(readonly pool: Pool) {}
  async enqueue(c: PoolClient, r: UsageRecord, reserveQuota = false) {
    await c.query({
      name: "usage-enqueue",
      text: `WITH enqueued AS (
        INSERT INTO usage_outbox(occurred_at,request_id,api_key_id,subscription_id,consumer_id,api_id,endpoint_id,cost_currency,estimated_cost)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9::numeric / $10::numeric)
        ON CONFLICT DO NOTHING RETURNING subscription_id
      )
      UPDATE subscriptions SET quota_used=quota_used+1 FROM enqueued
      WHERE $11::boolean AND subscriptions.id=enqueued.subscription_id`,
      values: [
        r.occurredAt,
        r.requestId,
        r.apiKeyId,
        r.subscriptionId,
        r.consumerId,
        r.apiId,
        r.endpointId,
        r.price?.currency ?? null,
        r.price?.amount ?? null,
        r.price?.quota ?? null,
        reserveQuota,
      ],
    });
  }
  async complete(requestId: string, occurredAt: Date, r: UsageResult) {
    const errorCode =
      r.errorCode && /^[A-Z0-9_]{1,64}$/.test(r.errorCode) ? r.errorCode : null;
    await this.pool.query({
      name: "usage-complete",
      text: `UPDATE usage_outbox SET status_code=$3,error_code=$4,latency_ms=$5,upstream_latency_ms=$6,response_bytes=$7,gateway_overhead_ms=$8,completed=true WHERE request_id=$1 AND occurred_at=$2 AND NOT completed`,
      values: [
        requestId,
        occurredAt,
        r.statusCode,
        errorCode,
        r.latencyMs,
        r.upstreamLatencyMs,
        r.responseBytes,
        r.gatewayOverheadMs,
      ],
    });
  }
  async flush() {
    const result = await this.pool.query<{ inserted: number }>(`WITH batch AS MATERIALIZED (
      SELECT * FROM usage_outbox WHERE completed OR created_at<NOW()-INTERVAL '1 minute'
      ORDER BY created_at,request_id LIMIT 500 FOR UPDATE SKIP LOCKED
    ), written AS (
      INSERT INTO usage_logs(occurred_at,request_id,api_key_id,subscription_id,consumer_id,api_id,endpoint_id,
        status_code,error_code,latency_ms,upstream_latency_ms,response_bytes,gateway_overhead_ms,is_sandbox,
        cost_currency,estimated_cost)
      SELECT occurred_at,request_id,api_key_id,subscription_id,consumer_id,api_id,endpoint_id,
        CASE WHEN completed THEN status_code ELSE 502 END,
        CASE WHEN completed THEN error_code ELSE 'GATEWAY_INTERRUPTED' END,
        CASE WHEN completed THEN latency_ms ELSE 0 END,
        CASE WHEN completed THEN upstream_latency_ms ELSE 0 END,
        CASE WHEN completed THEN response_bytes ELSE 0 END,
        CASE WHEN completed THEN gateway_overhead_ms ELSE 0 END,
        false,cost_currency,estimated_cost
      FROM batch ON CONFLICT(occurred_at,request_id) DO NOTHING RETURNING 1
    ), removed AS (
      DELETE FROM usage_outbox o USING batch b
      WHERE o.occurred_at=b.occurred_at AND o.request_id=b.request_id
    )
    SELECT COUNT(*)::int AS inserted FROM written`);
    return result.rows[0]!.inserted;
  }
  start() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      if (this.pending.size) return;
      const p = this.flush()
        .catch(() => {
          console.error("Usage writer retry pending");
        })
        .finally(() => this.pending.delete(p));
      this.pending.add(p);
    }, 250);
    this.timer.unref();
  }
  async close() {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    await Promise.all(this.pending);
    while ((await this.flush()) > 0) {}
  }
}
