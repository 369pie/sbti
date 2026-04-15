import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/supabase/with-auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { User } from '@supabase/supabase-js';

interface RelationshipRow {
  id: string;
  relationship_slug: string;
  relationship_tier: string;
  compatibility: number;
  initiator_user_id: string;
  participant_user_id: string;
  initiator_snapshot_id: string | null;
  participant_snapshot_id: string | null;
  created_at: string;
}

interface ProfileSnapshotRow {
  id: string;
  personality_slug: string;
}

export const GET = withAuth(async (
  _req: NextRequest,
  _context: { params: Promise<Record<string, string>> },
  user: User
) => {
  try {
    const adminClient = createAdminSupabaseClient();
    const userId = user.id;

    // Fetch all relationships where user is initiator or participant
    const { data, error } = await adminClient
      .from('cpti_relationships')
      .select(`
        id,
        relationship_slug,
        relationship_tier,
        compatibility,
        initiator_user_id,
        participant_user_id,
        initiator_snapshot_id,
        participant_snapshot_id,
        created_at
      `)
      .or(`initiator_user_id.eq.${userId},participant_user_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[cpti/me/relationships GET] Failed to fetch relationships:', error);
      return NextResponse.json(
        { error: 'Failed to fetch relationships' },
        { status: 500 }
      );
    }

    const relationships = (data ?? []) as RelationshipRow[];

    // Collect all snapshot IDs to batch-fetch
    const snapshotIds = new Set<string>();
    for (const rel of relationships) {
      if (rel.initiator_snapshot_id) snapshotIds.add(rel.initiator_snapshot_id);
      if (rel.participant_snapshot_id) snapshotIds.add(rel.participant_snapshot_id);
    }

    // Batch-fetch snapshots
    const snapshotMap = new Map<string, string>();
    if (snapshotIds.size > 0) {
      const { data: snapshots, error: snapshotError } = await adminClient
        .from('cpti_profile_snapshots')
        .select('id, personality_slug')
        .in('id', Array.from(snapshotIds));

      if (snapshotError) {
        console.error('[cpti/me/relationships GET] Failed to fetch snapshots:', snapshotError);
        // Non-fatal — continue with UNKNOWN personalities
      } else {
        for (const snap of (snapshots ?? []) as ProfileSnapshotRow[]) {
          snapshotMap.set(snap.id, snap.personality_slug.toUpperCase());
        }
      }
    }

    // Map relationships with anonymized "other person" data
    const result = relationships.map((rel) => {
      const isInitiator = rel.initiator_user_id === userId;
      const mySnapshotId = isInitiator ? rel.initiator_snapshot_id : rel.participant_snapshot_id;
      const otherSnapshotId = isInitiator ? rel.participant_snapshot_id : rel.initiator_snapshot_id;

      return {
        id: rel.id,
        slug: rel.relationship_slug,
        tier: rel.relationship_tier,
        compatibility: rel.compatibility,
        myPersonality: mySnapshotId ? (snapshotMap.get(mySnapshotId) ?? 'UNKNOWN') : 'UNKNOWN',
        otherPersonality: otherSnapshotId
          ? (snapshotMap.get(otherSnapshotId) ?? 'UNKNOWN')
          : 'UNKNOWN',
        createdAt: rel.created_at,
      };
    });

    return NextResponse.json({ relationships: result });
  } catch (error) {
    console.error('[cpti/me/relationships GET] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
