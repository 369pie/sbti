import type { DimensionLevel } from './dimensions';
import { withBasePath } from '../site';
import { deriveItcSignature, type ItcSignature } from './itc';

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
  // legendary — 3%
  'switch':        { tier: 'legendary', pct: 1.5 },
  'synesthete':    { tier: 'legendary', pct: 1.8 },
  // epic — 5–7%
  'mind-theater':  { tier: 'epic', pct: 2.5 },
  'sober-addict':  { tier: 'epic', pct: 2.8 },
  'night-writer':  { tier: 'epic', pct: 3.0 },
  // rare — 8–10%
  'all-in':        { tier: 'rare', pct: 4.0 },
  'slow-burn':     { tier: 'rare', pct: 3.5 },
  'screamer':      { tier: 'rare', pct: 3.8 },
  // uncommon — 12–15%
  'charge':        { tier: 'uncommon', pct: 5.0 },
  'masked':        { tier: 'uncommon', pct: 5.5 },
  // common — 18–22%
  'elastic':       { tier: 'common', pct: 6.5 },
  'whatever':      { tier: 'common', pct: 7.0 },
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
  hiddenTags: string[];
}

export function getXptiTypeImage(slug: string): string {
  return withBasePath(`/images/types/xpti/${slug}.png`);
}

export function getXptiTypeThumbnailImage(slug: string): string {
  return withBasePath(`/images/types/xpti/thumbs/${slug}.webp`);
}

export function getXptiTypeMediumImage(slug: string): string {
  return withBasePath(`/images/types/xpti/medium/${slug}.webp`);
}

