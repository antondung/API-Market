import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CostGuardPage } from './CostGuardPage';
import * as costGuardApi from '../../services/costGuardApi';
import * as AuthContextModule from '../../context/AuthContext';
import type { AuthContextType } from '../../context/AuthContext';
import { AppProvider } from '../../context/AppContext';

vi.mock('../../i18n', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock('../../services/costGuardApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/costGuardApi')>();
  return {
    ...actual,
    getCostGuardSummary: vi.fn(),
    updateCostGuardBudget: vi.fn(),
  };
});

const mockSummaryEmptyBudget: costGuardApi.CostGuardSummary = {
  periodStart: '2026-11-01',
  periodEndExclusive: '2026-12-01',
  unpricedRequests: '0',
  currencies: [
    {
      currency: 'USD',
      estimatedSpend: '0.00',
      monthlyBudget: null,
      hardCutoff: false,
      spentPercent: null,
      settledSandboxCharges: '0.00',
      reachedThresholds: [],
    },
  ],
};

const mockSummaryActiveBudget: costGuardApi.CostGuardSummary = {
  periodStart: '2026-11-01',
  periodEndExclusive: '2026-12-01',
  unpricedRequests: '15',
  currencies: [
    {
      currency: 'USD',
      estimatedSpend: '24.50',
      monthlyBudget: '30.00',
      hardCutoff: true,
      spentPercent: 81.67,
      settledSandboxCharges: '5.00',
      reachedThresholds: [50, 80],
    },
    {
      currency: 'VND',
      estimatedSpend: '50000',
      monthlyBudget: '100000',
      hardCutoff: false,
      spentPercent: 50.0,
      settledSandboxCharges: '0',
      reachedThresholds: [50],
    },
  ],
};

