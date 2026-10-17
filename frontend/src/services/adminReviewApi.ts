import { authenticatedRequest } from './authApi';

export type VerificationDecision = 'Verified' | 'Rejected';
export type AdminVerificationStatus = 'Pending' | 'Verified' | 'Rejected';

export interface AdminProviderVerification {
  id: string;
  providerId: string;
  organizationName?: string;
  contactEmail: string;
  evidenceUrls: string[];
  status: AdminVerificationStatus;
  rejectReason?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  email: string;
  userName: string;
  providerName: string;
}

export interface AdminVerificationsPage {
  items: AdminProviderVerification[];
  total: number;
  page: number;
  pageSize: number;
}

export type AdminApiStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Published' | 'Rejected';
export type AdminApiReviewNext = 'Under Review' | 'Approved' | 'Rejected' | 'Published';

export interface AdminApiItem {
  id: string;
  providerId: string;
  name: string;
  description: string;
  category: string;
  baseUrl: string;
  tags: string[];
  status: AdminApiStatus;
  rejectionReason?: string | null;
  submittedAt?: string | null;
  approvedAt?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  providerName?: string;
  providerEmail?: string;
  accountName?: string;
}

export interface AdminApisPage {
  items: AdminApiItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminApiDossier {
  api: AdminApiItem;
  provider: {
    verification: AdminProviderVerification | null;
    providerName: string;
    email: string;
    accountName: string;
  };
  versions: Array<{
    id: string;
    apiId: string;
    version: string;
    changelog: string;
    openapiDocument?: string | null;
    createdAt?: string;
  }>;
  endpoints: Array<{
    id: string;
    apiId: string;
    versionId: string;
    method: string;
    path: string;
    description: string;
    parameters: any[];
    requestSchema?: any;
    responseExample?: any;
  }>;
  plans: Array<{
    id: string;
    apiId: string;
    name: 'Free' | 'Basic' | 'Pro';
    priceMonthly: number;
    currency: string;
    quota: number;
    rateLimit: number;
    isActive?: boolean;
  }>;
  legal: {
    id: string;
    apiId: string;
    agreementId: string;
    agreementVersion: string;
    ownershipDeclaration: string;
    distributionRights: string;
    dataClassification: string;
    processesPersonalData: boolean;
    personalDataTypes: string[];
    dataProcessingPurpose?: string | null;
    acceptedAt: string;
  } | null;
  documentation: Array<{
    id: string;
    apiId: string;
    versionId: string;
    source: string;
    content: any;
    updatedAt?: string;
  }>;
  reviews: Array<{
    id: string;
    apiId: string;
    reviewerId: string;
    fromStatus: string;
    toStatus: string;
    reason?: string | null;
    createdAt: string;
    reviewerEmail?: string;
  }>;
  domainVerification: {
    hostname: string;
    verifiedAt?: string | null;
    verificationExpiresAt?: string | null;
  } | null;
}

export interface AdminAuditLog {
  id: string;
  actorId: string | null;
  actorRole: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  detail: Record<string, unknown>;
  ip: string | null;
  createdAt: string;
}

export interface AdminAuditLogsPage {
  items: AdminAuditLog[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuditQueryOptions {
  actorId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

// ==========================================
// 1. PROVIDER VERIFICATION REVIEW (US-07)
// ==========================================

export async function listAdminVerifications(
  status: AdminVerificationStatus = 'Pending',
  page = 1,
  pageSize = 20,
  signal?: AbortSignal
): Promise<AdminVerificationsPage> {
  const params = new URLSearchParams({
    status,
    page: String(page),
    pageSize: String(pageSize),
  });
  const response = await authenticatedRequest<{ data: AdminVerificationsPage }>(
    `/api/admin/provider-verifications?${params}`,
    { method: 'GET', signal }
  );
  return response.data;
}

export async function getAdminVerification(
  providerId: string,
  signal?: AbortSignal
): Promise<AdminProviderVerification> {
  const response = await authenticatedRequest<{ data: AdminProviderVerification }>(
    `/api/admin/provider-verifications/${encodeURIComponent(providerId)}`,
    { method: 'GET', signal }
  );
  return response.data;
}

export async function reviewAdminVerification(
  providerId: string,
  decision: VerificationDecision,
  reason?: string,
  signal?: AbortSignal
): Promise<AdminProviderVerification> {
  const body: Record<string, unknown> = { decision };
  if (decision === 'Rejected' && reason?.trim()) {
    body.reason = reason.trim();
  }
  const response = await authenticatedRequest<{ data: AdminProviderVerification }>(
    `/api/admin/provider-verifications/${encodeURIComponent(providerId)}/review`,
    {
      method: 'POST',
      body: JSON.stringify(body),
      signal,
    }
  );
  return response.data;
}

// ==========================================
// 2. API PUBLISHING REVIEW (US-13)
// ==========================================

export async function listAdminApis(
  status: AdminApiStatus = 'Submitted',
  page = 1,
  pageSize = 20,
  signal?: AbortSignal
): Promise<AdminApisPage> {
  const params = new URLSearchParams({
    status,
    page: String(page),
    pageSize: String(pageSize),
  });
  const response = await authenticatedRequest<{ data: AdminApisPage }>(
    `/api/admin/apis?${params}`,
    { method: 'GET', signal }
  );
  return response.data;
}

export async function getAdminApiDossier(
  apiId: string,
  signal?: AbortSignal
): Promise<AdminApiDossier> {
  const response = await authenticatedRequest<{ data: AdminApiDossier }>(
    `/api/admin/apis/${encodeURIComponent(apiId)}/dossier`,
    { method: 'GET', signal }
  );
  return response.data;
}

export async function reviewAdminApi(
  apiId: string,
  next: AdminApiReviewNext,
  reason?: string,
  signal?: AbortSignal
): Promise<{ id: string; status: AdminApiStatus }> {
  const body: Record<string, unknown> = { next };
  if (reason?.trim()) {
    body.reason = reason.trim();
  }
  const response = await authenticatedRequest<{ data: { id: string; status: AdminApiStatus } }>(
    `/api/admin/apis/${encodeURIComponent(apiId)}/review`,
    {
      method: 'POST',
      body: JSON.stringify(body),
      signal,
    }
  );
  return response.data;
}

// ==========================================
// 3. AUDIT LOGS (US-14)
// ==========================================

export async function listAdminAuditLogs(
  query: AuditQueryOptions = {},
  signal?: AbortSignal
): Promise<AdminAuditLogsPage> {
  const params = new URLSearchParams({
    page: String(query.page || 1),
    pageSize: String(query.pageSize || 20),
  });
  if (query.actorId) params.set('actorId', query.actorId);
  if (query.action) params.set('action', query.action);
  if (query.targetType) params.set('targetType', query.targetType);
  if (query.targetId) params.set('targetId', query.targetId);
  if (query.from) params.set('from', query.from);
  if (query.to) params.set('to', query.to);

  const response = await authenticatedRequest<{ data: AdminAuditLogsPage }>(
    `/api/admin/audit-logs?${params}`,
    { method: 'GET', signal }
  );
  return response.data;
}

export async function getAdminAuditActions(signal?: AbortSignal): Promise<string[]> {
  const response = await authenticatedRequest<{ data: string[] }>(
    '/api/admin/audit-logs/actions',
    { method: 'GET', signal }
  );
  return response.data;
}
