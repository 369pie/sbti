'use client';

import NextImage from 'next/image';
import { useState } from 'react';
import type { KingsPersonality } from '@/lib/kings/personalities';
import { getKingsTypeImage, getKingsTypeMediumImage, getKingsTypeCardImage } from '@/lib/kings/personalities';

interface KingsTypeArtProps {
  personality: KingsPersonality;
  alt?: string;
  containerClassName: string;
  imageClassName: string;
  emojiClassName: string;
  priority?: boolean;
}

export function KingsTypeArt({
  personality,
  alt,
  containerClassName,
  imageClassName,
  emojiClassName,
  priority = false,
}: KingsTypeArtProps) {
  const [failed, setFailed] = useState(false);

  const KINGS_CARD_SLUGS = new Set(['boss', 'simp', 'thin-k', 'rebel', 'joker', 'drunk', 'dior-s', 'food-ie']);
  const imageSrc = KINGS_CARD_SLUGS.has(personality.slug)
    ? getKingsTypeCardImage(personality.slug)
    : getKingsTypeMediumImage(personality.slug);

  return (
    <div
      className={containerClassName}
      style={{
        background: `linear-gradient(135deg, ${personality.color}08 0%, ${personality.color}1a 100%)`,
        boxShadow: `0 24px 80px -24px ${personality.color}45, inset 0 0 0 1px ${personality.color}20`,
      }}
    >
      {failed ? (
        <span className={emojiClassName}>{personality.emoji}</span>
      ) : (
        <NextImage
          src={imageSrc}
          alt={alt ?? personality.heroName}
          width={400}
          height={400}
          className={imageClassName}
          priority={priority}
          placeholder="blur"
          blurDataURL="data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgAA="
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
