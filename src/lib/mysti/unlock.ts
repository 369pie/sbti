/**
 * Mysti 解锁状态本地缓存
 *
 * 真实订单完成后，前端会拿到 `unlockToken`（来自支付回调的服务端签发）。
 * 该 token 写入 localStorage；下次访问同一 SKU 时直接放行。
 *
 * 注意：本地缓存是"显示门禁"，不是安全门禁。任何敏感内容请通过服务端校验。
 * 当前 W4 阶段所有 SKU 均为"内容解锁"——本地缓存即可。
 */

const STORAGE_PREFIX = 'mysti-unlock-';

export type MystiSku =
  | 'soul-letter'      // ¥9.9 灵魂信
  | 'dual-report'      // ¥12.9 双人合盘报告
  | 'monthly-report'   // ¥6.9 灵魂月报
  | 'gift-card'        // ¥39.9 礼品卡
  | 'share-plus'       // ¥4.9 分享卡 · Plus 精修
  | 'share-atelier';   // ¥19.9 分享卡 · N° 藏品

export interface UnlockRecord {
  sku: MystiSku;
  /** 资源 id：人格 slug / pair-key / yyyymm 等 */
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

export const SKU_PRICES: Record<MystiSku, { price: number; label: string }> = {
  'soul-letter': { price: 9.9, label: '灵魂信 · 深度版' },
  'dual-report': { price: 12.9, label: '双人合盘报告' },
  'monthly-report': { price: 6.9, label: '灵魂月报' },
  'gift-card': { price: 39.9, label: '礼品卡 · 三选一' },
  'share-plus': { price: 4.9, label: '分享卡 · Plus 精修' },
  'share-atelier': { price: 19.9, label: '分享卡 · N° 藏品版' },
};
