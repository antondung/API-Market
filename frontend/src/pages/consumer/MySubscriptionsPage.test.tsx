import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  MySubscriptionsPage,
  calculateQuotaProgress,
  mapSubscriptionError,
  formatDate,
} from './MySubscriptionsPage';
import * as billingApi from '../../services/billingApi';
import type { SubscriptionView } from '../../services/sprint4Types';
import { ApiError } from '../../services/authApi';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

vi.mock('../../i18n', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

function createMockSubscription(overrides?: Partial<SubscriptionView>): SubscriptionView {
  return {
    id: 'sub_101',
    consumerId: 'usr_consumer_99',
    planId: 'plan_pro',
    apiId: 'api_payment_v1',
    status: 'Active',
    currentPeriodStart: '2026-03-01T00:00:00.000Z',
    currentPeriodEnd: '2026-03-31T00:00:00.000Z',
    quotaResetAt: '2026-03-31T00:00:00.000Z',
    expiresAt: null,
    quotaUsed: '2500',
    cancelAtPeriodEnd: false,
    canceledAt: null,
    expiredAt: null,
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
    quotaLimit: '10000',
    rateLimitPerMinute: 120,
    priceAmount: '500000',
    priceCurrency: 'VND',
    ...overrides,
  };
}

describe('MySubscriptionsPage Component & Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Pure helpers', () => {
    it('calculateQuotaProgress calculates safe BigInt percentage and handles edge cases', () => {
      expect(calculateQuotaProgress('0', '0')).toBe(0);
      expect(calculateQuotaProgress('100', '0')).toBe(0);
      expect(calculateQuotaProgress('0', '1000')).toBe(0);
      expect(calculateQuotaProgress('250', '1000')).toBe(25);
      expect(calculateQuotaProgress('1200', '1000')).toBe(100);
      // Values exceeding standard JS Number.MAX_SAFE_INTEGER
      const hugeLimit = '18014398509481986';
      const hugeUsed = '9007199254740993';
      expect(calculateQuotaProgress(hugeUsed, hugeLimit)).toBe(50);
    });

    it('mapSubscriptionError maps backend error codes to clear messages', () => {
      const lockedErr = new ApiError(400, 'SUBSCRIPTION_PERIOD_LOCKED', 'Locked');
      expect(mapSubscriptionError(lockedErr)).toContain('Gói đã hủy trong kỳ hiện tại');

      const existsErr = new ApiError(409, 'SUBSCRIPTION_ALREADY_EXISTS', 'Exists');
      expect(mapSubscriptionError(existsErr)).toContain('Đã có đăng ký cho API này');

      const unauthErr = new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
      expect(mapSubscriptionError(unauthErr)).toContain('Phiên đăng nhập đã hết hạn');

      const forbidErr = new ApiError(403, 'FORBIDDEN', 'Forbidden');
      expect(mapSubscriptionError(forbidErr)).toContain('Bạn không có quyền');

      const notFoundErr = new ApiError(404, 'NOT_FOUND', 'Not found');
      expect(mapSubscriptionError(notFoundErr)).toContain('Không tìm thấy gói đăng ký');

      const serverErr = new ApiError(500, 'INTERNAL_ERROR', 'Server error');
      expect(mapSubscriptionError(serverErr)).toContain('Lỗi máy chủ (500)');

      const genericErr = new Error('Network failure');
      expect(mapSubscriptionError(genericErr)).toBe('Network failure');

      expect(mapSubscriptionError(null, 'Mặc định')).toBe('Mặc định');
    });

    it('formatDate formats dates or safely falls back on invalid input', () => {
      expect(formatDate(null)).toBe('-');
      expect(formatDate(undefined)).toBe('-');
      expect(formatDate('invalid-date')).toBe('invalid-date');
      const valid = formatDate('2026-03-31T00:00:00.000Z');
      expect(valid).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });

  describe('Page rendering & states', () => {
    it('renders loading skeleton while fetching subscriptions', () => {
      vi.spyOn(billingApi, 'listSubscriptions').mockImplementation(
        () => new Promise(() => {}) // never resolves
      );

      render(
        <MemoryRouter>
          <MySubscriptionsPage />
        </MemoryRouter>
      );

      expect(screen.getByTestId('subscriptions-loading')).toBeDefined();
    });

    it('renders empty state when total is 0 with button to explore marketplace', async () => {
      vi.spyOn(billingApi, 'listSubscriptions').mockResolvedValueOnce({
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
      });

      render(
        <MemoryRouter>
          <MySubscriptionsPage />
        </MemoryRouter>
      );

      expect(await screen.findByTestId('subscriptions-empty')).toBeDefined();
      expect(screen.getByText('No Subscriptions Found')).toBeDefined();

      const exploreBtn = screen.getAllByRole('button', { name: /Khám phá Marketplace|Explore Marketplace/i })[0];
      fireEvent.click(exploreBtn);
      expect(mockedNavigate).toHaveBeenCalledWith('/marketplace');
    });

    it('renders error state and retries successfully', async () => {
      let callCount = 0;
      vi.spyOn(billingApi, 'listSubscriptions').mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          throw new ApiError(500, 'FAIL', 'Database connection refused');
        }
        return {
          items: [createMockSubscription()],
          total: 1,
          page: 1,
          pageSize: 10,
        };
      });

      render(
        <MemoryRouter>
          <MySubscriptionsPage />
        </MemoryRouter>
      );

      expect(await screen.findByRole('alert')).toBeDefined();
      expect(screen.getByText(/Lỗi máy chủ \(500\)/)).toBeDefined();

      const retryBtn = screen.getByRole('button', { name: /Thử lại/i });
      fireEvent.click(retryBtn);

      expect(await screen.findByTestId('subscription-item-sub_101')).toBeDefined();
      expect(callCount).toBe(2);
    });

    it('renders subscription list with details from SubscriptionView', async () => {
      const mockSub = createMockSubscription({
        id: 'sub_test_999',
        apiId: 'api_ai_vision',
        planId: 'enterprise_plan',
        quotaUsed: '7500',
        quotaLimit: '10000',
        rateLimitPerMinute: 300,
        priceAmount: '1200000',
        priceCurrency: 'VND',
      });

      vi.spyOn(billingApi, 'listSubscriptions').mockResolvedValueOnce({
        items: [mockSub],
        total: 1,
        page: 1,
        pageSize: 10,
      });

      render(
        <MemoryRouter>
          <MySubscriptionsPage />
        </MemoryRouter>
      );

      expect(await screen.findByTestId('subscription-item-sub_test_999')).toBeDefined();
      expect(screen.getByText('API #api_ai_vision')).toBeDefined();
      expect(screen.getByText(/enterprise_plan/)).toBeDefined();
      expect(screen.getByText(/ID: #sub_test_999/)).toBeDefined();
      expect(screen.getByText(/300 req\/phút/)).toBeDefined();
      expect(screen.getByText(/1\.200\.000 VND \/ tháng/)).toBeDefined();
      expect(screen.getByText(/75%/)).toBeDefined();
    });

    it('renders status badges for all subscription statuses', async () => {
      const statuses: Array<SubscriptionView['status']> = [
        'Active',
        'Pending',
        'Past Due',
        'Suspended',
        'Canceled',
        'Expired',
      ];

      const items = statuses.map((status, idx) =>
        createMockSubscription({
          id: `sub_${idx}`,
          apiId: `api_${idx}`,
          status,
        })
      );

      vi.spyOn(billingApi, 'listSubscriptions').mockResolvedValueOnce({
        items,
        total: items.length,
        page: 1,
        pageSize: 10,
      });

      render(
        <MemoryRouter>
          <MySubscriptionsPage />
        </MemoryRouter>
      );

      expect(await screen.findByTestId('subscription-item-sub_0')).toBeDefined();
      expect(screen.getByText('Đang hoạt động')).toBeDefined();
      expect(screen.getByText('Chờ thanh toán')).toBeDefined();
      expect(screen.getByText('Quá hạn thanh toán')).toBeDefined();
      expect(screen.getByText('Tạm dừng')).toBeDefined();
      expect(screen.getByText('Đã hủy')).toBeDefined();
      expect(screen.getByText('Hết hạn')).toBeDefined();
    });

    it('displays checkout button for Pending subscriptions and navigates to checkout', async () => {
      const pendingSub = createMockSubscription({
        id: 'sub_pending_1',
        apiId: 'api_geo',
        planId: 'plan_starter',
        status: 'Pending',
      });

      vi.spyOn(billingApi, 'listSubscriptions').mockResolvedValueOnce({
        items: [pendingSub],
        total: 1,
        page: 1,
        pageSize: 10,
      });

      render(
        <MemoryRouter>
          <MySubscriptionsPage />
        </MemoryRouter>
      );

      expect(await screen.findByTestId('subscription-item-sub_pending_1')).toBeDefined();
      const checkoutBtn = screen.getByRole('button', { name: /Thanh toán ngay/i });
      fireEvent.click(checkoutBtn);

      expect(mockedNavigate).toHaveBeenCalledWith('/checkout/api_geo/plan_starter');
    });

    it('displays change plan button for Active subscriptions and navigates to api detail', async () => {
      const activeSub = createMockSubscription({
        id: 'sub_active_1',
        apiId: 'api_ai_search',
        status: 'Active',
      });

      vi.spyOn(billingApi, 'listSubscriptions').mockResolvedValueOnce({
        items: [activeSub],
        total: 1,
        page: 1,
        pageSize: 10,
      });

      render(
        <MemoryRouter>
          <MySubscriptionsPage />
        </MemoryRouter>
      );

      expect(await screen.findByTestId('subscription-item-sub_active_1')).toBeDefined();
      const changePlanBtn = screen.getByRole('button', { name: /Đổi gói/i });
      fireEvent.click(changePlanBtn);

      expect(mockedNavigate).toHaveBeenCalledWith('/api/api_ai_search');
    });

    it('renders warning badge when cancelAtPeriodEnd is true and hides cancel button', async () => {
      const scheduledSub = createMockSubscription({
        id: 'sub_scheduled',
        status: 'Active',
        cancelAtPeriodEnd: true,
        currentPeriodEnd: '2026-04-15T00:00:00.000Z',
      });

      vi.spyOn(billingApi, 'listSubscriptions').mockResolvedValueOnce({
        items: [scheduledSub],
        total: 1,
        page: 1,
        pageSize: 10,
      });

      render(
        <MemoryRouter>
          <MySubscriptionsPage />
        </MemoryRouter>
      );

      expect(await screen.findByTestId('subscription-item-sub_scheduled')).toBeDefined();
      expect(screen.getByText(/Hủy vào cuối kỳ:/)).toBeDefined();
      expect(screen.queryByRole('button', { name: /Hủy gói/i })).toBeNull();
    });

    it('handles pagination controls when total exceeds pageSize', async () => {
      const listSpy = vi.spyOn(billingApi, 'listSubscriptions').mockImplementation(async (targetPage) => {
        return {
          items: [createMockSubscription({ id: `sub_page_${targetPage ?? 1}` })],
          total: 25,
          page: targetPage ?? 1,
          pageSize: 10,
        };
      });

      render(
        <MemoryRouter>
          <MySubscriptionsPage />
        </MemoryRouter>
      );

      expect(await screen.findByText(/Trang 1 \/ 3/)).toBeDefined();
      const nextBtn = screen.getByRole('button', { name: /Trang sau/i });
      const prevBtn = screen.getByRole('button', { name: /Trang trước/i });

      expect(prevBtn).toHaveProperty('disabled', true);
      expect(nextBtn).toHaveProperty('disabled', false);

      fireEvent.click(nextBtn);

      await waitFor(() => {
        expect(listSpy).toHaveBeenCalledWith(2, 10, expect.any(Object));
      });
    });
  });

  describe('Cancellation Flow', () => {
    it('cancels at period end (immediate: false) by default', async () => {
      const activeSub = createMockSubscription({ id: 'sub_to_cancel' });
      vi.spyOn(billingApi, 'listSubscriptions').mockResolvedValue({
        items: [activeSub],
        total: 1,
        page: 1,
        pageSize: 10,
      });
      const cancelSpy = vi.spyOn(billingApi, 'cancelSubscription').mockResolvedValueOnce({
        ...activeSub,
        cancelAtPeriodEnd: true,
      });

      render(
        <MemoryRouter>
          <MySubscriptionsPage />
        </MemoryRouter>
      );

      expect(await screen.findByTestId('subscription-item-sub_to_cancel')).toBeDefined();

      const cancelBtn = screen.getByRole('button', { name: /Hủy gói/i });
      fireEvent.click(cancelBtn);

      // Dialog opens
      expect(screen.getByRole('dialog')).toBeDefined();
      expect(screen.getByText('Xác nhận hủy gói')).toBeDefined();

      // Confirm cancel with default immediate: false
      const confirmBtn = screen.getByRole('button', { name: /Xác nhận hủy/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(cancelSpy).toHaveBeenCalledWith('sub_to_cancel', false);
      });

      // Dialog closed
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(await screen.findByRole('status')).toBeDefined();
    });

    it('cancels immediate (immediate: true) with gateway revocation warning', async () => {
      const activeSub = createMockSubscription({ id: 'sub_immediate_cancel' });
      vi.spyOn(billingApi, 'listSubscriptions').mockResolvedValue({
        items: [activeSub],
        total: 1,
        page: 1,
        pageSize: 10,
      });
      const cancelSpy = vi.spyOn(billingApi, 'cancelSubscription').mockResolvedValueOnce({
        ...activeSub,
        status: 'Canceled',
      });

      render(
        <MemoryRouter>
          <MySubscriptionsPage />
        </MemoryRouter>
      );

      expect(await screen.findByTestId('subscription-item-sub_immediate_cancel')).toBeDefined();

      fireEvent.click(screen.getByRole('button', { name: /Hủy gói/i }));

      // Radio button for immediate
      const immediateRadio = screen.getByLabelText(/Hủy ngay lập tức/i);
      fireEvent.click(immediateRadio);

      // Warning text is clearly visible
      expect(
        screen.getByText(/CẢNH BÁO: Thu hồi quyền truy cập API Gateway ngay lập tức!/i)
      ).toBeDefined();

      fireEvent.click(screen.getByRole('button', { name: /Xác nhận hủy/i }));

      await waitFor(() => {
        expect(cancelSpy).toHaveBeenCalledWith('sub_immediate_cancel', true);
      });

      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('displays error in cancellation dialog if cancel fails with SUBSCRIPTION_PERIOD_LOCKED', async () => {
      const activeSub = createMockSubscription({ id: 'sub_locked' });
      vi.spyOn(billingApi, 'listSubscriptions').mockResolvedValue({
        items: [activeSub],
        total: 1,
        page: 1,
        pageSize: 10,
      });
      vi.spyOn(billingApi, 'cancelSubscription').mockRejectedValueOnce(
        new ApiError(400, 'SUBSCRIPTION_PERIOD_LOCKED', 'Period locked')
      );

      render(
        <MemoryRouter>
          <MySubscriptionsPage />
        </MemoryRouter>
      );

      expect(await screen.findByTestId('subscription-item-sub_locked')).toBeDefined();

      fireEvent.click(screen.getByRole('button', { name: /Hủy gói/i }));
      fireEvent.click(screen.getByRole('button', { name: /Xác nhận hủy/i }));

      expect(
        await screen.findByText(/Gói đã hủy trong kỳ hiện tại đã sử dụng quota, không thể đăng ký lại/i)
      ).toBeDefined();

      // Dialog stays open so user can inspect error or close
      expect(screen.getByRole('dialog')).toBeDefined();

      // Close button closes modal
      fireEvent.click(screen.getByRole('button', { name: /^Đóng$/i }));
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  describe('BigInt Safety & Multi-currency', () => {
    it('formats safe BigInt quota and multi-currency correctly', async () => {
      const hugeSub = createMockSubscription({
        id: 'sub_huge_1',
        quotaUsed: '9007199254740993',
        quotaLimit: '18014398509481986',
        priceAmount: '49.99',
        priceCurrency: 'USD',
      });

      vi.spyOn(billingApi, 'listSubscriptions').mockResolvedValueOnce({
        items: [hugeSub],
        total: 1,
        page: 1,
        pageSize: 10,
      });

      render(
        <MemoryRouter>
          <MySubscriptionsPage />
        </MemoryRouter>
      );

      expect(await screen.findByTestId('subscription-item-sub_huge_1')).toBeDefined();
      expect(screen.getByText(/9\.007\.199\.254\.740\.993/)).toBeDefined();
      expect(screen.getByText(/18\.014\.398\.509\.481\.986/)).toBeDefined();
      expect(screen.getByText(/49\.99 USD \/ tháng/)).toBeDefined();
    });
  });
});
