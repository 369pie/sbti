import type { Metadata } from 'next';
import CPLandingContent from './CPLandingContent';

export const metadata: Metadata = {
  title: 'CP 配对测试 — WTFTI',
  description:
    '邀请好友来测 WTFTI CP 契合度！27 种经典人格 × 27 种经典人格 = 729 种配对组合，看看你们的化学反应。',
  alternates: { canonical: '/cp/' },
};

export default function Page() {
  return <CPLandingContent />;
}
