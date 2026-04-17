'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { WTFTI_PERSONALITIES, getWtftiSlugs } from '@/lib/wtfti-personalities';
import { getSymptomsHeat, getTotalSymptomsParticipants } from '@/lib/symptoms-heat';

const totalParticipants = getTotalSymptomsParticipants(getWtftiSlugs());

export function WtftiSymptomsHub() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-transparent to-transparent" />
        <div className="relative max-w-2xl mx-auto px-6 pt-20 pb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 rounded-full text-xs font-mono tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 mb-6">
              📋 WTF 症状清单
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              你中了几枪？
            </h1>
            <p className="text-text-secondary text-base sm:text-lg max-w-md mx-auto leading-relaxed">
              不用做测试，直接对着症状打勾。
              <br />
              29 种 WTF 人格，每种 5 条隐藏症状。
            </p>
            <div className="mt-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-elevated border border-border-subtle text-xs text-text-muted">
              <span className="text-red-500">🔥</span>
              <span>已有 <span className="font-semibold text-text-primary">{totalParticipants}</span> 人打过勾</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
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
                className="group flex items-center gap-4 rounded-2xl border border-border-subtle bg-bg-elevated hover:border-border hover:shadow-md transition-all p-4 sm:p-5"
              >
                <span className="text-2xl flex-shrink-0">{p.emoji}</span>
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
          <Link
            href="/wtfti/test"
            prefetch={false}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-deep to-ember text-bg-elevated text-sm font-medium hover:brightness-110 transition-all"
          >
            去做完整测试 →
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
