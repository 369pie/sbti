export type GuideArticle = {
  slug: string;
  title: string;
  description: string;
  category: string;
};

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: 'what-is-sbti',
    title: 'SBTI 是什么？为什么它会变成一种抽象人格测试',
    description: '从测试定位、五组切面和 15 个维度出发，快速看懂 SBTI 人格测试到底在测什么。',
    category: '测试说明',
  },
  {
    slug: 'how-to-read-sbti-results',
    title: 'SBTI 结果怎么看？十五维、稀有度和人格速写怎么理解',
    description: '看懂 SBTI 结果页里的十五维落点、人格速写、稀有度和相近人格对比。',
    category: '结果解读',
  },
  {
    slug: 'sbti-vs-mbti',
    title: 'SBTI 和 MBTI 有什么区别？',
    description: '从语言风格、使用场景、结果结构和社交传播方式比较 SBTI 与 MBTI。',
    category: '对比指南',
  },
];

export function getGuideArticle(slug: string): GuideArticle | undefined {
  return GUIDE_ARTICLES.find((item) => item.slug === slug);
}