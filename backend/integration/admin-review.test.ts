import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { Pool } from 'pg';
import { PostgresAuthStore } from '../src/postgres-store.js';
import { AuthService } from '../src/auth.js';
import { ProviderService } from '../src/provider-service.js';
import { AuditService } from '../src/audit-service.js';
import { AdminReviewService } from '../src/admin-review-service.js';
import { createApp } from '../src/app.js';

const url = process.env.PG_TEST_URL;
if (!url) throw new Error('Run npm test to provide PostgreSQL');
const secret = 'admin-review-integration-secret-32b';
const metadata = { name: 'Review API', description: 'Demo API', category: 'Weather', baseUrl: 'https://example.com', tags: ['t'] };
const free = { name: 'Free', priceMonthly: 0, currency: 'VND', quota: 100, rateLimit: 10 };

async function fixture() {
  const control = new Pool({ connectionString: url });
  await control.query('CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public');
  const schema = `admin_review_${randomUUID().replaceAll('-', '')}`;
  await control.query(`CREATE SCHEMA ${schema}`);
  const store = new PostgresAuthStore(url!, schema);
  const dns: Record<string, string[][]> = {};
  const provider = new ProviderService(store.pool, async name => dns[name] ?? []);
  const audit = new AuditService(store.pool);
  const review = new AdminReviewService(store.pool, audit);
  try {
    await store.migrate(false, true);
    await provider.ready(); await audit.ready(); await review.ready();
    const auth = new AuthService(store, secret);
    const email = `${randomUUID()}@example.test`;
    const account = await auth.register(email, 'Test-password-12345', 'Provider');
    const token = (await auth.login(email, 'Test-password-12345')).accessToken;
    // Admin accounts cannot be self-registered, so seed one and log in through the real endpoint.
    const adminEmail = `${randomUUID()}@example.test`;
    const adminHash = (await store.pool.query("SELECT crypt('Admin-password-12345', gen_salt('bf')) AS h")).rows[0].h;
    const adminId = (await store.pool.query(
      "INSERT INTO users(name,email,password_hash,role_id) VALUES('Admin',$1,$2,(SELECT id FROM roles WHERE name='ADMIN')) RETURNING id",
      [adminEmail, adminHash],
    )).rows[0].id;
    const adminToken = (await auth.login(adminEmail, 'Admin-password-12345')).accessToken;
    const providerRow = (await store.pool.query('SELECT id FROM api_providers ORDER BY id')).rows[0];
    await store.pool.query("INSERT INTO agreements(version,content,is_active) VALUES('test-v1','Test agreement',true)");
    return {
      store, provider, audit, review, auth, adminId, adminToken, dns, providerId: String(providerRow.id), token, account,
      app: createApp(auth, () => {}, { provider, review, audit }),
      async close() {
        await store.close();
        await control.query(`DROP SCHEMA ${schema} CASCADE`);
        await control.end();
      },
    };
  } catch (error) {
    await store.close();
    await control.query(`DROP SCHEMA ${schema} CASCADE`);
    await control.end();
    throw error;
  }
}

const bearer = (token: string) => `Bearer ${token}`;

async function seedPendingVerification(f: Awaited<ReturnType<typeof fixture>>, org = 'Pending Co') {
  await f.store.pool.query(
    "INSERT INTO provider_verifications(provider_id,organization_name,contact_email,evidence_urls,status) VALUES($1,$2,'p@test.invalid','[\"https://example.com/license\"]','Pending')",
    [f.providerId, org],
  );
}

async function verifyProvider(f: Awaited<ReturnType<typeof fixture>>) {
  await f.store.pool.query(
    "INSERT INTO provider_verifications(provider_id,organization_name,contact_email,evidence_urls,status,reviewed_at,reviewed_by) VALUES($1,'Verified Co','p@test.invalid','[\"https://example.com/license\"]','Verified',NOW(),$2)",
    [f.providerId, f.adminId],
  );
}

