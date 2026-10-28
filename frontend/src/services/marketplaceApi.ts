import { apiRequest, ApiError } from './authApi';
import type {
  MarketplaceApiDetail,
  MarketplacePaginatedResponse,
  MarketplaceQuery,
} from './marketplaceTypes';

export function buildMarketplaceSearchParams(query: MarketplaceQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (query.q && typeof query.q === 'string') {
    const trimmed = query.q.trim();
    if (trimmed.length > 0 && trimmed.length <= 200 && !trimmed.includes('\0')) {
      params.set('q', trimmed);
    }
  }

  if (query.category && typeof query.category === 'string') {
    const trimmed = query.category.trim();
    if (trimmed.length > 0 && trimmed.length <= 100 && trimmed !== 'All' && !trimmed.includes('\0')) {
      params.set('category', trimmed);
    }
  }

  if (query.tag && typeof query.tag === 'string') {
    const trimmed = query.tag.trim();
    if (trimmed.length > 0 && trimmed.length <= 100 && !trimmed.includes('\0')) {
      params.set('tag', trimmed);
    }
  }

  if (query.providerId && typeof query.providerId === 'string') {
    const trimmed = query.providerId.trim();
    if (/^[1-9][0-9]{0,9}$/.test(trimmed) && Number(trimmed) <= 2147483647) {
      params.set('providerId', trimmed);
    }
  }

  if (query.pricing === 'free' || query.pricing === 'paid') {
    params.set('pricing', query.pricing);
  }

  if (query.sort === 'name' || query.sort === 'newest') {
    params.set('sort', query.sort);
  }

  if (typeof query.page === 'number' && Number.isInteger(query.page) && query.page >= 1 && query.page <= 10000) {
    if (query.page > 1) {
      params.set('page', String(query.page));
    }
  }

  if (typeof query.pageSize === 'number' && Number.isInteger(query.pageSize) && query.pageSize >= 1 && query.pageSize <= 100) {
    if (query.pageSize !== 20) {
      params.set('pageSize', String(query.pageSize));
    }
  }

  return params;
}

export async function listMarketplaceApis(
  query: MarketplaceQuery = {},
  signal?: AbortSignal
): Promise<MarketplacePaginatedResponse> {
  const params = buildMarketplaceSearchParams(query);
  const queryString = params.toString();
  const path = `/api/marketplace/apis${queryString ? `?${queryString}` : ''}`;

  const response = await apiRequest<{ data: MarketplacePaginatedResponse }>(path, {
    method: 'GET',
    signal,
  });

  return response.data;
}

export async function getMarketplaceApiDetail(
  apiId: string,
  signal?: AbortSignal
): Promise<MarketplaceApiDetail> {
  const trimmedId = apiId.trim();
  if (!/^[1-9][0-9]{0,9}$/.test(trimmedId) || Number(trimmedId) > 2147483647) {
    throw new ApiError(404, 'NOT_FOUND', 'API không tồn tại hoặc chưa được công khai.');
  }

  const response = await apiRequest<{ data: MarketplaceApiDetail }>(
    `/api/marketplace/apis/${encodeURIComponent(trimmedId)}`,
    {
      method: 'GET',
      signal,
    }
  );

  return response.data;
}

export function formatPrice(amount: number, currency = 'VND'): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 ₫';
  if (amount === 0) return 'Miễn phí';

  try {
    if (currency.toUpperCase() === 'VND') {
      return `${new Intl.NumberFormat('vi-VN').format(amount)} ₫`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function formatPublishedDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return '—';
  }
}
