'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getApiPath } from '@/lib/api';

interface LeaderboardEntry {
  creatorId: string;
  creatorName: string;
  creatorAvatar: string | null;
  isVerified: boolean;
  totalTests: number;
  totalShares: number;
  universeCount: number;
  topUniverse: {
    id: string;
    name: string;
    emoji: string;
    slug: string;
    tests: number;
  } | null;
}

function formatNumber(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function LeaderboardContent() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const res = await fetch(getApiPath('/creator/leaderboard'));
    if (res.ok) {
      const data = await res.json();
      setEntries(data.entries);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold mb-2">🏆 创作者排行榜</h1>
          <p className="text-sm text-text-muted">
            最受欢迎的人格宇宙创作者
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-text-muted">加载中…</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted mb-4">暂无创作者上榜</p>
            <Link
              href="/creator/apply"
              className="inline-block px-6 py-2.5 rounded-full bg-bg-tertiary text-text-secondary text-sm hover:bg-bg-tertiary transition-colors"
            >
              申请成为创作者 →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <div
                key={entry.creatorId}
                className={`rounded-2xl p-5 transition-colors ${
                  i < 3
                    ? 'bg-gradient-to-r from-white/[0.08] to-white/[0.03] border border-border-subtle'
                    : 'bg-bg-secondary hover:bg-bg-tertiary'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="w-8 text-center">
                    {i < 3 ? (
                      <span className="text-xl">{medals[i]}</span>
                    ) : (
                      <span className="text-sm text-text-muted font-mono">#{i + 1}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <Link
                    href={`/creator/profile/${entry.creatorId}/`}
                    className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center text-lg overflow-hidden shrink-0"
                  >
                    {entry.creatorAvatar ? (
                      <img
                        src={entry.creatorAvatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{entry.creatorName.slice(0, 1)}</span>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/creator/profile/${entry.creatorId}/`} className="font-medium truncate hover:text-text-secondary transition-colors">
                        {entry.creatorName}
                      </Link>
                      {entry.isVerified && (
                        <span className="text-blue-600 text-xs">✓</span>
                      )}
                    </div>
                    <div className="text-xs text-text-muted mt-0.5 flex items-center gap-2">
                      <span>{entry.universeCount} 个宇宙</span>
                      {entry.topUniverse && (
                        <>
                          <span>·</span>
                          <Link
                            href={`/c/${entry.topUniverse.slug}/test/`}
                            className="hover:text-text-secondary transition-colors"
                          >
                            {entry.topUniverse.emoji} {entry.topUniverse.name}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {formatNumber(entry.totalTests)}
                    </div>
                    <div className="text-[10px] text-text-muted">测试次数</div>
                  </div>
                  <div className="text-right min-w-[50px]">
                    <div className="text-sm text-text-secondary">
                      {formatNumber(entry.totalShares)}
                    </div>
                    <div className="text-[10px] text-text-muted">分享</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTAs */}
        <div className="mt-12 flex gap-3">
          <Link
            href="/creator"
            className="flex-1 py-3 rounded-xl bg-bg-secondary text-text-secondary text-sm font-medium text-center hover:bg-bg-tertiary transition-colors"
          >
            创作者中心
          </Link>
          <Link
            href="/creator/apply"
            className="flex-1 py-3 rounded-xl bg-bg-tertiary text-text-primary text-sm font-medium text-center hover:bg-bg-tertiary transition-colors"
          >
            申请成为创作者 →
          </Link>
        </div>
      </div>
    </div>
  );
}
