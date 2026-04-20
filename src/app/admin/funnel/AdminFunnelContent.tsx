'use client';

import { useCallback, useEffect, useState } from 'react';
import { getApiPath } from '@/lib/api';

interface FunnelRow {
  module: string;
  counts: Record<string, number>;
  viewToBuy: number;
  buyToPay: number;
  viewToPay: number;
}

interface FunnelResponse {
  days: number;
  sinceIso: string;
  totalRows: number;
  summary: FunnelRow[];
}

const TOKEN_KEY = 'wtfti.admin.funnel.token';

const COLS: Array<{ key: string; label: string }> = [
  { key: 'home_module_card_click', label: '首页点击' },
  { key: 'module_landing_view', label: '落地页' },
  { key: 'quiz_start', label: '开测' },
  { key: 'quiz_complete', label: '完成' },
  { key: 'result_view', label: '结果' },
  { key: 'paywall_view', label: '看到付费' },
  { key: 'paywall_click_buy', label: '点击购买' },
  { key: 'paywall_pay_success', label: '支付成功' },
  { key: 'cross_module_unlock_click', label: '跨模块跳转' },
];

export function AdminFunnelContent() {
  const [token, setToken] = useState('');
  const [days, setDays] = useState(7);
  const [data, setData] = useState<FunnelResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) ?? '' : '';
    setToken(t);
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
        getApiPath(`/api/admin/funnel?days=${days}&token=${encodeURIComponent(token)}`),
        { cache: 'no-store' },
      );
      if (!res.ok) {
        setErr(`HTTP ${res.status}`);
        setData(null);
      } else {
        setData(await res.json());
        try {
          window.localStorage.setItem(TOKEN_KEY, token);
        } catch {}
      }
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  }, [token, days]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0a0810',
        color: '#F5F0E8',
        padding: '48px 24px',
        fontFamily: '"Noto Serif SC", serif',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p
          style={{
            fontFamily: '"SF Mono", monospace',
            fontSize: 11,
            letterSpacing: '0.42em',
            color: '#C9A676',
            margin: 0,
          }}
        >
          ADMIN · FUNNEL
        </p>
        <h1
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 44,
            margin: '8px 0 24px',
          }}
        >
          7 日付费漏斗
        </h1>

        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 24,
            padding: 16,
            border: '1px solid rgba(245,240,232,0.12)',
            borderRadius: 8,
            background: 'rgba(245,240,232,0.04)',
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 280 }}>
            <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.6)' }}>ADMIN_FUNNEL_TOKEN</span>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="server env shared secret"
              style={{
                padding: '8px 12px',
                borderRadius: 4,
                border: '1px solid rgba(245,240,232,0.2)',
                background: 'rgba(0,0,0,0.4)',
                color: '#F5F0E8',
                fontFamily: 'monospace',
              }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 100 }}>
            <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.6)' }}>窗口（天）</span>
            <input
              type="number"
              min={1}
              max={90}
              value={days}
              onChange={(e) => setDays(Math.max(1, Math.min(90, Number(e.target.value) || 7)))}
              style={{
                padding: '8px 12px',
                borderRadius: 4,
                border: '1px solid rgba(245,240,232,0.2)',
                background: 'rgba(0,0,0,0.4)',
                color: '#F5F0E8',
                fontFamily: 'monospace',
              }}
            />
          </label>
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            style={{
              alignSelf: 'flex-end',
              padding: '8px 18px',
              borderRadius: 4,
              border: '1px solid #C9A676',
              background: '#C9A676',
              color: '#0a0810',
              fontFamily: '"SF Mono", monospace',
              fontSize: 12,
              letterSpacing: '0.18em',
              cursor: 'pointer',
            }}
          >
            {loading ? '…' : '查询'}
          </button>
        </div>

        {err && (
          <p style={{ color: '#E89BA8', fontSize: 13, marginBottom: 16 }}>错误：{err}</p>
        )}

        {data && (
          <>
            <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.55)', marginBottom: 12 }}>
              过去 {data.days} 天 · 共 {data.totalRows} 条事件 · since {data.sinceIso.slice(0, 10)}
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontFamily: '"SF Mono", monospace',
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr style={{ background: 'rgba(201,166,118,0.08)' }}>
                    <th style={th}>模块</th>
                    {COLS.map((c) => (
                      <th key={c.key} style={th} title={c.key}>
                        {c.label}
                      </th>
                    ))}
                    <th style={th}>看→买 %</th>
                    <th style={th}>买→付 %</th>
                    <th style={th}>看→付 %</th>
                  </tr>
                </thead>
                <tbody>
                  {data.summary.map((row) => (
                    <tr key={row.module} style={{ borderTop: '1px solid rgba(245,240,232,0.08)' }}>
                      <td style={{ ...td, color: '#C9A676', fontWeight: 600 }}>{row.module}</td>
                      {COLS.map((c) => (
                        <td key={c.key} style={td}>
                          {row.counts[c.key] ?? 0}
                        </td>
                      ))}
                      <td style={{ ...td, color: '#a78bfa' }}>{row.viewToBuy.toFixed(1)}</td>
                      <td style={{ ...td, color: '#a78bfa' }}>{row.buyToPay.toFixed(1)}</td>
                      <td style={{ ...td, color: '#fbbf24' }}>{row.viewToPay.toFixed(1)}</td>
                    </tr>
                  ))}
                  {data.summary.length === 0 && (
                    <tr>
                      <td style={td} colSpan={COLS.length + 4}>
                        暂无数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

const th: React.CSSProperties = {
  padding: '10px 12px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: 10,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'rgba(245,240,232,0.7)',
  whiteSpace: 'nowrap',
};

const td: React.CSSProperties = {
  padding: '10px 12px',
  color: 'rgba(245,240,232,0.85)',
  whiteSpace: 'nowrap',
};
