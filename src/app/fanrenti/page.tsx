import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import FanrentiLandingContent from './FanrentiLandingContent';

export const metadata: Metadata = {
  title: '凡人TI · 修仙 — 你是凡人修仙传里的哪号修士？',
  description:
    '3 分钟情境题，把你对号入座到 12 位凡修正典角色 + 6 个境界气质。道友请留步，先来入门问道。',
  keywords: [
    '凡人TI',
    '凡人修仙传 人格',
    '修仙 人格测试',
    '韩立 MBTI',
    '散修测试',
    '道友请留步',
    'WTFTI',
  ],
  alternates: { canonical: '/fanrenti/' },
  openGraph: {
    title: '凡人TI · 修仙 — 你是哪号修士？',
    description: '12 位正典角色 · 6 种境界气质 · 3 分钟入门问道',
    url: getSiteUrl('/fanrenti/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: '凡人TI · 修仙 — 你是哪号修士？',
    description: '12 位正典角色 · 6 种境界气质 · 3 分钟入门问道',
  },
};

export default function FanrentiPage() {
  return <FanrentiLandingContent />;
}
