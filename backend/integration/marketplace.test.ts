import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import request from 'supertest';
import SwaggerParser from '@apidevtools/swagger-parser';
import { PostgresAuthStore } from '../src/postgres-store.js';
import { AuthService } from '../src/auth.js';
import { MarketplaceService } from '../src/marketplace-service.js';
import { createApp } from '../src/app.js';

const url = process.env.PG_TEST_URL;
if (!url) throw new Error('Run npm test to provide disposable PostgreSQL');

async function fixture() {
  const control = new Pool({ connectionString: url });
  const schema = `marketplace_test_${randomUUID().replaceAll('-', '')}`;
  await control.query(`CREATE SCHEMA ${schema}`);
  const store = new PostgresAuthStore(url!, schema);
  const close = async () => { await store.close(); await control.query(`DROP SCHEMA ${schema} CASCADE`); await control.end(); };
  try {
    await store.migrate(false, true);
    const admin = (await store.pool.query("INSERT INTO users(name,email,password_hash,role_id) VALUES('Admin','admin@market.test','never-public',(SELECT id FROM roles WHERE name='ADMIN')) RETURNING id")).rows[0].id;
    const providers: string[] = [];
    for (const n of [1, 2]) {
      const user = (await store.pool.query("INSERT INTO users(name,email,password_hash,role_id) VALUES('Provider',$1,'never-public',(SELECT id FROM roles WHERE name='API_PROVIDER')) RETURNING id", [`p${n}@market.test`])).rows[0].id;
      const provider = (await store.pool.query("INSERT INTO api_providers(user_id,provider_name) VALUES($1,$2) RETURNING id", [user, `Provider ${n}`])).rows[0].id;
      providers.push(String(provider));
      await store.pool.query(`INSERT INTO provider_verifications(provider_id,organization_name,contact_email,evidence_urls,status,reviewed_at,reviewed_by)
        VALUES($1,'Private organization','private@market.test','["https://private.example/evidence"]','Verified',NOW(),$2)`, [provider, admin]);
    }
    const agreement = (await store.pool.query("INSERT INTO agreements(version,content,is_active) VALUES('v1','Terms',true) RETURNING id")).rows[0].id;
    async function add(name: string, state = 'Published', provider = providers[0]!, category = 'Weather', tags = ['forecast']) {
      const id = String((await store.pool.query("INSERT INTO apis(provider_id,name,description,category,base_url,tags) VALUES($1,$2,$3,$4,'https://api.example.com',$5) RETURNING id",
        [provider, name, `Description ${name}`, category, JSON.stringify(tags)])).rows[0].id);
      const steps = ['Draft', 'Submitted', 'Under Review', 'Approved', 'Published'];
      const end = state === 'Rejected' ? 2 : steps.indexOf(state);
      for (let i = 1; i <= end; i++) await store.pool.query('UPDATE apis SET status=$1 WHERE id=$2', [steps[i], id]);
      if (state === 'Rejected') await store.pool.query("UPDATE apis SET status='Rejected' WHERE id=$1", [id]);
      return id;
    }
    async function plan(api: string, name = 'Free', price = 0, active = true) {
      await store.pool.query('INSERT INTO api_plans(api_id,name,price_monthly,quota,rate_limit,is_active) VALUES($1,$2,$3,2000,10,$4)', [api, name, price, active]);
    }
    const app = createApp(new AuthService(store, 'marketplace-test-secret-at-least-32-bytes'), () => {}, { marketplace: new MarketplaceService(store.pool) });
    return { store, app, providers, agreement, add, plan, close };
  } catch (error) { await close(); throw error; }
}

test('public marketplace hides every non-Published state and inactive provider without leaking internal data', async () => {
  const f = await fixture();
  try {
    const published = await f.add('Public weather');
    for (const state of ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected']) {
      const id = await f.add(`Hidden ${state}`, state);
      await request(f.app).get(`/api/marketplace/apis/${id}`).expect(404);
    }
    const inactive = await f.add('Inactive provider API', 'Published', f.providers[1]);
    await f.store.pool.query('UPDATE users SET is_active=false WHERE id=(SELECT user_id FROM api_providers WHERE id=$1)', [f.providers[1]]);
    await request(f.app).get(`/api/marketplace/apis/${inactive}`).expect(404);
    const data = (await request(f.app).get('/api/marketplace/apis').expect(200)).body.data;
    assert.equal(data.total, 1); assert.equal(data.items[0].id, published);
    assert.equal(data.items[0].providerStatus, 'Verified');
    const result = await request(f.app).get(`/api/marketplace/apis/${published}`).expect(200);
    for (const forbidden of ['password', 'evidence', 'private@', 'token_hash', 'base_url', 'reviewed_by']) {
      assert.ok(!JSON.stringify(result.body).includes(forbidden));
    }
    assert.equal(result.headers['cache-control'], 'no-store');
  } finally { await f.close(); }
});

