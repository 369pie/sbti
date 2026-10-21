/**
 * POST /api/deep/<kind>/  — the only way paid deep-report content reaches a browser.
 * Body: { slug, partner?, deviceId?, ... }. 403 unless checkDeepEntitlement passes
 * (active member incl. legacy pass, or paid order for sku+resource on this device).
 */
import { NextRequest, NextResponse } from 'next/server';
import { checkDeepEntitlement } from '@/lib/deep/entitlement';
import { DEEP_KINDS } from '@/lib/deep/registry.server';
import { maybeCleanup, rateLimit, resolveRateLimitKey } from '@/lib/perf/rate-limit';

export const dynamic = 'force-dynamic';

type Body = Record<string, unknown>;

export async function POST(req: NextRequest, ctx: { params: Promise<{ kind: string }> }) {
  const { kind } = await ctx.params;
  const def = DEEP_KINDS[kind];
  if (!def) return NextResponse.json({ error: 'unknown_kind' }, { status: 404 });

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const str = (k: string) => (typeof body[k] === 'string' ? (body[k] as string).slice(0, 96) : null);
  const deviceId = str('deviceId');

  maybeCleanup();
  const rl = rateLimit(`deep:${kind}:${resolveRateLimitKey(req, deviceId ?? undefined)}`, { limit: 30, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const target = def.resolve(str);
  if (!target) return NextResponse.json({ error: 'invalid_params' }, { status: 400 });

  const ent = await checkDeepEntitlement({ sku: target.sku, resourceId: target.resourceId, deviceId });
  if (!ent.unlocked) {
    return NextResponse.json({ error: 'not_entitled', sku: target.sku }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }
  const data = await target.build();
  if (data == null) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ data, via: ent.via }, { headers: { 'Cache-Control': 'private, no-store' } });
}
