import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { PostgresAuthStore } from '../src/postgres-store.js';

const url = process.env.PG_TEST_URL;
if (!url) throw new Error('Run npm test to provide PostgreSQL');

async function fixture() {
  const control = new Pool({ connectionString: url });
  const schema = `sprint4_test_${randomUUID().replaceAll('-', '')}`;
  await control.query(`CREATE SCHEMA ${schema}`);
  const store = new PostgresAuthStore(url!, schema);
  try {
    await store.migrate(false, true);
    const row = (await store.pool.query(`WITH u AS (
      INSERT INTO users(name,email,password_hash,role_id) VALUES
      ('Consumer',$1,'test',(SELECT id FROM roles WHERE name='USER')) RETURNING id
    ), pu AS (INSERT INTO users(name,email,password_hash,role_id) VALUES
      ('Provider',$2,'test',(SELECT id FROM roles WHERE name='API_PROVIDER')) RETURNING id),
    p AS (INSERT INTO api_providers(user_id,provider_name) SELECT id,'Sprint 4 Provider' FROM pu RETURNING id),
    a AS (INSERT INTO apis(provider_id,name,description,category,base_url)
      SELECT id,'Sprint 4 API','Billing test API','Test','https://example.test' FROM p RETURNING id),
    pl AS (INSERT INTO api_plans(api_id,name,price_monthly,quota,rate_limit)
      SELECT id,'Basic',99000,100,10 FROM a RETURNING id,api_id)
    SELECT u.id consumer_id,pl.id plan_id,pl.api_id FROM u,pl`,
    [`consumer-${schema}@example.test`, `provider-${schema}@example.test`])).rows[0]!;
    return { store, control, schema, ...row };
  } catch (e) { await store.close(); await control.query(`DROP SCHEMA ${schema} CASCADE`); await control.end(); throw e; }
}

async function close(f: Awaited<ReturnType<typeof fixture>>) {
  await f.store.close(); await f.control.query(`DROP SCHEMA ${f.schema} CASCADE`); await f.control.end();
}

test('Sprint 4 billing is idempotent and keeps plan/payment relations consistent', async () => {
  const f = await fixture();
  try {
    const sub = (await f.store.pool.query(`INSERT INTO subscriptions
      (consumer_id,plan_id,api_id,status,current_period_start,current_period_end,quota_reset_at)
      VALUES($1,$2,$3,'Active',now(),now()+interval '1 year',now()+interval '1 month') RETURNING id`,
      [f.consumer_id,f.plan_id,f.api_id])).rows[0]!;
    await f.store.pool.query(`INSERT INTO payments(subscription_id,idempotency_key,amount,currency,status,paid_at)
      VALUES($1,'checkout-1',99000,'VND','Succeeded',now())`, [sub.id]);
    await assert.rejects(f.store.pool.query(`INSERT INTO payments(subscription_id,idempotency_key,amount,currency)
      VALUES($1,'checkout-1',99000,'VND')`, [sub.id]), (e: unknown) => (e as {code?: string}).code === '23505');
    await assert.rejects(f.store.pool.query(`INSERT INTO subscriptions
      (consumer_id,plan_id,api_id,status,current_period_start,current_period_end,quota_reset_at)
      VALUES($1,$2,$3+1,'Active',now(),now()+interval '1 month',now()+interval '1 month')`,
      [f.consumer_id,f.plan_id,f.api_id]), (e: unknown) => (e as {code?: string}).code === '23503' || (e as {code?: string}).code === '23514');
  } finally { await close(f); }
});

test('Usage partitions, safe history, aggregates and maintenance reconcile exactly', async () => {
  const f = await fixture();
  try {
    const sub = (await f.store.pool.query(`INSERT INTO subscriptions
      (consumer_id,plan_id,api_id,status,current_period_start,current_period_end,quota_reset_at,quota_used,expires_at)
      VALUES($1,$2,$3,'Active',now()-interval '2 months',now()+interval '1 year',now()-interval '1 day',9,now()+interval '6 months') RETURNING id`,
      [f.consumer_id,f.plan_id,f.api_id])).rows[0]!;
    await f.store.pool.query(`INSERT INTO usage_logs(occurred_at,request_id,subscription_id,consumer_id,api_id,status_code,latency_ms,response_bytes)
      VALUES(now(),$1,$2,$3,$4,200,12,100),(now(),$5,$2,$3,$4,500,18,20)`,
      [randomUUID(),sub.id,f.consumer_id,f.api_id,randomUUID()]);
    await f.store.pool.query('SELECT refresh_usage_aggregates(current_date,current_date)');
    const aggregate = (await f.store.pool.query('SELECT request_count,success_count,error_count FROM usage_daily_aggregates')).rows[0]!;
    assert.deepEqual(aggregate, {request_count:'2',success_count:'1',error_count:'1'});
    const historyColumns = (await f.store.pool.query(`SELECT column_name FROM information_schema.columns
      WHERE table_schema=current_schema() AND table_name='request_history' ORDER BY column_name`)).rows.map((r: {column_name: string}) => r.column_name);
    assert.equal(historyColumns.includes('api_key_id'), false);
    assert.equal(historyColumns.includes('response_bytes'), false);
    const maintenance = (await f.store.pool.query('SELECT * FROM run_subscription_maintenance(now(),500)')).rows[0]!;
    assert.equal(maintenance.reset_count, 1);
    assert.equal((await f.store.pool.query('SELECT quota_used FROM subscriptions WHERE id=$1',[sub.id])).rows[0]!.quota_used, '0');
  } finally { await close(f); }
});
