import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { Pool } from "pg";
import { PostgresAuthStore } from "../src/postgres-store.js";
import { UsageService } from "../src/usage-service.js";
import { UsageAnalytics, usageFilters } from "../src/usage-analytics.js";

async function fixture() {
  const control = new Pool({ connectionString: process.env.PG_TEST_URL });
  const schema = `usage_${randomUUID().replaceAll("-", "")}`;
  await control.query(`CREATE SCHEMA ${schema}`);
  const store = new PostgresAuthStore(process.env.PG_TEST_URL!, schema);
  await store.migrate(false, true);
  if (
    !(await store.pool.query("SELECT to_regclass('usage_outbox') name")).rows[0]
      .name
  )
    await store.pool.query(
      readFileSync("migrations/011_usage_outbox.sql", "utf8"),
    );
  const row = (
    await store.pool
      .query(`WITH u AS (INSERT INTO users(name,email,password_hash,role_id) VALUES('Consumer','c@test.test','x',(SELECT id FROM roles WHERE name='USER')) RETURNING id),
    pu AS (INSERT INTO users(name,email,password_hash,role_id) VALUES('Provider','p@test.test','x',(SELECT id FROM roles WHERE name='API_PROVIDER')) RETURNING id),
    p AS (INSERT INTO api_providers(user_id,provider_name) SELECT id,'Provider' FROM pu RETURNING id,user_id),
    a AS (INSERT INTO apis(provider_id,name,description,category,base_url) SELECT id,'API','Test','Test','https://example.test' FROM p RETURNING id),
    pl AS (INSERT INTO api_plans(api_id,name,price_monthly,quota,rate_limit) SELECT id,'Basic',10,100,10 FROM a RETURNING id,api_id),
    v AS (INSERT INTO api_versions(api_id,version) SELECT id,'1' FROM a RETURNING id,api_id),
    e AS (INSERT INTO api_endpoints(api_id,version_id,method,path,description) SELECT api_id,id,'GET','/item/{id}','Endpoint' FROM v RETURNING id),
    k AS (INSERT INTO api_keys(user_id,api_id,key_prefix,key_hash) SELECT u.id,a.id,'test',repeat('a',64) FROM u,a RETURNING id),
    s AS (INSERT INTO subscriptions(consumer_id,plan_id,api_id,status,current_period_start,current_period_end,quota_reset_at,quota_used) SELECT u.id,pl.id,pl.api_id,'Active',now(),now()+interval '30 days',now()+interval '30 days',9 FROM u,pl RETURNING id)
    SELECT u.id::text "consumerId",p.user_id::text "providerUserId",a.id::text "apiId",e.id::text "endpointId",k.id::text "apiKeyId",s.id::text "subscriptionId" FROM u,p,a,e,k,s`)
  ).rows[0];
  const service = new UsageService(store.pool);
  const record = { ...row, requestId: randomUUID(), occurredAt: new Date() };
  return {
    store,
    service,
    record,
    analytics: new UsageAnalytics(store.pool),
    close: async () => {
      await service.close();
      await store.close();
      await control.query(`DROP SCHEMA ${schema} CASCADE`);
      await control.end();
    },
  };
}
const result = {
  statusCode: 200,
  latencyMs: 12,
  upstreamLatencyMs: 10,
  responseBytes: 9,
  gatewayOverheadMs: 2,
};
async function enqueue(
  f: Awaited<ReturnType<typeof fixture>>,
  rollback = false,
) {
  const client = await f.store.pool.connect();
  try {
    await client.query("BEGIN");
    await f.service.enqueue(client, f.record);
    await client.query(rollback ? "ROLLBACK" : "COMMIT");
  } finally {
    client.release();
  }
}

test("durable acceptance rolls back, waits for completion and concurrent writers insert exactly once", async () => {
  const f = await fixture();
  try {
    await enqueue(f, true);
    assert.equal(await f.service.flush(), 0);
    await enqueue(f);
    assert.equal(await f.service.flush(), 0);
    await f.service.complete(f.record.requestId, f.record.occurredAt, result);
    const counts = await Promise.all([
      f.service.flush(),
      new UsageService(f.store.pool).flush(),
    ]);
    assert.equal(
      counts.reduce((a, b) => a + b),
      1,
    );
    assert.equal(
      (await f.store.pool.query("SELECT count(*) FROM usage_logs")).rows[0]
        .count,
      "1",
    );
    await enqueue(f);
    await f.service.complete(f.record.requestId, f.record.occurredAt, result);
    await f.service.flush();
    assert.equal(
      (await f.store.pool.query("SELECT count(*) FROM usage_logs")).rows[0]
        .count,
      "1",
    );
  } finally {
    await f.close();
  }
});

