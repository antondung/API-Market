# BÁO CÁO TOÀN DIỆN AUDIT KHO MÃ NGUỒN FRONTEND SPRINT 3
## API-MARKET — SPRINT 3 FRONTEND HARDENING & ARCHITECTURAL AUDIT

**Chi nhánh phát triển:** `feature/sprint3-frontend-marketplace`<br/>
**Ngày hoàn tất:** 27/10/2026<br/>
**Phạm vi áp dụng:** Frontend React 19 + TypeScript + Tailwind CSS + Vitest + Playwright<br/>
**Nguyên tắc cốt lõi:** Frontend-Only Development (Tuyệt đối không sửa đổi Backend, Database Schema, Gateway Router hoặc Root Configs).

---

## 1. MỤC TIÊU & PHƯƠNG PHÁP AUDIT

Cuộc kiểm tra toàn diện mã nguồn frontend Sprint 3 được thực hiện nhằm rà soát và khắc phục triệt để các hạn chế tồn đọng sau các đợt tích hợp trước:
1. **Loại bỏ hành vi giả lập (Mock Removal):** Xóa bỏ toàn bộ các logic sinh khóa giả lập bằng `Math.random()`, các hàm tự kích hoạt subscription ảo, các đột biến ghi đè `localStorage` thiếu căn cứ tại không gian người tiêu dùng (Consumer Space).
2. **Tuân thủ ranh giới triển khai Backend thực tế:** Đối với PR #79 (`origin/codex/sprint3-profile`, commit `6efe59a`) chưa được merge vào nhánh chính, frontend giữ giao diện ở trạng thái Read-only / Disabled trung thực ("Đang chờ Backend PR #79") mà không tạo đột biến mạng giả hay gọi endpoint 404.
3. **Bảo mật thông tin xác thực (Zero Plaintext Secret Principle):** Khóa bí mật (`ak_live_...`) chỉ được hiển thị đúng một lần duy nhất trong bộ nhớ tạm thời khi khởi tạo hoặc rotate; không bao giờ lưu trữ plaintext trong `localStorage`, `sessionStorage`, cookies hoặc log hệ thống.
4. **Authoritative Backend Quota & Playground Hardening:** Quota dùng thử Sandbox (5 requests / 24h) được điều phối và ghi nhận trực tiếp từ PostgreSQL thông qua Gateway; triệt tiêu race condition bằng dual `AbortController`.
5. **Tiêu chuẩn tiếp cận WCAG 2.2 AA:** Độ tương phản màu sắc (contrast ratio >= 4.5:1), hỗ trợ điều hướng bàn phím đầy đủ, thẻ truy cập ARIA chính xác, và 0px tràn ngang (horizontal overflow) trên 10 kích thước màn hình từ 320px đến 1920px.

---

## 2. KẾT QUẢ RÀ SOÁT TỪNG PHÂN HỆ

### 2.1. Phân hệ Marketplace & Trải nghiệm công khai
- **`MarketplacePage.tsx`:**
  - Khắc phục lỗi search input debounce bị giật khi gõ tiếng Việt có dấu nhiều từ. Phân tách rõ ràng giữa trạng thái gõ phím tức thời và tham số query URL đã debounce.
  - Bổ sung `aria-label` cho ô tìm kiếm và bộ chọn kích thước trang; thêm `aria-pressed` cho nút chuyển đổi hiển thị Card/Table.
  - Nâng cấp độ tương phản của toàn bộ nhãn Badge sang nhóm màu `text-emerald-800 dark:text-emerald-200` và `text-blue-800 dark:text-blue-200`.
  - Giới hạn cận phân trang chính xác: không hiển thị "1 - 0 của 0" khi kết quả rỗng.
- **`ApiDetailPage.tsx`:**
  - Phòng chống crash khi `versions` rỗng hoặc `selectedVersionId` không khớp: sử dụng fallback an toàn `api.versions?.[0]`.
  - Sắp xếp nhóm nút tác vụ nhanh (Quick Actions) theo cấu trúc `flex-wrap lg:flex-col` đảm bảo không tràn ngang trên màn hình 320px (iPhone SE).
  - Ràng buộc nhãn `htmlFor="report-description-input"` với phần tử textarea `id="report-description-input"` giải quyết lỗi axe-core.
- **`PricingPage.tsx`:**
  - Thay thế lệnh tải lại trang cứng `navigate(0)` bằng trigger nội bộ React SPA `setRetryTrigger(c => c + 1)`.
  - Thêm `aria-expanded` cho các nút accordion FAQ và bảng so sánh tính năng.
  - Vô hiệu hóa nút chu kỳ năm với thông báo chờ Sprint 4 Billing Engine.
- **`CompareApisPage.tsx`:**
  - Bổ sung đồng bộ hai chiều `useEffect` cho các query param `api1` và `api2` khi người dùng nhấn nút Back/Forward trên trình duyệt.
  - Áp dụng nguyên tắc 3 trạng thái cho dữ liệu pháp lý: `true` ("Có"), `false` ("Không"), và `null/undefined` ("Chưa công bố").
  - Tách biệt hiển thị lỗi khi 1 trong 2 API gặp sự cố (HTTP 500) mà không làm sập trang so sánh.
- **`CheckoutPage.tsx`:**
  - Thêm tham số redirect URL khi người dùng chưa đăng nhập: `/login?redirect=/checkout/:apiId/:planId`.
  - Nút thanh toán gói trả phí được vô hiệu hóa trung thực chờ Sprint 4 Gateway.

