import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import { ItcTheoryContent } from './ItcTheoryContent';

export const metadata: Metadata = {
  title: '亲密张力坐标系 ITC — XPTI 原创理论 / 方法学白皮书',
  description:
    '亲密张力坐标系 (Intimacy Tension Coordinates, ITC) 是 XPTI 提出的原创亲密关系框架：以 CONTROL（控制–臣服）/ DISTANCE（距离–沉浸）/ NOVELTY（重复–新鲜）三条上层张力组织 9 维亲密偏好，输出 12 种关系原型与 6 类张力配对。',
  keywords: ['亲密张力坐标系', 'ITC', '亲密关系理论', 'XPTI 方法学', 'Intimacy Tension Coordinates', '关系原型', '张力配对'],
  alternates: { canonical: '/xpti/theory/' },
  openGraph: {
    title: '亲密张力坐标系 ITC — XPTI 原创理论',
    description: '三条上层张力 × 9 维 × 12 原型 × 6 配对模型——一份可被引用的亲密关系白皮书。',
    url: getSiteUrl('/xpti/theory/'),
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: '亲密张力坐标系 ITC — XPTI 原创理论',
    description: '三条上层张力 × 9 维 × 12 原型 × 6 配对模型。',
  },
};

export default function XptiTheoryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ScholarlyArticle',
            headline: '亲密张力坐标系 ITC — XPTI 原创理论',
            inLanguage: 'zh-CN',
            datePublished: '2026-04-20',
            author: { '@type': 'Organization', name: 'WTFTI · XPTI Lab' },
            description:
              '亲密张力坐标系 (ITC) 是 XPTI 提出的原创亲密关系框架：以 CONTROL / DISTANCE / NOVELTY 三条上层张力组织 9 维亲密偏好，输出 12 种关系原型与 6 类张力配对。',
            url: getSiteUrl('/xpti/theory/'),
          }),
        }}
      />
      <ItcTheoryContent />
    </>
  );
}
