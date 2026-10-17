/**
 * lib/reporter.js
 * Thu thập kết quả kiểm thử, ghi ra:
 *   - qa-scripts/ketqua-sprint1.md  (bảng Markdown)
 *   - qa-scripts/log-tho.txt        (response/log thô đầy đủ)
 * In tổng kết ra Terminal khi gọi writeFiles().
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..'); // thư mục qa-scripts/

const MD_FILE  = join(ROOT, 'ketqua-sprint1.md');
const LOG_FILE = join(ROOT, 'log-tho.txt');

// ── Kho lưu kết quả ──────────────────────────────────────────────
const results = [];
const rawLogs = [];

/**
 * Thêm một kết quả TC.
 * @param {object} r
 * @param {string} r.tc              - mã TC, vd 'TC-01-01'
 * @param {string} r.desc            - mô tả ngắn
 * @param {string} r.expected        - kết quả mong đợi
 * @param {number|null} r.statusCode - HTTP status thực tế
 * @param {string} r.responseSnippet - response rút gọn (120 ký tự)
 * @param {'Pass'|'Fail'|'Lỗi script'|'Chưa chạy (Cần Manual)'} r.verdict
 * @param {number|null} r.durationMs
 * @param {string|null} r.manualCmd  - lệnh cần chạy tay (nếu có)
 * @param {any}    r.rawResponse     - response đầy đủ để ghi vào log thô
 */
export function addResult({
  tc,
  desc,
  expected,
  statusCode  = null,
  responseSnippet = '—',
  verdict,
  durationMs  = null,
  manualCmd   = null,
  rawResponse = null,
}) {
  results.push({ tc, desc, expected, statusCode, responseSnippet, verdict, durationMs, manualCmd });

  // Ghi vào mảng log thô
  const sep = '='.repeat(60);
  const entry = [
    `\n${sep}`,
    `[${tc}] ${desc}`,
    `Verdict   : ${verdict}`,
    `Status    : ${statusCode ?? 'N/A'}`,
    `Duration  : ${durationMs != null ? durationMs + 'ms' : '—'}`,
    `Response  :\n${JSON.stringify(rawResponse, null, 2)}`,
    manualCmd ? `ManualCmd : ${manualCmd}` : null,
    sep,
  ]
    .filter(Boolean)
    .join('\n');

  rawLogs.push(entry);

  // In tiến trình ra terminal ngay lập tức
  const icon = verdict === 'Pass' ? '✅' : verdict === 'Fail' ? '❌' : verdict === 'Lỗi script' ? '⚠️ ' : '🔲';
  console.log(`  ${icon} [${tc}] ${verdict.padEnd(24)} | ${desc}`);
}

/**
 * Ghi tất cả kết quả ra file MD + log thô, in tổng kết ra terminal.
 */
export function writeFiles() {
  const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  // ── Đếm tổng kết ──────────────────────────────────────────────
  const counts = { Pass: 0, Fail: 0, 'Lỗi script': 0, 'Chưa chạy (Cần Manual)': 0 };
  for (const r of results) {
    if (r.verdict in counts) counts[r.verdict]++;
  }

  // ── Tạo nội dung Markdown ──────────────────────────────────────
  const esc = (s) => String(s ?? '—').replace(/\|/g, '\\|').replace(/\n/g, ' ');

  let md = `# Kết quả kiểm thử Sprint 1\n\n`;
  md += `**Thời gian chạy:** ${now}  \n`;
  md += `**Backend:** http://127.0.0.1:3000  \n`;
  md += `**Người thực hiện:** Trần Hà Thảo Vân (@vuonghathaovan-gif)  \n`;
  md += `**Refs:** #5\n\n`;
  md += `---\n\n`;
  md += `## Kết quả chi tiết\n\n`;
  md += `| TC | Mô tả | Kết quả mong đợi | Status thực tế | Response rút gọn | Verdict | Thời gian |\n`;
  md += `|---|---|---|---|---|---|---|\n`;

  for (const r of results) {
    const dur   = r.durationMs != null ? `${r.durationMs}ms` : '—';
    const st    = r.statusCode != null ? String(r.statusCode) : '—';
    const snip  = esc(r.responseSnippet);
    const vIcon = { Pass: '✅ Pass', Fail: '❌ Fail', 'Lỗi script': '⚠️ Lỗi script', 'Chưa chạy (Cần Manual)': '🔲 Manual' }[r.verdict] ?? r.verdict;
    md += `| ${r.tc} | ${esc(r.desc)} | ${esc(r.expected)} | ${st} | ${snip} | **${vIcon}** | ${dur} |\n`;
  }

  // Phần lệnh manual riêng để dễ đọc
  const manuals = results.filter((r) => r.manualCmd);
  if (manuals.length) {
    md += `\n---\n\n## Lệnh cần chạy tay (Chưa chạy — Cần Manual)\n\n`;
    for (const r of manuals) {
      md += `### ${r.tc} — ${r.desc}\n\n\`\`\`bash\n${r.manualCmd}\n\`\`\`\n\n`;
    }
  }

  // Tổng kết
  md += `---\n\n## Tổng kết\n\n`;
  md += `| Kết quả | Số lượng |\n|---|---|\n`;
  md += `| ✅ Pass | **${counts['Pass']}** |\n`;
  md += `| ❌ Fail | **${counts['Fail']}** |\n`;
  md += `| ⚠️ Lỗi script | **${counts['Lỗi script']}** |\n`;
  md += `| 🔲 Chưa chạy (Cần Manual) | **${counts['Chưa chạy (Cần Manual)']}** |\n`;
  md += `| **Tổng** | **${results.length}** |\n`;

  writeFileSync(MD_FILE, md, 'utf8');

  // ── Ghi log thô ───────────────────────────────────────────────
  const header = `LOG THÔ — Sprint 1 QA\nThời gian: ${now}\nBackend: http://127.0.0.1:3000\n${'='.repeat(60)}\n`;
  writeFileSync(LOG_FILE, header + rawLogs.join('\n'), 'utf8');

  // ── In tổng kết terminal ──────────────────────────────────────
  const bar = '='.repeat(52);
  console.log('\n' + bar);
  console.log('  📊 TỔNG KẾT KIỂM THỬ SPRINT 1');
  console.log(bar);
  console.log(`  ✅ Pass               : ${counts['Pass']}`);
  console.log(`  ❌ Fail               : ${counts['Fail']}`);
  console.log(`  ⚠️  Lỗi script        : ${counts['Lỗi script']}`);
  console.log(`  🔲 Chưa chạy Manual  : ${counts['Chưa chạy (Cần Manual)']}`);
  console.log(`  📝 Tổng              : ${results.length}`);
  console.log(bar);
  console.log(`  📄 Kết quả MD  : qa-scripts/ketqua-sprint1.md`);
  console.log(`  📋 Log thô     : qa-scripts/log-tho.txt`);
  console.log(bar + '\n');

  if (manuals.length) {
    console.log('🔲 CÁC LỆNH CẦN CHẠY TAY:\n');
    for (const r of manuals) {
      console.log(`  ▶ [${r.tc}] ${r.desc}`);
      console.log(`    ${r.manualCmd}\n`);
    }
  }
}

