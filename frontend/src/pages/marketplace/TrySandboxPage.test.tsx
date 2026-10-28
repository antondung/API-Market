import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { TrySandboxPage } from './TrySandboxPage';
import * as marketplaceApi from '../../services/marketplaceApi';
import * as consumerApi from '../../services/consumerApi';
import type { MarketplaceApiDetail } from '../../services/marketplaceTypes';
import { ApiError } from '../../services/authApi';

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

let mockCurrentUser: { id: string; email: string; role: string } | null = {
  id: 'user-consumer-1',
  email: 'consumer@apihub.vn',
  role: 'Consumer',
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser,
    isAuthenticated: Boolean(mockCurrentUser),
  }),
}));

const mockT = (key: string) => key;

vi.mock('../../i18n', () => ({
  useLanguage: () => ({ t: mockT }),
}));

const getFutureExpiry = (offsetMs = 86400000) => new Date(Date.now() + offsetMs).toISOString();

const mockApiDetail: MarketplaceApiDetail = {
  id: 'api-sandbox-1',
  name: 'Global Geocoding Sandbox API',
  description: 'Precision geolocation and reverse geocoding engine.',
  providerId: 'prov-geo',
  providerName: 'GeoData Corp',
  providerStatus: 'Verified',
  category: 'Weather & Geo',
  tags: ['geo', 'maps'],
  hasFreePlan: true,
  hasPaidPlan: true,
  publishedAt: '2026-10-15T09:00:00.000Z',
  versions: [
    { id: 'v1', version: '1.0.0', changelog: 'Initial' },
  ],
  endpoints: [
    {
      id: 'ep-1',
      versionId: 'v1',
      path: '/v1/geocode/forward',
      method: 'GET',
      description: 'Convert address to coordinates',
      parameters: [
        { name: 'address', in: 'query', required: true, schema: { type: 'string' }, default: '123 Main St' },
      ],
      requestSchema: null,
      responseExample: null,
    },
  ],
  plans: [
    {
      id: 'plan-1',
      name: 'Sandbox Free',
      priceMonthly: 0,
      currency: 'VND',
      rateLimit: 10,
      quota: 1000,
      recommended: false,
    },
  ],
  documentation: [],
  legal: null,
};

