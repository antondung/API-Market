# Backend — Sprint 1 / Issue #2

Node.js 22.14+, TypeScript, Express 5, PostgreSQL và node-postgres (`pg`). Backend sử dụng nguyên schema PostgreSQL của Danh trong PR #32, commit `656f931`, tại `migrations/`. Không sửa SQL của Danh. SQLite đã được bỏ khỏi backend.

## Chạy local

Cần PostgreSQL đang chạy và database development trống. Tạo database qua công cụ PostgreSQL của máy, ví dụ:

```powershell
createdb -U postgres api_market_dev
npm ci
```

Tạo `.env` từ `.env.example`, thay `JWT_SECRET` bằng secret ngẫu nhiên 32 byte trở lên, cấu hình `AUTH_STORE=postgres` và `DATABASE_URL` cho database của máy. Hoặc chạy `npm run setup` để sinh `.env` nếu chưa có; setup không ghi đè file có sẵn. Khi `.env` đã tồn tại từ bản SQLite, cần đổi `AUTH_STORE` và thêm `DATABASE_URL`.

```powershell
npm run db:migrate
npm run db:seed
npm run dev
```

`db:migrate` chạy schema 001 và seed ba vai trò, không tạo tài khoản demo. `db:seed` áp dụng file 002 nguyên bản của Danh, chỉ dành cho development và bị chặn ở production. Setup chỉ migrate, không tự seed tài khoản có mật khẩu demo.

Swagger: http://127.0.0.1:3000/docs/ — OpenAPI: http://127.0.0.1:3000/openapi.json.

`DATABASE_URL` ví dụ: `postgresql://postgres:your-password@127.0.0.1:5432/api_market_dev`. Không commit `.env` hoặc connection string chứa mật khẩu. Server kiểm tra schema có sẵn khi startup, không tự chạy migration/seed. Database đã được Danh khởi tạo bằng SQL trực tiếp có thể dùng ngay với server; không chạy lại schema 001 trên DB đó. Migration runner dành cho DB mới dùng bảng `backend_schema_migrations`, checksum và advisory lock để chạy lại an toàn.

## API và schema

| Method | Endpoint | Input / yêu cầu |
|---|---|---|
| POST | `/api/auth/register` | email, password (12–128 ký tự), role Consumer/Provider; name tùy chọn (1–100 ký tự) |
| POST | `/api/auth/login` | email, password |
| POST | `/api/auth/refresh` | refreshToken |
| POST | `/api/auth/logout` | Authorization Bearer accessToken |
| GET | `/api/auth/me` | Authorization Bearer accessToken |
| GET | `/api/admin/users` | **Admin**. Query: `search` (email/tên, không phân biệt hoa thường), `role`, `active`, `page` (>=1), `pageSize` (1-100). Trả `{items, total, page, pageSize}` |
| PATCH | `/api/admin/users/{id}/active` | **Admin**. Body `{active: boolean}`. Khóa tài khoản thu hồi toàn bộ phiên; không tự khóa chính mình (409) |
| GET | `/api/access/consumer`, `/api/access/provider`, `/api/access/admin` | Guard mẫu: đúng vai trò 200, sai vai trò 403, thiếu/token sai 401 |

API trả role Consumer/Provider/Admin; DB tương ứng USER/API_PROVIDER/ADMIN. ID PostgreSQL là INTEGER IDENTITY, API/JWT dùng chuỗi. `is_active` là BOOLEAN; thời gian phiên là TIMESTAMPTZ. Email truy vấn theo `email_normalized` và unique constraint của Danh. Đăng ký Provider tạo user và hồ sơ trong cùng transaction; lỗi ở bước profile rollback user. Name giới hạn 100 ký tự theo schema mới.

Mật khẩu đăng ký mới vẫn dùng scrypt có salt; login hỗ trợ cả scrypt và bcrypt của `pgcrypto` trong seed Danh. Bcrypt không chấp nhận mật khẩu vượt 72 byte để tránh truncation. Access JWT sống 15 phút; phiên refresh sống 7 ngày từ login. DB chỉ lưu SHA-256 của refresh token. Rotate dùng UPDATE có điều kiện nguyên tử; logout và user khóa có hiệu lực ở lần xác thực kế tiếp, kể cả access token đã cấp.

