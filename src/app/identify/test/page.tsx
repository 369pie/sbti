import { IdentifyQuiz } from '@/components/IdentifyQuiz';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '好友人格鉴定中 — WTF 好友鉴定器',
  description: '10 道题鉴定你好友的 WTF 人格，生成鉴定书。',
  robots: { index: false, follow: true },
};

export default function IdentifyTestPage() {
  return <IdentifyQuiz />;
}
