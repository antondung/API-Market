# API HUB — BÁO CÁO HOÀN THÀNH SPRINT 3 (FRONTEND PUBLIC MARKETPLACE & CONSUMER EXPERIENCE)

**Branch:** `feature/sprint3-frontend-marketplace`  
**Ngày hoàn thành:** 24/10/2026  
**Tác giả:** Engineering Team  
**Môi trường:** React 19 + TypeScript + Vite + Tailwind CSS + Vitest + React Testing Library  

---

## 1. TỔNG QUAN SPRINT 3

Sprint 3 tập trung chuyển đổi toàn bộ trải nghiệm người tiêu dùng công khai (Public Marketplace & Consumer Portal) từ mô hình mock/demo sang tầng Control Plane tích hợp trực tiếp với backend REST API (`/api/marketplace/apis`, `/api/marketplace/apis/:id`). 

Toàn bộ dữ liệu hardcode giả lập đã được loại bỏ hoàn toàn khỏi các luồng giao diện chính. Mọi tương tác đều tuân thủ các nguyên tắc an ninh cấp enterprise:
- **Loại bỏ hoàn toàn mock data:** Không còn fallback mảng tĩnh che giấu lỗi máy chủ.
- **Phân tách ranh giới an toàn (Control Plane vs Data Plane):** Frontend Marketplace đóng vai trò hiển thị danh mục và siêu dữ liệu (Control Plane). Không gửi request trực tiếp từ trình duyệt tới máy chủ API bên thứ ba để phòng chống SSRF.
- **Bảo mật bí mật xác thực:** Loại bỏ việc sinh API Key giả ở frontend (`Math.random()`). API Key chỉ được cấp phát an toàn từ backend thông qua CSPRNG.
- **Tuân thủ Zod Schema nghiêm ngặt (`zod.strict()`):** Loại bỏ toàn bộ tham số mặc định (`page=1`, `pageSize=20`, `category='All'`) và ký tự NUL (`\0`) khỏi query parameters để không bị từ chối với HTTP 400.

---

## 2. KIẾN TRÚC & MÔ HÌNH BẢO MẬT

```
+-----------------------------------------------------------------------------------+
|                                CLIENT BROWSER                                     |
|  +---------------------+   +---------------------+   +-------------------------+  |
|  |   MarketplacePage   |   |    ApiDetailPage    |   |   ApiPlaygroundPage     |  |
|  | (Faceted Filter)    |   | (Versions/Docs/Plan)|   | (cURL Builder / Safe UI)|  |
|  +----------+----------+   +----------+----------+   +------------+------------+  |
|             |                         |                           |               |
|             +-------------------------+---------------------------+               |
|                                       | (AbortController / Sanitize)              |
|                                       v                                           |
|                            [marketplaceApi Service]                              |
+---------------------------------------+-------------------------------------------+
                                        | (HTTPS via authApi / apiRequest)
                                        v
+-----------------------------------------------------------------------------------+
|                        API HUB BACKEND (Control Plane)                            |
|                                                                                   |
|   GET /api/marketplace/apis -------------------> [ Marketplace Service ]         |
|   GET /api/marketplace/apis/:id --------------> [ PostgreSQL Database ]          |
|                                                                                   |
|   Security Boundary:                                                              |
|   * Strict Zod parsing (strips unexpected query params)                           |
|   * Only APIs with status = 'Published' and verified providers are exposed        |
|   * No SSRF forward from client browser                                           |
+-----------------------------------------------------------------------------------+
```

### Các nguyên tắc an ninh cốt lõi đã áp dụng:
1. **Phòng chống SSRF (Server-Side Request Forgery):**
   - Trình duyệt người dùng không được phép trực tiếp gọi tới `baseUrl` của nhà cung cấp API (ngăn chặn tấn công port scanning vào mạng nội bộ 127.0.0.1 hoặc 192.168.x.x).
   - Tại `ApiPlaygroundPage`, nút "Send Request" được giữ trạng thái an toàn có thông báo giải thích rõ ràng và cung cấp lệnh cURL mẫu để chạy trực tiếp trên môi trường độc lập của lập trình viên cho đến khi Gateway Proxy được kích hoạt trong Sprint 4.
