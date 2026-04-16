import type { DimensionLevel } from './dimensions';
import { withBasePath } from '../site';

export interface IdentifyPersonaType {
  slug: string;
  code: string;
  name: string;
  tagline: string;
  verdict: string;        // 鉴定评语：从鉴定者视角写
  symptoms: string[];     // "中了几枪"清单
  color: string;
  emoji: string;
  profile: Record<string, DimensionLevel>;
}

/** Reuse the core SBTI images for identified personas */
export function getIdentifyTypeImage(slug: string): string {
  return withBasePath(`/images/types/${slug}.png`);
}

export function getIdentifyTypeThumbnailImage(slug: string): string {
  return withBasePath(`/images/types/thumbs/${slug}.webp`);
}

export function getIdentifyTypeMediumImage(slug: string): string {
  return withBasePath(`/images/types/medium/${slug}.webp`);
}

export const IDENTIFY_PERSONA_TYPES: IdentifyPersonaType[] = [
  {
    slug: 'party', code: 'PARTY', name: '气氛组组长',
    tagline: '有 ta 在的地方就是主场',
    verdict: '恭喜你拥有一个行走的派对发生器。ta 到哪哪就热闹，自带bgm和笑点，唯一的副作用是——ta 不在的聚会你会觉得少了点什么。',
    symptoms: ['每次聚会ta都是最后一个走的', '跟陌生人也能五分钟称兄道弟', '群里一半的表情包是ta发的', 'ta说的每句话都像段子', '有ta在你根本插不上话'],
    color: '#f59e0b', emoji: '🎉',
    profile: { D1: 'H', D2: 'H', D3: 'H', D4: 'H', D5: 'M' },
  },
  {
    slug: 'shy', code: 'SHY', name: '人群过敏',
    tagline: '能发消息就别打电话',
    verdict: '你的这位朋友的社交电量大概只有5%，出门一趟需要充电三天。不是不喜欢你，是ta的社交带宽只够一次处理一个人类。',
    symptoms: ['聚会上ta永远在玩手机', '能线上解决的事绝不见面', '人多的地方ta会自动消失', '你约ta出门需要提前三天预约', '接电话之前要先做十分钟心理建设'],
    color: '#94a3b8', emoji: '🤫',
    profile: { D1: 'L', D2: 'M', D3: 'L', D4: 'L', D5: 'M' },
  },
  {
    slug: 'thin-k', code: 'THIN-K', name: '想太多',
    tagline: '脑内会议室24小时加班中',
    verdict: 'ta 的脑子不是在思考，是在开年度复盘会。而且参会者全是ta自己。你发的每条消息ta都会分析三层含义，你没回消息ta已经脑补了七种翻车场景。',
    symptoms: ['你说了一句"嗯"ta能分析半天', '做选择的时候像在做高考数学', '睡前在脑内重播今天所有对话', '担心的事99%不会发生但ta停不下来', '你安慰ta说没事ta反而更焦虑'],
    color: '#818cf8', emoji: '🧠',
    profile: { D1: 'M', D2: 'H', D3: 'L', D4: 'M', D5: 'H' },
  },
  {
    slug: 'mum', code: 'MUM', name: '妈妈',
    tagline: '全世界都被照顾了，除了ta自己',
    verdict: 'ta 是你们朋友圈里的编外保姆——记得每个人的生日、操心所有人吃没吃饭、出门自带零食药品充电宝。唯一的问题是ta从不允许自己被照顾。',
    symptoms: ['出门永远备着纸巾和创可贴', '你还没说饿ta就开始点外卖', '每个人的生日ta都记得', '你难过的时候ta比你还急', '但ta自己难过的时候从不说'],
    color: '#34d399', emoji: '🧸',
    profile: { D1: 'M', D2: 'H', D3: 'M', D4: 'H', D5: 'H' },
  },
  {
    slug: 'emo', code: 'EMO', name: 'emo怪',
    tagline: '今日天气：局部暴雨转大暴雨',
    verdict: 'ta 的情绪天气预报永远不准，因为一天能变八次。上一秒笑得像朵花，下一秒就开始emo。但说真的，ta 只是把普通人藏着的情绪全都外放了而已。',
    symptoms: ['朋友圈凌晨三点发然后秒删', '一首歌能让ta哭一个小时', '别人一句无心的话ta能难过三天', '突然沉默就是暴风雨前兆', 'ta说"没事"的时候=非常有事'],
    color: '#3b82f6', emoji: '🌧️',
    profile: { D1: 'M', D2: 'H', D3: 'L', D4: 'M', D5: 'M' },
  },
  {
    slug: 'ctrl', code: 'CTRL', name: '拿捏者',
    tagline: '怎么样，被 ta 拿捏了吧',
    verdict: '你的这位朋友是行走的KPI——做事高效、目标明确、执行力惊人。唯一的问题是ta可能会不自觉地开始安排你的人生。',
    symptoms: ['组队做事ta自动变成组长', '给你提建议的语气像在布置任务', 'ta的日程表比CEO的还满', '你还在纠结ta已经做完了', '跟ta出去玩像在走一场精密行程'],
    color: '#ef4444', emoji: '👑',
    profile: { D1: 'H', D2: 'M', D3: 'H', D4: 'M', D5: 'M' },
  },
  {
    slug: 'chill', code: 'CHILL', name: '无所谓先生',
    tagline: '都行，随便，到点下班',
    verdict: 'ta 是朋友圈里最佛的存在。问ta吃什么——随便。问ta去哪——都行。天塌了ta也是先吃完这口饭。你有时候怀疑ta是不是活在一个平行宇宙，那里没有焦虑。',
    symptoms: ['DDL在明天ta还在刷手机', '你疯狂输出ta在旁边微笑点头', '"都行随便无所谓"是ta的口头禅', '从没见ta真正着急过', '你着急的事ta觉得"会过去的"'],
    color: '#a8a29e', emoji: '😌',
    profile: { D1: 'M', D2: 'L', D3: 'L', D4: 'M', D5: 'M' },
  },
  {
    slug: 'drama', code: 'DRAMA', name: '戏精',
    tagline: '这届奥斯卡，非 ta 莫属',
    verdict: 'ta 的人生是一部爆笑喜剧片，ta是导演兼主演。任何鸡毛蒜皮的小事到了ta嘴里都能变成跌宕起伏的大戏。跟ta在一起永远不无聊，但你可能需要一个事实核查员。',
    symptoms: ['讲个买菜的事能讲出谍战片效果', 'ta的表情永远比事情本身夸张', '一件小事ta能发十条语音', 'ta说的"一点点"等于亿点点', '全世界的八卦都从ta这里听说'],
    color: '#ec4899', emoji: '🎭',
    profile: { D1: 'H', D2: 'H', D3: 'M', D4: 'H', D5: 'M' },
  },
  {
    slug: 'solo', code: 'SOLO', name: '自带结界',
    tagline: '别邀了，ta 自己挺好的',
    verdict: '你的朋友活在一个透明泡泡里——看得见外面，但不想出来。ta不是不喜欢人，ta只是更喜欢自己。尊重ta的结界，ta 会在需要的时候主动戳破。',
    symptoms: ['经常一个人去吃饭看电影', '你约ta十次ta到场三次已经是真爱', '朋友圈一年发不了五条', '你感觉ta随时可以销声匿迹', '但ta自己过得非常开心'],
    color: '#6366f1', emoji: '🫧',
    profile: { D1: 'L', D2: 'L', D3: 'M', D4: 'L', D5: 'L' },
  },
  {
    slug: 'simp', code: 'SIMP', name: '舔狗',
    tagline: '舔到最后应有尽有（吗）',
    verdict: '你的朋友对喜欢的人/事付出不求回报，掏心掏肺到让旁观者心疼。ta的好不是讨好，是真的觉得你们值得。只是有时候，ta 忘了自己也值得被等量回馈。',
    symptoms: ['你没回消息ta会找理由替你开脱', '帮你做事从不提条件', '你随口提到想要什么ta就去买了', '被辜负了还在说"没关系的"', '对你好到让你有负罪感'],
    color: '#f472b6', emoji: '🐶',
    profile: { D1: 'M', D2: 'H', D3: 'M', D4: 'H', D5: 'H' },
  },
  {
    slug: 'rebel', code: 'REBEL', name: '反骨仔',
    tagline: '你说东，ta 偏往西',
    verdict: '你的朋友是一个天生的反骨仔——你说这个好ta偏要说不好，你让ta别去ta现在就去。并不是ta性格差，只是ta的出厂设置就是"质疑一切"。',
    symptoms: ['你推荐的东西ta一定先挑毛病', '所有权威ta都觉得有问题', '规则在ta眼里就是用来打破的', '别人说不行ta偏要试试', '跟ta吵架会被ta的逻辑绕晕'],
    color: '#f97316', emoji: '🔥',
    profile: { D1: 'H', D2: 'M', D3: 'H', D4: 'L', D5: 'M' },
  },
  {
    slug: 'fake', code: 'FAKE', name: '假面人',
    tagline: '见人说人话，到家才卸妆',
    verdict: 'ta 是社交界的变形金刚——在外温柔得体滴水不漏，回到家马上切换成另一个人。不是虚伪，是ta的体面有上下班时间。能看到ta素颜一面的你，说明你是ta的自己人。',
    symptoms: ['在外面超客气回家就变了个人', '你永远猜不到ta真正怎么想', '社交场合笑着但眼神很清醒', '真正的吐槽只对你说', '朋友圈精致得像杂志'],
    color: '#a78bfa', emoji: '🎭',
    profile: { D1: 'M', D2: 'L', D3: 'M', D4: 'M', D5: 'L' },
  },
  {
    slug: 'sleep', code: 'SLEEP', name: '平躺艺术家',
    tagline: '醒了但没完全醒',
    verdict: '你的朋友把"躺平"从一种状态活成了一门艺术。ta的人生信条是能躺着绝不坐着，能坐着绝不站着。别催ta，ta的行动力正在冬眠，预计明年春天苏醒。',
    symptoms: ['约ta出门永远在赖床', '周末能睡到下午两点是基本操作', '做任何事的动力来源都是"不想动"', 'ta的微信运动步数长期个位数', '你很少见ta真正着急过'],
    color: '#94a3b8', emoji: '💤',
    profile: { D1: 'L', D2: 'L', D3: 'L', D4: 'M', D5: 'M' },
  },
  {
    slug: 'talk-er', code: 'TALK-er', name: '话痨',
    tagline: '等一下，ta 还没说完',
    verdict: '你的朋友是一个行走的播客——见面三小时ta能说两小时四十五分钟。内容覆盖面从宇宙起源到今天午饭吃了什么。好消息是跟ta在一起不会冷场，坏消息是你可能需要耳塞。',
    symptoms: ['一条语音能说60秒', '你说了一个话题ta能延伸出十个', '视频通话永远超过一小时', '别人说"我讲完了"ta接着说"对对对我也是"', 'ta自己都笑着说"我是不是话太多了"'],
    color: '#f59e0b', emoji: '🗣️',
    profile: { D1: 'H', D2: 'M', D3: 'M', D4: 'H', D5: 'M' },
  },
  {
    slug: 'love-r', code: 'LOVE-R', name: '心动绝缘体失效',
    tagline: '心动根本停不下来',
    verdict: 'ta 的心动阈值大概是负数——看到可爱的人会心动，听到好听的声音会心动，连路边的猫都让ta心动。ta 不是恋爱脑，ta 只是对这个世界太有感觉了。',
    symptoms: ['三天两头跟你说"我好像又喜欢上谁了"', '看到好看的路人会当场停住', '每段关系ta都全力以赴', 'ta说的"随便看看"等于已经心动了', '你觉得ta活在一部偶像剧里'],
    color: '#ec4899', emoji: '💘',
    profile: { D1: 'H', D2: 'H', D3: 'M', D4: 'H', D5: 'H' },
  },
  {
    slug: 'luck-y', code: 'LUCK-Y', name: '锦鲤',
    tagline: '运气好到让人想打',
    verdict: '你的朋友是行走的幸运星——抽奖必中、迟到必不堵、考试必过。更气的是ta自己还浑然不觉。你已经分不清ta是真的运气好还是你运气太差了。',
    symptoms: ['任何抽奖ta都有惊人命中率', '迟到了反而因此避开了坏事', '随便做做就比别人努力的强', 'ta经常说"还好吧也没那么难"', '你怀疑ta其实是某种神秘力量的亲戚'],
    color: '#fbbf24', emoji: '🍀',
    profile: { D1: 'M', D2: 'M', D3: 'H', D4: 'H', D5: 'M' },
  },
  {
    slug: 'boss', code: 'BOSS', name: '控场王',
    tagline: '散了吧，ta 来接手了',
    verdict: '你的朋友是天生的指挥官——不管局面多乱ta都能三秒接手、五秒理清、十秒分工。ta的存在就是一种安全感，但有时候……你也想自己做主。',
    symptoms: ['聚餐一定是ta来选餐厅', '有ta在没人需要做决定', 'ta发言的时候全场安静', '你说的方案ta总能找出优化空间', '团队有ta在效率翻倍'],
    color: '#ef4444', emoji: '🏆',
    profile: { D1: 'H', D2: 'M', D3: 'H', D4: 'M', D5: 'H' },
  },
  {
    slug: 'joker', code: 'JOKE-R', name: '陪笑人',
    tagline: '你们开心就好，ta先碎一下',
    verdict: 'ta 是朋友圈里笑容最多的人，也可能是最容易被忽略掉感受的人。ta 习惯了把所有人的情绪照顾好，自己的不开心藏在笑容后面。能看到这面的你，请多关心ta。',
    symptoms: ['永远在笑，但你分不清是不是真的', '从不在朋友面前说自己的难处', '别人讲难过的事ta习惯性逗乐', '承受得明明很多但嘴上说"没事"', '你仔细看ta笑的时候眼睛没在笑'],
    color: '#94a3b8', emoji: '🃏',
    profile: { D1: 'M', D2: 'L', D3: 'M', D4: 'H', D5: 'H' },
  },
  {
    slug: 'nerd', code: 'NERD', name: '书呆子',
    tagline: '这个 ta 研究过',
    verdict: '你的朋友是一本行走的百科全书——任何话题ta都能掏出冷知识。你可能已经习惯了ta的"其实这个有一个很有意思的原理……"但说真的，有ta在你永远不会无聊。',
    symptoms: ['聊天三句话必提一个冷知识', 'ta的收藏夹比图书馆还分类清晰', '跟ta争论你永远赢不了因为ta有数据', '关注的公众号全是知识类', '好奇心比猫都强'],
    color: '#6366f1', emoji: '📚',
    profile: { D1: 'M', D2: 'L', D3: 'M', D4: 'L', D5: 'M' },
  },
  {
    slug: 'food-ie', code: 'FOOD-ie', name: '干饭人',
    tagline: '干饭不积极，思想有问题',
    verdict: '你的朋友的快乐来源非常纯粹——吃。好吃的东西能让ta忘记一切烦恼。跟ta出门永远不用担心去哪，因为答案永远是——先吃饭。',
    symptoms: ['任何对话都能转到"吃什么"', 'ta的相册八成是食物照片', '心情不好的解决方案永远是"去吃点好的"', '你推荐的餐厅ta都会认真去打卡', 'ta吃到好吃的时候表情像初恋'],
    color: '#f97316', emoji: '🍜',
    profile: { D1: 'M', D2: 'M', D3: 'M', D4: 'H', D5: 'M' },
  },
  {
    slug: 'sexy', code: 'SEXY', name: '钓系人',
    tagline: 'ta没在撩，你自己上头的',
    verdict: '你的朋友可能自己都不知道ta有多撩人。不经意的一个动作、一句话、一个眼神就能让人心跳加速。ta的魅力是出厂自带的，不营业都比别人努力更好看。',
    symptoms: ['ta觉得自己在正常社交但对面已经脸红', '照片随便拍都很好看', 'ta的"可以吗？"听起来像在撩', '你的朋友暗恋ta的队伍排到了门外', '你提醒过ta注意但ta一脸无辜'],
    color: '#e11d48', emoji: '✨',
    profile: { D1: 'M', D2: 'M', D3: 'L', D4: 'H', D5: 'L' },
  },
];

export function getIdentifyPersonaBySlug(slug: string): IdentifyPersonaType | undefined {
  return IDENTIFY_PERSONA_TYPES.find(p => p.slug === slug);
}

export function getAllIdentifySlugs(): string[] {
  return IDENTIFY_PERSONA_TYPES.map(p => p.slug);
}
