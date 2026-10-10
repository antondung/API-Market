# Sprint 1 — Test Report

Refs: #5 · Người thực hiện: Trần Hà Thảo Vân (QA/Tester/Documentation) · Sprint 1: 05/10–11/10 · Ngày báo cáo: 10/10/2026

## 1. Tổng quan

- **Môi trường BE:** Docker Compose — `api-market-backend` (commit `81cc803` trên nhánh `develop`), PostgreSQL `api-market-postgres`, DB `api_market_dev` tại `http://127.0.0.1:3000`
- **Môi trường FE:** Profile `frontend` Docker Compose (container `api-market-frontend`, commit `81cc803`, tại `http://localhost:5173`)
- **Công cụ:** Script tự động axios/Node.js (`qa-scripts/retest-runner.js`), Playwright headless browser (`%TEMP%\qa-playwright`), SQL trực tiếp trong container PostgreSQL
- **Phạm vi:** Toàn bộ 33 TC thuộc US-01 → US-04 và Non-functional/bảo mật (xem `Sprint1_TestCases.md`)

## 2. Kết quả thực thi

| Nhóm | Tổng | Pass trơn | Pass ⚠️ | Fail | Blocked | Not Run |
|---|---|---|---|---|---|---|
| US-01 Đăng ký | 8 | 7 | 1 | 0 | 0 | 0 |
| US-02 Đăng nhập / token | 8 | 7 | 1 | 0 | 0 | 0 |
| US-03 Phân quyền | 8 | 7 | 0 | 1 | 0 | 0 |
| US-04 Admin quản lý user | 4 | 4 | 0 | 0 | 0 | 0 |
| Non-functional / bảo mật | 5 | 5 | 0 | 0 | 0 | 0 |
| **Tổng** | **33** | **30** | **2** | **1** | **0** | **0** |

> **Phép cộng kiểm chứng:** 30 (Pass trơn) + 2 (Pass ⚠️) + 1 (Fail) = **33 TC** (Tỷ lệ thực thi: 33/33 = 100%; Tỷ lệ đạt chức năng/kỹ thuật: 32/33 = 96.97%).
> - **Pass ⚠️ (2 TC):** TC-01-02 (lệch R1 giữa FE required và BE optional), TC-02-08 (lệch R2 về lưu token ở `sessionStorage` thay vì HttpOnly Cookie).
> - **Fail (1 TC):** TC-03-08 (chưa đăng nhập mở route protected không chuyển về trang đăng nhập mà vào thẳng ứng dụng do mock session mặc định ở FE).
> - **Blocked / Not Run:** 0 TC.

## 3. Danh sách bug

