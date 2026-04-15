import { CptiQuiz } from '@/components/CptiQuiz';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '开始测试 — CP角色图鉴 CPTI',
  description: '20 道真实恋爱场景，测出你在关系里是什么角色。5 个关系维度、16 种CP角色。',
  robots: { index: false, follow: true },
};

export default function CptiTestPage() {
  return <CptiQuiz />;
}
