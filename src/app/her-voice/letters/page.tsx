import type { Metadata } from 'next';
import Link from 'next/link';
import { withBasePath } from '@/lib/site';
import {
  pageStyle,
  shellStyle,
  datelineStyle,
  datelineRuleStyle,
  eyebrowStyle,
  titleStyle,
  accentRuleStyle,
  ledeStyle,
  ACCENT,
  INK,
  INK_MUTED,
  HAIRLINE,
  HerVoiceMobileStyles,
} from '../_editorial-styles';
import { PillarBreadcrumb } from '@/components/PillarBreadcrumb';

export const metadata: Metadata = {
  title: '极光来信 · HER AURORA · LETTERS',
  description: '每月一封写给她当下的灵魂信。第一份从 2026 年 5 月开始。',
  alternates: { canonical: '/her-voice/letters/' },
  robots: { index: true, follow: true },
};

const LETTERS = [
  {
    no: '001',
    href: '/her-voice/letters/2026-05/',
    date: '2026 · 五月',
    title: '五月听起来是这样的',
    teaser: '这一个月，几乎没有一句是在「问答」。她们在写更小、更近的东西——晚饭后没洗的碗、与妈妈通话之后的沉默、那条想发又删的朋友圈。',
    status: 'live',
  },
  {
    no: '002',
    href: null,
    date: '2026 · 六月',
    title: '即将寄出',
    teaser: '六月底我们会寄出第二封。在沙龙里写下你的句子，下一封信里可能就会出现你被回响的那一句。',
    status: 'upcoming',
  },
];

export default function LettersIndexPage() {
  return (
    <>
      <PillarBreadcrumb pillar="III" label="HER AURORA · 极光来信档案" hint="AURORA LETTER · 月度白皮书" />
      <main className="hv-page" style={pageStyle}>
        <HerVoiceMobileStyles />
        <div style={{ ...shellStyle, maxWidth: 760 }}>
          <div style={datelineStyle}>
            <span>HER AURORA · LETTERS · ARCHIVE</span>
            <span className="hv-dateline-r">暮光博物笔记 · 编辑部</span>
          </div>
          <div style={datelineRuleStyle} />

          <header style={{ marginBottom: 56 }}>
            <div style={eyebrowStyle}>§ HER AURORA · 极光来信档案</div>
            <h1 style={titleStyle}>
              她的<span style={{ color: ACCENT }}>月报</span>。
            </h1>
            <div style={accentRuleStyle} />
            <p style={ledeStyle}>
              每月一封，写给<em>她当下的</em>。
              不是数据周报，是把这个月被回响最多的句子和编辑部的回声装进同一封信。
              第一份从 <em>2026 年 5 月</em> 开始。
            </p>
          </header>

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
            }}
          >
            {LETTERS.map((l, i) => (
              <li
                key={l.no}
                style={{
                  padding: '28px 0',
                  borderTop: i === 0 ? `1px solid ${INK}` : `1px dotted ${HAIRLINE}`,
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr',
                  gap: 20,
                  alignItems: 'baseline',
                  opacity: l.status === 'upcoming' ? 0.55 : 1,
                }}
              >
                <span
                  style={{
                    fontFamily: 'ui-monospace, "SF Mono", monospace',
                    fontSize: 11,
                    letterSpacing: '0.32em',
                    color: ACCENT,
                  }}
                >
                  N° {l.no}
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: 'ui-monospace, "SF Mono", monospace',
                      fontSize: 10,
                      letterSpacing: '0.32em',
                      color: INK_MUTED,
                      textTransform: 'uppercase',
                      marginBottom: 8,
                    }}
                  >
                    {l.date}
                  </div>
                  {l.href ? (
                    <Link
                      href={withBasePath(l.href)}
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontStyle: 'italic',
                        fontSize: 'clamp(26px, 5vw, 36px)',
                        lineHeight: 1.2,
                        color: INK,
                        textDecoration: 'none',
                        display: 'inline-block',
                        borderBottom: `2px solid ${ACCENT}`,
                        paddingBottom: 2,
                      }}
                    >
                      {l.title}
                    </Link>
                  ) : (
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontStyle: 'italic',
                        fontSize: 'clamp(26px, 5vw, 36px)',
                        lineHeight: 1.2,
                        color: INK,
                      }}
                    >
                      {l.title}
                    </div>
                  )}
                  <p
                    style={{
                      marginTop: 14,
                      fontSize: 15,
                      lineHeight: 1.85,
                      color: INK,
                      opacity: 0.78,
                      fontStyle: 'italic',
                      maxWidth: 560,
                    }}
                  >
                    {l.teaser}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <footer style={{ marginTop: 80 }}>
            <Link
              href={withBasePath('/her-voice/')}
              style={{
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 11,
                letterSpacing: '0.32em',
                color: ACCENT,
                textDecoration: 'none',
                textTransform: 'uppercase',
                borderBottom: `1px solid ${ACCENT}`,
                paddingBottom: 2,
              }}
            >
              ← 回到 HER AURORA
            </Link>
          </footer>
        </div>
      </main>
    </>
  );
}
