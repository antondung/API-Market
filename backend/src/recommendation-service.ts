import type { Pool } from 'pg';
import { z } from 'zod';
import { ApiError } from './auth.js';
import type { BillingService } from './billing-service.js';
import { marketplaceId } from './marketplace-service.js';

export const priorityModeSchema = z.enum(['balanced', 'cost_saving', 'high_quality', 'deals_only']);
export const migrationModeSchema = z.enum(['parallel', 'cancel_at_period_end', 'immediate_cancel']);
export const recommendationStatusFilterSchema = z.enum(['active', 'saved', 'snoozed', 'dismissed', 'switched', 'all']);

export type PriorityMode = z.infer<typeof priorityModeSchema>;
export type MigrationMode = z.infer<typeof migrationModeSchema>;
export type RecommendationStatusFilter = z.infer<typeof recommendationStatusFilterSchema>;
export type RecommendationActionType = 'saved' | 'snoozed' | 'dismissed' | 'switched' | 'restore';
export type RecommendationReasonCode =
  | 'DEAL_PROMOTION'
  | 'CHEAPER_PRICE'
  | 'BETTER_LATENCY'
  | 'HIGHER_RELIABILITY'
  | 'HIGHER_QUOTA_RATE'
  | 'USAGE_TENURE_OPTIMIZATION';

export const recommendationQuerySchema = z.object({
  sourceApiId: marketplaceId.optional(),
  status: recommendationStatusFilterSchema.default('active'),
  priorityMode: priorityModeSchema.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
}).strict();

export const recommendationPreferencesInputSchema = z.object({
  priorityMode: priorityModeSchema.default('balanced'),
  minUsageDays: z.number().int().min(0).max(365).default(3),
  minSavingsPercent: z.number().int().min(0).max(95).default(5),
  onlyVerifiedProviders: z.boolean().default(false),
  onlyActiveDeals: z.boolean().default(false),
  autoNotifyDeals: z.boolean().default(true),
  preferredMigrationMode: migrationModeSchema.default('cancel_at_period_end'),
}).strict();

const noNul = (value: string) => !value.includes('\0');

export const recommendationActionInputSchema = z.object({
  sourceApiId: marketplaceId,
  recommendedApiId: marketplaceId,
  action: z.enum(['saved', 'snoozed', 'dismissed', 'switched', 'restore']),
  reason: z.string().trim().min(1).max(200).refine(noNul, 'NUL characters are not supported').optional(),
  snoozeDays: z.number().int().min(1).max(90).optional(),
}).strict();

export const recommendationSwitchInputSchema = z.object({
  sourceApiId: marketplaceId,
  recommendedApiId: marketplaceId,
  targetPlanId: marketplaceId,
  migrationMode: migrationModeSchema.default('cancel_at_period_end'),
  sourceSubscriptionId: z.string().regex(/^[1-9]\d{0,18}$/).optional(),
}).strict();

export interface RecommendationPreferences {
  priorityMode: PriorityMode;
  minUsageDays: number;
  minSavingsPercent: number;
  onlyVerifiedProviders: boolean;
  onlyActiveDeals: boolean;
  autoNotifyDeals: boolean;
  preferredMigrationMode: MigrationMode;
  updatedAt: string | null;
}

export interface ConsumerUsageInsight {
  apiId: string;
  apiName: string;
  category: string;
  tags: string[];
  currentSubscriptionId: string | null;
  currentSubscriptionStatus: string | null;
  currentPlanId: string | null;
  currentPlanName: string | null;
  currentPriceMonthly: number;
  currency: string;
  quotaUsed: number;
  quotaLimit: number;
  quotaUtilizationPercent: number;
  rateLimitPerMinute: number;
  daysUsed: number;
  activeUsageDays: number;
  totalRequests: number;
  avgLatencyMs: number | null;
  errorRatePercent: number | null;
  successRatePercent: number | null;
  firstUsedAt: string | null;
  lastUsedAt: string | null;
  meetsUsageTenureThreshold: boolean;
}

export interface RecommendationPromotion {
  id: string;
  title: string;
  badgeText: string;
  discountPercent: number;
  promoPriceMonthly: number;
  expiresAt: string | null;
}

export interface RecommendationPlanOption {
  id: string;
  name: string;
  priceMonthly: number;
  effectivePriceMonthly: number;
  currency: string;
  quota: number;
  rateLimit: number;
  hasActiveDeal: boolean;
  promotion: RecommendationPromotion | null;
}

export interface RecommendationReason {
  code: RecommendationReasonCode;
  label: string;
  detail: string;
}

export interface RecommendationUserState {
  action: 'saved' | 'snoozed' | 'dismissed' | 'switched' | null;
  reason: string | null;
  snoozedUntil: string | null;
  updatedAt: string | null;
}

export interface CandidateApiProfile {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  publishedAt: string | null;
  providerId: string;
  providerName: string;
  providerStatus: 'Pending' | 'Verified' | 'Rejected';
  avgLatencyMs: number | null;
  successRatePercent: number | null;
  totalRequests: number;
  activeSubscribers: number;
  plans: RecommendationPlanOption[];
}

export interface PersonalizedRecommendationItem {
  id: string;
  sourceApi: {
    id: string;
    name: string;
    category: string;
    currentSubscriptionId: string | null;
    currentPlanId: string | null;
    currentPlanName: string | null;
    currentPriceMonthly: number;
    currency: string;
    quotaLimit: number;
    quotaUsed: number;
    rateLimitPerMinute: number;
    daysUsed: number;
    activeUsageDays: number;
    totalRequests: number;
    avgLatencyMs: number | null;
    errorRatePercent: number | null;
    successRatePercent: number | null;
  };
  recommendedApi: {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    providerId: string;
    providerName: string;
    providerStatus: 'Pending' | 'Verified' | 'Rejected';
    publishedAt: string | null;
  };
  recommendedPlan: RecommendationPlanOption;
  candidatePlans: RecommendationPlanOption[];
  comparison: {
    originalPriceMonthly: number;
    effectivePriceMonthly: number;
    currency: string;
    monthlySavingsAmount: number;
    savingsPercent: number;
    hasActiveDeal: boolean;
    candidateAvgLatencyMs: number | null;
    latencyImprovementMs: number | null;
    latencyImprovementPercent: number | null;
    candidateSuccessRatePercent: number | null;
    reliabilityGainPercent: number | null;
    quotaMultiplier: number | null;
    rateLimitMultiplier: number | null;
  };
  matchScore: number;
  reasons: RecommendationReason[];
  userState: RecommendationUserState;
  availableOptions: string[];
}

