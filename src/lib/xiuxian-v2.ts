import type { DimensionLevel } from './dimensions';
import type { PersonalityType } from './personalities';

interface XiuxianV2Skin {
  slug: string;
  name: string;
  dao: string;
  displayName: string;
  realm: string;
  creature: string;
  spell: string;
  artifact: string;
  tagline: string;
  description: string;
  emoji: string;
  color: string;
}

const xiuxianV2LaunchSkins: XiuxianV2Skin[] = [
  {
    slug: 'sexy',
    name: '无辜钓主',
    dao: '本座真没撩',
    displayName: '无辜钓主',
    realm: '炼心期 · 心火误伤',
    creature: '桃粉弟子服的小师姐，团扇半遮脸，站姿松弛却自带让人上头的误伤气场。',
    spell: '「路过即渡情劫」',
    artifact: '无辜团扇',
    tagline: '我没施法，是你自己先上头。',
    description:
      '你最致命的地方，从来不是会不会撩，而是根本没认真撩，别人已经替你把剧情写到大结局。你越像没事人，周围人越会自动脑补，把红线、心火、情劫一股脑往你身上安。\n\n你不是故意吊着谁，你只是习惯把轻松和无辜当成日常配置。问题在于，这套配置在别人眼里过于像“我有戏”，于是你在发呆，对方在上头；你在路过，对方在渡劫。',
    emoji: '🪭',
    color: '#e77499',
  },
  {
    slug: 'emo',
    name: '夜雨修士',
    dao: '今日继续内耗',
    displayName: '夜雨修士',
    realm: '炼心期 · 情潮过载',
    creature: '雾蓝灰紫长袍的小女修，眼眶微红，头顶总飘着一朵只针对自己的小乌云。',
    spell: '「共情过载」',
    artifact: '半湿情绪札记',
    tagline: '嘴上说没事，心里已经下到暴雨。',
    description:
      '你最擅长的不是藏情绪，而是把情绪压成别人以为你还挺稳定的样子。你会把一句敷衍、一个眼神、一次冷场都记成心里的天气预报，然后表面若无其事，私下反复回放。\n\n你不是爱演，你是真的感受得到更多层细节，所以也更容易被它们反噬。别人以为你在矫情，你知道自己只是在承担比别人更密的情绪输入。',
    emoji: '🌧️',
    color: '#7c70c8',
  },
  {
    slug: 'shy',
    name: '一米结界仙',
    dao: '能传音就别当面说',
    displayName: '一米结界仙',
    realm: '护体期 · 社交省电',
    creature: '缩在透明结界球里的社恐女修，脚尖内扣，怀里永远抱着没回完的传音符。',
    spell: '「近身自动掉帧」',
    artifact: '一米结界球',
    tagline: '不是讨厌你，是和人接触太耗灵力。',
    description:
      '你并不冷淡，你只是每次进入人群都像系统突然多开了十个后台。越是需要即时反应的场合，你越想把自己缩小一点、再缩小一点，最好直接缩回结界里。\n\n你最舒服的表达方式通常不是面对面，而是给自己留出缓冲区之后的那种慢半拍真诚。所以熟了的人会发现你一点都不难聊，只是第一层结界确实很厚。',
    emoji: '🫧',
    color: '#a38fd8',
  },
  {
    slug: 'solo',
    name: '闭关装死蛋',
    dao: '不是不回，是还没想好怎么回',
    displayName: '闭关装死蛋',
    realm: '壳修期 · 独处自愈',
    creature: '把自己裹在半颗裂壳结界里的独处型修士，只露出脸和一只手查看未读消息。',
    spell: '「已读先遁」',
    artifact: '半裂护体蛋壳',
    tagline: '消息我看见了，但今天谁都别碰我。',
    description:
      '你对独处的需求不是“喜欢安静”那么简单，而是需要靠独处把自己重新拼回一个完整的人。很多时候你不是故意消失，只是知道一旦现在出去应付，你明天就得拿双倍灵力补回来。\n\n所以你会把自己裹进壳里，把邀约先放着，把回复再等等。不是不在乎，是你必须先把自己从外界撤回来，才有力气继续面对人。',
    emoji: '🥚',
    color: '#8d88be',
  },
  {
    slug: 'mum',
    name: '宗门保姆仙',
    dao: '大家都被照顾得很好，除了我',
    displayName: '宗门保姆仙',
    realm: '护心期 · 收拾残局',
    creature: '米杏色弟子服的照顾型女修，手里是补灵丹和绷带，背后挂满别人掉下来的情绪包袱。',
    spell: '「先把别人照顾好」',
    artifact: '应急百宝袋',
    tagline: '我能把所有人的情绪接住，就是接不住自己。',
    description:
      '你像宗门里那个默认会出现的安全兜底方案。谁受伤了、谁崩了、谁收不了场，大家第一反应都觉得找你就行，因为你看起来总是稳、总是会、总是能。\n\n可问题是，照顾别人久了，很容易把“我也很累”这件事排到最后。你不是天生不需要被照顾，只是太习惯先看见别人的缺口，于是自己那部分总被你往后延。',
    emoji: '🧺',
    color: '#cf8d94',
  },
  {
    slug: 'simp',
    name: '倒贴护法',
    dao: '护到最后，护成路人甲',
    displayName: '倒贴护法',
    realm: '执念期 · 忠诚失衡',
    creature: '总往前倾的人形护法，手里还攥着别人不要的玉佩和发带。',
    spell: '「先替你挡一下」',
    artifact: '旧玉佩与回魂丹',
    tagline: '不是深情，是深情到有点没出息。',
    description:
      '你一旦认定某个人，就会自动把“替对方多做一点”写进默认动作里。对方喊一声，你会冲；对方皱一下眉，你会想办法；对方哪怕没有明说，你也总觉得自己应该多补一手。\n\n问题不在于你不真诚，而在于你的真诚很容易越线，最后从心疼别人，变成习惯性忽视自己。你不是输在不够好，你只是太早把自己的位置摆成了备份方案。',
    emoji: '🧿',
    color: '#d69a59',
  },
  {
    slug: 'thin-k',
    name: '渡劫预案师',
    dao: '雷还没来，我已经写完十八版预案',
    displayName: '渡劫预案师',
    realm: '推演期 · 脑内开会',
    creature: '靛蓝长袍的军师型修士，头发轻微炸毛，手里的卷轴长到拖地。',
    spell: '「最坏情况先跑一遍」',
    artifact: '十八版预案卷轴',
    tagline: '事情还没发生，我已经把崩法都想明白了。',
    description:
      '你不是拖延，你只是很难在没把风险想透之前直接开始。大多数人脑里只有一个任务栏，你脑里至少同时开着方案、备选、最坏情况、补救手册和复盘模板。\n\n这种能力让你避开了很多坑，也让你很难真正轻松。你总能先想到哪里会出问题，但很少有人看见，你为了让一切看起来没问题，脑子到底开了多少轮会。',
    emoji: '📜',
    color: '#5f68c8',
  },
  {
    slug: 'chill',
    name: '随便道长',
    dao: '都行，劈我也行',
    displayName: '随便道长',
    realm: '松弛期 · 警报免疫',
    creature: '灰绿长袍的佛系修士，松垮地坐在蒲团上，头顶有雷有消息也懒得先处理。',
    spell: '「都行吧」',
    artifact: '随缘茶盏',
    tagline: '天雷都快劈脸上了，我还是觉得先喝口茶。',
    description:
      '你身上最稀缺的不是平静，是一种对大部分鸡飞狗跳天然免疫的松弛。别人越急，你越像在旁边看天气；别人越想让你跟着紧张，你越容易冒出一句“那就这样吧”。\n\n这份松弛确实救过你，也偶尔把身边人气够呛。可你不是不上心，你只是很早就看透了很多事：有些焦虑不会因为多皱两次眉就变得更可控。',
    emoji: '🍵',
    color: '#7d8d79',
  },
  {
    slug: 'fake',
    name: '体面画皮仙',
    dao: '见人说人话，回洞府才发疯',
    displayName: '体面画皮仙',
    realm: '营业期 · 体面硬撑',
    creature: '奶白淡紫衣衫的门面弟子，手里拎着一张标准营业笑面具，真实表情已经快塌了。',
    spell: '「场面先稳住」',
    artifact: '裂纹笑面具',
    tagline: '表面滴水不漏，回家原地碎掉。',
    description:
      '你很擅长把场面撑到别人看不出破绽。该笑的时候笑，该接的话接，该给的情绪价值给到位，体面、圆滑、靠谱，像永远知道此刻应该呈现成什么样子。\n\n可只有你自己知道，很多礼貌和配合并不代表轻松，只是你太熟练于把真实情绪按回去。别人看到的是你情商高，你感受到的是每次营业结束后那种整个人被掏空的后坐力。',
    emoji: '🎭',
    color: '#9d8ad9',
  },
  {
    slug: 'love-r',
    name: '情劫常驻户',
    dao: '我不是恋爱脑，我只是见谁都心动',
    displayName: '情劫常驻户',
    realm: '心动期 · 红线过载',
    creature: '樱粉长袍的小女修，发簪歪着，怀里还抱着新认定的天选对象小像。',
    spell: '「心动阈值过低」',
    artifact: '最新心动小像',
    tagline: '我不是故意上头，是心动来得太勤。',
    description:
      '你对“心动”这件事的感知灵敏得近乎夸张。别人需要慢慢靠近、慢慢确认，你可能只是一个细节、一个笑点、一次对视，就已经把情绪值点亮到满格。\n\n你不是不长记性，你只是每次都真心相信这一回会不一样。于是红线刚亮，你就已经在脑内给这段关系起了副标题。别人说你太容易上头，你心里想的是：那是因为你们没见过那一瞬间到底有多值得心动。',
    emoji: '💘',
    color: '#f08fae',
  },
  {
    slug: 'rebel',
    name: '逆天小师妹',
    dao: '你让我别去，我现在就去',
    displayName: '逆天小师妹',
    realm: '逆鳞期 · 越劝越来劲',
    creature: '黑红弟子服的小师妹，眉毛挑着，门规撕了一半还拎在手里。',
    spell: '「越管越反」',
    artifact: '半张门规',
    tagline: '不是坏，只是天生不爱被安排。',
    description:
      '你对“被规定”这件事有种天然逆反。越是有人用命令口吻跟你说应该怎样，你越容易在心里先翻一个白眼，然后本能地想往反方向试试。\n\n这不一定是为了抬杠，更像是你得自己确认一遍，才相信那条路真值不值得走。所以你常常显得难管、难劝、难按流程，但也正因为这样，你比很多人更早撞见新的出口。',
    emoji: '🧨',
    color: '#9d434c',
  },
  {
    slug: 'joker',
    name: '陪笑护法',
    dao: '你们开心就好，我先碎掉',
    displayName: '陪笑护法',
    realm: '气氛期 · 情绪外包',
    creature: '柔粉奶黄衣衫的陪笑型角色，脸上笑得标准，袖子里却把纸符攥得全皱了。',
    spell: '「先把场子热起来」',
    artifact: '裂开心形挂件',
    tagline: '场子是热了，我也快碎了。',
    description:
      '你很会在别人需要的时候把气氛顶起来。冷场时你会接梗，尴尬时你会圆，大家情绪掉下去的时候，你会条件反射地先把热度补回来。\n\n问题是，长期做那个负责“让别人轻松一点”的人，自己就很难真正轻松。你表面上像笑得最自然的那一个，实际上很多难过都被你压成了不影响场面的格式，等散场之后才慢慢反噬。',
    emoji: '🎪',
    color: '#d9a16e',
  },
];

