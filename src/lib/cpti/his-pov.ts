/**
 * CPTI 2.0 — 男性反向报告（"在她眼里你是谁"）
 *
 * v2.0 W2 sprint, 2026-04-21.
 *
 * Goal: when 男性 lands on a CPTI relationship result via her invite link,
 * give him a report that is *independently valuable for him*, instead of
 * being a passive NPC. Three deterministic sections:
 *   1. 在她眼里你是谁 — read his role from the relationship's "B 视角" frame
 *   2. 这段关系正在向哪里去 — directional reading from compatibility band
 *   3. 想升级关系，先做这件事 — 3 actionable upgrade nudges, deterministic
 *      from (relationship, his personality, her personality) tuple.
 *
 * Tone constraint (per strategy doc §9 risk mitigation):
 *   - Avoid "如何征服她" / PUA framing.
 *   - Use "如何让这段关系更稳" middle-ground language.
 *   - No emoji in body copy except the section heading.
 *   - Address him as "你" (not "您" / "兄弟").
 */

import { hashString } from '@/lib/persona-shard/traits';
import type { CptiRelationshipType } from './relationships';

type Tone = 'soft' | 'mid' | 'edge';

interface UpgradeAction {
  title: string;
  body: string;
  tone: Tone;
}

const HER_VIEW_BY_TIER: Record<string, string> = {
  // Viral
  soul: '她觉得你和她在频率上几乎一模一样。她不需要解释你就知道她在想什么 —— 这种感觉对她来说很罕见，所以你比你以为的更重要。',
  plastic: '她对你的位置定义得很清楚：体面、可见、可控的盟友。她不会在凌晨给你打电话，但她会在朋友圈优先点你的赞。',
  settled: '她在你身边能放下所有姿态。这意味着你已经走过了"被她审视"的阶段，但也意味着她可能很久没有为你心动过了。',
  party: '她和你在一起是为了快乐。深夜情绪她会留给别人，但她答应你的所有局都会到场。',
  inmate: '你们的关系建立在共同的吐槽上。她信任你能一起骂同一个人 —— 这是她对你的信任方式。',
  lovers: '她吵你是因为她敢吵 —— 她在你面前不需要表演温柔。她偷偷喜欢你接得住她所有的脾气。',
  enemies: '她在意你 —— 但表达方式是不服气。她不想让你赢，也不想让你彻底输。',
  rivals: '她和你是高浓度绑定。爱意和怒气都拉满，旁人觉得你们要分，她觉得没你不行。',
  // Deep
  sync: '她经常觉得你"接得住"她。她说半句你就懂，这让她在你面前更愿意说真话。',
  glued: '她对你的依赖非常具体，几乎是身体反应。这份依赖很甜，但也意味着你需要为它的稳定负责。',
  allies: '她把你当合伙人一样信任 —— 这在她朋友圈里非常稀有。她相信你不会临阵掉链子。',
  mentor: '她在和你相处的过程中觉得自己在变好。这是她最安全的那一种喜欢。',
  parent: '她照顾你 —— 但内心其实希望被照顾一次。',
  // Rare
  twins: '她在你身边像在镜子前。这种"太像了"的感觉舒服，也偶尔让她想喘口气。',
  keeper: '她已经把你列入"无论发生什么都会留下"的少数人名单。',
  united: '你们是她"对外作战"时第一个想拉来的人。',
  volcano: '她对你的感情浓度非常高，但她也害怕这股浓度有一天会反噬。',
  weirdos: '她和你之间有外人理解不了的默契。这是她的安全屋。',
  mirror: '她从你身上能看到她自己 —— 这同时让她感到熟悉，也让她偶尔想躲开。',
  paradox: '她对你又爱又烦。这通常意味着你在她生命里占了一个真实位置。',
  shield: '她需要你时第一个想到的就是你 —— 这不是依赖，是认证。',
  homies: '她跟你处得像兄弟。这是她对你最大的舒适，也可能是你最大的尴尬。',
  iceberg: '她对你看似冷淡，但她记得你说过的每一句话。',
  free: '她和你一起的时候不会失去自己。这对她来说，是稀缺资源。',
  rookie: '她还在试探。不是不喜欢你，是还没决定要不要让你走进来。',
};

function getHerView(slug: string): string {
  return HER_VIEW_BY_TIER[slug] ?? '她还在感受你。这段关系还在被她重新命名的过程里。';
}

