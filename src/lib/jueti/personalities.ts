import type { DimensionLevel } from './dimensions';
import { withBasePath } from '../site';

export type JuetiRarityTier = 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';

export interface JuetiRarityInfo {
  tier: JuetiRarityTier;
  label: string;
  color: string;
  bgColor: string;
  populationPct: number;
}

const JUETI_RARITY_CONFIG: Record<JuetiRarityTier, Omit<JuetiRarityInfo, 'tier' | 'populationPct'>> = {
  legendary: { label: '极稀有',  color: '#c9a96e', bgColor: 'rgba(201,169,110,0.12)' },
  epic:      { label: '稀有',    color: '#8b7355', bgColor: 'rgba(139,115,85,0.12)' },
  rare:      { label: '较少见',  color: '#7a6b8a', bgColor: 'rgba(122,107,138,0.12)' },
  uncommon:  { label: '少见',    color: '#5b8a72', bgColor: 'rgba(91,138,114,0.12)' },
  common:    { label: '常见',    color: '#9a9590', bgColor: 'rgba(154,149,144,0.12)' },
};

const JUETI_SLUG_RARITY: Record<string, { tier: JuetiRarityTier; pct: number }> = {
  // legendary
  lightyear:    { tier: 'legendary', pct: 1.8 },
  tide:         { tier: 'legendary', pct: 2.0 },
  // epic
  anchor:       { tier: 'epic', pct: 2.8 },
  blade:        { tier: 'epic', pct: 3.0 },
  // rare
  mist:         { tier: 'rare', pct: 3.8 },
  mirror:       { tier: 'rare', pct: 4.0 },
  undercurrent: { tier: 'rare', pct: 4.2 },
  // uncommon
  ember:        { tier: 'uncommon', pct: 5.0 },
  prism:        { tier: 'uncommon', pct: 5.2 },
  bird:         { tier: 'uncommon', pct: 5.5 },
  echo:         { tier: 'uncommon', pct: 5.0 },
  seed:         { tier: 'uncommon', pct: 5.5 },
  bloom:        { tier: 'uncommon', pct: 5.3 },
  // common
  root:         { tier: 'common', pct: 7.0 },
  cocoon:       { tier: 'common', pct: 6.5 },
  salt:         { tier: 'common', pct: 7.2 },
};

export function getJuetiRarity(slug: string): JuetiRarityInfo {
  const entry = JUETI_SLUG_RARITY[slug] ?? { tier: 'common' as JuetiRarityTier, pct: 5.0 };
  const config = JUETI_RARITY_CONFIG[entry.tier];
  return { tier: entry.tier, populationPct: entry.pct, ...config };
}

export interface JuetiPersonalityType {
  slug: string;
  code: string;
  number: string;
  name: string;
  tagline: string;
  description: string;
  profile: Record<string, DimensionLevel>;
  color: string;
  emoji: string;
}

export function getJuetiTypeImage(slug: string): string {
  return withBasePath(`/images/types/jueti-card-${slug}.png`);
}

export function getJuetiTypeThumbnailImage(slug: string): string {
  return withBasePath(`/images/types/jueti-card-${slug}.png`);
}

// ═══════════════════════════════════════════════════════════════════════
//  16 觉TI 人格类型
//
//  四轴: J1 潮汐 (T/S) · J2 锚定 (R/W) · J3 界限 (O/B) · J4 火焰 (F/E)
//  描述结构: 【看见】【未见】【暗伤】【写给你】
// ═══════════════════════════════════════════════════════════════════════

