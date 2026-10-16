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
  chipStyle,
  itemTitleStyle,
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
  title: 'AI 互助实验室 · Her Voice · WTFTI',
  description: 'Her Voice Commons 里的女性 AI 学习问题池：把困惑变成共同实验。',
};

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function HerVoiceAiLabPage() {
  const topic = getCurrentHermosaTopic();
  const rows = await fetchHermosaArtifacts({ kind: 'ai_question', limit: 100 });

  return (
    <main className="hv-page" style={pageStyle}>
      <HerVoiceMobileStyles />
      <div style={shellStyle}>
        <div style={datelineStyle}>
          <span>HERMOSA · AI LEARNING LAB · {topic.week.toUpperCase()}</span>
          <span className="hv-dateline-r">暮光博物笔记 · MMXXVI</span>
        </div>
        <div style={datelineRuleStyle} />

        <header style={{ marginBottom: 56 }}>
          <div style={eyebrowStyle}>§ AI 互助实验室 · LAB</div>
          <h1 style={titleStyle}>
            把<span style={{ color: ACCENT }}>困惑</span>变成实验
          </h1>
          <div style={accentRuleStyle} />
          <p style={ledeStyle}>
            把“我不知道怎么问”也写下来。这里先收集女性真实的 AI 学习问题，
            下一步会整理成提示词、共学任务和可复制的实践路径。
          </p>
          <div style={summaryStyle}>
            {topic.week} / {topic.aiLabTitle} / 当前公开 {rows.length} 个问题
          </div>
          <div className="hv-actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
            <Link href={withBasePath('/her-voice/?kind=ai_question')} style={primaryLinkStyle}>
              → 提出一个问题
            </Link>
            <Link href={withBasePath('/her-voice/')} style={secondaryLinkStyle}>
              ← 回到她说
            </Link>
          </div>
        </header>

        {rows.length === 0 ? (
          <EmptyQuestions />
        ) : (
          <section className="hv-grid" style={gridStyle}>
            {rows.map((row, index) => (
              <article key={row.id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
                  <span style={badgeStyle}>
                    Q{String(index + 1).padStart(2, '0')} · {row.topic_week ?? 'AI'}
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
                  <span style={{ color: ACCENT, marginRight: 4, fontStyle: 'normal', fontFamily: '"Cormorant Garamond", serif' }}>“</span>
                  {row.metadata?.ai_question ?? row.text}
                  <span style={{ color: ACCENT, marginLeft: 2, fontStyle: 'normal', fontFamily: '"Cormorant Garamond", serif' }}>”</span>
                </h2>
                {row.metadata?.ai_context || row.metadata?.ai_tool ? (
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    {row.metadata.ai_context ? <span style={chipStyle}>· {row.metadata.ai_context}</span> : null}
                    {row.metadata.ai_tool ? <span style={chipStyle}>⌘ {row.metadata.ai_tool}</span> : null}
                  </div>
                ) : null}
                <p style={bodyStyle}>
                  这条问题会进入 AI 共学题库，适合被整理成示例提示词、行动步骤或小组实验。
                </p>
                <div style={metaStyle}>
                  <span>{row.signature || 'ANONYMOUS'}</span>
                  <span>{new Date(row.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <HermosaBookmarkButton id={row.id} scope="ai" />
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function EmptyQuestions() {
  return (
    <div style={emptyStyle}>
      <div style={{ fontSize: 18, color: INK, marginBottom: 14, fontStyle: 'italic' }}>
        — AI 实验室还没有公开问题。
      </div>
      <Link
        href={withBasePath('/her-voice/?kind=ai_question')}
        style={{
          color: ACCENT,
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 11,
          letterSpacing: '0.42em',
          textDecoration: 'none',
          textTransform: 'uppercase',
        }}
      >
        → 写下第一个想学会的问题
      </Link>
    </div>
  );
}
