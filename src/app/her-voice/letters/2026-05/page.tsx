import type { Metadata } from 'next';
import Link from 'next/link';
import { withBasePath } from '@/lib/site';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
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
} from '../../_editorial-styles';
import { PillarBreadcrumb } from '@/components/PillarBreadcrumb';

// W5 · E5.1 · 「她的月报」第一号
// 5 月号：HER AURORA 第三层「沉淀」首发。
// 长页 + 浏览器打印导出 PDF（@media print 在 _editorial-styles 已具）

export const metadata: Metadata = {
  title: '极光来信 · MMXXVI · 五月号 — HER AURORA',
  description:
    '七句最高共鸣留言 · 编辑部主笔 · 三联月相 × 三命格 × 三段叙事 — 5 月号「她的月报」白皮书。',
  alternates: { canonical: '/her-voice/letters/2026-05/' },
  robots: { index: true, follow: true },
};

export const dynamic = 'force-dynamic';
export const revalidate = 600;

interface VoiceRow {
  id: string;
  text: string;
  signature: string | null;
  echo_count: number;
  universe: string;
  created_at: string;
}

interface AtlasIndexRow {
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
}

async function fetchTopEchoes(): Promise<VoiceRow[]> {
  try {
    const admin = createAdminSupabaseClient();
    const { data } = await admin
      .from('hermosa_messages')
      .select('id,text,signature,echo_count,universe,created_at')
      .eq('is_published', true)
      .eq('flagged', false)
      .gte('created_at', '2026-05-01T00:00:00Z')
      .lt('created_at', '2026-06-01T00:00:00Z')
      .order('echo_count', { ascending: false })
      .limit(7);
    return (data ?? []) as VoiceRow[];
  } catch {
    return [];
  }
}

// HER AURORA · W5 · E-N8 · 本月新增「极光星图」目录
// 按发布期号筛选；没有则走静态退隐（没有社广列表 ≠ 没有内容）。
async function fetchAtlasMay(): Promise<AtlasIndexRow[]> {
  try {
    const admin = createAdminSupabaseClient();
    const { data } = await admin
      .from('atlas_submissions')
      .select('slug,title,excerpt,published_at')
      .eq('status', 'published')
      .or('publish_issue.eq.2026-05,published_at.gte.2026-05-01T00:00:00Z')
      .lte('published_at', '2026-06-01T00:00:00Z')
      .not('slug', 'is', null)
      .order('published_at', { ascending: false })
      .limit(8);
    return ((data ?? []) as AtlasIndexRow[]).filter((r) => r.slug);
  } catch {
    return [];
  }
}

// 三联月相 × 三命格 × 三段叙事
// 不接引擎；编辑部预设的开场结构（v0：可手维护，未来 E5.3 工具栈接入后改为生成）
const TRIPTYCH = [
  {
    moon: '初月 · 朔',
    star: '紫微 · 太阴',
    arc: '撤回的话',
    body: '五月的第一周，她在朋友圈写了三遍又删掉。月亮还没有亮，话也没有说出口——但她记得自己想说的样子。',
  },
  {
    moon: '上弦 · 望前',
    star: '紫微 · 天同',
    arc: '妈妈那一代',
    body: '中旬的某个深夜，她翻到妈妈年轻时的照片，第一次发现两人的眉骨长得很像。她没有打电话过去，但她在沙龙里写了一句：「我开始想你了，妈妈。」',
  },
  {
    moon: '满月 · 望',
    star: '紫微 · 七杀',
    arc: '我决定不再解释',
    body: '月底的满月夜，她做了一个安静的决定：不再向不理解她的人解释自己。她说这不是冷漠，是终于愿意把力气留给自己的女孩。',
  },
];

