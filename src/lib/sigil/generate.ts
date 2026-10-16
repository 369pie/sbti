/**
 * Voice Sigil · W3 · E3.3
 *
 * 给「她」一个会随累计度数演化的印记。
 * 输入：稳定哈希（user_hash 或客户端匿名 hash）+ level（0..4）
 * 输出：一个确定性 SVG 字符串 / 一组绘制参数。
 *
 * 完全无依赖。可在 Server / Client / OG image 路由复用。
 *
 * level 触发节奏：第 1 / 7 / 27 / 81 / 243 句话点亮一层（共 5 层）。
 *   level 0 = 1 个轨道
 *   level 1 = 2 个轨道
 *   …
 *   level 4 = 5 个轨道
 *
 * 不显示进度条；不暴露总数。这是一个"被陪伴的痕迹"，不是 KPI。
 */

const PALETTES: Array<{ stroke: string; orbit: string; halo: string }> = [
  { stroke: '#C07A8E', orbit: 'rgba(192, 122, 142, 0.35)', halo: 'rgba(192, 122, 142, 0.18)' }, // 玫瑰
  { stroke: '#7A8A82', orbit: 'rgba(122, 138, 130, 0.32)', halo: 'rgba(122, 138, 130, 0.16)' }, // 鼠尾草
  { stroke: '#C9A676', orbit: 'rgba(201, 166, 118, 0.36)', halo: 'rgba(201, 166, 118, 0.20)' }, // 金箔
  { stroke: '#9C7CFF', orbit: 'rgba(156, 124, 255, 0.32)', halo: 'rgba(156, 124, 255, 0.18)' }, // 暗面紫
  { stroke: '#A0BEC8', orbit: 'rgba(160, 190, 200, 0.32)', halo: 'rgba(160, 190, 200, 0.18)' }, // 月白
  { stroke: '#7DB7B0', orbit: 'rgba(125, 183, 176, 0.34)', halo: 'rgba(125, 183, 176, 0.20)' }, // 极光青绿 aurora-veil
];

export type SigilMotif = 'editorial_seal' | 'seasonal_ring' | 'resonance_mark' | 'curator_mark';

const KNOWN_MOTIFS: readonly SigilMotif[] = ['editorial_seal', 'seasonal_ring', 'resonance_mark', 'curator_mark'];

export interface SigilParams {
  hash: string;
  level: 0 | 1 | 2 | 3 | 4;
  size?: number;
  motifs?: SigilMotif[];
}

interface SigilGeometry {
  size: number;
  cx: number;
  cy: number;
  paletteIndex: number;
  orbits: Array<{
    rx: number;
    ry: number;
    rotate: number;
    dotPhase: number;
  }>;
  coreRadius: number;
  romanNumeral: string;
  motifs: SigilMotif[];
}

export interface SigilDecorationGeometry {
  outerRadius: number;
  seal: { cx: number; cy: number; r: number };
  seasonalRadius: number;
  resonanceArc: { x1: number; y1: number; x2: number; y2: number; r: number };
  curator: { cx: number; cy: number; outer: number; inner: number };
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

function hashToInt(hash: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < hash.length; i++) {
    h = Math.imul(h ^ hash.charCodeAt(i), 16777619);
  }
  return Math.abs(h | 0);
}

export function normalizeSigilMotifs(motifs?: readonly string[] | null): SigilMotif[] {
  if (!motifs?.length) return [];
  const seen = new Set<SigilMotif>();
  for (const motif of motifs) {
    if ((KNOWN_MOTIFS as readonly string[]).includes(motif)) {
      seen.add(motif as SigilMotif);
    }
  }
  return Array.from(seen);
}

