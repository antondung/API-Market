import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  authenticatedRequest,
  clearTokens,
  getSavedTokens,
  login,
  logout,
  refresh,
  ApiError,
  type BackendTokens
} from '../services/authApi';

describe('authApi unit tests', () => {
  const mockTokens: BackendTokens = {
    accessToken: 'mock-access-token-12345',
    refreshToken: 'mock-refresh-token-67890',
    tokenType: 'Bearer',
    expiresIn: 900,
    user: {
      id: 'user-uuid-1',
      name: 'Test Consumer',
      email: 'consumer@apihub.dev',
      role: 'Consumer'
    }
  };

  beforeEach(() => {
    clearTokens();
    vi.restoreAllMocks();
  });

  it('login lưu token vào sessionStorage và trả về SavedTokens hợp lệ', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ data: mockTokens }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    const saved = await login({ email: 'consumer@apihub.dev', password: 'Password123!' });

    expect(saved.accessToken).toBe(mockTokens.accessToken);
    expect(saved.refreshToken).toBe(mockTokens.refreshToken);
    expect(saved.user.email).toBe('consumer@apihub.dev');
    expect(saved.expiresAt).toBeGreaterThan(Date.now());

    const inStorage = getSavedTokens();
    expect(inStorage).not.toBeNull();
    expect(inStorage?.accessToken).toBe(mockTokens.accessToken);
  });

  it('refresh quay vòng token và cập nhật sessionStorage', async () => {
    sessionStorage.setItem(
      'apihub_sprint1_auth',
      JSON.stringify({
        ...mockTokens,
        expiresAt: Date.now() + 60_000
      })
    );

    const rotatedMock: BackendTokens = {
      ...mockTokens,
      accessToken: 'new-access-token-999',
      refreshToken: 'new-refresh-token-888'
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ data: rotatedMock }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    const result = await refresh();

    expect(result.accessToken).toBe('new-access-token-999');
    expect(result.refreshToken).toBe('new-refresh-token-888');

    const inStorage = getSavedTokens();
    expect(inStorage?.accessToken).toBe('new-access-token-999');
  });

  it('race condition: các lệnh refresh đồng thời dùng chung một promise duy nhất (deduplication)', async () => {
    sessionStorage.setItem(
      'apihub_sprint1_auth',
      JSON.stringify({
        ...mockTokens,
        expiresAt: Date.now() + 60_000
      })
    );

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(
      async () =>
        new Promise(resolve => {
          setTimeout(
            () =>
              resolve(
                new Response(JSON.stringify({ data: mockTokens }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                })
              ),
            20
          );
        })
    );

    // Kích hoạt 3 lệnh refresh đồng thời
    const [res1, res2, res3] = await Promise.all([refresh(), refresh(), refresh()]);

    expect(res1.accessToken).toBe(mockTokens.accessToken);
    expect(res2.accessToken).toBe(mockTokens.accessToken);
    expect(res3.accessToken).toBe(mockTokens.accessToken);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('1. logout với access token hợp lệ: dọn dẹp sessionStorage và gửi POST /logout với Bearer token', async () => {
    sessionStorage.setItem(
      'apihub_sprint1_auth',
      JSON.stringify({
        ...mockTokens,
        expiresAt: Date.now() + 300_000
      })
    );

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 204 })
    );

    const result = await logout();

    expect(result.serverRevoked).toBe(true);
    expect(getSavedTokens()).toBeNull();
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/logout'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockTokens.accessToken}`
        })
      })
    );
  });

  it('2. logout với access token đã hết hạn nhưng refresh token hợp lệ: tự động refresh để lấy access token mới thu hồi', async () => {
    sessionStorage.setItem(
      'apihub_sprint1_auth',
      JSON.stringify({
        ...mockTokens,
        expiresAt: Date.now() - 1000 // Đã hết hạn
      })
    );

    const refreshedTokens: BackendTokens = {
      ...mockTokens,
      accessToken: 'refreshed-for-logout-token'
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/auth/refresh')) {
        return new Response(JSON.stringify({ data: refreshedTokens }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      if (urlStr.includes('/api/auth/logout')) {
        return new Response(null, { status: 204 });
      }
      return new Response(null, { status: 404 });
    });

    const result = await logout();

    expect(result.serverRevoked).toBe(true);
    expect(getSavedTokens()).toBeNull();
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/logout'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer refreshed-for-logout-token'
        })
      })
    );
  });

  it('3. logout với phiên đã bị thu hồi trên server (401): dọn dẹp cục bộ và trả về warning trung thực', async () => {
    sessionStorage.setItem(
      'apihub_sprint1_auth',
      JSON.stringify({
        ...mockTokens,
        expiresAt: Date.now() + 300_000
      })
    );

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Session already revoked' } }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await logout();

    expect(result.serverRevoked).toBe(false);
    expect(result.warning).toBeDefined();
    expect(getSavedTokens()).toBeNull();
  });

  it('4. logout khi mất kết nối mạng (offline): dọn dẹp cục bộ và trả về warning kết nối', async () => {
    sessionStorage.setItem(
      'apihub_sprint1_auth',
      JSON.stringify({
        ...mockTokens,
        expiresAt: Date.now() + 300_000
      })
    );

    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const result = await logout();

    expect(result.serverRevoked).toBe(false);
    expect(result.warning).toContain('Không thể kết nối đến máy chủ');
    expect(getSavedTokens()).toBeNull();
  });

  it('5. logout trong khi refresh đang chạy: phối hợp và ngăn refresh muộn ghi đè session', async () => {
    sessionStorage.setItem(
      'apihub_sprint1_auth',
      JSON.stringify({
        ...mockTokens,
        expiresAt: Date.now() - 1000
      })
    );

    let resolveRefresh: (res: Response) => void;
    const refreshPending = new Promise<Response>(resolve => {
      resolveRefresh = resolve;
    });

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/auth/refresh')) {
        return refreshPending;
      }
      if (urlStr.includes('/api/auth/logout')) {
        return new Response(null, { status: 204 });
      }
      return new Response(null, { status: 404 });
    });

    // Bắt đầu refresh
    const refreshOp = refresh();

    // Trong khi refresh đang chạy, người dùng nhấn logout
    const logoutOp = logout();

    // Trả kết quả refresh
    resolveRefresh!(
      new Response(
        JSON.stringify({
          data: {
            ...mockTokens,
            accessToken: 'late-token-123'
          }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    // Refresh op bị từ chối do authGeneration đã thay đổi
    await expect(refreshOp).rejects.toThrow();

    const logoutResult = await logoutOp;
    expect(logoutResult.serverRevoked).toBe(true);

    // Session tuyệt đối không bị tái tạo bởi late refresh
    expect(getSavedTokens()).toBeNull();
  });

  it('6. double-click logout: các lệnh gọi đồng thời dùng chung một promise duy nhất', async () => {
    sessionStorage.setItem(
      'apihub_sprint1_auth',
      JSON.stringify({
        ...mockTokens,
        expiresAt: Date.now() + 300_000
      })
    );

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      await new Promise(r => setTimeout(r, 20));
      return new Response(null, { status: 204 });
    });

    // Nhấn logout 2 lần liên tiếp
    const [res1, res2] = await Promise.all([logout(), logout()]);

    expect(res1.serverRevoked).toBe(true);
    expect(res2.serverRevoked).toBe(true);
    // Chỉ gửi 1 request /api/auth/logout
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(getSavedTokens()).toBeNull();
  });

  it('7. logout và đăng nhập ngay bằng tài khoản khác: logout cũ không xóa nhầm phiên mới', async () => {
    sessionStorage.setItem(
      'apihub_sprint1_auth',
      JSON.stringify({
        ...mockTokens,
        expiresAt: Date.now() + 300_000
      })
    );

    let resolveLogout: (res: Response) => void;
    const logoutPending = new Promise<Response>(resolve => {
      resolveLogout = resolve;
    });

    const user2Tokens: BackendTokens = {
      accessToken: 'user2-access-token',
      refreshToken: 'user2-refresh-token',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: 'user-2',
        name: 'User Two',
        email: 'user2@apihub.dev',
        role: 'Provider'
      }
    };

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/auth/logout')) {
        return logoutPending;
      }
      if (urlStr.includes('/api/auth/login')) {
        return new Response(JSON.stringify({ data: user2Tokens }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(null, { status: 404 });
    });

    // Bắt đầu logout của User 1
    const logoutOp = logout();

    // Ngay lập tức User 2 đăng nhập
    const loginOp = login({ email: 'user2@apihub.dev', password: 'Password123!' });

    const user2Saved = await loginOp;
    expect(user2Saved.user.email).toBe('user2@apihub.dev');

    // Sau đó request logout của User 1 mới phản hồi
    resolveLogout!(new Response(null, { status: 204 }));
    await logoutOp;

    // Token của User 2 trong sessionStorage vẫn nguyên vẹn
    const currentStorage = getSavedTokens();
    expect(currentStorage).not.toBeNull();
    expect(currentStorage?.accessToken).toBe('user2-access-token');
    expect(currentStorage?.user.email).toBe('user2@apihub.dev');
  });

  it('8. response HTTP muộn sau khi logout không tái tạo session', async () => {
    sessionStorage.setItem(
      'apihub_sprint1_auth',
      JSON.stringify({
        ...mockTokens,
        expiresAt: Date.now() + 300_000
      })
    );

    let resolveLateRequest: (res: Response) => void;
    const latePending = new Promise<Response>(resolve => {
      resolveLateRequest = resolve;
    });

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/auth/logout')) {
        return new Response(null, { status: 204 });
      }
      if (urlStr.includes('/api/late-profile')) {
        return latePending;
      }
      return new Response(null, { status: 404 });
    });

    // Request trước logout
    const reqOp = authenticatedRequest('/api/late-profile');

    // Logout xảy ra
    await logout();
    expect(getSavedTokens()).toBeNull();

    // Response muộn trả về
    resolveLateRequest!(
      new Response(JSON.stringify({ data: { profile: 'data' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    try {
      await reqOp;
    } catch (err: any) {
      expect(err.code).toBe('STALE_AUTH_RESULT');
    }

    // Session vẫn là null sau khi response muộn hoàn thành
    expect(getSavedTokens()).toBeNull();
  });

  it('authenticatedRequest tự động retry khi gặp HTTP 401 và cập nhật token mới', async () => {
    sessionStorage.setItem(
      'apihub_sprint1_auth',
      JSON.stringify({
        ...mockTokens,
        expiresAt: Date.now() + 300_000
      })
    );

    const rotatedMock: BackendTokens = {
      ...mockTokens,
      accessToken: 'rotated-access-token-after-401'
    };

    let callCount = 0;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      callCount++;
      const urlStr = String(url);
      if (urlStr.includes('/api/auth/refresh')) {
        return new Response(JSON.stringify({ data: rotatedMock }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      if (urlStr.includes('/api/test-endpoint')) {
        if (callCount === 1) {
          return new Response(
            JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Token expired' } }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return new Response(JSON.stringify({ data: { message: 'success' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(null, { status: 404 });
    });

    const res = await authenticatedRequest<{ data: { message: string } }>('/api/test-endpoint');

    expect(res.data.message).toBe('success');
  });

  it('authenticatedRequest ném lỗi ngay nếu gặp lỗi không phải 401 (vd: 403 Forbidden)', async () => {
    sessionStorage.setItem(
      'apihub_sprint1_auth',
      JSON.stringify({
        ...mockTokens,
        expiresAt: Date.now() + 300_000
      })
    );

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Access denied' } }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    );

    await expect(authenticatedRequest('/api/forbidden-endpoint')).rejects.toThrow(ApiError);
  });

  it('concurrent 401 requests: nhiều request cùng gặp 401 tự động retry với token mới qua 1 lần refresh duy nhất', async () => {
    sessionStorage.setItem(
      'apihub_sprint1_auth',
      JSON.stringify({
        ...mockTokens,
        expiresAt: Date.now() + 300_000
      })
    );

    const rotatedMock: BackendTokens = {
      ...mockTokens,
      accessToken: 'concurrent-rotated-access-token'
    };

    let refreshCount = 0;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any, opts: any) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/auth/refresh')) {
        refreshCount++;
        await new Promise(r => setTimeout(r, 20));
        return new Response(JSON.stringify({ data: rotatedMock }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      if (urlStr.includes('/api/concurrent-')) {
        const authHeader = opts?.headers?.Authorization;
        if (authHeader === `Bearer ${mockTokens.accessToken}`) {
          return new Response(
            JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Expired' } }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }
        if (authHeader === `Bearer ${rotatedMock.accessToken}`) {
          return new Response(
            JSON.stringify({ data: { endpoint: urlStr } }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
      return new Response(null, { status: 404 });
    });

    const [res1, res2] = await Promise.all([
      authenticatedRequest<{ data: { endpoint: string } }>('/api/concurrent-1'),
      authenticatedRequest<{ data: { endpoint: string } }>('/api/concurrent-2'),
    ]);

    expect(res1.data.endpoint).toContain('/api/concurrent-1');
    expect(res2.data.endpoint).toContain('/api/concurrent-2');
    expect(refreshCount).toBe(1);
    expect(getSavedTokens()?.accessToken).toBe(rotatedMock.accessToken);
  });

  it('Issue 1: authenticatedRequest của User A gặp 401 khi User B đã đăng nhập -> không retry bằng token User B và không hủy session User B', async () => {
    sessionStorage.setItem(
      'apihub_sprint1_auth',
      JSON.stringify({
        ...mockTokens,
        accessToken: 'user-a-access-token',
        refreshToken: 'user-a-refresh-token',
        user: { ...mockTokens.user, id: 'user-a', email: 'user.a@apihub.dev' },
        expiresAt: Date.now() + 300_000
      })
    );

    let resolveRequestA: (res: Response) => void;
    const requestAPending = new Promise<Response>(resolve => {
      resolveRequestA = resolve;
    });

    const userBTokens: BackendTokens = {
      accessToken: 'user-b-access-token',
      refreshToken: 'user-b-refresh-token',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: 'user-b',
        name: 'User B',
        email: 'user.b@apihub.dev',
        role: 'Provider'
      }
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/user-a-data')) {
        return requestAPending;
      }
      if (urlStr.includes('/api/auth/login')) {
        return new Response(JSON.stringify({ data: userBTokens }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      if (urlStr.includes('/api/auth/refresh')) {
        return new Response(JSON.stringify({ data: userBTokens }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(null, { status: 404 });
    });

    const reqA = authenticatedRequest('/api/user-a-data');

    await login({ email: 'user.b@apihub.dev', password: 'PasswordB123!' });
    expect(getSavedTokens()?.accessToken).toBe('user-b-access-token');

    resolveRequestA!(
      new Response(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Token expired' } }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    await expect(reqA).rejects.toThrow();

    const callsWithUserBToken = fetchSpy.mock.calls.filter(call => {
      const headers = (call[1] as any)?.headers;
      return headers?.Authorization === 'Bearer user-b-access-token' && String(call[0]).includes('/api/user-a-data');
    });
    expect(callsWithUserBToken.length).toBe(0);

    expect(getSavedTokens()?.accessToken).toBe('user-b-access-token');
    expect(getSavedTokens()?.user.email).toBe('user.b@apihub.dev');
  });

  it('Issue 2: logout trong khi refresh đang chạy sử dụng token vừa xoay để thu hồi, không gọi lại refresh token đã tiêu thụ và không lưu token', async () => {
    sessionStorage.setItem(
      'apihub_sprint1_auth',
      JSON.stringify({
        ...mockTokens,
        expiresAt: Date.now() - 1000
      })
    );

    let resolveRefresh: (res: Response) => void;
    const refreshPending = new Promise<Response>(resolve => {
      resolveRefresh = resolve;
    });

    let refreshCallCount = 0;
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/auth/refresh')) {
        refreshCallCount++;
        return refreshPending;
      }
      if (urlStr.includes('/api/auth/logout')) {
        return new Response(null, { status: 204 });
      }
      return new Response(null, { status: 404 });
    });

    const refreshOp = refresh();
    const logoutOp = logout();

    resolveRefresh!(
      new Response(
        JSON.stringify({
          data: {
            ...mockTokens,
            accessToken: 'rotated-access-for-logout-only',
            refreshToken: 'rotated-refresh-token-new'
          }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    await expect(refreshOp).rejects.toThrow();
    const logoutRes = await logoutOp;

    expect(logoutRes.serverRevoked).toBe(true);

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/logout'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer rotated-access-for-logout-only'
        })
      })
    );

    expect(refreshCallCount).toBe(1);
    expect(getSavedTokens()).toBeNull();
  });

  it('Issue 3: User A logout đang pending, User B đăng nhập rồi logout -> User B dọn session ngay, gọi revoke độc lập và A hoàn tất không ảnh hưởng B', async () => {
    sessionStorage.setItem(
      'apihub_sprint1_auth',
      JSON.stringify({
        ...mockTokens,
        accessToken: 'token-user-a',
        refreshToken: 'refresh-user-a',
        user: { ...mockTokens.user, id: 'user-a', email: 'user.a@apihub.dev' }
      })
    );

    let resolveLogoutA: (res: Response) => void;
    const logoutAPending = new Promise<Response>(resolve => {
      resolveLogoutA = resolve;
    });

    const userBTokens: BackendTokens = {
      accessToken: 'token-user-b',
      refreshToken: 'refresh-user-b',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: 'user-b',
        name: 'User B',
        email: 'user.b@apihub.dev',
        role: 'Provider'
      }
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any, opts: any) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/auth/logout')) {
        const auth = (opts?.headers as any)?.Authorization;
        if (auth === 'Bearer token-user-a') {
          return logoutAPending;
        }
        if (auth === 'Bearer token-user-b') {
          return new Response(null, { status: 204 });
        }
      }
      if (urlStr.includes('/api/auth/login')) {
        return new Response(JSON.stringify({ data: userBTokens }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(null, { status: 404 });
    });

    const logoutAOp = logout();

    await login({ email: 'user.b@apihub.dev', password: 'PasswordB123!' });
    expect(getSavedTokens()?.accessToken).toBe('token-user-b');

    const logoutBOp = logout();
    expect(getSavedTokens()).toBeNull();

    const logoutBResult = await logoutBOp;
    expect(logoutBResult.serverRevoked).toBe(true);

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/logout'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token-user-b'
        })
      })
    );

    resolveLogoutA!(new Response(null, { status: 204 }));
    const logoutAResult = await logoutAOp;
    expect(logoutAResult.serverRevoked).toBe(true);

    expect(getSavedTokens()).toBeNull();
  });
});
