#!/usr/bin/env node
/**
 * SoulTI 共振对象审计 — 反精英化体检
 *
 * 触发动机：2026-04-20 调研评估报告 §5 机会 1A。
 * 小红书 HERTI 差评显示「林徽因/弗里达/伍尔夫」等历史精英女性参照系
 * 离普通学生/打工人太远。SoulTI 32 类共振对象与 HERTI 同构，需要
 * 先盘点、再决定哪些类型应该补充「当代普通人共振」。
 *
 * 本脚本只读不写：
 * 1. 从 src/lib/soulti/personalities.ts 抽取 SOULTI_RESONANCE 全部 soulOrigin
 * 2. 按时代 / 国别 / 职业类别 / 是否「精英文化人」分类
 * 3. 输出 markdown 表格 + 反精英化候选清单到 stdout
 *
 * 用法：
 *   node scripts/audit-soulti-resonance.mjs
 *   node scripts/audit-soulti-resonance.mjs > /tmp/soulti-audit.md
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SRC = resolve(process.cwd(), 'src/lib/soulti/personalities.ts');
const text = readFileSync(SRC, 'utf8');

// ───────── 抽取 SOULTI_RESONANCE 整段 ─────────
const startIdx = text.indexOf('export const SOULTI_RESONANCE');
if (startIdx < 0) {
  console.error('找不到 SOULTI_RESONANCE 导出');
  process.exit(1);
}

// 拿到 entries：每个以 `slug: {` 开头，到匹配大括号结束
// 简化：用 regex 抓 quoteSource + soulOrigin 字段
const entryRe =
  /(\w+):\s*\{[^]*?quote:\s*'([^]*?)'[^]*?quoteSource:\s*'([^]*?)'[^]*?soulOrigin:\s*\{\s*name:\s*'([^']*)'[^]*?zhName:\s*'([^']*)'[^]*?era:\s*'([^']*)'[^]*?description:\s*'([^]*?)'/g;

const block = text.slice(startIdx);
const entries = [];
let m;
while ((m = entryRe.exec(block))) {
  const [, slug, , quoteSource, name, zhName, era, description] = m;
  entries.push({ slug, quoteSource, name, zhName, era, description });
}

// ───────── 分类启发式 ─────────

// 已知「精英文化人」原型词 — 保守策略：宁可误报也不漏报
const ELITE_KEYWORDS = [
  '建筑师', '诗人', '作家', '画家', '艺术家',
  '哲学家', '小说家', '词人', '剧作家', '舞蹈家',
  '导演', '科学家', '诗词', '文学', '钢琴', '雕塑',
  '理论', '学者', '院士', '博士', '教授',
];

const WESTERN_KEYWORDS = [
  'Lin', 'Frida', 'Virginia', 'Simone', 'Marie', 'Anne', 'Mary',
  'Emily', 'Coco', 'Audrey', 'Maya', 'Susan', 'Jane', 'Marina',
  'Sylvia', 'Joan', 'Greta', 'Patti', 'Yoko', 'Vera', 'Marguerite',
  'Hannah', 'Elizabeth', 'Isabel', 'Sappho', 'Isadora',
];

function isWesternEntry(entry) {
  // 主判据：中文译名带「·」中点（如「玛丽·雪莱」「弗里达·卡罗」）
  if (entry.zhName.includes('·')) return true;
  // 副判据：英文 name 命中已知西方人名词典
  return WESTERN_KEYWORDS.some((k) => entry.name.includes(k));
}

function classify(entry) {
  const blob = `${entry.zhName} ${entry.name} ${entry.description}`;
  const eliteHits = ELITE_KEYWORDS.filter((k) => blob.includes(k));
  const isWestern = isWesternEntry(entry);

  // 时代解析
  const eraMatch = entry.era.match(/(\d{4})\s*[—–-]\s*(\d{4}|今|现在)?/);
  let birthYear = null;
  let isAlive = false;
  if (eraMatch) {
    birthYear = parseInt(eraMatch[1], 10);
    const end = eraMatch[2];
    if (!end || /今|现在/.test(end)) isAlive = true;
    else {
      const endYear = parseInt(end, 10);
      if (endYear >= 2020) isAlive = true;
    }
  }

  const isContemporary = birthYear !== null && birthYear >= 1960;
  const isPreModern = birthYear !== null && birthYear < 1900;

  return {
    eliteHits,
    isElite: eliteHits.length > 0,
    isWestern,
    isContemporary,
    isPreModern,
    isAlive,
    birthYear,
  };
}

// ───────── 渲染报告 ─────────

const enriched = entries.map((e) => ({ ...e, ...classify(e) }));

const total = enriched.length;
const elite = enriched.filter((e) => e.isElite);
const western = enriched.filter((e) => e.isWestern);
const contemporary = enriched.filter((e) => e.isContemporary);
const alive = enriched.filter((e) => e.isAlive);

console.log('# SoulTI · 共振对象审计报告\n');
console.log(`生成时间：${new Date().toISOString().slice(0, 10)}  `);
console.log(`数据源：\`src/lib/soulti/personalities.ts\` (\`SOULTI_RESONANCE\`)\n`);

console.log('## 总览\n');
console.log('| 指标 | 数量 | 占比 |');
console.log('|---|---:|---:|');
console.log(`| 共振条目总数 | ${total} | 100% |`);
console.log(`| 「精英文化人」原型（建筑师/诗人/作家/艺术家/学者…） | ${elite.length} | ${((elite.length / total) * 100).toFixed(0)}% |`);
console.log(`| 西方人物（Lin Huiyin 等中英写法判定） | ${western.length} | ${((western.length / total) * 100).toFixed(0)}% |`);
console.log(`| 当代女性（≥1960 年生） | ${contemporary.length} | ${((contemporary.length / total) * 100).toFixed(0)}% |`);
console.log(`| 在世 / 近 5 年逝世 | ${alive.length} | ${((alive.length / total) * 100).toFixed(0)}% |\n`);

console.log('## HERTI 风险评估');
console.log('');
console.log('> 评估口径：「精英文化人」+「非当代」叠加的条目，是与 HERTI 同款差评射程最重合的部分。');
console.log('');
const eliteNonContemporary = enriched.filter((e) => e.isElite && !e.isContemporary);
console.log(`**高风险条目数：${eliteNonContemporary.length} / ${total}（${((eliteNonContemporary.length / total) * 100).toFixed(0)}%）**\n`);
if (eliteNonContemporary.length > 0) {
  console.log('| Slug | 共振对象 | 时代 | 命中精英词 |');
  console.log('|---|---|---|---|');
  for (const e of eliteNonContemporary) {
    console.log(`| \`${e.slug}\` | ${e.zhName} (${e.name}) | ${e.era} | ${e.eliteHits.join('、')} |`);
  }
  console.log('');
}

console.log('## 全量明细\n');
console.log('| Slug | 共振对象 | 时代 | 国别 | 标签 | 反精英化建议 |');
console.log('|---|---|---|---|---|---|');
for (const e of enriched) {
  const flags = [];
  if (e.isElite) flags.push('🎭 精英');
  if (e.isWestern) flags.push('🌍 西方');
  if (e.isContemporary) flags.push('🆕 当代');
  if (e.isAlive) flags.push('✨ 在世');
  const region = e.isWestern ? '西' : '中';

  let suggestion = '—';
  if (e.isElite && !e.isContemporary) {
    suggestion = '建议补充「当代普通女性」并列共振（如外卖站长、独居博主、考研三战、宠物姐）';
  } else if (e.isElite && e.isContemporary) {
    suggestion = '当代精英可保留，但建议加一位「同语境普通人」';
  } else if (!e.isElite && !e.isContemporary) {
    suggestion = '已偏向普通人路径，可作为反精英标杆';
  }

  console.log(`| \`${e.slug}\` | ${e.zhName} | ${e.era} | ${region} | ${flags.join(' ') || '—'} | ${suggestion} |`);
}
console.log('');

console.log('## 行动建议（供 brand owner 决策）\n');
console.log('1. **第一刀**：把 ↑「高风险条目」逐个补充一位「同主题当代普通女性」并列共振，');
console.log('   保留精英对象作为「灵魂前辈」，新增对象作为「同温层姐妹」。这是最小改动 + 最大反差。');
console.log('2. **第二刀**：在 SoulTI 结果页加「日常版描述」切换 — 给每个 slug 准备一段「不是诗人」版的文案。');
console.log('3. **底线**：精英文化人占比建议 ≤30%；当前是否超标，参见上表。');
console.log('');

console.log('---');
console.log('');
console.log('生成方式：`node scripts/audit-soulti-resonance.mjs > /tmp/soulti-audit.md`');
