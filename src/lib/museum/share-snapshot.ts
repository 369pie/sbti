/**
 * Share Snapshot (W5, no-backend variant).
 *
 * Encodes a small projection of the user's local museum state into a
 * URL-safe base64url token. Anyone with the link can render that snapshot
 * read-only; the original device retains full control by just not sharing.
 *
 * Why no backend:
 *   - Spec defers W5 backend
 *   - URL-encoded snapshot keeps the no-server promise
 *   - Snapshot is a moment-in-time, not a live profile (matches "拼图" mental model)
 *
 * Schema (versioned, kept tiny):
 *   v1: { v: 1, n?: name, t: tabIds[], k: unlockedKeys[], f?: favs[], b?: badgeIds[] }
 *
 * We compress by:
 *   - Replacing tab ids with indexes into a stable canonical tab list
 *   - Storing unlocked slugs grouped by tab index
 *   - Limiting to 9 favourite cards
 *   - URL-safe base64 (no padding)
 */

import type { GalleryTab } from '@/app/types/gallery-data';

const VERSION = 1;
const MAX_NAME_LEN = 18;
const MAX_FAVS = 12;
const MAX_BADGES = 8;

export interface MuseumSnapshot {
  /** Optional display name (≤ 18 chars) */
  name?: string;
  /** Tab ids the user touched (any unlock) */
  touchedTabIds: string[];
  /** Unlocked composite keys `${tabId}:${slug}` */
  unlockedKeys: string[];
  /** Optional favourite cards (composite keys), capped at 12 */
  favs?: string[];
  /** Optional achieved set-bonus badge ids, capped at 8 */
  badgeIds?: string[];
  /** ISO date the snapshot was created */
  createdAt: string;
}

interface Encoded {
  v: number;
  n?: string;
  /** tab ids list (interned) */
  ti: string[];
  /** array per tab of slugs that are unlocked */
  ks: string[][];
  /** favs as `[tabIndex, slug]` */
  f?: Array<[number, string]>;
  /** badge ids */
  b?: string[];
  /** created at iso */
  d: string;
}

/* ── base64url helpers ────────────────────────────────────────────── */

