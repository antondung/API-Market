import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext, type AuthContextType } from '../context/AuthContext';
import { ConsumerDashboardPage } from '../pages/consumer/ConsumerDashboardPage';
import { ProviderDashboardPage } from '../pages/provider/ProviderDashboardPage';
import { MySubscriptionsPage } from '../pages/consumer/MySubscriptionsPage';
import { RequestHistoryPage } from '../pages/consumer/RequestHistoryPage';
import { UsageQuotaPage } from '../pages/consumer/UsageQuotaPage';
import * as consumerApi from '../services/consumerApi';
import * as providerApi from '../services/providerApi';
import * as usageApi from '../services/usageApi';
import * as billingApi from '../services/billingApi';
import type { User } from '../types';

function createMockAuth(user: User | null): AuthContextType {
  return {
    currentUser: user,
    user,
    isAuthenticated: Boolean(user),
    sessionReady: true,
    sessionError: null,
    backendOnline: true,
    checkBackendConnection: vi.fn().mockResolvedValue(true),
    retrySession: vi.fn().mockResolvedValue(undefined),
    loginWithBackend: vi.fn().mockResolvedValue({ success: true }),
    registerWithBackend: vi.fn().mockResolvedValue({ success: true }),
    logout: vi.fn().mockResolvedValue({}),
    verifyRoleAccess: vi.fn().mockResolvedValue({ success: true }),
    refreshCurrentUser: vi.fn().mockResolvedValue(undefined),
  };
}

const userA: User = {
  id: 'usr_tenant_A',
  email: 'tenantA@example.com',
  name: 'Tenant A Dev',
  role: 'USER',
  status: 'Active',
  createdAt: '',
  lastLoginAt: '',
  twoFactorEnabled: false,
  quotaUsedPercent: 0,
};

const userB: User = {
  id: 'usr_tenant_B',
  email: 'tenantB@example.com',
  name: 'Tenant B Dev',
  role: 'USER',
  status: 'Active',
  createdAt: '',
  lastLoginAt: '',
  twoFactorEnabled: false,
  quotaUsedPercent: 0,
};

