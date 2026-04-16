/**
 * WTFTI 每日抽卡 (Daily Gacha) system
 *
 * Deterministic card draw based on date + user seed.
 * Each day, users can draw one random personality card from any universe.
 */

import { WTFTI_PERSONALITIES } from '@/lib/wtfti-personalities';
import type { WtftiPersonality } from '@/lib/wtfti-personalities';

// ─── Types ───────────────────────────────────────────────────────────────────

export type GachaRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface GachaCard {
  slug: string;
  universeId: string;
  universeName: string;
  universeEmoji: string;
  personalityName: string;
  personalityCode: string;
  personalityEmoji: string;
  personalityColor: string;
  rarity: GachaRarity;
  /** Short mystical description for this card */
  cardDescription: string;
}

export interface GachaResult {
  card: GachaCard;
  date: string; // YYYY-MM-DD
  isNew: boolean;
}

export interface GachaCollection {
  collected: string[]; // ['wtfti:boss', 'banti:nerd', ...]
}

// ─── Universe definitions for gacha pool ─────────────────────────────────────

interface GachaUniverse {
  id: string;
  name: string;
  emoji: string;
  rarityTier: 'common' | 'uncommon' | 'rare';
}

const GACHA_UNIVERSES: GachaUniverse[] = [
  { id: 'wtfti', name: 'WTF 毒舌版', emoji: '🤯', rarityTier: 'common' },
  { id: 'standard', name: '标准版', emoji: '', rarityTier: 'common' },
  { id: 'xiuxian', name: '修仙 2.0', emoji: '🔮', rarityTier: 'common' },
  { id: 'banti', name: '班TI', emoji: '💼', rarityTier: 'uncommon' },
  { id: 'bird', name: '鸟TI', emoji: '🐦', rarityTier: 'uncommon' },
  { id: 'kings', name: '王者TI', emoji: '⚔️', rarityTier: 'uncommon' },
  { id: 'feng', name: '疯TI', emoji: '😈', rarityTier: 'rare' },
  { id: 'delta', name: '三角TI', emoji: '🎯', rarityTier: 'rare' },
  { id: 'mysti', name: '灵鉴', emoji: '🔮', rarityTier: 'rare' },
  { id: 'flower', name: '花TI', emoji: '🌸', rarityTier: 'common' },
  { id: 'soulti', name: 'SoulTI', emoji: '🌙', rarityTier: 'uncommon' },
  { id: 'xpti', name: '恋爱XP', emoji: '💜', rarityTier: 'uncommon' },
];

// ─── Legendary card definitions ──────────────────────────────────────────────

interface LegendaryDefinition {
  universeId: string;
  slug: string;
  description: string;
}

const LEGENDARY_CARDS: LegendaryDefinition[] = [
  {
    universeId: 'wtfti',
    slug: 'boss',
    description: '宇宙意志的化身，掌控一切秩序的终极指挥官',
  },
  {
    universeId: 'feng',
    slug: 'rebel',
    description: '混沌之火的使者，打破一切规则的终极叛逆者',
  },
  {
    universeId: 'mysti',
    slug: 'thin-k',
    description: '灵魂深处的智者，洞悉万物本质的永恒思考者',
  },
  {
    universeId: 'kings',
    slug: 'game-r',
    description: '王者之巅的霸主，永不言败的终极战士',
  },
  {
    universeId: 'wtfti',
    slug: 'drama',
    description: '情感宇宙的核心，感受一切的终极共情者',
  },
  {
    universeId: 'delta',
    slug: 'ctrl',
    description: '三角之力的枢纽，连接一切的终极掌控者',
  },
];

// ─── Rarity descriptions by tier ─────────────────────────────────────────────

const RARITY_DESCRIPTIONS: Record<GachaRarity, string[]> = {
  common: [
    '平凡中蕴藏力量',
    '日常的守护者',
    '安静的存在',
    '稳定的力量源',
    '朴实的灵魂',
  ],
  uncommon: [
    '不凡的光芒初现',
    '隐藏的力量觉醒',
    '独特的能量波动',
    '特殊的灵魂印记',
    '超越平凡的特质',
  ],
  rare: [
    '稀有的灵魂共振',
    '罕见的能量爆发',
    '珍贵的命运交织',
    '难得的天赋显现',
    '卓越的灵魂品质',
  ],
  legendary: [
    '传说级的灵魂觉醒',
    '宇宙级的命运交汇',
    '神话中的存在降临',
    '超越时空的灵魂共鸣',
    '永恒的传说再现',
  ],
};

