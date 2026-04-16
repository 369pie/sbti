import type { DimensionLevel } from './dimensions';
import { withBasePath } from '../site';

export type LoveRarityTier = 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';

export interface LoveRarityInfo {
  tier: LoveRarityTier;
  label: string;
  color: string;
  bgColor: string;
  populationPct: number;
}

const LOVE_RARITY_CONFIG: Record<LoveRarityTier, Omit<LoveRarityInfo, 'tier' | 'populationPct'>> = {
  legendary: { label: '传说级', color: '#fbbf24', bgColor: 'rgba(251,191,36,0.12)' },
  epic:      { label: '超稀有', color: '#a78bfa', bgColor: 'rgba(167,139,250,0.12)' },
  rare:      { label: '稀有',   color: '#60a5fa', bgColor: 'rgba(96,165,250,0.12)' },
  uncommon:  { label: '较少见', color: '#34d399', bgColor: 'rgba(52,211,153,0.12)' },
  common:    { label: '常见',   color: '#a8a29e', bgColor: 'rgba(168,162,158,0.12)' },
};

const LOVE_SLUG_RARITY: Record<string, { tier: LoveRarityTier; pct: number }> = {
  // legendary
  emperor:  { tier: 'legendary', pct: 1.5 },
  monk:     { tier: 'legendary', pct: 1.8 },
  // epic
  lick:     { tier: 'epic', pct: 2.2 },
  spy:      { tier: 'epic', pct: 2.5 },
  atm:      { tier: 'epic', pct: 2.8 },
  // rare
  vinegar:  { tier: 'rare', pct: 3.5 },
  bomb:     { tier: 'rare', pct: 3.8 },
  freeze:   { tier: 'rare', pct: 4.0 },
  puppet:   { tier: 'rare', pct: 3.6 },
  // uncommon
  sweet:    { tier: 'uncommon', pct: 5.0 },
  chill:    { tier: 'uncommon', pct: 5.5 },
  clingy:   { tier: 'uncommon', pct: 5.2 },
  fish:     { tier: 'uncommon', pct: 4.8 },
  // common
  buddy:    { tier: 'common', pct: 6.5 },
  balance:  { tier: 'common', pct: 7.0 },
  sleepy:   { tier: 'common', pct: 7.5 },
};

export function getLoveRarity(slug: string): LoveRarityInfo {
  const entry = LOVE_SLUG_RARITY[slug] ?? { tier: 'common' as LoveRarityTier, pct: 5.0 };
  const config = LOVE_RARITY_CONFIG[entry.tier];
  return { tier: entry.tier, populationPct: entry.pct, ...config };
}

export interface LovePersonalityType {
  slug: string;
  code: string;
  name: string;
  tagline: string;
  description: string;
  profile: Record<string, DimensionLevel>;
  color: string;
  emoji: string;
}

export function getLoveTypeImage(slug: string): string {
  return withBasePath(`/images/types/love/love-${slug}.png`);
}

export function getLoveTypeThumbnailImage(slug: string): string {
  return withBasePath(`/images/types/love/thumbs/love-${slug}.webp`);
}

export function getLoveTypeMediumImage(slug: string): string {
  return withBasePath(`/images/types/love/medium/love-${slug}.webp`);
}

