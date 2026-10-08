const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const json = (schema: object) => ({ 'application/json': { schema } });
const response = (description: string, schema: object = ref('Error')) => ({ description, content: json(schema) });
const body = (schema: object) => ({ required: true, content: json(schema) });
const object = (properties: object, required: string[]) => ({ type: 'object', additionalProperties: false, properties, required });
const text = { type: 'string' };
const credentials = { email: { type: 'string', format: 'email', maxLength: 254 }, password: { type: 'string', minLength: 12, maxLength: 128 } };
const envelope = (schema: object) => object({ data: schema }, ['data']);
const security = [{ bearerAuth: [] }];
const requestErrors = {
  '403': response('Origin is not allowed'),
  '413': response('Request body too large'),
  '415': response('Content encoding or charset is not supported'),
};
export const openapi = {
  openapi: '3.0.3',
  info: { title: 'API Market — Sprint 1 Auth', version: '0.1.0', description: 'Persistent PostgreSQL Auth using PR #32 migrations. Consumer=USER, Provider=API_PROVIDER, Admin=ADMIN. Guard examples await QA approval.' },
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Register: object({ ...credentials, name: { type: 'string', minLength: 1, maxLength: 100, description: 'Optional display name; defaults to email local part (up to 100 characters).' }, role: { type: 'string', enum: ['Consumer', 'Provider'] } }, ['email', 'password', 'role']),
      Login: object({ ...credentials, password: { type: 'string', minLength: 1, maxLength: 128 } }, ['email', 'password']),
      Refresh: object({ refreshToken: { type: 'string', pattern: '^[A-Za-z0-9_-]{43}$' } }, ['refreshToken']),
      User: object({ id: { type: 'string', description: 'Opaque ID; PostgreSQL identity integer represented as a string' }, name: text, email: { type: 'string', format: 'email' }, role: { type: 'string', enum: ['Consumer', 'Provider', 'Admin'] } }, ['id', 'name', 'email', 'role']),
      Tokens: object({ accessToken: text, refreshToken: text, tokenType: { type: 'string', enum: ['Bearer'] }, expiresIn: { type: 'integer', example: 900 }, user: ref('User') }, ['accessToken', 'refreshToken', 'tokenType', 'expiresIn', 'user']),
      Error: object({ error: object({ code: text, message: text, requestId: text, details: { type: 'array', items: object({ field: text, message: text }, ['field', 'message']) } }, ['code', 'message', 'requestId']) }, ['error']),
    },
  },
  paths: {
    '/api/auth/register': { post: { summary: 'Register Consumer or Provider', requestBody: body(ref('Register')), responses: { ...requestErrors, '201': response('User created', envelope(ref('User'))), '400': response('Invalid input'), '409': response('Email exists'), '429': response('Rate limited') } } },
    '/api/auth/login': { post: { summary: 'Login (access token 15 minutes, session 7 days)', requestBody: body(ref('Login')), responses: { ...requestErrors, '200': response('Tokens', envelope(ref('Tokens'))), '400': response('Invalid input'), '401': response('Authentication failed'), '429': response('Rate limited') } } },
    '/api/auth/refresh': { post: { summary: 'Rotate refresh token; previous token becomes invalid', requestBody: body(ref('Refresh')), responses: { ...requestErrors, '200': response('Tokens', envelope(ref('Tokens'))), '400': response('Invalid input'), '401': response('Invalid or expired refresh token'), '429': response('Rate limited') } } },
    '/api/auth/logout': { post: { summary: 'Revoke current session, including all its access tokens', security, responses: { ...requestErrors, '204': { description: 'Logged out' }, '401': response('Authentication failed'), '429': response('Rate limited') } } },
    '/api/auth/me': { get: { summary: 'Current user', security, responses: { '200': response('User', envelope(ref('User'))), '401': response('Authentication failed'), '429': response('Rate limited') } } },
    ...Object.fromEntries(['consumer', 'provider', 'admin'].map(role => [`/api/access/${role}`, { get: { summary: `Provisional ${role} guard example`, security, responses: { '200': response('Access granted', envelope(object({ role: text }, ['role']))), '401': response('Authentication failed'), '403': response('Wrong role') } } }])),
  },
};
