import { authenticatedRequest } from './authApi';
import type {
  UsageSummaryResponse,
  UsageHistoryResponse,
  UsageQueryParams,
  ProviderAnalyticsOverview,
  ProviderAnalyticsQueryParams,
} from './sprint4Types';

/**
 * Builds standard query string for usage and analytics endpoints.
 */
export function buildUsageQueryString(
  params?: UsageQueryParams | ProviderAnalyticsQueryParams
): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();

  if (params.page !== undefined && params.page !== null) {
    const safePage = Math.min(10000, Math.max(1, Math.floor(params.page)));
    searchParams.set('page', String(safePage));
  }

  if (params.pageSize !== undefined && params.pageSize !== null) {
    const safePageSize = Math.min(100, Math.max(1, Math.floor(params.pageSize)));
    searchParams.set('pageSize', String(safePageSize));
  }

  if (params.apiId !== undefined && params.apiId !== null && params.apiId.trim() !== '') {
    searchParams.set('apiId', params.apiId.trim());
  }

  if ('endpointId' in params && params.endpointId !== undefined && params.endpointId !== null && params.endpointId.trim() !== '') {
    searchParams.set('endpointId', params.endpointId.trim());
  }

  if (params.status !== undefined && params.status !== null) {
    searchParams.set('status', String(params.status));
  }

  if (params.from !== undefined && params.from !== null && params.from.trim() !== '') {
    searchParams.set('from', params.from.trim());
  }

  if (params.to !== undefined && params.to !== null && params.to.trim() !== '') {
    searchParams.set('to', params.to.trim());
  }

  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Fetches durable quota and daily request summary for the authenticated consumer.
 * Returns { subscriptions, daily }.
 */
export async function getConsumerUsageSummary(
  params?: UsageQueryParams,
  signal?: AbortSignal
): Promise<UsageSummaryResponse> {
  const query = buildUsageQueryString(params);
  const res = await authenticatedRequest<{ data: UsageSummaryResponse }>(
    `/api/consumer/usage/summary${query}`,
    {
      method: 'GET',
      signal,
    }
  );
  return res.data;
}

/**
 * Fetches redacted request history for the authenticated consumer.
 * Headers, bodies, and credentials are intentionally excluded on server.
 */
export async function getConsumerUsageHistory(
  params?: UsageQueryParams,
  signal?: AbortSignal
): Promise<UsageHistoryResponse> {
  const query = buildUsageQueryString(params);
  const res = await authenticatedRequest<{ data: UsageHistoryResponse }>(
    `/api/consumer/usage/history${query}`,
    {
      method: 'GET',
      signal,
    }
  );
  return res.data;
}

/**
 * Fetches provider analytics overview:
 * Owned API requests, active subscriber count, and settled sandbox revenue by currency.
 */
export async function getProviderAnalyticsOverview(
  params?: ProviderAnalyticsQueryParams,
  signal?: AbortSignal
): Promise<ProviderAnalyticsOverview> {
  const query = buildUsageQueryString(params);
  const res = await authenticatedRequest<{ data: ProviderAnalyticsOverview }>(
    `/api/provider/analytics/overview${query}`,
    {
      method: 'GET',
      signal,
    }
  );
  return res.data;
}
