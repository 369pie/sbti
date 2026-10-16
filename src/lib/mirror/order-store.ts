/**
 * Mirror 支付订单 — Supabase 持久化 + 内存兜底缓存。
 */

import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export type MirrorOrderStatus = 'pending' | 'paid' | 'failed' | 'expired';

export interface MirrorOrder {
  tradeOrderId: string;
  channel: 'wechat' | 'alipay';
  pack: string;
  credits: number;
  amountYuan: number;
  userId?: string;
  status: MirrorOrderStatus;
  createdAt: number;
  paidAt?: number;
  walletCredit?: {
    ledgerId?: string;
    balance: number;
    applied: boolean;
    creditedAt: number;
  };
}

const orders = new Map<string, MirrorOrder>();

interface MirrorOrderRow {
  trade_order_id: string;
  channel: 'wechat' | 'alipay';
  pack: string;
  credits: number;
  amount_yuan: number | string;
  user_id: string | null;
  status: MirrorOrderStatus;
  paid_at: string | null;
  wallet_ledger_id: string | null;
  wallet_balance: number | null;
  wallet_applied: boolean | null;
  wallet_credited_at: string | null;
  created_at: string;
}

const MIRROR_ORDER_COLUMNS = [
  'trade_order_id',
  'channel',
  'pack',
  'credits',
  'amount_yuan',
  'user_id',
  'status',
  'paid_at',
  'wallet_ledger_id',
  'wallet_balance',
  'wallet_applied',
  'wallet_credited_at',
  'created_at',
].join(', ');

function toTimestamp(value: string | null): number | undefined {
  if (!value) return undefined;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? undefined : timestamp;
}

function mapRow(row: MirrorOrderRow): MirrorOrder {
  const order: MirrorOrder = {
    tradeOrderId: row.trade_order_id,
    channel: row.channel,
    pack: row.pack,
    credits: row.credits,
    amountYuan: Number(row.amount_yuan),
    userId: row.user_id ?? undefined,
    status: row.status,
    createdAt: toTimestamp(row.created_at) ?? Date.now(),
    paidAt: toTimestamp(row.paid_at),
  };

  if (row.wallet_balance !== null && row.wallet_credited_at) {
    order.walletCredit = {
      ledgerId: row.wallet_ledger_id ?? undefined,
      balance: row.wallet_balance,
      applied: row.wallet_applied ?? true,
      creditedAt: toTimestamp(row.wallet_credited_at) ?? Date.now(),
    };
  }

  orders.set(order.tradeOrderId, order);
  return order;
}

/** 下单 */
export async function createMirrorOrder(params: {
  tradeOrderId: string;
  channel: 'wechat' | 'alipay';
  pack: string;
  credits: number;
  amountYuan: number;
  userId?: string;
}): Promise<MirrorOrder> {
  const order: MirrorOrder = {
    tradeOrderId: params.tradeOrderId,
    channel: params.channel,
    pack: params.pack,
    credits: params.credits,
    amountYuan: params.amountYuan,
    userId: params.userId,
    status: 'pending',
    createdAt: Date.now(),
  };
  orders.set(params.tradeOrderId, order);

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('mirror_payment_orders')
    .insert({
      trade_order_id: params.tradeOrderId,
      channel: params.channel,
      pack: params.pack,
      credits: params.credits,
      amount_yuan: params.amountYuan,
      user_id: params.userId ?? null,
    })
    .select(MIRROR_ORDER_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  if (data) {
    return mapRow(data as unknown as MirrorOrderRow);
  }

  return order;
}

export async function markMirrorOrderWalletCredited(
  tradeOrderId: string,
  credit: { ledgerId?: string; balance: number; applied: boolean },
): Promise<MirrorOrder | null> {
  const order = orders.get(tradeOrderId);
  const walletCredit = {
    ...credit,
    creditedAt: Date.now(),
  };

  if (order) {
    order.walletCredit = walletCredit;
  }

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('mirror_payment_orders')
    .update({
      wallet_ledger_id: credit.ledgerId ?? null,
      wallet_balance: credit.balance,
      wallet_applied: credit.applied,
      wallet_credited_at: new Date(walletCredit.creditedAt).toISOString(),
    })
    .eq('trade_order_id', tradeOrderId)
    .select(MIRROR_ORDER_COLUMNS)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapRow(data as unknown as MirrorOrderRow) : order ?? null;
}

/** 查询订单 */
export async function getMirrorOrder(tradeOrderId: string): Promise<MirrorOrder | null> {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('mirror_payment_orders')
    .select(MIRROR_ORDER_COLUMNS)
    .eq('trade_order_id', tradeOrderId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapRow(data as unknown as MirrorOrderRow) : orders.get(tradeOrderId) ?? null;
}

/** 标记已支付 */
export async function markMirrorOrderPaid(tradeOrderId: string): Promise<MirrorOrder | null> {
  const paidAt = new Date();
  const existing = orders.get(tradeOrderId);
  if (existing && existing.status === 'pending') {
    existing.status = 'paid';
    existing.paidAt = paidAt.getTime();
  }

  const admin = createAdminSupabaseClient();
  const { data: current, error: currentError } = await admin
    .from('mirror_payment_orders')
    .select(MIRROR_ORDER_COLUMNS)
    .eq('trade_order_id', tradeOrderId)
    .maybeSingle();

  if (currentError) {
    throw currentError;
  }

  const currentOrder = current ? mapRow(current as unknown as MirrorOrderRow) : null;
  if (currentOrder?.status === 'paid') {
    return currentOrder;
  }

  const { data, error } = await admin
    .from('mirror_payment_orders')
    .update({
      status: 'paid',
      paid_at: paidAt.toISOString(),
    })
    .eq('trade_order_id', tradeOrderId)
    .neq('status', 'paid')
    .select(MIRROR_ORDER_COLUMNS)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return mapRow(data as unknown as MirrorOrderRow);
  }

  return existing ?? null;
}

/** 标记失败 */
export async function markMirrorOrderFailed(tradeOrderId: string): Promise<void> {
  const order = orders.get(tradeOrderId);
  if (order && order.status === 'pending') {
    order.status = 'failed';
  }

  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from('mirror_payment_orders')
    .update({ status: 'failed' })
    .eq('trade_order_id', tradeOrderId)
    .eq('status', 'pending');

  if (error) {
    throw error;
  }
}

/** 过期清理（5 分钟未支付自动过期） */
export async function cleanupExpiredMirrorOrders(): Promise<number> {
  const cutoff = Date.now() - 5 * 60 * 1000;
  let cleaned = 0;
  for (const [id, order] of orders) {
    if (order.status === 'pending' && order.createdAt < cutoff) {
      order.status = 'expired';
      orders.delete(id);
      cleaned++;
    }
  }

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('mirror_payment_orders')
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('created_at', new Date(cutoff).toISOString())
    .select('trade_order_id');

  if (error) {
    throw error;
  }

  cleaned += data?.length ?? 0;
  return cleaned;
}
