> Cập nhật tích hợp: xác thực backend Sprint 1 đã được nối. Các mô tả demo về đăng ký/đăng nhập bên dưới là lịch sử trước tích hợp; xem BACKEND_INTEGRATION.md và BAO-CAO-FRONTEND.md để biết trạng thái hiện tại. Các tính năng nghiệp vụ còn lại vẫn là demo.

# Đối chiếu nội dung bộ 45 prompt API HUB

Cập nhật: 09/10/2026. Nguồn: `API_HUB_Stitch_Prompts_Tung_45_files`.

Chỉ lấy yêu cầu về nội dung và luồng sử dụng. Giữ màu, font, sidebar, thẻ, bảng, form và dialog của frontend hiện tại. Không áp dụng bảng màu Indigo mới, các bố cục bắt buộc hoặc bộ theme trong prompt. Giao diện vẫn có Tiếng Việt / English; nội dung người dùng nhập, tên API, tên nhà cung cấp, mã HTTP và hợp đồng OpenAPI được giữ nguyên.

Đây là frontend demo có dữ liệu chung lưu trong trình duyệt. Bảng dưới mô tả nội dung đã có và đã bổ sung, không phải xác nhận backend production đã hoàn tất.

| Prompt | Nội dung / đường dẫn | Đối chiếu và thay đổi |
| --- | --- | --- |
| 00 | Hệ thống thành phần | Dùng hệ thống hiện tại, không lấy thiết kế của prompt. |
| 01 | Landing `/` | Giữ tìm kiếm, danh mục, API nổi bật, quy trình tích hợp, FAQ, CTA Provider đã có. |
| 02 | Marketplace `/marketplace` | Thêm lọc nhà cung cấp, xác minh, chip bỏ bộ lọc, phân trang, dialog bộ lọc mobile; trạng thái nằm trên URL. Không gắn huy hiệu xác minh mặc định. |
| 03 | So sánh `/compare` | Nối từ khay chọn Marketplace; bổ sung quota, rate limit, tình trạng thiếu dữ liệu hiệu năng và liên kết thử API. |
| 04 | Chi tiết `/apis/neural-llm?api=...` | Endpoint theo hợp đồng, base URL Provider, API không tồn tại và chặn nút thử/đăng ký khi không Published; liên kết báo cáo gắn API. |
| 05 | Tài liệu `/apis/neural-llm/docs?api=...` | Giữ quick start, tìm kiếm, auth, lỗi, snippets; thêm tham số, request body và response schema mở rộng từ OpenAPI. |
| 06 | Playground `/apis/neural-llm/playground?api=...` | Chỉ chọn endpoint đã đăng ký; kiểm tra method, JSON, trạng thái API; thêm 403, chế độ truy cập, response JSON/Text/Headers, copy/download và thông tin kích thước/thời gian mô phỏng. |
| 07 | Dùng thử | Trial / Subscription; không tự bịa hạn mức trial. Nếu API có trialLimit, hiển thị và kiểm tra số request đã dùng. |
| 08 | Giá `/pricing`, tab Pricing | Giữ plan, billing period, current plan; thống nhất quota/rate limit dùng trong các trang. Giá và ưu đãi đang là ví dụ sandbox. |
| 09 | Checkout `/checkout` | Lưu giao dịch thành công/thất bại/chờ, liên kết ID subscription; không kích hoạt khi thất bại; tổng kết quota/rate limit, không thu thập thẻ. |
| 10 | Auth `/login`, `/register` | Thêm xác nhận mật khẩu và chấp nhận điều khoản khi đăng ký. Forgot/reset password chỉ triển khai khi có backend hỗ trợ. |
| 11 | Tài khoản `/account` | Giữ sửa tên/email, vai trò, kết thúc phiên; thêm Cancel để khôi phục dữ liệu form. |
| 12 | Consumer `/app/overview` | Chuyển dashboard mẫu sang thống kê từ request sandbox, lọc API/thời gian và các shortcut. |
| 13 | Thuê bao `/app/subscriptions` | Thêm tìm kiếm, lọc trạng thái, quota/rate limit và shortcut API/Playground/Usage. Giữ đổi gói, hủy có xác nhận và kích hoạt pending sandbox. |
| 14 | Keys `/app/keys` | Thêm lọc API/trạng thái, định dạng last used; chỉ tạo key cho API Published có subscription Active. Giữ secret một lần, rotate/revoke và masked history. |
| 15 | Usage `/app/usage` | Tính request/thành công/lỗi/độ trễ từ sandbox; quota theo tháng tách rate limit theo phút, số còn lại và ngày reset. |
| 16 | Logs `/app/requests` | Bảng timestamp/API/method/path/status/duration, lọc API/method/date/result, tìm kiếm mã request và phân trang; dialog metadata an toàn. Không lưu body/header/secret. |
| 17 | Cost Guard `/app/cost-guard`, `/notifications` | Thêm chi phí gói mô phỏng theo API và tỷ lệ ngân sách. Inbox đọc/chưa đọc theo vai trò, timestamp và liên kết hành động từ sự kiện sandbox. |
| 18 | Xác minh `/provider/verification` | Thêm Individual/Organization, contact email, phone tùy chọn, giữ dữ liệu khi chỉnh sửa và phản hồi admin. DNS/evidence thực cần backend. |
| 19 | Provider `/provider/overview`, `/provider/apis` | Dashboard dựa trên dữ liệu demo; inventory thêm tìm kiếm/lọc trạng thái và lịch sử quyết định. |
| 20 | Wizard `/provider/apis/new` | Giữ 6 bước, draft, OpenAPI, auth, plan, compliance và gate Provider Verified trước submission. |
| 21 | Import `/provider/import` | Chọn file JSON/YAML, kiểm tra kích thước/cú pháp, preview và lưu draft. Import URL qua backend chưa có. |
| 22 | Endpoint `/provider/endpoints` | Thêm API, version, auth, request/response schema JSON, kiểm tra trùng method/path/version. Đây là metadata demo; thay đổi hợp đồng Published vẫn cần quy trình review. |
| 23 | Plan `/provider/plans` | Thêm API association, rate limit riêng, cảnh báo ảnh hưởng subscriber; plan Active được đưa vào checkout của API tương ứng. MVP dùng quota tháng. |
| 24 | Subscriber `/provider/subscribers` | Bảng tìm kiếm/lọc, chi tiết terms/limits, Suspend/Restore có lý do, confirmation và audit. |
| 25 | Provider `/provider/analytics`, `/provider/revenue` | Request/error/latency từ sandbox; giao dịch test có chi tiết activation. Live health không có thì hiển thị thiếu dữ liệu. Không có payout tiền thật. |
| 26 | Compliance `/provider/compliance` | Own-developed/third-party rights, evidence reference, data classification/categories, agreement version/time, TXT instruction và token copy. Không tự đánh dấu DNS Verified. |
| 27 | Publishing `/provider/review` | Thêm review checklist, audit history, feedback; reject/suspend/remove yêu cầu lý do; restore và public link theo trạng thái. |
| 28 | Admin `/admin/overview` | Tổng quan request sandbox và shortcut review/provider/report thay cho số liệu vận hành giả định. |
| 29 | Provider review `/admin/providers` | Bổ sung contact/type, feedback, Request More Information, Suspend/Restore có lý do. |
| 30 | API review `/admin/reviews`, `/admin/apis` | Review checklist, quyết định có lý do; suspend/restore catalog ảnh hưởng discovery, detail, checkout và Playground trong demo. |
| 31 | Users `/admin/users` | Thêm vai trò vào bản ghi quản lý; ghi rõ không cấp quyền server. Auth/RBAC thật phải lấy quyền từ backend. |
| 32 | Reports `/app/reports`, `/admin/reports` | Thêm API target, evidence URL, các nhóm ownership/privacy/illegal/dangerous, tìm kiếm; moderation suspend/restore có lý do và audit. |
| 33 | Transactions `/admin/payments`, `/admin/subscriptions` | Giao dịch test theo status, số tiền mô phỏng, timestamp, chi tiết activation; subscription controls dùng dữ liệu chung. |
| 34 | Monitoring `/admin/monitoring` | Lọc thời gian/API, request/success/errors/latency; không bịa uptime, worker hoặc incident. Drill-down `/admin/requests`. |
| 35 | Audit `/admin/audit` | Giữ nhật ký chỉ đọc, tìm kiếm/phân trang/export; thêm chi tiết bản ghi. Các quyết định mới ghi actor/reason/time. |
| 36 | Responsive và UX | Giữ responsive hiện tại; thêm bộ lọc mobile có focus/Escape qua Radix, bảng cuộn bên trong, progress cùng màu hiện tại; không áp dụng theme mới. |
| 37 | Đăng ký chi tiết | Consumer/Provider, confirm password, terms, inline validation, loading; không tự đăng ký Admin. |
| 38 | Return destination | Giữ safe returnTo, reject external redirect, điều hướng theo role và 403. |
| 39 | Phiên đăng nhập | Giữ local demo renewal/logout. Refresh/revoke/network auth thực cần backend; không lưu mật khẩu. |
| 40 | Role shells | Giữ 3 shell và protected routes; thêm request history theo role Provider/Admin. |
| 41 | UI states/components | Giữ gallery hiện tại; tái dùng Field/Button/Panel/Modal/AlertDialog cho các phần mới. |
| 42 | Validation/errors | Bổ sung password mismatch/terms, endpoint duplicate/schema, API unavailable, trial/quota/rate exhaustion và payment failure. Lỗi backend thực chưa thể mô phỏng thành xác thực thật. |
| 43 | Profile integration | Giữ read/update local, vai trò, account navigation; Cancel form. Không thêm dữ liệu cá nhân không cần thiết. |
| 44 | Connected journeys | Các test bao phủ route/role/language, protected redirect, checkout, draft, keys; thêm test các phần bổ sung và kiểm tra trình duyệt request → history → usage, mobile filter. |

