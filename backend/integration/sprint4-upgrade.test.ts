import test from "node:test";
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { Pool } from "pg";
import { PostgresAuthStore } from "../src/postgres-store.js";

test("Sprint 3 database upgrades through 009-012 without losing accounts, APIs or documentation and is rerunnable", async () => {
  if (!process.env.PG_TEST_URL) throw new Error("Use npm test");
  const control = new Pool({ connectionString: process.env.PG_TEST_URL });
  const schema = `upgrade_${randomUUID().replaceAll("-", "")}`;
  await control.query(`CREATE SCHEMA ${schema}`);
  const store = new PostgresAuthStore(process.env.PG_TEST_URL, schema);
  try {
    await store.pool.query(
      "CREATE TABLE backend_schema_migrations(name TEXT PRIMARY KEY,checksum TEXT NOT NULL,applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    );
    const files = [
      "001_create_auth_schema.sql",
      "002_seed_auth_data.sql",
      "003_create_provider_schema.sql",
      "004_seed_provider_demo_data.sql",
      "005_provider_domain_privacy.sql",
      "006_fix_rejection_reason_null.sql",
      "006_create_marketplace_gateway_schema.sql",
      "007_provider_documentation_state.sql",
      "008_create_reports_moderation.sql",
    ];
    for (const name of files) {
      const source = readFileSync(`migrations/${name}`, "utf8");
      await store.pool.query(source);
      await store.pool.query(
        "INSERT INTO backend_schema_migrations(name,checksum) VALUES($1,$2)",
        [
          name,
          createHash("sha256")
            .update(source.replace(/\r\n/g, "\n"))
            .digest("hex"),
        ],
      );
    }
    const tables = [
      "users",
      "apis",
      "api_versions",
      "api_endpoints",
      "api_documentations",
      "api_keys",
      "refresh_tokens",
      "api_plans",
    ];
    const snapshot = async () =>
      Promise.all(
        tables.map(
          async (table) =>
            (await store.pool.query(`SELECT * FROM ${table} ORDER BY id`)).rows,
        ),
      );
    const before = await snapshot();
    assert.ok(before[0]!.length > 0);
    assert.ok(before[1]!.length > 0);
    assert.ok(before[4]!.length > 0);
    await store.migrate(true, true);
    assert.deepEqual(await snapshot(), before);
    await store.migrate(true, true);
    assert.deepEqual(await snapshot(), before);
    assert.equal(
      (
        await store.pool.query(
          "SELECT count(*) FROM backend_schema_migrations WHERE name IN ('009_create_sprint4_billing_usage.sql','010_billing_snapshot.sql','011_usage_outbox.sql','012_usage_aggregate_fix.sql')",
        )
      ).rows[0].count,
      "4",
    );
    await store.pool.query(
      "SELECT refresh_usage_aggregates(current_date,current_date)",
    );
    await store.pool.query("SELECT quota_limit FROM subscriptions LIMIT 0");
    await store.pool.query("SELECT request_id FROM usage_outbox LIMIT 0");
  } finally {
    await store.close();
    await control.query(`DROP SCHEMA ${schema} CASCADE`);
    await control.end();
  }
});
