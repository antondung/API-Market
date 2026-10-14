import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import request from 'supertest';
import { Pool } from 'pg';
import { PostgresAuthStore } from '../src/postgres-store.js';
import { AuthService } from '../src/auth.js';
import { ProviderService } from '../src/provider-service.js';
import { createApp } from '../src/app.js';

const url = process.env.PG_TEST_URL;
if (!url) throw new Error('Run npm test to provide PostgreSQL');
const secret = 'provider-integration-secret-with-32-bytes';
const metadata = { name: 'Test API', description: 'Demo', category: 'Weather', baseUrl: 'https://example.com', tags: ['test'] };
const free = { name: 'Free', priceMonthly: 0, currency: 'VND', quota: 100, rateLimit: 10 };
const legal = { ownershipDeclaration: 'I own it', distributionRights: 'I can distribute', dataClassification: 'Public', agreementVersion: 'test-v1', accepted: true };
const spec = readFileSync('backend/test/fixtures/provider-import.openapi.yaml', 'utf8');
async function fixture() {
  const control = new Pool({ connectionString: url });
  await control.query('CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public');
  const schema = `provider_test_${randomUUID().replaceAll('-', '')}`;
  await control.query(`CREATE SCHEMA ${schema}`);
  const store = new PostgresAuthStore(url!, schema);
  const service = new ProviderService(store.pool);
  try {
    await store.migrate(false, true); await service.ready();
    const auth = new AuthService(store, secret);
    const users = [];
    for (const role of ['Provider', 'Provider', 'Consumer'] as const) {
      const email = `${randomUUID()}@example.test`;
      const user = await auth.register(email, 'Test-password-12345', role);
      users.push({ id: user.id, token: (await auth.login(email, 'Test-password-12345')).accessToken });
    }
    const admin = (await store.pool.query("INSERT INTO users(name,email,password_hash,role_id) VALUES('Admin','admin@test.invalid','unused',(SELECT id FROM roles WHERE name='ADMIN')) RETURNING id")).rows[0].id;
    const providers = (await store.pool.query('SELECT id,user_id FROM api_providers ORDER BY id')).rows;
    await store.pool.query("INSERT INTO agreements(version,content,is_active) VALUES('test-v1','Test agreement',true)");
    return { store, service, auth, app: createApp(auth, () => {}, { provider: service }), users, providers, admin,
      async verify(index = 0) {
        await store.pool.query("INSERT INTO provider_verifications(provider_id,organization_name,contact_email,evidence_urls,status,reviewed_at,reviewed_by) VALUES($1,'Verified co','provider@test.invalid','[\"https://example.com/license\"]','Verified',NOW(),$2)", [providers[index].id, admin]);
      }, async close() { await store.close(); await control.query(`DROP SCHEMA ${schema} CASCADE`); await control.end(); } };
  } catch (error) { await store.close(); await control.query(`DROP SCHEMA ${schema} CASCADE`); await control.end(); throw error; }
}
const bearer = (token: string) => `Bearer ${token}`;
async function create(f: Awaited<ReturnType<typeof fixture>>, name = 'Test API') {
  const token = f.users[0]!.token;
  const api = (await request(f.app).post('/api/provider/apis').set('Authorization', bearer(token)).send({ ...metadata, name }).expect(201)).body.data;
  const version = (await request(f.app).post(`/api/provider/apis/${api.id}/versions`).set('Authorization', bearer(token)).send({ version: 'v1', changelog: 'First' }).expect(201)).body.data;
  return { api, version, token, path: `/api/provider/apis/${api.id}` };
}
async function ready(f: Awaited<ReturnType<typeof fixture>>, name = 'Ready') {
  const record = await create(f, name);
  await request(f.app).post(`${record.path}/import-openapi`).set('Authorization', bearer(record.token)).field('versionId', record.version.id).attach('file', Buffer.from(spec), 'demo.yaml').expect(200);
  await request(f.app).post(`${record.path}/plans`).set('Authorization', bearer(record.token)).send(free).expect(201);
  await request(f.app).put(`${record.path}/legal`).set('Authorization', bearer(record.token)).send(legal).expect(200);
  return record;
}

