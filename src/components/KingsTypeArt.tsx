'use client';

import NextImage from 'next/image';
import { useState } from 'react';
import type { KingsPersonality } from '@/lib/kings/personalities';
import { getKingsTypeMediumImage, getKingsTypeThumbnailImage } from '@/lib/kings/personalities';

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
  const [imageMode, setImageMode] = useState<'medium' | 'thumb' | 'emoji'>('medium');
  const imageSrc = imageMode === 'medium'
    ? getKingsTypeMediumImage(personality.slug)
    : imageMode === 'thumb'
      ? getKingsTypeThumbnailImage(personality.slug)
      : '';

  return (
    <div
      className={containerClassName}
      style={{
        background: `linear-gradient(135deg, ${personality.color}08 0%, ${personality.color}1a 100%)`,
        boxShadow: `0 24px 80px -24px ${personality.color}45, inset 0 0 0 1px ${personality.color}20`,
      }}
    >
      {imageMode === 'emoji' ? (
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
          onError={() => {
            setImageMode((current) => {
              if (current === 'medium') return 'thumb';
              if (current === 'thumb') return 'emoji';
              return 'emoji';
            });
          }}
        />
      )}
    </div>
  );
}
