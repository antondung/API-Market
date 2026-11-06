# API HUB — FRONTEND SPRINT 4 / ROUND FE-04.2 IMPLEMENTATION REPORT
## Consumer Usage Dashboard · Request History · Billing Corrections

- **Issue Reference:** [Issue #18](https://github.com/antondung/API-Market/issues/18)
- **Branch:** `feature/18-sprint4-frontend-billing`
- **Pull Request:** [PR #96](https://github.com/antondung/API-Market/pull/96)
- **Target Branch:** `develop`
- **Frontend Lead / Author:** Frontend Tech Lead (Nguyễn Tấn Dũng)
- **Date:** 2026-11-04
- **Final Status:** `ROUND_COMPLETE_ALL_TESTS_PASSING_READY_FOR_REVIEW`

---

## 1. Tóm tắt Điều hành & Mục tiêu Vòng FE-04.2

Vòng triển khai **FE-04.2** mở rộng và hoàn thiện trải nghiệm Người tiêu dùng API (Consumer Control Plane) trong khuôn khổ Sprint 4:
1. **Khắc phục lỗi chu trình thanh toán (Billing Lifecycle Corrections)**:
   - Sửa dứt điểm lỗi bế tắc 409 `SUBSCRIPTION_ALREADY_EXISTS` khi người dùng tiếp tục thanh toán gói đăng ký ở trạng thái `Pending` từ trang quản lý thuê bao.
   - Chuẩn hóa nhãn hiển thị đơn vị Rate Limit sang `req/phút` (RPM) để đồng bộ tuyệt đối với cơ chế cửa sổ trượt 1 phút của Redis Meter và migration 010.
   - Triển khai nguồn sinh ngẫu nhiên an toàn mã hóa (CSPRNG) fail-closed, loại bỏ triệt để `Math.random()`.
   - Bổ sung hộp thoại Đổi gói dịch vụ (Change Subscription Plan) trực tiếp tại `MySubscriptionsPage` kèm thông báo bảo toàn hạn ngạch đã dùng trong kỳ.
2. **Bảng điều khiển hạn mức tiêu dùng (Consumer Usage Dashboard)**:
   - Thay thế toàn bộ dữ liệu tĩnh bằng tích hợp thực tế với `usageApi.getConsumerUsageSummary`.
   - Trực quan hóa hạn mức sử dụng theo từng đăng ký API, tính toán tiến độ hạn ngạch an toàn `BigInt`, cảnh báo khi cạn kiệt Quota hoặc hết hạn chu kỳ.
   - Thống kê phân bổ lưu lượng gọi theo ngày (`SUM(requestCount)`, `SUM(successCount)`, `SUM(errorCount)`).
   - Bộ lọc theo API ID và khoảng thời gian (giới hạn tối đa 365 ngày).
3. **Nhật ký yêu cầu API (Request History)**:
   - Kết nối `usageApi.getConsumerUsageHistory` với phân trang phía máy chủ (`page`, `pageSize`, `total`).
   - Hỗ trợ lọc theo mã trạng thái HTTP (2xx, 4xx, 5xx), API ID, và khoảng thời gian.
   - Bảo mật viễn trắc tuyệt đối: Modal kiểm tra chi tiết chỉ hiển thị metadata (Request ID, Method, Path đã ẩn danh, Status, Error Code, Latency); tuyệt đối không lưu trữ hay để lộ Authorization headers, API keys, tokens hay request/response body.

Toàn bộ mã nguồn tuân thủ nghiêm ngặt các mốc hợp đồng Backend và Database đã được pin:
- **Backend Reference:** `2c8a873023e071a93097a3d32b17bffbc3e41585` (PR #92)
- **Database Reference:** `a475d353c1bc9ec4af09d92a934094eabae1ce45` (PR #91)
- **Frontend Baseline:** `1078924b1acfdf4e340002d0727897bb714094e0` (PR #96)

---

## 2. Mô hình Thực thi Subagents Độc lập & DAG

Thực thi theo mô hình DAG độc lập bằng Claude Code native subagents với ranh giới tệp sở hữu rõ ràng, không xung đột:

```
                  ┌─────────────────────────────────────────┐
                  │ Agent A: Billing Lifecycle Corrections  │
                  └─────────────────────────────────────────┘
                                       │
         ┌─────────────────────────────┴─────────────────────────────┐
         ▼                                                           ▼
┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
│ Agent B: Usage Dashboard        │                 │ Agent C: Request History        │
└─────────────────────────────────┘                 └─────────────────────────────────┘
         │                                                           │
         └─────────────────────────────┬─────────────────────────────┘
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │ Agent D: Independent Contract Reviewer  │
                  └─────────────────────────────────────────┘
```

### 2.1 Agent A — Sửa chữa Chu trình Thanh toán & Đổi gói
- **Tệp sở hữu:**
  - `frontend/src/services/billingApi.ts` & `frontend/src/services/billingApi.test.ts`
  - `frontend/src/services/sprint4Types.ts`
  - `frontend/src/pages/checkout/CheckoutPage.tsx` & `frontend/src/pages/checkout/CheckoutPage.test.tsx`
  - `frontend/src/pages/consumer/MySubscriptionsPage.tsx` & `frontend/src/pages/consumer/MySubscriptionsPage.test.tsx`
  - `frontend/src/pages/provider/PricingManagementPage.tsx` & `frontend/src/test/PricingManagementPage.test.tsx`
- **Kết quả thực hiện:**
  - `CheckoutPage`: Bắt param `resumeSubscriptionId` từ route state, xác thực quyền sở hữu và trạng thái `Pending` trên máy chủ; bỏ qua bước gọi trùng `subscribePlan()`, chuyển thẳng sang `checkoutSubscription()` và `confirmPayment()`.
  - Tự động bắt lỗi 409 `SUBSCRIPTION_ALREADY_EXISTS` trong `handleSubmit`: nếu phát hiện gói `Pending` tương ứng, tự động phục hồi luồng checkout; nếu là gói `Active`, hiển thị banner thông báo gói đang hoạt động.
  - Xử lý lỗi 400 `SUBSCRIPTION_PERIOD_LOCKED` hiển thị thông báo tiếng Việt minh bạch.
  - Chuẩn hóa nhãn `req/phút` (RPM) thay vì RPS trên toàn bộ các trang Checkout, MySubscriptions, PricingManagement.
  - Triển khai nguồn ngẫu nhiên CSPRNG fail-closed (`crypto.randomUUID()` / `crypto.getRandomValues()`) ném lỗi có chủ đích khi thiếu nguồn ngẫu nhiên an toàn.
  - `MySubscriptionsPage`: Thêm Modal Đổi gói dịch vụ (Change Plan Modal), lọc bỏ gói đang dùng, hiển thị cảnh báo bảo toàn quota, thực thi `changeSubscriptionPlan` và `confirmPayment`.

### 2.2 Agent B — Consumer Usage Dashboard
- **Tệp sở hữu:**
  - `frontend/src/pages/consumer/UsageQuotaPage.tsx`
  - `frontend/src/pages/consumer/UsageQuotaPage.test.tsx`
  - `frontend/src/pages/consumer/ConsumerDashboardPage.tsx`
  - `frontend/src/pages/consumer/ConsumerPages.test.tsx`
- **Kết quả thực hiện:**
  - Thay thế toàn bộ mock cũ bằng `usageApi.getConsumerUsageSummary` qua `AbortSignal`.
  - Hiển thị danh sách đăng ký kèm badge trạng thái (`Active`, `Pending`, `Past Due`, `Suspended`, `Canceled`, `Expired`), thanh tiến độ hạn mức an toàn `BigInt` (`calculateQuotaProgress`), và cảnh báo khi cạn hạn ngạch hoặc hết hạn kỳ.
  - Bảng tổng hợp lưu lượng gọi theo ngày với các trường `SUM(requestCount)`, `SUM(successCount)`, `SUM(errorCount)`.
  - Bộ lọc API ID và Date range kèm kiểm tra biên 365 ngày (`validateDateRange`).
  - Xử lý trạng thái tải (Skeleton), rỗng (Empty), lỗi (Error) kèm nút thử lại ("Thử lại").
  - Nâng cấp `ConsumerDashboardPage` lấy dữ liệu thật về số gói đang hoạt động và tổng quota đã sử dụng trong tháng.

### 2.3 Agent C — Request History (Nhật ký Yêu cầu)
- **Tệp sở hữu:**
  - `frontend/src/pages/consumer/RequestHistoryPage.tsx`
  - `frontend/src/pages/consumer/RequestHistoryPage.test.tsx`
- **Kết quả thực hiện:**
  - Kết nối `usageApi.getConsumerUsageHistory` hỗ trợ phân trang máy chủ (`page`, `pageSize`, `total`).
  - Bộ lọc: Mã HTTP status (200, 401, 403, 404, 429, 500, 503), API ID, và khoảng thời gian (tối đa 365 ngày).
  - Bảng dữ liệu viễn trắc: Request ID rút gọn kèm nút sao chép, thời gian định dạng `vi-VN`, API Name/ID, Method badge, Path ẩn danh, Status badge phân màu (2xx xanh, 4xx vàng, 5xx đỏ), Error code, Độ trễ (ms), nút xem chi tiết.
  - Hộp thoại chi tiết Sanitized: Tuyệt đối không hiển thị credentials, auth headers, token hay request/response body.
  - Cơ chế chống race condition qua `querySeqRef` khi chuyển trang hoặc đổi bộ lọc liên tục.

### 2.4 Agent D — Thẩm định Hợp đồng Độc lập (Independent Audit)
- **Tệp sở hữu:**
  - `frontend/SPRINT4_FE_04_2_CONTRACT_AUDIT.md`
- **Kết quả thực hiện:**
  - Thẩm định độc lập toàn bộ mã nguồn (read-only audit).
  - Xác nhận độ khớp 10/10 endpoints giữa Frontend và Backend PR #92.
  - Xác nhận an toàn bảo mật viễn trắc (Zero Credential Leakage).
  - Xác nhận an toàn toán học `BigInt` và định dạng tiền tệ `vi-VN`.
  - Đánh giá tổng thể: **PASS TOÀN BỘ**.

---

## 3. Ma trận Endpoint và Mức độ Hoàn thiện

| # | Endpoint | Method | Vai trò | Mục đích | Trạng thái FE-04.1 | Trạng thái FE-04.2 |
| :- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `/api/consumer/subscriptions` | POST | Consumer | Đăng ký gói (Free kích hoạt ngay, Paid ở Pending) | Client + UI Unit Tested | Hoàn thiện (Resume Pending flow) |
| **2** | `/api/consumer/subscriptions` | GET | Consumer | Danh sách gói thuê bao phân trang | Client + UI Unit Tested | Hoàn thiện (Đổi gói modal) |
| **3** | `/api/consumer/subscriptions/{id}` | GET | Consumer | Chi tiết gói thuê bao theo ID | Client + UI Unit Tested | Hoàn thiện |
| **4** | `/api/consumer/subscriptions/{id}/cancel` | POST | Consumer | Hủy gia hạn cuối kỳ hoặc hủy ngay | Client + UI Unit Tested | Hoàn thiện |
| **5** | `/api/consumer/subscriptions/{id}/checkout` | POST | Consumer | Khởi tạo giao dịch checkout Sandbox | Client + UI Unit Tested | Hoàn thiện |
| **6** | `/api/consumer/subscriptions/{id}/change-plan` | POST | Consumer | Đổi sang gói khác cùng API | Client Tested | Hoàn thiện (UI Modal + Confirm) |
| **7** | `/api/consumer/subscriptions/confirm` | POST | Consumer | Xác nhận kết quả mô phỏng Sandbox | Client + UI Unit Tested | Hoàn thiện (Token in-memory) |
| **8** | `/api/consumer/usage/summary` | GET | Consumer | Tóm tắt quota sử dụng và lưu lượng theo ngày | Client Tested | Hoàn thiện (UI UsageQuotaPage) |
| **9** | `/api/consumer/usage/history` | GET | Consumer | Lịch sử gọi request (đã khử dữ liệu nhạy cảm) | Client Tested | Hoàn thiện (UI RequestHistoryPage) |
| **10** | `/api/provider/analytics/overview` | GET | Provider | Thống kê request, doanh thu sandbox | Client Tested | Kế thừa cho FE-04.3 |

---

## 4. Kết quả Kiểm thử & Đảm bảo Chất lượng (QA Metrics)

- **Linter Check (oxlint):** **PASS** (0 lỗi).
- **TypeScript Compile (`tsc -b`):** **PASS** (0 lỗi type).
- **Vite Build (`vite build`):** **PASS** (Hoàn thành trong 1.27s, bundle tối ưu).
- **Kho mã nguồn Hygiene Check (`scripts/kiem-tra-kho-ma-nguon.ps1`):** **PASS** (357 tệp kiểm tra, không có lỗi nền tảng).
- **Toàn bộ Test Suite Vitest:** **100% PASS (37 test files passed, 493 tests passed)**:
  - `billingApi.test.ts`: 40 unit tests (100% pass).
  - `usageApi.test.ts`: 17 unit tests (100% pass).
  - `CheckoutPage.test.tsx`: 17 tests (100% pass).
  - `MySubscriptionsPage.test.tsx`: 19 tests (100% pass).
  - `UsageQuotaPage.test.tsx`: 16 tests (100% pass).
  - `RequestHistoryPage.test.tsx`: 30 tests (100% pass).
  - `ConsumerPages.test.tsx`: 10 tests (100% pass).
  - `PricingManagementPage.test.tsx`: 3 tests (100% pass).
  - 29 test files hiện hữu khác: Không hồi quy (0 regressions).

---

## 5. Trạng thái Vấn đề Chặn (Blockers)

Chi tiết tại [SPRINT4_FE_04_2_BLOCKERS.md](./SPRINT4_FE_04_2_BLOCKERS.md):
- **BLOCKER-01 (Rate Limit RPS vs RPM):** Đã khắc phục triệt để trên toàn bộ giao diện Frontend bằng cách hiển thị rõ ràng đơn vị `req/phút` (RPM), bảo đảm thống nhất với cửa sổ 1 phút của Redis Meter và migration 010.
- **BLOCKER-02 (PR #91 Database Schema CI Failure):** Frontend ghi nhận và báo cáo phụ trách Database (Danh) sửa fixture sang `Draft`; tuân thủ nguyên tắc không sửa chéo kho mã nguồn.
- **BLOCKER-03 (Phụ thuộc Backend PR #92):** Frontend chạy trên Mock Contract đã được kiểm toán khớp 100% với commit `2c8a873023e071a93097a3d32b17bffbc3e41585`; giữ PR #96 ở trạng thái DRAFT cho đến khi Backend merge vào `develop`.

---

## 6. Kế hoạch Bàn giao Tiếp theo

1. **Vòng FE-04.3:** Hoàn thiện bảng điều khiển phân tích Provider Dashboard (`ProviderDashboardPage.tsx`) và Analytics Health (`AnalyticsHealthPage.tsx`) sử dụng `usageApi.getProviderAnalyticsOverview` với phân tách đa tiền tệ.
2. **Vòng FE-04.4:** Kiểm thử tích hợp E2E trên môi trường staging thực tế sau khi PR #91 và PR #92 được duyệt và merge vào `origin/develop`.
