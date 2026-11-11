import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getConsumerUsageSummary,
  getConsumerUsageHistory,
  getProviderAnalyticsOverview,
  buildUsageQueryString,
} from './usageApi';
import type {
  UsageSummaryResponse,
  UsageHistoryResponse,
  ProviderAnalyticsOverview,
} from './sprint4Types';
import * as authApiModule from './authApi';
import { ApiError } from './authApi';

const mockUsageSummary: UsageSummaryResponse = {
  subscriptions: [
    {
      id: '101',
      apiId: '1',
      status: 'Active',
      quotaUsed: '250',
      quotaLimit: '1000',
      remainingRequests: '750',
      periodStart: '2026-11-01T00:00:00.000Z',
      periodEnd: '2026-12-01T00:00:00.000Z',
    },
  ],
  daily: [
    {
      date: '2026-11-04',
      requestCount: '150',
      successCount: '145',
      errorCount: '5',
    },
  ],
};

const mockUsageHistory: UsageHistoryResponse = {
  items: [
    {
      id: '999',
      requestId: 'req-abc-123',
      occurredAt: '2026-11-04T10:15:30.000Z',
      apiId: '1',
      apiName: 'Weather Forecast API',
      method: 'GET',
      path: '/v1/forecast',
      statusCode: 200,
      errorCode: null,
      latencyMs: 42,
    },
    {
      id: '998',
      requestId: 'req-abc-122',
      occurredAt: '2026-11-04T10:14:00.000Z',
      apiId: '1',
      apiName: 'Weather Forecast API',
      method: 'POST',
      path: '/v1/alerts',
      statusCode: 429,
      errorCode: 'RATE_LIMITED',
      latencyMs: 12,
    },
  ],
  total: 2,
  page: 1,
  pageSize: 20,
};

const mockProviderOverview: ProviderAnalyticsOverview = {
  requests: {
    requestCount: '5000',
    successCount: '4950',
    errorCount: '50',
    averageLatencyMs: 38.5,
  },
  daily: [
    {
      date: '2026-11-03',
      requestCount: '2400',
    },
    {
      date: '2026-11-04',
      requestCount: '2600',
    },
  ],
  revenue: [
    {
      currency: 'VND',
      amount: '15000000.00',
    },
    {
      currency: 'USD',
      amount: '250.00',
    },
  ],
  activeSubscribers: '42',
};

