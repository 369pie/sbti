import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RegisterForm } from './RegisterForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '注册 — WTFTI',
  description: '创建 WTFTI 账号，开始收集你的多宇宙人格图鉴。',
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
