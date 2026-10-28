import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  listConsumerApiKeys,
  createConsumerApiKey,
  rotateConsumerApiKey,
  revokeConsumerApiKey,
  getSandboxGrant,
  claimSandboxGrant,
  executePlayground,
} from './consumerApi';
import * as authApi from './authApi';

describe('consumerApi service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists consumer API keys with pagination query', async () => {
    const mockData = {
      items: [
        {
          id: '1',
          apiId: '10',
          keyPrefix: 'ak_live_a1b2c3d4',
          label: 'Test Key',
          isActive: true,
          lastUsedAt: null,
          revokedAt: null,
          createdAt: '2026-10-27T00:00:00.000Z',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    };
    const spy = vi.spyOn(authApi, 'authenticatedRequest').mockResolvedValueOnce({ data: mockData });

    const result = await listConsumerApiKeys(1, 20);
    expect(result).toEqual(mockData);
    expect(spy).toHaveBeenCalledWith('/api/consumer/api-keys?page=1&pageSize=20', expect.objectContaining({ method: 'GET' }));
  });

  it('creates an API key and returns one-time secret', async () => {
    const mockCreated = {
      id: '2',
      apiId: '10',
      keyPrefix: 'ak_live_new12345',
      label: 'Production Key',
      isActive: true,
      lastUsedAt: null,
      revokedAt: null,
      createdAt: '2026-10-27T00:00:00.000Z',
      key: 'ak_live_supersecret_plain_text',
    };
    const spy = vi.spyOn(authApi, 'authenticatedRequest').mockResolvedValueOnce({ data: mockCreated });

    const result = await createConsumerApiKey('10', 'Production Key');
    expect(result.key).toBe('ak_live_supersecret_plain_text');
    expect(spy).toHaveBeenCalledWith('/api/consumer/api-keys', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ apiId: '10', label: 'Production Key' }),
    }));
  });

  it('rotates an API key and returns new secret', async () => {
    const mockRotated = {
      id: '3',
      apiId: '10',
      keyPrefix: 'ak_live_rot12345',
      label: 'Rotated Key',
      isActive: true,
      lastUsedAt: null,
      revokedAt: null,
      createdAt: '2026-10-27T01:00:00.000Z',
      key: 'ak_live_new_rotated_secret',
    };
    const spy = vi.spyOn(authApi, 'authenticatedRequest').mockResolvedValueOnce({ data: mockRotated });

    const result = await rotateConsumerApiKey('2');
    expect(result.key).toBe('ak_live_new_rotated_secret');
    expect(spy).toHaveBeenCalledWith('/api/consumer/api-keys/2/rotate', expect.objectContaining({
      method: 'POST',
      body: '{}',
    }));
  });

  it('revokes an API key via DELETE', async () => {
    const spy = vi.spyOn(authApi, 'authenticatedRequest').mockResolvedValueOnce(undefined as any);

    await revokeConsumerApiKey('2');
    expect(spy).toHaveBeenCalledWith('/api/consumer/api-keys/2', expect.objectContaining({
      method: 'DELETE',
    }));
  });

  it('reads sandbox grant', async () => {
    const mockGrant = {
      id: 'g1',
      apiId: '10',
      maxRequests: 5,
      usedRequests: 1,
      remainingRequests: 4,
      available: true,
      expiresAt: '2029-01-01T00:00:00.000Z',
      revokedAt: null,
    };
    const spy = vi.spyOn(authApi, 'authenticatedRequest').mockResolvedValueOnce({ data: mockGrant });

    const result = await getSandboxGrant('10');
    expect(result.remainingRequests).toBe(4);
    expect(spy).toHaveBeenCalledWith('/api/consumer/apis/10/sandbox', expect.objectContaining({ method: 'GET' }));
  });

  it('claims sandbox grant', async () => {
    const mockGrant = {
      id: 'g1',
      apiId: '10',
      maxRequests: 5,
      usedRequests: 0,
      remainingRequests: 5,
      available: true,
      expiresAt: '2029-01-01T00:00:00.000Z',
      revokedAt: null,
    };
    const spy = vi.spyOn(authApi, 'authenticatedRequest').mockResolvedValueOnce({ data: mockGrant });

    const result = await claimSandboxGrant('10');
    expect(result.remainingRequests).toBe(5);
    expect(spy).toHaveBeenCalledWith('/api/consumer/apis/10/sandbox', expect.objectContaining({
      method: 'POST',
      body: '{}',
    }));
  });

  it('executes playground request with filtered headers', async () => {
    const mockResult = {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: '{"status":"ok"}',
      bodyEncoding: 'utf8' as const,
      latencyMs: 35,
      remainingRequests: 3,
    };
    const spy = vi.spyOn(authApi, 'authenticatedRequest').mockResolvedValueOnce({ data: mockResult });

    const result = await executePlayground('10', {
      endpointId: 'ep1',
      pathParams: { city: 'Hanoi' },
      query: { unit: 'metric' },
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer fake-secret-should-be-dropped',
        'X-Custom': 'should-be-dropped',
      },
      body: { test: true },
    });

    expect(result.status).toBe(200);
    expect(result.remainingRequests).toBe(3);
    expect(spy).toHaveBeenCalledWith('/api/marketplace/apis/10/playground', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        endpointId: 'ep1',
        pathParams: { city: 'Hanoi' },
        query: { unit: 'metric' },
        headers: { accept: 'application/json' },
        body: { test: true },
      }),
    }));
  });
});
