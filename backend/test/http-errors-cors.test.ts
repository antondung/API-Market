import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { AuthService } from '../src/auth.js';
import { MemoryAuthStore } from '../src/store.js';
import { createApp } from '../src/app.js';

function app(allowedOrigins?: string[]) {
  return createApp(new AuthService(new MemoryAuthStore(), 'test-only-secret-with-at-least-32-bytes'), undefined, { allowedOrigins });
}
test('frontend preflight permits JSON and Bearer headers for configured origins', async () => {
  const server = app();
  for (const origin of ['http://localhost:5173', 'http://127.0.0.1:5173']) {
    const result = await request(server).options('/api/auth/login').set('Origin', origin)
      .set('Access-Control-Request-Method', 'POST').set('Access-Control-Request-Headers', 'content-type,authorization').expect(204);
    assert.equal(result.headers['access-control-allow-origin'], origin);
    assert.match(result.headers['access-control-allow-headers'] ?? '', /Content-Type/);
    assert.match(result.headers['access-control-allow-headers'] ?? '', /Authorization/);
    assert.match(result.headers.vary ?? '', /Origin/);
    assert.equal(result.headers['access-control-allow-credentials'], undefined);
  }
});
test('allowed frontend can read Auth error responses and no-origin clients still work', async () => {
  const server = app(['https://frontend.example.test']);
  const result = await request(server).get('/api/auth/me').set('Origin', 'https://frontend.example.test').expect(401);
  assert.equal(result.headers['access-control-allow-origin'], 'https://frontend.example.test');
  assert.match(result.headers['access-control-expose-headers'] ?? '', /X-Request-Id/);
  assert.equal(result.body.error.code, 'UNAUTHORIZED');
  await request(server).get('/health').expect(200);
});
test('unlisted origins and lookalike domains are denied before Auth executes', async () => {
  const server = app();
  for (const origin of ['https://untrusted.example.test', 'http://localhost:5173.evil.test', 'null']) {
    const result = await request(server).post('/api/auth/register').set('Origin', origin)
      .send({ email: 'same@example.test', password: 'A-long-example-password', role: 'Consumer' }).expect(403);
    assert.equal(result.body.error.code, 'CORS_ORIGIN_DENIED');
    assert.equal(result.headers['access-control-allow-origin'], undefined);
    assert.ok(result.body.error.requestId);
  }
  await request(server).post('/api/auth/register').send({ email: 'same@example.test', password: 'A-long-example-password', role: 'Consumer' }).expect(201);
});
test('empty allowlist disables browser cross-origin access and rejects invalid config', async () => {
  await request(app([])).options('/api/auth/login').set('Origin', 'http://localhost:5173').set('Access-Control-Request-Method', 'POST').expect(403);
  for (const origin of ['*', 'https://example.test/path', 'null']) assert.throws(() => app([origin]));
});
test('unsupported content encoding returns 415 instead of 500 with readable CORS headers', async () => {
  const result = await request(app()).post('/api/auth/login').set('Origin', 'http://localhost:5173')
    .set('Content-Encoding', 'unsupported').send({ email: 'user@example.test', password: 'example' }).expect(415);
  assert.equal(result.body.error.code, 'UNSUPPORTED_ENCODING');
  assert.equal(result.headers['access-control-allow-origin'], 'http://localhost:5173');
  assert.ok(result.body.error.requestId);
});
test('unsupported JSON charset returns 415 with the standard error envelope', async () => {
  const result = await request(app()).post('/api/auth/login').set('Content-Type', 'application/json; charset=iso-8859-1')
    .send('{"email":"user@example.test"}').expect(415);
  assert.equal(result.body.error.code, 'UNSUPPORTED_CHARSET');
  assert.ok(result.body.error.requestId);
});
