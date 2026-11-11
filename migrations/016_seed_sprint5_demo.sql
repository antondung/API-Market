BEGIN;

-- Development/demo only. The application refuses demoSeed in NODE_ENV=production.
WITH target AS (
    SELECT u.id AS consumer_id, a.id AS api_id, p.id AS plan_id
    FROM users u
    JOIN apis a ON a.name = 'Product Catalog API' AND a.status = 'Published'
    JOIN api_plans p ON p.api_id = a.id AND p.name = 'Basic'
    WHERE u.email_normalized = 'user@example.com'
)
INSERT INTO subscriptions
    (consumer_id, plan_id, api_id, status, current_period_start,
     current_period_end, quota_reset_at, expires_at, quota_used,
     quota_limit, rate_limit_per_minute, price_amount, price_currency)
SELECT t.consumer_id, t.plan_id, t.api_id, 'Active', date_trunc('month', CURRENT_TIMESTAMP),
       date_trunc('month', CURRENT_TIMESTAMP) + INTERVAL '1 month',
       date_trunc('month', CURRENT_TIMESTAMP) + INTERVAL '1 month',
       date_trunc('month', CURRENT_TIMESTAMP) + INTERVAL '1 month', 0,
       p.quota, p.rate_limit, p.price_monthly, p.currency
FROM target t JOIN api_plans p ON p.id = t.plan_id
WHERE NOT EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.consumer_id = t.consumer_id AND s.api_id = t.api_id
      AND s.status IN ('Pending', 'Active', 'Past Due', 'Suspended'));

WITH demo_subscription AS (
    SELECT s.id, s.price_amount, s.price_currency
    FROM subscriptions s
    JOIN users u ON u.id = s.consumer_id AND u.email_normalized = 'user@example.com'
    JOIN apis a ON a.id = s.api_id AND a.name = 'Product Catalog API'
    ORDER BY s.id DESC LIMIT 1
)
INSERT INTO payments
    (subscription_id, idempotency_key, provider, provider_payment_id,
     amount, currency, status, paid_at, checkout_expires_at)
SELECT id, 'sprint5-demo-product-catalog', 'SANDBOX',
       'sprint5-demo-product-catalog', price_amount, price_currency,
       'Succeeded', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '15 minutes'
FROM demo_subscription
ON CONFLICT (idempotency_key) DO NOTHING;

WITH demo_payment AS (
    SELECT id, subscription_id, amount, currency
    FROM payments WHERE idempotency_key = 'sprint5-demo-product-catalog'
)
INSERT INTO transactions
    (payment_id, subscription_id, external_event_id, type, amount,
     currency, status, metadata, occurred_at)
SELECT id, subscription_id, 'sprint5-demo-revenue', 'Charge', amount,
       currency, 'Succeeded', '{"seed":"sprint5"}'::jsonb, CURRENT_TIMESTAMP
FROM demo_payment
ON CONFLICT (external_event_id) DO NOTHING;

WITH demo AS (
    SELECT s.id AS subscription_id, s.consumer_id, s.api_id,
           (SELECT e.id FROM api_endpoints e WHERE e.api_id = s.api_id ORDER BY e.id LIMIT 1) endpoint_id
    FROM subscriptions s
    JOIN users u ON u.id = s.consumer_id AND u.email_normalized = 'user@example.com'
    JOIN apis a ON a.id = s.api_id AND a.name = 'Product Catalog API'
    ORDER BY s.id DESC LIMIT 1
), samples AS (
    SELECT d.*, days.day_offset, sample_series.sample,
           (CURRENT_DATE - days.day_offset + make_interval(hours => 8 + sample_series.sample * 3))::timestamptz occurred_at
    FROM demo d CROSS JOIN generate_series(0, 13) AS days(day_offset)
    CROSS JOIN generate_series(0, 2) AS sample_series(sample)
)
INSERT INTO usage_logs
    (occurred_at, request_id, subscription_id, consumer_id, api_id,
     endpoint_id, status_code, latency_ms, response_bytes, is_sandbox,
     gateway_overhead_ms)
SELECT s.occurred_at,
       (substr(hash.h,1,8)||'-'||substr(hash.h,9,4)||'-'||substr(hash.h,13,4)||'-'||substr(hash.h,17,4)||'-'||substr(hash.h,21,12))::uuid,
       s.subscription_id, s.consumer_id, s.api_id, s.endpoint_id,
       CASE WHEN s.sample = 2 AND s.day_offset % 4 = 0 THEN 429 ELSE 200 END,
       35 + s.day_offset * 2 + s.sample * 5, 1024 + s.sample * 128, FALSE, 5
FROM samples s
CROSS JOIN LATERAL (SELECT md5('sprint5-demo-'||s.day_offset||'-'||s.sample) h) hash
ON CONFLICT (occurred_at, request_id) DO NOTHING;

UPDATE subscriptions s
SET quota_used = counts.n, updated_at = CURRENT_TIMESTAMP
FROM (
    SELECT subscription_id, COUNT(*) n FROM usage_logs
    WHERE subscription_id IS NOT NULL GROUP BY subscription_id
) counts
WHERE s.id = counts.subscription_id
  AND s.id IN (
    SELECT s2.id FROM subscriptions s2
    JOIN users u ON u.id = s2.consumer_id AND u.email_normalized = 'user@example.com'
    JOIN apis a ON a.id = s2.api_id AND a.name = 'Product Catalog API');

SELECT refresh_usage_aggregates(CURRENT_DATE - 13, CURRENT_DATE);

COMMIT;
