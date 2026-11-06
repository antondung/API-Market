/**
 * Centralized, hardened API code snippet generator.
 * Prevents shell injection, flag manipulation, unescaped newlines, and unsafe interpolation.
 */

export interface SnippetOptions {
  method: string;
  urlPath: string;
  baseUrl?: string;
  apiKey?: string;
  queryParams?: Record<string, string> | Array<[string, string]>;
  headers?: Record<string, string>;
  body?: string | null;
  includeTemplateNotice?: boolean;
}

const TEMPLATE_NOTICE_TEXT = 'Template — Gateway route not yet configured. Update base URL and credentials before running.';
const DEFAULT_BASE_URL = 'https://api.apihub.vn/v1';
const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE']);

/**
 * Backend Gateway contract: apiId must be a positive 32-bit integer (1 to 2147483647).
 * Matches backend `marketplaceId = z.string().regex(/^[1-9][0-9]{0,9}$/).refine(value => Number(value) <= 2147483647)`.
 */
export function isValidPositiveIntegerApiId(apiId: unknown): boolean {
  if (apiId === null || apiId === undefined) return false;
  const raw = String(apiId).trim();
  if (!/^[1-9][0-9]{0,9}$/.test(raw)) return false;
  const num = Number(raw);
  return Number.isSafeInteger(num) && num > 0 && num <= 2147483647;
}

/**
 * Detects whether a path or URL uses a template/placeholder API ID rather than a verified positive integer.
 */
export function isPlaceholderGatewayRoute(pathOrUrl: string): boolean {
  if (!pathOrUrl) return false;
  return /\/api\/gateway\/(?::apiId|<API_ID>|api_id)(?:\/|$)/.test(pathOrUrl) ||
         /\/api\/gateway\/[^/]+(?:\/|$)/.test(pathOrUrl) && !/\/api\/gateway\/[1-9][0-9]{0,9}(?:\/|$)/.test(pathOrUrl);
}

/**
 * Constructs the canonical Gateway reverse-proxy path for an API endpoint:
 * /api/gateway/:apiId/*rest
 * Backend strictly accepts positive integer API IDs (1 to 2147483647).
 * Non-integer or placeholder inputs resolve to canonical template route :apiId.
 * Strips leading slashes from rest path to ensure single slash separation.
 */
export function buildGatewayPath(apiId: string | number, endpointPath: string): string {
  const rawId = String(apiId ?? '').trim();
  const rawPath = (endpointPath || '').trim();
  const normalizedRest = rawPath.replace(/^\/+/, '');

  let routeApiId: string;
  if (isValidPositiveIntegerApiId(rawId)) {
    routeApiId = rawId;
  } else if (rawId === ':apiId' || rawId === '<API_ID>') {
    routeApiId = ':apiId';
  } else {
    // Backend strictly requires a positive 32-bit integer API ID (1 to 2147483647).
    // Do not silently mutate invalid IDs into arbitrary strings. Emit canonical template placeholder :apiId.
    routeApiId = ':apiId';
  }

  return normalizedRest ? `/api/gateway/${routeApiId}/${normalizedRest}` : `/api/gateway/${routeApiId}`;
}

/**
 * Escapes an arbitrary string for safe usage in POSIX shell (sh/bash).
 * Uses strict single-quote wrapping and replaces internal single quotes with '\''.
 */
export function escapeShellArg(arg: string): string {
  if (arg === '') return "''";
  return `'${arg.replace(/'/g, "'\\''")}'`;
}

/**
 * Sanitizes HTTP header keys to alphanumeric characters, dashes, and underscores.
 */
export function sanitizeHeaderKey(key: string): string {
  return key.trim().replace(/[^a-zA-Z0-9_-]/g, '');
}

/**
 * Strips carriage returns and newlines from header values to prevent HTTP header injection.
 */
export function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

/**
 * Normalizes HTTP method to uppercase and validates against allowed backend contract verbs.
 */
export function normalizeMethod(method: string): string {
  const upper = (method || 'GET').trim().toUpperCase();
  return ALLOWED_METHODS.has(upper) ? upper : 'GET';
}

/**
 * Builds a sanitized, query-string-encoded full URL.
 * Preserves pre-existing query strings in urlPath, encodes params, and removes NUL characters.
 */
