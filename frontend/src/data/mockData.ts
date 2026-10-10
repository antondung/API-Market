import type { 
  ApiItem, 
  Subscription, 
  ApiKey, 
  RequestLog, 
  User, 
  ProviderVerification, 
  ReportItem, 
  AuditLogEntry, 
  CostGuardBudget,
  CostGuardNotification
} from '../types';

/**
 * Clean Production Release Seed Data
 * All static mock records (APIs, subscriptions, keys, telemetry logs, verifications)
 * have been cleaned to start in pristine production state.
 */

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin_root',
    email: 'admin@apihub.dev',
    name: 'Quản trị viên Hệ thống',
    role: 'ADMIN',
    status: 'Active',
    company: 'API HUB Enterprise',
    createdAt: '2026-01-01T00:00:00Z',
    lastLoginAt: '2026-10-10T00:00:00Z',
    twoFactorEnabled: true,
    quotaUsedPercent: 0,
  },
  {
    id: 'usr_provider_main',
    email: 'provider@apihub.dev',
    name: 'Nhà cung cấp Dịch vụ',
    role: 'API_PROVIDER',
    status: 'Active',
    company: '',
    createdAt: '2026-01-01T00:00:00Z',
    lastLoginAt: '2026-10-10T00:00:00Z',
    twoFactorEnabled: false,
    quotaUsedPercent: 0,
  },
  {
    id: 'usr_consumer_main',
    email: 'developer@apihub.dev',
    name: 'Nhà phát triển Ứng dụng',
    role: 'USER',
    status: 'Active',
    company: '',
    createdAt: '2026-01-01T00:00:00Z',
    lastLoginAt: '2026-10-10T00:00:00Z',
    twoFactorEnabled: false,
    quotaUsedPercent: 0,
  }
];

export const INITIAL_APIS: ApiItem[] = [];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [];

export const INITIAL_API_KEYS: ApiKey[] = [];

export const INITIAL_REQUEST_LOGS: RequestLog[] = [];

export const INITIAL_BUDGET: CostGuardBudget = {
  monthlyBudgetUsd: 100,
  spentUsd: 0,
  alert50Sent: false,
  alert80Sent: false,
  hardCutoffAt100: true,
  currency: 'USD'
};

export const INITIAL_NOTIFICATIONS: CostGuardNotification[] = [];

export const INITIAL_VERIFICATIONS: ProviderVerification[] = [];

export const INITIAL_REPORTS: ReportItem[] = [];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];
