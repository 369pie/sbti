#!/usr/bin/env node

/**
 * 鸟TI 图鉴卡片生成器
 *
 * 将 low-poly 鸟类图片 + 文案合成为 3:4 图鉴卡片
 * 风格参考：白底 + 大字人设名 + 语气词 + 金句 + low-poly 鸟
 *
 * Usage:
 *   node scripts/generate-bird-cards.mjs              # 生成全部 29 张
 *   node scripts/generate-bird-cards.mjs boss nerd    # 只生成指定 slug
 *   node scripts/generate-bird-cards.mjs --force       # 强制覆盖
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// ─── 尺寸 & 布局常量 ───
const CARD_W = 810;
const CARD_H = 1080;
const BIRD_DIR = path.join(process.cwd(), 'public/images/types/bird');
const CARD_DIR = path.join(BIRD_DIR, 'cards');

// ─── 字体 (macOS) ───
// Use single quotes inside font-family to avoid breaking SVG attribute double-quotes
const FONT_BOLD = "'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif";
const FONT_MONO = "'SF Mono', 'Menlo', 'Roboto Mono', monospace";

// ─── 颜色 ───
const BG_COLOR = '#FAFAFA';
const TEXT_DARK = '#1A1A1A';
const TEXT_GRAY = '#999999';
const TEXT_LIGHT_GRAY = '#BBBBBB';
const MOOD_RED = '#D63031';

// ─── 29 型鸟格卡片数据（与 src/lib/bird/personalities.ts 保持同步） ───
const BIRD_CARDS = [
  { slug: 'boss', birdName: '鹰', birdTitle: '甲方', code: 'SCREEE', moodWord: '改！', quote: '"社会我鹰哥，眼（毒）亮心（黑）正。"', color: '#7C3A1C', emoji: '🦅' },
  { slug: 'nerd', birdName: '猫头鹰', birdTitle: '已读不回', code: 'HOOT', moodWord: '嗯。', quote: '"知道了但我不（怎么跟你）说。"', color: '#4A3728', emoji: '🦉' },
  { slug: 'ctrl', birdName: '母鸡', birdTitle: '居委会', code: 'BAWK', moodWord: '管！', quote: '"管好自己就行——但自己包括（全世界的）你们。"', color: '#B8860B', emoji: '🐔' },
  { slug: 'mum', birdName: '鹈鹕', birdTitle: '冤种', code: 'GULP', moodWord: '给！', quote: '"嘴里有的都给你，自己饿不（一定）饿着。"', color: '#E8A042', emoji: '🕊️' },
  { slug: 'simp', birdName: '孔雀', birdTitle: '显眼包', code: 'LOOK', moodWord: '看！', quote: '"我低调的（高调）来了。"', color: '#0E7490', emoji: '🦚' },
  { slug: 'solo', birdName: '黑天鹅', birdTitle: '高冷', code: 'HISS', moodWord: '切。', quote: '"社会我鹅姐，人美（确实）话少（更确实）。"', color: '#1C1C2E', emoji: '🦢' },
  { slug: 'sleep', birdName: '褐林鸮', birdTitle: '摆烂', code: 'ZZZ', moodWord: '困…', quote: '"白天？那是（别的鸟的）上班时间。"', color: '#5C4033', emoji: '🦉' },
  { slug: 'game-r', birdName: '松鸦', birdTitle: '集邮', code: 'MINE', moodWord: '我的！', quote: '"这个我有了，但（不介意）再要一个。"', color: '#3B7DD8', emoji: '🐦' },
  { slug: 'drunk', birdName: '太阳鹦鹉', birdTitle: '复读机', code: 'BLAH', moodWord: '啊？', quote: '"你说完了？好（那轮到）我再说一遍。"', color: '#F59E0B', emoji: '🦜' },
  { slug: 'rebel', birdName: '企鹅', birdTitle: '叛逆期', code: 'NOPE', moodWord: '不！', quote: '"翅膀是（不）用来飞的。谢谢。"', color: '#1E293B', emoji: '🐧' },
  { slug: 'oh-no', birdName: '鸭子', birdTitle: '内卷', code: 'QUACK', moodWord: '慌！', quote: '"表面高雅，水下（的脚已经）蹬出残影了。"', color: '#4B7A4B', emoji: '🦆' },
  { slug: 'thin-k', birdName: '火烈鸟', birdTitle: '戏精', code: 'BOOM', moodWord: '啊！', quote: '"我不夸张，只是情绪比较（非常）丰富。"', color: '#E0458B', emoji: '🦩' },
  { slug: 'drama', birdName: '啄木鸟', birdTitle: '工伤', code: 'TAP-TAP', moodWord: '疼！', quote: '"头不（很）疼，再来一下就好了。"', color: '#B91C1C', emoji: '🐦‍⬛' },
  { slug: 'chill', birdName: '鸽子', birdTitle: '鸽王', code: 'COO', moodWord: '咕。', quote: '"说好的明天见，明天（再）见。"', color: '#6B7280', emoji: '🕊️' },
  { slug: 'emo', birdName: '夜鹰', birdTitle: '夜游神', code: 'SIGH', moodWord: '唉。', quote: '"天亮了，该（假装）睡了。"', color: '#312E81', emoji: '🦇' },
  { slug: 'than-k', birdName: '知更鸟', birdTitle: '好人卡', code: 'CHIRP', moodWord: '嘿！', quote: '"被骂了也觉得天气真好（是真的觉得）。"', color: '#EA580C', emoji: '🐦' },
  { slug: 'woc', birdName: '乌鸦', birdTitle: '社会人', code: 'PSST', moodWord: '哼！', quote: '"社会我鸦哥，人狠（不狠）话不（多）多。"', color: '#1D4ED8', emoji: '🐦‍⬛' },
  { slug: 'party', birdName: '噪鹃', birdTitle: '气氛组', code: 'OI-OI', moodWord: '噢！', quote: '"场子（不可能让它）冷了。"', color: '#7C3AED', emoji: '🐓' },
  { slug: 'talk-er', birdName: '虎皮鹦鹉', birdTitle: '自来熟', code: 'HI-HI', moodWord: '嗨！', quote: '"第一次（这秒）见面就是好朋友。"', color: '#16A34A', emoji: '🦜' },
  { slug: 'love-r', birdName: '天鹅', birdTitle: '恋爱脑', code: 'LOVE', moodWord: '呜！', quote: '"认定了就是一辈子（不接受反驳）。"', color: '#F9FAFB', emoji: '🦢' },
  { slug: 'food-ie', birdName: '帝企鹅', birdTitle: '干饭人', code: 'NOM', moodWord: '吃！', quote: '"减肥？在（下顿饭之后的）计划中。"', color: '#F97316', emoji: '🐧' },
  { slug: 'atm-er', birdName: '蜂鸟', birdTitle: '卷王', code: 'BUZZ', moodWord: '冲！', quote: '"停下来？那是（不存在的）选项。"', color: '#06B6D4', emoji: '🐦' },
  { slug: 'dior-s', birdName: '极乐鸟', birdTitle: '颜控', code: 'FABULOUS', moodWord: '美！', quote: '"出门前（只）照了八遍镜子而已。"', color: '#A855F7', emoji: '🦚' },
  { slug: 'sexy', birdName: '鸳鸯', birdTitle: '天菜', code: 'WOW', moodWord: '嚯！', quote: '"好看是天生的，你（确实）管不着。"', color: '#DC2626', emoji: '🦆' },
  { slug: 'fake', birdName: '杜鹃', birdTitle: '白嫖', code: 'CU-CK', moodWord: '嘻。', quote: '"你帮我养，我帮你……（帮你什么来着？）"', color: '#78716C', emoji: '🐦' },
  { slug: 'malo', birdName: '雕鸮', birdTitle: '面瘫', code: 'STARE', moodWord: '……', quote: '"不是冷漠，是这张脸（天生）不会笑。"', color: '#57534E', emoji: '🦉' },
  { slug: 'luck-y', birdName: '喜鹊', birdTitle: '锦鲤', code: 'CHA-CHA', moodWord: '哇！', quote: '"好运不是我带来的（但每次我来都有）。"', color: '#2563EB', emoji: '🐦' },
  { slug: 'joke-r', birdName: '凤头鹦鹉', birdTitle: '乐子人', code: 'HAHA', moodWord: '哈！', quote: '"笑一个嘛，反正生活也不（会更）差了。"', color: '#F43F5E', emoji: '🦜' },
  { slug: 'shy', birdName: '仓鸮', birdTitle: '社恐', code: 'SHUSH', moodWord: '嘘…', quote: '"你没看见我（因为我在假装是墙壁）。"', color: '#D4C5A9', emoji: '🦉' },
];

// ─── SVG 文本模板 ───

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildCardSvg(bird, hasBirdImage) {
  const { birdName, birdTitle, code, moodWord, quote } = bird;

  // 布局 Y 坐标
  const headerY = 80;
  const titleY = 200;
  const codeY = 300;
  const moodY = 370;
  const quoteY = 1000;

  // quote 可能较长，需要拆行
  const quoteLines = wrapTextSimple(quote, 22);
  const quoteLinesSvg = quoteLines
    .map((line, i) => `<tspan x="405" dy="${i === 0 ? 0 : 30}">${escapeXml(line)}</tspan>`)
    .join('');

  // 没有真实图片时，用鸟名大字做视觉中心
  const birdNameCenterSvg = !hasBirdImage ? `
  <!-- 鸟名大字占位 -->
  <text x="405" y="620" text-anchor="middle"
        font-family="${FONT_BOLD}" font-size="160" fill="#E8E8E8" font-weight="900"
        letter-spacing="16">
    ${escapeXml(birdName)}
  </text>
  ` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${CARD_H}" viewBox="0 0 ${CARD_W} ${CARD_H}">

  <!-- 头部引导文字 -->
  <text x="405" y="${headerY}" text-anchor="middle"
        font-family="${FONT_BOLD}" font-size="24" fill="${TEXT_GRAY}" font-weight="400">
    ${escapeXml(birdName)}的鸟格类型是：
  </text>

  <!-- 人设大标题 -->
  <text x="405" y="${titleY}" text-anchor="middle"
        font-family="${FONT_BOLD}" font-size="108" fill="${TEXT_DARK}" font-weight="900"
        letter-spacing="8">
    ${escapeXml(birdTitle)}
  </text>

  <!-- CODE -->
  <text x="405" y="${codeY}" text-anchor="middle"
        font-family="${FONT_MONO}" font-size="22" fill="${TEXT_LIGHT_GRAY}" font-weight="600"
        letter-spacing="4">
    ${escapeXml(code)}
  </text>

  <!-- 语气词 -->
  <text x="405" y="${moodY}" text-anchor="middle"
        font-family="${FONT_BOLD}" font-size="52" fill="${MOOD_RED}" font-weight="800">
    ${escapeXml(moodWord)}
  </text>

  ${birdNameCenterSvg}

  <!-- 底部金句 -->
  <text x="405" y="${quoteY}" text-anchor="middle"
        font-family="${FONT_BOLD}" font-size="22" fill="${TEXT_GRAY}" font-weight="400">
    ${quoteLinesSvg}
  </text>
</svg>`;
}

function wrapTextSimple(text, maxCharsPerLine) {
  if (text.length <= maxCharsPerLine) return [text];
  const lines = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxCharsPerLine) {
      lines.push(remaining);
      break;
    }
    // 找到合适断点
    let breakAt = maxCharsPerLine;
    const punctuation = '，。！？；：、）」』】';
    for (let i = maxCharsPerLine; i > maxCharsPerLine - 5 && i > 0; i--) {
      if (punctuation.includes(remaining[i])) {
        breakAt = i + 1;
        break;
      }
    }
    lines.push(remaining.slice(0, breakAt));
    remaining = remaining.slice(breakAt);
  }
  return lines;
}

// ─── 主生成函数 ───

async function generateCard(bird, force = false) {
  const outputPath = path.join(CARD_DIR, `${bird.slug}.png`);

  // 检查是否已存在
  if (!force) {
    try {
      await fs.access(outputPath);
      return { slug: bird.slug, status: 'skipped' };
    } catch { /* 不存在，继续生成 */ }
  }

  // 检查是否有 low-poly 鸟类原始图片
  const birdImagePath = path.join(BIRD_DIR, `${bird.slug}.png`);
  let hasBirdImage = false;
  try {
    await fs.access(birdImagePath);
    hasBirdImage = true;
  } catch { /* 无原始图片，用 emoji 占位 */ }

  // 生成 SVG 文本层
  const svgText = buildCardSvg(bird, hasBirdImage);

  // 创建白底画布
  let pipeline = sharp({
    create: {
      width: CARD_W,
      height: CARD_H,
      channels: 4,
      background: '#fafafa',
    },
  }).png();

  const composites = [];

  // 合成低多边形鸟图（如果存在）
  if (hasBirdImage) {
    // 鸟图区域：Y=400~850, 居中, 最大宽 520
    const birdAreaY = 400;
    const birdAreaH = 450;
    const birdAreaW = 520;

    const resizedBird = await sharp(birdImagePath)
      .resize(birdAreaW, birdAreaH, { fit: 'inside', background: '#fafafa00' })
      .png()
      .toBuffer();

    const meta = await sharp(resizedBird).metadata();
    composites.push({
      input: resizedBird,
      left: Math.round((CARD_W - meta.width) / 2),
      top: Math.round(birdAreaY + (birdAreaH - meta.height) / 2),
    });
  }

  // 合成 SVG 文本层
  composites.push({
    input: Buffer.from(svgText),
    left: 0,
    top: 0,
  });

  await pipeline
    .composite(composites)
    .toFile(outputPath);

  return { slug: bird.slug, status: hasBirdImage ? 'generated' : 'generated (emoji)' };
}

