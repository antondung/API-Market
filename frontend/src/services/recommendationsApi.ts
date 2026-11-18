import { authenticatedRequest } from './authApi';

export type PriorityMode = 'balanced' | 'cost_saving' | 'high_quality' | 'deals_only';
export type MigrationMode = 'parallel' | 'cancel_at_period_end' | 'immediate_cancel';
export type RecommendationStatusFilter = 'active' | 'saved' | 'snoozed' | 'dismissed' | 'switched' | 'all';
export type RecommendationActionType = 'saved' | 'snoozed' | 'dismissed' | 'switched' | 'restore';
export type RecommendationReasonCode =
  | 'DEAL_PROMOTION'
  | 'CHEAPER_PRICE'
  | 'BETTER_LATENCY'
  | 'HIGHER_RELIABILITY'
  | 'HIGHER_QUOTA_RATE'
  | 'USAGE_TENURE_OPTIMIZATION';

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

export interface RecommendationPreferencesInput {
  priorityMode: PriorityMode;
  minUsageDays: number;
  minSavingsPercent: number;
  onlyVerifiedProviders: boolean;
  onlyActiveDeals: boolean;
  autoNotifyDeals: boolean;
  preferredMigrationMode: MigrationMode;
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

export interface RecommendationQuery {
  sourceApiId?: string;
  status?: RecommendationStatusFilter;
  priorityMode?: PriorityMode;
  limit?: number;
}

export interface RecommendationActionInput {
  sourceApiId: string;
  recommendedApiId: string;
  action: RecommendationActionType;
  reason?: string;
  snoozeDays?: number;
}

export interface RecommendationActionResult {
  sourceApiId: string;
  recommendedApiId: string;
  userState: RecommendationUserState;
}

export interface RecommendationSwitchInput {
  sourceApiId: string;
  recommendedApiId: string;
  targetPlanId: string;
  migrationMode: MigrationMode;
  sourceSubscriptionId?: string;
}

export interface RecommendationSwitchResult {
  migrationMode: MigrationMode;
  requiresCheckout: boolean;
  newSubscription: {
    id: string;
    apiId: string;
    planId: string;
    status: string;
    [key: string]: unknown;
  };
  canceledSourceSubscription: Record<string, unknown> | null;
}

export function buildRecommendationSearchParams(query: RecommendationQuery = {}): URLSearchParams {
  const params = new URLSearchParams();
  if (query.sourceApiId && /^[1-9][0-9]{0,9}$/.test(query.sourceApiId.trim())) {
    params.set('sourceApiId', query.sourceApiId.trim());
  }
  if (query.status) {
    params.set('status', query.status);
  }
  if (query.priorityMode) {
    params.set('priorityMode', query.priorityMode);
  }
  if (typeof query.limit === 'number' && Number.isInteger(query.limit) && query.limit >= 1 && query.limit <= 50) {
    params.set('limit', String(query.limit));
  }
  return params;
}

export async function getPersonalizedRecommendations(
  query: RecommendationQuery = {},
  signal?: AbortSignal,
): Promise<RecommendationListResponse> {
  const qs = buildRecommendationSearchParams(query).toString();
  const path = `/api/consumer/recommendations${qs ? `?${qs}` : ''}`;
  const res = await authenticatedRequest<{ data: RecommendationListResponse }>(path, {
    method: 'GET',
    signal,
  });
  return res.data;
}

export async function updateRecommendationPreferences(
  input: RecommendationPreferencesInput,
  signal?: AbortSignal,
): Promise<RecommendationPreferences> {
  const res = await authenticatedRequest<{ data: RecommendationPreferences }>(
    '/api/consumer/recommendations/preferences',
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal,
    },
  );
  return res.data;
}

export async function submitRecommendationAction(
  input: RecommendationActionInput,
  signal?: AbortSignal,
): Promise<RecommendationActionResult> {
  const res = await authenticatedRequest<{ data: RecommendationActionResult }>(
    '/api/consumer/recommendations/actions',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal,
    },
  );
  return res.data;
}

export async function executeRecommendationSwitch(
  input: RecommendationSwitchInput,
  signal?: AbortSignal,
): Promise<RecommendationSwitchResult> {
  const res = await authenticatedRequest<{ data: RecommendationSwitchResult }>(
    '/api/consumer/recommendations/switch',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal,
    },
  );
  return res.data;
}
