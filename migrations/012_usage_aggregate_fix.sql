BEGIN;
-- Correct PR91's ungrouped correlated timestamp without changing its applied checksum.
CREATE OR REPLACE FUNCTION refresh_usage_aggregates(p_from DATE,p_to DATE) RETURNS VOID AS $$
BEGIN
 IF p_from IS NULL OR p_to IS NULL OR p_to<p_from THEN RAISE EXCEPTION 'Invalid aggregate date range'; END IF;
 PERFORM pg_advisory_xact_lock(913004);
 DELETE FROM usage_daily_aggregates WHERE usage_date BETWEEN p_from AND p_to;
 INSERT INTO usage_daily_aggregates
 SELECT occurred_at::date,consumer_id,api_id,COALESCE(endpoint_id,0),COALESCE(subscription_id,0),COUNT(*),
 COUNT(*) FILTER(WHERE status_code<400),COUNT(*) FILTER(WHERE status_code>=400),SUM(latency_ms),COALESCE(SUM(response_bytes),0),CURRENT_TIMESTAMP
 FROM usage_logs WHERE occurred_at>=p_from AND occurred_at<p_to+1
 GROUP BY occurred_at::date,consumer_id,api_id,COALESCE(endpoint_id,0),COALESCE(subscription_id,0);
 DELETE FROM provider_daily_aggregates WHERE usage_date BETWEEN p_from AND p_to;
 INSERT INTO provider_daily_aggregates
 WITH traffic AS (
  SELECT occurred_at::date usage_date,api_id,COUNT(*) request_count,COUNT(*) FILTER(WHERE status_code<400) success_count,
  COUNT(*) FILTER(WHERE status_code>=400) error_count,COUNT(DISTINCT consumer_id) unique_consumers
  FROM usage_logs WHERE occurred_at>=p_from AND occurred_at<p_to+1 GROUP BY 1,2
 ), revenue AS (
  SELECT t.occurred_at::date usage_date,s.api_id,SUM(t.amount) amount FROM transactions t JOIN subscriptions s ON s.id=t.subscription_id
  WHERE t.type='Charge' AND t.status='Succeeded' AND t.occurred_at>=p_from AND t.occurred_at<p_to+1 GROUP BY 1,2
 ), days AS (SELECT usage_date,api_id FROM traffic UNION SELECT usage_date,api_id FROM revenue)
 SELECT d.usage_date,a.provider_id,d.api_id,COALESCE(t.request_count,0),COALESCE(t.success_count,0),COALESCE(t.error_count,0),COALESCE(t.unique_consumers,0),
 (SELECT COUNT(*) FROM subscriptions s WHERE s.api_id=d.api_id AND s.status='Active' AND s.current_period_end>NOW()),COALESCE(r.amount,0),CURRENT_TIMESTAMP
 FROM days d JOIN apis a ON a.id=d.api_id LEFT JOIN traffic t USING(usage_date,api_id) LEFT JOIN revenue r USING(usage_date,api_id);
END;
$$ LANGUAGE plpgsql;
COMMIT;