// ─── Hash functions ──────────────────────────────────────────────────────────

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function getDateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ─── User seed management ────────────────────────────────────────────────────

const GACHA_SEED_KEY = 'gacha-seed';
const GACHA_COLLECTION_KEY = 'gacha-collection';
const GACHA_DAILY_DRAW_KEY = 'gacha-daily-draw';

function getUserSeed(): string {
  if (typeof window === 'undefined') return 'default';
  let seed = localStorage.getItem(GACHA_SEED_KEY);
  if (!seed) {
    seed = Math.random().toString(36).substring(2, 15);
    localStorage.setItem(GACHA_SEED_KEY, seed);
  }
  return seed;
}

// ─── Collection management ───────────────────────────────────────────────────

export function getCollection(): GachaCollection {
  if (typeof window === 'undefined') return { collected: [] };
  try {
    const stored = localStorage.getItem(GACHA_COLLECTION_KEY);
    if (stored) {
      return JSON.parse(stored) as GachaCollection;
    }
  } catch {
    // ignore parse errors
  }
  return { collected: [] };
}

function saveCollection(collection: GachaCollection): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GACHA_COLLECTION_KEY, JSON.stringify(collection));
}

export function getCollectionCount(): number {
  return getCollection().collected.length;
}

export function getCollectionTotal(): number {
  return WTFTI_PERSONALITIES.length * GACHA_UNIVERSES.length;
}

export function getCollectionProgress(): number {
  const total = getCollectionTotal();
  if (total === 0) return 0;
  return getCollectionCount() / total;
}

export function getRarityDistribution(): Record<GachaRarity, number> {
  const collection = getCollection();
  const distribution: Record<GachaRarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    legendary: 0,
  };

  for (const cardKey of collection.collected) {
    const [universeId, slug] = cardKey.split(':');
    const rarity = getCardRarity(universeId, slug);
    distribution[rarity]++;
  }

  return distribution;
}

function addToCollection(universeId: string, slug: string): boolean {
  const collection = getCollection();
  const key = `${universeId}:${slug}`;
  if (collection.collected.includes(key)) {
    return false; // Already collected
  }
  collection.collected.push(key);
  saveCollection(collection);
  return true;
}

// ─── Daily draw state ────────────────────────────────────────────────────────

export function hasDrawnToday(): boolean {
  if (typeof window === 'undefined') return false;
  const today = getDateString(new Date());
  const lastDraw = localStorage.getItem(GACHA_DAILY_DRAW_KEY);
  return lastDraw === today;
}

export function markDrawnToday(): void {
  if (typeof window === 'undefined') return;
  const today = getDateString(new Date());
  localStorage.setItem(GACHA_DAILY_DRAW_KEY, today);
}

export function getTodayDrawResult(): GachaResult | null {
  if (typeof window === 'undefined') return null;
  const today = getDateString(new Date());
  const lastDraw = localStorage.getItem(GACHA_DAILY_DRAW_KEY);
  if (lastDraw !== today) return null;

  const stored = localStorage.getItem('gacha-last-result');
  if (!stored) return null;

  try {
    return JSON.parse(stored) as GachaResult;
  } catch {
    return null;
  }
}

function saveDrawResult(result: GachaResult): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('gacha-last-result', JSON.stringify(result));
}

// ─── Card rarity determination ───────────────────────────────────────────────

export function getCardRarity(universeId: string, slug: string): GachaRarity {
  // Check if this is a legendary card
  const isLegendary = LEGENDARY_CARDS.some(
    lc => lc.universeId === universeId && lc.slug === slug
  );
  if (isLegendary) return 'legendary';

  // Base rarity from universe tier
  const universe = GACHA_UNIVERSES.find(u => u.id === universeId);
  if (!universe) return 'common';

  // Hash the card identity to get a stable rarity within the tier
  const cardHash = hashString(`${universeId}:${slug}`);
  const rarityMod = cardHash % 100;

  switch (universe.rarityTier) {
    case 'common':
      return rarityMod < 90 ? 'common' : 'uncommon';
    case 'uncommon':
      return rarityMod < 70 ? 'uncommon' : 'rare';
    case 'rare':
      return rarityMod < 80 ? 'rare' : 'uncommon';
    default:
      return 'common';
  }
}

// ─── Rarity display helpers ──────────────────────────────────────────────────

export function getRarityColor(rarity: GachaRarity): string {
  switch (rarity) {
    case 'common':
      return '#9ca3af'; // gray-400
    case 'uncommon':
      return '#22c55e'; // green-500
    case 'rare':
      return '#3b82f6'; // blue-500
    case 'legendary':
      return '#f59e0b'; // amber-500
  }
}

