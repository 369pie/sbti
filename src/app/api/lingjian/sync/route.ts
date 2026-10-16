import { NextResponse } from 'next/server';

import type { LingjianEntryType, LingjianSyncEntry } from '@/lib/lingjian/codex';
import { isSupabaseConfigError } from '@/lib/supabase/env';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_SYNC_ENTRIES = 160;
const MAX_TEXT_LENGTH = 500;
const MAX_PAYLOAD_CHARS = 50_000;
const ENTRY_TYPES = new Set<LingjianEntryType>([
  'wtfti_profile',
  'mirror_report',
  'mysti_decision',
  'mysti_destiny',
  'mysti_dual',
  'wallet_ledger',
]);

type LingjianRow = {
  id: string;
  client_entry_id: string;
  entry_type: LingjianEntryType;
  title: string;
  summary: string;
  source_created_at: string | null;
  created_at: string;
  updated_at: string;
};

function json(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      'Cache-Control': 'private, no-store',
      ...init?.headers,
    },
  });
}

function trimText(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback;
  const text = value.replace(/\s+/g, ' ').trim();
  return text.length > MAX_TEXT_LENGTH ? `${text.slice(0, MAX_TEXT_LENGTH - 1)}...` : text;
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizePayload(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  const text = JSON.stringify(value);
  if (text.length > MAX_PAYLOAD_CHARS) {
    return {
      truncated: true,
      reason: 'payload_too_large',
    };
  }

  return JSON.parse(text) as Record<string, unknown>;
}

function normalizeEntry(entry: unknown): LingjianSyncEntry | null {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
  const raw = entry as Record<string, unknown>;
  const clientEntryId = trimText(raw.clientEntryId);
  const type = raw.type;

  if (!clientEntryId || typeof type !== 'string' || !ENTRY_TYPES.has(type as LingjianEntryType)) {
    return null;
  }

  return {
    clientEntryId,
    type: type as LingjianEntryType,
    title: trimText(raw.title, '灵笺档案'),
    summary: trimText(raw.summary),
    sourceCreatedAt: normalizeDate(raw.sourceCreatedAt) ?? undefined,
    payload: normalizePayload(raw.payload),
  };
}

async function getSignedInContext() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      response: json(
        {
          error: 'Authentication required',
          needsSignIn: true,
        },
        { status: 401 },
      ),
    };
  }

  const isAnonymous = Boolean((user as { is_anonymous?: boolean }).is_anonymous);
  if (isAnonymous) {
    return {
      response: json(
        {
          error: 'Claim a real account before syncing Lingjian entries',
          needsClaimedAccount: true,
        },
        { status: 403 },
      ),
    };
  }

  return { supabase, user };
}

export async function GET(req: Request) {
  try {
    const context = await getSignedInContext();
    if ('response' in context) return context.response;

    const url = new URL(req.url);
    const limitParam = Number.parseInt(url.searchParams.get('limit') ?? '20', 10);
    const limit = Math.min(Math.max(Number.isFinite(limitParam) ? limitParam : 20, 1), 100);

    const { data, error, count } = await context.supabase
      .from('lingjian_entries')
      .select(
        'id, client_entry_id, entry_type, title, summary, source_created_at, created_at, updated_at',
        { count: 'exact' },
      )
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[lingjian/sync GET] Failed to load entries:', error);
      return json({ error: 'Failed to load Lingjian entries' }, { status: 500 });
    }

    const rows = (data ?? []) as LingjianRow[];
    return json({
      ok: true,
      count: count ?? rows.length,
      latestSyncedAt: rows[0]?.updated_at ?? null,
      entries: rows,
    });
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return json({ error: 'Supabase is not configured' }, { status: 503 });
    }
    console.error('[lingjian/sync GET] Unexpected error:', error);
    return json({ error: 'Failed to load Lingjian entries' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const context = await getSignedInContext();
    if ('response' in context) return context.response;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid request body' }, { status: 400 });
    }

    const rawEntries =
      body && typeof body === 'object' && !Array.isArray(body)
        ? (body as Record<string, unknown>).entries
        : null;

    if (!Array.isArray(rawEntries)) {
      return json({ error: 'entries must be an array' }, { status: 400 });
    }

    const entries = rawEntries
      .slice(0, MAX_SYNC_ENTRIES)
      .map(normalizeEntry)
      .filter((entry): entry is LingjianSyncEntry => Boolean(entry));

    if (entries.length === 0) {
      return json({
        ok: true,
        synced: 0,
        skipped: rawEntries.length,
      });
    }

    const rows = entries.map((entry) => ({
      user_id: context.user.id,
      client_entry_id: entry.clientEntryId,
      entry_type: entry.type,
      title: entry.title,
      summary: entry.summary,
      source_created_at: entry.sourceCreatedAt ?? null,
      payload: entry.payload,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await context.supabase
      .from('lingjian_entries')
      .upsert(rows, {
        onConflict: 'user_id,client_entry_id',
        ignoreDuplicates: false,
      })
      .select('id, client_entry_id');

    if (error) {
      console.error('[lingjian/sync POST] Failed to sync entries:', error);
      return json({ error: 'Failed to sync Lingjian entries' }, { status: 500 });
    }

    return json({
      ok: true,
      synced: data?.length ?? entries.length,
      skipped: rawEntries.length - entries.length,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return json({ error: 'Supabase is not configured' }, { status: 503 });
    }
    console.error('[lingjian/sync POST] Unexpected error:', error);
    return json({ error: 'Failed to sync Lingjian entries' }, { status: 500 });
  }
}
