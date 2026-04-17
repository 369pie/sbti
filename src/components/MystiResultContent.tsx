'use client';

import { useCallback, useRef, useState, useSyncExternalStore, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { WtftiPersonality } from '@/lib/wtfti-personalities';
import { getWtftiPersonality } from '@/lib/wtfti-personalities';
import { MYSTI_THEMES } from '@/lib/mysti/themes';
import type { MystiTheme, MystiShareImageGeneratorHandle } from '@/lib/mysti/types';
import { getMystiTarotData } from '@/lib/mysti/tarot-mapping';
import { getDualInterpretation } from '@/lib/mysti/dual-interpretation';
import { MystiShareImageGenerator } from '@/components/MystiShareImageGenerator';
import { UniverseSwitcher } from '@/components/UniverseSwitcher';
import { WtfiTheoryWiring } from '@/components/WtfiTheoryWiring';
import { MystiSoulLetterSection } from '@/components/MystiSoulLetterSection';
import { Typewriter } from '@/components/Typewriter';
import { trackMystiEvent } from '@/lib/mysti/analytics';
import { markCollected } from '@/lib/mysti/collection';
import { recordDualPair } from '@/lib/mysti/dual-archive';

interface Props {
  wtftiPersonality: WtftiPersonality;
}

const THEME_STORAGE_KEY = 'mysti-theme-preference';

export function MystiResultContent({ wtftiPersonality }: Props) {
  const searchParams = useSearchParams();
  const partnerSlug = searchParams.get('partner');
  const partnerPersonality = partnerSlug ? getWtftiPersonality(partnerSlug) : undefined;

  // Mark as collected on mount
  useEffect(() => {
    markCollected('mysti', wtftiPersonality.slug);
  }, [wtftiPersonality.slug]);

  // Track dual view + W3 sink to relationship archive
  useEffect(() => {
    if (partnerPersonality && wtftiPersonality) {
      trackMystiEvent('mysti_dual_view', {
        personality: wtftiPersonality.slug,
        partner: partnerPersonality.slug,
      });
      const selfData = getMystiTarotData(wtftiPersonality.slug);
      const otherData = getMystiTarotData(partnerPersonality.slug);
      if (selfData && otherData) {
        const interp = getDualInterpretation(
          wtftiPersonality.slug,
          partnerPersonality.slug,
          selfData,
          otherData,
        );
        recordDualPair({
          selfSlug: wtftiPersonality.slug,
          partnerSlug: partnerPersonality.slug,
          archetypeId: interp.archetype.id,
          archetypeName: interp.archetype.name,
          archetypeEmoji: interp.archetype.emoji,
        });
      }
    }
  }, [partnerPersonality, wtftiPersonality]);

  useEffect(() => {
    if (partnerPersonality && wtftiPersonality) {
      const dualTitle = `${wtftiPersonality.wtftiName} × ${partnerPersonality.wtftiName} — 关系灵鉴`;
      document.title = dualTitle;
      const updateMeta = (selector: string, content: string) => {
        const el = document.querySelector(selector) as HTMLMetaElement | null;
        if (el) el.content = content;
      };
      updateMeta('meta[property="og:title"]', `我们的灵鉴结果：${wtftiPersonality.wtftiName} × ${partnerPersonality.wtftiName}`);
      updateMeta('meta[name="twitter:title"]', `我们的灵鉴结果：${wtftiPersonality.wtftiName} × ${partnerPersonality.wtftiName}`);
    }
  }, [partnerPersonality, wtftiPersonality]);

  const [themeId, setThemeId] = useState<MystiTheme['id']>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'pale' || stored === 'celestial') {
        return stored;
      }
    }
    return 'celestial';
  });
  const shareRef = useRef<MystiShareImageGeneratorHandle>(null);

  // Avoid setState-in-effect linter warning while handling SSR safely
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const toggleTheme = useCallback(() => {
    setThemeId(prev => {
      const next = prev === 'celestial' ? 'pale' : 'celestial';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      }
      return next;
    });
  }, []);

  const theme = MYSTI_THEMES[themeId];
  const data = getMystiTarotData(wtftiPersonality.slug);
  const partnerData = partnerPersonality ? getMystiTarotData(partnerPersonality.slug) : null;

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: theme.bg, color: theme.text }}>
        <p className="text-center">暂无灵鉴数据</p>
      </div>
    );
  }

  const gradientBgStyle = {
    background: `linear-gradient(180deg, ${theme.gradientBg[0]} 0%, ${theme.gradientBg[1]} 100%)`,
    color: theme.text,
  };

  return (
    <div className="min-h-screen" style={gradientBgStyle}>
      {/* Top bar */}
      <div className="max-w-3xl mx-auto px-6 pt-6 pb-4 flex items-center justify-between">
        <Link href="/wtfti/" className="text-sm font-medium tracking-wide opacity-80 hover:opacity-100 transition-opacity" style={{ color: theme.textMuted }}>
          WTFTI · 灵鉴
        </Link>
        <button
          onClick={toggleTheme}
          className="px-3 py-1.5 rounded-full text-xs border transition-all hover:brightness-110"
          style={{ borderColor: theme.divider, color: theme.accent, background: theme.accentSoft }}
          aria-label="切换主题"
        >
          {theme.label}
        </button>
      </div>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pb-12">
        {!partnerPersonality ? (
          <SingleModeContent
            personality={wtftiPersonality}
            data={data}
            theme={theme}
            mounted={mounted}
            shareRef={shareRef}
          />
        ) : partnerData ? (
          <DualModeContent
            personality={wtftiPersonality}
            data={data}
            partner={partnerPersonality}
            partnerData={partnerData}
            theme={theme}
            mounted={mounted}
            shareRef={shareRef}
          />
        ) : (
          <SingleModeContent
            personality={wtftiPersonality}
            data={data}
            theme={theme}
            mounted={mounted}
            shareRef={shareRef}
          />
        )}
      </main>
    </div>
  );
}