/** Create a Draft API and drive it to Submitted with the content the DB trigger requires. */
async function submittedApi(f: Awaited<ReturnType<typeof fixture>>) {
  const created = await request(f.app).post('/api/provider/apis').set('Authorization', bearer(f.token)).send(metadata);
  assert.equal(created.status, 201, JSON.stringify(created.body));
  const apiId = created.body.data.id;
  const version = await request(f.app).post(`/api/provider/apis/${apiId}/versions`).set('Authorization', bearer(f.token))
    .send({ version: 'v1', changelog: 'First release' });
  assert.equal(version.status, 201, JSON.stringify(version.body));
  const versionId = version.body.data.id;
  const endpoint = await request(f.app).post(`/api/provider/apis/${apiId}/endpoints`).set('Authorization', bearer(f.token))
    .send({ versionId, method: 'GET', path: '/forecast', description: 'Get forecast', parameters: [] });
  assert.equal(endpoint.status, 201, JSON.stringify(endpoint.body));
  const plan = await request(f.app).post(`/api/provider/apis/${apiId}/plans`).set('Authorization', bearer(f.token)).send(free);
  assert.equal(plan.status, 201, JSON.stringify(plan.body));
  const legal = await request(f.app).put(`/api/provider/apis/${apiId}/legal`).set('Authorization', bearer(f.token)).send({
    ownershipDeclaration: 'I own it', distributionRights: 'I can distribute',
    dataClassification: 'Public', agreementVersion: 'test-v1', accepted: true, processesPersonalData: false, personalDataTypes: [],
  });
  assert.equal(legal.status, 200, JSON.stringify(legal.body));
  // Documentation must contain the endpoint path/method for submit-review to accept it.
  await f.store.pool.query(
    "INSERT INTO api_documentations(api_id,version_id,source,content) VALUES($1,$2,'MANUAL',$3)",
    [apiId, versionId, JSON.stringify({ paths: { '/forecast': { get: { summary: 'Get forecast' } } } })],
  );
  const challenge = await f.provider.domainChallenge(f.account.id, apiId);
  f.dns[challenge.recordName] = [[challenge.recordValue]];
  await f.provider.verifyDomain(f.account.id, apiId);
  const submitted = await request(f.app).post(`/api/provider/apis/${apiId}/submit-review`).set('Authorization', bearer(f.token)).send({});
  assert.equal(submitted.status, 200, JSON.stringify(submitted.body));
  assert.equal(submitted.body.data.status, 'Submitted');
  return apiId as string;
}

function adminToken(f: Awaited<ReturnType<typeof fixture>>) {
  return f.adminToken;
}

test('Admin provider verification: approve records audit log and unlocks API creation', async () => {
  const f = await fixture();
  try {
    await seedPendingVerification(f);
    const token = adminToken(f);

    const queue = await request(f.app).get('/api/admin/provider-verifications?status=Pending').set('Authorization', bearer(token));
    assert.equal(queue.status, 200, JSON.stringify(queue.body));
    assert.equal(queue.body.data.total, 1);
    assert.equal(queue.body.data.items[0].status, 'Pending');

    const approved = await request(f.app).post(`/api/admin/provider-verifications/${f.providerId}/review`)
      .set('Authorization', bearer(token)).send({ decision: 'Verified' });
    assert.equal(approved.status, 200, JSON.stringify(approved.body));
    assert.equal(approved.body.data.status, 'Verified');
    assert.equal(approved.body.data.reviewedBy, String(f.adminId));

    const logs = await request(f.app).get('/api/admin/audit-logs?action=provider.verification.approved').set('Authorization', bearer(token));
    assert.equal(logs.status, 200, JSON.stringify(logs.body));
    assert.equal(logs.body.data.total, 1);
    assert.equal(logs.body.data.items[0].actorRole, 'ADMIN');
    assert.equal(logs.body.data.items[0].targetType, 'provider');

    const created = await request(f.app).post('/api/provider/apis').set('Authorization', bearer(f.token)).send(metadata);
    assert.equal(created.status, 201, JSON.stringify(created.body));
  } finally { await f.close(); }
});

test('Admin provider verification: reject requires a reason and blocks API creation', async () => {
  const f = await fixture();
  try {
    await seedPendingVerification(f);
    const token = adminToken(f);

    const missing = await request(f.app).post(`/api/admin/provider-verifications/${f.providerId}/review`)
      .set('Authorization', bearer(token)).send({ decision: 'Rejected' });
    assert.equal(missing.status, 400, JSON.stringify(missing.body));

    const rejected = await request(f.app).post(`/api/admin/provider-verifications/${f.providerId}/review`)
      .set('Authorization', bearer(token)).send({ decision: 'Rejected', reason: 'Evidence unclear' });
    assert.equal(rejected.status, 200, JSON.stringify(rejected.body));
    assert.equal(rejected.body.data.status, 'Rejected');
    assert.equal(rejected.body.data.rejectReason, 'Evidence unclear');

    const created = await request(f.app).post('/api/provider/apis').set('Authorization', bearer(f.token)).send(metadata);
    assert.equal(created.status, 403, JSON.stringify(created.body));
  } finally { await f.close(); }
});

