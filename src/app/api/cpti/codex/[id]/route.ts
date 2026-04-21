import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { withAuth } from '@/lib/supabase/with-auth';
import type { CodexScenarioBucket } from '@/lib/cpti/codex-archive';
import { deleteCodexRecordForUser, updateCodexRecordForUser } from '@/lib/cpti/codex-server';

function normalizeOptionalText(value: unknown, max = 280): string | null | undefined {
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function normalizeScenario(value: unknown): CodexScenarioBucket | undefined {
  const scenario = normalizeOptionalText(value, 16);
  if (!scenario) return undefined;
  if (scenario === 'lover' || scenario === 'bestie' || scenario === 'family' || scenario === 'work' || scenario === 'enemy' || scenario === 'other') {
    return scenario;
  }
  return undefined;
}

export const PATCH = withAuth(async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> },
  user: User,
) => {
  const params = await context.params;
  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: 'id_required' }, { status: 400 });
  }

  let body: { partnerNickname?: unknown; note?: unknown; scenario?: unknown };
  try {
    body = (await req.json()) as { partnerNickname?: unknown; note?: unknown; scenario?: unknown };
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const hasPartnerNickname = Object.prototype.hasOwnProperty.call(body, 'partnerNickname');
  const hasNote = Object.prototype.hasOwnProperty.call(body, 'note');
  const hasScenario = Object.prototype.hasOwnProperty.call(body, 'scenario');

  const patch = {
    partnerNickname: hasPartnerNickname ? normalizeOptionalText(body.partnerNickname, 48) : undefined,
    note: hasNote ? normalizeOptionalText(body.note, 280) : undefined,
    scenario: hasScenario ? normalizeScenario(body.scenario) : undefined,
  };

  if (!hasPartnerNickname && !hasNote && !hasScenario) {
    return NextResponse.json({ error: 'empty_patch' }, { status: 400 });
  }

  try {
    const record = await updateCodexRecordForUser(user.id, id, patch);
    if (!record) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ record });
  } catch (error) {
    console.error('[cpti/codex PATCH] Failed:', error);
    return NextResponse.json({ error: 'Failed to update codex record' }, { status: 500 });
  }
});

export const DELETE = withAuth(async (
  _req: NextRequest,
  context: { params: Promise<Record<string, string>> },
  user: User,
) => {
  const params = await context.params;
  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: 'id_required' }, { status: 400 });
  }

  try {
    const ok = await deleteCodexRecordForUser(user.id, id);
    if (!ok) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[cpti/codex DELETE] Failed:', error);
    return NextResponse.json({ error: 'Failed to delete codex record' }, { status: 500 });
  }
});