import http, { type ClientRequest, type IncomingMessage, type RequestOptions } from 'node:http';
import https, { type RequestOptions as HttpsRequestOptions } from 'node:https';
import { lookup } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';
import { ApiError } from './auth.js';

type Address = { address: string; family: number };
type RequestFactory = (options: HttpsRequestOptions & { autoSelectFamily: false }, callback: (response: IncomingMessage) => void) => ClientRequest;
export type ProxyInput = { pathParams?: Record<string, string>; query?: Record<string, string>; headers?: Record<string, string>; body?: unknown; method?: string };
type Prepared = { url: URL; address: Address; headers: Record<string, string>; method: string; body?: Buffer; started: number; deadline: number };
const blocked4 = new BlockList();
for (const [ip, prefix] of [['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24], ['192.88.99.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4]] as const) blocked4.addSubnet(ip, prefix, 'ipv4');
const public6 = new BlockList(); public6.addSubnet('2000::', 3, 'ipv6');
const blocked6 = new BlockList();
// Conservatively exclude special-purpose, documentation and address-translation space.
for (const [ip, prefix] of [['2001::', 23], ['2001:db8::', 32], ['2002::', 16], ['3fff::', 20]] as const) blocked6.addSubnet(ip, prefix, 'ipv6');
export function isPublicAddress(address: string) {
  const family = isIP(address);
  return family === 4 ? !blocked4.check(address, 'ipv4')
    : family === 6 && public6.check(address, 'ipv6') && !blocked6.check(address, 'ipv6');
}
const ssrf = () => new ApiError(403, 'SSRF_DETECTED', 'Upstream destination is not allowed');
const invalidPath = () => new ApiError(400, 'ENDPOINT_NOT_REGISTERED', 'Use a registered endpoint and valid path parameters');
const timeout = () => new ApiError(504, 'UPSTREAM_TIMEOUT', 'Upstream request timed out');
const upstreamError = () => new ApiError(502, 'UPSTREAM_UNAVAILABLE', 'Upstream request failed');
const maxResponseBytes = 2 * 1024 * 1024;
function safePath(path: string, params: Record<string, string>) {
  if (!path.startsWith('/') || path.startsWith('//') || /[%\\?#\x00-\x20\x7f]/.test(path)) throw invalidPath();
  const used = new Set<string>();
  const expanded = path.replace(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_all, name: string) => {
    const value = params[name]; used.add(name);
    if (typeof value !== 'string' || !value || value.length > 500 || value === '.' || value === '..' || /[%/\\\x00-\x1f\x7f]/.test(value)) throw invalidPath();
    try { return encodeURIComponent(value); } catch { throw invalidPath(); }
  });
  if (/[{}]/.test(expanded) || expanded.split('/').some(part => part === '.' || part === '..') || Object.keys(params).some(key => !used.has(key))) throw invalidPath();
  return expanded;
}
async function beforeDeadline<T>(promise: Promise<T>, deadline: number) {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([promise, new Promise<never>((_resolve, reject) => { timer = setTimeout(() => reject(timeout()), Math.max(0, deadline - performance.now())); })]);
  } finally { clearTimeout(timer); }
}

