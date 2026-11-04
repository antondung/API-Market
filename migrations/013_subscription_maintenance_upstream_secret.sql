BEGIN;

-- Per-API HMAC secret for Gateway upstream signing. Ciphertext only; plaintext is never stored.
ALTER TABLE gateway_routes ADD COLUMN upstream_secret_enc TEXT;
ALTER TABLE gateway_routes ADD CONSTRAINT chk_gateway_routes_upstream_secret
    CHECK (upstream_secret_enc IS NULL OR upstream_secret_enc ~ '^v1:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$');

-- Paid plans expire and are not renewed. Free plans roll a 30-day quota window from the existing anchor.
-- Lock 913005 is distinct from aggregate refresh (913004) and schema migration (913002).
CREATE OR REPLACE FUNCTION run_subscription_maintenance(p_now TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, p_batch_size INTEGER DEFAULT 500)
RETURNS TABLE (expired_count INTEGER, reset_count INTEGER) AS $$
DECLARE
    v_expired INTEGER := 0;
    v_free INTEGER := 0;
    v_paid INTEGER := 0;
BEGIN
    IF p_batch_size NOT BETWEEN 1 AND 10000 THEN RAISE EXCEPTION 'Invalid batch size'; END IF;
    IF NOT pg_try_advisory_xact_lock(913005) THEN
        RETURN QUERY SELECT 0, 0;
        RETURN;
    END IF;

    WITH due AS (
        SELECT id FROM subscriptions
        WHERE status IN ('Active', 'Past Due', 'Suspended')
          AND price_amount > 0
          AND expires_at IS NOT NULL
          AND expires_at <= p_now
        ORDER BY expires_at, id
        FOR UPDATE SKIP LOCKED
        LIMIT p_batch_size
    )
    UPDATE subscriptions s
       SET status = 'Expired', expired_at = p_now, updated_at = p_now
      FROM due
     WHERE s.id = due.id;
    GET DIAGNOSTICS v_expired = ROW_COUNT;

    WITH due AS (
        SELECT s.id FROM subscriptions s
        WHERE s.status = 'Active' AND s.price_amount = 0 AND s.quota_reset_at <= p_now
        ORDER BY s.quota_reset_at, s.id
        FOR UPDATE OF s SKIP LOCKED
        LIMIT p_batch_size
    )
    UPDATE subscriptions s
       SET quota_used = 0,
           current_period_start = s.quota_reset_at,
           current_period_end = s.quota_reset_at + INTERVAL '30 days',
           quota_reset_at = s.quota_reset_at + INTERVAL '30 days',
           expires_at = s.quota_reset_at + INTERVAL '30 days',
           updated_at = p_now
      FROM due
     WHERE s.id = due.id;
    GET DIAGNOSTICS v_free = ROW_COUNT;

    WITH due AS (
        SELECT s.id FROM subscriptions s
        WHERE s.status = 'Active'
          AND s.price_amount > 0
          AND s.quota_reset_at <= p_now
          AND (s.expires_at IS NULL OR s.expires_at > p_now)
        ORDER BY s.quota_reset_at, s.id
        FOR UPDATE OF s SKIP LOCKED
        LIMIT p_batch_size
    )
    UPDATE subscriptions s
       SET quota_used = 0,
           quota_reset_at = s.quota_reset_at + INTERVAL '30 days',
           updated_at = p_now
      FROM due
     WHERE s.id = due.id;
    GET DIAGNOSTICS v_paid = ROW_COUNT;

    RETURN QUERY SELECT v_expired, v_free + v_paid;
END;
$$ LANGUAGE plpgsql;

COMMIT;
