# Backend — Sprint 1 / Issue #2

Node.js 22.14+, TypeScript, Express 5 và SQLite (`node:sqlite`). Backend đóng gói hai migration Auth của Danh trong `backend/migrations/`; không đổi tên bảng/cột. Nguồn schema là commit `5d784fc`. Sau khi thư mục migration gốc bị xóa trên `develop` tại commit `49fbc1e`, bản schema backend phụ thuộc được lưu cùng backend để checkout mới vẫn khởi tạo DB được. Node 22 hiện phát cảnh báo experimental cho module SQLite; CI dùng Node 22 để kiểm tra tương thích.

## Chạy local

```powershell
npm ci
npm run setup
npm run dev
```

`setup` tạo `.env` nếu chưa có, sinh secret và mật khẩu mẫu ngẫu nhiên, chạy migration và seed ba tài khoản. Không ghi đè `.env` có sẵn và không in secret vào log. Không copy nguyên `.env.example` với các giá trị placeholder; nếu tự cấu hình phải thay secret/mật khẩu.

Swagger: http://127.0.0.1:3000/docs — OpenAPI: http://127.0.0.1:3000/openapi.json.

DB mặc định: `data/api-market.sqlite`, dữ liệu và phiên còn sau restart. `JWT_SECRET` phải cố định qua restart; nếu đổi khóa, access token cũ bị vô hiệu. `.env` và DB local được Git ignore. Server tự migrate khi khởi động; có thể chạy riêng `npm run db:migrate`. Migration history có checksum, chỉ áp dụng mỗi script một lần và từ chối script đã áp dụng bị sửa.

## Tài khoản mẫu

| Vai trò | Email | Mật khẩu trong `.env` |
|---|---|---|
| Admin | `admin@example.test` | `SEED_ADMIN_PASSWORD` |
| Consumer | `consumer@example.test` | `SEED_CONSUMER_PASSWORD` |
| Provider | `provider@example.test` | `SEED_PROVIDER_PASSWORD` |

`npm run db:seed` tạo tài khoản thiếu, không reset mật khẩu hoặc dữ liệu có sẵn. Seed tài khoản chỉ dành cho local và bị chặn khi `NODE_ENV=production`. Migration của Danh chỉ seed vai trò; backend bổ sung seed tài khoản dùng hash mật khẩu.

## API bàn giao frontend

| Method | URL | Input / yêu cầu |
|---|---|---|
| POST | `/api/auth/register` | `email`, `password` (12–128 ký tự), `role` Consumer/Provider; `name` tùy chọn (1–120 ký tự) |
| POST | `/api/auth/login` | `email`, `password` |
| POST | `/api/auth/refresh` | `refreshToken` |
| POST | `/api/auth/logout` | Header `Authorization: Bearer <accessToken>` |
| GET | `/api/auth/me` | Header Bearer |
| GET | `/api/access/consumer`, `/api/access/provider`, `/api/access/admin` | Ví dụ guard: đúng vai trò trả 200, sai vai trò trả 403, thiếu/token sai trả 401 |

Đăng ký trả `201 {data: {id, name, email, role}}`; login/refresh trả `{data: {accessToken, refreshToken, tokenType, expiresIn, user}}`. Logout trả 204. Lỗi trả `{error: {code, message, requestId, details?}}`. ID là chuỗi, frontend không giả định UUID. Thiếu `name` dùng phần trước @ của email. Email được trim và chuyển lowercase. Provider signup tạo user và `api_providers` trong cùng transaction.

Mật khẩu dùng scrypt với salt ngẫu nhiên. Access JWT sống 15 phút; phiên refresh sống 7 ngày tính từ login, không kéo dài khi refresh. Refresh token ngẫu nhiên 256 bit, DB lưu SHA-256 và rotate một lần bằng câu UPDATE có điều kiện nguyên tử. Logout thu hồi toàn bộ phiên, chặn cả access token đã cấp. Mỗi lần xác thực kiểm tra DB user active và phiên chưa revoked/expired. Đăng ký công khai không cho tạo Admin. Sai mật khẩu, email không tồn tại và tài khoản khóa trả cùng lỗi đăng nhập chung.

## Mapping schema của Danh

| API role | Database role |
|---|---|
| Consumer | USER |
| Provider | API_PROVIDER |
| Admin | ADMIN |

`users.id` và `refresh_tokens.id` là INTEGER AUTOINCREMENT; JWT sub/sid dùng dạng chuỗi. `expires_at`, `revoked_at` do backend ghi theo UTC ISO 8601. Khi rotate giữ nguyên ID phiên và thời hạn, thay token_hash. Mọi kết nối bật foreign keys; WAL và busy timeout hỗ trợ các kết nối local. AuthStore được tách riêng để thay adapter khi nhóm cần đổi DB.

Log chỉ gồm request ID, method, route template, status và thời gian; không ghi request/response body, headers, query hay URL tùy ý. Auth giới hạn 30 request/phút/IP. Khi deploy nhiều instance cần thay limiter bằng Redis và chốt cấu hình trusted proxy. Frontend cần chốt cách lưu refresh token/cookie với Tech Lead trước tích hợp.

CORS phía backend cho phép origin chính xác qua `CORS_ORIGINS`, phân cách bằng dấu phẩy, ví dụ `http://localhost:5173,http://127.0.0.1:5173`. Local mặc định cho phép hai origin này nếu không đặt biến. Production mặc định không cho phép cross-origin nếu chưa cấu hình. Đặt biến rỗng để tắt cross-origin. Không dùng wildcard hoặc URL có path. Preflight hợp lệ trả 204, cho phép GET/POST/OPTIONS cùng Content-Type/Authorization; origin ngoài danh sách trả 403 `CORS_ORIGIN_DENIED`. Client không gửi Origin vẫn dùng Auth/RBAC bình thường; CORS không thay thế xác thực. Hiện dùng Bearer token, không bật cross-origin cookie credentials.

Body có encoding/charset không hỗ trợ trả 415 `UNSUPPORTED_ENCODING`/`UNSUPPORTED_CHARSET` theo format lỗi chung, thay vì 500.

## Kiểm tra và nghiệm thu

```powershell
npm run lint
npm test
npm run build
./scripts/kiem-tra-kho-ma-nguon.ps1
```

24 test kiểm tra HTTP Auth, unit AuthService, refresh đồng thời, logout/revocation, JWT hết hạn/giả mạo, cả ba vai trò, input sai, rate limit, log không chứa secret, migration DB trống/chạy lại, ràng buộc DB, provider profile, user khóa và persistence qua mở lại DB. Sáu test hồi quy bổ sung kiểm tra CORS preflight, header trên response lỗi, từ chối origin ngoài danh sách, allowlist rỗng/cấu hình sai, encoding và charset không hỗ trợ.

Backend Sprint 1 đã triển khai và kiểm tra local. Còn cần CI của PR, review, QA chốt Role Matrix và kiểm thử môi trường tích hợp trước khi đánh dấu issue #2 hoàn tất. Các route `/api/access/*` minh họa guard; áp dụng cùng guard cho các route nghiệp vụ khi được bổ sung.
