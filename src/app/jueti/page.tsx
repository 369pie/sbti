import type { Metadata } from 'next';
import JuetiLandingContent from './JuetiLandingContent';

export const metadata: Metadata = {
  title: '觉TI 自然人格觉察 — 向内看见你是哪种自然力',
  description:
    '觉TI 自然人格觉察测试：4 轴觉察、20 道自问、16 种自然人格，三分钟看见那个你还没说出口的自己。不是标签，是一面安静的镜子。',
  keywords: ['觉TI', '自然人格', '人格觉察', '性格测试', '女性人格测试', 'MBTI', '人格测试'],
  alternates: { canonical: '/jueti/' },
};

export default function JuetiPage() {
  return <JuetiLandingContent />;
}
