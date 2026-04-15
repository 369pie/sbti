import type { DimensionLevel } from './dimensions';
import { withBasePath } from '../site';

export type CptiRarityTier = 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';

export interface CptiRarityInfo {
  tier: CptiRarityTier;
  label: string;
  color: string;
  bgColor: string;
  populationPct: number;
}

const CPTI_RARITY_CONFIG: Record<CptiRarityTier, Omit<CptiRarityInfo, 'tier' | 'populationPct'>> = {
  legendary: { label: '传说级', color: '#fbbf24', bgColor: 'rgba(251,191,36,0.12)' },
  epic:      { label: '超稀有', color: '#a78bfa', bgColor: 'rgba(167,139,250,0.12)' },
  rare:      { label: '稀有',   color: '#60a5fa', bgColor: 'rgba(96,165,250,0.12)' },
  uncommon:  { label: '较少见', color: '#34d399', bgColor: 'rgba(52,211,153,0.12)' },
  common:    { label: '常见',   color: '#a8a29e', bgColor: 'rgba(168,162,158,0.12)' },
};

const CPTI_SLUG_RARITY: Record<string, { tier: CptiRarityTier; pct: number }> = {
  // legendary
  ceo:            { tier: 'legendary', pct: 1.5 },
  buddha:         { tier: 'legendary', pct: 1.8 },
  // epic
  tyrant:         { tier: 'epic', pct: 2.2 },
  coldwar:        { tier: 'epic', pct: 2.5 },
  screenwriter:   { tier: 'epic', pct: 2.8 },
  // rare
  mama:           { tier: 'rare', pct: 3.5 },
  missile:        { tier: 'rare', pct: 3.8 },
  tsundere:       { tier: 'rare', pct: 3.6 },
  rollercoaster:  { tier: 'rare', pct: 4.0 },
  // uncommon
  vibes:          { tier: 'uncommon', pct: 5.0 },
  chameleon:      { tier: 'uncommon', pct: 5.2 },
  supplier:       { tier: 'uncommon', pct: 5.5 },
  detail:         { tier: 'uncommon', pct: 4.8 },
  // common
  buddy:          { tier: 'common', pct: 6.5 },
  wildboy:        { tier: 'common', pct: 7.0 },
  balanced:       { tier: 'common', pct: 7.5 },
};

export function getCptiRarity(slug: string): CptiRarityInfo {
  const entry = CPTI_SLUG_RARITY[slug] ?? { tier: 'common' as CptiRarityTier, pct: 5.0 };
  const config = CPTI_RARITY_CONFIG[entry.tier];
  return { tier: entry.tier, populationPct: entry.pct, ...config };
}

export interface CptiPersonalityType {
  slug: string;
  code: string;
  name: string;
  tagline: string;
  description: string;
  profile: Record<string, DimensionLevel>;
  color: string;
  emoji: string;
}

export function getCptiTypeImage(slug: string): string {
  return withBasePath(`/images/types/cpti-${slug}.png`);
}

export function getCptiTypeThumbnailImage(slug: string): string {
  return withBasePath(`/images/types/thumbs/cpti-${slug}.webp`);
}

