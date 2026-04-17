'use client';

/**
 * Daily Gacha page (E-04) — /gacha/
 *
 * Once-per-day draw, weighted rarity, writes to localStorage and echoes into
 * WTF Card progress for the drawn universe.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ASSET_SYNC_EVENT } from '@/lib/assets/asset-contract';
import {
  canDrawToday, drawGacha, getGachaHistory, getGachaRarityStyle,
  type GachaResult,
} from '@/lib/gacha';
import { recordUniverseResult } from '@/lib/wtf-card';

export default function GachaContent() {
  const [latest, setLatest] = useState<GachaResult | null>(null);
  const [history, setHistory] = useState<GachaResult[]>([]);
  const [available, setAvailable] = useState(false);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    const refreshState = () => {
      const nextHistory = getGachaHistory();
      setHistory(nextHistory);
      setLatest(nextHistory[0] ?? null);
      setAvailable(canDrawToday());
    };

    refreshState();
    window.addEventListener(ASSET_SYNC_EVENT, refreshState);
    return () => window.removeEventListener(ASSET_SYNC_EVENT, refreshState);
  }, []);

  const onDraw = useCallback(() => {
    if (!canDrawToday()) return;
    setFlipping(true);
    setTimeout(() => {
      const r = drawGacha();
      if (r) {
        setLatest(r);
        setHistory(getGachaHistory());
        setAvailable(false);
        // Echo into WTF Card so it shows up in /card (E-04 S-04.3)
        try { recordUniverseResult(r.universeId, r.slug); } catch { /* ignore */ }
      }
      setFlipping(false);
    }, 700);
  }, []);

  return (
    <div className="min-h-screen">
      <section className="max-w-xl mx-auto px-6 pt-16 pb-12 text-center">
        <span className="inline-block text-xs font-mono tracking-[0.25em] text-text-muted mb-2 uppercase">
          Daily Gacha · 今日抽签
        </span>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-4">
          今天的宇宙，<br />会给你什么？
        </h1>
        <p className="text-text-secondary mt-4 text-sm">
          每天一抽 · 稀有度权重：S 1% · A 4% · B 15% · C 35% · D 45%
        </p>
      </section>

      <section className="max-w-sm mx-auto px-6 pb-12">
        <div
          className="aspect-[3/4] rounded-3xl border border-border-subtle relative overflow-hidden flex items-center justify-center"
          style={{
            background: latest
              ? `radial-gradient(ellipse at top, ${getGachaRarityStyle(latest.rarity).glow}, transparent 70%)`
              : 'linear-gradient(160deg, rgba(244,114,182,0.06), rgba(167,139,250,0.06))',
            transform: flipping ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 700ms cubic-bezier(.7,.1,.3,1)',
            transformStyle: 'preserve-3d',
          }}
        >
          {latest ? (
            <div className="text-center px-6" style={{ backfaceVisibility: 'hidden' }}>
              <div className="text-7xl mb-4">{latest.universeEmoji}</div>
              <div
                className="inline-block px-3 py-1 rounded-full text-xs font-mono mb-4"
                style={{
                  color: getGachaRarityStyle(latest.rarity).color,
                  background: getGachaRarityStyle(latest.rarity).glow,
                  border: `1px solid ${getGachaRarityStyle(latest.rarity).color}`,
                }}
              >
                {getGachaRarityStyle(latest.rarity).label}
              </div>
              <div className="text-xl font-semibold text-text-primary">{latest.universeName}</div>
              <div className="text-sm text-text-secondary mt-1">类型 · {latest.slug.toUpperCase()}</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-6xl opacity-60">🎴</div>
              <div className="text-sm text-text-muted mt-4">点一下翻开今天的卡</div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onDraw}
          disabled={!available || flipping}
          className="mt-8 w-full py-4 rounded-2xl font-medium transition disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-pink-400 to-violet-400 text-white shadow-lg"
        >
          {available ? '翻开今日卡 ✧' : '今天已经抽过了 · 明天再来'}
        </button>

        {latest && (
          <Link
            href={`/wtfti/${latest.universeId === 'standard' ? '' : latest.universeId + '/'}test/`}
            className="block mt-3 w-full py-3 rounded-2xl font-medium text-center text-sm border border-border-subtle text-text-primary hover:bg-bg-elevated"
          >
            去测「{latest.universeName}」→
          </Link>
        )}
      </section>

      <section className="max-w-xl mx-auto px-6 pb-24">
        <h2 className="text-xs font-mono tracking-wider text-text-muted uppercase mb-3">历史 · 最近 20 抽</h2>
        <div className="grid grid-cols-4 gap-2">
          {history.slice(0, 20).map((r, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl border flex flex-col items-center justify-center"
              style={{
                borderColor: getGachaRarityStyle(r.rarity).color,
                background: getGachaRarityStyle(r.rarity).glow,
              }}
              title={`${r.universeName} · ${r.slug} · ${r.drawnAt.slice(0, 10)}`}
            >
              <span className="text-2xl">{r.universeEmoji}</span>
              <span className="text-[9px] font-mono mt-1" style={{ color: getGachaRarityStyle(r.rarity).color }}>
                {r.rarity}
              </span>
            </div>
          ))}
          {history.length === 0 && (
            <div className="col-span-4 text-center text-xs text-text-muted py-8">
              还没有任何抽取记录
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
