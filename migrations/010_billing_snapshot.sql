BEGIN;
ALTER TABLE subscriptions ADD COLUMN quota_limit BIGINT NOT NULL DEFAULT 1,
 ADD COLUMN rate_limit_per_minute INTEGER NOT NULL DEFAULT 1,
 ADD COLUMN price_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
 ADD COLUMN price_currency VARCHAR(3) NOT NULL DEFAULT 'VND';
UPDATE subscriptions s SET quota_limit=p.quota,rate_limit_per_minute=p.rate_limit,price_amount=p.price_monthly,price_currency=p.currency FROM api_plans p WHERE p.id=s.plan_id;
ALTER TABLE subscriptions ADD CONSTRAINT chk_subscription_snapshot CHECK(quota_limit>0 AND rate_limit_per_minute>0 AND price_amount>=0 AND price_currency ~ '^[A-Z]{3}$');
ALTER TABLE payments ADD COLUMN target_plan_id INTEGER REFERENCES api_plans(id),
 ADD COLUMN target_quota BIGINT, ADD COLUMN target_rate INTEGER,
 ADD COLUMN checkout_expires_at TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP+INTERVAL '15 minutes');
CREATE UNIQUE INDEX uq_payment_pending_subscription ON payments(subscription_id) WHERE status='Pending';
COMMIT;
