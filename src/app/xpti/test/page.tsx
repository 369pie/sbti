import { XptiQuiz } from '@/components/XptiQuiz';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '开始测试 — XPTI 亲密偏好图谱',
  description: '从 54 题随机抽 27 题，测出你的关系原型。9 大维度、12 种关系原型。',
  robots: { index: false, follow: true },
};

export default function XptiTestPage() {
  return <XptiQuiz />;
}
