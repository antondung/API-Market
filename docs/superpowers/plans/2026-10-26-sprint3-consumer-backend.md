# Sprint 3 Consumer Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn thiện backend US-18/19/21 và registry US-22 của issue #12, giữ US-16/17 đang hoạt động.
**Architecture:** Dịch vụ PostgreSQL cho key/grant/registry và lớp safe HTTP proxy độc lập; Express dùng JWT và role Consumer hiện có. Không phụ thuộc Gateway HTTP chưa triển khai của Dũng.
**Tech Stack:** Node.js >=22.14, TypeScript, Express, PostgreSQL, node:http/https/dns/net/crypto.
**Spec:** docs/superpowers/specs/2026-10-26-sprint3-consumer-backend-design.md

## Global Constraints
- Sandbox 5 lượt/24 giờ, cấu hình server 3–10, một grant Consumer/API; không reset/gia hạn qua POST lặp.
- Proxy deadline tổng tối đa 10 giây, response tối đa 2 MiB; không follow redirect hoặc private IP.
- Secret/hash không xuất hiện trong list/log; key chỉ hiện một lần qua create/rotate.
- Chỉ thay backend của Tùng Dương và tài liệu hợp đồng liên quan; review/QA/staging không tự chứng nhận.

## Review Focus
- IPv4-mapped IPv6, private/public mixed DNS và tên DNS đổi IP sau kiểm tra: từ chối hoặc pin socket.
- PathParams chứa slash/dot/encoded traversal: từ chối trước quota/network.
- Hai rotate/revoke/create cùng lúc: tối đa một key active, transaction rollback không mất key đang dùng.
- Request quota đồng thời, hết hạn, POST lại: không vượt quota và không reset.
- Tài khoản/API/route bị vô hiệu hóa: không tiếp tục dùng cache/key để gọi upstream.

### Task 1: Sandbox, API Key và routing registry
**Files:** create backend/src/{consumer-service,routing-registry}.ts; test backend/integration/consumer.test.ts; modify backend/src/{app,server}.ts; create backend/src/consumer-router.ts.
**Interfaces:** SandboxService.grant/get/consume(userId,apiId); ApiKeyService.create/list/rotate/revoke/authenticate; RoutingRegistry.resolve(apiId).
- [ ] Viết integration HTTP thất bại vì route chưa có; assert quota 5/24h, grant lặp không reset, concurrent consume chỉ 5; key create trả secret, DB chỉ hash, list không secret/hash, rotate/revoke/ownership/disabled.
- [ ] Chạy full `npm test`, xác nhận lỗi 404 cho tính năng chưa triển khai.
- [ ] Triển khai transaction và parameterized SQL trên schema 006; registry tự bổ sung route Published chưa có, không enable route bị tắt; JWT Consumer middleware.
- [ ] Chạy full `npm test`, kiểm tra green và commit.

### Task 2: Safe proxy và Playground
**Files:** create backend/src/{safe-proxy,playground-service}.ts; test backend/test/safe-proxy.test.ts, backend/integration/consumer.test.ts; modify backend/src/{app,consumer-router,server}.ts.
**Interfaces:** SafeProxy.prepare(baseUrl,path,input,timeoutMs) tạo target đã kiểm tra và pinned; execute(target) trả status/headers/body/bodyEncoding/latencyMs. PlaygroundService.run(userId,apiId,input) kiểm tra endpoint/registry, prepare, consume grant rồi execute.
- [ ] Thêm regression cho SSRF IPv4/IPv6/mixed DNS, traversal/header restrictions, redirect, timeout, 2MiB và registered endpoint/quota; chạy thấy thất bại trước triển khai.
- [ ] Triển khai transport pin địa chỉ đã validate, deadline hủy socket, byte limit và response/header allowlist. Chỉ endpoint đã đăng ký, không client URL/method tùy ý.
- [ ] Chạy full backend suite; kiểm tra network fixture không trở thành production bypass; commit.

### Task 3: Swagger, bàn giao và kiểm chứng phát hành
**Files:** create backend/src/consumer-contract.ts; modify backend/src/app.ts, backend/SPRINT-3-HANDOFF.md; add backend/SPRINT-3-CONSUMER-HANDOFF.md and regression Swagger.
- [ ] Test Swagger có đủ request/response/security/error cho Sandbox/Key/Playground, validate bằng SwaggerParser; xác nhận thiếu contract trước sửa.
- [ ] Ghi payload/hàm registry/key cho Hải Dương/Dũng, trạng thái QA/staging và giới hạn; bổ sung contract chính xác.
- [ ] Chạy `npm test`, `npm run lint`, `npm run build`, repo checker và diff-check; đọc review toàn diff; commit/push/PR vào develop, kiểm tra CI và báo trạng thái thật.
