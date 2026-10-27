# Sprint 3 — Merge Lineage, Provenance & Architecture Report

Date: 2026-10-27
Target Branch: `feature/sprint3-frontend-marketplace`
Authoritative Remote: `https://github.com/antondung/API-Market.git`

---

## 1. Git Lineage & Merge Provenance

### 1.1 Core Commit Identifiers
- Target Branch: `feature/sprint3-frontend-marketplace`
- Remote `develop` Target SHA: `dce4c959f0a309cb44ead7a12c73d1b453a6689f` (contains PR #76, PR #77)
- Common Merge Base: `76ff829111f1bf3b9874ee368983f8022a13cd78`
- Merge Synchronization Commit: `c87793b` (merged with `--no-ff`)
- Merge Strategy: Non-fast-forward merge (`--no-ff`) preserving distinct commit history and author attribution.

### 1.2 Disjoint Commit Sets Verification
Prior to synchronization, commits on `develop` and `feature/sprint3-frontend-marketplace` were verified to be disjoint sets:
- `develop` contained backend core features: Consumer API key management, database migrations (006, 007), sandbox grants quota tracking, and authentication middleware.
- `feature/sprint3-frontend-marketplace` contained frontend pages, UI/UX polish, motion animations, and comprehensive 18-phase QA suites.
- By executing `git merge origin/develop --no-ff`, the commit histories were reconciled without destructive rebases, force-pushes, or overwriting frontend work.

---

## 2. Technical Evaluation of Unmerged Remote Branches

### 2.1 Branch: `origin/codex/sprint3-gateway` (Pull Request #78)
- Branch SHA: `19c2039583cdcd7eb873600edf55b2591e7e6eb3`
- Based On: `dce4c959f0a309cb44ead7a12c73d1b453a6689f`
- Purpose: Implement reverse proxy gateway for published APIs with API key validation, rate limiting, and quota enforcement.
- Quality & Defect Analysis:
  1. Express 5 Body Stream Consumption Bug:
     - Root Cause: In Express 5, when `express.json({ limit: '16kb' })` or `express.urlencoded()` runs globally prior to a raw streaming proxy route, it consumes the incoming socket stream (`IncomingMessage`). When the reverse proxy attempts to pipe `req` or read raw buffers, the stream has already been read and closed.
     - Remediation: The gateway route `/api/gateway/:apiId` must mount dedicated body parser middleware `express.raw({ type: '*/*', limit: '2mb' })` specifically on the gateway router BEFORE the global `express.json()` middleware in `app.ts`.
  2. Public Upstream Pinning Requirement:
     - To prevent arbitrary SSRF or routing through internal loopback/private subnets, upstreams must resolve to public IPs pinned at DNS lookup time, or use explicit sandbox mock targets.
- Decision: Integrated hardened gateway routing and unit tests into local workspace while maintaining strict PR separation on GitHub (PR #78 not self-merged on GitHub per safety rules).

### 2.2 Branch: `origin/feature/11-reports-suspended`
- Branch SHA: `0ce80decacfed1ea32afcfe938e3b5c2ad9646b0`
- Based On: `dce4c959f0a309cb44ead7a12c73d1b453a6689f`
- Scope: Migration 008 adding reports table and suspension flags, plus database integration tests.
- Status: Suspended / Pending review.
- Decision: Kept unmerged. Frontend `ApiDetailPage.tsx` maintains honest disabled state with clear user advisory (`security@apihub.vn`), avoiding any fake backend mock endpoints or premature database schema mutations.

---

## 3. Express 5 Gateway Architecture & SafeProxy Guarantees

### 3.1 Middleware Execution Order
```
Client Request
      │
      ▼
Helmet & Security Headers
      │
      ▼
CORS Configuration
      │
      ▼
Gateway Route (`/api/gateway/:apiId`)
  ├── express.raw({ type: '*/*', limit: '2mb' })  <-- PREVENTS STREAM DRAIN
  ├── Gateway API Key Validation (SHA-256)
  ├── Rate Limiter (sliding window per API Key)
  └── SafeProxy Upstream Forwarder
      │
      ▼ (Only for non-gateway routes)
express.json({ limit: '16kb' })
      │
      ▼
Standard Application Routers (/api/auth, /api/consumer, /api/marketplace)
```

### 3.2 SafeProxy Anti-SSRF Guarantees
1. DNS Pinning & Pre-Resolution:
   - All hostname lookups resolve all `A` and `AAAA` records using OS resolver.
   - Every resolved IP address is validated against `BlockList` containing:
     * `0.0.0.0/8`, `10.0.0.0/8`, `100.64.0.0/10`, `127.0.0.0/8`, `169.254.0.0/16`
     * `172.16.0.0/12`, `192.0.0.0/24`, `192.0.2.0/24`, `192.88.99.0/24`, `192.168.0.0/16`
     * `198.18.0.0/15`, `198.51.100.0/24`, `203.0.113.0/24`, `224.0.0.0/4`, `240.0.0.0/4`
     * `::/128`, `::1/128`, `::ffff:0:0/96`, `fe80::/10`, `fc00::/7`
   - Target socket connection is made strictly to the pinned, validated public IP address, preventing DNS rebinding attacks (TOCTOU).
2. Redirect Restrictions:
   - HTTP/HTTPS redirects (301, 302, 307, 308) are NOT automatically followed to prevent redirect-based SSRF into private networks.
3. Timeout & Resource Limits:
   - Maximum upstream connection timeout: 5,000ms.
   - Overall request deadline: 10,000ms.
   - Request and response body size limit: 2MB.
4. Header Sanitization:
   - Strips internal headers (`x-user-id`, `x-user-role`, `authorization`, `cookie`) before proxying to third-party upstreams.
   - Forwarding presentation headers restricted to `accept`, `accept-language`, `content-type`.
