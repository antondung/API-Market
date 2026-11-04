# API HUB — SPRINT 4 FRONTEND OPEN BLOCKERS & STATUS ADVISORIES
## Quản Lý Rủi Ro Tích Hợp · Điểm Chặn Kiến Trúc · Khuyến Nghị Phối Hợp

- **Tác giả:** Nguyễn Tấn Dũng (Frontend Tech Lead)
- **Ngày lập:** 2026-11-05
- **Nhánh:** `feature/18-sprint4-frontend-billing`
- **Mục tiêu:** Báo cáo chi tiết các điểm nghẽn kỹ thuật bên ngoài phạm vi Frontend cần sự phối hợp giữa Backend, Database và DevOps trước khi sáp nhập vào `develop`.

---

## 1. Danh Sách Các Điểm Chặn Kiến Trúc (Blockers)

### 1.1 BLOCKER-01: Lệch đơn vị đo lường Rate Limit (RPS vs RPM)
- **Mức độ nghiêm trọng:** P1 (Kiến trúc & Trải nghiệm Gateway)
- **Bản chất kỹ thuật:**
  - Migration cơ sở dữ liệu `010_billing_snapshot.sql` ghi nhận `rate_limit_per_minute = p.rate_limit`.
  - Bộ đo lường Redis Gateway (`backend/src/redis-meter.ts`) tính toán số lượt gọi trên cửa sổ lịch 1 phút (`Math.floor(Date.now() / 60000)`).
  - Trước đây, một số tài liệu thiết kế và giao diện ghi nhãn `RPS` (Requests Per Second). Nếu người dùng hiểu cấu hình là "5 req/sec" nhưng Gateway chỉ cho phép "5 req/phút", hệ thống sẽ bị bóp nghẽn gấp 60 lần thực tế.
- **Hành động từ Frontend:**
  - Đã rà soát và chuyển đổi 100% nhãn hiển thị tại `PricingManagementPage.tsx`, `CheckoutPage.tsx`, `MySubscriptionsPage.tsx`, `UsageQuotaPage.tsx`, `ApiDetailPage.tsx`, `PricingPage.tsx`, `TrySandboxPage.tsx`, `DocumentationViewer.tsx`, `AppContext.tsx`, và các tệp từ điển `vi.json` sang đơn vị **`req/phút` (RPM)**.
- **Khuyến nghị cho Backend / DevOps:**
  - Cập nhật văn bản kỹ thuật OpenAPI và tài liệu Gateway sang chuẩn RPM để thống nhất toàn diện toàn hệ thống.

---

### 1.2 BLOCKER-02: PR #91 Database Schema Gặp Lỗi CI
- **Mức độ nghiêm trọng:** P1 (Cơ sở dữ liệu)
- **Tình trạng:** PR #91 (`origin/feature/19-sprint4-database`) đang gặp lỗi CI do fixture kiểm thử chèn trực tiếp API trạng thái `Published` mà không thông qua bước chuyển đổi trạng thái hợp lệ, vi phạm trigger `trg_validate_api_status_transition`.
- **Đánh giá ảnh hưởng:**
  - Không ảnh hưởng trực tiếp đến mã nguồn nội bộ Frontend (Frontend chạy trên mock contract xác thực và đạt 509/509 tests).
  - Ngăn cản việc triển khai môi trường staging tích hợp trực tiếp cơ sở dữ liệu thực.
- **Khuyến nghị:**
  - Đội ngũ Database (Danh) cần cập nhật lại fixture chèn trạng thái API hợp lệ để CI của PR #91 chuyển xanh.

---

### 1.3 BLOCKER-03: Nhánh Backend PR #92 Chưa Sáp Nhập vào `develop`
- **Mức độ nghiêm trọng:** P2 (Tiến độ Triển khai Chung)
- **Tình trạng:** PR #92 (`origin/codex/sprint4-backend`) chưa merge vào nhánh `develop`.
- **Ranh giới trung thực kỹ thuật:**
  - Frontend xác nhận trạng thái: **`FRONTEND_FEATURE_COMPLETE`** (Hoàn thiện 100% mã nguồn, giao diện, state machine và kiểm thử đơn vị/tích hợp phía máy khách).
  - Frontend **TUYỆT ĐỐI KHÔNG TUYÊN BỐ** `FULL_STACK_INTEGRATION_COMPLETE` khi chưa có môi trường staging thực tế kết nối giữa Frontend, Backend PR #92 và Database PR #91.
  - Pull Request #96 ([antondung/API-Market#96](https://github.com/antondung/API-Market/pull/96)) được giữ nghiêm ngặt ở trạng thái **DRAFT**.

---

## 2. Kế Hoạch Chuyển Tiếp Sau Khi Các Blocker Được Giải Quyết

1. Chờ PR #91 (Database) sửa fixture và merge vào `develop`.
2. Chờ PR #92 (Backend) merge vào `develop`.
3. Kích hoạt môi trường Staging.
4. Chạy kiểm thử End-to-End toàn trình (E2E Integration Run) giữa Frontend, Backend và Gateway thực tế.
5. Chuyển Pull Request #96 từ **DRAFT** sang **READY FOR REVIEW** để các bên cùng nghiệm thu và sáp nhập vào `develop`.
