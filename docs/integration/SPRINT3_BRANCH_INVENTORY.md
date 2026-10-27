# Sprint 3 — Repository Forensics & Branch Inventory

Ghi nhận ngày: 27/10/2026
Mục tiêu: Đánh giá snapshot, đối chiếu branch & contract trước khi hợp nhất vào `feature/sprint3-frontend-marketplace`.

---

## 1. Repository Snapshot Forensics (Phase 0)

| Chỉ số | Giá trị thực tế | Ghi chú |
|---|---|---|
| **Local Workspace** | `D:\Projects\api-hub` | Windows 11 Home Single Language |
| **Current Branch** | `feature/sprint3-frontend-marketplace` | Target branch duy nhất |
| **Current HEAD SHA** | `1148ca7d390e847c499e0b6869063473c15675c7` | Chứa 18-phase QA audit và FE Marketplace |
| **Remote origin** | `https://github.com/antondung/API-Market.git` | Fetch & push URL |
| **origin/develop SHA** | `dce4c959f0a309cb44ead7a12c73d1b453a6689f` | Đã merge PR #76, #77 (Consumer backend) |
| **origin/main SHA** | `e5c2d42cbeea1a9e011e3afdb1106b5baf7e4743` | Release baseline tham khảo |
| **origin/codex/sprint3-gateway** | `19c2039583cdcd7eb873600edf55b2591e7e6eb3` | PR #78 open, phát triển trên nền `dce4c95` |
| **origin/feature/11-reports-suspended** | `0ce80decacfed1ea32afcfe938e3b5c2ad9646b0` | Migration 008 + DB test, phát triển trên `dce4c95` |
| **Common Merge Base (develop vs feature)** | `76ff829111f1bf3b9874ee368983f8022a13cd78` | Điểm phân kỳ |
| **Ahead / Behind (develop vs feature)** | develop: 6 commits ahead, feature: 7 commits ahead | Không trùng file sửa đổi vật lý |
| **Working Tree Status** | Sạch (chỉ có `.claude/` untracked) | Không có dirty files cản trở |

---

## 2. Commit Divergence

