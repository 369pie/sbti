/**
 * Set-bonus badges (W3) — non-prescriptive achievements derived from
 * what the user has unlocked. No streaks, no XP, no penalties.
 *
 * Three families:
 *   - Edition Complete  — unlock 100% of a tab
 *   - Atlas Walker      — unlock at least 1 card from N different tabs
 *   - Holo Hunter       — unlock K SR+ cards across the whole museum
 *
 * Pure derivation; consumed by `SetBonusBadges.tsx` strip + drawer mini-strip.
 */

import type { GalleryTab } from '@/app/types/gallery-data';
import { getItemRarityTier, isHoloTier } from './rarity';

export type BadgeId =
  | `edition:${string}`
  | 'atlas:bronze' | 'atlas:silver' | 'atlas:gold'
  | 'holo:bronze' | 'holo:silver' | 'holo:gold';

export interface Badge {
  id: BadgeId;
  label: string;
  hint: string;          // ≤ 22 chars, what unlocks it
  achieved: boolean;
  progress?: { current: number; target: number };
  glyph: string;         // single-char unicode ornament
}

export interface SetBonusReport {
  badges: Badge[];
  achievedCount: number;
  totalCount: number;
}

const ATLAS_TIERS = [
  { id: 'atlas:bronze' as const, target: 3,  label: '游历者', hint: '解锁 3 个系列' },
  { id: 'atlas:silver' as const, target: 6,  label: '考察员', hint: '解锁 6 个系列' },
  { id: 'atlas:gold'   as const, target: 10, label: '图鉴学者', hint: '解锁 10 个系列' },
];

const HOLO_TIERS = [
  { id: 'holo:bronze' as const, target: 3,  label: 'Holo 初猎', hint: '收集 3 张 SR+' },
  { id: 'holo:silver' as const, target: 7,  label: 'Holo 老饕', hint: '收集 7 张 SR+' },
  { id: 'holo:gold'   as const, target: 15, label: 'Holo 收藏家', hint: '收集 15 张 SR+' },
];

export function computeSetBonus(
  allTabs: GalleryTab[],
  unlockedKeys: Set<string>,
): SetBonusReport {
  const badges: Badge[] = [];

  // Edition complete badges (per tab, only when achieved — keeps strip short).
  for (const tab of allTabs) {
    let unlocked = 0;
    for (const item of tab.items) {
      if (unlockedKeys.has(`${tab.id}:${item.slug}`)) unlocked++;
    }
    if (unlocked === tab.items.length && tab.items.length > 0) {
      badges.push({
        id: `edition:${tab.id}`,
        label: `${tab.label} 全员到齐`,
        hint: `集齐 ${tab.items.length} 张`,
        achieved: true,
        progress: { current: unlocked, target: tab.items.length },
        glyph: '✦',
      });
    }
  }

  // Atlas — count of tabs with ≥1 unlock.
  const startedTabs = new Set<string>();
  let holoCount = 0;
  for (const tab of allTabs) {
    let tabHasOne = false;
    for (const item of tab.items) {
      if (unlockedKeys.has(`${tab.id}:${item.slug}`)) {
        tabHasOne = true;
        if (isHoloTier(getItemRarityTier(item))) holoCount++;
      }
    }
    if (tabHasOne) startedTabs.add(tab.id);
  }
  for (const t of ATLAS_TIERS) {
    badges.push({
      id: t.id,
      label: t.label,
      hint: t.hint,
      achieved: startedTabs.size >= t.target,
      progress: { current: startedTabs.size, target: t.target },
      glyph: '◈',
    });
  }
  for (const t of HOLO_TIERS) {
    badges.push({
      id: t.id,
      label: t.label,
      hint: t.hint,
      achieved: holoCount >= t.target,
      progress: { current: holoCount, target: t.target },
      glyph: '✶',
    });
  }

  return {
    badges,
    achievedCount: badges.filter((b) => b.achieved).length,
    totalCount: badges.length,
  };
}
