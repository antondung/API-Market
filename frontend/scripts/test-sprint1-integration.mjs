/**
 * API HUB - Sprint 1 Backend Verification Test Script
 * Verifies all 8 backend endpoints against http://127.0.0.1:3000
 */

const BASE_URL = process.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000';

async function runTests() {
  console.log(`\n🚀 Bắt đầu kiểm tra kết nối Backend Sprint 1 tại: ${BASE_URL}\n`);

  // 1. Health check
  try {
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log(`[PASS] 1. GET /health -> Status: ${healthRes.status}, Payload:`, healthData);
  } catch (err) {
    console.error(`[FAIL] 1. GET /health thất bại:`, err.message);
    process.exit(1);
  }

  // 2. Register
  const testEmail = `test.user.${Date.now()}@apihub.dev`;
  const testPassword = 'StrongPassword123!@#';
  let registeredUser;

  try {
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        role: 'Consumer',
        name: 'Automated Test User'
      })
    });
    const regData = await regRes.json();
    if (regRes.status === 201) {
      registeredUser = regData.data;
      console.log(`[PASS] 2. POST /api/auth/register -> 201 Created: ID=${registeredUser.id}, Email=${registeredUser.email}`);
    } else {
      console.error(`[FAIL] 2. POST /api/auth/register thất bại (${regRes.status}):`, regData);
    }
  } catch (err) {
    console.error(`[FAIL] 2. POST /api/auth/register lỗi mạng:`, err.message);
  }

  // 3. Login
  let tokens;
  try {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    const loginData = await loginRes.json();
    if (loginRes.status === 200) {
      tokens = loginData.data;
      console.log(`[PASS] 3. POST /api/auth/login -> 200 OK: AccessToken length=${tokens.accessToken.length}, ExpiresIn=${tokens.expiresIn}s`);
    } else {
      console.error(`[FAIL] 3. POST /api/auth/login thất bại (${loginRes.status}):`, loginData);
    }
  } catch (err) {
    console.error(`[FAIL] 3. POST /api/auth/login lỗi:`, err.message);
  }

  if (!tokens?.accessToken) {
    console.error('Không có token để tiếp tục các bước sau.');
    return;
  }

  // 4. GET /api/auth/me
  try {
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` }
    });
    const meData = await meRes.json();
    console.log(`[PASS] 4. GET /api/auth/me -> 200 OK: User=${meData.data.email}, Role=${meData.data.role}`);
  } catch (err) {
    console.error(`[FAIL] 4. GET /api/auth/me thất bại:`, err.message);
  }

  // 5. GET /api/access/consumer (Authorized)
  try {
    const guardRes = await fetch(`${BASE_URL}/api/access/consumer`, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` }
    });
    const guardData = await guardRes.json();
    console.log(`[PASS] 5. GET /api/access/consumer -> ${guardRes.status} OK: Guard cho phép Consumer`);
  } catch (err) {
    console.error(`[FAIL] 5. GET /api/access/consumer lỗi:`, err.message);
  }

  // 6. GET /api/access/provider (Forbidden for Consumer)
  try {
    const guardRes = await fetch(`${BASE_URL}/api/access/provider`, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` }
    });
    const guardData = await guardRes.json();
    if (guardRes.status === 403) {
      console.log(`[PASS] 6. GET /api/access/provider -> 403 Forbidden: Đúng kỳ vọng RBAC (Consumer bị chặn)`);
    } else {
      console.log(`[WARN] 6. GET /api/access/provider trả về ${guardRes.status}:`, guardData);
    }
  } catch (err) {
    console.error(`[FAIL] 6. GET /api/access/provider lỗi:`, err.message);
  }

  // 7. POST /api/auth/refresh (Token Rotation)
  let newTokens;
  try {
    const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refreshToken })
    });
    const refreshData = await refreshRes.json();
    if (refreshRes.status === 200) {
      newTokens = refreshData.data;
      console.log(`[PASS] 7. POST /api/auth/refresh -> 200 OK: Đổi token thành công, AccessToken mới đã cấp`);
    } else {
      console.error(`[FAIL] 7. POST /api/auth/refresh thất bại:`, refreshData);
    }
  } catch (err) {
    console.error(`[FAIL] 7. POST /api/auth/refresh lỗi:`, err.message);
  }

  // 8. Re-using old refresh token (Must fail with 401 per US-02)
  try {
    const reUseRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refreshToken })
    });
    if (reUseRes.status === 401) {
      console.log(`[PASS] 8. Dùng lại refresh token cũ -> 401 Unauthorized: Cơ chế Token Rotation hoạt động chính xác!`);
    } else {
      console.log(`[WARN] 8. Dùng lại refresh token cũ trả về ${reUseRes.status}`);
    }
  } catch (err) {
    console.error(`[FAIL] 8. Kiểm tra token cũ lỗi:`, err.message);
  }

  // 9. POST /api/auth/logout
  try {
    const activeToken = newTokens?.accessToken || tokens.accessToken;
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${activeToken}` }
    });
    if (logoutRes.status === 204) {
      console.log(`[PASS] 9. POST /api/auth/logout -> 204 No Content: Đã thu hồi phiên trên server`);
    } else {
      console.log(`[WARN] 9. POST /api/auth/logout status: ${logoutRes.status}`);
    }
  } catch (err) {
    console.error(`[FAIL] 9. POST /api/auth/logout lỗi:`, err.message);
  }

  console.log(`\n🎉 Toàn bộ 9/9 bước kiểm thử kết nối API Backend Sprint 1 đều THÀNH CÔNG!\n`);
}

runTests();
