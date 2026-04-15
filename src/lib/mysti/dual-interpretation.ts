import type { RelationshipArchetype, RelationshipArchetypeId, DualInterpretation } from './types';
import type { MystiTarotData } from './types';

// ── Group assignment ──────────────────────────────────────────────

const GROUP_MAP: Record<string, string> = {
  boss: 'control', ctrl: 'control', 'oh-no': 'control', 'thin-k': 'control',
  mum: 'emotional', simp: 'emotional', 'atm-er': 'emotional', 'than-k': 'emotional', 'love-r': 'emotional',
  solo: 'solitude', nerd: 'solitude', shy: 'solitude',
  drama: 'expression', party: 'expression', 'talk-er': 'expression', joker: 'expression', drunk: 'expression',
  rebel: 'rebel', woc: 'rebel',
  'game-r': 'indulgence', 'food-ie': 'indulgence', sexy: 'indulgence', malo: 'indulgence', fake: 'indulgence', sleep: 'indulgence',
  chill: 'lucky', 'luck-y': 'lucky',
  emo: 'sensitive',
  'dior-s': 'letgo',
};

export function getGroup(slug: string): string {
  return GROUP_MAP[slug] ?? 'unknown';
}

// ── Archetype definitions ─────────────────────────────────────────

const ARCHETYPES: Record<RelationshipArchetypeId, RelationshipArchetype> = {
  mirror:     { id: 'mirror',     name: '同频共振', emoji: '🪞', description: '你们是彼此的镜子，看见对方就像看见另一个自己。' },
  complement: { id: 'complement', name: '天作之合', emoji: '🧩', description: '你缺的正好是 TA 多的，你们像两块拼图严丝合缝。' },
  collision:  { id: 'collision',  name: '火花四射', emoji: '⚡', description: '你们在一起就是一场美丽的爆炸，危险又迷人。' },
  nurture:    { id: 'nurture',    name: '水土相生', emoji: '🌱', description: '一个人是土壤，一个人是种子，你们让彼此生长。' },
  resonance:  { id: 'resonance',  name: '灵魂共鸣', emoji: '🔮', description: '不需要解释太多，你们在同一个频率上振动。' },
  growth:     { id: 'growth',     name: '破茧之力', emoji: '🦋', description: '在一起会痛，但痛完之后你们都会变成更好的人。' },
  harmony:    { id: 'harmony',    name: '岁月静好', emoji: '🍃', description: '没有什么轰轰烈烈，但每一天都很舒服。' },
  friction:   { id: 'friction',   name: '虚空拉扯', emoji: '🌊', description: '你们太像了，或者太不一样了，总之总是互相消耗。' },
  balance:    { id: 'balance',    name: '此消彼长', emoji: '☯️', description: '一个在前的时候另一个会退后，你们在动态中找到平衡。' },
  depth:      { id: 'depth',      name: '深海共振', emoji: '🌀', description: '你们的关系往深处走，越深越见真章。' },
  mystery:    { id: 'mystery',    name: '命运暗线', emoji: '🕸️', description: '说不清为什么，但命运好像早就安排好了。' },
};

// ── Group pair → archetype mapping ────────────────────────────────

function pairKey(a: string, b: string): string {
  return [a, b].sort().join('+');
}

