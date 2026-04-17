'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { SOULTI_PERSONALITY_TYPES } from '@/lib/soulti/personalities';
import { normalizePairSlugs } from '@/lib/soulti/pair';

const serifFont = "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";
const monoFont = "'SF Mono', 'Roboto Mono', ui-monospace, monospace";

export default function SoultiPairPickerContent() {
  const [a, setA] = useState<string>('');
  const [b, setB] = useState<string>('');

  const sorted = useMemo(
    () => [...SOULTI_PERSONALITY_TYPES].sort((x, y) => x.number.localeCompare(y.number)),
    []
  );

  const canGo = a && b && a !== b;
  const [ca, cb] = canGo ? normalizePairSlugs(a, b) : ['', ''];

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>
      <header className="max-w-2xl mx-auto px-6 pt-16 pb-8 text-center">
        <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ fontFamily: monoFont, color: '#8b7355', opacity: 0.7 }}>
          SoulTI · Pair
        </p>
        <h1 className="text-3xl sm:text-4xl mb-3" style={{ fontFamily: serifFont, color: '#2D2A26' }}>
          双人共振
        </h1>
        <p className="text-sm" style={{ fontFamily: serifFont, color: '#6a6054', lineHeight: 2 }}>
          选择你和 TA 各自的自然人格，<br />
          看看你们在 5 轴上的共振、张力与成长章节。
        </p>
      </header>

      <main className="max-w-2xl mx-auto px-6 pb-24">
        <div className="space-y-6">
          {[
            { label: 'A · 你', value: a, setter: setA, color: '#8b7355' },
            { label: 'B · TA', value: b, setter: setB, color: '#7a6b8a' },
          ].map(({ label, value, setter, color }) => (
            <section
              key={label}
              className="rounded-3xl p-5 sm:p-6"
              style={{ background: '#FDFCFA', border: '1px solid rgba(139,115,85,0.15)' }}
            >
              <p className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ fontFamily: monoFont, color }}>
                {label}
              </p>
              <select
                value={value}
                onChange={e => setter(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-base appearance-none"
                style={{
                  background: '#FAF8F5',
                  border: '1px solid rgba(139,115,85,0.2)',
                  fontFamily: serifFont,
                  color: '#2D2A26',
                }}
              >
                <option value="">请选择一种自然人格</option>
                {sorted.map(p => (
                  <option key={p.slug} value={p.slug}>
                    {p.emoji} {p.number} {p.name} · {p.code}
                  </option>
                ))}
              </select>
            </section>
          ))}
        </div>

        <div className="mt-8 text-center">
          {canGo ? (
            <Link
              href={`/soulti/pair/${ca}/${cb}/`}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-full text-white text-base transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #6b5d4d, #8b7355, #a89070)',
                boxShadow: '0 4px 24px rgba(107,93,77,0.20)',
                fontFamily: serifFont,
                letterSpacing: '0.1em',
              }}
            >
              开始共振 →
            </Link>
          ) : (
            <p className="text-xs" style={{ fontFamily: monoFont, color: '#9a918a' }}>
              {a && b && a === b ? '请选择两种不同的人格' : '请分别选择 A 和 B'}
            </p>
          )}
        </div>

        <nav className="mt-10 flex flex-wrap justify-center gap-3 text-sm" style={{ fontFamily: serifFont }}>
          <Link href="/soulti/" className="px-4 py-2 rounded-full border" style={{ borderColor: 'rgba(139,115,85,0.3)', color: '#6a6054' }}>
            ← 先测我自己的
          </Link>
          <Link href="/soulti/map/" className="px-4 py-2 rounded-full border" style={{ borderColor: 'rgba(139,115,85,0.3)', color: '#6a6054' }}>
            查看全部 32 型
          </Link>
        </nav>
      </main>
    </div>
  );
}
