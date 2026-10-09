# Báo cáo hoàn thiện frontend release

- Thành viên: Lê Hải Dương — @leduwn
- Ngày cập nhật: 09/10/2026
- Nhánh: `feature/EN-14-frontend-release-polish`
- Backlog: EN-14, phối hợp Issue #23

## Quy trình đã áp dụng

Nhánh được tách từ công việc frontend đang chờ review, có ancestry từ `develop`. Commit dùng Conventional Commit và tham chiếu EN-14/Issue #23. Pull Request mở vào `develop`; không tự merge, không tự đóng issue. PR chỉ sẵn sàng merge khi CI xanh, có ít nhất một approval và QA đạt.

## Thay đổi

- Bỏ toàn bộ local demo store, seed API, session giả và cơ chế đổi vai trò trên màn hình đăng nhập.
- Xóa 48 màn hình nguồn Stitch/showcase và các luồng giả: marketplace catalog, key, playground, payment, request history, analytics, Provider/Admin workflow.
- Giữ layout/design system; thu gọn router và menu còn Home, Auth, workspace theo vai trò và Account.
- Marketplace/Pricing hiển thị trạng thái chưa có backend, không dựng dữ liệu hoặc thao tác giả.
- Giảm translation catalog từ 4.505 xuống 98 nhãn đang dùng; bỏ dependency và asset không còn cần.
- Giữ tích hợp Auth thật: register, login, me, access guard, refresh rotation và logout.

## Kết quả kiểm tra

- 15 test frontend đạt: contract Bearer/error envelope, refresh rotation, retry 401, logout offline, đăng ký, duplicate email, route guard và trạng thái dịch vụ chưa có backend.
- Translation audit đạt 99 nhãn đang dùng; TypeScript và production build đạt.
- Bundle JavaScript đầu vào giảm từ khoảng 898 KB xuống 351 KB; CSS giảm còn khoảng 32 KB; build không còn cảnh báo chunk trên 500 KB.
- Trình duyệt desktop: đăng nhập Consumer bằng backend, vào đúng workspace, dữ liệu tài khoản lấy từ backend; Marketplace không còn catalog mẫu.
- Trình duyệt mobile 390px: không có tràn ngang, menu workspace hoạt động. Ảnh kiểm chứng: `docs/release-desktop.png`, `docs/release-mobile.png`.
- Smoke test HTTP backend development kiểm tra Consumer/Provider, duplicate email, sai mật khẩu, role guard, refresh rotation và logout/revocation.

## Chưa thuộc release này

Marketplace và các nghiệp vụ Sprint 2–5 cần API contract từ backend. Chưa có API sửa hồ sơ, quên mật khẩu và xóa tài khoản. Token vẫn nằm trong `sessionStorage` theo Bearer contract hiện tại nên cần chuyển sang HttpOnly cookie khi backend hỗ trợ.
