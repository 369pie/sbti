'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { basePath } from '@/lib/site';
import type { CptiRelationshipType } from '@/lib/cpti/relationships';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { buildResourceId } from '@/lib/payments/skus';
import { trackFunnelEvent } from '@/lib/analytics/funnel';
import { hashString, pickN, pickLevel, levelToScore } from '@/lib/payments/deep-content';

const display = '"Cormorant Garamond", "Noto Serif SC", serif';
const mono = '"SF Mono", ui-monospace, "Menlo", monospace';

// ─── 8 axes (5 base CPTI dims + 3 deep slices) ───────────────────────────────
const AXES = [
  { id: 'power',     label: '主导力' },
  { id: 'express',   label: '表达力' },
  { id: 'conflict',  label: '冲突力' },
  { id: 'care',      label: '付出力' },
  { id: 'fusion',    label: '融合度' },
  { id: 'pace',      label: '节奏同步' },
  { id: 'safety',    label: '安全感存量' },
  { id: 'growth',    label: '共修弹性' },
] as const;

const PRACTICE_POOL = [
  '每周固定 30 分钟「无议程晚饭」——只聊感受，不解决问题。',
  '吵架后 24 小时内必须主动发一条非道歉的关心。',
  '每月一次互写「最近 ta 让我感动的三件小事」。',
  '设立一个共同小账户，每月各存 100 元，用来吃一顿好的。',
  '把对方家人的生日存进自己手机日历。',
  '一起选一首"年度主题曲"，分手前不准换。',
  '每季度一次「关系复盘」，回答三个问题：哪里好 / 哪里累 / 想变什么。',
  '买两本一样的书，约定一个月内各自读完，再一起聊。',
  '约定一个手势作为安全词，见到立刻暂停争吵。',
  '一起做一次新菜，过程不准吵架——失败也算成功。',
  '互相写一段「最希望对方做的微小改变」并贴在冰箱上。',
  '每月一次散步约会，不准带手机，只走路说话。',
  '把对方说过的最暖一句话存成手机备忘录，难过时翻一翻。',
  '约定每年一次「重新表白日」——纪念日次月那天再说一次喜欢的理由。',
  '出差或异地时每天发一张「随手拍」，不必解释。',
  '一起报名一项 6 周课程：陶艺 / 瑜伽 / 拳击都行。',
  '把对方的疲劳 / 焦虑信号写下来，并约好对应的"求助信号"。',
  '每月给对方一次完整的「无干扰周末半天」，对方做什么都不评价。',
  '做一份「ta 喜欢的礼物清单」，平时偷偷收集。',
  '约定一个共同基金存款目标，达成后一起去做一件想做很久的事。',
  '一起拍一张构图认真的合照，每年同一构图复刻一次。',
  '建立"情绪温度"短信制度——晴 / 阴 / 雨 / 雷暴 四档报告。',
  '互相教对方一个自己擅长的小技能。',
  '约定每月有一天是「对方做主日」，行程全部听 ta 安排。',
  '用语音备忘录给对方录一段「希望 ta 在某种情境时听到」的话。',
  '每年生日给彼此写一封手写信，不许电子稿。',
  '一起做一次匿名公益捐款，金额各承担一半。',
  '每周抽一晚不刷短视频，一起读同一本书。',
  '约定一句"暂停咒语"，说出后两人都要至少冷静 10 分钟。',
  '为彼此做一份「危机预案」：emo 时希望对方做什么、不做什么。',
  '一起种一盆植物，名字由两人共同决定。',
  '建立一个共享相册，互相往里面丢日常碎片。',
  '每月有一晚做对方家务清单上的一项任务。',
  '一起办一场只邀请 5 个朋友的小型聚会，提前一起设计菜单。',
  '约定每周日晚上互发一条「新一周想被对方看见的需求」。',
];

