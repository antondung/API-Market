# Kế hoạch Xác định Phạm vi Kiểm thử lại Sprint 4 (Sprint 4 Re-test Scope)

> **Dự án:** API Marketplace Platform  
> **Phiên bản kiểm thử:** Lần test 2 / Re-test Sprint 4  
> **QA Automation Engineer:** Trần Hà Thảo Vân (`@vuonghathaovan-gif` — Issue #15 & #70)  
> **Thời điểm xác lập:** 10/11/2026  
> **Mốc Sprint 4:** 02/11/2026 — 06/11/2026  
> **Commit mốc kiểm thử (Baseline SHA):** `713aedacdd0fdd651d7800185626eea5a85e4388` (PR #101 trên `develop` / PR #102 trên `main` `7f827548772a859737ae417ceef041b6bf193c6f`)  
> **Quy định tuân thủ:** [AGENTS.md](../../AGENTS.md), [docs/test/TESTING_RULES.md](TESTING_RULES.md), [docs/05-quy-trinh-quan-ly-bug.md](../05-quy-trinh-quan-ly-bug.md)

---

## 1. NGUYÊN TẮC XÁC ĐỊNH PHẠM VI (SCOPE BOUNDARIES)

1. **CHỈ test các hạng mục thuộc Sprint 4:**
   - Epic `EP09`: Pricing Plans, Subscriptions & Payment Sandbox (`US-20`, `US-25`).
   - Epic `EP08`: API Gateway Enforcement, Rate Limit, Upstream Signing & Data Redaction (`US-23`, `US-24`).
   - Epic `EP10`: Usage Tracking, Request History & Code Generator (`US-26`, `US-27`).
   - Epic `EP04`: Admin Subscription Monitoring & Operations Worker (`US-28`).
2. **TUYỆT ĐỐI không test hoặc sửa đổi hạng mục Sprint 5 (tuần này):**
   - Loại trừ mọi commit/PR từ sau mốc đóng Sprint 4 (`713aeda`), cụ thể là từ PR #103 trở đi.
3. **Mọi thay đổi không rõ thuộc sprint nào hoặc chưa merge:**
   - Xếp vào nhóm *"Ngoài phạm vi"* và trình User duyệt, không tự ý đưa vào chạy nghiệm thu.

---

## 2. BẢNG PHÂN LOẠI TOÀN BỘ PR & COMMIT TRONG GIAI ĐOẠN SPRINT 4

| STT | Số PR / Commit | Tác giả | Issue | Phân loại | Tên PR / Tóm tắt thay đổi | Tệp thay đổi chính | Chức năng bị ảnh hưởng | Ca kiểm thử (TC) liên quan |
|:---:|---|---|:---:|:---:|---|---|---|---|
| **1** | PR #91<br/>(`a475d35`) | Danh Vo (`@danhbuonsv2-svg`) | #19 | **A** | `feat(db): add Sprint 4 billing and usage schema` | `migrations/009_*.sql`<br/>`migrations/010_*.sql`<br/>`migrations/011_*.sql`<br/>`migrations/012_*.sql`<br/>`migrations/013_*.sql` | DDL cơ sở dữ liệu: bảng subscriptions, payments, transactions, usage_logs, outbox, hàm bảo trì và partition. | `TC-SUB-01` $\to$ `TC-SUB-12`<br/>`TC-GW-06` $\to$ `TC-GW-13`<br/>`TC-HIST-01` $\to$ `TC-HIST-05`<br/>`TC-ADM-01` $\to$ `TC-ADM-06` (Chạy lại dạng Regression) |
| **2** | PR #92<br/>(`8499b47`, `2c8a873`) | Nguyễn Như Tùng Dương (`@Tungdota53`) | #16 | **A** | `feat(backend): hoàn thiện Sprint 4 billing, metered Gateway và usage` | `backend/src/billing-service.ts`<br/>`backend/src/billing-router.ts`<br/>`backend/src/redis-meter.ts`<br/>`backend/src/gateway-service.ts`<br/>`backend/src/safe-proxy.ts`<br/>`backend/src/usage-service.ts` | Backend Core: Kích hoạt gói Free, thanh toán sandbox giả lập thẻ Stripe-like, đếm rate limit & quota Redis Lua nguyên tử, che giấu query/credentials, outbox logging. | `TC-SUB-01` $\to$ `TC-SUB-12`<br/>`TC-GW-01` $\to$ `TC-GW-15`<br/>`TC-RED-01` $\to$ `TC-RED-06`<br/>`TC-OVH-01` $\to$ `TC-OVH-06`<br/>`TC-HIST-01` $\to$ `TC-HIST-05` (Chạy lại dạng Regression) |
| **3** | PR #93<br/>(`dbb4763`, `4cafbd1`, `fe5b194`, `df55db5`) | Nguyễn Như Tùng Dương & Nguyễn Tấn Dũng | #16 | **A** | `feat(operations): Sprint 4 của Dũng — Admin, worker và upstream signing` | `backend/src/subscription-admin-service.ts`<br/>`backend/src/operations-router.ts`<br/>`backend/src/operations-worker.ts`<br/>`backend/src/upstream-signing.ts`<br/>`backend/src/gateway-benchmark.ts` | Vận hành Admin: HMAC-SHA256 upstream signing kèm timestamp/nonce, worker định kỳ quét quá hạn và reset quota (advisory lock), sổ cái admin suspend/restore. | `TC-GW-14`<br/>`TC-ADM-01` $\to$ `TC-ADM-06`<br/>`TC-OVH-01` $\to$ `TC-OVH-05` (Chạy lại dạng Regression) |
| **4** | PR #96<br/>(`1078924`, `4f6059c`, `31811fc`, `e9b5a45`, `2226733`) | Nguyễn Tấn Dũng & Duwn (`@leduwn`) | #18 | **A** | `feat(frontend): complete Sprint 4 billing, usage, history, code generator and provider analytics` | `frontend/src/pages/consumer/MySubscriptionsPage.tsx`<br/>`frontend/src/pages/consumer/UsageQuotaPage.tsx`<br/>`frontend/src/pages/consumer/RequestHistoryPage.tsx`<br/>`frontend/src/utils/apiSnippetGenerator.ts`<br/>`frontend/src/services/billingApi.ts` | Frontend: Đăng ký & checkout sandbox, hiển thị quota/alert 80%-100%, lịch sử request phân trang, sinh code client SDK an toàn chống command injection, render guard isolation. | `E2E-S4-01` $\to$ `E2E-S4-07`<br/>`TC-SUB-01` $\to$ `TC-SUB-06`<br/>`TC-HIST-04` $\to$ `TC-HIST-08` (Chạy lại dạng Regression) |
| **5** | PR #97<br/>(`b6f0594`, `1cc41de`, `de7935f`, `eaad988`) | Nguyễn Tấn Dũng & Nguyễn Như Tùng Dương | #16 | **B** | `Sprint 4: khôi phục subscription, kiểm tra 429/403 và CD staging` | `backend/src/subscription-admin-service.ts`<br/>`migrations/014_subscription_status_before_suspend.sql`<br/>`backend/src/app.ts`<br/>`backend/src/consumer-service.ts`<br/>`backend/integration/operations.test.ts`<br/>`backend/integration/provider-consumer-access.test.ts`<br/>`scripts/staging-api-origin.mjs` | **SỬA ĐỔI MỚI:**<br/>1. Restore subscription bảo toàn đúng trạng thái trước khi suspend (`status_before_suspend`: Active hoặc Past Due).<br/>2. Nếu subscription hết hạn trong lúc suspend (`current_period_end <= NOW()`), khi restore tự động thành `Expired` và ghi audit.<br/>3. RBAC: Provider giữ đầy đủ quyền Consumer (đăng ký API, tạo key, gọi Gateway).<br/>4. Staging origin check. | **BẮT BUỘC CHẠY LẠI & BỔ SUNG TC:**<br/>- `TC-ADM-02`, `TC-SUB-07`, `TC-SUB-08`, `TC-SUB-09`<br/>- Bổ sung `TC-ADM-07` (Restore quá hạn $\to$ Expired)<br/>- Bổ sung `TC-ADM-08` (Restore bảo toàn trạng thái trước đó & quota)<br/>- Bổ sung `TC-SUB-13` / `TC-AUTH-01` (Provider dùng API với quyền Consumer) |
| **6** | PR #98<br/>(`0a9a2dd`) | Nguyễn Tấn Dũng (`@antondung`) | #18 | **B** | `Sửa kẻ báo cáo và đơn vị rate limit theo phút` | `frontend/src/i18n/vi.json`<br/>`frontend/src/i18n/vi-custom.json`<br/>`frontend/src/i18n/rateLimitCopy.test.ts` | **SỬA ĐỔI MỚI:** Sửa nhãn i18n đơn vị rate limit từ "mỗi giây" thành "mỗi phút" cho khớp với window 1 phút của Gateway. | **BẮT BUỘC CHẠY LẠI:**<br/>- `TC-GW-09` (Kiểm tra hiển thị rate limit trên UI)<br/>- `E2E-S4-02` (Consumer Usage Dashboard) |
| **7** | PR #99<br/>(`abbc38b`) | Nguyễn Tấn Dũng (`@antondung`) | #18 | **B** | `feat(frontend): Usage Dashboard, lịch sử request và dashboard Provider` | `frontend/src/components/usage/DailyRequestChart.tsx`<br/>`frontend/src/components/usage/usageQuery.ts`<br/>`frontend/src/components/auth/workspaceRole.ts`<br/>`frontend/src/pages/provider/ProviderDashboardPage.tsx`<br/>`frontend/src/pages/consumer/UsageQuotaPage.tsx`<br/>`frontend/src/pages/consumer/RequestHistoryPage.tsx` | **SỬA ĐỔI MỚI:**<br/>1. Thêm biểu đồ DailyRequestChart hiển thị lượt gọi theo ngày kèm tỷ lệ thành công/lỗi.<br/>2. Lọc lịch sử theo integer API ID, 1 mã status, khoảng ngày và phân trang.<br/>3. Provider Dashboard: subscriber, tổng request, doanh thu tách theo loại tiền VND/USD.<br/>4. Workspace role guard chặn truy cập chéo. | **BẮT BUỘC CHẠY LẠI & BỔ SUNG TC:**<br/>- `TC-HIST-04`, `TC-HIST-05`<br/>- `E2E-S4-02`, `E2E-S4-03`, `E2E-S4-05`<br/>- Bổ sung `TC-HIST-09` (Provider Dashboard Telemetry & Multi-currency Revenue)<br/>- Bổ sung `TC-HIST-10` (Workspace Role Guard Isolation) |
| **8** | PR #100<br/>(`5357c5b`, `8fd90f9`, `33c929f`) | Trần Hà Thảo Vân (`@vuonghathaovan-gif`) | #15, #70 | **A** | `[Sprint 4][QA] Báo cáo Kiểm thử Nghiệm thu Toàn diện & Hồ sơ Sai lệch Kỹ thuật` | `docs/test/Sprint4_TestReport.md`<br/>`docs/test/Sprint4_Traceability.md`<br/>`docs/test/Sprint4_Deviations.md`<br/>`docs/test/Sprint4_Web_Manual_Test_Guide.md` | Tài liệu QA đợt 1 ghi nhận 50/53 PASS, 3 sai lệch kỹ thuật mở (DEV-S4-01, DEV-S4-02, DEV-S4-04). | Tài liệu đối chiếu cho đợt re-test. |
| **9** | PR #101<br/>(`713aeda`) | Nguyễn Tấn Dũng (`@antondung`) | — | **B** | `release: Sprint 4 - Billing, Metered Gateway, Usage, Operations va dong Quality Gate` | Toàn bộ 167 files gộp từ 8 nhánh Sprint 4, commit `122ba09` cập nhật đóng Quality Gate. | Gộp toàn bộ mã nguồn Sprint 4, cập nhật trạng thái đóng 3 sai lệch kỹ thuật. | Toàn bộ 53 Test Cases gốc + 4 Test Cases mới của Nhóm B. |
| **10** | PR #102<br/>(`7f82754`) | Nguyễn Tấn Dũng (`@antondung`) | — | **A** | `release: Sprint 4 (Billing, Metered Gateway, Usage, Operations)` | Merge `develop` (`713aeda`) vào `main` | Cột mốc phát hành chính thức của Sprint 4 vào nhánh `main`. Cùng cây mã nguồn với `713aeda`. | Mốc chốt mã nguồn Sprint 4. |

---

## 3. DANH MỤC CÁC HẠNG MỤC NGOÀI PHẠM VI (OUT OF SCOPE — LOẠI TRỪ)

Tuyệt đối không chạy kiểm thử, không chỉnh sửa mã nguồn, không viết tài liệu nghiệm thu cho các hạng mục sau:

| STT | Số PR / Nhánh / Commit | Trạng thái | Tác giả | Lý do loại trừ |
|:---:|---|:---:|---|---|
| **1** | **PR #103** (`fd022c1`, commit `5c86628`) | MERGED | Nguyễn Tấn Dũng | **Thuộc Sprint 5 (Sprint tuần này):** `feat(ops): Sprint 5 production deploy, backup/restore verification, load test & RC runbooks (#21)`. Merge vào develop sau mốc Sprint 4. |
| **2** | **PR #104** (`feature/24-sprint5-database`) | OPEN | Danh Vo | **Thuộc Sprint 5 (Sprint tuần này):** Thay đổi schema cơ sở dữ liệu cho Sprint 5. |
| **3** | **PR #106** (`codex/sprint5-backend`) | OPEN | Nguyễn Như Tùng Dương | **Thuộc Sprint 5 (Sprint tuần này):** Bàn giao Cost Guard, Analytics và Gateway Sprint 5. |
| **4** | **PR #105** (`codex/sprint4-qa-closeout`) | OPEN | Nguyễn Như Tùng Dương | **Chưa merge vào develop / Cần xin ý kiến User:** Nhánh `codex/sprint4-qa-closeout` được tạo sau khi PR #103 đã merge (kế thừa commit Sprint 5 `fd022c1`), hiện đang OPEN, chưa có quyết định merge từ Tech Lead. Không thuộc mốc release `713aeda` đã duyệt. |

---

## 4. MA TRẬN TEST CASES CHO ĐỢT RE-TEST SPRINT 4

Tổng số Test Cases: **57 Test Cases** (53 TCs gốc Sprint 4 + 4 TCs mới phục vụ các thay đổi nhóm B).

| Nhóm chức năng | Tổng số TC | TCs chạy lại bắt buộc (Nhóm B) | TCs chạy lại hồi quy (Regression - Nhóm A) | TCs MỚI bổ sung |
|---|:---:|---|---|---|
| **EP09: Pricing & Subscriptions** | 13 | `TC-SUB-07`, `TC-SUB-08`, `TC-SUB-09` | `TC-SUB-01` $\to$ `TC-SUB-06`, `TC-SUB-10` $\to$ `TC-SUB-12` | **`TC-SUB-13`**: Provider sử dụng API với tư cách Consumer (giữ trọn vẹn quyền) |
| **EP08: Metered Gateway** | 15 | `TC-GW-09`, `TC-GW-04`, `TC-GW-15` | `TC-GW-01` $\to$ `TC-GW-03`, `TC-GW-05` $\to$ `TC-GW-08`, `TC-GW-10` $\to$ `TC-GW-14` | *(Giữ nguyên 15 TCs gốc, thẩm định lại trạng thái sai lệch DEV-S4-01, DEV-S4-04)* |
| **EP08: Data Redaction** | 6 | — | `TC-RED-01` $\to$ `TC-RED-06` | *(Giữ nguyên 6 TCs gốc)* |
| **EP08: Gateway Overhead** | 6 | `TC-OVH-06` | `TC-OVH-01` $\to$ `TC-OVH-05` | *(Giữ nguyên 6 TCs gốc, thẩm định lại trạng thái sai lệch DEV-S4-02)* |
| **EP10: Usage & History** | 10 | `TC-HIST-04`, `TC-HIST-05` | `TC-HIST-01` $\to$ `TC-HIST-03`, `TC-HIST-06` $\to$ `TC-HIST-08` | **`TC-HIST-09`**: Provider Dashboard hiển thị số liệu telemetry và doanh thu đa tiền tệ (VND/USD)<br/>**`TC-HIST-10`**: Workspace Role Guard chặn truy cập chéo vai trò |
| **EP04: Admin Operations** | 7 | `TC-ADM-02` | `TC-ADM-01`, `TC-ADM-03` $\to$ `TC-ADM-06` | **`TC-ADM-07`**: Admin khôi phục subscription đã hết hạn kỳ $\to$ tự động chuyển `Expired`<br/>**`TC-ADM-08`**: Admin khôi phục bảo toàn đúng trạng thái trước khi suspend (Active / Past Due) và giữ nguyên quota |
| **TỔNG CỘNG** | **57** | **11 TCs** | **42 TCs** | **4 TCs MỚI** |
