'use client';

import NextImage from 'next/image';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { getLoveTypeImage, getLoveTypeMediumImage } from '@/lib/love/personalities';
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
  ...props
}: Props) {
  return <LovePersonalityAvatarInner key={personality.slug} personality={personality} {...props} />;
}

function LovePersonalityAvatarInner({
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
  const [useOriginalImage, setUseOriginalImage] = useState(false);

  const imageSrc = useOriginalImage
    ? getLoveTypeImage(personality.slug)
    : getLoveTypeMediumImage(personality.slug);

  return (
    <div className={className} style={style}>
      {imageFailed ? (
        <div className={fallbackClassName}>{personality.emoji}</div>
      ) : (
        <NextImage
          src={imageSrc}
          alt={alt ?? `${personality.name}形象`}
          fill
          priority={priority}
          sizes={sizes}
          className={imageClassName}
          placeholder="blur"
          blurDataURL="data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgAA="
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
