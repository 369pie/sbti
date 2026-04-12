'use client';

import NextImage from 'next/image';
import { useState } from 'react';
import type { BantiPersonality } from '@/lib/banti/personalities';
import { getBantiTypeImage } from '@/lib/banti/personalities';

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
      style={{ background: `${personality.color}10` }}
    >
      {failed ? (
        <span className={emojiClassName}>{personality.emoji}</span>
      ) : (
        <NextImage
          src={getBantiTypeImage(personality.slug)}
          alt={alt ?? personality.workName}
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