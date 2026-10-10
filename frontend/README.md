# API HUB — Frontend Application

> **Nền tảng giao diện người dùng API Marketplace & Management Platform**
> Xây dựng bằng **React 19**, **TypeScript**, **Vite** và **Tailwind CSS**, tuân thủ nghiêm ngặt theo tài liệu phân công nhiệm vụ ([Nhóm LLM.md](file:///c:/Users/duwn/Documents/api-hub/Nh%C3%B3m%20LLM.md)), đặc tả kiến trúc ([docs_01.md](file:///c:/Users/duwn/Documents/api-hub/docs_01.md), [docs_02.md](file:///c:/Users/duwn/Documents/api-hub/docs_02.md), [docs_03.md](file:///c:/Users/duwn/Documents/api-hub/docs_03.md)), [DESIGN.md](file:///c:/Users/duwn/Documents/api-hub/DESIGN.md) và [Hợp đồng API Backend](file:///c:/Users/duwn/Documents/api-hub/FRONTEND_API_CONTRACT_AND_ARCHITECTURE.md).

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh (Quick Start)

### 1. Yêu cầu môi trường
- **Node.js**: >= 18.x (khuyến nghị Node 20+)
- **Package Manager**: `npm` hoặc `pnpm`

### 2. Cài đặt phụ thuộc & Chạy môi trường Dev
```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt các thư viện phụ thuộc
npm install

# Khởi chạy server phát triển cục bộ (mặc định tại http://127.0.0.1:5173)
npm run dev
```

### 3. Kiểm tra TypeScript & Đóng gói Production
```bash
# Kiểm tra toàn bộ kiểu dữ liệu và build ứng dụng
npm run build

# Xem trước bản build production
npm run preview
```

---

## 📚 Tài Liệu Hướng Dẫn Dành Cho Đội Ngũ Kỹ Thuật

| Tài liệu | Vị trí | Mục đích |
|---|---|---|
| **Đặc tả Hợp đồng API Backend & Cấu trúc** | [FRONTEND_API_CONTRACT_AND_ARCHITECTURE.md](file:///c:/Users/duwn/Documents/api-hub/FRONTEND_API_CONTRACT_AND_ARCHITECTURE.md) | **Dành riêng cho Backend & DB**: Đặc tả toàn bộ REST API endpoints, schemas, headers, status codes, mã lỗi RFC-7807, và cơ chế bảo mật khóa API. |
| **Hệ thống Thiết kế & UI Tokens** | [DESIGN.md](file:///c:/Users/duwn/Documents/api-hub/DESIGN.md) | **Dành cho Frontend & UX**: Hướng dẫn bảng màu Material 3 tokens, component library, quy chuẩn bố cục và typography. |
| **Kiến trúc Tổng thể Hệ thống** | [docs_01.md](file:///c:/Users/duwn/Documents/api-hub/docs_01.md) | Mô hình Control Plane vs Data Plane, Gateway routing và hạ tầng. |
| **Vai trò & Ma trận Phân quyền (RBAC)**| [docs_02.md](file:///c:/Users/duwn/Documents/api-hub/docs_02.md) | Ma trận phân quyền 3 vai trò: Consumer (`USER`), Provider (`API_PROVIDER`), Admin (`ADMIN`). |
| **Kế hoạch 5 Sprint chi tiết** | [docs_03.md](file:///c:/Users/duwn/Documents/api-hub/docs_03.md) | Phân công công việc theo từng sprint cho 5 thành viên trong nhóm. |

---

## 🏗️ Cấu Trúc Thư Mục Dự Án

```text
src/
├── components/         # Thư viện component tái sử dụng
│   ├── layout/         # PublicNavbar, PublicFooter, WorkspaceLayout, WorkspaceSidebar
│   └── ui/             # Button, Badge, Card, Modal, Input, LanguageSwitcher...
├── context/            # Quản lý trạng thái React Context
│   ├── AuthContext.tsx # Quản lý phiên đăng nhập, JWT tokens, RBAC & Role Switcher
│   └── AppContext.tsx  # Kho dữ liệu Mock APIs, Subscriptions, Keys, Request Logs, Budget
├── data/               # Dữ liệu mẫu khởi tạo ban đầu (seed data)
├── i18n/               # Hệ thống song ngữ thời gian thực (vi.json, index.ts, autoTranslator.ts)
├── pages/              # Toàn bộ màn hình chức năng của ứng dụng
│   ├── admin/          # Quản trị hệ thống (Users, Verifications, Reviews, Reports, Audit Logs...)
│   ├── auth/           # Đăng nhập, Đăng ký, JWT Simulator, Trang lỗi 401, 403
│   ├── consumer/       # Không gian Consumer (Subscriptions, Keys, Analytics, Cost Guard...)
│   ├── marketplace/    # Chợ API, Chi tiết API, Playground, Try Sandbox, So sánh, Pricing...
│   └── provider/       # Không gian Provider (Kho API, Wizard tạo API, OpenAPI Import, Pricing...)
├── services/           # Tầng kết nối mạng với Backend API
│   └── authApi.ts      # Client gọi API xác thực Sprint 1 (Login, Register, Refresh, Me...)
└── types/              # Khai báo TypeScript types chuẩn cho toàn bộ thực thể
    └── index.ts        # User, ApiItem, PricingPlan, Subscription, ApiKey, RequestLog...
```

---

## 🌐 Cấu Hình Kết Nối Backend Thực Tế

Tạo tệp `.env` trong thư mục `frontend/`:
```env
# URL trỏ tới máy chủ Backend REST API (mặc định cổng 3000)
VITE_API_BASE_URL=http://localhost:3000

# Bật/Tắt chế độ Mock Data dự phòng khi Backend chưa sẵn sàng
VITE_ENABLE_MOCK_FALLBACK=false
```

Khi Backend đang chạy, Frontend sẽ gửi header xác thực `Authorization: Bearer <accessToken>` và nhận về dữ liệu theo đúng chuẩn [FRONTEND_API_CONTRACT_AND_ARCHITECTURE.md](file:///c:/Users/duwn/Documents/api-hub/FRONTEND_API_CONTRACT_AND_ARCHITECTURE.md).