describe('usageApi service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('buildUsageQueryString', () => {
    it('returns empty string when no params provided or empty object', () => {
      expect(buildUsageQueryString()).toBe('');
      expect(buildUsageQueryString({})).toBe('');
    });

    it('serializes all supported query parameters correctly including endpointId', () => {
      const qs = buildUsageQueryString({
        page: 2,
        pageSize: 50,
        apiId: '10',
        endpointId: '12',
        status: 200,
        from: '2026-10-01',
        to: '2026-10-31',
      });

      expect(qs).toBe(
        '?page=2&pageSize=50&apiId=10&endpointId=12&status=200&from=2026-10-01&to=2026-10-31'
      );
    });

    it('clamps page and pageSize within allowed backend boundaries', () => {
      const qs = buildUsageQueryString({
        page: 50000,
        pageSize: 500,
      });

      expect(qs).toBe('?page=10000&pageSize=100');
    });

    it('ignores empty or null string values for apiId, from, and to', () => {
      const qs = buildUsageQueryString({
        apiId: '   ',
        from: '',
        to: '2026-11-04',
      });

      expect(qs).toBe('?to=2026-11-04');
    });
  });

  describe('getConsumerUsageSummary', () => {
    it('fetches consumer usage summary without query params and unwraps data', async () => {
      const spy = vi
        .spyOn(authApiModule, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: mockUsageSummary });

      const result = await getConsumerUsageSummary();

      expect(spy).toHaveBeenCalledWith('/api/consumer/usage/summary', {
        method: 'GET',
        signal: undefined,
      });
      expect(result).toEqual(mockUsageSummary);
    });

    it('fetches consumer usage summary with date range and apiId filter', async () => {
      const spy = vi
        .spyOn(authApiModule, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: mockUsageSummary });

      const result = await getConsumerUsageSummary({
        apiId: '1',
        from: '2026-11-01',
        to: '2026-11-04',
      });

      expect(spy).toHaveBeenCalledWith(
        '/api/consumer/usage/summary?apiId=1&from=2026-11-01&to=2026-11-04',
        {
          method: 'GET',
          signal: undefined,
        }
      );
      expect(result).toEqual(mockUsageSummary);
    });

    it('passes abort signal when provided', async () => {
      const controller = new AbortController();
      const spy = vi
        .spyOn(authApiModule, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: mockUsageSummary });

      await getConsumerUsageSummary(undefined, controller.signal);

      expect(spy).toHaveBeenCalledWith(
        '/api/consumer/usage/summary',
        expect.objectContaining({ signal: controller.signal })
      );
    });
  });

  describe('getConsumerUsageHistory', () => {
    it('fetches consumer usage history with pagination and status filter', async () => {
      const spy = vi
        .spyOn(authApiModule, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: mockUsageHistory });

      const result = await getConsumerUsageHistory({
        page: 1,
        pageSize: 20,
        status: 200,
      });

      expect(spy).toHaveBeenCalledWith(
        '/api/consumer/usage/history?page=1&pageSize=20&status=200',
        {
          method: 'GET',
          signal: undefined,
        }
      );
      expect(result).toEqual(mockUsageHistory);
    });
  });

  describe('getProviderAnalyticsOverview', () => {
    it('fetches provider analytics overview and unwraps data', async () => {
      const spy = vi
        .spyOn(authApiModule, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: mockProviderOverview });

      const result = await getProviderAnalyticsOverview({
        apiId: '1',
        from: '2026-10-01',
        to: '2026-11-04',
      });

      expect(spy).toHaveBeenCalledWith(
        '/api/provider/analytics/overview?apiId=1&from=2026-10-01&to=2026-11-04',
        {
          method: 'GET',
          signal: undefined,
        }
      );
      expect(result).toEqual(mockProviderOverview);
    });
  });

  describe('Error handling across HTTP status codes', () => {
    const errorCases = [
      { status: 400, code: 'VALIDATION_ERROR', message: 'Bộ lọc không hợp lệ' },
      { status: 401, code: 'UNAUTHORIZED', message: 'Bạn chưa đăng nhập' },
      { status: 403, code: 'FORBIDDEN', message: 'Yêu cầu vai trò Provider' },
      { status: 404, code: 'NOT_FOUND', message: 'Không tìm thấy tài nguyên' },
      { status: 409, code: 'INVALID_STATE', message: 'Xung đột trạng thái' },
      { status: 429, code: 'RATE_LIMITED', message: 'Vượt quá giới hạn gọi API' },
      { status: 503, code: 'METERING_UNAVAILABLE', message: 'Metering gặp sự cố' },
    ];

    for (const testCase of errorCases) {
      it(`propagates ApiError for HTTP ${testCase.status} (${testCase.code})`, async () => {
        vi.spyOn(authApiModule, 'authenticatedRequest').mockRejectedValueOnce(
          new ApiError(testCase.status, testCase.code, testCase.message)
        );

        await expect(getConsumerUsageSummary()).rejects.toMatchObject({
          status: testCase.status,
          code: testCase.code,
        });
      });
    }

    it('propagates abort error when signal is aborted', async () => {
      const controller = new AbortController();
      controller.abort();

      vi.spyOn(authApiModule, 'authenticatedRequest').mockRejectedValueOnce(
        new ApiError(0, 'ABORTED', 'Yêu cầu đã bị hủy.')
      );

      await expect(
        getProviderAnalyticsOverview(undefined, controller.signal)
      ).rejects.toMatchObject({
        code: 'ABORTED',
      });
    });
  });
});
