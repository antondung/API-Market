# Tổng hợp Mẫu Báo cáo Lưu vết GitHub — Pha 1

> **Tài liệu QA Lead:** Trần Hà Thảo Vân (`@vuonghathaovan-gif` - Issue #10)
> **Nhánh:** `test/10-provider-compliance` (nền `develop` commit `db2e3fd`)
> **Thời điểm:** 16/10/2026

---

## Mẫu 1 — Comment Báo cáo Tiến độ Pha 1 trên Issue #10 (Kiểm thử Provider Compliance)

```markdown
### 📋 [QA Report - Pha 1] Hoàn thành Kiểm thử Hồi quy Sprint 1 & Giải quyết 9 TC tồn đọng

**Kính gửi:** Tech Lead @antondung và toàn đội ngũ dự án API-Market.
**Người báo cáo:** Trần Hà Thảo Vân (@vuonghathaovan-gif) — QA / Tester / Documentation Lead
**Phạm vi:** Kiểm thử hồi quy toàn diện Sprint 1, giải quyết 9 Test Case tồn đọng và xác nhận đóng BUG-01 (Issue #46).

---

#### 1. Thông tin Môi trường & Nhánh Kiểm thử
- **Nhánh thực thi:** `test/10-provider-compliance` (phát triển trên nền nhánh `develop` commit `db2e3fd` tích hợp PR #48 và PR #49).
- **Môi trường:** Docker Compose full stack (`api-market-backend`, `api-market-frontend`, `api-market-postgres`, `api-market-redis`).
- **Công cụ kiểm thử:** Node.js/Axios Test Runner (`qa-scripts/retest-runner.js`), Playwright Headless Browser (`test-tc-03-08-fresh.cjs`), SQL trực tiếp trong container PostgreSQL.

---

#### 2. Kết quả Thực thi Tổng hợp (33/33 Test Cases)

| Phân hệ / User Story | Tổng số TC | Pass trơn | Pass ⚠️ | Fail | Blocked | Not Run | Tỷ lệ Pass |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **US-01 — Đăng ký** | 8 | 7 | 1 (R1) | 0 | 0 | 0 | **100%** |
| **US-02 — Đăng nhập / Quản lý Token** | 8 | 7 | 1 (R2) | 0 | 0 | 0 | **100%** |
| **US-03 — Phân quyền truy cập (RBAC)** | 8 | 8 | 0 | 0 | 0 | 0 | **100%** |
| **US-04 — Admin Quản lý Người dùng** | 4 | 4 | 0 | 0 | 0 | 0 | **100%** |
| **Non-functional / Bảo mật** | 5 | 5 | 0 | 0 | 0 | 0 | **100%** |
| **TỔNG CỘNG** | **33** | **31** | **2** | **0** | **0** | **0** | **100%** |

*Ghi chú 2 ca Pass ⚠️:*
- **TC-01-02 (R1):** Giao diện Frontend kích hoạt `required` ngăn submit Họ tên rỗng (khớp AC US-01 #4); Backend schema cho phép optional.
- **TC-02-08 (R2):** Token lưu trữ tại `sessionStorage`, state lưu ở `localStorage` (chấp nhận cho Sprint 1, tạo nhiệm vụ nâng cấp HttpOnly Cookie ở Sprint sau).

---

#### 3. Chi tiết Giải quyết 9 Test Case Tồn đọng

1. **4 Test Case US-04 (Admin Quản lý Người dùng — Trước đó Blocked):**
   - `TC-04-01`: Gọi `GET /api/admin/users?page=1&pageSize=2` trả `200 OK` có danh sách phân trang; RBAC chặn đúng `403` với Consumer/Provider, `401` khi không token -> **Pass**.
   - `TC-04-02`: Gọi `GET /api/admin/users?search=user@example.com` trả `200 OK` tìm thấy chính xác user; RBAC chặn đúng -> **Pass**.
   - `TC-04-03`: Gọi `PATCH /api/admin/users/:id/active` với `{ active: false }` trả `200 OK`; Ngay sau đó user bị khóa login trả `401`, gọi `/api/auth/me` trả `401`, refresh trả `401` -> **Pass**.
   - `TC-04-04`: Gọi `PATCH /api/admin/users/:id/active` với `{ active: true }` trả `200 OK`; User đăng nhập lại thành công (`200 OK`), token cũ trước đó vẫn bị thu hồi (`401`) -> **Pass**.
2. **5 Test Case Giao diện (UI — Trước đó Not Run / Fail):**
   - `TC-01-02`: Kiểm tra form đăng ký không nhập name -> **Pass ⚠️** (R1).
   - `TC-02-08`: Kiểm tra DevTools Application Storage -> **Pass ⚠️** (R2).
   - `TC-03-06`: Consumer truy cập trực tiếp URL `/admin` -> Route Guard chặn và chuyển sang `/403` Forbidden -> **Pass**.
   - `TC-03-07`: Consumer truy cập trực tiếp URL `/provider` -> Route Guard chặn và chuyển sang `/403` Forbidden -> **Pass**.
   - `TC-03-08`: Người dùng chưa đăng nhập truy cập `/dashboard`, `/admin`, `/provider` -> Chặn toàn bộ và chuyển hướng chuẩn xác về `/401` Unauthorized (**ĐÓNG BUG-01**) -> **Pass**.

---

#### 4. Tài liệu Đã Cập nhật & Bằng chứng Lưu vết
- `docs/test/Sprint1_TestReport.md`: Cập nhật chuyển trạng thái sang **GO CHO SPRINT 1**, đóng BUG-01.
- `docs/test/Sprint1_TestCases.md`: Cập nhật dòng `TC-03-08` thành Pass.
- `docs/test/Sprint2_Regression_Sprint1_Log.md`: Biên bản nghiệm thu hồi quy Sprint 1 độc lập.
- `qa-scripts/screenshots/tc-03-08-fresh-*.png`: Ảnh chụp bằng chứng kiểm thử Playwright.
```

---

## Mẫu 2 — Comment Xác nhận Retest & Đóng Bug trên Issue #46 và PR #48

```markdown
### ✅ [QA Retest Verified] Xác nhận khắc phục triệt để BUG-01 (TC-03-08) — Đóng Issue #46

**Kính gửi:** @antondung, @leduwn (Hải Dương FE)
**Người thẩm định:** Trần Hà Thảo Vân (@vuonghathaovan-gif) — QA / Tester / Documentation Lead
**Căn cứ quy trình:** Mục 4.1 "Vòng đời bug" & Mục 4.2 "Mức độ bug" trong `docs/03-quy-trinh-lam-viec.md` và `docs/05-quy-trinh-quan-ly-bug.md`.

---

#### 1. Thông tin Bug & Bản Sửa lỗi
- **Bug ID:** BUG-01 ([Issue #46](https://github.com/antondung/API-Market/issues/46))
- **Tiêu đề:** `[US-03][High] Route Protected trên FE không chuyển hướng về trang đăng nhập khi chưa đăng nhập (TC-03-08)`
- **Commit sửa lỗi:** `57f799d` thuộc Pull Request #48 vào nhánh `develop`.
- **Nội dung sửa:** Cập nhật `AuthContext` và `ProtectedRoute` trên Frontend, loại bỏ gán cứng phiên giả lập mặc định `currentUser = INITIAL_USERS[0]`, kiểm tra chính xác trạng thái session thực tế trước khi cho phép render không gian làm việc.

---

#### 2. Kết quả Retest Thực tế (16/10/2026)
QA đã tiến hành chạy kịch bản kiểm thử độc lập tự động bằng Playwright trên môi trường trình duyệt Chromium Headless sạch (không cookie, không storage):

```json
[
  {
    "requestedUrl": "http://localhost:5173/dashboard",
    "destinationUrl": "http://localhost:5173/401",
    "hasConsumerContent": false,
    "verdict": "Pass"
  },
  {
    "requestedUrl": "http://localhost:5173/admin",
    "destinationUrl": "http://localhost:5173/401",
    "hasConsumerContent": false,
    "verdict": "Pass"
  },
  {
    "requestedUrl": "http://localhost:5173/provider",
    "destinationUrl": "http://localhost:5173/401",
    "hasConsumerContent": false,
    "verdict": "Pass"
  }
]
```

- **Kết quả:** Cả 3 route protected (`/dashboard`, `/admin`, `/provider`) đều ngăn chặn hoàn toàn việc hiển thị nội dung bên trong và lập tức chuyển hướng người dùng chưa xác thực về trang `/401` Unauthorized (Yêu cầu xác thực / Đăng nhập).
- **Bằng chứng ảnh chụp màn hình:**
  - `qa-scripts/screenshots/tc-03-08-fresh-dashboard.png`
  - `qa-scripts/screenshots/tc-03-08-fresh-admin.png`
  - `qa-scripts/screenshots/tc-03-08-fresh-provider.png`

---

#### 3. Kết luận
- Yêu cầu kiểm thử chấp nhận (AC US-03 #2) đã được thỏa mãn 100%.
- Bug **BUG-01** chính thức được chuyển sang trạng thái **CLOSED & VERIFIED**.
- Issue #46 đủ điều kiện đóng.
```

---

## Mẫu 3 — Nội dung Mở Pull Request từ `test/10-provider-compliance` về `develop`

```markdown
## [QA] Hoàn thành Kiểm thử Hồi quy Sprint 1, Giải quyết 9 TC tồn đọng & Đóng BUG-01

### 1. Thông tin chung
- **Nhánh nguồn:** `test/10-provider-compliance`
- **Nhánh đích:** `develop`
- **Người tạo:** Trần Hà Thảo Vân (@vuonghathaovan-gif) — QA Lead
- **Mã Backlog / Issues liên quan:** Refs #5, #10, #46, PR #48

---

### 2. Tóm tắt Thay đổi & Kết quả Đạt được
PR này đóng gói toàn bộ kết quả kiểm thử hồi quy Sprint 1 và tài liệu nghiệm thu kỹ thuật:
1. **Kiểm thử hồi quy 33/33 TC Sprint 1:** Tỷ lệ đạt 100% (31 Pass trơn, 2 Pass có lưu ý R1/R2, 0 Fail, 0 Blocked).
2. **Giải quyết dứt điểm 4 TC Blocked của US-04 (Admin User Management):** TC-04-01 đến TC-04-04 đều đạt Pass khi kiểm thử với API Backend thật trên PostgreSQL.
3. **Giải quyết dứt điểm 5 TC Giao diện (UI):** TC-01-02, TC-02-08, TC-03-06, TC-03-07, TC-03-08 đều đạt Pass.
4. **Xác nhận đóng BUG-01 (Issue #46):** Kiểm chứng tự động bằng Playwright xác nhận Route Guard FE chuyển hướng chính xác người dùng chưa xác thực về `/401`.
5. **Nghiệm thu Sprint 1:** Chuyển trạng thái Sprint 1 trong Test Report sang **GO**, sẵn sàng 100% làm cơ sở vững chắc cho Sprint 2.

---

### 3. Danh sách File Bàn giao
- `docs/test/Sprint1_TestReport.md`: Cập nhật kết quả retest, đóng BUG-01, phê duyệt Go decision.
- `docs/test/Sprint1_TestCases.md`: Cập nhật kết quả chi tiết từng Test Case (TC-03-08 chuyển Pass).
- `docs/test/Sprint2_Regression_Sprint1_Log.md`: Biên bản nghiệm thu hồi quy Sprint 1 độc lập.
- `qa-scripts/retest-runner.js`: Runner kiểm thử tự động toàn bộ 28 TC API.
- `qa-scripts/screenshots/tc-03-08-fresh-*.png`: Ảnh chụp bằng chứng kết quả kiểm thử.
- `qa-scripts/GITHUB_REPORT_PHA1.md`: Tài liệu lưu vết mẫu báo cáo GitHub.

---

### 4. Checklist Definition of Done (DoD)
- [x] Đúng nhánh quy ước (`test/10-provider-compliance` -> `develop`).
- [x] Commit message tuân thủ chuẩn Conventional Commits.
- [x] Đã chạy `scripts/kiem-tra-kho-ma-nguon.ps1` — Không có conflict markers, không có trailing whitespace.
- [x] 100% Test Case Sprint 1 đã thực thi và đạt chuẩn (33/33).
- [x] Không còn bug mức Critical / High đang mở.
- [x] Đầy đủ bằng chứng log và ảnh chụp màn hình kiểm chứng.
```
