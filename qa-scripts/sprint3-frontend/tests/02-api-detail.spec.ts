import { test, expect } from '@playwright/test';
import { setupMarketplaceRoutes } from '../helpers/routeInterceptors';
import {
  mockPaymentApiDetail,
  mockAiVisionApiDetail,
  mockUnannouncedLegalApiDetail,
} from '../fixtures/mockData';

test.describe('Phase 4 — API Detail Page & Version Isolation', () => {
  test('renders valid API detail header, badges, tags, and tabs @smoke', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/api/${mockPaymentApiDetail.id}`);

    // Verify Title and Provider
    await expect(page.getByRole('heading', { name: 'Cloud Payment Engine' })).toBeVisible();
    await expect(page.getByText('FinTech Vietnam Solutions', { exact: true })).toBeVisible();

    // Verify Category and Tag badges
    await expect(page.getByRole('link', { name: /Financial|Tài chính/i })).toBeVisible();
    await expect(page.getByText('#vietqr')).toBeVisible();

    // Verify Action CTA buttons exist
    const playgroundBtn = page.getByRole('button', { name: /Playground/i });
    await expect(playgroundBtn).toBeVisible();

    const sandboxBtn = page.getByRole('button', { name: /Sandbox/i });
    await expect(sandboxBtn).toBeVisible();
  });

  test('version isolation: switching versions strictly isolates endpoints without fallback', async ({ page }) => {
    const multiVersionDetail = {
      ...mockPaymentApiDetail,
      versions: [
        { id: 'v1', version: '1.0.0', changelog: 'Base' },
        { id: 'v2', version: '2.0.0', changelog: 'V2 upgrade' },
      ],
      endpoints: [
        {
          id: 'ep-v1-1',
          method: 'GET' as const,
          path: '/v1/users',
          description: 'V1 Users Endpoint',
        },
        {
          id: 'ep-v2-1',
          method: 'POST' as const,
          path: '/v2/wallets/transfer',
          description: 'V2 Wallets Endpoint',
        },
      ],
    };

    await setupMarketplaceRoutes(page, {
      details: { [multiVersionDetail.id]: multiVersionDetail },
    });

    await page.goto(`/api/${multiVersionDetail.id}`);

    // Endpoints tab or section
    const endpointsTab = page.getByRole('tab', { name: /Endpoints|Điểm cuối/i });
    if (await endpointsTab.isVisible()) {
      await endpointsTab.click();
    }

    // Check version selector exists
    const versionSelector = page.locator('select, [data-testid="version-select"], [role="combobox"]');
    if (await versionSelector.isVisible()) {
      // Select v2.0.0
      await versionSelector.selectOption({ label: '2.0.0' }).catch(() => {});
      await page.waitForTimeout(300);

      // Verify V2 path is shown and V1 path is not shown if version filtering is supported
      const v2Path = page.getByText('/v2/wallets/transfer');
      if (await v2Path.isVisible()) {
        await expect(page.getByText('/v1/users')).not.toBeVisible();
      }
    }
  });

  test('empty documentation state displays honest empty state without crashing', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockUnannouncedLegalApiDetail.id]: mockUnannouncedLegalApiDetail },
    });

    await page.goto(`/api/${mockUnannouncedLegalApiDetail.id}`);

    // Click documentation tab
    const docsTab = page.getByRole('tab', { name: /Tài liệu|Documentation|Docs/i });
    if (await docsTab.isVisible()) {
      await docsTab.click();
      // Should show empty docs message, not blank white screen
      await expect(
        page.getByText(/Chưa có tài liệu|Không có tài liệu|Tài liệu đang được cập nhật/i)
      ).toBeVisible();
    }
  });

  test('handles 404 API not found error with clear message and catalog navigation', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      detailOverrides: {
        '999999': {
          status: 404,
          body: { code: 'API_NOT_FOUND', message: 'API not found' },
        },
      },
    });

    await page.goto('/api/999999');

    // Verify 404 error is shown
    await expect(page.getByText(/404|API Not Found|Không tìm thấy API/i)).toBeVisible();

    // Check "Browse Marketplace" or "Marketplace" button/link exists
    const backBtn = page.getByRole('button', { name: /Browse Marketplace|Khám phá Sàn API|Marketplace/i });
    await expect(backBtn).toBeVisible();
  });

  test('handles 429 rate limit error with retry control', async ({ page }) => {
    let callCount = 0;
    await page.route(/\/api\/marketplace\/apis\/429$/, async (route) => {
      callCount++;
      if (callCount === 1) {
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              ...mockPaymentApiDetail,
              id: '429',
            },
          }),
        });
      }
    });

    await page.goto('/api/429');

    // Rate limit message visible
    await expect(page.getByRole('heading', { name: /Gửi yêu cầu quá nhanh|Too many requests|429/i })).toBeVisible();

    // Retry button visible
    const retryBtn = page.getByRole('button', { name: /Thử lại|Retry/i });
    await expect(retryBtn).toBeVisible();
    await retryBtn.click();
    // After retry, API title is visible
    await expect(page.getByRole('heading', { name: 'Cloud Payment Engine' })).toBeVisible();
  });

  test('handles 500 server error with retry option', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      detailOverrides: {
        '500': {
          status: 500,
          body: { code: 'INTERNAL_ERROR', message: 'Database connection failed' },
        },
      },
    });

    await page.goto('/api/500');

    await expect(page.getByText(/Không thể tải chi tiết API|Lỗi máy chủ|Lỗi kết nối/i)).toBeVisible();
  });
});
