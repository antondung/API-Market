import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProviderDashboardPage } from './ProviderDashboardPage';
import * as providerApi from '../../services/providerApi';
import * as usageApi from '../../services/usageApi';
import { ApiError } from '../../services/authApi';
import type { ProviderAnalyticsOverview } from '../../services/sprint4Types';

let mockCurrentUser: { id: string; email: string; name: string; role: string } | null = {
  id: 'usr_provider_10',
  email: 'provider@example.com',
  name: 'Telecom Provider',
  role: 'API_PROVIDER',
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser,
    isAuthenticated: true,
  }),
}));

vi.mock('../../i18n', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

describe('ProviderDashboardPage - AC-05 Provider Analytics & Multi-Currency', () => {
  const mockVerification = {
    providerId: 'prv_10',
    organizationName: 'Viettel Telecom',
    status: 'Verified',
  };

  const mockApis = {
    items: [
      {
        id: 'api_sms_1',
        providerId: 'prv_10',
        name: 'SMS Brandname Gateway',
        category: 'Telecommunications',
        status: 'Published',
      },
    ],
    total: 1,
    page: 1,
    pageSize: 5,
  };

  const mockAnalytics: ProviderAnalyticsOverview = {
    requests: {
      requestCount: '15000',
      successCount: '14250',
      errorCount: '750',
      averageLatencyMs: 45.2,
    },
    daily: [
      { date: '2026-11-01', requestCount: '5000' },
      { date: '2026-11-02', requestCount: '10000' },
    ],
    revenue: [
      { currency: 'VND', amount: '25000000' },
      { currency: 'USD', amount: '150.50' },
    ],
    activeSubscribers: '42',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(providerApi, 'getProviderVerification').mockResolvedValue(mockVerification as any);
    vi.spyOn(providerApi, 'listProviderApis').mockResolvedValue(mockApis as any);
    vi.spyOn(usageApi, 'getProviderAnalyticsOverview').mockResolvedValue(mockAnalytics);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders verified provider header and KPI metrics accurately', async () => {
    render(
      <MemoryRouter>
        <ProviderDashboardPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Viettel Telecom')).toBeDefined();
    expect(screen.getByText('SMS Brandname Gateway')).toBeDefined();

    // Total requests formatted with thousand separators
    expect(await screen.findByText('15.000')).toBeDefined();

    // Success rate: 14250/15000 = 95.0%
    expect(screen.getByText('95.0%')).toBeDefined();
    // Error rate: 750/15000 = 5.0%
    expect(screen.getByText('5.0%')).toBeDefined();

    // Active subscribers
    expect(screen.getByText('42')).toBeDefined();

    // Average latency
    expect(screen.getByText('45 ms')).toBeDefined();
  });

  it('displays multi-currency revenue in separated chips without summing VND and USD', async () => {
    render(
      <MemoryRouter>
        <ProviderDashboardPage />
      </MemoryRouter>
    );

    // Formatted VND amount with Vietnamese thousand separators
    expect(await screen.findByText('25.000.000 VND')).toBeDefined();
    // Formatted USD amount with decimals
    expect(screen.getByText('150,5 USD')).toBeDefined();
  });

  it('renders honest zero revenue when analytics returns empty revenue array', async () => {
    vi.spyOn(usageApi, 'getProviderAnalyticsOverview').mockResolvedValueOnce({
      ...mockAnalytics,
      revenue: [],
    });

    render(
      <MemoryRouter>
        <ProviderDashboardPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('0 VND')).toBeDefined();
  });

  it('renders daily traffic breakdown table with formatted dates and request counts', async () => {
    render(
      <MemoryRouter>
        <ProviderDashboardPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('2026-11-01')).toBeDefined();
    expect(screen.getByText('5.000')).toBeDefined();
    expect(screen.getByText('2026-11-02')).toBeDefined();
    expect(screen.getByText('10.000')).toBeDefined();
  });

  it('renders honest empty state when daily traffic array is empty', async () => {
    vi.spyOn(usageApi, 'getProviderAnalyticsOverview').mockResolvedValueOnce({
      ...mockAnalytics,
      daily: [],
    });

    render(
      <MemoryRouter>
        <ProviderDashboardPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Chưa có dữ liệu lưu lượng theo ngày')).toBeDefined();
  });

  it('differentiates analytics network loading error from normal state with retry button', async () => {
    let callCount = 0;
    vi.spyOn(usageApi, 'getProviderAnalyticsOverview').mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        throw new ApiError(500, 'FAIL', 'Provider analytics telemetry timeout');
      }
      return mockAnalytics;
    });

    render(
      <MemoryRouter>
        <ProviderDashboardPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Provider analytics telemetry timeout')).toBeDefined();
    expect(screen.getByText('Không thể tải dữ liệu phân tích lưu lượng')).toBeDefined();

    // Click retry
    const retryButtons = screen.getAllByRole('button', { name: /Thử lại/i });
    fireEvent.click(retryButtons[0]);

    // After retry succeeds, shows real data
    expect(await screen.findByText('15.000')).toBeDefined();
    expect(screen.getByText('25.000.000 VND')).toBeDefined();
  });
});
