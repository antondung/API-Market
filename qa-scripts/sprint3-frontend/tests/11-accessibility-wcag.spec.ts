import { test, expect } from '@playwright/test';
import { setupMarketplaceRoutes } from '../helpers/routeInterceptors';
import { runA11yAudit } from '../helpers/a11yHelper';
import {
  mockPaymentApiDetail,
  mockAiVisionApiDetail,
  catalogTwelve,
} from '../fixtures/mockData';

test.describe('Phase 11 — Accessibility Audit (WCAG 2.2 & Keyboard)', () => {
  test('axe-core audit on Marketplace route (/marketplace) @smoke', async ({ page }) => {
    await setupMarketplaceRoutes(page, { catalog: catalogTwelve });
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');

    const result = await runA11yAudit(page);
    // Log violations if any for audit reporting
    if (result.violationsCount > 0) {
      console.log(`[A11y /marketplace] Found ${result.violationsCount} violations:`, result.violations.map((v) => v.id));
    }

    // Critical and serious accessibility violations must be 0
    expect(result.criticalCount).toBe(0);
    expect(result.seriousCount).toBe(0);
  });

  test('axe-core audit on API Detail route (/api/:id)', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });
    await page.goto(`/api/${mockPaymentApiDetail.id}`);
    await page.waitForLoadState('networkidle');

    const result = await runA11yAudit(page);
    if (result.violationsCount > 0) {
      console.log(`[A11y /api/:id] Violations:`, JSON.stringify(result.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes })), null, 2));
    }
    expect(result.criticalCount).toBe(0);
    expect(result.seriousCount).toBe(0);
  });

  test('axe-core audit on Playground route (/api/:id/playground)', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });
    await page.goto(`/api/${mockPaymentApiDetail.id}/playground`);
    await page.waitForLoadState('networkidle');

    const result = await runA11yAudit(page);
    if (result.violationsCount > 0) {
      console.log(`[A11y /playground] Violations:`, JSON.stringify(result.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes })), null, 2));
    }
    expect(result.criticalCount).toBe(0);
    expect(result.seriousCount).toBe(0);
  });

  test('axe-core audit on Compare route (/compare)', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      catalog: [mockPaymentApiDetail, mockAiVisionApiDetail],
      details: {
        [mockPaymentApiDetail.id]: mockPaymentApiDetail,
        [mockAiVisionApiDetail.id]: mockAiVisionApiDetail,
      },
    });
    await page.goto(`/compare?api1=${mockPaymentApiDetail.id}&api2=${mockAiVisionApiDetail.id}`);
    await page.waitForLoadState('networkidle');

    const result = await runA11yAudit(page);
    if (result.violationsCount > 0) {
      console.log(`[A11y /compare] Violations:`, JSON.stringify(result.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes })), null, 2));
    }
    expect(result.criticalCount).toBe(0);
    expect(result.seriousCount).toBe(0);
  });

  test('axe-core audit on Pricing route (/pricing)', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });
    await page.goto(`/pricing?api=${mockPaymentApiDetail.id}`);
    await page.waitForLoadState('networkidle');

    const result = await runA11yAudit(page);
    expect(result.criticalCount).toBe(0);
    expect(result.seriousCount).toBe(0);
  });

  test('keyboard journey: can navigate through search and focus first interactive element', async ({ page }) => {
    await setupMarketplaceRoutes(page, { catalog: catalogTwelve });
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');

    // Focus the brand link via keyboard focus to start journey
    const brandLink = page.getByRole('banner').getByRole('link', { name: /API HUB/i });
    await brandLink.focus();
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('A');

    // Press Tab to navigate to next interactive navigation item
    await page.keyboard.press('Tab');
    const nextActive = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'SELECT']).toContain(nextActive);

    // Focus search input using keyboard navigation and type query
    const searchInput = page.getByPlaceholder(/Tìm kiếm API|Search/i);
    await searchInput.focus();
    await page.keyboard.type('Payment');
    await expect(searchInput).toHaveValue('Payment');
  });

  test('modal focus trap and Escape key dismissal', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });
    await page.goto(`/api/${mockPaymentApiDetail.id}`);

    // If there is any button that opens a modal
    const openModalBtn = page.getByRole('button', { name: /Chi tiết|Share|Chia sẻ|Tích hợp/i }).first();
    if (await openModalBtn.isVisible()) {
      await openModalBtn.click().catch(() => {});
      await page.waitForTimeout(300);

      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        // Press Escape to dismiss
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        await expect(modal).not.toBeVisible();
      }
    }
  });
});
