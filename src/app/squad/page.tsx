import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getSiteUrl } from '@/lib/site';
import SquadContent from './SquadContent';

export const metadata: Metadata = {
  title: '组局测试 — 看看你们这群人有多抽象 | WTFTI',
  description: '拉上你的宿舍/闺蜜/同事一起测，生成群体抽象全家福。看看你们的摆烂指数、社恐浓度、内耗指数到底有多离谱。',
  keywords: ['组局测试', '群体人格', '团队测试', '抽象全家福', '人格测试', 'WTFTI'],
  alternates: { canonical: '/squad/' },
  openGraph: {
    title: '组局测试 — 看看你们这群人有多抽象',
    description: '拉上宿舍/闺蜜/同事一起测，生成群体抽象全家福。',
    url: getSiteUrl('/squad/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: '组局测试 — 看看你们这群人有多抽象',
    description: '拉上宿舍/闺蜜/同事一起测，生成群体抽象全家福。',
  },
};

export default function SquadPage() {
  return (
    <Suspense>
      <SquadContent />
    </Suspense>
  );
}
