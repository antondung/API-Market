import { authenticatedRequest } from './authApi';

export interface ConsumerApiKey {
  id: string;
  apiId: string;
  keyPrefix: string;
  label: string | null;
  isActive: boolean;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface CreateApiKeyResult extends ConsumerApiKey {
  /** One-time plaintext secret. Server returns this only once upon creation/rotation. */
  key: string;
}

export interface ConsumerApiKeysResponse {
  items: ConsumerApiKey[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SandboxGrant {
  id: string;
  apiId: string;
  maxRequests: number;
  usedRequests: number;
  remainingRequests: number;
  available: boolean;
  expiresAt: string;
  revokedAt: string | null;
}

export interface PlaygroundInput {
  endpointId: string;
  pathParams?: Record<string, string>;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface PlaygroundResult {
  status: number;
  headers: Record<string, string>;
  body: string;
  bodyEncoding: 'utf8' | 'base64';
  latencyMs: number;
  remainingRequests: number;
}

/**
 * Lists consumer API key metadata (secrets and hashes are never returned).
 */
export async function listConsumerApiKeys(
  page = 1,
  pageSize = 20,
  signal?: AbortSignal
): Promise<ConsumerApiKeysResponse> {
  const query = new URLSearchParams({
    page: String(Math.max(1, page)),
    pageSize: String(Math.min(100, Math.max(1, pageSize))),
  });
  const res = await authenticatedRequest<{ data: ConsumerApiKeysResponse }>(
    `/api/consumer/api-keys?${query.toString()}`,
    { method: 'GET', signal }
  );
  return res.data;
}

/**
 * Creates a new API key scoped to a specific Published API.
 * The raw secret is returned in `result.key` exactly once and must be copied immediately.
 */
export async function createConsumerApiKey(
  apiId: string,
  label?: string
): Promise<CreateApiKeyResult> {
  const body: { apiId: string; label?: string } = { apiId: apiId.trim() };
  if (label && label.trim().length > 0) {
    body.label = label.trim();
  }
  const res = await authenticatedRequest<{ data: CreateApiKeyResult }>(
    '/api/consumer/api-keys',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  return res.data;
}

/**
 * Atomically revokes the old key and generates a new key for the same API.
 * The new raw secret is returned once.
 */
export async function rotateConsumerApiKey(keyId: string): Promise<CreateApiKeyResult> {
  const res = await authenticatedRequest<{ data: CreateApiKeyResult }>(
    `/api/consumer/api-keys/${encodeURIComponent(keyId)}/rotate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }
  );
  return res.data;
}

/**
 * Revokes an existing API key. Idempotent for keys owned by current Consumer.
 */
export async function revokeConsumerApiKey(keyId: string): Promise<void> {
  await authenticatedRequest<void>(
    `/api/consumer/api-keys/${encodeURIComponent(keyId)}`,
    { method: 'DELETE' }
  );
}

/**
 * Reads the persistent sandbox grant for this Consumer and API.
 * Returns 404 if no grant exists yet.
 */
export async function getSandboxGrant(
  apiId: string,
  signal?: AbortSignal
): Promise<SandboxGrant> {
  const res = await authenticatedRequest<{ data: SandboxGrant }>(
    `/api/consumer/apis/${encodeURIComponent(apiId)}/sandbox`,
    { method: 'GET', signal }
  );
  return res.data;
}

/**
 * Claims or retrieves the single persistent sandbox grant for this Consumer and API.
 * Default 5 requests, valid 24h. Repeated claims do NOT reset quota or expiry.
 */
export async function claimSandboxGrant(
  apiId: string
): Promise<SandboxGrant> {
  const res = await authenticatedRequest<{ data: SandboxGrant }>(
    `/api/consumer/apis/${encodeURIComponent(apiId)}/sandbox`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }
  );
  return res.data;
}

/**
 * Executes a registered endpoint via the backend Playground proxy with DNS pinning and SSRF protection.
 * Consumes 1 sandbox request per execution.
 */
export async function executePlayground(
  apiId: string,
  input: PlaygroundInput,
  signal?: AbortSignal
): Promise<PlaygroundResult> {
  // Allow only supported presentation headers
  const filteredHeaders: Record<string, string> = {};
  if (input.headers) {
    for (const [key, val] of Object.entries(input.headers)) {
      const lower = key.toLowerCase();
      if (['accept', 'accept-language', 'content-type'].includes(lower) && typeof val === 'string') {
        filteredHeaders[lower] = val;
      }
    }
  }

  const payload: Record<string, unknown> = {
    endpointId: input.endpointId,
  };
  if (input.pathParams && Object.keys(input.pathParams).length > 0) {
    payload.pathParams = input.pathParams;
  }
  if (input.query && Object.keys(input.query).length > 0) {
    payload.query = input.query;
  }
  if (Object.keys(filteredHeaders).length > 0) {
    payload.headers = filteredHeaders;
  }
  if (input.body !== undefined && input.body !== null) {
    payload.body = input.body;
  }

  const res = await authenticatedRequest<{ data: PlaygroundResult }>(
    `/api/marketplace/apis/${encodeURIComponent(apiId)}/playground`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    }
  );
  return res.data;
}
