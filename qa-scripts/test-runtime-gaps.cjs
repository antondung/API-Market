/**
 * qa-scripts/test-runtime-gaps.cjs
 * Bổ sung bằng chứng thực nghiệm thời gian chạy (Runtime Evidence) cho Sprint 4:
 *   1. [TC-GW-05]: Phòng chống SQL Injection trên header X-API-Key qua giao thức HTTP thật (kết quả phải 401, không 500).
 *   2. [TC-RED-01]: Quét to_jsonb(u)::text trên usage_logs, audit_logs và usage_outbox tìm raw key và tiền tố ak_live_ (phải bằng 0 dòng).
 *   3. [TC-OVH-05]: Thực thi benchmark gateway trực tiếp, parse phân vị P95 thật và assert P95 < 30ms.
 *
 * Tiêu chuẩn: Đọc biến môi trường an toàn, tự động dọn dẹp fixture trong khối finally.
 */

const { Pool } = require('pg');
const http = require('http');
const crypto = require('crypto');
const assert = require('assert');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Đọc cấu hình từ .env nếu biến môi trường chưa nạp sẵn
function loadEnvIfPresent() {
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim();
      }
    }
  }
}

loadEnvIfPresent();

async function main() {
  console.log('='.repeat(80));
  console.log('KIỂM THỬ THỰC THI BỔ SUNG BẰNG CHỨNG RUNTIME SPRINT 4 (GW-05, RED-01, OVH-05)');
  console.log('QA Lead: Tran Ha Thao Van (@vuonghathaovan-gif)');
  console.log('='.repeat(80));

  const dbUrl = process.env.DATABASE_URL || process.env.PG_TEST_URL;
  if (!dbUrl) {
    throw new Error('Thiếu biến môi trường DATABASE_URL (hoặc PG_TEST_URL) để kết nối cơ sở dữ liệu kiểm thử.');
  }
  const redisUrl = process.env.REDIS_TEST_URL || process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  const pool = new Pool({ connectionString: dbUrl });
  let server = null;
  let createdConsumerId = null;
  let createdKeyId = null;
  let gw04UserId = null;
  let gw04KeyId = null;

  try {
    // -------------------------------------------------------------------------
    // 1. KIỂM THỬ THỰC THI GW-05: SQL INJECTION TRÊN HEADER X-API-KEY QUA HTTP
    // -------------------------------------------------------------------------
    console.log('\n--- BƯỚC 1: KIỂM THỬ RUNTIME TC-GW-05 (SQL Injection Defense) ---');

    // Dynamic import modules từ dist
    const { ApiKeyService } = await import('../dist/src/consumer-service.js');
    const { GatewayService } = await import('../dist/src/gateway-service.js');
    const { createApp } = await import('../dist/src/app.js');

    const keyService = new ApiKeyService(pool);
    const gwService = new GatewayService(pool, keyService);
    const app = createApp({}, () => {}, { gateway: gwService });

    server = http.createServer(app);
    await new Promise((resolve, reject) => {
      server.listen(0, '127.0.0.1', resolve);
      server.on('error', reject);
    });
    const port = server.address().port;
    console.log(`[GW-05] Gateway test server đang lắng nghe tại cổng tạm: ${port}`);

    // Bắn request 1: Payload SQL Injection có tiền tố ak_live_
    const sqliPayload1 = "ak_live_' OR '1'='1'--";
    const res1 = await fetch(`http://127.0.0.1:${port}/api/gateway/1/weather/current`, {
      method: 'GET',
      headers: { 'x-api-key': sqliPayload1 }
    });
    console.log(`[GW-05] Test 1: Header 'x-api-key: ${sqliPayload1}' -> HTTP Status: ${res1.status}`);
    assert.strictEqual(res1.status, 401, 'Request SQL Injection phải bị từ chối với HTTP 401 Unauthorized');
    assert.notStrictEqual(res1.status, 500, 'Tuyệt đối không được trả về lỗi HTTP 500 Internal Server Error (lỗi cú pháp SQL)');

    // Bắn request 2: Payload SQL Injection thuần túy không có tiền tố
    const sqliPayload2 = "' OR '1'='1'--";
    const res2 = await fetch(`http://127.0.0.1:${port}/api/gateway/1/weather/current`, {
      method: 'GET',
      headers: { 'x-api-key': sqliPayload2 }
    });
    console.log(`[GW-05] Test 2: Header 'x-api-key: ${sqliPayload2}' -> HTTP Status: ${res2.status}`);
    assert.strictEqual(res2.status, 401, 'Request SQL Injection không tiền tố phải bị từ chối với HTTP 401');
    console.log('✅ [TC-GW-05] PASS: Gateway ngăn chặn SQL Injection an toàn qua HTTP thật, bảo đảm an ninh cơ sở dữ liệu.');

    // -------------------------------------------------------------------------
    // 2. KIỂM THỬ THỰC THI RED-01: QUÉT JSON TO_JSONB KHÔNG LỘ RAW API KEY
    // -------------------------------------------------------------------------
    console.log('\n--- BƯỚC 2: KIỂM THỬ RUNTIME TC-RED-01 (No Raw Key in DB Logs) ---');

    // Tạo fixture user và key thật
    const knownSecretToken = 'known_secret_token_' + crypto.randomBytes(8).toString('hex');
    const fullRawKey = 'ak_live_' + knownSecretToken;
    const keyHash = crypto.createHash('sha256').update(fullRawKey).digest('hex');

    const userRes = await pool.query(
      `INSERT INTO users(name, email, password_hash, role_id)
       VALUES('QA Redaction User', $1, 'hashed_pw', (SELECT id FROM roles WHERE name='USER'))
       RETURNING id`,
      [`qa-redaction-${Date.now()}@test.local`]
    );
    createdConsumerId = userRes.rows[0].id;

    // Lấy 1 API hợp lệ
    const apiRes = await pool.query(`SELECT id FROM apis WHERE status='Published' LIMIT 1`);
    const apiId = apiRes.rows.length > 0 ? apiRes.rows[0].id : 1;

    const keyRes = await pool.query(
      `INSERT INTO api_keys(user_id, api_id, key_prefix, key_hash, label, is_active)
       VALUES($1, $2, $3, $4, 'QA Redaction Key', true)
       RETURNING id`,
      [createdConsumerId, apiId, fullRawKey.slice(0, 16), keyHash]
    );
    createdKeyId = keyRes.rows[0].id;

    // Ghi nhận 1 bản ghi usage log giả định (is_sandbox = true)
    const now = new Date();
    const reqId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO usage_logs(occurred_at, request_id, consumer_id, api_id, api_key_id, status_code, latency_ms, upstream_latency_ms, gateway_overhead_ms, is_sandbox)
       VALUES($1, $2, $3, $4, $5, 200, 15, 10, 5, true)`,
      [now, reqId, createdConsumerId, apiId, createdKeyId]
    );

    // Quét to_jsonb(u)::text trên usage_logs tìm fullRawKey và tiền tố ak_live_
    const usageCheck = await pool.query(
      `SELECT COUNT(*)::int AS cnt FROM usage_logs u
       WHERE to_jsonb(u)::text LIKE $1 OR to_jsonb(u)::text LIKE $2`,
      [`%${fullRawKey}%`, '%ak_live_%']
    );
    console.log(`[RED-01] Số bản ghi usage_logs rò rỉ raw key hoặc tiền tố ak_live_: ${usageCheck.rows[0].cnt}`);
    assert.strictEqual(usageCheck.rows[0].cnt, 0, 'usage_logs không được chứa bất kỳ chuỗi raw key hay ak_live_ nào');

    // Quét to_jsonb(a)::text trên audit_logs
    const auditCheck = await pool.query(
      `SELECT COUNT(*)::int AS cnt FROM audit_logs a
       WHERE to_jsonb(a)::text LIKE $1 OR to_jsonb(a)::text LIKE $2`,
      [`%${fullRawKey}%`, '%ak_live_%']
    );
    console.log(`[RED-01] Số bản ghi audit_logs rò rỉ raw key hoặc tiền tố ak_live_: ${auditCheck.rows[0].cnt}`);
    assert.strictEqual(auditCheck.rows[0].cnt, 0, 'audit_logs không được chứa bất kỳ chuỗi raw key hay ak_live_ nào');

    // Kiểm tra bảng usage_outbox nếu tồn tại
    const outboxTable = await pool.query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'usage_outbox') AS exists`
    );
    if (outboxTable.rows[0].exists) {
      const outboxCheck = await pool.query(
        `SELECT COUNT(*)::int AS cnt FROM usage_outbox o
         WHERE to_jsonb(o)::text LIKE $1 OR to_jsonb(o)::text LIKE $2`,
        [`%${fullRawKey}%`, '%ak_live_%']
      );
      console.log(`[RED-01] Số bản ghi usage_outbox rò rỉ raw key hoặc ak_live_: ${outboxCheck.rows[0].cnt}`);
      assert.strictEqual(outboxCheck.rows[0].cnt, 0, 'usage_outbox không được chứa raw key');
    }
    console.log('✅ [TC-RED-01] PASS: Kiểm toán to_jsonb(u)::text ghi nhận 0 dòng rò rỉ credential trên toàn bộ bảng nhật ký.');

    // -------------------------------------------------------------------------
    // 3. KIỂM THỬ THỰC THI OVH-05: CHẠY BENCHMARK GATEWAY VÀ PARSE P95 THỰC TẾ
    // -------------------------------------------------------------------------
    console.log('\n--- BƯỚC 3: KIỂM THỬ RUNTIME TC-OVH-05 (SLA Benchmark P95) ---');
    console.log('[OVH-05] Đang kích hoạt lệnh đo tải: npm run benchmark:gateway...');

    const benchmarkOutput = execSync('node scripts/run-tests.mjs --benchmark', {
      env: { ...process.env, PG_TEST_URL: dbUrl, REDIS_TEST_URL: redisUrl },
      encoding: 'utf8'
    });

    const jsonMatch = benchmarkOutput.match(/\{[\s\S]*"benchmark"[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`Không thể trích xuất JSON kết quả từ output benchmark: ${benchmarkOutput}`);
    }
    const benchData = JSON.parse(jsonMatch[0]);
    console.log('[OVH-05] Dữ liệu benchmark thu được:');
    console.log(`   - Số mẫu (samples): ${benchData.samples}`);
    console.log(`   - Concurrency: ${benchData.concurrency}`);
    console.log(`   - Warmup: ${benchData.warmup}`);
    console.log(`   - Stored P50: ${benchData.storedP50Ms} ms | Stored P95: ${benchData.storedP95Ms} ms`);
    console.log(`   - Application P50: ${benchData.applicationP50Ms} ms | Application P95: ${benchData.applicationP95Ms} ms`);
    console.log(`   - Max: ${benchData.maxMs} ms`);
    console.log(`   - Phạm vi đo: "${benchData.scope}"`);

    assert(benchData.storedP95Ms < 30, `Stored P95 (${benchData.storedP95Ms} ms) phải nhỏ hơn SLA 30ms`);
    assert(benchData.applicationP95Ms < 30, `Application P95 (${benchData.applicationP95Ms} ms) phải nhỏ hơn SLA 30ms`);
    console.log(`✅ [TC-OVH-05] PASS: P95 thực tế = ${benchData.applicationP95Ms} ms (< 30ms SLA), mẫu=${benchData.samples}, concurrency=${benchData.concurrency}.`);

    // -------------------------------------------------------------------------
    // 4. KIỂM THỬ THỰC THI GW-04: KEY HỢP LỆ CỦA API A GỌI SANG API B (SCOPE MISMATCH)
    // -------------------------------------------------------------------------
    console.log('\n--- BƯỚC 4: KIỂM THỬ RUNTIME TC-GW-04 (Scope Mismatch: Key API A -> Route API B) ---');
    const apisRes = await pool.query("SELECT id FROM apis WHERE status='Published' ORDER BY id LIMIT 2");
    if (apisRes.rows.length < 2) {
      throw new Error('Cần ít nhất 2 API Published để kiểm tra vi phạm phạm vi (Scope Mismatch)');
    }
    const apiA = apisRes.rows[0].id;
    const apiB = apisRes.rows[1].id;

    // Tìm endpoint của API B
    const epBRes = await pool.query("SELECT method, path FROM api_endpoints WHERE api_id=$1 LIMIT 1", [apiB]);
    const routeB = epBRes.rows[0]?.path?.replace(/\{[^}]+\}/g, 'test') || '/';

    // Tạo user và key gắn với API A
    const userScopeRes = await pool.query(
      `INSERT INTO users(name, email, password_hash, role_id)
       VALUES('GW-04 Scope User', $1, 'hashed_pw', (SELECT id FROM roles WHERE name='USER'))
       RETURNING id`,
      [`gw04-scope-${Date.now()}@test.local`]
    );
    gw04UserId = userScopeRes.rows[0].id;

    const rawKeyScopeA = 'ak_live_' + crypto.randomBytes(32).toString('base64url').slice(0, 43);
    const keyHashScopeA = crypto.createHash('sha256').update(rawKeyScopeA).digest('hex');

    const keyScopeRes = await pool.query(
      `INSERT INTO api_keys(user_id, api_id, key_prefix, key_hash, label, is_active)
       VALUES($1, $2, $3, $4, 'Key for API A', true)
       RETURNING id`,
      [gw04UserId, apiA, rawKeyScopeA.slice(0, 16), keyHashScopeA]
    );
    gw04KeyId = keyScopeRes.rows[0].id;

    // Gửi request HTTP thật tới server đang listen
    const resScope = await fetch(`http://127.0.0.1:${port}/api/gateway/${apiB}${routeB.startsWith('/') ? routeB : '/' + routeB}`, {
      method: 'GET',
      headers: { 'x-api-key': rawKeyScopeA }
    });
    const scopeBody = await resScope.json();
    console.log(`[GW-04] Gọi API B (id: ${apiB}) với key của API A (id: ${apiA}):`);
    console.log(`   - HTTP Status thật: ${resScope.status}`);
    console.log(`   - Response Body: ${JSON.stringify(scopeBody)}`);
    console.log(`   - Error Code thật: "${scopeBody.error?.code}"`);
    console.log(`   - Đối chiếu AC-S4-06 & TC-GW-04: Kỳ vọng "API_KEY_SCOPE_MISMATCH", Thực tế "${scopeBody.error?.code}"`);

    console.log('\n' + '='.repeat(80));
    console.log('🎉 TOÀN BỘ 4 TEST CASES RUNTIME GAPS (GW-05, RED-01, OVH-05, GW-04) ĐÃ HOÀN TẤT ĐO ĐẠC!');
    console.log('='.repeat(80));
  } finally {
    // Dọn dẹp tài nguyên và dữ liệu test trong PostgreSQL
    if (server) {
      server.close();
    }
    if (createdKeyId) {
      await pool.query(`DELETE FROM usage_logs WHERE api_key_id = $1`, [createdKeyId]);
      await pool.query(`DELETE FROM api_keys WHERE id = $1`, [createdKeyId]);
    }
    if (createdConsumerId) {
      await pool.query(`DELETE FROM users WHERE id = $1`, [createdConsumerId]);
    }
    if (gw04KeyId) {
      await pool.query(`DELETE FROM usage_logs WHERE api_key_id = $1`, [gw04KeyId]);
      await pool.query(`DELETE FROM api_keys WHERE id = $1`, [gw04KeyId]);
    }
    if (gw04UserId) {
      await pool.query(`DELETE FROM users WHERE id = $1`, [gw04UserId]);
    }
    await pool.end();
    console.log('[Cleanup] Đã dọn dẹp sạch sẽ tài nguyên test fixtures và ngắt kết nối cơ sở dữ liệu an toàn.');
  }
}

main().catch(err => {
  console.error('\n❌ RUNTIME GAPS VERIFICATION FAILED:', err.message);
  process.exit(1);
});
