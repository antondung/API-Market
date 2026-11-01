BEGIN;

-- Sprint 4 / Issue #19: billing, subscriptions, usage and dashboard aggregates.
-- api_plans (created in Sprint 2) is the canonical Plan table.

CREATE TABLE subscriptions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    consumer_id INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    plan_id INTEGER NOT NULL REFERENCES api_plans(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    api_id INTEGER NOT NULL REFERENCES apis(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    quota_reset_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ,
    quota_used BIGINT NOT NULL DEFAULT 0,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    expired_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_subscriptions_id_api UNIQUE (id, api_id),
    CONSTRAINT chk_subscriptions_status CHECK (status IN ('Pending','Active','Past Due','Suspended','Canceled','Expired')),
    CONSTRAINT chk_subscriptions_period CHECK (current_period_end > current_period_start AND quota_reset_at > current_period_start),
    CONSTRAINT chk_subscriptions_quota CHECK (quota_used >= 0),
    CONSTRAINT chk_subscriptions_terminal_time CHECK (
        (status = 'Canceled' AND canceled_at IS NOT NULL) OR
        (status = 'Expired' AND expired_at IS NOT NULL) OR
        (status NOT IN ('Canceled','Expired') AND canceled_at IS NULL AND expired_at IS NULL)
    )
);

-- At most one entitlement for a Consumer/API can be in a non-terminal state.
CREATE UNIQUE INDEX uq_subscriptions_live_consumer_api
    ON subscriptions (consumer_id, api_id)
    WHERE status IN ('Pending','Active','Past Due','Suspended');
CREATE INDEX idx_subscriptions_expiration ON subscriptions (expires_at, id)
    WHERE status IN ('Active','Past Due');
CREATE INDEX idx_subscriptions_quota_reset ON subscriptions (quota_reset_at, id) WHERE status = 'Active';
CREATE INDEX idx_subscriptions_plan_status ON subscriptions (plan_id, status);

-- Prevent a mismatched api_id/plan_id pair while retaining api_id for hot Gateway lookups.
CREATE OR REPLACE FUNCTION validate_subscription_plan_api()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM api_plans WHERE id = NEW.plan_id AND api_id = NEW.api_id) THEN
        RAISE EXCEPTION 'Subscription plan does not belong to API' USING ERRCODE = '23514';
    END IF;
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_subscriptions_validate
BEFORE INSERT OR UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION validate_subscription_plan_api();

