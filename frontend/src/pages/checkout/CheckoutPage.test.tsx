import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CheckoutPage } from './CheckoutPage';
import * as marketplaceApi from '../../services/marketplaceApi';
import * as authContext from '../../context/AuthContext';
import * as billingApi from '../../services/billingApi';
import { ApiError } from '../../services/authApi';
import type { MarketplaceApiDetail, MarketplacePricingPlan } from '../../services/marketplaceTypes';
import type { SubscriptionView, PaymentView } from '../../services/sprint4Types';

vi.mock('../../i18n', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock('../../services/billingApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/billingApi')>();
  return {
    ...actual,
    subscribePlan: vi.fn(),
    checkoutSubscription: vi.fn(),
    confirmPayment: vi.fn(),
    getSubscription: vi.fn(),
  };
});

const mockPaidPlan: MarketplacePricingPlan = {
  id: 'plan-chk-1',
  name: 'Growth Tier',
  priceMonthly: 750000,
  currency: 'VND',
  quota: 100000,
  rateLimit: 100,
};

const mockFreePlan: MarketplacePricingPlan = {
  id: 'plan-free-1',
  name: 'Free Tier',
  priceMonthly: 0,
  currency: 'VND',
  quota: 5000,
  rateLimit: 10,
};

const mockApiDetail: MarketplaceApiDetail = {
  id: 'api-checkout-test',
  name: 'Enterprise Checkout API',
  description: 'Payment routing test',
  category: 'Finance',
  providerId: 'prov-chk',
  providerName: 'Checkout Inc',
  providerStatus: 'Verified',
  tags: ['finance'],
  hasFreePlan: true,
  hasPaidPlan: true,
  publishedAt: '2026-10-20T00:00:00Z',
  versions: [{ id: 'v1', version: '1.0.0', changelog: '' }],
  endpoints: [],
  documentation: [],
  legal: null,
  plans: [mockPaidPlan, mockFreePlan],
};

const mockActiveSubscription: SubscriptionView = {
  id: 'sub-chk-1',
  consumerId: 'usr-1',
  planId: 'plan-chk-1',
  apiId: 'api-checkout-test',
  status: 'Active',
  currentPeriodStart: '2026-11-04T00:00:00Z',
  currentPeriodEnd: '2026-12-04T00:00:00Z',
  quotaResetAt: '2026-12-04T00:00:00Z',
  expiresAt: null,
  quotaUsed: '0',
  cancelAtPeriodEnd: false,
  canceledAt: null,
  expiredAt: null,
  createdAt: '2026-11-04T00:00:00Z',
  updatedAt: '2026-11-04T00:00:00Z',
  quotaLimit: '100000',
  rateLimitPerMinute: 6000,
  priceAmount: '750000',
  priceCurrency: 'VND',
};

const mockPaymentView: PaymentView = {
  paymentId: 'pay-12345',
  subscriptionId: 'sub-chk-1',
  amount: '750000',
  currency: 'VND',
  status: 'Pending',
  expiresAt: '2026-11-04T01:00:00Z',
  token: 'super-secret-token-xyz-12345',
};

