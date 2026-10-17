import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PublishingWorkflowPage } from '../pages/provider/PublishingWorkflowPage';
import * as providerApiModule from '../services/providerApi';
import type {
  ProviderApi,
  PublishStatus,
  ProviderVerification,
  ProviderEndpoint,
  ProviderPlan,
  ProviderLegal,
  DomainVerificationStatus,
  ProviderAgreement,
  ProviderDocumentation,
} from '../services/providerTypes';

describe('PublishingWorkflowPage component tests', () => {
  const mockApis: ProviderApi[] = [
    {
      id: 'api-1',
      providerId: 'prov-1',
      name: 'Smart Search API',
      description: 'Semantic vector search',
      category: 'Machine Learning & AI',
      baseUrl: 'https://search.example.com',
      status: 'Draft',
      tags: ['search', 'ai'],
      createdAt: '2026-10-10T00:00:00Z',
      updatedAt: '2026-10-10T00:00:00Z',
    },
  ];

  const mockPublishStatus: PublishStatus = {
    id: 'api-1',
    status: 'Draft',
    submittedAt: null,
    approvedAt: null,
    publishedAt: null,
  };

  const mockVerification: ProviderVerification = {
    providerId: 'prov-1',
    legalName: 'AI Corp Ltd',
    businessRegNumber: '0102030405',
    taxCode: '8888999900',
    contactEmail: 'contact@aicorp.vn',
    contactPhone: '+84901234567',
    registeredAddress: '123 Tech Park, Hanoi',
    status: 'Verified',
    submittedAt: '2026-10-01T00:00:00Z',
    reviewedAt: '2026-10-02T00:00:00Z',
  };

  const mockEndpoints: ProviderEndpoint[] = [
    {
      id: 'ep-1',
      apiId: 'api-1',
      versionId: 'ver-1',
      method: 'POST',
      path: '/v1/search',
      description: 'Perform search query',
      parameters: [],
      requestSchema: { type: 'object' },
      responseExample: { results: [] },
      createdAt: '2026-10-10T00:00:00Z',
    },
  ];

  const mockPlans: ProviderPlan[] = [
    {
      id: 'plan-1',
      apiId: 'api-1',
      name: 'Free',
      priceMonthly: 0,
      currency: 'USD',
      quota: 1000,
      rateLimit: 10,
      createdAt: '2026-10-10T00:00:00Z',
    },
  ];

  const mockLegal: ProviderLegal = {
    id: 'leg-1',
    apiId: 'api-1',
    agreementId: 'agr-1',
    agreementVersion: 'v1.0.0',
    ownershipDeclaration: 'API do chính Provider phát triển và sở hữu (First-Party Owner)',
    distributionRights: 'Sở hữu toàn diện bản quyền mã nguồn',
    dataClassification: 'Public',
    acceptedAt: '2026-10-10T00:00:00Z',
    processesPersonalData: false,
  };

  const mockDomainVerification: DomainVerificationStatus = {
    hostname: 'search.example.com',
    verified: true,
    verificationExpiresAt: '2099-01-01T00:00:00Z',
    verifiedAt: '2026-10-10T00:00:00Z',
  };

  const mockAgreement: ProviderAgreement = {
    id: 'agr-1',
    version: 'v1.0.0',
    content: 'Thỏa thuận mẫu',
    effectiveAt: '2026-01-01T00:00:00Z',
  };

  const mockDocs: ProviderDocumentation[] = [
    {
      id: 'doc-1',
      apiId: 'api-1',
      versionId: 'ver-1',
      source: 'OPENAPI_IMPORT',
      content: { paths: { '/v1/search': { post: {} } } },
      updatedAt: '2026-10-10T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders workflow stage pipeline and readiness checklist when all 4 conditions met', async () => {
    vi.spyOn(providerApiModule, 'listProviderApis').mockResolvedValue({
      items: mockApis,
      total: 1,
      page: 1,
      pageSize: 100,
    });
    vi.spyOn(providerApiModule, 'getProviderPublishStatus').mockResolvedValue(mockPublishStatus);
    vi.spyOn(providerApiModule, 'getProviderVerification').mockResolvedValue(mockVerification);
    vi.spyOn(providerApiModule, 'listProviderEndpoints').mockResolvedValue(mockEndpoints);
    vi.spyOn(providerApiModule, 'listProviderPlans').mockResolvedValue(mockPlans);
    vi.spyOn(providerApiModule, 'getProviderLegal').mockResolvedValue(mockLegal);
    vi.spyOn(providerApiModule, 'getProviderDomainVerification').mockResolvedValue(mockDomainVerification);
    vi.spyOn(providerApiModule, 'getProviderAgreement').mockResolvedValue(mockAgreement);
    vi.spyOn(providerApiModule, 'listProviderDocumentation').mockResolvedValue(mockDocs);

    render(
      <MemoryRouter initialEntries={['/provider/workflow?api=api-1']}>
        <PublishingWorkflowPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Loading workflow page/i)).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('Smart Search API')).toBeDefined();
      expect(screen.getByText(/Publishing Workflow & Status Tracker|Quy trình Xuất bản & Theo dõi Trạng thái/i)).toBeDefined();
    });

    // Check pipeline stages
    expect(screen.getByText(/1\. Bản nháp/i)).toBeDefined();
    expect(screen.getByText(/2\. Đã nộp duyệt/i)).toBeDefined();
    expect(screen.getByText(/3\. Đang thẩm định/i)).toBeDefined();
    expect(screen.getByText(/4\. Đã duyệt/i)).toBeDefined();
    expect(screen.getByText(/5\. Đã xuất bản/i)).toBeDefined();

    // Check 5 readiness checklist items
    expect(screen.getByText(/1\. Xác minh Danh tính Nhà cung cấp/i)).toBeDefined();
    expect(screen.getByText(/2\. Định tuyến Endpoint/i)).toBeDefined();
    expect(screen.getByText(/3\. Bảng giá & Gói cước/i)).toBeDefined();
    expect(screen.getByText(/4\. Cam kết Pháp lý & Phân loại Dữ liệu/i)).toBeDefined();
    expect(screen.getByText(/5\. Xác minh Quyền kiểm soát Tên miền Upstream/i)).toBeDefined();

    // Button should be enabled because all 5 checklist conditions are true
    const submitBtn = screen.getByRole('button', { name: /Nộp duyệt cho Quản trị viên/i });
    expect(submitBtn.hasAttribute('disabled')).toBe(false);
  });

  it('disables submit button and shows action link when an item is missing', async () => {
    vi.spyOn(providerApiModule, 'listProviderApis').mockResolvedValue({
      items: mockApis,
      total: 1,
      page: 1,
      pageSize: 100,
    });
    vi.spyOn(providerApiModule, 'getProviderPublishStatus').mockResolvedValue(mockPublishStatus);
    vi.spyOn(providerApiModule, 'getProviderVerification').mockResolvedValue({
      ...mockVerification,
      status: 'Draft', // NOT Verified
    });
    vi.spyOn(providerApiModule, 'listProviderEndpoints').mockResolvedValue([]); // No endpoints
    vi.spyOn(providerApiModule, 'listProviderPlans').mockResolvedValue(mockPlans);
    vi.spyOn(providerApiModule, 'getProviderLegal').mockResolvedValue(mockLegal);
    vi.spyOn(providerApiModule, 'getProviderDomainVerification').mockResolvedValue({
      hostname: 'search.example.com',
      verified: false,
    });
    vi.spyOn(providerApiModule, 'getProviderAgreement').mockResolvedValue(mockAgreement);
    vi.spyOn(providerApiModule, 'listProviderDocumentation').mockResolvedValue(mockDocs);

    render(
      <MemoryRouter initialEntries={['/provider/workflow?api=api-1']}>
        <PublishingWorkflowPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Smart Search API')).toBeDefined();
    });

    // Check action links for missing items
    expect(screen.getByRole('button', { name: /Xác minh ngay/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Thêm Endpoint/i })).toBeDefined();

    // Submit button should be disabled
    const submitBtn = screen.getByRole('button', { name: /Nộp duyệt cho Quản trị viên/i });
    expect(submitBtn.hasAttribute('disabled')).toBe(true);
  });

  it('submits API for review when button is clicked', async () => {
    vi.spyOn(providerApiModule, 'listProviderApis').mockResolvedValue({
      items: mockApis,
      total: 1,
      page: 1,
      pageSize: 100,
    });
    vi.spyOn(providerApiModule, 'getProviderPublishStatus').mockResolvedValue(mockPublishStatus);
    vi.spyOn(providerApiModule, 'getProviderVerification').mockResolvedValue(mockVerification);
    vi.spyOn(providerApiModule, 'listProviderEndpoints').mockResolvedValue(mockEndpoints);
    vi.spyOn(providerApiModule, 'listProviderPlans').mockResolvedValue(mockPlans);
    vi.spyOn(providerApiModule, 'getProviderLegal').mockResolvedValue(mockLegal);
    vi.spyOn(providerApiModule, 'getProviderDomainVerification').mockResolvedValue(mockDomainVerification);
    vi.spyOn(providerApiModule, 'getProviderAgreement').mockResolvedValue(mockAgreement);
    vi.spyOn(providerApiModule, 'listProviderDocumentation').mockResolvedValue(mockDocs);

    const submitReviewSpy = vi.spyOn(providerApiModule, 'submitProviderApiReview').mockResolvedValue({
      ...mockApis[0],
      status: 'Submitted',
    });

    render(
      <MemoryRouter initialEntries={['/provider/workflow?api=api-1']}>
        <PublishingWorkflowPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Smart Search API')).toBeDefined();
    });

    const submitBtn = screen.getByRole('button', { name: /Nộp duyệt cho Quản trị viên/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitReviewSpy).toHaveBeenCalledWith('api-1');
      expect(screen.getByText(/Đã nộp hồ sơ API thành công/i)).toBeDefined();
    });
  });

  describe('Finding F1 & F5 regression tests', () => {
    it('F1: disables submit and prompts sync when endpoint method or path is not documented in OpenAPI', async () => {
      vi.spyOn(providerApiModule, 'listProviderApis').mockResolvedValue({
        items: mockApis,
        total: 1,
        page: 1,
        pageSize: 100,
      });
      vi.spyOn(providerApiModule, 'getProviderPublishStatus').mockResolvedValue(mockPublishStatus);
      vi.spyOn(providerApiModule, 'getProviderVerification').mockResolvedValue(mockVerification);
      // Endpoint is POST /v1/search
      vi.spyOn(providerApiModule, 'listProviderEndpoints').mockResolvedValue(mockEndpoints);
      vi.spyOn(providerApiModule, 'listProviderPlans').mockResolvedValue(mockPlans);
      vi.spyOn(providerApiModule, 'getProviderLegal').mockResolvedValue(mockLegal);
      vi.spyOn(providerApiModule, 'getProviderDomainVerification').mockResolvedValue(mockDomainVerification);
      vi.spyOn(providerApiModule, 'getProviderAgreement').mockResolvedValue(mockAgreement);
      // Doc only documents GET /v1/search, NOT post
      vi.spyOn(providerApiModule, 'listProviderDocumentation').mockResolvedValue([
        {
          id: 'doc-1',
          apiId: 'api-1',
          versionId: 'ver-1',
          source: 'OPENAPI_IMPORT',
          content: { paths: { '/v1/search': { get: {} } } },
          updatedAt: '2026-10-10T00:00:00Z',
        },
      ]);

      render(
        <MemoryRouter initialEntries={['/provider/workflow?api=api-1']}>
          <PublishingWorkflowPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Smart Search API')).toBeDefined();
      });

      // Endpoint documentation check should fail
      expect(screen.getByText(/chỉ có 0\/1 endpoint được tài liệu hóa đồng bộ trong OpenAPI/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /Đồng bộ OpenAPI/i })).toBeDefined();

      const submitBtn = screen.getByRole('button', { name: /Nộp duyệt cho Quản trị viên/i });
      expect(submitBtn.hasAttribute('disabled')).toBe(true);
    });

    it('F1: fails documentation check when OpenAPI doc versionId does not match endpoint versionId', async () => {
      vi.spyOn(providerApiModule, 'listProviderApis').mockResolvedValue({
        items: mockApis,
        total: 1,
        page: 1,
        pageSize: 100,
      });
      vi.spyOn(providerApiModule, 'getProviderPublishStatus').mockResolvedValue(mockPublishStatus);
      vi.spyOn(providerApiModule, 'getProviderVerification').mockResolvedValue(mockVerification);
      vi.spyOn(providerApiModule, 'listProviderEndpoints').mockResolvedValue(mockEndpoints); // versionId: 'ver-1'
      vi.spyOn(providerApiModule, 'listProviderPlans').mockResolvedValue(mockPlans);
      vi.spyOn(providerApiModule, 'getProviderLegal').mockResolvedValue(mockLegal);
      vi.spyOn(providerApiModule, 'getProviderDomainVerification').mockResolvedValue(mockDomainVerification);
      vi.spyOn(providerApiModule, 'getProviderAgreement').mockResolvedValue(mockAgreement);
      // Doc belongs to 'ver-2', not 'ver-1'
      vi.spyOn(providerApiModule, 'listProviderDocumentation').mockResolvedValue([
        {
          id: 'doc-1',
          apiId: 'api-1',
          versionId: 'ver-2',
          source: 'OPENAPI_IMPORT',
          content: { paths: { '/v1/search': { post: {} } } },
          updatedAt: '2026-10-10T00:00:00Z',
        },
      ]);

      render(
        <MemoryRouter initialEntries={['/provider/workflow?api=api-1']}>
          <PublishingWorkflowPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Smart Search API')).toBeDefined();
      });

      expect(screen.getByText(/chỉ có 0\/1 endpoint được tài liệu hóa đồng bộ trong OpenAPI/i)).toBeDefined();
      const submitBtn = screen.getByRole('button', { name: /Nộp duyệt cho Quản trị viên/i });
      expect(submitBtn.hasAttribute('disabled')).toBe(true);
    });

    it('F5: captures listProviderDocumentation rejection in error banner and displays retry button', async () => {
      vi.spyOn(providerApiModule, 'listProviderApis').mockResolvedValue({
        items: mockApis,
        total: 1,
        page: 1,
        pageSize: 100,
      });
      vi.spyOn(providerApiModule, 'getProviderPublishStatus').mockResolvedValue(mockPublishStatus);
      vi.spyOn(providerApiModule, 'getProviderVerification').mockResolvedValue(mockVerification);
      vi.spyOn(providerApiModule, 'listProviderEndpoints').mockResolvedValue(mockEndpoints);
      vi.spyOn(providerApiModule, 'listProviderPlans').mockResolvedValue(mockPlans);
      vi.spyOn(providerApiModule, 'getProviderLegal').mockResolvedValue(mockLegal);
      vi.spyOn(providerApiModule, 'getProviderDomainVerification').mockResolvedValue(mockDomainVerification);
      vi.spyOn(providerApiModule, 'getProviderAgreement').mockResolvedValue(mockAgreement);
      // listProviderDocumentation fails
      vi.spyOn(providerApiModule, 'listProviderDocumentation').mockRejectedValue(new Error('Network doc failure'));

      render(
        <MemoryRouter initialEntries={['/provider/workflow?api=api-1']}>
          <PublishingWorkflowPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Không thể tải đầy đủ thông tin kiểm tra \(tài liệu OpenAPI\)/i)).toBeDefined();
      });

      const retryBtn = screen.getByRole('button', { name: /Tải lại dữ liệu/i });
      expect(retryBtn).toBeDefined();
    });
  });
});
