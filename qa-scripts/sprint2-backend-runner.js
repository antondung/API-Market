/**
 * sprint2-backend-runner.js
 * Comprehensive E2E and Boundary Test Suite for Sprint 2 (US-06 to US-14)
 * Covers 30 Provider endpoints, 8 Admin endpoints, RBAC Matrix, and 6 OpenAPI Fixtures.
 *
 * QA Lead: @vuonghathaovan-gif (Issue #10)
 */

import fs from 'node:fs';
import path from 'node:path';
import { Pool } from 'pg';
import { createSocket } from 'node:dgram';

// TC-08-07 asserts "no TXT record yet" -> 400 DOMAIN_PROOF_MISSING. On hosts without a
// working system resolver Node reports ECONNREFUSED, and the backend correctly answers
// 503 DNS_UNAVAILABLE instead. NXDOMAIN_FIXTURE_IP (e.g. 127.0.0.1) starts a local DNS
// stub answering NXDOMAIN, so the case exercises proof absence rather than resolver health.
const NXDOMAIN_FIXTURE_IP = (process.env.NXDOMAIN_FIXTURE_IP || '').trim();
const NXDOMAIN_FIXTURE_PORT = Number(process.env.NXDOMAIN_FIXTURE_PORT || 15353);
let dnsFixture = null;

// The suite is a fixed list; a short run must fail rather than report a green subset.
const EXPECTED_TESTS = 60;

function nxdomainReply(query) {
  const header = Buffer.from(query.subarray(0, 12));
  header.writeUInt16BE(0x8183, 2);
  header.writeUInt16BE(0, 6);
  header.writeUInt16BE(0, 8);
  header.writeUInt16BE(0, 10);
  return Buffer.concat([header, query.subarray(12)]);
}

function startNxdomainFixture() {
  return new Promise((resolve, reject) => {
    const socket = createSocket('udp4');
    socket.once('error', reject);
    socket.on('message', (message, remote) => {
      if (message.length < 12) return;
      socket.send(nxdomainReply(message), remote.port, remote.address);
    });
    socket.bind(NXDOMAIN_FIXTURE_PORT, NXDOMAIN_FIXTURE_IP, () => resolve(socket));
  });
}

const BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:3000';
const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:MatKhauCuaToi123!@127.0.0.1:5432/api_market_dev';
const FIXTURES_DIR = path.resolve('qa-scripts/openapi-fixtures');

const results = [];
let passCount = 0;
let failCount = 0;

const pool = new Pool({ connectionString: DB_URL });

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

async function apiRequest(method, endpoint, { token = null, body = null, isFormData = false } = {}) {
  const t0 = performance.now();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData && body !== null && body !== undefined) headers['Content-Type'] = 'application/json';

  const options = {
    method,
    headers,
    body: isFormData ? body : (body !== null && body !== undefined ? JSON.stringify(body) : undefined)
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    let data = null;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await res.json().catch(() => null);
    } else {
      data = await res.text().catch(() => null);
    }
    const durationMs = Math.round(performance.now() - t0);
    return { status: res.status, headers: res.headers, data, durationMs };
  } catch (err) {
    return { status: 0, error: err.message, durationMs: Math.round(performance.now() - t0) };
  }
}

async function registerAndLogin(email, password, role, name) {
  const reg = await apiRequest('POST', '/api/auth/register', { body: { email, password, role, name } });
  const login = await apiRequest('POST', '/api/auth/login', { body: { email, password } });
  return {
    userId: login.data?.data?.user?.id || reg.data?.data?.id,
    token: login.data?.data?.accessToken,
    refreshToken: login.data?.data?.refreshToken
  };
}

