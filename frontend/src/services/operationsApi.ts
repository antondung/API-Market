import { authenticatedRequest } from "./authApi";
export interface SubscriptionRow {
  id: string;
  consumerId: string;
  apiId: string;
  apiName: string;
  planName: string;
  status: string;
  quotaUsed: string;
  quotaLimit: string;
  priceAmount: string;
  currency: string;
  periodEnd: string;
}
export interface PaymentRow {
  id: string;
  subscriptionId: string;
  consumerId: string;
  apiId: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
}
export interface KeyRow {
  id: string;
  isActive: boolean;
  revokedAt: string | null;
  lastUsedAt: string | null;
}
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
export interface OperationsSnapshot {
  checkedAt: string;
  controlPlane: string;
  postgres: string;
  redis: string;
  gateway: string;
  worker: {
    status: string;
    last_succeeded_at?: string;
    last_error_at?: string;
  };
}
export async function subscriptions(query: string, signal?: AbortSignal) {
  return (
    await authenticatedRequest<{ data: Page<SubscriptionRow> }>(
      `/api/admin/subscriptions?${query}`,
      { signal },
    )
  ).data;
}
export async function payments(query: string, signal?: AbortSignal) {
  return (
    await authenticatedRequest<{ data: Page<PaymentRow> }>(
      `/api/admin/payments?${query}`,
      { signal },
    )
  ).data;
}
export async function keys(id: string) {
  return (
    await authenticatedRequest<{ data: KeyRow[] }>(
      `/api/admin/subscriptions/${encodeURIComponent(id)}/keys`,
    )
  ).data;
}
export async function suspend(id: string, reason: string) {
  return authenticatedRequest(
    `/api/admin/subscriptions/${encodeURIComponent(id)}/suspend`,
    { method: "POST", body: JSON.stringify({ reason }) },
  );
}
export async function restore(id: string, reason: string) {
  return authenticatedRequest(
    `/api/admin/subscriptions/${encodeURIComponent(id)}/restore`,
    { method: "POST", body: JSON.stringify({ reason }) },
  );
}
export async function revoke(id: string, reason: string) {
  return authenticatedRequest(
    `/api/admin/api-keys/${encodeURIComponent(id)}/revoke`,
    { method: "POST", body: JSON.stringify({ reason }) },
  );
}
export async function operations(signal?: AbortSignal) {
  return (
    await authenticatedRequest<{ data: OperationsSnapshot }>(
      "/api/admin/operations",
      { signal },
    )
  ).data;
}
