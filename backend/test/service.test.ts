import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { AuthService, ApiError, hashPassword } from '../src/auth.js';
import { MemoryAuthStore } from '../src/store.js';

test('AuthService rejects locked users during login, refresh and access authentication', async () => {
  class LockableStore extends MemoryAuthStore {
    locked = false;
    override async findUserById(id: string) {
      const user = await super.findUserById(id);
      return user && { ...user, active: !this.locked };
    }
    override async findUserByEmail(email: string) {
      const user = await super.findUserByEmail(email);
      return user && { ...user, active: !this.locked };
    }
  }
  const store = new LockableStore();
  const auth = new AuthService(store, 'test-only-secret-with-at-least-32-bytes');
  await auth.register('lock@example.com', 'A-long-example-password', 'Consumer');
  const tokens = await auth.login('lock@example.com', 'A-long-example-password');
  store.locked = true;
  const unauthorized = (e: unknown) => e instanceof ApiError && e.status === 401;
  await assert.rejects(auth.login('lock@example.com', 'A-long-example-password'), unauthorized);
  await assert.rejects(auth.refresh(tokens.refreshToken), unauthorized);
  await assert.rejects(auth.authenticate(tokens.accessToken), unauthorized);
});

test('concurrent registration creates one normalized email only', async () => {
  const store = new MemoryAuthStore();
  const auth = new AuthService(store, 'test-only-secret-with-at-least-32-bytes');
  const results = await Promise.allSettled([1, 2].map(() => auth.register('same@example.com', 'A-long-example-password', 'Provider')));
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  const failed = results.find(r => r.status === 'rejected') as PromiseRejectedResult;
  assert.equal(failed.reason.status, 409);
});

test('password hashing uses a distinct salt for identical passwords', async () => {
  const hashes = await Promise.all([1, 2].map(() => hashPassword('A-long-example-password')));
  assert.notEqual(hashes[0], hashes[1]);
});

test('memory store returns snapshots so callers cannot mutate stored roles or sessions', async () => {
  const store = new MemoryAuthStore();
  const id = randomUUID();
  await store.createUser({ id, email: 'snapshot@example.com', passwordHash: 'unused', role: 'Consumer', active: true });
  const user = (await store.findUserById(id))!;
  user.role = 'Admin';
  assert.equal((await store.findUserById(id))!.role, 'Consumer');
});
