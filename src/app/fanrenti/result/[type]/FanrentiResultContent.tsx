'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import type { FanrentiPersonality } from '@/lib/fanrenti/personalities';
import { FANRENTI_PERSONALITIES, getFanrentiCharacter } from '@/lib/fanrenti/personalities';
import { FR_REALMS } from '@/lib/fanrenti/characters';
import { getSiteUrl } from '@/lib/site';
import { FanrentiTheme, FanrentiSealIcon, FanrentiScrollOrnament } from '@/components/fanrenti/FanrentiTheme';
import { FanrentiShareCard } from '@/components/fanrenti/FanrentiShareCard';
import { UniverseResultBar } from '@/components/UniverseResultBar';
import { UniverseSwitcher } from '@/components/UniverseSwitcher';
import { WtfiTheoryWiring } from '@/components/WtfiTheoryWiring';
import { ResultClosureEngine } from '@/components/ResultClosureEngine';
import { HermosaInputCard } from '@/components/hermosa/HermosaInputCard';

interface Props {
  personality: FanrentiPersonality;
}

export function FanrentiResultContent({ personality: p }: Props) {
  const character = getFanrentiCharacter(p.slug);
  const realm = character ? FR_REALMS[character.realm] : FR_REALMS.mortal;

  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const shareUrl = getSiteUrl(`/fanrenti/result/${p.slug}/`);

  const copyShareText = useCallback(() => {
    if (!character) return;
    const text = `凡人TI · 我被测成了 ${character.name}（${realm.name}）\n"${p.tagline}"\n道友请留步 → ${shareUrl}`;
    navigator.clipboard.writeText(text);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  }, [character, realm.name, p.tagline, shareUrl]);

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
          title: `凡人TI · 我是${character.name}`,
          text: p.tagline,
          url: shareUrl,
        });
        return;
      } catch { /* cancelled */ }
    }
    copyLink();
  }, [character, copyLink, p.tagline, shareUrl]);

  const others = FANRENTI_PERSONALITIES.filter(o => o.slug !== p.slug).slice(0, 4);

  if (!character) {
    return (
      <FanrentiTheme>
        <div className="p-10 text-center">角色数据缺失：{p.characterId}</div>
      </FanrentiTheme>
    );
  }

  return (
    <FanrentiTheme realm={realm}>
      {/* Hero — 入门令牌 */}
      <section className="relative">
        <div className="max-w-2xl mx-auto px-6 pt-14 pb-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] tracking-[0.25em] uppercase mb-6"
                 style={{ background: 'rgba(90, 69, 40, 0.08)', color: '#5a4528', border: '1px solid rgba(90, 69, 40, 0.18)' }}>
              凡人TI · 修仙 · {p.number}
            </div>

            {/* 境界徽记 */}
            <div
              className="w-32 h-32 sm:w-36 sm:h-36 mx-auto mb-5 rounded-full flex items-center justify-center text-6xl shadow-lg"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${realm.accent}35, ${realm.accent}12)`,
                border: `2px solid ${realm.accent}60`,
              }}
            >
              {realm.emoji}
            </div>

            <div className="text-[10px] sm:text-xs tracking-[0.45em] uppercase mb-2" style={{ color: realm.textAccent }}>
              {realm.name}
            </div>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-semibold mb-3 fr-ink-text"
              style={{ fontFamily: "'Noto Serif SC', 'Songti SC', serif" }}
            >
              {character.name}
            </h1>

            <div className="max-w-xs mx-auto my-4">
              <FanrentiScrollOrnament color={realm.textAccent} />
            </div>

            <div
              className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-5"
              style={{ background: realm.accent, color: '#f6f2ea' }}
            >
              {character.archetype}
            </div>

            <p className="text-base sm:text-lg leading-relaxed max-w-md mx-auto italic" style={{ color: '#3a2e18' }}>
              &ldquo;{p.tagline}&rdquo;
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6 pb-12 relative z-10">
        {/* 入门令牌主卡 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="fr-paper-card rounded-2xl p-7 sm:p-9 mb-6 relative"
          style={{ borderColor: `${realm.accent}55` }}
        >
          <div className="text-center mb-4">
            <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: realm.textAccent }}>
              · 道心判词 ·
            </div>
            <div className="fr-divider w-24 mx-auto mt-3" />
          </div>

          <p className="text-lg sm:text-xl leading-relaxed text-center fr-ink-text font-medium"
             style={{ fontFamily: "'Noto Serif SC', serif" }}>
            &ldquo;{p.copy.wtfHit}&rdquo;
          </p>

          {/* 功法 / 法宝 / 境界 */}
          <div className="grid grid-cols-3 gap-3 mt-7 pt-6 border-t" style={{ borderColor: `${realm.accent}25` }}>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: realm.textAccent }}>功法</div>
              <div className="text-xs sm:text-sm fr-ink-text font-medium leading-snug">{character.art}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: realm.textAccent }}>法宝</div>
              <div className="text-xs sm:text-sm fr-ink-text font-medium leading-snug">{character.relic}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: realm.textAccent }}>境界</div>
              <div className="text-xs sm:text-sm fr-ink-text font-medium leading-snug">{realm.name}</div>
            </div>
          </div>

          {/* 朱红印章 */}
          <div className="absolute -bottom-3 -right-3">
            <FanrentiSealIcon text="入门" className="w-16 h-16" />
          </div>
        </motion.div>

        {/* 角色本质 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="fr-paper-card rounded-2xl p-7 sm:p-9 mb-6"
        >
          <h2 className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: realm.textAccent }}>
            🍃 角色本质
          </h2>
          <p className="text-base italic font-medium leading-relaxed mb-4 fr-ink-text"
             style={{ fontFamily: "'Noto Serif SC', serif" }}>
            {character.essence}
          </p>
          <p className="text-sm leading-[1.95] whitespace-pre-line" style={{ color: '#3a2e18' }}>
            {character.narrative}
          </p>
        </motion.section>

        {/* OS 翻译 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.26 }}
          className="fr-paper-card rounded-2xl p-7 sm:p-9 mb-6"
        >
          <h2 className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: realm.textAccent }}>
            📜 你在凡修里的 OS
          </h2>
          <p className="text-sm leading-[1.95] whitespace-pre-line" style={{ color: '#3a2e18' }}>
            {p.copy.osTranslation}
          </p>
        </motion.section>

        {/* 症状 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          className="fr-paper-card rounded-2xl p-7 sm:p-9 mb-6"
        >
          <h2 className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: realm.textAccent }}>
            🔔 修行现场
          </h2>
          <ul className="space-y-3">
            {p.copy.symptoms.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                  style={{ background: `${realm.accent}25`, color: realm.textAccent }}
                >
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed" style={{ color: '#3a2e18' }}>{s}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* 名场面金句 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.38 }}
          className="rounded-2xl p-7 text-center mb-6 border"
          style={{
            borderColor: `${realm.accent}55`,
            background: `linear-gradient(180deg, ${realm.bgTint} 0%, ${realm.accent}15 100%)`,
          }}
        >
          <div className="text-[10px] tracking-[0.4em] uppercase mb-3" style={{ color: realm.textAccent }}>· 名场面 ·</div>
          <p className="text-base sm:text-lg italic leading-relaxed"
             style={{ color: realm.textAccent, fontFamily: "'Noto Serif SC', serif" }}>
            {character.dialogueMarker}
          </p>
          <div className="fr-divider w-20 mx-auto mt-4" />
          <p className="text-sm mt-4 italic" style={{ color: '#3a2e18' }}>{p.copy.closer}</p>
        </motion.section>

        {/* Share */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.44 }}
          className="rounded-2xl p-7 text-center mb-6"
          style={{ background: `${realm.accent}14`, border: `1px solid ${realm.accent}35` }}
        >
          <div className="text-2xl mb-2">🪷</div>
          <h3 className="text-lg font-semibold mb-1 fr-ink-text"
              style={{ fontFamily: "'Noto Serif SC', serif" }}>
            发一张你的入门令牌
          </h3>
          <p className="text-xs mb-5" style={{ color: '#4a3a1e' }}>{character.socialShare}</p>


          {/* Share card image */}
          <div className="mb-6">
            <FanrentiShareCard
              personality={p}
              character={character}
              realm={realm}
              shareUrl={shareUrl}
            />
          </div>

          <div className="flex gap-3 max-w-sm mx-auto">
            <button
              onClick={copyShareText}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium fr-paper-card cursor-pointer hover:brightness-95 transition"
              style={{ color: realm.textAccent }}
            >
              {textCopied ? '已复制 ✓' : '复制文案'}
            </button>
            <button
              onClick={quickShare}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer shadow"
              style={{ background: realm.accent, color: '#f6f2ea' }}
            >
              {copied ? '已复制 ✓' : '复制链接'}
            </button>
          </div>
        </motion.section>

        {/* Cross-universe */}
        <section className="mb-6">
          <UniverseResultBar slug={p.slug} current="fanrenti" />
        </section>

        {/* Other characters */}
        <section className="mb-8">
          <h3 className="text-xs tracking-[0.3em] uppercase mb-4 text-center" style={{ color: '#8a6a2f' }}>
            · 其他修士 ·
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {others.map(o => {
              const oc = getFanrentiCharacter(o.slug);
              if (!oc) return null;
              const orealm = FR_REALMS[oc.realm];
              return (
                <Link
                  key={o.slug}
                  href={`/fanrenti/result/${o.slug}/`}
                  className="fr-paper-card rounded-xl p-4 flex items-center gap-3 transition hover:brightness-105"
                  style={{ borderColor: `${orealm.accent}35` }}
                >
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl"
                    style={{
                      background: `${orealm.accent}20`,
                      border: `1.5px solid ${orealm.accent}45`,
                    }}
                  >
                    {orealm.emoji}
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-sm font-semibold fr-ink-text truncate"
                         style={{ fontFamily: "'Noto Serif SC', serif" }}>
                      {oc.name}
                    </div>
                    <div className="text-[10px] tracking-wider mt-0.5" style={{ color: orealm.textAccent }}>
                      {orealm.name}
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
              href="/fanrenti/test/"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-medium text-sm shadow-lg"
              style={{
                background: realm.accent,
                color: '#f6f2ea',
                fontFamily: "'Noto Serif SC', serif",
              }}
            >
              重新试炼 🪷
            </Link>
            <Link
              href="/fanrenti/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border text-sm"
              style={{ borderColor: `${realm.accent}55`, color: realm.textAccent }}
            >
              回到山门
            </Link>
          </div>
        </section>
      </div>

      <section className="max-w-2xl mx-auto px-6 pb-12">
        <UniverseSwitcher slug={p.slug} currentUniverseId="fanrenti" />
      </section>

      <section className="max-w-2xl mx-auto px-6 pb-8">
        <WtfiTheoryWiring universe="fanrenti" />
      </section>

      <section className="max-w-2xl mx-auto px-6 pb-12">
        <HermosaInputCard
          universe="fanrenti"
          slug={p.slug}
          personalityName={character.name}
          accent={realm.accent}
        />
      </section>

      <ResultClosureEngine
        currentUniverse="fanrenti"
        personalitySlug={p.slug}
        personalityName={character.name}
        accent={realm.accent}
      />
    </FanrentiTheme>
  );
}
