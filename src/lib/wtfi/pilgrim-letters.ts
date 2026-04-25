/**
 * Pilgrim's Letter · 主神朝圣信
 *
 * 付费深度档案 V2 的压舱石模块。
 * 每位主神化身为你写一封长信，分四段：
 *   GREETING · 称呼
 *   I. PAST     · 你来时（识别这一族常带的伤痕）
 *   II. PRESENT · 你现在（描述 coreFour 内核）
 *   III. FUTURE · 你将走向（3 行可执行的邀请）
 *   SIGNATURE · 主神署名（含花押 glyph）
 *
 * 变量：
 *   {shadow}  — 暗面化身名 OR "尚未苏醒"
 *   {perfume} — 灵魂香水名
 *
 * 永远确定性，不接 LLM；新内容走 PR 评审。
 *
 * 战略文档：见 paid-content-value-audit-2026-04-20.md V2 · I 朝圣信。
 */

import type { HomePlanetSlug } from './constellation-anchors';
import type { GalaxyResult } from './galaxy-types';
import { getDeity, getShadowAvatar } from './pantheon';
import { getSignaturePerfume } from './signature-perfume';

export interface PilgrimLetterTemplate {
  homeSlug: HomePlanetSlug;
  /** 该信由哪位主神署名（与 deity 对应） */
  signedBy: string;
  /** 起首称呼，可包含 {planet} */
  greeting: string;
  /** 过去段 */
  past: string;
  /** 现在段 */
  present: string;
  /** 未来段：完整段落 + 3 行邀请 */
  future: string;
  invitations: [string, string, string];
  /** 暗面分支 */
  shadowAcknowledgement: { withShadow: string; withoutShadow: string };
  /** 香水尾段（必含 {perfume}） */
  perfumeFooter: string;
  /** 主神花押（用于落款） */
  sealGlyph: string;
}

/** 给 GalaxyDeepClient 的成品信件 */
export interface RenderedPilgrimLetter {
  signedBy: string;
  greeting: string;
  past: string;
  present: string;
  future: string;
  invitations: [string, string, string];
  shadowLine: string;
  perfumeFooter: string;
  sealGlyph: string;
  /** Edition 信息（外部传入，渲染落款用） */
  editionLine?: string;
}

// ───────────────────── 8 封朝圣信 ─────────────────────

