'use client';

/**
 * CpPairPage (W3) — client view of a CP pairing.
 *
 * If `slugs` is invalid we render a "build your own" picker; otherwise
 * we render the deterministic CP card + roast + share/invite/swap CTAs.
 */

import Link from 'next/link';
import NextImage from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GalleryTab } from '@/app/types/gallery-data';
import { decodePairSlug, encodePairSlug, generateCpPair, lookupItem, type CpPair } from '@/lib/museum/cp-pair';
import { trackMuseum } from '@/lib/museum/analytics';
import { getSiteUrl } from '@/lib/site';

interface CpPairPageProps {
  allTabs: GalleryTab[];
  slugs: string;
}

export default function CpPairPage({ allTabs, slugs }: CpPairPageProps) {
  const decoded = useMemo(() => decodePairSlug(slugs), [slugs]);
  const pair = useMemo<CpPair | null>(
    () => (decoded ? generateCpPair(allTabs, decoded) : null),
    [decoded, allTabs],
  );

  const aLookup = useMemo(
    () => (pair ? lookupItem(allTabs, pair.key.tabA, pair.key.slugA) : null),
    [pair, allTabs],
  );
  const bLookup = useMemo(
    () => (pair ? lookupItem(allTabs, pair.key.tabB, pair.key.slugB) : null),
    [pair, allTabs],
  );

  // Impression tracking
  const seenRef = useRef(false);
  useEffect(() => {
    if (!pair || seenRef.current) return;
    seenRef.current = true;
    trackMuseum('cp_pair_view', {
      tab: `${pair.key.tabA}|${pair.key.tabB}`,
      slug: `${pair.key.slugA}|${pair.key.slugB}`,
    });
  }, [pair]);

  const [copied, setCopied] = useState<'invite' | 'share' | null>(null);
  const onShareLink = useCallback(async () => {
    if (!pair) return;
    const url = getSiteUrl(`/types/cp/${pair.pairSlug}/`);
    trackMuseum('cp_pair_invite');
    try {
      if (navigator.share) {
        await navigator.share({ title: `${pair.name} — ${pair.kicker}`, url });
        return;
      }
    } catch {
      /* fall through */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied('invite');
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      /* swallow */
    }
  }, [pair]);

  const onCopyText = useCallback(async () => {
    if (!pair) return;
    trackMuseum('cp_pair_share');
    const url = getSiteUrl(`/types/cp/${pair.pairSlug}/`);
    const txt = `【${pair.name}】${pair.kicker}\n${pair.roast.join('\n')}\n→ ${url}`;
    try {
      await navigator.clipboard.writeText(txt);
      setCopied('share');
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      /* swallow */
    }
  }, [pair]);

  const onSwap = useCallback(() => {
    if (!pair) return;
    trackMuseum('cp_pair_swap');
    const swapped = encodePairSlug({
      tabA: pair.key.tabB, slugA: pair.key.slugB,
      tabB: pair.key.tabA, slugB: pair.key.slugA,
    });
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/types/cp/${swapped}/`);
    }
  }, [pair]);

  if (!pair || !aLookup || !bLookup) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl sm:text-3xl section-headline mb-3">还没选好两张卡</h1>
        <p className="text-sm text-text-muted mb-6">回到图鉴馆，挑两张你喜欢的卡再来配一下。</p>
        <Link
          href="/types/"
          className="inline-block text-sm font-semibold px-5 py-2.5 rounded-xl border border-accent text-accent hover:bg-accent hover:text-bg-primary transition-colors"
        >
          ← 回图鉴馆
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <header className="text-center mb-7 sm:mb-9">
        <span className="serial-number text-xs">CP / 配对</span>
        <h1
          className="text-3xl sm:text-5xl mt-3 mb-3 section-headline gradient-text"
          style={{
            backgroundImage: `linear-gradient(135deg, ${pair.palette.from}, ${pair.palette.to})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {pair.name}
        </h1>
        <p className="text-base sm:text-lg text-text-secondary mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
          {pair.kicker}
        </p>
        <span
          className="inline-block text-[11px] font-mono tracking-[0.2em] uppercase px-2.5 py-1 rounded-full border"
          style={{ borderColor: `${pair.palette.from}55`, color: pair.palette.from }}
        >
          {pair.tag}
        </span>
      </header>

      {/* Two cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 mb-6 sm:mb-8">
        {[aLookup, bLookup].map((entry, i) => {
          const item = entry.item;
          const tab = entry.tab;
          return (
            <Link
              key={`${tab.id}:${item.slug}`}
              href={item.href}
              prefetch={false}
              className="group rounded-2xl border overflow-hidden bg-bg-elevated hover:-translate-y-1 transition-transform"
              style={{
                borderColor: `${item.color}33`,
                background: `linear-gradient(160deg, ${item.color}1a, ${item.color}06)`,
              }}
            >
              <div className="relative aspect-[3/4] flex items-center justify-center">
                {item.image ? (
                  <NextImage
                    src={item.image}
                    alt={item.name}
                    width={320}
                    height={420}
                    priority={i === 0}
                    className="w-[78%] h-[78%] object-contain drop-shadow-lg"
                  />
                ) : (
                  <div className="text-6xl">{item.emoji ?? '✦'}</div>
                )}
                <span
                  className="absolute top-2.5 left-2.5 text-[10px] font-mono tracking-[0.18em] uppercase px-2 py-0.5 rounded-full"
                  style={{ background: `${item.color}1a`, color: item.color }}
                >
                  {tab.emoji} {tab.label}
                </span>
              </div>
              <div className="px-3 sm:px-4 py-2.5 sm:py-3">
                <span className="text-[10px] font-mono tracking-widest opacity-70 block" style={{ color: item.color }}>
                  {item.code}
                </span>
                <h3 className="text-sm sm:text-base font-semibold truncate" style={{ fontFamily: 'var(--font-serif)' }}>
                  {item.name}
                </h3>
                <p className="text-[11px] text-text-muted truncate mt-0.5">{item.tagline}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Roast */}
      <section className="rounded-2xl border bg-bg-elevated px-5 sm:px-7 py-5 sm:py-7 mb-6 sm:mb-8 paper-texture" style={{ borderColor: `${pair.palette.from}33` }}>
        <span className="serial-number text-xs">三句锐评</span>
        <ol className="mt-3 space-y-2.5 text-sm sm:text-base leading-relaxed text-text-primary" style={{ fontFamily: 'var(--font-serif)' }}>
          {pair.roast.map((line, i) => (
            <li key={i} className="flex gap-2">
              <span className="flex-shrink-0 w-5 text-text-muted font-mono text-xs">{i + 1}.</span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* CTAs */}
      <div className="flex flex-wrap gap-2.5 justify-center mb-8">
        <button
          type="button"
          onClick={onCopyText}
          className="text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border transition-colors"
          style={{ background: pair.palette.from, color: 'var(--color-bg-primary)', borderColor: pair.palette.from }}
        >
          {copied === 'share' ? '已复制 ✓' : '复制锐评 → 发圈'}
        </button>
        <button
          type="button"
          onClick={onShareLink}
          className="text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border transition-colors"
          style={{ borderColor: `${pair.palette.from}55`, color: pair.palette.from, background: 'transparent' }}
        >
          {copied === 'invite' ? '链接已复制 ✓' : '邀闺蜜来看 ↗'}
        </button>
        <button
          type="button"
          onClick={onSwap}
          className="text-xs sm:text-sm px-4 py-2.5 rounded-xl border text-text-muted hover:text-text-secondary transition-colors"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          ⇄ 交换位置
        </button>
        <Link
          href="/types/"
          className="text-xs sm:text-sm px-4 py-2.5 rounded-xl border text-text-muted hover:text-text-secondary transition-colors"
        >
          换两张试试
        </Link>
      </div>

      <p className="text-[11px] text-text-muted text-center max-w-md mx-auto leading-relaxed">
        CP 名与锐评由两张卡的 slug 派生 · 同一对永远是同一份 · 没有付费、没有抽卡
      </p>
    </div>
  );
}
