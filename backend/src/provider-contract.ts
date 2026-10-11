import { z } from 'zod';
import { providerSchemas } from './provider-domain.js';

const routes = [
  ['get', '/api/provider/verification', '', 'Get current verification'],
  ['post', '/api/provider/verification', 'verification', 'Submit verification'],
  ['get', '/api/provider/apis', '', 'List own APIs'],
  ['post', '/api/provider/apis', 'api', 'Create Draft API (Verified only)'],
  ['get', '/api/provider/apis/{id}', '', 'Get own API'],
  ['put', '/api/provider/apis/{id}', 'api', 'Replace Draft metadata'],
  ['get', '/api/provider/apis/{id}/versions', '', 'List versions'],
  ['post', '/api/provider/apis/{id}/versions', 'version', 'Create Draft version'],
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
export const providerContract = {
  openapi: '3.1.0', info: { title: 'API Market — Sprint 2 Provider proposal', version: '0.1.0',
    description: 'DESIGN CONTRACT ONLY. These routes are not mounted yet; PostgreSQL Sprint 2 schema, QA acceptance and shared contracts await handoff. Provider owner required; creation requires Verified; mutations require Draft. Admin review routes belong to Dũng.' },
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } }, schemas },
  paths: Object.fromEntries([...new Set(routes.map(route => route[1]))].map(path => [path,
    Object.fromEntries(routes.filter(route => route[1] === path).map(([method, , schema, summary]) => [method, {
      summary, security: [{ bearerAuth: [] }], 'x-implementation-status': 'awaiting-database',
      parameters: [...path.matchAll(/\{(\w+)\}/g)].map(match => ({ name: match[1], in: 'path', required: true, schema: { type: 'string' } })),
      ...(schema ? { requestBody: { required: true, content: schema === 'import'
        ? { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } }, required: ['file'] } } }
        : { 'application/json': { schema: { $ref: `#/components/schemas/${schema}` } } } } } : {}),
      responses: Object.fromEntries(['200', '400', '401', '403', '404', '409', ...(schema === 'import' ? ['413'] : [])].map(code => [code, { description: code === '200' ? 'Response shape pending schema handoff; data envelope' : 'Standard error envelope: error.code, message, requestId, details' }])),
    }]))])),
};