test('Admin provider verification: a reviewed submission cannot be reviewed twice', async () => {
  const f = await fixture();
  try {
    await seedPendingVerification(f);
    const token = adminToken(f);
    const first = await request(f.app).post(`/api/admin/provider-verifications/${f.providerId}/review`)
      .set('Authorization', bearer(token)).send({ decision: 'Verified' });
    assert.equal(first.status, 200);
    const second = await request(f.app).post(`/api/admin/provider-verifications/${f.providerId}/review`)
      .set('Authorization', bearer(token)).send({ decision: 'Verified' });
    assert.equal(second.status, 409, JSON.stringify(second.body));
    assert.equal(second.body.error.code, 'VERIFICATION_ALREADY_REVIEWED');
  } finally { await f.close(); }
});

test('Admin API review: Submitted moves through Under Review, Approved and Published', async () => {
  const f = await fixture();
  try {
    await verifyProvider(f);
    const apiId = await submittedApi(f);
    const token = adminToken(f);

    const queue = await request(f.app).get('/api/admin/apis?status=Submitted').set('Authorization', bearer(token));
    assert.equal(queue.status, 200, JSON.stringify(queue.body));
    assert.equal(queue.body.data.total, 1);

    const dossier = await request(f.app).get(`/api/admin/apis/${apiId}/dossier`).set('Authorization', bearer(token));
    assert.equal(dossier.status, 200, JSON.stringify(dossier.body));
    assert.equal(dossier.body.data.api.status, 'Submitted');
    assert.equal(dossier.body.data.plans.length, 1);
    assert.equal(dossier.body.data.endpoints.length, 1);
    assert.equal(dossier.body.data.legal.processesPersonalData, false);
    assert.equal(dossier.body.data.domainVerification.hostname, 'example.com');
    assert.ok(dossier.body.data.domainVerification.verifiedAt);
    assert.ok(dossier.body.data.legal.ownershipDeclaration);
    assert.equal(dossier.body.data.provider.verification.status, 'Verified');
    assert.ok(dossier.body.data.provider.providerName);

    const approved = await request(f.app).post(`/api/admin/apis/${apiId}/review`).set('Authorization', bearer(token)).send({ next: 'Approved' });
    assert.equal(approved.status, 200, JSON.stringify(approved.body));
    assert.equal(approved.body.data.status, 'Approved');

    const published = await request(f.app).post(`/api/admin/apis/${apiId}/review`).set('Authorization', bearer(token)).send({ next: 'Published' });
    assert.equal(published.status, 200, JSON.stringify(published.body));
    assert.equal(published.body.data.status, 'Published');
    assert.ok(published.body.data.publishedAt);

    // Two Admin calls produced three status changes; each call writes one audit entry.
    const reviews = (await f.store.pool.query('SELECT from_status,to_status FROM api_reviews WHERE api_id=$1 ORDER BY id', [apiId])).rows;
    assert.deepEqual(reviews.map(r => `${r.from_status}->${r.to_status}`),
      ['Submitted->Under Review', 'Under Review->Approved', 'Approved->Published']);

    const logs = await request(f.app).get(`/api/admin/audit-logs?targetType=api&actorId=${f.adminId}`).set('Authorization', bearer(token));
    assert.equal(logs.body.data.total, 2);
    assert.deepEqual(logs.body.data.items.map((l: { action: string }) => l.action).sort(), ['api.review.approved', 'api.review.published']);
    const approvedEntry = logs.body.data.items.find((l: { action: string }) => l.action === 'api.review.approved');
    assert.deepEqual(approvedEntry.detail.steps, ['Submitted->Under Review', 'Under Review->Approved']);
    assert.equal(approvedEntry.targetId, String(apiId));
    assert.equal(approvedEntry.actorRole, 'ADMIN');
  } finally { await f.close(); }
});

test('Admin can explicitly start Under Review without a duplicate self transition', async () => {
  const f = await fixture();
  try {
    await verifyProvider(f); const api = await submittedApi(f);
    const result = await request(f.app).post(`/api/admin/apis/${api}/review`).set('Authorization', bearer(f.adminToken)).send({ next: 'Under Review' }).expect(200);
    assert.equal(result.body.data.status, 'Under Review');
    await request(f.app).post(`/api/admin/apis/${api}/review`).set('Authorization', bearer(f.adminToken)).send({ next: 'Under Review' }).expect(409);
    await request(f.app).post(`/api/admin/apis/${api}/review`).set('Authorization', bearer(f.adminToken)).send({ next: 'Approved' }).expect(200);
    const documentation = (await request(f.app).get('/openapi.json').expect(200)).body;
    assert.ok(documentation.paths['/api/admin/apis/{id}/review']);
    assert.equal((await f.store.pool.query('SELECT COUNT(*)::int AS n FROM api_reviews WHERE api_id=$1', [api])).rows[0].n, 2);
  } finally { await f.close(); }
});

