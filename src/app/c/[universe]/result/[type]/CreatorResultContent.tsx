'use client';

import Link from 'next/link';
import { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { getApiPath } from '@/lib/api';
import type { PersonalityRow, UniverseRow } from '@/lib/ugc/db';
import { Glyph, type GlyphName } from '@/components/Glyph';
import { CreatorAvatarImage } from '@/components/CreatorAvatarImage';
import { stripLeadingEmoji } from '@/lib/strip-emoji';

interface Props {
  universe: UniverseRow;
  personality: PersonalityRow;
  allPersonalities: {
    slug: string;
    name: string;
    emoji: string;
    tagline: string | null;
    color: string;
    thumbnail_url: string | null;
  }[];
  creator: {
    id: string;
    name: string;
    avatar_url: string | null;
    social_link: string | null;
    bio: string | null;
    is_verified: boolean;
  } | null;
}

export function CreatorResultContent({ universe, personality, allPersonalities, creator }: Props) {
  const shareTrackedRef = useRef(false);

  const trackShare = useCallback(async () => {
    if (shareTrackedRef.current || typeof window === 'undefined') return;

    try {
      const key = `creator-quiz:last-result:${universe.id}`;
      const raw = window.sessionStorage.getItem(key);
      if (!raw) return;

      const parsed = JSON.parse(raw) as {
        sessionId?: string;
        personalitySlug?: string;
        sharedTracked?: boolean;
      };

      if (!parsed.sessionId || parsed.personalitySlug !== personality.slug) return;
      if (parsed.sharedTracked) {
        shareTrackedRef.current = true;
        return;
      }

      for (let attempt = 0; attempt < 4; attempt += 1) {
        const res = await fetch(getApiPath('/ugc/share'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            universeId: universe.id,
            personalitySlug: personality.slug,
            sessionId: parsed.sessionId,
          }),
        });

        if (!res.ok) return;

        const payload = await res.json().catch(() => null) as {
          updated?: boolean;
          alreadyShared?: boolean;
          pendingResult?: boolean;
        } | null;

        if (payload?.updated || payload?.alreadyShared) {
          shareTrackedRef.current = true;
          window.sessionStorage.setItem(key, JSON.stringify({ ...parsed, sharedTracked: true }));
          return;
        }

        if (!payload?.pendingResult || attempt === 3) {
          return;
        }

        await new Promise((resolve) => window.setTimeout(resolve, 250 * (attempt + 1)));
      }
    } catch {
      // Ignore tracking failures.
    }
  }, [personality.slug, universe.id]);

  const handleShare = async () => {
    const shareText = `${universe.emoji} ${universe.name}\n我的结果是：${personality.name}\n${personality.tagline ?? ''}\n\n来测测你是哪种人格 👉`;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    if (navigator.share) {
      try {
        await navigator.share({ title: personality.name, text: shareText, url: shareUrl });
        await trackShare();
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      await trackShare();
      alert('已复制到剪贴板！');
    }
  };

  const otherPersonalities = allPersonalities.filter(p => p.slug !== personality.slug);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-16 pb-8 px-6 text-center max-w-lg mx-auto"
      >
        <div className="text-6xl mb-4">{personality.emoji}</div>
        {personality.number && (
          <p className="text-xs text-bg-primary/30 tracking-widest mb-2">{personality.number}</p>
        )}
        <h1 className="text-3xl font-bold text-bg-primary mb-2">{personality.name}</h1>
        {personality.code && (
          <p className="text-sm text-bg-primary/40 font-mono mb-3">{personality.code}</p>
        )}
        {personality.tagline && (
          <p className="text-bg-primary/60 text-sm leading-relaxed">{personality.tagline}</p>
        )}
      </motion.section>

      {/* Content sections */}
      <div className="max-w-lg mx-auto px-6 space-y-8 pb-12">
        {/* Hit */}
        {personality.copy_hit && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 rounded-2xl p-6"
          >
            <h2 className="atelier-section-header text-sm font-medium text-bg-primary/60 mb-3 flex items-center gap-2">
              <Glyph name={'strike' as GlyphName} size={15} tone="gold" />
              <span className="tracking-wide">
                {stripLeadingEmoji(universe.hit_label) || '一击'}
              </span>
            </h2>
            <p className="text-bg-primary/80 text-sm leading-relaxed">{personality.copy_hit}</p>
          </motion.section>
        )}

        {/* OS */}
        {personality.copy_os && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 rounded-2xl p-6"
          >
            <h2 className="atelier-section-header text-sm font-medium text-bg-primary/60 mb-3 flex items-center gap-2">
              <Glyph name={'mind' as GlyphName} size={15} tone="gold" />
              <span className="tracking-wide">
                {stripLeadingEmoji(universe.os_label) || 'OS 解读'}
              </span>
            </h2>
            <p className="text-bg-primary/80 text-sm leading-relaxed whitespace-pre-line">
              {personality.copy_os}
            </p>
          </motion.section>
        )}

        {/* Symptoms */}
        {personality.copy_symptoms && personality.copy_symptoms.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 rounded-2xl p-6"
          >
            <h2 className="atelier-section-header text-sm font-medium text-bg-primary/60 mb-3 flex items-center gap-2">
              <Glyph name={'list' as GlyphName} size={15} tone="gold" />
              <span className="tracking-wide">
                {stripLeadingEmoji(universe.symptoms_label) || '症状清单'}
              </span>
            </h2>
            <ul className="space-y-2">
              {personality.copy_symptoms.map((s, i) => (
                <li key={i} className="flex gap-2 text-bg-primary/70 text-sm">
                  <span className="text-bg-primary/30">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        {/* Closer */}
        {personality.copy_closer && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 rounded-2xl p-6"
          >
            <p className="text-bg-primary/80 text-sm leading-relaxed italic">
              {personality.copy_closer}
            </p>
          </motion.section>
        )}

        {/* Quote */}
        {personality.quote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-4"
          >
            <p className="text-bg-primary/30 text-xs italic">&ldquo;{personality.quote}&rdquo;</p>
          </motion.div>
        )}

        {/* Share */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center"
        >
          <button
            onClick={handleShare}
            className="px-8 py-3 rounded-full text-bg-primary text-sm font-medium transition-transform active:scale-95"
            style={{ background: personality.color || universe.primary_color }}
          >
            分享我的结果
          </button>
        </motion.div>

        {/* Creator card */}
        {creator && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/5 rounded-2xl p-5"
          >
            <div className="flex items-start gap-4">
              <Link
                href={`/creator/profile/${creator.id}/`}
                className="w-12 h-12 rounded-2xl overflow-hidden bg-white/10 flex items-center justify-center text-lg shrink-0"
              >
                {creator.avatar_url ? (
                  <CreatorAvatarImage src={creator.avatar_url} alt={`${creator.name}头像`} size={48} />
                ) : (
                  <span>{creator.name.slice(0, 1)}</span>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/creator/profile/${creator.id}/`} className="text-sm font-medium text-bg-primary hover:text-bg-primary/80 transition-colors">
                    {creator.name}
                  </Link>
                  {creator.is_verified && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300">已认证</span>}
                </div>
                <div className="text-xs text-bg-primary/30 mt-1">本测试创作者</div>
                {creator.bio && (
                  <div className="text-sm text-bg-primary/55 mt-2 leading-7 line-clamp-3">{creator.bio}</div>
                )}
                <div className="flex flex-wrap gap-3 mt-3">
                  <Link
                    href={`/creator/profile/${creator.id}/`}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-bg-primary/80 transition-colors"
                  >
                    看 TA 的其他宇宙
                  </Link>
                  {creator.social_link && (
                    <a
                      href={creator.social_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs text-bg-primary/55 transition-colors"
                    >
                      外部主页 ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Other personalities */}
        {otherPersonalities.length > 0 && (
          <section className="pt-8">
            <h3 className="text-sm text-bg-primary/30 mb-4 text-center">其他人格类型</h3>
            <div className="grid grid-cols-2 gap-3">
              {otherPersonalities.map(p => (
                <a
                  key={p.slug}
                  href={`/c/${universe.slug}/result/${p.slug}/`}
                  className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="text-2xl mb-1">{p.emoji}</div>
                  <div className="text-sm font-medium text-bg-primary/80">{p.name}</div>
                  {p.tagline && (
                    <div className="text-xs text-bg-primary/40 mt-1 line-clamp-2">{p.tagline}</div>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Retest CTA */}
        <div className="text-center pb-8">
          <a
            href={`/c/${universe.slug}/test/`}
            className="text-bg-primary/30 hover:text-bg-primary/50 text-sm transition-colors"
          >
            重新测试 →
          </a>
        </div>
      </div>
    </div>
  );
}
