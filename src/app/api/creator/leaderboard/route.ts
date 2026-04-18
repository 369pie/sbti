import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { fetchLeaderboard } from '@/lib/ugc/earnings';

/**
 * GET /api/creator/leaderboard — Public creator leaderboard.
 *
 * Query params:
 *   - limit: max entries (default 50, max 100)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.min(
    parseInt(url.searchParams.get('limit') ?? '50', 10) || 50,
    100,
  );

  const supabase = await createServerSupabaseClient();
  const entries = await fetchLeaderboard(supabase, limit);

  return NextResponse.json(
    { entries },
    {
      headers: {
        'Cache-Control':
          'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
      },
    },
  );
}
