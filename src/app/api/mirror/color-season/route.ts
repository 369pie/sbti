/**
 * POST /api/mirror/color-season — lite season diagnosis + has_color_season on her_profiles.
 * Optional selfie processed in-memory only.
 */
import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

import { upsertHerProfileFlags } from '@/lib/her/profile-flags';
import {
  diagnoseColorSeason,
  type ContrastLevel,
  type MetalPref,
  type VeinTone,
} from '@/lib/mirror/color-season';
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

function parseVein(v: unknown): VeinTone | null {
  return v === 'cool' || v === 'warm' || v === 'neutral' ? v : null;
}
function parseContrast(v: unknown): ContrastLevel | null {
  return v === 'low' || v === 'mid' || v === 'high' ? v : null;
}
function parseMetal(v: unknown): MetalPref | null {
  return v === 'silver' || v === 'gold' || v === 'both' ? v : null;
}

export const POST = withClaimedAuth(async (req: NextRequest, _ctx, user: User) => {
  maybeCleanup();
  const limited = rateLimit(resolveRateLimitKey(req, `mirror-color:${user.id}`), {
    windowMs: 60_000,
    limit: 10,
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

  const veinTone = parseVein(record.veinTone);
  const contrast = parseContrast(record.contrast);
  const metal = parseMetal(record.metal);
  if (!veinTone || !contrast || !metal) {
    return json({ error: 'invalid_answers' }, { status: 400 });
  }

  const imageDataUrl = optionalImage(record.imageDataUrl);
  const result = await diagnoseColorSeason({ veinTone, contrast, metal, imageDataUrl });

  const metaBirth =
    typeof user.user_metadata?.birth_year === 'number' ? (user.user_metadata.birth_year as number) : null;
  const flagResult = await upsertHerProfileFlags(
    user.id,
    { has_color_season: true, color_season: result.season },
    { birthYear: metaBirth },
  );

  return json({
    ok: true,
    result,
    profile: flagResult.ok
      ? {
          has_palm: flagResult.profile.has_palm,
          has_color_season: flagResult.profile.has_color_season,
          color_season: flagResult.profile.color_season,
          completeness_pct: flagResult.profile.completeness_pct,
        }
      : null,
    profileError: flagResult.ok ? null : flagResult.error,
    photoRetained: false,
  });
});
