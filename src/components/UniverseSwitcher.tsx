'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { getLiveUniverses } from '@/lib/universes';
import { resolvePersonality } from '@/lib/personality-resolver';
import { getBantiTypeThumbnailImage } from '@/lib/banti/personalities';
import { getKingsTypeThumbnailImage } from '@/lib/kings/personalities';
import { getDeltaTypeThumbnailImage } from '@/lib/delta/personalities';
import { getWtftiTypeThumbnailImage } from '@/lib/wtfti-personalities';

interface UniverseSwitcherProps {
  slug: string;
  currentUniverseId: string;
}

function getThumbnailForUniverse(universeId: string, slug: string): string | null {
  switch (universeId) {
    case 'banti':
      return getBantiTypeThumbnailImage(slug);
    case 'kings':
      return getKingsTypeThumbnailImage(slug);
    case 'delta':
      return getDeltaTypeThumbnailImage(slug);
    case 'wtfti':
    case 'standard':
      return getWtftiTypeThumbnailImage(slug);
    default:
      return null;
  }
}

export function UniverseSwitcher({ slug, currentUniverseId }: UniverseSwitcherProps) {
  const others = getLiveUniverses().filter(u => u.id !== currentUniverseId);

  if (others.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-6 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
          🌌 看看你在其他宇宙长什么样
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {others.map(u => {
            const resolved = resolvePersonality(u.id, slug);
            const href =
              u.id === 'xiuxian'
                ? `${u.resultPrefix}/result/${slug}/?skin=xiuxian`
                : `${u.resultPrefix}/result/${slug}/`;

            // Locked / coming-soon state
            if (!resolved) {
              return (
                <div
                  key={u.id}
                  className="group relative rounded-2xl border border-border-subtle bg-bg-elevated p-3 sm:p-4 flex flex-col items-center text-center opacity-70"
                >
                  <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
                    {u.emoji && <span>{u.emoji}</span>}
                    <span className="font-medium">{u.shortName}</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center min-h-[80px] sm:min-h-[96px]">
                    <div className="text-2xl mb-1">🔒</div>
                    <div className="text-xs text-text-muted">即将上线</div>
                  </div>
                </div>
              );
            }

            const thumbnail = getThumbnailForUniverse(u.id, slug);

            return (
              <Link
                key={u.id}
                href={href}
                prefetch={false}
                className="group rounded-2xl border border-border-subtle bg-bg-elevated p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-border transition-all flex flex-col"
              >
                {/* Header: emoji + short name */}
                <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
                  {u.emoji && <span>{u.emoji}</span>}
                  <span className="font-medium">{u.shortName}</span>
                </div>

                {/* Visual area */}
                <div
                  className="w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center mb-2"
                  style={{
                    background: thumbnail
                      ? `linear-gradient(135deg, ${u.accent}08, ${u.accent}16)`
                      : `linear-gradient(135deg, ${u.accent}15, ${u.accent}30)`,
                  }}
                >
                  {thumbnail ? (
                    <NextImage
                      src={thumbnail}
                      alt={resolved.name}
                      width={120}
                      height={120}
                      className="w-[82%] h-[82%] object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-3xl sm:text-4xl">{resolved.emoji}</span>
                  )}
                </div>

                {/* Personality name */}
                <div className="mt-auto text-center">
                  <div
                    className="text-sm font-semibold truncate"
                    style={{ color: u.accent }}
                  >
                    {resolved.name}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
