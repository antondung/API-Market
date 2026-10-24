import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TrySandboxPage } from './TrySandboxPage';
import * as marketplaceApi from '../../services/marketplaceApi';
import type { MarketplaceApiDetail } from '../../services/marketplaceTypes';

vi.mock('../../i18n', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

const mockApiDetail: MarketplaceApiDetail = {
  id: 'api-sandbox-1',
  name: 'Global Geocoding Sandbox API',
  description: 'Precision geolocation and reverse geocoding engine.',
  providerId: 'prov-geo',
  providerName: 'GeoData Corp',
  providerStatus: 'Verified',
  category: 'Weather & Geo',
  tags: ['geo', 'maps'],
  hasFreePlan: true,
  hasPaidPlan: true,
  publishedAt: '2026-10-15T09:00:00.000Z',
  versions: [
    { id: 'v1', version: '1.0.0', changelog: 'Initial' },
  ],
  endpoints: [
    {
      id: 'ep-1',
      versionId: 'v1',
      path: '/v1/geocode/forward',
      method: 'GET',
      description: 'Convert address to coordinates',
      parameters: [
        { name: 'address', in: 'query', required: true, schema: { type: 'string' }, default: '123 Main St' },
      ],
      requestSchema: null,
      responseExample: null,
    },
  ],
  plans: [
    {
      id: 'plan-1',
      name: 'Sandbox Free',
      priceMonthly: 0,
      currency: 'VND',
      rateLimit: 10,
      quota: 1000,
      recommended: false,
    },
  ],
  documentation: [],
  legal: null,
};

const renderPage = (apiId = 'api-sandbox-1') => {
  return render(
    <MemoryRouter initialEntries={[`/api/${apiId}/sandbox`]}>
      <Routes>
        <Route path="/api/:id/sandbox" element={<TrySandboxPage />} />
        <Route path="/consumer/keys" element={<div>API Keys Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('TrySandboxPage Security & Credential Hygiene', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(mockApiDetail);
  });

  it('does not render hardcoded fake demo credentials or unverified gateway claims', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
    });

    // Zero fake demo keys in DOM
    expect(screen.queryByText('ak_sand_consumer_demo_test')).toBeNull();

    // Fabricated claims removed
    expect(screen.queryByText(/Anti-SSRF Gateway Guard: Bật/i)).toBeNull();
    expect(screen.queryByText(/Rate Limit: 5 req\/giây \(Sandbox Mode\)/i)).toBeNull();

    // Renders honest auth requirement and API Keys navigation
    expect(screen.getByText('Yêu cầu Khóa Xác thực (API Key)')).toBeDefined();
    expect(screen.getByText('Quản lý API Keys')).toBeDefined();
  });

  it('renders custom API key input with password masking by default', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
    });

    const input = screen.getByPlaceholderText(/Nhập API Key của bạn/i);
    expect(input.getAttribute('type')).toBe('password');

    // Type a key
    fireEvent.change(input, { target: { value: 'my_secret_token_999' } });
    expect((input as HTMLInputElement).value).toBe('my_secret_token_999');

    // Toggle reveal button
    const revealBtn = screen.getByTitle('Hiện');
    fireEvent.click(revealBtn);
    expect(input.getAttribute('type')).toBe('text');
  });

  it('does not store custom API key into localStorage or sessionStorage', async () => {
    const localSpy = vi.spyOn(Storage.prototype, 'setItem');
    const sessionSpy = vi.spyOn(sessionStorage, 'setItem');

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
    });

    const input = screen.getByPlaceholderText(/Nhập API Key của bạn/i);
    fireEvent.change(input, { target: { value: 'ephemeral_test_key_xyz' } });

    expect(localSpy).not.toHaveBeenCalledWith(expect.stringMatching(/api.*key|secret/i), expect.anything());
    expect(sessionSpy).not.toHaveBeenCalledWith(expect.stringMatching(/api.*key|secret/i), expect.anything());

    localSpy.mockRestore();
    sessionSpy.mockRestore();
  });

  it('locks browser sandbox execution button in Step 3 awaiting backend gateway', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
    });

    // Navigate to step 3
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục: Chọn Endpoint/i }));
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục: Xem cURL & Chạy thử/i }));

    // Verify Step 3 execution button is safely disabled
    const execBtn = screen.getByRole('button', { name: /Kích hoạt Sandbox Key/i });
    expect(execBtn.hasAttribute('disabled')).toBe(true);
    expect(execBtn.getAttribute('title')).toContain('Sprint 4');
  });
});
