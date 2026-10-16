#!/usr/bin/env node
/**
 * scripts/hermosa-cluster.mjs
 *
 * Sprint 3 内部工具：跑一周 Her Voice 数据的本地聚类 + 偏见自查 + 编辑总结草稿。
 * 不调用任何 LLM；只是规则化地给编辑提供"草稿"。
 *
 * 用法：
 *   node scripts/hermosa-cluster.mjs --week 2026-W19 [--pool consented|selected|published]
 *
 * 默认 pool=consented：所有已发布、未屏蔽、且 consent_to_feature=true 的条目。
 *
 * 输出：
 *   docs/02-modules/her-voice/curation-drafts/{week}.md  （markdown 草稿）
 *   docs/02-modules/her-voice/curation-drafts/{week}.json （结构化数据）
 *
 * 数据源：Supabase PostgREST，使用 .env.local 中的 service role key。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

// ─────────────────────────────────────────────────────────────
// 复制自 src/lib/hermosa/curation.ts 的最小子集
// （脚本运行在 node 环境下，避免引入 ts-node 依赖）
// ─────────────────────────────────────────────────────────────

const CLUSTERS = [
  { key: 'choice', label: '选择权 / 拒绝练习', keywords: ['选择', '拒绝', '说不', 'no', '边界', '取悦', '讨好'] },
  { key: 'work', label: '职场 / 收入 / 自雇', keywords: ['老板', 'offer', '职场', '同事', '会议', '薪', '加班', '离职', '辞职'] },
  { key: 'family', label: '原生家庭 / 父母', keywords: ['妈', '爸', '父母', '家人', '亲戚', '催婚', '催生'] },
  { key: 'intimacy', label: '亲密关系 / 性 / 恋爱', keywords: ['伴侣', '恋人', '前任', '相亲', '约会', '亲密', '床', '吵架', '分手'] },
  { key: 'body', label: '身体 / 医疗 / 生育', keywords: ['月经', '体检', '医生', '生育', '怀孕', '冷冻', '卵子', '产检', '更年'] },
  { key: 'mental', label: '心理 / 自我陪伴', keywords: ['咨询', '抑郁', '焦虑', '崩溃', '哭', '日记', '复盘', '冥想', '正念'] },
  { key: 'finance', label: '金钱 / 财务自主', keywords: ['钱', '预算', '存款', '消费', '账单', '理财', '保险'] },
  { key: 'motherhood', label: '母职 / 育儿', keywords: ['孩子', '宝宝', '育儿', '妈妈', '幼儿园', '作业'] },
  { key: 'ai_tooling', label: 'AI 当助理 / 翻译 / 复盘', keywords: ['翻译', '整理', '助理', '草稿', '邮件', 'prompt', '让 ai', '让 chatgpt', '让 claude'] },
  { key: 'ai_practice', label: 'AI 当陪练 / 角色扮演', keywords: ['模拟', '扮演', '陪练', '练习', '角色'] },
  { key: 'safety_voice', label: '愤怒 / 边界 / 反 PUA', keywords: ['愤怒', 'pua', '羞辱', '被骂', '被训', '情绪化', '装坚强'] },
  { key: 'solidarity', label: '我也是 / 不是孤例', keywords: ['我也', '不是一个人', '不止我', '原来不是'] },
];

const FALLBACK = { key: 'other', label: '其它 / 待人工分组' };

const BIAS_RULES = [
  { id: 'self_blame', severity: 'warn', message: '出现自责句式，不要再加额外评判语气。', re: /(我太敏感|是不是我有问题|怪自己|都是我的错)/ },
  { id: 'pua_lite', severity: 'warn', message: '疑似 PUA 受害描述，发布前先标"待复核"或脱敏。', re: /(他说我|他骂我|他打我|被孤立|被冷暴力)/ },
  { id: 'medical_advice', severity: 'warn', message: '出现具体药名/剂量，不要直接引用。', re: /(mg|毫克|剂量|抗抑郁药|开药|处方)/i },
  { id: 'ai_hype', severity: 'info', message: 'AI 神化措辞，不要进对外标题位。', re: /(ai\s*救|ai\s*治好|没有 ai 我活不下|ai是神)/i },
  { id: 'gender_essentialism', severity: 'warn', message: '出现本质化句式，不适合放进对外标题。', re: /(女人就是|女生就是|男人就是|男性就是)/ },
  { id: 'minor_safety', severity: 'block', message: '提到未成年人，发布前必须脱敏。', re: /(未成年|小孩.*受伤|孩子.*打|学校.*欺)/ },
  { id: 'private_handle', severity: 'block', message: '出现联系方式，必须屏蔽。', re: /(微信号|wxid_|加我|t\.me\/|\b1[3-9]\d{9}\b)/i },
];

function rowText(r) {
  const md = r.metadata || {};
  const parts = [r.text];
  if (r.kind === 'book') {
    if (md.book_title) parts.push(md.book_title);
    if (md.book_quote) parts.push(md.book_quote);
    if (md.book_note) parts.push(md.book_note);
  } else if (r.kind === 'ai_question') {
    if (md.ai_question) parts.push(md.ai_question);
    if (md.ai_context) parts.push(md.ai_context);
  }
  return parts.join(' ').toLowerCase();
}

function pickCluster(r) {
  const t = rowText(r);
  for (const c of CLUSTERS) {
    for (const kw of c.keywords) {
      if (t.includes(kw)) return c;
    }
  }
  return FALLBACK;
}

function clusterRows(rows) {
  const buckets = new Map();
  for (const r of rows) {
    const c = pickCluster(r);
    let b = buckets.get(c.key);
    if (!b) {
      b = { key: c.key, label: c.label, rows: [], totalEcho: 0, byKind: { voice: 0, book: 0, ai_question: 0 } };
      buckets.set(c.key, b);
    }
    b.rows.push(r);
    b.totalEcho += r.echo_count || 0;
    if (r.kind in b.byKind) b.byKind[r.kind] += 1;
  }
  return Array.from(buckets.values())
    .map((b) => {
      const sorted = [...b.rows].sort((a, x) => (x.is_featured - a.is_featured) || ((x.echo_count || 0) - (a.echo_count || 0)));
      return { ...b, rows: sorted, representative: sorted[0] || null };
    })
    .sort((a, b) => b.rows.length - a.rows.length || b.totalEcho - a.totalEcho);
}

function biasFindings(rows) {
  const out = [];
  for (const rule of BIAS_RULES) {
    const hits = rows.filter((r) => rule.re.test(rowText(r))).map((r) => ({ id: r.id, text: r.text }));
    if (hits.length) out.push({ rule: rule.id, severity: rule.severity, message: rule.message, hits });
  }
  return out;
}

// ─────────────────────────────────────────────────────────────
// .env.local 读取 + Supabase REST
// ─────────────────────────────────────────────────────────────

function loadEnv() {
  const file = path.join(repoRoot, '.env.local');
  if (!fs.existsSync(file)) return {};
  const env = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i === -1) continue;
    env[line.slice(0, i)] = line.slice(i + 1);
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

async function fetchRows(week, pool) {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.warn('[warn] 未配置 Supabase 环境变量，无法拉数据；输出空草稿。');
    return [];
  }
  const params = new URLSearchParams();
  params.set('select', 'id,kind,text,signature,metadata,topic_week,curation_status,consent_to_feature,echo_count,is_featured,created_at');
  params.set('topic_week', `eq.${week}`);
  params.set('is_published', 'eq.true');
  params.set('flagged', 'eq.false');
  params.set('safety_level', 'neq.blocked');
  if (pool === 'consented' || pool === 'selected' || pool === 'published') {
    params.set('consent_to_feature', 'eq.true');
  }
  if (pool === 'selected') {
    params.set('curation_status', 'in.(selected,published)');
  } else if (pool === 'published') {
    params.set('curation_status', 'eq.published');
  }
  params.set('order', 'is_featured.desc,echo_count.desc,created_at.desc');
  params.set('limit', '200');

  const url = `${SUPABASE_URL}/rest/v1/hermosa_messages?${params}`;
  const res = await fetch(url, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase fetch failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// 主流程
// ─────────────────────────────────────────────────────────────

function parseArgs() {
  const out = { week: null, pool: 'consented' };
  for (let i = 2; i < process.argv.length; i += 1) {
    const a = process.argv[i];
    if (a === '--week') out.week = process.argv[++i];
    else if (a === '--pool') out.pool = process.argv[++i];
  }
  if (!out.week) {
    const now = new Date();
    const utc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const day = utc.getUTCDay() || 7;
    utc.setUTCDate(utc.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
    const wk = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    out.week = `${utc.getUTCFullYear()}-W${String(wk).padStart(2, '0')}`;
  }
  return out;
}

function buildMarkdown(week, pool, rows, clusters, findings) {
  const byKind = { voice: 0, book: 0, ai_question: 0 };
  for (const r of rows) if (r.kind in byKind) byKind[r.kind] += 1;
  const top = clusters.slice(0, 5);
  const topLabel = top[0]?.label ?? '尚未浮现主轴';
  const lines = [];
  lines.push(`# Her Voice · 编辑总结草稿 ${week}`);
  lines.push('');
  lines.push(`> Pool: \`${pool}\`｜样本 ${rows.length} 条（voice ${byKind.voice} / book ${byKind.book} / ai ${byKind.ai_question}）。`);
  lines.push('> 仅作编辑参考，对外发布前必须人工二次确认。');
  lines.push('');
  lines.push('## 一句话草稿');
  lines.push('');
  lines.push(`本周共收到 ${rows.length} 条共建——最被反复说到的，是关于「${topLabel}」。`);
  lines.push('');
  lines.push('## 主题聚类');
  lines.push('');
  for (const g of clusters) {
    lines.push(`### ${g.label}（${g.rows.length} 条 · 共鸣 ${g.totalEcho}）`);
    lines.push('');
    lines.push(`- voice ${g.byKind.voice} / book ${g.byKind.book} / ai ${g.byKind.ai_question}`);
    if (g.representative) {
      lines.push(`- 代表：「${g.representative.text}」${g.representative.signature ? ` —— ${g.representative.signature}` : ''}`);
    }
    const samples = g.rows.slice(1, 4);
    if (samples.length) {
      lines.push('- 同类样本：');
      for (const s of samples) {
        lines.push(`  - 「${s.text}」${s.signature ? ` —— ${s.signature}` : ''}`);
      }
    }
    lines.push('');
  }
  if (findings.length) {
    lines.push('## 偏见自查');
    lines.push('');
    for (const f of findings) {
      lines.push(`### [${f.severity.toUpperCase()}] ${f.rule}`);
      lines.push('');
      lines.push(`- ${f.message}`);
      for (const h of f.hits.slice(0, 4)) lines.push(`  - 「${h.text}」`);
      if (f.hits.length > 4) lines.push(`  - … 还有 ${f.hits.length - 4} 条`);
      lines.push('');
    }
  }
  return lines.join('\n');
}

async function main() {
  const { week, pool } = parseArgs();
  console.log(`[hermosa-cluster] week=${week} pool=${pool}`);
  const rows = await fetchRows(week, pool);
  const clusters = clusterRows(rows);
  const findings = biasFindings(rows);

  const outDir = path.join(repoRoot, 'docs/02-modules/her-voice/curation-drafts');
  fs.mkdirSync(outDir, { recursive: true });
  const md = buildMarkdown(week, pool, rows, clusters, findings);
  fs.writeFileSync(path.join(outDir, `${week}.md`), md, 'utf8');
  fs.writeFileSync(
    path.join(outDir, `${week}.json`),
    JSON.stringify({ week, pool, total: rows.length, clusters, findings }, null, 2),
    'utf8',
  );
  console.log(`[hermosa-cluster] wrote docs/02-modules/her-voice/curation-drafts/${week}.{md,json}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
