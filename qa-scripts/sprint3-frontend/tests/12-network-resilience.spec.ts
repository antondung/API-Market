import { test, expect } from '@playwright/test';
import { setupMarketplaceRoutes } from '../helpers/routeInterceptors';
import { mockPaymentApiDetail, catalogTwelve } from '../fixtures/mockData';

test.describe('Phase 12 — Network Resilience & Error Recovery', () => {
  test('offline handling: recovers cleanly when connection is restored @smoke', async ({ page, context }) => {
    await setupMarketplaceRoutes(page, { catalog: catalogTwelve });

    await page.goto('/marketplace');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Turn offline
    await context.setOffline(true);

    // Try navigating to detail while offline
    await page.goto(`/api/${mockPaymentApiDetail.id}`).catch(() => {});
    await page.waitForTimeout(500);

    // Turn back online
    await context.setOffline(false);
    await page.goto(`/api/${mockPaymentApiDetail.id}`);

    // Detail should now load
    await expect(page.getByRole('heading', { name: 'Cloud Payment Engine' })).toBeVisible();
  });

  test('differentiated 503 service unavailable error handling', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      detailOverrides: {
        '503': {
          status: 503,
          body: { code: 'SERVICE_UNAVAILABLE', message: 'Hệ thống đang bảo trì' },
        },
      },
    });

    await page.goto('/api/503');

    await expect(page.getByRole('heading', { name: 'Không thể tải chi tiết API' })).toBeVisible();
    await expect(page.getByText(/503/)).toBeVisible();
  });

  test('malformed HTML response instead of JSON is handled gracefully without uncaught crash', async ({ page }) => {
    await page.route(/\/api\/marketplace\/apis\/502$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body>502 Bad Gateway - Nginx Proxy Error</body></html>',
      });
    });

    await page.goto('/api/502');

    // UI displays error message instead of blank crash
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.getByRole('heading', { name: 'Không thể tải chi tiết API' })).toBeVisible();
  });

  test('infinite request loop prevention: failing requests do not trigger endless re-fetch storms', async ({ page }) => {
    let requestCount = 0;

    await page.route(/\/api\/marketplace\/apis\/500$/, async (route) => {
      requestCount++;
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      });
    });

    await page.goto('/api/500');
    // Wait 2 seconds to observe any rapid re-fetch loops
    await page.waitForTimeout(2000);

    // Request count should be bounded (typically 1 or 2 with retry, definitely < 6)
    expect(requestCount).toBeLessThan(6);
  });
});