export function buildSafeUrl(
  baseUrl: string = DEFAULT_BASE_URL,
  urlPath: string = '/',
  queryParams?: Record<string, string> | Array<[string, string]>
): string {
  let effectiveBase = (baseUrl || DEFAULT_BASE_URL).trim().replace(/\/+$/, '');
  let rawPath = (urlPath || '/').trim().replace(/\0/g, '');
  if (!rawPath.startsWith('/')) {
    rawPath = `/${rawPath}`;
  }

  // If path is a Gateway route /api/gateway/... and default baseUrl with /v1 was used, strip /v1 from base
  if (rawPath.startsWith('/api/') && effectiveBase.endsWith('/v1')) {
    effectiveBase = effectiveBase.replace(/\/v1$/, '');
  }

  const cleanBase = effectiveBase;

  const searchParams = new URLSearchParams();

  // If urlPath already contains a query string, parse and preserve existing params
  let pathOnly = rawPath;
  if (rawPath.includes('?')) {
    const [p, existingQs] = rawPath.split('?', 2);
    pathOnly = p;
    const existingParams = new URLSearchParams(existingQs);
    for (const [ek, ev] of existingParams.entries()) {
      searchParams.append(ek, ev);
    }
  }

  if (queryParams) {
    const entries = Array.isArray(queryParams) ? queryParams : Object.entries(queryParams);
    for (const [k, v] of entries) {
      if (k && v !== undefined && v !== null) {
        const cleanK = String(k).replace(/\0/g, '').trim();
        const cleanV = String(v).replace(/\0/g, '').trim();
        if (cleanK.length > 0) {
          searchParams.append(cleanK, cleanV);
        }
      }
    }
  }

  const qs = searchParams.toString();
  return qs ? `${cleanBase}${pathOnly}?${qs}` : `${cleanBase}${pathOnly}`;
}

/**
 * Recursively serializes a JavaScript/JSON data structure into valid Python literal syntax.
 * Replaces booleans with True/False, null with None, and safely formats strings, numbers, arrays, and dicts
 * without regex keyword replacements or string corruption.
 */
export function toPythonLiteral(value: unknown, indentLevel = 0): string {
  const indent = '    '.repeat(indentLevel);
  const nextIndent = '    '.repeat(indentLevel + 1);

  if (value === null || value === undefined) {
    return 'None';
  }
  if (typeof value === 'boolean') {
    return value ? 'True' : 'False';
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '0';
  }
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value
      .map((item) => `${nextIndent}${toPythonLiteral(item, indentLevel + 1)}`)
      .join(',\n');
    return `[\n${items}\n${indent}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    const lines = entries
      .map(([k, v]) => `${nextIndent}${JSON.stringify(k)}: ${toPythonLiteral(v, indentLevel + 1)}`)
      .join(',\n');
    return `{\n${lines}\n${indent}}`;
  }
  return JSON.stringify(String(value));
}

/**
 * Formats a valid JSON data structure as a safe Python json.loads(...) expression.
 */
export function serializePythonJsonLoads(parsedJson: unknown): string {
  const serialized = JSON.stringify(parsedJson, null, 2);
  return `json.loads(${JSON.stringify(serialized)})`;
}

/**
 * Generates a hardened cURL command with shell-escaped arguments.
 */
export function generateCurlSnippet(opts: SnippetOptions): string {
  const method = normalizeMethod(opts.method);
  const fullUrl = buildSafeUrl(opts.baseUrl, opts.urlPath, opts.queryParams);
  const apiKey = (opts.apiKey || '').trim() || 'YOUR_API_KEY';

  const preComments: string[] = [];
  if (opts.includeTemplateNotice !== false) {
    preComments.push(`# ${TEMPLATE_NOTICE_TEXT}`);
  }

  const isBodyAllowed = method !== 'GET' && method !== 'DELETE';
  const rawBody = (opts.body || '').trim();
  const hasBody = isBodyAllowed && rawBody.length > 0;

  // Header map to preserve case while avoiding duplicate header keys
  const headerMap = new Map<string, { key: string; value: string }>();

  headerMap.set('x-api-key', { key: 'X-API-Key', value: sanitizeHeaderValue(apiKey) });
  headerMap.set('accept', { key: 'Accept', value: 'application/json' });

  // Custom headers from options
  if (opts.headers) {
    for (const [rawK, rawV] of Object.entries(opts.headers)) {
      const cleanK = sanitizeHeaderKey(rawK);
      if (!cleanK) continue;
      const lowerK = cleanK.toLowerCase();
      if (lowerK === 'x-api-key') {
        const val = rawV.trim() ? sanitizeHeaderValue(rawV) : sanitizeHeaderValue(apiKey);
        headerMap.set('x-api-key', { key: cleanK, value: val });
      } else {
        headerMap.set(lowerK, { key: cleanK, value: sanitizeHeaderValue(rawV) });
      }
    }
  }

  // Handle body Content-Type and diagnostics
  if (hasBody) {
    let isValidJson = true;
    try {
      JSON.parse(rawBody);
    } catch {
      isValidJson = false;
    }

    // Diagnostics must precede the command, never inside shell continuation lines
    if (!isValidJson) {
      preComments.push('# Warning: Request body is not valid JSON. Passing as raw data.');
    }

    // Preserve user-declared Content-Type; default only if absent
    if (!headerMap.has('content-type')) {
      headerMap.set('content-type', {
        key: 'Content-Type',
        value: isValidJson ? 'application/json' : 'text/plain',
      });
    }
  }

  const lines: string[] = [...preComments];

  // Shell-escaped URL and method
  lines.push(`curl -X ${method} ${escapeShellArg(fullUrl)} \\`);

  const headerEntries = Array.from(headerMap.values());

  headerEntries.forEach((h, idx) => {
    const isLast = idx === headerEntries.length - 1 && !hasBody;
    const continuation = isLast ? '' : ' \\';
    lines.push(`  -H ${escapeShellArg(`${h.key}: ${h.value}`)}${continuation}`);
  });

  if (hasBody) {
    lines.push(`  -d ${escapeShellArg(rawBody)}`);
  }

  return lines.join('\n');
}

