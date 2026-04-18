/**
 * Mysti 解锁状态本地缓存
 *
 * 真实订单完成后，前端会拿到 `unlockToken`（来自支付回调的服务端签发）。
 * 该 token 写入 localStorage；下次访问同一 SKU 时直接放行。
 *
 * 注意：本地缓存是"显示门禁"，不是安全门禁。任何敏感内容请通过服务端校验。
 *
 * 订阅类 SKU（monthly-pass / quarterly-pass / yearly-pass / creator-pass）使用
 * 独立的 `subscription.ts` 管理过期时间与权益。
 */

const STORAGE_PREFIX = 'mysti-unlock-';

/** 单次解锁类 */
export type SinglePurchaseSku =
  | 'soul-letter'        // ¥9.9 灵魂信
  | 'dual-report'        // ¥12.9 双人合盘报告
  | 'monthly-report'     // ¥6.9 灵魂月报
  | 'gift-card'          // ¥39.9 灵魂礼品卡
  | 'festival-gift-card' // ¥49.9 节日限定礼品卡
  | 'besties-bundle'     // ¥69 闺蜜对箱
  | 'share-plus'         // ¥4.9 分享卡 · Plus 精修
  | 'share-atelier';     // ¥19.9 分享卡 · N° 藏品

/** 订阅类 */
export type SubscriptionSku =
  | 'monthly-pass'       // ¥19/月
  | 'quarterly-pass'     // ¥99/季
  | 'yearly-pass'        // ¥299/年
  | 'creator-pass';      // ¥39/月（创作者）

export type MystiSku = SinglePurchaseSku | SubscriptionSku;

export interface UnlockRecord {
  sku: MystiSku;
  /** 资源 id：人格 slug / pair-key / yyyymm / 'subscription' 等 */
  resourceId: string;
  /** 服务端订单号 */
  orderId: string;
  /** 解锁时间 */
  unlockedAt: number;
  /** 服务端签发的不透明 token（未来可加签验证） */
  token?: string;
}

function key(sku: MystiSku, resourceId: string): string {
  return `${STORAGE_PREFIX}${sku}-${resourceId}`;
}

export function isUnlocked(sku: MystiSku, resourceId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(key(sku, resourceId)) !== null;
  } catch {
    return false;
  }
}

export function recordUnlock(record: UnlockRecord): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      key(record.sku, record.resourceId),
      JSON.stringify(record),
    );
  } catch {
    /* swallow */
  }
}

export function readUnlock(
  sku: MystiSku,
  resourceId: string,
): UnlockRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key(sku, resourceId));
    if (!raw) return null;
    return JSON.parse(raw) as UnlockRecord;
  } catch {
    return null;
  }
}

export const SKU_PRICES: Record<MystiSku, { price: number; label: string; tagline?: string }> = {
  // ── L1 单次内容 ─────────────────────────────────────────────
  'soul-letter': { price: 9.9, label: '灵魂信 · 深度版', tagline: '为你写的一封长信，5-8 屏深读' },
  'dual-report': { price: 12.9, label: '双人合盘报告', tagline: '关系的 8 个维度，看清你们之间' },
  'monthly-report': { price: 6.9, label: '灵魂月报', tagline: '一整月的情绪 / 抽牌 / 选择回顾' },
  'share-plus': { price: 4.9, label: '分享卡 · Plus 精修', tagline: '去水印 + 金边精修，发圈不撞款' },
  'share-atelier': { price: 19.9, label: '分享卡 · N° 藏品版', tagline: '编号收藏卡，每张独一无二' },

  // ── L3 礼赠 / 长尾 ────────────────────────────────────────
  'gift-card': { price: 39.9, label: '灵魂礼品卡 · 三选一', tagline: '送朋友一份灵魂内容' },
  'festival-gift-card': { price: 49.9, label: '节日限定礼品卡', tagline: '七夕 / 圣诞 / 生日限定贺卡' },
  'besties-bundle': { price: 69, label: '闺蜜对箱', tagline: '双人合盘 + 双人 Plus 卡 + 自定义贺卡' },

  // ── L2 订阅 / 通行证 ──────────────────────────────────────
  'monthly-pass': { price: 19, label: '灵魂月度通行证', tagline: '每日翻牌 + 全 Plus 分享卡 + 月报' },
  'quarterly-pass': { price: 99, label: '灵魂季度通行证', tagline: '相当于 ¥33/月，最甜蜜点' },
  'yearly-pass': { price: 299, label: '灵魂年度通行证', tagline: '¥25/月，铁粉无脑选' },
  'creator-pass': { price: 39, label: '创作者 Plus 通行证', tagline: '高级题库 + 分润 30%' },
};

/** 订阅类 SKU 列表 */
export const SUBSCRIPTION_SKUS: SubscriptionSku[] = [
  'monthly-pass',
  'quarterly-pass',
  'yearly-pass',
  'creator-pass',
];

/** 单次解锁 SKU 列表 */
export const SINGLE_PURCHASE_SKUS: SinglePurchaseSku[] = [
  'soul-letter',
  'dual-report',
  'monthly-report',
  'gift-card',
  'festival-gift-card',
  'besties-bundle',
  'share-plus',
  'share-atelier',
];

export const ALL_SKUS: MystiSku[] = [
  ...SINGLE_PURCHASE_SKUS,
  ...SUBSCRIPTION_SKUS,
];

export function isSubscriptionSku(sku: string): sku is SubscriptionSku {
  return SUBSCRIPTION_SKUS.includes(sku as SubscriptionSku);
}

/** 订阅 SKU 对应的天数 */
export const SUBSCRIPTION_DURATION_DAYS: Record<SubscriptionSku, number> = {
  'monthly-pass': 30,
  'quarterly-pass': 92,
  'yearly-pass': 365,
  'creator-pass': 30,
};
