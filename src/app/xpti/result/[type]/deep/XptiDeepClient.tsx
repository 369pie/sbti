'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { basePath } from '@/lib/site';
import type { XptiPersonalityType } from '@/lib/xpti/personalities';
import { XPTI_DIMENSIONS } from '@/lib/xpti/dimensions';
import type { DimensionLevel } from '@/lib/xpti/dimensions';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { buildResourceId } from '@/lib/payments/skus';
import { trackFunnelEvent } from '@/lib/analytics/funnel';
import { hashString, pickN, levelToScore } from '@/lib/payments/deep-content';

const display = '"Cormorant Garamond", "Noto Serif SC", serif';
const mono = '"SF Mono", ui-monospace, "Menlo", monospace';

const PAIR_POOL = [
  { archetype: '镜像派', who: '同一类型的另一个你', why: '默契极高，但容易陷入彼此的盲点。' },
  { archetype: '互补派', who: '与你高低维互换的伴侣', why: '一个掌控一个交付，节奏天然咬合。' },
  { archetype: '稳定派', who: '高边界 + 高安全感的人', why: '能承接你的所有情绪起伏，不轻易撤离。' },
  { archetype: '冒险派', who: '高想象 + 低重复偏好的人', why: '把你拉出舒适区，挑战你的脑内剧本。' },
  { archetype: '慢热派', who: '低节奏 + 高感官敏感度的人', why: '愿意陪你把每一段铺垫拉到顶。' },
  { archetype: '边界派', who: '清晰拒绝 + 自给自足的人', why: '逼你练习"想要"和"不要"的明确表达。' },
  { archetype: '镜子派', who: '极度需要被看见的人', why: '让你练习注视，也教你怎么被注视。' },
  { archetype: '直球派', who: '高表达 + 高情感裸露的人', why: '没有猜谜环节——一句"我想要"就直接进场。' },
];

const LANDMINE_POOL = [
  '把脑内剧本当成 ta 已经知道的事——然后责怪 ta 没接住。',
  '冷战时期望 ta 主动来哄，自己却把所有窗口都关死。',
  '只在最暧昧的时刻"裸露"，平时把所有真实自我都收起来。',
  '把"想要"包装成"我是不是太麻烦了"——让 ta 永远在猜。',
  '把每一次失败的亲密都升级为"我是不是被嫌弃"的灾难片。',
  '把 ta 的边界当成"还不够爱我"的证据。',
  '迷恋追逐的过程，但讨厌真正稳定下来后的平淡。',
  '把对方的"还在适应"当成"已经不在意"。',
  '用前任的样子来给 ta 找参考答案。',
  '在最需要表达的时候选择沉默，在最需要沉默的时候选择长篇大论。',
  '把"我有边界"和"我冷淡"混为一谈，反复试探 ta 的耐心。',
  '一遇到"今天不来电"就立刻转向"是不是我哪里不够"。',
  '对快感的描述只有形容词没有动词，让 ta 不知道下一步往哪走。',
  '用"你不懂我"作为每一次撤退的台词。',
  '只在朋友圈把关系经营得很满，私下却几乎不留痕迹。',
  '把每一次释怀又收回，让 ta 永远在安全感的边缘。',
];

const OPENERS_POOL = [
  '今天有件小事，我没法立刻消化，能借你 10 分钟听我说吗？',
  '我刚才看到 ___，突然想到你也会喜欢，所以截下来了。',
  '我们已经很久没有"什么都不做"地待在一起了，本周末试一下？',
  '我有一个很傻的请求——我想被夸今天好看，可以吗？',
  '我最近在想我们的节奏，可以聊一下你最满意 / 最不满意的部分吗？',
  '上次你说的那句 "___" 我一直记得，今天再讲一遍好吗？',
  '我现在想躲一会儿，你不用做任何事，只需要知道我在躲。',
  '如果今晚是一场电影，你希望 BGM 是哪首？',
  '我想对你提一个新尝试，但我先问问你最近的边界在哪。',
  '我今天有点 emo，你愿意陪我安静散步 20 分钟吗？',
  '我想你了，但不是想见你——是想被你发"在干嘛"。',
  '可不可以告诉我，最近哪一刻你觉得"和我在一起真好"？',
  '我有一个秘密幻想，但现在不想立刻告诉你，先给你一周猜的时间。',
  '我们重新选一遍恋爱时的菜单——如果今天是第一次约会，你点什么？',
  '上次冷战是我先主动的，这次轮到你了对不对？我等你。',
  '我对自己最近的状态不满意，能不能借你的眼睛看一下我？',
  '今晚我们各自写一句"最近最想被对方看见的需求"再交换，好吗？',
  '我想要一个不解决问题的拥抱，给我可以吗？',
  '今天我想做主，你愿意把行程交给我半天吗？',
  '我们试一次"24 小时不发文字消息只发语音"，可以吗？',
  '可不可以告诉我，关于我的什么细节你最近在想？',
  '今晚我们各自挑一首歌，听完再决定要不要继续聊正事。',
  '如果我们关系有一句"主题曲歌词"，你觉得是哪一句？',
  '我现在不知道想要什么，但我知道想被你抱一下——可以吗？',
];

