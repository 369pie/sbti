import type { Metadata } from 'next';
import Link from 'next/link';
import { withBasePath } from '@/lib/site';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  HERMOSA_STATUS_LABELS,
  HERMOSA_TAG_LABELS,
  HERMOSA_UNIVERSE_LABELS,
  type HermosaTag,
} from '@/lib/hermosa/tags';
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

export const metadata: Metadata = {
  title: '她说我们听见了 · HERMOSA',
  description: 'HERMOSA 用户共建公开看板：「想要」「体验吐槽」标签下的留言，及产品方的处理状态。',
};

export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface Row {
  id: string;
  universe: string;
  slug: string | null;
  text: string;
  signature: string | null;
  tags: string[];
  status: string | null;
  status_note: string | null;
  created_at: string;
}

async function fetchHeard(): Promise<Row[]> {
  try {
    const admin = createAdminSupabaseClient();
    const { data } = await admin
      .from('hermosa_messages')
      .select('id,universe,slug,text,signature,tags,status,status_note,created_at')
      .eq('is_published', true)
      .eq('flagged', false)
      .not('status', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);
    return (data ?? []) as Row[];
  } catch {
    return [];
  }
}

const STATUS_ORDER = ['shipped', 'planned', 'heard'] as const;
const STATUS_COLOR: Record<string, string> = {
  shipped: '#5C7A4F',
  planned: '#C9A676',
  heard: ACCENT,
};

export default async function WeHeardYouPage() {
  const rows = await fetchHeard();
  const grouped: Record<string, Row[]> = { shipped: [], planned: [], heard: [] };
  for (const r of rows) {
    if (r.status && grouped[r.status]) grouped[r.status]!.push(r);
  }

  return (
    <main className="hv-page" style={pageStyle}>
      <HerVoiceMobileStyles />
      <div style={{ ...shellStyle, maxWidth: 880 }}>
        <div style={datelineStyle}>
          <span>HERMOSA · WE HEARD YOU · {String(rows.length).padStart(3, '0')}</span>
          <span className="hv-dateline-r">暮光博物笔记 · MMXXVI</span>
        </div>
        <div style={datelineRuleStyle} />

        <header style={{ marginBottom: 56 }}>
          <div style={eyebrowStyle}>§ WE HEARD YOU · 公开看板</div>
          <h1 style={titleStyle}>
            她说，我们<span style={{ color: ACCENT }}>听见了</span>。
          </h1>
          <div style={accentRuleStyle} />
          <p style={ledeStyle}>
            带 <span style={{ color: ACCENT, fontStyle: 'normal' }}>#想要</span> /{' '}
            <span style={{ color: ACCENT, fontStyle: 'normal' }}>#体验吐槽</span> 的留言进入这里。
            每一条都标注了 <em>已收到 / 排期中 / 已上线</em>。没收到的——是我们还没读到，
            <Link href={withBasePath('/her-voice/')} style={{ color: ACCENT, fontStyle: 'normal' }}>
              {' '}去她说墙留言
            </Link>
            。
          </p>
        </header>

        {STATUS_ORDER.map((s) => {
          const list = grouped[s] ?? [];
          if (list.length === 0) return null;
          return (
            <section key={s} style={{ marginTop: 48 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 14,
                  marginBottom: 18,
                  paddingBottom: 10,
                  borderBottom: `1px solid ${INK}`,
                }}
              >
                <span
                  style={{
                    fontFamily: 'ui-monospace, "SF Mono", monospace',
                    fontSize: 11,
                    letterSpacing: '0.42em',
                    color: STATUS_COLOR[s] ?? ACCENT,
                    textTransform: 'uppercase',
                  }}
                >
                  § {HERMOSA_STATUS_LABELS[s]} ({String(list.length).padStart(2, '0')})
                </span>
                <div style={{ flex: 1, height: 1, background: HAIRLINE }} />
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
                {list.map((r, idx) => (
                  <li
                    key={r.id}
                    style={{
                      padding: '20px 0',
                      borderTop: idx === 0 ? 'none' : `1px dotted ${HAIRLINE}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 18,
                        lineHeight: 1.6,
                        fontStyle: 'italic',
                        color: INK,
                      }}
                    >
                      <span style={{ color: ACCENT, marginRight: 4, fontStyle: 'normal' }}>“</span>
                      {r.text}
                      <span style={{ color: ACCENT, marginLeft: 2, fontStyle: 'normal' }}>”</span>
                    </div>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'baseline' }}>
                      {(r.tags ?? []).map((t) => (
                        <span
                          key={t}
                          style={{
                            fontFamily: 'ui-monospace, "SF Mono", monospace',
                            fontSize: 10,
                            color: ACCENT,
                            letterSpacing: '0.28em',
                            textTransform: 'uppercase',
                          }}
                        >
                          # {HERMOSA_TAG_LABELS[t as HermosaTag] ?? t}
                        </span>
                      ))}
                      <span
                        style={{
                          marginLeft: 'auto',
                          color: INK_MUTED,
                          fontFamily: 'ui-monospace, "SF Mono", monospace',
                          fontSize: 10,
                          letterSpacing: '0.28em',
                          textTransform: 'uppercase',
                        }}
                      >
                        — {r.signature || 'Anonymous'} ·{' '}
                        {HERMOSA_UNIVERSE_LABELS[r.universe as keyof typeof HERMOSA_UNIVERSE_LABELS] ?? r.universe}
                      </span>
                    </div>
                    {r.status_note ? (
                      <div
                        style={{
                          padding: '12px 16px',
                          borderLeft: `3px solid ${STATUS_COLOR[s] ?? ACCENT}`,
                          background: 'rgba(26, 21, 48, 0.03)',
                          fontSize: 14,
                          lineHeight: 1.7,
                          color: INK,
                          fontStyle: 'italic',
                          fontFamily: '"Cormorant Garamond", serif',
                        }}
                      >
                        ↪ {r.status_note}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {rows.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              border: `1px dashed ${HAIRLINE}`,
            }}
          >
            <div style={{ fontSize: 18, color: INK, marginBottom: 14, fontStyle: 'italic' }}>
              — 看板还没有公开记录。
            </div>
            <div style={{ fontSize: 13, color: INK_MUTED, fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic' }}>
              你的话会先出现在
              <Link href={withBasePath('/her-voice/')} style={{ color: ACCENT }}>
                {' '}「她说」墙{' '}
              </Link>
              ，被我们读到后会移到这里 ✦
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
