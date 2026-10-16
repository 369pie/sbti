import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import NextImage from 'next/image';
import { withBasePath } from '@/lib/site';

export const metadata: Metadata = {
  title: '联系与社群',
  description: '查看 WTFTI 的社群入口、微信群、QQ 群与个人微信联系方式，获取反馈和交流渠道。',
  keywords: ['WTFTI社群', 'WTFTI微信群', 'WTFTI QQ群', 'WTFTI个人微信', '人格测试社群'],
  alternates: { canonical: '/contact/' },
  openGraph: {
    title: '联系与社群 — WTFTI',
    description: '加入 WTFTI 社群，和同类一起讨论人格测试结果。',
    url: getSiteUrl('/contact/'),
  },
  twitter: {
    card: 'summary',
    title: '联系与社群 — WTFTI',
    description: '加入 WTFTI 社群，和同类一起讨论人格测试结果。',
  },
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 sm:py-16">
      <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Contact</span>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">联系与社群</h1>
      <p className="text-text-secondary leading-8 text-base mb-10">
        如果你想反馈问题、一起讨论结果，或者单纯想找同类交流，可以直接加入 WTFTI 社群。也可以扫码添加我的个人微信，沟通合作、反馈或入群都可以从这里开始。
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <section className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 text-center">
          <h2 className="text-lg font-medium text-text-primary mb-4">微信群</h2>
          <div data-keep-white className="rounded-xl overflow-hidden bg-white p-2 inline-block">
            <NextImage
              src={withBasePath('/images/qr-wechat.png')}
              alt="WTFTI 微信交流群二维码"
              width={220}
              height={220}
              sizes="220px"
            />
          </div>
          <p className="text-sm text-text-secondary mt-4 leading-7">
            适合日常聊天、结果讨论、发图分享和临时组局。
          </p>
        </section>

        <section className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 text-center sm:col-span-2 lg:col-span-1">
          <h2 className="text-lg font-medium text-text-primary mb-4">个人微信</h2>
          <div data-keep-white className="rounded-xl overflow-hidden bg-white p-2 inline-block">
            <NextImage
              src={withBasePath('/images/wechat.jpg')}
              alt="个人微信二维码"
              width={220}
              height={293}
              sizes="220px"
              className="h-auto max-w-full"
            />
          </div>
          <p className="text-sm text-text-secondary mt-4 leading-7">
            添加好友请备注 WTFTI，适合合作沟通、问题反馈和社群入口咨询。
          </p>
        </section>

        <section className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 text-center">
          <h2 className="text-lg font-medium text-text-primary mb-4">QQ 群</h2>
          <div className="rounded-xl overflow-hidden bg-bg-secondary p-2 inline-block">
            <NextImage
              src={withBasePath('/images/qr-qq.png')}
              alt="WTFTI QQ 群二维码"
              width={220}
              height={220}
              sizes="220px"
            />
          </div>
          <p className="text-sm text-text-secondary mt-4 leading-7">
            群号 962576932，适合长期讨论、存档和老用户回流交流。
          </p>
        </section>
      </div>

      <div className="mt-10 rounded-2xl border border-border-subtle bg-bg-secondary/30 p-6 text-text-secondary leading-8 text-[15px] sm:text-base">
        <h2 className="text-xl font-medium text-text-primary mb-3">反馈说明</h2>
        <p>
          如果你发现页面错误、结果异常、图片丢失或链接问题，可以直接在社群里反馈。描述时尽量带上访问页面、设备类型和复现步骤，这样更容易定位问题。
        </p>
      </div>
    </div>
  );
}
