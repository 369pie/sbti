import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { isValidPairCodeFormat, normalizePairCode } from '@/lib/cpti/pair-code';

// GET handler: resolve a pair code
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const rawCode = (await params).code;
    const code = normalizePairCode(rawCode ?? '');

    if (!isValidPairCodeFormat(code)) {
      return NextResponse.json(
        { valid: false, error: 'Invalid code format' },
        { status: 400 }
      );
    }

    const adminClient = createAdminSupabaseClient();
    
    // Query pair code from Supabase
    const { data: pairCode, error: queryError } = await adminClient
      .from('cpti_pair_codes')
      .select('id, code, code_mode, expires_at, creator_user_id, creator_snapshot_id, used_count, max_uses, status')
      .eq('code', code)
      .eq('status', 'active')
      .maybeSingle();

    if (queryError) {
      console.error('[pair-codes GET] Error querying pair code:', queryError);
      return NextResponse.json(
        { valid: false, error: 'Failed to query pair code' },
        { status: 500 }
      );
    }

    // If not found, return invalid
    if (!pairCode) {
      return NextResponse.json({ valid: false });
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(pairCode.expires_at);
    
    if (expiresAt < now) {
      // Mark as expired (optional: update status in DB)
      return NextResponse.json({ valid: false });
    }

    if (pairCode.used_count >= pairCode.max_uses) {
      return NextResponse.json({ valid: false });
    }

    const [{ data: profile }, { data: snapshot }] = await Promise.all([
      adminClient
        .from('user_profiles')
        .select('nickname')
        .eq('user_id', pairCode.creator_user_id)
        .maybeSingle(),
      pairCode.creator_snapshot_id
        ? adminClient
            .from('cpti_profile_snapshots')
            .select('personality_slug')
            .eq('id', pairCode.creator_snapshot_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    // Return valid pair code with mapped camelCase fields
    return NextResponse.json({
      valid: true,
      id: pairCode.id,
      code: pairCode.code,
      mode: pairCode.code_mode,
      expiresAt: pairCode.expires_at,
      creatorUserId: pairCode.creator_user_id,
      usedCount: pairCode.used_count,
      maxUses: pairCode.max_uses,
      inviterNickname: profile?.nickname ?? null,
      inviterPersonalitySlug: snapshot?.personality_slug ?? null,
    });
  } catch (error) {
    console.error('[pair-codes GET] Failed to resolve pair code:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to resolve pair code' },
      { status: 500 }
    );
  }
}
