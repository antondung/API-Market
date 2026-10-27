/**
 * sprint3-phase2-runner.js
 * Automated QA Test Suite for Sprint 3 (Phase 2):
 * - US-22: Gateway Request Forwarding with API Key Verification (PR #78)
 * - US-05: User Profile & Secure Password Change (PR #79)
 * - US-15: Violation Reports & Admin Content Moderation (PR #81)
 *
 * Tiêu chuẩn & Nguyên tắc Kiểm toán:
 * 1. Data Isolation Tuyệt đối: Tự tạo Test API (phase2ApiId) và Test Users riêng
 *    (Phase 2 Consumer, Phase 2 Provider, Phase 2 Admin).
 *    Tuyệt đối KHÔNG chạm vào hay đổi mật khẩu các tài khoản seed (user@example.com, admin@example.com).
 * 2. Cleanup Triệt để (Idempotent 100%): Khối finally dọn dẹp sạch sẽ toàn bộ bản ghi
 *    ở cả 11 bảng dữ liệu liên quan: reports, audit_logs, gateway_routes, api_endpoints,
 *    api_versions, sandbox_grants, api_keys, apis, provider_verifications, api_providers,
 *    refresh_tokens, users.
 * 3. Minh bạch Chỉ số: Xuất file qa-scripts/sprint3-phase2-results.json tách bạch rõ:
 *    totalDesigned (15), executed, passed, failed, skipped, executionPassRate, overallCoverageRate.
 *
 * QA Lead: Trần Hà Thảo Vân (MSSV: BCS250039, @vuonghathaovan-gif — Issue #15)
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import pg from 'pg';

const { Pool } = pg;

// Cấu hình môi trường kiểm thử
const BASE_URL = process.env.BACKEND_URL || 'http://127.0.0.1:3000';
const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:MatKhauCuaToi123!@127.0.0.1:5432/api_market_dev';

let pool;
function getDbPool() {
  if (!pool) {
    pool = new Pool({ connectionString: DB_URL, connectionTimeoutMillis: 5000 });
  }
  return pool;
}

// Bảng lưu trữ kết quả kiểm thử
const results = [];
let passCount = 0;
let failCount = 0;
let skipCount = 0;

function log(msg) {
  console.log(`[QA Phase 2] ${msg}`);
}

async function recordResult(testCaseId, userStory, name, passed, details = {}, notes = '') {
  if (passed) {
    passCount++;
    console.log(`  ✅ [PASS] ${testCaseId}: ${name}`);
  } else {
    failCount++;
    console.error(`  ❌ [FAIL] ${testCaseId}: ${name}`);
  }

  results.push({
    testCaseId,
    userStory,
    name,
    status: passed ? 'PASSED' : 'FAILED',
    timestamp: new Date().toISOString(),
    details,
    notes,
  });
}

function recordSkipped(testCaseId, userStory, name, reason) {
  skipCount++;
  console.log(`  ⏭️ [SKIP] ${testCaseId}: ${name} (${reason})`);
  results.push({
    testCaseId,
    userStory,
    name,
    status: 'SKIPPED',
    timestamp: new Date().toISOString(),
    details: { reason },
    notes: `Tạm hoãn: ${reason}`,
  });
}

// Helper gửi HTTP request có timeout
async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    let body;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        body = await res.json();
      } catch {
        body = null;
      }
    } else {
      body = await res.text();
    }
    return {
      status: res.status,
      headers: res.headers,
      body,
    };
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// ============================================================================
// HÀM CHÍNH THỰC THI TOÀN BỘ SUITE KIỂM THỬ SPRINT 3 PHA 2
// ============================================================================
async function runPhase2() {
  console.log('================================================================');
  console.log('   BỘ KIỂM THỬ TỰ ĐỘNG SPRINT 3 (PHA 2): GATEWAY, PROFILE & REPORTS');
  console.log('   Phạm vi: US-22 (Gateway), US-05 (Profile & Password), US-15 (Reports)');
  console.log(`   Target Base URL: ${BASE_URL}`);
  console.log(`   Database URL:    ${DB_URL.replace(/:[^:@]+@/, ':***@')}`);
  console.log('   QA Lead: Trần Hà Thảo Vân (MSSV: BCS250039, @vuonghathaovan-gif)');
  console.log('================================================================\n');

  const db = getDbPool();

  // Biến quản lý trạng thái tài nguyên test độc lập để cleanup sạch sẽ
  const createdUserIds = [];
  let testProviderId = null;
  let testApiId = null;
  let testEndpointId = null;
  let testApiKeyRaw = null;
  let testApiKeyId = null;
  let testReportId = null;

  let consumerToken = null;
  let consumerUser = null;
  let providerToken = null;
  let providerUser = null;
  let adminToken = null;
  let adminUser = null;

  const runSuffix = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  try {
    // 0. Kiểm tra kết nối Backend và Database
    try {
      const health = await fetchWithTimeout(`${BASE_URL}/health`, {}, 3000);
      if (health.status !== 200) {
        throw new Error(`Backend health returned status ${health.status}`);
      }
      log('Máy chủ Backend đang phản hồi tốt (200 OK).');
    } catch (err) {
      log(`Không thể kết nối Backend tại ${BASE_URL}: ${err.message}`);
      throw err;
    }

    // 1. Khởi tạo Isolated Test Users (Consumer, Provider, Admin)
    log('Khởi tạo người dùng kiểm thử độc lập cho Pha 2...');
    const consumerEmail = `qa-phase2-consumer-${runSuffix}@test.local`;
    const providerEmail = `qa-phase2-provider-${runSuffix}@test.local`;
    const adminEmail = `qa-phase2-admin-${runSuffix}@test.local`;
    const defaultPassword = 'Test-password-12345!';

    // Đăng ký Consumer
    const regConsumer = await fetchWithTimeout(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: consumerEmail, password: defaultPassword, role: 'Consumer', name: 'Phase 2 Consumer' }),
    });
    if (regConsumer.status !== 201) throw new Error(`Đăng ký Consumer thất bại: ${JSON.stringify(regConsumer.body)}`);

    const loginConsumer = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: consumerEmail, password: defaultPassword }),
    });
    consumerToken = loginConsumer.body.data.accessToken;
    consumerUser = loginConsumer.body.data.user;
    createdUserIds.push(consumerUser.id);

    // Đăng ký Provider
    const regProvider = await fetchWithTimeout(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: providerEmail, password: defaultPassword, role: 'Provider', name: 'Phase 2 Provider' }),
    });
    if (regProvider.status !== 201) throw new Error(`Đăng ký Provider thất bại: ${JSON.stringify(regProvider.body)}`);

    const loginProvider = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: providerEmail, password: defaultPassword }),
    });
    providerToken = loginProvider.body.data.accessToken;
    providerUser = loginProvider.body.data.user;
    createdUserIds.push(providerUser.id);

    // Đăng ký và nâng cấp tài khoản Admin riêng biệt
    const regAdmin = await fetchWithTimeout(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: defaultPassword, role: 'Consumer', name: 'Phase 2 Admin' }),
    });
    if (regAdmin.status !== 201) throw new Error(`Đăng ký Admin thất bại: ${JSON.stringify(regAdmin.body)}`);

    // Gán role ADMIN trong database
    await db.query(
      `UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'ADMIN') WHERE email = $1`,
      [adminEmail]
    );

    const loginAdmin = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: defaultPassword }),
    });
    adminToken = loginAdmin.body.data.accessToken;
    adminUser = loginAdmin.body.data.user;
    createdUserIds.push(adminUser.id);

    // Xác minh Provider (Verified)
    const provRow = await db.query('SELECT id FROM api_providers WHERE user_id = $1', [providerUser.id]);
    testProviderId = provRow.rows[0].id;
    await db.query(
      `INSERT INTO provider_verifications (provider_id, organization_name, contact_email, evidence_urls, status, reviewed_at, reviewed_by)
       VALUES ($1, 'QA Phase 2 Lab', $2, '["https://example.com/proof"]'::jsonb, 'Verified', NOW(), $3)`,
      [testProviderId, providerEmail, adminUser.id]
    );

    // 2. Khởi tạo Isolated Test API cho Gateway & Reports
    log('Khởi tạo Isolated Test API (chuyển trạng thái chuẩn Draft -> Published)...');
    const apiInsert = await db.query(
      `INSERT INTO apis (provider_id, name, description, category, base_url, status)
       VALUES ($1, 'QA Gateway & Moderation Target API', 'Target API for Gateway forward, Header filtering, and Violation Reporting', 'Tools', 'https://httpbin.org', 'Draft')
       RETURNING id`,
      [testProviderId]
    );
    testApiId = apiInsert.rows[0].id;

    // Chuyển đổi trạng thái tuần tự theo DB trigger enforce_api_status_transition
    for (const st of ['Submitted', 'Under Review', 'Approved', 'Published']) {
      await db.query('UPDATE apis SET status = $1 WHERE id = $2', [st, testApiId]);
    }

    // Tạo api_versions
    const versionRes = await db.query(
      `INSERT INTO api_versions (api_id, version_name, status, is_default, changelog)
       VALUES ($1, 'v1.0.0', 'Active', true, 'Phase 2 Test Version')
       RETURNING id`,
      [testApiId]
    );
    const versionId = versionRes.rows[0].id;

    // Tạo api_endpoints (/get, /status/{code})
    const epGet = await db.query(
      `INSERT INTO api_endpoints (api_id, version_id, method, path, description, is_active)
       VALUES ($1, $2, 'GET', '/get', 'HTTPBin GET echo', true)
       RETURNING id`,
      [testApiId, versionId]
    );
    testEndpointId = epGet.rows[0].id;

    await db.query(
      `INSERT INTO api_endpoints (api_id, version_id, method, path, description, is_active)
       VALUES ($1, $2, 'GET', '/status/{code}', 'HTTPBin Status echo', true)`
    );

    // Tạo gateway_routes (trỏ tới https://httpbin.org)
    await db.query(
      `INSERT INTO gateway_routes (api_id, upstream_base_url, timeout_ms, retry_count, is_enabled)
       VALUES ($1, 'https://httpbin.org', 10000, 1, true)`,
      [testApiId]
    );

    // Tạo API Key cho Consumer trên Test API này qua Consumer Service HTTP endpoint
    const createKeyRes = await fetchWithTimeout(`${BASE_URL}/api/consumer/api-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${consumerToken}`,
      },
      body: JSON.stringify({ apiId: testApiId, name: 'QA Phase 2 Key' }),
    });

    if (createKeyRes.status === 201) {
      testApiKeyRaw = createKeyRes.body.data.rawKey;
      testApiKeyId = createKeyRes.body.data.id;
      log(`Đã tạo thành công API Key kiểm thử: ${testApiKeyRaw.slice(0, 15)}... (ID: ${testApiKeyId})`);
    } else {
      log(`Tạo API Key qua HTTP trả về ${createKeyRes.status}: ${JSON.stringify(createKeyRes.body)}`);
    }

    // ========================================================================
    // SUITE 1: US-22 - Gateway Request Forwarding & Key Verification (PR #78)
    // ========================================================================
    console.log('\n--- [SUITE 1] US-22: Gateway Khung Chuyển Tiếp Request Có Kiểm Tra API Key ---');

    // TC-22-01: Forward request hợp lệ qua /api/gateway/:apiId/get
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/api/gateway/${testApiId}/get`, {
        method: 'GET',
        headers: {
          'x-api-key': testApiKeyRaw,
          'Accept': 'application/json',
        },
      }, 10000);

      const is200 = res.status === 200;
      const isHttpbin = res.body && (res.body.url?.includes('httpbin.org') || res.body.headers);

      // Đối soát DB: last_used_at của API Key phải được cập nhật
      const keyDb = await db.query('SELECT last_used_at FROM api_keys WHERE id = $1', [testApiKeyId]);
      const lastUsedUpdated = keyDb.rows[0]?.last_used_at !== null;

      const passed = is200 && isHttpbin && lastUsedUpdated;
      await recordResult(
        'TC-22-01',
        'US-22',
        'Forward request hợp lệ qua Gateway với X-API-Key active tới upstream public (200 OK & update last_used_at)',
        passed,
        { status: res.status, lastUsedAt: keyDb.rows[0]?.last_used_at, upstreamEcho: isHttpbin }
      );
    } catch (err) {
      await recordResult('TC-22-01', 'US-22', 'Forward request hợp lệ qua Gateway', false, { error: err.message });
    }

    // TC-22-02: Chặn thiếu, sai, hoặc revoked X-API-Key (401 INVALID_API_KEY)
    try {
      // 1. Thiếu header x-api-key
      const resMissing = await fetchWithTimeout(`${BASE_URL}/api/gateway/${testApiId}/get`, {
        method: 'GET',
      });
      const missing401 = resMissing.status === 401 && resMissing.body?.code === 'INVALID_API_KEY';

      // 2. Sai x-api-key
      const resInvalid = await fetchWithTimeout(`${BASE_URL}/api/gateway/${testApiId}/get`, {
        method: 'GET',
        headers: { 'x-api-key': 'ak_live_invalid_fake_key_999999999' },
      });
      const invalid401 = resInvalid.status === 401 && resInvalid.body?.code === 'INVALID_API_KEY';

      // 3. Revoked key
      // Tạo một key phụ rồi thu hồi để test
      const tempKeyRes = await fetchWithTimeout(`${BASE_URL}/api/consumer/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${providerToken}`, // Provider cũng là user có thể có key
        },
        body: JSON.stringify({ apiId: testApiId, name: 'Temp Revoke Target' }),
      });
      let revoked401 = false;
      if (tempKeyRes.status === 201) {
        const tempRaw = tempKeyRes.body.data.rawKey;
        const tempId = tempKeyRes.body.data.id;
        // Thu hồi key này
        await fetchWithTimeout(`${BASE_URL}/api/consumer/api-keys/${tempId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${providerToken}` },
        });
        const resRevoked = await fetchWithTimeout(`${BASE_URL}/api/gateway/${testApiId}/get`, {
          method: 'GET',
          headers: { 'x-api-key': tempRaw },
        });
        revoked401 = resRevoked.status === 401 && resRevoked.body?.code === 'INVALID_API_KEY';
      }

      const passed = missing401 && invalid401 && revoked401;
      await recordResult(
        'TC-22-02',
        'US-22',
        'Chặn truy cập Gateway khi thiếu, sai, hoặc sử dụng khóa API đã thu hồi (401 INVALID_API_KEY)',
        passed,
        { missingStatus: resMissing.status, invalidStatus: resInvalid.status, revokedPassed: revoked401 }
      );
    } catch (err) {
      await recordResult('TC-22-02', 'US-22', 'Chặn khóa API không hợp lệ', false, { error: err.message });
    }

    // TC-22-03: Lọc Header nhạy cảm (Allowlist Enforcement)
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/api/gateway/${testApiId}/get`, {
        method: 'GET',
        headers: {
          'x-api-key': testApiKeyRaw,
          'Accept': 'application/json',
          'X-Internal-Actor': 'super-admin-bypass',
          'Authorization': 'Bearer confidential_user_jwt_token',
          'Cookie': 'session_token=secret123; user_role=Admin',
          'X-Forwarded-For': '192.168.1.1',
        },
      });

      const is200 = res.status === 200;
      const upstreamHeaders = res.body?.headers || {};

      // Upstream httpbin KHÔNG ĐƯỢC chứa các header nhạy cảm
      const leakedInternal = Boolean(upstreamHeaders['X-Internal-Actor'] || upstreamHeaders['x-internal-actor']);
      const leakedAuth = Boolean(upstreamHeaders['Authorization'] || upstreamHeaders['authorization']);
      const leakedCookie = Boolean(upstreamHeaders['Cookie'] || upstreamHeaders['cookie']);
      const leakedForwarded = Boolean(upstreamHeaders['X-Forwarded-For'] || upstreamHeaders['x-forwarded-for']);
      const leakedApiKey = Boolean(upstreamHeaders['X-Api-Key'] || upstreamHeaders['x-api-key']);

      const passed = is200 && !leakedInternal && !leakedAuth && !leakedCookie && !leakedForwarded && !leakedApiKey;
      await recordResult(
        'TC-22-03',
        'US-22',
        'Lọc bỏ toàn bộ Header nhạy cảm và nội bộ trước khi chuyển tiếp (Allowlist: chặn Authorization, Cookie, X-Internal-Actor)',
        passed,
        { status: res.status, leakedInternal, leakedAuth, leakedCookie, leakedApiKey }
      );
    } catch (err) {
      await recordResult('TC-22-03', 'US-22', 'Lọc Header nhạy cảm', false, { error: err.message });
    }

    // TC-22-04: Chặn Path Traversal và Endpoint không đăng ký
    try {
      // 1. Path traversal (/..%2F or /../)
      const resTraversal = await fetchWithTimeout(`${BASE_URL}/api/gateway/${testApiId}/get/..%2Fadmin`, {
        method: 'GET',
        headers: { 'x-api-key': testApiKeyRaw },
      });
      const traversalBlocked = resTraversal.status === 400;

      // 2. Endpoint không đăng ký (/unregistered/deep/path)
      const resUnregistered = await fetchWithTimeout(`${BASE_URL}/api/gateway/${testApiId}/unregistered/endpoint`, {
        method: 'GET',
        headers: { 'x-api-key': testApiKeyRaw },
      });
      const unreg404 = resUnregistered.status === 404 && resUnregistered.body?.code === 'ENDPOINT_NOT_FOUND';

      const passed = traversalBlocked && unreg404;
      await recordResult(
        'TC-22-04',
        'US-22',
        'Chặn Path Traversal (400 INVALID_PATH) và từ chối endpoint chưa đăng ký trong Catalog (404 ENDPOINT_NOT_FOUND)',
        passed,
        { traversalStatus: resTraversal.status, unregStatus: resUnregistered.status, unregCode: resUnregistered.body?.code }
      );
    } catch (err) {
      await recordResult('TC-22-04', 'US-22', 'Chặn Path Traversal & Unregistered Endpoint', false, { error: err.message });
    }

    // TC-22-05: Chặn khi API bị Suspended (hoặc không còn Published)
    try {
      // Tạm thời đình chỉ API trong database
      await db.query("UPDATE apis SET status = 'Suspended' WHERE id = $1", [testApiId]);

      const resSuspended = await fetchWithTimeout(`${BASE_URL}/api/gateway/${testApiId}/get`, {
        method: 'GET',
        headers: { 'x-api-key': testApiKeyRaw },
      });

      // Gateway từ chối phục vụ: API không còn Published
      const isBlocked = resSuspended.status === 404 || resSuspended.status === 403;

      // Khôi phục lại trạng thái Published cho các bài test tiếp theo
      await db.query("UPDATE apis SET status = 'Published' WHERE id = $1", [testApiId]);

      await recordResult(
        'TC-22-05',
        'US-22',
        'Gateway từ chối phục vụ ngay lập tức khi API bị đình chỉ (Suspended / unpublish) với 404 API_NOT_FOUND / 403',
        isBlocked,
        { status: resSuspended.status, code: resSuspended.body?.code }
      );
    } catch (err) {
      await db.query("UPDATE apis SET status = 'Published' WHERE id = $1", [testApiId]);
      await recordResult('TC-22-05', 'US-22', 'Chặn API Suspended tại Gateway', false, { error: err.message });
    }

    // ========================================================================
    // SUITE 2: US-05 - Hồ Sơ Cá Nhân & Đổi Mật Khẩu (PR #79)
    // ========================================================================
    console.log('\n--- [SUITE 2] US-05: Hồ Sơ Cá Nhân & Đổi Mật Khẩu An Toàn ---');

    // Tạo một Isolated User riêng biệt cho Suite 05 để kiểm tra đổi mật khẩu độc lập
    const user05Email = `qa-user05-${runSuffix}@test.local`;
    let user05Pass = 'Initial-password-2026!';
    const reg05 = await fetchWithTimeout(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user05Email, password: user05Pass, role: 'Consumer', name: 'Original Name 05' }),
    });
    if (reg05.status !== 201) throw new Error(`Đăng ký User 05 thất bại`);

    const login05Session1 = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user05Email, password: user05Pass }),
    });
    const session1Token = login05Session1.body.data.accessToken;
    const session1User = login05Session1.body.data.user;
    createdUserIds.push(session1User.id);

    // TC-05-01: Lấy thông tin tài khoản hiện tại GET /api/auth/me
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${session1Token}` },
      });

      const is200 = res.status === 200;
      const data = res.body?.data;
      const matchesDb = data && data.email === user05Email && data.name === 'Original Name 05';

      await recordResult(
        'TC-05-01',
        'US-05',
        'Truy vấn hồ sơ cá nhân hiện tại GET /api/auth/me trả về đúng thông tin định danh và vai trò (200 OK)',
        is200 && matchesDb,
        { status: res.status, user: data }
      );
    } catch (err) {
      await recordResult('TC-05-01', 'US-05', 'Truy vấn hồ sơ cá nhân', false, { error: err.message });
    }

    // TC-05-02: Cập nhật tên hiển thị PATCH /api/auth/me thành công
    try {
      const newDisplayName = 'Kỹ Sư QA Trần Hà Thảo Vân';
      const res = await fetchWithTimeout(`${BASE_URL}/api/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session1Token}`,
        },
        body: JSON.stringify({ name: newDisplayName }),
      });

      const is200 = res.status === 200;
      const updatedName = res.body?.data?.name === newDisplayName;

      // Đối soát DB: tên đã lưu bền vững
      const dbUser = await db.query('SELECT name FROM users WHERE id = $1', [session1User.id]);
      const dbSaved = dbUser.rows[0]?.name === newDisplayName;

      await recordResult(
        'TC-05-02',
        'US-05',
        'Cập nhật tên hiển thị PATCH /api/auth/me thành công, dữ liệu được ghi nhận bền vững vào PostgreSQL (200 OK)',
        is200 && updatedName && dbSaved,
        { status: res.status, updatedName, dbSaved }
      );
    } catch (err) {
      await recordResult('TC-05-02', 'US-05', 'Cập nhật tên hiển thị', false, { error: err.message });
    }

    // TC-05-03: Kiểm tra ràng buộc và bảo vệ PATCH /api/auth/me
    try {
      // 1. Không có token -> 401
      const resNoAuth = await fetchWithTimeout(`${BASE_URL}/api/auth/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Hacker Name' }),
      });
      const unauth401 = resNoAuth.status === 401;

      // 2. Tên rỗng hoặc khoảng trắng -> 400
      const resBlank = await fetchWithTimeout(`${BASE_URL}/api/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session1Token}`,
        },
        body: JSON.stringify({ name: '   ' }),
      });
      const blank400 = resBlank.status === 400;

      // 3. Gửi kèm trường lạ (role: Admin) -> 400 do .strict()
      const resTamper = await fetchWithTimeout(`${BASE_URL}/api/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session1Token}`,
        },
        body: JSON.stringify({ name: 'Legit Name', role: 'ADMIN' }),
      });
      const tamper400 = resTamper.status === 400;

      const passed = unauth401 && blank400 && tamper400;
      await recordResult(
        'TC-05-03',
        'US-05',
        'Từ chối cập nhật khi chưa xác thực (401), tên rỗng/khoảng trắng (400) hoặc gửi kèm trường lạ leo quyền (400 strict)',
        passed,
        { unauthStatus: resNoAuth.status, blankStatus: resBlank.status, tamperStatus: resTamper.status }
      );
    } catch (err) {
      await recordResult('TC-05-03', 'US-05', 'Ràng buộc cập nhật profile', false, { error: err.message });
    }

    // TC-05-04: Kiểm tra ràng buộc đổi mật khẩu POST /api/auth/change-password
    try {
      // 1. Sai mật khẩu hiện tại -> 401 INVALID_CREDENTIALS
      const resWrong = await fetchWithTimeout(`${BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session1Token}`,
        },
        body: JSON.stringify({ currentPassword: 'Wrong-password-999!', newPassword: 'New-valid-password-2026!' }),
      });
      const wrong401 = resWrong.status === 401 && resWrong.body?.code === 'INVALID_CREDENTIALS';

      // 2. Trùng mật khẩu cũ -> 400 PASSWORD_UNCHANGED
      const resSame = await fetchWithTimeout(`${BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session1Token}`,
        },
        body: JSON.stringify({ currentPassword: user05Pass, newPassword: user05Pass }),
      });
      const same400 = resSame.status === 400 && resSame.body?.code === 'PASSWORD_UNCHANGED';

      // 3. Mật khẩu mới quá ngắn (< 12 ký tự) -> 400 VALIDATION_ERROR
      const resShort = await fetchWithTimeout(`${BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session1Token}`,
        },
        body: JSON.stringify({ currentPassword: user05Pass, newPassword: 'Short1!' }),
      });
      const short400 = resShort.status === 400;

      const passed = wrong401 && same400 && short400;
      await recordResult(
        'TC-05-04',
        'US-05',
        'Chặn đổi mật khẩu khi sai mật khẩu cũ (401 INVALID_CREDENTIALS), trùng mật khẩu cũ (400 PASSWORD_UNCHANGED) hoặc quá ngắn (400)',
        passed,
        { wrongCode: resWrong.body?.code, sameCode: resSame.body?.code, shortStatus: resShort.status }
      );
    } catch (err) {
      await recordResult('TC-05-04', 'US-05', 'Ràng buộc đổi mật khẩu', false, { error: err.message });
    }

    // TC-05-05: Đổi mật khẩu thành công & Thu hồi các refresh token khác (revokeOtherSessions)
    try {
      // Đăng nhập thêm một phiên khác (Session 2) cho cùng tài khoản user05
      const login05Session2 = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user05Email, password: user05Pass }),
      });
      const session2Refresh = login05Session2.body.data.refreshToken;

      // Thực hiện đổi sang mật khẩu mới từ Session 1
      const newPass = 'Updated-super-safe-password-2026!';
      const resChange = await fetchWithTimeout(`${BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session1Token}`,
        },
        body: JSON.stringify({ currentPassword: user05Pass, newPassword: newPass }),
      });

      const change200 = resChange.status === 200 && resChange.body?.data?.revokedSessions >= 1;

      // 1. Session 1 hiện tại vẫn hoạt động bình thường
      const resStillActive = await fetchWithTimeout(`${BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${session1Token}` },
      });
      const session1Alive = resStillActive.status === 200;

      // 2. Session 2 bị thu hồi, không thể refresh token nữa -> 401
      const resRefreshSession2 = await fetchWithTimeout(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session2Refresh }),
      });
      const session2Revoked = resRefreshSession2.status === 401;

      // 3. Mật khẩu cũ không thể đăng nhập -> 401
      const resOldLogin = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user05Email, password: user05Pass }),
      });
      const oldLoginBlocked = resOldLogin.status === 401;

      // 4. Mật khẩu mới đăng nhập thành công -> 200
      const resNewLogin = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user05Email, password: newPass }),
      });
      const newLoginSuccess = resNewLogin.status === 200;

      const passed = change200 && session1Alive && session2Revoked && oldLoginBlocked && newLoginSuccess;
      await recordResult(
        'TC-05-05',
        'US-05',
        'Đổi mật khẩu thành công: giữ phiên hiện tại, thu hồi các refresh token khác (revokeOtherSessions), mật khẩu cũ bị vô hiệu hóa',
        passed,
        {
          changeStatus: resChange.status,
          revokedSessions: resChange.body?.data?.revokedSessions,
          session1Alive,
          session2Revoked,
          oldLoginBlocked,
          newLoginSuccess,
        }
      );
    } catch (err) {
      await recordResult('TC-05-05', 'US-05', 'Đổi mật khẩu thành công & revoke session', false, { error: err.message });
    }

    // ========================================================================
    // SUITE 3: US-15 - Báo Cáo Vi Phạm & Kiểm Duyệt API (PR #81)
    // ========================================================================
    console.log('\n--- [SUITE 3] US-15: Báo Cáo Vi Phạm & Kiểm Duyệt Nội Dung API ---');

    // TC-15-01: Consumer gửi báo cáo vi phạm hợp lệ POST /api/consumer/reports/:apiId
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/api/consumer/reports/${testApiId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${consumerToken}`,
        },
        body: JSON.stringify({
          category: 'Malicious Data',
          description: 'API phản hồi dữ liệu tiêm mã nguy hiểm độc hại tới client',
        }),
      });

      const is201 = res.status === 201;
      const data = res.body?.data;
      const reportStatusPending = data && data.status === 'Pending' && data.category === 'Malicious Data';
      testReportId = data?.id;

      // Đối soát DB: bản ghi tồn tại trong bảng reports
      const dbReport = await db.query('SELECT status, category FROM reports WHERE id = $1', [testReportId]);
      const dbValid = dbReport.rows[0]?.status === 'Pending';

      const passed = is201 && reportStatusPending && dbValid;
      await recordResult(
        'TC-15-01',
        'US-15',
        'Consumer gửi báo cáo vi phạm API Published thành công (201 Created, status: Pending, category hợp lệ)',
        passed,
        { status: res.status, reportId: testReportId, dbStatus: dbReport.rows[0]?.status }
      );
    } catch (err) {
      await recordResult('TC-15-01', 'US-15', 'Consumer gửi báo cáo vi phạm', false, { error: err.message });
    }

    // TC-15-02: Chặn gửi báo cáo không hợp lệ (category sai, mô tả ngắn, API không Published)
    try {
      // 1. Category sai danh mục -> 400
      const resBadCategory = await fetchWithTimeout(`${BASE_URL}/api/consumer/reports/${testApiId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${consumerToken}`,
        },
        body: JSON.stringify({
          category: 'Invalid Fraud Category',
          description: 'Mô tả hợp lệ dài hơn 10 ký tự nhưng sai category',
        }),
      });
      const badCat400 = resBadCategory.status === 400;

      // 2. Mô tả quá ngắn (< 10 ký tự) -> 400
      const resShortDesc = await fetchWithTimeout(`${BASE_URL}/api/consumer/reports/${testApiId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${consumerToken}`,
        },
        body: JSON.stringify({
          category: 'Other',
          description: 'Ngắn',
        }),
      });
      const shortDesc400 = resShortDesc.status === 400;

      // 3. Báo cáo API không ở trạng thái Published (tạo API Draft tạm để test)
      const draftApi = await db.query(
        `INSERT INTO apis (provider_id, name, description, category, base_url, status)
         VALUES ($1, 'Temporary Draft API', 'Desc', 'Tools', 'https://example.com', 'Draft')
         RETURNING id`,
        [testProviderId]
      );
      const draftId = draftApi.rows[0].id;

      const resDraftReport = await fetchWithTimeout(`${BASE_URL}/api/consumer/reports/${draftId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${consumerToken}`,
        },
        body: JSON.stringify({
          category: 'Terms Violation',
          description: 'Báo cáo một API đang ở trạng thái Draft chưa từng Published',
        }),
      });
      const draftBlocked404 = resDraftReport.status === 404;

      // Dọn dẹp Draft API tạm
      await db.query('DELETE FROM apis WHERE id = $1', [draftId]);

      const passed = badCat400 && shortDesc400 && draftBlocked404;
      await recordResult(
        'TC-15-02',
        'US-15',
        'Từ chối báo cáo khi category sai (400), mô tả quá ngắn < 10 ký tự (400) hoặc API chưa Published (404)',
        passed,
        { badCategoryStatus: resBadCategory.status, shortDescStatus: resShortDesc.status, draftStatus: resDraftReport.status }
      );
    } catch (err) {
      await recordResult('TC-15-02', 'US-15', 'Ràng buộc báo cáo vi phạm', false, { error: err.message });
    }

    // TC-15-03: Phân quyền & Cách ly dữ liệu Reports
    try {
      // 1. Consumer xem danh sách báo cáo của chính mình GET /api/consumer/reports
      const resMine = await fetchWithTimeout(`${BASE_URL}/api/consumer/reports`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${consumerToken}` },
      });
      const mine200 = resMine.status === 200 && resMine.body?.data?.items?.length >= 1;

      // 2. Consumer cố tình truy cập hàng đợi kiểm duyệt của Admin GET /api/admin/reports -> 403
      const resConsumerAdmin = await fetchWithTimeout(`${BASE_URL}/api/admin/reports`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${consumerToken}` },
      });
      const consumerForbidden403 = resConsumerAdmin.status === 403;

      // 3. Admin truy cập hàng đợi kiểm duyệt GET /api/admin/reports -> 200
      const resAdminQueue = await fetchWithTimeout(`${BASE_URL}/api/admin/reports`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const adminQueue200 = resAdminQueue.status === 200 && Array.isArray(resAdminQueue.body?.data?.items);

      const passed = mine200 && consumerForbidden403 && adminQueue200;
      await recordResult(
        'TC-15-03',
        'US-15',
        'Cách ly danh sách báo cáo cá nhân (200), chặn Consumer truy cập khu vực Admin (403 FORBIDDEN), Admin quản lý hàng đợi (200)',
        passed,
        { mineCount: resMine.body?.data?.total, consumerAdminStatus: resConsumerAdmin.status, adminQueueCount: resAdminQueue.body?.data?.total }
      );
    } catch (err) {
      await recordResult('TC-15-03', 'US-15', 'Phân quyền & Cách ly Reports', false, { error: err.message });
    }

    // TC-15-04: Admin duyệt hành động Suspend (đình chỉ API và đóng báo cáo)
    try {
      const resSuspend = await fetchWithTimeout(`${BASE_URL}/api/admin/reports/${testReportId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          action: 'Suspend',
          note: 'Xác minh vi phạm an toàn nội dung nghiêm trọng, đình chỉ API',
        }),
      });

      const suspend200 = resSuspend.status === 200;
      const reportResolved = resSuspend.body?.data?.status === 'Resolved';

      // 1. Đối soát DB: API đã chuyển sang trạng thái Suspended
      const apiDb = await db.query('SELECT status FROM apis WHERE id = $1', [testApiId]);
      const apiSuspended = apiDb.rows[0]?.status === 'Suspended';

      // 2. Đối soát Marketplace: API Suspended không được hiển thị cho Consumer
      const marketRes = await fetchWithTimeout(`${BASE_URL}/api/marketplace/apis/${testApiId}`);
      const marketHidden = marketRes.status === 404;

      // 3. Thử duyệt lại báo cáo đã quyết định -> 409 REPORT_CLOSED
      const resDoubleReview = await fetchWithTimeout(`${BASE_URL}/api/admin/reports/${testReportId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          action: 'Suspend',
          note: 'Cố tình duyệt lại lần hai',
        }),
      });
      const closed409 = resDoubleReview.status === 409 && resDoubleReview.body?.code === 'REPORT_CLOSED';

      const passed = suspend200 && reportResolved && apiSuspended && marketHidden && closed409;
      await recordResult(
        'TC-15-04',
        'US-15',
        'Admin duyệt Suspend: API chuyển trạng thái Suspended, ẩn khỏi Marketplace, đóng báo cáo Resolved và chặn duyệt lại (409 REPORT_CLOSED)',
        passed,
        {
          suspendStatus: resSuspend.status,
          apiDbStatus: apiDb.rows[0]?.status,
          marketHiddenStatus: marketRes.status,
          doubleReviewCode: resDoubleReview.body?.code,
        }
      );
    } catch (err) {
      await recordResult('TC-15-04', 'US-15', 'Admin duyệt Suspend', false, { error: err.message });
    }

    // TC-15-05: Admin Restore API & Kiểm tra Audit Log
    try {
      // Tạo một report mới để thực hiện action Restore (vì report cũ đã Resolved)
      // Tạo báo cáo từ Consumer (chú ý: API đang Suspended không thể report qua HTTP, nên chèn trực tiếp 1 report hợp lệ để Admin review Restore)
      const reportRestoreInsert = await db.query(
        `INSERT INTO reports (api_id, reporter_id, category, description, status)
         VALUES ($1, $2, 'Other', 'Yêu cầu xem xét khôi phục sau khi nhà cung cấp đã khắc phục vi phạm', 'Pending')
         RETURNING id`,
        [testApiId, consumerUser.id]
      );
      const restoreReportId = reportRestoreInsert.rows[0].id;

      // Admin duyệt Restore
      const resRestore = await fetchWithTimeout(`${BASE_URL}/api/admin/reports/${restoreReportId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          action: 'Restore',
          note: 'Nhà cung cấp đã bổ sung bộ lọc nội dung an toàn và xác minh triệt để',
        }),
      });

      const restore200 = resRestore.status === 200;

      // 1. Đối soát DB: API đã trở về Published
      const apiDb = await db.query('SELECT status, published_at FROM apis WHERE id = $1', [testApiId]);
      const apiPublished = apiDb.rows[0]?.status === 'Published';
      const publishedAtRetained = apiDb.rows[0]?.published_at !== null;

      // 2. Đối soát Audit Log: Kiểm tra cả action report.suspend và report.restore
      const auditRes = await db.query(
        `SELECT action, actor_role, target_type, target_id
         FROM audit_logs
         WHERE target_id = $1 AND action IN ('report.suspend', 'report.restore')
         ORDER BY id ASC`,
        [String(testApiId)]
      );
      const hasSuspendAudit = auditRes.rows.some(r => r.action === 'report.suspend');
      const hasRestoreAudit = auditRes.rows.some(r => r.action === 'report.restore');

      const passed = restore200 && apiPublished && publishedAtRetained && hasSuspendAudit && hasRestoreAudit;
      await recordResult(
        'TC-15-05',
        'US-15',
        'Admin duyệt Restore: API khôi phục Published, giữ nguyên published_at, Audit Log ghi nhận đầy đủ report.suspend & report.restore',
        passed,
        {
          restoreStatus: resRestore.status,
          apiDbStatus: apiDb.rows[0]?.status,
          publishedAt: apiDb.rows[0]?.published_at,
          auditEntriesFound: auditRes.rows.length,
        }
      );
    } catch (err) {
      await recordResult('TC-15-05', 'US-15', 'Admin Restore & Audit Log', false, { error: err.message });
    }

  } catch (fatalErr) {
    console.error(`\n❌ [FATAL ERROR] Lỗi nghiêm trọng khi thực thi runner:`, fatalErr);
  } finally {
    // ========================================================================
    // TEARDOWN & CLEANUP TRIỆT ĐỂ (Data Overwrite Isolation & DB Invariant)
    // ========================================================================
    log('Dọn dẹp triệt để các bản ghi test tạm thời trong PostgreSQL (Finally block)...');
    try {
      if (testApiId) {
        await db.query('DELETE FROM reports WHERE api_id = $1', [testApiId]);
        await db.query('DELETE FROM audit_logs WHERE target_id = $1', [String(testApiId)]);
        await db.query('DELETE FROM gateway_routes WHERE api_id = $1', [testApiId]);
        await db.query('DELETE FROM api_endpoints WHERE api_id = $1', [testApiId]);
        await db.query('DELETE FROM api_versions WHERE api_id = $1', [testApiId]);
        await db.query('DELETE FROM sandbox_grants WHERE api_id = $1', [testApiId]);
        await db.query('DELETE FROM api_keys WHERE api_id = $1', [testApiId]);
        await db.query('DELETE FROM apis WHERE id = $1', [testApiId]);
      }
      if (testProviderId) {
        await db.query('DELETE FROM provider_verifications WHERE provider_id = $1', [testProviderId]);
        await db.query('DELETE FROM api_providers WHERE id = $1', [testProviderId]);
      }
      if (createdUserIds.length > 0) {
        await db.query('DELETE FROM refresh_tokens WHERE user_id = ANY($1)', [createdUserIds]);
        await db.query('DELETE FROM audit_logs WHERE actor_id = ANY($1)', [createdUserIds.map(String)]);
        await db.query('DELETE FROM users WHERE id = ANY($1)', [createdUserIds]);
      }
      log('Đã dọn dẹp hoàn tất, cơ sở dữ liệu đã khôi phục nguyên trạng.');
    } catch (cleanupErr) {
      console.error('[QA Runner Cleanup Error] Lỗi khi dọn dẹp dữ liệu:', cleanupErr);
    } finally {
      if (pool) {
        await pool.end();
      }
    }

    // ========================================================================
    // XUẤT BÁO CÁO KẾT QUẢ ĐẦY ĐỦ VÀ MINH BẠCH
    // ========================================================================
    const totalDesigned = 15;
    const executed = results.filter(r => r.status !== 'SKIPPED').length;
    const executionPassRate = executed > 0 ? ((passCount / executed) * 100).toFixed(1) : '0.0';
    const overallCoverageRate = ((passCount / totalDesigned) * 100).toFixed(1);

    console.log('\n================================================================');
    console.log('   KẾT QUẢ KIỂM THỬ SPRINT 3 (PHA 2) — MINH BẠCH HÓA SỐ LIỆU');
    console.log(`   - Tổng thiết kế (Designed):  ${totalDesigned}`);
    console.log(`   - Đã thực thi (Executed):    ${executed}`);
    console.log(`   - Đạt (Passed):              ${passCount}`);
    console.log(`   - Lỗi (Failed):              ${failCount}`);
    console.log(`   - Tạm hoãn (Skipped):        ${skipCount}`);
    console.log(`   - Tỷ lệ đạt thực thi:        ${executionPassRate}% (${passCount}/${executed})`);
    console.log(`   - Độ phủ nghiệm thu:         ${overallCoverageRate}% (${passCount}/${totalDesigned})`);
    console.log('================================================================\n');

    const reportData = {
      suite: 'Sprint 3 Gateway, Profile & Reports Test Suite (Phase 2)',
      qaLead: 'Trần Hà Thảo Vân (MSSV: BCS250039, @vuonghathaovan-gif — Issue #15)',
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      totalDesigned,
      executed,
      passed: passCount,
      failed: failCount,
      skipped: skipCount,
      executionPassRate: `${executionPassRate}%`,
      overallCoverageRate: `${overallCoverageRate}%`,
      results,
    };

    const outPath = path.resolve(process.cwd(), 'qa-scripts/sprint3-phase2-results.json');
    fs.writeFileSync(outPath, JSON.stringify(reportData, null, 2), 'utf8');
    log(`Báo cáo kết quả kiểm thử đã được lưu vào: ${outPath}`);
  }
}

runPhase2().catch(err => {
  console.error('Lỗi khi chạy bộ kiểm thử Sprint 3 Pha 2:', err);
  process.exit(1);
});