interface Props {
  personality: XptiPersonalityType;
}

export function XptiDeepClient({ personality }: Props) {
  const slug = personality.slug;
  const accent = personality.color || '#8B7AD9';
  const resourceId = buildResourceId('xpti', slug);

  useEffect(() => {
    trackFunnelEvent('paywall_view', { module: 'xpti', slug, sku: 'xpti-deep-xp' });
  }, [slug]);

  const dimensionScores = XPTI_DIMENSIONS.map((d) => {
    const level = (personality.profile[d.id] ?? 'M') as DimensionLevel;
    return { id: d.id, name: d.name, level, score: levelToScore(level) };
  });
  const radarPoints = dimensionScores.map((d) => d.score / 3);

  const offset = hashString(slug) % 6;
  const pairs = pickN(PAIR_POOL, slug, 6, 'pair').map((p, i) => ({
    ...p,
    badge: ['梦幻', '可遇', '可碰', '可培养', '小心', '速度过'][i],
    rank: i + 1 + offset,
  }));
  const landmines = pickN(LANDMINE_POOL, slug, 8, 'mine');
  const openers = pickN(OPENERS_POOL, slug, 24, 'opener');

  // Trim long description to first paragraph for the free band.
  const firstPara = personality.description.split('\n').find((l) => l.trim().length > 6) ?? personality.tagline;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 0%, #1f1830 0%, #14101e 60%, #0a0810 100%)',
        color: '#F5F0E8',
        paddingBlock: '64px 96px',
      }}
    >
      {/* ── Hero ── */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <Link
          href={`${basePath}/xpti/result/${slug}/`}
          style={{
            fontFamily: mono,
            fontSize: 11,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: 'rgba(245,240,232,0.55)',
            textDecoration: 'none',
          }}
        >
          ← {personality.name} · 浅档
        </Link>

        <div style={{ fontSize: 56, marginBlock: 24 }}>{personality.emoji}</div>

        <p
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.42em',
            color: '#C9A676',
            margin: 0,
          }}
        >
          XPTI · DEEP XP
        </p>
        <h1
          style={{
            fontFamily: display,
            fontSize: 48,
            fontWeight: 500,
            letterSpacing: '-0.02em',
            margin: '12px 0 8px',
          }}
        >
          {personality.name}
        </h1>
        <p
          style={{
            fontFamily: display,
            fontStyle: 'italic',
            fontSize: 20,
            color: accent,
            margin: 0,
          }}
        >
          {personality.tagline}
        </p>
        <p
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.32em',
            color: '#C9A676',
            marginTop: 16,
          }}
        >
          CODE · {personality.code}
        </p>
      </section>

      {/* ── Free preview ── */}
      <section style={{ maxWidth: 720, margin: '64px auto 0', padding: '0 24px' }}>
        <p
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.32em',
            color: 'rgba(245,240,232,0.45)',
            margin: '0 0 12px',
          }}
        >
          FREE · 浅档摘要
        </p>
        <p
          style={{
            fontFamily: '"Noto Serif SC", serif',
            fontSize: 14,
            lineHeight: 1.95,
            color: 'rgba(245,240,232,0.78)',
            margin: 0,
            whiteSpace: 'pre-line',
          }}
        >
          {firstPara}
        </p>
      </section>

      {/* ── Paywalled deep ── */}
      <section style={{ maxWidth: 720, margin: '48px auto 0', padding: '0 24px' }}>
        <PremiumPaywall
          sku="xpti-deep-xp"
          brand="xpti"
          resourceId={resourceId}
          lockedTitle={`解锁 ${personality.name} · 9 维 XP 深档`}
          teaserBullets={[
            '9 维 XP 雷达 · 印刷级解读',
            '6 类亲密配对推荐 + 8 大雷区',
            '24 个对话开场白 · 拿来就能发',
          ]}
          preview={
            <div style={{ paddingBlock: 20 }}>
              <p
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  letterSpacing: '0.32em',
                  color: '#D4B58A',
                  textAlign: 'center',
                  margin: '0 0 16px',
                }}
              >
                RADAR · 9 AXES
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Radar
                  size={220}
                  points={radarPoints}
                  accent={accent}
                  labels={dimensionScores.map((d) => d.name)}
                  dim
                />
              </div>
              <p
                style={{
                  fontFamily: '"Noto Serif SC", serif',
                  fontSize: 13,
                  lineHeight: 1.9,
                  color: 'rgba(245,240,232,0.6)',
                  textAlign: 'center',
                  marginTop: 18,
                }}
              >
                完整版含每个轴的高/中/低注解、6 类亲密配对、24 个开场白。
              </p>
            </div>
          }
        >
          <div style={{ display: 'grid', gap: 56, paddingBlock: 24 }}>

            <DeepSection eyebrow="RADAR · 9 维 XP 雷达" numeral="I" title="你的亲密形状">
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Radar
                  size={360}
                  points={radarPoints}
                  accent={accent}
                  labels={dimensionScores.map((d) => d.name)}
                />
              </div>
              <ul
                style={{
                  marginTop: 24,
                  padding: 0,
                  listStyle: 'none',
                  display: 'grid',
                  gap: 8,
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                }}
              >
                {dimensionScores.map((d) => (
                  <li
                    key={d.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderBottom: '1px dashed rgba(245,240,232,0.15)',
                      paddingBlock: 6,
                      fontFamily: '"Noto Serif SC", serif',
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: 'rgba(245,240,232,0.78)' }}>{d.name}</span>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 11,
                        letterSpacing: '0.18em',
                        color: accent,
                      }}
                    >
                      {d.level} · {d.score.toFixed(1)}
                    </span>
                  </li>
                ))}
              </ul>
            </DeepSection>

            <DeepSection eyebrow="PAIRINGS · 6 类亲密配对" numeral="II" title="你最对得上谁">
              <div style={{ display: 'grid', gap: 12 }}>
                {pairs.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '16px 18px',
                      borderRadius: 6,
                      border: '1px solid rgba(245,240,232,0.12)',
                      background: 'rgba(245,240,232,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
                      <span
                        style={{
                          fontFamily: mono,
                          fontSize: 10,
                          letterSpacing: '0.32em',
                          color: '#C9A676',
                        }}
                      >
                        {p.badge} · {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: display,
                        fontStyle: 'italic',
                        fontSize: 18,
                        color: 'rgba(245,240,232,0.95)',
                        margin: '0 0 6px',
                      }}
                    >
                      {p.archetype}
                    </p>
                    <p
                      style={{
                        fontFamily: '"Noto Serif SC", serif',
                        fontSize: 13,
                        lineHeight: 1.85,
                        color: 'rgba(245,240,232,0.78)',
                        margin: 0,
                      }}
                    >
                      <strong style={{ color: accent }}>对象画像 · </strong>
                      {p.who}
                      <br />
                      <strong style={{ color: accent }}>为什么对得上 · </strong>
                      {p.why}
                    </p>
                  </div>
                ))}
              </div>
            </DeepSection>

            <DeepSection eyebrow="LANDMINES · 8 大雷区" numeral="III" title="自己最容易踩的坑">
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
                {landmines.map((m, i) => (
                  <li
                    key={i}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 4,
                      border: '1px solid rgba(192,90,120,0.25)',
                      background: 'rgba(192,90,120,0.06)',
                      fontFamily: '"Noto Serif SC", serif',
                      fontSize: 13,
                      lineHeight: 1.8,
                      color: 'rgba(245,240,232,0.78)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 10,
                        letterSpacing: '0.32em',
                        color: '#E89BA8',
                        marginRight: 10,
                      }}
                    >
                      ⚠ {String(i + 1).padStart(2, '0')}
                    </span>
                    {m}
                  </li>
                ))}
              </ul>
            </DeepSection>

            <DeepSection eyebrow="OPENERS · 24 个开场白" numeral="IV" title="拿来就能发的对话起点">
              <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
                {openers.map((o, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '32px 1fr',
                      gap: 12,
                      alignItems: 'baseline',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 10,
                        letterSpacing: '0.24em',
                        color: '#C9A676',
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      style={{
                        fontFamily: display,
                        fontStyle: 'italic',
                        fontSize: 14,
                        lineHeight: 1.85,
                        color: 'rgba(245,240,232,0.86)',
                      }}
                    >
                      “{o}”
                    </span>
                  </li>
                ))}
              </ol>
            </DeepSection>

            <DeepSection
              eyebrow="NEXT · 跨模块深档"
              numeral="V"
              title="测过 XPTI 的人，常常也读完了…"
            >
              <div style={{ display: 'grid', gap: 12 }}>
                <CrossLink
                  href={`${basePath}/cpti/`}
                  eyebrow="CPTI · ¥6.9"
                  title="关系深档 · 8 维雷达"
                  desc="把你的 XP 放回真实的关系坐标里——你们的关系到底是什么型？"
                  toModule="cpti"
                />
                <CrossLink
                  href={`${basePath}/wtfti/galaxy/test/`}
                  eyebrow="WTFTI · ¥6.9"
                  title="主神三联档"
                  desc="主神 + 神侍三位 + 暗面副形——你的人格神格在哪一层。"
                  toModule="wtfti"
                />
                <CrossLink
                  href={`${basePath}/soulti/`}
                  eyebrow="SOULTI · ¥9.9"
                  title="灵魂深镜报告"
                  desc="9 轴交叉解读 + 修复处方 + 灵魂长信。"
                  toModule="soulti"
                />
              </div>
            </DeepSection>
          </div>
        </PremiumPaywall>
      </section>
    </main>
  );
}

