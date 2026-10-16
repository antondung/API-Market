import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MyApisInventoryPage } from '../pages/provider/MyApisInventoryPage';
import * as providerApiModule from '../services/providerApi';
import * as AuthContextModule from '../context/AuthContext';
import type { ProviderApi, ProviderVerification } from '../services/providerTypes';
import type { User } from '../types';

describe('MyApisInventoryPage component tests', () => {
  const mockUser: User = {
    id: 'user-1',
    email: 'prov@example.com',
    name: 'Provider User',
    role: 'API_PROVIDER',
    status: 'Active',
    createdAt: '',
    lastLoginAt: '',
    twoFactorEnabled: false,
    quotaUsedPercent: 0,
  };
  const mockApis: ProviderApi[] = [
    {
      id: 'api-1',
      providerId: 'prov-1',
      name: 'Translation API',
      description: 'Multi-language neural translation',
      category: 'Translation & NLP',
      baseUrl: 'https://trans.example.com',
      status: 'Draft',
      tags: ['nlp', 'translation'],
      createdAt: '2026-10-10T00:00:00Z',
      updatedAt: '2026-10-10T00:00:00Z',
    },
    {
      id: 'api-2',
      providerId: 'prov-1',
      name: 'Weather Forecast API',
      description: 'Global radar map',
      category: 'Weather & Geo',
      baseUrl: 'https://weather.example.com',
      status: 'Published',
      tags: ['weather'],
      createdAt: '2026-10-11T00:00:00Z',
      updatedAt: '2026-10-11T00:00:00Z',
    },
  ];

  const mockVerified: ProviderVerification = {
    providerId: 'prov-1',
    legalName: 'Global Tech',
    businessRegNumber: '1122334455',
    taxCode: '9988776655',
    contactEmail: 'tech@global.com',
    contactPhone: '+84901234567',
    registeredAddress: '123 Tech Park',
    status: 'Verified',
    submittedAt: '2026-10-01T00:00:00Z',
    reviewedAt: '2026-10-02T00:00:00Z',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: mockUser,
      user: mockUser,
      isAuthenticated: true,
      sessionReady: true,
      sessionError: null,
      backendOnline: true,
      checkBackendConnection: vi.fn(),
      retrySession: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    } as any);
  });

  it('renders API list and status badges', async () => {
    vi.spyOn(providerApiModule, 'listProviderApis').mockResolvedValue({
      items: mockApis,
      total: 2,
      page: 1,
      pageSize: 10,
    });
    vi.spyOn(providerApiModule, 'getProviderVerification').mockResolvedValue(mockVerified);

    render(
      <MemoryRouter>
        <MyApisInventoryPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Translation API')).toBeDefined();
      expect(screen.getByText('Weather Forecast API')).toBeDefined();
    });

    expect(screen.getByText('Multi-language neural translation')).toBeDefined();
    expect(screen.getByText('Draft')).toBeDefined();
    expect(screen.getByText('Published')).toBeDefined();
  });

  it('blocks unverified provider from creating API and shows prompt modal', async () => {
    vi.spyOn(providerApiModule, 'listProviderApis').mockResolvedValue({
      items: mockApis,
      total: 2,
      page: 1,
      pageSize: 10,
    });
    vi.spyOn(providerApiModule, 'getProviderVerification').mockResolvedValue({
      ...mockVerified,
      status: 'Draft',
    });

    render(
      <MemoryRouter>
        <MyApisInventoryPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Translation API')).toBeDefined();
    });

    const createBtn = screen.getByRole('button', { name: /(Create New API|Tạo API Mới)/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByText(/Yêu cầu Xác minh Danh tính/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /Xác minh ngay/i })).toBeDefined();
    });
  });

  it('creates new API for verified provider with valid inputs', async () => {
    vi.spyOn(providerApiModule, 'listProviderApis').mockResolvedValue({
      items: mockApis,
      total: 2,
      page: 1,
      pageSize: 10,
    });
    vi.spyOn(providerApiModule, 'getProviderVerification').mockResolvedValue(mockVerified);

    const createSpy = vi.spyOn(providerApiModule, 'createProviderApi').mockResolvedValue({
      id: 'api-3',
      providerId: 'prov-1',
      name: 'Payment Sandbox API',
      description: 'Fintech checkout',
      category: 'Finance & Banking',
      baseUrl: 'https://pay.example.com',
      status: 'Draft',
      tags: ['fintech'],
      createdAt: '2026-10-16T00:00:00Z',
      updatedAt: '2026-10-16T00:00:00Z',
    });

    render(
      <MemoryRouter>
        <MyApisInventoryPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Translation API')).toBeDefined();
    });

    const createBtn = screen.getByRole('button', { name: /(Create New API|Tạo API Mới)/i });
    fireEvent.click(createBtn);

    expect(screen.getByText(/Tạo sản phẩm API mới/i)).toBeDefined();

    const nameInput = screen.getByPlaceholderText(/VD: Realtime Currency Rates API/i);
    const descInput = screen.getByPlaceholderText(/Mô tả chức năng, nguồn dữ liệu/i);
    const urlInput = screen.getByPlaceholderText(/https:\/\/api\.example\.com\/v1/i);

    fireEvent.change(nameInput, { target: { value: 'Payment Sandbox API' } });
    fireEvent.change(descInput, { target: { value: 'Fintech checkout' } });
    fireEvent.change(urlInput, { target: { value: 'https://pay.example.com' } });

    const submitBtn = screen.getByRole('button', { name: /^Tạo API$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith({
        name: 'Payment Sandbox API',
        description: 'Fintech checkout',
        category: 'Machine Learning & AI',
        baseUrl: 'https://pay.example.com',
        tags: [],
      });
      expect(screen.getByText('Payment Sandbox API')).toBeDefined();
    });
  });

  it('deletes Draft API after confirmation modal', async () => {
    vi.spyOn(providerApiModule, 'listProviderApis').mockResolvedValue({
      items: mockApis,
      total: 2,
      page: 1,
      pageSize: 10,
    });
    vi.spyOn(providerApiModule, 'getProviderVerification').mockResolvedValue(mockVerified);
    const deleteSpy = vi.spyOn(providerApiModule, 'deleteProviderApi').mockResolvedValue();

    render(
      <MemoryRouter>
        <MyApisInventoryPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Translation API')).toBeDefined();
    });

    const deleteBtn = screen.getByTitle('Xóa API này');
    fireEvent.click(deleteBtn);

    expect(screen.getByText('Xác nhận xóa API')).toBeDefined();

    const confirmDeleteBtn = screen.getByRole('button', { name: /Xác nhận xóa/i });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith('api-1');
      expect(screen.queryByText('Translation API')).toBeNull();
    });
  });
});
