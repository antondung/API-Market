import test from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { SafeProxy } from '../src/safe-proxy.js';
import {
  openUpstreamSecret,
  sealUpstreamSecret,
  signUpstreamRequest,
  upstreamRequestTarget,
  upstreamSigningKey,
  verifyUpstreamRequest,
  NonceCache,
} from '../src/upstream-hmac.js';

const secret = 'upstream-demo-secret-at-least-32-bytes';
const publicAddress = [{ address: '93.184.216.34', family: 4 }];

type MockModule = {
  startService(name: string, port?: number, options?: { secret?: string; host?: string }): Promise<Server>;
  createSignedServer(secret: string): Server;
};

async function loadMock(): Promise<MockModule> {
  const href = new URL('../../mock-services/server.mjs', import.meta.url).href;
  return import(href);
}

function listen(server: Server) {
  return new Promise<number>((resolve) => server.listen(0, '127.0.0.1', () => resolve((server.address() as AddressInfo).port)));
}

test('sample upstream rejects a direct call without a valid signature and rejects replay', async () => {
  const mock = await loadMock();
  const server = await mock.startService('weather', 0, { secret, host: '127.0.0.1' });
  try {
    const port = (server.address() as AddressInfo).port;
    const path = '/v1/weather?city=Hanoi';
    const url = `http://127.0.0.1:${port}${path}`;
    const denied = await fetch(url);
    assert.equal(denied.status, 401);
    assert.equal((await denied.json()).error, 'UPSTREAM_SIGNATURE_REQUIRED');

    const signed = signUpstreamRequest(secret, { method: 'GET', path, body: Buffer.alloc(0) });
    const accepted = await fetch(url, { headers: signed.headers });
    assert.equal(accepted.status, 200);
    assert.equal((await accepted.json()).city, 'Hanoi');

    const replay = await fetch(url, { headers: signed.headers });
    assert.equal(replay.status, 401);
    assert.equal((await replay.json()).error, 'UPSTREAM_SIGNATURE_REPLAY');

    const stale = signUpstreamRequest(secret, {
      method: 'GET', path, body: Buffer.alloc(0), now: new Date(Date.now() - 10 * 60 * 1000),
    });
    const expired = await fetch(url, { headers: stale.headers });
    assert.equal(expired.status, 401);
    assert.equal((await expired.json()).error, 'UPSTREAM_SIGNATURE_EXPIRED');

    const forged = signUpstreamRequest(secret, { method: 'GET', path, body: Buffer.alloc(0) });
    forged.headers['x-api-market-signature'] = 'ab'.repeat(32);
    const bad = await fetch(url, { headers: forged.headers });
    assert.equal(bad.status, 401);
    assert.equal((await bad.json()).error, 'UPSTREAM_SIGNATURE_INVALID');
  } finally {
    server.close();
  }
});

test('verifier and signer agree, and a sealed secret round-trips only with the same key', () => {
  const body = Buffer.from('{"city":"Hanoi"}');
  const signed = signUpstreamRequest(secret, { method: 'POST', path: '/v1/weather', body, nonce: 'ab'.repeat(16) });
  const cache = new NonceCache();
  assert.equal(verifyUpstreamRequest({ method: 'POST', path: '/v1/weather', headers: signed.headers, body, secret, cache }).ok, true);
  const replay = verifyUpstreamRequest({ method: 'POST', path: '/v1/weather', headers: signed.headers, body, secret, cache });
  assert.equal(replay.ok, false);
  if (!replay.ok) assert.equal(replay.code, 'UPSTREAM_SIGNATURE_REPLAY');
  const signingKey = 'signing-key-at-least-32-bytes-long';
  const sealed = sealUpstreamSecret(signingKey, secret);
  assert.equal(sealed.startsWith('v1:'), true);
  assert.equal(sealed.includes(secret), false);
  assert.equal(openUpstreamSecret(signingKey, sealed), secret);
  assert.throws(() => openUpstreamSecret('another-signing-key-at-least-32b', sealed));
  assert.throws(() => upstreamSigningKey('jwt-secret-at-least-32-bytes-long', undefined, true));
  assert.equal(upstreamSigningKey('jwt-secret-at-least-32-bytes-long', undefined, false).length, 64);
  assert.throws(() => upstreamSigningKey('jwt-secret-at-least-32-bytes-long', 'short', false));
});

test('SafeProxy keeps gateway signature headers on the prepared request and rejects caller copies', async () => {
  const proxy = new SafeProxy({ lookup: async () => publicAddress });
  const signed = signUpstreamRequest(secret, { method: 'GET', path: '/weather/Hanoi?units=c', body: Buffer.alloc(0) });
  const prepared = await proxy.prepare('https://api.example', '/weather/{city}', {
    method: 'GET',
    pathParams: { city: 'Hanoi' },
    query: { units: 'c' },
    upstreamSignature: signed.headers,
  }, 1000) as { url: URL; headers: Record<string, string> };
  assert.equal(prepared.url.pathname + prepared.url.search, upstreamRequestTarget('https://api.example', '/weather/{city}', { city: 'Hanoi' }, { units: 'c' }));
  assert.equal(prepared.headers['x-api-market-signature'], signed.signature);
  assert.equal(prepared.headers['x-api-market-timestamp'], signed.timestamp);
  await assert.rejects(() => proxy.prepare('https://api.example', '/weather', {
    headers: { 'x-api-market-signature': signed.signature },
  }, 1000), { status: 400 });
});

test('signed fixture used by the demo rejects an unsigned request', async () => {
  const mock = await loadMock();
  const server = mock.createSignedServer(secret);
  const port = await listen(server);
  try {
    const denied = await fetch(`http://127.0.0.1:${port}/v1/free`);
    assert.equal(denied.status, 401);
  } finally {
    server.close();
  }
});
