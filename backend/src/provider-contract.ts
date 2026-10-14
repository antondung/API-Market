import { z } from 'zod';
import { providerSchemas } from './provider-domain.js';

const routes = [
  ['get', '/api/provider/verification', '', 'Get current verification'],
  ['post', '/api/provider/verification', 'verification', 'Submit verification'],
  ['get', '/api/provider/apis', '', 'List own APIs'],
  ['post', '/api/provider/apis', 'api', 'Create Draft API (Verified only)'],
  ['get', '/api/provider/apis/{id}', '', 'Get own API'],
  ['put', '/api/provider/apis/{id}', 'api', 'Replace Draft metadata'],
  ['delete', '/api/provider/apis/{id}', '', 'Delete own Draft API'],
  ['get', '/api/provider/apis/{id}/versions', '', 'List versions'],
  ['post', '/api/provider/apis/{id}/versions', 'version', 'Create Draft version'],
  ['put', '/api/provider/apis/{id}/versions/{vid}', 'version', 'Update Draft version'],
  ['delete', '/api/provider/apis/{id}/versions/{vid}', '', 'Delete Draft version and associated content'],
  ['get', '/api/provider/apis/{id}/endpoints', '', 'List endpoints'],
  ['post', '/api/provider/apis/{id}/endpoints', 'endpoint', 'Create Draft endpoint'],
  ['put', '/api/provider/apis/{id}/endpoints/{eid}', 'endpoint', 'Replace Draft endpoint'],
  ['delete', '/api/provider/apis/{id}/endpoints/{eid}', '', 'Delete Draft endpoint'],
  ['post', '/api/provider/apis/{id}/import-openapi', 'import', 'Import JSON/YAML into Draft'],
  ['get', '/api/provider/apis/{id}/documentation', '', 'Read imported documentation'],
  ['get', '/api/provider/apis/{id}/plans', '', 'List plans'],
  ['post', '/api/provider/apis/{id}/plans', 'plan', 'Create Draft plan'],
  ['put', '/api/provider/apis/{id}/plans/{pid}', 'plan', 'Replace Draft plan'],
  ['delete', '/api/provider/apis/{id}/plans/{pid}', '', 'Delete Draft plan'],
  ['put', '/api/provider/apis/{id}/legal', 'legal', 'Declare rights and accept current agreement'],
  ['get', '/api/provider/apis/{id}/legal', '', 'Read legal declaration'],
  ['get', '/api/provider/agreement', '', 'Get current server agreement version'],
  ['get', '/api/provider/apis/{id}/publish-status', '', 'Get workflow status'],
  ['post', '/api/provider/apis/{id}/submit-review', '', 'Submit complete Draft'],
  ['post', '/api/provider/apis/{id}/reopen', '', 'Return rejected API to Draft'],
] as const;
const schemas = Object.fromEntries(Object.entries(providerSchemas).map(([name, schema]) => {
  const { $schema, ...jsonSchema } = z.toJSONSchema(schema);
  return [name, jsonSchema];
}));
const string = { type: 'string' };
const integer = { type: 'integer' };
const timestamp = { type: ['string', 'null'], format: 'date-time' };
const record = (properties: object, required = ['id']) => ({ type: 'object', properties, required });
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const array = (name: string) => ({ type: 'array', items: ref(name) });
Object.assign(schemas, {
  ProviderApi: record({ id: string, providerId: string, name: string, description: string, category: string, baseUrl: string, tags: { type: 'array', items: string }, status: { type: 'string', enum: ['Draft','Submitted','Under Review','Approved','Published','Rejected'] }, submittedAt: timestamp, approvedAt: timestamp, publishedAt: timestamp, createdAt: timestamp, updatedAt: timestamp }),
  ProviderVerification: record({ id: string, providerId: string, organizationName: string, contactEmail: string, evidenceUrls: { type: 'array', items: string }, status: { type: 'string', enum: ['Pending','Verified','Rejected'] }, rejectReason: { type: ['string','null'] }, reviewedBy: { type: ['string','null'] }, reviewedAt: timestamp, submittedAt: timestamp }),
  ProviderVersion: record({ id: string, apiId: string, version: string, changelog: string, openapiDocument: { type: ['object','null'] } }),
  ProviderEndpoint: record({ id: string, apiId: string, versionId: string, method: string, path: string, description: string, parameters: { type: 'array', items: { type: 'object' } }, requestSchema: {}, responseExample: {} }),
  ProviderPlan: record({ id: string, apiId: string, name: { type: 'string', enum: ['Free','Basic','Pro'] }, priceMonthly: { type: 'number' }, currency: string, quota: integer, rateLimit: integer, isActive: { type: 'boolean' } }),
  ProviderLegal: record({ id: string, apiId: string, agreementId: string, agreementVersion: string, ownershipDeclaration: string, distributionRights: string, dataClassification: string, acceptedAt: timestamp }),
  ProviderAgreement: record({ id: string, version: string, content: string, effectiveAt: timestamp }),
  ProviderDocumentation: record({ id: string, apiId: string, versionId: string, source: string, content: { type: 'object' } }),
  ProviderError: record({ error: record({ code: string, message: string, requestId: string, details: { type: 'array', items: record({ field: string, message: string }, ['field','message']) } }, ['code','message','requestId']) }, ['error']),
});
function resultSchema(path: string, method: string): object {
  if (path.endsWith('/import-openapi')) return record({ versionId: string, endpointCount: integer, title: string }, ['versionId','endpointCount','title']);
  if (path.endsWith('/publish-status')) return record({ id: string, status: string, submittedAt: timestamp, approvedAt: timestamp, publishedAt: timestamp });
  if (path.endsWith('/verification')) return method === 'get' ? { anyOf: [ref('ProviderVerification'), { type: 'null' }] } : ref('ProviderVerification');
  if (path.endsWith('/agreement')) return ref('ProviderAgreement');
  if (path.endsWith('/legal')) return { anyOf: [ref('ProviderLegal'), { type: 'null' }] };
  if (path.endsWith('/documentation')) return array('ProviderDocumentation');
  if (path.includes('/versions')) return method === 'get' ? array('ProviderVersion') : ref('ProviderVersion');
  if (path.includes('/endpoints')) return method === 'get' ? array('ProviderEndpoint') : ref('ProviderEndpoint');
  if (path.includes('/plans')) return method === 'get' ? array('ProviderPlan') : ref('ProviderPlan');
  if (path === '/api/provider/apis' && method === 'get') return record({ items: array('ProviderApi'), total: integer, page: integer, pageSize: integer }, ['items','total','page','pageSize']);
  return ref('ProviderApi');
}
export const providerContract = {
  openapi: '3.1.0', info: { title: 'API Market — Sprint 2 Provider', version: '0.2.0',
    description: 'Implemented with PostgreSQL schema 003 from Danh. Provider owner required; creation requires Verified; mutations require Draft. Admin review routes belong to Dũng. Standard data/error envelopes; child collections return arrays, API list returns items,total,page,pageSize. Import replaces endpoints/docs for versionId atomically. Manual endpoint edits invalidate imported documentation.' },
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } }, schemas },
  paths: Object.fromEntries([...new Set(routes.map(route => route[1]))].map(path => [path,
    Object.fromEntries(routes.filter(route => route[1] === path).map(([method, , schema, summary]) => [method, {
      summary, security: [{ bearerAuth: [] }],
      parameters: [...[...path.matchAll(/\{(\w+)\}/g)].map(match => ({ name: match[1], in: 'path', required: true, schema: { type: 'string' } })),
        ...(method === 'get' && path === '/api/provider/apis' ? [{ name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 10000, default: 1 } }, { name: 'pageSize', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } }] : [])],
      ...(schema ? { requestBody: { required: true, content: schema === 'import'
        ? { 'multipart/form-data': { schema: { type: 'object', additionalProperties: false, properties: { file: { type: 'string', format: 'binary', description: 'JSON/YAML, max 1 MiB, internal refs only' }, versionId: { type: 'string', pattern: '^[1-9][0-9]{0,9}$' } }, required: ['file', 'versionId'] } } }
        : { 'application/json': { schema: { $ref: `#/components/schemas/${schema}` } } } } } : {}),
      responses: Object.fromEntries([method === 'delete' ? '204' : method === 'post' && !['import', ''].includes(schema) ? '201' : '200', '400', '401', '403', '404', '409', ...(schema === 'import' ? ['413', '415'] : [])].map(code => [code, {
        description: ['200', '201', '204'].includes(code) ? 'Success' : 'Standard error envelope',
        ...(code === '204' ? {} : { content: { 'application/json': { schema: ['200','201'].includes(code) ? record({ data: resultSchema(path, method) }, ['data']) : ref('ProviderError') } } }),
      }])),
    }]))])),
};
