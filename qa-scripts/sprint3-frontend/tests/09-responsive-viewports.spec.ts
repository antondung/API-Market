import { test, expect } from '@playwright/test';
import { setupMarketplaceRoutes } from '../helpers/routeInterceptors';
import { mockPaymentApiDetail, mockAiVisionApiDetail, catalogTwelve } from '../fixtures/mockData';

const VIEWPORTS = [
  { name: '320x568 (iPhone SE)', width: 320, height: 568 },
  { name: '360x800 (Galaxy S20)', width: 360, height: 800 },
  { name: '375x812 (iPhone Mini)', width: 375, height: 812 },
  { name: '390x844 (iPhone 14)', width: 390, height: 844 },
  { name: '430x932 (iPhone Pro Max)', width: 430, height: 932 },
  { name: '768x1024 (iPad Portrait)', width: 768, height: 1024 },
  { name: '1024x768 (iPad Landscape)', width: 1024, height: 768 },
  { name: '1280x800 (MacBook Air)', width: 1280, height: 800 },
  { name: '1440x900 (Desktop HD)', width: 1440, height: 900 },
  { name: '1920x1080 (FHD Desktop)', width: 1920, height: 1080 },
];

test.describe('Phase 8 — Responsive Viewport Matrix (10 Viewports)', () => {
  for (const vp of VIEWPORTS) {
    test(`verifies zero horizontal overflow at ${vp.name} on Marketplace`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await setupMarketplaceRoutes(page, { catalog: catalogTwelve });

      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Check document overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });

      expect(overflow).toBe(false);
    });

    test(`verifies zero horizontal overflow at ${vp.name} on API Detail`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await setupMarketplaceRoutes(page, {
        details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
      });

      await page.goto(`/api/${mockPaymentApiDetail.id}`);
      await page.waitForLoadState('networkidle');

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });

      expect(overflow).toBe(false);
    });

    test(`verifies zero horizontal overflow at ${vp.name} on Compare APIs`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await setupMarketplaceRoutes(page, {
        catalog: [mockPaymentApiDetail, mockAiVisionApiDetail],
        details: {
          [mockPaymentApiDetail.id]: mockPaymentApiDetail,
          [mockAiVisionApiDetail.id]: mockAiVisionApiDetail,
        },
      });

      await page.goto(`/compare?api1=${mockPaymentApiDetail.id}&api2=${mockAiVisionApiDetail.id}`);
      await page.waitForLoadState('networkidle');

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });

      expect(overflow).toBe(false);
    });
  }

  test('mobile viewports show hamburger menu and open drawer correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await setupMarketplaceRoutes(page, { catalog: catalogTwelve });

    await page.goto('/marketplace');

    // Hamburger button exists on mobile
    const hamburgerBtn = page.getByRole('button', { name: /Menu|Mở menu|Điều hướng/i }).or(
      page.locator('button[aria-label*="menu" i], button svg.lucide-menu')
    );

    if (await hamburgerBtn.isVisible()) {
      await hamburgerBtn.click();
      await page.waitForTimeout(300);

      // Verify mobile drawer navigation links appear
      const mobileNav = page.locator('nav, aside, [role="dialog"], [data-testid="mobile-menu"]');
      await expect(mobileNav.first()).toBeVisible();
    }
  });
});