type LaunchOnlyPersonality = PersonalityType & { isLaunchOnly: true };

const xiuxianLaunchOnlyTypes: LaunchOnlyPersonality[] = [
  {
    slug: 'fake',
    code: 'FAKE',
    name: '伪人',
    tagline: '场面先圆上，真心等回家再说。',
    description:
      '你擅长把每一种关系都经营成看上去刚刚好的样子。会接话、会配合、会笑、会体面，仿佛任何场面都能被你稳稳托住。\n\n但你也最清楚，这种“刚刚好”很多时候并不轻松，它只是你早就学会的保护色。别人夸你会做人，你心里想的是：我只是太习惯先让气氛过关。',
    color: '#6ca670',
    emoji: '🎭',
    isLaunchOnly: true,
    profile: {
      S1: 'M', S2: 'H', S3: 'M',
      E1: 'L', E2: 'H', E3: 'L',
      A1: 'M', A2: 'M', A3: 'H',
      Ac1: 'H', Ac2: 'M', Ac3: 'H',
      So1: 'H', So2: 'L', So3: 'H',
    },
  },
  {
    slug: 'joker',
    code: 'JOKE-R',
    name: '小丑',
    tagline: '你们先笑，我晚点再崩。',
    description:
      '你是那种总能把场子救回来的角色。冷的时候你来热，僵的时候你来圆，别人情绪掉地上了你会顺手帮忙捡一下。\n\n久而久之，大家都默认你能扛住这些，可很少有人反问一句：一直负责逗大家笑的那个人，什么时候也能轮到自己被接住？',
    color: '#8f9270',
    emoji: '🤡',
    isLaunchOnly: true,
    profile: {
      S1: 'M', S2: 'M', S3: 'L',
      E1: 'L', E2: 'H', E3: 'L',
      A1: 'M', A2: 'M', A3: 'M',
      Ac1: 'M', Ac2: 'L', Ac3: 'M',
      So1: 'H', So2: 'L', So3: 'H',
    },
  },
];

