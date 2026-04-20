/**
 * WTFTI · Soul Sigil 程序生成器
 *
 * 输入用户的 GalaxyResult，输出唯一的 SVG 几何符号：
 * [外层] 椭圆轨道环（W 轴极性 → 椭圆离心率）
 * [二层] 6 角星（T 轴 → 旋转角度）
 * [三层] 神圣几何（F 轴 → 三角/方/圆）
 * [四层] 三色光晕（玫瑰/金/紫 — 由轴权重混合）
 * [中心] 主神 sigil 字符（8 选 1）
 * [外圈] 12 道月相刻度（按当日日期偏转）
 *
 * 战略文档：docs/01-strategy/wtfti-pantheon-soul-resonance-2026-04-19.md §6
 *
 * 纯函数 / 0 依赖 / SVG string output，可在 server 也可在 client 渲染。
 */

import type { GalaxyResult } from './galaxy-types';
import { getDeity } from './pantheon';

const ROSE = '#C07A8E';
const GOLD = '#C9A676';
const PURPLE = '#9C7CFF';
const TWILIGHT = '#1a1530';
const CREAM = '#F5F0E8';

export interface SigilSvgOptions {
  size?: number;
  /** 用于背景 — null 表示透明 */
  background?: string | null;
  /** 用于壁纸导出时关掉白底，保留主色调 */
  wallpaper?: boolean;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function todayDayOfYear(): number {
  const d = new Date();
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 0));
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

/**
 * 主入口：生成 SVG 字符串
 */
