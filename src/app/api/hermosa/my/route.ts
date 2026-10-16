/**
 * /api/hermosa/my
 * ─────────────────────────────────────────────
 * Sprint 4：个人贡献档案。
 *
 * 客户端把"自己提交过的留言 id 列表"存在 localStorage
 * （key: `hermosa.contributions.v1`），这里按 id 拉取最新状态，
 * 用于个人档案、徽章和"被选入"通知。
 *
 * 仅返回该用户的可见信息（已通过安全过滤的字段子集）。
 *
 * GET /api/hermosa/my?ids=uuid1,uuid2,...   （最多 50 个）
 *
 * Response: { rows: HermosaMyRow[], missing: string[] }
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type {
  HermosaContributionMetadata,
  HermosaCurationStatus,
  HermosaKind,
} from '@/lib/hermosa/tags';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_IDS = 50;

interface HermosaMyRow {
  id: string;
  universe: string;
  slug: string | null;
  kind: HermosaKind;
  text: string;
  signature: string | null;
  tags: string[];
  metadata: HermosaContributionMetadata;
  topic_week: string | null;
  curation_status: HermosaCurationStatus;
  status: string | null;
  status_note: string | null;
  consent_to_feature: boolean;
  is_featured: boolean;
  is_published: boolean;
  flagged: boolean;
  echo_count: number;
  // HER AURORA · W3 · 极光生命周期
  lifecycle?: 'lit' | 'caught' | 'tended' | 'inscribed' | 'codex';
  inscribed_letter_slug?: string | null;
  codex_atlas_slug?: string | null;
  created_at: string;
}

function parseIds(input: string | null): string[] {
  if (!input) return [];
  const seen = new Set<string>();
  for (const raw of input.split(',')) {
    const id = raw.trim().toLowerCase();
    if (UUID_RE.test(id)) seen.add(id);
    if (seen.size >= MAX_IDS) break;
  }
  return Array.from(seen);
}

export async function GET(req: NextRequest) {
  const ids = parseIds(req.nextUrl.searchParams.get('ids'));
  if (ids.length === 0) {
    return NextResponse.json({ rows: [] as HermosaMyRow[], missing: [] as string[] });
  }

  let admin;
  try {
    admin = createAdminSupabaseClient();
  } catch {
    return NextResponse.json({ rows: [] as HermosaMyRow[], missing: ids });
  }

  const { data, error } = await admin
    .from('hermosa_messages')
    .select(
      'id,universe,slug,kind,text,signature,tags,metadata,topic_week,curation_status,status,status_note,consent_to_feature,is_featured,is_published,flagged,echo_count,lifecycle,inscribed_letter_slug,codex_atlas_slug,created_at',
    )
    .in('id', ids)
    .limit(MAX_IDS);

  if (error) {
    console.warn('[hermosa/my] error', error.message);
    return NextResponse.json({ rows: [] as HermosaMyRow[], missing: ids });
  }

  const rows = (data ?? []) as HermosaMyRow[];
  const got = new Set(rows.map((r) => r.id));
  const missing = ids.filter((id) => !got.has(id));

  return NextResponse.json({ rows, missing });
}
