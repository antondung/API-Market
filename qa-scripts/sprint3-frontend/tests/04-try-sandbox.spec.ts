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

    // Verify step wizard is visible
    const steps = page.locator('[data-testid="wizard-steps"], [role="tablist"], ol, ul');
    await expect(steps.first()).toBeVisible();

    // Verify Step 1 content is active
    await expect(page.getByText(/Sandbox Grant & Thông tin Xác thực|Yêu cầu Khóa Xác thực/i).first()).toBeVisible();
  });

  test('validates credential guidance and distinguishes Sandbox Grant from API Key', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/api/${mockPaymentApiDetail.id}/try-sandbox`);

    // Check for API Key input or prompt
    const apiKeyField = page.getByPlaceholder(/Nhập API Key của bạn|YOUR_API_KEY/i);
    await expect(apiKeyField).toBeVisible();

    // Explains difference between Sandbox grant and permanent API key
    await expect(page.getByText(/Sandbox Grant dùng cho kiểm thử nhanh|Quản lý API Keys/i).first()).toBeVisible();
  });

  test('navigates through 3-step wizard and connects to live Playground execution', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/api/${mockPaymentApiDetail.id}/try-sandbox`);

    // Step 1 -> Step 2
    const toStep2Btn = page.getByRole('button', { name: /Tiếp tục: Chọn Endpoint/i });
    await expect(toStep2Btn).toBeVisible();
    await toStep2Btn.click();

    // Step 2 selector
    const epSelect = page.locator('#sandbox-endpoint-select');
    await expect(epSelect).toBeVisible();

    // Step 2 -> Step 3
    const toStep3Btn = page.getByRole('button', { name: /Tiếp tục: Xem cURL & Chạy thử/i });
    await expect(toStep3Btn).toBeVisible();
    await toStep3Btn.click();

    // Step 3 shows live Playground execution bridge and generated cURL
    const playgroundBtn = page.getByRole('button', { name: /Mở Playground để chạy thử/i });
    await expect(playgroundBtn).toBeVisible();

    // Click Playground button navigates to /api/:id/playground
    await playgroundBtn.click();
    await expect(page).toHaveURL(new RegExp(`/api/${mockPaymentApiDetail.id}/playground`));
  });

  test('generates valid and safe cURL snippet from sandbox parameters', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/api/${mockPaymentApiDetail.id}/try-sandbox`);

    // Navigate to step 3 where cURL is displayed
    await page.getByRole('button', { name: /Tiếp tục: Chọn Endpoint/i }).click();
    await page.getByRole('button', { name: /Tiếp tục: Xem cURL & Chạy thử/i }).click();

    const codeSnippet = page.locator('pre');
    await expect(codeSnippet.first()).toBeVisible();
    const text = await codeSnippet.first().innerText();
    const validation = validateCurlSnippet(text);
    expect(validation.errors).toEqual([]);
    expect(validation.hasBrokenContinuation).toBe(false);
  });
});
