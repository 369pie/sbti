import { NextResponse } from 'next/server';

import { consumeServerLingBiBySku, getServerLingBiSnapshot } from '@/lib/wallet/server';
import { isSupabaseConfigError } from '@/lib/supabase/env';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SKU_COSTS } from '@/lib/wallet/ling-bi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      'Cache-Control': 'private, no-store',
      ...init?.headers,
    },
  });
}

async function getUserId() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.getClaims().catch(() => null);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user.id;
}

export async function GET(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return json(
        {
          error: 'Authentication required',
          needsSignIn: true,
        },
        { status: 401 },
      );
    }

    const url = new URL(req.url);
    const limit = Number.parseInt(url.searchParams.get('limit') ?? '40', 10);
    const snapshot = await getServerLingBiSnapshot(userId, Number.isFinite(limit) ? limit : 40);

    return json({
      ok: true,
      ...snapshot,
    });
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return json({ error: 'Supabase is not configured' }, { status: 503 });
    }
    console.error('[wallet/ling-bi GET] Failed to load wallet:', error);
    return json({ error: 'Failed to load Ling-Bi wallet' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return json(
        {
          error: 'Authentication required',
          needsSignIn: true,
        },
        { status: 401 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid request body' }, { status: 400 });
    }

    const raw = body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};
    const action = raw.action;

    if (action !== 'consume') {
      return json({ error: 'Unsupported wallet action' }, { status: 400 });
    }

    const skuKey = typeof raw.skuKey === 'string' ? raw.skuKey : '';
    if (!(skuKey in SKU_COSTS)) {
      return json({ error: 'Invalid skuKey' }, { status: 400 });
    }

    const idempotencyKey = typeof raw.idempotencyKey === 'string' ? raw.idempotencyKey.trim() : '';
    if (idempotencyKey.length < 8 || idempotencyKey.length > 160) {
      return json({ error: 'Invalid idempotencyKey' }, { status: 400 });
    }

    const result = await consumeServerLingBiBySku(userId, skuKey, {
      idempotencyKey,
      resourceId: typeof raw.resourceId === 'string' ? raw.resourceId.slice(0, 240) : undefined,
      note: typeof raw.note === 'string' ? raw.note.slice(0, 240) : undefined,
      metadata: {
        source: 'wallet_api_consume',
      },
    });

    if (!result.ok) {
      return json(
        {
          ok: false,
          reason: result.reason,
          balance: result.balance,
          required: result.required,
        },
        { status: result.reason === 'insufficient' ? 402 : 400 },
      );
    }

    return json({
      ok: true,
      balance: result.balance,
      ledgerId: result.ledgerId,
      applied: result.applied,
      required: result.required,
    });
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return json({ error: 'Supabase is not configured' }, { status: 503 });
    }
    console.error('[wallet/ling-bi POST] Failed to mutate wallet:', error);
    return json({ error: 'Failed to mutate Ling-Bi wallet' }, { status: 500 });
  }
}
