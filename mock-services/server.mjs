#!/usr/bin/env node
/**
 * Mock service cho 3 API demo (EN-07) và upstream mẫu có kiểm tra chữ ký Gateway.
 *
 * Chạy một API:   node mock-services/server.mjs weather
 * Chạy tất cả:    node mock-services/server.mjs all
 *
 * Khi UPSTREAM_HMAC_SECRET được đặt (tối thiểu 32 byte), mọi request trừ /health
 * phải có chữ ký HMAC hợp lệ. Gọi thẳng không chữ ký bị từ chối.
 */
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { NonceCache, verifyUpstreamRequest } from './verify-upstream-hmac.mjs';

const WEATHER = {
  Hanoi: { temperatureC: 31, condition: 'Cloudy', humidity: 78 },
  'Ho Chi Minh': { temperatureC: 33, condition: 'Sunny', humidity: 65 },
  'Da Nang': { temperatureC: 29, condition: 'Rainy', humidity: 88 },
  Tokyo: { temperatureC: 22, condition: 'Clear', humidity: 55 },
  London: { temperatureC: 14, condition: 'Drizzle', humidity: 82 },
};

const RATES = {
  VND: { USD: 0.000039, EUR: 0.000036, JPY: 0.0059, VND: 1 },
  USD: { VND: 25400, EUR: 0.92, JPY: 151.2, USD: 1 },
  EUR: { VND: 27600, USD: 1.09, JPY: 164.5, EUR: 1 },
  JPY: { VND: 168, USD: 0.0066, EUR: 0.0061, JPY: 1 },
};

const PRODUCTS = [
  { id: 'p-1001', name: 'Bàn phím cơ', price: 1290000, currency: 'VND', inStock: true },
  { id: 'p-1002', name: 'Chuột không dây', price: 590000, currency: 'VND', inStock: true },
  { id: 'p-1003', name: 'Màn hình 27 inch', price: 5490000, currency: 'VND', inStock: false },
  { id: 'p-1004', name: 'Tai nghe chống ồn', price: 2190000, currency: 'VND', inStock: true },
];

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolveBody(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function rejectUnsigned(req, res, body, secret, cache) {
  if (!secret) return false;
  const verdict = verifyUpstreamRequest({
    method: req.method ?? 'GET',
    path: req.url ?? '/',
    headers: req.headers,
    body,
    secret,
    cache,
  });
  if (verdict.ok) return false;
  send(res, verdict.status, { error: verdict.code, message: 'Upstream signature rejected' });
  return true;
}

function weatherHandler(_req, res, url) {
  const city = url.searchParams.get('city');
  if (!city) return send(res, 400, { error: 'MISSING_CITY', message: 'Tham số city là bắt buộc' });
  const data = WEATHER[city];
  if (!data) return send(res, 404, { error: 'CITY_NOT_FOUND', message: `Không tìm thấy thành phố ${city}` });
  send(res, 200, { city, ...data });
}

function currencyHandler(_req, res, url) {
  const base = (url.searchParams.get('base') ?? 'VND').toUpperCase();
  const rates = RATES[base];
  if (!rates) return send(res, 400, { error: 'UNSUPPORTED_BASE', message: `Mã tiền tệ không hỗ trợ: ${base}` });
  send(res, 200, { base, asOf: new Date().toISOString(), rates });
}

function catalogHandler(_req, res) {
  send(res, 200, { items: PRODUCTS });
}

const SERVICES = {
  weather: { port: 4011, path: '/v1/weather', handler: weatherHandler },
  currency: { port: 4012, path: '/v1/rates', handler: currencyHandler },
  catalog: { port: 4013, path: '/v1/products', handler: catalogHandler },
};

export function createSignedServer(secret) {
  const cache = new NonceCache();
  return createServer(async (req, res) => {
    try {
      const body = await readBody(req);
      const url = new URL(req.url ?? '/', 'http://localhost');
      if (url.pathname === '/health') return send(res, 200, { status: 'ok', service: 'signed' });
      if (rejectUnsigned(req, res, body, secret, cache)) return;
      send(res, 200, { ok: true });
    } catch {
      if (!res.headersSent) send(res, 500, { error: 'UPSTREAM_ERROR', message: 'Upstream failed' });
    }
  });
}

export function startService(name, portOverride, options = {}) {
  const spec = SERVICES[name];
  if (!spec) throw new Error(`API demo không hợp lệ: ${name}`);
  const secret = options.secret ?? process.env.UPSTREAM_HMAC_SECRET?.trim() ?? '';
  if (secret && Buffer.byteLength(secret) < 32) throw new Error('UPSTREAM_HMAC_SECRET must have at least 32 bytes');
  const cache = new NonceCache();
  const port = Number(portOverride ?? process.env.MOCK_PORT ?? spec.port);
  const host = options.host ?? '0.0.0.0';
  const server = createServer(async (req, res) => {
    try {
      const body = await readBody(req);
      const url = new URL(req.url ?? '/', 'http://localhost');
      if (url.pathname === '/health') return send(res, 200, { status: 'ok', service: name });
      if (rejectUnsigned(req, res, body, secret, cache)) return;
      if (url.pathname !== spec.path) return send(res, 404, { error: 'NOT_FOUND', message: 'Route not found' });
      if (req.method !== 'GET') return send(res, 405, { error: 'METHOD_NOT_ALLOWED', message: 'Chỉ hỗ trợ GET' });
      spec.handler(req, res, url);
    } catch {
      if (!res.headersSent) send(res, 500, { error: 'UPSTREAM_ERROR', message: 'Upstream failed' });
    }
  });
  return new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      const bound = server.address();
      console.log(`[mock:${name}] http://${host}:${typeof bound === 'object' && bound ? bound.port : port}${spec.path}`);
      resolveListen(server);
    });
  });
}

function invokedDirectly() {
  if (!process.argv[1]) return false;
  return import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
}

if (invokedDirectly()) {
  const target = process.argv[2];
  if (target === 'all') {
    for (const name of Object.keys(SERVICES)) await startService(name);
  } else if (SERVICES[target]) {
    await startService(target);
  } else {
    console.error('Dùng: node mock-services/server.mjs <weather|currency|catalog|all>');
    process.exit(1);
  }
}
