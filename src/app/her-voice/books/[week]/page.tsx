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
  cardStyle,
  badgeStyle,
  itemTitleStyle,
  bodyStyle,
  metaStyle,
  emptyStyle,
  gridStyle,
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
    title: `${topic.bookTitle} · ${week} · Her Voice`,
    description: `Her Voice ${week} 共读书单：${topic.question}`,
  };
}

export default async function HerVoiceBooksWeekPage({ params }: PageProps) {
  const { week } = await params;
  if (!isHermosaTopicWeek(week)) notFound();
  const topic = getHermosaTopic(week);
  const rows = await fetchHermosaArtifacts({
    kind: 'book',
    week,
    limit: 60,
    selectedOnly: true,
    consentedOnly: true,
  });
  const imageUrl = withBasePath(`/api/hermosa/artifact/books?week=${week}`);

  return (
    <main className="hv-page" style={pageStyle}>
      <HerVoiceMobileStyles />
      <div style={{ ...shellStyle, maxWidth: 1040 }}>
        <div style={datelineStyle}>
          <span>HERMOSA · WEEKLY BOOKS · {week.toUpperCase()}</span>
          <span className="hv-dateline-r">暮光博物笔记 · MMXXVI</span>
        </div>
        <div style={datelineRuleStyle} />

        <header style={{ marginBottom: 56 }}>
          <div style={eyebrowStyle}>§ 本周共读 · WEEKLY BOOKS</div>
          <h1 style={titleStyle}>{topic.bookTitle}</h1>
          <div style={accentRuleStyle} />
          <p style={ledeStyle}>{topic.question}</p>
          <div style={summaryStyle}>
            {week} / 已发布 {String(rows.length).padStart(2, '0')} 本 / 可保存集合图
          </div>
          <div className="hv-actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
            <Link href={withBasePath(`/her-voice/?kind=book`)} style={primaryLinkStyle}>
              → 推荐一本书
            </Link>
            <Link href={withBasePath('/her-voice/books/')} style={secondaryLinkStyle}>
              全部书架
            </Link>
            <Link href={withBasePath('/her-voice/')} style={secondaryLinkStyle}>
              ← 回到她说
            </Link>
          </div>
        </header>

        <section
          className="hv-week-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
            gap: 32,
            alignItems: 'start',
          }}
        >
          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'block',
              padding: 0,
              border: `1px solid ${INK}`,
              background: 'transparent',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`${week} Her Voice 书单集合图`}
              style={{ width: '100%', display: 'block', borderRadius: 0 }}
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
              <span>↓ 集合图 · {week}</span>
              <span style={{ color: ACCENT }}>SAVE</span>
            </div>
          </a>
          {rows.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="hv-grid" style={gridStyle}>
              {rows.map((row, idx) => (
                <article key={row.id} style={cardStyle}>
                  <span style={badgeStyle}>N° {String(idx + 1).padStart(2, '0')} · BOOK</span>
                  <h2 className="hv-card-title" style={itemTitleStyle}>
                    {row.metadata?.book_title ?? '未命名书籍'}
                  </h2>
                  {row.metadata?.book_author ? (
                    <div style={{
                      fontSize: 13,
                      color: INK_MUTED,
                      fontStyle: 'italic',
                      fontFamily: '"Cormorant Garamond", serif',
                    }}>
                      — {row.metadata.book_author}
                    </div>
                  ) : null}
                  <p style={bodyStyle}>{row.metadata?.book_note || row.metadata?.book_quote || row.text}</p>
                  <div style={metaStyle}>
                    <span>{row.signature || 'ANONYMOUS'}</span>
                    <span>✓ {row.echo_count}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div style={emptyStyle}>
      <div style={{ fontSize: 18, color: INK, marginBottom: 14, fontStyle: 'italic' }}>
        — 这一期还没有可公开的授权书单。
      </div>
      <Link
        href={withBasePath('/her-voice/?kind=book')}
        style={{
          color: ACCENT,
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 11,
          letterSpacing: '0.42em',
          textTransform: 'uppercase',
          textDecoration: 'none',
        }}
      >
        → 去推荐第一本书
      </Link>
    </div>
  );
}
