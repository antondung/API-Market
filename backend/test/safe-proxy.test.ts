import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { Readable } from 'node:stream';
import { SafeProxy } from '../src/safe-proxy.js';
const publicAddress = [{ address: '93.184.216.34', family: 4 }];
function transport(status = 200, body: Buffer | string = 'ok', headers: object = { 'content-type': 'text/plain' }, delay = 0, peer = '93.184.216.34') {
  const captured: any[] = [];
  const factory = (options: any, callback: (res: any) => void) => {
    captured.push(options);
    const req: any = new EventEmitter();
    req.destroyed = false;
    req.destroy = (error?: Error) => { req.destroyed = true; if (error) queueMicrotask(() => req.emit('error', error)); };
    req.end = (data?: Buffer) => {
      req.sentBody = data;
      setTimeout(() => {
        if (req.destroyed) return;
        const socket: any = new EventEmitter(); socket.remoteAddress = peer;
        req.emit('socket', socket); socket.emit('connect'); socket.emit('secureConnect');
        const res: any = Readable.from([body]); res.statusCode = status; res.headers = headers;
        callback(res);
      }, delay);
    };
    return req;
  };
  return { factory, captured };
}

test('proxy rejects private, special-use and IPv4-mapped IPv6 before connecting', async () => {
  for (const ip of ['127.0.0.1', '10.1.1.1', '172.16.0.1', '192.168.1.1', '169.254.169.254', '100.64.1.1', '0.0.0.0', '224.0.0.1', '198.18.0.1', '192.0.2.1', '::1', '::ffff:127.0.0.1', 'fc00::1', 'fe80::1', '2001:db8::1', '2002:7f00:1::']) {
    const t = transport();
    const proxy = new SafeProxy({ lookup: async () => [{ address: ip, family: ip.includes(':') ? 6 : 4 }], request: t.factory });
    await assert.rejects(() => proxy.prepare('https://public.example', '/weather', {}, 1000), { code: 'SSRF_DETECTED' });
    assert.equal(t.captured.length, 0);
  }
});

test('proxy checks actual socket peer and accepts only prepared single-use targets', async () => {
  const proxy = new SafeProxy({ lookup: async () => publicAddress, request: transport(200, 'secret', {}, 0, '127.0.0.1').factory });
  const target = await proxy.prepare('https://api.example', '/weather', {}, 1000);
  await assert.rejects(() => proxy.execute(target), { code: 'SSRF_DETECTED' });
  await assert.rejects(() => proxy.execute(target), { code: 'SSRF_DETECTED' });
});

test('proxy rejects invalid HTTP header characters before quota/network', async () => {
  const proxy = new SafeProxy({ lookup: async () => publicAddress });
  await assert.rejects(() => proxy.prepare('https://api.example', '/weather', { headers: { Accept: '✓' } }, 1000), { status: 400 });
});

test('proxy rejects malformed Unicode path values as client errors', async () => {
  const proxy = new SafeProxy({ lookup: async () => publicAddress });
  await assert.rejects(() => proxy.prepare('https://api.example', '/weather/{city}', { pathParams: { city: '\ud800' } }, 1000), { status: 400 });
});

test('proxy supports registered OpenAPI parameter names containing hyphens and dots', async () => {
  const proxy = new SafeProxy({ lookup: async () => publicAddress, request: transport().factory });
  const target = await proxy.prepare('https://api.example', '/users/{user-id}/files/{file.name}', { pathParams: { 'user-id': 'abc', 'file.name': 'report.json' } }, 1000);
  const response = await proxy.execute(target);
  assert.equal(response.status, 200);
  assert.equal(target.url.pathname, '/users/abc/files/report.json');
});

test('proxy preserves upstream errors as responses and bounds content-length and binary bodies', async () => {
  const binary = new SafeProxy({ lookup: async () => publicAddress, request: transport(500, Buffer.from([0, 255, 128]), { 'content-type': 'application/octet-stream' }).factory });
  const response = await binary.execute(await binary.prepare('https://api.example', '/weather', {}, 1000));
  assert.equal(response.status, 500); assert.equal(response.bodyEncoding, 'base64'); assert.equal(response.body, 'AP+A');
  const declared = new SafeProxy({ lookup: async () => publicAddress, request: transport(200, 'small', { 'content-length': String(2 * 1024 * 1024 + 1) }).factory });
  await assert.rejects(async () => declared.execute(await declared.prepare('https://api.example', '/weather', {}, 1000)), { status: 413 });
});

