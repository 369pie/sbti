'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getApiPath } from '@/lib/api';
import { withBasePath } from '@/lib/site';

interface Stats {
  totalTests: number;
  totalShares: number;
  uniqueSessions: number;
  activeDays: number;
  avgTestsPerActiveDay: number;
  testsLast7Days: number;
  testsPrevious7Days: number;
  topPersonalityShare: number;
  bestDay: { date: string; count: number } | null;
  uniqueSources: number;
  topPersonalities: { slug: string; count: number }[];
  dailyTests: { date: string; count: number }[];
  topReferrers: { source: string; count: number }[];
  recentResults: { createdAt: string; personalitySlug: string; source: string; shared: boolean }[];
}

export default function UniverseStatsPage() {
  const params = useParams<{ id: string }>();
  const universeId = params.id;

  const [stats, setStats] = useState<Stats | null>(null);
  const [universeName, setUniverseName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    const [statsRes, universeRes] = await Promise.all([
      fetch(getApiPath(`/creator/universes/${universeId}/stats`)),
      fetch(getApiPath(`/creator/universes/${universeId}`)),
    ]);

    if (statsRes.ok) {
      setStats(await statsRes.json());
    }
    if (universeRes.ok) {
      const data = await universeRes.json();
      setUniverseName(data.universe?.name || '');
    }
    setLoading(false);
  }, [universeId]);

  useEffect(() => {
    async function loadStats() {
      await fetchStats();
    }

    void loadStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-muted">
        加载中…
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center text-red-600">
        无法加载数据
      </div>
    );
  }

  const maxDaily = Math.max(...stats.dailyTests.map(d => d.count), 1);
  const shareRate = stats.totalTests > 0 ? ((stats.totalShares / stats.totalTests) * 100).toFixed(1) : '0';
  const weeklyTrend = stats.testsPrevious7Days > 0
    ? (((stats.testsLast7Days - stats.testsPrevious7Days) / stats.testsPrevious7Days) * 100).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <a
            href={withBasePath(`/creator/studio/${universeId}`)}
            className="text-text-muted hover:text-text-secondary transition-colors"
          >
            ← 编辑器
          </a>
          <h1 className="text-xl font-bold flex-1">📊 {universeName} 数据面板</h1>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-bg-secondary rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{stats.totalTests}</div>
            <div className="text-xs text-text-muted mt-1">测试次数</div>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{stats.uniqueSessions}</div>
            <div className="text-xs text-text-muted mt-1">独立会话</div>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{stats.totalShares}</div>
            <div className="text-xs text-text-muted mt-1">分享次数</div>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{shareRate}%</div>
            <div className="text-xs text-text-muted mt-1">分享率</div>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{stats.activeDays}</div>
            <div className="text-xs text-text-muted mt-1">活跃天数</div>
          </div>
          <div className="bg-bg-secondary rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{stats.testsLast7Days}</div>
            <div className="text-xs text-text-muted mt-1">近 7 天完成</div>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="text-sm text-text-muted mb-4">运营观察</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="bg-bg-secondary rounded-xl p-4">
              <div className="text-xs text-text-muted mb-2">近 7 天趋势</div>
              <div className="text-xl font-semibold">
                {weeklyTrend === null ? '新' : `${weeklyTrend}%`}
              </div>
              <div className="text-xs text-text-muted mt-2">
                上 7 天 {stats.testsPrevious7Days} 次，本周 {stats.testsLast7Days} 次
              </div>
            </div>
            <div className="bg-bg-secondary rounded-xl p-4">
              <div className="text-xs text-text-muted mb-2">最热一天</div>
              <div className="text-xl font-semibold">
                {stats.bestDay ? stats.bestDay.count : 0}
              </div>
              <div className="text-xs text-text-muted mt-2">
                {stats.bestDay ? stats.bestDay.date : '暂无数据'}
              </div>
            </div>
            <div className="bg-bg-secondary rounded-xl p-4">
              <div className="text-xs text-text-muted mb-2">来源 / 头部集中度</div>
              <div className="text-xl font-semibold">{stats.uniqueSources} / {stats.topPersonalityShare}%</div>
              <div className="text-xs text-text-muted mt-2">
                来源数 / 第一人格占比 / 活跃天均 {stats.avgTestsPerActiveDay} 次
              </div>
            </div>
        </div>
        </section>
        {/* Daily chart (simple bar chart) */}
        {stats.dailyTests.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm text-text-muted mb-4">近 30 天趋势</h2>
            <div className="bg-bg-secondary rounded-xl p-4">
              <div className="flex items-end gap-px h-32">
                {stats.dailyTests.map(d => (
                  <div key={d.date} className="flex-1 flex flex-col items-center justify-end group relative">
                    <div
                      className="w-full bg-bg-tertiary rounded-t min-h-[2px] transition-colors group-hover:bg-bg-tertiary"
                      style={{ height: `${(d.count / maxDaily) * 100}%` }}
                    />
                    <div className="absolute -top-6 hidden group-hover:block text-xs text-text-secondary whitespace-nowrap">
                      {d.date.slice(5)}: {d.count}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-text-muted">
                <span>{stats.dailyTests[0]?.date.slice(5)}</span>
                <span>{stats.dailyTests[stats.dailyTests.length - 1]?.date.slice(5)}</span>
              </div>
            </div>
          </section>
        )}

        {stats.recentResults.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm text-text-muted mb-4">最近完成</h2>
            <div className="space-y-2">
              {stats.recentResults.map((result, index) => (
                <div key={`${result.createdAt}-${index}`} className="bg-bg-secondary rounded-lg p-3 flex items-center gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="text-text-secondary font-mono truncate">{result.personalitySlug}</div>
                    <div className="text-xs text-text-muted mt-1 truncate">{result.source}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-text-secondary">{new Date(result.createdAt).toLocaleDateString('zh-CN')}</div>
                    <div className={`text-[11px] mt-1 ${result.shared ? 'text-green-600' : 'text-text-muted'}`}>
                      {result.shared ? '已分享' : '未分享'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Top personalities */}
        {stats.topPersonalities.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm text-text-muted mb-4">人格分布 TOP 10</h2>
            <div className="space-y-2">
              {stats.topPersonalities.map((p, i) => {
                const pct = stats.totalTests > 0
                  ? ((p.count / stats.totalTests) * 100).toFixed(1)
                  : '0';
                return (
                  <div key={p.slug} className="bg-bg-secondary rounded-lg p-3 flex items-center gap-3">
                    <span className="text-xs text-text-muted w-6">#{i + 1}</span>
                    <span className="text-sm text-text-secondary flex-1 font-mono">{p.slug}</span>
                    <span className="text-sm text-text-secondary">{p.count} 次</span>
                    <span className="text-xs text-text-muted">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {stats.topReferrers.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm text-text-muted mb-4">流量来源 TOP 10</h2>
            <div className="space-y-2">
              {stats.topReferrers.map((referrer, index) => {
                const pct = stats.totalTests > 0
                  ? ((referrer.count / stats.totalTests) * 100).toFixed(1)
                  : '0';

                return (
                  <div key={referrer.source} className="bg-bg-secondary rounded-lg p-3 flex items-center gap-3">
                    <span className="text-xs text-text-muted w-6">#{index + 1}</span>
                    <span className="text-sm text-text-secondary flex-1 truncate">{referrer.source}</span>
                    <span className="text-sm text-text-secondary">{referrer.count}</span>
                    <span className="text-xs text-text-muted">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {stats.totalTests === 0 && (
          <div className="text-center py-16 text-text-muted">
            暂无数据<br />
            <span className="text-sm">发布宇宙后，测试数据将在此展示</span>
          </div>
        )}

        {/* Quick links */}
        <div className="mt-8 flex gap-3">
          <a
            href={withBasePath('/creator/earnings')}
            className="flex-1 py-3 rounded-xl bg-green-600/10 text-green-600 text-sm font-medium text-center hover:bg-green-600/12 transition-colors"
          >
            💰 查看收益中心
          </a>
          <a
            href={withBasePath('/creator/leaderboard')}
            className="flex-1 py-3 rounded-xl bg-bg-secondary text-text-secondary text-sm font-medium text-center hover:bg-bg-tertiary transition-colors"
          >
            🏆 创作者排行榜
          </a>
        </div>
      </div>
    </div>
  );
}
