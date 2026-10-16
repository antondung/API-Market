import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ApiReviewsPage } from '../pages/admin/ApiReviewsPage';
import { ProviderVerificationsPage } from '../pages/admin/ProviderVerificationsPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';
import * as adminReviewApi from '../services/adminReviewApi';
import type { AdminApiItem, AdminAuditLog } from '../services/adminReviewApi';
import * as AuthContextModule from '../context/AuthContext';
import type { User } from '../types';

describe('Admin Console Pages session isolation tests (Admin A -> Admin B)', () => {
  const adminA: User = {
    id: 'admin-a',
    email: 'admin.a@apihub.dev',
    name: 'Admin Alpha',
    role: 'ADMIN',
    status: 'Active',
    createdAt: '',
    lastLoginAt: '',
    twoFactorEnabled: false,
    quotaUsedPercent: 0,
  };

  const adminB: User = {
    id: 'admin-b',
    email: 'admin.b@apihub.dev',
    name: 'Admin Beta',
    role: 'ADMIN',
    status: 'Active',
    createdAt: '',
    lastLoginAt: '',
    twoFactorEnabled: false,
    quotaUsedPercent: 0,
  };

  let currentUserState: User | null = adminA;

  beforeEach(() => {
    vi.restoreAllMocks();
    currentUserState = adminA;
    vi.spyOn(AuthContextModule, 'useAuth').mockImplementation(() => ({
      currentUser: currentUserState,
      user: currentUserState,
      isAuthenticated: Boolean(currentUserState),
      sessionReady: true,
      sessionError: null,
      backendOnline: true,
      checkBackendConnection: vi.fn(),
      retrySession: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    } as any));
  });

  it('ApiReviewsPage: isolates requests across Admin A -> Admin B identity switch', async () => {
    const apisForA: AdminApiItem[] = [
      {
        id: 'api-1',
        providerId: 'prov-a',
        name: 'Finance Gateway API',
        description: 'Banking transactions',
        category: 'Fintech',
        baseUrl: 'https://bank.test',
        tags: ['fintech'],
        status: 'Submitted' as const,
        submittedAt: '2026-10-10T00:00:00Z',
        createdAt: '2026-10-10T00:00:00Z',
        updatedAt: '2026-10-10T00:00:00Z',
        providerName: 'Bank Corp',
      },
    ];

    const apisForB: AdminApiItem[] = [
      {
        id: 'api-2',
        providerId: 'prov-b',
        name: 'Logistics Tracker API',
        description: 'Fleet monitoring',
        category: 'Logistics',
        baseUrl: 'https://fleet.test',
        tags: ['logistics'],
        status: 'Submitted' as const,
        submittedAt: '2026-10-11T00:00:00Z',
        createdAt: '2026-10-11T00:00:00Z',
        updatedAt: '2026-10-11T00:00:00Z',
        providerName: 'Fleet Corp',
      },
    ];

    const listSpy = vi.spyOn(adminReviewApi, 'listAdminApis').mockImplementation(async () => {
      if (currentUserState?.id === 'admin-a') {
        return { items: apisForA, total: 1, page: 1, pageSize: 20 };
      }
      return { items: apisForB, total: 1, page: 1, pageSize: 20 };
    });

    const { rerender } = render(<ApiReviewsPage />);

    await waitFor(() => {
      expect(screen.getByText('Finance Gateway API')).toBeDefined();
    });

    // Switch from Admin A to Admin B
    await act(async () => {
      currentUserState = adminB;
      rerender(<ApiReviewsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Logistics Tracker API')).toBeDefined();
      expect(screen.queryByText('Finance Gateway API')).toBeNull();
    });

    expect(listSpy).toHaveBeenCalledTimes(2);
  });

  it('ProviderVerificationsPage: isolates verification requests across user switch', async () => {
    const verifsForA = [
      {
        id: 'v-1',
        providerId: 'prov-1',
        organizationName: 'Alpha Tech Corp',
        contactEmail: 'alpha@tech.com',
        status: 'Pending' as const,
        evidenceUrls: ['https://alpha.com/cert.pdf'],
        email: 'owner@alpha.com',
        userName: 'Alpha Owner',
        providerName: 'Alpha Tech Corp',
      },
    ];

    const verifsForB = [
      {
        id: 'v-2',
        providerId: 'prov-2',
        organizationName: 'Beta Cloud Solutions',
        contactEmail: 'beta@cloud.com',
        status: 'Pending' as const,
        evidenceUrls: ['https://beta.com/cert.pdf'],
        email: 'owner@beta.com',
        userName: 'Beta Owner',
        providerName: 'Beta Cloud Solutions',
      },
    ];

    vi.spyOn(adminReviewApi, 'listAdminVerifications').mockImplementation(async () => {
      if (currentUserState?.id === 'admin-a') {
        return { items: verifsForA, total: 1, page: 1, pageSize: 20 };
      }
      return { items: verifsForB, total: 1, page: 1, pageSize: 20 };
    });

    const { rerender } = render(<ProviderVerificationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Alpha Tech Corp')).toBeDefined();
    });

    // Switch to Admin B
    await act(async () => {
      currentUserState = adminB;
      rerender(<ProviderVerificationsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Beta Cloud Solutions')).toBeDefined();
      expect(screen.queryByText('Alpha Tech Corp')).toBeNull();
    });
  });

  it('AuditLogsPage: isolates audit log stream across admin identity switch', async () => {
    const logsForA: AdminAuditLog[] = [
      {
        id: 'log-1',
        actorId: 'admin-a',
        actorRole: 'ADMIN',
        action: 'VERIFICATION_APPROVED',
        targetType: 'provider_verifications',
        targetId: 'prov-1',
        detail: {},
        ip: '127.0.0.1',
        createdAt: '2026-10-10T00:00:00Z',
      },
    ];

    const logsForB: AdminAuditLog[] = [
      {
        id: 'log-2',
        actorId: 'admin-b',
        actorRole: 'ADMIN',
        action: 'API_PUBLISHED',
        targetType: 'apis',
        targetId: 'api-2',
        detail: {},
        ip: '127.0.0.1',
        createdAt: '2026-10-11T00:00:00Z',
      },
    ];

    vi.spyOn(adminReviewApi, 'getAdminAuditActions').mockResolvedValue(['VERIFICATION_APPROVED', 'API_PUBLISHED']);
    vi.spyOn(adminReviewApi, 'listAdminAuditLogs').mockImplementation(async () => {
      if (currentUserState?.id === 'admin-a') {
        return { items: logsForA, total: 1, page: 1, pageSize: 25 };
      }
      return { items: logsForB, total: 1, page: 1, pageSize: 25 };
    });

    const { rerender } = render(<AuditLogsPage />);

    await waitFor(() => {
      expect(screen.getAllByText('VERIFICATION_APPROVED').length).toBeGreaterThan(0);
      expect(screen.getByText('prov-1')).toBeDefined();
    });

    // Switch to Admin B
    await act(async () => {
      currentUserState = adminB;
      rerender(<AuditLogsPage />);
    });

    await waitFor(() => {
      expect(screen.getAllByText('API_PUBLISHED').length).toBeGreaterThan(0);
      expect(screen.getByText('api-2')).toBeDefined();
      expect(screen.queryByText('prov-1')).toBeNull();
    });
  });
});