export function buildSigilGeometry({ hash, level, size = 96, motifs }: SigilParams): SigilGeometry {
  const safe = hash || 'anonymous';
  const cx = size / 2;
  const cy = size / 2;
  const paletteIndex = hashToInt(safe, 1) % PALETTES.length;
  const orbitCount = level + 1; // 1..5
  const baseR = size * 0.32;
  const step = (size * 0.16) / Math.max(orbitCount - 1, 1);
  const orbits = Array.from({ length: orbitCount }).map((_, i) => {
    const radius = i === 0 ? baseR : baseR + step * i;
    const eccentricity = 0.25 + (hashToInt(safe, 10 + i) % 100) / 600; // 0.25..0.41
    const rotate = (hashToInt(safe, 50 + i) % 180) - 90;
    const dotPhase = (hashToInt(safe, 100 + i) % 360) / 360;
    return {
      rx: radius,
      ry: radius * (1 - eccentricity),
      rotate,
      dotPhase,
    };
  });
  return {
    size,
    cx,
    cy,
    paletteIndex,
    orbits,
    coreRadius: size * 0.07,
    romanNumeral: ROMAN[Math.min(level, ROMAN.length - 1)],
    motifs: normalizeSigilMotifs(motifs),
  };
}

export function buildSigilDecorationGeometry(
  g: Pick<SigilGeometry, 'size' | 'cx' | 'cy' | 'orbits'>,
): SigilDecorationGeometry {
  const outerOrbit = g.orbits[g.orbits.length - 1];
  const outerRadius = Math.max(outerOrbit?.rx ?? g.size * 0.32, g.size * 0.32);
  return {
    outerRadius,
    seal: {
      cx: g.cx + outerRadius * 0.68,
      cy: g.cy - outerRadius * 0.62,
      r: g.size * 0.05,
    },
    seasonalRadius: outerRadius + g.size * 0.055,
    resonanceArc: {
      x1: g.cx - outerRadius * 0.84,
      y1: g.cy + outerRadius * 0.42,
      x2: g.cx - outerRadius * 0.52,
      y2: g.cy - outerRadius * 0.58,
      r: outerRadius * 0.92,
    },
    curator: {
      cx: g.cx - outerRadius * 0.7,
      cy: g.cy - outerRadius * 0.72,
      outer: g.size * 0.052,
      inner: g.size * 0.024,
    },
  };
}

function renderMotifMarkup(g: SigilGeometry, palette: (typeof PALETTES)[number]): string {
  if (g.motifs.length === 0) return '';
  const decoration = buildSigilDecorationGeometry(g);
  return g.motifs
    .map((motif) => {
      if (motif === 'editorial_seal') {
        return `
      <g opacity="0.96">
        <circle cx="${decoration.seal.cx.toFixed(2)}" cy="${decoration.seal.cy.toFixed(2)}" r="${decoration.seal.r.toFixed(2)}" fill="${palette.stroke}" />
        <circle cx="${decoration.seal.cx.toFixed(2)}" cy="${decoration.seal.cy.toFixed(2)}" r="${(decoration.seal.r * 0.42).toFixed(2)}" fill="#F5F0E8" />
      </g>`;
      }
      if (motif === 'seasonal_ring') {
        return `
      <circle cx="${g.cx}" cy="${g.cy}" r="${decoration.seasonalRadius.toFixed(2)}" fill="none" stroke="${palette.stroke}" stroke-width="0.9" stroke-dasharray="2.4 4.6" opacity="0.62" />`;
      }
      if (motif === 'resonance_mark') {
        return `
      <path d="M ${decoration.resonanceArc.x1.toFixed(2)} ${decoration.resonanceArc.y1.toFixed(2)} A ${decoration.resonanceArc.r.toFixed(2)} ${decoration.resonanceArc.r.toFixed(2)} 0 0 1 ${decoration.resonanceArc.x2.toFixed(2)} ${decoration.resonanceArc.y2.toFixed(2)}" fill="none" stroke="${palette.stroke}" stroke-width="1.6" stroke-linecap="round" opacity="0.85" />`;
      }
      return `
      <path d="M ${decoration.curator.cx.toFixed(2)} ${(decoration.curator.cy - decoration.curator.outer).toFixed(2)} L ${(decoration.curator.cx + decoration.curator.inner).toFixed(2)} ${(decoration.curator.cy - decoration.curator.inner).toFixed(2)} L ${(decoration.curator.cx + decoration.curator.outer).toFixed(2)} ${decoration.curator.cy.toFixed(2)} L ${(decoration.curator.cx + decoration.curator.inner).toFixed(2)} ${(decoration.curator.cy + decoration.curator.inner).toFixed(2)} L ${decoration.curator.cx.toFixed(2)} ${(decoration.curator.cy + decoration.curator.outer).toFixed(2)} L ${(decoration.curator.cx - decoration.curator.inner).toFixed(2)} ${(decoration.curator.cy + decoration.curator.inner).toFixed(2)} L ${(decoration.curator.cx - decoration.curator.outer).toFixed(2)} ${decoration.curator.cy.toFixed(2)} L ${(decoration.curator.cx - decoration.curator.inner).toFixed(2)} ${(decoration.curator.cy - decoration.curator.inner).toFixed(2)} Z" fill="none" stroke="${palette.stroke}" stroke-width="1.1" opacity="0.9" />`;
    })
    .join('');
}

