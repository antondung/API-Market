# Sprint 3 — Tiêu chí Chấp nhận (Acceptance Criteria) & Ma trận RBAC

> **Dự án:** API Marketplace & Management
> **Tài liệu QA Lead:** Trần Hà Thảo Vân (`@vuonghathaovan-gif` — Issue #15)
> **Phạm vi Sprint 3:** `EP05` (Marketplace & Discovery), `EP06` (API Detail & Public Documentation), `EP07` (Interactive Playground & Anti-SSRF), `EP08` (Try Before Subscribe & Sandbox Quota), `EP09` (API Key Management), `EP10` (Gateway Routing Framework), `EP04` (Report & Moderation Extension), `EP01` (User Profile & Security).
> **Mã Backlog:** `US-16`, `US-17`, `US-18`, `US-19`, `US-21`, `US-22`, `US-15`, `US-05`.
> **Căn cứ kỹ thuật:** Schema `006_create_marketplace_gateway_schema.sql`, `007_provider_documentation_state.sql`, `backend/src/marketplace-contract.ts`, `backend/src/marketplace-service.ts`, `backend/SPRINT-3-HANDOFF.md`, `migrations/sprint3-query-guide.md`.

---

## PHẦN 1 — TIÊU CHÍ CHẤP NHẬN CHI TIẾT (US-16 $\to$ US-05)

---

### US-16 — Tìm kiếm, Lọc, Sắp xếp & Phân trang Marketplace

- **Mục tiêu:** Cung cấp trải nghiệm khám phá API công khai cho Consumer; hỗ trợ tìm kiếm nhanh, lọc theo danh mục, thẻ tag, nhà cung cấp, gói cước (Free/Paid), sắp xếp và phân trang ổn định.
- **Tác nhân:** Mọi người dùng (`Guest`, `CONSUMER`, `API_PROVIDER`, `ADMIN`). Không yêu cầu JWT.
- **Endpoint liên quan:**
  - `GET /api/marketplace/apis` — Danh sách API công khai.
- **Database & Index:** Bảng `apis`, `api_providers`, `api_plans`. Index `idx_apis_marketplace_published_newest`, `idx_apis_marketplace_category_published`, `idx_apis_marketplace_tags` (GIN), `idx_apis_marketplace_search` (GIN Full-Text), `idx_api_plans_marketplace_active_price`.

#### Tiêu chí Chấp nhận (Acceptance Criteria):
1. **AC 1 (Quy tắc hiển thị công khai nghiêm ngặt):**
   - **Given:** Có các API ở các trạng thái khác nhau (`Draft`, `Under Review`, `Approved`, `Published`, `Suspended`, `Rejected`) và các tài khoản Provider (`Pending`, `Verified`, `Rejected`).
   - **When:** Người dùng gọi `GET /api/marketplace/apis`.
   - **Then:** Chỉ các API có trạng thái `Published` và thuộc Provider có tài khoản hoạt động (`is_locked = FALSE`) mới được trả về. Mọi API nháp, đang duyệt hoặc bị đình chỉ không được phép xuất hiện.
2. **AC 2 (Tìm kiếm theo từ khóa `q`):**
   - **Given:** API đã `Published` có tên hoặc mô tả chứa từ khóa.
   - **When:** Người dùng truyền tham số query `q=keyword`.
   - **Then:** Tìm kiếm theo chuỗi con (substring) không phân biệt chữ hoa/chữ thường (case-insensitive) trên cả trường tên (`name`) và mô tả (`description`). Các ký tự đặc biệt (`%`, `_`) được xử lý như ký tự thường, không phải wildcard SQL.
3. **AC 3 (Bộ lọc kết hợp logic AND):**
   - **Given:** Người dùng chọn kết hợp nhiều bộ lọc.
   - **When:** Truyền đồng thời các tham số `category`, `tag`, `providerId`, `pricing`.
   - **Then:** Hệ thống lọc kết hợp theo điều kiện logic **AND**:
     - `category`: Khớp chính xác danh mục.
     - `tag`: API phải chứa tag được chỉ định (truy vấn JSONB mảng tags).
     - `providerId`: ID nhà cung cấp hợp lệ (dương nguyên, map bảng `api_providers`).
     - `pricing=free`: Có ít nhất một gói giá đang hoạt động (`is_active = TRUE`) với `price_monthly = 0`.
     - `pricing=paid`: Có ít nhất một gói giá đang hoạt động với `price_monthly > 0`.
4. **AC 4 (Sắp xếp ổn định & Keyset/Offset Pagination):**
   - **Given:** Danh sách kết quả thỏa mãn điều kiện lọc.
   - **When:** Người dùng chỉ định `sort=newest` (mặc định) hoặc `sort=name`, cùng `page` (1–10000) và `pageSize` (1–100, mặc định 20).
   - **Then:** Hệ thống trả về danh sách phân trang ổn định (`published_at DESC, id DESC` cho newest; `LOWER(name) ASC, id ASC` cho name). Tổng số bản ghi `total` và danh sách phần tử trong trang được tính trên cùng một transaction snapshot PostgreSQL. Nếu `page` vượt quá tổng số trang, trả về mảng `items: []` rỗng với `total` chính xác.
5. **AC 5 (Validation & Giới hạn tần suất):**
   - **Given:** Request gửi tới `/api/marketplace/apis`.
   - **When:** Tham số không hợp lệ (như lặp tham số, chứa ký tự NUL, `pageSize > 100`, `page < 1`) hoặc vượt tần suất 120 req/phút/IP.
   - **Then:** Trả về HTTP `400 Bad Request` (`VALIDATION_ERROR`) hoặc HTTP `429 Too Many Requests` (`RATE_LIMITED`), kèm header `Cache-Control: no-store`.

---

### US-17 — Chi tiết API Công khai (API Detail & Public Documentation)

- **Mục tiêu:** Cung cấp thông tin chi tiết của một API cho Consumer đánh giá trước khi đăng ký; hiển thị tài liệu OpenAPI, danh sách endpoint, các gói giá khả dụng và tuyên bố quyền riêng tư.
- **Tác nhân:** Mọi người dùng (`Guest`, `CONSUMER`, `API_PROVIDER`, `ADMIN`). Không yêu cầu JWT.
- **Endpoint liên quan:**
  - `GET /api/marketplace/apis/{id}` — Chi tiết API theo ID.
- **Database:** Bảng `apis`, `api_versions`, `api_endpoints`, `api_documentations`, `api_plans`, `api_legal_declarations`.

#### Tiêu chí Chấp nhận (Acceptance Criteria):
1. **AC 1 (Hiển thị đầy đủ thông tin kỹ thuật & thương mại):**
   - **Given:** API hợp lệ ở trạng thái `Published`.
   - **When:** Người dùng gọi `GET /api/marketplace/apis/{id}`.
   - **Then:** Trả về HTTP `200 OK` với đầy đủ cấu trúc:
     - Thông tin API: `id`, `name`, `description`, `category`, `tags`, `publishedAt`.
     - Nhà cung cấp: `providerId`, `providerName`, `providerStatus`.
     - `versions`: Danh sách phiên bản đã phát hành sắp xếp theo ID mới nhất trước.
     - `endpoints`: Danh sách endpoint đã đăng ký (`method`, `path`, `description`, `parameters`, `requestSchema`, `responseExample`).
     - `documentation`: Tài liệu OpenAPI JSON chuẩn hóa (`versionId`, `source`, `content`).
     - `plans`: Chỉ trả các gói giá đang hoạt động (`is_active = TRUE`), gồm `priceMonthly`, `currency`, `quota`, `rateLimit`.
     - `legal`: Thông tin phân loại dữ liệu (`dataClassification`), xử lý dữ liệu cá nhân (`processesPersonalData`, `personalDataTypes`, `dataProcessingPurpose`).
2. **AC 2 (Bảo vệ bí mật & Ẩn hoàn toàn thông tin kiểm duyệt nội bộ):**
   - **Given:** API có các dữ liệu kiểm duyệt nội bộ trong DB.
   - **When:** Người dùng xem chi tiết API công khai.
   - **Then:** Payload trả về **tuyệt đối không chứa**:
     - Bằng chứng KYC doanh nghiệp (`evidence_urls`), email liên hệ nội bộ.
     - Token xác minh tên miền (`challenge_token`).
     - Nhận xét duyệt của Admin (`review_notes`, `reject_reason`).
     - URL máy chủ gốc riêng tư nếu chưa công bố trong OpenAPI servers.
3. **AC 3 (Bảo toàn trạng thái không tìm thấy - Uniform 404):**
   - **Given:** Request gọi `GET /api/marketplace/apis/{id}`.
   - **When:** `id` không tồn tại, API ở trạng thái khác `Published` (`Draft`, `Under Review`, `Suspended`), hoặc tài khoản Provider bị khóa (`is_locked = TRUE`).
   - **Then:** Hệ thống trả về cùng một mã lỗi HTTP `404 Not Found` (`NOT_FOUND`), không tiết lộ sự tồn tại của tài nguyên chưa công khai.

---

### US-18 — Thử nghiệm API Trực quan (API Playground) & Phòng chống SSRF

- **Mục tiêu:** Cho phép Consumer thử nghiệm trực tiếp các endpoint của API trước khi tích hợp; bảo vệ máy chủ nền tảng khỏi các cuộc tấn công Server-Side Request Forgery (SSRF).
- **Tác nhân:** `CONSUMER` (hoặc Guest có phiên thử nghiệm).
- **Endpoint liên quan:**
  - `POST /api/marketplace/apis/{id}/playground` (hoặc proxy runner).
- **Cơ chế an toàn (Anti-SSRF Policy):**

#### Tiêu chí Chấp nhận (Acceptance Criteria):
1. **AC 1 (Thực thi request hợp lệ qua Proxy):**
   - **Given:** Endpoint đã đăng ký trong OpenAPI/Endpoint Registry của API `Published`.
   - **When:** Consumer chọn Method, Path, nhập Query Params, Request Headers và JSON Body hợp lệ, nhấn "Send Request".
   - **Then:** Backend Playground Proxy chuyển tiếp request tới đúng `upstream_base_url` đã khai báo, đo thời gian phản hồi (latency ms), nhận response và trả về cho client gồm: Status Code, Response Headers, Response Body và Latency.
2. **AC 2 (Chặn tuyệt đối tấn công SSRF & Địa chỉ mạng nội bộ):**
   - **Given:** Kẻ tấn công hoặc người dùng cố tình gửi request tới địa chỉ nội bộ hoặc URL tùy ý.
   - **When:** Target URL phân giải về:
     - Loopback: `127.0.0.1`, `localhost`, `::1`.
     - Dải mạng riêng tư RFC 1918: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.
     - Link-local & Cloud Metadata: `169.254.169.254`, `fe80::/10`.
     - Endpoint không thuộc danh sách endpoint đã đăng ký của API.
   - **Then:** Playground Proxy từ chối ngay lập tức với HTTP `400 Bad Request` hoặc `403 Forbidden` (`SSRF_DETECTED` hoặc `ENDPOINT_NOT_REGISTERED`), không thực hiện kết nối mạng ra ngoài.
3. **AC 3 (Chống DNS Rebinding & Chặn chuyển hướng HTTP Redirect):**
   - **Given:** Upstream host cấu hình DNS Rebinding trả về IP công khai ở lần phân giải đầu nhưng IP nội bộ ở lần phân giải sau, hoặc trả về HTTP `301/302 Redirect` tới IP nội bộ.
   - **When:** Playground Proxy thực hiện gọi request.
   - **Then:** Proxy kiểm tra IP tại thời điểm mở socket kết nối thực tế; tự động cấm theo dõi chuyển hướng (`maxRedirects: 0`), ngăn chặn việc lợi dụng redirect để truy cập tài nguyên mạng nội bộ.
4. **AC 4 (Giới hạn tài nguyên & Timeout):**
   - **Given:** Upstream API bị treo hoặc trả về payload kích thước khổng lồ.
   - **When:** Phản hồi vượt quá thời gian timeout (tối đa 10 giây) hoặc dung lượng vượt quá 2MB.
   - **Then:** Proxy tự động ngắt kết nối và trả về HTTP `504 Gateway Timeout` hoặc `413 Payload Too Large`.

---

### US-19 — Trải nghiệm Dùng thử (Try Before Subscribe & Sandbox Quota)

- **Mục tiêu:** Cung cấp quota dùng thử giới hạn (3–10 request/API) cho Consumer trải nghiệm mà không cần cam kết thanh toán hoặc đăng ký gói trả phí.
- **Tác nhân:** `CONSUMER` đã đăng nhập.
- **Database:** Bảng `sandbox_grants`, Stored Procedure `consume_sandbox_grant(consumer_id, api_id)`. Ràng buộc `uq_sandbox_grants_consumer_api`.

#### Tiêu chí Chấp nhận (Acceptance Criteria):
1. **AC 1 (Cấp phát quota dùng thử duy nhất):**
   - **Given:** Consumer đã đăng nhập và lần đầu truy cập thử nghiệm một API `Published`.
   - **When:** Hệ thống khởi tạo phiên sandbox cho Consumer.
   - **Then:** Một bản ghi duy nhất được tạo trong `sandbox_grants` với `max_requests` (từ 3 đến 10 lượt, mặc định 5), `used_requests = 0`, thời hạn `expires_at = NOW() + INTERVAL '24 HOURS'`.
2. **AC 2 (Trừ lượt dùng thử nguyên tử - Atomic Consumption):**
   - **Given:** Consumer thực hiện gọi thử API qua Playground.
   - **When:** Request được gửi đi.
   - **Then:** Hệ thống gọi hàm DB `consume_sandbox_grant(consumer_id, api_id)`. Hàm thực hiện `UPDATE` và trả về `remaining_requests` một cách nguyên tử (atomic). Không xảy ra race condition dù Consumer gửi nhiều request đồng thời.
3. **AC 3 (Chặn khi hết lượt dùng thử & Gợi ý Subscribe):**
   - **Given:** Consumer đã dùng hết số lượt (`used_requests == max_requests`) hoặc grant đã hết hạn (`expires_at < NOW()`).
   - **When:** Consumer tiếp tục nhấn "Send Request" trong Playground.
   - **Then:** Hàm DB tung ngoại lệ `P0001`; Playground chặn request, hiển thị thông báo "Bạn đã hết lượt dùng thử miễn phí" kèm nút điều hướng gợi ý "Đăng ký gói cước (Subscribe)" chuyển sang trang Pricing.
4. **AC 4 (Chống Reset Quota qua F5/Reload):**
   - **Given:** Consumer đã tiêu thụ một số lượt thử.
   - **When:** Consumer tải lại trang (F5), mở tab mới, xóa localStorage hoặc đăng xuất rồi đăng nhập lại.
   - **Then:** Số lượt còn lại vẫn được duy trì chính xác từ Database; không bị reset về số lượt ban đầu.

---

### US-21 — Quản lý Vòng đời Khóa API (API Key Lifecycle Management)

- **Mục tiêu:** Cho phép Consumer tự sinh, quản lý, đổi mới (rotate) và thu hồi (revoke) API Key để tích hợp vào ứng dụng thực tế; bảo mật tuyệt đối giá trị khóa thô.
- **Tác nhân:** `CONSUMER` (sở hữu khóa), `ADMIN` (giám sát).
- **Database:** Bảng `api_keys`, ràng buộc `chk_api_keys_hash`, `chk_api_keys_prefix`, `uq_api_keys_active_user_api`.

#### Tiêu chí Chấp nhận (Acceptance Criteria):
1. **AC 1 (Sinh API Key & Nguyên tắc hiển thị 1 lần duy nhất):**
   - **Given:** Consumer có nhu cầu tạo khóa cho một API đã đăng ký/cho phép.
   - **When:** Consumer gọi tạo API Key kèm nhãn tùy chọn (`label`).
   - **Then:**
     - Backend sinh một chuỗi khóa ngẫu nhiên có độ dài bảo mật (ví dụ: tiền tố `ak_live_` + 32 ký tự hex ngẫu nhiên).
     - Database chỉ lưu `key_prefix` (32 ký tự) và `key_hash` (chuỗi hex 64 ký tự là mã băm SHA-256 của key thô). Tuyệt đối **không lưu plaintext key**.
     - API response trả về key thô **duy nhất một lần** trong phản hồi tạo mới. Giao diện hiển thị pop-up cảnh báo: *"Vui lòng sao chép và lưu trữ khóa ngay bây giờ. Khóa này sẽ không bao giờ được hiển thị lại"*.
2. **AC 2 (Đổi khóa - Key Rotation không gián đoạn):**
   - **Given:** Consumer có một API Key đang hoạt động (`is_active = TRUE`).
   - **When:** Consumer yêu cầu Rotate Key.
   - **Then:** Khóa cũ được chuyển trạng thái `is_active = FALSE`, `revoked_at = CURRENT_TIMESTAMP`; một khóa mới được sinh ra và trả về cho người dùng. Khóa cũ bị từ chối ngay lập tức khi gửi tới Gateway.
3. **AC 3 (Thu hồi khóa - Key Revocation tức thì):**
   - **Given:** Consumer có API Key đang hoạt động.
   - **When:** Consumer nhấn "Revoke" khóa.
   - **Then:** Hệ thống cập nhật `is_active = FALSE`, `revoked_at = NOW()`. Mọi request tiếp theo sử dụng khóa này gửi tới Gateway phải bị từ chối với HTTP `401 Unauthorized`.
4. **AC 4 (Ghi nhận thời điểm sử dụng gần nhất - Last Used):**
   - **Given:** API Key đang hoạt động được sử dụng để gọi qua Gateway.
   - **When:** Request được xác thực thành công.
   - **Then:** Cột `last_used_at` trong bảng `api_keys` được cập nhật thời gian hiện tại mà không làm lộ nội dung khóa trong log hệ thống.

---

### US-22 — Cổng Giao tiếp Định tuyến (Gateway Routing Framework)

- **Mục tiêu:** Dựng khung Gateway cốt lõi để kiểm tra tính hợp lệ của request, xác thực API Key hoặc Sandbox Grant, định tuyến tới đúng máy chủ của Provider và thực thi chính sách vòng đời API.
- **Tác nhân:** Toàn hệ thống (Consumer gọi qua Gateway).
- **Database:** Bảng `gateway_routes`, `apis`, `api_keys`, `sandbox_grants`.

#### Tiêu chí Chấp nhận (Acceptance Criteria):
1. **AC 1 (Định tuyến tới Upstream hợp lệ):**
   - **Given:** API ở trạng thái `Published`, route trong `gateway_routes` có `is_enabled = TRUE`.
   - **When:** Request gửi tới Gateway kèm header `X-API-Key` hợp lệ.
   - **Then:** Gateway tính SHA-256 hash của header, xác thực `is_active = TRUE`, chuyển tiếp request tới `upstream_base_url` tương ứng và trả response về cho client.
2. **AC 2 (Chặn API chưa Published hoặc bị Suspend):**
   - **Given:** API có trạng thái khác `Published` (ví dụ: `Draft`, `Under Review`, `Suspended`, `Removed`).
   - **When:** Request gửi tới Gateway cố gắng truy cập API này.
   - **Then:** Gateway từ chối ngay lập tức với HTTP `403 Forbidden` (`API_SUSPENDED` hoặc `API_NOT_AVAILABLE`), không chuyển tiếp bất kỳ gói tin nào tới upstream.
3. **AC 3 (Ngăn chặn Header Injection & Lọc dữ liệu nhạy cảm):**
   - **Given:** Request từ client gửi tới Gateway.
   - **When:** Gateway xử lý chuyển tiếp.
   - **Then:** Gateway xóa bỏ hoặc ghi đè các header nội bộ nhạy cảm (như `X-Internal-Actor`, `Authorization` gốc của nền tảng); chỉ chuyển tiếp các header nghiệp vụ được phép.

---

### US-15 — Báo cáo Vi phạm & Kiểm duyệt Nội dung (Report & Moderation)

- **Mục tiêu:** Cho phép Consumer báo cáo các API có dấu hiệu lừa đảo, mã độc, vi phạm bản quyền hoặc vi phạm pháp luật; hỗ trợ Admin điều tra, đình chỉ (Suspend) hoặc phục hồi (Restore) API.
- **Tác nhân:** `CONSUMER` (báo cáo), `ADMIN` (xử lý).
- **Database:** Bảng `apis`, `audit_logs`, các bảng báo cáo vi phạm.

#### Tiêu chí Chấp nhận (Acceptance Criteria):
1. **AC 1 (Consumer gửi báo cáo vi phạm):**
   - **Given:** Consumer đã đăng nhập và đang xem một API trên Marketplace.
   - **When:** Consumer gửi báo cáo kèm lý do (`reason`), phân loại vi phạm (`category: "Malware" | "Copyright" | "Fraud" | "Other"`) và mô tả bằng chứng.
   - **Then:** Hệ thống ghi nhận báo cáo với trạng thái `Pending`; trả về HTTP `201 Created` xác nhận đã tiếp nhận.
2. **AC 2 (Admin xử lý đình chỉ - Suspend API):**
   - **Given:** Admin xem danh sách báo cáo vi phạm của một API.
   - **When:** Admin quyết định đình chỉ API (`action: "Suspend"`, kèm lý do).
   - **Then:**
     - Trạng thái của API lập tức chuyển sang `Suspended`.
     - API biến mất ngay lập tức khỏi Marketplace công khai (US-16).
     - Gateway (US-22) và Playground (US-18) lập tức chặn mọi request gọi tới API này.
     - Ghi nhận 1 bản ghi vào `audit_logs` với `action: "api.suspended"`.
3. **AC 3 (Admin phục hồi - Restore API):**
   - **Given:** API đang ở trạng thái `Suspended` sau khi Provider giải trình hợp lệ.
   - **When:** Admin thực hiện thao tác phục hồi (`Restore`).
   - **Then:** Trạng thái API chuyển lại thành `Published`; API xuất hiện trở lại trên Marketplace; Gateway mở lại lưu lượng; ghi `audit_logs` với `action: "api.restored"`.

---

### US-05 — Quản lý Hồ sơ Cá nhân & Đổi Mật khẩu An toàn

- **Mục tiêu:** Cho phép người dùng xem, cập nhật thông tin cá nhân và thay đổi mật khẩu tài khoản một cách an toàn.
- **Tác nhân:** Mọi người dùng đã đăng nhập (`CONSUMER`, `API_PROVIDER`, `ADMIN`).
- **Endpoint liên quan:**
  - `GET /api/user/profile` — Lấy thông tin cá nhân.
  - `PUT /api/user/profile` — Cập nhật tên hiển thị, thông tin liên hệ.
  - `POST /api/user/change-password` — Đổi mật khẩu tài khoản.
- **Database:** Bảng `users`, `refresh_tokens`.

#### Tiêu chí Chấp nhận (Acceptance Criteria):
1. **AC 1 (Xem & Cập nhật thông tin cá nhân):**
   - **Given:** Người dùng đã đăng nhập.
   - **When:** Gọi `GET /api/user/profile` hoặc cập nhật `PUT /api/user/profile` với `name` hợp lệ (1–100 ký tự).
   - **Then:** Trả về HTTP `200 OK`; cập nhật thành công tên hiển thị. Trường `email` và `role` là bất biến, không được phép thay đổi qua endpoint này.
2. **AC 2 (Đổi mật khẩu an toàn & Xác thực mật khẩu cũ):**
   - **Given:** Người dùng yêu cầu đổi mật khẩu.
   - **When:** Gửi `POST /api/user/change-password` với `currentPassword`, `newPassword` (độ dài $\ge 8$ ký tự, gồm chữ hoa, chữ thường, số/ký tự đặc biệt), và xác nhận mật khẩu mới.
   - **Then:**
     - Nếu `currentPassword` sai: Trả về HTTP `400 Bad Request` (`INVALID_CURRENT_PASSWORD`).
     - Nếu `newPassword` trùng mật khẩu cũ: Trả về HTTP `400 Bad Request` (`NEW_PASSWORD_SAME_AS_OLD`).
     - Nếu hợp lệ: Băm mật khẩu mới bằng thuật toán bảo mật (bcrypt/argon2), cập nhật vào DB, thu hồi toàn bộ Refresh Token cũ (bắt buộc đăng nhập lại trên các thiết bị khác) và trả về HTTP `200 OK`.

---

## PHẦN 2 — MA TRẬN PHÂN QUYỀN RBAC SPRINT 3

| Nhóm chức năng / Endpoint | Khách (Guest) | Consumer | Provider | Admin |
|---|:---:|:---:|:---:|:---:|
| **Xem Marketplace (`GET /api/marketplace/apis`)** | Cho phép | Cho phép | Cho phép | Cho phép |
| **Xem API Detail (`GET /api/marketplace/apis/:id`)** | Cho phép | Cho phép | Cho phép | Cho phép |
| **Thử nghiệm Playground (US-18)** | Chặn (hoặc cấp IP limit) | Cho phép | Cho phép | Cho phép |
| **Tiêu thụ lượt Sandbox (US-19)** | Chặn | Cho phép | Cho phép | Cho phép |
| **Tạo / Rotate / Revoke API Key (US-21)** | Chặn (`401`) | Cho phép (key riêng) | Cho phép (key riêng) | Cho phép |
| **Gọi qua Gateway khung (US-22)** | Chặn (`401`) | Cho phép (với key hợp lệ) | Cho phép (với key hợp lệ) | Cho phép |
| **Gửi báo cáo vi phạm API (US-15)** | Chặn (`401`) | Cho phép | Cho phép | Cho phép |
| **Admin xử lý Suspend / Restore API (US-15)** | Chặn (`403`) | Chặn (`403`) | Chặn (`403`) | Cho phép |
| **Quản lý Hồ sơ & Đổi mật khẩu (US-05)** | Chặn (`401`) | Cho phép | Cho phép | Cho phép |
