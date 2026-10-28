import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ApiDetailPage } from './ApiDetailPage';
import * as marketplaceApi from '../../services/marketplaceApi';
import { ApiError } from '../../services/authApi';
import type { MarketplaceApiDetail } from '../../services/marketplaceTypes';

vi.mock('../../i18n', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

const mockApiDetail: MarketplaceApiDetail = {
  id: 'api-detail-1',
  name: 'Global Climate Metrics API',
  description: 'Enterprise grade climate observations and atmospheric data streams.',
  providerId: 'prov-88',
  providerName: 'ClimateData Corp',
  providerStatus: 'Verified',
  category: 'Weather & Geo',
  tags: ['climate', 'weather'],
  hasFreePlan: true,
  hasPaidPlan: true,
  publishedAt: '2026-10-15T09:00:00.000Z',
  versions: [
    { id: 'ver-2', version: '2.0.0', changelog: 'Added high-res radar' },
    { id: 'ver-1', version: '1.0.0', changelog: 'Initial release' },
  ],
  endpoints: [
    {
      id: 'ep-1',
      versionId: 'ver-2',
      path: '/v2/observations/current',
      method: 'GET',
      description: 'Fetch real-time weather stations data.',
      parameters: [
        { name: 'city', in: 'query', required: true, schema: { type: 'string' }, default: 'Hanoi' },
      ],
      requestSchema: null,
      responseExample: null,
    },
    {
      id: 'ep-2',
      versionId: 'ver-1',
      path: '/v1/observations/legacy',
      method: 'GET',
      description: 'Legacy v1 weather observations.',
      parameters: [],
      requestSchema: null,
      responseExample: null,
    },
  ],
  documentation: [
    {
      versionId: 'ver-2',
      source: 'openapi',
      content: JSON.stringify({
        openapi: '3.0.0',
        info: {
          title: 'Global Climate Metrics API',
          version: '2.0.0',
          description: 'OpenAPI v3 specification for climate metrics.',
        },
        paths: {
          '/v2/observations/current': {
            get: {
              summary: 'Real-time weather station readings',
              responses: {
                '200': { description: 'Successful response' },
              },
            },
          },
        },
      }),
    },
  ],
  plans: [
    {
      id: 'plan-free',
      name: 'Sandbox Developer',
      priceMonthly: 0,
      currency: 'VND',
      quota: 1000,
      rateLimit: 5,
    },
    {
      id: 'plan-pro',
      name: 'Production Scale',
      priceMonthly: 2500000,
      currency: 'VND',
      quota: 500000,
      rateLimit: 50,
    },
  ],
  legal: {
    dataClassification: 'Public',
    processesPersonalData: false,
    personalDataTypes: [],
    dataProcessingPurpose: null,
  },
};

const renderPage = (apiId = 'api-detail-1') => {
  return render(
    <MemoryRouter initialEntries={[`/api/${apiId}`]}>
      <Routes>
        <Route path="/api/:id" element={<ApiDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ApiDetailPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading skeleton initially', () => {
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockImplementation(
      () => new Promise(() => {}) // never resolves
    );

    const { container } = renderPage();
    expect(container.querySelector('.animate-pulse')).toBeDefined();
  });

  it('renders API detail, endpoints, versions, and pricing plans successfully', async () => {
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(mockApiDetail);

    renderPage();

    expect(await screen.findByRole('heading', { level: 1, name: 'Global Climate Metrics API' })).toBeDefined();
    expect(screen.getAllByText('ClimateData Corp').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Provider ID: #prov-88').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Enterprise grade climate observations/).length).toBeGreaterThan(0);

    // Check version buttons
    expect(screen.getByRole('button', { name: 'v2.0.0' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'v1.0.0' })).toBeDefined();

    // Quick action buttons
    expect(screen.getByRole('button', { name: /Test in Playground/ })).toBeDefined();
    expect(screen.getByRole('button', { name: /Try Sandbox/ })).toBeDefined();
    expect(screen.getByRole('button', { name: /Compare API/ })).toBeDefined();
  });

  it('switches between tabs (Overview, Documentation, Endpoints, Pricing)', async () => {
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(mockApiDetail);

    renderPage();
    await screen.findByRole('heading', { level: 1, name: 'Global Climate Metrics API' });

    // Switch to Endpoints Tab
    const endpointsTab = screen.getByRole('button', { name: /Endpoints/ });
    fireEvent.click(endpointsTab);
    expect(await screen.findByText('/v2/observations/current')).toBeDefined();

    // Switch to OpenAPI Documentation Tab
    const docTab = screen.getByRole('button', { name: /OpenAPI Documentation/ });
    fireEvent.click(docTab);
    expect(await screen.findByText(/1\. Tổng quan \(Overview\)/)).toBeDefined();

    // Switch to Pricing Tab
    const pricingTab = screen.getByRole('button', { name: /Pricing Plans/ });
    fireEvent.click(pricingTab);
    expect(await screen.findByText('Sandbox Developer')).toBeDefined();
    expect(screen.getByText('Production Scale')).toBeDefined();
  });

  it('switches API version and filters endpoints accordingly', async () => {
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(mockApiDetail);

    renderPage();
    await screen.findByRole('heading', { level: 1, name: 'Global Climate Metrics API' });

    // Go to endpoints tab
    const endpointsTab = screen.getByRole('button', { name: /Endpoints/ });
    fireEvent.click(endpointsTab);
    expect(await screen.findByText('/v2/observations/current')).toBeDefined();

    // Click version v1.0.0
    const v1Button = screen.getByRole('button', { name: 'v1.0.0' });
    fireEvent.click(v1Button);

    // Should now show v1 endpoint
    expect(await screen.findByText('/v1/observations/legacy')).toBeDefined();
  });

  it('renders OpenAPI documentation via DocumentationViewer', async () => {
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(mockApiDetail);

    renderPage();
    await screen.findByRole('heading', { level: 1, name: 'Global Climate Metrics API' });

    const docTab = screen.getByRole('button', { name: /OpenAPI Documentation/ });
    fireEvent.click(docTab);

    // DocumentationViewer component renders OpenAPI version badge
    expect(await screen.findByText(/1\. Tổng quan \(Overview\)/)).toBeDefined();
    expect(screen.getByText(/OpenAPI Version: 3\.0\.0/)).toBeDefined();
  });

  it('displays report abuse modal with disabled action button per spec', async () => {
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(mockApiDetail);

    renderPage();
    await screen.findByRole('heading', { level: 1, name: 'Global Climate Metrics API' });

    // Click report abuse button
    const reportButton = screen.getByRole('button', { name: /Report API Vulnerability \/ Abuse/ });
    fireEvent.click(reportButton);

    // Modal opens
    expect(await screen.findByText('Báo cáo vi phạm / Lỗ hổng API')).toBeDefined();
    expect(screen.getByText(/Tính năng gửi báo cáo trực tuyến đang chờ kết nối Backend/)).toBeDefined();

    // Submit button is disabled pending backend
    const submitReportButton = screen.getByRole('button', { name: /Gửi báo cáo \(Chờ Backend\)/ });
    expect(submitReportButton.hasAttribute('disabled')).toBe(true);
  });

  it('handles API 404 Not Found error state properly', async () => {
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockRejectedValue(
      new ApiError(404, 'NOT_FOUND', 'API not found')
    );

    renderPage('missing-api-id');

    expect(await screen.findByText('API Not Found')).toBeDefined();
    expect(screen.getByText(/API này không tồn tại, chưa được xuất bản công khai/)).toBeDefined();
    expect(screen.getByRole('button', { name: /Browse Marketplace/ })).toBeDefined();
  });

  it('enforces strict version isolation without cross-version fallback for empty endpoints/docs', async () => {
    const detailWithEmptyVersion: MarketplaceApiDetail = {
      ...mockApiDetail,
      versions: [
        ...mockApiDetail.versions,
        { id: 'ver-3', version: '3.0.0-beta', changelog: 'Draft version' },
      ],
    };

    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(detailWithEmptyVersion);

    renderPage();
    await screen.findByRole('heading', { level: 1, name: 'Global Climate Metrics API' });

    // Select version 3.0.0-beta
    const v3Button = screen.getByRole('button', { name: 'v3.0.0-beta' });
    fireEvent.click(v3Button);

    // Switch to Endpoints tab
    const endpointsTab = screen.getByRole('button', { name: /Endpoints/ });
    fireEvent.click(endpointsTab);

    // Must show honest empty state for v3.0.0-beta, NOT fall back to v1 or v2 endpoints
    expect(await screen.findByText(/chưa có tài liệu endpoint công bố/)).toBeDefined();
    expect(screen.queryByText('/v2/observations/current')).toBeNull();
    expect(screen.queryByText('/v1/observations/legacy')).toBeNull();

    // Switch to Documentation tab
    const docTab = screen.getByRole('button', { name: /OpenAPI Documentation/ });
    fireEvent.click(docTab);

    // Must show honest empty state for v3.0.0-beta, NOT fall back to v2 documentation
    expect(await screen.findByText(/chưa có OpenAPI spec công bố/)).toBeDefined();
    expect(screen.queryByText(/1\. Tổng quan \(Overview\)/)).toBeNull();
  });
});
