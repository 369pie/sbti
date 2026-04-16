/**
 * Xiaohongshu Share Card Generator
 * Generates 7 mystical-themed share card images (1080x1440, 3:4 ratio)
 * Usage: node scripts/generate-xhs-cards.mjs
 */

import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'public', 'images', 'xhs');
mkdirSync(OUTPUT_DIR, { recursive: true });

const W = 1080;
const H = 1440;

// Theme colors
const BG = '#0B0D17';
const GOLD = '#C9A86C';
const PURPLE = '#7B61FF';
const WHITE = '#F3EFE6';
const DARK_PURPLE = '#2A1F5E';
const DEEP_BLUE = '#0F1A3A';

// Shared SVG defs for gradients and filters
const sharedDefs = `
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${PURPLE}" stop-opacity="0.6"/>
      <stop offset="60%" stop-color="${PURPLE}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${BG}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.5"/>
      <stop offset="70%" stop-color="${GOLD}" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="${BG}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${PURPLE}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${BG}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${GOLD}"/>
      <stop offset="100%" stop-color="#A88B5A"/>
    </linearGradient>
    <filter id="softGlow">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="heavyGlow">
      <feGaussianBlur stdDeviation="20" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
`;

// Stars decoration helper
function stars(count = 20) {
  let s = '';
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * W);
    const y = Math.floor(Math.random() * H);
    const size = 1 + Math.random() * 3;
    const opacity = 0.2 + Math.random() * 0.5;
    s += `<text x="${x}" y="${y}" font-size="${size * 6}" fill="${WHITE}" opacity="${opacity}" text-anchor="middle">✦</text>`;
  }
  return s;
}

// Tarot card back SVG element
function tarotCardBack(x, y, w = 180, h = 280) {
  return `
    <g transform="translate(${x}, ${y})">
      <rect x="0" y="0" width="${w}" height="${h}" rx="12" fill="${DEEP_BLUE}" stroke="${GOLD}" stroke-width="2"/>
      <rect x="8" y="8" width="${w - 16}" height="${h - 16}" rx="8" fill="none" stroke="${GOLD}" stroke-width="1" opacity="0.4"/>
      <text x="${w / 2}" y="${h / 2 - 10}" font-size="48" fill="${GOLD}" text-anchor="middle" opacity="0.7">☽</text>
      <text x="${w / 2}" y="${h / 2 + 40}" font-size="24" fill="${PURPLE}" text-anchor="middle" opacity="0.5">✦ ✦ ✦</text>
      <!-- corner ornaments -->
      <text x="20" y="30" font-size="16" fill="${GOLD}" opacity="0.4">✦</text>
      <text x="${w - 20}" y="30" font-size="16" fill="${GOLD}" opacity="0.4">✦</text>
      <text x="20" y="${h - 15}" font-size="16" fill="${GOLD}" opacity="0.4">✦</text>
      <text x="${w - 20}" y="${h - 15}" font-size="16" fill="${GOLD}" opacity="0.4">✦</text>
    </g>
  `;
}

// Glowing single card
function glowingCard(x, y, w = 240, h = 380, symbol = '☽') {
  return `
    <circle cx="${x + w / 2}" cy="${y + h / 2}" r="200" fill="url(#glow)" filter="url(#heavyGlow)"/>
    <g transform="translate(${x}, ${y})">
      <rect x="0" y="0" width="${w}" height="${h}" rx="16" fill="${DEEP_BLUE}" stroke="${GOLD}" stroke-width="2.5"/>
      <rect x="10" y="10" width="${w - 20}" height="${h - 20}" rx="10" fill="none" stroke="${GOLD}" stroke-width="1" opacity="0.3"/>
      <text x="${w / 2}" y="${h / 2 - 20}" font-size="72" fill="${GOLD}" text-anchor="middle" filter="url(#softGlow)">${symbol}</text>
      <text x="${w / 2}" y="${h / 2 + 50}" font-size="20" fill="${WHITE}" text-anchor="middle" opacity="0.6">TAROT</text>
    </g>
  `;
}

