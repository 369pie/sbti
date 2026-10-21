import type { Metadata } from 'next';
import { Suspense } from 'react';
import { WechatPayGuide } from './WechatPayGuide';

export const metadata: Metadata = {
  title: '在浏览器中完成支付',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <WechatPayGuide />
    </Suspense>
  );
}
