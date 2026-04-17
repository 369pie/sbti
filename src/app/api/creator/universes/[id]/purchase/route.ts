import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { recordSimulatedPurchase } from '@/lib/ugc/earnings';

/**
 * POST /api/creator/universes/[id]/purchase — Simulated purchase for paid universes.
 *
 * Phase 0.5: No real payment — creates an order record directly.
 * Phase 1+: Replace with payment gateway webhook.
 *
 * Body: { sessionId? }
 */

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id: universeId } = await params;
  const supabase = await createServerSupabaseClient();

  // Load universe (public, no auth needed for purchase)
  const { data: universe } = await supabase
    .from('creator_universes')
    .select('id, creator_id, is_paid, price_cents, status')
    .eq('id', universeId)
    .single();

  if (!universe || universe.status !== 'published') {
    return NextResponse.json({ error: '宇宙未发布或不存在' }, { status: 404 });
  }

  if (!universe.is_paid || (universe.price_cents as number) <= 0) {
    return NextResponse.json({ error: '该宇宙是免费的' }, { status: 400 });
  }

  // Get creator tier for revenue split calculation
  const { data: creator } = await supabase
    .from('creators')
    .select('id, tier')
    .eq('id', universe.creator_id)
    .single();

  if (!creator) {
    return NextResponse.json({ error: '创作者不存在' }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));

  // Get buyer user (optional — anonymous purchases allowed)
  const { data: { user } } = await supabase.auth.getUser();

  const order = await recordSimulatedPurchase(supabase, {
    universeId,
    creatorId: creator.id as string,
    creatorTier: creator.tier as string,
    priceCents: universe.price_cents as number,
    userId: user?.id,
    sessionId: body.sessionId,
  });

  if (!order) {
    return NextResponse.json({ error: '购买记录创建失败' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    amountCents: order.amount_cents,
    creatorEarningCents: order.creator_earning_cents,
    message: '模拟购买成功（Phase 0.5 — 无实际扣款）',
  });
}
