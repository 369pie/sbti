'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMystiTheme } from '@/components/MystiThemeProvider';
import { MystiPaywall } from '@/components/MystiPaywall';
import {
  MOOD_OPTIONS,
  getMoodEntriesForMonth,
  currentMonthKey,
  type MoodEntry,
  type MoodId,
} from '@/lib/mysti/mood';
import { getDualArchive, type DualPairRecord } from '@/lib/mysti/dual-archive';
import { getCollectionByUniverse } from '@/lib/mysti/collection';

function fmtMonth(yyyymm: string): string {
  const [y, m] = yyyymm.split('-');
  return `${y} 年 ${parseInt(m, 10)} 月`;
}

export function MystiMonthlyContent() {
  const { theme } = useMystiTheme();
  const [hydrated, setHydrated] = useState(false);
  const [yyyymm, setYyyymm] = useState<string>(() => currentMonthKey());
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [pairs, setPairs] = useState<DualPairRecord[]>([]);
  const [collected, setCollected] = useState<string[]>([]);

  useEffect(() => {
    setMoods(getMoodEntriesForMonth(yyyymm));
    setPairs(
      getDualArchive().filter(p => {
        const d = new Date(p.recordedAt);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === yyyymm;
      }),
    );
    setCollected(getCollectionByUniverse('mysti'));
    setHydrated(true);
  }, [yyyymm]);

  const dominantMood = useMemo(() => {
    if (moods.length === 0) return null;
    const counts: Record<string, number> = {};
    for (const e of moods) counts[e.mood] = (counts[e.mood] ?? 0) + 1;
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return MOOD_OPTIONS.find(o => o.id === (top[0] as MoodId)) ?? null;
  }, [moods]);

  const previousMonth = useMemo(() => {
    const [y, m] = yyyymm.split('-').map(Number);
    const d = new Date(y, m - 2, 1); // m-1 当前月，再 -1
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, [yyyymm]);

  return (
    <div
      className="min-h-screen px-5 py-12"
      style={{
        background: `linear-gradient(180deg, ${theme.bgGradient[0]} 0%, ${theme.bgGradient[1]} 100%)`,
        color: theme.text,
      }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link
            href="/mysti/"
            className="text-xs tracking-[0.18em] uppercase opacity-70 hover:opacity-100"
            style={{ color: theme.textMuted }}
          >
            ← 灵鉴首页
          </Link>
          <h1
            className="mt-3 text-3xl sm:text-4xl"
            style={{ color: theme.text, fontFamily: 'var(--font-display)' }}
          >
            灵魂月报
          </h1>
          <p className="mt-3 text-sm" style={{ color: theme.textMuted }}>
            {fmtMonth(yyyymm)}
          </p>

          <div className="mt-4 inline-flex items-center gap-2 text-xs">
            <button
              onClick={() => setYyyymm(previousMonth)}
              className="px-3 py-1 rounded-full border"
              style={{ borderColor: theme.divider, color: theme.textMuted }}
            >
              ← 上月
            </button>
            <button
              onClick={() => setYyyymm(currentMonthKey())}
              className="px-3 py-1 rounded-full border"
              style={{
                borderColor: theme.accent,
                color: theme.accent,
                background: theme.accentSoft,
              }}
            >
              本月
            </button>
          </div>
        </div>

        {!hydrated ? null : (
          <>
            {/* 免费摘要（前 30%） */}
            <section
              className="rounded-2xl border p-6 mb-6"
              style={{
                background: `${theme.cardSurface}aa`,
                borderColor: theme.cardBorder,
              }}
            >
              <div className="text-xs tracking-[0.16em] uppercase mb-4" style={{ color: theme.accent }}>
                本月概览（免费）
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <Stat label="心情打卡" value={moods.length} unit="天" theme={theme} />
                <Stat label="灵魂合盘" value={pairs.length} unit="次" theme={theme} />
                <Stat label="已收集人格" value={collected.length} unit="型" theme={theme} />
              </div>

              {dominantMood && (
                <div
                  className="mt-6 rounded-xl p-4 flex items-center gap-3"
                  style={{ background: theme.accentSoft, border: `1px solid ${theme.cardBorder}` }}
                >
                  <span className="text-3xl">{dominantMood.emoji}</span>
                  <div className="text-sm">
                    <div style={{ color: theme.text }}>本月主旋律：{dominantMood.label}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: theme.textMuted }}>
                      整体走向：{dominantMood.tone}
                    </div>
                  </div>
                </div>
              )}

              {moods.length === 0 && (
                <p className="mt-5 text-xs text-center" style={{ color: theme.textSubtle }}>
                  本月还没记过心情，去
                  <Link href="/mysti/mood/" className="mx-1 underline" style={{ color: theme.accent }}>
                    今日心情
                  </Link>
                  打卡试试 ✦
                </p>
              )}
            </section>

            {/* 付费深度 */}
            <MystiPaywall
              sku="monthly-report"
              resourceId={yyyymm}
              lockedTitle={`${fmtMonth(yyyymm)} 灵魂月报 · 深度版`}
              preview={
                <div className="text-sm leading-7" style={{ color: theme.text }}>
                  <h3 className="text-base mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                    一、本月灵魂主线
                  </h3>
                  <p className="mb-3" style={{ color: theme.textMuted }}>
                    你的能量在月初像潮水般展开，到中旬出现明显回落，月末重新积聚……
                    （完整 5 章节包含：主线/Shadow/关系/牌阵走向/下月预言）
                  </p>
                  <h3 className="text-base mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                    二、关系网络的隐线
                  </h3>
                  <p style={{ color: theme.textMuted }}>
                    这个月你触发了 X 段合盘，TA 们集中聚集在「天作之合」与「破茧之力」两个原型……
                  </p>
                </div>
              }
            >
              <article
                className="rounded-2xl border p-6 space-y-5 text-sm leading-7"
                style={{
                  background: `${theme.cardSurface}aa`,
                  borderColor: theme.cardBorder,
                  color: theme.text,
                }}
              >
                <header>
                  <div
                    className="text-[11px] tracking-[0.18em] uppercase"
                    style={{ color: theme.accent }}
                  >
                    {fmtMonth(yyyymm)} · 灵魂月报
                  </div>
                  <h2
                    className="mt-2 text-2xl"
                    style={{ color: theme.text, fontFamily: 'var(--font-display)' }}
                  >
                    本月你的灵魂走过了哪些路口
                  </h2>
                </header>

                <Section title="一、主线 · 你这个月在做什么" theme={theme}>
                  <p>
                    根据你 <strong>{moods.length}</strong> 次心情打卡，本月主旋律是
                    <strong className="mx-1" style={{ color: theme.accent }}>
                      {dominantMood?.label ?? '尚未成型'}
                    </strong>
                    。说明你正在把能量投放到一个尚未有结果的领域——这种状态需要被允许。
                  </p>
                </Section>

                <Section title="二、Shadow · 那些没说出口的部分" theme={theme}>
                  <p>
                    Shadow 牌的暗示在本月反复出现。当你打卡「
                    {MOOD_OPTIONS.find(o => o.id === 'shadow')?.label}」或「
                    {MOOD_OPTIONS.find(o => o.id === 'mist')?.label}」时，往往伴随了对自我表达的回避。
                  </p>
                </Section>

                <Section title="三、关系网络 · 谁在拉你向上谁在向下" theme={theme}>
                  <p>
                    本月你触发了 <strong>{pairs.length}</strong> 段合盘，按关系原型聚类后，前两名是：
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    {topArchetypes(pairs).map(([name, n]) => (
                      <li key={name}>
                        {name}：{n} 段
                      </li>
                    ))}
                    {pairs.length === 0 && <li>本月没有合盘记录</li>}
                  </ul>
                </Section>

                <Section title="四、人格图谱 · 你正在收集的形状" theme={theme}>
                  <p>
                    截至本月你已收集 <strong>{collected.length}</strong> 型人格，进度{' '}
                    <strong style={{ color: theme.accent }}>
                      {Math.round((collected.length / 30) * 100)}%
                    </strong>
                    （以 30 型为一轮）。继续完成新人格触发会进一步丰富你的「关系镜像」。
                  </p>
                </Section>

                <Section title="五、下月预言 · 一段神谕" theme={theme}>
                  <p className="italic" style={{ color: theme.accent }}>
                    “你下个月会被一个陌生人提醒——你已经准备好走进一个，连你自己都没意识到正在打开的房间。”
                  </p>
                </Section>

                <footer className="pt-4 border-t" style={{ borderColor: theme.divider }}>
                  <Link
                    href="/mysti/mood/"
                    className="inline-flex items-center gap-2 text-xs"
                    style={{ color: theme.accent }}
                  >
                    ✦ 继续每日打卡，下月报告会更精准 →
                  </Link>
                </footer>
              </article>
            </MystiPaywall>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  theme,
}: {
  label: string;
  value: number;
  unit: string;
  theme: ReturnType<typeof useMystiTheme>['theme'];
}) {
  return (
    <div>
      <div className="text-2xl" style={{ color: theme.accent, fontFamily: 'var(--font-display)' }}>
        {value}
        <span className="text-xs ml-1" style={{ color: theme.textSubtle }}>
          {unit}
        </span>
      </div>
      <div className="text-[11px] mt-1" style={{ color: theme.textMuted }}>
        {label}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  theme,
}: {
  title: string;
  children: React.ReactNode;
  theme: ReturnType<typeof useMystiTheme>['theme'];
}) {
  return (
    <section>
      <h3 className="text-base mb-2" style={{ color: theme.text, fontFamily: 'var(--font-display)' }}>
        {title}
      </h3>
      <div style={{ color: theme.textMuted }}>{children}</div>
    </section>
  );
}

function topArchetypes(pairs: DualPairRecord[]): Array<[string, number]> {
  const map = new Map<string, number>();
  for (const p of pairs) {
    const key = p.archetypeName ?? '命运暗线';
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
}
