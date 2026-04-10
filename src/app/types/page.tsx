'use client';

import { PERSONALITY_TYPES } from '@/lib/personalities';
import { PersonalityCard } from '@/components/PersonalityCard';
import { motion } from 'framer-motion';

export default function TypesPage() {
  const regular = PERSONALITY_TYPES.filter(p => !p.isSpecial);
  const special = PERSONALITY_TYPES.filter(p => p.isSpecial);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 sm:mb-12"
      >
        <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-2">
          All Types
        </span>
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight mb-2">
          27 种人格类型总览
        </h1>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
          五大模型十五维度交叉分析，每种人格都有独特的维度组合。
        </p>
      </motion.div>

      {/* Regular types — 2 cols mobile, 3 cols tablet, 4 cols desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-12 sm:mb-16">
        {regular.map((p, i) => (
          <PersonalityCard key={p.slug} personality={p} index={i} />
        ))}
      </div>

      {/* Special types */}
      {special.length > 0 && (
        <>
          <div className="mb-6 sm:mb-8">
            <span className="text-xs font-mono tracking-[0.2em] text-accent uppercase block mb-2">
              Special
            </span>
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
              特殊人格类型
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1">需要触发特定条件才可能出现的结果。</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {special.map((p, i) => (
              <PersonalityCard key={p.slug} personality={p} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