## Dữ liệu demo dùng chung

- `requests`: chỉ ID, API, method/path, status, thời gian mô phỏng, timestamp, actor và access context. Request body và credential không được lưu.
- `transactions`: giao dịch sandbox, subscription association, giá trị mô phỏng và activation status.
- `notifications`: inbox theo role từ thao tác sandbox, có read/unread.
- Dữ liệu demo cũ vẫn được giữ; các collection mới mặc định là rỗng. Request cũ chỉ có audit text không được tự suy đoán thành metric mới.

## Những việc vẫn phụ thuộc backend / chính sách sản phẩm

JWT/cookie refresh và revoke; tạo tài khoản/duplicate email; password reset; multi-role grants; gateway thật; trial allocation; quota/rate limiter; DNS/evidence verification; version publication; billing/renewal/expiration; health checker/worker incidents; email notifications; phân quyền provider theo ownership; audit bất biến trên server; terms/legal được phê duyệt. Chúng không được đánh dấu là hoạt động production bởi frontend demo này.

Các tương tác nâng cao như import OpenAPI qua URL, tự động đổi version công khai, schema editor đầy đủ và rule Cost Guard chặn truy cập cần API/policy được chốt trước khi nối. Giá, plan và số liệu sandbox luôn được ghi rõ là mô phỏng.

## Kiểm tra

- `npm test`: route, role, locale và các luồng demo; các test bổ sung nằm trong `src/test/prompt-gaps.test.tsx`.
- `npm run check:translations`: kiểm tra nhãn tĩnh, placeholder và mục từ thiếu; các nhãn động mới được rà soát thêm trên trình duyệt.
- `npm run build`: TypeScript và build production.
- Browser: request thử → history → usage; Việt/Anh; mobile history không tràn trang; dialog lọc marketplace giữ URL và tên nhà cung cấp.
