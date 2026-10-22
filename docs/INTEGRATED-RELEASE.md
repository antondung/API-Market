# Bàn giao bản tích hợp Marketplace và sửa OpenAPI

## Thành phần

Bản tích hợp dựa trên `develop` tại `2445120`, gồm:

- #67: schema Marketplace/Gateway/Sandbox/API Key, head `673ff64`.
- #69: Marketplace và API Detail backend, head `638ed04`.
- #72: sửa 5 nhóm lỗi frontend, head `4b627a2`.
- BE-01: bảo toàn bản import OpenAPI khi sửa Version/Endpoint, commit `b2f311d`.

Xung đột migration đã được giải quyết bằng cách giữ cả `006_fix_rejection_reason_null.sql` và `006_create_marketplace_gateway_schema.sql`, sau đó áp dụng `007_provider_documentation_state.sql`. Không đổi tên migration đã có. Test migration kiểm tra chạy lại không thay đổi lịch sử thay vì đếm cố định số file.

## Kiểm chứng tại máy

- Backend: 90/90 test đạt, dùng PostgreSQL tạm riêng, bao gồm schema #67, Marketplace #69 và 6 regression BE-01.
- Frontend: 178/178 test đạt; TypeScript và production build đạt.
- Lint frontend: không có lỗi; còn 3 cảnh báo ở AuthContext, AppContext và CreateApiWizardPage.
- 5 regression BE-01 đã thất bại trên code cũ trước khi sửa. Sau sửa, tài liệu và cache được giữ lại; chỉ Version liên quan bị đánh dấu stale. Submit bị chặn đến khi import lại.
- Kiểm tra `git diff --check` đạt. Trạng thái CI và review cần xem trực tiếp trên PR của bản tích hợp; kết quả cục bộ không thay thế CI.

## Trình tự phát hành

1. Review và merge PR tích hợp vào `develop`, sau đó PR phát hành vào `main`; tuân thủ yêu cầu review của repository.
2. Sao lưu database và chạy `npm run db:migrate` trước khi khởi động backend mới. Startup kiểm tra cột mới `documentation_stale`.
3. Kiểm tra smoke test import tài liệu, đổi tên Version, sửa/chuyển Endpoint, import lại và gửi duyệt trên môi trường triển khai.

Bản sửa không khôi phục được tài liệu đã bị code cũ xóa: cần file gốc hoặc backup. Chưa có xác nhận đã triển khai staging/production.

## Công việc còn lại

Schema #67 và endpoint Marketplace #69 không tự nối frontend. Marketplace/Detail frontend và các luồng Consumer như Subscription, Checkout, API Key, Sandbox/Gateway vẫn cần tích hợp backend theo backlog. #72 khóa thao tác Checkout/Playground chưa có backend, bỏ trạng thái giám sát khỏe giả và nối Provider Dashboard với dữ liệu backend. Vì vậy bản tích hợp này không đồng nghĩa hoàn thành toàn bộ Sprint 3 hoặc triển khai giao dịch Consumer thực tế.

Chi tiết: [BE-01](../backend/OPENAPI-PRESERVATION.md), [FE–BE](FE-BE-INTEGRATION-FIX.md), [Marketplace bàn giao](../backend/SPRINT-3-HANDOFF.md).
