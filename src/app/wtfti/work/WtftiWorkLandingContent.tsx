import { WtftiUniverseLanding } from '@/components/wtfti/WtftiUniverseLanding';
import { BANTI_PERSONALITIES, getBantiTypeThumbnailImage } from '@/lib/banti/personalities';

const FEATURED = BANTI_PERSONALITIES.slice(0, 8);

export default function WtftiWorkLandingContent() {
  return (
    <WtftiUniverseLanding
      eyebrow="WTFTI · Office Universe"
      title="班TI 职场人格图鉴"
      accentTitle="把你放回办公室的真实光线里。"
      description="同一个你，在工位、会议、群聊和下班前五分钟会显露出完全不同的侧面。班TI 保留 WTFTI 的人格内核，但把结果翻译成更具体、更好笑、也更能被女性职场用户转发的办公室叙事。"
      testHref="/wtfti/work/test/"
      stats={[
        { value: '29', label: '职场人格' },
        { value: '4', label: '段式文案' },
        { value: '16+1', label: '独立题包' },
      ]}
      features={[
        { mark: 'I', title: '办公室题包', desc: '题面不再复用经典版，全部换成工位、会议、群聊、茶水间与酒局隐藏分支。' },
        { mark: 'II', title: '职场一击', desc: '一句话点破你的工位人设，精准但不刻薄，读完更像被懂了而不是被审判。' },
        { mark: 'III', title: '工位症状清单', desc: '把细碎情绪整理成可分享的症状列表，让测试结果更像一张漂亮的社交卡。' },
        { mark: 'IV', title: '收口金句', desc: '好笑之后仍然给用户一个体面的落点，这才是班TI 的温柔。' },
      ]}
      previewTitle="部分职场人格预览"
      previewSubtitle={`还有 ${BANTI_PERSONALITIES.length - FEATURED.length} 种职场人格等你解锁。`}
      previewItems={FEATURED.map((personality) => ({
        href: `/wtfti/work/result/${personality.slug}/`,
        name: personality.workName,
        code: personality.code,
        color: personality.color,
        imageSrc: getBantiTypeThumbnailImage(personality.slug),
        imageAlt: `${personality.workName} 职场人格卡`,
      }))}
      ctaTitle="测测你的班TI"
      ctaBody="同一套 15 维人格内核，直接翻译成你在办公室里的样子。"
      ctaHref="/wtfti/work/test/"
    />
  );
}
