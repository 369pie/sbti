/**
 * GET /api/mysti/payment/verify?orderId=xxx
 * 前端从 /mysti/payment/return 跳回后调用本接口确认订单已支付
 *
 * Stub 模式（未配置 env）—— 直接返回 paid:true，方便开发。
 * Live 模式 —— 直接查询服务端 mysti_orders；gift-card 会在首次 verify 成功时签发服务端礼品卡。
 */

import { NextRequest, NextResponse } from 'next/server';
import { hasAnyXunhupayConfig } from '@/lib/payment/xunhupay';
import {
  ensureGiftCardIssued,
  findMystiOrder,
  markMystiOrderVerified,
} from '@/lib/mysti/payment-store';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get('orderId') || '';
  const stub = url.searchParams.get('stub') === '1';

  if (!orderId) {
    return NextResponse.json({ error: 'invalid_params' }, { status: 400 });
  }

  if (!hasAnyXunhupayConfig() || stub) {
    // 颁发本地解锁 token（不安全，仅 W4 阶段）
    return NextResponse.json({
      paid: true,
      orderId,
      token: `stub_${Date.now().toString(36)}`,
      stub: true,
    });
  }

  try {
    const order = await findMystiOrder(orderId);
    if (!order) {
      return NextResponse.json({
        paid: false,
        pending: true,
        orderId,
        stub: false,
      });
    }

    if (order.status !== 'paid') {
      return NextResponse.json({
        paid: false,
        pending: order.status === 'pending',
        orderId,
        orderStatus: order.status,
        stub: false,
      });
    }

    await markMystiOrderVerified(orderId);
    const giftCard = await ensureGiftCardIssued(order);

    return NextResponse.json({
      paid: true,
      pending: false,
      orderId,
      orderStatus: order.status,
      token: `mysti_${order.id}`,
      stub: false,
      giftCard,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'verify_failed', message: String(error) },
      { status: 500 },
    );
  }
}
