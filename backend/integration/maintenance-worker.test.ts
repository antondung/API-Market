import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { PostgresAuthStore } from '../src/postgres-store.js';
import { MaintenanceWorker } from '../src/maintenance-worker.js';

const url = process.env.PG_TEST_URL;
if (!url) throw new Error('Run npm test to provide PostgreSQL');

async function fixture() {
  const control = new Pool({ connectionString: url });
  const schema = `maint_${randomUUID().replaceAll('-', '')}`;
  await control.query(`CREATE SCHEMA ${schema}`);
  const store = new PostgresAuthStore(url!, schema);
  await store.migrate(false, true);
  const provider = (await store.pool.query(`WITH pu AS (
      INSERT INTO users(name,email,password_hash,role_id)
      VALUES('Provider',$1,'test',(SELECT id FROM roles WHERE name='API_PROVIDER')) RETURNING id
    ), p AS (INSERT INTO api_providers(user_id,provider_name) SELECT id,'Maint Provider' FROM pu RETURNING id)
    SELECT id FROM p`, [`provider-${schema}@example.test`])).rows[0]!.id;
  const consumer = (await store.pool.query(
    `INSERT INTO users(name,email,password_hash,role_id) VALUES('Consumer',$1,'test',(SELECT id FROM roles WHERE name='USER')) RETURNING id`,
    [`consumer-${schema}@example.test`],
  )).rows[0]!.id;
  const admin = (await store.pool.query(
    `INSERT INTO users(name,email,password_hash,role_id) VALUES('Admin',$1,'test',(SELECT id FROM roles WHERE name='ADMIN')) RETURNING id`,
    [`admin-${schema}@example.test`],
  )).rows[0]!.id;
  await store.pool.query(
    `INSERT INTO provider_verifications(provider_id,organization_name,contact_email,evidence_urls,status,reviewed_at,reviewed_by)
     VALUES($1,'Org','p@example.test','["https://example.test/proof"]','Verified',now(),$2)`,
    [provider, admin],
  );
  let n = 0;
  const api = async () => {
    n += 1;
    const row = (await store.pool.query(
      `INSERT INTO apis(provider_id,name,description,category,base_url) VALUES($1,$2,'Maintenance API','Test','https://example.test') RETURNING id`,
      [provider, `API ${n}`],
    )).rows[0]!;
    for (const state of ['Submitted', 'Under Review', 'Approved', 'Published']) {
      await store.pool.query('UPDATE apis SET status=$1 WHERE id=$2', [state, row.id]);
    }
    const plan = (await store.pool.query(
      `INSERT INTO api_plans(api_id,name,price_monthly,quota,rate_limit) VALUES($1,'Basic',10000,10,10) RETURNING id`,
      [row.id],
    )).rows[0]!;
    return { apiId: row.id, planId: plan.id };
  };
  return {
    store, control, schema, consumer,
    api,
    close: async () => {
      await store.close();
      await control.query(`DROP SCHEMA ${schema} CASCADE`);
      await control.end();
    },
  };
}

async function subscribe(pool: Pool, input: {
  consumer: number; plan: number; api: number; price: number; quotaReset: Date; periodStart: Date; periodEnd: Date; expires: Date; used?: number;
}) {
  return (await pool.query(
    `INSERT INTO subscriptions(consumer_id,plan_id,api_id,status,current_period_start,current_period_end,quota_reset_at,expires_at,quota_used,quota_limit,rate_limit_per_minute,price_amount,price_currency)
     VALUES($1,$2,$3,'Active',$4,$5,$6,$7,$8,10,10,$9,'VND') RETURNING id`,
    [input.consumer, input.plan, input.api, input.periodStart, input.periodEnd, input.quotaReset, input.expires, input.used ?? 0, input.price],
  )).rows[0]!.id as number;
}

