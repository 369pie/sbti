'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { IDENTIFY_DIMENSIONS, IDENTIFY_MODEL_NAMES, IDENTIFY_MODEL_COLORS } from '@/lib/identify/dimensions';
import type { IdentifyPersonaType } from '@/lib/identify/personas';
import { getIdentifyTypeImage, getIdentifyTypeThumbnailImage } from '@/lib/identify/personas';
import type { IdentifyDimensionScore } from '@/lib/identify/scoring';
import { IdentifyShareImageGenerator } from '@/components/IdentifyShareImageGenerator';
import type { IdentifyShareImageGeneratorHandle } from '@/components/IdentifyShareImageGenerator';
import { useCallback, useMemo, useRef, useState, useEffect, useSyncExternalStore } from 'react';
import { getSiteUrl } from '@/lib/site';
import { CrossTestRecommendations } from '@/components/CrossTestRecommendations';
import { loadStoredQuizResult } from '@/lib/quiz-result-session';

const emptySubscribe = () => () => {};

interface Props {
  persona: IdentifyPersonaType;
  dimensionScores: IdentifyDimensionScore[];
}

function PersonaAvatar({ persona, className, style, priority = false, sizes = '128px' }: {
  persona: IdentifyPersonaType;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  sizes?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const [useOriginal, setUseOriginal] = useState(false);

  useEffect(() => { setImageFailed(false); setUseOriginal(false); }, [persona.slug]);

  const src = useOriginal ? getIdentifyTypeImage(persona.slug) : getIdentifyTypeThumbnailImage(persona.slug);

  return (
    <div className={className} style={style}>
      {imageFailed ? (
        <div className="w-full h-full flex items-center justify-center text-7xl sm:text-8xl">{persona.emoji}</div>
      ) : (
        <NextImage
          src={src}
          alt={`${persona.name}形象`}
          fill
          unoptimized
          priority={priority}
          sizes={sizes}
          className="object-contain p-2"
          onError={() => {
            if (!useOriginal) { setUseOriginal(true); return; }
            setImageFailed(true);
          }}
        />
      )}
    </div>
  );
}

export function IdentifyResultContent({ persona, dimensionScores }: Props) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const shareRef = useRef<IdentifyShareImageGeneratorHandle>(null);

  const shareUrl = getSiteUrl(`/identify/result/${persona.slug}/`);

  // Load friend name from session
  const friendName = useMemo(() => {
    if (!mounted) return '';
    try {
      return window.sessionStorage.getItem('sbti:identify-friend-name') || '';
    } catch { return ''; }
  }, [mounted]);

  const displayName = friendName || 'ta';

  const sessionResult = useMemo(() => {
    if (!mounted) return null;
    const stored = loadStoredQuizResult<IdentifyDimensionScore>('identify');
    return stored?.slug === persona.slug ? stored : null;
  }, [mounted, persona.slug]);

  const activeDimensionScores = sessionResult?.dimensionScores ?? dimensionScores;

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const copyShareText = useCallback(() => {
    const text = `WTF 鉴定书：${displayName}被鉴定为 ${persona.code}（${persona.name}）\n${persona.tagline}\n被冤枉了？自己来测 → ${getSiteUrl('/test')}`;
    navigator.clipboard.writeText(text);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  }, [persona.code, persona.name, persona.tagline, displayName]);

  // Symptom checklist state
  const [checkedSymptoms, setCheckedSymptoms] = useState<Set<number>>(new Set());
  const toggleSymptom = useCallback((index: number) => {
    setCheckedSymptoms(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const hitCount = checkedSymptoms.size;
  const totalSymptoms = persona.symptoms.length;

  return (
    <div className="min-h-screen">
      {/* Hero — 鉴定书 Header */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${persona.color}12, transparent 70%)` }} />

        <div className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center relative">
          <button onClick={() => shareRef.current?.generate()}
            className="absolute top-16 right-6 p-2.5 rounded-xl border border-border-subtle bg-bg-secondary/60 hover:bg-bg-secondary text-text-muted hover:text-pink-400 transition-all cursor-pointer"
            title="生成鉴定书图片">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pink-500/20 bg-pink-500/5 text-xs text-pink-400 mb-6">
              🔍 WTF 好友鉴定书
            </div>

            {friendName && (
              <p className="text-text-muted text-sm mb-4">被鉴定人：<span className="text-text-primary font-medium">{friendName}</span></p>
            )}

            <PersonaAvatar
              persona={persona}
              priority
              sizes="(min-width: 640px) 192px, 160px"
              className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-6 rounded-2xl overflow-hidden"
              style={{ background: `${persona.color}15` }}
            />

            <div className="text-sm font-mono tracking-[0.3em] uppercase mb-2" style={{ color: persona.color }}>
              {persona.code}
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">{persona.name}</h1>
            <p className="text-xl text-text-secondary max-w-md mx-auto">{persona.tagline}</p>
          </motion.div>
        </div>
      </section>

      {/* Verdict — 鉴定评语 */}
      <section className="max-w-2xl mx-auto px-6 pb-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 sm:p-8">
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">鉴定评语</h2>
          <p className="text-text-secondary leading-[1.8] text-base">{persona.verdict}</p>
        </motion.div>
      </section>

      {/* Symptoms Checklist — 核心传播组件 */}
      <section className="max-w-2xl mx-auto px-6 pb-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase">
                {displayName}中了几枪？
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold" style={{ color: persona.color }}>
                  {hitCount}
                </span>
                <span className="text-sm text-text-muted">/ {totalSymptoms}</span>
              </div>
            </div>

            <div className="space-y-3">
              {persona.symptoms.map((symptom, i) => {
                const checked = checkedSymptoms.has(i);
                return (
                  <button
                    key={i}
                    onClick={() => toggleSymptom(i)}
                    className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-all cursor-pointer ${
                      checked
                        ? 'border-pink-500/30 bg-pink-500/5'
                        : 'border-border-subtle bg-bg-secondary/20 hover:bg-bg-secondary/40'
                    }`}
                  >
                    <span className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-all ${
                      checked ? 'border-pink-500 bg-pink-500' : 'border-border'
                    }`}>
                      {checked && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className={`text-sm leading-relaxed ${checked ? 'text-text-primary' : 'text-text-secondary'}`}>
                      {symptom}
                    </span>
                  </button>
                );
              })}
            </div>

            {hitCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 pt-5 border-t border-border-subtle text-center"
              >
                <p className="text-sm text-text-secondary">
                  {hitCount >= totalSymptoms
                    ? `全中 💀 ${displayName}就是${persona.name}本名无疑`
                    : hitCount >= 3
                      ? `中了 ${hitCount} 枪 😵 ${displayName}已确诊${persona.name}`
                      : `中了 ${hitCount} 枪 🤔 有点像但还不太确定`
                  }
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Dimension Bars */}
      <section className="max-w-2xl mx-auto px-6 pb-12">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.5 }}>
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-6">五维鉴定数据</h2>
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 sm:p-8 space-y-5">
            {activeDimensionScores.map(ds => {
              const dim = IDENTIFY_DIMENSIONS.find(d => d.id === ds.id);
              if (!dim) return null;
              const color = IDENTIFY_MODEL_COLORS[dim.model];
              const pct = ((ds.score - 1) / 2) * 100;
              return (
                <div key={ds.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono" style={{ color: color.base }}>{ds.id}</span>
                      <span className="text-sm text-text-primary">{IDENTIFY_MODEL_NAMES[dim.model]}</span>
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

      {/* Call to action — "不服自己来测" */}
      <section className="max-w-2xl mx-auto px-6 pb-12">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.5 }}>
          <div className="rounded-2xl border-2 border-dashed border-pink-500/20 bg-pink-500/5 p-6 sm:p-8 text-center">
            <div className="text-3xl mb-3">😤</div>
            <h3 className="text-lg font-semibold mb-2">被冤枉了？</h3>
            <p className="text-sm text-text-secondary mb-4">
              {displayName}觉得不准？让 ta 自己来测一下对比看看
            </p>
            <Link
              href="/test"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium text-sm hover:from-pink-600 hover:to-rose-600 transition-all"
            >
              让 ta 自己来测
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </section>

      <CrossTestRecommendations currentTest="identify" personalityName={displayName} />

      {/* Share section */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }}>
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4 text-center">分享鉴定书</h2>
          <div className="space-y-3">
            <IdentifyShareImageGenerator ref={shareRef} persona={persona} dimensionScores={activeDimensionScores} friendName={friendName} />
            <button onClick={copyShareText}
              className="w-full py-3 rounded-xl border border-pink-500/20 bg-pink-500/5 text-sm text-pink-400 hover:bg-pink-500/10 transition-all cursor-pointer">
              {textCopied ? '已复制分享文案 ✓' : '📋 复制分享文案'}
            </button>
            <div className="flex gap-3">
              <button onClick={copyLink}
                className="flex-1 py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all cursor-pointer">
                {copied ? '已复制 ✓' : '复制链接'}
              </button>
              <Link href="/identify/test"
                className="flex-1 py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all text-center">
                鉴定下一个好友
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
