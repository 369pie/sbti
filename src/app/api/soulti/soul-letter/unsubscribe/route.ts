/**
 * Soul Letter unsubscribe · GET/POST /api/soulti/soul-letter/unsubscribe
 *
 * Two entry points:
 *   - GET  /api/soulti/soul-letter/unsubscribe?token=<base64url(email|slug)>
 *     Click-from-email path. Returns a tiny styled HTML confirmation.
 *   - POST { email, slug } from in-product UI (e.g. result page revisit).
 *
 * Both perform a soft delete: stamp `unsubscribed_at` so we keep history
 * for ops review while excluding the row from cron dispatch.
 *
 * Token format is intentionally trivial (base64url of "email|slug") because
 * unsubscribe is non-destructive; if a malicious party guesses a real
 * subscription, the worst-case action is "stop emailing them". We still
 * require BOTH email and slug to match an existing row.
 */

import { NextResponse, type NextRequest } from 'next/server';

interface UnsubPayload {
  email?: string;
  slug?: string;
}

function decodeToken(token: string): { email: string; slug: string } | null {
  try {
    const padded = token.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = Buffer.from(padded, 'base64').toString('utf8');
    const [email, slug] = decoded.split('|');
    if (!email || !slug) return null;
    return { email, slug };
  } catch {
    return null;
  }
}

async function softDelete(email: string, slug: string): Promise<boolean> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.info('[soul-letter/unsubscribe] noop (no supabase)', { email, slug });
    return true;
  }
  const params = new URLSearchParams({
    email: `eq.${email.toLowerCase()}`,
    slug: `eq.${slug}`,
  });
  const res = await fetch(`${url}/rest/v1/soul_letter_subscriptions?${params}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ unsubscribed_at: new Date().toISOString() }),
  });
  if (!res.ok) {
    console.warn('[soul-letter/unsubscribe] patch failed', res.status);
    return false;
  }
  return true;
}

function htmlConfirm(success: boolean, email?: string): string {
  const message = success
    ? `${email ? maskEmail(email) + ' · ' : ''}已退订，不会再收到任何信。`
    : '退订没成功，请回信告诉我们，我们手动处理。';
  return `<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>SoulTI · 退订</title></head>
<body style="margin:0;padding:48px 16px;background:#FAF8F5;font-family:Georgia,'Noto Serif SC',serif;color:#2D2A26;text-align:center;">
  <div style="max-width:420px;margin:0 auto;background:#FDFCFA;border:1px solid rgba(139,115,85,0.18);border-radius:18px;padding:32px 28px;">
    <p style="font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#8b7355;margin:0 0 18px;">SoulTI</p>
    <p style="font-size:16px;line-height:1.8;margin:0 0 12px;">${message}</p>
    <p style="font-size:12px;line-height:1.9;color:#7a6a5a;margin:18px 0 0;">若你改变主意，回到结果页可以再次订阅。</p>
  </div>
</body></html>`;
}

function maskEmail(v: string): string {
  const [l, d] = v.split('@');
  if (!d) return v;
  return `${l.slice(0, 2)}***@${d}`;
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') ?? '';
  if (!token) {
    return new NextResponse(htmlConfirm(false), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
  const decoded = decodeToken(token);
  if (!decoded) {
    return new NextResponse(htmlConfirm(false), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
  const ok = await softDelete(decoded.email, decoded.slug);
  return new NextResponse(htmlConfirm(ok, decoded.email), {
    status: ok ? 200 : 502,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export async function POST(req: NextRequest) {
  let body: UnsubPayload = {};
  try {
    body = (await req.json()) as UnsubPayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }
  if (!body.email || !body.slug) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });
  }
  const ok = await softDelete(body.email, body.slug);
  return NextResponse.json({ ok });
}

export const dynamic = 'force-dynamic';
