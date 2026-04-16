import { NextRequest, NextResponse } from 'next/server';

import type { IdentifyDimensionScore } from '@/lib/identify/scoring';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

interface IdentifyPreviewRow {
  id: string;
  share_token: string;
  persona_slug: string;
  actor_display_name: string;
  subject_display_name: string;
  dimension_scores: IdentifyDimensionScore[];
  created_at: string;
}

function json(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=60',
      ...init?.headers,
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const shareToken = request.nextUrl.searchParams.get('shareToken')?.trim();

    if (!shareToken) {
      return json({ error: 'shareToken is required' }, { status: 400 });
    }

    const adminClient = createAdminSupabaseClient();
    const { data, error } = await adminClient
      .from('identify_assessments')
      .select('id, share_token, persona_slug, actor_display_name, subject_display_name, dimension_scores, created_at')
      .eq('share_token', shareToken)
      .single();

    if (error || !data) {
      return json({ error: 'Assessment not found' }, { status: 404 });
    }

    const row = data as IdentifyPreviewRow;

    return json({
      id: row.id,
      shareToken: row.share_token,
      personaSlug: row.persona_slug,
      actorDisplayName: row.actor_display_name || '你的朋友',
      subjectDisplayName: row.subject_display_name || '你',
      dimensionScores: row.dimension_scores,
      createdAt: row.created_at,
    });
  } catch (error) {
    console.error('[identify/preview GET] Unexpected error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}