describe('CostGuardPage Component (US-32 & TC-CST)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton and then empty budget state correctly', async () => {
    vi.mocked(costGuardApi.getCostGuardSummary).mockResolvedValue(mockSummaryEmptyBudget);

    render(
      <AppProvider>
        <CostGuardPage />
      </AppProvider>
    );

    // Initial skeleton
    expect(screen.getByTestId('cost-guard-skeleton')).toBeDefined();

    // After load
    await waitFor(() => {
      expect(screen.queryByTestId('cost-guard-skeleton')).toBeNull();
    });

    expect(screen.getByText('Chưa thiết lập ngân sách')).toBeDefined();
    expect(screen.getByText('2026-11-01 → 2026-12-01 (UTC)')).toBeDefined();
  });

  it('displays real budget, spend, sandbox charges, and unpriced banner', async () => {
    vi.mocked(costGuardApi.getCostGuardSummary).mockResolvedValue(mockSummaryActiveBudget);

    render(
      <AppProvider>
        <CostGuardPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('cost-guard-skeleton')).toBeNull();
    });

    // Monthly budget & spend rendered without floating point distortion
    expect(screen.getByText('30 USD')).toBeDefined();
    expect(screen.getByText('24,5 USD')).toBeDefined();
    expect(screen.getAllByText(/81\.67%/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('5 USD')).toBeDefined();

    // Unpriced banner
    expect(screen.getByText('Thông tin bản ghi lịch sử')).toBeDefined();
    expect(screen.getByText(/15 request từ các phiên bản trước/)).toBeDefined();

    // Hard cutoff is ON
    expect(screen.getByText('Đang BẬT')).toBeDefined();

    // Thresholds: 50 and 80 are active
    const badges = screen.getAllByText('Đã kích hoạt');
    expect(badges.length).toBe(2);
  });

  it('validates budget amount before submitting PUT', async () => {
    vi.mocked(costGuardApi.getCostGuardSummary).mockResolvedValue(mockSummaryEmptyBudget);

    render(
      <AppProvider>
        <CostGuardPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('cost-guard-skeleton')).toBeNull();
    });

    // Submit with empty input
    fireEvent.submit(screen.getByTestId('cost-guard-form'));
    await waitFor(() => {
      expect(screen.getByText('Vui lòng nhập ngân sách.')).toBeDefined();
    });
    expect(costGuardApi.updateCostGuardBudget).not.toHaveBeenCalled();

    // Enter 0
    const budgetInput = screen.getByLabelText(/Hạn mức ngân sách tháng/i);
    fireEvent.change(budgetInput, { target: { value: '0' } });
    fireEvent.submit(screen.getByTestId('cost-guard-form'));
    await waitFor(() => {
      expect(screen.getByText('Ngân sách phải lớn hơn 0.')).toBeDefined();
    });
    expect(costGuardApi.updateCostGuardBudget).not.toHaveBeenCalled();

    // Enter negative
    fireEvent.change(screen.getByLabelText(/Hạn mức ngân sách tháng/i), { target: { value: '-20' } });
    fireEvent.submit(screen.getByTestId('cost-guard-form'));
    await waitFor(() => {
      expect(screen.getByText('Ngân sách phải là số dương hợp lệ, tối đa 2 chữ số thập phân.')).toBeDefined();
    });
    expect(costGuardApi.updateCostGuardBudget).not.toHaveBeenCalled();

    // Enter more than 2 decimals
    fireEvent.change(screen.getByLabelText(/Hạn mức ngân sách tháng/i), { target: { value: '25.999' } });
    fireEvent.submit(screen.getByTestId('cost-guard-form'));
    await waitFor(() => {
      expect(screen.getByText('Ngân sách phải là số dương hợp lệ, tối đa 2 chữ số thập phân.')).toBeDefined();
    });
    expect(costGuardApi.updateCostGuardBudget).not.toHaveBeenCalled();
  });

  it('saves budget successfully and updates summary with fresh backend data', async () => {
    vi.mocked(costGuardApi.getCostGuardSummary).mockResolvedValue(mockSummaryEmptyBudget);
    const updatedSummary: costGuardApi.CostGuardSummary = {
      ...mockSummaryEmptyBudget,
      currencies: [
        {
          currency: 'USD',
          estimatedSpend: '0.00',
          monthlyBudget: '50.00',
          hardCutoff: true,
          spentPercent: 0,
          settledSandboxCharges: '0.00',
          reachedThresholds: [],
        },
      ],
    };
    vi.mocked(costGuardApi.updateCostGuardBudget).mockResolvedValue(updatedSummary);

    render(
      <AppProvider>
        <CostGuardPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('cost-guard-skeleton')).toBeNull();
    });

    const budgetInput = screen.getByLabelText(/Hạn mức ngân sách tháng/i);
    fireEvent.change(budgetInput, { target: { value: '50.00' } });

    const hardCutoffCheckbox = screen.getByLabelText(/Kích hoạt ngắt cứng/i);
    fireEvent.click(hardCutoffCheckbox);

    const form = screen.getByTestId('cost-guard-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(costGuardApi.updateCostGuardBudget).toHaveBeenCalledWith(
        {
          currency: 'USD',
          monthlyBudget: '50.00',
          hardCutoff: true,
        },
        expect.any(AbortSignal)
      );
      expect(screen.getByText('Cập nhật ngân sách thành công!')).toBeDefined();
    });

    // Updated budget rendered in summary cards
    await waitFor(() => {
      expect(screen.getByText('50 USD')).toBeDefined();
    });
  });

  it('renders 100% threshold warning and explains Gateway behavior based on hardCutoff', async () => {
    const mock100Summary: costGuardApi.CostGuardSummary = {
      periodStart: '2026-11-01',
      periodEndExclusive: '2026-12-01',
      unpricedRequests: '0',
      currencies: [
        {
          currency: 'USD',
          estimatedSpend: '35.00',
          monthlyBudget: '30.00',
          hardCutoff: true,
          spentPercent: 116.67,
          settledSandboxCharges: '0.00',
          reachedThresholds: [50, 80, 100],
        },
      ],
    };

    vi.mocked(costGuardApi.getCostGuardSummary).mockResolvedValue(mock100Summary);

    render(
      <AppProvider>
        <CostGuardPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('cost-guard-skeleton')).toBeNull();
    });

    // Progress bar width is capped at 100%
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar.style.width).toBe('100%');

    // Real percentage is displayed
    expect(screen.getAllByText(/116\.67%/).length).toBeGreaterThanOrEqual(1);

    // 100% threshold card with hardCutoff=true
    await waitFor(() => {
      expect(screen.getByText('Đã chạm trần')).toBeDefined();
      expect(screen.getAllByText(/HTTP 429 BUDGET_EXHAUSTED/).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders error state and handles Retry', async () => {
    vi.mocked(costGuardApi.getCostGuardSummary).mockRejectedValue(new Error('Network error'));

    render(
      <AppProvider>
        <CostGuardPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeDefined();
    });

    // Now mock success for retry
    vi.mocked(costGuardApi.getCostGuardSummary).mockResolvedValue(mockSummaryEmptyBudget);

    const retryBtn = screen.getByRole('button', { name: /Thử lại/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Chưa thiết lập ngân sách')).toBeDefined();
    });
  });

  it('switches currency without mixing USD and VND', async () => {
    vi.mocked(costGuardApi.getCostGuardSummary).mockResolvedValue(mockSummaryActiveBudget);

    render(
      <AppProvider>
        <CostGuardPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('cost-guard-skeleton')).toBeNull();
    });

    expect(screen.getByText('30 USD')).toBeDefined();

    const currencySelect = screen.getByLabelText(/Đơn vị tiền tệ:/i);
    fireEvent.change(currencySelect, { target: { value: 'VND' } });

    // Should switch to VND metrics
    await waitFor(() => {
      expect(screen.getByText('100.000 VND')).toBeDefined();
      expect(screen.getByText('50.000 VND')).toBeDefined();
    });
  });

  it('allows fresh accounts with no prior budgets to select VND, enter monthlyBudget, and PUT successfully', async () => {
    const mockEmptyCurrenciesSummary: costGuardApi.CostGuardSummary = {
      periodStart: '2026-11-01',
      periodEndExclusive: '2026-12-01',
      unpricedRequests: '0',
      currencies: [],
    };

    vi.mocked(costGuardApi.getCostGuardSummary).mockResolvedValue(mockEmptyCurrenciesSummary);
    vi.mocked(costGuardApi.updateCostGuardBudget).mockResolvedValue({
      periodStart: '2026-11-01',
      periodEndExclusive: '2026-12-01',
      unpricedRequests: '0',
      currencies: [
        {
          currency: 'VND',
          estimatedSpend: '0',
          monthlyBudget: '5000000',
          hardCutoff: false,
          spentPercent: 0,
          settledSandboxCharges: '0',
          reachedThresholds: [],
        },
      ],
    });

    render(
      <AppProvider>
        <CostGuardPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('cost-guard-skeleton')).toBeNull();
    });

    // Select VND from availableCurrencies
    const currencySelect = screen.getByLabelText(/Đơn vị tiền tệ:/i);
    fireEvent.change(currencySelect, { target: { value: 'VND' } });

    const budgetInput = screen.getByLabelText(/Hạn mức ngân sách tháng/i);
    fireEvent.change(budgetInput, { target: { value: '5000000' } });

    const form = screen.getByTestId('cost-guard-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(costGuardApi.updateCostGuardBudget).toHaveBeenCalledWith(
        {
          currency: 'VND',
          monthlyBudget: '5000000',
          hardCutoff: false,
        },
        expect.any(AbortSignal)
      );
      expect(screen.getByText('Cập nhật ngân sách thành công!')).toBeDefined();
    });
  });

  it('correctly clamps aria-valuenow to [0, 100] and presents actual percent via aria-valuetext (0%, 50%, 100%, 150%)', async () => {
    const makeSummary = (percent: number | null): costGuardApi.CostGuardSummary => ({
      periodStart: '2026-11-01',
      periodEndExclusive: '2026-12-01',
      unpricedRequests: '0',
      currencies: [
        {
          currency: 'USD',
          estimatedSpend: percent ? `${percent}` : '0',
          monthlyBudget: '100',
          hardCutoff: false,
          spentPercent: percent,
          settledSandboxCharges: '0',
          reachedThresholds: percent && percent >= 50 ? [50] : [],
        },
      ],
    });

    // 0%
    vi.mocked(costGuardApi.getCostGuardSummary).mockResolvedValueOnce(makeSummary(0));
    const { unmount } = render(
      <AppProvider>
        <CostGuardPage />
      </AppProvider>
    );
    await waitFor(() => {
      const bar = screen.getByRole('progressbar');
      expect(bar.getAttribute('aria-valuenow')).toBe('0');
      expect(bar.getAttribute('aria-valuemin')).toBe('0');
      expect(bar.getAttribute('aria-valuemax')).toBe('100');
      expect(bar.getAttribute('aria-valuetext')).toBe('0%');
      expect(bar.style.width).toBe('0%');
    });
    unmount();

    // 50%
    vi.mocked(costGuardApi.getCostGuardSummary).mockResolvedValueOnce(makeSummary(50));
    const render50 = render(
      <AppProvider>
        <CostGuardPage />
      </AppProvider>
    );
    await waitFor(() => {
      const bar = screen.getByRole('progressbar');
      expect(bar.getAttribute('aria-valuenow')).toBe('50');
      expect(bar.getAttribute('aria-valuemin')).toBe('0');
      expect(bar.getAttribute('aria-valuemax')).toBe('100');
      expect(bar.getAttribute('aria-valuetext')).toBe('50%');
      expect(bar.style.width).toBe('50%');
    });
    render50.unmount();

    // 100%
    vi.mocked(costGuardApi.getCostGuardSummary).mockResolvedValueOnce(makeSummary(100));
    const render100 = render(
      <AppProvider>
        <CostGuardPage />
      </AppProvider>
    );
    await waitFor(() => {
      const bar = screen.getByRole('progressbar');
      expect(bar.getAttribute('aria-valuenow')).toBe('100');
      expect(bar.getAttribute('aria-valuemin')).toBe('0');
      expect(bar.getAttribute('aria-valuemax')).toBe('100');
      expect(bar.getAttribute('aria-valuetext')).toBe('100%');
      expect(bar.style.width).toBe('100%');
    });
    render100.unmount();

    // 150%
    vi.mocked(costGuardApi.getCostGuardSummary).mockResolvedValueOnce(makeSummary(150));
    const render150 = render(
      <AppProvider>
        <CostGuardPage />
      </AppProvider>
    );
    await waitFor(() => {
      const bar = screen.getByRole('progressbar');
      // aria-valuenow is clamped to 100 max
      expect(bar.getAttribute('aria-valuenow')).toBe('100');
      expect(bar.getAttribute('aria-valuemin')).toBe('0');
      expect(bar.getAttribute('aria-valuemax')).toBe('100');
      // aria-valuetext preserves the actual 150%
      expect(bar.getAttribute('aria-valuetext')).toBe('150%');
      expect(bar.style.width).toBe('100%');
    });
    render150.unmount();
  });

  it('prevents stale Retry or fetch response from overwriting newer response', async () => {
    let resolveFirst: ((val: costGuardApi.CostGuardSummary) => void) | null = null;
    let callCount = 0;

    vi.mocked(costGuardApi.getCostGuardSummary).mockImplementation((signal) => {
      callCount++;
      if (callCount === 1) {
        return new Promise((resolve, reject) => {
          resolveFirst = resolve;
          signal?.addEventListener('abort', () => reject(new Error('Aborted')));
        });
      }
      return Promise.resolve(mockSummaryActiveBudget);
    });

    const authSpy = vi.spyOn(AuthContextModule, 'useOptionalAuth').mockReturnValue({
      currentUser: { id: 'usr_1', email: 'u1@example.com', name: 'User 1', role: 'Consumer' },
    } as unknown as AuthContextType);

    const { rerender } = render(
      <AppProvider>
        <CostGuardPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(callCount).toBe(1);
    });

    // Switch user or trigger subsequent fetch
    authSpy.mockReturnValue({
      currentUser: { id: 'usr_2', email: 'u2@example.com', name: 'User 2', role: 'Consumer' },
    } as unknown as AuthContextType);

    rerender(
      <AppProvider>
        <CostGuardPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('30 USD')).toBeDefined();
    });

    // Now resolve first request late with stale empty data
    if (resolveFirst) {
      try {
        (resolveFirst as (val: costGuardApi.CostGuardSummary) => void)(mockSummaryEmptyBudget);
      } catch {
        // Ignored
      }
    }

    // Must still retain newer data (30 USD), NOT stale empty budget
    await waitFor(() => {
      expect(screen.getByText('30 USD')).toBeDefined();
      expect(screen.queryByText('Chưa thiết lập ngân sách')).toBeNull();
    });
  });

  it('aborts and drops PUT response if account changes while request is in-flight', async () => {
    vi.mocked(costGuardApi.getCostGuardSummary).mockResolvedValue(mockSummaryEmptyBudget);

    let resolveSave: ((val: costGuardApi.CostGuardSummary) => void) | null = null;
    vi.mocked(costGuardApi.updateCostGuardBudget).mockImplementation((_payload, signal) => {
      return new Promise((resolve, reject) => {
        resolveSave = resolve;
        signal?.addEventListener('abort', () => reject(new Error('Aborted')));
      });
    });

    const authSpy = vi.spyOn(AuthContextModule, 'useOptionalAuth').mockReturnValue({
      currentUser: { id: 'usr_alice', email: 'alice@example.com', name: 'Alice', role: 'Consumer' },
    } as unknown as AuthContextType);

    const { rerender } = render(
      <AppProvider>
        <CostGuardPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('cost-guard-skeleton')).toBeNull();
    });

    const budgetInput = screen.getByLabelText(/Hạn mức ngân sách tháng/i);
    fireEvent.change(budgetInput, { target: { value: '100.00' } });
    fireEvent.submit(screen.getByTestId('cost-guard-form'));

    // Switch account to Bob while save is in-flight
    authSpy.mockReturnValue({
      currentUser: { id: 'usr_bob', email: 'bob@example.com', name: 'Bob', role: 'Consumer' },
    } as unknown as AuthContextType);

    rerender(
      <AppProvider>
        <CostGuardPage />
      </AppProvider>
    );

    // Resolve Alice's save late
    if (resolveSave) {
      try {
        (resolveSave as (val: costGuardApi.CostGuardSummary) => void)({
          ...mockSummaryEmptyBudget,
          currencies: [
            {
              currency: 'USD',
              estimatedSpend: '0',
              monthlyBudget: '100.00',
              hardCutoff: false,
              spentPercent: 0,
              settledSandboxCharges: '0',
              reachedThresholds: [],
            },
          ],
        });
      } catch {
        // Aborted
      }
    }

    // Success alert for Alice must NOT be displayed on Bob's session
    expect(screen.queryByText('Cập nhật ngân sách thành công!')).toBeNull();
  });

  it('does not display success alert for old currency if user switches currency while save is in-flight', async () => {
    vi.mocked(costGuardApi.getCostGuardSummary).mockResolvedValue(mockSummaryActiveBudget);

    let resolveSave: ((val: costGuardApi.CostGuardSummary) => void) | null = null;
    vi.mocked(costGuardApi.updateCostGuardBudget).mockImplementation((_payload, signal) => {
      return new Promise((resolve, reject) => {
        resolveSave = resolve;
        signal?.addEventListener('abort', () => reject(new Error('Aborted')));
      });
    });

    render(
      <AppProvider>
        <CostGuardPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('cost-guard-skeleton')).toBeNull();
    });

    const budgetInput = screen.getByLabelText(/Hạn mức ngân sách tháng/i);
    fireEvent.change(budgetInput, { target: { value: '99.00' } });
    fireEvent.submit(screen.getByTestId('cost-guard-form'));

    // Switch currency to VND while USD save is in-flight
    const currencySelect = screen.getByLabelText(/Đơn vị tiền tệ:/i);
    fireEvent.change(currencySelect, { target: { value: 'VND' } });

    // Resolve USD save
    if (resolveSave) {
      (resolveSave as (val: costGuardApi.CostGuardSummary) => void)({
        ...mockSummaryActiveBudget,
        currencies: [
          {
            currency: 'USD',
            estimatedSpend: '24.50',
            monthlyBudget: '99.00',
            hardCutoff: true,
            spentPercent: 24.75,
            settledSandboxCharges: '5.00',
            reachedThresholds: [],
          },
          mockSummaryActiveBudget.currencies[1],
        ],
      });
    }

    // When viewing VND, USD save success message must not display
    await waitFor(() => {
      expect(screen.queryByText('Cập nhật ngân sách thành công!')).toBeNull();
    });
  });
});
