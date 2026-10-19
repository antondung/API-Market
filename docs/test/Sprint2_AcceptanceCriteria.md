# Sprint 2 — Tiêu chí Chấp nhận (Acceptance Criteria) & Ma trận RBAC

> **Dự án:** API Marketplace & Management
> **Tài liệu QA Lead:** Trần Hà Thảo Vân (`@vuonghathaovan-gif` — Issue #10)
> **Phạm vi Sprint 2:** `EP02` (Provider Onboarding & Compliance), `EP03` (API Publishing & Documentation), `EP04` (Admin Review, Audit & Moderation), `EP11` (Quality, Security & Regression)
> **Mã Backlog:** `US-06` $\to$ `US-14`
> **Căn cứ kỹ thuật:** Schema `003_create_provider_schema.sql`, `005_provider_domain_privacy.sql`, `backend/src/provider-contract.ts`, `backend/src/admin-review-contract.ts`, `backend/SPRINT-2-HANDOFF.md`, `backend/SPRINT-2-DUNG-HANDOFF.md`.

---

## PHẦN 1 — TIÊU CHÍ CHẤP NHẬN CHI TIẾT (US-06 $\to$ US-14)

---

### US-06 — Hồ sơ Xác minh Nhà cung cấp (Provider KYC & Verification)

- **Mục tiêu:** Cho phép người dùng có vai trò `API_PROVIDER` gửi hồ sơ xác minh doanh nghiệp/tổ chức để được cấp quyền đăng tải và xuất bản API lên sàn.
- **Tác nhân:** `API_PROVIDER` (Nhà cung cấp API).
- **Trạng thái hồ sơ:** `Pending` (Chờ duyệt) $\to$ `Verified` (Đã duyệt) hoặc `Rejected` (Bị từ chối). Khi chưa gửi: `Unverified` (hoặc `Draft`).
- **Endpoint liên quan:**
  - `GET /api/provider/verification` — Xem trạng thái hồ sơ hiện tại.
  - `POST /api/provider/verification` — Gửi hoặc gửi lại hồ sơ xác minh.
- **Database:** Bảng `provider_verifications`, trigger & ràng buộc `chk_provider_verifications_status`, `chk_provider_verifications_evidence_urls`.

#### Tiêu chí Chấp nhận (Acceptance Criteria):
1. **AC 1 (Gửi hồ sơ hợp lệ):**
   - **Given:** Người dùng đã đăng nhập với vai trò `API_PROVIDER` và chưa có hồ sơ hoặc hồ sơ trước đó bị `Rejected`.
   - **When:** Gửi request `POST /api/provider/verification` với `organizationName` (1–200 ký tự), `contactEmail` hợp lệ, và `evidenceUrls` (mảng $\ge 1$ URL).
   - **Then:** Hệ thống ghi nhận bản ghi mới vào `provider_verifications` với trạng thái `Pending`, `submitted_at` là thời gian hiện tại, trả về HTTP `201 Created` kèm payload hồ sơ.
2. **AC 2 (Validation dữ liệu đầu vào):**
   - **Given:** Provider gửi yêu cầu xác minh.
   - **When:** `organizationName` rỗng/chỉ chứa khoảng trắng, `contactEmail` sai định dạng email, hoặc `evidenceUrls` là mảng rỗng.
   - **Then:** Hệ thống từ chối với HTTP `400 Bad Request`, mã lỗi `VALIDATION_ERROR`, liệt kê chi tiết trường vi phạm.
3. **AC 3 (Chặn gửi trùng khi đang chờ duyệt hoặc đã duyệt):**
   - **Given:** Provider đã có hồ sơ đang ở trạng thái `Pending` hoặc `Verified`.
   - **When:** Provider tiếp tục gọi `POST /api/provider/verification`.
   - **Then:** Hệ thống từ chối với HTTP `409 Conflict`, mã lỗi `VERIFICATION_IN_PROGRESS` hoặc `ALREADY_VERIFIED`, không ghi đè hồ sơ.
4. **AC 4 (Gửi lại hồ sơ sau khi bị từ chối):**
   - **Given:** Hồ sơ trước đó của Provider có trạng thái `Rejected` (kèm `reject_reason`).
   - **When:** Provider chỉnh sửa thông tin và gửi lại `POST /api/provider/verification`.
   - **Then:** Hệ thống tạo bản ghi mới với trạng thái `Pending`, xóa bỏ trạng thái khóa, cho phép Admin duyệt lại.
5. **AC 5 (Xem trạng thái hồ sơ):**
   - **Given:** Provider đã đăng nhập.
   - **When:** Gọi `GET /api/provider/verification`.
   - **Then:** Trả về HTTP `200 OK` kèm thông tin hồ sơ mới nhất (gồm `status`, `organizationName`, `contactEmail`, `evidenceUrls`, `rejectReason` nếu có, `reviewedAt`, `reviewedBy`). Nếu chưa từng nộp hồ sơ, trả về `data: null`.

---

### US-07 — Admin Duyệt & Từ chối Hồ sơ Provider

- **Mục tiêu:** Cung cấp công cụ cho Quản trị viên (`ADMIN`) kiểm duyệt hồ sơ KYC của Provider, đảm bảo tính pháp lý và tin cậy trước khi mở khóa quyền tạo API.
- **Tác nhân:** `ADMIN` (Quản trị viên hệ thống).
- **Endpoint liên quan:**
  - `GET /api/admin/provider-verifications` — Danh sách hồ sơ cần duyệt (hỗ trợ query `status=Pending|Verified|Rejected`, phân trang `page`, `pageSize`).
  - `GET /api/admin/provider-verifications/{providerId}` — Xem chi tiết hồ sơ mới nhất của Provider.
  - `POST /api/admin/provider-verifications/{providerId}/review` — Phê duyệt hoặc từ chối hồ sơ (`decision: "Verified" | "Rejected"`).
- **Database:** Bảng `provider_verifications`, `audit_logs`.

#### Tiêu chí Chấp nhận (Acceptance Criteria):
1. **AC 1 (Danh sách hàng chờ duyệt):**
   - **Given:** Admin đã đăng nhập với vai trò `ADMIN`.
   - **When:** Gọi `GET /api/admin/provider-verifications?status=Pending`.
   - **Then:** Trả về HTTP `200 OK` danh sách các hồ sơ mới nhất của từng Provider đang chờ duyệt, sắp xếp theo thời gian nộp `submitted_at ASC`.
2. **AC 2 (Admin phê duyệt Provider):**
   - **Given:** Provider có hồ sơ đang `Pending`.
   - **When:** Admin gọi `POST /api/admin/provider-verifications/{providerId}/review` với body `{ "decision": "Verified" }`.
   - **Then:** Trạng thái hồ sơ chuyển sang `Verified`, `reviewed_at` được gán thời gian hiện tại, `reviewed_by` gán ID của Admin; hệ thống tự động ghi 1 bản ghi vào `audit_logs` với `action: "provider.verified"`; Provider được mở khóa quyền tạo API.
3. **AC 3 (Admin từ chối bắt buộc có lý do):**
   - **Given:** Provider có hồ sơ đang `Pending`.
   - **When:** Admin gửi yêu cầu từ chối `{ "decision": "Rejected" }` nhưng bỏ trống trường `reason` hoặc `reason` chỉ chứa khoảng trắng.
   - **Then:** Hệ thống từ chối với HTTP `400 Bad Request`, mã lỗi `REASON_REQUIRED`, không thay đổi trạng thái hồ sơ.
4. **AC 4 (Từ chối hợp lệ):**
   - **Given:** Provider có hồ sơ đang `Pending`.
   - **When:** Admin gửi `{ "decision": "Rejected", "reason": "Giấy phép kinh doanh mờ, không rõ mã số thuế" }`.
   - **Then:** Trạng thái hồ sơ chuyển sang `Rejected`, lưu `reject_reason`; ghi `audit_logs` với `action: "provider.rejected"`; trả về HTTP `200 OK`.
5. **AC 5 (Chặn duyệt lại hồ sơ đã xử lý):**
   - **Given:** Hồ sơ Provider đã ở trạng thái `Verified` hoặc `Rejected`.
   - **When:** Admin tiếp tục gọi review trên hồ sơ này.
   - **Then:** Hệ thống trả về HTTP `409 Conflict`, mã lỗi `VERIFICATION_ALREADY_REVIEWED`.

---

### US-08 — Khai báo Pháp lý, Dữ liệu Cá nhân & Xác minh Tên miền (Domain Verification)

- **Mục tiêu:** Ràng buộc pháp lý về bản quyền sở hữu API, thỏa thuận nhà cung cấp (Agreement versioning), khai báo xử lý dữ liệu cá nhân (GDPR/PDPA) và xác thực quyền kiểm soát hostname (DNS TXT challenge).
- **Tác nhân:** `API_PROVIDER` (sở hữu API).
- **Endpoint liên quan:**
  - `GET /api/provider/agreement` — Lấy phiên bản thỏa thuận nhà cung cấp đang hiệu lực (`is_active = true`).
  - `GET /api/provider/apis/{id}/legal` — Xem khai báo pháp lý của API.
  - `PUT /api/provider/apis/{id}/legal` — Cập nhật khai báo quyền sở hữu, bản quyền và dữ liệu cá nhân.
  - `GET /api/provider/apis/{id}/domain-verification` — Kiểm tra trạng thái xác minh tên miền.
  - `POST /api/provider/apis/{id}/domain-verification/challenge` — Tạo DNS TXT challenge ngẫu nhiên.
  - `POST /api/provider/apis/{id}/domain-verification/verify` — Thực hiện tra cứu DNS TXT thực tế để xác thực.
- **Database:** Bảng `agreements`, `api_legal_declarations`, `api_domain_verifications`. Ràng buộc `chk_legal_personal_data`.

#### Tiêu chí Chấp nhận (Acceptance Criteria):
1. **AC 1 (Phiên bản thỏa thuận máy chủ):**
   - **Given:** Provider gọi `GET /api/provider/agreement`.
   - **Then:** Hệ thống trả về bản thỏa thuận đang hoạt động (`is_active = true`) gồm `id`, `version`, `content`, `effectiveAt`.
2. **AC 2 (Khai báo pháp lý hợp lệ):**
   - **Given:** API đang ở trạng thái `Draft` thuộc sở hữu của Provider.
   - **When:** Provider gọi `PUT /api/provider/apis/{id}/legal` với:
     - `agreementId` khớp với active agreement.
     - `ownershipDeclaration` và `distributionRights` không rỗng.
     - `dataClassification` thuộc `['Public', 'Internal', 'Confidential', 'Restricted']`.
     - `processesPersonalData`: boolean rõ ràng (`true` hoặc `false`).
   - **Then:** Hệ thống lưu thông tin vào `api_legal_declarations`, gán `accepted_at` theo thời gian máy chủ, trả về HTTP `200 OK`.
3. **AC 3 (Ràng buộc khi có xử lý dữ liệu cá nhân):**
   - **Given:** Provider thực hiện khai báo pháp lý cho API.
   - **When:** `processesPersonalData: true` nhưng `personalDataTypes` là mảng rỗng hoặc `dataProcessingPurpose` bị bỏ trống.
   - **Then:** Hệ thống từ chối với HTTP `400 Bad Request` (vi phạm ràng buộc DB `chk_legal_personal_data`), yêu cầu kê khai rõ loại dữ liệu (email, số điện thoại, CCCD...) và mục đích xử lý.
4. **AC 4 (Tạo DNS TXT Challenge xác minh Domain):**
   - **Given:** API có `base_url` hợp lệ (VD: `https://api.partner.com/v1`).
   - **When:** Provider gọi `POST /api/provider/apis/{id}/domain-verification/challenge`.
   - **Then:** Hệ thống sinh mã token ngẫu nhiên (hash SHA-256 64 ký tự), lưu vào `api_domain_verifications` kèm thời gian hết hạn thử thách `challenge_expires_at` (24 giờ), trả về HTTP `201 Created` gồm `recordType: "TXT"`, `recordName: "_api-market-challenge.<hostname>"`, `recordValue: "<token>"`.
5. **AC 5 (Xác thực DNS TXT Transport thật):**
   - **Given:** Provider đã cấu hình bản ghi TXT trên máy chủ DNS của tên miền.
   - **When:** Provider gọi `POST /api/provider/apis/{id}/domain-verification/verify`.
   - **Then:** Hệ thống thực hiện truy vấn DNS thực tế tới hostname:
     - Nếu bản ghi TXT khớp token và challenge chưa hết hạn: đánh dấu `verified: true`, cấp hạn xác nhận `verification_expires_at` (7 ngày), trả về HTTP `200 OK`.
     - Nếu sai token, không tìm thấy bản ghi hoặc hết hạn: trả về `400 Bad Request` hoặc `429/503`, không xác thực.
     - Ngăn chặn triệt để hostname là IP nội bộ (`127.0.0.1`, `localhost`, `10.x.x.x`, `192.168.x.x`, `169.254.x.x`) để chống SSRF.

---

### US-09 — Quản lý API, Endpoint & Version (API Lifecycle & Inventory)

- **Mục tiêu:** Cung cấp bộ chức năng CRUD đầy đủ cho Nhà cung cấp để quản lý danh mục API, các phiên bản phát hành và định nghĩa chi tiết từng Endpoint.
- **Tác nhân:** `API_PROVIDER` đã được duyệt (`Verified`).
- **Endpoint liên quan:**
  - `GET /api/provider/apis` — Danh sách API của tôi (phân trang `page`, `pageSize`).
  - `POST /api/provider/apis` — Khởi tạo API mới (bắt buộc trạng thái ban đầu là `Draft`).
  - `GET|PUT|DELETE /api/provider/apis/{id}` — Xem, cập nhật metadata, xóa API nháp.
  - `GET|POST /api/provider/apis/{id}/versions` — Danh sách và tạo phiên bản API (`version`, `changelog`).
  - `PUT|DELETE /api/provider/apis/{id}/versions/{vid}` — Sửa, xóa phiên bản API nháp.
  - `GET|POST /api/provider/apis/{id}/endpoints` — Danh sách và tạo endpoint thủ công.
  - `PUT|DELETE /api/provider/apis/{id}/endpoints/{eid}` — Sửa, xóa endpoint.
- **Database:** Bảng `apis`, `api_versions`, `api_endpoints`. Ràng buộc `trg_apis_enforce_status_transition`.

#### Tiêu chí Chấp nhận (Acceptance Criteria):
1. **AC 1 (Chỉ Provider Verified mới được tạo API):**
   - **Given:** Người dùng có role `API_PROVIDER` nhưng hồ sơ đang `Pending` hoặc `Rejected` (hoặc chưa gửi hồ sơ).
   - **When:** Gửi request `POST /api/provider/apis`.
   - **Then:** Hệ thống từ chối với HTTP `403 Forbidden`, mã lỗi `PROVIDER_NOT_VERIFIED`.
2. **AC 2 (Tạo API Draft hợp lệ):**
   - **Given:** Provider đã `Verified`.
   - **When:** Gửi `POST /api/provider/apis` với `name`, `description`, `category`, `baseUrl` (định dạng `http://` hoặc `https://`), `tags` (mảng chuỗi).
   - **Then:** Tạo thành công API với trạng thái mặc định `Draft`, `submitted_at`, `approved_at`, `published_at` đều là `null`; trả về HTTP `201 Created`.
3. **AC 3 (Ràng buộc trùng tên trong cùng Provider):**
   - **Given:** Provider đã có API tên `"Weather Service"`.
   - **When:** Provider tạo tiếp API mới với tên `"Weather Service"`.
   - **Then:** Hệ thống trả về HTTP `409 Conflict` (vi phạm ràng buộc UNIQUE `uq_apis_provider_name`).
4. **AC 4 (Quản lý Version và ràng buộc cha - con):**
   - **Given:** API hợp lệ thuộc quyền sở hữu của Provider.
   - **When:** Provider thêm version mới `POST /api/provider/apis/{id}/versions` với `{ "version": "v1.0.0", "changelog": "Khởi tạo" }`.
   - **Then:** Tạo phiên bản mới gắn với `api_id`, trả về HTTP `201 Created`. Khi cập nhật hoặc xóa version `{vid}`, nếu `vid` không thuộc `api_id` thì trả về HTTP `404 Not Found`.
5. **AC 5 (Quản lý Endpoint & Đồng bộ tài liệu):**
   - **Given:** API và Version đang ở trạng thái `Draft`.
   - **When:** Provider thêm hoặc cập nhật Endpoint qua `POST|PUT /api/provider/apis/{id}/endpoints`.
   - **Then:** Validate Method thuộc `['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE']`, `path` bắt đầu bằng `/`. Khi sửa endpoint bằng tay, hệ thống tự động xóa bộ nhớ cache tài liệu imported (`cached documentation`) để tránh mất đồng bộ.
6. **AC 6 (Đóng băng khi không phải Draft):**
   - **Given:** API đang ở trạng thái `Submitted`, `Under Review`, `Approved`, hoặc `Published`.
   - **When:** Provider thực hiện các lệnh chỉnh sửa metadata, versions, endpoints (`PUT`, `DELETE`).
   - **Then:** Hệ thống từ chối với HTTP `409 Conflict`, mã lỗi `API_FROZEN_NOT_DRAFT`.

---

### US-10 — Import OpenAPI 3.0 / Swagger 2.0 & Sinh Tài liệu 7 Khối

- **Mục tiêu:** Tự động hóa quá trình đưa API lên sàn bằng cách upload file đặc tả OpenAPI/Swagger (JSON/YAML), tự động trích xuất endpoints, tham số, schema và tài liệu chuẩn hóa 7 khối.
- **Tác nhân:** `API_PROVIDER` (sở hữu API `Draft`).
- **Endpoint liên quan:**
  - `POST /api/provider/apis/{id}/import-openapi` — Upload file multipart (`file`, `versionId`).
  - `GET /api/provider/apis/{id}/documentation` — Đọc tài liệu chuẩn hóa đã sinh.
- **Database:** Bảng `api_documentations`, `api_endpoints`.

#### Tiêu chí Chấp nhận (Acceptance Criteria):
1. **AC 1 (Định dạng và Dung lượng tệp):**
   - **Given:** Provider chọn file đặc tả để import.
   - **When:** File upload có kích thước $> 1\text{ MB}$ (1.048.576 bytes) hoặc không phải định dạng JSON/YAML hợp lệ.
   - **Then:** Hệ thống từ chối: trả về HTTP `413 Payload Too Large` nếu vượt dung lượng, hoặc HTTP `400 Bad Request` / `415 Unsupported Media Type` nếu sai cú pháp/định dạng.
2. **AC 2 (Tính nguyên tử - Atomic Import & Rollback):**
   - **Given:** Provider thực hiện import file OpenAPI cho một `versionId`.
   - **When:** File hợp lệ được xử lý trong một Database Transaction.
   - **Then:** Hệ thống xóa toàn bộ endpoints cũ của version này, tạo mới danh sách endpoints từ file OpenAPI và cập nhật bản ghi `api_documentations` tương ứng. Nếu có bất kỳ lỗi nào xảy ra trong quá trình parse hoặc ghi DB, toàn bộ transaction được Rollback sạch sẽ.
3. **AC 3 (Sinh tài liệu 7 khối chuẩn hóa):**
   - **Given:** Import OpenAPI thành công.
   - **When:** Provider gọi `GET /api/provider/apis/{id}/documentation`.
   - **Then:** Trả về cấu trúc JSON chứa đầy đủ 7 khối thông tin chuẩn hóa:
     1. *Overview:* Tiêu đề, mô tả, phiên bản, thông tin liên hệ.
     2. *Auth:* Cơ chế xác thực (API Key, Bearer JWT, OAuth2).
     3. *Endpoints:* Danh sách phương thức HTTP, đường dẫn, tóm tắt.
     4. *Parameters:* Danh sách tham số Path, Query, Header (kiểu dữ liệu, mô tả, required).
     5. *Request Body:* Schema cấu trúc dữ liệu gửi lên (Content-Type, JSON schema).
     6. *Responses:* Các mã phản hồi thành công và cấu trúc dữ liệu trả về mẫu.
     7. *Error Codes:* Bảng mã lỗi chuẩn (400, 401, 403, 404, 429, 500).
4. **AC 4 (Bảo mật - Chống ký tự NUL & Anti-XSS):**
   - **Given:** File OpenAPI chứa ký tự `\u0000` (NUL byte) hoặc các mã nhúng script `<script>alert(1)</script>`.
   - **When:** Hệ thống tiến hành parse và lưu trữ vào PostgreSQL (TEXT/JSONB).
   - **Then:** Hệ thống làm sạch ký tự NUL trước khi nạp DB (tránh lỗi crash driver PostgreSQL) và mã hóa an toàn các chuỗi HTML/JS khi hiển thị trên giao diện Documentation Viewer để ngăn chặn XSS.

---

### US-11 — Cấu hình Gói giá Dịch vụ (Pricing Plans Management)

- **Mục tiêu:** Cho phép Provider thiết lập các gói cước dịch vụ (Free, Basic, Pro) với các chính sách giá, hạn mức gọi (Quota) và giới hạn tốc độ (Rate Limit) trước khi xuất bản API.
- **Tác nhân:** `API_PROVIDER` (sở hữu API `Draft`).
- **Endpoint liên quan:**
  - `GET /api/provider/apis/{id}/plans` — Xem danh sách các gói cước.
  - `POST /api/provider/apis/{id}/plans` — Tạo gói cước mới (`name: 'Free' | 'Basic' | 'Pro'`).
  - `PUT /api/provider/apis/{id}/plans/{pid}` — Chỉnh sửa thông số gói cước.
  - `DELETE /api/provider/apis/{id}/plans/{pid}` — Xóa gói cước.
- **Database:** Bảng `api_plans`. Ràng buộc `uq_api_plans_api_name`, `chk_api_plans_name`, `chk_api_plans_price`, `chk_api_plans_quota`, `chk_api_plans_rate_limit`.

#### Tiêu chí Chấp nhận (Acceptance Criteria):
1. **AC 1 (Ràng buộc gói Free bắt buộc giá bằng 0):**
   - **Given:** Provider tạo hoặc cập nhật gói cước có `name: "Free"`.
   - **When:** Provider nhập `priceMonthly > 0`.
   - **Then:** Hệ thống từ chối với HTTP `400 Bad Request` (vi phạm ràng buộc DB `chk_api_plans_price`: `name <> 'Free' OR price_monthly = 0`). Gói Free bắt buộc `priceMonthly === 0`.
2. **AC 2 (Ràng buộc hạn mức Quota và Rate Limit):**
   - **Given:** Provider tạo gói cước (`Free`, `Basic`, hoặc `Pro`).
   - **When:** Nhập `quota <= 0` hoặc `rateLimit <= 0`.
   - **Then:** Hệ thống từ chối với HTTP `400 Bad Request` (vi phạm `chk_api_plans_quota` và `chk_api_plans_rate_limit`). Bắt buộc `quota >= 1` (calls/tháng) và `rateLimit >= 1` (requests/phút).
3. **AC 3 (Duy nhất 1 tên gói trong một API):**
   - **Given:** API đã có gói cước tên `"Basic"`.
   - **When:** Provider tạo thêm một gói khác cũng có tên `"Basic"`.
   - **Then:** Hệ thống từ chối với HTTP `409 Conflict` (vi phạm ràng buộc UNIQUE `uq_api_plans_api_name`).
4. **AC 4 (Đơn vị tiền tệ hợp lệ):**
   - **Given:** Provider cấu hình gói cước có phí (`Basic`, `Pro`).
   - **When:** Trường `currency` được thiết lập.
   - **Then:** Validate chuẩn ISO 4217 gồm đúng 3 chữ cái in hoa (ví dụ: `VND`, `USD`). Giá trị âm bị chặn (`priceMonthly >= 0`).

---

### US-12 — Quy trình Nộp duyệt API & Danh mục Sẵn sàng (Submission & Readiness Checklist)

- **Mục tiêu:** Đảm bảo API chỉ được nộp duyệt lên sàn khi đã thỏa mãn 100% các điều kiện tiên quyết về kỹ thuật, pháp lý và xác minh tên miền. Chuyển trạng thái từ `Draft` sang `Submitted`.
- **Tác nhân:** `API_PROVIDER` (đã `Verified`).
- **Endpoint liên quan:**
  - `GET /api/provider/apis/{id}/publish-status` — Kiểm tra tiến trình xuất bản & danh mục kiểm tra sẵn sàng.
  - `POST /api/provider/apis/{id}/submit-review` — Nộp hồ sơ API lên Admin xét duyệt.
- **Database:** Bảng `apis`, `audit_logs`. Trigger `trg_apis_enforce_status_transition`.

#### Tiêu chí Chấp nhận (Acceptance Criteria):
1. **AC 1 (Readiness Checklist - 5 điều kiện bắt buộc):**
   - **Given:** Provider chuẩn bị nộp duyệt API.
   - **When:** Gọi `GET /api/provider/apis/{id}/publish-status`.
   - **Then:** Hệ thống trả về trạng thái chi tiết của 5 điều kiện tiên quyết:
     1. Nhà cung cấp đã được Admin cấp trạng thái `Verified`.
     2. Đã xác thực quyền sở hữu tên miền qua DNS TXT (`domainVerified === true` và chưa hết hạn).
     3. Đã có ít nhất 1 phiên bản (Version) chứa $\ge 1$ Endpoint và có Documentation tương ứng.
     4. Đã cấu hình ít nhất 1 gói cước Pricing Plan hợp lệ.
     5. Đã hoàn tất khai báo pháp lý, chấp nhận phiên bản Agreement hiện hành và khai báo minh bạch dữ liệu cá nhân (`processesPersonalData` không được là `null`).
2. **AC 2 (Chặn nộp duyệt khi thiếu điều kiện):**
   - **Given:** API thiếu 1 trong 5 điều kiện tiên quyết nêu trên.
   - **When:** Provider gọi `POST /api/provider/apis/{id}/submit-review`.
   - **Then:** Hệ thống từ chối chuyển trạng thái, trả về HTTP `400 Bad Request`, mã lỗi `READINESS_CHECKLIST_INCOMPLETE`, kèm danh sách chi tiết các mục chưa đạt.
3. **AC 3 (Nộp duyệt thành công & Đóng băng bản ghi):**
   - **Given:** API thỏa mãn đủ 5 điều kiện tiên quyết.
   - **When:** Provider gọi `POST /api/provider/apis/{id}/submit-review`.
   - **Then:**
     - Trạng thái API chuyển từ `Draft` $\to$ `Submitted`.
     - Cập nhật trường `submitted_at = CURRENT_TIMESTAMP`.
     - Toàn bộ thông tin API, Versions, Endpoints, Plans, Legal bị đóng băng (không thể sửa/xóa).
     - Hệ thống ghi nhận 1 bản ghi vào `audit_logs` với `action: "api.submitted"`.
     - Trả về HTTP `200 OK`.
4. **AC 4 (Mở lại bản nháp sau khi bị Reject):**
   - **Given:** API đang ở trạng thái `Rejected` bởi Admin.
   - **When:** Provider gọi `POST /api/provider/apis/{id}/reopen`.
   - **Then:** Trạng thái chuyển từ `Rejected` $\to$ `Draft`, cho phép Provider chỉnh sửa lại dữ liệu để chuẩn bị cho đợt nộp duyệt tiếp theo.

---

### US-13 — Admin Duyệt, Từ chối & Xuất bản API (API Moderation & Publishing)

- **Mục tiêu:** Cung cấp quy trình kiểm duyệt toàn diện cho Quản trị viên để kiểm tra hồ sơ API (Dossier), phát hiện rủi ro bảo mật/dữ liệu cá nhân, phê duyệt (`Approve`), yêu cầu chỉnh sửa (`Reject`) hoặc đưa lên Marketplace (`Publish`).
- **Tác nhân:** `ADMIN` (Quản trị viên).
- **Endpoint liên quan:**
  - `GET /api/admin/apis` — Danh sách API lọc theo trạng thái (`status=Submitted|Under Review|Approved|Published|Rejected`, phân trang).
  - `GET /api/admin/apis/{id}/dossier` — Xem hồ sơ tổng hợp toàn diện của API.
  - `POST /api/admin/apis/{id}/review` — Thao tác duyệt: `{ "next": "Under Review" | "Approved" | "Rejected" | "Published", "reason": "..." }`.
- **Database:** Bảng `apis`, `api_reviews`, `audit_logs`. Trigger `trg_apis_enforce_status_transition`.

#### Tiêu chí Chấp nhận (Acceptance Criteria):
1. **AC 1 (Dossier đầy đủ & Cảnh báo Dữ liệu Cá nhân):**
   - **Given:** Admin xem xét API đang ở trạng thái `Submitted` hoặc `Under Review`.
   - **When:** Gọi `GET /api/admin/apis/{id}/dossier`.
   - **Then:** Trả về toàn bộ hồ sơ: thông tin API, thông tin Provider & trạng thái KYC, danh sách Versions, Endpoints, Pricing Plans, Khai báo pháp lý, Tài liệu API và Lịch sử duyệt trước đó. Nếu `processesPersonalData === true`, giao diện hiển thị cảnh báo nổi bật về loại dữ liệu và mục đích xử lý để Admin lưu ý trước khi duyệt.
2. **AC 2 (Luồng chuyển đổi trạng thái tuần tự):**
   - **Given:** API ở trạng thái xác định.
   - **When:** Admin gọi `POST /api/admin/apis/{id}/review` với trường `next`.
   - **Then:** Máy trạng thái tuân thủ nghiêm ngặt quy tắc DB trigger:
     - `Draft` $\to$ `Submitted` (chỉ Provider thực hiện).
     - `Submitted` $\to$ `Under Review` $\to$ `Approved` (Khi Admin chọn `Approved`, hệ thống tự động chuyển tiếp hợp lệ trong cùng 1 transaction).
     - `Under Review` $\to$ `Rejected` (Bắt buộc kèm `reason`).
     - `Approved` $\to$ `Published` (Đưa API lên sàn Marketplace công khai).
   - Nếu Admin cố tình nhảy cóc (VD: từ `Submitted` chuyển thẳng sang `Published`), hệ thống từ chối với HTTP `409 Conflict`, mã lỗi `INVALID_TRANSITION`.
3. **AC 3 (Từ chối bắt buộc có lý do):**
   - **Given:** API đang ở trạng thái xem xét.
   - **When:** Admin gửi `{ "next": "Rejected" }` nhưng không truyền `reason` hoặc chuỗi rỗng.
   - **Then:** Hệ thống từ chối với HTTP `400 Bad Request`, mã lỗi `REASON_REQUIRED`.
4. **AC 4 (Ghi nhận lịch sử duyệt và Audit Trail đồng thời):**
   - **Given:** Admin thực hiện thao tác duyệt (Approve, Reject, Publish).
   - **When:** Giao dịch hoàn tất thành công.
   - **Then:** Trong cùng transaction:
     - Ghi nhận lịch sử vào bảng `api_reviews` (gồm `reviewer_id`, `from_status`, `to_status`, `reason`, `created_at`).
     - Ghi nhận vào bảng `audit_logs` với `actor_role: "ADMIN"`, `action: "api.approved"` / `"api.rejected"` / `"api.published"`, lưu chi tiết JSON các bước chuyển đổi.
     - Cập nhật `approved_at` hoặc `published_at` tương ứng trên bảng `apis`.

---

### US-14 — Quản lý Nhật ký Kiểm toán Dùng chung (Audit Logging & Compliance Trail)

- **Mục tiêu:** Ghi nhận tự động, tập trung và bất biến mọi thao tác nhạy cảm, thay đổi trạng thái và hành vi quản trị trong toàn bộ hệ thống; cung cấp API truy vấn, tìm kiếm và lọc cho Admin.
- **Tác nhân:** Toàn hệ thống (ghi nhận tự động); `ADMIN` (xem và trích xuất nhật ký).
- **Endpoint liên quan:**
  - `GET /api/admin/audit-logs` — Truy vấn nhật ký (hỗ trợ lọc: `actorId`, `action`, `targetType`, `targetId`, `from`, `to`, phân trang `page`, `pageSize`).
  - `GET /api/admin/audit-logs/actions` — Lấy danh sách tên tất cả các hành động đã từng ghi nhận để dựng bộ lọc trên UI.
- **Database:** Bảng `audit_logs`, các chỉ mục tối ưu hóa `idx_audit_logs_actor_created_at`, `idx_audit_logs_target_created_at`, `idx_audit_logs_created_at`.

#### Tiêu chí Chấp nhận (Acceptance Criteria):
1. **AC 1 (Tính bất biến & Toàn vẹn dữ liệu):**
   - **Given:** Bản ghi nhật ký kiểm toán đã được ghi vào bảng `audit_logs`.
   - **When:** Bất kỳ tác nhân nào (kể cả Admin) cố gắng gửi lệnh sửa (`UPDATE`) hoặc xóa (`DELETE`) bản ghi audit log qua API.
   - **Then:** Hệ thống không cung cấp bất kỳ API nào cho phép sửa/xóa audit log. Dữ liệu chỉ được phép ghi nối tiếp (`INSERT`) và truy vấn (`SELECT`).
2. **AC 2 (Ghi nhận đầy đủ thông tin ngữ cảnh):**
   - **Given:** Một hành động nghiệp vụ nhạy cảm diễn ra (xác minh Provider, duyệt API, khóa tài khoản, nộp hồ sơ).
   - **Then:** Bản ghi `audit_logs` lưu trữ đầy đủ: `actor_id`, `actor_role`, `action` (chuỗi định danh dạng `<module>.<verb>`, VD: `api.submitted`, `provider.verified`), `target_type`, `target_id`, `detail` (dữ liệu JSONB mô tả ngữ cảnh), `ip` và `created_at`.
3. **AC 3 (Bảo vệ dữ liệu nhạy cảm - Redaction):**
   - **Given:** Thao tác nghiệp vụ có liên quan đến mật khẩu, access token, API key hoặc challenge token.
   - **Then:** Trường `detail` trong `audit_logs` tuyệt đối không được chứa các giá trị bí mật này. Mọi trường nhạy cảm phải được che mờ (`[REDACTED]`) hoặc loại bỏ hoàn toàn trước khi lưu.
4. **AC 4 (Lọc và Phân trang chuyên sâu):**
   - **Given:** Admin truy vấn nhật ký qua `GET /api/admin/audit-logs`.
   - **When:** Admin truyền các tham số lọc `actorId`, `action`, `targetType`, `from`, `to`, `page=1`, `pageSize=20`.
   - **Then:** Hệ thống trả về HTTP `200 OK` danh sách bản ghi thỏa mãn điều kiện lọc, sắp xếp giảm dần theo thời gian `created_at DESC`, kèm thông tin phân trang (`total`, `page`, `pageSize`).
5. **AC 5 (Validation khoảng thời gian):**
   - **Given:** Admin lọc nhật ký theo thời gian.
   - **When:** Truyền `from` có mốc thời gian sau `to` (thời điểm bắt đầu lớn hơn kết thúc).
   - **Then:** Hệ thống từ chối với HTTP `400 Bad Request`, mã lỗi `INVALID_DATE_RANGE`.

---

## PHẦN 2 — MA TRẬN PHÂN QUYỀN RBAC CHI TIẾT (ROLE MATRIX)

Ma trận kiểm soát truy cập cho **30 thao tác Provider** và **8 thao tác Admin** trong Sprint 2.
*Ký hiệu:*
- ✅ **200/201/204:** Được phép truy cập và thực thi thành công.
- 🟡 **403/409:** Được phép truy cập vào router nhưng bị chặn bởi trạng thái nghiệp vụ (VD: chưa Verified, không phải chủ sở hữu).
- ❌ **403:** Bị từ chối truy cập vì sai vai trò người dùng (Forbidden).
- 🔒 **401:** Bị từ chối vì chưa đăng nhập / thiếu token hợp lệ (Unauthorized).

### 1. Bảng Phân quyền 30 Endpoint Provider (`/api/provider/*`)

| # | Phương thức & Đường dẫn | Chức năng nghiệp vụ | Guest | Consumer (`USER`) | Unverified Provider | Verified Provider | Admin (`ADMIN`) |
|---|---|---|:---:|:---:|:---:|:---:|:---:|
| 1 | `GET /api/provider/verification` | Xem hồ sơ KYC cá nhân | 🔒 401 | ❌ 403 | ✅ 200 | ✅ 200 | ❌ 403 |
| 2 | `POST /api/provider/verification` | Nộp hồ sơ KYC | 🔒 401 | ❌ 403 | ✅ 201 | 🟡 409 | ❌ 403 |
| 3 | `GET /api/provider/agreement` | Lấy mẫu thỏa thuận đang hiệu lực | 🔒 401 | ❌ 403 | ✅ 200 | ✅ 200 | ❌ 403 |
| 4 | `GET /api/provider/apis` | Danh sách API của tôi | 🔒 401 | ❌ 403 | ✅ 200 | ✅ 200 | ❌ 403 |
| 5 | `POST /api/provider/apis` | Tạo API mới (bản nháp) | 🔒 401 | ❌ 403 | 🟡 403 | ✅ 201 | ❌ 403 |
| 6 | `GET /api/provider/apis/{id}` | Xem chi tiết API của tôi | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 200 | ❌ 403 |
| 7 | `PUT /api/provider/apis/{id}` | Sửa thông tin API nháp | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 200 | ❌ 403 |
| 8 | `DELETE /api/provider/apis/{id}` | Xóa API nháp | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 204 | ❌ 403 |
| 9 | `GET /api/provider/apis/{id}/domain-verification` | Xem trạng thái xác minh tên miền | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 200 | ❌ 403 |
| 10 | `POST /api/provider/apis/{id}/domain-verification/challenge` | Tạo DNS TXT challenge token | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 201 | ❌ 403 |
| 11 | `POST /api/provider/apis/{id}/domain-verification/verify` | Xác thực bản ghi DNS TXT | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 200 | ❌ 403 |
| 12 | `GET /api/provider/apis/{id}/versions` | Danh sách các phiên bản API | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 200 | ❌ 403 |
| 13 | `POST /api/provider/apis/{id}/versions` | Tạo phiên bản API mới | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 201 | ❌ 403 |
| 14 | `PUT /api/provider/apis/{id}/versions/{vid}` | Sửa phiên bản API nháp | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 200 | ❌ 403 |
| 15 | `DELETE /api/provider/apis/{id}/versions/{vid}` | Xóa phiên bản API nháp | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 204 | ❌ 403 |
| 16 | `GET /api/provider/apis/{id}/endpoints` | Danh sách Endpoints | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 200 | ❌ 403 |
| 17 | `POST /api/provider/apis/{id}/endpoints` | Tạo Endpoint thủ công | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 201 | ❌ 403 |
| 18 | `PUT /api/provider/apis/{id}/endpoints/{eid}` | Sửa Endpoint nháp | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 200 | ❌ 403 |
| 19 | `DELETE /api/provider/apis/{id}/endpoints/{eid}` | Xóa Endpoint nháp | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 204 | ❌ 403 |
| 20 | `POST /api/provider/apis/{id}/import-openapi` | Upload file OpenAPI 3.0/Swagger | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 200 | ❌ 403 |
| 21 | `GET /api/provider/apis/{id}/documentation` | Xem tài liệu 7 khối chuẩn hóa | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 200 | ❌ 403 |
| 22 | `GET /api/provider/apis/{id}/plans` | Danh sách gói giá (Plans) | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 200 | ❌ 403 |
| 23 | `POST /api/provider/apis/{id}/plans` | Thêm gói giá (Free/Basic/Pro) | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 201 | ❌ 403 |
| 24 | `PUT /api/provider/apis/{id}/plans/{pid}` | Sửa gói giá nháp | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 200 | ❌ 403 |
| 25 | `DELETE /api/provider/apis/{id}/plans/{pid}` | Xóa gói giá nháp | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 204 | ❌ 403 |
| 26 | `GET /api/provider/apis/{id}/legal` | Xem thông tin pháp lý đã khai | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 200 | ❌ 403 |
| 27 | `PUT /api/provider/apis/{id}/legal` | Khai báo pháp lý & bản quyền | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 200 | ❌ 403 |
| 28 | `GET /api/provider/apis/{id}/publish-status` | Kiểm tra tiến trình & checklist | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 200 | ❌ 403 |
| 29 | `POST /api/provider/apis/{id}/submit-review` | Nộp hồ sơ API lên Admin xét duyệt | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 200 | ❌ 403 |
| 30 | `POST /api/provider/apis/{id}/reopen` | Mở lại bản nháp sau khi bị Reject | 🔒 401 | ❌ 403 | 🟡 403/404 | ✅ 200 | ❌ 403 |

---

### 2. Bảng Phân quyền 8 Endpoint Admin (`/api/admin/*`)

| # | Phương thức & Đường dẫn | Chức năng nghiệp vụ | Guest | Consumer (`USER`) | Unverified Provider | Verified Provider | Admin (`ADMIN`) |
|---|---|---|:---:|:---:|:---:|:---:|:---:|
| 1 | `GET /api/admin/provider-verifications` | Danh sách hồ sơ KYC Provider | 🔒 401 | ❌ 403 | ❌ 403 | ❌ 403 | ✅ 200 |
| 2 | `GET /api/admin/provider-verifications/{providerId}` | Xem chi tiết hồ sơ KYC Provider | 🔒 401 | ❌ 403 | ❌ 403 | ❌ 403 | ✅ 200 |
| 3 | `POST /api/admin/provider-verifications/{providerId}/review` | Duyệt / Từ chối hồ sơ KYC | 🔒 401 | ❌ 403 | ❌ 403 | ❌ 403 | ✅ 200 |
| 4 | `GET /api/admin/apis` | Danh sách API theo trạng thái duyệt | 🔒 401 | ❌ 403 | ❌ 403 | ❌ 403 | ✅ 200 |
| 5 | `GET /api/admin/apis/{id}/dossier` | Xem Dossier đầy đủ của API | 🔒 401 | ❌ 403 | ❌ 403 | ❌ 403 | ✅ 200 |
| 6 | `POST /api/admin/apis/{id}/review` | Phê duyệt, Từ chối, Xuất bản API | 🔒 401 | ❌ 403 | ❌ 403 | ❌ 403 | ✅ 200 |
| 7 | `GET /api/admin/audit-logs` | Truy vấn và lọc nhật ký kiểm toán | 🔒 401 | ❌ 403 | ❌ 403 | ❌ 403 | ✅ 200 |
| 8 | `GET /api/admin/audit-logs/actions` | Danh sách tên các hành động audit | 🔒 401 | ❌ 403 | ❌ 403 | ❌ 403 | ✅ 200 |

---

## PHẦN 3 — ĐỊNH NGHĨA HOÀN THÀNH (DEFINITION OF DONE - DOD) SPRINT 2

Một User Story trong Sprint 2 được coi là **DONE** khi đáp ứng đủ 6 tiêu chí:
1. **Kiến trúc & Tiêu chí chấp nhận:** Toàn bộ tiêu chí AC (Given/When/Then) được cài đặt đầy đủ ở cả Backend API và Frontend UI.
2. **Kiểm soát Truy cập & Bảo mật:** Đạt 100% các ca kiểm thử theo Ma trận phân quyền RBAC (401/403); không vi phạm lỗi SSRF/XSS.
3. **Database & Trigger Integrity:** Tất cả các thao tác thay đổi trạng thái tuân thủ nghiêm ngặt Trigger Database, không phát sinh lỗi phá vỡ ràng buộc khóa ngoại hoặc tính toàn vẹn.
4. **Audit Trail:** Mọi hành vi quản trị của Admin và Provider đều được tự động ghi nhận vào `audit_logs` trong cùng transaction với dữ liệu đã che mờ thông tin nhạy cảm.
5. **Độ phủ Kiểm thử:** Bộ test case tự động đạt 100% Pass; CI GitHub Actions xanh mướt.
6. **Không còn Bug Nghiêm trọng:** Không còn bất kỳ bug nào ở mức độ `Critical` hoặc `High` đang mở.