export default async function MayLetterPage() {
  const voices = await fetchTopEchoes();
  const atlas = await fetchAtlasMay();

  return (
    <>
      <PillarBreadcrumb pillar="III" label="HER AURORA · 极光来信 · 五月号" hint="极光来信 · MMXXVI · 五月号" />
      <main className="hv-page" style={pageStyle}>
        <HerVoiceMobileStyles />
        <div style={{ ...shellStyle, maxWidth: 760 }}>
          <div style={datelineStyle}>
            <span>HER AURORA · LETTERS · N° 001 · MAY MMXXVI</span>
            <span className="hv-dateline-r">暮光博物笔记 · 编辑部</span>
          </div>
          <div style={datelineRuleStyle} />

          <header style={{ marginBottom: 56 }}>
            <div style={eyebrowStyle}>§ HER AURORA · 极光来信 · 五月</div>
            <h1 style={titleStyle}>
              她说，
              <br />
              <span style={{ color: ACCENT }}>五月听起来是这样的</span>。
            </h1>
            <div style={accentRuleStyle} />
            <p style={ledeStyle}>
              这是 <em>HER AURORA</em> 的第一份极光来信。
              不是数据看板、不是产品周报——是把这个月在沙龙里被回响最多的句子，
              和我们在编辑部听见的回声，一并装进同一封信。
            </p>
            <p style={ledeStyle}>
              想保存？浏览器选择「打印 → 另存为 PDF」即可。
              我们刻意不做按钮——这封信值得你慢一点。
            </p>
          </header>

          {/* 第 I 章 · 七句 */}
          <section style={{ marginTop: 64 }}>
            <ChapterHeading roman="I" label="七句被回响最多的话" />
            {voices.length === 0 ? (
              <p
                style={{
                  fontStyle: 'italic',
                  color: INK_MUTED,
                  fontSize: 16,
                  lineHeight: 1.8,
                }}
              >
                五月还没有足够多的回声——
                <Link href={withBasePath('/her-voice/')} style={{ color: ACCENT }}>
                  到沙龙里写下你的第一句
                </Link>
                ，下个月，可能就是你的句子被收录进来。
              </p>
            ) : (
              <ol
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                  counterReset: 'voice',
                }}
              >
                {voices.map((v, i) => (
                  <li
                    key={v.id}
                    style={{
                      padding: '24px 0',
                      borderTop: i === 0 ? `1px solid ${INK}` : `1px dotted ${HAIRLINE}`,
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr auto',
                      gap: 16,
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
                      {String(i + 1).padStart(2, '0')}
                    </span>
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
                      <div
                        style={{
                          marginTop: 8,
                          fontFamily: 'ui-monospace, "SF Mono", monospace',
                          fontSize: 10,
                          letterSpacing: '0.28em',
                          color: INK_MUTED,
                          fontStyle: 'normal',
                          textTransform: 'uppercase',
                        }}
                      >
                        — {v.signature || 'Anonymous'} · {v.echo_count} echoes
                      </div>
                    </div>
                    <div />
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* 第 II 章 · 编辑部主笔 */}
          <section style={{ marginTop: 80 }}>
            <ChapterHeading roman="II" label="编辑部主笔 · 600 字" />
            <article
              style={{
                fontSize: 17,
                lineHeight: 1.95,
                color: INK,
                fontFamily: 'var(--font-display)',
              }}
            >
              <p style={{ marginTop: 0 }}>
                我们盯着这一个月在沙龙里被回响的句子看，发现一件意料之外的事：
                <em> 五月的女孩们，几乎没有一句是在「问答」</em>。她们不在追问命运、不在比较谁过得好，
                也很少 hashtag 一个具体的人。她们在写一些更小、更近的东西——
                晚饭后没洗的碗、与妈妈通话之后的沉默、那条想发又删的朋友圈。
              </p>
              <p>
                这让我们想起一种古老的写作姿势：日记。
                日记不需要被理解，也不必被点赞——只需要在纸上把那一个时刻按住，让它不再四处游荡。
                <em> HER AURORA 在这个月，更像一本被很多个女孩共同写下的日记</em>。
              </p>
              <p>
                所以这份月报，没有「TOP10 增长榜」，也没有「本月话题趋势」。
                只有一句一句写下来的、被另外的女孩们点亮过的句子。如果你在其中读到了自己——
                不要惊讶，那并不是因为你被算法识别了，而是因为你不是一个人。
              </p>
              <p>
                六月我们会做的两件事：
                <br />
                <span style={{ color: ACCENT, fontStyle: 'normal' }}>① </span>
                在沙龙里加入「同声者」入口，让你看到曾和你一起被回响的那几个匿名身影；
                <br />
                <span style={{ color: ACCENT, fontStyle: 'normal' }}>② </span>
                上线第一批「她词条」——把这些句子，慢慢写成一本属于女孩们的小百科。
              </p>
              <p style={{ marginBottom: 0 }}>
                不催你看完，也不要求你转发。这份信只是想被你收下。
              </p>
            </article>
          </section>

          {/* 第 III 章 · 三联月相 × 三命格 × 三段叙事 */}
          <section style={{ marginTop: 80 }}>
            <ChapterHeading roman="III" label="三联月相 × 三命格 × 三段叙事" />
            <div
              style={{
                display: 'grid',
                gap: 24,
                gridTemplateColumns: '1fr',
                marginTop: 24,
              }}
              className="hv-triptych"
            >
              {TRIPTYCH.map((t, i) => (
                <div
                  key={i}
                  style={{
                    padding: '24px 22px',
                    border: `1px solid ${HAIRLINE}`,
                    background: 'rgba(192, 81, 47, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'ui-monospace, "SF Mono", monospace',
                      fontSize: 10,
                      letterSpacing: '0.32em',
                      color: ACCENT,
                      textTransform: 'uppercase',
                    }}
                  >
                    {['I', 'II', 'III'][i]} · {t.moon}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontStyle: 'italic',
                      fontSize: 22,
                      lineHeight: 1.4,
                      color: INK,
                    }}
                  >
                    {t.arc}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: '0.28em',
                      color: INK_MUTED,
                      fontFamily: 'ui-monospace, "SF Mono", monospace',
                      textTransform: 'uppercase',
                    }}
                  >
                    {t.star}
                  </div>
                  <p
                    style={{
                      fontSize: 15,
                      lineHeight: 1.85,
                      color: INK,
                      margin: 0,
                      opacity: 0.86,
                    }}
                  >
                    {t.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 第 IV 章 · 本月新增「极光星图」目录 · E-N8 */}
          <section style={{ marginTop: 80 }}>
            <ChapterHeading roman="IV" label="本月新增「极光星图」词条" />
            {atlas.length === 0 ? (
              <p
                style={{
                  fontStyle: 'italic',
                  color: INK_MUTED,
                  fontSize: 16,
                  lineHeight: 1.8,
                  margin: 0,
                }}
              >
                五月的守光人仍在凝词中。首批「极光星图」词条为邀请制试点，发布后会都在这里出现。你可以先到 <Link href={withBasePath('/her-voice/atlas/')} style={{ color: ACCENT }}>§ 星图首页</Link> 看看已公开的词条。
              </p>
            ) : (
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {atlas.map((a, i) => (
                  <li
                    key={a.slug}
                    style={{
                      padding: '20px 0',
                      borderTop: i === 0 ? `1px solid ${INK}` : `1px dotted ${HAIRLINE}`,
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr',
                      gap: 16,
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
                      ✣ {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <Link
                        href={withBasePath(`/her-voice/atlas/${a.slug}/`)}
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontStyle: 'italic',
                          fontSize: 22,
                          lineHeight: 1.35,
                          color: INK,
                          textDecoration: 'none',
                          borderBottom: `1px solid ${ACCENT}`,
                          paddingBottom: 2,
                        }}
                      >
                        {a.title}
                      </Link>
                      {a.excerpt ? (
                        <p
                          style={{
                            marginTop: 8,
                            marginBottom: 0,
                            fontSize: 14,
                            lineHeight: 1.75,
                            color: INK_MUTED,
                            fontStyle: 'italic',
                          }}
                        >
                          {a.excerpt}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Footer · 邀请 */}
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
              § COLOPHON · 编辑部留白
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 18 }}>
              {/* HER AURORA · W5 · E-N8 · 守光人金箔印章 (Aurora Halo Seal) */}
              <KeeperHaloSeal />
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: INK,
                }}
              >
                守光人 · ARIA
                <div style={{ fontSize: 11, letterSpacing: '0.28em', color: INK_MUTED, fontStyle: 'normal', fontFamily: 'ui-monospace, "SF Mono", monospace', marginTop: 4, textTransform: 'uppercase' }}>
                  AURORA KEEPER · N° 001
                </div>
              </div>
            </div>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.85,
                color: INK_MUTED,
                fontStyle: 'italic',
                fontFamily: 'var(--font-display)',
                margin: 0,
              }}
            >
              这份极光来信的句子，全部来自 5 月在 HER AURORA 点亮、并允许公开的女孩们。
              我们没有改字，没有润色——只是把它们按回声次数排好。
              署名不是用户名，是她们自己写下的「想被这样称呼的样子」。
              下一封信在 6 月底寄出。
            </p>
            <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
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
              <Link
                href={withBasePath('/her-voice/we-heard-you/')}
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
                看「我们听见了」公开看板 →
              </Link>
            </div>
          </footer>
        </div>

        <style>{`
          @media (min-width: 720px) {
            .hv-triptych { grid-template-columns: repeat(3, 1fr) !important; }
          }
          @media print {
            .hv-page { padding: 0 !important; background: #fff !important; }
            a { color: #1a1530 !important; text-decoration: none !important; }
            nav { display: none !important; }
          }
        `}</style>
      </main>
    </>
  );
}

// HER AURORA · W5 · E-N8 · 守光人金箔印章
// 极光环形 + 罗马 I 中心 + 金箔色 → 体现"她被守光人挂念过"的归档感。
function KeeperHaloSeal() {
  const GOLD = '#C9A676';
  const ROSE = 'rgba(192, 81, 47, 0.55)';
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden focusable="false">
      <defs>
        <radialGradient id="aurora-seal-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={GOLD} stopOpacity="0.35" />
          <stop offset="60%" stopColor={GOLD} stopOpacity="0.08" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="28" cy="28" r="26" fill="url(#aurora-seal-glow)" />
      <circle cx="28" cy="28" r="22" fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.85" />
      <ellipse cx="28" cy="28" rx="22" ry="9" fill="none" stroke={GOLD} strokeWidth="0.6" opacity="0.6" transform="rotate(-18 28 28)" />
      <ellipse cx="28" cy="28" rx="20" ry="7" fill="none" stroke={ROSE} strokeWidth="0.5" opacity="0.5" transform="rotate(22 28 28)" />
      <text
        x="28"
        y="32"
        textAnchor="middle"
        fontFamily="'Cormorant Garamond', 'Noto Serif SC', serif"
        fontStyle="italic"
        fontSize="14"
        fill={GOLD}
        opacity="0.95"
      >
        I
      </text>
      <circle cx="28" cy="28" r="0.9" fill={GOLD} />
    </svg>
  );
}

function ChapterHeading({ roman, label }: { roman: string; label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 16,
        marginBottom: 28,
        paddingBottom: 12,
        borderBottom: `1px solid ${INK}`,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 32,
          color: ACCENT,
          lineHeight: 1,
        }}
      >
        {roman}
      </span>
      <span
        style={{
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 11,
          letterSpacing: '0.42em',
          color: INK,
          textTransform: 'uppercase',
        }}
      >
        § {label}
      </span>
    </div>
  );
}
