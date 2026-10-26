import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { Pool } from 'pg';
import request from 'supertest';
import { PostgresAuthStore } from '../src/postgres-store.js';
import { AuthService } from '../src/auth.js';
import { MarketplaceService } from '../src/marketplace-service.js';
import { createApp } from '../src/app.js';
import { ApiKeyService, SandboxService } from '../src/consumer-service.js';
import { RoutingRegistry } from '../src/routing-registry.js';
import { PlaygroundService } from '../src/playground-service.js';
import { SafeProxy } from '../src/safe-proxy.js';
import { EventEmitter } from 'node:events';
import { Readable } from 'node:stream';
import SwaggerParser from '@apidevtools/swagger-parser';

const database = process.env.PG_TEST_URL;
if (!database) throw new Error('Use npm test for disposable PostgreSQL');
async function fixture() {
  const control = new Pool({ connectionString: database });
  const schema = `consumer_${randomUUID().replaceAll('-', '')}`;
  await control.query(`CREATE SCHEMA ${schema}`);
  const store = new PostgresAuthStore(database!, schema);
  const close = async () => { await store.close(); await control.query(`DROP SCHEMA ${schema} CASCADE`); await control.end(); };
  try {
    await store.migrate(false, true);
    const auth = new AuthService(store, 'consumer-tests-secret-at-least-32-bytes');
    const identities = [];
    for (const [index, role] of ['Consumer', 'Consumer', 'Provider'].entries()) {
      const email = `user${index}@consumer.test`;
      await auth.register(email, 'Test-password-12345!', role as 'Consumer' | 'Provider');
      identities.push(await auth.login(email, 'Test-password-12345!'));
    }
    const provider = (await store.pool.query('SELECT id FROM api_providers WHERE user_id=$1', [identities[2]!.user.id])).rows[0].id;
    const admin = (await store.pool.query("INSERT INTO users(name,email,password_hash,role_id) VALUES('Admin','admin@consumer.test','fixture',(SELECT id FROM roles WHERE name='ADMIN')) RETURNING id")).rows[0].id;
    await store.pool.query("INSERT INTO provider_verifications(provider_id,organization_name,contact_email,evidence_urls,status,reviewed_at,reviewed_by) VALUES($1,'Weather','provider@consumer.test','[\"https://example.com/proof\"]','Verified',NOW(),$2)", [provider, admin]);
    const api = String((await store.pool.query("INSERT INTO apis(provider_id,name,description,category,base_url) VALUES($1,'Weather','Forecast','Weather','https://api.example.com/v1') RETURNING id", [provider])).rows[0].id);
    for (const state of ['Submitted', 'Under Review', 'Approved', 'Published']) await store.pool.query('UPDATE apis SET status=$1 WHERE id=$2', [state, api]);
    const version = (await store.pool.query("INSERT INTO api_versions(api_id,version) VALUES($1,'1.0') RETURNING id", [api])).rows[0].id;
    const endpoint = String((await store.pool.query("INSERT INTO api_endpoints(api_id,version_id,method,path,description) VALUES($1,$2,'GET','/weather/{city}','Forecast') RETURNING id", [api, version])).rows[0].id);
    const makeApp = (options: Record<string, any> = {}) => createApp(auth, () => {}, { marketplace: new MarketplaceService(store.pool), ...options });
    const app = makeApp();
    return { store, api, endpoint, identities, auth, app, makeApp, close };
  } catch (error) { await close(); throw error; }
}

test('sandbox grant is one per Consumer/API, persists on repeat POST and expires after 24 hours', async () => {
  const f = await fixture();
  try {
    const route = `/api/consumer/apis/${f.api}/sandbox`, token = f.identities[0]!.accessToken;
    await request(f.app).get(route).set('Authorization', `Bearer ${token}`).expect(404);
    const first = (await request(f.app).post(route).set('Authorization', `Bearer ${token}`).send({}).expect(201)).body.data;
    assert.equal(first.maxRequests, 5); assert.equal(first.remainingRequests, 5);
    assert.ok(Date.parse(first.expiresAt) - Date.now() > 23 * 3600_000);
    await f.store.pool.query('UPDATE sandbox_grants SET used_requests=2 WHERE consumer_id=$1', [f.identities[0]!.user.id]);
    const again = (await request(f.app).post(route).set('Authorization', `Bearer ${token}`).send({}).expect(200)).body.data;
    assert.equal(again.id, first.id); assert.equal(again.remainingRequests, 3); assert.equal(again.expiresAt, first.expiresAt);
    await f.store.pool.query("UPDATE sandbox_grants SET expires_at=NOW()-INTERVAL '1 second' WHERE consumer_id=$1", [f.identities[0]!.user.id]);
    const expired = (await request(f.app).post(route).set('Authorization', `Bearer ${token}`).send({}).expect(200)).body.data;
    assert.equal(expired.remainingRequests, 0); assert.equal(expired.available, false);
    await request(f.app).post(route).set('Authorization', `Bearer ${token}`).send({ maxRequests: 10 }).expect(400);
  } finally { await f.close(); }
});

