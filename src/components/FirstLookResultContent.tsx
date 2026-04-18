'use client';

import dynamic from 'next/dynamic';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  DEEP_DIVE_META,
  FIRST_LOOK_ARCHETYPES,
  RARITY_LABEL,
  getArchetypeBySlug,
  type DeepDiveTarget,
  type FirstLookArchetype,
} from '@/lib/first-look/archetypes';
import { loadFirstLookResult } from '@/lib/first-look/session';
import { trackFirstLook } from '@/lib/first-look/analytics';
const FirstLookShareImageGenerator = dynamic(
  () => import('@/components/FirstLookShareImageGenerator').then((m) => m.FirstLookShareImageGenerator),
  { ssr: false },
);
import type { FirstLookShareImageGeneratorHandle } from '@/components/FirstLookShareImageGenerator';
import { getLiveUniverses } from '@/lib/universes';
import { withBasePath } from '@/lib/site';

interface FirstLookResultContentProps {
  slug: string;
}

export function FirstLookResultContent({ slug }: FirstLookResultContentProps) {
  const archetype = getArchetypeBySlug(slug);
  const [stored, setStored] = useState<ReturnType<typeof loadFirstLookResult>>(null);
  const [ready, setReady] = useState(false);
  const shareRef = useRef<FirstLookShareImageGeneratorHandle>(null);

  useEffect(() => {
    setStored(loadFirstLookResult());
    setReady(true);
  }, []);

  // Fallback deep-dive matches if session is empty (e.g. direct URL visit).
  const deepDive = useMemo(() => {
    if (stored && stored.slug === slug) return stored.deepDive;
    if (!archetype) return [];
    const fallback: Array<{ target: DeepDiveTarget; match: number }> = [
      { target: archetype.primaryDeepDive, match: 92 },
      { target: archetype.secondaryDeepDive, match: 64 },
    ];
    const missing = (['wtf', 'soulti', 'mysti'] as DeepDiveTarget[]).find(
      t => !fallback.some(d => d.target === t),
    );
    if (missing) fallback.push({ target: missing, match: 40 });
    return fallback;
  }, [archetype, slug, stored]);

  if (!archetype) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="editorial-display text-2xl mb-4">这张牌不在牌池里。</p>
          <Link href="/test/" className="btn btn-ink">
            去翻一张属于你的
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen paper-texture" style={{ background: 'var(--color-paper)' }}>
      <ResultHero archetype={archetype} />
      <DeepDivePanel
        archetype={archetype}
        deepDive={deepDive}
        slug={slug}
        sessionReady={ready}
      />
      <SecondaryActions archetype={archetype} onSharePoster={() => shareRef.current?.download()} />
      <UniverseDetour slug={slug} />
      <FooterMeta />
      <FirstLookShareImageGenerator ref={shareRef} archetype={archetype} />
    </div>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function ResultHero({ archetype }: { archetype: FirstLookArchetype }) {
  const bgGradient = `radial-gradient(ellipse at 50% 0%, ${archetype.accentSoft} 0%, transparent 60%)`;

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: bgGradient, opacity: 0.65 }}
      />
      <div className="max-w-3xl mx-auto px-6 sm:px-10 pt-20 sm:pt-28 pb-14 relative">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-10"
        >
          <span className="serial-number text-xs">N° {archetype.code}</span>
          <span className="h-px flex-1 max-w-[60px]" style={{ background: 'var(--color-rule)' }} />
          <span className="text-[10px] tracking-[0.35em] uppercase text-text-muted">
            First Look · 初见
          </span>
        </motion.div>

        {/* Archetype card */}
        <motion.article
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto"
          style={{
            background: 'var(--color-bg-elevated)',
            border: `1px solid ${archetype.accent}33`,
            borderRadius: 'var(--radius-card)',
            padding: '36px 28px 40px',
            boxShadow: `0 20px 60px -20px ${archetype.accent}40`,
          }}
        >
          {/* Corners */}
          <Corners accent={archetype.accent} />

          {/* Rarity pill */}
          <div className="flex items-center justify-between mb-6">
            <RarityBadge rarity={archetype.rarity} accent={archetype.accent} />
            <span className="text-[10px] tracking-[0.35em] uppercase text-text-muted">
              仅 {archetype.holdRate}% 的人是这张
            </span>
          </div>

          {/* Glyph + Name */}
          <div className="text-center">
            <div
              className="editorial-italic text-6xl sm:text-7xl mb-4 leading-none"
              style={{ color: archetype.accent }}
            >
              {archetype.glyph}
            </div>
            <h1
              className="editorial-display text-4xl sm:text-5xl mb-2 leading-[1.05]"
              style={{ color: 'var(--color-ink)' }}
            >
              {archetype.name}
            </h1>
            <p className="text-xs tracking-[0.3em] uppercase text-text-muted">
              {archetype.nameEn} · {archetype.essence}
            </p>
          </div>

          {/* Rule */}
          <div className="my-7 flex items-center gap-3 justify-center">
            <span className="h-px w-10" style={{ background: archetype.accent, opacity: 0.4 }} />
            <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: archetype.accent }}>
              Essence
            </span>
            <span className="h-px w-10" style={{ background: archetype.accent, opacity: 0.4 }} />
          </div>

          {/* Tagline */}
          <p
            className="editorial-italic text-center text-xl sm:text-2xl mb-6 leading-[1.45]"
            style={{ color: 'var(--color-ink)' }}
          >
            “{archetype.tagline}”
          </p>

          {/* Prose */}
          <p className="text-[15px] leading-[1.9] text-text-secondary text-center max-w-xl mx-auto">
            {archetype.prose}
          </p>

          {/* Keywords */}
          <div className="flex items-center justify-center flex-wrap gap-2 mt-8">
            {archetype.keywords.map(k => (
              <span
                key={k}
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  color: archetype.accent,
                  border: `1px solid ${archetype.accent}55`,
                  background: `${archetype.accent}12`,
                }}
              >
                {k}
              </span>
            ))}
          </div>
        </motion.article>
      </div>
    </section>
  );
}

