const bearer = [{ bearerAuth: [] }];
const id = { type: 'string', pattern: '^[1-9][0-9]*$' };
const reason = {
  type: 'object',
  additionalProperties: false,
  required: ['reason'],
  properties: { reason: { type: 'string', minLength: 1, maxLength: 1000 } },
};
const page = [
  { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 10000 } },
  { name: 'pageSize', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
];
const dates = ['from', 'to'].map((name) => ({ name, in: 'query', schema: { type: 'string', format: 'date-time' } }));

function operation(summary: string, parameters: object[] = [], schema?: object) {
  return {
    summary,
    tags: ['Admin supervision'],
    security: bearer,
    parameters,
    ...(schema ? { requestBody: { required: true, content: { 'application/json': { schema } } } } : {}),
    responses: {
      '200': { description: 'Data envelope. Sandbox payments are labelled sandbox and are not real charges.' },
      '400': { description: 'Validation error. reason is required for revoke, suspend and restore.' },
      '401': { description: 'Authentication failed' },
      '403': { description: 'Admin role required, or the subscription is suspended' },
      '404': { description: 'Resource not found' },
      '409': { description: 'Invalid state. Key revocation is irreversible.' },
    },
  };
}

export const adminSupervisionPaths = {
  '/api/admin/subscriptions': {
    get: operation('List subscriptions by status, consumer, API and date range', [
      { name: 'status', in: 'query', schema: { type: 'string', enum: ['Pending', 'Active', 'Cancelled', 'Canceled', 'Expired', 'Suspended'] } },
      { name: 'consumerId', in: 'query', schema: id },
      { name: 'apiId', in: 'query', schema: id },
      ...dates,
      ...page,
    ]),
  },
  '/api/admin/sandbox-payments': {
    get: operation('List sandbox payments. Every item is labelled sandbox.', [
      { name: 'status', in: 'query', schema: { type: 'string', enum: ['Pending', 'Succeeded', 'Failed', 'Expired'] } },
      ...dates,
      ...page,
    ]),
  },
  '/api/admin/api-keys/{id}/revoke': {
    post: operation('Revoke an API key immediately and permanently. The next Gateway call returns 401.', [
      { name: 'id', in: 'path', required: true, schema: id },
    ], reason),
  },
  '/api/admin/subscriptions/{id}/suspend': {
    post: operation('Suspend a subscription immediately. The next Gateway call returns 403. Quota is kept.', [
      { name: 'id', in: 'path', required: true, schema: id },
    ], reason),
  },
  '/api/admin/subscriptions/{id}/restore': {
    post: operation('Restore a suspended subscription. Quota is not reset.', [
      { name: 'id', in: 'path', required: true, schema: id },
    ], reason),
  },
};
