import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchHermosaArtifacts } from '@/lib/hermosa/public-artifacts';
import { isHermosaTopicWeek } from '@/lib/hermosa/tags';
import { getHermosaTopic } from '@/lib/hermosa/topics';
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
  summaryStyle,
  primaryLinkStyle,
  secondaryLinkStyle,
  emptyStyle,
  ACCENT,
  INK,
  INK_MUTED,
  HAIRLINE,
  HerVoiceMobileStyles,
} from '../../_editorial-styles';

type PageProps = { params: Promise<{ week: string }> };

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { week } = await params;
  if (!isHermosaTopicWeek(week)) return {};
  const topic = getHermosaTopic(week);
  return {
    title: `${topic.wallpaperTitle} · ${week} · Her Voice`,
    description: `Her Voice ${week} 本周壁纸包：${topic.question}`,
  };
}

export default async function HerVoiceWallpapersWeekPage({ params }: PageProps) {
  const { week } = await params;
  if (!isHermosaTopicWeek(week)) notFound();
  const topic = getHermosaTopic(week);
  const rows = await fetchHermosaArtifacts({
    kind: 'voice',
    week,
    limit: 9,
    selectedOnly: true,
    consentedOnly: true,
  });
  const collageUrl = withBasePath(`/api/hermosa/artifact/voices?week=${week}`);

  return (
    <main className="hv-page" style={pageStyle}>
      <HerVoiceMobileStyles />
      <div style={{ ...shellStyle, maxWidth: 1040 }}>
        <div style={datelineStyle}>
          <span>HERMOSA · WEEKLY WALLPAPERS · {week.toUpperCase()}</span>
          <span className="hv-dateline-r">暮光博物笔记 · MMXXVI</span>
        </div>
        <div style={datelineRuleStyle} />

        <header style={{ marginBottom: 56 }}>
          <div style={eyebrowStyle}>§ 本周壁纸包 · WALLPAPER PACK</div>
          <h1 style={titleStyle}>{topic.wallpaperTitle}</h1>
          <div style={accentRuleStyle} />
          <p style={ledeStyle}>{topic.question}</p>
          <div style={summaryStyle}>
            {week} / 已精选 {String(rows.length).padStart(2, '0')} 张 / 长按保存即可使用
          </div>
          <div className="hv-actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
            <Link href={withBasePath('/her-voice/?kind=voice')} style={primaryLinkStyle}>
              → 写下她说
            </Link>
            <Link href={withBasePath('/her-voice/')} style={secondaryLinkStyle}>
              ← 回到她说
            </Link>
          </div>
        </header>

        {rows.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <section style={{ marginBottom: 56 }}>
              <a
                href={collageUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'block',
                  border: `1px solid ${INK}`,
                  background: 'transparent',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={collageUrl}
                  alt={`${week} Her Voice 壁纸合集`}
                  style={{ width: '100%', display: 'block' }}
                />
                <div
                  style={{
                    padding: '12px 16px',
                    borderTop: `1px solid ${HAIRLINE}`,
                    fontFamily: 'ui-monospace, "SF Mono", monospace',
                    fontSize: 10,
                    letterSpacing: '0.32em',
                    color: INK_MUTED,
                    textTransform: 'uppercase',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>↓ 合集图 · {week}</span>
                  <span style={{ color: ACCENT }}>SAVE</span>
                </div>
              </a>
            </section>

            <section
              className="hv-wallpaper-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
                gap: 24,
                borderTop: `1px solid ${INK}`,
                paddingTop: 24,
              }}
            >
              {rows.map((row, idx) => {
                const cardUrl = withBasePath(
                  `/api/hermosa/card?id=${encodeURIComponent(row.id)}&style=editorial`,
                );
                return (
                  <article key={row.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <a
                      href={cardUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'block', border: `1px solid ${HAIRLINE}` }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cardUrl}
                        alt={row.text.slice(0, 30)}
                        style={{ width: '100%', display: 'block' }}
                      />
                    </a>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        paddingTop: 6,
                        borderTop: `1px dotted ${HAIRLINE}`,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'ui-monospace, "SF Mono", monospace',
                          fontSize: 10,
                          letterSpacing: '0.32em',
                          color: ACCENT,
                          textTransform: 'uppercase',
                        }}
                      >
                        N° {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: INK,
                          fontStyle: 'italic',
                          fontFamily: '"Cormorant Garamond", serif',
                        }}
                      >
                        — {row.signature || 'Anonymous'}
                      </span>
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div style={emptyStyle}>
      <div style={{ fontSize: 18, color: INK, marginBottom: 14, fontStyle: 'italic' }}>
        — 这一期还没有可下载的壁纸。
      </div>
      <Link
        href={withBasePath('/her-voice/?kind=voice')}
        style={{
          color: ACCENT,
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 11,
          letterSpacing: '0.42em',
          textTransform: 'uppercase',
          textDecoration: 'none',
        }}
      >
        → 写下你的第一句她说
      </Link>
    </div>
  );
}
