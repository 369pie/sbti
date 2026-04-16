import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: '创作者中心内测｜创建你的主题人格宇宙',
  description:
    'WTFTI 创作者中心内测：支持免费主题测试与付费主题测试商城，查看收益分成规则、结算与提现流程、审核标准和报名方式。',
  alternates: { canonical: '/creator/' },
  openGraph: {
    title: 'WTFTI 创作者中心内测',
    description: '创建你的主题人格宇宙，支持免费引流与付费内容变现。',
    url: getSiteUrl('/creator/'),
  },
  twitter: {
    card: 'summary',
    title: 'WTFTI 创作者中心内测',
    description: '免费/付费主题测试双轨变现，查看收益到提现完整流程。',
  },
};

const trackCards = [
  {
    title: '免费主题测试（拉新增长）',
    badge: '免费发布',
    points: [
      '创作者可免费上架一个或多个主题宇宙',
      '通过测试结果页沉淀粉丝，承接私域与品牌曝光',
      '支持创作者署名、主页链接与宇宙合集展示',
    ],
  },
  {
    title: '付费主题测试商城（收益变现）',
    badge: '付费上架',
    points: [
      '创作者可设置单次购买价（内测建议 ¥9.9 - ¥39.9）',
      '可配置限时折扣、组合包与专属邀请码',
      '支持付费内容卡、深度解释和进阶玩法包',
    ],
  },
];

const coreFeatures = [
  '创作者主页：展示宇宙、转化数据、热度人格榜',
  '宇宙管理：配置主题文案、结果语气、视觉色板、封面图',
  '定价与活动：免费/付费切换、折扣活动、转化监控',
  '订单中心：订单明细、退款状态、税务开票信息',
  '数据面板：访问 UV、完成率、分享率、付费率、复购率',
  '风控与审核：敏感词检测、抽检复核、违规处置',
];

const reviewRules = [
  '内容合规：不得包含违法、歧视、暴力、医疗误导、金融承诺等违规内容。',
  '版权合规：封面图、文案、IP 名称需具备可用授权或原创证明。',
  '质量标准：结果页至少包含人格命中语、解释段、症状/行为观察、收尾建议。',
  '价格约束：付费测试定价需在平台区间内，避免异常高价误导。',
  '用户权益：支持退款规则透明展示，并保留申诉通道。',
];

const payoutSteps = [
  {
    title: 'Step 1 · 订单确认',
    desc: '用户在付费测试商城下单后，系统实时记录订单与创作者分账金额。',
  },
  {
    title: 'Step 2 · 冷静期冻结',
    desc: '订单进入 7 天冻结期（用于退款与争议处理），冻结期间不支持提现。',
  },
  {
    title: 'Step 3 · 可结算余额入账',
    desc: '冻结结束后，订单金额按分成规则转为“可结算余额”。',
  },
  {
    title: 'Step 4 · 月度结算单生成',
    desc: '每月 1 日生成上月结算单，含订单、退款、服务费与税务信息。',
  },
  {
    title: 'Step 5 · 提现申请',
    desc: '创作者可在后台发起提现（内测建议门槛 ¥100），选择对公或个人账户。',
  },
  {
    title: 'Step 6 · 打款到账',
    desc: '财务审核通过后 1-3 个工作日到账，异常单会进入人工复核。',
  },
];

export default function CreatorPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden border-b border-border-subtle">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_20%,rgba(255,77,109,0.14),transparent_42%),radial-gradient(circle_at_85%_10%,rgba(245,158,11,0.16),transparent_40%)]" />
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-14 relative">
          <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-4">Creator Program</span>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-text-primary mb-5 leading-tight">
            WTFTI 创作者中心内测
          </h1>
          <p className="text-base sm:text-lg text-text-secondary leading-8 max-w-3xl">
            面向有内容生产能力的创作者开放。你可以创建自己的主题人格宇宙，先用免费测试拉新，再用付费主题测试商城变现。
            平台提供测评引擎、结果页模板、支付与结算能力，你专注创意与内容表达。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/creator/apply/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
            >
              申请内测席位
            </Link>
            <Link
              href="/ugc/zhenhuan/test/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border transition-colors"
            >
              查看示范宇宙
            </Link>
          </div>
          <p className="mt-4 text-xs text-text-muted">内测政策会根据合规与支付通道进展调整，最终以签约协议与平台规则页为准。</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-14">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">发布模式：免费 + 付费双轨</h2>
          <p className="mt-3 text-text-secondary leading-8">同一创作者可同时运营免费宇宙与付费宇宙，满足拉新、涨粉、转化三类目标。</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trackCards.map(card => (
            <article key={card.title} className="rounded-2xl border border-border-subtle bg-bg-elevated p-6 shadow-sm">
              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-bg-secondary text-text-muted mb-4">{card.badge}</span>
              <h3 className="text-lg font-semibold text-text-primary mb-4">{card.title}</h3>
              <ul className="space-y-2.5 text-sm text-text-secondary leading-7">
                {card.points.map(point => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border-subtle bg-bg-secondary/30">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary mb-4">收益模型（内测草案）</h2>
          <p className="text-text-secondary leading-8 mb-8">
            平台采用“订单实收金额分成”模型，基础思路是：<span className="font-medium text-text-primary">创作者收益 = 订单实收 - 渠道成本 - 平台服务费 - 退款冲销</span>。
            内测阶段建议分成比例区间为创作者 60% - 75%，平台 25% - 40%，具体按创作者等级与流量质量分层。
          </p>
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-text-primary mb-3">示例（仅示意）</h3>
            <p className="text-sm text-text-secondary leading-7">
              某创作者当月付费测试总实收 ¥20,000，退款 ¥1,000，渠道与支付成本 ¥1,200，净可分账基数 ¥17,800。
              若分成比例为 70%，创作者当月税前可结算收益约 ¥12,460。
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-14">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">从收益到提现：完整流程</h2>
          <p className="mt-3 text-text-secondary leading-8">把订单、风控、结算、提现做成标准链路，减少创作者的财务不确定性。</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {payoutSteps.map(step => (
            <article key={step.title} className="rounded-2xl border border-border-subtle bg-bg-elevated p-5 shadow-sm">
              <h3 className="font-semibold text-text-primary mb-2">{step.title}</h3>
              <p className="text-sm text-text-secondary leading-7">{step.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border-subtle bg-bg-secondary/30">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary mb-8">你会拥有的核心功能</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {coreFeatures.map(item => (
              <div key={item} className="rounded-xl border border-border-subtle bg-bg-elevated px-4 py-3 text-sm text-text-secondary">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary mb-6">审核与风控规则（内测）</h2>
        <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-6 sm:p-8">
          <ul className="space-y-3 text-sm sm:text-base text-text-secondary leading-8">
            {reviewRules.map(rule => (
              <li key={rule} className="flex gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="rounded-3xl border border-border-subtle bg-gradient-to-r from-pink-50 via-white to-amber-50 p-8 sm:p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">内测招募进行中</h2>
          <p className="mt-3 text-text-secondary leading-8 max-w-2xl mx-auto">
            如果你有固定内容方向（情感、职场、二次元、游戏、宠物、校园等），并愿意持续运营主题宇宙，欢迎申请。
            首批内测将提供 1v1 上线协助与流量位支持。
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/creator/apply/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
            >
              立即申请内测
            </Link>
            <Link
              href="/creator/applications/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border transition-colors"
            >
              管理后台入口
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}