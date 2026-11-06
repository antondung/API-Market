BEGIN;
CREATE TABLE backend_job_runs (
 name TEXT PRIMARY KEY, last_started_at TIMESTAMPTZ NOT NULL,
 last_succeeded_at TIMESTAMPTZ, last_error_at TIMESTAMPTZ,
 last_result JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE OR REPLACE FUNCTION run_subscription_maintenance(p_now TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,p_batch_size INTEGER DEFAULT 500)
RETURNS TABLE(expired_count INTEGER,reset_count INTEGER) AS $$
DECLARE v_expired INTEGER:=0; v_reset INTEGER:=0;
BEGIN
 IF p_batch_size NOT BETWEEN 1 AND 10000 THEN RAISE EXCEPTION 'Invalid batch size'; END IF;
 WITH due AS (SELECT id FROM subscriptions WHERE status IN ('Active','Past Due','Suspended')
  AND (current_period_end<=p_now OR expires_at<=p_now) ORDER BY current_period_end,id FOR UPDATE SKIP LOCKED LIMIT p_batch_size)
 UPDATE subscriptions s SET status='Expired',expired_at=p_now,canceled_at=NULL,updated_at=p_now FROM due WHERE s.id=due.id;
 GET DIAGNOSTICS v_expired=ROW_COUNT;
 WITH due AS (SELECT id FROM subscriptions WHERE status='Active' AND quota_reset_at<=p_now AND current_period_end>p_now
  AND (expires_at IS NULL OR expires_at>p_now) ORDER BY quota_reset_at,id FOR UPDATE SKIP LOCKED LIMIT p_batch_size)
 UPDATE subscriptions s SET quota_reset_at=LEAST(s.current_period_end,GREATEST(s.quota_reset_at+INTERVAL '1 month',p_now+INTERVAL '1 month')),
 quota_used=0,updated_at=p_now FROM due WHERE s.id=due.id;
 GET DIAGNOSTICS v_reset=ROW_COUNT;
 RETURN QUERY SELECT v_expired,v_reset;
END; $$ LANGUAGE plpgsql;
COMMIT;