describe('Account Isolation & Zero Stale Render Audit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ConsumerDashboardPage account switch isolation', () => {
    it('immediately prevents rendering user A keys and quota when user switches to user B', async () => {
      vi.spyOn(consumerApi, 'listConsumerApiKeys').mockResolvedValue({
        items: [
          {
            id: 'key_A_1',
            apiId: '10',
            keyPrefix: 'ak_live_tenant_A',
            label: 'Tenant A Key',
            isActive: true,
            lastUsedAt: null,
            revokedAt: null,
            createdAt: '2026-11-01T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 100,
      });

      vi.spyOn(usageApi, 'getConsumerUsageSummary').mockResolvedValue({
        subscriptions: [
          {
            id: 'sub_A_999',
            apiId: '10',
            status: 'Active',
            quotaLimit: '1000000',
            quotaUsed: '500',
            remainingRequests: '999500',
            periodStart: '2026-11-01',
            periodEnd: '2026-12-01',
          },
        ],
        daily: [],
      });

      const { rerender } = render(
        <MemoryRouter>
          <AuthContext.Provider value={createMockAuth(userA)}>
            <ConsumerDashboardPage />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      // Confirm user A sees their 500 quota used and active credentials
      expect(await screen.findByText(/500/)).toBeDefined();

      // Mock user B returning delayed promise
      vi.spyOn(consumerApi, 'listConsumerApiKeys').mockImplementation((_page, _limit, signal) => {
        return new Promise((resolve) => {
          if (signal) {
            signal.addEventListener('abort', () => resolve({ items: [], total: 0, page: 1, pageSize: 100 }));
          }
        });
      });
      vi.spyOn(usageApi, 'getConsumerUsageSummary').mockImplementation((_params, signal) => {
        return new Promise((resolve) => {
          if (signal) {
            signal.addEventListener('abort', () => resolve({ subscriptions: [], daily: [] }));
          }
        });
      });

      // Now switch user context to user B
      rerender(
        <MemoryRouter>
          <AuthContext.Provider value={createMockAuth(userB)}>
            <ConsumerDashboardPage />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      // RENDER-GUARD VERIFICATION:
      // Immediately on render, User A's 500 quota must NOT be present
      expect(screen.queryByText(/500/)).toBeNull();
    });
  });

  describe('MySubscriptionsPage account switch isolation', () => {
    it('immediately prevents rendering user A subscriptions when switching to user B', async () => {
      vi.spyOn(billingApi, 'listSubscriptions').mockResolvedValue({
        items: [
          {
            id: 'sub_secret_userA',
            apiId: '1',
            consumerId: 'usr_tenant_A',
            planId: 'plan_1',
            status: 'Active',
            currentPeriodStart: '2026-11-01T00:00:00Z',
            currentPeriodEnd: '2026-12-01T00:00:00Z',
            quotaResetAt: '2026-12-01T00:00:00Z',
            expiresAt: null,
            cancelAtPeriodEnd: false,
            canceledAt: null,
            expiredAt: null,
            quotaLimit: '50000',
            quotaUsed: '100',
            rateLimitPerMinute: 60,
            priceAmount: '0',
            priceCurrency: 'VND',
            createdAt: '2026-11-01T00:00:00Z',
            updatedAt: '2026-11-01T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
      });

      const { rerender } = render(
        <MemoryRouter>
          <AuthContext.Provider value={createMockAuth(userA)}>
            <MySubscriptionsPage />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      expect(await screen.findByText(/sub_secret_userA/)).toBeDefined();

      // Switch to user B (unresolved/delayed fetch)
      vi.spyOn(billingApi, 'listSubscriptions').mockImplementation(() => new Promise(() => {}));

      rerender(
        <MemoryRouter>
          <AuthContext.Provider value={createMockAuth(userB)}>
            <MySubscriptionsPage />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      // User A's subscription must immediately be removed from DOM
      expect(screen.queryByText(/sub_secret_userA/)).toBeNull();
    });
  });

  describe('RequestHistoryPage account switch isolation', () => {
    it('immediately clears history items on user switch', async () => {
      vi.spyOn(usageApi, 'getConsumerUsageHistory').mockResolvedValue({
        items: [
          {
            id: 'log_A_secret_transaction_999',
            requestId: 'req_123',
            occurredAt: '2026-11-01T12:00:00Z',
            apiId: '1',
            apiName: 'Secret API A',
            method: 'POST',
            path: '/v1/secret-action',
            statusCode: 200,
            errorCode: null,
            latencyMs: 45,
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      });

      const { rerender } = render(
        <MemoryRouter>
          <AuthContext.Provider value={createMockAuth(userA)}>
            <RequestHistoryPage />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      expect(await screen.findByText('/v1/secret-action')).toBeDefined();

      // Switch to user B (unresolved/delayed fetch)
      vi.spyOn(usageApi, 'getConsumerUsageHistory').mockImplementation(() => new Promise(() => {}));

      rerender(
        <MemoryRouter>
          <AuthContext.Provider value={createMockAuth(userB)}>
            <RequestHistoryPage />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      // User A's request log must not be rendered
      expect(screen.queryByText('/v1/secret-action')).toBeNull();
    });
  });

  describe('UsageQuotaPage account switch isolation', () => {
    it('immediately clears quota details on user switch', async () => {
      vi.spyOn(usageApi, 'getConsumerUsageSummary').mockResolvedValue({
        subscriptions: [
          {
            id: 'sub_quota_secret_A',
            apiId: '42',
            status: 'Active',
            quotaLimit: '9999999',
            quotaUsed: '12345',
            remainingRequests: '9987654',
            periodStart: '2026-11-01',
            periodEnd: '2026-12-01',
          },
        ],
        daily: [],
      });

      const { rerender } = render(
        <MemoryRouter>
          <AuthContext.Provider value={createMockAuth(userA)}>
            <UsageQuotaPage />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      expect(await screen.findByTestId('subscription-usage-card-sub_quota_secret_A')).toBeDefined();

      // Switch to user B (unresolved/delayed fetch)
      vi.spyOn(usageApi, 'getConsumerUsageSummary').mockImplementation(() => new Promise(() => {}));

      rerender(
        <MemoryRouter>
          <AuthContext.Provider value={createMockAuth(userB)}>
            <UsageQuotaPage />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      expect(screen.queryByTestId('subscription-usage-card-sub_quota_secret_A')).toBeNull();
    });
  });

  describe('ProviderDashboardPage account switch isolation', () => {
    it('immediately prevents rendering user A provider analytics on user switch', async () => {
      vi.spyOn(providerApi, 'getProviderVerification').mockResolvedValue({
        providerId: 'usr_tenant_A',
        status: 'Verified',
        organizationName: 'Provider Alpha Ltd',
        businessRegNumber: '123456789',
        taxCode: 'TAX999',
        contactEmail: 'providerA@example.com',
        submittedAt: '2026-11-01T00:00:00Z',
        reviewedAt: '2026-11-01T00:00:00Z',
        rejectReason: null,
      });

      vi.spyOn(providerApi, 'listProviderApis').mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
      });

      vi.spyOn(usageApi, 'getProviderAnalyticsOverview').mockResolvedValue({
        requests: {
          requestCount: '888888',
          successCount: '888880',
          errorCount: '8',
          averageLatencyMs: 35,
        },
        daily: [],
        revenue: [{ currency: 'VND', amount: '999999999' }],
        activeSubscribers: '150',
      });

      const providerUserA: User = { ...userA, role: 'API_PROVIDER' };
      const providerUserB: User = { ...userB, role: 'API_PROVIDER' };

      const { rerender } = render(
        <MemoryRouter>
          <AuthContext.Provider value={createMockAuth(providerUserA)}>
            <ProviderDashboardPage />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      expect(await screen.findByText('888.888')).toBeDefined();

      // Switch to provider B (unresolved/delayed fetch)
      vi.spyOn(usageApi, 'getProviderAnalyticsOverview').mockImplementation(() => new Promise(() => {}));

      rerender(
        <MemoryRouter>
          <AuthContext.Provider value={createMockAuth(providerUserB)}>
            <ProviderDashboardPage />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      // User A's 888.888 requests must not be rendered
      expect(screen.queryByText('888.888')).toBeNull();
    });
  });

  describe('Delayed response & race condition rejection', () => {
    it('discards delayed response from user A arriving after user B is already active', async () => {
      let delayedResolveUserA: any;
      const delayedPromiseUserA = new Promise((resolve) => {
        delayedResolveUserA = resolve;
      });

      vi.spyOn(usageApi, 'getConsumerUsageSummary').mockImplementation((_params, signal) => {
        if (!signal?.aborted) {
          return delayedPromiseUserA as any;
        }
        return Promise.reject(new DOMException('Aborted', 'AbortError'));
      });

      const { rerender } = render(
        <MemoryRouter>
          <AuthContext.Provider value={createMockAuth(userA)}>
            <UsageQuotaPage />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      // User A is waiting for data, now user switches to user B
      vi.spyOn(usageApi, 'getConsumerUsageSummary').mockResolvedValue({
        subscriptions: [
          {
            id: 'sub_quota_user_B',
            apiId: '99',
            status: 'Active',
            quotaLimit: '2000',
            quotaUsed: '20',
            remainingRequests: '1980',
            periodStart: '2026-11-01',
            periodEnd: '2026-12-01',
          },
        ],
        daily: [],
      });

      rerender(
        <MemoryRouter>
          <AuthContext.Provider value={createMockAuth(userB)}>
            <UsageQuotaPage />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      // Now User A's delayed promise unexpectedly resolves
      delayedResolveUserA({
        subscriptions: [
          {
            id: 'sub_quota_stale_A',
            apiId: '10',
            status: 'Active',
            quotaLimit: '999999',
            quotaUsed: '99999',
            remainingRequests: '900000',
            periodStart: '2026-11-01',
            periodEnd: '2026-12-01',
          },
        ],
        daily: [],
      });

      // User B should see User B's quota card, and NEVER User A's stale card
      expect(await screen.findByTestId('subscription-usage-card-sub_quota_user_B')).toBeDefined();
      expect(screen.queryByTestId('subscription-usage-card-sub_quota_stale_A')).toBeNull();
    });
  });

  describe('Logout & session invalidation', () => {
    it('immediately blanks out data when user logs out', async () => {
      vi.spyOn(billingApi, 'listSubscriptions').mockResolvedValue({
        items: [
          {
            id: 'sub_to_be_cleared_on_logout',
            apiId: '1',
            consumerId: 'usr_tenant_A',
            planId: 'plan_1',
            status: 'Active',
            currentPeriodStart: '2026-11-01T00:00:00Z',
            currentPeriodEnd: '2026-12-01T00:00:00Z',
            quotaResetAt: '2026-12-01T00:00:00Z',
            expiresAt: null,
            cancelAtPeriodEnd: false,
            canceledAt: null,
            expiredAt: null,
            quotaLimit: '50000',
            quotaUsed: '100',
            rateLimitPerMinute: 60,
            priceAmount: '0',
            priceCurrency: 'VND',
            createdAt: '2026-11-01T00:00:00Z',
            updatedAt: '2026-11-01T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
      });

      const { rerender } = render(
        <MemoryRouter>
          <AuthContext.Provider value={createMockAuth(userA)}>
            <MySubscriptionsPage />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      expect(await screen.findByText(/sub_to_be_cleared_on_logout/)).toBeDefined();

      // Logout (currentUser = null)
      rerender(
        <MemoryRouter>
          <AuthContext.Provider value={createMockAuth(null)}>
            <MySubscriptionsPage />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      expect(screen.queryByText(/sub_to_be_cleared_on_logout/)).toBeNull();
    });
  });
});