export class SafeProxy {
  private readonly lookup: (hostname: string) => Promise<Address[]>;
  private readonly request: RequestFactory;
  private readonly prepared = new WeakSet<Prepared>();
  constructor(dependencies: { lookup?: (hostname: string) => Promise<Address[]>; request?: RequestFactory } = {}) {
    this.lookup = dependencies.lookup ?? (hostname => lookup(hostname, { all: true, verbatim: true }));
    this.request = dependencies.request ?? ((options, callback) => (options.protocol === 'https:' ? https : http).request(options, callback));
  }
  async prepare(baseUrl: string, registeredPath: string, input: ProxyInput, timeoutMs: number): Promise<Prepared> {
    const started = performance.now();
    const deadline = started + Math.min(10000, Math.max(1, timeoutMs));
    let url: URL;
    try { url = new URL(baseUrl); } catch { throw ssrf(); }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw ssrf();
    const hostname = url.hostname.replace(/^\[|\]$/g, '');
    if (hostname.endsWith('.') || /(^|\.)(localhost|local|internal|invalid)$/.test(hostname) || (!isIP(hostname) && !hostname.includes('.'))) throw ssrf();
    if (/%|\\|\x00/.test(url.pathname)) throw ssrf();
    url.pathname = url.pathname.replace(/\/$/, '') + safePath(registeredPath, input.pathParams ?? {});
    for (const [name, value] of Object.entries(input.query ?? {})) {
      if (!name || name.length > 100 || typeof value !== 'string' || value.length > 2000 || /[\x00-\x1f\x7f]/.test(name + value)) throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid upstream query');
      url.searchParams.append(name, value);
    }
    const headers: Record<string, string> = { 'accept-encoding': 'identity' };
    for (const [name, value] of Object.entries(input.headers ?? {})) {
      const lower = name.toLowerCase();
      if (!['accept', 'accept-language', 'content-type'].includes(lower) || typeof value !== 'string' || value.length > 1000 || /[\x00-\x1f\x7f]/.test(value) || Object.hasOwn(headers, lower)) throw new ApiError(400, 'HEADER_NOT_ALLOWED', 'Only accept, accept-language and content-type headers are allowed');
      try { http.validateHeaderValue(lower, value); } catch { throw new ApiError(400, 'HEADER_NOT_ALLOWED', 'Invalid HTTP header value'); }
      headers[lower] = value;
    }
    const method = input.method ?? 'GET';
    if (!['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].includes(method)) throw invalidPath();
    let body: Buffer | undefined;
    if (input.body !== undefined) {
      if (['GET', 'HEAD'].includes(method)) throw new ApiError(400, 'VALIDATION_ERROR', 'GET/HEAD cannot contain a request body');
      const serialized = JSON.stringify(input.body);
      if (serialized === undefined) throw new ApiError(400, 'VALIDATION_ERROR', 'Body must be JSON');
      body = Buffer.from(serialized);
      if (body.length > 16 * 1024) throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Maximum request body is 16 KiB');
      headers['content-type'] = 'application/json'; headers['content-length'] = String(body.length);
    }
    let addresses: Address[];
    try { addresses = isIP(hostname) ? [{ address: hostname, family: isIP(hostname) }] : await beforeDeadline(this.lookup(hostname), deadline); }
    catch (error) { if (error instanceof ApiError) throw error; throw upstreamError(); }
    if (!addresses.length || addresses.length > 64 || addresses.some(entry => !isPublicAddress(entry.address) || isIP(entry.address) !== entry.family)) throw ssrf();
    const prepared = { url, address: addresses[0]!, headers, method, body, started, deadline };
    this.prepared.add(prepared);
    return prepared;
  }
  async execute(target: Prepared) {
    if (!this.prepared.delete(target)) throw ssrf();
    const remaining = target.deadline - performance.now();
    if (remaining <= 0) throw timeout();
    return new Promise<{ status: number; headers: Record<string, string>; body: string; bodyEncoding: 'utf8' | 'base64'; latencyMs: number }>((resolve, reject) => {
      let settled = false, req: ClientRequest | undefined, response: IncomingMessage | undefined;
      const fail = (error: ApiError) => { if (!settled) { settled = true; clearTimeout(timer); response?.destroy(); req?.destroy(); reject(error); } };
      const timer = setTimeout(() => fail(timeout()), remaining);
      const pinned = new BlockList(); pinned.addAddress(target.address.address, target.address.family === 4 ? 'ipv4' : 'ipv6');
      try {
        req = this.request({ protocol: target.url.protocol, hostname: target.url.hostname.replace(/^\[|\]$/g, ''),
          port: target.url.port || undefined, servername: target.url.hostname.replace(/^\[|\]$/g, ''),
          method: target.method, path: target.url.pathname + target.url.search, headers: target.headers,
          agent: false, autoSelectFamily: false, maxHeaderSize: 16384,
          lookup: ((_name: string, _options: unknown, callback: (error: null, address: string, family: number) => void) => callback(null, target.address.address, target.address.family)) as RequestOptions['lookup'],
        }, res => {
          response = res;
          res.on('error', () => fail(upstreamError()));
          res.on('aborted', () => fail(upstreamError()));
          if (settled) { res.destroy(); return; }
          if ((res.statusCode ?? 0) >= 300 && res.statusCode! < 400) { fail(new ApiError(502, 'UPSTREAM_REDIRECT_BLOCKED', 'Upstream redirects are not followed')); return; }
          const length = Number(res.headers['content-length'] ?? 0);
          if (length > maxResponseBytes) { fail(new ApiError(413, 'UPSTREAM_RESPONSE_TOO_LARGE', 'Maximum upstream response is 2 MiB')); return; }
          const chunks: Buffer[] = []; let size = 0;
          res.on('data', (chunk: Buffer | string) => {
            if (settled) return;
            const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk); size += bytes.length;
            if (size > maxResponseBytes) { fail(new ApiError(413, 'UPSTREAM_RESPONSE_TOO_LARGE', 'Maximum upstream response is 2 MiB')); return; }
            chunks.push(bytes);
          });
          res.on('end', () => {
            if (settled) return;
            settled = true; clearTimeout(timer);
            const headers: Record<string, string> = {};
            for (const name of ['content-type', 'content-language', 'cache-control', 'etag', 'last-modified']) {
              const value = res.headers[name]; if (typeof value === 'string') headers[name] = value;
            }
            const bodyEncoding = /^(text\/|application\/(json|[^;]+\+json|xml|[^;]+\+xml))/i.test(headers['content-type'] ?? '') && !res.headers['content-encoding'] ? 'utf8' : 'base64';
            resolve({ status: res.statusCode ?? 502, headers, body: Buffer.concat(chunks).toString(bodyEncoding), bodyEncoding, latencyMs: Math.round(performance.now() - target.started) });
          });
          res.on('close', () => { if (!res.readableEnded) fail(upstreamError()); });
        });
        req.on('socket', socket => {
          const check = () => {
            const address = socket.remoteAddress;
            // IPv4 sockets may be represented as mapped addresses by the OS.
            const normalized = address?.replace(/^::ffff:/i, '');
            const family = normalized ? isIP(normalized) : 0;
            if (!normalized || !family || !pinned.check(normalized, family === 4 ? 'ipv4' : 'ipv6')) fail(ssrf());
          };
          if (socket.remoteAddress) check(); else socket.once('connect', check);
        });
        req.on('error', () => fail(upstreamError()));
        req.end(target.body);
      } catch { fail(upstreamError()); }
    });
  }
}
