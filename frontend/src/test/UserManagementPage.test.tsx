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

  it('Issue 5: kết quả tìm kiếm cũ không được ghi đè kết quả tìm kiếm mới (controlled promise race)', async () => {
    let resolveSlowSearch: (res: any) => void;
    const slowPromise = new Promise(resolve => {
      resolveSlowSearch = resolve;
    });

    let resolveFastSearch: (res: any) => void;
    const fastPromise = new Promise(resolve => {
      resolveFastSearch = resolve;
    });

    const listSpy = vi.spyOn(adminUsersApi, 'listAdminUsers').mockImplementation(async (params: any) => {
      if (params?.search === 'slow') {
        return slowPromise as any;
      }
      if (params?.search === 'fast') {
        return fastPromise as any;
      }
      return { items: sampleUsers, total: 3, page: 1, pageSize: 20 };
    });

    render(<UserManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Alice Consumer')).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(/Tìm theo email|Search email/i);

    // Kích hoạt tìm kiếm 1 (slow)
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'slow' } });
    });

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledWith(expect.objectContaining({ search: 'slow' }), expect.anything());
    }, { timeout: 1000 });

    // Kích hoạt tìm kiếm 2 (fast)
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'fast' } });
    });

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledWith(expect.objectContaining({ search: 'fast' }), expect.anything());
    }, { timeout: 1000 });

    // Trả kết quả tìm kiếm 2 (fast) trước
    await act(async () => {
      resolveFastSearch!({
        items: [{
          id: 'fast-user-id',
          name: 'Fast User Winner',
          email: 'fast@winner.com',
          role: 'Consumer',
          active: true,
          createdAt: '2026-01-01T00:00:00Z',
        }],
        total: 1,
        page: 1,
        pageSize: 20
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Fast User Winner')).toBeDefined();
    });

    // Giờ kết quả tìm kiếm 1 (slow) mới phản hồi trễ
    await act(async () => {
      resolveSlowSearch!({
        items: [{
          id: 'slow-user-id',
          name: 'Slow User Stale',
          email: 'slow@stale.com',
          role: 'Provider',
          active: true,
          createdAt: '2026-01-01T00:00:00Z',
        }],
        total: 1,
        page: 1,
        pageSize: 20
      });
    });

    // Bảng VẪN hiển thị Fast User Winner, kết quả cũ không được ghi đè!
    expect(screen.getByText('Fast User Winner')).toBeDefined();
    expect(screen.queryByText('Slow User Stale')).toBeNull();
  });

  it('Issue 5: yêu cầu đang chờ không thể repopulate dữ liệu sau khi logout', async () => {
    let resolvePendingRequest: (res: any) => void;
    const pendingPromise = new Promise(resolve => {
      resolvePendingRequest = resolve;
    });

    vi.spyOn(adminUsersApi, 'listAdminUsers').mockReturnValue(pendingPromise as any);

    const { rerender } = render(<UserManagementPage />);

    // Trong khi yêu cầu đang pending, người dùng logout (currentUser = null)
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

    rerender(<UserManagementPage />);

    // Dữ liệu lập tức bị làm sạch về 0
    await waitFor(() => {
      expect(screen.getByText('0 kết quả · Trang 1/1')).toBeDefined();
    });

    // Yêu cầu cũ phản hồi dữ liệu sau khi đã logout
    await act(async () => {
      resolvePendingRequest!({
        items: sampleUsers,
        total: 3,
        page: 1,
        pageSize: 20
      });
    });

    // Bảng dữ liệu tuyệt đối không bị repopulate sau khi đã logout!
    expect(screen.queryByText('Alice Consumer')).toBeNull();
    expect(screen.getByText('0 kết quả · Trang 1/1')).toBeDefined();
  });
});
