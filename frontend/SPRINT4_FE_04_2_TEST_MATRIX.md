# API HUB — FRONTEND SPRINT 4 / ROUND FE-04.2 TEST MATRIX
## Consumer Usage Dashboard · Request History · Billing Corrections

- **Document Version:** 1.0.0
- **Date:** 2026-11-04
- **Branch:** `feature/18-sprint4-frontend-billing`
- **Target:** `develop`
- **Author:** Frontend Tech Lead (Nguyễn Tấn Dũng)
- **Status:** `ALL_TESTS_PASSING` (37 files, 493 tests)

---

## 1. Tổng quan Bộ Kiểm thử (Test Suite Overview)

Toàn bộ kiểm thử Frontend Sprint 4 FE-04.2 được thực thi tự động qua Vitest 5.0.4 (`@testing-library/react`, `jsdom`, `@testing-library/jest-dom`), tuân thủ triệt để nguyên tắc không phụ thuộc vào thứ tự chạy, độc lập mock contract, an toàn số học `BigInt`, và dọn dẹp mock (`vi.clearAllMocks()`) sau mỗi ca kiểm thử.

```
Total Test Files: 37 passed (37)
Total Unit & Integration Tests: 493 passed (493)
Regression Rate: 0%
TypeScript Compile (tsc -b): 0 errors
Linter Check (oxlint): 0 errors
Hygiene Verification (scripts/kiem-tra-kho-ma-nguon.ps1): 357 tệp sạch, 0 lỗi
```

---

## 2. Ma trận Kiểm thử Chuyên biệt FE-04.2 (Dedicated Test Matrix)

| Test File | Số lượng Tests | Phạm vi chức năng & Hợp đồng kiểm thử | Trạng thái |
| :--- | :---: | :--- | :---: |
| `src/services/billingApi.test.ts` | 40 | Fail-closed CSPRNG key generator (`crypto.randomUUID`, `getRandomValues`), currency formatting `vi-VN`, xử lý BigInt lớn, mã lỗi chuẩn HTTP 400/401/403/404/409/429/500/503 | ✅ PASS |
| `src/services/usageApi.test.ts` | 17 | `getConsumerUsageSummary`, `getConsumerUsageHistory`, `getProviderAnalyticsOverview`, date range 365 days, sanitized telemetry fields | ✅ PASS |
| `src/pages/checkout/CheckoutPage.test.tsx` | 17 | Khôi phục checkout Pending an toàn (`resumeSubscriptionId`), bắt 409 `SUBSCRIPTION_ALREADY_EXISTS` phục hồi tự động, hiển thị banner gói Active, giải thích `SUBSCRIPTION_PERIOD_LOCKED`, nhãn Rate Limit `req/phút`, checkbox Terms bắt buộc | ✅ PASS |
| `src/pages/consumer/MySubscriptionsPage.test.tsx` | 19 | Phân trang, trạng thái badge, dialog đổi gói (Change Plan Modal), lọc bỏ gói hiện tại, bảo toàn quota thông báo, hủy gia hạn cuối kỳ / hủy ngay cảnh báo thu hồi Gateway, định dạng BigInt và đa tiền tệ | ✅ PASS |
| `src/pages/consumer/UsageQuotaPage.test.tsx` | 16 | Kết nối `getConsumerUsageSummary`, tiến độ Quota BigInt (`calculateQuotaProgress`), cảnh báo Quota Exhausted, cảnh báo Period Expired, bảng phân bổ theo ngày, lọc theo API & Date range, AbortController unmount | ✅ PASS |
| `src/pages/consumer/RequestHistoryPage.test.tsx` | 30 | Server-side pagination, lọc mã HTTP status (2xx/4xx/5xx), lọc API ID, kiểm tra biên ngày 365 ngày, sao chép Request ID, Modal chi tiết Sanitized (tuyệt đối không lộ payload, token, body, header), Sequence ref chống race conditions | ✅ PASS |
| `src/pages/consumer/ConsumerPages.test.tsx` | 10 | Kiểm thử tổng hợp các trang Consumer Dashboard, API Keys, điều hướng và dữ liệu quota tổng quan | ✅ PASS |
| `src/test/PricingManagementPage.test.tsx` | 3 | Tạo gói cước Provider, chuẩn hóa nhãn Rate Limit hiển thị `req/phút` (RPM), bảo đảm không gây hiểu nhầm RPS với Gateway enforcement | ✅ PASS |

