'use client';

import NextImage from 'next/image';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { getLoveTypeImage } from '@/lib/love/personalities';
import type { LovePersonalityType } from '@/lib/love/personalities';

interface Props {
  personality: LovePersonalityType;
  className: string;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  style?: CSSProperties;
  imageClassName?: string;
  fallbackClassName?: string;
}

export function LovePersonalityAvatar({
  personality,
  className,
  alt,
  sizes = '128px',
  priority = false,
  style,
  imageClassName = 'object-contain',
  fallbackClassName = 'w-full h-full flex items-center justify-center text-4xl',
}: Props) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [personality.slug]);

  return (
    <div className={className} style={style}>
      {imageFailed ? (
        <div className={fallbackClassName}>{personality.emoji}</div>
      ) : (
        <NextImage
          src={getLoveTypeImage(personality.slug)}
          alt={alt ?? `${personality.name}形象`}
          fill
          unoptimized
          priority={priority}
          sizes={sizes}
          className={imageClassName}
          onError={() => setImageFailed(true)}
        />
      )}
    </div>
  );
}