export const CPTI_PERSONALITY_TYPES: CptiPersonalityType[] = [
  {
    slug: 'ceo', code: 'CEO', name: '恋爱CEO', tagline: '这段关系，我来做主。',
    color: '#e11d48', emoji: '👔',
    description: '你在这段关系里就是甲方。约会去哪你安排，吵架了你定基调，连和好的节奏都是你说了算。但你不是控制狂——你只是天然觉得自己比对方更会规划。你的爱是"我帮你想好了"，你的表达方式是行动而非嘴甜。你会把两个人的纪念日、出行计划、甚至吵架后的和解步骤都安排得明明白白。对方可能觉得你有点强势，但离了你TA也不知道周末干什么。',
    profile: { C1: 'H', C2: 'H', C3: 'H', C4: 'H', C5: 'H' },
  },
  {
    slug: 'tyrant', code: 'TYRANT', name: '甜蜜暴君', tagline: '宠你也管你，不接受反驳。',
    color: '#dc2626', emoji: '👑',
    description: '你对另一半的掌控力极强，但出发点全是"为你好"。你会帮对方挑衣服、规划周末、甚至替TA拒绝不靠谱的社交邀请。你的爱是铺天盖地型的，甜的时候甜到齁，管的时候管到窒息。吵架你绝不会冷战——你会直接摊牌、正面刚，吵完了再用十倍的温柔哄回来。你的对象又爱又怕你，但离了你TA还真活不下去。',
    profile: { C1: 'H', C2: 'H', C3: 'H', C4: 'H', C5: 'M' },
  },
  {
    slug: 'mama', code: 'MAMA', name: '人间妈妈', tagline: '你吃了吗穿暖了吗快回消息。',
    color: '#ec4899', emoji: '🧸',
    description: '你在这段关系里的角色更像是一个操心命的妈。对方出门你叮嘱"路上小心"，对方加班你点好了外卖，对方感冒你恨不得飞过去喂药。你的付出指数爆表，但你不觉得累——你觉得这就是爱情该有的样子。唯一的问题是：你有时候分不清"照顾"和"控制"的边界。你以为自己在关心TA，但对方可能已经觉得喘不过气了。',
    profile: { C1: 'M', C2: 'H', C3: 'L', C4: 'H', C5: 'H' },
  },
  {
    slug: 'coldwar', code: 'COLDWAR', name: '已读不回终结者', tagline: '哦，嗯，好的。',
    color: '#64748b', emoji: '🧊',
    description: '你在关系里的杀手锏就是"冷"。不是不爱，是你表达爱的方式就是安静地待在旁边。吵架了？你选择沉默。不开心了？你选择已读不回。你觉得"时间能解决一切"，但你的对象觉得"你到底有没有在乎过"。你的冷不是无情，是你不知道怎么处理冲突。一旦局面稳定下来，你又会默默出现——买对方爱喝的奶茶，假装什么都没发生。',
    profile: { C1: 'H', C2: 'L', C3: 'L', C4: 'M', C5: 'L' },
  },
  {
    slug: 'vibes', code: 'VIBES', name: '恋爱氛围担当', tagline: '灯光音乐氛围感，我全负责。',
    color: '#f59e0b', emoji: '🕯️',
    description: '你是两个人之间的氛围制造机。约会你提前踩点找最好看的咖啡店，纪念日你准备对方完全想不到的惊喜，连吵架你都能选一个有氛围的地点展开对话。你的爱不是大声说出来的，而是藏在每一个精心安排的细节里。你在关系里更偏配合，但你的配合不是没主见——你是把主见全用在了"让这段关系更美好"上。',
    profile: { C1: 'M', C2: 'H', C3: 'L', C4: 'H', C5: 'M' },
  },
  {
    slug: 'missile', code: 'MISSILE', name: '撒娇核弹', tagline: '你不理我我就哭给你看。',
    color: '#f472b6', emoji: '🎀',
    description: '你在这段关系里的核武器就是撒娇。想吃什么——撒娇。想出门——撒娇。吵架了——先凶三秒然后立刻切换成撒娇模式。你的撒娇不是做作，是你天然觉得这是解决一切问题的最高效方式。而且事实证明你是对的——对方吃这一套。你在关系里偏被照顾的角色，但你的可爱有时候也会变成武器。当撒娇失效的时候，你的情绪炸弹就该登场了。',
    profile: { C1: 'L', C2: 'H', C3: 'H', C4: 'L', C5: 'H' },
  },
  {
    slug: 'tsundere', code: 'TSUNDERE', name: '嘴硬甜心', tagline: '谁稀罕你啊……但你怎么还不回。',
    color: '#ef4444', emoji: '😤',
    description: '你的恋爱人设就是"口嫌体正直"。嘴上说着"随便你"，心里已经刷了八遍对方的朋友圈。嘴上说"不用你管"，对方真不管了你比谁都急。你在关系里偏主导，但你的主导方式很别扭——你不会直接说"我想你"，你会说"你是不是很久没找我了"。你的对象一开始觉得你高冷，后来发现你只是嘴硬。你的反差萌就是你最大的魅力。',
    profile: { C1: 'H', C2: 'L', C3: 'H', C4: 'L', C5: 'M' },
  },
  {
    slug: 'buddy', code: 'BUDDY', name: '恋爱搭子', tagline: '一起吃饭逛街就够了。',
    color: '#06b6d4', emoji: '🤝',
    description: '你谈恋爱的方式跟交朋友没什么本质区别。不黏、不腻、不作，一起吃饭、看电影、偶尔牵个手就觉得很满足。你不需要每天说"我爱你"，也不需要什么仪式感，两个人舒服就行。你在关系里既不主导也不配合——你觉得最好的状态是"各自精彩，在一起更精彩"。你的对象可能偶尔会抱怨你不够浪漫，但你觉得：不累才是一段关系最重要的事。',
    profile: { C1: 'M', C2: 'L', C3: 'L', C4: 'M', C5: 'L' },
  },
  {
    slug: 'supplier', code: 'SUPPLIER', name: '安全感供应商', tagline: '有我在，你怕什么。',
    color: '#10b981', emoji: '🛡️',
    description: '你在关系里就是一棵大树——对方无论多焦虑多崩溃，靠着你就觉得稳了。你不会大声说甜言蜜语，但你的存在感比任何情话都有力量。你的爱是行动型的：接送上下班、生病时跑三趟药店、半夜三点接她的电话也不会有一丝不耐烦。你在关系里偏沉默寡言但全能靠谱。唯一的风险是：你太稳了，对方可能会觉得缺少惊喜。',
    profile: { C1: 'H', C2: 'L', C3: 'L', C4: 'H', C5: 'H' },
  },
  {
    slug: 'rollercoaster', code: 'COASTER', name: '情绪过山车', tagline: '上一秒想分手下一秒要抱抱。',
    color: '#f97316', emoji: '🎢',
    description: '你在这段关系里的情绪波动比股市还刺激。上午因为对方一个表情包笑到打滚，下午因为TA回消息慢了十分钟原地emo。你吵架的时候嘴特别厉害，能把"你不爱我了"说出十七种语调，但吵完了又秒变粘人精求抱抱。你的对象永远猜不到下一秒你是要笑还是要哭。你不是在作——你只是在感情里的情绪浓度比普通人高了十倍。',
    profile: { C1: 'L', C2: 'H', C3: 'H', C4: 'L', C5: 'H' },
  },
  {
    slug: 'chameleon', code: 'CHAMELEON', name: '恋爱变色龙', tagline: '你喜欢什么样我就变什么样。',
    color: '#22c55e', emoji: '🦎',
    description: '你在关系里的适应能力极强——对方喜欢吃辣你就练辣，对方喜欢健身你就办卡，对方喜欢看足球你就学越位规则。你不觉得这叫"没自我"，你觉得这叫"爱的主动融入"。你在关系里偏配合型，但你的配合不是委曲求全，而是你真心觉得"和对方同频"是一件快乐的事。唯一的问题是：时间久了，你可能会忘记自己原来喜欢什么。',
    profile: { C1: 'L', C2: 'H', C3: 'L', C4: 'H', C5: 'H' },
  },
  {
    slug: 'detail', code: 'DETAIL', name: '细节控恋人', tagline: '你三天前说的话我还记得。',
    color: '#7c3aed', emoji: '🔍',
    description: '你对这段关系的观察力堪称显微镜级别。对方换了新的洗发水你闻得出来，对方今天心情不好你一眼就看出来，对方三天前随口说的"好想吃草莓"你已经下单买好了。你的爱就是细节——别人觉得微不足道的小事，在你这里都是"我有在认真对待这段关系"的证明。但有时候你的细腻也会变成敏感：你注意到的"异常"，可能根本不是异常。',
    profile: { C1: 'L', C2: 'L', C3: 'L', C4: 'H', C5: 'M' },
  },
  {
    slug: 'screenwriter', code: 'WRITER', name: '恋爱编剧', tagline: '我已经想好吵架和好的台词了。',
    color: '#a855f7', emoji: '📝',
    description: '你在这段关系里不是在恋爱，你是在写剧本。你脑子里永远在预演下一幕：他要是这样说，我就这样回；我们要是吵架了，我先冷他三天然后写一封长信感动他。你对关系的理解全部来自偶像剧和小说，所以你的期待值永远比现实高出一个次元。你喜欢制造一点小戏剧感来确认对方的爱，但你的"剧本"总是翻车——因为真实的另一半不看剧本。',
    profile: { C1: 'H', C2: 'L', C3: 'H', C4: 'L', C5: 'H' },
  },
  {
    slug: 'buddha', code: 'BUDDHA', name: '恋爱佛祖', tagline: '有你也行没你也行。',
    color: '#78716c', emoji: '🧘',
    description: '你在恋爱里的佛系程度已经修炼到了出家级别。对方回不回消息你无所谓，约会取消你也无所谓，连吵架你都懒得吵——因为你觉得"有什么好吵的，吵赢了又怎样"。你的安全感来自自己，你不太需要对方的确认和回应。你觉得最好的伴侣关系就是"各过各的，需要的时候在就行"。你的对象可能会怀疑你到底爱不爱TA，但你知道答案是：爱，只是方式不太一样。',
    profile: { C1: 'M', C2: 'L', C3: 'L', C4: 'M', C5: 'L' },
  },
  {
    slug: 'wildboy', code: 'WILD', name: '野生男友/女友', tagline: '谈恋爱可以但别管我周末。',
    color: '#3b82f6', emoji: '🏄',
    description: '你在关系里的核心诉求就是自由。你可以很甜、可以很体贴、可以在需要的时候出现，但你绝对不能接受"被管着"。你有自己的朋友圈、自己的爱好、自己的周末计划，恋爱是你生活的一部分，不是全部。你不是不在乎，你只是觉得两个人都有自己的空间才是健康的关系。你的对象有时觉得你像一只养不熟的猫——你主动凑过来的时候甜死人，但你想走的时候谁也拦不住。',
    profile: { C1: 'H', C2: 'M', C3: 'M', C4: 'L', C5: 'L' },
  },
  {
    slug: 'balanced', code: 'BALANCE', name: 'CP模范生', tagline: '教科书式的恋爱，但一点也不无聊。',
    color: '#0ea5e9', emoji: '⚖️',
    description: '你是所有CP角色里最"正常"的那一个——但"正常"绝对不意味着"无聊"。你的主导力恰到好处、表达力不多不少、付出和被宠之间完美平衡。你吵架不会太过火也不会冷战太久，你的恋爱节奏像一首旋律刚好的歌。你不会让对方太累也不会让自己太委屈。你的关系让旁人羡慕，但你自己心里清楚：这不是天生的，是你一直在用心经营。',
    profile: { C1: 'M', C2: 'M', C3: 'M', C4: 'M', C5: 'M' },
  },
];

export function getCptiPersonalityBySlug(slug: string): CptiPersonalityType | undefined {
  return CPTI_PERSONALITY_TYPES.find(p => p.slug === slug);
}

export function getAllCptiSlugs(): string[] {
  return CPTI_PERSONALITY_TYPES.map(p => p.slug);
}