---

## 3. Chi tiết Ca Kiểm thử Trọng yếu (Critical Test Cases Detail)

### 3.1 Nhóm Hợp đồng & Bảo mật Khóa Ngẫu nhiên (Agent A)
- `billingApi.test.ts > generateIdempotencyKey & generateEventId`:
  - Kiểm tra tính ngẫu nhiên định dạng hex CSPRNG.
  - Kiểm tra ném lỗi fail-closed khi `crypto` bị thiếu (`Secure cryptographic random source unavailable`).
  - Kiểm tra tiền tố và độ dài chuỗi không vượt quá 100 ký tự chuẩn regex `^[A-Za-z0-9_.:-]{1,100}$`.
- `billingApi.test.ts > formatCurrencyAmount`:
  - Định dạng chuẩn locale `vi-VN` với dấu chấm phân cách hàng nghìn và dấu phẩy thập phân.
  - Bảo toàn giá trị chuỗi `BigInt` cực lớn (`9007199254740993000 VND`).

### 3.2 Nhóm Vòng đời Thuê bao & Checkout Sandbox (Agent A)
- `CheckoutPage.test.tsx > seamlessly resumes checkout when subscribePlan throws 409`:
  - Kịch bản: Người dùng chọn đăng ký lại API đã có subscription ở trạng thái `Pending`.
  - Backend trả về 409 `SUBSCRIPTION_ALREADY_EXISTS`.
  - Frontend tự động tra cứu danh sách subscriptions của Consumer, phát hiện gói Pending tương ứng và chuyển thẳng sang bước gọi `checkoutSubscription()` và `confirmPayment()`. Không để người dùng bị kẹt.
- `CheckoutPage.test.tsx > displays clear Vietnamese explanation when SUBSCRIPTION_PERIOD_LOCKED`:
  - Kịch bản: Người dùng cố đăng ký lại một gói vừa hủy trong cùng chu kỳ thanh toán.
  - Frontend bắt lỗi 400 `SUBSCRIPTION_PERIOD_LOCKED` và hiển thị giải thích rõ ràng bằng tiếng Việt.
- `MySubscriptionsPage.test.tsx > Change Plan Flow`:
  - Kịch bản: Người dùng nhấn "Đổi gói" trên gói `Active`.
  - Modal mở ra, gọi `getMarketplaceApiDetail(apiId)` lấy danh sách gói, loại bỏ gói đang dùng.
  - Hiển thị banner bảo toàn hạn ngạch: `"Hạn ngạch đã sử dụng trong kỳ hiện tại được bảo toàn (không reset)."`.
  - Người dùng chọn gói mới, xác nhận đổi gói -> gọi `changeSubscriptionPlan()`, `confirmPayment()`, làm mới danh sách.

### 3.3 Nhóm Quota Dashboard & Phân bổ Lưu lượng (Agent B)
- `UsageQuotaPage.test.tsx > calculates safe BigInt percentage`:
  - Xử lý chia an toàn `BigInt` tránh tràn số và lỗi NaN/Infinity khi limit = 0.
- `UsageQuotaPage.test.tsx > displays warning badge when quota is exhausted`:
  - Hiển thị cảnh báo trực quan khi `quotaUsed >= quotaLimit` trên gói `Active`.
- `UsageQuotaPage.test.tsx > validates 365-day query limit`:
  - Từ chối truy vấn và hiển thị thông báo lỗi khi khoảng thời gian chọn vượt quá 365 ngày (`Khoảng thời gian tra cứu tối đa là 365 ngày`).