export interface RecommendationSummary {
  totalSourceApisAnalyzed: number;
  eligibleSourceApis: number;
  totalRecommendations: number;
  activeDealsCount: number;
  potentialMonthlySavings: Array<{ currency: string; amount: number }>;
  averageLatencyImprovementPercent: number | null;
}

export interface RecommendationListResponse {
  preferences: RecommendationPreferences;
  summary: RecommendationSummary;
  usageInsights: ConsumerUsageInsight[];
  items: PersonalizedRecommendationItem[];
}

export const DEFAULT_RECOMMENDATION_PREFERENCES: RecommendationPreferences = {
  priorityMode: 'balanced',
  minUsageDays: 3,
  minSavingsPercent: 5,
  onlyVerifiedProviders: false,
  onlyActiveDeals: false,
  autoNotifyDeals: true,
  preferredMigrationMode: 'cancel_at_period_end',
  updatedAt: null,
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

export function selectBestPlanForSource(
  source: ConsumerUsageInsight,
  plans: RecommendationPlanOption[],
): RecommendationPlanOption | null {
  if (!plans.length) return null;

  const sameCurrencyPlans = plans.filter((p) => p.currency === source.currency);
  const pool = sameCurrencyPlans.length > 0 ? sameCurrencyPlans : plans;
  const requiredQuota = Math.max(1, source.quotaUsed, source.totalRequests);

  const scored = pool.map((plan) => {
    const coversUsage = plan.quota >= requiredQuota;
    const isPaidMatch = source.currentPriceMonthly > 0 ? plan.priceMonthly > 0 : true;
    const savingsRatio =
      source.currentPriceMonthly > 0 && plan.currency === source.currency
        ? (source.currentPriceMonthly - plan.effectivePriceMonthly) / source.currentPriceMonthly
        : 0;

    let rank = 0;
    if (coversUsage) rank += 40;
    if (isPaidMatch) rank += 15;
    if (plan.hasActiveDeal) rank += 22;
    if (source.currentPriceMonthly > 0) {
      rank += Math.max(-30, Math.min(40, savingsRatio * 50));
    } else if (plan.effectivePriceMonthly === 0) {
      rank += 25;
    }
    if (source.quotaLimit > 0 && plan.quota >= source.quotaLimit) rank += 10;
    if (source.rateLimitPerMinute > 0 && plan.rateLimit >= source.rateLimitPerMinute) rank += 8;
    return { plan, rank };
  });

  scored.sort((a, b) => b.rank - a.rank || a.plan.effectivePriceMonthly - b.plan.effectivePriceMonthly);
  return scored[0]?.plan ?? null;
}

export function resolveEffectiveUserState(
  state: RecommendationUserState | undefined,
  now = new Date(),
): RecommendationUserState {
  if (!state) {
    return { action: null, reason: null, snoozedUntil: null, updatedAt: null };
  }
  if (state.action === 'snoozed' && state.snoozedUntil) {
    const expires = new Date(state.snoozedUntil).getTime();
    if (Number.isFinite(expires) && expires <= now.getTime()) {
      return { action: null, reason: null, snoozedUntil: null, updatedAt: state.updatedAt };
    }
  }
  return state;
}

export function evaluateRecommendationCandidate(params: {
  source: ConsumerUsageInsight;
  candidate: CandidateApiProfile;
  preferences: RecommendationPreferences;
  effectiveMode: PriorityMode;
  userState: RecommendationUserState;
}): PersonalizedRecommendationItem | null {
  const { source, candidate, preferences, effectiveMode, userState } = params;
  if (source.apiId === candidate.id) return null;

  const sameCategory = source.category.trim().toLowerCase() === candidate.category.trim().toLowerCase();
  const sourceTagSet = new Set(source.tags.map(normalizeTag));
  const sharedTags = candidate.tags.map(normalizeTag).filter((tag) => sourceTagSet.has(tag));
  if (!sameCategory && sharedTags.length === 0) {
    return null;
  }

  if (preferences.onlyVerifiedProviders && candidate.providerStatus !== 'Verified') {
    return null;
  }

  const recommendedPlan = selectBestPlanForSource(source, candidate.plans);
  if (!recommendedPlan) return null;

  const hasActiveDeal = recommendedPlan.hasActiveDeal;
  if ((preferences.onlyActiveDeals || effectiveMode === 'deals_only') && !hasActiveDeal) {
    return null;
  }

  const sameCurrency = recommendedPlan.currency === source.currency;
  const originalPriceMonthly = recommendedPlan.priceMonthly;
  const effectivePriceMonthly = recommendedPlan.effectivePriceMonthly;
  const monthlySavingsAmount =
    sameCurrency && source.currentPriceMonthly > 0
      ? round2(Math.max(0, source.currentPriceMonthly - effectivePriceMonthly))
      : 0;
  const savingsPercent =
    sameCurrency && source.currentPriceMonthly > 0
      ? round2(((source.currentPriceMonthly - effectivePriceMonthly) / source.currentPriceMonthly) * 100)
      : 0;

  const latencyImprovementMs =
    source.avgLatencyMs !== null && candidate.avgLatencyMs !== null
      ? round1(source.avgLatencyMs - candidate.avgLatencyMs)
      : null;
  const latencyImprovementPercent =
    source.avgLatencyMs !== null && source.avgLatencyMs > 0 && candidate.avgLatencyMs !== null
      ? round1(((source.avgLatencyMs - candidate.avgLatencyMs) / source.avgLatencyMs) * 100)
      : null;

  const reliabilityGainPercent =
    source.successRatePercent !== null && candidate.successRatePercent !== null
      ? round2(candidate.successRatePercent - source.successRatePercent)
      : null;

  const quotaMultiplier =
    source.quotaLimit > 0 ? round2(recommendedPlan.quota / source.quotaLimit) : null;
  const rateLimitMultiplier =
    source.rateLimitPerMinute > 0 ? round2(recommendedPlan.rateLimit / source.rateLimitPerMinute) : null;

  // Evaluate whether the candidate actually beats the source on cost, deal, or quality.
  const isCheaperOrEqual =
    sameCurrency && (source.currentPriceMonthly === 0 ? effectivePriceMonthly === 0 : effectivePriceMonthly <= source.currentPriceMonthly);
  const significantQualityGain =
    (latencyImprovementPercent !== null && latencyImprovementPercent >= 15) ||
    (reliabilityGainPercent !== null && reliabilityGainPercent >= 2) ||
    (quotaMultiplier !== null && quotaMultiplier >= 1.5);

  if (source.currentPriceMonthly > 0) {
    if (effectiveMode === 'cost_saving' || effectiveMode === 'deals_only') {
      if (savingsPercent < preferences.minSavingsPercent) return null;
    } else if (effectiveMode === 'balanced') {
      const meetsSavings = savingsPercent >= preferences.minSavingsPercent;
      const meetsQualityAlternative = isCheaperOrEqual && significantQualityGain;
      if (!meetsSavings && !meetsQualityAlternative) return null;
    } else if (effectiveMode === 'high_quality') {
      const hasQualityEdge =
        (latencyImprovementPercent !== null && latencyImprovementPercent >= 10) ||
        (reliabilityGainPercent !== null && reliabilityGainPercent >= 1) ||
        (quotaMultiplier !== null && quotaMultiplier >= 1.4);
      const withinBudgetTolerance =
        sameCurrency ? effectivePriceMonthly <= source.currentPriceMonthly * 1.15 : true;
      if (!hasQualityEdge || !withinBudgetTolerance) return null;
    }
  } else {
    const hasFreeAdvantage =
      hasActiveDeal ||
      significantQualityGain ||
      (rateLimitMultiplier !== null && rateLimitMultiplier >= 1.25);
    if (!hasFreeAdvantage) return null;
  }

  // Build transparent, user-facing reasons
  const reasons: RecommendationReason[] = [];
  if (hasActiveDeal && recommendedPlan.promotion) {
    reasons.push({
      code: 'DEAL_PROMOTION',
      label: recommendedPlan.promotion.badgeText,
      detail: `${recommendedPlan.promotion.title} (giảm ${recommendedPlan.promotion.discountPercent}% từ ${originalPriceMonthly.toLocaleString('en-US')} còn ${effectivePriceMonthly.toLocaleString('en-US')} ${recommendedPlan.currency}/tháng).`,
    });
  }
  if (monthlySavingsAmount > 0 && savingsPercent > 0) {
    reasons.push({
      code: 'CHEAPER_PRICE',
      label: `Tiết kiệm ${savingsPercent}% chi phí`,
      detail: `Giảm ${monthlySavingsAmount.toLocaleString('en-US')} ${recommendedPlan.currency}/tháng so với gói ${source.currentPlanName ?? 'hiện tại'} (${source.currentPriceMonthly.toLocaleString('en-US')} ${source.currency}).`,
    });
  }
  if (latencyImprovementMs !== null && latencyImprovementMs > 0 && latencyImprovementPercent !== null) {
    reasons.push({
      code: 'BETTER_LATENCY',
      label: `Nhanh hơn ${latencyImprovementPercent}%`,
      detail: `Độ trễ trung bình ${candidate.avgLatencyMs}ms so với ${source.avgLatencyMs}ms bạn đang gặp phải trên ${source.apiName}.`,
    });
  }
  if (reliabilityGainPercent !== null && reliabilityGainPercent > 0.5 && candidate.successRatePercent !== null) {
    reasons.push({
      code: 'HIGHER_RELIABILITY',
      label: `Độ ổn định ${candidate.successRatePercent}%`,
      detail: `Tỷ lệ thành công cao hơn +${reliabilityGainPercent}% so với ${source.successRatePercent}% gần đây của API hiện tại.`,
    });
  }
  if ((quotaMultiplier !== null && quotaMultiplier > 1.1) || (rateLimitMultiplier !== null && rateLimitMultiplier > 1.1)) {
    reasons.push({
      code: 'HIGHER_QUOTA_RATE',
      label: 'Hạn mức & tốc độ cao hơn',
      detail: `Cung cấp ${recommendedPlan.quota.toLocaleString('en-US')} req/tháng và ${recommendedPlan.rateLimit} req/phút.`,
    });
  }
  reasons.push({
    code: 'USAGE_TENURE_OPTIMIZATION',
    label: `Phù hợp sau ${source.daysUsed} ngày sử dụng`,
    detail: `Bạn đã dùng ${source.apiName} ${source.daysUsed} ngày (${source.totalRequests.toLocaleString('en-US')} lượt gọi) trong danh mục ${source.category}.`,
  });

  // Compute weighted matchScore (0-100) based on priorityMode
  const relevanceScore = (sameCategory ? 16 : 8) + Math.min(8, sharedTags.length * 3);
  const costScore = Math.max(0, Math.min(35, savingsPercent * 0.7)) + (hasActiveDeal ? 12 : 0);
  const latencyScore =
    latencyImprovementPercent !== null && latencyImprovementPercent > 0
      ? Math.min(24, latencyImprovementPercent * 0.35)
      : 0;
  const reliabilityScore =
    reliabilityGainPercent !== null && reliabilityGainPercent > 0
      ? Math.min(18, reliabilityGainPercent * 1.6)
      : 0;
  const capacityScore =
    (quotaMultiplier !== null && quotaMultiplier > 1 ? Math.min(8, (quotaMultiplier - 1) * 5) : 0) +
    (candidate.providerStatus === 'Verified' ? 6 : 0);

  let rawScore = 0;
  if (effectiveMode === 'cost_saving') {
    rawScore = relevanceScore + costScore * 1.3 + latencyScore * 0.6 + reliabilityScore * 0.6 + capacityScore * 0.7;
  } else if (effectiveMode === 'high_quality') {
    rawScore = relevanceScore + latencyScore * 1.4 + reliabilityScore * 1.4 + capacityScore * 1.2 + costScore * 0.5;
  } else if (effectiveMode === 'deals_only') {
    rawScore = relevanceScore + costScore * 1.35 + (hasActiveDeal ? 15 : 0) + latencyScore * 0.6 + reliabilityScore * 0.6;
  } else {
    rawScore = relevanceScore + costScore + latencyScore + reliabilityScore + capacityScore;
  }
  const matchScore = Math.max(45, Math.min(99, Math.round(rawScore)));

  return {
    id: `${source.apiId}->${candidate.id}`,
    sourceApi: {
      id: source.apiId,
      name: source.apiName,
      category: source.category,
      currentSubscriptionId: source.currentSubscriptionId,
      currentPlanId: source.currentPlanId,
      currentPlanName: source.currentPlanName,
      currentPriceMonthly: source.currentPriceMonthly,
      currency: source.currency,
      quotaLimit: source.quotaLimit,
      quotaUsed: source.quotaUsed,
      rateLimitPerMinute: source.rateLimitPerMinute,
      daysUsed: source.daysUsed,
      activeUsageDays: source.activeUsageDays,
      totalRequests: source.totalRequests,
      avgLatencyMs: source.avgLatencyMs,
      errorRatePercent: source.errorRatePercent,
      successRatePercent: source.successRatePercent,
    },
    recommendedApi: {
      id: candidate.id,
      name: candidate.name,
      description: candidate.description,
      category: candidate.category,
      tags: candidate.tags,
      providerId: candidate.providerId,
      providerName: candidate.providerName,
      providerStatus: candidate.providerStatus,
      publishedAt: candidate.publishedAt,
    },
    recommendedPlan,
    candidatePlans: candidate.plans,
    comparison: {
      originalPriceMonthly,
      effectivePriceMonthly,
      currency: recommendedPlan.currency,
      monthlySavingsAmount,
      savingsPercent,
      hasActiveDeal,
      candidateAvgLatencyMs: candidate.avgLatencyMs,
      latencyImprovementMs,
      latencyImprovementPercent,
      candidateSuccessRatePercent: candidate.successRatePercent,
      reliabilityGainPercent,
      quotaMultiplier,
      rateLimitMultiplier,
    },
    matchScore,
    reasons,
    userState,
    availableOptions: [
      'switch_cancel_at_period_end',
      'switch_parallel',
      'switch_immediate',
      'compare',
      'playground',
      'save',
      'snooze',
      'dismiss',
    ],
  };
}

export function buildRecommendationsFromData(params: {
  usageInsights: ConsumerUsageInsight[];
  candidates: CandidateApiProfile[];
  liveSubscribedApiIds: Set<string>;
  actionsMap: Map<string, RecommendationUserState>;
  preferences: RecommendationPreferences;
  query: z.infer<typeof recommendationQuerySchema>;
  now?: Date;
}): RecommendationListResponse {
  const { usageInsights, candidates, liveSubscribedApiIds, actionsMap, preferences, query } = params;
  const now = params.now ?? new Date();
  const effectiveMode = query.priorityMode ?? preferences.priorityMode;

  const filteredSources = query.sourceApiId
    ? usageInsights.filter((u) => u.apiId === query.sourceApiId)
    : usageInsights;

  const eligibleSources = filteredSources.filter((u) => u.daysUsed >= preferences.minUsageDays);

  const items: PersonalizedRecommendationItem[] = [];
  for (const source of eligibleSources) {
    for (const candidate of candidates) {
      if (candidate.id === source.apiId) continue;
      const actionKey = `${source.apiId}:${candidate.id}`;
      const userState = resolveEffectiveUserState(actionsMap.get(actionKey), now);

      // Avoid recommending APIs the user already holds a live subscription for, unless inspecting switched/all history.
      const isLiveSubscribed = liveSubscribedApiIds.has(candidate.id);
      if (isLiveSubscribed && userState.action !== 'switched') {
        continue;
      }
      if (isLiveSubscribed && userState.action === 'switched' && query.status !== 'switched' && query.status !== 'all') {
        continue;
      }

      const evaluated = evaluateRecommendationCandidate({
        source,
        candidate,
        preferences,
        effectiveMode,
        userState,
      });
      if (!evaluated) continue;

      const matchesStatus =
        query.status === 'all' ||
        (query.status === 'active' && (userState.action === null || userState.action === 'saved')) ||
        (query.status === 'saved' && userState.action === 'saved') ||
        (query.status === 'snoozed' && userState.action === 'snoozed') ||
        (query.status === 'dismissed' && userState.action === 'dismissed') ||
        (query.status === 'switched' && userState.action === 'switched');

      if (matchesStatus) {
        items.push(evaluated);
      }
    }
  }

  items.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return b.comparison.savingsPercent - a.comparison.savingsPercent;
  });

  const limited = items.slice(0, query.limit);

  // Best potential savings per source API (so switching one source doesn't double-count multiple alternatives)
  const bestSavingsBySource = new Map<string, { currency: string; amount: number }>();
  const latencyImprovements: number[] = [];
  let activeDealsCount = 0;

  for (const item of limited) {
    if (item.comparison.hasActiveDeal) activeDealsCount++;
    if (item.comparison.latencyImprovementPercent !== null && item.comparison.latencyImprovementPercent > 0) {
      latencyImprovements.push(item.comparison.latencyImprovementPercent);
    }
    const prev = bestSavingsBySource.get(item.sourceApi.id);
    if (!prev || item.comparison.monthlySavingsAmount > prev.amount) {
      bestSavingsBySource.set(item.sourceApi.id, {
        currency: item.comparison.currency,
        amount: item.comparison.monthlySavingsAmount,
      });
    }
  }

  const savingsByCurrency = new Map<string, number>();
  for (const entry of bestSavingsBySource.values()) {
    if (entry.amount > 0) {
      savingsByCurrency.set(entry.currency, round2((savingsByCurrency.get(entry.currency) ?? 0) + entry.amount));
    }
  }

  const potentialMonthlySavings = Array.from(savingsByCurrency.entries())
    .map(([currency, amount]) => ({ currency, amount }))
    .sort((a, b) => a.currency.localeCompare(b.currency));

  const averageLatencyImprovementPercent =
    latencyImprovements.length > 0
      ? round1(latencyImprovements.reduce((sum, val) => sum + val, 0) / latencyImprovements.length)
      : null;

  return {
    preferences,
    summary: {
      totalSourceApisAnalyzed: filteredSources.length,
      eligibleSourceApis: eligibleSources.length,
      totalRecommendations: limited.length,
      activeDealsCount,
      potentialMonthlySavings,
      averageLatencyImprovementPercent,
    },
    usageInsights: filteredSources,
    items: limited,
  };
}

