import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { Pool } from 'pg';
import { PostgresAuthStore } from '../src/postgres-store.js';
import { AuthService } from '../src/auth.js';
import { createApp } from '../src/app.js';
import { GatewayService, matchTemplate } from '../src/gateway-service.js';
import { ApiKeyService } from '../src/consumer-service.js';

const database = process.env.PG_TEST_URL;
if (!database) throw new Error('Use npm test for disposable PostgreSQL');

interface Seen { method?: string; url?: string; headers?: Record<string, unknown>; body?: string }

/**
 * Real HTTP fixtures instead of an in-process test client: the Gateway mounts a raw body
 * parser ahead of express.json(), and a synthetic client cannot reproduce that ordering
 * faithfully. Talking to a listening server also proves the app wiring end to end.
 */
async function listen(server: Server) {
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  return (server.address() as AddressInfo).port;
}

async function upstream(handler?: (body: string, res: import('node:http').ServerResponse) => void) {
  const seen: Seen = {};
  let hits = 0;
  const server = createServer((req, res) => {
    hits += 1;
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      seen.method = req.method; seen.url = req.url; seen.headers = req.headers; seen.body = body;
      if (handler) return handler(body, res);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
  });
  const port = await listen(server);
  return { server, seen, port, hits: () => hits };
}

/**
 * The registry stores a public-looking hostname; the stub transport resolves it to the
 * loopback fixture. SafeProxy's own suite covers the SSRF policy, so these tests target
 * Gateway routing and header handling without needing a public provider.
 */