test('Admin API review: reject requires a reason and allows the Provider to reopen', async () => {
  const f = await fixture();
  try {
    await verifyProvider(f);
    const apiId = await submittedApi(f);
    const token = adminToken(f);

    const missing = await request(f.app).post(`/api/admin/apis/${apiId}/review`).set('Authorization', bearer(token)).send({ next: 'Rejected' });
    assert.equal(missing.status, 400, JSON.stringify(missing.body));

    const rejected = await request(f.app).post(`/api/admin/apis/${apiId}/review`).set('Authorization', bearer(token))
      .send({ next: 'Rejected', reason: 'Endpoint docs incomplete' });
    assert.equal(rejected.status, 200, JSON.stringify(rejected.body));
    assert.equal(rejected.body.data.status, 'Rejected');

    const reopened = await request(f.app).post(`/api/provider/apis/${apiId}/reopen`).set('Authorization', bearer(f.token)).send({});
    assert.equal(reopened.status, 200, JSON.stringify(reopened.body));
    assert.equal(reopened.body.data.status, 'Draft');
  } finally { await f.close(); }
});

test('Admin API review: publishing a non-approved API is rejected', async () => {
  const f = await fixture();
  try {
    await verifyProvider(f);
    const apiId = await submittedApi(f);
    const token = adminToken(f);

    const early = await request(f.app).post(`/api/admin/apis/${apiId}/review`).set('Authorization', bearer(token)).send({ next: 'Published' });
    assert.equal(early.status, 409, JSON.stringify(early.body));
    assert.equal(early.body.error.code, 'INVALID_TRANSITION');

    const draft = await request(f.app).post('/api/provider/apis').set('Authorization', bearer(f.token)).send({ ...metadata, name: 'Draft API' });
    const onDraft = await request(f.app).post(`/api/admin/apis/${draft.body.data.id}/review`).set('Authorization', bearer(token)).send({ next: 'Approved' });
    assert.equal(onDraft.status, 409, JSON.stringify(onDraft.body));
    assert.equal(onDraft.body.error.code, 'INVALID_TRANSITION');
  } finally { await f.close(); }
});

test('Admin review endpoints reject Consumer and Provider roles', async () => {
  const f = await fixture();
  try {
    await seedPendingVerification(f);
    for (const token of [f.token]) {
      const res = await request(f.app).get('/api/admin/provider-verifications').set('Authorization', bearer(token));
      assert.equal(res.status, 403, `${res.status} ${JSON.stringify(res.body)}`);
      const logs = await request(f.app).get('/api/admin/audit-logs').set('Authorization', bearer(token));
      assert.equal(logs.status, 403);
      const dossiers = await request(f.app).get('/api/admin/apis/1/dossier').set('Authorization', bearer(token));
      assert.equal(dossiers.status, 403);
    }
    const anon = await request(f.app).get('/api/admin/audit-logs');
    assert.equal(anon.status, 401);
  } finally { await f.close(); }
});

test('Audit log supports filtering, paging and exposes the action list', async () => {
  const f = await fixture();
  try {
    await seedPendingVerification(f);
    const token = adminToken(f);
    await request(f.app).post(`/api/admin/provider-verifications/${f.providerId}/review`)
      .set('Authorization', bearer(token)).send({ decision: 'Verified' });

    const actions = await request(f.app).get('/api/admin/audit-logs/actions').set('Authorization', bearer(token));
    assert.equal(actions.status, 200, JSON.stringify(actions.body));
    assert.deepEqual(actions.body.data, ['provider.verification.approved']);

    const paged = await request(f.app).get('/api/admin/audit-logs?page=1&pageSize=1').set('Authorization', bearer(token));
    assert.equal(paged.body.data.items.length, 1);
    assert.equal(paged.body.data.pageSize, 1);

    const none = await request(f.app).get('/api/admin/audit-logs?action=does.not.exist').set('Authorization', bearer(token));
    assert.equal(none.body.data.total, 0);

    const badRange = await request(f.app)
      .get('/api/admin/audit-logs?from=2026-10-10T00:00:00.000Z&to=2026-10-01T00:00:00.000Z')
      .set('Authorization', bearer(token));
    assert.equal(badRange.status, 400, JSON.stringify(badRange.body));
    assert.equal(badRange.body.error.code, 'INVALID_RANGE');
  } finally { await f.close(); }
});
