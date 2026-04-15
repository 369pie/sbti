import type { Metadata } from 'next';
import HomeContent from './HomeContent';
import { getSiteUrl } from '@/lib/site';

const homepageFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'WTFTI 是什么？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'WTFTI 是一个多宇宙人格测试平台。同一个你，在不同主题宇宙里有不同的人格翻译，经典版、毒舌版、社畜版、鸟类版、花朵版各有独立的视觉风格和测试体验。',
      },
    },
    {
      '@type': 'Question',
      name: '和 MBTI 有什么区别？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MBTI 更像经典人格框架，WTFTI 更贴近中文互联网语境。在这里你看到的是生活反应、关系状态和行为习惯，不是四个字母和理论模型。',
      },
    },
    {
      '@type': 'Question',
      name: '这么多宇宙，我该从哪个开始？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '推荐先测经典版 SBTI，拿到你的基线人格后再去其他宇宙看看你会被翻译成什么样。每个宇宙都有自己的风格和乐趣。',
      },
    },
    {
      '@type': 'Question',
      name: '结果能拿来做严肃诊断吗？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '不能。WTFTI 的核心是娱乐和自我观察，适合截图发给朋友一起笑，不适合替代专业心理评估。',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: 'WTFTI 多宇宙人格测试平台 — 测测你是哪种抽象人格',
  description:
    'WTFTI 多宇宙人格测试平台：先从经典 SBTI 人格测试开始，再去毒舌版、修仙版、鸟类版、花朵版等宇宙看看同一个你会被翻译成什么样。',
  alternates: { canonical: '/' },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageFaqSchema) }}
      />
      <HomeContent />
    </>
  );
}
