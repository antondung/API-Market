/**
 * sprint3-consumer-runner.js
 * Automated QA Test Suite for Sprint 3 (Phase 1):
 * - US-18: Playground & Anti-SSRF (TC-18-02..04, TC-18-07; TC-18-01, 05, 06 SKIPPED)
 * - US-19: Try Before Subscribe & Sandbox Quota (TC-19-01..05 + Boundary Concurrency)
 * - US-21: API Key Lifecycle Management (TC-21-01..03, TC-21-05; TC-21-04, 06 SKIPPED)
 *
 * Tiêu chuẩn & Nguyên tắc Kiểm toán:
 * 1. Data Overwrite Isolation: Luôn khởi tạo Test API độc lập (isolatedApiId),
 *    tuyệt đối không sửa hay ghi đè gateway_routes của bất kỳ API seed nào trong DB.
 * 2. Idempotency & Cleanliness: Toàn bộ Test API, routes, grants, keys và test users
 *    được dọn dẹp sạch sẽ trong khối finally.
 * 3. Concurrency 1 Lượt Cuối: Test race condition tại đúng điều kiện biên (remaining = 1),
 *    bắn đồng thời 10 requests, assert đúng 1 thành công và 9 bị chặn.
 * 4. Kiểm tra đa tầng: Kết hợp gọi HTTP Endpoint Backend và đối soát Database.
 * 5. Minh bạch số liệu: Phân tách rõ ràng executed, passed, failed, skipped,
 *    executionPassRate và overallCoverageRate.
 *
 * QA Lead: Trần Hà Thảo Vân (MSSV: BCS250039, @vuonghathaovan-gif — Issue #15)
 */

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { Pool } from 'pg';

const BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:3000';
const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:MatKhauCuaToi123!@127.0.0.1:5432/api_market_dev';

const results = [];
let passCount = 0;
let failCount = 0;

let pool = null;
try {
  pool = new Pool({ connectionString: DB_URL, connectionTimeoutMillis: 5000 });
} catch (e) {
  console.warn('[QA Runner] Không thể khởi tạo kết nối DB pool:', e.message);
}

function log(msg) {
  console.log(`[QA Runner] ${msg}`);
}

async function recordResult(tcId, story, name, passed, details = {}, notes = '') {
  const result = {
    testCaseId: tcId,
    userStory: story,
    name,
    status: passed ? 'PASSED' : 'FAILED',
    timestamp: new Date().toISOString(),
    details,
    notes
  };
  results.push(result);
  if (passed) {
    passCount++;
    console.log(`  ✅ [PASS] ${tcId}: ${name}`);
  } else {
    failCount++;
    console.log(`  ❌ [FAIL] ${tcId}: ${name} — ${JSON.stringify(details.error || details)}`);
  }
}

async function apiRequest(method, endpoint, { headers = {}, query = null, body = null } = {}) {
  const t0 = performance.now();
  let url = `${BASE_URL}${endpoint}`;
  if (query && Object.keys(query).length > 0) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) {
        params.append(k, String(v));
      }
    }
    const qs = params.toString();
    if (qs) url += (url.includes('?') ? '&' : '?') + qs;
  }

  const reqHeaders = {
    Accept: 'application/json',
    ...headers
  };
  if (body !== null && !reqHeaders['Content-Type']) {
    reqHeaders['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(url, {
      method,
      headers: reqHeaders,
      body: body !== null ? JSON.stringify(body) : undefined
    });
    const durationMs = Math.round(performance.now() - t0);
    const contentType = res.headers.get('content-type') || '';
    let data = null;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }
    return {
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      data,
      durationMs
    };
  } catch (err) {
    const durationMs = Math.round(performance.now() - t0);
    return {
      status: 0,
      headers: {},
      data: null,
      error: err.message,
      durationMs
    };
  }
}

