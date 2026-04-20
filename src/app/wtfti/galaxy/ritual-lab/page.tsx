/**
 * Ritual Lab · 8 题型 + 3 仪式 的总览试玩页
 * URL: /wtfti/galaxy/ritual-lab/
 *
 * 给设计/产品/灰度用户预览所有问答仪式语法的视觉与交互。
 */
import type { Metadata } from 'next';

import { RitualLabClient } from '@/components/galaxy/RitualLabClient';

export const metadata: Metadata = {
  title: 'Ritual Lab · 问答仪式实验台 · WTFTI',
  description:
    'WTFTI 八种问答仪式语法 + 三个章节仪式的实验台 — 双行星 · 拍立得 · 镜面滑杆 · 塔罗 · 凌晨短信 · 唱片 · 滴墨 · 私语 · 神殿之门 · 印记勾勒 · 星尘封信。',
  openGraph: {
    title: 'Ritual Lab · 问答仪式实验台',
    description: '8 种问答仪式 + 3 个章节仪式的视觉与交互预览。',
  },
};

export default function RitualLabPage() {
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
          maxWidth: 720,
          padding: '48px 18px 96px',
        }}
      >
      <header style={{ textAlign: 'center', margin: '6px 0 28px' }}>
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
          ✦ Ritual Lab · 内部预览
        </p>
        <h1
          style={{
            margin: '8px 0 6px',
            fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
            fontSize: 32,
            fontStyle: 'italic',
            fontWeight: 500,
            lineHeight: 1.1,
          }}
        >
          每一题都该有自己的<em>呼吸</em>。
        </h1>
        <p
          style={{
            margin: '0 auto',
            maxWidth: 480,
            fontSize: 13,
            color: 'rgba(245,240,232,.65)',
            lineHeight: 1.65,
          }}
        >
          8 种问答仪式语法（F1-F8）+ 3 个章节仪式（C1-C3）。
          每一种都对应不同情绪、不同人格章节、不同触觉反馈。
        </p>
      </header>
      <RitualLabClient />
      </div>
    </main>
  );
}
