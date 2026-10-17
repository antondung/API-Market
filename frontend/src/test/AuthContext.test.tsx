import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import * as authApiService from '../services/authApi';
import { ApiError } from '../services/authApi';

const TestComponent: React.FC = () => {
  const { currentUser, sessionReady, sessionError, backendOnline, loginWithBackend, logout } = useAuth();

  return (
    <div>
      <div data-testid="session-ready">{String(sessionReady)}</div>
      <div data-testid="backend-online">{String(backendOnline)}</div>
      <div data-testid="user-email">{currentUser?.email || 'no-user'}</div>
      <div data-testid="user-role">{currentUser?.role || 'no-role'}</div>
      <div data-testid="session-error">{sessionError || 'no-error'}</div>
      <button onClick={() => loginWithBackend('user@apihub.dev', 'pass123')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

describe('AuthContext unit tests', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(authApiService, 'checkBackendHealth').mockResolvedValue({ status: 'ok' });
  });

  it('khởi tạo với trạng thái unauthenticated khi không có token trong storage', async () => {
    vi.spyOn(authApiService, 'getSavedTokens').mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('session-ready').textContent).toBe('true');
    });

    expect(screen.getByTestId('user-email').textContent).toBe('no-user');
    expect(screen.getByTestId('session-error').textContent).toBe('no-error');
  });

  it('khôi phục phiên thành công khi token hợp lệ', async () => {
    vi.spyOn(authApiService, 'getSavedTokens').mockReturnValue({
      accessToken: 'valid-token',
      refreshToken: 'valid-refresh',
      tokenType: 'Bearer',
      expiresIn: 900,
      expiresAt: Date.now() + 600_000,
      user: { id: 'u1', name: 'Valid User', email: 'valid@apihub.dev', role: 'Consumer' }
    });

    vi.spyOn(authApiService, 'getMe').mockResolvedValue({
      id: 'u1',
      name: 'Valid User',
      email: 'valid@apihub.dev',
      role: 'Consumer'
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('session-ready').textContent).toBe('true');
    });

    expect(screen.getByTestId('user-email').textContent).toBe('valid@apihub.dev');
    expect(screen.getByTestId('user-role').textContent).toBe('USER');
    expect(screen.getByTestId('backend-online').textContent).toBe('true');
  });

  it('xóa phiên cục bộ khi getMe trả về 401 Unauthorized', async () => {
    vi.spyOn(authApiService, 'getSavedTokens').mockReturnValue({
      accessToken: 'expired-token',
      refreshToken: 'expired-refresh',
      tokenType: 'Bearer',
      expiresIn: 900,
      expiresAt: Date.now() + 600_000,
      user: { id: 'u1', name: 'User', email: 'expired@apihub.dev', role: 'Consumer' }
    });

    const clearTokensSpy = vi.spyOn(authApiService, 'clearTokens');
    vi.spyOn(authApiService, 'getMe').mockRejectedValue(new ApiError(401, 'UNAUTHORIZED', 'Session expired'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('session-ready').textContent).toBe('true');
    });

    expect(clearTokensSpy).toHaveBeenCalled();
    expect(screen.getByTestId('user-email').textContent).toBe('no-user');
  });

  it('giữ trạng thái lỗi khi mất kết nối mạng (network error / 500)', async () => {
    vi.spyOn(authApiService, 'getSavedTokens').mockReturnValue({
      accessToken: 'token-abc',
      refreshToken: 'refresh-abc',
      tokenType: 'Bearer',
      expiresIn: 900,
      expiresAt: Date.now() + 600_000,
      user: { id: 'u1', name: 'User', email: 'offline@apihub.dev', role: 'Consumer' }
    });

    vi.spyOn(authApiService, 'getMe').mockRejectedValue(new ApiError(0, 'NETWORK_ERROR', 'Network connection failed'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('session-ready').textContent).toBe('true');
    });

    expect(screen.getByTestId('session-error').textContent).toContain('Network connection failed');
    expect(screen.getByTestId('backend-online').textContent).toBe('false');
  });

  it('xóa người dùng ngay lập tức khi nhận sự kiện apihub:session-invalidated', async () => {
    vi.spyOn(authApiService, 'getSavedTokens').mockReturnValue({
      accessToken: 'token',
      refreshToken: 'refresh',
      tokenType: 'Bearer',
      expiresIn: 900,
      expiresAt: Date.now() + 600_000,
      user: { id: 'u1', name: 'User', email: 'active@apihub.dev', role: 'Consumer' }
    });

    vi.spyOn(authApiService, 'getMe').mockResolvedValue({
      id: 'u1',
      name: 'User',
      email: 'active@apihub.dev',
      role: 'Consumer'
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-email').textContent).toBe('active@apihub.dev');
    });

    act(() => {
      window.dispatchEvent(new Event('apihub:session-invalidated'));
    });

    expect(screen.getByTestId('user-email').textContent).toBe('no-user');
  });

  it('loginWithBackend cập nhật currentUser và đặt sessionReady = true', async () => {
    vi.spyOn(authApiService, 'getSavedTokens').mockReturnValue(null);
    vi.spyOn(authApiService, 'login').mockResolvedValue({
      accessToken: 'new-token',
      refreshToken: 'new-refresh',
      tokenType: 'Bearer',
      expiresIn: 900,
      expiresAt: Date.now() + 600_000,
      user: { id: 'u2', name: 'Logged In User', email: 'user@apihub.dev', role: 'Consumer' }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('session-ready').textContent).toBe('true');
    });

    const loginButton = screen.getByText('Login');
    await act(async () => {
      loginButton.click();
    });

    expect(screen.getByTestId('user-email').textContent).toBe('user@apihub.dev');
    expect(screen.getByTestId('backend-online').textContent).toBe('true');
  });

  it('logout lan truyền cảnh báo nếu máy chủ không thể xác nhận thu hồi phiên', async () => {
    let capturedLogoutResult: { warning?: string } = {};

    const LogoutCaller: React.FC = () => {
      const { logout } = useAuth();
      return (
        <button
          onClick={async () => {
            capturedLogoutResult = await logout();
          }}
        >
          Do Logout
        </button>
      );
    };

    vi.spyOn(authApiService, 'logout').mockResolvedValue({
      serverRevoked: false,
      warning: 'Máy chủ phản hồi 500'
    });

    render(
      <AuthProvider>
        <LogoutCaller />
      </AuthProvider>
    );

    const btn = screen.getByText('Do Logout');
    await act(async () => {
      btn.click();
    });

    expect(capturedLogoutResult.warning).toContain('Máy chủ phản hồi 500');
  });
});
