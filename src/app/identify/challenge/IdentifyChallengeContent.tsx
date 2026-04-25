'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { useMemo, useEffect } from 'react';
import { useState } from 'react';
import { identifyApi, type IdentifyPreviewResponse } from '@/lib/identify/api';
import { IDENTIFY_PERSONA_TYPES, getIdentifyTypeThumbnailImage, getIdentifyTypeImage } from '@/lib/identify/personas';
import { IDENTIFY_MODEL_NAMES, IDENTIFY_MODEL_COLORS } from '@/lib/identify/dimensions';
import type { IdentifyPersonaType } from '@/lib/identify/personas';
import type { IdentifyModelType, DimensionLevel } from '@/lib/identify/dimensions';

/* ── Blurred avatar ── */
function ChallengeAvatar({ persona }: { persona: IdentifyPersonaType }) {
  return <ChallengeAvatarInner key={persona.slug} persona={persona} />;
}

function ChallengeAvatarInner({ persona }: { persona: IdentifyPersonaType }) {
  const [failed, setFailed] = useState(false);
  const [useOriginal, setUseOriginal] = useState(false);

  const src = useOriginal
    ? getIdentifyTypeImage(persona.slug)
    : getIdentifyTypeThumbnailImage(persona.slug);

  if (failed) {
    return (
      <div className="w-full h-full flex items-center justify-center text-8xl blur-[6px]">
        {persona.emoji}
      </div>
    );
  }

  return (
    <NextImage
      src={src}
      alt={persona.name}
      fill
      priority
      sizes="200px"
      className="object-contain p-3 blur-[6px] brightness-75 saturate-50"
      onError={() => {
        if (!useOriginal) { setUseOriginal(true); return; }
        setFailed(true);
      }}
    />
  );
}

