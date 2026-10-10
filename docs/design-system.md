# API HUB — Design System & UI/UX Architecture

> **Tài liệu đặc tả kiến trúc thiết kế (Design System & UI/UX Guidelines)** cho nền tảng **API Marketplace & Management Platform**.
> Được đúc kết và chuẩn hóa trực tiếp từ bộ mã thiết kế Stitch (`stitch_api_hub_design_system`), Material Design 3 tokens, và các tiêu chuẩn công nghệ SaaS hiện đại.

---

## 1. Triết lý Thiết kế (Design Philosophy)

1. **Developer-First & High Information Density**:
   - Giao diện tối ưu cho kỹ sư, chuyên gia dữ liệu và kiến trúc sư hệ thống.
   - Ưu tiên cấu trúc phân cấp thị giác rõ ràng, bảng biểu dữ liệu sắc nét, thông số kỹ thuật (Latency P95, Uptime, Throughput) trực quan, giảm thiểu khoảng trống lãng phí (dead whitespace).
2. **Control Plane vs Data Plane Visual Separation**:
   - **Control Plane** (Trang quản lý, Marketplace, Dashboard, Cài đặt): Sử dụng gam màu Indigo/Primary sang trọng, các thẻ Container với border tinh tế.
   - **Data Plane / Telemetry** (Gateway, Payload JSON, Request Logs, Quota): Sử dụng kiểu chữ Monospace, badge phương thức HTTP chuẩn (GET, POST, PUT, DELETE), và trạng thái màu theo chuẩn RFC-7807.
3. **Accessibility & Clarity (WCAG 2.1 AA)**:
   - Độ tương phản màu sắc cao trên cả nền sáng và tối.
   - Trạng thái phản hồi rõ ràng (Hover, Active, Focus Ring, Disabled, Loading shimmer).
   - Che mờ dữ liệu nhạy cảm (Sensitive Masking / Redaction) đối với Token, Secret Key và Password theo yêu cầu bảo mật US-24.

---

## 2. Bảng Màu & Design Tokens (Color Palette & Tokens)

Hệ thống màu sắc sử dụng biến thể HSL & Tailwind tokens kế thừa từ Material 3:

### 2.1 Bảng màu cốt lõi (Core Brand & Surfaces)

| Token Tailwind | Mã màu Hex / Giá trị | Ý nghĩa & Vị trí sử dụng |
|---|---|---|
| `bg-primary` | `#4f46e5` (Indigo 600) | Màu thương hiệu chính, nút CTA, thanh tiến trình hoạt động |
| `text-primary` | `#4f46e5` / `#6366f1` | Tiêu đề điểm nhấn, link điều hướng active, icon thương hiệu |
| `bg-primary-container` | `#e0e7ff` / `#ede9fe` | Nền container nhấn nhẹ, tag phiên bản, badge vai trò |
| `text-on-primary-container` | `#3730a3` | Văn bản trên nền container nhấn |
| `bg-surface` | `#ffffff` / `#f8fafc` | Nền trang tổng thể (Light Mode) |
| `bg-surface-container-low` | `#ffffff` | Nền thẻ Card, ô nội dung chính, bảng dữ liệu |
| `bg-surface-container` | `#f1f5f9` (Slate 100) | Nền phụ, header của table, thanh tìm kiếm |
| `bg-surface-container-high`| `#e2e8f0` (Slate 200) | Thanh đo hạn mức quota nền, viền input phụ |
| `text-on-surface` | `#0f172a` (Slate 900) | Văn bản chính, tiêu đề h1-h4, giá trị metric số |
| `text-on-surface-variant` | `#64748b` (Slate 500) | Văn bản phụ, nhãn mô tả, timestamp, label phụ |
| `border-outline-variant` | `rgba(203, 213, 225, 0.4)` | Đường viền mỏng ngăn cách Card, thanh ngăn Navbar |

### 2.2 Màu trạng thái nghiệp vụ (Status & Health Tokens)

| Trạng thái | Nền Badge (`bg-`) | Chữ Badge (`text-`) | Ứng dụng |
|---|---|---|---|
| **Success / Active / Healthy** | `bg-emerald-500/10` | `text-emerald-600` | API Active, 99.99% Uptime, Đã thanh toán, Domain Verified |
| **Warning / Review / Pending** | `bg-amber-500/10` | `text-amber-600` | Under Review, Chờ xác minh, Cảnh báo hạn mức 80% Cost Guard |
| **Danger / Outage / Suspended**| `bg-rose-500/10` | `text-rose-600` | API Suspended, Lỗi 500, Revoked Key, Vượt 100% Budget |
| **Info / Sandbox / Free Tier** | `bg-sky-500/10` | `text-sky-600` | Gói cước Free Tier, Sandbox simulated, Version Draft |

### 2.3 HTTP Method Badges

