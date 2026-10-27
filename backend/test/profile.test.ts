import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { AuthService } from '../src/auth.js';
import { MemoryAuthStore } from '../src/store.js';
import { createApp } from '../src/app.js';

const secret = 'test-only-secret-with-at-least-32-bytes';
const password = 'Example-password-2026';
const newPassword = 'Another-password-2026';

function fixture() {
  const store = new MemoryAuthStore();
  const auth = new AuthService(store, secret);
  return { store, auth, app: createApp(auth, () => {}) };
}

async function signIn(f: ReturnType<typeof fixture>, email = 'user@example.com') {
  await request(f.app).post('/api/auth/register').send({ email, password, role: 'Consumer', name: 'Old Name' }).expect(201);
  const login = await request(f.app).post('/api/auth/login').send({ email, password }).expect(200);
  return login.body.data as { accessToken: string; refreshToken: string; user: { id: string; name: string } };
}

test('signed-in user renames their own profile', async () => {
  const f = fixture();
  const session = await signIn(f);

  const updated = await request(f.app).patch('/api/auth/me')
    .set('Authorization', `Bearer ${session.accessToken}`)
    .send({ name: 'New Name' }).expect(200);
  assert.equal(updated.body.data.name, 'New Name');
  assert.equal(updated.body.data.id, session.user.id);

  // The change is persisted, not only echoed back.
  const me = await request(f.app).get('/api/auth/me')
    .set('Authorization', `Bearer ${session.accessToken}`).expect(200);
  assert.equal(me.body.data.name, 'New Name');
});

test('profile update requires authentication and validates the name', async () => {
  const f = fixture();
  const session = await signIn(f);

  await request(f.app).patch('/api/auth/me').send({ name: 'No Auth' }).expect(401);
  await request(f.app).patch('/api/auth/me')
    .set('Authorization', `Bearer ${session.accessToken}`).send({ name: '   ' }).expect(400);
  // Unknown fields are rejected rather than silently ignored.
  await request(f.app).patch('/api/auth/me')
    .set('Authorization', `Bearer ${session.accessToken}`).send({ name: 'Ok', role: 'Admin' }).expect(400);
});

test('password change verifies the current password and rejects a weak or unchanged one', async () => {
  const f = fixture();
  const session = await signIn(f);

  await request(f.app).post('/api/auth/change-password')
    .set('Authorization', `Bearer ${session.accessToken}`)
    .send({ currentPassword: 'Wrong-password-2026', newPassword }).expect(401);
  await request(f.app).post('/api/auth/change-password')
    .set('Authorization', `Bearer ${session.accessToken}`)
    .send({ currentPassword: password, newPassword: password }).expect(400);
  await request(f.app).post('/api/auth/change-password')
    .set('Authorization', `Bearer ${session.accessToken}`)
    .send({ currentPassword: password, newPassword: 'short' }).expect(400);
});

test('password change rotates the credential and keeps the caller signed in', async () => {
  const f = fixture();
  const session = await signIn(f);

  await request(f.app).post('/api/auth/change-password')
    .set('Authorization', `Bearer ${session.accessToken}`)
    .send({ currentPassword: password, newPassword }).expect(200);

  // Old password no longer works, new one does.
  await request(f.app).post('/api/auth/login').send({ email: 'user@example.com', password }).expect(401);
  await request(f.app).post('/api/auth/login').send({ email: 'user@example.com', password: newPassword }).expect(200);

  // The session that made the change still works: changing a password must not sign you out.
  await request(f.app).get('/api/auth/me')
    .set('Authorization', `Bearer ${session.accessToken}`).expect(200);
});

test('password change revokes other sessions but not the current one', async () => {
  const f = fixture();
  const first = await signIn(f);
  // A second device signs in with the same account.
  const second = await request(f.app).post('/api/auth/login')
    .send({ email: 'user@example.com', password }).expect(200);
  const secondRefresh = second.body.data.refreshToken as string;

  const changed = await request(f.app).post('/api/auth/change-password')
    .set('Authorization', `Bearer ${first.accessToken}`)
    .send({ currentPassword: password, newPassword }).expect(200);
  assert.ok(changed.body.data.revokedSessions >= 1, 'the other session must be revoked');

  // The other device can no longer refresh.
  await request(f.app).post('/api/auth/refresh').send({ refreshToken: secondRefresh }).expect(401);
  // The caller keeps working.
  await request(f.app).get('/api/auth/me')
    .set('Authorization', `Bearer ${first.accessToken}`).expect(200);
});