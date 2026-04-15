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
      style={{
        background: `linear-gradient(135deg, ${personality.color}08 0%, ${personality.color}1a 100%)`,
        boxShadow: `0 24px 80px -24px ${personality.color}45, inset 0 0 0 1px ${personality.color}20`,
      }}
    >
      {failed ? (
        <span className={emojiClassName}>{personality.emoji}</span>
      ) : (
        <NextImage
          src={getDeltaTypeImage(personality.slug)}
          alt={alt ?? personality.heroName}
          width={400}
          height={400}
          className={imageClassName}
          priority={priority}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
