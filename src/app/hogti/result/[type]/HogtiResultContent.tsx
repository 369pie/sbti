'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import type { HogtiPersonality } from '@/lib/hogti/personalities';
import { HOGTI_PERSONALITIES, getHogtiCharacter } from '@/lib/hogti/personalities';
import { HOG_HOUSES } from '@/lib/hogti/characters';
import { getSiteUrl } from '@/lib/site';
import { HogtiTheme, HogtiCrestFrame, HogtiQuillIcon } from '@/components/hogti/HogtiTheme';
import { HogtiShareCard } from '@/components/hogti/HogtiShareCard';
import { UniverseResultBar } from '@/components/UniverseResultBar';
import { UniverseSwitcher } from '@/components/UniverseSwitcher';
import { WtfiTheoryWiring } from '@/components/WtfiTheoryWiring';
import { ResultClosureEngine } from '@/components/ResultClosureEngine';
import { HermosaInputCard } from '@/components/hermosa/HermosaInputCard';

interface Props {
  hogtiPersonality: HogtiPersonality;
}

export function HogtiResultContent({ hogtiPersonality: p }: Props) {
  const character = getHogtiCharacter(p.slug);
  const house = character ? HOG_HOUSES[character.house] : HOG_HOUSES.faculty;

  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const shareUrl = getSiteUrl(`/hogti/result/${p.slug}/`);

  const copyShareText = useCallback(() => {
    if (!character) return;
    const text = `霍格沃茨TI · 我被分院为 ${character.name}（${house.name}）\n"${p.tagline}"\n来测你的 → ${shareUrl}`;
    navigator.clipboard.writeText(text);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  }, [character, house.name, p.tagline, shareUrl]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const quickShare = useCallback(async () => {
    if (!character) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `霍格沃茨TI · 我是${character.name}`,
          text: p.tagline,
          url: shareUrl,
        });
        return;
      } catch { /* cancelled */ }
    }
    copyLink();
  }, [character, copyLink, p.tagline, shareUrl]);

  const others = HOGTI_PERSONALITIES.filter(o => o.slug !== p.slug).slice(0, 4);

  if (!character) {
    return (
      <HogtiTheme>
        <div className="p-10 text-center text-amber-100">角色数据缺失：{p.characterId}</div>
      </HogtiTheme>
    );
  }

  return (
    <HogtiTheme house={house}>
      {/* Hero — 录取通知书风格 */}
      <section className="relative">
        <div className="max-w-2xl mx-auto px-6 pt-14 pb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Top ribbon */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] tracking-[0.25em] uppercase mb-6 bg-amber-50/20 border border-amber-200/40 text-amber-100 backdrop-blur-sm">
              <HogtiQuillIcon className="w-3.5 h-3.5" />
              Hogwarts · TI · {p.number}
            </div>

            {/* Crest */}
            <HogtiCrestFrame className="w-36 h-36 sm:w-44 sm:h-44 mx-auto mb-5" color={house.accent}>
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-5xl sm:text-6xl shadow-inner"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${house.accent}55, ${house.accent}22)`,
                  border: `2px solid ${house.accent}70`,
                }}
              >
                {house.emoji}
              </div>
            </HogtiCrestFrame>

            {/* 学院名 */}
            <div
              className="text-[10px] sm:text-xs tracking-[0.45em] uppercase mb-2 text-amber-100/90"
              style={{ color: '#fbf3df' }}
            >
              {house.nameEn}
            </div>

            {/* Character name */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-semibold mb-3 text-amber-50 drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
              style={{ fontFamily: "'EB Garamond', 'Noto Serif SC', serif" }}
            >
              {character.name}
            </h1>

            {/* House */}
            <div
              className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-5"
              style={{
                background: `${house.accent}`,
                color: '#fff9e6',
              }}
            >
              {house.emoji} {house.name} · {character.archetype}
            </div>

            {/* Tagline */}
            <p className="text-base sm:text-lg leading-relaxed max-w-md mx-auto text-amber-100/90 italic">
              &ldquo;{p.tagline}&rdquo;
            </p>
          </motion.div>
        </div>
      </section>

      {/* 羊皮卷正文开始 */}
      <div className="max-w-2xl mx-auto px-6 pb-12 relative z-10">
        {/* 分院结果卡 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hogti-parchment-card rounded-2xl p-7 sm:p-9 mb-6 relative"
          style={{ borderColor: `${house.accent}55` }}
        >
          <div className="text-center mb-5">
            <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: house.textAccent }}>
              · 分院判定 ·
            </div>
            <div className="hogti-gold-divider w-24 mx-auto mt-3" />
          </div>

          <p className="text-lg sm:text-xl leading-relaxed text-center hogti-ink font-medium">
            &ldquo;{p.copy.wtfHit}&rdquo;
          </p>

          {/* 魔杖/守护神/学院 */}
          <div className="grid grid-cols-3 gap-3 mt-7 pt-6 border-t" style={{ borderColor: `${house.accent}25` }}>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: house.textAccent }}>
                魔杖
              </div>
              <div className="text-xs sm:text-sm hogti-ink font-medium leading-snug">
                {character.wand}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: house.textAccent }}>
                守护神
              </div>
              <div className="text-xs sm:text-sm hogti-ink font-medium leading-snug">
                {character.patronus}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: house.textAccent }}>
                学院
              </div>
              <div className="text-xs sm:text-sm hogti-ink font-medium leading-snug">
                {house.name}
              </div>
            </div>
          </div>

          {/* wax seal */}
          <div className="absolute -bottom-3 -right-3 hogti-wax-seal w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold" style={{ fontFamily: "'EB Garamond', serif" }}>
            H·T
          </div>
        </motion.div>

        {/* 角色本质 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="hogti-parchment-card rounded-2xl p-7 sm:p-9 mb-6"
        >
          <h2 className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: house.textAccent }}>
            🪶 角色本质
          </h2>
          <p className="text-base hogti-ink italic font-medium leading-relaxed mb-4">
            {character.essence}
          </p>
          <p className="text-sm leading-[1.9] whitespace-pre-line" style={{ color: '#3a2e18' }}>
            {character.narrative}
          </p>
        </motion.section>

        {/* OS 翻译 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.26 }}
          className="hogti-parchment-card rounded-2xl p-7 sm:p-9 mb-6"
        >
          <h2 className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: house.textAccent }}>
            📜 你在魔法世界里的 OS
          </h2>
          <p className="text-sm leading-[1.9] whitespace-pre-line" style={{ color: '#3a2e18' }}>
            {p.copy.osTranslation}
          </p>
        </motion.section>

        {/* 症状清单 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          className="hogti-parchment-card rounded-2xl p-7 sm:p-9 mb-6"
        >
          <h2 className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: house.textAccent }}>
            🔮 魔法时刻清单
          </h2>
          <ul className="space-y-3">
            {p.copy.symptoms.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                  style={{ background: `${house.accent}25`, color: house.textAccent }}
                >
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed" style={{ color: '#3a2e18' }}>{s}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* 金句 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.38 }}
          className="rounded-2xl p-7 text-center mb-6 border"
          style={{
            borderColor: `${house.accent}55`,
            background: `linear-gradient(180deg, ${house.bgTint} 0%, ${house.accent}15 100%)`,
          }}
        >
          <div className="text-[10px] tracking-[0.4em] uppercase mb-3" style={{ color: house.textAccent }}>
            · Quote ·
          </div>
          <p className="text-base sm:text-lg italic leading-relaxed" style={{ color: house.textAccent, fontFamily: "'EB Garamond', 'Noto Serif SC', serif" }}>
            {character.dialogueMarker}
          </p>
          <div className="hogti-gold-divider w-20 mx-auto mt-4" />
          <p className="text-sm mt-4 italic" style={{ color: '#3a2e18' }}>
            {p.copy.closer}
          </p>
        </motion.section>

        {/* 分享 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.44 }}
          className="rounded-2xl p-7 text-center mb-6"
          style={{ background: `${house.accent}14`, border: `1px solid ${house.accent}35` }}
        >
          <div className="text-2xl mb-2">📜</div>
          <h3 className="text-lg font-semibold mb-1 hogti-ink" style={{ fontFamily: "'EB Garamond', 'Noto Serif SC', serif" }}>
            发一张你的分院通知书
          </h3>
          <p className="text-xs mb-5" style={{ color: '#4a3a1e' }}>
            {character.socialShare}
          </p>

          {/* Share card */}
          <div className="mb-6">
            <HogtiShareCard
              personality={p}
              character={character}
              house={house}
              shareUrl={shareUrl}
            />
          </div>

          <div className="flex gap-3 max-w-sm mx-auto">
            <button
              onClick={copyShareText}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium hogti-parchment-card cursor-pointer hover:brightness-95 transition"
              style={{ color: house.textAccent }}
            >
              {textCopied ? '已复制 ✓' : '复制文案'}
            </button>
            <button
              onClick={quickShare}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer text-amber-50 shadow"
              style={{ background: house.accent }}
            >
              {copied ? '已复制 ✓' : '复制链接'}
            </button>
          </div>
        </motion.section>

        {/* Cross-universe */}
        <section className="mb-6">
          <UniverseResultBar slug={p.slug} current="hogti" />
        </section>

        {/* Other characters */}
        <section className="mb-8">
          <h3 className="text-xs tracking-[0.3em] uppercase mb-4 text-center" style={{ color: '#8a6a2f' }}>
            · 其他霍格沃茨人格 ·
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {others.map(o => {
              const oc = getHogtiCharacter(o.slug);
              if (!oc) return null;
              const oh = HOG_HOUSES[oc.house];
              return (
                <Link
                  key={o.slug}
                  href={`/hogti/result/${o.slug}/`}
                  className="hogti-parchment-card rounded-xl p-4 flex items-center gap-3 transition hover:brightness-105"
                  style={{ borderColor: `${oh.accent}35` }}
                >
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl"
                    style={{
                      background: `linear-gradient(135deg, ${oh.accent}25, ${oh.accent}10)`,
                      border: `1.5px solid ${oh.accent}45`,
                    }}
                  >
                    {oh.emoji}
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-sm font-semibold hogti-ink truncate" style={{ fontFamily: "'EB Garamond', 'Noto Serif SC', serif" }}>
                      {oc.name}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: oh.accent }}>
                      {oh.name}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/hogti/test/"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-medium text-sm shadow-lg"
              style={{
                background: house.accent,
                color: '#fbf3df',
                fontFamily: "'EB Garamond', 'Noto Serif SC', serif",
              }}
            >
              重新分院 ⚡
            </Link>
            <Link
              href="/hogti/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border text-sm"
              style={{ borderColor: `${house.accent}55`, color: house.textAccent }}
            >
              回到霍格沃茨
            </Link>
          </div>
        </section>
      </div>

      {/* 宇宙切换 - 在羊皮纸主题外也能展示 */}
      <section className="max-w-2xl mx-auto px-6 pb-12">
        <UniverseSwitcher slug={p.slug} currentUniverseId="hogti" />
      </section>

      <section className="max-w-2xl mx-auto px-6 pb-8">
        <WtfiTheoryWiring universe="hogti" />
      </section>

      <section className="max-w-2xl mx-auto px-6 pb-12">
        <HermosaInputCard
          universe="hogti"
          slug={p.slug}
          personalityName={character.name}
          accent={house.accent}
        />
      </section>

      <ResultClosureEngine
        currentUniverse="hogti"
        personalitySlug={p.slug}
        personalityName={character.name}
        accent={house.accent}
      />
    </HogtiTheme>
  );
}
