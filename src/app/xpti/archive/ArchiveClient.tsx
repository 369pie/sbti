'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { basePath } from '@/lib/site';
import { trackFunnelEvent } from '@/lib/analytics/funnel';
import { ITC_AXES } from '@/lib/xpti/itc';
import { dimsToSignature } from '@/lib/xpti/couple';
import { loadXptiHistory, type XptiStoredResult } from '@/lib/xpti/storage';
import { XPTI_PERSONALITY_TYPES } from '@/lib/xpti/personalities';
import { CoupleRadar } from '@/components/xpti/CoupleRadar';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { buildResourceId } from '@/lib/payments/skus';

const display = '"Cormorant Garamond", "Noto Serif SC", serif';
const mono = '"SF Mono", ui-monospace, "Menlo", monospace';
const PALETTE = {
  paper: '#F5F0E8',
  ink: '#1F1A16',
  inkMute: '#5B524B',
  rule: '#D6CDBE',
  rose: '#A85A6E',
  wine: '#6A2A3E',
  gold: '#C9A676',
};

const ARCHIVE_RESOURCE = buildResourceId('xpti', 'archive-yearly');
const ARCHIVE_SKU = 'xpti-archive-yearly' as const;

export function ArchiveClient() {
  // Lazy init avoids react-hooks/set-state-in-effect: read history once on
  // first render (client only). SSR returns empty and we hydrate via the
  // effect below using a microtask.
  const [history, setHistory] = useState<XptiStoredResult[]>(() =>
    typeof window === 'undefined' ? [] : loadXptiHistory()
  );

  useEffect(() => {
    // Re-hydrate (defensive) and fire analytics. Wrapped in microtask so the
    // setState happens outside the synchronous effect body.
    queueMicrotask(() => {
      setHistory(loadXptiHistory());
    });
    trackFunnelEvent('archive_replay', { module: 'xpti' });
  }, []);

  return (
    <main style={{ background: PALETTE.paper, color: PALETTE.ink, minHeight: '100vh' }}>
      <header style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px 24px' }}>
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.42em', color: PALETTE.rose, textTransform: 'uppercase' }}>
          XPTI · Archive
        </div>
        <h1 style={{ fontFamily: display, fontWeight: 500, fontSize: 'clamp(34px, 5vw, 54px)', lineHeight: 1.1, margin: '14px 0 8px', letterSpacing: '-0.01em' }}>
          张力档案
          <span style={{ display: 'block', fontStyle: 'italic', color: PALETTE.wine, fontSize: '0.5em', marginTop: 6 }}>
            Tension Archive · Replay & Compare
          </span>
        </h1>
        <p style={{ ...pStyle, maxWidth: 560 }}>
          每一次复测都被存进这里。隔几个月重测一次，你会看到自己在三条张力上的真实位移——
          有时只是发现「原来今年我更想被带着走了」。
        </p>
      </header>

      {history.length === 0 && <EmptyView />}
      {history.length === 1 && <SingleEntryView item={history[0]} />}
      {history.length >= 2 && <CompareView history={history} />}
    </main>
  );
}

function EmptyView() {
  return (
    <section style={cardWrap}>
      <p style={pStyle}>你还没有任何 XPTI 测试记录。先做一次测试，下次复测时就能看到对照轨迹了。</p>
      <Link href={`${basePath}/xpti/test/`} style={ctaPrimary}>开始 XPTI 测试 →</Link>
    </section>
  );
}

function SingleEntryView({ item }: { item: XptiStoredResult }) {
  const archetype = XPTI_PERSONALITY_TYPES.find((p) => p.slug === item.slug);
  const sig = dimsToSignature(item.dims);
  return (
    <section style={cardWrap}>
      <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.32em', color: PALETTE.gold, textTransform: 'uppercase' }}>
        Latest · {formatDate(item.finishedAt)}
      </div>
      <h2 style={h2Style}>{archetype?.name ?? item.slug}</h2>
      <p style={{ ...pStyle, marginTop: 4, color: PALETTE.wine, fontFamily: display, fontStyle: 'italic', fontSize: 18 }}>
        {sig.label}
      </p>
      <p style={pStyle}>
        当你下次再做一次 XPTI 时，这里会出现「上次 vs 这次」的对照雷达和轨迹分析。
      </p>
      <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
        <Link href={`${basePath}/xpti/test/`} style={ctaPrimary}>立即复测 →</Link>
        <Link href={`${basePath}/xpti/result/${item.slug}/`} style={ctaSecondary}>← 回到我的结果</Link>
      </div>
    </section>
  );
}

