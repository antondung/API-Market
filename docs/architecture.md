# System Architecture

## Overview

API Hub is a multi-role SaaS platform for publishing, discovering, and consuming APIs. It has three distinct user workspaces — **Consumer**, **Provider**, and **Admin** — each with dedicated dashboards, guarded by role-based route protection.

---

## Tech Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS v4 (custom design tokens) |
| State | React Context API (`AuthContext`, `AppContext`) |
| i18n | Custom translator (`/src/i18n`) + auto-translator |
| Icons | Google Material Symbols |

### Backend (expected, not yet implemented)
| Layer | Technology |
|-------|-----------|
| API server | REST (paths defined in [api-contracts.md](./api-contracts.md)) |
| Auth | JWT Bearer tokens |
| Database | PostgreSQL (suggested) |
| File storage | S3-compatible (for API OpenAPI spec uploads) |

---

## Repository Layout

```
api-hub/
├── frontend/                  # React application
│   ├── src/
│   │   ├── App.tsx            # Root router — all routes defined here
│   │   ├── context/
│   │   │   ├── AuthContext.tsx # Auth state, current user, role
│   │   │   └── AppContext.tsx  # App-wide state (notifications, APIs, etc.)
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── WorkspaceLayout.tsx   # Sidebar + header for all workspaces
│   │   │   │   ├── PublicNavbar.tsx
│   │   │   │   └── PublicFooter.tsx
│   │   │   └── ui/            # Reusable UI components
│   │   ├── pages/
│   │   │   ├── marketplace/   # Public pages
│   │   │   ├── auth/          # Login, Register, 401, 403
│   │   │   ├── consumer/      # /dashboard/*
│   │   │   ├── provider/      # /provider/*
│   │   │   └── admin/         # /admin/* (ADMIN role only)
│   │   ├── data/
│   │   │   └── mockData.ts    # Mock users for dev (replace with API calls)
│   │   ├── services/          # API call wrappers (to be wired to real backend)
│   │   ├── types/             # Shared TypeScript types
│   │   └── i18n/             # Language config + auto-translator
└── docs/                      # This documentation
```

---

## High-Level Data Flow

```
User visits /admin/*
    └─> ProtectedRoute (allowedRoles=['ADMIN'])
            ├─ Not authenticated → redirect /401
            ├─ Authenticated but not ADMIN → redirect /403
            └─ ADMIN ✓ → render WorkspaceLayout (admin) → AdminDashboardPage
```

---

## Access Control Summary

| Path prefix | Allowed roles |
|------------|--------------|
| `/` `/marketplace` `/api/*` | Public (no login required) |
| `/dashboard/*` | USER, API_PROVIDER, ADMIN |
| `/provider/*` | API_PROVIDER, ADMIN |
| `/admin/*` | **ADMIN only** |
| `/login` `/register` | Public |
| `/401` `/403` | Public |