export class RecommendationService {
  constructor(
    readonly pool: Pool,
    private readonly billing?: BillingService,
  ) {}

  async getPreferences(userId: string): Promise<RecommendationPreferences> {
    const res = await this.pool.query(
      `SELECT priority_mode, min_usage_days, min_savings_percent,
              only_verified_providers, only_active_deals, auto_notify_deals,
              preferred_migration_mode, updated_at
       FROM consumer_recommendation_preferences
       WHERE consumer_id = $1`,
      [userId],
    );
    const row = res.rows[0];
    if (!row) return { ...DEFAULT_RECOMMENDATION_PREFERENCES };
    return {
      priorityMode: row.priority_mode,
      minUsageDays: Number(row.min_usage_days),
      minSavingsPercent: Number(row.min_savings_percent),
      onlyVerifiedProviders: row.only_verified_providers === true,
      onlyActiveDeals: row.only_active_deals === true,
      autoNotifyDeals: row.auto_notify_deals === true,
      preferredMigrationMode: row.preferred_migration_mode,
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    };
  }

  async updatePreferences(
    userId: string,
    input: z.infer<typeof recommendationPreferencesInputSchema>,
  ): Promise<RecommendationPreferences> {
    const res = await this.pool.query(
      `INSERT INTO consumer_recommendation_preferences (
         consumer_id, priority_mode, min_usage_days, min_savings_percent,
         only_verified_providers, only_active_deals, auto_notify_deals,
         preferred_migration_mode, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (consumer_id) DO UPDATE SET
         priority_mode = EXCLUDED.priority_mode,
         min_usage_days = EXCLUDED.min_usage_days,
         min_savings_percent = EXCLUDED.min_savings_percent,
         only_verified_providers = EXCLUDED.only_verified_providers,
         only_active_deals = EXCLUDED.only_active_deals,
         auto_notify_deals = EXCLUDED.auto_notify_deals,
         preferred_migration_mode = EXCLUDED.preferred_migration_mode,
         updated_at = NOW()
       RETURNING priority_mode, min_usage_days, min_savings_percent,
                 only_verified_providers, only_active_deals, auto_notify_deals,
                 preferred_migration_mode, updated_at`,
      [
        userId,
        input.priorityMode,
        input.minUsageDays,
        input.minSavingsPercent,
        input.onlyVerifiedProviders,
        input.onlyActiveDeals,
        input.autoNotifyDeals,
        input.preferredMigrationMode,
      ],
    );
    const row = res.rows[0]!;
    return {
      priorityMode: row.priority_mode,
      minUsageDays: Number(row.min_usage_days),
      minSavingsPercent: Number(row.min_savings_percent),
      onlyVerifiedProviders: row.only_verified_providers === true,
      onlyActiveDeals: row.only_active_deals === true,
      autoNotifyDeals: row.auto_notify_deals === true,
      preferredMigrationMode: row.preferred_migration_mode,
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    };
  }