export function generateSoulSigilSvg(
  galaxy: GalaxyResult,
  opts: SigilSvgOptions = {},
): string {
  const size = opts.size ?? 480;
  const cx = size / 2;
  const cy = size / 2;
  const bg = opts.background ?? (opts.wallpaper ? TWILIGHT : null);

  const ax = galaxy.homePlanet.axesVector;
  const W = clamp(ax.W ?? 0, -3, 3);
  const T = clamp(ax.T ?? 0, -3, 3);
  const F = clamp(ax.F ?? 0, -3, 3);
  const I = clamp(ax.I ?? 0, -3, 3);

  const deity = getDeity(galaxy.homePlanet.slug);
  const glyph = deity?.sigilGlyph ?? '✦';

  // ─── 外层椭圆轨道环（离心率 ∝ |W| / 3） ───
  const eccentricity = Math.abs(W) / 3; // 0..1
  const rx = size * 0.45;
  const ry = rx * (1 - eccentricity * 0.4); // 0.6..1.0 比例

  // ─── 6 角星（旋转角度 ∝ T） ───
  const sixStarRotation = (T / 3) * 30; // -30..+30 度
  const sixStarRadius = size * 0.32;

  // ─── 神圣几何（F 轴选形） ───
  // F<-1: 三角  -1<=F<=1: 圆  F>1: 方
  type Shape = 'triangle' | 'circle' | 'square';
  const sacredShape: Shape = F < -1 ? 'triangle' : F > 1 ? 'square' : 'circle';
  const sacredRadius = size * 0.21;

  // ─── 三色光晕权重 ───
  // I 主导紫；T 主导金；W 主导玫瑰
  const wRose = clamp((Math.abs(W) + 0.5) / 4, 0.15, 0.65);
  const wGold = clamp((Math.abs(T) + 0.5) / 4, 0.15, 0.65);
  const wPurple = clamp((Math.abs(I) + 0.5) / 4, 0.15, 0.65);
  const wSum = wRose + wGold + wPurple;
  const nRose = wRose / wSum;
  const nGold = wGold / wSum;
  const nPurple = wPurple / wSum;

  // ─── 12 道月相刻度（按当日偏转） ───
  const dayOffset = (todayDayOfYear() / 365) * 360;
  const ticks: string[] = [];
  for (let i = 0; i < 12; i += 1) {
    const ang = ((i * 30 + dayOffset) * Math.PI) / 180;
    const r1 = size * 0.47;
    const r2 = size * 0.49;
    const x1 = cx + Math.cos(ang) * r1;
    const y1 = cy + Math.sin(ang) * r1;
    const x2 = cx + Math.cos(ang) * r2;
    const y2 = cy + Math.sin(ang) * r2;
    ticks.push(
      `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(
        2,
      )}" y2="${y2.toFixed(2)}" stroke="${GOLD}" stroke-opacity="0.55" stroke-width="${
        i % 3 === 0 ? 1.6 : 0.7
      }" />`,
    );
  }

  // ─── 6 角星路径 ───
  const star: string[] = [];
  for (let i = 0; i < 12; i += 1) {
    const isOuter = i % 2 === 0;
    const r = isOuter ? sixStarRadius : sixStarRadius * 0.45;
    const ang = ((i * 30 + sixStarRotation) * Math.PI) / 180;
    const x = cx + Math.cos(ang - Math.PI / 2) * r;
    const y = cy + Math.sin(ang - Math.PI / 2) * r;
    star.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  star.push('Z');

  // ─── 神圣几何路径 ───
  let sacredEl = '';
  if (sacredShape === 'triangle') {
    const pts: string[] = [];
    for (let i = 0; i < 3; i += 1) {
      const ang = ((i * 120 - 90) * Math.PI) / 180;
      pts.push(
        `${(cx + Math.cos(ang) * sacredRadius).toFixed(2)},${(
          cy + Math.sin(ang) * sacredRadius
        ).toFixed(2)}`,
      );
    }
    sacredEl = `<polygon points="${pts.join(' ')}" fill="none" stroke="${CREAM}" stroke-opacity="0.85" stroke-width="1.2" />`;
  } else if (sacredShape === 'square') {
    const r = sacredRadius / Math.SQRT2;
    sacredEl = `<rect x="${(cx - r).toFixed(2)}" y="${(cy - r).toFixed(
      2,
    )}" width="${(r * 2).toFixed(2)}" height="${(r * 2).toFixed(
      2,
    )}" fill="none" stroke="${CREAM}" stroke-opacity="0.85" stroke-width="1.2" transform="rotate(45 ${cx} ${cy})" />`;
  } else {
    sacredEl = `<circle cx="${cx}" cy="${cy}" r="${sacredRadius.toFixed(
      2,
    )}" fill="none" stroke="${CREAM}" stroke-opacity="0.85" stroke-width="1.2" />`;
  }

  // ─── 三色光晕 (radial gradients) ───
  const gradientId = 'sigil-halo-' + Math.abs(hashStr(galaxy.homePlanet.slug)).toString(36);
  const haloDefs = `
    <defs>
      <radialGradient id="${gradientId}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${ROSE}" stop-opacity="${(nRose * 0.55).toFixed(3)}" />
        <stop offset="55%" stop-color="${GOLD}" stop-opacity="${(nGold * 0.35).toFixed(3)}" />
        <stop offset="100%" stop-color="${PURPLE}" stop-opacity="${(nPurple * 0.25).toFixed(
          3,
        )}" />
      </radialGradient>
    </defs>
  `;

  const halo = `<circle cx="${cx}" cy="${cy}" r="${(size * 0.45).toFixed(
    2,
  )}" fill="url(#${gradientId})" />`;

  // ─── 中心 sigil 字符 ───
  const centerGlyph = `
    <text x="${cx}" y="${cy + size * 0.045}" text-anchor="middle"
          font-family="Cormorant Garamond, Noto Serif SC, serif"
          font-size="${(size * 0.18).toFixed(0)}"
          font-weight="500"
          fill="${GOLD}"
          letter-spacing="0">${escapeXml(glyph)}</text>
  `;

  // ─── 椭圆轨道 ───
  const orbit = `<ellipse cx="${cx}" cy="${cy}" rx="${rx.toFixed(
    2,
  )}" ry="${ry.toFixed(
    2,
  )}" fill="none" stroke="${GOLD}" stroke-opacity="0.5" stroke-width="0.9" transform="rotate(${(
    (W * 8).toFixed(1)
  )} ${cx} ${cy})" />`;

  const background = bg
    ? `<rect width="${size}" height="${size}" fill="${bg}" />`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="灵魂印记 sigil">
    ${haloDefs}
    ${background}
    ${halo}
    ${orbit}
    ${ticks.join('')}
    <path d="${star.join(' ')}" fill="none" stroke="${ROSE}" stroke-opacity="0.9" stroke-width="1.1" />
    ${sacredEl}
    ${centerGlyph}
  </svg>`.replace(/\n\s*/g, '');
}

/** 短字符串：4 个 sigil 单字符的拼接（截屏话术用） */
export function generateSoulSigilString(galaxy: GalaxyResult): string {
  const ax = galaxy.homePlanet.axesVector;
  const T = ax.T ?? 0;
  const F = ax.F ?? 0;
  const deity = getDeity(galaxy.homePlanet.slug);
  const center = deity?.sigilGlyph ?? '✦';
  const star6 = T > 0 ? '✦' : '✺';
  const sacred = F < -1 ? '△' : F > 1 ? '□' : '○';
  return `${center}${star6}${sacred}`;
}

// ───────────────────────── helpers ─────────────────────────

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}
