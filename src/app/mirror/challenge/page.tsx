import type { Metadata } from 'next';
import MirrorChallengeClient from './MirrorChallengeClient';

export const metadata: Metadata = {
  title: '灵镜挑战 — WTFTI',
  description: '邀请好友一起做灵镜测试，看看谁的风格更有趣。',
  alternates: { canonical: '/mirror/challenge/' },
};

export default function MirrorChallengePage() {
  return <MirrorChallengeClient />;
}
