import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { Pool } from "pg";
import express from "express";
import request from "supertest";
import { PostgresAuthStore } from "../src/postgres-store.js";
import { BillingService } from "../src/billing-service.js";
import { billingRouter, webhookRouter } from "../src/billing-router.js";
import { AuthService } from "../src/auth.js";
import { createApp } from "../src/app.js";
import { UsageAnalytics } from "../src/usage-analytics.js";

const secret = "sandbox-test-secret-at-least-32-characters";
async function fixture() {
  const database = process.env.PG_TEST_URL;
  if (!database) throw new Error("Use npm test for disposable PostgreSQL");
  const control = new Pool({ connectionString: database });
  const schema = `billing_${randomUUID().replaceAll("-", "")}`;
  await control.query(`CREATE SCHEMA ${schema}`);
  const store = new PostgresAuthStore(database, schema);
  const close = async () => {
    await store.close();
    await control.query(`DROP SCHEMA ${schema} CASCADE`);
    await control.end();
  };
  try {
    await store.migrate(false, true);
    // Until the application migration runner includes 010, apply the owned migration here.
    const exists = await store.pool.query(
      "SELECT 1 FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='subscriptions' AND column_name='quota_limit'",
    );
    if (!exists.rowCount)
      await store.pool.query(
        readFileSync("migrations/010_billing_snapshot.sql", "utf8"),
      );
    const users: string[] = [];
    for (let i = 0; i < 3; i++)
      users.push(
        String(
          (
            await store.pool.query(
              "INSERT INTO users(name,email,password_hash,role_id) VALUES('User',$1,'fixture',(SELECT id FROM roles WHERE name=$2)) RETURNING id",
              [`${i}@billing.test`, i === 2 ? "API_PROVIDER" : "USER"],
            )
          ).rows[0].id,
        ),
      );
    const provider = (
      await store.pool.query(
        "INSERT INTO api_providers(user_id,provider_name) VALUES($1,'Provider') RETURNING id",
        [users[2]],
      )
    ).rows[0].id;
    const api = String(
      (
        await store.pool.query(
          "INSERT INTO apis(provider_id,name,description,category,base_url) VALUES($1,'Weather','Weather','Weather','https://example.com') RETURNING id",
          [provider],
        )
      ).rows[0].id,
    );
    await store.pool.query("ALTER TABLE apis DISABLE TRIGGER USER");
    await store.pool.query(
      "UPDATE apis SET status='Published',published_at=NOW() WHERE id=$1",
      [api],
    );
    await store.pool.query("ALTER TABLE apis ENABLE TRIGGER USER");
    const plans: string[] = [];
    for (const [name, price, quota] of [
      ["Free", "0.00", 10],
      ["Basic", "19.99", 100],
      ["Pro", "39.99", 1000],
    ])
      plans.push(
        String(
          (
            await store.pool.query(
              "INSERT INTO api_plans(api_id,name,price_monthly,currency,quota,rate_limit) VALUES($1,$2,$3,'USD',$4,10) RETURNING id",
              [api, name, price, quota],
            )
          ).rows[0].id,
        ),
      );
    const service = new BillingService(store.pool, secret);
    const app = express();
    app.use(
      "/api/consumer/subscriptions/sandbox-webhook",
      webhookRouter(service),
    );
    app.use(express.json());
    app.use(
      "/api/consumer/subscriptions",
      billingRouter(
        service,
        (req, res, next) => {
          const user = req.get("x-user");
          if (!user) {
            res.sendStatus(401);
            return;
          }
          res.locals.identity = { user: { id: user } };
          next();
        },
        (_req, res, next) => {
          if (res.locals.identity.user.id === users[2]) {
            res.sendStatus(403);
            return;
          }
          next();
        },
      ),
    );
    app.use((error: any, _req: any, res: any, _next: any) =>
      res
        .status(error.status ?? (error.name === "ZodError" ? 400 : 500))
        .json({ error: { code: error.code, message: error.message } }),
    );
    return { store, service, users, plans, api, app, close };
  } catch (e) {
    await close();
    throw e;
  }
}

