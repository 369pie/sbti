/**
 * Soul Letter Subscribe API · POST /api/soulti/soul-letter/subscribe
 *
 * Strategy doc: docs/02-modules/soulti/soulti-viral-product-strategy-2026-04-19.md (E6)
 *
 * MVP scaffold: receives the subscription, validates payload, persists to
 * Supabase if configured (`soul_letter_subscriptions` table — see below), and
 * always returns 200 so the client UX stays smooth even if the table is
 * not provisioned yet. A separate cron job (Vercel Cron / Supabase scheduled
 * function) will pick up rows due for D+1 / D+3 / D+7 delivery.
 *
 * Expected table shape (apply via Supabase migration when ready):
 *
 *   create table public.soul_letter_subscriptions (
 *     id uuid primary key default gen_random_uuid(),
 *     email text not null,
 *     slug text not null,
 *     code text,
 *     tear_rate_percent int,
 *     opted_extended boolean default false,
 *     subscribed_at timestamptz default now(),
 *     last_sent_at timestamptz,
 *     last_sent_kind text, -- 'd1' | 'd3' | 'd7'
 *     unique (email, slug)
 *   );
 *   alter table public.soul_letter_subscriptions enable row level security;
 *   -- (no public select; only service_role for cron + admin reads)
 */

import { NextResponse } from 'next/server';

interface SubscribePayload {
  email?: string;
  slug?: string;
  code?: string;
  tearRatePercent?: number;
  optedExtended?: boolean;
}

function isValidEmail(v: unknown): v is string {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export async function POST(request: Request) {
  let payload: SubscribePayload;
  try {
    payload = (await request.json()) as SubscribePayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  if (!isValidEmail(payload.email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
  }
  if (typeof payload.slug !== 'string' || payload.slug.length === 0) {
    return NextResponse.json({ ok: false, error: 'invalid_slug' }, { status: 400 });
  }

  const record = {
    email: payload.email!.trim().toLowerCase(),
    slug: payload.slug,
    code: typeof payload.code === 'string' ? payload.code : null,
    tear_rate_percent:
      typeof payload.tearRatePercent === 'number' && Number.isFinite(payload.tearRatePercent)
        ? Math.max(0, Math.min(100, Math.round(payload.tearRatePercent)))
        : null,
    opted_extended: Boolean(payload.optedExtended),
    subscribed_at: new Date().toISOString(),
  };

  // Persist to Supabase if configured. We import lazily and tolerate absence
  // so local/preview environments that haven't provisioned the table still get
  // a 200 (UX consistency).
  try {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && serviceKey) {
      // Use the REST endpoint directly to avoid pulling supabase-js into the
      // edge bundle. Upsert on (email, slug).
      const res = await fetch(`${url}/rest/v1/soul_letter_subscriptions?on_conflict=email,slug`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify(record),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        // Common case: table not provisioned yet → log + soft-success
        console.warn('[soul-letter] supabase upsert non-ok', res.status, body.slice(0, 200));
      }
    } else {
      // No env → log so we know intake during dev but still respond ok
      console.info('[soul-letter] intake (no supabase configured)', {
        email: record.email,
        slug: record.slug,
      });
    }
  } catch (err) {
    console.warn('[soul-letter] supabase persist threw', err);
  }

  return NextResponse.json({ ok: true });
}

// Disable static optimization; this is a pure request handler
export const dynamic = 'force-dynamic';
