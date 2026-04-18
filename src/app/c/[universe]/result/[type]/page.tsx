import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { getSiteUrl } from '@/lib/site';
import { createPublicServerSupabaseClient } from '@/lib/supabase/server-public';
import { CreatorResultContent } from './CreatorResultContent';

type PageProps = {
  params: Promise<{ universe: string; type: string }>;
};

const loadPublicCreatorResultPageData = unstable_cache(
  async (slug: string, type: string) => {
    const supabase = createPublicServerSupabaseClient();

    const { data: universe } = await supabase
      .from('creator_universes')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (!universe) return null;

    const [personalityResult, allPersonalitiesResult, creatorResult] = await Promise.all([
      supabase
        .from('creator_personalities')
        .select('*')
        .eq('universe_id', universe.id)
        .eq('slug', type)
        .single(),
      supabase
        .from('creator_personalities')
        .select('slug, name, emoji, tagline, color, thumbnail_url')
        .eq('universe_id', universe.id)
        .order('sort_order'),
      supabase
        .from('creators')
        .select('id, name, avatar_url, social_link, bio, is_verified')
        .eq('id', universe.creator_id)
        .single(),
    ]);

    return {
      universe,
      personality: personalityResult.data,
      allPersonalities: allPersonalitiesResult.data ?? [],
      creator: creatorResult.data,
    };
  },
  ['creator-public-result-page-v1'],
  { revalidate: 300 },
);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { universe: slug, type } = await params;
  const data = await loadPublicCreatorResultPageData(slug, type);
  const universe = data?.universe;

  if (!universe) return { title: '结果不存在' };

  const p = data.personality;

  const title = p
    ? `${universe.emoji} ${universe.name} · ${p.name}`
    : `${universe.emoji} ${universe.name}`;

  return {
    title,
    description: p?.tagline ?? universe.description ?? undefined,
    openGraph: {
      title,
      description: p?.tagline ?? undefined,
      url: getSiteUrl(`/c/${slug}/result/${type}/`),
    },
  };
}

export default async function CreatorResultPage({ params }: PageProps) {
  const { universe: slug, type } = await params;
  const data = await loadPublicCreatorResultPageData(slug, type);

  if (!data?.universe || !data.personality) notFound();

  return (
    <CreatorResultContent
      universe={data.universe}
      personality={data.personality}
      allPersonalities={data.allPersonalities}
      creator={data.creator}
    />
  );
}