test('proxy rejects mixed public/private DNS and malformed upstream/path/header input', async () => {
  const mixed = new SafeProxy({ lookup: async () => [...publicAddress, { address: '10.0.0.1', family: 4 }] });
  await assert.rejects(() => mixed.prepare('https://api.example', '/weather', {}, 1000), { code: 'SSRF_DETECTED' });
  const proxy = new SafeProxy({ lookup: async () => publicAddress });
  for (const base of ['file:///etc/passwd', 'http://user:pass@api.example', 'http://localhost', 'http://127.1', 'http://2130706433', 'https://api.example?x=1', 'https://api.example#x']) {
    await assert.rejects(() => proxy.prepare(base, '/weather', {}, 1000));
  }
  for (const path of ['//attacker.example', '/../secret', '/%2e%2e/secret', '/a\\b', '/a\r\nHost: evil', '/%252e%252e/secret']) {
    await assert.rejects(() => proxy.prepare('https://api.example', path, {}, 1000), { code: 'ENDPOINT_NOT_REGISTERED' });
  }
  for (const value of ['..', '.', 'a/b', 'a\\b', '%2e%2e', '\0']) {
    await assert.rejects(() => proxy.prepare('https://api.example', '/city/{name}', { pathParams: { name: value } }, 1000));
  }
  for (const header of ['Authorization', 'Cookie', 'Host', 'X-API-Key', 'X-Internal-Actor', 'Connection']) {
    await assert.rejects(() => proxy.prepare('https://api.example', '/weather', { headers: { [header]: 'secret' } }, 1000));
  }
});

test('proxy pins the checked IP, retains TLS hostname, registered path, query and safe response', async () => {
  let resolutions = 0;
  const t = transport(201, '{"created":true}', { 'content-type': 'application/json', 'set-cookie': 'upstream-secret', authorization: 'secret' });
  const proxy = new SafeProxy({ lookup: async () => { resolutions++; return resolutions === 1 ? publicAddress : [{ address: '127.0.0.1', family: 4 }]; }, request: t.factory });
  const prepared = await proxy.prepare('https://api.example/v1/', '/city/{name}', { pathParams: { name: 'Ho Chi Minh' }, query: { unit: 'C&x=1' }, headers: { Accept: 'application/json' }, method: 'POST', body: { id: 1 } }, 1000);
  const result = await proxy.execute(prepared);
  assert.equal(result.status, 201); assert.equal(result.body, '{"created":true}');
  assert.deepEqual(result.headers, { 'content-type': 'application/json' });
  assert.equal(resolutions, 1);
  assert.equal(t.captured[0].hostname, 'api.example');
  assert.equal(t.captured[0].servername, 'api.example');
  assert.equal(t.captured[0].path, '/v1/city/Ho%20Chi%20Minh?unit=C%26x%3D1');
  assert.equal(t.captured[0].agent, false);
  t.captured[0].lookup('api.example', {}, (error: any, address: string, family: number) => {
    assert.equal(error, null); assert.equal(address, '93.184.216.34'); assert.equal(family, 4);
  });
});

test('proxy never follows redirects and enforces timeout and response size', async () => {
  const redirect = transport(302, '', { location: 'http://169.254.169.254' });
  const proxy = new SafeProxy({ lookup: async () => publicAddress, request: redirect.factory });
  const target = await proxy.prepare('https://api.example', '/weather', {}, 1000);
  await assert.rejects(() => proxy.execute(target), { code: 'UPSTREAM_REDIRECT_BLOCKED' });
  assert.equal(redirect.captured.length, 1);
  const huge = new SafeProxy({ lookup: async () => publicAddress, request: transport(200, Buffer.alloc(2 * 1024 * 1024 + 1)).factory });
  await assert.rejects(async () => huge.execute(await huge.prepare('https://api.example', '/weather', {}, 1000)), { status: 413 });
  const slow = new SafeProxy({ lookup: async () => publicAddress, request: transport(200, 'late', {}, 60).factory });
  await assert.rejects(async () => slow.execute(await slow.prepare('https://api.example', '/weather', {}, 20)), { status: 504 });
  const dnsSlow = new SafeProxy({ lookup: () => new Promise(resolve => setTimeout(() => resolve(publicAddress), 60)) });
  await assert.rejects(() => dnsSlow.prepare('https://api.example', '/weather', {}, 20), { status: 504 });
});
