'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface Props {
  /** Name of the user's personality result, for personalized text */
  personalityName: string;
}

/**
 * Lightweight viral CTA that appears on result pages.
 * Drives the A→B→A invitation loop via the identify feature.
 */
export function IdentifyViralCTA({ personalityName }: Props) {
  return (
    <section className="max-w-2xl mx-auto px-6 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4 }}
      >
        <div className="rounded-2xl border border-pink-500/15 bg-gradient-to-r from-pink-500/5 to-rose-500/5 p-5 sm:p-6 flex items-center gap-4">
          <div className="text-3xl flex-shrink-0">🔍</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-text-primary mb-0.5">
              你是{personalityName}，你朋友呢？
            </h3>
            <p className="text-xs text-text-muted">
              帮朋友做一次 WTF 人格鉴定，看看 ta 是什么类型
            </p>
          </div>
          <Link
            href="/identify/"
            className="flex-shrink-0 px-4 py-2 rounded-full bg-pink-500 text-white text-xs font-medium hover:bg-pink-600 transition-colors"
          >
            帮 ta 鉴定
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
