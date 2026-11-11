import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnalyticsHealthPage } from './AnalyticsHealthPage';
import * as usageApi from '../../services/usageApi';
import * as providerApi from '../../services/providerApi';
import * as AuthContextModule from '../../context/AuthContext';
import { AppProvider } from '../../context/AppContext';
import type { ProviderAnalyticsOverview } from '../../services/sprint4Types';
import type { ProviderEndpoint } from '../../services/providerTypes';

vi.mock('../../i18n', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock('../../services/usageApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/usageApi')>();
  return {
    ...actual,
    getProviderAnalyticsOverview: vi.fn(),
  };
});

vi.mock('../../services/providerApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/providerApi')>();
  return {
    ...actual,
    listProviderApis: vi.fn(),
    listProviderEndpoints: vi.fn(),
  };
});

const mockProviderUser = {
  id: 'provider-user-1',
  email: 'provider@example.com',
  name: 'Test Provider',
  role: 'Provider' as const,
};

const mockAnalyticsActive: ProviderAnalyticsOverview = {
  requests: {
    requestCount: '5000',
    successCount: '4950',
    errorCount: '50',
    clientErrorCount: '40',
    serverErrorCount: '10',
    errorRatePercent: 1.0,
    averageLatencyMs: 34.2,
    p50LatencyMs: 18,
    p95LatencyMs: 42,
    p99LatencyMs: 85,
    p50OverheadMs: 3,
    p95OverheadMs: 8,
    p99OverheadMs: 15,
  },
  daily: [
    { date: '2026-11-03', requestCount: '2400' },
    { date: '2026-11-04', requestCount: '2600' },
  ],
  revenue: [
    { currency: 'USD', amount: '250.00' },
    { currency: 'VND', amount: '5000000' },
  ],
  activeSubscribers: '12',
  topEndpoints: [
    {
      apiId: '1',
      apiName: 'Weather API',
      endpointId: '10',
      method: 'GET',
      path: '/v1/forecast',
      requestCount: '3000',
      errorCount: '15',
      errorRatePercent: 0.5,
      p50LatencyMs: 15,
      p95LatencyMs: 35,
      p99LatencyMs: 70,
    },
  ],
  apiBreakdown: [
    {
      apiId: '1',
      apiName: 'Weather API',
      requestCount: '5000',
      errorCount: '50',
      errorRatePercent: 1.0,
      p50LatencyMs: 18,
      p95LatencyMs: 42,
    },
  ],
};

const mockAnalyticsNullQuantiles: ProviderAnalyticsOverview = {
  requests: {
    requestCount: '100',
    successCount: '100',
    errorCount: '0',
    clientErrorCount: '0',
    serverErrorCount: '0',
    errorRatePercent: 0,
    averageLatencyMs: 0,
    p50LatencyMs: null,
    p95LatencyMs: null,
    p99LatencyMs: null,
    p50OverheadMs: null,
    p95OverheadMs: null,
    p99OverheadMs: null,
  },
  daily: [{ date: '2026-11-04', requestCount: '100' }],
  revenue: [],
  activeSubscribers: '1',
  topEndpoints: [],
  apiBreakdown: [],
};

