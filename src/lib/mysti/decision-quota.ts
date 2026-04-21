/**
 * mysti 决策快卡 · 30 天滚动窗口配额
 *
 * 免费层：3 次/30 天（跨场景共享），覆盖"今晚试一次"的体验闭环。
 * decision-pack（¥4.9）解锁：免费层 + 8 次/30 天（共 11 次）+ 高级金句池标记。
 *
 * 仅 localStorage；30 天窗口在客户端按当前时间动态计算。
 * SSR 安全（typeof window 检查）。
 */

import { isUnlocked } from './unlock';

const STORAGE_KEY = 'mysti-decision-quota';
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export const FREE_DRAWS_PER_30D = 3;
export const PACK_BONUS_DRAWS_PER_30D = 8;

/** 单次抽签消耗记录（仅时间戳） */
interface QuotaEntry {
  /** ISO timestamp */
  at: number;
}

/** decision-pack 资源 id 固定为 'global'（不区分场景） */
export const DECISION_PACK_RESOURCE_ID = 'global';

function readEntries(): QuotaEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((e): e is QuotaEntry => typeof e?.at === 'number');
  } catch {
    return [];
  }
}

function writeEntries(entries: QuotaEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* swallow */
  }
}

function pruneExpired(entries: QuotaEntry[], now: number): QuotaEntry[] {
  const cutoff = now - WINDOW_MS;
  return entries.filter((e) => e.at >= cutoff);
}

/** 是否已解锁场景包（quotad bonus + 高级金句池） */
export function hasDecisionPack(): boolean {
  return isUnlocked('decision-pack', DECISION_PACK_RESOURCE_ID);
}

export interface QuotaStatus {
  /** 30 天内已用次数 */
  used: number;
  /** 30 天内总配额（free + pack 加成） */
  total: number;
  /** 剩余次数（不会小于 0） */
  remaining: number;
  /** 是否已解锁场景包 */
  hasPack: boolean;
  /** 配额耗尽，需要付费解锁 */
  exhausted: boolean;
}

/** 读取当前 30 天滚动窗口的配额状态 */
export function getQuotaStatus(): QuotaStatus {
  const now = Date.now();
  const entries = pruneExpired(readEntries(), now);
  const hasPack = hasDecisionPack();
  const total = FREE_DRAWS_PER_30D + (hasPack ? PACK_BONUS_DRAWS_PER_30D : 0);
  const used = entries.length;
  const remaining = Math.max(0, total - used);
  // 顺便清理过期记录
  if (entries.length !== readEntries().length) writeEntries(entries);
  return {
    used,
    total,
    remaining,
    hasPack,
    exhausted: remaining === 0,
  };
}

/** 在抽签 *开始* 时记一次（不要在 reveal 阶段再记，会双计） */
export function consumeDraw(): QuotaStatus {
  const now = Date.now();
  const entries = pruneExpired(readEntries(), now);
  entries.push({ at: now });
  writeEntries(entries);
  return getQuotaStatus();
}

/** 调试 / 测试用：清空配额 */
export function resetQuota(): void {
  writeEntries([]);
}
