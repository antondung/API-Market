# API HUB — FRONTEND SPRINT 4 / ROUND FE-04.2 BLOCKERS REPORT
## Trạng thái Rào cản Tích hợp & Vấn đề Cần Giải quyết Liên Đội ngũ

- **Document Version:** 1.0.0
- **Date:** 2026-11-04
- **Branch:** `feature/18-sprint4-frontend-billing`
- **Author:** Frontend Tech Lead (Nguyễn Tấn Dũng)
- **Status:** `ACTIVE_TRACKING`

---

## 1. Tóm tắt Trạng thái Các Vấn đề Chặn (Blockers Summary)

| Blocker ID | Mức độ | Phạm vi ảnh hưởng | Trạng thái hiện tại | Giải pháp Frontend FE-04.2 | Trách nhiệm xử lý tiếp theo |
| :--- | :---: | :--- | :---: | :--- | :--- |
| **BLOCKER-01** | **P1 (High)** | Rate Limiting Enforcement (Gateway vs UI) | ✅ Đã khắc phục trên UI Frontend | Cập nhật toàn bộ nhãn hiển thị thành `req/phút` (RPM) | Backend Lead & Gateway Architect thống nhất schema |
| **BLOCKER-02** | **P1 (High)** | PR #91 CI Database Schema Test Failure | ⚠️ Đang chờ xử lý bên DB Branch | Không sửa chéo kho mã nguồn, chỉ chạy trên mock contract | Phụ trách Database (Danh) sửa fixture sang `Draft` |
| **BLOCKER-03** | **P2 (Medium)** | Phụ thuộc nhánh Backend PR #92 chưa merge | ⚠️ Đang chờ duyệt PR #92 | Pin SHA `2c8a873023e071a93097a3d32b17bffbc3e41585`, giữ PR #96 ở trạng thái Draft | Tech Lead / Reviewer duyệt PR #92 và merge vào `develop` |

---

## 2. Phân tích Chi tiết Từng Vấn đề Chặn

### BLOCKER-01: Lệch đơn vị Rate Limit (RPS vs RPM)
- **Hiện trạng kỹ thuật ban đầu:**
  - Database schema (`backend/migrations/010_billing_snapshot.sql`) lưu trữ cột `rate_limit_per_minute = p.rate_limit`.
  - Redis Meter Gateway (`backend/src/redis-meter.ts:16-47`) tạo khóa theo cửa sổ 1 phút: `${prefix}:rl:${apiKeyId}:${endpointId}:${minute}` với `minute = Math.floor(Date.now() / 60000)` và từ chối request khi số lần gọi trong phút vượt quá `rate_limit_per_minute`.
  - Tuy nhiên, giao diện Provider (`PricingManagementPage.tsx`) và Checkout trước đây hiển thị đơn vị là `RPS` (Requests Per Second) hoặc `req/giây`.
- **Hệ quả thực tế:**
  - Nếu Provider cấu hình 10 RPS cho một gói dịch vụ, người dùng kỳ vọng có thể gửi tối đa 10 request/giây (tương đương 600 request/phút). Nhưng trên thực tế, Gateway Redis Meter lập tức chặn khi người dùng đạt 10 request trong cả 1 phút (khắt khe hơn 60 lần).
- **Hành động đã thực hiện tại FE-04.2:**
  - Cập nhật toàn bộ các nhãn trong `PricingManagementPage.tsx`, `CheckoutPage.tsx`, `MySubscriptionsPage.tsx`, và `UsageQuotaPage.tsx` sang đơn vị rõ ràng: **`req/phút` (RPM - Requests Per Minute)**.
  - Giữ nguyên toàn bộ giá trị số học người dùng cấu hình, không tự ý nhân/chia 60 khi chưa có sự thống nhất liên phân hệ.
- **Khuyến nghị liên đội ngũ:**
  - Nhóm Backend và Gateway cần chính thức xác nhận việc giữ nguyên đơn vị RPM trong `api_plans.rate_limit` hay chuyển sang RPS ở tầng Gateway. Nếu chuyển sang RPS, Backend cần có migration cập nhật công thức tính của Redis Meter.

---

### BLOCKER-02: Lỗi CI Pipeline trên PR #91 (Database Schema)
- **Hiện trạng kỹ thuật:**
  - Pipeline GitHub Actions trên PR #91 (`origin/feature/19-sprint4-database`) thất bại tại bước kiểm thử schema integration do fixture chèn trực tiếp bản ghi API có trạng thái `Published`.
  - Trạng thái này bị PostgreSQL Trigger `trg_validate_api_status_transition` từ chối vì quy tắc nghiệp vụ bắt buộc API phải chuyển từ `Draft` -> `In_Review` -> `Published`.
  - Trong PR #92, đội ngũ Backend đã sửa fixture sang `Draft` nên CI của PR #92 thành công (Green). Tuy nhiên nhánh PR #91 vẫn chưa nhận được bản vá này.
- **Cam kết kỷ luật Frontend:**
  - Tuân thủ nghiêm ngặt nguyên tắc ranh giới trách nhiệm: Frontend **tuyệt đối không can thiệp, sửa đổi hay cherry-pick** vào nhánh Database PR #91.
  - Báo cáo rõ ràng trong tài liệu bàn giao để phụ trách Database (Danh) tự cập nhật nhánh của mình.

---

### BLOCKER-03: Phụ thuộc Nhánh Backend PR #92 Chưa Merge vào Develop
- **Hiện trạng kỹ thuật:**
  - PR #92 (`origin/codex/sprint4-backend`) triển khai toàn bộ các endpoint Billing, Subscription và Usage Analytics nhưng hiện vẫn đang ở trạng thái OPEN, chưa được merge vào nhánh chính `develop`.
- **Cam kết kỷ luật Frontend:**
  - Toàn bộ 493 tests của Frontend chạy trên nền tảng Mock Contract đã kiểm toán khớp 100% với commit `2c8a873023e071a93097a3d32b17bffbc3e41585`.
  - Frontend **tuyệt đối không tuyên bố hoàn thành E2E thực tế** khi chưa có môi trường staging kết nối cơ sở dữ liệu thật.
  - Giữ Pull Request #96 ở trạng thái **DRAFT** cho đến khi PR #91 và PR #92 được duyệt và merge hoàn tất vào `develop`.

---

## 3. Lộ trình Mở Khóa Tích hợp (Unblock Sequence)

```
[1. Sửa fixture PR #91 (DB Lead)] ──► [CI PR #91 Green] ──► [Merge PR #91 vào develop]
                                                                     │
[2. Thống nhất Blocker-01 (RPM vs RPS)] ─────────────────────────────┤
                                                                     ▼
                                                    [Merge PR #92 (Backend) vào develop]
                                                                     │
                                                                     ▼
                                                   [Deploy Backend lên Staging Environment]
                                                                     │
                                                                     ▼
                                                   [Chuyển PR #96 Frontend từ DRAFT sang Ready]
                                                                     │
                                                                     ▼
                                                   [Thực hiện E2E Integration Testing FE-04.4]
```
