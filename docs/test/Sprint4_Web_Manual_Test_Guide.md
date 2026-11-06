# Cẩm nang Kiểm thử Trực tiếp trên Web (Manual Testing Guide) — Sprint 4

> **Dự án:** API Marketplace Platform
> **Giai đoạn:** Sprint 4 — Pricing Plans, Subscriptions, Sandbox Checkout, Gateway Quota/Rate Limit, Request History, Code Generator & Admin Operations
> **Tác giả & QA Lead:** Trần Hà Thảo Vân (MSSV: BCS250039, `@vuonghathaovan-gif` — Issue #15 & Issue #70)
> **Mục tiêu:** Cung cấp tài liệu chỉ dẫn thao tác thực tế từng bước (Step-by-step) dành cho Tester, Developer hoặc Giảng viên kiểm tra trực quan trên trình duyệt Web (Chrome/Edge/Firefox) kết hợp công cụ DevTools (F12).

---

## I. MÔI TRƯỜNG THỰC THI & TÀI KHOẢN TRUY CẬP

### 1. Địa chỉ dịch vụ đang hoạt động
- **Giao diện Web Frontend:** [http://localhost:5173](http://localhost:5173) (Vite Preview / Dev Server)
- **Máy chủ Backend API & Gateway:** [http://localhost:3000](http://localhost:3000) (Express Application Server)
- **Tài liệu Swagger OpenAPI:** [http://localhost:3000/docs](http://localhost:3000/docs)
- **Cơ sở dữ liệu PostgreSQL 17:** `127.0.0.1:5432` (`api_market_dev`)
- **Bộ đếm Cache Redis:** `127.0.0.1:6379`

### 2. Bảng thông tin đăng nhập có sẵn trong Database
Các tài khoản seed chuẩn hóa trong cơ sở dữ liệu đã được gán quyền RBAC đầy đủ:

| Vai trò | Email đăng nhập | Mật khẩu mặc định | Đường dẫn trang đích chính | Mục đích kiểm thử |
|---|---|---|---|---|
| **Người tiêu dùng (Consumer)** | `user@example.com` | `User@123` | [http://localhost:5173/dashboard](http://localhost:5173/dashboard) | Mua gói cước, quản lý API Key, xem Quota, xem Request History, dùng Code Generator |
| **Nhà cung cấp (Provider)** | `provider@example.com` | `Provider@123` | [http://localhost:5173/provider/analytics](http://localhost:5173/provider/analytics) | Xem Analytics lưu lượng, biểu đồ KPI, theo dõi doanh thu đa tiền tệ (VND/USD) |
| **Quản trị viên (Admin)** | `admin@example.com` | `Admin@123` | [http://localhost:5173/admin/subscriptions](http://localhost:5173/admin/subscriptions) | Quản lý sổ cái Subscription toàn sàn, Đình chỉ (Suspend) và Khôi phục (Restore) gói cước |

### 3. Cặp API Keys hợp lệ dùng ngay (Copy & Paste)
Bộ phận QA đã cấp phát sẵn 2 API Key active trong cơ sở dữ liệu liên kết với tài khoản Consumer (`user@example.com` - ID: 2):

| Thuộc tính | API A (ID: 3) — Product Catalog API | API B (ID: 7) — QA Weather Core API v1.1 |
|---|---|---|
| **Tên API** | Product Catalog API | QA Weather Core API v1.1 |
| **Trạng thái API** | `Published` | `Published` |
| **API Key mẫu** | `ak_live_QTkLeL6m34G4WnSi8BysgFWSGbLSJvdr` | `ak_live_32Eb3QDBkJ02GqrW2TAM-MLhrnaDvpsX` |
| **Endpoint Gateway** | `GET /v1/products` | `GET /v1/weather/current?city=Hanoi` |
| **URL Gateway đầy đủ** | `http://localhost:3000/api/gateway/3/v1/products` | `http://localhost:3000/api/gateway/7/v1/weather/current?city=Hanoi` |
| **Gói cước đã gắn** | Sẵn sàng mua tại Luồng 1 (Free / Pro) | Đã gắn sẵn gói `Free` (Limit: 5 req/s, 500 req/tháng) |

---

## II. CHECKLIST THỰC HÀNH 6 LUỒNG NGHIỆP VỤ TRỰC TIẾP TRÊN WEB

```
+---------------------------------------------------------------------------------------------------+
|                                 SƠ ĐỒ 6 LUỒNG KIỂM THỬ THỦ CÔNG SPRINT 4                          |
+---------------------------------------------------------------------------------------------------+
|  [Luồng 1]  /marketplace -> Chi tiết API -> Gói Free (kích hoạt) -> Gói Pro -> Checkout Sandbox   |
|  [Luồng 2]  /dashboard/usage & /dashboard/requests -> Gọi Gateway -> F5 Quota +1 -> Log an toàn   |
|  [Luồng 3]  /marketplace/:id -> Code Generator (cURL, Fetch, Python) -> Copy binding API Key     |
|  [Luồng 4]  F12 Console -> Bắn fetch Gateway -> Test 401, 403, 429 & Chứng minh 3 Deviations     |
|  [Luồng 5]  /provider/analytics -> Thẻ KPI -> Doanh thu đa tiền tệ (VND & USD)                    |
|  [Luồng 6]  /admin/subscriptions -> Suspend (Chặn 403) -> Restore (Khôi phục 200 OK)              |
+---------------------------------------------------------------------------------------------------+
```

---

### LUỒNG 1: MUA GÓI CƯỚC & GIẢ LẬP THANH TOÁN SANDBOX

#### Mục tiêu:
Xác thực khả năng kích hoạt gói Free tức thì không cần thanh toán, và quy trình thanh toán thẻ giả lập Sandbox (Success / Failure / Cancel) cho gói trả phí Pro.

#### Các bước thực hiện:
1. **Đăng nhập Consumer:**
   - Mở trình duyệt truy cập: [http://localhost:5173/login](http://localhost:5173/login).
   - Nhập Email: `user@example.com`, Mật khẩu: `User@123`. Bấm **Đăng nhập**.
   - Kiểm tra điều hướng thành công vào Dashboard.
2. **Kích hoạt Gói Free (0 VNĐ):**
   - Truy cập trang Sàn giao dịch: [http://localhost:5173/marketplace](http://localhost:5173/marketplace).
   - Tìm và nhấp chọn API **"Product Catalog API"** (ID: 3) hoặc truy cập trực tiếp: [http://localhost:5173/marketplace/3](http://localhost:5173/marketplace/3).
   - Nhấp vào tab **"Bảng giá / Pricing"** (hoặc cuộn xuống danh sách gói cước).
   - Tại thẻ gói **Free** (Giá: 0 VNĐ/tháng, Quota: 1,000 lượt): Nhấp nút **"Đăng ký ngay"** (hoặc "Chọn gói").
   - **Quan sát kết quả:**
     - Thông báo thành công hiển thị ngay lập tức (Toast: "Kích hoạt gói thành công!").
     - Không bị chuyển hướng sang trang thanh toán.
     - Vào [http://localhost:5173/dashboard/subscriptions](http://localhost:5173/dashboard/subscriptions): Gói Free của "Product Catalog API" hiển thị huy hiệu xanh **`Active`**.
3. **Mua Gói Paid (Pro) qua Cổng Sandbox:**
   - Quay lại trang chi tiết API: [http://localhost:5173/marketplace/3](http://localhost:5173/marketplace/3).
   - Tại thẻ gói **Pro** (Giá: 299,000 VNĐ/tháng, Quota: 100,000 lượt): Nhấp nút **"Nâng cấp gói"** (hoặc "Đăng ký Pro").
   - Trình duyệt tự động chuyển hướng sang trang thanh toán Sandbox: [http://localhost:5173/checkout](http://localhost:5173/checkout).
   - Màn hình hiển thị hóa đơn thanh toán giả lập với tên API, tên gói Pro và tổng tiền 299,000 VNĐ.
4. **Kịch bản 1: Giả lập thanh toán Thành công (`Success`):**
   - Tại giao diện Checkout Sandbox, nhấp nút **"Thanh toán thành công (Simulate Success)"** (hoặc nhập thẻ mẫu `9704000000000001` và bấm Xác nhận).
   - **Quan sát kết quả:**
     - Màn hình hiển thị thông báo "Thanh toán thành công! Gói cước của bạn đã được kích hoạt".
     - Nhấp nút "Về trang gói cước của tôi" hoặc vào [http://localhost:5173/dashboard/subscriptions](http://localhost:5173/dashboard/subscriptions).
     - Gói cước hiển thị huy hiệu xanh **`Active`**, hạn ngạch cấp mới `100,000 requests`.
5. **Kịch bản 2: Giả lập thanh toán Thất bại / Hủy (`Cancel/Failure`):**
   - Thử đăng ký một gói trả phí khác hoặc mở lại trang checkout.
   - Nhấp nút **"Hủy và quay lại"** (hoặc "Giả lập lỗi từ chối thẻ").
   - **Quan sát kết quả:** Hệ thống hủy phiên thanh toán an toàn, quay lại trang trước, không phát sinh giao dịch lỗi hay treo tài khoản.

---

### LUỒNG 2: KIỂM TRA QUOTA & ĐỐI SOÁT LỊCH SỬ GỌI API (REQUEST HISTORY)

#### Mục tiêu:
Xác thực đồng bộ dữ liệu 4 tầng thời gian thực: Sau khi gửi 1 request qua Gateway, bộ đếm Quota tăng đúng `+1`, bảng Lịch sử xuất hiện bản ghi mới, và hoàn toàn không rò rỉ secret key trong Network F12.

#### Các bước thực hiện:
1. **Kiểm tra số dư trước khi gọi:**
   - Mở tab 1 trên trình duyệt vào trang Hạn ngạch: [http://localhost:5173/dashboard/usage](http://localhost:5173/dashboard/usage).
   - Ghi nhận số lượt đã dùng hiện tại (ví dụ: `0 / 500 requests`).
   - Vào tiếp trang Lịch sử: [http://localhost:5173/dashboard/requests](http://localhost:5173/dashboard/requests) để quan sát số dòng hiện có.
2. **Bắn 1 Request thực tế qua API Gateway:**
   - Nhấn phím **F12** để mở công cụ DevTools, chuyển sang tab **Console**.
   - Dán đoạn lệnh sau và nhấn **Enter**:
     ```javascript
     fetch('http://localhost:3000/api/gateway/7/v1/weather/current?city=Hanoi', {
       method: 'GET',
       headers: {
         'x-api-key': 'ak_live_32Eb3QDBkJ02GqrW2TAM-MLhrnaDvpsX'
       }
     })
     .then(res => res.json())
     .then(data => console.log('Kết quả Gateway trả về:', data));
     ```
   - Quan sát tab Console: Nhận được kết quả HTTP 200 kèm dữ liệu thời tiết (upstream phản hồi).
3. **Đối soát số liệu hiển thị trên Web:**
   - Chuyển sang trang [http://localhost:5173/dashboard/usage](http://localhost:5173/dashboard/usage) và nhấn **F5** (Tải lại trang).
   - **Quan sát:** Số lượt sử dụng đã tăng chính xác **`+1`** (ví dụ từ `0` lên `1 / 500 requests`).
   - Chuyển sang trang [http://localhost:5173/dashboard/requests](http://localhost:5173/dashboard/requests) và nhấn **F5**.
   - **Quan sát:** Xuất hiện ngay dòng log đầu tiên:
     - Method: `GET`
     - Endpoint: `/v1/weather/current`
     - Status: Huy hiệu xanh `200`
     - Thời gian: Vừa mới gọi
4. **Kiểm tra an toàn bảo mật (Network Tab F12):**
   - Trong cửa sổ F12, chuyển sang tab **Network**, lọc theo `Fetch/XHR`.
   - Tìm request `GET /api/consumer/usage/history`.
   - Nhấp vào xem **Response JSON**: Xác nhận trong dữ liệu trả về cho client **chỉ có thông tin kỹ thuật an toàn** (method, path, status, latency_ms), tuyệt đối **không chứa chuỗi `ak_live_`** hay raw secret key.

---

### LUỒNG 3: TRẢI NGHIỆM BỘ SINH MÃ TÍCH HỢP (CODE GENERATOR)

#### Mục tiêu:
Xác thực khả năng tự động liên kết (binding) API Key thực tế và Endpoint vào 3 ngôn ngữ lập trình phổ biến (cURL, JavaScript Fetch, Python Requests) kèm tính năng nút Copy an toàn.

#### Các bước thực hiện:
1. Đăng nhập vai trò Consumer: `user@example.com` / `User@123`.
2. Truy cập trang chi tiết API: [http://localhost:5173/marketplace/7](http://localhost:5173/marketplace/7).
3. Tìm đến khu vực **"Mã mẫu tích hợp (Code Generator)"** hoặc tab **"Tích hợp / Integration"**.
4. Chọn Endpoint từ danh sách thả xuống: `GET /v1/weather/current`.
5. **Kiểm tra từng ngôn ngữ:**
   - **Tab 1: cURL:**
     - Quan sát đoạn mã: Chứa URL `http://localhost:3000/api/gateway/7/v1/weather/current?city=Hanoi` và header `-H "X-API-Key: ak_live_32Eb3QDBkJ02GqrW2TAM-MLhrnaDvpsX"`.
     - Nhấp nút **"Copy"**: Xuất hiện biểu tượng tick xanh và thông báo "Đã sao chép".
   - **Tab 2: JavaScript (Fetch):**
     - Nhấp chuyển sang tab **JavaScript**.
     - Quan sát đoạn mã: Cú pháp hiện đại `async/await`, có `headers: { 'X-API-Key': '...' }`, kiểm tra `if (!response.ok)` và khối `try...catch`.
     - Nhấp nút **"Copy"**.
   - **Tab 3: Python (Requests):**
     - Nhấp chuyển sang tab **Python**.
     - Quan sát đoạn mã: Chuẩn PEP 8 với `import requests`, truyền dictionary headers và có phương thức `response.raise_for_status()`.
     - Nhấp nút **"Copy"**.
6. **Kiểm tra dán thực tế:** Mở Notepad dán đoạn mã vừa copy để xác nhận mã nguồn hoàn chỉnh, không bị lỗi font hay thiếu ký tự escape.

---

### LUỒNG 4: THỰC NGHIỆM GATEWAY (401 / 403 / 429) & CHỨNG MINH 3 SAI LỆCH KỸ THUẬT NGAY TRÊN F12 CONSOLE

#### Mục tiêu:
Cho phép Tester không cần cài công cụ ngoài (như Postman), chỉ cần dán lệnh JavaScript vào **Console (F12)** trên trình duyệt là kiểm chứng được toàn bộ mã lỗi Gateway và chứng minh tận mắt 3 sai lệch kỹ thuật mở (`DEV-S4-01`, `DEV-S4-02`, `DEV-S4-04`).

#### Các lệnh thực hành (Dán vào Console F12):

#### 1. Test Chặn 401: Thiếu Header API Key (`GW-01`)
```javascript
fetch('http://localhost:3000/api/gateway/7/v1/weather/current')
  .then(async res => {
    console.log('HTTP Status:', res.status);
    console.log('Body:', await res.json());
  });
```
* **Kỳ vọng quan sát:** Status `401 Unauthorized`, Body: `{ "error": { "code": "MISSING_API_KEY", "message": "API key is required" } }`.

---

#### 2. Test Chặn 401 & CHỨNG MINH SAI LỆCH `DEV-S4-04` (`GW-04`): Gửi Key của API A sang Endpoint của API B
```javascript
// Dùng Key của API 3 (Product Catalog) để gọi vào Gateway của API 7 (Weather API)
fetch('http://localhost:3000/api/gateway/7/v1/weather/current?city=Hanoi', {
  method: 'GET',
  headers: {
    'x-api-key': 'ak_live_QTkLeL6m34G4WnSi8BysgFWSGbLSJvdr'
  }
})
.then(async res => {
  const data = await res.json();
  console.log('HTTP Status thật:', res.status);
  console.log('Error Code thật:', data.error?.code);
  console.log('Đối chiếu DEV-S4-04: Kỳ vọng "API_KEY_SCOPE_MISMATCH", Thực tế trả về:', data.error?.code);
});
```
* **Bằng chứng sai lệch:** Console in ra mã lỗi `INVALID_API_KEY` thay vì mã riêng `API_KEY_SCOPE_MISMATCH` như đặc tả AC-S4-06 dòng 176 $\to$ **Xác nhận sai lệch `DEV-S4-04` là có thật 100%!**

---

#### 3. Test & CHỨNG MINH SAI LỆCH `DEV-S4-02` (`OVH-06`): Kiểm tra Response Headers đo độ trễ
```javascript
fetch('http://localhost:3000/api/gateway/7/v1/weather/current?city=Hanoi', {
  headers: { 'x-api-key': 'ak_live_32Eb3QDBkJ02GqrW2TAM-MLhrnaDvpsX' }
})
.then(res => {
  console.log('X-Gateway-Overhead-Ms Header:', res.headers.get('x-gateway-overhead-ms'));
  console.log('X-Response-Time Header:', res.headers.get('x-response-time'));
  console.log('Toàn bộ Headers trả về:', [...res.headers.entries()]);
});
```
* **Bằng chứng sai lệch:** Cả hai giá trị `X-Gateway-Overhead-Ms` và `X-Response-Time` đều là **`null`** (Gateway không trả ra client, chỉ lưu nội bộ DB `usage_logs`) $\to$ **Xác nhận sai lệch `DEV-S4-02` là có thật 100%!**

---

#### 4. Test Chặn 429: Vượt ngưỡng Tần suất Rate Limit (`GW-11`)
```javascript
// Gói Free của API 7 có rate_limit = 5 req/s. Bắn burst 15 requests đồng thời:
console.log('Đang bắn 15 requests burst để kích hoạt Rate Limit...');
for (let i = 1; i <= 15; i++) {
  fetch('http://localhost:3000/api/gateway/7/v1/weather/current?city=Hanoi', {
    headers: { 'x-api-key': 'ak_live_32Eb3QDBkJ02GqrW2TAM-MLhrnaDvpsX' }
  }).then(res => {
    console.log(`Request #${i}: Status = ${res.status} ${res.status === 429 ? '(RATE_LIMITED - THÀNH CÔNG CHẶN)' : '(OK)'}`);
  });
}
```
* **Kỳ vọng quan sát:** Các request đầu nhận `200 OK`, sau đó từ request thứ 6 trở đi xuất hiện các mã `429 Too Many Requests` (Body: `{ "code": "RATE_LIMIT_EXCEEDED" }`) kèm cơ chế trượt của Redis.

---

### LUỒNG 5: BẢNG PHÂN TÍCH NHÀ CUNG CẤP (PROVIDER ANALYTICS) ĐA TIỀN TỆ

#### Mục tiêu:
Xác thực giao diện phân tích số liệu của Provider, hiển thị chuẩn xác các thẻ KPI hiệu năng và bảng doanh thu phân tách minh bạch giữa tiền đồng (`VND`) và ngoại tệ (`USD`).

#### Các bước thực hiện:
1. Đăng xuất tài khoản Consumer hiện tại (bấm nút Avatar góc phải trên $\to$ **Đăng xuất**).
2. Đăng nhập tài khoản Provider:
   - Email: `provider@example.com`
   - Mật khẩu: `Provider@123`
3. Điều hướng vào trang Phân tích: [http://localhost:5173/provider/analytics](http://localhost:5173/provider/analytics) (hoặc chọn menu **Analytics & Health** trên thanh điều hướng Provider).
4. **Quan sát và kiểm tra:**
   - **Khu vực KPI Tổng quan:**
     - Thẻ **Tổng lượt gọi (Total Requests):** Hiển thị số lượng request gọi vào các API do Provider này sở hữu.
     - Thẻ **Tỷ lệ thành công (Success Rate):** Tính toán theo tỷ lệ phần trăm (ví dụ: `98.5%`).
     - Thẻ **Độ trễ trung bình (Avg Latency):** Hiển thị số liệu tính bằng mili-giây (`ms`).
   - **Khu vực Doanh thu Đa tiền tệ (Multi-Currency Revenue):**
     - Bảng hoặc thẻ Doanh thu hiển thị phân tách độc lập:
       - Doanh thu Việt Nam Đồng: hiển thị định dạng `... VND`
       - Doanh thu Đô la Mỹ: hiển thị định dạng `... USD`
     - Không bị cộng dồn gộp 2 loại tiền tệ khác mệnh giá vào cùng một con số.
5. **Kiểm tra cách ly dữ liệu (RBAC Isolation):** Provider này hoàn toàn không nhìn thấy số liệu lưu lượng hay doanh thu của Provider khác trên sàn.

---

### LUỒNG 6: QUẢN TRỊ VIÊN ĐÌNH CHỈ & KHÔI PHỤC GÓI CƯỚC (ADMIN SUBSCRIPTION LIFECYCLE)

#### Mục tiêu:
Xác thực quyền lực tối cao của Admin trong việc can thiệp ngắt lưu lượng của gói cước vi phạm (`Suspended`) và khôi phục hoạt động (`Active`) tức thời mà không làm mất số liệu hạn ngạch.

#### Các bước thực hiện:
1. **Đăng nhập quyền Admin:**
   - Đăng xuất tài khoản Provider.
   - Đăng nhập: `admin@example.com` / `Admin@123`.
   - Truy cập vào trang Quản lý Gói cước toàn sàn: [http://localhost:5173/admin/subscriptions](http://localhost:5173/admin/subscriptions).
2. **Tìm kiếm gói cước của Consumer:**
   - Tại ô tìm kiếm, nhập email: `user@example.com`.
   - Danh sách hiển thị các gói cước đang sở hữu của Consumer này (ví dụ gói của API 7 hoặc API 3).
   - Trạng thái hiện tại đang là huy hiệu xanh **`Active`**.
3. **Thao tác Đình chỉ (Suspend):**
   - Trên dòng gói cước tương ứng, nhấp nút **"Đình chỉ" (Suspend)**.
   - Hộp thoại xác nhận hiện ra: Nhập lý do đình chỉ (ví dụ: `Phat hien luu luong bat thuong`).
   - Nhấp nút **"Xác nhận đình chỉ"**.
   - **Quan sát:** Huy hiệu trạng thái trên bảng chuyển ngay sang màu đỏ/vàng: **`Suspended`**.
4. **Kiểm chứng Gateway lập tức chặn quyền gọi (HTTP 403):**
   - Mở Console F12 (hoặc mở cửa sổ ẩn danh khác), dùng API Key của gói vừa bị đình chỉ gọi vào Gateway:
     ```javascript
     fetch('http://localhost:3000/api/gateway/7/v1/weather/current?city=Hanoi', {
       headers: { 'x-api-key': 'ak_live_32Eb3QDBkJ02GqrW2TAM-MLhrnaDvpsX' }
     })
     .then(async res => {
       console.log('Status khi bị Suspend:', res.status);
       console.log('Chi tiết lỗi:', await res.json());
     });
     ```
   - **Kết quả:** Gateway từ chối ngay lập tức với HTTP **`403 Forbidden`** kèm mã lỗi `{ "code": "SUBSCRIPTION_SUSPENDED", "message": "Subscription is suspended" }`. Upstream hoàn toàn được bảo vệ!
5. **Thao tác Khôi phục (Restore / Reactivate):**
   - Tại màn hình Admin [http://localhost:5173/admin/subscriptions](http://localhost:5173/admin/subscriptions), nhấp nút **"Khôi phục" (Restore)** trên dòng gói cước vừa đình chỉ.
   - Hộp thoại hiện ra: Nhập lý do khôi phục (ví dụ: `Da xac minh an toan`). Nhấp **Xác nhận**.
   - **Quan sát:** Trạng thái gói cước lập tức quay trở lại màu xanh: **`Active`**.
6. **Kiểm chứng Gateway mở lại lưu thông (HTTP 200):**
   - Dán lại lệnh fetch trong Console F12:
     ```javascript
     fetch('http://localhost:3000/api/gateway/7/v1/weather/current?city=Hanoi', {
       headers: { 'x-api-key': 'ak_live_32Eb3QDBkJ02GqrW2TAM-MLhrnaDvpsX' }
     })
     .then(res => console.log('Status sau khi khôi phục:', res.status));
     ```
   - **Kết quả:** Trả về ngay lập tức **`200 OK`**! Lưu thông được nối lại hoàn toàn, hạn ngạch quota đã dùng trước đó được giữ nguyên vẹn.

---

## III. TỔNG KẾT & LƯU Ý KHI KIỂM THỬ THỦ CÔNG

1. **Khởi động và dừng tiến trình:**
   - Để khởi động lại dịch vụ nếu cần:
     ```bash
     # Khởi động Backend (cổng 3000):
     cd API-Market && node --env-file-if-exists=.env dist/src/server.js

     # Khởi động Frontend (cổng 5173):
     cd API-Market/frontend && npx vite preview --port 5173 --host 0.0.0.0
     ```
2. **Nguyên tắc an toàn mật khẩu:**
   - Mật khẩu các tài khoản seed (`Admin@123`, `User@123`, `Provider@123`) là tài khoản kiểm thử môi trường cục bộ được công bố trong tài liệu demo, tuyệt đối không dùng mật khẩu này cho tài khoản thật.
3. **Tính trung thực của báo cáo:**
   - Các sai lệch `DEV-S4-01`, `DEV-S4-02`, `DEV-S4-04` là phát hiện chất lượng quan trọng của đội ngũ QA, cần giữ nguyên trạng thái FAIL trong tài liệu cho đến khi Tech Lead và Backend Developer thống nhất sửa code hoặc cập nhật AC.

---
*Cẩm nang kiểm thử trực quan được biên soạn bởi:*<br/>
**Trần Hà Thảo Vân**<br/>
*QA Automation Lead & Documentation Lead — API Marketplace Platform*<br/>
*MSSV: BCS250039 (`@vuonghathaovan-gif` — Issue #15 & Issue #70)*
