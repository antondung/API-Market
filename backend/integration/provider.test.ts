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
import { createTxtLookup, domainHostname } from '../src/provider-dns.js';
import { createSocket } from 'node:dgram';

const url = process.env.PG_TEST_URL;
if (!url) throw new Error('Run npm test to provide PostgreSQL');
const secret = 'provider-integration-secret-with-32-bytes';
const metadata = { name: 'Test API', description: 'Demo', category: 'Weather', baseUrl: 'https://example.com', tags: ['test'] };
const free = { name: 'Free', priceMonthly: 0, currency: 'VND', quota: 100, rateLimit: 10 };
const legal = { ownershipDeclaration: 'I own it', distributionRights: 'I can distribute', dataClassification: 'Public', agreementVersion: 'test-v1', accepted: true, processesPersonalData: false, personalDataTypes: [] };
const spec = readFileSync('backend/test/fixtures/provider-import.openapi.yaml', 'utf8');
async function fixture() {
  const control = new Pool({ connectionString: url });
  await control.query('CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public');
  const schema = `provider_test_${randomUUID().replaceAll('-', '')}`;
  await control.query(`CREATE SCHEMA ${schema}`);
  const store = new PostgresAuthStore(url!, schema);
  const dns: Record<string, string[][]> = {};
  const service = new ProviderService(store.pool, async name => dns[name] ?? []);
  try {
    await store.migrate(false, true); await service.ready();
    const auth = new AuthService(store, secret);
    const users: { id: string; token: string }[] = [];
    for (const role of ['Provider', 'Provider', 'Consumer'] as const) {
      const email = `${randomUUID()}@example.test`;
      const user = await auth.register(email, 'Test-password-12345', role);
      users.push({ id: user.id, token: (await auth.login(email, 'Test-password-12345')).accessToken });
    }
    const admin = (await store.pool.query("INSERT INTO users(name,email,password_hash,role_id) VALUES('Admin','admin@test.invalid','unused',(SELECT id FROM roles WHERE name='ADMIN')) RETURNING id")).rows[0].id;
    const providers = (await store.pool.query('SELECT id,user_id FROM api_providers ORDER BY id')).rows;
    await store.pool.query("INSERT INTO agreements(version,content,is_active) VALUES('test-v1','Test agreement',true)");
    return { store, service, auth, dns, app: createApp(auth, () => {}, { provider: service }), users, providers, admin,
      async prove(api: string, user = users[0]!) {
        const challenge = await service.domainChallenge(user.id, api);
        dns[challenge.recordName] = [[challenge.recordValue]];
        return service.verifyDomain(user.id, api);
      },
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
  await f.prove(record.api.id);
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
    const rejected = await request(f.app).get('/api/provider/verification').set('Authorization', bearer(token)).expect(200);
    assert.equal(rejected.body.data.reviewedBy, String(f.admin));
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
    assert.equal((await f.store.pool.query('SELECT COUNT(*)::int AS n FROM backend_schema_migrations')).rows[0].n, 6);
    assert.equal((await f.store.pool.query("SELECT COUNT(*)::int AS n FROM apis WHERE name IN ('Weather Now API','Currency Rates API','Product Catalog API')")).rows[0].n, 3);
  } finally { await f.close(); }
});

test('truncated multipart is a client error instead of 500', async () => {
  const f = await fixture();
  try {
    await f.verify(); const r = await create(f);
    await request(f.app).post(`${r.path}/import-openapi`).set('Authorization', bearer(r.token))
      .set('Content-Type', 'multipart/form-data; boundary=broken')
      .send('--broken\r\nContent-Disposition: form-data; name="file"; filename="x.yaml"\r\n\r\nopenapi: 3.0.3').expect(400);
  } finally { await f.close(); }
});

test('invalid NUL characters cannot turn Provider input or imported JSONB into server errors', async () => {
  const f = await fixture();
  try {
    await f.verify(); const r = await create(f);
    await request(f.app).put(r.path).set('Authorization', bearer(r.token)).send({ ...metadata, name: 'Bad\u0000name' }).expect(400);
    const input = JSON.parse(readFileSync('mock-services/weather/openapi.json', 'utf8'));
    input.info.description = 'Bad\u0000description';
    await request(f.app).post(`${r.path}/import-openapi`).set('Authorization', bearer(r.token))
      .field('versionId', r.version.id).attach('file', Buffer.from(JSON.stringify(input)), 'demo.json').expect(400);
  } finally { await f.close(); }
});

