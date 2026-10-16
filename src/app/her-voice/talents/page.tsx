/**
 * /her-voice/talents — 公开接单名录（沙龙）
 * ─────────────────────────────────────────────
 * 服务端渲染 published & is_open_to_collab 名录；
 * 每张卡片附一个客户端 <WhisperButton /> 触发双盲投递弹窗。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { withBasePath } from '@/lib/site';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { HERMOSA_UNIVERSE_LABELS, isHermosaUniverse } from '@/lib/hermosa/tags';
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
import { WhisperButton } from './WhisperButton';

export const metadata: Metadata = {
  title: '她说·沙龙｜接单名录 · HERMOSA',
  description: '一群匿名女性创作者的接单档案 —— 写作、设计、咨询、AI 工程、研究。直接发起一条 Whisper，就能联系到她。',
};

export const dynamic = 'force-dynamic';
export const revalidate = 60;

const PAGE_SIZE = 24;
const MAX_PAGE = 20;

interface Row {
  id: string;
  handle: string;
  pitch: string;
  skills: string[];
  universe: string | null;
  slug: string | null;
  contact_email: string | null;
  contact_note: string | null;
  is_open_to_collab: boolean;
  curation_status: string;
  created_at: string;
}

interface FetchOpts {
  skill?: string;
  universe?: string;
  page: number;
}

interface FetchResult {
  rows: Row[];
  total: number;
}

async function fetchTalents(opts: FetchOpts): Promise<FetchResult> {
  try {
    const admin = createAdminSupabaseClient();
    const from = (opts.page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let q = admin
      .from('hermosa_talents')
      .select(
        'id,handle,pitch,skills,universe,slug,contact_email,contact_note,is_open_to_collab,curation_status,created_at',
        { count: 'exact' },
      )
      .eq('is_published', true)
      .eq('flagged', false)
      .eq('is_open_to_collab', true)
      // spotlighted 永远在最前
      .order('curation_status', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (opts.skill) q = q.contains('skills', [opts.skill]);
    if (opts.universe && isHermosaUniverse(opts.universe)) q = q.eq('universe', opts.universe);
    const { data, count } = await q;
    return { rows: (data ?? []) as Row[], total: count ?? 0 };
  } catch {
    return { rows: [], total: 0 };
  }
}

/**
 * 取整张表的 skill 频率前 12 名作为筛选 chip。
 * 单独 query，因为我们想显示一个稳定的 chip 列表，而不只是当前页的。
 */
