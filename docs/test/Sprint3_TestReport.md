# Báo cáo Kiểm thử Sprint 3 — Pha 1: Marketplace, Playground, Sandbox & API Key

> **Dự án:** API Marketplace Platform
> **Giai đoạn:** Sprint 3 — Sàn giao dịch API, Thử nghiệm Playground, Quota Dùng thử & Quản lý Khóa API
> **QA Lead & Tác giả:** Trần Hà Thảo Vân (MSSV: BCS250039, `@vuonghathaovan-gif` — Issue #15 & Issue #70)
> **Thời điểm xuất bản:** 27/10/2026 (Nghiệm thu Pha 1 — Bàn giao Backend & Khắc phục Bug F2)
> **Mã Commit Nghiệm thu:** Nâng cấp 100% HTTP-First và mở khóa toàn bộ US-18
> **Nhánh thực thi:** `test/15-sprint3-qa-phase1` (Khớp 100% với nhánh Git làm việc)
> **Quyết định nghiệm thu Pha 1:** **[x] ĐẠT 100% TIÊU CHÍ THỰC THI PHA 1 (Tỷ lệ đạt thực thi 100.0% — 26/26, Độ phủ thiết kế 92.9% — 26/28, chỉ còn 2 TC chờ PR #78 Gateway)**

---

## I. TỔNG QUAN ĐỢT KIỂM THỬ SPRINT 3 (PHA 1)

### 1. Mục tiêu & Phạm vi Đợt 1
Sprint 3 tập trung vào hành trình của Consumer trên sàn thương mại điện tử API cùng cơ chế định tuyến và kiểm duyệt của Admin. Đợt kiểm thử Pha 1 được thực hiện sau khi Tech Lead và Backend hoàn tất các gói bàn giao:
- **PR #76 (Vân):** Ban hành tài liệu Tiêu chuẩn nghiệm thu (`Sprint3_AcceptanceCriteria.md`), Bộ 46 Test Cases (`Sprint3_TestCases.md`), Auto-test Marketplace (`sprint3-marketplace-runner.js`) và Khắc phục dứt điểm Bug F2 (`TC-14-04`).
- **PR #77 (Tùng Dương - Issue #12):** Hoàn thiện Backend Consumer: Proxy an toàn Playground (`SafeProxy`), chống SSRF đa lớp, quản lý Quota Sandbox nguyên tử (`SandboxService`) và Vòng đời Khóa API (`ApiKeyService`).
- **PR #80 (Danh - Issue #11):** Bổ sung migration `008_create_reports_moderation.sql`, tạo bảng `reports` và trạng thái `Suspended` cho API.
- **PR #83 (Tùng Dương):** Bổ sung kiểm thử biên HTTP Sandbox và Upstream Timeout.
- **Tiêu chuẩn Nâng cấp QA Pha 1:**
  1. *Data Overwrite Isolation:* Tạo riêng Test API độc lập (`isolatedApiId`), bảo toàn 100% dữ liệu seed `gateway_routes` của API ID 3, 12 và dọn dẹp sạch sẽ trong khối `finally`.
  2. *100% HTTP-First cho US-19:* Toàn bộ chu trình tiêu thụ Sandbox (5 lượt tuần tự `TC-19-03`, chặn cạn quota `TC-19-04`, và kiểm thử Concurrency tại điều kiện biên còn 1 lượt cuối `TC-19-02`) đều được thực thi trực tiếp qua **HTTP Endpoint** (`POST /api/marketplace/apis/:id/playground`).
  3. *Mở khóa 100% US-18:* Tích hợp kiểm thử thật qua upstream public hợp lệ `https://httpbin.org`, mở khóa thành công `TC-18-01` (Forward 200 OK), `TC-18-05` (Redirect 302 $\to$ 502 Blocked), và `TC-18-06` (Timeout $\to$ 504 Timeout) thông qua `SafeProxy`.
  4. *Minh bạch số liệu (Transparency):* Tách bạch rõ `Total Designed`, `Executed`, `Passed`, `Failed`, `Skipped`, `Execution Pass Rate` (100.0%) và `Overall Coverage Rate` (92.9%).
  5. *Nâng cấp TC-14-04:* Bổ sung hàm quét `containsSensitiveLeak()`, Canary Negative Test (phát hiện leak) và Canary Redacted Test (chống false alarm).

Phạm vi nghiệm thu Pha 1 bao gồm 5 User Stories cốt lõi đã có mã nguồn trên `develop`:
1. **US-16 (Marketplace Discovery):** Tìm kiếm không phân biệt hoa thường, lọc logic AND (category, tag, pricing), phân trang và sắp xếp ổn định, chỉ hiển thị API `Published`.
2. **US-17 (API Detail & Public Documentation):** Xem chi tiết tài liệu OpenAPI, versions, endpoints, pricing plans; che mờ tuyệt đối tài liệu nhạy cảm (KYC evidence, domain proof); trả về `404` thống nhất cho API chưa Published hoặc Provider bị khóa.
3. **US-18 (Playground & Anti-SSRF):** Chuyển tiếp request Playground tới upstream public an toàn; cơ chế phòng thủ SSRF nhiều tầng chặn Loopback (`127.0.0.1`, `localhost`), Private Network (`10.x`, `192.168.x`), Cloud Metadata (`169.254.169.254`), Open Redirect (`502`), Header cấm (`400`) và Path Traversal.
4. **US-19 (Try Before Subscribe & Sandbox Quota):** Cấp grant dùng thử 5 lượt/24h; trừ lượt nguyên tử qua HTTP Playground; chặn lần gọi thứ 6 với `403 SANDBOX_EXHAUSTED`; đảm bảo an toàn tuyệt đối tại điều kiện biên còn 1 lượt cuối trước tấn công race condition đồng thời qua HTTP.
5. **US-21 (API Key Lifecycle Management):** Sinh khóa ngẫu nhiên `ak_live_***` hiển thị raw key đúng 1 lần duy nhất; Database chỉ lưu chuỗi băm SHA-256 (64 hex) và prefix; ràng buộc 1 key active/Consumer/API; hỗ trợ Rotate và Revoke tức thì; bảo đảm cách ly dữ liệu giữa các Consumer.

---

### 2. Môi trường Thực thi & Kiểm thử
- **Hệ điều hành:** Windows 11 Enterprise x64 / Docker Desktop.
- **Cơ sở dữ liệu:** PostgreSQL 17-alpine (Container Docker `api-market-postgres`, Port 5432).
- **Backend API:** Node.js v24.21.0, Express 5.2.1, TypeScript 5.9.3, pg 8.23.1, Zod 4.6.5 (Container Docker `api-market-backend`, Port 3000).
- **Cache/Session:** Redis 7-alpine (Container Docker `api-market-redis`, Port 6379).
- **Frontend Web:** React 19.2.8, Vite 8.3.0 (Container Docker `api-market-frontend`, Port 5173).
- **Công cụ QA Runner Tự động:**
  * `qa-scripts/sprint2-backend-runner.js`: Kiểm thử hồi quy 60 TC (Sprint 1-2) kèm Canary Redaction.
  * `qa-scripts/sprint3-marketplace-runner.js`: Kiểm thử tự động 17 TC (US-16, US-17).
  * `qa-scripts/sprint3-consumer-runner.js`: Kiểm thử tự động 28 TC thiết kế (26 Executed PASS, 2 Skipped chờ PR #78).

---

## II. KẾT QUẢ KHẮC PHỤC BUG F2 & KIỂM THỬ HỒI QUY (SPRINT 1 - 2)

### 1. Khắc phục Toàn diện Bug F2 (Issue #70) & Thử nghiệm Canary
- **Vấn đề ban đầu:** Trong `qa-scripts/sprint2-backend-runner.js`, test case `TC-14-04` kiểm tra rò rỉ secret trong Audit Log đọc sai trường (`item.metadata` thay vì `item.detail` khớp với contract Backend), đồng thời thiếu assertion mảng khiến bài test có nguy cơ bị "false pass" khi danh sách log rỗng.
- **Giải pháp nâng cấp theo chuẩn Senior QA:**
  1. Xây dựng helper function `containsSensitiveLeak(record)` quét toàn diện:
     - Token xác thực tên miền DNS (`platform-verification=`).
     - Trường `password` hoặc `secret` không được che mờ bằng `[REDACTED]`.
     - Pattern băm mật khẩu Bcrypt (`$2a$`, `$2b$`, `$2y$`).
     - Chuỗi JWT token nguyên bản (`eyJ...`).
     - Khóa nhạy cảm `password_hash` / `passwordHash`.
  2. Bổ sung **Canary Negative Test**: Đưa fixture chứa rò rỉ mẫu (`canaryLeakRecord`), assert bắt buộc `containsSensitiveLeak()` phải trả về `true` (chứng minh test suite không bị điếc).
  3. Bổ sung **Canary Redacted Test**: Đưa fixture đã che mờ hợp lệ (`canarySafeRecord`), assert bắt buộc `containsSensitiveLeak()` phải trả về `false` (chứng minh không báo động giả).
  4. Xác thực danh sách log thực tế từ Backend: Bắt buộc `items.length > 0`, `hasValidDetail === true`, và `actualLeakDetected === false`.
- **Kết quả xác nhận:** `TC-14-04` thực thi thành công mỹ mãn, cả 2 Canary Tests đều phản hồi chuẩn xác 100%.

### 2. Bảng Tổng hợp Kết quả Hồi quy Sprint 1 - 2
| Suite / Nhóm Kiểm thử | User Story | Số lượng TC | Đạt (Pass) | Hỏng (Fail) | Tỷ lệ Đạt | Ghi chú |
|---|:---:|:---:|:---:|:---:|:---:|---|
| **KYC & Admin Review** | US-06 & US-07 | 11 | 11 | 0 | 100% | Nộp duyệt, pending, reject kèm lý do, resubmit, approve |
| **RBAC Matrix** | US-03 & Security | 6 | 6 | 0 | 100% | Chặn truy cập trái vai trò (Guest, Consumer, Provider, Admin) |
| **API Draft CRUD** | US-09 | 7 | 7 | 0 | 100% | Quản lý API, Endpoint, Version, quyền sở hữu Provider |
| **OpenAPI Import Fixtures**| US-10 | 7 | 7 | 0 | 100% | 6 fixtures (JSON/YAML lỗi, quá tải 1MB, XSS, OpenAPI 3.0) |
| **Pricing Plans** | US-11 | 5 | 5 | 0 | 100% | Cấu hình gói Free (giá = 0) và gói trả phí Pro |
| **Legal & Domain Privacy** | US-08 | 7 | 7 | 0 | 100% | Khai báo pháp lý, phân loại dữ liệu, DNS TXT challenge |
| **API Submission** | US-12 | 5 | 5 | 0 | 100% | Readiness checklist, đóng băng bản ghi (record freezing) |
| **Admin Thẩm định API** | US-13 | 7 | 7 | 0 | 100% | State machine: Submitted $\to$ Under Review $\to$ Approved $\to$ Published |
| **Audit Log Management** | US-14 | 5 | 5 | 0 | 100% | Đã sửa Bug F2 (`TC-14-04`) với Canary Testing chuẩn |
| **TỔNG CỘNG HỒI QUY** | **Sprint 1-2** | **60** | **60** | **0** | **100%** | **Hệ thống ổn định tuyệt đối** |

---

## III. KẾT QUẢ KIỂM THỬ SPRINT 3 (PHA 1 — 100% HTTP-FIRST)

### 1. Phân hệ Marketplace & API Detail (US-16 & US-17 — 17 Test Cases)
Thực thi qua `qa-scripts/sprint3-marketplace-runner.js`:

| Mã TC | Tên Test Case | Kết quả | Chi tiết kiểm chứng kỹ thuật |
|---|---|:---:|---|
| `TC-16-01` | Truy vấn danh sách Marketplace không cần JWT | **PASS** | HTTP 200, items array, total snapshot nhất quán |
| `TC-16-02` | Tìm kiếm từ khóa không phân biệt hoa/thường | **PASS** | Khớp chính xác cả `weather`, `Weather`, `WEATHER` |
| `TC-16-03` | Tìm kiếm ký tự đặc biệt `%` và `_` | **PASS** | Xử lý như chuỗi ký tự thường, không kích hoạt SQL LIKE wildcard |
| `TC-16-04` | Lọc chính xác theo danh mục (`category`) | **PASS** | 100% API trả về thuộc đúng Category yêu cầu |
| `TC-16-05` | Lọc chính xác theo thẻ (`tag`) | **PASS** | 100% API trả về chứa đúng Tag yêu cầu |
| `TC-16-06` | Lọc theo gói cước (`pricing=free` / `pricing=paid`) | **PASS** | Phân loại chuẩn xác API theo giá gói active (0đ vs >0đ) |
| `TC-16-07` | Bộ lọc kết hợp logic AND (`category` & `pricing`) | **PASS** | Thỏa mãn đồng thời cả 2 điều kiện lọc |
| `TC-16-08` | Sắp xếp ổn định (`sort=newest` / `sort=name`) | **PASS** | Thứ tự trả về nhất quán, deterministics |
| `TC-16-09` | Phân trang snapshot chuẩn xác | **PASS** | Trang sâu ngoài phạm vi trả về items rỗng, giữ nguyên `total` |
| `TC-16-10` | Validation từ chối tham số query sai | **PASS** | HTTP 400 cho `page=0`, `pageSize=999`, pricing không hợp lệ |
| `TC-16-11` | Cách ly trạng thái: Chặn API chưa Published | **PASS** | API Draft, Under Review, Suspended tuyệt đối không xuất hiện |
| `TC-17-01` | Truy cập trực tiếp ID API không tồn tại/Draft | **PASS** | Trả về đồng nhất `404 NOT_FOUND` |
| `TC-17-02` | ID sai định dạng/phi số | **PASS** | Trả về đồng nhất `404 NOT_FOUND` (Uniform 404 chống rò rỉ) |
| `TC-17-03` | Chi tiết API công khai đầy đủ cấu trúc | **PASS** | Có đủ versions, endpoints, documentation OpenAPI, plans |
| `TC-17-04` | Bảo mật: Không rò rỉ bằng chứng KYC/DNS token | **PASS** | Payload sạch 100%, không chứa KYC URLs, challenge token, review notes |
| `TC-17-05` | Danh sách gói giá chuẩn hóa dạng số và chỉ trả gói active | **PASS** | Giá hiển thị dạng JSON number, ẩn hoàn toàn gói deactivated |
| `TC-17-06` | Header phản hồi chứa `Cache-Control: no-store` | **PASS** | Chống trình duyệt lưu đệm API khi Admin gỡ bỏ |

---

### 2. Phân hệ Playground & Phòng chống SSRF (US-18 — Mở khóa 100% Test Cases)
Thực thi qua `qa-scripts/sprint3-consumer-runner.js` (Sử dụng Isolated Test API riêng biệt):

| Mã TC | Phân loại | Tên Test Case | Kết quả | Chi tiết kiểm chứng kỹ thuật |
|---|:---:|---|:---:|---|
| `TC-18-01` | Gốc | **Forward request hợp lệ tới Upstream Public** | **PASS** | **Gửi tới `https://httpbin.org/get` qua HTTP Playground: Trả về HTTP 200 OK, phản hồi chứa nội dung upstream, đo lường `latencyMs`, cập nhật `remainingRequests` chuẩn xác.** |
| `TC-18-02` | Gốc | Chặn SSRF Loopback IPv4 (`127.0.0.1`, `localhost`) | **PASS** | Trả về `403 SSRF_DETECTED` trước khi mở socket |
| `TC-18-03` | Gốc | Chặn SSRF Private Network RFC 1918 (`10.0.0.1`) | **PASS** | Trả về `403 SSRF_DETECTED`, chặn triệt để dải IP nội bộ |
| `TC-18-04` | Gốc | Chặn SSRF Cloud Metadata Service (`169.254.169.254`)| **PASS** | Trả về `403 SSRF_DETECTED`, bảo vệ credentials máy chủ |
| `TC-18-05` | Gốc | **Chặn Upstream Redirect (`302 Redirect`)** | **PASS** | **Gửi tới endpoint upstream trả 302: SafeProxy từ chối chuyển tiếp, trả về đúng `502 UPSTREAM_REDIRECT_BLOCKED`.** |
| `TC-18-06` | Gốc | **Upstream trễ quá thời hạn (`Timeout > 10s` / cấu hình)** | **PASS** | **Cấu hình route timeout 1500ms, gọi endpoint delay 3 giây: SafeProxy ngắt kết nối đúng hạn, trả về `504 UPSTREAM_TIMEOUT`.** |
| `TC-18-07` | Gốc | Chặn Endpoint ID không đăng ký | **PASS** | Trả về `400 ENDPOINT_NOT_REGISTERED` |
| `TC-18-AUTH` | Bổ sung | Yêu cầu xác thực JWT & Role Consumer | **PASS** | Từ chối 401 khi thiếu token hoặc token sai vai trò |
| `TC-18-HEADER`| Bổ sung | Chặn Header cấm (`Authorization`, `Cookie`) | **PASS** | Trả về `400 HEADER_NOT_ALLOWED` (chặn strictly) |
| `TC-18-PATH` | Bổ sung | Chặn Path Traversal (`../`, ký tự điều khiển) | **PASS** | Trả về `400 Bad Request`, từ chối path parameters độc hại |
| `TC-18-QUOTA-SAFE`| Bổ sung | An toàn Quota: Lỗi SSRF/Validation không trừ lượt | **PASS** | Xác nhận `used_requests = 0` trong DB khi request bị chặn |

---

### 3. Phân hệ Quota Dùng thử Sandbox (US-19 — 100% Qua HTTP Playground)
Thực thi qua `qa-scripts/sprint3-consumer-runner.js`:

| Mã TC | Phân loại | Tên Test Case | Kết quả | Chi tiết kiểm chứng kỹ thuật |
|---|:---:|---|:---:|---|
| `TC-19-01` | Gốc | Cấp grant Sandbox lần đầu (POST) | **PASS** | Trả về `201 Created`, `maxRequests: 5`, `remainingRequests: 5`, hết hạn sau 24h |
| `TC-19-INFO` | Bổ sung | Truy vấn trạng thái grant trả về đúng quota hiện tại | **PASS** | `GET /api/consumer/apis/:id/sandbox` phản ánh chuẩn xác số lượt còn lại |
| `TC-19-03` | Gốc | **Tiêu thụ tuần tự 5 lượt qua HTTP Playground** | **PASS** | **Gọi 5 lần liên tiếp qua `POST /api/marketplace/apis/:id/playground`: Mỗi lần trả về 200 OK và `remainingRequests` giảm đều $4 \to 3 \to 2 \to 1 \to 0$. Đối soát DB: `used_requests = 5`.** |
| `TC-19-04` | Gốc | **Chặn tức thì khi hết lượt (Lượt thứ 6)** | **PASS** | **Gọi lần thứ 6 qua HTTP Playground: Bị từ chối tức thì với `403 SANDBOX_EXHAUSTED`. Stored procedure ném `SQLSTATE P0001`, `available: false`, `remainingRequests: 0`.** |
| `TC-19-05` | Gốc | Tính bền vững (State Persistence) | **PASS** | Gọi lại POST hoặc tải lại trang không reset về 5 (giữ nguyên exhausted) |
| `TC-19-TAMPER` | Bổ sung | Chống giả mạo tham số Quota | **PASS** | Gửi payload `{ maxRequests: 999 }` bị từ chối `400 VALIDATION_ERROR` |
| `TC-19-02` | Gốc | **Điều kiện biên Race Condition qua HTTP Playground: Còn 1 lượt cuối** | **PASS** | **Set `used = 4` (còn đúng 1 lượt), bắn đồng thời 10 requests qua `POST /api/marketplace/apis/:id/playground`. Kết quả: Đúng duy nhất 1 request thành công (200 OK, `remainingRequests: 0`), 9 request bị chặn (403 SANDBOX_EXHAUSTED). Database chốt `used_requests = 5` chuẩn xác.** |

---

### 4. Phân hệ Quản lý Khóa API (US-21)
Thực thi qua `qa-scripts/sprint3-consumer-runner.js`:

| Mã TC | Phân loại | Tên Test Case | Kết quả | Chi tiết kiểm chứng kỹ thuật |
|---|:---:|---|:---:|---|
| `TC-21-01` | Gốc | Tạo API Key mới & Nguyên tắc "Chỉ hiện 1 lần" | **PASS** | Trả về `201 Created`, sinh raw key định dạng `ak_live_***` (51 ký tự) |
| `TC-21-02` | Gốc | Xác thực DB: Băm SHA-256 (64 hex), không plaintext | **PASS** | Cột `key_hash` khớp 100% SHA-256 của raw key, không tìm thấy plaintext trong DB |
| `TC-21-LIST` | Bổ sung | Danh sách API Key không rò rỉ Secret | **PASS** | `GET /api/consumer/api-keys`: Chỉ hiển thị `keyPrefix` (16 ký tự), không có `key` hay `key_hash`, header có `Cache-Control: no-store` |
| `TC-21-LIMIT` | Bổ sung | Ràng buộc duy nhất 1 key active / Consumer / API | **PASS** | Cố tình tạo key thứ 2 bị từ chối với `409 KEY_EXISTS` |
| `TC-21-03` | Gốc | Rotate Key tức thì & Vô hiệu hóa key cũ | **PASS** | Sinh key mới (201), key cũ chuyển ngay `is_active: false` và cập nhật `revoked_at` |
| `TC-21-04` | Gốc | Khóa cũ vừa bị Rotate gửi tới Gateway bị từ chối 401 | *SKIPPED* | Chờ Tech Lead Dũng merge PR #78 (Gateway US-22) vào `develop` |
| `TC-21-REVOKED-ROTATE`| Bổ sung | Ngăn chặn Rotate trên Key đã bị thu hồi | **PASS** | Thao tác trên key đã revoked bị từ chối với `409 KEY_REVOKED` |
| `TC-21-05` | Gốc | Revoke Key tức thì (DELETE) | **PASS** | Trả về `204 No Content`, cập nhật `is_active: false`, thao tác gọi lại an toàn (idempotent 204) |
| `TC-21-06` | Gốc | Gửi request Gateway thành công cập nhật `last_used_at`| *SKIPPED* | Chờ Tech Lead Dũng merge PR #78 (Gateway US-22) vào `develop` |
| `TC-21-ISO` | Bổ sung | Bảo mật đa người dùng (Consumer Isolation) | **PASS** | Consumer B không nhìn thấy và không thể rotate/revoke key của Consumer A (404 Not Found) |

---

## IV. BẢNG TỔNG HỢP & MINH BẠCH SỐ LIỆU KIỂM THỬ

| Phân hệ Test Runner | Tổng thiết kế (Designed) | Đã thực thi (Executed) | Đạt (Passed) | Hỏng (Failed) | Tạm hoãn (Skipped) | Tỷ lệ Đạt Thực thi | Độ phủ Thiết kế |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Hồi quy Sprint 1-2** | 60 | 60 | 60 | 0 | 0 | **100.0%** (60/60) | **100.0%** (60/60) |
| **Marketplace (US-16, 17)** | 17 | 17 | 17 | 0 | 0 | **100.0%** (17/17) | **100.0%** (17/17) |
| **Consumer (US-18, 19, 21)**| 28 | 26 | 26 | 0 | 2* | **100.0%** (26/26) | **92.9%** (26/28) |
| **TỔNG CỘNG HỆ THỐNG** | **105** | **103** | **103** | **0** | **2** | **100.0%** (103/103) | **98.1%** (103/105) |

> **Cam kết của QA Lead:** Chỉ còn duy nhất **2 test cases** ở trạng thái `SKIPPED` (`TC-21-04`, `TC-21-06`) do bắt buộc phải gửi request qua HTTP Gateway (US-22 — PR #78). Cả 2 case này **KHÔNG được tính là PASS** và sẽ được thực thi hoàn tất trong Pha 2 ngay khi PR #78 được merge.

---

## V. ĐÁNH GIÁ TIÊU CHUẨN BẢO MẬT & DATA ISOLATION

### 1. Data Overwrite Isolation & Idempotency
- [x] **Cô lập dữ liệu kiểm thử:** Runner `sprint3-consumer-runner.js` tự động khởi tạo riêng Test API (`QA Isolated Test API`) và các route liên kết độc lập. Tuyệt đối không can thiệp, sửa đổi hay ghi đè `gateway_routes` của các API seed trong database (API ID 3, 12).
- [x] **Dọn dẹp triệt để trong khối `finally`:** Đảm bảo dù test case có pass hay fail, toàn bộ các bản ghi tạo ra (`apis`, `api_endpoints`, `api_versions`, `gateway_routes`, `sandbox_grants`, `api_keys`, `users`) đều được thu hồi 100%, bảo toàn trạng thái DB sạch sẽ.

### 2. Checklist Phòng chống Tấn công SSRF (US-18)
- [x] **Chặn Loopback IPv4 & IPv6:** Đã xác nhận trên `127.0.0.1`, `localhost`, `0.0.0.0`, `[::1]` $\to$ Phản hồi `403 SSRF_DETECTED`.
- [x] **Chặn Private Subnet (RFC 1918):** Đã xác nhận trên dải `10.0.0.1`, `172.16.0.1`, `192.168.1.1` $\to$ Bị từ chối trước khi mở kết nối socket.
- [x] **Chặn Cloud Metadata Service:** Đã xác nhận trên `http://169.254.169.254/` $\to$ Bị từ chối `403 SSRF_DETECTED`.
- [x] **Chặn Open Redirect Bypass:** SafeProxy chặn chuyển tiếp, trả về `502 UPSTREAM_REDIRECT_BLOCKED`.
- [x] **Ngắt kết nối khi Timeout:** SafeProxy ngắt socket và trả về `504 UPSTREAM_TIMEOUT`.
- [x] **Pin IP chống DNS Rebinding:** IP phân giải từ DNS được ghim trực tiếp vào socket connection (`socket.remoteAddress validation`).
- [x] **An toàn Quota:** Phát hiện tấn công SSRF hoặc payload sai format không trừ hạn mức dùng thử của người dùng.

### 3. Checklist Quản lý An toàn Khóa API (US-21)
- [x] **Nguyên tắc "Chỉ hiển thị 1 lần":** Giao diện và API chỉ trả về `rawKey` tại thời điểm khởi tạo (`POST /api-keys`) hoặc rotate (`POST /rotate`).
- [x] **Lưu trữ Database chuẩn OWASP:** Bảng `api_keys` chỉ lưu trữ cột `key_hash` dạng SHA-256 (64 hex) và tiền tố `key_prefix`. Không tồn tại plaintext key trong DB.
- [x] **Không rò rỉ qua Logs & Danh sách:** API lấy danh sách (`GET /api-keys`) chỉ trả về `keyPrefix` và metadata, không chứa hash hay raw key; phản hồi có header `Cache-Control: no-store`.
- [x] **Vô hiệu hóa tức thì (Zero-delay Revocation):** Khóa cũ bị chuyển sang `is_active = false` ngay tại thời điểm gọi Rotate/Revoke, loại bỏ nguy cơ sử dụng key bị rò rỉ.

### 4. Checklist Quản lý Quota Dùng thử Nguyên tử (US-19)
- [x] **Tính nguyên tử trong Database:** Sử dụng PostgreSQL stored procedure `consume_sandbox_grant()` với khóa hàng `FOR UPDATE`, đảm bảo không bị lỗi đọc bẩn (dirty read).
- [x] **Kiểm thử Concurrency hoàn toàn qua HTTP:** Thử nghiệm bắn đồng thời 10 requests qua HTTP Playground khi người dùng chỉ còn 1 lượt cuối (`used = 4, max = 5`) chứng minh số lượt thành công đúng bằng 1 và số lượt trong DB chốt chính xác là 5.

---

## VI. KẾ HOẠCH NGIỆM THU PHA 2 & ĐỀ XUẤT CHO NHÓM

### 1. Nhiệm vụ Pha 2 (Ngay khi PR #78, #79, #81 được merge vào `develop`)
1. **US-22 (Gateway Routing Framework — PR #78):**
   - Viết test runner kiểm thử Gateway forward request bằng `X-API-Key` hợp lệ.
   - Hoàn tất 2 TC bị tạm hoãn: `TC-21-04` (chặn key đã rotate) và `TC-21-06` (cập nhật `last_used_at`).
   - Kiểm tra Gateway từ chối tức thì khi API bị `Suspended` (`403 API_SUSPENDED`).
2. **US-05 (Profile & Change Password — PR #79):**
   - Kiểm thử xem/cập nhật profile và đổi mật khẩu an toàn (`POST /api/user/change-password`).
3. **US-15 (Report & Moderation — PR #81):**
   - Kiểm thử Consumer gửi báo cáo vi phạm (`POST /api/reports`) và Admin đình chỉ/khôi phục API.

### 2. Kết luận Nghiệm thu Pha 1
- **Chất lượng Pha 1:** Toàn bộ 103 test cases thực thi tự động (60 Hồi quy Sprint 1-2, 17 Marketplace, 26 Consumer/Security) đều **ĐẠT 100.0% (103/103 PASS)**.
- **Tính cô lập & Sạch sẽ:** Bản kiểm thử tuân thủ nghiêm ngặt nguyên tắc cách ly dữ liệu, bảo toàn route seed và tự động dọn dẹp sạch sẽ sau chạy.
- **Tiêu chuẩn kho mã nguồn:** Đạt chuẩn Clean Code, tuân thủ quy chuẩn commit và quy trình kiểm thử của dự án.
