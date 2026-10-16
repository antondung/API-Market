# Bàn giao Sprint 2 — Nguyễn Như Tùng Dương

Cập nhật 16/10/2026. Phạm vi backend issue [#7](https://github.com/antondung/API-Market/issues/7), PR [#49](https://github.com/antondung/API-Market/pull/49) vào `develop`. Đây là trạng thái hiện hành, thay thế các báo cáo tiến độ trước ngày 16/10.

## Đối chiếu nhiệm vụ và bằng chứng

| Nhiệm vụ | Kết quả backend | Bằng chứng trong repo |
|---|---|---|
| US-06: hồ sơ xác minh | Gửi/xem Pending, Admin Verified/Rejected, có lý do từ chối, gửi lại sau Rejected | provider-router/service; admin-review-router/service; integration/provider.test.ts và admin-review.test.ts |
| US-09: API/Endpoint/Version | CRUD Draft, Provider Verified mới tạo; owner-only; phân trang; version phải thuộc API | provider-service.ts; integration/provider.test.ts: role/ownership, Draft CRUD/version binding, freeze Submitted |
| US-10: OpenAPI Import | Multipart JSON/YAML, Swagger 2.0/OpenAPI 3.0; parse params/request body/response, docs; lỗi có vị trí; import nguyên tử | provider-openapi-import.ts; provider-foundation.test.ts; import 3 demo Danh và injected failure rollback trong integration/provider.test.ts |
| US-11: Pricing | Free/Basic/Pro, giá/quota/rate limit, Free giá 0, kiểm tra độ chính xác và ràng buộc | provider-domain.ts; provider-service.ts; unit validation và PostgreSQL CRUD tests |
| US-08: pháp lý | Cam kết sở hữu/phân phối, Data Classification; explicit personal data yes/no, loại/mục đích; agreement version và server timestamp | migration 005; provider-domain/service.ts; personal data/current agreement tests |
| Bổ sung checklist: domain | DNS TXT proof thật, challenge ngẫu nhiên/hash/expiry, owner/API/hostname binding, rate limit, race protection | provider-dns.ts; provider-service.ts; DNS TXT transport/rotation/expiry/timeout tests |
| US-12: gửi duyệt | Draft → Submitted → Under Review → Approved → Published/Rejected; Rejected reopen; chặn gửi thiếu hồ sơ/domain/privacy/docs/pricing/agreement | submitApi/transitionApi; DB trigger Danh; provider/admin integration tests |
| Unit/integration test | 74 test, gồm 37 unit/HTTP và 37 PostgreSQL integration, không skip | `npm test`; CI commit triển khai 315f835 bên dưới |
| Swagger/tài liệu | Swagger chung có 30 thao tác Provider, 8 Admin review/audit ngoài Auth/Admin user | `/docs/`, `/openapi.json`, provider-sprint2.openapi.json; DOMAIN-PRIVACY-HANDOFF.md |

Test trên PostgreSQL thật đã chạy trọn luồng Provider tạo hồ sơ → Admin duyệt Provider → Provider tạo và gửi API → Admin approve/publish, kèm audit. DNS transport test dùng DNS UDP fixture cục bộ; production dùng resolver thật có timeout, không có bypass verified từ client. Không coi test tự động là nghiệm thu QA trên staging.

## Phiên bản và kiểm chứng

- Commit chức năng và tích hợp hiện hành: `315f835`.
- CI thành công của commit này: [run 38835072910](https://github.com/antondung/API-Market/actions/runs/38835072910).
- Build/typecheck, repo checker và diff-check đạt. Không phát hiện lỗi Critical/High trong phạm vi kiểm tra này; chưa có QA acceptance Sprint 2.
- Các lỗi đã sửa: malformed multipart 400 thay vì 500; NUL trước TEXT/JSONB; xóa cached docs khi sửa nội dung; mọi endpoint cần docs đúng operation; giới hạn graph sau dereference; reviewedBy string; Under Review không chuyển trùng hai lần.
- Đợt cập nhật tài liệu cuối không đổi chức năng. CI đúng commit bàn giao cuối được dẫn tại PR #49 và issue #7.

## Nhận và chạy lại

```powershell
npm ci
# .env: AUTH_STORE=postgres, DATABASE_URL, JWT_SECRET, CORS_ORIGINS
npm run db:migrate
npm run dev
```

Migrate mặc định áp dụng **001 + 003 + 005**, có history/checksum/advisory lock. 002 + 004 chỉ explicit `npm run db:seed` cho development và bị chặn production. Server không tự migrate/seed; DB cũ cần migration trước startup. Schema Danh 001–004 giữ nguyên; 005 bổ sung privacy/domain thuộc checklist backend này. Không chạy lại migration CREATE TABLE nếu DB do nhóm tạo trực tiếp mà chưa quản lý history tương ứng.

Swagger: `http://127.0.0.1:3000/docs/`; OpenAPI: `/openapi.json` trên máy chạy backend. Đây là URL local, chưa phải staging public. API đều dùng Bearer token, prefix `/api/provider` hoặc `/api/admin`; payload/response thực tế có trong Swagger. IDs opaque string; API status là Draft, Submitted, Under Review, Approved, Published, Rejected.

Legal cũ giữ `processesPersonalData=null` đến khi khai báo lại. Domain proof chưa có/hết hạn hoặc hồ sơ chưa đủ sẽ chặn submit; demo localhost/placeholder của seed không được tự coi là xác minh thật. Agreement production cần nhóm cấu hình riêng. Chi tiết DNS TXT, payload và mapping frontend: [DOMAIN-PRIVACY-HANDOFF.md](DOMAIN-PRIVACY-HANDOFF.md).

Kiểm tra lại:

```powershell
npm run lint
npm test
npm run build
./scripts/kiem-tra-kho-ma-nguon.ps1
git diff --check
```

Test cần PostgreSQL CLI hoặc PG_TEST_URL cho DB test riêng; runner tạo server/schema tạm, chạy tests rồi dọn tài nguyên thuộc test. CLI import độc lập: `npm run provider:import -- mock-services/weather/openapi.json`.

## Bàn giao giữa các thành viên

| Thành viên | Đã nhận/tích hợp | Việc còn cần xác nhận |
|---|---|---|
| Danh | Nguyên schema/seed 003/004, ERD/query guide và ba OpenAPI demo từ 8af8805 | Review dependency/schema bổ sung 005 cùng nhóm |
| Dũng | Nguyên commit Admin/Audit 63e8aea từ nhánh PR #51, Provider audit đã nối trong transaction; fix tích hợp Under Review và bổ sung dossier domain/privacy | Review PR #49, staging/CD và cấu hình agreement/environment |
| Hải Dương | Đã thông báo bắt đầu frontend Provider tại issue #8 và dùng contract PR #49 | Nối API thực vào UI, đặc biệt Draft ID trước DNS challenge, privacy payload và mapping trạng thái; trả lỗi backend nếu có |
| Vân | Chưa có báo cáo acceptance Sprint 2 tại issue #10 | Nghiệm thu trên môi trường tích hợp/staging và xác nhận bug severity |

## Definition of Done — trạng thái trung thực

| Tiêu chí issue #7 | Trạng thái |
|---|---|
| Nhiệm vụ và Acceptance Criteria | Chức năng backend và tests đã triển khai; yêu cầu chạy trên staging/acceptance còn chờ môi trường và QA |
| Test đạt; CI xanh | Đạt trên commit triển khai nêu trên; CI bản tài liệu cuối theo PR |
| Không còn Critical/High | Không phát hiện trong phạm vi kiểm tra; chưa thay xác nhận QA |
| Tài liệu/Swagger/migration | Đã cập nhật |
| PR vào develop; review và QA đạt | PR #49 đã mở; chưa có approval hoặc QA sign-off tại thời điểm kiểm tra |

Không còn hạng mục lập trình backend nào trong checklist được ghi nhận là chưa triển khai. Issue #7 giữ mở đến khi staging, review và QA có bằng chứng đạt; không đóng issue hoặc tự approve thay nhóm. Tùng Dương tiếp nhận/sửa lỗi backend từ tích hợp và QA. Frontend, triển khai hạ tầng và nghiệm thu là phần việc tương ứng của Hải Dương, Dũng và Vân.
