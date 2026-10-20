'use client';

/**
 * 首测 result · v3 奶油日记 (audit 2026-10-20 Phase 1).
 * Emotional-value first: 被说中的一句 → 你在扛的 → 你值得.
 * Then ONE next step: 一键存档 (stores this result) → /today. Secondary: 美我 · 我和他.
 */

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { ArchiveSaveCard } from '@/components/ArchiveSaveCard';
import type { FirstLookShareImageGeneratorHandle } from '@/components/FirstLookShareImageGenerator';
import { FIRST_LOOK_ARCHETYPES, getArchetypeBySlug } from '@/lib/first-look/archetypes';
import { trackFirstLook } from '@/lib/first-look/analytics';
import { getHerCopy } from '@/lib/first-look/her-copy';
import { loadFirstLookResult } from '@/lib/first-look/session';
import { withBasePath } from '@/lib/site';

import styles from '@/app/test/test-v3.module.css';

const FirstLookShareImageGenerator = dynamic(
  () => import('@/components/FirstLookShareImageGenerator').then((m) => m.FirstLookShareImageGenerator),
  { ssr: false },
);

export function FirstLookResultContent({ slug }: { slug: string }) {
  const archetype = getArchetypeBySlug(slug);
  const shareRef = useRef<FirstLookShareImageGeneratorHandle>(null);
  const [own, setOwn] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const stored = loadFirstLookResult();
      setOwn(!!stored && stored.slug === slug);
    });
  }, [slug]);

  if (!archetype) {
    return (
      <div className={`skin-journal ${styles.page}`}>
        <div className={styles.inner}>
          <h1 className={`s-title ${styles.h2}`}>这一页还没写好。</h1>
          <Link href="/test/" prefetch={false} className="s-btn">90 秒测测你是谁</Link>
        </div>
      </div>
    );
  }

  const her = getHerCopy(slug);

  const share = async () => {
    trackFirstLook('first_look_share', { slug, channel: 'copy', code: archetype.code });
    const url = typeof window !== 'undefined' ? window.location.href.split('?')[0] : '';
    const text = `我测出来是「${archetype.name}」：${her.seen}\n你也来测测 👉 ${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `我是「${archetype.name}」`, text, url });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // user cancelled
    }
  };

  return (
    <div className={`skin-journal ${styles.page}`}>
      <div className={styles.inner}>
        <article className={`s-card ${styles.hero}`}>
          <div className="s-tape" />
          <p className={styles.code}>No.{archetype.code} · 首测</p>
          <h1 className={`s-title ${styles.name}`}>{archetype.name}</h1>
          <p className={styles.essence}>{archetype.essence}</p>
          <p className={`s-title ${styles.seen}`}>「{her.seen}」</p>
          <div className={styles.chips}>
            {her.strengths.map((t) => <span key={t}>{t}</span>)}
          </div>
          <p className={styles.rare}>大约 {archetype.holdRate}% 的女生和你一样</p>
        </article>

        <section className={styles.sec}>
          <div className={`s-card s-card--lined ${styles.note}`}>
            <div className="s-tape s-tape--peach" />
            <div className={styles.noteRow}>
              <p className={styles.noteK}>你默默在扛的</p>
              <p className={styles.noteV}>{her.carrying}</p>
            </div>
            <div className={styles.noteRow}>
              <p className={styles.noteK}>你值得</p>
              <p className={styles.noteV}>{her.deserve}</p>
            </div>
            <div className={styles.noteRow}>
              <p className={styles.noteK}>写给你</p>
              <p className={styles.noteV}>{archetype.prose}</p>
            </div>
          </div>
          <p style={{ textAlign: 'right', marginTop: 8 }}><span className={styles.hand}>↑ 截图发给最懂你的人</span></p>
        </section>

        <section className={styles.sec}>
          {own === false ? (
            <>
              <p className="s-eyebrow">朋友的结果</p>
              <h2 className={`s-title ${styles.h2}`}>你又是哪一种？</h2>
              <Link href="/test/" prefetch={false} className="s-btn">90 秒测测我自己</Link>
            </>
          ) : (
            <>
              <p className="s-eyebrow">Next · 下一步</p>
              <h2 className={`s-title ${styles.h2}`}>把这一页存进你的档案，<br />每天给你一张今日卡</h2>
              <ArchiveSaveCard
                source="first_look_result"
                result={{ test_id: 'first_look', result_key: slug, result_name: archetype.name }}
              />
            </>
          )}
        </section>

        <section className={styles.sec}>
          <p className="s-eyebrow">也可以看看</p>
          <div className={styles.next} style={{ marginTop: 12 }}>
            <Link href="/mirror/" prefetch={false} className={`s-card ${styles.nextCard}`}>
              <p className="s-eyebrow">美我</p>
              <h3 className={`s-title ${styles.nextTitle}`}>适合你的颜色</h3>
              <p className={styles.nextDesc}>{archetype.name}穿什么最显气色</p>
            </Link>
            <Link href="/xpti/couple/" prefetch={false} className={`s-card ${styles.nextCard}`}>
              <p className="s-eyebrow">我和他</p>
              <h3 className={`s-title ${styles.nextTitle}`}>他是哪一种？</h3>
              <p className={styles.nextDesc}>邀请他一起测，看你们合不合</p>
            </Link>
          </div>
        </section>

        <div className={styles.actions}>
          <button type="button" onClick={() => void share()}>{copied ? '已复制，去粘贴吧' : '分享给朋友'}</button>
          <button
            type="button"
            onClick={() => {
              trackFirstLook('first_look_share', { slug, channel: 'poster', code: archetype.code });
              void shareRef.current?.download();
            }}
          >
            保存结果图
          </button>
          <Link href="/test/" prefetch={false}>重新测</Link>
          <Link href="/start/" prefetch={false}>更多测试</Link>
        </div>
        <p className={styles.fine}>结果仅供娱乐与自我探索</p>
      </div>
      <FirstLookShareImageGenerator ref={shareRef} archetype={archetype} />
    </div>
  );
}

export const FIRST_LOOK_RESULT_SLUGS = FIRST_LOOK_ARCHETYPES.map((a) => a.slug);
export { withBasePath };
