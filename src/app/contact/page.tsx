import type { Metadata } from 'next';
import NextImage from 'next/image';
import { withBasePath } from '@/lib/site';

export const metadata: Metadata = {
  title: '联系与社群',
  description: '查看 SBTI 人格测试的社群入口、微信群与 QQ 群信息，获取反馈和交流渠道。',
  alternates: { canonical: '/contact/' },
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 sm:py-16">
      <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Contact</span>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">联系与社群</h1>
      <p className="text-text-secondary leading-8 text-base mb-10">
        如果你想反馈问题、一起讨论结果，或者单纯想找同类交流，可以直接加入 SBTI 社群。当前站点主要通过微信群和 QQ 群承接讨论。
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-border-subtle bg-bg-secondary/40 p-6 text-center">
          <h2 className="text-lg font-medium text-text-primary mb-4">微信群</h2>
          <div className="rounded-xl overflow-hidden bg-white p-2 inline-block">
            <NextImage
              src={withBasePath('/images/qr-wechat.png')}
              alt="SBTI 微信交流群二维码"
              width={220}
              height={220}
              unoptimized
            />
          </div>
          <p className="text-sm text-text-secondary mt-4 leading-7">
            适合日常聊天、结果讨论、发图分享和临时组局。
          </p>
        </section>

        <section className="rounded-2xl border border-border-subtle bg-bg-secondary/40 p-6 text-center">
          <h2 className="text-lg font-medium text-text-primary mb-4">QQ 群</h2>
          <div className="rounded-xl overflow-hidden bg-[#2b2b2b] p-2 inline-block">
            <NextImage
              src={withBasePath('/images/qr-qq.png')}
              alt="SBTI QQ 群二维码"
              width={220}
              height={220}
              unoptimized
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