import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { ApiPlaygroundPage } from './ApiPlaygroundPage';
import * as marketplaceApi from '../../services/marketplaceApi';
import * as consumerApi from '../../services/consumerApi';
import { ApiError } from '../../services/authApi';
import type { MarketplaceApiDetail } from '../../services/marketplaceTypes';

let mockCurrentUser: { id: string; email: string; role: string } | null = {
  id: 'user-consumer-1',
  email: 'consumer@apihub.vn',
  role: 'Consumer',
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser,
    isAuthenticated: Boolean(mockCurrentUser),
  }),
}));

vi.mock('../../i18n', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

const mockApiDetail: MarketplaceApiDetail = {
  id: 'api-pg-1',
  name: 'Playground Test API',
  description: 'API for interactive playground testing',
  category: 'Developer Tools',
  providerId: 'prov-dev',
  providerName: 'DevCorp',
  providerStatus: 'Verified',
  tags: ['dev'],
  hasFreePlan: true,
  hasPaidPlan: false,
  publishedAt: '2026-10-20T00:00:00Z',
  versions: [{ id: 'v1', version: '1.0.0', changelog: '' }],
  endpoints: [
    {
      id: 'ep-get',
      versionId: 'v1',
      path: '/v1/users/{userId}',
      method: 'GET',
      description: 'Get user by ID',
      parameters: [
        { name: 'userId', in: 'path', required: true, schema: { type: 'string' }, default: 'u-123' },
        { name: 'role', in: 'query', required: false, schema: { type: 'string' }, default: 'admin' },
      ],
      requestSchema: null,
      responseExample: { status: 'ok', user: { id: 'u-123', name: 'Alice' } },
    },
    {
      id: 'ep-post',
      versionId: 'v1',
      path: '/v1/users',
      method: 'POST',
      description: 'Create user',
      parameters: [],
      requestSchema: { type: 'object', properties: { name: { type: 'string' } } },
      responseExample: { status: 'created', id: 'u-123' },
    },
  ],
  plans: [],
  documentation: [],
  legal: null,
};

const renderPlayground = (initialPath = '/api/api-pg-1/playground') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/api/:id/playground" element={<ApiPlaygroundPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ApiPlaygroundPage - Real Gateway Routing & Safe SSRF Policy', () => {
  beforeEach(() => {
    mockCurrentUser = {
      id: 'user-consumer-1',
      email: 'consumer@apihub.vn',
      role: 'Consumer',
    };
    vi.clearAllMocks();
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(mockApiDetail);
    vi.spyOn(consumerApi, 'getSandboxGrant').mockResolvedValue({
      id: 'g-1',
      apiId: 'api-pg-1',
      maxRequests: 5,
      usedRequests: 1,
      remainingRequests: 4,
      available: true,
      expiresAt: '2026-10-28T00:00:00.000Z',
      revokedAt: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders playground with endpoints, path params and snippet generator', async () => {
    renderPlayground();

    expect(await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Playground Test API' })).toBeDefined();

    // Verify endpoint path parameter input is rendered
    expect(screen.getByText('{userId}')).toBeDefined();
    const pathInput = screen.getByPlaceholderText('Giá trị userId') as HTMLInputElement;
    expect(pathInput.value).toBe('u-123');

    // Verify cURL snippet has substituted path
    expect(screen.getByText(/curl -X GET/)).toBeDefined();
  });

  it('enables Send Request button for eligible Consumer and executes via backend playground proxy', async () => {
    const executeSpy = vi.spyOn(consumerApi, 'executePlayground').mockResolvedValueOnce({
      status: 200,
      headers: { 'content-type': 'application/json', 'x-request-id': 'req-abc-123' },
      body: JSON.stringify({ status: 'ok', user: { id: 'u-123', name: 'Alice' } }),
      bodyEncoding: 'utf8',
      latencyMs: 42,
      remainingRequests: 3,
    });

    renderPlayground();
    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });

    const sendButton = screen.getByRole('button', { name: /Send Request/i });
    expect(sendButton.hasAttribute('disabled')).toBe(false);

    // Click Send Request
    fireEvent.click(sendButton);

    // Wait for execution to finish
    await waitFor(() => {
      expect(executeSpy).toHaveBeenCalledWith(
        'api-pg-1',
        expect.objectContaining({
          endpointId: 'ep-get',
          pathParams: expect.objectContaining({ userId: 'u-123' }),
        }),
        expect.any(AbortSignal)
      );
    });

    // Verifies live response rendered: upstream status 200, latency 42 ms, remaining requests 3
    expect(await screen.findByText('42 ms')).toBeDefined();
    expect(screen.getByText(/Còn lại: 3 requests/i)).toBeDefined();
    expect(screen.getByText(/"name": "Alice"/)).toBeDefined();
  });

  it('isolates upstream HTTP error status (500) from platform status without crashing', async () => {
    vi.spyOn(consumerApi, 'executePlayground').mockResolvedValueOnce({
      status: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Database timeout on upstream provider host' }),
      bodyEncoding: 'utf8',
      latencyMs: 120,
      remainingRequests: 2,
    });

    renderPlayground();
    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });

    const sendButton = screen.getByRole('button', { name: /Send Request/i });
    fireEvent.click(sendButton);

    // Upstream 500 is rendered in the response panel
    expect(await screen.findByText('120 ms')).toBeDefined();
    expect(screen.getByText(/"Database timeout on upstream provider host"/)).toBeDefined();
    expect(screen.getByText('500')).toBeDefined();
  });

  it('disables Send Request button when unauthenticated or role is not Consumer', async () => {
    mockCurrentUser = null;
    renderPlayground();
    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });

    const sendButton = screen.getByRole('button', { name: /Send Request/i });
    expect(sendButton.hasAttribute('disabled')).toBe(true);

    // Renders login prompt
    expect(screen.getByText(/Yêu cầu đăng nhập Consumer:/i)).toBeDefined();
  });

  it('disables Send Request button when sandbox quota is exhausted', async () => {
    vi.spyOn(consumerApi, 'getSandboxGrant').mockResolvedValue({
      id: 'g-1',
      apiId: 'api-pg-1',
      maxRequests: 5,
      usedRequests: 5,
      remainingRequests: 0,
      available: false,
      expiresAt: '2026-10-28T00:00:00.000Z',
      revokedAt: null,
    });

    renderPlayground();
    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });

    await waitFor(() => {
      const sendButton = screen.getByRole('button', { name: /Send Request/i });
      expect(sendButton.hasAttribute('disabled')).toBe(true);
    });
  });

  it('switches tabs between cURL, JavaScript, and Python snippets', async () => {
    const { container } = renderPlayground();
    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });

    // Switch to JavaScript tab
    const jsTab = screen.getByRole('button', { name: /JavaScript/i });
    fireEvent.click(jsTab);
    expect(container.querySelector('pre')?.textContent).toContain('fetch(');

    // Switch to Python tab
    const pythonTab = screen.getByRole('button', { name: /Python/i });
    fireEvent.click(pythonTab);
    expect(container.querySelector('pre')?.textContent).toContain('requests.get(');
  });

  it('resets execution state when switching endpoints', async () => {
    renderPlayground();
    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'ep-post' } });

    // Switch to Body tab
    const bodyTab = screen.getByRole('button', { name: /Body/i });
    fireEvent.click(bodyTab);

    // Request body textarea and Format JSON button should appear for POST
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Format JSON' })).toBeDefined();
    });
  });

  it('defaults to YOUR_API_KEY in snippets and requires explicit opt-in to insert entered key', async () => {
    renderPlayground();
    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });

    // Switch to Headers tab
    const headersTab = screen.getByRole('button', { name: /Headers/i });
    fireEvent.click(headersTab);

    // Enter sensitive API key
    const input = screen.getByPlaceholderText(/Enter API Key/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'super_secret_playground_token' } });

    // Snippet should NOT display super_secret_playground_token without opt-in
    expect(screen.queryByText(/super_secret_playground_token/)).toBeNull();
    expect(screen.getAllByText(/YOUR_API_KEY/).length).toBeGreaterThan(0);

    // Click opt-in toggle button in snippet notice banner
    const optInBtn = screen.getByRole('button', { name: /Chèn API Key thật/i });
    fireEvent.click(optInBtn);

    // Now snippet displays the real key
    expect(screen.getByText(/super_secret_playground_token/)).toBeDefined();
  });

  it('clears API key and headers on session invalidation event', async () => {
    renderPlayground();
    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });

    // Switch to Headers tab
    const headersTab = screen.getByRole('button', { name: /Headers/i });
    fireEvent.click(headersTab);

    const input = screen.getByPlaceholderText(/Enter API Key/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'transient_secret_key' } });
    expect(input.value).toBe('transient_secret_key');

    // Trigger logout / invalidation event
    window.dispatchEvent(new Event('apihub:session-invalidated'));

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('strictly disables Send Request button when grant is NOT_CLAIMED and enables claiming inline', async () => {
    vi.spyOn(consumerApi, 'getSandboxGrant').mockRejectedValue({ status: 404, message: 'Not found' });
    const claimSpy = vi.spyOn(consumerApi, 'claimSandboxGrant').mockResolvedValueOnce({
      id: 'g-claimed',
      apiId: 'api-pg-1',
      maxRequests: 5,
      usedRequests: 0,
      remainingRequests: 5,
      available: true,
      expiresAt: '2026-10-28T00:00:00.000Z',
      revokedAt: null,
    });

    renderPlayground();
    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });

    // Send button must be strictly disabled when grant is null / not claimed
    await waitFor(() => {
      const sendButton = screen.getByRole('button', { name: /Send Request/i });
      expect(sendButton.hasAttribute('disabled')).toBe(true);
    });

    // Unclaimed banner should be visible with claim action
    expect(screen.getAllByText('Chưa kích hoạt Sandbox Grant').length).toBeGreaterThan(0);
    const claimBtn = screen.getByRole('button', { name: /Kích hoạt Sandbox Grant/i });
    fireEvent.click(claimBtn);

    await waitFor(() => {
      expect(claimSpy).toHaveBeenCalledWith('api-pg-1');
      const sendButton = screen.getByRole('button', { name: /Send Request/i });
      expect(sendButton.hasAttribute('disabled')).toBe(false);
    });
  });

  it('strictly disables Send Request button when grant is EXPIRED', async () => {
    vi.spyOn(consumerApi, 'getSandboxGrant').mockResolvedValue({
      id: 'g-expired',
      apiId: 'api-pg-1',
      maxRequests: 5,
      usedRequests: 1,
      remainingRequests: 4,
      available: true,
      expiresAt: '2020-01-01T00:00:00.000Z', // Expired in past
      revokedAt: null,
    });

    renderPlayground();
    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });

    await waitFor(() => {
      const sendButton = screen.getByRole('button', { name: /Send Request/i });
      expect(sendButton.hasAttribute('disabled')).toBe(true);
      expect(screen.getAllByText(/Sandbox Grant đã hết hạn/i).length).toBeGreaterThan(0);
    });
  });

  it('strictly disables Send Request button when grant is REVOKED', async () => {
    vi.spyOn(consumerApi, 'getSandboxGrant').mockResolvedValue({
      id: 'g-revoked',
      apiId: 'api-pg-1',
      maxRequests: 5,
      usedRequests: 1,
      remainingRequests: 4,
      available: true,
      expiresAt: '2026-10-28T00:00:00.000Z',
      revokedAt: '2026-10-21T00:00:00.000Z', // Revoked
    });

    renderPlayground();
    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });

    await waitFor(() => {
      const sendButton = screen.getByRole('button', { name: /Send Request/i });
      expect(sendButton.hasAttribute('disabled')).toBe(true);
      expect(screen.getAllByText(/Sandbox Grant đã bị thu hồi/i).length).toBeGreaterThan(0);
    });
  });

  it('aborts active execution controller when switching endpoints to prevent race conditions', async () => {
    let capturedSignal: AbortSignal | undefined;
    vi.spyOn(consumerApi, 'executePlayground').mockImplementation((_id, _input, signal) => {
      capturedSignal = signal;
      return new Promise(() => {
        // Leave pending
      });
    });

    renderPlayground();
    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });

    const sendButton = screen.getByRole('button', { name: /Send Request/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(capturedSignal).toBeDefined();
      expect(capturedSignal?.aborted).toBe(false);
    });

    // Switch endpoint while request is in flight
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'ep-post' } });

    // Active controller signal must be aborted immediately
    expect(capturedSignal?.aborted).toBe(true);
  });

  it('resets isGrantClaiming and rejects stale claim response when switching API mid-claim', async () => {
    let resolveClaimApi1!: (val: any) => void;
    const deferredClaimPromise = new Promise((resolve) => {
      resolveClaimApi1 = resolve;
    });

    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockImplementation(async (id) => {
      if (id === 'api-pg-1') return mockApiDetail;
      return { ...mockApiDetail, id: 'api-pg-2', name: 'API Two' };
    });

    vi.spyOn(consumerApi, 'getSandboxGrant').mockImplementation(async (id) => {
      if (id === 'api-pg-1') {
        throw new ApiError(404, 'NOT_FOUND', 'Not found');
      }
      return {
        id: 'g-api2',
        apiId: 'api-pg-2',
        maxRequests: 5,
        usedRequests: 0,
        remainingRequests: 5,
        available: true,
        expiresAt: '2026-10-28T00:00:00.000Z',
        revokedAt: null,
      };
    });

    vi.spyOn(consumerApi, 'claimSandboxGrant').mockImplementation(async (id) => {
      if (id === 'api-pg-1') {
        return deferredClaimPromise as any;
      }
      return {
        id: 'g-claimed-2',
        apiId: 'api-pg-2',
        maxRequests: 5,
        usedRequests: 0,
        remainingRequests: 5,
        available: true,
        expiresAt: '2026-10-28T00:00:00.000Z',
        revokedAt: null,
      };
    });

    let navigateFn: any;
    const TestNavigator: React.FC = () => {
      const navigate = useNavigate();
      navigateFn = navigate;
      return null;
    };

    render(
      <MemoryRouter initialEntries={['/api/api-pg-1/playground']}>
        <TestNavigator />
        <Routes>
          <Route path="/api/:id/playground" element={<ApiPlaygroundPage />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });
    const claimBtn = await screen.findByRole('button', { name: /Kích hoạt Sandbox Grant/i });
    fireEvent.click(claimBtn);

    // Switch to api-pg-2 while claim is in flight
    navigateFn('/api/api-pg-2/playground');

    // Wait for API 2 to load
    await screen.findByText('API Two');

    // Resolve API 1's claim promise late
    resolveClaimApi1({
      id: 'g-stale-api1',
      apiId: 'api-pg-1',
      maxRequests: 5,
      usedRequests: 0,
      remainingRequests: 5,
      available: true,
      expiresAt: '2026-10-28T00:00:00.000Z',
      revokedAt: null,
    });

    // Verify API 2's grant remains valid and active
    await waitFor(() => {
      expect(screen.getByText(/Quota:\s*5\/5/)).toBeDefined();
    });
  });

  it('reconciles quota after upstream 502/504 gateway timeout', async () => {
    let grantCallCount = 0;
    vi.spyOn(consumerApi, 'getSandboxGrant').mockImplementation(async () => {
      grantCallCount++;
      return {
        id: 'g-1',
        apiId: 'api-pg-1',
        maxRequests: 5,
        usedRequests: grantCallCount === 1 ? 1 : 2,
        remainingRequests: grantCallCount === 1 ? 4 : 3,
        available: true,
        expiresAt: '2026-10-28T00:00:00.000Z',
        revokedAt: null,
      };
    });

    vi.spyOn(consumerApi, 'executePlayground').mockRejectedValueOnce(
      new ApiError(504, 'GATEWAY_TIMEOUT', 'Upstream Gateway Timeout')
    );

    renderPlayground();
    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });

    const sendButton = screen.getByRole('button', { name: /Send Request/i });
    fireEvent.click(sendButton);

    // Expect error message
    expect(await screen.findByText(/Lỗi Gateway Upstream: Nhà cung cấp phản hồi quá hạn/i)).toBeDefined();

    // Verify reconciliation fetch was triggered and updated quota
    await waitFor(() => {
      expect(grantCallCount).toBeGreaterThanOrEqual(2);
      expect(screen.getByText(/Quota:\s*3\/5/)).toBeDefined();
    });
  });

  it('rejects out-of-order stale metadata responses using sequence tracking quotaSeqRef', async () => {
    let grantCall = 0;
    let resolveStaleGrant!: (val: any) => void;
    const staleGrantPromise = new Promise(resolve => {
      resolveStaleGrant = resolve;
    });

    vi.spyOn(consumerApi, 'getSandboxGrant').mockImplementation(async () => {
      grantCall++;
      if (grantCall === 1) {
        return {
          id: 'g-initial',
          apiId: 'api-pg-1',
          maxRequests: 5,
          usedRequests: 1,
          remainingRequests: 4,
          available: true,
          expiresAt: '2026-10-28T00:00:00.000Z',
          revokedAt: null,
        };
      }
      return staleGrantPromise as any;
    });

    vi.spyOn(consumerApi, 'executePlayground').mockResolvedValueOnce({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'success' }),
      bodyEncoding: 'utf8',
      latencyMs: 30,
      remainingRequests: 1, // Newer execution response
    });

    renderPlayground();
    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });
    expect(await screen.findByText(/Quota:\s*4\/5/)).toBeDefined();

    // Execute request which updates quota sequence
    const sendButton = screen.getByRole('button', { name: /Send Request/i });
    fireEvent.click(sendButton);

    await screen.findByText(/Còn lại: 1 requests/i);
    expect(await screen.findByText(/Quota:\s*1\/5/)).toBeDefined();

    // Now resolve the older metadata fetch with stale remaining: 4
    resolveStaleGrant({
      id: 'g-stale',
      apiId: 'api-pg-1',
      maxRequests: 5,
      usedRequests: 1,
      remainingRequests: 4,
      available: true,
      expiresAt: '2026-10-28T00:00:00.000Z',
      revokedAt: null,
    });

    // Wait and verify quota is NOT overwritten back to 4
    await new Promise(r => setTimeout(r, 50));
    expect(screen.getByText(/Quota:\s*1\/5/)).toBeDefined();
    expect(screen.getByText(/Còn lại: 1 requests/i)).toBeDefined();
  });

  it('prevents double-click from initiating two claim requests for the same API', async () => {
    let resolveClaim!: (val: any) => void;
    const claimPromise = new Promise(resolve => {
      resolveClaim = resolve;
    });

    const claimSpy = vi.spyOn(consumerApi, 'claimSandboxGrant').mockReturnValue(claimPromise as any);
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockImplementation(async (id) => {
      if (id === 'api-pg-1') return mockApiDetail;
      return { ...mockApiDetail, id: 'api-pg-2', name: 'API Two' };
    });
    vi.spyOn(consumerApi, 'getSandboxGrant').mockResolvedValue(null as any);

    renderPlayground();
    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });

    const claimBtn = await screen.findByRole('button', { name: /Kích hoạt Sandbox Grant/i });
    // Rapid double-click
    fireEvent.click(claimBtn);
    fireEvent.click(claimBtn);

    expect(claimSpy).toHaveBeenCalledTimes(1);

    resolveClaim({
      id: 'g-claimed',
      apiId: 'api-pg-1',
      maxRequests: 5,
      usedRequests: 0,
      remainingRequests: 5,
      available: true,
      expiresAt: '2026-10-28T00:00:00.000Z',
      revokedAt: null,
    });
  });

  it('keeps isGrantClaiming true when Claim A completes while Claim B is still pending', async () => {
    let resolveClaimA!: (val: any) => void;
    const claimPromiseA = new Promise(resolve => {
      resolveClaimA = resolve;
    });
    let resolveClaimB!: (val: any) => void;
    const claimPromiseB = new Promise(resolve => {
      resolveClaimB = resolve;
    });

    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockImplementation(async (id) => {
      if (id === 'api-pg-1') return mockApiDetail;
      return { ...mockApiDetail, id: 'api-pg-2', name: 'API Two' };
    });
    vi.spyOn(consumerApi, 'getSandboxGrant').mockResolvedValue(null as any);
    vi.spyOn(consumerApi, 'claimSandboxGrant').mockImplementation(async (apiId) => {
      if (apiId === 'api-pg-1') return claimPromiseA as any;
      return claimPromiseB as any;
    });

    let navigateFn: any;
    const TestNavigator: React.FC = () => {
      const navigate = useNavigate();
      navigateFn = navigate;
      return null;
    };

    render(
      <MemoryRouter initialEntries={['/api/api-pg-1/playground']}>
        <TestNavigator />
        <Routes>
          <Route path="/api/:id/playground" element={<ApiPlaygroundPage />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });
    const claimBtnA = await screen.findByRole('button', { name: /Kích hoạt Sandbox Grant/i });
    fireEvent.click(claimBtnA);

    // Switch to api-pg-2
    act(() => {
      navigateFn('/api/api-pg-2/playground');
    });

    await screen.findByText('API Two');
    const claimBtnB = await screen.findByRole('button', { name: /Kích hoạt Sandbox Grant/i });
    fireEvent.click(claimBtnB);

    // Claim B is now in-flight
    expect(screen.getByRole('button', { name: /Đang kích hoạt.../i })).toBeDefined();

    // Now resolve Claim A while B is still pending
    act(() => {
      resolveClaimA({
        id: 'grant-a',
        apiId: 'api-pg-1',
        maxRequests: 5,
        usedRequests: 0,
        remainingRequests: 5,
        available: true,
        expiresAt: '2026-10-28T00:00:00.000Z',
        revokedAt: null,
      });
    });

    // Claim B MUST STILL BE CLAIMING! (Claim A's finally must NOT set isGrantClaiming to false)
    expect(screen.getByRole('button', { name: /Đang kích hoạt.../i })).toBeDefined();

    // Now resolve Claim B
    act(() => {
      resolveClaimB({
        id: 'grant-b',
        apiId: 'api-pg-2',
        maxRequests: 5,
        usedRequests: 0,
        remainingRequests: 5,
        available: true,
        expiresAt: '2026-10-28T00:00:00.000Z',
        revokedAt: null,
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/Quota:\s*5\/5/)).toBeDefined();
      expect(screen.queryByRole('button', { name: /Đang kích hoạt.../i })).toBeNull();
    });
  });

  it('ignores late Claim A failure while Claim B is pending without polluting error or resetting claiming state', async () => {
    let rejectClaimA!: (err: any) => void;
    const claimPromiseA = new Promise((_, reject) => {
      rejectClaimA = reject;
    });
    let resolveClaimB!: (val: any) => void;
    const claimPromiseB = new Promise(resolve => {
      resolveClaimB = resolve;
    });

    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockImplementation(async (id) => {
      if (id === 'api-pg-1') return mockApiDetail;
      return { ...mockApiDetail, id: 'api-pg-2', name: 'API Two' };
    });
    vi.spyOn(consumerApi, 'getSandboxGrant').mockResolvedValue(null as any);
    vi.spyOn(consumerApi, 'claimSandboxGrant').mockImplementation(async (apiId) => {
      if (apiId === 'api-pg-1') return claimPromiseA as any;
      return claimPromiseB as any;
    });

    let navigateFn: any;
    const TestNavigator: React.FC = () => {
      const navigate = useNavigate();
      navigateFn = navigate;
      return null;
    };

    render(
      <MemoryRouter initialEntries={['/api/api-pg-1/playground']}>
        <TestNavigator />
        <Routes>
          <Route path="/api/:id/playground" element={<ApiPlaygroundPage />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });
    const claimBtnA = await screen.findByRole('button', { name: /Kích hoạt Sandbox Grant/i });
    fireEvent.click(claimBtnA);

    act(() => {
      navigateFn('/api/api-pg-2/playground');
    });

    await screen.findByText('API Two');
    const claimBtnB = await screen.findByRole('button', { name: /Kích hoạt Sandbox Grant/i });
    fireEvent.click(claimBtnB);

    // Claim B is claiming
    expect(screen.getByRole('button', { name: /Đang kích hoạt.../i })).toBeDefined();

    // Reject Claim A late
    act(() => {
      rejectClaimA(new ApiError(500, 'CLAIM_A_FAILED', 'Failed to claim A'));
    });

    // Should NOT show Claim A's error on API B
    expect(screen.queryByText('Failed to claim A')).toBeNull();
    // Claim B should still be claiming
    expect(screen.getByRole('button', { name: /Đang kích hoạt.../i })).toBeDefined();

    // Now resolve Claim B
    act(() => {
      resolveClaimB({
        id: 'grant-b',
        apiId: 'api-pg-2',
        maxRequests: 5,
        usedRequests: 0,
        remainingRequests: 5,
        available: true,
        expiresAt: '2026-10-28T00:00:00.000Z',
        revokedAt: null,
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/Quota:\s*5\/5/)).toBeDefined();
    });
  });

  it('prevents late Claim A completion from overwriting previously succeeded Claim B grant', async () => {
    let resolveClaimA!: (val: any) => void;
    const claimPromiseA = new Promise(resolve => {
      resolveClaimA = resolve;
    });

    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockImplementation(async (id) => {
      if (id === 'api-pg-1') return mockApiDetail;
      return { ...mockApiDetail, id: 'api-pg-2', name: 'API Two' };
    });
    vi.spyOn(consumerApi, 'getSandboxGrant').mockResolvedValue(null as any);
    vi.spyOn(consumerApi, 'claimSandboxGrant').mockImplementation(async (apiId) => {
      if (apiId === 'api-pg-1') return claimPromiseA as any;
      return {
        id: 'grant-b-fast',
        apiId: 'api-pg-2',
        maxRequests: 5,
        usedRequests: 1,
        remainingRequests: 4,
        available: true,
        expiresAt: '2026-10-28T00:00:00.000Z',
        revokedAt: null,
      };
    });

    let navigateFn: any;
    const TestNavigator: React.FC = () => {
      const navigate = useNavigate();
      navigateFn = navigate;
      return null;
    };

    render(
      <MemoryRouter initialEntries={['/api/api-pg-1/playground']}>
        <TestNavigator />
        <Routes>
          <Route path="/api/:id/playground" element={<ApiPlaygroundPage />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });
    const claimBtnA = await screen.findByRole('button', { name: /Kích hoạt Sandbox Grant/i });
    fireEvent.click(claimBtnA);

    act(() => {
      navigateFn('/api/api-pg-2/playground');
    });

    await screen.findByText('API Two');
    const claimBtnB = await screen.findByRole('button', { name: /Kích hoạt Sandbox Grant/i });
    fireEvent.click(claimBtnB);

    // Claim B completes immediately
    await waitFor(() => {
      expect(screen.getByText(/Quota:\s*4\/5/)).toBeDefined();
    });

    // Now Claim A completes late
    act(() => {
      resolveClaimA({
        id: 'grant-a-late',
        apiId: 'api-pg-1',
        maxRequests: 5,
        usedRequests: 0,
        remainingRequests: 5,
        available: true,
        expiresAt: '2026-10-28T00:00:00.000Z',
        revokedAt: null,
      });
    });

    // Verify API 2 still has Quota: 4/5, NOT overwritten by Claim A (5/5)
    await new Promise(r => setTimeout(r, 50));
    expect(screen.getByText(/Quota:\s*4\/5/)).toBeDefined();
  });

  it('displays unverified quota badge and notice when post-timeout reconciliation fails and disables Send', async () => {
    let grantCallCount = 0;
    vi.spyOn(consumerApi, 'getSandboxGrant').mockImplementation(async () => {
      grantCallCount++;
      if (grantCallCount === 1) {
        return {
          id: 'g-initial',
          apiId: 'api-pg-1',
          maxRequests: 5,
          usedRequests: 0,
          remainingRequests: 5,
          available: true,
          expiresAt: '2026-10-28T00:00:00.000Z',
          revokedAt: null,
        };
      }
      throw new ApiError(500, 'RECONCILE_FAILED', 'Cannot connect to control plane');
    });

    const executeSpy = vi.spyOn(consumerApi, 'executePlayground').mockRejectedValueOnce(
      new ApiError(504, 'GATEWAY_TIMEOUT', 'Gateway Timeout')
    );

    renderPlayground();
    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });
    expect(await screen.findByText(/Quota:\s*5\/5/)).toBeDefined();

    const sendButton = screen.getByRole('button', { name: /Send Request/i });
    fireEvent.click(sendButton);

    // Expect gateway error
    expect(await screen.findByText(/Lỗi Gateway Upstream/i)).toBeDefined();

    // Verify unverified status is rendered instead of assuming quota is 5/5
    await waitFor(() => {
      expect(screen.getByText(/Quota: Cần xác minh/i)).toBeDefined();
      expect(screen.getAllByText(/Không thể đối soát hạn ngạch sau lỗi kết nối/i).length).toBeGreaterThan(0);
      expect((sendButton as HTMLButtonElement).disabled).toBe(true);
    });

    // Attempt to click disabled Send button — executePlayground must not be called a second time
    expect(executeSpy).toHaveBeenCalledTimes(1);
    fireEvent.click(sendButton);
    expect(executeSpy).toHaveBeenCalledTimes(1);
  });

  it('re-verifies quota with retry button: remains disabled on failure, re-enables Send on success', async () => {
    let grantCallCount = 0;
    vi.spyOn(consumerApi, 'getSandboxGrant').mockImplementation(async () => {
      grantCallCount++;
      if (grantCallCount === 1) {
        return {
          id: 'g-initial',
          apiId: 'api-pg-1',
          maxRequests: 5,
          usedRequests: 0,
          remainingRequests: 5,
          available: true,
          expiresAt: '2026-10-28T00:00:00.000Z',
          revokedAt: null,
        };
      }
      if (grantCallCount === 2) {
        // First reconciliation after 504 fails
        throw new ApiError(502, 'BAD_GATEWAY', 'Upstream error');
      }
      if (grantCallCount === 3) {
        // User clicks "Xác minh lại quota", retry fails
        throw new ApiError(500, 'RETRY_FAIL', 'Control plane still down');
      }
      // grantCallCount >= 4: User clicks "Xác minh lại quota", retry succeeds with remaining quota
      return {
        id: 'g-initial',
        apiId: 'api-pg-1',
        maxRequests: 5,
        usedRequests: 1,
        remainingRequests: 4,
        available: true,
        expiresAt: '2026-10-28T00:00:00.000Z',
        revokedAt: null,
      };
    });

    vi.spyOn(consumerApi, 'executePlayground').mockRejectedValueOnce(
      new ApiError(504, 'GATEWAY_TIMEOUT', 'Gateway Timeout')
    );

    renderPlayground();
    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });
    expect(await screen.findByText(/Quota:\s*5\/5/)).toBeDefined();

    const sendButton = screen.getByRole('button', { name: /Send Request/i });
    fireEvent.click(sendButton);

    // Wait for reconciliation to fail
    await waitFor(() => {
      expect(screen.getByText(/Quota: Cần xác minh/i)).toBeDefined();
      expect((sendButton as HTMLButtonElement).disabled).toBe(true);
    });

    // Click retry button (call #3 -> fails)
    const retryButtons = screen.getAllByRole('button', { name: /Xác minh lại quota/i });
    fireEvent.click(retryButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Quota: Cần xác minh/i)).toBeDefined();
      expect((sendButton as HTMLButtonElement).disabled).toBe(true);
    });

    // Click retry button again (call #4 -> succeeds with 4 remaining)
    const retryButtons2 = screen.getAllByRole('button', { name: /Xác minh lại quota/i });
    fireEvent.click(retryButtons2[0]);

    await waitFor(() => {
      expect(screen.getByText(/Quota:\s*4\/5/)).toBeDefined();
      expect(screen.queryByText(/Quota: Cần xác minh/i)).toBeNull();
      expect((sendButton as HTMLButtonElement).disabled).toBe(false);
    });
  });

  it('discards pending quota reconciliation retry when switching API, preventing stale grant leakage', async () => {
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockImplementation(async (apiId) => {
      if (apiId === 'api-pg-1') return mockApiDetail;
      return { ...mockApiDetail, id: 'api-pg-2', name: 'API Two' };
    });

    let resolveRetryA: any;
    let grantCallCount = 0;
    vi.spyOn(consumerApi, 'getSandboxGrant').mockImplementation(async (apiId) => {
      grantCallCount++;
      if (apiId === 'api-pg-1') {
        if (grantCallCount === 1) {
          return {
            id: 'g-initial-1',
            apiId: 'api-pg-1',
            maxRequests: 5,
            usedRequests: 0,
            remainingRequests: 5,
            available: true,
            expiresAt: '2026-10-28T00:00:00.000Z',
            revokedAt: null,
          };
        }
        if (grantCallCount === 2) {
          // Automatic 504 reconciliation fails
          throw new ApiError(504, 'TIMEOUT', 'Timeout');
        }
        // Manual retry on API 1 is deferred
        return new Promise((resolve) => {
          resolveRetryA = resolve;
        });
      }

      // API 2 grant
      return {
        id: 'g-initial-2',
        apiId: 'api-pg-2',
        maxRequests: 5,
        usedRequests: 2,
        remainingRequests: 3,
        available: true,
        expiresAt: '2026-10-28T00:00:00.000Z',
        revokedAt: null,
      };
    });

    vi.spyOn(consumerApi, 'executePlayground').mockRejectedValueOnce(
      new ApiError(504, 'GATEWAY_TIMEOUT', 'Gateway Timeout')
    );

    let navigateFn: any;
    const TestNavigator: React.FC = () => {
      const navigate = useNavigate();
      navigateFn = navigate;
      return null;
    };

    render(
      <MemoryRouter initialEntries={['/api/api-pg-1/playground']}>
        <TestNavigator />
        <Routes>
          <Route path="/api/:id/playground" element={<ApiPlaygroundPage />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });
    expect(await screen.findByText(/Quota:\s*5\/5/)).toBeDefined();

    const sendButton = screen.getByRole('button', { name: /Send Request/i });
    fireEvent.click(sendButton);

    // Wait for reconciliation to fail
    await waitFor(() => {
      expect(screen.getByText(/Quota: Cần xác minh/i)).toBeDefined();
    });

    // Start manual re-verification on API 1 (promise is pending)
    const retryBtn = screen.getAllByRole('button', { name: /Xác minh lại quota/i })[0];
    fireEvent.click(retryBtn);

    // Navigate to API 2 before API 1 retry resolves
    act(() => {
      navigateFn('/api/api-pg-2/playground');
    });

    await screen.findByText('API Two');
    await waitFor(() => {
      expect(screen.getByText(/Quota:\s*3\/5/)).toBeDefined();
    });

    // Now resolve API 1 retry late
    act(() => {
      resolveRetryA({
        id: 'g-initial-1-reconciled',
        apiId: 'api-pg-1',
        maxRequests: 5,
        usedRequests: 0,
        remainingRequests: 5,
        available: true,
        expiresAt: '2026-10-28T00:00:00.000Z',
        revokedAt: null,
      });
    });

    // Ensure API 2 still has Quota: 3/5 and not overwritten by API 1's resolved grant
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getByText(/Quota:\s*3\/5/)).toBeDefined();
    expect(screen.queryByText(/Quota:\s*5\/5/)).toBeNull();
  });
});
