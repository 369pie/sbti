import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSiteUrl } from '@/lib/site';
import { getCoupleByShareToken, type XptiCoupleRow } from '@/lib/xpti/couple-server';
import { CoupleClient, type InitialCoupleProps } from '../../CoupleClient';

interface ResultPageProps {
  params: Promise<{ shareToken: string }>;
}

export async function generateMetadata({ params }: ResultPageProps): Promise<Metadata> {
  const { shareToken } = await params;
  const couple = await getCoupleByShareToken(shareToken);
  const label = couple?.merged_payload?.pairing.label ?? 'XPTI · 关系合并报告';
  const oneLine = couple?.merged_payload?.pairing.oneLine ?? '12 道精简题 → 双人张力雷达 + 配对模型 + 对话脚本。';
  const url = getSiteUrl(`/xpti/couple/result/${shareToken}/`);
  return {
    title: `${label} · XPTI 关系报告`,
    description: oneLine,
    alternates: { canonical: `/xpti/couple/result/${shareToken}/` },
    openGraph: {
      title: `${label} · XPTI`,
      description: oneLine,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${label} · XPTI`,
      description: oneLine,
    },
    robots: { index: false, follow: false },
  };
}

function toView(couple: XptiCoupleRow): NonNullable<InitialCoupleProps['initialCouple']> {
  return {
    shareToken: couple.share_token,
    pairCode: couple.pair_code,
    status: couple.status,
    inviter: {
      slug: couple.inviter_slug,
      dims: couple.inviter_dims,
      nickname: couple.inviter_nickname,
    },
    partner: couple.partner_slug
      ? {
          slug: couple.partner_slug,
          dims: couple.partner_dims!,
          nickname: couple.partner_nickname,
        }
      : null,
    merged: couple.merged_payload,
    unlocked: couple.unlocked_at != null,
    unlockedSku: couple.unlocked_sku,
    unlockedAt: couple.unlocked_at,
    completedAt: couple.completed_at,
    expiresAt: couple.expires_at,
    history: (couple.history ?? []) as NonNullable<InitialCoupleProps['initialCouple']>['history'],
  };
}

export default async function XptiCoupleResultPage({ params }: ResultPageProps) {
  const { shareToken } = await params;
  const couple = await getCoupleByShareToken(shareToken);
  if (!couple) notFound();
  return (
    <CoupleClient
      initialCouple={toView(couple)}
      initialShareToken={shareToken}
      legacyInviteMode={false}
    />
  );
}
