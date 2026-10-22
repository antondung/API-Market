# BE-01 — Bảo toàn tài liệu OpenAPI

## Kết quả kiểm chứng trước sửa

5 regression HTTP/PostgreSQL mới (sửa Version, thêm/sửa/xóa/chuyển Endpoint) đều thất bại trên code cũ: tài liệu bị xóa hoặc cache `openapi_document` mất. Các test dùng 3 Version cùng một API để xác nhận phạm vi ảnh hưởng.

## Hành vi sau sửa

- Đổi changelog giữ nguyên tài liệu đã import. Đổi tên Version chỉ đồng bộ `info.version` ở tài liệu/cache của Version đó, không xóa paths/schemas/extensions và không ảnh hưởng Version khác.
- Thêm/sửa/xóa Endpoint giữ nguyên bản import, đánh dấu `documentationStale=true` ở Version đã có tài liệu bị ảnh hưởng.
- Chuyển Endpoint giữa hai Version đánh dấu cả Version nguồn và đích nếu đã có tài liệu; các Version khác giữ nguyên.
- Version chưa từng có tài liệu không có import để đánh dấu stale; validation cũ vẫn chặn gửi duyệt nếu có Endpoint chưa được document.
- Submit trả 400 `DOCUMENTATION_STALE` nếu còn Version stale, kể cả Version vừa bị xóa Endpoint cuối cùng. Giữ tài liệu cũ không đồng nghĩa tài liệu đó được dùng để vượt kiểm duyệt.
- Import lại chỉ thay Endpoint/tài liệu và xóa trạng thái stale của Version được chọn, trong cùng transaction. Những Version khác vẫn cần đồng bộ riêng.
- Xóa hẳn Version/API là thao tác xóa rõ ràng của người dùng và vẫn cascade các tài nguyên thuộc đối tượng được xóa.
- Version DTO có thêm `documentationStale`; frontend Endpoint Management giải thích việc giữ tài liệu và yêu cầu đồng bộ. Swagger và JSON bàn giao được cập nhật.

## Migration và triển khai

`007_provider_documentation_state.sql` thêm cột boolean, không sửa migration đã áp dụng. Chạy `npm run db:migrate` trước startup; service kiểm tra cột mới lúc khởi động. Migration/seed chạy lại giữ nguyên dữ liệu. Có regression mô phỏng database cũ đã import tài liệu, áp dụng migration mới và chạy lại.

Bản sửa ngăn xóa tài liệu ở các thao tác tiếp theo. Tài liệu đã bị xóa bởi phiên bản cũ chỉ có thể lấy lại từ file nguồn hoặc bản sao lưu; không có khẳng định tự phục hồi dữ liệu đã mất.

## Giới hạn phát hành

Đưa source code vào main không có nghĩa đã hoàn thành toàn bộ Consumer/Gateway. Schema #67 và Marketplace/Detail backend #69 hỗ trợ bước tiếp theo; FE Marketplace và các luồng Sandbox/Key/Subscription còn phải được nối backend theo backlog. Checkout/Playground chưa có backend được khóa và ghi rõ trạng thái theo #72. Không ghi nhận đã triển khai staging/production hoặc có giao dịch thật.
