# Báo cáo Kiểm thử Tổng hợp Sprint 2 (Sprint 2 Test Report)

> **Dự án:** API Marketplace Platform
> **Giai đoạn:** Sprint 2 — Quản lý Nhà cung cấp, Xác thực & Tuân thủ (Provider Compliance & Publishing Workflow)
> **QA Automation & Documentation Lead:** Trần Hà Thảo Vân (`@vuonghathaovan-gif` — Issue #10)
> **Thời điểm xuất bản:** 17/10/2026 (Khóa sổ Sprint 2)
> **Nhánh lưu trữ & kiểm thử:** `test/10-sprint2-final-signoff`
> **Mã Commit Nghiệm thu:** `c673b6e` (Nối 8 API Admin thật, đóng `GAP-01`)
> **Quyết định nghiệm thu:** **[x] GO TOÀN DIỆN (100% hoàn thành Definition of Done)**

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
- **Cơ sở dữ liệu:** PostgreSQL 17.11 Alpine (container Docker `api-market-postgres` tại cổng 5432).
- **Backend Runtime:** Node.js v24.21.0, Express 5.2.1, TypeScript 5.9.3, pg 8.23.1, Zod 4.6.5 (port 3000).
- **Frontend Runtime:** React 19.2.8, Vite 8.3.0, React Router v7.3.0, Vitest 5.0.4, Playwright Chromium headless (port 5173).
- **Công cụ kiểm thử tự động:** `qa-scripts/retest-runner.js`, `qa-scripts/sprint2-backend-runner.js`, `qa-scripts/sprint2-ui-e2e-runner.cjs`.

### 3. Ma trận Nhánh Mã nguồn & Trạng thái Tích hợp
| Nhánh Git | Vai trò & Nội dung | Trạng thái Đối soát QA |
|---|---|:---:|
| `develop` (commit `963e462`) | Nhánh tích hợp chính của dự án, đã merge PR #49, #52, #53, #54 | **Sẵn sàng** |
| `origin/codex/issue-7-provider-foundation` (PR #49) | Nền tảng Backend Provider, Admin Review, Domain Privacy & Audit Logs | **Đã verify 100%** (74 Unit tests + 60 E2E tests Pass) |
| `origin/codex/sprint2-provider-fe` (PR #52) | Giao diện Provider Portal & 5 màn hình quản trị Provider | **Đã verify 100%** (86 Component tests Pass) |
| `origin/feature/9-provider-database` | Lược đồ CSDL: migration 003 (Provider) và migration 005 (Privacy & DNS) | **Đã verify 100%** (Migrate & Seed sạch lỗi) |
| Commit `c673b6e` trên `develop` | Tích hợp `adminReviewApi.ts`, nối 4 trang Admin UI vào 8 API thật, đóng `GAP-01` | **Đã verify 100%** (115 Frontend tests + 3 E2E UI Pass) |
| `test/10-sprint2-final-signoff` | Nhánh khóa sổ nghiệm thu chính thức của QA Lead Issue #10 | **Hoàn tất 63/63 TC Pass (100%)** |

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

### 4. Kết quả Thực thi Tự động E2E Backend (`qa-scripts/sprint2-backend-runner.js`)
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
| **TỔNG CỘNG E2E BACKEND** | **Toàn bộ 38 API** | **60** | **60** | **0** | **100%** | **Độ phủ 100% 30 API Provider + 8 API Admin** |

---

## IV. Kết quả Kiểm thử Frontend Provider Portal & Admin Console

### 1. Thống kê Kết quả Chạy Vitest trên Toàn bộ Frontend
- **Lệnh thực thi:** `npm test` tại thư mục `frontend/`.
- **Tổng số tệp kiểm thử:** 19 test files (bao gồm cả unit và component tests).
- **Tổng số Test Cases thực thi:** **115 tests**.
- **Kết quả:** **115/115 PASS (100%)** (Thời gian chạy: 8.87s, 0 failed, 0 warning).

### 2. Chi tiết Độ phủ trên Giao diện Frontend
1. **5 Màn hình Provider Portal (86 tests):**
   - `ProviderVerificationPage`: Kiểm tra skeleton loading, hiển thị form, validation thông tin doanh nghiệp, trạng thái Pending và xử lý khi bị Rejected.
   - `MyApisInventoryPage`: Kiểm tra chặn Provider chưa xác minh tạo API, hiển thị danh sách API theo trạng thái (Draft, Submitted, Published), tìm kiếm và bộ lọc.
   - `OpenApiImportPage`: Kiểm tra upload file OpenAPI JSON/YAML, hiển thị tóm tắt import và hiển thị an toàn 7 khối tài liệu của `DocumentationViewer` không dính XSS.
   - `EndpointManagementPage`: Kiểm tra hiển thị danh sách phiên bản, lọc endpoint theo version, validation cấu trúc tham số JSON và tạo endpoint mới.
   - `PricingManagementPage`: Kiểm tra ràng buộc gói Free có giá 0 VND, cấu hình gói trả phí (Basic/Pro), hiển thị danh sách gói giá.
   - `PublishingWorkflowPage`: Kiểm tra pipeline 5 giai đoạn, bảng Readiness Checklist (4 điều kiện bắt buộc) và kích hoạt nút Submit Review.
2. **4 Màn hình Admin Console (29 tests sau khi nối API thật tại commit `c673b6e`):**
   - `ProviderVerificationsPage`: Tải dữ liệu từ `GET /api/admin/provider-verifications`, phê duyệt qua `POST .../review`, modal từ chối kèm lý do bắt buộc.
   - `ApiReviewsPage`: Tải hàng đợi duyệt API qua `GET /api/admin/apis`, modal xem hồ sơ Dossier (`GET .../dossier`), chuyển trạng thái tuần tự và xuất bản.
   - `AuditLogsPage`: Tải danh sách nhật ký kiểm toán qua `GET /api/admin/audit-logs`, lọc theo action qua `GET .../actions`, lọc theo khoảng thời gian và đối tượng.
   - `AdminDashboardPage`: Hiển thị số liệu thống kê realtime từ các API Admin thật thay cho dữ liệu giả lập.

---

## V. Kết quả Kiểm thử E2E Giao diện Playwright & Bằng chứng Nghiệm thu (S1 - S7)

### 1. Phương pháp & Cấu hình Thực thi E2E UI
- **Công cụ:** Playwright Chromium Headless (`qa-scripts/sprint2-ui-e2e-runner.cjs`).
- **Mục tiêu:** Kiểm chứng tính toàn vẹn khép kín của luồng nghiệp vụ end-to-end trên giao diện người dùng thật (Frontend: `http://localhost:5173`, Backend: `http://localhost:3000`, PostgreSQL: 5432).
- **Kết quả xuất file:** `qa-scripts/sprint2-ui-e2e-results.json`.

### 2. Bảng Tổng hợp Kết quả Kiểm thử E2E Giao diện
| Mã Test Case UI | Tên Kịch bản & Phạm vi User Story | Các bước Thực thi | Kết quả | Thời gian | Bằng chứng Lưu vết (Ảnh chụp) |
|:---:|---|---|:---:|:---:|---|
| **E2E-UI-01** | **Provider Portal & KYC / Publishing UI**<br>*(US-06, US-08, US-09, US-10, US-11, US-12)* | S1: Đăng ký & Nộp KYC<br>S3: Tạo API & Upload OpenAPI 7 khối<br>S4: Cấu hình gói Pro & Submit Review | **PASS** | 20.8s | `sprint2-e2e-02-provider-openapi-docs.png`<br>`sprint2-e2e-03-provider-submitted.png` |
| **E2E-UI-02** | **Admin Review UI — Verifications & ApiReviews**<br>*(US-07, US-13)* | S2: Admin Duyệt KYC Provider<br>S5: Admin Xem Dossier & Xuất bản API Live | **PASS** | 24.0s | `sprint2-e2e-01-admin-kyc-approved.png`<br>`sprint2-e2e-04-admin-api-published.png` |
| **E2E-UI-03** | **Admin Audit Logs & Dashboard UI**<br>*(US-14)* | S6: Admin xem & lọc Audit Logs<br>S7: Admin Dashboard số liệu realtime | **PASS** | 4.4s | `sprint2-e2e-05-admin-audit-logs.png`<br>`sprint2-e2e-06-admin-dashboard.png` |
| **TỔNG CỘNG** | **3 Test Cases UI Khóa sổ Sprint 2** | **7/7 Bước Nghiệp vụ S1 - S7** | **3/3 PASS (100%)** | **49.2s** | **Đầy đủ 6 ảnh chụp chứng minh** |

### 3. Chi tiết Thực thi 7 Bước Nghiệp vụ (S1 $\to$ S7)
1. **Bước S1 (Provider Đăng ký & Nộp KYC):** Provider đăng ký tài khoản mới, điền tên tổ chức, email pháp lý, liên kết giấy phép kinh doanh, tích cam kết và nộp hồ sơ. Giao diện hiển thị trạng thái `Pending` ngay lập tức. **[PASS - 1.75s]**
2. **Bước S2 (Admin Duyệt KYC trên ProviderVerificationsPage):** Admin đăng nhập, mở màn hình Quản lý Xác minh, tìm đúng thẻ Provider vừa nộp, nhấn nút "Phê duyệt". Trình duyệt gửi `POST /api/admin/provider-verifications/:id/review` trả về HTTP 200, DB cập nhật `status = 'Verified'`. **[PASS - 6.65s]**
3. **Bước S3 (Provider Tạo API & Upload OpenAPI 7 khối):** Provider đã được duyệt tiến hành tạo API qua Wizard 4 bước (dùng FQDN `https://api.open-meteo.com/v1` chống SSRF, khai báo dữ liệu cá nhân, tích Thỏa thuận phiên bản hiện hành). Sau đó upload file `valid-weather-openapi3.json`, hệ thống trích xuất và hiển thị đầy đủ 7 khối thông tin tài liệu chuẩn hóa: (1) Tổng quan, (2) Xác thực, (3) Tuyến đường, (4) Tham số, (5) Yêu cầu, (6) Phản hồi, (7) Mã lỗi. **[PASS - 12.99s]**
4. **Bước S4 (Provider Cấu hình Gói Pro & Submit Review):** Provider vào `PricingManagementPage`, tạo thêm gói cước Pro ($499/tháng). Sau khi xác nhận tên miền sở hữu, Provider mở `PublishingWorkflowPage`, kiểm tra Readiness Checklist đạt 100% xanh, nhấn "Gửi cho Quản trị viên kiểm duyệt". API chuyển sang trạng thái `Submitted`. **[PASS - 6.10s]**
5. **Bước S5 (Admin Thẩm định Dossier & Xuất bản API Live):** Admin mở `ApiReviewsPage`, nhấn "Hồ sơ Dossier" để kiểm tra toàn bộ thông số kỹ thuật và cảnh báo xử lý dữ liệu cá nhân. Admin duyệt chuyển trạng thái tuần tự: `Submitted` $\to$ `Under Review` $\to$ `Approved` $\to$ `Published`. API được xuất bản công khai lên Marketplace. **[PASS - 17.39s]**
6. **Bước S6 (Admin Tra cứu & Lọc Audit Logs trên AuditLogsPage):** Admin truy cập `AuditLogsPage`, hệ thống hiển thị danh sách 25 dòng nhật ký phát sinh từ các thao tác trước đó. Bộ lọc hành động hiển thị đầy đủ 15 action types, lọc và phân trang mượt mà. **[PASS - 2.24s]**
7. **Bước S7 (Admin Dashboard Tải Số liệu Thống kê Realtime):** Admin mở `AdminDashboardPage`, giao diện tải trực tiếp số liệu thống kê người dùng, hồ sơ KYC chờ duyệt, API chờ thẩm định và nhật ký kiểm toán từ API Backend thật mà không phát sinh bất kỳ lỗi console nào. **[PASS - 2.13s]**

### 4. Danh sách Ảnh chụp Màn hình Bằng chứng Nghiệm thu E2E UI
Toàn bộ ảnh chụp màn hình độ phân giải cao (1440x900) đã được lưu trữ an toàn tại thư mục `qa-scripts/screenshots/`:
1. `sprint2-e2e-01-admin-kyc-approved.png`: Admin phê duyệt hồ sơ KYC Provider thành công trên `ProviderVerificationsPage`.
2. `sprint2-e2e-02-provider-openapi-docs.png`: Provider upload OpenAPI thành công và hiển thị 7 khối tài liệu chuẩn hóa trên `OpenApiImportPage`.
3. `sprint2-e2e-03-provider-submitted.png`: Provider hoàn thành checklist và nộp duyệt API thành công trên `PublishingWorkflowPage`.
4. `sprint2-e2e-04-admin-api-published.png`: Admin hoàn tất thẩm định Dossier và xuất bản API lên sàn Marketplace tại `ApiReviewsPage`.
5. `sprint2-e2e-05-admin-audit-logs.png`: Nhật ký kiểm toán hệ thống được ghi nhận đầy đủ, hiển thị bộ lọc tại `AuditLogsPage`.
6. `sprint2-e2e-06-admin-dashboard.png`: Dashboard Quản trị viên hiển thị số liệu thống kê realtime từ API thật tại `AdminDashboardPage`.

### 5. Kết quả Giám sát Mạng & Lỗi Console
- **Số lượng request `/api/admin/*` đã bắt và kiểm chứng:** **33 requests** (tất cả đều trả về mã trạng thái HTTP 200).
- **Lỗi JavaScript Console:** 0 lỗi nghiêm trọng (ngoại trừ các lỗi mạng chủ động được bắt bởi test suite).

---

## VI. Danh sách Bug & Điểm lệch Phát hiện được (Defects & Gaps)

Tuân thủ đúng quy trình quản lý bug tại `docs/05-quy-trinh-quan-ly-bug.md`, QA Lead ghi nhận hiện trạng xử lý các điểm kỹ thuật:

### 1. Điểm lệch GAP-01: Các Trang Admin UI Hiện Chưa Nối API Thật
- **Mã theo dõi:** `GAP-01` (Phân hệ Admin Review & Audit Log).
- **Mức độ (Severity):** **High** (Đã giải quyết).
- **Hiện trạng xử lý:** **CLOSED & VERIFIED** tại commit `c673b6e`.
- **Bằng chứng kỹ thuật:**
  - Frontend Developer (@leduwn) phối hợp cùng Tech Lead (@antondung) đã triển khai hoàn tất module client `frontend/src/services/adminReviewApi.ts`, xuất đầy đủ 8 hàm gọi API:
    + `listAdminVerifications`: `GET /api/admin/provider-verifications`
    + `getAdminVerification`: `GET /api/admin/provider-verifications/:providerId`
    + `reviewAdminVerification`: `POST /api/admin/provider-verifications/:providerId/review`
    + `listAdminApis`: `GET /api/admin/apis`
    + `getAdminApiDossier`: `GET /api/admin/apis/:id/dossier`
    + `reviewAdminApi`: `POST /api/admin/apis/:id/review`
    + `listAdminAuditLogs`: `GET /api/admin/audit-logs`
    + `getAdminAuditActions`: `GET /api/admin/audit-logs/actions`
  - Cả 4 trang Admin (`ProviderVerificationsPage`, `ApiReviewsPage`, `AuditLogsPage`, `AdminDashboardPage`) đã loại bỏ 100% sự phụ thuộc vào `mockData.ts`, kết nối trực tiếp vào API thật, quản lý trạng thái `loading`, `error`, và phân trang chuẩn mực.
  - Bộ kiểm thử tự động E2E Playwright trên trình duyệt Chromium headless đã kiểm chứng thực tế toàn bộ 33 request tới 8 API này với mã phản hồi HTTP 200.

### 2. Điểm ghi chú NOTE-01: Ràng buộc Tên miền Công cộng (FQDN) Chống SSRF
- **Mã theo dõi:** `NOTE-01` (Phân hệ US-08 Xác minh Tên miền).
- **Mức độ (Severity):** **Low** (Tài liệu hóa & Hướng dẫn sử dụng).
- **Mô tả chi tiết:**
  - Bộ kiểm tra `backend/src/provider-dns.ts#L14-L23` áp dụng cơ chế bảo mật nghiêm ngặt chống tấn công SSRF: Base URL của API bắt buộc phải có hostname là tên miền công cộng hợp lệ với TLD công nhận quốc tế. Hệ thống chặn toàn bộ tên miền nội bộ như `.local`, `.test`, `.internal`, `.localhost`, IP tĩnh và URL chứa thông tin đăng nhập (`username:password`).
  - Khi Provider nhập `https://weather.qa-service.local`, hệ thống sẽ trả về lỗi `400 DOMAIN_NOT_SUPPORTED`.
- **Trạng thái & Hướng xử lý:** **Ghi nhận vào Backlog Sprint 3** (theo quyết định của Tech Lead @antondung): Bổ sung Tooltip giải thích ràng buộc FQDN hợp lệ trên `CreateApiWizardPage` và `ApiDossierModal` để nâng cao trải nghiệm người dùng.

---

## VII. Tổng hợp Kết quả Thực thi Toàn diện Sprint 2

| Nhóm Kiểm thử | Công cụ / Môi trường | Tổng số TC | Pass | Fail | Blocked | Tỷ lệ Đạt |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Backend Unit & Integration Tests** | Vitest / Postgres 17 Docker | 74 | 74 | 0 | 0 | 100% |
| **Frontend Unit & Component Tests** | Vitest / React 19 Testing Library | 115 | 115 | 0 | 0 | 100% |
| **Backend & DB E2E Compliance Tests** | `qa-scripts/sprint2-backend-runner.js` | 60 | 60 | 0 | 0 | 100% |
| **Playwright E2E UI Tests** | `qa-scripts/sprint2-ui-e2e-runner.cjs` (Chromium) | 3 | 3 | 0 | 0 | 100% |
| **Kiểm tra Chuẩn Kho Mã nguồn CI** | `scripts/kiem-tra-kho-ma-nguon.ps1` | 221 tệp | 221 | 0 | 0 | 100% |
| **TỔNG KẾT BỘ TEST CASES SPRINT 2** | **Danh mục `Sprint2_TestCases.md`** | **63** | **63** | **0** | **0** | **100%** |

---

## VIII. Quyết định Nghiệm thu & Khuyến nghị của QA Lead

1. **Nền tảng Backend & Database Sprint 2:** Đạt trạng thái **GO** (74/74 Unit tests Pass, 60/60 E2E API tests Pass, 6 OpenAPI fixtures đạt chuẩn, tính toàn vẹn CSDL được bảo vệ 100% bằng DB triggers và máy trạng thái).
2. **Giao diện Frontend Provider Portal & Admin Console:** Đạt trạng thái **GO** (115/115 Component tests Pass, luồng nghiệp vụ Provider và Admin kết nối API thật mượt mà, ngăn chặn XSS thành công trên Documentation Viewer).
3. **Tích hợp Toàn hệ thống (End-to-End Integration):** Đạt trạng thái **GO TOÀN DIỆN** (3/3 Test Cases UI Pass, 7/7 bước nghiệp vụ S1-S7 đạt 100%, đóng dứt điểm `GAP-01`).

### Quyết định Nghiệm thu Sprint 2:
- [x] **GO TOÀN DIỆN (100% hoàn thành Definition of Done — Sẵn sàng bàn giao và phát hành)**
- [ ] **CONDITIONAL GO**
- [ ] **NO-GO**

*Báo cáo được lập và chịu trách nhiệm chính thức bởi QA Automation & Documentation Lead (@vuonghathaovan-gif — Issue #10).*
