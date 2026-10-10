# Authentication & Role-Based Access Control

## Roles

| Role | Value | Description |
|------|-------|-------------|
| Consumer / Developer | `USER` | Can subscribe to APIs, manage API keys, view usage |
| API Provider | `API_PROVIDER` | Can publish APIs, manage endpoints, view analytics |
| System Administrator | `ADMIN` | Full platform access — user management, moderation, gateway ops |

---

## Current Auth (Mock — Development Only)

> ⚠️ The current frontend uses **mock authentication** via `AuthContext.tsx`. All user accounts are defined in `src/data/mockData.ts`. **This must be replaced by real JWT-based auth before production.**

### Mock Users (defined in `mockData.ts`)

```ts
// These are placeholders — wipe after backend auth is ready
INITIAL_USERS = [
  { id: 'user-1', role: 'ADMIN',        name: 'Administrator', email: 'admin@apihub.vn' },
  { id: 'user-2', role: 'API_PROVIDER', name: 'API Provider',  email: 'provider@apihub.vn' },
  { id: 'user-3', role: 'USER',         name: 'Developer',     email: 'user@apihub.vn' },
]
```

### `AuthContext.tsx` API

```ts
const { currentUser, isAuthenticated, switchRole, user } = useAuth();

// currentUser: { id, name, email, role, ... }
// isAuthenticated: boolean
// switchRole(role: UserRole): void   — dev-only convenience
// user: same as currentUser (used by ProtectedRoute)
```

---

## Route Guards (`App.tsx`)

`ProtectedRoute` is a React Router v6 wrapper component. It reads the current user's role and redirects unauthorized requests.

```tsx
// In App.tsx
const ProtectedRoute: React.FC<{ allowedRoles?: UserRole[] }> = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated)
    return <Navigate to="/401" state={{ from: location.pathname }} replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role))
    return <Navigate to="/403" state={{ from: location.pathname }} replace />;

  return <Outlet />;
};
```

Usage in the route tree:

```tsx
// Admin routes — ADMIN only
<Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
  <Route element={<WorkspaceLayout workspace="admin"><Outlet /></WorkspaceLayout>}>
    <Route path="/admin" element={<AdminDashboardPage />} />
    ...
  </Route>
</Route>
```

---

## UI-Level Access Control

### Workspace Switcher (Sidebar header)

`WorkspaceLayout.tsx` conditionally renders the "Admin Console" option **only** when `currentUser.role === 'ADMIN'`:

```tsx
options={[
  { value: 'consumer', label: 'Consumer Workspace', icon: 'person' },
  { value: 'provider', label: 'Provider Workspace', icon: 'corporate_fare' },
  // Admin option hidden for non-admins:
  ...(currentUser.role === 'ADMIN'
    ? [{ value: 'admin', label: 'Admin Console', icon: 'shield_person' }]
    : []),
  { value: 'marketplace', label: 'Public Marketplace', icon: 'storefront' },
]}
```

### Role Clearance Pill (Header)

A colored pill displays the current user's role:
- 🛡️ **System Administrator** — `ADMIN`
- 🏢 **API Provider** — `API_PROVIDER`
- 👤 **Developer** — `USER`

---

## Backend Integration Requirements

When replacing mock auth with real auth, implement:

### `POST /auth/login`
**Request:**
```json
{ "email": "user@example.com", "password": "..." }
```
**Response:**
```json
{
  "accessToken": "<JWT>",
  "refreshToken": "<JWT>",
  "user": {
    "id": "uuid",
    "email": "...",
    "name": "...",
    "role": "USER | API_PROVIDER | ADMIN"
  }
}
```

### `POST /auth/refresh`
Accepts `refreshToken`, returns new `accessToken`.

### `POST /auth/logout`
Invalidates refresh token server-side.

### `GET /auth/me`
Returns current user profile from token.

---

## Integration Steps (Frontend)

1. Replace `AuthContext.tsx` mock logic with real `fetch`/axios calls.
2. Store `accessToken` in memory (not localStorage) and `refreshToken` in HttpOnly cookie.
3. Add an Axios/fetch interceptor that refreshes the token on 401 responses.
4. Remove `src/data/mockData.ts` INITIAL_USERS and `switchRole()` function after go-live.
5. Remove `SessionSimulatorPage` (`/auth/session-simulator`) — this is a dev-only tool.
