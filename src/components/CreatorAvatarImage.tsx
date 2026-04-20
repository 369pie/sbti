import NextImage from 'next/image';

interface CreatorAvatarImageProps {
  src: string;
  alt: string;
  size: number;
  className?: string;
  sizes?: string;
}

function canOptimizeAvatar(src: string): boolean {
  if (src.startsWith('/')) return true;

  try {
    const { protocol, hostname } = new URL(src);
    if (protocol !== 'https:') return false;

    return (
      hostname === 'lh3.googleusercontent.com' ||
      hostname === 'avatars.githubusercontent.com' ||
      hostname.endsWith('.supabase.co') ||
      hostname.endsWith('.public.blob.vercel-storage.com') ||
      hostname === 'qlogo.cn' ||
      hostname.endsWith('.qlogo.cn') ||
      hostname.endsWith('.runninghub.cn')
    );
  } catch {
    return false;
  }
}

export function CreatorAvatarImage({
  src,
  alt,
  size,
  className = 'w-full h-full object-cover',
  sizes,
}: CreatorAvatarImageProps) {
  if (canOptimizeAvatar(src)) {
    return (
      <NextImage
        src={src}
        alt={alt}
        width={size}
        height={size}
        sizes={sizes ?? `${size}px`}
        className={className}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
}
