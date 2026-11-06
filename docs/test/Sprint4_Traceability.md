# Ma trận Truy vết Kiểm thử Sprint 4 (Sprint 4 Test Traceability Matrix)

**Dự án:** API-Market Platform
**QA Lead:** Tran Ha Thao Van (@vuonghathaovan-gif)
**Ngày lập:** 2026-11-05
**Quy chuẩn áp dụng:** ISO/IEC/IEEE 29119 Software Testing & Ian Sommerville Software Engineering
**Tổng số Test Cases:** 53 Test Cases

---

## 1. BẢNG TRUY VẾT 53 TEST CASES VÀ BẰNG CHỨNG MẠNH NHẤT

| TC | Bằng chứng mạnh nhất (file:dòng, tên test) | Loại |
|:---|:---|:---:|
| **[SUB-01]** | `backend/integration/billing.test.ts:316` (`billing free activation, paid snapshot, failed payment and owner isolation`) | Integration test |
| **[SUB-02]** | `backend/integration/operations.test.ts:370` (`Marketplace → Paid subscribe → sandbox settlement → key → signed HTTP upstream → durable usage`) | Integration test |
| **[SUB-03]** | `backend/integration/billing.test.ts:316` (`billing free activation, paid snapshot, failed payment and owner isolation`) | Integration test |
| **[SUB-04]** | `backend/integration/billing.test.ts:358` (`immediate cancellation cannot reset consumed quota within the same API period`) | Integration test |
| **[SUB-05]** | `backend/integration/sprint4-database.test.ts:37` (`Sprint 4 billing is idempotent and keeps plan/payment relations consistent`) | Integration test |
| **[SUB-06]** | `backend/integration/billing.test.ts:180` (`billing cancel at period end maintains active until expired`) | Integration test |
| **[SUB-07]** | `backend/integration/operations.test.ts:285` (`Worker expires elapsed periods, resets valid quota only once...`) | Integration test |
| **[SUB-08]** | `backend/integration/operations.test.ts:200` (`Admin subscription/payment ledger enforces JWT/RBAC... immediate suspend/revoke`) | Integration test |
| **[SUB-09]** | `backend/integration/operations.test.ts:204` (`Admin restore restores Suspended to Active without changing quota`) | Integration test |
| **[SUB-10]** | `backend/integration/gateway-metered.test.ts:40` (`Gateway requires subscription, serializes last quota request, persists redacted usage`) | Integration test |
| **[SUB-11]** | `backend/integration/sprint4-database.test.ts:48` (`trg_subscriptions_validate blocks mismatch api_id with 23514`) | Integration test |
| **[SUB-12]** | `backend/integration/billing.test.ts:70` (`checkout and settlement are concurrent-safe, shape-bound and preserve consumed quota on plan change`) | Integration test |
| **[GW-01]** | `backend/integration/gateway.test.ts:80` (`rejects a missing, malformed or revoked API key`) | Integration test |
| **[GW-02]** | `backend/integration/gateway.test.ts:80` (`rejects a missing, malformed or revoked API key`) | Integration test |
| **[GW-03]** | `backend/integration/operations.test.ts:455` (`revoked API key immediately receives 401`) | Integration test |
| **[GW-04]** | `qa-scripts/test-runtime-gaps.cjs:205` (Key API 3 gọi sang route API 7: trả về 401 INVALID_API_KEY thay vì API_KEY_SCOPE_MISMATCH — Tham chiếu DEV-S4-04) | Integration test |
| **[GW-05]** | `qa-scripts/test-runtime-gaps.cjs:48` (Bắn HTTP thật qua Gateway với payload SQLi `' OR '1'='1'--` trả về 401, không crash 500) | Integration test |
| **[GW-06]** | `backend/integration/gateway-metered.test.ts:35` (`Gateway requires subscription and denies calls without active entitlement`) | Integration test |
| **[GW-07]** | `backend/integration/operations.test.ts:445` (`Suspended subscription blocked with 403 SUBSCRIPTION_SUSPENDED`) | Integration test |
| **[GW-08]** | `backend/integration/gateway.test.ts:135` (`stops serving once the API is no longer Published`) | Integration test |
| **[GW-09]** | `backend/integration/consumer.test.ts:210` (`sandbox consumption is atomic and expires after trial grant limit`) | Integration test |
| **[GW-10]** | `backend/integration/gateway-metered.test.ts:85` (`Gateway rate limit does not consume quota and smooths within window`) | Integration test |
| **[GW-11]** | `backend/integration/gateway-metered.test.ts:95` (`Gateway bursts beyond rate limit receive 429 RATE_LIMITED with Retry-After`) | Integration test |
| **[GW-12]** | `backend/integration/gateway-metered.test.ts:110` (`Gateway monthly quota limit reached rejects with 429/403 QUOTA_EXCEEDED`) | Integration test |
| **[GW-13]** | `backend/test/redis-meter.test.ts:35` (`Redis atomic last quota slot, rate gate, eviction floor and fail-closed`) | Unit test |
| **[GW-14]** | `backend/test/upstream-signing.test.ts:15` (`upstream HMAC binds method, origin, path/query, body, timestamp and nonce; denies direct/replayed requests`) | Unit test |
| **[GW-15]** | `backend/test/redis-meter.test.ts:60` (`Redis stalled response fails closed`) — Thiếu mã `RATE_LIMIT_UNAVAILABLE` (Tham chiếu DEV-S4-01) | FAIL |
| **[RED-01]** | `qa-scripts/test-runtime-gaps.cjs:80` (Quét `to_jsonb(u)::text` trên `usage_logs`, `audit_logs`, `usage_outbox` tìm raw key và `ak_live_` ghi nhận đúng 0 dòng) | Integration test |
| **[RED-02]** | `backend/test/auth.test.ts:77` (`logs do not contain passwords, tokens, authorization, cookies or query values`) | Unit test |
| **[RED-03]** | `backend/integration/gateway.test.ts:65` (`strips caller credentials and internal headers before forwarding`) | Integration test |
| **[RED-04]** | `backend/test/safe-proxy.test.ts:40` (`proxy preserves upstream errors as responses and bounds content-length and binary bodies`) | Unit test |
| **[RED-05]** | `backend/test/safe-proxy.test.ts:85` (`proxy never follows redirects and enforces timeout and response size`) | Unit test |
| **[RED-06]** | `backend/integration/sprint4-database.test.ts:68` (`Usage partitions, safe history, aggregates and maintenance reconcile exactly - checks request_history columns`) | Integration test |
| **[OVH-01]** | `backend/integration/gateway-metered.test.ts:125` (`gateway_overhead_ms check constraint enforcement >= 0`) | Integration test |
| **[OVH-02]** | `backend/src/gateway-benchmark.ts:18` (`Gateway application path, real PostgreSQL + Redis, upstream fixture 2ms`) | Integration test |
| **[OVH-03]** | `backend/integration/gateway.test.ts:175` (`HTTP Playground counts an upstream timeout once and retains quota`) | Integration test |
| **[OVH-04]** | `backend/integration/gateway.test.ts:160` (`proxy preserves upstream errors as responses without throwing`) | Integration test |
| **[OVH-05]** | `qa-scripts/test-runtime-gaps.cjs:140` & `npm run benchmark:gateway` (Đo P95 thực tế qua 100 mẫu: App P95 = 18.47ms, Stored P95 = 16ms < 30ms SLA) | Integration test |
| **[OVH-06]** | `backend/src/gateway-router.ts:28,48` (Gateway hoàn toàn thiếu header X-Gateway-Overhead-Ms trả về client, chỉ lưu nội bộ DB — Tham chiếu DEV-S4-02) | FAIL |
| **[HIST-01]** | `backend/integration/usage.test.ts:182` (`f.analytics.history owner returns 1, other user returns 0`) | Integration test |
| **[HIST-02]** | `backend/integration/usage.test.ts:190` (`f.analytics.overview other user returns empty revenue`) | Integration test |
| **[HIST-03]** | `frontend/src/pages/requests/RequestHistoryPage.test.tsx:45` (`renders pagination, status filters and badges`) | Vitest |
| **[HIST-04]** | `qa-scripts/test-cross-verification-4tier.cjs:16` (`runCrossVerification 4-tier live test: Redis -> DB -> View -> UI`) | Integration test |
| **[HIST-05]** | `frontend/src/pages/provider/AnalyticsHealthPage.test.tsx:50` (`renders provider analytics cards and multi-currency revenue`) | Vitest |
| **[HIST-06]** | `frontend/src/utils/apiSnippetGenerator.test.ts:157` (`generateCurlSnippet with safe POSIX shell escaping`) | Vitest |
| **[HIST-07]** | `frontend/src/utils/apiSnippetGenerator.test.ts:269` (`generateFetchSnippet with async/await and try/catch`) | Vitest |
| **[HIST-08]** | `frontend/src/utils/apiSnippetGenerator.test.ts:299` (`generatePythonSnippet with raise_for_status`) | Vitest |
| **[ADM-01]** | `backend/integration/operations.test.ts:185` (`Admin subscription/payment ledger enforces JWT/RBAC, strict filters`) | Integration test |
| **[ADM-02]** | `backend/integration/operations.test.ts:262` (`Admin audit log verification on suspend and restore`) | Integration test |
| **[ADM-03]** | `backend/integration/operations.test.ts:285` (`Worker expires elapsed periods, resets valid quota only once`) | Integration test |
| **[ADM-04]** | `backend/integration/operations.test.ts:295` (`Worker resets valid quota only once, serializes replicas`) | Integration test |
| **[ADM-05]** | `backend/integration/operations.test.ts:310` (`advisory lock prevents concurrent replica maintenance runs`) | Integration test |
| **[ADM-06]** | `backend/integration/sprint4-database.test.ts:75` (`ensure_usage_log_partition creates future tables`) | Integration test |

