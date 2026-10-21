/**
 * Paid-point convergence (2026-10-21, BUGS.md PR5).
 *
 * Only SKUs that ever converted stay on sale. Every other SKU keeps its
 * type, price meta and backend handling (verify / entitlement / notify /
 * existing unlocks) so already-paid orders keep working — we only stop
 * showing new purchase entries and reject new orders for them.
 *
 * Kept: ¥19/月 会员, 我和他 合并报告 (单人 / 各付一半), plus the two
 * module deep reports that have real paid orders.
 */
export const ON_SALE_SKUS = [
  'monthly-pass',
  'xpti-couple-report',
  'xpti-couple-half',
  'soulti-deep-mirror',
  'wtfti-deep-pantheon',
] as const;

export function isSkuOnSale(sku: string | null | undefined): boolean {
  return !!sku && (ON_SALE_SKUS as readonly string[]).includes(sku);
}
