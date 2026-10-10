# Sprint 1 — Test Report

Refs: #5 · Người thực hiện: Trần Hà Thảo Vân (QA/Tester/Documentation) · Sprint 1: 05/10–11/10 · Ngày báo cáo: 10/10/2026

## 1. Tổng quan

- **Môi trường BE:** Docker Compose — `api-market-backend` (nhánh `docs/5-qa-sprint1`, commit `5f5a32e`), PostgreSQL `api-market-postgres`, DB `api_market_dev`
- **Môi trường FE:** nhánh `feature/EN-14-frontend-release-polish` — **chưa tích hợp BE auth thật; 5 TC FE chưa chạy**
- **Công cụ:** Script tự động axios/Node.js (`qa-scripts/run-all.js`) + thủ công SQL/Docker log
- **Phạm vi:** US-01 → US-04 (xem `Sprint1_TestCases.md`)

## 2. Kết quả thực thi

| Nhóm | Tổng | Pass | Fail | Blocked | Not Run |
|---|---|---|---|---|---|
| US-01 Đăng ký | 8 | 7 | 0 | 0 | 1 |
| US-02 Đăng nhập / token | 8 | 7 | 0 | 0 | 1 |
| US-03 Phân quyền | 8 | 5 | 0 | 0 | 3 |
| US-04 Admin quản lý user | 4 | 0 | 0 | 4 | 0 |
| Non-functional / bảo mật | 5 | 5 | 0 | 0 | 0 |
| **Tổng** | **33** | **24** | **0** | **4** | **5** |

**Tỷ lệ Pass (trên số case đã chạy):** 24 / 24 = **100%**

> Not Run (5 TC): TC-01-02, TC-02-08, TC-03-06, TC-03-07, TC-03-08 — lý do: FE chưa tích hợp BE auth, chờ dev FE hướng dẫn chạy.
> Blocked (4 TC): TC-04-01 → TC-04-04 — lý do: chưa có API admin quản lý user.

## 3. Danh sách bug

| Bug ID | Tiêu đề | Mức độ | TC liên quan | Trạng thái | Người xử lý |
|---|---|---|---|---|---|
| — | Không có bug nào được ghi nhận | — | — | — | — |

## 4. Test case Blocked / Not Run

| TC | Lý do | Người phụ trách | ETA |
|---|---|---|---|
| TC-04-01 → 04 | Chưa có API list/search/khóa/mở khóa user (chỉ có trang `/admin/users` ở FE) | Tấn Dũng | Chưa xác nhận |
| TC-01-02, TC-02-08 | FE chưa tích hợp BE auth thật; chờ dev FE hướng dẫn cách chạy | Hải Dương | Chờ FE merge |
| TC-03-06, TC-03-07, TC-03-08 | FE chưa tích hợp BE auth thật; route guard FE chưa kiểm thử được | Hải Dương | Chờ FE merge |

## 5. Điểm lệch cần nhóm quyết định

| # | Nội dung | Kết quả thực tế | Lựa chọn cần chốt |
|---|---|---|---|
| R1 | AC US-01 #4: tên hiển thị bắt buộc, nhưng BE để `name` tùy chọn (1–100 ký tự) | BE trả 201 khi không có `name` | Sửa AC (bỏ bắt buộc) hoặc sửa BE (bắt buộc name) |
| R2 | AC US-02 #5: refresh token qua HttpOnly Cookie, thực tế trả trong body JSON, FE lưu `sessionStorage` | Refresh token trong body JSON — chưa test FE | Sửa AC hoặc sửa code (rủi ro Medium bảo mật) |
| R3 ⚠️ | **Role Matrix ADMIN:** AC chưa chốt ADMIN truy cập guard nào | Thực tế: ADMIN chỉ vào `/api/access/admin` (200), còn consumer và provider đều 403 | Nhóm xác nhận: ADMIN có truy cập consumer/provider guard không? |
| R4 ⚠️ | **Rate limit quá nhạy:** 429 xuất hiện tại request #3, không phải sau 30 req/phút như thiết kế | 35 request gửi liên tiếp → 429 ngay req #3 | Tấn Dũng xác nhận ngưỡng thật (per-IP, per-phút, window size) |

## 6. Rủi ro còn lại

- US-04 chưa kiểm thử được qua API (blocked).
- 5 TC giao diện FE chưa chạy — cần FE tích hợp và hướng dẫn môi trường.
- Chưa chạy hồi quy sau khi nhóm chốt R3 và R4.
- Rate limit cần xác nhận lại cấu hình trước Sprint Review.

## 7. Đề xuất Go / No-Go

- [x] **Go có điều kiện:** 24/24 TC API đã Pass, 0 bug Critical/High. Còn 2 điểm lệch (R3, R4) cần nhóm chốt và 5 TC FE chờ tích hợp.
- [ ] **Go:** không còn bug Critical/High mở, 100% TC High đã chạy (kể cả FE)
- [ ] **No-Go:** lý do ___

> **Điều kiện Go đầy đủ:** (1) nhóm chốt R3 Role Matrix ADMIN; (2) Tấn Dũng xác nhận ngưỡng rate limit R4; (3) Hải Dương hướng dẫn chạy FE để chạy 5 TC còn lại.

## 8. Checklist Definition of Done

- [x] Acceptance Criteria US-01–04 đã duyệt
- [x] Test Plan + Test Cases đã cập nhật kết quả thực tế (PR `docs/5-qa-sprint1`)
- [x] 100% TC High đã chạy (trên BE) — TC High FE chờ tích hợp
- [x] Không có bug Critical/High mở
- [x] Role Matrix Sprint 1 đã ký duyệt (10/10/2026)
- [ ] Test Report đã comment vào Issue #5
- [ ] Tùng Dương cập nhật DoD và đóng Issue #2
- [ ] Nhóm chốt R3 (ADMIN Role Matrix) và R4 (rate limit ngưỡng)
- [ ] Sprint Review cùng Tấn Dũng