| Bug ID | Tiêu đề | Mức độ | TC liên quan | Trạng thái | Người xử lý |
|---|---|---|---|---|---|
| BUG-01 | [US-03][High] Route Protected trên FE không chuyển hướng về trang đăng nhập khi chưa đăng nhập (TC-03-08) | High | TC-03-08 | New ([Issue #46](https://github.com/antondung/API-Market/issues/46)) | Hải Dương |

> **Phân loại mức độ nghiêm trọng (Severity):**
> Áp dụng đúng thuật ngữ và định nghĩa tại bảng Mục 2 của `docs/05-quy-trinh-quan-ly-bug.md`:
> Trích nguyên văn dòng áp dụng (dòng 33):
> `| **High** | Lỗi chức năng chính không hoạt động đúng AC, sai lệch quyền truy cập. | Consumer vào được trang Admin, không thể xóa API key. |`
> Căn cứ: Bug này vi phạm AC US-03 #2 ("Truy cập trái phép vào các route Protected (cả FE và BE) phải trả về lỗi 403 Forbidden" / chuyển hướng đăng nhập), gây sai lệch quyền truy cập nghiêm trọng khi người dùng chưa đăng nhập có thể truy cập thẳng các workspace được bảo vệ.

### Chi tiết Bug BUG-01 ([Issue #46](https://github.com/antondung/API-Market/issues/46) — Soạn thảo theo `docs/05-quy-trinh-quan-ly-bug.md`):
```markdown
## [BUG] Route Protected trên FE không chuyển hướng về trang đăng nhập khi chưa đăng nhập (TC-03-08)

Refs: #5 · Issue: #46 · Người báo cáo: Trần Hà Thảo Vân (QA / Tester / Documentation)
**Mã Backlog liên quan:** US-03

### 1. Mô tả lỗi
Khi người dùng chưa đăng nhập (mở trình duyệt ở profile mới hoàn toàn hoặc đã xóa storage), truy cập trực tiếp vào các route protected (/dashboard, /admin, /provider), giao diện không chuyển hướng về trang đăng nhập (/login hay /401) mà tự động mở thẳng vào không gian làm việc với quyền mặc định.

### 2. Các bước tái hiện (Steps to Reproduce)
1. Mở trình duyệt ẩn danh hoặc profile mới hoàn toàn (storage trống): truy cập http://localhost:5173/admin hoặc http://localhost:5173/dashboard.
2. Quan sát URL và nội dung hiển thị trên màn hình.

### 3. Kết quả mong đợi (Expected Result)
Hệ thống phải chặn truy cập và chuyển hướng về trang đăng nhập (/login hoặc /401 Unauthorized), không hiển thị nội dung bên trong của Dashboard hay Admin.

### 4. Kết quả thực tế (Actual Result)
- Mở /dashboard: vẫn ở lại /dashboard và hiển thị "API HUB NGƯỜI TIÊU DÙNG".
- Mở /admin: vẫn ở lại /admin và hiển thị "API HUB QUẢN TRỊ VIÊN".
- Nguyên nhân kỹ thuật: Trong `frontend/src/context/AuthContext.tsx`, `isAuthenticated: true` đang bị gán cứng và `currentUser` mặc định khởi tạo từ `INITIAL_USERS[0]` (có role ADMIN).

### 5. Thông tin bổ sung
- **Mức độ nghiêm trọng (Severity):** High — Định nghĩa theo `docs/05-quy-trinh-quan-ly-bug.md` dòng 33: "Lỗi chức năng chính không hoạt động đúng AC, sai lệch quyền truy cập."
- **Môi trường:** Chromium Headless / Chrome Desktop, Frontend profile Docker Compose (commit 81cc803)
- **Ảnh chụp bằng chứng:** `qa-scripts/screenshots/tc-03-08-fresh-admin.png`, `tc-03-08-fresh-dashboard.png`
```

## 4. Test case Blocked / Not Run

*Không còn test case nào bị Blocked hoặc Not Run.* Toàn bộ 4 TC của US-04 đã được kiểm thử thành công sau khi backend cập nhật commit `81cc803`; 5 TC giao diện đã được kiểm thử tự động bằng Playwright.

## 5. Điểm lệch cần nhóm quyết định

| # | Nội dung | Kết quả thực tế | Lựa chọn cần chốt |
|---|---|---|---|
| R1 | AC US-01 #4: họ tên hiển thị bắt buộc; FE đặt `required` trên input Full Name, nhưng BE để `name` tùy chọn (`name?: string`) | BE trả 201 khi không có `name`; FE chặn submit rỗng | Sửa AC (bỏ bắt buộc) hoặc sửa BE (bắt buộc name) hoặc sửa FE (bỏ required) |
| R2 | AC US-02 #5: refresh token qua HttpOnly Cookie; thực tế lưu `sessionStorage` (`apihub_sprint1_auth`), state lưu `localStorage`, cookie rỗng | Token nằm ở `sessionStorage`, chưa có HttpOnly Cookie | Giữ tạm cho Sprint 1, tạo issue nâng cấp bảo mật HttpOnly Cookie ở Sprint sau |
| R3 | **Role Matrix ADMIN:** ADMIN bị 403 ở guard consumer/provider API | Thực tế: ADMIN vào `/api/access/admin` (200), consumer=403, provider=403 | **Không phải bug — đúng thiết kế theo Role Matrix** (Trích dẫn `docs/02-role-va-phan-quyen.md` dòng 30-31: *"Admin không tham gia Marketplace với tư cách consumer — Admin chỉ quản trị. Role quyết định dashboard, menu, route và API. Sai quyền → 403"*). |
| R4 | **Rate limit:** 429 xuất hiện khi gửi dồn dập | Kiểm chứng độc lập (TC-05-01, đối chiếu `qa-scripts/log-tho-retest.txt`): req 1–30 trả 200, req 31–35 trả 429 | **Không phải bug — đúng thiết kế** (Ngưỡng 30 req/phút/IP tính chung cho toàn bộ endpoint `/api/auth/*` theo IP). |
| R5 | **Phân quyền ADMIN ở FE:** ADMIN vào được workspace consumer/provider ở FE, chờ nhóm xác nhận (sửa FE hay sửa Role Matrix) | ADMIN đăng nhập vào được cả `/dashboard` và `/provider` trên FE (xem ảnh `qa-scripts/screenshots/point3-admin-access-consumer-workspace.png` và `point3-admin-access-provider-workspace.png`) | Chờ nhóm xác nhận: siết chặt Route Guard FE chỉ cho đúng role, hay mở rộng Role Matrix cho phép Admin xem giao diện? |

### Đối chiếu trích dẫn nguyên văn cho R5:
1. Trích NGUYÊN VĂN từ `docs/02-role-va-phan-quyen.md` (dòng 30–31 và dòng 42):
   - Dòng 30: `4. **Admin không tham gia Marketplace** với tư cách consumer — Admin chỉ quản trị.`
   - Dòng 31: `5. **Role quyết định dashboard, menu, route và API.** Sai quyền → **403** (US-03).`
   - Dòng 42: `| 3 | Dashboard riêng theo vai trò | ✅ Consumer | ✅ Provider | ✅ Admin |`
2. Trích NGUYÊN VĂN từ `docs/test/Sprint1_AcceptanceCriteria.md` (dòng 24–25):
   - Dòng 24: `- **AC 1:** Người dùng chỉ có thể truy cập các Dashboard và chức năng tương ứng với vai trò của mình (theo Role Matrix ở Phần A).`
   - Dòng 25: `- **AC 2:** Truy cập trái phép vào các route Protected (cả FE và BE) phải trả về lỗi 403 Forbidden.`
3. Trích NGUYÊN VĂN từ `frontend/src/App.tsx` (dòng 123 và dòng 145):
   - Dòng 123: `<Route element={<ProtectedRoute allowedRoles={['USER', 'API_PROVIDER', 'ADMIN']} />}>`
   - Dòng 145: `<Route element={<ProtectedRoute allowedRoles={['API_PROVIDER', 'ADMIN']} />}>`

## 6. Rủi ro & Các điều kiện còn treo

1. **BUG-01 ([Issue #46](https://github.com/antondung/API-Market/issues/46) - TC-03-08):** Lỗi bỏ qua xác thực khi chưa đăng nhập trên FE (Severity: High). Cần sửa `AuthContext` và `ProtectedRoute` để kiểm tra đúng trạng thái session thật trước khi cho phép vào các route Protected.
2. **Điểm lệch R1 (Trường Name):** Cần chốt tính đồng bộ giữa AC, Frontend validation và Backend schema.
3. **Rủi ro R2 (Vị trí lưu Token):** Token vẫn lưu tại `sessionStorage`, cần lộ trình chuyển sang HttpOnly Cookie.
4. **Điểm lệch R5 (Admin Workspace Access trên FE):** Cần thống nhất giữa Tech Lead, PO và FE dev về phạm vi hiển thị màn hình của Admin.

## 7. Đề xuất Go / No-Go

- [ ] **Go:** không còn bug Critical/High mở, 100% TC High đã chạy (kể cả FE)
- [ ] **Go có điều kiện:** ___
- [x] **No-Go:** Tồn tại 01 bug mức High đang mở (`BUG-01` / [Issue #46](https://github.com/antondung/API-Market/issues/46): Route Protected trên FE không chuyển hướng về trang đăng nhập khi chưa đăng nhập, vi phạm AC US-03 #2) và điểm lệch R5 chưa thống nhất. Theo Exit criteria (mục 1.4) và quy định DoD: còn bug mức cao thì không thể đánh giá Go.

> **Điều kiện chuyển sang Go:**
> 1. Dev FE xử lý dứt điểm `BUG-01` ([Issue #46](https://github.com/antondung/API-Market/issues/46)): Cập nhật `AuthContext` và `ProtectedRoute` trên FE để kiểm tra trạng thái đăng nhập thực tế; khi chưa xác thực phải chuyển hướng về `/login` hoặc `/401`; QA retest TC-03-08 đạt Pass.
> 2. Nhóm chốt hướng xử lý cho điểm lệch R5 (siết chặt Route Guard FE về 403 theo Role Matrix dòng 30-31 hoặc cập nhật lại Role Matrix).


## 8. Checklist Definition of Done

- [x] Acceptance Criteria US-01–04 đã duyệt
- [x] Test Plan + Test Cases đã cập nhật kết quả thực tế (nhánh `docs/5-qa-sprint1-retest-2026-10-10`)
- [x] 100% TC High đã chạy (cả BE và FE: 33/33 TC)
- [ ] Không có bug Critical/High mở *(Hiện có BUG-01 / Issue #46 Severity High trên FE)*
- [x] Role Matrix Sprint 1 đã ký duyệt (10/10/2026)
- [ ] Test Report đã comment vào Issue #5
- [ ] Tùng Dương cập nhật DoD và đóng Issue #2
- [x] R3 (ADMIN Role Matrix): đã xác nhận đúng thiết kế theo docs/02-role-va-phan-quyen.md dòng 30-31
- [x] R4 (Rate limit): đã xác nhận đúng thiết kế (30 req/phút/IP trên /api/auth/*)
- [ ] Sprint Review cùng Tấn Dũng và nhóm
