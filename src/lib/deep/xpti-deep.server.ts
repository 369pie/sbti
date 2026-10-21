/**
 * SERVER ONLY — imported exclusively by /api/deep/[kind]/route.ts.
 * XPTI deep (xpti-deep-xp) paid copy: pairings, landmines, dialogue scripts, verdicts.
 */
import { getXptiPersonalityBySlug } from '@/lib/xpti/personalities';
import { XPTI_DIMENSIONS } from '@/lib/xpti/dimensions';
import type { DimensionLevel } from '@/lib/xpti/dimensions';
import { hashString, pickN, levelToScore } from '@/lib/payments/deep-content';
import { pickDialogueScripts, type DialogueScript } from '@/lib/xpti/dialogue-scripts';

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




export type XptiDeepPayload = {
  compatibility: { score: number; verdict: string } | null;
  pairs: Array<{ archetype: string; who: string; why: string; badge: string; rank: number }>;
  landmines: string[];
  dialogues: DialogueScript[];
};

export function buildXptiDeepPayload(slug: string, partnerSlug: string | null): XptiDeepPayload | null {
  const personality = getXptiPersonalityBySlug(slug);
  if (!personality) return null;
  const partner = partnerSlug ? getXptiPersonalityBySlug(partnerSlug) ?? null : null;
  const radarPoints = XPTI_DIMENSIONS.map((d) => levelToScore((personality.profile[d.id] ?? 'M') as DimensionLevel) / 3);
  const partnerRadarPoints = partner
    ? XPTI_DIMENSIONS.map((d) => levelToScore((partner.profile[d.id] ?? 'M') as DimensionLevel) / 3)
    : null;
  // Compatibility readout — sum of axis-distance × weight (0..1, higher = closer).
  // Inlined (not memoized) — the React Compiler optimizes pure derives automatically.
  const compatibility: { score: number; verdict: string } | null = (() => {
    if (!partnerRadarPoints) return null;
    const totalDelta = radarPoints.reduce(
      (acc, v, i) => acc + Math.abs(v - partnerRadarPoints[i]),
      0,
    );
    const maxPossible = radarPoints.length;
    const closeness = 1 - totalDelta / maxPossible;
    const score = Math.round(closeness * 100);
    const verdict =
      score >= 80
        ? '镜像默契 · 一拍即合的 XP 双子'
        : score >= 65
        ? '同频共振 · 大方向一致，小细节互补'
        : score >= 50
        ? '互补共生 · 高低维交错，节奏可咬合'
        : score >= 35
        ? '张力配 · 反差大，需要谈判才能合拍'
        : '极性配 · 一个引力一个斥力，靠运气';
    return { score, verdict };
  })();

  const offset = hashString(slug) % 6;
  const pairs = pickN(PAIR_POOL, slug, 6, 'pair').map((p, i) => ({
    ...p,
    badge: ['梦幻', '可遇', '可碰', '可培养', '小心', '速度过'][i],
    rank: i + 1 + offset,
  }));
  const landmines = pickN(LANDMINE_POOL, slug, 8, 'mine');
  // Partner-aware: when partner is known, the dialogue seed shifts so the 6
  // scripts are re-rolled to a couple-specific subset.
  const dialogues = pickDialogueScripts(
    partner ? `${slug}::${partner.slug}` : slug,
    6,
  );


  return { compatibility, pairs, landmines, dialogues };
}
