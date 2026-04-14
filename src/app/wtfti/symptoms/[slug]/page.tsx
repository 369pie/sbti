import { notFound } from 'next/navigation';
import { getWtftiPersonality, getWtftiSlugs, getWtftiTypeImage } from '@/lib/wtfti-personalities';
import { SymptomsContent } from './SymptomsContent';
import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getWtftiSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const p = getWtftiPersonality(slug);
  if (!p) return {};

  return {
    title: `${p.wtftiName}症状清单 — 你中了几枪？`,
    description: `${p.wtftiName}的 5 条隐藏症状，对号入座看看你中了几枪。${p.copy.symptoms[0]}`,
    alternates: { canonical: `/wtfti/symptoms/${slug}/` },
    openGraph: {
      title: `${p.wtftiName}症状清单 — 你中了几枪？`,
      description: `${p.tagline} | 对着 5 条症状打勾，看看你中了几枪`,
      url: getSiteUrl(`/wtfti/symptoms/${slug}/`),
      images: [{ url: getWtftiTypeImage(slug), width: 256, height: 256, alt: p.wtftiName }],
    },
    twitter: {
      card: 'summary',
      title: `${p.wtftiName}症状清单 — 你中了几枪？`,
      description: `${p.tagline} | 中了几枪？`,
    },
  };
}

export default async function SymptomsPage({ params }: PageProps) {
  const { slug } = await params;
  const personality = getWtftiPersonality(slug);
  if (!personality) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'WTFTI', item: getSiteUrl('/wtfti/') },
            { '@type': 'ListItem', position: 2, name: '症状清单', item: getSiteUrl('/wtfti/symptoms/') },
            { '@type': 'ListItem', position: 3, name: personality.wtftiName },
          ],
        }) }}
      />
      <SymptomsContent personality={personality} />
    </>
  );
}