// ─── CLI ───

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const slugArgs = args.filter(a => !a.startsWith('--'));

  // 筛选要生成的卡片
  let targets = BIRD_CARDS;
  if (slugArgs.length > 0) {
    targets = BIRD_CARDS.filter(b => slugArgs.includes(b.slug));
    if (targets.length === 0) {
      console.error('No matching slugs found. Available:', BIRD_CARDS.map(b => b.slug).join(', '));
      process.exit(1);
    }
  }

  // 确保输出目录存在
  await fs.mkdir(CARD_DIR, { recursive: true });

  console.log(`\n🐦 鸟TI 图鉴卡片生成器`);
  console.log(`   目标: ${targets.length} 张卡片`);
  console.log(`   输出: ${CARD_DIR}\n`);

  let generated = 0;
  let skipped = 0;

  for (const bird of targets) {
    try {
      const result = await generateCard(bird, force);
      if (result.status === 'skipped') {
        skipped++;
        console.log(`  ⏭️  ${bird.slug} — 已存在，跳过`);
      } else {
        generated++;
        console.log(`  ✅ ${bird.slug} — ${result.status}`);
      }
    } catch (err) {
      console.error(`  ❌ ${bird.slug} — ${err.message}`);
    }
  }

  console.log(`\n完成: ${generated} 生成, ${skipped} 跳过\n`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
