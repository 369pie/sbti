import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { withAuth } from '@/lib/supabase/with-auth';
import type { CodexScenarioBucket } from '@/lib/cpti/codex-archive';
import {
  listCodexRecordsForUser,
  upsertCodexRecordsForUser,
  type CodexRecordInput,
} from '@/lib/cpti/codex-server';

function clampText(value: unknown, max = 160): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

function normalizeScenario(value: unknown): CodexScenarioBucket | undefined {
  const scenario = clampText(value, 16);
  if (!scenario) return undefined;
  if (scenario === 'lover' || scenario === 'bestie' || scenario === 'family' || scenario === 'work' || scenario === 'enemy' || scenario === 'other') {
    return scenario;
  }
  return undefined;
}

function normalizeNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return value;
}

function normalizeRecord(value: unknown): CodexRecordInput | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const relationshipSlug = clampText(record.relationshipSlug, 64);
  const personalitySlugA = clampText(record.personalitySlugA, 64);
  if (!relationshipSlug || !personalitySlugA) return null;

  return {
    id: clampText(record.id, 128),
    relationshipSlug,
    personalitySlugA,
    personalitySlugB: clampText(record.personalitySlugB, 64),
    partnerNickname: clampText(record.partnerNickname, 48),
    note: clampText(record.note, 280),
    scenario: normalizeScenario(record.scenario),
    compatibility: normalizeNumber(record.compatibility),
    createdAt: normalizeNumber(record.createdAt),
    updatedAt: normalizeNumber(record.updatedAt),
    reTestCount: normalizeNumber(record.reTestCount),
  };
}

export const GET = withAuth(async (
  _req: NextRequest,
  _context: { params: Promise<Record<string, string>> },
  user: User,
) => {
  try {
    const records = await listCodexRecordsForUser(user.id);
    return NextResponse.json({ records });
  } catch (error) {
    console.error('[cpti/codex GET] Failed:', error);
    return NextResponse.json({ error: 'Failed to load codex records' }, { status: 500 });
  }
});

export const POST = withAuth(async (
  req: NextRequest,
  _context: { params: Promise<Record<string, string>> },
  user: User,
) => {
  let body: { records?: unknown };
  try {
    body = (await req.json()) as { records?: unknown };
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const incoming = Array.isArray(body.records) ? body.records : [];
  const records = incoming
    .map(normalizeRecord)
    .filter((record): record is CodexRecordInput => record !== null);

  if (records.length === 0) {
    return NextResponse.json({ error: 'records_required' }, { status: 400 });
  }

  try {
    const saved = await upsertCodexRecordsForUser(user.id, records);
    return NextResponse.json({ records: saved }, { status: 201 });
  } catch (error) {
    console.error('[cpti/codex POST] Failed:', error);
    return NextResponse.json({ error: 'Failed to save codex records' }, { status: 500 });
  }
});