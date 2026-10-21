const string = { type: 'string' };
const object = (properties: object, required: string[] = Object.keys(properties)) => ({ type: 'object', properties, required });
const array = (items: object) => ({ type: 'array', items });
const summary = object({
  id: string, name: string, description: string, category: string, tags: array(string),
  publishedAt: { type: 'string', format: 'date-time', nullable: true }, providerId: string,
  providerName: string, providerStatus: { type: 'string', enum: ['Pending', 'Verified', 'Rejected'] },
  hasFreePlan: { type: 'boolean' }, hasPaidPlan: { type: 'boolean' },
}, ['id', 'name', 'description', 'category', 'tags', 'providerId', 'providerName', 'providerStatus', 'hasFreePlan', 'hasPaidPlan']);
const envelope = (schema: object) => ({ description: 'Success', content: { 'application/json': { schema: object({ data: schema }, ['data']) } } });
const error = (description: string) => ({ description, content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } });
const query = (name: string, schema: object, description: string) => ({ name, in: 'query', schema, description });
export const marketplacePaths = {
  '/api/marketplace/apis': { get: {
    tags: ['Marketplace'], summary: 'Search published APIs', security: [],
    description: 'Public endpoint. Only Published APIs of active provider accounts. All filters combine with AND. Text search is a literal case-insensitive substring of name/description; tag/category are exact matches. Free/Paid mean at least one active zero-price/positive-price plan; an API can match both. Newest sorts by publication time, then ID; name sorts case-insensitively, then ID. No authentication required.',
    parameters: [query('q', { ...string, minLength: 1, maxLength: 200 }, 'Search name/description'),
      query('category', { ...string, minLength: 1, maxLength: 100 }, 'Exact category'),
      query('tag', { ...string, minLength: 1, maxLength: 100 }, 'Exact tag'),
      query('providerId', { ...string, pattern: '^[1-9][0-9]{0,9}$' }, 'Provider ID (maximum 2147483647)'),
      query('pricing', { type: 'string', enum: ['free', 'paid'] }, 'Active plan price filter'),
      query('sort', { type: 'string', enum: ['newest', 'name'], default: 'newest' }, 'Stable sort'),
      query('page', { type: 'integer', minimum: 1, maximum: 10000, default: 1 }, 'Page number'),
      query('pageSize', { type: 'integer', minimum: 1, maximum: 100, default: 20 }, 'Items per page')],
    responses: { '200': envelope(object({ items: array(summary), total: { type: 'integer' }, page: { type: 'integer' }, pageSize: { type: 'integer' } }, ['items', 'total', 'page', 'pageSize'])), '400': error('Invalid query; unknown and repeated parameters are rejected'), '429': error('Rate limited') },
  } },
  '/api/marketplace/apis/{id}': { get: {
    tags: ['Marketplace'], summary: 'Read published API details', security: [],
    description: 'Public metadata, provider verification status, all versions, registered endpoints, imported documentation, active pricing plans and data classification. Draft/non-public/missing APIs and inactive provider accounts return the same 404. Internal review notes, audit records, verification evidence, domain proof and user credentials are excluded.',
    parameters: [{ name: 'id', in: 'path', required: true, schema: { ...string, pattern: '^[1-9][0-9]{0,9}$' } }],
    responses: { '200': envelope(object({ ...summary.properties,
      versions: array(object({ id: string, version: string, changelog: string })),
      endpoints: array(object({ id: string, versionId: string, method: string, path: string, description: string,
        parameters: array({ type: 'object', additionalProperties: true }), requestSchema: { type: 'object', nullable: true, additionalProperties: true },
        responseExample: { nullable: true, description: 'Arbitrary JSON response example' } })),
      documentation: array(object({ versionId: string, source: string, content: { description: 'Imported OpenAPI JSON document' } })),
      plans: array(object({ id: string, name: string, priceMonthly: { type: 'number' }, currency: string, quota: { type: 'number' }, rateLimit: { type: 'integer' } })),
      legal: { ...object({ dataClassification: string, processesPersonalData: { type: 'boolean' }, personalDataTypes: array(string), dataProcessingPurpose: { ...string, nullable: true } }), nullable: true },
    }, [...summary.required, 'versions', 'endpoints', 'documentation', 'plans', 'legal'])), '404': error('API not found'), '429': error('Rate limited') },
  } },
};
