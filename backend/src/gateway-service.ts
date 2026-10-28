import type { Pool } from 'pg';
import { ApiError } from './auth.js';
import { RoutingRegistry } from './routing-registry.js';
import { ApiKeyService } from './consumer-service.js';
import { SafeProxy, type ProxyInput } from './safe-proxy.js';

export interface GatewayRequest {
  method: string;
  /** Path below the API id, e.g. `/weather/Hanoi`. */
  path: string;
  query: Record<string, string>;
  headers: Record<string, string | string[] | undefined>;
  body?: Buffer;
}

export interface GatewayResponse {
  status: number;
  headers: Record<string, string>;
  body: Buffer;
}

/** Structural contract so tests can substitute a transport stub for SafeProxy. */
export interface UpstreamProxy {
  prepare(baseUrl: string, registeredPath: string, input: ProxyInput, timeoutMs: number): Promise<unknown>;
  execute(target: unknown): Promise<{ status: number; headers: Record<string, string>; body: string; bodyEncoding: 'utf8' | 'base64' }>;
}

// Callers may only supply presentation headers. Everything else is either set by the Gateway
// or dropped, so a caller can never impersonate internal context (X-Internal-Actor) or leak
// their own session (authorization, cookie) to a third-party provider.
const ALLOWED_REQUEST_HEADERS = ['accept', 'accept-language', 'content-type'];
const METHODS = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);

/** Matches a registered template such as `/weather/{city}` against a concrete path. */
export function matchTemplate(template: string, actual: string): Record<string, string> | null {
  const templateParts = template.split('/').filter(Boolean);
  const actualParts = actual.split('/').filter(Boolean);
  if (templateParts.length !== actualParts.length) return null;
  const params: Record<string, string> = {};
  for (let index = 0; index < templateParts.length; index += 1) {
    const expected = templateParts[index]!;
    const received = actualParts[index]!;
    // OpenAPI template names may contain '-' and '.', matching what Playground accepts.
    const placeholder = /^\{([A-Za-z_][A-Za-z0-9_.-]*)\}$/.exec(expected);
    if (placeholder) {
      if (!received || received.length > 200 || /[/\\\x00-\x1f]/.test(received)) return null;
      // Express already decoded the segment; decoding again turns '100%25' into a URIError.
      params[placeholder[1]!] = received;
      continue;
    }
    if (expected !== received) return null;
  }
  return params;
}

/**
 * Gateway forwards a Consumer call to a Published API after checking the API key and route.
 * Upstream transport is delegated to SafeProxy so the Gateway inherits the same SSRF policy
 * as the Playground (public-address validation, DNS pinning, redirect refusal, streamed size
 * limit). A Gateway that skipped those checks would reopen the hole they close.
 */
export class GatewayService {
  private readonly registry: RoutingRegistry;
  private readonly keys: ApiKeyService;
  private readonly proxy: UpstreamProxy;

  constructor(readonly pool: Pool, keys = new ApiKeyService(pool), proxy: UpstreamProxy = new SafeProxy()) {
    this.registry = new RoutingRegistry(pool);
    this.keys = keys;
    this.proxy = proxy;
  }

  /**
   * Finds the registered endpoint matching this method and concrete path. Without this a key
   * issued for one API could reach arbitrary paths on the provider host.
   */
  private async registeredEndpoint(apiId: string, method: string, path: string) {
    const result = await this.pool.query(
      `SELECT e.path FROM api_endpoints e JOIN api_versions v ON v.id=e.version_id
       WHERE e.api_id=$1 AND e.method=$2 AND v.api_id=$1`,
      [apiId, method]
    );
    for (const row of result.rows as { path: string }[]) {
      const params = matchTemplate(row.path, path);
      if (params) return { registeredPath: row.path, pathParams: params };
    }
    throw new ApiError(404, 'ENDPOINT_NOT_FOUND', 'Endpoint is not registered for this API');
  }

  async forward(apiKey: string, apiId: string, request: GatewayRequest): Promise<GatewayResponse> {
    const method = request.method.toUpperCase();
    if (!METHODS.has(method)) throw new ApiError(405, 'METHOD_NOT_ALLOWED', 'Unsupported method');

    const path = request.path.startsWith('/') ? request.path : `/${request.path}`;
    if (path.includes('..') || path.includes('//') || /[\\\x00-\x1f]/.test(path)) {
      throw new ApiError(400, 'INVALID_PATH', 'Path contains an unsafe segment');
    }

    // Authenticate before resolving the route so an unauthenticated caller cannot probe which
    // APIs exist.
    await this.keys.authenticate(apiKey, apiId);
    const matched = await this.registeredEndpoint(apiId, method, path);
    const route = await this.registry.resolve(apiId);

    const headers: Record<string, string> = {};
    for (const name of ALLOWED_REQUEST_HEADERS) {
      const raw = request.headers[name];
      const value = Array.isArray(raw) ? raw[0] : raw;
      if (typeof value === 'string' && value.length <= 1000) headers[name] = value;
    }

    const body = method === 'GET' || method === 'HEAD' ? undefined : request.body;

    const target = await this.proxy.prepare(route.upstreamBaseUrl, matched.registeredPath, {
      method,
      pathParams: matched.pathParams,
      query: request.query,
      headers,
      body: body ? asJson(body) : undefined,
    }, route.timeoutMs);

    const result = await this.proxy.execute(target);
    return { status: result.status, headers: result.headers, body: Buffer.from(result.body, result.bodyEncoding) };
  }
}

/** SafeProxy accepts JSON bodies; a non-JSON caller body is rejected rather than silently dropped. */
function asJson(body: Buffer): unknown {
  try { return JSON.parse(body.toString('utf8')); }
  catch { throw new ApiError(400, 'VALIDATION_ERROR', 'Request body must be JSON'); }
}