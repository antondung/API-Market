import type { Pool } from 'pg';
import { ApiError } from './auth.js';
import { RoutingRegistry } from './routing-registry.js';
import { ApiKeyService } from './consumer-service.js';

export interface GatewayRequest {
  method: string;
  path: string;
  headers: Record<string, string | string[] | undefined>;
  body?: Buffer;
}

export interface GatewayResponse {
  status: number;
  headers: Record<string, string>;
  body: Buffer;
}

// The Gateway authenticates with the API key, so caller credentials must never reach the
// upstream: forwarding them would let a Consumer leak their own session to a third party.
const BLOCKED_REQUEST_HEADERS = new Set([
  'authorization', 'cookie', 'set-cookie', 'host', 'connection', 'keep-alive',
  'proxy-authorization', 'proxy-authenticate', 'te', 'trailer', 'transfer-encoding',
  'upgrade', 'x-api-key', 'x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto',
  'x-real-ip', 'forwarded',
]);

// Body is re-buffered, so framing and encoding headers no longer describe what we send.
const BLOCKED_RESPONSE_HEADERS = new Set([
  'content-encoding', 'content-length', 'transfer-encoding', 'connection',
  'keep-alive', 'set-cookie', 'proxy-authenticate',
]);

const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']);

/**
 * Gateway forwards a Consumer call to a Published API after checking the API key and the
 * route. Deliberately narrow: only endpoints registered for the API are reachable, and the
 * upstream host always comes from the registry — never from the caller.
 */
export class GatewayService {
  private readonly registry: RoutingRegistry;
  private readonly keys: ApiKeyService;

  constructor(readonly pool: Pool, keys = new ApiKeyService(pool)) {
    this.registry = new RoutingRegistry(pool);
    this.keys = keys;
  }

  /** Rejects traversal and control characters so a path cannot escape the registered base. */
  private upstreamPath(path: string): string {
    if (!path.startsWith('/')) throw new ApiError(400, 'INVALID_PATH', 'Path must start with /');
    if (path.includes('..') || path.includes('//') || /[\s\\]/.test(path) || path.includes('\0')) {
      throw new ApiError(400, 'INVALID_PATH', 'Path contains an unsafe segment');
    }
    return path;
  }

  /**
   * Confirms method+path belongs to an endpoint registered for this API. Without this a key
   * issued for one API could reach arbitrary paths on the provider host.
   */
  private async registeredEndpoint(apiId: string, method: string, path: string) {
    const result = await this.pool.query(
      `SELECT 1 FROM api_endpoints e JOIN api_versions v ON v.id=e.version_id
       WHERE e.api_id=$1 AND e.method=$2 AND e.path=$3 AND v.api_id=$1 LIMIT 1`,
      [apiId, method, path]
    );
    if (!result.rows[0]) throw new ApiError(404, 'ENDPOINT_NOT_FOUND', 'Endpoint is not registered for this API');
  }

  private forwardHeaders(headers: GatewayRequest['headers']) {
    const forwarded: Record<string, string> = { accept: 'application/json' };
    for (const [name, value] of Object.entries(headers)) {
      const lower = name.toLowerCase();
      if (BLOCKED_REQUEST_HEADERS.has(lower) || value === undefined) continue;
      forwarded[lower] = Array.isArray(value) ? value.join(', ') : value;
    }
    return forwarded;
  }

  async forward(apiKey: string, apiId: string, request: GatewayRequest): Promise<GatewayResponse> {
    const method = request.method.toUpperCase();
    if (!METHODS.has(method)) throw new ApiError(405, 'METHOD_NOT_ALLOWED', 'Unsupported method');
    const path = this.upstreamPath(request.path);

    // Authenticate before the route lookup so an unauthenticated caller cannot probe which
    // APIs exist.
    await this.keys.authenticate(apiKey, apiId);
    await this.registeredEndpoint(apiId, method, path);

    const route = await this.registry.resolve(apiId);
    const base = route.upstreamBaseUrl.endsWith('/') ? route.upstreamBaseUrl : `${route.upstreamBaseUrl}/`;
    const url = new URL(path.slice(1), base);

    // The registry only stores operator-approved base URLs; re-check the scheme so a bad row
    // can never turn the Gateway into a file/protocol reader.
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new ApiError(503, 'ROUTE_UNAVAILABLE', 'Upstream route is not usable');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), route.timeoutMs);
    try {
      const response = await fetch(url, {
        method,
        headers: this.forwardHeaders(request.headers),
        body: method === 'GET' || method === 'HEAD' || !request.body ? undefined : new Uint8Array(request.body),
        redirect: 'manual',
        signal: controller.signal,
      });

      // A redirect could point at an internal address, so the Gateway never follows one.
      if (response.status >= 300 && response.status < 400) {
        throw new ApiError(502, 'UPSTREAM_REDIRECT', 'Upstream redirects are not followed');
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length > MAX_RESPONSE_BYTES) {
        throw new ApiError(502, 'UPSTREAM_TOO_LARGE', 'Upstream response exceeds the size limit');
      }

      const headers: Record<string, string> = {};
      response.headers.forEach((value, name) => {
        if (!BLOCKED_RESPONSE_HEADERS.has(name.toLowerCase())) headers[name] = value;
      });

      return { status: response.status, headers, body: buffer };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if ((error as { name?: string }).name === 'AbortError') {
        throw new ApiError(504, 'UPSTREAM_TIMEOUT', 'Upstream did not respond in time');
      }
      throw new ApiError(502, 'UPSTREAM_UNAVAILABLE', 'Upstream request failed');
    } finally {
      clearTimeout(timer);
    }
  }
}
