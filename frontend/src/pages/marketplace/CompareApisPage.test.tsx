import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CompareApisPage } from './CompareApisPage';
import * as marketplaceApi from '../../services/marketplaceApi';
import { ApiError } from '../../services/authApi';
import type { MarketplaceApiDetail, MarketplacePaginatedResponse } from '../../services/marketplaceTypes';

vi.mock('../../i18n', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

const mockListRes: MarketplacePaginatedResponse = {
  items: [
    {
      id: 'api-cmp-1',
      name: 'Alpha Search Engine',
      description: 'Ultra fast indexing engine',
      category: 'Search & Data',
      providerId: 'prov-1',
      providerName: 'Alpha Corp',
      providerStatus: 'Verified',
      tags: ['search'],
      hasFreePlan: true,
      hasPaidPlan: true,
      publishedAt: '2026-10-10T00:00:00Z',
    },
    {
      id: 'api-cmp-2',
      name: 'Beta NLP Engine',
      description: 'Advanced semantic text analysis',
      category: 'AI & ML',
      providerId: 'prov-2',
      providerName: 'Beta Labs',
      providerStatus: 'Verified',
      tags: ['nlp', 'ai'],
      hasFreePlan: true,
      hasPaidPlan: true,
      publishedAt: '2026-10-12T00:00:00Z',
    },
  ],
  total: 2,
  page: 1,
  pageSize: 50,
};

const mockDetail1: MarketplaceApiDetail = {
  ...mockListRes.items[0],
  versions: [{ id: 'v1', version: '1.0.0', changelog: '' }],
  endpoints: [
    {
      id: 'ep-1',
      versionId: 'v1',
      path: '/v1/search',
      method: 'GET',
      description: 'Search endpoint',
      parameters: [],
      requestSchema: null,
      responseExample: null,
    },
  ],
  documentation: [],
  legal: null,
  plans: [
    {
      id: 'p-1',
      name: 'Free Tier',
      priceMonthly: 0,
      currency: 'VND',
      quota: 1000,
      rateLimit: 5,
    },
  ],
};

const mockDetail2: MarketplaceApiDetail = {
  ...mockListRes.items[1],
  versions: [{ id: 'v1', version: '1.0.0', changelog: '' }],
  endpoints: [
    {
      id: 'ep-2',
      versionId: 'v1',
      path: '/v1/analyze',
      method: 'POST',
      description: 'Text analysis endpoint',
      parameters: [],
      requestSchema: null,
      responseExample: null,
    },
  ],
  documentation: [],
  legal: null,
  plans: [
    {
      id: 'p-2',
      name: 'Pro Tier',
      priceMonthly: 200000,
      currency: 'VND',
      quota: 25000,
      rateLimit: 25,
    },
  ],
};

describe('CompareApisPage - Bounded Concurrency & Differentiated Errors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders side-by-side comparison when both API details resolve successfully', async () => {
    vi.spyOn(marketplaceApi, 'listMarketplaceApis').mockResolvedValue(mockListRes);
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockImplementation(async (id) => {
      if (id === 'api-cmp-1') return mockDetail1;
      return mockDetail2;
    });

    render(
      <MemoryRouter>
        <CompareApisPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alpha Search Engine')).toBeDefined();
      expect(screen.getByText('Beta NLP Engine')).toBeDefined();
    });

    await waitFor(() => {
      expect(screen.getByText('Specification & Criteria')).toBeDefined();
      expect(screen.getAllByText('Alpha Search Engine').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Beta NLP Engine').length).toBeGreaterThan(0);
    });
  });

  it('differentiates partial error when one API detail request fails', async () => {
    vi.spyOn(marketplaceApi, 'listMarketplaceApis').mockResolvedValue(mockListRes);
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockImplementation(async (id) => {
      if (id === 'api-cmp-1') return mockDetail1;
      throw new ApiError(500, 'INTERNAL_ERROR', 'Service down');
    });

    render(
      <MemoryRouter>
        <CompareApisPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Không thể tải chi tiết của API thứ hai/)).toBeDefined();
    });

    // Still renders detail of API 1
    expect(screen.getByText('Alpha Search Engine')).toBeDefined();
  });

  it('differentiates complete error when both API detail requests fail', async () => {
    vi.spyOn(marketplaceApi, 'listMarketplaceApis').mockResolvedValue(mockListRes);
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockRejectedValue(
      new ApiError(500, 'FAIL', 'Network failure')
    );

    render(
      <MemoryRouter>
        <CompareApisPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Không thể tải chi tiết của cả 2 API để so sánh/)).toBeDefined();
    });
  });
});