const renderCheckout = (initialRoute = '/checkout/api-checkout-test/plan-chk-1') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/checkout/:apiId/:planId" element={<CheckoutPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(mockApiDetail);
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      currentUser: { id: 'usr-1', email: 'test@example.com', role: 'consumer', name: 'Tester' } as any,
      user: { id: 'usr-1', email: 'test@example.com', role: 'consumer', name: 'Tester' } as any,
      isAuthenticated: true,
      sessionReady: true,
      sessionError: null,
      backendOnline: true,
      checkBackendConnection: vi.fn(),
      retrySession: vi.fn(),
      loginWithBackend: vi.fn(),
      registerWithBackend: vi.fn(),
      logout: vi.fn(),
      verifyRoleAccess: vi.fn(),
      refreshCurrentUser: vi.fn().mockResolvedValue(undefined),
    });
  });

  it('renders exact plan pricing and removes unverified Redis cluster claim', async () => {
    renderCheckout();

    await waitFor(() => {
      expect(screen.getByText('Enterprise Checkout API')).toBeDefined();
    });

    expect(screen.getAllByText(/750\.000\s*₫/).length).toBeGreaterThan(0);
    expect(screen.getByText('API Gateway Egress')).toBeDefined();
    expect(screen.queryByText(/Redis Guard/i)).toBeNull();
  });

  it('terms checkbox defaults to false and disables action until checked', async () => {
    renderCheckout();

    await waitFor(() => {
      expect(screen.getByText('Enterprise Checkout API')).toBeDefined();
    });

    const checkbox = screen.getByTestId('terms-checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    const submitBtn = screen.getByRole('button', { name: /Xác nhận đăng ký/i });
    expect(submitBtn.hasAttribute('disabled')).toBe(true);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
    expect(submitBtn.hasAttribute('disabled')).toBe(false);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
    expect(submitBtn.hasAttribute('disabled')).toBe(true);
  });

  it('renders login link when user is unauthenticated', async () => {
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      currentUser: null,
      user: null,
      isAuthenticated: false,
      sessionReady: true,
      sessionError: null,
      backendOnline: true,
      checkBackendConnection: vi.fn(),
      retrySession: vi.fn(),
      loginWithBackend: vi.fn(),
      registerWithBackend: vi.fn(),
      logout: vi.fn(),
      verifyRoleAccess: vi.fn(),
      refreshCurrentUser: vi.fn().mockResolvedValue(undefined),
    });

    renderCheckout('/checkout/api-checkout-test/plan-chk-1');

    await waitFor(() => {
      expect(screen.getByText('Yêu cầu đăng nhập')).toBeDefined();
    });

    const loginLink = screen.getByRole('link', { name: 'Đăng nhập' });
    expect(loginLink.getAttribute('href')).toBe('/login?redirect=%2Fcheckout%2Fapi-checkout-test%2Fplan-chk-1');
  });

  it('warns provider/admin role and disables checkout', async () => {
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      currentUser: { id: 'prov-1', email: 'prov@example.com', role: 'API_PROVIDER', name: 'Provider' } as any,
      user: { id: 'prov-1', email: 'prov@example.com', role: 'API_PROVIDER', name: 'Provider' } as any,
      isAuthenticated: true,
      sessionReady: true,
      sessionError: null,
      backendOnline: true,
      checkBackendConnection: vi.fn(),
      retrySession: vi.fn(),
      loginWithBackend: vi.fn(),
      registerWithBackend: vi.fn(),
      logout: vi.fn(),
      verifyRoleAccess: vi.fn(),
      refreshCurrentUser: vi.fn().mockResolvedValue(undefined),
    });

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByTestId('role-warning-banner')).toBeDefined();
    });

    const checkbox = screen.getByTestId('terms-checkbox');
    fireEvent.click(checkbox);

    const submitBtn = screen.getByRole('button', { name: /Xác nhận đăng ký/i });
    expect(submitBtn.hasAttribute('disabled')).toBe(true);
  });

  it('renders PublicApiUnavailable when plan ID is invalid or API fetch fails', async () => {
    renderCheckout('/checkout/api-checkout-test/plan-nonexistent');

    await waitFor(() => {
      expect(screen.getByText(/API không tồn tại|Không tìm thấy API/i)).toBeDefined();
    });
  });

  it('activates Free plan directly to Active without payment', async () => {
    const freeSub: SubscriptionView = {
      ...mockActiveSubscription,
      id: 'sub-free-999',
      planId: 'plan-free-1',
      priceAmount: '0',
      quotaLimit: '5000',
    };

    vi.mocked(billingApi.subscribePlan).mockResolvedValue(freeSub);

    renderCheckout('/checkout/api-checkout-test/plan-free-1');

    await waitFor(() => {
      expect(screen.getByText('Free Tier')).toBeDefined();
    });

    const submitBtn = screen.getByRole('button', { name: /Kích hoạt gói Miễn phí/i });
    expect(submitBtn.hasAttribute('disabled')).toBe(true);

    const checkbox = screen.getByTestId('terms-checkbox');
    fireEvent.click(checkbox);
    expect(submitBtn.hasAttribute('disabled')).toBe(false);

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Đăng ký gói thành công!')).toBeDefined();
    });

    expect(screen.getAllByText('Active').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Quản lý gói đăng ký' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Tạo API Key' })).toBeDefined();

    expect(billingApi.subscribePlan).toHaveBeenCalledWith('plan-free-1', expect.any(AbortSignal));
    expect(billingApi.checkoutSubscription).not.toHaveBeenCalled();
    expect(billingApi.confirmPayment).not.toHaveBeenCalled();
  });

  it('executes Paid plan complete flow (subscribe -> checkout -> confirm success -> active)', async () => {
    const pendingSub: SubscriptionView = {
      ...mockActiveSubscription,
      status: 'Pending',
    };

    vi.mocked(billingApi.subscribePlan).mockResolvedValue(pendingSub);
    vi.mocked(billingApi.checkoutSubscription).mockResolvedValue(mockPaymentView);
    vi.mocked(billingApi.confirmPayment).mockResolvedValue({
      paymentId: 'pay-12345',
      status: 'Succeeded',
      duplicate: false,
    });
    vi.mocked(billingApi.getSubscription).mockResolvedValue(mockActiveSubscription);

    renderCheckout('/checkout/api-checkout-test/plan-chk-1');

    await waitFor(() => {
      expect(screen.getByText('Growth Tier')).toBeDefined();
    });

    const checkbox = screen.getByTestId('terms-checkbox');
    fireEvent.click(checkbox);

    const submitBtn = screen.getByRole('button', { name: /Xác nhận đăng ký/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Đăng ký gói thành công!')).toBeDefined();
    });

    expect(screen.getAllByText('Active').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Quản lý gói đăng ký' })).toBeDefined();

    expect(billingApi.subscribePlan).toHaveBeenCalledWith('plan-chk-1', expect.any(AbortSignal));
    expect(billingApi.checkoutSubscription).toHaveBeenCalledWith(
      'sub-chk-1',
      expect.stringMatching(/^chk-/),
      expect.any(AbortSignal)
    );
    expect(billingApi.confirmPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentId: 'pay-12345',
        token: 'super-secret-token-xyz-12345',
        outcome: 'success',
      }),
      expect.any(AbortSignal)
    );
    expect(billingApi.getSubscription).toHaveBeenCalledWith('sub-chk-1', expect.any(AbortSignal));
  });

  it('handles Paid plan simulation failure and allows retry', async () => {
    const pendingSub: SubscriptionView = {
      ...mockActiveSubscription,
      status: 'Pending',
    };

    vi.mocked(billingApi.subscribePlan).mockResolvedValue(pendingSub);
    vi.mocked(billingApi.checkoutSubscription).mockResolvedValue(mockPaymentView);
    vi.mocked(billingApi.confirmPayment).mockResolvedValue({
      paymentId: 'pay-12345',
      status: 'Failed',
      duplicate: false,
    });

    renderCheckout('/checkout/api-checkout-test/plan-chk-1');

    await waitFor(() => {
      expect(screen.getByText('Growth Tier')).toBeDefined();
    });

    // Select failure outcome
    const failureRadioLabel = screen.getByTestId('outcome-failure-label');
    fireEvent.click(failureRadioLabel);

    const checkbox = screen.getByTestId('terms-checkbox');
    fireEvent.click(checkbox);

    const submitBtn = screen.getByRole('button', { name: /Xác nhận đăng ký/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId('payment-failure-banner')).toBeDefined();
    });

    expect(screen.getByText('Thanh toán mô phỏng thất bại (Sandbox Declined)')).toBeDefined();

    // Click retry
    const retryBtn = screen.getByTestId('retry-button');
    fireEvent.click(retryBtn);

    expect(screen.queryByTestId('payment-failure-banner')).toBeNull();
  });

  it('prevents double-click / concurrent submissions', async () => {
    let resolveSubscribe: (sub: SubscriptionView) => void = () => {};
    const deferredPromise = new Promise<SubscriptionView>((resolve) => {
      resolveSubscribe = resolve;
    });

    vi.mocked(billingApi.subscribePlan).mockReturnValue(deferredPromise);

    renderCheckout('/checkout/api-checkout-test/plan-free-1');

    await waitFor(() => {
      expect(screen.getByText('Free Tier')).toBeDefined();
    });

    const checkbox = screen.getByTestId('terms-checkbox');
    fireEvent.click(checkbox);

    const submitBtn = screen.getByRole('button', { name: /Kích hoạt gói Miễn phí/i });
    fireEvent.click(submitBtn);
    fireEvent.click(submitBtn);

    expect(billingApi.subscribePlan).toHaveBeenCalledTimes(1);

    // Resolve deferred promise
    resolveSubscribe({
      ...mockActiveSubscription,
      id: 'sub-free-2',
      planId: 'plan-free-1',
      priceAmount: '0',
    });

    await waitFor(() => {
      expect(screen.getByText('Đăng ký gói thành công!')).toBeDefined();
    });
  });

  it('handles 409 conflict and network errors gracefully', async () => {
    vi.mocked(billingApi.subscribePlan).mockRejectedValueOnce(
      new ApiError(409, 'SUBSCRIPTION_ALREADY_EXISTS', 'Subscription exists')
    );

    renderCheckout('/checkout/api-checkout-test/plan-chk-1');

    await waitFor(() => {
      expect(screen.getByText('Growth Tier')).toBeDefined();
    });

    const checkbox = screen.getByTestId('terms-checkbox');
    fireEvent.click(checkbox);

    const submitBtn = screen.getByRole('button', { name: /Xác nhận đăng ký/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId('checkout-error-banner')).toBeDefined();
    });

    expect(screen.getByText(/Bạn đã có gói đăng ký đang hoạt động/)).toBeDefined();

    // Now test network error
    vi.mocked(billingApi.subscribePlan).mockRejectedValueOnce(new Error('Connection lost'));
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Connection lost')).toBeDefined();
    });
  });

  it('never stores secret payment token in localStorage or sessionStorage', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    const pendingSub: SubscriptionView = {
      ...mockActiveSubscription,
      status: 'Pending',
    };

    vi.mocked(billingApi.subscribePlan).mockResolvedValue(pendingSub);
    vi.mocked(billingApi.checkoutSubscription).mockResolvedValue(mockPaymentView);
    vi.mocked(billingApi.confirmPayment).mockResolvedValue({
      paymentId: 'pay-12345',
      status: 'Succeeded',
      duplicate: false,
    });
    vi.mocked(billingApi.getSubscription).mockResolvedValue(mockActiveSubscription);

    renderCheckout('/checkout/api-checkout-test/plan-chk-1');

    await waitFor(() => {
      expect(screen.getByText('Growth Tier')).toBeDefined();
    });

    const checkbox = screen.getByTestId('terms-checkbox');
    fireEvent.click(checkbox);

    const submitBtn = screen.getByRole('button', { name: /Xác nhận đăng ký/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Đăng ký gói thành công!')).toBeDefined();
    });

    for (const call of setItemSpy.mock.calls) {
      expect(call[0]).not.toContain('token');
      expect(call[1]).not.toContain('super-secret-token-xyz-12345');
    }
  });
});