function CompareView({ history }: { history: XptiStoredResult[] }) {
  const sorted = useMemo(() => [...history].sort((a, b) => a.finishedAt - b.finishedAt), [history]);
  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];

  const previousArch = XPTI_PERSONALITY_TYPES.find((p) => p.slug === previous.slug) ?? XPTI_PERSONALITY_TYPES[0];
  const latestArch = XPTI_PERSONALITY_TYPES.find((p) => p.slug === latest.slug) ?? XPTI_PERSONALITY_TYPES[0];
  const prevSig = dimsToSignature(previous.dims);
  const latestSig = dimsToSignature(latest.dims);

  return (
    <section style={{ ...cardWrap, paddingBottom: 96 }}>
      {/* Two stamp dates */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.32em', color: PALETTE.rose, textTransform: 'uppercase' }}>
            Then · {formatDate(previous.finishedAt)}
          </div>
          <h3 style={{ ...h2Style, fontSize: 22, color: PALETTE.rose }}>{previousArch.name}</h3>
        </div>
        <div style={{ fontFamily: display, fontStyle: 'italic', fontSize: 18, color: PALETTE.gold }}>vs</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.32em', color: PALETTE.wine, textTransform: 'uppercase' }}>
            Now · {formatDate(latest.finishedAt)}
          </div>
          <h3 style={{ ...h2Style, fontSize: 22, color: PALETTE.wine }}>{latestArch.name}</h3>
        </div>
      </div>

      {/* Overlay radar */}
      <div style={{ marginTop: 28 }}>
        <CoupleRadar
          inviter={{ archetype: { name: '上次', slug: previous.slug, color: PALETTE.rose }, dims: previous.dims }}
          partner={{ archetype: { name: '这次', slug: latest.slug, color: PALETTE.wine }, dims: latest.dims }}
        />
      </div>

      {/* Signature delta per axis */}
      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.32em', color: PALETTE.inkMute, textTransform: 'uppercase' }}>
          Signature Delta
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 14, display: 'grid', gap: 10 }}>
          {ITC_AXES.map((axis) => {
            const prev = prevSig[axis.id];
            const now = latestSig[axis.id];
            const moved = prev !== now;
            return (
              <li
                key={axis.id}
                style={{
                  padding: '12px 16px',
                  borderLeft: `3px solid ${moved ? axis.color : PALETTE.rule}`,
                  background: moved ? `${axis.color}10` : 'transparent',
                  borderRadius: 4,
                  fontSize: 13,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.28em', color: axis.color, textTransform: 'uppercase' }}>
                  {axis.english}
                </span>
                <span style={{ color: PALETTE.inkMute, fontFamily: mono, fontSize: 12 }}>
                  {prev} → {now}
                </span>
                <span style={{ fontFamily: display, fontStyle: 'italic', color: moved ? axis.color : PALETTE.inkMute }}>
                  {moved ? '位移了' : '未变'}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Yearly archive paywall — locks deeper history (3+ entries) and PDF */}
      {sorted.length >= 2 && (
        <div style={{ marginTop: 36 }}>
          <h3 style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.32em', color: PALETTE.inkMute, textTransform: 'uppercase' }}>
            Yearly Archive · 年度档案
          </h3>
          <PremiumPaywall
            sku={ARCHIVE_SKU}
            brand="xpti"
            resourceId={ARCHIVE_RESOURCE}
            lockedTitle="解锁年度张力档案"
            teaserBullets={[
              `回看全部 ${sorted.length} 次复测 · 张力轨迹折线`,
              '年度变化叙事 · 印刷级 PDF 可下载',
              '自动提醒 4 次复测节奏（季度）',
            ]}
            preview={
              <div style={{ marginTop: 14, padding: 22, background: '#FFFDF9', border: `1px solid ${PALETTE.rule}`, borderRadius: 8, filter: 'blur(3px)', opacity: 0.5 }}>
                <p style={{ ...pStyle, marginTop: 0 }}>—— 付费后可见全部历史 ——</p>
                <ul style={{ paddingLeft: 18, color: PALETTE.inkMute, fontSize: 12 }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <li key={i}>2026-XX-XX · ████████</li>
                  ))}
                </ul>
              </div>
            }
          >
            <div style={{ marginTop: 14, padding: 22, background: '#FFFDF9', border: `1px solid ${PALETTE.rule}`, borderRadius: 8 }}>
              <h4 style={{ fontFamily: display, fontStyle: 'italic', fontSize: 18, margin: '0 0 14px' }}>全部历史</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                {sorted.map((it) => {
                  const arch = XPTI_PERSONALITY_TYPES.find((p) => p.slug === it.slug);
                  const sig = dimsToSignature(it.dims);
                  return (
                    <li key={it.finishedAt} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 12, alignItems: 'baseline', borderBottom: `1px solid ${PALETTE.rule}`, padding: '8px 0' }}>
                      <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.18em', color: PALETTE.inkMute }}>
                        {formatDate(it.finishedAt)}
                      </span>
                      <span style={{ fontFamily: display, fontStyle: 'italic', fontSize: 16, color: arch?.color ?? PALETTE.wine }}>
                        {arch?.name ?? it.slug}
                      </span>
                      <span style={{ fontFamily: mono, fontSize: 11, color: PALETTE.inkMute }}>{sig.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </PremiumPaywall>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
        <Link href={`${basePath}/xpti/test/`} style={ctaPrimary}>再测一次 →</Link>
        <Link href={`${basePath}/xpti/theory/`} style={ctaSecondary}>什么是 ITC →</Link>
      </div>
    </section>
  );
}

function formatDate(ts: number) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const cardWrap: React.CSSProperties = {
  maxWidth: 680,
  margin: '0 auto',
  padding: '8px 24px 64px',
};
const h2Style: React.CSSProperties = {
  fontFamily: display,
  fontSize: 'clamp(26px, 4vw, 38px)',
  fontWeight: 500,
  letterSpacing: '-0.01em',
  fontStyle: 'italic',
  margin: '8px 0 4px',
};
const pStyle: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.85,
  color: PALETTE.inkMute,
  margin: '12px 0',
};
const ctaPrimary: React.CSSProperties = {
  display: 'inline-block',
  padding: '14px 22px',
  background: PALETTE.wine,
  color: PALETTE.paper,
  border: 'none',
  borderRadius: 999,
  fontFamily: mono,
  fontSize: 12,
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  cursor: 'pointer',
};
const ctaSecondary: React.CSSProperties = {
  display: 'inline-block',
  padding: '14px 22px',
  background: 'transparent',
  color: PALETTE.wine,
  border: `1px solid ${PALETTE.wine}`,
  borderRadius: 999,
  fontFamily: mono,
  fontSize: 12,
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  cursor: 'pointer',
};
