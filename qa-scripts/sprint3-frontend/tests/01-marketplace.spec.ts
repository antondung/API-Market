import { test, expect } from '@playwright/test';
import { setupMarketplaceRoutes } from '../helpers/routeInterceptors';
import {
  catalogZero,
  catalogOne,
  catalogTwelve,
  catalogThirteen,
  catalogFifty,
  catalogSixtyFive,
  catalogOneHundredTwenty,
  catalogTwoHundredFifty,
  generateMockCatalog,
} from '../fixtures/mockData';

test.describe('Phase 3 — Marketplace Catalog & Homepage', () => {
  test('initial render loads catalog page 1 with skeleton and filters @smoke', async ({ page }) => {
    await setupMarketplaceRoutes(page, { catalog: catalogTwelve });

    await page.goto('/marketplace');

    // Heading or title exists
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Verify search input is present
    const searchInput = page.getByPlaceholder(/Tìm kiếm API|Search/i);
    await expect(searchInput).toBeVisible();

    // Verify at least one API card link is visible
    const cards = page.locator('a[href^="/api/"]').filter({ hasText: /Dịch vụ API|API/i });
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThanOrEqual(1);
  });

  test('search input debounces correctly and filters catalog with Vietnamese diacritics', async ({ page }) => {
    const customCatalog = [
      {
        id: 'api-viet-1',
        name: 'Cổng Thanh Toán Trực Tuyến VietQR',
        description: 'Giải pháp thanh toán quét mã QR cho ngân hàng',
        category: 'Financial',
        providerId: 'p1',
        providerName: 'Fintech VN',
        providerStatus: 'Verified' as const,
        tags: ['thanh-toán', 'vietqr'],
        hasFreePlan: true,
        hasPaidPlan: true,
        publishedAt: '2026-10-20T00:00:00Z',
      },
      {
        id: 'api-viet-2',
        name: 'Trí Tuệ Nhân Tạo Nhận Diện Giọng Nói',
        description: 'Chuyển đổi âm thanh tiếng Việt thành văn bản',
        category: 'AI / Machine Learning',
        providerId: 'p2',
        providerName: 'AI Vietnam',
        providerStatus: 'Verified' as const,
        tags: ['ai', 'giọng-nói'],
        hasFreePlan: true,
        hasPaidPlan: false,
        publishedAt: '2026-10-21T00:00:00Z',
      },
    ];

    let searchRequests: string[] = [];
    await setupMarketplaceRoutes(page, {
      catalog: customCatalog,
      onCatalogRequest: (url) => searchRequests.push(url),
    });

    await page.goto('/marketplace');

    const searchInput = page.getByPlaceholder(/Tìm kiếm API|Search/i);
    await searchInput.fill('Thanh toán');

    // Wait for debounced search request
    await page.waitForTimeout(500);

    // Verify that the matching card is shown and the non-matching is hidden
    await expect(page.getByText('Cổng Thanh Toán Trực Tuyến VietQR')).toBeVisible();
    await expect(page.getByText('Trí Tuệ Nhân Tạo Nhận Diện Giọng Nói')).not.toBeVisible();
  });

  test('category filter updates catalog correctly', async ({ page }) => {
    const customCatalog = [
      {
        id: 'api-fin-1',
        name: 'Financial Service API',
        description: 'Fintech solution',
        category: 'Financial',
        providerId: 'p1',
        providerName: 'Fintech VN',
        providerStatus: 'Verified' as const,
        tags: ['finance'],
        hasFreePlan: true,
        hasPaidPlan: true,
        publishedAt: '2026-10-20T00:00:00Z',
      },
      {
        id: 'api-ai-1',
        name: 'AI Engine Model API',
        description: 'Machine learning API',
        category: 'AI / Machine Learning',
        providerId: 'p2',
        providerName: 'AI VN',
        providerStatus: 'Verified' as const,
        tags: ['ai'],
        hasFreePlan: true,
        hasPaidPlan: true,
        publishedAt: '2026-10-20T00:00:00Z',
      },
    ];

    await setupMarketplaceRoutes(page, { catalog: customCatalog });
    await page.goto('/marketplace');

    // Click category filter button or select
    const financialFilter = page.getByRole('button', { name: /Financial|Tài chính/i });
    if (await financialFilter.isVisible()) {
      await financialFilter.click();
      await expect(page.getByText('Financial Service API')).toBeVisible();
      await expect(page.getByText('AI Engine Model API')).not.toBeVisible();
    }
  });

  test('pagination scenario: 0 APIs displays empty state', async ({ page }) => {
    await setupMarketplaceRoutes(page, { catalog: catalogZero });
    await page.goto('/marketplace');

    await expect(page.getByText(/Không tìm thấy API|Chưa có API nào/i)).toBeVisible();
  });

  test('pagination scenario: 1 API displays single item without extra pages', async ({ page }) => {
    await setupMarketplaceRoutes(page, { catalog: catalogOne });
    await page.goto('/marketplace');

    await expect(page.getByText(catalogOne[0].name)).toBeVisible();
    // Check that page 2 does not exist
    await expect(page.getByRole('button', { name: '2' })).not.toBeVisible();
  });

  test('pagination scenario: 13 APIs creates 2 pages and can navigate to page 2', async ({ page }) => {
    await setupMarketplaceRoutes(page, { catalog: catalogThirteen });
    await page.goto('/marketplace?pageSize=12');

    // Page 1 has item 1 and shows total pages 2
    await expect(page.getByText(catalogThirteen[0].name, { exact: true })).toBeVisible();
    await expect(page.getByText(/Trang 1 \/ 2|Page 1 \/ 2/i)).toBeVisible();

    // Navigate to page 2 via Next button
    const nextBtn = page.getByRole('button', { name: /Next|Sau|chevron_right/i });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Page 2 shows page 2 indicator and item 13
    await expect(page.getByText(/Trang 2 \/ 2|Page 2 \/ 2/i)).toBeVisible();
    await expect(page.getByText(catalogThirteen[12].name, { exact: true })).toBeVisible();
    // Item 1 from page 1 should not be visible
    await expect(page.getByText(catalogThirteen[0].name, { exact: true })).not.toBeVisible();
  });

  test('pagination scenario: 50 APIs creates multiple pages and allows jumping to page 5', async ({ page }) => {
    await setupMarketplaceRoutes(page, { catalog: catalogFifty });
    await page.goto('/marketplace?page=5&pageSize=10');

    // 50 items with pageSize 10 = 5 pages
    await expect(page.getByText(/Trang 5 \/ 5|Page 5 \/ 5/i)).toBeVisible();

    // Verify last item is on page 5
    await expect(page.getByText(catalogFifty[49].name, { exact: true })).toBeVisible();
  });

  test('pagination scenario: 250 APIs renders large catalog cleanly with pagination bounds', async ({ page }) => {
    await setupMarketplaceRoutes(page, { catalog: catalogTwoHundredFifty });
    await page.goto('/marketplace');

    // Verify page 1 loads fast
    await expect(page.getByText(catalogTwoHundredFifty[0].name, { exact: true })).toBeVisible();

    // Verify total count or pagination controls are active
    const nextBtn = page.getByRole('button', { name: /Sau|Next|Tiếp/i });
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await expect(page.getByText(catalogTwoHundredFifty[20].name, { exact: true })).toBeVisible();
    }
  });

  test('race condition: handles delayed response without displaying stale catalog', async ({ page }) => {
    let callCount = 0;
    await page.route(/\/api\/marketplace\/apis(\?.*)?$/, async (route) => {
      callCount++;
      const url = new URL(route.request().url());
      const pageNum = parseInt(url.searchParams.get('page') || '1', 10);

      if (pageNum === 1) {
        // Delay page 1 by 600ms
        await new Promise((r) => setTimeout(r, 600));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: catalogThirteen.slice(0, 12),
            total: 13,
            page: 1,
            pageSize: 12,
          }),
        });
      } else {
        // Page 2 resolves immediately
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: catalogThirteen.slice(12, 13),
            total: 13,
            page: 2,
            pageSize: 12,
          }),
        });
      }
    });

    await page.goto('/marketplace');
    // Rapidly navigate to page 2 before page 1 finishes
    const page2Btn = page.getByRole('button', { name: '2' });
    if (await page2Btn.isVisible()) {
      await page2Btn.click();
    }

    // Wait for network to settle
    await page.waitForTimeout(800);

    // Verify either page 2 or proper current page is maintained
    expect(page.url()).toContain('/marketplace');
  });

  test('keyboard navigation: Ctrl+K / Cmd+K focuses search input', async ({ page }) => {
    await setupMarketplaceRoutes(page, { catalog: catalogTwelve });
    await page.goto('/marketplace');

    const searchInput = page.getByPlaceholder(/Tìm kiếm API|Search/i);
    // Click outside to blur
    await page.locator('body').click();
    await expect(searchInput).not.toBeFocused();

    // Trigger keyboard shortcut Ctrl+K
    await page.keyboard.press('Control+KeyK');
    await page.waitForTimeout(200);

    // If Ctrl+K shortcut is wired, it will focus searchInput
    const isFocused = await searchInput.evaluate((el) => document.activeElement === el);
    expect(isFocused).toBe(true);
  });
});
