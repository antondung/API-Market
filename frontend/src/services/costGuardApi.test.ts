import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  validateBudgetAmount,
  getCostGuardSummary,
  updateCostGuardBudget,
} from './costGuardApi';
import * as authApi from './authApi';

vi.mock('./authApi', () => ({
  authenticatedRequest: vi.fn(),
}));

describe('costGuardApi service & validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateBudgetAmount', () => {
    it('rejects empty, null or undefined input', () => {
      expect(validateBudgetAmount('')).toContain('Vui lòng nhập');
      expect(validateBudgetAmount('   ')).toContain('Vui lòng nhập');
      expect(validateBudgetAmount(null as unknown as string)).toContain('Vui lòng nhập');
    });

    it('rejects zero amounts', () => {
      expect(validateBudgetAmount('0')).toContain('lớn hơn 0');
      expect(validateBudgetAmount('0.00')).toContain('lớn hơn 0');
      expect(validateBudgetAmount('0.0')).toContain('lớn hơn 0');
    });

    it('rejects negative amounts and invalid formats', () => {
      expect(validateBudgetAmount('-10')).toContain('số dương hợp lệ');
      expect(validateBudgetAmount('abc')).toContain('số dương hợp lệ');
      expect(validateBudgetAmount('10.999')).toContain('tối đa 2 chữ số');
      expect(validateBudgetAmount('10,50')).toContain('số dương hợp lệ');
    });

    it('accepts valid positive integer and 2-decimal amounts', () => {
      expect(validateBudgetAmount('10')).toBeNull();
      expect(validateBudgetAmount('0.01')).toBeNull();
      expect(validateBudgetAmount('30.00')).toBeNull();
      expect(validateBudgetAmount('1000.5')).toBeNull();
      expect(validateBudgetAmount('999999999999.99')).toBeNull();
    });
  });

  describe('getCostGuardSummary', () => {
    it('calls GET /api/consumer/cost-guard and returns unwrapped data', async () => {
      const mockSummary = {
        periodStart: '2026-11-01',
        periodEndExclusive: '2026-12-01',
        unpricedRequests: '0',
        currencies: [
          {
            currency: 'USD',
            estimatedSpend: '15.50',
            monthlyBudget: '30.00',
            hardCutoff: true,
            spentPercent: 51.67,
            settledSandboxCharges: '5.00',
            reachedThresholds: [50],
          },
        ],
      };

      vi.mocked(authApi.authenticatedRequest).mockResolvedValueOnce({
        data: mockSummary,
      });

      const res = await getCostGuardSummary();
      expect(authApi.authenticatedRequest).toHaveBeenCalledWith(
        '/api/consumer/cost-guard',
        expect.objectContaining({ method: 'GET' })
      );
      expect(res).toEqual(mockSummary);
    });
  });

  describe('updateCostGuardBudget', () => {
    it('sends PUT with normalized currency, budget, and hardCutoff', async () => {
      const mockUpdated = {
        periodStart: '2026-11-01',
        periodEndExclusive: '2026-12-01',
        unpricedRequests: '0',
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

      vi.mocked(authApi.authenticatedRequest).mockResolvedValueOnce({
        data: mockUpdated,
      });

      const res = await updateCostGuardBudget({
        currency: 'usd',
        monthlyBudget: '50.00',
        hardCutoff: true,
      });

      expect(authApi.authenticatedRequest).toHaveBeenCalledWith(
        '/api/consumer/cost-guard',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            currency: 'USD',
            monthlyBudget: '50.00',
            hardCutoff: true,
          }),
        })
      );
      expect(res).toEqual(mockUpdated);
    });
  });
});
