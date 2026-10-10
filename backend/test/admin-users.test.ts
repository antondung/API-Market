import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { AuthService } from '../src/auth.js';
import { MemoryAuthStore } from '../src/store.js';
import { createApp } from '../src/app.js';

const secret = 'test-only-secret-with-at-least-32-bytes';
const password = 'Example-password-2026';

function fixture() {
  const store = new MemoryAuthStore();
  const auth = new AuthService(store, secret);
  return { store, auth, app: createApp(auth) };
}

/** Tạo một Admin trực tiếp trong store vì API đăng ký công khai không cho tạo Admin. */
async function seedAdmin(f: ReturnType<typeof fixture>, email = 'admin@example.com') {
  const { hashPassword } = await import('../src/auth.js');
  await f.store.createUser({
    id: '1', email, passwordHash: await hashPassword(password), role: 'Admin', active: true, name: 'System Admin',
  });
  const result = await request(f.app).post('/api/auth/login').send({ email, password }).expect(200);
  return result.body.data;
}

async function seedUser(f: ReturnType<typeof fixture>, email: string, role: 'Consumer' | 'Provider' = 'Consumer') {
  await request(f.app).post('/api/auth/register').send({ email, password, role }).expect(201);
  const result = await request(f.app).post('/api/auth/login').send({ email, password }).expect(200);
  return result.body.data;
}

test('admin lists users with pagination and never exposes password hashes', async () => {
  const f = fixture();
  const admin = await seedAdmin(f);
  await seedUser(f, 'a@example.com');
  await seedUser(f, 'b@example.com', 'Provider');
  await seedUser(f, 'c@example.com');

  const result = await request(f.app)
    .get('/api/admin/users?page=1&pageSize=2')
    .auth(admin.accessToken, { type: 'bearer' })
    .expect(200);

  assert.equal(result.body.data.total, 4);
  assert.equal(result.body.data.items.length, 2);
  assert.equal(result.body.data.page, 1);
  assert.equal(result.body.data.pageSize, 2);
  for (const item of result.body.data.items) {
    assert.equal(item.passwordHash, undefined);
    assert.equal(typeof item.email, 'string');
    assert.equal(typeof item.active, 'boolean');
    assert.equal(typeof item.createdAt, 'string');
  }
});

test('admin search matches email and name case-insensitively', async () => {
  const f = fixture();
  const admin = await seedAdmin(f);
  await request(f.app).post('/api/auth/register').send({ email: 'alice@example.com', password, role: 'Consumer', name: 'Alice Nguyen' }).expect(201);
  await seedUser(f, 'bob@example.com');

  const byEmail = await request(f.app).get('/api/admin/users?search=ALICE').auth(admin.accessToken, { type: 'bearer' }).expect(200);
  assert.equal(byEmail.body.data.total, 1);
  assert.equal(byEmail.body.data.items[0].email, 'alice@example.com');

  const byName = await request(f.app).get('/api/admin/users?search=nguyen').auth(admin.accessToken, { type: 'bearer' }).expect(200);
  assert.equal(byName.body.data.total, 1);
  assert.equal(byName.body.data.items[0].name, 'Alice Nguyen');

  const noMatch = await request(f.app).get('/api/admin/users?search=zzz').auth(admin.accessToken, { type: 'bearer' }).expect(200);
  assert.equal(noMatch.body.data.total, 0);
  assert.deepEqual(noMatch.body.data.items, []);
});

test('admin filters users by role and active status', async () => {
  const f = fixture();
  const admin = await seedAdmin(f);
  await seedUser(f, 'consumer@example.com', 'Consumer');
  await seedUser(f, 'provider@example.com', 'Provider');

  const providers = await request(f.app).get('/api/admin/users?role=Provider').auth(admin.accessToken, { type: 'bearer' }).expect(200);
  assert.equal(providers.body.data.total, 1);
  assert.equal(providers.body.data.items[0].role, 'Provider');

  const activeOnly = await request(f.app).get('/api/admin/users?active=true').auth(admin.accessToken, { type: 'bearer' }).expect(200);
  assert.equal(activeOnly.body.data.total, 3);

  const inactiveOnly = await request(f.app).get('/api/admin/users?active=false').auth(admin.accessToken, { type: 'bearer' }).expect(200);
  assert.equal(inactiveOnly.body.data.total, 0);
});

