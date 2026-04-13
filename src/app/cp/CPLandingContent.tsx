'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { getPersonalityBySlug, getTypeThumbnailImage } from '@/lib/personalities';
import { calculateCP, getTierColor, getTierEmoji } from '@/lib/cp-matching';

const CP_EXAMPLES = [
  { a: 'ctrl', b: 'atm-er' },
  { a: 'boss', b: 'oh-no' },
  { a: 'drama', b: 'than-k' },
  { a: 'dior-s', b: 'ctrl' },
];

export default function CPLandingContent() {
  const examples = CP_EXAMPLES.map(({ a, b }) => {
    const typeA = getPersonalityBySlug(a)!;
    const typeB = getPersonalityBySlug(b)!;
    const result = calculateCP(typeA, typeB);
    return { typeA, typeB, result };
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 pt-20 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-5xl mb-6">💕</div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            <span className="text-accent">CP 配对</span>测试
          </h1>
          <p className="text-text-secondary text-base mb-4 max-w-md mx-auto leading-relaxed">
            先完成 SBTI 人格测试，获取结果后即可邀请好友来测 CP 契合度。
          </p>
          <p className="text-text-muted text-sm mb-10 max-w-md mx-auto">
            27 种人格 × 27 种人格 = 729 种可能的配对组合，每一对都有独特的化学反应。
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/test/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-accent text-bg-primary font-medium text-base hover:bg-accent-light transition-all"
            >
              先去测试
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left"
        >
          <div className="rounded-xl border border-border-subtle bg-bg-elevated shadow-sm p-5">
            <div className="text-2xl mb-3">①</div>
            <h3 className="text-sm font-medium mb-1">你先测</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              完成 31 道题的 SBTI 人格测试，得到你的人格类型。
            </p>
          </div>
          <div className="rounded-xl border border-border-subtle bg-bg-elevated shadow-sm p-5">
            <div className="text-2xl mb-3">②</div>
            <h3 className="text-sm font-medium mb-1">发链接</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              在结果页点击「邀请好友测 CP」，复制专属邀请链接发给 TA。
            </p>
          </div>
          <div className="rounded-xl border border-border-subtle bg-bg-elevated shadow-sm p-5">
            <div className="text-2xl mb-3">③</div>
            <h3 className="text-sm font-medium mb-1">看结果</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              TA 测完后，自动跳转到 CP 配对结果页，查看 15 维契合度分析。
            </p>
          </div>
        </motion.div>
      </div>

      {/* Example CP results */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Examples</span>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">看看 TA 们的化学反应</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {examples.map(({ typeA, typeB, result }, i) => {
              const tierColor = getTierColor(result.tier);
              const tierEmoji = getTierEmoji(result.tier);
              return (
                <motion.div
                  key={`${typeA.slug}-${typeB.slug}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                >
                  <Link
                    href={`/cp/result?a=${typeA.slug}&b=${typeB.slug}`}
                    className="block rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm hover:shadow-md hover:border-border transition-all p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      {/* Type A */}
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                          style={{ background: `${typeA.color}15` }}
                        >
                          <NextImage
                            src={getTypeThumbnailImage(typeA.slug)}
                            alt={typeA.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-mono" style={{ color: typeA.color }}>{typeA.code}</div>
                          <div className="text-sm font-medium">{typeA.name}</div>
                        </div>
                      </div>

                      {/* Score badge */}
                      <div
                        className="flex flex-col items-center px-3 py-1.5 rounded-lg"
                        style={{ background: `${tierColor}15` }}
                      >
                        <span className="text-lg font-bold tabular-nums" style={{ color: tierColor }}>
                          {result.overall}%
                        </span>
                      </div>

                      {/* Type B */}
                      <div className="flex items-center gap-2.5 flex-row-reverse">
                        <div
                          className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                          style={{ background: `${typeB.color}15` }}
                        >
                          <NextImage
                            src={getTypeThumbnailImage(typeB.slug)}
                            alt={typeB.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono" style={{ color: typeB.color }}>{typeB.code}</div>
                          <div className="text-sm font-medium">{typeB.name}</div>
                        </div>
                      </div>
                    </div>

                    {/* Tier */}
                    <div className="flex items-center justify-center gap-1.5 text-sm" style={{ color: tierColor }}>
                      <span>{tierEmoji}</span>
                      <span className="font-medium">{result.tier}</span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-6">
            <p className="text-xs text-text-muted">点击任意配对查看完整 15 维分析 →</p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
