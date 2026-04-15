import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const OUTPUT_DIR = path.join(process.cwd(), 'public/images/mysti/tarot');

const ARCANA = [
  { name: 'The Emperor', roman: 'IV', keyword: '权威 · 秩序 · 结构' },
  { name: 'The Empress', roman: 'III', keyword: '孕育 · 保护 · 奉献' },
  { name: 'The Lovers', roman: 'VI', keyword: '合一 · 依恋 · 迷失' },
  { name: 'The Hermit', roman: 'IX', keyword: '孤独 · 自足 · 清醒' },
  { name: 'The Fool', roman: '0', keyword: '表演 · 即兴 · 混沌' },
  { name: 'The Magician', roman: 'I', keyword: '表达 · 传播 · 显化' },
  { name: 'The Chariot', roman: 'VII', keyword: '冲动 · 放纵 · 失控' },
  { name: 'Justice', roman: 'XI', keyword: '叛逆 · 质疑 · 衡平' },
  { name: 'Judgement', roman: 'XX', keyword: '爆发 · 真相 · 冲击' },
  { name: 'The Devil', roman: 'XV', keyword: '沉溺 · 诱惑 · 权力' },
  { name: 'Strength', roman: 'VIII', keyword: '欲望 · 享受 · 驯服' },
  { name: 'Temperance', roman: 'XIV', keyword: '躺平 · 消解 · 无为' },
  { name: 'The Star', roman: 'XVII', keyword: '沉睡 · 梦境 · 疗愈' },
  { name: 'Wheel of Fortune', roman: 'X', keyword: '松弛 · 机遇 · 流动' },
  { name: 'The Sun', roman: 'XIX', keyword: '光明 · 幸运 · 照耀' },
  { name: 'The High Priestess', roman: 'II', keyword: '直觉 · 情绪 · 深渊' },
  { name: 'The Hanged Man', roman: 'XII', keyword: '放手 · 臣服 · 新视角' },
];

const SLUG_MAP = {
  boss: 'The Emperor',
  ctrl: 'The Emperor',
  'oh-no': 'The Emperor',
  'thin-k': 'The Emperor',
  mum: 'The Empress',
  simp: 'The Empress',
  'atm-er': 'The Empress',
  'than-k': 'The Empress',
  'love-r': 'The Lovers',
  solo: 'The Hermit',
  nerd: 'The Hermit',
  shy: 'The Hermit',
  drama: 'The Fool',
  party: 'The Fool',
  joker: 'The Fool',
  'talk-er': 'The Magician',
  drunk: 'The Chariot',
  rebel: 'Justice',
  woc: 'Judgement',
  'game-r': 'The Devil',
  sexy: 'The Devil',
  fake: 'The Devil',
  'food-ie': 'Strength',
  malo: 'Temperance',
  sleep: 'The Star',
  chill: 'Wheel of Fortune',
  'luck-y': 'The Sun',
  emo: 'The High Priestess',
  'dior-s': 'The Hanged Man',
};

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function createSvg({ name, roman, keyword }) {
  const safeName = escapeXml(name);
  const safeKeyword = escapeXml(keyword);
  const safeRoman = escapeXml(roman);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="540" height="810" viewBox="0 0 540 810">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#12152B"/>
      <stop offset="100%" stop-color="#1A1E3D"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="540" height="810" fill="url(#bgGrad)" rx="12" ry="12"/>
  
  <!-- Decorative border -->
  <rect x="20" y="20" width="500" height="770" fill="none" stroke="#C9A86C" stroke-width="2" rx="8" ry="8" opacity="0.6"/>
  <rect x="30" y="30" width="480" height="750" fill="none" stroke="#C9A86C" stroke-width="1" rx="6" ry="6" opacity="0.3"/>
  
  <!-- Top ornament -->
  <circle cx="270" cy="110" r="40" fill="none" stroke="#C9A86C" stroke-width="1.5" opacity="0.4"/>
  <text x="270" y="122" font-size="32" fill="#C9A86C" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="400" opacity="0.9">${safeRoman}</text>
  
  <!-- Divider lines -->
  <line x1="170" y1="170" x2="370" y2="170" stroke="#C9A86C" stroke-width="1" opacity="0.4"/>
  <line x1="170" y1="640" x2="370" y2="640" stroke="#C9A86C" stroke-width="1" opacity="0.4"/>
  
  <!-- English title -->
  <text x="270" y="360" font-size="42" fill="#C9A86C" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="500" letter-spacing="1">${safeName}</text>
  
  <!-- Chinese keyword -->
  <text x="270" y="420" font-size="24" fill="#C9A86C" text-anchor="middle" font-family="'Arial Unicode MS', 'STHeiti', 'Hiragino Sans GB', sans-serif" font-weight="300" opacity="0.9">${safeKeyword}</text>
  
  <!-- Bottom text -->
  <text x="270" y="720" font-size="14" fill="#C9A86C" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" opacity="0.5" letter-spacing="2">MYSTI TAROT</text>
</svg>`;
}

async function generateCard(arcana) {
  const svg = createSvg(arcana);
  const buffer = Buffer.from(svg, 'utf-8');
  const fileName = `${arcana.name.toLowerCase().replace(/\s+/g, '-')}.png`;
  const filePath = path.join(OUTPUT_DIR, fileName);

  await sharp(buffer)
    .resize(540, 810, { fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toFile(filePath);

  console.log(`  Generated: ${fileName}`);
  return fileName;
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  console.log('Generating 22 Major Arcana placeholder cards...');
  const generated = new Map();

  for (const arcana of ARCANA) {
    const fileName = await generateCard(arcana);
    generated.set(arcana.name, fileName);
  }

  console.log('\nCopying to 29 WTFTI slug files...');
  for (const [slug, arcanaName] of Object.entries(SLUG_MAP)) {
    const sourceName = generated.get(arcanaName);
    const sourcePath = path.join(OUTPUT_DIR, sourceName);
    const destPath = path.join(OUTPUT_DIR, `${slug}.png`);

    await fs.copyFile(sourcePath, destPath);
    console.log(`  ${slug}.png -> ${sourceName}`);
  }

  console.log('\nDone! All placeholder images are ready in public/images/mysti/tarot/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
