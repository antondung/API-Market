import type { Pool } from "pg";
import { z } from "zod";
import { marketplaceId } from "./marketplace-service.js";
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (s) =>
      Number.isFinite(Date.parse(s)) &&
      new Date(s).toISOString().slice(0, 10) === s,
  );
const filterSchema = z
  .object({
    page: z.coerce.number().int().min(1).max(10000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    apiId: marketplaceId.optional(),
    status: z.coerce.number().int().min(100).max(599).optional(),
    from: date.default(() => new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10)),
    to: date.default(() => new Date().toISOString().slice(0, 10)),
  })
  .strict();
const validRange = (q: { from: string; to: string }) =>
  Date.parse(q.to) >= Date.parse(q.from) &&
  Date.parse(q.to) - Date.parse(q.from) <= 365 * 86400000;
export const usageFilters = filterSchema.refine(validRange);
export const providerUsageFilters = filterSchema
  .extend({ endpointId: marketplaceId.optional() })
  .refine(validRange);
const errorCounts = `COUNT(*) FILTER(WHERE l.status_code>=400)::text AS "errorCount",
  COUNT(*) FILTER(WHERE l.status_code BETWEEN 400 AND 499)::text AS "clientErrorCount",
  COUNT(*) FILTER(WHERE l.status_code BETWEEN 500 AND 599)::text AS "serverErrorCount"`;
