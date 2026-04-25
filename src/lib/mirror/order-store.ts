/**
 * Mirror 支付订单 — 内存存储 + Supabase 持久化（可选）。
 *
 * 轻量方案：用 Map 做内存存储，notify 回调写入后前端 verify 读取。
 * 生产环境可迁移到 Supabase 表（mirror_orders）。
 */

export type MirrorOrderStatus = 'pending' | 'paid' | 'failed' | 'expired';

export interface MirrorOrder {
  tradeOrderId: string;
  channel: 'wechat' | 'alipay';
  pack: string;
  credits: number;
  amountYuan: number;
  status: MirrorOrderStatus;
  createdAt: number;
  paidAt?: number;
}

const orders = new Map<string, MirrorOrder>();

/** 下单 */
export function createMirrorOrder(params: {
  tradeOrderId: string;
  channel: 'wechat' | 'alipay';
  pack: string;
  credits: number;
  amountYuan: number;
}): MirrorOrder {
  const order: MirrorOrder = {
    tradeOrderId: params.tradeOrderId,
    channel: params.channel,
    pack: params.pack,
    credits: params.credits,
    amountYuan: params.amountYuan,
    status: 'pending',
    createdAt: Date.now(),
  };
  orders.set(params.tradeOrderId, order);
  return order;
}

/** 查询订单 */
export function getMirrorOrder(tradeOrderId: string): MirrorOrder | null {
  return orders.get(tradeOrderId) ?? null;
}

/** 标记已支付 */
export function markMirrorOrderPaid(tradeOrderId: string): MirrorOrder | null {
  const order = orders.get(tradeOrderId);
  if (!order || order.status !== 'pending') return null;
  order.status = 'paid';
  order.paidAt = Date.now();
  return order;
}

/** 标记失败 */
export function markMirrorOrderFailed(tradeOrderId: string): void {
  const order = orders.get(tradeOrderId);
  if (order && order.status === 'pending') {
    order.status = 'failed';
  }
}

/** 过期清理（5 分钟未支付自动过期） */
export function cleanupExpiredMirrorOrders(): number {
  const cutoff = Date.now() - 5 * 60 * 1000;
  let cleaned = 0;
  for (const [id, order] of orders) {
    if (order.status === 'pending' && order.createdAt < cutoff) {
      order.status = 'expired';
      orders.delete(id);
      cleaned++;
    }
  }
  return cleaned;
}
