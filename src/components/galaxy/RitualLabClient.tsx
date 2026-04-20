/**
 * RitualLabClient · 试玩 8 题型 + 3 仪式
 */
'use client';

import { useState } from 'react';

import {
  ChapterShell,
  ColorDrip,
  EitherOrPlanets,
  MirrorSlider,
  PolaroidStack,
  SanctumGate,
  SigilSketching,
  StardustSealing,
  TarotPull,
  TwoAmText,
  VinylDrop,
  WhisperInput,
} from '@/components/quiz-formats';
import { MOCK_GALAXY_RESULT } from '@/lib/wtfi/galaxy-mock';

export function RitualLabClient() {
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [sliderValue, setSliderValue] = useState<number | null>(null);
  const [whisperText, setWhisperText] = useState<string>('');
  const [gateOpen, setGateOpen] = useState(false);
  const [sigilDone, setSigilDone] = useState(false);

  const set = (k: string) => (v: string) => setPicks((prev) => ({ ...prev, [k]: v }));

  return (
    <div style={{ display: 'grid', gap: 28 }}>
      {/* C1 */}
      <FormatSection
        code="C1"
        name="Sanctum Gate · 神殿之门"
        tone="入场仪式 · 长按 1.5s · 金线一笔写出 WTFTI"
      >
        {gateOpen ? (
          <p
            style={{
              padding: 40,
              textAlign: 'center',
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              color: '#C9A676',
              fontSize: 18,
            }}
          >
            ✦ 门已开启 · 测试可以开始了。
          </p>
        ) : (
          <SanctumGate onUnlock={() => setGateOpen(true)} />
        )}
      </FormatSection>

      {/* F1 */}
      <FormatSection code="F1" name="Either/Or 双行星" tone="二元对立题 · 太空·极简">
        <ChapterShell tone="rose" chapterMark="I" title="引力之始">
          <EitherOrPlanets
            prompt="在派对上，你会更想……"
            hint="凭直觉选 — 不必想清楚为什么。"
            left={{
              key: 'L',
              label: '被注视的中心',
              blurb: '让所有人朝向你',
              glyph: '✿',
              accent: '#C07A8E',
            }}
            right={{
              key: 'R',
              label: '角落里和一个人深谈',
              blurb: '只想被一个人完全听见',
              glyph: '☾',
              accent: '#9C7CFF',
            }}
            initial={picks.f1}
            onPick={set('f1')}
          />
        </ChapterShell>
      </FormatSection>

      {/* F2 */}
      <FormatSection code="F2" name="Polaroid Stack 拍立得叠" tone="价值观排序 · 复古·文艺">
        <ChapterShell tone="gold" chapterMark="IV" title="命运织线">
          <PolaroidStack
            prompt="把这 4 张拍立得排出顺序——最舍不得丢的留到最后。"
            hint="点「丢掉」让卡片飞出，点「留下」直接选定。"
            options={[
              { key: 'A', caption: '童年家门口', imageGlyph: '⌂' },
              { key: 'B', caption: '大学最后一晚', imageGlyph: '☾' },
              { key: 'C', caption: '第一次加班到天亮', imageGlyph: '☼' },
              { key: 'D', caption: '一个人去过最远的地方', imageGlyph: '✈' },
            ]}
            initial={picks.f2}
            onPick={set('f2')}
          />
        </ChapterShell>
      </FormatSection>

      {/* F3 */}
      <FormatSection code="F3" name="Mirror Slider 镜面滑杆" tone="连续光谱 · 浪漫·暧昧">
        <ChapterShell tone="rose" chapterMark="I" title="独立 vs 被认住">
          <MirrorSlider
            prompt="把金球拖到你今天更靠近的那一极。"
            topStatement="我一个人能走得很远。"
            bottomStatement="我需要被一个人深深认住。"
            initial={sliderValue ?? undefined}
            onPick={(v) => setSliderValue(v)}
          />
        </ChapterShell>
      </FormatSection>

      {/* F4 */}
      <FormatSection code="F4" name="Tarot Pull 抽签" tone="决策/暗面/命运感 · 神秘·仪式">
        <ChapterShell tone="twilight" chapterMark="II" title="暗面之井">
          <TarotPull
            prompt="先抽一张牌 — 它会决定下面这道题怎么问。"
            hint="塔罗只是镜子 · 答案在你心里。"
            cards={[
              {
                key: 'tower',
                cardName: 'The Tower',
                faceGlyph: '☗',
                promptVariant: '你最近一次主动让某段关系结束，是因为……',
                options: [
                  { key: 'A', label: '已经看清结局', blurb: '不愿意再耗自己的力气' },
                  { key: 'B', label: '对方先变了', blurb: '我只是承认而已' },
                  { key: 'C', label: '我自己想长出新的样子', blurb: '旧的关系装不下我' },
                ],
              },
              {
                key: 'lovers',
                cardName: 'The Lovers',
                faceGlyph: '⚭',
                promptVariant: '当你说"我懂你"，更多时候是在说……',
                options: [
                  { key: 'A', label: '我真的看见了你', blurb: '不是模板，是你这个人' },
                  { key: 'B', label: '我也想被这样懂', blurb: '其实是镜像投射' },
                  { key: 'C', label: '我想留在这里', blurb: '这是温柔的请求' },
                ],
              },
              {
                key: 'moon',
                cardName: 'The Moon',
                faceGlyph: '☾',
                promptVariant: '凌晨 3 点醒来，你最先想的是……',
                options: [
                  { key: 'A', label: '一个具体的人', blurb: '一句没说出口的话' },
                  { key: 'B', label: '一件还没完成的事', blurb: '想的是责任' },
                  { key: 'C', label: '一种说不清的恐惧', blurb: '只想再睡过去' },
                ],
              },
            ]}
            onPick={(c, o) => set('f4')(`${c}/${o}`)}
          />
        </ChapterShell>
      </FormatSection>

      {/* F5 */}
      <FormatSection code="F5" name="2 AM Text 凌晨短信" tone="关系/触发型 · 戏剧·幽默">
        <ChapterShell tone="twilight" chapterMark="II" title="边界 · 突袭">
          <TwoAmText
            sender="✦ Mom · 03:14"
            incoming={['睡了吗？', '我跟你爸吵架了。']}
            replies={[
              { key: 'A', text: '立刻打回去。', variant: 'me' },
              { key: 'B', text: '睡了，明天再聊。', variant: 'me' },
              { key: 'C', text: '装作没看见。', variant: 'narrator' },
            ]}
            initial={picks.f5}
            onPick={set('f5')}
            hint={'没有「正确答案」。'}
          />
        </ChapterShell>
      </FormatSection>

      {/* F6 */}
      <FormatSection code="F6" name="Vinyl Drop 唱片" tone="音乐 Soul Probe · 复古·ASMR">
        <ChapterShell tone="aurora" chapterMark="V" title="灵魂探针 · I 音乐">
          <VinylDrop
            prompt="哪段声音最像你心里那个频率？"
            hint="点击唱片 → 唱针落下 → 选定。"
            options={[
              { key: 'A', label: '古典室内乐', blurb: '巴赫无伴奏大提琴', centerGlyph: '♪', accent: '#C9A676' },
              { key: 'B', label: '清晨民谣', blurb: 'Joni Mitchell', centerGlyph: '♫', accent: '#C07A8E' },
              { key: 'C', label: '深夜电子', blurb: 'Bonobo', centerGlyph: '⌬', accent: '#9C7CFF' },
              { key: 'D', label: '环境氛围', blurb: 'Brian Eno', centerGlyph: '◯', accent: '#7AA3B0' },
            ]}
            initial={picks.f6}
            onPick={set('f6')}
          />
        </ChapterShell>
      </FormatSection>

      {/* F7 */}
      <FormatSection code="F7" name="Color Drip 滴墨" tone="颜色 Soul Probe · 视觉·治愈">
        <ChapterShell tone="aurora" chapterMark="V" title="灵魂探针 · III 颜色">
          <ColorDrip
            prompt="哪个颜色是你今天的心率？"
            hint="点一下 → 它会滴入水中 → 染上整个空间。"
            options={[
              { key: 'A', label: '玫瑰陶土', hex: '#C07A8E', blurb: '暖中带血色' },
              { key: 'B', label: '暮紫', hex: '#5C4A8A', blurb: '深而镇定' },
              { key: 'C', label: '苔绿', hex: '#5A7A5C', blurb: '隐忍生长' },
              { key: 'D', label: '灰蓝', hex: '#7AA3B0', blurb: '海与雾之间' },
            ]}
            initial={picks.f7}
            onPick={set('f7')}
          />
        </ChapterShell>
      </FormatSection>

      {/* F8 */}
      <FormatSection code="F8" name="Whisper Input 私语输入" tone="开放收尾 · 文艺·私密">
        <ChapterShell tone="whisper" chapterMark="VI" title="一句话给未来的自己">
          <WhisperInput
            prompt="如果你能给 30 天后的自己留一句话，是？"
            hint="✦ 不用写完美 · 写一句你今天想说的"
            maxLength={24}
            initial={whisperText}
            onCommit={setWhisperText}
          />
        </ChapterShell>
      </FormatSection>

      {/* C2 */}
      <FormatSection
        code="C2"
        name="Sigil Sketching · 印记勾勒"
        tone="中段奖励仪式 · 4 秒程序生成印记"
      >
        {sigilDone ? (
          <p
            style={{
              padding: 28,
              textAlign: 'center',
              fontStyle: 'italic',
              color: '#C9A676',
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 16,
            }}
          >
            ✦ 印记已写下 · 继续答题…
          </p>
        ) : (
          <SigilSketching galaxy={MOCK_GALAXY_RESULT} onDone={() => setSigilDone(true)} />
        )}
      </FormatSection>

      {/* C3 */}
      <FormatSection
        code="C3"
        name="Stardust Sealing · 星尘封信"
        tone="收尾仪式 · 写信 → 封缄 → 30 天后开启"
      >
        <StardustSealing
          personalitySlug="lab-preview"
          dueDays={30}
          nextHref="/wtfti/galaxy/preview/"
          nextLabel="✦ 查看星图结果"
        />
      </FormatSection>

      <div
        style={{
          marginTop: 12,
          padding: '14px 16px',
          borderRadius: 12,
          border: '1px dashed rgba(201,166,118,.35)',
          background: 'rgba(201,166,118,.06)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 11,
            color: 'rgba(245,240,232,.6)',
            fontFamily: 'monospace',
            lineHeight: 1.7,
          }}
        >
          <strong style={{ color: '#C9A676' }}>✦ Picks debug</strong>
          <br />
          {JSON.stringify({ picks, sliderValue, whisperText, gateOpen, sigilDone }, null, 2)}
        </p>
      </div>
    </div>
  );
}

function FormatSection({
  code,
  name,
  tone,
  children,
}: {
  code: string;
  name: string;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <article style={{ display: 'grid', gap: 10 }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
          paddingBottom: 6,
          borderBottom: '1px solid rgba(245,240,232,.10)',
        }}
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: 4,
            color: '#C9A676',
            fontFamily: 'monospace',
            fontWeight: 700,
          }}
        >
          {code}
        </span>
        <h2
          style={{
            margin: 0,
            fontSize: 16,
            fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
            fontStyle: 'italic',
            fontWeight: 500,
            color: '#F5F0E8',
          }}
        >
          {name}
        </h2>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            color: 'rgba(245,240,232,.5)',
          }}
        >
          {tone}
        </span>
      </header>
      <div>{children}</div>
    </article>
  );
}
