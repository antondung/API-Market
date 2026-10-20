# Query bàn giao Backend — Sprint 3

Mọi query dưới đây dùng tham số `$1`, `$2`, ... của `pg`; không nối chuỗi từ input người dùng. Tên cột sort phải được map từ allowlist ở service, không đưa thẳng vào SQL.

## 1. Marketplace: Search / Filter / Sort / Pagination (US-16)

### Trang đầu tiên: full-text search, category, tag và giá thấp nhất

```sql
WITH matched AS (
    SELECT
        a.id,
        a.name,
        a.description,
        a.category,
        a.tags,
        a.published_at,
        p.id AS provider_id,
        p.provider_name,
        ts_rank_cd(
            to_tsvector('simple', COALESCE(a.name, '') || ' ' || COALESCE(a.description, '') || ' ' || COALESCE(a.category, '')),
            websearch_to_tsquery('simple', $1)
        ) AS relevance,
        cheapest.price_monthly AS lowest_price
    FROM apis a
    JOIN api_providers p ON p.id = a.provider_id
    LEFT JOIN LATERAL (
        SELECT plan.price_monthly
        FROM api_plans plan
        WHERE plan.api_id = a.id AND plan.is_active = TRUE
        ORDER BY plan.price_monthly ASC, plan.id ASC
        LIMIT 1
    ) cheapest ON TRUE
    WHERE a.status = 'Published'
      AND ($1::text IS NULL OR to_tsvector('simple', COALESCE(a.name, '') || ' ' || COALESCE(a.description, '') || ' ' || COALESCE(a.category, '')) @@ websearch_to_tsquery('simple', $1))
      AND ($2::varchar IS NULL OR a.category = $2)
      AND ($3::text IS NULL OR a.tags @> jsonb_build_array($3::text))
      AND ($4::numeric IS NULL OR cheapest.price_monthly >= $4)
      AND ($5::numeric IS NULL OR cheapest.price_monthly <= $5)
)
SELECT *
FROM matched
ORDER BY
    CASE WHEN $6::text = 'relevance' THEN relevance END DESC NULLS LAST,
    CASE WHEN $6::text = 'price_asc' THEN lowest_price END ASC NULLS LAST,
    CASE WHEN $6::text = 'price_desc' THEN lowest_price END DESC NULLS LAST,
    CASE WHEN $6::text = 'oldest' THEN published_at END ASC NULLS LAST,
    published_at DESC,
    id DESC
LIMIT $7 OFFSET $8;
```

`$6` chỉ nhận `newest`, `oldest`, `relevance`, `price_asc`, `price_desc`; service phải reject giá trị khác. Với trang sâu, ưu tiên keyset pagination bằng cặp `(published_at, id)` thay vì `OFFSET` lớn.

### Keyset pagination cho sort `newest`

```sql
SELECT a.id, a.name, a.description, a.category, a.tags, a.published_at,
       p.id AS provider_id, p.provider_name
FROM apis a
JOIN api_providers p ON p.id = a.provider_id
WHERE a.status = 'Published'
  AND ($1::varchar IS NULL OR a.category = $1)
  AND ($2::timestamptz IS NULL OR (a.published_at, a.id) < ($2, $3::integer))
ORDER BY a.published_at DESC, a.id DESC
LIMIT $4;
```

Cursor trả về cho client là `published_at` và `id` của phần tử cuối, không phải offset.

## 2. Routing registry cho Gateway (US-22)

```sql
SELECT route.id, route.api_id, route.upstream_base_url, route.timeout_ms
FROM gateway_routes route
JOIN apis api ON api.id = route.api_id
WHERE route.api_id = $1
  AND route.is_enabled = TRUE
  AND api.status = 'Published';
```

Gateway chỉ dùng route của API `Published`; backend/Gateway phải tiếp tục kiểm tra host chống SSRF trước khi forward.

## 3. Sandbox Grant: cấp và dùng lượt thử (US-19)

```sql
-- Cấp một lần cho một Consumer/API. expires_at được tính ở service, ví dụ NOW() + interval '24 hours'.
INSERT INTO sandbox_grants (consumer_id, api_id, max_requests, expires_at)
VALUES ($1, $2, $3, $4)
ON CONFLICT (consumer_id, api_id) DO NOTHING
RETURNING id, max_requests, used_requests, expires_at;

-- Tiêu thụ đúng một lượt một cách atomic. Hết lượt/expired/revoked/API chưa Published trả SQLSTATE P0001.
SELECT sandbox_grant_id, remaining_requests
FROM consume_sandbox_grant($1, $2);
```

Không tự tăng `used_requests` bằng `SELECT` rồi `UPDATE`; thao tác đó có race condition khi Playground nhận request đồng thời.

## 4. API Key: create / verify / rotate / revoke / last used (US-21)

Backend sinh plaintext một lần, trả về HTTPS response một lần, rồi chỉ gửi SHA-256 hex vào `$4`.

```sql
-- Create: chỉ một API key active trên mỗi User/API. Rotate phải revoke key cũ trước.
INSERT INTO api_keys (user_id, api_id, key_prefix, key_hash, label)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, key_prefix, label, created_at;

-- Gateway verify: $1 là SHA-256 hash của X-API-Key nhận được.
UPDATE api_keys
SET last_used_at = CURRENT_TIMESTAMP
WHERE key_hash = $1
  AND is_active = TRUE
  AND revoked_at IS NULL
RETURNING id, user_id, api_id;

-- Revoke/rotate: chỉ owner được phép gọi, kiểm tra ownership tại service.
UPDATE api_keys
SET is_active = FALSE, revoked_at = CURRENT_TIMESTAMP
WHERE id = $1 AND user_id = $2 AND is_active = TRUE
RETURNING id;
```

Không log plaintext key, hash, `Authorization`, cookie hay request/response body.

## 5. Đo query Marketplace với 1.000 API

Trên database test có dữ liệu benchmark, chạy:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT a.id, a.name, a.category, a.published_at
FROM apis a
WHERE a.status = 'Published'
  AND a.category = 'Benchmark'
ORDER BY a.published_at DESC, a.id DESC
LIMIT 20;
```

Kỳ vọng planner dùng `idx_apis_marketplace_category_published` hoặc `idx_apis_marketplace_published_newest`, không quét toàn bộ bảng. Bài test `backend/integration/sprint3-database.test.ts` tạo 1.000 API Published, chạy query trang đầu và in thời gian đo vào test diagnostic.
