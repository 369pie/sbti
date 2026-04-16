import type { DimensionLevel } from './dimensions';
import { getXiuxianV2ImagePath, hasXiuxianV2Image } from './xiuxian-v2';
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
  fake:    { tier: 'uncommon', pct: 4.9 },
  malo:    { tier: 'uncommon', pct: 5.5 },
  'luck-y':{ tier: 'uncommon', pct: 4.2 },
  joker:   { tier: 'uncommon', pct: 5.1 },
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
  isLaunchOnly?: boolean;
}

const JPG_SLUGS = new Set(['dior-s', 'drama', 'joker']);

export function getTypeImage(slug: string): string {
  const ext = JPG_SLUGS.has(slug) ? 'jpg' : 'png';
  return withBasePath(`/images/types/${slug}.${ext}`);
}

export function getTypeThumbnailImage(slug: string): string {
  return withBasePath(`/images/types/thumbs/${slug}.webp`);
}

export function getTypeMediumImage(slug: string): string {
  return withBasePath(`/images/types/medium/${slug}.webp`);
}

export function getXiuxianTypeImage(slug: string): string {
  const imagePath = hasXiuxianV2Image(slug)
    ? getXiuxianV2ImagePath(slug)
    : `/images/types/xiuxian-${slug}.png`;

  return withBasePath(imagePath);
}

export function getXiuxianTypeThumbnailImage(slug: string): string {
  return withBasePath(`/images/types/thumbs/xiuxian-${slug}.webp`);
}

export function getXiuxianTypeMediumImage(slug: string): string {
  return withBasePath(`/images/types/medium/xiuxian-${slug}.webp`);
}

