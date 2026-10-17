/**
 * POST /api/mirror/palm — palm photo → structured reading + has_palm stub on her_profiles.
 * Image is processed in-memory only; never written to storage/DB.
 */
import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

import { upsertHerProfileFlags } from '@/lib/her/profile-flags';
import { analyzePalmFromImage, type PalmHand } from '@/lib/mirror/palm-reading';
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

function validateImageDataUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!DATA_URI_PATTERN.test(normalized)) return null;
  if (imageByteSize(normalized) > MAX_IMAGE_BYTES) return null;
  return normalized;
}

export const POST = withClaimedAuth(async (req: NextRequest, _ctx, user: User) => {
  maybeCleanup();
  const limited = rateLimit(resolveRateLimitKey(req, `mirror-palm:${user.id}`), {
    windowMs: 60_000,
    limit: 8,
  });
  if (!limited.allowed) {
    return json({ error: 'rate_limited' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, { status: 400 });
  }

  const record = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  if (record.consentAccepted !== true) {
    return json({ error: 'consent_required' }, { status: 400 });
  }

  const hand: PalmHand = record.hand === 'left' ? 'left' : 'right';
  const imageDataUrl = validateImageDataUrl(record.imageDataUrl);
  if (!imageDataUrl) {
    return json({ error: 'invalid_image' }, { status: 400 });
  }

  const reading = await analyzePalmFromImage({ imageDataUrl, hand });

  const metaBirth =
    typeof user.user_metadata?.birth_year === 'number' ? (user.user_metadata.birth_year as number) : null;
  const flagResult = await upsertHerProfileFlags(
    user.id,
    { has_palm: true },
    { birthYear: metaBirth },
  );

  return json({
    ok: true,
    reading,
    profile: flagResult.ok
      ? {
          has_palm: flagResult.profile.has_palm,
          has_color_season: flagResult.profile.has_color_season,
          completeness_pct: flagResult.profile.completeness_pct,
        }
      : null,
    profileError: flagResult.ok ? null : flagResult.error,
    // Explicit: photo not stored
    photoRetained: false,
  });
});
