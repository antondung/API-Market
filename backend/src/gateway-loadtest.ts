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
  throw Error("Use npm run loadtest:gateway for disposable services");

const control = new Pool({ connectionString: process.env.PG_TEST_URL });
const schema = `loadtest_${randomUUID().replaceAll("-", "")}`;
await control.query(`CREATE SCHEMA ${schema}`);
const store = new PostgresAuthStore(process.env.PG_TEST_URL, schema);
const redis = createClient({ url: process.env.REDIS_TEST_URL });
redis.on("error", () => {});
const usage = new UsageService(store.pool);

try {
  await store.migrate(true, true);
  await redis.connect();
  const auth = new AuthService(
    store,
    "loadtest-secret-at-least-32-characters",
  );
  const user = await auth.register(
    "loadtest@test.test",
    "Loadtest-password-12345!",
    "Consumer",
  );
  const api = String(
    (
      await store.pool.query(
        "SELECT id FROM apis WHERE status='Published' LIMIT 1",
      )
    ).rows[0].id,
  );
  const path = String(
    (
      await store.pool.query(
        "SELECT path FROM api_endpoints WHERE api_id=$1 AND method='GET' ORDER BY id LIMIT 1",
        [api],
      )
    ).rows[0].path,
  ).replace(/\{[^}]+\}/g, "Hanoi");
  const plan = String(
    (
      await store.pool.query(
        "UPDATE api_plans SET quota=500000,rate_limit=500000 WHERE api_id=$1 AND name='Free' RETURNING id",
        [api],
      )
    ).rows[0].id,
  );
  await new BillingService(
    store.pool,
    "loadtest-sandbox-at-least-32-characters",
  ).subscribe(user.id, plan);
  const keys = new ApiKeyService(store.pool);
  const key = (await keys.create(user.id, api, "loadtest")).key;
  const gateway = new GatewayService(
    store.pool,
    keys,
    {
      async prepare(baseUrl, registeredPath) {
        return {
          url: new URL(baseUrl + registeredPath),
          method: "GET",
          headers: {},
        };
      },
      async execute() {
        await new Promise((r) => setTimeout(r, 2));
        return {
          status: 200,
          headers: { "content-type": "application/json" },
          body: '{"ok":true}',
          bodyEncoding: "utf8" as const,
        };
      },
    },
    new GatewayEntitlement(
      store.pool,
      new RedisMeter(redis, schema),
      usage,
    ),
  );

  for (let i = 0; i < 20; i++) {
    await gateway.forward(key, api, {
      method: "GET",
      path,
      query: {},
      headers: {},
    });
  }

  const concurrencyLevels = [1, 10, 25];
  const requestsPerLevel = 200;
  const stages = [];

  for (const concurrency of concurrencyLevels) {
    const latencies: number[] = [];
    let errors = 0;
    const wallStart = performance.now();
    let cursor = 0;

    const worker = async () => {
      while (true) {
        const idx = cursor++;
        if (idx >= requestsPerLevel) break;
        try {
          const res = await gateway.forward(key, api, {
            method: "GET",
            path,
            query: {},
            headers: {},
          });
          if (res.status !== 200) errors++;
          const hdr = Number(res.headers["x-gateway-overhead-ms"] ?? "0");
          latencies.push(Number.isFinite(hdr) ? hdr : 0);
        } catch {
          errors++;
        }
      }
    };

    await Promise.all(Array.from({ length: concurrency }, () => worker()));
    const wallMs = performance.now() - wallStart;
    const samples = (
      await store.pool.query(
        "SELECT gateway_overhead_ms FROM usage_outbox WHERE gateway_overhead_ms IS NOT NULL ORDER BY occurred_at DESC LIMIT $1",
        [requestsPerLevel],
      )
    ).rows
      .map((r) => Number(r.gateway_overhead_ms))
      .sort((a, b) => a - b);
    const p50 = samples[Math.floor(samples.length * 0.5)] ?? 0;
    const p95 = samples[Math.floor(samples.length * 0.95)] ?? 0;
    const p99 = samples[Math.floor(samples.length * 0.99)] ?? 0;
    const rps = Number(((requestsPerLevel / wallMs) * 1000).toFixed(1));
    stages.push({
      concurrency,
      requests: requestsPerLevel,
      errors,
      rps,
      overheadP50Ms: p50,
      overheadP95Ms: p95,
      overheadP99Ms: p99,
      slaP95Under30Ms: p95 < 30,
    });
  }

  while ((await usage.flush()) > 0) {}
  const totalLogged = Number(
    (await store.pool.query("SELECT COUNT(*) FROM usage_logs")).rows[0].count,
  );
  const expectedTotal = 20 + concurrencyLevels.length * requestsPerLevel;
  if (totalLogged !== expectedTotal) {
    throw Error(
      `Durable usage log mismatch: expected ${expectedTotal}, got ${totalLogged}`,
    );
  }
  for (const s of stages) {
    if (s.errors > 0 || (s.concurrency === 1 && !s.slaP95Under30Ms)) {
      throw Error(
        `Load test SLA failed at concurrency=${s.concurrency}: errors=${s.errors}, p95=${s.overheadP95Ms}ms`,
      );
    }
  }

  console.log(
    JSON.stringify({
      suite: "Sprint 5 Gateway Concurrent Load Test (EN-12)",
      stages,
      durableUsageRows: totalLogged,
      status: "PASS",
    }),
  );
} finally {
  await usage.close();
  if (redis.isOpen) await redis.quit();
  await store.close();
  await control.query(`DROP SCHEMA ${schema} CASCADE`);
  await control.end();
}