const renderPage = (apiId = 'api-sandbox-1') => {
  return render(
    <MemoryRouter initialEntries={[`/api/${apiId}/try-sandbox`]}>
      <Routes>
        <Route path="/api/:id/try-sandbox" element={<TrySandboxPage />} />
        <Route path="/api/:id/playground" element={<div>Interactive Playground Page</div>} />
        <Route path="/dashboard/keys" element={<div>API Keys Page</div>} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('TrySandboxPage Security, Sandbox Grant Lifecycle & Quota UI', () => {
  beforeEach(() => {
    mockCurrentUser = {
      id: 'user-consumer-1',
      email: 'consumer@apihub.vn',
      role: 'Consumer',
    };
    vi.clearAllMocks();
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(mockApiDetail);
    vi.spyOn(consumerApi, 'getSandboxGrant').mockRejectedValue({ status: 404, message: 'Not found' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not render hardcoded fake demo credentials or unverified gateway claims', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
    });

    // Zero fake demo keys in DOM
    expect(screen.queryByText('ak_sand_consumer_demo_test')).toBeNull();

    // Renders honest auth requirement and API Keys navigation
    expect(screen.getByText('Yêu cầu Khóa Xác thực (API Key)')).toBeDefined();
    expect(screen.getByText('Quản lý API Keys')).toBeDefined();
  });

  it('renders custom API key input with password masking by default and zero local persistence', async () => {
    const localSpy = vi.spyOn(Storage.prototype, 'setItem');
    const sessionSpy = vi.spyOn(sessionStorage, 'setItem');

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
    });

    const input = screen.getByPlaceholderText(/Nhập API Key của bạn/i);
    expect(input.getAttribute('type')).toBe('password');

    // Type a key
    fireEvent.change(input, { target: { value: 'my_secret_token_999' } });
    expect((input as HTMLInputElement).value).toBe('my_secret_token_999');

    // Toggle reveal button
    const revealBtn = screen.getByTitle('Hiện');
    fireEvent.click(revealBtn);
    expect(input.getAttribute('type')).toBe('text');

    // Zero persistence
    expect(localSpy).not.toHaveBeenCalledWith(expect.stringMatching(/api.*key|secret/i), expect.anything());
    expect(sessionSpy).not.toHaveBeenCalledWith(expect.stringMatching(/api.*key|secret/i), expect.anything());
  });

  it('links to /dashboard/keys and never /consumer/keys', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
    });

    const keyLink = screen.getByRole('link', { name: /Quản lý API Keys/i });
    expect(keyLink.getAttribute('href')).toBe('/dashboard/keys');
    expect(screen.queryByRole('link', { name: /consumer\/keys/i })).toBeNull();
  });

  it('defaults to placeholder in cURL snippet and requires explicit opt-in to insert real key', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
    });

    // Enter real key in step 1
    const input = screen.getByPlaceholderText(/Nhập API Key của bạn/i);
    fireEvent.change(input, { target: { value: 'secret_prod_key_777' } });

    // Navigate to step 3 without checking opt-in
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục: Chọn Endpoint/i }));
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục: Xem cURL & Chạy thử/i }));

    // Verify snippet has YOUR_API_KEY, NOT the plaintext secret
    expect(screen.getAllByText(/YOUR_API_KEY/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/secret_prod_key_777/)).toBeNull();

    // Toggle explicit insertion button
    const toggleBtn = screen.getByRole('button', { name: /Chèn API Key thật/i });
    fireEvent.click(toggleBtn);

    // Now snippet displays real key
    expect(screen.getByText(/secret_prod_key_777/)).toBeDefined();
  });

  it('clears API key state on session invalidation event', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
    });

    const input = screen.getByPlaceholderText(/Nhập API Key của bạn/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'transient_key_123' } });
    expect(input.value).toBe('transient_key_123');

    // Simulate session logout / invalidation
    window.dispatchEvent(new Event('apihub:session-invalidated'));

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('renders unclaimed sandbox grant state and requires explicit claim action', async () => {
    const claimSpy = vi.spyOn(consumerApi, 'claimSandboxGrant').mockResolvedValueOnce({
      id: 'g-100',
      apiId: 'api-sandbox-1',
      maxRequests: 5,
      usedRequests: 0,
      remainingRequests: 5,
      available: true,
      expiresAt: getFutureExpiry(),
      revokedAt: null,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
    });

    // Verify initial unclaimed state
    expect(screen.getByText('Chưa kích hoạt Sandbox Grant')).toBeDefined();
    expect(claimSpy).not.toHaveBeenCalled();

    // Click Claim Sandbox Grant
    const claimBtn = screen.getByRole('button', { name: /Kích hoạt Sandbox Grant/i });
    fireEvent.click(claimBtn);

    // Verifies grant is claimed and authoritative quota displayed
    await waitFor(() => {
      expect(claimSpy).toHaveBeenCalledWith('api-sandbox-1');
      expect(screen.getByText(/Active Grant/i)).toBeDefined();
      expect(screen.getByText('5')).toBeDefined(); // remaining
    });
  });

  it('displays authoritative quota, expiration, and exhausted state when backend returns 0 remaining', async () => {
    vi.spyOn(consumerApi, 'getSandboxGrant').mockResolvedValue({
      id: 'g-200',
      apiId: 'api-sandbox-1',
      maxRequests: 5,
      usedRequests: 5,
      remainingRequests: 0,
      available: false,
      expiresAt: getFutureExpiry(),
      revokedAt: null,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
    });

    expect(await screen.findByText('Exhausted')).toBeDefined();
    expect(screen.getByText('Hạn mức Sandbox đã hết')).toBeDefined();
    expect(screen.getByText('0')).toBeDefined(); // 0 remaining
  });

  it('prompts unauthenticated user to log in as Consumer', async () => {
    mockCurrentUser = null;
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
    });

    expect(screen.getByText('Yêu cầu Đăng nhập Consumer')).toBeDefined();
    const loginLink = screen.getByRole('link', { name: /Đăng nhập Consumer/i });
    expect(loginLink.getAttribute('href')).toBe('/login');
  });

  it('explains SafeProxy and Anti-SSRF technical architecture in Step 1', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
    });

    expect(screen.getByText(/Kiến trúc Bảo vệ An ninh SafeProxy & Anti-SSRF/i)).toBeDefined();
    expect(screen.getByText(/ghim địa chỉ IP qua DNS pinning/i)).toBeDefined();
  });

  it('provides direct navigation to Playground in Step 3', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
    });

    // Navigate to step 3
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục: Chọn Endpoint/i }));
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục: Xem cURL & Chạy thử/i }));

    const openPlaygroundBtn = screen.getByRole('button', { name: /Mở Playground để chạy thử/i });
    fireEvent.click(openPlaygroundBtn);

    expect(await screen.findByText('Interactive Playground Page')).toBeDefined();
  });

  it('attaches state.from with /api/:id/try-sandbox on login redirect', async () => {
    mockCurrentUser = null;
    let capturedLocation: any;
    const LocationWatcher = () => {
      capturedLocation = useLocation();
      return <div>Captured: {capturedLocation.pathname}</div>;
    };

    render(
      <MemoryRouter initialEntries={['/api/api-sandbox-1/try-sandbox']}>
        <Routes>
          <Route path="/api/:id/try-sandbox" element={<TrySandboxPage />} />
          <Route path="/login" element={<LocationWatcher />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
    });

    const loginLink = screen.getByRole('link', { name: /Đăng nhập Consumer/i });
    fireEvent.click(loginLink);

    await waitFor(() => {
      expect(capturedLocation).toBeDefined();
      expect(capturedLocation.pathname).toBe('/login');
      expect(capturedLocation.state?.from).toBe('/api/api-sandbox-1/try-sandbox');
    });
  });

  it('prevents double-click duplicate claim submissions', async () => {
    let resolveClaim!: (val: any) => void;
    const claimPromise = new Promise(resolve => {
      resolveClaim = resolve;
    });
    const claimSpy = vi.spyOn(consumerApi, 'claimSandboxGrant').mockImplementation(() => claimPromise as any);

    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
    });

    const claimBtn = screen.getByRole('button', { name: /Kích hoạt Sandbox Grant/i });
    // Click twice rapidly
    fireEvent.click(claimBtn);
    fireEvent.click(claimBtn);

    // Only 1 call dispatched
    expect(claimSpy).toHaveBeenCalledTimes(1);

    act(() => {
      resolveClaim({
        id: 'g-101',
        apiId: 'api-sandbox-1',
        maxRequests: 5,
        usedRequests: 0,
        remainingRequests: 5,
        available: true,
        expiresAt: getFutureExpiry(),
        revokedAt: null,
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/Active Grant/i)).toBeDefined();
    });
  });

  it('discards late claim response when user switches API before claim resolves', async () => {
    let resolveClaim1!: (val: any) => void;
    const claimPromise1 = new Promise(resolve => {
      resolveClaim1 = resolve;
    });

    vi.spyOn(consumerApi, 'claimSandboxGrant').mockImplementation((apiId) => {
      if (apiId === 'api-sandbox-1') return claimPromise1 as any;
      return Promise.resolve({
        id: 'g-202',
        apiId: 'api-sandbox-2',
        maxRequests: 5,
        usedRequests: 0,
        remainingRequests: 5,
        available: true,
        expiresAt: getFutureExpiry(),
        revokedAt: null,
      });
    });

    let navigateFn: any;
    const TestNavigator = () => {
      navigateFn = useNavigate();
      return null;
    };

    render(
      <MemoryRouter initialEntries={['/api/api-sandbox-1/try-sandbox']}>
        <TestNavigator />
        <Routes>
          <Route path="/api/:id/try-sandbox" element={<TrySandboxPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
    });

    // Start Claim on API 1
    const claimBtn = screen.getByRole('button', { name: /Kích hoạt Sandbox Grant/i });
    fireEvent.click(claimBtn);

    // Switch to API 2 before Claim 1 resolves
    const apiDetail2: MarketplaceApiDetail = {
      ...mockApiDetail,
      id: 'api-sandbox-2',
      name: 'Second API Sandbox',
    };
    vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockResolvedValue(apiDetail2);

    act(() => {
      navigateFn('/api/api-sandbox-2/try-sandbox');
    });

    await waitFor(() => {
      expect(screen.getAllByText('Second API Sandbox').length).toBeGreaterThan(0);
    });

    // Resolve Claim 1 late
    act(() => {
      resolveClaim1({
        id: 'g-101-stale',
        apiId: 'api-sandbox-1',
        maxRequests: 5,
        usedRequests: 0,
        remainingRequests: 5,
        available: true,
        expiresAt: getFutureExpiry(),
        revokedAt: null,
      });
    });

    // API 2 must NOT receive API 1's grant
    await new Promise(r => setTimeout(r, 50));
    expect(screen.queryByText('g-101-stale')).toBeNull();
    // It remains in unclaimed state for API 2
    expect(screen.getByText('Chưa kích hoạt Sandbox Grant')).toBeDefined();
  });

  it('transitions grant to expired state via real-time lifecycle timer', async () => {
    const grantWithQuickExpiry = {
      id: 'g-quick-expire',
      apiId: 'api-sandbox-1',
      maxRequests: 5,
      usedRequests: 1,
      remainingRequests: 4,
      available: true,
      expiresAt: new Date(Date.now() + 80).toISOString(),
      revokedAt: null,
    };
    vi.spyOn(consumerApi, 'getSandboxGrant').mockResolvedValue(grantWithQuickExpiry);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Active Grant/i)).toBeDefined();
    });

    // Wait for real-time timer (80ms) to trigger expired transition
    await waitFor(() => {
      expect(screen.getByText('Expired')).toBeDefined();
      expect(screen.getByText('Sandbox Grant đã hết hạn')).toBeDefined();
    }, { timeout: 2000 });
  });

  describe('Deferred Promise Regression Tests (Race Conditions & Generation Identity)', () => {
    const mockApiDetailB: MarketplaceApiDetail = {
      ...mockApiDetail,
      id: 'api-sandbox-2',
      name: 'Second API Sandbox',
    };

    const renderWithNavigator = (initialApiId = 'api-sandbox-1') => {
      let navigateFn: any;
      const TestNavigator = () => {
        navigateFn = useNavigate();
        return null;
      };

      const result = render(
        <MemoryRouter initialEntries={[`/api/${initialApiId}/try-sandbox`]}>
          <TestNavigator />
          <Routes>
            <Route path="/api/:id/try-sandbox" element={<TrySandboxPage />} />
          </Routes>
        </MemoryRouter>
      );

      return { ...result, navigate: (path: string) => act(() => { navigateFn(path); }) };
    };

    it('1. Claim A pending -> đổi B -> claim B pending -> A success -> B vẫn loading', async () => {
      const deferredA = createDeferred<consumerApi.SandboxGrant>();
      const deferredB = createDeferred<consumerApi.SandboxGrant>();

      const claimSpy = vi.spyOn(consumerApi, 'claimSandboxGrant').mockImplementation((apiId) => {
        if (apiId === 'api-sandbox-1') return deferredA.promise;
        if (apiId === 'api-sandbox-2') return deferredB.promise;
        return Promise.reject(new Error(`Unexpected apiId ${apiId}`));
      });

      vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockImplementation(async (id) => {
        if (id === 'api-sandbox-2') return mockApiDetailB;
        return mockApiDetail;
      });

      const { navigate } = renderWithNavigator('api-sandbox-1');

      await waitFor(() => {
        expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
      });
      await screen.findByText('Chưa kích hoạt Sandbox Grant');

      // Claim A pending
      const claimBtnA = screen.getByRole('button', { name: /Kích hoạt Sandbox Grant/i });
      fireEvent.click(claimBtnA);
      expect(claimSpy).toHaveBeenCalledWith('api-sandbox-1');
      expect(screen.getByRole('button', { name: /Đang kích hoạt.../i })).toBeDefined();

      // Switch to B
      navigate('/api/api-sandbox-2/try-sandbox');

      await waitFor(() => {
        expect(screen.getAllByText('Second API Sandbox').length).toBeGreaterThan(0);
      });
      await screen.findByText('Chưa kích hoạt Sandbox Grant');

      // Claim B pending
      const claimBtnB = screen.getByRole('button', { name: /Kích hoạt Sandbox Grant/i });
      fireEvent.click(claimBtnB);
      expect(claimSpy).toHaveBeenCalledWith('api-sandbox-2');
      expect(screen.getByRole('button', { name: /Đang kích hoạt.../i })).toBeDefined();

      // A success
      await act(async () => {
        deferredA.resolve({
          id: 'grant-a',
          apiId: 'api-sandbox-1',
          maxRequests: 5,
          usedRequests: 0,
          remainingRequests: 5,
          available: true,
          expiresAt: getFutureExpiry(),
          revokedAt: null,
        });
      });

      // B vẫn loading
      const claimingBtnB = screen.getByRole('button', { name: /Đang kích hoạt.../i });
      expect(claimingBtnB).toBeDefined();
      expect((claimingBtnB as HTMLButtonElement).disabled).toBe(true);
      expect(screen.queryByText(/Active Grant/i)).toBeNull();

      // B resolves cleanly
      await act(async () => {
        deferredB.resolve({
          id: 'grant-b',
          apiId: 'api-sandbox-2',
          maxRequests: 10,
          usedRequests: 2,
          remainingRequests: 8,
          available: true,
          expiresAt: getFutureExpiry(),
          revokedAt: null,
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/Active Grant/i)).toBeDefined();
        expect(screen.getByText('8')).toBeDefined();
      });
    });

    it('2. Claim A pending -> đổi B -> claim B pending -> A failure -> B vẫn loading, không nhận error A', async () => {
      const deferredA = createDeferred<consumerApi.SandboxGrant>();
      const deferredB = createDeferred<consumerApi.SandboxGrant>();

      vi.spyOn(consumerApi, 'claimSandboxGrant').mockImplementation((apiId) => {
        if (apiId === 'api-sandbox-1') return deferredA.promise;
        if (apiId === 'api-sandbox-2') return deferredB.promise;
        return Promise.reject(new Error(`Unexpected apiId ${apiId}`));
      });

      vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockImplementation(async (id) => {
        if (id === 'api-sandbox-2') return mockApiDetailB;
        return mockApiDetail;
      });

      const { navigate } = renderWithNavigator('api-sandbox-1');

      await waitFor(() => {
        expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
      });
      await screen.findByText('Chưa kích hoạt Sandbox Grant');

      // Claim A pending
      fireEvent.click(screen.getByRole('button', { name: /Kích hoạt Sandbox Grant/i }));
      expect(screen.getByRole('button', { name: /Đang kích hoạt.../i })).toBeDefined();

      // Switch to B
      navigate('/api/api-sandbox-2/try-sandbox');

      await waitFor(() => {
        expect(screen.getAllByText('Second API Sandbox').length).toBeGreaterThan(0);
      });
      await screen.findByText('Chưa kích hoạt Sandbox Grant');

      // Claim B pending
      fireEvent.click(screen.getByRole('button', { name: /Kích hoạt Sandbox Grant/i }));
      expect(screen.getByRole('button', { name: /Đang kích hoạt.../i })).toBeDefined();

      // A fails with 403 ApiError
      await act(async () => {
        deferredA.reject(new ApiError(403, 'FORBIDDEN', 'Chỉ tài khoản Consumer đang hoạt động mới có quyền yêu cầu Sandbox grant.'));
      });

      // B vẫn loading, không nhận error A
      const claimingBtnB = screen.getByRole('button', { name: /Đang kích hoạt.../i });
      expect(claimingBtnB).toBeDefined();
      expect((claimingBtnB as HTMLButtonElement).disabled).toBe(true);
      expect(screen.queryByText('Chỉ tài khoản Consumer đang hoạt động mới có quyền yêu cầu Sandbox grant.')).toBeNull();

      // B resolves cleanly
      await act(async () => {
        deferredB.resolve({
          id: 'grant-b-ok',
          apiId: 'api-sandbox-2',
          maxRequests: 5,
          usedRequests: 0,
          remainingRequests: 5,
          available: true,
          expiresAt: getFutureExpiry(),
          revokedAt: null,
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/Active Grant/i)).toBeDefined();
      });
    });

    it('3. B success -> A success muộn -> grant B giữ nguyên', async () => {
      const deferredA = createDeferred<consumerApi.SandboxGrant>();
      const deferredB = createDeferred<consumerApi.SandboxGrant>();

      vi.spyOn(consumerApi, 'claimSandboxGrant').mockImplementation((apiId) => {
        if (apiId === 'api-sandbox-1') return deferredA.promise;
        if (apiId === 'api-sandbox-2') return deferredB.promise;
        return Promise.reject(new Error(`Unexpected apiId ${apiId}`));
      });

      vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockImplementation(async (id) => {
        if (id === 'api-sandbox-2') return mockApiDetailB;
        return mockApiDetail;
      });

      const { navigate } = renderWithNavigator('api-sandbox-1');

      await waitFor(() => {
        expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
      });
      await screen.findByText('Chưa kích hoạt Sandbox Grant');

      // Claim A pending
      fireEvent.click(screen.getByRole('button', { name: /Kích hoạt Sandbox Grant/i }));

      // Switch to B
      navigate('/api/api-sandbox-2/try-sandbox');

      await waitFor(() => {
        expect(screen.getAllByText('Second API Sandbox').length).toBeGreaterThan(0);
      });
      await screen.findByText('Chưa kích hoạt Sandbox Grant');

      // Claim B pending
      fireEvent.click(screen.getByRole('button', { name: /Kích hoạt Sandbox Grant/i }));

      // B succeeds first with remaining=4, max=5
      await act(async () => {
        deferredB.resolve({
          id: 'grant-b-preserved',
          apiId: 'api-sandbox-2',
          maxRequests: 5,
          usedRequests: 1,
          remainingRequests: 4,
          available: true,
          expiresAt: getFutureExpiry(),
          revokedAt: null,
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/Active Grant/i)).toBeDefined();
        expect(screen.getByText('4')).toBeDefined();
      });

      // A succeeds muộn with remaining=8, max=10
      await act(async () => {
        deferredA.resolve({
          id: 'grant-a-late',
          apiId: 'api-sandbox-1',
          maxRequests: 10,
          usedRequests: 2,
          remainingRequests: 8,
          available: true,
          expiresAt: getFutureExpiry(),
          revokedAt: null,
        });
      });

      // Grant B giữ nguyên
      expect(screen.getByText(/Active Grant/i)).toBeDefined();
      expect(screen.getByText('4')).toBeDefined();
      expect(screen.queryByText('8')).toBeNull();
    });

    it('4. A -> B -> A, claim cũ không được áp dụng lên request mới dù API ID và user ID trùng', async () => {
      const deferredA1 = createDeferred<consumerApi.SandboxGrant>();
      const deferredA2 = createDeferred<consumerApi.SandboxGrant>();
      let aCallCount = 0;

      vi.spyOn(consumerApi, 'claimSandboxGrant').mockImplementation((apiId) => {
        if (apiId === 'api-sandbox-1') {
          aCallCount++;
          return aCallCount === 1 ? deferredA1.promise : deferredA2.promise;
        }
        return Promise.reject(new Error(`Unexpected apiId ${apiId}`));
      });

      vi.spyOn(marketplaceApi, 'getMarketplaceApiDetail').mockImplementation(async (id) => {
        if (id === 'api-sandbox-2') return mockApiDetailB;
        return mockApiDetail;
      });

      const { navigate } = renderWithNavigator('api-sandbox-1');

      await waitFor(() => {
        expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
      });
      await screen.findByText('Chưa kích hoạt Sandbox Grant');

      // 1. Claim A1 pending on API 1
      fireEvent.click(screen.getByRole('button', { name: /Kích hoạt Sandbox Grant/i }));
      expect(aCallCount).toBe(1);
      expect(screen.getByRole('button', { name: /Đang kích hoạt.../i })).toBeDefined();

      // 2. Switch to B
      navigate('/api/api-sandbox-2/try-sandbox');

      await waitFor(() => {
        expect(screen.getAllByText('Second API Sandbox').length).toBeGreaterThan(0);
      });
      await screen.findByText('Chưa kích hoạt Sandbox Grant');

      // 3. Switch back to A
      navigate('/api/api-sandbox-1/try-sandbox');

      await waitFor(() => {
        expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
      });
      await screen.findByText('Chưa kích hoạt Sandbox Grant');

      // 4. Claim A2 pending on API 1 (same API ID, same user ID)
      fireEvent.click(screen.getByRole('button', { name: /Kích hoạt Sandbox Grant/i }));
      expect(aCallCount).toBe(2);
      expect(screen.getByRole('button', { name: /Đang kích hoạt.../i })).toBeDefined();

      // 5. Late A1 resolves with stale remaining=8, max=10
      await act(async () => {
        deferredA1.resolve({
          id: 'grant-a1-stale',
          apiId: 'api-sandbox-1',
          maxRequests: 10,
          usedRequests: 2,
          remainingRequests: 8,
          available: true,
          expiresAt: getFutureExpiry(),
          revokedAt: null,
        });
      });

      // Old claim A1 must NOT be applied to request A2
      expect(screen.queryByText(/Active Grant/i)).toBeNull();
      expect(screen.queryByText('8')).toBeNull();
      const pendingBtn = screen.getByRole('button', { name: /Đang kích hoạt.../i });
      expect(pendingBtn).toBeDefined();
      expect((pendingBtn as HTMLButtonElement).disabled).toBe(true);

      // 6. Fresh A2 resolves with remaining=4, max=5
      await act(async () => {
        deferredA2.resolve({
          id: 'grant-a2-fresh',
          apiId: 'api-sandbox-1',
          maxRequests: 5,
          usedRequests: 1,
          remainingRequests: 4,
          available: true,
          expiresAt: getFutureExpiry(),
          revokedAt: null,
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/Active Grant/i)).toBeDefined();
        expect(screen.getByText('4')).toBeDefined();
      });
    });

    it('5. Logout/account switch khi claim pending -> stale response không được ghi đè', async () => {
      // 5a. Logout invalidation test
      const deferred1 = createDeferred<consumerApi.SandboxGrant>();
      vi.spyOn(consumerApi, 'claimSandboxGrant').mockReturnValue(deferred1.promise);

      const { unmount } = renderPage();

      await waitFor(() => {
        expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
      });

      fireEvent.click(screen.getByRole('button', { name: /Kích hoạt Sandbox Grant/i }));
      expect(screen.getByRole('button', { name: /Đang kích hoạt.../i })).toBeDefined();

      // Session invalidated (logout)
      act(() => {
        window.dispatchEvent(new Event('apihub:session-invalidated'));
      });

      // Late response arrives
      await act(async () => {
        deferred1.resolve({
          id: 'grant-stale-logout',
          apiId: 'api-sandbox-1',
          maxRequests: 5,
          usedRequests: 0,
          remainingRequests: 5,
          available: true,
          expiresAt: getFutureExpiry(),
          revokedAt: null,
        });
      });

      // Stale response must NOT be written to state
      expect(screen.queryByText(/Active Grant/i)).toBeNull();
      expect(screen.getByText('Chưa kích hoạt Sandbox Grant')).toBeDefined();

      unmount();

      // 5b. Account switch test
      const deferred2 = createDeferred<consumerApi.SandboxGrant>();
      vi.spyOn(consumerApi, 'claimSandboxGrant').mockReturnValue(deferred2.promise);

      const rerenderResult = renderPage();

      await waitFor(() => {
        expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
      });

      fireEvent.click(screen.getByRole('button', { name: /Kích hoạt Sandbox Grant/i }));
      expect(screen.getByRole('button', { name: /Đang kích hoạt.../i })).toBeDefined();

      // Switch active user
      mockCurrentUser = {
        id: 'user-consumer-2',
        email: 'consumer2@apihub.vn',
        role: 'Consumer',
      };
      rerenderResult.rerender(
        <MemoryRouter initialEntries={['/api/api-sandbox-1/try-sandbox']}>
          <Routes>
            <Route path="/api/:id/try-sandbox" element={<TrySandboxPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Late response for user-consumer-1 arrives
      await act(async () => {
        deferred2.resolve({
          id: 'grant-user-1-stale',
          apiId: 'api-sandbox-1',
          maxRequests: 5,
          usedRequests: 0,
          remainingRequests: 5,
          available: true,
          expiresAt: getFutureExpiry(),
          revokedAt: null,
        });
      });

      expect(screen.queryByText(/Active Grant/i)).toBeNull();
    });

    it('6. Double-click không tạo hai POST claims', async () => {
      const deferred = createDeferred<consumerApi.SandboxGrant>();
      const claimSpy = vi.spyOn(consumerApi, 'claimSandboxGrant').mockReturnValue(deferred.promise);

      renderPage();

      await waitFor(() => {
        expect(screen.getAllByText('Global Geocoding Sandbox API').length).toBeGreaterThan(0);
      });

      const claimBtn = screen.getByRole('button', { name: /Kích hoạt Sandbox Grant/i });

      // Rapid double click
      fireEvent.click(claimBtn);
      fireEvent.click(claimBtn);

      // Exactly 1 dispatch
      expect(claimSpy).toHaveBeenCalledTimes(1);

      // Resolve cleanly
      await act(async () => {
        deferred.resolve({
          id: 'grant-double-click-ok',
          apiId: 'api-sandbox-1',
          maxRequests: 5,
          usedRequests: 0,
          remainingRequests: 5,
          available: true,
          expiresAt: getFutureExpiry(),
          revokedAt: null,
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/Active Grant/i)).toBeDefined();
      });
    });
  });
});
