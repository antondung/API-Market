import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { SqliteAuthStore } from '../src/sqlite-store.js';
import { AuthService } from '../src/auth.js';
import { createApp } from '../src/app.js';

const secret = 'test-only-secret-with-at-least-32-bytes';
const password = 'A-long-example-password';
test('team migrations run from an empty SQLite DB and safely rerun', () => {
  const store = new SqliteAuthStore(':memory:');
  try {
    store.migrate();
    store.migrate();
    assert.equal(store.db.prepare('SELECT count(*) AS n FROM schema_migrations').get()!.n, 2);
    assert.equal(store.db.prepare('SELECT count(*) AS n FROM roles').get()!.n, 3);
    assert.equal(store.db.prepare('PRAGMA foreign_keys').get()!.foreign_keys, 1);
    assert.throws(() => store.db.prepare("INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (999, 'bad', '2099-01-01')").run(), /FOREIGN KEY/);
  } finally { store.close(); }
});
test('SQLite registration maps roles, creates provider profile, enforces uniqueness and hashes secrets', async () => {
  const store = new SqliteAuthStore(':memory:');
  try {
    store.migrate();
    const app = createApp(new AuthService(store, secret));
    const result = await request(app).post('/api/auth/register').send({ name: 'Provider Demo', email: ' Provider@Example.com ', password, role: 'Provider' }).expect(201);
    const user = store.db.prepare('SELECT * FROM users WHERE id = ?').get(result.body.data.id)!;
    assert.equal(user.name, 'Provider Demo');
    assert.notEqual(user.password_hash, password);
    const provider = store.db.prepare('SELECT * FROM api_providers WHERE user_id = ?').get(result.body.data.id)!;
    assert.equal(provider.provider_name, 'Provider Demo');
    const duplicate = await Promise.all([1, 2].map(() => request(app).post('/api/auth/register').send({ email: 'other@example.com', password, role: 'Consumer' })));
    assert.deepEqual(duplicate.map(r => r.status).sort(), [201, 409]);
    await request(app).post('/api/auth/register').send({ email: 'PROVIDER@example.com', password, role: 'Provider' }).expect(409);
    assert.equal(await store.findUserByEmail("' OR 1=1 --"), undefined);
    const login = await request(app).post('/api/auth/login').send({ email: 'provider@example.com', password }).expect(200);
    assert.equal(login.body.data.user.role, 'Provider');
    await request(app).get('/api/access/provider').auth(login.body.data.accessToken, { type: 'bearer' }).expect(200);
    await request(app).get('/api/access/admin').auth(login.body.data.accessToken, { type: 'bearer' }).expect(403);
    const session = store.db.prepare('SELECT * FROM refresh_tokens').get()!;
    assert.notEqual(session.token_hash, login.body.data.refreshToken);
    assert.equal(String(session.token_hash).length, 64);
  } finally { store.close(); }
});
test('accounts, sessions and logout survive DB reopening; competing connections rotate once', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'api-market-auth-'));
  const path = join(directory, 'auth.sqlite');
  const stores: SqliteAuthStore[] = [];
  try {
    const first = new SqliteAuthStore(path); stores.push(first); first.migrate();
    const auth = new AuthService(first, secret);
    await auth.register('persist@example.com', password, 'Consumer');
    const tokens = await auth.login('persist@example.com', password);
    first.close(); stores.pop();
    const second = new SqliteAuthStore(path); stores.push(second); second.migrate();
    const third = new SqliteAuthStore(path); stores.push(third); third.migrate();
    const auth2 = new AuthService(second, secret);
    const auth3 = new AuthService(third, secret);
    assert.equal((await auth2.authenticate(tokens.accessToken)).user.email, 'persist@example.com');
    const results = await Promise.allSettled([auth2.refresh(tokens.refreshToken), auth3.refresh(tokens.refreshToken)]);
    assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
    const rotated = (results.find(r => r.status === 'fulfilled') as PromiseFulfilledResult<Awaited<ReturnType<AuthService['refresh']>>>).value;
    const identity = await auth2.authenticate(rotated.accessToken);
    await auth2.logout(identity.sessionId);
    await assert.rejects(auth3.authenticate(tokens.accessToken));
    third.close(); stores.pop(); second.close(); stores.pop();
    const reopened = new SqliteAuthStore(path); stores.push(reopened);
    const again = new AuthService(reopened, secret);
    await assert.rejects(again.refresh(rotated.refreshToken));
    await assert.rejects(again.authenticate(rotated.accessToken));
  } finally {
    for (const store of stores) store.close();
    // Delete only these known test files; never recursively remove a computed path.
    for (const suffix of ['', '-wal', '-shm']) rmSync(path + suffix, { force: true });
    rmdirSync(directory);
  }
});
test('database user lock and expired refresh deny access immediately', async () => {
  const store = new SqliteAuthStore(':memory:');
  try {
    store.migrate();
    const auth = new AuthService(store, secret);
    const user = await auth.register('locked@example.com', password, 'Consumer');
    const tokens = await auth.login('locked@example.com', password);
    store.db.prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(user.id);
    await assert.rejects(auth.login('locked@example.com', password));
    await assert.rejects(auth.refresh(tokens.refreshToken));
    await assert.rejects(auth.authenticate(tokens.accessToken));
    store.db.prepare('UPDATE users SET is_active = 1 WHERE id = ?').run(user.id);
    store.db.prepare('UPDATE refresh_tokens SET expires_at = ?').run('2000-01-01T00:00:00.000Z');
    await assert.rejects(auth.refresh(tokens.refreshToken));
    await assert.rejects(auth.authenticate(tokens.accessToken));
  } finally { store.close(); }
});
