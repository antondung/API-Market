import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UsageQuotaPage } from './UsageQuotaPage';
import { RequestHistoryPage } from './RequestHistoryPage';
import * as usageApi from '../../services/usageApi';

let mockCurrentUser: { id: string; email: string; name: string; role: string } | null = {
  id: 'usr_admin_1',
  email: 'admin@example.com',
  name: 'Admin',
  role: 'ADMIN',
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser,
    isAuthenticated: true,
  }),
  useOptionalAuth: () => ({
    currentUser: mockCurrentUser,
    isAuthenticated: true,
  }),
}));

vi.mock('../../i18n', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

describe('Consumer usage pages role guard', () => {
  beforeEach(() => {
    mockCurrentUser = {
      id: 'usr_admin_1',
      email: 'admin@example.com',
      name: 'Admin',
      role: 'ADMIN',
    };
    vi.restoreAllMocks();
  });

  it('does not load usage for an admin account', () => {
    const summary = vi.spyOn(usageApi, 'getConsumerUsageSummary').mockResolvedValue({
      subscriptions: [],
      daily: [],
    });

    render(
      <MemoryRouter>
        <UsageQuotaPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('consumer-role-guard')).toBeDefined();
    expect(summary).not.toHaveBeenCalled();
  });

  it('does not load request history for an admin account', () => {
    const history = vi.spyOn(usageApi, 'getConsumerUsageHistory').mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });

    render(
      <MemoryRouter>
        <RequestHistoryPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('consumer-role-guard')).toBeDefined();
    expect(history).not.toHaveBeenCalled();
  });

  it('still loads usage for a provider using the consumer workspace', async () => {
    mockCurrentUser = {
      id: 'usr_provider_2',
      email: 'provider@example.com',
      name: 'Provider',
      role: 'API_PROVIDER',
    };
    vi.spyOn(usageApi, 'getConsumerUsageSummary').mockResolvedValue({
      subscriptions: [],
      daily: [],
    });

    render(
      <MemoryRouter>
        <UsageQuotaPage />
      </MemoryRouter>
    );

    expect(await screen.findByTestId('usage-empty')).toBeDefined();
    expect(screen.queryByTestId('consumer-role-guard')).toBeNull();
  });
});
