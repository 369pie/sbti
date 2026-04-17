export interface MystiArcana {
  name: string;
  keywords: string[];
}

export interface MystiTarotData {
  majorArcana: MystiArcana;
  shadowArcana: MystiArcana;
  tagline: string;
  reading?: string;
  /** 2-3 sentence Shadow archetype narrative — the part of yourself you haven't claimed yet */
  shadowReading?: string;
  /** Brief explanation of why this personality maps to this Major Arcana */
  whyThisCard?: string;
}

export interface MystiTheme {
  id: 'celestial' | 'pale';
  label: string;
  bg: string;
  text: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  divider: string;
  cardSurface: string;
  cardBorder: string;
  cardGlow: string;
  gradientBg: string[];
  gradientCard: string[];
  ctaGradientFrom: string;
  ctaGradientTo: string;
  /** Subdirectory under /images/mysti/tarot/ (empty string for default) */
  tarotDir: string;
}

// ── v2 Theme System (与主站品牌色彩家族对齐) ──
export type MystiThemeV2Id = 'twilight' | 'nocturne' | 'aurora';

export interface MystiThemeV2 {
  id: MystiThemeV2Id;
  label: string;
  description: string;

  bg: string;
  bgGradient: [string, string];

  text: string;
  textMuted: string;
  textSubtle: string;

  /** 主强调色 — 用于 CTA、关键链接、品牌识别 */
  accent: string;
  accentSoft: string;
  accentDeep: string;

  /** 副强调色 — 神秘装饰、塔罗牌边框、二级强调 */
  accentGold: string;
  accentGoldSoft: string;

  cardSurface: string;
  cardSurfaceElevated: string;
  cardBorder: string;
  cardBorderStrong: string;
  cardGlow: string;
  cardGradient: [string, string];

  divider: string;
  dividerAccent: string;

  ctaGradientFrom: string;
  ctaGradientTo: string;

  tarotDir: string;
  /** 是否为暗色主题（影响图片/SVG 反色处理） */
  isDark: boolean;
}

export interface MystiShareImageGeneratorHandle {
  generate: () => void;
}

// ── Dual-mode relationship interpretation ──

export type RelationshipArchetypeId =
  | 'mirror'        // 同频共振 — 同组同频
  | 'complement'    // 天作之合 — 互补组（情感+控制, 表达+幸运, 敏感+独处等）
  | 'collision'     // 火花四射 — 对立张力组（控制+反叛, 表达+沉溺等）
  | 'nurture'       // 水土相生 — 滋养组（情感+任何, 幸运+敏感等）
  | 'resonance'     // 灵魂共鸣 — 深度同频（敏感+独处, 情感+敏感等）
  | 'growth'        // 破茧之力 — 成长组（控制+沉溺, 反叛+沉溺等）
  | 'harmony'       // 岁月静好 — 和谐组（幸运+躺平, 独处+躺平等）
  | 'friction'      // 虚空拉扯 — 摩擦组（沉溺+沉溺, 控制+控制等）
  | 'balance'       // 此消彼长 — 动态平衡（反叛+情感, 表达+独处等）
  | 'depth'         // 深海共振 — 深度组（敏感+沉溺, 情感+敏感等）
  | 'mystery';      // 命运暗线 — 特殊组合

export interface RelationshipArchetype {
  id: RelationshipArchetypeId;
  name: string;
  emoji: string;
  description: string;
}

export interface DualInterpretation {
  archetype: RelationshipArchetype;
  dynamics: string;
  conflict: string;
  advice: string;
  bondTagline: string;
}
