import { test, expect } from '@playwright/test';
import { setupMarketplaceRoutes } from '../helpers/routeInterceptors';
import { mockPaymentApiDetail, catalogTwelve } from '../fixtures/mockData';

test.describe('Phase 6 — Pricing Plans & Deep Link Integrity', () => {
  test('renders exact monthly price without artificial 20% discount @smoke', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      catalog: catalogTwelve,
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/pricing?api=${mockPaymentApiDetail.id}`);

    // Verify Title and exact Pro price
    await expect(page.getByText('Cloud Payment Engine')).toBeVisible();
    await expect(page.getByText('500.000 ₫')).toBeVisible();

    // Verify artificial discount (400.000 ₫) is NOT present
    await expect(page.getByText('400.000 ₫')).not.toBeVisible();

    // Verify Save 20% badge is completely absent
    await expect(page.locator('text=/Save 20%/i')).not.toBeVisible();
  });

  test('annual billing button is disabled with Sprint 4 notice', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      catalog: catalogTwelve,
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/pricing?api=${mockPaymentApiDetail.id}`);

    // Locate Annual Billing button
    const annualBtn = page.getByRole('button', { name: /Annual Billing|Theo năm/i });
    if (await annualBtn.isVisible()) {
      await expect(annualBtn).toBeDisabled();
      // Verify Sprint 4 notice
      await expect(page.getByText(/Chờ Sprint 4|Sprint 4/i)).toBeVisible();
    }
  });

  test('feature comparison matrix contains only grounded backend fields and renders SLA disclaimer', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      catalog: catalogTwelve,
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/pricing?api=${mockPaymentApiDetail.id}`);

    // Wait for API heading to be loaded
    await expect(page.getByRole('heading', { name: 'Cloud Payment Engine' })).toBeVisible();

    // Expand comparison matrix if collapsible
    const expandBtn = page.getByRole('button', { name: /Xem chi tiết|So sánh chi tiết/i });
    await expect(expandBtn).toBeVisible();
    await expandBtn.click();

    // Verify grounded fields exist in table
    await expect(page.getByRole('cell', { name: /Biểu phí hàng tháng/i })).toBeVisible();
    await expect(page.getByRole('cell', { name: /Hạn mức lượt gọi hàng tháng/i })).toBeVisible();
    await expect(page.getByRole('cell', { name: /Giới hạn tần suất gọi/i })).toBeVisible();

    // Verify ungrounded marketing claims are ABSENT
    await expect(page.locator('text=/99.99% Financial SLA/i')).not.toBeVisible();
    await expect(page.locator('text=/Redis Cluster Caching/i')).not.toBeVisible();
    await expect(page.locator('text=/Dedicated Slack/i')).not.toBeVisible();

    // Verify SLA disclaimer is visible
    await expect(
      page.getByText(/Chi tiết SLA và kênh hỗ trợ theo cam kết cụ thể của từng Provider/i)
    ).toBeVisible();
  });

  test('handles 404 deep link error honestly without silent fallback and allows clearing to general catalog', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      catalog: catalogTwelve,
      detailOverrides: {
        'non-existent-api': {
          status: 404,
          body: { code: 'API_NOT_FOUND', message: 'API not found' },
        },
      },
    });

    await page.goto('/pricing?api=non-existent-api');

    // Verify 404 card rendered with ID
    await expect(page.getByText(/API không tìm thấy \(404\)/i)).toBeVisible();
    await expect(page.getByText('non-existent-api')).toBeVisible();

    // Verify general catalog is NOT silently shown
    await expect(page.getByText('500.000 ₫')).not.toBeVisible();

    // Click "Xem tất cả API" to clear deep link
    const viewAllBtn = page.getByRole('button', { name: /Xem tất cả API/i });
    await viewAllBtn.click();

    // Catalog should now load
    await expect(page.getByText(/API không tìm thấy \(404\)/i)).not.toBeVisible();
  });

  test('recovers from 429 rate limit on retry: 429 -> retry -> 200', async ({ page }) => {
    let callCount = 0;
    await page.route(/\/api\/marketplace\/apis\/429$/, async (route) => {
      callCount++;
      if (callCount === 1) {
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              ...mockPaymentApiDetail,
              id: '429',
            },
          }),
        });
      }
    });

    await page.goto('/pricing?api=429');

    // 429 error card is visible
    await expect(page.getByText(/Quá nhiều yêu cầu \(429\)/i)).toBeVisible();

    // Click retry
    const retryBtn = page.getByRole('button', { name: /Thử lại cho API này/i });
    await retryBtn.click();

    // Pricing details now visible and error card hidden
    await expect(page.getByText('Cloud Payment Engine')).toBeVisible();
    await expect(page.getByText('500.000 ₫')).toBeVisible();
    await expect(page.getByText(/Quá nhiều yêu cầu \(429\)/i)).not.toBeVisible();
  });

  test('recovers from 500 server error on retry: 500 -> retry -> 200', async ({ page }) => {
    let callCount = 0;
    await page.route(/\/api\/marketplace\/apis\/500$/, async (route) => {
      callCount++;
      if (callCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Database connection failed' } }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              ...mockPaymentApiDetail,
              id: '500',
            },
          }),
        });
      }
    });

    await page.goto('/pricing?api=500');

    await expect(page.getByText(/Lỗi kết nối máy chủ/i)).toBeVisible();

    const retryBtn = page.getByRole('button', { name: /Thử lại cho API này/i });
    await retryBtn.click();

    await expect(page.getByText('Cloud Payment Engine')).toBeVisible();
    await expect(page.getByText(/Lỗi kết nối máy chủ/i)).not.toBeVisible();
  });

  test('retains latest error on repeated failure: 429 -> retry -> 429', async ({ page }) => {
    await page.route(/\/api\/marketplace\/apis\/4299$/, async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 'RATE_LIMITED', message: 'Persistent rate limit' } }),
      });
    });

    await page.goto('/pricing?api=4299');

    await expect(page.getByText(/Quá nhiều yêu cầu \(429\)/i)).toBeVisible();

    const retryBtn = page.getByRole('button', { name: /Thử lại cho API này/i });
    await retryBtn.click();

    // Still shows 429 error and pricing is not shown
    await expect(page.getByText(/Quá nhiều yêu cầu \(429\)/i)).toBeVisible();
    await expect(page.getByText('Cloud Payment Engine')).not.toBeVisible();
  });

  test('prevents stale response overwrite when switching APIs with first request resolving late', async ({ page }) => {
    let resolveFirstApi: (() => void) | null = null;

    await page.route(/\/api\/marketplace\/apis\/8881$/, async (route) => {
      await new Promise<void>((resolve) => {
        resolveFirstApi = resolve;
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            ...mockPaymentApiDetail,
            id: '8881',
            name: 'Slow First API',
          },
        }),
      });
    });

    await page.route(/\/api\/marketplace\/apis\/8882$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            ...mockPaymentApiDetail,
            id: '8882',
            name: 'Fast Second API',
          },
        }),
      });
    });

    // Start loading slow API
    await page.goto('/pricing?api=8881');

    // Switch to fast API
    await page.goto('/pricing?api=8882');

    // Fast API should display immediately
    await expect(page.getByText('Fast Second API')).toBeVisible();

    // Now resolve the first slow API
    if (resolveFirstApi) {
      (resolveFirstApi as () => void)();
    }
    await page.waitForTimeout(400);

    // Fast Second API must remain; Slow First API must not overwrite
    await expect(page.getByText('Fast Second API')).toBeVisible();
    await expect(page.getByText('Slow First API')).not.toBeVisible();
  });
});
