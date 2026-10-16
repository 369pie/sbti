/**
 * /api/hermosa/admin/curation
 * ─────────────────────────────────────────────
 * Sprint 3 内部 AI 辅助策展（无 LLM 依赖版）。
 *
 * 仅返回"建议"，永远不写库；编辑必须人工确认后再发布。
 *
 * GET /api/hermosa/admin/curation?token=...&week=2026-W19[&pool=consented|selected|published]
 *
 * Response: {
 *   topicWeek, topicQuestion, total, byKind, groups[], summaryDraft, biasFindings[]
 * }
 */

import { NextResponse, type NextRequest } from 'next/server';
import { fetchHermosaArtifacts, type HermosaArtifactKind, type HermosaArtifactRow } from '@/lib/hermosa/public-artifacts';
import { buildEditorSummaryDraft, clusterContributions, runBiasChecklist } from '@/lib/hermosa/curation';
import { getHermosaTopic } from '@/lib/hermosa/topics';
import { isHermosaTopicWeek } from '@/lib/hermosa/tags';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getToken(req: NextRequest): string | null {
  return (
    req.nextUrl.searchParams.get('token') ??
    req.headers.get('x-admin-token') ??
    null
  );
}

function getExpectedToken(): string | null {
  return process.env.ADMIN_HERMOSA_TOKEN ?? process.env.ADMIN_FUNNEL_TOKEN ?? null;
}

const KINDS: readonly HermosaArtifactKind[] = ['voice', 'book', 'ai_question'];

export async function GET(req: NextRequest) {
  const expected = getExpectedToken();
  if (!expected) {
    return NextResponse.json(
      { error: 'ADMIN_HERMOSA_TOKEN (or ADMIN_FUNNEL_TOKEN) not configured' },
      { status: 503 },
    );
  }
  if (getToken(req) !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const weekParam = req.nextUrl.searchParams.get('week');
  const week = weekParam && isHermosaTopicWeek(weekParam) ? weekParam : null;
  const topic = getHermosaTopic(week);

  const pool = req.nextUrl.searchParams.get('pool') ?? 'consented';
  const consentedOnly = pool === 'consented' || pool === 'selected' || pool === 'published';
  const selectedOnly = pool === 'selected' || pool === 'published';

  const all: HermosaArtifactRow[] = [];
  for (const kind of KINDS) {
    const rows = await fetchHermosaArtifacts({
      kind,
      week: topic.week,
      limit: 120,
      consentedOnly,
      selectedOnly,
    });
    all.push(...rows);
  }

  const cluster = clusterContributions(all, topic.week);
  const summaryDraft = buildEditorSummaryDraft(all, {
    topicWeek: topic.week,
    topicQuestion: topic.question,
  });
  const biasFindings = runBiasChecklist(all);

  return NextResponse.json({
    topicWeek: topic.week,
    topicQuestion: topic.question,
    pool,
    total: cluster.total,
    byKind: cluster.byKind,
    groups: cluster.groups.map((g) => ({
      key: g.key,
      label: g.label,
      count: g.rows.length,
      byKind: g.byKind,
      totalEcho: g.totalEcho,
      representative: g.representative,
      sampleIds: g.rows.slice(0, 6).map((r) => r.id),
    })),
    summaryDraft,
    biasFindings,
  });
}
