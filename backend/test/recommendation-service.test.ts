import test from 'node:test';
import assert from 'node:assert/strict';
import SwaggerParser from '@apidevtools/swagger-parser';
import { openapi } from '../src/openapi.js';
import { recommendationPaths } from '../src/recommendation-contract.js';
import {
  DEFAULT_RECOMMENDATION_PREFERENCES,
  RecommendationService,
  buildRecommendationsFromData,
  evaluateRecommendationCandidate,
  recommendationActionInputSchema,
  recommendationPreferencesInputSchema,
  recommendationQuerySchema,
  recommendationSwitchInputSchema,
  resolveEffectiveUserState,
  selectBestPlanForSource,
  type CandidateApiProfile,
  type ConsumerUsageInsight,
  type RecommendationPreferences,
} from '../src/recommendation-service.js';

function makeSource(overrides: Partial<ConsumerUsageInsight> = {}): ConsumerUsageInsight {
  return {
    apiId: '1',
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
    lastUsedAt: '2026-11-14T12:00:00.000Z',
    meetsUsageTenureThreshold: true,
    ...overrides,
  };
}

function makeCandidate(overrides: Partial<CandidateApiProfile> = {}): CandidateApiProfile {
  return {
    id: '2',
    name: 'Smart Commerce Catalog Pro API',
    description: 'High speed catalog API',
    category: 'Commerce',
    tags: ['product', 'catalog', 'deal'],
    publishedAt: '2026-11-01T00:00:00.000Z',
    providerId: '2',
    providerName: 'Provider Two',
    providerStatus: 'Verified',
    avgLatencyMs: 18,
    successRatePercent: 99.8,
    totalRequests: 7000,
    activeSubscribers: 14,
    plans: [
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
          title: 'Deal giảm 25% tháng đầu',
          badgeText: 'DEAL GIẢM 25%',
          discountPercent: 25,
          promoPriceMonthly: 51750,
          expiresAt: '2026-12-31T00:00:00.000Z',
        },
      },
    ],
    ...overrides,
  };
}

test('evaluateRecommendationCandidate calculates deal savings, latency improvement and reasons accurately', () => {
  const source = makeSource();
  const candidate = makeCandidate();
  const result = evaluateRecommendationCandidate({
    source,
    candidate,
    preferences: DEFAULT_RECOMMENDATION_PREFERENCES,
    effectiveMode: 'balanced',
    userState: { action: null, reason: null, snoozedUntil: null, updatedAt: null },
  });

  assert.ok(result);
  assert.equal(result.recommendedPlan.id, '202');
  assert.equal(result.comparison.originalPriceMonthly, 69000);
  assert.equal(result.comparison.effectivePriceMonthly, 51750);
  assert.equal(result.comparison.monthlySavingsAmount, 47250);
  assert.equal(result.comparison.savingsPercent, 47.73);
  assert.equal(result.comparison.hasActiveDeal, true);
  assert.equal(result.comparison.latencyImprovementMs, 35);
  assert.equal(result.comparison.latencyImprovementPercent, 66);
  assert.equal(result.comparison.reliabilityGainPercent, 9.32);
  assert.equal(result.comparison.quotaMultiplier, 2);
  assert.equal(result.comparison.rateLimitMultiplier, 2.4);
  assert.ok(result.matchScore >= 70);

  const codes = result.reasons.map((r) => r.code);
  assert.ok(codes.includes('DEAL_PROMOTION'));
  assert.ok(codes.includes('CHEAPER_PRICE'));
  assert.ok(codes.includes('BETTER_LATENCY'));
  assert.ok(codes.includes('HIGHER_RELIABILITY'));
  assert.ok(codes.includes('USAGE_TENURE_OPTIMIZATION'));
});

test('selectBestPlanForSource skips plans unable to cover consumer actual usage', () => {
  const source = makeSource({ totalRequests: 5000, quotaUsed: 5000 });
  const candidate = makeCandidate();
  const chosen = selectBestPlanForSource(source, candidate.plans);
  assert.equal(chosen?.id, '202');
});

