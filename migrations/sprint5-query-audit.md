# Sprint 5 database query audit (EN-12, US-31, US-32)

## Luồng được audit

| Luồng | Điều kiện chính | Tối ưu Sprint 5 |
|---|---|---|
| Cost Guard / quota | `consumer_id`, `api_id`, thời gian | `idx_subscriptions_consumer_api_recent`, `idx_usage_logs_consumer_api_time`, hàm `cost_guard_daily` đọc aggregate |
| Request History | `consumer_id`, `api_id`, `occurred_at DESC` | Composite index trên bảng partition giúp lọc và phân trang ổn định |
| Provider Analytics | `provider_id`, `api_id`, ngày | `provider_daily_aggregates` có tổng latency; `provider_analytics_daily` không quét raw logs |
| Doanh thu Provider | giao dịch Charge thành công, thời gian, currency | Partial covering index và `provider_revenue_daily_aggregates`; không cộng lẫn tiền tệ |

## Kiểm tra kế hoạch thực thi

Chạy trên bản sao dữ liệu gần production, không chạy `EXPLAIN ANALYZE` trực tiếp với câu lệnh ghi:

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM cost_guard_daily(1, CURRENT_DATE - 29, CURRENT_DATE, NULL);

EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM provider_analytics_daily(1, CURRENT_DATE - 29, CURRENT_DATE, NULL);

EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM provider_revenue_daily(1, CURRENT_DATE - 29, CURRENT_DATE, NULL);
```

Ngưỡng cảnh báo cho bộ dữ liệu staging: p95 > 200 ms, đọc tuần tự trên `usage_logs` khi phạm vi đã có `consumer_id/api_id`, hoặc số buffer đọc tăng không tuyến tính với phạm vi ngày.

## Làm mới aggregate

Worker gọi theo cửa sổ nhỏ, có advisory lock chống hai worker ghi đồng thời:

```sql
SELECT refresh_usage_aggregates(CURRENT_DATE - 1, CURRENT_DATE);
```

Doanh thu được nhóm theo `currency`; không được cộng USD và VND thành một số duy nhất.

## Kiểm tra toàn vẹn trước demo/release

```bash
npm run db:integrity
```

Lệnh trả mã lỗi khác 0 nếu có subscription sai API/plan, quota không hợp lệ, transaction sai payment, API Published thiếu plan hoặc usage gắn sai consumer/subscription.
