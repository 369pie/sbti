import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: '使用条款',
  description: '查看 WTFTI 的使用范围、结果性质、分享规范和免责声明。',
  alternates: { canonical: '/terms/' },
  openGraph: {
    title: '使用条款 — WTFTI',
    description: 'WTFTI 的使用范围与免责声明。',
    url: getSiteUrl('/terms/'),
  },
  twitter: {
    card: 'summary',
    title: '使用条款 — WTFTI',
    description: 'WTFTI 的使用范围与免责声明。',
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
      <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Terms</span>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">使用条款</h1>

      <div className="p-6 sm:p-8 rounded-xl mb-10" style={{ background: 'var(--color-paper-warm)', border: '1px solid var(--color-rule)' }}>
        <p className="text-text-primary font-medium leading-relaxed">
          重要提示：本平台所有测试内容仅供娱乐与自我观察使用，不构成专业心理诊断、医疗建议或法律意见。使用本平台即表示你已阅读并同意以下条款。
        </p>
      </div>

      <div className="space-y-8 text-text-secondary leading-8 text-[15px] sm:text-base">
        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">一、内容定位与性质</h2>
          <p>
            WTFTI 旨在提供轻松的人格测试与图鉴体验，包含经典 SBTI、主题宇宙和相关衍生玩法。站内所有测试内容（包括但不限于人格测试、关系测试、塔罗占卜、灵鉴解读等）均仅供<strong className="text-text-primary">娱乐与自我观察</strong>使用。
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>不构成任何形式的专业心理诊断、医疗建议、法律意见</li>
            <li>不可作为人生重大决策的唯一依据</li>
            <li>不可用于招聘筛选、信用评估、司法鉴定等严肃场景</li>
            <li>不可作为判断他人心理状态、人格优劣的标准</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">二、结果的使用方式</h2>
          <p>
            你可以自由查看、分享自己的测试结果，但不应把结果当作对他人的绝对定义，也不应将其用于歧视、骚扰、招聘筛选或其他高风险决策场景。测试结果仅供参考，不具有科学诊断效力。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">三、隐私保护承诺</h2>
          <p>
            本平台承诺：
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong className="text-text-primary">不收集</strong>任何个人身份信息（姓名、手机号、身份证号、邮箱、人脸数据等）</li>
            <li><strong className="text-text-primary">不存储</strong>用户测试答案至服务器，核心测试流程以浏览器端本地计算为主</li>
            <li><strong className="text-text-primary">不出售</strong>任何用户数据给第三方</li>
            <li><strong className="text-text-primary">不使用</strong>第三方追踪 Cookie、广告像素或行为追踪脚本</li>
            <li><strong className="text-text-primary">不要求</strong>注册账号即可使用核心测试功能</li>
          </ul>
          <p className="mt-3 text-sm">
            详见 <Link href="/privacy/" prefetch={false} className="underline underline-offset-2 hover:text-text-primary transition-colors">隐私说明</Link>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">四、知识产权</h2>
          <p>
            站内测试题目、人格描述、视觉设计、图标和相关内容的知识产权归 WTFTI 及其合作方所有。未经授权，不得将站内内容用于商业用途、二次开发或冒充原创。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">五、站点可用性</h2>
          <p>
            我们会尽量保证页面、图片和结果页正常可用，但不承诺站点永不出错、永不中断。若发生临时故障、资源丢失或部署异常，站点可能出现短时间不可访问的情况。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">六、未成年人保护</h2>
          <p>
            本平台不面向 14 周岁以下未成年人提供服务。如果你是未成年人，请在监护人指导下使用本平台。如果你是未成年人的监护人，发现我们无意中收集了未成年人信息，请联系我们，我们将在核实后尽快删除相关数据。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">七、免责声明</h2>
          <p>
            本平台按"现状"提供服务，不对以下情况承担责任：
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>用户因依赖测试结果做出的人生决策</li>
            <li>用户因分享测试结果引发的社交纠纷</li>
            <li>因第三方服务（如部署平台、图像生成服务）导致的中断或数据问题</li>
            <li>用户上传至灵镜实验室的照片被第三方图像服务处理的结果</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">八、条款更新</h2>
          <p>
            如果功能范围、数据处理方式或使用场景发生变化，本页内容也会随之调整。继续使用站点，意味着你理解并接受更新后的说明。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">九、联系我们</h2>
          <p>
            如果你对本使用条款有任何疑问，请通过 <Link href="/contact/" prefetch={false} className="underline underline-offset-2 hover:text-text-primary transition-colors">联系页面</Link> 与我们取得联系。
          </p>
        </section>
      </div>
    </div>
  );
}
