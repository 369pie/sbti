'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import type { CoupleMergeResult } from '@/lib/xpti/couple';
import { loadXptiResult } from '@/lib/xpti/storage';
import { getApiPath } from '@/lib/api';
import {
  getDialogueScriptsForPairing,
  PRACTICE_30DAYS,
  CONFLICT_SCRIPTS,
  composeLoveLetter,
} from '@/lib/xpti/paid-content';
import { togglePractice } from '@/lib/xpti/couple-client-api';

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

export interface RemeasureHistoryEntry {
  side: 'inviter' | 'partner';
  slug: string;
  dims: number[];
  nickname: string | null;
  takenAt: string;
}

export function CoupleDeepContent({
  merge,
  shareToken,
  history = [],
  mySide,
  practiceChecklist,
  onPracticeUpdate,
  onRemeasured,
}: {
  merge: CoupleMergeResult;
  shareToken: string;
  history?: RemeasureHistoryEntry[];
  mySide?: 'inviter' | 'partner';
  practiceChecklist?: Record<string, { inviter?: boolean; partner?: boolean; updatedAt: string }>;
  onPracticeUpdate?: (checklist: Record<string, { inviter?: boolean; partner?: boolean; updatedAt: string }>) => void;
  onRemeasured?: (patch: { merged?: CoupleMergeResult; history?: RemeasureHistoryEntry[] }) => void;
}) {
  const { pairing, inviter, partner } = merge;
  const pairingId = pairing.id;

  const dialogues = useMemo(() => getDialogueScriptsForPairing(pairingId), [pairingId]);
  const practice = PRACTICE_30DAYS[pairingId] ?? [];
  const conflicts = CONFLICT_SCRIPTS[pairingId] ?? [];
  const letter = useMemo(
    () =>
      composeLoveLetter({
        pairingId,
        fromNickname: null,
        toNickname: null,
        signatureFrom: inviter.signature.label,
        signatureTo: partner.signature.label,
      }),
    [pairingId, inviter.signature.label, partner.signature.label],
  );

  return (
    <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 40 }}>
      <DialogueSection scripts={dialogues} />
      <PracticeSection items={practice} token={shareToken} mySide={mySide} practiceChecklist={practiceChecklist} onPracticeUpdate={onPracticeUpdate} />
      <ConflictSection items={conflicts} />
      <LoveLetterSection letter={letter} />
      <PosterSection shareToken={shareToken} />
      <RemeasureSection
        shareToken={shareToken}
        history={history}
        mySide={mySide}
        merge={merge}
        onRemeasured={onRemeasured}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Dialogue scripts
// ─────────────────────────────────────────────

