# Sprint 4 backend Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans; independent module tasks may use dispatching-parallel-agents. Steps are tracked below.

**Goal:** Implement backend issue #17 on schema #91.
**Architecture:** Existing services/router architecture, PostgreSQL entitlement and durable quota floor, Redis Lua gate, durable async usage outbox, sandbox-only payment.
**Tech Stack:** Node.js, TypeScript, Express, pg, redis client, Redis 7-compatible Lua.
**Spec:** ../specs/2026-11-04-sprint4-backend-design.md

## Global constraints
No real payment or plaintext secrets persisted; signed owner-bound sandbox completion, HMAC webhook; Consumer JWT for control plane; no SafeProxy private-IP bypass. Keep 009 unchanged. Native local worktree execution authorized; no further design approval required by user's opt-out.

## Review focus
Webhook retries/concurrency never duplicate charges or quota; Redis eviction cannot reduce durable consumption; plan changes never turn exhausted quota into free quota; usage retries do not duplicate and exclude sensitive data; ownership/revenue do not leak across providers.

## Tasks
1. Baseline and dependency: worktree from #91; full npm test; commit design/plan and provenance.
2. Billing: `billing-service.ts`, `billing-router.ts`, migration010; test first free/paid, owner/roles, replay/expiry/forged settlement, cancel/change; red -> implement -> green. Interface BillingService(pool, sandboxSecret): subscribe/list/get/cancel/change/checkout/confirm/webhook; router receives requireAuth/requireRole and exposes consumer paths. Webhook mounted raw before JSON. Snapshot plan price/quota so provider edits cannot silently alter paid terms.
3. Metering: `redis-meter.ts`, `gateway-entitlement.ts`, `usage-service.ts`, `usage-analytics.ts`. Tests before implementation, Redis Lua atomic rate+quota; durable outbox and whitelist; source accepts only IDs/status/timing, no arbitrary payload. Analytics scoped by current user/provider. Shared contracts documented in module exports.
4. Integrate: gateway accepts mandatory entitlement/logging in production, takes request ID; validate/prepare before reserve; reserve returns usage identity, complete once in finally. app mounts billing/stats; server creates Redis and stops writer/Redis on shutdown. Existing Gateway tests use explicit test admission rather than production bypass.
5. Verification and handoff: full tests/build/lint, real Redis HTTP integration/benchmark, Swagger validation, fresh branch review; fix important findings with regression; commit/push feature branch and PR to develop (#91 dependency), attach PR. Do not claim review/staging complete.

Each task follows failing test -> verify failure -> minimum implementation -> tests pass -> commit. Execution ledger is backend/SPRINT-4-HANDOFF.md; describe design rulings and test evidence there.
