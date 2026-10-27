import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CheckoutPage } from './CheckoutPage';
import * as marketplaceApi from '../../services/marketplaceApi';
import * as authContext from '../../context/AuthContext';
import type { MarketplaceApiDetail } from '../../services/marketplaceTypes';

vi.mock('../../i18n', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

const mockApiDetail: MarketplaceApiDetail = {
  id: 'api-checkout-test',
  name: 'Enterprise Checkout API',
  description: 'Payment routing test',
  category: 'Finance',
  providerId: 'prov-chk',
  providerName: 'Checkout Inc',
  providerStatus: 'Verified',
  tags: ['finance'],
  hasFreePlan: false,
  hasPaidPlan: true,
  publishedAt: '2026-10-20T00:00:00Z',
  versions: [{ id: 'v1', version: '1.0.0', changelog: '' }],
  endpoints: [],
  documentation: [],
  legal: null,
  plans: [
    {
      id: 'plan-chk-1',
      name: 'Growth Tier',
      priceMonthly: 750000,
      currency: 'VND',
      quota: 100000,
      rateLimit: 100,
    },
  ],
};

const renderCheckout = (initialRoute = '/checkout/api-checkout-test/plan-chk-1') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/checkout/:apiId/:planId" element={<CheckoutPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('CheckoutPage - Data Integrity & Claim Sanitization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      currentUser: { id: 'usr-1', email: 'test@example.com', role: 'consumer', name: 'Tester' } as any,
      user: { id: 'usr-1', email: 'test@example.com', role: 'consumer', name: 'Tester' } as any,
      isAuthenticated: true,
      sessionReady: true,
      sessionError: null,
      backendOnline: true,
      checkBackendConnection: vi.fn(),
      retrySession: vi.fn(),
      loginWithBackend: vi.fn(),
      registerWithBackend: vi.fn(),
      logout: vi.fn(),
      verifyRoleAccess: vi.fn(),
    });
  });

  it('renders exact plan pricing and removes unverified Redis cluster claim', async () => {
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(mockApiDetail);

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByText('Enterprise Checkout API')).toBeDefined();
    });

    // Exact price
    expect(screen.getAllByText(/750\.000\s*₫/).length).toBeGreaterThan(0);

    // Redis cluster claim must be sanitized to API Gateway Egress
    expect(screen.getByText('API Gateway Egress')).toBeDefined();
    expect(screen.queryByText(/Redis Guard/i)).toBeNull();
  });

  it('locks checkout activation button awaiting Sprint 4 backend subscription', async () => {
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(mockApiDetail);

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByText('Enterprise Checkout API')).toBeDefined();
    });

    const activateBtn = screen.getByRole('button', { name: /Đăng ký gói/i });
    expect(activateBtn.hasAttribute('disabled')).toBe(true);
    expect(screen.getByText(/Chờ Sprint 4/)).toBeDefined();
  });
});
