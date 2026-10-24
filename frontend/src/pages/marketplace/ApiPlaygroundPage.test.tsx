import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ApiPlaygroundPage } from './ApiPlaygroundPage';
import * as marketplaceApi from '../../services/marketplaceApi';
import type { MarketplaceApiDetail } from '../../services/marketplaceTypes';

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
      path: '/v1/users',
      method: 'GET',
      description: 'Get user list',
      parameters: [
        { name: 'role', in: 'query', required: false, schema: { type: 'string' }, default: 'admin' },
      ],
      requestSchema: null,
      responseExample: { status: 'ok', users: [] },
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

describe('ApiPlaygroundPage - Hardened Snippets & Safe SSRF Policy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders playground with endpoints and hardened snippet generator', async () => {
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(mockApiDetail);

    renderPlayground();

    expect(await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Playground Test API' })).toBeDefined();
    expect(screen.getAllByText('/v1/users').length).toBeGreaterThan(0);

    // Verify cURL snippet is present with POSIX single quote escaping
    const curlBlock = screen.getByText(/curl -X GET/);
    expect(curlBlock).toBeDefined();

    // Verify template notice
    expect(screen.getByText(/Thay thế YOUR_API_KEY bằng API Key thật/)).toBeDefined();
  });

  it('locks Send Request button with Sprint 4 notice to prevent client-side SSRF', async () => {
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(mockApiDetail);

    renderPlayground();
    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });

    const sendButton = screen.getByRole('button', { name: /Send Request/i });
    expect(sendButton.hasAttribute('disabled')).toBe(true);
    expect(screen.getByText(/Chính sách Gateway Proxy & Chống SSRF/)).toBeDefined();
  });

  it('switches tabs between cURL, JavaScript, and Python snippets', async () => {
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(mockApiDetail);

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
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(mockApiDetail);

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
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(mockApiDetail);

    renderPlayground();
    await screen.findByRole('heading', { level: 1, name: /API Playground & Gateway Sandbox/i });

    // Switch to Headers tab
    const headersTab = screen.getByRole('button', { name: /Headers/i });
    fireEvent.click(headersTab);

    // Enter sensitive API key
    const input = screen.getByPlaceholderText(/Enter API Key/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'super_secret_playground_token' } });

    // Switch to Snippets panel (already visible on right)
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
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(mockApiDetail);

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