test('buildRecommendationsFromData enforces minUsageDays, priorityMode, deals_only, verified filter and user state lifecycle', () => {
  const shortTenureSource = makeSource({ apiId: '1', daysUsed: 1, meetsUsageTenureThreshold: false });
  const longTenureSource = makeSource({ apiId: '1', daysUsed: 14 });
  const dealCandidate = makeCandidate({ id: '2' });
  const qualityNoDealCandidate = makeCandidate({
    id: '3',
    name: 'Ultra Fast Commerce API',
    providerStatus: 'Pending',
    avgLatencyMs: 8,
    successRatePercent: 99.95,
    plans: [
      {
        id: '301',
        name: 'Basic',
        priceMonthly: 85000,
        effectivePriceMonthly: 85000,
        currency: 'VND',
        quota: 30000,
        rateLimit: 200,
        hasActiveDeal: false,
        promotion: null,
      },
    ],
  });

  // Below minUsageDays -> no recommendations
  const tooEarly = buildRecommendationsFromData({
    usageInsights: [shortTenureSource],
    candidates: [dealCandidate, qualityNoDealCandidate],
    liveSubscribedApiIds: new Set(['1']),
    actionsMap: new Map(),
    preferences: DEFAULT_RECOMMENDATION_PREFERENCES,
    query: recommendationQuerySchema.parse({}),
  });
  assert.equal(tooEarly.summary.eligibleSourceApis, 0);
  assert.equal(tooEarly.items.length, 0);

  // deals_only excludes candidate without active deal
  const dealsOnly = buildRecommendationsFromData({
    usageInsights: [longTenureSource],
    candidates: [dealCandidate, qualityNoDealCandidate],
    liveSubscribedApiIds: new Set(['1']),
    actionsMap: new Map(),
    preferences: DEFAULT_RECOMMENDATION_PREFERENCES,
    query: recommendationQuerySchema.parse({ priorityMode: 'deals_only' }),
  });
  assert.deepEqual(dealsOnly.items.map((i) => i.recommendedApi.id), ['2']);

  // onlyVerifiedProviders excludes Pending provider
  const verifiedPrefs: RecommendationPreferences = {
    ...DEFAULT_RECOMMENDATION_PREFERENCES,
    onlyVerifiedProviders: true,
  };
  const verifiedOnly = buildRecommendationsFromData({
    usageInsights: [longTenureSource],
    candidates: [dealCandidate, qualityNoDealCandidate],
    liveSubscribedApiIds: new Set(['1']),
    actionsMap: new Map(),
    preferences: verifiedPrefs,
    query: recommendationQuerySchema.parse({}),
  });
  assert.deepEqual(verifiedOnly.items.map((i) => i.recommendedApi.id), ['2']);

  // Saved items appear in both active and saved; dismissed/snoozed are hidden from active
  const actionsMap = new Map([
    ['1:2', { action: 'saved' as const, reason: null, snoozedUntil: null, updatedAt: '2026-11-15T00:00:00.000Z' }],
    ['1:3', { action: 'dismissed' as const, reason: 'No need', snoozedUntil: null, updatedAt: '2026-11-15T00:00:00.000Z' }],
  ]);
  const activeWithSaved = buildRecommendationsFromData({
    usageInsights: [longTenureSource],
    candidates: [dealCandidate, qualityNoDealCandidate],
    liveSubscribedApiIds: new Set(['1']),
    actionsMap,
    preferences: DEFAULT_RECOMMENDATION_PREFERENCES,
    query: recommendationQuerySchema.parse({ status: 'active' }),
  });
  assert.deepEqual(activeWithSaved.items.map((i) => i.recommendedApi.id), ['2']);

  const dismissedView = buildRecommendationsFromData({
    usageInsights: [longTenureSource],
    candidates: [dealCandidate, qualityNoDealCandidate],
    liveSubscribedApiIds: new Set(['1']),
    actionsMap,
    preferences: DEFAULT_RECOMMENDATION_PREFERENCES,
    query: recommendationQuerySchema.parse({ status: 'dismissed' }),
  });
  assert.deepEqual(dismissedView.items.map((i) => i.recommendedApi.id), ['3']);
});

