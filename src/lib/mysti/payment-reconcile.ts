import {
  queryXunhupayOrder,
  readXunhupayConfig,
} from '@/lib/payment/xunhupay';
import {
  markMystiOrderPaid,
  updateMystiOrderStatus,
  type MystiOrderRow,
} from '@/lib/mysti/payment-store';

function stringifyProviderData(data: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = { source: 'provider_query' };
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      out[key] = String(value);
      continue;
    }
    out[key] = JSON.stringify(value).slice(0, 500);
  }
  return out;
}

export async function reconcileMystiOrderFromProvider(
  order: MystiOrderRow,
): Promise<MystiOrderRow> {
  if (order.status !== 'pending') return order;

  const cfg = readXunhupayConfig(order.channel);
  if (!cfg) return order;

  try {
    const providerOrder = await queryXunhupayOrder(cfg, {
      tradeOrderId: order.trade_order_id,
      openOrderId: order.provider_order_id ?? undefined,
    });

    if (providerOrder.status === 'OD') {
      return markMystiOrderPaid({
        tradeOrderId: order.trade_order_id,
        providerOrderId: providerOrder.openOrderId ?? order.provider_order_id,
        channel: order.channel,
        totalFee: providerOrder.totalFee ?? order.amount_cents / 100,
        orderTitle: providerOrder.orderTitle ?? order.title,
        notifyPayload: stringifyProviderData(providerOrder.data),
      });
    }

    if (providerOrder.status === 'CD') {
      await updateMystiOrderStatus(order.trade_order_id, 'failed');
      return {
        ...order,
        status: 'failed',
        updated_at: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.warn('[mysti-payment-reconcile] provider query skipped', {
      orderId: order.trade_order_id,
      channel: order.channel,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return order;
}
