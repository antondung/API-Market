import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionSimulatorPage } from '../pages/auth/SessionSimulatorPage';
import * as AuthContextModule from '../context/AuthContext';
import * as authApiService from '../services/authApi';
import type { User } from '../types';

describe('SessionSimulatorPage isolation tests', () => {
  const mockRealUser: User = {
    id: 'real-user-1',
    email: 'real.user@apihub.dev',
    name: 'Real Logged In User',
    role: 'USER',
    status: 'Active',
    createdAt: '',
    lastLoginAt: '',
    twoFactorEnabled: false,
    quotaUsedPercent: 0,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
    sessionStorage.setItem('apihub_sprint1_auth', JSON.stringify({
      accessToken: 'real-access-token-999',
      refreshToken: 'real-refresh-token-888',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: 'real-user-1',
        name: 'Real Logged In User',
        email: 'real.user@apihub.dev',
        role: 'Consumer'
      },
      expiresAt: Date.now() + 600_000
    }));

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: mockRealUser,
      user: mockRealUser,
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
  });

  it('renders without error even when user is unauthenticated (null)', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: null,
      user: null,
      isAuthenticated: false,
      sessionReady: true,
      sessionError: null,
      backendOnline: false,
      checkBackendConnection: vi.fn(),
      retrySession: vi.fn(),
      loginWithBackend: vi.fn(),
      registerWithBackend: vi.fn(),
      logout: vi.fn(),
      verifyRoleAccess: vi.fn(),
    });

    render(<SessionSimulatorPage />);
    expect(screen.getByText(/Mô phỏng Vòng đời Xác thực & Phiên làm việc|Authentication & Session Lifecycle Simulator/i)).toBeDefined();
    expect(screen.getByText(/guest@apihub\.dev/i)).toBeDefined();
  });

  it('simulator login performs isolated API request and does NOT overwrite real sessionStorage', async () => {
    const apiRequestSpy = vi.spyOn(authApiService, 'apiRequest').mockResolvedValueOnce({
      data: {
        accessToken: 'simulated-secret-access-token-1234567890',
        refreshToken: 'simulated-secret-refresh-token-0987654321',
        tokenType: 'Bearer',
        expiresIn: 900,
        user: {
          id: 'sim-user-id',
          name: 'Simulated User',
          email: 'simulated@test.dev',
          role: 'Consumer'
        }
      }
    });

    render(<SessionSimulatorPage />);

    const emailInput = screen.getByPlaceholderText(/vd: test.consumer@apihub.dev/i);
    const passInput = screen.getByPlaceholderText(/Mật khẩu tài khoản kiểm thử/i);
    const buttons = screen.getAllByRole('button');
    const loginBtn = buttons.find(b => b.textContent?.includes('POST /api/auth/login'));

    expect(loginBtn).toBeDefined();

    fireEvent.change(emailInput, { target: { value: 'simulated@test.dev' } });
    fireEvent.change(passInput, { target: { value: 'SimPass123!' } });
    fireEvent.click(loginBtn!);

    await waitFor(() => {
      expect(apiRequestSpy).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
        method: 'POST',
      }));
    });

    // Verify real sessionStorage is strictly unchanged!
    const saved = JSON.parse(sessionStorage.getItem('apihub_sprint1_auth') || '{}');
    expect(saved.accessToken).toBe('real-access-token-999');
    expect(saved.user.email).toBe('real.user@apihub.dev');

    // Verify token was redacted in the display response
    await waitFor(() => {
      expect(screen.queryByText('simulated-secret-access-token-1234567890')).toBeNull();
    });
  });
});
