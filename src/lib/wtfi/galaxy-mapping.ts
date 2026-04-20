/**
 * Personality slug → Home Planet slug 语义映射
 *
 * 替代 preview/page.tsx 里基于 seed 字符串哈希的随机选图。
 * 把 WTFTI 主测人格（30 个 slug）按"神域气质"归到 8 颗主神。
 * 目的：让仪式完成后用户看到的主神与 ta 刚做的测试有明确对应关系，
 * 而不是"同一个 slug 每次刷新挑不同主星"。
 */

import { HOME_PLANET_CATALOG, type HomePlanetEntry } from './galaxy-planets';
import type { HomePlanetSlug } from './constellation-anchors';

/** 人格 slug → 主神 slug，缺省走"港湾" */
export const PERSONALITY_TO_HOME_PLANET: Record<string, HomePlanetSlug> = {
  // 内敛深情 · 暴雨港湾
  simp: 'home-storm-harbor',
  'love-r': 'home-storm-harbor',
  emo: 'home-storm-harbor',

  // 策展社交 · 极光客厅
  party: 'home-aurora-parlour',
  'talk-er': 'home-aurora-parlour',
  'than-k': 'home-aurora-parlour',
  sexy: 'home-aurora-parlour',

  // 长情手艺 · 镀金缝纫机
  mum: 'home-gilded-loom',
  nerd: 'home-gilded-loom',
  'food-ie': 'home-gilded-loom',

  // 不动锚点 · 沉默灯塔
  solo: 'home-silent-lighthouse',
  shy: 'home-silent-lighthouse',
  chill: 'home-silent-lighthouse',

  // 慢思考 · 慢银河
  'thin-k': 'home-slow-galaxy',
  sleep: 'home-slow-galaxy',
  malo: 'home-slow-galaxy',
  'luck-y': 'home-slow-galaxy',

  // 漂泊者 · 漂流冰川
  fake: 'home-drift-glacier',
  joker: 'home-drift-glacier',
  'atm-er': 'home-drift-glacier',
  'dior-s': 'home-drift-glacier',
  'oh-no': 'home-drift-glacier',
  woc: 'home-drift-glacier',

  // 少话权威 · 黑曜钟楼
  boss: 'home-obsidian-belfry',
  ctrl: 'home-obsidian-belfry',
  rebel: 'home-obsidian-belfry',

  // 炽热 · 火星玫瑰园
  drama: 'home-mars-rose-garden',
  'game-r': 'home-mars-rose-garden',
  drunk: 'home-mars-rose-garden',
};

/**
 * 主测人格 slug → 主神目录条目；默认 storm-harbor。
 */
export function mapPersonalityToHomePlanet(
  personalitySlug: string | null | undefined,
): HomePlanetEntry {
  const mapped = personalitySlug
    ? PERSONALITY_TO_HOME_PLANET[personalitySlug]
    : undefined;
  const targetSlug: HomePlanetSlug = mapped ?? 'home-storm-harbor';
  const found = HOME_PLANET_CATALOG.find((p) => p.slug === targetSlug);
  return found ?? HOME_PLANET_CATALOG[0];
}
