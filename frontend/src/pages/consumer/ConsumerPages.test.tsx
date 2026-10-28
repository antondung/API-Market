import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../../context/AppContext';
import { ConsumerDashboardPage } from './ConsumerDashboardPage';
import { MySubscriptionsPage } from './MySubscriptionsPage';
import { UsageQuotaPage } from './UsageQuotaPage';
import { CostGuardPage } from './CostGuardPage';
import { RequestHistoryPage } from './RequestHistoryPage';
import { ProfileSettingsPage } from './ProfileSettingsPage';
import * as consumerApi from '../../services/consumerApi';
import { ApiError } from '../../services/authApi';

let mockCurrentUser: { id: string; email: string; name: string; role: string } | null = {
  id: 'usr_consumer_99',
  email: 'consumer@example.com',
  name: 'Dev Tester',
  role: 'Consumer',
};

const refreshCurrentUserMock = vi.fn().mockResolvedValue(undefined);
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser,
    isAuthenticated: true,
    refreshCurrentUser: refreshCurrentUserMock,
  }),
}));

vi.mock('../../i18n', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

describe('Consumer Pages - Sprint 3 Real Backend Alignment & Honest States', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ConsumerDashboardPage', () => {
    it('fetches real API keys from backend and displays accurate credential count and Sandbox status', async () => {
      vi.spyOn(consumerApi, 'listConsumerApiKeys').mockResolvedValueOnce({
        items: [
          {
            id: 'k1',
            apiId: '10',
            keyPrefix: 'ak_live_abc123',
            label: 'Test Key',
            isActive: true,
            lastUsedAt: null,
            revokedAt: null,
            createdAt: '2026-10-27T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 100,
      });

      render(
        <MemoryRouter>
          <ConsumerDashboardPage />
        </MemoryRouter>
      );

      expect(screen.getByText(/usr_consumer_99/)).toBeDefined();
      expect(screen.getByText(/Dev Tester/)).toBeDefined();
      expect(await screen.findByText('1 Keys')).toBeDefined();
      expect(screen.getByText('5 req / API')).toBeDefined();
      expect(screen.getByText('Chưa có lịch sử gọi API')).toBeDefined();
    });

    it('differentiates genuinely 0 keys account with helpful generation prompt', async () => {
      vi.spyOn(consumerApi, 'listConsumerApiKeys').mockResolvedValueOnce({
        items: [],
        total: 0,
        page: 1,
        pageSize: 100,
      });

      render(
        <MemoryRouter>
          <ConsumerDashboardPage />
        </MemoryRouter>
      );

      expect(await screen.findByText('0 Keys')).toBeDefined();
      expect(screen.getByText(/Chưa có API key nào được tạo/i)).toBeDefined();
    });

    it('differentiates API key network loading error from zero keys account with retry action', async () => {
      let callCount = 0;
      vi.spyOn(consumerApi, 'listConsumerApiKeys').mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          throw new ApiError(500, 'FAIL', 'Database query failed');
        }
        return {
          items: [],
          total: 0,
          page: 1,
          pageSize: 100,
        };
      });

      render(
        <MemoryRouter>
          <ConsumerDashboardPage />
        </MemoryRouter>
      );

      // Must display 'Không thể tải', NOT '0 Keys'
      expect(await screen.findByText('Không thể tải')).toBeDefined();
      expect(screen.queryByText('0 Keys')).toBeNull();
      expect(screen.getByText('Database query failed')).toBeDefined();

      // Click retry
      const retryBtn = screen.getByRole('button', { name: /Thử lại/i });
      fireEvent.click(retryBtn);

      // After retry succeeds, shows 0 Keys
      expect(await screen.findByText('0 Keys')).toBeDefined();
    });
  });

  describe('MySubscriptionsPage', () => {
    it('renders clean layout, honest Sprint 4 advisory, and empty state without fake mutations', () => {
      render(
        <MemoryRouter>
          <AppProvider>
            <MySubscriptionsPage />
          </AppProvider>
        </MemoryRouter>
      );

      expect(screen.getByText(/Lộ trình triển khai \(Sprint 3 & Sprint 4\)/)).toBeDefined();
      expect(screen.getByText(/Gói dùng thử Sandbox/)).toBeDefined();
      expect(screen.getByText('No Subscriptions Found')).toBeDefined();
    });
  });

  describe('UsageQuotaPage', () => {
    it('explains Quota vs Rate Limit distinction and honest Sandbox quota status', () => {
      render(
        <MemoryRouter>
          <AppProvider>
            <UsageQuotaPage />
          </AppProvider>
        </MemoryRouter>
      );

      expect(screen.getByText(/Cơ chế quản lý hạn ngạch Sprint 3/)).toBeDefined();
      expect(screen.getByText(/Understanding Quota vs Rate Limit/)).toBeDefined();
      expect(screen.getByText('Chưa có đăng ký API')).toBeDefined();
    });
  });

  describe('CostGuardPage', () => {
    it('disables save mutation and honestly indicates Cost Guard is scheduled for Sprint 4', () => {
      render(
        <MemoryRouter>
          <AppProvider>
            <CostGuardPage />
          </AppProvider>
        </MemoryRouter>
      );

      expect(screen.getByText(/Hiện trạng chức năng Sprint 3/)).toBeDefined();
      const saveBtn = screen.getByRole('button', { name: /Save Guard Policy/ });
      expect((saveBtn as HTMLButtonElement).disabled).toBe(true);
    });
  });

  describe('RequestHistoryPage', () => {
    it('renders honest empty state without fabricated telemetry logs', () => {
      render(
        <MemoryRouter>
          <AppProvider>
            <RequestHistoryPage />
          </AppProvider>
        </MemoryRouter>
      );

      expect(screen.getByText(/Hiện trạng chức năng Sprint 3/)).toBeDefined();
      expect(screen.getByText('No telemetry logs captured')).toBeDefined();
    });
  });

  describe('ProfileSettingsPage', () => {
    it('saves the display name through PATCH /api/auth/me and refreshes the user', async () => {
      const authApi = await import('../../services/authApi');
      const updateSpy = vi.spyOn(authApi, 'updateProfile').mockResolvedValue({} as any);
      refreshCurrentUserMock.mockClear();

      render(
        <MemoryRouter>
          <ProfileSettingsPage />
        </MemoryRouter>
      );

      const nameInput = screen.getByLabelText(/Full Name/) as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'Ten Moi' } });
      fireEvent.click(screen.getByRole('button', { name: /Save Changes/ }));

      await waitFor(() => expect(updateSpy).toHaveBeenCalledWith({ name: 'Ten Moi' }));
      await waitFor(() => expect(refreshCurrentUserMock).toHaveBeenCalled());
      expect(await screen.findByText(/Đã cập nhật hồ sơ/)).toBeDefined();
    });

    it('changes the password through POST /api/auth/change-password', async () => {
      const authApi = await import('../../services/authApi');
      const changeSpy = vi.spyOn(authApi, 'changePassword').mockResolvedValue({ revokedSessions: 1 });

      render(
        <MemoryRouter>
          <ProfileSettingsPage />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText(/Mật khẩu hiện tại/), { target: { value: 'Example-password-2026' } });
      fireEvent.change(screen.getByLabelText(/Mật khẩu mới/), { target: { value: 'Another-password-2026' } });
      fireEvent.click(screen.getByRole('button', { name: /Đổi mật khẩu/ }));

      await waitFor(() => expect(changeSpy).toHaveBeenCalledWith({
        currentPassword: 'Example-password-2026',
        newPassword: 'Another-password-2026',
      }));
      expect(await screen.findByText(/Đã đổi mật khẩu/)).toBeDefined();
    });
  });
});