| Phương thức | Style |
|---|---|
| `GET` | `bg-emerald-500/10 text-emerald-700 border-emerald-500/30` |
| `POST` | `bg-blue-500/10 text-blue-700 border-blue-500/30` |
| `PUT` | `bg-amber-500/10 text-amber-700 border-amber-500/30` |
| `PATCH` | `bg-purple-500/10 text-purple-700 border-purple-500/30` |
| `DELETE` | `bg-rose-500/10 text-rose-700 border-rose-500/30` |

---

## 3. Hệ Thống Chữ (Typography Hierarchy)

Dự án phối hợp 2 họ phông chữ chuyên dụng:
- **UI & Display Font**: `Inter` / `Plus Jakarta Sans` — dùng cho tiêu đề, nhãn nút, văn bản đọc.
- **Code & Numeric Font**: `JetBrains Mono` / `Fira Code` (`font-mono`, `font-code-md`, `font-code-sm`) — dùng cho chỉ số đo lường, endpoint URL, JSON payload, cURL code và API Keys.

| Cấp bậc | Lớp CSS (Tailwind) | Kích thước & Trọng số | Vị trí áp dụng |
|---|---|---|---|
| **Display / Hero** | `text-4xl lg:text-5xl font-extrabold tracking-tight` | 36px–48px / 800 | Tiêu đề Hero trang chủ, Marketplace |
| **Headline Large** | `text-headline-lg font-bold text-on-surface` | 24px–28px / 700 | Tiêu đề chính trang Dashboard (`h1`) |
| **Headline Medium** | `text-headline-md font-bold text-on-surface` | 20px–22px / 700 | Tiêu đề các mục lớn (`h2`) |
| **Headline Small** | `text-headline-sm font-semibold` | 16px–18px / 600 | Tên thẻ Card API, Tiêu đề Widget (`h3`) |
| **Body Standard** | `text-body-md text-on-surface leading-relaxed` | 14px–15px / 400 | Đoạn văn mô tả, hướng dẫn |
| **Body Small** | `text-body-sm text-on-surface-variant` | 12px–13px / 400 | Mô tả phụ, nhãn bảng biểu, timestamp |
| **Code Metric Large**| `text-3xl font-extrabold font-code-md` | 30px / 800 (Mono) | Số đo lớn trên Bento Grid (48.2M, 99.98%) |
| **Code Inline** | `font-code-sm text-xs px-1.5 py-0.5 rounded bg-surface-container` | 11px–12px / 500 | Mã lỗi, key prefix, HTTP status |

---

## 4. Thư Viện Thành Phần UI Cốt Lõi (Core UI Components)

Các thành phần được tổ chức tập trung tại `frontend/src/components/ui/`:

### 4.1 Button (`<Button />`)
- **Biến thể**:
  - `primary`: Nền `bg-primary`, chữ trắng, shadow nhẹ. Thao tác chính (Tạo API, Đăng ký gói, Lưu).
  - `secondary`: Nền `bg-surface-container`, chữ `text-on-surface`, hover sáng hơn.
  - `outline`: Viền `border border-outline-variant`, nền trong suốt. Thao tác xuất file, xem thêm.
  - `ghost`: Trong suốt, chỉ hiện hover nền mờ. Dùng trong bảng biểu hoặc icon bấm nhanh.
  - `danger`: Nền `bg-rose-600` hoặc viền đỏ. Thao tác nguy hiểm: Thu hồi khóa (Revoke), Khóa tài khoản, Xóa API.
- **Tính năng mở rộng**:
  - `loading`: Hiện spinner xoay tròn, vô hiệu hóa click tạm thời.
  - `icon`: Tích hợp icon Google Material Symbols trước hoặc sau nhãn.

### 4.2 Badge & Status Indicators (`<StatusBadge />`, `<MethodBadge />`)
- Tự động nhận diện trạng thái và trả về màu sắc chuẩn:
  - `Active` $\to$ Xanh lá (Emerald)
  - `UnderReview`, `Submitted`, `Pending` $\to$ Vàng cam (Amber)
  - `Suspended`, `Locked`, `Revoked` $\to$ Đỏ hồng (Rose)
  - `Draft` $\to$ Xám đá (Slate)

### 4.3 Card & Bento Grid (`<Card />`)
- Bo góc hiện đại `rounded-2xl`, viền mỏng tinh tế `border border-outline-variant/30`, đổ bóng mềm `shadow-sm`.
- Hỗ trợ tiêu đề header, subtitle, action buttons bên góc phải và phần footer chân thẻ.

### 4.4 Modal & Confirmation Dialogs (`<Modal />`)
- Hiệu ứng mở mượt mà với lớp kính mờ phía sau (`backdrop-blur-md bg-black/40`).
- Hỗ trợ đóng bằng phím ESC, click ra ngoài vùng modal, hoặc nút bấm "Hủy".
- Được sử dụng trong: Xem khóa API 1 lần duy nhất, Hộp thoại xác nhận thu hồi khóa, Popup tạo sản phẩm API.

