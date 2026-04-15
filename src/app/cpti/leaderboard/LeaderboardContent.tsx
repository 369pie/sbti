'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { trackCptiEvent } from '@/lib/cpti/analytics';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  nickname: string;
  score: number;
}

interface LeaderboardData {
  type: string;
  entries: LeaderboardEntry[];
  myRank: number | null;
  total: number;
}

type TabKey = 'soul_count' | 'rare_count' | 'collection_progress';

const TABS: { key: TabKey; label: string; unit: string }[] = [
  { key: 'soul_count', label: '灵魂伴侣数', unit: '位' },
  { key: 'rare_count', label: '稀有关系数', unit: '种' },
  { key: 'collection_progress', label: '图鉴进度', unit: '种' },
];

function getMedalEmoji(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return '';
}

export default function LeaderboardContent() {
  const [activeTab, setActiveTab] = useState<TabKey>('soul_count');
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async (type: TabKey) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/cpti/leaderboards?type=${type}&limit=50`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('[Leaderboard] fetch error:', err);
      setError('加载排行榜失败，请稍后再试');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    trackCptiEvent('cpti_leaderboard_viewed', { type: activeTab });
  }, []);

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab, fetchLeaderboard]);

  const handleTabChange = (key: TabKey) => {
    if (key !== activeTab) {
      setActiveTab(key);
    }
  };

  const currentTab = TABS.find(t => t.key === activeTab);
  const userId = typeof window !== 'undefined' ? localStorage.getItem('cpti_user_id') : null;

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-subtle bg-bg-secondary/60 text-xs text-text-muted mb-4">
            🏆 CPTI 排行榜
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary mb-2">
            关系图鉴排行
          </h1>
          <p className="text-sm text-text-muted">
            看看谁解锁了最多的CP关系
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 mb-8 bg-bg-secondary/40 p-1 rounded-xl border border-border-subtle">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-bg-elevated text-accent shadow-sm border border-border-subtle'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* My Rank Banner */}
        {data?.myRank != null && userId && (
          <div className="mb-6 rounded-xl border border-accent/20 bg-accent/5 px-5 py-3 flex items-center justify-between">
            <span className="text-sm text-text-secondary">我的排名</span>
            <span className="text-lg font-semibold text-accent">#{data.myRank}</span>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-text-muted">加载中...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-sm text-text-muted">{error}</p>
            <button
              onClick={() => fetchLeaderboard(activeTab)}
              className="mt-4 px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-bg-secondary/50 transition-all cursor-pointer"
            >
              重试
            </button>
          </div>
        ) : !data || data.entries.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-sm text-text-muted">暂无数据</p>
            <p className="text-xs text-text-muted mt-1">
              完成CPTI测试并匹配关系后，你的数据将会出现在这里
            </p>
          </div>
        ) : (
          <>
            {/* Total count */}
            <div className="text-xs text-text-muted mb-4">
              共 {data.total} 位参与者
            </div>

            {/* Leaderboard list */}
            <div className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm overflow-hidden">
              {data.entries.map((entry, i) => {
                const isMe = userId && entry.userId === userId;
                const medal = getMedalEmoji(entry.rank);

                return (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-4 px-5 py-3.5 ${
                      i < data.entries.length - 1 ? 'border-b border-border-subtle' : ''
                    } ${
                      isMe
                        ? 'bg-accent/5 border-l-2 border-l-accent'
                        : 'hover:bg-bg-secondary/30 transition-colors'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center flex-shrink-0">
                      {medal ? (
                        <span className="text-lg">{medal}</span>
                      ) : (
                        <span className={`text-sm font-mono ${entry.rank <= 10 ? 'text-text-primary font-semibold' : 'text-text-muted'}`}>
                          {entry.rank}
                        </span>
                      )}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm truncate block ${isMe ? 'text-accent font-medium' : 'text-text-primary'}`}>
                        {entry.nickname || '匿名用户'}
                        {isMe && <span className="ml-1.5 text-xs">(我)</span>}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="flex-shrink-0 text-right">
                      <span className={`text-sm font-mono ${isMe ? 'text-accent font-semibold' : 'text-text-secondary'}`}>
                        {entry.score}
                      </span>
                      <span className="text-xs text-text-muted ml-1">
                        {currentTab?.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Back link */}
        <div className="text-center mt-10">
          <Link
            href="/cpti"
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            返回CPTI首页
          </Link>
        </div>
      </div>
    </div>
  );
}
