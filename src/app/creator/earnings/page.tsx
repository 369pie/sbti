'use client';

import { useState, useEffect, useCallback } from 'react';
import { getApiPath } from '@/lib/api';
import { withBasePath } from '@/lib/site';
import type { SettlementRow } from '@/lib/ugc/earnings';

interface EarningsData {
  totalGrossCents: number;
  totalNetCents: number;
  totalOrders: number;
  totalRefunds: number;
  availableBalanceCents: number;
  pendingSettlementCents: number;
  creatorTier: string;
  byUniverse: {
    universeId: string;
    universeName: string;
    grossCents: number;
    netCents: number;
    orderCount: number;
  }[];
  recentOrders: {
    id: string;
    universe_id: string;
    amount_cents: number;
    creator_earning_cents: number;
    status: string;
    created_at: string;
  }[];
}

function formatCents(cents: number): string {
  return `¥${(cents / 100).toFixed(2)}`;
}

const tierLabels: Record<string, string> = {
  free: '免费版 · 60% 分成',
  pro: '专业版 · 65% 分成',
  business: '商业版 · 70% 分成',
  enterprise: '企业版 · 75% 分成',
};

export default function EarningsDashboard() {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [settlements, setSettlements] = useState<SettlementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [tab, setTab] = useState<'overview' | 'orders' | 'settlements'>('overview');

  const fetchData = useCallback(async () => {
    const [earningsRes, settlementsRes] = await Promise.all([
      fetch(getApiPath('/creator/earnings')),
      fetch(getApiPath('/creator/settlement')),
    ]);

    if (earningsRes.ok) {
      setEarnings(await earningsRes.json());
    }
    if (settlementsRes.ok) {
      const data = await settlementsRes.json();
      setSettlements(data.settlements);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleWithdraw = async () => {
    if (!earnings || earnings.availableBalanceCents < 10000) {
      alert('可用余额不足 ¥100，无法提现');
      return;
    }

    const amount = prompt(`请输入提现金额（元），可用余额 ${formatCents(earnings.availableBalanceCents)}`);
    if (!amount) return;

    const amountCents = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountCents) || amountCents < 10000) {
      alert('最低提现金额为 ¥100');
      return;
    }
    if (amountCents > earnings.availableBalanceCents) {
      alert('超过可用余额');
      return;
    }

    setWithdrawing(true);
    const res = await fetch(getApiPath('/creator/settlement'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountCents }),
    });
    setWithdrawing(false);

    if (res.ok) {
      alert('提现申请已提交');
      fetchData();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || '提现失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-muted">
        加载中…
      </div>
    );
  }

  if (!earnings) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-muted">
        暂无收益数据
      </div>
    );
  }

  const statusLabels: Record<string, { text: string; cls: string }> = {
    confirmed: { text: '已确认', cls: 'text-green-600' },
    refunded: { text: '已退款', cls: 'text-red-600' },
    disputed: { text: '争议中', cls: 'text-amber-600' },
    pending: { text: '处理中', cls: 'text-amber-600' },
    processing: { text: '打款中', cls: 'text-blue-600' },
    completed: { text: '已到账', cls: 'text-green-600' },
    rejected: { text: '已拒绝', cls: 'text-red-600' },
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <a
            href={withBasePath('/creator/studio')}
            className="text-text-muted hover:text-text-secondary transition-colors"
          >
            ← 工作室
          </a>
          <h1 className="text-xl font-bold flex-1">💰 收益中心</h1>
          <span className="text-xs text-text-muted bg-bg-secondary px-3 py-1 rounded-full">
            {tierLabels[earnings.creatorTier] ?? '免费版'}
          </span>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="bg-bg-secondary rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-green-600">
              {formatCents(earnings.totalNetCents)}
            </div>
            <div className="text-[10px] text-text-muted mt-1">累计收益</div>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-text-primary">
              {formatCents(earnings.availableBalanceCents)}
            </div>
            <div className="text-[10px] text-text-muted mt-1">可提现</div>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-text-secondary">
              {earnings.totalOrders}
            </div>
            <div className="text-[10px] text-text-muted mt-1">订单数</div>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-amber-600">
              {formatCents(earnings.pendingSettlementCents)}
            </div>
            <div className="text-[10px] text-text-muted mt-1">提现中</div>
          </div>
        </div>

        {/* Withdraw button */}
        <button
          onClick={handleWithdraw}
          disabled={withdrawing || earnings.availableBalanceCents < 10000}
          className="w-full py-3 mb-8 rounded-xl bg-green-600/12 text-green-600 font-medium text-sm hover:bg-green-600/18 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {withdrawing ? '提交中…' : `申请提现 · 可用 ${formatCents(earnings.availableBalanceCents)}`}
        </button>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-bg-secondary rounded-lg p-1">
          {(['overview', 'orders', 'settlements'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                tab === t ? 'bg-bg-tertiary text-text-primary' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {t === 'overview' ? '按宇宙' : t === 'orders' ? '订单明细' : '提现记录'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'overview' && (
          <div className="space-y-2">
            {earnings.byUniverse.length === 0 ? (
              <div className="text-center py-12 text-text-muted">暂无收益</div>
            ) : (
              earnings.byUniverse.map(u => (
                <div key={u.universeId} className="bg-bg-secondary rounded-xl p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{u.universeName}</div>
                    <div className="text-xs text-text-muted mt-0.5">
                      {u.orderCount} 笔订单 · 毛收入 {formatCents(u.grossCents)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 font-medium">{formatCents(u.netCents)}</div>
                    <div className="text-[10px] text-text-muted">创作者收益</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-1">
            {earnings.recentOrders.length === 0 ? (
              <div className="text-center py-12 text-text-muted">暂无订单</div>
            ) : (
              earnings.recentOrders.map(o => {
                const st = statusLabels[o.status] ?? statusLabels.confirmed;
                return (
                  <div key={o.id} className="bg-bg-secondary rounded-lg p-3 flex items-center gap-3 text-sm">
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-text-muted text-xs">
                        {new Date(o.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <span className="text-text-secondary">{formatCents(o.amount_cents)}</span>
                    <span className="text-green-600/80">+{formatCents(o.creator_earning_cents)}</span>
                    <span className={`text-xs ${st.cls}`}>{st.text}</span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === 'settlements' && (
          <div className="space-y-2">
            {settlements.length === 0 ? (
              <div className="text-center py-12 text-text-muted">暂无提现记录</div>
            ) : (
              settlements.map(s => {
                const st = statusLabels[s.status] ?? statusLabels.pending;
                return (
                  <div key={s.id} className="bg-bg-secondary rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{formatCents(s.amount_cents)}</span>
                        <span className="text-xs text-text-muted ml-2">
                          {s.payout_method === 'bank_transfer' ? '银行转账' : s.payout_method}
                        </span>
                      </div>
                      <span className={`text-xs ${st.cls}`}>{st.text}</span>
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      申请时间：{new Date(s.requested_at).toLocaleDateString('zh-CN')}
                      {s.completed_at && ` · 到账：${new Date(s.completed_at).toLocaleDateString('zh-CN')}`}
                    </div>
                    {s.admin_note && (
                      <div className="text-xs text-amber-600/60 mt-1">备注：{s.admin_note}</div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Revenue model info */}
        <div className="mt-12 bg-bg-secondary/60 rounded-2xl p-6 text-xs text-text-muted space-y-2">
          <h3 className="text-text-secondary font-medium mb-3">💡 分成说明</h3>
          <p>创作者收入 = (实际营收 - 渠道成本 6%) × 创作者分成比例</p>
          <p>分成比例：免费版 60% · 专业版 65% · 商业版 70% · 企业版 75%</p>
          <p>提现最低金额 ¥100 · 每月 1 日生成上月结算单 · 1-3 个工作日到账</p>
          <p className="text-amber-600/40 mt-2">⚠️ 当前为模拟支付模式（Phase 0.5），无实际扣款</p>
        </div>
      </div>
    </div>
  );
}
