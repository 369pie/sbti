import type { DimensionLevel } from './dimensions';
import { withBasePath } from './site';

export type RarityTier = 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';

export interface RarityInfo {
  tier: RarityTier;
  label: string;
  color: string;
  bgColor: string;
  populationPct: number; // estimated % of test-takers matching this type
}

const RARITY_CONFIG: Record<RarityTier, Omit<RarityInfo, 'tier' | 'populationPct'>> = {
  legendary: { label: '传说级', color: '#fbbf24', bgColor: 'rgba(251,191,36,0.12)' },
  epic:      { label: '超稀有', color: '#a78bfa', bgColor: 'rgba(167,139,250,0.12)' },
  rare:      { label: '稀有',   color: '#60a5fa', bgColor: 'rgba(96,165,250,0.12)' },
  uncommon:  { label: '较少见', color: '#34d399', bgColor: 'rgba(52,211,153,0.12)' },
  common:    { label: '常见',   color: '#a8a29e', bgColor: 'rgba(168,162,158,0.12)' },
};

// Rarity assignment based on profile extremity (H/L count out of 15 dims)
// More extreme profiles → harder to match → rarer
const SLUG_RARITY: Record<string, { tier: RarityTier; pct: number }> = {
  // 12 extreme dims — legendary (~1.5%)
  boss:    { tier: 'legendary', pct: 1.2 },
  nerd:    { tier: 'legendary', pct: 1.8 },
  // 11 extreme dims — epic (~2-3%)
  ctrl:    { tier: 'epic', pct: 2.1 },
  mum:     { tier: 'epic', pct: 2.5 },
  simp:    { tier: 'epic', pct: 2.8 },
  solo:    { tier: 'epic', pct: 2.3 },
  sleep:   { tier: 'epic', pct: 3.0 },
  'game-r':{ tier: 'epic', pct: 2.6 },
  drunk:   { tier: 'epic', pct: 1.9 },
  // 10 extreme dims — rare (~3-4%)
  'oh-no': { tier: 'rare', pct: 3.5 },
  'thin-k':{ tier: 'rare', pct: 3.2 },
  drama:   { tier: 'rare', pct: 3.8 },
  chill:   { tier: 'rare', pct: 4.0 },
  emo:     { tier: 'rare', pct: 3.6 },
  // 8-9 extreme dims — uncommon (~4-6%)
  'atm-er':{ tier: 'uncommon', pct: 4.5 },
  'dior-s':{ tier: 'uncommon', pct: 5.2 },
  sexy:    { tier: 'uncommon', pct: 4.8 },
  malo:    { tier: 'uncommon', pct: 5.5 },
  'luck-y':{ tier: 'uncommon', pct: 4.2 },
  shy:     { tier: 'uncommon', pct: 5.0 },
  rebel:   { tier: 'uncommon', pct: 4.6 },
  // 6-7 extreme dims — common (~5-8%)
  'than-k':{ tier: 'common', pct: 5.8 },
  woc:     { tier: 'common', pct: 6.2 },
  party:   { tier: 'common', pct: 6.5 },
  'talk-er':{ tier: 'common', pct: 7.0 },
  'love-r':{ tier: 'common', pct: 7.5 },
  'food-ie':{ tier: 'common', pct: 8.0 },
};

export function getRarity(slug: string): RarityInfo {
  const entry = SLUG_RARITY[slug] ?? { tier: 'common' as RarityTier, pct: 5.0 };
  const config = RARITY_CONFIG[entry.tier];
  return { tier: entry.tier, populationPct: entry.pct, ...config };
}

export interface PersonalityType {
  slug: string;
  code: string;
  name: string;
  tagline: string;
  description: string;
  profile: Record<string, DimensionLevel>;
  color: string;
  emoji: string;
  isSpecial?: boolean;
}

const JPG_SLUGS = new Set(['dior-s', 'drama']);

export function getTypeImage(slug: string): string {
  const ext = JPG_SLUGS.has(slug) ? 'jpg' : 'png';
  return withBasePath(`/images/types/${slug}.${ext}`);
}

