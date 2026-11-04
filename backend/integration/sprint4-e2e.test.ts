import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { Pool } from 'pg';
import { createClient } from 'redis';
import request from 'supertest';
import { PostgresAuthStore } from '../src/postgres-store.js';
import { AuthService } from '../src/auth.js';
import { AuditService } from '../src/audit-service.js';
import { BillingService } from '../src/billing-service.js';
import { UsageService } from '../src/usage-service.js';
import { UsageAnalytics } from '../src/usage-analytics.js';
import { ApiKeyService } from '../src/consumer-service.js';
import { GatewayService } from '../src/gateway-service.js';
import { GatewayEntitlement } from '../src/gateway-entitlement.js';
import { RedisMeter } from '../src/redis-meter.js';
import { AdminSupervisionService } from '../src/admin-supervision-service.js';
import { createApp } from '../src/app.js';
import { sealUpstreamSecret, serializedJsonBody, signUpstreamRequest, upstreamRequestTarget, type UpstreamSignatureHeaders } from '../src/upstream-hmac.js';
import type { ProxyInput } from '../src/safe-proxy.js';

const database = process.env.PG_TEST_URL;
const redisUrl = process.env.REDIS_TEST_URL;
if (!database || !redisUrl) throw new Error('Run npm test to provide PostgreSQL and Redis');

const signingKey = 'e2e-upstream-signing-key-at-least-32';
const upstreamSecret = 'e2e-upstream-hmac-secret-at-least-32';

type MockModule = { createSignedServer(secret: string): Server };

async function loadMock(): Promise<MockModule> {
  const href = new URL('../../mock-services/server.mjs', import.meta.url).href;
  return import(href);
}