describe('AnalyticsHealthPage - Honest Telemetry, Real API, & Filters (US-31)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContextModule, 'useOptionalAuth').mockReturnValue({
      currentUser: mockProviderUser,
    } as unknown as AuthContextModule.AuthContextType);

    vi.mocked(providerApi.listProviderApis).mockResolvedValue({
      items: [
        {
          id: '1',
          name: 'Weather API',
          description: '',
          category: 'Weather',
          baseUrl: 'https://api.weather.com',
          tags: [],
          status: 'Published',
          providerId: 'provider-user-1',
          createdAt: '',
          updatedAt: '',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 100,
    });

    vi.mocked(providerApi.listProviderEndpoints).mockResolvedValue([
      {
        id: '10',
        apiId: '1',
        versionId: 'v1',
        method: 'GET',
        path: '/v1/forecast',
        description: 'Get weather forecast',
        parameters: [],
      },
    ]);
  });

  it('does NOT display fabricated measured latencies or regional claims', async () => {
    vi.mocked(usageApi.getProviderAnalyticsOverview).mockResolvedValue(mockAnalyticsNullQuantiles);

    render(
      <AppProvider>
        <AnalyticsHealthPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('analytics-skeleton')).toBeNull();
    });

    // Should indicate no real quantile data instead of hardcoded numbers
    const noDataBadges = screen.getAllByText('Chưa có dữ liệu thực');
    expect(noDataBadges.length).toBeGreaterThanOrEqual(3);

    // Target SLA indicators must be present (P50, P95, P99; P90 removed)
    expect(screen.getByText('Target SLA: < 20 ms')).toBeDefined();
    expect(screen.getByText('Target SLA: < 50 ms')).toBeDefined();
    expect(screen.getByText('Target SLA: < 100 ms')).toBeDefined();
    expect(screen.queryByText(/P90/i)).toBeNull();

    // Fabricated measured strings must NOT appear
    expect(screen.queryByText('Measured latency')).toBeNull();
    expect(screen.queryByText('Measured ceiling')).toBeNull();
    expect(screen.queryByText(/Gateway Overhead: 1\.8ms/i)).toBeNull();
    expect(screen.getByText(/Mục tiêu SLA — Chưa có dữ liệu thực/i)).toBeDefined();
  });

  it('renders loading skeleton and then renders real analytics overview with KPI cards and chart', async () => {
    vi.mocked(usageApi.getProviderAnalyticsOverview).mockResolvedValue(mockAnalyticsActive);

    render(
      <AppProvider>
        <AnalyticsHealthPage />
      </AppProvider>
    );

    // Initial skeleton
    expect(screen.getByTestId('analytics-skeleton')).toBeDefined();

    // After load
    await waitFor(() => {
      expect(screen.queryByTestId('analytics-skeleton')).toBeNull();
    });

    // KPI Cards
    expect(screen.getAllByText('5.000').length).toBeGreaterThanOrEqual(1); // Total requests
    expect(screen.getByText('1.00%')).toBeDefined(); // Error rate
    expect(screen.getByText('34.2 ms')).toBeDefined(); // Average latency
    expect(screen.getByText('12')).toBeDefined(); // Active subscribers

    // Daily Chart
    expect(screen.getByTestId('daily-request-chart')).toBeDefined();
  });

  it('renders real quantiles in ms when provided by backend', async () => {
    vi.mocked(usageApi.getProviderAnalyticsOverview).mockResolvedValue(mockAnalyticsActive);

    render(
      <AppProvider>
        <AnalyticsHealthPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('analytics-skeleton')).toBeNull();
    });

    // Real quantiles
    expect(screen.getByText('18 ms')).toBeDefined(); // P50
    expect(screen.getByText('42 ms')).toBeDefined(); // P95
    expect(screen.getByText('85 ms')).toBeDefined(); // P99
  });

  it('renders top 10 endpoints table with method, path, and metrics', async () => {
    vi.mocked(usageApi.getProviderAnalyticsOverview).mockResolvedValue(mockAnalyticsActive);

    render(
      <AppProvider>
        <AnalyticsHealthPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('analytics-skeleton')).toBeNull();
    });

    expect(screen.getByText('/v1/forecast')).toBeDefined();
    expect(screen.getByText('3.000')).toBeDefined();
    expect(screen.getByText('15ms')).toBeDefined();
    expect(screen.getByText('35ms')).toBeDefined();
  });

  it('separates multi-currency revenue (VND and USD) without mixing', async () => {
    vi.mocked(usageApi.getProviderAnalyticsOverview).mockResolvedValue(mockAnalyticsActive);

    render(
      <AppProvider>
        <AnalyticsHealthPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('analytics-skeleton')).toBeNull();
    });

    // Both currencies rendered cleanly
    expect(screen.getByText('USD')).toBeDefined();
    expect(screen.getByText('250 USD')).toBeDefined();
    expect(screen.getByText('VND')).toBeDefined();
    expect(screen.getByText('5.000.000 VND')).toBeDefined();
  });

  it('validates date range filter and sends query params on filter apply', async () => {
    vi.mocked(usageApi.getProviderAnalyticsOverview).mockResolvedValue(mockAnalyticsActive);

    render(
      <AppProvider>
        <AnalyticsHealthPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('analytics-skeleton')).toBeNull();
    });

    const fromInput = screen.getByLabelText(/Từ ngày \(UTC\)/i);
    const toInput = screen.getByLabelText(/Đến ngày \(UTC\)/i);
    const form = screen.getByTestId('analytics-filter-form');

    // Inverted date range
    fireEvent.change(fromInput, { target: { value: '2026-11-10' } });
    fireEvent.change(toInput, { target: { value: '2026-11-01' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Ngày bắt đầu không được lớn hơn ngày kết thúc.')).toBeDefined();
    });

    // Valid date range & apply
    fireEvent.change(fromInput, { target: { value: '2026-11-01' } });
    fireEvent.change(toInput, { target: { value: '2026-11-10' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(usageApi.getProviderAnalyticsOverview).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '2026-11-01',
          to: '2026-11-10',
        }),
        expect.any(AbortSignal)
      );
    });
  });

  it('renders error state and handles Retry', async () => {
    vi.mocked(usageApi.getProviderAnalyticsOverview).mockRejectedValue(new Error('Connection failure'));

    render(
      <AppProvider>
        <AnalyticsHealthPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Connection failure')).toBeDefined();
    });

    // Mock success on retry
    vi.mocked(usageApi.getProviderAnalyticsOverview).mockResolvedValue(mockAnalyticsActive);
    const retryBtn = screen.getByRole('button', { name: /Thử lại/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getAllByText('5.000').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('enforces account isolation when switching user or logging out', async () => {
    vi.mocked(usageApi.getProviderAnalyticsOverview).mockResolvedValue(mockAnalyticsActive);

    const { rerender } = render(
      <AppProvider>
        <AnalyticsHealthPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('5.000').length).toBeGreaterThanOrEqual(1);
    });

    // Simulate logout: currentUser becomes undefined
    vi.spyOn(AuthContextModule, 'useOptionalAuth').mockReturnValue({
      currentUser: undefined,
    } as unknown as AuthContextModule.AuthContextType);

    rerender(
      <AppProvider>
        <AnalyticsHealthPage />
      </AppProvider>
    );

    await waitFor(() => {
      // Previous user's 5.000 requests metric should no longer be displayed
      expect(screen.queryByText('5.000')).toBeNull();
    });
  });

  it('discards late out-of-order analytics responses when queries change rapidly', async () => {
    let resolveFirstQuery: ((val: ProviderAnalyticsOverview) => void) | null = null;
    let resolveSecondQuery: ((val: ProviderAnalyticsOverview) => void) | null = null;

    const query1Response: ProviderAnalyticsOverview = {
      ...mockAnalyticsActive,
      requests: { ...mockAnalyticsActive.requests, requestCount: '1111' },
    };
    const query2Response: ProviderAnalyticsOverview = {
      ...mockAnalyticsActive,
      requests: { ...mockAnalyticsActive.requests, requestCount: '2222' },
    };

    let callCount = 0;
    vi.mocked(usageApi.getProviderAnalyticsOverview).mockImplementation((_query, signal) => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(mockAnalyticsActive);
      }
      if (callCount === 2) {
        return new Promise((resolve, reject) => {
          resolveFirstQuery = resolve;
          signal?.addEventListener('abort', () => reject(new Error('Aborted')));
        });
      }
      if (callCount === 3) {
        return new Promise((resolve, reject) => {
          resolveSecondQuery = resolve;
          signal?.addEventListener('abort', () => reject(new Error('Aborted')));
        });
      }
      return Promise.resolve(mockAnalyticsActive);
    });

    render(
      <AppProvider>
        <AnalyticsHealthPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('analytics-skeleton')).toBeNull();
    });

    const fromInput = screen.getByLabelText(/Từ ngày \(UTC\)/i);
    const toInput = screen.getByLabelText(/Đến ngày \(UTC\)/i);
    const form = screen.getByTestId('analytics-filter-form');

    // Submit Query 1
    fireEvent.change(fromInput, { target: { value: '2026-11-01' } });
    fireEvent.change(toInput, { target: { value: '2026-11-05' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(callCount).toBe(2);
    });

    // Submit Query 2 while Query 1 is still pending
    fireEvent.change(fromInput, { target: { value: '2026-11-06' } });
    fireEvent.change(toInput, { target: { value: '2026-11-10' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(callCount).toBe(3);
    });

    // Resolve Query 2 first
    if (resolveSecondQuery) {
      (resolveSecondQuery as (val: ProviderAnalyticsOverview) => void)(query2Response);
    }

    await waitFor(() => {
      expect(screen.getByText('2.222')).toBeDefined();
    });

    // Now resolve Query 1 late
    if (resolveFirstQuery) {
      try {
        (resolveFirstQuery as (val: ProviderAnalyticsOverview) => void)(query1Response);
      } catch {
        // Ignored if aborted
      }
    }

    // Must still show Query 2's data (2.222), NOT Query 1's data (1.111)
    await waitFor(() => {
      expect(screen.getByText('2.222')).toBeDefined();
      expect(screen.queryByText('1.111')).toBeNull();
    });
  });

  it('resets endpoints and filters when switching API and prevents stale endpoint responses', async () => {
    vi.mocked(providerApi.listProviderApis).mockResolvedValue({
      items: [
        {
          id: '1',
          name: 'Weather API',
          description: '',
          category: 'Weather',
          baseUrl: 'https://api.weather.com',
          tags: [],
          status: 'Published',
          providerId: 'provider-user-1',
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '2',
          name: 'Payment API',
          description: '',
          category: 'Finance',
          baseUrl: 'https://api.pay.com',
          tags: [],
          status: 'Published',
          providerId: 'provider-user-1',
          createdAt: '',
          updatedAt: '',
        },
      ],
      total: 2,
      page: 1,
      pageSize: 100,
    });

    vi.mocked(usageApi.getProviderAnalyticsOverview).mockResolvedValue(mockAnalyticsActive);

    let resolveApi1Endpoints: ((val: ProviderEndpoint[]) => void) | null = null;
    vi.mocked(providerApi.listProviderEndpoints).mockImplementation((apiId, signal) => {
      if (apiId === '1') {
        return new Promise((resolve, reject) => {
          resolveApi1Endpoints = resolve;
          signal?.addEventListener('abort', () => reject(new Error('Aborted')));
        });
      }
      return Promise.resolve([
        {
          id: '20',
          apiId: '2',
          versionId: 'v1',
          method: 'POST',
          path: '/v1/charge',
          description: '',
          parameters: [],
        },
      ]);
    });

    render(
      <AppProvider>
        <AnalyticsHealthPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('analytics-skeleton')).toBeNull();
    });

    const apiSelect = screen.getByLabelText(/Lọc theo API/i);
    // Select API 1
    fireEvent.change(apiSelect, { target: { value: '1' } });

    // Switch to API 2 before API 1 resolves
    fireEvent.change(apiSelect, { target: { value: '2' } });

    // Endpoint for API 2 should appear
    await waitFor(() => {
      expect(screen.getByText('POST /v1/charge')).toBeDefined();
    });

    // Resolve API 1 late
    if (resolveApi1Endpoints) {
      try {
        (resolveApi1Endpoints as (val: unknown) => void)([
          {
            id: '10',
            apiId: '1',
            versionId: 'v1',
            method: 'GET',
            path: '/v1/stale-forecast',
            description: '',
            parameters: [],
          },
        ]);
      } catch {
        // Aborted
      }
    }

    // Stale endpoint for API 1 must NOT appear
    expect(screen.queryByText('GET /v1/stale-forecast')).toBeNull();
  });

  it('prevents previous account in-flight response from leaking to new account (Account A -> B)', async () => {
    let resolveUserARequest: ((val: ProviderAnalyticsOverview) => void) | null = null;

    vi.mocked(usageApi.getProviderAnalyticsOverview).mockImplementation((_query, signal) => {
      return new Promise((resolve, reject) => {
        resolveUserARequest = resolve;
        signal?.addEventListener('abort', () => reject(new Error('Aborted')));
      });
    });

    const { rerender } = render(
      <AppProvider>
        <AnalyticsHealthPage />
      </AppProvider>
    );

    // Initial render shows skeleton while User A request is in-flight
    expect(screen.getByTestId('analytics-skeleton')).toBeDefined();

    // Switch to User B (or logout) before User A request completes
    vi.spyOn(AuthContextModule, 'useOptionalAuth').mockReturnValue({
      currentUser: {
        id: 'provider-user-2',
        email: 'provider2@example.com',
        name: 'Provider Two',
        role: 'Provider' as const,
      },
    } as unknown as AuthContextModule.AuthContextType);

    rerender(
      <AppProvider>
        <AnalyticsHealthPage />
      </AppProvider>
    );

    // Resolve User A request late
    if (resolveUserARequest) {
      try {
        (resolveUserARequest as (val: ProviderAnalyticsOverview) => void)(mockAnalyticsActive);
      } catch {
        // Aborted
      }
    }

    // Should not show User A's data
    await waitFor(() => {
      expect(screen.queryByText('1.00%')).toBeNull();
    });
  });
});
