'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { basePath } from '@/lib/site';
import { trackFunnelEvent } from '@/lib/analytics/funnel';
import { ITC_AXES } from '@/lib/xpti/itc';
import {
  buildCoupleMerge,
  decodeCoupleInvite,
  encodeCoupleInvite,
  type CoupleInvitePayload,
  type CoupleMergeResult,
} from '@/lib/xpti/couple';
import { loadXptiResult } from '@/lib/xpti/storage';
import { getPartnerQuestions } from '@/lib/xpti/questions-partner';
import type { Answer } from '@/lib/xpti/scoring';
import { CoupleRadar } from '@/components/xpti/CoupleRadar';
import { buildResourceId } from '@/lib/payments/skus';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { toQrDataUrl } from '@/lib/qr-code';

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

type Mode = 'gate' | 'inviter' | 'partner-quiz' | 'merged';
type PayMode = 'full' | 'split';

const COUPLE_RESOURCE = buildResourceId('xpti', 'couple-report');
const COUPLE_SKU_FULL = 'xpti-couple-report' as const;
const COUPLE_SKU_HALF = 'xpti-couple-half' as const;

export function CoupleClient() {
  // Lazy init: when running on the client we can synchronously read the
  // URL once during the first render. SSR / pre-render returns null and
  // we hydrate via a microtask below to avoid setState-in-effect.
  const [invite] = useState<CoupleInvitePayload | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const inv = params.get('inv');
    return inv ? decodeCoupleInvite(inv) : null;
  });
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === 'undefined') return 'gate';
    const params = new URLSearchParams(window.location.search);
    const inv = params.get('inv');
    return inv && decodeCoupleInvite(inv) ? 'partner-quiz' : 'inviter';
  });
  const [partnerAnswers, setPartnerAnswers] = useState<Map<number, Answer>>(new Map());
  const [merge, setMerge] = useState<CoupleMergeResult | null>(null);
  const [payMode, setPayMode] = useState<PayMode>('split');
  const partnerNickRef = useRef<HTMLInputElement>(null);

  // Fire analytics on mount (without changing state).
  useEffect(() => {
    if (mode === 'partner-quiz' && invite) {
      trackFunnelEvent('couple_invite_open', { module: 'xpti', slug: invite.slug });
    }
    // Intentionally only on first mount; mode/invite are stable from lazy init.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ───────── Inviter view: my result + share link ─────────
  const myResult = useMemo(() => loadXptiResult(), []);

  const inviteLink = useMemo(() => {
    if (!myResult) return null;
    const code = encodeCoupleInvite({ slug: myResult.slug, dims: myResult.dims });
    if (typeof window === 'undefined') return null;
    return `${window.location.origin}${basePath}/xpti/couple/?inv=${encodeURIComponent(code)}`;
  }, [myResult]);

  const handleCreateInvite = () => {
    if (!inviteLink || !myResult) return;
    trackFunnelEvent('couple_invite_create', { module: 'xpti', slug: myResult.slug });
    if (navigator.share) {
      navigator
        .share({ title: 'XPTI · 邀请你测一下我们的张力配对', text: '12 道题，看我们是哪一类亲密配对', url: inviteLink })
        .catch(() => copy(inviteLink));
    } else {
      copy(inviteLink);
    }
  };

  // ───────── Partner quiz ─────────
  const partnerQuestions = useMemo(() => getPartnerQuestions(), []);
  const [qIdx, setQIdx] = useState(0);
  const currentQ = partnerQuestions[qIdx];

  const submitAnswer = (val: Answer) => {
    if (!currentQ) return;
    const next = new Map(partnerAnswers);
    next.set(currentQ.id, val);
    setPartnerAnswers(next);
    if (qIdx < partnerQuestions.length - 1) {
      setQIdx(qIdx + 1);
    } else {
      // Compute partner dims and merge
      finishPartner(next);
    }
  };

  const finishPartner = (answers: Map<number, Answer>) => {
    if (!invite) return;
    // Aggregate answers per dimension (1-3 average, applying reversed flag).
    const sums = new Map<string, { total: number; count: number }>();
    for (const q of partnerQuestions) {
      const a = answers.get(q.id);
      if (a === undefined) continue;
      const score = q.reversed ? 4 - a : a;
      const acc = sums.get(q.dimension) ?? { total: 0, count: 0 };
      acc.total += score;
      acc.count += 1;
      sums.set(q.dimension, acc);
    }
    const partnerDims = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9'].map((id) => {
      const s = sums.get(id);
      return s && s.count > 0 ? s.total / s.count : 2;
    });
    // Quick partner archetype guess: nearest by Euclidean to inviter logic isn't needed —
    // for simplicity we stamp a synthetic slug that won't be looked up; buildCoupleMerge
    // falls back to first archetype if slug missing. We pick "elastic" as neutral fallback,
    // then let the radar + signature do the talking.
    const mergeRes = buildCoupleMerge(
      { slug: invite.slug, dims: invite.dims },
      { slug: 'elastic', dims: partnerDims },
    );
    setMerge(mergeRes);
    setMode('merged');
    trackFunnelEvent('couple_completed', { module: 'xpti', slug: invite.slug });
  };

  // ───────── Render ─────────
  return (
    <main style={{ background: PALETTE.paper, color: PALETTE.ink, minHeight: '100vh' }}>
      <header style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px 24px' }}>
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.42em', color: PALETTE.rose, textTransform: 'uppercase' }}>
          XPTI · Couple Report
        </div>
        <h1 style={{ fontFamily: display, fontWeight: 500, fontSize: 'clamp(34px, 5vw, 54px)', lineHeight: 1.1, margin: '14px 0 8px', letterSpacing: '-0.01em' }}>
          关系合并报告
          <span style={{ display: 'block', fontStyle: 'italic', color: PALETTE.wine, fontSize: '0.5em', marginTop: 6 }}>
            Intimacy Tension Pairing
          </span>
        </h1>
      </header>

      {mode === 'inviter' && (
        <InviterView myResult={myResult} inviteLink={inviteLink} onShare={handleCreateInvite} />
      )}

      {mode === 'partner-quiz' && currentQ && (
        <PartnerQuizView
          inviterNick={invite?.nick}
          inviterSlug={invite?.slug ?? ''}
          qIdx={qIdx}
          total={partnerQuestions.length}
          questionText={currentQ.text}
          options={currentQ.options ?? []}
          onAnswer={submitAnswer}
          partnerNickRef={partnerNickRef}
        />
      )}

      {mode === 'merged' && merge && (
        <MergedView merge={merge} payMode={payMode} setPayMode={setPayMode} />
      )}
    </main>
  );
}