test('consumer endpoints require JWT and Consumer role and hide unavailable APIs', async () => {
  const f = await fixture();
  try {
    const route = `/api/consumer/apis/${f.api}/sandbox`;
    await request(f.app).post(route).send({}).expect(401);
    await request(f.app).post(route).set('Authorization', `Bearer ${f.identities[2]!.accessToken}`).send({}).expect(403);
    await f.store.pool.query('UPDATE users SET is_active=false WHERE id=$1', [f.identities[2]!.user.id]);
    await request(f.app).post(route).set('Authorization', `Bearer ${f.identities[0]!.accessToken}`).send({}).expect(404);
    await request(f.app).post('/api/consumer/api-keys').set('Authorization', `Bearer ${f.identities[0]!.accessToken}`).send({ apiId: f.api }).expect(404);
  } finally { await f.close(); }
});

test('API key is random, stored hashed and disclosed only on create/rotate; revoke invalidates it', async () => {
  const f = await fixture();
  try {
    const token = `Bearer ${f.identities[0]!.accessToken}`;
    const first = (await request(f.app).post('/api/consumer/api-keys').set('Authorization', token).send({ apiId: f.api, label: 'Weather app' }).expect(201)).body.data;
    assert.match(first.key, /^ak_live_[A-Za-z0-9_-]{43}$/);
    const db = (await f.store.pool.query('SELECT * FROM api_keys WHERE id=$1', [first.id])).rows[0];
    assert.equal(db.key_hash, createHash('sha256').update(first.key).digest('hex'));
    assert.ok(!JSON.stringify(db).includes(first.key));
    const listed = await request(f.app).get('/api/consumer/api-keys').set('Authorization', token).expect(200);
    assert.equal(listed.body.data.items[0].id, first.id);
    assert.equal(listed.headers['cache-control'], 'no-store');
    assert.ok(!JSON.stringify(listed.body).includes(first.key)); assert.ok(!JSON.stringify(listed.body).includes(db.key_hash));
    await request(f.app).post('/api/consumer/api-keys').set('Authorization', token).send({ apiId: f.api }).expect(409);
    const rotated = (await request(f.app).post(`/api/consumer/api-keys/${first.id}/rotate`).set('Authorization', token).send({}).expect(201)).body.data;
    assert.notEqual(rotated.key, first.key); assert.notEqual(rotated.id, first.id);
    assert.equal((await f.store.pool.query('SELECT is_active FROM api_keys WHERE id=$1', [first.id])).rows[0].is_active, false);
    await request(f.app).post(`/api/consumer/api-keys/${first.id}/rotate`).set('Authorization', token).send({}).expect(409);
    await request(f.app).delete(`/api/consumer/api-keys/${rotated.id}`).set('Authorization', token).expect(204);
    await request(f.app).delete(`/api/consumer/api-keys/${rotated.id}`).set('Authorization', token).expect(204);
    assert.equal(Number((await f.store.pool.query('SELECT COUNT(*) FROM api_keys WHERE is_active')).rows[0].count), 0);
  } finally { await f.close(); }
});

test('key owner isolation and concurrent rotate preserve exactly one active key', async () => {
  const f = await fixture();
  try {
    const owner = `Bearer ${f.identities[0]!.accessToken}`, stranger = `Bearer ${f.identities[1]!.accessToken}`;
    const first = (await request(f.app).post('/api/consumer/api-keys').set('Authorization', owner).send({ apiId: f.api }).expect(201)).body.data;
    assert.equal((await request(f.app).get('/api/consumer/api-keys').set('Authorization', stranger).expect(200)).body.data.total, 0);
    await request(f.app).delete(`/api/consumer/api-keys/${first.id}`).set('Authorization', stranger).expect(404);
    await request(f.app).post(`/api/consumer/api-keys/${first.id}/rotate`).set('Authorization', stranger).send({}).expect(404);
    const results = await Promise.all([1, 2].map(() => request(f.app).post(`/api/consumer/api-keys/${first.id}/rotate`).set('Authorization', owner).send({})));
    assert.deepEqual(results.map(r => r.status).sort(), [201, 409]);
    assert.equal(Number((await f.store.pool.query('SELECT COUNT(*) FROM api_keys WHERE is_active')).rows[0].count), 1);
  } finally { await f.close(); }
});

