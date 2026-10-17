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
    queueMicrotask(() => {
      setStored(loadFirstLookResult());
      setReady(true);
    });
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
      <NextStepToday slug={slug} />
      <SoftDeepLinks deepDive={deepDive} slug={slug} sessionReady={ready} />
      <SecondaryActions archetype={archetype} onSharePoster={() => shareRef.current?.download()} />
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


// ─── P1 single next step (refocus §5.1) ─────────────────────────────────────

function NextStepToday({ slug }: { slug: string }) {
  return (
    <section className="max-w-3xl mx-auto px-6 sm:px-10 py-14">
      <div className="text-center mb-8">
        <span className="serial-number text-xs mr-2">02</span>
        <span className="text-[10px] tracking-[0.35em] uppercase text-text-muted">
          Next · 下一步
        </span>
      </div>
      <Link
        href="/today/"
        prefetch={false}
        onClick={() => trackFirstLook('first_look_deep_click', { target: 'today', match: 100, slug, tier: 'primary' })}
        className="block text-center group"
        style={{
          background: 'var(--color-ink)',
          color: 'var(--color-paper)',
          borderRadius: '999px',
          padding: '18px 28px',
          fontSize: 16,
          letterSpacing: '0.04em',
        }}
      >
        明天来看你的第一张今日卡
        <span className="inline-block ml-2 transition-transform group-hover:translate-x-1" aria-hidden>→</span>
      </Link>
      <p className="mt-4 text-center text-sm text-text-muted">
        <Link
          href="/today/#remind"
          prefetch={false}
          className="underline underline-offset-4"
          onClick={() => trackFirstLook('first_look_deep_click', { target: 'today_remind', match: 0, slug, tier: 'secondary' })}
        >
          开启提醒，明天叫我一声
        </Link>
      </p>
    </section>
  );
}

function SoftDeepLinks({
  deepDive,
  slug,
  sessionReady,
}: {
  deepDive: Array<{ target: DeepDiveTarget; match: number }>;
  slug: string;
  sessionReady: boolean;
}) {
  if (!sessionReady || deepDive.length === 0) return null;
  return (
    <section className="max-w-3xl mx-auto px-6 sm:px-10 pb-8">
      <p className="text-center text-[11px] tracking-[0.28em] uppercase text-text-muted mb-4">
        想继续深挖也可以
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {deepDive.map((d) => {
          const meta = DEEP_DIVE_META[d.target];
          return (
            <Link
              key={d.target}
              href={meta.href}
              prefetch={false}
              onClick={() => trackFirstLook('first_look_deep_click', { target: d.target, match: d.match, slug, tier: 'soft' })}
              className="text-sm underline underline-offset-4 text-text-secondary"
            >
              {meta.label}
            </Link>
          );
        })}
      </div>
    </section>
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
