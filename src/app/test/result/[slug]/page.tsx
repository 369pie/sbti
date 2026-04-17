import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { FIRST_LOOK_ARCHETYPES, getArchetypeBySlug } from '@/lib/first-look/archetypes';
import { FirstLookResultContent } from '@/components/FirstLookResultContent';
import { getSiteUrl } from '@/lib/site';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return FIRST_LOOK_ARCHETYPES.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const a = getArchetypeBySlug(slug);
  if (!a) return {};
  return {
    title: `#${a.code}「${a.name}」— WTFti · 初见`,
    description: `${a.tagline} — 你的 First Look 初见牌，仅 ${a.holdRate}% 的人是这张。`,
    alternates: { canonical: `/test/result/${slug}/` },
    openGraph: {
      title: `我的初见牌是「${a.name}」#${a.code}`,
      description: a.tagline,
      url: getSiteUrl(`/test/result/${slug}/`),
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: a.name }],
    },
    twitter: {
      card: 'summary',
      title: `我的初见牌是「${a.name}」#${a.code}`,
      description: a.tagline,
    },
  };
}

export default async function FirstLookResultPage({ params }: PageProps) {
  const { slug } = await params;
  const archetype = getArchetypeBySlug(slug);
  if (!archetype) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'WTFti', item: getSiteUrl('/') },
              { '@type': 'ListItem', position: 2, name: '初见', item: getSiteUrl('/test/') },
              { '@type': 'ListItem', position: 3, name: archetype.name },
            ],
          }),
        }}
      />
      <FirstLookResultContent slug={slug} />
    </>
  );
}