test('manual content edits clear cached version OpenAPI and submission requires docs for every endpoint', async () => {
  const f = await fixture();
  try {
    await f.verify(); const r = await ready(f);
    await request(f.app).post(`${r.path}/endpoints`).set('Authorization', bearer(r.token)).send({ versionId: r.version.id, method: 'GET', path: '/extra', description: 'Extra' }).expect(201);
    const versions = await request(f.app).get(`${r.path}/versions`).set('Authorization', bearer(r.token)).expect(200);
    assert.equal(versions.body.data[0].openapiDocument, null);
    // Reimport v1, then add an endpoint in v2. A valid v1 must not hide undocumented v2.
    await request(f.app).post(`${r.path}/import-openapi`).set('Authorization', bearer(r.token)).field('versionId', r.version.id).attach('file', Buffer.from(spec), 'demo.yaml').expect(200);
    const v2 = await f.service.addVersion(f.users[0]!.id, r.api.id, { version: 'v2', changelog: 'Second' });
    await f.store.pool.query("INSERT INTO api_endpoints(api_id,version_id,method,path,description) VALUES($1,$2,'GET','/undocumented','Missing docs')", [r.api.id, v2.id]);
    await request(f.app).post(`${r.path}/submit-review`).set('Authorization', bearer(r.token)).send({}).expect(400);
    await f.store.pool.query('DELETE FROM api_endpoints WHERE version_id=$1', [v2.id]);
    // An existing documentation row with no operations is still incomplete.
    await f.store.pool.query("UPDATE api_documentations SET content='{\"openapi\":\"3.0.3\",\"info\":{\"title\":\"Placeholder\",\"version\":\"v1\"}}'::jsonb WHERE api_id=$1", [r.api.id]);
    await request(f.app).post(`${r.path}/submit-review`).set('Authorization', bearer(r.token)).send({}).expect(400);
  } finally { await f.close(); }
});

test('personal data declaration persists explicit yes/no, types and purpose with strict validation', async () => {
  const f = await fixture();
  try {
    await f.verify(); const r = await create(f);
    const input = { ...legal, processesPersonalData: true, personalDataTypes: ['Email', 'Phone'], dataProcessingPurpose: 'Account contact and support' };
    const saved = await request(f.app).put(`${r.path}/legal`).set('Authorization', bearer(r.token)).send(input).expect(200);
    assert.equal(saved.body.data.processesPersonalData, true);
    assert.deepEqual(saved.body.data.personalDataTypes, ['Email','Phone']);
    const loaded = await request(f.app).get(`${r.path}/legal`).set('Authorization', bearer(r.token)).expect(200);
    assert.equal(loaded.body.data.dataProcessingPurpose, input.dataProcessingPurpose);
    for (const patch of [{ personalDataTypes: [] }, { dataProcessingPurpose: '' }, { personalDataTypes: ['Email','Email'] }, { personalDataTypes: ['Unknown'] }, { processesPersonalData: false }]) {
      await request(f.app).put(`${r.path}/legal`).set('Authorization', bearer(r.token)).send({ ...input, ...patch }).expect(400);
    }
    const { processesPersonalData, ...missing } = legal;
    await request(f.app).put(`${r.path}/legal`).set('Authorization', bearer(r.token)).send(missing).expect(400);
    await request(f.app).put(`${r.path}/legal`).set('Authorization', bearer(r.token)).send(legal).expect(200);
    assert.equal((await f.service.legal(f.users[0]!.id, r.api.id))!.processesPersonalData, false);
  } finally { await f.close(); }
});

