# Kịch bản Demo End-to-End & Checklist Release Candidate — Sprint 5 (EN-15, EN-16)

> **Dự án:** API Marketplace Platform
> **Điều phối:** Nguyễn Tấn Dũng (`@antondung` — Issue #21) & Trần Hà Thảo Vân (`@vuonghathaovan-gif` — Issue #25)
> **Thời lượng dự kiến:** 12 – 15 phút (4 phân cảnh xuyên suốt 3 vai trò: Provider, Admin, Consumer)

---

## PHẦN 1 — CHUẨN BỊ TRƯỚC GIỜ DEMO (PRE-DEMO SETUP)

1. Khởi động toàn bộ hạ tầng và 3 dịch vụ API demo:
   ```bash
   docker compose --env-file .env.docker --profile frontend --profile demo up --build -d
   docker compose --env-file .env.docker run --rm migrate --seed
   ```
2. Kiểm tra nhanh các cổng dịch vụ:
   - Frontend UI: `http://localhost:5173`
   - Backend API & Swagger: `http://localhost:3000/docs/`
   - Health check: `http://localhost:3000/health`

---

## PHẦN 2 — KỊCH BẢN DEMO 4 PHÂN CẢNH (CHẠY TRỌN VẸN KHÔNG SỬA TAY)

### Phân cảnh 1: Provider đăng ký, xác minh KYC, nhập OpenAPI và nộp duyệt (3 phút)
1. Đăng nhập tài khoản **Provider** (hoặc đăng ký mới) $\to$ vào **Provider Verification** nộp hồ sơ doanh nghiệp.
2. Đăng nhập **Admin** $\to$ vào **Provider Verifications** duyệt hồ sơ sang trạng thái `Verified`.
3. Quay lại **Provider** $\to$ mở **Create API Wizard**:
   - Tạo API mới, upload file đặc tả OpenAPI 3.0 (`valid-weather-openapi3.json`), xem hệ thống tự động sinh tài liệu 7 khối.
   - Cấu hình gói cước **Free** (0 USD) và **Pro** (trả phí), khai báo pháp lý/dữ liệu cá nhân, xác minh tên miền DNS TXT $\to$ bấm **Submit for Review** (`Submitted`).

### Phân cảnh 2: Admin thẩm định Dossier, xuất bản API và giám sát Audit Log (2 phút)
1. Trên giao diện **Admin** $\to$ mở **API Reviews**, kiểm tra Dossier (cảnh báo dữ liệu cá nhân, trạng thái DNS).
2. Chuyển trạng thái tuần tự: `Submitted` $\to$ `Under Review` $\to$ `Approved` $\to$ `Published`.
3. Mở **Audit Logs** xác nhận mọi bước chuyển trạng thái đều được ghi nhận bất biến trong cùng transaction.

### Phân cảnh 3: Consumer khám phá Marketplace, thử Playground, đăng ký gói & gọi Gateway (5 phút)
1. Không cần đăng nhập, vào **Marketplace** tìm kiếm từ khóa `weather`, lọc theo danh mục/giá, mở **API Detail** xem tài liệu OpenAPI công khai và bảng giá.
2. Đăng nhập **Consumer** $\to$ vào **Try Sandbox / Playground**:
   - Gọi thử endpoint hợp lệ, quan sát status code, response body và độ trễ.
   - Thử gọi quá 5 lượt sandbox để thấy thông báo chặn `403 SANDBOX_EXHAUSTED` kèm gợi ý đăng ký gói.
3. Vào **Pricing / Checkout**:
   - Đăng ký gói **Pro** qua cổng **Payment Sandbox** (xác nhận webhook HMAC hợp lệ, kích hoạt `Active`).
4. Vào **My API Keys**:
   - Tạo khóa `ak_live_...` (chỉ hiển thị đầy đủ đúng 1 lần), sao chép mã tích hợp từ **Code Generator** (cURL / Fetch / Python).
   - Gọi thật qua `/api/gateway/:apiId/...` kèm header `x-api-key`, kiểm tra header phản hồi `x-gateway-overhead-ms` và bộ đếm quota trừ nguyên tử.

### Phân cảnh 4: Usage Dashboard, Cost Guard, Provider Analytics & Kiểm duyệt Vi phạm (3 phút)
1. Trên **Consumer Workspace**:
   - Mở **Usage & Quota** và **Request History** đối soát số lượt gọi vừa thực hiện (query nhạy cảm đã được che mờ `[REDACTED]`).
   - Mở **Cost Guard** xem hạn mức chi tiêu tháng và các mốc cảnh báo 50% / 80% / 100%.
2. Trên **Provider Workspace**:
   - Mở **Provider Dashboard & Analytics** xem tổng số request, tỷ lệ lỗi, số thuê bao đang hoạt động và doanh thu đã thanh toán.
3. Trên **Admin Workspace**:
   - Xem **Subscription Monitoring & Operations Health** (trạng thái PostgreSQL, Redis, Gateway, Worker).
   - Thực hiện xử lý một báo cáo vi phạm (**Suspend** API $\to$ Gateway chặn tức thì `401/403` $\to$ **Restore** API trở lại sàn).

---

## PHẦN 3 — CHECKLIST XÁC NHẬN RELEASE CANDIDATE (EN-15)

- [x] Toàn bộ migration `001` $\to$ `017` (gồm 015 analytics aggregates, 016 demo seeds, 017 cost guard) chạy sạch từ DB trống và chạy lặp an toàn (idempotent).
- [x] `npm run lint` / `tsc --noEmit` (Backend) và `npx tsc -b` (Frontend) đạt 0 lỗi.
- [x] Bộ test tự động Backend + PostgreSQL + Redis đạt 100% (183/183 pass trên nhánh gộp).
- [x] Bộ unit/component test Frontend (Vitest) đạt 100% (578/578 pass trên 49 tệp).
- [ ] Kịch bản tải đồng thời Gateway (`npm run loadtest:gateway`) FAIL một phần trên máy QA: $c=1$ P95 11ms ($< 30$ms, PASS); $c=10$ (98ms) và $c=25$ (162ms) vượt ngưỡng 60ms; mức $c=25$ được Tech Lead chấp nhận có điều kiện theo DEV-S5-03; mức $c=10$ chờ Tech Lead xác nhận.
- [x] Kiểm chứng sao lưu & phục hồi (`verify:backup` qua PostgreSQL container) khôi phục khớp 100% dữ liệu các bảng cốt lõi và bảng Sprint 5.
- [x] Toàn bộ 6 lỗ hổng bảo mật dependency đã được vá sạch (`0 vulnerabilities` qua `npm audit`).
- [ ] Xử lý dứt điểm các sai lệch kỹ thuật: `DEV-S5-01` MỞ LẠI — Đề nghị Tech Lead xác nhận (3 container mock-services crash do thiếu ENTRYPOINT); `DEV-S5-03` FAIL một phần (ở $c > 1$); `DEV-S5-05` chờ diễn tập staging.
- [x] Kho mã nguồn vượt qua kiểm tra nền tảng `scripts/kiem-tra-kho-ma-nguon.ps1` (0 lỗi).
- [x] User Guide cho 3 vai trò (Consumer / Provider / Admin) hoàn tất tại [`docs/user-guide/Sprint5_UserGuide.md`](docs/user-guide/Sprint5_UserGuide.md).

### KÝ DUYỆT RELEASE CANDIDATE SPRINT 5 (RC SIGN-OFF)

| Vai trò | Người phụ trách | Quyết định | Thời điểm ký | Ghi chú nghiệm thu |
|:---|:---|:---:|:---:|:---|
| **Tech Lead / DevOps** | Nguyễn Tấn Dũng (`@antondung` — Issue #21) | *(Để trống)* | *(Chờ Tech Lead ký)* | Chờ Tech Lead (@antondung) kiểm tra hiện trạng và ký duyệt chính thức. |
| **QA Lead / Documentation** | Trần Hà Thảo Vân (`@vuonghathaovan-gif` — Issue #25) | **CHƯA ĐỦ ĐIỀU KIỆN KÝ GO** | 11/11/2026 | Đạt 100% kiểm thử unit/integration (183/183 BE, 578/578 FE) và 26/42 TC PASS qua kiểm thử tự động, runner API và E2E UI. Ghi nhận 1 TC FAIL một phần (TC-PERF-01 ở c>1) và 15 TC phụ thuộc hạ tầng live/staging (mock-services DEV-S5-01 REOPENED, CD rollback DEV-S5-05) đang KHÔNG THỰC HIỆN ĐƯỢC, chưa đủ điều kiện ký GO. |
