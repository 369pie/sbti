import { NextResponse, type NextRequest } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
const UUID = /^[0-9a-f-]{36}$/i;

async function unsub(token: string | null) {
  if (!token || !UUID.test(token)) return false;
  const { error } = await createAdminSupabaseClient().from('her_profiles').update({ email_daily: false }).eq('email_unsub_token', token);
  return !error;
}

export async function GET(req: NextRequest) {
  const ok = await unsub(req.nextUrl.searchParams.get('t'));
  return new NextResponse(
    `<!doctype html><meta charset="utf-8"><body style="background:#FBF6EC;color:#4A3628;font-family:sans-serif;padding:48px;text-align:center">${ok ? '已退订每日今日卡邮件。' : '链接无效或已过期。'}<br><a href="/today/" style="color:#B45C47">回到今日</a></body>`,
    { headers: { 'content-type': 'text/html; charset=utf-8' } },
  );
}
// RFC 8058 one-click
export async function POST(req: NextRequest) {
  return NextResponse.json({ ok: await unsub(req.nextUrl.searchParams.get('t')) });
}
