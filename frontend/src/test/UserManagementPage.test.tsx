import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import * as adminUsersApi from '../services/adminUsersApi';
import * as AuthContextModule from '../context/AuthContext';
import { ApiError } from '../services/authApi';
import type { User } from '../types';

describe('UserManagementPage unit tests', () => {
  const currentAdmin: User = {
    id: 'admin-id-1',
    email: 'admin@apihub.dev',
    name: 'Main Admin',
    role: 'ADMIN',
    status: 'Active',
    createdAt: '',
    lastLoginAt: '',
    twoFactorEnabled: false,
    quotaUsedPercent: 0,
  };

  const sampleUsers: adminUsersApi.AdminUserRecord[] = [
    {
      id: 'admin-id-1',
      name: 'Main Admin',
      email: 'admin@apihub.dev',
      role: 'Admin',
      active: true,
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'consumer-id-2',
      name: 'Alice Consumer',
      email: 'alice@consumer.com',
      role: 'Consumer',
      active: true,
      createdAt: '2026-01-02T00:00:00Z',
    },
    {
      id: 'provider-id-3',
      name: 'Bob Provider',
      email: 'bob@provider.com',
      role: 'Provider',
      active: false,
      createdAt: '2026-01-03T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: currentAdmin,
      user: currentAdmin,
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

  it('renders user table from API response', async () => {
    vi.spyOn(adminUsersApi, 'listAdminUsers').mockResolvedValue({
      items: sampleUsers,
      total: 3,
      page: 1,
      pageSize: 20,
    });

    render(<UserManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Alice Consumer')).toBeDefined();
    });

    expect(screen.getByText('alice@consumer.com')).toBeDefined();
    expect(screen.getByText('Bob Provider')).toBeDefined();
    expect(screen.getByText('bob@provider.com')).toBeDefined();
    expect(screen.getByText('3 kết quả · Trang 1/1')).toBeDefined();
  });

  it('self-lock button disabled with tooltip for current admin', async () => {
    vi.spyOn(adminUsersApi, 'listAdminUsers').mockResolvedValue({
      items: sampleUsers,
      total: 3,
      page: 1,
      pageSize: 20,
    });

    render(<UserManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Main Admin')).toBeDefined();
    });

    // Nút của Admin chính mình phải bị disabled và có tooltip
    const buttons = screen.getAllByRole('button');
    const selfLockButton = buttons.find(
      btn => btn.getAttribute('title') === 'Không thể khóa chính mình'
    );

    expect(selfLockButton).toBeDefined();
    expect(selfLockButton?.hasAttribute('disabled')).toBe(true);
  });

  it('search input triggers API call with debounce', async () => {
    const listSpy = vi.spyOn(adminUsersApi, 'listAdminUsers').mockResolvedValue({
      items: sampleUsers,
      total: 3,
      page: 1,
      pageSize: 20,
    });

    render(<UserManagementPage />);

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledTimes(1);
    });

    const searchInput = screen.getByPlaceholderText(/Tìm theo email|Search email/i);

    // Nhập từ khóa tìm kiếm
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'alice' } });
    });

    // Chờ debounce 350ms
    await waitFor(
      () => {
        expect(listSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'alice',
          }),
          expect.anything()
        );
      },
      { timeout: 1000 }
    );
  });

  it('toggle user active state (mở modal, gọi API, cập nhật thông báo)', async () => {
    vi.spyOn(adminUsersApi, 'listAdminUsers').mockResolvedValue({
      items: sampleUsers,
      total: 3,
      page: 1,
      pageSize: 20,
    });

    const setAdminUserActiveSpy = vi
      .spyOn(adminUsersApi, 'setAdminUserActive')
      .mockResolvedValue({
        user: { ...sampleUsers[1], active: false },
        revokedSessions: 1,
      });

    render(<UserManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Alice Consumer')).toBeDefined();
    });

    // Tìm nút "Khóa tài khoản" của Alice
    const buttons = screen.getAllByRole('button');
    const lockAliceBtn = buttons.find(
      btn =>
        (btn.textContent?.includes('Lock') || btn.textContent?.includes('Khóa')) &&
        !btn.hasAttribute('disabled')
    );

    expect(lockAliceBtn).toBeDefined();

    act(() => {
      lockAliceBtn?.click();
    });

    // Modal xác nhận xuất hiện
    await waitFor(() => {
      expect(screen.getByText('Xác nhận khóa tài khoản')).toBeDefined();
    });

    // Nhấn nút Xác nhận trong Modal
    const confirmBtn = screen.getByText('Xác nhận');
    await act(async () => {
      confirmBtn.click();
    });

    expect(setAdminUserActiveSpy).toHaveBeenCalledWith('consumer-id-2', false);

    // Thông báo kết quả hiển thị
    await waitFor(() => {
      expect(screen.getByText(/Đã khóa alice@consumer.com và thu hồi 1 phiên/)).toBeDefined();
    });
  });

  it('error states handled gracefully với nút thử lại', async () => {
    vi.spyOn(adminUsersApi, 'listAdminUsers').mockRejectedValueOnce(
      new ApiError(500, 'INTERNAL_SERVER_ERROR', 'Máy chủ cơ sở dữ liệu gặp sự cố.')
    );

    render(<UserManagementPage />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
    });

    expect(screen.getByText(/Máy chủ đang gặp sự cố/)).toBeDefined();

    // Có nút thử lại
    const retryBtn = screen.getByText('Thử lại');
    expect(retryBtn).toBeDefined();
  });

  it('admin PATCH lỗi hiển thị thông báo lỗi trung thực và không báo thành công', async () => {
    vi.spyOn(adminUsersApi, 'listAdminUsers').mockResolvedValue({
      items: sampleUsers,
      total: 3,
      page: 1,
      pageSize: 20,
    });

    vi.spyOn(adminUsersApi, 'setAdminUserActive').mockRejectedValueOnce(
      new ApiError(409, 'CANNOT_MODIFY_SELF', 'Bạn không thể khóa tài khoản của chính mình.')
    );

    render(<UserManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Alice Consumer')).toBeDefined();
    });

    const buttons = screen.getAllByRole('button');
    const lockAliceBtn = buttons.find(
      btn =>
        (btn.textContent?.includes('Lock') || btn.textContent?.includes('Khóa')) &&
        !btn.hasAttribute('disabled')
    );

    act(() => {
      lockAliceBtn?.click();
    });

    await waitFor(() => {
      expect(screen.getByText('Xác nhận khóa tài khoản')).toBeDefined();
    });

    const confirmBtn = screen.getByText('Xác nhận');
    await act(async () => {
      confirmBtn.click();
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
    });

    expect(screen.getByText('Bạn không thể khóa tài khoản của chính mình.')).toBeDefined();
    expect(screen.queryByText(/Đã khóa/)).toBeNull();
  });
});
