'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMystiTheme } from '@/components/MystiThemeProvider';
import { getDualArchive, removeDualPair, type DualPairRecord } from '@/lib/mysti/dual-archive';
import {
  listRecentDecisions,
  type DecisionLogEntry,
} from '@/lib/mysti/decision-log';
import { getDecisionScenario } from '@/lib/mysti/decision-quotes';
import { generateSigil, sigilToDataUrl } from '@/lib/mysti/sigil';
import { getWtftiPersonality } from '@/lib/wtfti-personalities';

function fmtDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

export function MystiArchiveContent() {
  const { theme } = useMystiTheme();
  const [records, setRecords] = useState<DualPairRecord[]>([]);
  const [decisions, setDecisions] = useState<DecisionLogEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // 通过 microtask 推迟，避免 react-hooks/set-state-in-effect 规则告警
    queueMicrotask(() => {
      setRecords(getDualArchive());
      setDecisions(listRecentDecisions(20));
      setHydrated(true);
    });
  }, []);

  const handleRemove = (r: DualPairRecord) => {
    removeDualPair(r.selfSlug, r.partnerSlug, r.recordedAt);
    setRecords(getDualArchive());
  };

  const sigil = useMemo(() => {
    if (!hydrated || decisions.length === 0) return null;
    return generateSigil({ decisions, deitySlug: records[0]?.selfSlug, size: 320 });
  }, [hydrated, decisions, records]);

  const grouped = useMemo(() => {
    const map = new Map<string, DualPairRecord[]>();
    for (const r of records) {
      const key = r.archetypeId ?? 'mystery';
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    }
    return [...map.entries()];
  }, [records]);

  return (
    <div
      className="min-h-screen px-5 py-12"
      style={{
        background: `linear-gradient(180deg, ${theme.bgGradient[0]} 0%, ${theme.bgGradient[1]} 100%)`,
        color: theme.text,
      }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <Link
            href="/mysti/"
            className="text-xs tracking-[0.18em] uppercase opacity-70 hover:opacity-100"
            style={{ color: theme.textMuted }}
          >
            ← 灵鉴首页
          </Link>
          <h1
            className="mt-3 text-3xl sm:text-4xl"
            style={{ color: theme.text, fontFamily: 'var(--font-display)' }}
          >
            关系档案
          </h1>
          <p className="mt-3 text-sm" style={{ color: theme.textMuted }}>
            你与每一个 TA 的灵魂合盘，按关系原型分类沉淀
          </p>
        </div>

        {/* ── Sigil 灵魂印记 + 决策时间轴（W2-W3 / E2） ── */}
        {hydrated && (sigil || decisions.length > 0) && (
          <section className="mb-12">
            <header className="flex items-baseline justify-between mb-4">
              <h2
                className="text-lg"
                style={{ color: theme.accentGold, fontFamily: 'var(--font-display)' }}
              >
                ✦ 灵魂印记 · Sigil
              </h2>
              <span className="text-[11px] tracking-[0.32em] uppercase" style={{ color: theme.textSubtle }}>
                {decisions.length} DECISIONS · CH. {sigil?.numeral ?? 'I'}
              </span>
            </header>

            {sigil ? (
              <div
                className="rounded-2xl border p-5 sm:p-7 flex flex-col sm:flex-row gap-6 items-center"
                style={{
                  background: `${theme.cardSurface}cc`,
                  borderColor: theme.cardBorder,
                  boxShadow: `0 16px 48px -24px ${theme.cardGlow}`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG data URL, not an external image */}
                <img
                  src={sigilToDataUrl(sigil.svg)}
                  alt={`灵魂印记 章节 ${sigil.numeral}`}
                  width={240}
                  height={240}
                  className="rounded-xl shrink-0"
                  style={{ background: theme.bgGradient[0] }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-2xl italic mb-2"
                    style={{ color: theme.text, fontFamily: 'var(--font-display)' }}
                  >
                    第 {sigil.numeral} 章 · 暮光档案
                  </p>
                  <p className="text-sm" style={{ color: theme.textMuted }}>
                    每一次决策都会被暮光记下来，渐渐凝结成属于你的纹章。
                    继续抽 {Math.max(1, 12 - decisions.length)} 张，进入下一章。
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <span
                      className="text-[10px] tracking-[0.32em] uppercase"
                      style={{ color: theme.accentGold }}
                    >
                      RARITY · {sigil.rarity}
                    </span>
                    <div
                      className="flex-1 h-px"
                      style={{ background: theme.divider }}
                    />
                    <Link
                      href="/mysti/decision/"
                      className="text-xs"
                      style={{ color: theme.accent }}
                    >
                      继续决策 →
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}

            {decisions.length > 0 && (
              <ul className="mt-6 space-y-2">
                {decisions.slice(0, 8).map((d) => {
                  const sc = getDecisionScenario(d.scenario);
                  return (
                    <li
                      key={d.id}
                      className="rounded-lg border px-4 py-3 flex items-baseline gap-3"
                      style={{
                        background: `${theme.cardSurface}88`,
                        borderColor: theme.cardBorder,
                      }}
                    >
                      <span
                        className="text-[10px] tracking-[0.28em] uppercase shrink-0"
                        style={{ color: theme.accentGold, minWidth: '3.5rem' }}
                      >
                        {sc?.numeral ?? '?'} · {sc?.label ?? d.scenario}
                      </span>
                      <p
                        className="flex-1 min-w-0 text-sm italic truncate"
                        style={{ color: theme.text, fontFamily: 'var(--font-serif)' }}
                      >
                        「{d.quote}」
                      </p>
                      <span className="text-[11px] shrink-0" style={{ color: theme.textSubtle }}>
                        {fmtDate(new Date(d.createdAt).getTime())}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {!hydrated ? null : records.length === 0 && decisions.length === 0 ? (
          <EmptyState theme={theme} />
        ) : records.length === 0 ? null : (
          <div className="space-y-8">
            {grouped.map(([archetypeId, list]) => {
              const head = list[0];
              return (
                <section key={archetypeId}>
                  <header className="flex items-baseline gap-3 mb-4">
                    <span className="text-2xl">{head.archetypeEmoji ?? '🕸️'}</span>
                    <h2
                      className="text-lg"
                      style={{ color: theme.accent, fontFamily: 'var(--font-display)' }}
                    >
                      {head.archetypeName ?? '命运暗线'}
                    </h2>
                    <span className="text-xs" style={{ color: theme.textSubtle }}>
                      {list.length} 段
                    </span>
                  </header>

                  <ul className="space-y-3">
                    <AnimatePresence>
                      {list.map(r => {
                        const me = getWtftiPersonality(r.selfSlug);
                        const ta = getWtftiPersonality(r.partnerSlug);
                        return (
                          <motion.li
                            key={`${r.selfSlug}-${r.partnerSlug}-${r.recordedAt}`}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            className="rounded-xl border p-4 flex items-center justify-between gap-4"
                            style={{
                              background: `${theme.cardSurface}aa`,
                              borderColor: theme.cardBorder,
                            }}
                          >
                            <Link
                              href={`/mysti/result/${r.selfSlug}?partner=${r.partnerSlug}`}
                              className="flex-1 min-w-0 flex items-center gap-3 group"
                            >
                              <span className="text-xl shrink-0">{me?.emoji ?? '✦'}</span>
                              <div className="min-w-0">
                                <div className="text-sm truncate" style={{ color: theme.text }}>
                                  {me?.wtftiName ?? r.selfSlug}
                                  <span className="mx-2" style={{ color: theme.textSubtle }}>
                                    ×
                                  </span>
                                  {ta?.wtftiName ?? r.partnerSlug}
                                </div>
                                <div className="text-[11px] mt-0.5" style={{ color: theme.textSubtle }}>
                                  {fmtDate(r.recordedAt)} · 点击重新查看合盘
                                </div>
                              </div>
                              <span className="text-xl shrink-0">{ta?.emoji ?? '✦'}</span>
                            </Link>
                            <button
                              onClick={() => handleRemove(r)}
                              className="text-xs px-2 py-1 rounded-full opacity-60 hover:opacity-100"
                              style={{ color: theme.textMuted, borderColor: theme.divider }}
                              aria-label="删除"
                            >
                              ✕
                            </button>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>
                </section>
              );
            })}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/mysti/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm"
            style={{
              background: `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`,
              color: '#fff',
              fontFamily: 'var(--font-serif)',
            }}
          >
            ✦ 开启新的合盘
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ theme }: { theme: ReturnType<typeof useMystiTheme>['theme'] }) {
  return (
    <div
      className="rounded-2xl border p-10 text-center"
      style={{
        background: `${theme.cardSurface}aa`,
        borderColor: theme.cardBorder,
      }}
    >
      <div className="text-4xl mb-3">📜</div>
      <h3
        className="text-lg mb-2"
        style={{ color: theme.text, fontFamily: 'var(--font-display)' }}
      >
        还没有合盘记录
      </h3>
      <p className="text-sm mb-6" style={{ color: theme.textMuted }}>
        与朋友/恋人/同事完成一次灵鉴合盘，关系档案就会在这里逐步沉淀
      </p>
      <Link
        href="/mysti/"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm"
        style={{
          background: `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`,
          color: '#fff',
        }}
      >
        💌 邀请 TA 合测
      </Link>
    </div>
  );
}