2. **Loại bỏ Secret Storage Client-Side:**
   - Không lưu trữ plaintext secret key trong `localStorage` hay `sessionStorage`.
   - Trang `ApiKeysPage` hiển thị chính xác trạng thái chưa kích hoạt tạo khóa từ frontend và hướng dẫn sử dụng API Key mẫu.
3. **Lifecycle An Toàn & Chống Race Condition:**
   - Mọi API call đều được gắn `AbortController.signal`. Khi người dùng chuyển trang, đổi tab hoặc filter trước khi request hoàn tất, request cũ sẽ tự động được hủy bỏ, ngăn ngừa memory leak và race condition cập nhật state ngoài ý muốn.

---

## 3. DANH SÁCH FILE VÀ CÁC THAY ĐỔI CHI TIẾT

### 3.1. Dịch Vụ Mới & Kiểu Dữ Liệu
* **`frontend/src/services/marketplaceTypes.ts`**:
  - Định nghĩa đầy đủ kiểu dữ liệu phản ánh chính xác cấu trúc thực tế của Backend: `MarketplaceApiSummary`, `MarketplaceApiDetail`, `MarketplaceVersion`, `MarketplaceEndpoint`, `MarketplaceDocumentation`, `MarketplacePricingPlan`, `MarketplaceLegal`, `MarketplaceQuery`, `MarketplacePaginatedResponse`.
* **`frontend/src/services/marketplaceApi.ts`**:
  - `buildMarketplaceSearchParams(query)`: Làm sạch chuỗi tìm kiếm, lọc bỏ NUL byte (`\0`), cắt khoảng trắng, loại bỏ các tham số mặc định (`page=1`, `pageSize=20`, `category='All'`).
  - `listMarketplaceApis(query, signal)`: Gọi endpoint `GET /api/marketplace/apis` với xử lý lỗi chuẩn hóa `ApiError`.
  - `getMarketplaceApiDetail(id, signal)`: Gọi endpoint `GET /api/marketplace/apis/:id`.
  - `formatPrice`, `formatPublishedDate`: Các hàm tiện ích định dạng tiền tệ và thời gian.
* **`frontend/src/services/marketplaceApi.test.ts`**:
  - Test suite kiểm thử toàn diện các trường hợp build URL params, loại bỏ tham số mặc định, lọc NUL byte, giới hạn độ dài ký tự và xử lý signal hủy request.

### 3.2. Cập Nhật Các Trang Giao Diện
* **`frontend/src/pages/marketplace/MarketplacePage.tsx`**:
  - Tích hợp gọi API thực tế kèm Skeleton loading animation.
  - Tìm kiếm debounced 350ms đồng bộ 2 chiều với URL Search Parameters (`q`, `category`, `pricing`, `sort`, `page`).
  - Hiển thị thông báo trạng thái chuyên biệt: Không tìm thấy kết quả, Lỗi máy chủ (500), và cảnh báo giới hạn tần suất (429 Rate Limit) kèm nút "Thử lại".
* **`frontend/src/pages/marketplace/ApiDetailPage.tsx`**:
  - Tải chi tiết API từ backend theo `id`.
  - Quản lý phiên bản (Version switching) và đồng bộ danh sách Endpoints tương ứng theo phiên bản được chọn.
  - Tích hợp `DocumentationViewer` hiển thị OpenAPI spec được parse từ backend.
  - Hiển thị bảng giá dịch vụ thực tế từ nhà cung cấp.
  - Hiển thị cam kết tuân thủ dữ liệu (Data Classification, GDPR/Personal Data).
  - Modal Báo cáo vi phạm (Abuse Reporting) với thông báo minh bạch về tính năng đang chờ backend tiếp nhận.
* **`frontend/src/pages/marketplace/CompareApisPage.tsx`**:
  - Cho phép người dùng chọn 2 API bất kỳ trong danh mục công khai để so sánh song song các chỉ số: Nhà cung cấp, Hạn mức gói Free/Paid, Số lượng Endpoints, Tiêu chuẩn pháp lý.
* **`frontend/src/pages/marketplace/PricingPage.tsx`**:
  - Liệt kê toàn bộ các gói dịch vụ từ các API công khai đang hoạt động trên hệ thống thay thế cho bảng giá tĩnh cũ.