---

## 2. TỔNG KẾT PHÂN LOẠI BẰNG CHỨNG (SUMMARY BY TEST TYPE)

| Phân loại bằng chứng | Số lượng TC | Tỷ lệ (%) | Đánh giá độ tin cậy |
|---|:---:|:---:|---|
| **Integration test** (Chạy với DB/Redis/Gateway thật) | **40** | 75.5% | Rất cao (Bao gồm GW-05, RED-01, OVH-05 đo runtime thật) |
| **Unit test** (Chạy độc lập logic Backend/Meter/Proxy) | **4** | 7.5% | Cao (Kiểm tra logic biên) |
| **Vitest** (Frontend Component & Utility tests) | **6** | 11.3% | Cao (Kiểm tra UI và Code Gen) |
| **FAIL (Sai lệch kỹ thuật theo dõi qua DEV-S4)** | **3** | 5.7% | Chưa đạt (DEV-S4-01 tại GW-15, DEV-S4-02 tại OVH-06, DEV-S4-04 tại GW-04) |
| **Chưa có bằng chứng (NOT RUN)** | **0** | 0.0% | — |
| **TỔNG CỘNG** | **53** | **100.0%** | **ĐẠT CHUẨN TRUY VẾT** |

---

## 3. DANH SÁCH TEST CASE CÓ SAI LỆCH KỸ THUẬT VÀ ĐỀ XUẤT XỬ LÝ

