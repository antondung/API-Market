# Tổng hợp Mẫu Báo cáo Lưu vết GitHub — Pha 2

> **Tài liệu QA Lead:** Trần Hà Thảo Vân (`@vuonghathaovan-gif` — Issue #10)
> **Nhánh:** `test/10-provider-compliance`
> **Thời điểm:** 16/10/2026

---

## Mẫu 1 — Comment Báo cáo Hoàn thành Pha 2 trên Issue #10 (Sprint 2 QA Lead)

```markdown
### 📋 [QA Report - Pha 2] Hoàn thành Biên soạn Tiêu chí Chấp nhận (AC), Ma trận RBAC & Bộ Test Cases Sprint 2 (US-06 -> US-14)

**Kính gửi:** Tech Lead @antondung và toàn đội ngũ dự án API-Market.
**Người báo cáo:** Trần Hà Thảo Vân (@vuonghathaovan-gif) — QA / Tester / Documentation Lead
**Phạm vi hoàn thành:** Hoàn tất 100% tài liệu thiết kế kiểm thử cho toàn bộ 9 User Story cốt lõi của Sprint 2 (`US-06` -> `US-14`).

---

#### 1. Thống kê Quy mô Tài liệu Kiểm thử Đã Thiết lập

| Phân hệ / User Story | Mã Backlog | Số lượng AC | Số lượng Test Cases | Trọng tâm kiểm thử |
|---|:---:|:---:|:---:|---|
| **Provider KYC & Verification** | US-06 | 5 ACs | 5 TCs | 4 trạng thái xác minh, thông tin tổ chức, resubmit sau Rejected |
| **Admin Duyệt Provider** | US-07 | 5 ACs | 5 TCs | Hàng chờ Pending, Approve/Reject bắt buộc nhập lý do, chống duyệt lại 409 |
| **Pháp lý, Quyền riêng tư & Tên miền** | US-08 | 5 ACs | 7 TCs | Thỏa thuận Agreement, Data Classification, Personal Data, DNS TXT challenge |
| **Quản lý API, Endpoint & Version** | US-09 | 6 ACs | 8 TCs | CRUD Draft, chỉ Verified mới tạo, version binding, đóng băng khi Submitted |
| **Import OpenAPI & Docs 7 Khối** | US-10 | 4 ACs | 6 TCs | Import JSON/YAML <= 1MB, rollback nguyên tử, tài liệu 7 khối, chống NUL byte |
| **Cấu hình Gói giá Dịch vụ** | US-11 | 4 ACs | 5 TCs | Ràng buộc Free giá = 0, Quota/RateLimit >= 1, đơn vị tiền tệ, chống trùng tên |
| **Nộp duyệt API & Readiness Checklist** | US-12 | 4 ACs | 6 TCs | 5 điều kiện tiên quyết, chuyển Draft -> Submitted, đóng băng bản ghi, reopen |
| **Admin Duyệt & Xuất bản API** | US-13 | 4 ACs | 6 TCs | Dossier đầy đủ, cảnh báo dữ liệu cá nhân, máy trạng thái tuần tự, Publish sàn |
| **Quản lý Nhật ký Kiểm toán** | US-14 | 5 ACs | 5 TCs | Ghi log bất biến, truy vấn đa tiêu chí, phân trang, che mờ dữ liệu nhạy cảm |
| **State Machine & DB Trigger Integrity** | US-12, 13 | — | 4 TCs | Chặn nhảy cóc trạng thái, kiểm tra trigger `enforce_api_status_transition` |
| **Bảo mật & Phi chức năng (Security)** | EP11 | — | 6 TCs | Chống SSRF domain nội bộ, chống XSS Docs Viewer, kiểm tra RBAC 3 vai trò |
| **TỔNG CỘNG** | **Sprint 2** | **42 ACs** | **63 TCs** | **Độ phủ 100% 30 API Provider + 8 API Admin** |

---

#### 2. Độ phủ Kiến trúc & Kiểm soát Truy cập
- **Ma trận phân quyền RBAC:** Đã chuẩn hóa chi tiết 5 cột vai trò (`Guest 401`, `Consumer 403`, `Unverified Provider`, `Verified Provider`, `Admin`) áp dụng cho toàn bộ **30 endpoint Provider** và **8 endpoint Admin**.
- **Tính toàn vẹn Database:** Bao phủ toàn bộ các ràng buộc khóa ngoại, trigger kiểm soát trạng thái (`trg_apis_enforce_status_transition`), và bảng lưu vết lịch sử (`api_reviews`, `audit_logs`).
- **Bảo mật:** Tích hợp kiểm thử chống SSRF khi verify tên miền, chống XSS trong Documentation Viewer 7 mục, và quy chuẩn Sensitive Data Redaction.

---

#### 3. Danh sách Tệp Bàn giao trên Git
1. `docs/test/Sprint2_AcceptanceCriteria.md` — Tiêu chí chấp nhận chuẩn Given/When/Then & Ma trận RBAC chi tiết.
2. `docs/test/Sprint2_TestCases.md` — Danh mục 63 Test Cases kiểm thử toàn diện.
3. `qa-scripts/GITHUB_REPORT_PHA2.md` — Tổng hợp mẫu báo cáo lưu vết Pha 2.

*Trạng thái:* Sẵn sàng bước vào **Pha 3: Thực thi Kiểm thử Tự động & Xuất bản Báo cáo Test Report Sprint 2**.
```

---

## Mẫu 2 — Cập nhật Nội dung trên Pull Request #54

```markdown
### 📋 Cập nhật Tiến độ: Đã bổ sung Tài liệu Kiểm thử Toàn diện Sprint 2 (Pha 2)

- Đã bổ sung `docs/test/Sprint2_AcceptanceCriteria.md`: Định nghĩa 42 Tiêu chí chấp nhận (AC) chi tiết theo cấu trúc Given/When/Then, kèm Ma trận phân quyền RBAC cho 30 API Provider và 8 API Admin.
- Đã bổ sung `docs/test/Sprint2_TestCases.md`: Thiết kế 63 Test Cases chi tiết bao phủ chức năng, biên, máy trạng thái DB trigger và an toàn bảo mật (SSRF, XSS, Redaction).
- Đã kiểm tra qua script `scripts/kiem-tra-kho-ma-nguon.ps1` — 100% tệp đạt chuẩn nền tảng, không trailing whitespace.
```
