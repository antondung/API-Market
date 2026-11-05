import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import request from "supertest";
import { createClient } from "redis";
import { PostgresAuthStore } from "../src/postgres-store.js";
import { AuthService } from "../src/auth.js";
import { createApp } from "../src/app.js";
import { BillingService } from "../src/billing-service.js";
import { UsageAnalytics } from "../src/usage-analytics.js";
import { UsageService } from "../src/usage-service.js";
import { MarketplaceService } from "../src/marketplace-service.js";
import { SandboxService, ApiKeyService } from "../src/consumer-service.js";
import { PlaygroundService } from "../src/playground-service.js";
import { RoutingRegistry } from "../src/routing-registry.js";
import { GatewayService } from "../src/gateway-service.js";
import { GatewayEntitlement } from "../src/gateway-entitlement.js";
import { RedisMeter } from "../src/redis-meter.js";
import { ReportService } from "../src/report-service.js";
async function fixture() {
  if (!process.env.PG_TEST_URL) throw Error("Use npm test");
  const schema = `provider_buy_${randomUUID().replaceAll("-", "")}`,
    control = new Pool({ connectionString: process.env.PG_TEST_URL });
  await control.query(`CREATE SCHEMA ${schema}`);
  const store = new PostgresAuthStore(process.env.PG_TEST_URL, schema);
  const redis = createClient({
    url: process.env.REDIS_TEST_URL,
    socket: { reconnectStrategy: false },
  });
  redis.on("error", () => {});
  const usage = new UsageService(store.pool);
  const close = async () => {
    await usage.close();
    if (redis.isOpen) await redis.quit();
    await store.close();
    await control.query(`DROP SCHEMA ${schema} CASCADE`);
    await control.end();
  };
  try {
    await store.migrate(true, true);
    await redis.connect();
    const auth = new AuthService(store, "provider-buyer-jwt-at-least-32-bytes");
    const identities: Awaited<ReturnType<AuthService["login"]>>[] = [];
    for (const [i, role] of ["Provider", "Provider", "Consumer"].entries()) {
      const email = `buyer-${i}@provider.test`;
      await auth.register(
        email,
        "Buyer-password-12345!",
        role as "Provider" | "Consumer",
      );
      identities.push(await auth.login(email, "Buyer-password-12345!"));
    }
    const promoted = identities[2]!;
    await store.pool.query(
      "UPDATE users SET role_id=(SELECT id FROM roles WHERE name='ADMIN') WHERE id=$1",
      [promoted.user.id],
    );
    identities[2] = await auth.login(
      "buyer-2@provider.test",
      "Buyer-password-12345!",
    );
    const api = String(
      (
        await store.pool.query(
          "SELECT id FROM apis WHERE name='Weather Now API'",
        )
      ).rows[0].id,
    );
    for (const status of ["Submitted", "Under Review", "Approved", "Published"])
      await store.pool.query("UPDATE apis SET status=$1 WHERE id=$2", [
        status,
        api,
      ]);
    await store.pool.query(
      "UPDATE api_plans SET rate_limit=100 WHERE api_id=$1",
      [api],
    );
    const plans = (
      await store.pool.query(
        "SELECT id::text,name FROM api_plans WHERE api_id=$1",
        [api],
      )
    ).rows;
    const plan = (name: string) =>
      plans.find((p) => p.name === name)!.id as string;
    const endpoint = String(
      (
        await store.pool.query(
          "SELECT id FROM api_endpoints WHERE api_id=$1 AND method='GET' LIMIT 1",
          [api],
        )
      ).rows[0].id,
    );
    const proxy = {
      prepare: async () => ({}),
      execute: async () => ({
        status: 200,
        headers: { "content-type": "application/json" },
        body: '{"ok":true}',
        bodyEncoding: "utf8" as const,
        latencyMs: 1,
      }),
    };
    const billing = new BillingService(
      store.pool,
      "provider-buyer-sandbox-at-least-32-bytes",
    );
    const app = createApp(auth, () => {}, {
      billing,
      usage: new UsageAnalytics(store.pool),
      marketplace: new MarketplaceService(store.pool),
      playground: new PlaygroundService(
        store.pool,
        new SandboxService(store.pool),
        new RoutingRegistry(store.pool),
        proxy as any,
      ),
      gateway: new GatewayService(
        store.pool,
        undefined,
        proxy,
        new GatewayEntitlement(
          store.pool,
          new RedisMeter(redis, schema),
          usage,
        ),
      ),
      reports: new ReportService(store.pool),
    });
    const header = (index: number) => ({
      Authorization: `Bearer ${identities[index]!.accessToken}`,
    });
    return {
      store,
      usage,
      app,
      header,
      identities,
      api,
      plan,
      endpoint,
      close,
    };
  } catch (e) {
    await close();
    throw e;
  }
}
test("Provider buys a Free subscription, manages own keys and uses metered Gateway without crossing account ownership", async () => {
  const f = await fixture();
  try {
    const own = f.header(0),
      other = f.header(1);
    const sub = (
      await request(f.app)
        .post("/api/consumer/subscriptions")
        .set(own)
        .send({ planId: f.plan("Free") })
        .expect(201)
    ).body.data;
    assert.equal(sub.consumerId, f.identities[0]!.user.id);
    await request(f.app)
      .get(`/api/consumer/subscriptions/${sub.id}`)
      .set(other)
      .expect(404);
    assert.equal(
      (
        await request(f.app)
          .get("/api/consumer/subscriptions")
          .set(other)
          .expect(200)
      ).body.data.total,
      0,
    );
    const first = (
      await request(f.app)
        .post("/api/consumer/api-keys")
        .set(own)
        .send({ apiId: f.api })
        .expect(201)
    ).body.data;
    await request(f.app)
      .post(`/api/consumer/api-keys/${first.id}/rotate`)
      .set(other)
      .send({})
      .expect(404);
    await request(f.app)
      .delete(`/api/consumer/api-keys/${first.id}`)
      .set(other)
      .expect(404);
    await request(f.app)
      .get(`/api/gateway/${f.api}/v1/weather`)
      .set("x-api-key", first.key)
      .expect(200);
    const rotated = (
      await request(f.app)
        .post(`/api/consumer/api-keys/${first.id}/rotate`)
        .set(own)
        .send({})
        .expect(201)
    ).body.data;
    await request(f.app)
      .get(`/api/gateway/${f.api}/v1/weather`)
      .set("x-api-key", first.key)
      .expect(401);
    await request(f.app)
      .get(`/api/gateway/${f.api}/v1/weather`)
      .set("x-api-key", rotated.key)
      .expect(200);
    await f.usage.flush();
    const summary = (
      await request(f.app)
        .get("/api/consumer/usage/summary")
        .set(own)
        .expect(200)
    ).body.data;
    assert.equal(summary.subscriptions[0].quotaUsed, "2");
    assert.equal(
      (
        await request(f.app)
          .get("/api/consumer/usage/history")
          .set(own)
          .expect(200)
      ).body.data.total,
      2,
    );
    assert.equal(
      (
        await request(f.app)
          .get("/api/consumer/usage/history")
          .set(other)
          .expect(200)
      ).body.data.total,
      0,
    );
    await request(f.app)
      .delete(`/api/consumer/api-keys/${rotated.id}`)
      .set(own)
      .expect(204);
    await request(f.app)
      .get(`/api/gateway/${f.api}/v1/weather`)
      .set("x-api-key", rotated.key)
      .expect(401);
    const scheduled = (
      await request(f.app)
        .post(`/api/consumer/subscriptions/${sub.id}/cancel`)
        .set(own)
        .send({})
        .expect(200)
    ).body.data;
    assert.equal(scheduled.cancelAtPeriodEnd, true);
    const canceled = (
      await request(f.app)
        .post(`/api/consumer/subscriptions/${sub.id}/cancel`)
        .set(own)
        .send({ immediate: true })
        .expect(200)
    ).body.data;
    assert.equal(canceled.status, "Canceled");
  } finally {
    await f.close();
  }
});
test("Provider Paid checkout/confirm/change plan preserves ownership and quota; disabled Provider is rejected", async () => {
  const f = await fixture();
  try {
    const own = f.header(0),
      other = f.header(1);
    const sub = (
      await request(f.app)
        .post("/api/consumer/subscriptions")
        .set(own)
        .send({ planId: f.plan("Basic") })
        .expect(201)
    ).body.data;
    const checkout = (
      await request(f.app)
        .post(`/api/consumer/subscriptions/${sub.id}/checkout`)
        .set(own)
        .send({ idempotencyKey: "buyer-checkout" })
        .expect(201)
    ).body.data;
    const confirm = {
      paymentId: checkout.paymentId,
      token: checkout.token,
      outcome: "success",
      eventId: "buyer-success",
    };
    await request(f.app)
      .post("/api/consumer/subscriptions/confirm")
      .set(other)
      .send(confirm)
      .expect(404);
    await request(f.app)
      .post("/api/consumer/subscriptions/confirm")
      .set(own)
      .send(confirm)
      .expect(200);
    await request(f.app)
      .post("/api/consumer/subscriptions/confirm")
      .set(own)
      .send(confirm)
      .expect(200);
    await f.store.pool.query(
      "UPDATE subscriptions SET quota_used=3 WHERE id=$1",
      [sub.id],
    );
    const before = (
      await request(f.app).get(`/api/consumer/subscriptions/${sub.id}`).set(own)
    ).body.data;
    const change = (
      await request(f.app)
        .post(`/api/consumer/subscriptions/${sub.id}/change-plan`)
        .set(own)
        .send({ planId: f.plan("Pro"), idempotencyKey: "buyer-upgrade" })
        .expect(201)
    ).body.data;
    await request(f.app)
      .post("/api/consumer/subscriptions/confirm")
      .set(own)
      .send({
        paymentId: change.paymentId,
        token: change.token,
        outcome: "success",
        eventId: "buyer-upgraded",
      })
      .expect(200);
    const after = (
      await request(f.app)
        .get(`/api/consumer/subscriptions/${sub.id}`)
        .set(own)
        .expect(200)
    ).body.data;
    assert.equal(after.quotaUsed, "3");
    assert.equal(after.currentPeriodEnd, before.currentPeriodEnd);
    await f.store.pool.query("UPDATE users SET is_active=false WHERE id=$1", [
      f.identities[0]!.user.id,
    ]);
    await request(f.app)
      .get("/api/consumer/subscriptions")
      .set(own)
      .expect(401);
  } finally {
    await f.close();
  }
});
test("Provider may use Sandbox, Playground and Reports; Admin remains denied from Consumer APIs and key authentication", async () => {
  const f = await fixture();
  try {
    const own = f.header(0),
      other = f.header(1),
      admin = f.header(2);
    await request(f.app)
      .post(`/api/consumer/apis/${f.api}/sandbox`)
      .set(own)
      .send({})
      .expect(201);
    await request(f.app)
      .get(`/api/consumer/apis/${f.api}/sandbox`)
      .set(other)
      .expect(404);
    await request(f.app)
      .post(`/api/marketplace/apis/${f.api}/playground`)
      .set(own)
      .send({ endpointId: f.endpoint })
      .expect(200);
    assert.equal(
      (
        await request(f.app)
          .get(`/api/consumer/apis/${f.api}/sandbox`)
          .set(own)
          .expect(200)
      ).body.data.remainingRequests,
      4,
    );
    await request(f.app)
      .post(`/api/consumer/reports/${f.api}`)
      .set(own)
      .send({
        category: "Malicious Data",
        description: "A Provider buyer can report an upstream violation",
      })
      .expect(201);
    assert.equal(
      (await request(f.app).get("/api/consumer/reports").set(other).expect(200))
        .body.data.total,
      0,
    );
    for (const path of [
      "/api/consumer/subscriptions",
      "/api/consumer/usage/summary",
      "/api/consumer/usage/history",
      "/api/consumer/api-keys",
      "/api/consumer/reports",
    ])
      await request(f.app).get(path).set(admin).expect(403);
    await request(f.app)
      .post("/api/consumer/subscriptions")
      .set(admin)
      .send({ planId: f.plan("Free") })
      .expect(403);
    await request(f.app)
      .post(`/api/consumer/apis/${f.api}/sandbox`)
      .set(admin)
      .send({})
      .expect(403);
    await request(f.app)
      .post(`/api/marketplace/apis/${f.api}/playground`)
      .set(admin)
      .send({ endpointId: f.endpoint })
      .expect(403);
    await request(f.app).get("/api/admin/users").set(own).expect(403);
    const key = (
      await request(f.app)
        .post("/api/consumer/api-keys")
        .set(own)
        .send({ apiId: f.api })
        .expect(201)
    ).body.data;
    await f.store.pool.query(
      "UPDATE users SET role_id=(SELECT id FROM roles WHERE name='ADMIN') WHERE id=$1",
      [f.identities[0]!.user.id],
    );
    await assert.rejects(
      new ApiKeyService(f.store.pool).authenticate(key.key, f.api),
      { status: 401 },
    );
  } finally {
    await f.close();
  }
});
