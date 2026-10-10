/**
 * API Market - Sprint 1 Backend Authentication Client
 * Conforms to OpenAPI specs and implementation from https://github.com/antondung/API-Market/tree/develop
 *
 * Target endpoints:
 * - POST /api/auth/register
 * - POST /api/auth/login
 * - POST /api/auth/refresh
 * - POST /api/auth/logout
 * - GET  /api/auth/me
 * - GET  /api/access/consumer
 * - GET  /api/access/provider
 * - GET  /api/access/admin
 * - GET  /health
 */

import type { UserRole } from '../types';

export type BackendRole = 'Consumer' | 'Provider' | 'Admin';

export interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: BackendRole;
}

export interface BackendTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: BackendUser;
}

export interface SavedTokens extends BackendTokens {
  expiresAt: number;
}

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public requestId?: string,
    public details?: ApiErrorDetail[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const STORAGE_KEY = 'apihub_sprint1_auth';
let refreshPromise: Promise<SavedTokens> | null = null;

// Helpers for role conversions
export function backendRoleToFrontend(role: BackendRole): UserRole {
  switch (role) {
    case 'Consumer':
      return 'USER';
    case 'Provider':
      return 'API_PROVIDER';
    case 'Admin':
      return 'ADMIN';
    default:
      return 'USER';
  }
}

export function frontendRoleToBackend(role: UserRole): BackendRole {
  switch (role) {
    case 'USER':
      return 'Consumer';
    case 'API_PROVIDER':
      return 'Provider';
    case 'ADMIN':
      return 'Admin';
    default:
      return 'Consumer';
  }
}

export function getBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, '');
  }
  // Default to relative or port 3000
  return 'http://127.0.0.1:3000';
}

// Token storage in sessionStorage for active tab lifecycle
export function getSavedTokens(): SavedTokens | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedTokens;
  } catch {
    return null;
  }
}

export function saveTokens(tokens: BackendTokens): SavedTokens {
  const saved: SavedTokens = {
    ...tokens,
    expiresAt: Date.now() + (tokens.expiresIn - 10) * 1000 // 10s buffer before actual expiry
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  return saved;
}

export function clearTokens(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function hasSavedTokens(): boolean {
  return Boolean(getSavedTokens()?.accessToken);
}

/**
 * Base raw request to backend
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/${path.replace(/^\//, '')}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch (err: any) {
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      `Không thể kết nối đến máy chủ Backend tại ${baseUrl}. Vui lòng kiểm tra lại dịch vụ Backend (port 3000).`
    );
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const contentType = response.headers.get('content-type') || '';
  let payload: any = null;
  if (contentType.includes('application/json')) {
    try {
      payload = await response.json();
    } catch {
      // ignore
    }
  }

  if (!response.ok) {
    const errObj = payload?.error;
    const code = errObj?.code || `HTTP_${response.status}`;
    const message = errObj?.message || `Yêu cầu thất bại với mã trạng thái ${response.status}.`;
    const requestId = errObj?.requestId || response.headers.get('X-Request-Id') || undefined;
    const details = errObj?.details;

    throw new ApiError(response.status, code, message, requestId, details);
  }

  return payload as T;
}

/**
 * Check if the backend Sprint 1 server is online
 */
export async function checkBackendHealth(): Promise<{ status: string }> {
  return request<{ status: string }>('/health');
}

/**
 * Register account for Consumer or Provider
 * (Backend forbids direct Admin registration)
 */
export async function register(params: {
  email: string;
  password: string;
  role: 'Consumer' | 'Provider';
  name?: string;
}): Promise<BackendUser> {
  const res = await request<{ data: BackendUser }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: params.email.trim().toLowerCase(),
      password: params.password,
      role: params.role,
      name: params.name?.trim() || undefined
    })
  });
  return res.data;
}

/**
 * Login and acquire JWT access token + refresh token
 */
