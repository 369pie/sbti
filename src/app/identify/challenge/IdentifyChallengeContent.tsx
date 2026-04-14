'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';
import { IDENTIFY_PERSONA_TYPES, getIdentifyTypeThumbnailImage, getIdentifyTypeImage } from '@/lib/identify/personas';
import type { IdentifyPersonaType } from '@/lib/identify/personas';

function ChallengeAvatar({ persona }: { persona: IdentifyPersonaType }) {
  const [failed, setFailed] = useState(false);
  const [useOriginal, setUseOriginal] = useState(false);

  const src = useOriginal
    ? getIdentifyTypeImage(persona.slug)
    : getIdentifyTypeThumbnailImage(persona.slug);

  if (failed) {
    return (
      <div className="w-full h-full flex items-center justify-center text-8xl">
        {persona.emoji}
      </div>
    );
  }

  return (
    <NextImage
      src={src}
      alt={persona.name}
      fill
      unoptimized
      priority
      sizes="200px"
      className="object-contain p-3"
      onError={() => {
        if (!useOriginal) { setUseOriginal(true); return; }
        setFailed(true);
      }}
    />
  );
}

export function IdentifyChallengeContent() {
  const searchParams = useSearchParams();
  const typeSlug = searchParams.get('t');
  const friendName = searchParams.get('n');

  const persona = useMemo(() => {
    if (!typeSlug) return null;
    return IDENTIFY_PERSONA_TYPES.find(p => p.slug === typeSlug) ?? null;
  }, [typeSlug]);

  // Store friend name hint for potential test flow
  useEffect(() => {
    if (friendName) {
      try {
        sessionStorage.setItem('sbti:challenge-from', friendName);
      } catch { /* ok */ }
    }
  }, [friendName]);

  if (!persona) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h1 className="text-xl font-semibold mb-2">链接可能已失效</h1>
        <p className="text-text-secondary text-sm mb-6">
          不过你可以自己来测测看！
        </p>
        <Link
          href="/test/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium text-sm"
        >
          开始测试 →
        </Link>
      </div>
    );
  }

  const displayFrom = friendName || '你的朋友';

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[600px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${persona.color}15, transparent 70%)` }}
        />

        <div className="max-w-xl mx-auto px-6 pt-20 pb-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Alert badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-sm text-pink-400 mb-8"
            >
              🔔 有人鉴定了你！
            </motion.div>

            {/* Persona image — blurred/mysterious */}
            <div
              className="relative w-44 h-44 mx-auto mb-8 rounded-2xl overflow-hidden"
              style={{ background: `${persona.color}15` }}
            >
              <ChallengeAvatar persona={persona} />
            </div>

            {/* Main message */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug mb-3">
              <span className="text-text-primary">{displayFrom}</span>
              <span className="text-text-secondary"> 觉得你是</span>
              <br />
              <span style={{ color: persona.color }}>{persona.emoji} {persona.name}</span>
            </h1>

            <p className="text-text-secondary text-base leading-relaxed max-w-sm mx-auto mb-3">
              &ldquo;{persona.tagline}&rdquo;
            </p>
          </motion.div>
        </div>
      </section>

      {/* Symptoms teaser */}
      <section className="max-w-md mx-auto px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-5"
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
            ta 觉得你有这些症状 👀
          </h2>
          <div className="space-y-2.5">
            {persona.symptoms.slice(0, 3).map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 border-pink-500/30 bg-pink-500/10 flex items-center justify-center">
                  <svg className="w-3 h-3 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-sm text-text-secondary leading-relaxed">{s}</span>
              </div>
            ))}
            {persona.symptoms.length > 3 && (
              <p className="text-xs text-text-muted pl-7">还有 {persona.symptoms.length - 3} 条鉴定…</p>
            )}
          </div>
        </motion.div>
      </section>

      {/* CTA section */}
      <section className="max-w-md mx-auto px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-3"
        >
          {/* Primary CTA — see the full report */}
          <Link
            href={`/identify/result/${persona.slug}/`}
            className="block w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium text-center text-base hover:from-pink-600 hover:to-rose-600 transition-all"
          >
            看完整鉴定书 →
          </Link>

          {/* Secondary CTA — test yourself */}
          <Link
            href="/test/"
            className="block w-full py-4 rounded-2xl border-2 border-dashed border-pink-500/20 bg-pink-500/5 text-center hover:bg-pink-500/10 transition-all"
          >
            <span className="text-base font-medium text-text-primary">不服？自己来测</span>
            <br />
            <span className="text-xs text-text-muted">27 种人格 × 15 维度 · 经典 WTF 测试</span>
          </Link>

          {/* Tertiary CTA — test in other universes */}
          <div className="pt-2 flex gap-3">
            <Link
              href="/wtfti/test/"
              className="flex-1 py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all text-center"
            >
              🤯 毒舌版测试
            </Link>
            <Link
              href="/identify/test/"
              className="flex-1 py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all text-center"
            >
              🔍 鉴定回 ta
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer note */}
      <section className="max-w-md mx-auto px-6 pb-20 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-xs text-text-muted"
        >
          WTFTI — 多宇宙人格测试平台 · 10 个宇宙 · 100+ 种人格
        </motion.p>
      </section>
    </div>
  );
}
