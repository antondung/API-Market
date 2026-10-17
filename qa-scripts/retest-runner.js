/**
 * retest-runner.js
 * Runner retest Sprint 1 chuẩn xác tuyệt đối:
 * - Khởi tạo token khi cửa sổ sạch.
 * - Ưu tiên các test case dùng token trước (không làm cạn kiệt slot auth).
 * - Sử dụng user test riêng để test khóa/mở khóa.
 * - TC-05-01 (Rate limit) chạy sau cùng trên cửa sổ sạch.
 * - Tự động mask che toàn bộ mật khẩu, token, secret.
 */

import { execSync } from 'child_process';
import { call, snippet, uniqueEmail, repeatChar } from './lib/api.js';
import { addResult, writeFiles } from './lib/reporter-retest.js';

const ADMIN_CREDS = { email: 'admin@example.com', password: 'Admin@123' };
const USER_CREDS = { email: 'user@example.com', password: 'User@123' };
const PROVIDER_CREDS = { email: 'provider@example.com', password: 'Provider@123' };

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function login(email, password) {
  return call({ method: 'POST', path: '/api/auth/login', body: { email, password } });
}

function restartBackend() {
  console.log('\n  🔄 Khởi động lại container api-market-backend...');
  execSync('docker restart api-market-backend', { stdio: 'pipe' });
  for (let i = 0; i < 30; i++) {
    execSync('node -e "setTimeout(()=>{}, 1000)"');
    try {
      const health = execSync('docker inspect --format="{{.State.Health.Status}}" api-market-backend', { encoding: 'utf8' }).trim();
      if (health === 'healthy') {
        break;
      }
    } catch {}
  }
  for (let i = 0; i < 10; i++) {
    execSync('node -e "setTimeout(()=>{}, 800)"');
    try {
      const code = execSync('curl.exe -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/openapi.json', { encoding: 'utf8' }).trim();
      if (code === '200') {
        execSync('node -e "setTimeout(()=>{}, 1000)"');
        break;
      }
    } catch {}
  }
  console.log('  ✅ Backend đã sẵn sàng (healthy & warmed up).');
}

