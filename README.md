# API Market

Nền tảng **API Marketplace & Management** cho phép Provider đăng, quản lý và thương mại hóa API; Consumer tìm kiếm, thử, đăng ký và theo dõi API Free/Paid; Admin kiểm duyệt và giám sát toàn hệ thống.

## Mục tiêu MVP

Luồng Consumer: **Tìm kiếm → Đọc tài liệu → Thử API → Đăng ký → Lấy API Key → Tích hợp → Theo dõi quota/chi phí**.

Luồng Provider: **Xác minh → Đăng API → Sinh tài liệu → Cấu hình gói → Gửi duyệt → Phân phối → Theo dõi usage/doanh thu**.

## Chạy nhanh bằng Docker

```powershell
Copy-Item .env.docker.example .env.docker   # rồi đổi JWT_SECRET
docker compose --env-file .env.docker up --build -d
docker compose --env-file .env.docker run --rm migrate --seed   # tài khoản demo, tùy chọn
```

Backend: http://localhost:3000 · Swagger: http://localhost:3000/docs/

Chi tiết tại [docs/04-docker.md](docs/04-docker.md).

Phạm vi MVP dùng thanh toán sandbox; không xử lý tiền thật. API Key chỉ hiện đầy đủ một lần và DB chỉ lưu hash. Playground chỉ gọi endpoint đã đăng ký. Log không lưu Authorization, cookie, API key hoặc dữ liệu nhạy cảm không cần thiết.

## Tài liệu dự án

| Tài liệu | Nội dung |
|---|---|
| [Kiến trúc hệ thống](docs/01-kien-truc-he-thong.md) | Control Plane – Data Plane – Background Worker, tech stack, luồng xử lý request qua Gateway, mô hình dữ liệu, bảo mật, CI/CD, rủi ro |
| [Role & phân quyền](docs/02-role-va-phan-quyen.md) | 3 role hệ thống, Role Matrix, ma trận chặn truy cập, 5 vai trò thành viên, RACI, quy tắc chung |
| [Quy trình làm việc](docs/03-quy-trinh-lam-viec.md) | Quy ước Git, CI/CD, quy ước code, QA & quản lý bug, nhịp sprint, checklist merge/release |
| [Docker](docs/04-docker.md) | Một lệnh dựng cả hệ thống FE–BE–DB–Redis, migration/seed, xử lý sự cố |
| [Quy trình quản lý bug](docs/05-quy-trinh-quan-ly-bug.md) | Vòng đời bug, 4 mức severity, template bug report |
| [Kiểm thử Sprint 1](docs/test/Sprint1_TestReport.md) | Test Plan, Test Cases, Test Report, Acceptance Criteria |
| [Tài liệu frontend](docs/frontend-guide.md) | Kiến trúc, auth, hợp đồng API, mô hình dữ liệu, i18n, design system |
| [Backend](backend/README.md) | Chạy backend, cấu hình môi trường, API Auth, test PostgreSQL |
| [Frontend](frontend/README.md) | Chạy frontend, cấu trúc code, tích hợp backend |

Mục lục đầy đủ: [docs/README.md](docs/README.md)

## Thành viên và vai trò

