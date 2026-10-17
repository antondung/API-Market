# ERD Sprint 2 — Issue #9

```mermaid
erDiagram
    users ||--o| api_providers : owns
    api_providers ||--o{ provider_verifications : submits
    users ||--o{ provider_verifications : reviews
    api_providers ||--o{ apis : publishes
    apis ||--o{ api_versions : has
    api_versions ||--o{ api_endpoints : defines
    api_versions ||--|| api_documentations : documents
    apis ||--o{ api_plans : offers
    apis ||--|| api_legal_declarations : declares
    agreements ||--o{ api_legal_declarations : accepted_in
    apis ||--o{ api_reviews : reviewed
    users ||--o{ api_reviews : performs
    users ||--o{ audit_logs : performs
```

Trạng thái API hợp lệ: `Draft → Submitted → Under Review → Approved → Published`.
Từ `Under Review` có thể chuyển sang `Rejected`; Provider có thể đưa `Rejected` về `Draft` để chỉnh sửa và nộp lại. Trigger trong migration `003` chặn mọi chuyển trạng thái khác và chặn Provider chưa được xác minh nộp API.
