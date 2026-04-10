import { WorkQuiz } from '@/components/WorkQuiz';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '开始测试 — 打工人格测试 WPTI',
  description: '15 道灵魂拷问，测出你是哪种打工人。',
};

export default function WorkTestPage() {
  return <WorkQuiz />;
}
