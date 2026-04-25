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

export const metadata: Metadata = {
  title: '她说我们听见了 · HERMOSA · WTFTI',
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

export default async function WeHeardYouPage() {
  const rows = await fetchHeard();
  const grouped: Record<string, Row[]> = { shipped: [], planned: [], heard: [] };
  for (const r of rows) {
    if (r.status && grouped[r.status]) grouped[r.status]!.push(r);
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        padding: '64px 18px 120px',
        fontFamily: 'var(--font-display, "Noto Serif SC", serif)',
      }}
    >
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: '0.42em',
              color: 'var(--color-accent)',
              marginBottom: 12,
              fontWeight: 500,
            }}
          >
            HERMOSA · WE HEARD YOU
          </div>
          <h1 style={{ margin: 0, fontSize: 38, fontStyle: 'italic', lineHeight: 1.25 }}>
            她说，我们听见了。
          </h1>
          <p
            style={{
              maxWidth: 540,
              margin: '16px auto 0',
              fontSize: 14,
              lineHeight: 1.9,
              color: 'var(--color-text-secondary)',
            }}
          >
            带 <span style={{ color: 'var(--color-accent)' }}>#想要</span> /{' '}
            <span style={{ color: 'var(--color-accent)' }}>#体验吐槽</span> 的留言进入这里。
            每一条都标注了 <em>已收到 / 排期中 / 已上线</em>。
            没收到的——是我们还没读到，
            <Link href={withBasePath('/her-voice/')} style={{ color: 'var(--color-accent)' }}>
              {' '}去她说墙留言
            </Link>。
          </p>
        </header>

        {STATUS_ORDER.map((s) => {
          const list = grouped[s] ?? [];
          if (list.length === 0) return null;
          return (
            <section key={s} style={{ marginTop: 36 }}>
              <h2
                style={{
                  fontSize: 13,
                  letterSpacing: '0.42em',
                  margin: '0 0 14px',
                  color: s === 'shipped' ? 'var(--color-sage)' : s === 'planned' ? 'var(--color-gold)' : 'var(--color-accent)',
                  fontWeight: 500,
                }}
              >
                — {HERMOSA_STATUS_LABELS[s]} ({list.length}) —
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {list.map((r) => (
                  <li
                    key={r.id}
                    style={{
                      padding: 16,
                      borderRadius: 14,
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ fontSize: 15, lineHeight: 1.7, fontStyle: 'italic' }}>「{r.text}」</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 11 }}>
                      {(r.tags ?? []).map((t) => (
                        <span
                          key={t}
                          style={{
                            padding: '2px 8px',
                            borderRadius: 999,
                            border: '1px solid var(--color-border-subtle)',
                            color: 'var(--color-accent)',
                            letterSpacing: '0.18em',
                          }}
                        >
                          # {HERMOSA_TAG_LABELS[t as HermosaTag] ?? t}
                        </span>
                      ))}
                      <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }}>
                        — {r.signature || 'Anonymous'} ·{' '}
                        {HERMOSA_UNIVERSE_LABELS[r.universe as keyof typeof HERMOSA_UNIVERSE_LABELS] ??
                          r.universe}
                      </span>
                    </div>
                    {r.status_note ? (
                      <div
                        style={{
                          padding: '8px 12px',
                          borderRadius: 8,
                          background: 'var(--color-bg-secondary)',
                          fontSize: 12,
                          color: 'var(--color-text-secondary)',
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
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px dashed var(--color-border-subtle)',
            }}
          >
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 10 }}>看板还没有公开记录。</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              你的话会先出现在
              <Link href={withBasePath('/her-voice/')} style={{ color: 'var(--color-accent)' }}>
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
