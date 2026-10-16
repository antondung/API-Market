// HTTP contract for the Admin review module handed off by Dũng (63e8aea).
const text = { type: 'string' };
const body = (properties: object, required: string[]) => ({ required: true, content: { 'application/json': { schema: { type: 'object', additionalProperties: false, properties, required } } } });
const routes = [
  ['get', '/api/admin/provider-verifications', 'List latest Provider verifications'],
  ['get', '/api/admin/provider-verifications/{providerId}', 'Get latest verification dossier'],
  ['post', '/api/admin/provider-verifications/{providerId}/review', 'Approve or reject Provider'],
  ['get', '/api/admin/apis', 'List APIs by workflow status'],
  ['get', '/api/admin/apis/{id}/dossier', 'Get full API dossier with privacy declaration'],
  ['post', '/api/admin/apis/{id}/review', 'Move review status, approve/reject/publish with audit'],
  ['get', '/api/admin/audit-logs', 'Filter audit log'],
  ['get', '/api/admin/audit-logs/actions', 'List audit action names'],
] as const;
export const adminReviewPaths = Object.fromEntries(routes.map(([method, path, summary]) => [path, { [method]: {
  summary, security: [{ bearerAuth: [] }],
  parameters: [
    ...[...path.matchAll(/\{(\w+)\}/g)].map(match => ({ name: match[1], in: 'path', required: true, schema: text })),
    ...(path === '/api/admin/apis' || path === '/api/admin/provider-verifications' ? [{ name: 'status', in: 'query', schema: { type: 'string', enum: path === '/api/admin/apis' ? ['Draft','Submitted','Under Review','Approved','Published','Rejected'] : ['Pending','Verified','Rejected'] } }] : []),
    ...(['apis','provider-verifications','audit-logs'].some(suffix => path.endsWith(`/${suffix}`)) ? [{ name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } }, { name: 'pageSize', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } }] : []),
    ...(path === '/api/admin/audit-logs' ? ['actorId','action','targetType','targetId','from','to'].map(name => ({ name, in: 'query', schema: text })) : []),
  ],
  ...(method === 'post' ? { requestBody: path.includes('provider-verifications')
    ? body({ decision: { type: 'string', enum: ['Verified','Rejected'] }, reason: { type: 'string', maxLength: 1000, description: 'Required for rejection' } }, ['decision'])
    : body({ next: { type: 'string', enum: ['Under Review','Approved','Rejected','Published'] }, reason: { type: 'string', maxLength: 1000, description: 'Required for rejection' } }, ['next']) } : {}),
  responses: Object.fromEntries(['200','400','401','403','404','409'].map(code => [code, { description: code === '200' ? 'Data envelope; dossier includes API/provider/versions/endpoints/plans/legal/documentation/reviews' : 'Standard error envelope', content: { 'application/json': { schema: code === '200' ? { type: 'object', required: ['data'], properties: { data: {} } } : { $ref: '#/components/schemas/Error' } } } }])),
} }]));
