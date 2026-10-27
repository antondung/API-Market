const text = { type: 'string' };
const number = { type: 'integer', minimum: 0 };
const date = { type: 'string', format: 'date-time' };
const object = (properties: Record<string, object>, required = Object.keys(properties)) => ({ type: 'object', properties, ...(required.length ? { required } : {}), additionalProperties: false });
const envelope = (schema: object, description = 'Success') => ({ description, content: { 'application/json': { schema: object({ data: schema }) } } });
const error = (description: string) => ({ description, content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } });
const errors = { '400': error('Invalid input; unknown fields rejected'), '401': error('Consumer JWT required'), '403': error('Consumer role required, SSRF blocked or sandbox unavailable'), '404': error('Resource not found or API/route not available'), '429': error('Rate limited') };
const security = [{ bearerAuth: [] }];
const id = (name: string) => ({ name, in: 'path', required: true, schema: { ...text, pattern: '^[1-9][0-9]*$' } });
const jsonBody = (schema: object, required = true) => ({ required, content: { 'application/json': { schema } } });
const grant = object({ id: text, apiId: text, maxRequests: { type: 'integer', minimum: 3, maximum: 10 }, usedRequests: number,
  remainingRequests: number, available: { type: 'boolean' }, expiresAt: date, revokedAt: { ...date, nullable: true } });
const keyFields = { id: text, apiId: text, keyPrefix: text, label: { ...text, nullable: true }, isActive: { type: 'boolean' },
  lastUsedAt: { ...date, nullable: true }, revokedAt: { ...date, nullable: true }, createdAt: date };
const empty = object({});
const dictionary = (maxProperties: number, maxLength: number) => ({ type: 'object', maxProperties, additionalProperties: { ...text, maxLength } });

export const consumerPaths = {
  '/api/consumer/apis/{apiId}/sandbox': {
    get: { tags: ['Sandbox'], summary: 'Read own persistent sandbox grant', security, parameters: [id('apiId')],
      description: 'Published API of an active Provider only. A grant is not created implicitly. Returns remainingRequests=0 and available=false for expired, revoked or exhausted grants.',
      responses: { '200': envelope(grant), ...errors } },
    post: { tags: ['Sandbox'], summary: 'Claim one sandbox grant per Consumer/API', security, parameters: [id('apiId')], requestBody: jsonBody(empty, false),
      description: '5 requests, valid 24 hours. Repeated calls return the existing grant, including expired/exhausted grants; never renew expiry or reset quota. Quota is server-controlled. Requires Consumer JWT, not an API key.',
      responses: { '201': envelope(grant, 'New grant'), '200': envelope(grant, 'Existing grant, unchanged'), ...errors } },
  },
  '/api/consumer/api-keys': {
    get: { tags: ['API Keys'], summary: 'List own key metadata without secrets/hashes', security,
      parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 10000, default: 1 } },
        { name: 'pageSize', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } }],
      responses: { '200': envelope(object({ items: { type: 'array', items: object(keyFields) }, total: number, page: number, pageSize: number })), ...errors } },
    post: { tags: ['API Keys'], summary: 'Create a key; copy the secret now, it is shown once', security,
      description: 'Consumer JWT. Published API of active Provider only. One active key per Consumer/API. Stores SHA-256 of a 256-bit random secret. This credential does not grant paid subscription entitlement; Gateway must separately enforce plan access.',
      requestBody: jsonBody(object({ apiId: { ...text, pattern: '^[1-9][0-9]{0,9}$' }, label: { ...text, minLength: 1, maxLength: 100 } }, ['apiId'])),
      responses: { '201': envelope(object({ ...keyFields, key: { ...text, writeOnly: false, description: 'One-time plaintext secret. Never returned by list.' } })), '409': error('An active key already exists'), ...errors } },
  },
  '/api/consumer/api-keys/{id}/rotate': { post: { tags: ['API Keys'], summary: 'Atomically revoke the old key and create a new key', security,
    parameters: [id('id')], requestBody: jsonBody(empty, false), description: 'Owner only. Old key immediately invalid. Concurrent rotate requests cannot produce multiple active keys. New secret is shown once.',
    responses: { '201': envelope(object({ ...keyFields, key: text })), '409': error('Key already revoked'), ...errors } } },
  '/api/consumer/api-keys/{id}': { delete: { tags: ['API Keys'], summary: 'Revoke own key, including keys for unavailable APIs', security,
    parameters: [id('id')], description: 'Idempotent for a key owned by the current Consumer. Other owners receive 404.', responses: { '204': { description: 'Revoked' }, ...errors } } },
  '/api/marketplace/apis/{id}/playground': { post: { tags: ['Playground'], summary: 'Execute a registered endpoint using one sandbox request', security,
    parameters: [id('id')], requestBody: jsonBody(object({ endpointId: { ...text, pattern: '^[1-9][0-9]{0,9}$' }, pathParams: dictionary(20, 500),
      query: dictionary(30, 2000), headers: { ...dictionary(3, 1000), description: 'Only accept, accept-language, content-type (case-insensitive). Platform credentials and internal headers forbidden.' },
      body: { description: 'Optional JSON body, forbidden for GET/HEAD. Total incoming JSON limit: 16 KiB.' } }, ['endpointId'])),
    description: 'Consumer JWT. Claim a sandbox grant first. Method/path come from the API endpoint registry, never client URL/method. Public DNS/IP validation and path/header validation occur before quota consumption. Approved attempts consume quota even on upstream errors. All DNS answers must be public; connection pins the selected address, checks peer IP, retains TLS hostname, never follows redirects. Total deadline <=10 seconds including DNS; response <=2 MiB. Binary/encoded upstream bodies are returned base64. All responses use no-store.',
    responses: { '200': envelope(object({ status: { type: 'integer' }, headers: { type: 'object', additionalProperties: text }, body: text,
      bodyEncoding: { type: 'string', enum: ['utf8', 'base64'] }, latencyMs: number, remainingRequests: number })),
      '413': error('Request too large or upstream response exceeds 2 MiB'), '502': error('Upstream unavailable or redirect blocked'), '504': error('Upstream/DNS deadline exceeded'), ...errors } } },
};
