import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { fetchPublishedUniverse, toFlexAxes, toFlexQuestions, toFlexPersonalities } from '@/lib/ugc/db';
import { CreatorQuiz } from '@/components/CreatorQuiz';
import { notFound } from 'next/navigation';
import { createPublicServerSupabaseClient } from '@/lib/supabase/server-public';

type Params = { params: Promise<{ universe: string }> };

const loadPublishedCreatorUniverse = unstable_cache(
  async (slug: string) => {
    const supabase = createPublicServerSupabaseClient();
    return fetchPublishedUniverse(supabase, slug);
  },
  ['creator-public-test-page-v1'],
  { revalidate: 300 },
);

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { universe: slug } = await params;
  const bundle = await loadPublishedCreatorUniverse(slug);

  if (!bundle) return { title: '测试不存在' };

  return {
    title: `${bundle.universe.emoji} ${bundle.universe.name} — 人格测试`,
    description: bundle.universe.description ?? `来测测你是哪种「${bundle.universe.name}」人格！`,
    openGraph: {
      title: `${bundle.universe.emoji} ${bundle.universe.name}`,
      description: bundle.universe.description ?? undefined,
    },
  };
}

export default async function CreatorTestPage({ params }: Params) {
  const { universe: slug } = await params;
  const bundle = await loadPublishedCreatorUniverse(slug);

  if (!bundle) notFound();

  const flexAxes = toFlexAxes(bundle.axes);
  const flexQuestions = toFlexQuestions(bundle.questions);
  const flexPersonalities = toFlexPersonalities(bundle.personalities);

  return (
    <CreatorQuiz
      universeSlug={bundle.universe.slug}
      universeName={bundle.universe.name}
      emoji={bundle.universe.emoji}
      primaryColor={bundle.universe.primary_color}
      scoringMode={bundle.universe.scoring_mode}
      axes={flexAxes}
      questions={flexQuestions}
      personalities={flexPersonalities}
      questionsPerTest={bundle.universe.questions_per_test ?? undefined}
      universeId={bundle.universe.id}
    />
  );
}
