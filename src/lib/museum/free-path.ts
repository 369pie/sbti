/**
 * Free Path (W4) — seasonal milestone track, fully client-side.
 *
 * Hard rules per spec:
 *   - 全部装饰，绝不解锁内容
 *   - 不显示倒计时（到期不消失，下季继续）
 *   - 不做付费 / 不做能量 / 不做"差 X 张"焦虑
 *
 * Each milestone reads from existing localStorage (unlocked keys, daily-favs,
 * view-mode usage), computes "achieved or not", and unlocks a decoration token
 * that other components can opt into (frame, ribbon, lantern, etc.).
 *
 * No backend.
 */

import type { GalleryTab } from '@/app/types/gallery-data';
import { getSeasonInfo } from './season';
import { getItemRarityTier, isHoloTier } from './rarity';

export type DecorationId =
  | 'frame:gold-leaf'
  | 'frame:silk-ribbon'
  | 'frame:rice-paper'
  | 'frame:moon-wash'
  | 'sleeve:linen'
  | 'sleeve:satin'
  | 'sleeve:matte'
  | 'lantern:red'
  | 'lantern:moon';

export interface Milestone {
  id: string;
  title: string;
  hint: string;
  decoration: DecorationId;
  decorationLabel: string;
  achieved: boolean;
  /** 0..1 — only used when not achieved */
  progress: number;
  /** "n / target" string for in-progress UI */
  progressText?: string;
}

export interface FreePathReport {
  seasonLabel: string;
  quarter: string;
  milestones: Milestone[];
  achievedCount: number;
  totalCount: number;
  earnedDecorations: DecorationId[];
}

const FAVS_KEY = 'wtf-museum-daily-favs-v1';
const SEEN_VIEWS_KEY = 'wtf-museum-views-seen-v1';

function readJsonSet<T extends string>(key: string): Set<T> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return new Set(arr);
  } catch { /* swallow */ }
  return new Set();
}

function readFavsCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(FAVS_KEY);
    if (!raw) return 0;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.length : 0;
  } catch { return 0; }
}

/** Track that a view-mode was used (called from ViewModeSwitch wrapper). */
export function markViewModeSeen(mode: string): void {
  if (typeof window === 'undefined') return;
  try {
    const seen = readJsonSet<string>(SEEN_VIEWS_KEY);
    seen.add(mode);
    window.localStorage.setItem(SEEN_VIEWS_KEY, JSON.stringify(Array.from(seen)));
  } catch { /* swallow */ }
}

export function computeFreePath(
  allTabs: GalleryTab[],
  unlockedKeys: Set<string>,
): FreePathReport {
  const season = getSeasonInfo();
  const totalCards = allTabs.reduce((s, t) => s + t.items.length, 0);
  const totalUnlocked = unlockedKeys.size;

  // Holo (SR+) unlocked count.
  let holoUnlocked = 0;
  let urUnlocked = 0;
  for (const tab of allTabs) {
    for (const item of tab.items) {
      if (!unlockedKeys.has(`${tab.id}:${item.slug}`)) continue;
      const tier = getItemRarityTier(item);
      if (isHoloTier(tier)) holoUnlocked++;
      if (tier === 'UR') urUnlocked++;
    }
  }

  const favs = readFavsCount();
  const seenViews = readJsonSet<string>(SEEN_VIEWS_KEY);
  const tabsTouched = new Set<string>();
  for (const k of unlockedKeys) {
    const tab = k.split(':', 1)[0];
    if (tab) tabsTouched.add(tab);
  }

  const def: Array<Omit<Milestone, 'achieved' | 'progress' | 'progressText'> & {
    current: number; target: number;
  }> = [
    {
      id: 'm:explorer',
      title: '初探收藏',
      hint: '解锁任意 5 张人设卡',
      decoration: 'frame:rice-paper',
      decorationLabel: '宣纸卡框',
      current: totalUnlocked,
      target: 5,
    },
    {
      id: 'm:wanderer',
      title: '走过山河',
      hint: '在 3 个不同系列里都有解锁',
      decoration: 'sleeve:linen',
      decorationLabel: '亚麻卡套',
      current: tabsTouched.size,
      target: 3,
    },
    {
      id: 'm:keeper',
      title: '小有收藏',
      hint: `解锁 ${Math.min(totalCards, 20)} 张人设卡`,
      decoration: 'frame:silk-ribbon',
      decorationLabel: '丝绦花边',
      current: totalUnlocked,
      target: Math.min(totalCards, 20),
    },
    {
      id: 'm:holo-spotter',
      title: 'Holo 初见',
      hint: '解锁第一张 SR 以上稀有卡',
      decoration: 'sleeve:satin',
      decorationLabel: '缎面卡套',
      current: holoUnlocked,
      target: 1,
    },
    {
      id: 'm:lover',
      title: '日签留情',
      hint: '收藏 7 张今日签卡',
      decoration: 'lantern:red',
      decorationLabel: '一盏红灯',
      current: favs,
      target: 7,
    },
    {
      id: 'm:wanderer-pro',
      title: '观图百法',
      hint: '体验 4 种观看模式',
      decoration: 'frame:moon-wash',
      decorationLabel: '月色描边',
      current: seenViews.size,
      target: 4,
    },
    {
      id: 'm:ur',
      title: 'UR 拾光',
      hint: '解锁第一张 UR 极稀卡',
      decoration: 'frame:gold-leaf',
      decorationLabel: '金箔卡框',
      current: urUnlocked,
      target: 1,
    },
    {
      id: 'm:atlas',
      title: '走遍图鉴',
      hint: `解锁 ${Math.min(totalCards, 60)} 张人设卡`,
      decoration: 'sleeve:matte',
      decorationLabel: '哑光卡套',
      current: totalUnlocked,
      target: Math.min(totalCards, 60),
    },
  ];

  const milestones: Milestone[] = def.map((d) => {
    const achieved = d.current >= d.target;
    return {
      id: d.id,
      title: d.title,
      hint: d.hint,
      decoration: d.decoration,
      decorationLabel: d.decorationLabel,
      achieved,
      progress: achieved ? 1 : Math.max(0, Math.min(1, d.current / Math.max(1, d.target))),
      progressText: achieved ? undefined : `${d.current} / ${d.target}`,
    };
  });

  return {
    seasonLabel: season.seasonLabel,
    quarter: season.palette.quarter,
    milestones,
    achievedCount: milestones.filter(m => m.achieved).length,
    totalCount: milestones.length,
    earnedDecorations: milestones.filter(m => m.achieved).map(m => m.decoration),
  };
}
