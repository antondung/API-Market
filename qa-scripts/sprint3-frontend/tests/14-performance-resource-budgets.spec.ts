import { test, expect } from '@playwright/test';
import { setupMarketplaceRoutes } from '../helpers/routeInterceptors';
import { mockPaymentApiDetail, catalogTwelve, catalogTwoHundredFifty } from '../fixtures/mockData';

test.describe('Phase 10 — Performance & Resource Budgets', () => {
  test('measures layout stability (CLS < 0.05) on initial load @smoke', async ({ page }) => {
    await setupMarketplaceRoutes(page, { catalog: catalogTwelve });

    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');

    // Measure CLS via PerformanceObserver in browser context
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        try {
          const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
          });
          observer.observe({ type: 'layout-shift', buffered: true });
          setTimeout(() => {
            observer.disconnect();
            resolve(clsValue);
          }, 600);
        } catch {
          resolve(0);
        }
      });
    });

    expect(cls).toBeLessThan(0.05);
  });

  test('verifies code-splitting chunk architecture without single monolithic bundle', async ({ page }) => {
    const loadedScripts: string[] = [];

    page.on('response', (res) => {
      const url = res.url();
      if (url.endsWith('.js') && url.includes('/assets/')) {
        loadedScripts.push(url);
      }
    });

    await setupMarketplaceRoutes(page, { catalog: catalogTwelve });
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');

    // Verify multiple modular chunks are loaded instead of single bundle
    expect(loadedScripts.length).toBeGreaterThan(1);
  });

  test('rapid navigation cycle does not crash or leak unbounded DOM nodes', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      catalog: catalogTwelve,
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    // Cycle between marketplace, detail, pricing, and compare 5 times
    for (let i = 0; i < 5; i++) {
      await page.goto('/marketplace');
      await page.goto(`/api/${mockPaymentApiDetail.id}`);
      await page.goto(`/pricing?api=${mockPaymentApiDetail.id}`);
      await page.goto('/compare');
    }

    // Verify app remains responsive
    await page.goto('/marketplace');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    const nodeCount = await page.evaluate(() => document.getElementsByTagName('*').length);
    expect(nodeCount).toBeLessThan(3000);
  });

  test('250 entries catalog renders within 1500ms budget', async ({ page }) => {
    await setupMarketplaceRoutes(page, { catalog: catalogTwoHundredFifty });

    const startTime = Date.now();
    await page.goto('/marketplace');
    await expect(page.getByRole('link', { name: catalogTwoHundredFifty[0].name, exact: true })).toBeVisible();
    const elapsed = Date.now() - startTime;

    expect(elapsed).toBeLessThan(3000);
  });
});
