export type UserRole = 'ADMIN' | 'USER' | 'API_PROVIDER';

export type UserStatus = 'Active' | 'Locked' | 'PendingVerification';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  company?: string;
  createdAt: string;
  lastLoginAt: string;
  twoFactorEnabled: boolean;
  quotaUsedPercent: number;
}

export type ApiCategory = 
  | 'Machine Learning & AI'
  | 'Finance & Banking'
  | 'Data & Web Scraping'
  | 'DevOps & Cloud'
  | 'Translation & NLP'
  | 'Weather & Geo'
  | 'Security & Auth';

export type ApiStatus = 
  | 'Draft' 
  | 'Submitted' 
  | 'UnderReview' 
  | 'Approved' 
  | 'Published' 
  | 'Suspended' 
  | 'Removed';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiEndpoint {
  id: string;
  path: string;
  method: HttpMethod;
  summary: string;
  description: string;
  rateLimitPerSec: number;
  parameters: {
    name: string;
    in: 'query' | 'header' | 'path' | 'body';
    required: boolean;
    type: string;
    description: string;
    default?: string;
  }[];
  sampleRequest?: string;
  sampleResponse: string;
}

export interface PricingPlan {
  id: string;
  apiId: string;
  name: string;
  tier: 'Free' | 'Basic' | 'Pro' | 'Enterprise';
  priceMonthly: number;
  monthlyQuota: number;
  rateLimitPerSec: number;
  features: string[];
  isPopular?: boolean;
}

export interface ApiItem {
  id: string;
  name: string;
  slug: string;
  providerId: string;
  providerName: string;
  providerVerified: boolean;
  category: ApiCategory;
  shortDescription: string;
  longDescription: string;
  icon: string;
  status: ApiStatus;
  version: string;
  baseUrl: string;
  rating: number;
  reviewCount: number;
  latencyP95Ms: number;
  uptimePercent: number;
  subscribersCount: number;
  totalCallsMonthly: string;
  tags: string[];
  plans: PricingPlan[];
  endpoints: ApiEndpoint[];
  legalDeclarationCompleted: boolean;
  publishedAt?: string;
  submittedAt?: string;
  complianceNotes?: string;
}

export type SubscriptionStatus = 'Active' | 'Cancelled' | 'Expired' | 'Suspended';

export interface Subscription {
  id: string;
  userId: string;
  apiId: string;
  apiName: string;
  apiIcon: string;
  planId: string;
  planName: string;
  tier: 'Free' | 'Basic' | 'Pro' | 'Enterprise';
  status: SubscriptionStatus;
  startedAt: string;
  currentPeriodEnd: string;
  quotaLimit: number;
  quotaUsed: number;
  rateLimitPerSec: number;
  priceMonthly: number;
  apiKeyId: string;
}

export interface ApiKey {
  id: string;
  userId: string;
  subscriptionId?: string;
  apiId?: string;
  apiName?: string;
  name: string;
  keyPrefix: string;
  keyFull?: string; // only returned when just created
  createdAt: string;
  lastUsedAt?: string;
  isRevoked: boolean;
  rateLimitPerSec: number;
}

export interface RequestLog {
  id: string;
  timestamp: string;
  method: HttpMethod;
  endpoint: string;
  apiName: string;
  statusCode: number;
  latencyMs: number;
  ipAddress: string;
  userAgent: string;
  apiKeyPrefix: string;
  redactedHeaders: Record<string, string>;
  responseSizeKb: number;
}

export interface CostGuardBudget {
  monthlyBudgetUsd: number;
  spentUsd: number;
  alert50Sent: boolean;
  alert80Sent: boolean;
  hardCutoffAt100: boolean;
  currency: string;
}

export interface CostGuardNotification {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ProviderVerification {
  id: string;
  providerId: string;
  providerName: string;
  companyName: string;
  businessLicense: string;
  taxCode: string;
  contactEmail: string;
  website: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface ReportItem {
  id: string;
  apiId: string;
  apiName: string;
  reportedBy: string;
  reporterEmail: string;
  category: 'Security Vulnerability' | 'Copyright / IP Infringement' | 'Extreme Downtime' | 'Malicious Data';
  description: string;
  status: 'Pending' | 'Under Investigation' | 'Resolved' | 'Dismissed';
  createdAt: string;
  actionTaken?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  targetType: 'API' | 'USER' | 'PROVIDER' | 'SUBSCRIPTION' | 'SECURITY';
  targetId: string;
  ipAddress: string;
  details: string;
}
