import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import request from 'supertest';
import { PostgresAuthStore } from '../src/postgres-store.js';
import { AuthService } from '../src/auth.js';
import { createApp } from '../src/app.js';
import { ReportService } from '../src/report-service.js';

const database = process.env.PG_TEST_URL;
if (!database) throw new Error('Use npm test for disposable PostgreSQL');

async function fixture() {
  const control = new Pool({ connectionString: database });
  const schema = `reports_${randomUUID().replaceAll('-', '')}`;
  await control.query(`CREATE SCHEMA ${schema}`);
  const store = new PostgresAuthStore(database!, schema);
  const close = async () => { await store.close(); await control.query(`DROP SCHEMA ${schema} CASCADE`); await control.end(); };
  try {
    await store.migrate(false, true);
    const auth = new AuthService(store, 'reports-tests-secret-at-least-32-bytes');
    await auth.register('consumer@reports.test', 'Test-password-12345!', 'Consumer');
    await auth.register('other@reports.test', 'Test-password-12345!', 'Consumer');
    await auth.register('provider@reports.test', 'Test-password-12345!', 'Provider');
    const consumer = await auth.login('consumer@reports.test', 'Test-password-12345!');
    const other = await auth.login('other@reports.test', 'Test-password-12345!');
    const provider = (await store.pool.query("SELECT p.id FROM api_providers p JOIN users u ON u.id=p.user_id WHERE u.email='provider@reports.test'")).rows[0].id;
    // Register normally, then promote to Admin so the account has a usable password hash.
    await auth.register('admin@reports.test', 'Test-password-12345!', 'Consumer');
    await store.pool.query("UPDATE users SET role_id=(SELECT id FROM roles WHERE name='ADMIN') WHERE email='admin@reports.test'");
    const admin = (await store.pool.query("SELECT id FROM users WHERE email='admin@reports.test'")).rows[0].id;
    const adminSession = await auth.login('admin@reports.test', 'Test-password-12345!');
    await store.pool.query("INSERT INTO provider_verifications(provider_id,organization_name,contact_email,evidence_urls,status,reviewed_at,reviewed_by) VALUES($1,'API Co','p@reports.test','[\"https://example.com/proof\"]','Verified',NOW(),$2)", [provider, admin]);

    const api = String((await store.pool.query("INSERT INTO apis(provider_id,name,description,category,base_url) VALUES($1,'Weather','Forecast','Weather','https://api.example.com') RETURNING id", [provider])).rows[0].id);
    for (const state of ['Submitted', 'Under Review', 'Approved', 'Published']) await store.pool.query('UPDATE apis SET status=$1 WHERE id=$2', [state, api]);

    const reports = new ReportService(store.pool);
    const app = createApp(auth, () => {}, { reports });
    return { store, api, reports, app, consumer, other, admin: { accessToken: adminSession.accessToken }, close };
  } catch (error) { await close(); throw error; }
}

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });
const validReport = { category: 'Malicious Data' as const, description: 'API returns injected content to users' };

test('a Consumer files a report against a Published API', async () => {
  const f = await fixture();
  try {
    const created = await request(f.app).post(`/api/consumer/reports/${f.api}`)
      .set(bearer(f.consumer.accessToken)).send(validReport).expect(201);
    assert.equal(created.body.data.status, 'Pending');
    assert.equal(created.body.data.category, 'Malicious Data');

    const mine = await request(f.app).get('/api/consumer/reports')
      .set(bearer(f.consumer.accessToken)).expect(200);
    assert.equal(mine.body.data.total, 1);
  } finally { await f.close(); }
});

test('reporting requires a Published API and a valid category', async () => {
  const f = await fixture();
  try {
    await request(f.app).post(`/api/consumer/reports/${f.api}`)
      .set(bearer(f.consumer.accessToken)).send({ category: 'Not a category', description: 'x'.repeat(20) }).expect(400);
    await request(f.app).post(`/api/consumer/reports/${f.api}`)
      .set(bearer(f.consumer.accessToken)).send({ category: 'Malicious Data', description: 'short' }).expect(400);

    await f.store.pool.query("UPDATE apis SET status='Suspended' WHERE id=$1", [f.api]);
    await request(f.app).post(`/api/consumer/reports/${f.api}`)
      .set(bearer(f.consumer.accessToken)).send(validReport).expect(404);
  } finally { await f.close(); }
});

