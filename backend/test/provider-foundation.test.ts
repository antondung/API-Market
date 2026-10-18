import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { providerSchemas, requireProviderOwner, requireVerified, requireDraft, submitApi, transitionApi } from '../src/provider-domain.js';
import { importOpenApi, ImportError } from '../src/provider-openapi-import.js';
import { providerContract } from '../src/provider-contract.js';
import { classifyDomainLookupError } from '../src/provider-service.js';
import { invalidDnsServers, parseDnsServers } from '../src/provider-dns.js';

const spec = () => ({ openapi: '3.0.3', info: { title: 'Fixture only', version: '1.0' }, paths: { '/items/{id}': {
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  get: { parameters: [{ name: 'q', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Item' } } } } } },
} }, components: { schemas: { Item: { type: 'object', properties: { name: { type: 'string' } } } } } });
test('provider ownership excludes Consumer, Admin and another Provider; pending/rejected cannot create', () => {
  requireProviderOwner('Provider', '1', '1');
  for (const role of ['Admin', 'Consumer']) assert.throws(() => requireProviderOwner(role, '1', '1'));
  assert.throws(() => requireProviderOwner('Provider', '2', '1'));
  for (const state of ['Pending', 'Rejected'] as const) assert.throws(() => requireVerified(state));
  requireVerified('Verified'); assert.throws(() => requireDraft('Published'));
});
test('strict input excludes server status/owner/timestamps and invalid Free price/quota/legal consent', () => {
  const plan = { name: 'Free', priceMonthly: 0, currency: 'VND', quota: 100, rateLimit: 2 };
  providerSchemas.plan.parse(plan);
  for (const patch of [{ priceMonthly: 1 }, { quota: 0 }, { rateLimit: 0 }, { priceMonthly: Infinity }, { ownerId: '2' }]) assert.throws(() => providerSchemas.plan.parse({ ...plan, ...patch }));
  const api = { name: 'API', description: 'Description', category: 'Weather', baseUrl: 'https://example.com', tags: [] };
  providerSchemas.api.parse(api);
  for (const patch of [{ status: 'Published' }, { baseUrl: 'file:///etc/passwd' }]) assert.throws(() => providerSchemas.api.parse({ ...api, ...patch }));
  assert.throws(() => providerSchemas.legal.parse({ ownershipDeclaration: 'Own', distributionRights: 'Rights', dataClassification: 'Public', agreementVersion: '1', accepted: false }));
});
test('submission requires all server readiness checks and current accepted agreement', () => {
  const ready = { verification: 'Verified' as const, metadata: true, endpoints: 1, documentation: true, plans: 1, legal: true, acceptedAgreementVersion: 'v2', currentAgreementVersion: 'v2' };
  assert.equal(submitApi('Draft', ready), 'Submitted');
  for (const patch of [{ metadata: false }, { endpoints: 0 }, { documentation: false }, { plans: 0 }, { legal: false }, { acceptedAgreementVersion: 'v1' }]) assert.throws(() => submitApi('Draft', { ...ready, ...patch }));
  assert.throws(() => submitApi('Published', ready));
});
test('workflow prevents bypass and Provider publish; rejection requires reason and reopen is explicit', () => {
  assert.equal(transitionApi('Submitted', 'Under Review', 'Admin'), 'Under Review');
  assert.equal(transitionApi('Under Review', 'Approved', 'Admin'), 'Approved');
  assert.equal(transitionApi('Approved', 'Published', 'Admin'), 'Published');
  assert.throws(() => transitionApi('Draft', 'Published', 'Admin'));
  assert.throws(() => transitionApi('Approved', 'Published', 'Provider'));
  assert.throws(() => transitionApi('Under Review', 'Rejected', 'Admin'));
  assert.equal(transitionApi('Under Review', 'Rejected', 'Admin', 'Missing rights'), 'Rejected');
  assert.equal(transitionApi('Rejected', 'Draft', 'Provider'), 'Draft');
});
test('OpenAPI JSON resolves local references and preserves path/query parameters and response schemas', async () => {
  const result = await importOpenApi(JSON.stringify(spec()));
  assert.equal(result.endpoints[0]?.path, '/items/{id}');
  assert.equal(result.endpoints[0]?.parameters.length, 2);
  assert.equal(result.endpoints[0]?.responses['200'].content['application/json'].schema.properties.name.type, 'string');
  assert.doesNotThrow(() => JSON.stringify(result.documentation));
  const uploaded = await importOpenApi(readFileSync('backend/test/fixtures/provider-import.openapi.yaml', 'utf8'));
  assert.equal(uploaded.endpoints[0]?.requestBody.content['application/json'].schema.properties.name.type, 'string');
  assert.equal(uploaded.endpoints[0]?.responses['201'].description, 'Item created');
});
test('Swagger YAML imports request parameters and response documentation', async () => {
  const result = await importOpenApi('swagger: "2.0"\ninfo:\n  title: Demo\n  version: "1.0"\npaths:\n  /weather:\n    get:\n      responses:\n        "200":\n          description: OK\n');
  assert.equal(result.endpoints[0]?.method, 'GET');
});
test('invalid imports report locations and reject external refs, cycles, aliases and oversize', async () => {
  await assert.rejects(importOpenApi('info: [\n'), error => error instanceof ImportError && error.details[0]!.field.startsWith('line:'));
  for (const ref of ['http://127.0.0.1/private', 'file:///etc/passwd', './secret.json', '#/components/schemas/Unknown']) {
    const data = spec(); data.components.schemas.Item = { $ref: ref } as any;
    await assert.rejects(importOpenApi(JSON.stringify(data)), ImportError);
  }
  const circular = spec(); circular.components.schemas.Item = { $ref: '#/components/schemas/Item' } as any;
  await assert.rejects(importOpenApi(JSON.stringify(circular)), ImportError);
  await assert.rejects(importOpenApi('a: &a\n  child: *a\nopenapi: 3.0.3\n'), ImportError);
  await assert.rejects(importOpenApi('x'.repeat(1024 * 1024 + 1)), ImportError);
  await assert.rejects(importOpenApi(JSON.stringify({ openapi: '3.0.3', paths: {} })), ImportError);
  const pathMissing = spec(); pathMissing.paths['/items/{id}'].parameters = [];
  await assert.rejects(importOpenApi(JSON.stringify(pathMissing)), error => error instanceof ImportError && error.details[0]!.field.includes('/parameters'));
  const amplified = spec();
  const definitions: Record<string, any> = { Layer0: { type: 'string' } };
  for (let i = 1; i <= 17; i++) definitions[`Layer${i}`] = { type: 'object', properties: { left: { $ref: `#/components/schemas/Layer${i - 1}` }, right: { $ref: `#/components/schemas/Layer${i - 1}` } } };
  amplified.components.schemas = { ...definitions, Item: { $ref: '#/components/schemas/Layer17' } } as any;
  await assert.rejects(importOpenApi(JSON.stringify(amplified)), error => error instanceof ImportError && error.details[0]!.message.includes('limit exceeded'));
});
test('proposal contains Provider contracts and no Admin handlers', () => {
  assert.ok(providerContract.paths['/api/provider/apis/{id}/submit-review']);
  assert.ok(providerContract.paths['/api/provider/apis/{id}/import-openapi']);
  assert.ok(Object.keys(providerContract.paths).every(path => path.startsWith('/api/provider/')));
  assert.deepEqual(JSON.parse(readFileSync('backend/provider-sprint2.openapi.json', 'utf8')), JSON.parse(JSON.stringify(providerContract)));
});

test('domain lookup errors: absent proof is 400, resolver failure stays 503, unknown codes fail closed', () => {
  for (const code of ['ENODATA', 'ENOTFOUND', 'ENOTIMP']) {
    const error = classifyDomainLookupError(Object.assign(new Error('dns'), { code }));
    assert.equal(error.status, 400); assert.equal(error.code, 'DOMAIN_PROOF_MISSING');
  }
  for (const code of ['ECONNREFUSED', 'ECONNRESET', 'ETIMEOUT', 'ETIMEDOUT', 'EREFUSED', 'ESERVFAIL', 'ECANCELLED', 'EPERM', 'SOMETHING_NEW', '']) {
    const error = classifyDomainLookupError(Object.assign(new Error('dns'), { code }));
    assert.equal(error.status, 503); assert.equal(error.code, 'DNS_UNAVAILABLE');
  }
  assert.equal(classifyDomainLookupError(null).status, 503);
  assert.equal(classifyDomainLookupError('EACCES').status, 503);
});

test('DNS_SERVERS parsing accepts IP and IP:port lists and rejects anything else', () => {
  assert.deepEqual(parseDnsServers(undefined), []);
  assert.deepEqual(parseDnsServers(' 8.8.8.8 , 1.1.1.1:53 ,, '), ['8.8.8.8', '1.1.1.1:53']);
  assert.deepEqual(parseDnsServers('2001:4860:4860::8888'), ['2001:4860:4860::8888']);
  assert.deepEqual(invalidDnsServers(['8.8.8.8', '1.1.1.1:53', '[::1]:5353', '127.0.0.1:15353']), []);
  assert.deepEqual(invalidDnsServers(['dns.google', '8.8.8.8:0', '8.8.8.8:70000', '1.2.3', '8.8.8.8:abc']),
    ['dns.google', '8.8.8.8:0', '8.8.8.8:70000', '1.2.3', '8.8.8.8:abc']);
});