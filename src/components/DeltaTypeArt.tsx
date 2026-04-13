'use client';

import NextImage from 'next/image';
import { useState } from 'react';
import type { DeltaPersonality } from '@/lib/delta/personalities';
import { getDeltaTypeImage } from '@/lib/delta/personalities';

interface DeltaTypeArtProps {
  personality: DeltaPersonality;
  alt?: string;
  containerClassName: string;
  imageClassName: string;
  emojiClassName: string;
  priority?: boolean;
}

export function DeltaTypeArt({
  personality,
  alt,
  containerClassName,
  imageClassName,
  emojiClassName,
  priority = false,
}: DeltaTypeArtProps) {
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
          src={getDeltaTypeImage(personality.slug)}
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
