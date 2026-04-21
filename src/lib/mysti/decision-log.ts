/**
 * mysti 决策快卡 · 本地档案（localStorage）
 *
 * v1：仅 localStorage，cap 100 条；
 * v2（W3）：与 dual-archive 一起重构进 archive.ts + Supabase 持久化。
 *
 * 防破坏：所有读写均 try/catch；SSR 安全（typeof window 检查）。
 */

import type { DecisionScenarioId, DecisionStance } from './decision-quotes';

const STORAGE_KEY = 'mysti-decision-log';
const CAP = 100;

export interface DecisionLogEntry {
  /** 唯一 id：时间戳 + 4 位随机 */
  id: string;
  scenario: DecisionScenarioId;
  stance: DecisionStance;
  /** 抽到的 3 张牌的人格 idx（与 WTFTI_PERSONALITIES 数组下标一致） */
  picks: number[];
  /** 选中的金句 */
  quote: string;
  /** 用户主神 slug（可空，未登录时为 undefined） */
  deitySlug?: string;
  /** ISO 8601 */
  createdAt: string;
}

function safeParse(raw: string | null): DecisionLogEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function readDecisionLog(): DecisionLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    return safeParse(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

export function appendDecisionLog(entry: Omit<DecisionLogEntry, 'id' | 'createdAt'>): DecisionLogEntry {
  const full: DecisionLogEntry = {
    ...entry,
    id: `${Date.now().toString(36)}${Math.floor(Math.random() * 0x10000).toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  if (typeof window === 'undefined') return full;
  try {
    const prev = readDecisionLog();
    const next = [full, ...prev].slice(0, CAP);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // fire and forget
  }
  return full;
}

export function clearDecisionLog(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** 给 archive 时间轴用：返回最近 N 条（默认 20） */
export function listRecentDecisions(limit = 20): DecisionLogEntry[] {
  return readDecisionLog().slice(0, Math.max(1, limit));
}
