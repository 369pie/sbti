'use client';

/**
 * /bottle · 漂流瓶（P1 MVP）
 * 扔出去的是心事，捞起来的也是。规则：扔 3/天 · 捞 3/天（测过才能捞）· 回 5/天。
 */

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getOrCreateAnonymousSession } from '@/lib/supabase/auth';
import { tryCreateBrowserSupabaseClient } from '@/lib/supabase/client';
import { loadLatestGalaxySession } from '@/lib/wtfi/galaxy-session';
import { WTFTI_PERSONALITIES } from '@/lib/wtfti-personalities';
import { trackFunnelEvent } from '@/lib/analytics/funnel';

interface Bottle {
  id: string;
  content: string;
  personaTag: string | null;
  hugs: number;
  replies: number;
  mine?: boolean;
  hugged?: boolean;
}

interface BottleState {
  eligible: boolean;
  todayThrown: number;
  throwLimit: number;
  todayPicked: number;
  pickLimit: number;
  myBottles: Bottle[];
  pickedToday: Bottle[];
}

const GOLD = 'var(--color-gold-leaf, #C9A676)';
const ROSE = 'var(--color-rose, #C07A8E)';

async function api<T>(path: string, opts?: RequestInit): Promise<{ status: number; body: T | null }> {
  const supabase = tryCreateBrowserSupabaseClient();
  if (!supabase) return { status: 0, body: null };
  if (!(await getOrCreateAnonymousSession(supabase)).success) return { status: 0, body: null };
  const res = await fetch(path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts?.headers ?? {}) },
  });
  const body = res.ok || res.status < 500 ? await res.json().catch(() => null) : null;
  return { status: res.status, body: body as T | null };
}

