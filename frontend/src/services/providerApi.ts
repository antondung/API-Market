import { authenticatedRequest, ApiError, formatBackendErrorMessage } from './authApi';
import type {
  OpenApiImportResult,
  ProviderAgreement,
  ProviderApi,
  ProviderApiInput,
  ProviderApisPage,
  ProviderDocumentation,
  ProviderEndpoint,
  ProviderEndpointInput,
  ProviderLegal,
  ProviderLegalInput,
  ProviderPlan,
  ProviderPlanInput,
  ProviderVerification,
  ProviderVersion,
  ProviderVersionInput,
  PublishStatus,
  VerificationInput,
} from './providerTypes';

const MAX_IMPORT_SIZE = 1024 * 1024; // 1 MiB

// ==========================================
// 1. AGREEMENT & VERIFICATION (US-06, US-08)
// ==========================================

export async function getProviderAgreement(signal?: AbortSignal): Promise<ProviderAgreement> {
  const response = await authenticatedRequest<{ data: ProviderAgreement }>('/api/provider/agreement', {
    method: 'GET',
    signal,
  });
  return response.data;
}

export async function getProviderVerification(signal?: AbortSignal): Promise<ProviderVerification | null> {
  try {
    const response = await authenticatedRequest<{ data: ProviderVerification | null }>('/api/provider/verification', {
      method: 'GET',
      signal,
    });
    return response.data ?? null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function submitProviderVerification(
  input: VerificationInput,
  signal?: AbortSignal
): Promise<ProviderVerification> {
  if (!input.organizationName?.trim()) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Tên tổ chức / doanh nghiệp không được để trống.');
  }
  if (!input.contactEmail?.trim() || !input.contactEmail.includes('@')) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Email liên hệ không hợp lệ.');
  }
  if (!Array.isArray(input.evidenceUrls) || input.evidenceUrls.length === 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Vui lòng cung cấp ít nhất 1 liên kết tài liệu minh chứng.');
  }
  if (input.evidenceUrls.length > 10) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Tối đa 10 liên kết tài liệu minh chứng.');
  }

  const response = await authenticatedRequest<{ data: ProviderVerification }>('/api/provider/verification', {
    method: 'POST',
    body: JSON.stringify({
      organizationName: input.organizationName.trim(),
      contactEmail: input.contactEmail.trim(),
      evidenceUrls: input.evidenceUrls.map(u => u.trim()),
    }),
    signal,
  });
  return response.data;
}

// ==========================================
// 2. APIS CRUD (US-09)
// ==========================================

export async function listProviderApis(
  page = 1,
  pageSize = 20,
  signal?: AbortSignal
): Promise<ProviderApisPage> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  const response = await authenticatedRequest<{ data: ProviderApisPage }>(`/api/provider/apis?${params}`, {
    method: 'GET',
    signal,
  });
  return response.data;
}

export async function createProviderApi(
  input: ProviderApiInput,
  signal?: AbortSignal
): Promise<ProviderApi> {
  const response = await authenticatedRequest<{ data: ProviderApi }>('/api/provider/apis', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name.trim(),
      description: input.description.trim(),
      category: input.category.trim(),
      baseUrl: input.baseUrl.trim(),
      tags: input.tags.map(t => t.trim()),
    }),
    signal,
  });
  return response.data;
}

export async function getProviderApi(id: string, signal?: AbortSignal): Promise<ProviderApi> {
  const response = await authenticatedRequest<{ data: ProviderApi }>(
    `/api/provider/apis/${encodeURIComponent(id)}`,
    { method: 'GET', signal }
  );
  return response.data;
}

export async function updateProviderApi(
  id: string,
  input: ProviderApiInput,
  signal?: AbortSignal
): Promise<ProviderApi> {
  const response = await authenticatedRequest<{ data: ProviderApi }>(
    `/api/provider/apis/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        name: input.name.trim(),
        description: input.description.trim(),
        category: input.category.trim(),
        baseUrl: input.baseUrl.trim(),
        tags: input.tags.map(t => t.trim()),
      }),
      signal,
    }
  );
  return response.data;
}

export async function deleteProviderApi(id: string, signal?: AbortSignal): Promise<void> {
  await authenticatedRequest<void>(`/api/provider/apis/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    signal,
  });
}

