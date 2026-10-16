import type { Metadata } from 'next';
import Link from 'next/link';
import { withBasePath } from '@/lib/site';
import { ATLAS_ENTRIES } from '@/lib/atlas/entries';
import { getPublishedAtlasEntries } from '@/lib/atlas/published';
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
  primaryLinkStyle,
  secondaryLinkStyle,
} from '../_editorial-styles';
import { PillarBreadcrumb } from '@/components/PillarBreadcrumb';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata: Metadata = {
  title: '极光星图 · ATLAS · HER AURORA',
  description: '一本由女孩们共写的小百科。首批 5 个词条 · 邀请制共写中。',
  alternates: { canonical: '/her-voice/atlas/' },
  robots: { index: true, follow: true },
};

export default async function AtlasIndexPage() {
  const publishedEntries = await getPublishedAtlasEntries();
  const staticSlugs = new Set(ATLAS_ENTRIES.map((entry) => entry.slug));
  const entries = [
    ...ATLAS_ENTRIES,
    ...publishedEntries.filter((entry) => !staticSlugs.has(entry.slug)),
  ];

  return (
    <>
      <PillarBreadcrumb pillar="III" label="HER AURORA · 极光星图" hint="极光星图 · 共写百科 v0" />
      <main className="hv-page" style={pageStyle}>
        <HerVoiceMobileStyles />
        <div style={{ ...shellStyle, maxWidth: 880 }}>
          <div style={datelineStyle}>
            <span>HER AURORA · ATLAS · v0 · INVITE-ONLY</span>
            <span className="hv-dateline-r">暮光博物笔记 · 编辑部</span>
          </div>
          <div style={datelineRuleStyle} />

          <header style={{ marginBottom: 56 }}>
            <div style={eyebrowStyle}>§ HER AURORA · 极光星图</div>
            <h1 style={titleStyle}>
              一本由<span style={{ color: ACCENT }}>女孩们</span>共写的<br />小百科。
            </h1>
            <div style={accentRuleStyle} />
            <p style={ledeStyle}>
              不是 wiki，不是字典——是把那些<em>没有名字、却被很多女孩同时经历</em>的事，
              先起一个名字，再写下去。内置 5 条编辑部 v0 词条会和 Q3 已发布共写稿一起陈列。
            </p>
            <p
              style={{
                marginTop: 18,
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 11,
                letterSpacing: '0.32em',
                color: ACCENT,
                textTransform: 'uppercase',
              }}
            >
              § 当前：{ATLAS_ENTRIES.length} 条编辑部 v0 · {publishedEntries.length} 条已发布共写
            </p>

            <div className="hv-actions" style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              <Link href={withBasePath('/her-voice/atlas/submit/')} style={primaryLinkStyle}>
                预提交一条词条
              </Link>
              <Link href={withBasePath('/her-voice/')} style={secondaryLinkStyle}>
                回到沙龙
              </Link>
            </div>
          </header>

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 0,
            }}
          >
            {entries.map((e, i) => (
              <li
                key={e.slug}
                style={{
                  padding: '32px 0',
                  borderTop: i === 0 ? `1px solid ${INK}` : `1px dotted ${HAIRLINE}`,
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr',
                  gap: 20,
                  alignItems: 'baseline',
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
                  N° {String(i + 1).padStart(2, '0')}
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
                    § {e.pillar_label} · {e.coords.star} · {e.coords.moon}
                  </div>
                  <Link
                    href={withBasePath(`/her-voice/atlas/${e.slug}/`)}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontStyle: 'italic',
                      fontSize: 'clamp(28px, 5vw, 40px)',
                      lineHeight: 1.15,
                      color: INK,
                      textDecoration: 'none',
                      display: 'inline-block',
                      borderBottom: `2px solid ${ACCENT}`,
                      paddingBottom: 2,
                    }}
                  >
                    {e.title}
                  </Link>
                  <p
                    style={{
                      marginTop: 14,
                      fontSize: 16,
                      lineHeight: 1.85,
                      color: INK,
                      opacity: 0.78,
                      fontStyle: 'italic',
                      maxWidth: 600,
                      margin: '14px 0 0',
                    }}
                  >
                    {e.short}
                  </p>
                  <div
                    style={{
                      marginTop: 12,
                      fontFamily: 'ui-monospace, "SF Mono", monospace',
                      fontSize: 10,
                      letterSpacing: '0.28em',
                      color: INK_MUTED,
                      textTransform: 'uppercase',
                    }}
                  >
                    aka · {e.also_known_as.join(' / ')}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <footer style={{ marginTop: 96, paddingTop: 32, borderTop: `1px solid ${INK}` }}>
            <div
              style={{
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 10,
                letterSpacing: '0.42em',
                color: ACCENT,
                marginBottom: 12,
                textTransform: 'uppercase',
              }}
            >
              § COLOPHON · 关于词条
            </div>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.85,
                color: INK_MUTED,
                fontStyle: 'italic',
                fontFamily: 'var(--font-display)',
                margin: 0,
                maxWidth: 600,
              }}
            >
              「她词条」不替你定义你自己——它只是把那些一直在被经历、却一直没被命名的事，先起一个名字。
              如果你不同意，欢迎把更好的写下来；如果你同意，欢迎把这一页发给同样在经历它的女孩。
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
