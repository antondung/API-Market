import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { once } from "node:events";
import { Pool } from "pg";
import request from "supertest";
import { createClient } from "redis";
import { PostgresAuthStore } from "../src/postgres-store.js";
import { AuthService } from "../src/auth.js";
import { createApp } from "../src/app.js";
import { SubscriptionAdminService } from "../src/subscription-admin-service.js";
import { OperationsHealth } from "../src/operations-router.js";
import { OperationsWorker } from "../src/operations-worker.js";
import { BillingService } from "../src/billing-service.js";
import { GatewayService } from "../src/gateway-service.js";
import { GatewayEntitlement } from "../src/gateway-entitlement.js";
import { RedisMeter } from "../src/redis-meter.js";
import { UsageService } from "../src/usage-service.js";
import { MarketplaceService } from "../src/marketplace-service.js";
import { signedUpstreamHeaders } from "../src/upstream-signing.js";
import { UsageAnalytics } from "../src/usage-analytics.js";
const shared = "operations-test-shared-secret-at-least-32";
async function fixture() {
  const url = process.env.PG_TEST_URL;
  if (!url) throw Error("Use npm test");
  const schema = `operations_${randomUUID().replaceAll("-", "")}`,
    control = new Pool({ connectionString: url });
  await control.query(`CREATE SCHEMA ${schema}`);
  const store = new PostgresAuthStore(url, schema);
  await store.migrate(true, true);
  const redis = createClient({
    url: process.env.REDIS_TEST_URL,
    socket: { reconnectStrategy: false },
  });
  redis.on("error", () => {});
  await redis.connect();
  const auth = new AuthService(store, "operations-jwt-at-least-32-characters");
  const consumer = await auth.register(
    "consumer@operations.test",
    "Password-operations-123!",
    "Consumer",
  );
  const administrator = await auth.register(
    "admin@operations.test",
    "Password-operations-123!",
    "Consumer",
  );
  await store.pool.query(
    "UPDATE users SET role_id=(SELECT id FROM roles WHERE name='ADMIN') WHERE id=$1",
    [administrator.id],
  );
  const adminToken = (
      await auth.login("admin@operations.test", "Password-operations-123!")
    ).accessToken,
    consumerToken = (
      await auth.login("consumer@operations.test", "Password-operations-123!")
    ).accessToken;
  const provider = await auth.register(
    "provider@operations.test",
    "Password-operations-123!",
    "Provider",
  );
  const providerToken = (
    await auth.login(provider.email, "Password-operations-123!")
  ).accessToken;
  const api = String(
    (await store.pool.query("SELECT id FROM apis WHERE name='Weather Now API'"))
      .rows[0].id,
  );
  for (const state of ["Submitted", "Under Review", "Approved", "Published"])
    await store.pool.query("UPDATE apis SET status=$1 WHERE id=$2", [
      state,
      api,
    ]);
  const plan = String(
    (
      await store.pool.query(
        "SELECT id FROM api_plans WHERE api_id=$1 AND name='Free'",
        [api],
      )
    ).rows[0].id,
  );
  const billing = new BillingService(store.pool, shared),
    usage = new UsageService(store.pool),
    worker = new OperationsWorker(store.pool),
    admin = new SubscriptionAdminService(store.pool);
  let hits = 0;
  const proxy = {
    prepare: async (_base: string, _path: string, input: any) => input,
    execute: async () => {
      hits++;
      return {
        status: 200,
        headers: {},
        body: "ok",
        bodyEncoding: "utf8" as const,
      };
    },
  };
  const gateway = new GatewayService(
    store.pool,
    undefined,
    proxy,
    new GatewayEntitlement(store.pool, new RedisMeter(redis, schema), usage),
  );
  const app = createApp(auth, () => {}, {
    marketplace: new MarketplaceService(store.pool),
    billing,
    usage: undefined,
    gateway,
    operations: { admin, health: new OperationsHealth(store.pool, redis) },
  });
  return {
    store,
    redis,
    auth,
    consumer,
    administrator,
    api,
    plan,
    billing,
    usage,
    worker,
    admin,
    app,
    adminToken,
    consumerToken,
    providerToken,
    gateway,
    hits: () => hits,
    close: async () => {
      await worker.close();
      await usage.close();
      if (redis.isOpen) await redis.quit();
      await store.close();
      await control.query(`DROP SCHEMA ${schema} CASCADE`);
      await control.end();
    },
  };
}
test("Admin subscription/payment ledger enforces JWT/RBAC, strict filters and atomic audit-backed immediate suspend/revoke", async () => {
  const f = await fixture();
  try {
    const auth = { Authorization: `Bearer ${f.adminToken}` },
      user = { Authorization: `Bearer ${f.consumerToken}` };
    await request(f.app).get("/api/admin/subscriptions").expect(401);
    for (const token of [f.consumerToken, f.providerToken])
      await request(f.app)
        .get("/api/admin/subscriptions")
        .set("Authorization", `Bearer ${token}`)
        .expect(403);
    await request(f.app)
      .get("/api/admin/subscriptions?apiId=99999999999999999")
      .set(auth)
      .expect(400);
    const sub = await f.billing.subscribe(f.consumer.id, f.plan);
    const created = await request(f.app)
      .post("/api/consumer/api-keys")
      .set(user)
      .send({ apiId: f.api, label: "Admin test" })
      .expect(201);
    const keyId = created.body.data.id,
      plain = created.body.data.key;
    assert.ok(plain);
    await request(f.app)
      .get(`/api/gateway/${f.api}/v1/weather`)
      .set("x-api-key", plain)
      .expect(200);
    const rows = (
      await request(f.app)
        .get("/api/admin/subscriptions?status=Active")
        .set(auth)
        .expect(200)
    ).body.data.items;
    assert.equal(rows.length, 1);
    assert.equal(rows[0].consumerId, f.consumer.id);
    const keys = (
      await request(f.app)
        .get(`/api/admin/subscriptions/${sub.id}/keys`)
        .set(auth)
        .expect(200)
    ).body.data;
    assert.equal(keys.length, 1);
    assert.equal(JSON.stringify(keys).includes(plain), false);
    assert.equal(JSON.stringify(keys).includes("key_hash"), false);
    await request(f.app)
      .post(`/api/admin/subscriptions/${sub.id}/suspend`)
      .set(user)
      .send({ reason: "no" })
      .expect(403);
    await request(f.app)
      .post(`/api/admin/subscriptions/${sub.id}/suspend`)
      .set(auth)
      .send({ reason: "" })
      .expect(400);
    await request(f.app)
      .post(`/api/admin/subscriptions/${sub.id}/suspend`)
      .set(auth)
      .send({ reason: "Test suspension" })
      .expect(200);
    await request(f.app)
      .get(`/api/gateway/${f.api}/v1/weather`)
      .set("x-api-key", plain)
      .expect(403);
    const quotaBefore = (
      await f.store.pool.query(
        "SELECT quota_used FROM subscriptions WHERE id=$1",
        [sub.id],
      )
    ).rows[0].quota_used;
    await request(f.app)
      .post(`/api/admin/subscriptions/${sub.id}/restore`)
      .set(user)
      .send({ reason: "no" })
      .expect(403);
    await request(f.app)
      .post(`/api/admin/subscriptions/${sub.id}/restore`)
      .set(auth)
      .send({})
      .expect(400);
    const restored = await request(f.app)
      .post(`/api/admin/subscriptions/${sub.id}/restore`)
      .set(auth)
      .send({ reason: "Review cleared" })
      .expect(200);
    assert.equal(restored.body.data.status, "Active");
    assert.equal(restored.body.data.quotaUsed, String(quotaBefore));
    assert.equal(
      (
        await f.store.pool.query(
          "SELECT quota_used,status FROM subscriptions WHERE id=$1",
          [sub.id],
        )
      ).rows[0].quota_used,
      quotaBefore,
    );
    await request(f.app)
      .get(`/api/gateway/${f.api}/v1/weather`)
      .set("x-api-key", plain)
      .expect(200);
    await request(f.app)
      .post(`/api/admin/subscriptions/${sub.id}/restore`)
      .set(auth)
      .send({ reason: "again" })
      .expect(409);
    await request(f.app)
      .post(`/api/admin/api-keys/${keyId}/revoke`)
      .set(auth)
      .send({ reason: "Test revocation" })
      .expect(200);
    await request(f.app)
      .get(`/api/gateway/${f.api}/v1/weather`)
      .set("x-api-key", plain)
      .expect(401);
    await request(f.app)
      .post(`/api/admin/api-keys/${keyId}/revoke`)
      .set(auth)
      .send({ reason: "retry" })
      .expect(200);
    const audits = (
      await f.store.pool.query(
        "SELECT action,detail FROM audit_logs WHERE action IN ('SUBSCRIPTION_SUSPENDED','SUBSCRIPTION_RESTORED','API_KEY_REVOKED') ORDER BY id",
      )
    ).rows;
    assert.deepEqual(
      audits.map((row) => row.action),
      ["SUBSCRIPTION_SUSPENDED", "SUBSCRIPTION_RESTORED", "API_KEY_REVOKED"],
    );
    assert.equal(audits[1].detail.reason, "Review cleared");
    assert.equal(f.hits(), 2);
    const spec = (await request(f.app).get("/openapi.json")).body;
    assert.ok(spec.paths["/api/admin/subscriptions/{id}/restore"]);
    await (await import("@apidevtools/swagger-parser")).default.validate(spec);
  } finally {
    await f.close();
  }
});
test("Worker expires elapsed periods, resets valid quota only once, serializes replicas and exposes real health", async () => {
  const f = await fixture();
  try {
    const sub = await f.billing.subscribe(f.consumer.id, f.plan);
    await f.store.pool.query(
      "UPDATE subscriptions SET current_period_start=NOW()-INTERVAL '31 days',current_period_end=NOW()-INTERVAL '1 second',expires_at=NULL WHERE id=$1",
      [sub.id],
    );
    const result = await f.worker.runOnce();
    assert.equal(result.expired_count, 1);
    assert.equal(
      (await f.billing.get(f.consumer.id, sub.id)).status,
      "Expired",
    );
    const renewal = await f.billing.subscribe(f.consumer.id, f.plan);
    await f.store.pool.query(
      "UPDATE subscriptions SET current_period_start=NOW()-INTERVAL '31 days',current_period_end=NOW()+INTERVAL '3 months',expires_at=NOW()+INTERVAL '3 months',quota_reset_at=NOW()-INTERVAL '1 second',quota_used=9 WHERE id=$1",
      [renewal.id],
    );
    assert.equal((await f.worker.runOnce()).reset_count, 1);
    assert.equal((await f.worker.runOnce()).reset_count, 0);
    const lock = await f.store.pool.connect();
    try {
      await lock.query("BEGIN");
      await lock.query("SELECT pg_advisory_xact_lock(913005)");
      assert.equal((await f.worker.runOnce()).skipped, true);
    } finally {
      await lock.query("ROLLBACK");
      lock.release();
    }
    const live = (
      await request(f.app)
        .get("/api/admin/operations")
        .set("Authorization", `Bearer ${f.adminToken}`)
        .expect(200)
    ).body.data;
    assert.equal(live.postgres, "online");
    assert.equal(live.redis, "online");
    assert.equal(live.worker.status, "online");
    await f.redis.quit();
    const down = await new OperationsHealth(f.store.pool, f.redis).snapshot();
    assert.equal(down.gateway, "degraded");
  } finally {
    await f.close();
  }
});

