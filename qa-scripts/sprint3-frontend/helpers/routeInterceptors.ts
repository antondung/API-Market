import type { Page, Route } from '@playwright/test';
import {
  MarketplaceApiDetail,
  MarketplaceApiSummary,
  MarketplacePaginatedResponse,
  mockPaymentApiDetail,
  mockAiVisionApiDetail,
  mockUnannouncedLegalApiDetail,
  catalogTwelve,
} from '../fixtures/mockData';

export interface RouteOptions {
  catalog?: MarketplaceApiSummary[];
  details?: Record<string, MarketplaceApiDetail>;
  delayMs?: number;
  catalogStatus?: number;
  catalogErrorMessage?: string;
  user?: {
    id: string;
    email: string;
    role: 'Consumer' | 'Provider' | 'Admin';
    name?: string;
  } | null;
  skipAuthRoute?: boolean;
  detailOverrides?: Record<
    string,
    {
      status?: number;
      body?: any;
      delayMs?: number;
      contentType?: string;
      rawText?: string;
    }
  >;
  onCatalogRequest?: (url: string) => void;
  onDetailRequest?: (id: string) => void;
}

export async function setupMarketplaceRoutes(page: Page, options: RouteOptions = {}) {
  const catalog = options.catalog ?? catalogTwelve;
  const details: Record<string, MarketplaceApiDetail> = {
    [mockPaymentApiDetail.id]: mockPaymentApiDetail,
    [mockAiVisionApiDetail.id]: mockAiVisionApiDetail,
    [mockUnannouncedLegalApiDetail.id]: mockUnannouncedLegalApiDetail,
    ...(options.details ?? {}),
  };

  // Intercept detail requests: /api/marketplace/apis/:id
  await page.route(/\/api\/marketplace\/apis\/([^?\/]+)$/, async (route: Route) => {
    const url = route.request().url();
    const match = url.match(/\/api\/marketplace\/apis\/([^?\/]+)$/);
    const id = match ? match[1] : '';

    if (options.onDetailRequest) {
      options.onDetailRequest(id);
    }

    const override = options.detailOverrides?.[id];
    if (override) {
      if (override.delayMs) {
        await new Promise((resolve) => setTimeout(resolve, override.delayMs));
      }
      if (override.status && override.status !== 200) {
        await route.fulfill({
          status: override.status,
          contentType: override.contentType ?? 'application/json',
          body: override.rawText ?? JSON.stringify(override.body ?? { message: 'Forced test error' }),
        });
        return;
      }
      if (override.body) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: override.body }),
        });
        return;
      }
    }

    if (options.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }

    const detail = details[id];
    if (!detail) {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'API_NOT_FOUND',
          message: `API with id '${id}' not found`,
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: detail }),
    });
  });

  // Intercept list requests: /api/marketplace/apis?page=...
  await page.route(/\/api\/marketplace\/apis(\?.*)?$/, async (route: Route) => {
    const url = new URL(route.request().url());

    if (options.onCatalogRequest) {
      options.onCatalogRequest(url.toString());
    }

    if (options.catalogStatus && options.catalogStatus !== 200) {
      await route.fulfill({
        status: options.catalogStatus,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'CATALOG_ERROR',
          message: options.catalogErrorMessage ?? 'Catalog server error',
        }),
      });
      return;
    }

    if (options.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }

    const pageNum = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);
    const search = (url.searchParams.get('q') || url.searchParams.get('search') || '').trim().toLowerCase();
    const category = (url.searchParams.get('category') || '').trim();
    const pricing = (url.searchParams.get('pricing') || 'all').trim();
    const sortBy = url.searchParams.get('sort') || url.searchParams.get('sortBy') || 'newest';

    let filtered = [...catalog];

    if (search) {
      filtered = filtered.filter(
        (api) =>
          api.name.toLowerCase().includes(search) ||
          api.description.toLowerCase().includes(search) ||
          api.tags.some((t) => t.toLowerCase().includes(search))
      );
    }

    if (category && category !== 'All') {
      filtered = filtered.filter((api) => api.category.toLowerCase() === category.toLowerCase());
    }

    if (pricing === 'free') {
      filtered = filtered.filter((api) => api.hasFreePlan);
    } else if (pricing === 'paid') {
      filtered = filtered.filter((api) => api.hasPaidPlan);
    }

    if (sortBy === 'name_asc' || sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name_desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    const total = filtered.length;
    const startIndex = (pageNum - 1) * pageSize;
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

    const response: MarketplacePaginatedResponse = {
      items: paginatedItems,
      total,
      page: pageNum,
      pageSize,
    };

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: response }),
    });
  });

  // Intercept auth user check to ensure guest by default unless user is provided
  if (!options.skipAuthRoute) {
    await page.route('**/api/auth/me', async (route: Route) => {
      if (options.user) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: options.user }),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Unauthenticated' }),
        });
      }
    });
  }
}
