# Bàn giao Sprint 2 — Nguyễn Như Tùng Dương

Cập nhật 17/10/2026 trên `develop` commit `963e462`. Phạm vi backend issue [#7](https://github.com/antondung/API-Market/issues/7), PR [#49](https://github.com/antondung/API-Market/pull/49) đã được approve và merge; Tech Lead đã đóng issue xác nhận hoàn thành. Đây là trạng thái hiện hành, thay thế các báo cáo tiến độ trước đó.

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

Test trên PostgreSQL thật đã chạy trọn luồng Provider tạo hồ sơ → Admin duyệt Provider → Provider tạo và gửi API → Admin approve/publish, kèm audit. DNS transport test dùng DNS UDP fixture cục bộ; production dùng resolver thật có timeout, không có bypass verified từ client. QA độc lập đã nghiệm thu Backend/Database GO với 60/60 API E2E trên Docker dev, được Tech Lead kiểm chứng và approve tại PR #54. Không coi đây là kiểm thử trên staging public.

## Phiên bản và kiểm chứng

- Commit chức năng và tích hợp hiện hành: `315f835`.
- CI thành công của commit này: [run 38835072910](https://github.com/antondung/API-Market/actions/runs/38835072910).
- Chạy lại bản tích hợp 17/10: backend **74/74** test đạt, frontend **115/115** test (16 file) và build đạt. Backend test chạy PostgreSQL thật; frontend test dùng Node 24.19.0 có sẵn.
- Build/typecheck, repo checker và diff-check đạt. QA/Tech Lead xác nhận không có bug Critical/High đang mở trong phạm vi bàn giao, xem [xác nhận đóng issue QA #10](https://github.com/antondung/API-Market/issues/10#issuecomment-6235389784).
- CI `develop` commit `963e462` xanh: [run 39041971372](https://github.com/antondung/API-Market/actions/runs/39041971372).
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

Swagger: `http://127.0.0.1:3000/docs/`; OpenAPI: `/openapi.json` trên máy chạy backend. Đây là URL local, chưa phải staging public. API đều dùng Bearer token, prefix `/api/provider` hoặc `/api/admin`; payload/response thực tế có trong Swagger. IDs opaque string; API status là Draft, Submitted, Under Review, Approved, Published, Rejected. Frontend hiện đã nối API thật qua providerApi.ts và adminReviewApi.ts; PR #52 đã merge. Ba API demo chạy được qua Docker profile demo từ PR #55.

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
| Danh | Nguyên schema/seed 003/004, ERD/query guide và ba OpenAPI demo từ 8af8805, đã có trên develop | Không còn dependency code chặn backend |
| Dũng | Admin/Audit đã tích hợp; approve và merge PR #49; demo services PR #55 | Staging/CD EN-08 được Tech Lead chuyển sang sprint sau tại issue #6; PR phát hành #57 vẫn mở tại thời điểm kiểm tra |
| Hải Dương | Frontend Provider và Admin đã nối API thật, PR #52 merge; issue #8 đóng | Tooltip FQDN là ghi chú UX được Tech Lead để sprint sau, không phải lỗi backend |
| Vân | PR #54 merge: acceptance/test cases, 74 backend tests, 60 API E2E; issue #10 đóng | QA xác nhận Backend GO; Tech Lead xác nhận Admin UI đã nối và bug Critical/High 0 |

## Definition of Done — trạng thái trung thực

| Tiêu chí issue #7 | Trạng thái |
|---|---|
| Nhiệm vụ và Acceptance Criteria | Backend đã triển khai và được QA/Tech Lead nghiệm thu; staging EN-08 được Tech Lead chuyển sprint sau |
| Test đạt; CI xanh | Backend 74/74, frontend 115/115 chạy lại; CI develop xanh; E2E 60/60 do QA và Tech Lead kiểm chứng |
| Không còn Critical/High | QA/Tech Lead xác nhận 0 bug trong phạm vi bàn giao; lưu ý dependency dev frontend riêng ở dưới |
| Tài liệu/Swagger/migration | Đã cập nhật |
| PR vào develop; review và QA đạt | PR #49 đã approve/merge; QA PR #54 approve/merge; Tech Lead đã đóng issue #7 |

Phần backend Sprint 2 của Tùng Dương đã hoàn thành theo [xác nhận Tech Lead tại issue #7](https://github.com/antondung/API-Market/issues/7#issuecomment-6235389019). Issue đã đóng; checklist còn trống được đồng bộ theo các bằng chứng này, không tự approve hoặc thay kết quả QA. Không khẳng định PR #57 đã merge chỉ từ lời bàn giao: API GitHub tại thời điểm kiểm tra vẫn trả OPEN. Staging public chưa có; EN-08 thuộc phần Dũng đã được chuyển sprint sau.

## Lưu ý môi trường và dependency phát triển frontend

Node mặc định trên máy 22.14 không chạy được bộ test frontend hiện tại do engine của jsdom/undici. Dùng Node 22.22.2 trở lên trong dòng 22, hoặc Node 24.15 trở lên (đợt kiểm chứng dùng 24.19.0). Backend vẫn chạy theo engine khai báo trong package.json. Không sửa frontend dependency trong PR tài liệu backend này.

`npm audit --omit=dev` frontend: 0 vulnerability. Audit đầy đủ báo 7 cảnh báo ở chuỗi dependency dev/build Tailwind (5 high, 2 moderate: braces, chokidar, fast-glob, micromatch, postcss-nested, postcss-selector-parser, tailwindcss). Đây là phát hiện của lần kiểm tra 17/10, tách khỏi kết quả bug nghiệp vụ QA trước đó; cần Hải Dương/Dũng đánh giá/nâng cấp toolchain có kiểm thử, không chạy audit fix --force gây đổi major không kiểm soát. Build frontend đạt, còn cảnh báo bundle lớn; không coi đó là lỗi backend hoặc âm thầm sửa phần của thành viên khác.