const GROUP_PAIR_ARCHETYPE: Record<string, RelationshipArchetypeId> = {};
const archRules: [string, string, RelationshipArchetypeId][] = [
  ['control', 'control', 'friction'],
  ['control', 'emotional', 'complement'],
  ['control', 'solitude', 'depth'],
  ['control', 'expression', 'collision'],
  ['control', 'rebel', 'friction'],
  ['control', 'indulgence', 'friction'],
  ['control', 'lucky', 'balance'],
  ['control', 'sensitive', 'nurture'],
  ['control', 'letgo', 'friction'],
  ['emotional', 'emotional', 'mirror'],
  ['emotional', 'solitude', 'resonance'],
  ['emotional', 'expression', 'nurture'],
  ['emotional', 'rebel', 'growth'],
  ['emotional', 'indulgence', 'friction'],
  ['emotional', 'lucky', 'harmony'],
  ['emotional', 'sensitive', 'resonance'],
  ['emotional', 'letgo', 'balance'],
  ['solitude', 'solitude', 'mirror'],
  ['solitude', 'expression', 'balance'],
  ['solitude', 'rebel', 'collision'],
  ['solitude', 'indulgence', 'depth'],
  ['solitude', 'lucky', 'harmony'],
  ['solitude', 'sensitive', 'resonance'],
  ['solitude', 'letgo', 'harmony'],
  ['expression', 'expression', 'mirror'],
  ['expression', 'rebel', 'collision'],
  ['expression', 'indulgence', 'harmony'],
  ['expression', 'lucky', 'complement'],
  ['expression', 'sensitive', 'growth'],
  ['expression', 'letgo', 'balance'],
  ['rebel', 'rebel', 'mirror'],
  ['rebel', 'indulgence', 'collision'],
  ['rebel', 'lucky', 'balance'],
  ['rebel', 'sensitive', 'growth'],
  ['rebel', 'letgo', 'complement'],
  ['indulgence', 'indulgence', 'friction'],
  ['indulgence', 'lucky', 'harmony'],
  ['indulgence', 'sensitive', 'depth'],
  ['indulgence', 'letgo', 'harmony'],
  ['lucky', 'lucky', 'mirror'],
  ['lucky', 'sensitive', 'nurture'],
  ['lucky', 'letgo', 'harmony'],
  ['sensitive', 'sensitive', 'mirror'],
  ['sensitive', 'letgo', 'depth'],
  ['letgo', 'letgo', 'mirror'],
];
for (const [a, b, id] of archRules) {
  GROUP_PAIR_ARCHETYPE[pairKey(a, b)] = id;
}

// ── Interpretation content ────────────────────────────────────────
// Each archetype gets multiple variations keyed by pair, with fallback.

interface InterpretationTemplate {
  dynamics: string;
  conflict: string;
  advice: string;
  bondTagline: string;
}