test('resolveEffectiveUserState automatically restores expired snoozes', () => {
  const now = new Date('2026-11-17T00:00:00.000Z');
  const expired = resolveEffectiveUserState(
    { action: 'snoozed', reason: null, snoozedUntil: '2026-11-16T00:00:00.000Z', updatedAt: null },
    now,
  );
  assert.equal(expired.action, null);

  const activeSnooze = resolveEffectiveUserState(
    { action: 'snoozed', reason: null, snoozedUntil: '2026-11-24T00:00:00.000Z', updatedAt: null },
    now,
  );
  assert.equal(activeSnooze.action, 'snoozed');
});

test('RecommendationService.switchSubscription supports parallel, cancel_at_period_end, and immediate_cancel', async () => {
  const queries: Array<{ text: string; params: unknown[] }> = [];
  const cancelCalls: Array<{ userId: string; id: string; immediate: boolean }> = [];
  const subscribeCalls: Array<{ userId: string; planId: string }> = [];

  const mockPool = {
    query: async (text: string, params: unknown[] = []) => {
      queries.push({ text, params });
      if (text.includes('FROM api_plans p')) {
        return { rowCount: 1, rows: [{ id: '202', apiId: '2', priceMonthly: 51750 }] };
      }
      if (text.includes('FROM subscriptions')) {
        return { rowCount: 1, rows: [{ id: '10', status: 'Active' }] };
      }
      return { rowCount: 1, rows: [] };
    },
  } as any;

  const mockBilling = {
    subscribe: async (userId: string, planId: string) => {
      subscribeCalls.push({ userId, planId });
      return { id: '99', apiId: '2', planId, status: 'Pending' };
    },
    cancel: async (userId: string, id: string, immediate: boolean) => {
      cancelCalls.push({ userId, id, immediate });
      return { id, status: immediate ? 'Canceled' : 'Active', cancelAtPeriodEnd: true };
    },
  } as any;

  const service = new RecommendationService(mockPool, mockBilling);

  const resEnd = await service.switchSubscription('7', {
    sourceApiId: '1',
    recommendedApiId: '2',
    targetPlanId: '202',
    migrationMode: 'cancel_at_period_end',
    sourceSubscriptionId: '10',
  });
  assert.equal(resEnd.requiresCheckout, true);
  assert.equal(resEnd.migrationMode, 'cancel_at_period_end');
  assert.deepEqual(cancelCalls[0], { userId: '7', id: '10', immediate: false });

  await service.switchSubscription('7', {
    sourceApiId: '1',
    recommendedApiId: '2',
    targetPlanId: '202',
    migrationMode: 'immediate_cancel',
    sourceSubscriptionId: '10',
  });
  assert.deepEqual(cancelCalls[1], { userId: '7', id: '10', immediate: true });

  await service.switchSubscription('7', {
    sourceApiId: '1',
    recommendedApiId: '2',
    targetPlanId: '202',
    migrationMode: 'parallel',
  });
  assert.equal(cancelCalls.length, 2);
  assert.equal(subscribeCalls.length, 3);
  assert.ok(queries.some((q) => q.text.includes("VALUES ($1, $2, $3, 'switched'")));
});

test('Zod schemas reject invalid inputs and recommendation OpenAPI paths pass SwaggerParser.validate', async () => {
  assert.equal(recommendationPreferencesInputSchema.safeParse({ minUsageDays: -1 }).success, false);
  assert.equal(recommendationPreferencesInputSchema.safeParse({ extraField: true }).success, false);
  assert.equal(
    recommendationActionInputSchema.safeParse({ sourceApiId: '1', recommendedApiId: '2', action: 'invalid' }).success,
    false,
  );
  assert.equal(
    recommendationSwitchInputSchema.safeParse({ sourceApiId: '1', recommendedApiId: '2', targetPlanId: 'abc' }).success,
    false,
  );

  const spec = {
    ...openapi,
    paths: {
      ...openapi.paths,
      ...recommendationPaths,
    },
  };
  await SwaggerParser.validate(structuredClone(spec) as any);
});
