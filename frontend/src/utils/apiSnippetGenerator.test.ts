import { describe, it, expect } from 'vitest';
import {
  escapeShellArg,
  sanitizeHeaderKey,
  sanitizeHeaderValue,
  normalizeMethod,
  buildSafeUrl,
  toPythonLiteral,
  serializePythonJsonLoads,
  generateCurlSnippet,
  generateFetchSnippet,
  generatePythonSnippet,
  buildGatewayPath,
  substitutePathParams,
  extractSampleQueryParams,
  generateSampleJsonBody,
  buildEndpointSnippetOptions,
  getDefaultBaseUrl,
} from './apiSnippetGenerator';

describe('apiSnippetGenerator Security & Shell Escaping', () => {
  describe('escapeShellArg', () => {
    it('wraps empty string in single quotes', () => {
      expect(escapeShellArg('')).toBe("''");
    });

    it('safely wraps simple strings', () => {
      expect(escapeShellArg('hello')).toBe("'hello'");
    });

    it("escapes internal single quotes safely using POSIX pattern", () => {
      const malicious = "test' OR '1'='1";
      const escaped = escapeShellArg(malicious);
      expect(escaped).toBe("'test'\\'' OR '\\''1'\\''='\\''1'");
    });

    it('prevents shell variable expansion, command chaining, and flag injection', () => {
      const injectionPayloads = [
        '$HOME',
        '$(whoami)',
        '; rm -rf /',
        'foo & bar',
        'foo | cat /etc/passwd',
        '`id`',
        '-H "Malicious: Header"',
        '--data "evil"',
        'line1\nline2',
        '"double quoted"',
      ];

      for (const payload of injectionPayloads) {
        const escaped = escapeShellArg(payload);
        // String must start and end with single quote
        expect(escaped.startsWith("'")).toBe(true);
        expect(escaped.endsWith("'")).toBe(true);
        // Must contain safe replacement for any internal single quotes
        if (payload.includes("'")) {
          expect(escaped).toContain("'\\''");
        }
      }
    });
  });

  describe('sanitizeHeaderKey and sanitizeHeaderValue', () => {
    it('strips non-alphanumeric chars from header keys', () => {
      expect(sanitizeHeaderKey('X-Custom-Header')).toBe('X-Custom-Header');
      expect(sanitizeHeaderKey('Bad: Header; drop')).toBe('BadHeaderdrop');
    });

    it('strips newlines and carriage returns from header values', () => {
      expect(sanitizeHeaderValue('val1\r\nInjected-Header: evil')).toBe('val1 Injected-Header: evil');
    });
  });

  describe('normalizeMethod', () => {
    it('accepts standard uppercase methods', () => {
      expect(normalizeMethod('get')).toBe('GET');
      expect(normalizeMethod('POST')).toBe('POST');
      expect(normalizeMethod('delete')).toBe('DELETE');
      expect(normalizeMethod('trace')).toBe('TRACE');
      expect(normalizeMethod('OPTIONS')).toBe('OPTIONS');
    });

    it('falls back to GET for unknown methods', () => {
      expect(normalizeMethod('EXPLOIT')).toBe('GET');
      expect(normalizeMethod('')).toBe('GET');
    });
  });

  describe('buildSafeUrl', () => {
    it('encodes query parameters properly', () => {
      const url = buildSafeUrl('https://api.apihub.vn/v1', '/search', {
        q: 'weather & climate',
        city: "Hà Nội 'Special'",
      });

      expect(url).toContain('q=weather+%26+climate');
      expect(url).toContain("city=H%C3%A0+N%E1%BB%99i+%27Special%27");
    });

    it('handles query parameter arrays', () => {
      const url = buildSafeUrl('https://api.apihub.vn/v1', '/search', [
        ['tag', 'first'],
        ['tag', 'second'],
      ]);
      expect(url).toBe('https://api.apihub.vn/v1/search?tag=first&tag=second');
    });

    it('preserves pre-existing query parameters in path and sanitizes NUL characters', () => {
      const url = buildSafeUrl('https://api.apihub.vn/v1', '/items?existing=1', {
        filter: 'active\0clean',
      });
      expect(url).toBe('https://api.apihub.vn/v1/items?existing=1&filter=activeclean');
    });
  });

  describe('toPythonLiteral & AST JSON Formatting', () => {
    it('correctly serializes nested arrays with booleans and null without colon prefix', () => {
      const parsed = [true, false, null, { enabled: true, tags: [false, null] }];
      const pyLiteral = toPythonLiteral(parsed);

      expect(pyLiteral).toContain('True');
      expect(pyLiteral).toContain('False');
      expect(pyLiteral).toContain('None');
      expect(pyLiteral.startsWith('[\n')).toBe(true);
      expect(pyLiteral.endsWith(']')).toBe(true);
    });

    it('does not corrupt strings containing true, false, null or quotes', () => {
      const data = {
        message: 'This is true and false and null',
        quote: 'He said "Hello World"',
      };
      const pyLiteral = toPythonLiteral(data);

      expect(pyLiteral).toContain('"message": "This is true and false and null"');
      expect(pyLiteral).toContain('"quote": "He said \\"Hello World\\""');
    });

    it('serializes numbers and empty structures accurately', () => {
      expect(toPythonLiteral([])).toBe('[]');
      expect(toPythonLiteral({})).toBe('{}');
      expect(toPythonLiteral(0)).toBe('0');
      expect(toPythonLiteral(3.1415)).toBe('3.1415');
      expect(toPythonLiteral(null)).toBe('None');
    });

    it('serializes python json.loads format', () => {
      const result = serializePythonJsonLoads({ test: true });
      expect(result).toContain('json.loads(');
      expect(result).toContain('true');
    });
  });

  describe('generateCurlSnippet', () => {
    it('includes template notice header', () => {
      const curl = generateCurlSnippet({
        method: 'GET',
        urlPath: '/v1/test',
      });
      expect(curl).toContain('# Template — Gateway route not yet configured');
    });

    it('properly quotes and escapes curl arguments', () => {
      const curl = generateCurlSnippet({
        method: 'POST',
        urlPath: '/v1/users',
        apiKey: 'ak_prod_secret_123',
        headers: {
          'X-Request-Id': 'req-999; rm -rf /',
        },
        body: JSON.stringify({ name: "O'Reilly", action: '$HOME' }),
      });

      // Headers and body must be safely shell-escaped
      expect(curl).toContain("-H 'X-API-Key: ak_prod_secret_123'");
      expect(curl).toContain("-H 'X-Request-Id: req-999; rm -rf /'");
      expect(curl).toContain("-H 'Content-Type: application/json'");
      expect(curl).toContain("-d '{\"name\":\"O'\\''Reilly\",\"action\":\"$HOME\"}'");
    });

    it('adds warning comment and preserves text payload for invalid JSON', () => {
      const curl = generateCurlSnippet({
        method: 'POST',
        urlPath: '/v1/raw',
        body: 'raw non-json body',
      });

      expect(curl).toContain('Warning: Request body is not valid JSON');
      expect(curl).toContain("-H 'Content-Type: text/plain'");
      expect(curl).toContain("-d 'raw non-json body'");
    });

    it('places diagnostic comment before curl command without breaking backslash continuation', () => {
      const curl = generateCurlSnippet({
        method: 'POST',
        urlPath: '/v1/raw-data',
        body: '<xml>not-json</xml>',
      });

      const lines = curl.split('\n');
      const curlStartIdx = lines.findIndex(l => l.startsWith('curl '));
      expect(curlStartIdx).toBeGreaterThan(0);

      // Verify any comment appears strictly before curl
      const commentsAfterCurl = lines.slice(curlStartIdx).filter(l => l.trim().startsWith('#'));
      expect(commentsAfterCurl).toHaveLength(0);

      // Verify every line from curl up to the second-to-last line ends with backslash
      const commandLines = lines.slice(curlStartIdx);
      for (let i = 0; i < commandLines.length - 1; i++) {
        expect(commandLines[i].endsWith(' \\')).toBe(true);
      }
      // Last line (-d argument) does NOT end with backslash
      expect(commandLines[commandLines.length - 1].endsWith(' \\')).toBe(false);
      expect(commandLines[commandLines.length - 1]).toContain("-d '<xml>not-json</xml>'");
    });

    it('preserves user-declared Content-Type and avoids duplicates for XML and CSV', () => {
      const xmlCurl = generateCurlSnippet({
        method: 'POST',
        urlPath: '/v1/upload-xml',
        headers: {
          'Content-Type': 'application/xml',
          'X-Client': 'EnterpriseApp',
        },
        body: '<?xml version="1.0"?><data id="123"><name>Tấn Dũng</name></data>',
      });

      // Must retain user-declared application/xml and not duplicate Content-Type
      expect(xmlCurl).toContain("-H 'Content-Type: application/xml'");
      expect(xmlCurl).not.toContain("-H 'Content-Type: text/plain'");
      expect(xmlCurl).not.toContain("-H 'Content-Type: application/json'");
      const contentTypeMatches = xmlCurl.match(/Content-Type:/g) || [];
      expect(contentTypeMatches).toHaveLength(1);

      const csvCurl = generateCurlSnippet({
        method: 'PUT',
        urlPath: '/v1/data.csv',
        headers: {
          'content-type': 'text/csv; charset=utf-8',
        },
        body: 'id,name,role\n1,Dũng,admin',
      });

      expect(csvCurl).toContain("-H 'content-type: text/csv; charset=utf-8'");
      expect(csvCurl).not.toContain("-H 'Content-Type: text/plain'");
    });

    it('handles UTF-8, quotes, newlines, and special characters safely in curl body and headers', () => {
      const complexBody = "Dòng 1: 'Giá trị' có dấu tiếng Việt\nDòng 2: $USER `id` \"quotes\" & <tags>";
      const curl = generateCurlSnippet({
        method: 'POST',
        urlPath: '/v1/unicode',
        headers: {
          'X-Note': "Ghi chú: 'Quan trọng'",
        },
        body: complexBody,
      });

      expect(curl).toContain("-H 'X-Note: Ghi chú: '\\''Quan trọng'\\'''");
      expect(curl).toContain("Dòng 1: '\\''Giá trị'\\'' có dấu tiếng Việt");
      expect(curl).toContain('$USER `id`');
    });
  });

  describe('generateFetchSnippet', () => {
    it('generates valid JavaScript with strict JSON serialization', () => {
      const js = generateFetchSnippet({
        method: 'POST',
        urlPath: '/v1/messages',
        apiKey: 'key-abc',
        body: JSON.stringify({ message: "Hello 'world'", test: true }),
      });

      expect(js).toContain('// Template — Gateway route not yet configured');
      expect(js).toContain('const response = await fetch(');
      expect(js).toContain('method: "POST"');
      expect(js).toContain('"X-API-Key": "key-abc"');
      expect(js).toContain('body: JSON.stringify');
    });

    it('handles non-JSON body with explicit warning comment and no double-stringify', () => {
      const js = generateFetchSnippet({
        method: 'POST',
        urlPath: '/v1/messages',
        body: 'plain text payload',
      });

      expect(js).toContain('Warning: Request body is not valid JSON');
      expect(js).toContain('"Content-Type": "text/plain"');
      expect(js).toContain('body: "plain text payload"');
      expect(js).not.toContain('body: JSON.stringify("plain text payload")');
    });
  });

  describe('generatePythonSnippet', () => {
    it('generates valid Python code with Python Boolean literals', () => {
      const py = generatePythonSnippet({
        method: 'POST',
        urlPath: '/v1/items',
        apiKey: 'key-python',
        body: JSON.stringify({ is_active: true, is_deleted: false, count: null }),
      });

      expect(py).toContain('# Template — Gateway route not yet configured');
      expect(py).toContain('import requests');
      expect(py).toContain('"is_active": True');
      expect(py).toContain('"is_deleted": False');
      expect(py).toContain('"count": None');
      expect(py).toContain('response = requests.post(');
    });

    it('generates valid Python code for arrays with booleans and null without NameError', () => {
      const py = generatePythonSnippet({
        method: 'PUT',
        urlPath: '/v1/tags',
        body: JSON.stringify({ flags: [true, false, null] }),
      });

      expect(py).toContain('"flags": [');
      expect(py).toContain('True');
      expect(py).toContain('False');
      expect(py).toContain('None');
      expect(py).toContain('response = requests.put(');
    });

    it('handles TRACE method dispatch via requests.request', () => {
      const py = generatePythonSnippet({
        method: 'TRACE',
        urlPath: '/v1/trace',
      });

      expect(py).toContain('response = requests.request(');
      expect(py).toContain('"TRACE"');
    });

    it('handles non-JSON body with explicit warning and raw data kwarg', () => {
      const py = generatePythonSnippet({
        method: 'POST',
        urlPath: '/v1/upload',
        body: 'invalid json { not_a_json',
      });

      expect(py).toContain('# Warning: Request body is not valid JSON. Passing as raw text data.');
      expect(py).toContain('payload = "invalid json { not_a_json"');
      expect(py).toContain('data=payload');
    });
  });

  describe('buildGatewayPath - Gateway Reverse Proxy Route Contract', () => {
    it('constructs canonical /api/gateway/:apiId/*rest path', () => {
      const path = buildGatewayPath('api_sms_99', '/v1/messages/send');
      expect(path).toBe('/api/gateway/api_sms_99/v1/messages/send');
    });

    it('strips redundant leading slashes from endpoint path', () => {
      const path = buildGatewayPath('100', '///users/query');
      expect(path).toBe('/api/gateway/100/users/query');
    });

    it('handles empty endpoint path cleanly', () => {
      expect(buildGatewayPath('api_finance', '')).toBe('/api/gateway/api_finance');
      expect(buildGatewayPath('api_finance', '/')).toBe('/api/gateway/api_finance');
    });

    it('strips /v1 from default baseUrl when generating safe URL for gateway route', () => {
      const gatewayRoute = buildGatewayPath('api_weather', '/forecast/daily');
      const fullUrl = buildSafeUrl('https://api.apihub.vn/v1', gatewayRoute, { city: 'Hanoi' });
      expect(fullUrl).toBe('https://api.apihub.vn/api/gateway/api_weather/forecast/daily?city=Hanoi');
    });

    it('sanitizes invalid API ID characters to prevent path manipulation', () => {
      expect(buildGatewayPath('../../etc/passwd', '/users')).toBe('/api/gateway/etcpasswd/users');
      expect(buildGatewayPath('  api 123 !@#  ', '/test')).toBe('/api/gateway/api123/test');
      expect(buildGatewayPath('', '/status')).toBe('/api/gateway/api_id/status');
    });
  });

  describe('Contract Completeness: Parameter Substitution, Queries & JSON Body', () => {
    it('substitutes path parameters in both OpenAPI {param} and Express :param syntax', () => {
      expect(substitutePathParams('/users/{userId}/posts/{postId}', { userId: 'usr_42', postId: 'post_99' }))
        .toBe('/users/usr_42/posts/post_99');

      expect(substitutePathParams('/v1/orders/:orderId/items/:itemId', { orderId: 1001, itemId: 2002 }))
        .toBe('/v1/orders/1001/items/2002');

      // Uses safe default when parameter not explicitly provided
      expect(substitutePathParams('/organizations/{orgId}/members/{memberId}'))
        .toBe('/organizations/1/members/1');

      expect(substitutePathParams('/catalog/:categorySlug'))
        .toBe('/catalog/sample_categorySlug');
    });

    it('extracts sample query parameters from endpoint definitions', () => {
      const params = [
        { name: 'page', in: 'query', type: 'integer' },
        { name: 'pageSize', in: 'query', type: 'integer' },
        { name: 'activeOnly', in: 'query', type: 'boolean' },
        { name: 'filter', in: 'query', type: 'string' },
        { name: 'X-Header', in: 'header', type: 'string' },
      ];

      const qs = extractSampleQueryParams(params);
      expect(qs).toEqual({
        page: '1',
        pageSize: '20',
        activeOnly: 'true',
        filter: 'sample_filter',
      });
    });

    it('generates sample JSON body for POST/PUT/PATCH schemas and returns null for GET/DELETE', () => {
      expect(generateSampleJsonBody({}, 'GET')).toBeNull();
      expect(generateSampleJsonBody({}, 'DELETE')).toBeNull();

      const schema = {
        properties: {
          title: { type: 'string' },
          count: { type: 'integer' },
          isActive: { type: 'boolean' },
        },
      };

      const body = generateSampleJsonBody(schema, 'POST');
      expect(body).not.toBeNull();
      const parsed = JSON.parse(body!);
      expect(parsed).toEqual({
        title: 'sample_title',
        count: 100,
        isActive: true,
      });

      // Uses schema example if available
      const exampleSchema = {
        example: { status: 'verified', score: 98 },
      };
      expect(JSON.parse(generateSampleJsonBody(exampleSchema, 'PATCH')!)).toEqual({
        status: 'verified',
        score: 98,
      });
    });

    it('assembles complete SnippetOptions for GET, POST, PATCH, DELETE endpoints with credentials', () => {
      // 1. GET with path and query params
      const getEndpoint = {
        method: 'GET',
        path: '/users/{id}',
        parameters: [{ name: 'fields', in: 'query', type: 'string' }],
      };
      const getOpts = buildEndpointSnippetOptions('api_users', getEndpoint, {
        apiKey: 'ak_test_get',
        pathParams: { id: 'usr_abc' },
      });
      expect(getOpts.method).toBe('GET');
      expect(getOpts.urlPath).toBe('/api/gateway/api_users/users/usr_abc');
      expect(getOpts.apiKey).toBe('ak_test_get');
      expect(getOpts.queryParams).toEqual({ fields: 'sample_fields' });
      expect(getOpts.body).toBeNull();

      const getCurl = generateCurlSnippet(getOpts);
      expect(getCurl).toContain('curl -X GET');
      expect(getCurl).toContain('/api/gateway/api_users/users/usr_abc?fields=sample_fields');
      expect(getCurl).toContain("-H 'X-API-Key: ak_test_get'");

      // 2. POST with JSON body
      const postEndpoint = {
        method: 'POST',
        path: '/v1/items',
        requestSchema: {
          properties: { name: { type: 'string' } },
        },
      };
      const postOpts = buildEndpointSnippetOptions('api_items', postEndpoint, {
        apiKey: '', // Empty apiKey must fallback to YOUR_API_KEY
      });
      expect(postOpts.method).toBe('POST');
      expect(postOpts.urlPath).toBe('/api/gateway/api_items/v1/items');
      expect(postOpts.apiKey).toBe('YOUR_API_KEY');
      expect(postOpts.body).toContain('"name": "sample_name"');

      const postFetch = generateFetchSnippet(postOpts);
      expect(postFetch).toContain('method: "POST"');
      expect(postFetch).toContain('"X-API-Key": "YOUR_API_KEY"');
      expect(postFetch).toContain('JSON.stringify(');

      // 3. PATCH with partial body
      const patchEndpoint = {
        method: 'PATCH',
        path: '/v1/items/{itemId}',
        requestSchema: {
          properties: { status: { type: 'string' } },
        },
      };
      const patchOpts = buildEndpointSnippetOptions('api_items', patchEndpoint, {
        apiKey: 'ak_patch_123',
        pathParams: { itemId: 'item_77' },
      });
      expect(patchOpts.method).toBe('PATCH');
      expect(patchOpts.urlPath).toBe('/api/gateway/api_items/v1/items/item_77');
      const patchPy = generatePythonSnippet(patchOpts);
      expect(patchPy).toContain('requests.patch(');
      expect(patchPy).toContain('"X-API-Key": "ak_patch_123"');

      // 4. DELETE without body
      const deleteEndpoint = {
        method: 'DELETE',
        path: '/v1/items/{itemId}',
      };
      const deleteOpts = buildEndpointSnippetOptions('api_items', deleteEndpoint, {
        apiKey: 'ak_del_456',
        pathParams: { itemId: 'item_88' },
      });
      expect(deleteOpts.method).toBe('DELETE');
      expect(deleteOpts.body).toBeNull();
      const delCurl = generateCurlSnippet(deleteOpts);
      expect(delCurl).toContain('curl -X DELETE');
      expect(delCurl).not.toContain(' -d ');
    });

    it('resolves default base URL without trailing slash', () => {
      const base = getDefaultBaseUrl();
      expect(base.endsWith('/')).toBe(false);
      expect(base.length).toBeGreaterThan(0);
    });
  });
});
