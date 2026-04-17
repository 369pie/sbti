/**
 * Mysti v2 主题系统 — 与 WTFTI 主品牌（老钱米 / Editorial Atelier）共享色彩家族
 *
 * 设计原则：
 * 1. 玫瑰陶土 #C07A8E（主站 --color-rose）作为主 CTA，建立"我还在 WTFTI 内"的锚点
 * 2. 金箔 #C9A676（主站 --color-gold-leaf）作为神秘层副装饰
 * 3. 字体复用 v3 Editorial Feminine（Cormorant + Noto Serif SC）—— 已是全站默认
 * 4. 三套主题：twilight（默认/品牌桥梁）/ nocturne（深夜沉浸）/ aurora（晨光仪式）
 *
 * 旧 themes.ts 保留只为兼容，新代码请全部使用本文件。
 */

import type { MystiThemeV2, MystiThemeV2Id } from './types';

export const MYSTI_THEMES_V2: Record<MystiThemeV2Id, MystiThemeV2> = {
  /**
   * 暮光（默认）— 紫黑底 + 玫瑰陶土主色 + 金箔副色
   * 与主站 cream paper 形成"夜晚 vs 白昼"的对话，但通过共享 rose / gold-leaf 保持品牌延续性
   */
  twilight: {
    id: 'twilight',
    label: '暮光',
    description: '主站玫瑰金的夜间倒影 — 默认主题，最大化品牌一致性',

    // 背景：从墨紫渐到深蓝紫，比 nocturne 柔和、比 cream 神秘
    bg: '#1a1530',
    bgGradient: ['#1a1530', '#231A3A'],

    // 文字：暖白带紫调，呼应主站 #1F1A16 的"温度感"
    text: '#F5F0E8',
    textMuted: '#B8AEC2',
    textSubtle: '#8A7E96',

    // 主强调：玫瑰陶土（主站 --color-rose），CTA / 关键链接
    accent: '#C07A8E',
    accentSoft: 'rgba(192, 122, 142, 0.20)',
    accentDeep: '#A85A6E',

    // 副强调：金箔（主站 --color-gold-leaf），神秘装饰 / 塔罗牌边框
    accentGold: '#C9A676',
    accentGoldSoft: 'rgba(201, 166, 118, 0.18)',

    // 卡牌容器
    cardSurface: '#251A3A',
    cardSurfaceElevated: '#2D2147',
    cardBorder: 'rgba(192, 122, 142, 0.30)',
    cardBorderStrong: 'rgba(192, 122, 142, 0.45)',
    cardGlow: 'rgba(192, 122, 142, 0.18)',
    cardGradient: ['#251A3A', '#1F1530'],

    // 分隔线
    divider: 'rgba(245, 240, 232, 0.10)',
    dividerAccent: 'rgba(201, 166, 118, 0.30)',

    // CTA 按钮：玫瑰陶土主色 → 玫瑰陶土深色（不再是 purple→gold 渐变）
    ctaGradientFrom: '#C07A8E',
    ctaGradientTo: '#A85A6E',

    // 塔罗牌资源目录
    // TODO[mysti-v2-images]: v2/ 资源生成完成后改为 'v2/' 切换到人格化塔罗卡
    // 生成命令: node scripts/generate-type-images.mjs mysti-tarot
    tarotDir: '',
    isDark: true,
  },

  /**
   * 深夜（沉浸）— 22:00-6:00 自动切换；金色为主，最深沉的塔罗仪式感
   * 即原 celestial 主题，保留以兼容老用户偏好
   */
  nocturne: {
    id: 'nocturne',
    label: '深夜',
    description: '夜半的古老典籍 — 金色为主，22:00-6:00 自动启用',

    bg: '#0B0D17',
    bgGradient: ['#0B0D17', '#12152B'],

    text: '#F3EFE6',
    textMuted: '#A7B0C8',
    textSubtle: '#6B7390',

    accent: '#C9A676',
    accentSoft: 'rgba(201, 166, 118, 0.22)',
    accentDeep: '#A88A5A',

    accentGold: '#D4B58A',
    accentGoldSoft: 'rgba(212, 181, 138, 0.18)',

    cardSurface: '#12152B',
    cardSurfaceElevated: '#161A35',
    cardBorder: 'rgba(201, 166, 118, 0.35)',
    cardBorderStrong: 'rgba(201, 166, 118, 0.55)',
    cardGlow: 'rgba(123, 97, 255, 0.18)',
    cardGradient: ['#12152B', '#0F1122'],

    divider: 'rgba(243, 239, 230, 0.08)',
    dividerAccent: 'rgba(201, 166, 118, 0.32)',

    ctaGradientFrom: '#C9A676',
    ctaGradientTo: '#8B7AD9',

    // TODO[mysti-v2-images]: v2/ 资源生成完成后改为 'v2/'
    tarotDir: '',
    isDark: true,
  },

  /**
   * 晨光（仪式）— 米白底 + 玫瑰陶土，与主站 cream paper 完美一致
   * 适合白天浏览 / 每日翻牌 / 想截图发小红书时的"亮场景"
   */
  aurora: {
    id: 'aurora',
    label: '晨光',
    description: '清晨米色信纸 — 与主站 cream paper 完美一致，适合白天与小红书截图',

    bg: '#FAF8F5',
    bgGradient: ['#FAF8F5', '#F3EEE6'],

    text: '#1F1A16',
    textMuted: '#5B524B',
    textSubtle: '#9A908A',

    accent: '#C07A8E',
    accentSoft: 'rgba(192, 122, 142, 0.12)',
    accentDeep: '#A85A6E',

    accentGold: '#B8905A',
    accentGoldSoft: 'rgba(184, 144, 90, 0.14)',

    cardSurface: '#FFFDF9',
    cardSurfaceElevated: '#FFFFFF',
    cardBorder: 'rgba(207, 198, 187, 0.60)',
    cardBorderStrong: 'rgba(192, 122, 142, 0.40)',
    cardGlow: 'rgba(192, 122, 142, 0.10)',
    cardGradient: ['#FFFDF9', '#FAF8F5'],

    divider: 'rgba(31, 26, 22, 0.08)',
    dividerAccent: 'rgba(192, 122, 142, 0.25)',

    ctaGradientFrom: '#C07A8E',
    ctaGradientTo: '#A85A6E',

    tarotDir: 'pale/',
    isDark: false,
  },
};

export const MYSTI_THEME_V2_ORDER: MystiThemeV2Id[] = ['twilight', 'nocturne', 'aurora'];
export const MYSTI_THEME_V2_DEFAULT: MystiThemeV2Id = 'twilight';
export const MYSTI_THEME_V2_STORAGE_KEY = 'mysti-theme-v2';

/**
 * 22:00-6:00 自动深夜模式（用户偏好优先级最高）
 */
export function getAutoTimeTheme(date = new Date()): MystiThemeV2Id {
  const hour = date.getHours();
  if (hour >= 22 || hour < 6) return 'nocturne';
  if (hour >= 6 && hour < 11) return 'aurora';
  return 'twilight';
}

/**
 * 兼容层：将旧 celestial/pale 偏好平滑迁移到 v2
 */
export function migrateLegacyTheme(legacyId: string | null): MystiThemeV2Id {
  if (legacyId === 'pale') return 'aurora';
  if (legacyId === 'celestial') return 'nocturne';
  return MYSTI_THEME_V2_DEFAULT;
}
