import type { Metadata } from 'next';
import CPLandingContent from './CPLandingContent';

export const metadata: Metadata = {
  title: 'CP 配对测试 — SBTI 人格测试',
  description:
    '邀请好友来测 SBTI CP 契合度！27 种人格 × 27 种人格 = 729 种配对组合，看看你们的化学反应。',
  alternates: { canonical: '/cp/' },
};

export default function Page() {
  return <CPLandingContent />;
}
