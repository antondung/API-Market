/**
 * Sprint 4 Billing & Metered Gateway type contracts and safe formatting helpers.
 * Pinned to Backend SHA: 2c8a873023e071a93097a3d32b17bffbc3e41585.
 */

export type SubscriptionStatus =
  | 'Pending'
  | 'Active'
  | 'Past Due'
  | 'Suspended'
  | 'Canceled'
  | 'Expired';

export interface SubscriptionView {
  id: string;
  consumerId: string;
  planId: string;
  apiId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  quotaResetAt: string;
  expiresAt: string | null;
  quotaUsed: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  expiredAt: string | null;
  createdAt: string;
  updatedAt: string;
  quotaLimit: string;
  rateLimitPerMinute: number;
  priceAmount: string;
  priceCurrency: string;
}

export type PaymentStatus = 'Pending' | 'Succeeded' | 'Failed' | 'Refunded';

export interface PaymentView {
  paymentId: string;
  subscriptionId: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  expiresAt: string;
  token: string;
}

export interface SubscriptionsListResponse {
  items: SubscriptionView[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SubscribePayload {
  planId: string;
}

export interface CancelSubscriptionPayload {
  immediate?: boolean;
}

export interface CheckoutPayload {
  idempotencyKey: string;
}

export interface ChangePlanPayload {
  planId: string;
  idempotencyKey: string;
}

export interface ConfirmPaymentPayload {
  paymentId: string;
  token: string;
  outcome: 'success' | 'failure';
  eventId: string;
}

export interface ConfirmPaymentResult {
  paymentId: string;
  status: 'Succeeded' | 'Failed';
  duplicate: boolean;
}

export interface UsageSubscriptionSummary {
  id: string;
  apiId: string;
  status: SubscriptionStatus;
  quotaUsed: string;
  quotaLimit: string;
  remainingRequests: string;
  periodStart: string;
  periodEnd: string;
}

export interface DailyUsageSummary {
  date: string;
  requestCount: string;
  successCount: string;
  errorCount: string;
}

export interface UsageSummaryResponse {
  subscriptions: UsageSubscriptionSummary[];
  daily: DailyUsageSummary[];
}

export interface UsageHistoryItem {
  id: string;
  requestId: string;
  occurredAt: string;
  apiId: string;
  apiName: string;
  method: string | null;
  path: string | null;
  statusCode: number;
  errorCode: string | null;
  latencyMs: number;
}

export interface UsageHistoryResponse {
  items: UsageHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UsageQueryParams {
  page?: number;
  pageSize?: number;
  apiId?: string;
  status?: number;
  from?: string;
  to?: string;
}

export interface ProviderAnalyticsRequests {
  requestCount: string;
  successCount: string;
  errorCount: string;
  clientErrorCount?: string;
  serverErrorCount?: string;
  errorRatePercent?: number;
  averageLatencyMs: number;
  p50LatencyMs?: number | null;
  p95LatencyMs?: number | null;
  p99LatencyMs?: number | null;
  p50OverheadMs?: number | null;
  p95OverheadMs?: number | null;
  p99OverheadMs?: number | null;
}

export interface ProviderAnalyticsDaily {
  date: string;
  requestCount: string;
}

export interface ProviderAnalyticsRevenue {
  currency: string;
  amount: string;
}

export interface ProviderTopEndpoint {
  apiId: string;
  apiName: string;
  endpointId: string;
  method: string;
  path: string;
  requestCount: string;
  errorCount: string;
  clientErrorCount?: string;
  serverErrorCount?: string;
  errorRatePercent?: number;
  p50LatencyMs?: number | null;
  p95LatencyMs?: number | null;
  p99LatencyMs?: number | null;
  p50OverheadMs?: number | null;
  p95OverheadMs?: number | null;
  p99OverheadMs?: number | null;
}

export interface ProviderApiBreakdown {
  apiId: string;
  apiName: string;
  requestCount: string;
  errorCount: string;
  clientErrorCount?: string;
  serverErrorCount?: string;
  errorRatePercent?: number;
  p50LatencyMs?: number | null;
  p95LatencyMs?: number | null;
  p99LatencyMs?: number | null;
  p50OverheadMs?: number | null;
  p95OverheadMs?: number | null;
  p99OverheadMs?: number | null;
}

export interface ProviderAnalyticsOverview {
  requests: ProviderAnalyticsRequests;
  daily: ProviderAnalyticsDaily[];
  revenue: ProviderAnalyticsRevenue[];
  activeSubscribers: string;
  topEndpoints?: ProviderTopEndpoint[];
  apiBreakdown?: ProviderApiBreakdown[];
}

export interface ProviderAnalyticsQueryParams {
  page?: number;
  pageSize?: number;
  apiId?: string;
  endpointId?: string;
  status?: number;
  from?: string;
  to?: string;
}

export type BillingErrorCode =
  | 'SUBSCRIPTION_ALREADY_EXISTS'
  | 'SUBSCRIPTION_PERIOD_LOCKED'
  | 'PLAN_NOT_FOUND'
  | 'NOT_FOUND'
  | 'INVALID_STATE'
  | 'IDEMPOTENCY_CONFLICT'
  | 'CHECKOUT_PENDING'
  | 'CHECKOUT_EXPIRED'
  | 'INVALID_SANDBOX_TOKEN'
  | 'PAYMENT_ALREADY_SETTLED'
  | 'SUBSCRIPTION_UNAVAILABLE'
  | 'INVALID_PLAN'
  | 'WEBHOOK_CONFLICT'
  | 'VALIDATION_ERROR'
  | 'FORBIDDEN'
  | 'UNAUTHORIZED'
  | 'RATE_LIMITED'
  | 'METERING_UNAVAILABLE';

/**
 * Checks whether numeric amount string represents zero.
 */
export function isZeroAmount(amount: string | null | undefined): boolean {
  if (!amount) return true;
  const trimmed = amount.trim();
  if (trimmed === '' || trimmed === '0') return true;
  const num = Number(trimmed);
  return !Number.isNaN(num) && num === 0;
}

/**
 * Safely parses a string value into bigint without precision loss.
 */
export function parseSafeBigInt(value: string | number | null | undefined): bigint {
  if (value === null || value === undefined) return 0n;
  const cleaned = String(value).trim();
  if (!cleaned) return 0n;
  try {
    const whole = cleaned.split('.')[0] || '0';
    return BigInt(whole);
  } catch {
    return 0n;
  }
}

/**
 * Formats a BigInt or numeric string with locale digit grouping.
 */
export function formatBigIntCount(
  value: string | number | bigint | null | undefined,
  locale = 'vi-VN'
): string {
  const bi = parseSafeBigInt(value !== null && value !== undefined ? String(value) : null);
  return bi.toLocaleString(locale);
}

/**
 * Formats monetary amount without floating-point distortion.
 * Maintains decimal cents if present and formats integer part with thousand separators.
 */
export function formatCurrencyAmount(
  amount: string | number | null | undefined,
  currency = 'VND',
  locale = 'vi-VN'
): string {
  if (amount === null || amount === undefined || amount === '') {
    return `0 ${currency}`;
  }

  const raw = String(amount).trim();
  if (raw === '' || isZeroAmount(raw)) {
    return `0 ${currency}`;
  }

  const isNegative = raw.startsWith('-');
  const unsigned = isNegative ? raw.slice(1).trim() : raw;
  const [wholePart = '0', fractionPart] = unsigned.split('.');

  let wholeBigInt = 0n;
  try {
    wholeBigInt = BigInt(wholePart.replace(/\D/g, '') || '0');
  } catch {
    wholeBigInt = 0n;
  }

  const formattedWhole = wholeBigInt.toLocaleString(locale);

  let decimalSeparator = locale.startsWith('vi') ? ',' : '.';
  try {
    const parts = new Intl.NumberFormat(locale).formatToParts(1.1);
    const decimalPart = parts.find((p) => p.type === 'decimal');
    if (decimalPart?.value) {
      decimalSeparator = decimalPart.value;
    }
  } catch {
    // fallback to locale default
  }

  let formattedNumber = formattedWhole;
  if (fractionPart !== undefined && fractionPart.length > 0) {
    const cleanedFraction = fractionPart.replace(/\D/g, '');
    const trimmedFraction = cleanedFraction.replace(/0+$/, '');
    if (trimmedFraction.length > 0) {
      formattedNumber = `${formattedWhole}${decimalSeparator}${trimmedFraction}`;
    }
  }

  if (formattedNumber === '0') {
    return `0 ${currency}`;
  }

  const result = isNegative ? `-${formattedNumber}` : formattedNumber;
  return `${result} ${currency}`;
}