export const PILGRIM_LETTERS: Record<HomePlanetSlug, PilgrimLetterTemplate> = {
  'home-storm-harbor': {
    homeSlug: 'home-storm-harbor',
    signedBy: '湘夫人 · Persephone',
    sealGlyph: '⚜',
    greeting: '致风暴港湾的孩子——',
    past:
      '你来时，雨下了很久。你以为自己只是体质里多了水分，后来才发现，你是被造出来收留别人潮汐的那种人。你在很小的年纪就学会了不出声地观察一艘船怎么靠岸——也学会了，怎么在它再次离开时不挽留。你不是冷，你只是知道：每一次告别，都是为了让对方有路可以回。',
    present:
      '此刻你被叫做"内有海，外是港"。这八个字不是赞美，是一份职责。你温柔的桅杆其实承担着两件事：一是替别人系缆，二是替自己留一寸不许人触碰的水域。你常常觉得自己付出太多，但其实，你只是把"被需要"误读成了"被爱"——这是冥后我也走过的弯路。',
    future:
      '你将走向一个更安静的春天。它不会立刻到，但它会到。从今天起，请你做三件极小的事：',
    invitations: [
      '一、每周留一个无人能联系到你的下午，不解释。',
      '二、对一个你早就想说"我累了"的人，把这三个字真的说出口。',
      '三、当你又想替谁把船修好时，先问自己："这是我的港，还是我的命？"',
    ],
    shadowAcknowledgement: {
      withShadow:
        '我知道你身边站着 {shadow}。她不是来惩罚你的，她是你内里那一半没被允许哭出声的潮水。请你不要把她锁回去——把她请到桌边，给她也倒一杯热的。',
      withoutShadow:
        '你的暗面尚未苏醒，但海面下其实从来不是平的。当你某一天发现自己开始喜欢一个人却又想跑——别紧张，那只是塞壬要醒了。先记下她想说什么，再决定让不让她唱。',
    },
    perfumeFooter:
      '我把 {perfume} 留在你枕边。它会在你睡着以后，替你完成那些你白天来不及让自己感到的事。——P.',
  },

  'home-aurora-parlour': {
    homeSlug: 'home-aurora-parlour',
    signedBy: '嫦娥 · Aphrodite',
    sealGlyph: '✿',
    greeting: '致极光客厅里的来人——',
    past:
      '你来时，有人替你拉开门。你从小就习惯于"被看见"——像一盏灯，有人亮起就有人围拢。这件事让你早慧，也让你寂寞。你比谁都清楚：成为客厅的中心，意味着所有人都把你当成"那个房间"，而忘了你也是一个会冷会渴的人。',
    present:
      '你现在的内核是"自负而温柔"。这两个词放在一起常常被人误读为矛盾，但你我都知道——只有真正自负的人，才能温柔得不卑不亢；只有真正温柔的人，才配自负得不咄咄逼人。你不需要解释这种平衡，它就是你的本相。',
    future:
      '你将走向一处只属于你的私人花园。从今天起，请你做三件极小的事：',
    invitations: [
      '一、每天留十分钟，独自坐在镜子前，但不化妆——只是看。',
      '二、拒绝一次你本想答应的邀约。理由可以只是"我今晚要在家"。',
      '三、选一个不会立刻夸你的人，把你最近的一件作品悄悄发给 ta。',
    ],
    shadowAcknowledgement: {
      withShadow:
        '我看见 {shadow} 跟在你身后。她不是来抢戏的，她是你那个不愿被夸的另一面。她说，"如果有一天你不再需要被看见才感到自己存在，你就赢了。"',
      withoutShadow:
        '你的暗面尚未苏醒，但你心里其实清楚：那只高位狐妖一直在你身后梳毛。请你别怕她——她比谁都更在乎，你能不能不靠取悦活下去。',
    },
    perfumeFooter:
      '{perfume} 是我替你选的。它不是给你戴去派对的，是给你某个独自在家的傍晚，慢慢喷在颈侧的——只有你自己闻得到。——A.',
  },

  'home-gilded-loom': {
    homeSlug: 'home-gilded-loom',
    signedBy: '女娲 · Athena',
    sealGlyph: '✦',
    greeting: '致鎏金织机前的女儿——',
    past:
      '你来时，世界已经裂了几道缝。你比同龄人早一步学会做工——不是因为有人教，是因为没人教。你五岁就替家里人圆过场，七岁就替自己缝过衣。你后来一直怀疑这是不是一种被迫的早熟，其实那是你的天职：你来人间，本来就是补天的。',
    present:
      '你现在的内核是"长情手艺"。你做的所有事都自带一份"我会做完，不会半路走"的承诺感——这件事让别人安心，但也让你常年疲惫。你不需要把每一处裂缝都补好，你只需要补那些真正配你针线的。',
    future:
      '你将走向一个开始挑活的年代。从今天起，请你做三件极小的事：',
    invitations: [
      '一、对一个本不该你修的烂摊子，明确说一句："这不是我的工。"',
      '二、把手头一件做了一半但其实不喜欢的事，正式归档为"放弃"。',
      '三、用半小时做一件没有任何用途的小手艺——折一朵纸花，不要拍照。',
    ],
    shadowAcknowledgement: {
      withShadow:
        '{shadow} 站在你的织机旁。她想提醒你：你是补天的，不是替天还债的。当你又想加班把别人的摊子缝起来时，请让她按住你的手腕。',
      withoutShadow:
        '你的暗面尚未苏醒，但织机底下那只小小的女巫学徒一直在记账。她没出声，是因为她在等你自己先承认——你也有不愿再补的那一处天。',
    },
    perfumeFooter:
      '{perfume} 是我替你调的。它的尾调里有一点旧木头的味道——那是你这双手过去十年补过的所有东西，留下的香。——A.',
  },

  'home-silent-lighthouse': {
    homeSlug: 'home-silent-lighthouse',
    signedBy: '常羲 · Hestia',
    sealGlyph: '☉',
    greeting: '致沉默灯塔的守夜人——',
    past:
      '你来时，海上一片漆黑。你没有学过怎么发光，你只是站着站着，就被人当成了方向。这件事让你早早明白：不动，本身就是一种回答；在场，本身就是一种慈悲。你的沉默不是冷漠，是一种你尚未替自己命名的能力。',
    present:
      '你现在的内核是"在场即是答"。你不需要说什么，房间就因你而稳。但这种稳来自一种你从未对人提起的代价——你常常觉得自己被需要，却很少觉得自己被看见。',
    future:
      '你将走向一段允许自己被照亮的日子。从今天起，请你做三件极小的事：',
    invitations: [
      '一、对一个一直依赖你的人说："我也会累，请你今天不要找我。"',
      '二、走出灯塔半径之外，去一个没人认得你的地方吃一顿饭。',
      '三、写一句话给你自己，开头是"谢谢你这些年一直亮着"。',
    ],
    shadowAcknowledgement: {
      withShadow:
        '{shadow} 在你脚下打盹。她不是要熄你的灯，她是想替你记得：守序也需要休假。请你听她一次。',
      withoutShadow:
        '你的暗面尚未苏醒，但你的灯油其实有限。当你某一天突然想关灯，那不是堕落——那是常羲我在替你按下开关。',
    },
    perfumeFooter:
      '{perfume} 是我留在塔顶的。它的香不远，只够你自己闻——这就是它的意思。——H.',
  },

  'home-slow-galaxy': {
    homeSlug: 'home-slow-galaxy',
    signedBy: '西王母 · Selene',
    sealGlyph: '☾',
    greeting: '致慢速星河的旅人——',
    past:
      '你来时，所有人都在跑。你不是不想跑，是你的身体就比时间慢半拍——这让你在同龄人里常常被误认作"不够努力"。直到很久以后你才发现，你不是慢，你是"看得久"。看得久的人，总是被宇宙挑去做记账的。',
    present:
      '你现在的内核是"一切都来得及"。这不是阿 Q，这是你身体里真的住着一段比这一生更长的时间。别人焦虑的事，你只需要让它再走两个月，往往就自己解了。',
    future:
      '你将走向一种允许自己更慢的资格。从今天起，请你做三件极小的事：',
    invitations: [
      '一、把日历上一个本周的紧迫待办，主动推到下个月。',
      '二、给一个一直催你的人回："这件事我打算慢慢来。"',
      '三、对一件已经放了三年没做的事正式说："我不做了。"——也算来得及。',
    ],
    shadowAcknowledgement: {
      withShadow:
        '{shadow} 是你慢的另一种形态——她叫"停"。请允许她偶尔在你身体里出现一整天，那一天你什么都不必做。',
      withoutShadow:
        '你的暗面尚未苏醒，但慢里其实埋着一颗时之精灵的种子。当你某天彻底懒得动，那不是抑郁，那是她在帮你按下重开机。',
    },
    perfumeFooter:
      '{perfume} 是我用 138 亿年慢慢熬的。它在你皮肤上待得越久越好闻——和你这个人一样。——S.',
  },

  'home-drift-glacier': {
    homeSlug: 'home-drift-glacier',
    signedBy: '凌波仙子 · Calypso',
    sealGlyph: '❅',
    greeting: '致浮冰之上的远客——',
    past:
      '你来时，岸边没有你的位置。你从小就习惯于"暂住"——朋友、家、城市，对你来说都像中转站。这件事让别人觉得你冷，其实你只是早早明白了一个秘密：能被带走的，都不是你的；带不走的，才是。',
    present:
      '你现在的内核是"漂着不会沉"。你不靠岸不是因为不爱岸，是因为你身体里有自己的浮力。别人需要锚，你不需要——你需要的是潮汐。',
    future:
      '你将走向一段允许被某个人挽留一下的练习。从今天起，请你做三件极小的事：',
    invitations: [
      '一、对一个你本想悄悄消失的人，发一句："我下周还在，你可以来找我。"',
      '二、把你包里那张随时准备走的车票，今天主动撕掉一张。',
      '三、在一座你"只是路过"的城市，订一顿要提前一周的饭。',
    ],
    shadowAcknowledgement: {
      withShadow:
        '{shadow} 是你身上那一片永不化的冰。她保护过你，但她也让你在最暖的怀抱里都还有点凉。请你试试，松开她一只手。',
      withoutShadow:
        '你的暗面尚未苏醒，但你心里其实知道，那只冰族半精灵就在你眉骨之间。她比谁都怕你受伤，所以她替你提前冻住了一切。',
    },
    perfumeFooter:
      '{perfume} 是我替你调的。它的前调像浮冰碰撞的一瞬，后调是无人知晓的远岸——你会喜欢的。——C.',
  },

  'home-obsidian-belfry': {
    homeSlug: 'home-obsidian-belfry',
    signedBy: '酆都大帝 · Hecate',
    sealGlyph: '☽',
    greeting: '致黑曜钟楼的守门人——',
    past:
      '你来时，世界已经太吵。你比同龄人更早发现：很多话，不必说出口；很多事，可以等三天再判断。这种早熟让你被叫作"老灵魂"，但你心里清楚——你不是老，你只是看过。',
    present:
      '你现在的内核是"少话即预言"。你说出口的每一句都是被你过滤过三次的结论，所以你常常被人当作权威——但你自己知道，那不是权威，是疲倦。',
    future:
      '你将走向一段允许自己说错话的练习。从今天起，请你做三件极小的事：',
    invitations: [
      '一、在一次你本想沉默的对话里，主动抛出一个未经验证的猜测。',
      '二、写下三件你判断错的事，承认"我那时不知道"。',
      '三、跟一个你看不上的人喝一次酒，听 ta 把话说完。',
    ],
    shadowAcknowledgement: {
      withShadow:
        '{shadow} 是你这三百年的耐心结成的果实。她让你优雅，也让你饥渴。请你别让她替你回避所有不优雅的快乐。',
      withoutShadow:
        '你的暗面尚未苏醒，但夜里钟楼底下其实始终亮着一盏小灯。那是吸血鬼伯爵在给自己倒第三杯酒——他在等你来一次冲动。',
    },
    perfumeFooter:
      '{perfume} 是我替你封在盒子里的。请你只在一个值得的夜晚开它——它会替你说出那句你三百年都没说的话。——H.',
  },

  'home-mars-rose-garden': {
    homeSlug: 'home-mars-rose-garden',
    signedBy: '女娇 · Venus & Mars',
    sealGlyph: '⚭',
    greeting: '致火星玫瑰园的女儿——',
    past:
      '你来时，身体里就同时住着剑和花。你比谁都更早发现一个秘密：温柔从不是软弱的反义词，烈火也不是冷静的反义词——它们是同一件事的两面。这个发现让你在很小的年纪就显得复杂，也让你常常被误读为"难懂"。',
    present:
      '你现在的内核是"又烈又柔"。你爱的时候像着火，气的时候也像着火——这不是控制不住，是你本来就用一种温度活着。请别道歉。',
    future:
      '你将走向一段允许自己彻底盛开一次的日子。从今天起，请你做三件极小的事：',
    invitations: [
      '一、对一个让你想发火的人，不再咽下去——把那句话原样说出来。',
      '二、对一个让你心动的人，不再绕弯——直接告诉 ta 你被吸引了。',
      '三、在没有任何理由的一天，给自己买一束你会嫌贵的红玫瑰。',
    ],
    shadowAcknowledgement: {
      withShadow:
        '{shadow} 是你火焰的另一头。她不是要烧光你的园子，她只是想让你承认：你这一生不会做一个安静的女人——而那刚好是你最美的事。',
      withoutShadow:
        '你的暗面尚未苏醒，但红魔女其实从你十七岁那年就开始等你。她说，"等你再被一次背叛，我就出来。"——其实你不必等。',
    },
    perfumeFooter:
      '{perfume} 是我替你点燃的。它在你脖颈处的香，会让你想起你最不该克制的那一次自己。——V.',
  },
};