/**
 * Generates an ECMAScript fetch snippet with strict JSON serialization.
 */
export function generateFetchSnippet(opts: SnippetOptions): string {
  const method = normalizeMethod(opts.method);
  const fullUrl = buildSafeUrl(opts.baseUrl, opts.urlPath, opts.queryParams);
  const apiKey = (opts.apiKey || '').trim() || 'YOUR_API_KEY';

  const headersObj: Record<string, string> = {
    'X-API-Key': sanitizeHeaderValue(apiKey),
    Accept: 'application/json',
  };

  let hasDeclaredContentType = false;
  if (opts.headers) {
    for (const [k, v] of Object.entries(opts.headers)) {
      const cleanK = sanitizeHeaderKey(k);
      if (cleanK && cleanK.toLowerCase() !== 'x-api-key' && cleanK.toLowerCase() !== 'accept') {
        headersObj[cleanK] = sanitizeHeaderValue(v);
        if (cleanK.toLowerCase() === 'content-type') {
          hasDeclaredContentType = true;
        }
      }
    }
  }

  const isBodyAllowed = method !== 'GET' && method !== 'DELETE';
  const rawBody = (opts.body || '').trim();
  let bodyLiteral: string | null = null;
  let bodyWarning = '';

  if (isBodyAllowed && rawBody.length > 0) {
    try {
      const parsed = JSON.parse(rawBody);
      if (!hasDeclaredContentType) {
        headersObj['Content-Type'] = 'application/json';
      }
      bodyLiteral = `JSON.stringify(${JSON.stringify(parsed, null, 2)})`;
    } catch {
      // Body is not valid JSON - pass as raw text without altering payload semantics or double-stringifying
      if (!hasDeclaredContentType) {
        headersObj['Content-Type'] = 'text/plain';
      }
      bodyWarning = '  // Warning: Request body is not valid JSON. Passing as raw string payload.\n';
      bodyLiteral = JSON.stringify(rawBody);
    }
  }

  const notice = opts.includeTemplateNotice !== false
    ? `// ${TEMPLATE_NOTICE_TEXT}\n`
    : '';

  const headersIndent = JSON.stringify(headersObj, null, 2)
    .split('\n')
    .map((line, idx) => (idx === 0 ? line : `  ${line}`))
    .join('\n');

  let code = `${notice}const response = await fetch(${JSON.stringify(fullUrl)}, {
  method: ${JSON.stringify(method)},
  headers: ${headersIndent}`;

  if (bodyLiteral) {
    code += `,\n${bodyWarning}  body: ${bodyLiteral}`;
  }

  code += `\n});\nconst data = await response.json();\nconsole.log(data);`;
  return code;
}

