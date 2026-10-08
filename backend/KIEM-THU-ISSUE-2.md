# Kiểm thử Issue #2 — PostgreSQL

Ngày: 08/10/2026. Người thực hiện: Nguyễn Như Tùng Dương (@Tungdota53).

Backend PR #30 sử dụng schema PostgreSQL từ PR #32 của Danh, commit `656f931`. Hai file SQL gốc giữ nguyên. SQLite adapter/test cũ đã được thay bằng PostgreSQL adapter và integration test thật.

## Phạm vi test

- 20 test unit/HTTP: Auth, JWT/refresh/logout, hash, user khóa, guard ba vai trò, input/lỗi, Swagger, rate limit, log không chứa secret, CORS và lỗi 415.
- 7 test PostgreSQL thật: migration từ schema trống/chạy lại; login bằng bcrypt seed Danh và full guard matrix; IDENTITY/BOOLEAN/unique email/name 100 ký tự; rollback user khi profile lỗi; refresh cạnh tranh giữa pool và revocation qua reconnect; khóa user/TIMESTAMPTZ hết hạn; dùng database khởi tạo trực tiếp bằng SQL của Danh.
- `npm test` không skip PostgreSQL; tự dựng instance tạm bằng CLI hoặc dùng `PG_TEST_URL` với schema test riêng. Thiếu PostgreSQL sẽ báo lỗi test thay vì giả lập DB.

## Bàn giao

Chạy `npm ci`; cấu hình `.env` với `AUTH_STORE=postgres`, `DATABASE_URL`, secret JWT và CORS. Với DB mới: `npm run db:migrate`; seed development tùy chọn: `npm run db:seed`; chạy server: `npm run dev`. Với DB Danh đã tạo trực tiếp bằng SQL, server dùng schema hiện có mà không chạy lại CREATE TABLE.

Seed chỉ chạy theo lệnh explicit ở development. Startup/migrate mặc định không tạo tài khoản có mật khẩu demo. Auth hỗ trợ bcrypt seed và scrypt cho đăng ký mới. Name API/Swagger giới hạn 100 ký tự theo PostgreSQL schema.

Kết quả test/CI của commit bàn giao được dẫn trên PR #30 và issue #2. Review và QA sign-off vẫn còn chờ; không tự đánh dấu toàn bộ Done hoặc merge thay reviewer. Phạm vi thay đổi là backend adapter/Auth/config/test/tài liệu của Tùng Dương; không chỉnh SQL của Danh, frontend hoặc hạ tầng deploy của nhóm.
