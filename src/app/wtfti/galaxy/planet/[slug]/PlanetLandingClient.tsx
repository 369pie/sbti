'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PlanetLandingClient({
  slug,
  accent,
  planetName,
}: {
  slug: string;
  accent: string;
  planetName: string;
}) {
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `我在 WTFTI 人格星图发现：${planetName}\n${url}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: planetName, text, url });
        return;
      }
    } catch {
      // user cancelled — fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <section
      style={{
        marginTop: 40,
        padding: '28px 24px',
        borderRadius: 24,
        background: `linear-gradient(135deg, ${accent}22 0%, rgba(156,124,255,0.14) 100%)`,
        border: `1px solid ${accent}44`,
        textAlign: 'center',
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: 'Inter, sans-serif',
          fontSize: 10,
          letterSpacing: '0.42em',
          color: '#D4B58A',
          textTransform: 'uppercase',
        }}
      >
        ✦ Find Your Home Planet
      </p>
      <h2
        style={{
          margin: '12px 0 10px',
          fontFamily: 'var(--font-display), serif',
          fontSize: 26,
          letterSpacing: '0.04em',
          color: '#F5F0E8',
        }}
      >
        想知道你<em style={{ fontStyle: 'italic', color: accent, padding: '0 4px' }}>属于哪颗主星</em>吗？
      </h2>
      <p
        style={{
          margin: '0 auto 18px',
          maxWidth: 320,
          fontFamily: '"Noto Serif SC", serif',
          fontSize: 13,
          lineHeight: 1.85,
          color: 'rgba(245,240,232,0.78)',
        }}
      >
        90 秒看见你自己的人格星系，以及和 ta 的引力轨道。
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        <Link
          href="/wtfti/test/"
          style={{
            appearance: 'none',
            display: 'inline-block',
            borderRadius: 999,
            padding: '12px 28px',
            fontSize: 12,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            background: '#F5F0E8',
            color: '#1a1530',
            fontWeight: 500,
            fontFamily: 'Inter, sans-serif',
            textDecoration: 'none',
          }}
        >
          ✦ 测出我的主星
        </Link>
        <Link
          href={`/wtfti/galaxy/pair/preview/?seed=${slug}`}
          style={{
            appearance: 'none',
            display: 'inline-block',
            borderRadius: 999,
            padding: '11px 26px',
            fontSize: 11.5,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            background: 'transparent',
            color: '#F5F0E8',
            fontFamily: 'Inter, sans-serif',
            textDecoration: 'none',
            border: `1px solid ${accent}88`,
          }}
        >
          求出我和 {planetName} 的引力
        </Link>
        <Link
          href={`/wtfti/shrine/${slug}/`}
          style={{
            appearance: 'none',
            display: 'inline-block',
            borderRadius: 999,
            padding: '11px 26px',
            fontSize: 11.5,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            background: 'transparent',
            color: '#F5F0E8',
            fontFamily: 'Inter, sans-serif',
            textDecoration: 'none',
            border: `1px solid ${accent}88`,
          }}
        >
          ✦ 进入 {planetName} 神龛
        </Link>
        <button
          type="button"
          onClick={onShare}
          style={{
            appearance: 'none',
            background: 'transparent',
            border: 'none',
            color: 'rgba(245,240,232,0.6)',
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            padding: '6px 14px',
          }}
        >
          {copied ? '✓ 链接已复制' : '☆ 截屏发圈 / 复制链接'}
        </button>
      </div>
    </section>
  );
}
