import { NextResponse, type NextRequest } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { maybeCleanup, rateLimit, resolveRateLimitKey } from '@/lib/perf/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface EventInput {
  module?: unknown;
  event?: unknown;
  slug?: unknown;
  code?: unknown;
  tier?: unknown;
  step?: unknown;
  value?: unknown;
  ok?: unknown;
  session_id?: unknown;
  pathname?: unknown;
  referrer?: unknown;
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
  ua?: unknown;
  ts?: unknown;
  props?: unknown;
}

interface IngestBody {
  deviceId?: unknown;
  events?: unknown;
}

// Whitelist of known modules. Add new ones here as they are wired in.
const ALLOWED_MODULES = new Set([
  'first_look',
  'mysti',
  'cpti',
  'soulti',
  'museum',
  'creator',
  'identify',
  'home',
  'auth',
]);

const MAX_EVENTS_PER_BATCH = 32;
const MAX_PROPS_BYTES = 2_048;

function clampString(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

function clampNumber(v: unknown): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  if (v < -1e9 || v > 1e9) return null;
  return Math.round(v * 1000) / 1000;
}

function clampProps(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
  const result: Record<string, unknown> = {};
  let bytes = 0;
  for (const [key, raw] of Object.entries(v as Record<string, unknown>)) {
    if (typeof key !== 'string' || key.length > 48) continue;
    const value =
      typeof raw === 'string'
        ? raw.slice(0, 240)
        : typeof raw === 'number' && Number.isFinite(raw)
        ? raw
        : typeof raw === 'boolean'
        ? raw
        : null;
    if (value === null) continue;
    result[key] = value;
    bytes += key.length + (typeof value === 'string' ? value.length : 8);
    if (bytes > MAX_PROPS_BYTES) break;
  }
  return Object.keys(result).length > 0 ? result : null;
}

function clampTs(v: unknown): string | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  // Ignore timestamps far outside a reasonable window (yesterday → tomorrow).
  const now = Date.now();
  if (v < now - 24 * 60 * 60 * 1000 || v > now + 60 * 1000) return null;
  return new Date(v).toISOString();
}

export async function POST(req: NextRequest) {
  let body: IngestBody;
  try {
    body = (await req.json()) as IngestBody;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const deviceId = clampString(body.deviceId, 64) ?? '';

  maybeCleanup();
  const key = `events:${resolveRateLimitKey(req, deviceId)}`;
  const limit = rateLimit(key, { limit: 60, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, throttled: true }, { status: 429 });
  }

  const raw = Array.isArray(body.events) ? (body.events as EventInput[]) : [];
  if (raw.length === 0) return NextResponse.json({ ok: true, accepted: 0 });

  const country =
    req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || null;

  const sliced = raw.slice(0, MAX_EVENTS_PER_BATCH);
  const rows = sliced
    .map((e) => {
      const moduleName = clampString(e.module, 32);
      const eventName = clampString(e.event, 64);
      if (!moduleName || !eventName || !ALLOWED_MODULES.has(moduleName)) return null;

      return {
        ts: clampTs(e.ts) ?? new Date().toISOString(),
        module: moduleName,
        event: eventName,
        slug: clampString(e.slug, 64),
        code: clampString(e.code, 32),
        tier: clampString(e.tier, 32),
        step: clampString(e.step, 48),
        value: clampNumber(e.value),
        ok: typeof e.ok === 'boolean' ? e.ok : null,
        session_id: clampString(e.session_id, 64),
        device_id: deviceId || null,
        pathname: clampString(e.pathname, 240),
        referrer: clampString(e.referrer, 240),
        utm_source: clampString(e.utm_source, 64),
        utm_medium: clampString(e.utm_medium, 64),
        utm_campaign: clampString(e.utm_campaign, 64),
        country,
        ua: clampString(e.ua, 32),
        props: clampProps(e.props),
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (rows.length === 0) return NextResponse.json({ ok: true, accepted: 0 });

  try {
    const admin = createAdminSupabaseClient();
    const { error } = await admin.from('product_events').insert(rows);
    if (error) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true, accepted: rows.length });
}
