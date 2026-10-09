# Tích hợp frontend với backend

Ngày cập nhật: 09/10/2026. Backend đối chiếu: nhánh `develop`, commit `6b898dd`.

| Endpoint                  | Hành vi frontend                                       |
| ------------------------- | ------------------------------------------------------ |
| POST `/api/auth/register` | Đăng ký Consumer/Provider; không cho đăng ký Admin     |
| POST `/api/auth/login`    | Nhận token và vai trò; không lưu mật khẩu              |
| GET `/api/auth/me`        | Khôi phục danh tính khi tải lại trang                  |
| GET `/api/access/:role`   | Xác nhận quyền workspace                               |
| POST `/api/auth/refresh`  | Rotate token; gộp refresh đồng thời; retry 401 một lần |
| POST `/api/auth/logout`   | Thu hồi phiên backend và xóa token trên trình duyệt    |

Frontend gửi Bearer token với `credentials: omit` theo CORS contract hiện tại. Vai trò luôn lấy từ backend. Password đăng ký dài 12–128 ký tự, tên tối đa 100 ký tự. Các lỗi 401, 403, 409, 429, validation và lỗi mạng có thông báo tiếng Việt/Anh.

Marketplace, API management, API key, playground, subscription, payment, usage, analytics, Cost Guard, Provider verification/publishing, Admin users/audit và report/moderation chưa có endpoint trên backend đã đối chiếu. Frontend không mô phỏng các nghiệp vụ này. Route public đã có chỉ hiển thị trạng thái chưa khả dụng.

## Biến môi trường

```env
VITE_API_BASE_URL=http://127.0.0.1:3000
```

Backend phải cho phép đúng origin frontend qua `CORS_ORIGINS`. Không commit `.env.local`, token, mật khẩu hoặc connection string.

## Bàn giao tiếp theo

Mỗi nhóm tính năng mới cần Swagger/OpenAPI và ma trận quyền trước khi nối UI. Loading/error/empty state phải dựa trên response thật. Không đưa seed hoặc fallback local vào bản production.