const COMPATIBILITY_BANDS: Array<{ min: number; label: string; arrow: string; body: string }> = [
  { min: 85, label: '高度共振', arrow: '↑', body: '你们在 5 个维度上几乎都对得上。这种关系在她那一年里出现的次数不超过 1 次。它正在向"长期"方向走 —— 你的任务不是争取，是维护。' },
  { min: 70, label: '稳定向上', arrow: '↗', body: '你们在 5 个维度里有 3 个对得上，剩下的有张力但能接住。这段关系正在向"被命名"方向走 —— 是时候让她知道你认真对待这件事了。' },
  { min: 55, label: '互补磨合', arrow: '→', body: '你们彼此身上都有对方缺的部分。这段关系会很有意思但不会很省力 —— 你的任务是把"互补"做成"互信"。' },
  { min: 40, label: '张力共生', arrow: '⇌', body: '你们的浓度大于和谐度。这段关系不会无聊，但也不会自动稳住 —— 你的任务是在她爆发前先抢半步。' },
  { min: 0,  label: '观察期',   arrow: '⋯', body: '你们目前更像在彼此身上做实验。她还在判断你能给她什么 —— 你能做的最好的事，是不要表演。' },
];

function getDirection(compatibility: number): { label: string; arrow: string; body: string } {
  return COMPATIBILITY_BANDS.find(b => compatibility >= b.min) ?? COMPATIBILITY_BANDS[COMPATIBILITY_BANDS.length - 1];
}

const UPGRADE_POOL: UpgradeAction[] = [
  { title: '把她最近一次抱怨当真', body: '她最近一次跟你抱怨的事 —— 不论是工作、家人、还是某个朋友 —— 不要给方案，先重复一遍她的话。她要的是被听见。', tone: 'soft' },
  { title: '主动报备一件你的小事',  body: '今天你做了什么、见了谁、吃了什么。一句话就够。这不是汇报，是把她拉进你的日常。', tone: 'soft' },
  { title: '记住她说过的一个细节', body: '她随口提过的一个名字、一个店、一个想去的地方。下次你主动提起 —— 不解释为什么记得。', tone: 'mid' },
  { title: '取消一次你本来要去的局', body: '不一定是为她，是为"我们"。把这个决定平静地告诉她，不要邀功。', tone: 'mid' },
  { title: '在她面前承认你怕了一件事', body: '不是大事 —— 工作压力、最近一次失败、一个犹豫不决。展示脆弱是你能给她的最稀缺的东西。', tone: 'edge' },
  { title: '把分歧说出来，但慢一点', body: '下次你想反驳她之前，先停 5 秒。不是退让，是让她知道你不会一上来就想赢。', tone: 'edge' },
  { title: '为这段关系命名一次', body: '在合适的场合、合适的人面前，主动用"我们"这个词。她会感觉到。', tone: 'soft' },
  { title: '送一个非节日的小礼物', body: '在没有任何由头的一天，送一件 50 块以内的、关于她日常会用到的东西。比起贵，重要的是"今天"。', tone: 'mid' },
  { title: '问她一个具体的问题',     body: '不要问"你今天怎么样"。问她"今天那个让你头疼的会开完了没"。具体度等于在意度。', tone: 'soft' },
  { title: '在她生气时不要解释',     body: '解释会让她觉得你在洗清自己。先问"你最不舒服的是哪一句"。', tone: 'edge' },
  { title: '给你们的关系定一个仪式',  body: '每周固定的一顿饭、每月固定的一次出门 —— 仪式让她安心。她不会主动要，但她会非常在乎。', tone: 'mid' },
  { title: '在她朋友面前给她台阶',    body: '即使你们之间有过分歧，在第三方面前给她留面子。这是她会记一辈子的东西。', tone: 'soft' },
];

/**
 * Pick 3 upgrade actions deterministically based on (relationship, his slug,
 * her slug). Uses FNV-1a hash so results are stable across renders.
 */
export function pickUpgradeActions(
  relationshipSlug: string,
  hisPersonalitySlug: string,
  herPersonalitySlug?: string,
): UpgradeAction[] {
  const seed = hashString(`${relationshipSlug}|${hisPersonalitySlug}|${herPersonalitySlug ?? 'unknown'}`);
  const indices = new Set<number>();
  let cursor = seed;
  const result: UpgradeAction[] = [];
  while (result.length < 3 && indices.size < UPGRADE_POOL.length) {
    cursor = (cursor * 1664525 + 1013904223) >>> 0;
    const idx = cursor % UPGRADE_POOL.length;
    if (indices.has(idx)) continue;
    indices.add(idx);
    result.push(UPGRADE_POOL[idx]);
  }
  // Diversify tone: ensure not all 3 are the same tone if possible.
  const tones = new Set(result.map(r => r.tone));
  if (tones.size === 1) {
    const fallback = UPGRADE_POOL.find(a => a.tone !== result[0].tone);
    if (fallback) result[2] = fallback;
  }
  return result;
}

export interface HisPovReport {
  herView: string;
  direction: { label: string; arrow: string; body: string };
  upgrades: UpgradeAction[];
}

export function buildHisPovReport(
  relationship: CptiRelationshipType,
  compatibility: number,
  hisPersonalitySlug: string,
  herPersonalitySlug?: string,
): HisPovReport {
  return {
    herView: getHerView(relationship.slug),
    direction: getDirection(compatibility),
    upgrades: pickUpgradeActions(relationship.slug, hisPersonalitySlug, herPersonalitySlug),
  };
}
