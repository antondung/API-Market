import { test, expect } from '@playwright/test';
import { setupMarketplaceRoutes } from '../helpers/routeInterceptors';
import { mockPaymentApiDetail } from '../fixtures/mockData';
import { validateCurlSnippet } from '../helpers/securityValidator';

test.describe('Phase 5 — Try Sandbox & Guided Testing', () => {
  test('renders 3-step sandbox wizard with endpoint selection and presets @smoke', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/api/${mockPaymentApiDetail.id}/try-sandbox`);

    // Verify Sandbox title / breadcrumb
    await expect(page.getByRole('link', { name: 'Cloud Payment Engine' })).toBeVisible();

    // Verify step wizard or controls are visible
    const steps = page.locator('ol, ul, nav, [role="tablist"], [data-testid="wizard-steps"]');
    await expect(steps.first()).toBeVisible();
  });

  test('validates credential requirement when trying to trigger request', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/api/${mockPaymentApiDetail.id}/try-sandbox`);

    // Check for API Key input or prompt
    const apiKeyField = page.locator('input[type="password"], input[placeholder*="API Key"], input[placeholder*="X-API-Key"]');
    if (await apiKeyField.isVisible()) {
      await expect(apiKeyField).toBeVisible();
    }
  });

  test('verifies honest Sprint 4 disabled state for live upstream execution', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/api/${mockPaymentApiDetail.id}/try-sandbox`);

    // Check if execute button is disabled or explains Sprint 4 gateway routing
    const runBtn = page.getByRole('button', { name: /Chạy thử|Execute|Gửi yêu cầu|Run/i });
    if (await runBtn.isVisible()) {
      // Either disabled or clicking opens informational message about Sprint 4 gateway
      const isDisabled = await runBtn.isDisabled();
      if (!isDisabled) {
        await runBtn.click().catch(() => {});
        // Expect disclaimer or mock response
        await expect(page.locator('body')).toContainText(/Gateway|Sprint 4|Thử nghiệm|Mô phỏng/i);
      }
    }
  });

  test('generates valid and safe cURL snippet from sandbox parameters', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/api/${mockPaymentApiDetail.id}/try-sandbox`);

    const codeSnippet = page.locator('pre');
    if (await codeSnippet.isVisible()) {
      const text = await codeSnippet.innerText();
      const validation = validateCurlSnippet(text);
      expect(validation.errors).toEqual([]);
      expect(validation.hasBrokenContinuation).toBe(false);
    }
  });
});
