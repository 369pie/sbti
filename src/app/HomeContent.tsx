'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { PERSONALITY_TYPES, getTypeImage } from '@/lib/personalities';
import { MODEL_NAMES, MODEL_COLORS } from '@/lib/dimensions';
import { withBasePath } from '@/lib/site';
import type { ModelType } from '@/lib/dimensions';

const MODELS: { key: ModelType; dims: string[] }[] = [
  { key: 'self', dims: ['S1 自尊自信', 'S2 自我清晰度', 'S3 核心价值'] },
  { key: 'emotion', dims: ['E1 依恋安全感', 'E2 情感投入度', 'E3 边界与依赖'] },
  { key: 'attitude', dims: ['A1 世界观倾向', 'A2 规则与灵活度', 'A3 人生意义感'] },
  { key: 'action', dims: ['Ac1 动机导向', 'Ac2 决策风格', 'Ac3 执行模式'] },
  { key: 'social', dims: ['So1 社交主动性', 'So2 人际边界感', 'So3 表达与真实度'] },
];

const FEATURED = PERSONALITY_TYPES.slice(0, 6);

const LEARN_MORE_LINKS = [
  {
    href: '/test',
    title: '开始在线测试',
    description: '直接进入 SBTI 人格测试题目页，答完即可获得人格结果。',
  },
  {
    href: '/types',
    title: '查看 27 种人格',
    description: '先看全部人格类型和结果标签，再决定要不要开始测试。',
  },
  {
    href: '/about',
    title: '了解测试说明',
    description: '查看 SBTI 的五组切面、十五维结构和结果解释方式。',
  },
];

const FAQS = [
  {
    question: 'SBTI 人格测试是什么？',
    answer:
      'SBTI 是一个轻松向的人格测试。它不只给你一个标签，还会结合自我、情感、态度、行动和社交五组切面，帮你看到自己在十五个维度上的落点。',
  },
  {
    question: 'SBTI 和 MBTI 有什么区别？',
    answer:
      'MBTI 更像经典人格框架，SBTI 更贴近日常表达和中文互联网语境。你在这里看到的是更接近生活反应、关系状态和行为习惯的一面。',
  },
  {
    question: '做完测试后能看到什么？',
    answer:
      '完成测试后，你会拿到一个专属人格结果页，里面有人格名称、十五维落点、结果解读，以及其他人格类型的入口，适合继续对照和分享。',
  },
  {
    question: '这个结果适合拿来做严肃诊断吗？',
    answer:
      '不适合。SBTI 更适合娱乐、自我观察和朋友之间对照，不应该替代专业心理评估或临床判断。',
  },
];

