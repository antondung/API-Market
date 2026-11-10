import { authenticatedRequest } from './authApi';

export interface CostGuardCurrencyBudget {
  currency: string;
  estimatedSpend: string;
  monthlyBudget: string | null;
  hardCutoff: boolean;
  spentPercent: number | null;
  settledSandboxCharges: string;
  reachedThresholds: number[];
}

export interface CostGuardSummary {
  periodStart: string;
  periodEndExclusive: string;
  unpricedRequests: string;
  currencies: CostGuardCurrencyBudget[];
}

export interface CostGuardBudgetInput {
  currency: string;
  monthlyBudget: string;
  hardCutoff?: boolean;
}

/**
 * Validates budget amount string against backend contract:
 * Positive number, max 12 digits integer, max 2 decimals, strictly > 0.
 */
export function validateBudgetAmount(value: string): string | null {
  const trimmed = (value ?? '').trim();
  if (!trimmed) {
    return 'Vui lòng nhập ngân sách.';
  }
  const regex = /^(?:0|[1-9]\d{0,11})(?:\.\d{1,2})?$/;
  if (!regex.test(trimmed)) {
    return 'Ngân sách phải là số dương hợp lệ, tối đa 2 chữ số thập phân.';
  }
  if (!/[1-9]/.test(trimmed)) {
    return 'Ngân sách phải lớn hơn 0.';
  }
  return null;
}

/**
 * Fetches Cost Guard budget summary and spend status for current UTC month.
 */
export async function getCostGuardSummary(signal?: AbortSignal): Promise<CostGuardSummary> {
  const res = await authenticatedRequest<{ data: CostGuardSummary }>('/api/consumer/cost-guard', {
    method: 'GET',
    signal,
  });
  return res.data;
}

/**
 * Sets or updates monthly budget for a specific currency.
 * Returns the fresh CostGuardSummary from backend.
 */
export async function updateCostGuardBudget(
  input: CostGuardBudgetInput,
  signal?: AbortSignal
): Promise<CostGuardSummary> {
  const res = await authenticatedRequest<{ data: CostGuardSummary }>('/api/consumer/cost-guard', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      currency: input.currency.trim().toUpperCase(),
      monthlyBudget: input.monthlyBudget.trim(),
      hardCutoff: Boolean(input.hardCutoff),
    }),
    signal,
  });
  return res.data;
}
