# Báo cáo hoàn thiện frontend release

- Thành viên: Lê Hải Dương — @leduwn
- Ngày cập nhật: 09/10/2026
- Nhánh: `feature/EN-14-frontend-release-polish`
- Backlog: EN-14, phối hợp Issue #23

## Quy trình đã áp dụng

Nhánh được tách từ công việc frontend đang chờ review, có ancestry từ `develop`. Commit dùng Conventional Commit và tham chiếu EN-14/Issue #23. Pull Request mở vào `develop`; không tự merge, không tự đóng issue. PR chỉ sẵn sàng merge khi CI xanh, có ít nhất một approval và QA đạt.

## Thay đổi

- Bỏ toàn bộ local demo store, seed API, session giả và cơ chế đổi vai trò trên màn hình đăng nhập.
- Xóa 48 màn hình nguồn Stitch/showcase và toàn bộ dữ liệu giả trong marketplace, key, playground, payment, request history, analytics và workflow.
- Giữ đầy đủ route, menu và khung chức năng sản phẩm cho Consumer, Provider và Admin; mọi nghiệp vụ chưa có API hiển thị trạng thái trống với hành động quay lại tổng quan.
- Dashboard liệt kê toàn bộ chức năng được phép theo vai trò; Provider có cả công cụ sử dụng API và công cụ cung cấp API theo Role Matrix.
- Giảm translation catalog từ 4.505 xuống 98 nhãn đang dùng; bỏ dependency và asset không còn cần.
- Giữ tích hợp Auth thật: register, login, me, access guard, refresh rotation và logout.

## Kết quả kiểm tra

- 16 test frontend đạt: contract Bearer/error envelope, refresh rotation, retry 401, logout offline, đăng ký, duplicate email, route guard, tính đầy đủ của route và trạng thái trống.
- Translation audit đạt 149 nhãn; TypeScript và production build đạt.
- Bundle JavaScript đầu vào giảm từ khoảng 898 KB xuống 351 KB; CSS giảm còn khoảng 32 KB; build không còn cảnh báo chunk trên 500 KB.
- Trình duyệt desktop: đăng nhập Consumer bằng backend, vào đúng workspace, sidebar có đủ chức năng và dashboard có thẻ điều hướng tương ứng.
- Trình duyệt mobile: menu workspace hoạt động, trang chức năng hiển thị trạng thái trống và không có dữ liệu mẫu.
- Smoke test HTTP backend development kiểm tra Consumer/Provider, duplicate email, sai mật khẩu, role guard, refresh rotation và logout/revocation.

## Chưa thuộc release này

Các trang Sprint 2–5 đã có khung và trạng thái trống nhưng vẫn cần API contract từ backend để có dữ liệu và thao tác thật. Chưa có API sửa hồ sơ, quên mật khẩu và xóa tài khoản. Token vẫn nằm trong `sessionStorage` theo Bearer contract hiện tại nên cần chuyển sang HttpOnly cookie khi backend hỗ trợ.
