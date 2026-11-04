import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  subscribePlan,
  listSubscriptions,
  getSubscription,
  cancelSubscription,
  checkoutSubscription,
  changeSubscriptionPlan,
  confirmPayment,
  generateIdempotencyKey,
  generateEventId,
} from './billingApi';
import {
  formatCurrencyAmount,
  formatBigIntCount,
  parseSafeBigInt,
  isZeroAmount,
  type SubscriptionView,
  type PaymentView,
  type SubscriptionsListResponse,
  type ConfirmPaymentResult,
} from './sprint4Types';
import * as authApiModule from './authApi';
import { ApiError } from './authApi';

const mockSubscription: SubscriptionView = {
  id: '101',
  consumerId: '5',
  planId: '10',
  apiId: '1',
  status: 'Active',
  currentPeriodStart: '2026-11-01T00:00:00.000Z',
  currentPeriodEnd: '2026-12-01T00:00:00.000Z',
  quotaResetAt: '2026-12-01T00:00:00.000Z',
  expiresAt: '2026-12-01T00:00:00.000Z',
  quotaUsed: '50',
  cancelAtPeriodEnd: false,
  canceledAt: null,
  expiredAt: null,
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
  quotaLimit: '10000',
  rateLimitPerMinute: 60,
  priceAmount: '500000.00',
  priceCurrency: 'VND',
};

const mockPayment: PaymentView = {
  paymentId: '55',
  subscriptionId: '101',
  amount: '500000.00',
  currency: 'VND',
  status: 'Pending',
  expiresAt: '2026-11-04T12:00:00.000Z',
  token: 'mock-sandbox-token-xyz',
};