### 2.1. Commits riêng trên `origin/develop` (kể từ merge-base `76ff829`):
1. `2259fb7` docs(qa): add Sprint 3 AC/test cases, marketplace test runner and fix bug F2 (#15, #70)
2. `01a4e1b` feat(consumer): add persistent sandbox grants and hashed API key lifecycle
3. `46e6036` feat(playground): enforce pinned public upstreams and sandbox quota with Sprint 3 contracts
4. `60f18f4` fix(playground): accept valid OpenAPI path parameter names
5. `e4795e5` Merge pull request #76 from antondung/docs/15-qa-sprint3
6. `dce4c95` Merge pull request #77 from antondung/codex/sprint3-consumer-backend

### 2.2. Commits riêng trên `feature/sprint3-frontend-marketplace`:
1. `b5ca899` feat(frontend): complete sprint3 marketplace and animate-ui ux
2. `3faefc8` fix(frontend): remediate sprint3 security data integrity and ux audit
3. `4b5a0a0` fix(frontend): close sprint3 round2 review findings
4. `d98597b` fix(frontend): finalize sprint3 reliability and security gates
5. `9eca06f` fix(frontend): resolve sprint3 ci gate and pricing retry regression
6. `2f5824c` docs(frontend): update sprint3 final hardening report with verified ci run
7. `1148ca7` test(frontend): execute comprehensive 18-phase qa audit and remediate defects

---

## 3. Branch & Contract Comparison Matrix (Phase 1)

| Component / Feature | Branch mới nhất | Source Commit | Có trong develop? | Có trong feature? | Contract tương thích | Security Risk | Integration Action | Regression Tests | Status |
|---|---|---|---|---|---|---|---|---|---|
| **Marketplace & Detail FE** | `feature` | `1148ca7` | Chưa | Có | Tương thích schema Marketplace | Thấp | Giữ nguyên và bảo toàn | 14 Playwright specs, Vitest | INTEGRATED |
| **Animate UI UX** | `feature` | `1148ca7` | Chưa | Có | Độc lập UI | Thấp (a11y/motion tested) | Giữ nguyên | MotionComponents test | INTEGRATED |
| **Consumer Backend (API Keys, Sandbox, Playground, SafeProxy)** | `develop` | `dce4c95` (PR #77) | Có | Chưa | Chuẩn contract Sprint 3 | Cao nếu SSRF không pin DNS/IP | Merge `develop` vào `feature` | `consumer.test.ts`, `safe-proxy.test.ts` (109 tests) | INTEGRATED (Phase 2) |
| **Real Consumer API Keys FE** | Cần cập nhật | FE hiện tại dùng mock UI | Có (backend) | Chưa nối | Cần map `/api/consumer/api-keys` DTO | Rò rỉ secret (phải reveal once) | Viết service `consumerApi.ts`, nối `ApiKeysPage.tsx` | Vitest + Playwright spec | PENDING_INTEGRATION (Phase 5) |
| **Real Sandbox Grant FE** | Cần cập nhật | FE hiện tại dùng mock UI | Có (backend) | Chưa nối | Cần map `/api/consumer/apis/:id/sandbox` | Đổi quota client-side | Nối `TrySandboxPage.tsx` với backend authoritative | Vitest + Playwright spec | PENDING_INTEGRATION (Phase 6) |
| **Real Playground Proxy FE** | Cần cập nhật | FE hiện tại dùng mock client | Có (backend) | Chưa nối | Cần POST endpointId + dictionary params | SSRF/XSS untrusted body | Nối `ApiPlaygroundPage.tsx` qua `authenticatedRequest` | Vitest + Playwright spec | PENDING_INTEGRATION (Phase 7) |
| **Gateway Router & Service (PR #78)** | `codex/sprint3-gateway` | `19c2039` | Chưa (PR open) | Chưa | Cần x-api-key, /api/gateway/:apiId/*rest | Defect: `express.json` nuốt body của `express.raw` | Audit middleware ordering, test POST body, tích hợp có kiểm soát | `gateway.test.ts` | EVALUATING_IN_PHASE_3 |
| **Reports Moderation DB (Issue #11)** | `feature/11-reports-suspended` | `0ce80de` | Chưa (chưa PR) | Chưa | Chỉ có migration 008, KHÔNG có HTTP API | Thiếu RBAC/Audit/API routes | Không kích hoạt fake success FE, đánh dấu rõ DEFERRED | `reports-database.test.ts` | DEFERRED (Phase 3.2, 9) |
| **QA Scripts Sprint 3 Frontend** | `feature` | `1148ca7` | Chưa | Có | Chuẩn Playwright suite | Không | Bảo toàn toàn bộ | 14 Playwright specs | INTEGRATED |
| **QA Scripts Sprint 3 Marketplace Runner** | `develop` | `2259fb7` | Có | Chưa | Node.js backend suite | Không | Tích hợp qua merge develop | `sprint3-marketplace-runner.js` | INTEGRATED (Phase 2) |

---

## 4. Kế hoạch thực thi kế tiếp

1. **Phase 2**: Thực hiện `git merge --no-ff origin/develop` vào `feature/sprint3-frontend-marketplace`.
2. **Phase 3**: Đánh giá chi tiết Gateway PR #78 (kiểm tra bug Express middleware ordering với body POST JSON) và Reports branch.
3. **Phase 4 & 5**: Xây dựng service typed client cho Consumer API Keys, cập nhật `ApiKeysPage.tsx` theo backend authoritative contract.
4. **Phase 6**: Cập nhật `TrySandboxPage.tsx` nối real sandbox backend.
5. **Phase 7**: Cập nhật `ApiPlaygroundPage.tsx` nối real backend `/api/marketplace/apis/:id/playground`.
6. **Phase 8 - 15**: Gateway snippets, regression tests, E2E validation, docs và git delivery.
