BEGIN;

-- Sprint 5 / Issue #24 (EN-12, US-31, US-32): hot-query indexes and
-- pre-aggregated, currency-safe analytics. This migration is additive so a
-- production rollback can keep the old application online.
CREATE INDEX idx_subscriptions_consumer_api_recent
    ON subscriptions (consumer_id, api_id, id DESC)
    INCLUDE (status, quota_used, quota_limit, current_period_start, current_period_end);

CREATE INDEX idx_transactions_charge_success_time
    ON transactions (occurred_at DESC, subscription_id)
    INCLUDE (amount, currency)
    WHERE type = 'Charge' AND status = 'Succeeded';

CREATE INDEX idx_usage_logs_consumer_api_time
    ON usage_logs (consumer_id, api_id, occurred_at DESC, id DESC);

ALTER TABLE provider_daily_aggregates
    ADD COLUMN total_latency_ms BIGINT NOT NULL DEFAULT 0;

CREATE TABLE provider_revenue_daily_aggregates (
    usage_date DATE NOT NULL,
    provider_id INTEGER NOT NULL REFERENCES api_providers(id) ON DELETE RESTRICT,
    api_id INTEGER NOT NULL REFERENCES apis(id) ON DELETE RESTRICT,
    currency VARCHAR(3) NOT NULL,
    amount NUMERIC(18,2) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usage_date, provider_id, api_id, currency),
    CONSTRAINT chk_provider_revenue_currency CHECK (currency ~ '^[A-Z]{3}$'),
    CONSTRAINT chk_provider_revenue_amount CHECK (amount >= 0)
);
CREATE INDEX idx_provider_revenue_provider_date
    ON provider_revenue_daily_aggregates (provider_id, usage_date DESC, api_id);

CREATE OR REPLACE FUNCTION refresh_usage_aggregates(p_from DATE, p_to DATE)
RETURNS VOID AS $$
BEGIN
    IF p_from IS NULL OR p_to IS NULL OR p_to < p_from THEN
        RAISE EXCEPTION 'Invalid aggregate date range';
    END IF;
    PERFORM pg_advisory_xact_lock(913004);

    DELETE FROM usage_daily_aggregates WHERE usage_date BETWEEN p_from AND p_to;
    INSERT INTO usage_daily_aggregates
    SELECT l.occurred_at::date, l.consumer_id, l.api_id,
           COALESCE(l.endpoint_id, 0), COALESCE(l.subscription_id, 0), COUNT(*),
           COUNT(*) FILTER (WHERE l.status_code < 400),
           COUNT(*) FILTER (WHERE l.status_code >= 400),
           SUM(l.latency_ms), COALESCE(SUM(l.response_bytes), 0), CURRENT_TIMESTAMP
    FROM usage_logs AS l
    WHERE l.occurred_at >= p_from AND l.occurred_at < p_to + 1
    GROUP BY l.occurred_at::date, l.consumer_id, l.api_id,
             COALESCE(l.endpoint_id, 0), COALESCE(l.subscription_id, 0);

    DELETE FROM provider_daily_aggregates WHERE usage_date BETWEEN p_from AND p_to;
    INSERT INTO provider_daily_aggregates
        (usage_date, provider_id, api_id, request_count, success_count,
         error_count, unique_consumers, active_subscribers, sandbox_revenue,
         updated_at, total_latency_ms)
    SELECT l.occurred_at::date, a.provider_id, l.api_id, COUNT(*),
           COUNT(*) FILTER (WHERE l.status_code < 400),
           COUNT(*) FILTER (WHERE l.status_code >= 400),
           COUNT(DISTINCT l.consumer_id),
           (SELECT COUNT(*) FROM subscriptions s
            WHERE s.api_id = l.api_id AND s.status = 'Active'
              AND s.current_period_end > CURRENT_TIMESTAMP
              AND (s.expires_at IS NULL OR s.expires_at > CURRENT_TIMESTAMP)),
           0, CURRENT_TIMESTAMP, SUM(l.latency_ms)
    FROM usage_logs l
    JOIN apis a ON a.id = l.api_id
    WHERE l.occurred_at >= p_from AND l.occurred_at < p_to + 1
    GROUP BY l.occurred_at::date, a.provider_id, l.api_id;

    DELETE FROM provider_revenue_daily_aggregates
    WHERE usage_date BETWEEN p_from AND p_to;
    INSERT INTO provider_revenue_daily_aggregates
        (usage_date, provider_id, api_id, currency, amount, updated_at)
    SELECT t.occurred_at::date, a.provider_id, s.api_id, t.currency,
           SUM(t.amount), CURRENT_TIMESTAMP
    FROM transactions t
    JOIN subscriptions s ON s.id = t.subscription_id
    JOIN apis a ON a.id = s.api_id
    WHERE t.type = 'Charge' AND t.status = 'Succeeded'
      AND t.occurred_at >= p_from AND t.occurred_at < p_to + 1
    GROUP BY t.occurred_at::date, a.provider_id, s.api_id, t.currency;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cost_guard_daily(
    p_consumer_id INTEGER, p_from DATE, p_to DATE, p_api_id INTEGER DEFAULT NULL)
