#!/usr/bin/env node
/**
 * SBTI 题库相似度审计
 *
 * 目的：
 *   - WTFTI 站内多个宇宙的题库（标准 / 班 TI / 修仙 / WTFTI 毒舌等）历史上是直接套用 SBTI（标准 SB 人格）题目结构起步的。
 *   - 在推出原创 WTFI 理论 + clean-room 重写题库前，需要先量化"哪些题目跟 SBTI 原题文本相似度过高"，作为法律风险与重写工作量评估的依据。
 *
 * 输入：
 *   - 公开 SBTI 题库（用户在执行前自行准备一份原文 JSON 到 `docs/01-strategy/_audit/sbti-source-questions.json`，
 *     格式：[{ id: number|string, text: string, dimension?: string }, ...]
 *   - 站内题库：自动收集 `src/lib/**\/questions*.ts` 中的字符串字面量
 *
 * 输出：
 *   - `docs/01-strategy/_audit/sbti-overlap-2026-04-18.md`：按相似度从高到低列出的高风险题清单
 *   - 包含字符 trigram Jaccard + 字符串归一化后的最长公共子序列长度比
 *
 * 用法：
 *   node scripts/audit-sbti-question-similarity.mjs [--threshold 0.30]
 *
 * 注意：
 *   - 该脚本只做静态文本相似度，不做语义对比。语义重写仍需人工 review。
 *   - 若 `sbti-source-questions.json` 不存在，会输出空报告并给出准备说明（不会失败）。
 */

import { readFile, writeFile, readdir, stat, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const AUDIT_DIR = path.join(ROOT, 'docs/01-strategy/_audit');
const SOURCE_FILE = path.join(AUDIT_DIR, 'sbti-source-questions.json');
const OUT_FILE = path.join(AUDIT_DIR, 'sbti-overlap-2026-04-18.md');
const SRC_DIR = path.join(ROOT, 'src/lib');

const args = process.argv.slice(2);
const threshold = parseFloat(args[args.indexOf('--threshold') + 1]) || 0.3;

// ── 文本归一化 ─────────────────────────────────────────────────
function normalize(s) {
  return s
    .replace(/\s+/g, '')
    .replace(/[，。！？、；：""''《》（）()\[\]【】~`'"!?.,;:\-—…·]/g, '')
    .toLowerCase();
}

// ── 相似度算法 ─────────────────────────────────────────────────
function trigrams(s) {
  const set = new Set();
  if (s.length < 3) {
    set.add(s);
    return set;
  }
  for (let i = 0; i <= s.length - 3; i++) set.add(s.slice(i, i + 3));
  return set;
}

function jaccard(a, b) {
  if (!a.size && !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

function lcsLen(a, b) {
  const m = a.length;
  const n = b.length;
  if (!m || !n) return 0;
  let prev = new Array(n + 1).fill(0);
  let curr = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      curr[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], curr[j - 1]);
    }
    [prev, curr] = [curr, prev];
    curr.fill(0);
  }
  return prev[n];
}

function combinedScore(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  const j = jaccard(trigrams(na), trigrams(nb));
  const lcs = lcsLen(na, nb);
  const lcsRatio = lcs / Math.max(na.length, nb.length, 1);
  // 综合：trigram 相似 + 最长公共子序列比
  return { score: 0.5 * j + 0.5 * lcsRatio, jaccard: j, lcsRatio };
}

// ── 站内题库收集 ───────────────────────────────────────────────
async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir)) {
    const full = path.join(dir, entry);
    const s = await stat(full);
    if (s.isDirectory()) out.push(...(await walk(full)));
    else if (/questions.*\.ts$/.test(entry) || entry === 'questions.ts') out.push(full);
  }
  return out;
}

// 提取形如 text: '....' 或 text: "...." 的字符串
function extractQuestions(source, file) {
  const items = [];
  const re = /\btext\s*:\s*(['"`])((?:\\.|(?!\1).)*)\1/g;
  let m;
  while ((m = re.exec(source))) {
    const text = m[2].replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, ' ');
    if (text.length >= 4) items.push({ text, file: path.relative(ROOT, file) });
  }
  // 提取 dimension（最近的）
  const dimRe = /\bdimension\s*:\s*['"]([^'"]+)['"]/g;
  // 简单不做精确配对，只返回 text 列表，dimension 由人工 review
  return items;
}