// ─── helpers ────────────────────────────────────────────────────────────────

function DeepSection({
  eyebrow,
  numeral,
  title,
  children,
}: {
  eyebrow: string;
  numeral: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 18 }}>
        <span
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.42em',
            color: '#C9A676',
          }}
        >
          {eyebrow}
        </span>
        <span style={{ flex: 1, height: 1, background: 'rgba(201,166,118,0.25)' }} />
        <span
          style={{
            fontFamily: display,
            fontStyle: 'italic',
            fontSize: 13,
            color: 'rgba(201,166,118,0.85)',
          }}
        >
          {numeral}
        </span>
      </div>
      <h2
        style={{
          fontFamily: display,
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: 26,
          letterSpacing: '-0.01em',
          color: 'rgba(245,240,232,0.95)',
          margin: '0 0 20px',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function CrossLink({
  href,
  eyebrow,
  title,
  desc,
  toModule,
}: {
  href: string;
  eyebrow: string;
  title: string;
  desc: string;
  toModule: 'cpti' | 'wtfti' | 'soulti';
}) {
  return (
    <Link
      href={href}
      onClick={() =>
        trackFunnelEvent('cross_module_unlock_click', {
          module: 'xpti',
          fromModule: 'xpti',
          toModule,
          source: 'xpti-deep',
        })
      }
      style={{
        display: 'block',
        textDecoration: 'none',
        padding: '16px 18px',
        borderRadius: 6,
        border: '1px solid rgba(201,166,118,0.25)',
        background: 'rgba(245,240,232,0.04)',
        color: '#F5F0E8',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
        <span
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.32em',
            color: '#C9A676',
          }}
        >
          {eyebrow}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ color: '#C9A676', fontSize: 14 }}>→</span>
      </div>
      <p
        style={{
          fontFamily: display,
          fontStyle: 'italic',
          fontSize: 18,
          margin: '0 0 4px',
          color: 'rgba(245,240,232,0.95)',
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontFamily: '"Noto Serif SC", serif',
          fontSize: 12.5,
          lineHeight: 1.75,
          color: 'rgba(245,240,232,0.65)',
          margin: 0,
        }}
      >
        {desc}
      </p>
    </Link>
  );
}