function toB64Url(s: string): string {
  let b64: string;
  if (typeof window === 'undefined') {
    b64 = Buffer.from(s, 'utf-8').toString('base64');
  } else {
    // unicode-safe
    b64 = btoa(unescape(encodeURIComponent(s)));
  }
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64Url(t: string): string {
  let b64 = t.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  if (typeof window === 'undefined') {
    return Buffer.from(b64, 'base64').toString('utf-8');
  }
  return decodeURIComponent(escape(atob(b64)));
}

/* ── encode / decode ──────────────────────────────────────────────── */

export function encodeSnapshot(snap: MuseumSnapshot): string {
  const tabs = Array.from(new Set(snap.touchedTabIds));
  const tabIndex = new Map<string, number>();
  tabs.forEach((t, i) => tabIndex.set(t, i));

  // Group unlocked slugs by tab index
  const ks: string[][] = tabs.map(() => []);
  for (const k of snap.unlockedKeys) {
    const colon = k.indexOf(':');
    if (colon < 0) continue;
    const tab = k.slice(0, colon);
    const slug = k.slice(colon + 1);
    const idx = tabIndex.get(tab);
    if (idx === undefined) continue;
    ks[idx].push(slug);
  }

  const f: Array<[number, string]> = [];
  for (const fk of (snap.favs ?? []).slice(0, MAX_FAVS)) {
    const colon = fk.indexOf(':');
    if (colon < 0) continue;
    const tab = fk.slice(0, colon);
    const slug = fk.slice(colon + 1);
    const idx = tabIndex.get(tab);
    if (idx === undefined) continue;
    f.push([idx, slug]);
  }

  const payload: Encoded = {
    v: VERSION,
    ti: tabs,
    ks,
    d: snap.createdAt,
  };
  if (snap.name) payload.n = snap.name.slice(0, MAX_NAME_LEN);
  if (f.length) payload.f = f;
  if (snap.badgeIds && snap.badgeIds.length) payload.b = snap.badgeIds.slice(0, MAX_BADGES);

  return toB64Url(JSON.stringify(payload));
}

export function decodeSnapshot(token: string): MuseumSnapshot | null {
  try {
    const json = fromB64Url(token);
    const obj = JSON.parse(json) as Encoded;
    if (!obj || obj.v !== VERSION || !Array.isArray(obj.ti) || !Array.isArray(obj.ks)) return null;
    const unlockedKeys: string[] = [];
    obj.ti.forEach((tab, i) => {
      const slugs = obj.ks[i] ?? [];
      for (const s of slugs) unlockedKeys.push(`${tab}:${s}`);
    });
    const favs = (obj.f ?? []).map(([i, s]) => `${obj.ti[i] ?? ''}:${s}`).filter(k => !k.startsWith(':'));
    return {
      name: typeof obj.n === 'string' ? obj.n : undefined,
      touchedTabIds: obj.ti,
      unlockedKeys,
      favs,
      badgeIds: Array.isArray(obj.b) ? obj.b : undefined,
      createdAt: typeof obj.d === 'string' ? obj.d : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/* ── current snapshot from local state ────────────────────────────── */

const FAVS_KEY = 'wtf-museum-daily-favs-v1';
const NAME_KEY = 'wtf-museum-display-name-v1';

export function loadDisplayName(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(NAME_KEY);
    if (!raw) return null;
    return raw.slice(0, MAX_NAME_LEN);
  } catch { return null; }
}

export function saveDisplayName(name: string): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(NAME_KEY, name.slice(0, MAX_NAME_LEN)); } catch { /* swallow */ }
}

export function buildCurrentSnapshot(
  unlockedKeys: Set<string>,
  opts: { name?: string | null; badgeIds?: string[] } = {},
): MuseumSnapshot {
  const tabs = new Set<string>();
  for (const k of unlockedKeys) {
    const colon = k.indexOf(':');
    if (colon > 0) tabs.add(k.slice(0, colon));
  }

  let favKeys: string[] = [];
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(FAVS_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          favKeys = arr
            .map((e: { tabId?: string; slug?: string }) => (e?.tabId && e?.slug ? `${e.tabId}:${e.slug}` : ''))
            .filter(Boolean)
            .slice(-MAX_FAVS);
        }
      }
    } catch { /* swallow */ }
  }

  return {
    name: opts.name?.trim() || undefined,
    touchedTabIds: Array.from(tabs),
    unlockedKeys: Array.from(unlockedKeys),
    favs: favKeys,
    badgeIds: opts.badgeIds,
    createdAt: new Date().toISOString(),
  };
}

/** Resolve a snapshot's keys against current tab data so the page can render real cards. */
export function resolveSnapshot(
  snap: MuseumSnapshot,
  allTabs: GalleryTab[],
) {
  const tabById = new Map(allTabs.map(t => [t.id, t]));
  const unlocked: Array<{ tab: GalleryTab; item: GalleryTab['items'][number] }> = [];
  for (const k of snap.unlockedKeys) {
    const colon = k.indexOf(':');
    if (colon < 0) continue;
    const tab = tabById.get(k.slice(0, colon));
    if (!tab) continue;
    const slug = k.slice(colon + 1);
    const item = tab.items.find(it => it.slug === slug);
    if (item) unlocked.push({ tab, item });
  }
  const favs: typeof unlocked = [];
  for (const k of snap.favs ?? []) {
    const colon = k.indexOf(':');
    if (colon < 0) continue;
    const tab = tabById.get(k.slice(0, colon));
    if (!tab) continue;
    const slug = k.slice(colon + 1);
    const item = tab.items.find(it => it.slug === slug);
    if (item) favs.push({ tab, item });
  }
  const tabsTouched = snap.touchedTabIds.map(id => tabById.get(id)).filter((t): t is GalleryTab => Boolean(t));
  return { unlocked, favs, tabsTouched };
}