CREATE TABLE payments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    subscription_id BIGINT NOT NULL REFERENCES subscriptions(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    idempotency_key VARCHAR(128) NOT NULL,
    provider VARCHAR(30) NOT NULL DEFAULT 'SANDBOX',
    provider_payment_id VARCHAR(128),
    amount NUMERIC(14,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    failure_code VARCHAR(64),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_payments_idempotency UNIQUE (idempotency_key),
    CONSTRAINT chk_payments_amount CHECK (amount >= 0),
    CONSTRAINT chk_payments_currency CHECK (currency ~ '^[A-Z]{3}$'),
    CONSTRAINT chk_payments_status CHECK (status IN ('Pending','Succeeded','Failed','Refunded')),
    CONSTRAINT chk_payments_result CHECK (
        (status = 'Succeeded' AND paid_at IS NOT NULL AND failure_code IS NULL) OR
        (status = 'Failed' AND failure_code IS NOT NULL AND paid_at IS NULL) OR
        (status IN ('Pending','Refunded') AND failure_code IS NULL)
    )
);
CREATE UNIQUE INDEX uq_payments_provider_reference ON payments (provider, provider_payment_id)
    WHERE provider_payment_id IS NOT NULL;
CREATE INDEX idx_payments_subscription_created ON payments (subscription_id, created_at DESC, id DESC);

CREATE TABLE transactions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    payment_id BIGINT NOT NULL REFERENCES payments(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    subscription_id BIGINT NOT NULL REFERENCES subscriptions(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    external_event_id VARCHAR(128) NOT NULL,
    type VARCHAR(20) NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(20) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_transactions_external_event UNIQUE (external_event_id),
    CONSTRAINT chk_transactions_type CHECK (type IN ('Charge','Refund','Adjustment')),
    CONSTRAINT chk_transactions_amount CHECK (amount >= 0),
    CONSTRAINT chk_transactions_currency CHECK (currency ~ '^[A-Z]{3}$'),
    CONSTRAINT chk_transactions_status CHECK (status IN ('Pending','Succeeded','Failed')),
    CONSTRAINT chk_transactions_metadata CHECK (jsonb_typeof(metadata) = 'object')
);
CREATE INDEX idx_transactions_subscription_time ON transactions (subscription_id, occurred_at DESC, id DESC);

CREATE OR REPLACE FUNCTION validate_transaction_payment_subscription()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM payments WHERE id=NEW.payment_id AND subscription_id=NEW.subscription_id) THEN
        RAISE EXCEPTION 'Transaction payment does not belong to subscription' USING ERRCODE='23514';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_transactions_validate
BEFORE INSERT OR UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION validate_transaction_payment_subscription();

CREATE TABLE usage_logs (
    occurred_at TIMESTAMPTZ NOT NULL,
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    request_id UUID NOT NULL,
    api_key_id BIGINT REFERENCES api_keys(id) ON UPDATE CASCADE ON DELETE SET NULL,
    subscription_id BIGINT,
    consumer_id INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    api_id INTEGER NOT NULL REFERENCES apis(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    endpoint_id INTEGER REFERENCES api_endpoints(id) ON UPDATE CASCADE ON DELETE SET NULL,
    status_code SMALLINT NOT NULL,
    error_code VARCHAR(64),
    latency_ms INTEGER NOT NULL,
    upstream_latency_ms INTEGER,
    response_bytes INTEGER,
    is_sandbox BOOLEAN NOT NULL DEFAULT FALSE,
    gateway_overhead_ms INTEGER,
    PRIMARY KEY (occurred_at, id),
    UNIQUE (occurred_at, request_id),
    CONSTRAINT fk_usage_logs_subscription_api FOREIGN KEY (subscription_id, api_id)
        REFERENCES subscriptions(id, api_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_usage_logs_status CHECK (status_code BETWEEN 100 AND 599),
    CONSTRAINT chk_usage_logs_latency CHECK (latency_ms >= 0 AND (upstream_latency_ms IS NULL OR upstream_latency_ms >= 0)),
    CONSTRAINT chk_usage_logs_bytes CHECK (response_bytes IS NULL OR response_bytes >= 0),
    CONSTRAINT chk_usage_logs_overhead CHECK (gateway_overhead_ms IS NULL OR gateway_overhead_ms BETWEEN 0 AND latency_ms),
    CONSTRAINT chk_usage_logs_entitlement CHECK (is_sandbox OR subscription_id IS NOT NULL)
) PARTITION BY RANGE (occurred_at);

CREATE INDEX idx_usage_logs_consumer_time ON usage_logs (consumer_id, occurred_at DESC, id DESC);
CREATE INDEX idx_usage_logs_api_time ON usage_logs (api_id, occurred_at DESC, id DESC);
CREATE INDEX idx_usage_logs_subscription_time ON usage_logs (subscription_id, occurred_at DESC, id DESC);
CREATE INDEX idx_usage_logs_endpoint_time ON usage_logs (endpoint_id, occurred_at DESC, id DESC);

CREATE OR REPLACE FUNCTION ensure_usage_log_partition(p_month DATE)
RETURNS TEXT AS $$
DECLARE
    v_start DATE := date_trunc('month', p_month)::date;
    v_end DATE := (date_trunc('month', p_month) + INTERVAL '1 month')::date;
    v_name TEXT := 'usage_logs_' || to_char(v_start, 'YYYY_MM');
BEGIN
    IF p_month IS NULL THEN RAISE EXCEPTION 'Partition month is required'; END IF;
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF usage_logs FOR VALUES FROM (%L) TO (%L)', v_name, v_start, v_end);
    RETURN v_name;
END;
$$ LANGUAGE plpgsql;
SELECT ensure_usage_log_partition((CURRENT_DATE - INTERVAL '1 month')::date);
SELECT ensure_usage_log_partition(CURRENT_DATE);
SELECT ensure_usage_log_partition((CURRENT_DATE + INTERVAL '1 month')::date);
SELECT ensure_usage_log_partition((CURRENT_DATE + INTERVAL '2 months')::date);

CREATE VIEW request_history AS
SELECT occurred_at,id,request_id,consumer_id,api_id,endpoint_id,status_code,error_code,latency_ms,is_sandbox
FROM usage_logs;

CREATE TABLE usage_daily_aggregates (
    usage_date DATE NOT NULL,
    consumer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    api_id INTEGER NOT NULL REFERENCES apis(id) ON DELETE RESTRICT,
    endpoint_id INTEGER,
    subscription_id BIGINT,
    request_count BIGINT NOT NULL,
    success_count BIGINT NOT NULL,
    error_count BIGINT NOT NULL,
    total_latency_ms BIGINT NOT NULL,
    response_bytes BIGINT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usage_date, consumer_id, api_id, endpoint_id, subscription_id),
    CONSTRAINT chk_usage_daily_counts CHECK (request_count >= 0 AND success_count >= 0 AND error_count >= 0 AND request_count = success_count + error_count)
);
CREATE INDEX idx_usage_daily_consumer_date ON usage_daily_aggregates (consumer_id, usage_date DESC);
CREATE INDEX idx_usage_daily_api_date ON usage_daily_aggregates (api_id, usage_date DESC);

CREATE TABLE provider_daily_aggregates (
    usage_date DATE NOT NULL,
    provider_id INTEGER NOT NULL REFERENCES api_providers(id) ON DELETE RESTRICT,
    api_id INTEGER NOT NULL REFERENCES apis(id) ON DELETE RESTRICT,
    request_count BIGINT NOT NULL,
    success_count BIGINT NOT NULL,
    error_count BIGINT NOT NULL,
    unique_consumers BIGINT NOT NULL,
    active_subscribers BIGINT NOT NULL,
    sandbox_revenue NUMERIC(16,2) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usage_date, provider_id, api_id)
);
CREATE INDEX idx_provider_daily_provider_date ON provider_daily_aggregates (provider_id, usage_date DESC);

CREATE OR REPLACE FUNCTION refresh_usage_aggregates(p_from DATE, p_to DATE)
RETURNS VOID AS $$
BEGIN
    IF p_from IS NULL OR p_to IS NULL OR p_to < p_from THEN RAISE EXCEPTION 'Invalid aggregate date range'; END IF;
    DELETE FROM usage_daily_aggregates WHERE usage_date BETWEEN p_from AND p_to;
    INSERT INTO usage_daily_aggregates
    SELECT occurred_at::date,consumer_id,api_id,COALESCE(endpoint_id,0),COALESCE(subscription_id,0),COUNT(*),
           COUNT(*) FILTER (WHERE status_code < 400),COUNT(*) FILTER (WHERE status_code >= 400),
           SUM(latency_ms),COALESCE(SUM(response_bytes),0),CURRENT_TIMESTAMP
    FROM usage_logs WHERE occurred_at >= p_from AND occurred_at < p_to + 1
    GROUP BY occurred_at::date,consumer_id,api_id,COALESCE(endpoint_id,0),COALESCE(subscription_id,0);

    DELETE FROM provider_daily_aggregates WHERE usage_date BETWEEN p_from AND p_to;
    INSERT INTO provider_daily_aggregates
    SELECT l.occurred_at::date,a.provider_id,l.api_id,COUNT(*),COUNT(*) FILTER (WHERE l.status_code < 400),
           COUNT(*) FILTER (WHERE l.status_code >= 400),COUNT(DISTINCT l.consumer_id),
           COUNT(DISTINCT l.subscription_id) FILTER (WHERE l.subscription_id IS NOT NULL),
           COALESCE((SELECT SUM(t.amount) FROM transactions t JOIN subscriptions s ON s.id=t.subscription_id
                     WHERE s.api_id=l.api_id AND t.type='Charge' AND t.status='Succeeded'
                       AND t.occurred_at::date=l.occurred_at::date),0),CURRENT_TIMESTAMP
    FROM usage_logs l JOIN apis a ON a.id=l.api_id
    WHERE l.occurred_at >= p_from AND l.occurred_at < p_to + 1
    GROUP BY l.occurred_at::date,a.provider_id,l.api_id;
END;
$$ LANGUAGE plpgsql;

-- Worker calls this in small batches. Row locking makes concurrent workers safe.
CREATE OR REPLACE FUNCTION run_subscription_maintenance(p_now TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, p_batch_size INTEGER DEFAULT 500)
RETURNS TABLE (expired_count INTEGER, reset_count INTEGER) AS $$
DECLARE v_expired INTEGER := 0; v_reset INTEGER := 0;
BEGIN
    IF p_batch_size NOT BETWEEN 1 AND 10000 THEN RAISE EXCEPTION 'Invalid batch size'; END IF;
    WITH due AS (SELECT id FROM subscriptions WHERE status IN ('Active','Past Due') AND expires_at IS NOT NULL AND expires_at <= p_now
                 ORDER BY expires_at,id FOR UPDATE SKIP LOCKED LIMIT p_batch_size)
    UPDATE subscriptions s SET status='Expired',expired_at=p_now,updated_at=p_now FROM due WHERE s.id=due.id;
    GET DIAGNOSTICS v_expired = ROW_COUNT;

    WITH due AS (SELECT s.id FROM subscriptions s
                 WHERE s.status='Active' AND s.quota_reset_at <= p_now AND (s.expires_at IS NULL OR s.expires_at > p_now)
                 ORDER BY s.quota_reset_at,s.id FOR UPDATE OF s SKIP LOCKED LIMIT p_batch_size)
    UPDATE subscriptions s SET quota_reset_at=GREATEST(s.quota_reset_at + INTERVAL '1 month', p_now + INTERVAL '1 month'),
        quota_used=0,updated_at=p_now FROM due WHERE s.id=due.id;
    GET DIAGNOSTICS v_reset = ROW_COUNT;
    RETURN QUERY SELECT v_expired,v_reset;
END;
$$ LANGUAGE plpgsql;

COMMIT;
