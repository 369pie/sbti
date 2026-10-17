'use client';

/**
 * /admin/treehole · 树洞人工审核
 * 列出 public_pending → 通过（公开）/ 驳回（保持私密）
 */

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/components/AuthProvider';
import { getApiPath } from '@/lib/api';

import styles from './treehole-admin.module.css';

interface PendingPost {
  id: string;
  content: string;
  riskLevel: string;
  visibility: string;
  status: string;
  personaTag: string | null;
  aiReply: string | null;
  createdAt: string;
}

function formatShanghai(iso: string): string {
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function riskLabel(level: string): string {
  if (level === 'self_harm') return '自伤风险';
  if (level === 'blocked') return '敏感拦截';
  if (level === 'ok') return '低风险';
  return level || '未知';
}

export function TreeholeModerationClient() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<PendingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiPath('/admin/treehole/'));
      if (!res.ok) {
        const msg =
          res.status === 401
            ? '请先登录管理员账号。'
            : res.status === 403
              ? '仅管理员可访问。'
              : res.status === 500
                ? '服务端未配置 ADMIN_USER_IDS。'
                : '加载失败。';
        throw new Error(msg);
      }
      const data = (await res.json()) as { posts?: PendingPost[] };
      setPosts(data.posts ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '加载失败');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      void load();
    }
  }, [authLoading, isAuthenticated, load]);

  const act = useCallback(
    async (id: string, action: 'approve' | 'reject') => {
      setBusyId(id);
      setError(null);
      try {
        const res = await fetch(getApiPath(`/admin/treehole/${id}/`), {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? '操作失败');
        }
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : '操作失败');
      } finally {
        setBusyId(null);
      }
    },
    [],
  );

  const loginHref = `/auth/login/?next=${encodeURIComponent('/admin/treehole/')}`;

  if (authLoading) {
    return (
      <main className={`skin-journal ${styles.page}`}>
        <div className={styles.inner}>
          <p className={styles.empty}>正在检查登录状态…</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className={`skin-journal ${styles.page}`}>
        <div className={styles.inner}>
          <section className={`s-card ${styles.gate}`}>
            <div className="s-tape" />
            <p className="s-eyebrow">Admin · Treehole</p>
            <h1 className={`s-title ${styles.gateTitle}`}>登录后审核树洞</h1>
            <p className={styles.gateBody}>该页仅供内部审核：通过后匿名公开，驳回则保持私密。</p>
            <Link href={loginHref} className={styles.loginLink} prefetch={false}>
              登录管理员账号
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className={`skin-journal ${styles.page}`}>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <p className="s-eyebrow">Admin · 树洞</p>
          <h1 className={`s-title ${styles.h1}`}>待审公开内容</h1>
          <p className={styles.sub}>
            用户申请匿名公开的条目会出现在这里。通过 → 进入公开树洞；驳回 → 仍只留给作者自己。
          </p>
        </header>

        <div className={styles.toolbar}>
          <span className={styles.count}>
            {loading ? '加载中…' : `待审 ${posts.length} 条`}
          </span>
          <button type="button" className={styles.refresh} disabled={loading || !!busyId} onClick={() => void load()}>
            刷新
          </button>
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}

        {!loading && posts.length === 0 ? (
          <p className={styles.empty}>当前没有待审内容。可以去树洞写一条并点「匿名公开」来排队。</p>
        ) : null}

        {posts.map((p) => {
          const warn = p.riskLevel !== 'ok';
          return (
            <article key={p.id} className={`s-card ${styles.card}`}>
              <div className="s-tape s-tape--peach" />
              <div className={styles.meta}>
                <span className={`${styles.risk} ${warn ? styles.riskWarn : ''}`}>
                  {riskLabel(p.riskLevel)}
                </span>
                <span>{formatShanghai(p.createdAt)} · 上海时区</span>
                {p.personaTag ? <span>{p.personaTag}</span> : null}
              </div>
              <p className={styles.body}>{p.content}</p>
              {p.aiReply ? (
                <div className={styles.aiBox}>
                  <div className={styles.aiLabel}>当时的 AI 回应</div>
                  <p className={styles.aiText}>{p.aiReply}</p>
                </div>
              ) : null}
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.approve}
                  disabled={busyId === p.id}
                  onClick={() => void act(p.id, 'approve')}
                >
                  {busyId === p.id ? '处理中…' : '通过公开'}
                </button>
                <button
                  type="button"
                  className={styles.reject}
                  disabled={busyId === p.id}
                  onClick={() => void act(p.id, 'reject')}
                >
                  驳回（保持私密）
                </button>
              </div>
            </article>
          );
        })}

        <p className={styles.fine}>
          <Link href="/bottle/" prefetch={false} style={{ color: 'var(--s-accent-text)' }}>
            回树洞
          </Link>
          {' · '}
          仅管理员可见 · robots noindex
        </p>
      </div>
    </main>
  );
}
