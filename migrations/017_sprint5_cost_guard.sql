BEGIN;

CREATE TABLE cost_guard_budgets (
    consumer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    currency VARCHAR(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
    monthly_budget NUMERIC(14,2) NOT NULL CHECK (monthly_budget > 0),
    hard_cutoff BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (consumer_id, currency)
);

-- Store the plan snapshot at admission. NULL marks earlier usage whose historical
-- price cannot be reconstructed from a subscription that may have changed plans.
ALTER TABLE usage_outbox ADD COLUMN cost_currency VARCHAR(3),
    ADD COLUMN estimated_cost NUMERIC(28,12);
ALTER TABLE usage_logs ADD COLUMN cost_currency VARCHAR(3),
    ADD COLUMN estimated_cost NUMERIC(28,12);

CREATE INDEX idx_usage_outbox_consumer_time ON usage_outbox (consumer_id, occurred_at);
COMMIT;
