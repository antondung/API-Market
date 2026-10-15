import type { UserRole } from '../types';

export type BackendRole = 'Consumer' | 'Provider' | 'Admin';
export interface BackendUser { id: string; name: string; email: string; role: BackendRole }
export interface BackendTokens { accessToken: string; refreshToken: string; tokenType: 'Bearer'; expiresIn: number; user: BackendUser }
export interface SavedTokens extends BackendTokens { expiresAt: number }
export interface ApiErrorDetail { field: string; message: string }
export interface LogoutResult { serverRevoked: boolean; warning?: string }

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public requestId?: string, public details?: ApiErrorDetail[]) {
    super(message);
    this.name = 'ApiError';
  }
}

const STORAGE_KEY = 'apihub_sprint1_auth';
const REQUEST_TIMEOUT_MS = 10_000;
const REFRESH_EARLY_MS = 30_000;
let authGeneration = 0;

export function getAuthGeneration(): number {
  return authGeneration;
}

interface ActiveRefreshState {
  generation: number;
  refreshToken: string;
  promise: Promise<SavedTokens>;
  rawPromise: Promise<BackendTokens>;
}

let refreshPromise: ActiveRefreshState | null = null;
const inFlightLogouts = new Map<string, Promise<LogoutResult>>();
let lastClearedLogout: { token: string; generation: number; promise: Promise<LogoutResult> } | null = null;

export function backendRoleToFrontend(role: BackendRole): UserRole {
  if (role === 'Provider') return 'API_PROVIDER';
  if (role === 'Admin') return 'ADMIN';
  if (role === 'Consumer') return 'USER';
  throw new ApiError(0, 'INVALID_RESPONSE', 'Máy chủ trả về vai trò không hợp lệ.');
}

export function getBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL;
  return typeof configured === 'string' ? configured.trim().replace(/\/$/, '') : '';
}

export function getSavedTokens(): SavedTokens | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedTokens>;
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.user || typeof parsed.expiresAt !== 'number') {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed as SavedTokens;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function saveTokens(tokens: BackendTokens, expectedGeneration: number): SavedTokens {
  if (expectedGeneration !== authGeneration) throw new ApiError(0, 'STALE_AUTH_RESULT', 'Kết quả xác thực đã cũ và bị bỏ qua.');
  const saved = { ...tokens, expiresAt: Date.now() + Math.max(0, tokens.expiresIn * 1000 - REFRESH_EARLY_MS) };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  return saved;
}

export function clearTokens(): void {
  authGeneration += 1;
  refreshPromise = null;
  sessionStorage.removeItem(STORAGE_KEY);
}

function invalidateTrustedSession(): void {
  clearTokens();
  window.dispatchEvent(new Event('apihub:session-invalidated'));
}

export function hasSavedTokens(): boolean { return Boolean(getSavedTokens()); }

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort('timeout'), REQUEST_TIMEOUT_MS);
  const abortFromCaller = () => controller.abort(options.signal?.reason);
  options.signal?.addEventListener('abort', abortFromCaller, { once: true });
  try {
    const response = await fetch(`${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`, {
      ...options,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    });
    if (response.status === 204) return undefined as T;
    const payload = response.headers.get('content-type')?.includes('application/json') ? await response.json().catch(() => null) : null;
    if (!response.ok) {
      const error = payload?.error;
      throw new ApiError(response.status, error?.code ?? `HTTP_${response.status}`, error?.message ?? `Yêu cầu thất bại (${response.status}).`, error?.requestId ?? response.headers.get('x-request-id') ?? undefined, error?.details);
    }
    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (options.signal?.aborted) throw new ApiError(0, 'ABORTED', 'Yêu cầu đã bị hủy.');
    if (controller.signal.aborted) throw new ApiError(0, 'TIMEOUT', 'Máy chủ phản hồi quá chậm. Vui lòng thử lại.');
    throw new ApiError(0, 'NETWORK_ERROR', 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối và thử lại.');
  } finally {
    window.clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abortFromCaller);
  }
}

