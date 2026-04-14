import type { Metadata } from 'next';
import { IdentifyChallengeContent } from './IdentifyChallengeContent';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: '有人鉴定了你的人格！— WTF 好友鉴定',
  description: '你的朋友帮你做了一次 WTF 人格鉴定，来看看 ta 眼中的你是什么样的',
};

export default function IdentifyChallengePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    }>
      <IdentifyChallengeContent />
    </Suspense>
  );
}