  async submitAction(
    userId: string,
    input: z.infer<typeof recommendationActionInputSchema>,
  ): Promise<{ sourceApiId: string; recommendedApiId: string; userState: RecommendationUserState }> {
    if (input.sourceApiId === input.recommendedApiId) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Source API and recommended API must be different');
    }

    const apisRes = await this.pool.query(
      'SELECT id::text FROM apis WHERE id IN ($1, $2)',
      [input.sourceApiId, input.recommendedApiId],
    );
    if (apisRes.rowCount !== 2) {
      throw new ApiError(404, 'NOT_FOUND', 'API not found');
    }

    if (input.action === 'restore') {
      await this.pool.query(
        'DELETE FROM consumer_recommendation_actions WHERE consumer_id=$1 AND source_api_id=$2 AND recommended_api_id=$3',
        [userId, input.sourceApiId, input.recommendedApiId],
      );
      return {
        sourceApiId: input.sourceApiId,
        recommendedApiId: input.recommendedApiId,
        userState: { action: null, reason: null, snoozedUntil: null, updatedAt: new Date().toISOString() },
      };
    }

    const snoozeDays = input.action === 'snoozed' ? (input.snoozeDays ?? 7) : null;
    const res = await this.pool.query(
      `INSERT INTO consumer_recommendation_actions (
         consumer_id, source_api_id, recommended_api_id, action, reason, snoozed_until, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5,
         CASE WHEN $6::integer IS NOT NULL THEN NOW() + make_interval(days => $6::integer) ELSE NULL END,
         NOW()
       )
       ON CONFLICT (consumer_id, source_api_id, recommended_api_id) DO UPDATE SET
         action = EXCLUDED.action,
         reason = EXCLUDED.reason,
         snoozed_until = EXCLUDED.snoozed_until,
         updated_at = NOW()
       RETURNING action, reason, snoozed_until, updated_at`,
      [userId, input.sourceApiId, input.recommendedApiId, input.action, input.reason ?? null, snoozeDays],
    );