test('domain proof is random, hashed, bound to owner/API/host and cannot be forged by client', async () => {
  const f = await fixture();
  try {
    await f.verify(); const r = await create(f);
    await request(f.app).get(`${r.path}/domain-verification`).expect(401);
    await request(f.app).post(`${r.path}/domain-verification/challenge`).set('Authorization', bearer(f.users[2]!.token)).send({}).expect(403);
    await request(f.app).post(`${r.path}/domain-verification/challenge`).set('Authorization', bearer(f.users[1]!.token)).send({}).expect(404);
    await request(f.app).post(`${r.path}/domain-verification/challenge`).set('Authorization', bearer(r.token)).send({ verified: true }).expect(400);
    const proof = (await request(f.app).post(`${r.path}/domain-verification/challenge`).set('Authorization', bearer(r.token)).send({}).expect(201)).body.data;
    assert.equal(proof.recordName, '_apihub-verification.example.com');
    const stored = (await f.store.pool.query('SELECT * FROM api_domain_verifications WHERE api_id=$1', [r.api.id])).rows[0];
    assert.match(stored.token_hash, /^[a-f0-9]{64}$/); assert.ok(!JSON.stringify(stored).includes(proof.recordValue));
    await request(f.app).post(`${r.path}/domain-verification/verify`).set('Authorization', bearer(r.token)).send({}).expect(400);
    f.dns[proof.recordName] = [[proof.recordValue.slice(0, 25), proof.recordValue.slice(25)]];
    await request(f.app).post(`${r.path}/domain-verification/verify`).set('Authorization', bearer(r.token)).send({}).expect(200);
    const status = await request(f.app).get(`${r.path}/domain-verification`).set('Authorization', bearer(r.token)).expect(200);
    assert.equal(status.body.data.verified, true); assert.equal(status.body.data.recordValue, undefined);
    const second = await create(f, 'Another API same hostname');
    await f.service.domainChallenge(f.users[0]!.id, second.api.id);
    await assert.rejects(f.service.verifyDomain(f.users[0]!.id, second.api.id), (e: any) => e.code === 'DOMAIN_PROOF_MISMATCH');
    await request(f.app).put(r.path).set('Authorization', bearer(r.token)).send({ ...metadata, baseUrl: 'https://other.example.com' }).expect(200);
    assert.equal((await f.service.domainStatus(f.users[0]!.id, r.api.id)).verified, false);
  } finally { await f.close(); }
});

test('expired, rotated and in-flight replaced challenges never verify; DNS failures do not mark proof', async () => {
  const f = await fixture();
  try {
    await f.verify(); const r = await create(f); const actor = f.users[0]!.id;
    const first = await f.service.domainChallenge(actor, r.api.id);
    f.dns[first.recordName] = [[first.recordValue]];
    await f.store.pool.query("UPDATE api_domain_verifications SET challenge_expires_at=NOW()-INTERVAL '1 minute' WHERE api_id=$1", [r.api.id]);
    await assert.rejects(f.service.verifyDomain(actor, r.api.id), (e: any) => e.code === 'DOMAIN_CHALLENGE_EXPIRED');
    await f.service.domainChallenge(actor, r.api.id);
    await assert.rejects(f.service.verifyDomain(actor, r.api.id), (e: any) => e.code === 'DOMAIN_PROOF_MISMATCH');
    let complete!: (records: string[][]) => void;
    let started!: () => void;
    const lookupStarted = new Promise<void>(resolve => { started = resolve; });
    const slow = new ProviderService(f.store.pool, async () => { started(); return new Promise(resolve => { complete = resolve; }); });
    const current = await f.service.domainChallenge(actor, r.api.id);
    const pending = slow.verifyDomain(actor, r.api.id);
    await lookupStarted; await f.service.domainChallenge(actor, r.api.id);
    complete([[current.recordValue]]);
    await assert.rejects(pending, (e: any) => e.code === 'DOMAIN_CHALLENGE_CHANGED');
    const failure = new ProviderService(f.store.pool, async () => { throw Object.assign(new Error('timeout'), { code: 'ETIMEOUT' }); });
    await assert.rejects(failure.verifyDomain(actor, r.api.id), (e: any) => e.status === 503);
    assert.equal((await f.service.domainStatus(actor, r.api.id)).verified, false);
  } finally { await f.close(); }
});

test('submission requires current domain proof and explicit privacy declaration; proof expires and rotates', async () => {
  const f = await fixture();
  try {
    await f.verify(); const r = await ready(f); const actor = f.users[0]!.id;
    await f.store.pool.query("UPDATE api_domain_verifications SET verified_at=NOW()-INTERVAL '8 days',verification_expires_at=NOW()-INTERVAL '1 day' WHERE api_id=$1", [r.api.id]);
    await request(f.app).post(`${r.path}/submit-review`).set('Authorization', bearer(r.token)).send({}).expect(400);
    await f.prove(r.api.id);
    await f.store.pool.query('UPDATE api_legal_declarations SET processes_personal_data=NULL WHERE api_id=$1', [r.api.id]);
    await request(f.app).post(`${r.path}/submit-review`).set('Authorization', bearer(r.token)).send({}).expect(400);
    await request(f.app).put(`${r.path}/legal`).set('Authorization', bearer(r.token)).send(legal).expect(200);
    await f.service.domainChallenge(actor, r.api.id);
    await request(f.app).post(`${r.path}/submit-review`).set('Authorization', bearer(r.token)).send({}).expect(400);
    await f.prove(r.api.id);
    await request(f.app).post(`${r.path}/submit-review`).set('Authorization', bearer(r.token)).send({}).expect(200);
    await request(f.app).post(`${r.path}/domain-verification/challenge`).set('Authorization', bearer(r.token)).send({}).expect(409);
  } finally { await f.close(); }
});