/**
 * Generates a Python requests snippet with safe serialization.
 */
export function generatePythonSnippet(opts: SnippetOptions): string {
  const method = normalizeMethod(opts.method);
  const fullUrl = buildSafeUrl(opts.baseUrl, opts.urlPath, opts.queryParams);
  const apiKey = (opts.apiKey || '').trim() || 'YOUR_API_KEY';

  const headersObj: Record<string, string> = {
    'X-API-Key': sanitizeHeaderValue(apiKey),
    Accept: 'application/json',
  };

  let declaredContentTypeKey: string | null = null;
  if (opts.headers) {
    for (const [k, v] of Object.entries(opts.headers)) {
      const cleanK = sanitizeHeaderKey(k);
      if (cleanK && cleanK.toLowerCase() !== 'x-api-key' && cleanK.toLowerCase() !== 'accept') {
        headersObj[cleanK] = sanitizeHeaderValue(v);
        if (cleanK.toLowerCase() === 'content-type') {
          declaredContentTypeKey = cleanK;
        }
      }
    }
  }

  const isBodyAllowed = method !== 'GET' && method !== 'DELETE';
  const rawBody = (opts.body || '').trim();
  let parsedJson: unknown = null;
  let hasValidJsonBody = false;

  if (isBodyAllowed && rawBody.length > 0) {
    try {
      parsedJson = JSON.parse(rawBody);
      if (!declaredContentTypeKey) {
        headersObj['Content-Type'] = 'application/json';
      }
      hasValidJsonBody = true;
    } catch {
      if (!declaredContentTypeKey) {
        headersObj['Content-Type'] = 'text/plain';
      }
      hasValidJsonBody = false;
    }
  }

  const notice = opts.includeTemplateNotice !== false
    ? `# ${TEMPLATE_NOTICE_TEXT}\n`
    : '';

  // Format headers for Python dict
  const pyHeaders = JSON.stringify(headersObj, null, 4);

  let pyBodySetup = '';
  let requestKwargs = 'headers=headers';

  if (isBodyAllowed && rawBody.length > 0) {
    const isExplicitNonJson = declaredContentTypeKey && headersObj[declaredContentTypeKey].toLowerCase() !== 'application/json';
    if (hasValidJsonBody && !isExplicitNonJson) {
      // Use recursive AST-like serializer to create valid Python dict/list literals without regex keyword replacements
      const pyJsonStr = toPythonLiteral(parsedJson, 0);
      pyBodySetup = `payload = ${pyJsonStr}\n`;
      requestKwargs += ', json=payload';
    } else {
      if (!hasValidJsonBody) {
        pyBodySetup = `# Warning: Request body is not valid JSON. Passing as raw text data.\npayload = ${JSON.stringify(rawBody)}\n`;
      } else {
        pyBodySetup = `payload = ${JSON.stringify(rawBody)}\n`;
      }
      requestKwargs += ', data=payload';
    }
  }

  const methodLower = method.toLowerCase();
  const requestCall = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(methodLower)
    ? `requests.${methodLower}(\n    url,\n    ${requestKwargs}\n)`
    : `requests.request(\n    ${JSON.stringify(method)},\n    url,\n    ${requestKwargs}\n)`;

  return `${notice}import requests

url = ${JSON.stringify(fullUrl)}
headers = ${pyHeaders}
${pyBodySetup}response = ${requestCall}
print(response.status_code)
print(response.json())`;
}

/**
 * Returns the effective base URL honoring VITE_API_BASE_URL environment variable.
 */
export function getDefaultBaseUrl(): string {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) {
      return String((import.meta as any).env.VITE_API_BASE_URL).replace(/\/+$/, '');
    }
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://api.apihub.vn';
}

/**
 * Substitutes path parameters (both {param} and :param styles) with values or safe defaults.
 */
