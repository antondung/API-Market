BEGIN;

-- Personalized API Recommendations: promotions/deals, consumer preferences, and recommendation feedback actions.

CREATE TABLE api_plan_promotions (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    api_id INTEGER NOT NULL REFERENCES apis(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES api_plans(id) ON DELETE CASCADE UNIQUE,
    title VARCHAR(160) NOT NULL CHECK (LENGTH(BTRIM(title)) > 0),
    badge_text VARCHAR(60) NOT NULL CHECK (LENGTH(BTRIM(badge_text)) > 0),
    discount_percent INTEGER NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
    promo_price_monthly NUMERIC(14, 2) NOT NULL CHECK (promo_price_monthly >= 0),
    currency VARCHAR(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_api_plan_promotions_window CHECK (expires_at IS NULL OR expires_at > starts_at)
);

CREATE INDEX idx_api_plan_promotions_api_active
    ON api_plan_promotions (api_id, is_active, expires_at);

CREATE TABLE consumer_recommendation_preferences (
    consumer_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    priority_mode VARCHAR(20) NOT NULL DEFAULT 'balanced'
        CHECK (priority_mode IN ('balanced', 'cost_saving', 'high_quality', 'deals_only')),
    min_usage_days INTEGER NOT NULL DEFAULT 3 CHECK (min_usage_days BETWEEN 0 AND 365),
    min_savings_percent INTEGER NOT NULL DEFAULT 5 CHECK (min_savings_percent BETWEEN 0 AND 95),
    only_verified_providers BOOLEAN NOT NULL DEFAULT FALSE,
    only_active_deals BOOLEAN NOT NULL DEFAULT FALSE,
    auto_notify_deals BOOLEAN NOT NULL DEFAULT TRUE,
    preferred_migration_mode VARCHAR(24) NOT NULL DEFAULT 'cancel_at_period_end'
        CHECK (preferred_migration_mode IN ('parallel', 'cancel_at_period_end', 'immediate_cancel')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE consumer_recommendation_actions (
    consumer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_api_id INTEGER NOT NULL REFERENCES apis(id) ON DELETE CASCADE,
    recommended_api_id INTEGER NOT NULL REFERENCES apis(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('saved', 'snoozed', 'dismissed', 'switched')),
    reason VARCHAR(200),
    snoozed_until TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (consumer_id, source_api_id, recommended_api_id),
    CONSTRAINT chk_recommendation_distinct_apis CHECK (source_api_id <> recommended_api_id)
);

CREATE INDEX idx_consumer_rec_actions_consumer
    ON consumer_recommendation_actions (consumer_id, action, updated_at DESC);

COMMIT;
