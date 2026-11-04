import { createHmac, timingSafeEqual } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { ApiError } from "./auth.js";

const missing = () =>
  new ApiError(404, "NOT_FOUND", "Subscription or payment not found");
const conflict = (code = "INVALID_STATE") =>
  new ApiError(409, code, "Operation conflicts with current state");
const view = (r: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(r).map(([k, v]) => [
      k.replace(/_([a-z])/g, (_, x: string) => x.toUpperCase()),
      v instanceof Date
        ? v.toISOString()
        : v !== null && /(^id$|_id$)/.test(k)
          ? String(v)
          : v,
    ]),
  );
export class BillingService {
  constructor(
    readonly pool: Pool,
    private readonly secret: string,
  ) {
    if (Buffer.byteLength(secret) < 32)
      throw new Error("Sandbox secret must have at least 32 bytes");
  }
  private async tx<T>(work: (c: PoolClient) => Promise<T>) {
    const c = await this.pool.connect();
    try {
      await c.query("BEGIN");
      const r = await work(c);
      await c.query("COMMIT");
      return r;
    } catch (e) {
      await c.query("ROLLBACK");
      if ((e as any).code === "23505")
        throw conflict("SUBSCRIPTION_ALREADY_EXISTS");
      throw e;
    } finally {
      c.release();
    }
  }
  private async owner(c: PoolClient, user: string) {
    if (
      !(
        await c.query(
          "SELECT u.id FROM users u JOIN roles r ON r.id=u.role_id WHERE u.id=$1 AND u.is_active AND r.name='USER' FOR UPDATE OF u",
          [user],
        )
      ).rowCount
    )
      throw new ApiError(403, "FORBIDDEN", "Active Consumer required");
  }
  private async plan(c: PoolClient, id: string) {
    const r = (
      await c.query(
        `SELECT p.* FROM api_plans p JOIN apis a ON a.id=p.api_id JOIN api_providers pr ON pr.id=a.provider_id JOIN users u ON u.id=pr.user_id WHERE p.id=$1 AND p.is_active AND a.status='Published' AND u.is_active FOR SHARE OF p,a,u`,
        [id],
      )
    ).rows[0];
    if (!r)
      throw new ApiError(
        404,
        "PLAN_NOT_FOUND",
        "Published active plan not found",
      );
    return r;
  }
  private async sub(c: PoolClient, user: string, id: string) {
    const r = (
      await c.query(
        "SELECT * FROM subscriptions WHERE id=$1 AND consumer_id=$2 FOR UPDATE",
        [id, user],
      )
    ).rows[0];
    if (!r) throw missing();
    return r;
  }
  async subscribe(user: string, planId: string) {
    return this.tx(async (c) => {
      await this.owner(c, user);
      const p = await this.plan(c, planId);
      // A replacement subscription must not reset consumption within an already used period.
      // The consumer row lock serializes cancellation, subscription and settlement.
      if (
        (
          await c.query(
            "SELECT 1 FROM subscriptions WHERE consumer_id=$1 AND api_id=$2 AND status='Canceled' AND quota_used>0 AND current_period_end>NOW() LIMIT 1",
            [user, p.api_id],
          )
        ).rowCount
      )
        throw conflict("SUBSCRIPTION_PERIOD_LOCKED");
      await c.query(
        "UPDATE subscriptions SET status='Expired',expired_at=NOW() WHERE consumer_id=$1 AND api_id=$2 AND status IN ('Active','Past Due') AND current_period_end<=NOW()",
        [user, p.api_id],
      );
      const r = (
        await c.query(
          `INSERT INTO subscriptions(consumer_id,api_id,plan_id,status,current_period_start,current_period_end,quota_reset_at,expires_at,quota_limit,rate_limit_per_minute,price_amount,price_currency) VALUES($1,$2,$3,$4,NOW(),NOW()+INTERVAL '30 days',NOW()+INTERVAL '30 days',NOW()+INTERVAL '30 days',$5,$6,$7,$8) RETURNING *`,
          [
            user,
            p.api_id,
            p.id,
            Number(p.price_monthly) === 0 ? "Active" : "Pending",
            p.quota,
            p.rate_limit,
            p.price_monthly,
            p.currency,
          ],
        )
      ).rows[0];
      return view(r);
    });
  }
  async list(user: string, page = 1, pageSize = 20) {
    const r = await this.pool.query(
      "SELECT * FROM subscriptions WHERE consumer_id=$1 ORDER BY id DESC LIMIT $2 OFFSET $3",
      [user, pageSize, (page - 1) * pageSize],
    );
    return {
      items: r.rows.map(view),
      total: Number(
        (
          await this.pool.query(
            "SELECT COUNT(*) FROM subscriptions WHERE consumer_id=$1",
            [user],
          )
        ).rows[0].count,
      ),
      page,
      pageSize,
    };
  }
  async get(user: string, id: string) {
    const r = (
      await this.pool.query(
        "SELECT * FROM subscriptions WHERE id=$1 AND consumer_id=$2",
        [id, user],
      )
    ).rows[0];
    if (!r) throw missing();
    return view(r);
  }
  async cancel(user: string, id: string, immediate = false) {
    return this.tx(async (c) => {
      await this.owner(c, user);
      const s = await this.sub(c, user, id);
      if (["Canceled", "Expired"].includes(s.status)) return view(s);
      if (!["Pending", "Active"].includes(s.status)) throw conflict();
      await c.query(
        "UPDATE payments SET status='Failed',failure_code='SUBSCRIPTION_CANCELED' WHERE subscription_id=$1 AND status='Pending'",
        [id],
      );
      return view(
        (
          await c.query(
            `UPDATE subscriptions SET cancel_at_period_end=true,status=CASE WHEN $2 OR status='Pending' THEN 'Canceled' ELSE status END,canceled_at=CASE WHEN $2 OR status='Pending' THEN NOW() ELSE NULL END WHERE id=$1 RETURNING *`,
            [id, immediate],
          )
        ).rows[0],
      );
    });
  }
  private token(id: string, user: string, expiry: Date) {
    const text = `${id}.${user}.${expiry.getTime()}`;
    return `${expiry.getTime()}.${createHmac("sha256", this.secret).update(text).digest("hex")}`;
  }
  private paymentView(p: any, user: string) {
    return {
      paymentId: String(p.id),
      subscriptionId: String(p.subscription_id),
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      expiresAt: new Date(p.checkout_expires_at).toISOString(),
      token: this.token(String(p.id), user, new Date(p.checkout_expires_at)),
    };
  }
  async checkout(user: string, id: string, idempotency: string) {
    return this.makePayment(user, id, idempotency);
  }
  async change(user: string, id: string, planId: string, idempotency: string) {
    return this.makePayment(user, id, idempotency, planId);
  }
  private async makePayment(
    user: string,
    id: string,
    idempotency: string,
    target?: string,
  ) {
    return this.tx(async (c) => {
      await this.owner(c, user);
      const s = await this.sub(c, user, id);
      const key = `${user}:${idempotency}`;
      const existing = (
        await c.query("SELECT * FROM payments WHERE idempotency_key=$1", [key])
      ).rows[0];
      if (existing) {
        if (
          String(existing.subscription_id) !== id ||
          String(existing.target_plan_id ?? "") !== (target ?? "")
        )
          throw conflict("IDEMPOTENCY_CONFLICT");
        return this.paymentView(existing, user);
      }
      if (
        target
          ? s.status !== "Active" ||
            new Date(s.current_period_end).getTime() <= Date.now()
          : s.status !== "Pending"
      )
        throw conflict();
      let amount = s.price_amount,
        currency = s.price_currency,
        quota = null,
        rate = null;
      if (target) {
        const p = await this.plan(c, target);
        if (
          String(p.api_id) !== String(s.api_id) ||
          String(p.id) === String(s.plan_id)
        )
          throw conflict("INVALID_PLAN");
        amount = p.price_monthly;
        currency = p.currency;
        quota = p.quota;
        rate = p.rate_limit;
      }
      // Expired checkouts may be retried under a new idempotency key, never replayed as a new charge.
      await c.query(
        "UPDATE payments SET status='Failed',failure_code='CHECKOUT_EXPIRED' WHERE subscription_id=$1 AND status='Pending' AND checkout_expires_at<=NOW()",
        [id],
      );
      if (
        (
          await c.query(
            "SELECT id FROM payments WHERE subscription_id=$1 AND status='Pending'",
            [id],
          )
        ).rowCount
      )
        throw conflict("CHECKOUT_PENDING");
      const p = (
        await c.query(
          `INSERT INTO payments(subscription_id,idempotency_key,amount,currency,target_plan_id,target_quota,target_rate) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
          [id, key, amount, currency, target ?? null, quota, rate],
        )
      ).rows[0];
      return this.paymentView(p, user);
    });
  }
  async confirm(
    user: string,
    input: {
      paymentId: string;
      token: string;
      outcome: "success" | "failure";
      eventId: string;
    },
  ) {
    const p = (
      await this.pool.query(
        "SELECT p.*,s.consumer_id FROM payments p JOIN subscriptions s ON s.id=p.subscription_id WHERE p.id=$1 AND s.consumer_id=$2",
        [input.paymentId, user],
      )
    ).rows[0];
    if (!p) throw missing();
    if (new Date(p.checkout_expires_at).getTime() <= Date.now())
      throw conflict("CHECKOUT_EXPIRED");
    const expected = this.token(
      String(p.id),
      user,
      new Date(p.checkout_expires_at),
    );
    const actual = Buffer.from(input.token);
    if (
      actual.length !== Buffer.byteLength(expected) ||
      !timingSafeEqual(actual, Buffer.from(expected))
    )
      throw new ApiError(
        401,
        "INVALID_SANDBOX_TOKEN",
        "Invalid sandbox confirmation",
      );
    return this.settle(input);
  }
  async webhook(raw: Buffer, timestamp: string, signature: string) {
    const seconds = Number(timestamp);
    if (
      !/^\d{10}$/.test(timestamp) ||
      !Number.isFinite(seconds) ||
      Math.abs(Date.now() / 1000 - seconds) > 300 ||
      !/^[a-f0-9]{64}$/.test(signature)
    )
      throw new ApiError(
        401,
        "INVALID_WEBHOOK",
        "Webhook authentication failed",
      );
    const digest = createHmac("sha256", this.secret)
      .update(`${timestamp}.`)
      .update(raw)
      .digest();
    if (!timingSafeEqual(digest, Buffer.from(signature, "hex")))
      throw new ApiError(
        401,
        "INVALID_WEBHOOK",
        "Webhook authentication failed",
      );
    let input: any;
    try {
      input = JSON.parse(raw.toString("utf8"));
    } catch {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid JSON");
    }
    if (
      !input ||
      !/^[1-9]\d{0,18}$/.test(input.paymentId) ||
      BigInt(input.paymentId) > 9223372036854775807n ||
      !["success", "failure"].includes(input.outcome) ||
      typeof input.eventId !== "string" ||
      !/^[A-Za-z0-9_.:-]{1,100}$/.test(input.eventId) ||
      Object.keys(input).some(
        (k) => !["paymentId", "outcome", "eventId"].includes(k),
      )
    )
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid webhook fields");
    return this.settle(input);
  }
  private async settle(input: {
    paymentId: string;
    outcome: "success" | "failure";
    eventId: string;
  }) {
    return this.tx(async (c) => {
      const probe = (
        await c.query(
          "SELECT s.consumer_id,p.subscription_id FROM payments p JOIN subscriptions s ON s.id=p.subscription_id WHERE p.id=$1",
          [input.paymentId],
        )
      ).rows[0];
      if (!probe) throw missing();
      await this.owner(c, String(probe.consumer_id));
      const s = await this.sub(
        c,
        String(probe.consumer_id),
        String(probe.subscription_id),
      );
      const p = (
        await c.query("SELECT * FROM payments WHERE id=$1 FOR UPDATE", [
          input.paymentId,
        ])
      ).rows[0];
      const existing = (
        await c.query("SELECT * FROM transactions WHERE external_event_id=$1", [
          input.eventId,
        ])
      ).rows[0];
      const desired = input.outcome === "success" ? "Succeeded" : "Failed";
      if (existing) {
        if (
          String(existing.payment_id) !== input.paymentId ||
          existing.status !== desired
        )
          throw conflict("WEBHOOK_CONFLICT");
        return { paymentId: input.paymentId, status: desired, duplicate: true };
      }
      if (p.status !== "Pending") throw conflict("PAYMENT_ALREADY_SETTLED");
      if (new Date(p.checkout_expires_at).getTime() <= Date.now())
        throw conflict("CHECKOUT_EXPIRED");
      if (
        p.target_plan_id
          ? s.status !== "Active" ||
            new Date(s.current_period_end).getTime() <= Date.now()
          : s.status !== "Pending"
      )
        throw conflict("SUBSCRIPTION_UNAVAILABLE");
      if (input.outcome === "success") {
        await this.plan(c, String(p.target_plan_id ?? s.plan_id));
        if (p.target_plan_id)
          await c.query(
            "UPDATE subscriptions SET plan_id=$2,quota_limit=$3,rate_limit_per_minute=$4,price_amount=$5,price_currency=$6 WHERE id=$1",
            [
              s.id,
              p.target_plan_id,
              p.target_quota,
              p.target_rate,
              p.amount,
              p.currency,
            ],
          );
        else
          await c.query(
            "UPDATE subscriptions SET status='Active',current_period_start=NOW(),current_period_end=NOW()+INTERVAL '30 days',quota_reset_at=NOW()+INTERVAL '30 days',expires_at=NOW()+INTERVAL '30 days' WHERE id=$1",
            [s.id],
          );
      } else if (!p.target_plan_id)
        await c.query(
          "UPDATE subscriptions SET status='Canceled',canceled_at=NOW() WHERE id=$1",
          [s.id],
        );
      await c.query(
        "UPDATE payments SET status=$2::varchar,paid_at=CASE WHEN $2::varchar='Succeeded' THEN NOW() END,failure_code=CASE WHEN $2::varchar='Failed' THEN 'SANDBOX_DECLINED' END WHERE id=$1",
        [p.id, desired],
      );
      await c.query(
        "INSERT INTO transactions(payment_id,subscription_id,external_event_id,type,amount,currency,status) VALUES($1,$2,$3,'Charge',$4,$5,$6)",
        [p.id, s.id, input.eventId, p.amount, p.currency, desired],
      );
      return { paymentId: input.paymentId, status: desired, duplicate: false };
    });
  }
}
