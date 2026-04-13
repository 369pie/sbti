'use client';

import NextImage from 'next/image';
import { useState } from 'react';
import type { BirdPersonality } from '@/lib/bird/personalities';
import { getBirdTypeImage } from '@/lib/bird/personalities';

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
          src={getBirdTypeImage(personality.slug)}
          alt={alt ?? personality.birdTitle}
          width={320}
          height={320}
          className={imageClassName}
          priority={priority}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
