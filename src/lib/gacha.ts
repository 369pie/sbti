/**
 * Daily Gacha (E-04) — localStorage-only MVP
 *
 * Rules:
 *  - One draw per day (rolling 24 h based on local date)
 *  - Weighted rarity: S 1% · A 4% · B 15% · C 35% · D 45%
 *  - Pool draws from the 29-slug roster × N live universes
 *  - Persists to its own key; pushes legendary pulls into wtf-card gachaHistory
 */

import { queueAssetSync } from '@/lib/assets/asset-sync';
import { UNIVERSES } from './universes';

export type GachaRarity = 'S' | 'A' | 'B' | 'C' | 'D';

export interface GachaResult {
  universeId: string;
  universeName: string;
  universeEmoji: string;
  slug: string;
  rarity: GachaRarity;
  drawnAt: string; // ISO date
}

export interface GachaState {
  lastDrawDate: string; // YYYY-MM-DD
  history: GachaResult[];
}

const STORAGE_KEY = 'daily-gacha-v1';

const WEIGHTS: Record<GachaRarity, number> = { S: 1, A: 4, B: 15, C: 35, D: 45 };

// Full 29-slug canonical roster (matches standard WTFTI universe)
export const GACHA_SLUGS = [
  'boss', 'nerd', 'ctrl', 'emo', 'panic', 'drama', 'chill', 'ghost',
  'party', 'shy', 'stoic', 'dreamer', 'hype', 'sage', 'fury', 'mellow',
  'cynic', 'glow', 'edge', 'grind', 'silk', 'void', 'spark', 'blue',
  'mirror', 'wave', 'ember', 'frost', 'origin',
];

// Rarity assignment per slug (simple deterministic hash so the same slug
// always has the same rarity, but slugs are spread across rarities).
function slugRarity(slug: string): GachaRarity {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) & 0xffffffff;
  const bucket = Math.abs(hash) % 100;
  if (bucket < WEIGHTS.S) return 'S';
  if (bucket < WEIGHTS.S + WEIGHTS.A) return 'A';
  if (bucket < WEIGHTS.S + WEIGHTS.A + WEIGHTS.B) return 'B';
  if (bucket < WEIGHTS.S + WEIGHTS.A + WEIGHTS.B + WEIGHTS.C) return 'C';
  return 'D';
}

const RARITY_STYLE: Record<GachaRarity, { label: string; color: string; glow: string }> = {
  S: { label: 'S · 极稀有', color: '#f59e0b', glow: 'rgba(245,158,11,0.35)' },
  A: { label: 'A · 稀有',   color: '#a855f7', glow: 'rgba(168,85,247,0.30)' },
  B: { label: 'B · 少见',   color: '#3b82f6', glow: 'rgba(59,130,246,0.25)' },
  C: { label: 'C · 常见',   color: '#64748b', glow: 'rgba(100,116,139,0.20)' },
  D: { label: 'D · 大众',   color: '#4b5563', glow: 'rgba(75,85,99,0.15)' },
};

export function getGachaRarityStyle(rarity: GachaRarity) {
  return RARITY_STYLE[rarity];
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadGachaState(): GachaState {
  if (typeof window === 'undefined') return { lastDrawDate: '', history: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lastDrawDate: '', history: [] };
    const parsed = JSON.parse(raw) as GachaState;
    return {
      lastDrawDate: parsed.lastDrawDate ?? '',
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return { lastDrawDate: '', history: [] };
  }
}

function saveGachaState(state: GachaState, options?: { skipSync?: boolean }): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    return;
  }

  if (!options?.skipSync) {
    queueAssetSync('daily-gacha');
  }
}

export function canDrawToday(): boolean {
  const s = loadGachaState();
  return s.lastDrawDate !== today();
}

export function drawGacha(): GachaResult | null {
  if (typeof window === 'undefined') return null;
  if (!canDrawToday()) return null;

  const liveUniverses = UNIVERSES.filter(u => u.status === 'live');
  if (liveUniverses.length === 0) return null;

  const universe = liveUniverses[Math.floor(Math.random() * liveUniverses.length)];
  const slug = GACHA_SLUGS[Math.floor(Math.random() * GACHA_SLUGS.length)];
  const rarity = slugRarity(slug);

  const result: GachaResult = {
    universeId: universe.id,
    universeName: universe.name,
    universeEmoji: universe.emoji || '✨',
    slug,
    rarity,
    drawnAt: new Date().toISOString(),
  };

  const state = loadGachaState();
  const next: GachaState = {
    lastDrawDate: today(),
    history: [result, ...state.history].slice(0, 60),
  };
  saveGachaState(next);

  return result;
}

export function getGachaHistory(): GachaResult[] {
  return loadGachaState().history;
}

export function getGachaRarityCounts(): Record<GachaRarity, number> {
  const history = getGachaHistory();
  const counts: Record<GachaRarity, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
  for (const r of history) counts[r.rarity]++;
  return counts;
}
