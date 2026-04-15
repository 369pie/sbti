/**
 * 25 种关系类型 — CPTI Relationship 图鉴
 *
 * 三个梯队:
 *   一线梗感型 (8): 传播力强的关系名
 *   二线深层型 (5): 有深度的关系描述
 *   三线稀有型 (12): 难以触发的特殊组合
 */

import { withBasePath } from '../site';

export type RelationshipTier = 'viral' | 'deep' | 'rare';

export interface CptiRelationshipType {
  slug: string;
  code: string;
  name: string;
  tagline: string;
  description: string;
  emoji: string;
  color: string;
  tier: RelationshipTier;
}

export const RELATIONSHIP_TIER_INFO: Record<RelationshipTier, { label: string; color: string; bgColor: string }> = {
  viral: { label: '梗王级', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.12)' },
  deep:  { label: '深度型', color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.12)' },
  rare:  { label: '稀有级', color: '#ec4899', bgColor: 'rgba(236,72,153,0.12)' },
};

export const CPTI_RELATIONSHIP_TYPES: CptiRelationshipType[] = [
  // ═══════════════════════════════════════
  //  一线梗感型 (Viral) — 8 types
  // ═══════════════════════════════════════
  {
    slug: 'soul', code: 'SOUL', name: '灵魂伴侣', tagline: '一个眼神就够了。',
    emoji: '🔮', color: '#a855f7', tier: 'viral',
    description: '你们不需要太多语言就能互相理解。五个维度上高度一致，连吵架的节奏都差不多。这种匹配可遇不可求——如果你们吵架了，大概率是因为太像了而不是太不同。',
  },
  {
    slug: 'plastic', code: 'PLASTIC', name: '塑料姐妹', tagline: '表面亲密实际各玩各的。',
    emoji: '💅', color: '#f472b6', tier: 'viral',
    description: '你们在外人面前亲密无间，但内心深处各有盘算。表达上都很到位，但融合度极低——各自有各自的世界。这段关系更像是一种默契的社交联盟，而不是真正的灵魂交汇。但谁说这不好呢？',
  },
  {
    slug: 'settled', code: 'SETTLED', name: '老夫老妻', tagline: '左手摸右手但离不开。',
    emoji: '🛋️', color: '#78716c', tier: 'viral',
    description: '你们的关系已经进入了"超稳定态"。不再大喜大悲，不再惊心动魄，但就是离不开。冲突力和表达力都偏低，因为你们已经过了需要表演的阶段。对方就像空气——平时感觉不到，少了会窒息。',
  },
  {
    slug: 'party', code: 'PARTY', name: '酒肉朋友', tagline: '一起嗨没问题，别跟我谈深的。',
    emoji: '🍻', color: '#f59e0b', tier: 'viral',
    description: '你们在一起的时候特别快乐——吃饭、看电影、打游戏，氛围拉满。但要是聊点深层次的情感需求？对不起，不在服务范围内。你们的关系适合在阳光下，不太适合在深夜里。',
  },
  {
    slug: 'inmate', code: 'INMATE', name: '狱友', tagline: '一起受苦一起骂甲方。',
    emoji: '⛓️', color: '#64748b', tier: 'viral',
    description: '你们的关系建立在共同的苦难之上——吐槽同一个老板、骂同一份工作、在深夜互相发"好累"。这种关系的粘合剂不是甜蜜，是苦中作乐。一旦苦难结束，你们可能会发现其实没什么共同语言。但此刻，你们就是战友。',
  },
  {
    slug: 'lovers', code: 'LOVERS', name: '欢喜冤家', tagline: '吵归吵骂归骂放学别走。',
    emoji: '⚡', color: '#ef4444', tier: 'viral',
    description: '你们的日常就是怼来怼去，但怼完又马上和好。冲突力双高但付出力也不低——一边嫌弃一边操心。外人看你们觉得"这俩迟早要分"，但你们自己知道：没有对方的生活才是真的无聊。',
  },
  {
    slug: 'enemies', code: 'ENEMIES', name: '塑料死敌', tagline: '互不服气但又互相在意。',
    emoji: '🗡️', color: '#dc2626', tier: 'viral',
    description: '你们之间有一种微妙的竞争关系。都想做主导、都不肯服软、吵架互不退让。但正是这种"不服"让你们的关系充满了张力和火花。你们不适合风平浪静——因为你们的爱情就是战场。',
  },
  {
    slug: 'rivals', code: 'RIVALS', name: '相爱相杀', tagline: '我恨你但我的眼睛里只有你。',
    emoji: '🔥', color: '#b91c1c', tier: 'viral',
    description: '这段关系的浓度比咖啡还高。主导力上互不退让，冲突力都拉满，但融合度也高得吓人——你们已经深度绑定彼此。爱的时候要死要活，吵的时候翻天覆地。旁人劝你们分，你们当耳旁风。',
  },

  // ═══════════════════════════════════════
  //  二线深层型 (Deep) — 5 types
  // ═══════════════════════════════════════
  {
    slug: 'sync', code: 'SYNC', name: '心灵同步', tagline: '想一起的不止是时间。',
    emoji: '🫧', color: '#06b6d4', tier: 'deep',
    description: '你们不仅仅是在一起——你们在同一个频道里。表达力和融合度双双拉满，你们会不约而同说出同样的话、想到同样的梗。这种关系让人安心，因为你永远知道对方在想什么。',
  },
  {
    slug: 'glued', code: 'GLUED', name: '连体婴儿', tagline: '分开五分钟都不行。',
    emoji: '🧲', color: '#e11d48', tier: 'deep',
    description: '你们的融合度已经突破天际。手机壳情侣款、微信头像情侣款、连点外卖都要一起选。外人可能觉得你们"太黏了"，但你们自己觉得刚刚好。唯一的风险是：万一分开，戒断反应会很强。',
  },
  {
    slug: 'allies', code: 'ALLIES', name: '战略同盟', tagline: '我负责赚钱你负责花钱。',
    emoji: '🤝', color: '#10b981', tier: 'deep',
    description: '你们的关系不像恋爱，更像一个运转高效的团队。主导力上互补、付出力各有分工、冲突极少因为你们能理性沟通。外人可能觉得你们"不够浪漫"，但你们觉得：靠谱的人比浪漫的人更值得托付。',
  },
  {
    slug: 'mentor', code: 'MENTOR', name: '师徒恋人', tagline: '跟你在一起我成长了好多。',
    emoji: '📚', color: '#7c3aed', tier: 'deep',
    description: '这段关系里有一个人明显更有主导力和付出力。TA像是人生导师一样带着对方成长——推荐书单、纠正习惯、规划未来。被引导的那个人从不觉得被控制，只觉得"跟TA在一起变成了更好的自己"。',
  },
  {
    slug: 'parent', code: 'PARENT', name: '妈系恋人', tagline: '你出门带伞了吗？吃饭了吗？',
    emoji: '🧸', color: '#ec4899', tier: 'deep',
    description: '这段关系有一个人付出力极高、另一个被照顾得像小孩。嘘寒问暖、接送上下班、三餐按时提醒——这就是恋爱版的"24小时在线客服"。被照顾的人很幸福，但"客服"有时候也会累。',
  },

  // ═══════════════════════════════════════
  //  三线稀有型 (Rare) — 12 types
  // ═══════════════════════════════════════
  {
    slug: 'twins', code: 'TWINS', name: '双子星', tagline: '你就是另一个我。',
    emoji: '♊', color: '#8b5cf6', tier: 'rare',
    description: '所有维度都高度一致。你们的性格是复制粘贴级别的相似，连缺点都一样。这种关系的优势是无需磨合，劣势是你们可能缺少互补——两个一模一样的人在一起，是安心还是无聊？',
  },
  {
    slug: 'united', code: 'UNITED', name: '命运共同体', tagline: '绑在一起赴汤蹈火。',
    emoji: '🔗', color: '#0ea5e9', tier: 'rare',
    description: '你们的融合度和付出力都拉满了。彼此不仅是恋人更是命运合伙人——对方的事就是自己的事，没有"你的问题""我的问题"之分。这种深度绑定要么让人觉得窒息，要么让人觉得遇到了此生最重要的人。',
  },
  {
    slug: 'keeper', code: 'KEEPER', name: '宝藏搭档', tagline: '普通但金贵。',
    emoji: '💎', color: '#22c55e', tier: 'rare',
    description: '这段关系乍一看不起眼，但越处越发现对方是个宝。付出力高、冲突力低、表达不多但每一句都在点上。TA不会给你轰轰烈烈的激情，但会给你稳稳当当的安全感。这种关系是"细水长流"的天花板。',
  },
  {
    slug: 'weirdos', code: 'WEIRDOS', name: '怪咖联盟', tagline: '别人不懂我们就够了。',
    emoji: '🦄', color: '#a855f7', tier: 'rare',
    description: '你们的相处模式在外人看来"有点奇怪"，但你们自己很享受。可能约会去殡仪馆参观、情人节送对方一袋泥土、吵架方式是互发论文……你们不需要别人理解，因为你们有自己的宇宙。',
  },
  {
    slug: 'homies', code: 'HOMIES', name: '铁磁兄弟', tagline: '不是恋人胜似恋人。',
    emoji: '👊', color: '#3b82f6', tier: 'rare',
    description: '你们的关系更接近"最好的哥们"——不黏、不矫情、遇事顶上。融合度低但付出力高，你们不需要天天见面但需要的时候一定在。这段关系没有太多浪漫色彩，但有一种比浪漫更珍贵的东西：可靠。',
  },
  {
    slug: 'volcano', code: 'VOLCANO', name: '活火山组合', tagline: '随时可能爆发但风景很美。',
    emoji: '🌋', color: '#f97316', tier: 'rare',
    description: '冲突力双高、表达力双高——你们的关系就像一座活火山：平时壮丽无比，一旦爆发寸草不生。吵架频率很高，但和好速度更快。你们的爱情不是小溪潺潺，是岩浆奔涌。',
  },
  {
    slug: 'iceberg', code: 'ICEBERG', name: '冰山组合', tagline: '表面平静暗流涌动。',
    emoji: '🧊', color: '#94a3b8', tier: 'rare',
    description: '冲突力和表达力双双偏低——你们的关系看起来很平淡，但水面下可能积压了很多没说出口的话。你们不是没有矛盾，而是都选择了沉默。这段关系需要一个人先打破冰层。',
  },
  {
    slug: 'mirror', code: 'MIRROR', name: '镜像CP', tagline: '我的优势恰好是你的短板。',
    emoji: '🪞', color: '#06b6d4', tier: 'rare',
    description: '你们在多个维度上呈现完美互补——一个主导一个配合，一个外放一个内敛，一个照顾一个被照顾。这是最经典的互补型关系，也是最稳定的搭配之一。唯一的风险：别让互补变成了固化的角色分配。',
  },
  {
    slug: 'paradox', code: 'PARADOX', name: '矛盾体情侣', tagline: '怎么在一起的我也不知道。',
    emoji: '🌀', color: '#d946ef', tier: 'rare',
    description: '你们的维度匹配看起来完全不合理——差异巨大但偏偏黏在一起。逻辑上不该走到一起的两个人，感情上却谁也离不开谁。这种关系没法用数据解释，只能说：爱情不讲道理。',
  },
  {
    slug: 'rookie', code: 'ROOKIE', name: '恋爱新手村', tagline: '我们都在摸索中。',
    emoji: '🌱', color: '#84cc16', tier: 'rare',
    description: '你们的关系维度都偏中间值——不太主导也不太配合，不太黏也不太独立。这不是因为你们无聊，而是因为你们还在互相摸索对方的模式。新手村的意思是：你们的故事才刚刚开始。',
  },
  {
    slug: 'free', code: 'FREE', name: '自由联邦', tagline: '在一起但各自精彩。',
    emoji: '🦅', color: '#0ea5e9', tier: 'rare',
    description: '你们的融合度极低——各有各的朋友圈、各有各的周末计划、各有各的生活方式。但这不是冷淡，是你们都享受独立。这段关系的秘诀就是：足够多的空间 + 足够深的信任。',
  },
  {
    slug: 'shield', code: 'SHIELD', name: '铜墙铁壁', tagline: '有我在外面谁也别想欺负你。',
    emoji: '🛡️', color: '#14b8a6', tier: 'rare',
    description: '这段关系里有一个人是绝对的保护者——付出力和主导力双高，TA把对方护得严严实实。被保护的那个人可能在外面是社恐宝宝，但在TA面前可以肆无忌惮做自己。这种关系的底色是安全感。',
  },
];

export function getRelationshipBySlug(slug: string): CptiRelationshipType | undefined {
  return CPTI_RELATIONSHIP_TYPES.find(r => r.slug === slug);
}

export function getCptiRelationshipTypeImage(slug: string): string {
  return withBasePath(`/images/types/cpti/relationships/${slug}.png`);
}

export function getCptiRelationshipTypeThumbnailImage(slug: string): string {
  return withBasePath(`/images/types/cpti/relationships/thumbs/${slug}.webp`);
}

export function getAllRelationshipSlugs(): string[] {
  return CPTI_RELATIONSHIP_TYPES.map(r => r.slug);
}
