import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import { AddressInfo } from 'node:net';
import { Pool } from 'pg';
import request from 'supertest';
import { PostgresAuthStore } from '../src/postgres-store.js';
import { AuthService } from '../src/auth.js';
import { createApp } from '../src/app.js';
import { GatewayService } from '../src/gateway-service.js';
import { ApiKeyService } from '../src/consumer-service.js';

const database = process.env.PG_TEST_URL;
if (!database) throw new Error('Use npm test for disposable PostgreSQL');

/** Minimal upstream that records the request it received so the test can inspect forwarding. */
async function upstream(handler: (req: import('node:http').IncomingMessage, body: string, res: import('node:http').ServerResponse) => void) {
  const seen: { method?: string; url?: string; headers?: Record<string, unknown>; body?: string } = {};
  const server: Server = createServer((req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      seen.method = req.method; seen.url = req.url; seen.headers = req.headers; seen.body = body;
      handler(req, body, res);
    });
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return { server, seen, baseUrl: `http://127.0.0.1:${port}` };
}

async function fixture(baseUrl: string) {
  const control = new Pool({ connectionString: database });
  const schema = `gateway_${randomUUID().replaceAll('-', '')}`;
  await control.query(`CREATE SCHEMA ${schema}`);
  const store = new PostgresAuthStore(database!, schema);
  const close = async () => { await store.close(); await control.query(`DROP SCHEMA ${schema} CASCADE`); await control.end(); };
  try {
    await store.migrate(false, true);
    const auth = new AuthService(store, 'gateway-tests-secret-at-least-32-bytes');
    await auth.register('consumer@gateway.test', 'Test-password-12345!', 'Consumer');
    await auth.register('provider@gateway.test', 'Test-password-12345!', 'Provider');
    const consumer = await auth.login('consumer@gateway.test', 'Test-password-12345!');
    const provider = (await store.pool.query("SELECT p.id FROM api_providers p JOIN users u ON u.id=p.user_id WHERE u.email='provider@gateway.test'")).rows[0].id;
    const admin = (await store.pool.query("INSERT INTO users(name,email,password_hash,role_id) VALUES('Admin','admin@gateway.test','fixture',(SELECT id FROM roles WHERE name='ADMIN')) RETURNING id")).rows[0].id;
    await store.pool.query("INSERT INTO provider_verifications(provider_id,organization_name,contact_email,evidence_urls,status,reviewed_at,reviewed_by) VALUES($1,'API Co','p@gateway.test','[\"https://example.com/proof\"]','Verified',NOW(),$2)", [provider, admin]);

    const api = String((await store.pool.query("INSERT INTO apis(provider_id,name,description,category,base_url) VALUES($1,'Weather','Forecast','Weather',$2) RETURNING id", [provider, baseUrl])).rows[0].id);
    for (const state of ['Submitted', 'Under Review', 'Approved', 'Published']) await store.pool.query('UPDATE apis SET status=$1 WHERE id=$2', [state, api]);
    const version = (await store.pool.query("INSERT INTO api_versions(api_id,version) VALUES($1,'1.0') RETURNING id", [api])).rows[0].id;
    await store.pool.query("INSERT INTO api_endpoints(api_id,version_id,method,path,description) VALUES($1,$2,'GET','/weather','Forecast')", [api, version]);

    const keys = new ApiKeyService(store.pool);
    const created = await keys.create(consumer.user.id, api, 'test');
    const gateway = new GatewayService(store.pool);
    const app = createApp(auth, () => {}, { gateway });
    return { store, auth, api, keys, gateway, app, consumer, key: created.key, close };
  } catch (error) { await close(); throw error; }
}

test('gateway forwards a registered endpoint with a valid key and strips caller credentials', async () => {
  const { server, seen, baseUrl } = await upstream((_req, _body, res) => {
    res.writeHead(200, { 'content-type': 'application/json', 'x-upstream': 'yes' });
    res.end(JSON.stringify({ ok: true }));
  });
  const f = await fixture(baseUrl);
  try {
    const res = await request(f.app).get(`/api/gateway/${f.api}/weather`)
      .set('x-api-key', f.key)
      .set('authorization', 'Bearer should-not-leak')
      .set('cookie', 'session=should-not-leak')
      .expect(200);

    assert.deepEqual(res.body, { ok: true });
    assert.equal(res.headers['x-upstream'], 'yes');
    // The upstream must not receive the caller's session or the API key itself.
    assert.equal(seen.headers?.authorization, undefined);
    assert.equal(seen.headers?.cookie, undefined);
    assert.equal(seen.headers?.['x-api-key'], undefined);
    assert.equal(seen.method, 'GET');
    assert.equal(seen.url, '/weather');
  } finally { await f.close(); server.close(); }
});

