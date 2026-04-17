'use client';

import { motion } from 'framer-motion';
import { useMystiTheme } from '@/components/MystiThemeProvider';
import { MystiPaywall } from '@/components/MystiPaywall';
import { getSoulLetter, hasSoulLetter } from '@/lib/mysti/soul-letters';

interface Props {
  slug: string;
  /** 用户的 WTFTI 显示名 */
  displayName: string;
}

/**
 * 灵魂信完整 UI（含 Paywall）
 * 没有写过的型 → 显示"敬请期待 + 邀请投票"占位
 */
export function MystiSoulLetterSection({ slug, displayName }: Props) {
  const { theme } = useMystiTheme();
  const letter = getSoulLetter(slug);

  if (!hasSoulLetter(slug) || !letter) {
    return (
      <section
        className="rounded-2xl p-6 mt-10 text-center"
        style={{
          background: theme.cardSurface,
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: theme.cardBorder,
          color: theme.text,
        }}
      >
        <div
          className="text-3xl mb-3"
          style={{ color: theme.accentGold, fontFamily: 'var(--font-display)' }}
        >
          ✦
        </div>
        <h3
          className="text-lg mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {displayName} 的灵魂信，正在写给你
        </h3>
        <p className="text-sm" style={{ color: theme.textMuted }}>
          每周新增 2 型 · 老钱米手写体限定
        </p>
      </section>
    );
  }

  const preview = (
    <article style={{ color: theme.text }}>
      <div
        className="text-[11px] tracking-[0.3em] uppercase mb-3"
        style={{ color: theme.accentGold }}
      >
        SOUL LETTER · {slug.toUpperCase()}
      </div>
      <h2
        className="text-2xl mb-4"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {letter.title}
      </h2>
      <p
        className="text-base leading-relaxed mb-3 italic"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {letter.open}
      </p>
      <p
        className="text-base leading-relaxed"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {letter.shadow.slice(0, 60)}……
      </p>
    </article>
  );

  const fullContent = (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="rounded-2xl p-7"
      style={{
        background: theme.cardSurface,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.cardBorderStrong,
        color: theme.text,
        boxShadow: `0 12px 40px ${theme.cardGlow}`,
      }}
    >
      <div
        className="text-[11px] tracking-[0.3em] uppercase mb-3"
        style={{ color: theme.accentGold }}
      >
        SOUL LETTER · {slug.toUpperCase()}
      </div>
      <h2
        className="text-3xl mb-1"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {letter.title}
      </h2>
      <div
        className="h-px my-5"
        style={{ background: theme.dividerAccent }}
      />

      <p
        className="text-base leading-loose mb-5 italic"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {letter.open}
      </p>

      <h4
        className="text-xs tracking-[0.2em] uppercase mb-2"
        style={{ color: theme.accentGold }}
      >
        ☾ 你的阴影
      </h4>
      <p
        className="text-base leading-loose mb-6"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {letter.shadow}
      </p>

      <h4
        className="text-xs tracking-[0.2em] uppercase mb-2"
        style={{ color: theme.accentGold }}
      >
        ⚛︎ 神经化学
      </h4>
      <p
        className="text-base leading-loose mb-6"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {letter.neuro}
      </p>

      <h4
        className="text-xs tracking-[0.2em] uppercase mb-3"
        style={{ color: theme.accentGold }}
      >
        ✦ 修复处方
      </h4>
      <ol
        className="list-decimal pl-5 space-y-3 mb-6"
        style={{ color: theme.text, fontFamily: 'var(--font-serif)' }}
      >
        {letter.heal.map((h, i) => (
          <li key={i} className="leading-loose">
            {h}
          </li>
        ))}
      </ol>

      <h4
        className="text-xs tracking-[0.2em] uppercase mb-2"
        style={{ color: theme.accentGold }}
      >
        ☆ 灵魂共振
      </h4>
      <div
        className="rounded-xl p-4 mb-6"
        style={{
          background: theme.accentSoft,
          color: theme.text,
          fontFamily: 'var(--font-serif)',
        }}
      >
        <div className="font-medium mb-1">{letter.resonance.name}</div>
        <div className="text-sm" style={{ color: theme.textMuted }}>
          {letter.resonance.reason}
        </div>
      </div>

      <p
        className="text-base leading-loose italic mt-4 pt-4"
        style={{
          borderTop: `1px solid ${theme.dividerAccent}`,
          fontFamily: 'var(--font-serif)',
          color: theme.accentGold,
        }}
      >
        {letter.closing}
      </p>
    </motion.article>
  );

  return (
    <section className="mt-10">
      <MystiPaywall
        sku="soul-letter"
        resourceId={slug}
        lockedTitle={letter.title}
        preview={preview}
      >
        {fullContent}
      </MystiPaywall>
    </section>
  );
}
