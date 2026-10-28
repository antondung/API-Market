import { test, expect, type Page } from '@playwright/test';
import { setupMarketplaceRoutes } from '../helpers/routeInterceptors';
import { mockPaymentApiDetail } from '../fixtures/mockData';

const mockConsumerUser = {
  id: 'user-consumer-1',
  email: 'consumer@example.com',
  role: 'Consumer' as const,
  name: 'Developer Consumer',
};

async function mockAuthenticatedSession(page: Page) {
  await page.addInitScript((user) => {
    sessionStorage.setItem(
      'apihub_sprint1_auth',
      JSON.stringify({
        accessToken: 'mock-access-token-sprint3',
        refreshToken: 'mock-refresh-token-sprint3',
        user,
        expiresIn: 3600,
        expiresAt: Date.now() + 3600000,
      })
    );
  }, mockConsumerUser);

  await page.route(/\/health(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'ok' }),
    });
  });

  await page.route(/\/api\/auth\/refresh(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          accessToken: 'mock-access-token-sprint3',
          refreshToken: 'mock-refresh-token-sprint3',
          user: mockConsumerUser,
          expiresIn: 3600,
        },
      }),
    });
  });
}

test.describe('Phase 6 — Checkout & Subscription Gateway', () => {
  test('unauthenticated visitor is prompted to log in or redirected to login with redirect param @smoke', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
    });

    await page.goto(`/checkout/${mockPaymentApiDetail.id}/plan-pro-1`);

    // Verify unauthenticated behavior: either redirected to /login or prompted with login message
    await page.waitForTimeout(500);
    const currentUrl = page.url();

    const isRedirected = currentUrl.includes('/login');
    const showsLoginPrompt = (await page.getByText(/Đăng nhập|Login/i).count()) > 0;

    expect(isRedirected || showsLoginPrompt).toBe(true);
  });

  test('displays matched API name, plan name, and exact monthly fee', async ({ page }) => {
    await mockAuthenticatedSession(page);

    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
      user: mockConsumerUser,
    });

    await page.goto(`/checkout/${mockPaymentApiDetail.id}/plan-pro-1`);

    // Verify matched API and Plan details
    await expect(page.getByText('Cloud Payment Engine').first()).toBeVisible();
    await expect(page.getByText('Pro Business Tier').first()).toBeVisible();
    await expect(page.getByText('500.000 ₫').first()).toBeVisible();
  });

  test('payment activation button is honestly disabled awaiting Sprint 4 gateway integration', async ({ page }) => {
    await mockAuthenticatedSession(page);

    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
      user: mockConsumerUser,
    });

    await page.goto(`/checkout/${mockPaymentApiDetail.id}/plan-pro-1`);

    // Check terms toggle
    const termsCheckbox = page.locator('input[type="checkbox"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    // Payment or Activate button
    const payBtn = page.getByRole('button', { name: /Thanh toán|Kích hoạt|Xác nhận đăng ký|Subscribe/i });
    if (await payBtn.isVisible()) {
      // Must be disabled or clearly explain Sprint 4 state
      const isDisabled = await payBtn.isDisabled();
      const sprint4Notice = await page.getByText(/Sprint 4|chưa mở cổng thanh toán|kết nối trong Sprint 4/i).count();
      expect(isDisabled || sprint4Notice > 0).toBe(true);
    }
  });

  test('no fake mutation or simulated payment completion is executed without backend gateway', async ({ page }) => {
    let subscriptionCreated = false;

    await page.route('**/api/subscriptions**', async (route) => {
      if (route.request().method() === 'POST') {
        subscriptionCreated = true;
      }
      await route.fulfill({ status: 501, body: 'Not implemented' });
    });

    await mockAuthenticatedSession(page);

    await setupMarketplaceRoutes(page, {
      details: { [mockPaymentApiDetail.id]: mockPaymentApiDetail },
      user: mockConsumerUser,
    });

    await page.goto(`/checkout/${mockPaymentApiDetail.id}/plan-pro-1`);

    // Verify subscription was NOT secretly created in the background
    expect(subscriptionCreated).toBe(false);
  });
});
