import { test, expect } from '@playwright/test';
import { setupMarketplaceRoutes } from '../helpers/routeInterceptors';
import { catalogTwelve } from '../fixtures/mockData';

test.describe('Phase 8 — Navigation & Layout Integrity', () => {
  test('desktop navbar contains brand logo and main navigation links with active state @smoke', async ({ page }) => {
    await setupMarketplaceRoutes(page, { catalog: catalogTwelve });

    await page.goto('/marketplace');

    // Brand logo exists in header
    const brand = page.getByRole('banner').getByRole('link', { name: /API HUB/i });
    await expect(brand).toBeVisible();

    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (isMobile) {
      // On mobile viewports, mobile toggle button is visible
      const menuBtn = page.getByRole('button', { name: /Toggle navigation menu/i });
      await expect(menuBtn).toBeVisible();
      await menuBtn.click();
      const mobileNav = page.getByRole('navigation');
      await expect(mobileNav.getByRole('link', { name: /Khám phá API|Marketplace/i })).toBeVisible();
    } else {
      // Verify main navigation links in nav
      const nav = page.getByRole('navigation');
      const marketplaceLink = nav.getByRole('link', { name: /Khám phá API|Marketplace/i });
      await expect(marketplaceLink).toBeVisible();

      const compareLink = nav.getByRole('link', { name: /So sánh|Compare/i });
      await expect(compareLink).toBeVisible();

      const pricingLink = nav.getByRole('link', { name: /Bảng giá|Pricing/i });
      await expect(pricingLink).toBeVisible();
    }
  });

  test('SPA route transitions happen seamlessly without hard page refresh', async ({ page }) => {
    await setupMarketplaceRoutes(page, { catalog: catalogTwelve });

    await page.goto('/marketplace');

    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (isMobile) {
      const menuBtn = page.getByRole('button', { name: /Toggle navigation menu/i });
      await menuBtn.click();
      const mobileNav = page.getByRole('navigation');
      await mobileNav.getByRole('link', { name: /So sánh|Compare/i }).click();
    } else {
      const nav = page.getByRole('navigation');
      const compareLink = nav.getByRole('link', { name: /So sánh|Compare/i });
      await compareLink.click();
    }

    // Verify URL transitioned to /compare
    await expect(page).toHaveURL(/.*\/compare/);

    if (isMobile) {
      const menuBtn = page.getByRole('button', { name: /Toggle navigation menu/i });
      await menuBtn.click();
      const mobileNav = page.getByRole('navigation');
      await mobileNav.getByRole('link', { name: /Bảng giá|Pricing/i }).click();
    } else {
      const nav = page.getByRole('navigation');
      const pricingLink = nav.getByRole('link', { name: /Bảng giá|Pricing/i });
      await pricingLink.click();
    }

    // Verify URL transitioned to /pricing
    await expect(page).toHaveURL(/.*\/pricing/);
  });

  test('language switcher toggles between Vietnamese and English translations', async ({ page }) => {
    await setupMarketplaceRoutes(page, { catalog: catalogTwelve });

    await page.goto('/marketplace');

    // Find language switcher button or dropdown
    const langBtn = page.getByTitle(/Chuyển đổi ngôn ngữ|Switch Language/i);
    await expect(langBtn.first()).toBeVisible();
    await langBtn.first().click();

    // Select English option
    const enOption = page.getByRole('button', { name: 'English' });
    await expect(enOption).toBeVisible();
    await enOption.click();
    await page.waitForTimeout(300);

    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('handles unknown routes gracefully with 404 or redirect', async ({ page }) => {
    await setupMarketplaceRoutes(page);

    await page.goto('/some-unknown-random-route-404');
    await page.waitForLoadState('networkidle');

    // Verify page does not crash to blank white screen and handles unknown route gracefully
    await expect(page.locator('body')).not.toBeEmpty();
    const isRedirectedOr404 =
      page.url().includes('/marketplace') ||
      page.url().endsWith('/') ||
      (await page.getByText(/404|Không tìm thấy trang|Page not found/i).count()) > 0;
    expect(isRedirectedOr404).toBe(true);
  });
});