// ─────────────────────────────────────────────────────────
// Sub-views
// ─────────────────────────────────────────────────────────

function InviterView({
  myResult,
  inviteLink,
  onShare,
}: {
  myResult: ReturnType<typeof loadXptiResult>;
  inviteLink: string | null;
  onShare: () => void;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copyOk, setCopyOk] = useState(false);

  useEffect(() => {
    if (!inviteLink) return;
    let cancelled = false;
    toQrDataUrl(inviteLink, { margin: 1, width: 220, color: { dark: PALETTE.wine, light: '#FFFDF9' } })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [inviteLink]);

  const copyOnly = () => {
    if (!inviteLink) return;
    copy(inviteLink);
    setCopyOk(true);
    setTimeout(() => setCopyOk(false), 2200);
  };

  if (!myResult) {
    return (
      <section style={cardWrap}>
        <p style={pStyle}>
          要邀请伴侣合并报告，你需要先完成一次 XPTI 测试。
        </p>
        <Link href={`${basePath}/xpti/test/`} style={ctaPrimary}>开始 XPTI 测试 →</Link>
      </section>
    );
  }

  return (
    <section style={cardWrap}>
      <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.32em', color: PALETTE.gold, textTransform: 'uppercase' }}>
        Step 1 · Invite
      </div>
      <h2 style={h2Style}>把这条链接发给 ta</h2>
      <p style={pStyle}>
        ta 不需要做完整的 27 题——只用做 12 题精简版（约 90 秒），就能和你合并出关系报告。
      </p>
      {inviteLink && (
        <>
          <textarea
            readOnly
            value={inviteLink}
            rows={3}
            style={{
              width: '100%',
              padding: 14,
              fontFamily: mono,
              fontSize: 12,
              border: `1px solid ${PALETTE.rule}`,
              borderRadius: 6,
              background: '#FFFDF9',
              color: PALETTE.ink,
              resize: 'none',
              marginTop: 14,
            }}
            onFocus={(e) => e.currentTarget.select()}
          />
          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            <button onClick={onShare} style={ctaPrimary}>分享 / 复制邀请链接</button>
            <button onClick={copyOnly} style={ctaSecondary}>{copyOk ? '已复制 ✓' : '只复制链接'}</button>
            <Link href={`${basePath}/xpti/result/${myResult.slug}/`} style={ctaSecondary}>← 回到我的结果</Link>
          </div>

          {/* QR code — for in-person sharing */}
          {qrDataUrl && (
            <div
              style={{
                marginTop: 28,
                padding: 24,
                background: '#FFFDF9',
                border: `1px solid ${PALETTE.rule}`,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                flexWrap: 'wrap',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="邀请二维码"
                width={180}
                height={180}
                style={{ width: 180, height: 180, borderRadius: 6, background: '#FFFDF9' }}
              />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.32em', color: PALETTE.gold, textTransform: 'uppercase' }}>
                  Or · Scan with phone
                </div>
                <p style={{ ...pStyle, marginTop: 8 }}>
                  让 ta 当面用手机扫这个码，直接进入 12 题精简版。
                  适合饭桌上 / 散步时 / 一起在沙发上的场合。
                </p>
              </div>
            </div>
          )}

          <p style={{ ...pStyle, fontSize: 12, color: PALETTE.inkMute, marginTop: 18 }}>
            链接里只编码了你的 9 维分数和原型 slug，不包含答案文本。任何拿到链接的人都可以做合并报告。
          </p>
        </>
      )}
    </section>
  );
}

function PartnerQuizView({
  inviterNick,
  inviterSlug,
  qIdx,
  total,
  questionText,
  options,
  onAnswer,
}: {
  inviterNick?: string;
  inviterSlug: string;
  qIdx: number;
  total: number;
  questionText: string;
  options: { value: 1 | 2 | 3; label: string; key: string }[];
  onAnswer: (a: Answer) => void;
  partnerNickRef: React.RefObject<HTMLInputElement | null>;
}) {
  const progress = Math.round(((qIdx + 1) / total) * 100);
  return (
    <section style={cardWrap}>
      <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.32em', color: PALETTE.gold, textTransform: 'uppercase' }}>
        Partner Mini · {qIdx + 1} / {total}
      </div>
      <p style={{ ...pStyle, marginTop: 6 }}>
        {inviterNick ? `${inviterNick} ` : '你的伴侣 '} 邀请你做一份 12 题精简版（约 90 秒），合并出你们俩的亲密张力配对。
        <span style={{ color: PALETTE.gold, marginLeft: 6, fontFamily: mono, fontSize: 11 }}>{inviterSlug}</span>
      </p>
      <div style={{ height: 4, background: PALETTE.rule, borderRadius: 999, overflow: 'hidden', margin: '20px 0 28px' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: PALETTE.wine, transition: 'width .35s ease' }} />
      </div>

      <h3 style={{ fontFamily: display, fontSize: 'clamp(22px, 3.5vw, 30px)', lineHeight: 1.4, fontWeight: 500, margin: '8px 0 24px' }}>
        {questionText}
      </h3>

      <div style={{ display: 'grid', gap: 10 }}>
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onAnswer(opt.value)}
            style={{
              textAlign: 'left',
              padding: '16px 18px',
              background: '#FFFDF9',
              border: `1px solid ${PALETTE.rule}`,
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 15,
              lineHeight: 1.6,
              color: PALETTE.ink,
              transition: 'all .15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = PALETTE.wine;
              e.currentTarget.style.background = `${PALETTE.wine}08`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = PALETTE.rule;
              e.currentTarget.style.background = '#FFFDF9';
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function MergedView({
  merge,
  payMode,
  setPayMode,
}: {
  merge: CoupleMergeResult;
  payMode: PayMode;
  setPayMode: (m: PayMode) => void;
}) {
  const { inviter, partner, pairing } = merge;
  const activeSku = payMode === 'split' ? COUPLE_SKU_HALF : COUPLE_SKU_FULL;
  const activePrice = payMode === 'split' ? '¥6.9' : '¥12.9';
  return (
    <section style={{ ...cardWrap, paddingBottom: 96 }}>
      <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.32em', color: PALETTE.gold, textTransform: 'uppercase' }}>
        Tension Pairing · Result
      </div>
      <h2 style={{ ...h2Style, color: PALETTE.wine }}>
        {pairing.label}
        <span style={{ display: 'block', fontFamily: mono, fontSize: 11, letterSpacing: '0.32em', color: PALETTE.inkMute, marginTop: 6, textTransform: 'uppercase' }}>
          {pairing.english}
        </span>
      </h2>
      <p style={{ ...pStyle, marginTop: 12, fontStyle: 'italic', color: PALETTE.ink, fontFamily: display, fontSize: 18 }}>
        {pairing.oneLine}
      </p>

      <div style={{ marginTop: 32 }}>
        <CoupleRadar inviter={inviter} partner={partner} />
      </div>

      {/* Two signature columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 28 }}>
        <SignatureBlock label="你方 · A" sig={inviter.signature.label} color={PALETTE.rose} />
        <SignatureBlock label="ta 方 · B" sig={partner.signature.label} color={PALETTE.wine} />
      </div>

      {/* Per-axis breakdown */}
      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.32em', color: PALETTE.inkMute, textTransform: 'uppercase' }}>
          Axis-by-Axis
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 14, display: 'grid', gap: 10 }}>
          {ITC_AXES.map((axis) => {
            const a = inviter.axes.find((x) => x.id === axis.id);
            const b = partner.axes.find((x) => x.id === axis.id);
            if (!a || !b) return null;
            const delta = Math.abs(a.signed - b.signed);
            const tone = delta < 0.4 ? '同步' : delta < 0.9 ? '互补' : '对冲';
            return (
              <li
                key={axis.id}
                style={{
                  padding: '12px 16px',
                  borderLeft: `3px solid ${axis.color}`,
                  background: `${axis.color}10`,
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
                <span style={{ color: PALETTE.inkMute }}>
                  {a.poleZh} {a.pct}% / {b.poleZh} {b.pct}%
                </span>
                <span style={{ fontFamily: display, fontStyle: 'italic', color: axis.color }}>{tone}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Pairing notes — gated behind paywall */}
      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.32em', color: PALETTE.inkMute, textTransform: 'uppercase' }}>
          Pairing Notes · 关系笔记
        </h3>

        {/* 共测分摊 toggle */}
        <div
          style={{
            display: 'inline-flex',
            border: `1px solid ${PALETTE.rule}`,
            borderRadius: 999,
            overflow: 'hidden',
            margin: '12px 0 6px',
          }}
          role="tablist"
          aria-label="付费方式"
        >
          {([
            { id: 'split' as const, label: '双人各 ¥6.9', sub: 'split' },
            { id: 'full' as const, label: '一方 ¥12.9 付清', sub: 'full' },
          ]).map((opt) => {
            const active = payMode === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setPayMode(opt.id)}
                role="tab"
                aria-selected={active}
                style={{
                  padding: '8px 16px',
                  fontFamily: mono,
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  border: 'none',
                  background: active ? PALETTE.wine : 'transparent',
                  color: active ? PALETTE.paper : PALETTE.wine,
                  cursor: 'pointer',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <p style={{ fontSize: 12, color: PALETTE.inkMute, margin: '0 0 8px' }}>
          已选 <strong style={{ color: PALETTE.wine }}>{activePrice}</strong> · 任一方付款即可解锁本设备的合并报告。
        </p>

        <PremiumPaywall
          sku={activeSku}
          brand="xpti"
          resourceId={COUPLE_RESOURCE}
          lockedTitle={`解锁 ${pairing.label} · 关系笔记 · ${activePrice}`}
          teaserBullets={[
            '最常发生的甜 / 痛 / 能不能长走',
            '针对 6 类配对的相处手册',
            '24 句对话脚本 · 拿来就能发',
          ]}
          preview={
            <div style={{ marginTop: 14, padding: 22, background: '#FFFDF9', border: `1px solid ${PALETTE.rule}`, borderRadius: 8, filter: 'blur(2px)', opacity: 0.5 }}>
              <p style={{ ...pStyle, marginTop: 0 }}>—— 付费后可见 ——</p>
              <p style={pStyle}>付费后可见关于&ldquo;甜 / 痛 / 长走&rdquo;的完整脚本。</p>
            </div>
          }
        >
          <div style={{ marginTop: 14, padding: 22, background: '#FFFDF9', border: `1px solid ${PALETTE.rule}`, borderRadius: 8 }}>
            <p style={{ ...pStyle, marginTop: 0 }}>
              <strong style={{ color: PALETTE.wine }}>最常发生的甜：</strong>
              {pairing.notes.fit}
            </p>
            <p style={pStyle}>
              <strong style={{ color: PALETTE.rose }}>最常发生的痛：</strong>
              {pairing.notes.risk}
            </p>
            <p style={pStyle}>
              <strong style={{ color: PALETTE.gold }}>能不能长走：</strong>
              {pairing.notes.longTerm}
            </p>
            <p style={{ ...pStyle, fontSize: 13, fontStyle: 'italic', color: PALETTE.inkMute, marginTop: 18 }}>
              {pairing.longDescription}
            </p>
            <p style={{ ...pStyle, fontSize: 12, color: PALETTE.inkMute, marginTop: 18 }}>
              本报告内容已在你的设备解锁；如需 ta 那边也能直接看，让 ta 在自己设备里付一次（同一价位即可）。
            </p>
          </div>
        </PremiumPaywall>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
        <Link href={`${basePath}/xpti/theory/`} style={ctaSecondary}>什么是 ITC 张力坐标系 →</Link>
        <Link href={`${basePath}/xpti/`} style={ctaSecondary}>← 回到 XPTI</Link>
      </div>
    </section>
  );
}

function SignatureBlock({ label, sig, color }: { label: string; sig: string; color: string }) {
  return (
    <div style={{ padding: 16, border: `1px solid ${color}55`, borderRadius: 8, background: `${color}0E` }}>
      <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.32em', color, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontFamily: display, fontStyle: 'italic', fontSize: 16, marginTop: 6, lineHeight: 1.4 }}>
        {sig}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Style tokens
// ─────────────────────────────────────────────────────────

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
  margin: '12px 0 6px',
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

function copy(text: string) {
  if (typeof navigator === 'undefined') return;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}
