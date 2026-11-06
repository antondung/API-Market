# API HUB — FRONTEND SPRINT 4 ACCEPTANCE MATRIX
## Issue #18: Consumer Billing · Usage & History · Provider Analytics · Code Generator

- **Assignee (Issue #18):** Lê Hải Dương (`@leduwn`, Frontend Developer)
- **Git Committer & Operations Lead:** Nguyễn Tấn Dũng (`@antondung`, Frontend Tech Lead & Operations)
- **Branch:** `feature/18-sprint4-frontend-billing`
- **Target Branch:** `develop`
- **Pull Request:** [antondung/API-Market#96](https://github.com/antondung/API-Market/pull/96) (Draft)
- **Audit Date:** 2026-11-05
- **Quality Verification:** 40 test suites passed, 517 tests passed, 0 errors, 0 regressions

---

## 1. Acceptance Criteria Verification Matrix

| AC Code | Chức năng nghiệm thu | Tệp mã nguồn & Thành phần | Điều kiện tiên quyết & Hành vi nghiệp vụ | Bằng chứng kiểm thử & Test file | Kết quả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AC-01** | **Plan Selection & Checkout Sandbox** | `CheckoutPage.tsx`<br>`MySubscriptionsPage.tsx`<br>`billingApi.ts` | 1. Chọn gói Free kích hoạt ngay (`201 Created`, trạng thái `Active`).<br>2. Gói Paid chuyển `Pending` -> gọi `POST /checkout` lấy token tạm thời.<br>3. Người dùng chọn mô phỏng Sandbox: Success (`Active`, cấp phát 30 ngày) hoặc Failure (`Canceled`).<br>4. Giải quyết triệt để lỗi 409 deadlock khi tiếp tục thanh toán gói `Pending`.<br>5. Đổi gói (Change Plan) bảo toàn hạn mức `quotaUsed` đã dùng trong kỳ.<br>6. Hủy gói hỗ trợ cả 2 chế độ: hết hạn kỳ (`cancel_at_period_end: true`) và hủy ngay lập tức (`immediate: true`). | `src/pages/checkout/CheckoutPage.test.tsx`<br>`src/services/billingApi.test.ts`<br>`src/pages/consumer/ConsumerPages.test.tsx` | **PASS** |
| **AC-02** | **Consumer Usage Dashboard** | `UsageQuotaPage.tsx`<br>`ConsumerDashboardPage.tsx`<br>`usageApi.ts` | 1. Hiển thị hạn mức đã dùng (`quotaUsed`), hạn mức tối đa (`quotaLimit`), số lượt còn lại (`remainingRequests`).<br>2. Hiển thị rõ chu kỳ thanh toán (`periodStart` - `periodEnd`).<br>3. Thống kê tổng số yêu cầu, số lượt thành công, số lượt lỗi theo ngày.<br>4. Biểu đồ và bảng viễn trắc lưu lượng hàng ngày.<br>5. Bộ lọc thời gian chuẩn ISO 8601, kiểm soát biên tối đa 365 ngày và chặn ngày đảo ngược. | `src/pages/consumer/UsageQuotaPage.test.tsx`<br>`src/services/usageApi.test.ts`<br>`src/pages/consumer/ConsumerPages.test.tsx` | **PASS** |
| **AC-03** | **Request History (Telemetry Logs)** | `RequestHistoryPage.tsx`<br>`usageApi.ts` | 1. Thời gian sự kiện định dạng chuẩn `vi-VN` (DD/MM/YYYY HH:mm:ss).<br>2. Tên API và đường dẫn đã khử dữ liệu nhạy cảm (`path` sanitized).<br>3. Huy hiệu HTTP Method và HTTP Status Code (2xx xanh lá, 4xx hổ phách, 5xx đỏ).<br>4. Độ trễ yêu cầu (`latencyMs`).<br>5. Phân trang phía máy chủ (`page`, `pageSize`, `total`).<br>6. Hộp thoại xem chi tiết siêu dữ liệu an toàn, tuân thủ nguyên tắc Zero Credential Leakage (không chứa `Authorization`, API Key, Cookie, Request/Response body). | `src/pages/consumer/RequestHistoryPage.test.tsx`<br>`src/services/usageApi.test.ts` | **PASS** |
| **AC-04** | **API Code Generator & Gateway Route** | `apiSnippetGenerator.ts`<br>`CodeBlock.tsx`<br>`ApiDetailPage.tsx` | 1. Sinh đường dẫn Gateway chuẩn hóa `/api/gateway/:apiId/*rest`.<br>2. Hỗ trợ 3 ngôn ngữ: cURL, JavaScript (`fetch`), Python (`requests`).<br>3. Dropdown cho phép chọn từng endpoint để cập nhật mã nguồn mẫu động.<br>4. Xử lý an toàn query parameters và path parameters.<br>5. Nút Copy với phản hồi trực quan: Thành công (Copied + check xanh), Thất bại (Failed + error đỏ).<br>6. API Key dạng giữ chỗ an toàn (`YOUR_API_KEY`), không rò rỉ secret cục bộ. | `src/utils/apiSnippetGenerator.test.ts`<br>`src/components/ui/CodeBlock.test.tsx`<br>`src/pages/marketplace/ApiDetailPage.test.tsx` | **PASS** |
| **AC-05** | **Provider Analytics & Multi-Currency** | `ProviderDashboardPage.tsx`<br>`AnalyticsHealthPage.tsx`<br>`usageApi.ts` | 1. Kết nối dữ liệu thực tế từ `usageApi.getProviderAnalyticsOverview`.<br>2. Thẻ KPI: Tổng lượt gọi (Total Requests), Tỷ lệ thành công (Success Rate), Tỷ lệ lỗi (Error Rate), Thuê bao hoạt động (Active Subscribers), Độ trễ trung bình (Average Latency), Doanh thu Sandbox.<br>3. Bảng phân tích lưu lượng theo ngày.<br>4. Tách biệt doanh thu theo từng loại tiền tệ (multi-currency), tuyệt đối không cộng dồn chéo VND + USD.<br>5. Loại bỏ hoàn toàn các khối giữ chỗ giả lập (`Chưa có dữ liệu backend`) và số liệu 100% ảo. | `src/pages/provider/ProviderDashboardPage.test.tsx`<br>`src/pages/provider/AnalyticsHealthPage.tsx`<br>`src/test/IntegrationConnections.test.tsx` | **PASS** |

---

## 2. Ma trận Khắc phục & Hoàn thiện Chuyên sâu (Issues C01 – C08)

| Mã lỗi / Issue | Nội dung & Yêu cầu | Tệp mã nguồn can thiệp | Giải pháp kỹ thuật đã áp dụng | Kết quả kiểm thử |
| :--- | :--- | :--- | :--- | :--- |
| **ISSUE C01** | Tránh rò rỉ snapshot cũ khi chuyển đổi tài khoản tại ConsumerDashboard | `ConsumerDashboardPage.tsx` | Ràng buộc `useEffect` theo `user.id`, hủy request dở dang bằng `AbortController`, làm sạch dữ liệu cũ (`setUsageSummary(null)`) trước khi tải mới. | **VERIFIED** |
| **ISSUE C02** | Không nuốt lỗi mạng thành danh sách rỗng, không đếm `Pending` là `Active` | `ConsumerDashboardPage.tsx`<br>`ConsumerPages.test.tsx` | Lưu trữ `usageError` riêng biệt, cung cấp nút "Thử lại", chỉ đếm các thuê bao có `status === 'Active'`. | **VERIFIED** |
| **ISSUE C03** | Loại bỏ triệt để nhãn `req/sec` / `RPS` gây hiểu lầm điều tiết Gateway | `PricingPage.tsx`<br>`TrySandboxPage.tsx`<br>`DocumentationViewer.tsx`<br>`AppContext.tsx`<br>`vi.json`, `vi-custom.json` | Đồng bộ toàn bộ giao diện sang đơn vị chuẩn `req/phút` (RPM), bảo đảm khớp 100% với cơ chế fixed window (calendar minute bucket) của Redis Gateway. | **VERIFIED** |
| **ISSUE C04** | Hỗ trợ tìm kiếm phục hồi gói `Pending` phân trang vượt mốc 100 đăng ký | `CheckoutPage.tsx` | Vòng lặp quét phân trang có giới hạn an toàn (tối đa 10 trang, 100 mục/trang), ưu tiên nhận `resumeSubscriptionId` từ route state. | **VERIFIED** |
| **ISSUE C05** | Minh bạch hóa kết quả mô phỏng đổi gói Sandbox | `MySubscriptionsPage.tsx` | Thêm radio chọn kết quả mô phỏng (Thành công / Thất bại). Khi thất bại, không reset hạn mức và không hủy gói hiện có. | **VERIFIED** |
| **ISSUE C06** | Khả năng phục hồi toàn diện trên các trang người tiêu dùng khi đổi tài khoản / lỗi HTTP | `UsageQuotaPage.tsx`<br>`RequestHistoryPage.tsx`<br>`MySubscriptionsPage.tsx` | Sử dụng `AbortController` và `querySeqRef` trên tất cả các trang, phân định rõ ràng lỗi 401/403/429/503. | **VERIFIED** |
| **ISSUE C07** | Hiệu chỉnh tài liệu kiểm toán hợp đồng payload cho change-plan và checkout | `SPRINT4_FE_04_2_CONTRACT_AUDIT.md` | Sửa payload bảng: `change-plan` gồm `{ planId, idempotencyKey }`, `checkout` gồm `{ idempotencyKey }`. | **VERIFIED** |
| **ISSUE C08** | Duy trì quyền tác giả chính xác cho Issue #18 và Committer | `CONTRIBUTORS.md`<br>Git commits<br>PR #96 | Đảm bảo đúng vai trò: Assignee Lê Hải Dương (`@leduwn`), Git Committer & Operations Nguyễn Tấn Dũng (`@antondung`), không thêm `Co-Authored-By`. | **VERIFIED** |

---

## 3. Tóm tắt Kiểm thử & Đảm bảo Chất lượng

```
Test Suites: 40 passed, 40 total
Tests:       517 passed, 517 total
Snapshots:   0 total
Lint:        0 error (oxlint)
TypeScript:  0 error (tsc -b)
Vite Build:  2.44s (Production bundle clean)
Hygiene:     368 files passed (kiem-tra-kho-ma-nguon.ps1)
```

**Kết luận:** Đạt 100% tiêu chí nghiệm thu Sprint 4 (AC-01 đến AC-05). Sẵn sàng chuyển giao cho vòng kiểm thử tích hợp tiếp theo.
