import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listAdminUsers, setAdminUserActive, type AdminUsersPage } from '../services/adminUsersApi';
import * as authApiService from '../services/authApi';

describe('adminUsersApi unit tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('listAdminUsers xây dựng query string chính xác với đầy đủ tham số', async () => {
    const mockPage: AdminUsersPage = {
      items: [
        {
          id: 'user-1',
          name: 'Provider John',
          email: 'john@provider.com',
          role: 'Provider',
          active: true,
          createdAt: '2026-01-01T00:00:00Z',
        },
      ],
      total: 1,
      page: 2,
      pageSize: 15,
    };

    const authenticatedRequestSpy = vi
      .spyOn(authApiService, 'authenticatedRequest')
      .mockResolvedValueOnce({ data: mockPage } as any);

    const controller = new AbortController();
    const result = await listAdminUsers(
      {
        page: 2,
        pageSize: 15,
        search: '  john  ',
        role: 'Provider',
        active: true,
      },
      controller.signal
    );

    expect(result.total).toBe(1);
    expect(result.items[0].email).toBe('john@provider.com');

    expect(authenticatedRequestSpy).toHaveBeenCalledTimes(1);
    const calledUrl = authenticatedRequestSpy.mock.calls[0][0];
    expect(calledUrl).toContain('page=2');
    expect(calledUrl).toContain('pageSize=15');
    expect(calledUrl).toContain('search=john');
    expect(calledUrl).toContain('role=Provider');
    expect(calledUrl).toContain('active=true');

    const options = authenticatedRequestSpy.mock.calls[0][1];
    expect(options?.signal).toBe(controller.signal);
  });

  it('listAdminUsers bỏ qua các tham số undefined hoặc chuỗi trắng', async () => {
    const mockPage: AdminUsersPage = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
    };

    const authenticatedRequestSpy = vi
      .spyOn(authApiService, 'authenticatedRequest')
      .mockResolvedValueOnce({ data: mockPage } as any);

    await listAdminUsers({ page: 1, pageSize: 10, search: '   ' });

    const calledUrl = authenticatedRequestSpy.mock.calls[0][0];
    expect(calledUrl).toContain('page=1');
    expect(calledUrl).toContain('pageSize=10');
    expect(calledUrl).not.toContain('search');
    expect(calledUrl).not.toContain('role');
    expect(calledUrl).not.toContain('active');
  });

  it('setAdminUserActive gửi PATCH request với payload active và parse kết quả trả về', async () => {
    const mockResponseData = {
      user: {
        id: 'u-123',
        name: 'Target User',
        email: 'target@apihub.dev',
        role: 'Consumer' as const,
        active: false,
        createdAt: '2026-02-01T00:00:00Z',
      },
      revokedSessions: 2,
    };

    const authenticatedRequestSpy = vi
      .spyOn(authApiService, 'authenticatedRequest')
      .mockResolvedValueOnce({ data: mockResponseData } as any);

    const res = await setAdminUserActive('u-123', false);

    expect(res.user.active).toBe(false);
    expect(res.revokedSessions).toBe(2);

    expect(authenticatedRequestSpy).toHaveBeenCalledWith(
      '/api/admin/users/u-123/active',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ active: false }),
      })
    );
  });
});
