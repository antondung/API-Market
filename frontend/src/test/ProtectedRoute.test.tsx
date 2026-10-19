import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import * as AuthContextModule from '../context/AuthContext';
import type { User } from '../types';

// Component ghi lại thông tin chuyển hướng (redirect target & state)
const LocationTracker: React.FC<{ label: string }> = ({ label }) => {
  const location = useLocation();
  return (
    <div>
      <div data-testid={`${label}-rendered`}>true</div>
      <div data-testid={`${label}-state`}>{JSON.stringify(location.state)}</div>
    </div>
  );
};

describe('ProtectedRoute unit tests', () => {
  const defaultUser: User = {
    id: 'u-1',
    email: 'consumer@apihub.dev',
    name: 'Consumer User',
    role: 'USER',
    status: 'Active',
    createdAt: '',
    lastLoginAt: '',
    twoFactorEnabled: false,
    quotaUsedPercent: 0,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('hiển thị icon loading (spinner) khi sessionReady = false', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: null,
      user: null,
      isAuthenticated: false,
      sessionReady: false,
      sessionError: null,
      backendOnline: false,
      checkBackendConnection: vi.fn(),
      retrySession: vi.fn(),
      loginWithBackend: vi.fn(),
      registerWithBackend: vi.fn(),
      logout: vi.fn(),
      verifyRoleAccess: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Protected Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('progress_activity')).toBeDefined();
    expect(screen.queryByText('Protected Dashboard')).toBeNull();
  });

  it('hiển thị thông báo mất kết nối và nút thử lại khi có sessionError', () => {
    const retrySessionMock = vi.fn();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: null,
      user: null,
      isAuthenticated: false,
      sessionReady: true,
      sessionError: 'Không thể kết nối máy chủ.',
      backendOnline: false,
      checkBackendConnection: vi.fn(),
      retrySession: retrySessionMock,
      loginWithBackend: vi.fn(),
      registerWithBackend: vi.fn(),
      logout: vi.fn(),
      verifyRoleAccess: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Protected Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Không thể xác minh phiên đăng nhập')).toBeDefined();
    expect(screen.getByText(/Không thể kết nối máy chủ/)).toBeDefined();

    const retryBtn = screen.getByText('Thử kết nối lại');
    retryBtn.click();
    expect(retrySessionMock).toHaveBeenCalledTimes(1);
  });

  it('chuyển hướng sang /login khi chưa đăng nhập (unauthenticated) kèm state.from', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: null,
      user: null,
      isAuthenticated: false,
      sessionReady: true,
      sessionError: null,
      backendOnline: true,
      checkBackendConnection: vi.fn(),
      retrySession: vi.fn(),
      loginWithBackend: vi.fn(),
      registerWithBackend: vi.fn(),
      logout: vi.fn(),
      verifyRoleAccess: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard?tab=overview']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Protected Dashboard</div>} />
          </Route>
          <Route path="/login" element={<LocationTracker label="login" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('login-rendered').textContent).toBe('true');
    const state = JSON.parse(screen.getByTestId('login-state').textContent || '{}');
    expect(state.from).toBe('/dashboard?tab=overview');
  });

  it('chuyển hướng sang /403 khi vai trò không khớp allowedRoles (unauthorized)', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: defaultUser,
      user: defaultUser,
      isAuthenticated: true,
      sessionReady: true,
      sessionError: null,
      backendOnline: true,
      checkBackendConnection: vi.fn(),
      retrySession: vi.fn(),
      loginWithBackend: vi.fn(),
      registerWithBackend: vi.fn(),
      logout: vi.fn(),
      verifyRoleAccess: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin/users']}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/users" element={<div>Admin Secret</div>} />
          </Route>
          <Route path="/403" element={<LocationTracker label="forbidden" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('forbidden-rendered').textContent).toBe('true');
    const state = JSON.parse(screen.getByTestId('forbidden-state').textContent || '{}');
    expect(state.from).toBe('/admin/users');
    expect(state.requiredRoles).toEqual(['ADMIN']);
  });

  it('cho phép hiển thị Outlet khi vai trò hợp lệ (authorized)', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: defaultUser,
      user: defaultUser,
      isAuthenticated: true,
      sessionReady: true,
      sessionError: null,
      backendOnline: true,
      checkBackendConnection: vi.fn(),
      retrySession: vi.fn(),
      loginWithBackend: vi.fn(),
      registerWithBackend: vi.fn(),
      logout: vi.fn(),
      verifyRoleAccess: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={['USER', 'API_PROVIDER']} />}>
            <Route path="/dashboard" element={<div>Protected Dashboard Outlet</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Dashboard Outlet')).toBeDefined();
  });
});
