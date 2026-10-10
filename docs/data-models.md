# Data Models

> TypeScript types are the source of truth. All types live in `frontend/src/types/`.

---

## Core Types

### `UserRole`
```ts
type UserRole = 'USER' | 'API_PROVIDER' | 'ADMIN';
```

### `User`
```ts
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;    // ISO 8601
  isVerified?: boolean;
}
```

### `API`
```ts
interface API {
  id: string;
  name: string;
  description: string;
  category: string;
  providerId: string;       // User.id of the provider
  providerName: string;
  baseUrl: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
  tags: string[];
  plans: PricingPlan[];
  endpoints: Endpoint[];
  createdAt: string;
  publishedAt?: string;
  stats: {
    totalSubscribers: number;
    totalRequests: number;
    uptime: number;           // percentage
    avgLatencyMs: number;
  };
}
```

### `PricingPlan`
```ts
interface PricingPlan {
  id: string;
  apiId: string;
  name: string;              // e.g. "Free", "Starter", "Pro"
  priceMonthly: number;      // VND or base currency
  requestLimit: number;      // per month, -1 = unlimited
  rateLimit: number;         // per second
  features: string[];
}
```

### `Endpoint`
```ts
interface Endpoint {
  id: string;
  apiId: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;              // e.g. "/users/:id"
  description: string;
  parameters: Parameter[];
  responseExample?: string;  // JSON string
}

interface Parameter {
  name: string;
  in: 'path' | 'query' | 'body' | 'header';
  type: string;
  required: boolean;
  description?: string;
}
```

### `Subscription`
```ts
interface Subscription {
  id: string;
  consumerId: string;
  apiId: string;
  planId: string;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'SUSPENDED';
  startDate: string;
  renewalDate: string;
  apiKeyId: string;
}
```

### `ApiKey`
```ts
interface ApiKey {
  id: string;
  userId: string;
  subscriptionId: string;
  key: string;               // masked in UI: "sk_••••••••abcd"
  label: string;
  createdAt: string;
  lastUsedAt?: string;
  isActive: boolean;
}
```

### `UsageRecord`
```ts
interface UsageRecord {
  subscriptionId: string;
  apiId: string;
  periodStart: string;
  periodEnd: string;
  requestsUsed: number;
  requestsLimit: number;
  costIncurred: number;      // in VND
}
```

### `Notification`
```ts
interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
```

### `AuditLog`
```ts
interface AuditLog {
  id: string;
  actorId: string;           // who performed the action
  actorRole: UserRole;
  action: string;            // e.g. "USER_SUSPENDED", "API_APPROVED"
  targetId?: string;
  targetType?: 'USER' | 'API' | 'SUBSCRIPTION';
  detail: string;
  ip?: string;
  timestamp: string;
}
```

### `VerificationRequest`
```ts
interface VerificationRequest {
  id: string;
  providerId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  companyName: string;
  taxCode: string;
  documentUrls: string[];    // S3 or CDN URLs
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;       // admin User.id
  rejectReason?: string;
}
```

---

## Database Schema Suggestions (PostgreSQL)

```sql
-- users
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('USER','API_PROVIDER','ADMIN')),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- apis
CREATE TABLE apis (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id  UUID REFERENCES users(id),
  name         TEXT NOT NULL,
  description  TEXT,
  category     TEXT,
  base_url     TEXT,
  status       TEXT DEFAULT 'DRAFT',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- plans
CREATE TABLE plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id          UUID REFERENCES apis(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  price_monthly   NUMERIC NOT NULL DEFAULT 0,
  request_limit   INTEGER DEFAULT 1000,
  rate_limit      INTEGER DEFAULT 10
);

-- subscriptions
CREATE TABLE subscriptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id  UUID REFERENCES users(id),
  api_id       UUID REFERENCES apis(id),
  plan_id      UUID REFERENCES plans(id),
  status       TEXT DEFAULT 'ACTIVE',
  start_date   DATE NOT NULL,
  renewal_date DATE NOT NULL
);

-- api_keys
CREATE TABLE api_keys (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  subscription_id UUID REFERENCES subscriptions(id),
  key_hash        TEXT NOT NULL,   -- store hashed, never plaintext
  label           TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- audit_logs
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES users(id),
  action      TEXT NOT NULL,
  target_id   UUID,
  target_type TEXT,
  detail      TEXT,
  ip          INET,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```