async function collectInternal() {
  const files = await walk(SRC_DIR);
  const all = [];
  for (const f of files) {
    const src = await readFile(f, 'utf8');
    all.push(...extractQuestions(src, f));
  }
  // 去重
  const seen = new Map();
  for (const q of all) {
    const k = normalize(q.text);
    if (!seen.has(k)) seen.set(k, q);
  }
  return [...seen.values()];
}

// ── 主流程 ─────────────────────────────────────────────────────
async function main() {
  await mkdir(AUDIT_DIR, { recursive: true });

  const internal = await collectInternal();
  console.log(`[audit] 站内题目总数（去重后）: ${internal.length}`);

  let source = [];
  if (existsSync(SOURCE_FILE)) {
    source = JSON.parse(await readFile(SOURCE_FILE, 'utf8'));
    console.log(`[audit] SBTI 原题数: ${source.length}`);
  } else {
    console.warn(`[audit] 未找到 ${path.relative(ROOT, SOURCE_FILE)}`);
    console.warn('[audit] 请准备一份 JSON 数组：[{ "id": "1", "text": "..." }, ...] 后重跑。');
  }

  const findings = [];
  if (source.length) {
    for (const q of internal) {
      let best = { score: 0 };
      for (const s of source) {
        const r = combinedScore(q.text, s.text);
        if (r.score > best.score) best = { ...r, sbti: s };
      }
      if (best.score >= threshold) {
        findings.push({ ...q, ...best });
      }
    }
    findings.sort((a, b) => b.score - a.score);
  }

  // 输出报告
  const md = renderReport({ internal, source, findings, threshold });
  await writeFile(OUT_FILE, md, 'utf8');
  console.log(`[audit] 写入 ${path.relative(ROOT, OUT_FILE)}`);
  console.log(`[audit] 高风险题（score ≥ ${threshold}）: ${findings.length}`);
}

function renderReport({ internal, source, findings, threshold }) {
  const lines = [];
  lines.push('# SBTI 题库相似度审计报告');
  lines.push('');
  lines.push(`- 生成时间: ${new Date().toISOString()}`);
  lines.push(`- 阈值: \`score ≥ ${threshold}\` (0.5 × trigram Jaccard + 0.5 × 归一化 LCS 比)`);
  lines.push(`- 站内题目（去重后）: **${internal.length}**`);
  lines.push(`- SBTI 原题: **${source.length}**`);
  lines.push(`- 高风险匹配: **${findings.length}**`);
  lines.push('');
  if (!source.length) {
    lines.push('> ⚠️ 未提供 SBTI 原题样本。请在 `docs/01-strategy/_audit/sbti-source-questions.json` 放入一份 JSON 数组后重跑：');
    lines.push('>');
    lines.push('> ```json');
    lines.push('> [');
    lines.push('>   { "id": "S1-1", "text": "我不够好，周围的人都比我优秀。" },');
    lines.push('>   { "id": "S1-2", "text": "..." }');
    lines.push('> ]');
    lines.push('> ```');
    return lines.join('\n');
  }
  if (!findings.length) {
    lines.push('✅ 无高风险匹配。');
    return lines.join('\n');
  }
  lines.push('## 高风险清单（按相似度倒序）');
  lines.push('');
  lines.push('| # | Score | Jaccard | LCS Ratio | 站内题 | SBTI 原题 | 文件 |');
  lines.push('|---|-------|---------|-----------|--------|-----------|------|');
  findings.forEach((f, i) => {
    const internal = f.text.replace(/\|/g, '\\|');
    const sbti = f.sbti.text.replace(/\|/g, '\\|');
    lines.push(
      `| ${i + 1} | ${f.score.toFixed(2)} | ${f.jaccard.toFixed(2)} | ${f.lcsRatio.toFixed(2)} | ${internal} | ${sbti} | \`${f.file}\` |`,
    );
  });
  lines.push('');
  lines.push('## 处置建议');
  lines.push('');
  lines.push('- **score ≥ 0.6**：必须立即 clean-room 重写（高侵权风险）');
  lines.push('- **0.4 ≤ score < 0.6**：W2 主重写批次');
  lines.push('- **0.3 ≤ score < 0.4**：可保留语义、改为场景投射式题型即可消除文本相似');
  return lines.join('\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
