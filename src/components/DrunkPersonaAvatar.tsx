'use client';

import { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { getDrunkTypeImage, getDrunkTypeThumbnailImage } from '@/lib/drunk/personas';
import type { DrunkPersonaType } from '@/lib/drunk/personas';

interface Props {
  persona: DrunkPersonaType;
  className?: string;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  style?: React.CSSProperties;
  imageClassName?: string;
  fallbackClassName?: string;
}

export function DrunkPersonaAvatar({
  persona,
  className,
  alt,
  sizes = '128px',
  priority = false,
  style,
  imageClassName = 'object-contain',
  fallbackClassName = 'w-full h-full flex items-center justify-center text-4xl',
}: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const [useOriginalImage, setUseOriginalImage] = useState(false);

  useEffect(() => {
    setImageFailed(false);
    setUseOriginalImage(false);
  }, [persona.slug]);

  const imageSrc = useOriginalImage
    ? getDrunkTypeImage(persona.slug)
    : getDrunkTypeThumbnailImage(persona.slug);

  return (
    <div className={className} style={style}>
      {imageFailed ? (
        <div className={fallbackClassName}>{persona.emoji}</div>
      ) : (
        <NextImage
          src={imageSrc}
          alt={alt ?? `${persona.name}形象`}
          fill
          unoptimized
          priority={priority}
          sizes={sizes}
          className={imageClassName}
          onError={() => {
            if (!useOriginalImage) {
              setUseOriginalImage(true);
              return;
            }
            setImageFailed(true);
          }}
        />
      )}
    </div>
  );
}
