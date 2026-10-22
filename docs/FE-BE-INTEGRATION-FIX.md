# Bàn giao sửa lỗi FE–BE — issue #71

Phạm vi: năm nhóm lỗi đã tái hiện trên `develop` 2445120. Thực hiện theo yêu cầu sửa và đẩy PR; không nhận các phần nghiệp vụ Sprint 3–5 chưa triển khai là đã hoàn thành.

## Thay đổi

| Mục | Kết quả |
|---|---|
| INT-01 Provider Dashboard | Đọc verification và trang API gần đây bằng providerApi thật. Tổng lấy từ `total` của backend; không so nhầm provider profile ID với user ID. Tạo API chỉ mở khi Verified; import mở khi Verified và có API. Có loading, lỗi, thử lại, refresh khi focus và chống phản hồi cũ sau đổi tài khoản. |
| INT-02 Crash Checkout/Playground | Thiếu API/endpoint/plan có trạng thái không khả dụng; giữ thứ tự hooks. Checkout yêu cầu đăng nhập khi có sản phẩm hợp lệ. |
| INT-03 Sai đối tượng Checkout | Tra cứu đúng API Published và planId thuộc API đó; không fallback sang API/plan đầu tiên. |
| INT-04 Draft trên public pages | Lọc Published trong Marketplace, Detail, Pricing, Compare, Sandbox, Playground và Checkout; dữ liệu Draft trong cache không xuất hiện công khai. |
| INT-05 Health giả | Admin Operations hiển thị chưa có dữ liệu giám sát. Không báo PostgreSQL connected, latency, worker active hoặc production-ready khi không có số đo. |

## Hành vi trước khi có backend tương ứng

- Dashboard không tạo số liệu usage, subscriber hoặc doanh thu từ mock/localStorage; hiển thị chưa có dữ liệu.
- Checkout chưa gọi được Subscription/Payment backend nên nút đăng ký được tắt, không tạo subscription local rồi báo thành công.
- Playground chưa có proxy backend nên nút Send Request được tắt, không trả sampleResponse như kết quả HTTP thật.
- Không thêm endpoint, thay đổi schema, hay giả định `/health` chứng minh kết nối PostgreSQL/Redis/Gateway/worker.
- Marketplace/Detail vẫn cần tích hợp service backend của PR #69; việc lọc Draft và chống crash không có nghĩa đã hoàn tất kết nối dữ liệu công khai. Sandbox/API Key/Subscription/Analytics tiếp tục theo sprint tương ứng.

## Kiểm thử và nghiệm thu

`frontend/src/test/IntegrationConnections.test.tsx` có 23 regression tests:

- Provider Verified/Pending/Rejected/chưa xác minh; loading và lỗi mạng không bị coi là chưa xác minh.
- Link Create/Import, tổng số API từ backend, đúng provider profile ID.
- Refresh, đổi tài khoản và phản hồi cũ; đăng xuất không lộ danh sách cũ.
- Route trực tiếp trên storage sạch; API/plan ID sai; Checkout chưa đăng nhập.
- Draft trong cache bị chặn ở bảy route công khai.
- Checkout/Playground không tạo thành công giả từ mô phỏng local.
- Admin không hiển thị health/latency/worker chưa đo.

Lệnh kiểm tra:

```powershell
cd frontend
npm run build
npm run lint
npm test -- --no-file-parallelism
```

Kết quả local: toàn bộ frontend 178 test đạt; test mới 23/23 đạt sau chỉnh trạng thái request; typecheck và build đạt. Lint không có lỗi hoặc warning mới trong file thay đổi; còn warning đã có ở AuthContext, AppContext và CreateApiWizardPage. Repo checker và diff whitespace đạt.

QA cần kiểm tra trên trình duyệt với DB seed: xác minh Provider → quay lại Dashboard → thấy trạng thái Verified/danh sách API → mở Create/Import. Đăng nhập tài khoản khác không nhìn thấy dữ liệu tài khoản trước. Truy cập public route với ID sai hoặc cache rỗng không làm trắng trang. Không coi test component/CI là xác nhận staging hay deployment production.

Issue #71 còn phần tích hợp #69 và backend các sprint sau; PR sửa lỗi này chỉ giải quyết INT-01 đến INT-05.
