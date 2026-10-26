# ERD Sprint 3 — Marketplace, Gateway, Sandbox và API Key

```mermaid
erDiagram
    users ||--o{ sandbox_grants : receives
    apis ||--o{ sandbox_grants : permits_trying
    users ||--o{ api_keys : owns
    apis ||--o{ api_keys : authorizes
    apis ||--|| gateway_routes : routes_through
    api_providers ||--o{ apis : publishes
    users ||--o{ reports : files
    users ||--o{ reports : reviews
    apis ||--o{ reports : receives
```

- Một Consumer có nhiều Sandbox Grant, nhưng chỉ có một grant cho mỗi API (`UNIQUE (consumer_id, api_id)`).
- Một User có tối đa một API Key **active** cho mỗi API. Rotate/revoke sẽ vô hiệu hóa key cũ trước khi tạo key mới.
- Một API có tối đa một Gateway Route trong Sprint 3. Gateway chỉ forward khi route enabled và API `Published`.
- `usage_logs`/`request_history` được chốt thiết kế tại [sprint3-usage-log-design.md](./sprint3-usage-log-design.md); tạo bảng thật ở Sprint 4 cùng Subscription.
