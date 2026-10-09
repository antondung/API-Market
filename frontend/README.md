# API Hub — React + TypeScript frontend

Frontend triển khai từ 48 màn hình trong `../stitch_api_hub_design_system`. Landing, Marketplace và các workspace Consumer / Provider / Admin dùng chung màu sắc, typography, header, sidebar và component.

## Chạy ứng dụng

Cần Node.js 22.12+ hoặc Node.js 24 và npm.

```powershell
cd C:\Users\duwn\Documents\api-market\frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Mở http://127.0.0.1:5173. Mặc định `.env.example` kết nối backend tại cổng 3000. Đăng ký Consumer/Provider, rồi đăng nhập bằng tài khoản thật. Vai trò Admin phải do backend cấp. Muốn xem demo độc lập, đặt `VITE_API_BASE_URL=` rồi khởi động lại ứng dụng. **Tất cả màn hình / All screens** trên desktop liệt kê các màn hình.

```powershell
npm run build
npm run preview
npm test
npm run typecheck
```

`dist/` là bản build static. Khi deploy, cấu hình server trả `index.html` cho các URL của React Router.

## Những luồng đã triển khai

- Đăng ký / đăng nhập backend, lấy danh tính và vai trò từ `/api/auth/me`, kiểm tra workspace bằng `/api/access/*`, refresh token có rotation, đăng xuất và chuyển tiếp nội bộ. Chỉ cho chọn Consumer/Provider khi đăng ký; không tự cấp quyền Admin.
- Marketplace: tìm kiếm, lọc category / pricing / auth, sort, grid/list, trạng thái không có kết quả, so sánh tối đa 4 API, API detail và chọn plan.
- Documentation: tìm mục, endpoint explorer, authentication, rate limits, error codes, cURL / TypeScript / Python snippets, copy và mở playground. API do Provider xuất bản dùng contract đã import.
- Playground: method/path, JSON body, headers, query, lựa chọn credential demo, loading/cancel, success/401/429/500/504, response/cURL và lịch sử request.
- Checkout: success / failure / pending sandbox; subscriptions: đổi plan, hoàn tất pending, hủy và quản lý key.
- API keys: tạo, hiển thị secret một lần, copy, rotate giữ nguyên API/tên, revoke, search. Secret đầy đủ chỉ ở memory, không lưu localStorage.
- Profile và account; budget/thresholds; notification read state; gửi report và theo dõi moderation.
- Provider: wizard 6 bước, draft persistence, OpenAPI JSON/YAML import, validation, endpoint preview, tạo draft từ specification, endpoint/version CRUD, plan CRUD, organization/domain verification, compliance declaration.
- Workflow Provider → Admin: submitted verification → verified → API pending review → approved → published → xuất hiện trên Marketplace; suspend API làm API biến mất khỏi catalog công khai. Quyết định được ghi audit; rejection/suspension yêu cầu lý do.
- Admin: demo user CRUD/status/archive, provider approval, API approval/publishing queue, catalog/subscriptions, report moderation, audit search/pagination/export.
- Các dashboard, usage, analytics, subscriber, payment sandbox và monitoring giữ bố cục từ Stitch với sample charts/tables. Các controls trên màn hình nguồn có xử lý điều hướng, search/filter, tabs, copy/export và dialog demo; không thực hiện vận hành gateway thật.
- Component/state/responsive/auth UX showcase từ bộ Stitch có route riêng trong `/design/*` để kiểm tra trạng thái thiết kế.

## Giới hạn tích hợp hiện tại

Backend trong repository cung cấp xác thực Sprint 1, đã nối đủ các endpoint trong `src/lib/auth-api.ts`. Xem `BACKEND_INTEGRATION.md` và `BAO-CAO-FRONTEND.md` để biết phạm vi, cách chạy và kiểm thử.

Marketplace, khóa API, thanh toán, báo cáo vi phạm, Provider workflow và analytics vẫn là demo do backend chưa có endpoint. Dữ liệu sandbox được lưu ở `api-hub-demo-data-v1`, dùng chung trong trình duyệt; không chứa dữ liệu nghiệp vụ từ backend. Trong chế độ kết nối, danh tính lấy từ backend và không thể sửa qua form hồ sơ.

Token lưu trong sessionStorage của tab, mật khẩu không lưu. Đây là giới hạn của hợp đồng Bearer hiện tại; token vẫn có rủi ro bị đọc nếu xảy ra XSS. Chưa có password reset, account deletion, DNS verification, upstream gateway hoặc thanh toán thật.

`src/lib/api-client.ts` cung cấp transport có error/AbortSignal/credentials; nó chưa được nối vào các feature. Đặt `VITE_API_BASE_URL` chỉ cấu hình transport, **không tự chuyển toàn bộ ứng dụng sang backend**. Khi có contract, thay các local mutations/reads trong feature bằng endpoint thật và dùng server trả role/status/permissions.

Các nhóm endpoint cần thống nhất với backend: auth/session/profile; catalog/spec/compare; subscriptions/payment status; key lifecycle; playground/gateway/logs; usage/analytics/budget/notifications; provider verification/API drafts/endpoints/plans/reviews; admin users/providers/moderation/audit/monitoring. Backend phải xác thực lại mọi quyền và thao tác nhạy cảm.

## Cấu trúc để FE tiếp tục phát triển

- `src/App.tsx`: route table, protection và feature overrides.
- `src/components/`: shell và component dùng chung; dialogs dùng Radix để quản lý focus/Escape.
- `src/features/`: logic React cho các luồng thực tế của demo.
- `src/lib/`: models, seed data, validation và transport.
- `src/screens/`: 48 screen conversions + manifest nguồn/route.
- `src/styles.css`, `tailwind.config.cjs`: shared design tokens/responsive.
- `src/test/`: route coverage, role boundaries, contract/quota validation và các mutation quan trọng.
- `scripts/import-stitch.py`: converter có thể tái tạo các màn hình nguồn. Cần Python + beautifulsoup4; chỉ dùng khi cập nhật Stitch exports. Script không chạy JavaScript trong HTML nguồn và không ghi đè feature React.
- `DESIGN.md`: quy tắc thiết kế chung. `SCREEN_COVERAGE.md`: ánh xạ đầy đủ source → route.

## Cách duyệt luồng xuất bản

1. Provider → Verification: gửi organization/domain.
2. Change demo role → Admin → Providers: duyệt organization.
3. Provider → Create API: hoàn thành wizard; Submit for review.
4. Admin → API Reviews: Approve API.
5. Provider → My APIs: Publish API và xác nhận.
6. Marketplace: tìm API mới, đọc contract, thử playground.

Để trở về seed ban đầu, xóa hai key localStorage có tên ở trên trong công cụ của trình duyệt rồi tải lại. Việc này chỉ xóa dữ liệu demo của API Hub.

## Tiếng Việt / English

Bộ chọn ngôn ngữ ở thanh đầu trang áp dụng cho tất cả màn hình, nhãn biểu mẫu, lỗi nhập liệu, trạng thái, thông báo, hộp thoại, nhãn hỗ trợ đọc màn hình và tiêu đề trình duyệt. Mặc định là tiếng Việt. Lựa chọn được lưu tại `api-hub-language`, giữ nguyên khi chuyển trang hoặc tải lại. Ngày và số liệu động dùng locale `vi-VN` / `en-US`; đơn vị giá vẫn là USD.

- `src/i18n/index.ts`: chuyển ngôn ngữ, nội suy nội dung động và locale.
- `src/i18n/vi.json`: từ điển tiếng Việt; nội dung tiếng Anh nằm trực tiếp tại nơi sử dụng `t(...)` / `actions.text(...)`.
- `src/i18n/vi-overrides.json`: thuật ngữ và câu đã biên tập; sau khi sửa, chạy `scripts/review-catalog.py` bằng Python.
- `scripts/audit-localization.mjs`: kiểm tra nội dung tĩnh được gọi dịch có trong từ điển. Chạy `npm run check:translations`.

Bản dịch nằm trong mã nguồn; ứng dụng không gọi dịch vụ dịch thuật lúc chạy. Tên sản phẩm, nội dung người dùng nhập, đặc tả API, URL, mã nguồn và giá trị của lựa chọn gửi vào logic được giữ nguyên. Khi thêm nội dung, bọc nhãn hiển thị bằng `t(...)`, bổ sung bản Việt tương ứng; dùng `useLanguage()` trong component để cập nhật ngay khi đổi ngôn ngữ. Không dùng chuỗi đã dịch làm trạng thái hay ID nghiệp vụ.
# Bổ sung nội dung từ bộ 45 prompt

Xem [PROMPT_COVERAGE.md](./PROMPT_COVERAGE.md) để đối chiếu yêu cầu, các luồng bổ sung và các phần cần backend. Thiết kế hiện tại được giữ; bộ màu và layout mới trong prompt không được áp dụng. Dashboard, request history, quota, giao dịch sandbox và notification center dùng dữ liệu demo chung.
