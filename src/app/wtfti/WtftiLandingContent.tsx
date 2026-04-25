'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { WTFTI_PERSONALITIES, getWtftiTypeThumbnailImage } from '@/lib/wtfti-personalities';
import { UNIVERSES as UNIVERSES_DATA } from '@/lib/universes';

const FEATURED = WTFTI_PERSONALITIES.slice(0, 8);
const HERO_PREVIEW = WTFTI_PERSONALITIES.slice(0, 4);

const HERO_POSITIONS = [
  'left-0 top-[16%] rotate-[-7deg]',
  'right-0 top-[5%] rotate-[5deg]',
  'left-[8%] bottom-[7%] rotate-[4deg]',
  'right-[9%] bottom-[15%] rotate-[-5deg]',
];

const PANTHEON_PILLARS: Array<{
  roman: string;
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  accent: string;
  note?: string;
}> = [
  {
    roman: 'I',
    eyebrow: 'Summon',
    title: '主神召唤',
    body: '90 秒进入仪式，从 8 位主神中召唤属于你这一段人生的那一位。',
    href: '/wtfti/galaxy/test/',
    accent: '#F59BB8',
  },
  {
    roman: 'II',
    eyebrow: 'Soul Probe',
    title: '灵魂印记',
    body: '6 道五感探针：唱片、台词、色卡、电影、香水、触感，把人格变成可收藏的感官线索。',
    href: '/wtfti/profile/',
    accent: '#C7D7A2',
  },
  {
    roman: 'III',
    eyebrow: 'Shrine',
    title: '私人神龛',
    body: '召唤之后，你会拥有一座专属神龛，镜面、供奉、信物、仪式记录都存在这里。',
    href: '/wtfti/galaxy/test/',
    accent: '#C9A676',
    note: '完成召唤后自动生成专属入口',
  },
  {
    roman: 'IV',
    eyebrow: 'Lunar',
    title: '月相日课',
    body: '跟月亮走 12 期，每一期一句话，最终加冕大祭司，附 30 天 Future Letter。',
    href: '/wtfti/moon/',
    accent: '#C9A676',
  },
  {
    roman: 'V',
    eyebrow: 'Duet',
    title: '召唤合奏',
    body: '你和 ta 各召唤一位主神，得到引力 G、共鸣 S 与一枚专属 Pair Sigil。',
    href: '/wtfti/duet/',
    accent: '#C9867D',
  },
  {
    roman: 'VI',
    eyebrow: 'Daily',
    title: '今日天象签',
    body: '每天一签，以主神视角写一段微叙事，留住归属感与每日回来的理由。',
    href: '/wtfti/daily/',
    accent: '#C7D7A2',
  },
];

function ArrowIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

