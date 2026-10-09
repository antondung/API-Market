# Tích hợp frontend với backend

Ngày: 09/10/2026. Backend đối chiếu: nhánh `develop`, commit `6b898dd`. Nhánh frontend: `feature/EN-03-frontend-auth-integration`. Issue chính: [#3 — Frontend Sprint 1](https://github.com/antondung/API-Market/issues/3), backlog EN-03, US-01, US-02, US-03.

## Endpoint đã nối

| Endpoint | Hành vi frontend |
|---|---|
| POST /api/auth/register | Tạo Consumer/Provider; thành công yêu cầu đăng nhập, không tự tạo phiên |
| POST /api/auth/login | Nhận token và thông tin tài khoản; mật khẩu không lưu |
| GET /api/auth/me | Xác thực lại danh tính khi đăng nhập và tải lại trang |
| GET /api/access/consumer, provider, admin | Kiểm tra quyền workspace khi khôi phục danh tính |
| POST /api/auth/refresh | Làm mới trước hạn, gộp refresh đồng thời; retry request 401 một lần |
| POST /api/auth/logout | Thu hồi phiên backend; xóa token phía frontend kể cả lỗi mạng |

Backend trả vai trò Consumer/Provider/Admin; frontend ánh xạ consumer/provider/admin. Vai trò đăng nhập luôn do backend cấp. Đăng ký chỉ có Consumer/Provider. Password đăng ký 12–128 ký tự; tên tối đa 100; login theo validation riêng của backend. Lỗi email trùng, 401, 403, 429 và lỗi kết nối có thông báo VI/EN.

Token nằm trong sessionStorage của tab, không trong localStorage. Backend hiện dùng Bearer token và CORS không nhận cookie credentials nên request dùng `credentials: omit`. sessionStorage vẫn có rủi ro XSS; nếu backend chuyển sang HttpOnly cookie cần điều chỉnh client. Đóng tab không đồng nghĩa thu hồi phiên trên server; phải đăng xuất để thu hồi. Refresh thất bại đưa người dùng về trạng thái chưa đăng nhập. API cập nhật hồ sơ chưa có nên trường danh tính chỉ đọc trong chế độ backend.

## Chạy local

Tại thư mục gốc, làm theo `backend/README.md`: cấu hình PostgreSQL và `.env`, migrate/seed đúng database development rồi chạy `npm run dev`. Không thay SQL hoặc logic backend để tích hợp frontend.

Tại `frontend`:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Frontend: http://127.0.0.1:5173. Backend: http://127.0.0.1:3000. `VITE_API_BASE_URL` là origin backend, không thêm `/api`. CORS backend phải cho phép origin frontend. `.env.local` không commit. Đặt biến URL rỗng để xem demo UI độc lập, rồi khởi động lại frontend. Unit/component tests chủ động chạy cấu hình demo, riêng bộ test auth chạy chế độ backend với HTTP mock.

## Kiểm thử

```powershell
npm test
npm run check:translations
npm run build
# Chỉ chạy với backend development: tạo hai tài khoản kiểm thử.
node scripts/check-backend-auth.mjs
```

Smoke test kiểm tra Consumer/Provider, đăng ký trùng, sai mật khẩu, danh tính, ma trận guard, refresh rotation, refresh cũ bị từ chối, logout và token bị thu hồi. Admin thành công cần tài khoản seed PostgreSQL; không tự tạo Admin qua endpoint công khai. Kết quả kiểm thử thực tế ghi trong BAO-CAO-FRONTEND.md.

## Chức năng còn chờ API

Marketplace/detail/spec, API key, trial/playground, subscription/payment, usage/analytics, Cost Guard, notifications, Provider verification/publishing, admin users/audit và report/moderation chưa có endpoint trong backend `develop` đã đối chiếu. Frontend tiếp tục chạy demo cho những phần này; shell có thông báo phạm vi. Không tự đoán URL nghiệp vụ hoặc sửa backend để tạo endpoint giả.

Report/Moderation do Tấn Dũng phụ trách theo `docs/02-role-va-phan-quyen.md`; frontend đã có màn hình minh họa để bàn giao component và phối hợp, chưa có báo cáo vi phạm thật được lưu ở backend.
