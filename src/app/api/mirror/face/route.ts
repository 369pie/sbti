/**
 * POST /api/mirror/face — face shape + makeup advice; sets has_face on her_profiles.
 */
import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

import { upsertHerProfileFlags } from '@/lib/her/profile-flags';
import { diagnoseFaceMakeup, type FaceSelfHint } from '@/lib/mirror/face-shape';
import { maybeCleanup, rateLimit, resolveRateLimitKey } from '@/lib/perf/rate-limit';
import { withClaimedAuth } from '@/lib/supabase/with-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_IMAGE_BYTES = 3_200_000;
const DATA_URI_PATTERN = /^data:image\/(?:png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/i;

function json(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: { 'Cache-Control': 'private, no-store', ...init?.headers },
  });
}

function imageByteSize(dataUri: string): number {
  const comma = dataUri.indexOf(',');
  if (comma < 0) return Number.POSITIVE_INFINITY;
  return Math.ceil((dataUri.length - comma - 1) * 0.75);
}

function optionalImage(value: unknown): string | null {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!DATA_URI_PATTERN.test(normalized)) return null;
  if (imageByteSize(normalized) > MAX_IMAGE_BYTES) return null;
  return normalized;
}

function parseHint(body: Record<string, unknown>): FaceSelfHint | null {
  const jaw = body.jaw;
  const cheek = body.cheek;
  const length = body.length;
  if (jaw !== 'soft' && jaw !== 'angular' && jaw !== 'pointed') return null;
  if (cheek !== 'full' && cheek !== 'flat' && cheek !== 'high') return null;
  if (length !== 'short' && length !== 'balanced' && length !== 'long') return null;
  return { jaw, cheek, length };
}

export const POST = withClaimedAuth(async (req: NextRequest, _ctx, user: User) => {
  maybeCleanup();
  const limited = rateLimit(resolveRateLimitKey(req, `mirror-face:${user.id}`), {
    windowMs: 60_000,
    limit: 10,
  });
  if (!limited.allowed) return json({ error: 'rate_limited' }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, { status: 400 });
  }
  const record = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  if (record.consentAccepted !== true) return json({ error: 'consent_required' }, { status: 400 });

  const hint = parseHint(record);
  if (!hint) return json({ error: 'invalid_answers' }, { status: 400 });

  const imageDataUrl = optionalImage(record.imageDataUrl);
  const result = await diagnoseFaceMakeup({ hint, imageDataUrl });

  const metaBirth =
    typeof user.user_metadata?.birth_year === 'number' ? (user.user_metadata.birth_year as number) : null;
  const flagResult = await upsertHerProfileFlags(user.id, { has_face: true }, { birthYear: metaBirth });

  return json({
    ok: true,
    result,
    profile: flagResult.ok
      ? {
          has_face: flagResult.profile.has_face,
          completeness_pct: flagResult.profile.completeness_pct,
        }
      : null,
    photoRetained: false,
  });
});
