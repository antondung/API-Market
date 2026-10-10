import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { AuthService, hashPassword } from '../src/auth.js';
import { MemoryAuthStore } from '../src/store.js';
import { createApp, type LogEvent } from '../src/app.js';

const secret = 'test-only-secret-with-at-least-32-bytes';
const password = 'Example-password-2026';
function fixture() {
  const store = new MemoryAuthStore();
  let now = Date.now();
  const auth = new AuthService(store, secret, () => now);
  const logs: LogEvent[] = [];
  return { store, auth, app: createApp(auth, e => logs.push(e)), logs, advance: (ms: number) => { now += ms; } };
}
async function registerAndLogin(f: ReturnType<typeof fixture>, role = 'Consumer') {
  await request(f.app).post('/api/auth/register').send({ email: 'user@example.com', password, role }).expect(201);
  const result = await request(f.app).post('/api/auth/login').send({ email: 'user@example.com', password }).expect(200);
  return result.body.data;
}
test('registration normalizes email, hashes passwords, rejects duplicate and Admin signup', async () => {
  const f = fixture();
  const result = await request(f.app).post('/api/auth/register').send({ email: ' User@Example.com ', password, role: 'Provider' }).expect(201);
  assert.equal(result.body.data.email, 'user@example.com');
  assert.equal(result.body.data.passwordHash, undefined);
  const user = await f.store.findUserByEmail('user@example.com');
  assert.ok(user && !user.passwordHash.includes(password));
  await request(f.app).post('/api/auth/register').send({ email: 'USER@example.com', password, role: 'Provider' }).expect(409);
  await request(f.app).post('/api/auth/register').send({ email: 'admin@example.com', password, role: 'Admin' }).expect(400);
});
test('wrong password and unknown email return the same generic authentication error', async () => {
  const f = fixture();
  await registerAndLogin(f);
  const known = await request(f.app).post('/api/auth/login').send({ email: 'user@example.com', password: 'wrong' }).expect(401);
  const unknown = await request(f.app).post('/api/auth/login').send({ email: 'missing@example.com', password: 'wrong' }).expect(401);
  assert.equal(known.body.error.code, unknown.body.error.code);
  assert.equal(known.body.error.message, unknown.body.error.message);
});
test('refresh rotates atomically; logout invalidates old and new access tokens and refresh', async () => {
  const f = fixture();
  const tokens = await registerAndLogin(f);
  const results = await Promise.all([1, 2].map(() => request(f.app).post('/api/auth/refresh').send({ refreshToken: tokens.refreshToken })));
  assert.deepEqual(results.map(r => r.status).sort(), [200, 401]);
  const next = results.find(r => r.status === 200)!.body.data;
  assert.notEqual(next.refreshToken, tokens.refreshToken);
  const payload = jwt.decode(next.accessToken) as jwt.JwtPayload;
  const session = await f.store.findSession(payload.sid);
  assert.ok(session && !session.refreshHash.includes(next.refreshToken));
  await request(f.app).post('/api/auth/logout').auth(next.accessToken, { type: 'bearer' }).expect(204);
  for (const access of [tokens.accessToken, next.accessToken]) {
    await request(f.app).get('/api/auth/me').auth(access, { type: 'bearer' }).expect(401);
  }
  await request(f.app).post('/api/auth/refresh').send({ refreshToken: next.refreshToken }).expect(401);
});
test('each role passes its guard and is denied other roles; unauthenticated requests return 401', async () => {
  for (const role of ['Consumer', 'Provider', 'Admin'] as const) {
    const f = fixture();
    await f.store.createUser({ id: randomUUID(), email: 'role@example.com', passwordHash: await hashPassword(password), role, active: true });
    const tokens = await f.auth.login('role@example.com', password);
    for (const route of ['consumer', 'provider', 'admin']) {
      await request(f.app).get(`/api/access/${route}`).auth(tokens.accessToken, { type: 'bearer' }).expect(role.toLowerCase() === route ? 200 : 403);
    }
    await request(f.app).get('/api/auth/me').expect(401);
  }
});
test('expired access tokens fail; expired refresh tokens cannot rotate', async () => {
  const f = fixture();
  const tokens = await registerAndLogin(f);
  f.advance(16 * 60 * 1000);
  await request(f.app).get('/api/auth/me').auth(tokens.accessToken, { type: 'bearer' }).expect(401);
  await request(f.app).post('/api/auth/refresh').send({ refreshToken: tokens.refreshToken }).expect(200);
  const another = await f.auth.login('user@example.com', password);
  f.advance(8 * 24 * 60 * 60 * 1000);
  await request(f.app).post('/api/auth/refresh').send({ refreshToken: another.refreshToken }).expect(401);
});
test('forged JWT and wrong audience are rejected', async () => {
  const f = fixture();
  const tokens = await registerAndLogin(f);
  const claims = jwt.decode(tokens.accessToken) as jwt.JwtPayload;
  for (const [key, audience] of [['different-secret', 'api-market-backend'], [secret, 'wrong-audience']]) {
    const forged = jwt.sign({ sid: claims.sid }, key!, { subject: claims.sub, issuer: 'api-market', audience });
    await request(f.app).get('/api/auth/me').auth(forged, { type: 'bearer' }).expect(401);
  }
});
test('malformed JSON, oversized body and unknown route use the standard error envelope', async () => {
  const f = fixture();
  for (const [payload, expected] of [['{', 400], [JSON.stringify({ password: 'x'.repeat(20000) }), 413]] as const) {
    const result = await request(f.app).post('/api/auth/login').set('Content-Type', 'application/json').send(payload).expect(expected);
    assert.ok(result.body.error.requestId);
  }
  await request(f.app).get('/missing').expect(404);
});
test('logs do not contain passwords, tokens, authorization, cookies or query values', async () => {
  const f = fixture();
  const tokens = await registerAndLogin(f);
  await request(f.app).get('/api/auth/me?api_key=private-query').auth(tokens.accessToken, { type: 'bearer' }).set('Cookie', 'private-cookie').expect(200);
  await request(f.app).get('/private-path-secret').expect(404);
  const logs = JSON.stringify(f.logs);
  for (const value of [password, tokens.accessToken, tokens.refreshToken, 'private-query', 'private-cookie', 'private-path-secret']) {
    assert.ok(!logs.includes(value));
  }
});
test('auth abuse is rate limited and returns a consistent error', async () => {
  const f = fixture();
  let last;
  for (let i = 0; i < 31; i++) last = await request(f.app).post('/api/auth/login').send({});
  assert.equal(last!.status, 429);
  assert.equal(last!.body.error.code, 'RATE_LIMITED');
  assert.ok(last!.headers['retry-after']);
});
test('Swagger describes all auth endpoints and is served', async () => {
  const f = fixture();
  const doc = await request(f.app).get('/openapi.json').expect(200);
  for (const endpoint of ['register', 'login', 'refresh', 'logout', 'me']) assert.ok(doc.body.paths[`/api/auth/${endpoint}`]);
  await request(f.app).get('/docs/').expect(200);
});
