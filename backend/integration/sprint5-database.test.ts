import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { PostgresAuthStore } from "../src/postgres-store.js";

const url = process.env.PG_TEST_URL;
if (!url) throw new Error("Run npm test to provide PostgreSQL");

async function fixture(demoSeed: boolean) {
  const control = new Pool({ connectionString: url });
  const schema = `sprint5_${randomUUID().replaceAll("-", "")}`;
  await control.query(`CREATE SCHEMA ${schema}`);
  const store = new PostgresAuthStore(url!, schema);
  try {
    await store.migrate(demoSeed, true);
    return { store, control, schema };
  } catch (error) {
    await store.close();
    await control.query(`DROP SCHEMA ${schema} CASCADE`);
    await control.end();
    throw error;
  }
}

async function close(f: Awaited<ReturnType<typeof fixture>>) {
  await f.store.close();
  await f.control.query(`DROP SCHEMA ${f.schema} CASCADE`);
  await f.control.end();
}

test("Sprint 5 production migration is clean, idempotent and does not seed demo data", async () => {
  const f = await fixture(false);
  try {
    await f.store.migrate(false, true);
    const migrations = await f.store.pool.query(
      "SELECT name FROM backend_schema_migrations WHERE name IN ('015_sprint5_analytics_performance.sql','016_seed_sprint5_demo.sql') ORDER BY name",
    );
    assert.deepEqual(migrations.rows, [
      { name: "015_sprint5_analytics_performance.sql" },
    ]);
    assert.equal(
      (await f.store.pool.query("SELECT count(*) FROM provider_revenue_daily_aggregates")).rows[0].count,
      "0",
    );
  } finally {
    await close(f);
  }
});

test("Sprint 5 demo seed covers subscription, usage and revenue for all three roles", async () => {
  const f = await fixture(true);
  try {
    await f.store.migrate(true, true);
    const roles = await f.store.pool.query(
      "SELECT r.name, count(*)::int n FROM users u JOIN roles r ON r.id=u.role_id GROUP BY r.name ORDER BY r.name",
    );
    assert.deepEqual(roles.rows.map((r) => r.name), ["ADMIN", "API_PROVIDER", "USER"]);

    const demo = (
      await f.store.pool.query(`SELECT
        (SELECT count(*)::int FROM subscriptions s JOIN users u ON u.id=s.consumer_id WHERE u.email_normalized='user@example.com') subscriptions,
        (SELECT count(*)::int FROM usage_logs) usage,
        (SELECT count(*)::int FROM transactions WHERE external_event_id='sprint5-demo-revenue') revenue`)
    ).rows[0];
    assert.equal(demo.subscriptions > 0, true);
    assert.equal(demo.usage, 42);
    assert.equal(demo.revenue, 1);

    const consumerId = (
      await f.store.pool.query("SELECT id FROM users WHERE email_normalized='user@example.com'")
    ).rows[0].id;
    const providerId = (
      await f.store.pool.query("SELECT id FROM users WHERE email_normalized='provider@example.com'")
    ).rows[0].id;
    assert.equal(
      (await f.store.pool.query("SELECT count(*)::int n FROM cost_guard_daily($1,current_date-13,current_date)", [consumerId])).rows[0].n,
      14,
    );
    assert.equal(
      (await f.store.pool.query("SELECT sum(request_count)::int n FROM provider_analytics_daily($1,current_date-13,current_date)", [providerId])).rows[0].n,
      42,
    );
    assert.equal(
      Number((await f.store.pool.query("SELECT sum(amount) amount FROM provider_revenue_daily($1,current_date-13,current_date)", [providerId])).rows[0].amount) > 0,
      true,
    );

    const checks = await f.store.pool.query("SELECT * FROM validate_sprint5_integrity()");
    assert.equal(checks.rows.every((row) => row.violation_count === "0"), true);
  } finally {
    await close(f);
  }
});

test("Sprint 5 hot query indexes are present for load-tested paths", async () => {
  const f = await fixture(false);
  try {
    const indexes = (
      await f.store.pool.query(`SELECT indexname FROM pg_indexes
        WHERE schemaname=current_schema() AND indexname IN
        ('idx_subscriptions_consumer_api_recent','idx_transactions_charge_success_time',
         'idx_usage_logs_consumer_api_time','idx_provider_revenue_provider_date')`)
    ).rows.map((row) => row.indexname).sort();
    assert.deepEqual(indexes, [
      "idx_provider_revenue_provider_date",
      "idx_subscriptions_consumer_api_recent",
      "idx_transactions_charge_success_time",
      "idx_usage_logs_consumer_api_time",
    ]);
  } finally {
    await close(f);
  }
});
