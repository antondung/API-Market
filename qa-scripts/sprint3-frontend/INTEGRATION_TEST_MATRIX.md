# Sprint 3 Comprehensive Integration Test Matrix

Date: 2026-10-27
Branch: `feature/sprint3-frontend-marketplace`
Target Environment: Node.js v22+, Vitest v5, Playwright v1.64, Windows 11

---

## 1. Test Suite Summary & Execution Statistics

| Level | Framework | Command / Script | Tests Executed | Tests Passed | Pass Rate | Execution Duration |
|---|---|---|---|---|---|---|
| Backend Gateway Unit | Node.js Test Runner / tsx | `node --import tsx backend/test/gateway-unit.test.ts` | 2 | 2 | 100% | 8ms |
| Frontend Unit & Component | Vitest | `npm test -- --run` (in `frontend/`) | 302 | 302 | 100% | 54.3s |
| Playwright Smoke Suite | Playwright Chromium | `sprint3-frontend/run-smoke.ps1` | 13 | 13 | 100% | 1.1m |
| Playwright Functional Suite | Playwright Chromium | `sprint3-frontend/run-functional.ps1` | 47 | 47 | 100% | 1.7m |
| Playwright A11y Suite | Playwright / Axe-core | `sprint3-frontend/run-a11y.ps1` | 7 | 7 | 100% | 23.8s |
| Playwright Visual & Viewports | Playwright Chromium | `sprint3-frontend/run-visual.ps1` | 31 | 31 | 100% | 1.1m |
| Playwright Full QA Suite | Playwright Chromium | `sprint3-frontend/run-full.ps1` | 101 | 101 | 100% | 4.0m |
| Repository Quality Verification | PowerShell | `scripts/kiem-tra-kho-ma-nguon.ps1` | 324 files | 324 files | 100% | 3s |

---

## 2. Detailed Breakdown by Playwright Test Suite (14 Suites)

| Suite File | Description | Test Count | Pass Status | Key Scenarios Verified |
|---|---|---|---|---|
| `01-marketplace.spec.ts` | Marketplace Catalog & Search | 10 | PASS | Skeleton loader, category filters, debounced search, Vietnamese diacritics, pagination edge cases (0, 1, 13, 50, 250), race condition handling, Ctrl+K shortcut. |
| `02-api-detail.spec.ts` | API Detail & Versioning | 6 | PASS | Badges, tags, documentation viewer, version isolation without fallback, honest empty docs, 404/429/500 resilience. |
| `03-api-playground.spec.ts` | Interactive API Playground | 6 | PASS | Endpoint selection, path parameters, cURL/Fetch/Python snippet generation, key masking, anti-SSRF verification, content-type preservation. |
| `04-try-sandbox.spec.ts` | Guided 3-Step Sandbox | 4 | PASS | 3-step wizard, credential validation, honest Sprint 4 disabled status, snippet generation. |
| `05-pricing.spec.ts` | Pricing Plans & Deep Links | 8 | PASS | Exact monthly prices, disabled annual toggle, grounded feature matrix, 404/429/500 retry recovery, stale response prevention. |
| `06-checkout.spec.ts` | Checkout & Subscriptions | 4 | PASS | Unauthenticated login prompt, matching plan and fee display, disabled payment activation, zero fake mutations. |
| `07-compare-apis.spec.ts` | Compare APIs | 5 | PASS | 2-slot comparison view, self-comparison guard banner, three-state legal invariant, partial 500 error isolation, deep link option synthesizer. |
| `08-navigation-layout.spec.ts` | Navigation & Layout | 4 | PASS | Desktop navbar, SPA transitions without reload, language toggle (VI/EN), 404 route handling. |
| `09-responsive-viewports.spec.ts` | Responsive Viewport Matrix | 31 | PASS | Zero horizontal overflow across 10 viewports (320px to 1920px), mobile hamburger and drawer navigation. |
| `10-motion-animation.spec.ts` | Motion & Transitions | 4 | PASS | PageReveal entry animations, AnimatedTabs indicator, AnimatedCard hover elevation, reduced motion support. |
| `11-accessibility-wcag.spec.ts` | Accessibility (WCAG 2.2) | 7 | PASS | Axe-core audits on 5 main routes, keyboard journey across search/cards, modal dialog focus trap and Escape key dismissal. |
| `12-network-resilience.spec.ts` | Network Resilience | 5 | PASS | Slow network loading states, offline banner detection, retry recovery on 500/502/503 errors. |
| `13-security-data-integrity.spec.ts` | Security & Data Integrity | 3 | PASS | Zero plaintext key in localStorage/sessionStorage/cookies, masked input fields, session invalidation memory purge. |
| `14-performance-resource-budgets.spec.ts` | Performance & Budgets | 4 | PASS | CLS < 0.05, code splitting chunk architecture, rapid navigation memory leak prevention, 250 API render speed. |

---

## 3. Frontend Vitest Coverage Breakdown

- Total Test Files: 30
- Total Tests: 302 passed
- Key Core Integration Test Files:
  * `frontend/src/pages/consumer/ApiKeysPage.test.tsx` (5 tests): Empty state, list rendering, one-time reveal, 409 conflict, rotation, revocation.
  * `frontend/src/pages/marketplace/TrySandboxPage.test.tsx` (10 tests): Zero fake credentials, password masking, zero storage persistence, `/dashboard/keys` link, masked snippets, memory purge, unclaimed grant claim, authoritative quota exhaustion, SafeProxy explanation.
  * `frontend/src/pages/marketplace/ApiPlaygroundPage.test.tsx` (9 tests): Endpoint rendering, path params, real backend proxy execution, upstream 500 error isolation, role and quota disabling, snippet switching, endpoint reset, key opt-in, session invalidation.
  * `frontend/src/utils/apiSnippetGenerator.test.ts` (27 tests): POSIX escaping, CRLF sanitization, query strings, headers, multi-language snippets.
  * Plus 26 additional component and service test suites across the marketplace, provider, and admin domains.