function Corners({ accent }: { accent: string }) {
  const style = { color: accent, opacity: 0.5 } as const;
  return (
    <>
      <span className="absolute top-3 left-3 text-[10px]" style={style}>✦</span>
      <span className="absolute top-3 right-3 text-[10px]" style={style}>✦</span>
      <span className="absolute bottom-3 left-3 text-[10px]" style={style}>✦</span>
      <span className="absolute bottom-3 right-3 text-[10px]" style={style}>✦</span>
    </>
  );
}

function RarityBadge({ rarity, accent }: { rarity: 'S' | 'A' | 'B' | 'C'; accent: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] tracking-[0.25em] uppercase"
      style={{
        color: accent,
        border: `1px solid ${accent}66`,
        background: `${accent}12`,
      }}
    >
      <span className="font-semibold">{rarity}</span>
      <span className="opacity-70">· {RARITY_LABEL[rarity]}</span>
    </span>
  );
}

// ─── Deep dive panel ────────────────────────────────────────────────────────

interface DeepDivePanelProps {
  archetype: FirstLookArchetype;
  deepDive: Array<{ target: DeepDiveTarget; match: number }>;
  slug: string;
  sessionReady: boolean;
}

function DeepDivePanel({ archetype, deepDive, slug, sessionReady }: DeepDivePanelProps) {
  if (!sessionReady) return null;
  const primary = deepDive[0];
  const rest = deepDive.slice(1);

  return (
    <section className="max-w-3xl mx-auto px-6 sm:px-10 py-16">
      <div className="text-center mb-10">
        <span className="serial-number text-xs mr-2">02</span>
        <span className="text-[10px] tracking-[0.35em] uppercase text-text-muted">
          Your Next Room · 你的深潜方向
        </span>
      </div>

      {primary && (
        <PrimaryDeepDive archetype={archetype} target={primary.target} match={primary.match} slug={slug} />
      )}

      {rest.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rest.map(d => (
            <SecondaryDeepDive key={d.target} target={d.target} match={d.match} slug={slug} />
          ))}
        </div>
      )}
    </section>
  );
}

function PrimaryDeepDive({
  archetype,
  target,
  match,
  slug,
}: {
  archetype: FirstLookArchetype;
  target: DeepDiveTarget;
  match: number;
  slug: string;
}) {
  const meta = DEEP_DIVE_META[target];
  return (
    <Link
      href={meta.href}
      prefetch={false}
      onClick={() => trackFirstLook('first_look_deep_click', { target, match, slug, tier: 'primary' })}
      className="block relative group overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${archetype.accent} 0%, ${archetype.accent}cc 100%)`,
        borderRadius: 'var(--radius-card)',
        padding: '28px 28px',
        color: '#FFFDF9',
      }}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.35em] uppercase opacity-80 mb-3">
            <span>Primary match · 主推荐</span>
            <span>· {match}%</span>
          </div>
          <p className="editorial-display text-2xl sm:text-[28px] leading-[1.2]">
            {meta.label}
          </p>
          <p className="mt-2 text-sm opacity-85">{meta.tagline}</p>
          <p className="mt-4 text-xs leading-[1.7] opacity-80 max-w-sm whitespace-pre-line">
            {archetype.deepDiveInvite}
          </p>
        </div>
        <div className="text-5xl sm:text-6xl leading-none" aria-hidden>
          {meta.emoji}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between text-xs tracking-[0.25em] uppercase opacity-90">
        <span>点此入场</span>
        <span className="inline-block transition-transform duration-500 group-hover:translate-x-1" aria-hidden>
          →
        </span>
      </div>
    </Link>
  );
}

