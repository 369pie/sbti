'use client';

/**
 * /start · 测试大厅 (audit 2026-10-20 Phase 1).
 * Replaces the 3-question triage. 首测 is featured; the rest are live tests
 * worth doing, each saying how long it takes and what she gets.
 */

import Link from 'next/link';
import { useEffect } from 'react';

import { trackFunnelEvent } from '@/lib/analytics/funnel';
import { enqueueProductEvent } from '@/lib/analytics/product-events';

import styles from './hall.module.css';

interface HallItem {
  id: string;
  href: string;
  title: string;
  desc: string;
  meta: string[];
}

const GROUPS: Array<{ eyebrow: string; title: string; items: HallItem[] }> = [
  {
    eyebrow: 'About me',
    title: '再多懂自己一点',
    items: [
      { id: 'soulti', href: '/soulti/test/', title: 'SoulTI · 深夜版的你', desc: '25 道向内看的小问题，写一封只给你的长信', meta: ['约 6 分钟', '32 种结果'] },
      { id: 'classic', href: '/test/classic/', title: '经典 SBTI 人格', desc: '最早那版的 46 题，老朋友都做过', meta: ['约 8 分钟', '经典'] },
    ],
  },
  {
    eyebrow: 'Me & him',
    title: '我和他',
    items: [
      { id: 'wohe', href: '/xpti/couple/', title: '我和他 · 合不合', desc: '你先测，再邀请他测，拿到你们俩的关系报告', meta: ['双人', '约 5 分钟'] },
      { id: 'xpti', href: '/xpti/test/', title: '我的亲密偏好', desc: '你在亲密关系里真正需要什么', meta: ['约 5 分钟', '12 种原型'] },
    ],
  },
  {
    eyebrow: 'Tarot',
    title: '翻一张牌',
    items: [
      { id: 'mysti', href: '/mysti/', title: '塔罗 · 你的那张牌', desc: '洗牌、抽一张，聊聊最近的心事', meta: ['约 1 分钟', '仅供娱乐'] },
    ],
  },
];

const NUMS = ['i', 'ii', 'iii', 'iv'];

function trackPick(id: string) {
  enqueueProductEvent('home', 'test_hall_click', { step: 'hall_click', props: { test_id: id } });
}

export function StartContent() {
  useEffect(() => {
    // Keep the historical entry event so dashboards stay comparable.
    trackFunnelEvent('onboarding_start', { module: 'home', source: 'test_hall' });
  }, []);

  return (
    <main className={`skin-journal ${styles.page}`}>
      <div className={styles.inner}>
        <p className="s-eyebrow">Tests · 测试大厅</p>
        <h1 className={`s-title ${styles.h1}`}>今天想测点什么？</h1>
        <p className={styles.sub}>每个测试的结果都会进你的档案，测得越多，今日卡越懂你。</p>

        <Link href="/test/" prefetch={false} className={`s-card s-card--lined ${styles.hero}`} onClick={() => trackPick('first_look')}>
          <div className="s-tape" />
          <div className={styles.heroTop}>
            <span className="s-eyebrow">首测 · 从这里开始</span>
            <span className={styles.badge}>90 秒</span>
          </div>
          <h2 className={`s-title ${styles.heroTitle}`}>看看你是哪一种女生</h2>
          <p className={styles.heroDesc}>10 道凭直觉的小题。测完送你一份档案和每天一张今日卡。</p>
          <span className="s-btn">开始首测</span>
        </Link>

        {GROUPS.map((g) => (
          <section key={g.title} className={styles.group}>
            <p className="s-eyebrow">{g.eyebrow}</p>
            <h2 className={`s-title ${styles.groupTitle}`}>{g.title}</h2>
            <div className={styles.list}>
              {g.items.map((t, i) => (
                <Link key={t.id} href={t.href} prefetch={false} className={`s-card ${styles.item}`} onClick={() => trackPick(t.id)}>
                  <span className={styles.num} aria-hidden>{NUMS[i]}</span>
                  <span className={styles.body}>
                    <span className={`s-title ${styles.title}`}>{t.title}</span>
                    <span className={styles.desc} style={{ display: 'block' }}>{t.desc}</span>
                    <span className={styles.meta}>{t.meta.map((m) => <span key={m}>{m}</span>)}</span>
                  </span>
                  <span className={styles.arrow} aria-hidden>›</span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <p className={styles.fine}>免费 · 不用注册 · 所有结果仅供娱乐与自我探索</p>
      </div>
    </main>
  );
}
