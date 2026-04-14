import type { Metadata } from 'next';
import { Suspense } from 'react';
import ShareTemplatesContent from './ShareTemplatesContent';

export const metadata: Metadata = {
  title: '分享文案模板 — 一键复制发小红书/微信/抖音 | WTFTI',
  description:
    '基于你的多宇宙人格测试结果，自动生成小红书、微信、抖音平台分享文案，一键复制即发。',
  openGraph: {
    title: '分享文案模板 | WTFTI多宇宙人格测试',
    description: '自动生成平台专属分享文案，一键复制。',
    type: 'website',
  },
};

export default function ShareTemplatesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      }
    >
      <ShareTemplatesContent />
    </Suspense>
  );
}