export const JUETI_PERSONALITY_TYPES: JuetiPersonalityType[] = [

  // ──────────── T (涌) + R (根) ────────────

  {
    slug: 'tide', code: 'TROF', number: '#01',
    name: '潮汐', tagline: '涌向世界，也涌向自己',
    color: '#5b8a72', emoji: '🌊',
    description: `【看见】
你是人群中自带暖意的人。走进一间屋子，你会先看到谁不自在。
你说话有温度，做事有节奏，像一片永远在涨的潮水——不猛烈，但持续。
你是那种大家不会第一个想到、但真出事了第一个找的人。

【未见】
你给出去的能量远远多于你收回来的。
你总在关心别人"还好吗"，但很少有人反过来问你。
不是没人在意——是你太擅长让自己看起来没事了。

【暗伤】
你害怕"不被需要"。
如果有一天大家突然不找你了，你会比失恋还难过。
你的安全感建立在"我对别人有用"上面——但这意味着你从没学会怎么空着手站在那里。

【写给你】
潮水也要退的。
退下去不是消失，是在蓄力。
你不必一直涌向世界，偶尔也可以只是安静地待着。`,
    profile: { J1: 'H', J2: 'H', J3: 'H', J4: 'H' },
  },

  {
    slug: 'ember', code: 'TROE', number: '#02',
    name: '余烬', tagline: '明灭之间，是你在等一阵风',
    color: '#b07850', emoji: '🕯️',
    description: `【看见】
你是那种"突然很有感染力"的人。
平时看着温和，但某个瞬间你说了一句话、做了一件事，所有人都会被你点燃。
你对关系认真，对活着认真，只是你的认真来来去去，像篝火的余烬——灭了又亮，亮了又灭。

【未见】
你经常怀疑自己够不够好。
不是因为做得不好，而是你知道自己能更好——但不是每天都有力气够到那个"更好"。
你的自我怀疑不会说出口。它只会在深夜突然拍你一下。

【暗伤】
你害怕"被期待"。
因为你知道自己不是每天都在状态。
你怕别人看见你发光之后的熄灭，然后失望地走开。

【写给你】
余烬也是火。
你不需要一直燃烧才叫活着。
那些暗下去的时刻，不是你熄灭了——是你在呼吸。`,
    profile: { J1: 'H', J2: 'H', J3: 'H', J4: 'L' },
  },

  {
    slug: 'blade', code: 'TRBF', number: '#03',
    name: '刃', tagline: '温柔地切开模糊地带',
    color: '#6b7b8a', emoji: '🗡️',
    description: `【看见】
你做事利落，说话干脆，边界清晰。
不是冷漠，是你很早就想明白了：给每段关系画一条线，不是为了拒绝，是为了让靠近的人更安全。
你在人群中往往是拿主意的那个。不是因为喜欢做决定，而是你受不了事情悬在那里不动。

【未见】
你其实比看起来更柔软。只是你觉得柔软不安全。
每次想敞开的时候，你都会先在心里演练一遍"如果受伤了怎么办"。
然后——选择不敞开。

【暗伤】
你害怕"失控"。
感情的、局面的、自己的。你把一切都安排得井井有条，因为你知道：一旦失控，你不确定能不能接住自己。

【写给你】
刃也需要被收起来。
不是每个瞬间都需要你清醒、准确、有力。
允许自己钝一点，世界不会因此塌下来。`,
    profile: { J1: 'H', J2: 'H', J3: 'L', J4: 'H' },
  },

  {
    slug: 'prism', code: 'TRBE', number: '#04',
    name: '棱镜', tagline: '折射了所有光，却藏起自己的颜色',
    color: '#8a6b8a', emoji: '🔮',
    description: `【看见】
你是一个很难被归类的人。
有时候你很有主见、很有能量，下一秒你可能就缩回自己的壳里，谁也够不着。
别人觉得你"个性"，其实你只是诚实——今天想做什么就做什么，不想就不做。

【未见】
你内心有一套复杂的运行逻辑。
你不是善变，是你同时在处理太多频道。
你经常在"想靠近别人"和"害怕被看穿"之间来回拉扯。
最后通常选择不靠近。

【暗伤】
你害怕"被定义"。
"你就是这样的人"这句话能让你一周不开心。
你不想被任何人锁死在一个版本里——但有时候连你自己都不确定"我到底是哪个版本"。

【写给你】
你不需要只是一种颜色。
棱镜之所以美，就是因为它什么都是，什么都不必固定。
你可以全部都是。`,
    profile: { J1: 'H', J2: 'H', J3: 'L', J4: 'L' },
  },

  // ──────────── T (涌) + W (风) ────────────

  {
    slug: 'bird', code: 'TWOF', number: '#05',
    name: '候鸟', tagline: '你的归宿是一直在飞',
    color: '#5a7a8a', emoji: '🕊️',
    description: `【看见】
你是自由的，而且是持续地自由。
你喜欢新的人、新的事、新的地方。
你的共情力很强，每到一个地方都能很快和人建立连接——只是你不太留得住。
你走了之后，别人会记得你很久。

【未见】
飞得越远，你越会在某个夜晚问自己：
"我有没有一个可以不用飞的地方？"
你不是不想停下来。你是不知道停在哪里才不会觉得憋屈。

【暗伤】
你害怕"被困住"。
一段关系一旦开始要求你稳定、持续、可预期，你的第一反应不是安心，而是窒息。
但你又知道——永远飞着，也是另一种困住。

【写给你】
候鸟不是因为不爱才飞。
你只是还没找到一个落脚之后不想走的地方。
也许那个地方不是一个地点，是一个人。或者是你自己。`,
    profile: { J1: 'H', J2: 'L', J3: 'H', J4: 'H' },
  },

  {
    slug: 'mist', code: 'TWOE', number: '#06',
    name: '薄雾', tagline: '你在，但不肯被看清',
    color: '#8a8a9a', emoji: '🌫️',
    description: `【看见】
你是人群中最不容易被定义的人。
有时候你话很多、很热情；有时候你突然消失了。
别人觉得你有点"飘"，但认识久了会发现——你不是不在意，你只是在用自己的方式参与。

【未见】
你其实非常细腻。
你能读懂一个人话语里没说出口的那部分。
但你不太愿意让别人读懂你。
不是不信任，是你觉得被完全看见太危险了。

【暗伤】
你害怕"被抓住"。
不是怕承诺，是怕你一旦被看清，对方就会失望。
"真正的我没那么好"——这句话你想过很多次。

【写给你】
雾也有形状。
你不需要让所有人看见你，但至少让自己看见自己。
不完美的那个你，也值得被接住。`,
    profile: { J1: 'H', J2: 'L', J3: 'H', J4: 'L' },
  },

  {
    slug: 'anchor', code: 'TWBF', number: '#07',
    name: '自锚', tagline: '你只为自己抛锚',
    color: '#6a7a6a', emoji: '⚓',
    description: `【看见】
你是独立的。不是那种"我也可以自己来"的独立——是那种"我就是一个人也能活得很好"的独立。
你有清晰的方向感，不太需要别人指路。
你的能量稳定、节奏自己控。别人看你，觉得你"很酷"。

【未见】
"酷"的背面是一种刻意。你不是天生冷淡——你是练出来的。
你曾经也很热烈地靠近过某个人或某件事，
但被烫过之后，你选择了"我来掌控距离"。

【暗伤】
你害怕"依赖"。
不是别人依赖你——是你发现自己在依赖别人。
一旦发现这个苗头，你会本能地往后退一步。
你不允许任何人成为你的必需品。

【写给你】
锚不是用来把自己固定在孤独里的。
允许自己需要一个人，不是软弱。
世界上最勇敢的事，可能是对一个人说"我需要你"。`,
    profile: { J1: 'H', J2: 'L', J3: 'L', J4: 'H' },
  },

  {
    slug: 'echo', code: 'TWBE', number: '#08',
    name: '回声', tagline: '空旷的山谷里，你自己回答自己',
    color: '#7a7080', emoji: '🗻',
    description: `【看见】
你像一阵时有时无的风。你不太按套路出牌，别人也猜不透你下一步会做什么。
你有想法、有态度、有表达欲——但你的表达常常是碎片式的，一闪而过。

【未见】
你的内心其实非常完整。
那些碎片只是你不愿意一次性展示全部。
你在等一个值得你把全貌展开的人。
但等待本身，就已经让你疲惫了。

【暗伤】
你害怕"无人回应"。
你的声音很独特，但不是所有人都能听见。
你曾经发出过一些信号，没有等到回声。
于是你学会了自己回答自己。

【写给你】
山谷因为空旷才产生回声。
你那些没被接住的话，不是白说了——它们回到了你自己身上，让你更了解自己。`,
    profile: { J1: 'H', J2: 'L', J3: 'L', J4: 'L' },
  },

  // ──────────── S (静) + R (根) ────────────

  {
    slug: 'root', code: 'SROF', number: '#09',
    name: '根系', tagline: '你在看不见的地方生长',
    color: '#7a6b55', emoji: '🌿',
    description: `【看见】
你不是人群中最耀眼的。
但如果抽掉你，很多东西都会塌。
你是默默撑住关系、项目、家庭的那个人。
你的力量不在表面，而在地底——安静、持续、无声。

【未见】
你付出很多，但很少为自己争取。
不是不想要——是你觉得"我先让别人好起来，我再说"。
但"再说"那天，好像从来没有到过。

【暗伤】
你害怕"被遗忘"。
你做了那么多，但因为你从不声张，别人可能真的没注意到。
这件事你嘴上不说，心里的刺已经扎了很久。

【写给你】
地面上的花知道阳光的好，却不一定记得根的功劳。
但根知道。
你不必被看见，才算存在。`,
    profile: { J1: 'L', J2: 'H', J3: 'H', J4: 'H' },
  },

  {
    slug: 'seed', code: 'SROE', number: '#10',
    name: '种籽', tagline: '还没发芽，但早就知道方向',
    color: '#8a7a5a', emoji: '🌱',
    description: `【看见】
你安静得像一颗没有动静的种子。
但身边的人都能隐约感觉到，你心里有一个很大的世界。
你不急，你愿意等。
你知道自己要什么，只是还没有到那个时候。

【未见】
你的"不急"有时候是真的不急，有时候是恐惧。
你怕自己一旦行动了，结果不如想象中好。
停在"还没开始"的状态里，至少不会被否定。

【暗伤】
你害怕"错过时机"。
你用"等待"保护自己，但有时候你知道——这个世界不会一直等你准备好。

【写给你】
种子在土里的每一天都不是浪费。
但也请记住：破土而出的那一刻，是会疼的。
疼，不代表你做错了。`,
    profile: { J1: 'L', J2: 'H', J3: 'H', J4: 'L' },
  },

  {
    slug: 'mirror', code: 'SRBF', number: '#11',
    name: '静镜', tagline: '你是别人认识自己的方式',
    color: '#7a8a8a', emoji: '🪞',
    description: `【看见】
你的存在本身就有一种稳定的力量。
你不太说多余的话，但说出来的每一句都有分量。
你观察力惊人，总能看到别人自己看不到的地方。
你是那个朋友们会来找"照镜子"的人。

【未见】
但镜子照得见别人，照不见自己。
你把所有的洞察力都给了外面的世界，唯独对自己的需求，一直是模糊的。

【暗伤】
你害怕"被看穿"。
你习惯了做那个观察者。如果反过来被观察，你会不自在到想逃。
你的边界不仅是为了保护空间——是为了保护那个你不想被看见的自己。

【写给你】
镜子也需要一面镜子。
允许别人看见你不完美的样子，不是暴露弱点，是在告诉世界：你也是人。`,
    profile: { J1: 'L', J2: 'H', J3: 'L', J4: 'H' },
  },

  {
    slug: 'cocoon', code: 'SRBE', number: '#12',
    name: '茧', tagline: '破不破，都是你的事',
    color: '#8a7a7a', emoji: '🦋',
    description: `【看见】
你活在一个很结实的壳里。
你的壳不是为了隔绝世界——是为了给自己一个安全的地方，让你可以不被打扰地慢慢变成自己。
从外面看，你很封闭。但你知道里面正在发生什么。

【未见】
你的变化是剧烈的，只是都在内部完成。
可能某天你醒来，发现自己的三观悄悄换了一套。
但你不会急着告诉别人。你在等一个"完全准备好了"的时刻。

【暗伤】
你害怕"被催促"。
"你怎么还不行动？""你其实可以更好的。"
这些话听起来像鼓励，但对你来说像催命。
你的节奏只有你自己知道。

【写给你】
茧的意义不在于"什么时候破"，而是里面的你，是不是在长出翅膀。
不必回应任何人的时间表。
你的春天，由你说了算。`,
    profile: { J1: 'L', J2: 'H', J3: 'L', J4: 'L' },
  },

  // ──────────── S (静) + W (风) ────────────

  {
    slug: 'salt', code: 'SWOF', number: '#13',
    name: '盐', tagline: '溶解在每段关系里，却不曾消失',
    color: '#9a8a7a', emoji: '🧂',
    description: `【看见】
你是那种"走了之后才被感知"的人。
你不显眼、不抢戏、不制造冲突。
但你离开之后，大家才发现——原来空气的味道不同了。
你像盐一样，溶解在一切里面。

【未见】
你给了所有人味道，但你自己是无味的——至少你这样觉得。
你总在关系里做那个调和的角色，
但调到最后发现自己没有自己的味道。

【暗伤】
你害怕"没有自我"。
"我到底是为自己活还是为别人活？"这个问题你不常想，但每次想到都有点心慌。

【写给你】
盐之所以是盐，是因为它本身就有味道——只是溶解之后不容易被辨认。
你不用从关系中退出来才能找到自己。
你就是你在每段关系中的那个样子。`,
    profile: { J1: 'L', J2: 'L', J3: 'H', J4: 'H' },
  },

  {
    slug: 'bloom', code: 'SWOE', number: '#14',
    name: '花期', tagline: '开不开，你自己说了算',
    color: '#b08a7a', emoji: '🌸',
    description: `【看见】
你有自己的节奏。你不是不绽放——你只是不按别人的时间表绽放。
有的人觉得你"慢热"，有的人觉得你"随性"。
但你自己知道：你只是在等合适的时机。

【未见】
你的柔软常常被人忽略。
因为你不太表达需要，别人就以为你什么都不需要。
但其实你非常渴望被理解——只是表达这件事本身让你犹豫。

【暗伤】
你害怕"凋谢"。
你知道自己的能量是有限的，好的状态不是每天都有。
所以你格外珍惜每一次"在状态"的时刻。
也因此格外害怕：如果这次用完了，就没有了。

【写给你】
花期的意义不在于长短。
那些你觉得自己"没有开"的日子里，你其实在积蓄下一次盛放的力量。
你不需要一直美丽。你只需要，一直是你。`,
    profile: { J1: 'L', J2: 'L', J3: 'H', J4: 'L' },
  },

  {
    slug: 'undercurrent', code: 'SWBF', number: '#15',
    name: '暗流', tagline: '水面平静，水下翻涌',
    color: '#5a6a7a', emoji: '🌀',
    description: `【看见】
你是安静的。
但你的安静不是空白——是被高密度的思考填满的。
你看问题很深、很远，但你不说。
你做选择很果断，但外表看起来像没做过选择似的。

【未见】
你内心的强烈程度和你的外表完全不成比例。
你可以为一个信念燃烧很久，但你永远不会把火焰展示给别人看。
你觉得——真正有力量的东西不需要被展示。

【暗伤】
你害怕"被误解"。
你的沉默被误解成冷漠，你的距离被误解成不在乎。
但你解释的欲望又很低。
"你愿意理解我就理解，不愿意就算了"——这句话你说了无数次，没一次是在嘴上。

【写给你】
暗流是最有力的水。
但偶尔让水面翻一个浪吧。
不是为了被看见——是为了让自己透口气。`,
    profile: { J1: 'L', J2: 'L', J3: 'L', J4: 'H' },
  },

  {
    slug: 'lightyear', code: 'SWBE', number: '#16',
    name: '光年', tagline: '你的距离感是一种温柔',
    color: '#6a6a80', emoji: '✨',
    description: `【看见】
你是人群中最安静的那个。
不是没有存在感——你的存在感来自"不在"。
你越是不在场，别人越是会想起你。
你像一颗远处的恒星：不靠近谁，但一直在发光。

【未见】
你并不如别人以为的那样不需要人。
你只是对"亲密"的定义不一样。
对你来说，真正的亲密不是每天在一起——是两个人隔了很远的距离，还能确认对方在。

【暗伤】
你害怕"靠近"。
你知道距离是安全的。但有时候你也怀疑——是你选择了距离，还是距离选择了你？
"如果我再近一步，还会被接受吗？"
这个问题你没有答案。

【写给你】
光年是一个距离单位，也是一个时间单位。
你的光已经出发了，也许此刻正好照到某个人脸上。
你不需要靠得更近——你只需要继续发光。`,
    profile: { J1: 'L', J2: 'L', J3: 'L', J4: 'L' },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getJuetiPersonalityBySlug(slug: string): JuetiPersonalityType | undefined {
  return JUETI_PERSONALITY_TYPES.find(p => p.slug === slug);
}

export function getJuetiPersonalityByCode(code: string): JuetiPersonalityType | undefined {
  return JUETI_PERSONALITY_TYPES.find(p => p.code === code);
}

export function getAllJuetiSlugs(): string[] {
  return JUETI_PERSONALITY_TYPES.map(p => p.slug);
}

// ═══════════════════════════════════════════════════════════════════════
//  灵魂共振 · Resonance Data
//
//  每种人格对应一位知名女性灵魂原型 + 诗句 + 标签 + 镜像/反面
// ═══════════════════════════════════════════════════════════════════════

export interface JuetiResonanceData {
  quote: string;
  quoteSource: string;
  tags: string[];
  soulOrigin: {
    name: string;
    zhName: string;
    era: string;
    description: string;
  };
  mirrorSlug: string;
  oppositeSlug: string;
}

export const JUETI_RESONANCE: Record<string, JuetiResonanceData> = {

  tide: {
    quote: '你是人间的四月天，\n笑响点亮了四面风。',
    quoteSource: '林徽因《你是人间的四月天》',
    tags: ['暖流', '托举', '持续的爱', '潮汐回环'],
    soulOrigin: {
      name: 'Lin Huiyin',
      zhName: '林徽因',
      era: '1904 — 1955',
      description: '建筑师、诗人、一个从未停止涌向他人的女人。她把温度给建筑、给诗、给身边的每一个人——给到最后，自己肺病缠身也不肯停。潮汐式的爱，是她一生唯一的节奏。',
    },
    mirrorSlug: 'blade',
    oppositeSlug: 'lightyear',
  },

  ember: {
    quote: '一个人能使自己成为自己，\n比什么都重要。',
    quoteSource: '弗吉尼亚·伍尔夫《到灯塔去》',
    tags: ['间歇的光', '自我怀疑', '深夜的火', '等风来'],
    soulOrigin: {
      name: 'Virginia Woolf',
      zhName: '弗吉尼亚·伍尔夫',
      era: '1882 — 1941',
      description: '意识流文学的先驱，才华惊人却被抑郁反复侵蚀。她的光芒时明时灭，如同余烬——不是不够亮，是燃烧本身就需要间歇。她用文字证明：即使灭过，也曾照亮过整片天。',
    },
    mirrorSlug: 'prism',
    oppositeSlug: 'undercurrent',
  },

  blade: {
    quote: '女人不是天生的，\n而是后天形成的。',
    quoteSource: '西蒙娜·德·波伏娃《第二性》',
    tags: ['清醒', '边界', '利落的温柔', '不失控'],
    soulOrigin: {
      name: 'Simone de Beauvoir',
      zhName: '西蒙娜·德·波伏娃',
      era: '1908 — 1986',
      description: '哲学家、女性主义先驱。她的一生都在用清晰的逻辑切开世界的模糊地带——什么是女人，什么是自由，什么是爱而不失去自己。刃的温柔，是敢于划出界线。',
    },
    mirrorSlug: 'anchor',
    oppositeSlug: 'bloom',
  },

  prism: {
    quote: '生命是一袭华美的袍，\n爬满了蚤子。',
    quoteSource: '张爱玲《天才梦》',
    tags: ['不可定义', '多面体', '自由折射', '拒绝标签'],
    soulOrigin: {
      name: 'Eileen Chang',
      zhName: '张爱玲',
      era: '1920 — 1995',
      description: '写尽人间苍凉与华丽。她不属于任何流派、任何圈子，甚至不属于任何一段关系。她像一面棱镜，折射了时代所有的光，却从不暴露自己的颜色。',
    },
    mirrorSlug: 'ember',
    oppositeSlug: 'salt',
  },

  bird: {
    quote: '心若没有栖息的地方，\n到哪里都是在流浪。',
    quoteSource: '三毛《万水千山走遍》',
    tags: ['永远在飞', '共情', '不落地', '自由与渴望'],
    soulOrigin: {
      name: 'Sanmao',
      zhName: '三毛',
      era: '1943 — 1991',
      description: '撒哈拉的流浪者，用脚步丈量自由的边界。她每到一个地方都能迅速与人建立深刻连接，又总是离开。不是不想停——是停下来比飞着更需要勇气。',
    },
    mirrorSlug: 'mist',
    oppositeSlug: 'cocoon',
  },

  mist: {
    quote: '此情无计可消除，\n才下眉头，却上心头。',
    quoteSource: '李清照《一剪梅》',
    tags: ['若即若离', '细腻', '飘', '不肯被看清'],
    soulOrigin: {
      name: 'Li Qingzhao',
      zhName: '李清照',
      era: '1084 — 约1155',
      description: '千古第一才女，词中有雾气般的细腻与哀愁。她的情感总是在场又不完全在场——如薄雾般笼罩，让人看见了什么，又觉得什么都没看清。',
    },
    mirrorSlug: 'bird',
    oppositeSlug: 'mirror',
  },

  anchor: {
    quote: '生活中没有什么可怕的东西，\n只有需要理解的东西。',
    quoteSource: '玛丽·居里',
    tags: ['极度独立', '掌控距离', '不依赖', '练出来的酷'],
    soulOrigin: {
      name: 'Marie Curie',
      zhName: '玛丽·居里',
      era: '1867 — 1934',
      description: '两次诺贝尔奖得主，在一个不允许女人做科学的年代独自撑起了一间实验室。她的独立不是性格——是被世界逼出来的铠甲。她只为自己抛锚，因为没有人替她抛过。',
    },
    mirrorSlug: 'blade',
    oppositeSlug: 'seed',
  },

  echo: {
    quote: '我是无名之辈！你是——谁？\n你也是——无名之辈？',
    quoteSource: '艾米莉·狄金森',
    tags: ['碎片式表达', '自问自答', '空旷', '独特的频率'],
    soulOrigin: {
      name: 'Emily Dickinson',
      zhName: '艾米莉·狄金森',
      era: '1830 — 1886',
      description: '一生隐居，写下近1800首诗，生前仅发表不到十首。她不需要读者——她的诗是写给回声的。空旷的房间里，她自己提问，自己回答，自成宇宙。',
    },
    mirrorSlug: 'mist',
    oppositeSlug: 'root',
  },

  root: {
    quote: '我们曾如此期盼外界的认可，\n到最后才知道，世界是自己的，\n与他人毫无关系。',
    quoteSource: '杨绛《一百岁感言》',
    tags: ['沉默的力量', '不被看见', '持续支撑', '地下生长'],
    soulOrigin: {
      name: 'Yang Jiang',
      zhName: '杨绛',
      era: '1911 — 2016',
      description: '翻译家、剧作家、钱锺书背后最安静的力量。她一辈子不争不抢、不急不躁，像根系一样在地底下默默撑起了一整个家和一整个时代的文学。',
    },
    mirrorSlug: 'seed',
    oppositeSlug: 'echo',
  },

  seed: {
    quote: '我不是鸟；\n没有罗网能捕住我。',
    quoteSource: '夏洛蒂·勃朗特《简·爱》',
    tags: ['等待时机', '破土之前', '安静的笃定', '向内积蓄'],
    soulOrigin: {
      name: 'Charlotte Brontë',
      zhName: '夏洛蒂·勃朗特',
      era: '1816 — 1855',
      description: '在牧师家中默默写作多年，被出版社拒绝过无数次。但她始终知道自己要什么。《简·爱》出版时，世界才看到——种籽在土里的每一天都不是浪费。',
    },
    mirrorSlug: 'root',
    oppositeSlug: 'anchor',
  },

  mirror: {
    quote: '在最黑暗的时刻，\n我们有权期待一些光明。',
    quoteSource: '汉娜·阿伦特《黑暗时代的人们》',
    tags: ['洞察者', '照见他人', '不被照见', '边界的镜面'],
    soulOrigin: {
      name: 'Hannah Arendt',
      zhName: '汉娜·阿伦特',
      era: '1906 — 1975',
      description: '政治哲学家，用冷静的洞察力照见了20世纪最黑暗的角落。她是人类的镜子——看到别人看不到的东西，承受别人不愿承受的清醒。',
    },
    mirrorSlug: 'cocoon',
    oppositeSlug: 'mist',
  },

  cocoon: {
    quote: '我曾以为最糟糕的事情是孤独终老——\n后来我才知道，\n最糟糕的是与让你感到孤独的人一起终老。',
    quoteSource: '弗里达·卡罗',
    tags: ['安全壳', '慢慢蜕变', '自己的节奏', '拒绝催促'],
    soulOrigin: {
      name: 'Frida Kahlo',
      zhName: '弗里达·卡罗',
      era: '1907 — 1954',
      description: '在病痛与背叛中，她把自己关进画布的茧里，一笔一笔地把痛苦变成了自画像。她从不急着破茧——因为茧的内部，才是她真正的王国。',
    },
    mirrorSlug: 'mirror',
    oppositeSlug: 'bird',
  },

  salt: {
    quote: '生前何必久睡，\n死后自会长眠。',
    quoteSource: '萧红《呼兰河传》',
    tags: ['溶解', '走后才被感知', '调和者', '无味的自我'],
    soulOrigin: {
      name: 'Xiao Hong',
      zhName: '萧红',
      era: '1911 — 1942',
      description: '民国最被低估的女作家。她把自己溶解进文字、进关系、进北方的风雪里。活着时无人在意，死后才被整个时代品出了味道。像盐，存在时无感，缺席时才知不可或缺。',
    },
    mirrorSlug: 'bloom',
    oppositeSlug: 'prism',
  },

  bloom: {
    quote: '我闭上眼睛，\n整个世界倒了下去。',
    quoteSource: '西尔维娅·普拉斯《钟形罩》',
    tags: ['自己的花期', '有限的能量', '等合适时机', '不按时间表'],
    soulOrigin: {
      name: 'Sylvia Plath',
      zhName: '西尔维娅·普拉斯',
      era: '1932 — 1963',
      description: '天才诗人，短暂的一生开出了最猛烈的花。她的才华像花期一样灿烂而有限——不是不够努力，是有些光芒注定无法持续一辈子。她用有限的花期，照亮了整个世纪的诗歌。',
    },
    mirrorSlug: 'salt',
    oppositeSlug: 'blade',
  },

  undercurrent: {
    quote: '爱之于我，不是肌肤之亲，\n不是一蔬一饭，\n它是一种不死的欲望，\n是疲惫生活中的英雄梦想。',
    quoteSource: '玛格丽特·杜拉斯《情人》',
    tags: ['水面平静', '高密度的安静', '不需要展示', '被误解'],
    soulOrigin: {
      name: 'Marguerite Duras',
      zhName: '玛格丽特·杜拉斯',
      era: '1914 — 1996',
      description: '表面上她是那个冷静的法国女作家。水面之下，她的文字翻涌着足以掀翻一切的情感。她从不把力量展示给不配看见的人——暗流的骄傲，是只在深处汹涌。',
    },
    mirrorSlug: 'lightyear',
    oppositeSlug: 'ember',
  },

  lightyear: {
    quote: '有人说九位缪斯——\n但再数数——\n还有莱斯博斯的萨福。',
    quoteSource: '柏拉图论萨福',
    tags: ['距离即温柔', '远处发光', '不靠近', '跨越时间'],
    soulOrigin: {
      name: 'Sappho',
      zhName: '萨福',
      era: '约前630 — 约前570',
      description: '古希腊最伟大的抒情诗人，被称为"第十位缪斯"。她的诗歌穿越两千六百年的距离依然照耀着我们——这正是光年的含义：不需要靠近，光本身就是抵达。',
    },
    mirrorSlug: 'undercurrent',
    oppositeSlug: 'tide',
  },

};

export function getJuetiResonance(slug: string): JuetiResonanceData | undefined {
  return JUETI_RESONANCE[slug];
}