async function main() {
  console.log('================================================================');
  console.log('   BỘ KIỂM THỬ TỰ ĐỘNG SPRINT 3 (PHA 1): CONSUMER & SECURITY');
  console.log('   Phạm vi: US-18 (Playground & SSRF), US-19 (Sandbox), US-21 (API Key)');
  console.log(`   Target Base URL: ${BASE_URL}`);
  console.log(`   Database URL:    ${DB_URL.replace(/:[^:@]+@/, ':***@')}`);
  console.log('   QA Lead: Trần Hà Thảo Vân (MSSV: BCS250039, @vuonghathaovan-gif)');
  console.log('================================================================\n');

  // Kiểm tra sức khỏe Backend
  const healthCheck = await apiRequest('GET', '/health');
  if (healthCheck.status !== 200) {
    console.error(`❌ Máy chủ ${BASE_URL} không phản hồi /health hợp lệ (status: ${healthCheck.status}).`);
    process.exit(1);
  }
  log('Máy chủ Backend đang phản hồi tốt (200 OK).');

  if (!pool) {
    console.error('❌ Cần kết nối PostgreSQL để đối soát DB cho US-19 và US-21.');
    process.exit(1);
  }

  // Khai báo các biến tài nguyên dùng chung để dọn dẹp trong khối finally
  let isolatedApiId = null;
  let isolatedEndpointId = null;
  let userA = null;
  let userB = null;

  try {
    // -------------------------------------------------------------------------
    // BƯỚC 1: KHỞI TẠO TÀI KHOẢN CONSUMER TEST ĐỘC LẬP
    // -------------------------------------------------------------------------
    const timestamp = Date.now();
    const consumerA = {
      email: `qa-consumer-a-${timestamp}@test.local`,
      password: 'Password@12345!',
      name: 'QA Consumer A',
      role: 'Consumer'
    };
    const consumerB = {
      email: `qa-consumer-b-${timestamp}@test.local`,
      password: 'Password@12345!',
      name: 'QA Consumer B (Stranger)',
      role: 'Consumer'
    };

    log('Đăng ký tài khoản kiểm thử Consumer A và Consumer B...');
    const regA = await apiRequest('POST', '/api/auth/register', { body: consumerA });
    const regB = await apiRequest('POST', '/api/auth/register', { body: consumerB });

    if (![200, 201].includes(regA.status) || ![200, 201].includes(regB.status)) {
      console.error('❌ Đăng ký Consumer thất bại:', regA.data, regB.data);
      process.exit(1);
    }

    const loginA = await apiRequest('POST', '/api/auth/login', { body: { email: consumerA.email, password: consumerA.password } });
    const loginB = await apiRequest('POST', '/api/auth/login', { body: { email: consumerB.email, password: consumerB.password } });

    const tokenA = loginA.data?.data?.accessToken;
    userA = loginA.data?.data?.user;
    const tokenB = loginB.data?.data?.accessToken;
    userB = loginB.data?.data?.user;

    if (!tokenA || !tokenB) {
      console.error('❌ Đăng nhập Consumer thất bại, không có accessToken.');
      process.exit(1);
    }
    log(`Consumer A đăng nhập thành công (ID: ${userA.id}, Email: ${userA.email})`);
    log(`Consumer B đăng nhập thành công (ID: ${userB.id}, Email: ${userB.email})`);

    // -------------------------------------------------------------------------
    // BƯỚC 2: KHỞI TẠO TEST API ĐỘC LẬP (DATA OVERWRITE ISOLATION)
    // Tuyệt đối không can thiệp hay sửa đổi gateway_routes của bất kỳ seed API nào.
    // -------------------------------------------------------------------------
    log('Khởi tạo Test API độc lập riêng biệt cho phiên chạy kiểm thử...');
    const provQuery = await pool.query(`
      SELECT p.id FROM api_providers p
      JOIN users u ON u.id = p.user_id
      JOIN provider_verifications pv ON pv.provider_id = p.id
      WHERE u.is_active = TRUE AND pv.status = 'Verified'
      LIMIT 1
    `);
    if (provQuery.rows.length === 0) {
      throw new Error('Không tìm thấy active verified provider nào trong database để tạo Test API.');
    }
    const testProviderId = provQuery.rows[0].id;

    // Tạo API với trạng thái Draft, sau đó chuyển dần sang Published tuân thủ đúng trigger enforce_api_status_transition()
    const apiInsertRes = await pool.query(`
      INSERT INTO apis(provider_id, name, description, category, base_url, status)
      VALUES($1, 'QA Isolated Test API ' || $2, 'Dedicated isolated test API for Sprint 3 QA', 'Utility', 'http://127.0.0.1:3000', 'Draft')
      RETURNING id
    `, [testProviderId, timestamp]);
    isolatedApiId = String(apiInsertRes.rows[0].id);

    await pool.query("UPDATE apis SET status = 'Submitted' WHERE id = $1", [isolatedApiId]);
    await pool.query("UPDATE apis SET status = 'Under Review' WHERE id = $1", [isolatedApiId]);
    await pool.query("UPDATE apis SET status = 'Approved' WHERE id = $1", [isolatedApiId]);
    await pool.query("UPDATE apis SET status = 'Published' WHERE id = $1", [isolatedApiId]);

    // Tạo Version
    const verRes = await pool.query(`
      INSERT INTO api_versions(api_id, version) VALUES($1, '1.0') RETURNING id
    `, [isolatedApiId]);
    const versionId = verRes.rows[0].id;

    // Tạo Endpoint hợp lệ
    const epRes = await pool.query(`
      INSERT INTO api_endpoints(api_id, version_id, method, path, description)
      VALUES($1, $2, 'GET', '/weather/current', 'Weather Current Endpoint')
      RETURNING id
    `, [isolatedApiId, versionId]);
    isolatedEndpointId = String(epRes.rows[0].id);

    // Tạo Gateway Route ban đầu cho isolatedApiId
    await pool.query(`
      INSERT INTO gateway_routes(api_id, upstream_base_url, is_enabled)
      VALUES($1, 'http://127.0.0.1:3000', true)
    `, [isolatedApiId]);

    log(`Đã khởi tạo thành công Isolated Test API (ID: ${isolatedApiId}, Endpoint ID: ${isolatedEndpointId}).`);

    // =========================================================================
    // SUITE 1: US-18 — Thử nghiệm API Trực quan (Playground) & Phòng chống SSRF
    // =========================================================================
    console.log('\n--- [SUITE 1] US-18: Thử nghiệm Playground & Phòng chống SSRF ---');

    // Ghi nhận 3 TC gốc bị SKIPPED (có lý do kỹ thuật rõ ràng)
    for (const [tcId, reason] of [
      ['TC-18-01', 'Upstream forward thật cần public DNS endpoint — không khả dụng ở localhost/SSRF env'],
      ['TC-18-05', 'Cần mock upstream trả 302 Redirect — sẽ nghiệm thu tại staging'],
      ['TC-18-06', 'Cần mock upstream delay >10s — SafeProxy unit test đã chứng minh 504 UPSTREAM_TIMEOUT']
    ]) {
      results.push({
        testCaseId: tcId,
        userStory: 'US-18',
        name: `[SKIPPED] ${reason}`,
        status: 'SKIPPED',
        timestamp: new Date().toISOString(),
        details: { reason },
        notes: 'Chờ môi trường staging hoặc mock upstream'
      });
      console.log(`  ⏭️ [SKIP] ${tcId}: ${reason}`);
    }

    // TC-18-AUTH: Yêu cầu xác thực JWT & Role Consumer đối với Playground
    {
      const resNoAuth = await apiRequest('POST', `/api/marketplace/apis/${isolatedApiId}/playground`, {
        body: { endpointId: isolatedEndpointId }
      });
      const passed = resNoAuth.status === 401 && resNoAuth.data?.error?.code === 'UNAUTHORIZED';
      await recordResult('TC-18-AUTH', 'US-18', '[Bổ sung] Playground yêu cầu xác thực Consumer JWT (từ chối 401 khi thiếu token)', passed, {
        status: resNoAuth.status,
        code: resNoAuth.data?.error?.code
      });
    }

    // TC-18-02: Chặn SSRF với Loopback IPv4 (127.0.0.1 / localhost)
    // Mapping: TC-18-02 trong Sprint3_TestCases.md — Critical Security
    {
      const res = await apiRequest('POST', `/api/marketplace/apis/${isolatedApiId}/playground`, {
        headers: { Authorization: `Bearer ${tokenA}` },
        body: { endpointId: isolatedEndpointId }
      });
      const passed = res.status === 403 && res.data?.error?.code === 'SSRF_DETECTED';
      await recordResult('TC-18-02', 'US-18', 'Chặn SSRF Loopback IPv4 (127.0.0.1 / localhost) với 403 SSRF_DETECTED', passed, {
        status: res.status,
        code: res.data?.error?.code,
        message: res.data?.error?.message
      });
    }

    // TC-18-03: Chặn SSRF với Private Subnet RFC 1918 (10.0.0.1)
    // Mapping: TC-18-03 trong Sprint3_TestCases.md — Critical Security
    {
      await pool.query('UPDATE gateway_routes SET upstream_base_url = \'http://10.0.0.1:8080\' WHERE api_id = $1', [isolatedApiId]);
      const res = await apiRequest('POST', `/api/marketplace/apis/${isolatedApiId}/playground`, {
        headers: { Authorization: `Bearer ${tokenA}` },
        body: { endpointId: isolatedEndpointId }
      });
      const passed = res.status === 403 && res.data?.error?.code === 'SSRF_DETECTED';
      await recordResult('TC-18-03', 'US-18', 'Chặn SSRF Private Network RFC 1918 (10.0.0.1) với 403 SSRF_DETECTED', passed, {
        status: res.status,
        code: res.data?.error?.code
      });
    }

    // TC-18-04: Chặn SSRF với Cloud Metadata Service (169.254.169.254)
    // Mapping: TC-18-04 trong Sprint3_TestCases.md — Critical Security
    {
      await pool.query('UPDATE gateway_routes SET upstream_base_url = \'http://169.254.169.254\' WHERE api_id = $1', [isolatedApiId]);
      const res = await apiRequest('POST', `/api/marketplace/apis/${isolatedApiId}/playground`, {
        headers: { Authorization: `Bearer ${tokenA}` },
        body: { endpointId: isolatedEndpointId }
      });
      const passed = res.status === 403 && res.data?.error?.code === 'SSRF_DETECTED';
      await recordResult('TC-18-04', 'US-18', 'Chặn SSRF Cloud Metadata Service (169.254.169.254) với 403 SSRF_DETECTED', passed, {
        status: res.status,
        code: res.data?.error?.code
      });
    }

    // TC-18-07: Chặn Endpoint không đăng ký (Unregistered Endpoint)
    // Mapping: TC-18-07 trong Sprint3_TestCases.md — Medium Negative
    {
      const res = await apiRequest('POST', `/api/marketplace/apis/${isolatedApiId}/playground`, {
        headers: { Authorization: `Bearer ${tokenA}` },
        body: { endpointId: '99999999' }
      });
      const passed = res.status === 400 && res.data?.error?.code === 'ENDPOINT_NOT_REGISTERED';
      await recordResult('TC-18-07', 'US-18', '[TC-18-07] Từ chối endpointId không thuộc API với 400 ENDPOINT_NOT_REGISTERED', passed, {
        status: res.status,
        code: res.data?.error?.code
      });
    }

    // TC-18-HEADER: Chặn Header cấm (Chỉ cho phép accept, accept-language, content-type)
    {
      const res = await apiRequest('POST', `/api/marketplace/apis/${isolatedApiId}/playground`, {
        headers: { Authorization: `Bearer ${tokenA}` },
        body: {
          endpointId: isolatedEndpointId,
          headers: { Authorization: 'Bearer evil_token', Cookie: 'session=123' }
        }
      });
      const passed = res.status === 400 && res.data?.error?.code === 'HEADER_NOT_ALLOWED';
      await recordResult('TC-18-HEADER', 'US-18', '[Bổ sung] Chặn header cấm (Authorization/Cookie) trước khi forward với 400 HEADER_NOT_ALLOWED', passed, {
        status: res.status,
        code: res.data?.error?.code
      });
    }

    // TC-18-PATH: Chặn Path Traversal và ký tự nguy hiểm
    {
      const res = await apiRequest('POST', `/api/marketplace/apis/${isolatedApiId}/playground`, {
        headers: { Authorization: `Bearer ${tokenA}` },
        body: {
          endpointId: isolatedEndpointId,
          pathParams: { city: '../etc/passwd' }
        }
      });
      const passed = res.status === 400 && ['ENDPOINT_NOT_REGISTERED', 'VALIDATION_ERROR'].includes(res.data?.error?.code);
      await recordResult('TC-18-PATH', 'US-18', '[Bổ sung] Chặn Path Traversal (../) và ký tự nguy hiểm trong pathParams với 400 Bad Request', passed, {
        status: res.status,
        code: res.data?.error?.code
      });
    }

    // TC-18-QUOTA-SAFE: An toàn Quota — Các request bị chặn SSRF/Validation tuyệt đối không trừ quota
    {
      const grantCheck = await pool.query(
        'SELECT used_requests FROM sandbox_grants WHERE consumer_id = $1 AND api_id = $2',
        [userA.id, isolatedApiId]
      );
      const used = grantCheck.rows.length === 0 ? 0 : grantCheck.rows[0].used_requests;
      const passed = used === 0;
      await recordResult('TC-18-QUOTA-SAFE', 'US-18', '[Checklist Bảo mật] Nguyên tắc an toàn quota: Các request bị chặn SSRF/Validation không trừ lượt sandbox (used_requests = 0)', passed, {
        usedRequests: used
      });
    }

    // =========================================================================
    // SUITE 2: US-19 — Trải nghiệm Dùng thử & Sandbox Quota
    // =========================================================================
    console.log('\n--- [SUITE 2] US-19: Trải nghiệm Dùng thử & Sandbox Quota ---');

    // TC-19-01: Cấp grant dùng thử lần đầu qua HTTP (POST /api/consumer/apis/:apiId/sandbox)
    // Mapping: TC-19-01 trong Sprint3_TestCases.md
    let initialGrant = null;
    {
      const res = await apiRequest('POST', `/api/consumer/apis/${isolatedApiId}/sandbox`, {
        headers: { Authorization: `Bearer ${tokenA}` },
        body: {}
      });
      const d = res.data?.data;
      initialGrant = d;
      const passed = [200, 201].includes(res.status) &&
        d?.maxRequests === 5 &&
        d?.remainingRequests === 5 &&
        d?.usedRequests === 0 &&
        d?.available === true &&
        Boolean(d?.expiresAt);
      await recordResult('TC-19-01', 'US-19', 'Cấp grant Sandbox lần đầu qua HTTP trả về 201 Created (5 lượt, hết hạn 24h)', passed, {
        status: res.status,
        data: d
      });
    }

    // TC-19-INFO: Đọc thông tin grant đã cấp qua HTTP (GET /api/consumer/apis/:apiId/sandbox)
    {
      const res = await apiRequest('GET', `/api/consumer/apis/${isolatedApiId}/sandbox`, {
        headers: { Authorization: `Bearer ${tokenA}` }
      });
      const d = res.data?.data;
      const passed = res.status === 200 &&
        d?.id === initialGrant?.id &&
        d?.remainingRequests === 5 &&
        d?.available === true;
      await recordResult('TC-19-INFO', 'US-19', 'Truy vấn trạng thái grant trả về đúng quota hiện tại (GET /api/consumer/apis/:id/sandbox)', passed, {
        status: res.status,
        remainingRequests: d?.remainingRequests
      });
    }

    // TC-19-03: Tiêu thụ 5 lượt Sandbox tuần tự qua consume_sandbox_grant() trong DB
    // Mapping: TC-19-03 trong Sprint3_TestCases.md
    {
      const remainingTrack = [];
      let consumeOk = true;
      for (let i = 1; i <= 5; i++) {
        try {
          const queryRes = await pool.query('SELECT * FROM consume_sandbox_grant($1, $2)', [userA.id, isolatedApiId]);
          const rem = queryRes.rows[0].remaining_requests;
          remainingTrack.push(rem);
          if (rem !== 5 - i) {
            consumeOk = false;
          }
        } catch (err) {
          consumeOk = false;
          break;
        }
      }
      const passed = consumeOk && remainingTrack.length === 5 && remainingTrack[4] === 0;
      await recordResult('TC-19-03', 'US-19', 'Tiêu thụ 5 lượt Sandbox tuần tự qua consume_sandbox_grant(), số lượt giảm chuẩn xác (4 -> 0)', passed, {
        remainingSequence: remainingTrack
      });
    }

    // TC-19-04: Chặn ngay lập tức lượt thứ 6 khi cạn quota (Cả ở DB procedure và HTTP Playground)
    // Mapping: TC-19-04 trong Sprint3_TestCases.md
    {
      let dbBlockedCode = null;
      try {
        await pool.query('SELECT * FROM consume_sandbox_grant($1, $2)', [userA.id, isolatedApiId]);
      } catch (dbErr) {
        dbBlockedCode = dbErr.code; // SQLSTATE 'P0001'
      }

      // Kiểm tra tầng HTTP GET đọc trạng thái grant
      const resGet = await apiRequest('GET', `/api/consumer/apis/${isolatedApiId}/sandbox`, {
        headers: { Authorization: `Bearer ${tokenA}` }
      });
      const d = resGet.data?.data;
      const passed = dbBlockedCode === 'P0001' && d?.remainingRequests === 0 && d?.available === false;
      await recordResult('TC-19-04', 'US-19', 'Lần gọi thứ 6 bị chặn ngay lập tức (SQLSTATE P0001, remainingRequests: 0, available: false)', passed, {
        dbErrorCode: dbBlockedCode,
        grantStatus: d
      });
    }

    // TC-19-05: Tính bền vững (State Persistence) — Không bị reset khi gọi lại POST hoặc mở phiên mới
    // Mapping: TC-19-05 trong Sprint3_TestCases.md
    {
      const resPost = await apiRequest('POST', `/api/consumer/apis/${isolatedApiId}/sandbox`, {
        headers: { Authorization: `Bearer ${tokenA}` },
        body: {}
      });
      const d = resPost.data?.data;
      const passed = resPost.status === 200 &&
        d?.id === initialGrant?.id &&
        d?.usedRequests === 5 &&
        d?.remainingRequests === 0 &&
        d?.available === false;
      await recordResult('TC-19-05', 'US-19', 'State Persistence: Gọi lại POST qua HTTP không bị reset về 5 lượt (giữ nguyên exhausted)', passed, {
        status: resPost.status,
        remainingRequests: d?.remainingRequests,
        available: d?.available
      });
    }

    // TC-19-TAMPER: Chống giả mạo tham số (Tampering Prevention)
    {
      const res = await apiRequest('POST', `/api/consumer/apis/${isolatedApiId}/sandbox`, {
        headers: { Authorization: `Bearer ${tokenA}` },
        body: { maxRequests: 999 }
      });
      const passed = res.status === 400 && res.data?.error?.code === 'VALIDATION_ERROR';
      await recordResult('TC-19-TAMPER', 'US-19', '[Bổ sung] Từ chối payload cố tình điều chỉnh quota ({ maxRequests: 999 }) với 400 VALIDATION_ERROR', passed, {
        status: res.status,
        code: res.data?.error?.code
      });
    }

    // TC-19-02: Kiểm thử tính nguyên tử khi gửi yêu cầu đồng thời (Concurrency Test)
    // Mapping: TC-19-02 trong Sprint3_TestCases.md — Critical Concurrency
    // Điều kiện biên chuẩn xác theo thiết kế: Consumer chỉ còn đúng 1 lượt dùng thử duy nhất (used = 4, max = 5)
    {
      // Cấp grant mới cho Consumer B trên isolatedApiId
      await pool.query('DELETE FROM sandbox_grants WHERE consumer_id = $1 AND api_id = $2', [userB.id, isolatedApiId]);
      await pool.query('INSERT INTO sandbox_grants(consumer_id, api_id, max_requests, used_requests, expires_at) VALUES($1, $2, 5, 4, NOW() + INTERVAL \'24 hours\')', [userB.id, isolatedApiId]);

      // Xác nhận trước khi bắn: chỉ còn đúng 1 lượt duy nhất
      const preCheck = await pool.query('SELECT max_requests - used_requests AS remaining FROM sandbox_grants WHERE consumer_id = $1 AND api_id = $2', [userB.id, isolatedApiId]);
      const initialRemaining = preCheck.rows[0].remaining;

      // Bắn đồng thời 10 lệnh consume qua Promise.allSettled
      const concurrentPromises = Array.from({ length: 10 }, () =>
        pool.query('SELECT * FROM consume_sandbox_grant($1, $2)', [userB.id, isolatedApiId])
      );
      const concurrentResults = await Promise.allSettled(concurrentPromises);
      const fulfilled = concurrentResults.filter(r => r.status === 'fulfilled');
      const rejected = concurrentResults.filter(r => r.status === 'rejected');

      const dbCheck = await pool.query('SELECT used_requests, max_requests FROM sandbox_grants WHERE consumer_id = $1 AND api_id = $2', [userB.id, isolatedApiId]);
      const finalUsed = dbCheck.rows[0].used_requests;

      // Assert khắt khe: ĐÚNG 1 request thành công, 9 request bị từ chối, và used_requests chốt đúng bằng 5
      const passed = initialRemaining === 1 && fulfilled.length === 1 && rejected.length === 9 && finalUsed === 5;
      await recordResult('TC-19-02', 'US-19', 'Concurrency Boundary Test: Chỉ còn 1 lượt cuối, bắn đồng thời 10 requests -> đúng 1 thành công, 9 bị chặn (used = 5)', passed, {
        initialRemaining,
        successCount: fulfilled.length,
        blockedCount: rejected.length,
        dbUsedRequests: finalUsed
      });
    }

    // =========================================================================
    // SUITE 3: US-21 — Quản lý Vòng đời Khóa API (API Key Lifecycle Management)
    // =========================================================================
    console.log('\n--- [SUITE 3] US-21: Quản lý Vòng đời Khóa API (API Key Lifecycle) ---');

    let createdKeyA = null;
    let rawKeyStringA = null;

    // TC-21-01: Tạo API Key mới & Nguyên tắc "Chỉ hiển thị 1 lần"
    // Mapping: TC-21-01 trong Sprint3_TestCases.md — Critical Security
    {
      const res = await apiRequest('POST', '/api/consumer/api-keys', {
        headers: { Authorization: `Bearer ${tokenA}` },
        body: { apiId: isolatedApiId, label: 'Sprint 3 QA Automation Key' }
      });
      const d = res.data?.data;
      createdKeyA = d;
      rawKeyStringA = d?.key;

      const keyPattern = /^ak_live_[A-Za-z0-9_-]{43}$/;
      const passed = res.status === 201 &&
        Boolean(d?.id) &&
        d?.apiId === isolatedApiId &&
        d?.isActive === true &&
        typeof rawKeyStringA === 'string' &&
        keyPattern.test(rawKeyStringA) &&
        d?.keyPrefix === rawKeyStringA.slice(0, 16);

      await recordResult('TC-21-01', 'US-21', 'Tạo API Key thành công (201 Created), sinh định dạng chuẩn ak_live_*** đúng 1 lần', passed, {
        status: res.status,
        id: d?.id,
        keyPrefix: d?.keyPrefix,
        keyFormatValid: keyPattern.test(rawKeyStringA || '')
      });
    }

    // TC-21-02: Kiểm tra lưu trữ DB — Băm SHA-256 (64 ký tự hex), không lưu plaintext
    // Mapping: TC-21-02 trong Sprint3_TestCases.md — Critical DB Verification
    {
      const dbRes = await pool.query('SELECT * FROM api_keys WHERE id = $1', [createdKeyA?.id]);
      const row = dbRes.rows[0];
      const computedHash = createHash('sha256').update(rawKeyStringA || '').digest('hex');

      const is64Hex = /^[0-9a-f]{64}$/.test(row?.key_hash || '');
      const hashMatched = row?.key_hash === computedHash;
      const plaintextNotInDb = !JSON.stringify(row).includes(rawKeyStringA || '');

      const passed = Boolean(row) && is64Hex && hashMatched && plaintextNotInDb;
      await recordResult('TC-21-02', 'US-21', 'Xác thực Database: Cột key_hash lưu đúng chuỗi SHA-256 64 hex, tuyệt đối không lưu plaintext key', passed, {
        storedHash: row?.key_hash,
        computedHash,
        hashMatched,
        plaintextNotInDb
      });
    }

    // TC-21-LIST: Lấy danh sách API Key không làm lộ Secret
    {
      const res = await apiRequest('GET', '/api/consumer/api-keys', {
        headers: { Authorization: `Bearer ${tokenA}` }
      });
      const d = res.data?.data;
      const items = d?.items || [];
      const targetItem = items.find(k => k.id === createdKeyA?.id);

      const hasNoRawKey = items.every(k => !k.key);
      const hasNoHash = items.every(k => !k.keyHash && !k.key_hash);
      const hasPrefix = Boolean(targetItem?.keyPrefix);
      const hasNoStore = res.headers['cache-control']?.includes('no-store');

      const passed = res.status === 200 &&
        Array.isArray(items) &&
        items.length > 0 &&
        hasNoRawKey &&
        hasNoHash &&
        hasPrefix &&
        hasNoStore;

      await recordResult('TC-21-LIST', 'US-21', '[Bổ sung] Danh sách API Key chỉ hiển thị keyPrefix, tuyệt đối không lộ rawKey hay key_hash (Cache-Control: no-store)', passed, {
        status: res.status,
        itemsCount: items.length,
        samplePrefix: targetItem?.keyPrefix,
        hasNoRawKey,
        hasNoHash
      });
    }

    // TC-21-LIMIT: Ràng buộc duy nhất 1 key active / Consumer / API (Bổ sung nghiệp vụ)
    {
      const res = await apiRequest('POST', '/api/consumer/api-keys', {
        headers: { Authorization: `Bearer ${tokenA}` },
        body: { apiId: isolatedApiId, label: 'Duplicate Key Attempt' }
      });
      const passed = res.status === 409 && res.data?.error?.code === 'KEY_EXISTS';
      await recordResult('TC-21-LIMIT', 'US-21', '[Bổ sung nghiệp vụ] Ràng buộc duy nhất 1 key active / Consumer / API (409 KEY_EXISTS)', passed, {
        status: res.status,
        code: res.data?.error?.code
      });
    }

    // TC-21-03: Rotate Key — Cấp key mới, vô hiệu hóa tức thì key cũ
    // Mapping: TC-21-03 trong Sprint3_TestCases.md — High Functional
    let rotatedKey = null;
    {
      const res = await apiRequest('POST', `/api/consumer/api-keys/${createdKeyA?.id}/rotate`, {
        headers: { Authorization: `Bearer ${tokenA}` },
        body: {}
      });
      rotatedKey = res.data?.data;

      const oldKeyInDb = (await pool.query('SELECT is_active, revoked_at FROM api_keys WHERE id = $1', [createdKeyA?.id])).rows[0];
      const newKeyInDb = (await pool.query('SELECT is_active, revoked_at FROM api_keys WHERE id = $1', [rotatedKey?.id])).rows[0];

      const passed = res.status === 201 &&
        Boolean(rotatedKey?.key) &&
        rotatedKey?.key !== rawKeyStringA &&
        oldKeyInDb?.is_active === false &&
        Boolean(oldKeyInDb?.revoked_at) &&
        newKeyInDb?.is_active === true;

      await recordResult('TC-21-03', 'US-21', 'Rotate Key tức thì: Sinh key mới (201), key cũ chuyển is_active=false và revoked_at có thời gian', passed, {
        status: res.status,
        oldKeyActive: oldKeyInDb?.is_active,
        newKeyActive: newKeyInDb?.is_active,
        oldKeyRevokedAt: oldKeyInDb?.revoked_at
      });
    }

    // TC-21-04 (Tài liệu): Dùng khóa cũ vừa bị Rotate gửi request tới Gateway bị từ chối 401
    results.push({
      testCaseId: 'TC-21-04',
      userStory: 'US-21',
      name: '[SKIPPED] Khóa cũ vừa bị Rotate gửi tới Gateway bị từ chối 401 Unauthorized',
      status: 'SKIPPED',
      timestamp: new Date().toISOString(),
      details: { reason: 'Chờ Tech Lead Dũng merge PR #78 (Gateway US-22) vào develop' },
      notes: 'Sẽ nghiệm thu trên Gateway HTTP endpoint sau khi PR #78 merge'
    });
    console.log('  ⏭️ [SKIP] TC-21-04: Khóa cũ vừa bị Rotate gửi tới Gateway (chờ PR #78 Gateway)');

    // TC-21-REVOKED-ROTATE: Ngăn chặn Rotate trên Key đã bị thu hồi (Bổ sung an toàn)
    {
      const res = await apiRequest('POST', `/api/consumer/api-keys/${createdKeyA?.id}/rotate`, {
        headers: { Authorization: `Bearer ${tokenA}` },
        body: {}
      });
      const passed = res.status === 409 && res.data?.error?.code === 'KEY_REVOKED';
      await recordResult('TC-21-REVOKED-ROTATE', 'US-21', '[Bổ sung an toàn] Từ chối Rotate trên key đã bị thu hồi/vô hiệu hóa với 409 KEY_REVOKED', passed, {
        status: res.status,
        code: res.data?.error?.code
      });
    }

    // TC-21-05: Revoke Key (DELETE /api/consumer/api-keys/:id)
    // Mapping: TC-21-05 trong Sprint3_TestCases.md — High Functional
    {
      const res = await apiRequest('DELETE', `/api/consumer/api-keys/${rotatedKey?.id}`, {
        headers: { Authorization: `Bearer ${tokenA}` }
      });

      const keyInDb = (await pool.query('SELECT is_active, revoked_at FROM api_keys WHERE id = $1', [rotatedKey?.id])).rows[0];

      // Thu hồi lại cùng key đó (idempotent 204)
      const resRepeat = await apiRequest('DELETE', `/api/consumer/api-keys/${rotatedKey?.id}`, {
        headers: { Authorization: `Bearer ${tokenA}` }
      });

      const passed = res.status === 204 &&
        keyInDb?.is_active === false &&
        Boolean(keyInDb?.revoked_at) &&
        resRepeat.status === 204;

      await recordResult('TC-21-05', 'US-21', 'Revoke Key tức thì (DELETE 204 No Content), cập nhật is_active=false trong DB (idempotent)', passed, {
        firstDeleteStatus: res.status,
        repeatDeleteStatus: resRepeat.status,
        isActive: keyInDb?.is_active
      });
    }

    // TC-21-06 (Tài liệu): Gửi request qua Gateway thành công bằng API Key cập nhật last_used_at
    results.push({
      testCaseId: 'TC-21-06',
      userStory: 'US-21',
      name: '[SKIPPED] Gửi request qua Gateway bằng API Key active cập nhật last_used_at trong DB',
      status: 'SKIPPED',
      timestamp: new Date().toISOString(),
      details: { reason: 'Chờ Tech Lead Dũng merge PR #78 (Gateway US-22) vào develop' },
      notes: 'Sẽ nghiệm thu trên Gateway HTTP endpoint sau khi PR #78 merge'
    });
    console.log('  ⏭️ [SKIP] TC-21-06: Gửi request Gateway cập nhật last_used_at (chờ PR #78 Gateway)');

    // TC-21-ISO: Cách ly dữ liệu giữa các Consumer (Ownership Isolation - Bổ sung bảo mật)
    {
      // Tạo 1 key mới cho Consumer A để test cách ly
      const resNew = await apiRequest('POST', '/api/consumer/api-keys', {
        headers: { Authorization: `Bearer ${tokenA}` },
        body: { apiId: isolatedApiId, label: 'Isolation Test Key' }
      });
      const keyToProtect = resNew.data?.data;

      // Consumer B cố tình lấy danh sách xem có thấy key của Consumer A không
      const listB = await apiRequest('GET', '/api/consumer/api-keys', {
        headers: { Authorization: `Bearer ${tokenB}` }
      });
      const itemsB = listB.data?.data?.items || [];
      const leaksA = itemsB.some(k => k.id === keyToProtect?.id);

      // Consumer B cố tình xóa key của Consumer A
      const deleteB = await apiRequest('DELETE', `/api/consumer/api-keys/${keyToProtect?.id}`, {
        headers: { Authorization: `Bearer ${tokenB}` }
      });

      // Consumer B cố tình rotate key của Consumer A
      const rotateB = await apiRequest('POST', `/api/consumer/api-keys/${keyToProtect?.id}/rotate`, {
        headers: { Authorization: `Bearer ${tokenB}` },
        body: {}
      });

      const passed = !leaksA && deleteB.status === 404 && rotateB.status === 404;
      await recordResult('TC-21-ISO', 'US-21', '[Bảo mật đa người dùng] Consumer B không thấy và không thao tác được key của Consumer A (404 Not Found)', passed, {
        leaksInStrangerList: leaksA,
        strangerDeleteStatus: deleteB.status,
        strangerRotateStatus: rotateB.status
      });
    }

  } finally {
    // -------------------------------------------------------------------------
    // BƯỚC CLEANUP TRONG KHỐI FINALLY:
    // Đảm bảo dọn dẹp sạch sẽ 100% tài nguyên test, không ảnh hưởng DB
    // -------------------------------------------------------------------------
    log('Dọn dẹp triệt để các bản ghi test tạm thời trong PostgreSQL (Finally block)...');
    try {
      if (isolatedApiId) {
        await pool.query('DELETE FROM gateway_routes WHERE api_id = $1', [isolatedApiId]);
        await pool.query('DELETE FROM api_endpoints WHERE api_id = $1', [isolatedApiId]);
        await pool.query('DELETE FROM api_versions WHERE api_id = $1', [isolatedApiId]);
        await pool.query('DELETE FROM sandbox_grants WHERE api_id = $1', [isolatedApiId]);
        await pool.query('DELETE FROM api_keys WHERE api_id = $1', [isolatedApiId]);
        await pool.query('DELETE FROM apis WHERE id = $1', [isolatedApiId]);
      }
      if (userA?.id) {
        await pool.query('DELETE FROM api_keys WHERE user_id = $1', [userA.id]);
        await pool.query('DELETE FROM sandbox_grants WHERE consumer_id = $1', [userA.id]);
        await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userA.id]);
        await pool.query('DELETE FROM users WHERE id = $1', [userA.id]);
      }
      if (userB?.id) {
        await pool.query('DELETE FROM api_keys WHERE user_id = $1', [userB.id]);
        await pool.query('DELETE FROM sandbox_grants WHERE consumer_id = $1', [userB.id]);
        await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userB.id]);
        await pool.query('DELETE FROM users WHERE id = $1', [userB.id]);
      }
      log('Đã dọn dẹp hoàn tất, cơ sở dữ liệu đã khôi phục nguyên trạng.');
    } catch (cleanErr) {
      console.warn('[QA Cleanup Warning]:', cleanErr.message);
    }
  }

  // =========================================================================
  // Tổng kết & Xuất báo cáo kết quả (Minh bạch hóa metrics)
  // =========================================================================
  const totalDesigned = results.length;
  const skippedCount = results.filter(r => r.status === 'SKIPPED').length;
  const executedCount = passCount + failCount;
  const executionPassRate = executedCount > 0 ? `${((passCount / executedCount) * 100).toFixed(1)}%` : '0.0%';
  const overallCoverageRate = totalDesigned > 0 ? `${((passCount / totalDesigned) * 100).toFixed(1)}%` : '0.0%';

  console.log('\n================================================================');
  console.log('   KẾT QUẢ KIỂM THỬ SPRINT 3 (PHA 1) — MINH BẠCH HÓA SỐ LIỆU');
  console.log(`   - Tổng thiết kế (Designed):  ${totalDesigned}`);
  console.log(`   - Đã thực thi (Executed):    ${executedCount}`);
  console.log(`   - Đạt (Passed):              ${passCount}`);
  console.log(`   - Lỗi (Failed):              ${failCount}`);
  console.log(`   - Tạm hoãn (Skipped):        ${skippedCount}`);
  console.log(`   - Tỷ lệ đạt thực thi:        ${executionPassRate} (${passCount}/${executedCount})`);
  console.log(`   - Độ phủ nghiệm thu:         ${overallCoverageRate} (${passCount}/${totalDesigned})`);
  console.log('================================================================\n');

  const reportPath = path.resolve('qa-scripts/sprint3-consumer-results.json');
  const summaryData = {
    suite: 'Sprint 3 Consumer & Security Test Suite (Phase 1)',
    qaLead: 'Trần Hà Thảo Vân (MSSV: BCS250039, @vuonghathaovan-gif — Issue #15)',
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalDesigned,
    executed: executedCount,
    passed: passCount,
    failed: failCount,
    skipped: skippedCount,
    executionPassRate,
    overallCoverageRate,
    notes: '5 test cases trạng thái SKIPPED (TC-18-01, TC-18-05, TC-18-06, TC-21-04, TC-21-06) do chờ Tech Lead Dũng merge PR #78 (Gateway framework) và upstream public mock. Các case này KHÔNG được tính là PASS.',
    testResults: results
  };

  fs.writeFileSync(reportPath, JSON.stringify(summaryData, null, 2), 'utf-8');
  log(`Báo cáo kết quả kiểm thử đã được lưu vào: ${reportPath}`);

  await pool.end();

  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch(async (err) => {
  console.error('Lỗi nghiêm trọng khi thực thi Test Runner:', err);
  if (pool) await pool.end();
  process.exit(1);
});
