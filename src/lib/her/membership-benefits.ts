/**
 * Client-safe membership constants (no server imports).
 * Audit 2026-10-20 decision 4: ONE ¥19/月 membership; 暮光通行证 folded in.
 */

/** Reuse live Mysti monthly-pass SKU (already wired to 虎皮椒 xunhupay). */
export const HER_MEMBERSHIP_MONTHLY_SKU = 'monthly-pass' as const;

/** Member static try-on free uses / Asia/Shanghai month (plan §4 「N 次」). */
export const MEMBER_TRY_ON_CAP = 10;

export const MEMBERSHIP_PRICE_LABEL = '¥19/月';

/** Everything the one membership includes — /member/, /today, /mirror, Mysti. */
export const MEMBERSHIP_BENEFITS: string[] = [
  '完整今日卡（穿搭示意 + 更细建议）',
  `美我换装每月 ${MEMBER_TRY_ON_CAP} 次免费额度`,
  '「我和他」双人报告会员价 8 折',
  'SoulTI 深夜长信 · XPTI / WTFTI 深度档 会员期内免费解锁',
  '塔罗：每日一牌额外加抽 + 每月小报告 + 全部 Plus 分享卡（原暮光通行证权益）',
];