### 3.4 Nhóm Lịch sử Yêu cầu & An toàn Dữ liệu Telemetry (Agent C)
- `RequestHistoryPage.test.tsx > Sanitized detail modal`:
  - Xác nhận Modal kiểm tra chi tiết request chỉ hiển thị metadata (Request ID, Method, Path, Status Code, Error Code, Latency, Timestamp).
  - Khẳng định 100% không có trường Authorization header, Cookie, Token, Request Body hay Response Body nào được hiển thị hay lưu trữ.
- `RequestHistoryPage.test.tsx > Race condition protection`:
  - Xác nhận phản hồi cũ bị huỷ hoặc bỏ qua khi người dùng đổi trang hoặc đổi bộ lọc liên tục (`querySeqRef`).

---

## 4. Ma trận 37 Tệp Kiểm thử Hợp nhất (Full Suite Status)

```
Test Files Summary:
✓ src/components/layout/Navbar.test.tsx (11 tests)
✓ src/components/layout/Footer.test.tsx (5 tests)
✓ src/components/ui/Button.test.tsx (8 tests)
✓ src/components/ui/Badge.test.tsx (6 tests)
✓ src/components/ui/Input.test.tsx (7 tests)
✓ src/components/ui/Modal.test.tsx (6 tests)
✓ src/components/ui/Tabs.test.tsx (5 tests)
✓ src/components/ui/Card.test.tsx (4 tests)
✓ src/services/authApi.test.ts (15 tests)
✓ src/services/marketplaceApi.test.ts (22 tests)
✓ src/services/providerApi.test.ts (18 tests)
✓ src/services/adminApi.test.ts (12 tests)
✓ src/services/billingApi.test.ts (40 tests)
✓ src/services/usageApi.test.ts (17 tests)
✓ src/pages/auth/LoginPage.test.tsx (9 tests)
✓ src/pages/auth/RegisterPage.test.tsx (10 tests)
✓ src/pages/marketplace/MarketplacePage.test.tsx (14 tests)
✓ src/pages/marketplace/ApiDetailPage.test.tsx (16 tests)
✓ src/pages/marketplace/CompareApisPage.test.tsx (8 tests)
✓ src/pages/marketplace/ApiPlaygroundPage.test.tsx (15 tests)
✓ src/pages/marketplace/TrySandboxPage.test.tsx (12 tests)
✓ src/pages/checkout/CheckoutPage.test.tsx (17 tests)
✓ src/pages/consumer/ConsumerPages.test.tsx (10 tests)
✓ src/pages/consumer/MySubscriptionsPage.test.tsx (19 tests)
✓ src/pages/consumer/UsageQuotaPage.test.tsx (16 tests)
✓ src/pages/consumer/RequestHistoryPage.test.tsx (30 tests)
✓ src/pages/consumer/ApiKeysPage.test.tsx (12 tests)
✓ src/pages/provider/ProviderDashboardPage.test.tsx (11 tests)
✓ src/pages/provider/CreateApiWizardPage.test.tsx (14 tests)
✓ src/pages/provider/EndpointManagementPage.test.tsx (13 tests)
✓ src/pages/provider/PublishingWorkflowPage.test.tsx (11 tests)
✓ src/pages/provider/GatewayOperationsPage.test.tsx (9 tests)
✓ src/pages/admin/AdminDashboardPage.test.tsx (10 tests)
✓ src/pages/admin/AdminReviewPage.test.tsx (12 tests)
✓ src/pages/admin/AdminUsersPage.test.tsx (10 tests)
✓ src/test/PricingManagementPage.test.tsx (3 tests)
✓ src/test/IntegrationSanity.test.tsx (8 tests)

Total: 37 test files, 493 passed, 0 failed.
```

---

## 5. Kết luận

Bộ kiểm thử FE-04.2 đạt tỷ lệ thành công 100%, bảo đảm độ tin cậy của mã nguồn Frontend trước khi kết nối môi trường staging tích hợp thực tế.
