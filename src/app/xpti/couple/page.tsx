import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import { decodeCoupleInvite } from '@/lib/xpti/couple';
import {
  createCouple,
  getCoupleByShareToken,
} from '@/lib/xpti/couple-server';
import { buildCoupleView } from '@/lib/xpti/couple-view';
import { CoupleClient } from './CoupleClient';

export const metadata: Metadata = {
  title: '我和他 · 合不合 — 你先测，再邀请他 | WTFTI',
  description:
    '「我和他」：你先测，再把链接发给他（12 题）。两个人都测完，看你们的关系雷达、相处模式和对话脚本。',
  alternates: { canonical: '/xpti/couple/' },
  openGraph: {
    title: '我和他 · 合不合',
    description: '你先测，再邀请他 → 两个人的关系报告。',
    url: getSiteUrl('/xpti/couple/'),
    type: 'website',
  },
  robots: { index: true, follow: true },
};

interface XptiCouplePageProps {
  searchParams?: Promise<{ token?: string | string[]; inv?: string | string[] }>;
}

function pickFirst(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}


export default async function XptiCouplePage({ searchParams }: XptiCouplePageProps) {
  const params = (await searchParams) ?? {};
  const token = pickFirst(params.token);
  const rawInvite = pickFirst(params.inv);

  if (token) {
    const couple = await getCoupleByShareToken(token);
    if (couple) {
      return (
        <CoupleClient
          initialCouple={await buildCoupleView(couple)}
          initialShareToken={token}
          legacyInviteMode={false}
        />
      );
    }
    return <CoupleClient initialCouple={null} initialShareToken={null} legacyInviteMode={false} />;
  }

  if (rawInvite) {
    const decoded = decodeCoupleInvite(rawInvite);
    if (decoded) {
      let upgradedCouple: Awaited<ReturnType<typeof createCouple>> | null = null;
      try {
        upgradedCouple = await createCouple({
          inviterSlug: decoded.slug,
          inviterDims: decoded.dims,
          inviterNickname: decoded.nick ?? null,
        });
      } catch (err) {
        console.error('[xpti/couple page] legacy invite upgrade failed', err);
      }
      if (upgradedCouple) {
        return (
          <CoupleClient
            initialCouple={await buildCoupleView(upgradedCouple)}
            initialShareToken={upgradedCouple.share_token}
            legacyInviteMode={true}
          />
        );
      }
    }
  }

  return <CoupleClient initialCouple={null} initialShareToken={null} legacyInviteMode={false} />;
}
