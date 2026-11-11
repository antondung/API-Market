# BỘ TEST CASES KIỂM THỬ TOÀN DIỆN SPRINT 5 (FULL TEST SUITE)

## DỰ ÁN: NỀN TẢNG API MARKETPLACE & MANAGEMENT
### QUY CHUẨN: IAN SOMMERVILLE — SOFTWARE TESTING (CH. 9) & TESTING_RULES.MD (PHỤ LỤC B)

> **Tài liệu QA Lead:** Trần Hà Thảo Vân (`@vuonghathaovan-gif` — Issue #25)
> **Căn cứ kỹ thuật:** `docs/test/Sprint5_AcceptanceCriteria.md`, `docs/test/TESTING_RULES.md`, `docs/07-sprint5-demo-and-rc-checklist.md`, `docs/06-production-rollback-runbook.md`, `backend/SPRINT-5-HANDOFF.md`, `backend/SPRINT-5-DATABASE-HANDOFF.md`.
> **Chính sách kiểm thử:** Tuân thủ tuyệt đối quy tắc **Z1–Z5** (không pass ảo, không force:true, không bơm storage), **H1–H4** (clean state, selector người dùng, gõ phím tuần tự, đa viewport 1280x720 và 768x1024), **A1–A3** (0 console error, phần tử trong viewport, người dùng thường làm lại được).
> **Ghi chú về trạng thái:** **100% Test Cases hiện tại ở trạng thái "Chưa chạy"**; KHÔNG tự ý ghi Pass/Fail khi chưa chạy thực tế. Các phụ thuộc kỹ thuật (FE #23, BE PR #106, DB PR #104, PR #105) được ghi rõ ràng trong từng ca kiểm thử.

---

## 1. BẢNG TỔNG QUAN PHÂN BỔ 42 TEST CASES SPRINT 5

| Phân hệ / Nhóm chức năng | Mã User Story / Epic | Số lượng TC | Critical | High | Medium | Phụ thuộc chính |
|---|---|:---:|:---:|:---:|:---:|---|
| **1. Provider Analytics** | `US-31` | 7 | 2 | 2 | 3 | BE PR #106, DB PR #104, FE #23 |
| **2. Cost Guard** | `US-32` | 9 | 2 | 5 | 2 | BE PR #106, FE #23 |
| **3. Security Testing** | `EN-11` | 7 | 5 | 2 | 0 | Độc lập (`develop`) / BE PR #106 |
| **4. Performance & Load SLA** | `EN-12` | 2 | 2 | 0 | 0 | PR #103, BE PR #106 (Rủi ro SLA) |
| **5. Deploy, Backup & Rollback**| `EN-13` | 3 | 1 | 2 | 0 | PR #103, DB PR #104 |
| **6. UX, Responsive & A11y** | `EN-14` | 5 | 1 | 3 | 1 | FE Issue #23 (@leduwn) |
| **7. Regression & Quality Gate** | `EN-15` | 4 | 4 | 0 | 0 | Tích hợp develop, Staging đóng băng |
| **8. Kịch bản Demo 4 Phân cảnh** | `EN-16` | 4 | 2 | 2 | 0 | Toàn bộ hệ thống, PR #105, FE #23 |
| **9. Tồn đọng Sprint 4 (Bug Fix)**| `US-23` (BUG-S4-01) | 1 | 0 | 1 | 0 | PR #105 (@Tungdota53) |
| **TỔNG CỘNG SPRINT 5** | **9 Phân hệ** | **42** | **19** | **17** | **6** | **100% Chưa chạy** |

### 1.1. Phân bố theo Trạng thái phụ thuộc Kỹ thuật
- **Độc lập / Sẵn sàng trên develop:** **10 TCs** (`TC-SEC-01`, `TC-SEC-02`, `TC-SEC-04`, `TC-SEC-06`, `TC-SEC-07`, `TC-PERF-02`, `TC-OPS-01`, `TC-OPS-03`, `TC-DEMO-01`, `TC-DEMO-02`).
- **Chờ Backend PR #106 (@Tungdota53):** **12 TCs** (Cost Guard API: `TC-CST-02`, `03`, `07`, `08`, `09`; Analytics API: `TC-ANL-01`, `02`, `03`, `06`; Chống xoay Key: `TC-SEC-03`; Khử dữ liệu nhạy cảm Log: `TC-SEC-05`; Load test SLA: `TC-PERF-01`).
- **Chờ Frontend Issue #23 (@leduwn):** **12 TCs** (Toàn bộ UX/Responsive: `TC-UX-01`..`05`; UI Cost Guard: `TC-CST-01`, `04`, `05`, `06`; UI Provider Analytics: `TC-ANL-04`, `07`; Demo Phân cảnh 4: `TC-DEMO-04`). *(Ghi chú: Khung trang UI CostGuardPage và AnalyticsHealthPage đã có sẵn trên `develop`, nhưng đang dùng dữ liệu mock/hardcoded, chờ FE #23 nối API thật)*.
- **Chờ Database PR #104 (@danhbuonsv2-svg):** **2 TCs** (Doanh thu đa tệ: `TC-ANL-05`; Backup verify mở rộng: `TC-OPS-02`).
- **Chờ Bug Fix PR #105 (@Tungdota53):** **2 TCs** (`TC-OVH-06-RETEST` và Demo Phân cảnh 3: `TC-DEMO-03`).
- **Chờ Tích hợp toàn diện & Staging đóng băng (Quality Gate):** **4 TCs** (`TC-REG-01`, `TC-REG-02`, `TC-UAT-01`, `TC-UAT-02`).
- **TỔNG CỘNG:** $10 + 12 + 12 + 2 + 2 + 4 = \mathbf{42\text{ TCs}}$ (100% Khớp).

---

## 2. DANH MỤC 42 TEST CASES CHI TIẾT (CHUẨN 9 CỘT IAN SOMMERVILLE)

---

### PHẦN 1: US-31 — PROVIDER ANALYTICS (7 TEST CASES)

| ID | Test Case Description | User Story / AC Ref | Preconditions | Test Steps (Thao tác chi tiết & Câu truy vấn kiểm chứng) | Test Data (Dữ liệu vào) | Expected Output (Kỳ vọng) | Actual Output | Viewport / Mức ưu tiên / Trạng thái |
|:---|:---|:---|:---|:---|:---|:---|:---|:---:|
| **[ANL-01]** | Lấy dữ liệu tổng quan Analytics theo API hợp lệ | US-31<br>`AC-US31-01` | Provider đã đăng nhập; API thuộc quyền sở hữu của Provider đã có lượt gọi phát sinh | 1. Đăng nhập Provider (`provider@example.com` / `Provider@123`).<br>2. Gửi request `GET /api/provider/analytics/overview?apiId=3&from=2026-11-01&to=2026-11-10`.<br>3. Mở F12 Network quan sát HTTP status và cấu trúc JSON trả về. | URL: `/api/provider/analytics/overview`<br>`apiId: 3`<br>From: `2026-11-01`<br>To: `2026-11-10` | - HTTP 200 OK.<br>- JSON chứa: `requestCount > 0`, `errorCount >= 0`, `errorRatePercent` (làm tròn hoặc kiểu float8).<br>- Dữ liệu tổng hợp đúng trong khoảng ngày UTC chỉ định. | Chưa chạy | Không áp dụng (API)<br>Medium<br>Chưa chạy (Phụ thuộc: BE PR #106) |
| **[ANL-02]** | Lọc dữ liệu Analytics chi tiết theo từng Endpoint | US-31<br>`AC-US31-01` | API có nhiều endpoint khác nhau đã nhận lưu lượng | 1. Gửi request `GET /api/provider/analytics/overview?apiId=3&endpointId=8&from=2026-11-01&to=2026-11-10`.<br>2. Kiểm tra chỉ số `requests`, `errorRate` so với khi không truyền `endpointId`.<br>3. Kiểm tra trường `activeSubscribers` và doanh thu giữ nguyên mức toàn API. | `apiId: 3`<br>`endpointId: 8` | - HTTP 200 OK.<br>- Chỉ số `requests` $\le$ tổng requests toàn API.<br>- Lưu lượng được lọc chính xác cho riêng endpoint 8. | Chưa chạy | Không áp dụng (API)<br>Medium<br>Chưa chạy (Phụ thuộc: BE PR #106) |
| **[ANL-03]** | Thống kê phân vị độ trễ P50, P95, P99 và Gateway Overhead | US-31<br>`AC-US31-02` | API có tối thiểu 20 requests thực tế được ghi nhận | 1. Gọi `GET /api/provider/analytics/overview` cho API mục tiêu.<br>2. Kiểm tra các trường: `p50LatencyMs`, `p95LatencyMs`, `p99LatencyMs`, `p50OverheadMs`, `p95OverheadMs`, `p99OverheadMs`.<br>3. So sánh tương quan toán học giữa các phân vị. | `apiId: 3` | - Các trường phân vị là số nguyên/thực dương (ms).<br>- Thỏa mãn: $P50 \le P95 \le P99$ cho cả latency và overhead.<br>- Khi không có mẫu đo (0 requests), các trường trả về `null`. | Chưa chạy | Không áp dụng (API)<br>High<br>Chưa chạy (Phụ thuộc: BE PR #106) |
| **[ANL-04]** | Danh sách Top 10 Endpoints theo khối lượng truy cập | US-31<br>`AC-US31-03` | API có nhiều endpoint được gọi với tần suất khác nhau | 1. Gọi API Analytics Overview.<br>2. Kiểm tra mảng `topEndpoints` trong response.<br>3. Kiểm tra số lượng phần tử và thứ tự sắp xếp trên UI. | `apiId: 3` | - Mảng chứa tối đa 10 phần tử.<br>- Sắp xếp giảm dần theo `requestCount`.<br>- Mỗi phần tử có đủ `method`, `pathPattern`, `requestCount`, `errorRatePercent`, `p95LatencyMs`. | Chưa chạy | Không áp dụng (API)<br>Medium<br>Chưa chạy (Phụ thuộc: FE #23) |
| **[ANL-05]** | Phân tách doanh thu độc lập theo loại tiền tệ (VND và USD) | US-31<br>`AC-US31-04` | API có phát sinh giao dịch thanh toán ở cả gói VND và gói USD | 1. Gọi API Analytics Overview hoặc truy vấn trực tiếp bảng aggregate.<br>2. Kiểm tra số liệu doanh thu trả về. | `apiId: 3` | - Doanh thu tách riêng theo trường tiền tệ (ví dụ: `{ "VND": 1500000, "USD": 45 }`).<br>- Tuyệt đối không cộng gộp lẫn số tiền VND và USD thành một số duy nhất. | Chưa chạy | Không áp dụng (API)<br>High<br>Chưa chạy (Phụ thuộc: DB PR #104) |
| **[ANL-06]** | Bảo mật cách ly dữ liệu: Ngăn Provider A xem Analytics của Provider B | US-31<br>`AC-US31-04` | Tài khoản Provider A cố tình truyền `apiId` thuộc quyền sở hữu của Provider B | 1. Đăng nhập Provider A (`provider@example.com`).<br>2. Gửi request `GET /api/provider/analytics/overview?apiId=999` (API của người khác).<br>3. Quan sát mã phản hồi HTTP và dữ liệu trả về. | Token: Provider A<br>`apiId`: Của Provider B | - Tính bất biến: Hệ thống tuyệt đối cách ly dữ liệu, không trả bất kỳ dữ liệu lưu lượng hay doanh thu nào của Provider B.<br>- Trạng thái trả về: HTTP 404 NOT_FOUND kèm JSON `{ "error": { "code": "NOT_FOUND", "message": "API not found" } }` theo quyết định chính thức của Tech Lead (PR #112 / commit `e786a52`, `backend/src/usage-router.ts:47-49`, `docs/known-limitations.md`).<br>- Tuyệt đối không làm rò rỉ ID space hoặc xác nhận sự tồn tại của API thuộc bên thứ ba. | Chưa chạy | Không áp dụng (API)<br>Critical<br>Đã tích hợp (PR #112) |
| **[ANL-07]** | **Đối soát 4 tầng Analytics:** UI Dashboard $\leftrightarrow$ API JSON $\leftrightarrow$ PostgreSQL $\leftrightarrow$ Redis | US-31<br>`AC-US31-01`<br>`AC-US31-04` | Hệ thống đang chạy đầy đủ DB, Redis, Backend, Frontend. Thực hiện 5 requests qua Gateway | 1. Thực hiện 5 requests qua Gateway cho API 3.<br>2. Xem số liệu trên UI `http://localhost:5173/provider/analytics`.<br>3. So khớp với API `GET /api/provider/analytics/overview?apiId=3`.<br>4. Chạy câu truy vấn SQL đọc kiểm chứng:<br>`SELECT SUM(request_count) FROM provider_daily_aggregates WHERE api_id = 3;`<br>`SELECT COUNT(*) FROM usage_logs WHERE api_id = 3;` | 5 Gateway requests | - Khớp 100% đối soát số liệu giữa 2 tầng: Số request trong API JSON = Số bản ghi đếm được trong `usage_logs` và bảng aggregate PostgreSQL.<br>- Tầng UI kiểm tra hiển thị trang và chụp ảnh màn hình; tầng Redis không áp dụng do Redis không lưu aggregate Provider Analytics. | Chưa chạy | Desktop 1280x720<br>Critical<br>Chưa chạy (Phụ thuộc: FE #23) |

---

### PHẦN 2: US-32 — COST GUARD (9 TEST CASES)

| ID | Test Case Description | User Story / AC Ref | Preconditions | Test Steps (Thao tác chi tiết & Câu truy vấn kiểm chứng) | Test Data (Dữ liệu vào) | Expected Output (Kỳ vọng) | Actual Output | Viewport / Mức ưu tiên / Trạng thái |
|:---|:---|:---|:---|:---|:---|:---|:---|:---:|
| **[CST-01]** | Thiết lập ngân sách tháng và chế độ ngắt cứng thành công | US-32<br>`AC-US32-01` | Consumer đã đăng nhập (`user@example.com`) | 1. Gửi request `PUT /api/consumer/cost-guard` kèm body JSON.<br>2. Kiểm tra mã phản hồi HTTP.<br>3. Chạy truy vấn đọc DB kiểm chứng:<br>`SELECT * FROM cost_guard_budgets WHERE consumer_id = 2;` | `{"currency":"USD", "monthlyBudget":"30.00", "hardCutoff":true}` | - HTTP 200 OK.<br>- Bản ghi được lưu chính xác trong `cost_guard_budgets` với `monthly_budget = 30.00`, `hard_cutoff = true`. | Chưa chạy | Không áp dụng (API)<br>High<br>Chưa chạy (Phụ thuộc: FE #23) |
| **[CST-02]** | Ép lỗi dữ liệu ngân sách không hợp lệ (ngân sách $\le 0$, thiếu auth) | US-32<br>`AC-US32-01` | Gửi request can thiệp API | 1. Gửi `PUT /api/consumer/cost-guard` với `monthlyBudget: "-10.00"`.<br>2. Gửi request không kèm header Authorization.<br>3. Quan sát phản hồi. | Case 1: `monthlyBudget: -10`<br>Case 2: No Auth Header | - Case 1: HTTP 400 Bad Request (`INVALID_BUDGET_AMOUNT`).<br>- Case 2: HTTP 401 Unauthorized.<br>- Không làm sai lệch bản ghi DB. | Chưa chạy | Không áp dụng (API)<br>Medium<br>Chưa chạy (Phụ thuộc: BE PR #106) |
| **[CST-03]** | Tính chi phí tích lũy theo snapshot giá từng request | US-32<br>`AC-US32-02` | Consumer đã đăng ký gói cước trả phí có giá và hạn ngạch xác định | 1. Thực hiện gọi 1 request qua Gateway thành công HTTP 200.<br>2. Kiểm tra cột `estimated_cost` trong bảng `usage_outbox` và `usage_logs` bằng SQL:<br>`SELECT cost_currency, estimated_cost FROM usage_logs WHERE consumer_id = 2 ORDER BY id DESC LIMIT 1;` | Gói Pro: Price = 30 USD, Quota = 1000 requests | - Cột `estimated_cost` lưu đúng giá trị: $\frac{30}{1000} = 0.030000000000$.<br>- `cost_currency` = 'USD'.<br>- Giá trị không bị làm tròn thành 0. | Chưa chạy | Không áp dụng (API)<br>High<br>Chưa chạy (Phụ thuộc: BE PR #106) |
| **[CST-04]** | **Đối soát 4 tầng Cost Guard:** UI $\leftrightarrow$ API JSON $\leftrightarrow$ PostgreSQL $\leftrightarrow$ Redis | US-32<br>`AC-US32-02` | Thiết lập ngân sách 10 USD. Gọi 10 requests qua Gateway | 1. Cấu hình ngân sách 10 USD.<br>2. Gọi 10 requests qua Gateway.<br>3. Mở UI `http://localhost:5173/dashboard/cost-guard`.<br>4. Gọi API `GET /api/consumer/cost-guard`.<br>5. Chạy SQL đọc kiểm chứng:<br>`SELECT SUM(estimated_cost) FROM usage_logs WHERE consumer_id = 2;`<br>`SELECT SUM(estimated_cost) FROM usage_outbox WHERE consumer_id = 2;` | Ngân sách: 10 USD<br>10 requests | - Khớp 100% đối soát số liệu giữa 2 tầng: Chi phí trong API JSON = Tổng `estimated_cost` trong `usage_logs` + `usage_outbox`.<br>- Tầng UI kiểm tra hiển thị trang và chụp ảnh màn hình; tầng Redis không áp dụng do Redis không lưu dữ liệu chi phí Cost Guard. | Chưa chạy | Desktop 1280x720<br>Critical<br>Chưa chạy (Phụ thuộc: FE #23) |
| **[CST-05]** | Kích hoạt ngưỡng cảnh báo chi tiêu 50% và 80% | US-32<br>`AC-US32-03` | Thiết lập ngân sách 1.00 USD (mỗi request 0.10 USD). Bật `hardCutoff = false` | 1. Gọi 5 requests để đạt chi phí 0.50 USD (50%).<br>2. Gọi `GET /api/consumer/cost-guard` và kiểm tra UI.<br>3. Gọi thêm 3 requests để đạt 0.80 USD (80%).<br>4. Gọi lại API và kiểm tra UI. | Ngân sách: 1.00 USD<br>Lần 1: 5 reqs (50%)<br>Lần 2: 8 reqs (80%) | - Lần 1: `reachedThresholds = [50]`, UI hiển thị huy hiệu vàng cảnh báo mức 1.<br>- Lần 2: `reachedThresholds = [50, 80]`, UI hiển thị huy hiệu cam cảnh báo mức 2.<br>- Gateway vẫn cho phép request đi qua bình thường. | Chưa chạy | Desktop 1280x720<br>High<br>Chưa chạy (Phụ thuộc: FE #23) |
| **[CST-06]** | Cảnh báo khi chạm 100% ngân sách ở chế độ chỉ cảnh báo (`hardCutoff = false`) | US-32<br>`AC-US32-03`<br>`AC-US32-04` | Ngân sách 1.00 USD, `hardCutoff = false`. Đã tiêu thụ đủ 1.00 USD | 1. Gọi request thứ 11 qua Gateway khi chi phí đã chạm/vượt 1.00 USD.<br>2. Kiểm tra phản hồi Gateway.<br>3. Kiểm tra phản hồi API Cost Guard. | Ngân sách: 1.00 USD<br>`hardCutoff: false`<br>Chi phí $\ge$ 1.00 USD | - Gateway vẫn trả HTTP 200 OK (không bị chặn vì `hardCutoff = false`).<br>- API Cost Guard trả `reachedThresholds = [50, 80, 100]`, `spentPercent >= 100`, `estimatedSpend >= monthlyBudget`.<br>- UI hiển thị cảnh báo đỏ ngân sách đã cạn. | Chưa chạy | Desktop 1280x720<br>High<br>Chưa chạy (Phụ thuộc: FE #23) |
| **[CST-07]** | Chặn Gateway `429 BUDGET_EXHAUSTED` khi bật `hardCutoff = true` và chạm trần | US-32<br>`AC-US32-04` | Thiết lập ngân sách 1.00 USD, bật `hardCutoff = true`. Chi phí hiện tại đạt 1.00 USD | 1. Gửi request trả phí tiếp theo qua Gateway kèm API Key hợp lệ.<br>2. Quan sát HTTP status code và body JSON trả về.<br>3. Kiểm tra log upstream mock service. | Header: `x-api-key`<br>Target: Route trả phí | - Gateway từ chối với HTTP 429 Too Many Requests.<br>- Mã lỗi JSON: `error.code === 'BUDGET_EXHAUSTED'` (chỉ assert mã lỗi, không assert chuỗi message `'Monthly spending budget reached'` vì chuỗi này chưa có trong yêu cầu gốc).<br>- Upstream hoàn toàn không bị gọi. | Chưa chạy | Không áp dụng (API)<br>Critical<br>Chưa chạy (Phụ thuộc: BE PR #106) |
| **[CST-08]** | Miễn trừ Cost Guard cho gói Free (0 USD) và lượt dùng thử Sandbox | US-32<br>`AC-US32-04` | Ngân sách chạm 100% và đang bị ngắt cứng (`hardCutoff = true`) | 1. Dùng API Key của gói Free gọi qua Gateway.<br>2. Dùng token sandbox gọi qua Playground.<br>3. Quan sát kết quả xử lý. | Request gói Free / Sandbox | - Request gói Free trả về HTTP 200 OK bình thường.<br>- Request Sandbox hoạt động theo hạn mức 5 lượt.<br>- Không bị chặn bởi lỗi `BUDGET_EXHAUSTED`. | Chưa chạy | Không áp dụng (API)<br>High<br>Chưa chạy (Phụ thuộc: BE PR #106) |
| **[CST-09]** | Tương thích ngược: Đếm riêng các request cũ không có giá (`unpricedRequests`) | US-32<br>`AC-US32-05` | Cơ sở dữ liệu có các bản ghi `usage_logs` cũ từ Sprint 4 có `estimated_cost IS NULL` | 1. Gọi `GET /api/consumer/cost-guard`.<br>2. Kiểm tra trường `unpricedRequests` trong response JSON.<br>3. Chạy câu lệnh SQL kiểm chứng:<br>`SELECT COUNT(*) FROM usage_logs WHERE consumer_id = 2 AND estimated_cost IS NULL;` | Dữ liệu Sprint 4 | - Trường `unpricedRequests` trả về số lượng chính xác khớp với số bản ghi NULL trong DB.<br>- Không bị gộp vào chi phí tính sai lệch. | Chưa chạy | Không áp dụng (API)<br>Medium<br>Chưa chạy (Phụ thuộc: BE PR #106) |

---

### PHẦN 3: EN-11 — SECURITY TESTING & ACCESS CONTROL (7 TEST CASES)

| ID | Test Case Description | User Story / AC Ref | Preconditions | Test Steps (Thao tác chi tiết & Câu truy vấn kiểm chứng) | Test Data (Dữ liệu vào) | Expected Output (Kỳ vọng) | Actual Output | Viewport / Mức ưu tiên / Trạng thái |
|:---|:---|:---|:---|:---|:---|:---|:---|:---:|
| **[SEC-01]** | Chống SSRF: Chặn cấu hình Upstream Base URL trỏ về `localhost` / RFC1918 | EN-11<br>`AC-EN11-01` | Provider đang ở màn hình tạo/chỉnh sửa API | 1. Nhập URL `http://127.0.0.1:4000` hoặc `http://localhost:3000` vào ô Upstream Base URL.<br>2. Bấm "Tiếp tục" hoặc nộp duyệt.<br>3. Thử lại với IP private `http://192.168.1.1` và cloud metadata `http://169.254.169.254`. | URL nội bộ cấm | - Hệ thống từ chối ngay lập tức.<br>- Báo lỗi validation: `SSRF_DETECTED` (Upstream destination is not allowed) hoặc `DOMAIN_NOT_SUPPORTED` (Use an HTTP(S) base URL with a publicly delegated DNS hostname and no credentials).<br>- Không cho phép lưu vào cơ sở dữ liệu. | Chưa chạy | Desktop 1280x720<br>Critical<br>Chưa chạy (Sẵn sàng trên develop) |
| **[SEC-02]** | Chống SSRF: Chặn kỹ thuật DNS Rebinding và redirect sang IP nội bộ | EN-11<br>`AC-EN11-01` | Upstream URL có tên miền phân giải ra cả IP public và IP private | 1. Cấu hình domain thử nghiệm phân giải IP hỗn hợp qua SafeProxy.<br>2. Gửi request qua Gateway proxy.<br>3. Quan sát phản hồi kiểm tra DNS pinning. | Domain DNS rebinding | - SafeProxy phát hiện IP phân giải chứa IP nội bộ và từ chối kết nối.<br>- Trả về HTTP 403 `SSRF_DETECTED` ('Upstream destination is not allowed'). | Chưa chạy | Không áp dụng (API)<br>High<br>Chưa chạy (Sẵn sàng trên develop) |
| **[SEC-03]** | Chống lách Rate Limit / Quota bằng kỹ thuật tạo mới và xoay API Key | EN-11<br>`AC-EN11-02` | Consumer đã dùng hết 10 req/s rate limit hoặc quota tháng; yêu cầu tích hợp Backend PR #106 (`rateScope`) | 1. Tiêu thụ hết rate limit/quota với API Key 1.<br>2. Vào UI tạo tiếp API Key 2 cho cùng tài khoản và gói cước đó.<br>3. Gửi request ngay lập tức bằng API Key 2. | Key 1 (cũ), Key 2 (mới) | - Request bằng Key 2 vẫn bị chặn chính xác với HTTP 429 (`RATE_LIMITED` hoặc `QUOTA_EXHAUSTED`).<br>- Không lách được bộ đếm Redis do rateScope gắn theo consumerId và apiId. | Chưa chạy | Không áp dụng (API)<br>Critical<br>Chưa chạy (Phụ thuộc: BE PR #106) |
| **[SEC-04]** | Bảo mật API Key: Mã hóa một chiều trong DB và chỉ hiện đầy đủ 1 lần | EN-11<br>`AC-EN11-03` | Consumer tạo mới API Key trên giao diện | 1. Tạo API Key mới tại `http://localhost:5173/dashboard/api-keys`.<br>2. Kiểm tra modal hiển thị chuỗi key đầy đủ.<br>3. Tải lại trang (F5).<br>4. Chạy SQL đọc kiểm chứng:<br>`SELECT key_hash, key_prefix FROM api_keys ORDER BY id DESC LIMIT 1;` | Tạo key mới | - Modal hiện key đầy đủ đúng 1 lần duy nhất kèm nút Copy.<br>- Tải lại trang chỉ còn thấy dạng che `ak_live_XXXX...`.<br>- DB tuyệt đối không chứa chuỗi thô, chỉ lưu `key_hash`. | Chưa chạy | Desktop 1280x720<br>Critical<br>Chưa chạy (Sẵn sàng trên develop) |
| **[SEC-05]** | Khử dữ liệu nhạy cảm trong hệ thống Log và Gateway Headers (`[REDACTED]`) | EN-11<br>`AC-EN11-04` | Yêu cầu tích hợp Backend PR #106. Gửi request qua Gateway có chứa headers nhạy cảm | 1. Gửi request qua Gateway kèm header `Authorization: Bearer my-secret-token` và `Cookie: session=secret123`.<br>2. Kiểm tra log stdout của hệ thống và response headers:<br>- Gateway chỉ cho phép các header whitelist (`accept`, `accept-language`, `content-type`).<br>- Các header nhạy cảm Authorization, Cookie, X-API-Key đều bị loại bỏ hoặc che mờ thành `[REDACTED]`.<br>3. Kiểm tra bảng `usage_logs`: chỉ lưu metrics, không lưu trữ thông tin nhạy cảm. | Header nhạy cảm | - Header nhạy cảm không bị chuyển tiếp sang Upstream và không rò rỉ ra log container.<br>- Token và password không xuất hiện dạng rõ trong bất kỳ log nào. | Chưa chạy | Không áp dụng (API)<br>Critical<br>Chưa chạy (Phụ thuộc: BE PR #106) |
| **[SEC-06]** | Ma trận phân quyền 3 vai trò (RBAC): Chống leo thang đặc quyền | EN-11<br>`AC-EN11-05` | Đăng nhập tài khoản Consumer thường (`user@example.com`) | 1. Dùng token của Consumer truy cập route Admin: `GET /api/admin/users`.<br>2. Thử gọi API sửa trạng thái API của Provider: `PATCH /api/provider/apis/3`.<br>3. Quan sát HTTP status. | Token Consumer | - Toàn bộ các request trái quyền nhận HTTP 403 Forbidden.<br>- Error code: `FORBIDDEN`.<br>- Không truy cập hay can thiệp được dữ liệu quản trị. | Chưa chạy | Không áp dụng (API)<br>Critical<br>Chưa chạy (Sẵn sàng trên develop) |
| **[SEC-07]** | Quản lý phiên làm việc: Thu hồi Refresh Token khi đổi mật khẩu / đăng xuất | EN-11<br>`AC-EN11-05` | Người dùng đang có phiên đăng nhập trên trình duyệt | 1. Thực hiện đổi mật khẩu tại trang Profile hoặc gọi `POST /api/auth/change-password`.<br>2. Dùng Refresh Token cũ gửi yêu cầu `POST /api/auth/refresh`.<br>3. Quan sát kết quả. | Refresh Token cũ | - Yêu cầu làm mới token bằng token cũ bị từ chối với HTTP 401 Unauthorized.<br>- Bắt buộc đăng nhập lại với mật khẩu mới. | Chưa chạy | Không áp dụng (API)<br>High<br>Chưa chạy (Sẵn sàng trên develop) |

---

### PHẦN 4: EN-12 — PERFORMANCE BENCHMARK & GATEWAY LOAD TESTING (2 TEST CASES)

| ID | Test Case Description | User Story / AC Ref | Preconditions | Test Steps (Thao tác chi tiết & Câu truy vấn kiểm chứng) | Test Data (Dữ liệu vào) | Expected Output (Kỳ vọng) | Actual Output | Viewport / Mức ưu tiên / Trạng thái |
|:---|:---|:---|:---|:---|:---|:---|:---|:---:|
| **[PERF-01]** | Đo tải Gateway đa luồng (c=1, 10, 25) và kiểm chứng SLA P95 Overhead phân tầng | EN-12<br>`AC-EN12-01` | Môi trường test có PostgreSQL và Redis sạch. Đã build backend mới nhất | 1. Chạy lệnh đo tải: `npm run loadtest:gateway`.<br>2. Quan sát kết quả in ra cho 3 mức đồng thời: `c=1`, `c=10`, `c=25`.<br>3. Kiểm tra mã thoát (exit code) và tổng số bản ghi outbox/usage logs.<br>4. **Tham chiếu:** Ngưỡng phân tầng chuẩn hóa tại `docs/known-limitations.md`. | Concurrency: 1, 10, 25<br>20 warm-up, 200 samples/tier | - SLA Chuẩn hóa phân tầng (`docs/known-limitations.md` & PR #112): P95 Overhead $< 30\text{ms}$ khi đồng thời $c = 1$; P95 $< 60\text{ms}$ khi $c > 1$.<br>- Tỷ lệ lỗi: 0/620 (0%).<br>- Lưu đủ 620/620 bản ghi `usage_logs`.<br>- Tại $c = 25$: Vượt ngưỡng trên local do `GatewayEntitlement.reserve` khóa dòng `FOR UPDATE OF s` để đảm bảo tính nhất quán quota tuyệt đối (đánh đổi kiến trúc có chủ đích). | Chưa chạy | Không áp dụng (CLI)<br>Critical<br>Đã ghi nhận hạn chế kiến trúc |
| **[PERF-02]** | Kiểm chứng tính nguyên tử Quota (Atomic Lua) dưới tải 100 requests tranh chấp 50 lượt | EN-12<br>`AC-EN12-02` | Subscription còn đúng 50 lượt quota khả dụng trong chu kỳ | 1. Dùng công cụ test tải hoặc k6 gửi đồng thời 100 requests cùng lúc qua Gateway.<br>2. Đếm số lượng phản hồi HTTP 200 và HTTP 429.<br>3. Kiểm tra bộ đếm Redis và chạy SQL kiểm chứng:<br>`SELECT quota_used, quota_limit FROM subscriptions WHERE id = :id;` | 100 requests / 0ms<br>Quota còn: 50 | - Đúng 50 requests thành công HTTP 200 OK.<br>- Đúng 50 requests còn lại nhận HTTP 429 `QUOTA_EXCEEDED`.<br>- Counter Redis và PostgreSQL ghi nhận chính xác 50 lượt, không bị âm. | Chưa chạy | Không áp dụng (API)<br>Critical<br>Chưa chạy (Sẵn sàng trên develop) |

---

### PHẦN 5: EN-13 — PRODUCTION DEPLOYMENT, BACKUP/RESTORE & ROLLBACK (3 TEST CASES)

| ID | Test Case Description | User Story / AC Ref | Preconditions | Test Steps (Thao tác chi tiết & Câu truy vấn kiểm chứng) | Test Data (Dữ liệu vào) | Expected Output (Kỳ vọng) | Actual Output | Viewport / Mức ưu tiên / Trạng thái |
|:---|:---|:---|:---|:---|:---|:---|:---|:---:|
| **[OPS-01]** | Kiểm chứng Production Preflight từ chối cấu hình secret yếu hoặc không an toàn | EN-13<br>`AC-EN13-01` | Đang ở thư mục gốc repo | 1. Thiết lập file `.env.test` với secret ngắn $< 32$ ký tự.<br>2. Chạy `node --env-file=.env.test scripts/production-preflight.mjs`.<br>3. Thử trường hợp tái sử dụng chung 1 chuỗi secret.<br>4. Thử trường hợp URL không dùng `https://`. | Cấu hình vi phạm | - Script từ chối ngay lập tức với exit code 1.<br>- In thông báo lỗi chỉ rõ nguyên nhân (secret ngắn, trùng secret, thiếu HTTPS). | Chưa chạy | Không áp dụng (CLI)<br>High<br>Chưa chạy (Sẵn sàng trên develop) |
| **[OPS-02]** | Kiểm chứng tự động toàn trình Sao lưu & Phục hồi Database (`verify:backup`) | EN-13<br>`AC-EN13-02` | Đã cấu hình PostgreSQL chạy cục bộ | 1. Chạy lệnh: `npm run verify:backup`.<br>2. Quan sát quá trình: khởi tạo DB nguồn `api_market_src`, chạy migration + seed, xuất `pg_dump -Fc`, phục hồi sang `api_market_restored` bằng `pg_restore`.<br>3. Kiểm tra bảng đối soát số lượng bản ghi in ra ở cuối. | `npm run verify:backup` | - Toàn bộ các bảng cốt lõi (kể cả bảng Sprint 5) khớp số lượng 100% (độ lệch 0 bản ghi).<br>- Script thoát với mã lỗi 0. | Chưa chạy | Không áp dụng (CLI)<br>Critical<br>Chưa chạy (Phụ thuộc: DB PR #104) |
| **[OPS-03]** | Kế hoạch Rollback tức thì phiên bản ứng dụng và Database (< 60 giây) | EN-13<br>`AC-EN13-03` | Có bản sao lưu pre-deploy dump và file lưu tag `.last_image_tag` | 1. Giả lập phiên bản mới gặp sự cố.<br>2. Thực hiện lệnh rollback container theo `docs/06-production-rollback-runbook.md` mục 4.<br>3. Thực hiện phục hồi database từ bản dump pre-deploy.<br>4. Kiểm tra sức khỏe `curl http://localhost:3000/health`. | File `.last_image_tag`<br>`pre-deploy.dump` | - Container ứng dụng quay về phiên bản cũ trong thời gian $< 60$ giây.<br>- Endpoint `/health` trả lời HTTP 200 OK.<br>- Dữ liệu toàn vẹn, không phát sinh lỗi 500. | Chưa chạy | Không áp dụng (CLI)<br>High<br>Chưa chạy (Sẵn sàng trên develop) |

---

### PHẦN 6: EN-14 — UX, RESPONSIVE & ACCESSIBILITY (5 TEST CASES)

| ID | Test Case Description | User Story / AC Ref | Preconditions | Test Steps (Thao tác chi tiết & Câu truy vấn kiểm chứng) | Test Data (Dữ liệu vào) | Expected Output (Kỳ vọng) | Actual Output | Viewport / Mức ưu tiên / Trạng thái |
|:---|:---|:---|:---|:---|:---|:---|:---|:---:|
| **[UX-01]** | Kiểm tra bố cục hiển thị đa độ phân giải trên Desktop ($1280 \times 720\text{ px}$) | EN-14<br>`AC-EN14-01` | Khởi động Frontend trên cổng 5173 | 1. Mở Playwright với viewport $1280 \times 720$.<br>2. Duyệt qua lần lượt: Marketplace, Detail, Playground, Checkout, Usage, Cost Guard, Provider Analytics, Admin.<br>3. Chụp ảnh màn hình kiểm tra bố cục. | Viewport: `1280x720` | - Bố cục cân đối, thanh điều hướng mở đầy đủ.<br>- Không tràn ngang, không vỡ layout.<br>- Bảng dữ liệu hiển thị rõ ràng. | Chưa chạy | Desktop 1280x720<br>High<br>Chưa chạy (Phụ thuộc: FE #23) |
| **[UX-02]** | Kiểm tra bố cục hiển thị đa độ phân giải trên Tablet ($768 \times 1024\text{ px}$) | EN-14<br>`AC-EN14-01` | Khởi động Frontend trên cổng 5173 | 1. Mở Playwright với viewport $768 \times 1024$.<br>2. Duyệt qua các màn hình tương tự như [UX-01].<br>3. Kiểm tra thanh menu mobile/drawer và các card thống kê. | Viewport: `768x1024` | - Menu chuyển sang dạng hamburger/drawer an toàn.<br>- Bảng dữ liệu có cuộn ngang nội bộ hoặc chuyển dạng thẻ card.<br>- Không tràn vỡ khung hình chính. | Chưa chạy | Tablet 768x1024<br>High<br>Chưa chạy (Phụ thuộc: FE #23) |
| **[UX-03]** | **Tiêu chuẩn Console sạch tuyệt đối (Rule A1):** Zero Console Errors | EN-14<br>`AC-EN14-02` | Playwright lắng nghe sự kiện `console` và `pageerror` | 1. Điều hướng qua tất cả các trang chính và thực hiện thao tác form.<br>2. Thu thập toàn bộ log console trong suốt phiên chạy.<br>3. Kiểm tra danh sách lỗi đỏ. | Toàn bộ luồng UI | - Mảng `consoleErrors` và `pageErrors` rỗng hoàn toàn (0 lỗi).<br>- Không có lỗi React warning (missing key, invalid prop). | Chưa chạy | Cả 2 viewports<br>Critical<br>Chưa chạy (Phụ thuộc: FE #23) |
| **[UX-04]** | Đầy đủ trạng thái Loading, Empty và Error States trên các màn hình mới | EN-14<br>`AC-EN14-03` | Tài khoản mới tạo chưa có dữ liệu giao dịch / API | 1. Vào màn hình Cost Guard của tài khoản chưa thiết lập ngân sách $\to$ Kiểm tra Empty State.<br>2. Ngắt kết nối backend API $\to$ Kiểm tra Error State và nút "Thử lại".<br>3. Làm mới trang với mạng chậm $\to$ Kiểm tra Skeleton Loading. | Mạng bình thường / Mạng lỗi | - Empty state hiển thị minh họa và nút kêu gọi hành động.<br>- Error state báo lỗi rõ ràng kèm nút thử lại, không crash trắng trang.<br>- Loading state hiển thị hiệu ứng skeleton mượt mà. | Chưa chạy | Cả 2 viewports<br>Medium<br>Chưa chạy (Phụ thuộc: FE #23) |
| **[UX-05]** | Kiểm tra khả năng tương tác: Phần tử không bị che đè (Tiêu chí A2–A3) | EN-14<br>`AC-EN14-04` | Các màn hình có modal hoặc menu dropdown (Tạo API, Checkout, Thẩm định) | 1. Mở modal tạo API Key hoặc modal xác nhận đình chỉ.<br>2. Kiểm tra nút bấm chính và nút đóng modal.<br>3. Thao tác nhấp chuột và gõ phím. | Chuột và bàn phím thật | - Nút bấm và ô nhập nằm trọn trong viewport nhìn thấy được.<br>- Không bị overlay hay phần tử khác đè lên (không cần dùng `{ force: true }`).<br>- Người dùng bình thường thao tác trơn tru bằng chuột/phím. | Chưa chạy | Cả 2 viewports<br>High<br>Chưa chạy (Phụ thuộc: FE #23) |

---

### PHẦN 7: EN-15 — REGRESSION TESTING & QUALITY GATE (4 TEST CASES)

| ID | Test Case Description | User Story / AC Ref | Preconditions | Test Steps (Thao tác chi tiết & Câu truy vấn kiểm chứng) | Test Data (Dữ liệu vào) | Expected Output (Kỳ vọng) | Actual Output | Viewport / Mức ưu tiên / Trạng thái |
|:---|:---|:---|:---|:---|:---|:---|:---|:---:|
| **[REG-01]** | Chạy toàn bộ Backend Integration Tests và xác thực Swagger OpenAPI | EN-15<br>`AC-EN15-01` | Môi trường test có DB PostgreSQL và Redis | 1. Chạy lệnh: `npm test`.<br>2. Quan sát kết quả chạy qua tất cả các test suites (Auth, Provider, Gateway, Usage, Cost Guard, Analytics). | `npm test` | - Tối thiểu 180/180 tests PASS (100%).<br>- 0 failed, 0 skipped.<br>- OpenAPI Swagger hợp lệ không có lỗi cú pháp. | Chưa chạy | Không áp dụng (CLI)<br>Critical<br>Chờ tích hợp develop |
| **[REG-02]** | Chạy toàn bộ Frontend Vitest Unit & Component Suite | EN-15<br>`AC-EN15-01` | Đang ở thư mục `frontend/` | 1. Chạy lệnh: `cd frontend && npm test && npm run build`.<br>2. Quan sát kết quả thực thi Vitest và build Vite. | `vitest run` | - Tối thiểu 550/550 tests PASS (100%).<br>- Build hoàn tất thành công 0 lỗi TypeScript (`tsc -b`). | Chưa chạy | Không áp dụng (CLI)<br>Critical<br>Chờ tích hợp develop |
| **[UAT-01]** | Nghiệm thu người dùng (UAT) trọn vẹn theo 3 vai trò (Consumer, Provider, Admin) | EN-15<br>`AC-EN15-02` | Môi trường Staging đóng băng sạch có seed demo | 1. Chạy lần lượt các kịch bản người dùng thật theo kịch bản demo.<br>2. Đánh giá tính hữu ích, tính dễ dùng và độ chính xác của số liệu.<br>3. Ghi nhận phản hồi và phát hiện lỗi nếu có. | 3 vai trò người dùng | - Toàn bộ các thao tác nghiệp vụ cốt lõi hoàn thành trôi chảy.<br>- Không có lỗi chặn luồng nghiệp vụ.<br>- Người dùng nghiệm thu ký biên bản đồng ý. | Chưa chạy | Cả 2 viewports<br>Critical<br>Chờ Staging đóng băng |
| **[UAT-02]** | Kiểm tra điều kiện đóng Sprint và Ký duyệt Release Candidate (RC Sign-off) | EN-15<br>`AC-EN15-03` | Toàn bộ các hạng mục công việc Sprint 5 đã hoàn tất | 1. Quét danh sách issue bug: xác nhận 0 bug Critical/High còn mở.<br>2. Kiểm tra hoàn thành Test Report Sprint 5 và User Guide 3 vai trò.<br>3. Tech Lead và QA Lead cùng rà soát và đánh dấu Checklist RC tại `docs/07-sprint5-demo-and-rc-checklist.md`. | Toàn bộ bằng chứng | - Đủ điều kiện ký duyệt Release Candidate (GO).<br>- Toàn bộ 7 mục trong checklist RC được đánh dấu hoàn thành. | Chưa chạy | Không áp dụng<br>Critical<br>Tổng hợp cuối sprint |

---

### PHẦN 8: EN-16 — KỊCH BẢN DEMO END-TO-END 4 PHÂN CẢNH (4 TEST CASES)

| ID | Test Case Description | User Story / AC Ref | Preconditions | Test Steps (Thao tác chi tiết & Câu truy vấn kiểm chứng) | Test Data (Dữ liệu vào) | Expected Output (Kỳ vọng) | Actual Output | Viewport / Mức ưu tiên / Trạng thái |
|:---|:---|:---|:---|:---|:---|:---|:---|:---:|
| **[DEMO-01]** | **Demo Phân cảnh 1:** Provider đăng ký, KYC, upload OpenAPI và nộp duyệt | EN-16<br>`AC-EN16-01` | Hạ tầng đã khởi động (`docker compose up`). Tài khoản Provider sẵn sàng | 1. Đăng nhập Provider nộp hồ sơ KYC.<br>2. Admin duyệt KYC sang `Verified`.<br>3. Provider tạo API mới, upload `valid-weather-openapi3.json`.<br>4. Cấu hình gói Free & Pro, xác minh DNS TXT $\to$ Bấm Submit for Review. | Kịch bản Phân cảnh 1 trong `docs/07` | - API tự động sinh 7 khối tài liệu OpenAPI.<br>- Chuyển trạng thái sang `Submitted`.<br>- Thời gian hoàn thành $\le 3$ phút, không thao tác sửa tay. | Chưa chạy | Desktop 1280x720<br>High<br>Chưa chạy (Sẵn sàng trên develop) |
| **[DEMO-02]** | **Demo Phân cảnh 2:** Admin thẩm định Dossier, xuất bản API và giám sát Audit Log | EN-16<br>`AC-EN16-02` | Có API ở trạng thái `Submitted` từ Phân cảnh 1 | 1. Admin vào API Reviews, kiểm tra Dossier (cảnh báo bảo mật, DNS).<br>2. Chuyển trạng thái: `Submitted` $\to$ `Under Review` $\to$ `Approved` $\to$ `Published`.<br>3. Mở Audit Logs xác nhận vết ghi. | Kịch bản Phân cảnh 2 trong `docs/07` | - API xuất hiện công khai trên Marketplace.<br>- Mọi bước chuyển trạng thái được ghi vết bất biến trong Audit Log.<br>- Thời gian $\le 2$ phút. | Chưa chạy | Desktop 1280x720<br>High<br>Chưa chạy (Sẵn sàng trên develop) |
| **[DEMO-03]** | **Demo Phân cảnh 3:** Consumer khám phá Marketplace, thử Sandbox, mua gói & gọi Gateway | EN-16<br>`AC-EN16-03` | API Weather đã Published. Tài khoản Consumer sẵn sàng | 1. Guest xem Marketplace, tìm API.<br>2. Đăng nhập Consumer, gọi thử Playground quá 5 lượt $\to$ Chặn 403 `SANDBOX_EXHAUSTED`.<br>3. Mua gói Pro qua Sandbox Checkout $\to$ Kích hoạt `Active`.<br>4. Tạo key, lấy mã Code Gen, gửi request qua Gateway cổng 3000. | Kịch bản Phân cảnh 3 trong `docs/07` | - Chặn đúng sau 5 lượt sandbox.<br>- Thanh toán sandbox kích hoạt gói ngay.<br>- Gọi Gateway nhận HTTP 200, có header `x-gateway-overhead-ms`, quota trừ nguyên tử.<br>- Thời gian $\le 5$ phút. | Chưa chạy | Desktop 1280x720<br>Critical<br>Chưa chạy (Phụ thuộc: PR #105) |
| **[DEMO-04]** | **Demo Phân cảnh 4:** Usage, Cost Guard, Provider Analytics & Đình chỉ vi phạm | EN-16<br>`AC-EN16-04` | Consumer vừa gọi Gateway ở Phân cảnh 3 | 1. Consumer vào Usage đối soát số liệu, xem Cost Guard cảnh báo ngân sách.<br>2. Provider vào Analytics xem biểu đồ lưu lượng, top endpoint, doanh thu.<br>3. Admin xem Operations Health tại `/admin/gateway`, thực hiện Suspend API $\to$ Gateway chặn tức thì $\to$ Restore lại. | Kịch bản Phân cảnh 4 trong `docs/07` | - Đối soát số liệu Usage và Cost Guard khớp 100%.<br>- Analytics hiển thị biểu đồ và doanh thu chính xác.<br>- Gateway chặn và mở tức thì khi Admin Suspend/Restore.<br>- Thời gian $\le 3$ phút. | Chưa chạy | Desktop 1280x720<br>Critical<br>Chưa chạy (Phụ thuộc: FE #23) |

---

### PHẦN 9: TỒN ĐỌNG SPRINT 4 — THEO DÕI SỬA LỖI (1 TEST CASE)

| ID | Test Case Description | User Story / AC Ref | Preconditions | Test Steps (Thao tác chi tiết & Câu truy vấn kiểm chứng) | Test Data (Dữ liệu vào) | Expected Output (Kỳ vọng) | Actual Output | Viewport / Mức ưu tiên / Trạng thái |
|:---|:---|:---|:---|:---|:---|:---|:---|:---:|
| **[OVH-06-RETEST]** | Kiểm tra phản hồi Gateway đính kèm header `X-Gateway-Overhead-Ms` (Khắc phục BUG-S4-01 / DEV-S4-02) | US-23<br>`AC-S4-17`<br>(Refs #105) | Nhánh sửa lỗi PR #105 (`codex/sprint4-qa-closeout`) được merge vào `develop` | 1. Gửi request hợp lệ qua Gateway bằng cURL hoặc Playwright:<br>`fetch('http://localhost:3000/api/gateway/3/v1/products', { headers: { 'x-api-key': 'ak_live_...' } })`.<br>2. Kiểm tra toàn bộ response headers trả về client.<br>3. So sánh giá trị header với số ghi vào cột `gateway_overhead_ms` trong `usage_logs`. | Request hợp lệ qua Gateway | - Response có header `x-gateway-overhead-ms`.<br>- Giá trị header là số nguyên/thực dương (ms) khớp chính xác với số ghi trong database.<br>- Khắc phục hoàn toàn `BUG-S4-01`. | Chưa chạy | Không áp dụng (API)<br>High<br>Chưa chạy (Phụ thuộc: PR #105) |

---

## 3. HƯỚNG DẪN THỰC THI KIỂM THỬ ĐỐI SOÁT 4 TẦNG (FOUR-TIER RECONCILIATION)

### 3.1. Đối soát Cost Guard (TC-CST-04)
1. **Tầng 1 — UI:** Đọc số liệu hiển thị trên màn hình `http://localhost:5173/dashboard/cost-guard` (Ngân sách tháng, Số tiền đã dùng, Phần trăm đã dùng, Trạng thái cảnh báo).
2. **Tầng 2 — API JSON:** Gọi `GET /api/consumer/cost-guard` và trích xuất:
   ```json
   {
     "monthlyBudget": "30.00",
     "currency": "USD",
     "hardCutoff": true,
     "estimatedSpend": "0.60",
     "spentPercent": 2.0,
     "reachedThresholds": []
   }
   ```
3. **Tầng 3 — PostgreSQL:** Chạy câu lệnh SQL CHỈ ĐỌC (Read-Only) để đối soát chi phí:
   ```sql
   -- Đọc cấu hình ngân sách
   SELECT consumer_id, currency, monthly_budget, hard_cutoff
   FROM cost_guard_budgets
   WHERE consumer_id = 2;

   -- Tính tổng chi phí từ usage_logs đã flush trong tháng UTC
   SELECT cost_currency, SUM(estimated_cost) AS total_logged_cost
   FROM usage_logs
   WHERE consumer_id = 2
     AND occurred_at >= date_trunc('month', CURRENT_TIMESTAMP)
   GROUP BY cost_currency;

   -- Tính tổng chi phí từ usage_outbox đang chờ flush
   SELECT cost_currency, SUM(estimated_cost) AS total_outbox_cost
   FROM usage_outbox
   WHERE consumer_id = 2
     AND occurred_at >= date_trunc('month', CURRENT_TIMESTAMP)
   GROUP BY cost_currency;
   ```
4. **Tầng 4 — Redis:** Kiểm tra counter quota liên quan:
   ```bash
   redis-cli GET quota:<subscription_id>:<current_month_period>
   ```
$\to$ **Điều kiện PASS:** `estimatedSpend` trên API = $(\text{total\_logged\_cost} + \text{total\_outbox\_cost})$ (khớp 100% đối soát số liệu 2 tầng API $\leftrightarrow$ PostgreSQL DB). Tầng UI kiểm tra hiển thị trang và chụp ảnh màn hình trong E2E runner; tầng Redis không lưu hạn mức ngân sách Cost Guard.

---

### 3.2. Đối soát Provider Analytics (TC-ANL-07)
1. **Tầng 1 — UI:** Đọc số lượng `Total Requests`, `Error Rate`, `Revenue` trên `http://localhost:5173/provider/analytics`.
2. **Tầng 2 — API JSON:** Gọi `GET /api/provider/analytics/overview?apiId=3&from=2026-11-01&to=2026-11-10`.
3. **Tầng 3 — PostgreSQL:** Chạy câu lệnh SQL CHỈ ĐỌC kiểm chứng:
   ```sql
   -- Đếm tổng request từ bảng aggregate
   SELECT SUM(request_count) AS total_agg_requests,
          SUM(error_count) AS total_agg_errors
   FROM provider_daily_aggregates
   WHERE api_id = 3 AND usage_date BETWEEN '2026-11-01' AND '2026-11-10';

   -- Đếm thực tế từ bảng log chi tiết
   SELECT COUNT(*) AS total_real_requests,
          COUNT(*) FILTER (WHERE status_code >= 400) AS total_real_errors
   FROM usage_logs
   WHERE api_id = 3 AND occurred_at::date BETWEEN '2026-11-01' AND '2026-11-10';

   -- Đọc doanh thu phân tách theo loại tiền
   SELECT currency, SUM(amount) AS total_revenue
   FROM provider_revenue_daily_aggregates
   WHERE api_id = 3 AND usage_date BETWEEN '2026-11-01' AND '2026-11-10'
   GROUP BY currency;
   ```
$\to$ **Điều kiện PASS:** Khớp 100% đối soát số liệu 2 tầng giữa tổng hợp trong PostgreSQL DB và API JSON. Tầng UI kiểm tra hiển thị trang và chụp ảnh màn hình trong E2E runner; tầng Redis không lưu aggregate Provider Analytics.
