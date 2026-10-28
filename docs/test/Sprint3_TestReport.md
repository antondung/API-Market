# Báo cáo Kiểm thử Sprint 3 — Nghiệm thu Toàn diện (Final Sign-off): 8 User Stories & An toàn Hệ thống

> **Dự án:** API Marketplace Platform
> **Giai đoạn:** Sprint 3 — Sàn giao dịch API, Thử nghiệm Playground, Quota Dùng thử, Quản lý Khóa API, Gateway Định tuyến, Hồ sơ Cá nhân & Kiểm duyệt Vi phạm
> **QA Lead & Tác giả:** Trần Hà Thảo Vân (MSSV: BCS250039, `@vuonghathaovan-gif` — Issue #15 & Issue #70)
> **Thời điểm xuất bản:** 28/10/2026 (Nghiệm thu Tổng lực Final Sign-off Sprint 3)
> **Nhánh thực thi:** `test/15-sprint3-qa-phase2` (Kế thừa nhánh `develop` mới nhất)
> **Quyết định nghiệm thu:** **[x] ĐẠT 100% TIÊU CHÍ NGHIỆM THU SPRINT 3 (50/50 Test Cases Sprint 3 ĐẠT, 60/60 Test Cases Hồi quy Sprint 1-2 ĐẠT, Tổng cộng 124/124 Tests Backend Tự động PASS, 347/347 Unit Tests Frontend PASS, 0 SKIPPED, 0 FAILED)**

---

## I. TỔNG QUAN ĐỢT KIỂM THỬ SPRINT 3 (TOÀN DIỆN PHA 1 & PHA 2)

### 1. Mục tiêu & Phạm vi Nghiệm thu
Sprint 3 đánh dấu sự hoàn thiện toàn diện của nền tảng API Marketplace cả về tính năng người dùng cuối (Consumer), nhà cung cấp (Provider), cổng định tuyến (Gateway) và quản trị viên (Admin Moderation). Đợt kiểm thử nghiệm thu toàn diện được thực hiện sau khi tất cả các Pull Request cốt lõi đã được kiểm toán chéo độc lập và merge thành công vào nhánh `develop`:
- **PR #78 (Tech Lead Dũng):** Gateway Routing Framework (US-22) — Chuyển tiếp request có kiểm tra API Key, lọc header nhạy cảm, validate template và route.
- **PR #79 (Tech Lead Dũng):** Hồ sơ cá nhân & Đổi mật khẩu an toàn (US-05) — Quản lý thông tin `GET/PATCH /api/auth/me` và `POST /api/auth/change-password` atomic revocation.
- **PR #80 (Danh):** Database Migration 008 — Bổ sung schema `reports` moderation và trạng thái `Suspended` cho API.
- **PR #81 (Tech Lead Dũng):** Báo cáo vi phạm & Kiểm duyệt API (US-15) — Xử lý báo cáo vi phạm, quy trình Suspend/Restore và ghi Audit Log chi tiết.
- **PR #82 (Vân):** QA Pha 1 — Báo cáo kiểm thử Consumer & Security (26/26 PASS, được Tech Lead và Reviewer @Tungdota53 duyệt chính thức).
- **PR #83 (Tùng Dương):** Quota boundary tests — Kiểm thử biên quota Playground.
- **PR #85 (Hải Dương):** Frontend Marketplace & Consumer Workspace (US-16 - US-21).
- **PR #86 & #87 (Frontend Stability):** Ổn định post-merge frontend, Playground regressions và claim concurrency.

### 2. Phạm vi 8 User Stories Nghiệm thu
1. **US-16 (Marketplace Discovery):** Tìm kiếm không phân biệt hoa thường, lọc logic AND (category, tag, pricing), phân trang và sắp xếp ổn định, chỉ hiển thị API `Published`.
2. **US-17 (API Detail & Public Documentation):** Chi tiết tài liệu OpenAPI, versions, endpoints, pricing plans; che mờ tuyệt đối thông tin nhạy cảm; trả về `404` thống nhất cho API chưa Published hoặc Provider bị khóa.
3. **US-18 (Playground & Anti-SSRF):** Chuyển tiếp request Playground tới upstream public an toàn (`https://httpbin.org`); cơ chế phòng thủ SSRF nhiều tầng chặn Loopback (`127.0.0.1`, `localhost`), Private Network (`10.x`, `192.168.x`), Cloud Metadata (`169.254.169.254`), Open Redirect (`502`), Header cấm (`400`) và Path Traversal.
4. **US-19 (Try Before Subscribe & Sandbox Quota):** Cấp grant dùng thử 5 lượt/24h; trừ lượt nguyên tử qua HTTP Playground; chặn lần gọi thứ 6 với `403 SANDBOX_EXHAUSTED`; đảm bảo an toàn tuyệt đối tại điều kiện biên còn 1 lượt cuối trước tấn công race condition đồng thời qua HTTP.
5. **US-21 (API Key Lifecycle Management):** Sinh khóa ngẫu nhiên `ak_live_***` hiển thị raw key đúng 1 lần; Database chỉ lưu chuỗi băm SHA-256 (64 hex); ràng buộc 1 key active/Consumer/API; hỗ trợ Rotate và Revoke tức thì; bảo đảm cách ly dữ liệu giữa các Consumer; mở khóa kiểm thử Gateway thật (`TC-21-04`, `TC-21-06`).
6. **US-22 (Gateway Routing Framework):** Chuyển tiếp request hợp lệ bằng `x-api-key`, lọc header allowlist, chặn path traversal (`400 INVALID_PATH`), từ chối endpoint chưa đăng ký (`404 ENDPOINT_NOT_FOUND`), từ chối khi API bị Suspended (`401 INVALID_API_KEY`); xử lý biên an toàn cho non-integer ID và BigInt overflow (chặn sập 500).
7. **US-05 (User Profile & Change Password):** Lấy thông tin cá nhân `GET /api/auth/me`; cập nhật tên hiển thị `PATCH /api/auth/me` bền vững trong DB; chặn đổi mật khẩu khi sai mật khẩu cũ (`401 INVALID_CREDENTIALS`) hoặc trùng mật khẩu cũ (`400 PASSWORD_UNCHANGED`); đổi mật khẩu thành công giữ phiên hiện tại và thu hồi toàn bộ refresh token khác trong DB.
8. **US-15 (Report & Moderation):** Consumer gửi báo cáo vi phạm (`POST /api/consumer/reports/:apiId`); Admin quản lý hàng đợi và duyệt hành động `Suspend` (đình chỉ API, ẩn khỏi Marketplace, đóng báo cáo); Admin duyệt `Restore` (khôi phục API Published, mở lại Marketplace); ghi nhận đầy đủ `report.suspend` và `report.restore` vào `audit_logs`; chặn ký tự NUL (`\u0000`) và BigInt overflow.

---

## II. KẾT QUẢ KHẮC PHỤC BUG F2 & KIỂM THỬ HỒI QUY (SPRINT 1 - 2)

Toàn bộ 60 Test Cases thuộc Sprint 1 và Sprint 2 được thực thi tự động qua `qa-scripts/sprint2-backend-runner.js` trên môi trường thực tế (HTTP backend + PostgreSQL thật):

| Suite / Nhóm Kiểm thử | User Story | Số lượng TC | Đạt (Pass) | Hỏng (Fail) | Tỷ lệ Đạt | Ghi chú Kỹ thuật |
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

## III. CHI TIẾT KẾT QUẢ KIỂM THỬ SPRINT 3 (50 TEST CASES — 100% PASS)

### 1. Phân hệ Marketplace & API Detail (US-16 & US-17 — 17 Test Cases)
Thực thi qua `qa-scripts/sprint3-marketplace-runner.js`:

| Mã TC | Tên Test Case | Kết quả | Chi tiết kiểm chứng kỹ thuật |
|---|---|:---:|---|
| `TC-16-01` | Truy vấn danh sách Marketplace không cần JWT | **PASS** | HTTP 200, items array, snapshot total nhất quán |
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

### 2. Phân hệ Playground & Phòng chống SSRF (US-18 — 11 Test Cases)
Thực thi qua `qa-scripts/sprint3-consumer-runner.js`:

| Mã TC | Phân loại | Tên Test Case | Kết quả | Chi tiết kiểm chứng kỹ thuật |
|---|:---:|---|:---:|---|
| `TC-18-01` | Gốc | **Forward request hợp lệ tới Upstream Public** | **PASS** | **Gửi tới `https://httpbin.org/get` qua HTTP Playground: HTTP 200 OK, phản hồi chứa nội dung upstream, đo lường `latencyMs`, cập nhật `remainingRequests` chuẩn xác.** |
| `TC-18-02` | Gốc | Chặn SSRF Loopback IPv4 (`127.0.0.1`, `localhost`) | **PASS** | Trả về `403 SSRF_DETECTED` trước khi mở socket |
| `TC-18-03` | Gốc | Chặn SSRF Private Network RFC 1918 (`10.0.0.1`) | **PASS** | Trả về `403 SSRF_DETECTED`, chặn triệt để dải IP nội bộ |
| `TC-18-04` | Gốc | Chặn SSRF Cloud Metadata Service (`169.254.169.254`)| **PASS** | Trả về `403 SSRF_DETECTED`, bảo vệ credentials máy chủ |
| `TC-18-05` | Gốc | **Chặn Upstream Redirect (`302 Redirect`)** | **PASS** | **Upstream trả 302: SafeProxy từ chối chuyển tiếp, trả về đúng `502 UPSTREAM_REDIRECT_BLOCKED`.** |
| `TC-18-06` | Gốc | **Upstream trễ quá thời hạn (`Timeout > 10s`)** | **PASS** | **Cấu hình route timeout 1500ms, gọi delay 3s: SafeProxy ngắt kết nối đúng hạn, trả về `504 UPSTREAM_TIMEOUT`.** |
| `TC-18-07` | Gốc | Chặn Endpoint ID không đăng ký | **PASS** | Trả về `400 ENDPOINT_NOT_REGISTERED` |
| `TC-18-AUTH` | Bổ sung | Yêu cầu xác thực JWT & Role Consumer | **PASS** | Từ chối 401 khi thiếu token hoặc token sai vai trò |
| `TC-18-HEADER`| Bổ sung | Chặn Header cấm (`Authorization`, `Cookie`) | **PASS** | Trả về `400 HEADER_NOT_ALLOWED` |
| `TC-18-PATH` | Bổ sung | Chặn Path Traversal (`../`, ký tự điều khiển) | **PASS** | Trả về `400 Bad Request`, từ chối path parameters độc hại |
| `TC-18-QUOTA-SAFE`| Bổ sung | An toàn Quota: Lỗi SSRF/Validation không trừ lượt | **PASS** | Bắt buộc tồn tại grant trong DB và `used_requests` giữ nguyên tuyệt đối |

---

### 3. Phân hệ Quota Dùng thử Sandbox (US-19 — 7 Test Cases)
Thực thi qua `qa-scripts/sprint3-consumer-runner.js`:

| Mã TC | Phân loại | Tên Test Case | Kết quả | Chi tiết kiểm chứng kỹ thuật |
|---|:---:|---|:---:|---|
| `TC-19-01` | Gốc | Cấp grant Sandbox lần đầu (POST) | **PASS** | Trả về `201 Created`, `maxRequests: 5`, `remainingRequests: 5`, hết hạn 24h |
| `TC-19-INFO` | Bổ sung | Truy vấn trạng thái grant trả về đúng quota hiện tại | **PASS** | `GET /api/consumer/apis/:id/sandbox` phản ánh chuẩn xác số lượt |
| `TC-19-03` | Gốc | **Tiêu thụ tuần tự 5 lượt qua HTTP Playground** | **PASS** | **Gọi 5 lần liên tiếp qua HTTP Playground: Trả về 200 OK và `remainingRequests` giảm đều $4 \to 3 \to 2 \to 1 \to 0$. Đối soát DB: `used_requests = 5`.** |
| `TC-19-04` | Gốc | **Chặn tức thì khi hết lượt (Lượt thứ 6)** | **PASS** | **Gọi lần thứ 6 qua HTTP Playground: Từ chối tức thì với `403 SANDBOX_EXHAUSTED`, DB procedure ném `SQLSTATE P0001`, `available: false`.** |
| `TC-19-05` | Gốc | Tính bền vững (State Persistence) | **PASS** | Gọi lại POST không reset về 5 (giữ nguyên trạng thái exhausted) |
| `TC-19-TAMPER` | Bổ sung | Chống giả mạo tham số Quota | **PASS** | Gửi payload `{ maxRequests: 999 }` bị từ chối `400 VALIDATION_ERROR` |
| `TC-19-02` | Gốc | **Concurrency Boundary: Còn đúng 1 lượt cuối** | **PASS** | **Còn 1 lượt, bắn 10 requests song song: Đúng duy nhất 1 request 200 OK, 9 request bị chặn 403 `SANDBOX_EXHAUSTED`, DB chốt `used_requests = 5`.** |

---

### 4. Phân hệ Quản lý Khóa API (US-21 — 10 Test Cases)
Thực thi qua `qa-scripts/sprint3-consumer-runner.js`:

| Mã TC | Phân loại | Tên Test Case | Kết quả | Chi tiết kiểm chứng kỹ thuật |
|---|:---:|---|:---:|---|
| `TC-21-01` | Gốc | Tạo API Key mới & Nguyên tắc "Chỉ hiện 1 lần" | **PASS** | Trả về `201 Created`, sinh raw key định dạng `ak_live_***` (51 ký tự) |
| `TC-21-02` | Gốc | Xác thực DB: Băm SHA-256 (64 hex), không plaintext | **PASS** | Cột `key_hash` khớp 100% SHA-256 của raw key, không tìm thấy plaintext trong DB |
| `TC-21-LIST` | Bổ sung | Danh sách API Key không rò rỉ Secret | **PASS** | `GET /api/consumer/api-keys`: Chỉ hiển thị `keyPrefix` (16 ký tự), có `Cache-Control: no-store` |
| `TC-21-LIMIT` | Bổ sung | Ràng buộc duy nhất 1 key active / Consumer / API | **PASS** | Cố tình tạo key thứ 2 bị từ chối với `409 KEY_EXISTS` |
| `TC-21-03` | Gốc | Rotate Key tức thì & Vô hiệu hóa key cũ | **PASS** | Sinh key mới (201), key cũ chuyển `is_active: false` và cập nhật `revoked_at` |
| `TC-21-04` | Gốc | **Khóa cũ vừa bị Rotate gửi tới Gateway bị từ chối 401** | **PASS** | **[MỞ KHÓA THÀNH CÔNG] Gửi key vừa rotate qua `/api/gateway/:apiId/get`: Gateway từ chối chuẩn xác với HTTP `401 Unauthorized` (`INVALID_API_KEY`).** |
| `TC-21-REVOKED-ROTATE`| Bổ sung | Ngăn chặn Rotate trên Key đã bị thu hồi | **PASS** | Thao tác trên key đã revoked bị từ chối với `409 KEY_REVOKED` |
| `TC-21-05` | Gốc | Revoke Key tức thì (DELETE) | **PASS** | Trả về `204 No Content`, cập nhật `is_active: false`, thao tác lặp lại an toàn (idempotent 204) |
| `TC-21-06` | Gốc | **Gửi request Gateway thành công cập nhật `last_used_at`** | **PASS** | **[MỞ KHÓA THÀNH CÔNG] Dùng key active gọi `/api/gateway/:apiId/get` (200 OK): Đối soát DB xác nhận cột `last_used_at` được cập nhật thời gian tức thì.** |
| `TC-21-ISO` | Bổ sung | Bảo mật đa người dùng (Consumer Isolation) | **PASS** | Consumer B không thấy và không thể xóa/rotate key của Consumer A (404 Not Found) |

---

### 5. Phân hệ Gateway Routing Framework (US-22 — 7 Test Cases)
Thực thi qua `qa-scripts/sprint3-phase2-runner.js`:

| Mã TC | Phân loại | Tên Test Case | Kết quả | Chi tiết kiểm chứng kỹ thuật |
|---|:---:|---|:---:|---|
| `TC-22-01` | Gốc | Forward request hợp lệ qua Gateway kèm `x-api-key` | **PASS** | HTTP 200 OK, upstream `https://httpbin.org` phản hồi dữ liệu, cập nhật `last_used_at` |
| `TC-22-02` | Gốc | Chặn thiếu, sai, hoặc sử dụng khóa API đã thu hồi | **PASS** | Thiếu header (401), key giả mạo (401), key đã revoke (401 `INVALID_API_KEY`) |
| `TC-22-03` | Gốc | Lọc bỏ Header nhạy cảm và nội bộ trước khi forward | **PASS** | Allowlist enforcement: Upstream không nhận được `X-Internal-Actor`, `Authorization`, `Cookie` |
| `TC-22-04` | Gốc | Chặn Path Traversal và Endpoint không đăng ký | **PASS** | Chặn `..%2F` với `400 INVALID_PATH`; endpoint chưa đăng ký trả `404 ENDPOINT_NOT_FOUND` |
| `TC-22-05` | Gốc | Gateway từ chối ngay lập tức khi API bị `Suspended` | **PASS** | API chuyển Suspended: Gateway lập tức từ chối với `401 INVALID_API_KEY` (không lọt tới upstream) |
| `TC-22-EDGE-01`| Biên | Chặn `apiId` không phải số nguyên (chuỗi `abc`) | **PASS** | Trả về HTTP `400/404`, tuyệt đối **không gây sập 500** |
| `TC-22-EDGE-02`| Biên | Chặn `apiId` tràn số nguyên (`9999999999999999999`) | **PASS** | Validate biên số nguyên Zod `marketplaceId`, trả về `400/404`, không sập 500 |

---

### 6. Phân hệ Hồ sơ Cá nhân & Đổi Mật khẩu (US-05 — 5 Test Cases)
Thực thi qua `qa-scripts/sprint3-phase2-runner.js`:

| Mã TC | Phân loại | Tên Test Case | Kết quả | Chi tiết kiểm chứng kỹ thuật |
|---|:---:|---|:---:|---|
| `TC-05-01` | Gốc | Lấy thông tin tài khoản hiện tại `GET /api/auth/me` | **PASS** | HTTP 200 OK, trả về `{ id, email, role, name, active }` khớp database |
| `TC-05-02` | Gốc | Cập nhật tên hiển thị `PATCH /api/auth/me` thành công | **PASS** | HTTP 200 OK, tên mới được lưu bền vững vào PostgreSQL |
| `TC-05-03` | Gốc | Ràng buộc cập nhật profile (Unauth, Blank, Strict) | **PASS** | Chưa đăng nhập (401), tên rỗng/khoảng trắng (400), gửi thừa trường leo quyền (400 strict) |
| `TC-05-04` | Gốc | Ràng buộc đổi mật khẩu `POST /api/auth/change-password` | **PASS** | Sai mật khẩu cũ (401 `INVALID_CREDENTIALS`), trùng mật khẩu cũ (400 `PASSWORD_UNCHANGED`), quá ngắn (400) |
| `TC-05-05` | Gốc | Đổi mật khẩu thành công & Thu hồi phiên khác | **PASS** | Đổi mật khẩu thành công (200), giữ phiên hiện tại, thu hồi refresh token của session khác trong DB, mật khẩu cũ đăng nhập thất bại (401), mật khẩu mới đăng nhập thành công (200) |

---

### 7. Phân hệ Báo cáo Vi phạm & Kiểm duyệt API (US-15 — 7 Test Cases)
Thực thi qua `qa-scripts/sprint3-phase2-runner.js`:

| Mã TC | Phân loại | Tên Test Case | Kết quả | Chi tiết kiểm chứng kỹ thuật |
|---|:---:|---|:---:|---|
| `TC-15-01` | Gốc | Consumer gửi báo cáo vi phạm API Published thành công | **PASS** | HTTP 201 Created, status: `Pending`, danh mục hợp lệ, bản ghi lưu chuẩn vào bảng `reports` |
| `TC-15-02` | Gốc | Ràng buộc báo cáo (category sai, mô tả ngắn, API Draft)| **PASS** | Sai category (400), mô tả < 10 ký tự (400), API ở trạng thái Draft chưa Published (404) |
| `TC-15-03` | Gốc | Phân quyền & Cách ly dữ liệu Reports | **PASS** | Consumer xem báo cáo cá nhân (200), Consumer cố truy cập hàng đợi Admin bị chặn (403 `FORBIDDEN`), Admin xem hàng đợi (200) |
| `TC-15-04` | Gốc | Admin duyệt Suspend API và đóng báo cáo | **PASS** | Admin duyệt `action: "Suspend"`: API chuyển `Suspended`, ẩn khỏi Marketplace (404), report chuyển `Resolved`, duyệt lại bị từ chối `409 REPORT_CLOSED` |
| `TC-15-05` | Gốc | Admin duyệt Restore API & Kiểm tra Audit Log | **PASS** | Admin duyệt `action: "Restore"`: API khôi phục `Published`, xuất hiện lại trên sàn, `audit_logs` ghi nhận đầy đủ `report.suspend` và `report.restore` |
| `TC-15-EDGE-01`| Biên | Chặn ký tự NUL (`\u0000`) trong description/note | **PASS** | Validation reject từ chối với HTTP `400 VALIDATION_ERROR`, không để lọt vào PostgreSQL gây sập 500 |
| `TC-15-EDGE-02`| Biên | Chặn duyệt Report ID tràn số BIGINT (`9999999999999999999`) | **PASS** | Xử lý biên BigInt, trả về HTTP `400/404`, không gây lỗi chuyển đổi kiểu DB hay sập 500 |

---

## IV. BẢNG TỔNG HỢP & MINH BẠCH SỐ LIỆU KIỂM THỬ TOÀN HỆ THỐNG

| Bộ Kiểm thử | File Kịch bản Thực thi | Thiết kế (Designed) | Thực thi (Executed) | Đạt (Passed) | Hỏng (Failed) | Tạm hoãn (Skipped) | Tỷ lệ Đạt Thực thi | Độ phủ Thiết kế |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Hồi quy Sprint 1 - 2** | `qa-scripts/sprint2-backend-runner.js` | 60 | 60 | 60 | 0 | 0 | **100.0%** | **100.0%** |
| **Marketplace (US-16, 17)** | `qa-scripts/sprint3-marketplace-runner.js` | 17 | 17 | 17 | 0 | 0 | **100.0%** | **100.0%** |
| **Consumer (US-18, 19, 21)**| `qa-scripts/sprint3-consumer-runner.js` | 28 | 28 | 28 | 0 | 0 | **100.0%** | **100.0%** |
| **Phase 2 (US-22, 05, 15)**| `qa-scripts/sprint3-phase2-runner.js` | 19 | 19 | 19 | 0 | 0 | **100.0%** | **100.0%** |
| **TỔNG BACKEND RUNNERS** | — | **124** | **124** | **124** | **0** | **0** | **100.0%** (124/124) | **100.0%** (124/124) |
| **Frontend Unit Tests** | `frontend/` (Vitest Suite) | 347 | 347 | 347 | 0 | 0 | **100.0%** (347/347) | **100.0%** (32/32 files) |
| **TOÀN BỘ HỆ THỐNG** | **Full Acceptance Test Suite** | **471** | **471** | **471** | **0** | **0** | **100.0%** | **100.0%** |

---

## V. ĐÁNH GIÁ CHẤT LƯỢNG KỸ THUẬT & TỰ KIỂM TOÁN CHÉO (SELF-AUDIT)

Đội ngũ QA đã thực hiện kiểm toán chéo độc lập theo 5 tiêu chuẩn nghiêm ngặt của Senior Code Auditor:

### 1. Kiểm toán Cô lập Dữ liệu (Zero Seed Mutation)
- [x] Đã chụp snapshot database trước và sau khi chạy chuỗi kiểm thử tự động:
  * Trạng thái các API seed cốt lõi (ID 3, ID 12) được bảo toàn nguyên vẹn 100% ở trạng thái `Published`.
  * Các route seed và dữ liệu người dùng seed không bị biến đổi hay xóa nhầm.
  * Toàn bộ tài nguyên test tạm thời tạo ra trong quá trình kiểm thử đều được thu hồi sạch sẽ.

### 2. Kiểm toán Dọn dẹp Setup Thất bại (Fault-Tolerant Early Cleanup)
- [x] Áp dụng mảng `cleanupUserIds` và `createdUserIds` thu thập ID ngay lập tức sau phản hồi đăng ký 201 thành công.
- [x] Khối `finally` xóa tuần tự theo thứ tự khóa ngoại an toàn: `reports -> gateway_routes -> api_endpoints -> api_versions -> sandbox_grants -> api_keys -> refresh_tokens -> audit_logs -> users`.
- [x] Thông điệp "Khôi phục nguyên trạng" chỉ xuất hiện khi khối dọn dẹp hoàn tất không có lỗi.

### 3. Kiểm toán Chống False-Positive (Strict Assertions)
- [x] 100% các assertion kiểm tra lỗi âm tính (Negative Tests) đều xác minh chính xác mã trạng thái HTTP (`400`, `401`, `403`, `404`, `409`) và đối soát trường lỗi `code` chuẩn hóa (`res.body.error.code`).
- [x] Không tồn tại assertion lỏng lẻo dạng `res.status >= 400` hay `used_requests > 0`.

### 4. Kiểm toán Tính lặp lại (Idempotency)
- [x] Toàn bộ chuỗi 4 runner backend đã được thực thi liên tiếp 2 lần hoàn chỉnh trên môi trường thực tế:
  * Lần 1: 124/124 PASS (100.0%).
  * Lần 2: 124/124 PASS (100.0%).
- [x] Tích hợp cơ chế tự động backoff retry thông minh khi gặp `429 RATE_LIMITED`, đảm bảo bộ kiểm thử chạy ổn định trong mọi điều kiện tải mà không bị sập hay gián đoạn.

### 5. Tiêu chuẩn Kho mã nguồn & Clean Code
- [x] Script kiểm tra kho mã nguồn `scripts/kiem-tra-kho-ma-nguon.ps1`: **Thành công 341/341 tệp, 0 lỗi nền tảng**, không có trailing whitespace hay conflict markers.
- [x] `npm run lint` backend: **0 lỗi TypeScript**.
- [x] `npx tsc -b` frontend: **0 lỗi TypeScript**.

---

## VI. KẾT LUẬN & CHỮ KÝ NGHIỆM THU (FINAL SIGN-OFF)

1. **Đánh giá Chất lượng:** Sprint 3 đã hoàn thành vượt mức kế hoạch ban đầu, bao phủ trọn vẹn cả 8 User Stories với chất lượng cao nhất. Toàn bộ các lỗ hổng bảo mật nghiêm trọng (SSRF, rò rỉ secret, race condition quota, memory leak) đều đã được ngăn chặn và có kịch bản kiểm thử tự động bảo vệ lâu dài.
2. **Quyết định:** **CHÍNH THỨC PHÊ DUYỆT BÀN GIAO SPRINT 3 (FINAL SIGN-OFF)**. Toàn bộ mã nguồn đã sẵn sàng 100% để merge vào nhánh `main` và phát hành phiên bản release chính thức.

*Ký duyệt bởi:*<br/>
**Trần Hà Thảo Vân**<br/>
*QA Automation Lead & Documentation Lead*<br/>
*MSSV: BCS250039 (`@vuonghathaovan-gif` — Issue #15 & Issue #70)*
