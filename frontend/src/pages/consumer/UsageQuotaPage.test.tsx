import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  UsageQuotaPage,
  calculateQuotaProgress,
  validateDateRange,
  formatDate,
  mapUsageError,
} from './UsageQuotaPage';
import * as usageApi from '../../services/usageApi';
import { ApiError } from '../../services/authApi';

vi.mock('../../i18n', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

describe('UsageQuotaPage (FE-04.2 Consumer Usage Dashboard)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Loading skeleton
  it('renders loading skeleton while fetching usage data', () => {
    vi.spyOn(usageApi, 'getConsumerUsageSummary').mockReturnValue(
      new Promise(() => {})
    );

    render(
      <MemoryRouter>
        <UsageQuotaPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('usage-loading')).toBeDefined();
  });

  // 2. Empty state with explore link
  it('renders empty state with explore link when no subscriptions or daily usage exist', async () => {
    vi.spyOn(usageApi, 'getConsumerUsageSummary').mockResolvedValueOnce({
      subscriptions: [],
      daily: [],
    });

    render(
      <MemoryRouter>
        <UsageQuotaPage />
      </MemoryRouter>
    );

    const emptyContainer = await screen.findByTestId('usage-empty');
    expect(emptyContainer).toBeDefined();
    expect(screen.getByText('Chưa có đăng ký API')).toBeDefined();
    const exploreBtns = screen.getAllByRole('button', { name: /Explore Marketplace/i });
    expect(exploreBtns.length).toBeGreaterThanOrEqual(1);
  });

  // 3. Success render with real subscriptions & daily stats
  it('renders success content with real subscriptions and daily traffic stats', async () => {
    vi.spyOn(usageApi, 'getConsumerUsageSummary').mockResolvedValueOnce({
      subscriptions: [
        {
          id: 'sub_live_01',
          apiId: 'weather-api',
          status: 'Active',
          quotaUsed: '1500',
          quotaLimit: '10000',
          remainingRequests: '8500',
          periodStart: '2026-11-01T00:00:00Z',
          periodEnd: '2026-11-30T23:59:59Z',
        },
      ],
      daily: [
        {
          date: '2026-11-01',
          requestCount: '1000',
          successCount: '950',
          errorCount: '50',
        },
        {
          date: '2026-11-02',
          requestCount: '500',
          successCount: '490',
          errorCount: '10',
        },
      ],
    });

    render(
      <MemoryRouter>
        <UsageQuotaPage />
      </MemoryRouter>
    );

    expect(await screen.findByTestId('usage-content')).toBeDefined();
    expect(screen.getByText(/weather-api/)).toBeDefined();
    expect(screen.getByText('8.500 lượt')).toBeDefined();
    expect(screen.getByTestId('subscription-usage-card-sub_live_01')).toBeDefined();
    expect(screen.getByTestId('daily-row-2026-11-01')).toBeDefined();
    expect(screen.getByTestId('daily-row-2026-11-02')).toBeDefined();
    expect(screen.getByText('1.500')).toBeDefined();
    expect(screen.getByText('1.440')).toBeDefined();
    expect(screen.getByText('60')).toBeDefined();
  });

  // 4. BigInt safety with values exceeding JS safe integers (> 9007199254740991)
  it('handles BigInt numbers exceeding JS Number.MAX_SAFE_INTEGER without precision loss', async () => {
    const hugeUsed = '9007199254740995'; // > Number.MAX_SAFE_INTEGER (9007199254740991)
    const hugeLimit = '9007199254740999';
    const hugeRemaining = '4';
    const hugeDailyRequests = '9007199254740995';
    const hugeDailySuccess = '9007199254740990';
    const hugeDailyErrors = '5';

    vi.spyOn(usageApi, 'getConsumerUsageSummary').mockResolvedValueOnce({
      subscriptions: [
        {
          id: 'sub_huge_01',
          apiId: 'enterprise-data-pipeline',
          status: 'Active',
          quotaUsed: hugeUsed,
          quotaLimit: hugeLimit,
          remainingRequests: hugeRemaining,
          periodStart: '2026-11-01T00:00:00Z',
          periodEnd: '2026-11-30T23:59:59Z',
        },
      ],
      daily: [
        {
          date: '2026-11-01',
          requestCount: hugeDailyRequests,
          successCount: hugeDailySuccess,
          errorCount: hugeDailyErrors,
        },
      ],
    });

    render(
      <MemoryRouter>
        <UsageQuotaPage />
      </MemoryRouter>
    );

    expect(await screen.findByTestId('usage-content')).toBeDefined();
    const formattedUsed = (9007199254740995n).toLocaleString('vi-VN');
    const formattedLimit = (9007199254740999n).toLocaleString('vi-VN');
    expect(screen.getAllByText(new RegExp(formattedUsed)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(new RegExp(formattedLimit)).length).toBeGreaterThan(0);
  });

  // 5. Quota exhausted state when used >= limit
  it('displays prominent Quota Exhausted alert when quotaUsed >= quotaLimit for Active subscription', async () => {
    vi.spyOn(usageApi, 'getConsumerUsageSummary').mockResolvedValueOnce({
      subscriptions: [
        {
          id: 'sub_exhausted_01',
          apiId: 'analytics-api',
          status: 'Active',
          quotaUsed: '50000',
          quotaLimit: '50000',
          remainingRequests: '0',
          periodStart: '2026-11-01T00:00:00Z',
          periodEnd: '2026-11-30T23:59:59Z',
        },
      ],
      daily: [],
    });

    render(
      <MemoryRouter>
        <UsageQuotaPage />
      </MemoryRouter>
    );

    expect(await screen.findByTestId('quota-exhausted-sub_exhausted_01')).toBeDefined();
    expect(screen.getByText(/Hạn ngạch đã cạn \(Quota Exhausted\)/)).toBeDefined();
  });

  // 6. Status badges for all subscription statuses
  it('renders status badges for all subscription statuses', async () => {
    const statuses: Array<
      'Active' | 'Pending' | 'Past Due' | 'Suspended' | 'Canceled' | 'Expired'
    > = ['Active', 'Pending', 'Past Due', 'Suspended', 'Canceled', 'Expired'];

    vi.spyOn(usageApi, 'getConsumerUsageSummary').mockResolvedValueOnce({
      subscriptions: statuses.map((st, idx) => ({
        id: `sub_status_${idx}`,
        apiId: `api_${st.toLowerCase().replace(' ', '_')}`,
        status: st,
        quotaUsed: '100',
        quotaLimit: '1000',
        remainingRequests: '900',
        periodStart: '2026-11-01T00:00:00Z',
        periodEnd: '2026-11-30T23:59:59Z',
      })),
      daily: [],
    });

    render(
      <MemoryRouter>
        <UsageQuotaPage />
      </MemoryRouter>
    );

    expect(await screen.findByTestId('usage-content')).toBeDefined();
    expect(screen.getByTestId('status-badge-active')).toBeDefined();
    expect(screen.getByTestId('status-badge-pending')).toBeDefined();
    expect(screen.getByTestId('status-badge-past-due')).toBeDefined();
    expect(screen.getByTestId('status-badge-suspended')).toBeDefined();
    expect(screen.getByTestId('status-badge-canceled')).toBeDefined();
    expect(screen.getByTestId('status-badge-expired')).toBeDefined();
  });

  // 7. Date filtering and max 365 days validation
  it('validates date range with max 365 days and blocks invalid queries', async () => {
    const summarySpy = vi
      .spyOn(usageApi, 'getConsumerUsageSummary')
      .mockResolvedValue({
        subscriptions: [],
        daily: [],
      });

    render(
      <MemoryRouter>
        <UsageQuotaPage />
      </MemoryRouter>
    );

    await screen.findByTestId('usage-empty');
    summarySpy.mockClear();

    const fromInput = screen.getByTestId('filter-from-date');
    const toInput = screen.getByTestId('filter-to-date');

    // Input range > 365 days (2026-01-01 to 2027-01-05 = 369 days)
    fireEvent.change(fromInput, { target: { value: '2026-01-01' } });
    fireEvent.change(toInput, { target: { value: '2027-01-05' } });

    expect(await screen.findByTestId('filter-date-error')).toBeDefined();
    expect(screen.getByText(/365 ngày/)).toBeDefined();

    // Verify API is NOT called with invalid range
    expect(summarySpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ from: '2026-01-01', to: '2027-01-05' }),
      expect.anything()
    );

    // Correct to valid range
    fireEvent.change(toInput, { target: { value: '2026-06-01' } });

    await waitFor(() => {
      expect(screen.queryByTestId('filter-date-error')).toBeNull();
    });

    await waitFor(() => {
      expect(summarySpy).toHaveBeenCalledWith(
        expect.objectContaining({ from: '2026-01-01', to: '2026-06-01' }),
        expect.anything()
      );
    });
  });

  // 8. API filter query parameter
  it('supports API filter via URL search params and user input', async () => {
    const summarySpy = vi
      .spyOn(usageApi, 'getConsumerUsageSummary')
      .mockResolvedValue({
        subscriptions: [],
        daily: [],
      });

    render(
      <MemoryRouter initialEntries={['/dashboard/usage?apiId=finance_api']}>
        <UsageQuotaPage />
      </MemoryRouter>
    );

    expect(summarySpy).toHaveBeenCalledWith(
      expect.objectContaining({ apiId: 'finance_api' }),
      expect.anything()
    );

    const apiInput = screen.getByTestId('filter-api-id') as HTMLInputElement;
    expect(apiInput.value).toBe('finance_api');

    fireEvent.change(apiInput, { target: { value: 'logistics_api' } });

    await waitFor(() => {
      expect(summarySpy).toHaveBeenCalledWith(
        expect.objectContaining({ apiId: 'logistics_api' }),
        expect.anything()
      );
    });
  });

  // 9. Network error and retry button
  it('handles network error and allows retrying via "Thử lại" button', async () => {
    let callCount = 0;
    vi.spyOn(usageApi, 'getConsumerUsageSummary').mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        throw new ApiError(500, 'FAIL', 'Internal Server Error');
      }
      return {
        subscriptions: [],
        daily: [],
      };
    });

    render(
      <MemoryRouter>
        <UsageQuotaPage />
      </MemoryRouter>
    );

    expect(await screen.findByTestId('usage-error')).toBeDefined();
    expect(screen.getByText(/Lỗi máy chủ \(500\)/)).toBeDefined();

    const retryBtn = screen.getByTestId('usage-retry-btn');
    fireEvent.click(retryBtn);

    expect(await screen.findByTestId('usage-empty')).toBeDefined();
    expect(screen.queryByTestId('usage-error')).toBeNull();
  });

  // 10. AbortSignal cancellation on unmount
  it('aborts in-flight request on unmount', () => {
    let capturedSignal: AbortSignal | undefined;
    vi.spyOn(usageApi, 'getConsumerUsageSummary').mockImplementation(
      (_params, signal) => {
        capturedSignal = signal;
        return new Promise(() => {});
      }
    );

    const { unmount } = render(
      <MemoryRouter>
        <UsageQuotaPage />
      </MemoryRouter>
    );

    expect(capturedSignal).toBeDefined();
    expect(capturedSignal?.aborted).toBe(false);

    unmount();

    expect(capturedSignal?.aborted).toBe(true);
  });

  // 11. Period expired alert
  it('displays period expired notice when periodEnd date is in the past', async () => {
    vi.spyOn(usageApi, 'getConsumerUsageSummary').mockResolvedValueOnce({
      subscriptions: [
        {
          id: 'sub_expired_01',
          apiId: 'legacy_api',
          status: 'Expired',
          quotaUsed: '500',
          quotaLimit: '1000',
          remainingRequests: '500',
          periodStart: '2025-01-01T00:00:00Z',
          periodEnd: '2025-01-31T23:59:59Z',
        },
      ],
      daily: [],
    });

    render(
      <MemoryRouter>
        <UsageQuotaPage />
      </MemoryRouter>
    );

    expect(
      await screen.findByTestId('period-expired-sub_expired_01')
    ).toBeDefined();
    expect(
      screen.getByText(/Kỳ hạn ngạch đã kết thúc \(Period Expired\)/)
    ).toBeDefined();
  });

  // 12. 401 Unauthorized handling
  it('handles 401 Unauthorized with clear re-login guidance', async () => {
    vi.spyOn(usageApi, 'getConsumerUsageSummary').mockRejectedValueOnce(
      new ApiError(401, 'UNAUTHORIZED', 'Invalid token')
    );

    render(
      <MemoryRouter>
        <UsageQuotaPage />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/Phiên đăng nhập đã hết hạn/)
    ).toBeDefined();
  });

  // Unit tests for pure helper functions
  describe('Helper functions', () => {
    it('calculateQuotaProgress calculates safe integer percentages capped at 100', () => {
      expect(calculateQuotaProgress('0', '100')).toBe(0);
      expect(calculateQuotaProgress('50', '100')).toBe(50);
      expect(calculateQuotaProgress('100', '100')).toBe(100);
      expect(calculateQuotaProgress('150', '100')).toBe(100);
      expect(calculateQuotaProgress('0', '0')).toBe(0);
      expect(
        calculateQuotaProgress(
          '9007199254740992',
          '9007199254740992'
        )
      ).toBe(100);
    });

    it('validateDateRange properly checks bounds and 365 days limit', () => {
      expect(validateDateRange()).toBeNull();
      expect(validateDateRange('2026-05-10', '2026-05-01')).toContain(
        'Ngày bắt đầu không được lớn hơn ngày kết thúc'
      );
      expect(validateDateRange('2026-01-01', '2027-01-05')).toContain(
        '365 ngày'
      );
      expect(validateDateRange('2026-01-01', '2026-06-01')).toBeNull();
    });

    it('formatDate formats ISO dates gracefully and handles null/invalid safely', () => {
      expect(formatDate(null)).toBe('-');
      expect(formatDate(undefined)).toBe('-');
      expect(formatDate('invalid-date')).toBe('invalid-date');
      expect(formatDate('2026-11-04T00:00:00Z')).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it('mapUsageError returns descriptive Vietnamese errors for HTTP codes', () => {
      expect(mapUsageError(new ApiError(401, 'ERR', 'msg'))).toContain(
        'Phiên đăng nhập đã hết hạn'
      );
      expect(mapUsageError(new ApiError(403, 'ERR', 'msg'))).toContain(
        'không có quyền'
      );
      expect(mapUsageError(new ApiError(500, 'ERR', 'msg'))).toContain(
        'Lỗi máy chủ (500)'
      );
      expect(mapUsageError(new Error('Network offline'))).toBe('Network offline');
    });
  });
});