// ==========================================
// 3. VERSIONS CRUD (US-09)
// ==========================================

export async function listProviderVersions(apiId: string, signal?: AbortSignal): Promise<ProviderVersion[]> {
  const response = await authenticatedRequest<{ data: ProviderVersion[] }>(
    `/api/provider/apis/${encodeURIComponent(apiId)}/versions`,
    { method: 'GET', signal }
  );
  return response.data;
}

export async function createProviderVersion(
  apiId: string,
  input: ProviderVersionInput,
  signal?: AbortSignal
): Promise<ProviderVersion> {
  const response = await authenticatedRequest<{ data: ProviderVersion }>(
    `/api/provider/apis/${encodeURIComponent(apiId)}/versions`,
    {
      method: 'POST',
      body: JSON.stringify({
        version: input.version.trim(),
        changelog: input.changelog.trim(),
      }),
      signal,
    }
  );
  return response.data;
}

export async function updateProviderVersion(
  apiId: string,
  vid: string,
  input: ProviderVersionInput,
  signal?: AbortSignal
): Promise<ProviderVersion> {
  const response = await authenticatedRequest<{ data: ProviderVersion }>(
    `/api/provider/apis/${encodeURIComponent(apiId)}/versions/${encodeURIComponent(vid)}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        version: input.version.trim(),
        changelog: input.changelog.trim(),
      }),
      signal,
    }
  );
  return response.data;
}

export async function deleteProviderVersion(apiId: string, vid: string, signal?: AbortSignal): Promise<void> {
  await authenticatedRequest<void>(
    `/api/provider/apis/${encodeURIComponent(apiId)}/versions/${encodeURIComponent(vid)}`,
    { method: 'DELETE', signal }
  );
}

// ==========================================
// 4. ENDPOINTS CRUD (US-09)
// ==========================================

export async function listProviderEndpoints(apiId: string, signal?: AbortSignal): Promise<ProviderEndpoint[]> {
  const response = await authenticatedRequest<{ data: ProviderEndpoint[] }>(
    `/api/provider/apis/${encodeURIComponent(apiId)}/endpoints`,
    { method: 'GET', signal }
  );
  return response.data;
}

export async function createProviderEndpoint(
  apiId: string,
  input: ProviderEndpointInput,
  signal?: AbortSignal
): Promise<ProviderEndpoint> {
  const response = await authenticatedRequest<{ data: ProviderEndpoint }>(
    `/api/provider/apis/${encodeURIComponent(apiId)}/endpoints`,
    {
      method: 'POST',
      body: JSON.stringify({
        versionId: input.versionId,
        method: input.method,
        path: input.path.startsWith('/') ? input.path.trim() : `/${input.path.trim()}`,
        description: input.description.trim(),
        parameters: input.parameters ?? [],
        requestSchema: input.requestSchema ?? null,
        responseExample: input.responseExample ?? null,
      }),
      signal,
    }
  );
  return response.data;
}

export async function updateProviderEndpoint(
  apiId: string,
  eid: string,
  input: ProviderEndpointInput,
  signal?: AbortSignal
): Promise<ProviderEndpoint> {
  const response = await authenticatedRequest<{ data: ProviderEndpoint }>(
    `/api/provider/apis/${encodeURIComponent(apiId)}/endpoints/${encodeURIComponent(eid)}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        versionId: input.versionId,
        method: input.method,
        path: input.path.startsWith('/') ? input.path.trim() : `/${input.path.trim()}`,
        description: input.description.trim(),
        parameters: input.parameters ?? [],
        requestSchema: input.requestSchema ?? null,
        responseExample: input.responseExample ?? null,
      }),
      signal,
    }
  );
  return response.data;
}

export async function deleteProviderEndpoint(apiId: string, eid: string, signal?: AbortSignal): Promise<void> {
  await authenticatedRequest<void>(
    `/api/provider/apis/${encodeURIComponent(apiId)}/endpoints/${encodeURIComponent(eid)}`,
    { method: 'DELETE', signal }
  );
}

// ==========================================
// 5. PLANS CRUD (US-11)
// ==========================================

export async function listProviderPlans(apiId: string, signal?: AbortSignal): Promise<ProviderPlan[]> {
  const response = await authenticatedRequest<{ data: ProviderPlan[] }>(
    `/api/provider/apis/${encodeURIComponent(apiId)}/plans`,
    { method: 'GET', signal }
  );
  return response.data;
}

