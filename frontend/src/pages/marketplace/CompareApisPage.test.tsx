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

    // Still renders table and detail of API 1
    expect(screen.getByText('Specification & Criteria')).toBeDefined();
    expect(screen.getAllByText('Alpha Search Engine').length).toBeGreaterThan(0);
    // Shows retry button for API 2
    expect(screen.getByRole('button', { name: /Thử lại API 2/i })).toBeDefined();
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

    expect(screen.getByRole('button', { name: /Thử lại tất cả/i })).toBeDefined();
  });

  it('supports deep linking via ?api1=...&api2=...', async () => {
    vi.spyOn(marketplaceApi, 'listMarketplaceApis').mockResolvedValue(mockListRes);
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockImplementation(async (id) => {
      if (id === 'api-cmp-1') return mockDetail1;
      return mockDetail2;
    });

    render(
      <MemoryRouter initialEntries={['/compare?api1=api-cmp-1&api2=api-cmp-2']}>
        <CompareApisPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Specification & Criteria')).toBeDefined();
      expect(screen.getAllByText('Alpha Search Engine').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Beta NLP Engine').length).toBeGreaterThan(0);
    });
  });

  it('prevents comparing an API with itself and shows clear warning block', async () => {
    vi.spyOn(marketplaceApi, 'listMarketplaceApis').mockResolvedValue(mockListRes);
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(mockDetail1);

    render(
      <MemoryRouter initialEntries={['/compare?api1=api-cmp-1&api2=api-cmp-1']}>
        <CompareApisPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Không thể so sánh một API với chính nó')).toBeDefined();
      expect(
        screen.getByText(/Bạn đã chọn cùng một API ở cả hai slot/i)
      ).toBeDefined();
    });

    // Comparison matrix table must NOT be rendered when same API is selected
    expect(screen.queryByText('Specification & Criteria')).toBeNull();
  });

  it('handles tri-state legal data processing (true -> Có, false -> Không, null -> Chưa công bố)', async () => {
    const detailWithTrue: MarketplaceApiDetail = {
      ...mockDetail1,
      legal: {
        dataClassification: 'Confidential',
        processesPersonalData: true,
        personalDataTypes: ['User ID', 'Email'],
        dataProcessingPurpose: 'Analytics',
      },
    };

    const detailWithFalse: MarketplaceApiDetail = {
      ...mockDetail2,
      legal: {
        dataClassification: 'Public',
        processesPersonalData: false,
        personalDataTypes: [],
        dataProcessingPurpose: null,
      },
    };

    vi.spyOn(marketplaceApi, 'listMarketplaceApis').mockResolvedValue(mockListRes);
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockImplementation(async (id) => {
      if (id === 'api-cmp-1') return detailWithTrue;
      return detailWithFalse;
    });

    render(
      <MemoryRouter initialEntries={['/compare?api1=api-cmp-1&api2=api-cmp-2']}>
        <CompareApisPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Specification & Criteria')).toBeDefined();
    });

    // Detail 1 has true -> 'Có'
    expect(screen.getByText('Có')).toBeDefined();
    // Detail 2 has false -> 'Không'
    expect(screen.getByText('Không')).toBeDefined();
  });

  it('renders "Chưa công bố" when legal data or processesPersonalData is null/undefined', async () => {
    const detailWithNullLegal: MarketplaceApiDetail = {
      ...mockDetail1,
      legal: null,
    };

    const detailWithUndefinedField: MarketplaceApiDetail = {
      ...mockDetail2,
      legal: {
        dataClassification: 'Internal',
        processesPersonalData: undefined as unknown as boolean,
        personalDataTypes: [],
        dataProcessingPurpose: null,
      },
    };

    vi.spyOn(marketplaceApi, 'listMarketplaceApis').mockResolvedValue(mockListRes);
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockImplementation(async (id) => {
      if (id === 'api-cmp-1') return detailWithNullLegal;
      return detailWithUndefinedField;
    });

    render(
      <MemoryRouter initialEntries={['/compare?api1=api-cmp-1&api2=api-cmp-2']}>
        <CompareApisPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Specification & Criteria')).toBeDefined();
    });

    // Both should render 'Chưa công bố'
    const unannouncedBadges = screen.getAllByText('Chưa công bố');
    expect(unannouncedBadges.length).toBeGreaterThanOrEqual(2);
  });

  it('supports catalog pagination and renders Next/Prev pagination controls', async () => {
    const paginatedCatalog: MarketplacePaginatedResponse = {
      items: mockListRes.items,
      total: 30, // 3 pages of 12
      page: 1,
      pageSize: 12,
    };

    vi.spyOn(marketplaceApi, 'listMarketplaceApis').mockResolvedValue(paginatedCatalog);
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
      expect(screen.getByText(/Trang\s+1\/3/i)).toBeDefined();
    });

    const prevBtn = screen.getByRole('button', { name: /Trang trước/i });
    const nextBtn = screen.getByRole('button', { name: /Trang sau/i });

    expect(prevBtn.hasAttribute('disabled')).toBe(true);
    expect(nextBtn.hasAttribute('disabled')).toBe(false);
  });
});
