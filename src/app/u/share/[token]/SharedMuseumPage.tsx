'use client';

/**
 * SharedMuseumPage (W5) — read-only render of a snapshot decoded from URL.
 */

import Link from 'next/link';
import NextImage from 'next/image';
import { useEffect, useMemo, useRef } from 'react';
import type { GalleryTab } from '@/app/types/gallery-data';
import { resolveSnapshot, type MuseumSnapshot } from '@/lib/museum/share-snapshot';
import { trackMuseum } from '@/lib/museum/analytics';

interface SharedMuseumPageProps {
  allTabs: GalleryTab[];
  snapshot: MuseumSnapshot;
}

export default function SharedMuseumPage({ allTabs, snapshot }: SharedMuseumPageProps) {
  const resolved = useMemo(() => resolveSnapshot(snapshot, allTabs), [snapshot, allTabs]);
  const seenRef = useRef(false);

  useEffect(() => {
    if (seenRef.current) return;
    seenRef.current = true;
    trackMuseum('snapshot_view', { total_unlocked: snapshot.unlockedKeys.length });
  }, [snapshot.unlockedKeys.length]);

  const who = snapshot.name?.trim() || '某位馆主';
  const created = useMemo(() => {
    try {
      const d = new Date(snapshot.createdAt);
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    } catch { return ''; }
  }, [snapshot.createdAt]);

  const visible = resolved.unlocked.slice(0, 12);
  const more = Math.max(0, resolved.unlocked.length - visible.length);

  return (
    <div className="animate-fade-up">
      <header className="text-center mb-7 sm:mb-9">
        <span className="serial-number text-xs">Snapshot · 卡册快照</span>
        <h1 className="section-headline text-3xl sm:text-5xl mt-2 mb-2">
          {who}的图鉴馆
        </h1>
        <p className="text-sm text-text-muted">
          解锁 {resolved.unlocked.length} 张 · 走过 {resolved.tabsTouched.length} 个系列{created ? ` · ${created}` : ''}
        </p>
      </header>

      {/* Tabs touched */}
      {resolved.tabsTouched.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5 mb-6">
          {resolved.tabsTouched.map((tab) => (
            <span
              key={tab.id}
              className="text-[10px] font-mono tracking-[0.18em] uppercase px-2 py-0.5 rounded-full"
              style={{ background: `${tab.accent}15`, color: tab.accent }}
            >
              {tab.emoji} {tab.label}
            </span>
          ))}
        </div>
      )}

      {/* Card grid */}
      {visible.length > 0 ? (
        <section className="rounded-2xl border bg-bg-elevated p-3 sm:p-4 mb-6 paper-texture" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
            {visible.map(({ tab, item }) => (
              <Link
                key={`${tab.id}:${item.slug}`}
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
                  <span className="absolute bottom-0 inset-x-0 text-center text-[8px] font-mono tracking-widest py-0.5 truncate" style={{ background: 'rgba(255,253,249,0.85)', color: item.color }}>
                    {item.code}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {more > 0 && (
            <p className="text-[11px] text-text-muted text-center mt-3">
              还有 {more} 张未展示 · 去图鉴馆看完整版 →
            </p>
          )}
        </section>
      ) : (
        <p className="text-center text-text-muted text-sm py-8">这份快照里还没有解锁任何卡。</p>
      )}

      {/* Favs */}
      {resolved.favs.length > 0 && (
        <section className="mb-7">
          <h3 className="text-sm font-semibold mb-2 text-text-secondary" style={{ fontFamily: 'var(--font-serif)' }}>收藏的日签</h3>
          <div className="flex flex-wrap gap-1.5">
            {resolved.favs.map(({ tab, item }) => (
              <Link
                key={`fav-${tab.id}:${item.slug}`}
                href={item.href}
                prefetch={false}
                className="text-[11px] font-mono tracking-wider px-2 py-1 rounded-full border"
                style={{ borderColor: `${item.color}55`, color: item.color, background: `${item.color}08` }}
              >
                {item.emoji ?? '✦'} {item.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="flex flex-wrap gap-2.5 justify-center">
        <Link
          href="/types/today/"
          onClick={() => trackMuseum('snapshot_visit_museum', { source: 'today' })}
          className="text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-accent text-accent hover:bg-accent hover:text-white transition-colors"
        >
          翻今天的牌 →
        </Link>
        <Link
          href="/types/"
          onClick={() => trackMuseum('snapshot_visit_museum', { source: 'gallery' })}
          className="text-xs sm:text-sm px-4 py-2.5 rounded-xl border text-text-muted hover:text-text-secondary"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          去图鉴馆造一份我的
        </Link>
      </div>

      <p className="mt-6 text-[11px] text-text-muted text-center max-w-md mx-auto leading-relaxed">
        这份快照只在链接里 · 没有上传服务器 · 馆主之后改了图鉴，这里仍是当时那一份
      </p>
    </div>
  );
}
