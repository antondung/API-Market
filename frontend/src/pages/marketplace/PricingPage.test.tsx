import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { PricingPage } from './PricingPage';
import * as marketplaceApi from '../../services/marketplaceApi';
import { ApiError } from '../../services/authApi';
import type { MarketplaceApiDetail, MarketplacePaginatedResponse } from '../../services/marketplaceTypes';

const mockT = (key: string) => key;
vi.mock('../../i18n', () => ({
  useLanguage: () => ({ t: mockT }),
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

  it('handles 404 on deep link honestly without silent fallback and allows clearing to full catalog', async () => {
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockRejectedValue(
      new ApiError(404, 'NOT_FOUND', 'API not found')
    );
    const listSpy = vi.spyOn(marketplaceApi, 'listMarketplaceApis').mockResolvedValue(mockApiListResponse);

    render(
      <MemoryRouter initialEntries={['/pricing?api=non-existent-api']}>
        <PricingPage />
      </MemoryRouter>
    );

    // Differentiated 404 card rendered
    await waitFor(() => {
      expect(screen.getByText(/API không tìm thấy \(404\)/i)).toBeDefined();
      expect(screen.getByText(/API không tồn tại hoặc đã ngừng xuất bản trên sàn/i)).toBeDefined();
      expect(screen.getByText(/ID: non-existent-api/i)).toBeDefined();
    });

    // Does NOT silently fall back to general catalog list API
    expect(listSpy).not.toHaveBeenCalled();

    // Clicking "Xem tất cả API" clears deep link and triggers catalog list
    const viewAllBtn = screen.getByRole('button', { name: /Xem tất cả API/i });
    fireEvent.click(viewAllBtn);

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalled();
    });
  });

  it('handles 429 rate limit on deep link with retry and clear controls', async () => {
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockRejectedValue(
      new ApiError(429, 'RATE_LIMITED', 'Too many requests')
    );
    const listSpy = vi.spyOn(marketplaceApi, 'listMarketplaceApis');

    render(
      <MemoryRouter initialEntries={['/pricing?api=rate-limited-api']}>
        <PricingPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Quá nhiều yêu cầu \(429\)/i)).toBeDefined();
      expect(screen.getByText(/Hệ thống đang nhận quá nhiều yêu cầu \(Rate Limit\)/i)).toBeDefined();
    });

    // Shows retry and view all buttons
    expect(screen.getByRole('button', { name: /Thử lại cho API này/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Xem tất cả API/i })).toBeDefined();
    expect(listSpy).not.toHaveBeenCalled();
  });

  it('handles 500 server error on deep link with retry button', async () => {
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockRejectedValue(
      new ApiError(500, 'INTERNAL_ERROR', 'Database gateway timeout')
    );

    render(
      <MemoryRouter initialEntries={['/pricing?api=failing-api']}>
        <PricingPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Lỗi kết nối máy chủ/i)).toBeDefined();
      expect(screen.getByText(/Database gateway timeout/i)).toBeDefined();
    });

    expect(screen.getByRole('button', { name: /Thử lại cho API này/i })).toBeDefined();
  });

  it('grounds feature comparison matrix strictly in backend plan fields and renders Sprint 4 disclaimer', async () => {
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

    // Expand feature comparison matrix
    const expandBtn = screen.getByRole('button', { name: /Xem chi tiết/i });
    fireEvent.click(expandBtn);

    // Verify presence of grounded backend fields
    expect(screen.getByText('Biểu phí hàng tháng (priceMonthly / currency)')).toBeDefined();
    expect(screen.getByText('Hạn mức lượt gọi hàng tháng (quota)')).toBeDefined();
    expect(screen.getByText('Giới hạn tần suất gọi (rateLimit)')).toBeDefined();
    expect(screen.getByText('Xác thực API Gateway')).toBeDefined();

    // Verify absence of unsourced marketing claims
    expect(screen.queryByText('Dedicated Quota')).toBeNull();
    expect(screen.queryByText('Bảo vệ chống SSRF & Proxy trung tâm')).toBeNull();
    expect(screen.queryByText('Hỗ trợ kỹ thuật (Support Tier)')).toBeNull();

    // Verify Sprint 4 backend grounding disclaimer
    expect(
      screen.getByText(/Bảng so sánh hiển thị các trường dữ liệu thực có trong backend plan model/i)
    ).toBeDefined();
  });

  it('recovers from 429 rate limit on retry: first 429 -> retry -> 200 -> pricing visible and error hidden', async () => {
    let callCount = 0;
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        throw new ApiError(429, 'RATE_LIMITED', 'Too many requests');
      }
      return mockApiDetail;
    });

    render(
      <MemoryRouter initialEntries={['/pricing?api=api-pricing-test-1']}>
        <PricingPage />
      </MemoryRouter>
    );

    // Initial 429 error card is visible
    await waitFor(() => {
      expect(screen.getByText(/Quá nhiều yêu cầu \(429\)/i)).toBeDefined();
    });
    expect(screen.queryByText('Cloud Payment Engine')).toBeNull();

    // Click retry button
    const retryBtn = screen.getByRole('button', { name: /Thử lại cho API này/i });
    fireEvent.click(retryBtn);

    // After successful retry, pricing details are visible and error card is completely hidden
    await waitFor(() => {
      expect(screen.getByText('Cloud Payment Engine')).toBeDefined();
      expect(screen.getByText('500.000 ₫')).toBeDefined();
    });
    expect(screen.queryByText(/Quá nhiều yêu cầu \(429\)/i)).toBeNull();
  });

  it('recovers from 500 server error on retry: first 500 -> retry -> 200 -> pricing visible and error hidden', async () => {
    let callCount = 0;
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        throw new ApiError(500, 'INTERNAL_ERROR', 'Service temporarily down');
      }
      return mockApiDetail;
    });

    render(
      <MemoryRouter initialEntries={['/pricing?api=api-pricing-test-1']}>
        <PricingPage />
      </MemoryRouter>
    );

    // Initial 500 error card is visible
    await waitFor(() => {
      expect(screen.getByText(/Lỗi kết nối máy chủ/i)).toBeDefined();
    });
    expect(screen.queryByText('Cloud Payment Engine')).toBeNull();

    // Click retry
    const retryBtn = screen.getByRole('button', { name: /Thử lại cho API này/i });
    fireEvent.click(retryBtn);

    // Successful retry clears error and shows pricing
    await waitFor(() => {
      expect(screen.getByText('Cloud Payment Engine')).toBeDefined();
      expect(screen.getByText('500.000 ₫')).toBeDefined();
    });
    expect(screen.queryByText(/Lỗi kết nối máy chủ/i)).toBeNull();
  });

  it('retains latest error on repeated failure: call 1 429 -> retry -> call 2 still 429 -> latest error visible', async () => {
    let callCount = 0;
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        throw new ApiError(429, 'RATE_LIMITED', 'Rate limit initial hit');
      }
      throw new ApiError(429, 'RATE_LIMITED', 'Rate limit subsequent hit');
    });

    render(
      <MemoryRouter initialEntries={['/pricing?api=api-pricing-test-1']}>
        <PricingPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Quá nhiều yêu cầu \(429\)/i)).toBeDefined();
    });

    // Click retry
    const retryBtn = screen.getByRole('button', { name: /Thử lại cho API này/i });
    fireEvent.click(retryBtn);

    // Second failure keeps error card visible and pricing hidden
    await waitFor(() => {
      expect(screen.getByText(/Quá nhiều yêu cầu \(429\)/i)).toBeDefined();
    });
    expect(screen.queryByText('Cloud Payment Engine')).toBeNull();
  });

  it('prevents stale response overwrite when navigating between two API IDs with first request resolving late', async () => {
    let resolveFirst: ((val: MarketplaceApiDetail) => void) | null = null;
    const firstPromise = new Promise<MarketplaceApiDetail>((resolve) => {
      resolveFirst = resolve;
    });

    const secondApiDetail: MarketplaceApiDetail = {
      ...mockApiDetail,
      id: 'api-pricing-test-2',
      name: 'Second API Service',
    };

    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockImplementation(async (id) => {
      if (id === 'api-pricing-test-1') {
        return firstPromise;
      }
      return secondApiDetail;
    });

    const NavTestHarness = () => {
      const navigate = useNavigate();
      return (
        <>
          <button onClick={() => navigate('/pricing?api=api-pricing-test-2')}>Switch API</button>
          <PricingPage />
        </>
      );
    };

    render(
      <MemoryRouter initialEntries={['/pricing?api=api-pricing-test-1']}>
        <NavTestHarness />
      </MemoryRouter>
    );

    // Switch to second API before first resolves
    fireEvent.click(screen.getByRole('button', { name: 'Switch API' }));

    // Second API resolves immediately
    await waitFor(() => {
      expect(screen.getByText('Second API Service')).toBeDefined();
    });

    // Now first API resolves late
    if (resolveFirst) {
      (resolveFirst as (val: MarketplaceApiDetail) => void)(mockApiDetail);
    }

    // Second API must remain active; late first response must not overwrite
    await waitFor(() => {
      expect(screen.getByText('Second API Service')).toBeDefined();
    });
    expect(screen.queryByText('Cloud Payment Engine')).toBeNull();
  });

  it('loads general catalog and clears deep link error after clicking clear on 404', async () => {
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockImplementation(async (id) => {
      if (id === 'missing-api') {
        throw new ApiError(404, 'NOT_FOUND', 'API not found');
      }
      return mockApiDetail;
    });
    const listSpy = vi
      .spyOn(marketplaceApi, 'listMarketplaceApis')
      .mockResolvedValue(mockApiListResponse);

    render(
      <MemoryRouter initialEntries={['/pricing?api=missing-api']}>
        <PricingPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/API không tìm thấy \(404\)/i)).toBeDefined();
    });

    // Click "Xem tất cả API" to clear deep link
    const clearBtn = screen.getByRole('button', { name: /Xem tất cả API/i });
    fireEvent.click(clearBtn);

    // General catalog is loaded and error is hidden
    await waitFor(() => {
      expect(listSpy).toHaveBeenCalled();
      expect(screen.getByText('Cloud Payment Engine')).toBeDefined();
    });
    expect(screen.queryByText(/API không tìm thấy \(404\)/i)).toBeNull();
  });
});
