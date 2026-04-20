/**
 * /wtfti/letters/ · 用户的 Stardust Letters 收信箱
 */
import type { Metadata } from 'next';

import { LettersInbox } from '@/components/galaxy/LettersInbox';

export const metadata: Metadata = {
  title: '✦ Stardust Letters · 收信箱 · WTFTI',
  description: '你写给 30 天后自己的星尘信件 — 到期即可拆封。',
};

export default function LettersPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse 100% 60% at 50% 0%, #2a1c4d 0%, #1a1530 38%, #0F0A22 100%)',
        color: '#F5F0E8',
        fontFamily: 'var(--font-display), "Cormorant Garamond", "Noto Serif SC", serif',
      }}
    >
      <div
        style={{
          margin: '0 auto',
          maxWidth: 640,
          padding: '48px 18px 80px',
        }}
      >
      <header style={{ textAlign: 'center', marginBottom: 24 }}>
        <p
          style={{
            margin: 0,
            fontSize: 10,
            letterSpacing: 7,
            color: '#C9A676',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          ✦ Stardust Letters · 收信箱
        </p>
        <h1
          style={{
            margin: '6px 0 8px',
            fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
            fontSize: 30,
            fontStyle: 'italic',
            fontWeight: 500,
            lineHeight: 1.15,
          }}
        >
          那些你写给<em>未来自己</em>的信
        </h1>
        <p
          style={{
            margin: '0 auto',
            maxWidth: 460,
            fontSize: 12.5,
            color: 'rgba(245,240,232,.65)',
            lineHeight: 1.65,
          }}
        >
          每一封星尘信件都封缄 30 天 — 到期可拆封。
          这些信只存在你的浏览器里 · 不会上传。
        </p>
      </header>
      <LettersInbox />
      </div>
    </main>
  );
}