export async function login(params: {
  email: string;
  password: string;
}): Promise<SavedTokens> {
  const res = await request<{ data: BackendTokens }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: params.email.trim().toLowerCase(),
      password: params.password
    })
  });
  return saveTokens(res.data);
}

/**
 * Refresh access token using rotation refresh token
 */
export async function refresh(): Promise<SavedTokens> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const saved = getSavedTokens();
  if (!saved || !saved.refreshToken) {
    clearTokens();
    throw new ApiError(401, 'UNAUTHORIZED', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  }

  refreshPromise = (async () => {
    try {
      const res = await request<{ data: BackendTokens }>('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: saved.refreshToken
        })
      });
      return saveTokens(res.data);
    } catch (err) {
      clearTokens();
      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Execute an authenticated request, auto-refreshing token if expired
 */
export async function authenticatedRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let saved = getSavedTokens();
  if (!saved) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Bạn chưa đăng nhập.');
  }

  // If token is expired or close to expiry, refresh first
  if (Date.now() >= saved.expiresAt) {
    saved = await refresh();
  }

  const exec = (token: string) => {
    return request<T>(path, {
      ...options,
      headers: {
        ...(options.headers as Record<string, string> || {}),
        Authorization: `Bearer ${token}`
      }
    });
  };

  try {
    return await exec(saved.accessToken);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      // Try refresh once
      const refreshed = await refresh();
      return await exec(refreshed.accessToken);
    }
    throw err;
  }
}

/**
 * Fetch current user profile
 */
export async function getMe(): Promise<BackendUser> {
  const res = await authenticatedRequest<{ data: BackendUser }>('/api/auth/me');
  return res.data;
}

/**
 * Test role-specific guard endpoint
 */
export async function checkRoleAccess(role: 'consumer' | 'provider' | 'admin'): Promise<{ role: string }> {
  const res = await authenticatedRequest<{ data: { role: string } }>(`/api/access/${role.toLowerCase()}`);
  return res.data;
}

/**
 * Logout and revoke session in backend database
 */
export async function logout(): Promise<void> {
  try {
    const saved = getSavedTokens();
    if (saved?.accessToken) {
      await request<void>('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${saved.accessToken}`
        }
      });
    }
  } catch (err) {
    // Session is cleared regardless of network/server error
    console.warn('Backend logout warning:', err);
  } finally {
    clearTokens();
  }
}

/**
 * Translates backend error codes into user-friendly Vietnamese explanations
 */
export function formatBackendErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    if (error instanceof Error) return error.message;
    return 'Lỗi không xác định khi giao tiếp với Backend.';
  }

  switch (error.code) {
    case 'UNAUTHORIZED':
      return 'Email hoặc mật khẩu không chính xác, hoặc phiên đăng nhập đã hết hạn.';
    case 'EMAIL_EXISTS':
      return 'Địa chỉ email này đã được đăng ký trong hệ thống. Vui lòng đăng nhập hoặc dùng email khác.';
    case 'RATE_LIMITED':
      return 'Bạn đã gửi quá nhiều yêu cầu xác thực. Vui lòng thử lại sau 1 phút (Rate Limit: 30 req/min).';
    case 'FORBIDDEN':
      return 'Bạn không có quyền truy cập vào tài nguyên hoặc không gian làm việc này (403 Forbidden).';
    case 'VALIDATION_ERROR': {
      if (error.details && error.details.length > 0) {
        return `Dữ liệu không hợp lệ: ${error.details.map(d => `${d.field}: ${d.message}`).join(', ')}`;
      }
      return 'Dữ liệu yêu cầu không hợp lệ. Mật khẩu đăng ký phải từ 12 đến 128 ký tự.';
    }
    case 'PAYLOAD_TOO_LARGE':
      return 'Dung lượng yêu cầu vượt quá giới hạn cho phép (tối đa 16KB).';
    case 'INVALID_JSON':
      return 'Định dạng JSON gửi lên không hợp lệ.';
    case 'NETWORK_ERROR':
      return error.message;
    default:
      return error.message || `Lỗi máy chủ (${error.code || error.status}).`;
  }
}