/**
 * 渲染为 SVG 字符串（用于 OG / 邮件 / 静态导出场景）。
 * 客户端渲染请直接用 <VoiceSigilSVG /> 组件。
 */
export function renderSigilSvg(params: SigilParams): string {
  const g = buildSigilGeometry(params);
  const palette = PALETTES[g.paletteIndex];
  const orbits = g.orbits
    .map((o) => {
      const dotX = g.cx + o.rx * Math.cos(o.dotPhase * Math.PI * 2);
      const dotY = g.cy + o.ry * Math.sin(o.dotPhase * Math.PI * 2);
      return `
        <g transform="rotate(${o.rotate.toFixed(2)} ${g.cx} ${g.cy})">
          <ellipse cx="${g.cx}" cy="${g.cy}" rx="${o.rx.toFixed(2)}" ry="${o.ry.toFixed(2)}"
            fill="none" stroke="${palette.orbit}" stroke-width="0.8" />
          <circle cx="${dotX.toFixed(2)}" cy="${dotY.toFixed(2)}" r="1.6" fill="${palette.stroke}" />
        </g>`;
    })
    .join('');
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.size} ${g.size}" width="${g.size}" height="${g.size}" role="img" aria-label="Voice Sigil">
  <defs>
    <radialGradient id="sigil-halo-${g.paletteIndex}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${palette.halo}" />
      <stop offset="100%" stop-color="rgba(0,0,0,0)" />
    </radialGradient>
  </defs>
  <circle cx="${g.cx}" cy="${g.cy}" r="${g.size * 0.46}" fill="url(#sigil-halo-${g.paletteIndex})" />
  ${orbits}
  ${renderMotifMarkup(g, palette)}
  <circle cx="${g.cx}" cy="${g.cy}" r="${g.coreRadius}" fill="${palette.stroke}" opacity="0.92" />
  <text x="${g.cx}" y="${g.cy + g.size * 0.025}" font-family="serif" font-style="italic" font-size="${(g.size * 0.18).toFixed(2)}" fill="#F5F0E8" text-anchor="middle" dominant-baseline="middle">${g.romanNumeral}</text>
</svg>`.trim();
}

export const SIGIL_PALETTE_TOKENS = PALETTES;

// =====================================================================
// HER AURORA · W3 · Halo · 光环印
// =====================================================================
// Halo 是 Voice Sigil 在 HER AURORA 名下的平台级身份算名。
// 身体还是同一个确定性生成器，仅别名导出，使 业务代码以
// `renderHaloSvg / buildHaloGeometry / HaloParams` 词汇阅读，不再跳出 Sigil 语义。
// 不产生新的资产，不重复复制逻辑。
// =====================================================================
export type HaloParams = SigilParams;
export type HaloMotif = SigilMotif;
export const renderHaloSvg = renderSigilSvg;
export const buildHaloGeometry = buildSigilGeometry;
export const buildHaloDecorationGeometry = buildSigilDecorationGeometry;
export const normalizeHaloMotifs = normalizeSigilMotifs;
