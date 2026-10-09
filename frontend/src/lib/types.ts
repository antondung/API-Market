export type Role = "consumer" | "provider" | "admin";
export interface Session {
  name: string;
  email: string;
  role: Role;
  expiresAt: number;
}
export interface ApiRecord {
  verified?: boolean;
  trialLimit?: number;
  id: string;
  name: string;
  provider: string;
  category: string;
  pricing: "Free" | "Freemium" | "Paid";
  auth: string;
  description: string;
  status: string;
  version: string;
}
export interface KeyRecord {
  id: string;
  name: string;
  api: string;
  prefix: string;
  status: "Active" | "Revoked";
  createdAt: string;
  lastUsed: string | null;
}
export interface Subscription {
  consumer?: string;
  billing?: "Monthly" | "Annual";
  id: string;
  api: string;
  plan: string;
  status: string;
  createdAt: string;
}
export interface AuditEvent {
  id: string;
  entity: string;
  action: string;
  reason: string;
  actor: string;
  at: string;
}
export interface Draft {
  id: string;
  name: string;
  description: string;
  category: string;
  baseUrl: string;
  version: string;
  spec: string;
  price: number;
  quota: number;
  rate: number;
  ownership: string;
  personalData: boolean;
  agreement: boolean;
  status: string;
}
export interface ManagedRecord {
  api?: string;
  version?: string;
  auth?: string;
  schema?: string;
  rate?: number;
  period?: string;
  role?: Role;
  id: string;
  kind: string;
  name: string;
  detail: string;
  status: string;
  value: number;
  quota: number;
}
export interface DemoData {
  requests: RequestRecord[];
  transactions: TransactionRecord[];
  notifications: NotificationRecord[];
  managed: ManagedRecord[];
  apis: ApiRecord[];
  keys: KeyRecord[];
  subscriptions: Subscription[];
  drafts: Draft[];
  audit: AuditEvent[];
  records: Record<string, string>;
  budget: number;
  thresholds: number[];
  providerStatus: string;
  domainStatus: string;
  reports: {
    api?: string;
    evidence?: string;
    note?: string;
    at?: string;
    id: string;
    reason: string;
    description: string;
    status: string;
  }[];
  unread: number;
}
export interface RequestRecord {
  id: string;
  api: string;
  method: string;
  path: string;
  status: number;
  duration: number;
  at: string;
  actor: string;
  context: string;
}
export interface TransactionRecord {
  id: string;
  subscription: string;
  api: string;
  plan: string;
  amount: number;
  status: string;
  at: string;
}
export interface NotificationRecord {
  id: string;
  title: string;
  at: string;
  read: boolean;
  href: string;
  role: Role;
}
