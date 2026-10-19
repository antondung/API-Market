# Đóng góp của các thành viên — API Market

Tài liệu này ghi nhận đóng góp thực tế của từng thành viên trong dự án API Market.

Mục đích: bảo đảm công sức của mọi người được ghi nhận chính xác, kể cả khi một phần công việc được gộp vào nhánh chính qua đường khác với Pull Request ban đầu.

Cập nhật lần cuối: 16/10/2026.

---

## Bảng tổng hợp

| Thành viên | Vai trò | GitHub | Đóng góp chính |
|---|---|---|---|
| Nguyễn Tấn Dũng | Tech Lead / Fullstack / DevOps | [@antondung](https://github.com/antondung) | Kiến trúc, quy trình Git, Admin review, Docker, CI/CD, tích hợp |
| Nguyễn Như Tùng Dương | Backend Developer | [@Tungdota53](https://github.com/Tungdota53) | Auth/JWT/RBAC, Provider API, OpenAPI import, DNS verification |
| Lê Hải Dương | Frontend Developer | [@leduwn](https://github.com/leduwn) | Toàn bộ giao diện React, Design System, tích hợp FE–BE |
| Võ Trọng Danh | Database Developer | [@danhbuonsv2-svg](https://github.com/danhbuonsv2-svg) | ERD, schema Auth và Provider, migration, seed data |
| Trần Hà Thảo Vân | QA / Tester / Documentation | [@vuonghathaovan-gif](https://github.com/vuonghathaovan-gif) | Acceptance Criteria, test case, test report, quy trình bug |

---

## Ghi chú quan trọng về cách tính đóng góp

Số commit trên GitHub **không phản ánh đầy đủ** đóng góp thực tế trong dự án này, vì hai lý do:

1. **Nhánh orphan.** Một số nhánh được gộp vào `develop` bằng cách merge trực tiếp, không qua Pull Request. Khi đó commit gốc không còn nằm trong lịch sử nhánh chính, và GitHub ghi công cho người thực hiện merge thay vì tác giả.

2. **Commit dồn.** Nhiều thay đổi lớn được gộp trong một commit duy nhất, nên số commit ít hơn khối lượng công việc thật.

Vì vậy tài liệu này ghi theo **Pull Request và khối lượng file thay đổi**, không chỉ theo số commit.

---

## Chi tiết từng thành viên

### Nguyễn Tấn Dũng — Tech Lead / Fullstack / DevOps

| Hạng mục | Chi tiết |
|---|---|
| Sprint 1 | Kiến trúc Control Plane – Data Plane – Worker; tài liệu role; quy trình Git; Admin quản lý người dùng (PR #40); Docker Compose (PR #34); tích hợp Frontend (PR #42, #43); release `main` (PR #45); sửa BUG-01 (PR #48) |
| Sprint 2 | Admin duyệt Provider và API; Audit Log dùng chung; tích hợp luồng Provider → Admin → Publish (PR #51, gộp vào PR #49) |
| Khác | CI tự động (PR #28, #29); review và approve toàn bộ PR của nhóm |

### Nguyễn Như Tùng Dương — Backend Developer

| Hạng mục | Chi tiết |
|---|---|
| Sprint 1 | Auth, JWT, refresh token rotation, RBAC; PostgreSQL adapter; Swagger/OpenAPI; 27 test backend (PR #30, #35) |
| Sprint 2 | Provider verification; Draft API/version/endpoint CRUD; pricing; legal declaration; OpenAPI import; DNS domain verification; privacy declaration; Admin review integration (PR #49) |
| Khác | Vá lỗi leo thang đặc quyền (PR #50) |

### Lê Hải Dương — Frontend Developer

| Hạng mục | Chi tiết |
|---|---|
| Sprint 1 | **PR #36** — `[EN-03] Frontend: shared UI and backend authentication`: 112 file, +78.783 dòng. Bao gồm Design System, 48 màn hình (`Screen0`–`Screen47`), API client, i18n, tích hợp Backend Auth |
| Sprint 1 | **PR #37** — `[EN-14] Frontend: restore release pages with empty states`: 34 file, +7.213 dòng. Bao gồm `navigation.ts`, `styles.css`, `vitest.config.ts`, test tích hợp Auth |
| Sprint 2 | Giao diện Provider đầy đủ: Create API, Endpoints, My APIs, OpenAPI Import, Pricing, Verification, Publishing Workflow; nối Frontend vào API thật; 11 file test (PR #52) |

**Tổng: 146 file, khoảng +86.000 dòng.**

**Lưu ý về ghi công:** PR #36 và #37 do Hải Dương tạo và đóng góp, nhưng đã bị đóng và công việc được gộp vào `develop` qua một nhánh orphan (commit `0924c2d`), không qua Pull Request.

Hệ quả:

- Commit gốc của Hải Dương (`bd63a9b`, `b3dfea3`) vẫn tồn tại trong kho nhưng **không nằm trong lịch sử của `main` hay `develop`**.
- Trang Contributors của GitHub vì vậy chỉ hiển thị 1 commit cho tài khoản `leduwn`, không phản ánh khối lượng thật.
- Toàn bộ mã nguồn Frontend Hải Dương viết **vẫn đang hoạt động** trong sản phẩm.

Đây là vấn đề ghi công, không phải vấn đề kỹ thuật. Tài liệu này dùng để xác nhận đóng góp của Hải Dương khi đánh giá.

### Võ Trọng Danh — Database Developer

| Hạng mục | Chi tiết |
|---|---|
| Sprint 1 | ERD tổng thể; schema User, Role, Provider, Refresh Token; migration 001/002; seed data (PR #32) |
| Sprint 2 | Schema Provider (migration 003): API, version, endpoint, pricing, legal, review, audit log; seed demo 004; ERD Sprint 2; hướng dẫn truy vấn; 3 file OpenAPI demo cho Weather, Currency, Catalog (commit `8af8805`) |

### Trần Hà Thảo Vân — QA / Tester / Documentation

| Hạng mục | Chi tiết |
|---|---|
| Sprint 1 | Acceptance Criteria và Role Matrix; 33 test case; Test Report; quy trình quản lý bug (PR #38, #39, #41, #47) |
| Kết quả | 24/24 test case đã chạy đều pass; phát hiện BUG-01 và retest sau khi sửa |

---

## Bằng chứng tham chiếu

| Nội dung | Tham chiếu |
|---|---|
| Hải Dương — Sprint 1 giao diện | [PR #36](https://github.com/antondung/API-Market/pull/36), [PR #37](https://github.com/antondung/API-Market/pull/37) |
| Hải Dương — Sprint 2 giao diện | [PR #52](https://github.com/antondung/API-Market/pull/52) |
| Commit gốc của Hải Dương | `bd63a9b`, `b3dfea3` |
| Đường merge thay thế | commit `0924c2d` |
| Tùng Dương — Backend | [PR #30](https://github.com/antondung/API-Market/pull/30), [PR #49](https://github.com/antondung/API-Market/pull/49) |
| Danh — Database | [PR #32](https://github.com/antondung/API-Market/pull/32), commit `8af8805` |
| Vân — QA | [PR #38](https://github.com/antondung/API-Market/pull/38), [PR #39](https://github.com/antondung/API-Market/pull/39), [PR #47](https://github.com/antondung/API-Market/pull/47) |
| Dũng — Tech Lead | [PR #40](https://github.com/antondung/API-Market/pull/40), [PR #45](https://github.com/antondung/API-Market/pull/45), [PR #51](https://github.com/antondung/API-Market/pull/51) |

---

## Bài học cho các sprint sau

Để tránh tình trạng ghi công sai lặp lại:

1. **Không merge trực tiếp vào `develop`.** Mọi thay đổi phải qua Pull Request, kể cả khi cần gấp.
2. **Bật bảo vệ nhánh `develop`.** Hiện `develop` chưa được bảo vệ nên vẫn có thể push trực tiếp.
3. **Không xóa nhánh trước khi PR được merge.** Nếu PR bị đóng, giữ nhánh lại cho tới khi xác nhận nội dung đã vào `develop`.
4. **Bật tự động xóa nhánh sau khi merge** để dọn nhánh cũ, nhưng chỉ sau khi merge thành công.
