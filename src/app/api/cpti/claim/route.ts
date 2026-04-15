import { NextResponse } from 'next/server';

import type { PostgrestSingleResponse } from '@supabase/supabase-js';

import type {
  ClaimRelationshipPayload,
  ClaimResultPayload,
  CptiClaimRequest,
} from '@/lib/cpti/claim';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const MODULE_ID = 'cpti';
const MODULE_KIND = 'relationship_module';
const COMPARABILITY_GROUP = 'cpti';

function json(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      'Cache-Control': 'private, no-store',
      ...init?.headers,
    },
  });
}

async function ensureUserProfile(userId: string, isAnonymous: boolean) {
  const adminClient = createAdminSupabaseClient();

  await adminClient.from('user_profiles').upsert(
    {
      user_id: userId,
      identity_stage: isAnonymous ? 'anonymous' : 'claimed',
      last_seen_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id',
      ignoreDuplicates: false,
    },
  );
}

async function getExistingSnapshot(userId: string, clientMutationId?: string) {
  if (!clientMutationId) return null;

  const adminClient = createAdminSupabaseClient();
  const { data, error } = await adminClient
    .from('cpti_profile_snapshots')
    .select('id, personality_slug, source, created_at')
    .eq('user_id', userId)
    .eq('client_mutation_id', clientMutationId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function createSnapshot(userId: string, payload: ClaimResultPayload) {
  const existing = await getExistingSnapshot(userId, payload.clientMutationId);
  if (existing) {
    return existing;
  }

  const adminClient = createAdminSupabaseClient();
  const { data, error } = await adminClient
    .from('cpti_profile_snapshots')
    .insert({
      user_id: userId,
      source: payload.source,
      personality_slug: payload.personalitySlug,
      dimension_scores: payload.dimensionScores,
      client_mutation_id: payload.clientMutationId ?? null,
    })
    .select('id, personality_slug, source, created_at')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function getExistingModuleResult(userId: string, clientMutationId?: string) {
  if (!clientMutationId) return null;

  const adminClient = createAdminSupabaseClient();
  const { data, error } = await adminClient
    .from('user_module_results')
    .select('id, result_slug, observed_at')
    .eq('user_id', userId)
    .eq('client_mutation_id', clientMutationId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function setCurrentCptiResult(
  userId: string,
  payload: ClaimResultPayload,
  snapshotId: string,
) {
  const existing = await getExistingModuleResult(userId, payload.clientMutationId);
  if (existing) {
    return existing;
  }

  const adminClient = createAdminSupabaseClient();

  await adminClient
    .from('user_module_results')
    .update({
      is_current: false,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('module_id', MODULE_ID)
    .eq('is_current', true);

  const { data, error } = await adminClient
    .from('user_module_results')
    .insert({
      user_id: userId,
      module_kind: MODULE_KIND,
      module_id: MODULE_ID,
      result_slug: payload.personalitySlug,
      comparability_group: COMPARABILITY_GROUP,
      is_current: true,
      source_payload: {
        snapshotId,
        source: payload.source,
        dimensionScores: payload.dimensionScores,
        claimedVia: 'cpti_claim_api',
      },
      client_mutation_id: payload.clientMutationId ?? null,
    })
    .select('id, result_slug, observed_at')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function claimResult(userId: string, payload: ClaimResultPayload) {
  const snapshot = await createSnapshot(userId, payload);
  const moduleResult = await setCurrentCptiResult(userId, payload, snapshot.id);

  return {
    success: true,
    claimed: true,
    userId,
    snapshotId: snapshot.id,
    moduleResultId: moduleResult.id,
    personalitySlug: snapshot.personality_slug,
    source: snapshot.source,
    claimedType: 'result' as const,
  };
}

async function fetchRelationshipForUser(
  userId: string,
  relationshipId: string,
) {
  const adminClient = createAdminSupabaseClient();

  const response: PostgrestSingleResponse<{
    id: string;
    match_id: string;
    initiator_user_id: string;
    participant_user_id: string;
    relationship_slug: string;
    relationship_tier: string;
    compatibility: number;
  }> = await adminClient
    .from('cpti_relationships')
    .select(
      'id, match_id, initiator_user_id, participant_user_id, relationship_slug, relationship_tier, compatibility',
    )
    .eq('id', relationshipId)
    .or(`initiator_user_id.eq.${userId},participant_user_id.eq.${userId}`)
    .single();

  if (response.error) {
    throw response.error;
  }

  return response.data;
}

async function claimRelationship(userId: string, payload: ClaimRelationshipPayload) {
  const relationship = await fetchRelationshipForUser(userId, payload.relationshipId);

  let snapshotId: string | null = null;
  let moduleResultId: string | null = null;

  if (
    payload.currentPersonalitySlug &&
    payload.currentDimensionScores &&
    payload.currentSource
  ) {
    const resultPayload: ClaimResultPayload = {
      personalitySlug: payload.currentPersonalitySlug,
      dimensionScores: payload.currentDimensionScores,
      source: payload.currentSource,
      clientMutationId: payload.clientMutationId,
    };
    const snapshot = await createSnapshot(userId, resultPayload);
    const moduleResult = await setCurrentCptiResult(userId, resultPayload, snapshot.id);
    snapshotId = snapshot.id;
    moduleResultId = moduleResult.id;
  }

  const adminClient = createAdminSupabaseClient();
  await adminClient.from('cpti_relationship_events').insert({
    relationship_id: relationship.id,
    actor_user_id: userId,
    event_type: 'claim_confirmed',
    payload_json: {
      relationshipId: relationship.id,
      claimType: 'relationship',
    },
  });

  return {
    success: true,
    claimed: true,
    userId,
    relationshipId: relationship.id,
    matchId: relationship.match_id,
    relationshipSlug: relationship.relationship_slug,
    relationshipTier: relationship.relationship_tier,
    compatibility: relationship.compatibility,
    snapshotId,
    moduleResultId,
    claimedType: 'relationship' as const,
  };
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CptiClaimRequest;
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return json(
        {
          error: 'Authentication required before claiming assets',
          needsAnonymousSignIn: true,
        },
        { status: 401 },
      );
    }

    await ensureUserProfile(user.id, user.is_anonymous ?? false);

    if (payload.type === 'result') {
      if (!payload.data.personalitySlug || payload.data.dimensionScores.length === 0) {
        return json(
          { error: 'Missing result payload fields' },
          { status: 400 },
        );
      }

      return json(await claimResult(user.id, payload.data));
    }

    if (payload.type === 'relationship') {
      if (!payload.data.relationshipId) {
        return json(
          { error: 'Missing relationshipId' },
          { status: 400 },
        );
      }

      return json(await claimRelationship(user.id, payload.data));
    }

    return json({ error: 'Invalid claim type' }, { status: 400 });
  } catch (error) {
    console.error('[cpti/claim POST] Failed to claim asset:', error);
    return json(
      { error: 'Failed to claim asset' },
      { status: 500 },
    );
  }
}
