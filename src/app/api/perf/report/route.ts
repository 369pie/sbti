import { NextResponse, type NextRequest } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { maybeCleanup, rateLimit, resolveRateLimitKey } from '@/lib/perf/rate-limit';

export const runtime = 'nodejs';
// Always private — never cached.
export const dynamic = 'force-dynamic';

interface MetricInput {
  metric?: unknown;
  value?: unknown;
  rating?: unknown;
  pathname?: unknown;
  label?: unknown;
  connection?: unknown;
  ua?: unknown;
}

interface PerfReportBody {
  deviceId?: unknown;
  metrics?: unknown;
}

const ALLOWED_METRICS = new Set([
  'LCP', 'CLS', 'INP', 'FCP', 'TTFB', 'NAV', 'CUSTOM',
]);
const ALLOWED_RATINGS = new Set(['good', 'needs-improvement', 'poor']);

function clampString(v: unknown, max = 120): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

function clampNumber(v: unknown): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  // Reject absurd values (e.g. > 10 minutes).
  if (v < 0 || v > 600_000) return null;
  return Math.round(v * 1000) / 1000;
}

export async function POST(req: NextRequest) {
  let body: PerfReportBody;
  try {
    body = (await req.json()) as PerfReportBody;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const deviceId = clampString(body.deviceId, 64) ?? '';
  // Per-device + IP token bucket: 60 reports / 60s.
  maybeCleanup();
  const key = `perf:${resolveRateLimitKey(req, deviceId)}`;
  const limit = rateLimit(key, { limit: 60, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, throttled: true }, { status: 429 });
  }

  const raw = Array.isArray(body.metrics) ? (body.metrics as MetricInput[]) : [];
  if (raw.length === 0) return NextResponse.json({ ok: true, accepted: 0 });

  const country =
    req.headers.get('x-vercel-ip-country') ||
    req.headers.get('cf-ipcountry') ||
    null;

  // Cap batch size defensively.
  const sliced = raw.slice(0, 32);
  const rows = sliced
    .map((m) => {
      const metric = clampString(m.metric, 16);
      const value = clampNumber(m.value);
      if (!metric || value === null) return null;
      if (!ALLOWED_METRICS.has(metric)) return null;
      const pathname = clampString(m.pathname, 240);
      if (!pathname) return null;
      const rating = clampString(m.rating, 32);
      const ua = clampString(m.ua, 32);
      const connection = clampString(m.connection, 16);
      const label = clampString(m.label, 80);
      return {
        device_id: deviceId || null,
        metric,
        value,
        rating: rating && ALLOWED_RATINGS.has(rating) ? rating : null,
        pathname,
        label,
        connection,
        country,
        ua,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (rows.length === 0) return NextResponse.json({ ok: true, accepted: 0 });

  try {
    const admin = createAdminSupabaseClient();
    const { error } = await admin.from('perf_metrics').insert(rows);
    if (error) {
      // Don't leak DB errors to the browser; just NACK.
      return NextResponse.json({ ok: false }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true, accepted: rows.length });
}
