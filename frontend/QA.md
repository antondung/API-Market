> Cập nhật: xem BACKEND_INTEGRATION.md và BAO-CAO-FRONTEND.md cho kiểm thử xác thực backend; kết quả dưới đây ghi nhận bản demo trước tích hợp.

# Frontend validation

Ngày kiểm tra: 08/10/2026.

- Production build: TypeScript và Vite build thành công.
- 61 tests: đầy đủ route của 48 màn hình nguồn, workspace role guards, protected redirect, chống external return URL, quota edge cases, JSON/YAML contract validation, malformed operation values, key secret không được lưu, key rotation giữ tên/API, budget persistence, catalog empty state, checkout failure/success, wizard draft validation/persistence.
- Dependency audit: 0 vulnerabilities tại thời điểm kiểm tra.
- Browser: desktop Marketplace và Consumer dashboard; mobile navigation, key table horizontal scrolling và Playground. Sửa grid minimum width khiến Playground tràn ngang; sau sửa, document width không vượt viewport.
- Browser workflow: Provider submit organization/domain → Admin approve → Provider hoàn thành wizard → Admin approve API → Provider publish → API xuất hiện trong Marketplace.
- Browser checkout: sandbox success chuyển tới subscription mới với status Active.
- Browser playground: request loading → 200 demo response; ghi request vào local audit/history.

Các kiểm tra trên chỉ xác nhận frontend demo. Chưa kiểm thử với backend, payment provider, gateway thật hoặc môi trường deploy. UI guards và local session không thay thế server authorization.

## Bản Việt / Anh

- 122 kiểm thử: 61 kiểm thử chức năng cũ và 61 kiểm thử bản địa hóa. Bao phủ 48 màn hình nguồn ở tiếng Việt, các trang bổ sung theo vai trò, đổi ngôn ngữ và lưu lựa chọn, lỗi thanh toán, giá trị select, nhãn trợ năng, nội suy, điều hướng từ màn hình nguồn, tìm kiếm danh mục đã dịch và giữ tên khóa người dùng nhập khi đổi ngôn ngữ.
- `npm run check:translations`: không thiếu nhãn tĩnh được gọi dịch, không có bản dịch rỗng hoặc biến nội suy sai.
- Browser: chuyển Việt → Anh → tải lại vẫn giữ English; đổi lại Tiếng Việt. Tiêu đề, nội dung và nhãn trợ năng cập nhật trực tiếp. Kiểm tra trang chủ ở desktop và mobile, không tràn ngang tại viewport 375px.
- Bản xem trước: `docs/preview-vietnamese.png`, `docs/preview-english.png`.
# Kiểm tra bổ sung nội dung prompt — 09/10/2026

- 135 test đã qua: 122 test sẵn có và 13 test bổ sung cho registration confirmation, registered endpoints, redacted logs, trial exhaustion, suspended/missing API, provider filters, sandbox transaction failure, quota, moderation reason và bản dịch.
- Kiểm tra trình duyệt: request sandbox xuất hiện trong lịch sử và cập nhật tổng request/latency; Việt–Anh đổi tại chỗ; mobile filter giữ provider trên URL; tên nhà cung cấp không bị dịch trong chip.
- Responsive: kiểm tra desktop 1440 và mobile 390; lịch sử có bảng cuộn bên trong, không làm tràn chiều ngang toàn trang. Kích thước trình duyệt được trả về mặc định sau kiểm tra.
- Đối chiếu chi tiết và giới hạn backend: `PROMPT_COVERAGE.md`.
- Ảnh giao diện sau bổ sung: `docs/preview-prompt-content.png`.
