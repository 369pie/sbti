'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CreatorApplicationStatus } from '@/lib/creator/applications';

interface CreatorApplicationItem {
  id: string;
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
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<CreatorApplicationStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<CreatorApplicationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('creator-admin-token') ?? '';
    if (savedToken) setToken(savedToken);
  }, []);

  const fetchItems = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (query.trim()) params.set('q', query.trim());
      params.set('pageSize', '100');

      const res = await fetch(`/api/creator-applications?${params.toString()}`, {
        headers: {
          'x-admin-token': token,
        },
      });

      const data = (await res.json()) as { items?: CreatorApplicationItem[] } & ApiErrorResponse;
      if (!res.ok) {
        if (data.code === 'SERVER_ENV_MISSING') {
          const details = data.details ? `（${data.details}）` : '';
          throw new Error(`服务端环境变量未配置完整${details}`);
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
  }, [token, status, query]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function handleSaveToken() {
    const nextToken = token.trim();
    setToken(nextToken);
    localStorage.setItem('creator-admin-token', nextToken);
  }

  async function updateStatus(item: CreatorApplicationItem, nextStatus: CreatorApplicationStatus) {
    if (!token) return;
    setSavingId(item.id);
    setError('');

    try {
      const res = await fetch('/api/creator-applications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({
          id: item.id,
          status: nextStatus,
          adminNote: item.admin_note ?? '',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
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
    if (!token) return;
    setSavingId(item.id);
    setError('');

    try {
      const res = await fetch('/api/creator-applications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({
          id: item.id,
          status: item.status,
          adminNote: nextNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
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

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
      <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Creator Admin</span>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">创作者申请管理后台</h1>
      <p className="text-text-secondary leading-8 text-base mb-8">
        用于查看创作者申请、筛选线索、更新跟进状态。此页面需要管理员 token 才能读取数据。
      </p>

      <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 mb-6">
        使用前请先在服务端配置环境变量：
        <span className="font-mono"> SUPABASE_SERVICE_ROLE_KEY </span>
        （或
        <span className="font-mono"> SUPABASE_SECRET_KEY </span>
        ）和
        <span className="font-mono"> CREATOR_ADMIN_TOKEN </span>
        。
      </div>

      <section className="rounded-2xl border border-border-subtle bg-bg-elevated p-5 sm:p-6 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="输入 CREATOR_ADMIN_TOKEN"
            className="w-full rounded-xl border border-border-subtle bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
          />
          <button
            onClick={handleSaveToken}
            className="px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium"
          >
            保存 Token
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as CreatorApplicationStatus | 'all')}
            className="rounded-xl border border-border-subtle bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="按姓名、邮箱、微信、手机号搜索"
            className="w-full rounded-xl border border-border-subtle bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
          />

          <button
            onClick={fetchItems}
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
        {STATUS_OPTIONS.filter(s => s.value !== 'all').map(s => (
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
            暂无数据。请确认 Token 正确，或等待申请提交。
          </div>
        )}

        {items.map(item => (
          <article key={item.id} className="rounded-2xl border border-border-subtle bg-bg-elevated p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">{item.name}</h2>
                <p className="text-xs text-text-muted mt-0.5">#{item.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={item.status}
                  onChange={(e) => updateStatus(item, e.target.value as CreatorApplicationStatus)}
                  disabled={savingId === item.id}
                  className="rounded-lg border border-border-subtle bg-bg-secondary px-2.5 py-1.5 text-xs text-text-primary"
                >
                  {STATUS_OPTIONS.filter(s => s.value !== 'all').map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-text-secondary">
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
                placeholder="管理员备注（失焦自动保存）"
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