    const row = res.rows[0]!;
    return {
      sourceApiId: input.sourceApiId,
      recommendedApiId: input.recommendedApiId,
      userState: {
        action: row.action,
        reason: row.reason ?? null,
        snoozedUntil: row.snoozed_until ? new Date(row.snoozed_until).toISOString() : null,
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
      },
    };
  }

  async switchSubscription(
    userId: string,
    input: z.infer<typeof recommendationSwitchInputSchema>,
  ) {
    if (!this.billing) {
      throw new ApiError(503, 'BILLING_UNAVAILABLE', 'Billing service is unavailable');
    }
    if (input.sourceApiId === input.recommendedApiId) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Source API and recommended API must be different');
    }

    const planCheck = await this.pool.query(
      `SELECT p.id::text, p.api_id::text AS "apiId", p.price_monthly::float8 AS "priceMonthly"
       FROM api_plans p
       JOIN apis a ON a.id = p.api_id
       JOIN api_providers pr ON pr.id = a.provider_id
       JOIN users u ON u.id = pr.user_id
       WHERE p.id = $1 AND p.api_id = $2 AND p.is_active AND a.status = 'Published' AND u.is_active`,
      [input.targetPlanId, input.recommendedApiId],
    );
    if (!planCheck.rowCount) {
      throw new ApiError(404, 'PLAN_NOT_FOUND', 'Published active target plan not found');
    }

    let sourceSubscriptionToCancel: string | null = null;
    if (input.migrationMode !== 'parallel') {
      if (input.sourceSubscriptionId) {
        const subCheck = await this.pool.query(
          `SELECT id::text, status FROM subscriptions WHERE id = $1 AND consumer_id = $2 AND api_id = $3`,
          [input.sourceSubscriptionId, userId, input.sourceApiId],
        );
        if (!subCheck.rowCount) {
          throw new ApiError(404, 'NOT_FOUND', 'Source subscription not found');
        }
        if (['Active', 'Pending'].includes(subCheck.rows[0]!.status)) {
          sourceSubscriptionToCancel = String(subCheck.rows[0]!.id);
        }
      } else {
        const activeSub = await this.pool.query(
          `SELECT id::text FROM subscriptions
           WHERE consumer_id = $1 AND api_id = $2 AND status IN ('Active', 'Pending')
           ORDER BY id DESC LIMIT 1`,
          [userId, input.sourceApiId],
        );
        if (activeSub.rowCount) {
          sourceSubscriptionToCancel = String(activeSub.rows[0]!.id);
        }
      }
    }

    const newSubscription = await this.billing.subscribe(userId, input.targetPlanId);

    let canceledSourceSubscription: Record<string, unknown> | null = null;
    if (sourceSubscriptionToCancel) {
      canceledSourceSubscription = await this.billing.cancel(
        userId,
        sourceSubscriptionToCancel,
        input.migrationMode === 'immediate_cancel',
      );
    }

    await this.pool.query(
      `INSERT INTO consumer_recommendation_actions (
         consumer_id, source_api_id, recommended_api_id, action, reason, snoozed_until, updated_at
       ) VALUES ($1, $2, $3, 'switched', $4, NULL, NOW())
       ON CONFLICT (consumer_id, source_api_id, recommended_api_id) DO UPDATE SET
         action = 'switched',
         reason = EXCLUDED.reason,
         snoozed_until = NULL,
         updated_at = NOW()`,
      [userId, input.sourceApiId, input.recommendedApiId, input.migrationMode],
    );

    const requiresCheckout = Number(planCheck.rows[0]!.priceMonthly) > 0;
    return {
      migrationMode: input.migrationMode,
      requiresCheckout,
      newSubscription,
      canceledSourceSubscription,
    };
  }

  async getRecommendations(
    userId: string,
    rawQuery: z.infer<typeof recommendationQuerySchema>,
  ): Promise<RecommendationListResponse> {
    const query = recommendationQuerySchema.parse(rawQuery);
    const preferences = await this.getPreferences(userId);

    const [
      subsRes,
      usageRes,
      globalUsageRes,
      candidatesRes,
      plansRes,
      qualityRes,
      actionsRes,
    ] = await Promise.all([
      this.pool.query(
        `SELECT s.id::text AS id, s.api_id::text AS "apiId", s.plan_id::text AS "planId",
                s.status, s.quota_used::float8 AS "quotaUsed", s.quota_limit::float8 AS "quotaLimit",
                s.rate_limit_per_minute AS "rateLimitPerMinute",
                s.price_amount::float8 AS "priceAmount", s.price_currency AS "priceCurrency",
                s.current_period_start AS "currentPeriodStart", s.created_at AS "createdAt",
                a.name AS "apiName", a.category, a.tags,
                pl.name AS "planName"
         FROM subscriptions s
         JOIN apis a ON a.id = s.api_id
         LEFT JOIN api_plans pl ON pl.id = s.plan_id
         WHERE s.consumer_id = $1
         ORDER BY CASE s.status
                    WHEN 'Active' THEN 0
                    WHEN 'Pending' THEN 1
                    WHEN 'Past Due' THEN 2
                    WHEN 'Suspended' THEN 3
                    ELSE 4
                  END, s.id DESC`,
        [userId],
      ),
      this.pool.query(
        `SELECT l.api_id::text AS "apiId",
                a.name AS "apiName", a.category, a.tags,
                COUNT(*)::int AS "totalRequests",
                COUNT(DISTINCT (l.occurred_at AT TIME ZONE 'UTC')::date)::int AS "activeUsageDays",
                AVG(l.latency_ms)::float8 AS "avgLatencyMs",
                (100.0 * COUNT(*) FILTER (WHERE l.status_code >= 400) / NULLIF(COUNT(*), 0))::float8 AS "errorRatePercent",
                MIN(l.occurred_at) AS "firstUsedAt",
                MAX(l.occurred_at) AS "lastUsedAt"
         FROM usage_logs l
         JOIN apis a ON a.id = l.api_id
         WHERE l.consumer_id = $1
         GROUP BY l.api_id, a.name, a.category, a.tags`,
        [userId],
      ),
      this.pool.query(
        `SELECT api_id::text AS "apiId",
                AVG(latency_ms)::float8 AS "avgLatencyMs",
                (100.0 * COUNT(*) FILTER (WHERE status_code < 400) / NULLIF(COUNT(*), 0))::float8 AS "successRatePercent",
                COUNT(*)::int AS "totalRequests"
         FROM usage_logs
         GROUP BY api_id`,
      ),
      this.pool.query(
        `SELECT a.id::text AS id, a.name, a.description, a.category, a.tags,
                a.published_at AS "publishedAt",
                p.id::text AS "providerId", p.provider_name AS "providerName",
                COALESCE((SELECT pv.status FROM provider_verifications pv WHERE pv.provider_id = p.id ORDER BY pv.id DESC LIMIT 1), 'Pending') AS "providerStatus"
         FROM apis a
         JOIN api_providers p ON p.id = a.provider_id
         JOIN users u ON u.id = p.user_id
         WHERE a.status = 'Published' AND u.is_active = TRUE
         ORDER BY a.id ASC`,
      ),
      this.pool.query(
        `SELECT pl.id::text AS id, pl.api_id::text AS "apiId", pl.name,
                pl.price_monthly::float8 AS "priceMonthly", pl.currency,
                pl.quota::float8 AS quota, pl.rate_limit AS "rateLimit",
                pr.id::text AS "promoId", pr.title AS "promoTitle", pr.badge_text AS "promoBadgeText",
                pr.discount_percent AS "promoDiscountPercent",
                pr.promo_price_monthly::float8 AS "promoPriceMonthly",
                pr.expires_at AS "promoExpiresAt"
         FROM api_plans pl
         JOIN apis a ON a.id = pl.api_id
         LEFT JOIN api_plan_promotions pr
           ON pr.plan_id = pl.id
          AND pr.is_active = TRUE
          AND pr.starts_at <= NOW()
          AND (pr.expires_at IS NULL OR pr.expires_at > NOW())
         WHERE pl.is_active = TRUE AND a.status = 'Published'
         ORDER BY pl.api_id ASC, pl.price_monthly ASC, pl.id ASC`,
      ),
      this.pool.query(
        `SELECT pda.api_id::text AS "apiId",
                SUM(pda.request_count)::bigint AS "totalRequests",
                SUM(pda.success_count)::bigint AS "successCount",
                SUM(pda.total_latency_ms)::bigint AS "totalLatencyMs",
                COALESCE(MAX(pda.active_subscribers), 0)::int AS "activeSubscribers"
         FROM provider_daily_aggregates pda
         GROUP BY pda.api_id`,
      ),
      this.pool.query(
        `SELECT source_api_id::text AS "sourceApiId",
                recommended_api_id::text AS "recommendedApiId",
                action, reason, snoozed_until AS "snoozedUntil", updated_at AS "updatedAt"
         FROM consumer_recommendation_actions
         WHERE consumer_id = $1`,
        [userId],
      ),
    ]);

    const now = new Date();
    const consumerUsageByApi = new Map<string, any>();
    for (const row of usageRes.rows) {
      consumerUsageByApi.set(String(row.apiId), row);
    }

    const latestSubByApi = new Map<string, any>();
    const liveSubscribedApiIds = new Set<string>();
    for (const row of subsRes.rows) {
      const apiId = String(row.apiId);
      if (['Active', 'Pending', 'Past Due', 'Suspended'].includes(row.status)) {
        liveSubscribedApiIds.add(apiId);
      }
      if (!latestSubByApi.has(apiId)) {
        latestSubByApi.set(apiId, row);
      }
    }

    const sourceApiIds = new Set<string>([
      ...latestSubByApi.keys(),
      ...consumerUsageByApi.keys(),
    ]);

    const usageInsights: ConsumerUsageInsight[] = [];
    for (const apiId of sourceApiIds) {
      const sub = latestSubByApi.get(apiId);
      const usage = consumerUsageByApi.get(apiId);
      const apiName = String(sub?.apiName ?? usage?.apiName ?? `API #${apiId}`);
      const category = String(sub?.category ?? usage?.category ?? 'General');
      const tags = Array.isArray(sub?.tags ?? usage?.tags) ? (sub?.tags ?? usage?.tags).map(String) : [];

      const totalRequests = Number(usage?.totalRequests ?? 0);
      const activeUsageDays = Number(usage?.activeUsageDays ?? 0);
      const firstUsedDate = usage?.firstUsedAt
        ? new Date(usage.firstUsedAt)
        : sub?.currentPeriodStart
          ? new Date(sub.currentPeriodStart)
          : sub?.createdAt
            ? new Date(sub.createdAt)
            : null;
      const earliestAnchor = [
        usage?.firstUsedAt ? new Date(usage.firstUsedAt) : null,
        sub?.currentPeriodStart ? new Date(sub.currentPeriodStart) : null,
        sub?.createdAt ? new Date(sub.createdAt) : null,
      ]
        .filter((d): d is Date => d !== null && Number.isFinite(d.getTime()))
        .sort((a, b) => a.getTime() - b.getTime())[0] ?? firstUsedDate;

      const spanDays = earliestAnchor
        ? Math.max(1, Math.floor((now.getTime() - earliestAnchor.getTime()) / 86_400_000) + 1)
        : 0;
      const daysUsed = Math.max(activeUsageDays, spanDays);

      const avgLatencyMs =
        usage && Number(usage.totalRequests) > 0 && usage.avgLatencyMs !== null
          ? round1(Number(usage.avgLatencyMs))
          : null;
      const errorRatePercent =
        usage && Number(usage.totalRequests) > 0 && usage.errorRatePercent !== null
          ? round2(Number(usage.errorRatePercent))
          : null;
      const successRatePercent =
        errorRatePercent !== null ? round2(100 - errorRatePercent) : null;

      const quotaUsed = sub ? Number(sub.quotaUsed) : totalRequests;
      const quotaLimit = sub ? Number(sub.quotaLimit) : 0;
      const quotaUtilizationPercent =
        quotaLimit > 0 ? round1(Math.min(100, (quotaUsed / quotaLimit) * 100)) : 0;

      usageInsights.push({
        apiId,
        apiName,
        category,
        tags,
        currentSubscriptionId: sub ? String(sub.id) : null,
        currentSubscriptionStatus: sub ? String(sub.status) : null,
        currentPlanId: sub?.planId ? String(sub.planId) : null,
        currentPlanName: sub?.planName ? String(sub.planName) : null,
        currentPriceMonthly: sub ? Number(sub.priceAmount) : 0,
        currency: sub?.priceCurrency ? String(sub.priceCurrency) : 'VND',
        quotaUsed,
        quotaLimit,
        quotaUtilizationPercent,
        rateLimitPerMinute: sub ? Number(sub.rateLimitPerMinute) : 0,
        daysUsed,
        activeUsageDays,
        totalRequests,
        avgLatencyMs,
        errorRatePercent,
        successRatePercent,
        firstUsedAt: earliestAnchor ? earliestAnchor.toISOString() : null,
        lastUsedAt: usage?.lastUsedAt ? new Date(usage.lastUsedAt).toISOString() : null,
        meetsUsageTenureThreshold: daysUsed >= preferences.minUsageDays,
      });
    }

    usageInsights.sort((a, b) => b.daysUsed - a.daysUsed || b.totalRequests - a.totalRequests);

    const plansByApi = new Map<string, RecommendationPlanOption[]>();
    for (const row of plansRes.rows) {
      const apiId = String(row.apiId);
      const priceMonthly = Number(row.priceMonthly);
      const hasPromo = Boolean(row.promoId);
      const promoPriceMonthly = hasPromo ? Number(row.promoPriceMonthly) : priceMonthly;
      const option: RecommendationPlanOption = {
        id: String(row.id),
        name: String(row.name),
        priceMonthly,
        effectivePriceMonthly: hasPromo ? Math.min(priceMonthly, promoPriceMonthly) : priceMonthly,
        currency: String(row.currency),
        quota: Number(row.quota),
        rateLimit: Number(row.rateLimit),
        hasActiveDeal: hasPromo,
        promotion: hasPromo
          ? {
              id: String(row.promoId),
              title: String(row.promoTitle),
              badgeText: String(row.promoBadgeText),
              discountPercent: Number(row.promoDiscountPercent),
              promoPriceMonthly,
              expiresAt: row.promoExpiresAt ? new Date(row.promoExpiresAt).toISOString() : null,
            }
          : null,
      };
      const existing = plansByApi.get(apiId) ?? [];
      existing.push(option);
      plansByApi.set(apiId, existing);
    }

    const qualityByApi = new Map<
      string,
      { avgLatencyMs: number | null; successRatePercent: number | null; totalRequests: number; activeSubscribers: number }
    >();
    for (const row of qualityRes.rows) {
      const totalReq = Number(row.totalRequests ?? 0);
      const successCount = Number(row.successCount ?? 0);
      const totalLatencyMs = Number(row.totalLatencyMs ?? 0);
      qualityByApi.set(String(row.apiId), {
        avgLatencyMs: totalReq > 0 ? round1(totalLatencyMs / totalReq) : null,
        successRatePercent: totalReq > 0 ? round2((successCount / totalReq) * 100) : null,
        totalRequests: totalReq,
        activeSubscribers: Number(row.activeSubscribers ?? 0),
      });
    }
    for (const row of globalUsageRes.rows) {
      const apiId = String(row.apiId);
      if (!qualityByApi.has(apiId)) {
        const totalReq = Number(row.totalRequests ?? 0);
        qualityByApi.set(apiId, {
          avgLatencyMs: totalReq > 0 && row.avgLatencyMs !== null ? round1(Number(row.avgLatencyMs)) : null,
          successRatePercent:
            totalReq > 0 && row.successRatePercent !== null ? round2(Number(row.successRatePercent)) : null,
          totalRequests: totalReq,
          activeSubscribers: 0,
        });
      }
    }

    const candidates: CandidateApiProfile[] = candidatesRes.rows.map((row) => {
      const id = String(row.id);
      const q = qualityByApi.get(id);
      return {
        id,
        name: String(row.name),
        description: String(row.description),
        category: String(row.category),
        tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
        publishedAt: row.publishedAt ? new Date(row.publishedAt).toISOString() : null,
        providerId: String(row.providerId),
        providerName: String(row.providerName),
        providerStatus: row.providerStatus,
        avgLatencyMs: q?.avgLatencyMs ?? null,
        successRatePercent: q?.successRatePercent ?? null,
        totalRequests: q?.totalRequests ?? 0,
        activeSubscribers: q?.activeSubscribers ?? 0,
        plans: plansByApi.get(id) ?? [],
      };
    });

    const actionsMap = new Map<string, RecommendationUserState>();
    for (const row of actionsRes.rows) {
      actionsMap.set(`${row.sourceApiId}:${row.recommendedApiId}`, {
        action: row.action,
        reason: row.reason ?? null,
        snoozedUntil: row.snoozedUntil ? new Date(row.snoozedUntil).toISOString() : null,
        updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
      });
    }

    return buildRecommendationsFromData({
      usageInsights,
      candidates,
      liveSubscribedApiIds,
      actionsMap,
      preferences,
      query,
      now,
    });
  }
}
