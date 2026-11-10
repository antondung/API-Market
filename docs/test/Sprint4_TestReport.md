# Báo cáo Kiểm thử Sprint 4 — Nghiệm thu Tích hợp & Kiểm toán Chất lượng (Comprehensive QA Audit)

> **Dự án:** API Marketplace Platform  
> **Phiên bản:** Lần test 2 / Re-test Sprint 4 (10/11/2026)  
> **Giai đoạn:** Sprint 4 — Gói cước (Pricing Plans), Đăng ký (Subscriptions), Thanh toán Sandbox (Stripe-like), API Gateway Định tuyến & Hạn ngạch (Quota/Rate Limit), Ký Upstream HMAC & Che giấu Dữ liệu (Sensitive Data Redaction), Đo lường Độ trễ Overhead, Lịch sử Gọi API (Request History), Sinh mã Tích hợp (Code Generator), Giám sát Admin & Worker Tự động.  
> **QA Lead & Tác giả:** Trần Hà Thảo Vân (MSSV: BCS250039, `@vuonghathaovan-gif` — Issue #15 & Issue #70)  
> **Thời điểm thực hiện re-test:** 10/11/2026  
> **Cột mốc kiểm thử (Baseline SHA):** `713aedacdd0fdd651d7800185626eea5a85e4388` (PR #101 trên `develop` / PR #102 trên `main` `7f827548772a859737ae417ceef041b6bf193c6f`)  
> **Nhánh thực thi:** `test/15-sprint4-retest` (khởi tạo từ mốc đóng Sprint 4 `713aeda`)  
> **Quyết định nghiệm thu:** **[x] CONDITIONAL GO / CONDITIONAL PASS — 57/58 Test Cases ĐẠT (98.28%), 1/58 CHƯA ĐẠT (1.72% do BUG-S4-01 tại TC-OVH-06 mức độ Medium, không chặn luồng nghiệp vụ); 177/177 Tests Backend PASS (100%), 550/550 Unit Tests Frontend PASS (100%), 7/7 Playwright E2E UI Scenarios PASS (100%), 0 SKIPPED, 0 BLOCKED.**

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
| **Số ca kiểm thử ĐẠT (PASS)** | 50 TCs (94.34%) | **57 TCs (98.28%)** | **+7 TCs PASS** (Đóng DEV-S4-01, DEV-S4-04 và đạt 5 TCs mới) |
| **Số ca kiểm thử CHƯA ĐẠT (FAIL)** | 3 TCs (5.66%) | **1 TC (1.72%)** | **Giảm 2 lỗi**: Chỉ còn duy nhất `BUG-S4-01` (`TC-OVH-06`) |
| **Số ca Skipped / Blocked** | 0 | **0** | Không có test nào bị bỏ qua hoặc lách luồng |
| **Backend Integration Tests** | 168/168 tests PASS | **177/177 tests PASS** | **+9 tests backend** (`provider-consumer-access`, `operations`) |
| **Frontend Unit Vitest** | 530/530 tests PASS (42 files) | **550/550 tests PASS (47 files)** | **+20 tests frontend** (`DailyRequestChart`, `workspaceRole`, v.v.) |
| **Playwright Human-First E2E** | 7/7 scenarios PASS | **7/7 scenarios PASS** | Duy trì 100% pass với Chromium thật, 0 console error |
| **SLA Benchmark Gateway P95** | 16.91 ms (Application P95) | **17.24 ms (Application P95)** | Thỏa mãn xuất sắc cam kết SLA < 30ms (Stored P95 = 15.00 ms) |
| **Đối soát chéo 4 tầng (`HIST-04`)** | 100% PASS | **100% PASS** | Đồng bộ tuyệt đối: Request $\to$ Redis $\to$ DB $\to$ View $\to$ UI |
| **Quyết định chất lượng** | CONDITIONAL PASS / BLOCKED | **CONDITIONAL GO / CONDITIONAL PASS** | **Đủ điều kiện bàn giao** (Lỗi còn lại là non-blocking Medium) |

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
| **8** | **Playwright Human-First E2E** | `node qa-scripts/sprint4-ui-e2e-runner.cjs` | 33.2s | 0 | **PASS** | **7/7 scenarios passed (100%)** trên Chromium thật, 0 console error, viewports 1280x720 & 768x1024 đạt chuẩn. |

---

## IV. BÁO CÁO CHI TIẾT TÌNH TRẠNG 3 SAI LỆCH CŨ TỪ LẦN TEST 1

### 1. DEV-S4-01: Mã lỗi Fail-Closed khi sự cố Redis (`TC-GW-15`) $\to$ **ĐÃ ĐÓNG (CLOSED)**
- **Tình trạng lần test 1:** FAIL. Khi Redis sập/timeout, Gateway trả `503 QUOTA_UNAVAILABLE` cho cả Rate Limit và Quota (thiếu mã riêng `RATE_LIMIT_UNAVAILABLE`).
- **Thẩm định đợt Re-test:** **ĐẠT (PASS)**.
  - Sau khi rà soát kiến trúc hệ thống, Tech Lead và nhóm phát triển đã chuẩn hóa: Để bảo đảm chỉ tiêu cam kết độ trễ SLA P95 < 30ms, Gateway bắt buộc phải gộp Rate Limit trượt và Quota tháng vào **1 Lua script nguyên tử duy nhất trên Redis** (giảm 50% số lượt round-trip qua mạng).
  - Khi Redis gặp sự cố, hệ thống áp dụng cơ chế Fail-Closed an toàn và trả về mã lỗi chuẩn `503 QUOTA_UNAVAILABLE`.
  - Tài liệu `AcceptanceCriteria.md` và `Runbook` đã được chuẩn hóa đồng bộ tại commit `122ba09`. Ca kiểm thử `TC-GW-15` được ký duyệt PASS.

### 2. DEV-S4-04: Mã lỗi khi API Key sai phạm vi API (`TC-GW-04`) $\to$ **ĐÃ ĐÓNG (CLOSED)**
- **Tình trạng lần test 1:** FAIL. Caller dùng key hợp lệ của API A gọi sang API B, backend trả về `401 INVALID_API_KEY` thay vì mã riêng `API_KEY_SCOPE_MISMATCH`.
- **Thẩm định đợt Re-test:** **ĐẠT (PASS)**.
  - Đội ngũ kỹ thuật đã thẩm định theo **Khuyến nghị An ninh Thông tin OWASP API Security Project**: Việc trả về mã lỗi riêng biệt `API_KEY_SCOPE_MISMATCH` tạo ra lỗ hổng rò rỉ thông tin (Information Leakage / Key Oracle), cho phép kẻ tấn công dò quét xem một API Key có tồn tại trên bất kỳ API nào khác trong sàn hay không.
  - Do đó, việc trả về mã lỗi chung `401 INVALID_API_KEY` cho mọi trường hợp key không hợp lệ với API hiện tại là phương án bảo mật tối ưu và đúng tiêu chuẩn quốc tế. Sai lệch `DEV-S4-04` chính thức đóng.

### 3. DEV-S4-02: Header đo lường độ trễ phía Client (`TC-OVH-06`) $\to$ **CHƯA ĐẠT (XÁC NHẬN BUG-S4-01)**
- **Tình trạng lần test 1:** FAIL. Gateway không trả header `X-Gateway-Overhead-Ms` ra client.
- **Thẩm định đợt Re-test:** **CHƯA ĐẠT (FAIL)**.
  - Mặc dù phụ lục cập nhật ngày 06/11/2026 (commit `122ba09`) có ghi nhận: *"DEV-S4-02 sửa bằng code (Gateway trả x-gateway-overhead-ms trên mọi response)"*, nhưng qua kiểm tra mã nguồn thực tế tại mốc release `713aeda`, router `backend/src/gateway-service.ts` và `safe-proxy.ts` **hoàn toàn không có lệnh gán header `res.setHeader('x-gateway-overhead-ms', ...)`**.
  - Chỉ số overhead thực tế chỉ được lưu nội bộ vào cơ sở dữ liệu (`usage_outbox` và `usage_logs`).
  - Lỗi này cũng đã được thành viên Tùng Nguyễn (`@Tungdota53`) kiểm chứng độc lập và mở Pull Request sửa lỗi #105 vào ngày 09/11/2026. Tuy nhiên, do PR #105 chưa được merge vào nhánh chính thức của Sprint 4 (`713aeda`), lỗi này được QA ghi nhận thành Bug chính thức dưới đây.

---

## V. BÁO CÁO LỖI CHÍNH THỨC (BUG REPORT) THEO QUY TRÌNH QUẢN LÝ BUG

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
- **Bằng chứng kiểm tra:** Kiểm tra mã nguồn `Select-String -Path "backend/src/*gateway*.ts" -Pattern "x-gateway-overhead-ms"` cho kết quả 0 dòng code.
```

---

## VI. NGHIỆM THU 5 CA KIỂM THỬ MỚI BỔ SUNG CHO NHÓM B

| Mã TC | Tên ca kiểm thử | Căn cứ kỹ thuật (PR / Commit) | Kết quả thực nghiệm | Bằng chứng xác minh |
|:---:|---|---|:---:|---|
| **`TC-SUB-13`** | Provider accounts retain full Consumer capabilities (Subscribe & consume) | PR #97 / `de7935f`<br/>`provider-consumer-access.test.ts` | **PASS** | 432 dòng integration tests xác thực tài khoản Provider có thể tự tạo key, đăng ký gói cước cho API khác và gọi Gateway mà không bị chặn nhầm. |
| **`TC-ADM-07`** | Admin khôi phục subscription đã hết hạn kỳ $\to$ Tự động chuyển `Expired` | PR #97 / `b6f0594`<br/>`backend/src/subscription-admin-service.ts:98` | **PASS** | Khi Admin bấm Restore trên subscription có `current_period_end <= NOW()`, hệ thống tự chuyển status sang `Expired` và ghi audit log `subscription.expired`. |
| **`TC-ADM-08`** | Admin khôi phục subscription bảo toàn đúng trạng thái trước khi suspend & quota | PR #97 / `1cc41de`<br/>Migration `014_subscription_status_before_suspend.sql` | **PASS** | Khôi phục bảo toàn chính xác trạng thái trước đình chỉ (`Past Due` hoặc `Active`), trường `quota_used` không bị reset về 0 sai lệch. |
| **`TC-HIST-09`** | Provider Dashboard: Telemetry metrics & doanh thu đa tiền tệ (VND/USD) | PR #99 / `abbc38b`<br/>`ProviderDashboardPage.test.tsx` | **PASS** | Giao diện Dashboard Provider hiển thị đúng số subscribers, tổng request, tách riêng doanh thu VND và USD, vẽ biểu đồ `DailyRequestChart` với 2xx/4xx/5xx. |
| **`TC-HIST-10`** | Workspace Role Guard: Cách ly hoàn toàn giao diện Consumer vs Provider | PR #99 / `abbc38b`<br/>`UsageWorkspaceRoleGuard.test.tsx` | **PASS** | Chặn đứng truy cập chéo vai trò giữa Consumer và Provider workspace, ngăn chặn rò rỉ dữ liệu hoặc lỗi giao diện không mong muốn. |

---

## VII. ĐỐI SOÁT CHẤT LƯỢNG E2E PLAYWRIGHT & HUMAN-FIRST

Đợt Re-test tuân thủ 100% các quy định kiểm thử nghiêm ngặt tại [AGENTS.md](../../AGENTS.md) và [docs/test/TESTING_RULES.md](TESTING_RULES.md):
- **Quy tắc Z1:** Tuyệt đối không sử dụng `{ force: true }`. Mọi phần tử đều được cuộn và hiển thị tự nhiên trước khi click.
- **Quy tắc Z2:** Tuyệt đối không sử dụng `evaluate` hoặc `dispatchEvent` để click ngầm. 100% thao tác được thực hiện qua con trỏ chuột của Playwright.
- **Quy tắc Z3:** Tuyệt đối không bơm dữ liệu ngầm (`localStorage.setItem`, SQL tắt). Luồng kiểm thử bắt đầu từ Clean State qua màn hình đăng nhập chuẩn của người dùng thật.
- **Quy tắc H1-H4:** Bắt buộc có kịch bản clean state; selector tuân thủ thứ tự ưu tiên `getByRole`, `getByLabel`, `getByText`; ô nhập liệu dùng `pressSequentially` mô phỏng gõ phím; kiểm tra đầy đủ trên 2 kích thước màn hình: Desktop **1280×720** và Tablet **768×1024** (không tràn ngang).
- **Quy tắc A1-A3:** Ghi nhận 0 lỗi đỏ (`console.error`, `pageerror`) trong toàn bộ hành trình kiểm thử E2E.
- **Xử lý Flaky:** Lần chạy đầu tiên gặp hiện tượng timeout khởi động lạnh (cold-start) của máy chủ Vite preview (30s). Tiến hành chạy lại lần 2 sau khi server đã sẵn sàng $\to$ **7/7 kịch bản PASS 100%**.

---

## VIII. KẾT LUẬN & QUYẾT ĐỊNH NGHIỆM THU (GO / NO-GO)

### 1. Đánh giá Tổng thể
- **Độ tin cậy và Ổn định:** Nền tảng Sprint 4 sau khi tích hợp toàn bộ các sửa đổi mới của thành viên thể hiện chất lượng kỹ thuật xuất sắc:
  - **177/177 Backend tests PASS (100%)**
  - **550/550 Frontend unit tests PASS (100%)**
  - **7/7 Playwright E2E UI scenarios PASS (100%)**
  - **57/58 Test Cases chức năng PASS (98.28%)**
- **Hiệu năng & An ninh:** SLA độ trễ Gateway P95 đạt $17.24\text{ ms}$ (nhanh gần gấp đôi cam kết SLA 30ms); cơ chế đồng bộ hạn ngạch 4 tầng nhất quán tuyệt đối; các lỗ hổng SSRF, SQL Injection, và IDOR được phòng thủ hoàn hảo.
- **Sai lệch còn lại:** Duy nhất 1 lỗi `BUG-S4-01` (`TC-OVH-06`) ở mức độ **Medium**. Lỗi này không gây ảnh hưởng tới hoạt động của người dùng hay hệ thống billing/gateway (chỉ thiếu header thông tin độ trễ phản hồi client).

### 2. Quyết định Nghiệm thu: **CONDITIONAL GO / CONDITIONAL PASS**
- **CHẤP THUẬN NGHIỆM THU CÓ ĐIỀU KIỆN (CONDITIONAL GO):**
  - Toàn bộ các luồng nghiệp vụ chính của Sprint 4 (Gói cước, Đăng ký, Thanh toán Sandbox, Gateway Rate Limiting, Upstream Signing, Data Redaction, Quota Reset Worker, Admin Monitoring) đều đã hoàn tất và đạt 100% tiêu chí chấp nhận.
  - Sai lệch `BUG-S4-01` được phân loại ở mức **Medium**, không thuộc nhóm Critical/High nên **không vi phạm điều kiện chặn release của Sprint 4**.
  - Đề xuất: Ban dự án có thể tiến hành gộp PR #105 (hoặc đưa vào bản vá bảo trì kế tiếp) để bổ sung header `X-Gateway-Overhead-Ms` trả về cho client mà không làm ảnh hưởng tới tiến độ chung.

---

*Hồ sơ kiểm toán chất lượng Re-test được lập và ký xác nhận bởi:*<br/>
**Trần Hà Thảo Vân**<br/>
*QA Automation Lead & Documentation Lead — API Marketplace Platform*<br/>
*MSSV: BCS250039 (`@vuonghathaovan-gif` — Issue #15 & Issue #70)*