export async function checkBackendHealth(): Promise<{ status: string }> { return apiRequest('/health'); }

export async function register(params: { email: string; password: string; role: 'Consumer' | 'Provider'; name?: string }): Promise<BackendUser> {
  const response = await apiRequest<{ data: BackendUser }>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email: params.email.trim().toLowerCase(), password: params.password, role: params.role, name: params.name?.trim() || undefined }) });
  return response.data;
}

export async function login(params: { email: string; password: string }): Promise<SavedTokens> {
  clearTokens();
  const generation = authGeneration;
  const response = await apiRequest<{ data: BackendTokens }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: params.email.trim().toLowerCase(), password: params.password }) });
  return saveTokens(response.data, generation);
}

export async function refresh(): Promise<SavedTokens> {
  const generation = authGeneration;
  if (refreshPromise?.generation === generation) return refreshPromise.promise;
  const saved = getSavedTokens();
  if (!saved) throw new ApiError(401, 'UNAUTHORIZED', 'Phiên đăng nhập đã hết hạn.');

  const rawPromise = apiRequest<{ data: BackendTokens }>('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: saved.refreshToken }),
  }).then(res => res.data);

  const promise = (async () => {
    try {
      const rotated = await rawPromise;
      if (generation !== authGeneration) {
        throw new ApiError(0, 'STALE_AUTH_RESULT', 'Phiên làm việc đã thay đổi trong khi đang làm mới token.');
      }
      return saveTokens(rotated, generation);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401 && generation === authGeneration) {
        invalidateTrustedSession();
      }
      throw error;
    } finally {
      if (refreshPromise?.generation === generation) {
        refreshPromise = null;
      }
    }
  })();

  refreshPromise = { generation, refreshToken: saved.refreshToken, promise, rawPromise };
  return promise;
}

export async function authenticatedRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const requestGeneration = authGeneration;
  let saved = getSavedTokens();
  if (!saved) throw new ApiError(401, 'UNAUTHORIZED', 'Bạn chưa đăng nhập.');
  if (authGeneration !== requestGeneration) {
    throw new ApiError(0, 'STALE_AUTH_RESULT', 'Phiên đăng nhập đã thay đổi.');
  }

  if (Date.now() >= saved.expiresAt) {
    saved = await refresh();
    if (authGeneration !== requestGeneration) {
      throw new ApiError(0, 'STALE_AUTH_RESULT', 'Phiên đăng nhập đã thay đổi.');
    }
  }

  const execute = (accessToken: string) =>
    apiRequest<T>(path, {
      ...options,
      headers: { ...(options.headers ?? {}), Authorization: `Bearer ${accessToken}` },
    });

  let response: T;
  try {
    response = await execute(saved.accessToken);
  } catch (error) {
    if (authGeneration !== requestGeneration) {
      throw new ApiError(0, 'STALE_AUTH_RESULT', 'Phiên đăng nhập đã thay đổi.');
    }
    if (!(error instanceof ApiError) || error.status !== 401) throw error;

    const refreshed = await refresh();
    if (authGeneration !== requestGeneration) {
      throw new ApiError(0, 'STALE_AUTH_RESULT', 'Phiên đăng nhập đã thay đổi.');
    }

    try {
      const retryResult = await execute(refreshed.accessToken);
      if (authGeneration !== requestGeneration) {
        throw new ApiError(0, 'STALE_AUTH_RESULT', 'Phiên đăng nhập đã thay đổi.');
      }
      return retryResult;
    } catch (retryError) {
      if (authGeneration === requestGeneration) {
        if (retryError instanceof ApiError && retryError.status === 401) {
          invalidateTrustedSession();
        }
      }
      throw retryError;
    }
  }

  if (authGeneration !== requestGeneration) {
    throw new ApiError(0, 'STALE_AUTH_RESULT', 'Phiên đăng nhập đã thay đổi.');
  }

  return response;
}

