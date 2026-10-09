# Test Plan & Test Cases - Sprint 1

**Dự án:** API Marketplace
**Sprint:** 1 — Nền tảng & Tài khoản
**Người thực hiện:** Trần Hà Thảo Vân (@vuonghathaovan-gif)
**Phạm vi:** US-01, US-02, US-03, US-04

---

## 1. Test Plan (Kế hoạch kiểm thử)

### 1.1 Mục tiêu
Đảm bảo các tính năng nền tảng về tài khoản, bảo mật (JWT/RBAC) và quản lý người dùng hoạt động đúng theo Acceptance Criteria đã đề ra.

### 1.2 Môi trường kiểm thử
- **Frontend:** Local/Staging (React + TypeScript)
- **Backend:** Local/Staging (Node.js Express 5 + PostgreSQL)
- **Công cụ:** Trình duyệt (Chrome/Edge), Postman (test API), DB Client (DBeaver/pgAdmin).

### 1.3 Phương pháp kiểm thử
- Kiểm thử chức năng (Black-box testing).
- Kiểm thử phân quyền (RBAC testing).
- Kiểm thử luồng dữ liệu (E2E từ UI xuống DB).

---

## 2. Test Cases (Kịch bản kiểm thử)

### 2.1 US-01: Đăng ký tài khoản

| ID | Case | Các bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-01-01 | Đăng ký thành công (Consumer) | 1. Truy cập trang Đăng ký<br>2. Nhập Email mới, Mật khẩu hợp lệ, Tên hiển thị<br>3. Chọn vai trò "Consumer"<br>4. Nhấn Đăng ký | Hệ thống báo thành công. Chuyển hướng trang. DB lưu user với role_id của USER. |
| TC-01-02 | Đăng ký thành công (Provider) | 1. Tương tự TC-01-01 nhưng chọn vai trò "Provider" | Hệ thống báo thành công. DB lưu user với role_id của API_PROVIDER. |
| TC-01-03 | Đăng ký thất bại - Email đã tồn tại | 1. Nhập Email đã có trong hệ thống<br>2. Điền đủ thông tin khác<br>3. Nhấn Đăng ký | Hệ thống báo lỗi: "Email đã được sử dụng". |
| TC-01-04 | Đăng ký thất bại - Validation FE/BE | 1. Để trống Email hoặc nhập sai định dạng<br>2. Mật khẩu quá ngắn | Hệ thống hiển thị thông báo lỗi validation tương ứng. |

### 2.2 US-02: Đăng nhập & Đăng xuất

| ID | Case | Các bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-02-01 | Đăng nhập thành công | 1. Nhập đúng Email và Mật khẩu đã đăng ký<br>2. Nhấn Đăng nhập | Đăng nhập thành công. Chuyển vào Dashboard. Token lưu vào Storage/Cookie. |
| TC-02-02 | Đăng nhập thất bại - Sai thông tin | 1. Nhập sai Email hoặc sai Mật khẩu | Báo lỗi chung: "Email hoặc mật khẩu không chính xác". Không chỉ rõ sai ở đâu. |
| TC-02-03 | Refresh Token thành công | 1. Đợi Access Token hết hạn<br>2. Thực hiện một hành động yêu cầu gọi API | Hệ thống tự dùng Refresh Token lấy Access Token mới mà không bắt login lại. |
| TC-02-04 | Đăng xuất | 1. Nhấn nút Đăng xuất | Xóa token ở máy khách. DB/Redis thu hồi Refresh Token. Không thể quay lại trang Dashboard bằng nút Back. |

### 2.3 US-03: Phân quyền (RBAC)

| ID | Case | Các bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-03-01 | Consumer vào Dashboard đúng | 1. Login với tài khoản Consumer | Hiển thị menu Marketplace, Subscription. Không thấy menu Admin. |
| TC-03-02 | Provider vào Dashboard đúng | 1. Login với tài khoản Provider | Hiển thị menu My APIs, Analytics. |
| TC-03-03 | Truy cập trái phép (Direct URL) | 1. Login vai trò Consumer<br>2. Gõ trực tiếp URL của Admin (ví dụ `/admin/users`) | Hệ thống hiển thị trang lỗi 403 hoặc tự động redirect. |
| TC-03-04 | Gọi API trái phép (Postman) | 1. Lấy Access Token của USER<br>2. Gọi API Admin `/api/v1/admin/users` | API trả về Status Code 403 Forbidden. |

### 2.4 US-04: Admin quản lý người dùng

| ID | Case | Các bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-04-01 | Xem danh sách & Phân trang | 1. Login Admin<br>2. Vào trang Quản lý User | Thấy danh sách đầy đủ. Chuyển trang (Next/Prev) hoạt động đúng. |
| TC-04-02 | Tìm kiếm người dùng | 1. Nhập từ khóa vào ô tìm kiếm | Danh sách lọc đúng theo tên hoặc email khớp với từ khóa. |
| TC-04-03 | Khóa tài khoản người dùng | 1. Chọn một tài khoản đang active<br>2. Nhấn "Khóa" | Trạng thái chuyển thành "Locked". User đó bị kick ra (nếu đang login) và không thể login lại. |
| TC-04-04 | Mở khóa tài khoản | 1. Chọn tài khoản đang "Locked"<br>2. Nhấn "Mở khóa" | Trạng thái chuyển thành "Active". User có thể login lại bình thường. |