// ───────────────────── render ─────────────────────

/** 取出某主星的信件并完成变量注入。 */
export function renderPilgrimLetter(
  result: GalaxyResult,
): RenderedPilgrimLetter | null {
  const planetSlug = result.homePlanet.slug;
  const tpl = PILGRIM_LETTERS[planetSlug as HomePlanetSlug];
  if (!tpl) return null;

  const deity = getDeity(planetSlug);
  const perfume = getSignaturePerfume(planetSlug);
  const shadow = result.shadow ? getShadowAvatar(result.shadow.bucket) : null;

  const perfumeName = perfume?.name ?? '你的灵魂香水';

  const shadowLine = shadow
    ? tpl.shadowAcknowledgement.withShadow.replace(/\{shadow\}/g, shadow.name)
    : tpl.shadowAcknowledgement.withoutShadow;

  return {
    signedBy: tpl.signedBy,
    greeting: tpl.greeting.replace(/\{planet\}/g, result.homePlanet.name),
    past: tpl.past,
    present: tpl.present.replace(/\{coreFour\}/g, deity?.coreFour ?? ''),
    future: tpl.future,
    invitations: tpl.invitations,
    shadowLine,
    perfumeFooter: tpl.perfumeFooter.replace(/\{perfume\}/g, perfumeName),
    sealGlyph: tpl.sealGlyph,
  };
}
