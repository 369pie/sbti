import type { DimensionLevel } from './dimensions';
import { withBasePath } from '../site';

export type XptiRarityTier = 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';

export interface XptiRarityInfo {
  tier: XptiRarityTier;
  label: string;
  color: string;
  bgColor: string;
  populationPct: number;
}

const XPTI_RARITY_CONFIG: Record<XptiRarityTier, Omit<XptiRarityInfo, 'tier' | 'populationPct'>> = {
  legendary: { label: '传说级', color: '#fbbf24', bgColor: 'rgba(251,191,36,0.12)' },
  epic:      { label: '超稀有', color: '#a78bfa', bgColor: 'rgba(167,139,250,0.12)' },
  rare:      { label: '稀有',   color: '#60a5fa', bgColor: 'rgba(96,165,250,0.12)' },
  uncommon:  { label: '较少见', color: '#34d399', bgColor: 'rgba(52,211,153,0.12)' },
  common:    { label: '常见',   color: '#a8a29e', bgColor: 'rgba(168,162,158,0.12)' },
};

const XPTI_SLUG_RARITY: Record<string, { tier: XptiRarityTier; pct: number }> = {
  // legendary
  queen:       { tier: 'legendary', pct: 1.5 },
  pure:        { tier: 'legendary', pct: 1.8 },
  // epic
  screenwriter:{ tier: 'epic', pct: 2.5 },
  adventurer:  { tier: 'epic', pct: 2.8 },
  ice:         { tier: 'epic', pct: 2.2 },
  // rare
  'pre-green': { tier: 'rare', pct: 3.5 },
  'love-pm':   { tier: 'rare', pct: 3.8 },
  'sober-queen':{ tier: 'rare', pct: 4.0 },
  // uncommon
  mood:        { tier: 'uncommon', pct: 5.0 },
  cat:         { tier: 'uncommon', pct: 5.5 },
  vibes:       { tier: 'uncommon', pct: 5.2 },
  'wait-n-see':{ tier: 'uncommon', pct: 4.8 },
  // common
  contract:    { tier: 'common', pct: 6.5 },
  partner:     { tier: 'common', pct: 7.0 },
  'sober-brain':{ tier: 'common', pct: 6.8 },
  buddha:      { tier: 'common', pct: 7.5 },
};

export function getXptiRarity(slug: string): XptiRarityInfo {
  const entry = XPTI_SLUG_RARITY[slug] ?? { tier: 'common' as XptiRarityTier, pct: 5.0 };
  const config = XPTI_RARITY_CONFIG[entry.tier];
  return { tier: entry.tier, populationPct: entry.pct, ...config };
}