const LANDMINE_POOL = [
  '把"我没事"当默认台词，等对方猜——猜不中再爆。',
  '吵架时升级到对方的过往伤痕，事后又用"开玩笑"敷衍。',
  '因为讨厌冲突而长期回避表达，攒到某次小事一次性爆发。',
  '在朋友面前损对方"一两句"，回家又生气对方不理解你只是开玩笑。',
  '把所有不满都往「对方原生家庭」上贴标签。',
  '用沉默当惩罚，时长超过 24 小时。',
  '把对方的一次失败永远记在小本本上，每次吵架翻一次。',
  '主动暴露伴侣的隐私给共同朋友圈做谈资。',
  '把和前任的甜蜜瞬间用来敲打现在的人。',
  '每次冲突都以"分手 / 离婚 / 散伙"威胁。',
  '把对方对你好当理所当然，对外人却赞美 ta 的优点。',
  '在对方累了的时候硬要"立刻把话讲清楚"。',
  '用对方的工作 / 收入 / 体型 当吵架武器。',
  '把家务分配做成绩效记录表，时不时拿出来对账。',
  '约会迟到从不真诚道歉，永远把锅推给路况。',
  '在心情差时强行让对方来"接住"自己的情绪，全部吸收。',
];

const MONTH_THEMES = [
  '一月 · 仪式重启',
  '二月 · 重提爱意',
  '三月 · 共修一项新技能',
  '四月 · 互写感谢清单',
  '五月 · 旅行 / 短途出走',
  '六月 · 边界对齐',
  '七月 · 共同财务 check-in',
  '八月 · 各自独处一天',
  '九月 · 复盘上半年',
  '十月 · 朋友圈共建',
  '十一月 · 健康 / 体能合修',
  '十二月 · 写下一年关系清单',
];

interface Props {
  relationship: CptiRelationshipType;
  tierInfo: { label: string; color: string; bgColor: string };
}

