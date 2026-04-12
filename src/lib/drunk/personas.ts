import type { DimensionLevel } from './dimensions';
import { withBasePath } from '../site';

export interface DrunkPersonaType {
  slug: string;
  code: string;
  name: string;
  tagline: string;
  description: string;
  profile: Record<string, DimensionLevel>;
  color: string;
  emoji: string;
}

export function getDrunkTypeImage(slug: string): string {
  return withBasePath(`/images/types/drunk-${slug}.png`);
}

export function getDrunkTypeThumbnailImage(slug: string): string {
  return withBasePath(`/images/types/thumbs/drunk-${slug}.webp`);
}

export const DRUNK_PERSONA_TYPES: DrunkPersonaType[] = [
  {
    slug: 'blackout', code: '404', name: '断片艺术家', tagline: '我昨晚做了什么？',
    color: '#6366f1', emoji: '🕳️',
    description: '恭喜您，您是酒桌上的薛定谔——喝酒的时候叱咤风云、无所不能，第二天醒来发现自己躺在一个完全陌生的角落，手机里多了三十七张自拍和两个新朋友的微信。您的记忆就像被狗啃过的硬盘，关键数据全部丢失，只留下几个莫名其妙的闪回片段。朋友们热情地跟您描述昨晚的壮举，您只能在震惊中频频点头，心想：这真的是我干的？建议您下次喝酒前先开个录像，至少让自己也能欣赏一下自己的精彩表演。',
    profile: { D1: 'H', D2: 'H', D3: 'H', D4: 'L', D5: 'H' },
  },
  {
    slug: 'philosopher', code: 'IQ+', name: '醉后哲学家', tagline: '人生的意义就在这杯酒里。',
    color: '#8b5cf6', emoji: '🧠',
    description: '恭喜您，三杯酒下肚，您就从一个普通的打工人华丽变身为当代尼采——突然开始追问存在的意义、讨论宇宙的终极命题、分析每一段人际关系的底层逻辑。您的酒后发言如果被记录下来，要么能出一本哲学随笔，要么能被送进精神科。您身边的朋友已经习惯了边喝酒边听您讲课，偶尔还得配合着说一句「你说得对」。好消息是您记得自己说了什么，坏消息是确实说了。',
    profile: { D1: 'H', D2: 'M', D3: 'L', D4: 'H', D5: 'M' },
  },
  {
    slug: 'sleeper', code: 'ZZZ', name: '原地去世', tagline: '喝着喝着就没有然后了。',
    color: '#78716c', emoji: '😴',
    description: '恭喜您，您是酒局的计时器——您什么时候趴下，就代表今晚正式进入下半场。您的喝酒流程极其简洁：举杯→干杯→困了→睡了。不哭不闹不社死，安安静静地在角落原地去世，是整个酒桌最省心的存在。朋友们甚至会提前给您留好靠墙的位置和一件外套当被子。您的酒后人设就俩字：安详。有人说您是懦夫，但您觉得自己只是极其高效——别人花三小时才能结束的酒局，您二十分钟就能进入梦乡。',
    profile: { D1: 'L', D2: 'L', D3: 'L', D4: 'L', D5: 'L' },
  },
  {
    slug: 'cringe', code: 'DED', name: '社死制造机', tagline: '明天想起来能当场消失。',
    color: '#ec4899', emoji: '💀',
    description: '恭喜您，您是朋友圈里的行走黑历史制造机。酒后的您打破一切社交规则——什么都敢说、什么都敢做、什么人都敢搭话。跳桌上唱歌是基本操作，给老板打电话掏心窝子也不在话下。更可怕的是，您记得。全都记得。第二天的您躺在床上把脸埋进枕头里复盘每一个名场面，每想起一个就原地社会性死亡一次。但下次喝酒，一切照旧。您从不吸取教训，这一点非常令人敬佩。',
    profile: { D1: 'H', D2: 'H', D3: 'H', D4: 'H', D5: 'H' },
  },
  {
    slug: 'iron', code: 'MAX', name: '千杯不醉', tagline: '全场就我最清醒，最无聊。',
    color: '#14b8a6', emoji: '🪨',
    description: '恭喜您，您拥有传说中的「铁肝」属性——全桌人都已经开始发疯了，只有您面不改色心不跳，像一台精密运转的饮酒机器。您看着朋友们哭的哭、笑的笑、社死的社死，内心毫无波澜，甚至还有点想回家。别人喝酒是为了放飞自我，您喝酒只是在补充水分。唯一的副作用是——您永远是那个被指定的清醒驾驶员、买醒酒药的人、以及把所有人安全送回家的苦力。您不是不想醉，您是体质不允许。',
    profile: { D1: 'L', D2: 'L', D3: 'L', D4: 'H', D5: 'M' },
  },
  {
    slug: 'crier', code: 'EMO', name: '酒后emo精', tagline: '一杯下去眼泪就不争气了。',
    color: '#3b82f6', emoji: '😭',
    description: '恭喜您，酒精是您泪腺的开关。平时您可能是朋友圈里最坚强的人，但两杯酒一下肚，所有积攒的委屈、心酸、遗憾就像打开了水龙头一样汹涌而出。您可以从童年的阴影哭到上周的加班，从前任的微信头像哭到今天的晚霞太美了。在场的朋友只需要一句「你辛苦了」就能让您开始新一轮哭泣。不过说实话，哭完之后确实舒服多了。您的眼泪不是脆弱，是酒精催化下的排毒。',
    profile: { D1: 'M', D2: 'H', D3: 'L', D4: 'M', D5: 'L' },
  },
  {
    slug: 'dancer', code: 'DJ!', name: '蹦迪战神', tagline: '音乐一响腿就不是自己的了。',
    color: '#d946ef', emoji: '🪩',
    description: '恭喜您，酒精是您的舞蹈燃料。只要酒到位了、音乐响了，您就立刻进入「身体不受大脑控制」模式——什么社恐、什么内敛、什么「我不会跳舞」，统统不存在。您可以在KTV里跳到桌子塌，可以在路边跟着外放音乐原地solo，可以拉着完全不认识的路人一起蹦。您的舞姿不一定好看，但一定足够自信，自信到让旁观者都觉得可能是自己不会跳。第二天肌肉酸痛的时候，您终于意识到自己已经不是十八岁了。',
    profile: { D1: 'M', D2: 'H', D3: 'H', D4: 'M', D5: 'H' },
  },
  {
    slug: 'truth', code: '真', name: '酒后真言', tagline: '平时不敢说的话全说了。',
    color: '#ef4444', emoji: '🗣️',
    description: '恭喜您，酒精是您的诚实药水。清醒时您可能是最会审时度势、看人下菜碟的社交高手，但几杯酒下肚，您的嘴巴就切换成了「真话模式」，什么话都往外蹦——对老板的不满、对朋友的真实看法、对前任的未了情。更要命的是，您说的每一句都一针见血、精准打击，让在场所有人不知道该笑还是该尬。第二天您在恐惧中翻看聊天记录，发现昨晚的自己简直是社交关系的拆弹专家——每句话都在拆，但不知道拆的是炸弹还是关系。',
    profile: { D1: 'H', D2: 'M', D3: 'M', D4: 'H', D5: 'L' },
  },
  {
    slug: 'clingy', code: '黏', name: '撒娇黏人精', tagline: '抱着人不撒手。',
    color: '#f472b6', emoji: '🧸',
    description: '恭喜您，酒精让您的依恋系统直接过载。清醒时您可能是个高冷的独立个体，但喝了酒以后，您立刻变成一个巨型婴儿——拉着身边的人不放手、靠在谁肩膀上就不起来、动不动就说「你是我最好的朋友」、要求所有人不许走。您的物理接触需求在酒后翻了十倍，抱着人的力气也翻了十倍。被您黏上的人又心疼又无奈，想走也走不了——因为您真的好重。第二天回想起来，您会捂着脸感叹：清醒的我绝对不会这样。但下次喝酒，一切重演。',
    profile: { D1: 'M', D2: 'H', D3: 'M', D4: 'L', D5: 'M' },
  },
  {
    slug: 'tipsy', code: '✨', name: '微醺完美态', tagline: '喝一点刚刚好。',
    color: '#f59e0b', emoji: '🥂',
    description: '恭喜您，您是传说中的「微醺比清醒更好看」类型。一两杯酒下肚，您不会失控、不会社死，反而像被解锁了一个隐藏版本——话刚好多到有趣、表情刚好放松到好看、笑容刚好温暖到让人心动。您是酒局的黄金分割点，所有人都想达到的状态，但只有您能精准地停在那里。您知道自己几杯是上限，到了就不再喝。朋友们说您是「酒精调色师」，一点点琥珀色就够了。唯一的问题是——这个最佳状态窗口期太短了，稍不留神就滑向了其他人设。',
    profile: { D1: 'M', D2: 'M', D3: 'L', D4: 'H', D5: 'L' },
  },
  {
    slug: 'babysitter', code: '妈', name: '酒桌老母亲', tagline: '自己没怎么喝，一直在收拾残局。',
    color: '#22c55e', emoji: '🧑‍🍼',
    description: '恭喜您，您是每个酒局都需要但没人想当的角色——酒桌上的人形安全气囊。当别人在尽情发疯的时候，您在默默数着每个人喝了几杯、帮人倒水、抢走要打给前任的手机、以及提前叫好代驾。您喝得不多（也不敢多喝），因为您知道一旦自己也倒了，这桌人就完了。朋友们酒醒以后会真诚地感谢您，但下次喝酒依然不会让您好好喝一次。您就是酒局里的活菩萨，普度众生但自己永远成不了佛。',
    profile: { D1: 'L', D2: 'L', D3: 'L', D4: 'H', D5: 'L' },
  },
  {
    slug: 'fighter', code: '上!', name: '来者不拒', tagline: '谁来我都干！',
    color: '#dc2626', emoji: '🍺',
    description: '恭喜您，您拥有酒桌上最危险的属性——永远不说「够了」。别人敬酒？干。别人划拳？来。别人说再来一轮？绝不怂。您的续杯欲望仿佛一个永动机，社死也不怕、断片也无所谓，只要还能端起杯子，这场酒就没有终点。您的朋友们既佩服您的豪气又担忧您的肝——毕竟每次聚会结束后，您总是被抬出去的那个。您的人生信条是：酒逢知己千杯少，哪怕知己已经先走了。建议下次喝酒带个计数器，因为连您自己都不知道喝了多少。',
    profile: { D1: 'H', D2: 'M', D3: 'H', D4: 'M', D5: 'H' },
  },
];

export function getDrunkPersonaBySlug(slug: string): DrunkPersonaType | undefined {
  return DRUNK_PERSONA_TYPES.find(p => p.slug === slug);
}

export function getAllDrunkSlugs(): string[] {
  return DRUNK_PERSONA_TYPES.map(p => p.slug);
}
