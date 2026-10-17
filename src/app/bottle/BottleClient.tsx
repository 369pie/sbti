'use client';

/**
 * /bottle · 懂我 · 树洞 v1
 * 私密写下 → AI 温和回应 → 可选匿名公开（先审后发）→ 别人只能抱抱 / 我也是
 */

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { enqueueProductEvent } from '@/lib/analytics/product-events';
import { trackFunnelEvent } from '@/lib/analytics/funnel';
import { getApiPath } from '@/lib/api';
import { getOrCreateAnonymousSession } from '@/lib/supabase/auth';
import { tryCreateBrowserSupabaseClient } from '@/lib/supabase/client';

import styles from './bottle.module.css';

interface Post {
  id: string;
  content: string;
  hugs: number;
  alsoMe: number;
  visibility: 'private' | 'public_pending' | 'public';
  aiReply: string | null;
  riskLevel: string;
  status: string;
  createdAt: string;
  mine?: boolean;
  hugged?: boolean;
  iAlsoMe?: boolean;
}

interface Crisis {
  headline: string;
  body: string;
  hotlines: Array<{ region: string; name: string; contact: string }>;
}

interface StatePayload {
  ok?: boolean;
  todayWritten: number;
  writeLimit: number;
  mine: Post[];
  feed: Post[];
}

async function api<T>(path: string, opts?: RequestInit): Promise<{ status: number; body: T | null }> {
  const supabase = tryCreateBrowserSupabaseClient();
  if (!supabase) return { status: 0, body: null };
  if (!(await getOrCreateAnonymousSession(supabase)).success) return { status: 0, body: null };
  const res = await fetch(path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts?.headers ?? {}) },
  });
  const body = (await res.json().catch(() => null)) as T | null;
  return { status: res.status, body };
}

