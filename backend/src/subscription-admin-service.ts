import type { Pool } from "pg";
import { ApiError } from "./auth.js";
import { AuditService } from "./audit-service.js";
import { z } from "zod";
export const operationId = z
  .string()
  .regex(/^[1-9][0-9]{0,18}$/)
  .refine((s) => {
    try {
      return BigInt(s) <= 9223372036854775807n;
    } catch {
      return false;
    }
  });
export const monitorQuery = z
  .object({
    page: z.coerce.number().int().min(1).max(10000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    status: z
      .enum([
        "Pending",
        "Active",
        "Past Due",
        "Suspended",
        "Canceled",
        "Expired",
      ])
      .optional(),
    paymentStatus: z
      .enum(["Pending", "Succeeded", "Failed", "Refunded"])
      .optional(),
    consumerId: operationId.refine((s) => BigInt(s) <= 2147483647n).optional(),
    apiId: operationId.refine((s) => BigInt(s) <= 2147483647n).optional(),
  })
  .strict();
export class SubscriptionAdminService {
  constructor(
    readonly pool: Pool,
    readonly audit = new AuditService(pool),
  ) {}
  async list(q: z.infer<typeof monitorQuery>) {
    const params = [q.status ?? null, q.consumerId ?? null, q.apiId ?? null];
    const where =
      "($1::varchar IS NULL OR s.status=$1) AND ($2::integer IS NULL OR s.consumer_id=$2) AND ($3::integer IS NULL OR s.api_id=$3)";
    const items = (
      await this.pool.query(
        `SELECT s.id::text,s.consumer_id::text AS "consumerId",s.api_id::text AS "apiId",a.name AS "apiName",p.name AS "planName",s.status,s.quota_used::text AS "quotaUsed",s.quota_limit::text AS "quotaLimit",s.price_amount::text AS "priceAmount",s.price_currency AS currency,s.current_period_end AS "periodEnd" FROM subscriptions s JOIN apis a ON a.id=s.api_id JOIN api_plans p ON p.id=s.plan_id WHERE ${where} ORDER BY s.id DESC LIMIT $4 OFFSET $5`,
        [...params, q.pageSize, (q.page - 1) * q.pageSize],
      )
    ).rows;
    const total = Number(
      (
        await this.pool.query(
          `SELECT count(*) FROM subscriptions s WHERE ${where}`,
          params,
        )
      ).rows[0].count,
    );
    return { items, total, page: q.page, pageSize: q.pageSize };
  }
  async payments(q: z.infer<typeof monitorQuery>) {
    const params = [
      q.paymentStatus ?? null,
      q.consumerId ?? null,
      q.apiId ?? null,
      q.status ?? null,
    ];
    const where =
      "($1::varchar IS NULL OR p.status=$1) AND ($2::integer IS NULL OR s.consumer_id=$2) AND ($3::integer IS NULL OR s.api_id=$3) AND ($4::varchar IS NULL OR s.status=$4)";
    const items = (
      await this.pool.query(
        `SELECT p.id::text,p.subscription_id::text AS "subscriptionId",s.consumer_id::text AS "consumerId",s.api_id::text AS "apiId",p.amount::text,p.currency,p.status,p.created_at AS "createdAt",p.paid_at AS "paidAt" FROM payments p JOIN subscriptions s ON s.id=p.subscription_id WHERE ${where} ORDER BY p.id DESC LIMIT $5 OFFSET $6`,
        [...params, q.pageSize, (q.page - 1) * q.pageSize],
      )
    ).rows;
    return {
      items,
      total: Number(
        (
          await this.pool.query(
            `SELECT count(*) FROM payments p JOIN subscriptions s ON s.id=p.subscription_id WHERE ${where}`,
            params,
          )
        ).rows[0].count,
      ),
      page: q.page,
      pageSize: q.pageSize,
    };
  }
  async keys(subscriptionId: string) {
    const exists = await this.pool.query(
      "SELECT id FROM subscriptions WHERE id=$1",
      [subscriptionId],
    );
    if (!exists.rowCount)
      throw new ApiError(404, "NOT_FOUND", "Subscription not found");
    return (
      await this.pool.query(
        'SELECT k.id::text,k.is_active AS "isActive",k.revoked_at AS "revokedAt",k.last_used_at AS "lastUsedAt" FROM api_keys k JOIN subscriptions s ON s.consumer_id=k.user_id AND s.api_id=k.api_id WHERE s.id=$1 ORDER BY k.id DESC',
        [subscriptionId],
      )
    ).rows;
  }
  async action(
    actor: string,
    kind: "suspend" | "revoke",
    id: string,
    reason: string,
  ) {
    const c = await this.pool.connect();
    try {
      await c.query("BEGIN");
      if (
        !(
          await c.query(
            "SELECT u.id FROM users u JOIN roles r ON r.id=u.role_id WHERE u.id=$1 AND u.is_active AND r.name='ADMIN' FOR SHARE OF u",
            [actor],
          )
        ).rowCount
      )
        throw new ApiError(403, "FORBIDDEN", "Active Admin required");
      const table = kind === "suspend" ? "subscriptions" : "api_keys";
      const ownerColumn = kind === "suspend" ? "consumer_id" : "user_id";
      const target = (
        await c.query(
          `SELECT ${ownerColumn} AS owner FROM ${table} WHERE id=$1`,
          [id],
        )
      ).rows[0];
      if (!target) throw new ApiError(404, "NOT_FOUND", "Resource not found");
      // Consistent with BillingService: consumer before subscription lock.
      await c.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [
        target.owner,
      ]);
      const row = (
        await c.query(`SELECT * FROM ${table} WHERE id=$1 FOR UPDATE`, [id])
      ).rows[0];
      const changed =
        kind === "suspend" ? row.status !== "Suspended" : row.is_active;
      if (
        kind === "suspend" &&
        !["Active", "Past Due", "Suspended"].includes(row.status)
      )
        throw new ApiError(
          409,
          "INVALID_STATE",
          "Only active subscriptions may be suspended",
        );
      if (changed) {
        if (kind === "suspend")
          await c.query(
            "UPDATE subscriptions SET status='Suspended' WHERE id=$1",
            [id],
          );
        else
          await c.query(
            "UPDATE api_keys SET is_active=false,revoked_at=NOW() WHERE id=$1",
            [id],
          );
        await this.audit.write(c, {
          actorId: actor,
          actorRole: "ADMIN",
          action:
            kind === "suspend" ? "SUBSCRIPTION_SUSPENDED" : "API_KEY_REVOKED",
          targetType: kind === "suspend" ? "subscription" : "api_key",
          targetId: id,
          detail: { reason },
        });
      }
      await c.query("COMMIT");
      return { id, changed };
    } catch (e) {
      await c.query("ROLLBACK");
      throw e;
    } finally {
      c.release();
    }
  }
}
