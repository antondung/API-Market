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
export const usageFilters = z
  .object({
    page: z.coerce.number().int().min(1).max(10000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    apiId: marketplaceId.optional(),
    status: z.coerce.number().int().min(100).max(599).optional(),
    from: date.optional(),
    to: date.optional(),
  })
  .strict()
  .transform((q) => ({
    ...q,
    from:
      q.from ?? new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10),
    to: q.to ?? new Date().toISOString().slice(0, 10),
  }))
  .refine(
    (q) =>
      Date.parse(q.to) >= Date.parse(q.from) &&
      Date.parse(q.to) - Date.parse(q.from) <= 365 * 86400000,
  );
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
  async overview(user: string, q: Filters) {
    const params = [user, q.from, q.to, q.apiId ?? null];
    const scope =
      "a.provider_id IN (SELECT id FROM api_providers WHERE user_id=$1) AND ($4::integer IS NULL OR a.id=$4)";
    const requests = (
      await this.pool.query(
        `SELECT COUNT(*)::text AS "requestCount",COUNT(*) FILTER(WHERE l.status_code<400)::text AS "successCount",COUNT(*) FILTER(WHERE l.status_code>=400)::text AS "errorCount",COALESCE(AVG(l.latency_ms),0)::float8 AS "averageLatencyMs" FROM usage_logs l JOIN apis a ON a.id=l.api_id WHERE ${scope} AND l.occurred_at >= $2::date AND l.occurred_at < $3::date+1`,
        params,
      )
    ).rows[0];
    const daily = (
      await this.pool.query(
        `SELECT l.occurred_at::date AS date,COUNT(*)::text AS "requestCount" FROM usage_logs l JOIN apis a ON a.id=l.api_id WHERE ${scope} AND l.occurred_at >= $2::date AND l.occurred_at < $3::date+1 GROUP BY 1 ORDER BY 1`,
        params,
      )
    ).rows;
    const revenue = (
      await this.pool.query(
        `SELECT t.currency,SUM(t.amount)::text AS amount FROM transactions t JOIN subscriptions s ON s.id=t.subscription_id JOIN apis a ON a.id=s.api_id WHERE ${scope} AND t.type='Charge' AND t.status='Succeeded' AND t.occurred_at >= $2::date AND t.occurred_at < $3::date+1 GROUP BY t.currency ORDER BY t.currency`,
        params,
      )
    ).rows;
    const activeSubscribers = (
      await this.pool.query(
        `SELECT COUNT(*)::text AS n FROM subscriptions s JOIN apis a ON a.id=s.api_id WHERE a.provider_id IN (SELECT id FROM api_providers WHERE user_id=$1) AND ($2::integer IS NULL OR a.id=$2) AND s.status='Active' AND s.current_period_end>NOW() AND (s.expires_at IS NULL OR s.expires_at>NOW())`,
        [user, q.apiId ?? null],
      )
    ).rows[0].n;
    return { requests, daily, revenue, activeSubscribers };
  }
}
