# Kết quả kiểm thử và bàn giao Issue #2

Ngày kiểm tra: 08/10/2026. Người thực hiện: Nguyễn Như Tùng Dương (@Tungdota53).

PR bàn giao: https://github.com/antondung/API-Market/pull/30 (base: `develop`).

## Kết quả kiểm tra tự động

| Nhóm kiểm tra | Kết quả |
|---|---|
| Đăng ký, chuẩn hóa email, hash mật khẩu, email trùng, chặn đăng ký Admin | PASS |
| Sai mật khẩu và email không tồn tại trả cùng lỗi chung | PASS |
| Refresh đồng thời chỉ thành công một lần, logout chặn token cũ/mới | PASS |
| Guard ba vai trò: đúng quyền 200, sai quyền 403, không xác thực 401 | PASS |
| Access token và refresh token hết hạn | PASS |
| JWT giả mạo và sai audience | PASS |
| JSON sai, body quá lớn, route không tồn tại dùng lỗi thống nhất | PASS |
| Log không chứa mật khẩu, token, cookie hoặc query nhạy cảm | PASS |
| Giới hạn request Auth trả 429 | PASS |
| Swagger/OpenAPI mô tả và phục vụ API Auth | PASS |
| User bị khóa bị chặn ở login, refresh và access | PASS |
| Đăng ký đồng thời chỉ tạo một user cho một email | PASS |
| Cùng mật khẩu có salt/hash khác nhau | PASS |
| Không đổi role bằng cách sửa snapshot trả từ memory store | PASS |
| Migration từ DB trống, chạy lại an toàn và foreign key hoạt động | PASS |
| SQLite mapping role, provider profile, unique email và hash secret | PASS |
| User/phiên/logout tồn tại qua mở lại DB; refresh giữa hai kết nối | PASS |
| SQLite user khóa và phiên hết hạn bị chặn | PASS |

Tổng cộng: **18 test, 18 pass, 0 fail**. `npm test` bao gồm TypeScript build. `npm run lint` (typecheck), kiểm tra quy chuẩn repo và `git diff --check` đạt. `npm audit --omit=dev` không báo vulnerability tại thời điểm kiểm tra.

## Kiểm tra tích hợp database

Đã đồng bộ với `develop` tại commit `49fbc1e` (xóa thư mục migrations gốc). Hai migration cần cho backend được đóng gói tại `backend/migrations/`, lấy nguyên nội dung từ commit schema của Danh `5d784fc`. Schema và checksum đã áp dụng không thay đổi. `npm run db:migrate` chạy thành công với DB local có sẵn; test DB trống cũng đạt.

## Đối chiếu Definition of Done

| Tiêu chí | Bằng chứng / trạng thái |
|---|---|
| Nhiệm vụ và Acceptance Criteria | Backend Auth và guard đã triển khai/test; Role Matrix chính thức chưa được QA bàn giao trong repo/issue #5 |
| Test đạt, CI xanh | 18 test local pass; CI trên commit bàn giao được dẫn ở comment issue #2 |
| Không còn bug Critical/High | Không phát hiện lỗi mức này qua kiểm tra trong báo cáo; không có issue mở mang nhãn Critical/High tại thời điểm kiểm tra; chưa thay thế xác nhận QA |
| Tài liệu/Swagger/migration | `backend/README.md`, báo cáo công việc, tài liệu này, `/docs/`, `/openapi.json`, migration đóng gói đã cập nhật |
| PR vào develop; review và QA đạt | PR #30 đã mở. Chưa có approval hoặc báo cáo QA nghiệm thu; tiêu chí này giữ chưa hoàn tất |

## Hướng dẫn nhận bàn giao

```powershell
git fetch origin
git switch feature/2-backend-auth
npm ci
npm run setup
npm run dev
```

Swagger sau khi chạy trên máy nhận bàn giao: http://127.0.0.1:3000/docs/ (địa chỉ local, không phải staging công khai). Frontend dùng register/login/refresh/logout/me theo Swagger. Mật khẩu tài khoản mẫu đọc trong `.env` của chính máy chạy; không chia sẻ hoặc commit file này.

Tech Lead review PR; QA xác nhận Role Matrix và chạy acceptance trên môi trường tích hợp. Issue #2 giữ mở cho đến khi có bằng chứng review và QA đạt. Báo cáo này là kết quả kiểm tra backend của người triển khai, không phải approval của reviewer hoặc nghiệm thu thay QA.
