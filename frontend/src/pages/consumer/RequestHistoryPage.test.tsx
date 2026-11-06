import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  RequestHistoryPage,
  formatOccurredAt,
  getStatusCodeBadgeClass,
  validateDateRange,
  mapRequestHistoryError,
} from './RequestHistoryPage';
import * as usageApi from '../../services/usageApi';
import type { UsageHistoryItem, UsageHistoryResponse } from '../../services/sprint4Types';
import { ApiError } from '../../services/authApi';

vi.mock('../../i18n', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

function createMockItem(overrides?: Partial<UsageHistoryItem>): UsageHistoryItem {
  return {
    id: 'log-101',
    requestId: 'req-001-abcdef123456',
    occurredAt: '2026-11-04T10:15:30.000Z',
    apiId: 'api_weather_v1',
    apiName: 'Weather Forecast API',
    method: 'GET',
    path: '/api/v1/forecast?city=Hanoi',
    statusCode: 200,
    errorCode: null,
    latencyMs: 45,
    ...overrides,
  };
}

function createMockResponse(
  overrides?: Partial<UsageHistoryResponse>
): UsageHistoryResponse {
  return {
    items: [createMockItem()],
    total: 1,
    page: 1,
    pageSize: 20,
    ...overrides,
  };
}

describe('RequestHistoryPage Component & Pure Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Pure helper functions', () => {
    describe('formatOccurredAt', () => {
      it('returns hyphen for null or undefined or empty', () => {
        expect(formatOccurredAt(null)).toBe('-');
        expect(formatOccurredAt(undefined)).toBe('-');
        expect(formatOccurredAt('')).toBe('-');
      });

      it('safely handles valid ISO date string', () => {
        const res = formatOccurredAt('2026-11-04T10:15:30.000Z');
        expect(res).not.toBe('-');
        expect(res).toContain('2026');
      });

      it('returns raw string when date parsing fails', () => {
        expect(formatOccurredAt('invalid-date-string')).toBe('invalid-date-string');
      });
    });

    describe('getStatusCodeBadgeClass', () => {
      it('returns emerald color classes for 2xx responses', () => {
        expect(getStatusCodeBadgeClass(200)).toContain('emerald');
        expect(getStatusCodeBadgeClass(201)).toContain('emerald');
        expect(getStatusCodeBadgeClass(204)).toContain('emerald');
      });

      it('returns amber color classes for 4xx client errors', () => {
        expect(getStatusCodeBadgeClass(400)).toContain('amber');
        expect(getStatusCodeBadgeClass(401)).toContain('amber');
        expect(getStatusCodeBadgeClass(403)).toContain('amber');
        expect(getStatusCodeBadgeClass(404)).toContain('amber');
        expect(getStatusCodeBadgeClass(429)).toContain('amber');
      });

      it('returns rose color classes for 5xx server errors', () => {
        expect(getStatusCodeBadgeClass(500)).toContain('rose');
        expect(getStatusCodeBadgeClass(502)).toContain('rose');
        expect(getStatusCodeBadgeClass(503)).toContain('rose');
      });

      it('returns neutral classes for other status codes', () => {
        expect(getStatusCodeBadgeClass(302)).toContain('surface-container-high');
      });
    });

    describe('validateDateRange', () => {
      it('returns null when from or to is omitted', () => {
        expect(validateDateRange()).toBeNull();
        expect(validateDateRange('2026-10-01', '')).toBeNull();
        expect(validateDateRange('', '2026-10-31')).toBeNull();
      });

      it('returns error when date format is invalid', () => {
        expect(validateDateRange('invalid', '2026-10-31')).toBe(
          'Định dạng ngày không hợp lệ.'
        );
      });

      it('returns error when from date is after to date', () => {
        expect(validateDateRange('2026-11-10', '2026-11-01')).toBe(
          'Ngày bắt đầu không được sau ngày kết thúc.'
        );
      });

      it('returns error when range exceeds 365 days', () => {
        expect(validateDateRange('2024-01-01', '2026-01-01')).toBe(
          'Khoảng thời gian không được vượt quá 365 ngày.'
        );
      });

      it('returns null when valid range within 365 days', () => {
        expect(validateDateRange('2026-10-01', '2026-11-04')).toBeNull();
      });
    });

    describe('mapRequestHistoryError', () => {
      it('maps 401 UNAUTHORIZED correctly', () => {
        const err = new ApiError(401, 'UNAUTHORIZED', 'Invalid credentials');
        expect(mapRequestHistoryError(err)).toContain('Phiên đăng nhập đã hết hạn');
      });

      it('maps 403 FORBIDDEN correctly', () => {
        const err = new ApiError(403, 'FORBIDDEN', 'Access denied');
        expect(mapRequestHistoryError(err)).toContain('Bạn không có quyền truy cập');
      });

      it('maps 429 RATE_LIMITED correctly', () => {
        const err = new ApiError(429, 'RATE_LIMITED', 'Rate limit exceeded');
        expect(mapRequestHistoryError(err)).toContain('Bạn đã gửi quá nhiều yêu cầu');
      });

      it('maps 500 server error correctly', () => {
        const err = new ApiError(500, 'INTERNAL_SERVER_ERROR', 'DB down');
        expect(mapRequestHistoryError(err)).toContain(
          'Hệ thống đo lường hoặc máy chủ đang gặp sự cố'
        );
      });

      it('returns empty string on AbortError', () => {
        const abortErr = new Error('The operation was aborted');
        abortErr.name = 'AbortError';
        expect(mapRequestHistoryError(abortErr)).toBe('');
      });

      it('returns generic message for non-ApiError fallback', () => {
        expect(mapRequestHistoryError('Some strange error')).toBe(
          'Không thể tải lịch sử yêu cầu API. Vui lòng thử lại.'
        );
      });
    });
  });

  describe('UI State Rendering', () => {
    it('renders loading skeleton while data fetching is in-flight', () => {
      vi.spyOn(usageApi, 'getConsumerUsageHistory').mockImplementation(
        () => new Promise(() => {}) // never resolves
      );

      render(
        <MemoryRouter>
          <RequestHistoryPage />
        </MemoryRouter>
      );

      const skeleton = screen.getByTestId('history-loading');
      expect(skeleton).toBeDefined();
      expect(skeleton.getAttribute('aria-busy')).toBe('true');
    });

    it('renders distinct empty state when response total is 0', async () => {
      vi.spyOn(usageApi, 'getConsumerUsageHistory').mockResolvedValueOnce({
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
      });

      render(
        <MemoryRouter>
          <RequestHistoryPage />
        </MemoryRouter>
      );

      expect(await screen.findByTestId('history-empty')).toBeDefined();
      expect(screen.queryByTestId('history-table')).toBeNull();
      expect(screen.queryByTestId('history-error')).toBeNull();
      expect(screen.getByText('Không tìm thấy nhật ký yêu cầu nào')).toBeDefined();
    });

    it('renders error state with retry action when API request fails', async () => {
      let callCount = 0;
      vi.spyOn(usageApi, 'getConsumerUsageHistory').mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          throw new ApiError(500, 'INTERNAL_ERROR', 'Database failure');
        }
        return createMockResponse();
      });

      render(
        <MemoryRouter>
          <RequestHistoryPage />
        </MemoryRouter>
      );

      // Verify error state
      expect(await screen.findByTestId('history-error')).toBeDefined();
      expect(
        screen.getByText(/Hệ thống đo lường hoặc máy chủ đang gặp sự cố/)
      ).toBeDefined();
      expect(screen.queryByTestId('history-table')).toBeNull();

      // Click retry
      const retryBtn = screen.getByRole('button', { name: /Thử lại/i });
      fireEvent.click(retryBtn);

      // Should succeed and show table
      expect(await screen.findByTestId('history-table')).toBeDefined();
      expect(screen.queryByTestId('history-error')).toBeNull();
      expect(callCount).toBe(2);
    });

    it('renders success table with correct columns and data fields from UsageHistoryItem', async () => {
      const mockItems: UsageHistoryItem[] = [
        createMockItem({
          id: 'log-1',
          requestId: 'req-001-weather',
          apiName: 'Weather Forecast API',
          apiId: 'api_weather_v1',
          method: 'GET',
          path: '/v1/forecast?city=Hanoi',
          statusCode: 200,
          errorCode: null,
          latencyMs: 42,
          occurredAt: '2026-11-04T10:15:30.000Z',
        }),
        createMockItem({
          id: 'log-2',
          requestId: 'req-002-alert',
          apiName: 'Weather Forecast API',
          apiId: 'api_weather_v1',
          method: 'POST',
          path: '/v1/alerts',
          statusCode: 429,
          errorCode: 'RATE_LIMITED',
          latencyMs: 14,
          occurredAt: '2026-11-04T10:14:00.000Z',
        }),
      ];

      vi.spyOn(usageApi, 'getConsumerUsageHistory').mockResolvedValueOnce({
        items: mockItems,
        total: 2,
        page: 1,
        pageSize: 20,
      });

      render(
        <MemoryRouter>
          <RequestHistoryPage />
        </MemoryRouter>
      );

      expect(await screen.findByTestId('history-table')).toBeDefined();

      // Check rows rendered
      expect(screen.getByTestId('history-row-log-1')).toBeDefined();
      expect(screen.getByTestId('history-row-log-2')).toBeDefined();

      // Check fields
      expect(screen.getAllByText('Weather Forecast API').length).toBeGreaterThan(0);
      expect(screen.getByText('42 ms')).toBeDefined();
      expect(screen.getByText('14 ms')).toBeDefined();
      expect(screen.getByText('200')).toBeDefined();
      expect(screen.getByText('429')).toBeDefined();
      expect(screen.getByText('RATE_LIMITED')).toBeDefined();
      expect(screen.getByText('/v1/alerts')).toBeDefined();
    });

    it('handles copy request ID action safely', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      vi.spyOn(usageApi, 'getConsumerUsageHistory').mockResolvedValueOnce(
        createMockResponse()
      );

      render(
        <MemoryRouter>
          <RequestHistoryPage />
        </MemoryRouter>
      );

      await screen.findByTestId('history-table');

      const copyBtn = screen.getByRole('button', {
        name: /Sao chép req-001-abcdef123456/i,
      });
      fireEvent.click(copyBtn);

      expect(writeTextMock).toHaveBeenCalledWith('req-001-abcdef123456');
    });
  });

  describe('Pagination navigation', () => {
    it('handles next and previous navigation with server-side pagination params', async () => {
      const fetchSpy = vi
        .spyOn(usageApi, 'getConsumerUsageHistory')
        .mockResolvedValueOnce(
          createMockResponse({
            total: 45,
            page: 1,
            pageSize: 20,
          })
        )
        .mockResolvedValueOnce(
          createMockResponse({
            total: 45,
            page: 2,
            pageSize: 20,
          })
        )
        .mockResolvedValueOnce(
          createMockResponse({
            total: 45,
            page: 1,
            pageSize: 20,
          })
        );

      render(
        <MemoryRouter>
          <RequestHistoryPage />
        </MemoryRouter>
      );

      await screen.findByTestId('history-table');

      expect(screen.getByText(/Trang 1 \/ 3/)).toBeDefined();

      const nextBtn = screen.getByRole('button', { name: /Trang sau/i });
      expect((nextBtn as HTMLButtonElement).disabled).toBe(false);

      // Click next page
      fireEvent.click(nextBtn);

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2, pageSize: 20 }),
          expect.anything()
        );
      });

      expect(await screen.findByText(/Trang 2 \/ 3/)).toBeDefined();

      // Click previous page
      const prevBtn = screen.getByRole('button', { name: /Trang trước/i });
      expect((prevBtn as HTMLButtonElement).disabled).toBe(false);

      fireEvent.click(prevBtn);

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1, pageSize: 20 }),
          expect.anything()
        );
      });
    });
  });

  describe('Filtering triggers', () => {
    it('triggers API call with status param when status dropdown changes', async () => {
      const fetchSpy = vi
        .spyOn(usageApi, 'getConsumerUsageHistory')
        .mockResolvedValue(createMockResponse());

      render(
        <MemoryRouter>
          <RequestHistoryPage />
        </MemoryRouter>
      );

      await screen.findByTestId('history-table');

      const statusSelect = screen.getByTestId('status-filter');

      // Filter by 429
      fireEvent.change(statusSelect, { target: { value: '429' } });

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenLastCalledWith(
          expect.objectContaining({ status: 429, page: 1 }),
          expect.anything()
        );
      });

      // Filter by 200
      fireEvent.change(statusSelect, { target: { value: '200' } });

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenLastCalledWith(
          expect.objectContaining({ status: 200, page: 1 }),
          expect.anything()
        );
      });

      // Reset to all
      fireEvent.change(statusSelect, { target: { value: 'all' } });

      await waitFor(() => {
        const lastCallParams = fetchSpy.mock.calls[fetchSpy.mock.calls.length - 1][0];
        expect(lastCallParams?.status).toBeUndefined();
      });
    });

    it('triggers API call with apiId and date range parameters', async () => {
      const fetchSpy = vi
        .spyOn(usageApi, 'getConsumerUsageHistory')
        .mockResolvedValue(createMockResponse());

      render(
        <MemoryRouter>
          <RequestHistoryPage />
        </MemoryRouter>
      );

      await screen.findByTestId('history-table');

      // Change API ID
      const apiInput = screen.getByTestId('filter-api-id');
      fireEvent.change(apiInput, { target: { value: '108' } });

      // Change dates
      const fromInput = screen.getByTestId('filter-date-from');
      fireEvent.change(fromInput, { target: { value: '2026-10-01' } });

      const toInput = screen.getByTestId('filter-date-to');
      fireEvent.change(toInput, { target: { value: '2026-10-31' } });

      // Submit filter
      const submitBtn = screen.getByRole('button', { name: /Áp dụng bộ lọc/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenLastCalledWith(
          expect.objectContaining({
            apiId: '108',
            from: '2026-10-01',
            to: '2026-10-31',
          }),
          expect.anything()
        );
      });

      // Reset filters button
      const resetBtn = screen.getByRole('button', { name: /Đặt lại/i });
      fireEvent.click(resetBtn);

      await waitFor(() => {
        const lastCallParams = fetchSpy.mock.calls[fetchSpy.mock.calls.length - 1][0];
        expect(lastCallParams?.apiId).toBeUndefined();
        expect(lastCallParams?.from).toBeUndefined();
        expect(lastCallParams?.to).toBeUndefined();
      });
    });

    it('displays error and prevents API call when date range is inverted', async () => {
      const fetchSpy = vi
        .spyOn(usageApi, 'getConsumerUsageHistory')
        .mockResolvedValue(createMockResponse());

      render(
        <MemoryRouter>
          <RequestHistoryPage />
        </MemoryRouter>
      );

      await screen.findByTestId('history-table');
      const initialCalls = fetchSpy.mock.calls.length;

      // Inverted date range
      const fromInput = screen.getByTestId('filter-date-from');
      fireEvent.change(fromInput, { target: { value: '2026-11-20' } });

      const toInput = screen.getByTestId('filter-date-to');
      fireEvent.change(toInput, { target: { value: '2026-11-01' } });

      // Submit filter
      const submitBtn = screen.getByRole('button', { name: /Áp dụng bộ lọc/i });
      fireEvent.click(submitBtn);

      expect(
        screen.getByText('Ngày bắt đầu không được sau ngày kết thúc.')
      ).toBeDefined();

      // No new API fetch triggered while range error exists
      expect(fetchSpy.mock.calls.length).toBe(initialCalls);
    });

    it('blocks a non-numeric API id and does not send it to history', async () => {
      const fetchSpy = vi
        .spyOn(usageApi, 'getConsumerUsageHistory')
        .mockResolvedValue(createMockResponse());

      render(
        <MemoryRouter>
          <RequestHistoryPage />
        </MemoryRouter>
      );

      await screen.findByTestId('history-table');
      const initialCalls = fetchSpy.mock.calls.length;

      fireEvent.change(screen.getByTestId('filter-api-id'), {
        target: { value: 'api_custom_payment' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Áp dụng bộ lọc/i }));

      expect(screen.getByTestId('filter-api-error').textContent).toContain('2147483647');
      expect(fetchSpy.mock.calls.length).toBe(initialCalls);
    });
  });

  describe('Sanitized Detail Modal & Security Invariants', () => {
    it('opens modal on inspect button click and displays ONLY redacted metadata', async () => {
      const sampleItem = createMockItem({
        id: 'log-secret-check',
        requestId: 'req-uuid-999-secure',
        apiName: 'Billing Service API',
        apiId: 'api_billing_v2',
        method: 'POST',
        path: '/api/v2/subscriptions/checkout',
        statusCode: 429,
        errorCode: 'RATE_LIMITED',
        latencyMs: 88,
        occurredAt: '2026-11-04T12:00:00.000Z',
      });

      vi.spyOn(usageApi, 'getConsumerUsageHistory').mockResolvedValueOnce({
        items: [sampleItem],
        total: 1,
        page: 1,
        pageSize: 20,
      });

      render(
        <MemoryRouter>
          <RequestHistoryPage />
        </MemoryRouter>
      );

      await screen.findByTestId('history-table');

      // Click "Chi tiết"
      const inspectBtn = screen.getByRole('button', { name: /Chi tiết/i });
      fireEvent.click(inspectBtn);

      // Verify modal presence
      const modal = await screen.findByTestId('request-detail-modal');
      expect(modal).toBeDefined();

      // Verify sanitized fields
      expect(screen.getByTestId('modal-request-id').textContent).toBe(
        'req-uuid-999-secure'
      );
      expect(screen.getByTestId('modal-api-name').textContent).toContain(
        'Billing Service API'
      );
      expect(screen.getByTestId('modal-method-path').textContent).toContain(
        '/api/v2/subscriptions/checkout'
      );
      expect(screen.getByTestId('modal-status-code').textContent).toBe('429');
      expect(screen.getByTestId('modal-error-code').textContent).toBe('RATE_LIMITED');
      expect(screen.getByTestId('modal-latency').textContent).toBe('88 ms');

      // STRICT SECURITY INVARIANTS:
      // Verify NO credentials, auth tokens, bodies, or API keys are leaked in DOM
      const modalHtml = modal.innerHTML;
      expect(modalHtml).not.toContain('Bearer eyJ');
      expect(modalHtml).not.toContain('sk_live_');
      expect(modalHtml).not.toContain('apiKey');
      expect(modalHtml).not.toContain('paymentToken');
      expect(modalHtml).not.toContain('requestBody');
      expect(modalHtml).not.toContain('responseBody');
      expect(modalHtml).not.toContain('Cookie:');
    });
  });

  describe('AbortSignal & Race Condition Protections', () => {
    it('aborts previous request when component unmounts', async () => {
      let capturedSignal: AbortSignal | undefined;

      vi.spyOn(usageApi, 'getConsumerUsageHistory').mockImplementation(
        (_params, signal) => {
          capturedSignal = signal;
          return new Promise(() => {}); // never resolves
        }
      );

      const { unmount } = render(
        <MemoryRouter>
          <RequestHistoryPage />
        </MemoryRouter>
      );

      expect(capturedSignal).toBeDefined();
      expect(capturedSignal?.aborted).toBe(false);

      unmount();

      expect(capturedSignal?.aborted).toBe(true);
    });

    it('ignores stale responses from superseded filter/page changes (race protection)', async () => {
      let resolveFirst: (val: any) => void = () => {};
      let resolveSecond: (val: any) => void = () => {};

      const firstPromise = new Promise((resolve) => {
        resolveFirst = resolve;
      });
      const secondPromise = new Promise((resolve) => {
        resolveSecond = resolve;
      });

      let callIdx = 0;
      vi.spyOn(usageApi, 'getConsumerUsageHistory').mockImplementation(async () => {
        callIdx++;
        if (callIdx === 1) {
          return firstPromise as any;
        }
        return secondPromise as any;
      });

      render(
        <MemoryRouter>
          <RequestHistoryPage />
        </MemoryRouter>
      );

      // Trigger second fetch by changing status filter
      const statusSelect = screen.getByTestId('status-filter');
      fireEvent.change(statusSelect, { target: { value: '429' } });

      // Second request resolves FIRST with 429 item
      resolveSecond(
        createMockResponse({
          items: [createMockItem({ id: 'item-new', statusCode: 429 })],
          total: 1,
        })
      );

      expect(await screen.findByText('429')).toBeDefined();

      // First request resolves LATER with stale 200 item
      resolveFirst(
        createMockResponse({
          items: [createMockItem({ id: 'item-stale', statusCode: 200 })],
          total: 1,
        })
      );

      // Verify that stale 200 did NOT overwrite current 429
      await waitFor(() => {
        expect(screen.getByText('429')).toBeDefined();
        expect(screen.queryByTestId('history-row-item-stale')).toBeNull();
      });
    });
  });
});
