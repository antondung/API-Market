# Sprint 1 — Test Plan & Test Cases (US-01 → US-04)

Refs: #5 · Người thực hiện: Trần Hà Thảo Vân (QA/Tester/Documentation) · Sprint 1: 05/10–11/10 · Deadline nội bộ: 10/10

## 1. Test Plan

### 1.1 Phạm vi
**Trong phạm vi:** đăng ký, đăng nhập, đăng xuất, refresh token, phân quyền 3 role (USER / PROVIDER / ADMIN) ở backend (`/api/access/*`) và route guard ở frontend. Admin quản lý user (US-04) ở mức kiểm tra khả dụng.
**Ngoài phạm vi:** Redis, thanh toán, marketplace/API listing, kiểm thử hiệu năng/tải, các hàng Role Matrix chưa áp dụng ở Sprint 1.

### 1.2 Môi trường
- Backend: `npm ci` → `npm run setup` → `npm run db:migrate` → `npm run db:seed` → `npm run dev`
- Công cụ: Swagger `/docs/` hoặc Postman (import `/openapi.json`)
- Frontend: nhánh `feature/EN-14-frontend-release-polish` (chưa merge `develop`)
- Tài khoản seed: `admin@example.com`, `user@example.com`, `provider@example.com` (mật khẩu trong `migrations/002_seed_auth_data.sql`)
- CSDL: PostgreSQL

### 1.3 Entry criteria
- Backend chạy được, migrate + seed thành công.
- Swagger truy cập được.
- Frontend checkout được (nhánh EN-14 hoặc đã merge).

### 1.4 Exit criteria
- 100% TC ưu tiên High đã chạy.
- Không còn bug Critical/High mở.
- Các TC Blocked có lý do và ETA.
- Test Report đã comment vào Issue #5.