test('marketplace path runs through sandbox payment, gateway, quota and admin revocation', async () => {
  const mock = await loadMock();
  const upstream = mock.createSignedServer(upstreamSecret);
  const port = await new Promise<number>((resolve) => upstream.listen(0, '127.0.0.1', () => resolve((upstream.address() as AddressInfo).port)));
  const baseUrl = `http://127.0.0.1:${port}`;
  const control = new Pool({ connectionString: database });
  const schema = `e2e_${randomUUID().replaceAll('-', '')}`;
  await control.query(`CREATE SCHEMA ${schema}`);
  const store = new PostgresAuthStore(database!, schema);
  const redis = createClient({ url: redisUrl, socket: { reconnectStrategy: false } });
  redis.on('error', () => {});
  const usage = new UsageService(store.pool);
  try {
    await redis.connect();
    await store.migrate(false, true);
    const auth = new AuthService(store, 'e2e-jwt-secret-at-least-32-bytes');
    const consumer = await auth.register(`consumer-${schema}@example.test`, 'Test-password-12345!', 'Consumer');
    const consumerToken = (await auth.login(`consumer-${schema}@example.test`, 'Test-password-12345!')).accessToken;
    await auth.register(`provider-${schema}@example.test`, 'Test-password-12345!', 'Provider');
    const providerId = (await store.pool.query('SELECT id FROM api_providers ORDER BY id DESC LIMIT 1')).rows[0].id;
    const adminHash = (await store.pool.query("SELECT crypt('Admin-password-12345', gen_salt('bf')) AS h")).rows[0].h;
    const adminId = (await store.pool.query(
      "INSERT INTO users(name,email,password_hash,role_id) VALUES('Admin',$1,$2,(SELECT id FROM roles WHERE name='ADMIN')) RETURNING id",
      [`admin-${schema}@example.test`, adminHash],
    )).rows[0].id;
    const adminToken = (await auth.login(`admin-${schema}@example.test`, 'Admin-password-12345')).accessToken;
    await store.pool.query(
      "INSERT INTO provider_verifications(provider_id,organization_name,contact_email,evidence_urls,status,reviewed_at,reviewed_by) VALUES($1,'Org','p@example.test','[\"https://example.test/proof\"]','Verified',now(),$2)",
      [providerId, adminId],
    );
    const sealed = sealUpstreamSecret(signingKey, upstreamSecret);
    const publish = async (name: string, paths: string[], plan: { name: string; price: number; quota: number; rate: number }) => {
      const api = String((await store.pool.query(
        'INSERT INTO apis(provider_id,name,description,category,base_url) VALUES($1,$2,$3,$4,$5) RETURNING id',
        [providerId, name, 'End to end API', 'Test', baseUrl],
      )).rows[0].id);
      for (const state of ['Submitted', 'Under Review', 'Approved', 'Published']) {
        await store.pool.query('UPDATE apis SET status=$1 WHERE id=$2', [state, api]);
      }
      const version = (await store.pool.query("INSERT INTO api_versions(api_id,version) VALUES($1,'1.0') RETURNING id", [api])).rows[0].id;
      for (const path of paths) {
        await store.pool.query(
          'INSERT INTO api_endpoints(api_id,version_id,method,path,description) VALUES($1,$2,$3,$4,$4)',
          [api, version, 'GET', path],
        );
      }
      const planId = String((await store.pool.query(
        'INSERT INTO api_plans(api_id,name,price_monthly,currency,quota,rate_limit) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',
        [api, plan.name, plan.price, 'VND', plan.quota, plan.rate],
      )).rows[0].id);
      await store.pool.query(
        'INSERT INTO gateway_routes(api_id,upstream_base_url,upstream_secret_enc) VALUES($1,$2,$3)',
        [api, baseUrl, sealed],
      );
      return { api, planId };
    };
    const free = await publish('Free API', ['/v1/free'], { name: 'Free', price: 0, quota: 10, rate: 10 });
    const paid = await publish('Paid API', ['/v1/a', '/v1/b', '/v1/c'], { name: 'Basic', price: 10000, quota: 2, rate: 1 });
    const proxy = {
      async prepare(base: string, registeredPath: string, input: ProxyInput) {
        const path = upstreamRequestTarget(base, registeredPath, input.pathParams ?? {}, input.query ?? {});
        const headers: Record<string, string> = { ...(input.headers ?? {}) };
        const signature: Partial<UpstreamSignatureHeaders> = input.upstreamSignature ?? {};
        Object.assign(headers, signature);
        return {
          url: new URL(path, base),
          method: input.method ?? 'GET',
          headers,
          body: input.body === undefined ? undefined : serializedJsonBody(input.body),
        };
      },
      async execute(target: { url: URL; method: string; headers: Record<string, string>; body?: Buffer }) {
        const response = await fetch(target.url, {
          method: target.method,
          headers: target.headers,
          body: target.body ? new Uint8Array(target.body) : undefined,
        });
        const buffer = Buffer.from(await response.arrayBuffer());
        const headers: Record<string, string> = {};
        response.headers.forEach((value, name) => { headers[name] = value; });
        return { status: response.status, headers, body: buffer.toString('utf8'), bodyEncoding: 'utf8' as const };
      },
    };
    const meter = new RedisMeter(redis, schema);
    const gateway = new GatewayService(
      store.pool, new ApiKeyService(store.pool), proxy,
      new GatewayEntitlement(store.pool, meter, usage), signingKey,
    );
    const audit = new AuditService(store.pool);
    const app = createApp(auth, () => {}, {
      billing: new BillingService(store.pool, 'e2e-sandbox-secret-at-least-32-bytes'),
      usage: new UsageAnalytics(store.pool),
      gateway,
      supervision: new AdminSupervisionService(store.pool, audit, meter),
      audit,
    });
    const bearer = { Authorization: `Bearer ${consumerToken}` };
    const admin = { Authorization: `Bearer ${adminToken}` };
    const unsigned = await fetch(`${baseUrl}/v1/free`);
    assert.equal(unsigned.status, 401);
    const replayHeaders = signUpstreamRequest(upstreamSecret, { method: 'GET', path: '/v1/free', body: Buffer.alloc(0) }).headers;
    assert.equal((await fetch(`${baseUrl}/v1/free`, { headers: replayHeaders })).status, 200);
    assert.equal((await fetch(`${baseUrl}/v1/free`, { headers: replayHeaders })).status, 401);

    const freeSub = await request(app).post('/api/consumer/subscriptions').set(bearer).send({ planId: free.planId });
    assert.equal(freeSub.status, 201);
    assert.equal(freeSub.body.data.status, 'Active');
    const freeKey = await new ApiKeyService(store.pool).create(consumer.id, free.api, 'free');
    const freeCall = await request(app).get(`/api/gateway/${free.api}/v1/free`).set('x-api-key', freeKey.key);
    assert.equal(freeCall.status, 200, freeCall.text);
    assert.equal(freeCall.body.ok, true);

    const paidSub = await request(app).post('/api/consumer/subscriptions').set(bearer).send({ planId: paid.planId });
    assert.equal(paidSub.status, 201);
    assert.equal(paidSub.body.data.status, 'Pending');
    const checkout = await request(app).post(`/api/consumer/subscriptions/${paidSub.body.data.id}/checkout`).set(bearer).send({ idempotencyKey: 'e2e-paid' });
    assert.equal(checkout.status, 201);
    const confirmed = await request(app).post('/api/consumer/subscriptions/confirm').set(bearer).send({
      paymentId: checkout.body.data.paymentId,
      token: checkout.body.data.token,
      outcome: 'success',
      eventId: 'e2e-paid-event',
    });
    assert.equal(confirmed.status, 200);
    const active = await request(app).get(`/api/consumer/subscriptions/${paidSub.body.data.id}`).set(bearer);
    assert.equal(active.body.data.status, 'Active');
    const paidKey = await new ApiKeyService(store.pool).create(consumer.id, paid.api, 'paid');
    const call = (path: string) => request(app).get(`/api/gateway/${paid.api}${path}`).set('x-api-key', paidKey.key);
    assert.equal((await call('/v1/a')).status, 200);
    assert.equal((await call('/v1/a')).status, 429);
    assert.equal((await call('/v1/b')).status, 200);
    assert.equal((await call('/v1/c')).status, 403);
    await usage.flush();
    const summary = await request(app).get('/api/consumer/usage/summary').set(bearer);
    assert.equal(summary.status, 200);
    const subscriptions = summary.body.data.subscriptions as Array<{ id: string; quotaUsed: string }>;
    assert.equal(subscriptions.find((item) => item.id === freeSub.body.data.id)?.quotaUsed, '1');
    assert.equal(subscriptions.find((item) => item.id === paidSub.body.data.id)?.quotaUsed, '2');
    const successes = (summary.body.data.daily as Array<{ successCount: string }>).reduce((sum, day) => sum + Number(day.successCount), 0);
    assert.equal(successes, 3);

    const suspended = await request(app).post(`/api/admin/subscriptions/${paidSub.body.data.id}/suspend`).set(admin).send({ reason: 'e2e suspend' });
    assert.equal(suspended.status, 200);
    assert.equal((await call('/v1/b')).status, 403);
    const revoked = await request(app).post(`/api/admin/api-keys/${paidKey.id}/revoke`).set(admin).send({ reason: 'e2e revoke' });
    assert.equal(revoked.status, 200);
    assert.equal((await call('/v1/b')).status, 401);
    const audits = (await store.pool.query("SELECT action, detail->>'reason' AS reason FROM audit_logs ORDER BY id")).rows;
    assert.deepEqual(audits.map((row) => [row.action, row.reason]), [
      ['admin.subscription.suspend', 'e2e suspend'],
      ['admin.api_key.revoke', 'e2e revoke'],
    ]);
  } finally {
    await usage.close();
    upstream.close();
    if (redis.isOpen) await redis.quit();
    await store.close();
    await control.query(`DROP SCHEMA ${schema} CASCADE`);
    await control.end();
  }
});
