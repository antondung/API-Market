# Sprint 5 — Tiêu chí Chấp nhận (Acceptance Criteria) & Ma trận RBAC

> **Dự án:** API Marketplace & Management Platform
> **Tài liệu QA Lead:** Trần Hà Thảo Vân (`@vuonghathaovan-gif` — Issue #25)
> **Căn cứ kỹ thuật:** `docs/07-sprint5-demo-and-rc-checklist.md`, `docs/06-production-rollback-runbook.md`, `backend/SPRINT-5-HANDOFF.md`, `backend/SPRINT-5-DATABASE-HANDOFF.md`, `docs/test/TESTING_RULES.md`, `docs/01-kien-truc-he-thong.md`, `docs/02-role-va-phan-quyen.md`.
> **Chính sách:** **Feature Freeze toàn hệ thống (từ 09/11/2026)** — Không nhận tính năng mới, chỉ hoàn thiện các mục Should (`US-31`, `US-32`), củng cố bảo mật (`EN-11`), đo tải & tối ưu (`EN-12`), đóng gói triển khai & rollback (`EN-13`), hoàn thiện UX/Responsive (`EN-14`), kiểm thử hồi quy & nghiệm thu (`EN-15`), và kịch bản demo (`EN-16`).
> **Quy chuẩn chất lượng:** Tuân thủ quy tắc **Z1–Z5** (không pass ảo, không sleep cứng, không bypass access control), **H1–H4** (clean state, human selector, pressSequentially, viewports 1280x720 và 768x1024), **A1–A3** (0 lỗi console đỏ, phần tử trong viewport, người dùng thao tác lại được).

---

## 1. BẢNG TỔNG QUAN PHẠM VI SPRINT 5 (SCOPE OVERVIEW)

| Phân hệ / Epic | Mã User Story | Nội dung cốt lõi | Phụ trách chính | Số lượng AC | Mức ưu tiên | Phụ thuộc kỹ thuật |
|---|---|---|---|:---:|:---:|---|
| **Provider Analytics** | `US-31` | Phân tích lưu lượng API & Endpoint, tỷ lệ lỗi 4xx/5xx, P50/P95/P99 latency & overhead, doanh thu VND/USD | Danh (DB), Tùng Dương (BE), Hải Dương (FE) | 4 AC | **Should-Have** | Chờ FE #23; BE PR #106; DB PR #104 |
| **Cost Guard** | `US-32` | Ngân sách tháng, cảnh báo 50%/80%/100%, ngắt cứng `hardCutoff` 429, miễn trừ Free & Sandbox | Tùng Dương (BE), Hải Dương (FE), Danh (DB) | 5 AC | **Should-Have** | Chờ FE #23; BE PR #106; DB PR #104 |
| **Bảo mật & Kiểm soát truy cập** | `EN-11` | Chống SSRF Upstream, DNS rebinding, chống lách rate limit xoay key, mã hóa API Key, khử dữ liệu nhạy cảm | Tùng Dương (BE), Thảo Vân (QA) | 5 AC | **Must-Have** | Sẵn sàng trên `develop` / Chờ BE PR #106 |
| **Tải Gateway & SLA** | `EN-12` | Đo tải c=1, 10, 25; SLA P95 Overhead < 30ms; Atomic Quota (Lua script) | Tấn Dũng (TL), Tùng Dương (BE), Danh (DB) | 2 AC | **Must-Have** | Sẵn sàng (`develop` / PR #103); Rủi ro SLA BE PR #106 |
| **Triển khai, Sao lưu & Rollback** | `EN-13` | Production Preflight, tự động hóa sao lưu & phục hồi database, quy trình rollback < 60s | Tấn Dũng (TL), Danh (DB) | 3 AC | **Must-Have** | Sẵn sàng (`develop` / PR #103); Chờ DB PR #104 |
| **UX, Responsive & A11y** | `EN-14` | Giao diện chuẩn 1280x720 & 768x1024, Zero Console Error, Empty/Error/Loading states | Hải Dương (FE), Thảo Vân (QA) | 4 AC | **Must-Have** | Chờ FE Issue #23 (@leduwn) |
| **Hồi quy & Nghiệm thu** | `EN-15` | Full regression 180+ tests BE, 550+ tests FE, UAT 3 vai trò, Ký duyệt Release Candidate | Thảo Vân (QA), Tấn Dũng (TL) | 3 AC | **Must-Have** | Chờ tích hợp toàn diện develop & Staging đóng băng |
| **Kịch bản Demo 4 Phân cảnh** | `EN-16` | Demo trọn vẹn 12-15 phút 4 phân cảnh xuyên suốt 3 vai trò không sửa tay | Cả nhóm (Điều phối: Tấn Dũng, Thảo Vân) | 4 AC | **Must-Have** | Phân cảnh 1-2: Sẵn sàng; Phân cảnh 3: PR #105; Phân cảnh 4: FE #23 |

---

## 2. TIÊU CHÍ CHẤP NHẬN CHI TIẾT (ACCEPTANCE CRITERIA)

---

### PHÂN HỆ 1: US-31 — PROVIDER ANALYTICS DASHBOARD (PHÂN TÍCH NHÀ CUNG CẤP)
- **Tác nhân:** `API_PROVIDER` (xem dashboard của chính mình), `ADMIN` (giám sát tổng thể).
- **Hợp đồng API & Schema:**
  - `GET /api/provider/analytics/overview?apiId={id}&endpointId={id}&from={date}&to={date}`
  - Giao diện Frontend: Route `/provider/analytics` (tại `frontend/src/App.tsx:164` trỏ tới `AnalyticsHealthPage.tsx`, commit `e9b5a45`; hiện tại UI đã có sẵn nhưng dùng dữ liệu cục bộ/mock qua `AppContext`, đang chờ FE Issue #23 nối API thực tế).
  - Bảng cơ sở dữ liệu: `provider_daily_aggregates`, `provider_revenue_daily_aggregates`, `usage_logs`.

#### `AC-US31-01`: Tổng hợp lưu lượng và tỷ lệ lỗi phân tách theo API và Endpoint
- **Phát biểu kiểm chứng:**
  1. Khi Provider gửi yêu cầu `GET /api/provider/analytics/overview` với tham số `apiId` hợp lệ thuộc quyền sở hữu của mình và khoảng thời gian `from` $\to$ `to` (chuẩn UTC `YYYY-MM-DD`, tính cả ngày cuối):
     - Hệ thống trả về HTTP `200 OK`.
     - Phản hồi chứa các trường: `requests` (hoặc `requestCount`), `errorCount` (tổng lỗi 4xx và 5xx), `errorRatePercent` (tỷ lệ phần trăm lỗi tính bằng $\frac{\text{errorCount}}{\text{requests}} \times 100$, kiểu float8).
  2. Khi lọc bổ sung `endpointId`:
     - Lưu lượng và chỉ số độ trễ chỉ tính cho riêng endpoint đó.
     - Số liệu doanh thu sandbox và số thuê bao hoạt động (`activeSubscribers`) giữ nguyên phạm vi toàn API.
  3. Khi không có request nào trong khoảng thời gian đã chọn:
     - `requestCount = "0"`, `errorCount = "0"`, `errorRatePercent = 0`, không gây lỗi chia cho 0 (`division by zero`).
- **Nguồn yêu cầu:** Issue #22 (nhiệm vụ US-31), `backend/SPRINT-5-HANDOFF.md` mục "Provider Analytics · US-31".
- **Nguồn triển khai:** `backend/src/usage-analytics.ts` dòng 77-118 (`origin/codex/sprint5-backend`, PR #106).
- **Vai trò liên quan:** `API_PROVIDER`.
- **Trạng thái phụ thuộc:** Đã có trong Backend PR #106, Database PR #104 (`migrations/015_sprint5_analytics_performance.sql`); Chờ Frontend Issue #23.

#### `AC-US31-02`: Thống kê phân vị độ trễ và Gateway Overhead (P50, P95, P99)
- **Phát biểu kiểm chứng:**
  1. Phản hồi Analytics phải chứa đầy đủ độ trễ ứng dụng (`latency`) và độ trễ do Gateway cộng thêm (`overhead`) tại 3 phân vị: P50 (trung vị), P95 và P99 (đơn vị: mili-giây, `ms`):
     - Các trường cụ thể: `p50LatencyMs`, `p50OverheadMs`, `p95LatencyMs`, `p95OverheadMs`, `p99LatencyMs`, `p99OverheadMs`.
  2. Trường hợp thiếu mẫu đo (số lượng request trong kỳ $< 1$): Các trường phân vị P50/P95/P99 trả về giá trị `null` một cách an toàn, giao diện hiển thị trạng thái "Chưa đủ dữ liệu đo lường".
  3. Giá trị phân vị overhead phải thỏa mãn tính đơn điệu toán học: $\text{P50} \le \text{P95} \le \text{P99}$.
- **Nguồn yêu cầu:** Issue #22 (body và comment), `backend/SPRINT-5-HANDOFF.md` mục US-31.
- **Nguồn triển khai:** `backend/src/usage-analytics.ts` dòng 34 (`percentile_disc` trong PR #106).
- **Vai trò liên quan:** `API_PROVIDER`.
- **Trạng thái phụ thuộc:** Chờ tích hợp BE PR #106 và FE Issue #23.

#### `AC-US31-03`: Bảng xếp hạng Top 10 Endpoint theo khối lượng truy cập
- **Phát biểu kiểm chứng:**
  1. Danh sách `topEndpoints` trong phản hồi trả về tối đa 10 bản ghi, sắp xếp theo thứ tự giảm dần của số lượt gọi (`requestCount`).
  2. Mỗi mục trong danh sách chứa: `method`, `pathPattern`, `requestCount`, `errorRatePercent`, `p95LatencyMs`.
  3. Nếu API có ít hơn 10 endpoint, danh sách trả về đúng số endpoint thực tế, không sinh dữ liệu rác.
- **Nguồn yêu cầu:** Issue #22 (comment), `backend/SPRINT-5-HANDOFF.md` mục US-31.
- **Nguồn triển khai:** `backend/src/usage-analytics.ts` dòng 123 (`LIMIT 10` trong PR #106).
- **Vai trò liên quan:** `API_PROVIDER`.
- **Trạng thái phụ thuộc:** Chờ tích hợp BE PR #106 và FE Issue #23.

#### `AC-US31-04`: Bảo mật cách ly dữ liệu và phân tách doanh thu đa tệ
- **Phát biểu kiểm chứng:**
  1. **Bảo mật cách ly dữ liệu (Data Isolation):**
     - Hệ thống tuyệt đối không trả bất kỳ dữ liệu lưu lượng hay doanh thu nào của provider khác khi Provider A truy vấn `apiId` thuộc sở hữu của Provider B.
     - **Mã phản hồi HTTP:** **HTTP 404 NOT_FOUND** (`{ error: { code: 'NOT_FOUND', message: 'API not found' } }`). Quyết định chính thức từ Tech Lead (@antondung trong PR #112 / commit `e786a52`), triển khai tại `backend/src/usage-router.ts:47-49` và ghi nhận tại `docs/known-limitations.md`. Lý do: Trả 404 để không xác nhận sự tồn tại của API đó, tránh rò rỉ không gian ID (ID space leak).
  2. **Doanh thu phân tách độc lập:** Doanh thu trả về tách biệt theo loại tiền tệ (VND và USD). Tuyệt đối không cộng gộp lẫn số tiền khác loại tiền tệ.
- **Nguồn yêu cầu:** Issue #22, `backend/SPRINT-5-HANDOFF.md` mục US-31 & EN-11, `backend/SPRINT-5-DATABASE-HANDOFF.md`, `docs/known-limitations.md`.
- **Nguồn triển khai:** `backend/src/usage-analytics.ts:77`, `backend/src/usage-router.ts:47-49` (PR #112), `migrations/015_sprint5_analytics_performance.sql:20` (PR #104).
- **Vai trò liên quan:** `API_PROVIDER`.
- **Trạng thái phụ thuộc:** Đã tích hợp trên `develop` (PR #104, #106, #110, #112).

---

### PHÂN HỆ 2: US-32 — COST GUARD (BẢO VỆ CHI PHÍ NGƯỜI DÙNG)
- **Tác nhân:** `CONSUMER` (hoặc Buyer Provider mua API).
- **Hợp đồng API & Schema:**
  - `GET /api/consumer/cost-guard`
  - `PUT /api/consumer/cost-guard`
  - Body PUT: `{"currency":"USD", "monthlyBudget":"30.00", "hardCutoff":true}` hoặc `{"monthlyBudgetUsd":"30.00", "hardCutoff":true}`.
  - Giao diện Frontend: Route `/dashboard/cost-guard` (tại `frontend/src/App.tsx:138` trỏ tới `CostGuardPage.tsx`, commit `27307ca`; hiện tại UI đã có sẵn nhưng đang dùng dữ liệu mock/cục bộ `spentUsd = 0`, chờ FE Issue #23 nối API thực tế).
  - Bảng cơ sở dữ liệu: `cost_guard_budgets` (`consumer_id`, `currency`, `monthly_budget`, `hard_cutoff`).

#### `AC-US32-01`: Cấu hình ngân sách tháng và chế độ ngắt cứng (`hardCutoff`)
- **Phát biểu kiểm chứng:**
  1. Consumer gửi yêu cầu `PUT /api/consumer/cost-guard` với `currency`, `monthlyBudget` $> 0$ và cờ boolean `hardCutoff`:
     - Hệ thống lưu cấu hình vào bảng `cost_guard_budgets` theo cặp khóa chính `(consumer_id, currency)`.
     - Trả về HTTP `200 OK` kèm cấu hình vừa cập nhật.
  2. Nếu `monthlyBudget` $\le 0$ hoặc không đúng định dạng số: Hệ thống từ chối với HTTP `400 Bad Request` (`INVALID_BUDGET_AMOUNT`).
  3. Nếu không có token xác thực hoặc sai token: Từ chối với HTTP `401 Unauthorized`.
- **Nguồn yêu cầu:** Issue #22 (body và comment), `backend/SPRINT-5-HANDOFF.md` mục US-32.
- **Nguồn triển khai:** `backend/src/cost-guard.ts` dòng 7-9 (`origin/codex/sprint5-backend`, PR #106), `migrations/017_sprint5_cost_guard.sql:3`.
- **Vai trò liên quan:** `CONSUMER`.
- **Trạng thái phụ thuộc:** Chờ tích hợp Backend PR #106 và Frontend Issue #23.

#### `AC-US32-02`: Tính toán chi phí tích lũy theo snapshot giá từng request
- **Phát biểu kiểm chứng:**
  1. Khi Gateway tiếp nhận một request trả phí, chi phí ước tính được tính toán theo snapshot: $\text{estimatedCost} = \frac{\text{priceMonthly}}{\text{quota}}$, lưu vào cột `estimated_cost` và `cost_currency` trong `usage_outbox` và `usage_logs`.
  2. Tổng chi phí trong kỳ được tổng hợp trên cùng một snapshot PostgreSQL từ cả 2 nguồn: bản ghi đã flush (`usage_logs`) và bản ghi đang chờ chuyển (`usage_outbox`), không để lọt giao dịch đang xử lý dở.
  3. Các khoản phí Sandbox (`settledSandboxCharges`) hiển thị riêng, tuyệt đối không cộng đúp 2 lần cùng một khoản.
- **Nguồn yêu cầu:** Issue #22 (comment), `backend/SPRINT-5-HANDOFF.md` mục US-32.
- **Nguồn triển khai:** `migrations/017_sprint5_cost_guard.sql:13-16`, `backend/src/cost-guard.ts:50-70` (PR #106).
- **Vai trò liên quan:** `CONSUMER`.
- **Trạng thái phụ thuộc:** Chờ tích hợp Backend PR #106 và Database PR #104.

#### `AC-US32-03`: Ngưỡng cảnh báo chi tiêu tự động (50%, 80%, 100%)
- **Phát biểu kiểm chứng:**
  1. `GET /api/consumer/cost-guard` trả về mảng `reachedThresholds` chứa các ngưỡng chi tiêu đã chạm hoặc vượt qua trong tập cố định `[50, 80, 100]`.
  2. Khi chi phí $< 50\%$ ngân sách: `reachedThresholds = []`, giao diện hiển thị trạng thái an toàn.
  3. Khi chi phí $\ge 50\%$ và $< 80\%$: `reachedThresholds = [50]`, giao diện hiển thị huy hiệu vàng cảnh báo mức 1.
  4. Khi chi phí $\ge 80\%$ và $< 100\%$: `reachedThresholds = [50, 80]`, giao diện hiển thị huy hiệu cam cảnh báo mức 2.
  5. Khi chi phí $\ge 100\%$ và `hardCutoff = false`: `reachedThresholds = [50, 80, 100]`, Gateway vẫn cho phép request đi qua bình thường nhưng giao diện cảnh báo đỏ ngân sách đã cạn.
- **Nguồn yêu cầu:** Issue #22 (body và comment), Issue #25 (comment), `backend/SPRINT-5-HANDOFF.md` mục US-32.
- **Nguồn triển khai:** `backend/src/cost-guard.ts` dòng 83 (PR #106).
- **Vai trò liên quan:** `CONSUMER`.
- **Trạng thái phụ thuộc:** Chờ tích hợp Backend PR #106 và Frontend Issue #23.

#### `AC-US32-04`: Ngắt cứng dịch vụ Gateway khi chạm trần ngân sách (`hardCutoff = true`)
- **Phát biểu kiểm chứng:**
  1. Khi Consumer bật `hardCutoff = true` và tổng chi phí đã chạm hoặc dự kiến vượt 100% ngân sách tháng:
     - Mọi request trả phí tiếp theo qua Gateway gửi kèm API Key của Consumer bị từ chối ngay lập tức với HTTP `429 Too Many Requests`.
     - Mã lỗi JSON: `error.code: "BUDGET_EXHAUSTED"`.
     - *(Lưu ý: Chuỗi message `'Monthly spending budget reached'` là chi tiết triển khai tại `backend/src/cost-guard.ts:41`, chưa có yêu cầu gốc xác nhận — kiểm thử chỉ assert mã lỗi `BUDGET_EXHAUSTED`).*
     - Upstream service tuyệt đối không bị gọi (bảo vệ nguồn tiền của người dùng).
  2. Miễn trừ Cost Guard:
     - Các gói cước miễn phí (Free Plan, 0 USD) vẫn hoạt động bình thường theo quota và rate limit riêng, không bị ảnh hưởng bởi cờ ngắt cứng.
     - Lượt dùng thử Sandbox (hạn mức 5 lượt) không bị chặn bởi Cost Guard.
- **Nguồn yêu cầu:** Issue #22 (comment), `backend/SPRINT-5-HANDOFF.md` mục US-32.
- **Nguồn triển khai:** `backend/src/cost-guard.ts` dòng 41 (PR #106).
- **Vai trò liên quan:** `CONSUMER`.
- **Trạng thái phụ thuộc:** Chờ tích hợp Backend PR #106.

#### `AC-US32-05`: Xử lý dữ liệu lịch sử thiếu giá (`unpricedRequests`)
- **Phát biểu kiểm chứng:**
  1. Các bản ghi `usage_logs` cũ được tạo trước Sprint 5 có `estimated_cost IS NULL` được đếm riêng trong trường `unpricedRequests`.
  2. Hệ thống không tự ý gán giá trị mặc định cho dữ liệu cũ, không làm sai lệch tính toán chi phí hiện tại.
- **Nguồn yêu cầu:** `backend/SPRINT-5-HANDOFF.md` mục US-32 dòng 48.
- **Nguồn triển khai:** `backend/src/cost-guard.ts` dòng 104 (PR #106).
- **Vai trò liên quan:** `CONSUMER`.
- **Trạng thái phụ thuộc:** Chờ tích hợp Backend PR #106.

---

### PHÂN HỆ 3: EN-11 — BẢO MẬT & KIỂM SOÁT TRUY CẬP (SECURITY & ACCESS CONTROL)

#### `AC-EN11-01`: Chống tấn công SSRF & DNS Rebinding trên Upstream Gateway
- **Phát biểu kiểm chứng:**
  1. Khi Provider cấu hình Upstream Base URL trỏ tới địa chỉ nội bộ cấm (RFC 1918, `localhost`, `127.0.0.1`, loopback `::1`, link-local `169.254.169.254` hoặc dải multicast/broadcast):
     - Hệ thống từ chối ngay từ bước validation với mã lỗi `SSRF_DETECTED` hoặc `DOMAIN_NOT_SUPPORTED`.
  2. Khi gửi request qua SafeProxy:
     - Proxy thực hiện DNS pinning và từ chối nếu IP phân giải thuộc dải IP nội bộ private (`DOMAIN_RESOLVES_TO_PRIVATE_IP` hoặc `SSRF_DETECTED`).
     - SafeProxy từ chối chuyển hướng (redirect) sang host nội bộ, giới hạn kích thước phản hồi tối đa 2MB và áp dụng timeout nghiêm ngặt.
- **Nguồn yêu cầu:** `docs/test/TESTING_RULES.md` mục 9; Issue #22, #25; `backend/SPRINT-5-HANDOFF.md` mục EN-11.
- **Nguồn triển khai:** `backend/src/safe-proxy.ts:23`, `backend/src/provider-dns.ts:34` (đã có trên `origin/develop`, commit `dbb4763`).
- **Trạng thái phụ thuộc:** Sẵn sàng trên `develop`.

#### `AC-EN11-02`: Chống lách Rate Limit & Quota bằng kỹ thuật xoay khóa API Key
- **Phát biểu kiểm chứng:**
  1. Bộ đếm Rate Limit và Quota trên Redis được gắn theo định danh người mua (`consumerId` và `apiId`), thông qua biến `rateScope`.
  2. Khi Consumer đã dùng hết hạn ngạch của API Key 1, việc tạo thêm API Key 2 và gửi request tiếp tục bị chặn chính xác với HTTP `429 RATE_LIMITED` hoặc `QUOTA_EXHAUSTED`.
- **Nguồn yêu cầu:** Issue #22 (comment), `backend/SPRINT-5-HANDOFF.md` mục EN-11 ("Xoay API key: Vá cách lách rate limit bằng khóa mới").
- **Nguồn triển khai:** `backend/src/redis-meter.ts:62` (`rateScope = i.consumerId ? 'c:' + i.consumerId + ':' + i.apiId : i.apiKeyId` trong PR #106, commit `4ce5394`).
- **Trạng thái phụ thuộc:** Chờ Backend PR #106 (@Tungdota53).

#### `AC-EN11-03`: Bảo vệ và che mờ khóa API Key
- **Phát biểu kiểm chứng:**
  1. Khi tạo khóa mới: API Key dạng rõ chỉ hiển thị đầy đủ đúng 1 lần duy nhất trong modal tạo khóa.
  2. Sau khi đóng modal hoặc tải lại trang: Giao diện chỉ hiển thị tiền tố che mờ `ak_live_XXXX...`.
  3. Cơ sở dữ liệu tuyệt đối không lưu API Key dạng rõ; chỉ lưu `key_hash` (SHA256 một chiều) và `key_prefix`.
- **Nguồn yêu cầu:** `docs/test/TESTING_RULES.md` mục 9; Issue #22, #23.
- **Nguồn triển khai:** `backend/src/consumer-service.ts:77, 113` (đã có trên `origin/develop`).
- **Trạng thái phụ thuộc:** Sẵn sàng trên `develop`.

#### `AC-EN11-04`: Khử dữ liệu nhạy cảm trong hệ thống Log và Gateway Headers
- **Phát biểu kiểm chứng:**
  1. **Gateway Header Whitelist:** Gateway chỉ chuyển tiếp các header nằm trong danh sách an toàn (`ALLOWED_REQUEST_HEADERS = ['accept', 'accept-language', 'content-type']`). Mọi header khác (Authorization, Cookie, X-Internal-Actor) đều bị loại bỏ trước khi chuyển sang Upstream.
  2. **Express Request Logger:** Middleware chỉ log metadata tối thiểu (`requestId`, `method`, `route`, `status`, `durationMs`); tuyệt đối không log headers, bodies hoặc query params nhạy cảm.
  3. **Khử dữ liệu nhạy cảm:** Bất kỳ credential, token hoặc secret nào nếu xuất hiện trong log container đều phải được khử thành chuỗi `[REDACTED]`.
- **Nguồn yêu cầu:** `docs/test/TESTING_RULES.md` mục 9; Issue #20, #22; `backend/SPRINT-5-HANDOFF.md` mục EN-11.
- **Nguồn triển khai:** `backend/src/gateway-service.ts:31-33`, `backend/src/app.ts:85-88` (đã có trên `develop`); kiểm tra khử log nhạy cảm [REDACTED] nằm trong bộ test PR #106.
- **Trạng thái phụ thuộc:** Chờ Backend PR #106 (@Tungdota53).

#### `AC-EN11-05`: Ma trận phân quyền 3 vai trò (RBAC) & Thu hồi phiên làm việc
- **Phát biểu kiểm chứng:**
  1. Hệ thống thực thi phân quyền nghiêm ngặt 3 vai trò: `CONSUMER`, `API_PROVIDER`, `ADMIN`. Mọi hành vi truy cập chéo quyền đều bị từ chối với HTTP `403 Forbidden` (`FORBIDDEN`).
  2. Khi người dùng đổi mật khẩu hoặc đăng xuất: Toàn bộ Refresh Token cũ bị thu hồi ngay lập tức, vô hiệu hóa phiên đăng nhập cũ trên các thiết bị khác.
- **Nguồn yêu cầu:** `docs/02-role-va-phan-quyen.md`; Issue #21, #25.
- **Nguồn triển khai:** `backend/src/auth.ts:160-170` (đã có trên `origin/develop`).
- **Trạng thái phụ thuộc:** Sẵn sàng trên `develop`.

---

### PHÂN HỆ 4: EN-12 — TẢI GATEWAY & CAM KẾT SLA (LOAD TESTING & PERFORMANCE)

#### `AC-EN12-01`: Benchmark tải đa luồng và kiểm chứng SLA P95 Overhead < 30ms
- **Phát biểu kiểm chứng:**
  1. Chạy lệnh kiểm thử tải Gateway tự động: `npm run loadtest:gateway`.
  2. Thực hiện đo qua 3 mức đồng thời: `c = 1`, `c = 10`, `c = 25` (20 warm-up, 200 samples/tier, tổng cộng 620 requests).
  3. SLA Kỳ vọng: P95 Gateway Overhead $< 30\text{ ms}$ ở cả 3 mức tải. Tỷ lệ lỗi cho phép: 0/620 (0%). Đối soát ghi đủ 620/620 bản ghi `usage_logs`. *(Ghi chú: Tech Lead đã chuẩn hóa ngưỡng phân tầng (c=1: < 30 ms; c>1: < 60 ms) tại docs/known-limitations.md và DEV-S5-03; kết quả TC-PERF-01 được đánh giá và công bố theo cả tiêu chí gốc lẫn ngưỡng phân tầng.)*
  4. Nếu P95 Overhead $\ge 30\text{ ms}$: Runner trả mã lỗi `SLA_MISSED` và exit code 1. *(Lưu ý: Ghi nhận rủi ro P95 đạt 38ms/44ms tại c=10/25 ở bản đo local của Tùng Dương; cần đo kiểm lại trên staging đóng băng)*.
- **Nguồn yêu cầu:** `docs/07-sprint5-demo-and-rc-checklist.md:66`; Issue #21, #22 (comment); `backend/SPRINT-5-HANDOFF.md` mục EN-12.
- **Nguồn triển khai:** `backend/src/gateway-loadtest.ts:165, 173` (PR #103 đã merge).
- **Trạng thái phụ thuộc:** Chờ Backend PR #106 (Rủi ro SLA).

#### `AC-EN12-02`: Tính nguyên tử của Quota dưới điều kiện tải tranh chấp (Atomic Lua Script)
- **Phát biểu kiểm chứng:**
  1. Dưới tải 100 requests đồng thời tranh chấp 50 lượt quota còn lại trong cùng một thời điểm:
     - Đúng 50 requests đầu tiên nhận HTTP `200 OK`.
     - Đúng 50 requests tiếp theo nhận HTTP `429 Too Many Requests` (`QUOTA_EXCEEDED`).
     - Bộ đếm Redis và bản ghi PostgreSQL khớp chính xác 50 lượt, tuyệt đối không bị âm hạn ngạch (negative quota) và không có race condition.
- **Nguồn yêu cầu:** `docs/test/TESTING_RULES.md` mục 10; Issue #22; `backend/SPRINT-5-HANDOFF.md` mục EN-11.
- **Nguồn triển khai:** `backend/src/redis-meter.ts:23-45` (đã có trên `origin/develop`).
- **Trạng thái phụ thuộc:** Sẵn sàng trên `develop`.

---

### PHÂN HỆ 5: EN-13 — TRIỂN KHAI, SAO LƯU & ROLLBACK PRODUCTION

#### `AC-EN13-01`: Production Preflight & Kiểm tra cấu hình an toàn
- **Phát biểu kiểm chứng:**
  1. Chạy lệnh: `npm run preflight:prod` hoặc `node scripts/production-preflight.mjs`.
  2. Script từ chối khởi động (fail-closed, exit code 1) nếu:
     - Độ dài JWT Secret $< 32$ ký tự.
     - Các secret JWT, Sandbox, Upstream bị dùng trùng lặp nhau.
     - CORS Origin hoặc Base URL không dùng giao thức bảo mật `https://` (trên production).
- **Nguồn yêu cầu:** Issue #21 (Nhiệm vụ EN-13), `docs/06-production-rollback-runbook.md`.
- **Nguồn triển khai:** `scripts/production-preflight.mjs` (đã có trên `origin/develop` qua PR #103, commit `5c86628`).
- **Trạng thái phụ thuộc:** Sẵn sàng trên `develop`.

#### `AC-EN13-02`: Quy trình tự động hóa Sao lưu & Phục hồi Database (`verify:backup`)
- **Phát biểu kiểm chứng:**
  1. Chạy lệnh: `npm run verify:backup`.
  2. Quy trình tự động thực hiện: Khởi tạo DB nguồn `api_market_src`, áp dụng toàn bộ migration và seed, xuất bản dump `pg_dump -Fc`, tạo DB phục hồi `api_market_restored` và nạp lại bằng `pg_restore`.
  3. Bảng đối soát số lượng bản ghi in ra ở cuối phải khớp 100% giữa DB nguồn và DB phục hồi (độ lệch 0 bản ghi) trên toàn bộ các bảng cốt lõi và bảng mới của Sprint 5.
- **Nguồn yêu cầu:** Issue #21, #24; `backend/SPRINT-5-DATABASE-HANDOFF.md`.
- **Nguồn triển khai:** `scripts/db-backup-restore.mjs` (PR #103 đã merge).
- **Trạng thái phụ thuộc:** Chờ Database PR #104 (bổ sung bảng Sprint 5).

#### `AC-EN13-03`: Khả năng Rollback ứng dụng & Database dưới 60 giây
- **Phát biểu kiểm chứng:**
  1. Khi phiên bản mới gặp sự cố: Quá trình rollback container về tag ảnh trước đó (lưu trong `.last_image_tag`) và trỏ lại database diễn ra trong thời gian $< 60$ giây theo đúng hướng dẫn tại `docs/06-production-rollback-runbook.md`.
  2. Endpoint `/health` phản hồi HTTP `200 OK`, toàn vẹn dữ liệu, không phát sinh lỗi 500.
- **Nguồn yêu cầu:** `docs/06-production-rollback-runbook.md` mục 1 & mục 4.3; Issue #21.
- **Nguồn triển khai:** `docs/06-production-rollback-runbook.md`.
- **Trạng thái phụ thuộc:** Sẵn sàng trên `develop`.

---

### PHÂN HỆ 6: EN-14 — UX, RESPONSIVE & ACCESSIBILITY

#### `AC-EN14-01`: Đáp ứng hiển thị đa độ phân giải (Desktop & Tablet)
- **Phát biểu kiểm chứng:**
  1. Toàn bộ các màn hình chính (Marketplace, Detail, Playground, Checkout, Usage, Cost Guard, Provider Analytics, Admin Gateway) hiển thị hoàn chỉnh, không tràn khung hình, không vỡ layout trên 2 độ phân giải chuẩn:
     - Desktop: $1280 \times 720\text{ px}$.
     - Tablet: $768 \times 1024\text{ px}$.
  2. Trên màn hình Tablet $768 \times 1024$: Thanh điều hướng chuyển sang menu drawer/hamburger an toàn; các bảng dữ liệu có thanh cuộn ngang nội bộ hoặc chuyển sang dạng thẻ card.
- **Nguồn yêu cầu:** `docs/test/TESTING_RULES.md` mục 7 (Quy tắc H4); Issue #23, #25.
- **Nguồn triển khai:** Frontend components (`frontend/src/`).
- **Trạng thái phụ thuộc:** Chờ Frontend Issue #23 (@leduwn).

#### `AC-EN14-02`: Tiêu chuẩn Console sạch tuyệt đối (Zero Console Errors — Rule A1)
- **Phát biểu kiểm chứng:**
  1. Trong suốt quá trình duyệt qua toàn bộ các luồng giao diện người dùng và tương tác form:
     - Console trình duyệt không xuất hiện bất kỳ lỗi đỏ nào (`console.error`, uncaught exception, network failed 500).
     - Không có React key warning (`Each child in a list should have a unique 'key' prop`).
- **Nguồn yêu cầu:** `docs/test/TESTING_RULES.md` mục 0.1 & Phụ lục A (Tiêu chí A1); Issue #23, #25.
- **Nguồn triển khai:** Toàn bộ Frontend codebase.
- **Trạng thái phụ thuộc:** Chờ Frontend Issue #23 (@leduwn).

#### `AC-EN14-03`: Đầy đủ trạng thái Loading, Empty và Error States
- **Phát biểu kiểm chứng:**
  1. Mọi màn hình có tải dữ liệu bất đồng bộ (Cost Guard, Provider Analytics, Usage, Admin Ops) phải có đủ 3 trạng thái giao diện:
     - **Loading State:** Hiển thị Skeleton loading hoặc Spinner mượt mà, không giật layout.
     - **Empty State:** Khi người dùng mới chưa có dữ liệu, hiển thị hình minh họa và nút kêu gọi hành động (Call-to-Action) thân thiện, không để màn hình trắng trống trơn.
     - **Error State:** Khi API backend lỗi hoặc mất kết nối mạng, hiển thị thông báo lỗi rõ ràng và nút "Thử lại", không crash ứng dụng.
- **Nguồn yêu cầu:** `docs/03-quy-trinh-lam-viec.md` mục 1.2; Issue #23.
- **Nguồn triển khai:** Frontend components.
- **Trạng thái phụ thuộc:** Chờ Frontend Issue #23 (@leduwn).

#### `AC-EN14-04`: Khả năng tương tác tự nhiên (Tiêu chí A2–A3, không dùng force:true)
- **Phát biểu kiểm chứng:**
  1. Toàn bộ các nút bấm, ô nhập liệu và modal phải nằm trọn trong viewport nhìn thấy được, không bị che khuất bởi header, footer hay overlay (thỏa mãn tiêu chí A2).
  2. Người dùng bình thường có thể thực hiện lại toàn bộ thao tác bằng chuột và bàn phím (tiêu chí A3).
  3. Bộ test E2E tuyệt đối không được sử dụng cờ `{ force: true }` hay kích hoạt sự kiện ngầm `dispatchEvent` để lách qua phần tử bị che.
- **Nguồn yêu cầu:** `docs/test/TESTING_RULES.md` mục 7 (Quy tắc Z1, Z2, Tiêu chí A2, A3); Issue #23, #25.
- **Nguồn triển khai:** Frontend UI layout.
- **Trạng thái phụ thuộc:** Chờ Frontend Issue #23 (@leduwn).

---

### PHÂN HỆ 7: EN-15 — HỒI QUY TOÀN DIỆN & KÝ DUYỆT RELEASE CANDIDATE

#### `AC-EN15-01`: Vượt qua toàn bộ Integration Tests Backend và Unit Tests Frontend
- **Phát biểu kiểm chứng:**
  1. Chạy `npm test`: 100% test suites Backend (Auth, Provider, Review, Gateway, Metering, Usage, Cost Guard, Analytics) đạt trạng thái PASS (dự kiến tối thiểu 180+ tests), 0 skipped, 0 failed.
  2. Chạy `cd frontend && npm test`: 100% unit/component tests Vitest đạt trạng thái PASS (dự kiến tối thiểu 550+ tests).
  3. Lệnh `npm run build` ở cả frontend và backend hoàn tất với mã lỗi 0, không có lỗi TypeScript (`npx tsc -b`).
- **Nguồn yêu cầu:** `docs/03-quy-trinh-lam-viec.md` mục 2; Issue #21, #25.
- **Nguồn triển khai:** Backend & Frontend test suites.
- **Trạng thái phụ thuộc:** Chờ tích hợp develop.

#### `AC-EN15-02`: Nghiệm thu người dùng (UAT) trọn vẹn theo 3 vai trò
- **Phát biểu kiểm chứng:**
  1. Thực hiện UAT thực tế trên môi trường staging sạch theo 3 vai trò người dùng: `CONSUMER`, `API_PROVIDER`, `ADMIN`.
  2. Người dùng thực hiện đầy đủ các luồng nghiệp vụ cốt lõi không gặp bất kỳ lỗi chặn (blocker) nào.
  3. Người dùng nghiệm thu xác nhận tính hữu ích, chính xác của số liệu và ký biên bản UAT.
- **Nguồn yêu cầu:** Issue #25 (Nhiệm vụ EN-15), `docs/07-sprint5-demo-and-rc-checklist.md`.
- **Nguồn triển khai:** Môi trường Staging đóng băng.
- **Trạng thái phụ thuộc:** Chờ Staging đóng băng.

#### `AC-EN15-03`: Điều kiện đóng Sprint và Ký duyệt Release Candidate (RC Sign-off)
- **Phát biểu kiểm chứng:**
  1. Xác nhận **0 bug mức Critical / High** còn mở trên toàn dự án.
  2. Đã hoàn thành bộ tài liệu bàn giao: **Sprint 5 Test Report**, **User Guide cho 3 vai trò** (Consumer, Provider, Admin).
  3. Tech Lead (`@antondung`) và QA Lead (`@vuonghathaovan-gif`) cùng rà soát và đánh dấu hoàn tất toàn bộ 7 mục trong Checklist Release Candidate tại `docs/07-sprint5-demo-and-rc-checklist.md:60-68`.
- **Nguồn yêu cầu:** Issue #21, #25; `docs/07-sprint5-demo-and-rc-checklist.md`.
- **Nguồn triển khai:** Toàn bộ hồ sơ nghiệm thu Sprint 5.
- **Trạng thái phụ thuộc:** Tổng hợp cuối sprint.

---

### PHÂN HỆ 8: EN-16 — KỊCH BẢN DEMO END-TO-END 4 PHÂN CẢNH

#### `AC-EN16-01`: Phân cảnh 1 — Provider đăng ký, KYC, nhập OpenAPI và nộp duyệt
- **Phát biểu kiểm chứng:**
  1. Khởi động hạ tầng sạch bằng `docker compose --env-file .env.docker --profile frontend --profile demo up --build -d` và nạp seed `docker compose --env-file .env.docker run --rm migrate --seed`.
  2. Provider đăng nhập nộp hồ sơ KYC $\to$ Admin duyệt KYC thành `Verified`.
  3. Provider tạo API mới bằng cách upload `valid-weather-openapi3.json`, hệ thống tự sinh 7 khối tài liệu, cấu hình gói cước Free & Pro, xác minh DNS TXT $\to$ Bấm Submit for Review (`Submitted`). Thời gian hoàn tất $\le 3$ phút.
- **Nguồn yêu cầu:** `docs/07-sprint5-demo-and-rc-checklist.md` dòng 25-31; Issue #21, #25.
- **Nguồn triển khai:** `qa-scripts/sprint5-ui-e2e-runner.cjs` (Scenario 1). Toàn bộ seed data (`002_seed_auth_data.sql`), API backend và UI pages đã có sẵn trên `origin/develop`.
- **Trạng thái phụ thuộc:** Sẵn sàng trên `develop`.

#### `AC-EN16-02`: Phân cảnh 2 — Admin thẩm định Dossier, xuất bản API và giám sát Audit Log
- **Phát biểu kiểm chứng:**
  1. Admin mở API Reviews, kiểm tra Dossier (cảnh báo bảo mật dữ liệu cá nhân, trạng thái DNS TXT).
  2. Chuyển trạng thái API tuần tự: `Submitted` $\to$ `Under Review` $\to$ `Approved` $\to$ `Published`.
  3. Mở Audit Logs xác nhận mọi bước chuyển trạng thái đều được ghi nhận bất biến trong cơ sở dữ liệu. Thời gian hoàn tất $\le 2$ phút.
- **Nguồn yêu cầu:** `docs/07-sprint5-demo-and-rc-checklist.md` dòng 32-36; Issue #21, #25.
- **Nguồn triển khai:** `qa-scripts/sprint5-ui-e2e-runner.cjs` (Scenario 2). API backend và UI pages (`ApiReviewsPage`, `AuditLogsPage`) đã có sẵn trên `origin/develop`.
- **Trạng thái phụ thuộc:** Sẵn sàng trên `develop`.

#### `AC-EN16-03`: Phân cảnh 3 — Consumer khám phá Marketplace, thử Sandbox, đăng ký gói & gọi Gateway
- **Phát biểu kiểm chứng:**
  1. Khách vãng lai tìm kiếm API Weather trên Marketplace, xem tài liệu OpenAPI công khai và bảng giá.
  2. Đăng nhập Consumer, gọi thử Playground quá 5 lượt $\to$ nhận thông báo chặn `403 SANDBOX_EXHAUSTED`.
  3. Đăng ký gói Pro qua cổng Payment Sandbox (xác nhận webhook HMAC hợp lệ, kích hoạt `Active`).
  4. Tạo API Key `ak_live_...`, sao chép mã code generator và gọi Gateway thật cổng 3000: nhận HTTP 200, phản hồi có header `x-gateway-overhead-ms` và quota trừ nguyên tử. Thời gian $\le 5$ phút.
- **Nguồn yêu cầu:** `docs/07-sprint5-demo-and-rc-checklist.md` dòng 37-47; Issue #21, #25.
- **Nguồn triển khai:** `qa-scripts/sprint5-ui-e2e-runner.cjs` (Scenario 3).
- **Trạng thái phụ thuộc:** Chờ Bug Fix PR #105 (header `x-gateway-overhead-ms`).

#### `AC-EN16-04`: Phân cảnh 4 — Usage Dashboard, Cost Guard, Provider Analytics & Xử lý vi phạm
- **Phát biểu kiểm chứng:**
  1. Consumer mở Usage & Quota đối soát số lượt gọi vừa thực hiện; mở Cost Guard xem ngân sách và các mốc cảnh báo.
  2. Provider mở Analytics xem biểu đồ lưu lượng, top endpoint, tỷ lệ lỗi và doanh thu.
  3. Admin mở Operations Health tại `/admin/gateway`, thực hiện Suspend API $\to$ Gateway chặn tức thì $\to$ Restore lại. Thời gian $\le 3$ phút.
- **Nguồn yêu cầu:** `docs/07-sprint5-demo-and-rc-checklist.md` dòng 48-57; Issue #21, #25, #23.
- **Nguồn triển khai:** `qa-scripts/sprint5-ui-e2e-runner.cjs` (Scenario 4).
- **Trạng thái phụ thuộc:** Chờ Frontend Issue #23 (@leduwn).

---

## 3. MA TRẬN PHÂN QUYỀN RBAC 3 VAI TRÒ (SPRINT 5 ENFORCEMENT)

| Chức năng / Endpoint API | Khách vãng lai (Guest) | Consumer (`CONSUMER`) | Provider (`API_PROVIDER`) | Quản trị viên (`ADMIN`) | Cơ chế kiểm soát & Mã lỗi |
|---|:---:|:---:|:---:|:---:|---|
| **Xem Marketplace & API Detail** | Cho phép | Cho phép | Cho phép | Cho phép | Public Read-Only |
| **Thử Playground (Sandbox)** | Chặn 401 | 5 lượt / phiên | 5 lượt / phiên | Cho phép | Giới hạn Redis, hết lượt trả 403 `SANDBOX_EXHAUSTED` |
| **Đăng ký gói cước trả phí** | Chặn 401 | Cho phép | Cho phép | Cho phép | Buyer Role (`CONSUMER` / `API_PROVIDER`) |
| **Cấu hình Cost Guard (`/api/consumer/cost-guard`)** | Chặn 401 | Cho phép | Cho phép | Chặn 403 | JWT Buyer; chặn 403 `FORBIDDEN` nếu sai quyền |
| **Xem Analytics API (`/api/provider/analytics/overview`)** | Chặn 401 | Chặn 403 | Chỉ API sở hữu | Cho phép | JWT Provider; cách ly theo `provider_id` |
| **Thẩm định & Xuất bản API** | Chặn 401 | Chặn 403 | Chặn 403 | Cho phép | Role `ADMIN`, ghi Audit Log bất biến |
| **Đình chỉ API vi phạm (Suspend / Restore)** | Chặn 401 | Chặn 403 | Chặn 403 | Cho phép | Role `ADMIN`, Gateway đồng bộ tức thì |
| **Xem Operations Health (`/admin/gateway`)** | Chặn 401 | Chặn 403 | Chặn 403 | Cho phép | Role `ADMIN`, chặn 403 nếu cố truy cập |

---

## 4. BẢNG TRUY VẾT GIÁ TRỊ: NGUỒN YÊU CẦU VS NGUỒN TRIỂN KHAI

| Giá trị / Tham số | Xuất hiện tại | Nguồn yêu cầu (Issue / Docs / Handoff) | Nguồn triển khai (Code, Nhánh, File:Dòng) | Đánh giá xác nhận |
|---|---|---|---|:---:|
| **P95 overhead < 30ms** | AC-EN12-01<br>TC-PERF-01 | `docs/07-sprint5-demo-and-rc-checklist.md:66`; Issue #21, #22, #25 (comment) | `backend/src/gateway-loadtest.ts:173` (`origin/develop`, PR #103) | **[XÁC NHẬN]** Đầy đủ 2 nguồn |
| **Concurrency 1 / 10 / 25** | AC-EN12-01<br>TC-PERF-01 | Issue #22 (comment); `backend/SPRINT-5-HANDOFF.md` mục EN-12 | `backend/src/gateway-loadtest.ts:165` (`origin/develop`, PR #103) | **[XÁC NHẬN]** Đầy đủ 2 nguồn |
| **429 BUDGET_EXHAUSTED** | AC-US32-04<br>TC-CST-07 | `backend/SPRINT-5-HANDOFF.md` mục US-32 dòng 44 | `backend/src/cost-guard.ts:41` (`origin/codex/sprint5-backend`, PR #106) | **[XÁC NHẬN]** Đầy đủ 2 nguồn |
| **Thông báo lỗi ngân sách** | AC-US32-04<br>TC-CST-07 | **CHƯA CÓ TRONG YÊU CẦU GỐC** (yêu cầu chỉ nêu mã `BUDGET_EXHAUSTED`) | `backend/src/cost-guard.ts:41` (`'Monthly spending budget reached'`) | **[CHƯA CÓ YÊU CẦU GỐC XÁC NHẬN]**<br>TC chỉ assert mã `BUDGET_EXHAUSTED` |
| **Ngưỡng 50% / 80% / 100%** | AC-US32-03<br>TC-CST-05, 06 | Issue #22 (body và comment), Issue #25, `backend/SPRINT-5-HANDOFF.md` | `backend/src/cost-guard.ts:83` (`origin/codex/sprint5-backend`, PR #106) | **[XÁC NHẬN]** Đầy đủ 2 nguồn |
| **hardCutoff** | AC-US32-01<br>TC-CST-01, 07 | Issue #22 (comment), `backend/SPRINT-5-HANDOFF.md` mục US-32 | `migrations/017_sprint5_cost_guard.sql:6`, `backend/src/cost-guard.ts:40` | **[XÁC NHẬN]** Đầy đủ 2 nguồn |
| **unpricedRequests** | AC-US32-05<br>TC-CST-09 | `backend/SPRINT-5-HANDOFF.md` mục US-32 dòng 48 | `backend/src/cost-guard.ts:104` (`origin/codex/sprint5-backend`, PR #106) | **[XÁC NHẬN]** Đầy đủ 2 nguồn |
| **Rollback < 60 giây** | AC-EN13-03<br>TC-OPS-03 | `docs/06-production-rollback-runbook.md` mục 1, 4.3; Issue #21 | `docs/06-production-rollback-runbook.md` (`origin/develop`) | **[XÁC NHẬN]** Đầy đủ 2 nguồn |
| **Top 10 Endpoints** | AC-US31-03<br>TC-ANL-04 | Issue #22 (comment), `backend/SPRINT-5-HANDOFF.md` mục US-31 | `backend/src/usage-analytics.ts:123` (`LIMIT 10` trong PR #106) | **[XÁC NHẬN]** Đầy đủ 2 nguồn |
| **P50 / P95 / P99** | AC-US31-02<br>TC-ANL-03 | Issue #22 (body và comment), `backend/SPRINT-5-HANDOFF.md` mục US-31 | `backend/src/usage-analytics.ts:34` (`origin/codex/sprint5-backend`, PR #106) | **[XÁC NHẬN]** Đầy đủ 2 nguồn |
| **Bảng cost_guard_budgets** | AC-US32-01<br>TC-CST-01..04 | Issue #22, `backend/SPRINT-5-HANDOFF.md` mục US-32 | `migrations/017_sprint5_cost_guard.sql:3` (`origin/codex/sprint5-backend`) | **[XÁC NHẬN]** Đầy đủ 2 nguồn |
| **Bảng aggregate Analytics** | AC-US31-04<br>TC-ANL-05..07 | Issue #22, Issue #24, `backend/SPRINT-5-DATABASE-HANDOFF.md` | `migrations/015_sprint5_analytics_performance.sql:17, 20` (`origin/feature/24-sprint5-database`) | **[XÁC NHẬN]** Đầy đủ 2 nguồn |
| **Cột estimated_cost** | AC-US32-02<br>TC-CST-03 | `backend/SPRINT-5-HANDOFF.md` mục US-32 dòng 41 | `migrations/017_sprint5_cost_guard.sql:13-16` (`origin/codex/sprint5-backend`) | **[XÁC NHẬN]** Đầy đủ 2 nguồn |
| **Header Whitelist Gateway** | AC-EN11-04<br>TC-SEC-05 | `docs/test/TESTING_RULES.md` mục 9; `backend/SPRINT-5-HANDOFF.md` mục EN-11 | `backend/src/gateway-service.ts:31-33` (`origin/develop`) | **[XÁC NHẬN]** Đầy đủ 2 nguồn |
| **Header x-gateway-overhead-ms**| AC-S4-17<br>TC-OVH-06 | `docs/test/Sprint4_AcceptanceCriteria.md` (AC-S4-17); Issue #22, #105 | `backend/src/gateway-service.ts:146` (`origin/codex/sprint4-qa-closeout`, PR #105) | **[XÁC NHẬN]** Đầy đủ 2 nguồn |
| **Mã lỗi SSRF** | AC-EN11-01<br>TC-SEC-01, 02 | `docs/test/TESTING_RULES.md` mục 9; Issue #22, #25 | `backend/src/safe-proxy.ts:23`, `backend/src/provider-dns.ts:34` (`origin/develop`) | **[XÁC NHẬN]** Đầy đủ 2 nguồn |
| **Route /admin/gateway** | AC-EN16-04<br>TC-DEMO-04 | `docs/07-sprint5-demo-and-rc-checklist.md:55` ("Operations Health") | `frontend/src/App.tsx:185` (`origin/develop`, commit `27307ca`) | **[XÁC NHẬN]** Đầy đủ 2 nguồn |
| **Mã HTTP cách ly Provider** | AC-US31-04<br>TC-ANL-06 | `backend/SPRINT-5-HANDOFF.md` ("chỉ tổng hợp API thuộc tài khoản", "cô lập dữ liệu"); `docs/known-limitations.md` | `backend/src/usage-router.ts:47-49` (PR #112 / commit `e786a52`, trả 404 NOT_FOUND) | **[XÁC NHẬN]** Đã chốt mã 404 NOT_FOUND (PR #112) |

---

## 5. RỦI RO KỸ THUẬT & CÂU HỎI MỞ CẦN TECH LEAD / DEV CHỐT

1. **[ĐÃ ĐÓNG / CHỐT — Mã HTTP cách ly Provider (AC-US31-04, TC-ANL-06)]:**
   - Tech Lead (@antondung trong PR #112 / commit `e786a52`) đã chốt phương án trả HTTP **`404 NOT_FOUND`** (`{ error: { code: 'NOT_FOUND', message: 'API not found' } }`) tại `backend/src/usage-router.ts:47-49` qua kiểm tra quyền `service.ownsApi`.
   - Lý do: Không trả 200 rỗng để tránh vô tình xác nhận sự tồn tại của `apiId` người khác, triệt tiêu rủi ro rò rỉ không gian ID (ID space leak).
2. **[ĐÃ GHI NHẬN HẠN CHẾ KIẾN TRÚC — Rủi ro SLA Load Test (AC-EN12-01, TC-PERF-01)]:**
   - Tech Lead đã chuẩn hóa ngưỡng SLA phân tầng trong `docs/known-limitations.md`: P95 overhead $< 30$ms khi đồng thời $c = 1$, và $< 60$ms khi $c > 1$.
   - Mức $c = 25$ vượt ngưỡng trên máy local được ghi nhận là đánh đổi có chủ đích: `GatewayEntitlement.reserve` sử dụng khóa dòng PostgreSQL `FOR UPDATE OF s` để đảm bảo quota chính xác tuyệt đối dưới tải đồng thời. Hướng nâng cấp chuyển sang Redis Lua script được bảo lưu vào roadmap.
3. **[ĐÃ TÍCH HỢP HOÀN TẤT — Frontend Issue #23]:**
   - PR #109 (commit `1ff69a3`, `572afb0`) đã nối API thực tế cho `CostGuardPage.tsx` và `AnalyticsHealthPage.tsx`, vượt qua 578/578 tests unit/integration, và đã được gộp vào `develop` qua PR #110.

---

## 6. MA TRẬN TRUY VẾT 42 TEST CASES (TRACEABILITY MATRIX)

| Mã AC | Thuộc Epic / Story | Issue liên quan | File nguồn kiểm chứng | Test Cases liên kết | Trạng thái kỹ thuật |
|---|---|:---:|---|---|:---:|
| `AC-US31-01` | US-31 | #22, #24, #23 | `backend/SPRINT-5-HANDOFF.md` | `TC-ANL-01`, `TC-ANL-02`, `TC-ANL-07` | Chờ BE PR #106, FE #23 |
| `AC-US31-02` | US-31 | #22, #23 | `backend/SPRINT-5-HANDOFF.md` | `TC-ANL-03` | Chờ BE PR #106, FE #23 |
| `AC-US31-03` | US-31 | #22, #23 | `backend/SPRINT-5-HANDOFF.md` | `TC-ANL-04` | Chờ BE PR #106, FE #23 |
| `AC-US31-04` | US-31 | #22, #24 | `backend/SPRINT-5-DATABASE-HANDOFF.md` | `TC-ANL-05`, `TC-ANL-06` | Chờ DB PR #104, BE PR #106 |
| `AC-US32-01` | US-32 | #22, #25, #23 | `backend/SPRINT-5-HANDOFF.md` | `TC-CST-01`, `TC-CST-02` | Chờ BE PR #106, FE #23 |
| `AC-US32-02` | US-32 | #22, #24 | `migrations/017_sprint5_cost_guard.sql` | `TC-CST-03`, `TC-CST-04` | Chờ BE PR #106, FE #23 |
| `AC-US32-03` | US-32 | #23, #25 | `backend/SPRINT-5-HANDOFF.md` | `TC-CST-05`, `TC-CST-06` | Chờ BE PR #106, FE #23 |
| `AC-US32-04` | US-32 | #22, #25 | `backend/SPRINT-5-HANDOFF.md` | `TC-CST-07`, `TC-CST-08` | Chờ BE PR #106 |
| `AC-US32-05` | US-32 | #22 | `backend/SPRINT-5-HANDOFF.md` | `TC-CST-09` | Chờ BE PR #106 |
| `AC-EN11-01` | EN-11 | #22, #25 | `docs/test/TESTING_RULES.md` mục 9 | `TC-SEC-01`, `TC-SEC-02` | Sẵn sàng trên `develop` |
| `AC-EN11-02` | EN-11 | #22 | `backend/SPRINT-5-HANDOFF.md` | `TC-SEC-03` | Chờ BE PR #106 |
| `AC-EN11-03` | EN-11 | #22, #23 | `docs/test/TESTING_RULES.md` mục 9 | `TC-SEC-04` | Sẵn sàng trên `develop` |
| `AC-EN11-04` | EN-11 | #20, #22 | `docs/test/TESTING_RULES.md` mục 9 | `TC-SEC-05` | Chờ BE PR #106 |
| `AC-EN11-05` | EN-11 | #21, #25 | `docs/02-role-va-phan-quyen.md` | `TC-SEC-06`, `TC-SEC-07` | Sẵn sàng trên `develop` |
| `AC-EN12-01` | EN-12 | #21, #22 | `backend/src/gateway-loadtest.ts` | `TC-PERF-01` | Chờ BE PR #106 (Rủi ro SLA) |
| `AC-EN12-02` | EN-12 | #22 | `docs/test/TESTING_RULES.md` mục 10 | `TC-PERF-02` | Sẵn sàng trên `develop` |
| `AC-EN13-01` | EN-13 | #21 | `scripts/production-preflight.mjs` | `TC-OPS-01` | Sẵn sàng trên `develop` |
| `AC-EN13-02` | EN-13 | #21, #24 | `scripts/db-backup-restore.mjs` | `TC-OPS-02` | Chờ DB PR #104 |
| `AC-EN13-03` | EN-13 | #21 | `docs/06-production-rollback-runbook.md` | `TC-OPS-03` | Sẵn sàng trên `develop` |
| `AC-EN14-01` | EN-14 | #23, #25 | `docs/test/TESTING_RULES.md` mục 7 | `TC-UX-01`, `TC-UX-02` | Chờ FE #23 |
| `AC-EN14-02` | EN-14 | #23, #25 | `docs/test/TESTING_RULES.md` mục 0.1 | `TC-UX-03` | Chờ FE #23 |
| `AC-EN14-03` | EN-14 | #23 | `docs/03-quy-trinh-lam-viec.md` | `TC-UX-04` | Chờ FE #23 |
| `AC-EN14-04` | EN-14 | #23, #25 | `docs/test/TESTING_RULES.md` tiêu chí A2-A3 | `TC-UX-05` | Chờ FE #23 |
| `AC-EN15-01` | EN-15 | #25, #21 | `docs/03-quy-trinh-lam-viec.md` | `TC-REG-01`, `TC-REG-02` | Chờ tích hợp develop |
| `AC-EN15-02` | EN-15 | #25 | `docs/07-sprint5-demo-and-rc-checklist.md` | `TC-UAT-01` | Chờ Staging đóng băng |
| `AC-EN15-03` | EN-15 | #25, #21 | `docs/07-sprint5-demo-and-rc-checklist.md` | `TC-UAT-02` | Tổng hợp cuối sprint |
| `AC-EN16-01` | EN-16 | #21, #25 | `docs/07-sprint5-demo-and-rc-checklist.md` | `TC-DEMO-01` | Sẵn sàng trên `develop` |
| `AC-EN16-02` | EN-16 | #21, #25 | `docs/07-sprint5-demo-and-rc-checklist.md` | `TC-DEMO-02` | Sẵn sàng trên `develop` |
| `AC-EN16-03` | EN-16 | #21, #25 | `docs/07-sprint5-demo-and-rc-checklist.md` | `TC-DEMO-03` | Chờ PR #105 |
| `AC-EN16-04` | EN-16 | #21, #25, #23 | `docs/07-sprint5-demo-and-rc-checklist.md` | `TC-DEMO-04` | Chờ FE #23 |
| `AC-S4-17` | US-23 (Bug S4) | #105, #22 | `docs/test/Sprint4_AcceptanceCriteria.md` | `TC-OVH-06-RETEST` | Chờ PR #105 |
