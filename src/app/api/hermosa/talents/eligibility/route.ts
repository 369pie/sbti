/**
 * Salon 准入闸门探针。
 *
 * GET /api/hermosa/talents/eligibility
 *   → { qualified: boolean, contribution_count: number, min_contributions: number }
 *
 * 不返回任何身份信息；只用 client_hash（ip|ua sha256）匹配 hermosa_messages 计数。
 * 前端可以在 TalentPanel 空状态时调用，决定显示"开档"还是"先去主墙留一句"。
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MIN_CONTRIBUTIONS = 1;

function clientHash(req: NextRequest): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '0.0.0.0';
  const ua = req.headers.get('user-agent') ?? 'unknown';
  return createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 32);
}

export async function GET(req: NextRequest) {
  let admin;
  try {
    admin = createAdminSupabaseClient();
  } catch {
    return NextResponse.json({
      qualified: false,
      contribution_count: 0,
      min_contributions: MIN_CONTRIBUTIONS,
      error: 'unavailable',
    });
  }
  const cHash = clientHash(req);
  const { count } = await admin
    .from('hermosa_messages')
    .select('id', { count: 'exact', head: true })
    .eq('client_hash', cHash)
    .eq('is_published', true)
    .eq('flagged', false);
  const c = count ?? 0;
  return NextResponse.json({
    qualified: c >= MIN_CONTRIBUTIONS,
    contribution_count: c,
    min_contributions: MIN_CONTRIBUTIONS,
  });
}
