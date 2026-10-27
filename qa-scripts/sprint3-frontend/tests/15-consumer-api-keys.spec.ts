import { test, expect } from '@playwright/test';
import { setupMarketplaceRoutes } from '../helpers/routeInterceptors';
import { mockPaymentApiDetail } from '../fixtures/mockData';

const consumerUser = {
  id: 'usr-consumer-1',
  email: 'consumer@apihub.vn',
  role: 'Consumer' as const,
  name: 'Test Consumer',
};

test.describe('Phase 15 — Consumer API Keys Lifecycle & Secret Reveal', () => {
  test.beforeEach(async ({ page }) => {
    // Seed authenticated session in sessionStorage before page load
    await page.addInitScript(() => {
      sessionStorage.setItem(
        'apihub_sprint1_auth',
        JSON.stringify({
          accessToken: 'mock-valid-access-token-sprint3',
          refreshToken: 'mock-valid-refresh-token-sprint3',
          tokenType: 'Bearer',
          expiresIn: 3600,
          expiresAt: Date.now() + 3600 * 1000,
          user: {
            id: 'usr-consumer-1',
            name: 'Test Consumer',
            email: 'consumer@apihub.vn',
            role: 'Consumer',
          },
        })
      );
    });

    // Mock health check and auth check
    await page.route('**/health', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ok' }),
      });
    });

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'usr-consumer-1',
            name: 'Test Consumer',
            email: 'consumer@apihub.vn',
            role: 'Consumer',
          },
        }),
      });
    });

    await page.route('**/api/access/consumer', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { role: 'Consumer' },
        }),
      });
    });
  });

  test('renders honest empty state when user has zero keys @smoke', async ({ page }) => {
    await setupMarketplaceRoutes(page, {
      user: consumerUser,
    });

    // Mock empty key list
    await page.route('**/api/consumer/api-keys*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            items: [],
            total: 0,
            page: 1,
            pageSize: 20,
          },
        }),
      });
    });

    await page.goto('/dashboard/keys');

    // Heading must be visible
    await expect(page.getByRole('heading', { name: /Kho lưu trữ API Key|Quản lý API Key/i })).toBeVisible();

    // Empty state rendered
    await expect(page.getByRole('heading', { name: /Chưa có API key nào được cấp phát/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Tạo API Key mới/i }).first()).toBeVisible();
  });

  test('creates new API key and reveals plaintext secret exactly once in modal', async ({ page }) => {
    const existingKeys: any[] = [];

    await setupMarketplaceRoutes(page, {
      user: consumerUser,
      catalog: [mockPaymentApiDetail],
    });

    // Mock list APIs for dropdown
    await page.route('**/api/marketplace/apis*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            items: [mockPaymentApiDetail],
            total: 1,
            page: 1,
            pageSize: 100,
          },
        }),
      });
    });

    // Mock API key endpoints
    await page.route('**/api/consumer/api-keys*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              items: existingKeys,
              total: existingKeys.length,
              page: 1,
              pageSize: 20,
            },
          }),
        });
      } else if (route.request().method() === 'POST') {
        const body = JSON.parse(route.request().postData() || '{}');
        const newKey = {
          id: 'key-101',
          apiId: body.apiId || '1',
          label: body.label || 'Default Key',
          keyPrefix: 'ak_live_a1b2c3d4',
          key: 'ak_live_a1b2c3d4e5f60718293a4b5c6d7e8f90',
          createdAt: new Date().toISOString(),
          lastUsedAt: null,
          isActive: true,
          revokedAt: null,
        };
        existingKeys.push({
          id: newKey.id,
          apiId: newKey.apiId,
          label: newKey.label,
          keyPrefix: newKey.keyPrefix,
          createdAt: newKey.createdAt,
          lastUsedAt: null,
          isActive: true,
          revokedAt: null,
        });
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ data: newKey }),
        });
      }
    });

    await page.goto('/dashboard/keys');

    // Click create key
    const openCreateBtn = page.getByRole('button', { name: /Tạo API Key mới/i }).first();
    await openCreateBtn.click();

    // Modal opens
    await expect(page.getByRole('heading', { name: /Tạo API Key Mới/i })).toBeVisible();

    // Fill API ID and label, then submit
    const apiIdInput = page.getByPlaceholder(/e\.g\. 1/i);
    await apiIdInput.fill('1');

    const labelInput = page.getByPlaceholder(/Production Backend Cluster/i);
    await labelInput.fill('CI/CD Pipeline Key');

    const submitBtn = page.getByRole('button', { name: /Tạo Khóa/i });
    await submitBtn.click();

    // One-time secret reveal modal MUST appear
    await expect(page.getByRole('heading', { name: /Khóa API Của Bạn Đã Sẵn Sàng/i })).toBeVisible();
    await expect(page.getByText('ak_live_a1b2c3d4e5f60718293a4b5c6d7e8f90')).toBeVisible();
    await expect(page.getByText(/Đây là lần duy nhất bạn thấy toàn bộ chuỗi Secret Key/i)).toBeVisible();

    // Dismiss modal
    const closeBtn = page.getByRole('button', { name: /Tôi đã lưu khóa an toàn/i });
    await closeBtn.click();

    // Plaintext key must be purged from DOM
    await expect(page.getByText('ak_live_a1b2c3d4e5f60718293a4b5c6d7e8f90')).not.toBeVisible();

    // Created key item now listed with prefix only
    await expect(page.getByText('CI/CD Pipeline Key')).toBeVisible();
    await expect(page.getByText(/ak_live_a1b2c3d4/)).toBeVisible();
  });

  test('rotates key with immediate invalidation warning and reveals new secret', async ({ page }) => {
    const activeKey = {
      id: 'key-rotate-1',
      apiId: '1',
      label: 'Staging Integration Key',
      keyPrefix: 'ak_live_99887766',
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      isActive: true,
      revokedAt: null,
    };

    await setupMarketplaceRoutes(page, {
      user: consumerUser,
    });

    await page.route('**/api/consumer/api-keys*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              items: [activeKey],
              total: 1,
              page: 1,
              pageSize: 20,
            },
          }),
        });
      }
    });

    await page.route('**/api/consumer/api-keys/key-rotate-1/rotate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'key-rotate-1',
            apiId: '1',
            label: 'Staging Integration Key',
            keyPrefix: 'ak_live_rotated1',
            key: 'ak_live_rotated1_new_secret_token_value_xyz',
            isActive: true,
            revokedAt: null,
            createdAt: new Date().toISOString(),
            lastUsedAt: null,
          },
        }),
      });
    });

    await page.goto('/dashboard/keys');

    // Find rotate action button
    const rotateBtn = page.getByRole('button', { name: /Xoay vòng|Rotate/i }).first();
    await expect(rotateBtn).toBeVisible();
    await rotateBtn.click();

    // Rotate confirmation dialog must warn about immediate deprecation
    await expect(page.getByRole('heading', { name: /Xác nhận Xoay Vòng/i })).toBeVisible();
    await expect(page.getByText(/Khóa cũ sẽ bị vô hiệu hóa/i)).toBeVisible();

    const confirmRotateBtn = page.getByRole('button', { name: /Xác nhận Rotate/i });
    await confirmRotateBtn.click();

    // Modal reveals newly rotated secret
    await expect(page.getByRole('heading', { name: /Đã Xoay Vòng API Key Mới/i })).toBeVisible();
    await expect(page.getByText('ak_live_rotated1_new_secret_token_value_xyz')).toBeVisible();
  });

  test('revokes key permanently upon confirmation dialog', async ({ page }) => {
    let deletedKeyId = '';
    const activeKey = {
      id: 'key-revoke-1',
      apiId: '1',
      label: 'Decommission Target Key',
      keyPrefix: 'ak_live_revokeme',
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      isActive: true,
      revokedAt: null,
    };

    await setupMarketplaceRoutes(page, {
      user: consumerUser,
    });

    await page.route('**/api/consumer/api-keys*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              items: deletedKeyId ? [] : [activeKey],
              total: deletedKeyId ? 0 : 1,
              page: 1,
              pageSize: 20,
            },
          }),
        });
      }
    });

    await page.route('**/api/consumer/api-keys/key-revoke-1', async (route) => {
      if (route.request().method() === 'DELETE') {
        deletedKeyId = 'key-revoke-1';
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { success: true } }),
        });
      }
    });

    await page.goto('/dashboard/keys');

    // Click revoke button
    const revokeBtn = page.getByRole('button', { name: /Thu hồi/i }).first();
    await expect(revokeBtn).toBeVisible();
    await revokeBtn.click();

    // Confirmation dialog
    await expect(page.getByRole('heading', { name: /Xác nhận Thu Hồi/i })).toBeVisible();
    await expect(page.getByText(/Khóa này sẽ bị thu hồi vĩnh viễn/i)).toBeVisible();

    const confirmRevokeBtn = page.getByRole('button', { name: /Xác nhận Thu Hồi/i });
    await confirmRevokeBtn.click();

    // Key removed and empty state shown
    await expect(page.getByText('Decommission Target Key')).not.toBeVisible();
    expect(deletedKeyId).toBe('key-revoke-1');
  });
});
