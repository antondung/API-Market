const budgetAmount = { oneOf: [
  { type: 'string', pattern: '^(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,2})?$', example: '30.00' },
  { type: 'number', minimum: 0.01, maximum: 999999999999.99, multipleOf: 0.01 },
] };
const hardCutoff = { type: 'boolean', default: false };
const summary = {
  type: 'object',
  required: ['data'],
  properties: {
    data: {
      type: 'object',
      required: ['periodStart', 'periodEndExclusive', 'unpricedRequests', 'currencies'],
      properties: {
        periodStart: { type: 'string', format: 'date' },
        periodEndExclusive: { type: 'string', format: 'date' },
        unpricedRequests: { type: 'string', pattern: '^[0-9]+$' },
        currencies: {
          type: 'array',
          items: {
            type: 'object',
            required: ['currency', 'estimatedSpend', 'monthlyBudget', 'hardCutoff', 'spentPercent', 'settledSandboxCharges', 'reachedThresholds'],
            properties: {
              currency: { type: 'string', example: 'USD' },
              estimatedSpend: { type: 'string', example: '24.50' },
              monthlyBudget: { type: 'string', nullable: true, example: '30.00' },
              hardCutoff: { type: 'boolean' },
              spentPercent: { type: 'number', nullable: true },
              settledSandboxCharges: { type: 'string', example: '30.00' },
              reachedThresholds: { type: 'array', items: { type: 'integer', enum: [50, 80, 100] } },
            },
          },
        },
      },
    },
  },
};
const buyerOperation = {
  tags: ['Cost Guard'],
  security: [{ bearerAuth: [] }],
  description: 'Consumer or Provider JWT. UTC calendar month. Each admitted request contributes plan price divided by quota, rounded in aggregate to two decimals. Sandbox charges are reported separately. With hardCutoff, paid Gateway calls at or above the cap, or projected to exceed it, return 429 BUDGET_EXHAUSTED.',
  responses: {
    '200': { description: 'Current month and budget thresholds', content: { 'application/json': { schema: summary } } },
    '400': { description: 'Invalid input' },
    '401': { description: 'Authentication required' },
    '403': { description: 'Buyer role required' },
  },
};
export const costGuardPaths = {
  '/api/consumer/cost-guard': {
    get: { ...buyerOperation, summary: 'Get my Cost Guard budget and spend' },
    put: {
      ...buyerOperation,
      summary: 'Set my monthly budget for one currency',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { oneOf: [
          { type: 'object', additionalProperties: false, required: ['currency', 'monthlyBudget'],
            properties: { currency: { type: 'string', pattern: '^[A-Z]{3}$' }, monthlyBudget: budgetAmount, hardCutoff } },
          { type: 'object', additionalProperties: false, required: ['monthlyBudgetUsd'],
            properties: { monthlyBudgetUsd: budgetAmount, hardCutoff } },
        ] } } },
      },
    },
  },
};

export const gatewayApiKey = { type: 'apiKey', in: 'header', name: 'x-api-key' };
const gatewayResponses = {
  '200': { description: 'Successful upstream response. Status and response type depend on the registered endpoint.' },
  '400': { description: 'Invalid API ID, path, query, headers or request body' },
  '401': { description: 'Missing, invalid or revoked API key' },
  '403': { description: 'Subscription required or upstream destination blocked' },
  '404': { description: 'No matching registered route or upstream resource' },
  '413': { description: 'Request or upstream response exceeds the size limit' },
  '429': { description: 'RATE_LIMITED, QUOTA_EXHAUSTED or BUDGET_EXHAUSTED' },
  '502': { description: 'Upstream unavailable or redirect blocked' },
  '503': { description: 'Metering unavailable. Gateway fails closed.' },
  '504': { description: 'Upstream timed out' },
  default: { description: 'Other upstream status and body' },
};
const gatewayMethods = ['get', 'head', 'post', 'put', 'patch', 'delete', 'options'];
function gatewayOperations(hasPath: boolean) {
  return Object.fromEntries(gatewayMethods.map(method => [method, {
    summary: 'Forward a request to a registered API endpoint',
    description: 'Use the method and concrete path registered for this API. Query parameters are defined by the target endpoint. A valid API key and active subscription are required.',
    tags: ['Gateway'],
    security: [{ gatewayApiKey: [] }],
    parameters: [
      { name: 'apiId', in: 'path', required: true, schema: { type: 'string', pattern: '^[1-9][0-9]*$' } },
      ...(hasPath ? [{
        name: 'endpointPath', in: 'path', required: true, schema: { type: 'string' },
        description: 'Concrete relative path, without the leading slash.', example: 'items/123',
      }] : []),
    ],
    ...(!['get', 'head', 'delete'].includes(method) ? {
      requestBody: { content: { 'application/json': { schema: {} } } },
    } : {}),
    responses: gatewayResponses,
  }]));
}
export const gatewayPaths = {
  '/api/gateway/{apiId}': gatewayOperations(false),
  '/api/gateway/{apiId}/{endpointPath}': gatewayOperations(true),
};
