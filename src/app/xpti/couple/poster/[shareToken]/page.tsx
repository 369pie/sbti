import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCoupleByShareToken } from '@/lib/xpti/couple-server';
import { PosterDownloadClient } from './PosterDownloadClient';

interface PosterPageProps {
  params: Promise<{ shareToken: string }>;
}

export const metadata: Metadata = {
  title: 'XPTI · 关系海报',
  description: '下载属于你们的 XPTI 关系海报。',
  robots: { index: false, follow: false },
};

export default async function CouplePosterPage({ params }: PosterPageProps) {
  const { shareToken } = await params;
  const couple = await getCoupleByShareToken(shareToken);
  if (!couple) notFound();

  const posterUrl = `/api/xpti/couples/${shareToken}/poster`;
  const resultUrl = `/xpti/couple/result/${shareToken}/`;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#1a1530',
        color: 'var(--color-bg-primary)',
        padding: '48px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
      }}
    >
      <div style={{ fontSize: 12, letterSpacing: '0.32em', color: 'var(--color-gold)', textTransform: 'uppercase' }}>
        Couple Poster · 1080 × 1440
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0, textAlign: 'center' }}>
        长按下方海报保存到相册
      </h1>

      {/* Direct <img> so long-press save works on mobile */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterUrl}
        alt="XPTI 关系海报"
        style={{
          width: 'min(360px, 90vw)',
          height: 'auto',
          aspectRatio: '1080 / 1440',
          background: '#0c0820',
          borderRadius: 12,
          boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
        }}
      />

      <PosterDownloadClient posterUrl={posterUrl} pairCode={couple.pair_code} />

      <Link
        href={resultUrl}
        style={{
          marginTop: 8,
          fontSize: 13,
          letterSpacing: '0.2em',
          color: 'rgba(245,240,232,0.6)',
          textDecoration: 'none',
        }}
      >
        ← 返回关系报告
      </Link>
    </main>
  );
}
