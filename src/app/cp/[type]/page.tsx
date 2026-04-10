import { notFound } from 'next/navigation';
import { getPersonalityBySlug, getAllSlugs } from '@/lib/personalities';
import type { Metadata } from 'next';
import { CPInviteContent } from './CPInviteContent';

type PageProps = {
  params: Promise<{ type: string }>;
};

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const p = getPersonalityBySlug(type);
  if (!p) return {};
  return {
    title: `${p.code}（${p.name}）邀请你测 CP — SBTI`,
    description: `我是 ${p.code}（${p.name}），来测测我们的 CP 值吧！`,
    openGraph: {
      title: `我是 ${p.code}，来测测我们的 CP 值！`,
      description: `${p.tagline} — 来看看你和我的配对契合度`,
    },
  };
}

export default async function CPInvitePage({ params }: PageProps) {
  const { type } = await params;
  const personality = getPersonalityBySlug(type);
  if (!personality) notFound();

  return <CPInviteContent personality={personality} />;
}
