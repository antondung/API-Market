# Báo cáo công việc Frontend — Lê Hải Dương

Ngày cập nhật: 09/10/2026. Phạm vi tích hợp: Sprint 1 / Issue #3. Nhánh: `feature/EN-03-frontend-auth-integration`.

## Quy trình làm việc đã đối chiếu

Nguồn: `docs/03-quy-trinh-lam-viec.md`, `docs/02-role-va-phan-quyen.md` và Issue #3 trên GitHub.

1. Nhận backlog và Swagger/API contract từ Tùng Dương; báo dependency/block sớm trong 24 giờ.
2. Tạo nhánh từ develop theo `feature/<mã-backlog>-<mô-tả>`; commit `<type>(<scope>): <mô tả>`, body có `Refs: <mã backlog>`.
3. Dùng Design System chung, API client tập trung, tự refresh token, route theo quyền; hỗ trợ responsive và loading/error/empty state.
4. Test component/flow và kiểm tra repo trước push. Bàn giao component cho Tấn Dũng, phối hợp Vân kiểm tra ba vai trò.
5. PR vào develop có mã backlog, mô tả, cách test và ảnh UI. Chỉ merge khi CI xanh, ít nhất một approval và review/QA đạt; không tự merge, không push trực tiếp main/develop.
6. Planning đầu sprint, daily hằng ngày, demo cuối sprint và retrospective sau review. Deadline FE Sprint 1: 10/10/2026. Feature freeze toàn dự án: 09/11.

## Đã thực hiện trong phạm vi frontend

- Khởi tạo React/TypeScript, routing và state; header/sidebar, menu ba vai trò; component button, form, table, modal dùng chung (EN-03).
- Giao diện đăng ký Consumer/Provider, xác nhận mật khẩu, kiểm tra đầu vào; đăng nhập, hiện/ẩn mật khẩu và lỗi từ backend (US-01, US-02).
- Nối đầy đủ Auth API hiện có: register, login, me, refresh, logout và guard ba vai trò. Danh tính và quyền do backend trả; không cho tự chọn quyền khi đăng nhập.
- Lưu token theo tab, refresh có rotation và gộp request đồng thời, retry 401 một lần; chặn route chưa đăng nhập/sai vai trò, redirect nội bộ về workspace phù hợp (US-02, US-03).
- Giữ thiết kế hiện có và hỗ trợ tiếng Việt/Anh. Thêm kiểm tra frontend riêng trong CI; không sửa schema hoặc nghiệp vụ backend.

## Giao diện các sprint sau đã chuẩn bị

Có baseline UI và demo cho Marketplace/API Detail, Provider import/wizard/verification, endpoint/plan management, Playground/API Key, subscriptions/payment sandbox, usage/history/analytics, Cost Guard, notifications và admin. Xem PROMPT_COVERAGE.md cho đối chiếu nội dung 45 prompt.

Đây là giao diện/demo chuẩn bị trước; không xác nhận đã hoàn thành nghiệp vụ các Sprint 2–5. Backend hiện chưa cung cấp các endpoint tương ứng. Admin Management, Report/Moderation và Audit thuộc Tấn Dũng; phần UI sẵn có dùng để phối hợp/bàn giao component.

## Phần “Báo cáo của tôi” trên website

Trang `/app/reports` là báo cáo vi phạm API: gửi lý do, mô tả, API và bằng chứng; xem trạng thái. Admin có giao diện xử lý và quyết định liên quan. Hiện dữ liệu chỉ lưu demo ở trình duyệt, chưa gửi đến backend. Trang này khác báo cáo công việc frontend trong tài liệu này.

## Kiểm chứng và bàn giao

- 146 test frontend đạt (135 regression trước đó + 11 test auth mới): contract Bearer/error envelope, refresh đồng thời, retry 401, không refresh 403, refresh sau logout, offline logout, UI đăng ký và email trùng.
- Kiểm tra dịch thuật đạt 4.505 mục; TypeScript/Vite build đạt. Bundle ban đầu vẫn khoảng 898 KB và có cảnh báo kích thước; chưa tối ưu hiệu năng Sprint 5.
- Smoke test HTTP với backend Express thật dùng MemoryAuthStore đạt Consumer/Provider: đăng ký, trùng email, sai mật khẩu, me, role matrix, refresh rotation, token cũ bị từ chối, logout và token bị thu hồi.
- Trình duyệt VI: đăng nhập Consumer bằng backend, vào đúng dashboard, reload khôi phục phiên, thông tin hồ sơ lấy từ backend và Consumer vào Admin bị chuyển 403; đăng xuất rồi vào trang bảo vệ được đưa về login. Ảnh: docs/preview-backend-auth.png.
- PostgreSQL và đăng nhập Admin thành công chưa được kiểm chứng trong lượt này vì chưa có database development được cấu hình. Kiểm tra HTTP memory không thay thế kiểm thử FE–BE–PostgreSQL.
- Backend typecheck/build và 20 test unit/HTTP đạt; script kiểm tra repo đạt trên bản sao 142 tệp được Git theo dõi (không gồm nguồn thiết kế local bị ignore).
- Chưa xác nhận QA độc lập hoặc approval của reviewer; không tự đánh dấu Issue #3 hoàn tất và không tự merge.

## Giới hạn cần ghi đúng khi báo cáo

Token vẫn script-readable nên có rủi ro XSS; cần phối hợp backend nếu chuyển sang HttpOnly cookie. Chưa có cập nhật hồ sơ, password reset hay xóa tài khoản. Chưa xác minh production/staging, thanh toán thật, gateway/quota thật hoặc số liệu analytics từ database. Không gọi các giao diện demo là tính năng end-to-end đã hoàn tất.
