import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CostGuardPage } from './CostGuardPage';
import * as costGuardApi from '../../services/costGuardApi';
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
      expect(costGuardApi.updateCostGuardBudget).toHaveBeenCalledWith({
        currency: 'USD',
        monthlyBudget: '50.00',
        hardCutoff: true,
      });
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
});
