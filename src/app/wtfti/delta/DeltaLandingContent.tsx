import { WtftiUniverseLanding } from '@/components/wtfti/WtftiUniverseLanding';
import { DELTA_PERSONALITIES } from '@/lib/delta/personalities';

const FEATURED = DELTA_PERSONALITIES.slice(0, 8);

export default function DeltaLandingContent() {
  return (
    <WtftiUniverseLanding
      eyebrow="WTFTI · Tactical Universe"
      title="三角TI 战区人格图鉴"
      accentTitle="把战术习惯翻译成你的边界感。"
      description="同一个你，在战区里的翻译版。三角TI 不追求男性化的硬核包装，而是用更干净、锋利、带一点玫瑰金属感的视觉，呈现你的决策节奏、压力反应与组队位置。"
      testHref="/wtfti/delta/test/"
      stats={[
        { value: '29', label: '战区人格' },
        { value: '4', label: '段式文案' },
        { value: '31', label: '共用题包' },
      ]}
      features={[
        { mark: 'I', title: '干员人格映射', desc: '29 种人格对应 29 种你在战区里的样子：推进、观察、救援、补给与收尾都各有气质。' },
        { mark: 'II', title: '战术行为切片', desc: '舔包、蹲点、改枪、上头和撤退时机，会变成你的压力人格画像。' },
        { mark: 'III', title: '轻装甲视觉', desc: '保留战术主题，但把黑红硬光换成柔和金属边线与奶油玫瑰画布。' },
        { mark: 'IV', title: '社交分享', desc: '可以拿去和队友互相吐槽，也不会让页面看起来像廉价游戏广告。' },
      ]}
      previewTitle="先看看你可能是谁"
      previewSubtitle="29 种战区人格，总有一种是你，或者那个总是先冲出去的人。"
      previewItems={FEATURED.map((personality) => ({
        href: `/wtfti/delta/result/${personality.slug}/`,
        name: personality.heroName,
        code: personality.code,
        color: personality.color,
        tagline: personality.tagline,
      }))}
      ctaTitle="开始战区人格测试"
      ctaBody="用更有质感的方式，看见你在压力场里的决策、边界与隐藏节奏。"
      ctaHref="/wtfti/delta/test/"
    />
  );
}
