import type { Metadata } from 'next';
import Link from 'next/link';
import { withBasePath } from '@/lib/site';
import { fetchHermosaArtifacts } from '@/lib/hermosa/public-artifacts';
import { getCurrentHermosaTopic } from '@/lib/hermosa/topics';
import { HermosaBookmarkButton } from '@/components/hermosa/HermosaBookmarkButton';
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
  quoteStyle,
  bodyStyle,
  metaStyle,
  emptyStyle,
  gridStyle,
  ACCENT,
  INK,
  INK_MUTED,
  HerVoiceMobileStyles,
} from '../_editorial-styles';

export const metadata: Metadata = {
  title: '她的书架 · Her Voice · WTFTI',
  description: 'Her Voice Commons 里由女性共同推荐、共读、共建的书单。',
};

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function HerVoiceBooksPage() {
  const topic = getCurrentHermosaTopic();
  const rows = await fetchHermosaArtifacts({ kind: 'book', limit: 100 });

  return (
    <main className="hv-page" style={pageStyle}>
      <HerVoiceMobileStyles />
      <div style={shellStyle}>
        <div style={datelineStyle}>
          <span>HERMOSA · BOOK COMMONS · {topic.week.toUpperCase()}</span>
          <span className="hv-dateline-r">暮光博物笔记 · MMXXVI</span>
        </div>
        <div style={datelineRuleStyle} />

        <header style={{ marginBottom: 56 }}>
          <div style={eyebrowStyle}>§ 她的书架 · BOOK SHELF</div>
          <h1 style={titleStyle}>
            她在<span style={{ color: ACCENT }}>读</span>什么
          </h1>
          <div style={accentRuleStyle} />
          <p style={ledeStyle}>
            这里收集 Her Voice 里女性正在读、愿意推荐、想一起讨论的书。一本书不是装饰品，
            它是一次把经验变成共同语言的机会。
          </p>
          <div style={summaryStyle}>
            {topic.week} / {topic.shortTitle} / 当前公开 {rows.length} 本
          </div>
          <div className="hv-actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
            <Link href={withBasePath('/her-voice/?kind=book')} style={primaryLinkStyle}>
              → 推荐一本书
            </Link>
            <Link href={withBasePath(`/her-voice/books/${topic.week}/`)} style={secondaryLinkStyle}>
              本周书单
            </Link>
            <Link href={withBasePath('/her-voice/')} style={secondaryLinkStyle}>
              ← 回到她说
            </Link>
          </div>
        </header>

        {rows.length === 0 ? (
          <EmptyBooks />
        ) : (
          <section className="hv-grid" style={gridStyle}>
            {rows.map((row, index) => (
              <article key={row.id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
                  <span style={badgeStyle}>
                    N° {String(index + 1).padStart(2, '0')} · {row.topic_week ?? 'BOOK'}
                  </span>
                  <span style={{
                    fontFamily: 'ui-monospace, "SF Mono", monospace',
                    fontSize: 10,
                    letterSpacing: '0.28em',
                    color: INK_MUTED,
                  }}>
                    ✓ {row.echo_count}
                  </span>
                </div>
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
                {row.metadata?.book_quote ? (
                  <blockquote className="hv-quote" style={quoteStyle}>
                    “{row.metadata.book_quote}”
                  </blockquote>
                ) : null}
                <p style={bodyStyle}>{row.metadata?.book_note || row.text}</p>
                <div style={metaStyle}>
                  <span>{row.signature || 'ANONYMOUS'}</span>
                  <span>{new Date(row.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <HermosaBookmarkButton id={row.id} scope="book" />
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function EmptyBooks() {
  return (
    <div style={emptyStyle}>
      <div style={{ fontSize: 18, color: INK, marginBottom: 14, fontStyle: 'italic' }}>
        — 书架还在等第一本书。
      </div>
      <Link
        href={withBasePath('/her-voice/?kind=book')}
        style={{
          color: ACCENT,
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 11,
          letterSpacing: '0.42em',
          textDecoration: 'none',
          textTransform: 'uppercase',
        }}
      >
        → 去推荐一本正在读的书
      </Link>
    </div>
  );
}
