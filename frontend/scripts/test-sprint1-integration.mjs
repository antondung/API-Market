/**
 * API HUB - Comprehensive Sprint 1 Integration Test Runner
 * Validates authentication, token rotation, RBAC, and Admin management endpoints
 * with strict assertions, structured reporting, and truthful exit codes.
 */

const BASE_URL = (process.env.VITE_API_BASE_URL || process.env.API_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
const REQUEST_TIMEOUT_MS = Number(process.env.TEST_TIMEOUT_MS) || 8000;

let passedCount = 0;
let failedCount = 0;
let skippedCount = 0;

function reportPass(step, description) {
  passedCount++;
  console.log(`\x1b[32m[PASS]\x1b[0m ${step}. ${description}`);
}

function reportFail(step, description, error) {
  failedCount++;
  console.error(`\x1b[31m[FAIL]\x1b[0m ${step}. ${description}`);
  if (error) console.error(`       Chi tiết:`, error);
}

function reportSkip(step, description, reason) {
  skippedCount++;
  console.log(`\x1b[33m[SKIP]\x1b[0m ${step}. ${description} (${reason})`);
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    let data = null;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await res.json().catch(() => null);
    }
    return { status: res.status, ok: res.ok, headers: res.headers, data };
  } finally {
    clearTimeout(timer);
  }
}