test('locking a user blocks login and invalidates existing access and refresh tokens', async () => {
  const f = fixture();
  const admin = await seedAdmin(f);
  const victim = await seedUser(f, 'victim@example.com');
  const victimId = victim.user.id;

  const locked = await request(f.app)
    .patch(`/api/admin/users/${victimId}/active`)
    .auth(admin.accessToken, { type: 'bearer' })
    .send({ active: false })
    .expect(200);

  assert.equal(locked.body.data.user.active, false);
  assert.equal(locked.body.data.revokedSessions, 1);

  await request(f.app).post('/api/auth/login').send({ email: 'victim@example.com', password }).expect(401);
  await request(f.app).get('/api/auth/me').auth(victim.accessToken, { type: 'bearer' }).expect(401);
  await request(f.app).post('/api/auth/refresh').send({ refreshToken: victim.refreshToken }).expect(401);
});

test('unlocking a user restores login without reviving old tokens', async () => {
  const f = fixture();
  const admin = await seedAdmin(f);
  const victim = await seedUser(f, 'victim@example.com');
  const victimId = victim.user.id;

  await request(f.app).patch(`/api/admin/users/${victimId}/active`).auth(admin.accessToken, { type: 'bearer' }).send({ active: false }).expect(200);
  const unlocked = await request(f.app).patch(`/api/admin/users/${victimId}/active`).auth(admin.accessToken, { type: 'bearer' }).send({ active: true }).expect(200);
  assert.equal(unlocked.body.data.user.active, true);
  assert.equal(unlocked.body.data.revokedSessions, 0);

  await request(f.app).post('/api/auth/login').send({ email: 'victim@example.com', password }).expect(200);
  await request(f.app).get('/api/auth/me').auth(victim.accessToken, { type: 'bearer' }).expect(401);
});

test('admin endpoints reject non-admin roles and unauthenticated callers', async () => {
  const f = fixture();
  await seedAdmin(f);
  const consumer = await seedUser(f, 'consumer@example.com');
  const provider = await seedUser(f, 'provider@example.com', 'Provider');

  await request(f.app).get('/api/admin/users').expect(401);
  await request(f.app).get('/api/admin/users').auth(consumer.accessToken, { type: 'bearer' }).expect(403);
  await request(f.app).get('/api/admin/users').auth(provider.accessToken, { type: 'bearer' }).expect(403);
  await request(f.app).patch('/api/admin/users/1/active').auth(consumer.accessToken, { type: 'bearer' }).send({ active: false }).expect(403);
});

test('admin cannot lock their own account', async () => {
  const f = fixture();
  const admin = await seedAdmin(f);
  const result = await request(f.app)
    .patch(`/api/admin/users/${admin.user.id}/active`)
    .auth(admin.accessToken, { type: 'bearer' })
    .send({ active: false })
    .expect(409);
  assert.equal(result.body.error.code, 'CANNOT_MODIFY_SELF');
  await request(f.app).get('/api/auth/me').auth(admin.accessToken, { type: 'bearer' }).expect(200);
});

test('admin endpoints validate input and report unknown users', async () => {
  const f = fixture();
  const admin = await seedAdmin(f);

  await request(f.app).get('/api/admin/users?page=0').auth(admin.accessToken, { type: 'bearer' }).expect(400);
  await request(f.app).get('/api/admin/users?pageSize=101').auth(admin.accessToken, { type: 'bearer' }).expect(400);
  await request(f.app).get('/api/admin/users?role=Superuser').auth(admin.accessToken, { type: 'bearer' }).expect(400);
  await request(f.app).get('/api/admin/users?unknown=1').auth(admin.accessToken, { type: 'bearer' }).expect(400);

  await request(f.app).patch('/api/admin/users/abc!!/active').auth(admin.accessToken, { type: 'bearer' }).send({ active: false }).expect(400);
  await request(f.app).patch('/api/admin/users/999/active').auth(admin.accessToken, { type: 'bearer' }).send({ active: false }).expect(404);
  await request(f.app).patch('/api/admin/users/1/active').auth(admin.accessToken, { type: 'bearer' }).send({ active: 'yes' }).expect(400);
  await request(f.app).patch('/api/admin/users/1/active').auth(admin.accessToken, { type: 'bearer' }).send({ active: false, extra: 1 }).expect(400);
});

test('swagger documents the admin user management endpoints', async () => {
  const f = fixture();
  const doc = await request(f.app).get('/openapi.json').expect(200);
  assert.ok(doc.body.paths['/api/admin/users'].get);
  assert.ok(doc.body.paths['/api/admin/users/{id}/active'].patch);
  assert.ok(doc.body.components.schemas.AdminUser);
  assert.ok(doc.body.components.schemas.AdminUserPage);
});