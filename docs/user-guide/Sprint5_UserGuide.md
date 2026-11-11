# Hướng dẫn Sử dụng Sprint 5 — Nền tảng API-Market (3 Vai trò)

> **Dự án:** API Marketplace Platform
> **Tác giả:** Trần Hà Thảo Vân (`@vuonghathaovan-gif` — QA Lead, Refs #25)
> **Cập nhật:** Sprint 5 Release Candidate (11/11/2026)
> **Căn cứ mã nguồn thực tế:** [`frontend/src/pages/consumer/CostGuardPage.tsx`](file:///d:/Downloads/AAAAA/API-Market/frontend/src/pages/consumer/CostGuardPage.tsx), [`frontend/src/pages/provider/AnalyticsHealthPage.tsx`](file:///d:/Downloads/AAAAA/API-Market/frontend/src/pages/provider/AnalyticsHealthPage.tsx), [`docs/07-sprint5-demo-and-rc-checklist.md`](file:///d:/Downloads/AAAAA/API-Market/docs/07-sprint5-demo-and-rc-checklist.md)

---

## 1. DÀNH CHO CONSUMER (NGƯỜI DÙNG MUA API)

### Phân hệ Cost Guard & Cảnh báo Ngân sách Chi tiêu (`US-32`)
Giao diện quản lý ngân sách giúp Consumer kiểm soát chi phí gọi Gateway hàng tháng, tránh rủi ro phát sinh cước ngoài tầm kiểm soát.

- **Đường dẫn truy cập:** `/dashboard/cost-guard`
- **Tài khoản demo:** `user@example.com` / `password123`

#### Các tính năng chính trên màn hình:
1. **Thiết lập Ngân sách Tháng (`Monthly Budget`):**
   - **Chọn loại tiền tệ (`Currency`):** Hỗ trợ độc lập hai loại tiền tệ **USD** ($) hoặc **VND** (₫). Việc chuyển đổi tiền tệ không tự động nhân tỷ giá làm sai lệch số liệu.
   - **Nhập hạn mức chi tiêu (`Budget Amount`):** Cho phép nhập số dương (hỗ trợ số thập phân cho USD, ví dụ `50.00`).
2. **Chế độ Ngắt Cứng (`Hard Cutoff Toggle`):**
   - **Khi BẬT (`Hard Cutoff = ON`):** Khi chi tiêu trong tháng chạm mốc 100% ngân sách, Gateway sẽ lập tức từ chối các request trả phí tiếp theo với mã lỗi **HTTP 429 `BUDGET_EXHAUSTED`** để bảo vệ tài khoản.
   - **Khi TẮT (`Hard Cutoff = OFF`):** Hệ thống chỉ hiển thị cảnh báo đỏ trên giao diện khi vượt 100%, request gọi Gateway vẫn được thông qua bình thường.
3. **Thanh Tiến độ Trực quan & Mốc Cảnh báo (`Progress & Thresholds`):**
   - Thanh tiến trình hiển thị tỷ lệ % ngân sách đã sử dụng (`aria-valuenow` kẹp trong khoảng 0–100% chuẩn WCAG 2.2 AA).
   - **Mốc 50%:** Hiển thị thẻ thông báo màu vàng — Đã dùng nửa ngân sách.
   - **Mốc 80%:** Hiển thị thẻ cảnh báo màu cam — Ngân sách sắp cạn.
   - **Mốc 100%:** Thẻ cảnh báo màu đỏ — Ngân sách đã hết.
4. **Miễn trừ Phí Sandbox & Yêu cầu Không Định giá:**
   - **Sandbox Usage:** Lưu lượng gọi thử nghiệm trên Sandbox được tách riêng, không tính vào chi phí ngân sách tháng.
   - **Unpriced Requests:** Các request cũ từ Sprint 4 chưa có đơn giá được hệ thống thống kê riêng trong banner thông báo, không cộng lẫn vào số tiền đã tiêu.

---

## 2. DÀNH CHO PROVIDER (NHÀ CUNG CẤP DỊCH VỤ API)

### Phân hệ Phân tích Chỉ số & Sức khỏe Dịch vụ (`US-31`)
Cung cấp bức tranh toàn diện và trung thực về lưu lượng, độ trễ và doanh thu của các API thuộc sở hữu Provider.

- **Đường dẫn truy cập:** `/provider/analytics`
- **Tài khoản demo:** `provider@example.com` / `password123`

#### Các tính năng chính trên màn hình:
1. **Bộ lọc Phạm vi Dữ liệu (`Analytics Filters`):**
   - **Chọn API:** Menu thả xuống chỉ hiển thị danh sách các API do chính Provider này sở hữu.
   - **Chọn Endpoint:** Lọc chi tiết theo từng đường dẫn endpoint cụ thể (GET, POST...).
   - **Khoảng thời gian (`Date Range`):** Ngày bắt đầu (`From`) và Ngày kết thúc (`To`), hỗ trợ đối soát trong vòng tối đa 365 ngày (chuẩn UTC).
2. **Thẻ Chỉ số Hiệu năng Đo lường Trung thực (`Honest Telemetry KPIs`):**
   - **Tổng lưu lượng (`Total Requests`):** Tổng số lượt gọi API trong khoảng thời gian đã chọn.
   - **Tỷ lệ thành công & Lỗi (`Success / Error Rate`):** Thống kê số lượng mã lỗi $\ge 400$ và tỷ lệ lỗi phần trăm.
   - **Phân vị Độ trễ Mạng (`Latency P50 / P95 / P99`):** Thời gian phản hồi thực tế của upstream theo mili-giây.
   - **Độ trễ Xử lý của Gateway (`Avg Gateway Overhead`):** Thời gian tiêu tốn cho việc xác thực, kiểm tra quota và routing.
   - *Lưu ý trung thực:* Khi chưa có đủ mẫu đo thực nghiệm, hệ thống hiển thị trạng thái `Chưa có mẫu đo` thay vì tự động bịa số liệu.
3. **Bảng Xếp hạng Top 10 Endpoints (`Top Endpoints Table`):**
   - Liệt kê tối đa 10 endpoint có khối lượng gọi cao nhất, sắp xếp giảm dần theo số lượt request.
   - Hiển thị rõ HTTP Method, Path Pattern, Số request, Tỷ lệ lỗi và P95 Latency.
4. **Báo cáo Doanh thu Tách biệt Đa Tệ (`Multi-Currency Revenue`):**
   - Doanh thu phát sinh được hiển thị tách riêng thành từng mục: Doanh thu **VND** (₫) và Doanh thu **USD** ($).
   - Tuyệt đối không cộng gộp lẫn lộn số tiền khác loại tiền tệ.
5. **Bảo mật Cách ly Tuyệt đối (`Data Isolation`):**
   - Nếu Provider cố tình truy vấn dữ liệu Analytics bằng `apiId` thuộc sở hữu của Provider khác, hệ thống sẽ trả về mã lỗi **HTTP 404 NOT_FOUND** (`API not found`), ngăn chặn hoàn toàn việc rò rỉ thông tin hoặc lộ sự tồn tại của API bên thứ ba.

---

## 3. DÀNH CHO ADMIN (QUẢN TRỊ VIÊN HỆ THỐNG)

### Phân hệ Quản trị Gateway, Kiểm duyệt & Vận hành Hệ thống (`EN-15`, `EN-16`)
Dành cho quản trị viên điều hành sàn giao dịch, kiểm soát an toàn và can thiệp khi có vi phạm.

- **Đường dẫn truy cập:** `/admin/gateway`, `/admin/api-reviews`, `/admin/audit-logs`
- **Tài khoản demo:** `admin@example.com` / `password123`

#### Các tính năng chính trên màn hình:
1. **Kiểm duyệt Hồ sơ API (`API Reviews & Dossier`):**
   - Xem xét hồ sơ kỹ thuật do Provider nộp: kiểm tra đặc tả OpenAPI 3.0, cờ cảnh báo dữ liệu cá nhân nhạy cảm, xác minh DNS tên miền.
   - Điều phối luồng trạng thái API: `Submitted` $\to$ `Under Review` $\to$ `Approved` $\to$ `Published`.
2. **Giám sát Sức khỏe Hạ tầng (`Gateway & Operations Health`):**
   - Kiểm tra trạng thái hoạt động theo thời gian thực của cụm dịch vụ: **PostgreSQL Store**, **Redis Metering**, **Gateway Router**, và **Operations Worker**.
   - Theo dõi chỉ số tổng thể: số subscription đang hoạt động, lượng outbox chờ xử lý, số bản ghi `usage_logs`.
3. **Xử lý Vi phạm & Khóa Khẩn cấp (`Suspend & Restore API`):**
   - Khi phát hiện vi phạm bản quyền hoặc bảo mật: Admin bấm **Suspend** $\to$ API lập tức bị gỡ khỏi Marketplace, Gateway chặn tức thì mọi request với mã lỗi `401/403`.
   - Khi vi phạm đã được giải quyết: Bấm **Restore** $\to$ API quay trở lại trạng thái `Published` và Gateway mở khóa lưu lượng.
4. **Nhật ký Kiểm toán Bất biến (`Audit Logs`):**
   - Mọi thao tác phê duyệt, đình chỉ, phục hồi hoặc thay đổi hạn mức đều được lưu vết tự động trong bảng `audit_logs` cùng một transaction với hành động quản trị, bảo đảm tính minh bạch và truy vết 100%.