test("billing free activation, paid snapshot, failed payment and owner isolation", async () => {
  const f = await fixture();
  try {
    const owner = f.users[0]!;
    const sub = await f.service.subscribe(owner, f.plans[1]!);
    assert.equal(sub.status, "Pending");
    assert.equal(sub.priceAmount, "19.99");
    await assert.rejects(() => f.service.get(f.users[1]!, sub.id), {
      status: 404,
    });
    await assert.rejects(() => f.service.subscribe(owner, f.plans[0]!), {
      status: 409,
    });
    await f.store.pool.query(
      "UPDATE api_plans SET price_monthly=999,quota=2 WHERE id=$1",
      [f.plans[1]],
    );
    const checkout = await f.service.checkout(owner, sub.id, "first");
    assert.equal(checkout.amount, "19.99");
    await f.service.confirm(owner, {
      paymentId: checkout.paymentId,
      token: checkout.token,
      outcome: "failure",
      eventId: "failed-first",
    });
    assert.equal((await f.service.get(owner, sub.id)).status, "Canceled");
    const free = await f.service.subscribe(owner, f.plans[0]!);
    assert.equal(free.status, "Active");
  } finally {
    await f.close();
  }
});

test("checkout and settlement are concurrent-safe, shape-bound and preserve consumed quota on plan change", async () => {
  const f = await fixture();
  try {
    const owner = f.users[0]!,
      sub = await f.service.subscribe(owner, f.plans[1]!);
    const [a, b] = await Promise.all([
      f.service.checkout(owner, sub.id, "same"),
      f.service.checkout(owner, sub.id, "same"),
    ]);
    assert.equal(a.paymentId, b.paymentId);
    const confirm = {
      paymentId: a.paymentId,
      token: a.token,
      outcome: "success" as const,
      eventId: "success-first",
    };
    await f.service.confirm(owner, confirm);
    await f.service.confirm(owner, confirm);
    assert.equal(
      (await f.store.pool.query("SELECT COUNT(*) FROM transactions")).rows[0]
        .count,
      "1",
    );
    await assert.rejects(
      () => f.service.confirm(owner, { ...confirm, outcome: "failure" }),
      { status: 409 },
    );
    await assert.rejects(() => f.service.confirm(f.users[1]!, confirm), {
      status: 404,
    });
    await f.store.pool.query(
      "UPDATE subscriptions SET quota_used=9 WHERE id=$1",
      [sub.id],
    );
    const before = await f.service.get(owner, sub.id);
    const change = await f.service.change(
      owner,
      sub.id,
      f.plans[2]!,
      "upgrade",
    );
    assert.equal((await f.service.get(owner, sub.id)).planId, f.plans[1]);
    await assert.rejects(
      () => f.service.change(owner, sub.id, f.plans[0]!, "upgrade"),
      { status: 409 },
    );
    await f.service.confirm(owner, {
      paymentId: change.paymentId,
      token: change.token,
      outcome: "success",
      eventId: "upgrade-success",
    });
    const after = await f.service.get(owner, sub.id);
    assert.equal(after.planId, f.plans[2]);
    assert.equal(after.quotaUsed, "9");
    assert.equal(after.currentPeriodEnd, before.currentPeriodEnd);
    await f.service.cancel(owner, sub.id);
    assert.equal((await f.service.get(owner, sub.id)).status, "Active");
    await f.service.cancel(owner, sub.id, true);
    assert.equal((await f.service.get(owner, sub.id)).status, "Canceled");
  } finally {
    await f.close();
  }
});

