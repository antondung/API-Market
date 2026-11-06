import type { Pool, PoolClient } from "pg";
export interface UsageRecord {
  requestId: string;
  apiKeyId: string;
  subscriptionId: string;
  consumerId: string;
  apiId: string;
  endpointId: string;
  occurredAt: Date;
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
  async enqueue(c: PoolClient, r: UsageRecord) {
    await c.query(
      `INSERT INTO usage_outbox(occurred_at,request_id,api_key_id,subscription_id,consumer_id,api_id,endpoint_id) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
      [
        r.occurredAt,
        r.requestId,
        r.apiKeyId,
        r.subscriptionId,
        r.consumerId,
        r.apiId,
        r.endpointId,
      ],
    );
  }
  async complete(requestId: string, occurredAt: Date, r: UsageResult) {
    const errorCode =
      r.errorCode && /^[A-Z0-9_]{1,64}$/.test(r.errorCode) ? r.errorCode : null;
    await this.pool.query(
      `UPDATE usage_outbox SET status_code=$3,error_code=$4,latency_ms=$5,upstream_latency_ms=$6,response_bytes=$7,gateway_overhead_ms=$8,completed=true WHERE request_id=$1 AND occurred_at=$2 AND NOT completed`,
      [
        requestId,
        occurredAt,
        r.statusCode,
        errorCode,
        r.latencyMs,
        r.upstreamLatencyMs,
        r.responseBytes,
        r.gatewayOverheadMs,
      ],
    );
  }
  async flush() {
    const c = await this.pool.connect();
    try {
      await c.query("BEGIN");
      const batch = await c.query(
        `SELECT * FROM usage_outbox WHERE completed OR created_at<NOW()-INTERVAL '1 minute' ORDER BY created_at,request_id FOR UPDATE SKIP LOCKED LIMIT 500`,
      );
      let inserted = 0;
      for (const r of batch.rows) {
        const result = await c.query(
          `INSERT INTO usage_logs(occurred_at,request_id,api_key_id,subscription_id,consumer_id,api_id,endpoint_id,status_code,error_code,latency_ms,upstream_latency_ms,response_bytes,gateway_overhead_ms,is_sandbox) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,false) ON CONFLICT(occurred_at,request_id) DO NOTHING`,
          [
            r.occurred_at,
            r.request_id,
            r.api_key_id,
            r.subscription_id,
            r.consumer_id,
            r.api_id,
            r.endpoint_id,
            r.completed ? r.status_code : 502,
            r.completed ? r.error_code : "GATEWAY_INTERRUPTED",
            r.completed ? r.latency_ms : 0,
            r.completed ? r.upstream_latency_ms : 0,
            r.completed ? r.response_bytes : 0,
            r.completed ? r.gateway_overhead_ms : 0,
          ],
        );
        inserted += result.rowCount ?? 0;
        await c.query(
          "DELETE FROM usage_outbox WHERE occurred_at=$1 AND request_id=$2",
          [r.occurred_at, r.request_id],
        );
      }
      await c.query("COMMIT");
      return inserted;
    } catch (e) {
      await c.query("ROLLBACK");
      throw e;
    } finally {
      c.release();
    }
  }
  start() {
    if (this.timer) return;
    this.timer = setInterval(() => {
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
