import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { createClient } from 'redis';
import request from 'supertest';
import { PostgresAuthStore } from '../src/postgres-store.js';
import { AuthService } from '../src/auth.js';
import { AuditService } from '../src/audit-service.js';
import { BillingService } from '../src/billing-service.js';
import { ApiKeyService } from '../src/consumer-service.js';
import { GatewayService } from '../src/gateway-service.js';
import { GatewayEntitlement } from '../src/gateway-entitlement.js';
import { RedisMeter } from '../src/redis-meter.js';
import { UsageService } from '../src/usage-service.js';
import { AdminSupervisionService } from '../src/admin-supervision-service.js';
import { createApp } from '../src/app.js';

const database = process.env.PG_TEST_URL;
const redisUrl = process.env.REDIS_TEST_URL;
if (!database || !redisUrl) throw new Error('Run npm test to provide PostgreSQL and Redis');

const signingKey = 'admin-supervision-signing-key-32b-min';

async function fixture() {
  const control = new Pool({ connectionString: database });
  const schema = `admin_sup_${randomUUID().replaceAll('-', '')}`;
  await control.query(`CREATE SCHEMA ${schema}`);
  const store = new PostgresAuthStore(database!, schema);
  const redis = createClient({ url: redisUrl, socket: { reconnectStrategy: false } });
  redis.on('error', () => {});
  await redis.connect();
  const close = async () => {
    if (redis.isOpen) await redis.quit();
    await store.close();
    await control.query(`DROP SCHEMA ${schema} CASCADE`);
    await control.end();
  };
  try {
    await store.migrate(false, true);
    const auth = new AuthService(store, 'admin-supervision-jwt-secret-32b');
    const consumer = await auth.register(`consumer-${schema}@example.test`, 'Test-password-12345!', 'Consumer');
    await auth.register(`provider-${schema}@example.test`, 'Test-password-12345!', 'Provider');
    const consumerToken = (await auth.login(`consumer-${schema}@example.test`, 'Test-password-12345!')).accessToken;
    const providerId = (await store.pool.query("SELECT p.id FROM api_providers p JOIN users u ON u.id=p.user_id WHERE u.email=$1", [`provider-${schema}@example.test`])).rows[0].id;
    const adminHash = (await store.pool.query("SELECT crypt('Admin-password-12345', gen_salt('bf')) AS h")).rows[0].h;
    const adminEmail = `admin-${schema}@example.test`;
    const adminId = (await store.pool.query(
      "INSERT INTO users(name,email,password_hash,role_id) VALUES('Admin',$1,$2,(SELECT id FROM roles WHERE name='ADMIN')) RETURNING id",
      [adminEmail, adminHash],
    )).rows[0].id;
    const adminToken = (await auth.login(adminEmail, 'Admin-password-12345')).accessToken;
    await store.pool.query(
      "INSERT INTO provider_verifications(provider_id,organization_name,contact_email,evidence_urls,status,reviewed_at,reviewed_by) VALUES($1,'Org','p@example.test','[\"https://example.test/proof\"]','Verified',now(),$2)",
      [providerId, adminId],
    );
    const api = String((await store.pool.query(
      "INSERT INTO apis(provider_id,name,description,category,base_url) VALUES($1,'Admin API','Supervision','Test','https://example.test') RETURNING id",
      [providerId],
    )).rows[0].id);
    for (const state of ['Submitted', 'Under Review', 'Approved', 'Published']) {
      await store.pool.query('UPDATE apis SET status=$1 WHERE id=$2', [state, api]);
    }
    const version = (await store.pool.query("INSERT INTO api_versions(api_id,version) VALUES($1,'1.0') RETURNING id", [api])).rows[0].id;
    await store.pool.query("INSERT INTO api_endpoints(api_id,version_id,method,path,description) VALUES($1,$2,'GET','/status','Status')", [api, version]);
    const freePlan = String((await store.pool.query(
      "INSERT INTO api_plans(api_id,name,price_monthly,currency,quota,rate_limit) VALUES($1,'Free',0,'VND',20,30) RETURNING id",
      [api],
    )).rows[0].id);
    const paidApi = String((await store.pool.query(
      "INSERT INTO apis(provider_id,name,description,category,base_url) VALUES($1,'Paid API','Supervision','Test','https://example.test') RETURNING id",
      [providerId],
    )).rows[0].id);
    for (const state of ['Submitted', 'Under Review', 'Approved', 'Published']) {
      await store.pool.query('UPDATE apis SET status=$1 WHERE id=$2', [state, paidApi]);
    }
    const paidVersion = (await store.pool.query("INSERT INTO api_versions(api_id,version) VALUES($1,'1.0') RETURNING id", [paidApi])).rows[0].id;
    await store.pool.query("INSERT INTO api_endpoints(api_id,version_id,method,path,description) VALUES($1,$2,'GET','/paid','Paid')", [paidApi, paidVersion]);
    const paidPlan = String((await store.pool.query(
      "INSERT INTO api_plans(api_id,name,price_monthly,currency,quota,rate_limit) VALUES($1,'Basic',15000,'VND',10,10) RETURNING id",
      [paidApi],
    )).rows[0].id);
    const audit = new AuditService(store.pool);
    const billing = new BillingService(store.pool, 'admin-supervision-sandbox-secret-32');
    const usage = new UsageService(store.pool);
    const meter = new RedisMeter(redis, schema);
    const keys = new ApiKeyService(store.pool);
    let hits = 0;
    const gateway = new GatewayService(store.pool, keys, {
      prepare: async () => ({}),
      execute: async () => {
        hits += 1;
        return { status: 200, headers: { 'content-type': 'application/json' }, body: '{"ok":true}', bodyEncoding: 'utf8' as const };
      },
    }, new GatewayEntitlement(store.pool, meter, usage), signingKey);
    const supervision = new AdminSupervisionService(store.pool, audit, meter);
    const app = createApp(auth, () => {}, { billing, gateway, supervision, audit });
    return {
      app, store, redis, meter, billing, keys, usage, api, paidApi, freePlan, paidPlan, consumer, consumerToken, adminId: String(adminId), adminToken,
      hits: () => hits, close,
    };
  } catch (error) {
    await close();
    throw error;
  }
}

