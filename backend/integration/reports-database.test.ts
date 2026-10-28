import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { PostgresAuthStore } from '../src/postgres-store.js';

const url = process.env.PG_TEST_URL;
if (!url) throw new Error('Run npm test to provide PostgreSQL');

async function fixture() {
  const control = new Pool({ connectionString: url });
  const schema = `reports_test_${randomUUID().replaceAll('-', '')}`;
  await control.query(`CREATE SCHEMA ${schema}`);
  const store = new PostgresAuthStore(url!, schema);
  try {
    await store.migrate(false, true);
    const ids = (await store.pool.query(`
      WITH admin_user AS (
        INSERT INTO users(name,email,password_hash,role_id)
        VALUES('Admin','reports-admin@example.test','test',(SELECT id FROM roles WHERE name='ADMIN'))
        RETURNING id
      ), consumer_user AS (
        INSERT INTO users(name,email,password_hash,role_id)
        VALUES('Consumer','reports-consumer@example.test','test',(SELECT id FROM roles WHERE name='USER'))
        RETURNING id
      ), provider_user AS (
        INSERT INTO users(name,email,password_hash,role_id)
        VALUES('Provider','reports-provider@example.test','test',(SELECT id FROM roles WHERE name='API_PROVIDER'))
        RETURNING id
      ), provider AS (
        INSERT INTO api_providers(user_id,provider_name)
        SELECT id,'Reports Provider' FROM provider_user RETURNING id
      ), verified AS (
        INSERT INTO provider_verifications(provider_id,organization_name,contact_email,evidence_urls,status,reviewed_at,reviewed_by)
        SELECT provider.id,'Reports Provider','reports-provider@example.test','["https://example.test/license"]','Verified',CURRENT_TIMESTAMP,admin_user.id
        FROM provider,admin_user
      ), api AS (
        INSERT INTO apis(provider_id,name,description,category,base_url)
        SELECT id,'Moderated API','API used by report migration tests','Security','https://api.example.test' FROM provider
        RETURNING id
      )
      SELECT admin_user.id AS admin_id, consumer_user.id AS consumer_id, api.id AS api_id
      FROM admin_user,consumer_user,api
    `)).rows[0]!;
    for (const status of ['Submitted', 'Under Review', 'Approved', 'Published']) {
      await store.pool.query('UPDATE apis SET status=$1 WHERE id=$2', [status, ids.api_id]);
    }
    return { store, control, schema, ...ids };
  } catch (error) {
    await store.close();
    await control.query(`DROP SCHEMA ${schema} CASCADE`);
    await control.end();
    throw error;
  }
}

async function closeFixture(f: Awaited<ReturnType<typeof fixture>>) {
  await f.store.close();
  await f.control.query(`DROP SCHEMA ${f.schema} CASCADE`);
  await f.control.end();
}

test('reports enforce moderation lifecycle and retain the original publication time', async () => {
  const f = await fixture();
  try {
    const report = (await f.store.pool.query(
      `INSERT INTO reports(api_id,reporter_id,category,description)
       VALUES($1,$2,'Security Vulnerability','Reproducible authorization bypass') RETURNING id`,
      [f.api_id, f.consumer_id],
    )).rows[0]!;

    await assert.rejects(
      f.store.pool.query("UPDATE reports SET status='Resolved' WHERE id=$1", [report.id]),
      (error: unknown) => (error as { code?: string }).code === '23514',
    );
    await f.store.pool.query(
      "UPDATE reports SET status='Under Investigation',reviewed_by=$1 WHERE id=$2",
      [f.admin_id, report.id],
    );

    const publishedAt = (await f.store.pool.query('SELECT published_at FROM apis WHERE id=$1', [f.api_id])).rows[0]!.published_at;
    await f.store.pool.query("UPDATE apis SET status='Suspended' WHERE id=$1", [f.api_id]);
    assert.equal((await f.store.pool.query('SELECT status FROM apis WHERE id=$1', [f.api_id])).rows[0]!.status, 'Suspended');
    await assert.rejects(
      f.store.pool.query("UPDATE apis SET status='Draft' WHERE id=$1", [f.api_id]),
      (error: unknown) => (error as { code?: string }).code === '23514',
    );

    await f.store.pool.query(
      "UPDATE reports SET status='Resolved',reviewed_at=CURRENT_TIMESTAMP,action_taken='API suspended pending provider remediation' WHERE id=$1",
      [report.id],
    );
    await f.store.pool.query("UPDATE apis SET status='Published' WHERE id=$1", [f.api_id]);
    const restored = (await f.store.pool.query('SELECT status,published_at FROM apis WHERE id=$1', [f.api_id])).rows[0]!;
    assert.equal(restored.status, 'Published');
    assert.equal(new Date(restored.published_at).getTime(), new Date(publishedAt).getTime());
  } finally {
    await closeFixture(f);
  }
});

test('reports reject unsupported categories and incomplete terminal decisions', async () => {
  const f = await fixture();
  try {
    await assert.rejects(
      f.store.pool.query(
        "INSERT INTO reports(api_id,reporter_id,category,description) VALUES($1,$2,'Other','A sufficiently detailed report')",
        [f.api_id, f.consumer_id],
      ),
      (error: unknown) => (error as { code?: string }).code === '23514',
    );
    await assert.rejects(
      f.store.pool.query(
        "INSERT INTO reports(api_id,reporter_id,category,description,status,reviewed_by,reviewed_at) VALUES($1,$2,'Extreme Downtime','The API has been unavailable for hours','Dismissed',$3,CURRENT_TIMESTAMP)",
        [f.api_id, f.consumer_id, f.admin_id],
      ),
      (error: unknown) => (error as { code?: string }).code === '23514',
    );
  } finally {
    await closeFixture(f);
  }
});