function SingleModeContent({
  personality,
  data,
  theme,
  mounted,
  shareRef,
}: {
  personality: WtftiPersonality;
  data: { majorArcana: { name: string; keywords: string[] }; shadowArcana: { name: string; keywords: string[] }; tagline: string; reading?: string; shadowReading?: string; whyThisCard?: string };
  theme: MystiTheme;
  mounted: boolean;
  shareRef: React.RefObject<MystiShareImageGeneratorHandle | null>;
}) {
  return (
    <>
      {/* Header */}
      <motion.div
        initial={mounted ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center pt-4 pb-5"
      >
        <div className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: theme.accent }}>
          大阿卡纳
        </div>
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight mb-2">
          {data.majorArcana.name}
        </h1>
        <div className="w-12 h-px mx-auto" style={{ background: theme.divider }} />
      </motion.div>

      {/* Tarot card with 3D flip */}
      <FlipCard theme={theme} mounted={mounted} delay={0.1} className="mx-auto w-[200px] sm:w-[280px] mb-6">
        <div
          className="aspect-[2/3] rounded-2xl border flex flex-col items-center justify-center p-4 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.gradientCard[0]} 0%, ${theme.gradientCard[1]} 100%)`,
            borderColor: theme.cardBorder,
            boxShadow: `0 24px 80px -24px ${theme.cardGlow}`,
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }} />
          <div className="text-5xl sm:text-7xl font-serif mb-3" style={{ color: theme.accent }}>
            {data.majorArcana.name.slice(0, 1)}
          </div>
          <div className="text-xl sm:text-2xl">{personality.emoji}</div>
          <div className="absolute bottom-3 text-[9px] sm:text-[10px] tracking-widest uppercase" style={{ color: theme.textMuted }}>
            {personality.code}
          </div>
        </div>
      </FlipCard>

      {/* Personality badge */}
      <motion.div
        initial={mounted ? { opacity: 0, y: 12 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center mb-4"
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm"
          style={{ borderColor: theme.divider, background: theme.accentSoft, color: theme.text }}
        >
          <span>{personality.emoji}</span>
          <span className="font-mono">{personality.code}</span>
          <span className="opacity-60">·</span>
          <span>{personality.wtftiName}</span>
        </div>
      </motion.div>

      {/* Tagline */}
      <motion.div
        initial={mounted ? { opacity: 0, y: 12 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="text-center mb-5"
      >
        <p className="text-base sm:text-xl italic font-serif" style={{ color: theme.accent }}>
          “ {data.tagline} ”
        </p>
      </motion.div>

      {/* Reading */}
      {data.reading && (
        <motion.div
          initial={mounted ? { opacity: 0, y: 14 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="rounded-xl border p-4 sm:p-6 mb-5"
          style={{ borderColor: theme.divider, background: `${theme.cardSurface}80` }}
        >
          <div className="text-xs tracking-[0.14em] uppercase mb-2 text-center" style={{ color: theme.accent }}>
            Soul Reading
          </div>
          <p className="text-sm sm:text-[15px] leading-7 sm:leading-8" style={{ color: theme.text }}>
            {data.reading}
          </p>
        </motion.div>
      )}

      {/* Keywords */}
      <motion.div
        initial={mounted ? { opacity: 0, y: 12 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-wrap items-center justify-center gap-2 mb-6"
      >
        {data.majorArcana.keywords.map((kw, i) => (
          <span
            key={i}
            className="px-3 py-1 rounded-full text-xs border"
            style={{ borderColor: theme.divider, background: theme.accentSoft, color: theme.accent }}
          >
            {kw}
          </span>
        ))}
      </motion.div>

      {/* Shadow card — W2: 延迟揭晓，下滑触发后才渐显 */}
      <motion.div
        initial={mounted ? { opacity: 0, y: 28, filter: 'blur(8px)' } : false}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.55, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="rounded-xl border p-4 mb-5"
        style={{ borderColor: theme.divider, background: `${theme.cardSurface}80` }}
      >
        <div className="text-xs tracking-wider uppercase mb-2 text-center" style={{ color: theme.textMuted }}>
          Shadow · {data.shadowArcana.name}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          {data.shadowArcana.keywords.map((kw, i) => (
            <span key={i} className="text-sm" style={{ color: theme.textMuted }}>
              {kw}
            </span>
          ))}
        </div>
        {data.shadowReading && (
          <div className="mt-3 pt-3 border-t" style={{ borderColor: theme.divider }}>
            <p className="text-sm leading-7 text-center" style={{ color: theme.textMuted }}>
              {data.shadowReading}
            </p>
          </div>
        )}
      </motion.div>

      {/* Why this card — W2: 神谕段落以打字机方式逐字呈现 */}
      {data.whyThisCard && (
        <motion.div
          initial={mounted ? { opacity: 0, y: 14 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="rounded-xl border p-4 sm:p-6 mb-6"
          style={{ borderColor: theme.divider, background: `${theme.cardSurface}80` }}
        >
          <div className="text-xs tracking-[0.14em] uppercase mb-2 text-center" style={{ color: theme.accent }}>
            为什么是这张牌？
          </div>
          <p className="text-sm sm:text-[15px] leading-7 sm:leading-8 text-center" style={{ color: theme.text }}>
            <Typewriter text={data.whyThisCard} speedMs={32} startDelayMs={400} />
          </p>
        </motion.div>
      )}

      {/* Soul Letter（W4 付费内容） */}
      <MystiSoulLetterSection
        slug={personality.slug}
        displayName={personality.wtftiName}
      />

      {/* Cross-universe exploration */}
      <motion.div
        initial={mounted ? { opacity: 0, y: 16 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.38 }}
        className="mb-6 mt-10"
      >
        <UniverseSwitcher
          slug={personality.slug}
          currentUniverseId="mysti"
          theme={{
            cardSurface: theme.cardSurface,
            divider: theme.divider,
            accent: theme.accent,
            text: theme.text,
            textMuted: theme.textMuted,
          }}
        />
        <div className="mt-4">
          <WtfiTheoryWiring universe="mysti" variant="dark" />
        </div>
      </motion.div>

      {/* Share CTA */}
      <motion.div
        initial={mounted ? { opacity: 0, y: 16 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="rounded-2xl border p-5 sm:p-8 text-center"
        style={{ borderColor: theme.cardBorder, background: `${theme.cardSurface}60` }}
      >
        <div className="text-xl mb-1">✦</div>
        <h3 className="text-base font-semibold mb-1">生成你的灵鉴卡牌</h3>
        <p className="text-xs sm:text-sm mb-4" style={{ color: theme.textMuted }}>
          将结果保存为图片，分享给朋友
        </p>
        <div className="max-w-xs mx-auto">
          <MystiShareImageGenerator ref={shareRef} personality={personality} themeId={theme.id as MystiTheme['id']} />
        </div>
      </motion.div>

      {/* Invite CTA */}
      <motion.div
        initial={mounted ? { opacity: 0, y: 16 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="mt-5 text-center"
      >
        <Link
          href={`/mysti/?slug=${encodeURIComponent(personality.slug)}`}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm border transition-all hover:opacity-80"
          style={{ borderColor: theme.divider, color: theme.accent }}
        >
          💌 邀请 TA 合测
        </Link>
      </motion.div>

      {/* Explore more — guide users to other Mysti features */}
      <motion.div
        initial={mounted ? { opacity: 0, y: 16 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-8 rounded-2xl border p-5"
        style={{ borderColor: theme.divider, background: `${theme.cardSurface}60` }}
      >
        <div className="text-xs tracking-wider uppercase mb-4 text-center" style={{ color: theme.accent }}>
          继续探索灵鉴
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href="/mysti/daily/"
            className="group flex items-center gap-3 rounded-xl border p-3 transition-all hover:bg-white/5"
            style={{ borderColor: theme.divider }}
          >
            <span className="text-lg shrink-0">✦</span>
            <div className="min-w-0">
              <div className="text-xs font-medium" style={{ color: theme.text }}>每日一牌</div>
              <div className="text-[10px]" style={{ color: theme.textMuted }}>今天的能量指引</div>
            </div>
          </Link>
          <Link
            href="/mysti/gacha/"
            className="group flex items-center gap-3 rounded-xl border p-3 transition-all hover:bg-white/5"
            style={{ borderColor: theme.divider }}
          >
            <span className="text-lg shrink-0">🎴</span>
            <div className="min-w-0">
              <div className="text-xs font-medium" style={{ color: theme.text }}>每日抽卡</div>
              <div className="text-[10px]" style={{ color: theme.textMuted }}>免费一抽灵魂卡牌</div>
            </div>
          </Link>
          <Link
            href="/mysti/collection/"
            className="group flex items-center gap-3 rounded-xl border p-3 transition-all hover:bg-white/5"
            style={{ borderColor: theme.divider }}
          >
            <span className="text-lg shrink-0">📖</span>
            <div className="min-w-0">
              <div className="text-xs font-medium" style={{ color: theme.text }}>图鉴墙</div>
              <div className="text-[10px]" style={{ color: theme.textMuted }}>查看收集进度</div>
            </div>
          </Link>
          <Link
            href={`/mysti/?slug=${encodeURIComponent(personality.slug)}`}
            className="group flex items-center gap-3 rounded-xl border p-3 transition-all hover:bg-white/5"
            style={{ borderColor: theme.divider }}
          >
            <span className="text-lg shrink-0">💌</span>
            <div className="min-w-0">
              <div className="text-xs font-medium" style={{ color: theme.text }}>邀请合测</div>
              <div className="text-[10px]" style={{ color: theme.textMuted }}>拉 TA 看关系灵鉴</div>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Retest + Home */}
      <motion.div
        initial={mounted ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3"
      >
        <Link
          href="/wtfti/test/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all hover:brightness-110"
          style={{ background: `linear-gradient(90deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`, color: '#fff' }}
        >
          重新测试
        </Link>
        <Link
          href="/mysti/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm border transition-all hover:opacity-80"
          style={{ borderColor: theme.divider, color: theme.textMuted }}
        >
          返回灵鉴首页
        </Link>
      </motion.div>
    </>
  );
}

function DualModeContent({
  personality,
  data,
  partner,
  partnerData,
  theme,
  mounted,
  shareRef,
}: {
  personality: WtftiPersonality;
  data: { majorArcana: { name: string; keywords: string[] }; shadowArcana: { name: string; keywords: string[] }; tagline: string; reading?: string; shadowReading?: string; whyThisCard?: string };
  partner: WtftiPersonality;
  partnerData: { majorArcana: { name: string; keywords: string[] }; shadowArcana: { name: string; keywords: string[] }; tagline: string; reading?: string; shadowReading?: string; whyThisCard?: string };
  theme: MystiTheme;
  mounted: boolean;
  shareRef: React.RefObject<MystiShareImageGeneratorHandle | null>;
}) {
  return (
    <>
      {/* Header */}
      <motion.div
        initial={mounted ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center pt-6 pb-8"
      >
        <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: theme.accent }}>
          双魂共振
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
          关系灵鉴
        </h1>
        <div className="w-16 h-px mx-auto" style={{ background: theme.divider }} />
      </motion.div>

      {/* Two tarot cards */}
      <motion.div
        initial={mounted ? { opacity: 0, y: 16 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-2 gap-4 sm:gap-6 mb-8"
      >
        <TarotMiniCard personality={personality} arcana={data.majorArcana} theme={theme} />
        <TarotMiniCard personality={partner} arcana={partnerData.majorArcana} theme={theme} />
      </motion.div>

      {/* Badges */}
      <motion.div
        initial={mounted ? { opacity: 0, y: 12 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-2 gap-4 mb-6"
      >
        <div className="text-center">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs"
            style={{ borderColor: theme.divider, background: theme.accentSoft, color: theme.text }}
          >
            <span>{personality.emoji}</span>
            <span className="font-mono">{personality.code}</span>
            <span className="opacity-60">·</span>
            <span>{personality.wtftiName}</span>
          </div>
        </div>
        <div className="text-center">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs"
            style={{ borderColor: theme.divider, background: theme.accentSoft, color: theme.text }}
          >
            <span>{partner.emoji}</span>
            <span className="font-mono">{partner.code}</span>
            <span className="opacity-60">·</span>
            <span>{partner.wtftiName}</span>
          </div>
        </div>
      </motion.div>

      {/* Keywords */}
      <motion.div
        initial={mounted ? { opacity: 0, y: 12 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="grid grid-cols-2 gap-4 mb-8"
      >
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {data.majorArcana.keywords.map((kw, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 rounded-full text-[10px] border"
              style={{ borderColor: theme.divider, background: theme.accentSoft, color: theme.accent }}
            >
              {kw}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {partnerData.majorArcana.keywords.map((kw, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 rounded-full text-[10px] border"
              style={{ borderColor: theme.divider, background: theme.accentSoft, color: theme.accent }}
            >
              {kw}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Relationship archetype + interpretation */}
      {(() => {
        const interp = getDualInterpretation(personality.slug, partner.slug, data, partnerData);
        return (
          <>
            {/* Archetype badge */}
            <motion.div
              initial={mounted ? { opacity: 0, y: 12 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center mb-6"
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm"
                style={{ borderColor: theme.cardBorder, background: theme.accentSoft, color: theme.accent }}
              >
                <span className="text-lg">{interp.archetype.emoji}</span>
                <span className="font-semibold">{interp.archetype.name}</span>
              </div>
              <p className="text-xs mt-2" style={{ color: theme.textMuted }}>
                {interp.archetype.description}
              </p>
            </motion.div>

            {/* Bond tagline */}
            <motion.div
              initial={mounted ? { opacity: 0, y: 12 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="text-center mb-5"
            >
              <p className="text-sm italic font-serif mb-1" style={{ color: theme.accent }}>
                ✦ {data.majorArcana.name} × {partnerData.majorArcana.name} ✦
              </p>
              <p className="text-sm" style={{ color: theme.text }}>
                {interp.bondTagline}
              </p>
            </motion.div>

            {/* Interpretation cards */}
            <motion.div
              initial={mounted ? { opacity: 0, y: 16 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-3 mb-6"
            >
              <div
                className="rounded-xl border p-4"
                style={{ borderColor: theme.divider, background: `${theme.cardSurface}80` }}
              >
                <div className="text-xs tracking-wider uppercase mb-2" style={{ color: theme.accent }}>
                  🌀 你们的磁场
                </div>
                <p className="text-sm leading-relaxed" style={{ color: theme.text }}>
                  {interp.dynamics}
                </p>
              </div>

              <div
                className="rounded-xl border p-4"
                style={{ borderColor: theme.divider, background: `${theme.cardSurface}80` }}
              >
                <div className="text-xs tracking-wider uppercase mb-2" style={{ color: theme.accent }}>
                  ⚡ 潜在的雷区
                </div>
                <p className="text-sm leading-relaxed" style={{ color: theme.text }}>
                  {interp.conflict}
                </p>
              </div>

              <div
                className="rounded-xl border p-4"
                style={{ borderColor: theme.divider, background: `${theme.cardSurface}80` }}
              >
                <div className="text-xs tracking-wider uppercase mb-2" style={{ color: theme.accent }}>
                  🔮 灵鉴指引
                </div>
                <p className="text-sm leading-relaxed" style={{ color: theme.text }}>
                  {interp.advice}
                </p>
              </div>
            </motion.div>

            {/* Combined shadow card */}
            <motion.div
              initial={mounted ? { opacity: 0, y: 16 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="rounded-xl border p-4 mb-6"
              style={{ borderColor: theme.divider, background: `${theme.cardSurface}80` }}
            >
              <div className="text-xs tracking-wider uppercase mb-2 text-center" style={{ color: theme.textMuted }}>
                Shadow · {data.shadowArcana.name} × {partnerData.shadowArcana.name}
              </div>
              <div className="text-center text-xs mb-2" style={{ color: theme.textMuted }}>
                {data.shadowArcana.keywords.slice(0, 2).join(' · ')} — {partnerData.shadowArcana.keywords.slice(0, 2).join(' · ')}
              </div>
              <div className="text-center text-[10px] opacity-70 mb-3" style={{ color: theme.textMuted }}>
                两人的阴影，亦是共同的课题
              </div>
              {(data.shadowReading || partnerData.shadowReading) && (
                <div className="mt-3 pt-3 border-t space-y-3" style={{ borderColor: theme.divider }}>
                  {data.shadowReading && (
                    <div className="text-center">
                      <div className="text-[10px] tracking-wider uppercase mb-1" style={{ color: theme.accent }}>{personality.wtftiName}</div>
                      <p className="text-xs leading-6" style={{ color: theme.textMuted }}>{data.shadowReading}</p>
                    </div>
                  )}
                  {partnerData.shadowReading && (
                    <div className="text-center">
                      <div className="text-[10px] tracking-wider uppercase mb-1" style={{ color: theme.accent }}>{partner.wtftiName}</div>
                      <p className="text-xs leading-6" style={{ color: theme.textMuted }}>{partnerData.shadowReading}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        );
      })()}

      {/* Share CTA */}
      <motion.div
        initial={mounted ? { opacity: 0, y: 16 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="rounded-2xl border p-5 sm:p-8 text-center"
        style={{ borderColor: theme.cardBorder, background: `${theme.cardSurface}60` }}
      >
        <div className="text-xl mb-1">✦</div>
        <h3 className="text-base font-semibold mb-1">生成双人灵鉴卡牌</h3>
        <p className="text-xs sm:text-sm mb-4" style={{ color: theme.textMuted }}>
          将结果保存为图片，分享给你们的世界
        </p>
        <div className="max-w-xs mx-auto">
          <MystiShareImageGenerator ref={shareRef} personality={personality} partner={partner} themeId={theme.id as MystiTheme['id']} />
        </div>
      </motion.div>

      {/* Explore more — guide users to other Mysti features */}
      <motion.div
        initial={mounted ? { opacity: 0, y: 16 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-8 rounded-2xl border p-5"
        style={{ borderColor: theme.divider, background: `${theme.cardSurface}60` }}
      >
        <div className="text-xs tracking-wider uppercase mb-4 text-center" style={{ color: theme.accent }}>
          继续探索灵鉴
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href="/mysti/daily/"
            className="group flex items-center gap-3 rounded-xl border p-3 transition-all hover:bg-white/5"
            style={{ borderColor: theme.divider }}
          >
            <span className="text-lg shrink-0">✦</span>
            <div className="min-w-0">
              <div className="text-xs font-medium" style={{ color: theme.text }}>每日一牌</div>
              <div className="text-[10px]" style={{ color: theme.textMuted }}>今天的能量指引</div>
            </div>
          </Link>
          <Link
            href="/mysti/gacha/"
            className="group flex items-center gap-3 rounded-xl border p-3 transition-all hover:bg-white/5"
            style={{ borderColor: theme.divider }}
          >
            <span className="text-lg shrink-0">🎴</span>
            <div className="min-w-0">
              <div className="text-xs font-medium" style={{ color: theme.text }}>每日抽卡</div>
              <div className="text-[10px]" style={{ color: theme.textMuted }}>免费一抽灵魂卡牌</div>
            </div>
          </Link>
          <Link
            href="/mysti/collection/"
            className="group flex items-center gap-3 rounded-xl border p-3 transition-all hover:bg-white/5"
            style={{ borderColor: theme.divider }}
          >
            <span className="text-lg shrink-0">📖</span>
            <div className="min-w-0">
              <div className="text-xs font-medium" style={{ color: theme.text }}>图鉴墙</div>
              <div className="text-[10px]" style={{ color: theme.textMuted }}>查看收集进度</div>
            </div>
          </Link>
          <Link
            href="/mysti/"
            className="group flex items-center gap-3 rounded-xl border p-3 transition-all hover:bg-white/5"
            style={{ borderColor: theme.divider }}
          >
            <span className="text-lg shrink-0">🔮</span>
            <div className="min-w-0">
              <div className="text-xs font-medium" style={{ color: theme.text }}>灵鉴首页</div>
              <div className="text-[10px]" style={{ color: theme.textMuted }}>选择新的人格组合</div>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Retest */}
      <motion.div
        initial={mounted ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="mt-5 text-center"
      >
        <Link
          href="/wtfti/test/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all hover:brightness-110"
          style={{ background: `linear-gradient(90deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`, color: '#fff' }}
        >
          重新测试
        </Link>
      </motion.div>
    </>
  );
}

function TarotMiniCard({
  personality,
  arcana,
  theme,
}: {
  personality: WtftiPersonality;
  arcana: { name: string };
  theme: MystiTheme;
}) {
  return (
    <FlipCard theme={theme} mounted={true} delay={0.15} compact>
      <div
        className="aspect-[2/3] rounded-xl border flex flex-col items-center justify-center p-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${theme.gradientCard[0]} 0%, ${theme.gradientCard[1]} 100%)`,
          borderColor: theme.cardBorder,
          boxShadow: `0 16px 48px -16px ${theme.cardGlow}`,
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }} />
        <div className="text-4xl sm:text-5xl font-serif mb-2" style={{ color: theme.accent }}>
          {arcana.name.slice(0, 1)}
        </div>
        <div className="text-xl">{personality.emoji}</div>
        <div className="absolute bottom-3 text-[10px] tracking-widest uppercase" style={{ color: theme.textMuted }}>
          {personality.code}
        </div>
      </div>
    </FlipCard>
  );
}

/* ─── 3D Flip Card Component ─── */

function CardBack({ theme, compact }: { theme: MystiTheme; compact?: boolean }) {
  const isCelestial = theme.id === 'celestial';
  const size = compact ? 'text-3xl' : 'text-5xl';
  
  return (
    <div
      className={`aspect-[2/3] rounded-${compact ? 'xl' : '2xl'} border flex flex-col items-center justify-center relative overflow-hidden`}
      style={{
        background: isCelestial
          ? `linear-gradient(135deg, #0B0D17 0%, #1a1d3a 50%, #0B0D17 100%)`
          : `linear-gradient(135deg, #F7F4EF 0%, #FFF8F0 50%, #F7F4EF 100%)`,
        borderColor: isCelestial ? 'rgba(201,168,108,0.45)' : 'rgba(168,92,100,0.35)',
        boxShadow: isCelestial
          ? `0 24px 80px -24px rgba(123,97,255,0.18)`
          : `0 24px 80px -24px rgba(94,113,106,0.12)`,
      }}
    >
      {/* Mystical pattern overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        viewBox="0 0 200 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Geometric star pattern */}
        <circle cx="100" cy="150" r="60" stroke={isCelestial ? '#C9A86C' : '#A85C64'} strokeWidth="0.5" opacity="0.4" />
        <circle cx="100" cy="150" r="40" stroke={isCelestial ? '#C9A86C' : '#A85C64'} strokeWidth="0.5" opacity="0.3" />
        <circle cx="100" cy="150" r="20" stroke={isCelestial ? '#C9A86C' : '#A85C64'} strokeWidth="0.5" opacity="0.2" />
        {/* Star lines */}
        <line x1="100" y1="90" x2="100" y2="210" stroke={isCelestial ? '#C9A86C' : '#A85C64'} strokeWidth="0.5" opacity="0.3" />
        <line x1="40" y1="150" x2="160" y2="150" stroke={isCelestial ? '#C9A86C' : '#A85C64'} strokeWidth="0.5" opacity="0.3" />
        <line x1="58" y1="108" x2="142" y2="192" stroke={isCelestial ? '#C9A86C' : '#A85C64'} strokeWidth="0.5" opacity="0.25" />
        <line x1="58" y1="192" x2="142" y2="108" stroke={isCelestial ? '#C9A86C' : '#A85C64'} strokeWidth="0.5" opacity="0.25" />
        {/* Small stars */}
        <circle cx="100" cy="80" r="2" fill={isCelestial ? '#C9A86C' : '#A85C64'} opacity="0.5" />
        <circle cx="100" cy="220" r="2" fill={isCelestial ? '#C9A86C' : '#A85C64'} opacity="0.5" />
        <circle cx="40" cy="150" r="2" fill={isCelestial ? '#C9A86C' : '#A85C64'} opacity="0.5" />
        <circle cx="160" cy="150" r="2" fill={isCelestial ? '#C9A86C' : '#A85C64'} opacity="0.5" />
        {/* Corner decorations */}
        <path d="M20,20 L40,20 L20,40 Z" stroke={isCelestial ? '#C9A86C' : '#A85C64'} strokeWidth="0.5" opacity="0.3" />
        <path d="M180,20 L160,20 L180,40 Z" stroke={isCelestial ? '#C9A86C' : '#A85C64'} strokeWidth="0.5" opacity="0.3" />
        <path d="M20,280 L40,280 L20,260 Z" stroke={isCelestial ? '#C9A86C' : '#A85C64'} strokeWidth="0.5" opacity="0.3" />
        <path d="M180,280 L160,280 L180,260 Z" stroke={isCelestial ? '#C9A86C' : '#A85C64'} strokeWidth="0.5" opacity="0.3" />
      </svg>
      
      {/* Center symbol */}
      <div
        className={`${size} font-serif relative z-10`}
        style={{ color: isCelestial ? '#C9A86C' : '#A85C64', opacity: 0.6 }}
      >
        ✦
      </div>
      
      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${isCelestial ? '#C9A86C' : '#A85C64'}, transparent)` }}
      />
    </div>
  );
}

interface FlipCardProps {
  theme: MystiTheme;
  mounted: boolean;
  delay?: number;
  compact?: boolean;
  className?: string;
  children: React.ReactNode;
}

function FlipCard({ theme, mounted, delay = 0, compact = false, className = '', children }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showGlow, setShowGlow] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    const flipTimer = setTimeout(() => setIsFlipped(true), delay * 1000);
    const glowTimer = setTimeout(() => setShowGlow(true), delay * 1000 + 900);
    return () => {
      clearTimeout(flipTimer);
      clearTimeout(glowTimer);
    };
  }, [mounted, delay]);

  const perspective = compact ? 800 : 1000;
  const borderRadius = compact ? '0.75rem' : '1rem';

  return (
    <div className={className} style={{ perspective: `${perspective}px` }}>
      <motion.div
        initial={mounted ? { rotateY: 180, opacity: 0 } : false}
        animate={{
          rotateY: isFlipped ? 0 : 180,
          opacity: 1,
          scale: isFlipped ? (showGlow ? 1 : 1.03) : 1,
        }}
        transition={{
          duration: 0.9,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          transformStyle: 'preserve-3d',
          borderRadius,
          boxShadow: showGlow
            ? `0 0 40px 8px ${theme.id === 'celestial' ? 'rgba(201,168,108,0.3)' : 'rgba(168,92,100,0.2)'}, 0 24px 80px -24px ${theme.cardGlow}`
            : undefined,
          transition: 'box-shadow 0.6s ease-out',
        }}
      >
        {/* Card back (shown initially) */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            position: isFlipped ? 'absolute' : 'relative',
            inset: 0,
            borderRadius,
            overflow: 'hidden',
            opacity: isFlipped ? 0 : 1,
            pointerEvents: isFlipped ? 'none' : 'auto',
          }}
        >
          <CardBack theme={theme} compact={compact} />
        </div>

        {/* Card front (revealed after flip) */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius,
            overflow: 'hidden',
            opacity: isFlipped ? 1 : 0,
            pointerEvents: isFlipped ? 'auto' : 'none',
          }}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}
