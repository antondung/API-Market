# Kết quả kiểm thử lại Sprint 1 (Retest)

**Thời gian chạy:** 21:48:16 16/10/2026
**Môi trường Backend:** commit 81cc803 tại http://127.0.0.1:3000
**Tester:** Trần Hà Thảo Vân (@vuonghathaovan-gif)
**Refs:** #5

---

## Bảng kết quả 28 TC API

| TC | Mô tả | Kỳ vọng | Status thực tế | Response rút gọn (che secret) | Verdict | Thời gian | Giờ chạy |
|---|---|---|---|---|---|---|---|
| TC-03-01 | USER token gọi 3 guard | consumer→200, provider→403, admin→403 | — | consumer=200, provider=403, admin=403 | **✅ Pass** | 32ms | 21:47:35 |
| TC-03-02 | PROVIDER token gọi 3 guard | consumer→403, provider→200, admin→403 | — | consumer=403, provider=200, admin=403 | **✅ Pass** | 23ms | 21:47:35 |
| TC-03-03 | ADMIN token gọi 3 guard (RBAC chuẩn) | consumer→403, provider→403, admin→200 | — | consumer=403, provider=403, admin=200 | **✅ Pass** | 23ms | 21:47:35 |
| TC-03-04 | Không token gọi 3 guard | consumer→401, provider→401, admin→401 | — | consumer=401, provider=401, admin=401 | **✅ Pass** | 13ms | 21:47:35 |
| TC-03-05 | Token sai định dạng / JWT chữ ký lỗi → 401 | 401 Unauthorized | — | malformed→401; fake_jwt→401 | **✅ Pass** | 6ms | 21:47:35 |
| TC-04-01 | Admin xem danh sách user (phân trang & RBAC) | Admin→200 có items, USER→403, PROVIDER→403, no-token→401 | 200 | Admin=200 (count=2), USER=403, PROVIDER=403, NoToken=401 | **✅ Pass** | 17ms | 21:47:35 |
| TC-04-02 | Admin tìm kiếm user theo email (RBAC) | Admin→200 tìm thấy, USER→403, PROVIDER→403, no-token→401 | 200 | Admin=200 (found=true), USER=403, PROVIDER=403, NoToken=401 | **✅ Pass** | 12ms | 21:47:35 |
| TC-04-03 | Admin khóa user qua API (tài khoản test riêng) | PATCH→200, login→401, me→401, refresh→401, RBAC PATCH đúng | 200 | lock=200, login=401, me=401, refresh=401, RBAC=(403/403/401) | **✅ Pass** | 12ms | 21:47:35 |
| TC-04-04 | Admin mở khóa user qua API (tài khoản test riêng) | PATCH→200, login lại→200, token cũ vẫn→401 | 200 | unlock=200, loginAgain=200, oldMe=401 | **✅ Pass** | 9ms | 21:47:35 |
| TC-05-02 | Body JSON hỏng cú pháp → 400, không lộ stack trace | 400; không có "stack" | 400 | {"error":{"code":"INVALID_JSON","message":"Invalid JSON","requestId":"40fdcdb9-89a2-4aa8-ace7-91ee7a9ac6bb"}} | **✅ Pass** | 10ms | 21:47:35 |
| TC-05-03 | Body > 16kb → 413 hoặc 400 | 413 hoặc 400 | 413 | {"error":{"code":"PAYLOAD_TOO_LARGE","message":"Request body too large","requestId":"249e04d6-0ca4-4902-af74-6a4ffdd7... | **✅ Pass** | 4ms | 21:47:35 |
| TC-05-04 | Mật khẩu lưu dạng hash trong DB (toàn bộ bảng users) | Toàn bộ password_hash là hash (bcrypt/scrypt), không phải plaintext | 200 | total \| bcrypt_seed \| non_dollar2_count -------+-------------+------------------- 73 \| 5 \| 68 (1 row) | **✅ Pass** | 25ms | 21:47:35 |
| TC-05-05 | Log backend không chứa password/token/secret (toàn bộ log) | Log không chứa plaintext password hay raw JWT Bearer | 200 | Toàn bộ 71 dòng log sạch: không lộ plaintext password hay raw JWT Bearer | **✅ Pass** | 30ms | 21:47:35 |
| TC-01-01 | Đăng ký hợp lệ (Consumer) | 2xx; user role Consumer | 201 | {"data":{"id":"104","email":"tc0101-1792162055814-hln@test.local","role":"Consumer","name":"QA One"}} | **✅ Pass** | 46ms | 21:47:35 |
| TC-01-03 | Đăng ký email đã tồn tại | 409 Conflict | 409 | {"error":{"code":"EMAIL_EXISTS","message":"Email already registered","requestId":"d3facfec-fef6-4448-b130-09bd45c6698... | **✅ Pass** | 47ms | 21:47:35 |
| TC-01-04 | Biên độ dài mật khẩu (11/12/128/129) | 11→4xx, 12→2xx, 128→2xx, 129→4xx | — | pw11→400(✓), pw12→201(✓), pw128→201(✓), pw129→400(✓) | **✅ Pass** | 87ms | 21:47:35 |
| TC-01-05 | Đăng ký cố gán role ADMIN | 4xx từ chối hoặc role ≠ Admin | 400 | {"error":{"code":"VALIDATION_ERROR","message":"Invalid request","requestId":"40107d09-19be-4891-aaf4-c7ab974fa684","d... | **✅ Pass** | 3ms | 21:47:35 |
| TC-01-06 | Email trùng khác hoa/thường (USER@Example.com) | 409 Conflict | 409 | {"error":{"code":"EMAIL_EXISTS","message":"Email already registered","requestId":"3555be48-bf07-4cb0-b7fe-40fe5bdc2e5... | **✅ Pass** | 38ms | 21:47:36 |
| TC-01-07 | Email có khoảng trắng đầu/cuối | 409 (trim→trùng) hoặc 400/422 | 409 | {"error":{"code":"EMAIL_EXISTS","message":"Email already registered","requestId":"26489549-b80e-4240-ad9e-febe9ac031f... | **✅ Pass** | 59ms | 21:47:36 |
| TC-01-08 | Validation email sai định dạng & biên name (0/1/100/101) | Email sai→4xx; name 1-100→2xx; name 101→4xx | — | email=abc→400(✓), email=a@→400(✓), email=@b.com→400(✓), name=1char→201(✓), name=100char→201(✓), name=101char→400(✓) | **✅ Pass** | 88ms | 21:47:36 |
| TC-02-01 | Đăng nhập đúng → nhận token | 200; có accessToken + refreshToken | 200 | {"status":200,"hasAccess":true,"hasRefresh":true,"role":"Consumer"} | **✅ Pass** | 923ms | 21:47:51 |
| TC-02-02 | Đăng nhập sai mật khẩu | 401 Unauthorized | 401 | {"error":{"code":"UNAUTHORIZED","message":"Authentication failed","requestId":"89ab632a-0d33-4ef2-9c8e-d004e0df5cf6"}} | **✅ Pass** | 259ms | 21:47:52 |
| TC-02-03 | Email không tồn tại → 401 thông điệp chung | 401 Unauthorized (thông điệp chung) | 401 | {"error":{"code":"UNAUTHORIZED","message":"Authentication failed","requestId":"0bdf3232-32f7-4d14-a56b-cf747535b7cb"}} | **✅ Pass** | 37ms | 21:47:52 |
| TC-02-04 | Đăng xuất → token cũ bị chặn | logout→204; access cũ→401; refresh cũ→401 | — | logout=204; access_cũ=401; refresh_cũ=401 | **✅ Pass** | 15ms | 21:47:52 |
| TC-02-05 | Refresh token hợp lệ → cấp token mới | 200; có accessToken mới + refreshToken mới | 200 | {"hasNewAccess":true,"hasNewRefresh":true} | **✅ Pass** | 7ms | 21:47:52 |
| TC-02-06 | Dùng lại refresh token cũ (đã rotate) | 401 Unauthorized | 401 | {"error":{"code":"UNAUTHORIZED","message":"Authentication failed","requestId":"1d058d51-b721-4755-a026-f056ca15ddfa"}} | **✅ Pass** | 5ms | 21:47:52 |
| TC-02-07 | Tài khoản bị khóa qua SQL → login/token bị chặn (hồi quy) | login→401; token cũ→401 | — | login=401; token_me=401 | **✅ Pass** | 41ms | 21:47:53 |
| TC-05-01 | Rate limit: gửi 35 req liên tiếp → xuất hiện 429 từ req 31 | Req 1-30 khác 429, req 31-35 là 429 | 429 | 429 xuất hiện tại request #31. Toàn bộ req 31–35 đều trả 429. | **✅ Pass** | 1500ms | 21:48:16 |

---

## Tổng kết 28 TC API

| Kết quả | Số lượng |
|---|---|
| ✅ Pass | **28** |
| ❌ Fail | **0** |
| ⚠️ Lỗi script | **0** |
| 🔲 Not Run | **0** |
| **Tổng** | **28** |