export async function getMe(): Promise<BackendUser> { return (await authenticatedRequest<{ data: BackendUser }>('/api/auth/me')).data; }
export async function checkRoleAccess(role: 'consumer' | 'provider' | 'admin'): Promise<{ role: string }> { return (await authenticatedRequest<{ data: { role: string } }>(`/api/access/${role}`)).data; }

export async function logout(): Promise<LogoutResult> {
  const currentTokens = getSavedTokens();
  const sessionGeneration = authGeneration;

  if (!currentTokens?.accessToken) {
    if (lastClearedLogout && lastClearedLogout.generation === sessionGeneration && inFlightLogouts.has(lastClearedLogout.token)) {
      return inFlightLogouts.get(lastClearedLogout.token)!;
    }
    return { serverRevoked: true };
  }

  const sessionToken = currentTokens.accessToken;
  const existingLogout = inFlightLogouts.get(sessionToken);
  if (existingLogout) {
    return existingLogout;
  }

  const activeRefresh = (refreshPromise && refreshPromise.generation === sessionGeneration) ? refreshPromise : null;

  clearTokens();
  const clearedGeneration = authGeneration;

  const logoutPromise = (async (): Promise<LogoutResult> => {
    let accessToken = sessionToken;
    let refreshTokenConsumed = false;

    if (activeRefresh) {
      try {
        const rotated = await activeRefresh.rawPromise;
        if (rotated?.accessToken) {
          accessToken = rotated.accessToken;
        }
        refreshTokenConsumed = true;
      } catch {
        refreshTokenConsumed = true;
      }
    }

    if (Date.now() >= currentTokens.expiresAt && currentTokens.refreshToken && !refreshTokenConsumed) {
      try {
        const refreshed = await apiRequest<{ data: BackendTokens }>('/api/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: currentTokens.refreshToken }),
        });
        if (refreshed?.data?.accessToken) {
          accessToken = refreshed.data.accessToken;
        }
      } catch {
        // Refresh failed (e.g. 401 revoked on server)
      }
    }

    try {
      await apiRequest<void>('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return { serverRevoked: true };
    } catch (error) {
      return {
        serverRevoked: false,
        warning: formatBackendErrorMessage(error) || 'Máy chủ không thể xác nhận thu hồi phiên.',
      };
    } finally {
      inFlightLogouts.delete(sessionToken);
      if (lastClearedLogout?.token === sessionToken) {
        lastClearedLogout = null;
      }
    }
  })();

  inFlightLogouts.set(sessionToken, logoutPromise);
  lastClearedLogout = { token: sessionToken, generation: clearedGeneration, promise: logoutPromise };

  return logoutPromise;
}

export function formatBackendErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định.';
  if (error.code === 'ABORTED') return '';
  if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') return error.message;
  if (error.status === 401) return 'Email hoặc mật khẩu không chính xác, hoặc phiên đăng nhập đã hết hạn.';
  if (error.status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
  if (error.status === 404) return error.code === 'USER_NOT_FOUND' ? 'Không tìm thấy người dùng. Danh sách sẽ được tải lại.' : 'Không tìm thấy dữ liệu yêu cầu.';
  if (error.status === 409) return error.code === 'CANNOT_MODIFY_SELF' ? 'Bạn không thể khóa tài khoản của chính mình.' : error.code === 'EMAIL_EXISTS' ? 'Địa chỉ email này đã được đăng ký.' : 'Dữ liệu bị xung đột với trạng thái hiện tại.';
  if (error.status === 429) return 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng chờ một phút rồi thử lại.';
  if (error.status >= 500) return 'Máy chủ đang gặp sự cố hoặc không thể kết nối. Vui lòng kiểm tra dịch vụ backend và thử lại.';
  if (error.code === 'VALIDATION_ERROR' && error.details?.length) return error.details.map(detail => detail.message).join(' ');
  return error.message;
}
