import { authenticatedRequest } from './authApi';

export type AdminUserRole = 'Consumer' | 'Provider' | 'Admin';
export interface AdminUserRecord { id: string; name: string; email: string; role: AdminUserRole; active: boolean; createdAt: string }
export interface AdminUsersPage { items: AdminUserRecord[]; total: number; page: number; pageSize: number }
export interface AdminUsersQuery { search?: string; role?: AdminUserRole; active?: boolean; page: number; pageSize: number }

export async function listAdminUsers(query: AdminUsersQuery, signal?: AbortSignal): Promise<AdminUsersPage> {
  const params = new URLSearchParams({ page: String(query.page), pageSize: String(query.pageSize) });
  if (query.search?.trim()) params.set('search', query.search.trim());
  if (query.role) params.set('role', query.role);
  if (query.active !== undefined) params.set('active', String(query.active));
  const response = await authenticatedRequest<{ data: AdminUsersPage }>(`/api/admin/users?${params}`, { signal });
  return response.data;
}

export async function setAdminUserActive(id: string, active: boolean): Promise<{ user: AdminUserRecord; revokedSessions: number }> {
  const response = await authenticatedRequest<{ data: { user: AdminUserRecord; revokedSessions: number } }>(`/api/admin/users/${encodeURIComponent(id)}/active`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  });
  return response.data;
}
