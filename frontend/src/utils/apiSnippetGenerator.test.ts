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
});
