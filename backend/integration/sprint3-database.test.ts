import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { Pool } from 'pg';
import { PostgresAuthStore } from '../src/postgres-store.js';

const url = process.env.PG_TEST_URL;
if (!url) throw new Error('Run npm test to provide PostgreSQL');

async function fixture() {
  const control = new Pool({ connectionString: url });
  await control.query('CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public');
  const schema = `sprint3_test_${randomUUID().replaceAll('-', '')}`;
  await control.query(`CREATE SCHEMA ${schema}`);
  const store = new PostgresAuthStore(url!, schema);
  try {
    await store.migrate(false, true);
    return { store, async close() {
      await store.close();
      await control.query(`DROP SCHEMA ${schema} CASCADE`);
      await control.end();
    } };
  } catch (error) {
    await store.close();
    await control.query(`DROP SCHEMA ${schema} CASCADE`);
    await control.end();
    throw error;
  }
}

async function seedPublishedApi(store: PostgresAuthStore, suffix: string) {
  const providerUser = (await store.pool.query(
    "INSERT INTO users(name,email,password_hash,role_id) VALUES($1,$2,'test',(SELECT id FROM roles WHERE name='API_PROVIDER')) RETURNING id",
    [`Provider ${suffix}`, `provider-${suffix}@example.test`],
  )).rows[0]!.id as number;
  const consumerId = (await store.pool.query(
    "INSERT INTO users(name,email,password_hash,role_id) VALUES($1,$2,'test',(SELECT id FROM roles WHERE name='USER')) RETURNING id",
    [`Consumer ${suffix}`, `consumer-${suffix}@example.test`],
  )).rows[0]!.id as number;
  const adminId = (await store.pool.query(
    "INSERT INTO users(name,email,password_hash,role_id) VALUES($1,$2,'test',(SELECT id FROM roles WHERE name='ADMIN')) RETURNING id",
    [`Admin ${suffix}`, `admin-${suffix}@example.test`],
  )).rows[0]!.id as number;
  const providerId = (await store.pool.query(
    'INSERT INTO api_providers(user_id,provider_name) VALUES($1,$2) RETURNING id',
    [providerUser, `Provider ${suffix}`],
  )).rows[0]!.id as number;
  await store.pool.query(
    "INSERT INTO provider_verifications(provider_id,organization_name,contact_email,evidence_urls,status,reviewed_at,reviewed_by) VALUES($1,$2,$3,'[\"https://example.test/license\"]','Verified',CURRENT_TIMESTAMP,$4)",
    [providerId, `Provider ${suffix}`, `provider-${suffix}@example.test`, adminId],
  );
  const apiId = (await store.pool.query(
    "INSERT INTO apis(provider_id,name,description,category,base_url,tags) VALUES($1,$2,'Sprint 3 database test API','Benchmark','https://api.example.test','[\"benchmark\",\"search\"]') RETURNING id",
    [providerId, `Sprint 3 API ${suffix}`],
  )).rows[0]!.id as number;
  for (const status of ['Submitted', 'Under Review', 'Approved', 'Published']) {
    await store.pool.query('UPDATE apis SET status=$1 WHERE id=$2', [status, apiId]);
  }
  return { providerId, consumerId, apiId };
}