| Thành viên | GitHub | Vai trò | Trách nhiệm chính |
|---|---|---|---|
| Nguyễn Tấn Dũng | [@antondung](https://github.com/antondung) | Tech Lead / Fullstack / DevOps | Kiến trúc, tiến độ, Git/review, Admin, tích hợp, CI/CD, deploy, integration test. |
| Nguyễn Như Tùng Dương | [@tungdota53](https://github.com/tungdota53) | Backend Developer | REST API, Auth/RBAC, API Management, Gateway, key/quota/rate limit, subscription, analytics, backend security/test. |
| Lê Hải Dương | [@leduwn](https://github.com/leduwn) | Frontend Developer | Marketplace, Provider/Consumer dashboard, Playground, subscription, analytics UI, design system, responsive/test. |
| Võ Trọng Danh | [@danhbuonsv2-svg](https://github.com/danhbuonsv2-svg) | Database Developer | ERD/schema, migration/seed, constraint/index, transaction/query, usage/analytics, backup/restore. |
| Trần Hà Thảo Vân | [@vuonghathaovan-gif](https://github.com/vuonghathaovan-gif) | QA / Tester / Documentation | Acceptance criteria, test plan/case, functional/integration/regression/UAT, bug, UX/security checklist, User Guide. |

## Tổng quan sprint

| Sprint | Thời gian | Deadline nội bộ | Mục tiêu |
|---|---|---|---|
| 1 — Nền tảng & Tài khoản | 05/10/2026–11/10/2026 | **10/10/2026** | Tài khoản, RBAC, dashboard theo vai trò, Admin quản lý người dùng, khung FE–BE–DB và CI. |
| 2 — Provider đăng và xuất bản API | 12/10/2026–20/10/2026 | **19/10/2026** | Xác minh Provider, OpenAPI, tài liệu, pricing, pháp lý, duyệt và publish API. |
| 3 — Consumer tìm, thử và lấy API Key | 21/10/2026–29/10/2026 | **28/10/2026** | Marketplace, API Detail, Playground, Try Before Subscribe, API Key và moderation. |
| 4 — Subscribe, Gateway kiểm soát & Usage | 30/10/2026–09/11/2026 | **08/11/2026** | Subscription, payment sandbox, Gateway, quota/rate limit, usage và feature freeze. |
| 5 — Hoàn thiện, bảo mật & sẵn sàng demo | 10/11/2026–15/11/2026 | **14/11/2026** | Cost Guard, Analytics, bảo mật, tải, production, UAT và tài liệu demo. |

Deadline nội bộ đặt trước ngày kết thúc sprint 1 ngày. Ngày cuối sprint dành cho review, sửa lỗi, kiểm thử hồi quy và demo.

## Phân công và bàn giao

Mỗi thành viên có một GitHub Issue cho từng sprint, tổng cộng 25 issue. Issue ghi rõ backlog liên quan, effort, đầu ra và phụ thuộc. Milestone sprint dùng deadline nội bộ. GitHub Project là bảng theo dõi chung.

## Quy trình Git

- `main`: nhánh chính, chỉ nhận thay đổi đã kiểm duyệt qua Pull Request. Không push trực tiếp.
- `develop`: nhánh phụ tích hợp. Thành viên tạo nhánh công việc và mở Pull Request vào `develop` trong sprint.
- Nhánh công việc: `feature/<issue>-<ten-ngan>`, `fix/<issue>-<ten-ngan>`, `docs/<issue>-<ten-ngan>`.
- Cuối sprint: Tech Lead và QA kiểm tra bản trên `develop`; đạt yêu cầu mới tạo Pull Request `develop` → `main`.
- Pull Request vào `main` cần ít nhất 1 approval, giải quyết hết conversation, không force-push hoặc xóa nhánh.

> `README.md` này chỉ tồn tại trên `main`. Nhánh `develop` không giữ bản sao để tránh xung đột khi merge; script `scripts/kiem-tra-kho-ma-nguon.ps1` chỉ bắt buộc README trên nhánh `main`.

### Chu trình bàn giao

1. Nhận issue và xác nhận Acceptance Criteria.
2. Tạo nhánh từ `develop`; commit nhỏ, rõ nghĩa; liên kết issue.
3. Push nhánh công việc và mở Pull Request vào `develop`.
4. CI, review và QA đạt; merge vào `develop`.
5. Cuối sprint mở Pull Request `develop` → `main`; Tech Lead duyệt và merge.

## Definition of Done

- Đủ Acceptance Criteria và test liên quan.
- Không còn bug Critical/High mở.
- CI xanh; migration chạy sạch từ DB trống nếu có thay đổi DB.
- Không commit secret; log đã redact dữ liệu nhạy cảm.
- Tài liệu/Swagger/UI state được cập nhật.
- Đã review và chạy được trên môi trường tích hợp.

## Quản lý công việc

- [Issues](https://github.com/antondung/API-Market/issues)
- [Milestones](https://github.com/antondung/API-Market/milestones)
- [Pull Requests](https://github.com/antondung/API-Market/pulls)
- [GitHub Projects](https://github.com/users/antondung/projects)
