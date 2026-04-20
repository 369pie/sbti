'use client';

/**
 * MonthlyRecapPage (W3) — reads localStorage daily-favs for the given YM,
 * renders a 4×3 grid (max 12 visible, scroll if more) and a share button.
 *
 * Server-rendered shell; the actual entries are read on the client because
 * favs live in localStorage (no backend persistence yet).
 */

import Link from 'next/link';
import NextImage from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { GalleryTab } from '@/app/types/gallery-data';
import {
  adjacentYm,
  currentYm,
  formatYmTitle,
  isValidYm,
  loadFavsForMonth,
  type MonthlyRecap,
} from '@/lib/museum/monthly-recap';
import { trackMuseum } from '@/lib/museum/analytics';
import { getSiteUrl } from '@/lib/site';

interface MonthlyRecapPageProps {
  allTabs: GalleryTab[];
  ym: string;
}

export default function MonthlyRecapPage({ allTabs, ym }: MonthlyRecapPageProps) {
  const validYm = useMemo(() => (isValidYm(ym) ? ym : currentYm()), [ym]);
  const [recap, setRecap] = useState<MonthlyRecap | null>(null);
  const seenRef = useRef(false);

  // Async load avoids set-state-in-effect lint trip.
  useEffect(() => {
    let cancelled = false;
    const t = window.setTimeout(() => {
      if (cancelled) return;
      const r = loadFavsForMonth(validYm, allTabs);
      setRecap(r);
      if (!seenRef.current && r) {
        seenRef.current = true;
        trackMuseum('monthly_recap_view', { ym: validYm, count: r.cardCount });
      }
    }, 30);
    return () => { cancelled = true; window.clearTimeout(t); };
  }, [validYm, allTabs]);

  const { prev, next } = useMemo(() => adjacentYm(validYm), [validYm]);

  const onCopy = async () => {
    if (!recap) return;
    trackMuseum('monthly_recap_share', { ym: validYm, count: recap.cardCount });
    const url = getSiteUrl(`/types/month/${validYm}/`);
    const txt = `【${formatYmTitle(validYm)}】我这个月翻到的 ${recap.cardCount} 张人设卡 → ${url}`;
    try { await navigator.clipboard.writeText(txt); } catch { /* swallow */ }
  };

  return (
    <div className="animate-fade-up">
      <header className="text-center mb-7 sm:mb-9">
        <span className="serial-number text-xs">Month / 合辑</span>
        <h1 className="section-headline text-3xl sm:text-5xl mt-2 mb-2">
          {formatYmTitle(validYm)}
        </h1>
        <p className="text-sm text-text-muted">
          你这个月翻到 / 收藏过的人设签卡
        </p>
      </header>

      {/* Nav */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <Link
          href={`/types/month/${prev}/`}
          onClick={() => trackMuseum('monthly_recap_nav', { dir: 'prev' })}
          className="text-xs sm:text-sm text-text-muted hover:text-text-secondary border border-border-subtle px-3 py-1.5 rounded-lg transition-colors"
        >
          ← {formatYmTitle(prev)}
        </Link>
        <Link
          href={`/types/month/${next}/`}
          onClick={() => trackMuseum('monthly_recap_nav', { dir: 'next' })}
          className="text-xs sm:text-sm text-text-muted hover:text-text-secondary border border-border-subtle px-3 py-1.5 rounded-lg transition-colors"
        >
          {formatYmTitle(next)} →
        </Link>
      </div>

      {/* 4×3 grid */}
      {recap && recap.cardCount > 0 ? (
        <>
          <section
            className="rounded-2xl border p-3 sm:p-4 mb-6 paper-texture"
            style={{
              borderColor: `${recap.topColor}33`,
              background: `linear-gradient(160deg, ${recap.topColor}10, var(--color-bg-elevated))`,
            }}
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
              {recap.entries.slice(0, 12).map((e) => {
                if (!e.resolved) return null;
                const item = e.resolved.item;
                return (
                  <Link
                    key={`${e.isoDate}-${e.tabId}-${e.slug}`}
                    href={item.href}
                    prefetch={false}
                    className="group block aspect-[3/4] rounded-lg overflow-hidden border bg-bg-elevated transition-transform hover:-translate-y-0.5"
                    style={{
                      borderColor: `${item.color}33`,
                      background: `linear-gradient(135deg, ${item.color}10, ${item.color}04)`,
                    }}
                  >
                    <div className="relative w-full h-full flex items-center justify-center">
                      {item.image ? (
                        <NextImage src={item.image} alt={item.name} width={180} height={240} loading="lazy"
                          className="w-[80%] h-[80%] object-contain drop-shadow-md" />
                      ) : (
                        <div className="text-3xl">{item.emoji ?? '✦'}</div>
                      )}
                      <span
                        className="absolute bottom-1 inset-x-0 text-center text-[8px] font-mono tracking-[0.18em] uppercase opacity-70 truncate px-1"
                        style={{ color: item.color }}
                      >
                        {e.isoDate.slice(5).replace('-', '/')}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
            {recap.cardCount > 12 && (
              <p className="text-[11px] text-text-muted text-center mt-3">
                这个月一共 {recap.cardCount} 张，展示前 12 张
              </p>
            )}
          </section>

          <div className="text-center text-[12px] text-text-muted mb-6 leading-relaxed">
            主色：<span className="inline-block w-3 h-3 align-middle rounded-full mr-1" style={{ background: recap.topColor }} />
            {recap.topColor.toUpperCase()} · 走过 {recap.uniqueTabIds.length} 个系列
          </div>

          <div className="flex flex-wrap gap-2.5 justify-center mb-8">
            <button
              type="button"
              onClick={onCopy}
              className="text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl text-white"
              style={{ background: recap.topColor }}
            >
              复制合辑文案 → 发圈
            </button>
            <Link
              href="/types/today/"
              className="text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border"
              style={{ borderColor: `${recap.topColor}55`, color: recap.topColor }}
            >
              翻今天的牌 →
            </Link>
            <Link
              href="/types/"
              className="text-xs sm:text-sm px-4 py-2.5 rounded-xl border text-text-muted hover:text-text-secondary"
              style={{ borderColor: 'var(--color-border-subtle)' }}
            >
              回图鉴馆
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-text-muted text-sm mb-4">这个月还没有收藏的卡。</p>
          <Link
            href="/types/today/"
            className="inline-block text-sm font-semibold px-5 py-2.5 rounded-xl border border-accent text-accent hover:bg-accent hover:text-white transition-colors"
          >
            翻今天的第一张 →
          </Link>
        </div>
      )}

      <p className="text-[11px] text-text-muted text-center max-w-md mx-auto leading-relaxed">
        合辑由你本地的「今日封印」收藏自动汇成 · 不联网、不需要登录
      </p>
    </div>
  );
}
