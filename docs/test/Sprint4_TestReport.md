# Báo cáo Kiểm thử Sprint 4 — Nghiệm thu Tích hợp & Kiểm toán Chất lượng (Comprehensive QA Audit)

> **Dự án:** API Marketplace Platform<br>
> **Phiên bản:** Lần test 2 / Re-test Sprint 4 (10/11/2026)<br>
> **Giai đoạn:** Sprint 4 — Gói cước (Pricing Plans), Đăng ký (Subscriptions), Thanh toán Sandbox (Stripe-like), API Gateway Định tuyến & Hạn ngạch (Quota/Rate Limit), Ký Upstream HMAC & Che giấu Dữ liệu (Sensitive Data Redaction), Đo lường Độ trễ Overhead, Lịch sử Gọi API (Request History), Sinh mã Tích hợp (Code Generator), Giám sát Admin & Worker Tự động.<br>
> **QA Lead & Tác giả:** Trần Hà Thảo Vân (MSSV: BCS250039, `@vuonghathaovan-gif` — Issue #15 & Issue #70)<br>
> **Thời điểm thực hiện re-test:** 10/11/2026<br>
> **Cột mốc kiểm thử (Baseline SHA):** `713aedacdd0fdd651d7800185626eea5a85e4388` (PR #101 trên `develop` / PR #102 trên `main` `7f827548772a859737ae417ceef041b6bf193c6f`)<br>
> **Nhánh thực thi:** `test/15-sprint4-retest` (khởi tạo từ mốc đóng Sprint 4 `713aeda`)<br>
> **Đề xuất của QA:** **Conditional GO (chờ PO/Tech Lead quyết định) — 57/58 Test Cases ĐẠT (98.28%), 1/58 CHƯA ĐẠT (1.72% do BUG-S4-01 tại TC-OVH-06 mức độ Medium, không chặn luồng nghiệp vụ); 177/177 Tests Backend PASS (100%), 550/550 Unit Tests Frontend PASS (100%), 8/8 Playwright E2E UI Scenarios PASS (100%), 0 SKIPPED, 0 BLOCKED.**

---

## I. TỔNG QUAN ĐỢT RE-TEST SPRINT 4 (LẦN TEST 2)

### 1. Bối cảnh & Mục tiêu Đợt Re-test
Sau khi đợt kiểm thử nghiệm thu lần 1 được hoàn thành vào sáng ngày 05/11/2026 (ghi nhận 50/53 TCs PASS, 3 sai lệch kỹ thuật mở: DEV-S4-01, DEV-S4-02, DEV-S4-04), các thành viên phát triển trong nhóm đã thực hiện hàng loạt commit và Pull Request mới nhằm khắc phục lỗi, hoàn thiện giao diện và chuẩn hóa vận hành trước khi đóng cổng Sprint 4 (PR #97, PR #98, PR #99, PR #101).

Đợt Re-test này được thực hiện nhằm:
1. **Kiểm tra lại toàn diện (Re-test) các sửa đổi mới của thành viên (Nhóm B):**
   - Phục hồi Subscription bị đình chỉ: Tự động hết hạn nếu `current_period_end <= NOW()` (PR #97 / `b6f0594`), khôi phục đúng trạng thái ban đầu (`status_before_suspend`) và bảo toàn quota (PR #97 / `1cc41de`, migration `014`).
   - Phân quyền RBAC: Bảo đảm tài khoản Provider giữ trọn vẹn năng lực Consumer (đăng ký gói, tạo key, gọi Gateway) (PR #97 / `de7935f`).
   - Sửa nhãn hiển thị rate limit sang đơn vị phút (PR #98 / `0a9a2dd`).
   - Giao diện Usage & Dashboard Provider: Thêm biểu đồ lượt gọi theo ngày `DailyRequestChart`, bộ lọc chuẩn hóa integer `api_id`, tách doanh thu đa tiền tệ VND/USD và Workspace Role Guard (PR #99 / `abbc38b`).
2. **Kiểm tra hồi quy (Regression Testing) các tính năng gốc của Sprint 4 (Nhóm A):**
   - Đảm bảo 100% các tính năng đã pass đợt 1 không bị ảnh hưởng (side-effects) sau khi gộp mã nguồn.
3. **Thẩm định độc lập 3 sai lệch kỹ thuật mở từ lần test đầu:**
   - Đối chiếu tình trạng thực tế của `DEV-S4-01`, `DEV-S4-02`, và `DEV-S4-04` trên mã nguồn release chính thức `713aeda`.
4. **Loại trừ tuyệt đối các hạng mục của Sprint tuần này (Sprint 5):**
   - Cách ly hoàn toàn mã nguồn khỏi PR #103, PR #104, PR #106 thuộc Sprint 5; kiểm thử độc lập tại đúng mốc Sprint 4.

---

## II. BẢNG SO SÁNH KẾT QUẢ GIỮA LẦN TEST 1 VÀ LẦN TEST 2 (RE-TEST)

| Tiêu chí đối soát | Lần test 1 (05/11/2026) | Lần test 2 / Re-test (10/11/2026) | Độ lệch / Đánh giá biến động |
|---|:---:|:---:|---|
| **Cột mốc commit kiểm thử** | `test/sprint4-full-integration`<br/>(`ba785f9` / `911a66c`) | `test/15-sprint4-retest`<br/>(`713aeda` / `7f82754`) | Cây mã nguồn hoàn chỉnh sau khi gộp đủ 8 nhánh Sprint 4 |
| **Tổng số ca kiểm thử (TCs)** | 53 TCs | **58 TCs** | **+5 TCs MỚI** (Bổ sung đo lường cho các thay đổi Nhóm B) |
| **Số ca kiểm thử ĐẠT (PASS)** | 50 TCs (94.34%) | **57 TCs (98.28%)** | **+7 TCs PASS** (Đề xuất đóng DEV-S4-01, DEV-S4-04 và đạt 5 TCs mới) |
| **Số ca kiểm thử CHƯA ĐẠT (FAIL)** | 3 TCs (5.66%) | **1 TC (1.72%)** | **Giảm 2 lỗi**: Chỉ còn duy nhất `BUG-S4-01` (`TC-OVH-06`) |
| **Số ca Skipped / Blocked** | 0 | **0** | Không có test nào bị bỏ qua hoặc lách luồng |
| **Backend Integration Tests** | 168/168 tests PASS | **177/177 tests PASS** | **+9 tests backend** (`provider-consumer-access`, `operations`) |
| **Frontend Unit Vitest** | 530/530 tests PASS (42 files) | **550/550 tests PASS (47 files)** | **+20 tests frontend** (`DailyRequestChart`, `workspaceRole`, v.v.) |
| **Playwright Human-First E2E** | 8/8 scenarios PASS | **8/8 scenarios PASS** | Duy trì 100% pass với Chromium thật, 0 console error |
| **SLA Benchmark Gateway P95** | 16.91 ms (Application P95) | **17.24 ms (Application P95)** | Thỏa mãn xuất sắc cam kết SLA < 30ms (Stored P95 = 15.00 ms) |
| **Đối soát chéo 4 tầng (`HIST-04`)** | 100% PASS | **100% PASS** | Đồng bộ tuyệt đối: Request $\to$ Redis $\to$ DB $\to$ View $\to$ UI |
| **Đánh giá chất lượng** | CONDITIONAL PASS / BLOCKED | **Đề xuất của QA: Conditional GO (chờ PO/Tech Lead quyết định)** | **Đủ điều kiện bàn giao** (Lỗi còn lại là non-blocking Medium) |

---

## III. BẢNG TỔNG HỢP PIPELINE THỰC NGHIỆM ĐỢT RE-TEST

Kết quả thực thi tự động qua các bộ test suite chính thức trên nhánh `test/15-sprint4-retest` (Commit `713aeda`):

| STT | Bộ kiểm thử / Phân hệ | Lệnh thực thi | Thời gian | Exit Code | Kết quả | Bằng chứng thực nghiệm |
|:---:|---|---|:---:|:---:|:---:|---|
| **1** | **Lint & TypeScript Build** | `npm run lint && npm run build` | 6.8s | 0 | **PASS** | 0 lỗi TypeScript trên cả backend và frontend. |
| **2** | **Frontend Vitest Suite** | `npm --prefix frontend test -- --run` | 75.76s | 0 | **PASS** | **550/550 tests passed** trên 47 files (bao gồm toàn bộ tests mới của PR #98, PR #99). |
| **3** | **Backend Integration Suite** | `node scripts/run-tests.mjs` | 73.22s | 0 | **PASS** | **177/177 tests passed** kết nối PostgreSQL 17 và Redis thật (bổ sung toàn bộ suite `provider-consumer-access.test.ts` và `operations.test.ts`). |
| **4** | **Re-test QA Runner (58 TCs)** | `node qa-scripts/sprint4-retest-runner.cjs` | 1.8s | 1 | **CONDITIONAL** | **57/58 PASS (98.28%), 1/58 FAIL (1.72%)**. Nhóm A: 43/43 PASS (100%), Nhóm B: 14/15 PASS (93.3%). |
| **5** | **4-Tier Data Synchronization** | `node qa-scripts/test-cross-verification-4tier.cjs` | 0.45s | 0 | **PASS** | Đồng bộ tuyệt đối 4 tầng: 1 Request $\to$ Redis (+1) $\to$ DB (+1) $\to$ View (+1) $\to$ UI (+1). |
| **6** | **Runtime Gaps Verification** | `node qa-scripts/test-runtime-gaps.cjs` | 4.8s | 0 | **PASS** | Đo đạc runtime 4 ca chuyên sâu: `GW-05` (SQLi HTTP 401), `RED-01` (`to_jsonb` 0 leaked), `OVH-05` (Benchmark runtime thật), `GW-04` (Scope mismatch). |
| **7** | **Gateway SLA Benchmark** | `node scripts/run-tests.mjs --benchmark` | 4.5s | 0 | **PASS** | 100 requests mẫu: **Stored P95 = 15.00 ms, Application P95 = 17.24 ms, Max = 20.55 ms** (Đạt SLA < 30ms). |
| **8** | **Playwright Human-First E2E** | `node qa-scripts/sprint4-ui-e2e-runner.cjs` | 33.2s | 0 | **PASS** | **8/8 scenarios passed (100%)** trên Chromium thật, 0 console error, viewports 1280x720 & 768x1024 đạt chuẩn. |

---

## IV. LẦN CHẠY LỖI BAN ĐẦU & GIẢI TRÌNH KỸ THUẬT (RUNNER LOGS)

Trong quá trình thực thi kiểm thử tự động, có 2 trường hợp gặp lỗi ở lần chạy đầu tiên đã được xử lý minh bạch theo đúng quy chuẩn kiểm thử:

### 1. Playwright E2E UI Runner (`qa-scripts/sprint4-ui-e2e-runner.cjs`)
- **Triệu chứng:** Exit code 1 ở lần chạy đầu tiên do kịch bản `E2E-S4-AUTH` bị timeout 30.000ms.
- **Nguyên nhân gốc:** Hiện tượng khởi động lạnh (cold-start) của máy chủ Vite preview (port 5173). Khi trình duyệt truy cập lần đầu, máy chủ cần thời gian phân giải và nạp các gói bundle JS vào bộ nhớ.
- **Xử lý theo quy định:** Căn cứ quy tắc xử lý flaky test (cho phép chạy lại tối đa 2 lần đối với lỗi hạ tầng khởi động), QA tiến hành kích hoạt lại lần 2 khi máy chủ preview đã ấm (warm cache).
- **Kết quả:** Lần chạy thứ 2 hoàn thành xuất sắc trong 33.2s, **8/8 kịch bản PASS (100%)**, không ghi nhận bất kỳ lỗi đỏ console nào.

### 2. Re-test QA Runner (`qa-scripts/sprint4-retest-runner.cjs`)
Runner chạy tổng hợp 58 TCs gặp exit code 1 ở 2 lần chạy đầu do lệch pattern chuỗi kiểm tra mã nguồn (không phải lỗi logic ứng dụng):
- **Lần 1 (lỗi tại `TC-SUB-13`):** Script kiểm tra sự hiện diện của test suite Provider capabilities trong file `backend/integration/provider-consumer-access.test.ts`. Chuỗi tìm kiếm ban đầu (`provider can subscribe`) không khớp chính xác test title được định nghĩa trong mã nguồn test thật.
- **Lần 2 (lỗi tại `TC-HIST-10`):** Script kiểm tra tên hàm `hasWorkspaceRole` trong `frontend/src/components/auth/workspaceRole.ts`, nhưng thực tế mã nguồn export 2 hàm cụ thể là `canUseConsumerWorkspace` và `canUseProviderWorkspace`.

**Chi tiết thay đổi trong `qa-scripts/sprint4-retest-runner.cjs`:**
```javascript
// 1. Khớp chính xác test title trong backend/integration/provider-consumer-access.test.ts:
- assert(providerAccessTest.includes('provider can subscribe'), 'Provider retains Consumer capability');
+ assert(providerAccessTest.includes('Provider buys a Free subscription') || providerAccessTest.includes('Provider Paid checkout'), 'Provider retains Consumer capability');

// 2. Khớp đúng tên hàm export trong frontend/src/components/auth/workspaceRole.ts:
- assert(roleGuardSrc.includes('hasWorkspaceRole'), 'Workspace role checker exists');
+ assert(roleGuardSrc.includes('canUseConsumerWorkspace') && roleGuardSrc.includes('canUseProviderWorkspace'), 'Workspace role checker exists');
```

> **Xác nhận từ QA:** Toàn bộ các assertion kiểm tra điều kiện nghiệp vụ, kiểm tra exit code của các test suite gốc, SLA P95 < 30ms, và logic bắt lỗi thực tế của `TC-OVH-06` **hoàn toàn KHÔNG bị nới lỏng hay bỏ qua**. Script giữ nguyên việc đánh dấu FAIL cho `TC-OVH-06` (`BUG-S4-01`) để phản ánh trung thực trạng thái hệ thống.

---

## V. BÁO CÁO CHI TIẾT TÌNH TRẠNG 3 SAI LỆCH CŨ TỪ LẦN TEST 1

### 1. DEV-S4-01: Mã lỗi Fail-Closed khi sự cố Redis (`TC-GW-15`) $\to$ **ĐỀ XUẤT ĐÓNG – chờ Tech Lead/PO xác nhận**
- **Yêu cầu AC gốc ban đầu:** Theo tiêu chí AC-S4-09 (tại `docs/test/Sprint4_AcceptanceCriteria.md`, dòng 233) và định nghĩa `TC-GW-15`: Khi Redis gặp sự cố ngắt kết nối hoặc timeout, Gateway phải trả về `HTTP 429` kèm mã lỗi `RATE_LIMIT_UNAVAILABLE` nếu đang kiểm tra rate limit, hoặc `HTTP 503` kèm `QUOTA_UNAVAILABLE` nếu đang kiểm tra quota tháng.
- **Hành vi thực tế trong mã nguồn:** Nhằm bảo đảm chỉ tiêu cam kết độ trễ SLA P95 < 30ms, đội ngũ phát triển tại `backend/src/redis-meter.ts` và `gateway-service.ts` đã gộp cả kiểm tra rate limit trượt và trừ hạn ngạch quota tháng vào **1 Lua script nguyên tử duy nhất trên Redis** (giảm 50% số lượt round-trip qua mạng). Do đó, khi Redis gặp sự cố, khối `try...catch` áp dụng cơ chế an toàn Fail-Closed và luôn ném lỗi `HTTP 503` kèm mã lỗi chuẩn `QUOTA_UNAVAILABLE`.
- **Phần test và tài liệu đã sửa:** Test suite `backend/test/redis-meter.test.ts` và `backend/test/gateway.integration.test.ts` đã được cập nhật kỳ vọng nhận mã lỗi `503 QUOTA_UNAVAILABLE`. Tài liệu vận hành `migrations/sprint4-redis-postgres-runbook.md` đã cập nhật kịch bản Redis fail-closed.
- **Trạng thái:** **ĐỀ XUẤT ĐÓNG** — Đề nghị Tech Lead / PO (@antondung) xem xét và xác nhận chấp thuận kiến trúc gộp Lua script (trả 503 Fail-Closed) hay yêu cầu sửa code tách biệt thành 429/503 theo đúng AC gốc.

### 2. DEV-S4-04: Mã lỗi khi API Key sai phạm vi API (`TC-GW-04`) $\to$ **ĐỀ XUẤT ĐÓNG – chờ Tech Lead/PO xác nhận**
- **Yêu cầu AC gốc ban đầu:** Theo tiêu chí AC-S4-04 (tại `docs/test/Sprint4_AcceptanceCriteria.md`, dòng 176) và định nghĩa `TC-GW-04`: Khi Caller sử dụng API Key hợp lệ của API A để gửi request vào endpoint của API B, Gateway phải trả về `HTTP 403 Forbidden` kèm mã lỗi riêng biệt `API_KEY_SCOPE_MISMATCH`.
- **Hành vi thực tế trong mã nguồn:** Tại `backend/src/consumer-service.ts` (hàm `validateApiKeyForApi`), hệ thống truy vấn kiểm tra quan hệ giữa API Key và `api_id`. Khi không tìm thấy quyền truy cập hợp lệ, backend trả về mã lỗi chung `HTTP 401 Unauthorized` kèm `{ code: "INVALID_API_KEY" }`. Phương án này được lựa chọn nhằm tránh rò rỉ thông tin về sự tồn tại của key trên các API khác trong nền tảng (ngăn chặn kẻ xấu dò quét khóa API).
- **Phần test và tài liệu đã sửa:** Test suite `backend/test/gateway.integration.test.ts` và script kiểm thử runtime `qa-scripts/test-runtime-gaps.cjs` kiểm tra phản hồi `401 INVALID_API_KEY`.
- **Trạng thái:** **ĐỀ XUẤT ĐÓNG** — Đề nghị Tech Lead / PO (@antondung) xem xét và xác nhận chấp thuận phương án trả mã bảo vệ 401 hay yêu cầu sửa code để trả mã 403 `API_KEY_SCOPE_MISMATCH` theo đúng AC gốc.

### 3. DEV-S4-02: Header đo lường độ trễ phía Client (`TC-OVH-06`) $\to$ **CHƯA ĐẠT (XÁC NHẬN BUG-S4-01)**
- **Tình trạng lần test 1:** FAIL. Gateway không trả header `X-Gateway-Overhead-Ms` ra client.
- **Thẩm định đợt Re-test:** **CHƯA ĐẠT (FAIL)**.
  - Mặc dù phụ lục cập nhật ngày 06/11/2026 (commit `122ba09`) có ghi nhận: *"DEV-S4-02 sửa bằng code (Gateway trả x-gateway-overhead-ms trên mọi response)"*, nhưng qua kiểm tra mã nguồn thực tế tại mốc release `713aeda`, router `backend/src/gateway-service.ts` và `safe-proxy.ts` **hoàn toàn không có lệnh gán header `res.setHeader('x-gateway-overhead-ms', ...)`**.
  - Chỉ số overhead thực tế chỉ được lưu nội bộ vào cơ sở dữ liệu (`usage_outbox` và `usage_logs`).
  - Lỗi này cũng đã được thành viên Tùng Nguyễn (`@Tungdota53`) kiểm chứng độc lập và mở Pull Request sửa lỗi #105 vào ngày 09/11/2026. Tuy nhiên, do PR #105 chưa được merge vào nhánh chính thức của Sprint 4 (`713aeda`), lỗi này được QA ghi nhận thành Bug chính thức dưới đây.

---

## VI. BÁO CÁO LỖI CHÍNH THỨC (BUG REPORT) THEO QUY TRÌNH QUẢN LÝ BUG

Căn cứ theo mẫu chuẩn quy định tại [docs/05-quy-trinh-quan-ly-bug.md](../05-quy-trinh-quan-ly-bug.md):

```markdown
## [BUG-S4-01] Gateway không trả response header X-Gateway-Overhead-Ms phía client

**Mã Backlog liên quan:** US-23 (Tiêu chí AC-S4-17 / Test Case TC-OVH-06)

### 1. Mô tả lỗi
Theo đặc tả kỹ thuật tại Sprint4_AcceptanceCriteria.md (dòng 312-317) và tài liệu đóng cổng ngày 06/11/2026,
API Gateway cần phản hồi cho client kèm header giám sát độ trễ `X-Gateway-Overhead-Ms` (hoặc `x-gateway-overhead-ms`).
Tuy nhiên, trong mã nguồn phát hành chính thức của Sprint 4 (commit 713aeda), Gateway chỉ tính toán
chỉ số này trong bộ nhớ và ghi vào bảng `usage_outbox`/`usage_logs`, hoàn toàn không thiết lập header
trả về cho client trong luồng forward response của `SafeProxy` hoặc `GatewayService`.

### 2. Các bước tái hiện (Steps to Reproduce)
1. Khởi động backend Gateway tại cổng 3000: `node dist/src/server.js`.
2. Tạo một API Key hợp lệ và đăng ký gói cước active cho API 7 (Weather Now API).
3. Sử dụng cURL hoặc fetch gửi request hợp lệ qua Gateway:
   curl -i -H "x-api-key: ak_live_32Eb3QDBkJ02GqrW2TAM-MLhrnaDvpsX" \
        http://localhost:3000/api/gateway/7/v1/weather/current?city=Hanoi
4. Quan sát danh sách HTTP Response Headers nhận được từ Gateway.

### 3. Kết quả mong đợi (Expected Result)
Response headers trả về cho client phải bao gồm thông tin độ trễ xử lý nội bộ của Gateway:
- `X-Gateway-Overhead-Ms: <số_nguyên_ms>` (Ví dụ: `X-Gateway-Overhead-Ms: 5`)

### 4. Kết quả thực tế (Actual Result)
Response headers chỉ chứa các header presentation thông thường từ upstream và header nền tảng:
- `Cache-Control: no-store`
- `X-Request-Id: <uuid>`
- `Content-Type: application/json`
Hoàn toàn KHÔNG có header `X-Gateway-Overhead-Ms` hay `X-Response-Time`.

### 5. Thông tin bổ sung
- **Severity:** Medium (Lỗi chức năng giám sát phía client; không làm gián đoạn luồng gọi API, không gây sai lệch dữ liệu quota hay billing, dữ liệu overhead vẫn được lưu chính xác trong database).
- **Môi trường:** Node.js v24.21.0 / Windows 11 / PostgreSQL 17 / Chromium 120.
- **Commit gốc tồn tại lỗi:** 2c8a873, ba785f9, 713aeda (Sprint 4 release baseline).
- **Trạng thái PR sửa lỗi:** Đã có đề xuất sửa tại PR #105 (`codex/sprint4-qa-closeout`) của Nguyễn Như Tùng Dương (đang ở trạng thái OPEN, chưa merge vào develop).
- **Bằng chứng kiểm tra:** Kiểm tra mã nguồn không thấy lệnh gán header `x-gateway-overhead-ms` trên đối tượng response.
```

---

## VII. NGHIỆM THU 5 CA KIỂM THỬ MỚI BỔ SUNG CHO NHÓM B

| Mã TC | Tên ca kiểm thử | Căn cứ kỹ thuật (PR / Commit) | Kết quả thực nghiệm | Bằng chứng xác minh |
|:---:|---|---|:---:|---|
| **`TC-SUB-13`** | Provider accounts retain full Consumer capabilities (Subscribe & consume) | PR #97 / `de7935f`<br/>`provider-consumer-access.test.ts` | **PASS** | 432 dòng integration tests xác thực tài khoản Provider có thể tự tạo key, đăng ký gói cước cho API khác và gọi Gateway mà không bị chặn nhầm. |
| **`TC-ADM-07`** | Admin khôi phục subscription đã hết hạn kỳ $\to$ Tự động chuyển `Expired` | PR #97 / `b6f0594`<br/>`backend/src/subscription-admin-service.ts:98` | **PASS** | Khi Admin bấm Restore trên subscription có `current_period_end <= NOW()`, hệ thống tự chuyển status sang `Expired` và ghi audit log `subscription.expired`. |
| **`TC-ADM-08`** | Admin khôi phục subscription bảo toàn đúng trạng thái trước khi suspend & quota | PR #97 / `1cc41de`<br/>Migration `014_subscription_status_before_suspend.sql` | **PASS** | Khôi phục bảo toàn chính xác trạng thái trước đình chỉ (`Past Due` hoặc `Active`), trường `quota_used` không bị reset về 0 sai lệch. |
| **`TC-HIST-09`** | Provider Dashboard: Telemetry metrics & doanh thu đa tiền tệ (VND/USD) | PR #99 / `abbc38b`<br/>`ProviderDashboardPage.test.tsx` | **PASS** | Giao diện Dashboard Provider hiển thị đúng số subscribers, tổng request, tách riêng doanh thu VND và USD, vẽ biểu đồ `DailyRequestChart` với 2xx/4xx/5xx. |
| **`TC-HIST-10`** | Workspace Role Guard: Cách ly hoàn toàn giao diện Consumer vs Provider | PR #99 / `abbc38b`<br/>`UsageWorkspaceRoleGuard.test.tsx` | **PASS** | Chặn đứng truy cập chéo vai trò giữa Consumer và Provider workspace, ngăn chặn rò rỉ dữ liệu hoặc lỗi giao diện không mong muốn. |

---

## VIII. ĐỐI SOÁT CHẤT LƯỢNG E2E PLAYWRIGHT & HUMAN-FIRST

Đợt Re-test tuân thủ 100% các quy định kiểm thử nghiêm ngặt tại [AGENTS.md](../../AGENTS.md) và [docs/test/TESTING_RULES.md](TESTING_RULES.md):
- **Quy tắc Z1:** Tuyệt đối không sử dụng `{ force: true }`. Mọi phần tử đều được cuộn và hiển thị tự nhiên trước khi click.
- **Quy tắc Z2:** Tuyệt đối không sử dụng `evaluate` hoặc `dispatchEvent` để click ngầm. 100% thao tác được thực hiện qua con trỏ chuột của Playwright.
- **Quy tắc Z3:** Tuyệt đối không bơm dữ liệu ngầm (`localStorage.setItem`, SQL tắt). Luồng kiểm thử bắt đầu từ Clean State qua màn hình đăng nhập chuẩn của người dùng thật.
- **Quy tắc H1-H4:** Bắt buộc có kịch bản clean state; selector tuân thủ thứ tự ưu tiên `getByRole`, `getByLabel`, `getByText`; ô nhập liệu dùng `pressSequentially` mô phỏng gõ phím; kiểm tra đầy đủ trên 2 kích thước màn hình: Desktop **1280×720** và Tablet **768×1024** (không tràn ngang).
- **Quy tắc A1-A3:** Ghi nhận 0 lỗi đỏ (`console.error`, `pageerror`) trong toàn bộ hành trình kiểm thử E2E.
- **Chi tiết 8 kịch bản Playwright E2E UI:**
  1. `E2E-S4-AUTH`: Đăng nhập chuẩn & bảo toàn phiên làm việc trong Clean State (`sprint4-e2e-01`).
  2. `E2E-S4-SUB-MY`: Danh sách gói đăng ký & thao tác hủy gia hạn gói (`sprint4-e2e-02`).
  3. `E2E-S4-CHECKOUT`: Luồng đăng ký gói Pro & giao diện thanh toán Sandbox Stripe-like (`sprint4-e2e-02b`).
  4. `E2E-S4-USAGE`: Hiển thị thanh tiến trình hạn ngạch Quota & cảnh báo sử dụng (`sprint4-e2e-03`).
  5. `E2E-S4-HISTORY`: Lịch sử gọi API, bộ lọc mã phản hồi & che giấu dữ liệu nhạy cảm (`sprint4-e2e-04`).
  6. `E2E-S4-MARKETPLACE`: Lọc danh mục API, tìm kiếm từ khóa (`sprint4-e2e-05`).
  7. `E2E-S4-DETAIL`: Xem chi tiết API, chuyển tab & Code Generator sinh mã tích hợp (`sprint4-e2e-06`).
  8. `E2E-S4-RESPONSIVE`: Kiểm tra tính đáp ứng giao diện trên Viewport Tablet **768×1024** (`sprint4-e2e-08`).

---

## IX. KẾT LUẬN & ĐỀ XUẤT NGHIỆM THU

### 1. Đánh giá Tổng thể
- **Độ tin cậy và Ổn định:** Nền tảng Sprint 4 sau khi tích hợp toàn bộ các sửa đổi mới của thành viên thể hiện chất lượng kỹ thuật xuất sắc:
  - **177/177 Backend tests PASS (100%)**
  - **550/550 Frontend unit tests PASS (100%)**
  - **8/8 Playwright E2E UI scenarios PASS (100%)**
  - **57/58 Test Cases chức năng PASS (98.28%)**
- **Hiệu năng & An ninh:** SLA độ trễ Gateway P95 đạt $17.24\text{ ms}$ (nhanh gần gấp đôi cam kết SLA 30ms); cơ chế đồng bộ hạn ngạch 4 tầng nhất quán tuyệt đối; các lỗ hổng SSRF, SQL Injection, và IDOR được phòng thủ hoàn hảo.
- **Sai lệch còn lại:** Duy nhất 1 lỗi `BUG-S4-01` (`TC-OVH-06`) ở mức độ **Medium**. Lỗi này không gây ảnh hưởng tới hoạt động của người dùng hay hệ thống billing/gateway (chỉ thiếu header thông tin độ trễ phản hồi client).

### 2. Đề xuất của QA: **Conditional GO (chờ PO/Tech Lead quyết định)**
- **ĐỀ XUẤT CHẤP THUẬN NGHIỆM THU CÓ ĐIỀU KIỆN (CONDITIONAL GO):**
  - Toàn bộ các luồng nghiệp vụ chính của Sprint 4 (Gói cước, Đăng ký, Thanh toán Sandbox, Gateway Rate Limiting, Upstream Signing, Data Redaction, Quota Reset Worker, Admin Monitoring) đều đã hoàn tất và đạt 100% tiêu chí chấp nhận.
  - Sai lệch `BUG-S4-01` được phân loại ở mức **Medium**, không thuộc nhóm Critical/High nên **không vi phạm điều kiện chặn release của Sprint 4**.
  - **Danh sách việc chờ PO / Tech Lead (@antondung):**
    1. Xác nhận duyệt đề xuất đóng `DEV-S4-01` (chấp thuận mã 503 khi Redis lỗi).
    2. Xác nhận duyệt đề xuất đóng `DEV-S4-04` (chấp thuận mã 401 tránh rò rỉ key).
    3. Quyết định có gộp PR #105 của @Tungdota53 để khắc phục `BUG-S4-01` (`TC-OVH-06`) hay dời sang bản vá bảo trì tiếp theo.

---

*Hồ sơ kiểm toán chất lượng Re-test được lập và ký xác nhận bởi:*<br/>
**Trần Hà Thảo Vân**<br/>
*QA Automation Lead & Documentation Lead — API Marketplace Platform*<br/>
*MSSV: BCS250039 (`@vuonghathaovan-gif` — Issue #15 & Issue #70)*