test('a Consumer only sees their own reports', async () => {
  const f = await fixture();
  try {
    await request(f.app).post(`/api/consumer/reports/${f.api}`)
      .set(bearer(f.consumer.accessToken)).send(validReport).expect(201);
    const otherList = await request(f.app).get('/api/consumer/reports')
      .set(bearer(f.other.accessToken)).expect(200);
    assert.equal(otherList.body.data.total, 0);
  } finally { await f.close(); }
});

test('Suspending a reported API blocks it and closes the report', async () => {
  const f = await fixture();
  try {
    const created = await request(f.app).post(`/api/consumer/reports/${f.api}`)
      .set(bearer(f.consumer.accessToken)).send(validReport).expect(201);

    const queue = await request(f.app).get('/api/admin/reports')
      .set(bearer(f.admin.accessToken)).expect(200);
    assert.equal(queue.body.data.total, 1);

    const decision = await request(f.app).post(`/api/admin/reports/${created.body.data.id}/review`)
      .set(bearer(f.admin.accessToken)).send({ action: 'Suspend', note: 'Confirmed malicious payload' }).expect(200);
    assert.equal(decision.body.data.status, 'Resolved');

    const api = (await f.store.pool.query('SELECT status FROM apis WHERE id=$1', [f.api])).rows[0];
    assert.equal(api.status, 'Suspended');

    // A decided report cannot be decided twice.
    await request(f.app).post(`/api/admin/reports/${created.body.data.id}/review`)
      .set(bearer(f.admin.accessToken)).send({ action: 'Dismiss', note: 'duplicate' }).expect(409);
  } finally { await f.close(); }
});

test('Restore brings a suspended API back through the same report, keeping its publication date', async () => {
  const f = await fixture();
  try {
    const before = new Date((await f.store.pool.query('SELECT published_at FROM apis WHERE id=$1', [f.api])).rows[0].published_at).toISOString();

    const created = await request(f.app).post(`/api/consumer/reports/${f.api}`)
      .set(bearer(f.consumer.accessToken)).send(validReport).expect(201);
    const reportId = created.body.data.id;

    // Suspend closes the report but the API must remain recoverable through that same case.
    await request(f.app).post(`/api/admin/reports/${reportId}/review`)
      .set(bearer(f.admin.accessToken)).send({ action: 'Suspend', note: 'Investigate' }).expect(200);
    assert.equal((await f.store.pool.query('SELECT status FROM apis WHERE id=$1', [f.api])).rows[0].status, 'Suspended');

    const restored = await request(f.app).post(`/api/admin/reports/${reportId}/review`)
      .set(bearer(f.admin.accessToken)).send({ action: 'Restore', note: 'Cleared' }).expect(200);
    assert.equal(restored.body.data.status, 'Resolved');
    // The follow-up decision is appended, so the original Suspend stays auditable.
    assert.match(String(restored.body.data.actionTaken), /Suspend: Investigate/);
    assert.match(String(restored.body.data.actionTaken), /Restore: Cleared/);

    assert.equal((await f.store.pool.query('SELECT status FROM apis WHERE id=$1', [f.api])).rows[0].status, 'Published');
    const after = new Date((await f.store.pool.query('SELECT published_at FROM apis WHERE id=$1', [f.api])).rows[0].published_at).toISOString();
    assert.equal(after, before, 'the original publication timestamp must survive suspend/restore');
  } finally { await f.close(); }
});

