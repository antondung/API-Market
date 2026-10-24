# SPRINT 3 FRONTEND — INDEPENDENT AUDIT REMEDIATION REPORT

- **Repository:** `https://github.com/antondung/API-Market`
- **Working Branch:** `feature/sprint3-frontend-marketplace`
- **Audited Commit:** `b5ca899f6aefe8314483c950ee83a55016ba5c29`
- **Audit Outcome:** `CHANGES_REQUIRED` → **`RESOLVED / ALL GATES PASSED`**
- **Remediation Date:** 25/10/2026
- **Test Suite:** Vitest 5 + React Testing Library (29 test files, 251 tests passed, 100% green)
- **TypeScript & Bundle:** `tsc -b && vite build` (0 compile errors, 521 modules transformed)

---

## 1. Executive Summary

Cuộc kiểm tra độc lập trên commit `b5ca899f6aefe8314483c950ee83a55016ba5c29` đã phát hiện 8 nhóm vấn đề cần khắc phục (`CHANGES_REQUIRED`) liên quan đến:
1. Rò rỉ thông tin đăng nhập giả lập và sinh secret key phía client.
2. Hardcoded sandbox API key và các tuyên bố không có căn cứ về hạ tầng Gateway.
3. Nguy cơ Shell Injection và thiếu escape an toàn trong các trình tạo code snippet rải rác.
4. Tự tính giá giảm 20% phía client, làm sai lệch tính bất biến giá (Price Immutability) và cam kết SLA/Redis ảo.
5. Xung đột giữa bộ lọc client-side `Verified` và phân trang server-side trên Marketplace.
6. Fallback chéo phiên bản (cross-version fallback) và thiếu kiểm tra hủy request bất đồng bộ (`controller.signal.aborted`).
7. Gọi API không giới hạn đồng thời (unbounded concurrency) và che giấu lỗi chi tiết khi so sánh API.
8. Vi phạm tiêu chuẩn tiếp cận WCAG 2.2 trên thành phần `Modal` (thiếu focus trap, thiếu phím Escape, mất focus restoration).

Toàn bộ 8 nhóm vấn đề đã được khắc phục triệt để và có bằng chứng unit/integration test xác thực. Không có dòng mã nào viết lại Sprint 3 từ đầu, không thay đổi thương hiệu, không bỏ Animate UI, không force push và không tạo PR mới.

---

## 2. Bảng Tổng Hợp 8 Nhóm Findings & Kết Quả Khắc Phục

