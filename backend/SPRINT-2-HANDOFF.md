# Sprint 2 — phần chuẩn bị backend của Nguyễn Như Tùng Dương

Cập nhật 11/10/2026, issue #7. Đây là phần hoàn thành trước khi nhận schema Sprint 2; chưa phải backend Sprint 2 đã nghiệm thu.

## Đã làm

- `src/provider-domain.ts`: validation hồ sơ xác minh, metadata API, endpoint, version, pricing, khai báo pháp lý và chấp nhận agreement. Chặn client tự ghi owner/status/timestamp. Free phải có giá 0, quota và rate limit phải dương.
- Guard nghiệp vụ độc lập: chỉ Provider sở hữu tài nguyên, tạo khi Verified, chỉnh sửa khi Draft. Gửi duyệt chỉ khi đủ metadata, endpoint, documentation, pricing, pháp lý và agreement hiện hành; các giá trị readiness phải lấy từ server/database, không nhận từ request.
- Chính sách trạng thái: Draft → Submitted → Under Review → Approved → Published; Under Review → Rejected cần lý do; Provider có thể đưa Rejected về Draft. Provider không thể tự approve/publish. Hàm chính sách dùng chung để phối hợp, chưa triển khai endpoint Admin của Dũng.
- `src/provider-openapi-import.ts`: nhập JSON/YAML Swagger 2.0 và OpenAPI 3.0.x, validate schema, giải local reference, giữ parameter path/query/header, request body, response và security, xuất documentation JSON. Chặn external reference, vòng tham chiếu, YAML alias đệ quy, file quá 1 MiB và tài liệu quá sâu/phức tạp. Không gọi upstream, không đọc file từ $ref. OpenAPI 3.1 import chưa hỗ trợ và trả lỗi rõ phiên bản.
- `provider-sprint2.openapi.json`: contract OpenAPI 3.1 đề xuất cho 24 thao tác Provider, mở được trong Swagger Editor. Sinh từ `src/provider-contract.ts`; chưa mount vào server, không trộn với Swagger Auth đang chạy. Response model/ID sẽ hoàn thiện theo schema bàn giao.
- 8 test mới kiểm tra ownership, validation, submission, workflow, parser JSON/YAML và lỗi import. Tổng bộ test backend hiện tại: 48 pass, gồm test PostgreSQL của develop; không skip.

## Dùng ngay parser

```powershell
npm ci
npm run provider:import -- path/to/spec.yaml
npm test
npm run lint
```

Lệnh import chỉ đọc file được chỉ định, in JSON kết quả ra stdout hoặc lỗi có field ra stderr; không ghi database hay thực hiện request network. Tài liệu đã parse là dữ liệu không đáng tin; frontend cần render dưới dạng text/escape HTML khi hiển thị description.

Sinh lại contract sau khi chỉnh validation/routes:

```powershell
node --import tsx --input-type=module -e 'import { providerContract } from "./backend/src/provider-contract.ts"; import { writeFileSync } from "node:fs"; writeFileSync("backend/provider-sprint2.openapi.json", JSON.stringify(providerContract, null, 2) + "\n");'
```

## Tài nguyên còn cần

| Thành viên | Bàn giao để hoàn thiện |
|---|---|
| Danh — issue #9 | Migration/ERD Sprint 2, mapping ID/FK/trạng thái, agreement version và mẫu OpenAPI demo để nối repository và test PostgreSQL |
| Dũng — issue #6 | Chốt quyền chuyển trạng thái, contract Audit Log, version agreement và staging; Admin review/approve/publish thuộc Dũng |
| Vân — issue #10 | Acceptance/test case: hồ sơ hợp lệ, pricing quota/rate-limit, data classification, quy tắc nhập file và chuyển trạng thái |
| Hải Dương — issue #8 | Thống nhất form payload và hiển thị lỗi field; nhận contract trước, nhận API chạy thật sau khi nối schema |

Đề xuất giữ prefix `/api/provider` theo backend hiện hành. Frontend contract đang dùng prefix khác và trạng thái PENDING_REVIEW, trong khi backlog tách Submitted/Under Review: cần thống nhất mapping, không tự sửa frontend. Giá có currency ISO 4217, quota theo tháng, rateLimit theo giây; đơn vị và unlimited cần nhóm chốt. Data classification và giới hạn độ dài hiện là validation đề xuất. Agreement acceptedAt phải ghi bằng thời gian server khi persist, không cho client gửi. URL hồ sơ/baseUrl hiện chỉ lưu/validate HTTP(S), không fetch; nếu bổ sung fetch/gateway phải có kiểm tra SSRF riêng.

## Chưa hoàn thành Sprint 2

Chưa có repository/migration Sprint 2, HTTP upload/persistence/transaction, integration test Provider với PostgreSQL, bản staging hay QA sign-off. Cần nối ownership/verified checks vào mọi handler, kiểm tra state trong cùng transaction với write, lưu agreement version + thời điểm chấp nhận, chống thay đổi Draft trong lúc gửi duyệt. Những phần này thực hiện khi nhận schema, không thay schema của Danh hoặc phần frontend/Admin/DevOps của người khác. Issue #7 giữ mở và không đánh dấu DoD toàn bộ.