export interface XptiPersonalityType {
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

export function getXptiTypeImage(slug: string): string {
  return withBasePath(`/images/types/xpti/${slug}.png`);
}

export function getXptiTypeThumbnailImage(slug: string): string {
  return withBasePath(`/images/types/xpti/thumbs/${slug}.webp`);
}

export const XPTI_PERSONALITY_TYPES: XptiPersonalityType[] = [
  // ═══════════════════════════════ D (主导) + S (氛围) ═══════════════════════════════
  {
    slug: 'queen', code: 'DSPF', number: '#01',
    name: '霸总体质', tagline: '恋爱版甲方',
    color: '#e8729c', emoji: '👑',
    description: `【XP 一击】
这段感情，我来排期。

【翻译你的恋爱DNA】
你谈恋爱的方式不是"坠入爱河"，是"拿下项目"。
从约会地点到未来规划，你全都要亲自审批。
你不是控制欲强，你只是觉得——
让你来安排，效率最高，翻车最少。

你的爱情有仪式感、有画面感、有年度KPI。
你会精心准备每一个纪念日，因为对你来说浪漫不是自然发生的，是被你创造的。
你幻想过无数次完美爱情的样子，而且你打算按脚本执行。

【XP 症状清单】
✓ 约会前提前踩点、写攻略、做PPT
✓ 另一半叫你"甲方"你觉得是夸你
✓ 收到礼物第一反应是评估用心程度
✓ 分手也要写复盘报告
✓ 觉得"撒娇"这个技能不如"谈判"好使

【轻收口】
你不是不浪漫，你是把浪漫当项目管理了。
别人恋爱靠感觉，你靠甘特图。`,
    profile: { X1: 'H', X2: 'H', X3: 'H', X4: 'H' },
  },
  {
    slug: 'love-pm', code: 'DSPR', number: '#02',
    name: '恋爱项目经理', tagline: '有条件的浪漫',
    color: '#f472b6', emoji: '📋',
    description: `【XP 一击】
爱你，但要看KPI。

【翻译你的恋爱DNA】
你是浪漫和理性的完美融合体——
不，准确说，是理性先把浪漫筛选了一遍。
你享受被精心对待的感觉，蜡烛、鲜花、烛光晚餐你全要。
但同时你心里有一本账：这个人靠不靠谱、有没有未来、值不值得投资。

你的爱情观是"可以心动，但不能亏本"。
你不会为了一时上头做出任何不可逆的决定。

【XP 症状清单】
✓ 约会的时候在心里默默给对方打分
✓ 朋友说你谈恋爱像相亲，你觉得这是效率
✓ 对方送花你开心，但更想知道花多少钱
✓ "我喜欢你"不如"我已经看了三套婚房"让你心动
✓ 恋爱前先做背调

【轻收口】
你不是不会心动，你只是心动之前要先过风控。
别人恋爱谈感觉，你谈可行性分析。`,
    profile: { X1: 'H', X2: 'H', X3: 'H', X4: 'L' },
  },
  {
    slug: 'pre-green', code: 'DSCF', number: '#03',
    name: '渣女预备役', tagline: '刺激才是氧气',
    color: '#f43f5e', emoji: '🃏',
    description: `【XP 一击】
我没渣，只是选项太多。

【翻译你的恋爱DNA】
你喜欢掌控关系的节奏，同时又对"确定性"过敏。
你不是花心，你只是在关系里永远保留一个"退出键"。
你享受被追的过程远多于被追到之后。
你的多巴胺系统只对"不确定"有反应——
一旦对方全部交代、给够安全感，你反而开始无聊。

你知道这样不太好，但你控制不住。

【XP 症状清单】
✓ 暧昧期是你精神状态的巅峰
✓ 对方越不在意你越上头
✓ 确定关系第二天就开始想逃跑
✓ 朋友喊你"渣女"你说"我只是自由"
✓ 同时和三个人聊天但觉得自己很忠诚

【轻收口】
你不是渣，你只是对"安全"过敏。
刺激是你的氧气，平淡是你的过敏原。`,
    profile: { X1: 'H', X2: 'H', X3: 'L', X4: 'H' },
  },
  {
    slug: 'sober-queen', code: 'DSCR', number: '#04',
    name: '清醒女王', tagline: '从不吃亏型',
    color: '#7c3aed', emoji: '💅',
    description: `【XP 一击】
这段关系我亏了吗？没有，继续。

【翻译你的恋爱DNA】
你在关系里清醒得可怕——
你永远知道自己要什么，也永远知道底线在哪。
你不会因为"他对我好"就降低标准，
也不会因为"我太喜欢他了"就失去判断。

你喜欢掌控关系，但不是为了控制对方，
而是因为你太了解自己了——你知道一旦把主动权交出去，灾难就开始了。

你的氛围感来自感官而非幻想。
你享受好的约会、好的礼物、好的对待。
但这些对你来说不是"浪漫"，是"标配"。

【XP 症状清单】
✓ 收到道歉玫瑰会先想"上次是我的错吗"
✓ 对方哭你也想哭，但先忍住分析局势
✓ 分手从不后悔，因为你已经算过账了
✓ 朋友说你"太理性了不像在谈恋爱"
✓ 你的底线比对方的安全感还牢固

【轻收口】
你不是冷血，你只是把智商带进了恋爱。
别人用心谈恋爱，你用脑。`,
    profile: { X1: 'H', X2: 'H', X3: 'L', X4: 'L' },
  },

  // ═══════════════════════════════ D (主导) + I (直觉) ═══════════════════════════════
  {
    slug: 'screenwriter', code: 'DIPF', number: '#05',
    name: '恋爱编剧', tagline: '脑内已拍完8集',
    color: '#a855f7', emoji: '🎬',
    description: `【XP 一击】
他朝我笑了，大结局我写好了。

【翻译你的恋爱DNA】
你的大脑里永远在播一部只有你能看到的恋爱剧。
对方一个眼神你就能脑补出三季的剧情。
你不需要蜡烛和玫瑰，你需要的是"那个瞬间"——
一个回头、一句不经意的话、一个让你觉得"他好像在看我"的错觉。

你的恋爱始于幻想，也常终于幻想。
因为现实里的他永远不如你脑子里的版本好。

【XP 症状清单】
✓ 和暗恋对象还没说过话就想好孩子叫什么了
✓ 听到一首歌就自动给脑内恋爱剧配BGM
✓ 对方随口说"我们"你的心脏漏了一拍
✓ 约会后给闺蜜复述时自动添加了导演解说
✓ 最大的情敌不是别人，是你自己的想象力

【轻收口】
你不是太容易爱上谁，你只是太会给自己讲故事了。
你的心动成本为零，失望成本为无穷大。`,
    profile: { X1: 'H', X2: 'L', X3: 'H', X4: 'H' },
  },
  {
    slug: 'sober-brain', code: 'DIPR', number: '#06',
    name: '人间清醒恋爱脑', tagline: '矛盾共同体',
    color: '#ec4899', emoji: '🧠',
    description: `【XP 一击】
明知是坑还是想跳，但我量好了深度。

【翻译你的恋爱DNA】
你是恋爱界最矛盾的存在——
心里知道"理性很重要"，身体却很诚实。
你会在约会前列一个"他值不值得"清单，
然后在对方一个微笑之后把清单撕了。

你的直觉很准，你经常"第一眼就知道"。
但你同时也很务实——
你允许自己心动，但绝不让自己迷失。
你是那种"知道自己在干什么"的恋爱脑。

【XP 症状清单】
✓ 恋爱前做SWOT分析，恋爱后该上头还是上头
✓ 闺蜜说你"嘴上说不要身体很诚实"
✓ 已读不回的空窗期你在脑子里分析了8种可能
✓ 对方送礼物你先感动再评估性价比
✓ 对自己说的最多的话是"冷静冷静冷静"

【轻收口】
你不是矛盾，你只是理性和感性同时在线。
别人只带了一个自己去恋爱，你带了两个。`,
    profile: { X1: 'H', X2: 'L', X3: 'H', X4: 'L' },
  },
  {
    slug: 'adventurer', code: 'DICF', number: '#07',
    name: '恋爱冒险家', tagline: '直觉选人型',
    color: '#f97316', emoji: '🎲',
    description: `【XP 一击】
我要的不是安全感，是心跳。

【翻译你的恋爱DNA】
你选人不看条件看感觉——
准确说，是看"电流"。
第一次见面有没有触电，决定了这个人有没有后续。
你不需要对方有多完美，你只需要那个让你说不出理由但就是想靠近的瞬间。

你在关系里喜欢主导，喜欢变化，讨厌一成不变。
稳定对你来说不是安心，是无聊。
你会为了一个冲动飞到另一个城市见一个人。

【XP 症状清单】
✓ 见第一面就知道"行不行"，准确率高得吓人
✓ 平淡的约会你宁可不去
✓ 别人问你"喜欢什么类型"你说"电到我的那种"
✓ 经历过的恋爱每段都像电影
✓ 你的前任们画风完全不一样

【轻收口】
你不是花心，你只是对"普通"免疫。
你要的爱情，必须值得写进日记。`,
    profile: { X1: 'H', X2: 'L', X3: 'L', X4: 'H' },
  },
  {
    slug: 'ice', code: 'DICR', number: '#08',
    name: '高冷甲方', tagline: '你行你上',
    color: '#06b6d4', emoji: '🧊',
    description: `【XP 一击】
不是我要求高，是你们太拉了。

【翻译你的恋爱DNA】
你在恋爱市场上的定位是"难搞的甲方"。
你不需要仪式感、不需要甜言蜜语、不需要别人帮你造梦。
你的心动完全靠直觉——
要么第一秒就来电，要么永远不会。

你喜欢掌控关系，但不是热情地掌控，是冷静地掌控。
你的冷不是假装的，是真的觉得大部分人不值得你费精力。
但一旦有人真的通过了你的筛选……
你比任何人都认真。

【XP 症状清单】
✓ 追你的人很多，走到最后的几乎没有
✓ 约你出来比约面试还难
✓ 你从不主动，但你的气场能让人主动
✓ 对方表白你第一反应是分析对方条件
✓ 朋友说你"端着"，你觉得这叫"有标准"

【轻收口】
你不是高冷，你只是把"高标准"写在脸上了。
能让你主动的人，一定很特别。`,
    profile: { X1: 'H', X2: 'L', X3: 'L', X4: 'L' },
  },

  // ═══════════════════════════════ A (配合) + S (氛围) ═══════════════════════════════
  {
    slug: 'vibes', code: 'ASPF', number: '#09',
    name: '恋爱氛围组', tagline: '被撩就倒型',
    color: '#f9a8d4', emoji: '🫧',
    description: `【XP 一击】
他给我塞了一颗糖，我想了三天。

【翻译你的恋爱DNA】
你的爱情不靠"条件匹配"启动，靠"氛围感"。
下雨天递伞 → 心动。
深夜发语音说"到家了吗" → 心动。
开车时把手搭在你座椅后面 → 直接原地结婚。

你不需要对方有多优秀，你需要的是那个"让你觉得被在乎"的瞬间。
问题是，这种瞬间来得太容易了，
所以你经常在"这是心动还是错觉"之间反复横跳。

【XP 症状清单】
✓ 看到对方认真工作侧脸就开始脑补未来
✓ 被摸头会当场死机三秒
✓ 对方说"我来吧"你就开始写婚礼致辞
✓ 一首歌就能把某个人从记忆深处炸出来
✓ 朋友说"你又来了"你说"这次不一样"

【轻收口】
你不是好骗，你只是相信好的东西会发生在自己身上。
这不是缺点，只是有点费纸巾。`,
    profile: { X1: 'L', X2: 'H', X3: 'H', X4: 'H' },
  },
  {
    slug: 'contract', code: 'ASPR', number: '#10',
    name: '合约恋人', tagline: '浪漫要有边界',
    color: '#f472b6', emoji: '📜',
    description: `【XP 一击】
我可以被宠，但别失控。

【翻译你的恋爱DNA】
你喜欢被照顾、被安排、被用仪式感包围。
但你的享受有一个边界——
一旦越界了，你会立刻切换成"风控模式"。

你是那种会在恋爱初期就想好"最坏情况怎么处理"的人。
你的纯爱是真的，你的理性也是真的。
你不是不信任对方，你只是信任自己多一点。

你的理想恋爱模式是：浪漫、稳定、可预期。
就像一份写好的合同——有甜蜜条款，也有退出机制。

【XP 症状清单】
✓ 喜欢被安排惊喜，但更喜欢对方提前剧透
✓ 纪念日必须过，但不需要太夸张
✓ 吵架的时候你会拿出"当初说好的"
✓ 对方突然改计划你会焦虑
✓ 你的"浪漫排行榜"里第一名是"靠谱"

【轻收口】
你不是不浪漫，你只是给浪漫加了安全锁。
有你在的恋爱，不会翻车。`,
    profile: { X1: 'L', X2: 'H', X3: 'H', X4: 'L' },
  },
  {
    slug: 'mood', code: 'ASCF', number: '#11',
    name: '情绪过山车', tagline: '坐享其成型',
    color: '#ef4444', emoji: '🎢',
    description: `【XP 一击】
我什么都不用做，自有人为我疯。

【翻译你的恋爱DNA】
你在关系里的角色是"被争夺的奖品"。
不是你故意端着，而是你天生就有一种让人想靠近的气质。
你享受被人围绕的感觉，也享受恋爱里的戏剧性。

平淡？不存在的。
你需要上头、吵架、和好、再上头的循环才觉得这是爱情。
你知道这不健康，但没有刺激的爱情你真·的·不·想·要。

【XP 症状清单】
✓ "我们冷静一下"是你的常用台词，但你一点都不冷静
✓ 越是得不到的越想要
✓ 对方太稳你就开始找茬
✓ 吵完架的和好让你比约会更上头
✓ 你的感情线像心电图，平了你反而慌

【轻收口】
你不是作，你只是觉得不波折的爱情太安静。
你要的不是安全感，是活着的感觉。`,
    profile: { X1: 'L', X2: 'H', X3: 'L', X4: 'H' },
  },
  {
    slug: 'partner', code: 'ASCR', number: '#12',
    name: '搭子人格', tagline: '低糖恋爱',
    color: '#10b981', emoji: '🧋',
    description: `【XP 一击】
恋爱是锦上添花，我自己就是花。

【翻译你的恋爱DNA】
你谈恋爱的终极目标是——舒服。
不需要每天说"我爱你"，不需要轰轰烈烈，
只需要周末一起吃个饭、偶尔一起看个电影就很满足了。

你享受有氛围感的陪伴，但不需要太浓。
对方不回消息你也不会焦虑，因为你自己也有很多事情要做。
你的恋爱哲学是"你来了很好，你走了我也OK"。

【XP 症状清单】
✓ 和对象约会和跟朋友出门心态差不多
✓ 觉得"陪伴"比"甜蜜"重要
✓ 对方太黏你你会觉得窒息
✓ 被朋友说"你谈恋爱和没谈一样"
✓ 理想型天花板：不打扰我的生活节奏

【轻收口】
你不是不爱，你只是爱得很轻。
轻到刚好不累，也刚好足够温暖。`,
    profile: { X1: 'L', X2: 'H', X3: 'L', X4: 'L' },
  },

  // ═══════════════════════════════ A (配合) + I (直觉) ═══════════════════════════════
  {
    slug: 'pure', code: 'AIPF', number: '#13',
    name: '纯爱战士', tagline: '赌上一切型',
    color: '#ec4899', emoji: '💗',
    description: `【XP 一击】
你是我的，我也只要你。

【翻译你的恋爱DNA】
你一旦喜欢上一个人，整个世界就只剩下这个人。
你不需要什么仪式感，不需要什么氛围——
一个眼神，一个瞬间，一个"就是他了"的直觉，就够了。

你愿意为了这个人倾尽所有，不计回报。
你的爱很纯粹、很深、很沉。
也正因为太纯了，所以每次心碎都是灭顶级别的。

你知道世界上可能没有童话，但你选择相信。

【XP 症状清单】
✓ 喜欢一个人的时间单位是"年"
✓ 分手后很久还会梦到对方
✓ 别人都在找"更好的"，你在等"那个人"
✓ 朋友说你"太认真了"你觉得恋爱不认真还叫恋爱吗
✓ 你的前任不多，但每一个都刻骨铭心

【轻收口】
你不是天真，你只是遇到对的人之前绝不将就。
这世界对纯爱战士不太友好，但你活该被好好爱。`,
    profile: { X1: 'L', X2: 'L', X3: 'H', X4: 'H' },
  },
  {
    slug: 'wait-n-see', code: 'AIPR', number: '#14',
    name: '等等党恋人', tagline: '爱可以但你先证明',
    color: '#8b5cf6', emoji: '⏳',
    description: `【XP 一击】
感动不是心动，别偷换概念。

【翻译你的恋爱DNA】
你的恋爱系统有一个超长的验证期。
不是你不想爱，是你需要先确认——
这个心动是真的心动，还是头脑发热。

你的直觉很准，但你不轻易相信直觉。
对方说什么不重要，你只看做了什么。
你的信任不是给的，是对方一点一点攒出来的。

你等得起，也经得起等。
能通过你验证期的人，才是真的值得。

【XP 症状清单】
✓ 被追三个月才答应出来吃饭
✓ 对方说"我喜欢你"你下意识回"为什么"
✓ 恋爱前期你说的最多的词是"再看看"
✓ 朋友着急你不着急，你觉得自己没毛病
✓ 一旦确定就all in，反差大到吓人

【轻收口】
你不是慢热，你是在给爱情做尽职调查。
能等到你说"好"的人，已经赢了。`,
    profile: { X1: 'L', X2: 'L', X3: 'H', X4: 'L' },
  },
  {
    slug: 'cat', code: 'AICF', number: '#15',
    name: '恋爱猫猫', tagline: '被吸引就凑近',
    color: '#f472b6', emoji: '🐱',
    description: `【XP 一击】
我不是花心，我是好奇心。

【翻译你的恋爱DNA】
你在恋爱里就像一只猫——
感兴趣了会凑近，无聊了就走开。
你不主动追谁，但你会被有趣的灵魂吸引。
你的心动完全靠直觉，来得快也走得快。

你喜欢保持一点距离，因为太近会让你不舒服。
你不是不爱，你只是需要在"独处"和"在一起"之间自由切换。
强迫你黏在一起？你会像被洗澡的猫一样疯狂挣扎。

【XP 症状清单】
✓ 今天超想见对方，明天又想一个人待着
✓ 对方越追你越跑，对方不追你你又凑上去
✓ 恋爱从来不发朋友圈
✓ 擅长制造"若即若离"的氛围
✓ 被朋友形容为"撩完就跑"

【轻收口】
你不是花心，你只是需要呼吸。
能让猫猫主动靠过来的人，一定特别特别好。`,
    profile: { X1: 'L', X2: 'L', X3: 'L', X4: 'H' },
  },
  {
    slug: 'buddha', code: 'AICR', number: '#16',
    name: '佛系恋爱', tagline: '来去自由型',
    color: '#78716c', emoji: '☁️',
    description: `【XP 一击】
有你很好，没你也行。

【翻译你的恋爱DNA】
你是恋爱界的"云淡风轻"本人。
不主动、不拒绝、不负责——
不对，最后一条划掉。你负责，只是不太上心。

你的生活已经很丰富了，恋爱在你的优先级排序里大概排第7。
你不缺安全感（自己给自己就够了），
不缺浪漫（独处就是浪漫），
不缺心动（心动太累了，你选择平静）。

你是最不容易受伤的类型，也是最让追你的人抓狂的类型。

【XP 症状清单】
✓ 被表白的第一反应是"啊？"
✓ 对方不回消息你根本没注意到
✓ 朋友说你"情商低"但其实你只是不在乎
✓ 最近一次心动是什么时候？你想不起来了
✓ 理想的恋爱状态：对方不打扰你就行

【轻收口】
你不是不会爱，你只是把爱的优先级排在了"活着"后面。
能让你费心思的人，简直是天选之人。`,
    profile: { X1: 'L', X2: 'L', X3: 'L', X4: 'L' },
  },
];

export function getXptiPersonalityBySlug(slug: string): XptiPersonalityType | undefined {
  return XPTI_PERSONALITY_TYPES.find(p => p.slug === slug);
}

export function getXptiPersonalityByCode(code: string): XptiPersonalityType | undefined {
  return XPTI_PERSONALITY_TYPES.find(p => p.code === code);
}

export function getAllXptiSlugs(): string[] {
  return XPTI_PERSONALITY_TYPES.map(p => p.slug);
}
