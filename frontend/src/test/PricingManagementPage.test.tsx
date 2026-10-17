import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PricingManagementPage } from '../pages/provider/PricingManagementPage';
import * as providerApiModule from '../services/providerApi';
import type {
  ProviderApi,
  ProviderPlan,
} from '../services/providerTypes';

describe('PricingManagementPage component tests', () => {
  const mockApis: ProviderApi[] = [
    {
      id: 'api-1',
      providerId: 'prov-1',
      name: 'SMS OTP Gateway',
      description: 'High-speed SMS delivery',
      category: 'Telecom',
      baseUrl: 'https://sms.example.com',
      status: 'Approved',
      tags: ['sms', 'otp'],
      createdAt: '2026-10-10T00:00:00Z',
      updatedAt: '2026-10-10T00:00:00Z',
    },
  ];

  const mockPlans: ProviderPlan[] = [
    {
      id: 'plan-free',
      apiId: 'api-1',
      name: 'Free',
      priceMonthly: 0,
      currency: 'USD',
      quota: 1000,
      rateLimit: 5,
      createdAt: '2026-10-10T01:00:00Z',
    },
    {
      id: 'plan-basic',
      apiId: 'api-1',
      name: 'Basic',
      priceMonthly: 49,
      currency: 'USD',
      quota: 50000,
      rateLimit: 25,
      createdAt: '2026-10-10T01:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading skeleton and shows existing plans for selected API', async () => {
    vi.spyOn(providerApiModule, 'listProviderApis').mockResolvedValue({
      items: mockApis,
      total: 1,
      page: 1,
      pageSize: 100,
    });
    vi.spyOn(providerApiModule, 'listProviderPlans').mockResolvedValue(mockPlans);

    render(
      <MemoryRouter initialEntries={['/provider/pricing?api=api-1']}>
        <PricingManagementPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Loading pricing page/i)).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('SMS OTP Gateway')).toBeDefined();
      expect(screen.getByText(/Quản lý Gói cước & Bảng giá|Pricing Plan Management/i)).toBeDefined();
    });

    // Check rendered plans
    expect(screen.getByText(/Gói Free/i)).toBeDefined();
    expect(screen.getByText(/Miễn phí/i)).toBeDefined();
    expect(screen.getByText(/1[.,]000 lượt\/tháng/i)).toBeDefined();
    expect(screen.getByText(/^5 RPS$/)).toBeDefined();

    expect(screen.getByText(/Gói Basic/i)).toBeDefined();
    expect(screen.getByText(/USD 49/i)).toBeDefined();
    expect(screen.getByText(/50[.,]000 lượt\/tháng/i)).toBeDefined();
    expect(screen.getByText(/^25 RPS$/)).toBeDefined();
  });

  it('enforces Free plan must have price 0 and creates Pro plan', async () => {
    vi.spyOn(providerApiModule, 'listProviderApis').mockResolvedValue({
      items: mockApis,
      total: 1,
      page: 1,
      pageSize: 100,
    });
    vi.spyOn(providerApiModule, 'listProviderPlans').mockResolvedValue(mockPlans);

    const createPlanSpy = vi.spyOn(providerApiModule, 'createProviderPlan').mockResolvedValue({
      id: 'plan-pro',
      apiId: 'api-1',
      name: 'Pro',
      priceMonthly: 199,
      currency: 'USD',
      quota: 200000,
      rateLimit: 100,
      createdAt: '2026-10-16T00:00:00Z',
    });

    render(
      <MemoryRouter initialEntries={['/provider/pricing?api=api-1']}>
        <PricingManagementPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('SMS OTP Gateway')).toBeDefined();
    });

    const addTierBtn = screen.getByRole('button', { name: /(Thêm gói cước mới|Add Pricing Tier)/i });
    fireEvent.click(addTierBtn);

    expect(screen.getByText('Thêm Gói Cước Mới')).toBeDefined();

    // Select Free tier: price input should be disabled and 0
    const tierSelect = screen.getByDisplayValue('Basic') as HTMLSelectElement;
    fireEvent.change(tierSelect, { target: { value: 'Free' } });

    const priceInput = screen.getByPlaceholderText('49') as HTMLInputElement;
    expect(priceInput.value).toBe('0');
    expect(priceInput.hasAttribute('disabled')).toBe(true);

    // Switch to Pro tier
    fireEvent.change(tierSelect, { target: { value: 'Pro' } });
    expect(priceInput.hasAttribute('disabled')).toBe(false);

    fireEvent.change(priceInput, { target: { value: '199' } });
    const quotaInput = screen.getByPlaceholderText('25000');
    const rateLimitInput = screen.getByPlaceholderText('25');

    fireEvent.change(quotaInput, { target: { value: '200000' } });
    fireEvent.change(rateLimitInput, { target: { value: '100' } });

    const submitBtn = screen.getByRole('button', { name: /Tạo gói cước/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(createPlanSpy).toHaveBeenCalledWith('api-1', {
        name: 'Pro',
        priceMonthly: 199,
        currency: 'USD',
        quota: 200000,
        rateLimit: 100,
      });
      expect(screen.getByText('Gói Pro')).toBeDefined();
      expect(screen.getByText(/USD 199/i)).toBeDefined();
    });
  });

  it('deletes plan when confirmed in modal', async () => {
    vi.spyOn(providerApiModule, 'listProviderApis').mockResolvedValue({
      items: mockApis,
      total: 1,
      page: 1,
      pageSize: 100,
    });
    vi.spyOn(providerApiModule, 'listProviderPlans').mockResolvedValue(mockPlans);
    const deletePlanSpy = vi.spyOn(providerApiModule, 'deleteProviderPlan').mockResolvedValue();

    render(
      <MemoryRouter initialEntries={['/provider/pricing?api=api-1']}>
        <PricingManagementPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Gói Free')).toBeDefined();
      expect(screen.getByText('Gói Basic')).toBeDefined();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /Xóa/i });
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Xác nhận xóa gói cước')).toBeDefined();

    const confirmBtn = screen.getByRole('button', { name: /Xác nhận xóa/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(deletePlanSpy).toHaveBeenCalledWith('api-1', 'plan-free');
      expect(screen.queryByText('Gói Free')).toBeNull();
      expect(screen.getByText('Gói Basic')).toBeDefined();
    });
  });
});