export function substitutePathParams(
  endpointPath: string,
  params?: Record<string, string | number>
): string {
  let result = endpointPath || '/';

  // Replace {paramName}
  result = result.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, paramName) => {
    if (params && params[paramName] !== undefined && params[paramName] !== null) {
      return String(params[paramName]);
    }
    if (paramName.toLowerCase().endsWith('id')) return '1';
    return `sample_${paramName}`;
  });

  // Replace :paramName
  result = result.replace(/:([a-zA-Z0-9_]+)/g, (_match, paramName) => {
    if (params && params[paramName] !== undefined && params[paramName] !== null) {
      return String(params[paramName]);
    }
    if (paramName.toLowerCase().endsWith('id')) return '1';
    return `sample_${paramName}`;
  });

  return result;
}

/**
 * Extracts query parameter key-values from endpoint parameter specifications.
 */
export function extractSampleQueryParams(
  parameters?: Array<Record<string, any>>
): Record<string, string> {
  const result: Record<string, string> = {};
  if (!parameters || !Array.isArray(parameters)) return result;

  for (const p of parameters) {
    if (p && p.in === 'query' && p.name) {
      const name = String(p.name).trim();
      const type = String(p.type || p.schema?.type || '').toLowerCase();
      if (name.toLowerCase() === 'page') {
        result[name] = '1';
      } else if (name.toLowerCase() === 'limit' || name.toLowerCase() === 'pagesize') {
        result[name] = '20';
      } else if (type === 'integer' || type === 'number') {
        result[name] = '10';
      } else if (type === 'boolean') {
        result[name] = 'true';
      } else {
        result[name] = `sample_${name}`;
      }
    }
  }

  return result;
}

/**
 * Generates sample JSON body for POST/PUT/PATCH endpoints based on requestSchema.
 */
export function generateSampleJsonBody(
  requestSchema?: Record<string, unknown> | null,
  method = 'POST'
): string | null {
  const m = method.toUpperCase();
  if (m === 'GET' || m === 'DELETE' || m === 'HEAD' || m === 'OPTIONS') {
    return null;
  }

  if (requestSchema && typeof requestSchema === 'object') {
    if (requestSchema.example && typeof requestSchema.example === 'object') {
      return JSON.stringify(requestSchema.example, null, 2);
    }
    if (requestSchema.properties && typeof requestSchema.properties === 'object') {
      const sampleObj: Record<string, unknown> = {};
      for (const [key, propDef] of Object.entries(requestSchema.properties as Record<string, any>)) {
        const propType = (propDef?.type || '').toLowerCase();
        if (propType === 'integer' || propType === 'number') {
          sampleObj[key] = 100;
        } else if (propType === 'boolean') {
          sampleObj[key] = true;
        } else if (propType === 'array') {
          sampleObj[key] = [];
        } else if (propType === 'object') {
          sampleObj[key] = {};
        } else {
          sampleObj[key] = `sample_${key}`;
        }
      }
      return JSON.stringify(sampleObj, null, 2);
    }
  }

  return JSON.stringify({ example: 'payload' }, null, 2);
}

/**
 * Assembles complete SnippetOptions for an endpoint, handling path substitution,
 * query parameters, body, credentials, and environment base URL.
 */
export function buildEndpointSnippetOptions(
  apiId: string | number,
  endpoint: {
    method?: string;
    path?: string;
    parameters?: Array<Record<string, any>> | any[];
    requestSchema?: Record<string, unknown> | null;
  },
  overrides?: Partial<SnippetOptions> & { pathParams?: Record<string, string | number> }
): SnippetOptions {
  const method = (endpoint.method || overrides?.method || 'GET').toUpperCase();
  const rawPath = endpoint.path || '/';
  const substitutedPath = substitutePathParams(rawPath, overrides?.pathParams);
  const gatewayPath = buildGatewayPath(apiId, substitutedPath);

  const queryParams = {
    ...extractSampleQueryParams(endpoint.parameters),
    ...(overrides?.queryParams && !Array.isArray(overrides.queryParams) ? overrides.queryParams : {}),
  };

  const body = overrides?.body !== undefined
    ? overrides.body
    : generateSampleJsonBody(endpoint.requestSchema, method);

  return {
    method,
    urlPath: gatewayPath,
    baseUrl: overrides?.baseUrl || getDefaultBaseUrl(),
    apiKey: overrides?.apiKey || 'YOUR_API_KEY',
    queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    headers: overrides?.headers,
    body,
    includeTemplateNotice:
      overrides?.includeTemplateNotice !== undefined
        ? overrides.includeTemplateNotice
        : !isValidPositiveIntegerApiId(apiId),
  };
}
