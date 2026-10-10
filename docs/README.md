# Tài liệu dự án — API Marketplace & Management

Nền tảng API Marketplace & Management: nơi nhà phát triển **đăng tải, quản lý, chia sẻ và thương mại hóa API**, đồng thời người dùng có thể **tìm kiếm, dùng thử, đăng ký và theo dõi việc sử dụng API** theo gói Free/Paid.

## Mục lục

| # | Tài liệu | Nội dung |
|---|---|---|
| 01 | [Kiến trúc hệ thống](./01-kien-truc-he-thong.md) | Control Plane – Data Plane – Background Worker, tech stack, luồng request, mô hình dữ liệu, bảo mật, CI/CD, rủi ro |
| 02 | [Role & phân quyền](./02-role-va-phan-quyen.md) | 3 role hệ thống, Role Matrix, ma trận chặn truy cập, 5 vai trò thành viên, RACI, quy tắc chung |
| 03 | [Quy trình làm việc](./03-quy-trinh-lam-viec.md) | Quy ước Git, CI/CD, quy ước code, QA & quản lý bug, nhịp sprint, checklist merge/release |
| 04 | [Docker](./04-docker.md) | Một lệnh dựng cả hệ thống FE–BE–DB–Redis, migration/seed, xử lý sự cố |
| 05 | [Quy trình quản lý bug](./05-quy-trinh-quan-ly-bug.md) | Vòng đời bug, 4 mức severity, template bug report, quy tắc bàn giao |

### Kiểm thử Sprint 1

| Tài liệu | Nội dung |
|---|---|
| [Acceptance Criteria](./test/Sprint1_AcceptanceCriteria.md) | Tiêu chí chấp nhận US-01 → US-04 |
| [Test Plan & Test Cases](./test/Sprint1_TestCases.md) | 33 test case cho đăng ký, đăng nhập, phân quyền, Admin quản lý user |
| [Test Report](./test/Sprint1_TestReport.md) | Kết quả thực thi, danh sách bug, điểm lệch, đề xuất Go/No-Go |

### Tài liệu frontend

| Tài liệu | Nội dung |
|---|---|
| [Kiến trúc frontend](./architecture.md) | Cấu trúc codebase, tech stack, component map |
| [Auth & phân quyền](./auth-and-roles.md) | Luồng xác thực, vai trò, route guard, kiểm soát truy cập |
| [Hợp đồng API](./api-contracts.md) | Các endpoint REST frontend gọi tới backend |
| [Mô hình dữ liệu](./data-models.md) | TypeScript types và tham chiếu schema |
| [Hướng dẫn frontend](./frontend-guide.md) | Cấu trúc code, quy ước, quản lý state |
| [i18n](./i18n.md) | Hệ thống đa ngôn ngữ VI/EN |
| [Design System](./design-system.md) | Triết lý thiết kế, Material Design 3 tokens, quy chuẩn UI/UX |

## Tóm tắt nhanh

**Sản phẩm:** Marketplace + API Management + Playground + Analytics + Subscription trong một hệ thống.

**Hành trình người dùng:** Tìm → Test → Đăng ký → Tích hợp → Theo dõi.

**Tech stack:** React + TypeScript · Node.js + Express 5 + TypeScript · PostgreSQL · Redis · Docker · GitHub Actions.

**Kiến trúc:** Control Plane (Backend API) – Data Plane (API Gateway) – Background Worker.

**3 role hệ thống:** `ADMIN` · `USER` (Consumer) · `API_PROVIDER` (Provider).

**5 vai trò thành viên:** Tech Lead/Fullstack/DevOps · Backend · Frontend · Database · QA/Documentation.

**Phạm vi:** 5 sprint (05/10 → 15/11), 48 mục backlog, 260 điểm effort, feature freeze hết Sprint 4.

## Nguồn

- `Nhóm LLM (1).pdf` — 22 trang: phân chia nhiệm vụ, ý tưởng sản phẩm, vision, phân tích kỹ thuật, định hướng phát triển, pháp lý, sprint, product backlog.
- `Product_Backlog_5_Sprint.xlsx` — 5 sheet: Tổng quan Sprint, Product Backlog, Nhiệm vụ theo người, Tải theo thành viên, Ghi chú & giả định.