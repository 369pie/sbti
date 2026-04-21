import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { CodexRecord, CodexScenarioBucket } from './codex-archive';

export interface CodexRecordInput {
  id?: string;
  relationshipSlug: string;
  personalitySlugA: string;
  personalitySlugB?: string;
  partnerNickname?: string;
  note?: string;
  scenario?: CodexScenarioBucket;
  compatibility?: number;
  createdAt?: number;
  updatedAt?: number;
  reTestCount?: number;
}

interface CodexRecordRow {
  id: string;
  client_record_id: string | null;
  relationship_slug: string;
  personality_slug_a: string;
  personality_slug_b: string | null;
  partner_nickname: string | null;
  note: string | null;
  scenario: CodexScenarioBucket;
  compatibility: number | null;
  re_test_count: number;
  created_at: string;
  updated_at: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function rowToCodexRecord(row: CodexRecordRow): CodexRecord {
  return {
    id: row.client_record_id ?? row.id,
    relationshipSlug: row.relationship_slug,
    personalitySlugA: row.personality_slug_a,
    personalitySlugB: row.personality_slug_b ?? undefined,
    partnerNickname: row.partner_nickname ?? undefined,
    note: row.note ?? undefined,
    scenario: row.scenario,
    compatibility: row.compatibility ?? undefined,
    reTestCount: row.re_test_count,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

function inputToRow(userId: string, input: CodexRecordInput) {
  const now = new Date();
  return {
    user_id: userId,
    client_record_id: input.id ?? null,
    relationship_slug: input.relationshipSlug,
    personality_slug_a: input.personalitySlugA,
    personality_slug_b: input.personalitySlugB ?? null,
    partner_nickname: input.partnerNickname ?? null,
    note: input.note ?? null,
    scenario: input.scenario ?? 'other',
    compatibility: input.compatibility ?? null,
    re_test_count: input.reTestCount ?? 0,
    created_at: input.createdAt ? new Date(input.createdAt).toISOString() : now.toISOString(),
    updated_at: input.updatedAt ? new Date(input.updatedAt).toISOString() : now.toISOString(),
  };
}

async function fetchByIdentifier(userId: string, id: string): Promise<CodexRecordRow | null> {
  const admin = createAdminSupabaseClient();
  const byPrimaryKey = UUID_RE.test(id);
  const primaryColumn = byPrimaryKey ? 'id' : 'client_record_id';
  const fallbackColumn = byPrimaryKey ? 'client_record_id' : 'id';

  let query = admin
    .from('cpti_relationship_records')
    .select(`
      id,
      client_record_id,
      relationship_slug,
      personality_slug_a,
      personality_slug_b,
      partner_nickname,
      note,
      scenario,
      compatibility,
      re_test_count,
      created_at,
      updated_at
    `)
    .eq('user_id', userId)
    .eq(primaryColumn, id)
    .maybeSingle<CodexRecordRow>();

  let { data, error } = await query;
  if (error) throw error;
  if (data) return data;

  query = admin
    .from('cpti_relationship_records')
    .select(`
      id,
      client_record_id,
      relationship_slug,
      personality_slug_a,
      personality_slug_b,
      partner_nickname,
      note,
      scenario,
      compatibility,
      re_test_count,
      created_at,
      updated_at
    `)
    .eq('user_id', userId)
    .eq(fallbackColumn, id)
    .maybeSingle<CodexRecordRow>();

  ({ data, error } = await query);
  if (error) throw error;
  return data ?? null;
}

export async function listCodexRecordsForUser(userId: string): Promise<CodexRecord[]> {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('cpti_relationship_records')
    .select(`
      id,
      client_record_id,
      relationship_slug,
      personality_slug_a,
      personality_slug_b,
      partner_nickname,
      note,
      scenario,
      compatibility,
      re_test_count,
      created_at,
      updated_at
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as CodexRecordRow[]).map(rowToCodexRecord);
}

export async function upsertCodexRecordsForUser(userId: string, inputs: CodexRecordInput[]): Promise<CodexRecord[]> {
  if (inputs.length === 0) return [];

  const admin = createAdminSupabaseClient();
  const rows = inputs.map((input) => inputToRow(userId, input));
  const withClientRecordId = rows.filter((row) => row.client_record_id !== null);
  const withoutClientRecordId = rows.filter((row) => row.client_record_id === null);
  const inserted: CodexRecordRow[] = [];

  if (withClientRecordId.length > 0) {
    const { data, error } = await admin
      .from('cpti_relationship_records')
      .upsert(withClientRecordId, { onConflict: 'user_id,client_record_id' })
      .select(`
        id,
        client_record_id,
        relationship_slug,
        personality_slug_a,
        personality_slug_b,
        partner_nickname,
        note,
        scenario,
        compatibility,
        re_test_count,
        created_at,
        updated_at
      `);

    if (error) throw error;
    inserted.push(...((data ?? []) as CodexRecordRow[]));
  }

  if (withoutClientRecordId.length > 0) {
    const { data, error } = await admin
      .from('cpti_relationship_records')
      .insert(withoutClientRecordId)
      .select(`
        id,
        client_record_id,
        relationship_slug,
        personality_slug_a,
        personality_slug_b,
        partner_nickname,
        note,
        scenario,
        compatibility,
        re_test_count,
        created_at,
        updated_at
      `);

    if (error) throw error;
    inserted.push(...((data ?? []) as CodexRecordRow[]));
  }

  return inserted.map(rowToCodexRecord);
}

export async function updateCodexRecordForUser(
  userId: string,
  id: string,
  patch: {
    partnerNickname?: string | null;
    note?: string | null;
    scenario?: CodexScenarioBucket;
  },
): Promise<CodexRecord | null> {
  const existing = await fetchByIdentifier(userId, id);
  if (!existing) return null;

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('cpti_relationship_records')
    .update({
      partner_nickname: patch.partnerNickname !== undefined ? patch.partnerNickname : existing.partner_nickname,
      note: patch.note !== undefined ? patch.note : existing.note,
      scenario: patch.scenario ?? existing.scenario,
    })
    .eq('user_id', userId)
    .eq('id', existing.id)
    .select(`
      id,
      client_record_id,
      relationship_slug,
      personality_slug_a,
      personality_slug_b,
      partner_nickname,
      note,
      scenario,
      compatibility,
      re_test_count,
      created_at,
      updated_at
    `)
    .maybeSingle<CodexRecordRow>();

  if (error) throw error;
  return data ? rowToCodexRecord(data) : null;
}

export async function deleteCodexRecordForUser(userId: string, id: string): Promise<boolean> {
  const existing = await fetchByIdentifier(userId, id);
  if (!existing) return false;

  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from('cpti_relationship_records')
    .delete()
    .eq('user_id', userId)
    .eq('id', existing.id);

  if (error) throw error;
  return true;
}