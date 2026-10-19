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

  it('blocks createProviderApi when agreement fetch fails during submission', async () => {
    vi.spyOn(providerApiModule, 'getProviderAgreement').mockResolvedValue(validAgreement);
    const createApiSpy = vi.spyOn(providerApiModule, 'createProviderApi').mockResolvedValue({ id: 'api-1' } as any);
    const createVersionSpy = vi.spyOn(providerApiModule, 'createProviderVersion').mockResolvedValue({ id: 'ver-1' } as any);
    const createPlanSpy = vi.spyOn(providerApiModule, 'createProviderPlan').mockResolvedValue({ id: 'plan-1' } as any);
    const saveLegalSpy = vi.spyOn(providerApiModule, 'saveProviderLegal').mockResolvedValue({ id: 'legal-1' } as any);

    render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4();

    const checkbox = screen.getByLabelText(/Tôi đã đọc/i) as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    // Fail subsequent getProviderAgreement call during submission
    vi.spyOn(providerApiModule, 'getProviderAgreement').mockRejectedValue(new Error('Network failure during verification'));

    const finishBtn = screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i });
    await act(async () => {
      fireEvent.click(finishBtn);
    });

    await waitFor(() => {
      expect(screen.getAllByText(/Không thể xác thực Điều khoản Thỏa thuận Nhà cung cấp từ máy chủ/i).length).toBeGreaterThanOrEqual(1);
    });

    // Prohibited mutations must NOT have been called
    expect(createApiSpy).not.toHaveBeenCalled();
    expect(createVersionSpy).not.toHaveBeenCalled();
    expect(createPlanSpy).not.toHaveBeenCalled();
    expect(saveLegalSpy).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();

    // Checkbox must be reset and disabled
    const updatedCheckbox = screen.getByLabelText(/Tôi đã đọc/i) as HTMLInputElement;
    expect(updatedCheckbox.checked).toBe(false);
    expect(updatedCheckbox.disabled).toBe(true);
  });

  it('forces re-consent and aborts resource creation when agreement version updates on server', async () => {
    vi.spyOn(providerApiModule, 'getProviderAgreement').mockResolvedValue(validAgreement);
    const createApiSpy = vi.spyOn(providerApiModule, 'createProviderApi').mockResolvedValue({ id: 'api-1' } as any);
    const createVersionSpy = vi.spyOn(providerApiModule, 'createProviderVersion').mockResolvedValue({ id: 'ver-1' } as any);
    const createPlanSpy = vi.spyOn(providerApiModule, 'createProviderPlan').mockResolvedValue({ id: 'plan-1' } as any);
    const saveLegalSpy = vi.spyOn(providerApiModule, 'saveProviderLegal').mockResolvedValue({ id: 'legal-1' } as any);

    render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4();

    const checkbox = screen.getByLabelText(/Tôi đã đọc/i) as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    // Server updates agreement from v2.1.0 to v2.2.0
    vi.spyOn(providerApiModule, 'getProviderAgreement').mockResolvedValue({
      ...validAgreement,
      id: 'agr-2',
      version: 'v2.2.0',
    });

    const finishBtn = screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i });
    await act(async () => {
      fireEvent.click(finishBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/Thỏa thuận Nhà cung cấp đã được cập nhật phiên bản mới \(v2.2.0\)/i)).toBeDefined();
    });

    expect(createApiSpy).not.toHaveBeenCalled();
    expect(createVersionSpy).not.toHaveBeenCalled();
    expect(createPlanSpy).not.toHaveBeenCalled();
    expect(saveLegalSpy).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();

    const updatedCheckbox = screen.getByLabelText(/Tôi đã đọc/i) as HTMLInputElement;
    expect(updatedCheckbox.checked).toBe(false);
  });

  it('aborts submission and creates no resources if account changes while agreement verification is pending', async () => {
    vi.spyOn(providerApiModule, 'getProviderAgreement').mockResolvedValue(validAgreement);
    const createApiSpy = vi.spyOn(providerApiModule, 'createProviderApi').mockResolvedValue({ id: 'api-1' } as any);
    const createVersionSpy = vi.spyOn(providerApiModule, 'createProviderVersion').mockResolvedValue({ id: 'ver-1' } as any);
    const createPlanSpy = vi.spyOn(providerApiModule, 'createProviderPlan').mockResolvedValue({ id: 'plan-1' } as any);
    const saveLegalSpy = vi.spyOn(providerApiModule, 'saveProviderLegal').mockResolvedValue({ id: 'legal-1' } as any);

    const { rerender } = render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4();

    const checkbox = screen.getByLabelText(/Tôi đã đọc/i) as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    // Controlled promise for pending agreement check
    let resolveAgreement!: (val: any) => void;
    const pendingAgreement = new Promise(resolve => {
      resolveAgreement = resolve;
    });
    vi.spyOn(providerApiModule, 'getProviderAgreement').mockReturnValue(pendingAgreement as any);

    const finishBtn = screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i });
    fireEvent.click(finishBtn);

    // While agreement fetch is pending, user changes to user-2
    await act(async () => {
      currentUserState = { ...mockUser, id: 'user-2', email: 'user2@example.com' };
      rerender(
        <MemoryRouter>
          <CreateApiWizardPage />
        </MemoryRouter>
      );
    });

    // Now resolve pending agreement fetch
    await act(async () => {
      resolveAgreement(validAgreement);
    });

    // Prohibited mutations must NOT have been called under old or new user
    expect(createApiSpy).not.toHaveBeenCalled();
    expect(createVersionSpy).not.toHaveBeenCalled();
    expect(createPlanSpy).not.toHaveBeenCalled();
    expect(saveLegalSpy).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('completes the intended workflow on successful retry after temporary verification failure', async () => {
    vi.spyOn(providerApiModule, 'getProviderAgreement').mockResolvedValue(validAgreement);
    const createApiSpy = vi.spyOn(providerApiModule, 'createProviderApi').mockResolvedValue({ id: 'api-retry-99' } as any);
    const createVersionSpy = vi.spyOn(providerApiModule, 'createProviderVersion').mockResolvedValue({ id: 'ver-1' } as any);
    const createPlanSpy = vi.spyOn(providerApiModule, 'createProviderPlan').mockResolvedValue({ id: 'plan-1' } as any);
    const saveLegalSpy = vi.spyOn(providerApiModule, 'saveProviderLegal').mockResolvedValue({ id: 'legal-1' } as any);

    render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4();

    const checkbox = screen.getByLabelText(/Tôi đã đọc/i) as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    // 1st attempt: fails closed
    vi.spyOn(providerApiModule, 'getProviderAgreement').mockRejectedValueOnce(new Error('Temporary timeout'));

    const finishBtn = screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i });
    await act(async () => {
      fireEvent.click(finishBtn);
    });

    await waitFor(() => {
      expect(screen.getAllByText(/Không thể xác thực Điều khoản Thỏa thuận Nhà cung cấp từ máy chủ/i).length).toBeGreaterThanOrEqual(1);
    });
    expect(createApiSpy).not.toHaveBeenCalled();

    // Click retry in agreement error box
    vi.spyOn(providerApiModule, 'getProviderAgreement').mockResolvedValue(validAgreement);
    const retryBtn = screen.getByRole('button', { name: /Thử lại/i });
    await act(async () => {
      fireEvent.click(retryBtn);
    });

    // Agreement reloaded successfully, user re-confirms
    await waitFor(() => {
      const cb = screen.getByLabelText(/Tôi đã đọc/i) as HTMLInputElement;
      expect(cb.disabled).toBe(false);
    });

    const activeCheckbox = screen.getByLabelText(/Tôi đã đọc/i) as HTMLInputElement;
    fireEvent.click(activeCheckbox);
    expect(activeCheckbox.checked).toBe(true);

    // 2nd attempt: succeeds
    const finishBtnRetry = screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i });
    await act(async () => {
      fireEvent.click(finishBtnRetry);
    });

    await waitFor(() => {
      expect(createApiSpy).toHaveBeenCalledTimes(1);
      expect(createVersionSpy).toHaveBeenCalledTimes(1);
      expect(createPlanSpy).toHaveBeenCalledTimes(1);
      expect(saveLegalSpy).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/provider/publishing-workflow?api=api-retry-99');
    });
  });
});