const TEMPLATES: Record<RelationshipArchetypeId, InterpretationTemplate> = {
  mirror: {
    dynamics: '你们太像了。思维方式、情感节奏、甚至逃避问题的方式都如出一辙。在一起的时候有一种「终于被理解了」的安全感。',
    conflict: '但也因为太像，你们的弱点会被无限放大。你不敢面对的，TA 也在躲。两个人一起躲，问题就永远在那里。',
    advice: '镜子照见的是自己。学会在对方身上看到自己的盲区，而不是只看到认同。',
    bondTagline: '你们是彼此的倒影，也是彼此的课题',
  },
  complement: {
    dynamics: '你缺的那一块，TA 刚好多出来。你往前冲的时候 TA 在后面稳住，TA 发散的时候你负责收拢。你们在一起比单独一个人强。',
    conflict: '互补的反面是「为什么你不能跟我一样」。当你们试图改变对方而不是信任对方的特长时，拼图就开始脱落。',
    advice: '不要试图把对方变成自己。你们的价值恰恰在于「不一样」。',
    bondTagline: '两块不同的拼图，严丝合缝',
  },
  collision: {
    dynamics: '你们在一起就是火药遇上了火星。刺激、上头、充满化学反应。每一次对话都像在打辩论赛，但结束后又觉得「好爽」。',
    conflict: '碰撞的代价是烧伤。当新鲜感退去，剩下的就是两个不肯让步的人在互相消耗。谁先低头成了最大的难题。',
    advice: '把碰撞当成打磨，而不是战争。每次争执都是在帮对方去掉多余的部分。',
    bondTagline: '每一次碰撞，都在重塑彼此的形状',
  },
  nurture: {
    dynamics: '你们的关系有一种天然的「给」和「接」。一个人提供能量，一个人接住它。不需要刻意经营，流动就是你们的节奏。',
    conflict: '给的那个人会累，接的那个人会依赖。当「给」变成义务，「接」变成理所当然，滋养就变成了透支。',
    advice: '滋养是双向的。接的人要学会回流，给的人要学会开口要。',
    bondTagline: '你是土壤，TA 是种子，你们让彼此开花',
  },
  resonance: {
    dynamics: '不需要解释太多。你说上半句 TA 就知道下半句，你还没开口 TA 就已经感觉到了。这种默契不是培养出来的，是天生的。',
    conflict: '共鸣也会变成共振。当两个人的情绪同频放大，好的时候加倍好，但低谷的时候会一起坠入深渊，谁也拉不动谁。',
    advice: '学会在共鸣中保留自己的独立振幅。不需要每次都同频，有时候错开反而是保护。',
    bondTagline: '你们在同一个频率上，连沉默都是对话',
  },
  growth: {
    dynamics: '和 TA 在一起，你不得不面对自己最不愿意面对的那一面。不是 TA 在逼你，而是 TA 的存在本身就在照见你的阴影。',
    conflict: '成长是痛的。你们在一起会触发很多旧伤，会吵架，会觉得「为什么跟 TA 在一起这么累」。但这些累是有意义的。',
    advice: '痛是信号，不是终点。如果你在这段关系里变好了，那就是值得的。',
    bondTagline: '你们是彼此的茧，也是彼此的翅膀',
  },
  harmony: {
    dynamics: '和 TA 在一起很舒服。不需要表演，不需要用力，就像窝在沙发上听雨。你们的关系不需要太多戏剧性，因为平淡本身就是奢侈品。',
    conflict: '舒适区的陷阱是停滞。当「舒服」变成「无所谓」，你们可能会发现已经很久没有一起做过什么有意义的事了。',
    advice: '偶尔制造一点小惊喜。舒服不等于无聊，平淡也可以有仪式感。',
    bondTagline: '最好的关系，是没有故事的关系',
  },
  friction: {
    dynamics: '你们之间总有一股无形的张力。可能是太像了在争同一个位置，也可能是太不一样了总在互相否定。',
    conflict: '摩擦会磨损感情。如果你们不学会有意识地暂停和修复，每一次小摩擦都会在关系表面留下划痕。',
    advice: '承认摩擦的存在，而不是假装没事。有时候最好的策略是退一步，给彼此空间重新充电。',
    bondTagline: '不是所有的摩擦都是坏事，有些摩擦是在磨出光',
  },
  balance: {
    dynamics: '你们像跷跷板的两端。一个人强势的时候另一个会退让，一个人脆弱的时候另一个会撑起来。这种动态平衡是你们的默契。',
    conflict: '跷跷板的危险是永远不对等。如果总是一个人退让，时间久了「平衡」就会变成「委屈」。',
    advice: '定期校准。确保你们不是一个人永远在妥协，而是在不同事情上轮流做那个「退一步」的人。',
    bondTagline: '你们在进退之间，找到了自己的节奏',
  },
  depth: {
    dynamics: '你们的关系不是一眼能看穿的。表面上可能没什么特别，但越往深处走，越发现彼此有别人看不到的那一面。',
    conflict: '深度关系需要时间，也需要耐心。在快节奏的生活里，你们可能会觉得「为什么和 TA 的关系推进这么慢」。',
    advice: '慢就是快。不要急着让关系「达标」，让它自然沉淀。',
    bondTagline: '你们的关系是深海，表面平静，底下是整个世界',
  },
  mystery: {
    dynamics: '很难用逻辑解释你们的关系。明明性格差很远，但就是莫名地合拍。或者明明条件不搭，但命运偏偏把你们推到一起。',
    conflict: '神秘感的反面是不确定性。你们可能搞不清楚这段关系到底是什么，要往哪里走。',
    advice: '有些关系不需要定义。享受这条命运暗线带来的惊喜，不必急着给它命名。',
    bondTagline: '说不清的关系，往往是最深的那种',
  },
};

// ── Per-archetype personality-pair-specific variations ─────────────
// For especially interesting combinations, override the template.

interface PairVariation {
  pair: string; // sorted "slug1+slug2"
  dynamics: string;
  conflict: string;
  advice: string;
  bondTagline: string;
}

