/**
 * lib/api.js
 * Helper gọi HTTP đến backend dev (http://127.0.0.1:3000).
 * Không throw lỗi axios — trả về object có status, data, durationMs
 * để các TC tự xử lý mọi status code.
 */

import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:3000';

/**
 * Gọi một HTTP request.
 * @param {object} opts
 * @param {'GET'|'POST'} opts.method
 * @param {string}       opts.path     - đường dẫn, ví dụ '/api/auth/login'
 * @param {object|null}  opts.body     - request body (JSON)
 * @param {string|null}  opts.token    - access token (sẽ thêm vào header Authorization: Bearer ...)
 * @param {object}       opts.headers  - header bổ sung
 * @param {number}       opts.timeoutMs
 * @returns {{ status: number|null, data: any, durationMs: number }}
 */
export async function call({
  method,
  path,
  body = null,
  token = null,
  headers = {},
  timeoutMs = 10_000,
}) {
  const t0 = Date.now();

  const reqHeaders = { 'Content-Type': 'application/json', ...headers };
  if (token) reqHeaders['Authorization'] = `Bearer ${token}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await axios({
        method,
        url: BASE_URL + path,
        data: body ?? undefined,
        headers: reqHeaders,
        validateStatus: () => true, // không throw với bất kỳ HTTP status nào
        timeout: timeoutMs,
      });
      return {
        status: res.status,
        data: res.data,
        durationMs: Date.now() - t0,
      };
    } catch (err) {
      if (attempt === 0 && (err.code === 'ECONNRESET' || err.message?.includes('ECONNRESET'))) {
        await new Promise(r => setTimeout(r, 600));
        continue;
      }
      // Lỗi mạng (ECONNREFUSED, timeout...) — không phải lỗi từ backend
      return {
        status: null,
        data: { _networkError: err.message },
        durationMs: Date.now() - t0,
      };
    }
  }
}

/**
 * Rút gọn response để hiển thị (tối đa 120 ký tự, không lộ secret).
 */
export function snippet(data) {
  if (data == null) return '(empty)';
  try {
    const str = JSON.stringify(data);
    return str.length > 120 ? str.slice(0, 117) + '...' : str;
  } catch {
    return String(data).slice(0, 120);
  }
}

/**
 * Tạo email ngẫu nhiên để tránh trùng khi test đăng ký.
 * Ví dụ: qa-1234567890-abc@test.local
 */
export function uniqueEmail(prefix = 'qa') {
  const ts = Date.now();
  const rnd = Math.random().toString(36).slice(2, 5);
  return `${prefix}-${ts}-${rnd}@test.local`;
}

/**
 * Tạo string độ dài n ký tự để test boundary mật khẩu.
 */
export function repeatChar(char, n) {
  return char.repeat(n);
}

