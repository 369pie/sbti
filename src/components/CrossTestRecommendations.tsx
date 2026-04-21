'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { loadCard, CARD_UNIVERSE_IDS } from '@/lib/wtf-card';

interface TestRecommendation {
  id: string;
  emoji: string;
  title: string;
  hook: string;
  href: string;
  accent: string;
  /** Maps to a CARD_UNIVERSE_ID if this test lights up a WTF Card slot */
  cardUniverseId?: string;
}

const ALL_TESTS: TestRecommendation[] = [
  { id: 'sbti', emoji: '🧬', title: 'SBTI 人格测试', hook: '27 种抽象人设，测完截图发朋友圈', href: '/test', accent: '#e8729c', cardUniverseId: 'standard' },
  { id: 'love', emoji: '💕', title: '恋爱人设', hook: '亲密关系里你是什么人？', href: '/love', accent: '#f472b6' },
  { id: 'work', emoji: '💼', title: '打工人设', hook: '工位上的灵魂状态鉴定', href: '/work', accent: '#818cf8' },
  { id: 'daily', emoji: '📅', title: '今日模式', hook: '今天你是什么状态？', href: '/daily', accent: '#34d399' },
  { id: 'drunk', emoji: '🍻', title: '酒后人设', hook: '喝多了你是哪种人？', href: '/drunk', accent: '#f59e0b' },
  { id: 'cp', emoji: '🔮', title: 'CP 配对', hook: '拉好友来看你们配不配', href: '/cp', accent: '#a78bfa' },
  { id: 'squad', emoji: '🎪', title: '组局测试', hook: '看看你们这群人有多抽象', href: '/squad', accent: '#fb923c' },
  { id: 'combo', emoji: '🧩', title: '人格拼盘', hook: 'SBTI × MBTI × 星座三合一', href: '/combo', accent: '#a78bfa' },
  { id: 'xpti', emoji: '💜', title: 'XPTI 亲密偏好', hook: '你想要的是谁？', href: '/xpti', accent: '#c084fc', cardUniverseId: 'xpti' },
  { id: 'soulti', emoji: '🌙', title: 'SoulTI 自然人格', hook: '向内看见你是哪种自然力', href: '/soulti', accent: '#8b7355', cardUniverseId: 'soulti' },
  { id: 'flower', emoji: '🌸', title: '花TI 花格鉴定', hook: '测测你像自然界的哪朵花', href: '/flower', accent: '#e11d48', cardUniverseId: 'flower' },
  { id: 'identify', emoji: '🔍', title: '好友鉴定器', hook: '帮你朋友鉴定ta是什么人格', href: '/identify', accent: '#ec4899' },
  { id: 'cpti', emoji: '💗', title: 'CPTI 关系角色', hook: 'CPTI：你在关系里扮演什么角色？', href: '/cpti', accent: '#f43f5e', cardUniverseId: 'cpti' },
  { id: 'wtfti', emoji: '✦', title: 'WTFTI 人格神域', hook: '90 秒召唤一位主神 — 看看哪位神选了你', href: '/wtfti/galaxy/test/', accent: '#C9A676', cardUniverseId: 'wtfti' },
];

interface Props {
  /** Current test ID to exclude from recommendations */
  currentTest: string;
  /** Personality name for personalized hooks */
  personalityName?: string;
  /** Max recommendations to show */
  max?: number;
  /** Optional visual variant for universe-specific pages */
  variant?: 'default' | 'xpti';
}

export function CrossTestRecommendations({ currentTest, personalityName, max = 4, variant = 'default' }: Props) {
  const [testedUniverses, setTestedUniverses] = useState<Set<string>>(new Set());
  // `variant` retained for API compatibility; visual treatment is unified
  // under the editorial paper vocabulary so cross-test cards always read as
  // part of the same museum spread, regardless of host universe.
  void variant;

  useEffect(() => {
    const card = loadCard();
    if (!card) return;
    const tested = new Set<string>();
    for (const uid of CARD_UNIVERSE_IDS) {
      if (card.results[uid]) tested.add(uid);
    }
    setTestedUniverses(tested);
  }, []);

  // Smart sorting: prioritize untested card-universe tests, then others
  const recommendations = ALL_TESTS
    .filter(t => t.id !== currentTest)
    .sort((a, b) => {
      const aUntested = a.cardUniverseId && !testedUniverses.has(a.cardUniverseId) ? 1 : 0;
      const bUntested = b.cardUniverseId && !testedUniverses.has(b.cardUniverseId) ? 1 : 0;
      return bUntested - aUntested; // untested card universes first
    })
    .slice(0, max);

  return (
    <section className="max-w-2xl mx-auto px-6 pb-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div
          aria-hidden
          className="mx-auto mb-3 h-px w-10"
          style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold-leaf, #C9A676), transparent)' }}
        />
        <h2
          className="text-[11px] font-mono tracking-[0.32em] uppercase text-center mb-1.5"
          style={{ color: 'var(--color-gold, #B8905A)' }}
        >
          Continue · 再来一个
        </h2>
        <p className="text-xs text-center mb-5 italic text-text-secondary">
          {personalityName ? `${personalityName}，再来一个？` : '不过瘾？再来一个'}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {recommendations.map(test => {
            const isTested = test.cardUniverseId ? testedUniverses.has(test.cardUniverseId) : false;
            return (
              <Link
                key={test.id}
                href={test.href}
                prefetch={false}
                className="group relative rounded-2xl border border-border-subtle bg-bg-elevated p-4 sm:p-5 shadow-sm transition-all hover:-translate-y-px hover:border-border hover:shadow-md"
                style={{ backgroundImage: `linear-gradient(135deg, ${test.accent}08 0%, transparent 60%)` }}
              >
                {/* Untested badge — nudge to try */}
                {test.cardUniverseId && !isTested && (
                  <span
                    className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[10px] font-semibold tracking-wide"
                    style={{
                      background: 'rgba(168, 90, 110, 0.14)',
                      color: 'var(--color-rose-deep, #A85A6E)',
                      border: '1px solid rgba(168, 90, 110, 0.28)',
                    }}
                  >
                    未解锁
                  </span>
                )}
                {/* Tested badge */}
                {isTested && (
                  <span
                    className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[10px] font-semibold tracking-wide"
                    style={{
                      background: 'rgba(91, 110, 106, 0.14)',
                      color: 'var(--color-gem, #5B6E6A)',
                      border: '1px solid rgba(91, 110, 106, 0.28)',
                    }}
                  >
                    ✓ 已测
                  </span>
                )}
                <div className="text-2xl mb-2" aria-hidden>{test.emoji}</div>
                <h3 className="text-sm font-semibold mb-1 text-text-primary transition-colors group-hover:text-accent">
                  {test.title}
                </h3>
                <p className="text-xs leading-relaxed text-text-secondary">{test.hook}</p>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