test('rejects malformed ids and pagination instead of failing in PostgreSQL', async () => {
  const f = await fixture();
  try {
    await request(f.app).post('/api/consumer/reports/abc')
      .set(bearer(f.consumer.accessToken)).send(validReport).expect(400);
    await request(f.app).post('/api/admin/reports/abc/review')
      .set(bearer(f.admin.accessToken)).send({ action: 'Dismiss', note: 'x' }).expect(400);
    await request(f.app).get('/api/admin/reports?page=Infinity')
      .set(bearer(f.admin.accessToken)).expect(400);
    await request(f.app).get('/api/admin/reports?page=1.5')
      .set(bearer(f.admin.accessToken)).expect(400);
    await request(f.app).get('/api/admin/reports?status=Bogus')
      .set(bearer(f.admin.accessToken)).expect(400);
  } finally { await f.close(); }
});

test('audit records the resulting API status for a moderation decision', async () => {
  const f = await fixture();
  try {
    const created = await request(f.app).post(`/api/consumer/reports/${f.api}`)
      .set(bearer(f.consumer.accessToken)).send(validReport).expect(201);
    await request(f.app).post(`/api/admin/reports/${created.body.data.id}/review`)
      .set(bearer(f.admin.accessToken)).send({ action: 'Suspend', note: 'Abuse confirmed' }).expect(200);

    const log = (await f.store.pool.query(
      "SELECT detail FROM audit_logs WHERE action='report.suspend' ORDER BY id DESC LIMIT 1"
    )).rows[0];
    assert.equal(log.detail.from, 'Published');
    // The decision took effect, so the audit must record the state the API ended in.
    assert.equal(log.detail.to, 'Suspended');
  } finally { await f.close(); }
});

test('Dismiss closes a report without touching the API', async () => {
  const f = await fixture();
  try {
    const created = await request(f.app).post(`/api/consumer/reports/${f.api}`)
      .set(bearer(f.consumer.accessToken)).send(validReport).expect(201);
    await request(f.app).post(`/api/admin/reports/${created.body.data.id}/review`)
      .set(bearer(f.admin.accessToken)).send({ action: 'Dismiss', note: 'No evidence of abuse' }).expect(200);

    const api = (await f.store.pool.query('SELECT status FROM apis WHERE id=$1', [f.api])).rows[0];
    assert.equal(api.status, 'Published');
  } finally { await f.close(); }
});

test('moderation is restricted to Admins', async () => {
  const f = await fixture();
  try {
    const created = await request(f.app).post(`/api/consumer/reports/${f.api}`)
      .set(bearer(f.consumer.accessToken)).send(validReport).expect(201);
    await request(f.app).post(`/api/admin/reports/${created.body.data.id}/review`)
      .set(bearer(f.consumer.accessToken)).send({ action: 'Suspend', note: 'self-service' }).expect(403);
    await request(f.app).get('/api/admin/reports').set(bearer(f.consumer.accessToken)).expect(403);
  } finally { await f.close(); }
});
test('rejects ids beyond the PostgreSQL column range instead of failing in the driver', async () => {
  const f = await fixture();
  try {
    // apis.id is INTEGER: 2147483648 overflows it.
    await request(f.app).post('/api/consumer/reports/2147483648')
      .set(bearer(f.consumer.accessToken)).send(validReport).expect(400);
    // reports.id is BIGINT: 9223372036854775808 overflows it.
    await request(f.app).post('/api/admin/reports/9223372036854775808/review')
      .set(bearer(f.admin.accessToken)).send({ action: 'Dismiss', note: 'x' }).expect(400);
    // A very long numeric string must also be a 400, not a driver error.
    await request(f.app).post('/api/consumer/reports/999999999999999999999999999')
      .set(bearer(f.consumer.accessToken)).send(validReport).expect(400);
  } finally { await f.close(); }
});

test('publishes the report routes in the OpenAPI document', async () => {
  const f = await fixture();
  try {
    const spec = await request(f.app).get('/openapi.json').expect(200);
    for (const path of ['/api/consumer/reports', '/api/consumer/reports/{apiId}', '/api/admin/reports', '/api/admin/reports/{id}/review']) {
      assert.ok(spec.body.paths[path], 'missing OpenAPI path ' + path);
    }
  } finally { await f.close(); }
});
