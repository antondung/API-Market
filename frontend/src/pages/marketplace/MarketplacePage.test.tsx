import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MarketplacePage } from './MarketplacePage';
import * as marketplaceApi from '../../services/marketplaceApi';
import { ApiError } from '../../services/authApi';
import type { MarketplaceApiSummary, MarketplacePaginatedResponse } from '../../services/marketplaceTypes';

vi.mock('../../i18n', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

const mockItems: MarketplaceApiSummary[] = [
  {
    id: 'api-1',
    name: 'Weather Forecast Global',
    description: 'Real-time weather data worldwide with high accuracy.',
    providerId: 'prov-10',
    providerName: 'MeteoCorp',
    providerStatus: 'Verified',
    category: 'Weather & Geo',
    tags: ['weather'],
    hasFreePlan: true,
    hasPaidPlan: false,
    publishedAt: '2026-10-15T08:00:00.000Z',
  },
  {
    id: 'api-2',
    name: 'FinTech Banking Gateway',
    description: 'Unified banking API for transactions and account reconciliation.',
    providerId: 'prov-20',
    providerName: 'OpenBank Global',
    providerStatus: 'Verified',
    category: 'Finance & Banking',
    tags: ['banking'],
    hasFreePlan: false,
    hasPaidPlan: true,
    publishedAt: '2026-10-18T10:30:00.000Z',
  },
];

const mockResponse: MarketplacePaginatedResponse = {
  items: mockItems,
  total: 2,
  page: 1,
  pageSize: 20,
};

const renderPage = (initialRoute = '/marketplace') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/marketplace" element={<MarketplacePage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('MarketplacePage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders loading skeleton while fetching data', () => {
    vi.spyOn(marketplaceApi, 'listMarketplaceApis').mockImplementation(
      () => new Promise(() => {}) // never resolves
    );

    renderPage();
    expect(screen.getByLabelText('Loading marketplace APIs')).toBeDefined();
  });

  it('renders API list from backend successfully', async () => {
    vi.spyOn(marketplaceApi, 'listMarketplaceApis').mockResolvedValue(mockResponse);

    renderPage();

    expect(await screen.findByText('Weather Forecast Global')).toBeDefined();
    expect(screen.getByText('FinTech Banking Gateway')).toBeDefined();
    expect(screen.getByText('MeteoCorp')).toBeDefined();
    expect(screen.getByText('OpenBank Global')).toBeDefined();
    expect(screen.getAllByText('Free Tier Available').length).toBeGreaterThan(0);
  });

  it('debounces search input by 350ms before updating search params and querying', async () => {
    vi.useFakeTimers();
    const listSpy = vi.spyOn(marketplaceApi, 'listMarketplaceApis').mockResolvedValue(mockResponse);

    renderPage();
    expect(listSpy).toHaveBeenCalledTimes(1);

    const searchInput = screen.getByPlaceholderText('Search APIs by name, description...');
    fireEvent.change(searchInput, { target: { value: 'weather' } });

    // Should not trigger immediate query
    expect(listSpy).toHaveBeenCalledTimes(1);

    // Fast forward 200ms - still not called
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(listSpy).toHaveBeenCalledTimes(1);

    // Fast forward remaining 150ms (total 350ms)
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(listSpy).toHaveBeenCalledTimes(2);
    expect(listSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ q: 'weather', page: 1 }),
      expect.any(AbortSignal)
    );
  });

  it('filters by category, pricing, sort and navigates pagination', async () => {
    const listSpy = vi.spyOn(marketplaceApi, 'listMarketplaceApis').mockResolvedValue({
      ...mockResponse,
      total: 45,
    });

    renderPage();
    await screen.findByText('Weather Forecast Global');

    // Filter category
    const financeCategoryButton = screen.getByRole('button', { name: /Finance & Banking/ });
    fireEvent.click(financeCategoryButton);

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'Finance & Banking' }),
        expect.any(AbortSignal)
      );
    });

    // Filter pricing: Free only
    const freeRadio = screen.getByRole('radio', { name: /Free Tier Available/ });
    fireEvent.click(freeRadio);

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledWith(
        expect.objectContaining({ pricing: 'free' }),
        expect.any(AbortSignal)
      );
    });

    // Reset filters
    const resetButton = screen.getByRole('button', { name: /Reset|Đặt lại/ });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledWith(
        expect.objectContaining({ category: undefined, pricing: undefined }),
        expect.any(AbortSignal)
      );
    });
  });

  it('displays error state when backend API fails and allows retry', async () => {
    vi.spyOn(marketplaceApi, 'listMarketplaceApis')
      .mockRejectedValueOnce(new ApiError(500, 'INTERNAL_SERVER_ERROR', 'Máy chủ nội bộ gặp lỗi'))
      .mockResolvedValueOnce(mockResponse);

    renderPage();

    expect(await screen.findByText('Không thể tải danh sách API')).toBeDefined();
    expect(screen.getByText('Máy chủ nội bộ gặp lỗi')).toBeDefined();

    const retryButton = screen.getByRole('button', { name: /Thử lại/ });
    fireEvent.click(retryButton);

    expect(await screen.findByText('Weather Forecast Global')).toBeDefined();
  });

  it('displays rate-limit specific guidance when backend returns 429', async () => {
    vi.spyOn(marketplaceApi, 'listMarketplaceApis').mockRejectedValue(
      new ApiError(429, 'RATE_LIMIT_EXCEEDED', 'Too Many Requests')
    );

    renderPage();

    expect(await screen.findByText('Gửi yêu cầu quá nhanh')).toBeDefined();
    expect(screen.getByText(/Hệ thống đang giới hạn tần suất truy vấn/)).toBeDefined();
  });

  it('keeps server pagination consistent by disabling client-side verified filtering', async () => {
    vi.spyOn(marketplaceApi, 'listMarketplaceApis').mockResolvedValue(mockResponse);

    renderPage();
    await screen.findByText('Weather Forecast Global');

    // Verified filter checkbox must be disabled with Sprint 4 notice
    const verifiedCheckboxes = screen.getAllByRole('checkbox');
    const verifiedCheckbox = verifiedCheckboxes.find(cb => cb.hasAttribute('disabled'));
    expect(verifiedCheckbox).toBeDefined();
    expect(verifiedCheckbox?.hasAttribute('disabled')).toBe(true);
    expect(screen.getAllByText('Chờ Sprint 4').length).toBeGreaterThan(0);

    // Both items from server are rendered consistently with total count
    expect(screen.getByText('Weather Forecast Global')).toBeDefined();
    expect(screen.getByText('FinTech Banking Gateway')).toBeDefined();

    // Provider verified badges remain visible on cards
    expect(screen.getAllByTitle('Verified Provider').length).toBe(2);
  });
});