export default function HomeContent() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(249,115,22,0.08),transparent_70%)] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <span className="inline-block text-xs font-mono tracking-[0.25em] text-text-muted mb-6 uppercase">
              Silly Behavioral Type Indicator
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
              <span className="block">SBTI 人格测试</span>
              <span className="gradient-text">测测你到底是哪种抽象人格</span>
            </h1>

            <p className="text-text-secondary text-lg sm:text-xl leading-relaxed max-w-xl mx-auto mb-10">
              SBTI 人格测试在线测试，从自我、情感、态度、行动和社交 5 组切面切入。
              <br />
              15 个维度、27 种结果，不套术语，只看你平时怎么想、怎么爱、怎么活。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/test"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-bg-primary font-medium text-base hover:brightness-110 transition-all duration-200 shadow-[0_0_30px_rgba(249,115,22,0.2)]"
              >
                开始测试
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/types"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-border hover:bg-bg-secondary/50 transition-all duration-200 text-base"
              >
                浏览 27 种人格
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-16 grid grid-cols-3 gap-px bg-border-subtle rounded-2xl overflow-hidden"
          >
            {[
              { value: '15 维', label: '人格维度' },
              { value: '27 种', label: '结果类型' },
              { value: '~32 题', label: '含隐藏分支' },
            ].map(stat => (
              <div key={stat.label} className="bg-bg-secondary/60 px-4 py-6 text-center">
                <div className="text-2xl font-semibold text-text-primary font-mono tracking-tight">{stat.value}</div>
                <div className="text-xs text-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5 Models */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Models</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              5 组切面看人格状态
            </h2>
            <p className="text-text-secondary mt-3 leading-relaxed">
              不只给一个名字，还会把你的状态落到十五个维度上。
            </p>
          </motion.div>

          <div className="space-y-4">
            {MODELS.map((m, i) => {
              const c = MODEL_COLORS[m.key];
              return (
                <motion.div
                  key={m.key}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-xl border border-border-subtle bg-bg-secondary/40 p-5 hover:bg-bg-secondary/60 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: c.base }}
                    />
                    <h3 className="font-medium" style={{ color: c.base }}>
                      {MODEL_NAMES[m.key]}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {m.dims.map(d => (
                      <span
                        key={d}
                        className="text-xs px-2.5 py-1 rounded-lg"
                        style={{ background: c.bg, color: c.light }}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured types */}
      <section className="py-20 px-6 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Types</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              部分人格一览
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FEATURED.map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={`/result/${p.slug}`}
                  className="group block rounded-xl border border-border-subtle hover:border-border bg-bg-secondary/30 hover:bg-bg-secondary/60 transition-all p-4 sm:p-5"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden mb-3" style={{ background: `${p.color}15` }}>
                    <NextImage
                      src={getTypeImage(p.slug)}
                      alt={p.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-mono tracking-wider block mb-1" style={{ color: p.color }}>
                    {p.code}
                  </span>
                  <span className="text-base font-medium text-text-primary">{p.name}</span>
                  <p className="text-xs text-text-muted mt-1 line-clamp-1">{p.tagline}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/types"
              className="text-sm text-text-muted hover:text-accent transition-colors"
            >
              查看全部 27 种 →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-border-subtle">
        <div className="max-w-5xl mx-auto grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">About SBTI</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4">
              SBTI 人格测试是什么？
            </h2>
            <div className="space-y-4 text-text-secondary leading-8 text-[15px] sm:text-base">
              <p>
                SBTI 人格测试是一套更贴近中文互联网语境的人格测试。它不像传统测试那样只给出一串抽象字母，而是用更容易理解的人格标签，帮你快速定位自己在关系、行动、表达和生活状态上的典型反应。
              </p>
              <p>
                这套测试会先从自我模型、情感模型、态度模型、行动驱力模型和社交模型五组切面出发，再落到十五个维度上。也就是说，你拿到的不是一个孤立结果，而是一整张更细的性格画像，适合拿来做自我观察、朋友对照和内容分享。
              </p>
              <p>
                如果你搜索的是 “SBTI 人格测试” 或 “SBTI 在线测试”，通常关心的就是三件事：这是什么、测完会得到什么、结果像不像自己。首页现在把这三件事都展开了，你可以先了解，再决定要不要开始答题。
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {LEARN_MORE_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl border border-border-subtle bg-bg-secondary/40 p-5 hover:bg-bg-secondary/60 hover:border-border transition-all"
              >
                <h3 className="text-lg font-medium text-text-primary">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-6 mt-2">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Work Personality Test promo */}
      <section className="py-20 px-6 border-t border-border-subtle">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-8 sm:p-10 text-center"
          >
            <div className="text-4xl mb-4">💼</div>
            <span className="inline-block text-xs font-mono tracking-[0.2em] text-indigo-400 uppercase mb-3">
              WPTI · New
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
              打工人格测试
            </h2>
            <p className="text-text-secondary leading-relaxed max-w-md mx-auto mb-6">
              5 个职场维度 · 15 道灵魂拷问 · 16 种打工人格
              <br />
              三分钟测出你的职场真面目。
            </p>
            <Link
              href="/work"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-500 text-white font-medium text-base hover:brightness-110 transition-all duration-200 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
            >
              去测打工人格
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Daily Status Test promo */}
      <section className="py-20 px-6 border-t border-border-subtle">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-8 sm:p-10 text-center"
          >
            <div className="text-4xl mb-4">🔮</div>
            <span className="inline-block text-xs font-mono tracking-[0.2em] text-teal-400 uppercase mb-3">
              Daily Status · New
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
              今日状态测试
            </h2>
            <p className="text-text-secondary leading-relaxed max-w-md mx-auto mb-6">
              5 个维度 · 6 道快问 · 12 种今日状态
              <br />
              一分钟测出你今天的真实状态。每天题目不一样。
            </p>
            <Link
              href="/daily"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-teal-500 text-white font-medium text-base hover:brightness-110 transition-all duration-200 shadow-[0_0_30px_rgba(20,184,166,0.2)]"
            >
              测一测今天的状态
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">FAQ</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              关于 SBTI 人格测试的常见问题
            </h2>
            <p className="text-text-secondary mt-3 leading-relaxed max-w-2xl mx-auto">
              如果你是第一次接触 SBTI，可以先把这几件事看完，再开始测试。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQS.map((item) => (
              <article
                key={item.question}
                className="rounded-2xl border border-border-subtle bg-bg-secondary/40 p-6 hover:bg-bg-secondary/60 transition-colors"
              >
                <h3 className="text-lg font-medium text-text-primary leading-7">{item.question}</h3>
                <p className="text-sm sm:text-base text-text-secondary leading-7 mt-3">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="py-20 px-6 border-t border-border-subtle">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Community</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              加入 SBTI 社群
            </h2>
            <p className="text-text-secondary mt-3 leading-relaxed">
              测完想找同类？来群里一起交流、玩耍、对线吧 🎉
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* WeChat */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border-subtle bg-bg-secondary/40 p-6 text-center hover:bg-bg-secondary/60 transition-colors"
            >
              <div className="inline-flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-[#07C160]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045.247.247 0 00.242-.245c0-.06-.024-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.952-7.062-6.122zM14.033 13.3c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982z"/>
                </svg>
                <span className="font-medium text-text-primary">微信群</span>
              </div>
              <div className="rounded-xl overflow-hidden bg-white p-2 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={withBasePath('/images/qr-wechat.png')}
                  alt="SBTI 微信交流群二维码"
                  width={200}
                  height={200}
                  loading="eager"
                  decoding="sync"
                  fetchPriority="high"
                  className="block w-48 h-48 object-contain"
                />
              </div>
              <p className="text-xs text-text-muted mt-4">SBTI交流玩耍群</p>
            </motion.div>

            {/* QQ */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-border-subtle bg-bg-secondary/40 p-6 text-center hover:bg-bg-secondary/60 transition-colors"
            >
              <div className="inline-flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-[#12B7F5]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.395 15.035a39.548 39.548 0 00-1.24-2.675c-.066-.131-.132-.266-.2-.401-.15-.303-.298-.605-.445-.907l-.003-.006a1.735 1.735 0 00-.159-.291c-.03-.044-.06-.087-.092-.13a2.86 2.86 0 00-.204-.26c-.108-.122-.225-.24-.359-.348a3.33 3.33 0 00-.748-.487c-.058-.03-.118-.053-.178-.08l-.121-.053c-.071-.03-.143-.058-.215-.083-.013-.005-.026-.008-.038-.012-1.21-.42-2.006-.534-2.375-.55l-.033-.001c-.024-.001-.044-.001-.064-.002h-.04c-.016-.001-.033 0-.05 0-.058.001-.12.006-.178.013-.238.03-.588.126-.845.248-.1.047-.228.142-.318.213-.236.186-.456.407-.634.682l-.007.01c-.072.11-.13.225-.18.35-.048.115-.08.237-.11.358-.02.074-.04.148-.052.226-.016.102-.032.204-.041.306-.005.053-.009.107-.012.141a1.053 1.053 0 00-.008.127l.001.033v.019c.003.092.008.183.017.273.014.15.036.3.064.447.054.3.13.599.225.89.097.296.213.586.344.87.151.325.32.644.502.952.098.166.2.33.306.49.152.228.312.45.478.665.062.08.126.16.192.237.019.022.038.044.056.066.147.176.293.362.443.538.063.073.12.149.185.22.027.03.054.06.082.091.12.134.242.268.366.398l.032.034c.125.131.25.259.372.384l.013.012c.12.123.233.245.346.37l.028.032c.11.121.218.244.323.37.055.065.057.108-.003.165l-.055.056-.08.073c-.044.033-.088.074-.133.107-.073.056-.148.11-.196.135-.08.04-.165.075-.223.098l-.1.042c-.176.072-.358.162-.548.272-.123.07-.249.148-.382.239l-.041.026c-.17.101-.34.21-.506.328-.217.153-.418.32-.607.5-.186.176-.357.364-.51.563-.24.312-.433.655-.56 1.02-.041.117-.094.273-.108.378-.008.064-.008.13 0 .194.023.202.083.374.186.515.226.31.69.449 1.12.498.468.054 1.063.026 1.7-.06.72-.097 1.5-.265 2.276-.463.48-.123.955-.258 1.416-.393l.037-.011c.11-.032.22-.065.33-.097l.033-.009c.133-.04.265-.078.396-.115l.02-.006c.253-.074.5-.147.73-.22.087-.026.174-.053.26-.08l.032-.01c.167-.054.332-.107.485-.16l.073-.024c.146-.05.255-.09.389-.142.058-.023.117-.046.177-.07l.091-.037c.084-.034.168-.069.253-.104l.026-.01c.12-.052.241-.104.362-.158.077-.034.154-.07.23-.107l.02-.01c.126-.06.253-.122.377-.186l.016-.008a15.8 15.8 0 00.69-.375c.11-.064.22-.13.328-.198l.006-.004c.18-.112.35-.226.51-.345.109-.08.212-.163.309-.248l.098-.087c.164-.147.314-.3.436-.459.1-.132.19-.271.256-.416.064-.14.104-.288.132-.441.038-.208.042-.433.007-.674l-.005-.03a2.73 2.73 0 00-.08-.34c-.056-.182-.13-.361-.22-.532-.16-.302-.37-.587-.615-.86-.375-.42-.82-.81-1.326-1.172-.127-.091-.258-.18-.393-.268l-.094-.063z"/>
                </svg>
                <span className="font-medium text-text-primary">QQ 群</span>
              </div>
              <div className="rounded-xl overflow-hidden bg-[#2b2b2b] p-2 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={withBasePath('/images/qr-qq.png')}
                  alt="SBTI QQ群二维码"
                  width={200}
                  height={200}
                  loading="eager"
                  decoding="sync"
                  fetchPriority="high"
                  className="block w-48 h-48 object-contain"
                />
              </div>
              <p className="text-xs text-text-muted mt-4">SBTI交友玩耍群 · 群号 962576932</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4">
            准备好了吗？
          </h2>
          <p className="text-text-secondary mb-8">
            纯前端计算，不上传任何数据。测完直接看结果。
          </p>
          <Link
            href="/test"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-bg-primary font-medium hover:brightness-110 transition-all shadow-[0_0_30px_rgba(249,115,22,0.15)]"
          >
            开始测试 →
          </Link>
        </div>
      </section>
    </div>
  );
}
