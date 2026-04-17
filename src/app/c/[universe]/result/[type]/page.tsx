import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/site';
import { CreatorResultContent } from './CreatorResultContent';

type PageProps = {
  params: Promise<{ universe: string; type: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { universe: slug, type } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: universe } = await supabase
    .from('creator_universes')
    .select('id, name, emoji, description, slug')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!universe) return { title: '结果不存在' };

  const { data: personality } = await supabase
    .from('creator_personalities')
    .select('name, tagline, emoji')
    .eq('universe_id', universe.id)
    .eq('slug', type)
    .single();

  const p = personality;

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
  const supabase = await createServerSupabaseClient();

  // Fetch universe
  const { data: universe } = await supabase
    .from('creator_universes')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!universe) notFound();

  // Fetch the matched personality
  const { data: personality } = await supabase
    .from('creator_personalities')
    .select('*')
    .eq('universe_id', universe.id)
    .eq('slug', type)
    .single();

  if (!personality) notFound();

  // Fetch all personalities (for "other types" grid)
  const { data: allPersonalities } = await supabase
    .from('creator_personalities')
    .select('slug, name, emoji, tagline, color, thumbnail_url')
    .eq('universe_id', universe.id)
    .order('sort_order');

  // Fetch creator
  const { data: creator } = await supabase
    .from('creators')
    .select('id, name, avatar_url, social_link, bio, is_verified')
    .eq('id', universe.creator_id)
    .single();

  return (
    <CreatorResultContent
      universe={universe}
      personality={personality}
      allPersonalities={allPersonalities ?? []}
      creator={creator}
    />
  );
}