Theo quy định quản lý chất lượng, các Test Case này được ghi nhận sai lệch kỹ thuật mở để đội ngũ dự án thống nhất phương án xử lý:

### 1. `[GW-04]` — Chặn 401 Unauthorized: Key hợp lệ nhưng sai phạm vi API (Scope Mismatch)
- **Hiện trạng:** **Sai lệch kỹ thuật (Deviation DEV-S4-04).** Backend `consumer-service.ts:113` thực hiện `WHERE k.key_hash=$1 AND k.api_id=$2`. Khi caller dùng key của API A gọi sang route API B, kết quả truy vấn rỗng và hệ thống trả về mã lỗi chung `401 INVALID_API_KEY` chứ không có mã lỗi riêng `API_KEY_SCOPE_MISMATCH` như đặc tả AC-S4-06 dòng 176.
- **Đề xuất hướng xử lý:** Chi tiết theo dõi tại `DEV-S4-04` (Nhóm lựa chọn: A sửa code backend để phân tách mã lỗi; hoặc B điều chỉnh AC và TC giữ mã `INVALID_API_KEY` theo khuyến nghị bảo mật OWASP).

### 2. `[GW-15]` — Fail-Closed policy on Redis failure (503 RATE_LIMIT / QUOTA_UNAVAILABLE)
- **Hiện trạng:** **Sai lệch kỹ thuật (Deviation DEV-S4-01).** Khi Redis gặp sự cố (timeout/stalled), Gateway áp dụng Fail-Closed từ chối với HTTP 503 `QUOTA_UNAVAILABLE` cho cả Rate Limit và Quota (do gộp chung 1 Lua script tại `redis-meter.ts:59-84`); mã `RATE_LIMIT_UNAVAILABLE` chưa có trong code.
- **Đề xuất hướng xử lý:** Chi tiết theo dõi tại `DEV-S4-01` (Nhóm lựa chọn: A sửa code backend để phân tách mã lỗi; hoặc B chuẩn hóa AC và Runbook theo thiết kế Lua script gộp).

### 3. `[OVH-06]` — Latency and overhead response headers for client inspection
- **Hiện trạng:** **Sai lệch kỹ thuật (Deviation DEV-S4-02).** Mã nguồn Gateway (`gateway-router.ts`, `gateway-service.ts`, `safe-proxy.ts`) không gán header `X-Gateway-Overhead-Ms` hay `X-Response-Time` vào response trả về cho client. Chỉ số overhead chỉ được lưu nội bộ trong DB `usage_logs`.
- **Đề xuất hướng xử lý:** Chi tiết theo dõi tại `DEV-S4-02` (Nhóm lựa chọn: A bổ sung header vào Gateway; B điều chỉnh AC và TC thành chỉ lưu nội bộ DB; hoặc C điều chỉnh TC thành Optional theo AC-S4-17).

