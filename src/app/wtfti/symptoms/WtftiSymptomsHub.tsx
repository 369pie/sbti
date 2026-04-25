'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { WTFTI_PERSONALITIES, getWtftiSlugs, getWtftiTypeThumbnailImage } from '@/lib/wtfti-personalities';
import { getSymptomsHeat, getTotalSymptomsParticipants } from '@/lib/symptoms-heat';

const totalParticipants = getTotalSymptomsParticipants(getWtftiSlugs());

export function WtftiSymptomsHub() {
  return (
    <div>
      <section className="wtfti-section-tight">
        <div className="wtfti-container max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="wtfti-eyebrow justify-center">WTF Symptom Atlas</span>
            <h1 className="wtfti-display mt-5 text-4xl md:text-6xl">
              症状清单，
              <em>直接对照你的隐藏反应。</em>
            </h1>
            <p className="wtfti-copy mx-auto mt-5 max-w-xl">
              不用做测试，直接对着症状打勾。
              29 种 WTF 人格，每种 5 条隐藏症状。
            </p>
            <div className="wtfti-panel mt-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs text-text-muted">
              <span className="wtfti-swatch" style={{ background: 'var(--color-rose)' }} />
              <span>已有 <span className="font-semibold text-text-primary">{totalParticipants}</span> 人打过勾</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="wtfti-container max-w-4xl pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {WTFTI_PERSONALITIES.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.5) }}
            >
              <Link
                href={`/wtfti/symptoms/${p.slug}/`}
                prefetch={false}
                className="wtfti-card group flex items-center gap-4 rounded-2xl p-4 sm:p-5"
              >
                <span className="grid h-14 w-14 flex-shrink-0 place-items-center overflow-hidden rounded-2xl bg-bg-secondary/70 p-2">
                  <NextImage
                    src={getWtftiTypeThumbnailImage(p.slug)}
                    alt={`${p.wtftiName} 症状清单入口`}
                    width={96}
                    height={96}
                    loading={i < 4 ? 'eager' : 'lazy'}
                    className="h-full w-full object-contain"
                  />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-text-muted">
                      WTF {p.number}
                    </span>
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{ background: `${p.color}15`, color: p.color }}
                    >
                      {p.code}
                    </span>
                  </div>
                  <h2 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                    {p.wtftiName}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-text-muted truncate">
                      {p.copy.symptoms[0]}
                    </p>
                    <span className="flex-shrink-0 text-[10px] text-text-muted/60">
                      {getSymptomsHeat(p.slug).participantsText}人
                    </span>
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-text-muted/40 group-hover:text-text-muted transition-colors flex-shrink-0"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-text-muted mb-4">
            想知道你到底是哪种 WTF 人格？
          </p>
          <Link href="/wtfti/test" prefetch={false} className="wtfti-cta-primary">
            去做完整测试
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
