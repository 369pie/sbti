import type { Metadata } from 'next';
import HomeContentV2 from './HomeContentV2';

const homepageFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'WTFTI 是什么？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'WTFTI 是为 18–32 岁中文女性打造的人格宇宙与灵魂生活社区——测一次看见自己，每天打开有一点 sign，和无数「她」一起把生活过成想要的样子。',
      },
    },
    {
      '@type': 'Question',
      name: 'WTFTI 和 MBTI 有什么区别？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MBTI 用四个字母定义你，WTFTI 用多个宇宙翻译你。我们更在意中文互联网语境里女性的生活反应、关系状态、身体节律和情绪节奏，而不是理论模型。',
      },
    },
    {
      '@type': 'Question',
      name: '这么多宇宙，我该从哪个开始？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '推荐先玩疯TI，29 种梗人格测完直接发疯；想认真点再去做 90 秒主测，它会给你推荐最适合的起点。',
      },
    },
    {
      '@type': 'Question',
      name: 'WTFTI 是只为女生设计的吗？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '我们说「写给她」，是因为题目、视觉、语气都是从女性的日常出发。男生当然可以玩，尤其在 CPTI 关系深测中可以作为被邀请的关系对象参与。',
      },
    },
    {
      '@type': 'Question',
      name: '结果能拿来做严肃诊断吗？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '不能。WTFTI 的核心是娱乐、陪伴和自我观察，适合截图发给朋友、写进日记、保存成档案，但不适合替代专业心理评估。',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: 'WTFTI — 人格宇宙与灵魂生活社区',
  description:
    'WTFTI 是为 18–32 岁中文女性打造的人格宇宙与灵魂生活社区。测一次看见自己，每天打开有一点 sign，和无数「她」一起把生活过成想要的样子。',
  alternates: { canonical: '/' },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageFaqSchema) }}
      />
      <HomeContentV2 />
    </>
  );
}
