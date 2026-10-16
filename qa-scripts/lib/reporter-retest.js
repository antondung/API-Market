/**
 * lib/reporter-retest.js
 * Thu thập kết quả kiểm thử retest Sprint 1.
 * Ghi ra:
 *   - qa-scripts/ketqua-retest.md
 *   - qa-scripts/log-tho-retest.txt
 * Mask toàn bộ password, token, JWT trước khi ghi log.
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const MD_FILE  = join(ROOT, 'ketqua-retest.md');
const LOG_FILE = join(ROOT, 'log-tho-retest.txt');

export function maskSecrets(obj) {
  if (obj == null) return obj;
  try {
    let str = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
    // Mask password
    str = str.replace(/"password":\s*"[^"]+"/g, '"password": "***"');
    str = str.replace(/"password_hash":\s*"[^"]+"/g, '"password_hash": "***"');
    // Mask access / refresh token (JWT or alphanumeric token)
    str = str.replace(/"accessToken":\s*"[^"]+"/g, '"accessToken": "***"');
    str = str.replace(/"refreshToken":\s*"[^"]+"/g, '"refreshToken": "***"');
    str = str.replace(/Bearer\s+[A-Za-z0-9-_.]+/gi, 'Bearer ***');
    str = str.replace(/eyJ[A-Za-z0-9-_.]+/g, '***');
    return typeof obj === 'string' ? str : JSON.parse(str);
  } catch {
    return String(obj).replace(/eyJ[A-Za-z0-9-_.]+/g, '***');
  }
}

const results = [];
const rawLogs = [];

export function addResult({
  tc,
  desc,
  expected,
  statusCode = null,
  responseSnippet = '—',
  verdict,
  durationMs = null,
  manualCmd = null,
  rawResponse = null,
}) {
  const maskedSnippet = typeof responseSnippet === 'string'
    ? maskSecrets(responseSnippet)
    : JSON.stringify(maskSecrets(responseSnippet));

  const cleanSnippet = (maskedSnippet.length > 130) ? maskedSnippet.slice(0, 127) + '...' : maskedSnippet;

  const maskedRaw = maskSecrets(rawResponse);
  const timeStr = new Date().toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  results.push({
    tc,
    desc,
    expected,
    statusCode,
    responseSnippet: cleanSnippet,
    verdict,
    durationMs,
    manualCmd,
    timeStr
  });

  const sep = '='.repeat(60);
  const entry = [
    `\n${sep}`,
    `[${tc}] ${desc}`,
    `Giờ chạy  : ${timeStr}`,
    `Verdict   : ${verdict}`,
    `Status    : ${statusCode ?? 'N/A'}`,
    `Duration  : ${durationMs != null ? durationMs + 'ms' : '—'}`,
    `Response  :\n${typeof maskedRaw === 'string' ? maskedRaw : JSON.stringify(maskedRaw, null, 2)}`,
    manualCmd ? `ManualCmd : ${manualCmd}` : null,
    sep,
  ].filter(Boolean).join('\n');

  rawLogs.push(entry);

  const icon = verdict === 'Pass' ? '✅' : verdict === 'Fail' ? '❌' : verdict === 'Lỗi script' ? '⚠️ ' : '🔲';
  console.log(`  ${icon} [${tc}] ${verdict.padEnd(24)} | ${desc}`);
}

export function writeFiles() {
  const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  const counts = { Pass: 0, Fail: 0, 'Lỗi script': 0, 'Not Run': 0 };
  for (const r of results) {
    if (r.verdict in counts) counts[r.verdict]++;
    else counts[r.verdict] = (counts[r.verdict] || 0) + 1;
  }

  const esc = (s) => String(s ?? '—').replace(/\|/g, '\\|').replace(/\n/g, ' ');

  let md = `# Kết quả kiểm thử lại Sprint 1 (Retest)\n\n`;
  md += `**Thời gian chạy:** ${now}  \n`;
  md += `**Môi trường Backend:** commit 81cc803 tại http://127.0.0.1:3000  \n`;
  md += `**Tester:** Trần Hà Thảo Vân (@vuonghathaovan-gif)  \n`;
  md += `**Refs:** #5\n\n`;
  md += `---\n\n`;
  md += `## Bảng kết quả 28 TC API\n\n`;
  md += `| TC | Mô tả | Kỳ vọng | Status thực tế | Response rút gọn (che secret) | Verdict | Thời gian | Giờ chạy |\n`;
  md += `|---|---|---|---|---|---|---|---|\n`;

  for (const r of results) {
    const dur = r.durationMs != null ? `${r.durationMs}ms` : '—';
    const st = r.statusCode != null ? String(r.statusCode) : '—';
    const snip = esc(r.responseSnippet);
    const vIcon = r.verdict === 'Pass' ? '✅ Pass' : r.verdict === 'Fail' ? '❌ Fail' : r.verdict === 'Lỗi script' ? '⚠️ Lỗi script' : `🔲 ${r.verdict}`;
    md += `| ${r.tc} | ${esc(r.desc)} | ${esc(r.expected)} | ${st} | ${snip} | **${vIcon}** | ${dur} | ${r.timeStr} |\n`;
  }

  md += `\n---\n\n## Tổng kết 28 TC API\n\n`;
  md += `| Kết quả | Số lượng |\n|---|---|\n`;
  md += `| ✅ Pass | **${counts['Pass'] || 0}** |\n`;
  md += `| ❌ Fail | **${counts['Fail'] || 0}** |\n`;
  md += `| ⚠️ Lỗi script | **${counts['Lỗi script'] || 0}** |\n`;
  md += `| 🔲 Not Run | **${counts['Not Run'] || 0}** |\n`;
  md += `| **Tổng** | **${results.length}** |\n`;

  writeFileSync(MD_FILE, md, 'utf8');

  const header = `LOG THÔ RETEST SPRINT 1\nThời gian: ${now}\nBackend: http://127.0.0.1:3000 (commit 81cc803)\n${'='.repeat(60)}\n`;
  writeFileSync(LOG_FILE, header + rawLogs.join('\n'), 'utf8');

  console.log('\n' + '='.repeat(52));
  console.log('  📊 TỔNG KẾT RETEST SPRINT 1 (28 TC API)');
  console.log('='.repeat(52));
  console.log(`  ✅ Pass         : ${counts['Pass'] || 0}`);
  console.log(`  ❌ Fail         : ${counts['Fail'] || 0}`);
  console.log(`  ⚠️  Lỗi script  : ${counts['Lỗi script'] || 0}`);
  console.log(`  🔲 Not Run     : ${counts['Not Run'] || 0}`);
  console.log(`  📝 Tổng        : ${results.length}`);
  console.log('='.repeat(52));
  console.log(`  📄 Kết quả MD   : qa-scripts/ketqua-retest.md`);
  console.log(`  📋 Log thô      : qa-scripts/log-tho-retest.txt\n`);
}

export function getResults() {
  return results;
}

