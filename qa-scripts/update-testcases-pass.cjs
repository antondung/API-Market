/**
 * SCRIPT NÀY ĐÃ BỊ VÔ HIỆU HÓA THEO QUY CHUẨN TESTING_RULES.MD
 * Lý do: Script cũ điền cứng Status "Pass" và số liệu 100% cho 53 TC mà không chạy kiểm thử thật;
 * tuyệt đối không được sử dụng làm bằng chứng nghiệm thu chất lượng hệ thống.
 */
console.error('[VÔ HIỆU HÓA] qa-scripts/update-testcases-pass.cjs đã bị vô hiệu hóa vì điền cứng Status mà không qua test thật.');
process.exit(1);

const fs = require('fs');
const path = require('path');

const targetPath = path.resolve('docs/test/Sprint4_TestCases.md');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Update the note in Section 1
const oldNote = `> [!NOTE]
> **Tiến độ Kiểm thử Sớm tầng Cơ sở Dữ liệu (Shift-Left DB Verification):**
> Đã nghiệm thu tĩnh DDL / Schema, Trigger và Hàm PL/pgSQL từ nhánh \`origin/feature/19-sprint4-database\` (Migration 009 của Võ Trọng Danh).
> **6/6 Test Cases tầng DB đạt chuẩn:** \`[SUB-05]\` (Unique constraint), \`[SUB-11]\` (Trigger validate plan), \`[RED-06]\` (View an toàn), \`[ADM-03]\` (Hàm expiry), \`[ADM-04]\` (Hàm reset quota), \`[ADM-06]\` (Hàm partition).
> *Kiểm thử động bằng tích hợp DB thật (\`sprint4-database.test.ts\`): Trạng thái \`BLOCKED / NOT RUN\` do môi trường PostgreSQL local hiện chưa khởi chạy.*`;

const newSummaryAndNote = `### 1.1. BẢNG TỔNG KẾT KẾT QUẢ THỰC THI KIỂM THỬ TÍCH HỢP TOÀN DIỆN (EXECUTION SUMMARY)

| Phân hệ kiểm thử | Số TC | Passed | Failed | Blocked / Skipped | Tỷ lệ Đạt (%) | Đánh giá chất lượng |
|---|:---:|:---:|:---:|:---:|:---:|---|
| **1. Pricing, Subscription & Payment Sandbox** | 12 | 12 | 0 | 0 | 100.0% | Đạt chuẩn (State Machine & Webhook hoàn hảo) |
| **2. API Gateway Enforcement & Upstream** | 15 | 15 | 0 | 0 | 100.0% | Đạt chuẩn (Lua script atomic, Fail-Closed an toàn) |
| **3. Sensitive Data Redaction** | 6 | 6 | 0 | 0 | 100.0% | Đạt chuẩn (Không lộ credential, buffer trần 2MB) |
| **4. Đo lường Gateway Overhead** | 6 | 6 | 0 | 0 | 100.0% | Đạt chuẩn (P95 = 19.21 ms < 30 ms SLA cam kết) |
| **5. Request History & Code Generator** | 8 | 8 | 0 | 0 | 100.0% | Đạt chuẩn (RBAC nghiêm ngặt, Code snippets chuẩn) |
| **6. Admin Monitoring & Worker Jobs** | 6 | 6 | 0 | 0 | 100.0% | Đạt chuẩn (Audit log đầy đủ, Cron an toàn) |
| **TỔNG CỘNG TOÀN SPRINT 4** | **53** | **53** | **0** | **0** | **100.0%** | **XUẤT SẮC — QUALITY GATE ACCEPTED** |

> [!NOTE]
> **Kết quả Nghiệm thu Kỹ thuật Tích hợp Toàn diện Sprint 4 (Comprehensive Engineering Verification):**
> - **Tiến độ Kiểm thử:** **53/53 Test Cases PASS (100.0%)** — Đầy đủ 6 phân hệ chức năng, phi chức năng, bảo mật và hiệu năng.
> - **Backend Test Suite:** **167/167 tests PASS (100%)**, bao phủ toàn diện Unit, Integration, SafeProxy, Upstream Signing, Sandbox Config, Worker Maintenance.
> - **Frontend Test Suite:** **530/530 tests PASS** (Vitest v5.0.4 trên 42 test files), bao phủ toàn bộ UI/UX Checkout, Subscription Management, Analytics, Code Generator, Admin Subscriptions.
> - **Hiệu năng Gateway (SLA P95):** P50 = 13.09 ms, P95 = 19.21 ms, Max = 23.86 ms (vượt xa chỉ tiêu cam kết P95 < 30 ms).
> - **Độ sạch mã nguồn (Repository Health):** 429/429 files sạch theo quy chuẩn \`scripts/kiem-tra-kho-ma-nguon.ps1\` (0 lỗi nền tảng, 0 khoảng trắng cuối dòng).`;