### 4.5 Language Switcher (`<LanguageSwitcher />`)
- Hỗ trợ chuyển đổi tức thì giữa Tiếng Việt (🇻🇳) và Tiếng Anh (🇬🇧).
- Ghi nhớ lựa chọn trong `localStorage` và phát sinh sự kiện đồng bộ toàn hệ thống.

---

## 5. Quy Chuẩn Bố Cục & Khoảng Cách (Layout & Spacing Standards)

### 5.1 Thanh Điều Hướng Công Khai (Public Navbar)
- Cố định trên đỉnh: `fixed top-0 left-0 w-full z-50 h-16 bg-surface/90 backdrop-blur-xl`.
- Độ rộng khung chứa tối đa: `max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8`.
- Cấu trúc thanh điều hướng:
  1. **Logo & Thương hiệu**: Icon `hub` + Chữ `API HUB Marketplace`.
  2. **Liên kết nghiệp vụ**: `Khám phá API`, `So sánh`, `Bảng giá`.
  3. **Khu vực chức năng bên phải**: Nút chọn ngôn ngữ $\to$ Selector chuyển đổi vai trò nhanh (Consumer/Provider/Admin) $\to$ Nút bấm vào Không gian làm việc (`Bảng điều khiển`).
- **Quy tắc vàng**: Tất cả các phần tử trên Navbar đều có cờ `whitespace-nowrap flex-shrink-0` để **tuyệt đối không bao giờ bị nhảy thành 2 hàng**.

### 5.2 Sidebar & Lưới Thẻ Marketplace
- **Sidebar Bộ lọc**: Độ rộng chuẩn `w-full lg:w-[280px] xl:w-[300px]`, đảm bảo các danh mục tiếng Việt không bị cắt cụt hay hiện dấu ba chấm (`...`).
- **Lưới thẻ API**: Bố trí 2 cột trên màn hình Desktop lớn (`grid-cols-1 xl:grid-cols-2 gap-6`).
- **Thanh đo lường 3 cột trên Card**:
  - Cột 1: `Độ trễ P95`
  - Cột 2: `Độ ổn định` (ngăn bởi `border-x border-outline-variant/20`)
  - Cột 3: `Lượt gọi / tháng`

### 5.3 Không Gian Làm Việc (Workspace Layout)
- **Sidebar điều hướng nội bộ**:
  - Mở rộng: `w-[280px]` cố định.
  - Thu gọn (Collapsed): `w-[72px]`.
- **Thanh tiêu đề Workspace Top Bar**: Chứa breadcrumbs điều hướng, thông báo cảnh báo thời gian thực và avatar tài khoản.

---

## 6. Xử Lý Trạng Thái & Phản Hồi Người Dùng (UX State Patterns)

Tuân thủ nghiêm ngặt tiêu chuẩn **RFC-7807 Problem Details**:

1. **Loading States**:
   - Sử dụng Shimmer skeleton hiệu ứng chuyển động nhẹ nhàng thay vì chỉ dùng spinner thô.
2. **Empty States**:
   - Bao gồm 3 thành phần: Icon minh họa mờ $\to$ Tiêu đề giải thích lý do trống $\to$ Nút bấm hành động (CTA) khắc phục (ví dụ: *"Chưa có API nào"* $\to$ *"Tạo API đầu tiên ngay"*).
3. **Error Boundaries & HTTP Codes**:
   - **401 Unauthorized**: Trang cảnh báo phiên hết hạn hoặc thiếu thông tin xác thực.
   - **403 Forbidden**: Trang từ chối truy cập RBAC (Consumer cố vào trang Admin hoặc Provider chưa xác minh cố tạo API).
   - **429 Rate Limit Exceeded**: Cảnh báo vượt quá tần suất gọi API hoặc hết lượt dùng thử Try Before Subscribe $\to$ Điều hướng tới nâng cấp gói cước.
   - **500 Gateway Error**: Màn hình lỗi hệ thống kèm mã Trace ID tra cứu.

---

## 7. Tiêu Chuẩn Quốc Tế Hóa (i18n Best Practices)

- **Từ điển trung tâm**: Quản lý trong `src/i18n/index.ts` kết hợp tệp `vi.json`.
- **Cơ chế dịch tự động an toàn**:
  - Loại trừ các thẻ icon `.material-symbols-outlined` để không làm hỏng glyph hiển thị.
  - Loại trừ các đoạn mã `<code>`, `<pre>`, và phần tử mang thuộc tính `data-no-translate="true"`.
  - Giữ nguyên các hashtag công nghệ của lập trình viên (`#Fintech`, `#PCI-DSS`, `#Reasoning`, `#JSON Mode`).
  - Dịch theo cụm từ SaaS chuyên nghiệp (ví dụ: `Trình thử nghiệm API` thay vì dịch thô từ `Playground`).
