/**
 * Brand themes for `<PremiumPaywall>` — the subset of theme tokens needed
 * to render the locked overlay consistently across modules without dragging
 * MystiThemeProvider into non-mysti pages.
 *
 * Mysti keeps using its dynamic theme via `MystiPaywall` (the existing
 * thin wrapper). All other brands map to a static editorial palette aligned
 * with the main site (Editorial Atelier × 玫瑰陶土 × 金箔).
 */

export type PaywallBrand =
  | 'mysti'
  | 'wtfti'
  | 'soulti'
  | 'cpti'
  | 'xpti'
  | 'wtfcard';

/** Subset of MystiThemeV2 that the paywall UI actually consumes */
export interface PaywallTheme {
  bg: string;
  bgGradientEnd: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  accent: string;
  accentSoft: string;
  accentGold: string;
  cardSurface: string;
  cardBorder: string;
  cardGlow: string;
  ctaGradientFrom: string;
  ctaGradientTo: string;
}

/**
 * Aurora-style light theme (cream paper + rose-clay + gold-leaf) used by the
 * five non-mysti brands. Differences are kept minimal — only the accent hue
 * shifts to give each module a subtle identity.
 */
function aurora(accent: string, accentDeep: string): PaywallTheme {
  return {
    bg: '#FAF8F5',
    bgGradientEnd: '#F3EEE6',
    text: '#1F1A16',
    textMuted: '#5B524B',
    textSubtle: '#9A908A',
    accent,
    accentSoft: hexAlpha(accent, 0.18),
    accentGold: '#C9A676',
    cardSurface: '#FFFDF9',
    cardBorder: hexAlpha(accent, 0.28),
    cardGlow: hexAlpha(accent, 0.22),
    ctaGradientFrom: accent,
    ctaGradientTo: accentDeep,
  };
}

/** Append hex opacity (0..1) to a `#RRGGBB` string */
function hexAlpha(hex: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  const aa = Math.round(a * 255).toString(16).padStart(2, '0');
  return `${hex}${aa}`;
}

/**
 * Brand → theme mapping. Mysti is intentionally absent here; the
 * `<MystiPaywall>` wrapper still injects its dynamic v2 theme.
 */
export const BRAND_THEMES: Record<Exclude<PaywallBrand, 'mysti'>, PaywallTheme> = {
  // 玫瑰陶土主线
  wtfti: aurora('#C07A8E', '#A85A6E'),
  // 同主线（SoulTI 与 WTFTI 共享主品牌）
  soulti: aurora('#C07A8E', '#A85A6E'),
  // 关系模块偏深玫红
  cpti: aurora('#B85A78', '#9C3F60'),
  // 亲密模块偏暮紫（仍走亮底）
  xpti: aurora('#8B7AD9', '#6F5BC2'),
  // 收藏卡偏金
  wtfcard: aurora('#C9A676', '#A88A5A'),
};

export const BRAND_LABEL: Record<PaywallBrand, string> = {
  mysti: '灵鉴 Mysti',
  wtfti: 'WTFTI 神域',
  soulti: 'SoulTI 灵魂镜像',
  cpti: 'CPTI 关系深测',
  xpti: 'XPTI 恋爱 XP',
  wtfcard: 'WTF Card 多宇宙档案',
};
