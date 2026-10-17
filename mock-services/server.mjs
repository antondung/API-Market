#!/usr/bin/env node
/**
 * Mock service cho 3 API demo Sprint 2 (EN-07).
 *
 * Mục đích: cung cấp endpoint thật cho Provider đăng ký và cho Gateway chuyển tiếp,
 * thay vì chỉ có file OpenAPI mà không có server nào trả lời.
 *
 * Chạy một API:   node mock-services/server.mjs weather
 * Chạy tất cả:    node mock-services/server.mjs all
 *
 * Cổng mặc định:  weather 4011, currency 4012, catalog 4013.
 * Ghi đè bằng biến môi trường MOCK_PORT.
 */
import { createServer } from 'node:http';

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

function weatherHandler(req, res, url) {
  const city = url.searchParams.get('city');
  if (!city) return send(res, 400, { error: 'MISSING_CITY', message: 'Tham số city là bắt buộc' });
  const data = WEATHER[city];
  if (!data) return send(res, 404, { error: 'CITY_NOT_FOUND', message: `Không tìm thấy thành phố ${city}` });
  send(res, 200, { city, ...data });
}

function currencyHandler(req, res, url) {
  const base = (url.searchParams.get('base') ?? 'VND').toUpperCase();
  const rates = RATES[base];
  if (!rates) return send(res, 400, { error: 'UNSUPPORTED_BASE', message: `Mã tiền tệ không hỗ trợ: ${base}` });
  send(res, 200, { base, asOf: new Date().toISOString(), rates });
}

function catalogHandler(req, res) {
  send(res, 200, { items: PRODUCTS });
}

const SERVICES = {
  weather: { port: 4011, path: '/v1/weather', handler: weatherHandler },
  currency: { port: 4012, path: '/v1/rates', handler: currencyHandler },
  catalog: { port: 4013, path: '/v1/products', handler: catalogHandler },
};

export function startService(name, portOverride) {
  const spec = SERVICES[name];
  if (!spec) throw new Error(`API demo không hợp lệ: ${name}`);
  const port = Number(portOverride ?? spec.port);
  const server = createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
    if (url.pathname === '/health') return send(res, 200, { status: 'ok', service: name });
    if (url.pathname !== spec.path) return send(res, 404, { error: 'NOT_FOUND', message: 'Route not found' });
    if (req.method !== 'GET') return send(res, 405, { error: 'METHOD_NOT_ALLOWED', message: 'Chỉ hỗ trợ GET' });
    spec.handler(req, res, url);
  });
  server.listen(port, '0.0.0.0', () => {
    console.log(`[mock:${name}] http://0.0.0.0:${port}${spec.path}`);
  });
  return server;
}

const target = process.argv[2];
if (target === 'all') {
  for (const name of Object.keys(SERVICES)) startService(name);
} else if (SERVICES[target]) {
  startService(target, process.env.MOCK_PORT);
} else {
  console.error('Dùng: node mock-services/server.mjs <weather|currency|catalog|all>');
  process.exit(1);
}
