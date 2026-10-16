import { NextResponse, type NextRequest } from 'next/server';
import { createHermosaArtifactImageResponse } from '@/lib/hermosa/artifact-image';
import { fetchHermosaArtifacts } from '@/lib/hermosa/public-artifacts';
import { isHermosaTopicWeek } from '@/lib/hermosa/tags';
import { getCurrentHermosaTopic } from '@/lib/hermosa/topics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const rawWeek = req.nextUrl.searchParams.get('week') ?? getCurrentHermosaTopic().week;
  if (!isHermosaTopicWeek(rawWeek)) {
    return NextResponse.json({ error: 'invalid_week' }, { status: 400 });
  }
  const rows = await fetchHermosaArtifacts({
    kind: 'book',
    week: rawWeek,
    limit: 8,
    selectedOnly: true,
    consentedOnly: true,
  });
  return createHermosaArtifactImageResponse({ kind: 'book', week: rawWeek, rows });
}