test('paid subscriptions expire without renewal and free quota rolls 30 days from the anchor', async () => {
  const f = await fixture();
  try {
    const anchor = new Date('2026-01-01T00:00:00.000Z');
    const later = new Date('2026-06-01T00:00:00.000Z');
    const before = new Date(anchor.getTime() - 30 * 86400000);
    const freeApi = await f.api();
    const expiredApi = await f.api();
    const activeApi = await f.api();
    const freeId = await subscribe(f.store.pool, {
      consumer: f.consumer, plan: freeApi.planId, api: freeApi.apiId, price: 0,
      periodStart: before, periodEnd: anchor, quotaReset: anchor, expires: anchor, used: 4,
    });
    const expiredId = await subscribe(f.store.pool, {
      consumer: f.consumer, plan: expiredApi.planId, api: expiredApi.apiId, price: 10000,
      periodStart: before, periodEnd: anchor, quotaReset: anchor, expires: anchor, used: 2,
    });
    const activeId = await subscribe(f.store.pool, {
      consumer: f.consumer, plan: activeApi.planId, api: activeApi.apiId, price: 10000,
      periodStart: before, periodEnd: later, quotaReset: anchor, expires: later, used: 7,
    });
    const first = (await f.store.pool.query('SELECT * FROM run_subscription_maintenance($1,500)', [anchor])).rows[0]!;
    assert.equal(Number(first.expired_count), 1);
    assert.equal(Number(first.reset_count), 2);
    const free = (await f.store.pool.query('SELECT status,quota_used,quota_reset_at,current_period_end,expires_at FROM subscriptions WHERE id=$1', [freeId])).rows[0]!;
    assert.equal(free.status, 'Active');
    assert.equal(free.quota_used, '0');
    const rolled = new Date(anchor.getTime() + 30 * 86400000);
    assert.equal(new Date(free.quota_reset_at).toISOString(), rolled.toISOString());
    assert.equal(new Date(free.current_period_end).toISOString(), rolled.toISOString());
    assert.equal(new Date(free.expires_at).toISOString(), rolled.toISOString());
    const expired = (await f.store.pool.query('SELECT status,current_period_end,expired_at FROM subscriptions WHERE id=$1', [expiredId])).rows[0]!;
    assert.equal(expired.status, 'Expired');
    assert.equal(new Date(expired.current_period_end).toISOString(), anchor.toISOString());
    assert.ok(expired.expired_at);
    const active = (await f.store.pool.query('SELECT status,quota_used,expires_at,current_period_end,quota_reset_at FROM subscriptions WHERE id=$1', [activeId])).rows[0]!;
    assert.equal(active.status, 'Active');
    assert.equal(active.quota_used, '0');
    assert.equal(new Date(active.expires_at).toISOString(), later.toISOString());
    assert.equal(new Date(active.current_period_end).toISOString(), later.toISOString());
    assert.equal(new Date(active.quota_reset_at).toISOString(), rolled.toISOString());
    const second = (await f.store.pool.query('SELECT * FROM run_subscription_maintenance($1,500)', [anchor])).rows[0]!;
    assert.equal(Number(second.expired_count), 0);
    assert.equal(Number(second.reset_count), 0);
  } finally {
    await f.close();
  }
});

test('worker loops until caught up and a second instance does not double-expire', async () => {
  const f = await fixture();
  try {
    const now = new Date();
    const stale = new Date(now.getTime() - 90 * 86400000);
    const start = new Date(stale.getTime() - 30 * 86400000);
    const freeApi = await f.api();
    const paidApi = await f.api();
    await subscribe(f.store.pool, {
      consumer: f.consumer, plan: freeApi.planId, api: freeApi.apiId, price: 0,
      periodStart: start, periodEnd: stale, quotaReset: stale, expires: stale, used: 9,
    });
    await subscribe(f.store.pool, {
      consumer: f.consumer, plan: paidApi.planId, api: paidApi.apiId, price: 5000,
      periodStart: start, periodEnd: stale, quotaReset: stale, expires: stale, used: 1,
    });
    const worker = new MaintenanceWorker(f.store.pool, 300_000);
    const other = new MaintenanceWorker(f.store.pool, 300_000);
    const [left, right] = await Promise.all([worker.runOnce(), other.runOnce()]);
    const applied = left.expired + right.expired;
    assert.equal(applied, 1);
    assert.equal([left.skipped, right.skipped].filter(Boolean).length, 1);
    const rows = (await f.store.pool.query('SELECT status,price_amount,quota_used,quota_reset_at FROM subscriptions ORDER BY id')).rows;
    assert.equal(rows[0]!.status, 'Active');
    assert.equal(rows[0]!.quota_used, '0');
    assert.ok(new Date(rows[0]!.quota_reset_at).getTime() > now.getTime());
    const steps = Math.round((new Date(rows[0]!.quota_reset_at).getTime() - stale.getTime()) / 86400000);
    assert.equal(steps % 30, 0);
    assert.equal(rows[1]!.status, 'Expired');
    const again = await worker.runOnce();
    assert.equal(again.expired, 0);
    assert.equal(again.reset, 0);
    assert.equal((await f.store.pool.query("SELECT count(*) FROM subscriptions WHERE status='Expired'")).rows[0]!.count, '1');
  } finally {
    await f.close();
  }
});
