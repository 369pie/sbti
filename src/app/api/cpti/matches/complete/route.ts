import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/supabase/with-auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  computeMatchFromProfiles,
  profileFromSnapshot,
  scoreUser,
  type Answer,
  type CptiDimensionScore,
  type UserProfile,
} from '@/lib/cpti/server/scoring-service';
import { CPTI_RELATIONSHIP_TYPES } from '@/lib/cpti/relationships';
import type { User } from '@supabase/supabase-js';

interface CompleteMatchBody {
  matchId: string;
  initiatorAnswers?: Record<number, 1 | 2 | 3>;
  participantAnswers?: Record<number, 1 | 2 | 3>;
  participantProfile?: {
    personalitySlug: string;
    dimensionScores: CptiDimensionScore[];
  };
}

interface SnapshotRow {
  id: string;
  personality_slug: string;
  dimension_scores: CptiDimensionScore[];
}

// POST handler: complete a match
export const POST = withAuth(async (
  req: NextRequest,
  _context: { params: Promise<Record<string, string>> },
  user: User
) => {
  try {
    const body = await req.json();
    const {
      matchId,
      initiatorAnswers: rawInitiatorAnswers,
      participantAnswers: rawParticipantAnswers,
      participantProfile: rawParticipantProfile,
    } = body as CompleteMatchBody;

    const initiatorAnswers = rawInitiatorAnswers ?? {};
    const participantAnswers = rawParticipantAnswers ?? {};
    const participantProfileInput = rawParticipantProfile;

    if (!matchId) {
      return NextResponse.json(
        {
          error: 'Missing required field: matchId',
        },
        { status: 400 }
      );
    }

    if (Object.keys(participantAnswers).length === 0 && !participantProfileInput) {
      return NextResponse.json(
        {
          error: 'Missing required fields: participantAnswers or participantProfile',
        },
        { status: 400 }
      );
    }

    const adminClient = createAdminSupabaseClient();
    const currentUserId = user.id;

    // Fetch match record
    const { data: match, error: fetchError } = await adminClient
      .from('cpti_matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (fetchError) {
      console.error('[matches/complete POST] Failed to fetch match:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch match' },
        { status: 500 }
      );
    }

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Verify current user is involved in this match
    if (match.initiator_user_id !== currentUserId && match.participant_user_id !== currentUserId) {
      return NextResponse.json(
        { error: 'You are not involved in this match' },
        { status: 403 }
      );
    }

    // Check idempotency - if already completed, return success
    if (match.status === 'completed') {
      return NextResponse.json(
        { error: 'Match already completed' },
        { status: 409 }
      );
    }

    // Verify match is in 'started' status
    if (match.status !== 'started') {
      return NextResponse.json(
        { error: `Match is in '${match.status}' status, expected 'started'` },
        { status: 409 }
      );
    }

    let initiatorProfile: UserProfile | null = null;
    let initiatorSnapshotId = match.initiator_snapshot_id as string | null;

    if (Object.keys(initiatorAnswers).length > 0) {
      initiatorProfile = scoreUser(initiatorAnswers as Record<number, Answer>);
    } else if (initiatorSnapshotId) {
      const { data: existingInitiatorSnapshot, error: existingInitiatorSnapshotError } = await adminClient
        .from('cpti_profile_snapshots')
        .select('id, personality_slug, dimension_scores')
        .eq('id', initiatorSnapshotId)
        .single();

      if (existingInitiatorSnapshotError || !existingInitiatorSnapshot) {
        console.error('[matches/complete POST] Failed to load initiator snapshot:', existingInitiatorSnapshotError);
        return NextResponse.json(
          { error: 'Failed to load initiator profile snapshot' },
          { status: 500 }
        );
      }

      initiatorProfile = profileFromSnapshot({
        personalitySlug: (existingInitiatorSnapshot as SnapshotRow).personality_slug,
        dimensionScores: (existingInitiatorSnapshot as SnapshotRow).dimension_scores,
      });
    }

    if (!initiatorProfile) {
      return NextResponse.json(
        { error: 'Initiator profile is missing. Ask the inviter to generate a fresh pair code.' },
        { status: 409 }
      );
    }

    let participantProfile: UserProfile | null = null;

    if (
      participantProfileInput &&
      typeof participantProfileInput.personalitySlug === 'string' &&
      Array.isArray(participantProfileInput.dimensionScores)
    ) {
      participantProfile = profileFromSnapshot({
        personalitySlug: participantProfileInput.personalitySlug,
        dimensionScores: participantProfileInput.dimensionScores,
      });
    }

    if (!participantProfile && Object.keys(participantAnswers).length > 0) {
      participantProfile = scoreUser(participantAnswers as Record<number, Answer>);
    }

    if (!participantProfile) {
      return NextResponse.json(
        { error: 'Participant profile is invalid. Please retake CPTI test.' },
        { status: 400 }
      );
    }

    const result = computeMatchFromProfiles(initiatorProfile, participantProfile);

    // Create profile snapshot for participant
    const { data: participantSnapshot, error: participantSnapshotError } = await adminClient
      .from('cpti_profile_snapshots')
      .insert({
        user_id: match.participant_user_id,
        source: 'pair_flow',
        personality_slug: result.participantProfile.personality.slug,
        dimension_scores: result.participantProfile.dimensions,
        raw_answers: Object.keys(participantAnswers).length > 0 ? participantAnswers : null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (participantSnapshotError) {
      console.error('[matches/complete POST] Failed to create participant snapshot:', participantSnapshotError);
      return NextResponse.json(
        { error: 'Failed to create participant profile snapshot' },
        { status: 500 }
      );
    }

    if (!initiatorSnapshotId) {
      const { data: initiatorSnapshot, error: initiatorSnapshotError } = await adminClient
        .from('cpti_profile_snapshots')
        .insert({
          user_id: match.initiator_user_id,
          source: 'pair_flow',
          personality_slug: result.initiatorProfile.personality.slug,
          dimension_scores: result.initiatorProfile.dimensions,
          raw_answers: initiatorAnswers,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (initiatorSnapshotError || !initiatorSnapshot) {
        console.error('[matches/complete POST] Failed to create initiator snapshot:', initiatorSnapshotError);
        return NextResponse.json(
          { error: 'Failed to create initiator profile snapshot' },
          { status: 500 }
        );
      }

      initiatorSnapshotId = initiatorSnapshot.id;
    }

    // Insert relationship into cpti_relationships
    const { data: relationship, error: relationshipError } = await adminClient
      .from('cpti_relationships')
      .insert({
        match_id: matchId,
        initiator_user_id: match.initiator_user_id,
        participant_user_id: match.participant_user_id,
        initiator_snapshot_id: initiatorSnapshotId,
        participant_snapshot_id: participantSnapshot.id,
        relationship_slug: result.relationship.slug,
        relationship_tier: result.relationship.tier,
        compatibility: result.compatibility,
        visibility: 'mutual',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (relationshipError) {
      console.error('[matches/complete POST] Failed to create relationship:', relationshipError);
      return NextResponse.json(
        { error: 'Failed to create relationship' },
        { status: 500 }
      );
    }

    // --- Atlas sync for both users ---
    const nowIso = new Date().toISOString();
    const relationshipSlug = relationship.relationship_slug as string;
    const relationshipTier = relationship.relationship_tier as string;
    const bothUsers = [
      { userId: match.initiator_user_id as string, role: 'initiator' },
      { userId: match.participant_user_id as string, role: 'participant' },
    ];

    const atlasUpdate: Record<string, { newUnlock: boolean; totalUnlocks: number }> = {};

    for (const { userId } of bothUsers) {
      // 1. Insert into user_atlas_unlocks (idempotent via dedupe_key)
      const dedupeKey = `${matchId}_${userId}`;
      const { error: unlockError } = await adminClient
        .from('user_atlas_unlocks')
        .insert({
          user_id: userId,
          series_id: 'cpti_relationships',
          item_key: relationshipSlug,
          dedupe_key: dedupeKey,
          status: 'unlocked',
          source_kind: 'cpti_match',
          source_ref_table: 'cpti_relationships',
          source_ref_id: relationship.id,
        });

      let isNewUnlock = false;
      if (unlockError) {
        // Check if it's a duplicate (idempotent) - not a real error
        if (unlockError.code === '23505') {
          // unique violation - already unlocked
          isNewUnlock = false;
        } else {
          console.error(`[matches/complete POST] Failed to insert atlas unlock for user ${userId}:`, unlockError);
          // Non-fatal, continue
        }
      } else {
        isNewUnlock = true;
      }

      // 2. Read current stats to compute increments
      const { data: currentStats } = await adminClient
        .from('user_atlas_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      const newTotalUnlocks = (currentStats?.total_collectible_unlocks ?? 0) + (isNewUnlock ? 1 : 0);
      const newRelationshipTypeCount = (currentStats?.relationship_type_count ?? 0) + (isNewUnlock ? 1 : 0);
      const newRareCount = (currentStats?.rare_relationship_count ?? 0) +
        (isNewUnlock && relationshipTier === 'rare' ? 1 : 0);
      const newSoulCount = (currentStats?.soul_count ?? 0) +
        (isNewUnlock && relationshipSlug === 'soul' ? 1 : 0);

      const { error: statsError } = await adminClient
        .from('user_atlas_stats')
        .upsert({
          user_id: userId,
          total_collectible_unlocks: newTotalUnlocks,
          relationship_type_count: newRelationshipTypeCount,
          rare_relationship_count: newRareCount,
          soul_count: newSoulCount,
          last_relationship_at: nowIso,
          last_unlock_at: nowIso,
          updated_at: nowIso,
        }, { onConflict: 'user_id' });

      if (statsError) {
        console.error(`[matches/complete POST] Failed to upsert atlas stats for user ${userId}:`, statsError);
        // Non-fatal
      }

      atlasUpdate[userId] = {
        newUnlock: isNewUnlock,
        totalUnlocks: newTotalUnlocks,
      };
    }

    // 3. Create atlas_synced event for BOTH users
    const atlasEvents = bothUsers.map(({ userId }) => ({
      relationship_id: relationship.id,
      actor_user_id: userId,
      event_type: 'atlas_synced',
      payload_json: {
        match_id: matchId,
        user_id: userId,
        relationship_slug: relationshipSlug,
        relationship_tier: relationshipTier,
      },
      created_at: nowIso,
    }));

    const { error: atlasEventError } = await adminClient
      .from('cpti_relationship_events')
      .insert(atlasEvents);

    if (atlasEventError) {
      console.error('[matches/complete POST] Failed to create atlas_synced events:', atlasEventError);
      // Non-fatal
    }

    // Update match status to completed
    const completedAt = new Date().toISOString();
    const { error: updateMatchError } = await adminClient
      .from('cpti_matches')
      .update({
        status: 'completed',
        completed_at: completedAt,
      })
      .eq('id', matchId);

    if (updateMatchError) {
      console.error('[matches/complete POST] Failed to update match status:', updateMatchError);
      return NextResponse.json(
        { error: 'Failed to update match status' },
        { status: 500 }
      );
    }

    // Create relationship event
    const { error: eventError } = await adminClient
      .from('cpti_relationship_events')
      .insert({
        relationship_id: relationship.id,
        actor_user_id: currentUserId,
        event_type: 'relationship_created',
        payload_json: {
          match_id: matchId,
          initiator_user_id: match.initiator_user_id,
          participant_user_id: match.participant_user_id,
          relationship_slug: result.relationship.slug,
          relationship_tier: result.relationship.tier,
          compatibility: result.compatibility,
        },
        created_at: completedAt,
      });

    if (eventError) {
      console.error('[matches/complete POST] Failed to create relationship event:', eventError);
      // Non-fatal - relationship is already created, just log the error
    }

    // Return response with camelCase mapping
    // TODO: Implement server-side analytics (Vercel Analytics is client-side only)
    console.log(`[analytics:server] cpti_match_completed`, {
      matchId,
      relationshipSlug: relationship.relationship_slug,
      relationshipTier: relationship.relationship_tier,
      compatibility: result.compatibility,
    });

    const currentUserAtlas = atlasUpdate[currentUserId] ?? { newUnlock: false, totalUnlocks: 0 };

    return NextResponse.json({
      matchId,
      relationship: {
        id: relationship.id,
        slug: relationship.relationship_slug,
        tier: relationship.relationship_tier,
        code: result.relationship.code,
        compatibility: relationship.compatibility,
        name: result.relationship.name,
        tagline: result.relationship.tagline,
        description: result.relationship.description,
        emoji: result.relationship.emoji,
        color: result.relationship.color,
      },
      initiatorProfile: {
        personality: result.initiatorProfile.personality,
        dimensions: result.initiatorProfile.dimensions,
        snapshotId: initiatorSnapshotId,
      },
      participantProfile: {
        personality: result.participantProfile.personality,
        dimensions: result.participantProfile.dimensions,
        snapshotId: participantSnapshot.id,
      },
      compatibility: result.compatibility,
      completedAt,
      atlasUpdate,
      collectionProgress: {
        collected: currentUserAtlas.totalUnlocks,
        total: CPTI_RELATIONSHIP_TYPES.length,
      },
    });
  } catch (error) {
    console.error('[matches/complete POST] Failed to complete match:', error);
    return NextResponse.json(
      { error: 'Failed to complete match' },
      { status: 500 }
    );
  }
});