/* ── Blurred radar chart ── */
function BlurredRadarChart({ persona }: { persona: IdentifyPersonaType }) {
  const dimensions = Object.entries(persona.profile) as [string, DimensionLevel][];
  const count = dimensions.length;
  const cx = 100, cy = 100, R = 70;

  // Map H/M/L to radius fraction
  const levelToR = (level: DimensionLevel) => {
    if (level === 'H') return 0.9;
    if (level === 'M') return 0.6;
    return 0.3;
  };

  const angleStep = (2 * Math.PI) / count;

  // Build polygon points
  const points = dimensions.map(([, level], i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const r = R * levelToR(level);
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');

  // Grid lines
  const gridLevels = [0.33, 0.66, 1];

  // Dimension names mapped
  const dimModelMap: Record<string, IdentifyModelType> = {
    D1: 'social', D2: 'emotion', D3: 'drive', D4: 'vibe', D5: 'loyalty',
  };

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Grid */}
        {gridLevels.map((gl, gi) => (
          <polygon
            key={gi}
            points={dimensions.map((_, i) => {
              const angle = -Math.PI / 2 + i * angleStep;
              const r = R * gl;
              return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
            }).join(' ')}
            fill="none"
            stroke={`${persona.color}20`}
            strokeWidth="0.5"
          />
        ))}
        {/* Axes */}
        {dimensions.map((_, i) => {
          const angle = -Math.PI / 2 + i * angleStep;
          return (
            <line
              key={i}
              x1={cx} y1={cy}
              x2={cx + R * Math.cos(angle)}
              y2={cy + R * Math.sin(angle)}
              stroke={`${persona.color}15`}
              strokeWidth="0.5"
            />
          );
        })}
        {/* Data polygon — blurred */}
        <motion.polygon
          points={points}
          fill={`${persona.color}15`}
          stroke={persona.color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          filter="url(#radar-blur)"
        />
        <defs>
          <filter id="radar-blur">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
      </svg>
      {/* Labels around the chart */}
      {dimensions.map(([dimId], i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        const labelR = R + 22;
        const lx = cx + labelR * Math.cos(angle);
        const ly = cy + labelR * Math.sin(angle);
        const model = dimModelMap[dimId];
        const colors = model ? IDENTIFY_MODEL_COLORS[model] : undefined;
        return (
          <div
            key={dimId}
            className="absolute text-[10px] font-medium"
            style={{
              left: `${lx / 2}%`,
              top: `${ly / 2}%`,
              transform: 'translate(-50%, -50%)',
              color: colors?.base || persona.color,
            }}
          >
            {model ? IDENTIFY_MODEL_NAMES[model] : dimId}
          </div>
        );
      })}
    </div>
  );
}

export function IdentifyChallengeContent() {
  const searchParams = useSearchParams();
  const shareToken = searchParams.get('r');
  const typeSlug = searchParams.get('t');
  const friendName = searchParams.get('n');
  const [preview, setPreview] = useState<IdentifyPreviewResponse | null>(null);
  const [resolvedToken, setResolvedToken] = useState<string | null>(null);
  const previewResolved = !shareToken || resolvedToken === shareToken;

  useEffect(() => {
    let cancelled = false;

    if (!shareToken) return;

    identifyApi
      .getPreview(shareToken)
      .then((data) => {
        if (cancelled) return;
        setPreview(data);
      })
      .catch(() => {
        if (cancelled) return;
        setPreview(null);
      })
      .finally(() => {
        if (cancelled) return;
        setResolvedToken(shareToken);
      });

    identifyApi.claimReceived(shareToken, false).catch(() => {
      // Non-blocking: preview should still render even if claim fails.
    });

    return () => {
      cancelled = true;
    };
  }, [shareToken]);

  const persona = useMemo(() => {
    const slug = preview?.personaSlug || typeSlug;
    if (!slug) return null;
    return IDENTIFY_PERSONA_TYPES.find(p => p.slug === slug) ?? null;
  }, [preview?.personaSlug, typeSlug]);

  // Store sender hint for reverse-identify flow
  useEffect(() => {
    const challengeFrom = preview?.actorDisplayName || friendName;
    if (challengeFrom) {
      try {
        sessionStorage.setItem('sbti:challenge-from', challengeFrom);
      } catch { /* ok */ }
    }
  }, [friendName, preview?.actorDisplayName]);

  if (shareToken && !previewResolved) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-5 h-5 rounded-full border-2 border-pink-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h1 className="text-xl font-semibold mb-2">链接可能已失效</h1>
        <p className="text-text-secondary text-sm mb-6">
          不过你可以自己来测测看！
        </p>
        <Link
          href="/identify/test/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-bg-primary font-medium text-sm"
        >
          开始测试 →
        </Link>
      </div>
    );
  }

  const displayFrom = preview?.actorDisplayName || friendName || '你的朋友';
  const directResultHref = shareToken
    ? `/identify/result/${persona.slug}/?r=${encodeURIComponent(shareToken)}`
    : `/identify/result/${persona.slug}/`;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[600px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${persona.color}15, transparent 70%)` }}
        />

        <div className="max-w-xl mx-auto px-6 pt-16 pb-6 text-center relative">
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
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-sm text-pink-400 mb-6"
            >
              🔔 有人用 21 个维度分析了你……
            </motion.div>

            {/* Persona image — blurred silhouette */}
            <div
              className="relative w-40 h-40 mx-auto mb-6 rounded-2xl overflow-hidden"
              style={{ background: `${persona.color}10` }}
            >
              <ChallengeAvatar persona={persona} />
              {/* Overlay question mark */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-bold opacity-60" style={{ color: persona.color }}>?</span>
              </div>
            </div>

            {/* Main message */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug mb-2">
              <span className="text-text-primary">{displayFrom}</span>
              <span className="text-text-secondary"> 觉得你是</span>
              <br />
              <span style={{ color: persona.color }}>{persona.emoji} {persona.name}</span>
            </h1>

            {/* Tagline — blurred */}
            <div className="relative max-w-sm mx-auto mb-2">
              <p className="text-text-secondary text-base leading-relaxed blur-[5px] select-none pointer-events-none">
                &ldquo;{persona.tagline}&rdquo;
              </p>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-text-muted bg-bg-primary/80 px-2 py-0.5 rounded">解锁后可见</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blurred radar chart */}
      <section className="max-w-md mx-auto px-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-5"
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-1 text-center">
            五维人格轮廓
          </h2>
          <p className="text-[11px] text-text-muted text-center mb-3">
            数值已模糊 · 完成测试后对比查看
          </p>
          <BlurredRadarChart persona={persona} />
        </motion.div>
      </section>

      {/* Symptoms teaser — count only, content hidden */}
      <section className="max-w-md mx-auto px-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-5"
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-3">
            ta 觉得你中了 {persona.symptoms.length} 枪 💥
          </h2>
          <div className="space-y-2">
            {persona.symptoms.map((_, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded border-2 border-pink-500/30 bg-pink-500/10 flex items-center justify-center">
                  <svg className="w-3 h-3 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div className="flex-1 h-3 rounded-full bg-text-muted/10 blur-[4px]" />
              </div>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-3 text-center">
            {persona.symptoms.length} 条鉴定内容已隐藏
          </p>
        </motion.div>
      </section>

      {/* Dual CTA section */}
      <section className="max-w-md mx-auto px-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="space-y-3"
        >
          {/* Path A: 自己也做一个 */}
          <Link
            href="/identify/test/"
            className="block w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-bg-primary font-medium text-center text-base hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/20"
          >
            自己也做一个（解锁完整鉴定）→
          </Link>

          {/* Path B: 直接看 TA 怎么说 */}
          <Link
            href={directResultHref}
            className="block w-full py-4 rounded-2xl border-2 border-dashed border-pink-500/20 bg-pink-500/5 text-center hover:bg-pink-500/10 transition-all"
          >
            <span className="text-base font-medium text-text-primary">直接看 TA 怎么说你的</span>
            <br />
            <span className="text-xs text-text-muted">查看完整鉴定书 · {persona.symptoms.length} 条鉴定 + 5维分析</span>
          </Link>
        </motion.div>
      </section>

      {/* 反鉴定 CTA */}
      <section className="max-w-md mx-auto px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="rounded-2xl border border-accent/15 bg-accent-dim p-5 text-center"
        >
          <div className="text-2xl mb-2">🔍</div>
          <p className="text-sm font-medium text-text-primary mb-1">
            不服？反鉴定回 {displayFrom}
          </p>
          <p className="text-xs text-text-muted mb-3">
            你也用 21 个维度分析 ta，看看谁更了解谁
          </p>
          <Link
            href="/identify/test/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-accent/30 text-accent text-sm font-medium hover:bg-accent/10 transition-all"
          >
            鉴定 {displayFrom} →
          </Link>
        </motion.div>
      </section>

      {/* Footer note */}
      <section className="max-w-md mx-auto px-6 pb-20 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-xs text-text-muted"
        >
          WTFTI 好友鉴定 · 21 种人格 × 5 维度分析
        </motion.p>
      </section>
    </div>
  );
}
