/**
 * WTF Card — localStorage-based multi-universe personality card system.
 *
 * No backend needed. Card data lives in localStorage.
 * Sharing works by encoding card data into URL params.
 */

import { UNIVERSES, type Universe } from './universes';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UniverseResult {
  slug: string;       // personality slug (e.g. 'emo', 'boss')
  testedAt: string;   // ISO date string
}

export interface WtfCardData {
  id: string;                                    // random 6-char hex
  nickname: string;                              // user-chosen display name
  createdAt: string;                             // ISO date
  results: Record<string, UniverseResult | null>; // keyed by universe id
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'wtf-card';

/** Universe IDs that count towards the WTF Card badge grid. */
export const CARD_UNIVERSE_IDS = UNIVERSES.filter(u => u.status === 'live').map(u => u.id);

// ─── ID generation ───────────────────────────────────────────────────────────

function generateId(): string {
  const arr = new Uint8Array(3);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Storage helpers ─────────────────────────────────────────────────────────

export function loadCard(): WtfCardData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WtfCardData;
    if (!parsed || typeof parsed.id !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveCard(card: WtfCardData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(card));
  } catch {
    // storage full / private mode — fail silently
  }
}

export function getOrCreateCard(): WtfCardData {
  const existing = loadCard();
  if (existing) return existing;

  const fresh: WtfCardData = {
    id: generateId(),
    nickname: '',
    createdAt: new Date().toISOString().slice(0, 10),
    results: Object.fromEntries(CARD_UNIVERSE_IDS.map(id => [id, null])),
  };
  saveCard(fresh);
  return fresh;
}

// ─── Record a test result ────────────────────────────────────────────────────

export function recordUniverseResult(universeId: string, slug: string): void {
  const card = getOrCreateCard();
  card.results[universeId] = {
    slug,
    testedAt: new Date().toISOString().slice(0, 10),
  };
  saveCard(card);
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export function getLitCount(card: WtfCardData): number {
  return CARD_UNIVERSE_IDS.filter(id => card.results[id] != null).length;
}

export function getTotalCount(): number {
  return CARD_UNIVERSE_IDS.length;
}

// ─── URL encoding / decoding for sharing ─────────────────────────────────────

/**
 * Encode card data into a compact URL-safe string.
 * Format: id.nickname.universeId-slug.universeId-slug...
 * Then base64url-encoded.
 */
export function encodeCardData(card: WtfCardData): string {
  const parts: string[] = [card.id, card.nickname || '匿名'];

  for (const uid of CARD_UNIVERSE_IDS) {
    const r = card.results[uid];
    if (r) {
      parts.push(`${uid}-${r.slug}`);
    }
  }

  // Use base64url encoding (no padding, URL-safe chars)
  const raw = parts.join('.');
  if (typeof window !== 'undefined') {
    return btoa(unescape(encodeURIComponent(raw)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  return Buffer.from(raw, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decode card data from URL param.
 * Returns a partial card (no createdAt, just for display).
 */
export function decodeCardData(encoded: string): WtfCardData | null {
  try {
    // Restore standard base64
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    let raw: string;
    if (typeof window !== 'undefined') {
      raw = decodeURIComponent(escape(atob(b64)));
    } else {
      raw = Buffer.from(b64, 'base64').toString('utf-8');
    }

    const parts = raw.split('.');
    if (parts.length < 2) return null;

    const [id, nickname, ...resultParts] = parts;
    const results: Record<string, UniverseResult | null> = Object.fromEntries(
      CARD_UNIVERSE_IDS.map(uid => [uid, null])
    );

    for (const rp of resultParts) {
      const dashIdx = rp.indexOf('-');
      if (dashIdx === -1) continue;
      const uid = rp.slice(0, dashIdx);
      const slug = rp.slice(dashIdx + 1);
      if (CARD_UNIVERSE_IDS.includes(uid)) {
        results[uid] = { slug, testedAt: '' };
      }
    }

    return { id, nickname, createdAt: '', results };
  } catch {
    return null;
  }
}

// ─── Compatibility / comparison ──────────────────────────────────────────────

/**
 * Calculate "soul similarity" between two cards, based on shared universe results.
 * Returns 0-100 percentage.
 * Uses a simple heuristic: for each common universe, same slug = 100%, else 0%.
 * Average across shared universes.
 */
export function calculateSimilarity(a: WtfCardData, b: WtfCardData): number | null {
  let shared = 0;
  let same = 0;

  for (const uid of CARD_UNIVERSE_IDS) {
    const ra = a.results[uid];
    const rb = b.results[uid];
    if (ra && rb) {
      shared++;
      if (ra.slug === rb.slug) same++;
    }
  }

  if (shared === 0) return null;
  return Math.round((same / shared) * 100);
}

// ─── Roast / comparison copy ─────────────────────────────────────────────────

const ROAST_HIGH = [
  '你俩不会是一个人吧',
  '世界上另一个你找到了',
  '复制粘贴都没这么像',
  '你们的精神DNA怕是同一条链上的',
  '同一个灵魂分裂成了两个肉身',
];

const ROAST_MID = [
  '像同一个班的不同学号',
  '有点像，但又没那么像',
  '你们可能会为同一件事吵起来',
  '不太一样，但聊得来',
  '像一道菜的咸甜两个版本',
];

const ROAST_LOW = [
  '你说东她说西，然后一起迷路',
  '互为对方的平行宇宙版本',
  '放一桌估计会很安静，或者很吵',
  '完全不同的两个物种',
  '你们像同一把锁的两把不配对的钥匙',
];

export function getComparisonRoast(similarity: number): string {
  const pool = similarity >= 70 ? ROAST_HIGH : similarity >= 35 ? ROAST_MID : ROAST_LOW;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Universe display helpers ────────────────────────────────────────────────

export function getUniverseForCard(uid: string): Universe | undefined {
  return UNIVERSES.find(u => u.id === uid);
}