export default function WtftiLandingContent() {
  return (
    <div>
      <section className="wtfti-section pt-16 md:pt-24">
        <div className="wtfti-wide-container grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative z-[1] max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="wtfti-eyebrow">Personal Pantheon</span>
              <h1 className="wtfti-display mt-6 text-[clamp(3rem,7vw,6.8rem)]">
                WTFTI
                <span className="block text-[0.58em] leading-[1.1]">
                  人格神域，
                  <em>把你召回自己。</em>
                </span>
              </h1>
              <p className="wtfti-copy mt-7 max-w-[42rem]">
                不是一次性测试，而是一座可以被装饰、被分享、随月相成长的女性精神生活神域。
                8 位主神、6 道五感探针、12 章月相日课，把人格结果从标签变成一套长期可回访的仪式。
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/wtfti/galaxy/test/" className="wtfti-cta-primary">
                  召唤你的主神
                  <span className="wtfti-arrow"><ArrowIcon className="h-3.5 w-3.5" /></span>
                </Link>
                <Link href="/wtfti/profile/" prefetch={false} className="wtfti-cta-secondary">
                  打开五感档案
                </Link>
              </div>

              <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
                {[
                  { value: '8', label: '主神人格' },
                  { value: '6', label: '五感探针' },
                  { value: '12', label: '月相章节' },
                ].map((stat) => (
                  <div key={stat.label} className="wtfti-panel rounded-[1.25rem] px-4 py-5">
                    <div className="stat-value text-3xl text-text-primary">{stat.value}</div>
                    <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.24em] text-text-muted">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            className="relative mx-auto aspect-[4/5] w-full max-w-[470px]"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            aria-label="WTFTI 人格神域卡片预览"
          >
            <div className="wtfti-orbit-field absolute inset-[7%] rounded-[46%]" />
            <div className="wtfti-orbit-ring" aria-hidden="true" />
            <div className="wtfti-orbit-ring" aria-hidden="true" />
            <div className="absolute left-1/2 top-1/2 grid h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-border-subtle bg-bg-elevated/70 text-center backdrop-blur-md">
              <div>
                <div className="wtfti-roman text-6xl">VIII</div>
                <div className="mt-2 text-[10px] font-mono uppercase tracking-[0.28em] text-text-muted">Soul Atlas</div>
              </div>
            </div>
            {HERO_PREVIEW.map((personality, index) => (
              <Link
                key={personality.slug}
                href={`/wtfti/result/${personality.slug}/`}
                prefetch={false}
                className={`wtfti-mini-card group absolute w-[38%] overflow-hidden rounded-[1.25rem] p-2 transition-transform duration-300 hover:scale-[1.03] ${HERO_POSITIONS[index]}`}
              >
                <div className="aspect-square rounded-[0.9rem] bg-bg-secondary/70 p-3">
                  <NextImage
                    src={getWtftiTypeThumbnailImage(personality.slug)}
                    alt={`${personality.wtftiName} 人格卡预览`}
                    width={220}
                    height={220}
                    priority={index === 0}
                    className="h-full w-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="mt-2 min-w-0 px-1 pb-1">
                  <div className="truncate text-[10px] font-mono text-text-muted">{personality.code}</div>
                  <div className="truncate text-sm font-medium text-text-primary">{personality.wtftiName}</div>
                </div>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="wtfti-section-tight">
        <div className="wtfti-container">
          <div className="mb-10 max-w-3xl">
            <span className="wtfti-eyebrow">Ritual System</span>
            <h2 className="wtfti-display mt-5 text-4xl md:text-6xl">
              六重新仪式，
              <em>从测完到长期归属。</em>
            </h2>
            <p className="wtfti-copy mt-5">
              每个入口都是同一座神域里的不同房间：测试负责召唤，档案负责保存，月相与合奏负责让结果继续生长。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            {PANTHEON_PILLARS.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.48, delay: index * 0.04 }}
                className={index === 0 || index === 3 ? 'md:col-span-3' : 'md:col-span-2'}
              >
                <Link href={pillar.href} prefetch={false} className="wtfti-card group flex h-full min-h-[230px] flex-col rounded-[1.5rem] p-6">
                  <div className="flex items-start justify-between gap-4">
                    <span className="wtfti-roman text-5xl" style={{ color: pillar.accent }}>{pillar.roman}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">{pillar.eyebrow}</span>
                  </div>
                  <h3 className="mt-7 text-2xl font-semibold text-text-primary">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-text-secondary">{pillar.body}</p>
                  {pillar.note ? <p className="mt-3 text-xs italic text-text-muted">{pillar.note}</p> : null}
                  <div className="mt-auto pt-6 text-sm font-medium" style={{ color: pillar.accent }}>
                    进入仪式 <ArrowIcon className="ml-1 inline h-3.5 w-3.5 align-[-2px]" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="wtfti-section-tight">
        <div className="wtfti-container grid gap-4 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="wtfti-panel rounded-[1.75rem] p-7 md:p-9">
            <span className="wtfti-eyebrow">Classic Archive</span>
            <h2 className="wtfti-display mt-5 text-3xl md:text-5xl">
              旧版毒舌还在，
              <em>但不再是唯一入口。</em>
            </h2>
            <p className="wtfti-copy mt-5">
              29 张 WTF 人格图鉴、4 段式毒舌、隐藏分支仍然在线。想快速回到经典文本版，也可以直接开始。
            </p>
            <Link href="/wtfti/test/" prefetch={false} className="wtfti-cta-secondary mt-7">
              经典 WTFTI 文本版
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                label: 'Office Universe',
                title: '班TI 职场人格',
                body: '把同一套人格内核放进会议、群聊、茶水间和下班前五分钟。',
                href: '/wtfti/work/',
                color: '#C7D7A2',
              },
              {
                label: 'Mystic Mirror',
                title: '灵鉴塔罗人格',
                body: '同一套 WTFTI 人格内核，换成更神秘、柔软、可订阅的塔罗视角。',
                href: '/mysti/',
                color: '#C9867D',
              },
            ].map((item) => (
              <Link key={item.href} href={item.href} prefetch={false} className="wtfti-card flex min-h-[240px] flex-col rounded-[1.5rem] p-6">
                <span className="wtfti-swatch" style={{ background: item.color }} />
                <span className="mt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">{item.label}</span>
                <h3 className="mt-3 text-2xl font-semibold text-text-primary">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{item.body}</p>
                <span className="mt-auto pt-6 text-sm font-medium text-text-primary">
                  进入 <ArrowIcon className="ml-1 inline h-3.5 w-3.5 align-[-2px]" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="wtfti-section-tight">
        <div className="wtfti-container">
          <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <span className="wtfti-eyebrow">Universe Index</span>
              <h2 className="wtfti-display mt-5 text-3xl md:text-5xl">选择你的下一座宇宙</h2>
            </div>
            <p className="wtfti-copy max-w-xl text-sm">
              同一个灵魂，不同宇宙会长出不同翻译。这里保留多宇宙玩法，但统一收进更精致的视觉秩序里。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {UNIVERSES_DATA.filter(u => u.status === 'live' && u.id !== 'standard' && u.id !== 'xiuxian').map((universe, index) => (
              <motion.div
                key={universe.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.42, delay: index * 0.03 }}
              >
                <Link href={universe.testPath} className="wtfti-card group flex h-full min-h-[150px] items-start gap-4 rounded-[1.25rem] p-5">
                  <span className="wtfti-swatch mt-1" style={{ background: universe.accent }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-lg font-semibold text-text-primary">{universe.name}</span>
                    <span className="mt-1 block truncate text-sm text-text-muted">{universe.shortName}</span>
                    <span className="mt-5 inline-flex items-center text-sm font-medium" style={{ color: universe.accent }}>
                      开始测试 <ArrowIcon className="ml-1 h-3.5 w-3.5" />
                    </span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="wtfti-section pb-20">
        <div className="wtfti-container">
          <div className="mb-9 max-w-3xl">
            <span className="wtfti-eyebrow">Collection Preview</span>
            <h2 className="wtfti-display mt-5 text-3xl md:text-5xl">
              人格图鉴，
              <em>像一套可以收藏的香气卡。</em>
            </h2>
            <p className="wtfti-copy mt-5">先看 8 张卡面，召唤后再进入你的完整神域档案。</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {FEATURED.map((personality, index) => (
              <motion.div
                key={personality.slug}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.42, delay: index * 0.035 }}
              >
                <Link href={`/wtfti/result/${personality.slug}/`} prefetch={false} className="wtfti-card group block overflow-hidden rounded-[1.25rem] p-3">
                  <div className="aspect-square overflow-hidden rounded-[1rem] bg-bg-secondary/65 p-4">
                    <NextImage
                      src={getWtftiTypeThumbnailImage(personality.slug)}
                      alt={`${personality.wtftiName} 人格卡`}
                      width={260}
                      height={260}
                      loading={index < 4 ? 'eager' : 'lazy'}
                      fetchPriority={index < 4 ? 'high' : 'auto'}
                      className="h-full w-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0 px-1 py-4 text-center">
                    <div className="font-mono text-[10px] text-text-muted">{personality.number}</div>
                    <div className="mt-1 truncate text-sm font-semibold text-text-primary">{personality.wtftiName}</div>
                    <div className="mt-1 truncate text-xs text-text-muted">{personality.code}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/wtfti/galaxy/test/" className="wtfti-cta-primary">
              召唤我的人格神域
              <span className="wtfti-arrow"><ArrowIcon className="h-3.5 w-3.5" /></span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