| ID | Nhóm Vấn Đề | Mức Độ | Bằng Chứng Cũ (`b5ca899`) | Nguyên Nhân Gốc Rễ | File Đã Sửa | Biện Pháp Khắc Phục | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **F-01** | Consumer API Keys: Mock Secrets & Fake Key Generation | **High** (Security) | `demoKeys` chứa 3 keys mẫu; nút Generate sinh khóa bằng `Math.random()`; lưu secret vào state không bao giờ giải phóng. | Giả lập trải nghiệm người dùng cục bộ trước khi có Backend API Key Service. | `frontend/src/pages/consumer/ApiKeysPage.tsx`<br>`frontend/src/pages/consumer/ApiKeysPage.test.tsx` | Xóa hoàn toàn `demoKeys`; hiển thị empty state trung thực chờ Sprint 4; khóa nút tạo key với tooltip giải thích; dọn sạch secret khỏi RAM khi unmount hoặc đóng modal. | **RESOLVED** |
| **F-02** | Try Sandbox: Hardcoded Credentials & Fake Rate Limit | **High** (Security / Credibility) | `ak_sand_consumer_demo_test` hardcoded; hiển thị 'Gateway Guard Active', 'Rate Limit 100/100 remaining' cố định. | Code cứng credential để demo nhanh giao diện; hiển thị các số đo giả lập. | `frontend/src/pages/marketplace/TrySandboxPage.tsx`<br>`frontend/src/pages/marketplace/TrySandboxPage.test.tsx` | Bỏ key hardcoded; bắt buộc nhập key hợp lệ mới mở khóa form; xóa bỏ claims Gateway Guard/Rate Limit ảo; khóa nút Run Request với thông báo an toàn. | **RESOLVED** |
| **F-03** | Scattered & Shell-Injectable Snippet Generators | **High** (Security / Shell Injection) | 3 bộ sinh snippet riêng rẽ trong Playground, Try Sandbox, Detail; nối chuỗi trực tiếp thiếu escape quote; không kiểm tra ký tự nhạy cảm. | Viết vội code snippet riêng lẻ tại từng component mà không có hàm tiện ích trung tâm an toàn. | `frontend/src/utils/apiSnippetGenerator.ts`<br>`frontend/src/utils/apiSnippetGenerator.test.ts`<br>`frontend/src/pages/marketplace/ApiPlaygroundPage.tsx`<br>`frontend/src/pages/marketplace/TrySandboxPage.tsx`<br>`frontend/src/pages/marketplace/ApiDetailPage.tsx` | Tạo module tập trung `apiSnippetGenerator.ts` áp dụng POSIX shell single-quote escaping `'\''`, lọc header CRLF, URLSearchParams an toàn, và banner hướng dẫn thay thế key. | **RESOLVED** |
| **F-04** | Client Price Alteration & Ungrounded Claims | **Medium** (Commercial Integrity) | `PricingPage.tsx` có badge 'Save 20%' và tính `Math.round(priceMonthly * 0.8)`; claim '99.99% Financial SLA' và 'Redis Cluster Rate Limiting'; badge Recommended tự gán cho gói Pro. | Bổ sung logic thương mại giả lập ở frontend mà backend chưa cung cấp chính sách giảm giá năm. | `frontend/src/pages/marketplace/PricingPage.tsx`<br>`frontend/src/pages/checkout/CheckoutPage.tsx`<br>`frontend/src/pages/marketplace/ApiDetailPage.tsx`<br>`frontend/src/pages/marketplace/CompareApisPage.tsx`<br>`frontend/src/services/marketplaceTypes.ts` | Hiển thị giá bất biến đúng `plan.priceMonthly`; vô hiệu hóa toggle Annual với thông báo chờ Sprint 4; đổi claim SLA sang 'Theo cam kết Provider / Thỏa thuận riêng'; chỉ hiển thị Recommended khi `plan.recommended === true`. | **RESOLVED** |
| **F-05** | Marketplace Verified Filter Pagination Inconsistency | **Medium** (Data Integrity & UX) | Checkbox 'Chỉ xem Provider đã xác thực' lọc mảng client-side sau khi backend đã phân trang `page=1, pageSize=20`, làm số lượng card hiển thị nhỏ hơn tổng số trang báo cáo. | Frontend filter chồng chéo lên kết quả phân trang của backend. | `frontend/src/pages/marketplace/MarketplacePage.tsx`<br>`frontend/src/pages/marketplace/MarketplacePage.test.tsx` | Vô hiệu hóa checkbox lọc client-side với thông báo chờ Sprint 4 Backend Filter; giữ nguyên badge Verified trên từng API card để thông tin minh bạch. | **RESOLVED** |
| **F-06** | Version Isolation & Abort Safety | **Medium** (Correctness & Safety) | `ApiDetailPage.tsx` tự động fallback lấy endpoints và OpenAPI docs của phiên bản khác khi phiên bản chọn không có dữ liệu; cập nhật state sau `await` thiếu check `signal.aborted`. | Viết logic phòng vệ quá đà dẫn đến hiển thị sai tài liệu của phiên bản cũ/mới; thiếu kiểm tra cờ hủy request. | `frontend/src/pages/marketplace/ApiDetailPage.tsx`<br>`frontend/src/pages/marketplace/ApiDetailPage.test.tsx` | Lọc endpoint strictly theo `selectedVersionId`; hiển thị honest empty state khi phiên bản thiếu endpoint hoặc tài liệu; kiểm tra `controller.signal.aborted` sau mọi điểm `await` và trong `finally`. | **RESOLVED** |
| **F-07** | Unbounded Concurrency & Error Concealment | **Medium** (Reliability & Observability) | `PricingPage.tsx` gọi song song toàn bộ danh sách API bằng `Promise.all` không giới hạn số luồng; `CompareApisPage.tsx` không phân biệt lỗi 1 bên vs lỗi 2 bên. | Thiếu cơ chế chia đợt (chunking) cho các mảng promise lớn; gộp lỗi chung thành một thông báo chung chung. | `frontend/src/pages/marketplace/PricingPage.tsx`<br>`frontend/src/pages/marketplace/CompareApisPage.tsx`<br>`frontend/src/pages/marketplace/CompareApisPage.test.tsx` | Áp dụng chunked concurrency (chunks of 4) với `Promise.allSettled`; phân biệt rõ ràng trạng thái lỗi API 1, API 2, hoặc cả hai phía với nút thử lại độc lập. | **RESOLVED** |
| **F-08** | Modal WCAG 2.2 Accessibility Violations | **Medium** (Accessibility & UX) | `Modal.tsx` không giữ focus bên trong hộp thoại (Tab thoát ra ngoài body); không đóng bằng phím Escape; không phục hồi focus về phần tử kích hoạt sau khi đóng. | Modal chỉ hỗ trợ hiệu ứng chuyển động và click backdrop mà chưa xây dựng lifecycle quản lý focus bàn phím. | `frontend/src/components/ui/Modal.tsx`<br>`frontend/src/components/ui/Modal.test.tsx` | Bổ sung focus trap (bắt phím Tab và Shift+Tab xoay vòng), lắng nghe phím Escape (`e.key === 'Escape'`), lưu và phục hồi `previousActiveElement.focus()` khi modal unmount, bổ sung đầy đủ ARIA dialog attributes. | **RESOLVED** |

