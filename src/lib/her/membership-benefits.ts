/**
 * Client-safe membership constants (no server imports).
 * Audit 2026-10-20 decision 4: ONE ¥19/月 membership; 暮光通行证 folded in.
 */

/** Reuse live Mysti monthly-pass SKU (already wired to 虎皮椒 xunhupay). */
export const HER_MEMBERSHIP_MONTHLY_SKU = 'monthly-pass' as const;

/** Member static try-on free uses / Asia/Shanghai month (plan §4 「N 次」). */
export const MEMBER_TRY_ON_CAP = 10; // keep in sync with FEATURES.try_on.member

export const MEMBERSHIP_PRICE_LABEL = '¥19/月';

import { FEATURES } from '@/lib/entitlements';

/** Generated from lib/entitlements.ts — content unlocks + AI monthly caps. */
export const MEMBERSHIP_BENEFITS: string[] = [
  ...FEATURES.filter((f) => f.kind === 'content').map((f) => `${f.label} · 会员免费`),
  ...FEATURES.filter((f) => f.kind === 'ai').map((f) =>
    `${f.label} · 每月 ${f.member === 'unlimited' ? '不限' : `${f.member} 次`}（非会员 ${f.freeQuota ?? 0} 次）`,
  ),
];
