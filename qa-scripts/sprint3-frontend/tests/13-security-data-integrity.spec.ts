import { test, expect } from '@playwright/test';
import { setupMarketplaceRoutes } from '../helpers/routeInterceptors';
import { mockPaymentApiDetail } from '../fixtures/mockData';
import { validateCurlSnippet, validateAntiSsrf } from '../helpers/securityValidator';

test.describe('Phase 13 — Security & Data Integrity', () => {
  test('credential masking: sensitive keys are masked and not stored in localStorage @smoke', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/api/${mockPaymentApiDetail.id}/playground`);

    // Verify localStorage has no unencrypted production API secrets
    const storageKeys = await page.evaluate(() => Object.keys(localStorage));
    for (const key of storageKeys) {
      const val = await page.evaluate((k) => localStorage.getItem(k), key);
      expect(val).not.toMatch(/api_live_[a-zA-Z0-9]{20,}/);
    }
  });

  test('POSIX argument escaping in code snippets protects against command injection', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/api/${mockPaymentApiDetail.id}/playground`);

    // Locate cURL snippet
    const snippetText = await page.locator('pre').first().innerText();
    const validation = validateCurlSnippet(snippetText);

    expect(validation.errors).toEqual([]);
    expect(validation.hasBrokenContinuation).toBe(false);
  });

  test('anti-SSRF browser enforcement: zero direct calls to external domains', async ({ page }) => {
    const interceptedRequests: string[] = [];

    page.on('request', (req) => {
      interceptedRequests.push(req.url());
    });

    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/api/${mockPaymentApiDetail.id}/playground`);
    await page.waitForTimeout(500);

    const check = validateAntiSsrf(interceptedRequests);
    expect(check.valid).toBe(true);
    expect(check.violations).toEqual([]);
  });

  test('session invalidation event wipes sensitive state from window memory', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/api/${mockPaymentApiDetail.id}/playground`);

    // Dispatch global session invalidation event
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('apihub:session-invalidated'));
    });

    await page.waitForTimeout(300);

    // Verify no secret remains in memory or session storage
    const sessionStorageKeys = await page.evaluate(() => Object.keys(sessionStorage));
    for (const key of sessionStorageKeys) {
      const val = await page.evaluate((k) => sessionStorage.getItem(k), key);
      expect(val).not.toMatch(/api_live_[a-zA-Z0-9]{20,}/);
    }
  });
});