describe('CreateApiWizardPage (TC-FE-RETRY-01 through TC-FE-RETRY-16 Regression Suite)', () => {
  const mockUser: User = {
    id: 'user-retry-1',
    email: 'provider-retry@example.com',
    name: 'Provider Retry',
    role: 'API_PROVIDER',
    status: 'Active',
    createdAt: '',
    lastLoginAt: '',
    twoFactorEnabled: false,
    quotaUsedPercent: 0,
  };

  const mockVerification: ProviderVerification = {
    providerId: 'user-retry-1',
    legalName: 'Retry Tech Corp',
    businessRegNumber: '9988776655',
    taxCode: 'TAX8888',
    contactEmail: 'corp@retry.test',
    contactPhone: '+84988112233',
    registeredAddress: '456 Flow St',
    status: 'Verified',
    submittedAt: '2026-10-01T00:00:00Z',
    reviewedAt: '2026-10-02T00:00:00Z',
  };

  const validAgreement: ProviderAgreement = {
    id: 'agr-retry-1',
    version: 'v2.1.0',
    content: 'Thoa thuan nha cung cap hop le phien ban 2.1.0.',
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
    vi.spyOn(providerApiModule, 'getProviderAgreement').mockResolvedValue(validAgreement);
    vi.spyOn(providerApiModule, 'updateProviderApi').mockResolvedValue({ id: 'mock-updated-api' } as any);
    vi.spyOn(providerApiModule, 'updateProviderVersion').mockResolvedValue({ id: 'mock-updated-ver' } as any);
    vi.spyOn(providerApiModule, 'updateProviderPlan').mockResolvedValue({ id: 'mock-updated-plan' } as any);
  });

  const advanceToStep4 = async (apiName = 'Weather Pro API') => {
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ví dụ: Công cụ suy luận/i)).toBeDefined();
    });

    fireEvent.change(screen.getByPlaceholderText(/Ví dụ: Công cụ suy luận/i), {
      target: { value: apiName },
    });

    const nextStep1 = screen.getByRole('button', { name: /Tiếp tục sang Định tuyến Upstream/i });
    fireEvent.click(nextStep1);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Tiếp tục sang Gói Cước/i })).toBeDefined();
    });
    const nextStep2 = screen.getByRole('button', { name: /Tiếp tục sang Gói Cước/i });
    fireEvent.click(nextStep2);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Tiếp tục sang Pháp lý & Tuân thủ/i })).toBeDefined();
    });
    const nextStep3 = screen.getByRole('button', { name: /Tiếp tục sang Pháp lý & Tuân thủ/i });
    fireEvent.click(nextStep3);

    await waitFor(() => {
      expect(screen.getByText(/Bước 4: Quyền sở hữu/i)).toBeDefined();
    });
  };

  const acceptAgreementAndSubmit = async () => {
    await waitFor(() => {
      const checkbox = screen.getByLabelText(/Tôi đã đọc/i) as HTMLInputElement;
      expect(checkbox.disabled).toBe(false);
    });

    const checkbox = screen.getByLabelText(/Tôi đã đọc/i) as HTMLInputElement;
    if (!checkbox.checked) {
      fireEvent.click(checkbox);
    }

    const finishBtn = screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i });
    await act(async () => {
      fireEvent.click(finishBtn);
    });
  };

  it('TC-FE-RETRY-01: Initial creation succeeds without duplicate resources', async () => {
    const createApiSpy = vi.spyOn(providerApiModule, 'createProviderApi').mockResolvedValue({ id: 'api-tc-01' } as any);
    const createVersionSpy = vi.spyOn(providerApiModule, 'createProviderVersion').mockResolvedValue({ id: 'ver-tc-01' } as any);
    const createPlanSpy = vi.spyOn(providerApiModule, 'createProviderPlan').mockResolvedValue({ id: 'plan-tc-01' } as any);
    const saveLegalSpy = vi.spyOn(providerApiModule, 'saveProviderLegal').mockResolvedValue({ id: 'legal-tc-01' } as any);

    render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4('TC-01 API');
    await acceptAgreementAndSubmit();

    await waitFor(() => {
      expect(createApiSpy).toHaveBeenCalledTimes(1);
      expect(createVersionSpy).toHaveBeenCalledTimes(1);
      expect(createPlanSpy).toHaveBeenCalledTimes(1);
      expect(saveLegalSpy).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/provider/publishing-workflow?api=api-tc-01');
    });
  });

  it('TC-FE-RETRY-02: Draft creation succeeds, legal submission fails, retry reuses the existing Draft', async () => {
    const createApiSpy = vi.spyOn(providerApiModule, 'createProviderApi').mockResolvedValue({ id: 'api-tc-02' } as any);
    const createVersionSpy = vi.spyOn(providerApiModule, 'createProviderVersion').mockResolvedValue({ id: 'ver-tc-02' } as any);
    const createPlanSpy = vi.spyOn(providerApiModule, 'createProviderPlan').mockResolvedValue({ id: 'plan-tc-02' } as any);
    const saveLegalSpy = vi.spyOn(providerApiModule, 'saveProviderLegal')
      .mockRejectedValueOnce(new Error('Legal service down'))
      .mockResolvedValueOnce({ id: 'legal-tc-02' } as any);

    const getApiSpy = vi.spyOn(providerApiModule, 'getProviderApi').mockResolvedValue({
      id: 'api-tc-02',
      name: 'TC-02 API',
      description: 'Dịch vụ API thương mại',
      category: 'Machine Learning & AI',
      baseUrl: '',
      tags: [],
      status: 'Draft',
    } as any);

    const listVersionsSpy = vi.spyOn(providerApiModule, 'listProviderVersions').mockResolvedValue([
      { id: 'ver-tc-02', version: '1.0.0', changelog: 'Phiên bản khởi tạo ban đầu' } as any,
    ]);

    const listPlansSpy = vi.spyOn(providerApiModule, 'listProviderPlans').mockResolvedValue([
      { id: 'plan-tc-02', name: 'Free', priceMonthly: 0, currency: 'USD', quota: 2000, rateLimit: 10 } as any,
    ]);

    render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4('TC-02 API');

    // Attempt 1: Fails at legal step
    await acceptAgreementAndSubmit();

    await waitFor(() => {
      expect(screen.getByText(/Legal service down/i)).toBeDefined();
    });
    expect(createApiSpy).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();

    // Attempt 2 (Retry): Reuses existing draft without calling createProviderApi again
    const finishBtn = screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i });
    await act(async () => {
      fireEvent.click(finishBtn);
    });

    await waitFor(() => {
      expect(getApiSpy).toHaveBeenCalledWith('api-tc-02');
      expect(createApiSpy).toHaveBeenCalledTimes(1); // STILL 1, NOT 2
      expect(createVersionSpy).toHaveBeenCalledTimes(1);
      expect(createPlanSpy).toHaveBeenCalledTimes(1);
      expect(listVersionsSpy).toHaveBeenCalledWith('api-tc-02');
      expect(listPlansSpy).toHaveBeenCalledWith('api-tc-02');
      expect(saveLegalSpy).toHaveBeenCalledTimes(2);
      expect(mockNavigate).toHaveBeenCalledWith('/provider/publishing-workflow?api=api-tc-02');
    });
  });

  it('TC-FE-RETRY-03: Partial failure followed by metadata edits synchronizes the persisted Draft', async () => {
    vi.spyOn(providerApiModule, 'createProviderApi').mockResolvedValue({ id: 'api-tc-03' } as any);
    vi.spyOn(providerApiModule, 'createProviderVersion').mockResolvedValue({ id: 'ver-tc-03' } as any);
    vi.spyOn(providerApiModule, 'createProviderPlan').mockResolvedValue({ id: 'plan-tc-03' } as any);
    vi.spyOn(providerApiModule, 'saveProviderLegal')
      .mockRejectedValueOnce(new Error('Network drop on legal'))
      .mockResolvedValueOnce({ id: 'legal-tc-03' } as any);

    vi.spyOn(providerApiModule, 'getProviderApi').mockResolvedValue({
      id: 'api-tc-03',
      name: 'Initial Name',
      description: 'Dịch vụ API thương mại',
      category: 'Machine Learning & AI',
      baseUrl: '',
      tags: [],
      status: 'Draft',
    } as any);

    const updateApiSpy = vi.spyOn(providerApiModule, 'updateProviderApi').mockResolvedValue({ id: 'api-tc-03' } as any);
    vi.spyOn(providerApiModule, 'listProviderVersions').mockResolvedValue([
      { id: 'ver-tc-03', version: '1.0.0' } as any,
    ]);
    vi.spyOn(providerApiModule, 'listProviderPlans').mockResolvedValue([
      { id: 'plan-tc-03', name: 'Free', priceMonthly: 0, currency: 'USD', quota: 2000, rateLimit: 10 } as any,
    ]);

    render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4('Initial Name');
    await acceptAgreementAndSubmit();

    await waitFor(() => {
      expect(screen.getByText(/Network drop on legal/i)).toBeDefined();
    });

    // User navigates back to Step 1 and edits API name
    const backBtnTo3 = screen.getByRole('button', { name: /← (Back|Quay lại)/i });
    fireEvent.click(backBtnTo3);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Tiếp tục sang Pháp lý & Tuân thủ/i })).toBeDefined();
    });
    const backBtnTo2 = screen.getAllByRole('button', { name: /← (Back|Quay lại)/i })[0];
    fireEvent.click(backBtnTo2);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Tiếp tục sang Gói Cước/i })).toBeDefined();
    });
    const backBtnTo1 = screen.getAllByRole('button', { name: /← (Back|Quay lại)/i })[0];
    fireEvent.click(backBtnTo1);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ví dụ: Công cụ suy luận/i)).toBeDefined();
    });

    // Change API name
    fireEvent.change(screen.getByPlaceholderText(/Ví dụ: Công cụ suy luận/i), {
      target: { value: 'Synchronized Edited Name' },
    });

    // Advance forward to step 4
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục sang Định tuyến Upstream/i }));
    await waitFor(() => screen.getByRole('button', { name: /Tiếp tục sang Gói Cước/i }));
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục sang Gói Cước/i }));
    await waitFor(() => screen.getByRole('button', { name: /Tiếp tục sang Pháp lý & Tuân thủ/i }));
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục sang Pháp lý & Tuân thủ/i }));

    await waitFor(() => screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i }));

    const finishBtn = screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i });
    await act(async () => {
      fireEvent.click(finishBtn);
    });

    await waitFor(() => {
      expect(updateApiSpy).toHaveBeenCalledWith('api-tc-03', expect.objectContaining({
        name: 'Synchronized Edited Name',
      }));
      expect(mockNavigate).toHaveBeenCalledWith('/provider/publishing-workflow?api=api-tc-03');
    });
  });

  it('TC-FE-RETRY-04: Partial failure followed by Base URL edits synchronizes routing data', async () => {
    vi.spyOn(providerApiModule, 'createProviderApi').mockResolvedValue({ id: 'api-tc-04' } as any);
    vi.spyOn(providerApiModule, 'createProviderVersion').mockResolvedValue({ id: 'ver-tc-04' } as any);
    vi.spyOn(providerApiModule, 'createProviderPlan').mockResolvedValue({ id: 'plan-tc-04' } as any);
    vi.spyOn(providerApiModule, 'saveProviderLegal')
      .mockRejectedValueOnce(new Error('Legal error'))
      .mockResolvedValueOnce({ id: 'legal-tc-04' } as any);

    vi.spyOn(providerApiModule, 'getProviderApi').mockResolvedValue({
      id: 'api-tc-04',
      name: 'TC-04 API',
      description: 'Dịch vụ API thương mại',
      category: 'Machine Learning & AI',
      baseUrl: 'https://api.mycompany.io/v1',
      tags: ['production', 'api'],
      status: 'Draft',
    } as any);

    const updateApiSpy = vi.spyOn(providerApiModule, 'updateProviderApi').mockResolvedValue({ id: 'api-tc-04' } as any);
    vi.spyOn(providerApiModule, 'listProviderVersions').mockResolvedValue([
      { id: 'ver-tc-04', version: '1.0.0' } as any,
    ]);
    vi.spyOn(providerApiModule, 'listProviderPlans').mockResolvedValue([
      { id: 'plan-tc-04', name: 'Free', priceMonthly: 0, currency: 'USD', quota: 2000, rateLimit: 10 } as any,
    ]);

    render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4('TC-04 API');
    await acceptAgreementAndSubmit();

    await waitFor(() => expect(screen.getByText(/Legal error/i)).toBeDefined());

    // Back from Step 4 to Step 3
    fireEvent.click(screen.getByRole('button', { name: /← (Back|Quay lại)/i }));
    await waitFor(() => screen.getByRole('button', { name: /Tiếp tục sang Pháp lý & Tuân thủ/i }));

    // Back from Step 3 to Step 2
    fireEvent.click(screen.getByRole('button', { name: /← (Back|Quay lại)/i }));
    await waitFor(() => screen.getByPlaceholderText('https://api.yourdomain.com/v1'));

    // Change Base URL
    fireEvent.change(screen.getByPlaceholderText('https://api.yourdomain.com/v1'), {
      target: { value: 'https://new-secure-upstream.test' },
    });

    // Forward to Step 3
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục sang Gói Cước/i }));
    await waitFor(() => screen.getByRole('button', { name: /Tiếp tục sang Pháp lý & Tuân thủ/i }));

    // Forward to Step 4
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục sang Pháp lý & Tuân thủ/i }));
    await waitFor(() => screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i }));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i }));
    });

    await waitFor(() => {
      expect(updateApiSpy).toHaveBeenCalledWith('api-tc-04', expect.objectContaining({
        baseUrl: 'https://new-secure-upstream.test',
      }));
      expect(mockNavigate).toHaveBeenCalledWith('/provider/publishing-workflow?api=api-tc-04');
    });
  });

  it('TC-FE-RETRY-05: Existing Free Plan with changed quota and rate limit is correctly reconciled', async () => {
    vi.spyOn(providerApiModule, 'createProviderApi').mockResolvedValue({ id: 'api-tc-05' } as any);
    vi.spyOn(providerApiModule, 'createProviderVersion').mockResolvedValue({ id: 'ver-tc-05' } as any);
    vi.spyOn(providerApiModule, 'createProviderPlan').mockResolvedValue({ id: 'plan-tc-05' } as any);
    vi.spyOn(providerApiModule, 'saveProviderLegal')
      .mockRejectedValueOnce(new Error('Initial legal timeout'))
      .mockResolvedValueOnce({ id: 'legal-tc-05' } as any);

    vi.spyOn(providerApiModule, 'getProviderApi').mockResolvedValue({
      id: 'api-tc-05',
      name: 'TC-05 API',
      description: 'Dịch vụ API thương mại',
      category: 'Machine Learning & AI',
      baseUrl: 'https://api.mycompany.io/v1',
      tags: ['production', 'api'],
      status: 'Draft',
    } as any);

    vi.spyOn(providerApiModule, 'listProviderVersions').mockResolvedValue([
      { id: 'ver-tc-05', version: '1.0.0' } as any,
    ]);

    // Backend currently has old quota 2000, rateLimit 10
    vi.spyOn(providerApiModule, 'listProviderPlans').mockResolvedValue([
      { id: 'plan-existing-5', name: 'Free', priceMonthly: 0, currency: 'USD', quota: 2000, rateLimit: 10 } as any,
    ]);
    const updatePlanSpy = vi.spyOn(providerApiModule, 'updateProviderPlan').mockResolvedValue({ id: 'plan-existing-5' } as any);

    render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4('TC-05 API');
    await acceptAgreementAndSubmit();
    await waitFor(() => expect(screen.getByText(/Initial legal timeout/i)).toBeDefined());

    // Go back to Step 3 and modify quota & rateLimit
    fireEvent.click(screen.getByRole('button', { name: /← (Back|Quay lại)/i }));
    await waitFor(() => screen.getByDisplayValue('2000'));

    fireEvent.change(screen.getByDisplayValue('2000'), { target: { value: '7500' } });
    fireEvent.change(screen.getByDisplayValue('10'), { target: { value: '50' } });

    // Forward to Step 4
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục sang Pháp lý & Tuân thủ/i }));
    await waitFor(() => screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i }));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i }));
    });

    await waitFor(() => {
      expect(updatePlanSpy).toHaveBeenCalledWith('api-tc-05', 'plan-existing-5', {
        name: 'Free',
        priceMonthly: 0,
        currency: 'USD',
        quota: 7500,
        rateLimit: 50,
      });
      expect(mockNavigate).toHaveBeenCalledWith('/provider/publishing-workflow?api=api-tc-05');
    });
  });

  it('TC-FE-RETRY-06: Version conflict is handled according to actual backend semantics', async () => {
    vi.spyOn(providerApiModule, 'createProviderApi').mockResolvedValue({ id: 'api-tc-06' } as any);
    vi.spyOn(providerApiModule, 'createProviderVersion').mockResolvedValue({ id: 'ver-tc-06' } as any);
    vi.spyOn(providerApiModule, 'createProviderPlan').mockResolvedValue({ id: 'plan-tc-06' } as any);
    vi.spyOn(providerApiModule, 'saveProviderLegal')
      .mockRejectedValueOnce(new Error('Initial failure'))
      .mockResolvedValueOnce({ id: 'legal-tc-06' } as any);

    vi.spyOn(providerApiModule, 'getProviderApi').mockResolvedValue({
      id: 'api-tc-06',
      name: 'TC-06 API',
      description: 'Dịch vụ API thương mại',
      category: 'Machine Learning & AI',
      baseUrl: 'https://api.mycompany.io/v1',
      tags: ['production', 'api'],
      status: 'Draft',
    } as any);

    // Initial version in backend was 1.0.0
    vi.spyOn(providerApiModule, 'listProviderVersions').mockResolvedValue([
      { id: 'ver-existing-6', version: '1.0.0', changelog: 'Ban dau' } as any,
    ]);
    const updateVersionSpy = vi.spyOn(providerApiModule, 'updateProviderVersion').mockResolvedValue({ id: 'ver-existing-6' } as any);
    vi.spyOn(providerApiModule, 'listProviderPlans').mockResolvedValue([
      { id: 'plan-tc-06', name: 'Free', priceMonthly: 0, currency: 'USD', quota: 2000, rateLimit: 10 } as any,
    ]);

    render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4('TC-06 API');
    await acceptAgreementAndSubmit();
    await waitFor(() => expect(screen.getByText(/Initial failure/i)).toBeDefined());

    // Back from Step 4 to Step 3
    fireEvent.click(screen.getByRole('button', { name: /← (Back|Quay lại)/i }));
    await waitFor(() => screen.getByRole('button', { name: /Tiếp tục sang Pháp lý & Tuân thủ/i }));

    // Back from Step 3 to Step 2
    fireEvent.click(screen.getByRole('button', { name: /← (Back|Quay lại)/i }));
    await waitFor(() => screen.getByRole('button', { name: /Tiếp tục sang Gói Cước/i }));

    // Back from Step 2 to Step 1
    fireEvent.click(screen.getByRole('button', { name: /← (Back|Quay lại)/i }));
    await waitFor(() => screen.getByPlaceholderText('1.0.0'));

    fireEvent.change(screen.getByPlaceholderText('1.0.0'), { target: { value: '1.1.0' } });

    // Forward to Step 2
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục sang Định tuyến Upstream/i }));
    await waitFor(() => screen.getByRole('button', { name: /Tiếp tục sang Gói Cước/i }));

    // Forward to Step 3
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục sang Gói Cước/i }));
    await waitFor(() => screen.getByRole('button', { name: /Tiếp tục sang Pháp lý & Tuân thủ/i }));

    // Forward to Step 4
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục sang Pháp lý & Tuân thủ/i }));
    await waitFor(() => screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i }));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i }));
    });

    await waitFor(() => {
      expect(updateVersionSpy).toHaveBeenCalledWith('api-tc-06', 'ver-existing-6', {
        version: '1.1.0',
        changelog: 'Phiên bản khởi tạo ban đầu',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/provider/publishing-workflow?api=api-tc-06');
    });
  });

  it('TC-FE-RETRY-07: HTTP 409 with incompatible persisted data must not be treated as success', async () => {
    vi.spyOn(providerApiModule, 'createProviderApi').mockResolvedValue({ id: 'api-tc-07' } as any);
    vi.spyOn(providerApiModule, 'createProviderVersion').mockResolvedValue({ id: 'ver-tc-07' } as any);
    vi.spyOn(providerApiModule, 'createProviderPlan').mockResolvedValue({ id: 'plan-tc-07' } as any);
    vi.spyOn(providerApiModule, 'saveProviderLegal')
      .mockRejectedValueOnce(new Error('Pre-existing error'))
      .mockResolvedValueOnce({ id: 'legal-tc-07' } as any);

    vi.spyOn(providerApiModule, 'getProviderApi').mockResolvedValue({
      id: 'api-tc-07',
      name: 'TC-07 API',
      description: 'Dịch vụ API thương mại',
      category: 'Machine Learning & AI',
      baseUrl: '',
      tags: [],
      status: 'Draft',
    } as any);

    vi.spyOn(providerApiModule, 'listProviderVersions').mockResolvedValue([
      { id: 'ver-tc-07', version: '1.0.0' } as any,
    ]);

    // Backend plans returns an incompatible plan (e.g. quota 99999 vs user 2000)
    vi.spyOn(providerApiModule, 'listProviderPlans').mockResolvedValue([
      { id: 'plan-tc-07', name: 'Free', priceMonthly: 0, currency: 'USD', quota: 99999, rateLimit: 999 } as any,
    ]);

    // updateProviderPlan throws HTTP 409 Conflict
    const conflictError: any = new Error('HTTP 409 Conflict: Plan definition mismatch');
    conflictError.status = 409;
    vi.spyOn(providerApiModule, 'updateProviderPlan').mockRejectedValue(conflictError);

    render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4('TC-07 API');
    await acceptAgreementAndSubmit();
    await waitFor(() => expect(screen.getByText(/Pre-existing error/i)).toBeDefined());

    // Retry
    const finishBtn = screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i });
    await act(async () => {
      fireEvent.click(finishBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/Plan definition mismatch/i)).toBeDefined();
    });
    // Crucial: False-success navigation must NOT occur
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('TC-FE-RETRY-08: API synchronization failure prevents success navigation', async () => {
    vi.spyOn(providerApiModule, 'createProviderApi').mockResolvedValue({ id: 'api-tc-08' } as any);
    vi.spyOn(providerApiModule, 'createProviderVersion').mockResolvedValue({ id: 'ver-tc-08' } as any);
    vi.spyOn(providerApiModule, 'createProviderPlan').mockResolvedValue({ id: 'plan-tc-08' } as any);
    vi.spyOn(providerApiModule, 'saveProviderLegal')
      .mockRejectedValueOnce(new Error('Draft registered, legal failed'));

    vi.spyOn(providerApiModule, 'getProviderApi').mockResolvedValue({
      id: 'api-tc-08',
      name: 'Old Stale Name',
      description: 'Dịch vụ API thương mại',
      category: 'Machine Learning & AI',
      baseUrl: '',
      tags: [],
      status: 'Draft',
    } as any);

    // updateProviderApi rejects with network error
    vi.spyOn(providerApiModule, 'updateProviderApi').mockRejectedValue(new Error('Database lock timeout on API update'));

    render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4('Old Stale Name');
    await acceptAgreementAndSubmit();
    await waitFor(() => expect(screen.getByText(/Draft registered, legal failed/i)).toBeDefined());

    // Back to Step 1 and change name to trigger updateProviderApi
    fireEvent.click(screen.getByRole('button', { name: /← (Back|Quay lại)/i }));
    await waitFor(() => screen.getByRole('button', { name: /Tiếp tục sang Pháp lý & Tuân thủ/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /← (Back|Quay lại)/i })[0]);
    await waitFor(() => screen.getByRole('button', { name: /Tiếp tục sang Gói Cước/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /← (Back|Quay lại)/i })[0]);

    await waitFor(() => screen.getByPlaceholderText(/Ví dụ: Công cụ suy luận/i));
    fireEvent.change(screen.getByPlaceholderText(/Ví dụ: Công cụ suy luận/i), {
      target: { value: 'New Synchronized Name' },
    });

    // Advance to Step 4 and retry
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục sang Định tuyến Upstream/i }));
    await waitFor(() => screen.getByRole('button', { name: /Tiếp tục sang Gói Cước/i }));
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục sang Gói Cước/i }));
    await waitFor(() => screen.getByRole('button', { name: /Tiếp tục sang Pháp lý & Tuân thủ/i }));
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục sang Pháp lý & Tuân thủ/i }));

    await waitFor(() => screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/Database lock timeout on API update/i)).toBeDefined();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('TC-FE-RETRY-09: Plan synchronization failure prevents success navigation', async () => {
    vi.spyOn(providerApiModule, 'createProviderApi').mockResolvedValue({ id: 'api-tc-09' } as any);
    vi.spyOn(providerApiModule, 'createProviderVersion').mockResolvedValue({ id: 'ver-tc-09' } as any);
    vi.spyOn(providerApiModule, 'createProviderPlan').mockResolvedValue({ id: 'plan-tc-09' } as any);
    vi.spyOn(providerApiModule, 'saveProviderLegal')
      .mockRejectedValueOnce(new Error('Draft created'));

    vi.spyOn(providerApiModule, 'getProviderApi').mockResolvedValue({
      id: 'api-tc-09',
      name: 'TC-09 API',
      description: 'Dịch vụ API thương mại',
      category: 'Machine Learning & AI',
      baseUrl: '',
      tags: [],
      status: 'Draft',
    } as any);

    vi.spyOn(providerApiModule, 'listProviderVersions').mockResolvedValue([
      { id: 'ver-tc-09', version: '1.0.0' } as any,
    ]);

    // Backend plan has old quota
    vi.spyOn(providerApiModule, 'listProviderPlans').mockResolvedValue([
      { id: 'plan-tc-09', name: 'Free', priceMonthly: 0, currency: 'USD', quota: 1000, rateLimit: 5 } as any,
    ]);

    // Updating plan fails
    vi.spyOn(providerApiModule, 'updateProviderPlan').mockRejectedValue(new Error('Quota constraint violation on plan update'));

    render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4('TC-09 API');
    await acceptAgreementAndSubmit();
    await waitFor(() => expect(screen.getByText(/Draft created/i)).toBeDefined());

    // Retry
    const finishBtn = screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i });
    await act(async () => {
      fireEvent.click(finishBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/Quota constraint violation on plan update/i)).toBeDefined();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('TC-FE-RETRY-10: Agreement fetch failure blocks prohibited mutations', async () => {
    const createApiSpy = vi.spyOn(providerApiModule, 'createProviderApi');
    const updateApiSpy = vi.spyOn(providerApiModule, 'updateProviderApi');

    // Agreement rejects during submission
    vi.spyOn(providerApiModule, 'getProviderAgreement').mockRejectedValue(new Error('Agreement server down'));

    render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4('TC-10 API');

    await waitFor(() => {
      expect(screen.getByText(/Không thể tải Điều khoản Thỏa thuận Nhà cung cấp từ máy chủ/i)).toBeDefined();
    });

    const checkbox = screen.getByLabelText(/Tôi đã đọc/i) as HTMLInputElement;
    expect(checkbox.disabled).toBe(true);

    const finishBtn = screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i });
    expect(finishBtn.hasAttribute('disabled')).toBe(true);

    expect(createApiSpy).not.toHaveBeenCalled();
    expect(updateApiSpy).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('TC-FE-RETRY-11: Agreement version change forces valid re-consent', async () => {
    let agreementVersion = 'v2.1.0';
    vi.spyOn(providerApiModule, 'getProviderAgreement').mockImplementation(async () => ({
      ...validAgreement,
      version: agreementVersion,
    }));

    const createApiSpy = vi.spyOn(providerApiModule, 'createProviderApi').mockResolvedValue({ id: 'api-tc-11' } as any);

    render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4('TC-11 API');

    const checkbox = screen.getByLabelText(/Tôi đã đọc/i) as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    // Agreement updates to v2.2.0 on server
    agreementVersion = 'v2.2.0';

    const finishBtn = screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i });
    await act(async () => {
      fireEvent.click(finishBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/Thỏa thuận Nhà cung cấp đã được cập nhật phiên bản mới \(v2.2.0\)/i)).toBeDefined();
      const updatedCheckbox = screen.getByLabelText(/Tôi đã đọc/i) as HTMLInputElement;
      expect(updatedCheckbox.checked).toBe(false);
    });

    expect(createApiSpy).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('TC-FE-RETRY-12: Account switching during submission prevents cross-account mutations', async () => {
    const createApiSpy = vi.spyOn(providerApiModule, 'createProviderApi').mockResolvedValue({ id: 'api-tc-12' } as any);

    let resolveAgreement!: (val: any) => void;
    const pendingAgreement = new Promise(resolve => {
      resolveAgreement = resolve;
    });
    vi.spyOn(providerApiModule, 'getProviderAgreement').mockReturnValue(pendingAgreement as any);

    const { rerender } = render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4('TC-12 API');

    // Make initial agreement available for rendering
    await act(async () => {
      resolveAgreement(validAgreement);
    });

    const checkbox = screen.getByLabelText(/Tôi đã đọc/i) as HTMLInputElement;
    fireEvent.click(checkbox);

    // Setup another pending promise for submission check
    let resolveSubmissionCheck!: (val: any) => void;
    const pendingSubmissionAgreement = new Promise(resolve => {
      resolveSubmissionCheck = resolve;
    });
    vi.spyOn(providerApiModule, 'getProviderAgreement').mockReturnValue(pendingSubmissionAgreement as any);

    const finishBtn = screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i });
    fireEvent.click(finishBtn);

    // Account switch occurs during in-flight submission check
    await act(async () => {
      currentUserState = { ...mockUser, id: 'user-different-id', email: 'intruder@test.com' };
      rerender(
        <MemoryRouter>
          <CreateApiWizardPage />
        </MemoryRouter>
      );
    });

    // Complete in-flight agreement check
    await act(async () => {
      resolveSubmissionCheck(validAgreement);
    });

    // Mutation must be aborted
    expect(createApiSpy).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('TC-FE-RETRY-13: Repeated clicks cannot create duplicate resources', async () => {
    let resolveCreateApi!: (val: any) => void;
    const pendingCreateApi = new Promise(resolve => {
      resolveCreateApi = resolve;
    });

    const createApiSpy = vi.spyOn(providerApiModule, 'createProviderApi').mockReturnValue(pendingCreateApi as any);

    render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4('TC-13 API');
    const checkbox = screen.getByLabelText(/Tôi đã đọc/i) as HTMLInputElement;
    fireEvent.click(checkbox);

    const finishBtn = screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i });

    // Click 1
    fireEvent.click(finishBtn);

    // Button should now be disabled or showing submitting state
    await waitFor(() => {
      expect(screen.getByText('Đang tạo API...')).toBeDefined();
    });

    // Click 2 & 3 while in flight
    fireEvent.click(finishBtn);
    fireEvent.click(finishBtn);

    // Resolve create API call
    await act(async () => {
      resolveCreateApi({ id: 'api-tc-13' });
    });

    // Only one create call was made
    expect(createApiSpy).toHaveBeenCalledTimes(1);
  });

  it('TC-FE-RETRY-14: Ambiguous network failure is reconciled safely where supported', async () => {
    vi.spyOn(providerApiModule, 'createProviderApi').mockResolvedValue({ id: 'api-tc-14' } as any);

    // createProviderVersion throws ambiguous error, but recheck verifies version was actually created
    vi.spyOn(providerApiModule, 'createProviderVersion').mockRejectedValue(new Error('Connection reset by peer'));
    vi.spyOn(providerApiModule, 'listProviderVersions').mockResolvedValue([
      { id: 'ver-tc-14', version: '1.0.0', changelog: 'Phiên bản khởi tạo ban đầu' } as any,
    ]);

    const createPlanSpy = vi.spyOn(providerApiModule, 'createProviderPlan').mockResolvedValue({ id: 'plan-tc-14' } as any);
    const saveLegalSpy = vi.spyOn(providerApiModule, 'saveProviderLegal').mockResolvedValue({ id: 'legal-tc-14' } as any);

    render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4('TC-14 API');
    await acceptAgreementAndSubmit();

    await waitFor(() => {
      // Version recheck saved the workflow from crashing and proceeded to plan & legal
      expect(createPlanSpy).toHaveBeenCalledTimes(1);
      expect(saveLegalSpy).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/provider/publishing-workflow?api=api-tc-14');
    });
  });

  it('TC-FE-RETRY-15: Successful retry results in backend state matching the intended form', async () => {
    vi.spyOn(providerApiModule, 'createProviderApi').mockResolvedValue({ id: 'api-tc-15' } as any);
    vi.spyOn(providerApiModule, 'createProviderVersion').mockResolvedValue({ id: 'ver-tc-15' } as any);
    vi.spyOn(providerApiModule, 'createProviderPlan').mockResolvedValue({ id: 'plan-tc-15' } as any);
    vi.spyOn(providerApiModule, 'saveProviderLegal')
      .mockRejectedValueOnce(new Error('Temporary legal service 503'))
      .mockResolvedValueOnce({ id: 'legal-tc-15' } as any);

    vi.spyOn(providerApiModule, 'getProviderApi').mockResolvedValue({
      id: 'api-tc-15',
      name: 'Original Name',
      description: 'Dịch vụ API thương mại',
      category: 'Machine Learning & AI',
      baseUrl: 'https://api.mycompany.io/v1',
      tags: ['production', 'api'],
      status: 'Draft',
    } as any);

    const updateApiSpy = vi.spyOn(providerApiModule, 'updateProviderApi').mockResolvedValue({ id: 'api-tc-15' } as any);
    vi.spyOn(providerApiModule, 'listProviderVersions').mockResolvedValue([
      { id: 'ver-tc-15', version: '1.0.0' } as any,
    ]);
    vi.spyOn(providerApiModule, 'listProviderPlans').mockResolvedValue([
      { id: 'plan-tc-15', name: 'Free', priceMonthly: 0, currency: 'USD', quota: 2000, rateLimit: 10 } as any,
    ]);

    render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4('Original Name');
    await acceptAgreementAndSubmit();
    await waitFor(() => expect(screen.getByText(/Temporary legal service 503/i)).toBeDefined());

    // User navigates back, updates name to "Final Reconciled Name"
    // Back from Step 4 to Step 3
    fireEvent.click(screen.getByRole('button', { name: /← (Back|Quay lại)/i }));
    await waitFor(() => screen.getByRole('button', { name: /Tiếp tục sang Pháp lý & Tuân thủ/i }));

    // Back from Step 3 to Step 2
    fireEvent.click(screen.getByRole('button', { name: /← (Back|Quay lại)/i }));
    await waitFor(() => screen.getByRole('button', { name: /Tiếp tục sang Gói Cước/i }));

    // Back from Step 2 to Step 1
    fireEvent.click(screen.getByRole('button', { name: /← (Back|Quay lại)/i }));
    await waitFor(() => screen.getByPlaceholderText(/Ví dụ: Công cụ suy luận/i));

    fireEvent.change(screen.getByPlaceholderText(/Ví dụ: Công cụ suy luận/i), {
      target: { value: 'Final Reconciled Name' },
    });

    // Forward to Step 2
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục sang Định tuyến Upstream/i }));
    await waitFor(() => screen.getByRole('button', { name: /Tiếp tục sang Gói Cước/i }));

    // Forward to Step 3
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục sang Gói Cước/i }));
    await waitFor(() => screen.getByRole('button', { name: /Tiếp tục sang Pháp lý & Tuân thủ/i }));

    // Forward to Step 4
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục sang Pháp lý & Tuân thủ/i }));
    await waitFor(() => screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i }));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i }));
    });

    await waitFor(() => {
      expect(updateApiSpy).toHaveBeenCalledWith('api-tc-15', expect.objectContaining({
        name: 'Final Reconciled Name',
        baseUrl: 'https://api.mycompany.io/v1',
      }));
      expect(mockNavigate).toHaveBeenCalledWith('/provider/publishing-workflow?api=api-tc-15');
    });
  });

  it('TC-FE-RETRY-16: Cancellation/unmount prevents unsafe continuation', async () => {
    let resolveCreateApi!: (val: any) => void;
    const pendingCreateApi = new Promise(resolve => {
      resolveCreateApi = resolve;
    });

    vi.spyOn(providerApiModule, 'createProviderApi').mockReturnValue(pendingCreateApi as any);
    const saveLegalSpy = vi.spyOn(providerApiModule, 'saveProviderLegal');

    const { unmount } = render(
      <MemoryRouter>
        <CreateApiWizardPage />
      </MemoryRouter>
    );

    await advanceToStep4('TC-16 API');
    const checkbox = screen.getByLabelText(/Tôi đã đọc/i) as HTMLInputElement;
    fireEvent.click(checkbox);

    const finishBtn = screen.getByRole('button', { name: /Hoàn tất & Đăng ký API/i });
    fireEvent.click(finishBtn);

    // Unmount component while in-flight
    unmount();

    // Resolve async network call
    await act(async () => {
      resolveCreateApi({ id: 'api-tc-16' });
    });

    // Downstream mutations and navigation must be aborted by unmount check
    expect(saveLegalSpy).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

