# Kiểm thử Issue #2 — PostgreSQL

Ngày cập nhật: 09/10/2026. Người thực hiện: Nguyễn Như Tùng Dương (@Tungdota53).

Backend PR #30 sử dụng schema PostgreSQL từ PR #32 của Danh, commit `656f931`. Hai file SQL gốc giữ nguyên. SQLite adapter/test cũ đã được thay bằng PostgreSQL adapter và integration test thật.

## Phạm vi test

- 20 test unit/HTTP: Auth, JWT/refresh/logout, hash, user khóa, guard ba vai trò, input/lỗi, Swagger, rate limit, log không chứa secret, CORS và lỗi 415.
- 7 test PostgreSQL thật: migration từ schema trống/chạy lại; login bằng bcrypt seed Danh và full guard matrix; IDENTITY/BOOLEAN/unique email/name 100 ký tự; rollback user khi profile lỗi; refresh cạnh tranh giữa pool và revocation qua reconnect; khóa user/TIMESTAMPTZ hết hạn; dùng database khởi tạo trực tiếp bằng SQL của Danh.
- `npm test` không skip PostgreSQL; tự dựng instance tạm bằng CLI hoặc dùng `PG_TEST_URL` với schema test riêng. Thiếu PostgreSQL sẽ báo lỗi test thay vì giả lập DB.

## Bàn giao

Chạy `npm ci`; cấu hình `.env` với `AUTH_STORE=postgres`, `DATABASE_URL`, secret JWT và CORS. Với DB mới: `npm run db:migrate`; seed development tùy chọn: `npm run db:seed`; chạy server: `npm run dev`. Với DB Danh đã tạo trực tiếp bằng SQL, server dùng schema hiện có mà không chạy lại CREATE TABLE.

Seed chỉ chạy theo lệnh explicit ở development. Startup/migrate mặc định không tạo tài khoản có mật khẩu demo. Auth hỗ trợ bcrypt seed và scrypt cho đăng ký mới. Name API/Swagger giới hạn 100 ký tự theo PostgreSQL schema.

## Trạng thái nghiệm thu

- [PR #30](https://github.com/antondung/API-Market/pull/30) đã được @antondung approve và merge vào `develop` ngày 08/10/2026; [PR #32](https://github.com/antondung/API-Market/pull/32) của Danh cũng đã merge.
- [CI commit bàn giao 865d313](https://github.com/antondung/API-Market/actions/runs/37725763217) đạt. Kết quả 27 test ở trên là kiểm tra của backend, chưa thay thế nghiệm thu QA trên môi trường tích hợp.
- Tài liệu role hiện có tại [docs/02-role-va-phan-quyen.md](../docs/02-role-va-phan-quyen.md). Guard `/api/access/*` là endpoint mẫu kiểm tra vai trò; quyền cho từng endpoint nghiệp vụ cần đối chiếu matrix khi triển khai chức năng tương ứng.
- Chưa thấy báo cáo nghiệm thu QA tại [issue #5](https://github.com/antondung/API-Market/issues/5); [issue #2](https://github.com/antondung/API-Market/issues/2) còn mở và mục DoD cuối chưa được đánh dấu.

Backend sẵn sàng bàn giao Swagger `/docs/` và OpenAPI `/openapi.json` cho Hải Dương tích hợp. Cần kết quả kiểm thử frontend với backend trên môi trường chung, xác nhận acceptance của QA và xử lý lỗi backend phát sinh trước khi đóng issue #2.

Phạm vi thay đổi là backend adapter/Auth/config/test/tài liệu của Tùng Dương; không chỉnh SQL của Danh, frontend hoặc hạ tầng deploy của nhóm.