const xiuxianV2SkinMap = new Map(xiuxianV2LaunchSkins.map((skin) => [skin.slug, skin]));
const xiuxianLaunchOnlyTypeMap = new Map(xiuxianLaunchOnlyTypes.map((type) => [type.slug, type]));

// Only point at v2 image assets that have actually been generated.
const XIUXIAN_V2_AVAILABLE_IMAGE_SLUGS = new Set<string>([
  'sexy',
  'emo',
  'shy',
  'solo',
  'mum',
  'simp',
  'chill',
  'fake',
  'love-r',
  'rebel',
  'joker',
  'thin-k',
]);

export function getXiuxianV2Skin(slug: string) {
  return xiuxianV2SkinMap.get(slug);
}

export function getXiuxianLaunchOnlyTypes() {
  return xiuxianLaunchOnlyTypes;
}

export function getXiuxianLaunchOnlySlugs() {
  return xiuxianLaunchOnlyTypes.map((type) => type.slug);
}

export function getXiuxianLaunchOnlyTypeBySlug(slug: string) {
  return xiuxianLaunchOnlyTypeMap.get(slug);
}

export function hasXiuxianV2Image(slug: string) {
  return XIUXIAN_V2_AVAILABLE_IMAGE_SLUGS.has(slug);
}

export function getXiuxianV2ImagePath(slug: string) {
  return `/images/types/xiuxian-v2-${slug}.png`;
}