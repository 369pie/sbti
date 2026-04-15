import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/supabase/with-auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { User } from '@supabase/supabase-js';

interface DimensionScore {
  id: string;
  score: number;
  level: string;
}

interface ProfileBody {
  personalitySlug: string;
  dimensionScores: DimensionScore[];
  source: 'self_test' | 'pair_flow' | 'stealth';
}

// POST handler: save a CPTI profile snapshot
export const POST = withAuth(async (
  req: NextRequest,
  _context: { params: Promise<Record<string, string>> },
  user: User
) => {
  try {
    const body = await req.json();
    const { personalitySlug, dimensionScores, source } = body as ProfileBody;

    if (!personalitySlug || !dimensionScores || !source) {
      return NextResponse.json(
        { error: 'Missing required fields: personalitySlug, dimensionScores, source' },
        { status: 400 }
      );
    }

    if (!['self_test', 'pair_flow', 'stealth'].includes(source)) {
      return NextResponse.json(
        { error: 'Invalid source. Must be one of: self_test, pair_flow, stealth' },
        { status: 400 }
      );
    }

    const userId = user.id;

    const adminClient = createAdminSupabaseClient();
    
    // Insert profile snapshot into Supabase
    const { data: profile, error: insertError } = await adminClient
      .from('cpti_profile_snapshots')
      .insert({
        user_id: userId,
        source: source,
        personality_slug: personalitySlug,
        dimension_scores: dimensionScores,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[profiles POST] Failed to insert profile snapshot:', insertError);
      return NextResponse.json(
        { error: 'Failed to save profile snapshot' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        profileId: profile.id,
        personalitySlug: profile.personality_slug,
        dimensionScores: profile.dimension_scores,
        source: profile.source,
        createdAt: profile.created_at,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[profiles POST] Failed to save profile:', error);
    return NextResponse.json(
      { error: 'Failed to save CPTI profile' },
      { status: 500 }
    );
  }
});
