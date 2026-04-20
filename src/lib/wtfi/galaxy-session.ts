'use client';

/**
 * Galaxy Session · 人格神域仪式结果本地持久化
 *
 * 背景：当前没有 server 端结果表写入管线，为了让"做完仪式 → 立刻看到真实结果"
 *      能跑通，先用 localStorage 做跨页持久化（仪式页 → result/[id] 页）。
 * 后续迁 DB 时，只需把 loadGalaxySession / saveGalaxySession 换成 fetch 即可。
 *
 * 存储键：
 *   wtfti.galaxy.session.v1          → 最新一次仪式的结果（单用户单 session）
 *   wtfti.galaxy.session.v1.<resultId> → 以 resultId 归档（供分享链接回访）
 */

import type { GalaxyResult } from './galaxy-types';
import type { SoulAnswers } from './soul-resonance';

const LATEST_KEY = 'wtfti.galaxy.session.v1';
const RESULT_KEY_PREFIX = 'wtfti.galaxy.session.v1.';

export interface GalaxySession {
  resultId: string;
  createdAt: string;
  /** 主测人格 slug（wtfti personality，非 home planet slug） */
  personalitySlug: string;
  /** 仪式输出的完整结果（含 shadow 若已跑 S 轴） */
  result: GalaxyResult;
  /** 灵魂探针 6 题答案（可选；用于重建 5 维雷达 / 灵魂香水 / 质地） */
  soulAnswers?: SoulAnswers;
}

function safeLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function saveGalaxySession(session: GalaxySession): void {
  const ls = safeLocalStorage();
  if (!ls) return;
  try {
    const payload = JSON.stringify(session);
    ls.setItem(LATEST_KEY, payload);
    ls.setItem(`${RESULT_KEY_PREFIX}${session.resultId}`, payload);
  } catch {
    /* 配额耗尽 / JSON 失败 — 忽略 */
  }
}

export function loadLatestGalaxySession(): GalaxySession | null {
  const ls = safeLocalStorage();
  if (!ls) return null;
  try {
    const raw = ls.getItem(LATEST_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GalaxySession;
  } catch {
    return null;
  }
}

export function loadGalaxySessionById(resultId: string): GalaxySession | null {
  const ls = safeLocalStorage();
  if (!ls) return null;
  try {
    const raw = ls.getItem(`${RESULT_KEY_PREFIX}${resultId}`);
    if (!raw) return null;
    return JSON.parse(raw) as GalaxySession;
  } catch {
    return null;
  }
}

export function generateResultId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof (crypto as { randomUUID?: () => string }).randomUUID === 'function'
  ) {
    return (crypto as { randomUUID: () => string }).randomUUID();
  }
  return `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