test("HTTP billing rejects unauthorized, forged/expired raw webhooks and client amount overrides", async () => {
  const f = await fixture();
  try {
    const path = "/api/consumer/subscriptions";
    await request(f.app).post(path).send({ planId: f.plans[1] }).expect(401);
    await request(f.app)
      .post(path)
      .set("x-user", f.users[2]!)
      .send({ planId: f.plans[1] })
      .expect(403);
    await request(f.app)
      .post(path)
      .set("x-user", f.users[0]!)
      .send({ planId: f.plans[1], amount: 0 })
      .expect(400);
    const sub = (
      await request(f.app)
        .post(path)
        .set("x-user", f.users[0]!)
        .send({ planId: f.plans[1] })
        .expect(201)
    ).body.data;
    const checkout = await f.service.checkout(f.users[0]!, sub.id, "hook");
    const raw = JSON.stringify({
      paymentId: checkout.paymentId,
      outcome: "success",
      eventId: "hook-success",
    });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = createHmac("sha256", secret)
      .update(`${timestamp}.${raw}`)
      .digest("hex");
    await request(f.app)
      .post(`${path}/sandbox-webhook`)
      .set("Content-Type", "application/json")
      .set("x-sandbox-timestamp", timestamp)
      .set("x-sandbox-signature", "0".repeat(64))
      .send(raw)
      .expect(401);
    await request(f.app)
      .post(`${path}/sandbox-webhook`)
      .set("Content-Type", "application/json")
      .set("x-sandbox-timestamp", timestamp)
      .set("x-sandbox-signature", signature)
      .send(raw)
      .expect(200);
    await request(f.app)
      .post(`${path}/sandbox-webhook`)
      .set("Content-Type", "application/json")
      .set("x-sandbox-timestamp", "1")
      .set("x-sandbox-signature", signature)
      .send(raw)
      .expect(401);
    const second = await f.service.change(
      f.users[0]!,
      sub.id,
      f.plans[2]!,
      "expired",
    );
    await f.store.pool.query(
      "UPDATE payments SET checkout_expires_at=NOW()-INTERVAL '1 second' WHERE id=$1",
      [second.paymentId],
    );
    await assert.rejects(
      () =>
        f.service.confirm(f.users[0]!, {
          paymentId: second.paymentId,
          token: second.token,
          outcome: "success",
          eventId: "expired",
        }),
      { status: 409 },
    );
    assert.equal((await f.service.get(f.users[0]!, sub.id)).status, "Active");
  } finally {
    await f.close();
  }
});

test("application wires real JWT billing and usage routes with ownership and valid OpenAPI", async () => {
  const f = await fixture();
  try {
    const auth = new AuthService(f.store, "app-billing-jwt-secret-at-least-32");
    const user = await auth.register(
      "app@billing.test",
      "App-password-12345!",
      "Consumer",
    );
    const tokens = await auth.login("app@billing.test", "App-password-12345!");
    const app = createApp(auth, () => {}, {
      billing: f.service,
      usage: new UsageAnalytics(f.store.pool),
    });
    const header = { Authorization: `Bearer ${tokens.accessToken}` };
    await request(app)
      .post("/api/consumer/subscriptions")
      .send({ planId: f.plans[0] })
      .expect(401);
    const created = (
      await request(app)
        .post("/api/consumer/subscriptions")
        .set(header)
        .send({ planId: f.plans[0] })
        .expect(201)
    ).body.data;
    assert.equal(created.consumerId, user.id);
    assert.equal(created.status, "Active");
    const summary = (
      await request(app)
        .get("/api/consumer/usage/summary")
        .set(header)
        .expect(200)
    ).body.data;
    assert.equal(summary.subscriptions.length, 1);
    await request(app)
      .get("/api/provider/analytics/overview")
      .set(header)
      .expect(403);
    await request(app)
      .get("/api/consumer/usage/history?consumerId=1")
      .set(header)
      .expect(400);
    const spec = (await request(app).get("/openapi.json").expect(200)).body;
    const parser = (await import("@apidevtools/swagger-parser")).default;
    await parser.validate(spec);
    assert.deepEqual(spec.paths["/api/consumer/subscriptions"].post.security, [
      { bearerAuth: [] },
    ]);
  } finally {
    await f.close();
  }
});

test("immediate cancellation cannot reset consumed quota within the same API period", async () => {
  const f = await fixture();
  try {
    const owner = f.users[0]!;
    const sub = await f.service.subscribe(owner, f.plans[0]!);
    await f.store.pool.query(
      "UPDATE subscriptions SET quota_used=10 WHERE id=$1",
      [sub.id],
    );
    await f.service.cancel(owner, sub.id, true);
    for (const plan of f.plans)
      await assert.rejects(() => f.service.subscribe(owner, plan!), {
        status: 409,
        code: "SUBSCRIPTION_PERIOD_LOCKED",
      });
    assert.equal((await f.service.list(owner)).total, 1);
    await f.store.pool.query(
      "UPDATE subscriptions SET current_period_start=NOW()-INTERVAL '31 days',current_period_end=NOW()-INTERVAL '1 day' WHERE id=$1",
      [sub.id],
    );
    const renewal = await f.service.subscribe(owner, f.plans[0]!);
    assert.equal(renewal.quotaUsed, "0");
    assert.equal(renewal.status, "Active");
  } finally {
    await f.close();
  }
});
