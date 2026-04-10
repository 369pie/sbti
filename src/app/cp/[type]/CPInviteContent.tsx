'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import type { PersonalityType } from '@/lib/personalities';
import { getTypeImage } from '@/lib/personalities';

interface Props {
  personality: PersonalityType;
}

export function CPInviteContent({ personality }: Props) {
  return (
    <div className="min-h-screen">
      {/* Background glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse, ${personality.color}10, transparent 70%)`,
        }}
      />

      <div className="max-w-2xl mx-auto px-6 pt-20 pb-24 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border-subtle bg-bg-secondary/60 text-xs text-text-muted mb-8">
            <span className="text-accent">💕</span>
            CP 配对邀请
          </div>

          {/* Inviter's personality card */}
          <div className="rounded-2xl border border-border-subtle bg-bg-secondary/40 p-8 mb-8">
            <div
              className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden"
              style={{ background: `${personality.color}15` }}
            >
              <NextImage
                src={getTypeImage(personality.slug)}
                alt={personality.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                priority
              />
            </div>

            <div
              className="text-sm font-mono tracking-[0.3em] uppercase mb-2"
              style={{ color: personality.color }}
            >
              {personality.code}
            </div>

            <h2 className="text-2xl font-semibold mb-2">{personality.name}</h2>

            <p className="text-text-secondary text-sm max-w-sm mx-auto">
              {personality.tagline}
            </p>
          </div>

          {/* Invitation text */}
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            <span className="gradient-text">来测测</span>我们的 CP 值
          </h1>

          <p className="text-text-secondary text-base mb-10 max-w-md mx-auto leading-relaxed">
            TA 已经完成了 SBTI 人格测试，想看看和你的契合度有多高。
            <br />
            完成测试后，你们将同时看到配对结果！
          </p>

          {/* CTA */}
          <Link
            href={`/test?cp=${personality.slug}`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-accent text-bg-primary font-medium text-base hover:bg-accent-light transition-all"
          >
            开始测试，揭晓 CP 值
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          <p className="text-xs text-text-muted mt-4">
            约 3-5 分钟 · 31 道题 · 纯娱乐
          </p>
        </motion.div>

        {/* Decorative hearts */}
        <motion.div
          className="absolute top-32 left-8 text-3xl opacity-20"
          animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          💕
        </motion.div>
        <motion.div
          className="absolute top-48 right-12 text-2xl opacity-15"
          animate={{ y: [0, -8, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        >
          ✨
        </motion.div>
        <motion.div
          className="absolute bottom-40 left-16 text-2xl opacity-10"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
        >
          💫
        </motion.div>
      </div>
    </div>
  );
}
