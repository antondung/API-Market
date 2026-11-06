BEGIN;
CREATE TABLE usage_outbox (
 occurred_at TIMESTAMPTZ NOT NULL, request_id UUID NOT NULL,
 api_key_id BIGINT, subscription_id BIGINT NOT NULL, consumer_id INTEGER NOT NULL,api_id INTEGER NOT NULL,endpoint_id INTEGER,
 status_code SMALLINT NOT NULL DEFAULT 502 CHECK(status_code BETWEEN 100 AND 599),error_code VARCHAR(64),
 latency_ms INTEGER NOT NULL DEFAULT 0 CHECK(latency_ms>=0),upstream_latency_ms INTEGER NOT NULL DEFAULT 0 CHECK(upstream_latency_ms>=0),
 response_bytes INTEGER NOT NULL DEFAULT 0 CHECK(response_bytes>=0),gateway_overhead_ms INTEGER NOT NULL DEFAULT 0,
 completed BOOLEAN NOT NULL DEFAULT FALSE,created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(occurred_at,request_id),CHECK(gateway_overhead_ms BETWEEN 0 AND latency_ms)
);
CREATE INDEX idx_usage_outbox_pending ON usage_outbox(created_at);
COMMIT;
