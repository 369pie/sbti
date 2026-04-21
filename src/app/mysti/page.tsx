'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { WTFTI_PERSONALITIES, getWtftiPersonality } from '@/lib/wtfti-personalities';
import { getMystiTarotData } from '@/lib/mysti/tarot-mapping';
import { trackMystiEvent } from '@/lib/mysti/analytics';
import { useMystiTheme } from '@/components/MystiThemeProvider';
import { captureCreatorReferral } from '@/lib/mysti/creator-referral';
import { PremiumFoilStyles } from '@/components/premium/PremiumFoil';

type FlowStep = 'invite' | 'shuffle' | 'choose';

function MystiLandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useMystiTheme();
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [step, setStep] = useState<FlowStep>('invite');
  const [pickedCardIdx, setPickedCardIdx] = useState<number | null>(null);
  const [showSelfPicker, setShowSelfPicker] = useState(false);
  // 7 张牌的预洗 slug 池（mount 时一次性生成；handler 直接索引读取）
  const [pickPool] = useState<string[]>(() => {
    const pool: string[] = [];
    const used = new Set<number>();
    while (pool.length < 7) {
      const i = Math.floor(Math.random() * WTFTI_PERSONALITIES.length);
      if (used.has(i)) continue;
      used.add(i);
      pool.push(WTFTI_PERSONALITIES[i].slug);
    }
    return pool;
  });

  const partnerSlug = searchParams.get('slug') || '';
  const refCode = searchParams.get('ref') || '';
  const partnerPersonality = partnerSlug ? getWtftiPersonality(partnerSlug) : undefined;
  const partnerData = partnerPersonality ? getMystiTarotData(partnerPersonality.slug) : null;

  // 创作者推荐链接埋点
  useEffect(() => {
    if (refCode) captureCreatorReferral(refCode);
  }, [refCode]);

  useEffect(() => {
    if (partnerSlug && partnerPersonality) {
      trackMystiEvent('mysti_return_landing', { partnerSlug });
    }
  }, [partnerSlug, partnerPersonality]);

  // 入口仪式：洗牌 → 选牌 → 跳转
  const handleShuffle = (mode: 'single' | 'random') => {
    if (mode === 'random') {
      const idx1 = Math.floor(Math.random() * WTFTI_PERSONALITIES.length);
      let idx2 = Math.floor(Math.random() * (WTFTI_PERSONALITIES.length - 1));
      if (idx2 >= idx1) idx2 += 1;
      const p1 = WTFTI_PERSONALITIES[idx1];
      const p2 = WTFTI_PERSONALITIES[idx2];
      router.push(`/mysti/result/${p1.slug}?partner=${p2.slug}&ritual=1`);
      return;
    }
    setStep('shuffle');
    window.setTimeout(() => setStep('choose'), 2500);
  };

  const handleCardPick = (idx: number) => {
    setPickedCardIdx(idx);
    const slug = pickPool[idx % pickPool.length];
    window.setTimeout(() => {
      const url = partnerSlug
        ? `/mysti/result/${slug}?partner=${partnerSlug}&ritual=1`
        : `/mysti/result/${slug}?ritual=1`;
      router.push(url);
    }, 800);
  };

  const handleKnownStart = () => {
    if (!selectedSlug) return;
    if (partnerSlug && partnerPersonality) {
      trackMystiEvent('mysti_return_complete', { selectedSlug, partnerSlug });
    }
    const url = partnerSlug
      ? `/mysti/result/${selectedSlug}?partner=${partnerSlug}`
      : `/mysti/result/${selectedSlug}`;
    router.push(url);
  };

  const bgStyle = useMemo(
    () => ({
      background: `linear-gradient(180deg, ${theme.bgGradient[0]} 0%, ${theme.bgGradient[1]} 100%)`,
      color: theme.text,
    }),
    [theme],
  );

  // ─── 渲染：洗牌动画 ───
  if (step === 'shuffle') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-5 relative overflow-hidden"
        style={bgStyle}
      >
        <div className="relative h-[280px] w-[200px]">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-2xl border-2"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDeep})`,
                borderColor: theme.accentGold,
                boxShadow: `0 0 40px ${theme.cardGlow}`,
              }}
              initial={{ rotate: 0, x: 0, y: 0, opacity: 0 }}
              animate={{
                rotate: [0, (i - 3) * 8, (i - 3) * 14, 0],
                x: [0, (i - 3) * 24, (i - 3) * 38, 0],
                y: [0, -10, 8, 0],
                opacity: [0, 1, 1, 1],
              }}
              transition={{
                duration: 2.4,
                ease: 'easeInOut',
                delay: i * 0.04,
              }}
            >
              <div
                className="absolute inset-3 rounded-xl border flex items-center justify-center"
                style={{ borderColor: theme.accentGold, background: 'transparent' }}
              >
                <span
                  className="text-3xl"
                  style={{ color: theme.accentGold, fontFamily: 'var(--font-display)' }}
                >
                  ✦
                </span>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.p
          className="mt-12 text-base tracking-[0.18em]"
          style={{ color: theme.textMuted, fontFamily: 'var(--font-serif)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          宇宙正在为你洗牌……
        </motion.p>
      </div>
    );
  }

  // ─── 渲染：选牌（3 张背面） ───
  if (step === 'choose') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-5 relative overflow-hidden"
        style={bgStyle}
      >
        <motion.h2
          className="text-xl mb-2 tracking-wider"
          style={{ color: theme.text, fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          选择一张属于你的牌
        </motion.h2>
        <motion.p
          className="text-sm mb-10"
          style={{ color: theme.textMuted }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          相信第一直觉
        </motion.p>

        <div className="flex gap-4 sm:gap-6">
          {[0, 1, 2].map(idx => (
            <motion.button
              key={idx}
              type="button"
              onClick={() => handleCardPick(idx)}
              disabled={pickedCardIdx !== null}
              className="relative h-[220px] w-[140px] sm:h-[260px] sm:w-[170px] rounded-2xl border-2 overflow-hidden focus:outline-none disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDeep})`,
                borderColor: theme.accentGold,
                boxShadow: `0 0 40px ${theme.cardGlow}`,
              }}
              initial={{ opacity: 0, y: 30, rotate: (idx - 1) * 6 }}
              animate={{
                opacity: 1,
                y: pickedCardIdx === idx ? -40 : 0,
                rotate: pickedCardIdx === idx ? 0 : (idx - 1) * 6,
                scale: pickedCardIdx === idx ? 1.08 : 1,
              }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={pickedCardIdx === null ? { y: -12, scale: 1.04 } : undefined}
              whileTap={pickedCardIdx === null ? { scale: 0.96 } : undefined}
            >
              <div
                className="absolute inset-3 rounded-xl border flex flex-col items-center justify-center"
                style={{ borderColor: theme.accentGold }}
              >
                <span
                  className="text-5xl mb-2"
                  style={{ color: theme.accentGold, fontFamily: 'var(--font-display)' }}
                >
                  ✦
                </span>
                <span
                  className="text-xs tracking-[0.3em]"
                  style={{ color: theme.accentGoldSoft }}
                >
                  WTFTI
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {pickedCardIdx !== null && (
          <motion.p
            className="mt-10 text-sm"
            style={{ color: theme.accentGold, fontFamily: 'var(--font-serif)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            ✦ 翻开你的灵魂 ✦
          </motion.p>
        )}
      </div>
    );
  }

  // ─── 默认：邀请页（含合盘回流模式） ───
  return (
    <div
      className="min-h-screen flex items-start sm:items-center justify-center px-5 py-10 relative overflow-hidden"
      style={bgStyle}
    >
      <PremiumFoilStyles />
      {/* 装饰：背景星点 */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        {[...Array(20)].map((_, i) => (
          <span
            key={i}
            className="absolute text-xs"
            style={{
              left: `${(i * 53) % 100}%`,
              top: `${(i * 37) % 100}%`,
              color: theme.accentGold,
            }}
          >
            ✦
          </span>
        ))}
      </div>

      <div className="w-full max-w-md relative">
        {/* Hero */}
        <div className="text-center mb-8">
          <p
            className="text-[11px] tracking-[0.4em] uppercase mb-3"
            style={{ color: theme.accentGold }}
          >
            WTFTI · MYSTI
          </p>
          <h1
            className="text-4xl sm:text-5xl mb-3"
            style={{ color: theme.text, fontFamily: 'var(--font-display)', fontWeight: 400 }}
          >
            灵鉴
          </h1>
          <p
            className="text-sm sm:text-base italic"
            style={{ color: theme.textMuted, fontFamily: 'var(--font-serif)' }}
          >
            用 22 张大阿卡纳，翻译你灵魂的频率
          </p>
        </div>

        {/* ── 今日决策 · 90 秒决策快卡 (E1 v1, 2026-04-21) ── */}
        <Link
          href="/mysti/decision/"
          className="block mb-6 rounded-2xl border px-5 py-5 transition-transform hover:-translate-y-0.5"
          style={{
            borderColor: theme.accentGold,
            background: `linear-gradient(135deg, ${theme.cardSurfaceElevated} 0%, ${theme.cardSurface} 100%)`,
            boxShadow: `0 16px 36px -16px ${theme.cardGlow}`,
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] tracking-[0.42em] uppercase font-bold"
              style={{ color: theme.accentGold }}
            >
              ✦ 今夜决策 · 90 SEC
            </span>
            <span
              className="text-[11px]"
              style={{ color: theme.accent }}
            >
              进入 →
            </span>
          </div>
          <p
            className="mt-3 text-lg italic leading-snug"
            style={{ color: theme.text, fontFamily: 'var(--font-display)' }}
          >
            今夜赴约？此刻交锋？出门远行？
          </p>
          <p
            className="mt-2 text-xs"
            style={{ color: theme.textMuted }}
          >
            选一个场景 · 抽 3 张牌 · 一句可截屏的暮光金句
          </p>
        </Link>


        {/* 价格锚点卡 — 让用户一眼看到 Mysti 体系的三档定价 */}
        <div
          className="mb-6 rounded-2xl border px-5 py-4 backdrop-blur-md"
          style={{
            background: theme.cardSurface,
            borderColor: theme.cardBorder,
            boxShadow: `0 8px 24px ${theme.cardGlow}`,
          }}
        >
          <div
            className="text-[10px] tracking-[0.42em] uppercase mb-3 text-center"
            style={{ color: theme.accentGold, fontFamily: 'var(--font-mono)' }}
          >
            MYSTI · 价位
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { name: '灵魂信', price: '¥9.9', sub: '深度抽牌' },
              { name: '月报', price: '¥6.9', sub: '本月 12 张' },
              { name: '礼品卡', price: '¥39.9', sub: '送 TA 一份' },
            ].map((tier) => (
              <div key={tier.name}>
                <div
                  className="text-[10px] tracking-[0.24em] uppercase mb-1"
                  style={{ color: theme.textSubtle, fontFamily: 'var(--font-mono)' }}
                >
                  {tier.name}
                </div>
                <div
                  className="text-lg italic"
                  style={{ color: theme.accentGold, fontFamily: 'var(--font-display)' }}
                >
                  {tier.price}
                </div>
                <div
                  className="text-[10px] mt-1"
                  style={{ color: theme.textMuted }}
                >
                  {tier.sub}
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/mysti/subscribe/"
            className="mt-3 pt-3 text-center text-xs italic border-t flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
            style={{
              color: theme.textMuted,
              borderColor: theme.cardBorder,
              fontFamily: 'var(--font-serif)',
              textDecoration: 'none',
            }}
          >
            <span
              aria-hidden
              style={{
                display: 'inline-block',
                width: 6,
                height: 6,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 30% 30%, #FFE6A3, #C9A676 60%, #8B6A3A)',
                boxShadow: '0 0 6px rgba(201,166,118,0.5)',
              }}
            />
            想全部解锁？
            <span
              className="premium-foil"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                letterSpacing: '0.18em',
                fontWeight: 600,
              }}
            >
              通行证 · ¥19/月
            </span>
          </Link>
        </div>

        {/* 合盘回流模式 */}
        {partnerPersonality && partnerData && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 p-5 mb-6 text-center backdrop-blur-md"
            style={{
              background: theme.cardSurface,
              borderColor: theme.cardBorderStrong,
              boxShadow: `0 12px 40px ${theme.cardGlow}`,
            }}
          >
            <div
              className="text-[11px] tracking-[0.3em] uppercase mb-3"
              style={{ color: theme.accentGold }}
            >
              TA 的灵魂牌
            </div>
            <div
              className="text-5xl mb-2"
              style={{ color: theme.accentGold, fontFamily: 'var(--font-display)' }}
            >
              {partnerData.majorArcana.name.slice(0, 1)}
            </div>
            <div className="text-2xl mb-1">{partnerPersonality.emoji}</div>
            <div
              className="text-base mb-1"
              style={{ color: theme.text, fontFamily: 'var(--font-serif)' }}
            >
              {partnerData.majorArcana.name}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              <span
                className="text-sm"
                style={{ color: theme.textMuted, fontFamily: 'var(--font-mono)' }}
              >
                {partnerPersonality.code}
              </span>
              <span style={{ color: theme.textSubtle }}>·</span>
              <span className="text-sm" style={{ color: theme.text }}>
                {partnerPersonality.wtftiName}
              </span>
            </div>
            <p
              className="text-sm italic mt-3"
              style={{ color: theme.accentGold, fontFamily: 'var(--font-serif)' }}
            >
              想知道你们的灵魂共振吗？
            </p>
          </motion.div>
        )}

        {/* 主仪式 CTA — 卡牌堆视觉 */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => handleShuffle('single')}
            className="group relative w-full rounded-2xl py-7 px-5 text-center overflow-hidden border transition-all hover:scale-[1.02] active:scale-[0.99]"
            style={{
              background: `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`,
              borderColor: theme.accentGold,
              boxShadow: `0 12px 40px ${theme.cardGlow}`,
            }}
          >
            <span className="absolute top-2 left-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              ✦
            </span>
            <span className="absolute bottom-2 right-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              ✦
            </span>
            <div className="relative">
              <div
                className="text-base mb-1 text-white tracking-wide"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {partnerPersonality ? '✦ 为我们的合盘洗牌' : '✦ 为我洗牌'}
              </div>
              <div className="text-xs text-white/70">
                {partnerPersonality ? '抽出你的灵魂牌，自动配对合盘' : '塔罗仪式 · 大约 30 秒'}
              </div>
            </div>
          </button>

          {/* 已知人格直选 — 折叠式次级 */}
          <details
            className="rounded-xl border"
            style={{ borderColor: theme.cardBorder }}
            onToggle={e => setShowSelfPicker((e.target as HTMLDetailsElement).open)}
          >
            <summary
              className="cursor-pointer px-4 py-3 text-xs tracking-wider list-none flex items-center justify-between"
              style={{ color: theme.textMuted }}
            >
              <span>我已经知道我的人格</span>
              <span style={{ color: theme.accentGold }}>{showSelfPicker ? '−' : '+'}</span>
            </summary>
            <div className="px-4 pb-4 space-y-3">
              <select
                value={selectedSlug}
                onChange={e => setSelectedSlug(e.target.value)}
                className="w-full bg-transparent outline-none cursor-pointer text-sm rounded-lg border px-3 py-2"
                style={{
                  color: theme.text,
                  borderColor: theme.cardBorder,
                }}
              >
                <option value="" style={{ background: theme.cardSurface }}>
                  选择你的 WTFTI 人格
                </option>
                {WTFTI_PERSONALITIES.map(p => (
                  <option key={p.slug} value={p.slug} style={{ background: theme.cardSurface }}>
                    {p.emoji} {p.wtftiName}
                  </option>
                ))}
              </select>
              <button
                onClick={handleKnownStart}
                disabled={!selectedSlug}
                className="w-full py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: theme.accentSoft,
                  color: theme.accent,
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: theme.accent,
                }}
              >
                直接进入解读
              </button>
            </div>
          </details>

          <Link
            href="/wtfti/test/?mode=mysti"
            className="block w-full py-3 rounded-xl text-sm font-medium text-center transition-all hover:opacity-80"
            style={{
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: theme.dividerAccent,
              color: theme.text,
              background: 'transparent',
            }}
          >
            🃏 还没测过？先测 WTFTI 人格
          </Link>
        </div>

        {!partnerPersonality && (
          <div className="mt-6 grid grid-cols-3 gap-2.5">
            <button
              onClick={() => handleShuffle('random')}
              className="py-2.5 rounded-lg text-xs font-medium transition-all hover:bg-white/5"
              style={{
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: theme.cardBorder,
                color: theme.accentGold,
              }}
            >
              🎲 随机合盘
            </button>
            <Link
              href="/mysti/daily/"
              className="py-2.5 rounded-lg text-xs font-medium text-center transition-all hover:bg-white/5"
              style={{
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: theme.cardBorder,
                color: theme.accent,
              }}
            >
              ✦ 每日一牌
            </Link>
            <Link
              href="/mysti/gacha/"
              className="py-2.5 rounded-lg text-xs font-medium text-center transition-all hover:bg-white/5"
              style={{
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: theme.cardBorder,
                color: theme.accentGold,
              }}
            >
              🎴 抽卡
            </Link>
          </div>
        )}

        {/* W3/W5/W6 入口 */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { href: '/mysti/archive/', emoji: '📜', label: '关系档案' },
            { href: '/mysti/mood/', emoji: '🌗', label: '今日心情' },
            { href: '/mysti/seasonal/', emoji: '✦', label: '节气年报' },
            { href: '/mysti/monthly/', emoji: '🌙', label: '灵魂月报' },
            { href: '/mysti/sigil/', emoji: '✺', label: '年度纪章' },
            { href: '/mysti/gift/', emoji: '🎁', label: '礼品卡' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="py-2 rounded-lg text-[11px] text-center transition-all hover:bg-white/5"
              style={{
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: theme.divider,
                color: theme.textMuted,
              }}
            >
              <div className="text-base leading-none mb-0.5">{item.emoji}</div>
              {item.label}
            </Link>
          ))}
        </div>

        <p
          className="text-center text-[11px] mt-7 italic"
          style={{ color: theme.textSubtle, fontFamily: 'var(--font-serif)' }}
        >
          {partnerPersonality
            ? '抽出你的牌，看见你们的灵魂频率'
            : '29 种人格 · 22 张大阿卡纳 · 11 种关系原型'}
        </p>
      </div>
    </div>
  );
}

export default function MystiLandingPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: 'linear-gradient(180deg, #1a1530 0%, #231A3A 100%)' }}
        >
          <div className="text-sm" style={{ color: '#B8AEC2' }}>
            ✦ 加载中
          </div>
        </div>
      }
    >
      <MystiLandingContent />
    </Suspense>
  );
}
