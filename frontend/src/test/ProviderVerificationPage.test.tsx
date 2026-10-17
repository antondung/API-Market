import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ProviderVerificationPage } from '../pages/provider/ProviderVerificationPage';
import * as providerApiModule from '../services/providerApi';
import * as AuthContextModule from '../context/AuthContext';
import { ApiError } from '../services/authApi';
import type { User } from '../types';
import type { ProviderVerification } from '../services/providerTypes';

describe('ProviderVerificationPage component tests', () => {
  const mockProviderUser: User = {
    id: 'prov-user-1',
    email: 'provider@company.com',
    name: 'Tech Provider',
    role: 'API_PROVIDER',
    status: 'Active',
    createdAt: '',
    lastLoginAt: '',
    twoFactorEnabled: false,
    quotaUsedPercent: 0,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: mockProviderUser,
      user: mockProviderUser,
      isAuthenticated: true,
      sessionReady: true,
      sessionError: null,
      backendOnline: true,
      checkBackendConnection: vi.fn(),
      retrySession: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      switchRole: vi.fn(),
      clearSessionError: vi.fn(),
    } as any);
  });

  it('renders skeleton on loading and then shows unverified form when no verification exists', async () => {
    vi.spyOn(providerApiModule, 'getProviderVerification').mockResolvedValue(null);

    render(<ProviderVerificationPage />);

    expect(screen.getByLabelText(/Loading verification status/i)).toBeDefined();

    await waitFor(() => {
      expect(screen.queryByLabelText(/Loading verification status/i)).toBeNull();
    });

    expect(screen.getByText(/Chưa nộp hồ sơ/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Nộp hồ sơ xác minh/i })).toBeDefined();
    const emailInput = screen.getByPlaceholderText(/legal@company.com/i) as HTMLInputElement;
    expect(emailInput.value).toBe('provider@company.com');
  });

  it('displays Verified status badge and locks form when status is Verified', async () => {
    const verifiedData: ProviderVerification = {
      id: 'ver-10',
      providerId: 'prov-1',
      organizationName: 'Global Cloud Corp',
      contactEmail: 'legal@globalcloud.com',
      evidenceUrls: ['https://globalcloud.com/cert.pdf'],
      status: 'Verified',
      submittedAt: '2026-10-10T10:00:00Z',
    };
    vi.spyOn(providerApiModule, 'getProviderVerification').mockResolvedValue(verifiedData);

    render(<ProviderVerificationPage />);

    await waitFor(() => {
      expect(screen.getByText(/Đã xác minh \(Verified\)/i)).toBeDefined();
    });

    expect(screen.getByText(/Hồ sơ đã khóa \(Đã duyệt\)/i)).toBeDefined();
    expect(screen.getByDisplayValue('Global Cloud Corp').hasAttribute('disabled')).toBe(true);
    expect(screen.getByDisplayValue('legal@globalcloud.com').hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: /Nộp hồ sơ xác minh/i }).hasAttribute('disabled')).toBe(true);
  });

  it('displays Pending status banner and locks form when status is Pending', async () => {
    const pendingData: ProviderVerification = {
      id: 'ver-11',
      providerId: 'prov-1',
      organizationName: 'Pending Startup',
      contactEmail: 'contact@startup.io',
      evidenceUrls: ['https://startup.io/license'],
      status: 'Pending',
      submittedAt: '2026-10-14T08:00:00Z',
    };
    vi.spyOn(providerApiModule, 'getProviderVerification').mockResolvedValue(pendingData);

    render(<ProviderVerificationPage />);

    await waitFor(() => {
      expect(screen.getByText(/Đang chờ duyệt \(Pending\)/i)).toBeDefined();
    });

    expect(screen.getByText(/Hồ sơ đã khóa \(Đang duyệt\)/i)).toBeDefined();
    expect(screen.getByDisplayValue('Pending Startup').hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: /Nộp hồ sơ xác minh/i }).hasAttribute('disabled')).toBe(true);
  });

  it('displays rejection reason and enables resubmission when status is Rejected', async () => {
    const rejectedData: ProviderVerification = {
      id: 'ver-12',
      providerId: 'prov-1',
      organizationName: 'Rejected LLC',
      contactEmail: 'info@rejected.com',
      evidenceUrls: ['https://rejected.com/doc.pdf'],
      status: 'Rejected',
      rejectReason: 'Tài liệu ĐKKD mờ, không nhìn rõ mã số thuế và dấu đỏ.',
      submittedAt: '2026-10-12T00:00:00Z',
    };
    vi.spyOn(providerApiModule, 'getProviderVerification').mockResolvedValue(rejectedData);

    render(<ProviderVerificationPage />);

    await waitFor(() => {
      expect(screen.getByText(/Bị từ chối \(Rejected\)/i)).toBeDefined();
    });

    expect(screen.getByText(/Tài liệu ĐKKD mờ, không nhìn rõ mã số thuế và dấu đỏ./i)).toBeDefined();
    // Inputs should be editable for resubmission
    const orgInput = screen.getByDisplayValue('Rejected LLC');
    expect(orgInput.hasAttribute('disabled')).toBe(false);

    expect(screen.getByRole('button', { name: /Gửi lại hồ sơ xác minh/i })).toBeDefined();
  });

  it('handles client validation errors before submitting', async () => {
    vi.spyOn(providerApiModule, 'getProviderVerification').mockResolvedValue(null);

    render(<ProviderVerificationPage />);

    await waitFor(() => {
      expect(screen.getByText(/Chưa nộp hồ sơ/i)).toBeDefined();
    });

    const submitBtn = screen.getByRole('button', { name: /Nộp hồ sơ xác minh/i });
    expect(submitBtn.hasAttribute('disabled')).toBe(true); // Disabled because agreement not checked

    // Check agreement
    const agreementCheckbox = screen.getByRole('checkbox');
    fireEvent.click(agreementCheckbox);
    expect(submitBtn.hasAttribute('disabled')).toBe(false);

    // Clear organization name and submit
    const orgInput = screen.getByPlaceholderText(/Công ty TNHH Công nghệ.../i);
    fireEvent.change(orgInput, { target: { value: '   ' } });

    fireEvent.submit(submitBtn.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText(/Vui lòng nhập tên công ty \/ tổ chức./i)).toBeDefined();
    });
  });

  it('submits valid form data and updates status banner', async () => {
    vi.spyOn(providerApiModule, 'getProviderVerification').mockResolvedValue(null);
    const submitSpy = vi.spyOn(providerApiModule, 'submitProviderVerification').mockResolvedValue({
      id: 'ver-100',
      providerId: 'prov-user-1',
      organizationName: 'Super Tech Ltd',
      contactEmail: 'legal@supertech.com',
      evidenceUrls: ['https://supertech.com/license.pdf'],
      status: 'Pending',
      submittedAt: '2026-10-16T10:00:00Z',
    });

    render(<ProviderVerificationPage />);

    await waitFor(() => {
      expect(screen.getByText(/Chưa nộp hồ sơ/i)).toBeDefined();
    });

    const orgInput = screen.getByPlaceholderText(/Công ty TNHH Công nghệ.../i);
    const emailInput = screen.getByPlaceholderText(/legal@company.com/i);
    const urlInput = screen.getByPlaceholderText(/https:\/\/example.com\/license.pdf/i);
    const checkbox = screen.getByRole('checkbox');

    fireEvent.change(orgInput, { target: { value: 'Super Tech Ltd' } });
    fireEvent.change(emailInput, { target: { value: 'legal@supertech.com' } });
    fireEvent.change(urlInput, { target: { value: 'https://supertech.com/license.pdf' } });
    fireEvent.click(checkbox);

    const submitBtn = screen.getByRole('button', { name: /Nộp hồ sơ xác minh/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledWith({
        organizationName: 'Super Tech Ltd',
        contactEmail: 'legal@supertech.com',
        evidenceUrls: ['https://supertech.com/license.pdf'],
      });
      expect(screen.getByText(/Hồ sơ xác minh đã được nộp lên máy chủ thành công và đang chờ Admin xét duyệt./i)).toBeDefined();
    });
  });

  it('handles load error and provides working retry button', async () => {
    const getVerSpy = vi.spyOn(providerApiModule, 'getProviderVerification')
      .mockRejectedValueOnce(new ApiError(500, 'SERVER_ERROR', 'Lỗi kết nối máy chủ'))
      .mockResolvedValueOnce(null);

    render(<ProviderVerificationPage />);

    await waitFor(() => {
      expect(screen.getByText(/Máy chủ đang gặp sự cố hoặc không thể kết nối/i)).toBeDefined();
    });

    const retryBtn = screen.getByRole('button', { name: /Thử lại/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(getVerSpy).toHaveBeenCalledTimes(2);
      expect(screen.getByText(/Chưa nộp hồ sơ/i)).toBeDefined();
    });
  });
});
