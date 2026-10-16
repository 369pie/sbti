/**
 * Sprint 4 客户端持久化：只在浏览器里使用。
 *
 * - hermosa.contributions.v1：用户提交过的留言 id 列表（最多 50 条）
 * - hermosa.saved.v1.book / .ai：用户收藏的书 / AI 卡 id（每类最多 50 条）
 * - hermosa.notifications.seen.v1：已经读过的"被选入"通知 id（避免重复提醒）
 */

const CONTRIB_KEY = 'hermosa.contributions.v1';
const SAVED_KEY_PREFIX = 'hermosa.saved.v1';
const NOTIF_SEEN_KEY = 'hermosa.notifications.seen.v1';
const MAX_LIST = 50;

function safeRead(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(key) ?? '[]') as unknown;
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function safeWrite(key: string, value: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value.slice(-MAX_LIST)));
  } catch {
    /* ignore quota errors */
  }
}

// ──────────────────────────────────────────────
// 自己提交过的 id
// ──────────────────────────────────────────────

export function loadOwnContributionIds(): string[] {
  return safeRead(CONTRIB_KEY);
}

export function rememberOwnContribution(id: string): void {
  if (!id) return;
  const list = loadOwnContributionIds();
  if (list.includes(id)) return;
  list.push(id);
  safeWrite(CONTRIB_KEY, list);
}

export function forgetOwnContribution(id: string): void {
  const next = loadOwnContributionIds().filter((x) => x !== id);
  safeWrite(CONTRIB_KEY, next);
}

// ──────────────────────────────────────────────
// 收藏（书 / AI 卡）
// ──────────────────────────────────────────────

export type HermosaSavedScope = 'book' | 'ai';

function savedKey(scope: HermosaSavedScope): string {
  return `${SAVED_KEY_PREFIX}.${scope}`;
}

export function loadSavedIds(scope: HermosaSavedScope): string[] {
  return safeRead(savedKey(scope));
}

export function isSaved(scope: HermosaSavedScope, id: string): boolean {
  return loadSavedIds(scope).includes(id);
}

export function toggleSaved(scope: HermosaSavedScope, id: string): boolean {
  if (!id) return false;
  const list = loadSavedIds(scope);
  const idx = list.indexOf(id);
  if (idx >= 0) {
    list.splice(idx, 1);
    safeWrite(savedKey(scope), list);
    return false;
  }
  list.push(id);
  safeWrite(savedKey(scope), list);
  return true;
}

// ──────────────────────────────────────────────
// "被选入"通知 dedupe
// ──────────────────────────────────────────────

export function loadSeenNotifications(): string[] {
  return safeRead(NOTIF_SEEN_KEY);
}

export function markNotificationsSeen(ids: string[]): void {
  if (!ids.length) return;
  const seen = new Set(loadSeenNotifications());
  for (const id of ids) seen.add(id);
  safeWrite(NOTIF_SEEN_KEY, Array.from(seen));
}