async function generateAndSave(name, svgContent) {
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${sharedDefs}${svgContent}</svg>`;
  const outPath = join(OUTPUT_DIR, name);
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log(`✓ Generated: ${name}`);
}

// ===== Card 1: Test Post Cover =====
async function coverTest() {
  const svg = `
    <rect width="${W}" height="${H}" fill="${BG}"/>
    <!-- Top glow -->
    <ellipse cx="540" cy="200" rx="400" ry="200" fill="url(#purpleGrad)"/>
    ${stars(30)}
    <!-- Title -->
    <text x="540" y="220" font-size="72" font-weight="bold" fill="${WHITE}" text-anchor="middle" font-family="sans-serif">测测你的灵魂</text>
    <text x="540" y="310" font-size="72" font-weight="bold" fill="${GOLD}" text-anchor="middle" font-family="sans-serif">塔罗牌</text>
    <!-- 3 tarot card backs -->
    ${tarotCardBack(180, 480)}
    ${tarotCardBack(450, 440)}
    ${tarotCardBack(720, 480)}
    <!-- Subtitle -->
    <text x="540" y="870" font-size="56" font-weight="bold" fill="${PURPLE}" text-anchor="middle" filter="url(#softGlow)" font-family="sans-serif">准到哭！</text>
    <!-- Bottom decoration -->
    <line x1="200" y1="940" x2="880" y2="940" stroke="${GOLD}" stroke-width="1" opacity="0.3"/>
    <text x="540" y="990" font-size="28" fill="${WHITE}" text-anchor="middle" opacity="0.5" font-family="sans-serif">✦ 灵魂塔罗 · 神秘指引 ✦</text>
    <!-- CTA -->
    <rect x="300" y="1100" width="480" height="80" rx="40" fill="${PURPLE}" opacity="0.9"/>
    <text x="540" y="1152" font-size="32" font-weight="bold" fill="${WHITE}" text-anchor="middle" font-family="sans-serif">👆 点击测试</text>
    <!-- Bottom stars -->
    <text x="140" y="1350" font-size="40" fill="${GOLD}" opacity="0.2">✦</text>
    <text x="940" y="1320" font-size="30" fill="${PURPLE}" opacity="0.2">✦</text>
    <text x="540" y="1400" font-size="20" fill="${WHITE}" opacity="0.15">✦ ✦ ✦</text>
  `;
  await generateAndSave('cover-test.png', svg);
}

// ===== Card 2: Daily Card Cover =====
async function coverDaily() {
  const svg = `
    <rect width="${W}" height="${H}" fill="${BG}"/>
    <!-- Central glow -->
    <ellipse cx="540" cy="650" rx="350" ry="400" fill="url(#glow)"/>
    ${stars(25)}
    <!-- Title area -->
    <text x="540" y="180" font-size="28" fill="${GOLD}" text-anchor="middle" opacity="0.7" font-family="sans-serif">✦ DAILY TAROT ✦</text>
    <text x="540" y="280" font-size="80" font-weight="bold" fill="${WHITE}" text-anchor="middle" font-family="sans-serif">今日灵魂牌</text>
    <!-- Decorative line -->
    <line x1="300" y1="330" x2="780" y2="330" stroke="${GOLD}" stroke-width="1.5" opacity="0.4"/>
    <!-- Single glowing card -->
    ${glowingCard(420, 400, 240, 380, '☀')}
    <!-- Subtitle -->
    <text x="540" y="900" font-size="44" fill="${WHITE}" text-anchor="middle" opacity="0.85" font-family="sans-serif">每天一牌</text>
    <text x="540" y="960" font-size="44" fill="${WHITE}" text-anchor="middle" opacity="0.85" font-family="sans-serif">每天一个指引</text>
    <!-- Bottom accent -->
    <text x="540" y="1060" font-size="24" fill="${GOLD}" text-anchor="middle" opacity="0.5" font-family="sans-serif">— 今日运势，由你解读 —</text>
    <!-- CTA -->
    <rect x="300" y="1150" width="480" height="80" rx="40" fill="${PURPLE}" opacity="0.85"/>
    <text x="540" y="1202" font-size="32" font-weight="bold" fill="${WHITE}" text-anchor="middle" font-family="sans-serif">🎴 抽取今日牌</text>
  `;
  await generateAndSave('cover-daily.png', svg);
}

// ===== Card 3: Dual Reading Cover =====
async function coverDual() {
  const svg = `
    <rect width="${W}" height="${H}" fill="${BG}"/>
    <!-- Dual glow -->
    <ellipse cx="320" cy="600" rx="250" ry="300" fill="url(#glow)" opacity="0.6"/>
    <ellipse cx="760" cy="600" rx="250" ry="300" fill="url(#glow)" opacity="0.6"/>
    ${stars(22)}
    <!-- Title -->
    <text x="540" y="200" font-size="28" fill="${GOLD}" text-anchor="middle" opacity="0.7" font-family="sans-serif">✦ SOUL BOND ✦</text>
    <text x="540" y="300" font-size="76" font-weight="bold" fill="${WHITE}" text-anchor="middle" font-family="sans-serif">你们的</text>
    <text x="540" y="395" font-size="76" font-weight="bold" fill="${GOLD}" text-anchor="middle" font-family="sans-serif">灵魂绑定</text>
    <!-- Two cards -->
    <g transform="translate(120, 470) scale(0.95)">
      ${tarotCardBack(0, 0, 200, 320)}
      <text x="100" y="360" font-size="24" fill="${WHITE}" text-anchor="middle" opacity="0.6" font-family="sans-serif">你</text>
    </g>
    <!-- Connection symbol -->
    <g filter="url(#softGlow)">
      <text x="540" y="640" font-size="64" fill="${PURPLE}" text-anchor="middle">♡</text>
    </g>
    <g transform="translate(620, 470) scale(0.95)">
      ${tarotCardBack(0, 0, 200, 320)}
      <text x="100" y="360" font-size="24" fill="${WHITE}" text-anchor="middle" opacity="0.6" font-family="sans-serif">TA</text>
    </g>
    <!-- Subtitle -->
    <text x="540" y="930" font-size="42" fill="${WHITE}" text-anchor="middle" opacity="0.8" font-family="sans-serif">测测你和 TA 的关系</text>
    <!-- Decorative -->
    <line x1="250" y1="980" x2="830" y2="980" stroke="${GOLD}" stroke-width="1" opacity="0.3"/>
    <text x="540" y="1030" font-size="22" fill="${GOLD}" text-anchor="middle" opacity="0.5" font-family="sans-serif">缘分 · 默契 · 灵魂共鸣</text>
    <!-- CTA -->
    <rect x="280" y="1140" width="520" height="80" rx="40" fill="${PURPLE}" opacity="0.85"/>
    <text x="540" y="1192" font-size="32" font-weight="bold" fill="${WHITE}" text-anchor="middle" font-family="sans-serif">💕 开始双人测试</text>
  `;
  await generateAndSave('cover-dual.png', svg);
}

// ===== Card 4: Shadow Card Cover =====
async function coverShadow() {
  const svg = `
    <rect width="${W}" height="${H}" fill="${BG}"/>
    <!-- Split design: left light, right shadow -->
    <rect x="0" y="0" width="${W / 2}" height="${H}" fill="${DEEP_BLUE}" opacity="0.3"/>
    <line x1="540" y1="80" x2="540" y2="${H - 80}" stroke="${GOLD}" stroke-width="2" opacity="0.3"/>
    <!-- Glow on center -->
    <ellipse cx="540" cy="650" rx="300" ry="350" fill="url(#glow)" opacity="0.4"/>
    ${stars(18)}
    <!-- Title -->
    <text x="540" y="200" font-size="28" fill="${GOLD}" text-anchor="middle" opacity="0.7" font-family="sans-serif">✦ SHADOW SELF ✦</text>
    <text x="540" y="300" font-size="64" font-weight="bold" fill="${WHITE}" text-anchor="middle" font-family="sans-serif">你不愿承认的</text>
    <text x="540" y="385" font-size="64" font-weight="bold" fill="${PURPLE}" text-anchor="middle" font-family="sans-serif">那一面</text>
    <!-- Split card: half light half dark -->
    <g transform="translate(420, 450)">
      <clipPath id="leftHalf"><rect x="0" y="0" width="120" height="380"/></clipPath>
      <clipPath id="rightHalf"><rect x="120" y="0" width="120" height="380"/></clipPath>
      <rect x="0" y="0" width="240" height="380" rx="16" fill="${DEEP_BLUE}" stroke="${GOLD}" stroke-width="2"/>
      <!-- Light side -->
      <rect x="2" y="2" width="118" height="376" rx="14" fill="#1A1535" clip-path="url(#leftHalf)"/>
      <text x="60" y="200" font-size="48" fill="${WHITE}" text-anchor="middle" opacity="0.8">☀</text>
      <!-- Dark side -->
      <rect x="120" y="2" width="118" height="376" fill="#050510" clip-path="url(#rightHalf)"/>
      <text x="180" y="200" font-size="48" fill="${PURPLE}" text-anchor="middle" opacity="0.8">☾</text>
      <!-- Center divider -->
      <line x1="120" y1="10" x2="120" y2="370" stroke="${GOLD}" stroke-width="1.5" opacity="0.6"/>
    </g>
    <!-- Subtitle -->
    <text x="540" y="940" font-size="38" fill="${WHITE}" text-anchor="middle" opacity="0.8" font-family="sans-serif">每个人心里都住着一个</text>
    <text x="540" y="995" font-size="38" fill="${WHITE}" text-anchor="middle" opacity="0.8" font-family="sans-serif">不为人知的自己</text>
    <!-- CTA -->
    <rect x="280" y="1120" width="520" height="80" rx="40" fill="#3A1F5E" opacity="0.9"/>
    <text x="540" y="1172" font-size="32" font-weight="bold" fill="${WHITE}" text-anchor="middle" font-family="sans-serif">🌑 探索你的阴影面</text>
  `;
  await generateAndSave('cover-shadow.png', svg);
}

// ===== Card 5: Archetype Cover =====
async function coverArchetype() {
  const archetypes = [
    ['☀', 'Fire'], ['◇', 'Water'], ['❋', 'Nature'], ['✧', 'Storm'],
    ['☽', 'Moon'], ['★', 'Star'], ['◆', 'Gem'], ['♠', 'Mystic'],
    ['♦', 'Rose'], ['⊛', 'Cosmic'], ['♛', 'Royal']
  ];
  let grid = '';
  const cols = 4;
  const cellSize = 150;
  const startX = (W - cols * cellSize) / 2;
  const startY = 480;
  archetypes.forEach(([symbol, label], i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = startX + col * cellSize + cellSize / 2;
    const cy = startY + row * cellSize + cellSize / 2;
    grid += `
      <circle cx="${cx}" cy="${cy}" r="52" fill="${DEEP_BLUE}" stroke="${GOLD}" stroke-width="1.5" opacity="0.8"/>
      <text x="${cx}" y="${cy + 12}" font-size="38" fill="${GOLD}" text-anchor="middle">${symbol}</text>
    `;
  });

  const svg = `
    <rect width="${W}" height="${H}" fill="${BG}"/>
    <ellipse cx="540" cy="400" rx="450" ry="250" fill="url(#purpleGrad)"/>
    ${stars(20)}
    <!-- Title -->
    <text x="540" y="180" font-size="28" fill="${GOLD}" text-anchor="middle" opacity="0.7" font-family="sans-serif">✦ RELATIONSHIP ✦</text>
    <text x="540" y="280" font-size="72" font-weight="bold" fill="${WHITE}" text-anchor="middle" font-family="sans-serif">11种灵魂</text>
    <text x="540" y="370" font-size="72" font-weight="bold" fill="${GOLD}" text-anchor="middle" font-family="sans-serif">关系</text>
    <!-- Grid -->
    ${grid}
    <!-- Subtitle -->
    <text x="540" y="1100" font-size="36" fill="${WHITE}" text-anchor="middle" opacity="0.75" font-family="sans-serif">你是哪一种？</text>
    <!-- CTA -->
    <rect x="280" y="1180" width="520" height="76" rx="38" fill="${PURPLE}" opacity="0.85"/>
    <text x="540" y="1230" font-size="30" font-weight="bold" fill="${WHITE}" text-anchor="middle" font-family="sans-serif">🔮 测试你的人格类型</text>
  `;
  await generateAndSave('cover-archetype.png', svg);
}

// ===== Card 6: Collection/Atlas Cover =====
async function coverCollection() {
  // Mini card grid representing collection
  let cardGrid = '';
  const cols = 5;
  const rows = 3;
  const cardW = 120;
  const cardH = 170;
  const gapX = 30;
  const gapY = 30;
  const totalW = cols * cardW + (cols - 1) * gapX;
  const startX = (W - totalW) / 2;
  const startY = 460;
  const symbols = ['☽', '☀', '★', '♦', '♠', '♧', '♛', '⚔', '⚛', '✿', '☾', '◈', '❋', '✧', '⊛'];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * (cardW + gapX);
      const y = startY + r * (cardH + gapY);
      const idx = r * cols + c;
      const opacity = 0.5 + Math.random() * 0.5;
      cardGrid += `
        <rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" rx="10" fill="${DEEP_BLUE}" stroke="${GOLD}" stroke-width="1.5" opacity="${opacity}"/>
        <text x="${x + cardW / 2}" y="${y + cardH / 2 + 12}" font-size="36" fill="${GOLD}" text-anchor="middle" opacity="${opacity * 0.8}">${symbols[idx % symbols.length]}</text>
      `;
    }
  }

  const svg = `
    <rect width="${W}" height="${H}" fill="${BG}"/>
    <ellipse cx="540" cy="500" rx="400" ry="300" fill="url(#glow)" opacity="0.3"/>
    ${stars(22)}
    <!-- Title -->
    <text x="540" y="180" font-size="28" fill="${GOLD}" text-anchor="middle" opacity="0.7" font-family="sans-serif">✦ COLLECTION ✦</text>
    <text x="540" y="280" font-size="72" font-weight="bold" fill="${WHITE}" text-anchor="middle" font-family="sans-serif">我的</text>
    <text x="540" y="370" font-size="72" font-weight="bold" fill="${GOLD}" text-anchor="middle" font-family="sans-serif">人格图鉴</text>
    <!-- Card grid -->
    ${cardGrid}
    <!-- Progress -->
    <text x="540" y="1080" font-size="32" fill="${WHITE}" text-anchor="middle" opacity="0.7" font-family="sans-serif">已收集 15/78 张牌</text>
    <rect x="240" y="1110" width="600" height="12" rx="6" fill="${DEEP_BLUE}" opacity="0.6"/>
    <rect x="240" y="1110" width="115" height="12" rx="6" fill="${GOLD}" opacity="0.8"/>
    <!-- CTA -->
    <rect x="280" y="1180" width="520" height="76" rx="38" fill="${PURPLE}" opacity="0.85"/>
    <text x="540" y="1230" font-size="30" font-weight="bold" fill="${WHITE}" text-anchor="middle" font-family="sans-serif">📚 查看我的图鉴</text>
  `;
  await generateAndSave('cover-collection.png', svg);
}

// ===== Card 7: Daily Gacha Cover =====
async function coverGacha() {
  const svg = `
    <rect width="${W}" height="${H}" fill="${BG}"/>
    <!-- Big glow behind gacha -->
    <ellipse cx="540" cy="600" rx="300" ry="350" fill="url(#goldGlow)" filter="url(#heavyGlow)"/>
    ${stars(25)}
    <!-- Title -->
    <text x="540" y="180" font-size="28" fill="${GOLD}" text-anchor="middle" opacity="0.7" font-family="sans-serif">✦ FREE GACHA ✦</text>
    <text x="540" y="280" font-size="72" font-weight="bold" fill="${WHITE}" text-anchor="middle" font-family="sans-serif">每天免费</text>
    <text x="540" y="370" font-size="72" font-weight="bold" fill="${GOLD}" text-anchor="middle" font-family="sans-serif">抽一卡</text>
    <!-- Gacha machine -->
    <g transform="translate(400, 430)">
      <!-- Machine body -->
      <rect x="0" y="80" width="280" height="300" rx="24" fill="${DEEP_BLUE}" stroke="${GOLD}" stroke-width="2.5"/>
      <!-- Dome top -->
      <ellipse cx="140" cy="80" rx="120" ry="80" fill="${DEEP_BLUE}" stroke="${GOLD}" stroke-width="2"/>
      <ellipse cx="140" cy="80" rx="100" ry="65" fill="#141030" opacity="0.8"/>
      <!-- Balls inside dome -->
      <circle cx="100" cy="70" r="22" fill="${PURPLE}" opacity="0.8"/>
      <circle cx="150" cy="55" r="18" fill="${GOLD}" opacity="0.7"/>
      <circle cx="175" cy="80" r="20" fill="${PURPLE}" opacity="0.6"/>
      <circle cx="120" cy="95" r="15" fill="${GOLD}" opacity="0.5"/>
      <!-- Slot -->
      <rect x="90" y="320" width="100" height="30" rx="6" fill="${BG}" stroke="${GOLD}" stroke-width="1.5"/>
      <text x="140" y="343" font-size="14" fill="${GOLD}" text-anchor="middle" font-family="sans-serif">DRAW</text>
      <!-- Decorative dots -->
      <circle cx="30" cy="150" r="6" fill="${GOLD}" opacity="0.3"/>
      <circle cx="250" cy="150" r="6" fill="${GOLD}" opacity="0.3"/>
      <circle cx="30" cy="250" r="6" fill="${GOLD}" opacity="0.3"/>
      <circle cx="250" cy="250" r="6" fill="${GOLD}" opacity="0.3"/>
    </g>
    <!-- Sparkles around machine -->
    <text x="350" y="500" font-size="36" fill="${GOLD}" opacity="0.5" filter="url(#softGlow)">✦</text>
    <text x="750" y="480" font-size="28" fill="${PURPLE}" opacity="0.5" filter="url(#softGlow)">✦</text>
    <text x="380" y="750" font-size="24" fill="${GOLD}" opacity="0.4">✧</text>
    <text x="720" y="720" font-size="30" fill="${PURPLE}" opacity="0.4">✧</text>
    <!-- Subtitle -->
    <text x="540" y="930" font-size="38" fill="${WHITE}" text-anchor="middle" opacity="0.8" font-family="sans-serif">今日限定 · 机会只有一次</text>
    <line x1="280" y1="970" x2="800" y2="970" stroke="${GOLD}" stroke-width="1" opacity="0.3"/>
    <!-- CTA -->
    <rect x="260" y="1060" width="560" height="90" rx="45" fill="${GOLD}" opacity="0.9"/>
    <text x="540" y="1120" font-size="36" font-weight="bold" fill="${BG}" text-anchor="middle" font-family="sans-serif">🎰 立即免费抽卡</text>
    <!-- Free badge -->
    <circle cx="820" cy="1030" r="44" fill="#FF4444"/>
    <text x="820" y="1038" font-size="22" font-weight="bold" fill="${WHITE}" text-anchor="middle" font-family="sans-serif">FREE</text>
  `;
  await generateAndSave('cover-gacha.png', svg);
}

// ===== Run all =====
async function main() {
  console.log('🎴 Generating Xiaohongshu share cards...\n');
  await coverTest();
  await coverDaily();
  await coverDual();
  await coverShadow();
  await coverArchetype();
  await coverCollection();
  await coverGacha();
  console.log('\n✅ All 7 cards generated in: public/images/xhs/');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
