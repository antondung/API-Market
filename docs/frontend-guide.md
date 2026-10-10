# Frontend Developer Guide

## Project Structure

```
frontend/
├── src/
│   ├── App.tsx                  # ← Root router. All routes defined here.
│   ├── main.tsx                 # React entry point
│   ├── index.css                # Global styles (Tailwind + design tokens)
│   │
│   ├── context/
│   │   ├── AuthContext.tsx      # Current user, isAuthenticated, switchRole (mock)
│   │   └── AppContext.tsx       # Global app state: APIs, notifications, localStorage
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── WorkspaceLayout.tsx   # Shared sidebar + header for all 3 workspaces
│   │   │   ├── PublicNavbar.tsx      # Header for public/marketplace pages
│   │   │   └── PublicFooter.tsx
│   │   └── ui/
│   │       ├── CustomSelect.tsx      # Styled <select> used in workspace switcher
│   │       ├── LanguageSwitcher.tsx  # VI/EN toggle
│   │       └── ...
│   │
│   ├── pages/
│   │   ├── marketplace/         # Public: MarketplacePage, ApiDetailPage, etc.
│   │   ├── auth/                # LoginPage, RegisterPage, 401/403 error pages
│   │   ├── checkout/            # CheckoutPage
│   │   ├── consumer/            # /dashboard/* pages
│   │   ├── provider/            # /provider/* pages
│   │   └── admin/               # /admin/* pages (ADMIN role only)
│   │
│   ├── data/
│   │   └── mockData.ts          # ⚠️ Mock users only — remove before production
│   │
│   ├── services/                # API call wrappers (currently unused / mock)
│   ├── types/                   # Shared TypeScript interfaces
│   └── i18n/                    # Language system
│       ├── index.ts             # useLanguage() hook + t() function
│       ├── vi.ts                # Vietnamese strings
│       ├── en.ts                # English strings
│       └── autoTranslator.ts    # DOM auto-translation for dynamic content
```

---

## State Management

### `AuthContext`

```tsx
// Usage in any component:
const { currentUser, isAuthenticated, switchRole } = useAuth();
```

- `currentUser` — the logged-in user object `{ id, name, email, role }`
- `isAuthenticated` — boolean
- `switchRole(role)` — **dev-only** convenience for role testing. Remove in production.
- `user` — alias for `currentUser`, used by `ProtectedRoute`

**To integrate real auth:** Replace the mock logic in `AuthContext.tsx` with JWT fetch calls. Keep the same exported interface so all consumers continue working without changes.

### `AppContext`

```tsx
const { apis, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
```

- `apis` — list of API objects (currently empty for prod release)
- `notifications` — in-app alerts/notifications array
- Persisted to `localStorage` with key `DATA_VERSION = 'v4_clean_production_release'`
- Bumping `DATA_VERSION` auto-clears stale cached data for all users on next load

---

## Adding a New Page

1. Create `src/pages/<workspace>/YourPage.tsx`
2. Import and add a `<Route>` in `App.tsx` inside the appropriate `ProtectedRoute` block
3. Add a nav item in `WorkspaceLayout.tsx` in the relevant nav array (`consumerNavItems`, `providerNavItems`, `adminNavItems`)
4. Add translation keys in `src/i18n/vi.ts` and `src/i18n/en.ts`

---

## Routing Conventions

- Consumer workspace: `/dashboard/*`
- Provider workspace: `/provider/*`
- Admin workspace: `/admin/*`
- Public: `/` `/marketplace` `/api/:id`

---

## Design System

Tailwind CSS v4 with custom design tokens defined in `index.css`:

| Token | Usage |
|-------|-------|
| `bg-surface` | Page background |
| `bg-surface-container-low` | Sidebar/card background |
| `text-on-surface` | Primary text |
| `text-on-surface-variant` | Secondary/muted text |
| `bg-primary` | Brand blue |
| `text-on-primary` | Text on brand blue |
| `bg-primary-container` | Light brand container |
| `text-on-primary-container` | Text in brand container |
| `border-outline-variant` | Subtle borders |
| `bg-error` | Error/danger red |

Icons: **Google Material Symbols** via CDN. Use `<span className="material-symbols-outlined">icon_name</span>`.

---

## Environment Variables

```env
# frontend/.env.local
VITE_API_BASE_URL=https://api.apihub.vn/v1
VITE_APP_NAME=API Hub
```

---

## Scripts

```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
npm run lint      # ESLint
```

---

## Known TODOs for Production

| Item | Location | Priority |
|------|---------|---------|
| Replace mock auth with JWT auth | `AuthContext.tsx`, `mockData.ts` | 🔴 Critical |
| Wire services to real API endpoints | `src/services/` | 🔴 Critical |
| Remove `SessionSimulatorPage` | `App.tsx` line 114 | 🟡 High |
| Remove `switchRole()` from header | `WorkspaceLayout.tsx` | 🟡 High |
| Add real pagination to lists | All list pages | 🟠 Medium |
| Connect OpenAPI file upload | `OpenApiImportPage.tsx` | 🟠 Medium |
| Add toast notifications system | Global | 🟢 Low |