const PAIR_VARIATIONS: PairVariation[] = [
  // ── 控制组内部 ──
  { pair: 'boss+ctrl', dynamics: '你们两个人都想当方向盘。一个在排兵布阵，一个在精确执行，表面上看是高效组合，实际上是两套指挥系统在同一条船上。', conflict: '最大的风险是内耗。当意见不一致的时候，没有人愿意先退，因为退就意味着「我管不了你」。', advice: '明确分工。谁管战略谁管执行，写下来，不要靠默契。', bondTagline: '两把方向盘，一辆车，考验的是信任' },

  // ── 情感组经典 ──
  { pair: 'mum+simp', dynamics: '一个操碎了心，一个付出了全部。你们都是「给」的人，所以在一起会觉得终于有人理解自己的辛苦。', conflict: '但两个人都在给，谁来接？当你们都觉得自己付出更多时，委屈感会同时爆发。', advice: '学会接受，而不是只会给予。有时候说「我需要你帮帮我」比默默付出更有力量。', bondTagline: '两颗操碎的心，需要学会互相心疼' },
  { pair: 'love-r+emo', dynamics: '你们是言情小说的真人版。上头体质遇上碎了又粘，心动频率同步，感觉全世界都在为你们放 BGM。', conflict: '两个高敏感情绪体在一起，好的时候烟花绽放，但一旦一方情绪低落，另一个人会被迅速拖下去。', advice: '给彼此的情绪装一个安全阀。约定一个暗号，当一方需要独处充电的时候，不用解释就能暂停。', bondTagline: '你们的心跳是同一首歌的两个声部' },

  // ── 表达组经典 ──
  { pair: 'drama+joker', dynamics: '一个情绪核弹加一个陪笑护法，你们的日常就是一出即兴喜剧。走到哪里哪里就是舞台。', conflict: '但舞台背后都是空虚。当 DRAMA 需要认真被倾听的时候，JOKER 可能还在用笑话回避。', advice: '偶尔放下表演。不是每一次对话都需要效果，有时候安静地抱一下比说一百句段子管用。', bondTagline: '最好的喜剧搭档，也是最懂彼此孤独的人' },
  { pair: 'party+drunk', dynamics: '一个气氛焊接工加一个酒后真人，你们的友谊建立在「今晚去哪嗨」的基础之上。和你们在一起永远不无聊。', conflict: '但派对散场之后呢？当灯光暗下来，你们是否还愿意面对彼此卸下面具的样子？', advice: '试试在「不嗨」的状态下相处。一起吃个安静的早饭，看看没有酒精和音乐的时候，你们聊什么。', bondTagline: '酒杯碰在一起的时候，你们是真的开心' },

  // ── 对立经典 ──
  { pair: 'boss+rebel', dynamics: '皇帝遇上塔，指挥官遇上反骨仔。你们之间的吸引力是核弹级别的——因为 TA 是你最想驯服的野兽，而你是 TA 最想推翻的高墙。', conflict: '但驯服和推翻都不会真正发生。BOSS 会越管越紧，REBEL 会越跑越远，直到筋疲力尽。', advice: '学会「不管」。BOSS 最大的功课是接受有些事情不归你管，REBEL 最大的功课是发现服从有时候也是一种自由。', bondTagline: '你们是彼此最想征服的那座山' },
  { pair: 'solo+party', dynamics: '一米结界遇上气氛焊接工，一个在角落充电，一个在舞池放电。你们看起来完全不搭，但恰恰因为如此，你们能给对方一个全新的世界。', conflict: 'SOLO 会觉得 PARTY 太吵了，PARTY 会觉得 SOLO 太闷了。谁都不愿意走进对方的舒适区。', advice: '不要试图把对方拉到自己的世界，而是偶尔走进 TA 的世界看看。PARTY 教 SOLO 享受人群，SOLO 教 PARTY 享受安静。', bondTagline: '你是灯塔，TA 是船，你们照亮彼此的航程' },

  // ── 特殊组合 ──
  { pair: 'emo+dior-s', dynamics: '碎了又粘遇上躺平先驱，你们都看透了一些东西。一个看透了情绪的无常，一个看透了竞争的虚无。在一起有一种「终于有人跟我一样厌倦了」的解脱感。', conflict: '但厌倦不等于解决问题。你们可能会一起沉入一种「什么都不想做」的共振里，越陷越深。', advice: '看透之后还要走出来。约好一起做一件小事，不需要意义，只是行动本身。', bondTagline: '两个想通了的人，一起学着重新活' },
  { pair: 'chill+luck-y', dynamics: '佛到没电遇上欧气溢出，你们的关系轻松到不像真的。一个随遇而安，一个运气爆棚，人生像开了简单模式。', conflict: '但轻松的关系也有隐忧。当危机真正来临的时候，你们有没有应对的能力？毕竟运气不会永远在。', advice: '趁好的时候存一点「硬实力」。关系不只需要松弛，也需要偶尔认真经营。', bondTagline: '最好的运气，是遇到一个让你放松的人' },
  { pair: 'nerd+talk-er', dynamics: '人间收藏夹遇上嘴巴关不上，一个囤了2000个知识等显化，一个嘴比脑子快0.5秒。你们简直是内容创作者的梦幻组合。', conflict: '但 NERD 会觉得 TALK-er 太浮躁，TALK-er 会觉得 NERD 太慢。一个在想，一个在说，节奏永远对不上。', advice: 'NERD 的知识需要 TALK-er 来传播，TALK-er 的表达需要 NERD 来沉淀。各取所长，别互相嫌弃。', bondTagline: '一个负责深，一个负责广，合在一起就是完整的' },
  { pair: 'sleep+chill', dynamics: '再睡五分钟遇上佛到没电，你们可能是全宇宙最躺的组合。沙发是你们的王国，外卖是你们的供奉。', conflict: '但两个都躺的人在一起，问题不会自动解决。当现实的敲门声响起，你们可能都假装没听见。', advice: '偶尔拉对方起来。不用做大事，一起出去走走就很好。', bondTagline: '全世界最舒服的关系，也可能需要偶尔站起来' },
  { pair: 'game-r+sexy', dynamics: '再来一把遇上被动钓鱼，一个在虚拟世界征服一切，一个在现实世界自动吸睛。你们各自的领域都是王者，交叉的时候火花四溅。', conflict: '但 GAME-r 的世界在屏幕里，SEXY 的魅力在线下。你们可能会发现彼此的「战场」根本不在同一个空间。', advice: '试着进入对方的主场。GAME-r 带 SEXY 体验一次心流，SEXY 带 GAME-r 出一次门。', bondTagline: '你们各自是王，合在一起是双王' },
];