test('verification is Pending until Admin review, rejects duplicate and allows resubmit after rejection', async () => {
  const f = await fixture();
  try {
    const token = f.users[0]!.token;
    const payload = { organizationName: 'Company', contactEmail: 'a@example.com', evidenceUrls: ['https://example.com/license'] };
    await request(f.app).get('/api/provider/verification').set('Authorization', bearer(token)).expect(200, { data: null });
    await request(f.app).post('/api/provider/apis').set('Authorization', bearer(token)).send(metadata).expect(403);
    const verification = (await request(f.app).post('/api/provider/verification').set('Authorization', bearer(token)).send(payload).expect(201)).body.data;
    assert.equal(verification.status, 'Pending');
    await request(f.app).post('/api/provider/verification').set('Authorization', bearer(token)).send({ ...payload, status: 'Verified' }).expect(400);
    await request(f.app).post('/api/provider/verification').set('Authorization', bearer(token)).send(payload).expect(409);
    await f.store.pool.query("UPDATE provider_verifications SET status='Rejected',reject_reason='Missing evidence',reviewed_at=NOW(),reviewed_by=$1 WHERE id=$2", [f.admin, verification.id]);
    await request(f.app).post('/api/provider/verification').set('Authorization', bearer(token)).send(payload).expect(201);
    await request(f.app).post('/api/provider/apis').set('Authorization', bearer(token)).send(metadata).expect(403);
  } finally { await f.close(); }
});
test('Provider HTTP enforces role and ownership for metadata, children, import, legal and submission', async () => {
  const f = await fixture();
  try {
    await f.verify(); const r = await create(f);
    await request(f.app).get('/api/provider/apis').expect(401);
    await request(f.app).get('/api/provider/apis').set('Authorization', bearer(f.users[2]!.token)).expect(403);
    for (const suffix of ['', '/versions', '/endpoints', '/plans', '/legal', '/documentation', '/publish-status']) await request(f.app).get(r.path + suffix).set('Authorization', bearer(f.users[1]!.token)).expect(404);
    await request(f.app).put(r.path).set('Authorization', bearer(f.users[1]!.token)).send(metadata).expect(404);
    await request(f.app).post(`${r.path}/import-openapi`).set('Authorization', bearer(f.users[1]!.token)).field('versionId', r.version.id).attach('file', Buffer.from(spec), 'demo.yaml').expect(404);
    await request(f.app).put(`${r.path}/legal`).set('Authorization', bearer(f.users[1]!.token)).send(legal).expect(404);
    await request(f.app).post(`${r.path}/submit-review`).set('Authorization', bearer(f.users[1]!.token)).send({}).expect(404);
    await request(f.app).get('/api/provider/apis/2147483648').set('Authorization', bearer(r.token)).expect(404);
    const list = await request(f.app).get('/api/provider/apis?page=1&pageSize=1').set('Authorization', bearer(r.token)).expect(200);
    assert.equal(list.body.data.total, 1); assert.equal(list.body.data.items[0].id, r.api.id);
    const contract = (await request(f.app).get('/openapi.json').expect(200)).body;
    assert.ok(contract.paths['/api/provider/apis/{id}/import-openapi']);
  } finally { await f.close(); }
});
test('Draft CRUD uses constraints, prevents cross-version writes and preserves data on duplicate failure', async () => {
  const f = await fixture();
  try {
    await f.verify(); const r = await create(f); const other = await create(f, 'Other');
    const endpoint = { versionId: r.version.id, method: 'GET', path: '/x', description: 'Get x' };
    const added = (await request(f.app).post(`${r.path}/endpoints`).set('Authorization', bearer(r.token)).send(endpoint).expect(201)).body.data;
    await request(f.app).post(`${r.path}/endpoints`).set('Authorization', bearer(r.token)).send(endpoint).expect(409);
    await request(f.app).post(`${r.path}/endpoints`).set('Authorization', bearer(r.token)).send({ ...endpoint, versionId: other.version.id }).expect(404);
    await request(f.app).put(`${r.path}/endpoints/${added.id}`).set('Authorization', bearer(r.token)).send({ ...endpoint, path: '/y' }).expect(200);
    const plan = (await request(f.app).post(`${r.path}/plans`).set('Authorization', bearer(r.token)).send(free).expect(201)).body.data;
    await request(f.app).post(`${r.path}/plans`).set('Authorization', bearer(r.token)).send({ ...free, priceMonthly: 1 }).expect(400);
    await request(f.app).put(`${r.path}/plans/${plan.id}`).set('Authorization', bearer(r.token)).send({ ...free, quota: 200 }).expect(200);
    await request(f.app).put(`${r.path}/versions/${r.version.id}`).set('Authorization', bearer(r.token)).send({ version: 'v2', changelog: 'Next' }).expect(200);
    await request(f.app).delete(`${r.path}/endpoints/${added.id}`).set('Authorization', bearer(r.token)).expect(204);
    await request(f.app).delete(`${r.path}/plans/${plan.id}`).set('Authorization', bearer(r.token)).expect(204);
    await request(f.app).delete(`${r.path}/versions/${r.version.id}`).set('Authorization', bearer(r.token)).expect(204);
    await request(f.app).delete(r.path).set('Authorization', bearer(r.token)).expect(204);
    await request(f.app).get(r.path).set('Authorization', bearer(r.token)).expect(404);
  } finally { await f.close(); }
});
test('all three Danh OpenAPI demos import on real PostgreSQL and retain docs after reconnect', async () => {
  const f = await fixture();
  try {
    await f.verify();
    for (const demo of ['weather', 'currency', 'catalog']) {
      const r = await create(f, demo);
      const file = readFileSync(`mock-services/${demo}/openapi.json`);
      const result = await request(f.app).post(`${r.path}/import-openapi`).set('Authorization', bearer(r.token)).field('versionId', r.version.id).attach('file', file, 'demo.json').expect(200);
      assert.ok(result.body.data.endpointCount > 0);
      const docs = await request(f.app).get(`${r.path}/documentation`).set('Authorization', bearer(r.token)).expect(200);
      assert.ok(docs.body.data[0].content.paths);
    }
    const second = new Pool({ connectionString: url, options: `-c search_path=${(await f.store.pool.query('SELECT current_schema() AS s')).rows[0].s},public` });
    try { assert.equal((await second.query('SELECT COUNT(*)::int AS n FROM api_documentations')).rows[0].n, 3); } finally { await second.end(); }
  } finally { await f.close(); }
});
test('multipart rejects invalid/missing/oversize files; failed import rolls back original endpoints/docs', async () => {
  const f = await fixture();
  try {
    await f.verify(); const r = await ready(f);
    await request(f.app).post(`${r.path}/import-openapi`).set('Authorization', bearer(r.token)).field('versionId', r.version.id).attach('file', Buffer.from('info: ['), 'bad.yaml').expect(400);
    await request(f.app).post(`${r.path}/import-openapi`).set('Authorization', bearer(r.token)).field('versionId', r.version.id).attach('file', Buffer.alloc(1024 * 1024 + 1), 'big.json').expect(413);
    await request(f.app).post(`${r.path}/import-openapi`).set('Authorization', bearer(r.token)).field('versionId', r.version.id).expect(400);
    await f.store.pool.query("CREATE FUNCTION fail_docs_test() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'Injected write failure'; END; $$ LANGUAGE plpgsql; CREATE TRIGGER fail_docs_test BEFORE UPDATE ON api_documentations FOR EACH ROW EXECUTE FUNCTION fail_docs_test()");
    await request(f.app).post(`${r.path}/import-openapi`).set('Authorization', bearer(r.token)).field('versionId', r.version.id).attach('file', readFileSync('mock-services/weather/openapi.json'), 'demo.json').expect(500);
    const endpoints = (await f.store.pool.query('SELECT path FROM api_endpoints WHERE api_id=$1', [r.api.id])).rows;
    assert.deepEqual(endpoints.map(e => e.path), ['/items']);
    assert.equal((await f.store.pool.query('SELECT content FROM api_documentations WHERE api_id=$1', [r.api.id])).rows[0].content.info.title, 'Provider import test fixture');
  } finally { await f.close(); }
});
test('legal stores server time/version and rejects obsolete agreement; incomplete submission is blocked', async () => {
  const f = await fixture();
  try {
    await f.verify(); const r = await create(f);
    await request(f.app).post(`${r.path}/submit-review`).set('Authorization', bearer(r.token)).send({}).expect(400);
    await request(f.app).put(`${r.path}/legal`).set('Authorization', bearer(r.token)).send({ ...legal, agreementVersion: 'obsolete' }).expect(409);
    await request(f.app).put(`${r.path}/legal`).set('Authorization', bearer(r.token)).send({ ...legal, acceptedAt: '2000-01-01' }).expect(400);
    const accepted = (await request(f.app).put(`${r.path}/legal`).set('Authorization', bearer(r.token)).send(legal).expect(200)).body.data;
    assert.equal(accepted.agreementVersion, 'test-v1'); assert.ok(Date.parse(accepted.acceptedAt) > Date.now() - 60000);
    await f.store.pool.query("UPDATE agreements SET is_active=false; INSERT INTO agreements(version,content,is_active) VALUES('test-v2','Changed',true)");
    await request(f.app).put(`${r.path}/legal`).set('Authorization', bearer(r.token)).send(legal).expect(409);
  } finally { await f.close(); }
});
test('submission serializes racing writes and freezes Submitted; rejection can reopen via Provider', async () => {
  const f = await fixture();
  try {
    await f.verify(); const r = await ready(f);
    const concurrent = await Promise.all([1, 2].map(() => request(f.app).post(`${r.path}/submit-review`).set('Authorization', bearer(r.token)).send({})));
    assert.deepEqual(concurrent.map(r => r.status).sort(), [200, 409]);
    await request(f.app).put(r.path).set('Authorization', bearer(r.token)).send(metadata).expect(409);
    await request(f.app).post(`${r.path}/plans`).set('Authorization', bearer(r.token)).send(free).expect(409);
    await request(f.app).delete(r.path).set('Authorization', bearer(r.token)).expect(409);
    // Simulate Admin workflow only inside fixture; no Admin production code implemented here.
    await f.store.pool.query("UPDATE apis SET status='Under Review' WHERE id=$1", [r.api.id]);
    await f.store.pool.query("UPDATE apis SET status='Rejected' WHERE id=$1", [r.api.id]);
    const reopened = await request(f.app).post(`${r.path}/reopen`).set('Authorization', bearer(r.token)).send({}).expect(200);
    assert.equal(reopened.body.data.status, 'Draft');
  } finally { await f.close(); }
});
test('manual endpoint changes invalidate docs and migration + seed rerun retain demo rows', async () => {
  const f = await fixture();
  try {
    await f.verify(); const r = await ready(f);
    await request(f.app).post(`${r.path}/endpoints`).set('Authorization', bearer(r.token)).send({ versionId: r.version.id, method: 'GET', path: '/extra', description: 'Extra' }).expect(201);
    await request(f.app).post(`${r.path}/submit-review`).set('Authorization', bearer(r.token)).send({}).expect(400);
    // Fixture agreement is separate from Danh demo agreement; retire it explicitly in test DB.
    await f.store.pool.query('UPDATE agreements SET is_active=false');
    await f.store.migrate(true, true); await f.store.migrate(true, true);
    assert.equal((await f.store.pool.query('SELECT COUNT(*)::int AS n FROM backend_schema_migrations')).rows[0].n, 4);
    assert.equal((await f.store.pool.query("SELECT COUNT(*)::int AS n FROM apis WHERE name IN ('Weather Now API','Currency Rates API','Product Catalog API')")).rows[0].n, 3);
  } finally { await f.close(); }
});
