/**
 * XPTI · Local Result Storage
 *
 * Persists the latest XPTI test result (slug + dimension scores) to
 * localStorage so that downstream features (couple invite, archive
 * replay) can read the user's actual scores without forcing a re-test.
 *
 * v3.0 Sprint 3 also keeps a small ring-buffer history of the last
 * `MAX_HISTORY` test results for the replay-compare feature.
 */

import type { XptiTestResult } from './scoring';

const STORAGE_KEY = 'xpti.lastResult.v1';
const HISTORY_KEY = 'xpti.history.v1';
const SCHEMA_VERSION = 1;
const MAX_HISTORY = 8; // free tier shows last 2; xpti-archive-yearly unlocks all

export interface XptiStoredResult {
  v: number;
  slug: string;
  /** Dimension scores in D1..D9 order, 1.0 - 3.0 floats. */
  dims: number[];
  /** Unix ms timestamp when the test was finished. */
  finishedAt: number;
}

interface XptiHistoryFile {
  v: number;
  items: XptiStoredResult[];
}

function buildPayload(result: XptiTestResult): XptiStoredResult {
  const dims = result.dimensions
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((d) => Math.round(d.score * 100) / 100);
  return { v: SCHEMA_VERSION, slug: result.personality.slug, dims, finishedAt: Date.now() };
}

export function saveXptiResult(result: XptiTestResult): void {
  if (typeof window === 'undefined') return;
  try {
    const payload = buildPayload(result);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    appendToHistory(payload);
  } catch {
    // Quota / private mode / etc — silently ignore.
  }
}

function appendToHistory(item: XptiStoredResult) {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const file: XptiHistoryFile = raw ? (JSON.parse(raw) as XptiHistoryFile) : { v: SCHEMA_VERSION, items: [] };
    if (file.v !== SCHEMA_VERSION) file.items = [];
    // Dedupe: skip if previous result is identical & finished within 60s (likely a refresh).
    const last = file.items[file.items.length - 1];
    if (last && last.slug === item.slug && Math.abs(item.finishedAt - last.finishedAt) < 60_000) return;
    file.items.push(item);
    if (file.items.length > MAX_HISTORY) file.items = file.items.slice(-MAX_HISTORY);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(file));
  } catch {
    // ignore
  }
}

export function loadXptiResult(): XptiStoredResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as XptiStoredResult;
    if (!parsed || parsed.v !== SCHEMA_VERSION) return null;
    if (typeof parsed.slug !== 'string' || !Array.isArray(parsed.dims) || parsed.dims.length !== 9) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function loadXptiHistory(): XptiStoredResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const file = JSON.parse(raw) as XptiHistoryFile;
    if (!file || file.v !== SCHEMA_VERSION || !Array.isArray(file.items)) return [];
    return file.items
      .filter((it) => it && typeof it.slug === 'string' && Array.isArray(it.dims) && it.dims.length === 9)
      .sort((a, b) => a.finishedAt - b.finishedAt);
  } catch {
    return [];
  }
}

export function clearXptiResult(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}
