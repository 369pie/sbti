import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { withBasePath } from '@/lib/site';
import { ATLAS_ENTRIES, findEntryBySlug } from '@/lib/atlas/entries';
import { findPublishedAtlasEntryBySlug } from '@/lib/atlas/published';
import {
  pageStyle,
  shellStyle,
  datelineStyle,
  datelineRuleStyle,
  eyebrowStyle,
  titleStyle,
  accentRuleStyle,
  ACCENT,
  INK,
  INK_MUTED,
  HAIRLINE,
  HerVoiceMobileStyles,
} from '../../_editorial-styles';
import { PillarBreadcrumb } from '@/components/PillarBreadcrumb';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function generateStaticParams() {
  return ATLAS_ENTRIES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = findEntryBySlug(slug) ?? await findPublishedAtlasEntryBySlug(slug);
  if (!entry) return { title: '词条未找到 · ATLAS' };
  return {
    title: `${entry.title} · 极光星图 · HER AURORA`,
    description: entry.short,
    alternates: { canonical: `/her-voice/atlas/${entry.slug}/` },
    robots: { index: true, follow: true },
  };
}

export default async function AtlasEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = findEntryBySlug(slug) ?? await findPublishedAtlasEntryBySlug(slug);
  if (!entry) notFound();

  const paragraphs = entry.body.split(/\n\n+/);

  return (
    <>
      <PillarBreadcrumb pillar="III" label={`HER AURORA · 极光星图 · ${entry.title}`} hint={`极光星图 · ${entry.pillar_label}`} />
      <main className="hv-page" style={pageStyle}>
        <HerVoiceMobileStyles />
        <div style={{ ...shellStyle, maxWidth: 760 }}>
          <div style={datelineStyle}>
            <span>HER AURORA · ATLAS · ENTRY · {entry.slug.toUpperCase()}</span>
            <span className="hv-dateline-r">编辑部 · {entry.edit_status === 'co-writing' ? '共写中' : '初稿 v0'}</span>
          </div>
          <div style={datelineRuleStyle} />

          <header style={{ marginBottom: 40 }}>
            <div style={eyebrowStyle}>
              § {entry.pillar_label} · {entry.coords.star} · {entry.coords.moon}
            </div>
            <h1 style={titleStyle}>{entry.title}</h1>
            <div style={accentRuleStyle} />
            <p
              style={{
                marginTop: 22,
                fontSize: 'clamp(16px, 1.7vw, 18px)',
                lineHeight: 1.85,
                color: INK,
                opacity: 0.78,
                fontStyle: 'italic',
                maxWidth: 580,
              }}
            >
              {entry.short}
            </p>
          </header>

          {/* 命理坐标条 */}
          <aside
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 0,
              border: `1px solid ${INK}`,
              marginBottom: 56,
            }}
          >
            {[
              { k: '星', v: entry.coords.star },
              { k: '月', v: entry.coords.moon },
              { k: '行', v: entry.coords.wuxing },
            ].map((c, i) => (
              <div
                key={c.k}
                style={{
                  padding: '18px 16px',
                  borderLeft: i === 0 ? 'none' : `1px solid ${HAIRLINE}`,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: 'ui-monospace, "SF Mono", monospace',
                    fontSize: 10,
                    letterSpacing: '0.42em',
                    color: ACCENT,
                    marginBottom: 8,
                    textTransform: 'uppercase',
                  }}
                >
                  § {c.k}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontSize: 18,
                    color: INK,
                    lineHeight: 1.3,
                  }}
                >
                  {c.v}
                </div>
              </div>
            ))}
          </aside>

          {/* 主笔正文 */}
          <article
            style={{
              fontSize: 17,
              lineHeight: 1.95,
              color: INK,
              fontFamily: 'var(--font-display)',
              marginBottom: 64,
            }}
          >
            {paragraphs.map((p, i) => (
              <p key={i} style={{ marginTop: i === 0 ? 0 : 22 }}>
                {p}
              </p>
            ))}
          </article>

          {/* 沙龙回声精选 */}
          <section style={{ marginBottom: 80 }}>
            <div
              style={{
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 11,
                letterSpacing: '0.42em',
                color: INK,
                marginBottom: 24,
                paddingBottom: 12,
                borderBottom: `1px solid ${INK}`,
                textTransform: 'uppercase',
              }}
            >
              § 来自 SALON 的回声
            </div>
            {entry.voices.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {entry.voices.map((v, i) => (
                <li
                  key={i}
                  style={{
                    padding: '20px 0',
                    borderTop: i === 0 ? 'none' : `1px dotted ${HAIRLINE}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 19,
                      lineHeight: 1.7,
                      fontStyle: 'italic',
                      color: INK,
                    }}
                  >
                    <span style={{ color: ACCENT, marginRight: 4, fontStyle: 'normal' }}>“</span>
                    {v.text}
                    <span style={{ color: ACCENT, marginLeft: 2, fontStyle: 'normal' }}>”</span>
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontFamily: 'ui-monospace, "SF Mono", monospace',
                      fontSize: 10,
                      letterSpacing: '0.28em',
                      color: INK_MUTED,
                      textTransform: 'uppercase',
                    }}
                  >
                    — {v.signature}
                  </div>
                </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, color: INK_MUTED, lineHeight: 1.85, fontStyle: 'italic' }}>
                这条词条来自开放共写投稿池，SALON 回声会在编辑部下一轮整理后补入。
              </p>
            )}
          </section>

          {/* 别名 */}
          <section style={{ marginBottom: 64 }}>
            <div
              style={{
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 10,
                letterSpacing: '0.32em',
                color: INK_MUTED,
                marginBottom: 12,
                textTransform: 'uppercase',
              }}
            >
              § 它也可能叫
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {entry.also_known_as.map((aka) => (
                <span
                  key={aka}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontSize: 16,
                    color: INK,
                    padding: '4px 12px',
                    border: `1px solid ${HAIRLINE}`,
                  }}
                >
                  {aka}
                </span>
              ))}
            </div>
          </section>

          <footer style={{ paddingTop: 32, borderTop: `1px solid ${INK}` }}>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.85,
                color: INK_MUTED,
                fontStyle: 'italic',
                fontFamily: 'var(--font-display)',
                margin: 0,
                marginBottom: 24,
                maxWidth: 560,
              }}
            >
              这条词条暂为编辑部初稿（v0）。Q3 我们会开放共写——如果你不同意这里写的某一句，
              欢迎在 SALON 留言，下一版会把你的修订考虑进去。
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <Link
                href={withBasePath('/her-voice/atlas/')}
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
                ← 看全部词条
              </Link>
              <Link
                href={withBasePath('/her-voice/')}
                style={{
                  fontFamily: 'ui-monospace, "SF Mono", monospace',
                  fontSize: 11,
                  letterSpacing: '0.32em',
                  color: INK,
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  borderBottom: `1px solid ${INK}`,
                  paddingBottom: 2,
                }}
              >
                到 SALON 写下你的版本 →
              </Link>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
