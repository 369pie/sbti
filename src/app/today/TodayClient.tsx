'use client';

/**
 * /today · 已登录首页（P1 + P3 会员）
 * 奶油日记 skin-journal；今日卡由档案确定性生成；会员解锁完整今日。
 */

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { DailyEmailToggle } from '@/components/DailyEmailToggle';
import { DailyReminderToggle } from '@/components/DailyReminderToggle';
import { MembershipSubscribeCard } from '@/components/MembershipSubscribeCard';
import { trackFunnelEvent } from '@/lib/analytics/funnel';
import { getApiPath } from '@/lib/api';
import type { ArchiveGap } from '@/lib/today/today-card';

import styles from './today.module.css';

interface TodayPayload {
  ok: true;
  isAnonymous?: boolean;
  greeting: string;
  nickname: string;
  dateLabel: string;
  streak: { count: number; lastVisitDate: string };
  card: {
    fortune: string;
    luckyColor: { name: string; hex: string; tip: string };
    makeup: string;
    outfit: string | null;
    dateISO: string;
    full: boolean;
  };
  membership: {
    isMember: boolean;
    expiresAt: string | null;
    tryOnCap: number;
    deepDiscount: number;
    renewHint: string;
    priceLabel: string;
  };
  archive: {
    completenessPct: number;
    gaps: ArchiveGap[];
  };
}

type LoadState =
  | { status: 'loading' }
  | { status: 'guest' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: TodayPayload };

const MOODS = [
  { id: 'good', label: '还不错' },
  { id: 'ok', label: '一般般' },
  { id: 'low', label: '有点闷' },
  { id: 'mad', label: '烦躁' },
] as const;

