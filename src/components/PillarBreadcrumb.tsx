/**
 * <PillarBreadcrumb /> · W3 · E3.2
 *
 * 让用户在任意子页都能看到「你正在 ‖ 支柱 X · ___」。
 * 服务端组件——纯渲染，无 hydration。
 */

import Link from 'next/link';

export type Pillar = 'I' | 'II' | 'III';

interface Props {
  pillar: Pillar;
  /** 这一页在支柱里的位置标签，例如 "Mysti · 灵鉴" 或 "WTFTI · 神性女性矩阵" */
  label: string;
  /** 可选——补一行 italic 注脚 */
  hint?: string;
}

const META: Record<
  Pillar,
  { eyebrow: string; chinese: string; accent: string; href: string }
> = {
  I: { eyebrow: 'KNOW HER', chinese: '认识她', accent: 'var(--color-rose)', href: '/start/' },
  II: { eyebrow: 'WALK WITH HER', chinese: '陪着她', accent: 'var(--color-gem)', href: '/mysti/' },
  III: {
    eyebrow: 'WRITE WITH HER',
    chinese: '一起写下她',
    accent: 'var(--color-gold-leaf)',
    href: '/bottle/',
  },
};

export function PillarBreadcrumb({ pillar, label, hint }: Props) {
  const m = META[pillar];
  return (
    <nav
      aria-label={`Pillar ${pillar} breadcrumb`}
      className="px-6 sm:px-10 py-3 flex flex-wrap items-baseline gap-x-4 gap-y-1"
      style={{
        borderBottom: '1px solid var(--color-rule-soft)',
        background: 'var(--color-bg-elevated)',
      }}
    >
      <Link
        href="/"
        className="text-[10px] tracking-[0.32em] uppercase hover:underline"
        style={{
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          color: 'var(--color-text-muted)',
        }}
      >
        WTFTI
      </Link>
      <span style={{ color: 'var(--color-text-muted)' }} aria-hidden>
        ‖
      </span>
      <Link
        href={m.href}
        className="text-[10px] tracking-[0.32em] uppercase hover:underline"
        style={{
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          color: m.accent,
        }}
      >
        N°{pillar} · {m.eyebrow} · {m.chinese}
      </Link>
      <span style={{ color: 'var(--color-text-muted)' }} aria-hidden>
        ›
      </span>
      <span
        className="text-[12px]"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--color-text-primary)',
        }}
      >
        {label}
      </span>
      {hint ? (
        <span
          className="text-[11px] ml-auto"
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            color: 'var(--color-text-muted)',
          }}
        >
          {hint}
        </span>
      ) : null}
    </nav>
  );
}