RETURNS TABLE (
    usage_date DATE, request_count BIGINT, success_count BIGINT,
    error_count BIGINT, total_latency_ms BIGINT, response_bytes BIGINT)
LANGUAGE sql STABLE AS $$
    SELECT a.usage_date, SUM(a.request_count), SUM(a.success_count),
           SUM(a.error_count), SUM(a.total_latency_ms), SUM(a.response_bytes)
    FROM usage_daily_aggregates a
    WHERE a.consumer_id = p_consumer_id
      AND a.usage_date BETWEEN p_from AND p_to
      AND (p_api_id IS NULL OR a.api_id = p_api_id)
    GROUP BY a.usage_date
    ORDER BY a.usage_date;
$$;

CREATE OR REPLACE FUNCTION provider_analytics_daily(
    p_provider_user_id INTEGER, p_from DATE, p_to DATE, p_api_id INTEGER DEFAULT NULL)
RETURNS TABLE (
    usage_date DATE, request_count BIGINT, success_count BIGINT,
    error_count BIGINT, unique_consumers BIGINT, active_subscribers BIGINT,
    average_latency_ms NUMERIC)
LANGUAGE sql STABLE AS $$
    SELECT a.usage_date, SUM(a.request_count), SUM(a.success_count),
           SUM(a.error_count), SUM(a.unique_consumers), SUM(a.active_subscribers),
           CASE WHEN SUM(a.request_count) = 0 THEN 0
                ELSE ROUND(SUM(a.total_latency_ms)::numeric / SUM(a.request_count), 2) END
    FROM provider_daily_aggregates a
    JOIN api_providers p ON p.id = a.provider_id
    WHERE p.user_id = p_provider_user_id
      AND a.usage_date BETWEEN p_from AND p_to
      AND (p_api_id IS NULL OR a.api_id = p_api_id)
    GROUP BY a.usage_date
    ORDER BY a.usage_date;
$$;

CREATE OR REPLACE FUNCTION provider_revenue_daily(
    p_provider_user_id INTEGER, p_from DATE, p_to DATE, p_api_id INTEGER DEFAULT NULL)
RETURNS TABLE (usage_date DATE, currency VARCHAR(3), amount NUMERIC)
LANGUAGE sql STABLE AS $$
    SELECT a.usage_date, a.currency, SUM(a.amount)
    FROM provider_revenue_daily_aggregates a
    JOIN api_providers p ON p.id = a.provider_id
    WHERE p.user_id = p_provider_user_id
      AND a.usage_date BETWEEN p_from AND p_to
      AND (p_api_id IS NULL OR a.api_id = p_api_id)
    GROUP BY a.usage_date, a.currency
    ORDER BY a.usage_date, a.currency;
$$;

-- Returns every invariant, including zero-count rows, so preflight automation
-- can fail closed without knowing the schema internals.
CREATE OR REPLACE FUNCTION validate_sprint5_integrity()
RETURNS TABLE (check_name TEXT, violation_count BIGINT)
LANGUAGE sql STABLE AS $$
    SELECT 'subscription_plan_api_mismatch', COUNT(*)
      FROM subscriptions s JOIN api_plans p ON p.id = s.plan_id
      WHERE p.api_id <> s.api_id
    UNION ALL
    SELECT 'subscription_quota_out_of_range', COUNT(*)
      FROM subscriptions WHERE quota_used < 0 OR quota_limit <= 0
    UNION ALL
    SELECT 'transaction_payment_mismatch', COUNT(*)
      FROM transactions t JOIN payments p ON p.id = t.payment_id
      WHERE p.subscription_id <> t.subscription_id
    UNION ALL
    SELECT 'published_api_without_active_plan', COUNT(*)
      FROM apis a WHERE a.status = 'Published' AND NOT EXISTS (
        SELECT 1 FROM api_plans p WHERE p.api_id = a.id AND p.is_active)
    UNION ALL
    SELECT 'usage_log_subscription_mismatch', COUNT(*)
      FROM usage_logs l JOIN subscriptions s ON s.id = l.subscription_id
      WHERE s.api_id <> l.api_id OR s.consumer_id <> l.consumer_id;
$$;

COMMIT;
