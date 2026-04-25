import { WtftiUniverseLanding } from '@/components/wtfti/WtftiUniverseLanding';
import { KINGS_PERSONALITIES, getKingsTypeThumbnailImage } from '@/lib/kings/personalities';

const FEATURED = KINGS_PERSONALITIES.slice(0, 8);

export default function KingsLandingContent() {
  return (
    <WtftiUniverseLanding
      eyebrow="WTFTI · Valley Universe"
      title="王者TI 峡谷人格图鉴"
      accentTitle="把开黑习惯翻译成你的社交人格。"
      description="同一个你，在王者峡谷里的翻译版。这里不做粗糙游戏皮肤，而是把指挥、支援、上头、偷塔与开黑氛围，收进更精致的女性向图鉴页面。"
      testHref="/wtfti/kings/test/"
      stats={[
        { value: '29', label: '峡谷人格' },
        { value: '4', label: '段式文案' },
        { value: '31', label: '共用题包' },
      ]}
      features={[
        { mark: 'I', title: '峡谷英雄映射', desc: '29 种人格对应 29 种你在游戏里的样子：是指挥官、游走位，还是默默补位的人。' },
        { mark: 'II', title: '玩家行为切片', desc: '秒选、偷塔、开黑、抢 C 与救场习惯都会成为人格结果的一部分。' },
        { mark: 'III', title: '收藏式图鉴', desc: '把游戏人格做成更像卡册的视觉语言，而不是一次性梗图。' },
        { mark: 'IV', title: '分享友好', desc: '结果页适合发给队友，也适合拿来开一场轻松但不冒犯的对话。' },
      ]}
      previewTitle="先看看你可能是谁"
      previewSubtitle={`29 种峡谷人格，总有一种是你，或者你的队友。`}
      previewItems={FEATURED.map((personality) => ({
        href: `/wtfti/kings/result/${personality.slug}/`,
        name: personality.heroName,
        code: personality.code,
        color: personality.color,
        tagline: personality.tagline,
        imageSrc: getKingsTypeThumbnailImage(personality.slug),
        imageAlt: `${personality.heroName} 峡谷人格卡`,
      }))}
      ctaTitle="开始峡谷人格测试"
      ctaBody="用更漂亮、更克制的方式，看见你在队伍里的位置、节奏和隐藏情绪。"
      ctaHref="/wtfti/kings/test/"
    />
  );
}