async function fetchTopSkills(): Promise<string[]> {
  try {
    const admin = createAdminSupabaseClient();
    const { data } = await admin
      .from('hermosa_talents')
      .select('skills')
      .eq('is_published', true)
      .eq('flagged', false)
      .eq('is_open_to_collab', true)
      .limit(500);
    const counts = new Map<string, number>();
    for (const r of (data ?? []) as Pick<Row, 'skills'>[]) {
      for (const s of r.skills ?? []) {
        counts.set(s, (counts.get(s) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([s]) => s);
  } catch {
    return [];
  }
}

function buildHref(opts: { skill?: string; universe?: string; page?: number }): string {
  const sp = new URLSearchParams();
  if (opts.skill) sp.set('skill', opts.skill);
  if (opts.universe) sp.set('universe', opts.universe);
  if (opts.page && opts.page > 1) sp.set('page', String(opts.page));
  const qs = sp.toString();
  return withBasePath(`/her-voice/talents/${qs ? `?${qs}` : ''}`);
}

export default async function TalentsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ skill?: string; universe?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const skill = typeof sp.skill === 'string' && sp.skill.trim() ? sp.skill.trim().slice(0, 32) : undefined;
  const universe =
    typeof sp.universe === 'string' && isHermosaUniverse(sp.universe) ? sp.universe : undefined;
  const pageRaw = Number(sp.page ?? '1');
  const page = Math.min(Math.max(Number.isFinite(pageRaw) ? Math.floor(pageRaw) : 1, 1), MAX_PAGE);
  const hasFilter = Boolean(skill || universe);

  const [{ rows, total }, topSkills] = await Promise.all([
    fetchTalents({ skill, universe, page }),
    fetchTopSkills(),
  ]);

  const totalPages = Math.max(1, Math.min(MAX_PAGE, Math.ceil(total / PAGE_SIZE) || 1));
  const universeOptions = Object.entries(HERMOSA_UNIVERSE_LABELS) as Array<
    [string, string]
  >;

  return (
    <main className="hv-page" style={pageStyle}>
      <HerVoiceMobileStyles />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 720px) {
              .hv-talent-grid { grid-template-columns: 1fr !important; }
            }
          `,
        }}
      />
      <div style={shellStyle}>
        <div style={datelineStyle}>
          <span>HERMOSA · SALON · TALENTS · {String(rows.length).padStart(3, '0')}</span>
          <span className="hv-dateline-r">暮光博物笔记 · MMXXVI</span>
        </div>
        <div style={datelineRuleStyle} />

        <header style={{ marginBottom: 56 }}>
          <div style={eyebrowStyle}>§ TALENTS · 沙龙接单名录</div>
          <h1 style={titleStyle}>
            一群<span style={{ color: ACCENT }}>不报真名</span>的接单者
          </h1>
          <div style={accentRuleStyle} />
          <p style={ledeStyle}>
            写作、设计、咨询、AI 工程、研究、播客、剪辑——
            她们把自己的一句话写在这里。点 <em>WHISPER</em> 直接发邮件给她，
            我们不在中间留痕；她不想接单了，下一秒就能从名录里隐身。
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 22 }}>
            <Link
              href={withBasePath('/her-voice/my/')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 44,
                padding: '12px 22px',
                background: INK,
                color: '#F5F0E8',
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 11,
                letterSpacing: '0.42em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                border: `1px solid ${INK}`,
              }}
            >
              → 写我的接单档案
            </Link>
            <Link
              href={withBasePath('/her-voice/')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 44,
                padding: '12px 22px',
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 11,
                letterSpacing: '0.42em',
                textTransform: 'uppercase',
                color: INK,
                textDecoration: 'none',
                border: `1px solid ${HAIRLINE}`,
              }}
            >
              ← 回到她说
            </Link>
          </div>
        </header>

        {/* ── Filters ─────────────────────────── */}
        <section
          aria-label="名录筛选"
          style={{
            margin: '0 0 32px',
            padding: '20px 22px',
            border: `1px solid ${HAIRLINE}`,
            background: 'rgba(255,255,255,0.4)',
            display: 'grid',
            gap: 16,
          }}
        >
          <div
            style={{
              fontFamily: 'ui-monospace, "SF Mono", monospace',
              fontSize: 10,
              letterSpacing: '0.42em',
              color: ACCENT,
              textTransform: 'uppercase',
            }}
          >
            § FILTER · 按技能 / 宇宙翻阅
          </div>

          {topSkills.length > 0 ? (
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
                SKILLS
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Link
                  href={buildHref({ universe })}
                  style={{
                    fontFamily: 'ui-monospace, "SF Mono", monospace',
                    fontSize: 10,
                    letterSpacing: '0.24em',
                    textTransform: 'uppercase',
                    padding: '5px 10px',
                    border: `1px solid ${HAIRLINE}`,
                    background: !skill ? INK : 'transparent',
                    color: !skill ? '#F5F0E8' : INK,
                    textDecoration: 'none',
                  }}
                >
                  全部
                </Link>
                {topSkills.map((s) => (
                  <Link
                    key={s}
                    href={buildHref({ skill: s, universe })}
                    style={{
                      fontFamily: 'ui-monospace, "SF Mono", monospace',
                      fontSize: 10,
                      letterSpacing: '0.24em',
                      textTransform: 'uppercase',
                      padding: '5px 10px',
                      border: `1px solid ${HAIRLINE}`,
                      background: skill === s ? INK : 'transparent',
                      color: skill === s ? '#F5F0E8' : INK,
                      textDecoration: 'none',
                    }}
                  >
                    #{s}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

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
              UNIVERSE
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Link
                href={buildHref({ skill })}
                style={{
                  fontFamily: 'ui-monospace, "SF Mono", monospace',
                  fontSize: 10,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  padding: '5px 10px',
                  border: `1px solid ${HAIRLINE}`,
                  background: !universe ? INK : 'transparent',
                  color: !universe ? '#F5F0E8' : INK,
                  textDecoration: 'none',
                }}
              >
                全部
              </Link>
              {universeOptions.map(([key, label]) => (
                <Link
                  key={key}
                  href={buildHref({ skill, universe: key })}
                  style={{
                    fontFamily: 'ui-monospace, "SF Mono", monospace',
                    fontSize: 10,
                    letterSpacing: '0.24em',
                    textTransform: 'uppercase',
                    padding: '5px 10px',
                    border: `1px solid ${HAIRLINE}`,
                    background: universe === key ? INK : 'transparent',
                    color: universe === key ? '#F5F0E8' : INK,
                    textDecoration: 'none',
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {hasFilter ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                paddingTop: 8,
                borderTop: `1px dotted ${HAIRLINE}`,
              }}
            >
              <span
                style={{
                  fontFamily: 'ui-monospace, "SF Mono", monospace',
                  fontSize: 10,
                  letterSpacing: '0.32em',
                  color: INK_MUTED,
                  textTransform: 'uppercase',
                }}
              >
                共 {total} 张档案 · 第 {page} / {totalPages} 页
              </span>
              <Link
                href={buildHref({})}
                style={{
                  fontFamily: 'ui-monospace, "SF Mono", monospace',
                  fontSize: 10,
                  letterSpacing: '0.32em',
                  color: ACCENT,
                  textTransform: 'uppercase',
                  textDecoration: 'underline',
                  marginLeft: 'auto',
                }}
              >
                ✕ 清空筛选
              </Link>
            </div>
          ) : (
            <div
              style={{
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 10,
                letterSpacing: '0.32em',
                color: INK_MUTED,
                textTransform: 'uppercase',
              }}
            >
              共 {total} 张档案 · 第 {page} / {totalPages} 页
            </div>
          )}
        </section>

        {rows.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              border: `1px dashed ${HAIRLINE}`,
              textAlign: 'center',
              fontStyle: 'italic',
              color: INK_MUTED,
            }}
          >
            {hasFilter ? (
              <>
                这个组合下还没有档案 ——
                <Link href={buildHref({})} style={{ color: ACCENT, marginLeft: 6 }}>
                  清空筛选
                </Link>
                ， 或者
                <Link href={withBasePath('/her-voice/my/')} style={{ color: ACCENT, marginLeft: 6 }}>
                  自己写一张
                </Link>
                。
              </>
            ) : (
              <>
                名录还没有任何在岗档案 ——
                <Link href={withBasePath('/her-voice/my/')} style={{ color: ACCENT, marginLeft: 6 }}>
                  去成为第一个
                </Link>
                。
              </>
            )}
          </div>
        ) : (
          <ul
            className="hv-talent-grid"
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 0,
            }}
          >
            {rows.map((r, idx) => (
              <li
                key={r.id}
                style={{
                  padding: '24px 0 26px',
                  borderTop: idx < 2 ? `1px solid ${INK}` : `1px solid ${HAIRLINE}`,
                  paddingLeft: idx % 2 === 1 ? 24 : 0,
                  paddingRight: idx % 2 === 0 ? 24 : 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 'clamp(22px, 3vw, 28px)',
                      fontStyle: 'italic',
                      lineHeight: 1.1,
                      color: INK,
                      fontWeight: 500,
                    }}
                  >
                    {r.handle}
                  </h2>
                  {r.curation_status === 'spotlighted' ? (
                    <span
                      style={{
                        fontFamily: 'ui-monospace, "SF Mono", monospace',
                        fontSize: 9,
                        letterSpacing: '0.42em',
                        color: ACCENT,
                        textTransform: 'uppercase',
                      }}
                    >
                      ★ SPOTLIGHT
                    </span>
                  ) : null}
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: 16,
                    lineHeight: 1.65,
                    fontStyle: 'italic',
                    color: INK,
                    paddingLeft: 14,
                    borderLeft: `3px solid ${ACCENT}`,
                  }}
                >
                  「{r.pitch}」
                </p>

                {r.skills.length > 0 ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {r.skills.map((s) => (
                      <span
                        key={s}
                        style={{
                          fontFamily: 'ui-monospace, "SF Mono", monospace',
                          fontSize: 10,
                          letterSpacing: '0.24em',
                          color: INK,
                          textTransform: 'uppercase',
                          padding: '5px 10px',
                          border: `1px solid ${HAIRLINE}`,
                        }}
                      >
                        #{s}
                      </span>
                    ))}
                  </div>
                ) : null}

                <dl
                  style={{
                    margin: 0,
                    display: 'grid',
                    gap: 6,
                    paddingTop: 8,
                    borderTop: `1px dotted ${HAIRLINE}`,
                  }}
                >
                  {r.universe ? (
                    <MetaRow
                      k="FROM"
                      v={
                        HERMOSA_UNIVERSE_LABELS[r.universe as keyof typeof HERMOSA_UNIVERSE_LABELS] ??
                        r.universe
                      }
                    />
                  ) : null}
                  {r.contact_note ? <MetaRow k="NOTE" v={r.contact_note} /> : null}
                  <MetaRow
                    k="CONTACT"
                    v={r.contact_email ? '可发起 Whisper（双盲）' : '暂未预留通道'}
                  />
                </dl>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {r.contact_email ? (
                    <WhisperButton talentId={r.id} talentHandle={r.handle} />
                  ) : (
                    <span
                      style={{
                        fontFamily: 'ui-monospace, "SF Mono", monospace',
                        fontSize: 10,
                        letterSpacing: '0.32em',
                        color: INK_MUTED,
                        textTransform: 'uppercase',
                        padding: '12px 0',
                      }}
                    >
                      ◯ 暂不接受 Whisper
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* ── Pagination ────────────────────── */}
        {totalPages > 1 ? (
          <nav
            aria-label="分页"
            style={{
              marginTop: 40,
              display: 'flex',
              gap: 8,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {page > 1 ? (
              <Link
                href={buildHref({ skill, universe, page: page - 1 })}
                style={paginatorBtnStyle}
              >
                ← 上一页
              </Link>
            ) : (
              <span style={{ ...paginatorBtnStyle, color: INK_MUTED, borderColor: HAIRLINE, cursor: 'default' }}>
                ← 上一页
              </span>
            )}
            <span
              style={{
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 11,
                letterSpacing: '0.42em',
                color: INK,
                textTransform: 'uppercase',
                padding: '12px 22px',
              }}
            >
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={buildHref({ skill, universe, page: page + 1 })}
                style={paginatorBtnStyle}
              >
                下一页 →
              </Link>
            ) : (
              <span style={{ ...paginatorBtnStyle, color: INK_MUTED, borderColor: HAIRLINE, cursor: 'default' }}>
                下一页 →
              </span>
            )}
          </nav>
        ) : null}

        <p
          style={{
            marginTop: 56,
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: 10,
            letterSpacing: '0.32em',
            color: INK_MUTED,
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          · 双盲机制：项目方永远不知道她的邮箱，她直接 reply 即可联系到对方 ·
        </p>
      </div>
    </main>
  );
}

function MetaRow({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <dt
        style={{
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 10,
          letterSpacing: '0.32em',
          color: INK_MUTED,
          textTransform: 'uppercase',
          width: 72,
          flexShrink: 0,
        }}
      >
        {k}
      </dt>
      <dd
        style={{
          margin: 0,
          fontSize: 13,
          fontStyle: 'italic',
          color: INK,
          lineHeight: 1.55,
        }}
      >
        {v}
      </dd>
    </div>
  );
}

const paginatorBtnStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, "SF Mono", monospace',
  fontSize: 11,
  letterSpacing: '0.42em',
  color: INK,
  textTransform: 'uppercase',
  textDecoration: 'none',
  padding: '12px 22px',
  border: `1px solid ${INK}`,
  background: 'transparent',
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 44,
};
