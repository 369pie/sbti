import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'images', 'mysti');
mkdirSync(outDir, { recursive: true });

const W = 1200;
const H = 630;

const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Radial glow behind title -->
    <radialGradient id="glow" cx="50%" cy="48%" r="45%">
      <stop offset="0%" stop-color="#7B61FF" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="#7B61FF" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#0B0D17" stop-opacity="0"/>
    </radialGradient>
    <!-- Secondary warm glow -->
    <radialGradient id="glow2" cx="50%" cy="52%" r="55%">
      <stop offset="0%" stop-color="#C9A86C" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#0B0D17" stop-opacity="0"/>
    </radialGradient>
    <!-- Top/bottom vignette -->
    <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0B0D17" stop-opacity="0.6"/>
      <stop offset="20%" stop-color="#0B0D17" stop-opacity="0"/>
      <stop offset="80%" stop-color="#0B0D17" stop-opacity="0"/>
      <stop offset="100%" stop-color="#0B0D17" stop-opacity="0.7"/>
    </linearGradient>
    <!-- Star glow filter -->
    <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <!-- Text glow -->
    <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <!-- Gold text glow -->
    <filter id="goldGlow" x="-15%" y="-15%" width="130%" height="130%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <!-- Decorative line gradient -->
    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#C9A86C" stop-opacity="0"/>
      <stop offset="50%" stop-color="#C9A86C" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#C9A86C" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="#0B0D17"/>

  <!-- Subtle grid pattern -->
  <g opacity="0.04" stroke="#7B61FF" stroke-width="0.5" fill="none">
    ${Array.from({ length: 25 }, (_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="${H}"/>`).join('\n    ')}
    ${Array.from({ length: 14 }, (_, i) => `<line x1="0" y1="${i * 50}" x2="${W}" y2="${i * 50}"/>`).join('\n    ')}
  </g>

  <!-- Radial glows -->
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>

  <!-- Corner stars (✦ decorative elements) -->
  <g filter="url(#starGlow)">
    <!-- Top-left cluster -->
    <text x="80" y="90" font-size="28" fill="#C9A86C" opacity="0.7" font-family="serif">✦</text>
    <text x="120" y="130" font-size="16" fill="#7B61FF" opacity="0.5" font-family="serif">✦</text>
    <text x="55" y="145" font-size="10" fill="#C9A86C" opacity="0.35" font-family="serif">✦</text>

    <!-- Top-right cluster -->
    <text x="1100" y="85" font-size="24" fill="#C9A86C" opacity="0.65" font-family="serif">✦</text>
    <text x="1060" y="120" font-size="14" fill="#7B61FF" opacity="0.45" font-family="serif">✦</text>
    <text x="1130" y="140" font-size="10" fill="#C9A86C" opacity="0.3" font-family="serif">✦</text>

    <!-- Bottom-left cluster -->
    <text x="90" y="540" font-size="22" fill="#7B61FF" opacity="0.55" font-family="serif">✦</text>
    <text x="130" y="570" font-size="12" fill="#C9A86C" opacity="0.4" font-family="serif">✦</text>

    <!-- Bottom-right cluster -->
    <text x="1090" y="535" font-size="26" fill="#C9A86C" opacity="0.6" font-family="serif">✦</text>
    <text x="1130" y="565" font-size="14" fill="#7B61FF" opacity="0.4" font-family="serif">✦</text>

    <!-- Scattered mid-stars -->
    <text x="200" y="300" font-size="8" fill="#C9A86C" opacity="0.2" font-family="serif">✦</text>
    <text x="980" y="280" font-size="10" fill="#7B61FF" opacity="0.25" font-family="serif">✦</text>
    <text x="650" y="100" font-size="9" fill="#C9A86C" opacity="0.2" font-family="serif">✦</text>
    <text x="700" y="540" font-size="8" fill="#7B61FF" opacity="0.2" font-family="serif">✦</text>
    <text x="350" y="450" font-size="7" fill="#C9A86C" opacity="0.15" font-family="serif">✦</text>
    <text x="850" y="470" font-size="7" fill="#7B61FF" opacity="0.15" font-family="serif">✦</text>
  </g>

  <!-- Subtle circular mandala hint (mystical decoration) -->
  <circle cx="${W/2}" cy="${H/2}" r="180" fill="none" stroke="#C9A86C" stroke-width="0.5" opacity="0.08"/>
  <circle cx="${W/2}" cy="${H/2}" r="220" fill="none" stroke="#7B61FF" stroke-width="0.5" opacity="0.06"/>
  <circle cx="${W/2}" cy="${H/2}" r="260" fill="none" stroke="#C9A86C" stroke-width="0.3" opacity="0.04"/>

  <!-- Diamond/rhombus decoration -->
  <g transform="translate(${W/2}, ${H/2 - 120})" opacity="0.15" fill="none" stroke="#C9A86C" stroke-width="0.8">
    <polygon points="0,-25 15,0 0,25 -15,0"/>
    <polygon points="0,-18 10,0 0,18 -10,0" opacity="0.5"/>
  </g>

  <!-- Decorative horizontal lines -->
  <line x1="350" y1="230" x2="850" y2="230" stroke="url(#lineGrad)" stroke-width="0.8"/>
  <line x1="380" y1="420" x2="820" y2="420" stroke="url(#lineGrad)" stroke-width="0.8"/>

  <!-- Small decorative dots along lines -->
  <circle cx="350" cy="230" r="2" fill="#C9A86C" opacity="0.4"/>
  <circle cx="850" cy="230" r="2" fill="#C9A86C" opacity="0.4"/>
  <circle cx="380" cy="420" r="2" fill="#C9A86C" opacity="0.4"/>
  <circle cx="820" cy="420" r="2" fill="#C9A86C" opacity="0.4"/>

  <!-- Title: WTFTI · 灵鉴 -->
  <text x="${W/2}" y="${H/2 - 10}"
        text-anchor="middle"
        font-family="'Georgia', 'Noto Serif SC', 'Songti SC', serif"
        font-size="72"
        font-weight="700"
        fill="#F3EFE6"
        letter-spacing="8"
        filter="url(#textGlow)">WTFTI · 灵鉴</text>

  <!-- Subtitle: 用塔罗重新翻译你的人格 -->
  <text x="${W/2}" y="${H/2 + 55}"
        text-anchor="middle"
        font-family="'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif"
        font-size="28"
        fill="#C9A86C"
        letter-spacing="4"
        opacity="0.9"
        filter="url(#goldGlow)">用塔罗重新翻译你的人格</text>

  <!-- Small branding line -->
  <text x="${W/2}" y="${H/2 + 100}"
        text-anchor="middle"
        font-family="'Georgia', serif"
        font-size="14"
        fill="#A7B0C8"
        letter-spacing="6"
        opacity="0.4">✦  TAROT × MBTI  ✦</text>
</svg>
`;

const outPath = join(outDir, 'og-default.png');
await sharp(Buffer.from(svg)).png({ quality: 95 }).toFile(outPath);
console.log('Generated:', outPath);
