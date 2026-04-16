import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/supabase/with-auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { User } from '@supabase/supabase-js';
import type { CptiClaimSource } from '@/lib/cpti/claim';
import type { CptiDimensionScore } from '@/lib/cpti/scoring';
import { generatePairCode } from '@/lib/cpti/pair-code';

// TypeScript types matching Supabase schema enums
type CptiPairCodeMode = 'direct' | 'open';
type CptiPairCodeStatus = 'active' | 'consumed';

interface PairCodeBody {
  mode: CptiPairCodeMode;
  maxUses?: number;
  expiresInHours?: number;
  personalitySlug?: string;
  dimensionScores?: CptiDimensionScore[];
  source?: CptiClaimSource;
}

// POST handler: create a new pair code
export const POST = withAuth(async (
  req: NextRequest,
  _context: { params: Promise<Record<string, string>> },
  user: User
) => {
  try {
    const body = await req.json();
    const {
      mode,
      maxUses,
      expiresInHours,
      personalitySlug,
      dimensionScores,
      source,
    } = body as PairCodeBody;

    if (!mode || !['direct', 'open'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid or missing mode. Must be "direct" or "open".' },
        { status: 400 }
      );
    }

    const creatorUserId = user.id;

    const adminClient = createAdminSupabaseClient();
    const expiresAt = new Date(
      Date.now() + (expiresInHours ?? 24) * 60 * 60 * 1000
    ).toISOString();
    const resolvedMaxUses = maxUses ?? (mode === 'open' ? 20 : 1);

    let creatorSnapshotId: string | null = null;

    if (personalitySlug && dimensionScores && source) {
      const { data: snapshot, error: snapshotError } = await adminClient
        .from('cpti_profile_snapshots')
        .insert({
          user_id: creatorUserId,
          source,
          personality_slug: personalitySlug,
          dimension_scores: dimensionScores,
        })
        .select('id')
        .single();

      if (snapshotError) {
        console.error('[pair-codes POST] Failed to create creator snapshot:', snapshotError);
        return NextResponse.json(
          { error: 'Failed to persist creator profile for pair code' },
          { status: 500 }
        );
      }

      creatorSnapshotId = snapshot.id;
    } else {
      const { data: latestSnapshot } = await adminClient
        .from('cpti_profile_snapshots')
        .select('id')
        .eq('user_id', creatorUserId)
        .order('tested_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      creatorSnapshotId = latestSnapshot?.id ?? null;
    }

    // Generate a unique alphanumeric code (retry up to 10 times on collision)
    let code: string | null = null;
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = generatePairCode();
      const { data: existing, error: checkError } = await adminClient
        .from('cpti_pair_codes')
        .select('id')
        .eq('code', candidate)
        .eq('status', 'active')
        .maybeSingle();

      if (checkError) {
        console.error('[pair-codes POST] Error checking code uniqueness:', checkError);
        return NextResponse.json(
          { error: 'Failed to generate unique pair code' },
          { status: 500 }
        );
      }

      if (!existing) {
        code = candidate;
        break;
      }
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Could not generate a unique pair code after multiple attempts' },
        { status: 500 }
      );
    }

    const shareToken = crypto.randomUUID();

    // Insert pair code into Supabase
    const { data: pairCode, error: insertError } = await adminClient
      .from('cpti_pair_codes')
      .insert({
        code,
        code_mode: mode,
        creator_user_id: creatorUserId,
        creator_snapshot_id: creatorSnapshotId,
        share_token: shareToken,
        status: 'active' as CptiPairCodeStatus,
        max_uses: resolvedMaxUses,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[pair-codes POST] Failed to insert pair code:', insertError);
      return NextResponse.json(
        { error: 'Failed to create pair code' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        code: pairCode.code,
        shareToken: pairCode.share_token,
        expiresAt: pairCode.expires_at,
        mode: pairCode.code_mode,
        maxUses: pairCode.max_uses,
        creatorSnapshotId: pairCode.creator_snapshot_id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[pair-codes POST] Failed to create pair code:', error);
    return NextResponse.json(
      { error: 'Failed to create pair code' },
      { status: 500 }
    );
  }
});
