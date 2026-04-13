'use client';

import NextImage from 'next/image';
import { useState } from 'react';
import type { KingsPersonality } from '@/lib/kings/personalities';
import { getKingsTypeImage } from '@/lib/kings/personalities';

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

  return (
    <div
      className={containerClassName}
      style={{ background: `${personality.color}10` }}
    >
      {failed ? (
        <span className={emojiClassName}>{personality.emoji}</span>
      ) : (
        <NextImage
          src={getKingsTypeImage(personality.slug)}
          alt={alt ?? personality.heroName}
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
