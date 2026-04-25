'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getMirrorResults, type MirrorRecord } from '@/lib/wtf-card';
import { getModeDisplayName, getModeEmoji } from '@/lib/mirror/challenge';

// ─── Mock leaderboard data (replace with Supabase later) ─────────────────

interface LeaderboardEntry {
  label: string;
  count: number;
  percentage: number;
  emoji: string;
}

const MOCK_COLOR_SEASONS: LeaderboardEntry[] = [
  { label: '暖秋型', count: 1247, percentage: 28, emoji: '🍂' },
  { label: '冷夏型', count: 1102, percentage: 25, emoji: '🌊' },
  { label: '亮春型', count: 893, percentage: 20, emoji: '🌸' },
  { label: '深冬型', count: 756, percentage: 17, emoji: '❄️' },
  { label: '柔秋型', count: 447, percentage: 10, emoji: '🌾' },
];

const MOCK_STYLES: LeaderboardEntry[] = [
  { label: '原生自然', count: 2103, percentage: 35, emoji: '🌿' },
  { label: '约会玫瑰', count: 1567, percentage: 26, emoji: '🌹' },
  { label: '清冷通勤', count: 1423, percentage: 24, emoji: '🤍' },
  { label: '暗黑辣妹', count: 892, percentage: 15, emoji: '🖤' },
];

const MOCK_FORTUNE_TYPES: LeaderboardEntry[] = [
  { label: '面相气质分析', count: 1892, percentage: 38, emoji: '👁' },
  { label: '掌纹命理分析', count: 1234, percentage: 25, emoji: '🖐' },
  { label: '五官亮点标注', count: 1023, percentage: 20, emoji: '✨' },
  { label: '风格命格解读', count: 856, percentage: 17, emoji: '🔮' },
];

const MOCK_TOTAL_TESTS = 12847;
const MOCK_TOTAL_USERS = 8234;

// ─── Components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div className="rounded-[18px] border border-border-subtle bg-bg-elevated/60 p-5 text-center">
      <p className="eyebrow text-[0.58rem] mb-2">{label}</p>
      <p className="text-3xl font-display text-text-primary">{value}</p>
      {sublabel && <p className="text-xs text-text-muted mt-1">{sublabel}</p>}
    </div>
  );
}

function LeaderboardTable({
  title,
  entries,
  totalLabel,
}: {
  title: string;
  entries: LeaderboardEntry[];
  totalLabel: string;
}) {
  return (
    <div className="rounded-[22px] border border-border-subtle bg-bg-elevated/60 p-6 sm:p-8">
      <h3 className="text-xl font-display text-text-primary mb-6">{title}</h3>
      <div className="space-y-4">
        {entries.map((entry, i) => (
          <div key={entry.label} className="flex items-center gap-4">
            <span className="text-lg w-8 text-center">
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : entry.emoji}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-text-primary">{entry.label}</span>
                <span className="text-xs text-text-muted">{entry.count.toLocaleString()} {totalLabel}</span>
              </div>
              <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${entry.percentage}%`,
                    background: i === 0
                      ? 'var(--color-gold-leaf)'
                      : i === 1
                        ? 'var(--color-rose)'
                        : 'var(--color-text-muted)',
                  }}
                />
              </div>
            </div>
            <span className="text-sm font-mono text-text-muted w-12 text-right">{entry.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyResultsSection({ results }: { results: MirrorRecord[] }) {
  if (results.length === 0) {
    return (
      <div className="rounded-[22px] border border-dashed border-border-subtle bg-bg-elevated/30 p-8 text-center">
        <p className="text-text-muted mb-4">你还没有做过灵镜测试</p>
        <Link href="/mirror/" className="btn btn-rose inline-flex">
          去做测试
          <span className="opacity-70">→</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-[22px] border border-border-subtle bg-bg-elevated/60 p-6 sm:p-8">
      <h3 className="text-xl font-display text-text-primary mb-6">你的灵镜档案</h3>
      <div className="space-y-4">
        {results.slice(0, 5).map((result, i) => (
          <div key={`${result.testedAt}-${i}`} className="flex items-start gap-4 p-4 rounded-[18px] bg-bg-elevated/40">
            <span className="text-xl">{getModeEmoji(result.mode)}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="eyebrow text-[0.58rem]">{getModeDisplayName(result.mode)}</span>
                <span className="text-xs text-text-muted">{result.testedAt}</span>
              </div>
              <p className="text-sm text-text-secondary truncate">{result.summary}</p>
            </div>
          </div>
        ))}
      </div>
      {results.length > 5 && (
        <p className="text-xs text-text-muted mt-4 text-center">
          还有 {results.length - 5} 条历史记录
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function MirrorLeaderboardClient() {
  const [myResults, setMyResults] = useState<MirrorRecord[]>([]);

  useEffect(() => {
    setMyResults(getMirrorResults());
  }, []);

  return (
    <div className="wtfti-site-shell">
      <section className="wtfti-section pt-16 sm:pt-24">
        <div className="wtfti-container max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="serial-number text-sm">Ranking</span>
              <span className="editorial-rule w-20" />
              <span className="eyebrow">灵镜排行榜</span>
            </div>

            <h1 className="wtfti-display text-4xl sm:text-6xl mb-6">
              看看大家
              <span className="block text-rose-deep">都在测什么</span>
            </h1>

            <p className="wtfti-copy max-w-xl mx-auto">
              最热门的色彩季节、风格类型和命纹分析方向。
            </p>
          </div>

          {/* Stats overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <StatCard label="总测试次数" value={MOCK_TOTAL_TESTS.toLocaleString()} />
            <StatCard label="活跃用户" value={MOCK_TOTAL_USERS.toLocaleString()} />
            <StatCard label="最热门色彩" value="暖秋型" sublabel="28% 用户" />
            <StatCard label="最热门风格" value="原生自然" sublabel="35% 用户" />
          </div>

          {/* Leaderboard tables */}
          <div className="grid gap-8 lg:grid-cols-2 mb-10">
            <LeaderboardTable
              title="🎨 色彩季节分布"
              entries={MOCK_COLOR_SEASONS}
              totalLabel="用户"
            />
            <LeaderboardTable
              title="🌹 风格类型偏好"
              entries={MOCK_STYLES}
              totalLabel="用户"
            />
          </div>

          <div className="mb-10">
            <LeaderboardTable
              title="✦ 命纹分析方向"
              entries={MOCK_FORTUNE_TYPES}
              totalLabel="次"
            />
          </div>

          {/* My results */}
          <MyResultsSection results={myResults} />

          {/* CTA */}
          <div className="text-center mt-10">
            <Link href="/mirror/" className="btn btn-rose inline-flex">
              去做灵镜测试
              <span className="opacity-70">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