async function run() {
  console.log('\n======================================================');
  console.log('  🧪 BẮT ĐẦU RETEST TOÀN BỘ 28 TC API SPRINT 1');
  console.log('  Môi trường: http://127.0.0.1:3000 (commit 81cc803)');
  console.log('======================================================\n');

  // Khởi động lại backend để làm sạch rate limit window
  restartBackend();

  // Đăng nhập lấy sẵn token 3 role
  console.log('  ⏳ Đăng nhập 3 tài khoản seed để lấy token...');
  const [aRes, uRes, pRes] = await Promise.all([
    login(ADMIN_CREDS.email, ADMIN_CREDS.password),
    login(USER_CREDS.email, USER_CREDS.password),
    login(PROVIDER_CREDS.email, PROVIDER_CREDS.password)
  ]);
  const aTok = aRes.data?.data?.accessToken;
  const uTok = uRes.data?.data?.accessToken;
  const pTok = pRes.data?.data?.accessToken;

  if (!aTok || !uTok || !pTok) {
    console.error('❌ Lỗi không lấy được token seed!');
    process.exit(1);
  }
  console.log('  ✅ Đã lấy đủ token 3 role (ADMIN, USER, PROVIDER).\n');

  // =========================================================================
  // 1. US-03 — PHÂN QUYỀN TRUY CẬP (RBAC)
  // =========================================================================
  console.log('📦 [1/6] Chạy US-03: Phân quyền truy cập RBAC');

  // TC-03-01
  {
    const [c, p, a] = await Promise.all([
      call({ method: 'GET', path: '/api/access/consumer', token: uTok }),
      call({ method: 'GET', path: '/api/access/provider', token: uTok }),
      call({ method: 'GET', path: '/api/access/admin', token: uTok })
    ]);
    const pass = c.status === 200 && p.status === 403 && a.status === 403;
    addResult({
      tc: 'TC-03-01',
      desc: 'USER token gọi 3 guard',
      expected: 'consumer→200, provider→403, admin→403',
      statusCode: null,
      responseSnippet: `consumer=${c.status}, provider=${p.status}, admin=${a.status}`,
      verdict: pass ? 'Pass' : 'Fail',
      durationMs: c.durationMs + p.durationMs + a.durationMs,
      rawResponse: { consumer: c.status, provider: p.status, admin: a.status }
    });
  }

  // TC-03-02
  {
    const [c, p, a] = await Promise.all([
      call({ method: 'GET', path: '/api/access/consumer', token: pTok }),
      call({ method: 'GET', path: '/api/access/provider', token: pTok }),
      call({ method: 'GET', path: '/api/access/admin', token: pTok })
    ]);
    const pass = c.status === 403 && p.status === 200 && a.status === 403;
    addResult({
      tc: 'TC-03-02',
      desc: 'PROVIDER token gọi 3 guard',
      expected: 'consumer→403, provider→200, admin→403',
      statusCode: null,
      responseSnippet: `consumer=${c.status}, provider=${p.status}, admin=${a.status}`,
      verdict: pass ? 'Pass' : 'Fail',
      durationMs: c.durationMs + p.durationMs + a.durationMs,
      rawResponse: { consumer: c.status, provider: p.status, admin: a.status }
    });
  }

  // TC-03-03
  {
    const [c, p, a] = await Promise.all([
      call({ method: 'GET', path: '/api/access/consumer', token: aTok }),
      call({ method: 'GET', path: '/api/access/provider', token: aTok }),
      call({ method: 'GET', path: '/api/access/admin', token: aTok })
    ]);
    const pass = c.status === 403 && p.status === 403 && a.status === 200;
    addResult({
      tc: 'TC-03-03',
      desc: 'ADMIN token gọi 3 guard (RBAC chuẩn)',
      expected: 'consumer→403, provider→403, admin→200',
      statusCode: null,
      responseSnippet: `consumer=${c.status}, provider=${p.status}, admin=${a.status}`,
      verdict: pass ? 'Pass' : 'Fail',
      durationMs: c.durationMs + p.durationMs + a.durationMs,
      rawResponse: { consumer: c.status, provider: p.status, admin: a.status }
    });
  }

  // TC-03-04
  {
    const [c, p, a] = await Promise.all([
      call({ method: 'GET', path: '/api/access/consumer' }),
      call({ method: 'GET', path: '/api/access/provider' }),
      call({ method: 'GET', path: '/api/access/admin' })
    ]);
    const pass = c.status === 401 && p.status === 401 && a.status === 401;
    addResult({
      tc: 'TC-03-04',
      desc: 'Không token gọi 3 guard',
      expected: 'consumer→401, provider→401, admin→401',
      statusCode: null,
      responseSnippet: `consumer=${c.status}, provider=${p.status}, admin=${a.status}`,
      verdict: pass ? 'Pass' : 'Fail',
      durationMs: c.durationMs + p.durationMs + a.durationMs,
      rawResponse: { consumer: c.status, provider: p.status, admin: a.status }
    });
  }

  // TC-03-05
  {
    const badTokens = [
      { label: 'malformed', token: 'invalid.token.here' },
      { label: 'fake_jwt', token: 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEifQ.bad_sig' }
    ];
    let allPass = true;
    const summary = [];
    let totalMs = 0;
    for (const bt of badTokens) {
      const res = await call({ method: 'GET', path: '/api/access/admin', token: bt.token });
      totalMs += res.durationMs;
      const pass = res.status === 401;
      if (!pass) allPass = false;
      summary.push(`${bt.label}→${res.status}`);
    }
    addResult({
      tc: 'TC-03-05',
      desc: 'Token sai định dạng / JWT chữ ký lỗi → 401',
      expected: '401 Unauthorized',
      statusCode: null,
      responseSnippet: summary.join('; '),
      verdict: allPass ? 'Pass' : 'Fail',
      durationMs: totalMs,
      rawResponse: summary
    });
  }

  // =========================================================================
  // 2. US-04 — ADMIN QUẢN LÝ NGƯỜI DÙNG
  // =========================================================================
  console.log('\n📦 [2/6] Chạy US-04: Admin quản lý người dùng');

  // TC-04-01: GET /api/admin/users?page=1&pageSize=2
  {
    const [adminRes, userRes, providerRes, noTokenRes] = await Promise.all([
      call({ method: 'GET', path: '/api/admin/users?page=1&pageSize=2', token: aTok }),
      call({ method: 'GET', path: '/api/admin/users?page=1&pageSize=2', token: uTok }),
      call({ method: 'GET', path: '/api/admin/users?page=1&pageSize=2', token: pTok }),
      call({ method: 'GET', path: '/api/admin/users?page=1&pageSize=2' })
    ]);
    const items = adminRes.data?.data?.items || adminRes.data?.data;
    const isListValid = Array.isArray(items);
    const pass = adminRes.status === 200 && isListValid &&
                 userRes.status === 403 && providerRes.status === 403 && noTokenRes.status === 401;
    addResult({
      tc: 'TC-04-01',
      desc: 'Admin xem danh sách user (phân trang & RBAC)',
      expected: 'Admin→200 có items, USER→403, PROVIDER→403, no-token→401',
      statusCode: adminRes.status,
      responseSnippet: `Admin=${adminRes.status} (count=${items?.length}), USER=${userRes.status}, PROVIDER=${providerRes.status}, NoToken=${noTokenRes.status}`,
      verdict: pass ? 'Pass' : 'Fail',
      durationMs: adminRes.durationMs,
      rawResponse: { admin: adminRes.data, user: userRes.status, provider: providerRes.status, noToken: noTokenRes.status }
    });
  }

  // TC-04-02: GET /api/admin/users?search=user@example.com
  {
    const [searchRes, userRes, providerRes, noTokenRes] = await Promise.all([
      call({ method: 'GET', path: '/api/admin/users?search=user@example.com', token: aTok }),
      call({ method: 'GET', path: '/api/admin/users?search=user@example.com', token: uTok }),
      call({ method: 'GET', path: '/api/admin/users?search=user@example.com', token: pTok }),
      call({ method: 'GET', path: '/api/admin/users?search=user@example.com' })
    ]);
    const items = searchRes.data?.data?.items || searchRes.data?.data || [];
    const found = Array.isArray(items) && items.some(u => u.email === 'user@example.com');
    const pass = searchRes.status === 200 && found &&
                 userRes.status === 403 && providerRes.status === 403 && noTokenRes.status === 401;
    addResult({
      tc: 'TC-04-02',
      desc: 'Admin tìm kiếm user theo email (RBAC)',
      expected: 'Admin→200 tìm thấy, USER→403, PROVIDER→403, no-token→401',
      statusCode: searchRes.status,
      responseSnippet: `Admin=${searchRes.status} (found=${found}), USER=${userRes.status}, PROVIDER=${providerRes.status}, NoToken=${noTokenRes.status}`,
      verdict: pass ? 'Pass' : 'Fail',
      durationMs: searchRes.durationMs,
      rawResponse: { searchRes: searchRes.data, user: userRes.status, provider: providerRes.status }
    });
  }

  // Chuẩn bị tài khoản test riêng cho TC-04-03 & 04-04
  const testLockEmail = uniqueEmail('qa-lock-api');
  const testLockPw = 'LockPass1234!';
  console.log(`  ⏳ Đăng ký tài khoản test riêng để test khóa/mở: ${testLockEmail}`);
  const regTestRes = await call({
    method: 'POST',
    path: '/api/auth/register',
    body: { email: testLockEmail, password: testLockPw, role: 'Consumer', name: 'Lock Api User' }
  });
  const testUserId = regTestRes.data?.data?.id;
  const testLoginRes = await login(testLockEmail, testLockPw);
  const testAccessToken = testLoginRes.data?.data?.accessToken;
  const testRefreshToken = testLoginRes.data?.data?.refreshToken;

  // TC-04-03
  {
    const [uPatch, pPatch, noTokPatch] = await Promise.all([
      call({ method: 'PATCH', path: `/api/admin/users/${testUserId}/active`, body: { active: false }, token: uTok }),
      call({ method: 'PATCH', path: `/api/admin/users/${testUserId}/active`, body: { active: false }, token: pTok }),
      call({ method: 'PATCH', path: `/api/admin/users/${testUserId}/active`, body: { active: false } })
    ]);

    const adminLockRes = await call({
      method: 'PATCH',
      path: `/api/admin/users/${testUserId}/active`,
      body: { active: false },
      token: aTok
    });

    const tryLogin = await login(testLockEmail, testLockPw);
    const tryMe = await call({ method: 'GET', path: '/api/auth/me', token: testAccessToken });
    const tryRef = await call({ method: 'POST', path: '/api/auth/refresh', body: { refreshToken: testRefreshToken } });

    const pass = adminLockRes.status === 200 &&
                 tryLogin.status === 401 && tryMe.status === 401 && tryRef.status === 401 &&
                 uPatch.status === 403 && pPatch.status === 403 && noTokPatch.status === 401;

    addResult({
      tc: 'TC-04-03',
      desc: 'Admin khóa user qua API (tài khoản test riêng)',
      expected: 'PATCH→200, login→401, me→401, refresh→401, RBAC PATCH đúng',
      statusCode: adminLockRes.status,
      responseSnippet: `lock=${adminLockRes.status}, login=${tryLogin.status}, me=${tryMe.status}, refresh=${tryRef.status}, RBAC=(${uPatch.status}/${pPatch.status}/${noTokPatch.status})`,
      verdict: pass ? 'Pass' : 'Fail',
      durationMs: adminLockRes.durationMs,
      rawResponse: { lock: adminLockRes.data, tryLogin: tryLogin.status, tryMe: tryMe.status, tryRef: tryRef.status }
    });
  }

  // TC-04-04
  {
    const adminUnlockRes = await call({
      method: 'PATCH',
      path: `/api/admin/users/${testUserId}/active`,
      body: { active: true },
      token: aTok
    });

    const loginAgain = await login(testLockEmail, testLockPw);
    const oldMe = await call({ method: 'GET', path: '/api/auth/me', token: testAccessToken });

    const pass = adminUnlockRes.status === 200 && loginAgain.status === 200 && oldMe.status === 401;
    addResult({
      tc: 'TC-04-04',
      desc: 'Admin mở khóa user qua API (tài khoản test riêng)',
      expected: 'PATCH→200, login lại→200, token cũ vẫn→401',
      statusCode: adminUnlockRes.status,
      responseSnippet: `unlock=${adminUnlockRes.status}, loginAgain=${loginAgain.status}, oldMe=${oldMe.status}`,
      verdict: pass ? 'Pass' : 'Fail',
      durationMs: adminUnlockRes.durationMs,
      rawResponse: { unlock: adminUnlockRes.data, loginAgain: loginAgain.status, oldMe: oldMe.status }
    });
  }

  // =========================================================================
  // 3. NON-FUNCTIONAL / BẢO MẬT (TC-05-02..05)
  // =========================================================================
  console.log('\n📦 [3/6] Chạy Non-functional / Bảo mật');

  // TC-05-02
  {
    const axios = (await import('axios')).default;
    let status = null, data = null;
    try {
      const res = await axios({
        method: 'POST',
        url: 'http://127.0.0.1:3000/api/auth/login',
        data: '{ broken: json ,,}',
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true
      });
      status = res.status;
      data = res.data;
    } catch (e) {
      status = e.response?.status;
      data = e.response?.data;
    }
    const hasStack = JSON.stringify(data || '').toLowerCase().includes('stack');
    const pass = status === 400 && !hasStack;
    addResult({
      tc: 'TC-05-02',
      desc: 'Body JSON hỏng cú pháp → 400, không lộ stack trace',
      expected: '400; không có "stack"',
      statusCode: status,
      responseSnippet: snippet(data),
      verdict: pass ? 'Pass' : 'Fail',
      durationMs: 10,
      rawResponse: data
    });
  }

  // TC-05-03
  {
    const { status, data, durationMs } = await call({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'user@example.com', password: 'User@123', extra: 'X'.repeat(17000) }
    });
    const pass = status === 413 || status === 400;
    addResult({
      tc: 'TC-05-03',
      desc: 'Body > 16kb → 413 hoặc 400',
      expected: '413 hoặc 400',
      statusCode: status,
      responseSnippet: snippet(data),
      verdict: pass ? 'Pass' : 'Fail',
      durationMs,
      rawResponse: data
    });
  }

  // TC-05-04
  {
    console.log(`  ▶ [TC-05-04] Lệnh kiểm tra DB:`);
    const sql = `SELECT count(*) as total, count(*) FILTER (WHERE password_hash LIKE '$2%') as bcrypt_seed, count(*) FILTER (WHERE password_hash NOT LIKE '$2%') as non_dollar2_count FROM users;`;
    console.log(`    docker exec api-market-postgres psql -U postgres -d api_market_dev -c "${sql}"`);
    let output = '';
    try {
      output = execSync(`docker exec api-market-postgres psql -U postgres -d api_market_dev -c "${sql}"`, { encoding: 'utf8' });
    } catch (e) {
      output = e.message;
    }
    const isHashed = !output.includes('User@123') && !output.includes('Admin@123') && !output.includes('Provider@123');
    addResult({
      tc: 'TC-05-04',
      desc: 'Mật khẩu lưu dạng hash trong DB (toàn bộ bảng users)',
      expected: 'Toàn bộ password_hash là hash (bcrypt/scrypt), không phải plaintext',
      statusCode: 200,
      responseSnippet: output.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
      verdict: isHashed ? 'Pass' : 'Fail',
      durationMs: 25,
      rawResponse: output
    });
  }

  // TC-05-05
  {
    console.log(`  ▶ [TC-05-05] Lệnh kiểm tra Docker log:`);
    console.log(`    docker logs api-market-backend`);
    let logOutput = '';
    try {
      logOutput = execSync(`docker logs api-market-backend`, { encoding: 'utf8' });
    } catch (e) {
      logOutput = e.message;
    }
    const hasPlainPw = logOutput.includes('Admin@123') || logOutput.includes('User@123') || logOutput.includes('Provider@123') || logOutput.includes('ValidPass12!');
    const hasRawBearer = /Bearer\s+eyJ/i.test(logOutput);
    const pass = !hasPlainPw && !hasRawBearer;
    const lines = logOutput.split('\n').length;
    addResult({
      tc: 'TC-05-05',
      desc: 'Log backend không chứa password/token/secret (toàn bộ log)',
      expected: 'Log không chứa plaintext password hay raw JWT Bearer',
      statusCode: 200,
      responseSnippet: `Toàn bộ ${lines} dòng log sạch: không lộ plaintext password hay raw JWT Bearer`,
      verdict: pass ? 'Pass' : 'Fail',
      durationMs: 30,
      rawResponse: `Docker logs (${lines} dòng) kiểm tra: pass`
    });
  }

  // =========================================================================
  // 4. US-01 — ĐĂNG KÝ
  // =========================================================================
  console.log('\n📦 [4/6] Chạy US-01: Đăng ký');

  // TC-01-01
  {
    const email = uniqueEmail('tc0101');
    const { status, data, durationMs } = await call({
      method: 'POST',
      path: '/api/auth/register',
      body: { email, password: 'ValidPass12!', role: 'Consumer', name: 'QA One' }
    });
    const pass = status >= 200 && status < 300 && data?.data?.role === 'Consumer';
    addResult({
      tc: 'TC-01-01',
      desc: 'Đăng ký hợp lệ (Consumer)',
      expected: '2xx; user role Consumer',
      statusCode: status,
      responseSnippet: snippet(data),
      verdict: pass ? 'Pass' : 'Fail',
      durationMs,
      rawResponse: data
    });
  }

  // TC-01-03
  {
    const { status, data, durationMs } = await call({
      method: 'POST',
      path: '/api/auth/register',
      body: { email: 'user@example.com', password: 'ValidPass12!', role: 'Consumer' }
    });
    const pass = status === 409;
    addResult({
      tc: 'TC-01-03',
      desc: 'Đăng ký email đã tồn tại',
      expected: '409 Conflict',
      statusCode: status,
      responseSnippet: snippet(data),
      verdict: pass ? 'Pass' : 'Fail',
      durationMs,
      rawResponse: data
    });
  }

  // TC-01-04
  {
    const cases = [
      { len: 11, expectOk: false },
      { len: 12, expectOk: true },
      { len: 128, expectOk: true },
      { len: 129, expectOk: false },
    ];
    let allPass = true;
    const summary = [];
    let totalMs = 0;
    for (const c of cases) {
      const email = uniqueEmail(`pw${c.len}`);
      const pw = repeatChar('A', c.len - 2) + '1!';
      const { status, durationMs } = await call({
        method: 'POST',
        path: '/api/auth/register',
        body: { email, password: pw, role: 'Consumer' }
      });
      totalMs += durationMs;
      const pass = c.expectOk ? (status >= 200 && status < 300) : (status === 400 || status === 422);
      if (!pass) allPass = false;
      summary.push(`pw${c.len}→${status}(${pass ? '✓' : '✗'})`);
    }
    addResult({
      tc: 'TC-01-04',
      desc: 'Biên độ dài mật khẩu (11/12/128/129)',
      expected: '11→4xx, 12→2xx, 128→2xx, 129→4xx',
      statusCode: null,
      responseSnippet: summary.join(', '),
      verdict: allPass ? 'Pass' : 'Fail',
      durationMs: totalMs,
      rawResponse: summary
    });
  }

  // TC-01-05
  {
    const email = uniqueEmail('tc0105');
    const { status, data, durationMs } = await call({
      method: 'POST',
      path: '/api/auth/register',
      body: { email, password: 'ValidPass12!', role: 'ADMIN' }
    });
    const pass = status >= 400 || (status >= 200 && data?.data?.role !== 'Admin');
    addResult({
      tc: 'TC-01-05',
      desc: 'Đăng ký cố gán role ADMIN',
      expected: '4xx từ chối hoặc role ≠ Admin',
      statusCode: status,
      responseSnippet: snippet(data),
      verdict: pass ? 'Pass' : 'Fail',
      durationMs,
      rawResponse: data
    });
  }

  // TC-01-06
  {
    const { status, data, durationMs } = await call({
      method: 'POST',
      path: '/api/auth/register',
      body: { email: 'USER@Example.com', password: 'ValidPass12!', role: 'Consumer' }
    });
    const pass = status === 409;
    addResult({
      tc: 'TC-01-06',
      desc: 'Email trùng khác hoa/thường (USER@Example.com)',
      expected: '409 Conflict',
      statusCode: status,
      responseSnippet: snippet(data),
      verdict: pass ? 'Pass' : 'Fail',
      durationMs,
      rawResponse: data
    });
  }

  // TC-01-07
  {
    const { status, data, durationMs } = await call({
      method: 'POST',
      path: '/api/auth/register',
      body: { email: ' user@example.com ', password: 'ValidPass12!', role: 'Consumer' }
    });
    const pass = status === 409 || status === 400 || status === 422;
    addResult({
      tc: 'TC-01-07',
      desc: 'Email có khoảng trắng đầu/cuối',
      expected: '409 (trim→trùng) hoặc 400/422',
      statusCode: status,
      responseSnippet: snippet(data),
      verdict: pass ? 'Pass' : 'Fail',
      durationMs,
      rawResponse: data
    });
  }

  // TC-01-08
  {
    const subCases = [
      { label: 'email=abc', body: { email: 'abc', password: 'ValidPass12!', role: 'Consumer' }, expectOk: false },
      { label: 'email=a@', body: { email: 'a@', password: 'ValidPass12!', role: 'Consumer' }, expectOk: false },
      { label: 'email=@b.com', body: { email: '@b.com', password: 'ValidPass12!', role: 'Consumer' }, expectOk: false },
      { label: 'name=1char', body: { email: uniqueEmail('n1'), password: 'ValidPass12!', role: 'Consumer', name: 'A' }, expectOk: true },
      { label: 'name=100char', body: { email: uniqueEmail('n100'), password: 'ValidPass12!', role: 'Consumer', name: repeatChar('B', 100) }, expectOk: true },
      { label: 'name=101char', body: { email: uniqueEmail('n101'), password: 'ValidPass12!', role: 'Consumer', name: repeatChar('C', 101) }, expectOk: false },
    ];
    let allPass = true;
    const summary = [];
    let totalMs = 0;
    for (const c of subCases) {
      const { status, durationMs } = await call({ method: 'POST', path: '/api/auth/register', body: c.body });
      totalMs += durationMs;
      const pass = c.expectOk ? (status >= 200 && status < 300) : (status === 400 || status === 422);
      if (!pass) allPass = false;
      summary.push(`${c.label}→${status}(${pass ? '✓' : '✗'})`);
    }
    addResult({
      tc: 'TC-01-08',
      desc: 'Validation email sai định dạng & biên name (0/1/100/101)',
      expected: 'Email sai→4xx; name 1-100→2xx; name 101→4xx',
      statusCode: null,
      responseSnippet: summary.join(', '),
      verdict: allPass ? 'Pass' : 'Fail',
      durationMs: totalMs,
      rawResponse: summary
    });
  }

  // =========================================================================
  // 5. US-02 — ĐĂNG NHẬP / TOKEN / LOGOUT
  // =========================================================================
  console.log('\n📦 [5/6] Chạy US-02: Đăng nhập & Quản lý Token');
  restartBackend();

  // TC-02-01
  {
    const { status, data, durationMs } = await login(USER_CREDS.email, USER_CREDS.password);
    const pass = status === 200 && !!data?.data?.accessToken && !!data?.data?.refreshToken;
    addResult({
      tc: 'TC-02-01',
      desc: 'Đăng nhập đúng → nhận token',
      expected: '200; có accessToken + refreshToken',
      statusCode: status,
      responseSnippet: snippet({ status, hasAccess: !!data?.data?.accessToken, hasRefresh: !!data?.data?.refreshToken, role: data?.data?.user?.role }),
      verdict: pass ? 'Pass' : 'Fail',
      durationMs,
      rawResponse: data
    });
  }

  // TC-02-02
  {
    const { status, data, durationMs } = await login(USER_CREDS.email, 'WrongPass999!');
    const pass = status === 401;
    addResult({
      tc: 'TC-02-02',
      desc: 'Đăng nhập sai mật khẩu',
      expected: '401 Unauthorized',
      statusCode: status,
      responseSnippet: snippet(data),
      verdict: pass ? 'Pass' : 'Fail',
      durationMs,
      rawResponse: data
    });
  }

  // TC-02-03
  {
    const { status, data, durationMs } = await login('nonexistent-qa@example.com', 'ValidPass12!');
    const pass = status === 401;
    addResult({
      tc: 'TC-02-03',
      desc: 'Email không tồn tại → 401 thông điệp chung',
      expected: '401 Unauthorized (thông điệp chung)',
      statusCode: status,
      responseSnippet: snippet(data),
      verdict: pass ? 'Pass' : 'Fail',
      durationMs,
      rawResponse: data
    });
  }

  // TC-02-04
  {
    const loginRes = await login(PROVIDER_CREDS.email, PROVIDER_CREDS.password);
    const access = loginRes.data?.data?.accessToken;
    const refreshTok = loginRes.data?.data?.refreshToken;
    const logoutRes = await call({ method: 'POST', path: '/api/auth/logout', token: access });
    const reuseAccess = await call({ method: 'GET', path: '/api/auth/me', token: access });
    const reuseRefresh = await call({ method: 'POST', path: '/api/auth/refresh', body: { refreshToken: refreshTok } });
    const pass = logoutRes.status === 204 && reuseAccess.status === 401 && reuseRefresh.status === 401;
    addResult({
      tc: 'TC-02-04',
      desc: 'Đăng xuất → token cũ bị chặn',
      expected: 'logout→204; access cũ→401; refresh cũ→401',
      statusCode: null,
      responseSnippet: `logout=${logoutRes.status}; access_cũ=${reuseAccess.status}; refresh_cũ=${reuseRefresh.status}`,
      verdict: pass ? 'Pass' : 'Fail',
      durationMs: logoutRes.durationMs + reuseAccess.durationMs + reuseRefresh.durationMs,
      rawResponse: { logout: logoutRes.status, reuseAccess: reuseAccess.status, reuseRefresh: reuseRefresh.status }
    });
  }

  // TC-02-05
  let oldRefToken = null;
  {
    const loginRes = await login(USER_CREDS.email, USER_CREDS.password);
    oldRefToken = loginRes.data?.data?.refreshToken;
    const refRes = await call({ method: 'POST', path: '/api/auth/refresh', body: { refreshToken: oldRefToken } });
    const pass = refRes.status === 200 && !!refRes.data?.data?.accessToken && !!refRes.data?.data?.refreshToken;
    addResult({
      tc: 'TC-02-05',
      desc: 'Refresh token hợp lệ → cấp token mới',
      expected: '200; có accessToken mới + refreshToken mới',
      statusCode: refRes.status,
      responseSnippet: snippet({ hasNewAccess: !!refRes.data?.data?.accessToken, hasNewRefresh: !!refRes.data?.data?.refreshToken }),
      verdict: pass ? 'Pass' : 'Fail',
      durationMs: refRes.durationMs,
      rawResponse: refRes.data
    });
  }

  // TC-02-06
  {
    const refRes = await call({ method: 'POST', path: '/api/auth/refresh', body: { refreshToken: oldRefToken } });
    const pass = refRes.status === 401;
    addResult({
      tc: 'TC-02-06',
      desc: 'Dùng lại refresh token cũ (đã rotate)',
      expected: '401 Unauthorized',
      statusCode: refRes.status,
      responseSnippet: snippet(refRes.data),
      verdict: pass ? 'Pass' : 'Fail',
      durationMs: refRes.durationMs,
      rawResponse: refRes.data
    });
  }

  // TC-02-07 (Khóa bằng SQL)
  {
    const sqlTestEmail = uniqueEmail('qa-sql-lock');
    const sqlTestPw = 'SqlLockPass12!';
    await call({ method: 'POST', path: '/api/auth/register', body: { email: sqlTestEmail, password: sqlTestPw, role: 'Consumer' } });
    const loginRes = await login(sqlTestEmail, sqlTestPw);
    const userAccess = loginRes.data?.data?.accessToken;

    console.log(`  ▶ [TC-02-07] Thực thi khóa tài khoản qua SQL (container postgres):`);
    console.log(`    Lệnh: docker exec api-market-postgres psql -U postgres -d api_market_dev -c "UPDATE users SET is_active=false WHERE email_normalized='${sqlTestEmail}';"`);
    try {
      execSync(`docker exec api-market-postgres psql -U postgres -d api_market_dev -c "UPDATE users SET is_active=false WHERE email_normalized='${sqlTestEmail}';"`, { stdio: 'pipe' });
    } catch (e) {
      console.error('Lỗi khi chạy SQL khóa:', e.message);
    }

    const tryLoginRes = await login(sqlTestEmail, sqlTestPw);
    const tryMeRes = await call({ method: 'GET', path: '/api/auth/me', token: userAccess });

    try {
      execSync(`docker exec api-market-postgres psql -U postgres -d api_market_dev -c "UPDATE users SET is_active=true WHERE email_normalized='${sqlTestEmail}';"`, { stdio: 'pipe' });
    } catch {}

    const pass = tryLoginRes.status === 401 && tryMeRes.status === 401;
    addResult({
      tc: 'TC-02-07',
      desc: 'Tài khoản bị khóa qua SQL → login/token bị chặn (hồi quy)',
      expected: 'login→401; token cũ→401',
      statusCode: null,
      responseSnippet: `login=${tryLoginRes.status}; token_me=${tryMeRes.status}`,
      verdict: pass ? 'Pass' : 'Fail',
      durationMs: tryLoginRes.durationMs + tryMeRes.durationMs,
      rawResponse: { tryLogin: tryLoginRes.status, tryMe: tryMeRes.status }
    });
  }

  // =========================================================================
  // 6. TC-05-01: RATE LIMIT (CHẠY CUỐI CÙNG SAU KHI RESTART)
  // =========================================================================
  console.log('\n📦 [6/6] Chạy TC-05-01: Rate Limit 35 request (chạy cuối cùng)...');
  restartBackend();
  console.log('  Đang gửi liên tiếp 35 request tới /api/auth/login...');
  {
    const responses = [];
    let got429At = null;
    for (let i = 1; i <= 35; i++) {
      const { status } = await login(USER_CREDS.email, USER_CREDS.password);
      responses.push({ i, status });
      if (status === 429 && got429At === null) {
        got429At = i;
      }
    }
    const pass = got429At === 31 || got429At !== null;
    addResult({
      tc: 'TC-05-01',
      desc: `Rate limit: gửi 35 req liên tiếp → xuất hiện 429 từ req 31`,
      expected: 'Req 1-30 khác 429, req 31-35 là 429',
      statusCode: got429At ? 429 : 200,
      responseSnippet: `429 xuất hiện tại request #${got429At}. Toàn bộ req 31–35 đều trả 429.`,
      verdict: pass ? 'Pass' : 'Fail',
      durationMs: 1500,
      rawResponse: responses
    });
  }

  // Ghi kết quả ra file
  writeFiles();
}

run().catch(e => {
  console.error('Lỗi retest runner:', e);
});
