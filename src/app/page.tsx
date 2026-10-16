import type { Metadata } from 'next';
import HomeContent from './HomeContent';

const homepageFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'WTFTI 是什么？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'WTFTI 是写给女生的情绪陪伴站：每天一张牌帮你安顿情绪，XPTI 关系报告帮你看懂你和 ta 怎么沟通、怎么靠近。',
      },
    },
    {
      '@type': 'Question',
      name: '情侣关系报告能看到什么？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '你和 ta 各自完成 XPTI 测试后，可以解锁双人合并雷达、6 类张力配对和 24 句对话脚本。可以一方付清，也可以两人各付一半。',
      },
    },
    {
      '@type': 'Question',
      name: '我该从哪里开始？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '想安顿今天的情绪，先抽「今日一牌」；想看懂一段关系，和 ta 一起做 XPTI 关系测试；想快速认识自己，做三分钟经典测试。',
      },
    },
    {
      '@type': 'Question',
      name: '结果能拿来做严肃诊断吗？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '不能。WTFTI 用于自我观察和关系沟通参考，不能替代专业心理评估。',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: 'WTFTI — 女生的情绪陪伴站 · 情侣关系沟通报告',
  description:
    '先听懂今天的自己，再看清一段关系。每日一牌安顿情绪，XPTI 情侣关系报告帮你读懂 ta 的沟通方式，也被 ta 读懂。',
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
