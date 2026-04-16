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
  detailedDynamics: string;
}

const TEMPLATES: Record<RelationshipArchetypeId, InterpretationTemplate> = {
  mirror: {
    dynamics: '你们太像了。思维方式、情感节奏、甚至逃避问题的方式都如出一辙。在一起的时候有一种「终于被理解了」的安全感。',
    conflict: '但也因为太像，你们的弱点会被无限放大。你不敢面对的，TA 也在躲。两个人一起躲，问题就永远在那里。',
    advice: '镜子照见的是自己。学会在对方身上看到自己的盲区，而不是只看到认同。',
    bondTagline: '你们是彼此的倒影，也是彼此的课题',
    detailedDynamics: '你们像两面镜子面对面放置，无限反射中看见彼此最真实的样子。思维方式如出一辙，连怪癖都惊人地相似——一个用左手转笔，另一个刚好是右撇子。这种默契不需要培养，像是出厂设置就写好的代码。但镜子的宿命是：你看到的每一面美好，背后都藏着一个同样的阴影。',
  },
  complement: {
    dynamics: '你缺的那一块，TA 刚好多出来。你往前冲的时候 TA 在后面稳住，TA 发散的时候你负责收拢。你们在一起比单独一个人强。',
    conflict: '互补的反面是「为什么你不能跟我一样」。当你们试图改变对方而不是信任对方的特长时，拼图就开始脱落。',
    advice: '不要试图把对方变成自己。你们的价值恰恰在于「不一样」。',
    bondTagline: '两块不同的拼图，严丝合缝',
    detailedDynamics: '你们是宇宙精心调配的配方。你缺的维生素刚好是 TA 的超能力，TA 的短板刚好是你最擅长的领域。当你们各司其职的时候，就像左手弹琴右手打鼓——一个人做不到的事情，两个人变成了本能。但拼图最怕的是有人想改变自己的形状，那会让整幅画面散架。',
  },
  collision: {
    dynamics: '你们在一起就是火药遇上了火星。刺激、上头、充满化学反应。每一次对话都像在打辩论赛，但结束后又觉得「好爽」。',
    conflict: '碰撞的代价是烧伤。当新鲜感退去，剩下的就是两个不肯让步的人在互相消耗。谁先低头成了最大的难题。',
    advice: '把碰撞当成打磨，而不是战争。每次争执都是在帮对方去掉多余的部分。',
    bondTagline: '每一次碰撞，都在重塑彼此的形状',
    detailedDynamics: '你们相遇的那一刻，空气里就开始噼里啪啦地放电。对话永远像辩论赛，观点永远在碰撞，但碰撞的火花让你们都变得更锋利。TA 激活了你身上沉睡的某个部分，你让 TA 看到了自己从没想过的角度。这种关系注定不会平淡——要么锻造出钻石，要么烧成灰烬，取决于你们如何驾驭这团火。',
  },
  nurture: {
    dynamics: '你们的关系有一种天然的「给」和「接」。一个人提供能量，一个人接住它。不需要刻意经营，流动就是你们的节奏。',
    conflict: '给的那个人会累，接的那个人会依赖。当「给」变成义务，「接」变成理所当然，滋养就变成了透支。',
    advice: '滋养是双向的。接的人要学会回流，给的人要学会开口要。',
    bondTagline: '你是土壤，TA 是种子，你们让彼此开花',
    detailedDynamics: '你们的关系像一条隐秘的河流，从一个人的心里流向另一个人的心里。给予者找到了存在的意义，接受者感受到了被托住的安全。这种滋养不需要刻意，像是春风过境自然而然。但河流的危险在于：如果只流向一个方向，源头终会枯竭，下游终会泛滥。',
  },
  resonance: {
    dynamics: '不需要解释太多。你说上半句 TA 就知道下半句，你还没开口 TA 就已经感觉到了。这种默契不是培养出来的，是天生的。',
    conflict: '共鸣也会变成共振。当两个人的情绪同频放大，好的时候加倍好，但低谷的时候会一起坠入深渊，谁也拉不动谁。',
    advice: '学会在共鸣中保留自己的独立振幅。不需要每次都同频，有时候错开反而是保护。',
    bondTagline: '你们在同一个频率上，连沉默都是对话',
    detailedDynamics: '你们是两把调到相同频率的音叉，轻轻一碰就全身共鸣。不需要语言，一个眼神就能完成一场完整的对话。TA 的情绪你第一时间就能感知，你的沉默 TA 也能翻译成句子。但共鸣的诅咒是：你们的情绪会互相放大。两杯水倒在一起，清的更清，浊的更浊。',
  },
  growth: {
    dynamics: '和 TA 在一起，你不得不面对自己最不愿意面对的那一面。不是 TA 在逼你，而是 TA 的存在本身就在照见你的阴影。',
    conflict: '成长是痛的。你们在一起会触发很多旧伤，会吵架，会觉得「为什么跟 TA 在一起这么累」。但这些累是有意义的。',
    advice: '痛是信号，不是终点。如果你在这段关系里变好了，那就是值得的。',
    bondTagline: '你们是彼此的茧，也是彼此的翅膀',
    detailedDynamics: '这段关系是一面不讲情面的镜子，照出你一直在躲避的那部分自己。TA 不是在故意找茬，而是 TA 的存在本身就是一面放大镜，让所有你以为藏好了的不安、恐惧、旧伤都无所遁形。你们会吵架，会疲惫，会怀疑——但每一次熬过去，你都会发现自己变得比昨天更完整。痛是破茧的声音。',
  },
  harmony: {
    dynamics: '和 TA 在一起很舒服。不需要表演，不需要用力，就像窝在沙发上听雨。你们的关系不需要太多戏剧性，因为平淡本身就是奢侈品。',
    conflict: '舒适区的陷阱是停滞。当「舒服」变成「无所谓」，你们可能会发现已经很久没有一起做过什么有意义的事了。',
    advice: '偶尔制造一点小惊喜。舒服不等于无聊，平淡也可以有仪式感。',
    bondTagline: '最好的关系，是没有故事的关系',
    detailedDynamics: '和 TA 在一起就像躺在一片云上——没有压力，没有表演，连沉默都是舒服的。你们不需要费力经营，因为自然就是你们的底色。这种关系在朋友圈里可能没什么好晒的，但正是这种「没什么好说的」，才是最难得的。平淡不是空洞，是一种确认：即使什么都不做，我依然想和你待在一起。',
  },
  friction: {
    dynamics: '你们之间总有一股无形的张力。可能是太像了在争同一个位置，也可能是太不一样了总在互相否定。',
    conflict: '摩擦会磨损感情。如果你们不学会有意识地暂停和修复，每一次小摩擦都会在关系表面留下划痕。',
    advice: '承认摩擦的存在，而不是假装没事。有时候最好的策略是退一步，给彼此空间重新充电。',
    bondTagline: '不是所有的摩擦都是坏事，有些摩擦是在磨出光',
    detailedDynamics: '你们的关系像两块石头在同一条河里被水流推着互相碰撞。可能是性格太像在争同一个位置，也可能是价值观太不同总在互相否定。这种张力是真实的，不会因为假装看不见就消失。但石头被水流打磨久了也会变光滑——关键是你们愿不愿意承受这个过程。',
  },
  balance: {
    dynamics: '你们像跷跷板的两端。一个人强势的时候另一个会退让，一个人脆弱的时候另一个会撑起来。这种动态平衡是你们的默契。',
    conflict: '跷跷板的危险是永远不对等。如果总是一个人退让，时间久了「平衡」就会变成「委屈」。',
    advice: '定期校准。确保你们不是一个人永远在妥协，而是在不同事情上轮流做那个「退一步」的人。',
    bondTagline: '你们在进退之间，找到了自己的节奏',
    detailedDynamics: '你们是天平的两端，永远在寻找那个微妙的平衡点。一个人退的时候另一个人进，一个人脆弱的时候另一个人刚好坚强。这种动态平衡不需要商量，像是身体的本能反应。但天平最怕的是一端永远下沉——当「退让」变成「被消耗」，平衡就会变成一种精致的不平等。',
  },
  depth: {
    dynamics: '你们的关系不是一眼能看穿的。表面上可能没什么特别，但越往深处走，越发现彼此有别人看不到的那一面。',
    conflict: '深度关系需要时间，也需要耐心。在快节奏的生活里，你们可能会觉得「为什么和 TA 的关系推进这么慢」。',
    advice: '慢就是快。不要急着让关系「达标」，让它自然沉淀。',
    bondTagline: '你们的关系是深海，表面平静，底下是整个世界',
    detailedDynamics: '你们的关系是一座冰山，水面上的部分看起来普通得不能再普通——一起吃饭、偶尔聊天、没什么特别的戏剧性。但水下是一个庞大的世界，藏着只有你们彼此才看得到的暗流和珊瑚。这种关系不会在朋友圈炸开，但会在时间里慢慢生长。深海的好处是：即使海面风浪再大，底下依然安静。',
  },
  mystery: {
    dynamics: '很难用逻辑解释你们的关系。明明性格差很远，但就是莫名地合拍。或者明明条件不搭，但命运偏偏把你们推到一起。',
    conflict: '神秘感的反面是不确定性。你们可能搞不清楚这段关系到底是什么，要往哪里走。',
    advice: '有些关系不需要定义。享受这条命运暗线带来的惊喜，不必急着给它命名。',
    bondTagline: '说不清的关系，往往是最深的那种',
    detailedDynamics: '你们的关系像是宇宙写的一道谜题——按理说不该合拍，但就是莫名其妙地对上了。可能是星座不合但灵魂相认，可能是性格南辕北辙但默契满分。这种关系让逻辑失效，让理性沉默。你不需要解释给任何人听，因为连你自己也说不清——但说不清的东西，往往才是最真的。',
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

  // ── 高概率：情感组交叉 ──
  { pair: 'love-r+mum', dynamics: '上头体质遇上操心破产户，一个三天一个坠入爱河，一个已经开始查星座配对和规划未来了。你们的恋爱节奏是：TA 刚点火，你已经到终点站了。', conflict: '上头快的人退潮也快，而操心的人已经把全部身家押上了。当 LOVE-r 的热情消退，MUM 会觉得自己被辜负了。', advice: 'MUM 学会慢一点，给爱留出呼吸的空间。LOVE-r 学会稳一点，让对方感受到你的认真不只是三分钟热度。', bondTagline: '一个负责上头，一个负责收尾，刚好是一整套流程' },
  { pair: 'mum+than-k', dynamics: '两个「付出型」的灵魂相遇了。一个操碎了心，一个感恩戴德，你们在一起就是一场大型「你辛苦了」和「谢谢你的」循环播放。', conflict: '但两个人都在给，谁来接？当付出变成习惯，接受变成负担，你们可能会在「我为你好」的死循环里转圈。', advice: '试着理直气壮地接受对方的好。不需要每次都还回去，有时候安心收下就是最大的回馈。', bondTagline: '两颗操碎的心，终于遇到了懂自己辛苦的人' },
  { pair: 'atm-er+simp', dynamics: '行走提款机遇上倒贴甲方，你们的关系简直是一场财务自由的双向奔赴。一个永远在给，一个永远在花，但神奇的是双方都觉得自己赚到了。', conflict: '但无底洞终会见底。当一方的付出超过承受能力，而另一方还没学会「够了」的时候，钱包会先于感情崩盘。', advice: '给的人学会设限，花的人学会感恩。爱不等于无限额度，有时候节制也是一种深情。', bondTagline: '你们是彼此的无底洞，也是彼此的宝藏' },

  // ── 高概率：控制 × 情感 ──
  { pair: 'boss+mum', dynamics: '人形方向盘遇上操心破产户，一个要掌控全局，一个要照顾所有人。你们的组合像是一台有两套操作系统的机器——表面上运转良好，底层一直在抢权限。', conflict: 'BOSS 觉得 MUM 管太多，MUM 觉得 BOSS 不够体贴。当「为你好」遇上「听我的」，爱就变成了权力斗争。', advice: '把「控制」翻译成「在乎」。BOSS 的严苛是另一种关心，MUM 的唠叨是另一种爱。学会翻译彼此的语言。', bondTagline: '你是方向盘，TA 是安全带，少了谁都不行' },
  { pair: 'ctrl+mum', dynamics: '人形KPI遇上操心破产户，你们在一起就像在经营一家公司——一个管流程，一个管人心。效率惊人，但温度计的读数可能不太高。', conflict: 'CTRL 觉得 MUM 太感情用事，MUM 觉得 CTRL 太不近人情。当理性的表格遇上感性的唠叨，谁也说服不了谁。', advice: '数据不能解决所有问题。CTRL 学会放下表格关心一下人，MUM 学会接受有些事情不需要情绪介入。', bondTagline: '你是流程，TA 是人情，合在一起才是完整的管理' },
  { pair: 'boss+simp', dynamics: '皇帝遇上卑微的人，一个在发号施令，一个在积极响应。你们的关系有一种奇妙的不对称美——BOSS 找到了最忠实的臣民，SIMP 找到了最值得追随的王。', conflict: '但不对称终会失衡。当 BOSS 把 SIMP 的付出当成理所当然，当 SIMP 的卑微变成自我牺牲，爱就成了单方面的朝贡。', advice: 'BOSS 学会低头看看那个为你弯腰的人。SIMP 学会站直，你的价值不取决于谁认可你。', bondTagline: '你给 TA 方向，TA 给你忠诚，前提是别忘了彼此的名字' },

  // ── 高概率：表达组组合 ──
  { pair: 'drama+talk-er', dynamics: '情绪核弹遇上嘴巴关不上，你们在一起就是一档真人秀。每一场争论都是大型直播，每一个表情包都是高清无码。', conflict: '但话说太多会变成噪音。当 DRAMA 需要安静消化情绪的时候，TALK-er 还在分析「你为什么难过」——有时候闭嘴就是最好的安慰。', advice: 'TALK-er 学会在对方情绪爆发的时候只做一件事：陪着。DRAMA 学会说「我现在只需要你在」而不是让对方猜。', bondTagline: '你的核弹爆炸的时候，TA 是唯一不会逃跑的人' },
  { pair: 'party+joker', dynamics: '气氛焊接工遇上陪笑护法，你们是派对的黄金搭档。有你们在的地方永远不会冷场——一个负责点燃全场，一个负责维护笑声不灭。', conflict: '但派对的尽头是孤独。当音乐停下，灯光暗下来，你们是否还能在没有观众的时候做真实的自己？', advice: '试试一场只有两个人的派对。关掉音乐，放下段子，看看沉默里的对方是什么样子。', bondTagline: '全世界最会搞气氛的两个人，也值得拥有安静的拥抱' },
  { pair: 'talk-er+joker', dynamics: '两个嘴上功夫了得的人，你们的对话永远不会掉到地上。一个话多到停不下来，一个随时能接梗翻盘——聊天记录可以出书。', conflict: '但两张嘴都太快了，谁在听？当你们都在等对方说完自己好开口的时候，真正的沟通就消失了。', advice: '轮流做听众。今天你闭嘴听 TA 说完，明天 TA 闭嘴听你说完。真正的对话是一来一回，不是两列火车并行。', bondTagline: '你们是彼此最好的听众，前提是谁先闭嘴' },

  // ── 高概率：表达 × 其他 ──
  { pair: 'drunk+party', dynamics: '酒后真人遇上气氛焊接工，你们的友谊建立在「今晚去哪嗨」的基础之上。有酒精和 PARTY 的地方，就有你们的故事。', conflict: '但派对散场之后呢？当灯光暗下来，你们是否还愿意面对彼此卸下面具的样子？', advice: '试试在「不嗨」的状态下相处。一起吃个安静的早饭，看看没有酒精和音乐的时候，你们聊什么。', bondTagline: '酒杯碰在一起的时候，你们是真的开心' },

  // ── 高概率：对立吸引 ──
  { pair: 'nerd+party', dynamics: '人间收藏夹遇上气氛焊接工，一个在家整理书架，一个在外点燃全场。你们看起来像两个世界的人——但 NERD 的好奇心和 PARTY 的感染力，刚好能打开彼此的开关。', conflict: 'NERD 觉得 PARTY 太吵太浮躁，PARTY 觉得 NERD 太宅太无聊。你们最大的挑战是：愿不愿意走进对方的世界看一看？', advice: 'NERD 教 PARTY 享受一个安静的下午，PARTY 教 NERD 在人堆里找到乐趣。不要改变对方，偶尔打开自己的门就够了。', bondTagline: '你是书架，TA 是舞台，交叉的地方是一场惊喜' },
  { pair: 'shy+drama', dynamics: '社恐晚期遇上情绪核弹，一个躲在角落里观察世界，一个站在中间让全世界看到自己。你们像两颗完全不同轨道的行星——但偶尔交汇的时候，引力惊人。', conflict: 'SHY 觉得 DRAMA 太大声了，DRAMA 觉得 SHY 太安静了。当 DRAMA 需要观众而 SHY 需要隐身衣的时候，你们可能找不到共同的频率。', advice: 'SHY 不需要变成 DRAMA，但可以学会在安全的人面前放声大笑。DRAMA 不需要变安静，但可以学会在 SHY 面前轻声说话。', bondTagline: '一个在台上，一个在台下，但你们看的是同一场戏' },
  { pair: 'chill+boss', dynamics: '佛到没电遇上人形方向盘，一个在沙发上躺平，一个在疯狂规划下一步。你们的日常是：BOSS 在排兵布阵，CHILL 在问「今天吃啥」。', conflict: 'BOSS 会被 CHILL 的「无所谓」逼疯，CHILL 会被 BOSS 的「必须做」压垮。一个觉得对方太累，一个觉得对方太懒。', advice: 'BOSS 学会放下方向盘坐下来，发现沙发其实挺舒服的。CHILL 学会偶尔站起来，发现动起来的感觉也没那么差。', bondTagline: '你是油门，TA 是刹车，合在一起才是安全驾驶' },

  // ── 高概率：敏感/情感 ──
  { pair: 'emo+mum', dynamics: '碎了又粘遇上操心破产户，你们的关系像是一场漫长的康复疗程。EMO 的碎片需要被捡起来，MUM 恰好是那个永远弯腰的人。', conflict: '但操心的人也有极限。当 MUM 自己也需要被照顾的时候，EMO 可能还在碎片堆里没爬出来。', advice: 'EMO，学会在 MUM 累的时候反过来抱住 TA。MUM，学会承认自己也有脆弱的时候——你不需要永远坚强。', bondTagline: '你碎的时候，TA 粘；TA 累的时候，换你来抱' },
  { pair: 'emo+simp', dynamics: '碎了又粘遇上倒贴甲方，你们在一起像两个需要被爱的灵魂在互相取暖。EMO 的情绪碎片被 SIMP 一片片捡起来，SIMP 的付出被 EMO 当成全世界。', conflict: '但两个都需要被爱的人在一起，谁来做那个先给予的人？当双方都在索取安全感的时候，关系会变成一场精疲力竭的追逐。', advice: '你们都是珍贵的。不需要向对方证明「我值得被爱」，因为你本来就是。学会先爱自己，才能更好地爱对方。', bondTagline: '两个碎片合在一起，刚好是一颗完整的心' },
  { pair: 'than-k+emo', dynamics: '谢谢你骂我遇上碎了又粘，一个用毒舌表达关心，一个用碎片记录感受。THAN-k 的直言不讳刚好能刺破 EMO 的自我封闭——虽然过程很痛。', conflict: '但 THAN-k 的话太锋利了，EMO 的碎片太脆弱了。一句「我是为你好」可能会让 EMO 的碎片散一地。', advice: 'THAN-k，你的毒舌要裹一层糖衣。EMO，那些刺耳的话里可能藏着最真的关心——学会过滤而不是全部接收。', bondTagline: '你的话是刀，TA 的心是纸，学会在刀尖上跳舞' },

  // ── 高概率：幸运/躺 ──
  { pair: 'chill+sleep', dynamics: '佛到没电遇上再睡五分钟，你们可能是全宇宙最躺的组合。沙发是你们的王国，外卖是你们的供奉，「再躺一会儿」是你们的口头禅。', conflict: '但两个都躺的人在一起，问题不会自动解决。当现实的敲门声响起，你们可能都假装没听见。', advice: '偶尔拉对方起来。不用做大事，一起出去走走就很好。', bondTagline: '全世界最舒服的关系，也可能需要偶尔站起来' },
  { pair: 'luck-y+party', dynamics: '欧气溢出遇上气氛焊接工，你们在一起就像开了外挂的派对。LUCK-y 带来好运，PARTY 带来氛围，走到哪里哪里就有好事发生。', conflict: '但好运不是永远的。当 LUCK-y 的欧气用完了，PARTY 还在期待下一场狂欢——谁来为落差买单？', advice: '趁欧气在线的时候多攒一些美好的回忆。等到运气暂时离线的时候，这些回忆就是你们的续航电池。', bondTagline: '你是运气，TA 是派对，合在一起就是最好的周末' },

  // ── 高概率：反骨/控制 ──
  { pair: 'rebel+ctrl', dynamics: '反骨仔遇上人形KPI，一个要打破一切规则，一个要建立一切秩序。你们在一起就像一场永不停歇的拔河——但奇怪的是，你们谁都不想松手。', conflict: 'CTRL 会越管越紧，REBEL 会越跑越远。当「为了你好」遇上「别管我」，爱就变成了囚笼和越狱。', advice: 'CTRL 学会信任，不是所有事情都需要管控。REBEL 学会担当，有些规则是保护不是束缚。', bondTagline: '你是规则，TA 是例外，你们教会彼此什么是自由' },
  { pair: 'woc+drama', dynamics: '吃瓜专业户遇上情绪核弹，你们在一起的日常就是一场大型真人秀。WOC 负责收集瓜，DRAMA 负责把瓜炸开花——朋友圈的流量密码被你们拿捏了。', conflict: '但瓜吃太多会上火。当 WOC 的八卦触及 DRAMA 的底线，情绪核弹会直接在你们之间爆炸。', advice: '有些瓜不该吃。WOC 学会闭嘴，不是所有事情都需要声张。DRAMA 学会消化，不是所有情绪都需要表演。', bondTagline: '你是瓜田，TA 是烟花，小心别把自己炸了' },

  // ── 高概率：放纵组 ──
  { pair: 'food-ie+sexy', dynamics: '卡路里文盲遇上被动钓鱼，一个在火锅前无法自拔，一个在社交场合自动发光。你们的组合是——SEXY 负责貌美如花，FOOD-ie 负责吃垮 TA。', conflict: '但 FOOD-ie 的快乐建立在「吃」上，SEXY 的魅力建立在「控制」上。当两个人对「自律」的理解完全不同，餐桌就是战场。', advice: 'FOOD-ie 带 SEXY 放纵一次，SEXY 带 FOOD-ie 体验一次克制的快感。不要试图改变对方的快乐模式。', bondTagline: '你负责吃，TA 负责好看，合在一起就是最好的约会' },
  { pair: 'game-r+sleep', dynamics: '再来一把遇上再睡五分钟，你们的时间黑洞组成了宇宙最强的拖延联盟。一个永远在「最后一局」，一个永远在「再睡一会儿」——时间在你们这里是最不值钱的东西。', conflict: '但拖延的尽头是焦虑。当 DEADLINE 来敲门，你们可能还在互相安慰「明天再说」。', advice: '约定一个「认真时间」。每天/每周留出固定的几个小时，把游戏和床都关掉，面对真实世界。', bondTagline: '你们是全世界最会享受当下的两个人——也可能是最会逃避未来的' },
  { pair: 'fake+malo', dynamics: '下班发疯遇上班味永存，一个下了班就原形毕露，一个上了班也散发着「不想干」的气息。你们在一起就是职场最真实的写照——苦中作乐是你们的生存技能。', conflict: '但「发疯」和「班味」都是逃避。当逃避变成习惯，你们可能会发现已经很久没有认真面对过任何事情了。', advice: '偶尔假装认真一次。发疯归发疯，但你们值得拥有一个不需要逃的现实。', bondTagline: '你是下班后的面具，TA 是上班时的灵魂，你们是同一个人的两面' },

  // ── 特殊有趣组合 ──
  { pair: 'chill+dior-s', dynamics: '佛到没电遇上躺平先驱，你们是宇宙中最默契的躺平搭档。一个已经懒得动了，一个从一开始就没打算动——沙发是你们共同的精神家园。', conflict: '但两个都放弃的人在一起，谁来拉谁？当「算了」变成口头禅，你们可能会一起错过一些真正重要的事情。', advice: '躺着没问题，但偶尔一起翻个身。不用做什么大事，至少看看窗外的风景还在不在。', bondTagline: '全世界最默契的两个人，连躺平的姿势都一样' },
  { pair: 'boss+dior-s', dynamics: '人形方向盘遇上躺平先驱，BOSS 在疯狂踩油门，DIOR-s 直接把车钥匙扔了。你们在一起就像一场关于「人生该不该努力」的永恒辩论。', conflict: 'BOSS 觉得 DIOR-s 在浪费生命，DIOR-s 觉得 BOSS 在浪费生命。谁也没错，但谁也说服不了谁。', advice: 'BOSS，有时候躺平是一种智慧。DIOR-s，有时候站起来是一种选择。你们可以互相尊重彼此的活法。', bondTagline: '你踩油门，TA 拔钥匙，但你们坐在同一辆车上' },
  { pair: 'emo+chill', dynamics: '碎了又粘遇上佛到没电，一个内心风暴不断，一个表面风平浪静。CHILL 的平静刚好能中和 EMO 的波涛——像一块浮木，让碎片有个歇脚的地方。', conflict: '但 CHILL 的「无所谓」可能会让 EMO 觉得不被理解。当 EMO 需要有人陪着痛的时候，CHILL 的冷静像一盆冷水。', advice: 'CHILL，不需要解决 EMO 的问题，只需要在旁边安静地陪着。EMO，CHILL 的平静不是冷漠，是一种「我在这里」的无声承诺。', bondTagline: '你是风暴，TA 是港湾，你们是彼此的安全感' },
  { pair: 'nerd+shy', dynamics: '人间收藏夹遇上社恐晚期，你们在一起就像两只安静的小动物在同一个树洞里取暖。不需要说话，各看各的书就很好。', conflict: '但两个都不说话的人在一起，沉默可能会变成隔阂。当重要的事情需要讨论的时候，你们可能都在等对方先开口。', advice: '给对方写小纸条。不擅长说话没关系，文字也是一种表达。重要的是不要让沉默变成距离。', bondTagline: '你们不需要说话，安静待着就是最深的连接' },
  { pair: 'talk-er+drunk', dynamics: '嘴巴关不上遇上酒后真人，你们在一起就是一场永不停歇的深夜脱口秀。酒精打开了话匣子，TALK-er 的嘴永远不会冷场——酒桌上的记录可以出回忆录了。', conflict: '但酒后吐真言有时候是灾难。当 TALK-er 把醉酒时说的话带到清醒的时候，有些话可能已经收不回来了。', advice: '喝酒前约定一个「酒话不算数」的规则。享受微醺时的坦诚，但清醒时要给彼此留一点余地。', bondTagline: '酒醒之后的话，才是真正的承诺' },
  { pair: 'sexy+love-r', dynamics: '被动钓鱼遇上上头体质，你们在一起就像偶像剧的第一集。SEXY 的魅力让 LOVE-r 光速上头，LOVE-r 的热情让 SEXY 觉得自己是全世界最特别的人。', conflict: '但上头的火焰来得快去得也快。当 LOVE-r 的热情三周后消退，SEXY 会发现自己从「全世界最特别」变成了「已读不回」。', advice: 'SEXY，不要太快交出全部筹码。LOVE-r，学会长跑而不是只有百米冲刺。慢一点的火，烧得更久。', bondTagline: '你是火，TA 是蛾子——但谁说蛾子不能变成凤凰？' },
  { pair: 'luck-y+love-r', dynamics: '欧气溢出遇上上头体质，你们的爱情就像开了幸运buff。表白的时候刚好下雨浪漫得要命，吵架的时候刚好停电只能抱在一起——命运在帮你们撒糖。', conflict: '但运气不能当饭吃。当好运退潮，你们会发现除了「感觉对了」之外，可能还没有建立起真正稳固的连接。', advice: '趁欧气在线多积累一些实质的默契。运气是加分项，不是基础分——基础分要靠两个人一起写。', bondTagline: '最好的运气，是在对的时间遇到对的人' },
  { pair: 'atm-er+emo', dynamics: '行走提款机遇上碎了又粘，ATM-er 的付出刚好能粘合 EMO 的碎片。每一次转账都是一句「我在乎你」，每一份礼物都是一片新的胶带。', conflict: '但钱不能粘合所有的碎片。当 EMO 需要的是陪伴而不是物质的时候，ATM-er 可能还在用「我给你买」来表达爱。', advice: 'ATM-er，最贵的礼物是你的时间和注意力。EMO，学会告诉对方你真正需要什么——而不是让 TA 猜。', bondTagline: '你给的不是钱，是你以为 TA 需要的爱' },
  { pair: 'dior-s+game-r', dynamics: '躺平先驱遇上再来一把，你们在一起就是一场关于「什么时候才算真的躺够了」的实验。一个已经躺平，一个在虚拟世界里征战——但归根结底，你们都没在面对现实。', conflict: '当虚拟世界的成就感和现实世界的躺平感叠在一起，你们可能会一起活在一个平行宇宙里，忘了还有真实的路要走。', advice: '偶尔把游戏关掉，把沙发掀起来，一起看看窗外的世界。不是要改变谁，只是确认一下现实还在那里。', bondTagline: '你们在虚拟和现实之间找到了一种奇妙的平衡——或者说，一种精致的逃避' },
  { pair: 'thin-k+talk-er', dynamics: '过度思考遇上嘴巴关不上，你们在一起就是一台思维-表达的永动机。THIN-k 在脑子里转了一万圈，TALK-er 一秒就帮 TA 说出来了。', conflict: '但 THIN-k 的脑内剧本太复杂，TALK-er 的嘴太快——有时候说出来的话不是 THIN-k 想表达的，误会就这样产生了。', advice: 'THIN-k，不要只在脑子里跟自己对话。TALK-er，说完之后确认一下「我理解对了吗」。', bondTagline: '你在脑子里想，TA 替你说出口，你们是彼此的翻译器' },
  { pair: 'oh-no+love-r', dynamics: '天哪体质遇上上头体质，你们在一起的每一件事都是「啊啊啊」级别的。OH-no 的每一次焦虑都能被 LOVE-r 的热情浇灭，LOVE-r 的每一次上头都能被 OH-no 的「完了完了」打断。', conflict: '但两个情绪炸弹在一起，谁来当灭火器？当 OH-no 的焦虑和 LOVE-r 的上头同时爆炸，场面会非常壮观。', advice: 'OH-no，试着相信「没那么糟」。LOVE-r，试着慢下来感受「没那么急」。你们的超能力是把小确幸放大，不要让它变成小确丧。', bondTagline: '你们是彼此的情绪放大器——关键看放大什么' },
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
