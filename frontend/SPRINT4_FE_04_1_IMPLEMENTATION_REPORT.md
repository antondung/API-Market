# API HUB — FRONTEND SPRINT 4 / ROUND FE-04.1 IMPLEMENTATION REPORT
## Contract Foundation · Subscription · Checkout Sandbox

- **Issue Reference:** [Issue #18](https://github.com/antondung/API-Market/issues/18)
- **Branch:** `feature/18-sprint4-frontend-billing`
- **Target Branch:** `develop`
- **Frontend Lead / Author:** Frontend Tech Lead (Hải Dương)
- **Date:** 2026-11-04
- **Final Status:** `DRAFT_PR_OPEN_AWAITING_BACKEND_INTEGRATION_AND_REVIEW`

---

## 1. Tóm tắt điều hành & Phạm vi thực hiện

Vòng triển khai **FE-04.1** thiết lập nền tảng hợp đồng dữ liệu (Contract Foundation), luồng thanh toán Sandbox mô phỏng minh bạch (Checkout Sandbox) và quản lý thuê bao API người tiêu dùng (Subscription Management).

Toàn bộ mã nguồn Frontend được xây dựng bám sát hợp đồng Backend tại commit đã được kiểm toán:
- **Backend Reference:** `2c8a873023e071a93097a3d32b17bffbc3e41585` (PR #92)
- **Database Reference:** `a475d353c1bc9ec4af09d92a934094eabae1ce45` (PR #91)
- **Base Branch:** `origin/develop` tại `f6b83abdcbf57d8a5de1eee0202fe3b1cf0a1392`

---

## 2. Phân chia trách nhiệm Subagents & DAG

Thực thi theo mô hình DAG độc lập bằng Claude Code native subagents:

```
[Agent A: Billing Contracts & API Client]
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
[Agent B: Checkout UI]        [Agent C: Subscription Management]
       │                                 │
       └────────────────┬────────────────┘
                        ▼
   [Agent D: Independent API Contract Reviewer]
```

### 2.1 Agent A — Billing Contracts & API Client
- **Tệp sở hữu:**
  - `frontend/src/services/sprint4Types.ts`
  - `frontend/src/services/billingApi.ts`
  - `frontend/src/services/usageApi.ts`
  - `frontend/src/services/billingApi.test.ts`
  - `frontend/src/services/usageApi.test.ts`
- **Nhiệm vụ:**
  - Chuẩn hóa TypeScript types bám sát schema PostgreSQL (BIGINT dưới dạng chuỗi, NUMERIC(14,2) tiền tệ, status enum chính xác).
  - Triển khai typed client cho 10 endpoints qua `authenticatedRequest()` và chuẩn bọc `{ data: ... }`.
  - Sinh idempotency keys và event IDs tuân thủ regex `^[A-Za-z0-9_.:-]{1,100}$`.
  - Tuyệt đối không lưu trữ hay rò rỉ token thanh toán / API key vào storage hay URL.
  - Xử lý mã lỗi chuẩn hóa: 400, 401, 403, 404, 409, 429, 503.

### 2.2 Agent B — Checkout UI
- **Tệp sở hữu:**
  - `frontend/src/pages/checkout/CheckoutPage.tsx`
  - `frontend/src/pages/checkout/CheckoutPage.test.tsx`
- **Nhiệm vụ:**
  - Giữ nguyên hệ thống thiết kế và bố cục Sprint 3.
  - Ràng buộc đăng nhập vai trò Consumer; không cho phép giao dịch khi chưa xác thực.
  - Kiểm tra tính hợp lệ của API ID và Plan ID thực tế; không fallback gói ngẫu nhiên khi ID sai.
  - Hộp kiểm điều khoản dịch vụ (Terms) mặc định `unchecked` (false).
  - Luồng gói Free: `POST subscribe` -> chuyển thẳng `Active` từ máy chủ, không tạo thanh toán giả.
  - Luồng gói Paid: `POST subscribe` -> `Pending` -> `checkout` -> `confirm` sandbox -> làm mới trạng thái subscription.
  - Cho phép người dùng mô phỏng kết quả thanh toán Sandbox rõ ràng (Thành công / Thất bại).
  - Không thu thập thẻ tín dụng thật; không sử dụng logo Visa/Mastercard/VNPay như cổng thanh toán thật.
  - Bảo vệ chống nhấn đúp (double-click), xử lý lỗi mạng và xung đột trạng thái (409 conflict).

### 2.3 Agent C — Subscription Management
- **Tệp sở hữu:**
  - `frontend/src/pages/consumer/MySubscriptionsPage.tsx`
  - `frontend/src/pages/consumer/MySubscriptionsPage.test.tsx`
- **Nhiệm vụ:**
  - Thay thế mảng tĩnh `subscriptions: []` bằng lời gọi API `listSubscriptions`.
  - Hỗ trợ phân trang, trạng thái tải (loading), lỗi (error), rỗng (empty) và thử lại (retry).
  - Hiển thị đầy đủ trạng thái hợp lệ: `Pending`, `Active`, `Past Due`, `Suspended`, `Canceled`, `Expired`.
  - Hỗ trợ hủy gói cuối kỳ (`immediate: false`) và hủy ngay lập tức (`immediate: true`) kèm cảnh báo thu hồi quyền truy cập Gateway.
  - Hỗ trợ đổi gói (change plan) thông qua checkout mới, giữ nguyên quota đã dùng, không reset quyền truy cập giả lập trước khi settlement hoàn tất.
  - Xử lý lỗi `SUBSCRIPTION_PERIOD_LOCKED` và `SUBSCRIPTION_ALREADY_EXISTS`.

### 2.4 Agent D — Independent API Contract Reviewer
- Độc lập thẩm định, không chỉnh sửa file của các agent khác (chế độ kiểm toán đọc độc lập).
- Lập bảng findings chi tiết về đường dẫn, method, header, payload, kiểu dữ liệu, bảo mật và tính toàn vẹn (xem chi tiết Mục 5 bên dưới).
- Xác nhận độ khớp 10/10 endpoint, bảo vệ bí mật tuyệt đối (không rò rỉ token), an toàn số học `BigInt`, trung thực về Sandbox simulation, và xác thực 3 Blocker hệ thống.

---

## 3. Ma trận Endpoint và Hợp đồng Tích hợp

Xem chi tiết tại [SPRINT4_FE_BE_CONTRACT_MATRIX.md](./SPRINT4_FE_BE_CONTRACT_MATRIX.md).

| Endpoint | Method | Vai trò | Mục đích | Trạng thái tích hợp |
| :--- | :--- | :--- | :--- | :--- |
| `/api/consumer/subscriptions` | POST | Consumer | Đăng ký gói (Free kích hoạt ngay, Paid ở Pending) | Client + UI Unit Tested |
| `/api/consumer/subscriptions` | GET | Consumer | Danh sách gói thuê bao phân trang | Client + UI Unit Tested |
| `/api/consumer/subscriptions/{id}` | GET | Consumer | Chi tiết gói thuê bao theo ID | Client + UI Unit Tested |
| `/api/consumer/subscriptions/{id}/cancel` | POST | Consumer | Hủy gia hạn cuối kỳ hoặc hủy ngay | Client + UI Unit Tested |
| `/api/consumer/subscriptions/{id}/checkout` | POST | Consumer | Khởi tạo giao dịch checkout Sandbox | Client + UI Unit Tested |
| `/api/consumer/subscriptions/{id}/change-plan` | POST | Consumer | Đổi sang gói khác cùng API | Client + UI Unit Tested |
| `/api/consumer/subscriptions/confirm` | POST | Consumer | Xác nhận kết quả mô phỏng thanh toán Sandbox | Client + UI Unit Tested |
| `/api/consumer/usage/summary` | GET | Consumer | Tóm tắt quota sử dụng và lưu lượng theo ngày | Client Unit Tested |
| `/api/consumer/usage/history` | GET | Consumer | Lịch sử gọi request (đã loại bỏ payload nhạy cảm) | Client Unit Tested |
| `/api/provider/analytics/overview` | GET | Provider | Thống kê request, doanh thu sandbox theo tiền tệ | Client Unit Tested |

---

## 4. Các Vấn Đề Chặn (Blockers)

### BLOCKER-01: Lệch đơn vị Rate Limit (P1)
- **Mô tả:** Giao diện Quản lý giá Provider (`frontend/src/pages/provider/PricingManagementPage.tsx`) và Checkout (`CheckoutPage.tsx:360`) hiển thị Rate Limit theo **RPS (Requests Per Second)**. Tuy nhiên, Backend Sprint 4 lưu trữ cột `rate_limit_per_minute` trong migration 010 và Redis Meter tính toán cửa sổ theo **phút (RPM)**.
- **Hệ quả:** Nếu cấu hình 10 RPS ở UI, Backend sẽ giới hạn 10 RPM (chặt hơn 60 lần).
- **Yêu cầu:** Tech Lead và Backend Engineer thống nhất đơn vị chuẩn và cơ chế chuyển đổi trước khi tích hợp Gateway production.

### BLOCKER-02: PR #91 Database Schema Lỗi CI (P1)
- **Mô tả:** CI Node.js trên PR #91 thất bại do fixture chèn trực tiếp API trạng thái `Published`, bị trigger kiểm tra trạng thái API từ chối. PR #92 trên nhánh Backend đã sửa fixture sang `Draft`, nhưng PR #91 độc lập vẫn đỏ.
- **Trạng thái:** Báo cáo sang phụ trách Database (Danh) để cập nhật fixture mà không sửa chéo repository.

### BLOCKER-03: Phụ thuộc nhánh Backend PR #92 (P2)
- **Mô tả:** PR #92 chưa merge vào `origin/develop`.
- **Cam kết:** Toàn bộ test của FE-04.1 chạy trên mock contract xác thực; không tuyên bố E2E hoàn tất khi chưa có môi trường staging tích hợp thực.

---

## 5. Báo cáo Thẩm định Độc lập của Agent D (Independent Contract Review)

Agent D đã hoàn tất kiểm toán độc lập đối chiếu mã nguồn Frontend với Backend SHA `2c8a873023e071a93097a3d32b17bffbc3e41585` và Database SHA `a475d353c1bc9ec4af09d92a934094eabae1ce45`.

### 5.1 Bảng Tổng hợp Findings

| Finding ID | Mức độ | Phân loại | Tệp & Dòng | Chi tiết | Khuyến nghị xử lý |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FINDING-01** | **High (Blocker)** | Contract Mismatch / Rate Limiting | `frontend/src/pages/checkout/CheckoutPage.tsx:360` & `backend/src/redis-meter.ts:16-47` | Lệch đơn vị Rate Limit (BLOCKER-01). UI Checkout hiển thị `req/giây` (RPS). Backend migration 010 lưu `rate_limit_per_minute` và Redis Meter tính cửa sổ theo phút (RPM). Nếu plan đặt 10 RPS, Backend chặn ở 10 RPM (chặt hơn 60 lần). | Đổi nhãn UI sang `req/phút` cho đồng nhất `subscriptions.rate_limit_per_minute` và `MySubscriptionsPage.tsx:309`, hoặc Backend nhân 60 nếu định nghĩa plan là RPS. |
| **FINDING-02** | **Medium** | Lifecycle / State Machine | `frontend/src/pages/checkout/CheckoutPage.tsx:207-210` & `frontend/src/pages/consumer/MySubscriptionsPage.tsx:333` | Không thể tiếp tục thanh toán gói `Pending`. Khi nhấn "Thanh toán ngay" từ `MySubscriptionsPage`, UI chuyển sang `/checkout/:apiId/:planId`. Hàm `handleSubmit` gọi lại `subscribePlan()`. DB có unique index `uq_subscriptions_live_consumer_api` nên quăng lỗi 409 `SUBSCRIPTION_ALREADY_EXISTS`. Người dùng bị kẹt. | Trong `CheckoutPage`, kiểm tra nếu user đã có subscription `Pending` cho API này thì bỏ qua `subscribePlan()`, gọi thẳng `checkoutSubscription()` và `confirmPayment()`. |
| **FINDING-03** | **Medium (Blocker)** | CI / Database Trigger | `migrations/009_create_sprint4_billing_usage.sql` & PR #91 CI | Lỗi CI trên PR #91 (BLOCKER-02). Fixture của PR #91 chèn API trạng thái `Published` trực tiếp, bị DB trigger `trg_validate_api_status_transition` từ chối. PR #92 đã sửa fixture sang `Draft`, nhưng PR #91 vẫn đỏ. | Backport bản sửa fixture từ PR #92 (`backend/integration/sprint4-database.test.ts`) về nhánh PR #91. |
| **FINDING-04** | **Medium (Blocker)** | Dependency / Integration Gate | `backend/SPRINT-4-HANDOFF.md:117-120` & PR #92 | Phụ thuộc nhánh Backend chưa merge (BLOCKER-03). PR #92 OPEN, chưa merge vào `origin/develop`. Toàn bộ test Frontend hiện chạy trên mock. Chưa có môi trường staging tích hợp thực. | Giữ Frontend PR ở trạng thái DRAFT. Chỉ merge sau khi PR #91 và PR #92 đã vào `develop`. |
| **FINDING-05** | **Low (Info)** | Feature Scope / UX | `frontend/src/services/billingApi.ts:153` & `frontend/src/pages/consumer/MySubscriptionsPage.tsx:343` | API `changeSubscriptionPlan` đã hoàn thiện trong `billingApi.ts` và có test đầy đủ, nhưng nút "Đổi gói" trên `MySubscriptionsPage` chỉ chuyển hướng sang `/api/:apiId` thay vì mở modal đổi gói trực tiếp. | Bổ sung modal đổi gói trực tiếp ở vòng triển khai FE-04.2 sử dụng `changeSubscriptionPlan` + `confirmPayment`. |
| **FINDING-06** | **Low (Info)** | Backend Query / UX | `frontend/src/pages/consumer/MySubscriptionsPage.tsx:302, 461` | Backend `BillingService.list()` chỉ chạy `SELECT * FROM subscriptions`, không JOIN bảng `apis` và `api_plans`. Frontend buộc phải hiển thị ID thô (`API #1 • Gói #10`). | Yêu cầu Backend bổ sung JOIN `apis` và `api_plans` trong `BillingService.list()` để trả về `apiName` và `planName`. |
| **FINDING-07** | **Low (Info)** | Typography / Formatting | `frontend/src/services/sprint4Types.ts:258` | Hàm `formatCurrencyAmount` ghép phần thập phân bằng dấu chấm `.` (`${formattedWhole}.${trimmedFraction}`). Với locale `vi-VN`, quy chuẩn số học tiếng Việt dùng dấu phẩy `,` cho phần thập phân. | Thay thế bằng định dạng chuẩn locale qua `Intl.NumberFormat`. |

### 5.2 Kết quả Checklist Kiểm toán
1. **URL / Method / Body Alignment:** **PASS** (10/10 endpoints khớp chính xác URL, HTTP method, và payload structure).
2. **Envelope Unwrapping & Typed Returns:** **PASS** (100% unwrapped `{ data: ... }`).
3. **Free vs Paid Plan Lifecycle:** **PASS** (Gói Free kích hoạt trực tiếp `Active`, không thanh toán giả; gói Paid tuân thủ 3 bước: subscribe -> checkout -> confirm).
4. **Role Isolation & Data Privacy:** **PASS** (Chặn quyền `Consumer` vs `Provider`; tuyệt đối không hiển thị PII Consumer cho Provider).
5. **Idempotency & Retry Safety:** **PASS** (Sinh key tuân thủ regex `^[A-Za-z0-9_.:-]{1,100}$`, chống double-click).
6. **Numeric Precision (BIGINT & Money):** **PASS** (Toàn bộ `BIGINT` và `NUMERIC(14,2)` truyền dưới dạng chuỗi, tính toán an toàn bằng kiểu `BigInt` gốc).
7. **Security & Secrets Handling:** **PASS** (Tuyệt đối không lưu token/secret vào `localStorage`, `sessionStorage`, URL, hay log console).
8. **Sandbox Honesty & UI Clarity:** **PASS** (Minh bạch mô phỏng Sandbox; không dùng logo Visa/VNPay như cổng thật; checkbox điều khoản mặc định false).

---

## 6. Kết quả Kiểm thử & Đảm bảo Chất lượng

- `npm run lint` (oxlint): **PASS** (0 errors).
- `npm run build` (tsc -b && vite build): **PASS** (Hoàn thành trong 1.77s).
- `npm test -- --no-file-parallelism`: **PASS TOÀN BỘ (35 test files passed, 434 tests passed)**:
  - `billingApi.test.ts`: 25 unit tests (100% pass).
  - `usageApi.test.ts`: 29 unit tests (100% pass).
  - `CheckoutPage.test.tsx`: 11 unit tests (100% pass).
  - `MySubscriptionsPage.test.tsx`: 12 unit tests (100% pass).
  - Toàn bộ 31 test files hiện hữu: Không hồi quy (0 regressions).
- `scripts/kiem-tra-kho-ma-nguon.ps1` (Hygiene Check): **PASS (355 tệp kiểm tra, 0 lỗi nền tảng, không có conflict markers hay trailing spaces)**.

---

## 7. Kế hoạch bàn giao cho FE-04.2 / FE-04.3 / FE-04.4

1. **FE-04.2:** Kết nối trang `UsageQuotaPage` và `RequestHistoryPage` với `usageApi.getConsumerUsageSummary` và `usageApi.getConsumerUsageHistory`.
2. **FE-04.3:** Nâng cấp `ProviderDashboardPage` và `AnalyticsHealthPage` sử dụng `usageApi.getProviderAnalyticsOverview` với phân tách đa tiền tệ (Multi-currency).
3. **FE-04.4:** Kiểm thử tích hợp E2E thực tế trên staging sau khi PR #91 và PR #92 được duyệt và merge.
