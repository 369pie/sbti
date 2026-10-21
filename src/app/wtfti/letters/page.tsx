/**
 * /wtfti/letters/ · 用户的 Stardust Letters 收信箱
 */
import type { Metadata } from 'next';

import { LettersInbox } from '@/components/galaxy/LettersInbox';
import { CosmicThemeBinder } from '@/components/wtfti/HomeCosmosThemeBinder';

export const metadata: Metadata = {
  title: '✦ 时间胶囊 · 收信箱',
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
          ✦ 时间胶囊 · 收信箱
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
          每一颗时间胶囊封存 30 天，到期提醒你回来拆。
          存在云端，换个设备它还在。
        </p>
      </header>
      <CosmicThemeBinder />
  <LettersInbox />
      </div>
    </main>
  );
}