export function BottleClient() {
  const [state, setState] = useState<BottleState | null>(null);
  const [draft, setDraft] = useState('');
  const [throwMsg, setThrowMsg] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [replyMsg, setReplyMsg] = useState<Record<string, string>>({});

  const personaTag = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const session = loadLatestGalaxySession();
    if (!session?.personalitySlug) return null;
    const p = WTFTI_PERSONALITIES.find((x) => x.slug === session.personalitySlug);
    return p ? `${p.wtftiName}` : null;
  }, []);

  const load = useCallback(async () => {
    const { body } = await api<BottleState>('/api/bottles');
    if (body) setState(body);
  }, []);

  useEffect(() => {
    trackFunnelEvent('module_landing_view', { module: 'wtfti', source: '/bottle' });
    queueMicrotask(() => void load());
  }, [load]);

  const handleThrow = useCallback(async () => {
    const content = draft.trim();
    if (!content || !state) return;
    setThrowMsg(null);
    const { status, body } = await api<{ status?: string }>('/api/bottles', {
      method: 'POST',
      body: JSON.stringify({ action: 'throw', content, personaTag }),
    });
    if (status === 429) {
      setThrowMsg('今天扔够 3 个啦，明天再来。');
      return;
    }
    if (status === 200 && body?.status === 'rejected') {
      setThrowMsg('这句过不了审（涉导流或敏感词），换一句试试。');
      return;
    }
    if (status === 200) {
      setDraft('');
      setThrowMsg('扔出去了。等有缘人捞到它。');
      try {
        trackFunnelEvent('letter_sealed', { module: 'wtfti', source: 'bottle-throw' });
      } catch {
        /* noop */
      }
      void load();
      return;
    }
    setThrowMsg('没扔出去，网络打了个盹，再试一次。');
  }, [draft, state, personaTag, load]);

  const handlePick = useCallback(async () => {
    if (picking) return;
    setPicking(true);
    const { status } = await api('/api/bottles', {
      method: 'POST',
      body: JSON.stringify({ action: 'pick' }),
    });
    if (status === 403) {
      setState((s) => (s ? { ...s, eligible: false } : s));
    } else {
      await load();
    }
    setPicking(false);
  }, [picking, load]);

  const handleReply = useCallback(
    async (bottleId: string) => {
      const content = (replyDraft[bottleId] ?? '').trim();
      if (!content) return;
      const { status, body } = await api<{ status?: string }>('/api/bottles', {
        method: 'POST',
        body: JSON.stringify({ action: 'reply', bottleId, content }),
      });
      if (status === 429) {
        setReplyMsg((m) => ({ ...m, [bottleId]: '今天回够 5 句了。' }));
        return;
      }
      if (status === 200 && body?.status === 'rejected') {
        setReplyMsg((m) => ({ ...m, [bottleId]: '这句过不了审，换一句。' }));
        return;
      }
      if (status === 200) {
        setReplyDraft((d) => ({ ...d, [bottleId]: '' }));
        setReplyMsg((m) => ({ ...m, [bottleId]: '回上了。' }));
        return;
      }
      setReplyMsg((m) => ({ ...m, [bottleId]: '没回上，再试一次。' }));
    },
    [replyDraft],
  );

  const handleHug = useCallback(
    async (bottleId: string) => {
      await api('/api/bottles', {
        method: 'POST',
        body: JSON.stringify({ action: 'hug', bottleId }),
      });
      void load();
    },
    [load],
  );

  const remainingPick = state ? Math.max(0, state.pickLimit - state.todayPicked) : 0;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse 100% 60% at 50% 0%, #2a1c4d 0%, #1a1530 38%, #0F0A22 100%)',
        color: '#F5F0E8',
        fontFamily: 'var(--font-display), "Cormorant Garamond", "Noto Serif SC", serif',
      }}
    >
      <div style={{ margin: '0 auto', maxWidth: 640, padding: '56px 18px 96px' }}>
        {/* header */}
        <header style={{ textAlign: 'center', marginBottom: 36 }}>
          <p style={{ margin: 0, fontSize: 10, letterSpacing: 7, color: GOLD, textTransform: 'uppercase', fontWeight: 600 }}>
            ✦ 漂流瓶 · 树洞
          </p>
          <h1 style={{ margin: '10px 0 8px', fontSize: 32, fontStyle: 'italic', fontWeight: 500, lineHeight: 1.15 }}>
            扔出去的是心事，
            <br />
            捞起来的也是。
          </h1>
          <p style={{ margin: '0 auto', maxWidth: 420, fontSize: 12.5, color: 'rgba(245,240,232,.6)', lineHeight: 1.7 }}>
            全匿名。扔 3 个 / 天 · 捞 3 个 / 天 · 回 5 句 / 天
          </p>
        </header>

        {/* 扔瓶子 */}
        <section style={panelStyle}>
          <p style={eyebrowStyle}>扔一个 · Say it</p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, 100))}
            placeholder="最近的一句心事、一句牢骚、一句没处说的话——写完扔出去。"
            rows={3}
            maxLength={100}
            aria-label="漂流瓶内容"
            style={textareaStyle}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            {personaTag && (
              <span style={{ fontSize: 11, color: ROSE, border: '1px solid rgba(192,122,142,.4)', borderRadius: 999, padding: '4px 12px' }}>
                附上我的标签：{personaTag}
              </span>
            )}
            <span style={{ fontSize: 10.5, color: 'rgba(245,240,232,.4)', marginLeft: 'auto' }}>
              {draft.length}/100 · 今日剩 {state ? Math.max(0, state.throwLimit - state.todayThrown) : 3} 个
            </span>
          </div>
          <button type="button" onClick={handleThrow} disabled={!draft.trim()} style={{ ...primaryBtnStyle, marginTop: 14, opacity: draft.trim() ? 1 : 0.45 }}>
            扔出去
          </button>
          {throwMsg && <p style={{ marginTop: 10, fontSize: 12, color: GOLD }}>{throwMsg}</p>}
        </section>

        {/* 捞瓶子 */}
        <section style={panelStyle}>
          <p style={eyebrowStyle}>捞一捞 · Fish</p>
          {state === null ? (
            <p style={{ fontSize: 13, color: 'rgba(245,240,232,.5)' }}>海面校准中…</p>
          ) : !state.eligible ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <p style={{ fontSize: 13.5, lineHeight: 1.8, color: 'rgba(245,240,232,.8)', margin: '0 0 14px' }}>
                捞瓶子得先做个测试——瓶子只发给测过的人。
              </p>
              <Link href="/wtfti/feng/test/" prefetch={false} style={primaryBtnStyle as React.CSSProperties}>
                先去玩疯TI →
              </Link>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handlePick}
                disabled={picking || remainingPick === 0}
                style={{ ...primaryBtnStyle, opacity: picking || remainingPick === 0 ? 0.45 : 1 }}
              >
                {remainingPick === 0 ? '今天捞完了，明天再来' : picking ? '捞着呢…' : `捞一捞（今日剩 ${remainingPick} 个）`}
              </button>
              {state.pickedToday.length > 0 && (
                <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                  {state.pickedToday.map((b) => (
                    <div key={b.id} style={bottleCardStyle}>
                      {b.personaTag && (
                        <p style={{ margin: '0 0 6px', fontSize: 10.5, letterSpacing: 1, color: ROSE }}>{b.personaTag}</p>
                      )}
                      <p style={{ margin: '0 0 12px', fontSize: 14, lineHeight: 1.75, fontFamily: 'Noto Serif SC, serif' }}>
                        {b.content}
                      </p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          value={replyDraft[b.id] ?? ''}
                          onChange={(e) => setReplyDraft((d) => ({ ...d, [b.id]: e.target.value.slice(0, 100) }))}
                          placeholder="回一句…"
                          aria-label="回复这个瓶子"
                          style={{ ...textareaStyle, flex: 1, padding: '8px 14px', borderRadius: 999, fontSize: 12.5 }}
                        />
                        <button type="button" onClick={() => handleReply(b.id)} disabled={!(replyDraft[b.id] ?? '').trim()} style={smallBtnStyle}>
                          回
                        </button>
                        <button
                          type="button"
                          onClick={() => handleHug(b.id)}
                          style={{ ...smallBtnStyle, borderColor: 'rgba(192,122,142,.45)', color: b.hugged ? ROSE : '#F5F0E8' }}
                        >
                          {b.hugged ? '抱过了' : '抱抱'}
                        </button>
                      </div>
                      {replyMsg[b.id] && <p style={{ margin: '8px 0 0', fontSize: 11.5, color: GOLD }}>{replyMsg[b.id]}</p>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* 我的瓶子 */}
        <section style={panelStyle}>
          <p style={eyebrowStyle}>我扔出去的 · Mine</p>
          {state && state.myBottles.length > 0 ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {state.myBottles.map((b) => (
                <div key={b.id} style={{ ...bottleCardStyle, opacity: 0.85 }}>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, fontFamily: 'Noto Serif SC, serif' }}>{b.content}</p>
                  <p style={{ margin: '6px 0 0', fontSize: 11, color: 'rgba(245,240,232,.45)' }}>
                    被捞 {b.replies + b.hugs > 0 ? '过' : '……等风来'} · 抱抱 ×{b.hugs} · 回复 ×{b.replies}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 12.5, color: 'rgba(245,240,232,.45)' }}>还没扔过。上面那个框，就是海。</p>
          )}
        </section>

        <footer style={{ marginTop: 32, textAlign: 'center', fontSize: 10.5, color: 'rgba(245,240,232,.35)', letterSpacing: 1 }}>
          内容先审后发 · 涉导流与违规内容会被拦下 · WTFTI
        </footer>
      </div>
    </main>
  );
}

const panelStyle: React.CSSProperties = {
  padding: '24px 24px 22px',
  marginBottom: 20,
  borderRadius: 16,
  border: '1px solid rgba(201,166,118,.18)',
  background: 'rgba(26,21,48,.55)',
};

const eyebrowStyle: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 9.5,
  letterSpacing: 4,
  color: 'rgba(201,166,118,.75)',
  textTransform: 'uppercase',
  fontWeight: 600,
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid rgba(245,240,232,.14)',
  background: 'rgba(20,15,42,.45)',
  color: '#F5F0E8',
  fontSize: 13.5,
  lineHeight: 1.8,
  fontFamily: 'Noto Serif SC, serif',
  outline: 'none',
  resize: 'vertical',
};

const primaryBtnStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '11px 26px',
  borderRadius: 999,
  border: 'none',
  background: 'linear-gradient(120deg, #C07A8E, #C9A676)',
  color: '#1A1530',
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: '0.06em',
  cursor: 'pointer',
  textDecoration: 'none',
};

const smallBtnStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 999,
  border: '1px solid rgba(201,166,118,.4)',
  background: 'transparent',
  color: '#F5F0E8',
  fontSize: 12,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const bottleCardStyle: React.CSSProperties = {
  padding: '16px 16px 14px',
  borderRadius: 12,
  border: '1px solid rgba(245,240,232,.1)',
  background: 'rgba(20,15,42,.5)',
};