* **`frontend/src/pages/checkout/CheckoutPage.tsx`**:
  - Tải thông tin gói cước thực tế từ backend; chuyển hướng an toàn tới trang Đăng nhập nếu chưa xác thực người dùng; vô hiệu hóa việc tạo subscription giả lập cục bộ.
* **`frontend/src/pages/marketplace/ApiPlaygroundPage.tsx`**:
  - Trình dựng cURL tự động theo Endpoint, Method, Header, Query Parameter và Request Body.
  - Vô hiệu hóa nút gọi upstream từ trình duyệt nhằm tuân thủ chính sách SSRF.
* **`frontend/src/pages/marketplace/TrySandboxPage.tsx`**:
  - Hướng dẫn kiểm thử Sandbox an toàn, giải thích cơ chế cấp Quota tự động sẽ ra mắt trong Sprint 4.
* **`frontend/src/pages/consumer/ApiKeysPage.tsx`**:
  - Vô hiệu hóa tính năng tự tạo secret key giả ở client; hiển thị cơ chế bảo mật khóa định tuyến qua Gateway.

---

## 4. KẾT QUẢ KIỂM THỬ (TESTING & VERIFICATION)

### 4.1. Unit & Integration Test Suites
Đã bổ sung và hoàn thiện toàn bộ test suite cho các thành phần Sprint 3:
* **`frontend/src/services/marketplaceApi.test.ts`**: 8/8 tests pass.
* **`frontend/src/pages/marketplace/MarketplacePage.test.tsx`**: 6/6 tests pass (Skeleton, Danh sách API, Debounce 350ms, Bộ lọc danh mục/giá, Xử lý lỗi 500, Rate limit 429).
* **`frontend/src/pages/marketplace/ApiDetailPage.test.tsx`**: 7/7 tests pass (Loading skeleton, Chi tiết API, Chuyển tab, Chuyển phiên bản version, OpenAPI viewer, Modal report abuse, 404 Not Found).
* **`frontend/src/test/IntegrationConnections.test.tsx`**: 23/23 tests pass (Kiểm thử liên kết điều hướng và xác thực an toàn giữa các module).

### 4.2. Kết Quả Tổng Thể
Toàn bộ test suite của frontend:
```bash
Test Files  20 passed (20)
Tests       205 passed (205)
Duration    23.84s
```

### 4.3. Kiểm Tra Biên Dịch & Đóng Gói (TypeScript & Vite Build)
```bash
> tsc -b && vite build
✓ 86 modules transformed.
✓ built in 2.90s
```
Không có bất kỳ lỗi biên dịch TypeScript (zero compile errors) hay bundle warning nghiêm trọng nào.

---

## 5. ĐIỂM BÀN GIAO & KẾ HOẠCH CHO SPRINT 4

Sprint 3 đã chuẩn bị nền tảng giao diện và hợp đồng dữ liệu sẵn sàng cho các tính năng của Sprint 4:

| Tính năng | Trạng thái hiện tại (Sprint 3) | Kế hoạch tích hợp (Sprint 4) |
| :--- | :--- | :--- |
| **Backend Subscriptions & Billing** | Giao diện Checkout hiển thị gói thực tế từ backend; nút kích hoạt tạm khóa với thông báo rõ ràng. | Kết nối endpoint `POST /api/subscriptions` và cổng thanh toán VNPay/Stripe. |
| **Gateway SSRF Proxy** | Playground tạo script cURL để chạy ở máy khách; chặn browser fetch trực tiếp tới nhà cung cấp. | Kết nối endpoint backend `POST /api/gateway/proxy-sandbox` có server-side IP filtering. |
| **Consumer API Key Issuance** | ApiKeysPage hiển thị danh sách khóa an toàn; chặn sinh khóa ngẫu nhiên từ client. | Kết nối endpoint `POST /api/consumer/api-keys` (sử dụng crypto backend CSPRNG). |
| **Abuse / Security Report** | Modal báo cáo vi phạm hiển thị đầy đủ form nhập liệu và hướng dẫn. | Kết nối endpoint `POST /api/marketplace/apis/:id/reports`. |
