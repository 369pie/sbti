'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getApiPath } from '@/lib/api';
import {
  parseReviewFeedback,
  REVIEW_REASON_OPTIONS,
  type ReviewReasonKey,
} from '@/lib/ugc/review-feedback';

interface ReviewUniverse {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  description: string | null;
  status: string;
  submitted_at: string | null;
  creator_id: string;
  creator_name: string;
  primary_color: string;
  review_note: string | null;
}

export default function CreatorAdminContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [items, setItems] = useState<ReviewUniverse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [draftReasons, setDraftReasons] = useState<Record<string, ReviewReasonKey>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiPath('/admin/creator-review'));
      if (!res.ok) {
        const msg = res.status === 401 ? '请先登录。' : res.status === 403 ? '仅管理员可访问。' : '加载失败。';
        throw new Error(msg);
      }
      const data = await res.json();
      const nextItems = (data.universes ?? []) as ReviewUniverse[];
      setItems(nextItems);
      setDraftNotes((current) => {
        const next = { ...current };
        for (const item of nextItems) {
          if (!(item.id in next)) {
            next[item.id] = parseReviewFeedback(item.review_note)?.note ?? '';
          }
        }
        return next;
      });
      setDraftReasons((current) => {
        const next = { ...current };
        for (const item of nextItems) {
          if (!(item.id in next)) {
            next[item.id] = parseReviewFeedback(item.review_note)?.reasonKey ?? 'copy-quality';
          }
        }
        return next;
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      void load();
    }
  }, [authLoading, isAuthenticated, load]);

  const act = useCallback(async (item: ReviewUniverse, action: 'approve' | 'reject') => {
    setBusyId(item.id);
    try {
      const res = await fetch(getApiPath(`/admin/creator-review/${item.id}`), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action,
          note: action === 'reject' ? (draftNotes[item.id] ?? '') : '',
          reasonKey: action === 'reject'
            ? (draftReasons[item.id] ?? parseReviewFeedback(item.review_note)?.reasonKey ?? 'copy-quality')
            : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? '操作失败');
      }
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '操作失败');
    } finally {
      setBusyId(null);
    }
  }, [draftNotes, draftReasons, load]);

  const loginHref = `/auth/login/?next=${encodeURIComponent('/creator/admin/')}`;

  if (authLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12 text-sm text-text-muted">正在检查管理员登录状态...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="rounded-3xl border border-border-subtle bg-bg-elevated p-8 text-center">
            <div className="text-xs font-mono tracking-wider text-text-muted uppercase mb-3">Admin · UGC Review</div>
            <h1 className="text-2xl font-semibold text-text-primary">登录管理员账号后可访问审核看板</h1>
            <p className="mt-4 text-text-secondary leading-8">该页面只用于内部审核和上架操作。</p>
            <div className="mt-6 flex justify-center">
              <Link
                href={loginHref}
                className="px-5 py-3 rounded-xl bg-accent text-bg-primary text-sm font-medium hover:bg-accent/90 transition-colors"
              >
                登录管理员账号
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-mono tracking-wider text-text-muted uppercase">Admin · UGC Review</div>
            <h1 className="text-3xl font-semibold mt-2">待审核宇宙</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link href="/creator/admin/ops/" className="text-text-muted hover:text-text-primary">经营总看板</Link>
            <Link href="/creator/applications/" className="text-text-muted hover:text-text-primary">创作者申请</Link>
            <Link href="/creator/studio/" className="text-text-muted hover:text-text-primary">← 返回 Studio</Link>
          </div>
        </div>

        {loading && <div className="text-sm text-text-muted">加载中…</div>}
        {error && <div className="text-sm text-rose-400">{error}</div>}

        {!loading && !error && items.length === 0 && (
          <div className="text-center py-16 text-text-muted text-sm">当前没有待审核的宇宙。</div>
        )}

        <div className="grid gap-4">
          {items.map(u => (
            <div key={u.id} className="rounded-2xl border border-border-subtle bg-bg-elevated p-5">
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: `${u.primary_color}20`, border: `1px solid ${u.primary_color}` }}
                >
                  {u.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-semibold text-text-primary truncate">{u.name}</div>
                    <code className="text-xs text-text-muted">{u.slug}</code>
                  </div>
                  <p className="text-sm text-text-secondary mt-1 line-clamp-2">{u.description ?? '（未填描述）'}</p>
                  <div className="text-[11px] font-mono text-text-muted mt-2 space-y-1">
                    <div>创作者：{u.creator_name}</div>
                    提交于 {u.submitted_at ? new Date(u.submitted_at).toLocaleString('zh-CN') : '—'}
                  </div>
                </div>
              </div>

              {u.review_note && (
                <div className="mt-4 rounded-xl border border-amber-300/20 bg-amber-500/10 px-4 py-3">
                  <div className="text-xs text-amber-300/80 mb-1">最近一次反馈</div>
                  <div className="text-sm text-amber-100/90 font-medium">
                    {parseReviewFeedback(u.review_note)?.reason.label ?? '审核反馈'}
                  </div>
                  {parseReviewFeedback(u.review_note)?.note && (
                    <div className="text-sm text-amber-100/70 mt-1 leading-7">
                      {parseReviewFeedback(u.review_note)?.note}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 rounded-xl border border-border-subtle bg-bg-secondary/40 p-4">
                <div className="text-xs font-mono tracking-wider text-text-muted uppercase mb-3">审核反馈</div>
                <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                  <select
                    value={draftReasons[u.id] ?? parseReviewFeedback(u.review_note)?.reasonKey ?? 'copy-quality'}
                    onChange={(event) => setDraftReasons((current) => ({
                      ...current,
                      [u.id]: event.target.value as ReviewReasonKey,
                    }))}
                    className="rounded-xl border border-border-subtle bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
                  >
                    {REVIEW_REASON_OPTIONS.map((option) => (
                      <option key={option.key} value={option.key}>{option.label}</option>
                    ))}
                  </select>
                  <textarea
                    rows={3}
                    value={draftNotes[u.id] ?? parseReviewFeedback(u.review_note)?.note ?? ''}
                    onChange={(event) => setDraftNotes((current) => ({
                      ...current,
                      [u.id]: event.target.value,
                    }))}
                    placeholder="补充给创作者的修改建议。建议直接指出要改的题目、结果文案或风格问题。"
                    className="w-full rounded-xl border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary outline-none focus:border-accent resize-y"
                  />
                </div>
                <div className="text-xs text-text-muted mt-2">
                  {REVIEW_REASON_OPTIONS.find((option) => option.key === (draftReasons[u.id] ?? parseReviewFeedback(u.review_note)?.reasonKey ?? 'copy-quality'))?.hint}
                </div>
              </div>

              <div className="mt-4 flex gap-3 justify-end">
                <Link
                  href={`/creator/studio/${u.id}/`}
                  className="px-4 py-2 text-sm rounded-xl border border-border-subtle hover:bg-bg-secondary"
                >
                  预览
                </Link>
                <button
                  type="button"
                  disabled={busyId === u.id}
                  onClick={() => void act(u, 'reject')}
                  className="px-4 py-2 text-sm rounded-xl border border-rose-400/40 text-rose-400 hover:bg-rose-400/10 disabled:opacity-40"
                >
                  驳回
                </button>
                <button
                  type="button"
                  disabled={busyId === u.id}
                  onClick={() => void act(u, 'approve')}
                  className="px-4 py-2 text-sm rounded-xl bg-emerald-500 text-bg-primary hover:bg-emerald-600 disabled:opacity-40"
                >
                  通过 · 上线
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
