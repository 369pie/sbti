import type { Metadata } from 'next';
import IdentifyHomeContent from './IdentifyHomeContent';

export const metadata: Metadata = {
  title: '好友鉴定器 — WTF 你朋友居然是这种人',
  description:
    '不用 ta 亲自来测，你来帮 ta 鉴定！10 道题鉴定好友的 WTF 人格，生成鉴定书分享给 ta。',
  alternates: { canonical: '/identify/' },
};

export default function Page() {
  return <IdentifyHomeContent />;
}
