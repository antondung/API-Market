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

  describe('Finding F3: Admin dossier DNS verification tests', () => {
    const baseApi: AdminApiItem = {
      id: 'api-10',
      providerId: 'prov-10',
      name: 'Weather Forecast API',
      description: 'Global weather radar',
      category: 'Weather',
      baseUrl: 'https://api.weather.test/v1',
      tags: ['weather'],
      status: 'Submitted',
      submittedAt: '2026-10-10T00:00:00Z',
      createdAt: '2026-10-10T00:00:00Z',
      updatedAt: '2026-10-10T00:00:00Z',
      providerName: 'Weather Corp',
    };

    const renderWithDossier = async (domainVerification: any) => {
      vi.spyOn(adminReviewApi, 'listAdminApis').mockResolvedValue({
        items: [baseApi],
        total: 1,
        page: 1,
        pageSize: 20,
      });
      vi.spyOn(adminReviewApi, 'getAdminApiDossier').mockResolvedValue({
        api: baseApi,
        provider: {
          verification: {
            id: 'v-10',
            providerId: 'prov-10',
            organizationName: 'Weather Corp',
            contactEmail: 'contact@weather.test',
            status: 'Verified',
            evidenceUrls: [],
            email: 'contact@weather.test',
            userName: 'Weather Admin',
            providerName: 'Weather Corp',
          },
          providerName: 'Weather Corp',
          email: 'contact@weather.test',
          accountName: 'weather_corp',
        },
        versions: [],
        endpoints: [],
        plans: [],
        documentation: [],
        reviews: [],
        legal: {
          id: 'leg-1',
          apiId: 'api-10',
          agreementId: 'agr-1',
          agreementVersion: 'v1.0.0',
          ownershipDeclaration: 'Owner',
          distributionRights: 'Rights',
          processesPersonalData: false,
          personalDataTypes: [],
          dataClassification: 'Public',
          acceptedAt: '2026-10-10T00:00:00Z',
        },
        domainVerification,
      });

      render(<ApiReviewsPage />);

      await waitFor(() => {
        expect(screen.getByText('Weather Forecast API')).toBeDefined();
      });

      // Click "Hồ sơ Dossier" to open dossier modal
      const dossierBtn = screen.getByRole('button', { name: /Hồ sơ Dossier/i });
      act(() => {
        dossierBtn.click();
      });

      await waitFor(() => {
        expect(screen.getByText(/Xác minh quyền kiểm soát Domain/i)).toBeDefined();
      });
    };

    it('displays unverified message when verifiedAt is missing', async () => {
      await renderWithDossier({
        hostname: 'api.weather.test',
        verified: false,
        verifiedAt: null,
      });

      expect(screen.getByText(/Chưa hoàn tất xác minh DNS/i)).toBeDefined();
    });

    it('displays invalid/missing expiry error when verificationExpiresAt is missing or invalid', async () => {
      await renderWithDossier({
        hostname: 'api.weather.test',
        verified: true,
        verifiedAt: '2026-10-10T00:00:00Z',
        verificationExpiresAt: 'not-a-valid-date',
      });

      expect(screen.getByText(/Thời hạn xác minh không xác định hoặc không hợp lệ/i)).toBeDefined();
    });

    it('displays expired status when verification has expired', async () => {
      await renderWithDossier({
        hostname: 'api.weather.test',
        verified: true,
        verifiedAt: '2026-10-01T00:00:00Z',
        verificationExpiresAt: '2026-10-05T00:00:00Z', // In the past relative to 2026-10-17
      });

      expect(screen.getByText(/Đã hết hạn xác minh/i)).toBeDefined();
    });

    it('displays hostname mismatch error when verified hostname does not match baseUrl hostname', async () => {
      await renderWithDossier({
        hostname: 'evil-phishing.test',
        verified: true,
        verifiedAt: '2026-10-10T00:00:00Z',
        verificationExpiresAt: '2099-01-01T00:00:00Z',
      });

      expect(screen.getByText(/không khớp với Base URL/i)).toBeDefined();
    });

    it('displays valid verified status when verifiedAt, future expiry, and hostname all match', async () => {
      await renderWithDossier({
        hostname: 'api.weather.test',
        verified: true,
        verifiedAt: '2026-10-10T00:00:00Z',
        verificationExpiresAt: '2099-01-01T00:00:00Z',
      });

      expect(screen.getByText(/Đã xác minh hợp lệ/i)).toBeDefined();
    });
  });

  describe('Finding F4: Admin async mutation session isolation tests', () => {
    it('ApiReviewsPage: drops pending mutation resolution when Admin user switches mid-flight', async () => {
      const apisForA: AdminApiItem[] = [
        {
          id: 'api-1',
          providerId: 'prov-a',
          name: 'Alpha Payments API',
          description: 'Payment gateway',
          category: 'Fintech',
          baseUrl: 'https://pay.alpha.test',
          tags: ['fintech'],
          status: 'Submitted',
          submittedAt: '2026-10-10T00:00:00Z',
          createdAt: '2026-10-10T00:00:00Z',
          updatedAt: '2026-10-10T00:00:00Z',
          providerName: 'Alpha Corp',
        },
      ];

      vi.spyOn(adminReviewApi, 'listAdminApis').mockImplementation(async () => {
        return { items: apisForA, total: 1, page: 1, pageSize: 20 };
      });

      let resolveMutationPromise: (value: any) => void = () => {};
      const mutationPromise = new Promise(resolve => {
        resolveMutationPromise = resolve;
      });

      vi.spyOn(adminReviewApi, 'reviewAdminApi').mockImplementation(() => mutationPromise as any);

      const { rerender } = render(<ApiReviewsPage />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Payments API')).toBeDefined();
      });

      // Admin A clicks Bắt đầu thẩm định
      const startBtn = screen.getByRole('button', { name: /Bắt đầu thẩm định/i });
      act(() => {
        startBtn.click();
      });

      // Now Admin switches from Admin A to Admin B before mutationPromise resolves
      await act(async () => {
        currentUserState = adminB;
        rerender(<ApiReviewsPage />);
      });

      // Now resolve the promise from Admin A's mutation
      await act(async () => {
        resolveMutationPromise({ ...apisForA[0], status: 'Under Review' });
      });

      // Alert from Admin A should NOT be rendered for Admin B
      expect(screen.queryByText(/Chuyển trạng thái API.*thành công/i)).toBeNull();
    });

    it('ProviderVerificationsPage: drops pending mutation resolution when Admin user switches mid-flight', async () => {
      const verifsForA = [
        {
          id: 'v-1',
          providerId: 'prov-1',
          organizationName: 'Alpha Security Inc',
          contactEmail: 'alpha@sec.test',
          status: 'Pending' as const,
          evidenceUrls: ['https://sec.test/cert.pdf'],
          email: 'admin@sec.test',
          userName: 'Alpha Sec',
          providerName: 'Alpha Security Inc',
        },
      ];

      vi.spyOn(adminReviewApi, 'listAdminVerifications').mockImplementation(async () => {
        return { items: verifsForA, total: 1, page: 1, pageSize: 20 };
      });

      let resolveVerifPromise: (value: any) => void = () => {};
      const verifPromise = new Promise(resolve => {
        resolveVerifPromise = resolve;
      });

      vi.spyOn(adminReviewApi, 'reviewAdminVerification').mockImplementation(() => verifPromise as any);

      const { rerender } = render(<ProviderVerificationsPage />);

      await waitFor(() => {
        expect(screen.getByText('Alpha Security Inc')).toBeDefined();
      });

      // Admin A clicks Phê duyệt
      const approveBtn = screen.getByRole('button', { name: /check\s*Phê duyệt/i });
      act(() => {
        approveBtn.click();
      });

      // Switch to Admin B
      await act(async () => {
        currentUserState = adminB;
        rerender(<ProviderVerificationsPage />);
      });

      // Now resolve the promise
      await act(async () => {
        resolveVerifPromise({ ...verifsForA[0], status: 'Verified' });
      });

      // Alert from Admin A should NOT be displayed for Admin B
      expect(screen.queryByText(/Đã phê duyệt xác minh thành công cho Alpha Security Inc/i)).toBeNull();
    });
  });
});
