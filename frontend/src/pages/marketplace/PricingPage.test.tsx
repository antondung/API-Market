import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PricingPage } from './PricingPage';
import * as marketplaceApi from '../../services/marketplaceApi';
import type { MarketplaceApiDetail, MarketplacePaginatedResponse } from '../../services/marketplaceTypes';

vi.mock('../../i18n', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

const mockApiListResponse: MarketplacePaginatedResponse = {
  items: [
    {
      id: 'api-pricing-test-1',
      name: 'Cloud Payment Engine',
      description: 'High performance payment routing API',
      category: 'Financial',
      providerId: 'prov-fin-1',
      providerName: 'FinTech Solutions',
      providerStatus: 'Verified',
      tags: ['finance', 'payment'],
      hasFreePlan: true,
      hasPaidPlan: true,
      publishedAt: '2026-10-20T00:00:00Z',
    },
  ],
  total: 1,
  page: 1,
  pageSize: 12,
};

const mockApiDetail: MarketplaceApiDetail = {
  id: 'api-pricing-test-1',
  name: 'Cloud Payment Engine',
  description: 'High performance payment routing API',
  category: 'Financial',
  providerId: 'prov-fin-1',
  providerName: 'FinTech Solutions',
  providerStatus: 'Verified',
  tags: ['finance', 'payment'],
  hasFreePlan: true,
  hasPaidPlan: true,
  publishedAt: '2026-10-20T00:00:00Z',
  versions: [{ id: 'v1', version: '1.0.0', changelog: '' }],
  endpoints: [],
  documentation: [],
  legal: null,
  plans: [
    {
      id: 'plan-starter',
      name: 'Starter Tier',
      priceMonthly: 0,
      currency: 'VND',
      quota: 1000,
      rateLimit: 5,
    },
    {
      id: 'plan-pro',
      name: 'Pro Tier',
      priceMonthly: 500000,
      currency: 'VND',
      quota: 50000,
      rateLimit: 50,
      recommended: false,
    },
  ],
};

describe('PricingPage - Audit Remediation & Price Immutability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders exact monthly price without artificial 20% discount', async () => {
    vi.spyOn(marketplaceApi, 'listMarketplaceApis').mockResolvedValue(mockApiListResponse);
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(mockApiDetail);

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Cloud Payment Engine')).toBeDefined();
    });

    // Verify 500.000 ₫ is rendered exactly
    const proPriceText = screen.getByText('500.000 ₫');
    expect(proPriceText).toBeDefined();

    // Verify artificial discounted price (500000 * 0.8 = 400.000 ₫) is NOT in document
    const discountedPrice = screen.queryByText('400.000 ₫');
    expect(discountedPrice).toBeNull();

    // Verify Save 20% badge is completely removed
    const saveBadge = screen.queryByText(/Save 20%/i);
    expect(saveBadge).toBeNull();
  });

  it('disables Annual Billing button with Sprint 4 notice and maintains price immutability', async () => {
    vi.spyOn(marketplaceApi, 'listMarketplaceApis').mockResolvedValue(mockApiListResponse);
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(mockApiDetail);

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Cloud Payment Engine')).toBeDefined();
    });

    const annualButton = screen.getByRole('button', { name: /Annual Billing/i });
    expect(annualButton.hasAttribute('disabled')).toBe(true);
    expect(screen.getByText('Chờ Sprint 4')).toBeDefined();

    // Price remains 500.000 ₫
    expect(screen.getByText('500.000 ₫')).toBeDefined();
  });

  it('does not display fabricated Redis cluster or 99.99% financial SLA claims', async () => {
    vi.spyOn(marketplaceApi, 'listMarketplaceApis').mockResolvedValue(mockApiListResponse);
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(mockApiDetail);

    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Cloud Payment Engine')).toBeDefined();
    });

    // Check for absence of ungrounded technical claims
    expect(screen.queryByText(/99.99% Financial SLA/i)).toBeNull();
    expect(screen.queryByText(/Redis Cluster Caching/i)).toBeNull();
    expect(screen.queryByText('5 - 10 req/s')).toBeNull();
    expect(screen.queryByText('50 - 200 req/s')).toBeNull();
    expect(screen.queryByText(/Email & Ticketing \(24h\)/i)).toBeNull();
    expect(screen.queryByText(/Dedicated Slack/i)).toBeNull();

    // Verify SLA disclaimer is displayed
    expect(
      screen.getByText('Chi tiết SLA và kênh hỗ trợ theo cam kết cụ thể của từng Provider hoặc thỏa thuận riêng.')
    ).toBeDefined();
  });

  it('displays deep link filter banner when ?api=<id> is present', async () => {
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(mockApiDetail);

    render(
      <MemoryRouter initialEntries={['/pricing?api=api-pricing-test-1']}>
        <PricingPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Cloud Payment Engine')).toBeDefined();
    });

    expect(screen.getByText(/Đang xem bảng giá cho API được chọn:/i)).toBeDefined();
    expect(screen.getByText('api-pricing-test-1')).toBeDefined();
  });
});
