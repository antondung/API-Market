import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser,
    isAuthenticated: true,
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
    it('renders user details in read-only mode and explains unmerged PR #79 status', () => {
      render(
        <MemoryRouter>
          <ProfileSettingsPage />
        </MemoryRouter>
      );

      expect(screen.getByText(/Trạng thái tích hợp US-05 \(PR #79\)/)).toBeDefined();
      expect(screen.getByDisplayValue('Dev Tester')).toBeDefined();
      expect(screen.getByDisplayValue('consumer@example.com')).toBeDefined();

      const saveBtn = screen.getByRole('button', { name: /Save Changes/ });
      expect((saveBtn as HTMLButtonElement).disabled).toBe(true);
    });
  });
});