export function BottleClient() {
  const [state, setState] = useState<StatePayload | null>(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCrisis, setLastCrisis] = useState<Crisis | null>(null);
  const [lastPost, setLastPost] = useState<Post | null>(null);

  const load = useCallback(async () => {
    const { body } = await api<StatePayload>(getApiPath('/bottles/'));
    if (body) setState(body);
  }, []);

  useEffect(() => {
    trackFunnelEvent('module_landing_view', { module: 'wtfti', source: '/bottle' });
    queueMicrotask(() => void load());
  }, [load]);

  const handleWrite = useCallback(async () => {
    const content = draft.trim();
    if (!content || busy) return;
    setBusy(true);
    setError(null);
    setLastCrisis(null);
    const { status, body } = await api<{
      ok?: boolean;
      error?: string;
      message?: string;
      post?: Post;
      crisis?: Crisis | null;
    }>(getApiPath('/bottles/'), {
      method: 'POST',
      body: JSON.stringify({ action: 'write', content }),
    });
    setBusy(false);
    if (status === 429) {
      setError('今天写够啦，明天再来。先去看看别人的树洞，给一个抱抱。');
      return;
    }
    if (status === 400 || !body?.ok) {
      setError(body?.message || '没写进去，换一句再试试。');
      return;
    }
    setDraft('');
    setLastPost(body.post ?? null);
    setLastCrisis(body.crisis ?? null);
    enqueueProductEvent('home', 'treehole_post', {
      step: 'write',
      props: { risk: body.crisis ? 'self_harm' : 'ok' },
    });
    void load();
  }, [busy, draft, load]);

  const handlePublish = useCallback(
    async (id: string) => {
      setBusy(true);
      const { body } = await api<{ ok?: boolean; message?: string; error?: string; crisis?: Crisis | null }>(
        getApiPath('/bottles/'),
        { method: 'POST', body: JSON.stringify({ action: 'request_publish', bottleId: id }) },
      );
      setBusy(false);
      if (body?.crisis) setLastCrisis(body.crisis);
      if (!body?.ok) {
        setError(body?.message || '暂时不能公开');
        return;
      }
      setError(null);
      setLastPost((p) => (p && p.id === id ? { ...p, visibility: 'public_pending' } : p));
      void load();
    },
    [load],
  );

  const react = useCallback(
    async (id: string, kind: 'hug' | 'also_me') => {
      const { status, body } = await api<{ ok?: boolean }>(getApiPath('/bottles/'), {
        method: 'POST',
        body: JSON.stringify({ action: kind, bottleId: id }),
      });
      if (status === 200 && body?.ok) {
        enqueueProductEvent('home', 'treehole_hug', { step: kind, props: { kind } });
        void load();
      }
    },
    [load],
  );

  const remaining = state ? Math.max(0, state.writeLimit - state.todayWritten) : null;

  return (
    <main className={`skin-journal ${styles.page}`}>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <p className="s-eyebrow">懂我 · 树洞</p>
          <h1 className={`s-title ${styles.h1}`}>想说的，先说给我听</h1>
          <p className={styles.sub}>
            默认只有你自己和我能看见。想匿名公开的话，会先过审再出现；别人只能抱抱，或点「我也是」——不能私信。
          </p>
        </header>

        <section className={`s-card ${styles.compose}`}>
          <div className="s-tape" />
          <p className="s-eyebrow">Write</p>
          <h2 className={`s-title ${styles.composeTitle}`}>今天想说点什么？</h2>
          <textarea
            className={styles.textarea}
            value={draft}
            maxLength={500}
            placeholder="比如：今天被夸了，想找个地方说一下……"
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className={styles.meta}>
            <span>{remaining != null ? `今天还能写 ${remaining} 次` : '…'}</span>
            <span>{draft.trim().length}/500</span>
          </div>
          <button type="button" className="s-btn" disabled={busy || !draft.trim()} onClick={() => void handleWrite()}>
            {busy ? '在听…' : '写进树洞'}
          </button>
          <p className={styles.hint}>写完会收到一句温柔回应。自伤相关内容会一直私密，并显示援助热线。</p>
          {error ? <p className={styles.error}>{error}</p> : null}
        </section>

        {lastCrisis ? (
          <aside className={styles.crisis} role="alert">
            <h3>{lastCrisis.headline}</h3>
            <p>{lastCrisis.body}</p>
            {lastCrisis.hotlines.map((h) => (
              <p key={`${h.region}-${h.name}`} className={styles.hotline}>
                <strong>{h.region}</strong> · {h.name}：{h.contact}
              </p>
            ))}
          </aside>
        ) : null}

        {lastPost?.aiReply ? (
          <section className={`s-card ${styles.compose}`}>
            <div className="s-tape s-tape--peach" />
            <div className={styles.aiBox}>
              <div className={styles.aiLabel}>AI 回应 · 只给你</div>
              <p className={styles.aiText}>{lastPost.aiReply}</p>
            </div>
            {lastPost.riskLevel === 'ok' && lastPost.visibility === 'private' ? (
              <div className={styles.publishRow}>
                <button
                  type="button"
                  className={styles.ghostBtn}
                  disabled={busy}
                  onClick={() => void handlePublish(lastPost.id)}
                >
                  匿名公开（先审后发）
                </button>
                <span className={styles.chip}>公开后别人只能抱抱 / 我也是</span>
              </div>
            ) : null}
            {lastPost.visibility === 'public_pending' ? (
              <p className={styles.hint}>已排队审核，通过后才会出现在下面。</p>
            ) : null}
          </section>
        ) : null}

        <section className={styles.section}>
          <p className="s-eyebrow">Feed</p>
          <h2 className={`s-title ${styles.secTitle}`}>树洞里的一句话</h2>
          {!state ? <p className={styles.empty}>加载中…</p> : null}
          {state && state.feed.length === 0 ? (
            <p className={styles.empty}>还没有过审的公开内容。你写下的第一句，也许会成为别人的抱抱。</p>
          ) : null}
          {state?.feed.map((p) => (
            <article key={p.id} className={`s-card ${styles.card}`}>
              <p className={styles.body}>{p.content}</p>
              <p className={styles.chip}>匿名 · 抱抱 {p.hugs} · 我也是 {p.alsoMe}</p>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={`${styles.react} ${p.hugged ? styles.reactOn : ''}`}
                  onClick={() => void react(p.id, 'hug')}
                >
                  {p.hugged ? '已抱抱' : '抱抱'}
                </button>
                <button
                  type="button"
                  className={`${styles.react} ${p.iAlsoMe ? styles.reactOn : ''}`}
                  onClick={() => void react(p.id, 'also_me')}
                >
                  {p.iAlsoMe ? '已点我也是' : '我也是'}
                </button>
              </div>
            </article>
          ))}
        </section>

        {state && state.mine.length > 0 ? (
          <section className={styles.section}>
            <p className="s-eyebrow">Mine</p>
            <h2 className={`s-title ${styles.secTitle}`}>我写过的</h2>
            {state.mine.map((p) => (
              <article key={p.id} className={`s-card ${styles.card}`}>
                <p className={styles.chip}>
                  {p.visibility === 'private'
                    ? '私密'
                    : p.visibility === 'public_pending'
                      ? '审核中'
                      : '已公开'}
                  {p.riskLevel === 'self_harm' ? ' · 仅自己可见' : ''}
                </p>
                <p className={styles.body}>{p.content}</p>
                {p.aiReply ? (
                  <div className={styles.aiBox}>
                    <div className={styles.aiLabel}>当时的回应</div>
                    <p className={styles.aiText}>{p.aiReply}</p>
                  </div>
                ) : null}
                {p.visibility === 'private' && p.riskLevel === 'ok' ? (
                  <div className={styles.publishRow}>
                    <button type="button" className={styles.ghostBtn} onClick={() => void handlePublish(p.id)}>
                      匿名公开（先审后发）
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </section>
        ) : null}

        <p className={styles.fine}>
          <Link href="/today/" prefetch={false} style={{ color: 'var(--s-accent-text)' }}>
            回今日
          </Link>
          {' · '}
          仅供情绪陪伴，不能替代专业帮助
        </p>
      </div>
    </main>
  );
}
