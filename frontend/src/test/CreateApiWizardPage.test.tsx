import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CreateApiWizardPage } from '../pages/provider/CreateApiWizardPage';
import * as providerApiModule from '../services/providerApi';
import * as AuthContextModule from '../context/AuthContext';
import type { User } from '../types';
import type { ProviderAgreement, ProviderVerification } from '../services/providerTypes';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CreateApiWizardPage (Finding F2 fail-closed agreement tests)', () => {
  const mockUser: User = {
    id: 'user-1',
    email: 'provider@example.com',
    name: 'Provider One',
    role: 'API_PROVIDER',
    status: 'Active',
    createdAt: '',
    lastLoginAt: '',
    twoFactorEnabled: false,
    quotaUsedPercent: 0,
  };

  const mockVerification: ProviderVerification = {
    providerId: 'user-1',
    legalName: 'Acme API Corp',
    businessRegNumber: '1234567890',
    taxCode: 'TAX9999',
    contactEmail: 'corp@acme.test',
    contactPhone: '+84988776655',
    registeredAddress: '123 Tech St',
    status: 'Verified',
    submittedAt: '2026-10-01T00:00:00Z',
    reviewedAt: '2026-10-02T00:00:00Z',
  };

  const validAgreement: ProviderAgreement = {
    id: 'agr-1',
    version: 'v2.1.0',
    content: 'Day la noi dung thoa thuan hop le danh cho Nha cung cap.',
    effectiveAt: '2026-01-01T00:00:00Z',
  };

  let currentUserState: User | null = mockUser;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockNavigate.mockReset();
    currentUserState = mockUser;

    vi.spyOn(AuthContextModule, 'useAuth').mockImplementation(() => ({
      currentUser: currentUserState,
      user: currentUserState,
      isAuthenticated: Boolean(currentUserState),
      sessionReady: true,
      sessionError: null,
      backendOnline: true,
      checkBackendConnection: vi.fn(),
      retrySession: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    } as any));

    vi.spyOn(providerApiModule, 'getProviderVerification').mockResolvedValue(mockVerification);
  });

  const advanceToStep4 = async () => {
    // Step 1: fill required name and click Tiếp tục
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ví dụ: Công cụ suy luận/i)).toBeDefined();
    });

    fireEvent.change(screen.getByPlaceholderText(/Ví dụ: Công cụ suy luận/i), {
      target: { value: 'Test Weather API' },
    });

    const nextStep1 = screen.getByRole('button', { name: /Tiếp tục sang Định tuyến Upstream/i });
    fireEvent.click(nextStep1);

    // Step 2: click Tiếp tục sang Gói Cước
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Tiếp tục sang Gói Cước/i })).toBeDefined();
    });
    const nextStep2 = screen.getByRole('button', { name: /Tiếp tục sang Gói Cước/i });
    fireEvent.click(nextStep2);

    // Step 3: click Tiếp tục sang Pháp lý & Tuân thủ
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Tiếp tục sang Pháp lý & Tuân thủ/i })).toBeDefined();
    });
    const nextStep3 = screen.getByRole('button', { name: /Tiếp tục sang Pháp lý & Tuân thủ/i });
    fireEvent.click(nextStep3);

    // Step 4 reached
    await waitFor(() => {
      expect(screen.getByText(/Bước 4: Quyền sở hữu/i)).toBeDefined();
    });
  };

  it('fails closed when agreement content is empty or whitespace', async () => {
    vi.spyOn(providerApiModule, 'getProviderAgreement').mockResolvedValue({
      id: 'agr-empty',
      version: 'v1.0.0',
      content: '   \n\t   ', // Whitespace only
      effectiveAt: '2026-01-01T00:00:00Z',
    });

    render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4();

    // Verify warning alert is shown
    expect(screen.getByText(/Nội dung Thỏa thuận Nhà cung cấp từ máy chủ bị trống hoặc không hợp lệ/i)).toBeDefined();

    // Checkbox should be disabled
    const checkbox = screen.getByLabelText(/Tôi đã đọc/i) as HTMLInputElement;
    expect(checkbox.disabled).toBe(true);

    // Submit button should be disabled
    const finishBtn = screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i });
    expect(finishBtn.hasAttribute('disabled')).toBe(true);
  });

  it('fails closed when agreement fetch rejects', async () => {
    vi.spyOn(providerApiModule, 'getProviderAgreement').mockRejectedValue(new Error('Network error loading agreement'));

    render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4();

    // Warning banner shown with retry button
    expect(screen.getByText(/Không thể tải Điều khoản Thỏa thuận Nhà cung cấp từ máy chủ/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Thử lại/i })).toBeDefined();

    const checkbox = screen.getByLabelText(/Tôi đã đọc/i) as HTMLInputElement;
    expect(checkbox.disabled).toBe(true);

    const finishBtn = screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i });
    expect(finishBtn.hasAttribute('disabled')).toBe(true);
  });

  it('resets acceptance checkbox when agreement version changes', async () => {
    let currentAgreement = { ...validAgreement, version: 'v2.1.0' };
    vi.spyOn(providerApiModule, 'getProviderAgreement').mockImplementation(async () => currentAgreement);

    render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4();

    const checkbox = screen.getByLabelText(/Tôi đã đọc/i) as HTMLInputElement;
    expect(checkbox.disabled).toBe(false);
    expect(checkbox.checked).toBe(false);

    // Check it
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    // Simulate agreement version update on server before finish
    currentAgreement = { ...validAgreement, id: 'agr-2', version: 'v2.2.0' };

    const finishBtn = screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i });
    await act(async () => {
      fireEvent.click(finishBtn);
    });

    // Checkbox must be reset to unchecked and alert shown
    await waitFor(() => {
      const updatedCheckbox = screen.getByLabelText(/Tôi đã đọc/i) as HTMLInputElement;
      expect(updatedCheckbox.checked).toBe(false);
      expect(screen.getByText(/Thỏa thuận Nhà cung cấp đã được cập nhật phiên bản mới \(v2.2.0\)/i)).toBeDefined();
    });
  });

  it('resets acceptance checkbox when user changes', async () => {
    vi.spyOn(providerApiModule, 'getProviderAgreement').mockResolvedValue(validAgreement);

    const { rerender } = render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4();

    const checkbox = screen.getByLabelText(/Tôi đã đọc/i) as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    // Switch user to user-2
    await act(async () => {
      currentUserState = { ...mockUser, id: 'user-2', email: 'user2@test.com' };
      rerender(
        <MemoryRouter>
          <CreateApiWizardPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      const updatedCheckbox = screen.getByLabelText(/Tôi đã đọc/i) as HTMLInputElement;
      expect(updatedCheckbox.checked).toBe(false);
    });
  });
});
