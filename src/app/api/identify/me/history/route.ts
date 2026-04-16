import { NextResponse } from 'next/server';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface IdentifyHistoryRow {
  id: string;
  share_token: string;
  persona_slug: string;
  actor_display_name: string;
  subject_display_name: string;
  created_at: string;
  challenge_opened_at: string | null;
  subject_viewed_at: string | null;
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

function mapEntry(row: IdentifyHistoryRow) {
  return {
    id: row.id,
    shareToken: row.share_token,
    personaSlug: row.persona_slug,
    actorDisplayName: row.actor_display_name,
    subjectDisplayName: row.subject_display_name,
    createdAt: row.created_at,
    challengeOpenedAt: row.challenge_opened_at,
    subjectViewedAt: row.subject_viewed_at,
  };
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    const adminClient = createAdminSupabaseClient();

    const [{ data: sentRows, error: sentError }, { count: receivedCount, error: receivedCountError }, { count: unreadReceivedCount, error: unreadCountError }] = await Promise.all([
      adminClient
        .from('identify_assessments')
        .select('id, share_token, persona_slug, actor_display_name, subject_display_name, created_at, challenge_opened_at, subject_viewed_at')
        .eq('actor_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
      adminClient
        .from('identify_assessments')
        .select('id', { count: 'exact', head: true })
        .eq('subject_user_id', user.id),
      adminClient
        .from('identify_assessments')
        .select('id', { count: 'exact', head: true })
        .eq('subject_user_id', user.id)
        .is('subject_viewed_at', null),
    ]);

    if (sentError || receivedCountError || unreadCountError) {
      console.error('[identify/me/history GET] Failed to query identify history:', {
        sentError,
        receivedCountError,
        unreadCountError,
      });
      return json({ error: 'Failed to fetch identify history' }, { status: 500 });
    }

    const receivedLocked = user.is_anonymous ?? false;
    let receivedEntries: IdentifyHistoryRow[] = [];

    if (!receivedLocked) {
      const { data: receivedRows, error: receivedError } = await adminClient
        .from('identify_assessments')
        .select('id, share_token, persona_slug, actor_display_name, subject_display_name, created_at, challenge_opened_at, subject_viewed_at')
        .eq('subject_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (receivedError) {
        console.error('[identify/me/history GET] Failed to fetch received identify history:', receivedError);
        return json({ error: 'Failed to fetch received identify history' }, { status: 500 });
      }

      receivedEntries = (receivedRows ?? []) as IdentifyHistoryRow[];
    }

    return json({
      sent: ((sentRows ?? []) as IdentifyHistoryRow[]).map(mapEntry),
      received: receivedEntries.map(mapEntry),
      summary: {
        sentCount: (sentRows ?? []).length,
        receivedCount: receivedCount ?? 0,
        unreadReceivedCount: unreadReceivedCount ?? 0,
        receivedLocked,
      },
    });
  } catch (error) {
    console.error('[identify/me/history GET] Unexpected error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}