import { NextResponse } from 'next/server';

import { getIdentifyPersonaBySlug } from '@/lib/identify/personas';
import type { IdentifyDimensionScore } from '@/lib/identify/scoring';
import type { ResultDiagnostics } from '@/lib/result-diagnostics';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { getUserDisplayName, getUserNickname } from '@/lib/supabase/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface SaveIdentifyAssessmentBody {
  personaSlug?: string;
  friendName?: string;
  dimensionScores?: IdentifyDimensionScore[];
  diagnostics?: ResultDiagnostics;
  clientMutationId?: string;
}

interface IdentifyAssessmentRow {
  id: string;
  share_token: string;
  actor_display_name: string;
  subject_display_name: string;
  persona_slug: string;
  created_at: string;
}

function json(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      'Cache-Control': 'private, no-store',
      ...init?.headers,
    },
  });
}

async function ensureUserProfile(userId: string, isAnonymous: boolean, nickname: string) {
  const adminClient = createAdminSupabaseClient();
  await adminClient.from('user_profiles').upsert(
    {
      user_id: userId,
      identity_stage: isAnonymous ? 'anonymous' : 'claimed',
      nickname,
      last_seen_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id',
    },
  );
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return json(
        {
          error: 'Authentication required',
          needsAnonymousSignIn: true,
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as SaveIdentifyAssessmentBody;
    const personaSlug = typeof body.personaSlug === 'string' ? body.personaSlug.trim() : '';
    const persona = getIdentifyPersonaBySlug(personaSlug);

    if (!persona) {
      return json({ error: 'Invalid persona slug' }, { status: 400 });
    }

    if (!Array.isArray(body.dimensionScores) || body.dimensionScores.length === 0) {
      return json({ error: 'dimensionScores is required' }, { status: 400 });
    }

    const friendName = typeof body.friendName === 'string'
      ? body.friendName.trim().slice(0, 32)
      : '';
    const clientMutationId = typeof body.clientMutationId === 'string'
      ? body.clientMutationId.trim().slice(0, 128)
      : '';

    await ensureUserProfile(
      user.id,
      user.is_anonymous ?? false,
      getUserNickname(user).slice(0, 32),
    );

    const adminClient = createAdminSupabaseClient();

    if (clientMutationId) {
      const { data: existing } = await adminClient
        .from('identify_assessments')
        .select('id, share_token, actor_display_name, subject_display_name, persona_slug, created_at')
        .eq('actor_user_id', user.id)
        .eq('client_mutation_id', clientMutationId)
        .maybeSingle();

      if (existing) {
        const row = existing as IdentifyAssessmentRow;
        return json({
          ok: true,
          assessment: {
            id: row.id,
            shareToken: row.share_token,
            actorDisplayName: row.actor_display_name,
            subjectDisplayName: row.subject_display_name,
            personaSlug: row.persona_slug,
            createdAt: row.created_at,
          },
        });
      }
    }

    const actorDisplayName = getUserDisplayName(user).slice(0, 32);
    const subjectDisplayName = friendName || 'ta';

    const { data, error } = await adminClient
      .from('identify_assessments')
      .insert({
        actor_user_id: user.id,
        share_token: crypto.randomUUID(),
        actor_display_name: actorDisplayName,
        subject_display_name: subjectDisplayName,
        persona_slug: persona.slug,
        dimension_scores: body.dimensionScores,
        result_diagnostics: body.diagnostics ?? {},
        client_mutation_id: clientMutationId || null,
      })
      .select('id, share_token, actor_display_name, subject_display_name, persona_slug, created_at')
      .single();

    if (error || !data) {
      console.error('[identify/save POST] Failed to create assessment:', error);
      return json({ error: 'Failed to save identify assessment' }, { status: 500 });
    }

    const row = data as IdentifyAssessmentRow;

    return json({
      ok: true,
      assessment: {
        id: row.id,
        shareToken: row.share_token,
        actorDisplayName: row.actor_display_name,
        subjectDisplayName: row.subject_display_name,
        personaSlug: row.persona_slug,
        createdAt: row.created_at,
      },
    });
  } catch (error) {
    console.error('[identify/save POST] Unexpected error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}