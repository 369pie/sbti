'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface TestRecommendation {
  id: string;
  emoji: string;
  title: string;
  hook: string;
  href: string;
  accent: string;
}

const ALL_TESTS: TestRecommendation[] = [
  { id: 'sbti', emoji: '🧬', title: 'SBTI 人格测试', hook: '27 种抽象人设，测完截图发朋友圈', href: '/test', accent: '#e8729c' },
  { id: 'love', emoji: '💕', title: '恋爱人设', hook: '亲密关系里你是什么人？', href: '/love', accent: '#f472b6' },
  { id: 'work', emoji: '💼', title: '打工人设', hook: '工位上的灵魂状态鉴定', href: '/work', accent: '#818cf8' },
  { id: 'daily', emoji: '📅', title: '今日模式', hook: '今天你是什么状态？', href: '/daily', accent: '#34d399' },
  { id: 'drunk', emoji: '🍻', title: '酒后人设', hook: '喝多了你是哪种人？', href: '/drunk', accent: '#f59e0b' },
  { id: 'cp', emoji: '🔮', title: 'CP 配对', hook: '拉好友来看你们配不配', href: '/cp', accent: '#a78bfa' },
  { id: 'squad', emoji: '🎪', title: '组局测试', hook: '看看你们这群人有多抽象', href: '/squad', accent: '#fb923c' },
  { id: 'combo', emoji: '🧩', title: '人格拼盘', hook: 'SBTI × MBTI × 星座三合一', href: '/combo', accent: '#a78bfa' },
  { id: 'xpti', emoji: '💜', title: 'XPTI 恋爱XP', hook: '你的恋爱DNA是什么体质？', href: '/xpti', accent: '#c084fc' },
  { id: 'jueti', emoji: '🌙', title: '觉TI 自然人格', hook: '向内看见你是哪种自然力', href: '/jueti', accent: '#8b7355' },
];

interface Props {
  /** Current test ID to exclude from recommendations */
  currentTest: string;
  /** Personality name for personalized hooks */
  personalityName?: string;
  /** Max recommendations to show */
  max?: number;
}

export function CrossTestRecommendations({ currentTest, personalityName, max = 4 }: Props) {
  const recommendations = ALL_TESTS.filter(t => t.id !== currentTest).slice(0, max);

  return (
    <section className="max-w-2xl mx-auto px-6 pb-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
          {personalityName ? `${personalityName}，再来一个？` : '不过瘾？再来一个'}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {recommendations.map(test => (
            <Link
              key={test.id}
              href={test.href}
              className="group rounded-2xl border border-border-subtle hover:border-border bg-bg-elevated hover:shadow-md transition-all p-4 sm:p-5"
            >
              <div className="text-2xl mb-2">{test.emoji}</div>
              <h3 className="text-sm font-semibold text-text-primary mb-1 group-hover:text-accent transition-colors">
                {test.title}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">{test.hook}</p>
            </Link>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
