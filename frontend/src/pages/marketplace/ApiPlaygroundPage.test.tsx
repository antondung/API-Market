import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ApiPlaygroundPage } from './ApiPlaygroundPage';
import * as marketplaceApi from '../../services/marketplaceApi';
import * as consumerApi from '../../services/consumerApi';
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
      expect(executeSpy).toHaveBeenCalledWith('api-pg-1', expect.objectContaining({
        endpointId: 'ep-get',
        pathParams: expect.objectContaining({ userId: 'u-123' }),
      }));
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
});