test('Sprint 3 schema protects gateway routes, sandbox counters and hashed API keys', async () => {
  const f = await fixture();
  try {
    const { consumerId, apiId } = await seedPublishedApi(f.store, 'constraints');

    await f.store.pool.query(
      'INSERT INTO gateway_routes(api_id,upstream_base_url,timeout_ms) VALUES($1,$2,$3)',
      [apiId, 'https://upstream.example.test', 5000],
    );
    await assert.rejects(
      f.store.pool.query('INSERT INTO gateway_routes(api_id,upstream_base_url) VALUES($1,$2)', [apiId, 'https://duplicate.example.test']),
      (error: unknown) => (error as { code?: string }).code === '23505',
    );

    await f.store.pool.query(
      "INSERT INTO sandbox_grants(consumer_id,api_id,max_requests,expires_at) VALUES($1,$2,2,CURRENT_TIMESTAMP + interval '1 hour')",
      [consumerId, apiId],
    );
    const first = await f.store.pool.query('SELECT * FROM consume_sandbox_grant($1,$2)', [consumerId, apiId]);
    const second = await f.store.pool.query('SELECT * FROM consume_sandbox_grant($1,$2)', [consumerId, apiId]);
    assert.equal(first.rows[0]!.remaining_requests, 1);
    assert.equal(second.rows[0]!.remaining_requests, 0);
    await assert.rejects(
      f.store.pool.query('SELECT * FROM consume_sandbox_grant($1,$2)', [consumerId, apiId]),
      (error: unknown) => (error as { code?: string }).code === 'P0001',
    );

    const firstHash = 'a'.repeat(64);
    await f.store.pool.query(
      'INSERT INTO api_keys(user_id,api_id,key_prefix,key_hash,label) VALUES($1,$2,$3,$4,$5)',
      [consumerId, apiId, 'amk_test_001', firstHash, 'Development key'],
    );
    await assert.rejects(
      f.store.pool.query('INSERT INTO api_keys(user_id,api_id,key_prefix,key_hash) VALUES($1,$2,$3,$4)', [consumerId, apiId, 'amk_test_002', 'b'.repeat(64)]),
      (error: unknown) => (error as { code?: string }).code === '23505',
    );
    await f.store.pool.query('UPDATE api_keys SET is_active=FALSE, revoked_at=CURRENT_TIMESTAMP WHERE key_hash=$1', [firstHash]);
    const replacement = await f.store.pool.query(
      'INSERT INTO api_keys(user_id,api_id,key_prefix,key_hash) VALUES($1,$2,$3,$4) RETURNING id',
      [consumerId, apiId, 'amk_test_003', 'c'.repeat(64)],
    );
    const used = await f.store.pool.query('UPDATE api_keys SET last_used_at=CURRENT_TIMESTAMP WHERE id=$1 RETURNING last_used_at', [replacement.rows[0]!.id]);
    assert.ok(used.rows[0]!.last_used_at);

    const indexes = await f.store.pool.query("SELECT indexname FROM pg_indexes WHERE schemaname=current_schema() AND indexname LIKE 'idx_apis_marketplace_%'");
    assert.deepEqual(indexes.rows.map(row => row.indexname).sort(), [
      'idx_apis_marketplace_category_published',
      'idx_apis_marketplace_published_newest',
      'idx_apis_marketplace_search',
      'idx_apis_marketplace_tags',
    ]);
  } finally { await f.close(); }
});

test('Marketplace first page is measured against 1,000 published APIs', async (t) => {
  const f = await fixture();
  try {
    const { providerId } = await seedPublishedApi(f.store, 'benchmark');
    await f.store.pool.query(
      `INSERT INTO apis(provider_id,name,description,category,base_url,tags)
       SELECT $1, 'Benchmark API ' || sequence, 'Searchable Marketplace API ' || sequence,
              'Benchmark', 'https://benchmark.example.test', '["benchmark","search"]'::jsonb
       FROM generate_series(1, 1000) AS series(sequence)`,
      [providerId],
    );
    for (const status of ['Submitted', 'Under Review', 'Approved', 'Published']) {
      await f.store.pool.query("UPDATE apis SET status=$1 WHERE provider_id=$2 AND name LIKE 'Benchmark API %' AND status <> 'Published'", [status, providerId]);
    }

    const beganAt = performance.now();
    const page = await f.store.pool.query(
      `SELECT id, name, category, published_at
       FROM apis
       WHERE status='Published' AND category=$1
       ORDER BY published_at DESC, id DESC
       LIMIT 20`,
      ['Benchmark'],
    );
    const elapsedMs = performance.now() - beganAt;
    assert.equal(page.rows.length, 20);
    assert.ok(page.rows.every(row => row.category === 'Benchmark'));
    t.diagnostic(`Marketplace first-page query over 1,000 published APIs: ${elapsedMs.toFixed(2)} ms`);
  } finally { await f.close(); }
});