test('marketplace combines search/category/tag/provider/active pricing filters, using literal text safely', async () => {
  const f = await fixture();
  try {
    const weather = await f.add('Weather 100%');
    await f.plan(weather); await f.plan(weather, 'Pro', 20);
    const finance = await f.add('Finance', 'Published', f.providers[1], 'Finance', ['currency']);
    await f.plan(finance, 'Basic', 10);
    const inactivePlan = await f.add('Inactive plans'); await f.plan(inactivePlan, 'Free', 0, false);
    const filtered = (await request(f.app).get('/api/marketplace/apis').query({ q: 'WEATHER', category: 'Weather', tag: 'forecast', providerId: f.providers[0], pricing: 'free' }).expect(200)).body.data;
    assert.deepEqual(filtered.items.map((item: any) => item.id), [weather]);
    assert.equal(filtered.items[0].hasFreePlan, true); assert.equal(filtered.items[0].hasPaidPlan, true);
    assert.equal((await request(f.app).get('/api/marketplace/apis').query({ pricing: 'paid' }).expect(200)).body.data.total, 2);
    assert.equal((await request(f.app).get('/api/marketplace/apis').query({ q: '%' }).expect(200)).body.data.total, 1);
    for (const q of ["' OR 1=1 --", '_', 'no-such-api']) {
      assert.equal((await request(f.app).get('/api/marketplace/apis').query({ q }).expect(200)).body.data.total, 0);
    }
    assert.equal((await request(f.app).get('/api/marketplace/apis').query({ tag: 'FORECAST' }).expect(200)).body.data.total, 0);
  } finally { await f.close(); }
});

test('marketplace pagination is stable with correct totals, including pages beyond the end', async () => {
  const f = await fixture();
  try {
    const alpha = await f.add('Alpha'), beta = await f.add('Beta'), gamma = await f.add('Gamma');
    await f.store.pool.query('UPDATE apis SET published_at=$1', ['2026-10-21T00:00:00Z']);
    const first = (await request(f.app).get('/api/marketplace/apis?pageSize=2').expect(200)).body.data;
    assert.deepEqual(first.items.map((item: any) => item.id), [gamma, beta]);
    const second = (await request(f.app).get('/api/marketplace/apis?pageSize=2&page=2').expect(200)).body.data;
    assert.deepEqual(second.items.map((item: any) => item.id), [alpha]); assert.equal(second.total, 3);
    const beyond = (await request(f.app).get('/api/marketplace/apis?page=10').expect(200)).body.data;
    assert.deepEqual(beyond.items, []); assert.equal(beyond.total, 3);
    const names = (await request(f.app).get('/api/marketplace/apis?sort=name').expect(200)).body.data;
    assert.deepEqual(names.items.map((item: any) => item.name), ['Alpha', 'Beta', 'Gamma']);
  } finally { await f.close(); }
});

test('public detail includes version docs/endpoints, active prices and privacy, but no internal records', async () => {
  const f = await fixture();
  try {
    const id = await f.add('Documented');
    const version = String((await f.store.pool.query("INSERT INTO api_versions(api_id,version) VALUES($1,'1.0.0') RETURNING id", [id])).rows[0].id);
    await f.store.pool.query("INSERT INTO api_endpoints(api_id,version_id,method,path,description) VALUES($1,$2,'GET','/weather','Forecast')", [id, version]);
    await f.store.pool.query(`INSERT INTO api_documentations(api_id,version_id,content) VALUES($1,$2,'{"openapi":"3.0.3","info":{"title":"Weather","version":"1.0.0"},"paths":{}}')`, [id, version]);
    await f.plan(id); await f.plan(id, 'Basic', 10, false);
    await f.store.pool.query(`INSERT INTO api_legal_declarations(api_id,agreement_id,ownership_declaration,distribution_rights,data_classification,processes_personal_data,personal_data_types,data_processing_purpose)
      VALUES($1,$2,'Private legal assertion','Private contract','Confidential',true,'["Email"]','Send weather alerts')`, [id, f.agreement]);
    const data = (await request(f.app).get(`/api/marketplace/apis/${id}`).expect(200)).body.data;
    assert.equal(data.versions[0].id, version); assert.equal(data.endpoints[0].versionId, version);
    assert.equal(data.endpoints[0].path, '/weather'); assert.equal(data.documentation[0].content.info.title, 'Weather');
    assert.equal(data.plans.length, 1); assert.equal(typeof data.plans[0].quota, 'number'); assert.equal(data.plans[0].priceMonthly, 0);
    assert.equal(data.legal.processesPersonalData, true); assert.deepEqual(data.legal.personalDataTypes, ['Email']);
    assert.equal(data.legal.dataClassification, 'Confidential');
    assert.ok(!JSON.stringify(data).includes('Private contract'));
    assert.equal(data.providerName, 'Provider 1');
  } finally { await f.close(); }
});

test('marketplace rejects invalid/repeated query parameters and documents its anonymous endpoints', async () => {
  const f = await fixture();
  try {
    for (const query of ['page=0', 'page=1.1', 'pageSize=101', 'sort=price;DROP', 'providerId=2147483648', 'q=', 'unknown=yes', 'tag=a&tag=b', 'q[x]=y', 'q=%00', 'category=%00', 'tag=%00']) {
      await request(f.app).get(`/api/marketplace/apis?${query}`).expect(400);
    }
    for (const id of ['0', '-1', 'abc', '2147483648', '2147483647']) await request(f.app).get(`/api/marketplace/apis/${id}`).expect(404);
    const spec = (await request(f.app).get('/openapi.json').expect(200)).body;
    assert.deepEqual(spec.paths['/api/marketplace/apis'].get.security, []);
    assert.ok(spec.paths['/api/marketplace/apis/{id}'].get.responses['404']);
    await SwaggerParser.validate(structuredClone(spec));
  } finally { await f.close(); }
});
