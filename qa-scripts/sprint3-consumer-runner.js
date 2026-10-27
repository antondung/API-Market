/**
 * sprint3-consumer-runner.js
 * Automated QA Test Suite for Sprint 3 (Phase 1):
 * - US-18: Playground & Anti-SSRF (TC-18-02 đến TC-18-04, TC-18-07 per Sprint3_TestCases.md;
 *          thêm TC-18-AUTH / TC-18-HEADER / TC-18-PATH bổ sung ngoài tài liệu)
 * - US-19: Try Before Subscribe & Sandbox Quota (TC-19-01 đến TC-19-05 + TC-19-ATOMIC)
 * - US-21: API Key Lifecycle Management (TC-21-01 đến TC-21-06 + TC-21-LIST / TC-21-ISO)
 *
 * Ghi chú mapping TC ID:
 * - Các TC đánh dấu theo tài liệu Sprint3_TestCases.md được giữ nguyên mã gốc.
 * - Các TC bổ sung bảo mật (không có trong tài liệu) dùng hậu tố mô tả (TC-18-AUTH, v.v.)
 *   để phân biệt rõ ràng, tránh nhầm lẫn với bộ TC gốc 46 mã.
 * - TC-18-01 (tài liệu): "Forward thành công tới mock server" — yêu cầu upstream thật có thể
 *   gọi qua public DNS; bị bỏ qua trong môi trường local (upstream loopback bị SSRF block).
 * - TC-18-05 (tài liệu): "Redirect → 502" — cần upstream mock trả 302; skip ở đây.
 * - TC-18-06 (tài liệu): "Timeout > 10s → 504" — cần upstream delay mock; skip ở đây.
 *   Ghi nhận cả 3 TC bị skip vào JSON kết quả với status SKIPPED.
 *
 * Technical References:
 * - backend/SPRINT-3-CONSUMER-HANDOFF.md
 * - docs/test/Sprint3_AcceptanceCriteria.md
 * - docs/test/Sprint3_TestCases.md
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
  console.log('   QA Lead: Trần Hà Thảo Vân (@vuonghathaovan-gif — Issue #15)');
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

  // Khởi tạo các tài khoản Consumer test riêng biệt cho đợt kiểm thử này
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

  // Đăng nhập lấy access token
  const loginA = await apiRequest('POST', '/api/auth/login', { body: { email: consumerA.email, password: consumerA.password } });
  const loginB = await apiRequest('POST', '/api/auth/login', { body: { email: consumerB.email, password: consumerB.password } });

  const tokenA = loginA.data?.data?.accessToken;
  const userA = loginA.data?.data?.user;
  const tokenB = loginB.data?.data?.accessToken;
  const userB = loginB.data?.data?.user;

  if (!tokenA || !tokenB) {
    console.error('❌ Đăng nhập Consumer thất bại, không có accessToken.');
    process.exit(1);
  }
  log(`Consumer A đăng nhập thành công (ID: ${userA.id}, Email: ${userA.email})`);
  log(`Consumer B đăng nhập thành công (ID: ${userB.id}, Email: ${userB.email})`);

  // Tìm các API Published từ DB để phục vụ kiểm thử
  const apisRes = await pool.query(`
    SELECT a.id, a.name, a.status, a.base_url, p.id as provider_id, p.provider_name
    FROM apis a
    JOIN api_providers p ON p.id = a.provider_id
    JOIN users u ON u.id = p.user_id
    WHERE a.status = 'Published' AND u.is_active = TRUE
    ORDER BY a.id ASC
  `);

  if (apisRes.rows.length === 0) {
    console.error('❌ Không tìm thấy API Published nào trong DB. Cần ít nhất 1 API để kiểm thử.');
    process.exit(1);
  }

  const publishedApis = apisRes.rows;
  log(`Đã nạp ${publishedApis.length} API Published từ DB.`);

  // Chọn API mục tiêu chính cho test Sandbox & API Key
  const targetApi = publishedApis[0];
  const targetApiId = String(targetApi.id);

  // Lấy endpoints của target API
  const endpointsRes = await pool.query(
    'SELECT id, method, path, description FROM api_endpoints WHERE api_id = $1 ORDER BY id ASC',
    [targetApiId]
  );
  const targetEndpoints = endpointsRes.rows;
  const validEndpointId = targetEndpoints.length > 0 ? String(targetEndpoints[0].id) : null;
  log(`API mục tiêu ID ${targetApiId} ("${targetApi.name}") có ${targetEndpoints.length} endpoints.`);

  // Tìm hoặc tạo một API trỏ tới loopback để kiểm tra SSRF
  let ssrfApi = publishedApis.find(a => a.base_url.includes('localhost') || a.base_url.includes('127.0.0.1'));
  let tempSsrfCreated = false;
  let tempSsrfApiId = null;

  if (!ssrfApi) {
    // Tạo 1 API Published giả lập trỏ tới loopback để test Anti-SSRF
    const provId = targetApi.provider_id;
    const inserted = await pool.query(`
      INSERT INTO apis(provider_id, name, description, category, base_url, status, published_at)
      VALUES($1, 'SSRF Test Loopback API', 'QA SSRF Protection Test', 'Utility', 'http://127.0.0.1:3000', 'Published', NOW())
      RETURNING id
    `, [provId]);
    tempSsrfApiId = String(inserted.rows[0].id);
    const verRes = await pool.query('INSERT INTO api_versions(api_id, version) VALUES($1, \'1.0\') RETURNING id', [tempSsrfApiId]);
    await pool.query('INSERT INTO api_endpoints(api_id, version_id, method, path, description) VALUES($1, $2, \'GET\', \'/test\', \'Test SSRF\')', [tempSsrfApiId, verRes.rows[0].id]);
    ssrfApi = { id: tempSsrfApiId, name: 'SSRF Test Loopback API', base_url: 'http://127.0.0.1:3000' };
    tempSsrfCreated = true;
    log(`Đã khởi tạo API test SSRF tạm thời ID ${tempSsrfApiId} (base_url: http://127.0.0.1:3000).`);
  }

  // =========================================================================
  // SUITE 1: US-18 — Thử nghiệm API Trực quan (Playground) & Phòng chống SSRF
  // =========================================================================
  console.log('\n--- [SUITE 1] US-18: Thử nghiệm Playground & Phòng chống SSRF ---');

  // Ghi nhận 3 TC gốc bị SKIPPED do môi trường local không có upstream public
  // TC-18-01 (tài liệu): Forward thành công → 200 + latency (cần upstream public DNS, không có ở local)
  // TC-18-05 (tài liệu): Redirect 302 → 502 UPSTREAM_REDIRECT_BLOCKED (cần mock trả redirect)
  // TC-18-06 (tài liệu): Timeout >10s → 504 UPSTREAM_TIMEOUT (cần mock delay >10s)
  for (const [tcId, reason] of [
    ['TC-18-01', 'Upstream forward thật cần public DNS endpoint — không khả dụng ở localhost/SSRF env'],
    ['TC-18-05', 'Cần mock upstream trả 302 Redirect → skip ở local'],
    ['TC-18-06', 'Cần mock upstream delay >10s → skip ở local']
  ]) {
    results.push({
      testCaseId: tcId, userStory: 'US-18',
      name: `[SKIPPED] ${reason}`,
      status: 'SKIPPED', timestamp: new Date().toISOString(),
      details: { reason }, notes: 'Cần staging environment hoặc mock server'
    });
    console.log(`  ⏭️ [SKIP] ${tcId}: ${reason}`);
  }

  // Lấy endpoint của ssrfApi
  const ssrfEpRes = await pool.query('SELECT id, path FROM api_endpoints WHERE api_id = $1 LIMIT 1', [ssrfApi.id]);
  const ssrfEndpointId = String(ssrfEpRes.rows[0].id);

  // TC-18-AUTH: Yêu cầu xác thực JWT & Role Consumer đối với Playground
  // (Bổ sung ngoài tài liệu — TC-18-01 gốc yêu cầu upstream thật, không khả dụng ở môi trường local/SSRF)
  {
    const resNoAuth = await apiRequest('POST', `/api/marketplace/apis/${targetApiId}/playground`, {
      body: { endpointId: validEndpointId || '1' }
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
    const res = await apiRequest('POST', `/api/marketplace/apis/${ssrfApi.id}/playground`, {
      headers: { Authorization: `Bearer ${tokenA}` },
      body: { endpointId: ssrfEndpointId }
    });
    const passed = res.status === 403 && res.data?.error?.code === 'SSRF_DETECTED';
    await recordResult('TC-18-02', 'US-18', 'Chặn SSRF Loopback IPv4 (127.0.0.1 / localhost) với 403 SSRF_DETECTED', passed, {
      status: res.status,
      code: res.data?.error?.code,
      message: res.data?.error?.message
    });
  }

  // TC-18-03: Chặn SSRF với Private Subnet RFC 1918 (10.0.0.1, 192.168.1.1)
  // Mapping: TC-18-03 trong Sprint3_TestCases.md — Critical Security
  {
    // Cập nhật tạm route hoặc base_url sang 10.0.0.1
    await pool.query('INSERT INTO gateway_routes(api_id, upstream_base_url) VALUES($1, \'http://10.0.0.1:8080\') ON CONFLICT(api_id) DO UPDATE SET upstream_base_url = \'http://10.0.0.1:8080\', is_enabled = true', [ssrfApi.id]);
    const res = await apiRequest('POST', `/api/marketplace/apis/${ssrfApi.id}/playground`, {
      headers: { Authorization: `Bearer ${tokenA}` },
      body: { endpointId: ssrfEndpointId }
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
    await pool.query('UPDATE gateway_routes SET upstream_base_url = \'http://169.254.169.254\' WHERE api_id = $1', [ssrfApi.id]);
    const res = await apiRequest('POST', `/api/marketplace/apis/${ssrfApi.id}/playground`, {
      headers: { Authorization: `Bearer ${tokenA}` },
      body: { endpointId: ssrfEndpointId }
    });
    const passed = res.status === 403 && res.data?.error?.code === 'SSRF_DETECTED';
    await recordResult('TC-18-04', 'US-18', 'Chặn SSRF Cloud Metadata Service (169.254.169.254) với 403 SSRF_DETECTED', passed, {
      status: res.status,
      code: res.data?.error?.code
    });
  }

  // TC-18-07 (tài liệu): Chặn Endpoint không đăng ký (Unregistered Endpoint)
  // Mapping: TC-18-07 trong Sprint3_TestCases.md — Medium Negative
  // (TC-18-05 tài liệu = Redirect→502; TC-18-06 tài liệu = Timeout→504; cả hai cần mock upstream → SKIPPED ở môi trường local)
  {
    const res = await apiRequest('POST', `/api/marketplace/apis/${targetApiId}/playground`, {
      headers: { Authorization: `Bearer ${tokenA}` },
      body: { endpointId: '99999999' }
    });
    const passed = res.status === 400 && res.data?.error?.code === 'ENDPOINT_NOT_REGISTERED';
    await recordResult('TC-18-07', 'US-18', '[TC-18-07] Từ chối endpointId không thuộc API với 400 ENDPOINT_NOT_REGISTERED', passed, {
      status: res.status,
      code: res.data?.error?.code
    });
  }

  // TC-18-HEADER: Chặn Header cấm (bổ sung — không có trong 7 TC gốc, thêm từ AC bảo mật)
  // HEADER_NOT_ALLOWED là assertion duy nhất được chấp nhận — không accept VALIDATION_ERROR (quá rộng)
  {
    const res = await apiRequest('POST', `/api/marketplace/apis/${targetApiId}/playground`, {
      headers: { Authorization: `Bearer ${tokenA}` },
      body: {
        endpointId: validEndpointId || '1',
        headers: { Authorization: 'Bearer evil_token', Cookie: 'session=123' }
      }
    });
    // Assertion ketat: chỉ chấp nhận HEADER_NOT_ALLOWED (400). Không accept VALIDATION_ERROR để tránh false positive.
    const passed = res.status === 400 && res.data?.error?.code === 'HEADER_NOT_ALLOWED';
    await recordResult('TC-18-HEADER', 'US-18', '[Bổ sung] Chặn header cấm (Authorization/Cookie) trước khi forward với 400 HEADER_NOT_ALLOWED', passed, {
      status: res.status,
      code: res.data?.error?.code
    });
  }

  // TC-18-PATH: Chặn Path Traversal (bổ sung bảo mật ngoài tài liệu)
  {
    const res = await apiRequest('POST', `/api/marketplace/apis/${targetApiId}/playground`, {
      headers: { Authorization: `Bearer ${tokenA}` },
      body: {
        endpointId: validEndpointId || '1',
        pathParams: { city: '../etc/passwd' }
      }
    });
    // Assertion: phải là 400. ENDPOINT_NOT_REGISTERED khi path template không khớp; VALIDATION_ERROR khi Zod reject.
    const passed = res.status === 400 && ['ENDPOINT_NOT_REGISTERED', 'VALIDATION_ERROR'].includes(res.data?.error?.code);
    await recordResult('TC-18-PATH', 'US-18', '[Bổ sung] Chặn Path Traversal (../) và ký tự nguy hiểm trong pathParams với 400 Bad Request', passed, {
      status: res.status,
      code: res.data?.error?.code
    });
  }

  // TC-18-QUOTA-SAFE: An toàn Quota — SSRF & Lỗi Validation không tiêu tốn lượt Sandbox
  // (Bổ sung từ Checklist Bảo mật US-18 trong Sprint3_TestCases.md Section 3)
  {
    const grantCheck = await pool.query(
      'SELECT used_requests FROM sandbox_grants WHERE consumer_id = $1 AND api_id = $2',
      [userA.id, ssrfApi.id]
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

  // TC-19-01: Cấp grant dùng thử lần đầu (POST /api/consumer/apis/:apiId/sandbox)
  // Mapping: TC-19-01 trong Sprint3_TestCases.md
  // Ghi chú: tài liệu mô tả "trừ 1 lượt, báo còn 4" theo flow Playground; ở đây test POST /sandbox thuần túy
  // không qua Playground → grant cấp 5/5 chưa trừ. Phù hợp với contract SPRINT-3-CONSUMER-HANDOFF.md.
  let initialGrant = null;
  {
    const res = await apiRequest('POST', `/api/consumer/apis/${targetApiId}/sandbox`, {
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
    await recordResult('TC-19-01', 'US-19', 'Cấp grant Sandbox lần đầu trả về 201 Created (5 lượt, hết hạn 24h)', passed, {
      status: res.status,
      data: d
    });
  }

  // TC-19-02: Đọc thông tin grant đã cấp (GET /api/consumer/apis/:apiId/sandbox)
  {
    const res = await apiRequest('GET', `/api/consumer/apis/${targetApiId}/sandbox`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const d = res.data?.data;
    const passed = res.status === 200 &&
      d?.id === initialGrant?.id &&
      d?.remainingRequests === 5 &&
      d?.available === true;
    await recordResult('TC-19-02', 'US-19', 'Truy vấn trạng thái grant trả về đúng quota hiện tại (GET /api/consumer/apis/:id/sandbox)', passed, {
      status: res.status,
      remainingRequests: d?.remainingRequests
    });
  }

  // TC-19-03: Tiêu thụ nguyên tử 5 lượt dùng thử qua consume_sandbox_grant() trong DB
  {
    const remainingTrack = [];
    let consumeOk = true;
    for (let i = 1; i <= 5; i++) {
      try {
        const queryRes = await pool.query('SELECT * FROM consume_sandbox_grant($1, $2)', [userA.id, targetApiId]);
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

  // TC-19-04: Chặn ngay lập tức lượt thứ 6 (SANDBOX_EXHAUSTED)
  {
    let blockedCode = null;
    let blockedStatus = null;
    try {
      await pool.query('SELECT * FROM consume_sandbox_grant($1, $2)', [userA.id, targetApiId]);
    } catch (dbErr) {
      // Postgres procedure throws SQLSTATE 'P0001' with message containing 'exhausted'
      blockedCode = dbErr.code;
    }

    // Kiểm tra tiếp qua HTTP GET trạng thái grant
    const res = await apiRequest('GET', `/api/consumer/apis/${targetApiId}/sandbox`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const d = res.data?.data;
    const passed = blockedCode === 'P0001' && d?.remainingRequests === 0 && d?.available === false;
    await recordResult('TC-19-04', 'US-19', 'Lần gọi thứ 6 bị chặn ngay lập tức (SQLSTATE P0001, remainingRequests: 0, available: false)', passed, {
      dbErrorCode: blockedCode,
      grantStatus: d
    });
  }

  // TC-19-05: Tính bền vững (State Persistence) — Không bị reset khi gọi lại POST hoặc mở phiên mới
  {
    const resPost = await apiRequest('POST', `/api/consumer/apis/${targetApiId}/sandbox`, {
      headers: { Authorization: `Bearer ${tokenA}` },
      body: {}
    });
    const d = resPost.data?.data;
    const passed = resPost.status === 200 &&
      d?.id === initialGrant?.id &&
      d?.usedRequests === 5 &&
      d?.remainingRequests === 0 &&
      d?.available === false;
    await recordResult('TC-19-05', 'US-19', 'State Persistence: Gọi lại POST hoặc tải lại trang không bị reset về 5 lượt (giữ nguyên exhausted)', passed, {
      status: resPost.status,
      remainingRequests: d?.remainingRequests,
      available: d?.available
    });
  }

  // TC-19-06: Chống giả mạo tham số (Tampering Prevention)
  {
    const res = await apiRequest('POST', `/api/consumer/apis/${targetApiId}/sandbox`, {
      headers: { Authorization: `Bearer ${tokenA}` },
      body: { maxRequests: 999 }
    });
    const passed = res.status === 400 && res.data?.error?.code === 'VALIDATION_ERROR';
    await recordResult('TC-19-06', 'US-19', 'Từ chối payload cố tình điều chỉnh quota ({ maxRequests: 999 }) với 400 VALIDATION_ERROR', passed, {
      status: res.status,
      code: res.data?.error?.code
    });
  }

  // TC-19-02 (tài liệu): Concurrency — 5 concurrent, 1 pass, 4 fail
  // Mapping: TC-19-02 trong Sprint3_TestCases.md — Critical Concurrency
  // Ghi chú: Runner dùng 10 concurrent để kiểm tra mạnh hơn (5 pass, 5 fail); đây là superset của TC-19-02.
  // Assert: fulfilled === 5 (chỉ 5), rejected === 5, DB.used_requests === 5 (không tràn, không âm).
  {
    // Cấp grant mới cho Consumer B trên target API
    await pool.query('DELETE FROM sandbox_grants WHERE consumer_id = $1 AND api_id = $2', [userB.id, targetApiId]);
    await pool.query('INSERT INTO sandbox_grants(consumer_id, api_id, max_requests, expires_at) VALUES($1, $2, 5, NOW() + INTERVAL \'24 hours\')', [userB.id, targetApiId]);

    // Gửi đồng thời 10 lệnh consume qua Promise.allSettled
    const concurrentPromises = Array.from({ length: 10 }, () =>
      pool.query('SELECT * FROM consume_sandbox_grant($1, $2)', [userB.id, targetApiId])
    );
    const concurrentResults = await Promise.allSettled(concurrentPromises);
    const fulfilled = concurrentResults.filter(r => r.status === 'fulfilled');
    const rejected = concurrentResults.filter(r => r.status === 'rejected');

    const dbCheck = await pool.query('SELECT used_requests, max_requests FROM sandbox_grants WHERE consumer_id = $1 AND api_id = $2', [userB.id, targetApiId]);
    const finalUsed = dbCheck.rows[0].used_requests;

    const passed = fulfilled.length === 5 && rejected.length === 5 && finalUsed === 5;
    await recordResult('TC-19-02', 'US-19', 'Concurrency Test: Gửi 10 request đồng thời khi có 5 lượt, đúng 5 thành công và 5 bị chặn (used_requests = 5)', passed, {
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
  {
    const res = await apiRequest('POST', '/api/consumer/api-keys', {
      headers: { Authorization: `Bearer ${tokenA}` },
      body: { apiId: targetApiId, label: 'Sprint 3 QA Automation Key' }
    });
    const d = res.data?.data;
    createdKeyA = d;
    rawKeyStringA = d?.key;

    const keyPattern = /^ak_live_[A-Za-z0-9_-]{43}$/;
    const passed = res.status === 201 &&
      Boolean(d?.id) &&
      d?.apiId === targetApiId &&
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

  // TC-21-LIST: Lấy danh sách API Key không làm lộ Secret (bổ sung bảo mật)
  // Mapping: Thuộc phạm vi TC-21-01 trong tài liệu (tài liệu merge việc verify DB và list vào chung)
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
      body: { apiId: targetApiId, label: 'Duplicate Key Attempt' }
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
  // Mapping: TC-21-04 trong Sprint3_TestCases.md — High Security
  // Ghi chú: Gateway HTTP route (US-22) đang nằm ở PR #78 (chưa merge vào develop), đánh dấu SKIPPED chờ Pha 2
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
  // Mapping: TC-21-06 trong Sprint3_TestCases.md — Medium Functional
  // Ghi chú: Chờ Tech Lead Dũng merge PR #78 (Gateway US-22)
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
      body: { apiId: targetApiId, label: 'Isolation Test Key' }
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


  // =========================================================================
  // Dọn dẹp dữ liệu test tạm thời
  // =========================================================================
  log('Dọn dẹp các bản ghi test tạm thời trong PostgreSQL...');
  try {
    if (tempSsrfCreated && tempSsrfApiId) {
      await pool.query('DELETE FROM gateway_routes WHERE api_id = $1', [tempSsrfApiId]);
      await pool.query('DELETE FROM api_endpoints WHERE api_id = $1', [tempSsrfApiId]);
      await pool.query('DELETE FROM api_versions WHERE api_id = $1', [tempSsrfApiId]);
      await pool.query('DELETE FROM apis WHERE id = $1', [tempSsrfApiId]);
    }
    // Dọn dẹp dữ liệu test của Consumer A và Consumer B để giữ DB sạch sẽ
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
  } catch (cleanErr) {
    log(`Cảnh báo khi dọn dẹp: ${cleanErr.message}`);
  }

  // =========================================================================
  // Tổng kết & Xuất báo cáo kết quả
  // =========================================================================
  console.log('\n================================================================');
  console.log(`   KẾT QUẢ KIỂM THỬ SPRINT 3 (PHA 1): ${passCount} PASS / ${failCount} FAIL (Tổng số: ${results.length})`);
  console.log('================================================================\n');

  const reportPath = path.resolve('qa-scripts/sprint3-consumer-results.json');
  const summaryData = {
    suite: 'Sprint 3 Consumer & Security Test Suite (Phase 1)',
    qaLead: 'Trần Hà Thảo Vân (@vuonghathaovan-gif — Issue #15)',
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    total: results.length,
    passed: passCount,
    failed: failCount,
    passRate: `${((passCount / results.length) * 100).toFixed(1)}%`,
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