test("Marketplace → Paid subscribe → sandbox settlement → key → signed HTTP upstream → durable usage", async () => {
  const f = await fixture();
  let upstream: any;
  try {
    const { startService } = await import(
      pathToFileURL(resolve("mock-services/server.mjs")).href
    );
    const origin = "https://weather.example";
    upstream = startService("weather", 0, { secret: shared, origin });
    await once(upstream, "listening");
    const local = `http://127.0.0.1:${upstream.address().port}`;
    assert.equal((await fetch(`${local}/v1/weather?city=Hanoi`)).status, 401);
    const proxy = {
      prepare: async (_base: string, path: string, input: any) => {
        const url = new URL(path, origin);
        for (const [key, value] of Object.entries(input.query ?? {}))
          url.searchParams.set(key, String(value));
        return url;
      },
      execute: async (url: URL) => {
        const response = await fetch(local + url.pathname + url.search, {
          headers: signedUpstreamHeaders(shared, "GET", url),
        });
        return {
          status: response.status,
          headers: { "content-type": "application/json" },
          body: await response.text(),
          bodyEncoding: "utf8" as const,
        };
      },
    };
    const gateway = new GatewayService(
      f.store.pool,
      undefined,
      proxy,
      new GatewayEntitlement(
        f.store.pool,
        new RedisMeter(f.redis, `e2e:${randomUUID()}`),
        f.usage,
      ),
    );
    const app = createApp(f.auth, () => {}, {
      marketplace: new MarketplaceService(f.store.pool),
      billing: f.billing,
      usage: new UsageAnalytics(f.store.pool),
      gateway,
      operations: {
        admin: f.admin,
        health: new OperationsHealth(f.store.pool, f.redis),
      },
    });
    const header = { Authorization: `Bearer ${f.consumerToken}` };
    await request(app).get("/api/marketplace/apis").expect(200);
    const detail = (
      await request(app).get(`/api/marketplace/apis/${f.api}`).expect(200)
    ).body.data;
    const paid = detail.plans.find((p: any) => p.priceMonthly > 0);
    assert.ok(paid);
    const sub = (
      await request(app)
        .post("/api/consumer/subscriptions")
        .set(header)
        .send({ planId: paid.id })
        .expect(201)
    ).body.data;
    const checkout = (
      await request(app)
        .post(`/api/consumer/subscriptions/${sub.id}/checkout`)
        .set(header)
        .send({ idempotencyKey: "e2e-checkout" })
        .expect(201)
    ).body.data;
    const confirmation = {
      paymentId: checkout.paymentId,
      token: checkout.token,
      outcome: "success",
      eventId: "e2e-success",
    };
    await request(app)
      .post("/api/consumer/subscriptions/confirm")
      .set(header)
      .send(confirmation)
      .expect(200);
    await request(app)
      .post("/api/consumer/subscriptions/confirm")
      .set(header)
      .send(confirmation)
      .expect(200);
    const created = (
      await request(app)
        .post("/api/consumer/api-keys")
        .set(header)
        .send({ apiId: f.api, label: "Signed E2E" })
        .expect(201)
    ).body.data;
    const response = await request(app)
      .get(`/api/gateway/${f.api}/v1/weather?city=Hanoi`)
      .set("x-api-key", created.key)
      .set("x-gateway-signature", "forged-client-value")
      .expect(200);
    assert.equal(response.body.city, "Hanoi");
    await f.store.pool.query(
      "UPDATE subscriptions SET quota_limit=2, rate_limit_per_minute=1 WHERE id=$1",
      [sub.id],
    );
    await request(app)
      .get(`/api/gateway/${f.api}/v1/weather?city=Hanoi`)
      .set("x-api-key", created.key)
      .expect(429);
    await f.store.pool.query(
      "UPDATE subscriptions SET rate_limit_per_minute=10 WHERE id=$1",
      [sub.id],
    );
    const admin = { Authorization: `Bearer ${f.adminToken}` };
    const call = () =>
      request(app)
        .get(`/api/gateway/${f.api}/v1/weather?city=Hanoi`)
        .set("x-api-key", created.key);
    await request(app)
      .post(`/api/admin/subscriptions/${sub.id}/suspend`)
      .set(admin)
      .send({ reason: "E2E suspend" })
      .expect(200);
    await call().expect(403);
    const quotaWhileSuspended = (
      await f.store.pool.query(
        "SELECT quota_used FROM subscriptions WHERE id=$1",
        [sub.id],
      )
    ).rows[0].quota_used;
    const restored = await request(app)
      .post(`/api/admin/subscriptions/${sub.id}/restore`)
      .set(admin)
      .send({ reason: "E2E restore" })
      .expect(200);
    assert.equal(restored.body.data.status, "Active");
    assert.equal(restored.body.data.quotaUsed, String(quotaWhileSuspended));
    await call().expect(200);
    await call().expect(403);
    await request(app)
      .post(`/api/admin/api-keys/${created.id}/revoke`)
      .set(admin)
      .send({ reason: "E2E revoke" })
      .expect(200);
    await call().expect(401);
    assert.deepEqual(
      (
        await f.store.pool.query(
          "SELECT action FROM audit_logs WHERE action IN ('SUBSCRIPTION_SUSPENDED','SUBSCRIPTION_RESTORED','API_KEY_REVOKED') ORDER BY id",
        )
      ).rows.map((row) => row.action),
      ["SUBSCRIPTION_SUSPENDED", "SUBSCRIPTION_RESTORED", "API_KEY_REVOKED"],
    );
    await f.usage.flush();
    assert.equal(
      (await f.store.pool.query("SELECT count(*) FROM usage_logs")).rows[0]
        .count,
      "2",
    );
    const summary = (
      await request(app)
        .get("/api/consumer/usage/summary")
        .set(header)
        .expect(200)
    ).body.data;
    assert.equal(
      summary.subscriptions.find((item: { id: string }) => item.id === sub.id)
        .quotaUsed,
      "2",
    );
    assert.equal(
      summary.daily.reduce(
        (sum: number, day: { successCount: string }) =>
          sum + Number(day.successCount),
        0,
      ),
      2,
    );
    assert.equal(
      (await f.store.pool.query("SELECT count(*) FROM transactions")).rows[0]
        .count,
      "1",
    );
    const payments = await f.admin.payments({
      page: 1,
      pageSize: 20,
      paymentStatus: "Succeeded",
    });
    assert.equal(payments.total, 1);
    assert.equal(JSON.stringify(payments).includes(checkout.token), false);
    assert.equal(
      JSON.stringify(
        (await f.store.pool.query("SELECT * FROM usage_logs")).rows,
      ).includes(created.key),
      false,
    );
  } finally {
    if (upstream) await new Promise<void>((r) => upstream.close(() => r()));
    await f.close();
  }
});

