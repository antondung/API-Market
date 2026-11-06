import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { createClient } from "redis";
import { PostgresAuthStore } from "./postgres-store.js";
import { AuthService } from "./auth.js";
import { ApiKeyService } from "./consumer-service.js";
import { BillingService } from "./billing-service.js";
import { RedisMeter } from "./redis-meter.js";
import { UsageService } from "./usage-service.js";
import { GatewayEntitlement } from "./gateway-entitlement.js";
import { GatewayService } from "./gateway-service.js";
if (!process.env.PG_TEST_URL || !process.env.REDIS_TEST_URL)
  throw Error("Use npm run benchmark:gateway for disposable services");
const control = new Pool({ connectionString: process.env.PG_TEST_URL }),
  schema = `benchmark_${randomUUID().replaceAll("-", "")}`;
await control.query(`CREATE SCHEMA ${schema}`);
const store = new PostgresAuthStore(process.env.PG_TEST_URL, schema),
  redis = createClient({ url: process.env.REDIS_TEST_URL });
redis.on("error", () => {});
const usage = new UsageService(store.pool);
try {
  await store.migrate(true, true);
  await redis.connect();
  const auth = new AuthService(
      store,
      "benchmark-secret-at-least-32-characters",
    ),
    user = await auth.register(
      "benchmark@test.test",
      "Benchmark-password-12345!",
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
        "UPDATE api_plans SET quota=100000,rate_limit=100000 WHERE api_id=$1 AND name='Free' RETURNING id",
        [api],
      )
    ).rows[0].id,
  );
  await new BillingService(
    store.pool,
    "benchmark-sandbox-at-least-32-characters",
  ).subscribe(user.id, plan);
  const keys = new ApiKeyService(store.pool),
    key = (await keys.create(user.id, api)).key;
  const path = (
    await store.pool.query(
      "SELECT path FROM api_endpoints WHERE api_id=$1 AND method='GET' LIMIT 1",
      [api],
    )
  ).rows[0].path.replace(/\{[^}]+\}/g, "test");
  let upstreamMs = 0;
  const measured: number[] = [];
  const proxy = {
    prepare: async () => ({}),
    execute: async () => {
      const begin = performance.now();
      await new Promise((r) => setTimeout(r, 2));
      upstreamMs = performance.now() - begin;
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
    keys,
    proxy,
    new GatewayEntitlement(store.pool, new RedisMeter(redis, schema), usage),
  );
  const count = 100;
  for (let i = 0; i < count + 10; i++) {
    const begin = performance.now();
    await gateway.forward(key, api, {
      method: "GET",
      path,
      query: {},
      headers: {},
    });
    if (i >= 10) measured.push(performance.now() - begin - upstreamMs);
  }
  measured.sort((a, b) => a - b);
  const samples = (
    await store.pool.query(
      "SELECT gateway_overhead_ms FROM usage_outbox ORDER BY occurred_at DESC LIMIT $1",
      [count],
    )
  ).rows
    .map((r) => r.gateway_overhead_ms as number)
    .sort((a, b) => a - b);
  await usage.flush();
  console.log(
    JSON.stringify({
      benchmark:
        "Gateway application path, real PostgreSQL + Redis, upstream fixture 2ms; no DNS/TLS/network upstream measured",
      samples: count,
      warmup: 10,
      concurrency: 1,
      storedP50Ms: samples[Math.ceil(count * 0.5) - 1],
      storedP95Ms: samples[Math.ceil(count * 0.95) - 1],
      applicationP50Ms: Number(
        measured[Math.ceil(count * 0.5) - 1]!.toFixed(2),
      ),
      applicationP95Ms: Number(
        measured[Math.ceil(count * 0.95) - 1]!.toFixed(2),
      ),
      maxMs: Number(measured.at(-1)!.toFixed(2)),
      durableUsageRows: Number(
        (await store.pool.query("SELECT COUNT(*) FROM usage_logs")).rows[0]
          .count,
      ),
      scope:
        "Application overhead includes completion persistence. Stored log overhead stops before the instrumentation write. Not staging/load SLA.",
    }),
  );
} finally {
  await usage.close();
  if (redis.isOpen) await redis.quit();
  await store.close();
  await control.query(`DROP SCHEMA ${schema} CASCADE`);
  await control.end();
}
