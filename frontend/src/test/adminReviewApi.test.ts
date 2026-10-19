import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as authApiService from '../services/authApi';
import {
  listAdminVerifications,
  getAdminVerification,
  reviewAdminVerification,
  listAdminApis,
  getAdminApiDossier,
  reviewAdminApi,
  listAdminAuditLogs,
  getAdminAuditActions,
  type AdminVerificationsPage,
  type AdminApisPage,
  type AdminAuditLogsPage,
} from '../services/adminReviewApi';

describe('adminReviewApi unit tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('US-07: Provider Verification Admin Reviews', () => {
    it('listAdminVerifications passes query params correctly', async () => {
      const mockPage: AdminVerificationsPage = {
        items: [
          {
            id: 'v-1',
            providerId: 'prov-1',
            contactEmail: 'corp@tech.com',
            evidenceUrls: ['https://cdn.test/doc.pdf'],
            status: 'Pending',
            email: 'user@tech.com',
            userName: 'Tech Corp',
            providerName: 'Tech Corp Org',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
      };

      const spy = vi
        .spyOn(authApiService, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: mockPage } as any);

      const result = await listAdminVerifications('Pending', 1, 10);
      expect(result.total).toBe(1);
      expect(spy).toHaveBeenCalledWith(
        '/api/admin/provider-verifications?status=Pending&page=1&pageSize=10',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('getAdminVerification fetches single verification dossier', async () => {
      const mockItem = {
        id: 'v-1',
        providerId: 'prov-1',
        contactEmail: 'contact@corp.com',
        evidenceUrls: ['https://doc.com/1.pdf'],
        status: 'Pending' as const,
        email: 'user@corp.com',
        userName: 'Corp User',
        providerName: 'Corp Org',
      };

      const spy = vi
        .spyOn(authApiService, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: mockItem } as any);

      const result = await getAdminVerification('prov-1');
      expect(result.id).toBe('v-1');
      expect(spy).toHaveBeenCalledWith(
        '/api/admin/provider-verifications/prov-1',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('reviewAdminVerification posts decision and trimmed reason', async () => {
      const spy = vi
        .spyOn(authApiService, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: { status: 'Rejected' } } as any);

      await reviewAdminVerification('prov-1', 'Rejected', ' Missing tax certificate ');
      expect(spy).toHaveBeenCalledWith(
        '/api/admin/provider-verifications/prov-1/review',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ decision: 'Rejected', reason: 'Missing tax certificate' }),
        })
      );
    });
  });

  describe('US-13: API Publishing Reviews', () => {
    it('listAdminApis formats query parameters', async () => {
      const mockPage: AdminApisPage = {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
      };

      const spy = vi
        .spyOn(authApiService, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: mockPage } as any);

      await listAdminApis('Submitted', 2, 15);
      expect(spy).toHaveBeenCalledWith(
        '/api/admin/apis?status=Submitted&page=2&pageSize=15',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('getAdminApiDossier fetches full multi-entity dossier', async () => {
      const mockDossier = {
        api: { id: 'api-1', name: 'Billing API', status: 'Submitted' },
        provider: { providerName: 'Fintech Corp' },
        versions: [],
        endpoints: [],
        plans: [],
        legal: null,
        documentation: [],
        reviews: [],
        domainVerification: null,
      };

      const spy = vi
        .spyOn(authApiService, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: mockDossier } as any);

      const result = await getAdminApiDossier('api-1');
      expect(result.api.name).toBe('Billing API');
      expect(spy).toHaveBeenCalledWith(
        '/api/admin/apis/api-1/dossier',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('reviewAdminApi posts next state transition with reason', async () => {
      const spy = vi
        .spyOn(authApiService, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: { id: 'api-1', status: 'Approved' } } as any);

      await reviewAdminApi('api-1', 'Approved', ' Compliant with standards ');
      expect(spy).toHaveBeenCalledWith(
        '/api/admin/apis/api-1/review',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ next: 'Approved', reason: 'Compliant with standards' }),
        })
      );
    });
  });

  describe('US-14: Enterprise Audit Logs', () => {
    it('listAdminAuditLogs passes all optional query filters', async () => {
      const mockPage: AdminAuditLogsPage = {
        items: [],
        total: 0,
        page: 1,
        pageSize: 25,
      };

      const spy = vi
        .spyOn(authApiService, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: mockPage } as any);

      await listAdminAuditLogs({
        page: 1,
        pageSize: 25,
        targetType: 'API',
        action: 'API_STATUS_CHANGED',
      });

      const url = spy.mock.calls[0][0];
      expect(url).toContain('/api/admin/audit-logs?');
      expect(url).toContain('targetType=API');
      expect(url).toContain('action=API_STATUS_CHANGED');
    });

    it('getAdminAuditActions returns list of action strings', async () => {
      const mockActions = ['API_STATUS_CHANGED', 'USER_ROLE_CHANGED'];
      const spy = vi
        .spyOn(authApiService, 'authenticatedRequest')
        .mockResolvedValueOnce({ data: mockActions } as any);

      const result = await getAdminAuditActions();
      expect(result).toEqual(mockActions);
      expect(spy).toHaveBeenCalledWith(
        '/api/admin/audit-logs/actions',
        expect.objectContaining({ method: 'GET' })
      );
    });
  });
});