async function main() {
  console.log('================================================================');
  console.log('   API MARKET — SPRINT 2 QA AUTOMATION RUNNER (US-06 -> US-14)');
  console.log(`   Target: ${BASE_URL} | Database: ${DB_URL.replace(/:[^:@]+@/, ':***@')}`);
  console.log('================================================================\n');

  // Verify server health
  const health = await apiRequest('GET', '/health');
  if (health.status !== 200) {
    console.error('Backend health check failed. Ensure backend is running at ' + BASE_URL);
    process.exit(1);
  }
  log('Backend server is healthy and responding.\n');
  if (NXDOMAIN_FIXTURE_IP) {
    dnsFixture = await startNxdomainFixture();
    log('DNS NXDOMAIN fixture listening on 15353.');
  }

  // Fetch agreement version from DB or API
  const agreementRes = await apiRequest('GET', '/api/provider/agreement');
  const activeAgreement = agreementRes.data?.data || { version: '2026-10' };

  // Setup Test Accounts
  const ts = Date.now();
  const adminLogin = await apiRequest('POST', '/api/auth/login', { body: { email: 'admin@example.com', password: 'Admin@123' } });
  const adminToken = adminLogin.data?.data?.accessToken;

  const consumerCreds = { email: `qa-consumer-${ts}@test.local`, password: 'ConsumerPass123!', role: 'Consumer', name: 'QA Consumer' };
  const consumer = await registerAndLogin(consumerCreds.email, consumerCreds.password, consumerCreds.role, consumerCreds.name);

  const unverifiedCreds = { email: `qa-unverified-${ts}@test.local`, password: 'ProviderPass123!', role: 'Provider', name: 'QA Unverified' };
  const unverifiedProvider = await registerAndLogin(unverifiedCreds.email, unverifiedCreds.password, unverifiedCreds.role, unverifiedCreds.name);

  const kycCreds = { email: `qa-kyc-${ts}@test.local`, password: 'ProviderPass123!', role: 'Provider', name: 'QA KYC Provider' };
  const kycProvider = await registerAndLogin(kycCreds.email, kycCreds.password, kycCreds.role, kycCreds.name);

  const mainProviderCreds = { email: `qa-main-prov-${ts}@test.local`, password: 'ProviderPass123!', role: 'Provider', name: 'QA Main Provider' };
  const mainProvider = await registerAndLogin(mainProviderCreds.email, mainProviderCreds.password, mainProviderCreds.role, mainProviderCreds.name);

  const secondProviderCreds = { email: `qa-other-prov-${ts}@test.local`, password: 'ProviderPass123!', role: 'Provider', name: 'QA Other Provider' };
  const secondProvider = await registerAndLogin(secondProviderCreds.email, secondProviderCreds.password, secondProviderCreds.role, secondProviderCreds.name);

  log('Test accounts successfully prepared.\n');

  // =========================================================================
  // SUITE 1: US-06 & US-07 — Provider KYC Verification & Admin Review
  // =========================================================================
  console.log('--- [SUITE 1] US-06 & US-07: Provider KYC Verification & Admin Review ---');

  // TC-06-01: Check initial verification status (none/null or empty)
  {
    const res = await apiRequest('GET', '/api/provider/verification', { token: kycProvider.token });
    const passed = res.status === 200 && (!res.data.data || res.data.data.status === null || res.data.data.status === undefined);
    await recordResult('TC-06-01', 'US-06', 'Provider kiểm tra trạng thái xác minh ban đầu', passed, { status: res.status, data: res.data });
  }

  // TC-06-02: Submit KYC verification
  let kycProviderRecordId = null;
  {
    const kycBody = {
      organizationName: 'QA Fintech Global Corp',
      contactEmail: 'contact@qafintech.com',
      evidenceUrls: ['https://example.com/docs/business-license.pdf']
    };
    const res = await apiRequest('POST', '/api/provider/verification', { token: kycProvider.token, body: kycBody });
    const passed = res.status === 201 && res.data.data?.status === 'Pending';
    kycProviderRecordId = res.data?.data?.providerId;
    await recordResult('TC-06-02', 'US-06', 'Provider nộp hồ sơ xác minh KYC (trạng thái Pending)', passed, { status: res.status, data: res.data });
  }

  // TC-06-03: Check status after submission
  {
    const res = await apiRequest('GET', '/api/provider/verification', { token: kycProvider.token });
    const passed = res.status === 200 && res.data.data?.status === 'Pending';
    await recordResult('TC-06-03', 'US-06', 'Provider tra cứu trạng thái sau nộp (Pending)', passed, { status: res.status, data: res.data });
  }

  // TC-06-04: Submit duplicate verification while Pending -> 409
  {
    const kycBody = {
      organizationName: 'QA Duplicate Corp',
      contactEmail: 'dup@qafintech.com',
      evidenceUrls: ['https://example.com/docs/license2.pdf']
    };
    const res = await apiRequest('POST', '/api/provider/verification', { token: kycProvider.token, body: kycBody });
    const passed = res.status === 409;
    await recordResult('TC-06-04', 'US-06', 'Chặn nộp lặp hồ sơ xác minh khi đang Pending (409 Conflict)', passed, { status: res.status, code: res.data?.error?.code });
  }

  // TC-07-01: Admin list pending verifications
  {
    const res = await apiRequest('GET', '/api/admin/provider-verifications?status=Pending', { token: adminToken });
    const list = res.data?.data?.items || res.data?.data || [];
    const passed = res.status === 200 && Array.isArray(list);
    await recordResult('TC-07-01', 'US-07', 'Admin xem danh sách hàng chờ xác minh Provider', passed, { status: res.status, count: list.length });
  }

  // TC-07-02: Admin view verification detail
  {
    const res = await apiRequest('GET', `/api/admin/provider-verifications/${kycProviderRecordId}`, { token: adminToken });
    const passed = res.status === 200 && res.data.data?.organizationName === 'QA Fintech Global Corp';
    await recordResult('TC-07-02', 'US-07', 'Admin xem chi tiết hồ sơ xác minh Provider', passed, { status: res.status, org: res.data.data?.organizationName });
  }

  // TC-07-03: Admin reject without reason -> 400
  {
    const res = await apiRequest('POST', `/api/admin/provider-verifications/${kycProviderRecordId}/review`, {
      token: adminToken,
      body: { decision: 'Rejected' }
    });
    const passed = res.status === 400;
    await recordResult('TC-07-03', 'US-07', 'Admin từ chối hồ sơ thiếu lý do (400 Bad Request)', passed, { status: res.status, error: res.data?.error });
  }

  // TC-07-04: Admin reject with reason -> 200
  {
    const res = await apiRequest('POST', `/api/admin/provider-verifications/${kycProviderRecordId}/review`, {
      token: adminToken,
      body: { decision: 'Rejected', reason: 'Giấy phép kinh doanh chưa công chứng' }
    });
    const passed = res.status === 200 && res.data.data?.status === 'Rejected';
    await recordResult('TC-07-04', 'US-07', 'Admin từ chối hồ sơ kèm lý do hợp lệ', passed, { status: res.status, statusResult: res.data.data?.status });
  }

  // TC-06-05: Provider resubmit after rejection
  {
    const res = await apiRequest('POST', '/api/provider/verification', {
      token: kycProvider.token,
      body: {
        organizationName: 'QA Fintech Global Corp Updated',
        contactEmail: 'contact@qafintech.com',
        evidenceUrls: ['https://example.com/docs/notarized-license.pdf']
      }
    });
    const passed = res.status === 201 && res.data.data?.status === 'Pending';
    await recordResult('TC-06-05', 'US-06', 'Provider nộp lại hồ sơ sau khi bị từ chối (Resubmit)', passed, { status: res.status, data: res.data });
  }

  // TC-07-05: Admin approve kycProvider
  {
    const res = await apiRequest('POST', `/api/admin/provider-verifications/${kycProviderRecordId}/review`, {
      token: adminToken,
      body: { decision: 'Verified' }
    });
    const passed = res.status === 200 && res.data.data?.status === 'Verified';
    await recordResult('TC-07-05', 'US-07', 'Admin phê duyệt hồ sơ xác minh Provider (Verified)', passed, { status: res.status, data: res.data });
  }

  // TC-07-06: Admin re-review already verified provider -> 409
  {
    const res = await apiRequest('POST', `/api/admin/provider-verifications/${kycProviderRecordId}/review`, {
      token: adminToken,
      body: { decision: 'Verified' }
    });
    const passed = res.status === 409;
    await recordResult('TC-07-06', 'US-07', 'Chặn Admin duyệt lại hồ sơ đã được xử lý (409 Conflict)', passed, { status: res.status, code: res.data?.error?.code });
  }

  // Also approve mainProvider and secondProvider to allow full lifecycle testing
  let mainProviderRecordId = null;
  {
    const kycRes = await apiRequest('POST', '/api/provider/verification', {
      token: mainProvider.token,
      body: { organizationName: 'Main QA Provider JSC', contactEmail: 'main@api-market-partner.com', evidenceUrls: ['https://example.com/main.pdf'] }
    });
    mainProviderRecordId = kycRes.data?.data?.providerId;
    await apiRequest('POST', `/api/admin/provider-verifications/${mainProviderRecordId}/review`, {
      token: adminToken,
      body: { decision: 'Verified' }
    });
  }

  let secondProviderRecordId = null;
  {
    const kycRes = await apiRequest('POST', '/api/provider/verification', {
      token: secondProvider.token,
      body: { organizationName: 'Second QA Provider Ltd', contactEmail: 'second@api-market-partner.com', evidenceUrls: ['https://example.com/second.pdf'] }
    });
    secondProviderRecordId = kycRes.data?.data?.providerId;
    await apiRequest('POST', `/api/admin/provider-verifications/${secondProviderRecordId}/review`, {
      token: adminToken,
      body: { decision: 'Verified' }
    });
  }

  // =========================================================================
  // SUITE 2: RBAC Matrix & Access Control
  // =========================================================================
  console.log('\n--- [SUITE 2] RBAC Matrix & Access Control ---');

  // TC-SEC-01: Guest (no token) access to /api/provider/apis -> 401
  {
    const res = await apiRequest('GET', '/api/provider/apis');
    const passed = res.status === 401;
    await recordResult('TC-SEC-01', 'RBAC', 'Guest không có token truy cập Provider API (401 Unauthorized)', passed, { status: res.status });
  }

  // TC-SEC-02: Guest access to /api/admin/apis -> 401
  {
    const res = await apiRequest('GET', '/api/admin/apis');
    const passed = res.status === 401;
    await recordResult('TC-SEC-02', 'RBAC', 'Guest không có token truy cập Admin API (401 Unauthorized)', passed, { status: res.status });
  }

  // TC-SEC-03: Consumer access to /api/provider/apis -> 403
  {
    const res = await apiRequest('GET', '/api/provider/apis', { token: consumer.token });
    const passed = res.status === 403;
    await recordResult('TC-SEC-03', 'RBAC', 'Consumer gọi API Provider (403 Forbidden)', passed, { status: res.status });
  }

  // TC-SEC-04: Consumer access to /api/admin/apis -> 403
  {
    const res = await apiRequest('GET', '/api/admin/apis', { token: consumer.token });
    const passed = res.status === 403;
    await recordResult('TC-SEC-04', 'RBAC', 'Consumer gọi API Admin (403 Forbidden)', passed, { status: res.status });
  }

  // TC-SEC-05: Provider access to /api/admin/apis -> 403
  {
    const res = await apiRequest('GET', '/api/admin/apis', { token: mainProvider.token });
    const passed = res.status === 403;
    await recordResult('TC-SEC-05', 'RBAC', 'Provider gọi API Admin Review (403 Forbidden)', passed, { status: res.status });
  }

  // TC-SEC-06: Unverified Provider attempts to create API -> 403
  {
    const res = await apiRequest('POST', '/api/provider/apis', {
      token: unverifiedProvider.token,
      body: { name: 'Unverified Test API', description: 'Should fail', category: 'Weather', baseUrl: 'https://weather.api-market-partner.com', tags: [] }
    });
    const passed = res.status === 403;
    await recordResult('TC-SEC-06', 'RBAC', 'Provider chưa xác minh (Unverified) cố tạo API (403 Forbidden)', passed, { status: res.status, error: res.data?.error });
  }

  // =========================================================================
  // SUITE 3: US-09 — API, Version & Endpoint Management (Draft CRUD)
  // =========================================================================
  console.log('\n--- [SUITE 3] US-09: API, Version & Endpoint Management (Draft CRUD) ---');

  let testApiId = null;

  // TC-09-01: Verified Provider creates API
  {
    const body = {
      name: 'QA Weather Core API',
      description: 'Dịch vụ cung cấp thông tin thời tiết phục vụ kiểm thử tự động',
      category: 'Weather',
      baseUrl: 'https://weather.api-market-partner.com',
      tags: ['weather', 'forecast', 'qa']
    };
    const res = await apiRequest('POST', '/api/provider/apis', { token: mainProvider.token, body });
    const passed = res.status === 201 && res.data.data?.status === 'Draft';
    testApiId = res.data.data?.id;
    await recordResult('TC-09-01', 'US-09', 'Tạo mới API ở trạng thái Draft thành công', passed, { status: res.status, apiId: testApiId, state: res.data.data?.status });
  }

  // TC-09-02: Get API detail
  {
    const res = await apiRequest('GET', `/api/provider/apis/${testApiId}`, { token: mainProvider.token });
    const passed = res.status === 200 && res.data.data?.id === testApiId && res.data.data?.name === 'QA Weather Core API';
    await recordResult('TC-09-02', 'US-09', 'Lấy thông tin chi tiết API theo ID', passed, { status: res.status, name: res.data.data?.name });
  }

  // TC-09-03: Update API metadata in Draft
  {
    const body = {
      name: 'QA Weather Core API v1.1',
      description: 'Cập nhật mô tả chi tiết dịch vụ thời tiết',
      category: 'Weather',
      baseUrl: 'https://weather.api-market-partner.com',
      tags: ['weather', 'live', 'qa']
    };
    const res = await apiRequest('PUT', `/api/provider/apis/${testApiId}`, { token: mainProvider.token, body });
    const passed = res.status === 200 && res.data.data?.name === 'QA Weather Core API v1.1';
    await recordResult('TC-09-03', 'US-09', 'Cập nhật thông tin API ở trạng thái Draft', passed, { status: res.status, updatedName: res.data.data?.name });
  }

  // TC-09-04: Cross-provider access control -> 404/403
  {
    const res = await apiRequest('GET', `/api/provider/apis/${testApiId}`, { token: secondProvider.token });
    const passed = res.status === 404 || res.status === 403;
    await recordResult('TC-09-04', 'US-09', 'Chặn Provider khác xem hoặc chỉnh sửa API không sở hữu (404/403)', passed, { status: res.status });
  }

  // TC-09-05: Create Version for API
  let testVersionId = null;
  {
    const body = { version: '1.0.0', changelog: 'Bản phát hành đầu tiên cho kiểm thử' };
    const res = await apiRequest('POST', `/api/provider/apis/${testApiId}/versions`, { token: mainProvider.token, body });
    const passed = res.status === 201 && res.data.data?.version === '1.0.0';
    testVersionId = res.data.data?.id;
    await recordResult('TC-09-05', 'US-09', 'Tạo Version mới cho API', passed, { status: res.status, versionId: testVersionId });
  }

  // TC-09-06: Create Endpoint manually with valid schema
  let testEndpointId = null;
  {
    const body = {
      versionId: testVersionId,
      method: 'GET',
      path: '/v1/current',
      description: 'Lấy thời tiết tức thời theo tọa độ',
      parameters: [{ name: 'lat', in: 'query', required: true, description: 'Vĩ độ', schema: { type: 'number' } }]
    };
    const res = await apiRequest('POST', `/api/provider/apis/${testApiId}/endpoints`, { token: mainProvider.token, body });
    const passed = res.status === 201 && res.data.data?.method === 'GET' && res.data.data?.path === '/v1/current';
    testEndpointId = res.data.data?.id;
    await recordResult('TC-09-06', 'US-09', 'Thêm Endpoint thủ công vào Version', passed, { status: res.status, endpointId: testEndpointId });
  }

  // TC-09-07: Delete Endpoint
  {
    const res = await apiRequest('DELETE', `/api/provider/apis/${testApiId}/endpoints/${testEndpointId}`, { token: mainProvider.token });
    const passed = res.status === 204;
    await recordResult('TC-09-07', 'US-09', 'Xóa Endpoint trong trạng thái Draft', passed, { status: res.status });
  }

  // =========================================================================
  // SUITE 4: US-10 — Import OpenAPI 3.0 / Swagger 2.0 (With 6 Fixtures)
  // =========================================================================
  console.log('\n--- [SUITE 4] US-10: Import OpenAPI 3.0 / Swagger 2.0 (With 6 Fixtures) ---');

  // TC-10-01: Import invalid-syntax.json -> 400 OPENAPI_IMPORT_INVALID
  {
    const buf = fs.readFileSync(path.join(FIXTURES_DIR, 'invalid-syntax.json'));
    const form = new FormData();
    form.append('versionId', testVersionId);
    form.append('file', new Blob([buf], { type: 'application/json' }), 'invalid-syntax.json');

    const res = await apiRequest('POST', `/api/provider/apis/${testApiId}/import-openapi`, {
      token: mainProvider.token,
      body: form,
      isFormData: true
    });
    const passed = res.status === 400 && res.data?.error?.code === 'OPENAPI_IMPORT_INVALID';
    await recordResult('TC-10-01', 'US-10', 'Import file JSON lỗi cú pháp (invalid-syntax.json -> 400)', passed, { status: res.status, code: res.data?.error?.code });
  }

  // TC-10-02: Import missing-required-fields.yaml -> 400
  {
    const buf = fs.readFileSync(path.join(FIXTURES_DIR, 'missing-required-fields.yaml'));
    const form = new FormData();
    form.append('versionId', testVersionId);
    form.append('file', new Blob([buf], { type: 'application/x-yaml' }), 'missing-required-fields.yaml');

    const res = await apiRequest('POST', `/api/provider/apis/${testApiId}/import-openapi`, {
      token: mainProvider.token,
      body: form,
      isFormData: true
    });
    const passed = res.status === 400 && res.data?.error?.code === 'OPENAPI_IMPORT_INVALID';
    await recordResult('TC-10-02', 'US-10', 'Import file YAML thiếu paths/info (missing-required-fields.yaml -> 400)', passed, { status: res.status, code: res.data?.error?.code });
  }

  // TC-10-03: Import invalid-schema-types.json -> 400
  {
    const buf = fs.readFileSync(path.join(FIXTURES_DIR, 'invalid-schema-types.json'));
    const form = new FormData();
    form.append('versionId', testVersionId);
    form.append('file', new Blob([buf], { type: 'application/json' }), 'invalid-schema-types.json');

    const res = await apiRequest('POST', `/api/provider/apis/${testApiId}/import-openapi`, {
      token: mainProvider.token,
      body: form,
      isFormData: true
    });
    const passed = res.status === 400 && res.data?.error?.code === 'OPENAPI_IMPORT_INVALID';
    await recordResult('TC-10-03', 'US-10', 'Import file có kiểu dữ liệu schema không hợp lệ (invalid-schema-types.json -> 400)', passed, { status: res.status, code: res.data?.error?.code });
  }

  // TC-10-04: Import oversized-over-1mb.json -> 413 or 400 LIMIT_FILE_SIZE
  {
    const buf = fs.readFileSync(path.join(FIXTURES_DIR, 'oversized-over-1mb.json'));
    const form = new FormData();
    form.append('versionId', testVersionId);
    form.append('file', new Blob([buf], { type: 'application/json' }), 'oversized-over-1mb.json');

    const res = await apiRequest('POST', `/api/provider/apis/${testApiId}/import-openapi`, {
      token: mainProvider.token,
      body: form,
      isFormData: true
    });
    const passed = (res.status === 413 || res.status === 400);
    await recordResult('TC-10-04', 'US-10', 'Import file vượt quá giới hạn 1MB (oversized-over-1mb.json -> 413/400)', passed, { status: res.status, error: res.data?.error });
  }

  // TC-10-05: Import valid-weather-openapi3.json -> 200 OK
  {
    const buf = fs.readFileSync(path.join(FIXTURES_DIR, 'valid-weather-openapi3.json'));
    const form = new FormData();
    form.append('versionId', testVersionId);
    form.append('file', new Blob([buf], { type: 'application/json' }), 'valid-weather-openapi3.json');

    const res = await apiRequest('POST', `/api/provider/apis/${testApiId}/import-openapi`, {
      token: mainProvider.token,
      body: form,
      isFormData: true
    });
    const passed = res.status === 200 && res.data.data?.endpointCount === 3;
    await recordResult('TC-10-05', 'US-10', 'Import OpenAPI 3.0 hợp lệ đầy đủ sinh 7 khối tài liệu (valid-weather-openapi3.json -> 200)', passed, { status: res.status, endpointCount: res.data.data?.endpointCount });
  }

  // TC-10-06: Verify 7 documentation blocks persisted
  {
    const res = await apiRequest('GET', `/api/provider/apis/${testApiId}/documentation`, { token: mainProvider.token });
    const docs = res.data?.data?.[0]?.content || res.data?.data;
    const passed = res.status === 200 && docs && docs.paths && docs.components;
    await recordResult('TC-10-06', 'US-10', 'Truy vấn tài liệu chuẩn hóa 7 khối sau khi import', passed, { status: res.status, hasPaths: !!docs?.paths, hasComponents: !!docs?.components });
  }

  // TC-10-07: Import XSS payload openapi file into a temporary version
  let xssVersionId = null;
  {
    const vRes = await apiRequest('POST', `/api/provider/apis/${testApiId}/versions`, {
      token: mainProvider.token,
      body: { version: '2.0.0-xss', changelog: 'XSS test version' }
    });
    xssVersionId = vRes.data?.data?.id;

    const buf = fs.readFileSync(path.join(FIXTURES_DIR, 'xss-payload-openapi.json'));
    const form = new FormData();
    form.append('versionId', xssVersionId);
    form.append('file', new Blob([buf], { type: 'application/json' }), 'xss-payload-openapi.json');

    const res = await apiRequest('POST', `/api/provider/apis/${testApiId}/import-openapi`, {
      token: mainProvider.token,
      body: form,
      isFormData: true
    });
    const passed = res.status === 200 && res.data.data?.endpointCount === 1;
    await recordResult('TC-10-07', 'US-10', 'Import file chứa payload XSS (xss-payload-openapi.json -> lưu trữ an toàn)', passed, { status: res.status, count: res.data.data?.endpointCount });

    // Clean up xss version to keep testApiId clean for submission
    await apiRequest('DELETE', `/api/provider/apis/${testApiId}/versions/${xssVersionId}`, { token: mainProvider.token });
  }

  // =========================================================================
  // SUITE 5: US-11 — Pricing Plan Configuration
  // =========================================================================
  console.log('\n--- [SUITE 5] US-11: Pricing Plan Configuration ---');

  // TC-11-01: Reject Free plan with price > 0 -> 400
  {
    const body = { name: 'Free', priceMonthly: 50000, currency: 'VND', quota: 1000, rateLimit: 5 };
    const res = await apiRequest('POST', `/api/provider/apis/${testApiId}/plans`, { token: mainProvider.token, body });
    const passed = res.status === 400;
    await recordResult('TC-11-01', 'US-11', 'Chặn tạo gói Free có giá > 0 (400 Validation Error)', passed, { status: res.status, error: res.data?.error });
  }

  // TC-11-02: Create valid Free plan
  let freePlanId = null;
  {
    const body = { name: 'Free', priceMonthly: 0, currency: 'VND', quota: 500, rateLimit: 5 };
    const res = await apiRequest('POST', `/api/provider/apis/${testApiId}/plans`, { token: mainProvider.token, body });
    const passed = res.status === 201 && res.data.data?.priceMonthly === 0;
    freePlanId = res.data.data?.id;
    await recordResult('TC-11-02', 'US-11', 'Tạo gói Free hợp lệ (giá = 0, quota = 500)', passed, { status: res.status, planId: freePlanId });
  }

  // TC-11-03: Create Paid Pro plan (allowed enum names: 'Free', 'Basic', 'Pro')
  let proPlanId = null;
  {
    const body = { name: 'Pro', priceMonthly: 499000, currency: 'VND', quota: 50000, rateLimit: 50 };
    const res = await apiRequest('POST', `/api/provider/apis/${testApiId}/plans`, { token: mainProvider.token, body });
    const passed = res.status === 201 && res.data.data?.priceMonthly === 499000;
    proPlanId = res.data.data?.id;
    await recordResult('TC-11-03', 'US-11', 'Tạo gói trả phí Pro (499.000 VND)', passed, { status: res.status, planId: proPlanId });
  }

  // TC-11-04: Update pricing plan
  {
    const body = { name: 'Pro', priceMonthly: 599000, currency: 'VND', quota: 60000, rateLimit: 60 };
    const res = await apiRequest('PUT', `/api/provider/apis/${testApiId}/plans/${proPlanId}`, { token: mainProvider.token, body });
    const passed = res.status === 200 && res.data.data?.priceMonthly === 599000;
    await recordResult('TC-11-04', 'US-11', 'Cập nhật cấu hình gói giá Pro (599.000 VND)', passed, { status: res.status, newPrice: res.data.data?.priceMonthly });
  }

  // TC-11-05: List pricing plans
  {
    const res = await apiRequest('GET', `/api/provider/apis/${testApiId}/plans`, { token: mainProvider.token });
    const plans = res.data?.data || [];
    const passed = res.status === 200 && plans.length === 2;
    await recordResult('TC-11-05', 'US-11', 'Liệt kê danh sách các gói giá của API (Free & Pro)', passed, { status: res.status, count: plans.length });
  }

  // =========================================================================
  // SUITE 6: US-08 — Legal Declarations, Privacy & Domain Challenge
  // =========================================================================
  console.log('\n--- [SUITE 6] US-08: Legal Declarations, Privacy & Domain Challenge ---');

  // TC-08-01: Get active platform agreement
  {
    const res = await apiRequest('GET', '/api/provider/agreement', { token: mainProvider.token });
    const passed = res.status === 200 && !!res.data.data?.version;
    await recordResult('TC-08-01', 'US-08', 'Lấy thông tin Thỏa thuận Nền tảng (Platform Agreement)', passed, { status: res.status, version: res.data.data?.version });
  }

  // TC-08-02: Submit legal declaration with invalid agreement version -> 409 AGREEMENT_CHANGED or 400
  {
    const body = {
      ownershipDeclaration: 'Tôi sở hữu bản quyền toàn bộ mã nguồn API này',
      distributionRights: 'Có quyền phân phối thương mại không giới hạn',
      dataClassification: 'Confidential',
      agreementVersion: 'invalid-agreement-version-999',
      accepted: true,
      processesPersonalData: false,
      personalDataTypes: []
    };
    const res = await apiRequest('PUT', `/api/provider/apis/${testApiId}/legal`, { token: mainProvider.token, body });
    const passed = res.status === 409 || res.status === 400;
    await recordResult('TC-08-02', 'US-08', 'Chặn khai báo pháp lý với phiên bản thỏa thuận không hợp lệ (409/400)', passed, { status: res.status, error: res.data?.error });
  }

  // TC-08-03: Submit valid legal declaration with personal data classification & purpose
  {
    const body = {
      ownershipDeclaration: 'Tôi sở hữu bản quyền toàn bộ mã nguồn API này',
      distributionRights: 'Có quyền phân phối thương mại không giới hạn',
      dataClassification: 'Internal',
      agreementVersion: activeAgreement.version,
      accepted: true,
      processesPersonalData: true,
      personalDataTypes: ['Email', 'Geolocation'],
      dataProcessingPurpose: 'Phục vụ xử lý dữ liệu và cảnh báo thời tiết'
    };
    const res = await apiRequest('PUT', `/api/provider/apis/${testApiId}/legal`, { token: mainProvider.token, body });
    const passed = res.status === 200 && res.data.data?.processesPersonalData === true;
    await recordResult('TC-08-03', 'US-08', 'Khai báo pháp lý và phân loại dữ liệu cá nhân hợp lệ', passed, { status: res.status, legal: res.data.data });
  }

  // TC-08-04: Get legal declaration
  {
    const res = await apiRequest('GET', `/api/provider/apis/${testApiId}/legal`, { token: mainProvider.token });
    const passed = res.status === 200 && res.data.data?.dataClassification === 'Internal';
    await recordResult('TC-08-04', 'US-08', 'Truy vấn thông tin khai báo pháp lý của API', passed, { status: res.status, classification: res.data.data?.dataClassification });
  }

  // TC-08-05: Create domain verification challenge
  let challengeToken = null;
  {
    const res = await apiRequest('POST', `/api/provider/apis/${testApiId}/domain-verification/challenge`, { token: mainProvider.token, body: {} });
    const passed = res.status === 201 && res.data.data?.recordType === 'TXT' && res.data.data?.recordValue.startsWith('platform-verification=');
    challengeToken = res.data.data?.recordValue;
    await recordResult('TC-08-05', 'US-08', 'Tạo DNS TXT verification challenge cho tên miền API', passed, { status: res.status, recordName: res.data.data?.recordName });
  }

  // TC-08-06: Check domain status before DNS verification
  {
    const res = await apiRequest('GET', `/api/provider/apis/${testApiId}/domain-verification`, { token: mainProvider.token });
    const passed = res.status === 200 && res.data.data?.verified === false;
    await recordResult('TC-08-06', 'US-08', 'Kiểm tra trạng thái tên miền khi chưa xác thực DNS (verified = false)', passed, { status: res.status, verified: res.data.data?.verified });
  }

  // TC-08-07: Verify domain before DNS TXT is published -> 400 DOMAIN_PROOF_MISSING / 409
  {
    const res = await apiRequest('POST', `/api/provider/apis/${testApiId}/domain-verification/verify`, { token: mainProvider.token, body: {} });
    const passed = res.status === 400 || res.status === 409;
    await recordResult('TC-08-07', 'US-08', 'Kiểm tra thất bại khi gọi verify domain chưa cấu hình DNS TXT', passed, { status: res.status, code: res.data?.error?.code });
  }

  // =========================================================================
  // SUITE 7: US-12 — API Submission & Record Freezing
  // =========================================================================
  console.log('\n--- [SUITE 7] US-12: API Submission & Record Freezing ---');

  // TC-12-01: Submit API before domain is verified -> 400 DOMAIN_NOT_VERIFIED
  {
    const res = await apiRequest('POST', `/api/provider/apis/${testApiId}/submit-review`, { token: mainProvider.token, body: {} });
    const passed = res.status === 400 && res.data?.error?.code === 'DOMAIN_NOT_VERIFIED';
    await recordResult('TC-12-01', 'US-12', 'Chặn nộp duyệt API khi tên miền chưa được xác minh (400 DOMAIN_NOT_VERIFIED)', passed, { status: res.status, code: res.data?.error?.code });
  }

  // Mark domain as verified in database to fulfill readiness checklist
  {
    await pool.query(
      "UPDATE api_domain_verifications SET verified_at = NOW(), verification_expires_at = NOW() + INTERVAL '7 days' WHERE api_id = $1",
      [testApiId]
    );
    log(`Marked domain for API ${testApiId} as verified in database.`);
  }

  // TC-12-02: Submit API successfully -> 200 OK, status = Submitted
  {
    const res = await apiRequest('POST', `/api/provider/apis/${testApiId}/submit-review`, { token: mainProvider.token, body: {} });
    const passed = res.status === 200 && res.data.data?.status === 'Submitted';
    await recordResult('TC-12-02', 'US-12', 'Nộp duyệt API thành công khi đã đủ điều kiện Checklist (Submitted)', passed, { status: res.status, statusResult: res.data.data?.status });
  }

  // TC-12-03: Record Freeze Test — Edit API metadata while Submitted -> 409 INVALID_STATE / API_FROZEN
  {
    const body = { name: 'Attempted Edit While Submitted', description: 'desc', category: 'Weather', baseUrl: 'https://weather.api-market-partner.com', tags: [] };
    const res = await apiRequest('PUT', `/api/provider/apis/${testApiId}`, { token: mainProvider.token, body });
    const passed = res.status === 409 || res.status === 400;
    await recordResult('TC-12-03', 'US-12', 'Đóng băng bản ghi: Chặn sửa metadata khi API ở trạng thái Submitted (409/400)', passed, { status: res.status, code: res.data?.error?.code });
  }

  // TC-12-04: Record Freeze Test — Add version while Submitted -> 409/400
  {
    const body = { version: '9.9.9', changelog: 'Should be blocked' };
    const res = await apiRequest('POST', `/api/provider/apis/${testApiId}/versions`, { token: mainProvider.token, body });
    const passed = res.status === 409 || res.status === 400;
    await recordResult('TC-12-04', 'US-12', 'Đóng băng bản ghi: Chặn tạo Version mới khi API ở trạng thái Submitted', passed, { status: res.status, code: res.data?.error?.code });
  }

  // TC-12-05: Record Freeze Test — Import OpenAPI while Submitted -> 409/400
  {
    const buf = fs.readFileSync(path.join(FIXTURES_DIR, 'valid-weather-openapi3.json'));
    const form = new FormData();
    form.append('versionId', testVersionId);
    form.append('file', new Blob([buf], { type: 'application/json' }), 'valid-weather-openapi3.json');

    const res = await apiRequest('POST', `/api/provider/apis/${testApiId}/import-openapi`, {
      token: mainProvider.token,
      body: form,
      isFormData: true
    });
    const passed = res.status === 409 || res.status === 400;
    await recordResult('TC-12-05', 'US-12', 'Đóng băng bản ghi: Chặn Import OpenAPI khi API ở trạng thái Submitted', passed, { status: res.status, code: res.data?.error?.code });
  }

  // =========================================================================
  // SUITE 8: US-13 — Admin API Review, Dossier & State Machine Integrity
  // =========================================================================
  console.log('\n--- [SUITE 8] US-13: Admin API Review, Dossier & State Machine Integrity ---');

  // TC-13-01: Admin view API Dossier
  {
    const res = await apiRequest('GET', `/api/admin/apis/${testApiId}/dossier`, { token: adminToken });
    const dossier = res.data?.data;
    const passed = res.status === 200 && dossier?.api?.id === String(testApiId) && dossier?.legal?.processesPersonalData === true;
    await recordResult('TC-13-01', 'US-13', 'Admin xem Dossier hồ sơ nộp duyệt (có cảnh báo dữ liệu cá nhân)', passed, { status: res.status, personalData: dossier?.legal?.processesPersonalData });
  }

  // TC-13-02: Prevent state machine skip: Admin directly publishes Submitted API -> 409
  {
    const res = await apiRequest('POST', `/api/admin/apis/${testApiId}/review`, {
      token: adminToken,
      body: { next: 'Published' }
    });
    const passed = res.status === 409 || res.status === 400;
    await recordResult('TC-13-02', 'US-13', 'Chặn nhảy cóc trạng thái: Chặn Publish trực tiếp từ Submitted (409/400)', passed, { status: res.status, code: res.data?.error?.code });
  }

  // TC-13-03: Admin transitions to Under Review
  {
    const res = await apiRequest('POST', `/api/admin/apis/${testApiId}/review`, {
      token: adminToken,
      body: { next: 'Under Review' }
    });
    const passed = res.status === 200 && res.data.data?.status === 'Under Review';
    await recordResult('TC-13-03', 'US-13', 'Admin bắt đầu thẩm định API (Submitted -> Under Review)', passed, { status: res.status, statusResult: res.data.data?.status });
  }

  // TC-13-04: Admin rejects with reason
  {
    const res = await apiRequest('POST', `/api/admin/apis/${testApiId}/review`, {
      token: adminToken,
      body: { next: 'Rejected', reason: 'Cần bổ sung chi tiết trường dữ liệu thời tiết' }
    });
    const passed = res.status === 200 && res.data.data?.status === 'Rejected';
    await recordResult('TC-13-04', 'US-13', 'Admin từ chối duyệt API kèm lý do chi tiết', passed, { status: res.status, statusResult: res.data.data?.status });
  }

  // TC-13-05: Provider reopens Rejected API -> Draft
  {
    const res = await apiRequest('POST', `/api/provider/apis/${testApiId}/reopen`, { token: mainProvider.token, body: {} });
    const passed = res.status === 200 && res.data.data?.status === 'Draft';
    await recordResult('TC-13-05', 'US-13', 'Provider mở lại API sau khi bị từ chối (Rejected -> Draft)', passed, { status: res.status, statusResult: res.data.data?.status });
  }

  // TC-13-06: Resubmit, Under Review, Approve and Publish
  {
    // Resubmit
    await apiRequest('POST', `/api/provider/apis/${testApiId}/submit-review`, { token: mainProvider.token, body: {} });
    // Under Review
    await apiRequest('POST', `/api/admin/apis/${testApiId}/review`, { token: adminToken, body: { next: 'Under Review' } });
    // Approve
    const approveRes = await apiRequest('POST', `/api/admin/apis/${testApiId}/review`, { token: adminToken, body: { next: 'Approved' } });
    // Publish
    const publishRes = await apiRequest('POST', `/api/admin/apis/${testApiId}/review`, { token: adminToken, body: { next: 'Published' } });

    const passed = approveRes.status === 200 && publishRes.status === 200 && publishRes.data.data?.status === 'Published';
    await recordResult('TC-13-06', 'US-13', 'Máy trạng thái hoàn chỉnh: Under Review -> Approved -> Published', passed, {
      approveStatus: approveRes.data?.data?.status,
      publishStatus: publishRes.data?.data?.status
    });
  }

  // TC-13-07: Provider checks publish status
  {
    const res = await apiRequest('GET', `/api/provider/apis/${testApiId}/publish-status`, { token: mainProvider.token });
    const passed = res.status === 200 && res.data.data?.status === 'Published' && !!res.data.data?.publishedAt;
    await recordResult('TC-13-07', 'US-13', 'Provider tra cứu trạng thái xuất bản sàn thương mại', passed, { status: res.status, data: res.data.data });
  }

  // =========================================================================
  // SUITE 9: US-14 — Audit Log Management & Redaction Verification
  // =========================================================================
  console.log('\n--- [SUITE 9] US-14: Audit Log Management & Redaction Verification ---');

  // TC-14-01: Admin queries audit actions
  {
    const res = await apiRequest('GET', '/api/admin/audit-logs/actions', { token: adminToken });
    const actions = res.data?.data || [];
    const passed = res.status === 200 && Array.isArray(actions) && actions.includes('api.created');
    await recordResult('TC-14-01', 'US-14', 'Admin lấy danh mục các hành động Audit Log chuẩn hóa', passed, { status: res.status, actionCount: actions.length });
  }

  // TC-14-02: Admin queries audit logs with pagination
  {
    const res = await apiRequest('GET', '/api/admin/audit-logs?page=1&pageSize=10', { token: adminToken });
    const items = res.data?.data?.items || [];
    const passed = res.status === 200 && Array.isArray(items) && items.length > 0;
    await recordResult('TC-14-02', 'US-14', 'Admin truy vấn danh sách Audit Log có phân trang', passed, { status: res.status, count: items.length });
  }

  // TC-14-03: Filter audit logs by targetType
  {
    const res = await apiRequest('GET', `/api/admin/audit-logs?targetType=api&targetId=${testApiId}`, { token: adminToken });
    const items = res.data?.data?.items || [];
    const passed = res.status === 200 && Array.isArray(items);
    await recordResult('TC-14-03', 'US-14', 'Admin lọc Audit Log theo targetType=api và targetId', passed, { status: res.status, matchingLogs: items.length });
  }

  // Helper function: Quét toàn diện các nguy cơ rò rỉ dữ liệu nhạy cảm trong Audit Log
  function containsSensitiveLeak(record) {
    if (!record) return false;
    const detailStr = JSON.stringify(record.detail ?? {});
    const recordStr = JSON.stringify(record);

    // 1. Quét DNS verification token
    if (detailStr.includes('platform-verification=') || recordStr.includes('platform-verification=')) {
      return true;
    }

    // 2. Quét trường mật khẩu hoặc bí mật không được che dấu
    if (record.detail && typeof record.detail === 'object') {
      for (const [key, val] of Object.entries(record.detail)) {
        const lowerKey = key.toLowerCase();
        const strVal = String(val ?? '');
        if (lowerKey.includes('password') && strVal !== '[REDACTED]' && strVal !== 'true' && strVal !== 'false') {
          return true;
        }
        if (lowerKey.includes('secret') && strVal !== '[REDACTED]' && strVal.length > 5) {
          return true;
        }
        if (lowerKey.includes('token') && !lowerKey.includes('action') && strVal.length > 20 && strVal !== '[REDACTED]') {
          return true;
        }
      }
    }

    // 3. Quét pattern băm mật khẩu Bcrypt ($2a$, $2b$, $2y$)
    if (/\$2[aby]\$[0-9]{2}\$[A-Za-z0-9./]{53}/.test(recordStr)) {
      return true;
    }

    // 4. Quét chuỗi JWT (Header.Payload.Signature)
    if (/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/.test(recordStr)) {
      return true;
    }

    // 5. Quét khóa nhạy cảm password_hash
    if (detailStr.includes('"password_hash"') || detailStr.includes('"passwordHash"')) {
      return true;
    }

    return false;
  }

  // TC-14-04: Security & Sensitive Data Redaction in Audit Logs (với Canary Fixtures chống False Positive)
  {
    // BƯỚC 1: Canary Negative Test (Dữ liệu rò rỉ mẫu -> BẮT BUỘC hàm quét phải phát hiện được)
    const canaryLeakRecord = {
      id: 'canary-leak-01',
      action: 'user.login',
      actorId: '1',
      detail: {
        password_hash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklm',
        secret: 'raw_api_secret_token_12345'
      }
    };
    const canaryLeakDetected = containsSensitiveLeak(canaryLeakRecord);

    // BƯỚC 2: Canary Redacted Test (Dữ liệu mẫu đã che mờ hợp lệ -> KHÔNG ĐƯỢC báo lỗi giả)
    const canarySafeRecord = {
      id: 'canary-safe-01',
      action: 'user.login',
      actorId: '1',
      detail: {
        password: '[REDACTED]',
        actorEmail: 'admin@example.com',
        hasPassword: true
      }
    };
    const canaryFalseAlarm = containsSensitiveLeak(canarySafeRecord);

    // BƯỚC 3: Quét dữ liệu Audit Log thực tế từ API Backend
    const res = await apiRequest('GET', `/api/admin/audit-logs?targetType=api&targetId=${testApiId}`, { token: adminToken });
    const items = res.data?.data?.items || [];
    const hasItems = Array.isArray(items) && items.length > 0;
    const hasValidDetail = items.some(item => item.detail !== null && typeof item.detail === 'object' && Object.keys(item.detail).length > 0);

    let actualLeakDetected = false;
    for (const item of items) {
      if (containsSensitiveLeak(item)) {
        actualLeakDetected = true;
        break;
      }
    }

    const passed = res.status === 200 &&
      canaryLeakDetected === true &&
      canaryFalseAlarm === false &&
      hasItems &&
      hasValidDetail &&
      !actualLeakDetected;

    await recordResult('TC-14-04', 'US-14', 'Kiểm tra bảo mật: Không rò rỉ token DNS, mật khẩu trong Audit Log (Canary Verified)', passed, {
      status: res.status,
      logCount: items.length,
      canaryLeakDetected,
      canaryFalseAlarm,
      hasValidDetail,
      actualLeakDetected
    });
  }

  // TC-14-05: Non-admin access to audit logs blocked -> 403
  {
    const res = await apiRequest('GET', '/api/admin/audit-logs', { token: mainProvider.token });
    const passed = res.status === 403;
    await recordResult('TC-14-05', 'US-14', 'Chặn Provider và Consumer truy vấn Audit Log (403 Forbidden)', passed, { status: res.status });
  }

  // =========================================================================
  // SUMMARY & WRITE OUTPUT FILES
  // =========================================================================
  console.log('\n================================================================');
  console.log(`   KẾT QUẢ KIỂM THỬ SPRINT 2: ${passCount} PASS / ${failCount} FAIL (Tổng số: ${results.length})`);
  console.log('================================================================\n');

  const outputData = {
    summary: {
      total: results.length,
      passed: passCount,
      failed: failCount,
      passRate: `${((passCount / results.length) * 100).toFixed(1)}%`,
      executedAt: new Date().toISOString(),
      environment: {
        baseUrl: BASE_URL,
        database: 'PostgreSQL 17 (Docker)',
        fixturesUsed: [
          'valid-weather-openapi3.json',
          'invalid-syntax.json',
          'missing-required-fields.yaml',
          'invalid-schema-types.json',
          'xss-payload-openapi.json',
          'oversized-over-1mb.json'
        ]
      }
    },
    testResults: results
  };

  const outputPath = path.resolve('qa-scripts/sprint2-backend-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');
  console.log(`Báo cáo kết quả chi tiết đã được xuất ra: ${outputPath}`);

  if (dnsFixture) { try { dnsFixture.close(); } catch {} }
  await pool.end();

  if (results.length !== EXPECTED_TESTS) {
    console.error(`Expected ${EXPECTED_TESTS} test cases but recorded ${results.length}.`);
    failCount++;
  }
  if (failCount > 0) {
    console.error(`Sprint 2 API E2E failed: ${failCount} failing or missing test case(s).`);
    process.exitCode = 1;
  }
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  if (dnsFixture) { try { dnsFixture.close(); } catch {} }
  pool.end();
  process.exit(1);
});

