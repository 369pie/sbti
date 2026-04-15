import type { Metadata } from 'next';
import CptiInviteContent from './CptiInviteContent';

export const metadata: Metadata = {
  title: '来测测我们是什么CP关系 — CPTI',
  description: '你的朋友/对象邀请你一起测CP关系类型，12道观察题，看看你们是25种关系中的哪一种。',
  robots: { index: false, follow: false },
};

export default function CptiInvitePage() {
  return <CptiInviteContent />;
}
