# Acceptance Criteria – Sprint 1 (US-01 → US-04)

Dưới đây là các tiêu chí chấp nhận (AC) cho các User Story thuộc Sprint 1, dùng làm căn cứ để phát triển và kiểm thử.

### C.1 US-01: Đăng ký tài khoản (Consumer/Provider)
- **AC 1:** Người dùng có thể chọn vai trò `Consumer` hoặc `Provider` khi đăng ký.
- **AC 2:** Email phải là duy nhất (không được trùng lặp trong hệ thống).
- **AC 3:** Mật khẩu phải được mã hóa (hashing) trước khi lưu vào cơ sở dữ liệu.
- **AC 4:** Các trường bắt buộc (Email, Mật khẩu, Tên hiển thị) phải có validation ở cả FE và BE.

Lưu ý: backend hiện để name tùy chọn (1–100 ký tự) – cần nhóm chốt.
- **AC 5:** Sau khi đăng ký thành công, hệ thống tự động đăng nhập hoặc chuyển hướng đến trang Đăng nhập.

### C.2 US-02: Đăng nhập & Đăng xuất (JWT + Refresh Token)
- **AC 1:** Đăng nhập thành công trả về `Access Token` (ngắn hạn) và `Refresh Token` (dài hạn).
- **AC 2:** Thông tin lỗi đăng nhập (sai email/mật khẩu) phải chung chung, không được tiết lộ email có tồn tại hay không.
- **AC 3:** `Access Token` hết hạn có thể được cấp mới bằng `Refresh Token` hợp lệ mà không cần đăng nhập lại.
- **AC 4:** Khi đăng xuất, `Refresh Token` phải bị thu hồi (revoke/delete) trong Database/Redis để ngăn tái sử dụng.
- **AC 5:** Hỗ trợ cơ chế bảo mật cơ bản (ví dụ: HttpOnly Cookie cho Refresh Token).

Lưu ý: thực tế refresh token trả trong body JSON, FE lưu sessionStorage – cần nhóm chốt.

### C.3 US-03: Phân quyền truy cập (RBAC)
- **AC 1:** Người dùng chỉ có thể truy cập các Dashboard và chức năng tương ứng với vai trò của mình (theo Role Matrix ở Phần A).
- **AC 2:** Truy cập trái phép vào các route Protected (cả FE và BE) phải trả về lỗi `403 Forbidden`.
- **AC 3:** Giao diện Dashboard phải ẩn/hiện các mục menu dựa trên quyền của người dùng.
- **AC 4:** Token không hợp lệ hoặc hết hạn khi gọi API Protected phải trả về lỗi `401 Unauthorized`.

### C.4 US-04: Admin quản lý người dùng
- **AC 1:** Admin có thể xem danh sách toàn bộ người dùng với các thông tin: Tên, Email, Vai trò, Trạng thái, Ngày tạo.
- **AC 2:** Hỗ trợ tìm kiếm người dùng theo Email hoặc Tên và phân trang danh sách.
- **AC 3:** Admin có thể Khóa (Lock) hoặc Mở khóa (Unlock) tài khoản người dùng.
- **AC 4:** Tài khoản bị khóa sẽ không thể đăng nhập và các token hiện có (nếu có) phải bị từ chối khi gọi API.
