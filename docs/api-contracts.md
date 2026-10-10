# API Contracts — Frontend ↔ Backend

> All endpoints listed here are **expected by the frontend** but not yet implemented in the backend.
> Base URL convention: `https://api.apihub.vn/v1` (or env variable `VITE_API_BASE_URL`).

---

## Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | — | Login with email/password |
| POST | `/auth/register` | — | Register new account |
| POST | `/auth/refresh` | Refresh token | Refresh access token |
| POST | `/auth/logout` | Bearer | Logout / invalidate session |
| GET | `/auth/me` | Bearer | Get current user profile |

---

## Marketplace (Public)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/marketplace/apis` | — | List all published APIs (paginated, filterable) |
| GET | `/marketplace/apis/:id` | — | Get API detail |
| GET | `/marketplace/apis/:id/plans` | — | Get pricing plans for an API |
| GET | `/marketplace/apis/compare` | — | Compare multiple APIs by IDs (`?ids=a,b,c`) |

**Query params for listing:**
- `q` — full-text search
- `category` — filter by category
- `sortBy` — `popular | newest | price`
- `page`, `limit`

---

## Consumer Workspace

> All endpoints require `Bearer` token. User role: `USER` or above.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/consumer/subscriptions` | List my subscriptions |
| POST | `/consumer/subscriptions` | Subscribe to an API plan |
| DELETE | `/consumer/subscriptions/:id` | Cancel subscription |
| GET | `/consumer/api-keys` | List my API keys |
| POST | `/consumer/api-keys` | Generate new API key |
| DELETE | `/consumer/api-keys/:id` | Revoke API key |
| GET | `/consumer/usage` | Usage stats (current period) |
| GET | `/consumer/usage/history` | Historical usage per API |
| GET | `/consumer/cost-guard` | Cost guard settings & alerts |
| PUT | `/consumer/cost-guard` | Update cost guard limits |
| GET | `/consumer/requests` | Request history log |
| GET | `/consumer/profile` | Get profile |
| PUT | `/consumer/profile` | Update profile |

---

## Provider Workspace

> Requires `API_PROVIDER` or `ADMIN` role.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/provider/verification` | Get verification status |
| POST | `/provider/verification` | Submit verification documents |
| GET | `/provider/apis` | List my published APIs |
| POST | `/provider/apis` | Create new API |
| PUT | `/provider/apis/:id` | Update API metadata |
| DELETE | `/provider/apis/:id` | Delete (unpublish) API |
| GET | `/provider/apis/:id/endpoints` | List API endpoints |
| POST | `/provider/apis/:id/endpoints` | Add endpoint |
| PUT | `/provider/apis/:id/endpoints/:eid` | Update endpoint |
| DELETE | `/provider/apis/:id/endpoints/:eid` | Delete endpoint |
| POST | `/provider/apis/:id/import-openapi` | Import from OpenAPI spec (multipart) |
| GET | `/provider/apis/:id/plans` | List pricing plans |
| POST | `/provider/apis/:id/plans` | Create pricing plan |
| PUT | `/provider/apis/:id/plans/:pid` | Update plan |
| DELETE | `/provider/apis/:id/plans/:pid` | Delete plan |
| GET | `/provider/apis/:id/publish-status` | Get publishing workflow status |
| POST | `/provider/apis/:id/submit-review` | Submit API for review |
| GET | `/provider/subscribers` | List subscribers to my APIs |
| GET | `/provider/analytics` | Analytics & health metrics |

---

## Admin Console

> Requires `ADMIN` role.

### User Management

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/users` | List all users (paginated) |
| GET | `/admin/users/:id` | Get user detail |
| PUT | `/admin/users/:id/role` | Change user role |
| PUT | `/admin/users/:id/status` | Suspend / activate user |
| DELETE | `/admin/users/:id` | Delete user |

### Provider Verification Queue

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/verifications` | List pending verifications |
| GET | `/admin/verifications/:id` | Get verification detail |
| PUT | `/admin/verifications/:id/approve` | Approve verification |
| PUT | `/admin/verifications/:id/reject` | Reject with reason |

### API Reviews

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/api-reviews` | List APIs pending review |
| GET | `/admin/api-reviews/:id` | Get API review detail |
| PUT | `/admin/api-reviews/:id/approve` | Approve API for marketplace |
| PUT | `/admin/api-reviews/:id/reject` | Reject API |

### Reports & Moderation

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/reports` | List all reports |
| PUT | `/admin/reports/:id/resolve` | Mark report resolved |
| DELETE | `/admin/reports/:id` | Dismiss report |

### Subscription Monitoring (Ledger)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/subscriptions` | All subscriptions platform-wide |
| PUT | `/admin/subscriptions/:id/cancel` | Force cancel subscription |

### Audit Logs

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/audit-logs` | Query audit log entries |

**Query params:** `userId`, `action`, `from`, `to`, `page`, `limit`

### Gateway Operations

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/gateway/status` | Gateway health & status |
| GET | `/admin/gateway/metrics` | Real-time request metrics |
| PUT | `/admin/gateway/rate-limits` | Update global rate limit policy |
| POST | `/admin/gateway/cache/flush` | Flush gateway cache |

---

## Common Response Envelope

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this resource."
  }
}
```

### HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No content (delete) |
| 400 | Bad request / validation error |
| 401 | Unauthenticated |
| 403 | Forbidden (wrong role) |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 500 | Server error |
