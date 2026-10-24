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
  const cleanBase = (baseUrl || DEFAULT_BASE_URL).trim().replace(/\/+$/, '');
  let rawPath = (urlPath || '/').trim().replace(/\0/g, '');
  if (!rawPath.startsWith('/')) {
    rawPath = `/${rawPath}`;
  }

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

  const lines: string[] = [];
  if (opts.includeTemplateNotice !== false) {
    lines.push(`# ${TEMPLATE_NOTICE_TEXT}`);
  }

  // Shell-escaped URL and method
  lines.push(`curl -X ${method} ${escapeShellArg(fullUrl)} \\`);

  // Essential auth & accept headers
  lines.push(`  -H ${escapeShellArg(`X-API-Key: ${sanitizeHeaderValue(apiKey)}`)} \\`);
  lines.push(`  -H ${escapeShellArg('Accept: application/json')}`);

  // Custom headers
  if (opts.headers) {
    for (const [rawK, rawV] of Object.entries(opts.headers)) {
      const cleanK = sanitizeHeaderKey(rawK);
      if (!cleanK || cleanK.toLowerCase() === 'x-api-key' || cleanK.toLowerCase() === 'accept') {
        continue;
      }
      const cleanV = sanitizeHeaderValue(rawV);
      lines[lines.length - 1] += ' \\';
      lines.push(`  -H ${escapeShellArg(`${cleanK}: ${cleanV}`)}`);
    }
  }

  // Body handling for non-GET/DELETE
  const isBodyAllowed = method !== 'GET' && method !== 'DELETE';
  const rawBody = (opts.body || '').trim();
  if (isBodyAllowed && rawBody.length > 0) {
    let isValidJson = true;
    try {
      JSON.parse(rawBody);
    } catch {
      isValidJson = false;
    }

    lines[lines.length - 1] += ' \\';
    if (!isValidJson) {
      lines.push('  # Warning: Request body is not valid JSON. Passing as raw data \\');
    }
    lines.push(`  -H ${escapeShellArg(isValidJson ? 'Content-Type: application/json' : 'Content-Type: text/plain')} \\`);
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

  if (opts.headers) {
    for (const [k, v] of Object.entries(opts.headers)) {
      const cleanK = sanitizeHeaderKey(k);
      if (cleanK && cleanK.toLowerCase() !== 'x-api-key' && cleanK.toLowerCase() !== 'accept') {
        headersObj[cleanK] = sanitizeHeaderValue(v);
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
      headersObj['Content-Type'] = 'application/json';
      bodyLiteral = `JSON.stringify(${JSON.stringify(parsed, null, 2)})`;
    } catch {
      // Body is not valid JSON - pass as raw text without altering payload semantics or double-stringifying
      headersObj['Content-Type'] = 'text/plain';
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

  if (opts.headers) {
    for (const [k, v] of Object.entries(opts.headers)) {
      const cleanK = sanitizeHeaderKey(k);
      if (cleanK && cleanK.toLowerCase() !== 'x-api-key' && cleanK.toLowerCase() !== 'accept') {
        headersObj[cleanK] = sanitizeHeaderValue(v);
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
      headersObj['Content-Type'] = 'application/json';
      hasValidJsonBody = true;
    } catch {
      headersObj['Content-Type'] = 'text/plain';
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
    if (hasValidJsonBody) {
      // Use recursive AST-like serializer to create valid Python dict/list literals without regex keyword replacements
      const pyJsonStr = toPythonLiteral(parsedJson, 0);
      pyBodySetup = `payload = ${pyJsonStr}\n`;
      requestKwargs += ', json=payload';
    } else {
      pyBodySetup = `# Warning: Request body is not valid JSON. Passing as raw text data.\npayload = ${JSON.stringify(rawBody)}\n`;
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