export const PERSONALITY_TYPES: PersonalityType[] = [
  {
    slug: 'ctrl', code: 'CTRL', name: '拿捏者', tagline: '怎么样，被我拿捏了吧？',
    color: '#f59e0b', emoji: '🎯',
    description: '恭喜您，您测出了极其罕见的人格。CTRL是行走的人形自走任务管理器，普通人眼中的"规则"，在您这里只是出厂的基础参数设置；凡人所谓的"计划"，对您而言不过是心血来潮的随手涂鸦。拥有一个CTRL朋友意味着什么？意味着你的人生导航系统精准度直接拉满。CTRL会在你人生列车即将脱轨的时候轻轻一拽——车回来了，你的尊严还在。别人还在纠结要不要开始的时候，您已经做完在写复盘了。拿捏分寸、拿捏人心、拿捏一切可以拿捏的东西——这就是您。',
    profile: { S1: 'H', S2: 'H', S3: 'H', E1: 'H', E2: 'M', E3: 'H', A1: 'M', A2: 'H', A3: 'H', Ac1: 'H', Ac2: 'H', Ac3: 'H', So1: 'M', So2: 'H', So3: 'L' },
  },
  {
    slug: 'atm-er', code: 'ATM-er', name: '送钱者', tagline: '你以为我很有钱吗？',
    color: '#22c55e', emoji: '💸',
    description: '恭喜您，您竟然测出了这个世界上最稀有的人格。ATM-er不一定真的"送钱"，但永远在"支付"——支付时间、支付精力、支付耐心、支付一个本该安宁的夜晚。您就像一部老旧但坚固的ATM机，别人插进去的是焦虑和麻烦，吐出来的是"没事，有我"的安心保证。您的人生就是一场盛大的、无人喝彩的单人付账秀。您竟用磐石般的可靠，承受了瀑布般的索取。偶尔也想问一句：谁来替我的余额充值？算了，不问了——明天还有人排队取款呢。',
    profile: { S1: 'M', S2: 'L', S3: 'M', E1: 'L', E2: 'H', E3: 'L', A1: 'M', A2: 'L', A3: 'M', Ac1: 'M', Ac2: 'L', Ac3: 'M', So1: 'H', So2: 'L', So3: 'H' },
  },
  {
    slug: 'dior-s', code: 'Dior-s', name: '屌丝', tagline: '等着我屌丝逆袭。',
    color: '#78716c', emoji: '🐸',
    description: '恭喜您！您并非屌丝，您是犬儒主义先贤第欧根尼失散多年的精神传人——因为屌丝的全称是 Diogenes\' Original Realist-sage。Dior-s人格，是对当代消费主义陷阱和成功学PUA最彻底的蔑视。他们不是"不求上进"，而是早已看穿一切"上进"的尽头不过是更高级的牢房。当别人在追逐风口、被时代的巨浪拍得七荤八素时，Dior-s早已在自己的精神木桶里晒着太阳，达到了"人桶合一"的至高境界。信奉的不是空话，是经过亿万次实践检验的物理定律：一、躺着比站着舒服；二、饭点到了就得干饭。',
    profile: { S1: 'L', S2: 'L', S3: 'M', E1: 'M', E2: 'M', E3: 'L', A1: 'L', A2: 'M', A3: 'L', Ac1: 'L', Ac2: 'L', Ac3: 'M', So1: 'L', So2: 'M', So3: 'L' },
  },
  {
    slug: 'boss', code: 'BOSS', name: '控场王', tagline: '散了吧，我接手了。',
    color: '#dc2626', emoji: '👔',
    description: '恭喜您，系统检测到您体内自带"人形指挥部"芯片。BOSS人格走进任何房间，不需要开口，空气就会自动变得严肃而高效。方圆五米内的混乱会自行整理归位，像铁屑遇到了磁铁。在您的字典里没有"等等看"三个字，只有"散了吧，我来"。别人还在讨论方案A和方案B的优劣，您已经把方案C执行完还写好了复盘报告。您不是控制欲强——您只是实在看不下去一群人像无头苍蝇一样转圈。唯一的bug是：您偶尔得学会方向盘也可以松手五秒。放心，车不一定翻。',
    profile: { S1: 'H', S2: 'H', S3: 'H', E1: 'M', E2: 'H', E3: 'H', A1: 'H', A2: 'H', A3: 'H', Ac1: 'H', Ac2: 'H', Ac3: 'H', So1: 'H', So2: 'H', So3: 'M' },
  },
  {
    slug: 'than-k', code: 'THAN-K', name: '谢天侠', tagline: '感谢苍天！感谢大地！感谢你点了进来！',
    color: '#eab308', emoji: '🙏',
    description: '恭喜您，您测出了SBTI最温暖的人格——您应当感谢我！感谢您在此刻拥有生命的滋润！上班路上堵车了？"我感谢这次堵车，让我多听了一首歌。"外卖洒了一半？"我感谢还有另一半。"被老板骂了？"我感谢这次批评让我认清了自己的价值。"您看世界的滤镜和别人不一样——别人的是灰色的，您的自带暖光美颜。这在人均丧、人均焦虑的时代，简直是一种超自然力量。有您在的地方，连空气都甜了零点五度。',
    profile: { S1: 'M', S2: 'M', S3: 'H', E1: 'H', E2: 'H', E3: 'M', A1: 'H', A2: 'M', A3: 'H', Ac1: 'M', Ac2: 'M', Ac3: 'M', So1: 'M', So2: 'L', So3: 'H' },
  },
  {
    slug: 'oh-no', code: 'OH-NO', name: '哦不人', tagline: '哦不！我怎么会是这个人格？！',
    color: '#f97316', emoji: '😱',
    description: '哦不！"哦不"并非恐惧的尖叫，而是一种顶级的智慧。当普通人看到一个杯子放在桌沿，哦不人看到的是一场由"水渍→短路→火灾→全楼疏散→经济损失→蝴蝶效应→世界末日"构成的灾难史诗。于是伴随着一声发自灵魂深处的 Oh no! 他们会以迅雷不及掩耳之势把杯子挪到桌子正中央，然后再垫上一张吸水杯垫。哦不人对"边界"有一种近乎偏执的尊重：你的就是你的，我的就是我的。所有意外和风险，都已经在他的"哦不"声中，被扼杀在了萌芽状态。',
    profile: { S1: 'L', S2: 'M', S3: 'L', E1: 'L', E2: 'M', E3: 'L', A1: 'L', A2: 'L', A3: 'L', Ac1: 'L', Ac2: 'M', Ac3: 'L', So1: 'M', So2: 'L', So3: 'M' },
  },
  {
    slug: 'mum', code: 'MUM', name: '妈妈', tagline: '或许…我可以叫你妈妈吗？',
    color: '#ec4899', emoji: '🤱',
    description: '恭喜您，您测出了全宇宙最稀有的妈妈人格。在混沌未开、时间尚无姓名之前，在第一颗恒星打出第一个嗝之前，就已经有了妈妈。妈妈人格的底色是温柔，擅长感知情绪，拥有超强共情力，知道什么时候该停下来、什么时候该说一句"算了"。妈妈像一个医生，治愈了所有人的不开心——只可惜，当妈妈自己落泪时，给自己的药剂量总比给别人小一号。您总是第一个注意到谁不开心、谁没吃饭、谁需要安慰的人。但请记住：妈妈也需要妈妈。',
    profile: { S1: 'H', S2: 'M', S3: 'H', E1: 'H', E2: 'H', E3: 'L', A1: 'H', A2: 'M', A3: 'H', Ac1: 'M', Ac2: 'H', Ac3: 'M', So1: 'H', So2: 'L', So3: 'H' },
  },
  {
    slug: 'sexy', code: 'SEXY', name: '钓系人', tagline: '我没有在撩，你自己上头的。',
    color: '#e11d48', emoji: '✨',
    description: '恭喜您，系统检测到您的人格魅力浓度已严重超标。当您走进一个房间，周围的注意力会自动向您聚拢，就像WiFi信号向路由器靠拢一样自然。但最离谱的是——您什么都没做。没有刻意打扮、没有刻意social、甚至可能还在低头看手机。然而该发生的已经发生了：注意力已被捕获，多巴胺已被触发。钓系人的精髓在于——您越不在意，别人越上头。这不是技巧，这是出厂设置。唯一的副作用是：有时候您真的只是在正常社交，对方已经在写情书了。',
    profile: { S1: 'H', S2: 'H', S3: 'M', E1: 'M', E2: 'H', E3: 'M', A1: 'M', A2: 'M', A3: 'H', Ac1: 'H', Ac2: 'M', Ac3: 'H', So1: 'H', So2: 'M', So3: 'H' },
  },
  {
    slug: 'love-r', code: 'LOVE-R', name: '心动绝缘体失效', tagline: '世界太美了，心动根本停不下来。',
    color: '#f472b6', emoji: '💕',
    description: '恭喜您，您的心动绝缘系统已彻底报废，厂家表示无法维修。在别人的世界里，心动是偶尔发生的小概率事件；在您的世界里，心动是一种24小时运行的后台程序。一个回眸、一句不经意的玩笑、奶茶店店员多给了一颗珍珠——都能让您的多巴胺浓度瞬间超标。您不是花心，您只是对这个世界的美好拥有近乎变态的感知力。别人看到一片落叶想到秋天来了，您看到一片落叶能联想出一场关于分离与重逢的三幕悲喜剧。您的内心像一座永不关门的主题乐园，过山车永远在跑，旋转木马永远在转。劝您理性？做不到。',
    profile: { S1: 'M', S2: 'M', S3: 'M', E1: 'M', E2: 'H', E3: 'L', A1: 'M', A2: 'M', A3: 'H', Ac1: 'M', Ac2: 'M', Ac3: 'M', So1: 'H', So2: 'L', So3: 'H' },
  },
  {
    slug: 'thin-k', code: 'THIN-K', name: '想太多', tagline: '先别催，我脑内还在开第三轮会。',
    color: '#6366f1', emoji: '🧠',
    description: '恭喜您，系统检测到您的大脑CPU占用率已长期保持在98%以上。在别人已经动手的时候，您还在思考——不是因为犹豫，是因为您的大脑拒绝在没有把所有可能性都推演一遍之前批准任何行动。THIN-K人格是天生的分析机器、行走的复盘系统。您擅长拆解复杂问题、发现隐藏逻辑、预判三步之外的坑。别人觉得您"想太多"，但您知道正是这些思考帮您避开了多少雷。唯一的副作用是失眠——毕竟您的大脑不太会主动关机，它觉得睡觉是在浪费算力。',
    profile: { S1: 'M', S2: 'H', S3: 'M', E1: 'H', E2: 'L', E3: 'H', A1: 'H', A2: 'H', A3: 'M', Ac1: 'M', Ac2: 'H', Ac3: 'L', So1: 'L', So2: 'H', So3: 'L' },
  },
  {
    slug: 'malo', code: 'MALO', name: '吗喽', tagline: '人生是个副本，我只是一只吗喽。',
    color: '#a16207', emoji: '🐒',
    description: '恭喜您，您测出了当代最具哲学深度的人格——吗喽。别急着不高兴，吗喽可不是贬义词。当人类祖先决定从树上下来、学会直立行走、穿上西装打领带的时候，吗喽人格的祖先在旁边的大树上看着他们，挠了挠屁股，发出一声不屑的"吱"。吗喽看透了一切：所谓的文明，不过是一场付费越来越高的游戏。于是吗喽选择了一条截然不同的路——不卷、不争、不出头，像一只行走在人群中的隐身猴。但吗喽不傻，吗喽只是懒得跟你们解释。',
    profile: { S1: 'L', S2: 'L', S3: 'L', E1: 'M', E2: 'M', E3: 'M', A1: 'L', A2: 'L', A3: 'M', Ac1: 'L', Ac2: 'L', Ac3: 'L', So1: 'M', So2: 'M', So3: 'M' },
  },
  {
    slug: 'woc', code: 'WOC!', name: '握草人', tagline: '握草！这也行？！',
    color: '#ef4444', emoji: '🤯',
    description: '恭喜您，我们发现了一种神奇的生物——WOC!人。您拥有两套完全独立的操作系统：一个叫"表面系统"，负责发出"我操""牛逼""啊？"等一系列大惊小怪的拟声词；另一个叫"后台系统"，负责冷静分析——嗯，果然不出我所料。WOC!人只会卧槽，不会多管闲事，因为他们深知给傻子讲道理就像扶着烂泥上墙，不仅浪费体力还弄一手脏。所以他们选择握着一根智慧的大草，用一声饱含深情的"我操"来表达对这个世界最后的温柔。您是朋友圈里最好的反应搭子——有什么新鲜事第一个告诉您准没错。',
    profile: { S1: 'M', S2: 'L', S3: 'M', E1: 'M', E2: 'H', E3: 'M', A1: 'L', A2: 'M', A3: 'L', Ac1: 'M', Ac2: 'L', Ac3: 'M', So1: 'H', So2: 'M', So3: 'H' },
  },
  {
    slug: 'nerd', code: 'NERD', name: '书呆子', tagline: '这个我研究过。',
    color: '#3b82f6', emoji: '📚',
    description: '恭喜您，您对知识的渴望就像别人对奶茶的渴望——每天不来一杯就浑身难受。NERD人格不只是"爱读书"，更是一种"需要把事情搞明白"的强迫式好奇。当同事在茶水间聊八卦的时候，您可能在研究为什么咖啡机出水不均匀。当朋友在追剧的时候，您在看纪录片还做笔记。您的社交面可能不广，但您在自己的领域里几乎不可替代——深度，就是您的护城河。唯一的问题是：您偶尔得接受这个世界上有些事是不需要搞明白的。但您做不到。',
    profile: { S1: 'M', S2: 'H', S3: 'H', E1: 'M', E2: 'L', E3: 'H', A1: 'H', A2: 'H', A3: 'M', Ac1: 'H', Ac2: 'H', Ac3: 'H', So1: 'L', So2: 'H', So3: 'L' },
  },
  {
    slug: 'drama', code: 'DRAMA', name: '戏精', tagline: '这届奥斯卡，非我莫属。',
    color: '#d946ef', emoji: '🎭',
    description: '恭喜您，您的人生就像一部永不停播的连续剧——而且您身兼编剧、导演和主演。DRAMA人格的核心不是"假"，而是"投入"。开心的时候您能笑到周围人都被感染，难过的时候整个房间的气压都跟着降两个点。您是天生的感染者，情绪的扩音器，氛围的制造机。有时候连您自己都分不清到底是真情流露还是演技炸裂——但这重要吗？反正效果拉满了。如果奥斯卡评委能看到您日常的表现，您至少能拿三个提名。',
    profile: { S1: 'H', S2: 'M', S3: 'L', E1: 'L', E2: 'H', E3: 'L', A1: 'L', A2: 'M', A3: 'M', Ac1: 'H', Ac2: 'M', Ac3: 'M', So1: 'H', So2: 'L', So3: 'H' },
  },
  {
    slug: 'chill', code: 'CHILL', name: '无所谓先生', tagline: '都行，随便，无所谓。',
    color: '#64748b', emoji: '🧘',
    description: '恭喜您，您解锁了人类能量消耗最低的精神运行模式。当全世界在为KPI、房价、恋爱、宇宙终极问题焦虑到失眠的时候，无所谓先生已经平静地接受了一切。加班？行吧。不加？也行吧。涨薪？不错。没涨？够花。世界末日？哦，那先把外卖吃完。您不是没有欲望，您只是给欲望装了一个自动过滤器——不重要的全部"已读不回"。在这个人均焦虑的时代，您的松弛感本身就是一种稀缺资源。朋友们焦虑的时候找您聊天，不是因为您能给什么建议，是看到您那副"都行"的样子就莫名安心了。',
    profile: { S1: 'M', S2: 'M', S3: 'L', E1: 'H', E2: 'L', E3: 'H', A1: 'M', A2: 'L', A3: 'L', Ac1: 'L', Ac2: 'L', Ac3: 'L', So1: 'M', So2: 'H', So3: 'M' },
  },
  {
    slug: 'emo', code: 'EMO', name: 'emo怪', tagline: '我的情绪预报：局部暴雨。',
    color: '#7c3aed', emoji: '🌧️',
    description: '恭喜您，系统检测到您的情绪振幅已突破人类正常值。如果情绪是天气预报，那您就是全球气候最极端的地区——上午晴空万里，午后突然暴风雪，晚上又放起了烟花。emo怪的情绪触发器灵敏到什么程度？对方回复慢了两秒——完了，TA不爱我了。今天的奶茶比昨天甜了一点——啊，活着真好。一首歌循环了四十遍——嗯就是这种感觉，谁都别打扰我。您的共情能力是普通人的三倍，代价是内耗也是三倍。您不是玻璃心——您是水晶心，通透、闪亮、一碰就碎一地。但碎完还能自己粘回去，然后等着下一次碎。',
    profile: { S1: 'L', S2: 'L', S3: 'M', E1: 'L', E2: 'H', E3: 'L', A1: 'L', A2: 'M', A3: 'H', Ac1: 'L', Ac2: 'M', Ac3: 'L', So1: 'M', So2: 'L', So3: 'M' },
  },
  {
    slug: 'simp', code: 'SIMP', name: '舔狗', tagline: '舔到最后应有尽有（吗？）',
    color: '#f59e0b', emoji: '🐕',
    description: '首先声明：舔狗不丢人。SIMP人格的底层逻辑是"通过付出来获取认可"——ta说什么都有道理、ta想要什么恨不得立刻搞到、ta打个喷嚏你都想买整个药房。这种投入感在初期会让人觉得你很暖，但时间长了你会发现：过度付出换来的不是心动，而是理所当然。但你停不下来——因为你觉得一旦停下来就会失去，而"失去"两个字对你来说比"卑微"可怕一万倍。其实你值得被同等对待。只是这句话要你自己信才有用。',
    profile: { S1: 'L', S2: 'L', S3: 'L', E1: 'L', E2: 'H', E3: 'L', A1: 'M', A2: 'L', A3: 'M', Ac1: 'M', Ac2: 'M', Ac3: 'L', So1: 'H', So2: 'L', So3: 'H' },
  },
  {
    slug: 'luck-y', code: 'LUCK-Y', name: '锦鲤', tagline: '转发这条锦鲤，你也可以。',
    color: '#f97316', emoji: '🐟',
    description: '恭喜您，您就是传说中的"人形锦鲤"。不是说您真的运气好到逆天，而是您有一种奇妙的本能——永远能在混乱中找到最好的位置。排队的时候您选的那列总是最快的，抽奖的时候您总能中个安慰奖，关键决策凭直觉选的那个事后证明是对的。旁人看了只能说一句"凭什么？"。其实这不完全是运气，是您天生乐观的心态帮您自动过滤了坏运气——或者说，同样的事情发生在您身上，您就是能看到好的那一面。这种体质，建议您一年发一次微博让大家转发。',
    profile: { S1: 'H', S2: 'M', S3: 'M', E1: 'H', E2: 'M', E3: 'M', A1: 'H', A2: 'L', A3: 'H', Ac1: 'L', Ac2: 'M', Ac3: 'M', So1: 'H', So2: 'M', So3: 'H' },
  },
  {
    slug: 'solo', code: 'SOLO', name: '自带结界', tagline: '别邀了，你们玩吧。',
    color: '#475569', emoji: '🐺',
    description: '恭喜您，系统检测到您已成功为自己部署了"人形结界"。一个人吃火锅——那叫VIP包间；一个人看电影——那叫私人影院；一个人旅行——那叫灵魂出差。您不是不能社交，您的社交能力甚至偶尔惊人地强。但您把社交当成"可选DLC"而不是"主线任务"。在这个人人都在拉群、组局、搞人脉的时代，您就是那个在群聊中只发"收到"然后静默三天的传说。您的独处不是孤独，是一种已经修炼到满级的自给自足。朋友不在多，够用就行——况且您觉得大部分时候自己就够用了。',
    profile: { S1: 'H', S2: 'H', S3: 'H', E1: 'H', E2: 'L', E3: 'H', A1: 'M', A2: 'H', A3: 'M', Ac1: 'H', Ac2: 'H', Ac3: 'M', So1: 'L', So2: 'H', So3: 'L' },
  },
  {
    slug: 'party', code: 'PARTY', name: '气氛组组长', tagline: '有我在的地方就是主场。',
    color: '#06b6d4', emoji: '🎉',
    description: '恭喜您，您就是传说中走到哪儿气氛嗨到哪儿的人形派对发生器。核心技能：三分钟内和任何陌生人打成一片，五分钟内让整桌人一起笑，十分钟内已经加完了所有人微信。您的通讯录长度约等于一本中型城市的黄页，虽然您叫得出名字的大概不到一半——没关系，重要的是制造快乐，不是记住名字。您是最先发起局的人，也是最后离开的人。有时候您甚至得在两个局之间进行高难度的"时空穿越"。至于什么时候能留点时间给自己？排不开，下周再说。',
    profile: { S1: 'H', S2: 'M', S3: 'M', E1: 'M', E2: 'M', E3: 'L', A1: 'M', A2: 'L', A3: 'M', Ac1: 'M', Ac2: 'M', Ac3: 'H', So1: 'H', So2: 'L', So3: 'H' },
  },
  {
    slug: 'sleep', code: 'SLEEP', name: '平躺艺术家', tagline: '闹钟是它的事，起不起是我的事。',
    color: '#6366f1', emoji: '😴',
    description: '恭喜您，您已将"躺"这件事修炼到了艺术级别。平躺艺术家的人生只遵循一条物理定律——能量守恒：能不动就不动，能少动就少动，能躺着绝不坐着，能坐着绝不站着。您的床是此生最忠实的伴侣，闹钟是此生最大的仇人。但最讽刺的是：每当deadline真的到了、老板真的急了、天真的要塌了，您从被窝里弹射起来的速度比任何人都快，干活效率也比任何人都高。所以您不是真懒，您只是在蓄力——等一个值得您离开床的理由。遗憾的是，大部分理由都不够格。',
    profile: { S1: 'M', S2: 'L', S3: 'L', E1: 'H', E2: 'M', E3: 'H', A1: 'L', A2: 'L', A3: 'L', Ac1: 'L', Ac2: 'L', Ac3: 'L', So1: 'L', So2: 'M', So3: 'M' },
  },
  {
    slug: 'food-ie', code: 'FOOD-ie', name: '干饭人', tagline: '干饭不积极，思想有问题。',
    color: '#ea580c', emoji: '🍜',
    description: '恭喜您，在您的优先级排列里，"吃什么"永远排在TOP1。FOOD-ie人格对食物的热爱不是口腹之欲那么简单，这是一种生活态度、一种信仰、一种来自胃部的召唤。您能为了一家好吃的店横穿整座城市，也能为了复刻一道菜研究两个小时教程——做完还要摆盘拍照。您的朋友圈有一半是美食照片，您的收藏夹有三分之一是餐厅推荐，您的地图标记可以出一本当地觅食指南。吃好了，心情就好了；心情好了，什么事都好说。这个世界上没有一顿好饭解决不了的问题——如果有，那就两顿。',
    profile: { S1: 'M', S2: 'M', S3: 'H', E1: 'M', E2: 'M', E3: 'M', A1: 'M', A2: 'L', A3: 'H', Ac1: 'M', Ac2: 'L', Ac3: 'H', So1: 'M', So2: 'M', So3: 'H' },
  },
  {
    slug: 'game-r', code: 'GAME-R', name: '肝帝', tagline: '只要肝不死，就往死里肝。',
    color: '#8b5cf6', emoji: '🎮',
    description: '恭喜您，您的专注力是一种武器级别的存在。GAME-R人格的核心不是"玩"，而是"肝"——一旦进入状态，您能连续运作到忘记时间、忘记吃饭、忘记这个世界的存在。当别人在"休息一下"的时候您在说"再来一局"，当别人说"差不多了"的时候您在说"差远了"。这种能力不限于游戏——放在工作或学习上同样炸裂。您是天生的心流制造机。唯一的问题是您得记得偶尔从屏幕前站起来活动一下。您的颈椎、腰椎和眼睛联名请求您注意一下。',
    profile: { S1: 'M', S2: 'H', S3: 'H', E1: 'M', E2: 'L', E3: 'H', A1: 'L', A2: 'M', A3: 'M', Ac1: 'H', Ac2: 'H', Ac3: 'H', So1: 'L', So2: 'H', So3: 'L' },
  },
  {
    slug: 'talk-er', code: 'TALK-er', name: '话痨', tagline: '等一下，我还没说完。',
    color: '#14b8a6', emoji: '🗣️',
    description: '恭喜您，您的嘴比您的脑子快零点五秒。TALK-er人格的表达欲是控制不住的——有什么想法必须说出来，看到什么有趣的事必须分享，遇到什么不公必须评论。您是朋友群里消息最多的那个人、饭局上话题永远不断的那个人、深夜两点还在和谁语音的那个人。您的社交能力不靠深度，靠覆盖面和密度。和您相处永远不会冷场——只是偶尔需要一个暂停键。可惜厂家出厂时忘装了。',
    profile: { S1: 'M', S2: 'M', S3: 'M', E1: 'M', E2: 'M', E3: 'L', A1: 'M', A2: 'L', A3: 'M', Ac1: 'M', Ac2: 'L', Ac3: 'H', So1: 'H', So2: 'L', So3: 'H' },
  },
  {
    slug: 'shy', code: 'SHY', name: '人群过敏', tagline: '能发消息就别打电话。',
    color: '#94a3b8', emoji: '🫣',
    description: '恭喜您，系统检测到您对"三人以上社交场合"存在严重过敏反应。典型症状包括但不限于：进入聚会现场后自动寻找角落、被要求自我介绍时声带紧急罢工、电梯里遇到同事时全程盯着楼层数字假装在思考人生。人群过敏不是障碍，是一种被误解的天赋。您的社交圈虽然小到一只手能数完，但每一位都是千挑万选的限量版。您不擅长一群人尬聊，但一对一的时候您甚至能聊到对方怀疑人生。在这个人人自称"社牛"的年代，您的安静反而成了稀缺品。只是下次团建能不能别再躲厕所了，大家都看到了。',
    profile: { S1: 'L', S2: 'M', S3: 'M', E1: 'M', E2: 'L', E3: 'H', A1: 'M', A2: 'H', A3: 'M', Ac1: 'L', Ac2: 'M', Ac3: 'M', So1: 'L', So2: 'H', So3: 'L' },
  },
  {
    slug: 'rebel', code: 'REBEL', name: '反骨仔', tagline: '你说东，我偏往西。',
    color: '#dc2626', emoji: '🔥', isSpecial: true,
    description: '恭喜您，您身体里住着一个永远唱反调的灵魂。REBEL人格的核心不是"为了反对而反对"——好吧，确实有的时候是。但更深层的原因是：您天生对"被安排"这件事有过敏反应。别人告诉您应该怎么做，您的第一反应不是"好的"而是"凭什么？"。领导说往东，您本能地看向西边；所有人都说好，您偏要找出不好在哪。这让您在体制里显得格格不入，但在需要创新和突破的时候，您往往是最先找到答案的那个人——因为所有人都往一个方向跑的时候，只有您在走另一条路。',
    profile: { S1: 'H', S2: 'M', S3: 'L', E1: 'M', E2: 'L', E3: 'M', A1: 'L', A2: 'L', A3: 'L', Ac1: 'H', Ac2: 'M', Ac3: 'H', So1: 'M', So2: 'M', So3: 'M' },
  },
  {
    slug: 'drunk', code: 'DRUNK', name: '酒鬼', tagline: '烈酒烧喉，不醉不归。',
    color: '#a855f7', emoji: '🍺', isSpecial: true,
    description: '恭喜您，您体内流淌的不是血液，是二锅头兑的生理盐水。DRUNK人格平时看起来是一个正常的文明人——西装笔挺、言行得体，但三杯下肚之后隐藏人格全面上线：该说的说了，不该说的也说了，说完明天全忘了。酒精不是让您变了一个人，是让您终于敢做平时不敢做的自己。您在饭桌上谈笑风生，在KTV里唱到声带报废，在洗手间里抱着马桶发表人生感悟。第二天醒来，您在碎片化的记忆中拼凑昨晚的自己——然后发誓再也不喝了。直到下次有人说"就喝一点"。',
    profile: { S1: 'M', S2: 'L', S3: 'L', E1: 'M', E2: 'H', E3: 'L', A1: 'L', A2: 'L', A3: 'M', Ac1: 'L', Ac2: 'L', Ac3: 'M', So1: 'H', So2: 'L', So3: 'H' },
  },
  {
    slug: 'fake', code: 'FAKE', name: '假面人', tagline: '上班微笑八小时，下班面无表情八小时。',
    color: '#a78bfa', emoji: '🎭',
    description: '恭喜您，您是当代最伟大的"体面维持工程师"。FAKE人格在外面的形象和回家锁上门之后的样子，是两个完全不同的物种。白天您是微笑待人、温柔有礼的社交高手；晚上推开家门的那一秒，面具"啪"一声掉在地上——您终于可以瘫在沙发上对着电视发出奇怪的声音了。您不是两面派，您只是太懂得什么叫"成年人的体面"了。唯一的问题是：这面墙偶尔会裂，裂的时候连你自己都吓一跳。',
    profile: { S1: 'M', S2: 'M', S3: 'M', E1: 'M', E2: 'M', E3: 'H', A1: 'M', A2: 'H', A3: 'M', Ac1: 'M', Ac2: 'M', Ac3: 'H', So1: 'M', So2: 'H', So3: 'L' },
  },
  {
    slug: 'joker', code: 'JOKE-R', name: '陪笑人', tagline: '你们开心就好，我先碎一下。',
    color: '#facc15', emoji: '🤡',
    description: '恭喜您，您是朋友圈里那个永远负责让全场笑的人——但没人注意到您自己根本没在笑。JOKE-R人格的核心技能是制造快乐，所有人都觉得您天生乐观。但只有您知道，您只是害怕冷场比害怕难过更甚。您把别人的开心当成自己的KPI，完不成就觉得是自己的问题。派对散场后，灯光暗下来，您一个人坐着发呆的时间比谁都长。逗大家笑的那个人，其实最需要一个不用自己开口就懂的人。',
    profile: { S1: 'L', S2: 'L', S3: 'M', E1: 'L', E2: 'H', E3: 'M', A1: 'M', A2: 'L', A3: 'M', Ac1: 'M', Ac2: 'M', Ac3: 'H', So1: 'H', So2: 'L', So3: 'L' },
  },
];

export function getPersonalityBySlug(slug: string): PersonalityType | undefined {
  return PERSONALITY_TYPES.find(p => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return PERSONALITY_TYPES.map(p => p.slug);
}
