# Query bàn giao Backend — Sprint 2

Các query dùng tham số `$1`, `$2` của thư viện `pg`; không nối chuỗi từ dữ liệu người dùng.

## Danh sách API chờ Admin duyệt

```sql
SELECT
    a.id, a.name, a.status, a.submitted_at,
    p.id AS provider_id, p.provider_name,
    u.name AS provider_user_name, u.email AS provider_email
FROM apis a
JOIN api_providers p ON p.id = a.provider_id
JOIN users u ON u.id = p.user_id
WHERE a.status IN ('Submitted', 'Under Review')
ORDER BY a.submitted_at ASC NULLS LAST, a.id ASC;
```

`idx_apis_status_submitted_at` phục vụ query này.

## Lấy API, Provider và các gói giá

```sql
SELECT
    a.id AS api_id, a.name AS api_name, a.status, a.base_url,
    p.id AS provider_id, p.provider_name,
    plan.id AS plan_id, plan.name AS plan_name,
    plan.price_monthly, plan.currency, plan.quota, plan.rate_limit
FROM apis a
JOIN api_providers p ON p.id = a.provider_id
LEFT JOIN api_plans plan ON plan.api_id = a.id AND plan.is_active = TRUE
WHERE a.id = $1
ORDER BY plan.price_monthly ASC, plan.id ASC;
```

## Lọc Audit Log

```sql
SELECT id, actor_id, actor_role, action, target_type, target_id, detail, ip, created_at
FROM audit_logs
WHERE ($1::integer IS NULL OR actor_id = $1)
  AND ($2::varchar IS NULL OR target_type = $2)
  AND ($3::text IS NULL OR target_id = $3)
  AND ($4::timestamptz IS NULL OR created_at >= $4)
  AND ($5::timestamptz IS NULL OR created_at < $5)
ORDER BY created_at DESC, id DESC
LIMIT $6 OFFSET $7;
```

Các index `idx_audit_logs_actor_created_at`, `idx_audit_logs_target_created_at` và `idx_audit_logs_created_at` tương ứng với ba kiểu lọc phổ biến.
