'use client';

import dynamic from 'next/dynamic';

import Link from 'next/link';
import NextImage from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { IDENTIFY_DIMENSIONS, IDENTIFY_MODEL_NAMES, IDENTIFY_MODEL_COLORS } from '@/lib/identify/dimensions';
import type { IdentifyPersonaType } from '@/lib/identify/personas';
import { getIdentifyTypeImage, getIdentifyTypeThumbnailImage, getIdentifyTypeMediumImage } from '@/lib/identify/personas';
import type { IdentifyDimensionScore } from '@/lib/identify/scoring';
const IdentifyShareImageGenerator = dynamic(
  () => import('@/components/IdentifyShareImageGenerator').then((m) => m.IdentifyShareImageGenerator),
  { ssr: false },
);
import type { IdentifyShareImageGeneratorHandle } from '@/components/IdentifyShareImageGenerator';
import { useCallback, useMemo, useRef, useState, useEffect, useSyncExternalStore } from 'react';
import { identifyApi, type IdentifyPreviewResponse } from '@/lib/identify/api';
import { getSiteUrl, SHARE_SITE_URL } from '@/lib/site';
import { CrossTestRecommendations } from '@/components/CrossTestRecommendations';
import { WtfiTheoryWiring } from '@/components/WtfiTheoryWiring';
import { loadStoredQuizResult } from '@/lib/quiz-result-session';
import { UniversePreviewCards } from '@/components/UniversePreviewCards';
import { Glyph } from '@/components/Glyph';
import { useDeferredShareGenerate } from '@/lib/perf/use-deferred-share-generate';

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

  const src = useOriginal ? getIdentifyTypeImage(persona.slug) : getIdentifyTypeMediumImage(persona.slug);

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
          placeholder="blur"
          blurDataURL="data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgAA="
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
  const searchParams = useSearchParams();
  const sharedAssessmentToken = searchParams.get('r');
  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const [sharedPreview, setSharedPreview] = useState<IdentifyPreviewResponse | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    sharedAssessmentToken ? 'saved' : 'idle',
  );
  const [savedAssessment, setSavedAssessment] = useState<{
    id: string;
    shareToken: string;
    actorDisplayName: string;
    subjectDisplayName: string;
    personaSlug: string;
    createdAt: string;
  } | null>(null);
  const clientMutationIdRef = useRef(
    typeof crypto !== 'undefined' ? crypto.randomUUID() : `identify-${Date.now()}`,
  );
  const shareRef = useRef<IdentifyShareImageGeneratorHandle>(null);
  const { mounted: shareMounted, ensureMounted: ensureShareMounted, triggerGenerate: triggerShareGenerate } = useDeferredShareGenerate(shareRef);

  useEffect(() => {
    let cancelled = false;

    if (!sharedAssessmentToken) return;

    identifyApi
      .getPreview(sharedAssessmentToken)
      .then((preview) => {
        if (cancelled) return;
        setSharedPreview(preview);
      })
      .catch(() => {
        if (cancelled) return;
        setSharedPreview(null);
      });

    identifyApi.claimReceived(sharedAssessmentToken, true).catch(() => {
      // Non-blocking: the shared result should still render if claiming fails.
    });

    return () => {
      cancelled = true;
    };
  }, [sharedAssessmentToken]);

  // Load friend name from session
  const friendName = useMemo(() => {
    if (sharedPreview?.subjectDisplayName) {
      return sharedPreview.subjectDisplayName;
    }
    if (!mounted) return '';
    try {
      return window.sessionStorage.getItem('sbti:identify-friend-name') || '';
    } catch { return ''; }
  }, [mounted, sharedPreview?.subjectDisplayName]);

  const fromName = sharedPreview?.actorDisplayName || '';

  const displayName = friendName || 'ta';

  const sessionResult = useMemo(() => {
    if (!mounted) return null;
    const stored = loadStoredQuizResult<IdentifyDimensionScore>('identify');
    return stored?.slug === persona.slug ? stored : null;
  }, [mounted, persona.slug]);

  useEffect(() => {
    let active = true;

    if (!mounted || sharedAssessmentToken || !sessionResult || savedAssessment || saveState === 'saving') {
      return;
    }

    setSaveState('saving');

    identifyApi
      .saveAssessment({
        personaSlug: persona.slug,
        friendName,
        dimensionScores: sessionResult.dimensionScores,
        diagnostics: sessionResult.diagnostics,
        clientMutationId: clientMutationIdRef.current,
      })
      .then((result) => {
        if (!active) return;
        setSavedAssessment(result.assessment);
        setSaveState('saved');
      })
      .catch(() => {
        if (!active) return;
        setSaveState('error');
      });

    return () => {
      active = false;
    };
  }, [friendName, mounted, persona.slug, saveState, savedAssessment, sessionResult, sharedAssessmentToken]);

  const activeDimensionScores = sharedPreview?.dimensionScores ?? sessionResult?.dimensionScores ?? dimensionScores;

  const resultShareToken = sharedAssessmentToken || savedAssessment?.shareToken || '';
  const shareUrl = resultShareToken
    ? getSiteUrl(`/identify/result/${persona.slug}/?r=${encodeURIComponent(resultShareToken)}`)
    : getSiteUrl(`/identify/result/${persona.slug}/`);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const copyShareText = useCallback(() => {
    const prefix = fromName
      ? `${displayName}在 ${fromName} 眼里是`
      : `${displayName}被鉴定为`;
    const text = `WTF 鉴定书：${prefix} ${persona.code}（${persona.name}）\n${persona.tagline}\n被冤枉了？自己来测 → ${getSiteUrl('/identify/test/')}`;
    navigator.clipboard.writeText(text);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  }, [displayName, fromName, persona.code, persona.name, persona.tagline]);

  // Challenge link for reverse invitation
  const challengeUrl = useMemo(() => {
    if (savedAssessment?.shareToken) {
      return `${SHARE_SITE_URL}identify/challenge/?r=${encodeURIComponent(savedAssessment.shareToken)}`;
    }
    const params = new URLSearchParams({ t: persona.slug });
    if (friendName) params.set('n', friendName);
    return `${SHARE_SITE_URL}identify/challenge/?${params.toString()}`;
  }, [friendName, persona.slug, savedAssessment?.shareToken]);

  const [challengeCopied, setChallengeCopied] = useState(false);
  const copyChallenge = useCallback(() => {
    navigator.clipboard.writeText(challengeUrl);
    setChallengeCopied(true);
    setTimeout(() => setChallengeCopied(false), 2000);
  }, [challengeUrl]);

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
      {/* Hero — Editorial magazine certificate */}
      <section className="relative">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 pt-16 sm:pt-24 pb-16 sm:pb-20 relative">
          <button onPointerEnter={ensureShareMounted} onClick={triggerShareGenerate}
            className="absolute top-16 right-6 sm:right-10 p-2.5 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            style={{ border: '1px solid var(--color-rule)' }}
            title="生成鉴定书图片">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
            {/* Masthead eyebrow */}
            <div className="flex items-center gap-4 mb-10">
              <span className="serial-number text-sm">Issue 04</span>
              <span className="editorial-rule flex-1 max-w-[80px]" />
              <span className="eyebrow">Friend Identifier · 鉴定书</span>
            </div>

            {/* Byline */}
            {(friendName || fromName) && (
              <div className="mb-10 flex flex-wrap gap-x-10 gap-y-2 text-sm">
                {friendName && (
                  <div>
                    <span className="eyebrow mr-2">Subject</span>
                    <span className="text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>{friendName}</span>
                  </div>
                )}
                {fromName && (
                  <div>
                    <span className="eyebrow mr-2">By</span>
                    <span className="text-text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>{fromName}</span>
                  </div>
                )}
              </div>
            )}

            {saveState !== 'idle' && !sharedAssessmentToken && (
              <div className="inline-block eyebrow mb-6" style={{ color: 'var(--color-rose-deep)' }}>
                {saveState === 'saving' && '· Saving to archive …'}
                {saveState === 'saved' && '· Archived'}
                {saveState === 'error' && '· Archive failed (still viewable)'}
              </div>
            )}

            {/* Split layout — portrait + type */}
            <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-10 md:gap-16 items-center">
              <div className="flex justify-center md:justify-start">
                <PersonaAvatar
                  persona={persona}
                  priority
                  sizes="(min-width: 768px) 320px, 240px"
                  className="relative w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 overflow-hidden"
                  style={{ background: `${persona.color}10`, border: '1px solid var(--color-rule)' }}
                />
              </div>

              <div>
                <div
                  className="serial-number text-sm mb-5"
                  style={{ color: persona.color, letterSpacing: '0.32em' }}
                >
                  {persona.code}
                </div>
                <h1 className="editorial-display text-5xl sm:text-6xl md:text-7xl leading-[0.95] mb-6">
                  {persona.name}
                </h1>
                <hr className="editorial-rule w-16 mb-6" />
                <p
                  className="text-lg sm:text-xl leading-[1.6] text-text-secondary italic max-w-md"
                  style={{ fontFamily: 'var(--font-editorial)' }}
                >
                  「{persona.tagline}」
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Verdict — 鉴定评语 editorial card */}
      <section className="max-w-3xl mx-auto px-6 sm:px-10 pb-16" style={{ borderTop: '1px solid var(--color-rule-soft)' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="pt-12">
          <div className="flex items-center gap-4 mb-8">
            <span className="serial-number text-xs">§ 01</span>
            <span className="editorial-rule flex-1 max-w-[60px]" />
            <span className="eyebrow">Verdict · 鉴定评语</span>
          </div>
          <p
            className="text-text-primary leading-[1.85] text-lg sm:text-xl"
            style={{ fontFamily: 'var(--font-editorial)', fontWeight: 400 }}
          >
            {persona.verdict}
          </p>
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

      {/* Challenge CTA — "发给 TA 看看" (viral loop trigger) */}
      <section className="max-w-2xl mx-auto px-6 pb-12">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.5 }}>
          <div className="rounded-2xl border-2 border-pink-500/20 bg-gradient-to-b from-pink-500/10 to-transparent p-6 sm:p-8 text-center">
            <div className="text-3xl mb-3">📩</div>
            <h3 className="text-lg font-semibold mb-2">发给 {displayName} 看看准不准？</h3>
            <p className="text-sm text-text-secondary mb-5">
              生成一条专属链接，{displayName}打开就能看到你对 ta 的鉴定
            </p>
            <button
              onClick={copyChallenge}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium text-sm hover:from-pink-600 hover:to-rose-600 transition-all cursor-pointer"
            >
              {challengeCopied ? (
                '已复制挑战链接 ✓'
              ) : (
                <>
                  复制链接，发给 {displayName}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </section>

      {/* Call to action — "不服自己来测" */}
      <section className="max-w-2xl mx-auto px-6 pb-12">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }}>
          <div className="rounded-2xl border border-dashed border-border bg-bg-secondary/30 p-6 sm:p-8 text-center">
            <div className="text-2xl mb-2">😤</div>
            <p className="text-sm text-text-secondary mb-3">
              {displayName}觉得不准？让 ta 自己来测
            </p>
            <Link
              href="/identify/test/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-text-secondary font-medium text-sm hover:text-text-primary hover:bg-bg-secondary transition-all"
            >
              让 ta 自己来测 →
            </Link>
          </div>
        </motion.div>
      </section>

      <CrossTestRecommendations currentTest="identify" personalityName={displayName} />

      <section className="max-w-2xl mx-auto px-6 pb-8">
        <WtfiTheoryWiring universe="identify" dimensionScores={dimensionScores} />
      </section>

      {/* Share section */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }}>
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4 text-center">分享鉴定书</h2>
          <div className="space-y-3">
            {shareMounted ? <IdentifyShareImageGenerator ref={shareRef} persona={persona} dimensionScores={activeDimensionScores} friendName={friendName} /> : null}
            <button onClick={copyShareText}
              className="w-full py-3 rounded-xl border border-pink-500/20 bg-pink-500/5 text-sm text-pink-400 hover:bg-pink-500/10 transition-all cursor-pointer">
              {textCopied ? (
                '已复制分享文案 ✓'
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Glyph name="copy" size={14} />
                  <span>复制分享文案</span>
                </span>
              )}
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

      <UniversePreviewCards currentUniverse="identify" />
    </div>
  );
}