test('gateway rejects a missing, malformed or revoked API key', async () => {
  const { server, baseUrl } = await upstream((_req, _body, res) => { res.writeHead(200); res.end('{}'); });
  const f = await fixture(baseUrl);
  try {
    await request(f.app).get(`/api/gateway/${f.api}/weather`).expect(401);
    await request(f.app).get(`/api/gateway/${f.api}/weather`).set('x-api-key', 'ak_live_short').expect(401);

    const list = await f.keys.list(f.consumer.user.id);
    await f.keys.revoke(f.consumer.user.id, list.items[0]!.id);
    await request(f.app).get(`/api/gateway/${f.api}/weather`).set('x-api-key', f.key).expect(401);
  } finally { await f.close(); server.close(); }
});

test('gateway refuses endpoints that are not registered for the API', async () => {
  const { server, baseUrl } = await upstream((_req, _body, res) => { res.writeHead(200); res.end('{}'); });
  const f = await fixture(baseUrl);
  try {
    await request(f.app).get(`/api/gateway/${f.api}/not-registered`).set('x-api-key', f.key).expect(404);
    await request(f.app).post(`/api/gateway/${f.api}/weather`).set('x-api-key', f.key).expect(404);
  } finally { await f.close(); server.close(); }
});

test('gateway blocks path traversal and never follows an upstream redirect', async () => {
  const { server, baseUrl } = await upstream((_req, _body, res) => {
    res.writeHead(302, { location: 'http://127.0.0.1:1/internal' });
    res.end();
  });
  const f = await fixture(baseUrl);
  try {
    await request(f.app).get(`/api/gateway/${f.api}/weather/../secret`).set('x-api-key', f.key).expect(400);
    await request(f.app).get(`/api/gateway/${f.api}/weather`).set('x-api-key', f.key).expect(502);
  } finally { await f.close(); server.close(); }
});

test('gateway stops serving once the API is no longer Published or the route is disabled', async () => {
  const { server, baseUrl } = await upstream((_req, _body, res) => { res.writeHead(200); res.end('{}'); });
  const f = await fixture(baseUrl);
  try {
    await request(f.app).get(`/api/gateway/${f.api}/weather`).set('x-api-key', f.key).expect(200);

    // The registry only resolves Published APIs. The status trigger currently has no path
    // away from Published, so flip the row directly to prove the registry check is real.
    await f.store.pool.query("ALTER TABLE apis DISABLE TRIGGER trg_apis_enforce_status_transition");
    await f.store.pool.query("UPDATE apis SET status='Rejected', published_at=NULL WHERE id=$1", [f.api]);
    await f.store.pool.query("ALTER TABLE apis ENABLE TRIGGER trg_apis_enforce_status_transition");
    // The key authenticator also requires Published, so the failure surfaces as 401 before
    // the registry is reached — either way the call is refused.
    await request(f.app).get(`/api/gateway/${f.api}/weather`).set('x-api-key', f.key).expect(401);

    await f.store.pool.query("ALTER TABLE apis DISABLE TRIGGER trg_apis_enforce_status_transition");
    await f.store.pool.query("UPDATE apis SET status='Published' WHERE id=$1", [f.api]);
    await f.store.pool.query("ALTER TABLE apis ENABLE TRIGGER trg_apis_enforce_status_transition");
    await f.store.pool.query('UPDATE gateway_routes SET is_enabled=false WHERE api_id=$1', [f.api]);
    await request(f.app).get(`/api/gateway/${f.api}/weather`).set('x-api-key', f.key).expect(404);
  } finally { await f.close(); server.close(); }
});

test('gateway rejects an unsafe caller path before authenticating', async () => {
  const { server, baseUrl } = await upstream((_req, _body, res) => { res.writeHead(200); res.end('{}'); });
  const f = await fixture(baseUrl);
  try {
    // Backslash and whitespace are rejected as unsafe segments, not forwarded upstream.
    await request(f.app).get(`/api/gateway/${f.api}/weather%5Cevil`).set('x-api-key', f.key).expect(400);
  } finally { await f.close(); server.close(); }
});
