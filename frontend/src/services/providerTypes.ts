export type VerificationStatus = 'Pending' | 'Verified' | 'Rejected' | 'Draft';

export interface ProviderVerification {
  id?: string;
  providerId: string;
  organizationName?: string;
  legalName?: string;
  businessRegNumber?: string;
  taxCode?: string;
  contactEmail: string;
  contactPhone?: string;
  registeredAddress?: string;
  evidenceUrls?: string[];
  status: VerificationStatus;
  rejectReason?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  submittedAt?: string;
}

export interface VerificationInput {
  organizationName?: string;
  legalName?: string;
  businessRegNumber?: string;
  taxCode?: string;
  contactEmail: string;
  contactPhone?: string;
  registeredAddress?: string;
  evidenceUrls?: string[];
}

export type ApiStatus = 'Draft' | 'Submitted' | 'Under Review' | 'UnderReview' | 'Approved' | 'Published' | 'Rejected';

export interface ProviderApi {
  id: string;
  providerId: string;
  name: string;
  description: string;
  category: string;
  baseUrl: string;
  tags: string[];
  status: ApiStatus;
  rejectionReason?: string | null;
  submittedAt?: string | null;
  approvedAt?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderApiInput {
  name: string;
  description: string;
  category: string;
  baseUrl: string;
  tags: string[];
}

export interface ProviderVersion {
  id: string;
  apiId: string;
  version: string;
  changelog: string;
  openapiDocument?: string | null;
  createdAt?: string;
}

export interface ProviderVersionInput {
  version: string;
  changelog: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';
export type ParameterIn = 'path' | 'query' | 'header' | 'cookie' | 'body' | 'formData';

export interface ProviderEndpointParameter {
  name: string;
  in: ParameterIn;
  required: boolean;
  type?: string;
  schema?: Record<string, unknown>;
  description?: string;
}

export interface ProviderEndpoint {
  id: string;
  apiId: string;
  versionId: string;
  method: HttpMethod;
  path: string;
  description: string;
  parameters: ProviderEndpointParameter[];
  requestSchema?: Record<string, unknown> | null;
  responseExample?: unknown;
  createdAt?: string;
}

export interface ProviderEndpointInput {
  versionId: string;
  method: HttpMethod;
  path: string;
  description: string;
  parameters?: ProviderEndpointParameter[];
  requestSchema?: Record<string, unknown> | null;
  responseExample?: unknown;
}

export type PlanTierName = 'Free' | 'Basic' | 'Pro';

export interface ProviderPlan {
  id: string;
  apiId: string;
  name: PlanTierName;
  priceMonthly: number;
  currency: string;
  quota: number;
  rateLimit: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface ProviderPlanInput {
  name: PlanTierName;
  priceMonthly: number;
  currency: string;
  quota: number;
  rateLimit: number;
}

export type DataClassification = 'Public' | 'Internal' | 'Confidential' | 'Restricted';

export interface ProviderLegal {
  id: string;
  apiId: string;
  agreementId: string;
  agreementVersion: string;
  ownershipDeclaration: string;
  distributionRights: string;
  dataClassification: DataClassification;
  acceptedAt: string;
}

export interface ProviderLegalInput {
  ownershipDeclaration: string;
  distributionRights: string;
  dataClassification: DataClassification;
  agreementVersion: string;
  accepted: true;
}

export interface ProviderAgreement {
  id: string;
  version: string;
  content: string;
  effectiveAt: string;
}

export interface ProviderDocumentation {
  id: string;
  apiId: string;
  versionId: string;
  source: string;
  content: Record<string, any>;
  updatedAt?: string;
}

export interface PublishStatus {
  id: string;
  status: ApiStatus;
  submittedAt?: string | null;
  approvedAt?: string | null;
  publishedAt?: string | null;
}

export interface OpenApiImportResult {
  versionId: string;
  endpointCount: number;
  title: string;
}

export interface ProviderApisPage {
  items: ProviderApi[];
  total: number;
  page: number;
  pageSize: number;
}
