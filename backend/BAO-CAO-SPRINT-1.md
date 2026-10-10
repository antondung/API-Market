# Báo cáo công việc Backend Sprint 1

- Thành viên: Nguyễn Như Tùng Dương — GitHub: @Tungdota53
- Dự án: API Market
- Ngày cập nhật: 09/10/2026
- Phạm vi: Backend Sprint 1 — Issue #2
- Issue: https://github.com/antondung/API-Market/issues/2
- Pull Request: https://github.com/antondung/API-Market/pull/30

## 1. Những việc đã thực hiện

### Khởi tạo backend

- Dựng backend bằng Node.js, TypeScript và Express 5.
- Tách các phần HTTP API, AuthService và kho dữ liệu AuthStore.
- Thêm kiểm tra dữ liệu đầu vào, xử lý lỗi thống nhất và request ID.
- Thêm logging chỉ ghi method, route, status, request ID và thời gian xử lý; không ghi mật khẩu, token, cookie, header Authorization hoặc query.
- Thêm giới hạn request cho nhóm API Authentication.
- Tạo Swagger/OpenAPI và hướng dẫn chạy backend.

### Tích hợp database của Danh

- Dùng commit PostgreSQL `656f931` trong PR #32 của Danh (đã được lấy về nhánh backend).
- Dùng nguyên hai migration `001_create_auth_schema.sql` và `002_seed_auth_data.sql` tại `migrations/`; không sửa SQL của Danh. Bản SQLite cũ đã bỏ khỏi backend.
- Nối backend với PostgreSQL qua node-postgres để lưu người dùng, hồ sơ Provider và phiên đăng nhập.
- Ánh xạ vai trò: `USER` → Consumer, `API_PROVIDER` → Provider, `ADMIN` → Admin.
- Thêm migration runner có lịch sử/checksum, tránh chạy trùng và phát hiện migration đã áp dụng bị sửa.
- Dùng BOOLEAN, TIMESTAMPTZ, identity ID, email_normalized và transaction/unique constraint theo schema PostgreSQL mới.
- Setup sinh JWT secret trong `.env` được Git ignore. Seed tài khoản demo của Danh chỉ chạy qua lệnh explicit ở development; không tự chạy lúc startup hoặc migration mặc định.
- Giữ nguyên schema của Danh; bổ sung adapter backend để sử dụng schema đó.

### Đăng ký và đăng nhập

- API đăng ký cho Consumer/Provider; không cho đăng ký công khai vai trò Admin.
- Chuẩn hóa email và kiểm tra email trùng.
- Hash đăng ký mới bằng scrypt với salt ngẫu nhiên; hỗ trợ kiểm tra bcrypt để đăng nhập được seed pgcrypto của Danh.
- Tạo user và hồ sơ Provider trong cùng transaction khi đăng ký Provider.
- API đăng nhập cấp access JWT và refresh token.
- Trả lỗi đăng nhập chung cho email không tồn tại, mật khẩu sai và tài khoản bị khóa.

### Quản lý phiên và phân quyền

- Access JWT có thời hạn 15 phút; phiên refresh có thời hạn 7 ngày tính từ login.
- Refresh token được lưu dưới dạng SHA-256, không lưu token gốc trong database.
- Rotate refresh token bằng thao tác nguyên tử; một token cũ chỉ refresh thành công một lần.
- Logout thu hồi phiên và chặn cả access token đã cấp cho phiên đó.
- Kiểm tra trạng thái user và phiên khi xác thực request; tài khoản bị khóa bị chặn ngay.
- Thêm guard cho Consumer/Provider/Admin: thiếu hoặc sai token trả 401, sai vai trò trả 403.
- Tạo các endpoint mẫu để kiểm tra guard; quyền trên endpoint nghiệp vụ cần đối chiếu Role Matrix của QA.

## 2. API đã bàn giao

| Method | Endpoint | Chức năng |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký Consumer/Provider |
| POST | `/api/auth/login` | Đăng nhập, cấp token |
| POST | `/api/auth/refresh` | Đổi refresh token và cấp access token |
| POST | `/api/auth/logout` | Thu hồi phiên đăng nhập hiện tại |
| GET | `/api/auth/me` | Lấy thông tin người dùng hiện tại |
| GET | `/api/access/consumer` | Kiểm tra guard Consumer |
| GET | `/api/access/provider` | Kiểm tra guard Provider |
| GET | `/api/access/admin` | Kiểm tra guard Admin |
| GET | `/health` | Kiểm tra server hoạt động |
| GET | `/openapi.json` | Tài liệu OpenAPI |
| GET | `/docs/` | Giao diện Swagger |

## 3. Kết quả kiểm tra

