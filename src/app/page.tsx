import type { Metadata } from 'next';
import HomeContent from './HomeContent';
import { getSiteUrl } from '@/lib/site';

const homepageFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'SBTI 人格测试是什么？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SBTI 人格测试是一套偏中文互联网语境的人格测试，会从自我、情感、态度、行动和社交五组切面切入，再落到十五个维度和二十七种人格结果上。',
      },
    },
    {
      '@type': 'Question',
      name: 'SBTI 和 MBTI 有什么区别？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MBTI 更接近经典人格分类框架，SBTI 则更强调日常表达、行为习惯和中文互联网语境里的抽象人格标签，结果会更轻松、更贴近日常体验。',
      },
    },
    {
      '@type': 'Question',
      name: 'SBTI 人格测试测完能看到什么？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '测完之后可以看到你的专属人格名称、十五维落点、结果解读，以及其他人格类型的详情页，方便继续对照和分享。',
      },
    },
    {
      '@type': 'Question',
      name: 'SBTI 会上传测试答案吗？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '本站的核心测试流程以浏览器端计算为主，不需要注册账号即可完成测试。分享图片也主要在本地生成，不会把你的答案自动公开。',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: 'SBTI 人格测试在线测试 — 测测你是哪种抽象人格',
  description:
    'SBTI 人格测试在线测试：从自我、情感、态度、行动和社交 5 组切面切入，结合 15 个维度和 27 种结果，帮你快速看清自己的抽象人格。',
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