test('domain verifier performs real DNS TXT transport; IP/localhost and credentials are rejected', async () => {
  const socket = createSocket('udp4');
  const f = await fixture();
  try {
    await f.verify(); const r = await create(f); const actor = f.users[0]!.id;
    const challenge = await f.service.domainChallenge(actor, r.api.id);
    await new Promise<void>(resolve => socket.bind(0, '127.0.0.1', resolve));
    let queries = 0;
    socket.on('message', (message, remote) => {
      queries++;
      const txt = Buffer.from(challenge.recordValue);
      const answer = Buffer.concat([Buffer.from([0xc0,0x0c, 0,16, 0,1, 0,0,0,30, 0,txt.length+1,txt.length]), txt]);
      const header = Buffer.from(message.subarray(0,12)); header.writeUInt16BE(0x8180,2); header.writeUInt16BE(1,6);
      socket.send(Buffer.concat([header,message.subarray(12),answer]), remote.port, remote.address);
    });
    const lookup = createTxtLookup([`127.0.0.1:${socket.address().port}`]);
    const service = new ProviderService(f.store.pool, lookup);
    assert.equal((await service.verifyDomain(actor, r.api.id)).verified, true);
    assert.equal(queries, 1);
    for (const value of ['http://127.0.0.1', 'http://[::1]', 'http://localhost', 'https://x.internal', 'https://user:pass@example.com']) assert.throws(() => domainHostname(value));
  } finally { try { socket.close(); } catch {} await f.close(); }
});

test('Provider audit writes are atomic and never include domain tokens or personal declarations', async () => {
  const f = await fixture();
  try {
    await f.verify(); const r = await ready(f);
    const entries = (await f.store.pool.query("SELECT * FROM audit_logs WHERE target_id=$1 AND actor_role='API_PROVIDER'", [r.api.id])).rows;
    for (const action of ['api.created','api.openapi.imported','api.legal.accepted','api.domain.challenge.created','api.domain.verified']) assert.ok(entries.some(e => e.action === action));
    assert.ok(!JSON.stringify(entries).includes('platform-verification='));
    assert.ok(!JSON.stringify(entries).includes(legal.ownershipDeclaration));
    await f.store.pool.query("CREATE FUNCTION fail_provider_audit() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'Injected audit failure'; END; $$ LANGUAGE plpgsql; CREATE TRIGGER fail_provider_audit BEFORE INSERT ON audit_logs FOR EACH ROW EXECUTE FUNCTION fail_provider_audit()");
    await request(f.app).put(r.path).set('Authorization', bearer(r.token)).send({ ...metadata, name: 'Should rollback' }).expect(500);
    assert.equal((await f.service.get(f.users[0]!.id, r.api.id)).name, 'Ready');
  } finally { await f.close(); }
});

test('rejection reason constraint rejects NULL, empty and blank reasons but accepts a real one', async () => {
  const f = await fixture();
  try {
    await f.verify();
    const providerId = f.providers[0]!.id;
    const record = await create(f, 'Rejection reason API');
    const insertVerification = (reason: string | null) => f.store.pool.query(
      "INSERT INTO provider_verifications(provider_id,organization_name,contact_email,evidence_urls,status,reviewed_at,reviewed_by,reject_reason) VALUES($1,'Org','a@b.test','[\"https://example.com/license\"]','Rejected',NOW(),$2,$3)",
      [providerId, f.admin, reason]);
    // LENGTH(BTRIM(NULL)) is NULL and PostgreSQL accepts a NULL CHECK, so NULL used to pass.
    for (const reason of [null, '', '   ']) {
      await assert.rejects(insertVerification(reason), (error: any) => error.code === '23514');
    }
    await insertVerification('Missing licence document');

    const insertReview = (reason: string | null) => f.store.pool.query(
      "INSERT INTO api_reviews(api_id,reviewer_id,from_status,to_status,reason) VALUES($1,$2,'Under Review','Rejected',$3)",
      [record.api.id, f.admin, reason]);
    for (const reason of [null, '', '   ']) {
      await assert.rejects(insertReview(reason), (error: any) => error.code === '23514');
    }
    await insertReview('Endpoint documentation is incomplete');
  } finally { await f.close(); }
});
