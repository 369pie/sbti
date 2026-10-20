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
import { trackTestFinish, trackTestStart } from '@/lib/analytics/test-events';

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
      trackTestStart('mysti_reading');
      trackTestFinish('mysti_reading', p1.slug);
      router.push(`/mysti/result/${p1.slug}?partner=${p2.slug}&ritual=1`);
      return;
    }
    trackTestStart('mysti_reading');
    setStep('shuffle');
    window.setTimeout(() => setStep('choose'), 2500);
  };

  const handleCardPick = (idx: number) => {
    setPickedCardIdx(idx);
    const slug = pickPool[idx % pickPool.length];
    trackTestFinish('mysti_reading', slug);
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

      <div className="w-full max-w-md relative pb-6">
        {/* Hero — 她的私人神谕室 */}
        <div className="text-center mb-9 mt-6 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <p
              className="text-[10px] tracking-[0.4em] uppercase mb-4"
              style={{ color: theme.accentGold, fontFamily: 'var(--font-mono)' }}
            >
              HER · TWILIGHT · ORACLE
            </p>
            <h1
              className="text-5xl sm:text-6xl mb-4 italic leading-[0.95]"
              style={{ color: theme.text, fontFamily: 'var(--font-display)', fontWeight: 400 }}
            >
              灵鉴
            </h1>
            <p
              className="mx-auto max-w-[22rem] text-[13px] sm:text-sm leading-[1.85]"
              style={{ color: theme.textMuted, fontFamily: 'var(--font-serif)' }}
            >
              <span className="italic" style={{ color: theme.text }}>她的</span>私人神谕室<br />
              一座可以随时回访的暮光神龛<br />
              把每一次提问，写成一页可收藏的灵魂档案
            </p>
            <div className="mx-auto mt-6 flex items-center justify-center gap-3">
              <span style={{ color: theme.accentGold }}>✦</span>
              <span
                className="text-[10px] tracking-[0.32em] uppercase"
                style={{ color: theme.textSubtle, fontFamily: 'var(--font-mono)' }}
              >
                FOR HER · BY HER · ABOUT HER
              </span>
              <span style={{ color: theme.accentGold }}>✦</span>
            </div>
          </motion.div>
        </div>

        {/* --- ONE membership (audit decision 4: 暮光通行证 folded into ¥19/月 会员) --- */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-9"
        >
          <Link
            href="/member/"
            className="group relative block rounded-2xl p-[1px] overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg"
          >
            <div
              className="absolute inset-0 transition-opacity duration-700 opacity-60 group-hover:opacity-100"
              style={{
                background: `linear-gradient(135deg, ${theme.accentGold}40, ${theme.accentGold}, ${theme.accentGold}40)`,
              }}
            />
            <div
              className="relative rounded-[15px] p-5 h-full flex flex-col"
              style={{
                background: `linear-gradient(135deg, ${theme.cardSurfaceElevated} 0%, ${theme.cardSurface} 100%)`,
              }}
            >
              <div className="flex justify-between items-center mb-3">
                <span
                  className="text-[10px] tracking-[0.25em] font-bold uppercase"
                  style={{ color: theme.accentGold, fontFamily: 'var(--font-mono)' }}
                >
                  会员 · ¥19/月
                </span>
                <span className="premium-foil text-[11px] font-semibold tracking-widest uppercase">
                  了解会员 →
                </span>
              </div>
              <p
                className="text-[20px] italic mb-1.5 tracking-wide leading-snug"
                style={{ color: theme.text, fontFamily: 'var(--font-display)' }}
              >
                一个会员，塔罗也包含在内
              </p>
              <p
                className="text-[11px] leading-relaxed"
                style={{ color: theme.textMuted, fontFamily: 'var(--font-serif)' }}
              >
                每日一牌加抽 · 每月小报告 · Plus 分享卡 · 今日卡 / 美我 / 深度报告同享 · 到期不自动续费
              </p>
            </div>
          </Link>
        </motion.div>

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

        {/* --- 三大暮光提问（对标 Tianfu，女性诗化重写） --- */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mb-9"
        >
          <div className="text-center mb-4">
            <p
              className="text-[10px] tracking-[0.36em] uppercase"
              style={{ color: theme.accentGold, fontFamily: 'var(--font-mono)' }}
            >
              ✦ 她的三个暮光提问 ✦
            </p>
            <p
              className="mt-2 text-[12px] italic"
              style={{ color: theme.textMuted, fontFamily: 'var(--font-serif)' }}
            >
              点一题，让宇宙替你回答。
            </p>
          </div>
          <div className="space-y-3">
            {[
              {
                kicker: '关系',
                glyph: '❍',
                title: '在他/她身边，我会更亮还是更暗？',
                sub: '能量匹配 · 暗涌信号 · 沟通窗口',
                href: '/mysti/decision/date/',
              },
              {
                kicker: '选择',
                glyph: '✕',
                title: '现在该转身离开，还是再等一程？',
                sub: '走留时机 · 上升轨迹 · 隐性代价',
                href: '/mysti/decision/interview/',
              },
              {
                kicker: '绽放',
                glyph: '✿',
                title: '我下一段绽放，会从哪片土壤里长出？',
                sub: '潜能挖掘 · 天赋方位 · 萌芽信号',
                href: '/mysti/decision/travel/',
              },
            ].map((q, i) => (
              <Link
                key={q.kicker}
                href={q.href}
                className="group block rounded-2xl border px-5 py-4 transition-all hover:-translate-y-0.5 hover:border-opacity-100"
                style={{
                  borderColor: theme.cardBorder,
                  background: `linear-gradient(135deg, ${theme.cardSurface} 0%, ${theme.cardSurfaceElevated} 100%)`,
                  boxShadow: `0 6px 20px -10px ${theme.cardGlow}`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{
                      borderWidth: 1,
                      borderStyle: 'solid',
                      borderColor: theme.accentGold,
                      color: theme.accentGold,
                      background: theme.accentSoft,
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {q.glyph}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="text-[10px] tracking-[0.28em] uppercase"
                        style={{ color: theme.accentGold, fontFamily: 'var(--font-mono)' }}
                      >
                        Q.{(i + 1).toString().padStart(2, '0')} · {q.kicker}
                      </span>
                      <span className="text-[11px]" style={{ color: theme.textSubtle }}>→</span>
                    </div>
                    <p
                      className="text-[15px] italic leading-snug mb-1.5"
                      style={{ color: theme.text, fontFamily: 'var(--font-display)' }}
                    >
                      {q.title}
                    </p>
                    <p
                      className="text-[11px] leading-relaxed"
                      style={{ color: theme.textMuted }}
                    >
                      {q.sub}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* --- 暮光月相 · 今日一签（每日回访 hook） --- */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="mb-9"
        >
          <Link
            href="/mysti/daily/"
            className="group relative block rounded-2xl border overflow-hidden transition-all hover:-translate-y-0.5"
            style={{
              borderColor: theme.cardBorderStrong,
              background: `linear-gradient(110deg, ${theme.cardSurfaceElevated} 0%, ${theme.cardSurface} 60%, ${theme.accentSoft} 100%)`,
              boxShadow: `0 10px 28px -14px ${theme.cardGlow}`,
            }}
          >
            <div className="flex items-center gap-5 px-5 py-5">
              <div className="relative shrink-0 w-16 h-16">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, ${theme.accentGold}, ${theme.accent} 60%, transparent 80%)`,
                    opacity: 0.55,
                    filter: 'blur(1px)',
                  }}
                />
                <div
                  className="absolute inset-1 rounded-full"
                  style={{
                    background: theme.cardSurfaceElevated,
                    boxShadow: `inset -10px -8px 16px ${theme.accentDeep}, inset 10px 8px 14px ${theme.accentGold}30`,
                  }}
                />
                <span
                  className="absolute inset-0 flex items-center justify-center text-[10px] tracking-[0.22em] uppercase"
                  style={{ color: theme.accentGold, fontFamily: 'var(--font-mono)' }}
                >
                  ☾
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[10px] tracking-[0.28em] uppercase mb-1"
                  style={{ color: theme.accentGold, fontFamily: 'var(--font-mono)' }}
                >
                  暮光月相 · 今日一签
                </div>
                <p
                  className="text-[17px] italic leading-snug"
                  style={{ color: theme.text, fontFamily: 'var(--font-display)' }}
                >
                  抽一张属于今晚的牌。
                </p>
                <p
                  className="text-[11px] mt-1.5 leading-relaxed"
                  style={{ color: theme.textMuted }}
                >
                  60 秒 · 月相 + 心情 + 一句暮光签辞
                </p>
              </div>
              <span className="text-[11px]" style={{ color: theme.accent }}>→</span>
            </div>
          </Link>
        </motion.div>

        {/* --- CORE ACTION: SHUFFLE TAROT --- */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 space-y-3"
        >
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
            <span className="absolute top-3 left-3 text-[10px] opacity-40" style={{ color: theme.text }}>✦</span>
            <span className="absolute bottom-3 right-3 text-[10px] opacity-40" style={{ color: theme.text }}>✦</span>
            <div className="relative">
              <div
                className="text-lg mb-1 tracking-widest"
                style={{ color: theme.text, fontFamily: 'var(--font-serif)' }}
              >
                {partnerPersonality ? '看见我们怎样 · 为合盘洗牌' : '看见我是谁 · 为我洗牌'}
              </div>
              <div className="text-[11px] tracking-widest uppercase" style={{ color: theme.textSubtle, fontFamily: 'var(--font-mono)' }}>
                {partnerPersonality ? '抽出灵魂牌自动配对' : '塔罗人格仪式 · 大约 30 秒'}
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
              className="cursor-pointer px-4 py-3 text-[13px] tracking-wider list-none flex items-center justify-between"
              style={{ color: theme.textMuted }}
            >
              <span>我已经知道我的人格</span>
              <span style={{ color: theme.accentGold }}>{showSelfPicker ? '−' : '+'}</span>
            </summary>
            <div className="px-4 pb-4 space-y-3">
              <select
                value={selectedSlug}
                onChange={e => setSelectedSlug(e.target.value)}
                className="w-full bg-transparent outline-none cursor-pointer text-sm rounded-lg border px-3 py-3"
                style={{
                  color: theme.text,
                  borderColor: theme.cardBorderStrong,
                }}
              >
                <option value="" style={{ background: theme.cardSurfaceElevated }}>
                  选择你的 WTFTI 人格
                </option>
                {WTFTI_PERSONALITIES.map(p => (
                  <option key={p.slug} value={p.slug} style={{ background: theme.cardSurfaceElevated }}>
                    {p.emoji} {p.wtftiName}
                  </option>
                ))}
              </select>
              <button
                onClick={handleKnownStart}
                disabled={!selectedSlug}
                className="w-full py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
            className="block w-full py-3.5 rounded-xl text-sm font-medium text-center transition-all hover:opacity-80"
            style={{
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: theme.dividerAccent,
              color: theme.text,
              background: 'transparent',
            }}
          >
            还没测过？先测 WTFTI 人格
          </Link>
        </motion.div>

        {/* --- 信任徽章（对标 Tianfu 的 250+ 工具） --- */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          className="mb-8 grid grid-cols-4 gap-2 rounded-2xl border px-3 py-4"
          style={{ borderColor: theme.cardBorder, background: `${theme.cardSurface}80` }}
        >
          {[
            { num: '29', label: '灵魂人格' },
            { num: '22', label: '大阿卡纳' },
            { num: '11', label: '关系原型' },
            { num: '3K+', label: '诗辞签卡' },
          ].map(b => (
            <div key={b.label} className="text-center">
              <div
                className="text-xl italic leading-none"
                style={{ color: theme.accentGold, fontFamily: 'var(--font-display)' }}
              >
                {b.num}
              </div>
              <div
                className="mt-1.5 text-[9px] tracking-[0.18em] uppercase"
                style={{ color: theme.textSubtle, fontFamily: 'var(--font-mono)' }}
              >
                {b.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* 三层系统：让用户理解灵鉴 / 灵镜 / 灵笺的闭环 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 rounded-2xl border px-5 py-5 backdrop-blur-md"
          style={{
            background: theme.cardSurface,
            borderColor: theme.cardBorder,
            boxShadow: `0 8px 24px ${theme.cardGlow}`,
          }}
        >
          <div
            className="text-[10px] tracking-[0.35em] uppercase mb-4 text-center"
            style={{ color: theme.accentGold, fontFamily: 'var(--font-mono)' }}
          >
            ASK · SEE · ARCHIVE
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { name: '问心', value: '灵鉴', sub: '决策 · 命书' },
              { name: '现身', value: '灵镜', sub: '色彩 · 妆发' },
              { name: '留痕', value: '灵笺', sub: '档案 · 回看' },
            ].map((tier) => (
              <div key={tier.name}>
                <div
                  className="text-[10px] tracking-[0.24em] uppercase mb-1.5"
                  style={{ color: theme.textSubtle, fontFamily: 'var(--font-mono)' }}
                >
                  {tier.name}
                </div>
                <div
                  className="text-xl italic"
                  style={{ color: theme.accentGold, fontFamily: 'var(--font-display)' }}
                >
                  {tier.value}
                </div>
                <div
                  className="text-[10px] mt-1.5"
                  style={{ color: theme.textMuted }}
                >
                  {tier.sub}
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/mirror/"
            className="mt-4 pt-4 text-center text-xs italic border-t flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
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
                background: 'radial-gradient(circle at 30% 30%, #FFE6A3, #C9A676 60%, #8B6A3A)',
                boxShadow: '0 0 6px rgba(201,166,118,0.5)',
              }}
            />
            已有结果？
            <span
              className="premium-foil"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                letterSpacing: '0.18em',
                fontWeight: 600,
              }}
            >
              回到我的灵笺
            </span>
          </Link>
        </motion.div>

        {!partnerPersonality && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8 grid grid-cols-3 gap-3"
          >
            <button
              onClick={() => handleShuffle('random')}
              className="py-3 rounded-xl text-xs font-medium transition-all hover:bg-white/5"
              style={{
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: theme.cardBorderStrong,
                color: theme.accentGold,
              }}
            >
              随机合盘
            </button>
            <Link
              href="/mysti/destiny/"
              className="py-3 rounded-xl text-xs font-medium text-center transition-all hover:bg-white/5"
              style={{
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: theme.cardBorderStrong,
                color: theme.accent,
              }}
            >
              命书馆
            </Link>
            <Link
              href="/mirror/"
              className="py-3 rounded-xl text-xs font-medium text-center transition-all hover:bg-white/5"
              style={{
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: theme.cardBorderStrong,
                color: theme.accentGold,
              }}
            >
              我的灵笺
            </Link>
          </motion.div>
        )}

        {/* 更多仪式：保留资产，但不再和首屏主路径抢焦点 */}
        <motion.details
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-3 rounded-xl border" 
          style={{ borderColor: theme.divider }}
        >
          <summary
            className="cursor-pointer list-none px-4 py-3 text-center text-[11px] tracking-[0.24em] uppercase"
            style={{ color: theme.textMuted }}
          >
            更多仪式
          </summary>
          <div className="grid grid-cols-3 gap-2 px-3 pb-3">
            {[
              { href: '/mysti/archive/', label: '关系档案' },
              { href: '/mysti/daily/', label: '每日一牌' },
              { href: '/mysti/gacha/', label: '抽卡' },
              { href: '/mysti/mood/', label: '今日心情' },
              { href: '/mysti/monthly/', label: '灵魂月报' },
              { href: '/mysti/gift/', label: '礼品卡' },
              { href: '/mysti/seasonal/', label: '节气年报' },
              { href: '/mysti/sigil/', label: '年度纪章' },
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
                {item.label}
              </Link>
            ))}
          </div>
        </motion.details>

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
          <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            ✦ 加载中
          </div>
        </div>
      }
    >
      <MystiLandingContent />
    </Suspense>
  );
}