---

## 3. Ma Trận So Sánh Trước & Sau (Before vs After)

### F-01: Consumer API Keys
- **Trước (`b5ca899`):**
  - Mảng tĩnh 3 khóa demo hiển thị trên bảng điều khiển.
  - Form sinh khóa gọi `Math.random().toString(36)` tạo ra chuỗi bí mật giả lập.
  - Secret key tồn tại mãi mãi trong bộ nhớ state React.
- **Sau (Remediated):**
  - Empty state minh bạch với thông báo: *"Dịch vụ cấp phát khóa API tiêu dùng đang được hoàn thiện trong Sprint 4"*.
  - Nút *"Tạo khóa mới"* bị khóa (`disabled`), tooltip giải thích rõ ràng.
  - Bổ sung cleanup effect xóa mọi sensitive state khi component unmount hoặc khi người dùng đăng xuất.

### F-02: Try Sandbox
- **Trước (`b5ca899`):**
  - State mặc định: `apiKey = 'ak_sand_consumer_demo_test'`.
  - Thông số giả lập: *"Rate Limit Remaining: 100/100"*, *"Gateway Guard: Active"*.
- **Sau (Remediated):**
  - State ban đầu: `apiKey = ''`.
  - Bắt buộc nhập Consumer API Key có tiền tố `ak_` mới mở khóa cấu hình tham số.
  - Loại bỏ hoàn toàn các chỉ số đo lường giả lập.
  - Nút *"Gửi yêu cầu thử nghiệm"* bị khóa với ghi chú: *"Trình duyệt không gọi trực tiếp upstream API để chống SSRF. Hãy sử dụng cURL dưới đây để chạy trên terminal cá nhân"*.

### F-03: Centralized Snippet Generator
- **Trước (`b5ca899`):**
  - Code sinh cURL, Fetch, Python bị trùng lặp ở 3 file với phương pháp nối chuỗi thô sơ `curl -X ${method} "${url}"`.
  - Chuỗi tham số và header chứa ký tự đặc biệt có thể phá vỡ lệnh shell.
- **Sau (Remediated):**
  - Tạo module duy nhất: `frontend/src/utils/apiSnippetGenerator.ts`.
  - Áp dụng POSIX shell argument escaping: bao bọc chuỗi trong nháy đơn và thay thế `'` bằng `'\''`.
  - Kiểm tra tính hợp lệ của Header Key bằng regex `/^[a-zA-Z0-9_-]+$/` và loại bỏ ký tự ngắt dòng `\r\n`.
  - Sử dụng `URLSearchParams` để mã hóa chuẩn hóa query string.
  - Đặt banner khuyến cáo: `Thay thế YOUR_API_KEY bằng API Key thật của bạn`.

### F-04: Price Immutability & Claims Cleanup
- **Trước (`b5ca899`):**
  - Toggle Annual kích hoạt tính toán: `Math.round(priceMonthly * 0.8)`.
  - Badge `Save 20%` tự động hiển thị.
  - Cam kết *"99.99% Financial SLA"* và *"Redis Cluster Rate Limiting"*.
  - Gói Pro tự động có badge *"Recommended"*.
- **Sau (Remediated):**
  - Giá cước hiển thị nguyên bản `plan.priceMonthly` lấy từ backend REST API.
  - Nút Annual bị khóa kèm nhãn *"Chờ Sprint 4"*.
  - Cam kết SLA chuyển thành *"Theo cam kết Provider / Thỏa thuận riêng (Enterprise)"*.
  - Xóa bỏ mọi tham chiếu tới Redis cluster chưa kiểm chứng trong FAQ và Checkout.
  - Badge *"Recommended"* chỉ xuất hiện khi và chỉ khi `plan.recommended === true` trong dữ liệu API trả về.

