'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { CreatorApplicationStatus } from '@/lib/creator/applications';
import { getApiPath, readApiJson } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

interface CreatorApplicationItem {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  wechat_id: string | null;
  xiaohongshu_handle: string | null;
  content_vertical: string | null;
  wants_free: boolean;
  wants_paid: boolean;
  intro: string | null;
  source_page: string | null;
  status: CreatorApplicationStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

interface ApiErrorResponse {
  error?: string;
  code?: string;
  details?: string;
}

const STATUS_OPTIONS: Array<{ value: CreatorApplicationStatus | 'all'; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'new', label: '新提交' },
  { value: 'contacted', label: '已联系' },
  { value: 'qualified', label: '已通过初筛' },
  { value: 'approved', label: '已批准' },
  { value: 'rejected', label: '已拒绝' },
  { value: 'archived', label: '已归档' },
];

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', { hour12: false });
}

export default function CreatorApplicationsAdminPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<CreatorApplicationStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<CreatorApplicationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (query.trim()) params.set('q', query.trim());
      params.set('pageSize', '100');

      const res = await fetch(getApiPath(`/creator-applications?${params.toString()}`));
      const data = await readApiJson<{ items?: CreatorApplicationItem[] } & ApiErrorResponse>(res);

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('请先登录管理员账号。');
        }
        if (res.status === 403) {
          throw new Error('当前账号没有创作者申请管理权限。');
        }
        if (data.code === 'SERVER_ENV_MISSING') {
          const details = data.details ? `（${data.details}）` : '';
          throw new Error(`服务端环境变量未配置完整${details}`);
        }
        if (data.code === 'DB_SCHEMA_MISSING') {
          throw new Error('当前环境还没建创作者申请表。请先执行 src/lib/ugc/schema.sql。');
        }
        throw new Error(data.error ?? '获取失败');
      }

      setItems((data.items ?? []) as CreatorApplicationItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取失败');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [query, status]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      void fetchItems();
    }
  }, [authLoading, isAuthenticated, fetchItems]);

  async function updateStatus(item: CreatorApplicationItem, nextStatus: CreatorApplicationStatus) {
    setSavingId(item.id);
    setError('');

    try {
      const res = await fetch(getApiPath('/creator-applications'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: item.id,
          status: nextStatus,
          adminNote: item.admin_note ?? '',
        }),
      });

      const data = await readApiJson<{ error?: string; code?: string; item?: CreatorApplicationItem }>(res);
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('请先登录管理员账号。');
        }
        if (res.status === 403) {
          throw new Error('当前账号没有创作者申请管理权限。');
        }
        if (data.code === 'DB_SCHEMA_MISSING') {
          throw new Error('当前环境还没建创作者申请表。请先执行 src/lib/ugc/schema.sql。');
        }
        throw new Error(data.error ?? '更新失败');
      }

      setItems((prev) => prev.map((it) => (it.id === item.id ? (data.item as CreatorApplicationItem) : it)));
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
    } finally {
      setSavingId('');
    }
  }

  async function updateAdminNote(item: CreatorApplicationItem, nextNote: string) {
    setSavingId(item.id);
    setError('');

    try {
      const res = await fetch(getApiPath('/creator-applications'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: item.id,
          status: item.status,
          adminNote: nextNote,
        }),
      });

      const data = await readApiJson<{ error?: string; code?: string; item?: CreatorApplicationItem }>(res);
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('请先登录管理员账号。');
        }
        if (res.status === 403) {
          throw new Error('当前账号没有创作者申请管理权限。');
        }
        if (data.code === 'DB_SCHEMA_MISSING') {
          throw new Error('当前环境还没建创作者申请表。请先执行 src/lib/ugc/schema.sql。');
        }
        throw new Error(data.error ?? '更新失败');
      }

      setItems((prev) => prev.map((it) => (it.id === item.id ? (data.item as CreatorApplicationItem) : it)));
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
    } finally {
      setSavingId('');
    }
  }

  const stats = useMemo(() => {
    return items.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [items]);

  const loginHref = `/auth/login/?next=${encodeURIComponent('/creator/applications/')}`;

  if (authLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-6 text-sm text-text-muted">
          正在检查管理员登录状态...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="rounded-3xl border border-border-subtle bg-bg-elevated p-8 sm:p-10 text-center">
          <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Creator Admin</span>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">管理员登录后可查看申请管理后台</h1>
          <p className="mt-4 text-text-secondary leading-8">
            该页面仅面向平台管理员开放。普通申请进度请在个人中心查看。
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={loginHref}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-bg-primary font-medium hover:bg-accent/90 transition-colors"
            >
              登录管理员账号
            </Link>
            <Link
              href="/me/"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border transition-colors"
            >
              去个人中心
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
      <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Creator Admin</span>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">创作者申请管理后台</h1>
      <p className="text-text-secondary leading-8 text-base mb-8">
        管理员登录后可查看创作者申请、筛选线索、更新审核状态。普通用户的申请进度会在个人中心展示。
      </p>

      <div className="flex flex-wrap gap-3 mb-6 text-sm">
        <Link
          href="/creator/admin/ops/"
          className="inline-flex items-center rounded-xl bg-accent px-4 py-2.5 font-medium text-bg-primary hover:bg-accent/90 transition-colors"
        >
          去经营总看板
        </Link>
        <Link
          href="/creator/admin/"
          className="inline-flex items-center rounded-xl border border-border-subtle px-4 py-2.5 font-medium text-text-secondary hover:text-text-primary hover:border-border transition-colors"
        >
          去审核队列
        </Link>
      </div>

      <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 mb-6">
        使用前请先在服务端配置环境变量：
        <span className="font-mono"> SUPABASE_SERVICE_ROLE_KEY </span>
        （或
        <span className="font-mono"> SUPABASE_SECRET_KEY </span>
        ）以及
        <span className="font-mono"> ADMIN_USER_IDS </span>
        。
      </div>

      <section className="rounded-2xl border border-border-subtle bg-bg-elevated p-5 sm:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as CreatorApplicationStatus | 'all')}
            className="rounded-xl border border-border-subtle bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="按姓名、邮箱、微信、手机号搜索"
            className="w-full rounded-xl border border-border-subtle bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
          />

          <button
            onClick={() => void fetchItems()}
            className="px-4 py-2.5 rounded-xl border border-border-subtle text-text-secondary hover:text-text-primary"
          >
            刷新
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 mb-4">{error}</div>
      )}

      <section className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        {STATUS_OPTIONS.filter((s) => s.value !== 'all').map((s) => (
          <article key={s.value} className="rounded-xl border border-border-subtle bg-bg-elevated p-3 text-center">
            <p className="text-xs text-text-muted">{s.label}</p>
            <p className="text-xl font-semibold text-text-primary mt-1">{stats[s.value] ?? 0}</p>
          </article>
        ))}
      </section>

      <section className="space-y-4">
        {loading && <p className="text-sm text-text-muted">加载中...</p>}
        {!loading && items.length === 0 && (
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-6 text-sm text-text-muted">
            当前没有符合筛选条件的申请记录。
          </div>
        )}

        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-border-subtle bg-bg-elevated p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">{item.name}</h2>
                <p className="text-xs text-text-muted mt-0.5">#{item.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={item.status}
                  onChange={(e) => void updateStatus(item, e.target.value as CreatorApplicationStatus)}
                  disabled={savingId === item.id}
                  className="rounded-lg border border-border-subtle bg-bg-secondary px-2.5 py-1.5 text-xs text-text-primary"
                >
                  {STATUS_OPTIONS.filter((s) => s.value !== 'all').map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-text-secondary">
              <p>账号用户：{item.user_id ? `${item.user_id.slice(0, 8)}...` : '未绑定账号'}</p>
              <p>邮箱：{item.email}</p>
              <p>手机：{item.phone ?? '-'}</p>
              <p>微信：{item.wechat_id ?? '-'}</p>
              <p>小红书：{item.xiaohongshu_handle ?? '-'}</p>
              <p>内容方向：{item.content_vertical ?? '-'}</p>
              <p>来源页：{item.source_page ?? '-'}</p>
            </div>

            <div className="text-sm text-text-secondary">
              模式：
              {item.wants_free ? ' 免费' : ''}
              {item.wants_free && item.wants_paid ? ' + ' : ''}
              {item.wants_paid ? '付费' : ''}
            </div>

            {item.intro && (
              <div className="rounded-xl bg-bg-secondary px-3 py-2 text-sm text-text-secondary leading-7 whitespace-pre-wrap">
                {item.intro}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-start">
              <textarea
                defaultValue={item.admin_note ?? ''}
                onBlur={(e) => {
                  if ((item.admin_note ?? '') !== e.target.value) {
                    void updateAdminNote(item, e.target.value);
                  }
                }}
                rows={2}
                placeholder="管理员备注（仅后台可见，失焦自动保存）"
                className="w-full rounded-xl border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary outline-none focus:border-accent resize-y"
              />
              <div className="text-xs text-text-muted md:text-right">
                <p>提交：{formatDate(item.created_at)}</p>
                <p>更新：{formatDate(item.updated_at)}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
