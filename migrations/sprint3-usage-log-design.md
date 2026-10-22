# Thiết kế Usage Log & Request History — Sprint 3 handoff cho Sprint 4 (EN-09)

## Quyết định

`usage_logs` là nguồn dữ liệu bất biến cho analytics/quota. `request_history` là **view an toàn** từ `usage_logs` cho Consumer/Provider, không nhân đôi request/response body. Cả hai tuyệt đối không lưu plaintext API key, `Authorization`, cookie, access token, mật khẩu, request body hay response body.

Sprint 3 chỉ chốt thiết kế; migration tạo bảng thật thực hiện ở Sprint 4 vì khi đó mới có `subscriptions`, `payments` và enforcement Gateway đầy đủ.

## Bảng nguồn: `usage_logs`

| Cột | Kiểu | Mục đích |
|---|---|---|
| `occurred_at` | `TIMESTAMPTZ NOT NULL` | Partition key, thời điểm Gateway nhận request |
| `id` | `BIGINT IDENTITY` | Định danh trong partition; PK ghép với `occurred_at` |
| `request_id` | `UUID NOT NULL` | Correlation ID, unique cùng `occurred_at` |
| `api_key_id` | `BIGINT` | Key đã hash/verify; không lưu key thô |
| `subscription_id` | `BIGINT` | Subscription dùng để quota/billing (Sprint 4) |
| `consumer_id` | `INTEGER NOT NULL` | User gửi request |
| `api_id` | `INTEGER NOT NULL` | API được gọi |
| `endpoint_id` | `INTEGER` | Endpoint đã route |
| `status_code` | `SMALLINT NOT NULL` | HTTP outcome |
| `error_code` | `VARCHAR(64)` | Mã lỗi an toàn, ví dụ `QUOTA_EXCEEDED` |
| `latency_ms` | `INTEGER NOT NULL` | Tổng latency từ Gateway |
| `upstream_latency_ms` | `INTEGER` | Latency upstream nếu đã forward |
| `response_bytes` | `INTEGER` | Kích thước response, không phải nội dung |
| `is_sandbox` | `BOOLEAN NOT NULL` | Phân biệt lượt thử / request đã subscribe |
| `gateway_overhead_ms` | `INTEGER` | Đo overhead Gateway |

Ràng buộc: `status_code BETWEEN 100 AND 599`, latency/bytes không âm, `gateway_overhead_ms <= latency_ms` khi có giá trị.

## Partition và index

```sql
CREATE TABLE usage_logs (
    occurred_at TIMESTAMPTZ NOT NULL,
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    request_id UUID NOT NULL,
    api_key_id BIGINT,
    subscription_id BIGINT,
    consumer_id INTEGER NOT NULL,
    api_id INTEGER NOT NULL,
    endpoint_id INTEGER,
    status_code SMALLINT NOT NULL,
    error_code VARCHAR(64),
    latency_ms INTEGER NOT NULL,
    upstream_latency_ms INTEGER,
    response_bytes INTEGER,
    is_sandbox BOOLEAN NOT NULL DEFAULT FALSE,
    gateway_overhead_ms INTEGER,
    PRIMARY KEY (occurred_at, id),
    UNIQUE (occurred_at, request_id)
) PARTITION BY RANGE (occurred_at);

-- Tạo sẵn partition tháng hiện tại và hai tháng kế tiếp bằng Worker/cron.
CREATE TABLE usage_logs_2026_11 PARTITION OF usage_logs
    FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');

CREATE INDEX idx_usage_logs_consumer_time
    ON usage_logs (consumer_id, occurred_at DESC, id DESC);
CREATE INDEX idx_usage_logs_api_time
    ON usage_logs (api_id, occurred_at DESC, id DESC);
CREATE INDEX idx_usage_logs_subscription_time
    ON usage_logs (subscription_id, occurred_at DESC, id DESC);
CREATE INDEX idx_usage_logs_endpoint_time
    ON usage_logs (endpoint_id, occurred_at DESC, id DESC);
```

Worker phải tạo partition tháng kế tiếp trước ít nhất 7 ngày. Retention/archiving quyết định ở Sprint 4; thao tác drop partition chỉ sau backup và chấp thuận Tech Lead.

## Request History an toàn

```sql
CREATE VIEW request_history AS
SELECT
    occurred_at,
    id,
    request_id,
    consumer_id,
    api_id,
    endpoint_id,
    status_code,
    error_code,
    latency_ms,
    is_sandbox
FROM usage_logs;
```

Service áp RBAC trước khi đọc view: Consumer chỉ xem `consumer_id` của mình; Provider chỉ xem API do mình sở hữu; Admin có quyền giám sát. View không có header/body hoặc credential nên an toàn cho UI.

## Ghi log và aggregate

- Gateway ghi batch/asynchronous sau khi trả response; không đưa insert `usage_logs` vào critical path.
- Redis giữ rate limit/quota counter nóng; PostgreSQL usage logs là dữ liệu lâu dài/audit.
- Worker aggregate theo `api_id`, `endpoint_id`, `consumer_id`, ngày/tháng để xây Dashboard; không aggregate bằng cách quét toàn bộ partition trong request UI.
- Khi Redis lỗi, hành vi fail-open/fail-closed cần được Tech Lead chốt trước Sprint 4 và ghi thành runbook.