### F-05: Marketplace Verified Filter
- **Trước (`b5ca899`):**
  - Checkbox lọc `Chỉ xem Provider đã xác thực` áp dụng hàm `items.filter(...)` cục bộ sau phân trang.
  - Trang 1 chỉ hiển thị 8 card dù tổng số thông báo là 20 API.
- **Sau (Remediated):**
  - Checkbox lọc phía client được khóa tạm thời với badge *"Chờ Sprint 4 (Backend Filter)"*.
  - Đảm bảo số card hiển thị trên trang luôn khớp chính xác với `pageSize` và `total` do backend trả về.
  - Huy hiệu *"Verified"* màu xanh lá vẫn hiển thị nguyên vẹn trên từng API card để vinh danh nhà phát hành uy tín.

### F-06: Version Isolation & Abort Safety
- **Trước (`b5ca899`):**
  - Khi phiên bản v2 không có endpoints, giao diện tự ý fallback lấy danh sách endpoints của v1.
  - Các hàm `useEffect` gọi `getMarketplaceApiDetail` thiếu kiểm tra `if (controller.signal.aborted) return` sau `await`.
- **Sau (Remediated):**
  - Lọc endpoint nghiêm ngặt: `ep.versionId === selectedVersionId`. Nếu không có, hiển thị empty state trung thực *"Phiên bản này chưa công bố endpoint công khai"*.
  - Thêm kiểm tra `if (controller.signal.aborted) return;` ngay sau mọi câu lệnh `await` và bên trong khối `finally` trước khi cập nhật `setIsLoading(false)`.

### F-07: Bounded Concurrency & Compare Error Handling
- **Trước (`b5ca899`):**
  - `PricingPage.tsx` gọi song song toàn bộ danh sách API bằng `Promise.all` không giới hạn số luồng.
  - `CompareApisPage.tsx` hiển thị chung một lỗi *"Không thể tải dữ liệu so sánh"* khi một trong hai API thất bại.
- **Sau (Remediated):**
  - Triển khai thuật toán xử lý theo lô (chunks of 4) sử dụng `Promise.allSettled` trên `PricingPage.tsx`.
  - Dữ liệu partial tải thành công vẫn được hiển thị kèm cảnh báo vàng cho các API bị lỗi.
  - `CompareApisPage.tsx` phân biệt rõ ràng: Lỗi API 1 (API 2 vẫn hiển thị), Lỗi API 2 (API 1 vẫn hiển thị), hoặc Lỗi cả hai bên với nút *"Thử lại"* độc lập cho từng vị trí.

### F-08: Modal Accessibility (WCAG 2.2)
- **Trước (`b5ca899`):**
  - Người dùng bấm Tab có thể di chuyển con trỏ ra ngoài modal vào thanh địa chỉ trình duyệt hoặc nội dung nền.
  - Phím Escape không đóng modal.
  - Khi đóng modal, tiêu điểm bàn phím bị mất, không quay lại nút bấm ban đầu.
- **Sau (Remediated):**
  - Bổ sung focus trap: chặn phím Tab ở phần tử cuối cùng để quay lại phần tử đầu tiên và ngược lại khi Shift+Tab.
  - Lắng nghe sự kiện bàn phím toàn cục: nhấn Escape tự động gọi `onClose()`.
  - Lưu trữ `document.activeElement` vào `previousActiveElementRef` khi mở modal và tự động gọi `.focus()` khi unmount.
  - Cung cấp đầy đủ thuộc tính hỗ trợ đọc màn hình: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title"`, `aria-describedby="modal-description"`.

---

## 4. Báo Cáo Kiểm Thử Mới (Quality Gate Verification)

### 4.1. Chỉ Số Kiểm Thử Tự Động
- **Số lượng test trước khi remediate (`b5ca899`):** 209 tests (21 test files).
- **Số lượng test sau khi remediate:** **251 tests (29 test files)**.
- **Tăng thêm:** **+42 tests** đạt chuẩn, tập trung 100% vào các trường hợp biên an ninh và tính toàn vẹn dữ liệu.
- **Tỉ lệ vượt qua:** **100% PASS (251/251 tests)**.

```text
 RUN  v5.0.4 C:/Users/duwn/Documents/api-hub/frontend

 Test Files  29 passed (29)
      Tests  251 passed (251)
   Start at  00:30:04
   Duration  231.81s
```

