import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { createClient } from "redis";
import request from "supertest";
import { PostgresAuthStore } from "../src/postgres-store.js";
import { AuthService } from "../src/auth.js";
import { createApp } from "../src/app.js";
import { ApiKeyService } from "../src/consumer-service.js";
import { GatewayService } from "../src/gateway-service.js";
import { GatewayEntitlement } from "../src/gateway-entitlement.js";
import { RedisMeter } from "../src/redis-meter.js";
import { UsageService } from "../src/usage-service.js";
import { BillingService } from "../src/billing-service.js";
async function fixture(rate = 100) {
  const schema = `metered_${randomUUID().replaceAll("-", "")}`,
    control = new Pool({ connectionString: process.env.PG_TEST_URL });
  await control.query(`CREATE SCHEMA ${schema}`);
  const store = new PostgresAuthStore(process.env.PG_TEST_URL!, schema);
  await store.migrate(true, true);
  const redis = createClient({
    url: process.env.REDIS_TEST_URL,
    socket: { reconnectStrategy: false },
  });
  redis.on("error", () => {});
  await redis.connect();
  const auth = new AuthService(store, "metered-test-jwt-secret-at-least-32");
  const user = await auth.register(
    "metered@test.test",
    "Metered-password-12345!",
    "Consumer",
  );
  const api = String(
    (
      await store.pool.query(
        "SELECT id FROM apis WHERE status='Published' LIMIT 1",
      )
    ).rows[0].id,
  );
  const plan = String(
    (
      await store.pool.query(
        "UPDATE api_plans SET quota=5,rate_limit=$2 WHERE api_id=$1 AND name='Free' RETURNING id",
        [api, rate],
      )
    ).rows[0].id,
  );
  const billing = new BillingService(
      store.pool,
      "metered-sandbox-secret-at-least-32",
    ),
    usage = new UsageService(store.pool),
    keys = new ApiKeyService(store.pool),
    key = (await keys.create(user.id, api)).key;
  let hits = 0;
  const proxy = {
    prepare: async () => ({}),
    execute: async () => {
      hits++;
      return {
        status: 200,
        headers: { "content-type": "application/json" },
        body: '{"ok":true}',
        bodyEncoding: "utf8" as const,
      };
    },
  };
  const admission = new GatewayEntitlement(
    store.pool,
    new RedisMeter(redis, schema),
    usage,
  );
  const gateway = new GatewayService(store.pool, keys, proxy, admission);
  const endpoint = (
    await store.pool.query(
      "SELECT path FROM api_endpoints WHERE api_id=$1 AND method='GET' LIMIT 1",
      [api],
    )
  ).rows[0];
  const path = endpoint.path.replace(/\{[^}]+\}/g, "test");
  const app = createApp(auth, () => {}, { gateway });
  const call = () =>
    request(app)
      .get(`/api/gateway/${api}${path}`)
      .set("x-api-key", key)
      .set("Authorization", "secret-authorization")
      .set("cookie", "secret-cookie");
  return {
    store,
    redis,
    billing,
    usage,
    user,
    api,
    plan,
    call,
    hits: () => hits,
    close: async () => {
      await usage.close();
      if (redis.isOpen) await redis.quit();
      await store.close();
      await control.query(`DROP SCHEMA ${schema} CASCADE`);
      await control.end();
    },
  };
}
test("Gateway requires subscription, serializes last quota request, persists redacted usage and denies Redis outage", async () => {
  const f = await fixture();
  try {
    await f.call().expect(403);
    assert.equal(f.hits(), 0);
    const sub = await f.billing.subscribe(f.user.id, f.plan);
    await f.store.pool.query(
      "UPDATE subscriptions SET quota_used=4 WHERE id=$1",
      [sub.id],
    );
    const results = await Promise.all(
      Array.from({ length: 5 }, () => f.call()),
    );
    assert.equal(results.filter((r) => r.status === 200).length, 1);
    assert.equal(results.filter((r) => r.status === 403).length, 4);
    assert.equal(f.hits(), 1);
    await f.usage.flush();
    const logs = (await f.store.pool.query("SELECT * FROM usage_logs")).rows;
    assert.equal(logs.length, 1);
    assert.equal(JSON.stringify(logs).includes("secret-"), false);
    assert.equal(
      (
        await f.store.pool.query(
          "SELECT quota_used FROM subscriptions WHERE id=$1",
          [sub.id],
        )
      ).rows[0].quota_used,
      "5",
    );
    await f.redis.quit();
    await f.call().expect(503);
    assert.equal(f.hits(), 1);
  } finally {
    await f.close();
  }
});
test("Gateway rate limit does not consume quota and canceled/expired subscription blocks immediately", async () => {
  const f = await fixture(1);
  try {
    const sub = await f.billing.subscribe(f.user.id, f.plan);
    await f.call().expect(200);
    await f.call().expect(429);
    assert.equal(
      (
        await f.store.pool.query(
          "SELECT quota_used FROM subscriptions WHERE id=$1",
          [sub.id],
        )
      ).rows[0].quota_used,
      "1",
    );
    await f.billing.cancel(f.user.id, sub.id, true);
    await f.call().expect(403);
    assert.equal(f.hits(), 1);
  } finally {
    await f.close();
  }
});

test("Gateway rejects elapsed subscription periods even before an expiry worker runs", async () => {
  const f = await fixture();
  try {
    const sub = await f.billing.subscribe(f.user.id, f.plan);
    await f.store.pool.query(
      "UPDATE subscriptions SET current_period_start=NOW()-INTERVAL '31 days',current_period_end=NOW()-INTERVAL '1 day' WHERE id=$1",
      [sub.id],
    );
    await f.call().expect(403);
    assert.equal(f.hits(), 0);
    assert.equal(
      (
        await f.store.pool.query(
          "SELECT quota_used FROM subscriptions WHERE id=$1",
          [sub.id],
        )
      ).rows[0].quota_used,
      "0",
    );
  } finally {
    await f.close();
  }
});
