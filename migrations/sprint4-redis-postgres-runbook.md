# Sprint 4 — Redis ↔ PostgreSQL quota/rate-limit runbook

## Nguồn dữ liệu và key

PostgreSQL là nguồn sự thật cho entitlement, Plan và Usage Log. Redis chỉ giữ bộ đếm nóng:

- `rl:{apiKeyId}:{endpointId}:{minute}`: rate limit theo cửa sổ phút, TTL 120 giây.
- `quota:{subscriptionId}:{periodStart}`: số request đã nhận trong kỳ, TTL đến `quota_reset_at` cộng 24 giờ.
- Không đưa API key thô, Authorization, cookie hay payload vào key/value/log.

Gateway kiểm tra theo thứ tự cố định: API key → Subscription → Plan → rate limit → quota → forward. Hai bộ đếm dùng Lua script `INCR` + `EXPIRE` nguyên tử; request bị rate-limit không tăng quota. Request đã qua quota gate được tính usage kể cả upstream trả lỗi.

## Đồng bộ và đối soát

`usage_logs` là nhật ký bất biến. Gateway đẩy bản ghi đã redact vào hàng đợi và writer ghi batch tối đa 500 bản ghi hoặc mỗi 250 ms. `request_id` cùng `occurred_at` chống ghi lặp.

Worker đối soát định kỳ:

1. Tổng hợp `usage_logs` theo `subscription_id` trong kỳ.
2. Cập nhật `subscriptions.quota_used` bằng số đã ghi bền vững.
3. Nếu Redis thấp hơn PostgreSQL, đặt Redis bằng PostgreSQL; nếu Redis cao hơn, giữ Redis và chờ batch log kế tiếp.
4. Chạy `refresh_usage_aggregates(from, to)` cho ngày vừa đóng và ngày hiện tại.

Không giảm Redis counter từ một lần đọc PostgreSQL cũ. Dashboard đọc aggregate cho kỳ đã đóng và có thể cộng dữ liệu ngày hiện tại từ Usage Log.

## Khi Redis lỗi

- **Rate limit: fail-closed** (`503 RATE_LIMIT_UNAVAILABLE`) cho API trả phí vì không thể bảo vệ upstream.
- **Quota: fail-closed** (`503 QUOTA_UNAVAILABLE`) khi không đọc/ghi được counter, tránh vượt chi phí của Consumer.
- Sandbox cũng fail-closed; không chuyển sang bộ đếm in-memory vì nhiều replica sẽ cho kết quả sai.
- Health check đánh dấu Gateway degraded, phát cảnh báo; không ghi `429` vì chưa chứng minh người dùng vượt hạn mức.
- Sau khi Redis phục hồi, dựng lại quota counter từ `usage_logs`, sau đó mới mở traffic. Rate-limit window tự hồi phục theo TTL.

## Vận hành partition và job

- Mỗi ngày gọi `ensure_usage_log_partition(date_trunc('month', now()) + interval '2 months')`; luôn tạo trước ít nhất 7 ngày.
- Worker trong tiến trình backend gọi `run_subscription_maintenance(now(), 500)` mỗi `MAINTENANCE_INTERVAL_MS` (mặc định 5 phút) và lặp đến khi cả hai count bằng 0. Khóa advisory `913005` cho phép nhiều instance; instance không lấy được khóa bỏ qua lượt đó. Gói trả phí hết `expires_at` chuyển Expired và không gia hạn. Gói Free (`price_amount = 0`) reset quota theo từng cửa sổ 30 ngày tính từ mốc `quota_reset_at` hiện có.
- Chỉ drop partition sau khi backup và được Tech Lead duyệt. Retention mặc định 13 tháng; không sửa/xóa từng Usage Log.
- Nếu batch writer lỗi, retry với backoff và dead-letter; không log payload/credential trong lỗi.