function Radar({
  size,
  points,
  accent,
  labels,
  dim = false,
}: {
  size: number;
  points: number[];
  accent: string;
  labels: string[];
  dim?: boolean;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 28;
  const n = points.length;
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;

  const polygon = points
    .map((v, i) => {
      const rr = r * v;
      return `${cx + rr * Math.cos(angle(i))},${cy + rr * Math.sin(angle(i))}`;
    })
    .join(' ');

  const grid = [0.25, 0.5, 0.75, 1].map((step) => {
    const pts = Array.from({ length: n }, (_, i) => {
      const rr = r * step;
      return `${cx + rr * Math.cos(angle(i))},${cy + rr * Math.sin(angle(i))}`;
    }).join(' ');
    return <polygon key={step} points={pts} fill="none" stroke="rgba(245,240,232,0.12)" />;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="XP 雷达">
      {grid}
      {points.map((_, i) => {
        const x2 = cx + r * Math.cos(angle(i));
        const y2 = cy + r * Math.sin(angle(i));
        return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="rgba(245,240,232,0.1)" />;
      })}
      <polygon
        points={polygon}
        fill={`${accent}${dim ? '20' : '38'}`}
        stroke={accent}
        strokeWidth={1.5}
      />
      {labels.map((l, i) => {
        const lr = r + 14;
        const lx = cx + lr * Math.cos(angle(i));
        const ly = cy + lr * Math.sin(angle(i));
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            fontSize={size > 280 ? 11 : 9}
            fill="rgba(245,240,232,0.7)"
            fontFamily={mono}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ letterSpacing: '0.06em' }}
          >
            {l}
          </text>
        );
      })}
    </svg>
  );
}