export function CptiDeepClient({ relationship, tierInfo }: Props) {
  const slug = relationship.slug;
  const resourceId = buildResourceId('cpti', slug);

  useEffect(() => {
    trackFunnelEvent('paywall_view', { module: 'cpti', slug, sku: 'cpti-deep-relationship' });
  }, [slug]);

  // Deterministic radar values per relationship slug.
  const radarLevels = AXES.map((a) => pickLevel(slug, a.id));
  const radarPoints = AXES.map((_, i) => {
    const level = radarLevels[i];
    return levelToScore(level) / 3;
  });

  // Deterministic content selections.
  const practices = pickN(PRACTICE_POOL, slug, 30, 'practice');
  const landmines = pickN(LANDMINE_POOL, slug, 8, 'landmine');
  const monthOffset = hashString(slug) % 12;
  const themes = MONTH_THEMES.map((_, i) => MONTH_THEMES[(i + monthOffset) % 12]);

  const accent = relationship.color || '#B85A78';

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 0%, #2a1a26 0%, #1a1018 60%, #0f0a12 100%)',
        color: '#F5F0E8',
        paddingBlock: '64px 96px',
      }}
    >
      {/* ── Hero ── */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <Link
          href={`${basePath}/cpti/relationship/${slug}/`}
          style={{
            fontFamily: mono,
            fontSize: 11,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: 'rgba(245,240,232,0.55)',
            textDecoration: 'none',
          }}
        >
          ← {relationship.name} · 浅档
        </Link>

        <div style={{ fontSize: 56, marginBlock: 24 }}>{relationship.emoji}</div>

        <p
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.42em',
            color: '#C9A676',
            margin: 0,
          }}
        >
          CPTI · DEEP RELATIONSHIP
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
          {relationship.name}
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
          {relationship.tagline}
        </p>

        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center', gap: 8 }}>
          <span
            style={{
              fontFamily: mono,
              fontSize: 10,
              letterSpacing: '0.24em',
              padding: '4px 10px',
              borderRadius: 999,
              border: `1px solid ${tierInfo.color}50`,
              color: tierInfo.color,
              background: tierInfo.bgColor,
            }}
          >
            {tierInfo.label}
          </span>
          <span
            style={{
              fontFamily: mono,
              fontSize: 10,
              letterSpacing: '0.24em',
              padding: '4px 10px',
              borderRadius: 999,
              border: '1px solid rgba(201,166,118,0.35)',
              color: '#C9A676',
            }}
          >
            CODE · {relationship.code}
          </span>
        </div>
      </section>

      {/* ── Free preview band ── */}
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
          {relationship.description}
        </p>
      </section>

      {/* ── Paywalled deep content ── */}
      <section style={{ maxWidth: 720, margin: '48px auto 0', padding: '0 24px' }}>
        <PremiumPaywall
          sku="cpti-deep-relationship"
          brand="cpti"
          resourceId={resourceId}
          lockedTitle={`解锁 ${relationship.name} · 8 维关系深档`}
          teaserBullets={[
            '8 维关系雷达 · 主导力 / 表达力 / 冲突力 / 付出力 / 融合度 + 3 深度切片',
            '30 条共修建议 · 拿来即用的关系任务清单',
            '12 月共修主题 + 8 大雷区清单',
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
                RADAR · 8 AXES
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Radar size={220} points={radarPoints} accent={accent} labels={AXES.map((a) => a.label)} dim />
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
                完整版含每个轴的解读、30 条共修建议、12 月主题、8 大雷区。
              </p>
            </div>
          }
        >
          <div style={{ display: 'grid', gap: 56, paddingBlock: 24 }}>

            <DeepSection eyebrow="RADAR · 8 维关系雷达" numeral="I" title="你们关系的形状">
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Radar size={360} points={radarPoints} accent={accent} labels={AXES.map((a) => a.label)} />
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
                {AXES.map((a, i) => (
                  <li
                    key={a.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderBottom: '1px dashed rgba(245,240,232,0.15)',
                      paddingBlock: 6,
                      fontFamily: '"Noto Serif SC", serif',
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: 'rgba(245,240,232,0.78)' }}>{a.label}</span>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 11,
                        letterSpacing: '0.18em',
                        color: accent,
                      }}
                    >
                      {radarLevels[i]} · {(radarPoints[i] * 3).toFixed(1)}
                    </span>
                  </li>
                ))}
              </ul>
            </DeepSection>

            <DeepSection eyebrow="PRACTICE · 30 条共修建议" numeral="II" title="拿来就能做的关系小任务">
              <ol
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  display: 'grid',
                  gap: 12,
                }}
              >
                {practices.map((p, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '36px 1fr',
                      gap: 12,
                      alignItems: 'baseline',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 11,
                        letterSpacing: '0.24em',
                        color: '#C9A676',
                        opacity: 0.9,
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      style={{
                        fontFamily: '"Noto Serif SC", serif',
                        fontSize: 13.5,
                        lineHeight: 1.85,
                        color: 'rgba(245,240,232,0.82)',
                      }}
                    >
                      {p}
                    </span>
                  </li>
                ))}
              </ol>
            </DeepSection>

            <DeepSection eyebrow="THEMES · 12 月共修主题" numeral="III" title="一年的关系节气">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 10,
                }}
              >
                {themes.map((t, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 4,
                      border: '1px solid rgba(245,240,232,0.12)',
                      background: 'rgba(245,240,232,0.04)',
                      fontFamily: display,
                      fontStyle: 'italic',
                      fontSize: 14,
                      color: 'rgba(245,240,232,0.86)',
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </DeepSection>

            <DeepSection eyebrow="LANDMINES · 8 大雷区" numeral="IV" title="千万别踩的关系陷阱">
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

            <DeepSection
              eyebrow="NEXT · 跨模块深档"
              numeral="V"
              title="完成 CPTI 关系深档的人，常常也读完了…"
            >
              <div style={{ display: 'grid', gap: 12 }}>
                <CrossLink
                  href={`${basePath}/wtfti/galaxy/test/`}
                  eyebrow="WTFTI · ¥6.9"
                  title="个人主神档案"
                  desc="拿到你自己的主神 + 神龛 + 月相日课，再回头看你们之间的化学反应。"
                  fromModule="cpti"
                  toModule="wtfti"
                />
                <CrossLink
                  href={`${basePath}/soulti/`}
                  eyebrow="SOULTI · ¥9.9"
                  title="灵魂深镜报告"
                  desc="9 轴交叉解读 + 修复处方 + 灵魂长信。安静地看见自己。"
                  fromModule="cpti"
                  toModule="soulti"
                />
                <CrossLink
                  href={`${basePath}/xpti/`}
                  eyebrow="XPTI · ¥4.9"
                  title="亲密偏好深析"
                  desc="9 维 XP 雷达 + 6 类亲密配对 + 雷区清单 + 24 个对话开场白。"
                  fromModule="cpti"
                  toModule="xpti"
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
  fromModule,
  toModule,
}: {
  href: string;
  eyebrow: string;
  title: string;
  desc: string;
  fromModule: 'cpti';
  toModule: 'wtfti' | 'soulti' | 'xpti';
}) {
  return (
    <Link
      href={href}
      onClick={() =>
        trackFunnelEvent('cross_module_unlock_click', {
          module: fromModule,
          fromModule,
          toModule,
          source: 'cpti-deep',
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
        transition: 'background 0.2s',
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

/** Lightweight inline radar — N evenly-spaced axes, 0–1 normalised values. */
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
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="关系雷达">
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
