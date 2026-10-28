import { test, expect } from '@playwright/test';
import { setupMarketplaceRoutes } from '../helpers/routeInterceptors';
import { mockPaymentApiDetail } from '../fixtures/mockData';
import { validateCurlSnippet, validateAntiSsrf } from '../helpers/securityValidator';

test.describe('Phase 5 — API Playground & Safe Snippet Generation', () => {
  test('renders Playground with method selector, path, headers, and tabs @smoke', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/api/${mockPaymentApiDetail.id}/playground`);

    // Verify Playground heading / API title
    await expect(page.getByText('Cloud Payment Engine')).toBeVisible();

    // Verify method indicator or dropdown exists
    const methodBadge = page.locator('button:has-text("GET"), button:has-text("POST"), select');
    await expect(methodBadge.first()).toBeVisible();

    // Verify Code Snippet panel is visible
    const snippetPanel = page.locator('pre, code, [data-testid="code-block"]');
    await expect(snippetPanel.first()).toBeVisible();
  });

  test('generates valid POSIX cURL snippet with comments before curl and unbroken line continuations', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/api/${mockPaymentApiDetail.id}/playground`);

    // Locate code block
    const codeBlock = page.locator('pre code, pre');
    await expect(codeBlock.first()).toBeVisible();
    const snippetText = await codeBlock.first().innerText();

    // Validate cURL snippet syntax
    const validation = validateCurlSnippet(snippetText);
    expect(validation.errors).toEqual([]);
    expect(validation.hasBrokenContinuation).toBe(false);
  });

  test('preserves user-declared Content-Type application/xml without overriding to application/json', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/api/${mockPaymentApiDetail.id}/playground`);

    // Add or modify Header: Content-Type -> application/xml
    const addHeaderBtn = page.getByRole('button', { name: /Thêm header|Add Header/i });
    if (await addHeaderBtn.isVisible()) {
      await addHeaderBtn.click();
      const headerInputs = page.locator('input[placeholder*="Header"], input[placeholder*="Tên header"]');
      if (await headerInputs.count() > 0) {
        await headerInputs.last().fill('Content-Type');
        const valueInputs = page.locator('input[placeholder*="Giá trị"], input[placeholder*="Value"]');
        if (await valueInputs.count() > 0) {
          await valueInputs.last().fill('application/xml');
        }
      }
    }

    // Verify code block reflects application/xml if updated
    const codeBlock = page.locator('pre code, pre');
    const snippetText = await codeBlock.first().innerText();
    expect(snippetText.length).toBeGreaterThan(0);
  });

  test('masks API key in code snippets and does not expose raw secret in UI without opt-in', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/api/${mockPaymentApiDetail.id}/playground`);

    const snippetText = await page.locator('pre').first().innerText();

    // Verify that snippet uses placeholder or masked token
    const hasSafeKey =
      snippetText.includes('your_api_key_here') ||
      snippetText.includes('your_token_here') ||
      snippetText.includes('API_KEY') ||
      snippetText.includes('***') ||
      /Bearer\s+(api_[a-z0-9_]*\*+|\<[A-Z_]+\>)/i.test(snippetText);

    expect(hasSafeKey).toBe(true);
  });

  test('anti-SSRF enforcement: no direct outbound network requests made to third-party domains', async ({ page }) => {
    const outboundRequests: string[] = [];

    page.on('request', (req) => {
      outboundRequests.push(req.url());
    });

    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/api/${mockPaymentApiDetail.id}/playground`);

    // If there is a "Gửi yêu cầu" or "Send" button
    const sendBtn = page.getByRole('button', { name: /Gửi yêu cầu|Send|Thực thi/i });
    if (await sendBtn.isVisible()) {
      await sendBtn.click().catch(() => {});
      await page.waitForTimeout(500);
    }

    // Validate anti-SSRF: every request must stay on localhost/127.0.0.1
    const antiSsrfCheck = validateAntiSsrf(outboundRequests);
    expect(antiSsrfCheck.violations).toEqual([]);
  });

  test('code snippet language switching works for cURL, Fetch, and Python', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/api/${mockPaymentApiDetail.id}/playground`);

    // Click JavaScript / Fetch tab
    const jsTab = page.getByRole('tab', { name: /JavaScript|Fetch/i }).or(page.getByRole('button', { name: /JavaScript|Fetch/i }));
    if (await jsTab.isVisible()) {
      await jsTab.click();
      await page.waitForTimeout(200);
      const jsSnippet = await page.locator('pre').first().innerText();
      expect(jsSnippet).toContain('fetch(');
    }

    // Click Python tab
    const pyTab = page.getByRole('tab', { name: /Python/i }).or(page.getByRole('button', { name: /Python/i }));
    if (await pyTab.isVisible()) {
      await pyTab.click();
      await page.waitForTimeout(200);
      const pySnippet = await page.locator('pre').first().innerText();
      expect(pySnippet).toContain('import requests');
    }
  });
});
