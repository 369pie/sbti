import type { MirrorOrder } from '@/lib/mirror/order-store';
import { markMirrorOrderWalletCredited } from '@/lib/mirror/order-store';
import { applyLingBiTransaction } from '@/lib/wallet/server';

export async function creditMirrorOrderToWallet(order: MirrorOrder): Promise<MirrorOrder> {
  if (!order.userId || order.status !== 'paid') return order;
  if (order.walletCredit) return order;

  const result = await applyLingBiTransaction(order.userId, {
    delta: order.credits,
    source: 'topup',
    idempotencyKey: `mirror-payment:${order.tradeOrderId}`,
    resourceId: order.tradeOrderId,
    note: `灵镜充值 · ${order.pack}`,
    metadata: {
      pack: order.pack,
      channel: order.channel,
      amountYuan: order.amountYuan,
      tradeOrderId: order.tradeOrderId,
      source: 'mirror_payment',
    },
  });

  if (!result.ok) {
    throw new Error(`mirror_wallet_credit_failed:${result.reason ?? 'unknown'}`);
  }

  return (await markMirrorOrderWalletCredited(order.tradeOrderId, {
    ledgerId: result.ledgerId,
    balance: result.balance,
    applied: result.applied ?? true,
  })) ?? order;
}
