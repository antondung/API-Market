import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PersonalizedRecommendationsPage } from './PersonalizedRecommendationsPage';
import * as recommendationsApi from '../../services/recommendationsApi';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

let mockUser: { id: string; email: string; name: string; role: string } | null = {
  id: '2',
  email: 'user@example.com',
  name: 'Demo User',
  role: 'USER',
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: mockUser,
    isAuthenticated: Boolean(mockUser),
  }),
  useOptionalAuth: () => ({
    currentUser: mockUser,
    isAuthenticated: Boolean(mockUser),
  }),
}));

vi.mock('../../i18n', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

function makeMockResponse(overrides: Partial<recommendationsApi.RecommendationListResponse> = {}): recommendationsApi.RecommendationListResponse {
  const item: recommendationsApi.PersonalizedRecommendationItem = {
    id: '3->4',
    sourceApi: {
      id: '3',
      name: 'Product Catalog API',
      category: 'Commerce',
      currentSubscriptionId: '10',
      currentPlanId: '101',
      currentPlanName: 'Basic',
      currentPriceMonthly: 99000,
      currency: 'VND',
      quotaLimit: 10000,
      quotaUsed: 42,
      rateLimitPerMinute: 50,
      daysUsed: 14,
      activeUsageDays: 14,
      totalRequests: 42,
      avgLatencyMs: 53,
      errorRatePercent: 9.52,
      successRatePercent: 90.48,
    },
    recommendedApi: {
      id: '4',
      name: 'Smart Commerce Catalog Pro API',
      description: 'API danh mục tối ưu tốc độ cao',
      category: 'Commerce',
      tags: ['product', 'catalog', 'deal'],
      providerId: '2',
      providerName: 'Demo Provider Two',
      providerStatus: 'Verified',
      publishedAt: '2026-11-01T00:00:00.000Z',
    },
    recommendedPlan: {
      id: '202',
      name: 'Basic',
      priceMonthly: 69000,
      effectivePriceMonthly: 51750,
      currency: 'VND',
      quota: 20000,
      rateLimit: 120,
      hasActiveDeal: true,
      promotion: {
        id: '1',
        title: 'Ưu đãi chuyển đổi gói Thương mại - Giảm 25%',
        badgeText: 'DEAL GIẢM 25%',
        discountPercent: 25,
        promoPriceMonthly: 51750,
        expiresAt: '2026-12-31T00:00:00.000Z',
      },
    },
    candidatePlans: [
      {
        id: '201',
        name: 'Free',
        priceMonthly: 0,
        effectivePriceMonthly: 0,
        currency: 'VND',
        quota: 2500,
        rateLimit: 30,
        hasActiveDeal: false,
        promotion: null,
      },
      {
        id: '202',
        name: 'Basic',
        priceMonthly: 69000,
        effectivePriceMonthly: 51750,
        currency: 'VND',
        quota: 20000,
        rateLimit: 120,
        hasActiveDeal: true,
        promotion: {
          id: '1',
          title: 'Ưu đãi chuyển đổi gói Thương mại - Giảm 25%',
          badgeText: 'DEAL GIẢM 25%',
          discountPercent: 25,
          promoPriceMonthly: 51750,
          expiresAt: '2026-12-31T00:00:00.000Z',
        },
      },
    ],
    comparison: {
      originalPriceMonthly: 69000,
      effectivePriceMonthly: 51750,
      currency: 'VND',
      monthlySavingsAmount: 47250,
      savingsPercent: 47.73,
      hasActiveDeal: true,
      candidateAvgLatencyMs: 18,
      latencyImprovementMs: 35,
      latencyImprovementPercent: 66,
      candidateSuccessRatePercent: 99.8,
      reliabilityGainPercent: 9.32,
      quotaMultiplier: 2,
      rateLimitMultiplier: 2.4,
    },
    matchScore: 95,
    reasons: [
      {
        code: 'DEAL_PROMOTION',
        label: 'DEAL GIẢM 25%',
        detail: 'Giảm 25% so với giá niêm yết.',
      },
      {
        code: 'BETTER_LATENCY',
        label: 'Nhanh hơn 66%',
        detail: '18ms so với 53ms.',
      },
    ],
    userState: {
      action: null,
      reason: null,
      snoozedUntil: null,
      updatedAt: null,
    },
    availableOptions: ['switch_cancel_at_period_end', 'switch_parallel', 'switch_immediate', 'compare', 'save', 'snooze', 'dismiss'],
  };

  return {
    preferences: {
      priorityMode: 'balanced',
      minUsageDays: 3,
      minSavingsPercent: 5,
      onlyVerifiedProviders: false,
      onlyActiveDeals: false,
      autoNotifyDeals: true,
      preferredMigrationMode: 'cancel_at_period_end',
      updatedAt: null,
    },
    summary: {
      totalSourceApisAnalyzed: 1,
      eligibleSourceApis: 1,
      totalRecommendations: 1,
      activeDealsCount: 1,
      potentialMonthlySavings: [{ currency: 'VND', amount: 47250 }],
      averageLatencyImprovementPercent: 66,
    },
    usageInsights: [
      {
        apiId: '3',
        apiName: 'Product Catalog API',
        category: 'Commerce',
        tags: ['product', 'catalog'],
        currentSubscriptionId: '10',
        currentSubscriptionStatus: 'Active',
        currentPlanId: '101',
        currentPlanName: 'Basic',
        currentPriceMonthly: 99000,
        currency: 'VND',
        quotaUsed: 42,
        quotaLimit: 10000,
        quotaUtilizationPercent: 0.4,
        rateLimitPerMinute: 50,
        daysUsed: 14,
        activeUsageDays: 14,
        totalRequests: 42,
        avgLatencyMs: 53,
        errorRatePercent: 9.52,
        successRatePercent: 90.48,
        firstUsedAt: '2026-11-01T00:00:00.000Z',
        lastUsedAt: '2026-11-14T00:00:00.000Z',
        meetsUsageTenureThreshold: true,
      },
    ],
    items: [item],
    ...overrides,
  };
}

describe('PersonalizedRecommendationsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = {
      id: '2',
      email: 'user@example.com',
      name: 'Demo User',
      role: 'USER',
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('blocks ADMIN accounts via consumer role guard without fetching recommendations', () => {
    mockUser = { id: '1', email: 'admin@example.com', name: 'Admin', role: 'ADMIN' };
    const spy = vi.spyOn(recommendationsApi, 'getPersonalizedRecommendations');

    render(
      <MemoryRouter>
        <PersonalizedRecommendationsPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('consumer-role-guard')).toBeDefined();
    expect(spy).not.toHaveBeenCalled();
  });

  it('renders recommendations with deal badge, savings, latency comparison, and options', async () => {
    vi.spyOn(recommendationsApi, 'getPersonalizedRecommendations').mockResolvedValue(makeMockResponse());

    render(
      <MemoryRouter>
        <PersonalizedRecommendationsPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Smart Commerce Catalog Pro API')).toBeDefined();
    expect(screen.getAllByText('DEAL GIẢM 25%').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/47\.73%/)).toBeDefined();
    expect(screen.getByText(/Phù hợp 95\/100/)).toBeDefined();
    expect(screen.getByTestId('switch-btn-4')).toBeDefined();
    expect(screen.getByTestId('compare-btn-4')).toBeDefined();
    expect(screen.getByTestId('save-btn-4')).toBeDefined();
    expect(screen.getByTestId('snooze-btn-4')).toBeDefined();
    expect(screen.getByTestId('dismiss-btn-4')).toBeDefined();
  });

  it('supports switching API with migration option and redirects to checkout for paid plans', async () => {
    vi.spyOn(recommendationsApi, 'getPersonalizedRecommendations').mockResolvedValue(makeMockResponse());
    const switchSpy = vi.spyOn(recommendationsApi, 'executeRecommendationSwitch').mockResolvedValue({
      migrationMode: 'parallel',
      requiresCheckout: true,
      newSubscription: { id: '777', apiId: '4', planId: '202', status: 'Pending' },
      canceledSourceSubscription: null,
    });

    render(
      <MemoryRouter>
        <PersonalizedRecommendationsPage />
      </MemoryRouter>,
    );

    await screen.findByTestId('switch-btn-4');
    fireEvent.click(screen.getByTestId('switch-btn-4'));

    const parallelRadio = await screen.findByLabelText(/Chạy song song cả 2 API/);
    fireEvent.click(parallelRadio);
    fireEvent.click(screen.getByTestId('confirm-switch-btn'));

    await waitFor(() => {
      expect(switchSpy).toHaveBeenCalledWith({
        sourceApiId: '3',
        recommendedApiId: '4',
        targetPlanId: '202',
        migrationMode: 'parallel',
        sourceSubscriptionId: '10',
      });
    });

    expect(mockedNavigate).toHaveBeenCalledWith('/checkout/4/202', {
      state: { resumeSubscriptionId: '777' },
    });
  });

  it('supports saving, snoozing, dismissing with reason, and updating preferences', async () => {
    vi.spyOn(recommendationsApi, 'getPersonalizedRecommendations').mockResolvedValue(makeMockResponse());
    const actionSpy = vi.spyOn(recommendationsApi, 'submitRecommendationAction').mockResolvedValue({
      sourceApiId: '3',
      recommendedApiId: '4',
      userState: { action: 'saved', reason: null, snoozedUntil: null, updatedAt: null },
    });
    const prefSpy = vi.spyOn(recommendationsApi, 'updateRecommendationPreferences').mockResolvedValue({
      priorityMode: 'cost_saving',
      minUsageDays: 7,
      minSavingsPercent: 20,
      onlyVerifiedProviders: true,
      onlyActiveDeals: true,
      autoNotifyDeals: true,
      preferredMigrationMode: 'cancel_at_period_end',
      updatedAt: '2026-11-17T00:00:00.000Z',
    });

    render(
      <MemoryRouter>
        <PersonalizedRecommendationsPage />
      </MemoryRouter>,
    );

    await screen.findByTestId('save-btn-4');
    fireEvent.click(screen.getByTestId('save-btn-4'));
    await waitFor(() => {
      expect(actionSpy).toHaveBeenCalledWith({
        sourceApiId: '3',
        recommendedApiId: '4',
        action: 'saved',
        reason: undefined,
        snoozeDays: undefined,
      });
    });

    fireEvent.click(screen.getByTestId('dismiss-btn-4'));
    await screen.findByTestId('confirm-dismiss-btn');
    fireEvent.click(screen.getByTestId('confirm-dismiss-btn'));
    await waitFor(() => {
      expect(actionSpy).toHaveBeenCalledWith({
        sourceApiId: '3',
        recommendedApiId: '4',
        action: 'dismissed',
        reason: 'Đang hài lòng với API hiện tại',
        snoozeDays: undefined,
      });
    });

    fireEvent.click(screen.getByTestId('open-preferences-btn'));
    await screen.findByTestId('preferences-form');
    fireEvent.submit(screen.getByTestId('preferences-form'));
    await waitFor(() => {
      expect(prefSpy).toHaveBeenCalled();
    });
  });

  it('opens quick comparison modal and navigates to full compare page', async () => {
    vi.spyOn(recommendationsApi, 'getPersonalizedRecommendations').mockResolvedValue(makeMockResponse());

    render(
      <MemoryRouter>
        <PersonalizedRecommendationsPage />
      </MemoryRouter>,
    );

    await screen.findByTestId('compare-btn-4');
    fireEvent.click(screen.getByTestId('compare-btn-4'));

    const fullCompareBtn = await screen.findByRole('button', { name: /Mở trang so sánh đầy đủ/ });
    fireEvent.click(fullCompareBtn);
    expect(mockedNavigate).toHaveBeenCalledWith('/compare?api1=3&api2=4');
  });
});
