'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { DRUNK_DIMENSIONS, DRUNK_MODEL_NAMES, DRUNK_MODEL_COLORS } from '@/lib/drunk/dimensions';
import { DRUNK_PERSONA_TYPES } from '@/lib/drunk/personas';
import type { DrunkPersonaType } from '@/lib/drunk/personas';
import type { DrunkDimensionScore } from '@/lib/drunk/scoring';
import { DrunkShareImageGenerator } from '@/components/DrunkShareImageGenerator';
import type { DrunkShareImageGeneratorHandle } from '@/components/DrunkShareImageGenerator';
import { DrunkPersonaAvatar } from '@/components/DrunkPersonaAvatar';
import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { getSiteUrl } from '@/lib/site';
import { CrossTestRecommendations } from '@/components/CrossTestRecommendations';
import { loadStoredQuizResult } from '@/lib/quiz-result-session';
import { ResultDiagnosticsPanel } from '@/components/ResultDiagnosticsPanel';
import { UniversePreviewCards } from '@/components/UniversePreviewCards';

const emptySubscribe = () => () => {};

interface Props {
  persona: DrunkPersonaType;
  dimensionScores: DrunkDimensionScore[];
}

export function DrunkResultContent({ persona, dimensionScores }: Props) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const shareRef = useRef<DrunkShareImageGeneratorHandle>(null);

  const shareUrl = getSiteUrl(`/drunk/result/${persona.slug}/`);
  const sessionResult = useMemo(() => {
    if (!mounted) {
      return null;
    }

    const stored = loadStoredQuizResult<DrunkDimensionScore>('drunk');
    return stored?.slug === persona.slug ? stored : null;
  }, [mounted, persona.slug]);
  const activeDimensionScores = sessionResult?.dimensionScores ?? dimensionScores;
  const diagnostics = sessionResult?.diagnostics ?? null;

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const copyShareText = useCallback(() => {
    const text = `我的酒后人设是 ${persona.code}（${persona.name}）\n${persona.tagline}\n来测测你的 → ${shareUrl}`;
    navigator.clipboard.writeText(text);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  }, [persona.code, persona.name, persona.tagline, shareUrl]);



  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${persona.color}12, transparent 70%)` }} />

        <div className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center relative">
          <button onClick={() => shareRef.current?.generate()}
            className="absolute top-16 right-6 p-2.5 rounded-xl border border-border-subtle bg-bg-secondary/60 hover:bg-bg-secondary text-text-muted hover:text-amber-400 transition-all cursor-pointer"
            title="生成分享图片">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-subtle bg-bg-secondary/60 text-xs text-text-muted mb-6">
              酒后人设鉴定
            </div>

            <DrunkPersonaAvatar persona={persona} alt={`${persona.name}形象`} priority sizes="(min-width: 768px) 384px, (min-width: 640px) 320px, 256px"
              className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 mx-auto mb-8 rounded-[2rem] overflow-hidden flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${persona.color}08 0%, ${persona.color}1a 100%)`,
                boxShadow: `0 24px 80px -24px ${persona.color}45, inset 0 0 0 1px ${persona.color}20`,
              }}
              imageClassName="object-contain drop-shadow-2xl w-[88%] h-[88%]"
              fallbackClassName="w-full h-full flex items-center justify-center text-8xl sm:text-9xl" />

            <div className="text-sm font-mono tracking-[0.3em] uppercase mb-2" style={{ color: persona.color }}>
              {persona.code}
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">{persona.name}</h1>
            <p className="text-xl text-text-secondary max-w-md mx-auto">{persona.tagline}</p>
          </motion.div>
        </div>
      </section>

      {/* Description */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 sm:p-8">
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">酒后人设速写</h2>
          <p className="text-text-secondary leading-[1.8] text-base">{persona.description}</p>
        </motion.div>
      </section>

      {diagnostics && (
        <section className="max-w-2xl mx-auto px-6 pb-16">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>
            <ResultDiagnosticsPanel diagnostics={diagnostics} accent={persona.color} title="这次酒后判定说明" />
          </motion.div>
        </section>
      )}

      {/* Dimension Bars */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-6">{diagnostics ? `${persona.code} 的本次五维落点` : `${persona.code} 的五维数据`}</h2>
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 sm:p-8 space-y-5">
            {activeDimensionScores.map(ds => {
              const dim = DRUNK_DIMENSIONS.find(d => d.id === ds.id);
              if (!dim) return null;
              const color = DRUNK_MODEL_COLORS[dim.model];
              const pct = ((ds.score - 1) / 2) * 100;
              return (
                <div key={ds.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono" style={{ color: color.base }}>{ds.id}</span>
                      <span className="text-sm text-text-primary">{DRUNK_MODEL_NAMES[dim.model]}</span>
                    </div>
                    <span className="text-xs font-mono text-text-muted">{ds.level}</span>
                  </div>
                  <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${color.base}, ${color.light})` }}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.4, duration: 0.8, ease: [0.4, 0, 0.2, 1] }} />
                  </div>
                  <p className="text-xs text-text-muted mt-1.5">{dim.levels[ds.level]}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      <CrossTestRecommendations currentTest="drunk" personalityName={persona.name} />

      {/* Share section */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }}>
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4 text-center">分享你的酒后人设</h2>
          <div className="space-y-3">
            <DrunkShareImageGenerator ref={shareRef} persona={persona} dimensionScores={activeDimensionScores} />
            <button onClick={copyShareText}
              className="w-full py-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-sm text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer">
              {textCopied ? '已复制分享文案 ✓' : '📋 复制分享文案'}
            </button>
            <div className="flex gap-3">
              <button onClick={copyLink}
                className="flex-1 py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all cursor-pointer">
                {copied ? '已复制 ✓' : '复制链接'}
              </button>
              <Link href="/drunk/test"
                className="flex-1 py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all text-center">
                重新测试
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <UniversePreviewCards currentUniverse="drunk" />
    </div>
  );
}
