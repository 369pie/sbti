/**
 * mysti · Sigil 灵魂印记 SVG 生成器（W2-W3 / E2）
 *
 * 输入：用户的近期决策档案 + 主神 slug → 输出一张 SVG 字符串
 * 设计原则：
 *  - 暮光博物馆色调（玫瑰陶土 / 金箔 / 暮紫）
 *  - 椭圆轨道环 + 罗马数字章节徽章 + 散点星屑（与品牌词汇统一）
 *  - 纯函数 / SSR-safe / 无 DOM / 不依赖 framer
 *  - 同一 seed 必然产出同一图像（决定性，可截屏复现）
 */

import type { DecisionLogEntry } from './decision-log';
import type { DecisionStance } from './decision-quotes';

export interface SigilTokens {
  /** 主色（玫瑰陶土） */
  rose: string;
  /** 次色（金箔） */
  gold: string;
  /** 暗面（暮紫） */
  dusk: string;
  /** 背景渐变两端 */
  bgFrom: string;
  bgTo: string;
}

export const DEFAULT_SIGIL_TOKENS: SigilTokens = {
  rose: '#C07A8E',
  gold: '#C9A676',
  dusk: '#9C7CFF',
  bgFrom: '#1a1530',
  bgTo: '#2a1f3d',
};

const STANCE_HUE: Record<DecisionStance, string> = {
  go: '#C07A8E',
  wait: '#9C7CFF',
  flow: '#C9A676',
};

/** 决定性的小整数哈希（djb2 变体），保证 seed → 图像可复现 */
function hashSeed(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** seeded PRNG（Mulberry32）— 同一 seed 同一序列 */
function mulberry32(seedInt: number): () => number {
  let s = seedInt >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SigilInput {
  /** 用户近期决策（取前 N 条，默认 12） */
  decisions: DecisionLogEntry[];
  /** 主神 slug（决定中央纹章字母） */
  deitySlug?: string;
  /** 自定义 token（不传走 default） */
  tokens?: Partial<SigilTokens>;
  /** 画布尺寸（默认 480） */
  size?: number;
}

export interface SigilOutput {
  svg: string;
  /** 中央罗马数字（章节序号；按决策数取 I-V 循环） */
  numeral: string;
  /** 决定性 seed（可写入分享 URL，用于复现） */
  seed: number;
  /** 该印记的稀有度（0-100，给「灵魂深度」分数用） */
  rarity: number;
}

const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

/** 主入口：纯函数 SVG 生成 */
export function generateSigil(input: SigilInput): SigilOutput {
  const tokens: SigilTokens = { ...DEFAULT_SIGIL_TOKENS, ...(input.tokens ?? {}) };
  const size = input.size ?? 480;
  const cx = size / 2;
  const cy = size / 2;

  const decisions = input.decisions.slice(0, 12);
  const seedKey = `${input.deitySlug ?? 'mysti'}::${decisions.map((d) => d.id).join('|')}::${decisions.length}`;
  const seed = hashSeed(seedKey);
  const rng = mulberry32(seed || 1);

  // 章节序号：决策条数 % 12，1 开始
  const numeral = NUMERALS[Math.max(0, decisions.length % 12)] ?? 'I';

  // 三个椭圆轨道环（旋转角随 seed）
  const rings = [0, 1, 2].map((i) => {
    const rx = size * (0.34 + i * 0.06);
    const ry = size * (0.22 + i * 0.05);
    const rot = (seed + i * 47) % 180;
    const opacity = (0.55 - i * 0.12).toFixed(2);
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${tokens.gold}" stroke-width="${0.7 - i * 0.15}" stroke-opacity="${opacity}" transform="rotate(${rot} ${cx} ${cy})" />`;
  });

  // 决策点：每条决策投射成轨道上的一颗光点（颜色 = stance hue）
  const dots = decisions.map((d, idx) => {
    const angle = (idx / Math.max(1, decisions.length)) * Math.PI * 2 + (seed % 360) * (Math.PI / 180);
    const ring = idx % 3;
    const rx = size * (0.34 + ring * 0.06);
    const ry = size * (0.22 + ring * 0.05);
    const x = cx + Math.cos(angle) * rx;
    const y = cy + Math.sin(angle) * ry;
    const hue = STANCE_HUE[d.stance] ?? tokens.rose;
    const r = 3.5 + rng() * 2.5;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${hue}" fill-opacity="0.85" />`;
  });

  // 散点星屑（背景）
  const starCount = 18 + Math.floor(rng() * 10);
  const stars = Array.from({ length: starCount }, () => {
    const x = rng() * size;
    const y = rng() * size;
    const r = 0.6 + rng() * 1.1;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${tokens.gold}" fill-opacity="${(0.25 + rng() * 0.45).toFixed(2)}" />`;
  });

  // 中心 orb（双层 radial）
  const orb = `
    <circle cx="${cx}" cy="${cy}" r="${size * 0.13}" fill="url(#sigil-orb-${seed})" />
    <circle cx="${cx}" cy="${cy}" r="${size * 0.05}" fill="${tokens.gold}" fill-opacity="0.85" />
  `;

  // 中央罗马数字
  const fontSize = size * 0.085;
  const numeralText = `<text x="${cx}" y="${cy + fontSize * 0.35}" text-anchor="middle" font-family="Cormorant Garamond, Noto Serif SC, serif" font-style="italic" font-size="${fontSize}" fill="${tokens.bgFrom}" font-weight="500">${numeral}</text>`;

  // 边框分割线（顶 / 底）
  const divider = `
    <line x1="${size * 0.18}" y1="${size * 0.92}" x2="${size * 0.82}" y2="${size * 0.92}" stroke="${tokens.gold}" stroke-width="0.6" stroke-opacity="0.55" />
    <text x="${cx}" y="${size * 0.97}" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="${size * 0.022}" letter-spacing="${size * 0.012}" fill="${tokens.gold}" fill-opacity="0.7">WTFTI · MYSTI · SIGIL</text>
  `;

  // 稀有度：决策数 + 主神匹配 + stance 多样性
  const stanceVariety = new Set(decisions.map((d) => d.stance)).size; // 1..3
  const rarity = Math.min(100, Math.round(decisions.length * 6 + stanceVariety * 10 + (input.deitySlug ? 8 : 0)));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="灵魂印记 ${numeral}">
  <defs>
    <radialGradient id="sigil-bg-${seed}" cx="50%" cy="48%" r="65%">
      <stop offset="0%" stop-color="${tokens.bgTo}" />
      <stop offset="100%" stop-color="${tokens.bgFrom}" />
    </radialGradient>
    <radialGradient id="sigil-orb-${seed}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${tokens.rose}" stop-opacity="0.95" />
      <stop offset="60%" stop-color="${tokens.dusk}" stop-opacity="0.55" />
      <stop offset="100%" stop-color="${tokens.bgFrom}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#sigil-bg-${seed})" rx="${size * 0.04}" />
  ${stars.join('\n  ')}
  ${rings.join('\n  ')}
  ${orb}
  ${dots.join('\n  ')}
  ${numeralText}
  ${divider}
</svg>`.trim();

  return { svg, numeral, seed, rarity };
}

/** 从 svg 字符串构造 data URL（用于 <img src> 或下载） */
export function sigilToDataUrl(svg: string): string {
  // 不用 btoa（中文/特殊字符不安全），直接做 utf8 url-encode
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}
