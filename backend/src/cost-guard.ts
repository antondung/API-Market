import type { Pool, PoolClient } from 'pg';
import { z } from 'zod';
import { ApiError } from './auth.js';

const amount = z.union([z.string(), z.number().finite().transform(String)])
  .pipe(z.string().regex(/^(?:0|[1-9]\d{0,11})(?:\.\d{1,2})?$/)
    .refine(value => /[1-9]/.test(value), 'Monthly budget must be positive'));
export const budgetInput = z.union([
  z.object({ currency: z.string().regex(/^[A-Z]{3}$/), monthlyBudget: amount, hardCutoff: z.boolean().default(false) }).strict(),
  z.object({ monthlyBudgetUsd: amount, hardCutoff: z.boolean().default(false) }).strict()
    .transform(value => ({ currency: 'USD', monthlyBudget: value.monthlyBudgetUsd, hardCutoff: value.hardCutoff })),
]);

const monthlyEvents = (timestamp: string) => `WITH period AS (
  SELECT date_trunc('month', ${timestamp} AT TIME ZONE 'UTC') AS start_at
), events AS (
  SELECT cost_currency, estimated_cost FROM usage_logs, period
  WHERE consumer_id=$1 AND NOT is_sandbox AND occurred_at >= start_at AT TIME ZONE 'UTC'
    AND occurred_at < (start_at + INTERVAL '1 month') AT TIME ZONE 'UTC'
  UNION ALL
  SELECT cost_currency, estimated_cost FROM usage_outbox, period
  WHERE consumer_id=$1 AND occurred_at >= start_at AT TIME ZONE 'UTC'
    AND occurred_at < (start_at + INTERVAL '1 month') AT TIME ZONE 'UTC'
)`;

/** Hold a currency budget row until reservation and its outbox write commit. */
export async function checkCostBudget(client: PoolClient, userId: string, price: { amount: string; currency: string; quota: string }, occurredAt: Date) {
  if (Number(price.amount) === 0) return;
  const budget = (await client.query(
    'SELECT monthly_budget,hard_cutoff FROM cost_guard_budgets WHERE consumer_id=$1 AND currency=$2 FOR UPDATE',
    [userId, price.currency],
  )).rows[0];
  if (!budget?.hard_cutoff) return;
  const { blocked } = (await client.query(
    `${monthlyEvents("$6::timestamptz")}
     SELECT ROUND(COALESCE(SUM(estimated_cost),0),2) >= $3::numeric OR
       ROUND(COALESCE(SUM(estimated_cost),0) + ROUND($4::numeric / $5::numeric,12),2) > $3::numeric AS blocked
     FROM events WHERE cost_currency=$2`,
    [userId, price.currency, budget.monthly_budget, price.amount, price.quota, occurredAt],
  )).rows[0];
  if (blocked) throw new ApiError(429, 'BUDGET_EXHAUSTED', 'Monthly spending budget reached');
}

export class CostGuard {
  constructor(readonly pool: Pool) {}

  async setBudget(userId: string, input: z.infer<typeof budgetInput>) {
    await this.pool.query(
      `INSERT INTO cost_guard_budgets(consumer_id,currency,monthly_budget,hard_cutoff) VALUES($1,$2,$3,$4)
       ON CONFLICT (consumer_id,currency) DO UPDATE
       SET monthly_budget=EXCLUDED.monthly_budget, hard_cutoff=EXCLUDED.hard_cutoff, updated_at=NOW()`,
      [userId, input.currency, input.monthlyBudget, input.hardCutoff],
    );
    return this.summary(userId);
  }

  async summary(userId: string) {
    const result = await this.pool.query(
      `${monthlyEvents("NOW()")}, spend AS (
         SELECT cost_currency AS currency, ROUND(SUM(estimated_cost),2) AS amount
         FROM events WHERE estimated_cost IS NOT NULL GROUP BY cost_currency
       ), budgets AS (
         SELECT currency, monthly_budget, hard_cutoff FROM cost_guard_budgets WHERE consumer_id=$1
       ), charges AS (
         SELECT t.currency, SUM(t.amount) AS amount
         FROM transactions t JOIN subscriptions s ON s.id=t.subscription_id CROSS JOIN period
         WHERE s.consumer_id=$1 AND t.type='Charge' AND t.status='Succeeded'
           AND t.occurred_at >= start_at AT TIME ZONE 'UTC'
           AND t.occurred_at < (start_at + INTERVAL '1 month') AT TIME ZONE 'UTC'
         GROUP BY t.currency
       ), totals AS (
         SELECT currency, COALESCE(spend.amount,0) AS amount, monthly_budget,
                COALESCE(hard_cutoff,false) AS hard_cutoff, COALESCE(charges.amount,0) AS settled
         FROM spend FULL JOIN budgets USING(currency) FULL JOIN charges USING(currency)
       )
       SELECT to_char(start_at,'YYYY-MM-DD') AS "periodStart",
              to_char(start_at + INTERVAL '1 month','YYYY-MM-DD') AS "periodEndExclusive",
              (SELECT COUNT(*)::text FROM events WHERE estimated_cost IS NULL) AS "unpricedRequests",
              COALESCE((SELECT jsonb_agg(jsonb_build_object(
                'currency',currency,'estimatedSpend',amount::text,
                'monthlyBudget',monthly_budget::text,'hardCutoff',hard_cutoff,'settledSandboxCharges',settled::text,
                'spentPercent',ROUND(amount * 100 / monthly_budget,2),
                'reachedThresholds',ARRAY(SELECT t FROM unnest(ARRAY[50,80,100]) t
                  WHERE monthly_budget IS NOT NULL AND amount * 100 >= monthly_budget * t ORDER BY t)
              ) ORDER BY currency) FROM totals), '[]'::jsonb) AS currencies
       FROM period`,
      [userId],
    );
    return result.rows[0];
  }
}