- 27 test đã pass: 20 unit/HTTP và 7 integration test PostgreSQL thật; không còn test SQLite.
- TypeScript build và typecheck đã pass.
- Kiểm tra quy chuẩn repo và dấu conflict đã pass.
- CI GitHub chạy thành công trên commit bàn giao `865d313`: https://github.com/antondung/API-Market/actions/runs/37725763217
- Đã chạy thử server thật cho cả ba tài khoản mẫu: login, guard đúng vai trò, logout và chặn access token sau logout đều đạt.

Các trường hợp đã kiểm tra gồm: đăng ký trùng đồng thời, không cho đăng ký Admin, mật khẩu sai, token giả mạo/hết hạn, refresh đồng thời, logout thu hồi token, user bị khóa, sai quyền, JSON lỗi, request quá lớn, giới hạn request, log không chứa secret, migration từ DB trống/chạy lại, ràng buộc DB và dữ liệu tồn tại sau mở lại database.

## 4. Git và bàn giao

- Nhánh làm việc: `feature/2-backend-auth`.
- Commit tích hợp PostgreSQL và cập nhật test: `a99bfa4`.
- Commit sửa PostgreSQL test runner trên Linux CI: `92deb54`.
- Schema nguồn: PR #32 của Danh, commit `656f931`; PR đã merge vào `develop` ngày 08/10/2026.
- PR #30 đã được Tấn Dũng (@antondung) approve và merge vào `develop` ngày 08/10/2026 lúc 21:33 (giờ Việt Nam).
- Đã giải quyết xung đột do README gốc bị xóa trên `develop`; hướng dẫn backend nằm trong `backend/README.md`.
- Không commit database local, `.env`, mật khẩu hoặc JWT secret.

## 5. Việc còn cần nhóm xác nhận

Kết quả đối chiếu Definition of Done ngày 09/10/2026:

| Tiêu chí | Kết quả / giới hạn |
|---|---|
| Hoàn thành nhiệm vụ và Acceptance Criteria | Auth/backend đã triển khai; quyền trên guard mẫu đã test. Tài liệu role có tại docs/02-role-va-phan-quyen.md; acceptance sign-off và xác nhận áp dụng Role Matrix còn chờ QA |
| Test cần thiết đạt; CI xanh | 27 test pass trên PostgreSQL thật; build/typecheck và kiểm tra repo pass; CI được kiểm tra lại trên commit bàn giao |
| Không còn bug Critical/High | Không phát hiện lỗi Critical/High trong phạm vi kiểm tra; danh sách issue mở không có bug mang nhãn severity tương ứng; còn chờ xác nhận QA |
| Tài liệu/Swagger/migration cập nhật | README/Swagger/báo cáo đã cập nhật PostgreSQL; migration Danh giữ nguyên |
| PR vào develop; review và QA đạt | PR #30 đã approve và merge; chưa có báo cáo nghiệm thu QA, nên tiêu chí tổng hợp còn chờ |

- Review và merge backend: đã hoàn thành tại [PR #30](https://github.com/antondung/API-Market/pull/30).
- QA xác nhận Role Matrix và chạy acceptance/regression test: chờ kết quả của Vân tại [issue #5](https://github.com/antondung/API-Market/issues/5).
- Hải Dương nhận Swagger và kiểm thử tích hợp Auth trên môi trường chung; Tùng Dương xử lý lỗi backend phát sinh nếu có.
- Sau khi QA nghiệm thu đạt, cập nhật mục DoD cuối và đóng [issue #2](https://github.com/antondung/API-Market/issues/2). Issue còn mở tại thời điểm kiểm tra.

Đã bổ sung CORS allowlist ở backend và sửa encoding/charset không hỗ trợ trả 415 thay vì 500. Chỉ sửa middleware, cấu hình, test và tài liệu backend; schema/database và các phần frontend/hạ tầng giữ theo bàn giao nhóm.

Phần triển khai backend và kiểm tra local/CI đã hoàn thành. Báo cáo này không thay thế nghiệm thu QA hoặc xác nhận hoàn tất toàn bộ Sprint 1 của cả nhóm.

Lưu ý triển khai: PostgreSQL phải được cấu hình qua DATABASE_URL; test cần PostgreSQL CLI hoặc PG_TEST_URL cho DB test riêng. Rate limiter hiện lưu trong bộ nhớ, cần Redis khi chạy nhiều instance. Cách lưu refresh token/cookie và trusted proxy cần chốt khi tích hợp frontend/deploy.

## 6. Cách chạy lại

Yêu cầu Node.js 22.14 trở lên.

```powershell
npm ci
npm run setup
npm run dev
```

- Swagger local: http://127.0.0.1:3000/docs/
- Hướng dẫn chi tiết: [README Backend](README.md).
- Tài khoản mẫu của seed Danh: `admin@example.com`, `user@example.com`, `provider@example.com`.
- Mật khẩu demo nằm trong file SQL seed do Danh bàn giao; chỉ dùng development, không dùng production.

Chạy kiểm tra:

```powershell
npm run lint
npm test
npm run build
./scripts/kiem-tra-kho-ma-nguon.ps1
```
