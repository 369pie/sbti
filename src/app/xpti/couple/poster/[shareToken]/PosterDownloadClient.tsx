'use client';

import { useState } from 'react';

export function PosterDownloadClient({ posterUrl, pairCode }: { posterUrl: string; pairCode: string }) {
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    setBusy(true);
    try {
      const res = await fetch(posterUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `xpti-couple-${pairCode || 'poster'}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(posterUrl, '_blank');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={busy}
      style={{
        marginTop: 8,
        padding: '12px 28px',
        background: '#C9A676',
        color: '#1a1530',
        border: 'none',
        borderRadius: 999,
        fontSize: 13,
        letterSpacing: '0.24em',
        fontWeight: 600,
        cursor: busy ? 'not-allowed' : 'pointer',
        opacity: busy ? 0.6 : 1,
      }}
    >
      {busy ? '生成中…' : '下载海报 PNG'}
    </button>
  );
}
