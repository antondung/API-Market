# API Hub frontend

Frontend chính thức viết bằng React và TypeScript. Bản phát hành giữ đầy đủ khung sản phẩm theo ba vai trò; xác thực và hồ sơ dùng API thật, các nghiệp vụ chưa có endpoint hiển thị trạng thái trống.

## Chạy local

Backend cần chạy tại địa chỉ được cấu hình trong `.env.local`. Xem `../backend/README.md` để chuẩn bị PostgreSQL, migration và tài khoản seed.

```powershell
cd C:\Users\duwn\Documents\api-market\frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Mở http://127.0.0.1:5173. `VITE_API_BASE_URL` là origin của backend và không chứa `/api`. Frontend không có chế độ dữ liệu mẫu; thiếu backend sẽ hiển thị lỗi kết nối.

## Kiểm tra

```powershell
npm run lint
npm run check:translations
npm test
npm run build
```

Smoke test sau chỉ chạy với backend development vì sẽ tạo hai tài khoản kiểm thử:

```powershell
node scripts/check-backend-auth.mjs
```

## Phạm vi release

- Public landing, đăng ký, đăng nhập và giao diện VI/EN.
- Access token và refresh token theo contract backend; tự làm mới phiên, retry 401 một lần và thu hồi phiên khi đăng xuất.
- Consumer, Provider và Admin vào đúng workspace theo vai trò backend trả về.
- Hồ sơ hiển thị danh tính backend ở chế độ chỉ đọc.
- Dashboard và menu đầy đủ cho Consumer, Provider và Admin.
- Marketplace, API detail, documentation, playground, checkout cùng các trang nghiệp vụ theo vai trò có route chính thức và trạng thái trống cho đến khi backend bàn giao API.

Frontend không còn seed data, local demo store, đăng nhập đổi vai trò, payment sandbox, request giả, API key giả, analytics giả hoặc màn hình Stitch showcase. Khi có API contract, dữ liệu thật được nối vào khung trang hiện có.

## Bảo mật và giới hạn

Backend hiện cấp Bearer token nên token được giữ trong `sessionStorage` theo từng tab; mật khẩu không được lưu. Token vẫn có thể bị đọc khi xảy ra XSS. Khi backend hỗ trợ HttpOnly cookie, nên chuyển cơ chế lưu phiên. Chưa có API sửa hồ sơ, quên mật khẩu hoặc xóa tài khoản.

Chi tiết contract và bàn giao nằm trong [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md); báo cáo công việc nằm trong [BAO-CAO-FRONTEND.md](./BAO-CAO-FRONTEND.md).
