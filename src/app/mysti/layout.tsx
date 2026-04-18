import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import { MystiThemeProvider } from '@/components/MystiThemeProvider';
import { MystiThemeToggle } from '@/components/MystiThemeToggle';
import { MystiSubscriptionBoot } from '@/components/MystiSubscriptionBoot';
import { MystiSubscriptionExpiryBanner } from '@/components/MystiSubscriptionExpiryBanner';
import { getAutoTimeTheme } from '@/lib/mysti/themes-v2';

export const metadata: Metadata = {
  title: 'WTFTI 灵鉴 — 用塔罗重新翻译你的人格',
  description: '灵鉴将你的人格映射到大阿卡纳塔罗牌，生成专属灵魂卡牌。单人解读或双人合盘，探索你与 TA 的灵魂绑定。',
  keywords: ['WTFTI', '灵鉴', '塔罗牌', '人格测试', '灵魂卡牌', '大阿卡纳', '合盘', '关系解读'],
  alternates: { canonical: '/mysti/' },
  openGraph: {
    title: 'WTFTI 灵鉴 — 用塔罗重新翻译你的人格',
    description: '灵鉴将你的人格映射到大阿卡纳塔罗牌，生成专属灵魂卡牌。单人解读或双人合盘，探索你与 TA 的灵魂绑定。',
    url: getSiteUrl('/mysti/'),
    images: [{ url: getSiteUrl('/images/mysti/og-default.png'), width: 1200, height: 630, alt: 'WTFTI 灵鉴' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WTFTI 灵鉴 — 用塔罗重新翻译你的人格',
    description: '灵鉴将你的人格映射到大阿卡纳塔罗牌，生成专属灵魂卡牌。',
    images: [getSiteUrl('/images/mysti/og-default.png')],
  },
  robots: { index: true, follow: true },
};

export default function MystiLayout({ children }: { children: React.ReactNode }) {
  return (
    <MystiThemeProvider defaultTheme={getAutoTimeTheme()}>
      <MystiSubscriptionBoot />
      <MystiSubscriptionExpiryBanner />
      {children}
      <MystiThemeToggle />
    </MystiThemeProvider>
  );
}
