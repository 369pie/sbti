'use client';

/**
 * Growth Timeline (E-12)
 *
 * Local-first activity feed: joins WTF Card universes, Gacha history, Daily
 * streak, CPTI relationships into a single chronological view. Account-gated
 * (only shown under /me).
 */

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ASSET_SYNC_EVENT } from '@/lib/assets/asset-contract';
import { loadCard, type WtfCardData } from '@/lib/wtf-card';
import { getGachaHistory, type GachaResult } from '@/lib/gacha';
import { loadStreak } from '@/lib/daily/moon-phase';

interface TimelineEvent {
  at: number; // ms
  kind: 'universe' | 'relationship' | 'gacha' | 'streak';
  title: string;
  detail: string;
  emoji: string;
  href?: string;
}

function buildEvents(card: WtfCardData | null, gacha: GachaResult[], streakDays: number, lastCheckIn: string): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  if (card) {
    for (const [universeId, res] of Object.entries(card.results ?? {})) {
      if (!res) continue;
      events.push({
        at: new Date(res.testedAt ?? Date.now()).getTime(),
        kind: 'universe',
        title: `解锁 ${universeId} 宇宙`,
        detail: `类型：${res.slug}`,
        emoji: '✨',
        href: `/card/`,
      });
    }
    for (const r of card.relationships ?? []) {
      events.push({
        at: new Date(r.testedAt ?? Date.now()).getTime(),
        kind: 'relationship',
        title: `鉴定关系：${r.slug}`,
        detail: `和 ${r.partnerNickname ?? 'TA'}`,
        emoji: '💕',
        href: `/cpti/relationship/`,
      });
    }
  }

  for (const g of gacha) {
    events.push({
      at: new Date(g.drawnAt).getTime(),
      kind: 'gacha',
      title: `抽到 ${g.universeName} · ${g.slug}`,
      detail: `稀有度 ${g.rarity}`,
      emoji: g.universeEmoji || '🎴',
      href: `/gacha/`,
    });
  }

  if (lastCheckIn) {
    events.push({
      at: new Date(lastCheckIn).getTime(),
      kind: 'streak',
      title: `连续签到 ${streakDays} 天`,
      detail: '今日已打卡',
      emoji: '🌙',
      href: `/daily/`,
    });
  }

  return events.sort((a, b) => b.at - a.at).slice(0, 40);
}

export default function GrowthTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  const refreshEvents = useCallback(() => {
    const card = loadCard();
    const gacha = getGachaHistory();
    const streak = loadStreak();
    setEvents(buildEvents(card, gacha, streak.streak, streak.lastCheckInDate));
  }, []);

  useEffect(() => {
    refreshEvents();
    window.addEventListener(ASSET_SYNC_EVENT, refreshEvents);
    return () => window.removeEventListener(ASSET_SYNC_EVENT, refreshEvents);
  }, [refreshEvents]);

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-5 text-center text-sm text-text-muted">
        还没有成长记录。<br />去测一个宇宙、抽张签，这里会长出时间线。
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-5">
      <h2 className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase mb-4">成长时间轴</h2>
      <div className="relative pl-4">
        <div className="absolute left-1 top-1 bottom-1 w-px bg-border-subtle" />
        <div className="space-y-4">
          {events.map((e, i) => (
            <motion.a
              key={`${e.kind}-${e.at}-${i}`}
              href={e.href ?? '#'}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="block relative"
            >
              <span className="absolute -left-[14px] top-1 text-[10px]">{e.emoji}</span>
              <div className="text-sm text-text-primary">{e.title}</div>
              <div className="text-xs text-text-muted mt-0.5">
                {e.detail} · {new Date(e.at).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}