export const LOVE_PERSONALITY_TYPES: LovePersonalityType[] = [
  {
    slug: 'lick', code: 'LICK', name: '舔狗', tagline: '舔到最后一无所有。',
    color: '#f43f5e', emoji: '🐶',
    description: '你把"付出感"刻在了DNA里。对方说想吃草莓，你能半夜跑三条街去买；对方说有点冷，你恨不得把自己也快递过去。你不是不知道自己在舔，你只是觉得"只要我对TA够好，TA总会感动的"。然而你慢慢发现——感动不等于心动。你的好被当作理所当然，你的牺牲反而让对方有负担。但你还是停不下来，因为你觉得一旦停下来就会失去。',
    profile: { L1: 'H', L2: 'H', L3: 'H', L4: 'L', L5: 'L' },
  },
  {
    slug: 'vinegar', code: 'VINEGAR', name: '醋王', tagline: '这位同学，你的醋已经溢出来了。',
    color: '#f59e0b', emoji: '🫙',
    description: '你的嫉妒心不是坏事——说明你在乎。但问题是你在乎过了头。对象跟谁聊天、朋友圈给谁点赞、甚至路上多看了谁一眼，你都能精准捕捉并展开深度分析。你的大脑里有一个24小时运转的"威胁扫描系统"，任何有可能对你们关系产生威胁的人和事，你都自动标记高亮。你不是不信任对方，你只是太害怕失去了。',
    profile: { L1: 'M', L2: 'H', L3: 'M', L4: 'L', L5: 'H' },
  },
  {
    slug: 'emperor', code: 'EMPEROR', name: '朕系恋人', tagline: '这段关系，朕来定调。',
    color: '#dc2626', emoji: '👑',
    description: '你在恋爱里自带领导气场。不是控制欲强，而是你天生就知道自己想要什么、底线在哪。你的安全感不需要别人给——你自己就是自己的安全感。你对伴侣的要求是配合而不是服从，你能包容很多事，但绝不接受背叛和敷衍。你的爱是有分量的：给出去的时候很珍贵，收回来的时候也很果断。很少人能真正走进你心里，但走进去的那个人，会被你宠得很好。',
    profile: { L1: 'L', L2: 'L', L3: 'L', L4: 'H', L5: 'L' },
  },
  {
    slug: 'bomb', code: 'BOMB', name: '定时炸弹', tagline: '三…二…一…你完了！',
    color: '#ef4444', emoji: '💣',
    description: '你的情绪就像一颗不定时炸弹——大部分时候你温柔、可爱，但一旦踩到你的雷区，全世界都要遭殃。你的爆发不是无缘无故的，只是之前攒的委屈太多了，一次性全炸出来而已。你吵架的时候嘴巴特别厉害，分分钟能把对方说到怀疑人生。但吵完之后你又会后悔，然后默默生自己的气。你的感情模式就是"攒→爆→悔→攒"的循环。',
    profile: { L1: 'H', L2: 'H', L3: 'M', L4: 'L', L5: 'H' },
  },
  {
    slug: 'atm', code: 'ATM', name: '恋爱ATM', tagline: '你的爱情就是一部提款机。',
    color: '#22c55e', emoji: '💰',
    description: '你表达爱意的方式特别直接——送礼物、请吃饭、买买买。不是因为你以为爱情可以用钱买到，而是因为你不太会用嘴说甜言蜜语，花钱就是你展示"我在乎你"的语言。你的对象生日你提前两个月开始选礼物，约会你必买单，对方随口说喜欢什么东西你就已经下单了。你觉得"对TA好=让TA不缺"。但有时候对方需要的不是一个包，而是一句"我想你了"。',
    profile: { L1: 'M', L2: 'L', L3: 'H', L4: 'H', L5: 'L' },
  },
  {
    slug: 'spy', code: 'SPY', name: '人形雷达', tagline: '你在哪，我比北斗先知道。',
    color: '#7c3aed', emoji: '🔍',
    description: '你堪称恋爱界的FBI。对方的朋友圈动态你要逐条分析，微信运动步数你每天都看，连WiFi连接记录你都能推理出对方去了哪里。你不觉得这叫"控制"，你觉得这叫"关心"。你的查岗技能已经进化到了Art级别——不用翻手机也能通过对方的表情变化判断刚才谁发了消息。你知道自己有点过了，但你控制不住。因为你太害怕被骗了。',
    profile: { L1: 'H', L2: 'H', L3: 'H', L4: 'L', L5: 'M' },
  },
  {
    slug: 'monk', code: 'MONK', name: '戒爱大师', tagline: '阿弥陀佛，恋爱随缘。',
    color: '#78716c', emoji: '🧘',
    description: '你对恋爱的态度是：可有可无，随缘就好。别人在纠结要不要表白的时候，你在想今晚吃什么。你不是不能爱，只是你觉得一个人生活也挺好的——不用迁就谁、不用报备行程、不用猜谁生气了。你的精神状态稳如泰山，内耗什么的跟你完全不沾边。唯一的问题是：你可能会让喜欢你的人觉得，你永远不会主动向前一步。',
    profile: { L1: 'L', L2: 'L', L3: 'L', L4: 'H', L5: 'L' },
  },
  {
    slug: 'puppet', code: 'PUPPET', name: '遥控恋人', tagline: 'TA 按一下，我动一下。',
    color: '#94a3b8', emoji: '🪆',
    description: '你在恋爱里完全没有自己的立场。对方说想吃火锅你就火锅，对方说想看恐怖片你也行。你不是没有想法，你只是觉得"听对方的就不会吵架"。你的退让一开始看起来很体贴，但时间久了会变成一种负担——对方会觉得你没个性、不真实，甚至会故意试探你的底线在哪。你需要知道：有自己的想法不等于不爱对方，一味迎合也不是爱。',
    profile: { L1: 'H', L2: 'L', L3: 'H', L4: 'L', L5: 'L' },
  },
  {
    slug: 'sweet', code: 'SWEET', name: '甜蜜暴击', tagline: '让全世界知道我们在谈恋爱！',
    color: '#ec4899', emoji: '🍬',
    description: '你谈恋爱的画风就是甜甜甜甜甜。朋友圈全是你们的合照，聊天记录里满是"宝宝""亲亲""抱抱"，连备注名都是一串爱心emoji。你不是在秀恩爱，你是真的觉得恋爱就应该这么甜。你会给对方取十七八个昵称，记住每一个纪念日，对方打个喷嚏你都要心疼半天。你的朋友们已经习惯了你的甜蜜暴击，只能默默屏蔽你的朋友圈。',
    profile: { L1: 'H', L2: 'M', L3: 'H', L4: 'M', L5: 'M' },
  },
  {
    slug: 'freeze', code: 'FREEZE', name: '热恋闪退', tagline: '上头三天，冷却三周。',
    color: '#06b6d4', emoji: '🧊',
    description: '你是恋爱界的"三分钟热度"专业户。追你的时候热情似火，追到手之后迅速降温。不是你渣，是你对"征服"这件事上头，对"维持"这件事提不起劲。你谈恋爱的节奏永远是同一个剧情：疯狂心动→确定关系→逐渐无聊→开始冷淡→放弃或被放弃。你也困惑：为什么每段感情都是这样？其实你真正上瘾的不是爱情，是暧昧期的多巴胺。',
    profile: { L1: 'L', L2: 'L', L3: 'M', L4: 'H', L5: 'M' },
  },
  {
    slug: 'fish', code: 'FISH', name: '养鱼大师', tagline: '池塘里不能只有一条鱼嘛。',
    color: '#3b82f6', emoji: '🐠',
    description: '你的社交列表里永远有好几个"暧昧对象"。你不觉得这叫渣，你觉得这叫"还没确定关系之前都是合法的"。你很擅长给每个人刚好的关注度——不会多到像在谈恋爱，也不会少到让人放弃。你的聊天技术一流，回复速度恰到好处，偶尔消失又恰好让人更想你。你可能自己也没想好要跟谁在一起，但把所有人吊在半空中的感觉让你很有安全感。',
    profile: { L1: 'L', L2: 'L', L3: 'L', L4: 'H', L5: 'H' },
  },
  {
    slug: 'clingy', code: 'CLINGY', name: '树袋熊', tagline: '挂在你身上不想下来。',
    color: '#a78bfa', emoji: '🐨',
    description: '你的恋爱模式就是"黏"。你恨不得24小时和对象贴在一起，走路要牵手、吃饭要坐旁边、睡觉要抱着。你对亲密的需求极高，觉得恋爱就应该腻腻歪歪。你不太能理解那种"各过各的"恋爱方式——那叫什么恋爱？叫远程合租好吧。你的黏人有时候会让对方觉得甜蜜，有时候也会让对方想喘口气。但你控制不住，你就是那只粘在树上不想下来的考拉。',
    profile: { L1: 'H', L2: 'M', L3: 'H', L4: 'M', L5: 'L' },
  },
  {
    slug: 'chill', code: 'CHILL', name: '佛系恋人', tagline: '你开心就好，我无所谓。',
    color: '#10b981', emoji: '☘️',
    description: '你在恋爱里的存在感就像空气——很重要但很淡。你不吃醋、不作闹、不黏人，对方做什么你都"嗯好""随便""都行"。你不是不爱，你只是觉得恋爱不应该那么累。你的安全感来自自己，不太需要对方的确认和回应。你的恋爱哲学是"舒服就待着，不舒服就走"。很多人会被你的松弛感吸引，但也有人会因为得不到回应而离开。',
    profile: { L1: 'L', L2: 'L', L3: 'M', L4: 'H', L5: 'L' },
  },
  {
    slug: 'balance', code: 'BALANCE', name: '双开战神', tagline: '工作恋爱，我都不想掉线。',
    color: '#f97316', emoji: '⚖️',
    description: '你是所有人格里最"正常"的那个——但"正常"不代表"无趣"。你很懂得平衡恋爱和生活的关系，不会因为恋爱耽误工作，也不会因为工作冷落对象。你的时间管理能力在恋爱里也适用：工作日好好努力，周末给对象安排惊喜。你谈恋爱像经营一个项目——有计划、有执行、有复盘。虽然不够浪漫，但你的对象会觉得很安心。',
    profile: { L1: 'M', L2: 'M', L3: 'M', L4: 'H', L5: 'M' },
  },
  {
    slug: 'buddy', code: 'BUDDY', name: '搭子对象', tagline: '亲是亲了，画风还是兄弟。',
    color: '#06b6d4', emoji: '🤜',
    description: '你谈恋爱的方式跟交朋友差不多——不会太黏、不会太甜、不会太作，一起打游戏、互怼、偶尔正经一下。你觉得最好的感情就是"舒服"，不需要仪式感也不需要甜言蜜语。你跟对象相处就像好哥们儿加个亲嘴功能。你的对象有时候会抱怨：你能不能浪漫一点？但你觉得：不做作的感情才走得远啊。',
    profile: { L1: 'L', L2: 'M', L3: 'L', L4: 'H', L5: 'M' },
  },
  {
    slug: 'sleepy', code: 'SLEEPY', name: '开窍延迟', tagline: '爱意发货了，我这边还没签收。',
    color: '#6366f1', emoji: '😴',
    description: '你在恋爱里的存在感比透明还透明。你不是不爱，你只是反应太慢了。对方给你暗示你看不懂，对方生气你不知道为什么，对方说"你猜"你就真的开始猜。你的情感迟钝不是冷漠，是真的对感情这件事不太敏感。你可能在一段关系里待了三个月才突然反应过来"哦我好像在谈恋爱"。你需要的不是教你如何恋爱，而是找一个足够耐心等你开窍的人。',
    profile: { L1: 'L', L2: 'L', L3: 'L', L4: 'M', L5: 'L' },
  },
];

export function getLovePersonalityBySlug(slug: string): LovePersonalityType | undefined {
  return LOVE_PERSONALITY_TYPES.find(p => p.slug === slug);
}

export function getAllLoveSlugs(): string[] {
  return LOVE_PERSONALITY_TYPES.map(p => p.slug);
}
