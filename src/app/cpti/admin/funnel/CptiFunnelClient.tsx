'use client';

/**
 * CPTI Funnel — admin-only dashboard backed by `public.product_events`.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiPath } from '@/lib/api';

const TOKEN_KEY = 'wtfti.admin.funnel.token';

interface FunnelEvent {
  ts: string;
  event: string;
  step?: string | null;
  slug?: string | null;
  sessionId?: string | null;
}

interface FunnelResponse {
  days: number;
  sinceIso: string;
  totalRows: number;
  stepSummary: Array<{ step: string; sessions: number }>;
  eventSummary: Array<{ event: string; sessions: number }>;
  recent: FunnelEvent[];
}

const STEP_ORDER: Array<{ step: string; label: string }> = [
  { step: 'pair_view', label: '邀请面板曝光' },
  { step: 'pair_generate', label: '生成邀请链接' },
  { step: 'pair_share', label: '复制/下载分享' },
  { step: 'match_entry', label: '进入匹配' },
  { step: 'match_finish', label: '完成匹配' },
  { step: 'pricing_view', label: '价格页曝光' },
  { step: 'codex_view', label: 'Codex 查看' },
  { step: 'codex_pass_click', label: '年卡点击' },
  { step: 'codex_pass_purchase', label: '年卡支付' },
  { step: 'cosign_invite', label: '双签邀请' },
  { step: 'cosign_complete', label: '双签完成' },
  { step: 'squad_create', label: '闺蜜组组建' },
  { step: 'squad_paywall', label: '闺蜜组付费墙' },
  { step: 'squad_purchase', label: '闺蜜组支付' },
];

export default function CptiFunnelClient() {
  const [token, setToken] = useState('');
  const [days, setDays] = useState(7);
  const [data, setData] = useState<FunnelResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) ?? '' : '';
    setToken(saved);
  }, []);

  const fetchData = useCallback(async () => {
    if (!token) {
      setErr('请先填入 ADMIN_FUNNEL_TOKEN');
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(
        getApiPath(`/api/cpti/admin/funnel?days=${days}&token=${encodeURIComponent(token)}`),
        { cache: 'no-store' },
      );
      const payload = (await res.json()) as FunnelResponse & { error?: string };
      if (!res.ok) {
        setErr(payload.error ?? `HTTP ${res.status}`);
        setData(null);
      } else {
        setData(payload);
        try {
          window.localStorage.setItem(TOKEN_KEY, token);
        } catch {
          /* noop */
        }
      }
    } catch (error) {
      setErr(error instanceof Error ? error.message : String(error));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [days, token]);

  const stepMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of data?.stepSummary ?? []) {
      map.set(item.step, item.sessions);
    }
    return map;
  }, [data]);

  const top = STEP_ORDER[0] ? (stepMap.get(STEP_ORDER[0].step) ?? 0) : 0;
  const denom = Math.max(1, top);

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-2">
          <p className="text-xs tracking-[0.4em] text-amber-300/70 uppercase">CPTI · Funnel · Admin</p>
          <h1 className="text-3xl font-display">真实漏斗看板</h1>
          <p className="text-xs text-text-muted">
            读取 Supabase `product_events` 中 module=`cpti` 的真实事件。页面本身不开放，需 `ADMIN_FUNNEL_TOKEN`。
          </p>
        </header>

        <section className="space-y-3 p-5 rounded-2xl border border-border bg-bg-secondary/30">
          <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto] sm:items-end">
            <label className="space-y-1">
              <span className="text-[11px] text-text-muted">ADMIN_FUNNEL_TOKEN</span>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="server shared secret"
                className="w-full rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[11px] text-text-muted">窗口（天）</span>
              <input
                type="number"
                min={1}
                max={90}
                value={days}
                onChange={(e) => setDays(Math.max(1, Math.min(90, Number(e.target.value) || 7)))}
                className="w-full rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={() => void fetchData()}
              disabled={loading}
              className="rounded-lg border border-amber-400/50 bg-amber-400/10 px-4 py-2 text-sm text-amber-200 hover:bg-amber-400/15 disabled:opacity-50"
            >
              {loading ? '查询中…' : '查询'}
            </button>
          </div>
          {err && <p className="text-xs text-rose-300">{err}</p>}
          {data && (
            <p className="text-xs text-text-muted">
              过去 {data.days} 天 · 共 {data.totalRows} 条事件 · since {data.sinceIso.slice(0, 10)}
            </p>
          )}
        </section>

        {/* Step funnel */}
        <section className="space-y-2 p-5 rounded-2xl border border-border bg-bg-secondary/30">
          <h2 className="text-sm font-medium tracking-widest uppercase text-text-muted">主漏斗（按 step 归并）</h2>
          <ul className="space-y-2 pt-2">
            {STEP_ORDER.map((s) => {
              const v = stepMap.get(s.step) ?? 0;
              const pct = (v / denom) * 100;
              return (
                <li key={s.step} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{s.label}</span>
                    <span className="font-mono text-amber-200">{v} <span className="text-text-muted">({pct.toFixed(0)}%)</span></span>
                  </div>
                  <div className="h-1.5 rounded-full bg-bg-secondary overflow-hidden">
                    <div className="h-full bg-amber-400/80" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* All events */}
        <section className="space-y-2 p-5 rounded-2xl border border-border bg-bg-secondary/30">
          <h2 className="text-sm font-medium tracking-widest uppercase text-text-muted">事件计数（唯一 session）</h2>
          <ul className="space-y-1 pt-2 text-xs">
            {(data?.eventSummary ?? []).map((item) => (
              <li key={item.event} className="flex justify-between font-mono">
                <span className="truncate text-text-secondary">{item.event}</span>
                <span className="text-amber-200">{item.sessions}</span>
              </li>
            ))}
            {(!data || data.eventSummary.length === 0) && <li className="text-text-muted text-center py-4">还没有事件。先去 /cpti/ 走一遍流程。</li>}
          </ul>
        </section>

        {/* Recent timeline */}
        <section className="space-y-2 p-5 rounded-2xl border border-border bg-bg-secondary/30">
          <h2 className="text-sm font-medium tracking-widest uppercase text-text-muted">最近 30 条</h2>
          <ul className="space-y-1 pt-2 text-[11px] font-mono">
            {(data?.recent ?? []).map((e) => (
              <li key={`${e.ts}-${e.event}-${e.sessionId ?? 'anon'}`} className="flex gap-3 text-text-secondary">
                <span className="text-text-muted shrink-0">{new Date(e.ts).toLocaleTimeString()}</span>
                <span className="text-amber-300/80 w-24 shrink-0 truncate">{e.step ?? '—'}</span>
                <span className="flex-1 truncate">{e.event}</span>
                {e.slug ? <span className="hidden sm:block text-text-muted truncate max-w-[120px]">{e.slug}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
