/**
 * Mẫu kiểm tra chữ ký Gateway cho Provider.
 *
 * Chuỗi ký (UTF-8): `${timestamp}.${nonce}.${METHOD}.${path}.${sha256Hex(body)}`
 * - timestamp: Unix giây, đúng 10 chữ số
 * - nonce: 32 ký tự hex, chỉ dùng một lần trong cửa sổ 5 phút
 * - METHOD: chữ hoa
 * - path: path và query đúng như request nhận được, bắt đầu bằng /
 * - body rỗng vẫn băm SHA-256 của bộ đệm rỗng
 *
 * Header:
 * - x-api-market-timestamp
 * - x-api-market-nonce
 * - x-api-market-content-sha256
 * - x-api-market-signature: HMAC-SHA256 hex của chuỗi ký, khóa là secret riêng của API
 *
 * Không ghi secret, chữ ký hoặc nonce ra log.
 */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const WINDOW_SECONDS = 300;
export const HEADER_TIMESTAMP = 'x-api-market-timestamp';
export const HEADER_NONCE = 'x-api-market-nonce';
export const HEADER_CONTENT_SHA256 = 'x-api-market-content-sha256';
export const HEADER_SIGNATURE = 'x-api-market-signature';

export function bodySha256(body) {
  return createHash('sha256').update(body ?? Buffer.alloc(0)).digest('hex');
}

export function canonicalString({ timestamp, nonce, method, path, contentSha256 }) {
  return `${timestamp}.${nonce}.${String(method).toUpperCase()}.${path}.${contentSha256}`;
}

export function signUpstream({ secret, timestamp, nonce, method, path, body }) {
  const contentSha256 = bodySha256(body);
  const payload = canonicalString({ timestamp, nonce, method, path, contentSha256 });
  const signature = createHmac('sha256', secret).update(payload).digest('hex');
  return {
    contentSha256,
    payload,
    headers: {
      [HEADER_TIMESTAMP]: String(timestamp),
      [HEADER_NONCE]: nonce,
      [HEADER_CONTENT_SHA256]: contentSha256,
      [HEADER_SIGNATURE]: signature,
    },
  };
}

export class NonceCache {
  constructor(windowMs = WINDOW_SECONDS * 1000) {
    this.windowMs = windowMs;
    this.seen = new Map();
  }

  remember(nonce, now = Date.now()) {
    for (const [key, expires] of this.seen) {
      if (expires <= now) this.seen.delete(key);
    }
    if (this.seen.has(nonce)) return false;
    this.seen.set(nonce, now + this.windowMs);
    return true;
  }
}

function headerValue(headers, name) {
  const value = headers?.[name] ?? headers?.[name.toLowerCase()];
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : '';
  return typeof value === 'string' ? value : '';
}

export function verifyUpstreamRequest({ method, path, headers, body, secret, cache, now = new Date() }) {
  const timestamp = headerValue(headers, HEADER_TIMESTAMP);
  const nonce = headerValue(headers, HEADER_NONCE);
  const contentSha256 = headerValue(headers, HEADER_CONTENT_SHA256);
  const signature = headerValue(headers, HEADER_SIGNATURE);
  if (!timestamp || !nonce || !contentSha256 || !signature) {
    return { ok: false, status: 401, code: 'UPSTREAM_SIGNATURE_REQUIRED' };
  }
  if (!/^\d{10}$/.test(timestamp) || !/^[a-f0-9]{32}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(contentSha256) || !/^[a-f0-9]{64}$/.test(signature)) {
    return { ok: false, status: 401, code: 'UPSTREAM_SIGNATURE_INVALID' };
  }
  const skew = Math.abs(Math.floor(now.getTime() / 1000) - Number(timestamp));
  if (skew > WINDOW_SECONDS) return { ok: false, status: 401, code: 'UPSTREAM_SIGNATURE_EXPIRED' };
  const expectedHash = bodySha256(body);
  if (expectedHash.length !== contentSha256.length || !timingSafeEqual(Buffer.from(expectedHash), Buffer.from(contentSha256))) {
    return { ok: false, status: 401, code: 'UPSTREAM_SIGNATURE_INVALID' };
  }
  const payload = canonicalString({ timestamp, nonce, method, path, contentSha256 });
  const expected = createHmac('sha256', secret).update(payload).digest();
  const actual = Buffer.from(signature, 'hex');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return { ok: false, status: 401, code: 'UPSTREAM_SIGNATURE_INVALID' };
  }
  if (cache && !cache.remember(nonce, now.getTime())) {
    return { ok: false, status: 401, code: 'UPSTREAM_SIGNATURE_REPLAY' };
  }
  return { ok: true };
}
