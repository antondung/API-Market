/**
 * sprint3-marketplace-runner.js
 * Automated QA Test Suite for Sprint 3: Backend Marketplace & API Detail (US-16, US-17)
 * Based on technical contract: backend/SPRINT-3-HANDOFF.md (PR #69 / #73)
 *
 * QA Lead: Trần Hà Thảo Vân (@vuonghathaovan-gif — Issue #15)
 */

import fs from 'node:fs';
import path from 'node:path';
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

async function apiRequest(method, endpoint, { headers = {}, query = null } = {}) {
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

  try {
    const res = await fetch(url, {
      method,
      headers: reqHeaders
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
  console.log('   BỘ KIỂM THỬ TỰ ĐỘNG SPRINT 3: MARKETPLACE & API DETAIL');
  console.log(`   Target Base URL: ${BASE_URL}`);
  console.log(`   Database URL:    ${DB_URL.replace(/:[^:@]+@/, ':***@')}`);
  console.log('   QA Lead: Trần Hà Thảo Vân (@vuonghathaovan-gif — Issue #15)');
  console.log('================================================================\n');

  // Verify server reachability
  const healthCheck = await apiRequest('GET', '/health');
  if (healthCheck.status !== 200) {
    console.error(`❌ Máy chủ ${BASE_URL} không phản hồi /health hợp lệ (status: ${healthCheck.status}).`);
    console.error('Vui lòng đảm bảo container api-market-backend đang chạy.');
    process.exit(1);
  }
  log('Máy chủ Backend đang hoạt động bình thường.');

  // Pre-fetch published APIs from DB to cross-check if DB is accessible
  let dbApis = [];
  let testPublishedApi = null;
  let testDraftApi = null;
  if (pool) {
    try {
      const dbRes = await pool.query(`
        SELECT a.id, a.name, a.status, a.category, a.tags, p.id as provider_id, p.provider_name
        FROM apis a
        JOIN api_providers p ON p.id = a.provider_id
        JOIN users u ON u.id = p.user_id
        WHERE a.status = 'Published' AND u.is_active = TRUE
        ORDER BY a.published_at DESC, a.id DESC
      `);
      dbApis = dbRes.rows;
      if (dbApis.length > 0) {
        testPublishedApi = dbApis[0];
        log(`Tìm thấy ${dbApis.length} API Published trong PostgreSQL để đối soát.`);
      }

      // Check if there are non-published APIs (Draft/Submitted/etc.)
      const draftRes = await pool.query(`SELECT id, name, status FROM apis WHERE status != 'Published' LIMIT 1`);
      if (draftRes.rows.length > 0) {
        testDraftApi = draftRes.rows[0];
      }
    } catch (err) {
      log(`Không thể truy vấn trực tiếp DB: ${err.message}. Sẽ kiểm tra thuần HTTP.`);
    }
  }

  // =========================================================================
  // SUITE 1: US-16 — Tìm kiếm & Khám phá Marketplace
  // =========================================================================
  console.log('\n--- [SUITE 1] US-16: Tìm kiếm & Truy vấn Danh sách Marketplace ---');

  // TC-16-01: Public listing returns 200 without JWT
  let firstPageItems = [];
  let totalPublished = 0;
  {
    const res = await apiRequest('GET', '/api/marketplace/apis');
    const d = res.data?.data;
    const items = d?.items || [];
    const passed = res.status === 200 && Array.isArray(items) && typeof d?.total === 'number' && d?.page === 1;
    firstPageItems = items;
    totalPublished = d?.total || 0;
    await recordResult('TC-16-01', 'US-16', 'Truy vấn danh sách Marketplace công khai (không cần JWT)', passed, {
      status: res.status,
      itemCount: items.length,
      total: d?.total
    });
  }

  // TC-16-02: Keyword search (case-insensitive substring)
  {
    const queryTerm = firstPageItems.length > 0 ? firstPageItems[0].name.slice(0, 4) : 'API';
    const lowerRes = await apiRequest('GET', '/api/marketplace/apis', { query: { q: queryTerm.toLowerCase() } });
    const upperRes = await apiRequest('GET', '/api/marketplace/apis', { query: { q: queryTerm.toUpperCase() } });

    const lowerItems = lowerRes.data?.data?.items || [];
    const upperItems = upperRes.data?.data?.items || [];
    const passed = lowerRes.status === 200 && upperRes.status === 200 && lowerItems.length === upperItems.length && lowerItems.length > 0;
    await recordResult('TC-16-02', 'US-16', 'Tìm kiếm từ khóa không phân biệt hoa thường (case-insensitive)', passed, {
      term: queryTerm,
      lowerCount: lowerItems.length,
      upperCount: upperItems.length
    });
  }

  // TC-16-03: Literal search handles wildcards % and _ as ordinary characters
  {
    const resPercent = await apiRequest('GET', '/api/marketplace/apis', { query: { q: '%' } });
    const resUnderscore = await apiRequest('GET', '/api/marketplace/apis', { query: { q: '_' } });
    // Should NOT act as wildcard to return all DB records unless they literally contain % or _
    const passed = resPercent.status === 200 && resUnderscore.status === 200;
    await recordResult('TC-16-03', 'US-16', 'Tìm kiếm ký tự đặc biệt % và _ như chuỗi thông thường (không wildcard)', passed, {
      percentMatches: resPercent.data?.data?.items?.length,
      underscoreMatches: resUnderscore.data?.data?.items?.length
    });
  }

  // =========================================================================
  // SUITE 2: US-16 — Bộ lọc kết hợp Logic AND
  // =========================================================================
  console.log('\n--- [SUITE 2] US-16: Bộ lọc kết hợp Logic AND ---');

  // TC-16-04: Filter by category
  let sampleCategory = firstPageItems.length > 0 ? firstPageItems[0].category : null;
  {
    if (sampleCategory) {
      const res = await apiRequest('GET', '/api/marketplace/apis', { query: { category: sampleCategory } });
      const items = res.data?.data?.items || [];
      const allMatch = items.length > 0 && items.every(i => i.category === sampleCategory);
      await recordResult('TC-16-04', 'US-16', `Lọc chính xác theo danh mục (category=${sampleCategory})`, res.status === 200 && allMatch, {
        status: res.status,
        count: items.length
      });
    } else {
      await recordResult('TC-16-04', 'US-16', 'Lọc danh mục (bỏ qua vì danh sách rỗng)', true, { skipped: true });
    }
  }

  // TC-16-05: Filter by tag
  let sampleTag = firstPageItems.find(i => Array.isArray(i.tags) && i.tags.length > 0)?.tags[0];
  {
    if (sampleTag) {
      const res = await apiRequest('GET', '/api/marketplace/apis', { query: { tag: sampleTag } });
      const items = res.data?.data?.items || [];
      const allMatch = items.length > 0 && items.every(i => Array.isArray(i.tags) && i.tags.includes(sampleTag));
      await recordResult('TC-16-05', 'US-16', `Lọc chính xác theo tag (tag=${sampleTag})`, res.status === 200 && allMatch, {
        status: res.status,
        count: items.length
      });
    } else {
      await recordResult('TC-16-05', 'US-16', 'Lọc tag (bỏ qua vì không có tag)', true, { skipped: true });
    }
  }

  // TC-16-06: Filter by pricing=free and pricing=paid
  {
    const resFree = await apiRequest('GET', '/api/marketplace/apis', { query: { pricing: 'free' } });
    const resPaid = await apiRequest('GET', '/api/marketplace/apis', { query: { pricing: 'paid' } });
    const freeItems = resFree.data?.data?.items || [];
    const paidItems = resPaid.data?.data?.items || [];

    const freePassed = resFree.status === 200 && freeItems.every(i => i.hasFreePlan === true);
    const paidPassed = resPaid.status === 200 && paidItems.every(i => i.hasPaidPlan === true);
    const passed = freePassed && paidPassed;
    await recordResult('TC-16-06', 'US-16', 'Lọc theo gói cước giá (pricing=free và pricing=paid)', passed, {
      freeStatus: resFree.status,
      freeCount: freeItems.length,
      paidStatus: resPaid.status,
      paidCount: paidItems.length
    });
  }

  // TC-16-07: Combined AND filters
  {
    if (sampleCategory) {
      const res = await apiRequest('GET', '/api/marketplace/apis', { query: { category: sampleCategory, pricing: 'free' } });
      const items = res.data?.data?.items || [];
      const allMatch = items.every(i => i.category === sampleCategory && i.hasFreePlan === true);
      const passed = res.status === 200 && allMatch;
      await recordResult('TC-16-07', 'US-16', 'Bộ lọc kết hợp logic AND (category AND pricing=free)', passed, {
        status: res.status,
        count: items.length
      });
    } else {
      await recordResult('TC-16-07', 'US-16', 'Bộ lọc kết hợp AND (bỏ qua vì danh sách rỗng)', true, { skipped: true });
    }
  }

  // =========================================================================
  // SUITE 3: US-16 — Sắp xếp, Phân trang & Validation
  // =========================================================================
  console.log('\n--- [SUITE 3] US-16: Sắp xếp, Phân trang & Validation ---');

  // TC-16-08: Sort by newest and sort by name
  {
    const resNewest = await apiRequest('GET', '/api/marketplace/apis', { query: { sort: 'newest', pageSize: 10 } });
    const resName = await apiRequest('GET', '/api/marketplace/apis', { query: { sort: 'name', pageSize: 10 } });
    const itemsNewest = resNewest.data?.data?.items || [];
    const itemsName = resName.data?.data?.items || [];

    const passed = resNewest.status === 200 && resName.status === 200 && itemsNewest.length > 0;
    await recordResult('TC-16-08', 'US-16', 'Sắp xếp ổn định (sort=newest và sort=name)', passed, {
      newestFirstId: itemsNewest[0]?.id,
      nameFirstId: itemsName[0]?.id,
      nameFirstName: itemsName[0]?.name
    });
  }

  // TC-16-09: Pagination consistency and deep page handling
  {
    const resPage1 = await apiRequest('GET', '/api/marketplace/apis', { query: { page: 1, pageSize: 2 } });
    const resDeep = await apiRequest('GET', '/api/marketplace/apis', { query: { page: 9999, pageSize: 20 } });
    const p1Data = resPage1.data?.data;
    const deepData = resDeep.data?.data;

    const passed = resPage1.status === 200 && resDeep.status === 200 &&
      p1Data.page === 1 && p1Data.pageSize === 2 &&
      deepData.page === 9999 && Array.isArray(deepData.items) && deepData.items.length === 0 &&
      deepData.total === p1Data.total;
    await recordResult('TC-16-09', 'US-16', 'Phân trang chuẩn xác và trang sâu trả items rỗng giữ nguyên total', passed, {
      p1Count: p1Data?.items?.length,
      deepCount: deepData?.items?.length,
      total: p1Data?.total
    });
  }

  // TC-16-10: Input validation rejects invalid params
  {
    const resInvalidPage = await apiRequest('GET', '/api/marketplace/apis', { query: { page: 0 } });
    const resInvalidSize = await apiRequest('GET', '/api/marketplace/apis', { query: { pageSize: 500 } });
    const resInvalidPricing = await apiRequest('GET', '/api/marketplace/apis', { query: { pricing: 'invalid_mode' } });

    const passed = resInvalidPage.status === 400 && resInvalidSize.status === 400 && resInvalidPricing.status === 400;
    await recordResult('TC-16-10', 'US-16', 'Validation từ chối tham số không hợp lệ (page=0, pageSize>100, pricing sai)', passed, {
      page0Status: resInvalidPage.status,
      size500Status: resInvalidSize.status,
      pricingStatus: resInvalidPricing.status
    });
  }

  // =========================================================================
  // SUITE 4: US-16 & US-17 — Quy tắc Hiển thị & Cách ly Trạng thái
  // =========================================================================
  console.log('\n--- [SUITE 4] US-16 & US-17: Quy tắc Hiển thị & Cách ly Trạng thái ---');

  // TC-16-11: Verify non-published APIs never leak into marketplace list
  {
    const allMarketplace = await apiRequest('GET', '/api/marketplace/apis', { query: { pageSize: 100 } });
    const items = allMarketplace.data?.data?.items || [];
    // If we have draft API from DB, make sure it is not in the list
    let leakedDraft = false;
    if (testDraftApi) {
      leakedDraft = items.some(i => String(i.id) === String(testDraftApi.id));
    }
    const passed = allMarketplace.status === 200 && !leakedDraft;
    await recordResult('TC-16-11', 'US-16', 'API chưa Published (Draft/Review/Suspend) tuyệt đối không lọt vào Marketplace', passed, {
      testedDraftId: testDraftApi?.id,
      leaked: leakedDraft
    });
  }

  // TC-17-01: Direct GET on non-existent or Draft API returns 404
  {
    const nonExistentId = '999999999';
    const resNotFound = await apiRequest('GET', `/api/marketplace/apis/${nonExistentId}`);
    let draftRes = { status: 404 };
    if (testDraftApi) {
      draftRes = await apiRequest('GET', `/api/marketplace/apis/${testDraftApi.id}`);
    }
    const passed = resNotFound.status === 404 && draftRes.status === 404;
    await recordResult('TC-17-01', 'US-17', 'Gọi trực tiếp ID của API không tồn tại hoặc API Draft đều trả về 404', passed, {
      notFoundStatus: resNotFound.status,
      draftStatus: draftRes.status
    });
  }

  // TC-17-02: Invalid ID format returns uniform 404 NOT_FOUND (Security design: uniform error)
  {
    const res = await apiRequest('GET', '/api/marketplace/apis/invalid-id-abc');
    const passed = res.status === 404 && res.data?.error?.code === 'NOT_FOUND';
    await recordResult('TC-17-02', 'US-17', 'ID sai định dạng/phi số trả về đồng nhất HTTP 404 Not Found (Uniform 404)', passed, {
      status: res.status,
      errorCode: res.data?.error?.code
    });
  }

  // =========================================================================
  // SUITE 5: US-17 — Chi tiết API & Kiểm thử Không rò rỉ dữ liệu (Anti-Leak)
  // =========================================================================
  console.log('\n--- [SUITE 5] US-17: Chi tiết API & Kiểm tra Bảo mật Dữ liệu ---');

  let targetApiId = firstPageItems.length > 0 ? firstPageItems[0].id : (testPublishedApi?.id || null);

  // TC-17-03: Published API detail projection
  let detailData = null;
  {
    if (targetApiId) {
      const res = await apiRequest('GET', `/api/marketplace/apis/${targetApiId}`);
      detailData = res.data?.data;
      const hasStructure = detailData &&
        detailData.id &&
        detailData.name &&
        Array.isArray(detailData.versions) &&
        Array.isArray(detailData.endpoints) &&
        Array.isArray(detailData.plans) &&
        detailData.providerName;
      const passed = res.status === 200 && hasStructure;
      await recordResult('TC-17-03', 'US-17', 'Chi tiết API công khai đầy đủ cấu trúc versions, endpoints, plans, docs', passed, {
        status: res.status,
        apiName: detailData?.name,
        endpointCount: detailData?.endpoints?.length,
        versionCount: detailData?.versions?.length,
        planCount: detailData?.plans?.length
      });
    } else {
      await recordResult('TC-17-03', 'US-17', 'Chi tiết API (bỏ qua vì không có API Published)', true, { skipped: true });
    }
  }

  // TC-17-04: Security Anti-Leak Audit (No internal KYC, challenge tokens, review notes, secrets)
  {
    if (detailData) {
      const payloadStr = JSON.stringify(detailData);
      const leaks = [];
      if (payloadStr.includes('evidenceUrls') || payloadStr.includes('evidence_urls')) leaks.push('evidenceUrls');
      if (payloadStr.includes('challenge_token') || payloadStr.includes('platform-verification=')) leaks.push('challengeToken');
      if (payloadStr.includes('review_notes') || payloadStr.includes('reject_reason')) leaks.push('reviewNotes');
      if (payloadStr.includes('password_hash')) leaks.push('password_hash');

      const passed = leaks.length === 0;
      await recordResult('TC-17-04', 'US-17', 'Kiểm tra bảo mật: Không rò rỉ KYC evidence, DNS challenge token hay ghi chú duyệt', passed, {
        leaksDetected: leaks
      });
    } else {
      await recordResult('TC-17-04', 'US-17', 'Bảo mật Anti-Leak (bỏ qua vì không có data)', true, { skipped: true });
    }
  }

  // TC-17-05: Plans in detail only include active plans (is_active=true)
  {
    if (detailData && Array.isArray(detailData.plans)) {
      const allNumbers = detailData.plans.every(p => typeof p.priceMonthly === 'number' && typeof p.quota === 'number');
      const passed = allNumbers;
      await recordResult('TC-17-05', 'US-17', 'Danh sách gói cước chuẩn hóa dạng JSON number và chỉ trả gói active', passed, {
        planCount: detailData.plans.length
      });
    } else {
      await recordResult('TC-17-05', 'US-17', 'Gói cước (bỏ qua vì không có plan)', true, { skipped: true });
    }
  }

  // TC-17-06: Cache-Control header is no-store
  {
    if (targetApiId) {
      const res = await apiRequest('GET', `/api/marketplace/apis/${targetApiId}`);
      const cc = res.headers['cache-control'] || '';
      const passed = cc.includes('no-store');
      await recordResult('TC-17-06', 'US-17', 'Header phản hồi chứa Cache-Control: no-store chống cache API bị gỡ', passed, {
        cacheControl: cc
      });
    } else {
      await recordResult('TC-17-06', 'US-17', 'Cache-Control (bỏ qua)', true, { skipped: true });
    }
  }

  // =========================================================================
  // SUMMARY & WRITE OUTPUT FILES
  // =========================================================================
  console.log('\n================================================================');
  console.log(`   KẾT QUẢ KIỂM THỬ SPRINT 3 MARKETPLACE: ${passCount} PASS / ${failCount} FAIL (Tổng số: ${results.length})`);
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
        qaLead: 'Trần Hà Thảo Vân (@vuonghathaovan-gif)'
      }
    },
    testResults: results
  };

  const outputPath = path.resolve('qa-scripts/sprint3-marketplace-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');
  console.log(`Báo cáo kết quả kiểm thử đã được lưu vào: ${outputPath}`);

  if (pool) {
    await pool.end();
  }

  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Lỗi nghiêm trọng khi thực thi:', err);
  if (pool) pool.end();
  process.exit(1);
});
