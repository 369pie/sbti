'use client';

import NextImage from 'next/image';
import { useState } from 'react';
import type { BirdPersonality } from '@/lib/bird/personalities';
import { getBirdTypeMediumImage } from '@/lib/bird/personalities';

interface BirdTypeArtProps {
  personality: BirdPersonality;
  alt?: string;
  containerClassName: string;
  imageClassName: string;
  emojiClassName: string;
  priority?: boolean;
}

export function BirdTypeArt({
  personality,
  alt,
  containerClassName,
  imageClassName,
  emojiClassName,
  priority = false,
}: BirdTypeArtProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={containerClassName}
      style={{ background: `${personality.color}10` }}
    >
      {failed ? (
        <span className={emojiClassName}>{personality.emoji}</span>
      ) : (
        <NextImage
          src={getBirdTypeMediumImage(personality.slug)}
          alt={alt ?? personality.birdTitle}
          width={320}
          height={320}
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
