import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const UPSTREAM_WINDOW_SECONDS = 300;
export const HEADER_TIMESTAMP = 'x-api-market-timestamp';
export const HEADER_NONCE = 'x-api-market-nonce';
export const HEADER_CONTENT_SHA256 = 'x-api-market-content-sha256';
export const HEADER_SIGNATURE = 'x-api-market-signature';

const SIGNATURE_HEADERS = [HEADER_TIMESTAMP, HEADER_NONCE, HEADER_CONTENT_SHA256, HEADER_SIGNATURE] as const;
export type UpstreamSignatureHeaders = Record<(typeof SIGNATURE_HEADERS)[number], string>;

export function serializedJsonBody(body: unknown): Buffer {
  const serialized = JSON.stringify(body);
  if (serialized === undefined) throw new Error('Body must be JSON');
  return Buffer.from(serialized);
}

/** Path and query SafeProxy places on the wire, without scheme or host. */
export function upstreamRequestTarget(baseUrl: string, registeredPath: string, pathParams: Record<string, string>, query: Record<string, string>) {
  const url = new URL(baseUrl);
  const expanded = registeredPath.replace(/\{([^{}]+)\}/g, (_all, name: string) => encodeURIComponent(pathParams[name] ?? ''));
  url.pathname = url.pathname.replace(/\/$/, '') + expanded;
  url.search = '';
  for (const [name, value] of Object.entries(query)) url.searchParams.append(name, value);
  return url.pathname + url.search;
}

export function bodySha256(body: Buffer) {
  return createHash('sha256').update(body).digest('hex');
}

export function canonicalString(timestamp: string, nonce: string, method: string, path: string, contentSha256: string) {
  return `${timestamp}.${nonce}.${method.toUpperCase()}.${path}.${contentSha256}`;
}

export function signUpstreamRequest(secret: string, input: { method: string; path: string; body: Buffer; now?: Date; nonce?: string }) {
  if (!secret) throw new Error('Upstream secret is unavailable');
  const now = input.now ?? new Date();
  const timestamp = String(Math.floor(now.getTime() / 1000));
  const nonce = input.nonce ?? randomBytes(16).toString('hex');
  const contentSha256 = bodySha256(input.body);
  const payload = canonicalString(timestamp, nonce, input.method, input.path, contentSha256);
  const signature = createHmac('sha256', secret).update(payload).digest('hex');
  const headers: UpstreamSignatureHeaders = {
    [HEADER_TIMESTAMP]: timestamp,
    [HEADER_NONCE]: nonce,
    [HEADER_CONTENT_SHA256]: contentSha256,
    [HEADER_SIGNATURE]: signature,
  };
  return { timestamp, nonce, contentSha256, payload, signature, headers };
}

export class NonceCache {
  private readonly seen = new Map<string, number>();
  constructor(private readonly windowMs = UPSTREAM_WINDOW_SECONDS * 1000) {}
  remember(nonce: string, now = Date.now()) {
    for (const [key, expires] of this.seen) if (expires <= now) this.seen.delete(key);
    if (this.seen.has(nonce)) return false;
    this.seen.set(nonce, now + this.windowMs);
    return true;
  }
}

function headerValue(headers: Record<string, string | string[] | undefined>, name: string) {
  const value = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0] ?? '';
  return typeof value === 'string' ? value : '';
}

export function verifyUpstreamRequest(input: {
  method: string;
  path: string;
  headers: Record<string, string | string[] | undefined>;
  body: Buffer;
  secret: string;
  cache?: NonceCache;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const timestamp = headerValue(input.headers, HEADER_TIMESTAMP);
  const nonce = headerValue(input.headers, HEADER_NONCE);
  const contentSha256 = headerValue(input.headers, HEADER_CONTENT_SHA256);
  const signature = headerValue(input.headers, HEADER_SIGNATURE);
  if (!timestamp || !nonce || !contentSha256 || !signature) return { ok: false as const, status: 401, code: 'UPSTREAM_SIGNATURE_REQUIRED' };
  if (!/^\d{10}$/.test(timestamp) || !/^[a-f0-9]{32}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(contentSha256) || !/^[a-f0-9]{64}$/.test(signature)) {
    return { ok: false as const, status: 401, code: 'UPSTREAM_SIGNATURE_INVALID' };
  }
  if (Math.abs(Math.floor(now.getTime() / 1000) - Number(timestamp)) > UPSTREAM_WINDOW_SECONDS) {
    return { ok: false as const, status: 401, code: 'UPSTREAM_SIGNATURE_EXPIRED' };
  }
  const expectedHash = bodySha256(input.body);
  const hashA = Buffer.from(expectedHash);
  const hashB = Buffer.from(contentSha256);
  if (hashA.length !== hashB.length || !timingSafeEqual(hashA, hashB)) return { ok: false as const, status: 401, code: 'UPSTREAM_SIGNATURE_INVALID' };
  const expected = createHmac('sha256', input.secret).update(canonicalString(timestamp, nonce, input.method, input.path, contentSha256)).digest();
  const actual = Buffer.from(signature, 'hex');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return { ok: false as const, status: 401, code: 'UPSTREAM_SIGNATURE_INVALID' };
  if (input.cache && !input.cache.remember(nonce, now.getTime())) return { ok: false as const, status: 401, code: 'UPSTREAM_SIGNATURE_REPLAY' };
  return { ok: true as const };
}

function kek(secret: string) {
  return createHash('sha256').update(secret).digest();
}

/** AES-256-GCM ciphertext. The plaintext secret is never stored. */
export function sealUpstreamSecret(signingKey: string, secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', kek(signingKey), iv);
  const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${ciphertext.toString('base64')}`;
}

export function openUpstreamSecret(signingKey: string, sealed: string) {
  const match = /^v1:([A-Za-z0-9+/=]+):([A-Za-z0-9+/=]+):([A-Za-z0-9+/=]+)$/.exec(sealed);
  if (!match) throw new Error('Upstream secret ciphertext is invalid');
  const decipher = createDecipheriv('aes-256-gcm', kek(signingKey), Buffer.from(match[1]!, 'base64'));
  decipher.setAuthTag(Buffer.from(match[2]!, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(match[3]!, 'base64')), decipher.final()]).toString('utf8');
}

/** Production requires UPSTREAM_SIGNING_KEY. Development derives one from JWT_SECRET. */
export function upstreamSigningKey(jwtSecret: string, configured: string | undefined, production: boolean) {
  const value = configured?.trim();
  if (!value && production) throw new Error('UPSTREAM_SIGNING_KEY is required in production');
  const secret = value || createHmac('sha256', jwtSecret).update('upstream-signing-v1').digest('hex');
  if (Buffer.byteLength(secret) < 32) throw new Error('Upstream signing key must have at least 32 bytes');
  return secret;
}
