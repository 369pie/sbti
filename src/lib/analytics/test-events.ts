'use client';

/**
 * Unified test funnel events (audit 2026-10-20 · Phase 1).
 *
 *   test_start  { test_id }
 *   test_finish { test_id, result_key }
 *
 * Every test in the hall emits these through product_events (module `test`),
 * so one query answers "which test got finished". Finishes are also kept in a
 * small local history so 「我」can show results before an archive exists.
 */

import { enqueueProductEvent } from '@/lib/analytics/product-events';

export type TestId =
  | 'first_look'
  | 'soulti'
  | 'xpti'
  // 「我和他」 (audit decision 3): ONE test_id for XPTI couple + CPTI; `mode` prop says which
  // (self | partner | cpti | cpti_peer | cpti_stealth).
  | 'wohe'
  // Legacy ids — no longer emitted, kept so older local history still renders.
  | 'xpti_couple'
  | 'cpti'
  | 'cpti_peer'
  | 'cpti_stealth'
  | 'classic'
  | 'wtfti'
  | 'mysti'
  | 'mysti_reading';

export interface LocalTestRecord {
  test_id: TestId;
  result_key: string;
  result_name?: string;
  href?: string;
  at: number;
}

const HISTORY_KEY = 'wtfti.tests.history';
const started = new Set<string>();

export function trackTestStart(testId: TestId, props?: Record<string, string | number | boolean | undefined>): void {
  // One start per test per page life (React strict-mode / re-render safe).
  if (started.has(testId)) return;
  started.add(testId);
  enqueueProductEvent('test', 'test_start', { step: 'start', props: { test_id: testId, ...props } });
}

export function trackTestFinish(
  testId: TestId,
  resultKey: string,
  extra?: { name?: string; href?: string; elapsedMs?: number; mode?: string },
): void {
  enqueueProductEvent('test', 'test_finish', {
    slug: resultKey.slice(0, 64),
    step: 'finish',
    value: extra?.elapsedMs,
    props: { test_id: testId, result_key: resultKey, ...(extra?.mode ? { mode: extra.mode } : {}) },
  });
  started.delete(testId);
  rememberTestResult({ test_id: testId, result_key: resultKey, result_name: extra?.name, href: extra?.href, at: Date.now() });
}

function rememberTestResult(rec: LocalTestRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const list = readLocalTestHistory().filter((r) => r.test_id !== rec.test_id);
    list.unshift(rec);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 20)));
  } catch {
    // storage unavailable — non-critical
  }
}

export function readLocalTestHistory(): LocalTestRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as LocalTestRecord[]).filter((r) => r && typeof r.test_id === 'string') : [];
  } catch {
    return [];
  }
}
