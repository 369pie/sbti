'use client';

/**
 * 首测 · official first test (audit 2026-10-20 Phase 1).
 * ≤10 quick questions (~90s), design system v3 奶油日记. Opens straight on Q1 —
 * the homepage「90 秒测」lands here with no triage in between.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FIRST_LOOK_QUESTIONS, type FirstLookOption } from '@/lib/first-look/questions';
import { computeFirstLookResult, type FirstLookAnswerMap } from '@/lib/first-look/scoring';
import { saveFirstLookResult } from '@/lib/first-look/session';
import { trackFirstLook } from '@/lib/first-look/analytics';
import { getArchetypeBySlug } from '@/lib/first-look/archetypes';
import { trackTestFinish, trackTestStart } from '@/lib/analytics/test-events';
import { recordUniverseResult } from '@/lib/wtf-card';
import { withBasePath } from '@/lib/site';

import styles from '@/app/test/test-v3.module.css';

const NUMS = ['i', 'ii', 'iii'];
const ADVANCE_MS = 220;
const SEAL_MS = 900;

export function FirstLookQuiz() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<FirstLookAnswerMap>(() => new Map());
  const [picked, setPicked] = useState<string | null>(null);
  const [sealing, setSealing] = useState(false);
  const startAt = useRef<number>(0);
  const busy = useRef(false);

  const total = FIRST_LOOK_QUESTIONS.length;
  const question = FIRST_LOOK_QUESTIONS[index];

  useEffect(() => {
    startAt.current = Date.now();
    trackFirstLook('first_look_entry', { stage: 'start_quiz' });
    trackTestStart('first_look');
  }, []);

  const finalize = useCallback(
    (finalAnswers: FirstLookAnswerMap) => {
      const result = computeFirstLookResult(finalAnswers);
      const slug = result.archetype.slug;
      const elapsed = startAt.current ? Date.now() - startAt.current : undefined;
      saveFirstLookResult({ slug, code: result.archetype.code, vector: result.vector, deepDive: result.deepDive });
      trackFirstLook('first_look_finish', {
        slug,
        code: result.archetype.code,
        rarity: result.archetype.rarity,
        primary: result.deepDive[0]?.target,
        elapsed_ms: elapsed,
      });
      trackTestFinish('first_look', slug, {
        name: getArchetypeBySlug(slug)?.name,
        href: `/test/result/${slug}/`,
        elapsedMs: elapsed,
      });
      try {
        recordUniverseResult('first-look', slug);
      } catch {
        // optional
      }
      router.push(withBasePath(`/test/result/${slug}/?fresh=1`));
    },
    [router],
  );

  const select = useCallback(
    (option: FirstLookOption) => {
      if (!question || busy.current) return;
      busy.current = true;
      setPicked(option.key);
      const next = new Map(answers);
      next.set(question.id, option.key);
      trackFirstLook('first_look_q', { id: question.id, key: option.key });
      setAnswers(next);
      window.setTimeout(() => {
        setPicked(null);
        busy.current = false;
        if (index + 1 >= total) {
          setSealing(true);
          window.setTimeout(() => finalize(next), SEAL_MS);
        } else {
          setIndex((i) => i + 1);
        }
      }, ADVANCE_MS);
    },
    [answers, finalize, index, question, total],
  );

  const back = useCallback(() => {
    if (index > 0 && !busy.current) setIndex((i) => i - 1);
  }, [index]);

  if (sealing) {
    return (
      <div className={`skin-journal ${styles.page}`}>
        <div className={`${styles.inner} ${styles.sealing}`} aria-live="polite">
          <p className="s-eyebrow">首测 · 完成</p>
          <p className={styles.sealHand}>正在写你的那一页…</p>
          <div className={styles.dots} aria-hidden><i /><i /><i /></div>
        </div>
      </div>
    );
  }

  if (!question) return null;
  const progress = Math.round((index / total) * 100);

  return (
    <div className={`skin-journal ${styles.page}`}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <button type="button" className={styles.back} onClick={back} disabled={index === 0} aria-label="上一题">
            ← 上一题
          </button>
          <span className={styles.count}>{index + 1} / {total}</span>
        </div>
        <div className={styles.bar} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <i style={{ width: `${Math.max(4, progress)}%` }} />
        </div>

        {index === 0 && (
          <header className={styles.intro}>
            <p className="s-eyebrow">首测 · 约 90 秒</p>
            <h1 className={`s-title ${styles.introTitle}`}>凭第一感觉选，<br /><em>看看你是谁</em></h1>
            <p className={styles.introSub}>{total} 道小题，不用想太久。测完送你一份自己的档案和今日卡。</p>
          </header>
        )}

        <section className={styles.q} key={question.id}>
          <p className="s-eyebrow">{question.eyebrow.replace(/^Q\d+\s*·\s*/, '')}</p>
          <h2 className={`s-title ${styles.qTitle}`}>{question.prompt}</h2>
          <div className={styles.opts}>
            {question.options.map((o, i) => (
              <button
                key={o.key}
                type="button"
                onClick={() => select(o)}
                className={`s-card ${styles.opt} ${picked === o.key ? styles.optOn : ''}`}
              >
                <span className={styles.optNum} aria-hidden>{NUMS[i]}</span>
                <span>
                  <span className={styles.optLabel}>{o.label}</span>
                  {o.sublabel ? <span className={styles.optSub}>{o.sublabel}</span> : null}
                </span>
              </button>
            ))}
          </div>
        </section>

        <p className={styles.fine}>
          免费 · 不用注册 · 仅供娱乐与自我探索
          {index === 0 ? (
            <>
              <br />想做更长的？<Link href="/start/" prefetch={false}>去测试大厅</Link>
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}