test('Playground rejects unregistered endpoints and SSRF without charging sandbox quota', async () => {
  const f = await fixture();
  try {
    const token = `Bearer ${f.identities[0]!.accessToken}`;
    await request(f.app).post(`/api/consumer/apis/${f.api}/sandbox`).set('Authorization', token).send({}).expect(201);
    await f.store.pool.query("INSERT INTO gateway_routes(api_id,upstream_base_url) VALUES($1,'http://127.0.0.1')", [f.api]);
    const route = `/api/marketplace/apis/${f.api}/playground`;
    await request(f.app).post(route).send({ endpointId: f.endpoint }).expect(401);
    await request(f.app).post(route).set('Authorization', token).send({ endpointId: '2147483647' }).expect(400);
    await request(f.app).post(route).set('Authorization', token).send({ endpointId: f.endpoint, url: 'http://localhost' }).expect(400);
    await request(f.app).post(route).set('Authorization', token).send({ endpointId: f.endpoint, pathParams: { city: 'Hanoi' }, headers: { Accept: '✓' } }).expect(400);
    await request(f.app).post(route).set('Authorization', token).send({ endpointId: f.endpoint, pathParams: { city: '\ud800' } }).expect(400);
    const blocked = await request(f.app).post(route).set('Authorization', token).send({ endpointId: f.endpoint, pathParams: { city: 'Hanoi' } }).expect(403);
    assert.equal(blocked.body.error.code, 'SSRF_DETECTED');
    assert.equal((await f.store.pool.query('SELECT used_requests FROM sandbox_grants')).rows[0].used_requests, 0);
    await f.store.pool.query('UPDATE gateway_routes SET is_enabled=false WHERE api_id=$1', [f.api]);
    await request(f.app).post(route).set('Authorization', token).send({ endpointId: f.endpoint, pathParams: { city: 'Hanoi' } }).expect(404);
  } finally { await f.close(); }
});

test('sandbox consumption is atomic and API key verifier rejects old keys and inactive accounts', async () => {
  const f = await fixture();
  try {
    const sandbox = new SandboxService(f.store.pool), keys = new ApiKeyService(f.store.pool), user = f.identities[0]!.user.id;
    await sandbox.grant(user, f.api);
    const consumed = await Promise.allSettled(Array.from({ length: 12 }, () => sandbox.consume(user, f.api)));
    assert.equal(consumed.filter(r => r.status === 'fulfilled').length, 5);
    assert.equal((await f.store.pool.query('SELECT used_requests FROM sandbox_grants')).rows[0].used_requests, 5);
    const first = await keys.create(user, f.api);
    assert.equal((await keys.authenticate(first.key, f.api)).userId, user);
    assert.ok((await f.store.pool.query('SELECT last_used_at FROM api_keys WHERE id=$1', [first.id])).rows[0].last_used_at);
    await assert.rejects(() => keys.authenticate(first.key, '2147483647'), { status: 401 });
    const next = await keys.rotate(user, first.id);
    await assert.rejects(() => keys.authenticate(first.key, f.api), { status: 401 });
    await f.store.pool.query('UPDATE users SET is_active=false WHERE id=$1', [user]);
    await assert.rejects(() => keys.authenticate(next.key, f.api), { status: 401 });
    await assert.rejects(() => sandbox.consume(user, f.api), { status: 403 });
    await f.store.pool.query('UPDATE users SET is_active=true WHERE id=$1', [user]);
    await f.store.pool.query('UPDATE users SET is_active=false WHERE id=$1', [f.identities[2]!.user.id]);
    await assert.rejects(() => keys.authenticate(next.key, f.api), { status: 401 });
    await f.store.pool.query('UPDATE users SET is_active=true WHERE id=$1', [f.identities[2]!.user.id]);
    await keys.revoke(user, next.id);
    await assert.rejects(() => keys.authenticate(next.key, f.api), { status: 401 });
  } finally { await f.close(); }
});

test('routing registry creates only visible routes, preserves disabled routes and observes unpublish immediately', async () => {
  const f = await fixture();
  try {
    const registry = new RoutingRegistry(f.store.pool);
    const route = await registry.resolve(f.api);
    assert.equal(route.apiId, f.api); assert.equal(route.upstreamBaseUrl, 'https://api.example.com/v1');
    await f.store.pool.query('UPDATE gateway_routes SET is_enabled=false WHERE api_id=$1', [f.api]);
    await assert.rejects(() => registry.resolve(f.api), { status: 404 });
    await f.store.pool.query('UPDATE gateway_routes SET is_enabled=true WHERE api_id=$1', [f.api]);
    // Fixture models moderation removing publication without inventing a new workflow status.
    await f.store.pool.query('ALTER TABLE apis DISABLE TRIGGER USER');
    await f.store.pool.query("UPDATE apis SET status='Draft',published_at=NULL WHERE id=$1", [f.api]);
    await f.store.pool.query('ALTER TABLE apis ENABLE TRIGGER USER');
    await assert.rejects(() => registry.resolve(f.api), { status: 404 });
  } finally { await f.close(); }
});

