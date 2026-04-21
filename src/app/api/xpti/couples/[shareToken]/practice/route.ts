/**
 * PATCH /api/xpti/couples/[shareToken]/practice
 *
 * Toggle a day's practice checklist entry for inviter or partner.
 * Body: { side: 'inviter' | 'partner', day: number, done: boolean }
 *
 * Returns: { practiceChecklist: PracticeChecklist }
 */

import { NextRequest, NextResponse } from 'next/server';
import { togglePracticeChecklist } from '@/lib/xpti/couple-server';

interface RouteContext {
  params: Promise<{ shareToken: string }>;
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { shareToken } = await ctx.params;
  if (!shareToken) {
    return NextResponse.json({ error: 'shareToken_required' }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const side = body.side === 'inviter' || body.side === 'partner' ? body.side : null;
  const day = typeof body.day === 'number' ? body.day : Number(body.day);
  const done = typeof body.done === 'boolean' ? body.done : Boolean(body.done);

  if (!side || Number.isNaN(day) || day < 1 || day > 30) {
    return NextResponse.json({ error: 'invalid_params' }, { status: 400 });
  }

  const result = await togglePracticeChecklist(shareToken, { side, day, done });
  if (!result) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  return NextResponse.json({ practiceChecklist: result });
}