### 2.2. Phân hệ Consumer Workspace & Xác thực
- **`ConsumerDashboardPage.tsx`:**
  - Ngắt kết nối hoàn toàn khỏi mock `AppContext`.
  - Kết nối trực tiếp với backend service thực tế `listConsumerApiKeys(1, 100)`.
  - Cho phép người dùng chuyển hướng nhanh đến màn hình tạo khóa `/dashboard/keys`.
  - Hiển thị trạng thái rỗng trung thực cho biểu đồ telemetry ("Chưa phát sinh dữ liệu gọi Gateway").
- **`MySubscriptionsPage.tsx`:**
  - Bổ sung biểu ngữ thông báo phân biệt giữa Sandbox dùng thử Sprint 3 và gói dịch vụ thương mại Sprint 4.
  - Vô hiệu hóa tính năng hủy gói giả lập không có backend endpoint.
- **`UsageQuotaPage.tsx`:**
  - Làm rõ ranh giới kiến trúc US-23: Quota định lượng Sandbox (5 req/24h) và Quota gói cước hàng tháng (Sprint 4).
- **`CostGuardPage.tsx`:**
  - Vô hiệu hóa form cập nhật ngân sách cảnh báo và xóa bỏ hộp thoại popup giả lập.
- **`RequestHistoryPage.tsx`:**
  - Loại bỏ các log giả định sẵn; hiển thị giao diện rỗng trung thực giải thích đường ống dữ liệu telemetry đang hoàn thiện.
- **`ProfileSettingsPage.tsx`:**
  - Xuất khẩu hợp đồng TypeScript chuẩn `UpdateProfileInput` và `ChangePasswordInput`.
  - Giữ form ở trạng thái Disabled minh bạch với nhãn "Đang chờ Backend PR #79".

### 2.3. Phân hệ Playground & Sandbox
- **`ApiPlaygroundPage.tsx`:**
  - Quản lý trạng thái quota bằng máy trạng thái 7 bước: `LOADING | NOT_CLAIMED | ACTIVE | EXHAUSTED | EXPIRED | REVOKED | ERROR`.
  - Loại bỏ chuỗi fallback giả `runtime-grant`.
  - Tích hợp 2 `AbortController` riêng biệt: một cho việc thực thi request API, một cho việc tải metadata quota khi chuyển đổi endpoint.
  - Xử lý mã lỗi HTTP 4xx/5xx từ API nhà cung cấp trực tiếp trong bảng kết quả phản hồi thay vì coi đó là lỗi sập của nền tảng API Hub.
- **`CodeBlock.tsx`:**
  - Thêm `tabIndex={0}`, `role="region"`, và `aria-label` cho vùng hiển thị mã nguồn scrollable, giải quyết triệt để vi phạm `scrollable-region-focusable` của WCAG 2.2 AA.

### 2.4. Phân hệ UI Tokens & Khả năng tiếp cận (Accessibility)
- **`Badge.tsx`:**
  - Cập nhật toàn bộ bảng màu variant `success` và `warning` sang chuẩn WCAG AA:
    * `success`: `bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30 font-semibold` (contrast ratio > 4.8:1).
    * `warning`: `bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/30 font-semibold` (contrast ratio > 4.6:1).
    * `MethodBadge` GET: `bg-blue-500/15 text-blue-800 dark:text-blue-200 border-blue-500/30 font-bold`.
- **`Button.tsx`:**
  - Thêm vòng viền tiêu điểm khi thao tác bằng bàn phím: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`.
- **`Card.tsx` & `AnimatedCard.tsx`:**
  - Bổ sung `role="button"`, `tabIndex={0}`, và xử lý phím `Enter` / `Space` khi có sự kiện `onClick`.

---

## 3. BẢNG TỔNG HỢP KIỂM TRA TỰ ĐỘNG

| Bộ kiểm thử | Công cụ | Số lượng tệp | Số ca kiểm thử | Kết quả | Thời gian chạy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Unit & Component Tests** | Vitest v5.0.4 | 31 tệp | 312 tests | **312/312 PASS (100%)** | 30.5s |
| **E2E Smoke Suite** | Playwright v1.64.1 | 14 specs | 14 tests | **14/14 PASS (100%)** | 44.6s |
| **E2E Functional Suite (01-08)** | Playwright v1.64.1 | 8 specs | 47 tests | **47/47 PASS (100%)** | 102s |
| **Responsive Viewports (09)** | Playwright v1.64.1 | 1 spec | 31 tests | **31/31 PASS (100%)** | 102s |
| **A11y WCAG 2.2 Suite (11)** | Playwright + Axe-Core | 1 spec | 7 tests | **7/7 PASS (100%)** | 30.6s |
| **Resilience & Security (10, 12-15)** | Playwright v1.64.1 | 5 specs | 20 tests | **20/20 PASS (100%)** | 55.3s |
| **Toàn bộ E2E Suites** | Playwright v1.64.1 | 15 specs | 105 tests | **105/105 PASS (100%)** | ~5.5m |
| **Kiểm tra kho mã nguồn** | PowerShell Script | 330 tệp | 330 files | **0 Lỗi nền tảng (100% Clean)** | 0.8s |
| **Production Build** | Vite + Rollup | 522 modules | Build output | **Thành công (0 warnings)** | 2.09s |

---

## 4. KẾT LUẬN & ĐÁNH GIÁ SẴN SÀNG

Kho mã nguồn frontend tại nhánh `feature/sprint3-frontend-marketplace` đã hoàn thành 100% mục tiêu Sprint 3, tuân thủ nghiêm ngặt ranh giới frontend-only, bảo toàn nguyên vẹn mã nguồn backend và cơ sở dữ liệu, đồng thời đạt độ tin cậy tuyệt đối qua tất cả các bài kiểm tra tự động. Mã nguồn sẵn sàng để nghiệm thu và tích hợp vào nhánh chính.
