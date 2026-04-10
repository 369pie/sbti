'use client';

import NextImage from 'next/image';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { getDailyTypeImage } from '@/lib/daily/statuses';
import type { DailyStatusType } from '@/lib/daily/statuses';

interface Props {
  status: DailyStatusType;
  className: string;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  style?: CSSProperties;
  imageClassName?: string;
  fallbackClassName?: string;
}

export function DailyStatusAvatar({
  status,
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
  }, [status.slug]);

  return (
    <div className={className} style={style}>
      {imageFailed ? (
        <div className={fallbackClassName}>{status.emoji}</div>
      ) : (
        <NextImage
          src={getDailyTypeImage(status.slug)}
          alt={alt ?? `${status.name}形象`}
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
