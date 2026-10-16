# Sprint 2 — Danh mục Test Cases Kiểm thử Toàn diện

> **Dự án:** API Marketplace & Management
> **Tài liệu QA Lead:** Trần Hà Thảo Vân (`@vuonghathaovan-gif` — Issue #10)
> **Phạm vi kiểm thử:** US-06 $\to$ US-14 (Epic EP02, EP03, EP04, EP11)
> **Tiêu chuẩn áp dụng:** ISO/IEC/IEEE 29119, Quy trình quản lý bug `docs/05-quy-trinh-quan-ly-bug.md`
> **Quy ước trạng thái:** `Not Run` / `Pass` / `Fail` / `Blocked`

---

## 1. THỐNG KÊ TỔNG QUAN BỘ TEST CASES SPRINT 2

| Nhóm Kiểm thử | Mã User Story | Số lượng TC | Mức High | Mức Medium | Mức Low |
|---|---|:---:|:---:|:---:|:---:|
| **Provider KYC & Verification** | US-06 | 5 | 3 | 2 | 0 |
| **Admin Duyệt Provider** | US-07 | 5 | 4 | 1 | 0 |
| **Pháp lý, Quyền riêng tư & Tên miền** | US-08 | 7 | 5 | 2 | 0 |
| **Quản lý API, Endpoint & Version** | US-09 | 8 | 5 | 3 | 0 |
| **Import OpenAPI & Tài liệu 7 khối** | US-10 | 6 | 4 | 2 | 0 |
| **Cấu hình Gói giá Dịch vụ** | US-11 | 5 | 4 | 1 | 0 |
| **Nộp duyệt API & Readiness Checklist** | US-12 | 6 | 5 | 1 | 0 |
| **Admin Duyệt & Xuất bản API** | US-13 | 6 | 5 | 1 | 0 |
| **Quản lý Nhật ký Kiểm toán** | US-14 | 5 | 3 | 2 | 0 |
| **State Machine & Trigger Integrity** | US-12, US-13 | 4 | 4 | 0 | 0 |
| **Bảo mật & Phi chức năng (Security)** | EP11 | 6 | 5 | 1 | 0 |
| **TỔNG CỘNG** | **Toàn bộ Sprint 2** | **63** | **47** | **16** | **0** |

---

## 2. DANH MỤC TEST CASES CHI TIẾT

---

### US-06 — Hồ sơ Xác minh Provider (KYC)

| ID | Ưu tiên | Tiền điều kiện | Các bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Status | Tester |
|---|:---:|---|---|---|---|:---:|:---:|
| **TC-06-01** | High | Token `API_PROVIDER`, chưa có hồ sơ KYC | Gửi `POST /api/provider/verification` | `organizationName: "TechCorp JSC"`, `contactEmail: "legal@techcorp.vn"`, `evidenceUrls: ["https://cdn.test/gpdkkd.pdf"]` | Trả về `201 Created`; trạng thái hồ sơ `Pending`; `submitted_at` có giá trị | Not Run | Thảo Vân |
| **TC-06-02** | High | Token `API_PROVIDER` | Gửi `POST /api/provider/verification` thiếu dữ liệu | `organizationName: ""` hoặc `contactEmail: "sai-email"` hoặc `evidenceUrls: []` | Trả về `400 Bad Request`, mã `VALIDATION_ERROR`, nêu rõ trường lỗi | Not Run | Thảo Vân |
| **TC-06-03** | Medium | Đã có hồ sơ `Pending` hoặc `Verified` | Gửi tiếp `POST /api/provider/verification` | Payload hợp lệ | Trả về `409 Conflict`, mã `VERIFICATION_IN_PROGRESS` hoặc `ALREADY_VERIFIED` | Not Run | Thảo Vân |
| **TC-06-04** | High | Hồ sơ trước đó bị `Rejected` | Gửi lại `POST /api/provider/verification` sau khi bổ sung giấy tờ | `organizationName: "TechCorp JSC"`, link bằng chứng mới | Trả về `201 Created`; tạo bản ghi mới với trạng thái `Pending`; mở lại quy trình duyệt | Not Run | Thảo Vân |
| **TC-06-05** | Medium | Token `API_PROVIDER` | Gửi `GET /api/provider/verification` | Không có | Trả về `200 OK` kèm thông tin hồ sơ mới nhất (gồm `rejectReason` nếu bị từ chối) | Not Run | Thảo Vân |

---

### US-07 — Admin Duyệt & Từ chối Hồ sơ Provider

| ID | Ưu tiên | Tiền điều kiện | Các bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Status | Tester |
|---|:---:|---|---|---|---|:---:|:---:|
| **TC-07-01** | High | Token `ADMIN`, có $\ge 1$ hồ sơ `Pending` | Gửi `GET /api/admin/provider-verifications?status=Pending` | Query `status=Pending` | Trả về `200 OK` danh sách các hồ sơ đang chờ duyệt của Provider | Not Run | Thảo Vân |
| **TC-07-02** | High | Hồ sơ Provider đang `Pending` | Gửi `POST /api/admin/provider-verifications/{providerId}/review` duyệt thành công | `{ "decision": "Verified" }` | Trả về `200 OK`; trạng thái đổi thành `Verified`; ghi audit log `provider.verified`; Provider được phép tạo API | Not Run | Thảo Vân |
| **TC-07-03** | High | Hồ sơ Provider đang `Pending` | Gửi review từ chối nhưng không nhập lý do | `{ "decision": "Rejected" }` (thiếu `reason`) | Trả về `400 Bad Request`, mã `REASON_REQUIRED`; không thay đổi trạng thái | Not Run | Thảo Vân |
| **TC-07-04** | High | Hồ sơ Provider đang `Pending` | Gửi review từ chối có lý do rõ ràng | `{ "decision": "Rejected", "reason": "Giấy phép kinh doanh không khớp tên doanh nghiệp" }` | Trả về `200 OK`; trạng thái chuyển `Rejected`; lưu `reject_reason`; ghi audit log | Not Run | Thảo Vân |
| **TC-07-05** | Medium | Hồ sơ Provider đã `Verified` hoặc `Rejected` | Admin gửi lại yêu cầu review trên hồ sơ cũ | `{ "decision": "Verified" }` | Trả về `409 Conflict`, mã `VERIFICATION_ALREADY_REVIEWED` | Not Run | Thảo Vân |

---

### US-08 — Khai báo Pháp lý, Quyền riêng tư & Xác minh Tên miền

| ID | Ưu tiên | Tiền điều kiện | Các bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Status | Tester |
|---|:---:|---|---|---|---|:---:|:---:|
| **TC-08-01** | Medium | Đã đăng nhập hệ thống | Gửi `GET /api/provider/agreement` | Không có | Trả về `200 OK` thỏa thuận nhà cung cấp đang có hiệu lực (`is_active: true`, `version`) | Not Run | Thảo Vân |
| **TC-08-02** | High | API `Draft` của Provider | Gửi `PUT /api/provider/apis/{id}/legal` không xử lý dữ liệu cá nhân | `agreementId`, `ownershipDeclaration: "Tự phát triển"`, `distributionRights: "Toàn quyền"`, `dataClassification: "Public"`, `processesPersonalData: false` | Trả về `200 OK`; lưu thông tin pháp lý; `accepted_at` lấy thời gian server | Not Run | Thảo Vân |
| **TC-08-03** | High | API `Draft` của Provider | Gửi `PUT /api/provider/apis/{id}/legal` có dữ liệu cá nhân nhưng thiếu mô tả | `processesPersonalData: true`, `personalDataTypes: []`, `dataProcessingPurpose: ""` | Trả về `400 Bad Request` (vi phạm ràng buộc DB); yêu cầu kê khai cụ thể loại dữ liệu & mục đích | Not Run | Thảo Vân |
| **TC-08-04** | High | API `Draft` của Provider | Gửi `PUT /api/provider/apis/{id}/legal` có dữ liệu cá nhân đầy đủ | `processesPersonalData: true`, `personalDataTypes: ["Email", "Phone"]`, `dataProcessingPurpose: "Xác thực OTP"` | Trả về `200 OK`; lưu trữ thành công thông tin phân loại & bảo vệ dữ liệu cá nhân | Not Run | Thảo Vân |
| **TC-08-05** | High | API có `baseUrl: "https://api.test.vn"` | Gửi `POST /api/provider/apis/{id}/domain-verification/challenge` | Không có | Trả về `201 Created`; sinh mã TXT hash 64 hex; hạn `challenge_expires_at` 24h | Not Run | Thảo Vân |
| **TC-08-06** | High | Đã cấu hình bản ghi DNS TXT | Gửi `POST /api/provider/apis/{id}/domain-verification/verify` | Hostname hợp lệ | Tra cứu DNS thật thành công; cập nhật `verified: true`, cấp hạn 7 ngày; trả về `200 OK` | Not Run | Thảo Vân |
| **TC-08-07** | Medium | Tên miền chưa cấu hình DNS hoặc sai token | Gửi `POST /api/provider/apis/{id}/domain-verification/verify` | Hostname chưa tạo bản ghi TXT | Trả về `400 Bad Request` hoặc `503 Service Unavailable`; không đánh dấu verified | Not Run | Thảo Vân |

---

### US-09 — Quản lý API, Endpoint & Version

| ID | Ưu tiên | Tiền điều kiện | Các bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Status | Tester |
|---|:---:|---|---|---|---|:---:|:---:|
| **TC-09-01** | High | Provider chưa `Verified` | Gọi `POST /api/provider/apis` tạo API | Payload hợp lệ | Bị chặn `403 Forbidden`, mã `PROVIDER_NOT_VERIFIED` | Not Run | Thảo Vân |
| **TC-09-02** | High | Provider đã `Verified` | Gọi `POST /api/provider/apis` tạo API | `name: "E-Invoice API"`, `category: "Finance"`, `baseUrl: "https://api.einvoice.vn"`, `tags: ["vat"]` | Trả về `201 Created`; trạng thái ban đầu bắt buộc là `Draft`; các mốc duyệt đều `null` | Not Run | Thảo Vân |
| **TC-09-03** | Medium | Đã có API `"E-Invoice API"` | Tạo tiếp API thứ hai trùng tên `"E-Invoice API"` trong cùng Provider | Trùng `name` | Trả về `409 Conflict` (vi phạm ràng buộc UNIQUE `uq_apis_provider_name`) | Not Run | Thảo Vân |
| **TC-09-04** | High | API `Draft` của Provider | Thêm phiên bản mới `POST /api/provider/apis/{id}/versions` | `{ "version": "v1.0.0", "changelog": "Bản đầu tiên" }` | Trả về `201 Created`; version được liên kết chặt chẽ với `api_id` | Not Run | Thảo Vân |
| **TC-09-05** | High | Version `v1.0.0` tồn tại | Thêm Endpoint `POST /api/provider/apis/{id}/endpoints` | `method: "GET"`, `path: "/invoices"`, `description: "Lấy hóa đơn"`, `versionId` | Trả về `201 Created`; endpoint gắn đúng version; xóa cached documentation | Not Run | Thảo Vân |
| **TC-09-06** | Medium | Endpoint tồn tại | Thêm Endpoint trùng method và path trong cùng version | `method: "GET"`, `path: "/invoices"`, cùng `versionId` | Trả về `409 Conflict` (vi phạm `uq_api_endpoints_version_method_path`) | Not Run | Thảo Vân |
| **TC-09-07** | Medium | API `Draft` | Xóa API qua `DELETE /api/provider/apis/{id}` | Không có | Trả về `204 No Content`; cascade xóa toàn bộ versions, endpoints, plans liên quan | Not Run | Thảo Vân |
| **TC-09-08** | High | API đang ở `Submitted` / `Published` | Gọi `PUT /api/provider/apis/{id}` hoặc `DELETE` endpoint | Thay đổi dữ liệu | Trả về `409 Conflict`, mã `API_FROZEN_NOT_DRAFT`; dữ liệu được bảo vệ an toàn | Not Run | Thảo Vân |

---

### US-10 — Import OpenAPI 3.0 / Swagger 2.0 & Tài liệu 7 Khối

| ID | Ưu tiên | Tiền điều kiện | Các bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Status | Tester |
|---|:---:|---|---|---|---|:---:|:---:|
| **TC-10-01** | High | API `Draft`, version `v1` | Upload file OpenAPI hợp lệ (demo weather) qua `POST .../import-openapi` | File `mock-services/weather/openapi.json`, multipart form | Trả về `200 OK` kèm `versionId`, `endpointCount`; tự động bóc tách endpoints & doc | Not Run | Thảo Vân |
| **TC-10-02** | High | Import thành công ở TC-10-01 | Gọi `GET /api/provider/apis/{id}/documentation` | Không có | Trả về `200 OK` đầy đủ cấu trúc 7 khối chuẩn hóa (Overview, Auth, Endpoints, Params, Body, Response, Errors) | Not Run | Thảo Vân |
| **TC-10-03** | High | API `Draft` | Upload file dung lượng $> 1\text{ MB}$ | File `large_spec.json` (kích thước 1.5MB) | Trả về `413 Payload Too Large`; từ chối xử lý ngay từ tầng upload | Not Run | Thảo Vân |
| **TC-10-04** | High | API `Draft` | Upload file hỏng cú pháp JSON/YAML | File `broken_syntax.yaml` (lỗi indent, cú pháp sai) | Trả về `400 Bad Request`, mã `OPENAPI_PARSE_ERROR` kèm vị trí lỗi cụ thể | Not Run | Thảo Vân |
| **TC-10-05** | High | Version đã có sẵn 3 endpoints | Upload file OpenAPI mới nhưng cố tình tiêm lỗi DB giữa chừng | File OpenAPI chứa tham số lỗi | Toàn bộ giao dịch bị Rollback nguyên tử; 3 endpoints cũ vẫn giữ nguyên, không mất dữ liệu | Not Run | Thảo Vân |
| **TC-10-06** | Medium | API `Draft` | Upload file OpenAPI chứa ký tự `\u0000` (NUL byte) | Chuỗi JSON có chứa `\u0000` | Hệ thống tự động làm sạch ký tự NUL trước khi insert PostgreSQL, không phát sinh lỗi 500 | Not Run | Thảo Vân |

---

### US-11 — Cấu hình Gói giá Dịch vụ (Pricing Plans)

| ID | Ưu tiên | Tiền điều kiện | Các bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Status | Tester |
|---|:---:|---|---|---|---|:---:|:---:|
| **TC-11-01** | High | API `Draft` | Tạo gói cước Free hợp lệ qua `POST .../plans` | `name: "Free"`, `priceMonthly: 0`, `quota: 1000`, `rateLimit: 60`, `currency: "VND"` | Trả về `201 Created`; gói cước Free được lưu thành công | Not Run | Thảo Vân |
| **TC-11-02** | High | API `Draft` | Cố tình tạo gói Free với giá tiền $> 0$ | `name: "Free"`, `priceMonthly: 50000` | Trả về `400 Bad Request` (vi phạm ràng buộc `chk_api_plans_price`) | Not Run | Thảo Vân |
| **TC-11-03** | High | API `Draft` | Tạo gói Pro có phí hợp lệ | `name: "Pro"`, `priceMonthly: 500000`, `quota: 100000`, `rateLimit: 500`, `currency: "VND"` | Trả về `201 Created`; lưu đầy đủ thông tin gói trả phí | Not Run | Thảo Vân |
| **TC-11-04** | High | API `Draft` | Tạo gói cước với Quota hoặc RateLimit $\le 0$ | `quota: 0` hoặc `rateLimit: -5` | Trả về `400 Bad Request` (vi phạm `chk_api_plans_quota`, `chk_api_plans_rate_limit`) | Not Run | Thảo Vân |
| **TC-11-05** | Medium | Đã có gói `"Free"` | Tạo tiếp gói thứ hai cùng tên `"Free"` cho API này | `name: "Free"` | Trả về `409 Conflict` (vi phạm ràng buộc UNIQUE `uq_api_plans_api_name`) | Not Run | Thảo Vân |

---

### US-12 — Nộp duyệt API & Danh mục Sẵn sàng (Readiness Checklist)

| ID | Ưu tiên | Tiền điều kiện | Các bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Status | Tester |
|---|:---:|---|---|---|---|:---:|:---:|
| **TC-12-01** | Medium | API `Draft` mới tạo | Gọi `GET /api/provider/apis/{id}/publish-status` | Không có | Trả về `200 OK` chi tiết 5 hạng mục checklist; các mục chưa làm báo `ready: false` | Not Run | Thảo Vân |
| **TC-12-02** | High | API chưa xác minh Domain hoặc chưa có Plan | Gọi `POST /api/provider/apis/{id}/submit-review` | Không có | Trả về `400 Bad Request`, mã `READINESS_CHECKLIST_INCOMPLETE`, chỉ rõ mục thiếu | Not Run | Thảo Vân |
| **TC-12-03** | High | API chưa hoàn tất khai báo pháp lý hoặc chưa chấp nhận Agreement | Gọi `POST /api/provider/apis/{id}/submit-review` | Không có | Trả về `400 Bad Request`, chặn gửi duyệt vì chưa cam kết pháp lý | Not Run | Thảo Vân |
| **TC-12-04** | High | Thỏa mãn đủ 5 điều kiện trong Readiness Checklist | Gọi `POST /api/provider/apis/{id}/submit-review` | Không có | Trả về `200 OK`; trạng thái đổi `Submitted`; `submitted_at` cập nhật; ghi audit log | Not Run | Thảo Vân |
| **TC-12-05** | High | API vừa chuyển sang `Submitted` | Gọi `PUT /api/provider/apis/{id}` sửa đổi tên hoặc baseUrl | Payload sửa đổi | Bị chặn `409 Conflict`; dữ liệu bị đóng băng (freeze) trong suốt thời gian chờ duyệt | Not Run | Thảo Vân |
| **TC-12-06** | High | API có trạng thái `Rejected` | Gọi `POST /api/provider/apis/{id}/reopen` | Không có | Trả về `200 OK`; trạng thái chuyển về `Draft`; cho phép Provider sửa và nộp lại | Not Run | Thảo Vân |

---

### US-13 — Admin Duyệt, Từ chối & Xuất bản API

| ID | Ưu tiên | Tiền điều kiện | Các bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Status | Tester |
|---|:---:|---|---|---|---|:---:|:---:|
| **TC-13-01** | High | API đang `Submitted` | Admin gọi `GET /api/admin/apis/{id}/dossier` | Không có | Trả về `200 OK` đầy đủ dossier (API, Provider, Versions, Endpoints, Plans, Legal, Docs, Reviews) | Not Run | Thảo Vân |
| **TC-13-02** | High | API có `processesPersonalData: true` | Admin xem dossier | Không có | Dossier trả về cờ cảnh báo dữ liệu cá nhân, danh sách trường nhạy cảm và mục đích | Not Run | Thảo Vân |
| **TC-13-03** | High | API đang `Submitted` | Admin gọi review `{ "next": "Approved" }` | Body `{ "next": "Approved" }` | Tự động chạy transaction `Submitted` $\to$ `Under Review` $\to$ `Approved`; ghi 2 dòng `api_reviews`, 1 dòng `audit_logs` | Not Run | Thảo Vân |
| **TC-13-04** | High | API đang `Submitted` | Admin gọi review từ chối thiếu lý do | `{ "next": "Rejected" }` (thiếu `reason`) | Trả về `400 Bad Request`, mã `REASON_REQUIRED`; không đổi trạng thái | Not Run | Thảo Vân |
| **TC-13-05** | High | API đang `Submitted` | Admin gọi review từ chối có lý do | `{ "next": "Rejected", "reason": "Tài liệu endpoint còn thiếu schema phản hồi lỗi" }` | Trả về `200 OK`; chuyển sang `Rejected`; lưu lý do từ chối vào `api_reviews` và `audit_logs` | Not Run | Thảo Vân |
| **TC-13-06** | High | API đang `Approved` | Admin gọi xuất bản `{ "next": "Published" }` | `{ "next": "Published" }` | Trả về `200 OK`; API chuyển `Published`, `published_at` có giá trị; sẵn sàng hiển thị trên Marketplace | Not Run | Thảo Vân |

---

### US-14 — Quản lý Nhật ký Kiểm toán (Audit Logs)

| ID | Ưu tiên | Tiền điều kiện | Các bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Status | Tester |
|---|:---:|---|---|---|---|:---:|:---:|
| **TC-14-01** | High | Token `ADMIN` | Gọi `GET /api/admin/audit-logs` | `page=1&pageSize=10` | Trả về `200 OK` danh sách audit logs sắp xếp `created_at DESC`, có phân trang | Not Run | Thảo Vân |
| **TC-14-02** | High | Token `ADMIN` | Lọc audit theo hành động và đối tượng | `action=api.submitted&targetType=api` | Trả về `200 OK` chỉ các bản ghi thỏa mãn điều kiện lọc | Not Run | Thảo Vân |
| **TC-14-03** | Medium | Token `ADMIN` | Lọc audit với khoảng thời gian hợp lệ | `from=2026-10-01&to=2026-10-20` | Trả về `200 OK` các bản ghi nằm trong khoảng thời gian chỉ định | Not Run | Thảo Vân |
| **TC-14-04** | Medium | Token `ADMIN` | Lọc audit với khoảng thời gian sai logic (`from > to`) | `from=2026-10-20&to=2026-10-01` | Trả về `400 Bad Request`, mã `INVALID_DATE_RANGE` | Not Run | Thảo Vân |
| **TC-14-05** | High | Token `ADMIN` | Gọi `GET /api/admin/audit-logs/actions` | Không có | Trả về `200 OK` danh sách chuỗi các action name duy nhất trong hệ thống | Not Run | Thảo Vân |

---

### State Machine & Database Trigger Integrity

| ID | Ưu tiên | Tiền điều kiện | Các bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Status | Tester |
|---|:---:|---|---|---|---|:---:|:---:|
| **TC-SM-01** | High | API đang ở trạng thái `Draft` | Thử cập nhật trạng thái trực tiếp bằng SQL/API lên `Approved` | Nhảy cóc `Draft` $\to$ `Approved` | Bị Trigger DB chặn `RAISE EXCEPTION 'Invalid API status transition'`; mã lỗi SQL `23514` | Not Run | Thảo Vân |
| **TC-SM-02** | High | API đang ở trạng thái `Submitted` | Thử xuất bản ngay `Submitted` $\to$ `Published` | Nhảy cóc trạng thái | Bị Trigger DB chặn; từ chối chuyển trạng thái trực tiếp khi chưa qua `Approved` | Not Run | Thảo Vân |
| **TC-SM-03** | High | Provider chưa được `Verified` | Cố tình đổi trạng thái API sang `Submitted` | Provider `Pending` nộp duyệt | Bị Trigger DB chặn `Only a verified provider can submit an API for review` | Not Run | Thảo Vân |
| **TC-SM-04** | High | Thao tác insert API mới | Cố tình tạo API với trạng thái khác `Draft` | Insert với `status: 'Published'` | Bị Trigger DB chặn `A new API must start in Draft state` | Not Run | Thảo Vân |

---

### Bảo mật & Phi chức năng (Security & Non-functional)

| ID | Ưu tiên | Tiền điều kiện | Các bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Status | Tester |
|---|:---:|---|---|---|---|:---:|:---:|
| **TC-SEC-01** | High | Chức năng xác minh Domain | Cố tình tạo challenge cho IP nội bộ (SSRF payload) | `baseUrl: "http://127.0.0.1:8080"` hoặc `http://169.254.169.254"` | Hệ thống chặn ngay từ domain verifier; từ chối xác thực IP loopback/private metadata | Not Run | Thảo Vân |
| **TC-SEC-02** | High | Xem chi tiết bản ghi Audit Log | Kiểm tra trường `detail` của các action liên quan đến token, mật khẩu, DNS challenge | Bản ghi sinh ra từ login, verify domain | Mọi token nhạy cảm đều được che mờ (`[REDACTED]`) hoặc lưu dưới dạng hash; không rò rỉ plain-text | Not Run | Thảo Vân |
| **TC-SEC-03** | High | Documentation Viewer | File OpenAPI chứa mã XSS trong Description / Summary | `<img src=x onerror=alert(1)>` hoặc `<script>...</script>` | Giao diện Documentation Viewer encode ký tự an toàn; không thực thi JavaScript độc hại | Not Run | Thảo Vân |
| **TC-SEC-04** | High | Token của `API_PROVIDER` (User A) | Cố tình gọi `GET /api/provider/apis/{id_cua_User_B}` | ID API thuộc Provider khác | Bị chặn `404 Not Found` hoặc `403 Forbidden`; không lộ dữ liệu chéo giữa các Provider | Not Run | Thảo Vân |
| **TC-SEC-05** | High | Token của `USER` (Consumer) | Cố tình gọi các endpoint `/api/provider/*` và `/api/admin/*` | Token Consumer hợp lệ | Toàn bộ các endpoint đều trả về `403 Forbidden` đúng theo Ma trận RBAC | Not Run | Thảo Vân |
| **TC-SEC-06** | Medium | Chưa có token đăng nhập (Guest) | Gọi bất kỳ endpoint nào trong 30 API Provider và 8 API Admin | Không truyền Bearer token | Toàn bộ các endpoint đều trả về `401 Unauthorized` | Not Run | Thảo Vân |