export async function createProviderPlan(
  apiId: string,
  input: ProviderPlanInput,
  signal?: AbortSignal
): Promise<ProviderPlan> {
  const response = await authenticatedRequest<{ data: ProviderPlan }>(
    `/api/provider/apis/${encodeURIComponent(apiId)}/plans`,
    {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        priceMonthly: input.name === 'Free' ? 0 : input.priceMonthly,
        currency: input.currency.toUpperCase(),
        quota: input.quota,
        rateLimit: input.rateLimit,
      }),
      signal,
    }
  );
  return response.data;
}

export async function updateProviderPlan(
  apiId: string,
  pid: string,
  input: ProviderPlanInput,
  signal?: AbortSignal
): Promise<ProviderPlan> {
  const response = await authenticatedRequest<{ data: ProviderPlan }>(
    `/api/provider/apis/${encodeURIComponent(apiId)}/plans/${encodeURIComponent(pid)}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        name: input.name,
        priceMonthly: input.name === 'Free' ? 0 : input.priceMonthly,
        currency: input.currency.toUpperCase(),
        quota: input.quota,
        rateLimit: input.rateLimit,
      }),
      signal,
    }
  );
  return response.data;
}

export async function deleteProviderPlan(apiId: string, pid: string, signal?: AbortSignal): Promise<void> {
  await authenticatedRequest<void>(
    `/api/provider/apis/${encodeURIComponent(apiId)}/plans/${encodeURIComponent(pid)}`,
    { method: 'DELETE', signal }
  );
}

// ==========================================
// 6. OPENAPI IMPORT & DOCUMENTATION (US-10)
// ==========================================

export async function listProviderDocumentation(
  apiId: string,
  signal?: AbortSignal
): Promise<ProviderDocumentation[]> {
  const response = await authenticatedRequest<{ data: ProviderDocumentation[] }>(
    `/api/provider/apis/${encodeURIComponent(apiId)}/documentation`,
    { method: 'GET', signal }
  );
  return response.data;
}

export async function importOpenApiFile(
  apiId: string,
  versionId: string,
  file: File,
  signal?: AbortSignal
): Promise<OpenApiImportResult> {
  if (!versionId || !/^[1-9][0-9]{0,9}$/.test(versionId)) {
    throw new ApiError(400, 'INVALID_VERSION_ID', 'ID phiên bản API không hợp lệ.');
  }

  if (file.size > MAX_IMPORT_SIZE) {
    throw new ApiError(
      413,
      'IMPORT_FILE_TOO_LARGE',
      `Tệp tài liệu vượt quá kích thước tối đa cho phép (1 MiB). Kích thước hiện tại: ${(file.size / 1024).toFixed(1)} KB.`
    );
  }

  const isYaml = /\.(ya?ml)$/i.test(file.name);
  const isJson = /\.json$/i.test(file.name);
  if (!isJson && !isYaml) {
    throw new ApiError(
      415,
      'IMPORT_FILE_TYPE',
      'Định dạng tệp không được hỗ trợ. Vui lòng tải lên tệp OpenAPI dạng .json hoặc .yaml / .yml.'
    );
  }

  const formData = new FormData();
  formData.append('versionId', versionId);
  formData.append('file', file, file.name);

  const response = await authenticatedRequest<{ data: OpenApiImportResult }>(
    `/api/provider/apis/${encodeURIComponent(apiId)}/import-openapi`,
    {
      method: 'POST',
      body: formData,
      signal,
    }
  );
  return response.data;
}

// ==========================================
// 7. LEGAL & AGREEMENT (US-08)
// ==========================================

export async function getProviderLegal(apiId: string, signal?: AbortSignal): Promise<ProviderLegal | null> {
  try {
    const response = await authenticatedRequest<{ data: ProviderLegal | null }>(
      `/api/provider/apis/${encodeURIComponent(apiId)}/legal`,
      { method: 'GET', signal }
    );
    return response.data ?? null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function saveProviderLegal(
  apiId: string,
  input: ProviderLegalInput,
  signal?: AbortSignal
): Promise<ProviderLegal> {
  const response = await authenticatedRequest<{ data: ProviderLegal }>(
    `/api/provider/apis/${encodeURIComponent(apiId)}/legal`,
    {
      method: 'PUT',
      body: JSON.stringify({
        ownershipDeclaration: input.ownershipDeclaration.trim(),
        distributionRights: input.distributionRights.trim(),
        dataClassification: input.dataClassification,
        agreementVersion: input.agreementVersion.trim(),
        accepted: true,
      }),
      signal,
    }
  );
  return response.data;
}

// ==========================================
// 8. PUBLISHING & WORKFLOW (US-12)
// ==========================================

export async function getProviderPublishStatus(
  apiId: string,
  signal?: AbortSignal
): Promise<PublishStatus> {
  const response = await authenticatedRequest<{ data: PublishStatus }>(
    `/api/provider/apis/${encodeURIComponent(apiId)}/publish-status`,
    { method: 'GET', signal }
  );
  return response.data;
}

export async function submitProviderApiReview(
  apiId: string,
  signal?: AbortSignal
): Promise<ProviderApi> {
  const response = await authenticatedRequest<{ data: ProviderApi }>(
    `/api/provider/apis/${encodeURIComponent(apiId)}/submit-review`,
    {
      method: 'POST',
      body: JSON.stringify({}),
      signal,
    }
  );
  return response.data;
}

export async function reopenProviderApi(
  apiId: string,
  signal?: AbortSignal
): Promise<ProviderApi> {
  const response = await authenticatedRequest<{ data: ProviderApi }>(
    `/api/provider/apis/${encodeURIComponent(apiId)}/reopen`,
    {
      method: 'POST',
      body: JSON.stringify({}),
      signal,
    }
  );
  return response.data;
}

// ==========================================
// 9. ERROR FORMATTER
// ==========================================

export function formatProviderErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'PROVIDER_NOT_VERIFIED') {
      return 'Tài khoản Provider chưa được xác minh hoặc hồ sơ chưa được duyệt. Bạn không thể tạo hoặc chỉnh sửa API.';
    }
    if (error.code === 'VERIFICATION_EXISTS') {
      return 'Hồ sơ xác minh của bạn đang chờ duyệt hoặc đã được xác minh thành công. Không thể nộp lại hồ sơ mới.';
    }
    if (error.code === 'INVALID_STATE') {
      return 'Thao tác không hợp lệ với trạng thái hiện tại của API (chỉ được phép sửa đổi khi ở trạng thái Draft).';
    }
    if (error.code === 'AGREEMENT_UNAVAILABLE') {
      return 'Chưa có Điều khoản Thỏa thuận Nhà cung cấp (Agreement) có hiệu lực trên hệ thống.';
    }
    if (error.code === 'AGREEMENT_CHANGED') {
      return 'Phiên bản Điều khoản Thỏa thuận Nhà cung cấp đã thay đổi. Vui lòng đọc và chấp nhận phiên bản điều khoản mới nhất.';
    }
    if (error.code === 'SUBMISSION_INCOMPLETE') {
      return `Hồ sơ nộp duyệt chưa đầy đủ điều kiện: ${error.message}`;
    }
    if (error.code === 'IMPORT_FILE_TOO_LARGE' || error.status === 413) {
      return 'Kích thước tệp tài liệu OpenAPI vượt quá giới hạn tối đa 1 MiB.';
    }
    if (error.code === 'IMPORT_FILE_TYPE' || error.status === 415) {
      return 'Định dạng tệp không hợp lệ. Chỉ chấp nhận tệp OpenAPI/Swagger dạng .json hoặc .yaml/.yml.';
    }
    if (error.code === 'OPENAPI_IMPORT_INVALID') {
      if (error.details?.length) {
        return `Tệp tài liệu không hợp lệ: ${error.details.map(d => `${d.field}: ${d.message}`).join('; ')}`;
      }
      return `Tệp tài liệu OpenAPI không hợp lệ: ${error.message}`;
    }
    if (error.code === 'RESOURCE_EXISTS' || error.status === 409) {
      return 'Dữ liệu đã tồn tại hoặc xung đột với trạng thái hiện tại của hệ thống.';
    }
    if (error.status === 404) {
      return 'Không tìm thấy tài nguyên yêu cầu (API, phiên bản hoặc endpoint không tồn tại).';
    }
  }
  return formatBackendErrorMessage(error);
}