describe('billingApi service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('subscribePlan', () => {
    it('sends POST /api/consumer/subscriptions with planId and unwraps data', async () => {
      const spy = vi
        .spyOn(authApiModule, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: mockSubscription });

      const result = await subscribePlan('10');

      expect(spy).toHaveBeenCalledWith('/api/consumer/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ planId: '10' }),
        signal: undefined,
      });
      expect(result).toEqual(mockSubscription);
    });

    it('passes abort signal when provided', async () => {
      const controller = new AbortController();
      const spy = vi
        .spyOn(authApiModule, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: mockSubscription });

      await subscribePlan('10', controller.signal);

      expect(spy).toHaveBeenCalledWith(
        '/api/consumer/subscriptions',
        expect.objectContaining({ signal: controller.signal })
      );
    });
  });

  describe('listSubscriptions', () => {
    it('sends GET /api/consumer/subscriptions with default page=1 and pageSize=20', async () => {
      const mockList: SubscriptionsListResponse = {
        items: [mockSubscription],
        total: 1,
        page: 1,
        pageSize: 20,
      };

      const spy = vi
        .spyOn(authApiModule, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: mockList });

      const result = await listSubscriptions();

      expect(spy).toHaveBeenCalledWith(
        '/api/consumer/subscriptions?page=1&pageSize=20',
        {
          method: 'GET',
          signal: undefined,
        }
      );
      expect(result).toEqual(mockList);
    });

    it('applies custom pagination and enforces min/max bounds', async () => {
      const mockList: SubscriptionsListResponse = {
        items: [],
        total: 0,
        page: 10000,
        pageSize: 100,
      };

      const spy = vi
        .spyOn(authApiModule, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: mockList });

      // Out of bounds values should be clamped: page <= 10000, pageSize <= 100
      await listSubscriptions(99999, 500);

      expect(spy).toHaveBeenCalledWith(
        '/api/consumer/subscriptions?page=10000&pageSize=100',
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  describe('getSubscription', () => {
    it('sends GET /api/consumer/subscriptions/:id and unwraps data', async () => {
      const spy = vi
        .spyOn(authApiModule, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: mockSubscription });

      const result = await getSubscription('101');

      expect(spy).toHaveBeenCalledWith('/api/consumer/subscriptions/101', {
        method: 'GET',
        signal: undefined,
      });
      expect(result).toEqual(mockSubscription);
    });
  });

  describe('cancelSubscription', () => {
    it('sends POST /api/consumer/subscriptions/:id/cancel with immediate=false by default', async () => {
      const updatedSub: SubscriptionView = {
        ...mockSubscription,
        cancelAtPeriodEnd: true,
      };
      const spy = vi
        .spyOn(authApiModule, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: updatedSub });

      const result = await cancelSubscription('101');

      expect(spy).toHaveBeenCalledWith('/api/consumer/subscriptions/101/cancel', {
        method: 'POST',
        body: JSON.stringify({ immediate: false }),
        signal: undefined,
      });
      expect(result.cancelAtPeriodEnd).toBe(true);
    });

    it('sends POST with immediate=true when requested', async () => {
      const canceledSub: SubscriptionView = {
        ...mockSubscription,
        status: 'Canceled',
        canceledAt: '2026-11-04T10:00:00.000Z',
      };
      const spy = vi
        .spyOn(authApiModule, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: canceledSub });

      const result = await cancelSubscription('101', true);

      expect(spy).toHaveBeenCalledWith('/api/consumer/subscriptions/101/cancel', {
        method: 'POST',
        body: JSON.stringify({ immediate: true }),
        signal: undefined,
      });
      expect(result.status).toBe('Canceled');
    });
  });

  describe('checkoutSubscription', () => {
    it('sends POST /api/consumer/subscriptions/:id/checkout with explicit idempotencyKey', async () => {
      const spy = vi
        .spyOn(authApiModule, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: mockPayment });

      const result = await checkoutSubscription('101', 'chk-custom-12345');

      expect(spy).toHaveBeenCalledWith('/api/consumer/subscriptions/101/checkout', {
        method: 'POST',
        body: JSON.stringify({ idempotencyKey: 'chk-custom-12345' }),
        signal: undefined,
      });
      expect(result).toEqual(mockPayment);
    });

    it('auto-generates valid idempotency key if omitted', async () => {
      const spy = vi
        .spyOn(authApiModule, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: mockPayment });

      await checkoutSubscription('101');

      expect(spy).toHaveBeenCalled();
      const callArg = spy.mock.calls[0];
      const parsedBody = JSON.parse(callArg[1]?.body as string);
      expect(parsedBody.idempotencyKey).toMatch(/^[A-Za-z0-9_.:-]{1,100}$/);
      expect(parsedBody.idempotencyKey.startsWith('chk-')).toBe(true);
    });
  });

  describe('changeSubscriptionPlan', () => {
    it('sends POST /api/consumer/subscriptions/:id/change-plan with planId and idempotencyKey', async () => {
      const spy = vi
        .spyOn(authApiModule, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: mockPayment });

      const result = await changeSubscriptionPlan('101', '20', 'chg-manual-99');

      expect(spy).toHaveBeenCalledWith('/api/consumer/subscriptions/101/change-plan', {
        method: 'POST',
        body: JSON.stringify({ planId: '20', idempotencyKey: 'chg-manual-99' }),
        signal: undefined,
      });
      expect(result).toEqual(mockPayment);
    });

    it('auto-generates valid idempotency key if omitted', async () => {
      const spy = vi
        .spyOn(authApiModule, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: mockPayment });

      await changeSubscriptionPlan('101', '20');

      expect(spy).toHaveBeenCalled();
      const callArg = spy.mock.calls[0];
      const parsedBody = JSON.parse(callArg[1]?.body as string);
      expect(parsedBody.planId).toBe('20');
      expect(parsedBody.idempotencyKey).toMatch(/^[A-Za-z0-9_.:-]{1,100}$/);
      expect(parsedBody.idempotencyKey.startsWith('chg-')).toBe(true);
    });
  });

  describe('confirmPayment', () => {
    it('sends POST /api/consumer/subscriptions/confirm with success outcome and unwraps data', async () => {
      const mockResult: ConfirmPaymentResult = {
        paymentId: '55',
        status: 'Succeeded',
        duplicate: false,
      };

      const spy = vi
        .spyOn(authApiModule, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: mockResult });

      const result = await confirmPayment({
        paymentId: '55',
        token: 'mock-sandbox-token-xyz',
        outcome: 'success',
        eventId: 'evt-manual-001',
      });

      expect(spy).toHaveBeenCalledWith('/api/consumer/subscriptions/confirm', {
        method: 'POST',
        body: JSON.stringify({
          paymentId: '55',
          token: 'mock-sandbox-token-xyz',
          outcome: 'success',
          eventId: 'evt-manual-001',
        }),
        signal: undefined,
      });
      expect(result).toEqual(mockResult);
    });

    it('auto-generates valid eventId if omitted', async () => {
      const mockResult: ConfirmPaymentResult = {
        paymentId: '55',
        status: 'Failed',
        duplicate: true,
      };

      const spy = vi
        .spyOn(authApiModule, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: mockResult });

      await confirmPayment({
        paymentId: '55',
        token: 'mock-sandbox-token-xyz',
        outcome: 'failure',
      });

      expect(spy).toHaveBeenCalled();
      const callArg = spy.mock.calls[0];
      const parsedBody = JSON.parse(callArg[1]?.body as string);
      expect(parsedBody.eventId).toMatch(/^[A-Za-z0-9_.:-]{1,100}$/);
      expect(parsedBody.eventId.startsWith('evt-')).toBe(true);
      expect(parsedBody.outcome).toBe('failure');
    });
  });

  describe('Error handling across HTTP status codes', () => {
    const errorCases = [
      { status: 400, code: 'VALIDATION_ERROR', message: 'Dữ liệu không hợp lệ' },
      { status: 401, code: 'UNAUTHORIZED', message: 'Bạn chưa đăng nhập' },
      { status: 403, code: 'FORBIDDEN', message: 'Không có quyền truy cập' },
      { status: 404, code: 'PLAN_NOT_FOUND', message: 'Không tìm thấy gói' },
      { status: 409, code: 'SUBSCRIPTION_ALREADY_EXISTS', message: 'Đã tồn tại đăng ký' },
      { status: 429, code: 'RATE_LIMITED', message: 'Quá nhiều yêu cầu' },
      { status: 503, code: 'METERING_UNAVAILABLE', message: 'Dịch vụ tạm thời gián đoạn' },
    ];

    for (const testCase of errorCases) {
      it(`propagates ApiError for HTTP ${testCase.status} (${testCase.code})`, async () => {
        vi.spyOn(authApiModule, 'authenticatedRequest').mockRejectedValueOnce(
          new ApiError(testCase.status, testCase.code, testCase.message)
        );

        await expect(subscribePlan('10')).rejects.toMatchObject({
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

      await expect(getSubscription('101', controller.signal)).rejects.toMatchObject({
        code: 'ABORTED',
      });
    });
  });

  describe('Key and ID generation utilities', () => {
    it('generates idempotency keys matching pattern ^[A-Za-z0-9_.:-]{1,100}$', () => {
      for (let i = 0; i < 20; i++) {
        const key = generateIdempotencyKey();
        expect(key).toMatch(/^[A-Za-z0-9_.:-]{1,100}$/);
        expect(key.startsWith('chk-')).toBe(true);
      }
    });

    it('supports custom prefixes for idempotency keys', () => {
      const key = generateIdempotencyKey('custom_key');
      expect(key).toMatch(/^[A-Za-z0-9_.:-]{1,100}$/);
      expect(key.startsWith('custom_key-')).toBe(true);
    });

    it('generates event IDs matching pattern ^[A-Za-z0-9_.:-]{1,100}$', () => {
      for (let i = 0; i < 20; i++) {
        const eventId = generateEventId();
        expect(eventId).toMatch(/^[A-Za-z0-9_.:-]{1,100}$/);
        expect(eventId.startsWith('evt-')).toBe(true);
      }
    });

    it('supports custom prefixes for event IDs', () => {
      const eventId = generateEventId('webhook_evt');
      expect(eventId).toMatch(/^[A-Za-z0-9_.:-]{1,100}$/);
      expect(eventId.startsWith('webhook_evt-')).toBe(true);
    });

    it('generates unique values on consecutive calls', () => {
      const set = new Set<string>();
      for (let i = 0; i < 50; i++) {
        set.add(generateIdempotencyKey());
      }
      expect(set.size).toBe(50);
    });

    it('falls back to crypto.getRandomValues hex string when randomUUID is not available', () => {
      const originalCrypto = globalThis.crypto;
      try {
        const mockCrypto = {
          getRandomValues: vi.fn((buffer: Uint8Array) => {
            for (let i = 0; i < buffer.length; i++) {
              buffer[i] = i * 16;
            }
            return buffer;
          }),
        };
        vi.stubGlobal('crypto', mockCrypto);

        const key = generateIdempotencyKey('hex_test');
        expect(key).toMatch(/^[A-Za-z0-9_.:-]{1,100}$/);
        expect(key.startsWith('hex_test-')).toBe(true);
        expect(mockCrypto.getRandomValues).toHaveBeenCalled();

        const evt = generateEventId('hex_evt');
        expect(evt).toMatch(/^[A-Za-z0-9_.:-]{1,100}$/);
        expect(evt.startsWith('hex_evt-')).toBe(true);
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it('fails closed and throws error when no cryptographic random source is available', () => {
      try {
        vi.stubGlobal('crypto', undefined);
        expect(() => generateIdempotencyKey('chk')).toThrow(
          'Secure cryptographic random source unavailable'
        );
        expect(() => generateEventId('evt')).toThrow(
          'Secure cryptographic random source unavailable'
        );
      } finally {
        vi.unstubAllGlobals();
      }
    });
  });

  describe('Safe currency and BigInt formatters', () => {
    describe('isZeroAmount', () => {
      it('recognizes 0, 0.0, 0.00, empty string, and null as zero', () => {
        expect(isZeroAmount('0')).toBe(true);
        expect(isZeroAmount('0.0')).toBe(true);
        expect(isZeroAmount('0.00')).toBe(true);
        expect(isZeroAmount('')).toBe(true);
        expect(isZeroAmount(null)).toBe(true);
        expect(isZeroAmount(undefined)).toBe(true);
      });

      it('recognizes non-zero amounts correctly', () => {
        expect(isZeroAmount('1')).toBe(false);
        expect(isZeroAmount('0.01')).toBe(false);
        expect(isZeroAmount('500000.00')).toBe(false);
      });
    });

    describe('parseSafeBigInt', () => {
      it('parses numeric strings and BigInt representations safely', () => {
        expect(parseSafeBigInt('1000')).toBe(1000n);
        expect(parseSafeBigInt('9223372036854775807')).toBe(9223372036854775807n);
        expect(parseSafeBigInt(null)).toBe(0n);
        expect(parseSafeBigInt(undefined)).toBe(0n);
        expect(parseSafeBigInt('invalid')).toBe(0n);
      });

      it('drops decimals without floating point loss', () => {
        expect(parseSafeBigInt('500.75')).toBe(500n);
      });
    });

    describe('formatBigIntCount', () => {
      it('formats large integers with digit grouping', () => {
        const formatted = formatBigIntCount('1000000', 'en-US');
        expect(formatted).toBe('1,000,000');
      });

      it('handles null/undefined gracefully', () => {
        expect(formatBigIntCount(null, 'en-US')).toBe('0');
      });
    });

    describe('formatCurrencyAmount', () => {
      it('formats currency without floating point distortion', () => {
        const formatted = formatCurrencyAmount('500000', 'VND', 'en-US');
        expect(formatted).toBe('500,000 VND');
      });

      it('preserves decimals when present and trims trailing zeroes', () => {
        const formatted = formatCurrencyAmount('1234.50', 'USD', 'en-US');
        expect(formatted).toBe('1,234.5 USD');
      });

      it('correctly formats according to vi-VN standards with dot for thousands and comma for decimal', () => {
        expect(formatCurrencyAmount('500000', 'VND', 'vi-VN')).toBe('500.000 VND');
        expect(formatCurrencyAmount('1234567.89', 'VND', 'vi-VN')).toBe('1.234.567,89 VND');
        expect(formatCurrencyAmount('49.99', 'USD', 'vi-VN')).toBe('49,99 USD');
        expect(formatCurrencyAmount('-10000', 'VND', 'vi-VN')).toBe('-10.000 VND');
      });

      it('handles 0 and empty inputs safely', () => {
        expect(formatCurrencyAmount('0', 'VND', 'en-US')).toBe('0 VND');
        expect(formatCurrencyAmount('0.00', 'VND', 'vi-VN')).toBe('0 VND');
        expect(formatCurrencyAmount('-0.00', 'VND', 'vi-VN')).toBe('0 VND');
        expect(formatCurrencyAmount(null, 'VND')).toBe('0 VND');
        expect(formatCurrencyAmount('', 'VND')).toBe('0 VND');
      });

      it('handles negative amounts safely', () => {
        expect(formatCurrencyAmount('-10000', 'VND', 'en-US')).toBe('-10,000 VND');
      });

      it('preserves ultra-large BigInt amounts without IEEE 754 precision loss', () => {
        const bigAmount = '9007199254740993000';
        const formatted = formatCurrencyAmount(bigAmount, 'VND', 'vi-VN');
        expect(formatted).toContain('9.007.199.254.740.993.000 VND');
      });
    });
  });
});

