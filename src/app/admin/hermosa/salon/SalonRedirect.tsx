'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { withBasePath } from '@/lib/site';

export function SalonRedirect() {
  useEffect(() => {
    const target = withBasePath('/admin/hermosa/aurora/');
    window.location.replace(target);
  }, []);
  return (
    <main
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
        padding: 32,
        fontFamily: 'var(--font-display, "Cormorant Garamond", "Noto Serif SC", serif)',
        color: '#1A1530',
      }}
    >
      <p style={{ fontStyle: 'italic', fontSize: 20 }}>
        HER SALON 已升格为 HER AURORA…
      </p>
      <p style={{ fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8A817A' }}>
        Redirecting to /admin/hermosa/aurora/
      </p>
      <Link
        href={withBasePath('/admin/hermosa/aurora/')}
        style={{ fontSize: 14, color: '#C0512F', borderBottom: '1px solid #C0512F', paddingBottom: 2 }}
      >
        如果未自动跳转，请点这里 →
      </Link>
    </main>
  );
}