export const XPTI_PERSONALITY_TYPES: XptiPersonalityType[] = [
  // ═══════════════════════════════ #01 我说了算 ═══════════════════════════════
  {
    slug: 'switch', code: 'XPTI-01', number: '#01',
    name: '我说了算', tagline: '你负责感受就好',
    color: '#9B2C3F', emoji: '🎚️',
    hiddenTags: ['#全场掌控', '#气场型', '#节奏在我'],
    description: `【XP 一击】
你负责感受，剩下的我来。

【翻译你的情欲图谱】
你谈恋爱不是在"谈"，是在"排"。
气氛铺了几层、什么时候进什么时候退，心里都有数。
不是强势，是你发自内心相信自己的版本翻车概率最低。

你对细节敏感。什么时候加码什么时候留白，节奏从不失手。
对方的呼吸变了、手心温度变了，你全都收到。
过程当然重要，但你更馋的是对方因为你而失控的那个瞬间。

你不需要别人当镜子。你自己就是全场最亮的那盏灯。

【XP 症状清单】
✓ "你说了算"是你最受用的情话
✓ 氛围不对你直接出手调
✓ 被别人带节奏浑身不舒服
✓ 约会动线早在脑子里走过一遍了
✓ 有人说你甲方气质，你觉得是夸

【暗线】
你的掌控不是冷的管理，是很深的在乎。
你想让一切都对，因为你觉得对方值得。`,
    profile: { D1: 'H', D2: 'M', D3: 'H', D4: 'M', D5: 'L', D6: 'M', D7: 'M', D8: 'L', D9: 'H' },
  },

  // ═══════════════════════════════ #02 散场之后 ═══════════════════════════════
  {
    slug: 'mind-theater', code: 'XPTI-02', number: '#02',
    name: '散场之后', tagline: '你以为散场了，我的才刚开始',
    color: '#6A3D9A', emoji: '🎬',
    hiddenTags: ['#脑内剧场', '#余震型', '#精神高清'],
    description: `【XP 一击】
你还没开口，我脑子里已经大结局了。

【翻译你的情欲图谱】
你最好的戏永远不在现场，在脑子里。
一个眼神够你剪出三季长剧，
一次不经意的碰触可以循环回放到凌晨三点。

你脑子里的画面不是白日梦级别的。8K 画质、全景声、沉浸场。
你甚至不太需要对方真的做什么——给一个起点就够了，剩下的你自己能续完。

你多少有点依赖这种精神体验，觉得现实永远追不上脑内版本。
所以那个让你觉得"现实比想象更好"的人，是致命的。

【XP 症状清单】
✓ 深夜自动进入编剧模式
✓ 一首歌就能触发一整部脑内电影
✓ 聊完天之后反复回放对方的某句话
✓ 有些话没说出口但在脑子里排练了十遍
✓ 朋友说你想太多，你说这叫内容丰富

【暗线】
幻想不是逃避，是你感受世界的方式。
你比大多数人活得更深，只是这种深度别人看不见。`,
    profile: { D1: 'L', D2: 'M', D3: 'M', D4: 'L', D5: 'M', D6: 'L', D7: 'H', D8: 'H', D9: 'H' },
  },

  // ═══════════════════════════════ #03 不设撤回 ═══════════════════════════════
  {
    slug: 'all-in', code: 'XPTI-03', number: '#03',
    name: '不设撤回', tagline: '要么全部给你，要么一开始就不碰',
    color: '#C2485E', emoji: '🎰',
    hiddenTags: ['#全情投入', '#不留后路', '#纯爱极端'],
    description: `【XP 一击】
输赢都接受，就是不接受"差不多"。

【翻译你的情欲图谱】
你一旦决定投入，就是毫无保留的 all in。
不做"先试试看"这种事。
要么把最真实、最不体面的自己全部摊开，要么一开始就不掺和。

你在信任的人面前什么都敢露。
最狼狈最脆弱的样子给对方看了，也不后悔。
你黏、你记性好、你忠诚到让人怕。

边界？你不太在意。因为在你的世界里，
爱本来就是打破边界这件事本身。
但问题也在这：对方一旦给不了同等分量的投入，你会觉得天都暗了。

【XP 症状清单】
✓ "我对你没有保留"是真心话
✓ 对方出差一周你已经编完八集他出事的剧本
✓ 你能记住在一起时每一个微小的细节
✓ 已读不回可以让你焦虑到失眠
✓ 有人说你爱得太用力了

【暗线】
你不是不知道这样容易伤。
只是你觉得，不全力以赴的感情，不配叫感情。`,
    profile: { D1: 'L', D2: 'H', D3: 'M', D4: 'M', D5: 'H', D6: 'L', D7: 'H', D8: 'H', D9: 'H' },
  },

  // ═══════════════════════════════ #04 低温灼伤 ═══════════════════════════════
  {
    slug: 'synesthete', code: 'XPTI-04', number: '#04',
    name: '低温灼伤', tagline: '你碰了一下我的手，我全身都记得',
    color: '#B8860B', emoji: '✨',
    hiddenTags: ['#五感全开', '#皮肤记忆', '#氛围敏感'],
    description: `【XP 一击】
你的气味，我的手臂还记得。

【翻译你的情欲图谱】
你的身体是一台高灵敏度接收器。
对方不经意碰一下手背，电流从指尖窜到后背。
一种香水味可以把你拉回三年前某个夏夜。
灯光暗下来的那一秒，你全身的感官都亮了。

你不是用脑子恋爱的人，你用皮肤。
对方身上的气息、说话时嘴唇带出的气流、手指碰上来时的温度差，
你全都接收得到。

你对氛围极其敏感。
一首对的歌、一个对的光线角度，就能让你整个人 soft down。
边界也灵活：在对的人面前，身体比大脑更快做了决定。

【XP 症状清单】
✓ 闻到某种气味会瞬间想起某个人
✓ 对方的手放在你后背那一下你能记一整天
✓ 选约会地点灯光比菜品重要
✓ 你的来电判断有一半来自气味
✓ 有人说你太敏感，你说这叫高精度

【暗线】
通感是天赋。你能感受到别人感受不到的细节。
这让你更容易被触动，也更容易被击中。`,
    profile: { D1: 'M', D2: 'H', D3: 'H', D4: 'M', D5: 'M', D6: 'H', D7: 'H', D8: 'M', D9: 'M' },
  },

  // ═══════════════════════════════ #05 夜不够长 ═══════════════════════════════
  {
    slug: 'charge', code: 'XPTI-05', number: '#05',
    name: '夜不够长', tagline: '刚道完晚安就开始想下一次',
    color: '#D06050', emoji: '🔋',
    hiddenTags: ['#快充型', '#高耗电', '#永不满格'],
    description: `【XP 一击】
不是不满意，是一个人根本不够。

【翻译你的情欲图谱】
你的情绪电池消耗极快。
刚充满的状态，一个无聊的晚上就能掉到两格。
你需要高频、高强度的亲密输入才能维持正常运转。

你喜欢快节奏。来电了就是现在，别让你等。
等待对你来说不是铺垫，是消耗。
你总是在追下一个让你充满的瞬间，但很快又觉得不太够。

边界对你来说是活的，因为你永远在找更高的刺激阈值。
新鲜感是你的燃料——同样的方式用两次，就开始觉得差了点什么。

【XP 症状清单】
✓ 刚见完对方两天就觉得好久没见
✓ 平淡的聊天让你手痒
✓ 对方说慢慢来你心里翻了个白眼
✓ "新的尝试"你永远说好
✓ 朋友说你精力太旺盛了

【暗线】
你的焦虑不是缺爱，是对生活的期待值太高。
能让你安静下来的人，一定有某种让你无法预判的魔力。`,
    profile: { D1: 'M', D2: 'M', D3: 'H', D4: 'H', D5: 'M', D6: 'H', D7: 'M', D8: 'L', D9: 'L' },
  },

  // ═══════════════════════════════ #06 愈旧愈烈 ═══════════════════════════════
  {
    slug: 'slow-burn', code: 'XPTI-06', number: '#06',
    name: '愈旧愈烈', tagline: '跟你的第一千次比第一次还上头',
    color: '#8B6538', emoji: '🕯️',
    hiddenTags: ['#慢热致命', '#深度回味', '#老酒型'],
    description: `【XP 一击】
找到了就反复确认，每一次都比上一次更深。

【翻译你的情欲图谱】
你的信条是"好东西值得反复品"。
你不追新鲜感，追的是"越来越深"的确定感。
你享受和同一个人在熟悉的节奏里慢慢打磨——
别人觉得一成不变的东西，你能品出越来越多的层次。

你的节奏慢，但沉浸度极高。
第一次约会你不可能完全放开——
需要时间、信任、逐渐积累的默契，才会一点一点打开。

但一旦打开了，对方看到的那个你，
这世界上没有第二个人见过。

你不太需要别人反馈来确认自己。
你更在意的是：和这个人之间的东西是不是在变深。

【XP 症状清单】
✓ 和同一个人在一起越久你越上头
✓ 你能记住每次约会的细节然后反复回味
✓ "默契"这个词让你心跳加速
✓ 刚认识的人让你有点怯
✓ 朋友说你恋旧，你觉得这叫品味

【暗线】
你的慢不是犹豫，是在确认这个人值不值得你打开。
值得的人，会得到你的全部。`,
    profile: { D1: 'L', D2: 'M', D3: 'M', D4: 'L', D5: 'L', D6: 'L', D7: 'M', D8: 'M', D9: 'H' },
  },

  // ═══════════════════════════════ #07 表面禁欲 ═══════════════════════════════
  {
    slug: 'night-writer', code: 'XPTI-07', number: '#07',
    name: '表面禁欲', tagline: '白天我很得体，入夜以后别问',
    color: '#7E5A8A', emoji: '🌙',
    hiddenTags: ['#暗涌型', '#反差系', '#文字型性感'],
    description: `【XP 一击】
白天正经，晚上的脑子你不敢翻。

【翻译你的情欲图谱】
你外表和内在的反差大到可以上新闻。
白天的你得体、克制、甚至有点高冷——
没人知道你关了灯之后脑子里在放什么。

你的内心戏丰富到可以出全集。
你也不打算让别人知道你在想什么——让人看到那些念头简直是社死。

你知道自己要什么，但不轻易摊牌。
你喜欢掌控节奏，同时维持神秘。

你在亲密关系里的致命之处就是这种感觉：
"知道你脑子里一定有故事，但永远猜不透下一页。"

【XP 症状清单】
✓ 同事觉得你好安静——如果他们知道你脑子里在想什么
✓ 深夜写过一些东西但永远不会给别人看
✓ 浏览器历史记录是你最大的秘密
✓ 看到某段描写偷偷红了耳朵但脸上毫无波动
✓ 有人说你禁欲系，你在心里笑了

【暗线】
克制不是没有欲望，是欲望太满了只能自己消化。
能让你愿意被看到的人，不只是恋人——是你的解锁密码。`,
    profile: { D1: 'H', D2: 'L', D3: 'L', D4: 'L', D5: 'M', D6: 'M', D7: 'H', D8: 'L', D9: 'H' },
  },

  // ═══════════════════════════════ #08 不肯小声 ═══════════════════════════════
  {
    slug: 'screamer', code: 'XPTI-08', number: '#08',
    name: '不肯小声', tagline: '平淡才是最狠的酷刑',
    color: '#E08878', emoji: '🎤',
    hiddenTags: ['#音量拉满', '#感官过载', '#刺激收集'],
    description: `【XP 一击】
你不给我刺激我真的会死。（不是比喻。）

【翻译你的情欲图谱】
你的人生信条是"活着就要有感觉"。
不怕太多、不怕太快、不怕太强——唯一怕的是无聊。

感官灵敏度拉满，对方每一个微小的动作你都能接收到。
节奏上你要快：来电了就是现在，别让你等。
情感表达极其外放——高兴就笑、难过就哭、兴奋就尖叫。

边界灵活，因为你信奉"没试过怎么知道"。
但你不追重复——同样的花样用两次你就得换新的。

在你的世界里，生命是拿来感受的。
感受就要调到最大音量。

【XP 症状清单】
✓ KTV永远是你嗓门最大的那个
✓ 对方在耳边说话你当场过电
✓ "稳定的关系"听起来像慢性窒息
✓ 你的情绪来得快退得也快
✓ 有人说你太戏剧化，你说人生本来就是一场戏

【暗线】
你的高调不是浮夸，是你拒绝麻木地活。
能跟得上你频率的人，才有资格坐这趟过山车。`,
    profile: { D1: 'L', D2: 'H', D3: 'H', D4: 'H', D5: 'H', D6: 'H', D7: 'M', D8: 'H', D9: 'L' },
  },

  // ═══════════════════════════════ #09 清醒沉溺 ═══════════════════════════════
  {
    slug: 'sober-addict', code: 'XPTI-09', number: '#09',
    name: '清醒沉溺', tagline: '我知道这不对，然后继续',
    color: '#4A8A7A', emoji: '💊',
    hiddenTags: ['#理智沦陷', '#知行分裂', '#高功能上瘾'],
    description: `【XP 一击】
我完全清楚这不理性。然后继续。

【翻译你的情欲图谱】
你是最矛盾的那种人。
大脑很清醒，身体很诚实，
然后大脑看着身体做了所有它反对的事。

你喜欢自己安排一切，也很在意对方眼里你是什么样子。
但你几乎不暴露真实情感，也不太给人看你柔软的部分。

你的边界模糊，不是因为没有——
是你在清醒的状态下主动选了跨过去。
你提前分析过最坏的后果，然后说"行，我接受"。

你不是失控。你是清醒地选择了不控制。

【XP 症状清单】
✓ 跟闺蜜分析完"不该"之后继续做
✓ 明知道对方不合适但就是放不下
✓ 你写过复盘日记但从来不遵守结论
✓ "道理我都懂"是你的口头禅
✓ 你比谁都了解自己，但这反而更痛苦

【暗线】
你的上瘾不是软弱。是你在清醒的前提下选择了体验。
别人盲目地爱，你盯着深渊然后跳下去。`,
    profile: { D1: 'H', D2: 'L', D3: 'M', D4: 'M', D5: 'H', D6: 'M', D7: 'L', D8: 'L', D9: 'M' },
  },

  // ═══════════════════════════════ #10 懒得心动 ═══════════════════════════════
  {
    slug: 'whatever', code: 'XPTI-10', number: '#10',
    name: '懒得心动', tagline: '你来我不躲，你走我不追',
    color: '#78716C', emoji: '☁️',
    hiddenTags: ['#高阈值', '#佛系情欲', '#低耗模式'],
    description: `【XP 一击】
有你可以，没你也行。真的。

【翻译你的情欲图谱】
你是亲密关系里最不容易被撬动的人。
不是没有感觉，是阈值比别人高。
别人因为一个眼神心跳加速的时候，你在想今晚吃什么。

你各方面都偏低到中等：
不太需要掌控、不太需要裸露、不太吃感官、不太赶节奏。
不太照镜子、不太越界、不太幻想、不太黏人。

这不是冷。更像是一种"够了"——
你一个人就能过得很好，恋爱在你的优先级里大概排第七。

但一旦有人真的打中了你的点——
你的反差会让所有人大吃一惊。

【XP 症状清单】
✓ 被表白第一反应是"啊？"
✓ 对方三天没消息你才注意到
✓ 朋友催你找对象你说缘分到了就有了
✓ 恋爱经历一只手能数完
✓ "心动"对你来说是一个很遥远的词

【暗线】
你的平静不是麻木，是你还没遇到值得破防的人。
那个人出现的时候，你会发现原来自己也可以这么不淡定。`,
    profile: { D1: 'L', D2: 'L', D3: 'L', D4: 'L', D5: 'L', D6: 'M', D7: 'L', D8: 'L', D9: 'M' },
  },

  // ═══════════════════════════════ #11 不给全貌 ═══════════════════════════════
  {
    slug: 'masked', code: 'XPTI-11', number: '#11',
    name: '不给全貌', tagline: '你看到的只是我愿意给的部分',
    color: '#A3526E', emoji: '🎭',
    hiddenTags: ['#层层解锁', '#反差感', '#留白型'],
    description: `【XP 一击】
我有很多面，你能看到几面，取决于你走到哪一步。

【翻译你的情欲图谱】
你在不同的人面前是不同的人。
不是在"装"，是你真的有很多面。
只是你会选择"给谁看哪一面"。

真正的你被放在最里面。
可你的内心戏又很满，脑子里的世界比别人以为的精彩得多。
你也很在意，对方眼里的你到底是什么样子。

你喜欢快一点的推进，因为速度能替你保住神秘。
慢下来等于被看穿，而被彻底看穿让你有点害怕。

你的魅力就在这种"永远猜不透"里。
追你的人会上瘾，因为每次觉得了解你了，又发现还有新的一层。

【XP 症状清单】
✓ 工作中、朋友面前、亲密关系里你是三个人
✓ 对方以为了解你了但只是刚摸到表面
✓ 你很会制造"我已经对你很坦白了"的错觉
✓ 有些秘密你带进棺材也不会说
✓ 有人说你城府深，你觉得这叫层次丰富

【暗线】
你的留白不是伪装，是保护机制。
能让你主动卸下防备的人，对你来说比恋人更珍贵，那是你的安全地带。`,
    profile: { D1: 'M', D2: 'L', D3: 'M', D4: 'H', D5: 'H', D6: 'M', D7: 'H', D8: 'L', D9: 'L' },
  },

  // ═══════════════════════════════ #12 可近可退 ═══════════════════════════════
  {
    slug: 'elastic', code: 'XPTI-12', number: '#12',
    name: '可近可退', tagline: '不是没有边界，是边界愿意跟你商量',
    color: '#6EB0A0', emoji: '🧶',
    hiddenTags: ['#开放型', '#什么都可聊', '#体验派'],
    description: `【XP 一击】
没有什么是不能聊的，也没有什么是不能试的。

【翻译你的情欲图谱】
你是亲密关系里最灵活的存在。
别人在纠结"这样好不好"的时候，你已经试过了。
你的边界不是一堵墙，是一根弹力绳：
会回弹，但也可以拉很远。

你不执着于主导或配合、不执着于裸露或隐藏。
你的节奏适中，感官适中，幻想适中。
不是"什么都一般"，而是"什么都可以"。

你最大的特点，是一种很罕见的开放性。
你不会因为"从来没试过"就拒绝一件事。
在合适的人面前、在信任感到位的前提下，
你的可能性是无限的。

这种灵活让你在不同的关系里呈现不同的样子。
你像水一样，会适配不同的容器。

【XP 症状清单】
✓ 对方提出新想法你的第一反应是"好啊"
✓ 你的底线存在但不是一条直线
✓ 朋友们觉得你什么都能聊
✓ 你跟不同的人在一起时是不同的风格
✓ "试试看"是你最常说的三个字

【暗线】
你的灵活不是没原则，是你相信世界上值得体验的事太多了。
你把每一段关系都当成一场探索，不害怕未知，因为你觉得那才是活着。`,
    profile: { D1: 'M', D2: 'M', D3: 'M', D4: 'M', D5: 'M', D6: 'H', D7: 'M', D8: 'M', D9: 'L' },
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

/**
 * v3.0 · ITC tension signature for a personality (memoised by reference).
 *
 * Computed from `personality.profile` so we never have to maintain it by hand.
 * Used in: result page "张力签名" block, share card v3, couple matcher.
 */
const _signatureCache = new WeakMap<XptiPersonalityType, ItcSignature>();
export function getXptiTensionSignature(p: XptiPersonalityType): ItcSignature {
  const cached = _signatureCache.get(p);
  if (cached) return cached;
  const sig = deriveItcSignature(p.profile);
  _signatureCache.set(p, sig);
  return sig;
}
