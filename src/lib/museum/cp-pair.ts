/**
 * CP pairing engine (W3).
 *
 * Pure / deterministic. No GPT call — pulls from hand-authored templates
 * and uses a hash seeded by the two slugs to pick variations.
 *
 * URL format: /types/cp/[tabA]_[slugA]__[tabB]_[slugB]/
 *   e.g. /types/cp/sbti_boss__wtfti_nerd/
 */

import type { GalleryItem, GalleryTab } from '@/app/types/gallery-data';

/* ── Tiny FNV-1a so we don't pull crypto into the client bundle. ── */
function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h;
}

export interface CpPairKey {
  tabA: string;
  slugA: string;
  tabB: string;
  slugB: string;
}

export interface CpPair {
  key: CpPairKey;
  /** A normalized slug for sharing/deeplinks. */
  pairSlug: string;
  /** ≤ 8 chars — the CP name (e.g. "低气压双子座"). */
  name: string;
  /** ≤ 18 chars — sub-title (e.g. "你们注定互相磨"). */
  kicker: string;
  /** Three sentences ≤ 38 chars each — the "锐评". */
  roast: [string, string, string];
  /** A relationship tag, e.g. "互补型" / "镜像型" / "拌嘴型". */
  tag: string;
  /** Color stops for the gradient bg. */
  palette: { from: string; to: string; ink: string };
}

/* ── Encode/decode helpers ─────────────────────────────────────────── */

export function encodePairSlug(k: CpPairKey): string {
  return `${k.tabA}_${k.slugA}__${k.tabB}_${k.slugB}`;
}

export function decodePairSlug(slug: string): CpPairKey | null {
  const parts = slug.split('__');
  if (parts.length !== 2) return null;
  const [a, b] = parts;
  const aIdx = a.indexOf('_');
  const bIdx = b.indexOf('_');
  if (aIdx <= 0 || bIdx <= 0) return null;
  return {
    tabA: a.slice(0, aIdx),
    slugA: a.slice(aIdx + 1),
    tabB: b.slice(0, bIdx),
    slugB: b.slice(bIdx + 1),
  };
}

/** Normalize so /types/cp/A__B and /types/cp/B__A return identical results. */
function canonicalize(k: CpPairKey): CpPairKey {
  const a = `${k.tabA}_${k.slugA}`;
  const b = `${k.tabB}_${k.slugB}`;
  if (a <= b) return k;
  return { tabA: k.tabB, slugA: k.slugB, tabB: k.tabA, slugB: k.slugA };
}

/* ── Template pools ────────────────────────────────────────────────── */

const TAGS = ['互补型', '镜像型', '拌嘴型', '安静共生型', '混乱中和型', '相看两不厌', '互相磨型'];

const NAME_TEMPLATES: Array<(a: GalleryItem, b: GalleryItem) => string> = [
  (a, b) => `${takeFirstChar(a.name)}${takeFirstChar(b.name)}组合`,
  (a, b) => `${tone(a)}与${tone(b)}`,
  (a, b) => `${takeFirstChar(a.name)}系${takeFirstChar(b.name)}味`,
  (a, b) => `${moodTag(a)}${moodTag(b)} CP`,
];

const KICKER_TEMPLATES: string[] = [
  '一动一静的化学反应',
  '注定要互相磨一磨',
  '看似不搭其实很合',
  '互相收留对方的怪',
  '彼此最舒服的频率',
  '默契比想象中可怕',
  '吵不散的那种安静',
];

const ROAST_OPENERS = [
  '你们就是那种——',
  '别人看你们：',
  '相处节奏：',
  '本质是：',
  '彼此的角色：',
  '关系底色：',
];

const ROAST_BODIES_A = [
  '一个负责把日子过得正常',
  '一个负责说"我们要不要试试新的"',
  '一个白天能社交到崩溃',
  '一个把"算了"当成口头禅',
  '一个负责拍照',
  '一个负责发疯',
  '一个负责定闹钟',
];

const ROAST_BODIES_B = [
  '一个负责把日子过得有趣',
  '一个负责说"先这样吧"',
  '一个晚上才慢慢开机',
  '一个把"再说"翻译成"明年再说"',
  '一个负责挑滤镜',
  '一个负责按"清醒"',
  '一个负责按掉闹钟',
];

const ROAST_CLOSERS = [
  '——加起来正好是一个完整的人。',
  '——配在一起刚好不太疯。',
  '——其实你们已经在过日子了。',
  '——这才叫合得来。',
  '——长此以往，谁也跑不掉。',
  '——下次合照请站近一点。',
  '——不用解释，懂的都懂。',
];

/* ── Helpers ───────────────────────────────────────────────────────── */

function takeFirstChar(s: string): string {
  // Take first non-emoji CJK / latin char.
  const m = s.match(/[\u4e00-\u9fa5A-Za-z0-9]/);
  return m ? m[0] : s.slice(0, 1);
}

function tone(item: GalleryItem): string {
  const tones = ['冷静派', '混乱派', '安静派', '热闹派', '认真派', '随便派', '清醒派', '神游派'];
  return tones[fnv1a(item.slug) % tones.length];
}

function moodTag(item: GalleryItem): string {
  const tags = ['低气压', '高频段', '深海', '清晨', '夜行', '暖光', '冷调', '碎碎念'];
  return tags[fnv1a(item.slug + ':mood') % tags.length];
}

function pickFromPool<T>(pool: T[], seed: number, salt = ''): T {
  const i = fnv1a(salt + seed.toString(36)) % pool.length;
  return pool[i];
}

function paletteOf(a: GalleryItem, b: GalleryItem) {
  return { from: a.color, to: b.color, ink: '#1F1A16' };
}

/* ── Public API ────────────────────────────────────────────────────── */

export function lookupItem(allTabs: GalleryTab[], tabId: string, slug: string):
  { tab: GalleryTab; item: GalleryItem } | null {
  const tab = allTabs.find((t) => t.id === tabId);
  if (!tab) return null;
  const item = tab.items.find((i) => i.slug === slug);
  if (!item) return null;
  return { tab, item };
}

export function generateCpPair(allTabs: GalleryTab[], rawKey: CpPairKey): CpPair | null {
  const key = canonicalize(rawKey);
  const a = lookupItem(allTabs, key.tabA, key.slugA);
  const b = lookupItem(allTabs, key.tabB, key.slugB);
  if (!a || !b) return null;

  const seed = fnv1a(`${key.tabA}_${key.slugA}__${key.tabB}_${key.slugB}`);
  const nameTpl = NAME_TEMPLATES[seed % NAME_TEMPLATES.length];

  const opener = pickFromPool(ROAST_OPENERS, seed, 'op');
  const bodyA  = pickFromPool(ROAST_BODIES_A, seed, 'ba');
  const bodyB  = pickFromPool(ROAST_BODIES_B, seed + 1, 'bb');
  const closer = pickFromPool(ROAST_CLOSERS, seed, 'cl');

  return {
    key,
    pairSlug: encodePairSlug(key),
    name: nameTpl(a.item, b.item).slice(0, 8),
    kicker: pickFromPool(KICKER_TEMPLATES, seed, 'k').slice(0, 18),
    roast: [
      opener,
      `${bodyA}，${bodyB}`,
      closer,
    ],
    tag: pickFromPool(TAGS, seed, 't'),
    palette: paletteOf(a.item, b.item),
  };
}
