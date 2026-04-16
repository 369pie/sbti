'use client';

import NextImage from 'next/image';
import { useState } from 'react';
import type { BantiPersonality } from '@/lib/banti/personalities';
import { getBantiTypeImage, getBantiTypeMediumImage } from '@/lib/banti/personalities';

interface BantiTypeArtProps {
  personality: BantiPersonality;
  alt?: string;
  containerClassName: string;
  imageClassName: string;
  emojiClassName: string;
  priority?: boolean;
}

export function BantiTypeArt({
  personality,
  alt,
  containerClassName,
  imageClassName,
  emojiClassName,
  priority = false,
}: BantiTypeArtProps) {
  const [failed, setFailed] = useState(false);

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
          src={getBantiTypeMediumImage(personality.slug)}
          alt={alt ?? personality.workName}
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