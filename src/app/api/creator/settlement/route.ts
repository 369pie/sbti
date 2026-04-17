import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  requestSettlement,
  fetchSettlements,
  fetchCreatorEarnings,
} from '@/lib/ugc/earnings';

/**
 * GET /api/creator/settlement — Creator's settlement history.
 * POST /api/creator/settlement — Request a new payout.
 */

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: creator } = await supabase
    .from('creators')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!creator) {
    return NextResponse.json({ error: '未找到创作者账户' }, { status: 403 });
  }

  const settlements = await fetchSettlements(supabase, creator.id as string);
  return NextResponse.json({ settlements });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: creator } = await supabase
    .from('creators')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!creator) {
    return NextResponse.json({ error: '未找到创作者账户' }, { status: 403 });
  }

  const creatorId = creator.id as string;
  const body = await request.json().catch(() => null);

  if (!body || typeof body.amountCents !== 'number') {
    return NextResponse.json({ error: '请指定提现金额 (amountCents)' }, { status: 400 });
  }

  // Verify available balance
  const earnings = await fetchCreatorEarnings(supabase, creatorId);
  if (body.amountCents > earnings.availableBalanceCents) {
    return NextResponse.json(
      {
        error: '提现金额超过可用余额',
        availableBalanceCents: earnings.availableBalanceCents,
      },
      { status: 400 },
    );
  }

  if (body.amountCents < 10000) {
    return NextResponse.json(
      { error: '最低提现金额为 ¥100（10000 分）' },
      { status: 400 },
    );
  }

  const settlement = await requestSettlement(supabase, creatorId, {
    amountCents: body.amountCents,
    payoutMethod: body.payoutMethod,
    payoutAccount: body.payoutAccount,
  });

  if (!settlement) {
    return NextResponse.json({ error: '提现申请创建失败' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    settlement,
    message: '提现申请已提交，预计 1-3 个工作日到账',
  });
}