const authz = (token: string) => ({ Authorization: `Bearer ${token}` });

test('admin lists subscriptions and sandbox payments, and non-admins are rejected', async () => {
  const f = await fixture();
  try {
    const sub = await request(f.app).post('/api/consumer/subscriptions').set(authz(f.consumerToken)).send({ planId: f.freePlan });
    assert.equal(sub.status, 201);
    assert.equal(sub.body.data.status, 'Active');
    const outsider = await request(f.app).get('/api/admin/subscriptions');
    assert.equal(outsider.status, 401);
    const forbidden = await request(f.app).get('/api/admin/subscriptions').set(authz(f.consumerToken));
    assert.equal(forbidden.status, 403);
    const listed = await request(f.app).get('/api/admin/subscriptions').set(authz(f.adminToken));
    assert.equal(listed.status, 200);
    assert.equal(listed.body.data.total, 1);
    assert.equal(listed.body.data.items[0].consumer.id, f.consumer.id);
    assert.equal(listed.body.data.items[0].api.id, f.api);
    assert.equal(listed.body.data.items[0].plan.name, 'Free');
    assert.equal(listed.body.data.items[0].quotaUsed, '0');
    assert.equal(listed.body.data.items[0].quotaLimit, '20');
    assert.equal(listed.body.data.items[0].status, 'Active');
    const filtered = await request(f.app).get('/api/admin/subscriptions')
      .query({ status: 'Cancelled', consumerId: f.consumer.id, apiId: f.api, from: '2020-01-01T00:00:00.000Z', to: '2035-01-01T00:00:00.000Z' })
      .set(authz(f.adminToken));
    assert.equal(filtered.status, 200);
    assert.equal(filtered.body.data.total, 0);
    const active = await request(f.app).get('/api/admin/subscriptions').query({ status: 'Active', consumerId: f.consumer.id }).set(authz(f.adminToken));
    assert.equal(active.body.data.total, 1);
    const future = await request(f.app).get('/api/admin/subscriptions').query({ from: '2036-01-01T00:00:00.000Z' }).set(authz(f.adminToken));
    assert.equal(future.body.data.total, 0);

    const pendingSub = await request(f.app).post('/api/consumer/subscriptions').set(authz(f.consumerToken)).send({ planId: f.paidPlan });
    assert.equal(pendingSub.status, 201);
    const checkout = await request(f.app).post(`/api/consumer/subscriptions/${pendingSub.body.data.id}/checkout`)
      .set(authz(f.consumerToken)).send({ idempotencyKey: 'admin-pay-1' });
    assert.equal(checkout.status, 201);
    const pendingPay = await request(f.app).get('/api/admin/sandbox-payments').query({ status: 'Pending' }).set(authz(f.adminToken));
    assert.equal(pendingPay.status, 200);
    assert.equal(pendingPay.body.data.sandbox, true);
    assert.equal(pendingPay.body.data.label, 'sandbox');
    assert.equal(pendingPay.body.data.items[0].sandbox, true);
    assert.equal(pendingPay.body.data.items[0].label, 'sandbox');
    assert.equal(pendingPay.body.data.items[0].provider, 'SANDBOX');
    assert.equal(JSON.stringify(pendingPay.body).includes('token'), false);
    await f.store.pool.query("UPDATE payments SET status='Failed', failure_code='CHECKOUT_EXPIRED', paid_at=NULL WHERE id=$1", [checkout.body.data.paymentId]);
    const expiredPay = await request(f.app).get('/api/admin/sandbox-payments').query({ status: 'Expired' }).set(authz(f.adminToken));
    assert.equal(expiredPay.body.data.total, 1);
    assert.equal(expiredPay.body.data.items[0].status, 'Expired');
    const again = await request(f.app).post(`/api/consumer/subscriptions/${pendingSub.body.data.id}/checkout`)
      .set(authz(f.consumerToken)).send({ idempotencyKey: 'admin-pay-2' });
    assert.equal(again.status, 201);
    const confirmed = await request(f.app).post('/api/consumer/subscriptions/confirm').set(authz(f.consumerToken)).send({
      paymentId: again.body.data.paymentId, token: again.body.data.token, outcome: 'success', eventId: 'admin-event-1',
    });
    assert.equal(confirmed.status, 200);
    const succeeded = await request(f.app).get('/api/admin/sandbox-payments').query({ status: 'Succeeded' }).set(authz(f.adminToken));
    assert.equal(succeeded.body.data.items.some((item: { id: string }) => item.id === again.body.data.paymentId), true);
    await f.store.pool.query(
      `INSERT INTO payments(subscription_id,idempotency_key,amount,currency,status,failure_code)
       VALUES($1,'failed-admin',15000,'VND','Failed','SANDBOX_DECLINED')`,
      [pendingSub.body.data.id],
    );
    const failed = await request(f.app).get('/api/admin/sandbox-payments').query({ status: 'Failed' }).set(authz(f.adminToken));
    assert.equal(failed.body.data.items.some((item: { failureCode: string }) => item.failureCode === 'SANDBOX_DECLINED'), true);
  } finally { await f.close(); }
});