export function getRarityGlow(rarity: GachaRarity): string {
  switch (rarity) {
    case 'common':
      return 'rgba(156,163,175,0.15)';
    case 'uncommon':
      return 'rgba(34,197,94,0.2)';
    case 'rare':
      return 'rgba(59,130,246,0.25)';
    case 'legendary':
      return 'rgba(245,158,11,0.3)';
  }
}

export function getRarityLabel(rarity: GachaRarity): string {
  switch (rarity) {
    case 'common':
      return '普通';
    case 'uncommon':
      return '精良';
    case 'rare':
      return '稀有';
    case 'legendary':
      return '传说';
  }
}

export function getRarityEmoji(rarity: GachaRarity): string {
  switch (rarity) {
    case 'common':
      return '⚪';
    case 'uncommon':
      return '🟢';
    case 'rare':
      return '🔵';
    case 'legendary':
      return '🟡';
  }
}

function getCardDescription(rarity: GachaRarity, cardHash: number): string {
  // For legendary cards, use the predefined description
  const descriptions = RARITY_DESCRIPTIONS[rarity];
  return descriptions[cardHash % descriptions.length];
}

function getLegendaryDescription(universeId: string, slug: string): string {
  const legendary = LEGENDARY_CARDS.find(
    lc => lc.universeId === universeId && lc.slug === slug
  );
  return legendary?.description ?? '传说中的神秘存在';
}

// ─── Main draw function ──────────────────────────────────────────────────────

export function drawDailyCard(date?: Date): GachaResult {
  const drawDate = date ?? new Date();
  const dateStr = getDateString(drawDate);
  const userSeed = getUserSeed();

  // Combine date + user seed for deterministic but personalized draw
  const combinedSeed = `${dateStr}:${userSeed}`;
  const dailyHash = hashString(combinedSeed);

  // Pick universe
  const universeIndex = dailyHash % GACHA_UNIVERSES.length;
  const universe = GACHA_UNIVERSES[universeIndex];

  // Pick personality slug
  const personalityHash = hashString(`${combinedSeed}:personality`);
  const personalityIndex = personalityHash % WTFTI_PERSONALITIES.length;
  const personality = WTFTI_PERSONALITIES[personalityIndex];

  // Determine if this should be an upgraded rarity draw
  const upgradeHash = hashString(`${combinedSeed}:upgrade`);
  const upgradeRoll = upgradeHash % 100;

  let rarity: GachaRarity;
  const baseRarity = getCardRarity(universe.id, personality.slug);

  // Small chance to upgrade rarity
  if (baseRarity === 'common' && upgradeRoll < 15) {
    rarity = 'uncommon';
  } else if (baseRarity === 'uncommon' && upgradeRoll < 8) {
    rarity = 'rare';
  } else if (baseRarity === 'rare' && upgradeRoll < 3) {
    // Check if this could be legendary
    const isLegendaryCandidate = LEGENDARY_CARDS.some(
      lc => lc.universeId === universe.id && lc.slug === personality.slug
    );
    rarity = isLegendaryCandidate ? 'legendary' : 'rare';
  } else {
    rarity = baseRarity;
  }

  // Get card description
  const cardDescription = rarity === 'legendary'
    ? getLegendaryDescription(universe.id, personality.slug)
    : getCardDescription(rarity, dailyHash);

  // Check if this card is already collected
  const key = `${universe.id}:${personality.slug}`;
  const collection = getCollection();
  const isNew = !collection.collected.includes(key);

  // Build the card
  const card: GachaCard = {
    slug: personality.slug,
    universeId: universe.id,
    universeName: universe.name,
    universeEmoji: universe.emoji,
    personalityName: personality.wtftiName,
    personalityCode: personality.code,
    personalityEmoji: personality.emoji,
    personalityColor: personality.color,
    rarity,
    cardDescription,
  };

  const result: GachaResult = {
    card,
    date: dateStr,
    isNew,
  };

  // Save to collection and mark as drawn
  addToCollection(universe.id, personality.slug);
  markDrawnToday();
  saveDrawResult(result);

  return result;
}

// ─── Time until next draw ────────────────────────────────────────────────────

export function getTimeUntilNextDraw(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
}

// ─── Milestone checking ──────────────────────────────────────────────────────

export const COLLECTION_MILESTONES = [10, 25, 50, 100, 174];

export function checkMilestone(count: number): number | null {
  return COLLECTION_MILESTONES.find(m => m === count) ?? null;
}

export function getNextMilestone(count: number): number | null {
  return COLLECTION_MILESTONES.find(m => m > count) ?? null;
}
