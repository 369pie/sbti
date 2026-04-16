import { NextResponse } from 'next/server';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface MergeExistingBody {
  sourceUserId: string;
}

interface SourceUnlockRow {
  series_id: string;
  item_key: string;
  dedupe_key: string;
  status: string;
  source_kind: string;
  source_ref_table: string | null;
  source_ref_id: string | null;
  source_payload: Record<string, unknown> | null;
  unlocked_at: string;
  last_seen_at: string;
  updated_at: string;
}

interface SourceModuleRow {
  id: string;
  module_id: string;
  is_current: boolean;
}

interface SourceIdentifyAssessmentRow {
  id: string;
  actor_user_id: string;
  subject_user_id: string | null;
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

export async function POST(request: Request) {
  try {
    const { sourceUserId } = (await request.json()) as MergeExistingBody;

    if (!sourceUserId) {
      return json({ error: 'sourceUserId is required' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    if (user.is_anonymous) {
      return json({ error: 'Target account must be claimed before merge' }, { status: 409 });
    }

    if (sourceUserId === user.id) {
      return json({
        ok: true,
        targetUserId: user.id,
        sourceUserId,
        merged: false,
        reason: 'same_user',
      });
    }

    const adminClient = createAdminSupabaseClient();
    const nowIso = new Date().toISOString();

    const { data: sourceProfile, error: sourceProfileError } = await adminClient
      .from('user_profiles')
      .select('identity_stage, merged_into_user_id')
      .eq('user_id', sourceUserId)
      .maybeSingle();

    if (sourceProfileError || !sourceProfile) {
      return json({ error: 'Source user not found' }, { status: 404 });
    }

    if (
      sourceProfile.identity_stage === 'merged' &&
      sourceProfile.merged_into_user_id === user.id
    ) {
      return json({
        ok: true,
        targetUserId: user.id,
        sourceUserId,
        merged: false,
        reason: 'already_merged',
      });
    }

    const { data: existingMergeEvent } = await adminClient
      .from('user_merge_events')
      .insert({
        source_user_id: sourceUserId,
        target_user_id: user.id,
        strategy: 'merge',
        status: 'planned',
        merge_payload: {
          initiatedBy: 'cpti_merge_existing_route',
        },
      })
      .select('id')
      .single();

    await adminClient
      .from('cpti_profile_snapshots')
      .update({ user_id: user.id })
      .eq('user_id', sourceUserId);

    await adminClient
      .from('cpti_pair_codes')
      .update({ creator_user_id: user.id })
      .eq('creator_user_id', sourceUserId);

    const { data: sourceIdentifyAssessments } = await adminClient
      .from('identify_assessments')
      .select('id, actor_user_id, subject_user_id')
      .or(`actor_user_id.eq.${sourceUserId},subject_user_id.eq.${sourceUserId}`);

    for (const row of (sourceIdentifyAssessments ?? []) as SourceIdentifyAssessmentRow[]) {
      const nextActor = row.actor_user_id === sourceUserId ? user.id : row.actor_user_id;
      const nextSubject = row.subject_user_id === sourceUserId ? user.id : row.subject_user_id;

      if (nextSubject && nextActor === nextSubject) {
        await adminClient
          .from('identify_assessments')
          .update({
            actor_user_id: user.id,
            subject_user_id: null,
            subject_claimed_at: null,
            subject_viewed_at: null,
            updated_at: nowIso,
          })
          .eq('id', row.id);
        continue;
      }

      await adminClient
        .from('identify_assessments')
        .update({
          actor_user_id: nextActor,
          subject_user_id: nextSubject,
          updated_at: nowIso,
        })
        .eq('id', row.id);
    }

    const { data: sourceModules } = await adminClient
      .from('user_module_results')
      .select('id, module_id, is_current')
      .eq('user_id', sourceUserId);

    const { data: targetCurrentModules } = await adminClient
      .from('user_module_results')
      .select('module_id')
      .eq('user_id', user.id)
      .eq('is_current', true);

    const targetCurrentSet = new Set(
      (targetCurrentModules ?? []).map((row) => row.module_id as string),
    );

    for (const row of ((sourceModules ?? []) as SourceModuleRow[])) {
      await adminClient
        .from('user_module_results')
        .update({
          user_id: user.id,
          is_current: row.is_current && !targetCurrentSet.has(row.module_id),
          client_mutation_id: null,
          updated_at: nowIso,
        })
        .eq('id', row.id);
    }

    const { data: sourceUnlocks } = await adminClient
      .from('user_atlas_unlocks')
      .select(`
        series_id,
        item_key,
        dedupe_key,
        status,
        source_kind,
        source_ref_table,
        source_ref_id,
        source_payload,
        unlocked_at,
        last_seen_at,
        updated_at
      `)
      .eq('user_id', sourceUserId);

    if ((sourceUnlocks ?? []).length > 0) {
      await adminClient
        .from('user_atlas_unlocks')
        .upsert(
          (sourceUnlocks as SourceUnlockRow[]).map((row) => ({
            user_id: user.id,
            series_id: row.series_id,
            item_key: row.item_key,
            dedupe_key: row.dedupe_key,
            status: row.status,
            source_kind: row.source_kind,
            source_ref_table: row.source_ref_table,
            source_ref_id: row.source_ref_id,
            source_payload: row.source_payload ?? {},
            unlocked_at: row.unlocked_at,
            last_seen_at: row.last_seen_at,
            updated_at: nowIso,
          })),
          {
            onConflict: 'user_id,series_id,dedupe_key',
            ignoreDuplicates: true,
          },
        );

      await adminClient
        .from('user_atlas_unlocks')
        .delete()
        .eq('user_id', sourceUserId);
    }

    const { data: sourceRelationships } = await adminClient
      .from('cpti_relationships')
      .select('id, initiator_user_id, participant_user_id')
      .or(`initiator_user_id.eq.${sourceUserId},participant_user_id.eq.${sourceUserId}`);

    let skippedSelfCollisionRelationships = 0;
    for (const row of sourceRelationships ?? []) {
      const nextInitiator =
        row.initiator_user_id === sourceUserId ? user.id : row.initiator_user_id;
      const nextParticipant =
        row.participant_user_id === sourceUserId ? user.id : row.participant_user_id;

      if (nextInitiator === nextParticipant) {
        skippedSelfCollisionRelationships += 1;
        continue;
      }

      await adminClient
        .from('cpti_relationships')
        .update({
          initiator_user_id: nextInitiator,
          participant_user_id: nextParticipant,
          updated_at: nowIso,
        })
        .eq('id', row.id);
    }

    const { data: sourceMatches } = await adminClient
      .from('cpti_matches')
      .select('id, initiator_user_id, participant_user_id')
      .or(`initiator_user_id.eq.${sourceUserId},participant_user_id.eq.${sourceUserId}`);

    let skippedSelfCollisionMatches = 0;
    for (const row of sourceMatches ?? []) {
      const nextInitiator =
        row.initiator_user_id === sourceUserId ? user.id : row.initiator_user_id;
      const nextParticipant =
        row.participant_user_id === sourceUserId ? user.id : row.participant_user_id;

      if (nextInitiator === nextParticipant) {
        skippedSelfCollisionMatches += 1;
        continue;
      }

      await adminClient
        .from('cpti_matches')
        .update({
          initiator_user_id: nextInitiator,
          participant_user_id: nextParticipant,
          updated_at: nowIso,
        })
        .eq('id', row.id);
    }

    await adminClient
      .from('cpti_relationship_events')
      .update({ actor_user_id: user.id })
      .eq('actor_user_id', sourceUserId);

    const { data: targetUnlockRows } = await adminClient
      .from('user_atlas_unlocks')
      .select('item_key, unlocked_at')
      .eq('user_id', user.id)
      .eq('series_id', 'cpti_relationships')
      .eq('status', 'unlocked');

    const rareRelationshipSlugs = new Set([
      'soul',
      'mirror',
      'doom',
      'phoenix',
      'godmode',
    ]);

    const totalCollectibleUnlocks = (targetUnlockRows ?? []).length;
    const relationshipTypeCount = totalCollectibleUnlocks;
    const rareRelationshipCount = (targetUnlockRows ?? []).filter((row) =>
      rareRelationshipSlugs.has(row.item_key as string),
    ).length;
    const soulCount = (targetUnlockRows ?? []).filter(
      (row) => row.item_key === 'soul',
    ).length;
    const lastUnlockAt = (targetUnlockRows ?? [])
      .map((row) => row.unlocked_at as string)
      .sort()
      .at(-1) ?? null;

    const { data: targetRelationships } = await adminClient
      .from('cpti_relationships')
      .select('created_at')
      .or(`initiator_user_id.eq.${user.id},participant_user_id.eq.${user.id}`)
      .eq('is_valid', true);

    const lastRelationshipAt = (targetRelationships ?? [])
      .map((row) => row.created_at as string)
      .sort()
      .at(-1) ?? null;

    await adminClient
      .from('user_atlas_stats')
      .upsert(
        {
          user_id: user.id,
          total_collectible_unlocks: totalCollectibleUnlocks,
          relationship_type_count: relationshipTypeCount,
          rare_relationship_count: rareRelationshipCount,
          soul_count: soulCount,
          last_relationship_at: lastRelationshipAt,
          last_unlock_at: lastUnlockAt,
          updated_at: nowIso,
        },
        { onConflict: 'user_id' },
      );

    await adminClient
      .from('user_profiles')
      .update({
        identity_stage: 'merged',
        merged_into_user_id: user.id,
        updated_at: nowIso,
      })
      .eq('user_id', sourceUserId);

    await adminClient
      .from('user_identity_events')
      .insert([
        {
          user_id: sourceUserId,
          event_type: 'identity_merged_out',
          from_stage: sourceProfile.identity_stage,
          to_stage: 'merged',
          source: 'cpti_merge_existing_route',
          event_payload: {
            targetUserId: user.id,
          },
        },
        {
          user_id: user.id,
          event_type: 'identity_merged_in',
          from_stage: 'claimed',
          to_stage: 'claimed',
          source: 'cpti_merge_existing_route',
          event_payload: {
            sourceUserId,
          },
        },
      ]);

    if (existingMergeEvent?.id) {
      await adminClient
        .from('user_merge_events')
        .update({
          status: 'completed',
          completed_at: nowIso,
          merge_payload: {
            initiatedBy: 'cpti_merge_existing_route',
            skippedSelfCollisionRelationships,
            skippedSelfCollisionMatches,
          },
        })
        .eq('id', existingMergeEvent.id);
    }

    return json({
      ok: true,
      merged: true,
      sourceUserId,
      targetUserId: user.id,
      skippedSelfCollisionRelationships,
      skippedSelfCollisionMatches,
      stats: {
        totalCollectibleUnlocks,
        rareRelationshipCount,
        soulCount,
      },
    });
  } catch (error) {
    console.error('[cpti/merge-existing POST] Unexpected error:', error);
    return json(
      { error: 'Failed to merge existing account assets' },
      { status: 500 },
    );
  }
}