test('revoke and suspend take effect on the next Gateway call, keep quota, and write the audit reason', async () => {
  const f = await fixture();
  try {
    const sub = await f.billing.subscribe(f.consumer.id, f.freePlan);
    const created = await f.keys.create(f.consumer.id, f.api, 'phone');
    const call = () => request(f.app).get(`/api/gateway/${f.api}/status`).set('x-api-key', created.key);
    assert.equal((await call()).status, 200);
    const missing = await request(f.app).post(`/api/admin/subscriptions/${sub.id}/suspend`).set(authz(f.adminToken)).send({});
    assert.equal(missing.status, 400);
    assert.equal((await f.store.pool.query('SELECT status FROM subscriptions WHERE id=$1', [sub.id])).rows[0].status, 'Active');
    const consumerSuspend = await request(f.app).post(`/api/admin/subscriptions/${sub.id}/suspend`).set(authz(f.consumerToken)).send({ reason: 'no' });
    assert.equal(consumerSuspend.status, 403);
    const period = new Date((await f.store.pool.query('SELECT quota_reset_at FROM subscriptions WHERE id=$1', [sub.id])).rows[0].quota_reset_at).toISOString();
    const quotaKey = f.meter.quotaKey(sub.id, period);
    await f.redis.set(quotaKey, '4');
    const suspended = await request(f.app).post(`/api/admin/subscriptions/${sub.id}/suspend`).set(authz(f.adminToken)).send({ reason: 'chargeback review' });
    assert.equal(suspended.status, 200);
    assert.equal(suspended.body.data.status, 'Suspended');
    assert.equal(suspended.body.data.quotaUsed, '1');
    assert.equal(await f.redis.get(quotaKey), null);
    assert.equal((await call()).status, 403);
    assert.equal(f.hits(), 1);
    const restored = await request(f.app).post(`/api/admin/subscriptions/${sub.id}/restore`).set(authz(f.adminToken)).send({ reason: 'review cleared' });
    assert.equal(restored.status, 200);
    assert.equal(restored.body.data.status, 'Active');
    assert.equal(restored.body.data.quotaUsed, '1');
    assert.equal(restored.body.data.quotaPreserved, true);
    assert.equal((await call()).status, 200);
    const revoked = await request(f.app).post(`/api/admin/api-keys/${created.id}/revoke`).set(authz(f.adminToken)).send({ reason: 'lost device' });
    assert.equal(revoked.status, 200);
    assert.equal(revoked.body.data.irreversible, true);
    assert.equal((await call()).status, 401);
    const second = await request(f.app).post(`/api/admin/api-keys/${created.id}/revoke`).set(authz(f.adminToken)).send({ reason: 'again' });
    assert.equal(second.status, 409);
    const audits = (await f.store.pool.query("SELECT action,target_type,target_id,actor_id,detail FROM audit_logs ORDER BY id")).rows;
    assert.deepEqual(audits.map((row) => row.action), ['admin.subscription.suspend', 'admin.subscription.restore', 'admin.api_key.revoke']);
    assert.equal(audits[0].detail.reason, 'chargeback review');
    assert.equal(audits[2].detail.reason, 'lost device');
    assert.equal(String(audits[2].actor_id), f.adminId);
    assert.equal(audits[2].target_type, 'api_key');
    assert.equal(String(audits[2].target_id), created.id);
    assert.equal(JSON.stringify(audits).includes(created.key), false);
    const spec = await request(f.app).get('/openapi.json');
    for (const path of ['/api/admin/subscriptions', '/api/admin/sandbox-payments', '/api/admin/api-keys/{id}/revoke', '/api/admin/subscriptions/{id}/suspend', '/api/admin/subscriptions/{id}/restore']) {
      assert.ok(spec.body.paths[path], path);
    }
  } finally { await f.close(); }
});
