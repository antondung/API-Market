import { test, expect } from '@playwright/test';
import { setupMarketplaceRoutes } from '../helpers/routeInterceptors';
import {
  mockPaymentApiDetail,
  mockAiVisionApiDetail,
  mockUnannouncedLegalApiDetail,
  generateMockCatalog,
} from '../fixtures/mockData';

test.describe('Phase 7 — Compare APIs & Three-State Legal Invariant', () => {
  test('renders comparison view when 2 APIs are selected @smoke', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      catalog: [mockPaymentApiDetail, mockAiVisionApiDetail],
      details: {
        [mockPaymentApiDetail.id]: mockPaymentApiDetail,
        [mockAiVisionApiDetail.id]: mockAiVisionApiDetail,
      },
    });

    await page.goto(`/compare?api1=${mockPaymentApiDetail.id}&api2=${mockAiVisionApiDetail.id}`);

    // Verify both APIs are visible in comparison table
    await expect(page.getByRole('link', { name: 'Cloud Payment Engine' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Neural Vision OCR & Object Detection' })).toBeVisible();

    // Verify comparison table rows exist
    await expect(page.getByRole('cell', { name: 'Nhà cung cấp', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: /Bảng giá|Pricing Plans|Gói dịch vụ/i }).first()).toBeVisible();
  });

  test('self-comparison guard displays warning banner when identical API is chosen for both slots', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      catalog: [mockPaymentApiDetail],
      details: {
        [mockPaymentApiDetail.id]: mockPaymentApiDetail,
      },
    });

    await page.goto(`/compare?api1=${mockPaymentApiDetail.id}&api2=${mockPaymentApiDetail.id}`);

    // Verify self-compare warning banner is visible
    await expect(
      page.getByRole('heading', { name: /Không thể so sánh một API với chính nó/i })
    ).toBeVisible();
  });

  test('three-state legal metadata displays "Có" for true, "Không" for false, and "Chưa công bố" for null', async ({ page }) => {
    // Payment: processesPersonalData = true
    // AI Vision: processesPersonalData = false
    // Unannounced: processesPersonalData = null
    await setupMarketplaceRoutes(page, {
      catalog: [mockPaymentApiDetail, mockAiVisionApiDetail, mockUnannouncedLegalApiDetail],
      details: {
        [mockPaymentApiDetail.id]: mockPaymentApiDetail,
        [mockAiVisionApiDetail.id]: mockAiVisionApiDetail,
        [mockUnannouncedLegalApiDetail.id]: mockUnannouncedLegalApiDetail,
      },
    });

    // 1. Compare Payment (true) vs AI Vision (false)
    await page.goto(`/compare?api1=${mockPaymentApiDetail.id}&api2=${mockAiVisionApiDetail.id}`);

    // Check presence of "Có" for Payment API (row: Xử lý dữ liệu cá nhân)
    await expect(page.getByRole('cell', { name: /Có/i })).toBeVisible();

    // Check presence of "Không" for AI Vision API (row: Xử lý dữ liệu cá nhân)
    await expect(page.getByRole('cell', { name: /Không/i })).toBeVisible();

    // 2. Compare Payment (true) vs Unannounced (null)
    await page.goto(`/compare?api1=${mockPaymentApiDetail.id}&api2=${mockUnannouncedLegalApiDetail.id}`);

    // Verify "Chưa công bố" badge is rendered for Unannounced API
    await expect(page.getByRole('cell', { name: /Chưa công bố/i }).first()).toBeVisible();
  });

  test('partial failure resilience: API 1 succeeds but API 2 errors (500) renders API 1 normally and error card for API 2', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      catalog: [mockPaymentApiDetail],
      details: {
        [mockPaymentApiDetail.id]: mockPaymentApiDetail,
      },
      detailOverrides: {
        '500': {
          status: 500,
          body: { code: 'INTERNAL_ERROR', message: 'Service failure' },
        },
      },
    });

    await page.goto(`/compare?api1=${mockPaymentApiDetail.id}&api2=500`);

    // API 1 column should be fully rendered and healthy
    await expect(page.getByRole('link', { name: 'Cloud Payment Engine' })).toBeVisible();

    // API 2 column should show localized error banner or card with retry
    await expect(
      page.getByText(/Không thể tải chi tiết của API thứ hai|Lỗi tải API 2/i).first()
    ).toBeVisible();
  });

  test('adaptive option synthesizer includes deep-linked API even if not on page 1 of catalog', async ({ page }) => {
    // Large catalog with 30 items
    const bigCatalog = generateMockCatalog(30);
    const distantApi = {
      ...mockPaymentApiDetail,
      id: '9999',
      name: 'Distant Deep Linked API',
    };

    await setupMarketplaceRoutes(page, {
      catalog: bigCatalog,
      details: {
        [distantApi.id]: distantApi,
        [bigCatalog[0].id]: { ...distantApi, id: bigCatalog[0].id, name: bigCatalog[0].name },
      },
    });

    await page.goto(`/compare?api1=${distantApi.id}&api2=${bigCatalog[0].id}`);

    // Distant API is rendered without error
    await expect(page.getByRole('link', { name: 'Distant Deep Linked API' })).toBeVisible();
  });
});