export function TodayClient() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [mood, setMood] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(getApiPath('/today/'), { credentials: 'include', cache: 'no-store' });
      if (res.status === 401) {
        setState({ status: 'guest' });
        return;
      }
      if (!res.ok) {
        setState({ status: 'error', message: '今日卡暂时读不出来，稍后再试' });
        return;
      }
      const data = (await res.json()) as TodayPayload;
      if (!data?.ok) {
        setState({ status: 'error', message: '今日卡暂时读不出来，稍后再试' });
        return;
      }
      setState({ status: 'ready', data });
    } catch {
      setState({ status: 'error', message: '网络不太稳，稍后再打开看看' });
    }
  }, []);

  useEffect(() => {
    trackFunnelEvent('module_landing_view', { module: 'wtfti', source: '/today' });
    void load();
  }, [load]);

  if (state.status === 'loading') {
    return (
      <main className={`skin-journal ${styles.page}`}>
        <div className={`${styles.inner} ${styles.loading}`}>今日卡准备中…</div>
      </main>
    );
  }

  if (state.status === 'guest') {
    return (
      <main className={`skin-journal ${styles.page}`}>
        <div className={styles.inner}>
          <section className={styles.guest}>
            <p className="s-eyebrow">Today · 今日</p>
            <h1 className={`s-title ${styles.guestTitle}`}>
              登录后，每天一张<br />
              只写给你的今日卡
            </h1>
            <p className={styles.guestSub}>
              运势、幸运色、妆容一句，都会跟着你的档案走。先花 90 秒测测自己，一键就能存下档案。
            </p>
            <div className={styles.guestActions}>
              <Link href="/start/" prefetch={false} className="s-btn">
                90 秒测一测 · 免注册建档
              </Link>
              <Link href="/auth/login/?next=%2Ftoday%2F" prefetch={false} className={styles.secondary}>
                已有账号，登录
              </Link>
            </div>
          </section>
          {/* 提醒不依赖登录：/api/push/subscribe 接受匿名会话。之前只在登录态渲染，导致绝大多数访客根本看不到开关。 */}
          <div className={styles.reminders} id="remind">
            <DailyReminderToggle />
          </div>
          <p className={styles.fine}>仅供娱乐与自我探索</p>
        </div>
      </main>
    );
  }

  if (state.status === 'error') {
    return (
      <main className={`skin-journal ${styles.page}`}>
        <div className={`${styles.inner} ${styles.error}`}>
          <p>{state.message}</p>
          <button type="button" className="s-btn" style={{ marginTop: 16, maxWidth: 240, marginInline: 'auto' }} onClick={() => void load()}>
            再试一次
          </button>
        </div>
      </main>
    );
  }

  const { data } = state;
  const streakLabel =
    data.streak.count <= 1 ? '今天是第 1 天' : `连续第 ${data.streak.count} 天`;
  const isMember = data.membership?.isMember === true;
  const full = data.card.full === true || isMember;

  return (
    <main className={`skin-journal ${styles.page}`}>
      <div className={styles.inner}>
        <header className={styles.greeting}>
          <p className="s-eyebrow">{data.dateLabel}</p>
          <h1 className={`s-title ${styles.hi}`}>
            {data.greeting}，<em>{data.nickname}</em>
          </h1>
          <span className={styles.streak}>
            <strong>{streakLabel}</strong>
            <span aria-hidden="true">·</span>
            <span>回来看看就好</span>
          </span>
        </header>

        <article className={`s-card s-card--lined ${styles.card}`}>
          <div className="s-tape" />
          <div className={styles.cardHead}>
            <span className={`s-en ${styles.date}`}>TODAY · 今日卡</span>
            <span className={`s-en ${styles.tag}`}>{full ? '会员完整版' : '只给你'}</span>
          </div>
          <p className={`s-title ${styles.fortune}`}>{data.card.fortune}</p>
          <div className={styles.row}>
            <span className={styles.k}>幸运色</span>
            <i className={styles.sw} style={{ background: data.card.luckyColor.hex }} aria-hidden="true" />
            <span className={styles.v}>
              {data.card.luckyColor.name}
              <small>{data.card.luckyColor.tip}</small>
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.k}>妆容</span>
            <i className={styles.sw} style={{ background: '#B07A7A' }} aria-hidden="true" />
            <span className={styles.v}>
              今日一句
              <small>{data.card.makeup}</small>
            </span>
          </div>
          {full && data.card.outfit ? (
            <div className={styles.row}>
              <span className={styles.k}>穿搭</span>
              <i className={styles.sw} style={{ background: data.card.luckyColor.hex }} aria-hidden="true" />
              <span className={styles.v}>
                今日示意
                <small>{data.card.outfit}</small>
              </span>
            </div>
          ) : (
            <p className={styles.memberHint}>完整今日含穿搭示意 · 会员 ¥19/月 · 到期不自动续费</p>
          )}
        </article>

        {data.isAnonymous ? (
          <p className={styles.memberHint}>
            档案目前只存在这台设备上 ·{' '}
            <Link href="/auth/register/?next=%2Ftoday%2F" prefetch={false} className={styles.moodLink}>
              绑定账号，换手机也不丢
            </Link>
          </p>
        ) : (
        <MembershipSubscribeCard
          redirectPath="/today/"
          skin="journal"
          variant="card"
          isMember={isMember}
          expiresAt={data.membership?.expiresAt ?? null}
          className={styles.memberCard}
        />
        )}

        <section className={`s-card ${styles.mood}`}>
          <div className="s-tape s-tape--peach" />
          <p className="s-eyebrow">Check-in</p>
          <h2 className={`s-title ${styles.moodTitle}`}>今天心情？</h2>
          <div className={styles.moodRow} role="group" aria-label="心情打卡">
            {MOODS.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`${styles.moodBtn} ${mood === m.id ? styles.moodBtnSelected : ''}`}
                onClick={() => setMood(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className={styles.moodNote}>
            {mood ? '记下了。想多说一句的话，' : '点一下就好。想写长一点，'}
            <Link href="/bottle/" prefetch={false} className={styles.moodLink}>
              写进树洞
            </Link>
          </p>
        </section>

        <section className={`s-card ${styles.archive}`}>
          <div className="s-tape s-tape--sage" />
          <div className={styles.archiveHead}>
            <p className="s-eyebrow">你的档案</p>
            <span className={styles.archivePct}>{data.archive.completenessPct}% 完整</span>
          </div>
          <div className={styles.bar} aria-hidden="true">
            <div className={styles.barFill} style={{ width: `${Math.min(100, data.archive.completenessPct)}%` }} />
          </div>
          {data.archive.gaps.length > 0 ? (
            <>
              <p style={{ fontSize: 13, color: 'var(--s-ink-2)', marginBottom: 10 }}>
                还差：补全后，今日卡会更像为你写的
              </p>
              <div className={styles.gaps}>
                {data.archive.gaps.map((g) => (
                  <Link key={g.key} href={g.href} prefetch={false} className={styles.gap}>
                    {g.label} →
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--s-ink-2)' }}>档案已经挺完整了，继续保持每日回来就好。</p>
          )}
        </section>

        <div className={styles.reminders} id="remind">
          <DailyReminderToggle />
          <DailyEmailToggle />
        </div>

        <p className={styles.fine}>仅供娱乐与自我探索 · 同一天打开，内容不变</p>
      </div>
    </main>
  );
}
