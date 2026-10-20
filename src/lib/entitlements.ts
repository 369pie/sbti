/**
 * Site-wide entitlements (2026-10-21 · 全站会员).
 *
 * ONE ¥19 / 30 天 member tier (her_profiles.is_member + member_expires_at, plus a
 * still-active legacy 暮光通行证 on the device) unlocks ALL paid content. Features
 * that cost money per call (LLM / image model) get a monthly cap per feature.
 *
 * Client-safe: no server imports. Server helpers live in entitlements-server.ts.
 * Cost notes: APIMart · gpt-4o-mini ($0.15 / $0.60 per 1M tok, ≈¥7.2/$);
 * gpt-image-2 1k ≈ ¥0.5–1/图 (estimate — confirm against the APIMart bill).
 */

import type { MystiSku } from '@/lib/mysti/unlock';

export type FeatureKind = 'content' | 'ai';
export type MemberRule = 'unlimited' | number;

export interface FeatureConfig {
  key: string;
  label: string;
  kind: FeatureKind;
  /** Where it lives (for /member/ copy + inventory). */
  where: string;
  /** Per-month free uses for non-members (ai) — null = paid-only / not metered. */
  freeQuota: number | null;
  /** Members: unlimited, or a monthly cap (ai features). */
  member: MemberRule;
  /** Single-purchase SKUs that also unlock it (still sellable to non-members). */
  skus: MystiSku[];
  /** Rough provider cost per call in RMB (ai only). */
  costPerCallCny?: number;
}

export const FEATURES: FeatureConfig[] = [
  // ── 内容类：会员全部解锁 ──────────────────────────────
  { key: 'couple_report', label: '「我和他」双人关系报告', kind: 'content', where: '/xpti/couple/', freeQuota: null, member: 'unlimited', skus: ['xpti-couple-report', 'xpti-couple-half'] },
  { key: 'soulti_deep', label: 'SoulTI 深夜长信', kind: 'content', where: '/soulti/report/', freeQuota: null, member: 'unlimited', skus: ['soulti-deep-mirror'] },
  { key: 'xpti_deep', label: 'XPTI 亲密偏好深析', kind: 'content', where: '/xpti/result/*/deep/', freeQuota: null, member: 'unlimited', skus: ['xpti-deep-xp'] },
  { key: 'xpti_archive', label: 'XPTI 年度档案', kind: 'content', where: '/xpti/archive/', freeQuota: null, member: 'unlimited', skus: ['xpti-archive-yearly'] },
  { key: 'wtfti_deep', label: 'WTFTI 深度主神档案', kind: 'content', where: '/wtfti/result/', freeQuota: null, member: 'unlimited', skus: ['wtfti-deep-pantheon'] },
  { key: 'cpti_deep', label: 'CPTI 关系深档 / 图鉴 / 双签卡 / 季节皮肤', kind: 'content', where: '/cpti/relationship/*/deep/', freeQuota: null, member: 'unlimited', skus: ['cpti-deep-relationship', 'cpti-codex-pass-yearly', 'cpti-cosign-edition', 'cpti-squad-pack', 'cpti-seasonal-pack', 'cpti-seasonal-qixi-2026', 'cpti-seasonal-valentines-2026', 'cpti-seasonal-lunar-newyear-2026'] },
  { key: 'tarot_letter', label: '塔罗灵魂信 · 合盘 · 月报', kind: 'content', where: '/mysti/', freeQuota: null, member: 'unlimited', skus: ['soul-letter', 'dual-report', 'monthly-report'] },
  { key: 'tarot_decision', label: '塔罗决策快卡 · 全场景', kind: 'content', where: '/mysti/decision/', freeQuota: null, member: 'unlimited', skus: ['decision-pack'] },
  { key: 'sigil', label: 'Sigil 年度纪章册', kind: 'content', where: '/mysti/sigil/', freeQuota: null, member: 'unlimited', skus: ['sigil-yearly'] },
  { key: 'share_cards', label: 'Plus / 藏品分享卡 · WTFCard 典藏', kind: 'content', where: '结果页分享', freeQuota: null, member: 'unlimited', skus: ['share-plus', 'share-atelier', 'wtfcard-collector'] },
  { key: 'today_full', label: '完整今日卡（穿搭示意 + 更细建议）', kind: 'content', where: '/today/', freeQuota: null, member: 'unlimited', skus: [] },
  // ── AI 按次计费：会员每月上限 ────────────────────────
  { key: 'try_on', label: '美我 · AI 换装', kind: 'ai', where: '/mirror/atelier/', freeQuota: 3, member: 10, skus: [], costPerCallCny: 0.8 },
  { key: 'palm', label: '美我 · AI 看掌纹', kind: 'ai', where: '/mirror/palm/', freeQuota: 3, member: 30, skus: [], costPerCallCny: 0.03 },
  { key: 'color_season', label: '美我 · AI 色彩季型', kind: 'ai', where: '/mirror/color/', freeQuota: 3, member: 30, skus: [], costPerCallCny: 0.03 },
  { key: 'face', label: '美我 · AI 脸型妆容', kind: 'ai', where: '/mirror/face/', freeQuota: 3, member: 30, skus: [], costPerCallCny: 0.03 },
];

export type FeatureKey = (typeof FEATURES)[number]['key'];
export type AiFeatureKey = 'try_on' | 'palm' | 'color_season' | 'face';

export const AI_FEATURES = FEATURES.filter((f) => f.kind === 'ai');

export function featureConfig(key: string): FeatureConfig | undefined {
  return FEATURES.find((f) => f.key === key);
}

/** SKUs a member never has to buy (gift cards / creator pass / the membership itself excluded). */
export const MEMBER_UNLOCK_SKUS: ReadonlySet<string> = new Set(FEATURES.flatMap((f) => f.skus));

export function memberCoversSku(sku: string): boolean {
  return MEMBER_UNLOCK_SKUS.has(sku);
}

/** Monthly cap for a metered feature given membership. null = not metered. */
export function capFor(key: string, isMember: boolean): number | null {
  const f = featureConfig(key);
  if (!f || f.kind !== 'ai') return null;
  if (isMember) return f.member === 'unlimited' ? null : f.member;
  return f.freeQuota;
}

/** Worst-case monthly provider cost of a member hitting every cap (keeps ¥19 profitable). */
export function memberWorstCaseCostCny(): number {
  return AI_FEATURES.reduce((sum, f) => sum + (typeof f.member === 'number' ? f.member * (f.costPerCallCny ?? 0) : 0), 0);
}

export const MEMBER_PRICE_CNY = 19;
export const MEMBER_DAYS = 30;
