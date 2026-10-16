import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as authApiModule from '../services/authApi';
import { ApiError } from '../services/authApi';
import * as providerApi from '../services/providerApi';

describe('providerApi service unit tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Agreement & Verification', () => {
    it('getProviderAgreement calls GET /api/provider/agreement', async () => {
      const mockAgreement = {
        id: '1',
        version: 'v1.0.0',
        content: 'Platform Agreement Terms',
        effectiveAt: '2026-10-01T00:00:00Z',
      };
      const reqSpy = vi.spyOn(authApiModule, 'authenticatedRequest').mockResolvedValue({
        data: mockAgreement,
      });

      const result = await providerApi.getProviderAgreement();
      expect(reqSpy).toHaveBeenCalledWith('/api/provider/agreement', expect.objectContaining({ method: 'GET' }));
      expect(result).toEqual(mockAgreement);
    });

    it('getProviderVerification returns verification data on success', async () => {
      const mockVer = {
        id: '1',
        providerId: 'prov-1',
        organizationName: 'Acme Corp',
        contactEmail: 'contact@acme.com',
        evidenceUrls: ['https://acme.com/license'],
        status: 'Pending' as const,
        submittedAt: '2026-10-15T00:00:00Z',
      };
      vi.spyOn(authApiModule, 'authenticatedRequest').mockResolvedValue({ data: mockVer });

      const result = await providerApi.getProviderVerification();
      expect(result).toEqual(mockVer);
    });

    it('getProviderVerification returns null when backend returns 404', async () => {
      vi.spyOn(authApiModule, 'authenticatedRequest').mockRejectedValue(
        new ApiError(404, 'NOT_FOUND', 'Not found')
      );

      const result = await providerApi.getProviderVerification();
      expect(result).toBeNull();
    });

    it('submitProviderVerification validates client input before network call', async () => {
      await expect(
        providerApi.submitProviderVerification({
          organizationName: '',
          contactEmail: 'contact@acme.com',
          evidenceUrls: ['https://acme.com'],
        })
      ).rejects.toThrow('Tên tổ chức / doanh nghiệp không được để trống.');

      await expect(
        providerApi.submitProviderVerification({
          organizationName: 'Acme',
          contactEmail: 'not-an-email',
          evidenceUrls: ['https://acme.com'],
        })
      ).rejects.toThrow('Email liên hệ không hợp lệ.');

      await expect(
        providerApi.submitProviderVerification({
          organizationName: 'Acme',
          contactEmail: 'contact@acme.com',
          evidenceUrls: [],
        })
      ).rejects.toThrow('Vui lòng cung cấp ít nhất 1 liên kết tài liệu minh chứng.');

      await expect(
        providerApi.submitProviderVerification({
          organizationName: 'Acme',
          contactEmail: 'contact@acme.com',
          evidenceUrls: Array(11).fill('https://acme.com'),
        })
      ).rejects.toThrow('Tối đa 10 liên kết tài liệu minh chứng.');
    });

    it('submitProviderVerification sends trimmed valid payload', async () => {
      const mockRes = {
        id: '1',
        providerId: 'prov-1',
        organizationName: 'Acme Corp',
        contactEmail: 'contact@acme.com',
        evidenceUrls: ['https://acme.com/cert.pdf'],
        status: 'Pending' as const,
        submittedAt: '2026-10-15T00:00:00Z',
      };
      const reqSpy = vi.spyOn(authApiModule, 'authenticatedRequest').mockResolvedValue({ data: mockRes });

      const result = await providerApi.submitProviderVerification({
        organizationName: '  Acme Corp  ',
        contactEmail: ' contact@acme.com ',
        evidenceUrls: [' https://acme.com/cert.pdf '],
      });

      expect(reqSpy).toHaveBeenCalledWith(
        '/api/provider/verification',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            organizationName: 'Acme Corp',
            contactEmail: 'contact@acme.com',
            evidenceUrls: ['https://acme.com/cert.pdf'],
          }),
        })
      );
      expect(result).toEqual(mockRes);
    });
  });

  describe('APIs CRUD', () => {
    it('listProviderApis sends pagination query parameters', async () => {
      const reqSpy = vi.spyOn(authApiModule, 'authenticatedRequest').mockResolvedValue({
        data: { items: [], total: 0, page: 2, pageSize: 10 },
      });

      await providerApi.listProviderApis(2, 10);
      expect(reqSpy).toHaveBeenCalledWith('/api/provider/apis?page=2&pageSize=10', expect.anything());
    });

    it('createProviderApi trims strings and sends POST', async () => {
      const reqSpy = vi.spyOn(authApiModule, 'authenticatedRequest').mockResolvedValue({
        data: { id: '10', name: 'Weather API', status: 'Draft' },
      });

      await providerApi.createProviderApi({
        name: ' Weather API ',
        description: ' Realtime weather ',
        category: ' Weather & Geo ',
        baseUrl: ' https://api.weather.com ',
        tags: [' weather ', ' forecast '],
      });

      expect(reqSpy).toHaveBeenCalledWith(
        '/api/provider/apis',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            name: 'Weather API',
            description: 'Realtime weather',
            category: 'Weather & Geo',
            baseUrl: 'https://api.weather.com',
            tags: ['weather', 'forecast'],
          }),
        })
      );
    });

    it('getProviderApi, updateProviderApi, deleteProviderApi use URL-encoded ID', async () => {
      const reqSpy = vi.spyOn(authApiModule, 'authenticatedRequest').mockResolvedValue({ data: {} });

      await providerApi.getProviderApi('12');
      expect(reqSpy).toHaveBeenCalledWith('/api/provider/apis/12', expect.objectContaining({ method: 'GET' }));

      await providerApi.updateProviderApi('12', {
        name: 'New Name',
        description: 'New Desc',
        category: 'Finance',
        baseUrl: 'https://finance.com',
        tags: ['fin'],
      });
      expect(reqSpy).toHaveBeenCalledWith('/api/provider/apis/12', expect.objectContaining({ method: 'PUT' }));

      await providerApi.deleteProviderApi('12');
      expect(reqSpy).toHaveBeenCalledWith('/api/provider/apis/12', expect.objectContaining({ method: 'DELETE' }));
    });
  });

  describe('Versions & Endpoints', () => {
    it('version CRUD methods route correctly', async () => {
      const reqSpy = vi.spyOn(authApiModule, 'authenticatedRequest').mockResolvedValue({ data: [] });

      await providerApi.listProviderVersions('5');
      expect(reqSpy).toHaveBeenCalledWith('/api/provider/apis/5/versions', expect.objectContaining({ method: 'GET' }));

      await providerApi.createProviderVersion('5', { version: '1.0.0', changelog: 'Initial' });
      expect(reqSpy).toHaveBeenCalledWith('/api/provider/apis/5/versions', expect.objectContaining({ method: 'POST' }));

      await providerApi.updateProviderVersion('5', '1', { version: '1.0.1', changelog: 'Fix' });
      expect(reqSpy).toHaveBeenCalledWith('/api/provider/apis/5/versions/1', expect.objectContaining({ method: 'PUT' }));

      await providerApi.deleteProviderVersion('5', '1');
      expect(reqSpy).toHaveBeenCalledWith('/api/provider/apis/5/versions/1', expect.objectContaining({ method: 'DELETE' }));
    });

    it('endpoint CRUD methods enforce leading slash on path', async () => {
      const reqSpy = vi.spyOn(authApiModule, 'authenticatedRequest').mockResolvedValue({ data: {} });

      await providerApi.createProviderEndpoint('5', {
        versionId: '1',
        method: 'GET',
        path: 'weather/current',
        description: 'Get weather',
      });

      expect(reqSpy).toHaveBeenCalledWith(
        '/api/provider/apis/5/endpoints',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"path":"/weather/current"'),
        })
      );
    });
  });

  describe('Plans CRUD', () => {
    it('createProviderPlan forces priceMonthly=0 when plan is Free', async () => {
      const reqSpy = vi.spyOn(authApiModule, 'authenticatedRequest').mockResolvedValue({ data: {} });

      await providerApi.createProviderPlan('5', {
        name: 'Free',
        priceMonthly: 99,
        currency: 'usd',
        quota: 1000,
        rateLimit: 10,
      });

      expect(reqSpy).toHaveBeenCalledWith(
        '/api/provider/apis/5/plans',
        expect.objectContaining({
          body: JSON.stringify({
            name: 'Free',
            priceMonthly: 0,
            currency: 'USD',
            quota: 1000,
            rateLimit: 10,
          }),
        })
      );
    });
  });

  describe('OpenAPI Import', () => {
    it('importOpenApiFile rejects files exceeding 1 MiB', async () => {
      const largeFile = new File([new Uint8Array(1024 * 1024 + 10)], 'openapi.json', { type: 'application/json' });
      await expect(providerApi.importOpenApiFile('1', '1', largeFile)).rejects.toThrow(
        /vượt quá kích thước tối đa/
      );
    });

    it('importOpenApiFile rejects unsupported file extensions', async () => {
      const txtFile = new File(['openapi content'], 'spec.txt', { type: 'text/plain' });
      await expect(providerApi.importOpenApiFile('1', '1', txtFile)).rejects.toThrow(
        /Định dạng tệp không được hỗ trợ/
      );
    });

    it('importOpenApiFile rejects invalid versionId', async () => {
      const jsonFile = new File(['{"openapi":"3.0.0"}'], 'spec.json', { type: 'application/json' });
      await expect(providerApi.importOpenApiFile('1', 'invalid', jsonFile)).rejects.toThrow(
        /ID phiên bản API không hợp lệ/
      );
    });

    it('importOpenApiFile sends FormData with versionId and file', async () => {
      const reqSpy = vi.spyOn(authApiModule, 'authenticatedRequest').mockResolvedValue({
        data: { versionId: '2', endpointCount: 5, title: 'Demo API' },
      });

      const jsonFile = new File(['{"openapi":"3.0.0"}'], 'spec.json', { type: 'application/json' });
      const res = await providerApi.importOpenApiFile('1', '2', jsonFile);

      expect(reqSpy).toHaveBeenCalledWith(
        '/api/provider/apis/1/import-openapi',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
      expect(res.endpointCount).toBe(5);
    });
  });

  describe('Legal & Workflow', () => {
    it('getProviderLegal returns null on 404', async () => {
      vi.spyOn(authApiModule, 'authenticatedRequest').mockRejectedValue(
        new ApiError(404, 'NOT_FOUND', 'Legal not found')
      );
      const result = await providerApi.getProviderLegal('1');
      expect(result).toBeNull();
    });

    it('saveProviderLegal sends accepted=true and trimmed inputs', async () => {
      const reqSpy = vi.spyOn(authApiModule, 'authenticatedRequest').mockResolvedValue({ data: {} });

      await providerApi.saveProviderLegal('1', {
        ownershipDeclaration: ' I own this API ',
        distributionRights: ' Full rights granted ',
        dataClassification: 'Public',
        agreementVersion: ' v1.0.0 ',
        accepted: true,
      });

      expect(reqSpy).toHaveBeenCalledWith(
        '/api/provider/apis/1/legal',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            ownershipDeclaration: 'I own this API',
            distributionRights: 'Full rights granted',
            dataClassification: 'Public',
            agreementVersion: 'v1.0.0',
            accepted: true,
          }),
        })
      );
    });

    it('workflow submit and reopen endpoints post empty body', async () => {
      const reqSpy = vi.spyOn(authApiModule, 'authenticatedRequest').mockResolvedValue({ data: {} });

      await providerApi.submitProviderApiReview('10');
      expect(reqSpy).toHaveBeenCalledWith(
        '/api/provider/apis/10/submit-review',
        expect.objectContaining({ method: 'POST', body: '{}' })
      );

      await providerApi.reopenProviderApi('10');
      expect(reqSpy).toHaveBeenCalledWith(
        '/api/provider/apis/10/reopen',
        expect.objectContaining({ method: 'POST', body: '{}' })
      );
    });
  });

  describe('formatProviderErrorMessage', () => {
    it('translates specific provider error codes faithfully', () => {
      expect(
        providerApi.formatProviderErrorMessage(new ApiError(403, 'PROVIDER_NOT_VERIFIED', ''))
      ).toContain('Tài khoản Provider chưa được xác minh');

      expect(
        providerApi.formatProviderErrorMessage(new ApiError(409, 'VERIFICATION_EXISTS', ''))
      ).toContain('Hồ sơ xác minh của bạn đang chờ duyệt hoặc đã được xác minh');

      expect(
        providerApi.formatProviderErrorMessage(new ApiError(409, 'AGREEMENT_CHANGED', ''))
      ).toContain('Phiên bản Điều khoản Thỏa thuận Nhà cung cấp đã thay đổi');

      expect(
        providerApi.formatProviderErrorMessage(
          new ApiError(400, 'OPENAPI_IMPORT_INVALID', '', undefined, [
            { field: '/paths', message: 'Required path missing' },
          ])
        )
      ).toContain('/paths: Required path missing');
    });
  });
});
