export type ProviderVerificationStatus = 'Pending' | 'Verified' | 'Rejected';

export interface MarketplaceApiSummary {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  publishedAt: string | null;
  providerId: string;
  providerName: string;
  providerStatus: ProviderVerificationStatus;
  hasFreePlan: boolean;
  hasPaidPlan: boolean;
}

export interface MarketplaceVersion {
  id: string;
  version: string;
  changelog: string;
}

export interface MarketplaceEndpoint {
  id: string;
  versionId: string;
  method: string;
  path: string;
  description: string;
  parameters: Array<Record<string, unknown>>;
  requestSchema: Record<string, unknown> | null;
  responseExample: unknown | null;
}

export interface MarketplaceDocumentation {
  versionId: string;
  source: string;
  content: unknown;
}

export interface MarketplacePricingPlan {
  id: string;
  name: string;
  priceMonthly: number;
  currency: string;
  quota: number;
  rateLimit: number;
  recommended?: boolean;
}

export interface MarketplaceLegal {
  dataClassification: string;
  processesPersonalData: boolean;
  personalDataTypes: string[];
  dataProcessingPurpose: string | null;
}

export interface MarketplaceApiDetail extends MarketplaceApiSummary {
  versions: MarketplaceVersion[];
  endpoints: MarketplaceEndpoint[];
  documentation: MarketplaceDocumentation[];
  plans: MarketplacePricingPlan[];
  legal: MarketplaceLegal | null;
}

export interface MarketplaceQuery {
  q?: string;
  category?: string;
  tag?: string;
  providerId?: string;
  pricing?: 'free' | 'paid';
  sort?: 'newest' | 'name';
  page?: number;
  pageSize?: number;
}

export interface MarketplacePaginatedResponse {
  items: MarketplaceApiSummary[];
  total: number;
  page: number;
  pageSize: number;
}
