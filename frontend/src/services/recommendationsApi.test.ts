import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  buildRecommendationSearchParams,
  getPersonalizedRecommendations,
  updateRecommendationPreferences,
  submitRecommendationAction,
  executeRecommendationSwitch,
} from './recommendationsApi';
import * as authApi from './authApi';

vi.mock('./authApi', () => ({
  authenticatedRequest: vi.fn(),
}));

describe('recommendationsApi service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds valid query parameters and strips invalid API IDs', () => {
    const params = buildRecommendationSearchParams({
      sourceApiId: '12',
      status: 'saved',
      priorityMode: 'cost_saving',
      limit: 10,
    });
    expect(params.toString()).toBe('sourceApiId=12&status=saved&priorityMode=cost_saving&limit=10');

    const bad = buildRecommendationSearchParams({ sourceApiId: 'abc', limit: 999 });
    expect(bad.toString()).toBe('');
  });

  it('calls GET /api/consumer/recommendations and unwraps data', async () => {
    const payload = {
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
      usageInsights: [],
      items: [],
    };
    vi.mocked(authApi.authenticatedRequest).mockResolvedValueOnce({ data: payload });

    const res = await getPersonalizedRecommendations({ status: 'active' });
    expect(authApi.authenticatedRequest).toHaveBeenCalledWith(
      '/api/consumer/recommendations?status=active',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(res).toEqual(payload);
  });

  it('calls PUT /api/consumer/recommendations/preferences', async () => {
    const input = {
      priorityMode: 'deals_only' as const,
      minUsageDays: 5,
      minSavingsPercent: 15,
      onlyVerifiedProviders: true,
      onlyActiveDeals: true,
      autoNotifyDeals: false,
      preferredMigrationMode: 'parallel' as const,
    };
    vi.mocked(authApi.authenticatedRequest).mockResolvedValueOnce({
      data: { ...input, updatedAt: '2026-11-17T00:00:00.000Z' },
    });

    const res = await updateRecommendationPreferences(input);
    expect(authApi.authenticatedRequest).toHaveBeenCalledWith(
      '/api/consumer/recommendations/preferences',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    );
    expect(res.priorityMode).toBe('deals_only');
  });

  it('calls POST /api/consumer/recommendations/actions and /switch', async () => {
    vi.mocked(authApi.authenticatedRequest).mockResolvedValueOnce({
      data: {
        sourceApiId: '1',
        recommendedApiId: '2',
        userState: { action: 'snoozed', reason: null, snoozedUntil: '2026-11-24T00:00:00.000Z', updatedAt: null },
      },
    });
    const act = await submitRecommendationAction({
      sourceApiId: '1',
      recommendedApiId: '2',
      action: 'snoozed',
      snoozeDays: 7,
    });
    expect(act.userState.action).toBe('snoozed');

    vi.mocked(authApi.authenticatedRequest).mockResolvedValueOnce({
      data: {
        migrationMode: 'cancel_at_period_end',
        requiresCheckout: true,
        newSubscription: { id: '55', apiId: '2', planId: '202', status: 'Pending' },
        canceledSourceSubscription: { id: '10', cancelAtPeriodEnd: true },
      },
    });
    const sw = await executeRecommendationSwitch({
      sourceApiId: '1',
      recommendedApiId: '2',
      targetPlanId: '202',
      migrationMode: 'cancel_at_period_end',
      sourceSubscriptionId: '10',
    });
    expect(sw.requiresCheckout).toBe(true);
    expect(sw.newSubscription.id).toBe('55');
  });
});