test('registered Playground requests spend persistent quota; failures, expiry and disabled APIs cannot bypass it', async () => {
  const f = await fixture();
  try {
    let networkCalls = 0;
    const proxy = new SafeProxy({ lookup: async () => [{ address: '93.184.216.34', family: 4 }], request: (_options, callback) => {
      const req: any = new EventEmitter();
      req.destroy = () => {}; req.end = () => {
        networkCalls++;
        queueMicrotask(() => {
          const res: any = Readable.from(['{"weather":"sunny"}']);
          res.statusCode = 200; res.headers = { 'content-type': 'application/json' }; callback(res);
        });
      };
      return req;
    } });
    const sandbox = new SandboxService(f.store.pool);
    const app = f.makeApp({ playground: new PlaygroundService(f.store.pool, sandbox, new RoutingRegistry(f.store.pool), proxy) });
    const token = `Bearer ${f.identities[0]!.accessToken}`, route = `/api/marketplace/apis/${f.api}/playground`;
    const payload = { endpointId: f.endpoint, pathParams: { city: 'Hanoi' } };
    await sandbox.grant(f.identities[0]!.user.id, f.api);
    const requests = await Promise.all(Array.from({ length: 8 }, () => request(app).post(route).set('Authorization', token).send(payload)));
    assert.equal(requests.filter(r => r.status === 200).length, 5);
    assert.equal(requests.filter(r => r.body.error?.code === 'SANDBOX_EXHAUSTED').length, 3);
    assert.equal(networkCalls, 5);
    const success = requests.find(r => r.status === 200)!;
    assert.equal(success.body.data.body, '{"weather":"sunny"}'); assert.equal(success.body.data.bodyEncoding, 'utf8');
    assert.equal((await sandbox.get(f.identities[0]!.user.id, f.api)).remainingRequests, 0);
    const otherToken = `Bearer ${f.identities[1]!.accessToken}`;
    await sandbox.grant(f.identities[1]!.user.id, f.api);
    await f.store.pool.query("UPDATE sandbox_grants SET expires_at=NOW()-INTERVAL '1 second' WHERE consumer_id=$1", [f.identities[1]!.user.id]);
    await request(app).post(route).set('Authorization', otherToken).send(payload).expect(403);
    await f.store.pool.query('UPDATE gateway_routes SET is_enabled=false WHERE api_id=$1', [f.api]);
    await request(app).post(route).set('Authorization', token).send(payload).expect(404);
    assert.equal(networkCalls, 5);
  } finally { await f.close(); }
});

test('Consumer input validation rejects unknown fields, forged ownership, invalid key IDs and labels', async () => {
  const f = await fixture();
  try {
    const token = `Bearer ${f.identities[0]!.accessToken}`;
    for (const input of [{ apiId: f.api, userId: f.identities[1]!.user.id }, { apiId: f.api, key: 'chosen' }, { apiId: f.api, label: '\0' }, { apiId: '2147483648' }]) {
      await request(f.app).post('/api/consumer/api-keys').set('Authorization', token).send(input).expect(400);
    }
    for (const id of ['0', 'abc', '9223372036854775808']) {
      await request(f.app).post(`/api/consumer/api-keys/${id}/rotate`).set('Authorization', token).send({}).expect(400);
    }
    for (const query of ['page=0', 'pageSize=101', 'page=1&page=2', 'unknown=yes']) {
      await request(f.app).get(`/api/consumer/api-keys?${query}`).set('Authorization', token).expect(400);
    }
  } finally { await f.close(); }
});

test('Swagger documents authenticated Sandbox, API Key lifecycle and registered Playground requests', async () => {
  const f = await fixture();
  try {
    const spec = (await request(f.app).get('/openapi.json').expect(200)).body;
    for (const [path, method] of [
      ['/api/consumer/apis/{apiId}/sandbox', 'get'], ['/api/consumer/apis/{apiId}/sandbox', 'post'],
      ['/api/consumer/api-keys', 'get'], ['/api/consumer/api-keys', 'post'],
      ['/api/consumer/api-keys/{id}/rotate', 'post'], ['/api/consumer/api-keys/{id}', 'delete'],
      ['/api/marketplace/apis/{id}/playground', 'post'],
    ]) {
      const operation = spec.paths[path!]?.[method!];
      assert.ok(operation, `${method} ${path} must be documented`);
      assert.deepEqual(operation.security, [{ bearerAuth: [] }]);
      assert.ok(operation.responses['401']); assert.ok(operation.responses['403']);
    }
    await SwaggerParser.validate(structuredClone(spec));
  } finally { await f.close(); }
});