### Quản trị người dùng (US-04)

`GET /api/admin/users` trả về bản ghi **không chứa `passwordHash`**. Sắp xếp theo `created_at DESC, id DESC` để bản ghi mới nhất lên đầu. `total` là tổng số bản ghi khớp bộ lọc, không phải số bản ghi trong trang.

`PATCH /api/admin/users/{id}/active` với `active: false` sẽ:

1. Đặt `is_active = false` và cập nhật `updated_at`.
2. Thu hồi **toàn bộ** refresh token của người dùng đó.
3. Trả `revokedSessions` là số phiên đã thu hồi.

Access token đã cấp mất hiệu lực ở lần xác thực kế tiếp vì `authenticate()` kiểm tra `is_active` và trạng thái phiên. Mở khóa (`active: true`) **không** hồi sinh token cũ — người dùng phải đăng nhập lại.

Admin **không thể tự khóa** tài khoản của mình (409 `CANNOT_MODIFY_SELF`), tránh tự khóa và mất quyền quản trị.

ID không tồn tại trả 404 `USER_NOT_FOUND`. Với PostgreSQL, id không phải số được xử lý như không tìm thấy (404) thay vì lỗi 500.

## Tài khoản seed development

File `migrations/002_seed_auth_data.sql` của Danh cung cấp `admin@example.com`, `user@example.com`, `provider@example.com`; mật khẩu demo được mô tả trong chính file seed. Chúng đã được kiểm tra đăng nhập qua bcrypt. Đây là credential công khai cho demo, không dùng trong production. File SQL của Danh giữ nguyên.

## HTTP, CORS và logging

`CORS_ORIGINS` là danh sách origin chính xác, phân cách bằng dấu phẩy. Local mặc định cho phép `http://localhost:5173,http://127.0.0.1:5173`; production mặc định không mở cross-origin. Đặt rỗng để tắt. Không dùng wildcard/path. Preflight hợp lệ trả 204, hỗ trợ GET/POST/OPTIONS và Content-Type/Authorization; origin ngoài danh sách trả 403. Không bật cookie credentials; CORS không thay Auth/RBAC.

Lỗi có envelope `{error:{code,message,requestId,details?}}`. Encoding/charset không hỗ trợ trả 415. Log chỉ ghi request ID, method, route template, status và thời gian, không ghi body/header/query chứa secret. Auth giới hạn 30 request/phút/IP; nhiều instance cần limiter Redis và trusted proxy do nhóm chốt.

## Test PostgreSQL thật

```powershell
npm test
npm run lint
./scripts/kiem-tra-kho-ma-nguon.ps1
```

`npm test` build TypeScript và chạy unit/HTTP cùng PostgreSQL integration test. Nếu không đặt `PG_TEST_URL`, test runner dùng PostgreSQL CLI (`pg_config`, `initdb`, `pg_ctl`) để tạo server tạm trên loopback, chạy test rồi dừng/xóa đúng thư mục tạm. PostgreSQL CLI phải được cài sẵn.

Cũng có thể đặt `PG_TEST_URL` đến database test riêng; test tạo/xóa schema `auth_test_*`, cài pgcrypto vào public nếu thiếu. Không trỏ test vào database production. Bộ test gồm 29 test unit/HTTP và 11 test PostgreSQL: migration trống/rerun, seed bcrypt/full guard matrix, unique email/name/BOOLEAN/identity, rollback provider, refresh cạnh tranh/persistence, user khóa/phiên hết hạn, dùng schema đã khởi tạo bằng SQL trực tiếp, và quản trị người dùng (list/search/filter/pagination, khóa/mở khóa, thu hồi phiên, guard 403, id không hợp lệ).

PR #30 chờ review và QA. PR #32 của Danh là dependency schema, chưa tự merge thay Danh hoặc Tech Lead. Dữ liệu SQLite local cũ không được xóa hoặc tự chuyển sang PostgreSQL.