### 1.5 Rủi ro
| # | Rủi ro | Mức | Xử lý |
|---|---|---|---|
| R1 | Chưa có API list/search/khóa/mở khóa user (US-04) | High | Đánh dấu Blocked, hỏi ETA Tấn Dũng; test khóa bằng SQL |
| R2 | FE chưa merge vào `develop` | Medium | Test trên nhánh EN-14 |
| R3 | Refresh token trả trong body JSON, FE lưu `sessionStorage` (AC US-02 #5 ghi HttpOnly Cookie) | Medium | Tạo issue để nhóm quyết định: sửa AC hoặc sửa code |
| R4 | `name` tùy chọn ở BE nhưng AC US-01 #4 ghi bắt buộc | Medium | Tạo issue chốt với nhóm |
| R5 | Severity S1–S4 lệch bảng Critical/High/Medium/Low | Low | Thống nhất dùng Critical/High/Medium/Low |

### 1.6 Lịch
| Ngày | Việc |
|---|---|
| 09/10 | Dọn nhánh, mở PR vào `develop`; dựng môi trường |
| 10/10 | Chạy test Auth/RBAC, báo bug, viết Test Report, comment Issue #5 |
| 11/10 | Hồi quy sau khi dev sửa bug; Sprint Review |

### 1.7 Bảng AC → TC
| AC | Test case |
|---|---|
| US-01 Đăng ký | TC-01-01 → TC-01-08 |
| US-02 Đăng nhập / token | TC-02-01 → TC-02-08 |
| US-03 Phân quyền | TC-03-01 → TC-03-08 |
| US-04 Admin quản lý user | TC-04-01 → TC-04-04 |
| Non-functional / bảo mật | TC-05-01 → TC-05-05 |

> Quy ước trạng thái: **Not Run / Pass / Fail / Blocked**. Cột *Kết quả thực tế*, *Status*, *Bug ID*, *Tester*, *Ngày* điền khi chạy.
> Endpoint auth (register/login/logout/refresh): lấy đúng đường dẫn từ Swagger `/docs/`; chỉ `GET /api/access/admin` đã xác nhận từ code.

---

## 2. Test Cases

### US-01 — Đăng ký

| ID | Ưu tiên | Tiền điều kiện | Dữ liệu test | Các bước | Kết quả mong đợi | Kết quả thực tế | Status | Bug ID | Tester | Ngày |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-01-01 | High | Email chưa tồn tại | `qa01@example.com` / mật khẩu 12 ký tự hợp lệ / name "QA One" | Gửi đăng ký với dữ liệu hợp lệ | Thành công (2xx); user mới role USER; FE điều hướng đúng | | Not Run | | | |
| TC-01-02 | Medium | Email chưa tồn tại | `qa02@example.com` / mật khẩu hợp lệ / **không có name** | Đăng ký không nhập name | Theo BE: thành công (name tùy chọn). Ghi nhận lệch với AC #4 (xem R4) | | Not Run | | | |
| TC-01-03 | High | `user@example.com` đã tồn tại | `user@example.com` | Đăng ký lại email đã có | 409; FE hiện "Email này đã được đăng ký." | | Not Run | | | |
| TC-01-04 | High | — | Mật khẩu 11, 12, 128, 129 ký tự | Đăng ký lần lượt từng độ dài | 11 ✗ (400/422), 12 ✓, 128 ✓, 129 ✗ | | Not Run | | | |
| TC-01-05 | High | — | Body có `role: "ADMIN"` | Đăng ký cố gán role Admin | Bị từ chối hoặc bỏ qua; user không thể có role ADMIN | | Not Run | | | |
| TC-01-06 | Medium | `user@example.com` đã tồn tại | `USER@Example.com` | Đăng ký email khác hoa/thường | Bị coi là trùng (409) | | Not Run | | | |
| TC-01-07 | Medium | `user@example.com` đã tồn tại | ` user@example.com ` (có khoảng trắng) | Đăng ký email có khoảng trắng đầu/cuối | Được trim và coi là trùng (409), hoặc bị từ chối định dạng | | Not Run | | | |
| TC-01-08 | Low | — | Email sai định dạng (`abc`, `a@`, `@b.com`); name 0 / 1 / 100 / 101 ký tự | Đăng ký từng trường hợp | Email sai → 400/422; name 1–100 ✓, 101 ✗ | | Not Run | | | |

### US-02 — Đăng nhập / token

| ID | Ưu tiên | Tiền điều kiện | Dữ liệu test | Các bước | Kết quả mong đợi | Kết quả thực tế | Status | Bug ID | Tester | Ngày |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-02-01 | High | Tài khoản seed | `user@example.com` + mật khẩu seed | Đăng nhập đúng | 200; có access + refresh token; FE vào trang theo role | | Not Run | | | |
| TC-02-02 | High | — | Email đúng, mật khẩu sai | Đăng nhập sai mật khẩu | 401; FE hiện "Thông tin đăng nhập không đúng hoặc phiên đã hết hạn." | | Not Run | | | |
| TC-02-03 | Medium | — | Email không tồn tại | Đăng nhập | 401, cùng thông điệp chung (không lộ email có tồn tại hay không) | | Not Run | | | |
| TC-02-04 | High | Đã đăng nhập, có access+refresh token | Token vừa nhận | Đăng xuất → dùng lại access token cũ và refresh token cũ | Cả hai trả 401 | | Not Run | | | |
| TC-02-05 | High | Đã đăng nhập | Refresh token hợp lệ | Gọi refresh | 200; cấp token mới | | Not Run | | | |
| TC-02-06 | High | Đã refresh 1 lần | Refresh token cũ (đã dùng) | Dùng lại refresh token cũ | 401 | | Not Run | | | |
| TC-02-07 | High | Tài khoản bị khóa (`UPDATE users SET is_active=false WHERE email='user@example.com'`) | Tài khoản bị khóa | Đăng nhập; dùng token cũ gọi API | Login 401 (chung); token cũ bị chặn | | Not Run | | | |
| TC-02-08 | Medium | Đã đăng nhập | — | Kiểm tra nơi lưu token ở FE (DevTools → Application) | Ghi nhận: token ở `sessionStorage`, không phải HttpOnly Cookie → báo rủi ro Medium (R3) | | Not Run | | | |

### US-03 — Phân quyền

Ma trận 3 role × 3 guard `/api/access/*` (lấy đủ 3 đường dẫn guard từ Swagger; `admin` đã xác nhận: USER → 403, không token → 401).

| ID | Ưu tiên | Tiền điều kiện | Dữ liệu test | Các bước | Kết quả mong đợi | Kết quả thực tế | Status | Bug ID | Tester | Ngày |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-03-01 | High | Token USER | Token `user@example.com` | Gọi lần lượt 3 guard | Chỉ guard của USER → 200; hai guard còn lại → 403 | | Not Run | | | |
| TC-03-02 | High | Token PROVIDER | Token `provider@example.com` | Gọi lần lượt 3 guard | Chỉ guard của PROVIDER → 200; còn lại → 403 | | Not Run | | | |
| TC-03-03 | High | Token ADMIN | Token `admin@example.com` | Gọi lần lượt 3 guard | Theo Role Matrix đã chốt (ghi rõ ADMIN truy cập được guard nào) | | Not Run | | | |
| TC-03-04 | High | Không token | — | `GET /api/access/admin` và 2 guard còn lại | 401 | | Not Run | | | |
| TC-03-05 | High | — | Token sai định dạng; token hết hạn | Gọi `GET /api/access/admin` | 401 | | Not Run | | | |
| TC-03-06 | High | Đăng nhập Consumer (USER) trên FE | URL `/admin/*` | Gõ trực tiếp URL | Bị chặn/chuyển hướng, không thấy nội dung admin | | Not Run | | | |
| TC-03-07 | High | Đăng nhập Consumer (USER) trên FE | URL `/provider/*` | Gõ trực tiếp URL | Bị chặn/chuyển hướng | | Not Run | | | |
| TC-03-08 | Medium | Chưa đăng nhập | URL `/admin/*`, `/provider/*` | Gõ trực tiếp URL | Chuyển về trang đăng nhập | | Not Run | | | |

### US-04 — Admin quản lý user (**Blocked**: chưa có API list/search/khóa/mở khóa ở nhánh nào, chỉ có trang `/admin/users` ở FE; chờ Tấn Dũng, hỏi ETA)

| ID | Ưu tiên | Tiền điều kiện | Dữ liệu test | Các bước | Kết quả mong đợi | Kết quả thực tế | Status | Bug ID | Tester | Ngày |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-04-01 | High | Đăng nhập ADMIN | — | Xem danh sách user | Hiện danh sách user | Chưa có API | Blocked | | | |
| TC-04-02 | Medium | Đăng nhập ADMIN | Từ khóa email | Tìm kiếm user | Kết quả khớp từ khóa | Chưa có API | Blocked | | | |
| TC-04-03 | High | Đăng nhập ADMIN | 1 user USER | Khóa user | User bị khóa; không đăng nhập được; token cũ bị chặn | Chưa có API (tạm kiểm tra bằng SQL ở TC-02-07) | Blocked | | | |
| TC-04-04 | High | User đang bị khóa | — | Mở khóa user | User đăng nhập lại được | Chưa có API | Blocked | | | |

### Non-functional / bảo mật

| ID | Ưu tiên | Tiền điều kiện | Dữ liệu test | Các bước | Kết quả mong đợi | Kết quả thực tế | Status | Bug ID | Tester | Ngày |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-05-01 | Medium | — | >30 request/phút vào cùng endpoint | Gửi liên tục | Quá ngưỡng → 429 | | Not Run | | | |
| TC-05-02 | Medium | — | JSON lỗi cú pháp | Gửi body JSON hỏng | 400, không lộ stack trace | | Not Run | | | |
| TC-05-03 | Medium | — | Body > 16kb | Gửi body quá lớn | Bị từ chối (413/400) | | Not Run | | | |
| TC-05-04 | High | Có quyền truy cập DB | — | `SELECT password FROM users` | Mật khẩu là hash, không phải plaintext | | Not Run | | | |
| TC-05-05 | High | Backend đang chạy | — | Đăng ký/đăng nhập rồi đọc log backend | Log không chứa mật khẩu, token, secret | | Not Run | | | |

---

## 3. Role Matrix — bảng ký duyệt Sprint 1

| Hạng mục | Trạng thái | Người duyệt | Ngày |
|---|---|---|---|
| Hàng 1–3 | Xác nhận áp dụng Sprint 1 | Trần Hà Thảo Vân | |
| Hàng 26 | Xác nhận áp dụng Sprint 1 | Trần Hà Thảo Vân | |
| 3 dòng đầu bảng chặn truy cập | Xác nhận áp dụng Sprint 1 | Trần Hà Thảo Vân | |
| Các hàng còn lại | Chưa áp dụng | — | — |

## 4. Bug template

```
Tiêu đề: [US-xx][Mức] Mô tả ngắn
Mức độ: Critical / High / Medium / Low
Môi trường: branch / commit, trình duyệt hoặc Postman
Các bước tái hiện:
1.
2.
Kết quả mong đợi:
Kết quả thực tế:
Bằng chứng: ảnh / response / log
TC liên quan: TC-xx-xx
Label: bug · Báo trong 24h · Refs: #5
```
