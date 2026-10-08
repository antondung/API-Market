# Báo cáo công việc Backend Sprint 1

- Thành viên: Nguyễn Như Tùng Dương — GitHub: @Tungdota53
- Dự án: API Market
- Ngày cập nhật: 08/10/2026
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

- Lấy commit database `5d784fc` từ nhánh `develop`.
- Dùng hai migration `001_create_auth_schema.sql` và `002_seed_auth_data.sql` của Danh; đóng gói trong `backend/migrations/` sau khi thư mục migration gốc bị xóa khỏi `develop` tại commit `49fbc1e`.
- Nối backend với SQLite để lưu người dùng, hồ sơ Provider và phiên đăng nhập.
- Ánh xạ vai trò: `USER` → Consumer, `API_PROVIDER` → Provider, `ADMIN` → Admin.
- Thêm migration runner có lịch sử/checksum, tránh chạy trùng và phát hiện migration đã áp dụng bị sửa.
- Bật foreign key, WAL và busy timeout cho kết nối SQLite.
- Thêm lệnh setup và seed tài khoản mẫu Admin/Consumer/Provider. Secret và mật khẩu mẫu được sinh ngẫu nhiên, lưu trong `.env` được Git ignore.
- Giữ nguyên schema của Danh; bổ sung adapter backend để sử dụng schema đó.

### Đăng ký và đăng nhập

- API đăng ký cho Consumer/Provider; không cho đăng ký công khai vai trò Admin.
- Chuẩn hóa email và kiểm tra email trùng.
- Hash mật khẩu bằng scrypt với salt ngẫu nhiên.
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

- 24 unit/HTTP/SQLite integration test đã pass, gồm sáu test hồi quy cho CORS và lỗi encoding/charset.
- TypeScript build và typecheck đã pass.
- Kiểm tra quy chuẩn repo và dấu conflict đã pass.
- CI GitHub của PR đã chạy thành công: https://github.com/antondung/API-Market/actions/runs/37721937995
- Đã chạy thử server thật cho cả ba tài khoản mẫu: login, guard đúng vai trò, logout và chặn access token sau logout đều đạt.

Các trường hợp đã kiểm tra gồm: đăng ký trùng đồng thời, không cho đăng ký Admin, mật khẩu sai, token giả mạo/hết hạn, refresh đồng thời, logout thu hồi token, user bị khóa, sai quyền, JSON lỗi, request quá lớn, giới hạn request, log không chứa secret, migration từ DB trống/chạy lại, ràng buộc DB và dữ liệu tồn tại sau mở lại database.

## 4. Git và bàn giao

- Nhánh làm việc: `feature/2-backend-auth`.
- Commit triển khai backend: `bc3fe27`.
- Commit đồng bộ `develop` và giải quyết xung đột README: `6c2490c`.
- Đã push code lên GitHub và mở PR #30 vào `develop`.
- Đã giải quyết xung đột do README gốc bị xóa trên `develop`; hướng dẫn backend nằm trong `backend/README.md`.
- Không commit database local, `.env`, mật khẩu hoặc JWT secret.

## 5. Việc còn cần nhóm xác nhận

Kết quả đối chiếu Definition of Done ngày 08/10/2026:

| Tiêu chí | Kết quả / giới hạn |
|---|---|
| Hoàn thành nhiệm vụ và Acceptance Criteria | Auth/backend đã triển khai; quyền trên guard mẫu đã test, Role Matrix chính thức và acceptance sign-off còn chờ QA |
| Test cần thiết đạt; CI xanh | 24 test pass; build/typecheck và kiểm tra repo pass; CI được kiểm tra lại trên commit bàn giao |
| Không còn bug Critical/High | Không phát hiện lỗi Critical/High trong phạm vi kiểm tra; danh sách issue mở không có bug mang nhãn severity tương ứng; còn chờ xác nhận QA |
| Tài liệu/Swagger/migration cập nhật | Đã có README, Swagger, báo cáo và bản migration đóng gói cùng backend |
| PR vào develop; review và QA đạt | PR #30 vào develop đã mở; chưa có approval hoặc kết quả QA, chưa đạt toàn bộ tiêu chí |

- Tech Lead review PR và quyết định merge.
- QA xác nhận Role Matrix và chạy acceptance/regression test.
- Frontend tích hợp Auth theo Swagger trên môi trường chung.
- Kiểm thử môi trường tích hợp trước khi nghiệm thu và đóng issue #2.

Đã bổ sung CORS allowlist ở backend và sửa encoding/charset không hỗ trợ trả 415 thay vì 500. Chỉ sửa middleware, cấu hình, test và tài liệu backend; schema/database và các phần frontend/hạ tầng giữ theo bàn giao nhóm.

Phần triển khai backend và kiểm tra local/CI đã hoàn thành. Báo cáo này không thay thế nghiệm thu QA hoặc xác nhận hoàn tất toàn bộ Sprint 1 của cả nhóm.

Lưu ý triển khai: module `node:sqlite` trên Node 22 có cảnh báo experimental; CI hiện kiểm tra bằng Node 22. Rate limiter hiện lưu trong bộ nhớ, cần Redis khi chạy nhiều instance. Cách lưu refresh token/cookie, CORS và trusted proxy cần chốt khi tích hợp frontend/deploy.

## 6. Cách chạy lại

Yêu cầu Node.js 22.14 trở lên.

```powershell
npm ci
npm run setup
npm run dev
```

- Swagger local: http://127.0.0.1:3000/docs/
- Hướng dẫn chi tiết: [README Backend](README.md).
- Tài khoản mẫu: `admin@example.test`, `consumer@example.test`, `provider@example.test`.
- Mật khẩu tương ứng nằm trong biến `SEED_ADMIN_PASSWORD`, `SEED_CONSUMER_PASSWORD`, `SEED_PROVIDER_PASSWORD` của `.env` local; không đưa chúng vào báo cáo bàn giao.

Chạy kiểm tra:

```powershell
npm run lint
npm test
npm run build
./scripts/kiem-tra-kho-ma-nguon.ps1
```
