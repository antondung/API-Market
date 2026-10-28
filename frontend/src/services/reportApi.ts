import { authenticatedRequest } from './authApi';

export const REPORT_CATEGORIES = [
  'Security Vulnerability', 'Copyright / IP Infringement', 'Extreme Downtime', 'Malicious Data',
] as const;
export type ReportCategory = (typeof REPORT_CATEGORIES)[number];
export type ReportStatus = 'Pending' | 'Under Investigation' | 'Resolved' | 'Dismissed';
export type ModerationAction = 'Suspend' | 'Restore' | 'Remove' | 'Dismiss';

export interface ConsumerReport {
  id: string;
  apiId: string;
  category: ReportCategory;
  description: string;
  status: ReportStatus;
  actionTaken?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
}

export interface AdminReport extends ConsumerReport {
  reporterId?: string;
  apiName?: string;
  apiStatus?: string;
}

export interface ReportPage<T> { items: T[]; total: number; page: number; pageSize: number }

const q = (page: number, pageSize: number, status?: string) =>
  `?page=${page}&pageSize=${pageSize}${status ? `&status=${encodeURIComponent(status)}` : ''}`;

/** Files a report against a Published API. */
export async function createReport(apiId: string, params: { category: ReportCategory; description: string }): Promise<ConsumerReport> {
  return (await authenticatedRequest<{ data: ConsumerReport }>(`/api/consumer/reports/${encodeURIComponent(apiId)}`, {
    method: 'POST', body: JSON.stringify(params),
  })).data;
}

export async function listMyReports(page = 1, pageSize = 20): Promise<ReportPage<ConsumerReport>> {
  return (await authenticatedRequest<{ data: ReportPage<ConsumerReport> }>(`/api/consumer/reports${q(page, pageSize)}`)).data;
}

export async function listReportsForAdmin(page = 1, pageSize = 20, status?: ReportStatus): Promise<ReportPage<AdminReport>> {
  return (await authenticatedRequest<{ data: ReportPage<AdminReport> }>(`/api/admin/reports${q(page, pageSize, status)}`)).data;
}

export async function reviewReport(id: string, params: { action: ModerationAction; note: string }): Promise<AdminReport> {
  return (await authenticatedRequest<{ data: AdminReport }>(`/api/admin/reports/${encodeURIComponent(id)}/review`, {
    method: 'POST', body: JSON.stringify(params),
  })).data;
}