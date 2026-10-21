import type { Metadata } from 'next';
import HomeContentV3 from './HomeContentV3';

const homepageFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'WTFTI 是什么？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'WTFTI 是懂你的女生私人顾问：测一测看清自己，美我帮你找到适合的颜色、妆容和风格，树洞给你一个敢说心里话的地方。',
      },
    },
    {
      '@type': 'Question',
      name: '测完之后能得到什么？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '你会有一份自己的档案，以及每天一张根据档案生成的今日卡：今日运势、幸运色穿搭和一句妆容建议。档案越完整，今日卡越准。',
      },
    },
    {
      '@type': 'Question',
      name: '需要注册吗？要花钱吗？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '测试免费、不用注册。想跨设备保存档案时再登录。深度报告和会员是付费的，价格会在点击前写明。',
      },
    },
    {
      '@type': 'Question',
      name: '结果能拿来做严肃诊断吗？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '不能。测试和玄学内容仅供娱乐与自我探索，不能替代专业的心理或医疗建议。',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: { absolute: 'WTFTI — 懂你的女生私人顾问' },
  description: '看清自己、变好看、有地方说心里话。90 秒人格测试，每天一张为你写的今日卡：运势、穿搭色、妆容建议，还有一个敢说话的树洞。',
  alternates: { canonical: '/' },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageFaqSchema) }}
      />
      <HomeContentV3 />
    </>
  );
}
