# Sprint 1 — Test Report

Refs: #5 · Người thực hiện: Trần Hà Thảo Vân (QA/Tester/Documentation) · Sprint 1: 05/10–11/10 · Ngày báo cáo: ___/10/2026

## 1. Tổng quan
- Môi trường: backend (nhánh/commit: ___), frontend (nhánh: `feature/EN-14-frontend-release-polish`), PostgreSQL
- Phạm vi: US-01 → US-04 (xem `Sprint1_TestCases.md`)

## 2. Kết quả thực thi

| Nhóm | Tổng | Pass | Fail | Blocked | Not Run |
|---|---|---|---|---|---|
| US-01 Đăng ký | 8 | | | | |
| US-02 Đăng nhập / token | 8 | | | | |
| US-03 Phân quyền | 8 | | | | |
| US-04 Admin quản lý user | 4 | 0 | 0 | 4 | 0 |
| Non-functional / bảo mật | 5 | | | | |
| **Tổng** | **33** | | | | |

Tỷ lệ Pass (trên số case đã chạy): ___%

## 3. Danh sách bug

| Bug ID | Tiêu đề | Mức độ | TC liên quan | Trạng thái | Người xử lý |
|---|---|---|---|---|---|
| | | | | | |

## 4. Test case Blocked
| TC | Lý do | Người phụ trách | ETA |
|---|---|---|---|
| TC-04-01 → 04 | Chưa có API list/search/khóa/mở khóa user (chỉ có trang `/admin/users` ở FE) | Tấn Dũng | ___ |

## 5. Điểm lệch cần nhóm quyết định
| # | Nội dung | Lựa chọn |
|---|---|---|
| 1 | AC US-01 #4: tên hiển thị bắt buộc, nhưng BE để `name` tùy chọn (1–100 ký tự) | Sửa AC hoặc sửa BE |
| 2 | AC US-02 #5: refresh token qua HttpOnly Cookie, thực tế trả trong body JSON, FE lưu `sessionStorage` | Sửa AC hoặc sửa code (rủi ro Medium) |

## 6. Rủi ro còn lại
- US-04 chưa kiểm thử được qua API.
- FE chưa merge vào `develop`.
- Chưa chạy hồi quy sau khi dev sửa bug.

## 7. Đề xuất Go / No-Go
- [ ] **Go**: không còn bug Critical/High mở, TC High đã chạy hết
- [ ] **Go có điều kiện**: ___
- [ ] **No-Go**: lý do ___

## 8. Checklist Definition of Done
- [ ] Acceptance Criteria US-01–04 đã duyệt
- [ ] Test Plan + Test Cases đã merge vào `develop` (PR `docs/5-qa-sprint1`)
- [ ] 100% TC High đã chạy
- [ ] Bug đã báo trong 24h, gắn label `bug`
- [ ] Role Matrix Sprint 1 đã ký duyệt
- [ ] Test Report đã comment vào Issue #5
- [ ] Tùng Dương cập nhật DoD và đóng Issue #2
- [ ] Sprint Review cùng Tấn Dũng