function DialogueSection({ scripts }: { scripts: ReturnType<typeof getDialogueScriptsForPairing> }) {
  if (!scripts.length) return null;
  return (
    <section>
      <SectionHeader eyebrow="Dialogue · 对话脚本" title="为你们配对类型准备的 5 段对话" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 16 }}>
        {scripts.map((s) => (
          <article
            key={s.id}
            style={{
              padding: 20,
              background: '#FFFDF9',
              border: `1px solid ${PALETTE.rule}`,
              borderRadius: 10,
            }}
          >
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.32em', color: PALETTE.gold, textTransform: 'uppercase' }}>
              {s.eyebrow}
            </div>
            <h4 style={{ fontFamily: display, fontSize: 20, fontWeight: 500, margin: '8px 0 4px', fontStyle: 'italic' }}>
              {s.scenario}
            </h4>
            <p style={{ fontSize: 12, color: PALETTE.inkMute, margin: '0 0 14px', lineHeight: 1.6 }}>
              {s.goal}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {s.turns.map((t, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: t.speaker === 'you' ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    padding: '10px 14px',
                    borderRadius: t.speaker === 'you' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: t.speaker === 'you' ? `${PALETTE.wine}12` : `${PALETTE.rule}50`,
                    border: `1px solid ${t.speaker === 'you' ? `${PALETTE.wine}30` : PALETTE.rule}`,
                    fontSize: 14,
                    lineHeight: 1.55,
                  }}
                >
                  <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.28em', color: t.speaker === 'you' ? PALETTE.wine : PALETTE.inkMute, textTransform: 'uppercase', marginBottom: 4 }}>
                    {t.speaker === 'you' ? 'You' : 'Them'}
                  </div>
                  <div>{t.line}</div>
                  {t.note && (
                    <div style={{ fontStyle: 'italic', fontSize: 12, color: PALETTE.inkMute, marginTop: 6 }}>
                      — {t.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────
// Practice checklist — couple co-completion
// ──────────────────────────────────────────────────

function PracticeSection({
  items,
  token,
  mySide,
  practiceChecklist,
  onPracticeUpdate,
}: {
  items: { day: number; title: string; action: string }[];
  token: string;
  mySide?: 'inviter' | 'partner';
  practiceChecklist?: Record<string, { inviter?: boolean; partner?: boolean; updatedAt: string }>;
  onPracticeUpdate?: (checklist: Record<string, { inviter?: boolean; partner?: boolean; updatedAt: string }>) => void;
}) {
  const localKey = `xpti.couple.practice.${token}`;
  const [localDone, setLocalDone] = useState<Set<number>>(new Set());
  const [syncing, setSyncing] = useState<Set<number>>(new Set());

  // Hydrate from localStorage fallback
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(localKey);
      if (raw) {
        const parsed = JSON.parse(raw) as number[];
        setLocalDone(new Set(parsed));
      }
    } catch {
      /* ignore */
    }
  }, [localKey]);

  const getDayState = (day: number) => {
    const serverEntry = practiceChecklist?.[String(day)];
    const local = localDone.has(day);
    const meDone = mySide ? (serverEntry?.[mySide] ?? local) : local;
    const themDone = mySide
      ? (serverEntry?.[mySide === 'inviter' ? 'partner' : 'inviter'] ?? false)
      : false;
    const bothDone = meDone && themDone;
    return { meDone, themDone, bothDone };
  };

  const bothCount = items.filter((it) => getDayState(it.day).bothDone).length;
  const meCount = items.filter((it) => getDayState(it.day).meDone).length;

  const handleToggle = async (day: number) => {
    if (!mySide) {
      // Solo fallback: just localStorage
      setLocalDone((prev) => {
        const next = new Set(prev);
        if (next.has(day)) next.delete(day);
        else next.add(day);
        try {
          window.localStorage.setItem(localKey, JSON.stringify(Array.from(next)));
        } catch {
          /* ignore */
        }
        return next;
      });
      return;
    }

    const current = getDayState(day);
    const nextDone = !current.meDone;

    // Optimistic local update
    setLocalDone((prev) => {
      const next = new Set(prev);
      if (nextDone) next.add(day);
      else next.delete(day);
      return next;
    });
    setSyncing((prev) => new Set(prev).add(day));

    try {
      const updated = await togglePractice(token, { side: mySide, day, done: nextDone });
      onPracticeUpdate?.(updated);
      // Clear local fallback once server confirms
      setLocalDone((prev) => {
        const next = new Set(prev);
        next.delete(day);
        try {
          window.localStorage.setItem(localKey, JSON.stringify(Array.from(next)));
        } catch {
          /* ignore */
        }
        return next;
      });
    } catch (err) {
      // Revert on failure
      setLocalDone((prev) => {
        const next = new Set(prev);
        if (current.meDone) next.add(day);
        else next.delete(day);
        try {
          window.localStorage.setItem(localKey, JSON.stringify(Array.from(next)));
        } catch {
          /* ignore */
        }
        return next;
      });
      console.error('[PracticeSection] toggle failed', err);
    } finally {
      setSyncing((prev) => {
        const next = new Set(prev);
        next.delete(day);
        return next;
      });
    }
  };

  if (!items.length) return null;

  return (
    <section>
      <SectionHeader
        eyebrow="Practice · 30 天练习"
        title="给你们的 30 个小动作"
        caption={
          mySide
            ? `你完成了 ${meCount} / ${items.length} · 一起完成了 ${bothCount} / ${items.length} · 打勾同步到双方设备`
            : `已完成 ${meCount} / ${items.length} · 打勾存在这台设备`
        }
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 10,
          marginTop: 16,
        }}
      >
        {items.map((it) => {
          const { meDone, themDone, bothDone } = getDayState(it.day);
          const isSyncing = syncing.has(it.day);
          return (
            <button
              key={it.day}
              onClick={() => handleToggle(it.day)}
              type="button"
              style={{
                textAlign: 'left',
                padding: 12,
                background: bothDone ? `${PALETTE.gold}22` : meDone ? `${PALETTE.gold}12` : '#FFFDF9',
                border: `1px solid ${bothDone ? PALETTE.gold : meDone ? `${PALETTE.gold}80` : PALETTE.rule}`,
                borderRadius: 8,
                cursor: 'pointer',
                color: PALETTE.ink,
                fontSize: 12,
                lineHeight: 1.55,
                opacity: isSyncing ? 0.6 : 1,
                transition: 'opacity 0.2s',
                position: 'relative',
              }}
              aria-pressed={meDone}
            >
              {/* Both-done heart badge */}
              {bothDone && (
                <div
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: 8,
                    background: PALETTE.gold,
                    color: PALETTE.wine,
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 999,
                    fontFamily: mono,
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                  }}
                >
                  💕 一起完成
                </div>
              )}

              {/* Day label + status dots */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 10,
                    color: bothDone ? PALETTE.gold : meDone ? PALETTE.gold : PALETTE.inkMute,
                    letterSpacing: '0.18em',
                  }}
                >
                  DAY {String(it.day).padStart(2, '0')} {meDone && !bothDone && '· ✓'}
                </span>
                {mySide && (
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span
                      title="你"
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: meDone ? PALETTE.wine : PALETTE.rule,
                        display: 'inline-block',
                      }}
                    />
                    <span
                      title="ta"
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: themDone ? PALETTE.wine : PALETTE.rule,
                        display: 'inline-block',
                      }}
                    />
                  </div>
                )}
              </div>

              <div style={{ fontFamily: display, fontStyle: 'italic', fontSize: 15, margin: '4px 0 2px' }}>
                {it.title}
              </div>
              <div style={{ color: PALETTE.inkMute }}>{it.action}</div>

              {/* Syncing spinner */}
              {isSyncing && (
                <div style={{ marginTop: 6, fontSize: 10, color: PALETTE.inkMute, fontFamily: mono }}>
                  同步中…
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Conflict rehearsals
// ─────────────────────────────────────────────

function ConflictSection({ items }: { items: typeof CONFLICT_SCRIPTS[keyof typeof CONFLICT_SCRIPTS] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  if (!items.length) return null;
  return (
    <section>
      <SectionHeader eyebrow="Conflict · 冲突推演" title="吵架前先演一遍" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
        {items.map((c) => {
          const open = openId === c.id;
          return (
            <article
              key={c.id}
              style={{
                background: '#FFFDF9',
                border: `1px solid ${PALETTE.rule}`,
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : c.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '14px 18px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: PALETTE.ink,
                }}
                aria-expanded={open}
              >
                <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.32em', color: PALETTE.wine, textTransform: 'uppercase' }}>
                  Scene · {c.scenario}
                </div>
                <div style={{ fontSize: 13, color: PALETTE.inkMute, marginTop: 4 }}>
                  {c.trigger}
                </div>
              </button>
              {open && (
                <div style={{ padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {c.rounds.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        alignSelf: r.speaker === 'you' ? 'flex-end' : 'flex-start',
                        maxWidth: '88%',
                        padding: '8px 12px',
                        borderRadius: r.speaker === 'you' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        background: r.speaker === 'you' ? `${PALETTE.wine}12` : `${PALETTE.rule}50`,
                        fontSize: 13,
                        lineHeight: 1.55,
                      }}
                    >
                      <div style={{ fontFamily: mono, fontSize: 9, color: r.speaker === 'you' ? PALETTE.wine : PALETTE.inkMute, letterSpacing: '0.24em', marginBottom: 2, textTransform: 'uppercase' }}>
                        {r.speaker === 'you' ? 'You' : 'Them'}
                      </div>
                      <div>{r.line}</div>
                      {r.note && (
                        <div style={{ fontStyle: 'italic', fontSize: 11, color: PALETTE.inkMute, marginTop: 4 }}>
                          — {r.note}
                        </div>
                      )}
                    </div>
                  ))}
                  <p style={{ fontSize: 13, fontFamily: display, fontStyle: 'italic', color: PALETTE.wine, margin: '10px 0 0' }}>
                    ⟡ {c.resolution}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Love letter
// ─────────────────────────────────────────────

function LoveLetterSection({ letter }: { letter: ReturnType<typeof composeLoveLetter> }) {
  return (
    <section>
      <SectionHeader eyebrow="Letter · 致 ta 的一封信" title="把你们的张力写成一句话" />
      <article
        style={{
          marginTop: 16,
          padding: 28,
          background: '#FFFCF4',
          border: `1px solid ${PALETTE.gold}`,
          borderRadius: 12,
          fontFamily: display,
          color: PALETTE.ink,
        }}
      >
        <p style={{ fontStyle: 'italic', fontSize: 18, margin: '0 0 12px' }}>{letter.openingLine}</p>
        {letter.bodyParagraphs.map((p, i) => (
          <p key={i} style={{ fontSize: 16, lineHeight: 1.85, margin: '0 0 12px' }}>
            {p}
          </p>
        ))}
        <p style={{ fontStyle: 'italic', fontSize: 16, color: PALETTE.wine, margin: '18px 0 0', textAlign: 'right' }}>
          {letter.closingLine}
        </p>
      </article>
    </section>
  );
}

// ─────────────────────────────────────────────
// Poster CTA
// ─────────────────────────────────────────────

function PosterSection({ shareToken }: { shareToken: string }) {
  return (
    <section>
      <SectionHeader
        eyebrow="Poster · 海报"
        title="一张可以发小红书的关系海报"
        caption="把你们的张力配对凝在 1080×1440 的 PNG 上，附带 pair_code 与配对名。"
      />
      <div style={{ marginTop: 16 }}>
        <Link
          href={`/xpti/couple/poster/${shareToken}/`}
          style={{
            display: 'inline-block',
            padding: '10px 22px',
            background: PALETTE.gold,
            color: PALETTE.wine,
            borderRadius: 999,
            fontFamily: mono,
            fontSize: 11,
            letterSpacing: '0.24em',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          打开海报 →
        </Link>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Remeasure (monthly check-in)
// ─────────────────────────────────────────────

const DIM_LABELS_SHORT = ['节奏', '自主', '边界', '冲突', '亲密', '语言', '安全', '修复', '边界 II'];

function RemeasureSection({
  shareToken,
  history,
  mySide,
  merge,
  onRemeasured,
}: {
  shareToken: string;
  history: RemeasureHistoryEntry[];
  mySide?: 'inviter' | 'partner';
  merge: CoupleMergeResult;
  onRemeasured?: (patch: { merged?: CoupleMergeResult; history?: RemeasureHistoryEntry[] }) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [hasLocal, setHasLocal] = useState(false);

  useEffect(() => {
    setHasLocal(Boolean(loadXptiResult()));
  }, []);

  const baseline = mySide === 'partner' ? merge.partner : merge.inviter;
  const baselineDims = baseline.dims;

  // Last snapshot for "我"
  const myHistory = useMemo(
    () => (mySide ? history.filter((h) => h.side === mySide) : []),
    [history, mySide],
  );
  const lastMine = myHistory[myHistory.length - 1] ?? null;

  const handleSubmit = async () => {
    setError(null);
    setHint(null);
    if (!mySide) {
      setError('无法识别当前是邀请方还是受邀方，请刷新后重试。');
      return;
    }
    const local = loadXptiResult();
    if (!local) {
      setHint('当前设备没有最近的 XPTI 测试记录，请先完成一次再回来。');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(getApiPath(`/xpti/couples/${shareToken}/remeasure`), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          side: mySide,
          slug: local.slug,
          dims: local.dims,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        setError(`提交失败：${res.status} ${text.slice(0, 80)}`);
        return;
      }
      const json = (await res.json()) as {
        history?: RemeasureHistoryEntry[];
        merged?: CoupleMergeResult;
      };
      onRemeasured?.({ merged: json.merged, history: json.history });
      setHint('已记录这次重测，下方对比已更新。');
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <SectionHeader
        eyebrow="Remeasure · 月度回测"
        title="30 天后回到这里，记录关系的位移"
        caption="保留你最初的张力签名 + 每次重测之间的差值，用来辨认哪些维度真的在动。"
      />

      <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link
          href="/xpti/"
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            border: `1px solid ${PALETTE.rule}`,
            borderRadius: 999,
            fontFamily: mono,
            fontSize: 11,
            letterSpacing: '0.18em',
            color: PALETTE.ink,
            textDecoration: 'none',
          }}
        >
          先去重测一次 →
        </Link>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !hasLocal}
          style={{
            padding: '8px 18px',
            background: PALETTE.wine,
            color: '#FFF',
            border: 'none',
            borderRadius: 999,
            fontFamily: mono,
            fontSize: 11,
            letterSpacing: '0.18em',
            cursor: submitting || !hasLocal ? 'not-allowed' : 'pointer',
            opacity: submitting || !hasLocal ? 0.5 : 1,
          }}
        >
          {submitting ? '记录中…' : '把这台设备的最新结果记进来'}
        </button>
      </div>

      {hint && (
        <p style={{ fontSize: 12, color: PALETTE.gold, marginTop: 10 }}>{hint}</p>
      )}
      {error && (
        <p style={{ fontSize: 12, color: PALETTE.wine, marginTop: 10 }}>{error}</p>
      )}

      {history.length === 0 ? (
        <p style={{ fontSize: 12, color: PALETTE.inkMute, marginTop: 14, fontStyle: 'italic' }}>
          还没有重测记录。建议每隔 30 天回来一次，关注最容易移动的 1-2 个维度。
        </p>
      ) : (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.28em', color: PALETTE.inkMute, textTransform: 'uppercase', marginBottom: 8 }}>
            History · {history.length} 次
          </div>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.map((h, i) => (
              <li
                key={`${h.takenAt}-${i}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  padding: '8px 12px',
                  background: '#FFFDF9',
                  border: `1px solid ${PALETTE.rule}`,
                  borderRadius: 6,
                }}
              >
                <span style={{ color: PALETTE.inkMute }}>
                  {new Date(h.takenAt).toLocaleDateString('zh-CN')} · {h.side === 'inviter' ? '发起方' : '受邀方'}
                </span>
                <span style={{ fontFamily: display, fontStyle: 'italic', color: PALETTE.ink }}>{h.slug}</span>
              </li>
            ))}
          </ol>

          {mySide && lastMine && (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.28em', color: PALETTE.inkMute, textTransform: 'uppercase', marginBottom: 8 }}>
                Delta · 我这边的维度位移
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: 8,
                }}
              >
                {baselineDims.map((base, idx) => {
                  const next = lastMine.dims[idx] ?? base;
                  const delta = next - base;
                  const sign = delta > 0 ? '+' : '';
                  const tone =
                    Math.abs(delta) < 0.15 ? PALETTE.inkMute : delta > 0 ? PALETTE.wine : PALETTE.gold;
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: 10,
                        background: '#FFFDF9',
                        border: `1px solid ${PALETTE.rule}`,
                        borderRadius: 8,
                      }}
                    >
                      <div style={{ fontFamily: mono, fontSize: 10, color: PALETTE.inkMute, letterSpacing: '0.18em' }}>
                        D{idx + 1} · {DIM_LABELS_SHORT[idx] ?? ''}
                      </div>
                      <div style={{ fontFamily: display, fontStyle: 'italic', fontSize: 16, color: tone, marginTop: 4 }}>
                        {sign}
                        {delta.toFixed(2)}
                      </div>
                      <div style={{ fontSize: 11, color: PALETTE.inkMute }}>
                        {base.toFixed(2)} → {next.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────
// Shared header
// ─────────────────────────────────────────────

function SectionHeader({
  eyebrow,
  title,
  caption,
}: {
  eyebrow: string;
  title: string;
  caption?: string;
}) {
  return (
    <div>
      <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.32em', color: PALETTE.gold, textTransform: 'uppercase' }}>
        {eyebrow}
      </div>
      <h3 style={{ fontFamily: display, fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 500, fontStyle: 'italic', margin: '6px 0 0' }}>
        {title}
      </h3>
      {caption && (
        <p style={{ fontSize: 12, color: PALETTE.inkMute, margin: '4px 0 0' }}>{caption}</p>
      )}
    </div>
  );
}
