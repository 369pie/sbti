import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import { decodeCoupleInvite } from '@/lib/xpti/couple';
import {
  createCouple,
  getCoupleByShareToken,
  type XptiCoupleRow,
} from '@/lib/xpti/couple-server';
import { CoupleClient, type InitialCoupleProps } from './CoupleClient';

export const metadata: Metadata = {
  title: 'XPTI · 关系合并报告 / 亲密张力配对',
  description:
    '用 12 道精简题完成另一半的 XPTI 测试，与你的张力签名合并，生成关系雷达 + 6 类配对模型 + 24 句对话脚本。',
  alternates: { canonical: '/xpti/couple/' },
  openGraph: {
    title: 'XPTI · 关系合并报告',
    description: '12 道精简题 → 双人张力雷达 + 配对模型 + 对话脚本。',
    url: getSiteUrl('/xpti/couple/'),
    type: 'website',
  },
  robots: { index: false, follow: false },
};

interface XptiCouplePageProps {
  searchParams?: Promise<{ token?: string | string[]; inv?: string | string[] }>;
}

function pickFirst(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
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

export default async function XptiCouplePage({ searchParams }: XptiCouplePageProps) {
  const params = (await searchParams) ?? {};
  const token = pickFirst(params.token);
  const rawInvite = pickFirst(params.inv);

  if (token) {
    const couple = await getCoupleByShareToken(token);
    if (couple) {
      return (
        <CoupleClient
          initialCouple={toView(couple)}
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
      try {
        const couple = await createCouple({
          inviterSlug: decoded.slug,
          inviterDims: decoded.dims,
          inviterNickname: decoded.nick ?? null,
        });
        return (
          <CoupleClient
            initialCouple={toView(couple)}
            initialShareToken={couple.share_token}
            legacyInviteMode={true}
          />
        );
      } catch (err) {
        console.error('[xpti/couple page] legacy invite upgrade failed', err);
      }
    }
  }

  return <CoupleClient initialCouple={null} initialShareToken={null} legacyInviteMode={false} />;
}
