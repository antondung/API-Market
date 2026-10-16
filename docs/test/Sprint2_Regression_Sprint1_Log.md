# Báo cáo Kiểm thử Hồi quy Sprint 1 (Sprint 1 Regression Log)

> **Dự án:** API Marketplace & Management
> **Người thực hiện:** Trần Hà Thảo Vân (`@vuonghathaovan-gif`) — QA Lead (Issue #10)
> **Ngày thực hiện:** 16/10/2026
> **Nhánh thực thi:** `develop` (commit `db2e3fd` tích hợp PR #48 và PR #49)
> **Môi trường:** Docker Compose (`api-market-backend`, `api-market-frontend`, `api-market-postgres`, `api-market-redis`)

---

## 1. Mục tiêu kiểm thử hồi quy

1. Kiểm tra toàn bộ 33 Test Case của Sprint 1 trên nhánh `develop` mới nhất sau khi merge các bản sửa lỗi và tính năng mới.
2. Giải quyết dứt điểm **9 Test Case tồn đọng**:
   - 5 ca kiểm thử giao diện từng ở trạng thái *Not Run* (`TC-01-02`, `TC-02-08`, `TC-03-06`, `TC-03-07`, `TC-03-08`).
   - 4 ca kiểm thử chức năng Admin Quản lý User từng bị *Blocked* (`TC-04-01`, `TC-04-02`, `TC-04-03`, `TC-04-04`).
3. Xác nhận nghiệm thu đóng lỗi nghiêm trọng **BUG-01 ([Issue #46](https://github.com/antondung/API-Market/issues/46))**: Bỏ qua xác thực ở Route Guard FE.
4. Đảm bảo toàn bộ tiêu chí Definition of Done (DoD) của Sprint 1 đạt chuẩn để làm bàn đạp cho Sprint 2.

---

## 2. Kết quả thực thi tổng hợp

| Phân hệ / User Story | Tổng số TC | Pass trơn | Pass ⚠️ | Fail | Blocked | Not Run | Tỷ lệ Pass |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **US-01 — Đăng ký** | 8 | 7 | 1 | 0 | 0 | 0 | 100% |
| **US-02 — Đăng nhập / Quản lý Token** | 8 | 7 | 1 | 0 | 0 | 0 | 100% |
| **US-03 — Phân quyền truy cập (RBAC)** | 8 | 8 | 0 | 0 | 0 | 0 | 100% |
| **US-04 — Admin Quản lý Người dùng** | 4 | 4 | 0 | 0 | 0 | 0 | 100% |
| **Non-functional / Bảo mật** | 5 | 5 | 0 | 0 | 0 | 0 | 100% |
| **TỔNG CỘNG** | **33** | **31** | **2** | **0** | **0** | **0** | **100%** |

- **Tổng số ca kiểm thử:** 33/33 TC (100% đã thực thi).
- **Tỷ lệ đạt chuẩn:** 33/33 TC (100%).
- **Số bug Critical / High còn mở:** **0**.

---

## 3. Bằng chứng giải quyết 9 Test Case tồn đọng

### 3.1. Nhóm 4 Test Case US-04 (Admin Quản lý Người dùng) — Trước đó Blocked

| Test Case | Thao tác thực hiện | Kết quả thực tế | Trạng thái |
|---|---|---|:---:|
| **TC-04-01** | `GET /api/admin/users?page=1&pageSize=2` bằng token ADMIN | Trả về `200 OK` kèm danh sách phân trang (2 users/trang); Gọi bằng token USER trả `403`; Gọi bằng PROVIDER trả `403`; Không token trả `401`. | **Pass** |
| **TC-04-02** | `GET /api/admin/users?search=user@example.com` bằng token ADMIN | Trả về `200 OK` tìm thấy chính xác user theo từ khóa email; RBAC chặn đúng các role khác. | **Pass** |
| **TC-04-03** | `PATCH /api/admin/users/:id/active` với `{ active: false }` bằng token ADMIN | Trả về `200 OK`; Ngay sau đó tài khoản bị khóa gọi login trả `401`, gọi `/api/auth/me` bằng token cũ trả `401`, gọi refresh token trả `401`. RBAC PATCH chặn USER (`403`), PROVIDER (`403`). | **Pass** |
| **TC-04-04** | `PATCH /api/admin/users/:id/active` với `{ active: true }` bằng token ADMIN | Trả về `200 OK`; Tài khoản đăng nhập lại thành công (`200 OK`); Toàn bộ phiên cũ bị thu hồi vĩnh viễn (token cũ trước đó vẫn trả `401`). | **Pass** |

---

### 3.2. Nhóm 5 Test Case Giao diện (UI) — Trước đó Not Run / Fail

| Test Case | Kịch bản kiểm thử | Kết quả thực tế & Bằng chứng | Trạng thái |
|---|---|---|:---:|
| **TC-01-02** | Đăng ký không nhập Họ tên trên giao diện | Form Frontend có thuộc tính `required` ngăn submit rỗng (khớp AC #4); Gọi API backend trực tiếp trả 201 (name tùy chọn). Đạt yêu cầu và ghi nhận theo Điểm lệch R1. | **Pass ⚠️** |
| **TC-02-08** | Kiểm tra vị trí lưu trữ Token trên Frontend | Token được lưu tại `sessionStorage` (`apihub_sprint1_auth`), state lưu ở `localStorage`. Ghi nhận rủi ro R2 để nâng cấp HttpOnly Cookie ở Sprint sau. | **Pass ⚠️** |
| **TC-03-06** | Đăng nhập Consumer (USER) gõ trực tiếp URL `/admin` | Route Guard trên Frontend chặn truy cập, không lộ thông tin Admin, tự động chuyển hướng sang trang `/403` Forbidden. | **Pass** |
| **TC-03-07** | Đăng nhập Consumer (USER) gõ trực tiếp URL `/provider` | Route Guard trên Frontend chặn truy cập, tự động chuyển hướng sang trang `/403` Forbidden. | **Pass** |
| **TC-03-08** | Người dùng chưa đăng nhập gõ trực tiếp `/dashboard`, `/admin`, `/provider` | **ĐÓNG BUG-01:** Route Guard phát hiện phiên chưa xác thực, tự động chuyển hướng toàn bộ về trang `/401` (Yêu cầu xác thực / Đăng nhập). Bằng chứng kiểm chứng tự động qua Playwright: `destinationUrl: http://localhost:5173/401`, không rò rỉ nội dung bên trong. | **Pass** |

---

## 4. Xác nhận đóng Bug BUG-01 ([Issue #46](https://github.com/antondung/API-Market/issues/46))

- **Mô tả bug cũ:** Khi người dùng chưa đăng nhập, mở trực tiếp các route được bảo vệ (`/dashboard`, `/admin`, `/provider`), giao diện tự gán phiên giả lập mặc định `currentUser = INITIAL_USERS[0]` dẫn đến vào thẳng trang quản trị mà không cần đăng nhập.
- **Bản sửa lỗi:** Commit `57f799d`, Pull Request `#48` vào nhánh `develop` (bởi Hải Dương).
- **Kết quả Retest ngày 16/10/2026:**
  - Script test Playwright độc lập: `c:\Users\Admin\AppData\Local\Temp\qa-playwright\test-tc-03-08-fresh.cjs`.
  - Thực thi:
    ```json
    [
      { "requestedUrl": "http://localhost:5173/dashboard", "destinationUrl": "http://localhost:5173/401", "hasConsumerContent": false },
      { "requestedUrl": "http://localhost:5173/admin", "destinationUrl": "http://localhost:5173/401", "hasConsumerContent": false },
      { "requestedUrl": "http://localhost:5173/provider", "destinationUrl": "http://localhost:5173/401", "hasConsumerContent": false }
    ]
    ```
  - Ảnh chụp màn hình bằng chứng: `qa-scripts/screenshots/tc-03-08-fresh-dashboard.png`, `tc-03-08-fresh-admin.png`, `tc-03-08-fresh-provider.png`.
- **Kết luận:** **CLOSED & VERIFIED**.

---

## 5. Kết luận nghiệm thu hồi quy

- Toàn bộ tính năng nền tảng của Sprint 1 (Xác thực, Phân quyền RBAC 3 vai trò, Quản lý tài khoản, Bảo mật token) hoàn toàn ổn định trên nhánh `develop`.
- Không có bất kỳ lỗi hồi quy nào phát sinh khi tích hợp mã nguồn mới của Sprint 2 (PR #49).
- **Sprint 1 chính thức đạt tiêu chuẩn GO** và hoàn thành 100% mục tiêu chất lượng.