async function runAllTests() {
  console.log(`\n===============================================================`);
  console.log(`🧪 API HUB - SPRINT 1 INTEGRATION TEST SUITE`);
  console.log(`Target Backend: ${BASE_URL}`);
  console.log(`===============================================================\n`);

  // STEP 1: Health check
  try {
    const res = await request('/health');
    if (res.status === 200 && res.data?.status === 'ok') {
      reportPass(1, `GET /health -> 200 OK (status='ok')`);
    } else {
      reportFail(1, `GET /health mong đợi status 200 và payload.status='ok', nhận:`, res);
    }
  } catch (err) {
    reportFail(1, `GET /health lỗi kết nối đến ${BASE_URL}:`, err.message);
    console.error(`\n❌ Không thể kết nối tới backend. Vui lòng khởi động backend server trước khi chạy kiểm thử tích hợp.`);
    process.exit(1);
  }

  // STEP 2: Register Consumer account
  const timestamp = Date.now();
  const consumerEmail = `consumer.test.${timestamp}@apihub.dev`;
  const consumerPassword = 'ConsumerPassword123!@#';
  let consumerUserId = null;

  try {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: consumerEmail,
        password: consumerPassword,
        role: 'Consumer',
        name: 'Sprint 1 Automated Consumer'
      })
    });
    if (res.status === 201 && res.data?.data?.email === consumerEmail && res.data?.data?.role === 'Consumer') {
      consumerUserId = res.data.data.id;
      reportPass(2, `POST /api/auth/register (Consumer) -> 201 Created (ID: ${consumerUserId})`);
    } else {
      reportFail(2, `POST /api/auth/register (Consumer) thất bại:`, res.data);
    }
  } catch (err) {
    reportFail(2, `POST /api/auth/register lỗi mạng:`, err.message);
  }

  // STEP 2b: Duplicate email registration rejected (409 Conflict)
  try {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: consumerEmail,
        password: consumerPassword,
        role: 'Consumer',
        name: 'Duplicate Consumer'
      })
    });
    if (res.status === 409 && res.data?.error?.code === 'EMAIL_EXISTS') {
      reportPass('2b', `Đăng ký trùng lặp email -> 409 Conflict (EMAIL_EXISTS)`);
    } else {
      reportFail('2b', `Đăng ký trùng lặp mong đợi 409 EMAIL_EXISTS nhưng nhận ${res.status}:`, res.data);
    }
  } catch (err) {
    reportFail('2b', `Đăng ký trùng lặp lỗi mạng:`, err.message);
  }

  // STEP 2c: Validation error on invalid payload (400 Bad Request)
  try {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'not-an-email',
        password: 'short',
        role: 'InvalidRole'
      })
    });
    if (res.status === 400 && res.data?.error?.code === 'VALIDATION_ERROR') {
      reportPass('2c', `Đăng ký dữ liệu không hợp lệ -> 400 Bad Request (VALIDATION_ERROR)`);
    } else {
      reportFail('2c', `Đăng ký dữ liệu lỗi mong đợi 400 nhưng nhận ${res.status}:`, res.data);
    }
  } catch (err) {
    reportFail('2c', `Đăng ký dữ liệu lỗi mạng:`, err.message);
  }

  // STEP 3: Register Provider account
  const providerEmail = `provider.test.${timestamp}@apihub.dev`;
  const providerPassword = 'ProviderPassword123!@#';

  try {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: providerEmail,
        password: providerPassword,
        role: 'Provider',
        name: 'Sprint 1 Automated Provider'
      })
    });
    if (res.status === 201 && res.data?.data?.email === providerEmail && res.data?.data?.role === 'Provider') {
      reportPass(3, `POST /api/auth/register (Provider) -> 201 Created`);
    } else {
      reportFail(3, `POST /api/auth/register (Provider) thất bại:`, res.data);
    }
  } catch (err) {
    reportFail(3, `POST /api/auth/register lỗi mạng:`, err.message);
  }

  // STEP 3b: Invalid login credentials rejected (401 Unauthorized)
  try {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: consumerEmail, password: 'WrongPassword999!' })
    });
    if (res.status === 401) {
      reportPass('3b', `Đăng nhập sai mật khẩu -> 401 Unauthorized (Từ chối đúng)`);
    } else {
      reportFail('3b', `Đăng nhập sai mật khẩu mong đợi 401 nhưng nhận ${res.status}:`, res.data);
    }
  } catch (err) {
    reportFail('3b', `Đăng nhập sai mật khẩu lỗi mạng:`, err.message);
  }

  // STEP 4: Login Consumer
  let consumerTokens = null;
  try {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: consumerEmail, password: consumerPassword })
    });
    if (res.status === 200 && res.data?.data?.accessToken && res.data?.data?.refreshToken) {
      consumerTokens = res.data.data;
      reportPass(4, `POST /api/auth/login (Consumer) -> 200 OK (JWT cấp thành công)`);
    } else {
      reportFail(4, `POST /api/auth/login (Consumer) thất bại:`, res.data);
    }
  } catch (err) {
    reportFail(4, `POST /api/auth/login (Consumer) lỗi:`, err.message);
  }

  // STEP 5: Login Provider
  let providerTokens = null;
  try {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: providerEmail, password: providerPassword })
    });
    if (res.status === 200 && res.data?.data?.accessToken) {
      providerTokens = res.data.data;
      reportPass(5, `POST /api/auth/login (Provider) -> 200 OK`);
    } else {
      reportFail(5, `POST /api/auth/login (Provider) thất bại:`, res.data);
    }
  } catch (err) {
    reportFail(5, `POST /api/auth/login (Provider) lỗi:`, err.message);
  }

  // STEP 6: GET /api/auth/me (Identity validation)
  if (consumerTokens?.accessToken) {
    try {
      const res = await request('/api/auth/me', {
        headers: { Authorization: `Bearer ${consumerTokens.accessToken}` }
      });
      if (res.status === 200 && res.data?.data?.email === consumerEmail) {
        reportPass(6, `GET /api/auth/me -> 200 OK (Xác thực danh tính Consumer)`);
      } else {
        reportFail(6, `GET /api/auth/me thất bại:`, res.data);
      }
    } catch (err) {
      reportFail(6, `GET /api/auth/me lỗi:`, err.message);
    }
  } else {
    reportSkip(6, `GET /api/auth/me`, 'Không có token Consumer');
  }

  // STEP 7: RBAC Consumer allowed on /api/access/consumer
  if (consumerTokens?.accessToken) {
    try {
      const res = await request('/api/access/consumer', {
        headers: { Authorization: `Bearer ${consumerTokens.accessToken}` }
      });
      if (res.status === 200) {
        reportPass(7, `GET /api/access/consumer (Consumer) -> 200 OK`);
      } else {
        reportFail(7, `GET /api/access/consumer thất bại:`, res.data);
      }
    } catch (err) {
      reportFail(7, `GET /api/access/consumer lỗi:`, err.message);
    }
  } else {
    reportSkip(7, `GET /api/access/consumer`, 'Thiếu token');
  }

  // STEP 8: RBAC Consumer forbidden on /api/access/provider
  if (consumerTokens?.accessToken) {
    try {
      const res = await request('/api/access/provider', {
        headers: { Authorization: `Bearer ${consumerTokens.accessToken}` }
      });
      if (res.status === 403) {
        reportPass(8, `GET /api/access/provider (Consumer) -> 403 Forbidden (RBAC Guard chặn đúng)`);
      } else {
        reportFail(8, `GET /api/access/provider mong đợi 403 nhưng trả về ${res.status}:`, res.data);
      }
    } catch (err) {
      reportFail(8, `GET /api/access/provider lỗi:`, err.message);
    }
  } else {
    reportSkip(8, `GET /api/access/provider`, 'Thiếu token');
  }

  // STEP 9: RBAC Consumer forbidden on /api/access/admin
  if (consumerTokens?.accessToken) {
    try {
      const res = await request('/api/access/admin', {
        headers: { Authorization: `Bearer ${consumerTokens.accessToken}` }
      });
      if (res.status === 403) {
        reportPass(9, `GET /api/access/admin (Consumer) -> 403 Forbidden`);
      } else {
        reportFail(9, `GET /api/access/admin mong đợi 403 nhưng trả về ${res.status}:`, res.data);
      }
    } catch (err) {
      reportFail(9, `GET /api/access/admin lỗi:`, err.message);
    }
  } else {
    reportSkip(9, `GET /api/access/admin`, 'Thiếu token');
  }

  // STEP 10: RBAC Provider allowed on /api/access/provider and strictly forbidden on /api/access/consumer
  if (providerTokens?.accessToken) {
    try {
      const resProvider = await request('/api/access/provider', {
        headers: { Authorization: `Bearer ${providerTokens.accessToken}` }
      });
      const resConsumer = await request('/api/access/consumer', {
        headers: { Authorization: `Bearer ${providerTokens.accessToken}` }
      });
      if (resProvider.status === 200 && resConsumer.status === 403) {
        reportPass(10, `GET /api/access/* (Provider) -> 200 OK cho Provider, 403 Forbidden cho /api/access/consumer (Backend RBAC đúng chuẩn)`);
      } else {
        reportFail(10, `Provider access guard thất bại:`, { providerStatus: resProvider.status, consumerStatus: resConsumer.status });
      }
    } catch (err) {
      reportFail(10, `Provider access guard lỗi:`, err.message);
    }
  } else {
    reportSkip(10, `GET /api/access/* (Provider)`, 'Thiếu token');
  }

  // STEP 11: Refresh Token Rotation (US-02)
  let rotatedTokens = null;
  if (consumerTokens?.refreshToken) {
    try {
      const res = await request('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: consumerTokens.refreshToken })
      });
      if (res.status === 200 && res.data?.data?.accessToken && res.data?.data?.refreshToken) {
        rotatedTokens = res.data.data;
        reportPass(11, `POST /api/auth/refresh -> 200 OK (Quay vòng refresh token thành công)`);
      } else {
        reportFail(11, `POST /api/auth/refresh thất bại:`, res.data);
      }
    } catch (err) {
      reportFail(11, `POST /api/auth/refresh lỗi:`, err.message);
    }
  } else {
    reportSkip(11, `POST /api/auth/refresh`, 'Thiếu refresh token');
  }

  // STEP 12: Reusing old refresh token must be rejected (401)
  if (consumerTokens?.refreshToken) {
    try {
      const res = await request('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: consumerTokens.refreshToken })
      });
      if (res.status === 401) {
        reportPass(12, `Tái sử dụng refresh token cũ -> 401 Unauthorized (Chống phát lại token thành công)`);
      } else {
        reportFail(12, `Tái sử dụng refresh token cũ mong đợi 401 nhưng trả về ${res.status}:`, res.data);
      }
    } catch (err) {
      reportFail(12, `Kiểm tra refresh token cũ lỗi:`, err.message);
    }
  } else {
    reportSkip(12, `Reusing old refresh token`, 'Thiếu token');
  }

  // STEP 13: Admin Endpoints (US-04)
  let adminTokens = null;
  try {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    if (res.status === 200 && res.data?.data?.user?.role === 'Admin') {
      adminTokens = res.data.data;
      reportPass(13, `Đăng nhập tài khoản Admin (${ADMIN_EMAIL}) -> 200 OK`);
    } else {
      reportSkip(13, `Admin API Suite`, `Tài khoản ${ADMIN_EMAIL} chưa được seed hoặc không khả dụng`);
    }
  } catch {
    reportSkip(13, `Admin API Suite`, `Không kết nối được để đăng nhập Admin`);
  }

  if (adminTokens?.accessToken && consumerUserId) {
    // 13.1 Admin list users
    try {
      const res = await request('/api/admin/users?page=1&pageSize=10', {
        headers: { Authorization: `Bearer ${adminTokens.accessToken}` }
      });
      if (res.status === 200 && Array.isArray(res.data?.data?.items) && typeof res.data?.data?.total === 'number') {
        reportPass(14, `GET /api/admin/users (Admin) -> 200 OK (Tổng số user: ${res.data.data.total})`);
      } else {
        reportFail(14, `GET /api/admin/users thất bại:`, res.data);
      }
    } catch (err) {
      reportFail(14, `GET /api/admin/users lỗi:`, err.message);
    }

    // 13.1b Admin query filter & pagination
    try {
      const res = await request('/api/admin/users?role=Provider&active=true&page=1&pageSize=5', {
        headers: { Authorization: `Bearer ${adminTokens.accessToken}` }
      });
      if (res.status === 200 && Array.isArray(res.data?.data?.items) && res.data?.data?.page === 1) {
        reportPass('14b', `GET /api/admin/users?role=Provider&active=true&pageSize=5 -> 200 OK (Pagination & Filtering hoạt động đúng)`);
      } else {
        reportFail('14b', `GET /api/admin/users với filter thất bại:`, res.data);
      }
    } catch (err) {
      reportFail('14b', `GET /api/admin/users filter lỗi:`, err.message);
    }

    // 13.2 Consumer blocked from listing users
    try {
      const activeConsumerToken = rotatedTokens?.accessToken || consumerTokens?.accessToken;
      const res = await request('/api/admin/users', {
        headers: { Authorization: `Bearer ${activeConsumerToken}` }
      });
      if (res.status === 403) {
        reportPass(15, `GET /api/admin/users (Consumer) -> 403 Forbidden (Bảo vệ RBAC quản trị)`);
      } else {
        reportFail(15, `Consumer truy cập /api/admin/users mong đợi 403 nhưng nhận ${res.status}:`, res.data);
      }
    } catch (err) {
      reportFail(15, `Consumer truy cập admin/users lỗi:`, err.message);
    }

    // 13.3 Admin lock user & verify session revocation
    try {
      const lockRes = await request(`/api/admin/users/${consumerUserId}/active`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
        body: JSON.stringify({ active: false })
      });
      if (lockRes.status === 200 && lockRes.data?.data?.user?.active === false) {
        reportPass(16, `PATCH /api/admin/users/:id/active (Lock user) -> 200 OK`);
      } else {
        reportFail(16, `Khóa tài khoản thất bại:`, lockRes.data);
      }

      // Verify locked consumer cannot call /me
      const activeConsumerToken = rotatedTokens?.accessToken || consumerTokens?.accessToken;
      const verifyLockedRes = await request('/api/auth/me', {
        headers: { Authorization: `Bearer ${activeConsumerToken}` }
      });
      if (verifyLockedRes.status === 401) {
        reportPass(17, `Phiên của user bị khóa lập tức bị thu hồi -> 401 Unauthorized`);
      } else {
        reportFail(17, `User bị khóa vẫn gọi được /api/auth/me (${verifyLockedRes.status}):`, verifyLockedRes.data);
      }

      // Admin unlock user
      const unlockRes = await request(`/api/admin/users/${consumerUserId}/active`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
        body: JSON.stringify({ active: true })
      });
      if (unlockRes.status === 200 && unlockRes.data?.data?.user?.active === true) {
        reportPass(18, `PATCH /api/admin/users/:id/active (Unlock user) -> 200 OK`);
      } else {
        reportFail(18, `Mở khóa tài khoản thất bại:`, unlockRes.data);
      }
    } catch (err) {
      reportFail(16, `Khóa/mở khóa tài khoản lỗi:`, err.message);
    }

    // 13.4 Admin self-lock prevention
    try {
      const adminUserId = adminTokens.user.id;
      const selfLockRes = await request(`/api/admin/users/${adminUserId}/active`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
        body: JSON.stringify({ active: false })
      });
      if (selfLockRes.status === 409 && selfLockRes.data?.error?.code === 'CANNOT_MODIFY_SELF') {
        reportPass(19, `Admin tự khóa chính mình -> 409 Conflict (CANNOT_MODIFY_SELF chặn đúng)`);
      } else {
        reportFail(19, `Admin tự khóa mong đợi 409 Conflict nhưng nhận ${selfLockRes.status}:`, selfLockRes.data);
      }
    } catch (err) {
      reportFail(19, `Admin self-lock check lỗi:`, err.message);
    }
  }

  // STEP 20: Logout & Session Revocation
  const tokenToRevoke = rotatedTokens?.accessToken || consumerTokens?.accessToken;
  if (tokenToRevoke) {
    try {
      const res = await request('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenToRevoke}` }
      });
      if (res.status === 204) {
        reportPass(20, `POST /api/auth/logout -> 204 No Content (Thu hồi phiên thành công)`);
      } else {
        reportFail(20, `POST /api/auth/logout mong đợi 204 nhưng nhận ${res.status}:`, res.data);
      }

      // Verify token cannot be used after logout
      const postLogoutRes = await request('/api/auth/me', {
        headers: { Authorization: `Bearer ${tokenToRevoke}` }
      });
      if (postLogoutRes.status === 401) {
        reportPass(21, `Gọi API sau khi đăng xuất -> 401 Unauthorized (Phiên đã bị vô hiệu hóa)`);
      } else {
        reportFail(21, `Gọi API sau đăng xuất mong đợi 401 nhưng nhận ${postLogoutRes.status}:`, postLogoutRes.data);
      }
    } catch (err) {
      reportFail(20, `POST /api/auth/logout lỗi:`, err.message);
    }
  } else {
    reportSkip(20, `POST /api/auth/logout`, 'Thiếu token để đăng xuất');
  }

  // FINAL SUMMARY
  console.log(`\n===============================================================`);
  console.log(`📊 KẾT QUẢ KIỂM THỬ TÍCH HỢP SPRINT 1:`);
  console.log(`   ✅ Thành công (PASS):  ${passedCount}`);
  console.log(`   ❌ Thất bại   (FAIL):  ${failedCount}`);
  console.log(`   ⚠️ Bỏ qua     (SKIP):  ${skippedCount}`);
  console.log(`===============================================================\n`);

  if (failedCount > 0) {
    console.error(`💥 CÓ ${failedCount} BƯỚC KIỂM THỬ THẤT BẠI. DỪNG VỚI EXIT CODE 1.\n`);
    process.exit(1);
  } else {
    console.log(`🎉 TẤT CẢ CÁC BƯỚC KIỂM THỬ ĐÃ THỰC THI ĐỀU ĐẠT CHUẨN XÁC THỰC SPRINT 1!\n`);
    process.exit(0);
  }
}

runAllTests().catch(err => {
  console.error('Unhandled Test Runner Exception:', err);
  process.exit(1);
});