test("failed completion and writer transactions retain reservation; stale attempts recover with redacted 502", async () => {
  const f = await fixture();
  try {
    Object.assign(f.record, {
      headers: { authorization: "secret-auth" },
      body: "secret-body",
      query: "secret-query",
    });
    await enqueue(f);
    await assert.rejects(
      f.service.complete(f.record.requestId, f.record.occurredAt, {
        ...result,
        latencyMs: -1,
      }),
    );
    assert.equal(
      (await f.store.pool.query("SELECT count(*) FROM usage_outbox")).rows[0]
        .count,
      "1",
    );
    await f.store.pool.query(
      "UPDATE usage_outbox SET created_at=now()-interval '2 minutes'",
    );
    await f.store.pool.query(
      `CREATE FUNCTION reject_usage() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'injected write failure'; END $$; CREATE TRIGGER reject_usage BEFORE INSERT ON usage_logs FOR EACH ROW EXECUTE FUNCTION reject_usage()`,
    );
    await assert.rejects(f.service.flush());
    assert.equal(
      (await f.store.pool.query("SELECT count(*) FROM usage_outbox")).rows[0]
        .count,
      "1",
    );
    await f.store.pool.query("DROP TRIGGER reject_usage ON usage_logs");
    assert.equal(await f.service.flush(), 1);
    const log = (await f.store.pool.query("SELECT * FROM usage_logs")).rows[0];
    assert.equal(log.status_code, 502);
    assert.equal(JSON.stringify(log).includes("secret-"), false);
    assert.equal(
      (await f.store.pool.query("SELECT count(*) FROM usage_outbox")).rows[0]
        .count,
      "0",
    );
  } finally {
    await f.close();
  }
});

test("analytics uses durable quota and independent currency revenue with no consumer identity leak", async () => {
  const f = await fixture();
  try {
    await f.store.pool.query(
      `WITH p AS (INSERT INTO payments(subscription_id,idempotency_key,amount,currency,status,paid_at) VALUES($1,'one',10,'USD','Succeeded',now()),($1,'two',20,'VND','Succeeded',now()) RETURNING id,subscription_id,amount,currency)
      INSERT INTO transactions(payment_id,subscription_id,external_event_id,type,amount,currency,status) SELECT id,subscription_id,'event-'||id,'Charge',amount,currency,'Succeeded' FROM p`,
      [f.record.subscriptionId],
    );
    const filters = usageFilters.parse({});
    const summary = await f.analytics.summary(f.record.consumerId, filters);
    assert.equal(summary.subscriptions[0].quotaUsed, "9");
    assert.deepEqual(
      (await f.analytics.summary("2147483647", filters)).subscriptions,
      [],
    );
    const overview = await f.analytics.overview(
      f.record.providerUserId,
      filters,
    );
    assert.equal(overview.requests.requestCount, "0");
    assert.deepEqual(overview.revenue, [
      { currency: "USD", amount: "10.00" },
      { currency: "VND", amount: "20.00" },
    ]);
    assert.equal(JSON.stringify(overview).includes("consumer"), false);
    assert.equal(overview.activeSubscribers, "1");
    await enqueue(f);
    await f.service.complete(f.record.requestId, f.record.occurredAt, result);
    await f.service.flush();
    assert.equal(
      (await f.analytics.history(f.record.consumerId, filters)).items.length,
      1,
    );
    assert.equal(
      (await f.analytics.history("2147483647", filters)).items.length,
      0,
    );
    assert.deepEqual(
      (await f.analytics.overview("2147483647", filters)).revenue,
      [],
    );
    for (const invalid of [
      { page: 10001 },
      { pageSize: 101 },
      { apiId: "2147483648" },
      { from: "2020-01-01", to: "2022-01-01" },
      { status: 600 },
      { from: "bad" },
      { extra: "secret" },
    ])
      assert.equal(usageFilters.safeParse(invalid).success, false);
  } finally {
    await f.close();
  }
});
