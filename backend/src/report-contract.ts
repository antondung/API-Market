/** OpenAPI paths for Consumer reports and Admin moderation (US-15). */
export const reportPaths = {
  '/api/consumer/reports': {
    get: {
      summary: 'List my reports',
      description: 'Reports filed by the signed-in Consumer, newest first.',
      tags: ['Consumer reports'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
        { name: 'pageSize', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50 } },
      ],
      responses: { '200': { description: 'Paginated reports' }, '401': { description: 'Authentication failed' } },
    },
  },
  '/api/consumer/reports/{apiId}': {
    post: {
      summary: 'Report a published API',
      description: 'Only a Published API can be reported. Description is 10-5000 characters.',
      tags: ['Consumer reports'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'apiId', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['category', 'description'],
              properties: {
                category: { type: 'string', enum: ['Security Vulnerability', 'Copyright / IP Infringement', 'Extreme Downtime', 'Malicious Data'] },
                description: { type: 'string', minLength: 10, maxLength: 5000 },
              },
            },
          },
        },
      },
      responses: {
        '201': { description: 'Report created' },
        '400': { description: 'Invalid input' },
        '404': { description: 'Published API not found' },
      },
    },
  },
  '/api/admin/reports': {
    get: {
      summary: 'Moderation queue',
      description: 'Defaults to open cases (Pending and Under Investigation).',
      tags: ['Admin moderation'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['Pending', 'Under Investigation', 'Resolved', 'Dismissed'] } },
        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
        { name: 'pageSize', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50 } },
      ],
      responses: { '200': { description: 'Paginated reports' }, '403': { description: 'Admin role required' } },
    },
  },
  '/api/admin/reports/{id}/review': {
    post: {
      summary: 'Decide a report',
      description: 'Suspend or Remove move a Published API to Suspended. Restore returns a Suspended API to Published and may be applied to a case already resolved by Suspend.',
      tags: ['Admin moderation'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['action', 'note'],
              properties: {
                action: { type: 'string', enum: ['Suspend', 'Restore', 'Remove', 'Dismiss'] },
                note: { type: 'string', minLength: 1, maxLength: 2000 },
              },
            },
          },
        },
      },
      responses: {
        '200': { description: 'Decision applied' },
        '400': { description: 'Invalid input' },
        '403': { description: 'Admin role required' },
        '409': { description: 'Report closed or API in the wrong state' },
      },
    },
  },
};