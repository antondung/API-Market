# Báo cáo Kiểm thử Tổng hợp Sprint 2 (Sprint 2 Test Report)

> **Dự án:** API Marketplace Platform
> **Giai đoạn:** Sprint 2 — Quản lý Nhà cung cấp, Xác thực & Tuân thủ (Provider Compliance & Publishing Workflow)
> **QA Automation & Documentation Lead:** Trần Hà Thảo Vân (`@vuonghathaovan-gif` — Issue #10)
> **Thời điểm xuất bản:** 16/10/2026
> **Nhánh lưu trữ & kiểm thử:** `docs/10-sprint2-qa-compliance` / `test/10-provider-compliance`
> **Mã Commit Bàn giao:** `3ce5c6b` (và các commit liên quan)

---

## I. Tổng quan Đợt Kiểm thử Sprint 2

### 1. Mục tiêu & Phạm vi Kiểm thử
Đợt kiểm thử Sprint 2 nhằm xác minh chất lượng toàn diện của nền tảng API Marketplace ở cả tầng Cơ sở dữ liệu, API Backend, Giao diện Frontend và Luồng tích hợp đầu mối (E2E), bao gồm 9 User Story cốt lõi (`US-06` đến `US-14`):
- **US-06:** Hồ sơ xác minh Provider (KYC 4 trạng thái, thông tin tổ chức/cá nhân, tài liệu pháp lý).
- **US-07:** Admin duyệt & từ chối hồ sơ Provider (hàng chờ Pending, bắt buộc lý do khi Reject, chống duyệt trùng 409).
- **US-08:** Khai báo pháp lý, Bản quyền API, Phân loại dữ liệu cá nhân (Personal Data Classification), Thỏa thuận nền tảng và Xác minh quyền sở hữu tên miền (DNS TXT challenge).
- **US-09:** Quản lý vòng đời API, Endpoint, Version (CRUD ở trạng thái Draft, ràng buộc chỉ Provider đã Verified mới được tạo API).
- **US-10:** Nhập đặc tả OpenAPI 3.0 / Swagger 2.0 (tính nguyên tử rollback khi lỗi, giới hạn $\le$ 1MB, sinh tài liệu chuẩn hóa 7 khối).
- **US-11:** Cấu hình gói giá dịch vụ (Free/Basic/Pro, ràng buộc gói Free có giá = 0, hạn mức Quota & Rate Limit hợp lệ).
- **US-12:** Quy trình nộp duyệt API (Readiness checklist 5 điều kiện, đóng băng bản ghi khi chuyển sang `Submitted`).
- **US-13:** Admin thẩm định, xem Dossier và xuất bản API (cảnh báo dữ liệu cá nhân, máy trạng thái tuần tự `Submitted` $\to$ `Under Review` $\to$ `Approved` $\to$ `Published`, chặn nhảy cóc trạng thái).
- **US-14:** Nhật ký kiểm toán hệ thống (Audit Logs bất biến, lọc theo đối tượng/hành động/thời gian, phân trang, che mờ dữ liệu nhạy cảm).

### 2. Môi trường Thực thi Kiểm thử
- **Hệ điều hành:** Windows 11 Enterprise x64 / Docker Desktop.
- **Cơ sở dữ liệu:** PostgreSQL 17.11 Alpine (chạy container Docker `api-market-postgres` tại cổng 5432).
- **Backend Runtime:** Node.js v24.21.0, Express 5.2.1, TypeScript 5.9.3, pg 8.23.1, Zod 4.6.5.
- **Frontend Runtime:** React 19.2.8, Vite 8.3.0, React Router v7.3.0, Vitest 5.0.4, Playwright.
- **Công cụ kiểm thử tự động:** `qa-scripts/retest-runner.js`, `qa-scripts/sprint2-backend-runner.js`, Playwright headless runner.

### 3. Ma trận Nhánh Mã nguồn & Trạng thái Tích hợp
| Nhánh Git | Vai trò & Nội dung | Trạng thái Đối soát QA |
|---|---|:---:|
| `develop` (commit `db2e3fd`) | Nhánh tích hợp chính của dự án, đã merge PR #49 Backend Sprint 2 | **Sẵn sàng** |
| `origin/codex/issue-7-provider-foundation` (PR #49) | Nền tảng Backend Provider, Admin Review, Domain Privacy & Audit Logs | **Đã verify 100%** (74 Unit tests + 60 E2E tests Pass) |
| `origin/codex/sprint2-provider-fe` (PR #52) | Giao diện Provider Portal & 5 màn hình quản trị Provider | **Đã verify 100%** (86 Component tests Pass) |
| `origin/feature/9-provider-database` | Lược đồ CSDL: migration 003 (Provider) và migration 005 (Privacy & DNS) | **Đã verify 100%** (Migrate & Seed sạch lỗi) |
| `test/10-provider-compliance` / `docs/10-sprint2-qa-compliance` | Nhánh lưu vết chính thức của QA Lead Issue #10 | **Đã commit & push** lên GitHub |

---

## II. Kết quả Kiểm thử Hồi quy & Tồn đọng Sprint 1

Trước khi tiến hành nghiệm thu tính năng mới của Sprint 2, QA Lead đã thực thi kiểm thử hồi quy toàn bộ Sprint 1 (`US-01` đến `US-04`), giải quyết dứt điểm 9 Test Case tồn đọng từ Sprint 1:

### 1. Bảng Tổng hợp Kết quả Hồi quy Sprint 1
| Phân hệ / User Story | Tổng số TC | Pass trơn | Pass có lưu ý | Fail | Blocked | Tỷ lệ Đạt |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **US-01: Đăng ký tài khoản (Register)** | 9 | 9 | 0 | 0 | 0 | 100% |
| **US-02: Đăng nhập & Xác thực (Login & JWT)** | 8 | 8 | 0 | 0 | 0 | 100% |
| **US-03: Phân quyền & Route Guard (RBAC)** | 8 | 7 | 1 (R1) | 0 | 0 | 100% |
| **US-04: Quản lý người dùng Admin (User Management)** | 5 | 4 | 1 (R2) | 0 | 0 | 100% |
| **Bảo mật & Rate Limit (Security/EP11)** | 3 | 3 | 0 | 0 | 0 | 100% |
| **TỔNG CỘNG SPRINT 1** | **33** | **31** | **2** | **0** | **0** | **100%** |

### 2. Chi tiết Giải quyết 9 Test Case Tồn đọng
1. **4 Test Cases Blocked của US-04 (Admin User Management):**
   - `TC-04-01` (Xem danh sách phân trang), `TC-04-02` (Tìm kiếm theo email/tên), `TC-04-03` (Khóa tài khoản), `TC-04-04` (Mở khóa tài khoản): Cả 4 case trước đây bị blocked do thiếu API Backend, nay đã được kiểm thử thực tế trên API `/api/admin/users` và `/api/admin/users/:id/active` kết nối PostgreSQL thật. **Kết quả: 4/4 PASS.**
2. **5 Test Cases UI Not Run (Giao diện):**
   - `TC-01-02` (Validation form Đăng ký), `TC-02-08` (Form Đăng nhập & hiển thị lỗi), `TC-03-06` (Sidebar hiển thị theo vai trò), `TC-03-07` (Chuyển đổi Role Switcher), `TC-03-08` (Route Guard chặn truy cập trái phép). Cả 5 case UI đã được kiểm thử tự động với Playwright và chụp ảnh màn hình lưu vết. **Kết quả: 5/5 PASS.**
3. **Xác nhận Đóng dứt điểm BUG-01 (Issue #46, PR #48):**
   - **Tên Bug:** Lỗi Route Guard không chuyển hướng về `/401` khi người dùng chưa đăng nhập cố tình truy cập `/dashboard`, `/admin`, `/provider`.
   - **Xác minh Retest:** Chạy Playwright headless kiểm tra cả 3 URL trên. Hệ thống chuyển hướng chuẩn xác về `/401`, giao diện hiển thị Unauthorized401Page (`hasConsumerContent = false`).
   - **Trạng thái:** **CLOSED & VERIFIED** trên Issue #46 và PR #48. Quyết định nghiệm thu Sprint 1: **GO**.

---

## III. Kết quả Kiểm thử Backend & Database Sprint 2

### 1. Kết quả Chạy Kiểm thử Sẵn có của Dev
- Đã thực thi lệnh `npm test` trong thư mục `backend/` thông qua `scripts/run-tests.mjs` với chuỗi kết nối `PG_TEST_URL` vào PostgreSQL 17 Docker.
- **Tổng số bài kiểm thử:** **74 tests** (bao gồm cả unit test logic miền và integration test cơ sở dữ liệu).
- **Kết quả:** **74/74 PASS (100%)**, thời gian chạy: 13.01s, 0 lỗi, 0 cảnh báo.

### 2. Kết quả Cơ sở dữ liệu & Thử nghiệm CLI Import Mock Services
- **Thực thi Migration & Seed:** Các tệp migration `001_create_auth_schema.sql`, `003_create_provider_schema.sql`, `005_provider_domain_privacy.sql` cùng seed dữ liệu mẫu chạy thành công 100%, thiết lập đầy đủ 16 bảng và các trigger ràng buộc toàn vẹn trạng thái.
- **Thử nghiệm CLI Import 3 Mock Services:**
  - `npm run provider:import -- mock-services/weather/openapi.json`: Import thành công 1 operation `GET /v1/weather`, sinh đúng schema `Weather`.
  - `npm run provider:import -- mock-services/catalog/openapi.json`: Import thành công 1 operation `GET /v1/products`, sinh đúng schema `ProductList`.
  - `npm run provider:import -- mock-services/currency/openapi.json`: Import thành công 1 operation `GET /v1/rates`, sinh đúng schema `Rates`.

### 3. Kết quả Kiểm thử Biên với Bộ 6 OpenAPI Test Fixtures
Đã xây dựng và lưu trữ bộ tệp tại `qa-scripts/openapi-fixtures/`:
1. `valid-weather-openapi3.json` (OpenAPI 3.0.3 hợp lệ): Import thành công 3 endpoints, tạo lập đầy đủ 7 khối tài liệu chuẩn hóa (`paths`, `components`, `security`).
2. `invalid-syntax.json` (Lỗi cú pháp JSON unclosed quote): Bị chặn ngay từ tầng parser với mã `400 OPENAPI_IMPORT_INVALID`.
3. `missing-required-fields.yaml` (YAML thiếu trường `paths`): Bị chặn đúng quy chuẩn OpenAPI với mã `400 OPENAPI_IMPORT_INVALID`.
4. `invalid-schema-types.json` (Kiểu schema không hợp lệ): Parser từ chối và chỉ rõ đường dẫn lỗi cụ thể của từng schema.
5. `xss-payload-openapi.json` (Chứa mã `<script>`, `<svg>`, `javascript:`): Parser lưu trữ an toàn chuỗi văn bản, không sinh mã thực thi server-side.
6. `oversized-over-1mb.json` (File kích thước 1.05 MB): Bị middleware Multer và CLI import từ chối ngay lập tức với mã `413 / 400 LIMIT_FILE_SIZE`.

### 4. Kết quả Thực thi Tự động E2E Sprint 2 (`qa-scripts/sprint2-backend-runner.js`)
Toàn bộ kịch bản E2E được thực thi tự động qua API `http://127.0.0.1:3000` và cơ sở dữ liệu thực tế, xuất kết quả ra file `qa-scripts/sprint2-backend-results.json`:

| Nhóm Kiểm thử / Phân hệ | User Story liên quan | Số lượng TC | Pass | Fail | Tỷ lệ Đạt | Ghi chú kỹ thuật |
|---|:---:|:---:|:---:|:---:|:---:|---|
| **1. Provider KYC & Admin Review** | US-06 & US-07 | 11 | 11 | 0 | 100% | Bao phủ nộp hồ sơ, pending, reject kèm lý do, resubmit, approve, chặn 409 |
| **2. Ma trận Phân quyền RBAC 5 Vai trò** | RBAC / Security | 6 | 6 | 0 | 100% | Chặn Guest 401, Consumer 403, Provider gọi Admin 403, Unverified tạo API 403 |
| **3. Quản lý API, Version & Endpoint** | US-09 | 7 | 7 | 0 | 100% | CRUD Draft, Versioning, thêm/xóa Endpoint, chặn Provider truy cập chéo |
| **4. Import OpenAPI & 6 Fixtures Biên** | US-10 | 7 | 7 | 0 | 100% | Kiểm thử biên syntax, missing fields, schema type, XSS vectors và file 1.05MB |
| **5. Cấu hình Pricing Plan** | US-11 | 5 | 5 | 0 | 100% | Chặn Free giá > 0, tạo Free giá = 0, tạo gói Pro 499k, cập nhật gói, list plans |
| **6. Khai báo Pháp lý & Tên miền** | US-08 | 7 | 7 | 0 | 100% | Thỏa thuận Agreement, Personal Data classification, DNS TXT challenge token |
| **7. Nộp duyệt & Đóng băng Bản ghi** | US-12 | 5 | 5 | 0 | 100% | Chặn khi chưa verify domain, nộp thành công, đóng băng không cho sửa khi Submitted |
| **8. Admin Thẩm định & State Machine** | US-13 | 7 | 7 | 0 | 100% | Xem Dossier, chặn skip trạng thái, Submitted -> Under Review -> Approved -> Published |
| **9. Quản trị Audit Log & Redaction** | US-14 | 5 | 5 | 0 | 100% | Truy vấn log, lọc đa tiêu chí, phân trang, che mờ dữ liệu nhạy cảm (không lộ token) |
| **TỔNG CỘNG E2E SPRINT 2** | **Toàn bộ 38 API** | **60** | **60** | **0** | **100%** | **Độ phủ 100% 30 API Provider + 8 API Admin** |

---

## IV. Kết quả Kiểm thử Frontend Provider Portal

QA Lead đã kiểm tra trực tiếp mã nguồn và bộ kiểm thử tự động trên nhánh `origin/codex/sprint2-provider-fe`:

### 1. Thống kê Kết quả Chạy Vitest trên Frontend
- **Lệnh thực thi:** `npm test` tại thư mục `frontend/`.
- **Tổng số tệp kiểm thử:** 13 test files.
- **Tổng số Test Cases thực thi:** **86 tests**.
- **Kết quả:** **86/86 PASS 100%** (Thời gian chạy: 5.36s, 0 failed).

### 2. Chi tiết Độ phủ trên 5 Màn hình Provider UI
1. **`ProviderVerificationPage` (7 tests):** Kiểm tra skeleton loading, hiển thị form khi chưa xác minh, validation thông tin doanh nghiệp, trạng thái Pending và xử lý khi bị Rejected.
2. **`MyApisInventoryPage` (4 tests):** Kiểm tra chặn Provider chưa xác minh tạo API, hiển thị danh sách API theo trạng thái (Draft, Submitted, Published), thanh tìm kiếm và bộ lọc.
3. **`OpenApiImportPage` (3 tests):** Kiểm tra upload file OpenAPI JSON/YAML, hiển thị tóm tắt import và hiển thị an toàn đầy đủ 7 khối thông tin của `DocumentationViewer` không dính lỗi XSS.
4. **`EndpointManagementPage` (5 tests):** Kiểm tra hiển thị danh sách phiên bản, lọc endpoint theo version, validation cấu trúc tham số JSON và tạo endpoint mới.
5. **`PricingManagementPage` (3 tests):** Kiểm tra ràng buộc gói Free có giá 0 VND, cấu hình gói trả phí (Basic/Pro), hiển thị danh sách gói giá.
6. **`PublishingWorkflowPage` (3 tests):** Kiểm tra hiển thị pipeline 5 giai đoạn, kiểm tra bảng Readiness Checklist (4 điều kiện bắt buộc) và kích hoạt nút Submit Review.

---

## V. Danh sách Bug & Điểm lệch Phát hiện được (Defects & Gaps)

Tuân thủ đúng quy trình quản lý bug tại `docs/05-quy-trinh-quan-ly-bug.md`, QA Lead ghi nhận 2 điểm kỹ thuật cần lưu ý:

### 1. Điểm lệch GAP-01: Các Trang Admin UI Hiện Chưa Nối API Thật
- **Mã theo dõi:** `GAP-01` (Phân hệ Admin Review & Audit Log).
- **Mức độ (Severity):** **High** (Chặn kiểm thử E2E giao diện Admin trên môi trường thật).
- **Mô tả chi tiết:**
  - Nhánh Frontend `origin/codex/sprint2-provider-fe` đã hoàn thành xuất sắc việc nối API thật cho toàn bộ 5 trang Provider thông qua `frontend/src/services/providerApi.ts`.
  - Tuy nhiên, 4 trang quản trị của Admin hiện tại vẫn đang đọc và ghi dữ liệu từ mock state nội bộ trong bộ nhớ (`AppContext.tsx`), chưa được nối vào 8 API Admin Backend thật:
    + `ProviderVerificationsPage.tsx` (`frontend/src/pages/admin/ProviderVerificationsPage.tsx#L9`): Đang gọi `useApp()`, đọc `INITIAL_VERIFICATIONS` từ `mockData.ts#L23`. Chưa gọi `GET /api/admin/provider-verifications` và `POST /api/admin/provider-verifications/:id/review`.
    + `ApiReviewsPage.tsx` (`frontend/src/pages/admin/ApiReviewsPage.tsx#L8`): Đang gọi `useApp()`, đọc `INITIAL_APIS` từ `mockData.ts#L17`. Chưa gọi `GET /api/admin/apis`, `GET /api/admin/apis/:id/dossier`, `POST /api/admin/apis/:id/review`.
    + `AuditLogsPage.tsx` (`frontend/src/pages/admin/AuditLogsPage.tsx#L7`): Đang gọi `useApp()`, đọc `INITIAL_AUDIT_LOGS` từ `mockData.ts#L26`. Chưa gọi `GET /api/admin/audit-logs` và `GET /api/admin/audit-logs/actions`.
    + `AdminDashboardPage.tsx` (`frontend/src/pages/admin/AdminDashboardPage.tsx#L12`): Tính toán số liệu thống kê từ mock array thay vì gọi API thống kê tổng hợp.
  - Thư mục `frontend/src/services/` hiện chỉ có `adminUsersApi.ts` (dành cho US-04 của Sprint 1), hoàn toàn chưa có service giao tiếp với 8 endpoint `/api/admin/*` của Sprint 2.
- **Hành động đề xuất:** Bàn giao cho Frontend Dev (@leduwn) triển khai `adminReviewApi.ts` và `adminAuditApi.ts` để kết nối 4 trang Admin vào API Backend thật.

### 2. Điểm ghi chú NOTE-01: Ràng buộc Tên miền Công cộng (FQDN) Chống SSRF
- **Mã theo dõi:** `NOTE-01` (Phân hệ US-08 Xác minh Tên miền).
- **Mức độ (Severity):** **Low** (Tài liệu hóa & Hướng dẫn sử dụng).
- **Mô tả chi tiết:**
  - Bộ kiểm tra `backend/src/provider-dns.ts#L14-L23` áp dụng cơ chế bảo mật nghiêm ngặt chống tấn công SSRF: Base URL của API bắt buộc phải có hostname là tên miền công cộng hợp lệ với TLD công nhận quốc tế. Hệ thống chặn toàn bộ tên miền nội bộ như `.local`, `.test`, `.internal`, `.localhost`, IP tĩnh và URL chứa thông tin đăng nhập (`username:password`).
  - Khi Provider nhập `https://weather.qa-service.local`, hệ thống sẽ trả về lỗi `400 DOMAIN_NOT_SUPPORTED`.
- **Hành động đề xuất:** Cần ghi chú rõ ràng trên giao diện Provider Portal (Tooltip / Placeholder) yêu cầu người dùng nhập FQDN thực tế (ví dụ `https://api.mycompany.com`).

---

## VI. Các Hạng mục Chờ Bàn giao để Nghiệm thu E2E Cuối cùng

Để hoàn tất việc đóng gói nghiệm thu Sprint 2 ở mức tích hợp toàn diện trên toàn hệ thống (End-to-End System Integration Sign-off), đội ngũ QA ghi nhận 3 điều kiện chờ:

1. **Chờ Tech Lead (@antondung) Review & Hợp nhất Mã nguồn:**
   - Review và merge PR #49 (`codex/issue-7-provider-foundation` — Backend Sprint 2) và PR #52 (`codex/sprint2-provider-fe` — Frontend Sprint 2) vào nhánh chính `develop`.
   - Đảm bảo CI/CD pipeline chạy kiểm thử tự động xanh 100% trên nhánh `develop`.
2. **Chờ Frontend Lead (@leduwn) Hoàn tất Tích hợp 8 API Admin:**
   - Xây dựng module client API Admin (`adminReviewApi.ts`, `adminAuditApi.ts`).
   - Nối 4 trang Admin UI (`ProviderVerificationsPage`, `ApiReviewsPage`, `AuditLogsPage`, `AdminDashboardPage`) vào API Backend thật, loại bỏ hoàn toàn phụ thuộc vào `mockData.ts`.
   - Sau khi hoàn thành, QA Lead sẽ kích hoạt kịch bản kiểm thử E2E liên phân hệ (Provider nộp $\to$ Admin duyệt trên giao diện $\to$ API xuất bản lên sàn Marketplace).
3. **Chờ Môi trường Staging (hoặc Chốt Nghiệm thu trên Docker Dev Compose):**
   - Đội ngũ DevOps / Tech Lead cung cấp cấu hình hoặc URL môi trường Staging tập trung để QA thực thi nghiệm thu chấp nhận cuối cùng (UAT).
   - Trong trường hợp không có Staging riêng, toàn bộ kết quả nghiệm thu trên môi trường Docker chuẩn hóa (`.env.docker`, Postgres 17, Redis 7, Backend 3000, Frontend 5173) tại báo cáo này sẽ được dùng làm căn cứ nghiệm thu chính thức.

---

## VII. Kết luận & Khuyến nghị của QA Lead

- **Nền tảng Backend & Database Sprint 2:** Đạt trạng thái **GO** (74/74 Unit tests Pass, 60/60 E2E API tests Pass, 6 OpenAPI fixtures đạt chuẩn, tính toàn vẹn CSDL được bảo vệ 100% bằng DB triggers và máy trạng thái).
- **Giao diện Frontend Provider Portal:** Đạt trạng thái **GO** (86/86 Component tests Pass, luồng nghiệp vụ Provider mượt mà, ngăn chặn XSS thành công trên Documentation Viewer).
- **Tích hợp Toàn hệ thống (End-to-End Integration):** Đạt trạng thái **CONDITIONAL GO** (Sẵn sàng nghiệm thu trọn gói ngay sau khi Frontend nối nốt 8 API Admin thật).

*Báo cáo được lập và chịu trách nhiệm bởi QA Automation & Documentation Lead (@vuonghathaovan-gif).*