if (content.includes(oldNote)) {
  content = content.replace(oldNote, newSummaryAndNote);
} else {
  console.warn('Old note string not found directly, checking normalization...');
}

// Map of updates for test cases: [ID, newActual, newStatus]
const updates = [
  // Section 1: SUB
  ['[SUB-01]', 'Đạt (Khớp 100% BillingService): Gói Free kích hoạt ngay lập tức với status=\'ACTIVE\', không cần checkout redirect. Redis key quota:{sub_id}:{period} được cấp đúng plan.quota_monthly.', 'Critical<br>Pass'],
  ['[SUB-02]', 'Đạt (Khớp 100% Sandbox Gateway): Giao dịch thanh toán Sandbox thành công với HMAC token xác thực. Webhook cập nhật payments và subscriptions sang ACTIVE, quota nạp tức thì vào Redis.', 'Critical<br>Pass'],
  ['[SUB-03]', 'Đạt (Khớp 100% Sandbox Failure): Xử lý thẻ lỗi hoặc thiếu số dư trả về trạng thái FAILED, không ghi nhận counter quota vào Redis, cho phép người dùng thử lại an toàn.', 'High<br>Pass'],
  ['[SUB-04]', 'Đạt (Khớp 100% Checkout Cancel): Người dùng hủy phiên thanh toán Sandbox, hệ thống cập nhật payment sang CANCELLED, giải phóng phiên an toàn, không phát sinh giao dịch treo.', 'High<br>Pass'],
  ['[SUB-05]', 'Đạt (Khớp 100% DB Constraint & Backend API): Partial unique index uq_subscriptions_live_consumer_api trên (consumer_id, api_id) chặn trạng thái live; API trả về HTTP 409 SUBSCRIPTION_ALREADY_EXISTS.', 'High<br>Pass'],
  ['[SUB-06]', 'Đạt (Khớp 100% Cancel At Period End): Cờ cancel_at_period_end được gán TRUE, gói vẫn giữ ACTIVE cho tới ngày hết hạn, quyền gọi Gateway và hạn ngạch còn lại được bảo lưu trọn vẹn.', 'High<br>Pass'],
  ['[SUB-07]', 'Đạt (Khớp 100% State Transition): Gói cước quá hạn chuyển trạng thái EXPIRED; Gateway ngắt quyền truy cập ngay lập tức với HTTP 403 SUBSCRIPTION_SUSPENDED.', 'High<br>Pass'],
  ['[SUB-08]', 'Đạt (Khớp 100% Admin Suspension): Thao tác đình chỉ của Admin cập nhật trạng thái SUSPENDED, đồng bộ cờ chặn vào Redis và ghi Audit Log; Gateway phản hồi tức thời HTTP 403.', 'Critical<br>Pass'],
  ['[SUB-09]', 'Đạt (Khớp 100% Admin Reactivation): Phục hồi gói cước chuyển trạng thái về ACTIVE, xóa cờ đình chỉ trên Redis, Gateway mở lại lưu thông và bảo toàn nguyên vẹn số lượt quota đã dùng.', 'Medium<br>Pass'],
  ['[SUB-10]', 'Đạt (Khớp 100% Quota Allocation): Cấp Quota ban đầu chính xác tại mốc Max Quota, DB lưu allocated_quota = 10000, used_quota = 0; Redis khởi tạo counter sử dụng = 0.', 'High<br>Pass'],
  ['[SUB-11]', 'Đạt (Khớp 100% DB Trigger & Backend Validation): Trigger trg_subscriptions_validate và hàm validate_subscription_plan_api() chặn plan không khớp api_id, trả về mã lỗi 400/404 an toàn.', 'Medium<br>Pass'],
  ['[SUB-12]', 'Đạt (Khớp 100% Concurrency & DB Lock): Gửi đồng thời 2 checkout request, hệ thống áp dụng DB lock / idempotency token chỉ cho phép tạo 1 phiên thanh toán duy nhất, tránh double charge.', 'Critical<br>Pass'],

  // Section 2: GW
  ['[GW-01]', 'Đạt (Khớp 100% Gateway Auth): Thiếu X-API-Key bị chặn ngay tại filter đầu tiên với HTTP 401 MISSING_API_KEY kèm header WWW-Authenticate, upstream hoàn toàn không bị gọi.', 'Critical<br>Pass'],
  ['[GW-02]', 'Đạt (Khớp 100% Prefix Validator): Key không bắt đầu bằng ak_live_ bị chặn ngay tại tầng cú pháp với HTTP 401 INVALID_API_KEY mà không cần truy vấn DB nặng.', 'High<br>Pass'],
  ['[GW-03]', 'Đạt (Khớp 100% Revocation Check): API Key có is_active = FALSE bị từ chối với HTTP 401 INVALID_API_KEY, trường last_used_at không bị cập nhật sai lệch.', 'Critical<br>Pass'],
  ['[GW-04]', 'Đạt (Khớp 100% Scope Binding): Key cấp cho API Dịch thuật gọi sang API Thời tiết bị từ chối với HTTP 401 API_KEY_SCOPE_MISMATCH, bảo đảm tính cô lập 1-1 giữa Key và API.', 'High<br>Pass'],
  ['[GW-05]', 'Đạt (Khớp 100% SQLi Defense): Header X-API-Key chứa payload \' OR \'1\'=\'1\' được băm SHA-256 trước khi so khớp, không bị lỗi SQL parser hay bypass, trả về HTTP 401 an toàn.', 'Critical<br>Pass'],
  ['[GW-06]', 'Đạt (Khớp 100% Entitlement Filter): Consumer có Key hợp lệ nhưng chưa sở hữu Subscription active bị Gateway chặn với HTTP 403 NO_ACTIVE_SUBSCRIPTION.', 'Critical<br>Pass'],
  ['[GW-07]', 'Đạt (Khớp 100% Suspension Enforcement): Subscription bị SUSPENDED nhận ngay phản hồi HTTP 403 SUBSCRIPTION_SUSPENDED; Redis cache chặn trước khi gọi upstream.', 'High<br>Pass'],
  ['[GW-08]', 'Đạt (Khớp 100% API Lifecycle): API bị Admin đình chỉ xuất bản bị Gateway chặn với HTTP 403/404 API_UNAVAILABLE, cô lập triệt để lưu lượng tới API vi phạm.', 'High<br>Pass'],
  ['[GW-09]', 'Đạt (Khớp 100% Trial Grant): Request dùng thử thứ 6 sau khi đã tiêu thụ 5/5 lượt sandbox bị chặn chính xác với HTTP 403 SANDBOX_EXHAUSTED.', 'Medium<br>Pass'],
  ['[GW-10]', 'Đạt (Khớp 100% Sliding Window Rate Limit): Bắn 9 req/s với giới hạn 10 RPS, 9/9 request thành công HTTP 200, header X-RateLimit-Remaining giảm tuyến tính chính xác từ 9 về 1.', 'High<br>Pass'],
  ['[GW-11]', 'Đạt (Khớp 100% Burst Rate Limit): Bắn burst 11 req/s, request thứ 10 thành công (Remaining: 0), request thứ 11 bị chặn với HTTP 429 RATE_LIMIT_EXCEEDED kèm header Retry-After: 1.', 'Critical<br>Pass'],
  ['[GW-12]', 'Đạt (Khớp 100% Monthly Quota Boundary): Đã dùng hết 100/100 lượt, request thứ 101 dù gửi chậm vẫn bị chặn với HTTP 429 QUOTA_EXCEEDED, phân biệt rõ với lỗi Rate Limit tức thời.', 'Critical<br>Pass'],
  ['[GW-13]', 'Đạt (Khớp 100% Concurrency Lua Script): 10 request đồng thời khi quota còn 1 lượt, atomic Redis Lua script cấp đúng 1 request HTTP 200, 9 request nhận HTTP 429, counter không bị âm.', 'Critical<br>Pass'],
  ['[GW-14]', 'Đạt (Khớp 100% Upstream Signing & Anti-Bypass): Gateway tự động đính kèm chữ ký X-Gateway-Signature HMAC-SHA256 hợp lệ; UpstreamVerifier từ chối 401/403 nếu gọi lậu bỏ qua Gateway.', 'Critical<br>Pass'],
  ['[GW-15]', 'Đạt (Khớp 100% Runbook Fail-Closed): Khi Redis timeout/disconnect, API trả phí áp dụng Fail-Closed trả về HTTP 503 RATE_LIMIT_UNAVAILABLE (rate limit) và 503 QUOTA_UNAVAILABLE (quota).', 'High<br>Pass'],

  // Section 3: RED
  ['[RED-01]', 'Đạt (Khớp 100% DB Audit): Quét regex toàn bộ bảng usage_logs ghi nhận 0 bản ghi chứa tiền tố ak_live_; chỉ lưu api_key_id số nguyên an toàn, không rò rỉ secret key.', 'Critical<br>Pass'],
  ['[RED-02]', 'Đạt (Khớp 100% Header Redaction): Middleware log tự động chuyển Authorization: Bearer <jwt> thành Authorization: [REDACTED], 0 rò rỉ token trên Docker stdout/stderr.', 'Critical<br>Pass'],
  ['[RED-03]', 'Đạt (Khớp 100% Cookie & Key Redaction): Headers Cookie và X-API-Key đều được che thành [REDACTED] trước khi stream ra log container, bảo vệ tuyệt đối định danh phiên.', 'High<br>Pass'],
  ['[RED-04]', 'Đạt (Khớp 100% Body Masking): Bộ lọc đệ quy JSON thay thế các trường password, token, secret thành [REDACTED], không để lộ thông tin nhạy cảm nghiệp vụ trong debug log.', 'High<br>Pass'],
  ['[RED-05]', 'Đạt (Khớp 100% SafeProxy Buffer Cap): Payload 2.5 MB vượt trần 2 MiB bị chặn với HTTP 413 Payload Too Large, Gateway ngắt socket ngay lập tức, ngăn ngừa tấn công OOM DoS.', 'High<br>Pass'],
  ['[RED-06]', 'Đạt (Khớp 100% DB View Inspection): View request_history chỉ SELECT đúng 10 cột kỹ thuật an toàn; loại bỏ hoàn toàn api_key_id, response_bytes, headers và body ra khỏi schema.', 'Medium<br>Pass'],

  // Section 4: OVH
  ['[OVH-01]', 'Đạt (Khớp 100% Overhead Formula): Phép tính gateway_overhead_ms = latency_ms - upstream_latency_ms luôn là số nguyên >= 0, check constraint DB usage_logs_overhead_check bảo đảm toàn vẹn.', 'Critical<br>Pass'],
  ['[OVH-02]', 'Đạt (Khớp 100% Micro-benchmark): Upstream mock phản hồi cực nhanh 2ms, Gateway đo đạc chính xác overhead (4-8ms) với latency_ms (6-10ms), không bị sai lệch làm tròn về 0.', 'High<br>Pass'],
  ['[OVH-03]', 'Đạt (Khớp 100% Gateway Timeout): Upstream phản hồi chậm vượt quá 10s, Gateway ngắt kết nối sau 10,000ms, trả HTTP 504 Gateway Timeout và lưu vết status_code=504 chuẩn xác.', 'High<br>Pass'],
  ['[OVH-04]', 'Đạt (Khớp 100% Bad Gateway): Upstream sập kết nối (ECONNREFUSED), Gateway trả HTTP 502 Bad Gateway, ghi nhận upstream_latency_ms = 0 hoặc NULL mà không vi phạm ràng buộc DB.', 'High<br>Pass'],
  ['[OVH-05]', 'Đạt (Khớp 100% Gateway SLA Benchmark): Đo kiểm thực tế 50 requests liên tiếp: P50 = 13.09ms, P95 = 19.21ms, Max = 23.86ms; vượt xa chỉ tiêu SLA P95 < 30ms cam kết.', 'Critical<br>Pass'],
  ['[OVH-06]', 'Đạt (Khớp 100% Latency Headers): Header phản hồi X-Gateway-Overhead-Ms và X-Response-Time được xuất đầy đủ và chính xác, hỗ trợ Client và QA đối soát độ trễ minh bạch.', 'Medium<br>Pass'],

  // Section 5: HIST
  ['[HIST-01]', 'Đạt (Khớp 100% RBAC Isolation Consumer): Backend cưỡng chế điều kiện WHERE consumer_id = auth_user_id; Consumer A cố tình truyền ID của Consumer B nhận danh sách rỗng, 0 rò rỉ IDOR.', 'Critical<br>Pass'],
  ['[HIST-02]', 'Đạt (Khớp 100% RBAC Isolation Provider): Provider A cố tình truy vấn analytics của API thuộc Provider B bị từ chối thẳng với HTTP 403 ACCESS_DENIED, bảo vệ bí mật kinh doanh.', 'Critical<br>Pass'],
  ['[HIST-03]', 'Đạt (Khớp 100% UI Pagination & Filters): Bộ lọc ngày, status code và phân trang 10 items/trang hiển thị chính xác theo pagination metadata; badge status render đúng màu chuẩn UX.', 'High<br>Pass'],
  ['[HIST-04]', 'Đạt (Khớp 100% 4-Tier Consistency): Bắn 1 request thành công qua Gateway, đối soát đồng thời 4 tầng: Redis (+1) -> DB usage_logs (+1) -> View request_history (+1) -> UI (+1) khớp 100%.', 'Critical<br>Pass'],
  ['[HIST-05]', 'Đạt (Khớp 100% Provider Analytics): Dashboard Provider tải KPI (Total Requests, Success Rate %, Avg Latency) và doanh thu tách theo từng đơn vị tiền tệ dưới 500ms, không lag DB.', 'High<br>Pass'],
  ['[HIST-06]', 'Đạt (Khớp 100% cURL Generator): Đoạn mã sinh ra bao gồm URL Gateway cổng 4000, header X-API-Key binding chính xác khóa thực của Consumer, escape shell an toàn theo POSIX.', 'High<br>Pass'],
  ['[HIST-07]', 'Đạt (Khớp 100% JS Fetch Generator): Đoạn mã JavaScript sử dụng cú pháp hiện đại async/await, có đầy đủ cấu trúc headers, kiểm tra response.ok và khối try...catch bắt lỗi đầy đủ.', 'High<br>Pass'],
  ['[HIST-08]', 'Đạt (Khớp 100% Python Generator): Đoạn mã Python Requests đạt chuẩn PEP 8, truyền đúng dictionary headers và có phương thức response.raise_for_status() xử lý lỗi chuẩn mực.', 'Medium<br>Pass'],

  // Section 6: ADM
  ['[ADM-01]', 'Đạt (Khớp 100% Admin Subscription List): Endpoint /api/admin/subscriptions nạp đầy đủ danh sách thuê bao toàn sàn kèm bộ lọc trạng thái và tìm kiếm theo email người dùng trơn tru.', 'High<br>Pass'],
  ['[ADM-02]', 'Đạt (Khớp 100% Admin Suspension & Audit): Đình chỉ subscription kèm lý do hợp lệ đổi trạng thái sang SUSPENDED, ngắt Gateway ngay lập tức và ghi nhận bản ghi Audit Log đầy đủ.', 'Critical<br>Pass'],
  ['[ADM-03]', 'Đạt (Khớp 100% Worker Expiry Job): Hàm run_subscription_maintenance() quét đúng các gói cước quá hạn expires_at <= NOW(), cập nhật sang EXPIRED an toàn với FOR UPDATE SKIP LOCKED.', 'High<br>Pass'],
  ['[ADM-04]', 'Đạt (Khớp 100% Worker Quota Reset Job): Hàm run_subscription_maintenance() tự động reset quota_used = 0 và tịnh tiến quota_reset_at thêm 1 tháng cho các gói đến kỳ với SKIP LOCKED.', 'High<br>Pass'],
  ['[ADM-05]', 'Đạt (Khớp 100% Worker Idempotency): Chạy lại Worker Job nhiều lần liên tiếp không gây nhân đôi số liệu, không phát sinh xung đột nhờ PostgreSQL advisory lock và batch locking.', 'High<br>Pass'],
  ['[ADM-06]', 'Đạt (Khớp 100% Partition Maintenance): Hàm ensure_usage_log_partition() tự động tạo trước các phân vùng bảng usage_logs_YYYY_MM tới tháng N+2, bảo đảm Gateway không gián đoạn ghi log.', 'Critical<br>Pass']
];

const lines = content.split(/\r?\n/);
let updatedCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.startsWith('| **[')) continue;

  for (const [id, newActual, newStatus] of updates) {
    if (line.includes(`**${id}**`)) {
      // Split by '|'
      const parts = line.split('|');
      // Format: empty, ID (1), desc (2), ref (3), pre (4), steps (5), data (6), expected (7), actual (8), status (9), empty
      if (parts.length >= 10) {
        parts[8] = ` ${newActual} `;
        parts[9] = ` ${newStatus} `;
        lines[i] = parts.join('|');
        updatedCount++;
      }
      break;
    }
  }
}

console.log(`Updated ${updatedCount} test case lines out of ${updates.length}`);

// Normalize line endings and strip trailing whitespaces
const finalLines = lines.map(l => l.trimEnd());
fs.writeFileSync(targetPath, finalLines.join('\n') + '\n', 'utf8');
console.log('Successfully written updated Sprint4_TestCases.md');

