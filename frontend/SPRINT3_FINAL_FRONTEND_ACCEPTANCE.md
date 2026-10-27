# Sprint 3 Final Frontend Acceptance Checklist

Date: 2026-10-27
Branch: `feature/sprint3-frontend-marketplace`
Environment: Node.js v22+, React 18, Vite 8, TypeScript 5.9, Playwright 1.64

---

## 1. Acceptance Criteria Checklist

### 1.1 Authentication & Role Authorization
- [x] Unauthenticated visitors prompted to log in when attempting privileged actions.
- [x] Consumer-specific routes enforce role check (`currentUser.role === 'USER'` / `'Consumer'`).
- [x] Provider and Admin roles restricted from claiming consumer-only sandbox grants or creating consumer keys.
- [x] Session invalidation event (`apihub:session-invalidated`) purges sensitive inputs, tokens, and active forms from browser memory.

### 1.2 Consumer API Key Management Lifecycle
- [x] Real backend integration with `/api/consumer/api-keys`.
- [x] List view supports card layout and table layout toggles.
- [x] Honest empty state rendered when 0 keys exist.
- [x] New key creation displays plaintext secret exactly once in a modal.
- [x] Plaintext keys are NEVER written to `localStorage`, `sessionStorage`, or cookies.
- [x] Key rotation warns user of immediate invalidation of prior key and displays newly rotated secret.
- [x] Key revocation requests explicit confirmation and invalidates key permanently.
- [x] Conflict handling (409) displays actionable message when key already exists for API.

### 1.3 Guided Sandbox & Authoritative Quota
- [x] Step 1 displays API authentication requirements and links to `/dashboard/keys`.
- [x] SafeProxy architecture and anti-SSRF protection clearly explained in UI.
- [x] API key input features password masking with view toggle; zero storage persistence.
- [x] Unclaimed sandbox grant requires explicit claim button click.
- [x] Quota display is strictly authoritative from backend (`remainingRequests`, `maxRequests`, `usedRequests`, `expiresAt`).
- [x] Quota exhaustion (0 remaining) displays clear "Exhausted" badge and disables request execution.
- [x] Step 3 provides cURL snippet with masked credentials and direct navigation to Playground.

### 1.4 Interactive Playground & Gateway Proxy
- [x] Real gateway proxy integration via `/api/marketplace/apis/:id/playground`.
- [x] Method selector, path input, and path parameter auto-detection (`{param}`).
- [x] Query parameter and header configuration inputs.
- [x] Headers filtered strictly to safe presentation headers (`accept`, `accept-language`, `content-type`).
- [x] JSON request body validation with format utility.
- [x] Live response inspection panel displays upstream status, latency in milliseconds, headers, and body.
- [x] Upstream 4xx/5xx status codes isolated from platform errors without crashing.
- [x] Remaining sandbox quota decrements authoritatively upon successful execution.
- [x] Code snippets available in cURL, Fetch, and Python with single-quote shell escaping.

### 1.5 Marketplace Catalog, Detail, Pricing, Compare & Navigation
- [x] Marketplace catalog supports category filtering, search debouncing, and Vietnamese diacritics.
- [x] Keyboard shortcut (Ctrl+K / Cmd+K) focuses search input.
- [x] Pagination bounds handle edge cases: 0 items, 1 item, 13 items, 50 items, 250 items.
- [x] Race condition resilience: delayed API responses do not overwrite newer queries.
- [x] API Detail renders badges, tabs, and version isolation without cross-version fallback.
- [x] Detail page report violation modal shows honest disabled state awaiting backend connection (`security@apihub.vn`).
- [x] Pricing page displays exact monthly fees without artificial discounts.
- [x] Annual billing button honestly disabled with Sprint 4 notice.
- [x] Compare APIs enforces self-comparison guard and three-state legal invariant ("Có" / "Không" / "Chưa công bố").
- [x] SPA navigation operates smoothly without hard page reloads.

### 1.6 Performance, Accessibility & Responsive Quality
- [x] 0px horizontal overflow across all 10 standard viewports (320px to 1920px).
- [x] Mobile drawer and hamburger navigation operate cleanly on narrow viewports.
- [x] Zero critical or serious WCAG 2.2 accessibility violations verified via axe-core.
- [x] Modal dialogs trap keyboard focus and dismiss upon Escape key.
- [x] Cumulative Layout Shift (CLS) is 0.000 (well within < 0.05 budget).
- [x] Catalog of 250 APIs renders within performance threshold.
- [x] Code-splitting chunk architecture prevents monolithic bundle creation.

### 1.7 Production Build & Repository Hygiene
- [x] `npm run build` in `frontend/` succeeds cleanly in < 2 seconds.
- [x] `npm run lint` in `frontend/` produces zero errors.
- [x] All 302 unit tests in `frontend/` pass cleanly.
- [x] All 101 Playwright E2E tests pass cleanly across 14 test suites.
- [x] `scripts/kiem-tra-kho-ma-nguon.ps1` reports 100% success on 324 repository files with zero unresolved conflict markers and zero trailing whitespaces.
- [x] GitHub Actions workflow `.github/workflows/ci.yml` triggers reviewed and verified.

---

## 2. Formal Sign-off Recommendation

The frontend implementation on `feature/sprint3-frontend-marketplace` satisfies all functional, architectural, security, and quality requirements defined for Sprint 3. The branch is in a ready state for integration testing and PR creation against `develop`.