// Build pair variation lookup
const PAIR_VARIATION_MAP = new Map<string, PairVariation>();
for (const v of PAIR_VARIATIONS) {
  PAIR_VARIATION_MAP.set(v.pair, v);
}

// ── Public API ────────────────────────────────────────────────────

export function getRelationshipArchetype(slugA: string, slugB: string): RelationshipArchetype {
  const groupA = getGroup(slugA);
  const groupB = getGroup(slugB);
  const key = pairKey(groupA, groupB);
  const archetypeId = GROUP_PAIR_ARCHETYPE[key] ?? 'mystery';
  return ARCHETYPES[archetypeId];
}

export function getDualInterpretation(
  slugA: string,
  slugB: string,
  _dataA: MystiTarotData,
  _dataB: MystiTarotData,
): DualInterpretation {
  const archetype = getRelationshipArchetype(slugA, slugB);
  const pairKeyStr = [slugA, slugB].sort().join('+');

  // Check for specific pair variation first
  const variation = PAIR_VARIATION_MAP.get(pairKeyStr);
  if (variation) {
    return {
      archetype,
      dynamics: variation.dynamics,
      conflict: variation.conflict,
      advice: variation.advice,
      bondTagline: variation.bondTagline,
    };
  }

  // Fall back to archetype template
  const template = TEMPLATES[archetype.id];
  return {
    archetype,
    dynamics: template.dynamics,
    conflict: template.conflict,
    advice: template.advice,
    bondTagline: template.bondTagline,
  };
}