const trafficMetrics = [50, 95, 99].flatMap(p => [
  `percentile_disc(${p / 100}) WITHIN GROUP (ORDER BY l.latency_ms) AS "p${p}LatencyMs"`,
  `percentile_disc(${p / 100}) WITHIN GROUP (ORDER BY l.gateway_overhead_ms) AS "p${p}OverheadMs"`,
]).join(", ");
type Filters = z.infer<typeof usageFilters>;
export class UsageAnalytics {
  constructor(readonly pool: Pool) {}
  async summary(user: string, q: Filters) {
    const subscriptions = (
      await this.pool.query(
        `SELECT s.id::text,s.api_id::text AS "apiId",s.status,s.quota_used::text AS "quotaUsed",s.quota_limit::text AS "quotaLimit",GREATEST(0,s.quota_limit-s.quota_used)::text AS "remainingRequests",s.current_period_start AS "periodStart",s.current_period_end AS "periodEnd" FROM subscriptions s WHERE consumer_id=$1 AND ($2::integer IS NULL OR api_id=$2) ORDER BY id DESC`,
        [user, q.apiId ?? null],
      )
    ).rows;
    const daily = (
      await this.pool.query(
        `SELECT occurred_at::date AS date,COUNT(*)::text AS "requestCount",COUNT(*) FILTER(WHERE status_code<400)::text AS "successCount",COUNT(*) FILTER(WHERE status_code>=400)::text AS "errorCount" FROM usage_logs WHERE consumer_id=$1 AND occurred_at >= $2::date AND occurred_at < $3::date+1 AND ($4::integer IS NULL OR api_id=$4) GROUP BY 1 ORDER BY 1`,
        [user, q.from, q.to, q.apiId ?? null],
      )
    ).rows;
    return { subscriptions, daily };
  }
  async history(user: string, q: Filters) {
    const params = [user, q.from, q.to, q.apiId ?? null, q.status ?? null];
    const where =
      "h.consumer_id=$1 AND h.occurred_at >= $2::date AND h.occurred_at < $3::date+1 AND ($4::integer IS NULL OR h.api_id=$4) AND ($5::integer IS NULL OR h.status_code=$5)";
    const items = (
      await this.pool.query(
        `SELECT h.id::text,h.request_id AS "requestId",h.occurred_at AS "occurredAt",h.api_id::text AS "apiId",a.name AS "apiName",e.method,e.path,h.status_code AS "statusCode",h.error_code AS "errorCode",h.latency_ms AS "latencyMs" FROM request_history h JOIN apis a ON a.id=h.api_id LEFT JOIN api_endpoints e ON e.id=h.endpoint_id WHERE ${where} ORDER BY h.occurred_at DESC,h.id DESC LIMIT $6 OFFSET $7`,
        [...params, q.pageSize, (q.page - 1) * q.pageSize],
      )
    ).rows;
    const total = Number(
      (
        await this.pool.query(
          `SELECT count(*) FROM request_history h WHERE ${where}`,
          params,
        )
      ).rows[0].count,
    );
    return { items, total, page: q.page, pageSize: q.pageSize };
  }
  async overview(user: string, q: Filters & { endpointId?: string }) {
    const params = [user, q.from, q.to, q.apiId ?? null];
    const scope =
      "a.provider_id IN (SELECT id FROM api_providers WHERE user_id=$1) AND ($4::integer IS NULL OR a.id=$4)";
    const trafficParams = [...params, q.endpointId ?? null];
    const trafficScope = `${scope} AND ($5::integer IS NULL OR l.endpoint_id=$5)
      AND l.occurred_at >= ($2::date::timestamp AT TIME ZONE 'UTC')
      AND l.occurred_at < (($3::date+1)::timestamp AT TIME ZONE 'UTC')`;
    const requests = (
      await this.pool.query(
        `SELECT COUNT(*)::text AS "requestCount",
           COUNT(*) FILTER(WHERE l.status_code<400)::text AS "successCount",
           ${errorCounts},
           COALESCE(100.0 * COUNT(*) FILTER(WHERE l.status_code>=400) / NULLIF(COUNT(*),0),0)::float8 AS "errorRatePercent",
           COALESCE(AVG(l.latency_ms),0)::float8 AS "averageLatencyMs",
           ${trafficMetrics}
         FROM usage_logs l JOIN apis a ON a.id=l.api_id WHERE ${trafficScope}`,
        trafficParams,
      )
    ).rows[0];
    const daily = (
      await this.pool.query(
        `SELECT (l.occurred_at AT TIME ZONE 'UTC')::date::text AS date, COUNT(*)::text AS "requestCount"
         FROM usage_logs l JOIN apis a ON a.id=l.api_id WHERE ${trafficScope} GROUP BY 1 ORDER BY 1`,
        trafficParams,
      )
    ).rows;
    const revenue = (
      await this.pool.query(
        `SELECT t.currency,SUM(t.amount)::text AS amount FROM transactions t JOIN subscriptions s ON s.id=t.subscription_id JOIN apis a ON a.id=s.api_id WHERE ${scope} AND t.type='Charge' AND t.status='Succeeded'
         AND t.occurred_at >= ($2::date::timestamp AT TIME ZONE 'UTC')
         AND t.occurred_at < (($3::date+1)::timestamp AT TIME ZONE 'UTC')
         GROUP BY t.currency ORDER BY t.currency`,
        params,
      )
    ).rows;
    const activeSubscribers = (
      await this.pool.query(
        `SELECT COUNT(*)::text AS n FROM subscriptions s JOIN apis a ON a.id=s.api_id WHERE a.provider_id IN (SELECT id FROM api_providers WHERE user_id=$1) AND ($2::integer IS NULL OR a.id=$2) AND s.status='Active' AND s.current_period_end>NOW() AND (s.expires_at IS NULL OR s.expires_at>NOW())`,
        [user, q.apiId ?? null],
      )
    ).rows[0].n;
    const topEndpoints = (
      await this.pool.query(
        `SELECT a.id::text AS "apiId", a.name AS "apiName", e.id::text AS "endpointId", e.method, e.path,
                COUNT(*)::text AS "requestCount", ${errorCounts},
                (100.0 * COUNT(*) FILTER (WHERE l.status_code>=400) / COUNT(*))::float8 AS "errorRatePercent",
                ${trafficMetrics}
         FROM usage_logs l JOIN apis a ON a.id=l.api_id JOIN api_endpoints e ON e.id=l.endpoint_id AND e.api_id=a.id
         WHERE ${trafficScope} GROUP BY a.id,e.id ORDER BY COUNT(*) DESC, e.id LIMIT 10`,
        trafficParams,
      )
    ).rows;
    const apiBreakdown = (await this.pool.query(
      `SELECT a.id::text AS "apiId", a.name AS "apiName", COUNT(*)::text AS "requestCount",
              ${errorCounts},
              (100.0 * COUNT(*) FILTER(WHERE l.status_code>=400) / COUNT(*))::float8 AS "errorRatePercent",
              ${trafficMetrics}
       FROM usage_logs l JOIN apis a ON a.id=l.api_id WHERE ${trafficScope}
       GROUP BY a.id ORDER BY COUNT(*) DESC, a.id`,
      trafficParams,
    )).rows;
    return { requests, daily, revenue, activeSubscribers, topEndpoints, apiBreakdown };
  }
}
