# API Hub — shared frontend design

Trạng thái: đã triển khai theo bộ Stitch người dùng cung cấp; không coi đây là xác nhận duyệt thiết kế cuối của người dùng.

## Một thiết kế xuyên suốt

Consumer, Provider và Admin chia sẻ một design system. Sự khác nhau là menu, quyền truy cập và nội dung công việc. Giữ nhất quán header, typography, spacing, button, input, card, table, badge, dialog, loading, error và empty state.

## Visual tokens

| Token | Giá trị |
| --- | --- |
| Page background | `#faf8ff` |
| Primary action | `#2a14b4` |
| Active navigation | `#4338ca` |
| Low surface / sidebar | `#f2f3ff` |
| Secondary surface | `#eaedff` |
| Text | `#131b2e` |
| Secondary text | `#464554` |
| Border | `#c7c4d7` |
| Error | `#ba1a1a` |
| Headlines | Geist |
| Body | DM Sans |
| Code / technical metrics | JetBrains Mono |
| Controls / cards | 4px / 8px radius |

Font được đóng gói local, không yêu cầu CDN font. Source icons dùng Material Symbols, shared shell dùng Lucide. Tránh thêm một bộ màu hoặc phong cách khác cho từng vai trò.

## Layout

- Header cao 64px. Public header: Explore APIs, Documentation, Pricing, Become a Provider, login/account.
- Workspace sidebar desktop rộng 248px. Nội dung bắt đầu sau sidebar; sidebar có menu đúng vai trò.
- Tablet thu sidebar về icon và giữ accessible labels. Mobile dùng menu có thể mở/đóng, nội dung một cột; table/code có vùng cuộn riêng.
- Public content tối đa 1280px. Marketplace có sidebar filter và grid hai cột; mobile dùng một cột.
- Form và wizard dùng panel nền trắng, label phía trên trường nhập, validation cạnh form. Wizard một bước tại một thời điểm.
- Modal có overlay, focus management, close/Escape. Action cần xác nhận có dialog rõ hậu quả.

## Các nhóm màn hình

| Nhóm | Nội dung |
| --- | --- |
| Public | Landing, catalog, compare, detail, documentation, playground, pricing |
| Authentication | Login, register, protected redirect, role checks, 403 |
| Consumer | Overview, subscriptions, keys, usage, requests, analytics, budget/alerts, reports, profile/settings, checkout |
| Provider | Overview/workspace, inventory, API wizard, import/docs, endpoints/versions, pricing plans, subscribers, analytics/health, revenue sandbox, verification/compliance, review workflow |
| Admin | Overview/console, users, providers, API reviews/catalog, subscriptions/payments sandbox, reports, monitoring, audit |
| Design QA | Components, validation/errors, responsive states, authentication lifecycle, try-before-subscribe |

## Trạng thái và tương tác

- Không đăng nhập: dẫn tới login kèm internal return path. Sai role: 403.
- Search/filter có empty state và reset. Filters Marketplace nằm trong URL.
- Async playground/checkout có loading và error/retry; pending payment có trạng thái theo dõi.
- Secret key chỉ hiện khi vừa tạo/rotate, không thể đọc lại khi đóng dialog.
- Draft, pending review, approved và published là các trạng thái riêng. Provider verified là điều kiện submit, Admin approval là điều kiện publish.
- API published mới có mặt trong Marketplace. Suspended không xuất hiện trong catalog.
- Tất cả demo data và mock charts được phân biệt với dữ liệu vận hành thật.
- Button có focus state, disabled state, thao tác bàn phím; reduced motion được tôn trọng.

## Khi nối backend

Giữ nguyên layout và component, thay lớp đọc/ghi local bằng contract thật. Role, token refresh, verification, payment, quota enforcement và upstream request phải do backend xác thực. Các quyết định UI không thay thế bảo mật phía server.
