import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'SBTI 和 MBTI 有什么区别？',
  description: '从语言风格、结果结构、使用场景和分享方式比较 SBTI 与 MBTI。',
  alternates: { canonical: '/guide/sbti-vs-mbti/' },
};

export default function SbtiVsMbtiGuidePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
      <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">对比指南</span>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">SBTI 和 MBTI 有什么区别？</h1>
      <div className="space-y-8 text-text-secondary leading-8 text-[15px] sm:text-base">
        <p>
          如果说 MBTI 更像一套经典人格分类框架，那么 SBTI 更像是把人格测试重新翻译成中文互联网更熟悉的语言。它们都在试图帮助人理解自己，但表达方式、结果命名和社交传播路径完全不同。
        </p>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">语言风格不同</h2>
          <p>
            MBTI 使用的是标准化字母类型，适合做抽象框架和长期讨论；SBTI 则更接近日常行为标签，结果名更像你在朋友圈或聊天记录里会看到的描述。也正因为如此，SBTI 往往更容易让第一次做人格测试的人快速代入。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">结果结构不同</h2>
          <p>
            MBTI 更强调类型划分本身，SBTI 更强调“结果 + 维度画像”的组合。你看到的不只是一个人格名，还会看到五组切面和十五个维度的落点。这让 SBTI 更适合做内容分享和结果对照，也更适合拿来解释“为什么我会是这个人格”。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-text-primary mb-3">使用场景不同</h2>
          <p>
            MBTI 更适合长期的自我讨论、性格标签化和框架学习；SBTI 更适合快速上手、朋友互测、结果分享和轻量自我观察。前者更像一个成熟体系，后者更像一个更具传播性的中文互联网测试产品。
          </p>
        </section>
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/guide/what-is-sbti/" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-bg-primary font-medium hover:brightness-110 transition-all">
          回到 SBTI 说明
        </Link>
        <Link href="/test/" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all">
          直接开始测试
        </Link>
      </div>
    </div>
  );
}