const passThroughProxy = {
  async prepare(baseUrl: string, registeredPath: string, input: { method?: string; query?: Record<string, string>; headers?: Record<string, string>; body?: unknown; pathParams?: Record<string, string> }) {
    const resolved = registeredPath.replace(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_match, name: string) => encodeURIComponent(input.pathParams?.[name] ?? ''));
    const url = new URL(baseUrl.replace(/\/$/, '') + resolved);
    for (const [key, value] of Object.entries(input.query ?? {})) url.searchParams.append(key, value);
    return {
      url,
      method: input.method ?? 'GET',
      headers: { ...(input.headers ?? {}) },
      body: input.body === undefined ? undefined : Buffer.from(JSON.stringify(input.body)),
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

async function fixture(upstreamPort: number) {
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

    const api = String((await store.pool.query("INSERT INTO apis(provider_id,name,description,category,base_url) VALUES($1,'Weather','Forecast','Weather',$2) RETURNING id", [provider, `http://127.0.0.1:${upstreamPort}`])).rows[0].id);
    for (const state of ['Submitted', 'Under Review', 'Approved', 'Published']) await store.pool.query('UPDATE apis SET status=$1 WHERE id=$2', [state, api]);
    const version = (await store.pool.query("INSERT INTO api_versions(api_id,version) VALUES($1,'1.0') RETURNING id", [api])).rows[0].id;
    await store.pool.query("INSERT INTO api_endpoints(api_id,version_id,method,path,description) VALUES($1,$2,'GET','/weather/{city}','Forecast')", [api, version]);
    await store.pool.query("INSERT INTO api_endpoints(api_id,version_id,method,path,description) VALUES($1,$2,'POST','/forecast','Create')", [api, version]);

    const keys = new ApiKeyService(store.pool);
    const created = await keys.create(consumer.user.id, api, 'test');
    const app = createApp(auth, () => {}, { gateway: new GatewayService(store.pool, keys, passThroughProxy) });
    const server = createServer(app);
    const port = await listen(server);
    return { store, api, keys, consumer, key: created.key, port, close: async () => { server.close(); await close(); } };
  } catch (error) { await close(); throw error; }
}

const url = (port: number, path: string) => `http://127.0.0.1:${port}${path}`;

test('matchTemplate matches path parameters and rejects mismatches', () => {
  assert.deepEqual(matchTemplate('/weather/{city}', '/weather/Hanoi'), { city: 'Hanoi' });
  assert.deepEqual(matchTemplate('/a/{x}/b/{y}', '/a/1/b/2'), { x: '1', y: '2' });
  assert.equal(matchTemplate('/weather/{city}', '/weather'), null);
  assert.equal(matchTemplate('/weather/{city}', '/other/Hanoi'), null);
  assert.equal(matchTemplate('/weather/{city}', '/weather/a/b'), null);
});

test('forwards a template endpoint and preserves query and JSON body', async () => {
  const { server, seen, port: upPort } = await upstream();
  const f = await fixture(upPort);
  try {
    const get = await fetch(url(f.port, `/api/gateway/${f.api}/weather/Hanoi?units=metric&lang=vi`), {
      headers: { 'x-api-key': f.key },
    });
    assert.equal(get.status, 200);
    assert.equal(seen.url, '/weather/Hanoi?units=metric&lang=vi');

    const post = await fetch(url(f.port, `/api/gateway/${f.api}/forecast`), {
      method: 'POST',
      headers: { 'x-api-key': f.key, 'content-type': 'application/json' },
      body: JSON.stringify({ city: 'Hanoi', days: 3 }),
    });
    assert.equal(post.status, 200);
    assert.deepEqual(JSON.parse(seen.body!), { city: 'Hanoi', days: 3 });
  } finally { await f.close(); server.close(); }
});

test('strips caller credentials and internal headers before forwarding', async () => {
  const { server, seen, port: upPort } = await upstream();
  const f = await fixture(upPort);
  try {
    const res = await fetch(url(f.port, `/api/gateway/${f.api}/weather/Hanoi`), {
      headers: {
        'x-api-key': f.key,
        authorization: 'Bearer should-not-leak',
        cookie: 'session=should-not-leak',
        'x-internal-actor': 'admin',
        'x-forwarded-for': '10.0.0.9',
      },
    });
    assert.equal(res.status, 200);
    for (const name of ['authorization', 'cookie', 'x-api-key', 'x-internal-actor', 'x-forwarded-for']) {
      assert.equal(seen.headers?.[name], undefined, `${name} must not reach the upstream`);
    }
  } finally { await f.close(); server.close(); }
});

test('rejects a missing, malformed or revoked API key', async () => {
  const { server, port: upPort } = await upstream();
  const f = await fixture(upPort);
  try {
    assert.equal((await fetch(url(f.port, `/api/gateway/${f.api}/weather/Hanoi`))).status, 401);
    assert.equal((await fetch(url(f.port, `/api/gateway/${f.api}/weather/Hanoi`), { headers: { 'x-api-key': 'ak_live_short' } })).status, 401);

    const list = await f.keys.list(f.consumer.user.id);
    await f.keys.revoke(f.consumer.user.id, list.items[0]!.id);
    assert.equal((await fetch(url(f.port, `/api/gateway/${f.api}/weather/Hanoi`), { headers: { 'x-api-key': f.key } })).status, 401);
  } finally { await f.close(); server.close(); }
});

test('refuses endpoints that are not registered for the API', async () => {
  const { server, port: upPort, hits } = await upstream();
  const f = await fixture(upPort);
  try {
    // Method is part of the registration: /weather/{city} only accepts GET.
    assert.equal((await fetch(url(f.port, `/api/gateway/${f.api}/not-registered`), { headers: { 'x-api-key': f.key } })).status, 404);
    assert.equal((await fetch(url(f.port, `/api/gateway/${f.api}/weather/Hanoi`), { method: 'POST', headers: { 'x-api-key': f.key } })).status, 404);
    assert.equal(hits(), 0, 'an unregistered endpoint must never reach the upstream');
  } finally { await f.close(); server.close(); }
});

test('blocks path traversal', async () => {
  const { server, port: upPort } = await upstream();
  const f = await fixture(upPort);
  try {
    const res = await fetch(url(f.port, `/api/gateway/${f.api}/weather/..%2Fsecret`), { headers: { 'x-api-key': f.key } });
    assert.equal(res.status, 400);
  } finally { await f.close(); server.close(); }
});

test('stops serving once the API is no longer Published', async () => {
  const { server, port: upPort } = await upstream();
  const f = await fixture(upPort);
  try {
    assert.equal((await fetch(url(f.port, `/api/gateway/${f.api}/weather/Hanoi`), { headers: { 'x-api-key': f.key } })).status, 200);

    // Suspended arrives with migration 008; fall back to a direct status change otherwise.
    const suspended = await f.store.pool.query("UPDATE apis SET status='Suspended' WHERE id=$1", [f.api]).then(() => true).catch(() => false);
    if (!suspended) {
      await f.store.pool.query('ALTER TABLE apis DISABLE TRIGGER trg_apis_enforce_status_transition');
      await f.store.pool.query("UPDATE apis SET status='Rejected', published_at=NULL WHERE id=$1", [f.api]);
      await f.store.pool.query('ALTER TABLE apis ENABLE TRIGGER trg_apis_enforce_status_transition');
    }
    assert.equal((await fetch(url(f.port, `/api/gateway/${f.api}/weather/Hanoi`), { headers: { 'x-api-key': f.key } })).status, 401);
  } finally { await f.close(); server.close(); }
});
test('accepts OpenAPI template names containing dash and dot', () => {
  assert.deepEqual(matchTemplate('/weather/{city-name}', '/weather/Hanoi'), { 'city-name': 'Hanoi' });
  assert.deepEqual(matchTemplate('/docs/{file.name}', '/docs/readme'), { 'file.name': 'readme' });
});

test('does not double-decode an already-decoded path segment', async () => {
  const { server, seen, port: upPort } = await upstream();
  const f = await fixture(upPort);
  try {
    // Express decodes '100%25' to '100%'; decoding again would throw a URIError and answer 500.
    const res = await fetch(url(f.port, `/api/gateway/${f.api}/weather/100%25`), { headers: { 'x-api-key': f.key } });
    assert.notEqual(res.status, 500, 'a percent in the path must not become an internal error');
    if (res.status === 200) assert.equal(seen.url, '/weather/100%25');
  } finally { await f.close(); server.close(); }
});