export const PERSONALITY_TYPES: PersonalityType[] = [
  {
    slug: 'ctrl', code: 'CTRL', name: '拿捏者', tagline: '怎么样，被我拿捏了吧？',
    color: '#f59e0b', emoji: '🎯',
    description: '恭喜您，您测出了极其罕见的人格。CTRL 是行走的人形任务管理器，普通人眼中的"规则"，在您这里只是出厂预设。凡人所谓的"计划"，对您而言不过是随手涂鸦。拥有一个 CTRL 朋友意味着你的人生导航系统精准度直接拉满。CTRL 最会拿捏了——拿捏分寸、拿捏人心、拿捏一切可以拿捏的东西。你不是控制欲强，你只是比所有人都更清楚怎么把事情做到最好。别人还在纠结要不要开始的时候，你已经做完在收尾了。',
    profile: { S1: 'H', S2: 'H', S3: 'H', E1: 'H', E2: 'M', E3: 'H', A1: 'M', A2: 'H', A3: 'H', Ac1: 'H', Ac2: 'H', Ac3: 'H', So1: 'M', So2: 'H', So3: 'M' },
  },
  {
    slug: 'atm-er', code: 'ATM-er', name: '送钱者', tagline: '你以为我很有钱吗？',
    color: '#22c55e', emoji: '💸',
    description: 'ATM-er 人格的核心特征就是"给"。不是因为有钱，而是因为在你的价值排序里，看到别人开心比自己的余额重要。你请客、你送礼、你抢着买单，不是装大方，而是那一刻的满足感真的值那个价。但你要注意：不是所有人都值得你这样。世界上有两种人——一种值得你掏钱包，另一种只是在等你掏。学会分清，你的慷慨才不会变成冤大头。',
    profile: { S1: 'M', S2: 'L', S3: 'M', E1: 'L', E2: 'H', E3: 'L', A1: 'M', A2: 'L', A3: 'M', Ac1: 'M', Ac2: 'L', Ac3: 'M', So1: 'H', So2: 'L', So3: 'H' },
  },
  {
    slug: 'dior-s', code: 'Dior-s', name: '屌丝', tagline: '等着我屌丝逆袭。',
    color: '#78716c', emoji: '🐸',
    description: '别急着不开心——屌丝不是贬义词，是一种来自民间的韧性结晶。你清楚自己的起点不算高，但你从来没放弃过往上爬的念头。Dior-s 人格最厉害的地方在于：你对"底部"不陌生，这让你比那些从小一帆风顺的人更抗摔。你的自嘲不是自卑，是一种幽默武器。总有一天你会逆袭的，到时候请记得回头拉兄弟一把。',
    profile: { S1: 'L', S2: 'L', S3: 'M', E1: 'M', E2: 'M', E3: 'L', A1: 'L', A2: 'M', A3: 'L', Ac1: 'L', Ac2: 'L', Ac3: 'M', So1: 'L', So2: 'M', So3: 'L' },
  },
  {
    slug: 'boss', code: 'BOSS', name: '领导者', tagline: '方向盘给我，我来开。',
    color: '#dc2626', emoji: '👔',
    description: 'BOSS 人格天生带有一种"指挥部气场"。你走进一个房间，不需要开口就已经成了中心。你不是喜欢控制别人，而是你实在看不下去事情乱糟糟的样子。拿过来，理清楚，安排好，推进——这就是你的本能反应。在你的字典里没有"等等看"，只有"现在就干"。唯一的问题是你偶尔得学会方向盘也可以暂时放手。',
    profile: { S1: 'H', S2: 'H', S3: 'H', E1: 'M', E2: 'M', E3: 'H', A1: 'H', A2: 'H', A3: 'H', Ac1: 'H', Ac2: 'H', Ac3: 'H', So1: 'H', So2: 'H', So3: 'M' },
  },
  {
    slug: 'than-k', code: 'THAN-K', name: '感恩者', tagline: '感谢苍天！感谢大地！',
    color: '#eab308', emoji: '🙏',
    description: 'THAN-K 人格的核心是一颗感恩的心。不是那种表演式的"谢谢"，而是真的能从一杯奶茶、一条问候里感受到幸福的能力。在别人抱怨工资低、天气热、堵车烦的时候，你却在想"至少我今天还活着"。这种能力是天赋。你不是没有烦恼，而是你的幸福阈值足够低——这在这个时代，是一种稀有的超能力。',
    profile: { S1: 'M', S2: 'M', S3: 'H', E1: 'H', E2: 'H', E3: 'M', A1: 'H', A2: 'M', A3: 'H', Ac1: 'M', Ac2: 'M', Ac3: 'M', So1: 'M', So2: 'L', So3: 'H' },
  },
  {
    slug: 'oh-no', code: 'OH-NO', name: '哦不人', tagline: '哦不！我怎么会是这个人格？！',
    color: '#f97316', emoji: '😱',
    description: '哦不！你中招了。OH-NO 人格的核心状态就是一遍又一遍地对生活说"哦不"。起床迟了——哦不！忘带钥匙——哦不！喜欢的人读了不回——哦不！但你知道吗？你的这种反应，其实是一种极其敏感的环境雷达。你对变化的感知力超过大部分人。问题在于你的反应阈值太低了，蚊子叮一口也能触发红色警报。学会在"哦不"之后加一句"但没关系"，你就无敌了。',
    profile: { S1: 'L', S2: 'M', S3: 'L', E1: 'L', E2: 'M', E3: 'L', A1: 'L', A2: 'L', A3: 'L', Ac1: 'L', Ac2: 'M', Ac3: 'L', So1: 'M', So2: 'L', So3: 'M' },
  },
  {
    slug: 'mum', code: 'MUM', name: '妈妈', tagline: '或许…我可以叫你妈妈吗？',
    color: '#ec4899', emoji: '🤱',
    description: 'MUM 人格是人群中的温度计。你总是第一个注意到谁不开心、谁没吃饭、谁需要安慰的人。你的照顾欲是写在 DNA 里的，不是刻意表演。朋友圈里你是那个大家都想倾诉的对象，群局里你是那个帮大家点菜的人。但你有时候忙着照顾别人，会忘了自己也需要被照顾。记住：妈妈也需要妈妈。',
    profile: { S1: 'H', S2: 'M', S3: 'H', E1: 'H', E2: 'H', E3: 'L', A1: 'H', A2: 'M', A3: 'H', Ac1: 'M', Ac2: 'H', Ac3: 'M', So1: 'H', So2: 'L', So3: 'H' },
  },
  {
    slug: 'sexy', code: 'SEXY', name: '尤物', tagline: '我不是故意的，我天生如此。',
    color: '#e11d48', emoji: '✨',
    description: '你就是那种走在路上回头率莫名其妙很高的人。SEXY 人格不一定和外貌有关，它更像是一种"人格魅力浓度"极高的状态。你说话有分寸、自信但不张扬、会照顾别人的情绪、又不会委屈自己——这几点叠加在一起，就形成了一种让人想靠近的磁场。你不需要刻意吸引谁，你的存在本身就已经够有说服力了。',
    profile: { S1: 'H', S2: 'H', S3: 'M', E1: 'M', E2: 'H', E3: 'M', A1: 'M', A2: 'M', A3: 'H', Ac1: 'H', Ac2: 'M', Ac3: 'H', So1: 'H', So2: 'M', So3: 'H' },
  },
  {
    slug: 'love-r', code: 'LOVE-R', name: '多情者', tagline: '世界上最不缺的就是让我心动的人。',
    color: '#f472b6', emoji: '💕',
    description: 'LOVE-R 人格的核心是"容易被打动"。一个眼神、一句不经意的话、一个恰到好处的笑容——都可以让你心里泛起涟漪。你不是花心，你只是对美好的事物有天然的感知力。你在关系里很投入、很用心、也很容易受伤。你的多情不是随便，而是你比大多数人都更认真地对待每一段感情。只是有时候你得学会：心动过后，先观察一下再行动。',
    profile: { S1: 'M', S2: 'M', S3: 'M', E1: 'M', E2: 'H', E3: 'L', A1: 'M', A2: 'M', A3: 'H', Ac1: 'M', Ac2: 'M', Ac3: 'M', So1: 'H', So2: 'L', So3: 'H' },
  },
  {
    slug: 'thin-k', code: 'THIN-K', name: '思考者', tagline: '让我再想想。',
    color: '#6366f1', emoji: '🧠',
    description: '在别人已经行动的时候，你还在思考。不是因为犹豫，而是因为你的大脑需要先把事情想通透了才肯放过自己。THIN-K 人格是天生的分析机器。你擅长拆解复杂问题、发现隐藏逻辑、预判可能的坑。你在别人眼里可能"想太多"，但你知道正是这些思考帮你避开了多少雷。唯一的副作用是偶尔会失眠——毕竟你的大脑不太会主动关机。',
    profile: { S1: 'M', S2: 'H', S3: 'M', E1: 'H', E2: 'L', E3: 'H', A1: 'H', A2: 'H', A3: 'M', Ac1: 'M', Ac2: 'H', Ac3: 'M', So1: 'L', So2: 'H', So3: 'L' },
  },
  {
    slug: 'malo', code: 'MALO', name: '吗喽', tagline: '吗喽就是吗喽，有什么好说的。',
    color: '#a16207', emoji: '🐒',
    description: '吗喽的核心状态是"随大流"。不是因为没主见，而是因为你发现：在大部分情况下，跟着走其实是效率最高的策略。你不争不抢、不出头、不掉队，像一只行走在人群中的隐身猴。你的存在感不强，但你的观察力极强。你看清了太多，所以更不愿意参与。这让你在热闹的场合里成了最清醒的人，也是最孤独的人。',
    profile: { S1: 'L', S2: 'L', S3: 'L', E1: 'M', E2: 'M', E3: 'M', A1: 'L', A2: 'L', A3: 'M', Ac1: 'L', Ac2: 'L', Ac3: 'L', So1: 'M', So2: 'M', So3: 'M' },
  },
  {
    slug: 'woc', code: 'WOC!', name: '握草人', tagline: '握草！这也行？！',
    color: '#ef4444', emoji: '🤯',
    description: '你的口头禅是"握草"。不是因为词汇量有限，而是因为你每天遇到的离谱事确实很多。WOC! 人格的反应阈值比较低，这意味着你对惊喜、惊吓、惊讶的感知力都极高。你是朋友圈里最好的反应搭子——有什么新鲜事第一个告诉你准没错，因为你的反应永远到位。你让周围的人觉得"和你在一起从来不无聊"。',
    profile: { S1: 'M', S2: 'L', S3: 'M', E1: 'M', E2: 'H', E3: 'M', A1: 'L', A2: 'M', A3: 'L', Ac1: 'M', Ac2: 'L', Ac3: 'M', So1: 'H', So2: 'M', So3: 'H' },
  },
  {
    slug: 'nerd', code: 'NERD', name: '书呆子', tagline: '这个我研究过。',
    color: '#3b82f6', emoji: '📚',
    description: '你对知识的渴望就像别人对奶茶的渴望一样——每天不来一杯就浑身难受。NERD 人格不只是"爱读书"，更是一种"需要把事情搞明白"的强迫性好奇。当同事在茶水间聊八卦的时候，你可能在研究为什么咖啡机出水不均匀。你的社交面可能不广，但你在自己的领域里几乎是不可替代的。深度，就是你的护城河。',
    profile: { S1: 'M', S2: 'H', S3: 'H', E1: 'M', E2: 'L', E3: 'H', A1: 'H', A2: 'H', A3: 'M', Ac1: 'H', Ac2: 'H', Ac3: 'H', So1: 'L', So2: 'H', So3: 'L' },
  },
  {
    slug: 'drama', code: 'DRAMA', name: '戏精', tagline: '这届奥斯卡，非我莫属。',
    color: '#d946ef', emoji: '🎭',
    description: '你的人生就像一部永不停播的连续剧。DRAMA 人格的核心不是"假"，而是"投入"。你做什么都全情投入、反应强烈、情绪饱满。开心的时候你能笑到周围人都跟着笑，难过的时候你能让整个房间的气压都降低两个点。你是天生的感染者——只是有时候你自己都分不清是真情流露还是演技炸裂了。',
    profile: { S1: 'H', S2: 'M', S3: 'L', E1: 'L', E2: 'H', E3: 'L', A1: 'L', A2: 'M', A3: 'M', Ac1: 'H', Ac2: 'M', Ac3: 'M', So1: 'H', So2: 'L', So3: 'H' },
  },
  {
    slug: 'chill', code: 'CHILL', name: '佛系人', tagline: '都行，随便，无所谓。',
    color: '#64748b', emoji: '🧘',
    description: '佛系不是颓废，是一种高级的心理节能模式。CHILL 人格的内核是：你已经想通了很多事，所以不再浪费能量在不值得的事情上。加班？行吧。不加？也行。涨薪？不错。没涨？也活得下去。你不是没有欲望，而是你的欲望被一个自动筛选器过滤过了——不重要的，全都放走。这让你在这个人人焦虑的时代显得格外珍贵。',
    profile: { S1: 'M', S2: 'M', S3: 'L', E1: 'H', E2: 'L', E3: 'H', A1: 'M', A2: 'L', A3: 'L', Ac1: 'L', Ac2: 'L', Ac3: 'L', So1: 'M', So2: 'H', So3: 'M' },
  },
  {
    slug: 'emo', code: 'EMO', name: '情绪人', tagline: '我今天又 emo 了。',
    color: '#7c3aed', emoji: '🌧️',
    description: '你的情绪就像天气预报——每天都在变，而且经常不准。EMO 人格的核心是"敏感"。你能感受到别人察觉不到的细微变化：语气、表情、标点符号甚至回复速度。这是一种天赋，也是一种负担。你的共情能力极强，但代价是你要承受双倍的情绪波动。学会给自己建一个心理缓冲区，你就能把敏感变成超能力而不是内耗源。',
    profile: { S1: 'L', S2: 'L', S3: 'M', E1: 'L', E2: 'H', E3: 'L', A1: 'L', A2: 'M', A3: 'H', Ac1: 'L', Ac2: 'M', Ac3: 'L', So1: 'M', So2: 'L', So3: 'M' },
  },
  {
    slug: 'simp', code: 'SIMP', name: '舔狗', tagline: '舔到最后应有尽有（吗？）',
    color: '#f59e0b', emoji: '🐕',
    description: '首先声明：舔狗不丢人。SIMP 人格的底层逻辑是"通过付出来获取认可"。你对喜欢的人有一种近乎本能的讨好欲——ta 说什么你都觉得有道理，ta 想要什么你恨不得立刻搞到。这种投入感在初期会让人觉得你很暖，但时间长了你会发现：过度付出换来的不是爱情，而是理所当然。记住——你值得被同等对待。',
    profile: { S1: 'L', S2: 'L', S3: 'L', E1: 'L', E2: 'H', E3: 'L', A1: 'M', A2: 'L', A3: 'M', Ac1: 'M', Ac2: 'M', Ac3: 'L', So1: 'H', So2: 'L', So3: 'H' },
  },
  {
    slug: 'luck-y', code: 'LUCK-Y', name: '锦鲤', tagline: '转发这条锦鲤，你也可以。',
    color: '#f97316', emoji: '🐟',
    description: '你就是传说中的"人形锦鲤"。不是说你真的运气好到逆天，而是你有一种奇妙的能力——永远能在混乱中找到最好的位置。排队你选的那列总是最快的，抽奖你总能中个安慰奖，关键决策你凭直觉选的那个事后证明是对的。其实这不完全是运气，而是你天生乐观的心态帮你过滤掉了坏运气。',
    profile: { S1: 'H', S2: 'M', S3: 'M', E1: 'H', E2: 'M', E3: 'M', A1: 'H', A2: 'L', A3: 'H', Ac1: 'L', Ac2: 'M', Ac3: 'M', So1: 'H', So2: 'M', So3: 'H' },
  },
  {
    slug: 'solo', code: 'SOLO', name: '独行侠', tagline: '我一个人就很好。',
    color: '#475569', emoji: '🐺',
    description: '你不是孤独，你是享受独处。SOLO 人格的核心是"自给自足"。你一个人能吃火锅、一个人能看电影、一个人能旅行——不是因为没朋友约，而是因为你觉得一个人的效率和舒适度都更高。你有社交能力，但你把社交当成"可选插件"而不是"必装软件"。这在一个人人都在拉群的时代，反而让你显得特别有魅力。',
    profile: { S1: 'H', S2: 'H', S3: 'M', E1: 'H', E2: 'L', E3: 'H', A1: 'M', A2: 'H', A3: 'M', Ac1: 'H', Ac2: 'H', Ac3: 'M', So1: 'L', So2: 'H', So3: 'L' },
  },
  {
    slug: 'party', code: 'PARTY', name: '社牛', tagline: '什么局都少不了我。',
    color: '#06b6d4', emoji: '🎉',
    description: '你是社交网络中最活跃的节点。PARTY 人格走到哪里都能三分钟内和陌生人打成一片。你不是在聊天，你是在"连接"——每认识一个新朋友，你的大脑就自动把 ta 归类到某个可能以后用得上的社交格子里。你的通讯录比大多数人的都长，你的周末比大多数人的都满。唯一的问题是：你有时候忙着社交，忘了留时间给自己。',
    profile: { S1: 'H', S2: 'M', S3: 'M', E1: 'M', E2: 'M', E3: 'L', A1: 'M', A2: 'L', A3: 'M', Ac1: 'M', Ac2: 'M', Ac3: 'H', So1: 'H', So2: 'L', So3: 'H' },
  },
  {
    slug: 'sleep', code: 'SLEEP', name: '睡神', tagline: '能躺着绝不坐着。',
    color: '#6366f1', emoji: '😴',
    description: '你的人生信条是"能量守恒"——能不动就不动，能少动就少动。SLEEP 人格不是懒，是一种高效的能量管理策略。你的身体永远在节能模式，大脑只有在必要的时候才会从待机切换到运行。你的床是你最好的朋友，闹钟是你最大的敌人。但讽刺的是：每当你不得不认真起来干活的时候，你的效率往往高得吓人。',
    profile: { S1: 'M', S2: 'L', S3: 'L', E1: 'H', E2: 'M', E3: 'H', A1: 'L', A2: 'L', A3: 'L', Ac1: 'L', Ac2: 'L', Ac3: 'L', So1: 'L', So2: 'M', So3: 'M' },
  },
  {
    slug: 'food-ie', code: 'FOOD-ie', name: '干饭人', tagline: '干饭不积极，思想有问题。',
    color: '#ea580c', emoji: '🍜',
    description: '在你的优先级排列里，"吃什么"永远排在 TOP3。FOOD-ie 人格对食物的热爱不仅仅是口腹之欲，更是一种生活态度。你能为了一家好吃的店专门跑一趟，也能为了复刻一道菜研究两个小时教程。你的朋友圈有一半是美食照片，你的收藏夹有三分之一是餐厅推荐。吃好了，心情就好了；心情好了，什么事都好说。',
    profile: { S1: 'M', S2: 'M', S3: 'H', E1: 'M', E2: 'M', E3: 'M', A1: 'M', A2: 'L', A3: 'H', Ac1: 'M', Ac2: 'L', Ac3: 'H', So1: 'M', So2: 'M', So3: 'H' },
  },
  {
    slug: 'game-r', code: 'GAME-R', name: '肝帝', tagline: '只要肝不死，就往死里肝。',
    color: '#8b5cf6', emoji: '🎮',
    description: '你的专注力是一种武器级别的存在。GAME-R 人格的核心不是"玩"，而是"肝"——一旦进入状态，你能连续运作到忘记时间、忘记吃饭、忘记这个世界的存在。这种能力不限于游戏，放在工作或学习上同样炸裂。你是天生的"心流制造机"，只要找到了感兴趣的事，你的输出效率能碾压大部分人。问题是你得记得偶尔从屏幕前站起来。',
    profile: { S1: 'M', S2: 'H', S3: 'H', E1: 'M', E2: 'L', E3: 'H', A1: 'L', A2: 'M', A3: 'M', Ac1: 'H', Ac2: 'H', Ac3: 'H', So1: 'L', So2: 'H', So3: 'L' },
  },
  {
    slug: 'talk-er', code: 'TALK-er', name: '话痨', tagline: '等一下，我还没说完。',
    color: '#14b8a6', emoji: '🗣️',
    description: '你的嘴比你的脑子快零点五秒。TALK-er 人格的表达欲是控制不住的——有什么想法必须说出来，看到什么有趣的事必须分享，遇到什么不公必须评论。你是朋友群里消息最多的那个人，是饭局上话题永远不断的那个人。你的社交能力不靠深度，靠覆盖面。和你相处永远不会冷场，只会偶尔需要一个暂停键。',
    profile: { S1: 'M', S2: 'L', S3: 'M', E1: 'M', E2: 'M', E3: 'L', A1: 'M', A2: 'L', A3: 'M', Ac1: 'M', Ac2: 'L', Ac3: 'M', So1: 'H', So2: 'L', So3: 'H' },
  },
  {
    slug: 'shy', code: 'SHY', name: '社恐', tagline: '能发消息就别打电话。',
    color: '#94a3b8', emoji: '🫣',
    description: '对你来说，"去参加聚会"和"去参加高考"的心理压力差不了多少。SHY 人格不是不喜欢人，而是社交对你来说消耗太大了。一场聚会下来你需要独处两天才能充满电。你的社交圈很小但很精，你更喜欢一对一的深度对话而不是一群人的狂欢。在这个社牛遍地的时代，你的安静反而成了一种稀缺品质。',
    profile: { S1: 'L', S2: 'M', S3: 'M', E1: 'M', E2: 'L', E3: 'H', A1: 'M', A2: 'H', A3: 'M', Ac1: 'L', Ac2: 'M', Ac3: 'M', So1: 'L', So2: 'H', So3: 'L' },
  },
  {
    slug: 'rebel', code: 'REBEL', name: '反骨仔', tagline: '你说东，我偏往西。',
    color: '#dc2626', emoji: '🔥', isSpecial: true,
    description: '你身体里住着一个永远唱反调的灵魂。REBEL 人格的核心不是"为了反对而反对"——好吧，确实有的时候是。但更深层的原因是：你天生对"被安排"这件事有过敏反应。别人告诉你应该怎么做，你的第一反应就是"为什么？"。这让你在体制里显得格格不入，但在需要创新和突破的场景里，你往往是最先找到答案的那个人。',
    profile: { S1: 'H', S2: 'M', S3: 'L', E1: 'M', E2: 'L', E3: 'M', A1: 'L', A2: 'L', A3: 'L', Ac1: 'H', Ac2: 'M', Ac3: 'H', So1: 'M', So2: 'M', So3: 'M' },
  },
  {
    slug: 'drunk', code: 'DRUNK', name: '酒神', tagline: '喝到世界都变温柔。',
    color: '#a855f7', emoji: '🍺', isSpecial: true,
    description: '你的第二人格需要酒精才能解锁。DRUNK 是 SBTI 里最特殊的人格类型——只有在饮酒分支被触发时才可能出现。平时的你可能安静、克制、甚至有点紧绷，但三杯下肚之后整个人就像被重启了一样。酒精不是让你变了一个人，而是让你终于敢做平时不敢做的自己。你和酒精之间的关系更像是一把钥匙——它打开了你平时锁着的那扇门。',
    profile: { S1: 'M', S2: 'L', S3: 'L', E1: 'M', E2: 'H', E3: 'L', A1: 'L', A2: 'L', A3: 'M', Ac1: 'L', Ac2: 'L', Ac3: 'M', So1: 'H', So2: 'L', So3: 'H' },
  },
];

export function getPersonalityBySlug(slug: string): PersonalityType | undefined {
  return PERSONALITY_TYPES.find(p => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return PERSONALITY_TYPES.map(p => p.slug);
}
