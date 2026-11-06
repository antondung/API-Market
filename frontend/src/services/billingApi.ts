import { authenticatedRequest } from './authApi';
import type {
  SubscriptionView,
  SubscriptionsListResponse,
  PaymentView,
  ConfirmPaymentResult,
  ConfirmPaymentPayload,
} from './sprint4Types';

/**
 * Generates a cryptographically secure random string (UUID or hex bytes).
 * Fails closed if no secure cryptographic random source is available.
 */
function generateSecureRandomHex(byteCount = 16): string {
  const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (!cryptoObj) {
    throw new Error('Secure cryptographic random source unavailable');
  }

  if (typeof cryptoObj.randomUUID === 'function') {
    return cryptoObj.randomUUID();
  }

  if (typeof cryptoObj.getRandomValues === 'function') {
    const bytes = new Uint8Array(byteCount);
    cryptoObj.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }

  throw new Error('Secure cryptographic random source unavailable');
}

/**
 * Generates a safe idempotency key matching regex ^[A-Za-z0-9_.:-]{1,100}$
 */
export function generateIdempotencyKey(prefix = 'chk'): string {
  const safePrefix = prefix.replace(/[^A-Za-z0-9_.:-]/g, '').slice(0, 20) || 'chk';
  const randomPart = generateSecureRandomHex(16);
  return `${safePrefix}-${randomPart}`.slice(0, 100);
}

/**
 * Generates a safe event id matching regex ^[A-Za-z0-9_.:-]{1,100}$
 */
export function generateEventId(prefix = 'evt'): string {
  const safePrefix = prefix.replace(/[^A-Za-z0-9_.:-]/g, '').slice(0, 20) || 'evt';
  const randomPart = generateSecureRandomHex(16);
  return `${safePrefix}-${randomPart}`.slice(0, 100);
}

/**
 * Subscribes to a published active plan.
 * If plan is Free (0 VND), backend returns status 'Active'. If Paid, status 'Pending'.
 * Envelope { data: SubscriptionView } unwrapped to SubscriptionView.
 */
export async function subscribePlan(
  planId: string,
  signal?: AbortSignal
): Promise<SubscriptionView> {
  const res = await authenticatedRequest<{ data: SubscriptionView }>(
    '/api/consumer/subscriptions',
    {
      method: 'POST',
      body: JSON.stringify({ planId }),
      signal,
    }
  );
  return res.data;
}

/**
 * Lists consumer subscriptions with pagination.
 * Backend default: page=1, pageSize=20.
 */
export async function listSubscriptions(
  page = 1,
  pageSize = 20,
  signal?: AbortSignal
): Promise<SubscriptionsListResponse> {
  const safePage = Math.min(10000, Math.max(1, Math.floor(page)));
  const safePageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));
  const query = new URLSearchParams({
    page: String(safePage),
    pageSize: String(safePageSize),
  });

  const res = await authenticatedRequest<{ data: SubscriptionsListResponse }>(
    `/api/consumer/subscriptions?${query.toString()}`,
    {
      method: 'GET',
      signal,
    }
  );
  return res.data;
}

/**
 * Retrieves a single consumer subscription by numeric ID.
 */
export async function getSubscription(
  id: string,
  signal?: AbortSignal
): Promise<SubscriptionView> {
  const res = await authenticatedRequest<{ data: SubscriptionView }>(
    `/api/consumer/subscriptions/${encodeURIComponent(id)}`,
    {
      method: 'GET',
      signal,
    }
  );
  return res.data;
}

/**
 * Cancels a subscription.
 * immediate=false: sets cancel_at_period_end=true.
 * immediate=true: revokes access immediately setting status='Canceled'.
 */
export async function cancelSubscription(
  id: string,
  immediate = false,
  signal?: AbortSignal
): Promise<SubscriptionView> {
  const res = await authenticatedRequest<{ data: SubscriptionView }>(
    `/api/consumer/subscriptions/${encodeURIComponent(id)}/cancel`,
    {
      method: 'POST',
      body: JSON.stringify({ immediate }),
      signal,
    }
  );
  return res.data;
}

/**
 * Initiates or replays a checkout for a pending subscription.
 * Idempotency key pattern ^[A-Za-z0-9_.:-]{1,100}$ is automatically generated if omitted.
 * Checkout tokens are returned in the response but MUST NEVER be logged or persisted in localStorage/URL.
 */
export async function checkoutSubscription(
  id: string,
  idempotencyKey?: string,
  signal?: AbortSignal
): Promise<PaymentView> {
  const key = idempotencyKey ?? generateIdempotencyKey('chk');
  const res = await authenticatedRequest<{ data: PaymentView }>(
    `/api/consumer/subscriptions/${encodeURIComponent(id)}/checkout`,
    {
      method: 'POST',
      body: JSON.stringify({ idempotencyKey: key }),
      signal,
    }
  );
  return res.data;
}

/**
 * Changes plan for an active subscription.
 * Quota and period are preserved; payment must be confirmed to apply.
 */
export async function changeSubscriptionPlan(
  id: string,
  planId: string,
  idempotencyKey?: string,
  signal?: AbortSignal
): Promise<PaymentView> {
  const key = idempotencyKey ?? generateIdempotencyKey('chg');
  const res = await authenticatedRequest<{ data: PaymentView }>(
    `/api/consumer/subscriptions/${encodeURIComponent(id)}/change-plan`,
    {
      method: 'POST',
      body: JSON.stringify({ planId, idempotencyKey: key }),
      signal,
    }
  );
  return res.data;
}

/**
 * Confirms payment in sandbox simulation.
 * outcome: 'success' | 'failure'.
 * eventId pattern ^[A-Za-z0-9_.:-]{1,100}$ is automatically generated if omitted.
 */
export async function confirmPayment(
  params: {
    paymentId: string;
    token: string;
    outcome: 'success' | 'failure';
    eventId?: string;
  },
  signal?: AbortSignal
): Promise<ConfirmPaymentResult> {
  const eventId = params.eventId ?? generateEventId('evt');
  const payload: ConfirmPaymentPayload = {
    paymentId: params.paymentId,
    token: params.token,
    outcome: params.outcome,
    eventId,
  };

  const res = await authenticatedRequest<{ data: ConfirmPaymentResult }>(
    '/api/consumer/subscriptions/confirm',
    {
      method: 'POST',
      body: JSON.stringify(payload),
      signal,
    }
  );
  return res.data;
}