function SecondaryDeepDive({ target, match, slug }: { target: DeepDiveTarget; match: number; slug: string }) {
  const meta = DEEP_DIVE_META[target];
  return (
    <Link
      href={meta.href}
      prefetch={false}
      onClick={() => trackFirstLook('first_look_deep_click', { target, match, slug, tier: 'secondary' })}
      className="block relative group p-5 transition-colors"
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-rule-soft)',
        borderRadius: 'var(--radius-card)',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-[10px] tracking-[0.3em] uppercase text-text-muted">
          Also for you · {match}%
        </span>
        <span className="text-xl" aria-hidden>{meta.emoji}</span>
      </div>
      <p className="editorial-display text-lg" style={{ color: 'var(--color-ink)' }}>
        {meta.label}
      </p>
      <p className="mt-1 text-xs text-text-muted">{meta.tagline}</p>
      <span
        className="absolute left-5 bottom-3 h-px w-6 transition-all duration-500 group-hover:w-16"
        style={{ background: meta.accent }}
      />
    </Link>
  );
}

// ─── Secondary actions ─────────────────────────────────────────────────────

function SecondaryActions({
  archetype,
  onSharePoster,
}: {
  archetype: FirstLookArchetype;
  onSharePoster: () => void;
}) {
  return (
    <section className="max-w-3xl mx-auto px-6 sm:px-10 pb-16">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          className="btn btn-ink text-sm"
          onClick={() => {
            trackFirstLook('first_look_share', {
              slug: archetype.slug,
              channel: 'poster',
              code: archetype.code,
              rarity: archetype.rarity,
            });
            onSharePoster();
          }}
        >
          下载分享海报
        </button>
        <Link
          href="/card/"
          prefetch={false}
          className="btn btn-ghost text-sm"
          onClick={() => trackFirstLook('first_look_share', { slug: archetype.slug, channel: 'card', code: archetype.code })}
        >
          保存到我的图鉴 →
        </Link>
        <Link
          href={`/cp/?from=${archetype.slug}`}
          prefetch={false}
          className="btn btn-ghost text-sm"
          onClick={() => trackFirstLook('first_look_share', { slug: archetype.slug, channel: 'cp', code: archetype.code })}
        >
          发给 TA 配对
        </Link>
        <button
          type="button"
          className="btn btn-ghost text-sm"
          onClick={() => {
            trackFirstLook('first_look_share', { slug: archetype.slug, channel: 'copy', code: archetype.code });
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              const url = typeof window !== 'undefined' ? window.location.href : '';
              const text = `我是 #${archetype.code} · ${archetype.name}（仅 ${archetype.holdRate}% 的人）— ${archetype.tagline}\n${url}`;
              navigator.clipboard.writeText(text).catch(() => undefined);
            }
          }}
        >
          复制分享文案
        </button>
      </div>
    </section>
  );
}

// ─── Universe detour ────────────────────────────────────────────────────────

function UniverseDetour({ slug }: { slug: string }) {
  const detourUniverseIds = ['xpti', 'cpti', 'flower', 'bird', 'banti', 'kings'] as const;
  const live = getLiveUniverses();
  const picks = detourUniverseIds
    .map(id => live.find(u => u.id === id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));

  return (
    <section className="max-w-3xl mx-auto px-6 sm:px-10 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <span className="serial-number text-xs">03</span>
        <span className="text-[10px] tracking-[0.35em] uppercase text-text-muted">
          也想看看别的宇宙？
        </span>
        <span className="h-px flex-1" style={{ background: 'var(--color-rule-soft)' }} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {picks.map(u => (
          <Link
            key={u.id}
            href={u.landingPath}
            prefetch={false}
            onClick={() => trackFirstLook('first_look_deep_click', { target: u.id, match: 0, slug, tier: 'detour', to_path: u.landingPath })}
            className="group relative block p-4 transition-colors"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-rule-soft)',
              borderRadius: 'var(--radius-card)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{u.emoji}</span>
              <span className="text-[10px] tracking-[0.25em] uppercase text-text-muted">
                {u.shortName}
              </span>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
              {u.name}
            </p>
            <span
              className="absolute left-4 bottom-2 h-px w-6 transition-all duration-500 group-hover:w-12"
              style={{ background: u.accent }}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

function FooterMeta() {
  return (
    <footer className="max-w-3xl mx-auto px-6 sm:px-10 pb-16 text-center">
      <p className="text-[10px] tracking-[0.35em] uppercase text-text-muted">
        WTFti · First Look · N° 00 · 2026
      </p>
      <p className="mt-3 text-xs text-text-muted">
        这只是初见。<Link href="/types/" prefetch={false} className="underline underline-offset-4">看完整图鉴</Link>·
        <Link href="/test/classic/" prefetch={false} className="underline underline-offset-4 ml-2">经典 SBTI 46 题</Link>
      </p>
    </footer>
  );
}

// Make archetype list available for static params generation (result page)
export const FIRST_LOOK_RESULT_SLUGS = FIRST_LOOK_ARCHETYPES.map(a => a.slug);
// Re-export withBasePath for consumer convenience (tree-shakeable)
export { withBasePath };