### 4.2. Danh Sách Các Test Suites Mới & Mở Rộng
1. `src/utils/apiSnippetGenerator.test.ts` (14 tests) — Kiểm thử POSIX single quote escaping, ngăn chặn command injection, lọc header CRLF, và format URLSearchParams.
2. `src/components/ui/Modal.test.tsx` (4 tests) — Kiểm thử ARIA attributes, phím Escape, Tab/Shift+Tab focus trap, và focus restoration.
3. `src/pages/consumer/ApiKeysPage.test.tsx` (6 tests) — Kiểm thử empty state, khóa tạo key, clipboard copy, và xóa sensitive state khi unmount.
4. `src/pages/marketplace/TrySandboxPage.test.tsx` (4 tests) — Kiểm thử loại bỏ key hardcoded, bắt buộc nhập key, khóa submit, và loại bỏ metric giả.
5. `src/pages/marketplace/PricingPage.test.tsx` (3 tests) — Kiểm thử tính bất biến giá (không có discount 20%), khóa Annual toggle, và loại bỏ claim Redis/SLA.
6. `src/pages/marketplace/CompareApisPage.test.tsx` (3 tests) — Kiểm thử so sánh song song, xử lý lỗi từng phần (partial failure) và lỗi toàn phần.
7. `src/pages/marketplace/ApiPlaygroundPage.test.tsx` (4 tests) — Kiểm thử an toàn snippet, khóa send request chống SSRF, và chuyển tab an toàn.
8. `src/pages/checkout/CheckoutPage.test.tsx` (2 tests) — Kiểm thử hiển thị giá chuẩn và thay thế claim Redis Guard sang API Gateway Egress.
9. `src/pages/marketplace/MarketplacePage.test.tsx` (7 tests, +1 test mới) — Kiểm thử tính nhất quán giữa bộ lọc client và phân trang server.
10. `src/pages/marketplace/ApiDetailPage.test.tsx` (8 tests, +1 test mới) — Kiểm thử cách ly phiên bản (version isolation) không fallback.

### 4.3. Kết Quả Kiểm Tra Mã Nguồn (Lint)
Lệnh chạy: `npm run lint` (`oxlint`).
- **Lỗi nghiêm trọng (Errors):** **0 errors**.
- Tất cả các file đã sửa đều sạch 100% cảnh báo chưa sử dụng biến (unused variables).

### 4.4. Kết Quả Đóng Gói (Production Build)
Lệnh chạy: `npm run build` (`tsc -b && vite build`).
- **Lỗi biên dịch TypeScript (tsc):** **0 errors**.
- **Kết quả đóng gói Vite:** Thành công trong **4.51s**, chuyển đổi **521 modules**.

---

## 5. Minh Bạch Về Các Tính Năng Chờ Sprint 4

Để duy trì tính minh bạch kỹ thuật cao nhất đối với hội đồng đánh giá và các bên liên quan, các tính năng sau đây được giữ ở trạng thái chờ kích hoạt (disabled có thông báo) thay vì giả lập cục bộ:

1. **Gateway Proxy Live Execution (Data Plane):**
   - *Lý do:* Trình duyệt web không được phép gọi trực tiếp các địa chỉ IP của nhà cung cấp để triệt tiêu nguy cơ SSRF và Cross-Origin request tampering.
   - *Kế hoạch Sprint 4:* Triển khai API Gateway Proxy Service tại backend (`/api/gateway/proxy-sandbox`) với danh sách IP allowlist, kiểm tra rate limit thực tế và ghi audit log.
2. **Backend API Key Issuance & Secret Hashing:**
   - *Lý do:* Khóa bí mật API phải được sinh bởi thuật toán ngẫu nhiên mật mã học an toàn (CSPRNG) trên máy chủ và chỉ được lưu trữ dưới dạng hash (SHA-256 / bcrypt).
   - *Kế hoạch Sprint 4:* Kết nối Consumer Portal với microservice quản trị định danh và khóa bí mật.
3. **Chính Sách Thanh Toán Năm & Gateway SLAs:**
   - *Lý do:* Việc giảm giá 20% và các gói cam kết tài chính (Financial SLA) phải gắn liền với hợp đồng kinh doanh và Gateway Billing Engine tại backend.
   - *Kế hoạch Sprint 4:* Tích hợp dịch vụ tính cước (Billing & Invoicing Service) hỗ trợ chu kỳ thanh toán năm và quản lý hạn mức băng thông tự động.

---

## 6. Kết Luận

Toàn bộ các yêu cầu của đợt Remediation đã được thực hiện trọn vẹn, chính xác, và an toàn. Nhánh `feature/sprint3-frontend-marketplace` hiện đại diện cho một sản phẩm frontend hoàn chỉnh, minh bạch, bảo mật, và sẵn sàng cho các bài kiểm tra chấp nhận người dùng (UAT) cũng như đợt tích hợp backend tiếp theo trong Sprint 4.
