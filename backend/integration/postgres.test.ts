import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import request from 'supertest';
import { Pool } from 'pg';
import { PostgresAuthStore } from '../src/postgres-store.js';
import { AuthService } from '../src/auth.js';
import { createApp } from '../src/app.js';

const url = process.env.PG_TEST_URL;
if (!url) throw new Error('PG_TEST_URL required; run npm test to start an isolated PostgreSQL test server');
const secret = 'test-only-secret-with-at-least-32-bytes';
const password = 'A-long-example-password';
async function fixture() {
  const admin = new Pool({ connectionString: url });
  await admin.query('CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public');
  const schema = `auth_test_${randomUUID().replaceAll('-', '')}`;
  await admin.query(`CREATE SCHEMA ${schema}`);
  const stores = [new PostgresAuthStore(url!, schema)];
  return { schema, stores, store: stores[0]!, async close() {
    for (const store of stores) await store.close();
    await admin.query(`DROP SCHEMA ${schema} CASCADE`);
    await admin.end();
  } };
}
test('PostgreSQL migrations start from empty schema, rerun safely and exclude demo accounts by default', async () => {
  const f = await fixture();
  try {
    await f.store.migrate(); await f.store.migrate(); await f.store.ready();
    assert.equal((await f.store.pool.query('SELECT COUNT(*)::int AS n FROM backend_schema_migrations')).rows[0].n, 1);
    assert.equal((await f.store.pool.query('SELECT COUNT(*)::int AS n FROM roles')).rows[0].n, 3);
    assert.equal((await f.store.pool.query('SELECT COUNT(*)::int AS n FROM users')).rows[0].n, 0);
    await assert.rejects(f.store.pool.query("INSERT INTO refresh_tokens(user_id,token_hash,expires_at) VALUES(999,'bad',NOW())"), (e: unknown) => (e as {code:string}).code === '23503');
  } finally { await f.close(); }
});
test('Danh bcrypt seed accounts login and pass the complete role guard matrix', async () => {
  const f = await fixture();
  try {
    await f.store.migrate(true); await f.store.migrate(true);
    const app = createApp(new AuthService(f.store, secret));
    for (const [email, pass, role] of [['admin@example.com','Admin@123','Admin'],['user@example.com','User@123','Consumer'],['provider@example.com','Provider@123','Provider']]) {
      const result = await request(app).post('/api/auth/login').send({ email, password: pass }).expect(200);
      assert.equal(result.body.data.user.role, role);
      assert.match((await f.store.findUserByEmail(email!))!.passwordHash, /^\$2/);
      for (const target of ['admin','consumer','provider']) await request(app).get(`/api/access/${target}`).auth(result.body.data.accessToken,{type:'bearer'}).expect(target === role!.toLowerCase() ? 200 : 403);
    }
    await request(app).post('/api/auth/login').send({ email:'admin@example.com',password:'wrong' }).expect(401);
    assert.equal((await f.store.pool.query('SELECT COUNT(*)::int AS n FROM users')).rows[0].n, 3);
  } finally { await f.close(); }
});
test('PostgreSQL signup maps identity IDs and BOOLEAN, creates provider atomically and rejects concurrent duplicate emails', async () => {
  const f = await fixture();
  try {
    await f.store.migrate();
    const app = createApp(new AuthService(f.store,secret));
    const result = await request(app).post('/api/auth/register').send({name:'Provider Demo',email:' Provider@Example.test ',password,role:'Provider'}).expect(201);
    const id = result.body.data.id; assert.match(id,/^\d+$/);
    const user = (await f.store.findUserById(id))!; assert.equal(user.active,true); assert.ok(!user.passwordHash.includes(password));
    const profile = await f.store.pool.query('SELECT provider_name FROM api_providers WHERE user_id=$1',[id]); assert.equal(profile.rows[0].provider_name,'Provider Demo');
    const duplicate = await Promise.all(['duplicate@example.test',' DUPLICATE@example.test '].map(email => request(app).post('/api/auth/register').send({email,password,role:'Consumer'})));
    assert.deepEqual(duplicate.map(r=>r.status).sort(),[201,409]);
    await request(app).post('/api/auth/register').send({email:'too-long@example.test',password,role:'Provider',name:'x'.repeat(101)}).expect(400);
    assert.equal(await f.store.findUserByEmail("' OR 1=1 --"),undefined);
  } finally { await f.close(); }
});
test('provider insertion failure rolls back user creation', async () => {
  const f = await fixture();
  try {
    await f.store.migrate();
    await f.store.pool.query("CREATE FUNCTION fail_provider() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test failure'; END $$");
    await f.store.pool.query('CREATE TRIGGER test_fail BEFORE INSERT ON api_providers FOR EACH ROW EXECUTE FUNCTION fail_provider()');
    await assert.rejects(new AuthService(f.store,secret).register('rollback@example.test',password,'Provider'));
    assert.equal(await f.store.findUserByEmail('rollback@example.test'),undefined);
  } finally { await f.close(); }
});
test('refresh races across pools succeed once; TIMESTAMPTZ expires correctly and logout survives reconnect', async () => {
  const f = await fixture();
  try {
    await f.store.migrate();
    const auth = new AuthService(f.store,secret);
    await auth.register('session@example.test',password,'Consumer');
    const tokens = await auth.login('session@example.test',password);
    const other = new PostgresAuthStore(url!,f.schema); f.stores.push(other);
    const auth2 = new AuthService(other,secret);
    assert.equal((await auth2.authenticate(tokens.accessToken)).user.email,'session@example.test');
    const race = await Promise.allSettled([auth.refresh(tokens.refreshToken),auth2.refresh(tokens.refreshToken)]);
    assert.equal(race.filter(r=>r.status==='fulfilled').length,1);
    const next = (race.find(r=>r.status==='fulfilled') as PromiseFulfilledResult<Awaited<ReturnType<AuthService['refresh']>>>).value;
    const identity = await auth.authenticate(next.accessToken);
    const session = (await f.store.findSession(identity.sessionId))!;
    assert.ok(Number.isFinite(session.expiresAt)); assert.equal(session.revoked,false); assert.notEqual(session.refreshHash,next.refreshToken);
    await auth.logout(identity.sessionId);
    const reconnected = new PostgresAuthStore(url!,f.schema); f.stores.push(reconnected);
    const auth3 = new AuthService(reconnected,secret);
    await assert.rejects(auth3.authenticate(tokens.accessToken)); await assert.rejects(auth3.refresh(next.refreshToken));
  } finally { await f.close(); }
});
test('PostgreSQL user lock and expired session block login, access and refresh immediately', async () => {
  const f = await fixture();
  try {
    await f.store.migrate(); const auth = new AuthService(f.store,secret);
    const user = await auth.register('lock@example.test',password,'Consumer'); const tokens = await auth.login('lock@example.test',password);
    await f.store.pool.query('UPDATE users SET is_active=FALSE WHERE id=$1',[user.id]);
    await assert.rejects(auth.login('lock@example.test',password)); await assert.rejects(auth.authenticate(tokens.accessToken)); await assert.rejects(auth.refresh(tokens.refreshToken));
    await f.store.pool.query('UPDATE users SET is_active=TRUE WHERE id=$1',[user.id]);
    await f.store.pool.query("UPDATE refresh_tokens SET expires_at=TIMESTAMPTZ '2000-01-01 00:00:00Z'");
    await assert.rejects(auth.authenticate(tokens.accessToken)); await assert.rejects(auth.refresh(tokens.refreshToken));
  } finally { await f.close(); }
});
test('adapter uses database initialized directly with Danh SQL without recreating schema', async () => {
  const f = await fixture();
  try {
    for (const file of ['001_create_auth_schema.sql','002_seed_auth_data.sql']) await f.store.pool.query(readFileSync(`migrations/${file}`,'utf8'));
    await f.store.ready();
    const tokens = await new AuthService(f.store,secret).login('user@example.com','User@123');
    assert.equal(tokens.user.role,'Consumer');
  } finally { await f.close(); }
});
