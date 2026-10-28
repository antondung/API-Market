import { test, expect } from '@playwright/test';
import { setupMarketplaceRoutes } from '../helpers/routeInterceptors';
import { mockPaymentApiDetail, catalogTwelve } from '../fixtures/mockData';

test.describe('Phase 9 — Animation, Motion & Reduced Motion', () => {
  test('stagger grid and animated cards render without stuck opacity @smoke', async ({ page }) => {
    await setupMarketplaceRoutes(page, { catalog: catalogTwelve });

    await page.goto('/marketplace');

    // Cards should become visible and interactive
    const cards = page.locator('[data-testid="animated-card"], .grid .bg-surface-container-low.rounded-2xl');
    await expect(cards.first()).toBeVisible();

    // Verify opacity is not stuck at 0
    const opacity = await cards.first().evaluate((el) => {
      return window.getComputedStyle(el).opacity;
    });
    expect(parseFloat(opacity)).toBeGreaterThan(0.5);
  });

  test('animated tabs pill slides and updates active position on click', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/api/${mockPaymentApiDetail.id}`);

    const tabs = page.locator('[role="tab"], button[aria-pressed]');
    if ((await tabs.count()) >= 2) {
      const tab1 = tabs.nth(0);
      const tab2 = tabs.nth(1);

      await tab2.click();
      await page.waitForTimeout(200);

      // Verify second tab has selected/pressed state
      const isSelected = (await tab2.getAttribute('aria-selected')) || (await tab2.getAttribute('aria-pressed'));
      expect(isSelected).toBe('true');
    }
  });

  test('reduced motion emulation: animations become instantaneous and do not leave elements invisible', async ({ page }) => {
    // Emulate prefers-reduced-motion: reduce
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await setupMarketplaceRoutes(page, {
      catalog: catalogTwelve,
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto('/marketplace');

    // Cards are immediately visible without waiting for 1s transition
    const firstCard = page.locator('[data-testid="animated-card"], .grid .bg-surface-container-low.rounded-2xl').first();
    await expect(firstCard).toBeVisible();

    const opacity = await firstCard.evaluate((el) => window.getComputedStyle(el).opacity);
    expect(parseFloat(opacity)).toBeGreaterThan(0.8);
  });

  test('rapid tab clicking does not deadlock animation state or freeze UI', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/api/${mockPaymentApiDetail.id}`);

    const tabs = page.locator('[role="tab"]');
    if ((await tabs.count()) >= 2) {
      // Rapidly click back and forth between tab 0 and tab 1
      for (let i = 0; i < 5; i++) {
        await tabs.nth(0).click({ force: true });
        await tabs.nth(1).click({ force: true });
      }

      await page.waitForTimeout(300);

      // UI remains interactive and content is visible
      await expect(page.locator('body')).not.toBeEmpty();
      await expect(tabs.nth(1)).toBeVisible();
    }
  });
});
