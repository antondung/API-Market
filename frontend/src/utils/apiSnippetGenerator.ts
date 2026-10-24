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
const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']);

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
 * Normalizes HTTP method to uppercase and validates against allowed verbs.
 */
export function normalizeMethod(method: string): string {
  const upper = (method || 'GET').trim().toUpperCase();
  return ALLOWED_METHODS.has(upper) ? upper : 'GET';
}

/**
 * Builds a sanitized, query-string-encoded full URL.
 */
export function buildSafeUrl(
  baseUrl: string = DEFAULT_BASE_URL,
  urlPath: string = '/',
  queryParams?: Record<string, string> | Array<[string, string]>
): string {
  const cleanBase = (baseUrl || DEFAULT_BASE_URL).trim().replace(/\/+$/, '');
  const cleanPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;

  const searchParams = new URLSearchParams();
  if (queryParams) {
    const entries = Array.isArray(queryParams) ? queryParams : Object.entries(queryParams);
    for (const [k, v] of entries) {
      if (k && v !== undefined && v !== null && String(v).trim().length > 0) {
        searchParams.append(k.trim(), String(v).trim());
      }
    }
  }

  const qs = searchParams.toString();
  return qs ? `${cleanBase}${cleanPath}?${qs}` : `${cleanBase}${cleanPath}`;
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
    lines[lines.length - 1] += ' \\';
    lines.push(`  -H ${escapeShellArg('Content-Type: application/json')} \\`);
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

  if (isBodyAllowed && rawBody.length > 0) {
    headersObj['Content-Type'] = 'application/json';
    try {
      const parsed = JSON.parse(rawBody);
      bodyLiteral = JSON.stringify(parsed, null, 2);
    } catch {
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
    code += `,\n  body: JSON.stringify(${bodyLiteral})`;
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
    headersObj['Content-Type'] = 'application/json';
    try {
      parsedJson = JSON.parse(rawBody);
      hasValidJsonBody = true;
    } catch {
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
      // Convert JSON boolean/null to Python Boolean/None
      const pyJsonStr = JSON.stringify(parsedJson, null, 4)
        .replace(/:\s*true\b/g, ': True')
        .replace(/:\s*false\b/g, ': False')
        .replace(/:\s*null\b/g, ': None');
      pyBodySetup = `payload = ${pyJsonStr}\n`;
      requestKwargs += ', json=payload';
    } else {
      pyBodySetup = `payload = ${JSON.stringify(rawBody)}\n`;
      requestKwargs += ', data=payload';
    }
  }

  return `${notice}import requests

url = ${JSON.stringify(fullUrl)}
headers = ${pyHeaders}
${pyBodySetup}response = requests.${method.toLowerCase()}(
    url,
    ${requestKwargs}
)
print(response.status_code)
print(response.json())`;
}