test("Admin audit failure rolls back enforcement; worker failure rolls back maintenance and records retry health", async () => {
  const f = await fixture();
  try {
    const sub = await f.billing.subscribe(f.consumer.id, f.plan);
    await f.store.pool.query(
      "CREATE FUNCTION fail_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fixture failure'; END; $$; CREATE TRIGGER fail_audit BEFORE INSERT ON audit_logs FOR EACH ROW EXECUTE FUNCTION fail_audit()",
    );
    await assert.rejects(
      f.admin.action(f.administrator.id, "suspend", sub.id, "Test rollback"),
    );
    assert.equal((await f.billing.get(f.consumer.id, sub.id)).status, "Active");
    await f.store.pool.query("DROP TRIGGER fail_audit ON audit_logs");
    await f.store.pool.query(
      "UPDATE subscriptions SET current_period_start=NOW()-INTERVAL '31 days',current_period_end=NOW()-INTERVAL '1 second' WHERE id=$1",
      [sub.id],
    );
    await f.store.pool.query(
      "CREATE OR REPLACE FUNCTION refresh_usage_aggregates(p_from DATE,p_to DATE) RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fixture failure'; END; $$",
    );
    await assert.rejects(f.worker.runOnce());
    assert.equal((await f.billing.get(f.consumer.id, sub.id)).status, "Active");
    assert.ok(
      (await f.store.pool.query("SELECT last_error_at FROM backend_job_runs"))
        .rows[0].last_error_at,
    );
  } finally {
    await f.close();
  }
});
