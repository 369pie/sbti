import { shuffleArray } from '../question-pool';
import type { SoultiModelType } from './dimensions';

export interface SoultiAnswerOption {
  label: string;
  value: 1 | 2 | 3;
  key: string;
}

export interface SoultiQuestion {
  id: number;
  text: string;
  dimension: string;
  model: SoultiModelType;
  reversed: boolean;
  act: 1 | 2 | 3;
  options: SoultiAnswerOption[];
}

export const SOULTI_ACT_NAMES: Record<1 | 2 | 3, string> = {
  1: '白天的你',
  2: '深夜的你',
  3: '梦里的你',
};

const SOULTI_DIMENSION_ORDER = ['J1', 'J2', 'J3', 'J4', 'J5'] as const;

const SOULTI_ACT_SAMPLE_COUNT: Record<1 | 2 | 3, number> = {
  1: 2,
  2: 2,
  3: 1,
};

export const SOULTI_QUESTIONS: SoultiQuestion[] = [
  {
    id: 1,
    text: '刚到一个陌生饭局，还没开始上菜。你通常会？',
    dimension: 'J1',
    model: 'tide',
    reversed: false,
    act: 1,
    options: [
      { value: 3, label: '先随口接两句，气氛很快就不陌生了', key: 'A' },
      { value: 2, label: '等别人聊起来，再自然地插进去', key: 'B' },
      { value: 1, label: '先安静坐着，熟了以后再慢慢开口', key: 'C' },
    ],
  },
  {
    id: 2,
    text: '一群人突然都安静了，谁都没接下一句。你更容易怎么做？',
    dimension: 'J1',
    model: 'tide',
    reversed: false,
    act: 1,
    options: [
      { value: 1, label: '觉得这样也没什么，没必要硬接', key: 'A' },
      { value: 2, label: '看一眼场子，合适的话就补一句', key: 'B' },
      { value: 3, label: '几乎下意识就把这段空白接过去', key: 'C' },
    ],
  },
  {
    id: 3,
    text: '周末刚醒来，手机上已经有两个局。你第一反应更像？',
    dimension: 'J1',
    model: 'tide',
    reversed: false,
    act: 1,
    options: [
      { value: 1, label: '先把手机扣回去，我更想一个人醒一会儿', key: 'A' },
      { value: 2, label: '看是谁约的，再决定今天往哪边走', key: 'B' },
      { value: 3, label: '会有点被叫醒的兴奋，想看看今天会长成什么样', key: 'C' },
    ],
  },
  {
    id: 4,
    text: '电梯里遇到半熟不熟的人，你通常会？',
    dimension: 'J1',
    model: 'tide',
    reversed: false,
    act: 1,
    options: [
      { value: 1, label: '礼貌点头，然后把注意力收回来', key: 'A' },
      { value: 2, label: '如果对方看过来，就顺势聊两句', key: 'B' },
      { value: 3, label: '很自然就能寒暄起来，不太怕冷场', key: 'C' },
    ],
  },
  {
    id: 5,
    text: '周五晚上临时多出一整天空档，你第一反应更像哪句？',
    dimension: 'J2',
    model: 'root',
    reversed: false,
    act: 1,
    options: [
      { value: 1, label: '先出门再说，去哪儿路上想', key: 'A' },
      { value: 2, label: '定个大概方向，剩下随缘', key: 'B' },
      { value: 3, label: '先把这一天安排明白，心里才踏实', key: 'C' },
    ],
  },
  {
    id: 6,
    text: '原定计划突然被打乱。最让你难受的，通常是哪一层？',
    dimension: 'J2',
    model: 'root',
    reversed: false,
    act: 1,
    options: [
      { value: 3, label: '不是麻烦，是那种“一切脱轨了”的感觉', key: 'A' },
      { value: 2, label: '有点烦，但改改也能继续', key: 'B' },
      { value: 1, label: '说不上难受，反而会觉得事情开始有意思了', key: 'C' },
    ],
  },
  {
    id: 7,
    text: '出门去一个从没去过的地方前，你通常会做到哪一步？',
    dimension: 'J2',
    model: 'root',
    reversed: false,
    act: 1,
    options: [
      { value: 1, label: '知道个大概就行，我更想边走边认路', key: 'A' },
      { value: 2, label: '会看一眼路线和关键点，剩下到时候再说', key: 'B' },
      { value: 3, label: '最好先把路线、时间和备选方案都过一遍', key: 'C' },
    ],
  },
  {
    id: 8,
    text: '一件事情要不要开始，你最需要的通常是什么？',
    dimension: 'J2',
    model: 'root',
    reversed: false,
    act: 1,
    options: [
      { value: 1, label: '先有一点冲动，路会边走边清楚', key: 'A' },
      { value: 2, label: '大方向对上了，我就可以先动起来', key: 'B' },
      { value: 3, label: '我得先知道它会怎么展开，才下得去手', key: 'C' },
    ],
  },
  {
    id: 9,
    text: '朋友一坐下就开始掉眼泪。你通常先做什么？',
    dimension: 'J3',
    model: 'edge',
    reversed: false,
    act: 1,
    options: [
      { value: 3, label: '几乎立刻被带进去，听着听着自己也跟着难受', key: 'A' },
      { value: 2, label: '会陪，但心里还留着一小块地方给自己', key: 'B' },
      { value: 1, label: '先把人稳住，再判断这件事该帮到哪一步', key: 'C' },
    ],
  },
  {
    id: 10,
    text: '别人问你“最近怎么样”，而你其实并不太好。你多半会怎么回？',
    dimension: 'J3',
    model: 'edge',
    reversed: false,
    act: 1,
    options: [
      { value: 1, label: '先说没事。等我想讲的时候再讲', key: 'A' },
      { value: 2, label: '挑一点能说的说，不把整个人摊开', key: 'B' },
      { value: 3, label: '如果对方接得住，我会比较真实地说出来', key: 'C' },
    ],
  },
  {
    id: 11,
    text: '有人总把自己的麻烦一股脑倒给你。你更容易变成哪种人？',
    dimension: 'J3',
    model: 'edge',
    reversed: false,
    act: 1,
    options: [
      { value: 1, label: '会先掂量自己接不接得住，不会全揽', key: 'A' },
      { value: 2, label: '能接一部分，但会给自己留口气', key: 'B' },
      { value: 3, label: '明知道会累，还是容易顺手把人接过来', key: 'C' },
    ],
  },
  {
    id: 12,
    text: '一个不算太熟的人突然来向你借很大的情绪空间，你通常会？',
    dimension: 'J3',
    model: 'edge',
    reversed: false,
    act: 1,
    options: [
      { value: 1, label: '会礼貌，但不会一下子把门开很大', key: 'A' },
      { value: 2, label: '看那天状态，能陪多少算多少', key: 'B' },
      { value: 3, label: '只要感觉对方真的难受，我很难完全抽身', key: 'C' },
    ],
  },
  {
    id: 13,
    text: '一个新兴趣刚冒出来时，你最像哪种人？',
    dimension: 'J4',
    model: 'spark',
    reversed: false,
    act: 1,
    options: [
      { value: 1, label: '先一头扎进去，连着几天都在想它', key: 'A' },
      { value: 2, label: '先靠近一点看看，真喜欢就留在生活里', key: 'B' },
      { value: 3, label: '会慢慢给它腾位置，哪怕开始得不快', key: 'C' },
    ],
  },
  {
    id: 14,
    text: '手上有件事要磨一个月。你通常靠什么把它做完？',
    dimension: 'J4',
    model: 'spark',
    reversed: false,
    act: 1,
    options: [
      { value: 3, label: '每天推进一点。慢，但不停', key: 'A' },
      { value: 2, label: '前面松一点，后面再一点点补回来', key: 'B' },
      { value: 1, label: '等某天状态来了，再猛做一阵', key: 'C' },
    ],
  },
  {
    id: 15,
    text: '你给自己立了个小目标。前七天最像哪种节奏？',
    dimension: 'J4',
    model: 'spark',
    reversed: false,
    act: 1,
    options: [
      { value: 1, label: '前两天特别认真，后面得靠重新点火', key: 'A' },
      { value: 2, label: '中间会有起伏，但大体还能接得上', key: 'B' },
      { value: 3, label: '哪怕不显眼，也会稳稳往前拱', key: 'C' },
    ],
  },
  {
    id: 16,
    text: '有件事你明明喜欢，但没人催也没人看。你通常会？',
    dimension: 'J4',
    model: 'spark',
    reversed: false,
    act: 1,
    options: [
      { value: 1, label: '容易先烧得很旺，过阵子又被别的东西带走', key: 'A' },
      { value: 2, label: '看最近有没有空间，断断续续也会碰', key: 'B' },
      { value: 3, label: '会默默做下去，它本身就够让我留下来', key: 'C' },
    ],
  },
  {
    id: 17,
    text: '白天刚被人当面否了一句。你回到自己的位置以后，通常会？',
    dimension: 'J5',
    model: 'metamorphosis',
    reversed: false,
    act: 1,
    options: [
      { value: 3, label: '先难受一下，但很快开始想：那我还能怎么做得更好', key: 'A' },
      { value: 2, label: '会闷一阵，等情绪过去再说', key: 'B' },
      { value: 1, label: '会把那句话记得很清，以后先把自己护住', key: 'C' },
    ],
  },
  {
    id: 18,
    text: '一件事没做成之后，你更容易变成哪一种人？',
    dimension: 'J5',
    model: 'metamorphosis',
    reversed: false,
    act: 1,
    options: [
      { value: 3, label: '下次会换一种走法的人', key: 'A' },
      { value: 2, label: '先放一放，过阵子再看的人', key: 'B' },
      { value: 1, label: '从此多长一个心眼的人', key: 'C' },
    ],
  },
  {
    id: 19,
    text: '你认真交出去的东西被轻飘飘误解了。你之后更像？',
    dimension: 'J5',
    model: 'metamorphosis',
    reversed: false,
    act: 1,
    options: [
      { value: 3, label: '会生气，也会想办法把话说得更准一些', key: 'A' },
      { value: 2, label: '会缓一阵，之后再决定要不要解释', key: 'B' },
      { value: 1, label: '会提醒自己：以后别再交得这么赤裸', key: 'C' },
    ],
  },
  {
    id: 20,
    text: '被人冒犯一次以后，你和同类场景的关系通常会怎么变？',
    dimension: 'J5',
    model: 'metamorphosis',
    reversed: false,
    act: 1,
    options: [
      { value: 3, label: '我会重新找更合适的站位，不一定就此退场', key: 'A' },
      { value: 2, label: '会谨慎一段时间，看后面怎么发展', key: 'B' },
      { value: 1, label: '那类场景会被我自动拉黑很久', key: 'C' },
    ],
  },
  {
    id: 21,
    text: '热闹了一整天，夜里终于关上门。那一刻你更像哪句？',
    dimension: 'J1',
    model: 'tide',
    reversed: false,
    act: 2,
    options: [
      { value: 3, label: '还想和谁再说两句，或者出去走一圈', key: 'A' },
      { value: 2, label: '松一口气，也没有特别想见谁', key: 'B' },
      { value: 1, label: '终于能把自己收回来，整个人都安静了', key: 'C' },
    ],
  },
  {
    id: 22,
    text: '真正难过的时候，你恢复得更快的方式通常是什么？',
    dimension: 'J1',
    model: 'tide',
    reversed: false,
    act: 2,
    options: [
      { value: 1, label: '先把自己藏起来，谁也别来碰我', key: 'A' },
      { value: 2, label: '找一个最信得过的人，说一点点', key: 'B' },
      { value: 3, label: '去见人、去说话、去让身体重新流动起来', key: 'C' },
    ],
  },
  {
    id: 23,
    text: '心里乱的时候，你最容易把自己放到哪种环境里？',
    dimension: 'J1',
    model: 'tide',
    reversed: false,
    act: 2,
    options: [
      { value: 1, label: '灯关小、门关上、别有人问我话', key: 'A' },
      { value: 2, label: '有个安静角落就行，不一定非得一个人', key: 'B' },
      { value: 3, label: '最好有活人的气息，哪怕只是一起坐着', key: 'C' },
    ],
  },
  {
    id: 24,
    text: '和人闹完不痛快以后，你更常用哪种方式收尾？',
    dimension: 'J1',
    model: 'tide',
    reversed: false,
    act: 2,
    options: [
      { value: 1, label: '先断联一会儿，把自己理顺再说', key: 'A' },
      { value: 2, label: '等气消一点，再决定要不要谈', key: 'B' },
      { value: 3, label: '更想尽快说开，不然那股劲会一直顶着', key: 'C' },
    ],
  },
  {
    id: 25,
    text: '有个结果迟迟不来。你最难熬的时候通常是什么感觉？',
    dimension: 'J2',
    model: 'root',
    reversed: false,
    act: 2,
    options: [
      { value: 1, label: '还好，我能先去过自己的生活', key: 'A' },
      { value: 2, label: '会惦记，但不至于整夜想', key: 'B' },
      { value: 3, label: '没有答案这件事本身，就已经很消耗我了', key: 'C' },
    ],
  },
  {
    id: 26,
    text: '要不要离开一段已经不太对的关系。你最看重的通常是什么？',
    dimension: 'J2',
    model: 'root',
    reversed: false,
    act: 2,
    options: [
      { value: 3, label: '这件事有没有一个能说服自己的答案', key: 'A' },
      { value: 2, label: '边走边看，直到心里有数', key: 'B' },
      { value: 1, label: '先动起来再说，答案会在路上长出来', key: 'C' },
    ],
  },
  {
    id: 27,
    text: '夜里反复想一件悬着的事时，最消耗你的通常是？',
    dimension: 'J2',
    model: 'root',
    reversed: false,
    act: 2,
    options: [
      { value: 3, label: '不知道边界在哪儿，心里一直悬着', key: 'A' },
      { value: 2, label: '会来回想，但还不至于被它困住', key: 'B' },
      { value: 1, label: '想太久还不如先试一下，最怕的是原地打转', key: 'C' },
    ],
  },
  {
    id: 28,
    text: '如果明天会发生一件重要的事，但还不能确定细节。你那晚通常会？',
    dimension: 'J2',
    model: 'root',
    reversed: false,
    act: 2,
    options: [
      { value: 1, label: '先睡，明天到了再应对', key: 'A' },
      { value: 2, label: '把能准备的准备掉，剩下交给明天', key: 'B' },
      { value: 3, label: '脑子会一直在补全各种版本，停不太下来', key: 'C' },
    ],
  },
  {
    id: 29,
    text: '你很在意的人说错了一句话，把你戳疼了。那天晚上你更可能——',
    dimension: 'J3',
    model: 'edge',
    reversed: false,
    act: 2,
    options: [
      { value: 3, label: '翻来覆去想他为什么会这么说，情绪很难切开', key: 'A' },
      { value: 2, label: '会难受，但也知道要先把自己拉回来', key: 'B' },
      { value: 1, label: '心里会退一步，先把门关上', key: 'C' },
    ],
  },
  {
    id: 30,
    text: '深夜有人发来一大段情绪。你更像哪种反应？',
    dimension: 'J3',
    model: 'edge',
    reversed: false,
    act: 2,
    options: [
      { value: 1, label: '先看看我有没有余力，再决定接多少', key: 'A' },
      { value: 2, label: '会回，但也知道不能整夜都泡在里面', key: 'B' },
      { value: 3, label: '很难不被卷进去，哪怕那晚我也够累了', key: 'C' },
    ],
  },
  {
    id: 31,
    text: '明明已经很累了，还是有人来敲你的门。你通常会？',
    dimension: 'J3',
    model: 'edge',
    reversed: false,
    act: 2,
    options: [
      { value: 1, label: '会装作没听见，明天再说', key: 'A' },
      { value: 2, label: '看是谁、什么事，再决定开不开门', key: 'B' },
      { value: 3, label: '只要感觉对方是真的需要，我还是会去接', key: 'C' },
    ],
  },
  {
    id: 32,
    text: '想起某段关系里的旧事时，你更容易卡在哪一步？',
    dimension: 'J3',
    model: 'edge',
    reversed: false,
    act: 2,
    options: [
      { value: 1, label: '卡在“下次我该怎么保护自己”', key: 'A' },
      { value: 2, label: '卡在“这件事到底是谁的错”', key: 'B' },
      { value: 3, label: '卡在“他当时是不是也有他的难处”', key: 'C' },
    ],
  },
  {
    id: 33,
    text: '凌晨一点，你忽然有点清醒。你更容易把这股劲用在什么地方？',
    dimension: 'J4',
    model: 'spark',
    reversed: false,
    act: 2,
    options: [
      { value: 1, label: '一口气扑向某件搁很久的事，趁现在还热', key: 'A' },
      { value: 2, label: '随便翻翻、想想，劲过了就睡', key: 'B' },
      { value: 3, label: '做一点长期在做的事，哪怕只做二十分钟', key: 'C' },
    ],
  },
  {
    id: 34,
    text: '对一件你真的在意的事，你通常更像哪一种火？',
    dimension: 'J4',
    model: 'spark',
    reversed: false,
    act: 2,
    options: [
      { value: 3, label: '一直在烧，只是别人未必看得出来', key: 'A' },
      { value: 2, label: '时亮时暗，要看这阵子生活给不给空间', key: 'B' },
      { value: 1, label: '来的时候特别猛，退的时候也特别快', key: 'C' },
    ],
  },
  {
    id: 35,
    text: '一件长期在做的事进入平淡期时，你通常会？',
    dimension: 'J4',
    model: 'spark',
    reversed: false,
    act: 2,
    options: [
      { value: 3, label: '照做，哪怕今天只能往前挪一厘米', key: 'A' },
      { value: 2, label: '会慢一点，但不至于完全断掉', key: 'B' },
      { value: 1, label: '容易先放旁边，等哪天重新被点着', key: 'C' },
    ],
  },
  {
    id: 36,
    text: '当状态迟迟不来，但事又没法不做。你更像哪种人？',
    dimension: 'J4',
    model: 'spark',
    reversed: false,
    act: 2,
    options: [
      { value: 3, label: '先坐进去，做着做着状态会来', key: 'A' },
      { value: 2, label: '我会先磨一会儿边，再慢慢进入', key: 'B' },
      { value: 1, label: '我很难硬做，通常要等那口气自己点起来', key: 'C' },
    ],
  },
  {
    id: 37,
    text: '深夜想起以前一个很狼狈的瞬间。你现在更接近哪句？',
    dimension: 'J5',
    model: 'metamorphosis',
    reversed: false,
    act: 2,
    options: [
      { value: 3, label: '已经能从那件事里看见它后来教会我的东西', key: 'A' },
      { value: 2, label: '还是会刺一下，但没有以前那么重了', key: 'B' },
      { value: 1, label: '它会提醒我：别再回到那种位置上', key: 'C' },
    ],
  },
  {
    id: 38,
    text: '被很信任的人伤过之后，你后来的变化更像什么？',
    dimension: 'J5',
    model: 'metamorphosis',
    reversed: false,
    act: 2,
    options: [
      { value: 3, label: '还是会疼，但我长出了新的理解和新的爱法', key: 'A' },
      { value: 2, label: '说不上变软还是变硬，只是跟以前不一样了', key: 'B' },
      { value: 1, label: '我会把门修得更结实，以后先保护自己', key: 'C' },
    ],
  },
  {
    id: 39,
    text: '有些旧伤隔了很久还会回来碰你一下。你更常出现的是？',
    dimension: 'J5',
    model: 'metamorphosis',
    reversed: false,
    act: 2,
    options: [
      { value: 3, label: '它会让我更懂得别人正在疼什么', key: 'A' },
      { value: 2, label: '会有波动，但不一定改变我现在的走法', key: 'B' },
      { value: 1, label: '它会提醒我，某些地方永远不能再松', key: 'C' },
    ],
  },
  {
    id: 40,
    text: '如果非要给那些没熬过去的时刻一个后果，它通常更像？',
    dimension: 'J5',
    model: 'metamorphosis',
    reversed: false,
    act: 2,
    options: [
      { value: 3, label: '像枝条，后来真的从那儿长出了别的东西', key: 'A' },
      { value: 2, label: '像疤，平时安静，碰到时还会有感觉', key: 'B' },
      { value: 1, label: '像矿层，把我压成了更硬的一块', key: 'C' },
    ],
  },
  {
    id: 41,
    text: '如果你要把自己交给一种水来保管，你更愿意是哪一种？',
    dimension: 'J1',
    model: 'tide',
    reversed: false,
    act: 3,
    options: [
      { value: 1, label: '井水。安静，深，别人不一定看得见', key: 'A' },
      { value: 2, label: '湖水。平时平静，风来了也会起波纹', key: 'B' },
      { value: 3, label: '潮水。会退，但总在向外抵达', key: 'C' },
    ],
  },
  {
    id: 42,
    text: '梦里如果要给你安排一个房间，你更希望它是什么样？',
    dimension: 'J1',
    model: 'tide',
    reversed: false,
    act: 3,
    options: [
      { value: 1, label: '窗帘半掩，安安静静，只够我把自己放回去', key: 'A' },
      { value: 2, label: '有人来时能坐下，没有人时也不空', key: 'B' },
      { value: 3, label: '门常开着，光和脚步都能自由进来', key: 'C' },
    ],
  },
  {
    id: 43,
    text: '一个让你真正安心的梦，更接近哪一种画面？',
    dimension: 'J2',
    model: 'root',
    reversed: false,
    act: 3,
    options: [
      { value: 3, label: '有地址、有灯光、有门能回去', key: 'A' },
      { value: 2, label: '路不算清楚，但知道自己不会走丢', key: 'B' },
      { value: 1, label: '没有终点也没关系，风会把我带到该去的地方', key: 'C' },
    ],
  },
  {
    id: 44,
    text: '如果你的人生在梦里总会出现一条路，它更像哪一条？',
    dimension: 'J2',
    model: 'root',
    reversed: false,
    act: 3,
    options: [
      { value: 3, label: '路边有标记，我知道下一站大概在哪', key: 'A' },
      { value: 2, label: '弯是有的，但手里总还有张简略的地图', key: 'B' },
      { value: 1, label: '像一条没被写完的路，边走边长出方向', key: 'C' },
    ],
  },
  {
    id: 45,
    text: '如果你是一座房子，你的门大概会是什么样？',
    dimension: 'J3',
    model: 'edge',
    reversed: false,
    act: 3,
    options: [
      { value: 1, label: '锁得很稳。不是拒人千里，只是谁进来由我决定', key: 'A' },
      { value: 2, label: '半开着。熟人来敲，我会让他进', key: 'B' },
      { value: 3, label: '常常没锁。真正想靠近我的人，很容易就走到我面前', key: 'C' },
    ],
  },
  {
    id: 46,
    text: '梦里有人想走近你，你更相信哪种靠近方式？',
    dimension: 'J3',
    model: 'edge',
    reversed: false,
    act: 3,
    options: [
      { value: 1, label: '先站在门外，等我点头', key: 'A' },
      { value: 2, label: '不用太快，陪我走一段就好', key: 'B' },
      { value: 3, label: '不用说太多，只要他的心先到了，我会认得', key: 'C' },
    ],
  },
  {
    id: 47,
    text: '你心里的那团火，更像下面哪一种？',
    dimension: 'J4',
    model: 'spark',
    reversed: false,
    act: 3,
    options: [
      { value: 1, label: '烟花。亮的时候惊人，之后得慢慢等下一次', key: 'A' },
      { value: 2, label: '篝火。有人添柴就旺，没人管也不会立刻灭', key: 'B' },
      { value: 3, label: '壁炉。一直在烧，安静，但能过夜', key: 'C' },
    ],
  },
  {
    id: 48,
    text: '如果把你的热爱变成一种天象，它更像什么？',
    dimension: 'J4',
    model: 'spark',
    reversed: false,
    act: 3,
    options: [
      { value: 1, label: '雷阵雨。来得急，世界一下就亮起来', key: 'A' },
      { value: 2, label: '多云转晴。需要一点时间，但会慢慢明朗', key: 'B' },
      { value: 3, label: '细雨下很久。声不大，但一直都在', key: 'C' },
    ],
  },
  {
    id: 49,
    text: '如果伤口最后会留下某种东西，你觉得更像什么？',
    dimension: 'J5',
    model: 'metamorphosis',
    reversed: false,
    act: 3,
    options: [
      { value: 3, label: '新芽。它改了我的走向，但没有把我变冷', key: 'A' },
      { value: 2, label: '疤。看得见，也并不需要立刻消失', key: 'B' },
      { value: 1, label: '矿脉。裂过一次以后，里面长出了很硬的东西', key: 'C' },
    ],
  },
  {
    id: 50,
    text: '如果你从一场很长的冬天里醒来，你希望自己带出来的是什么？',
    dimension: 'J5',
    model: 'metamorphosis',
    reversed: false,
    act: 3,
    options: [
      { value: 3, label: '一点更柔软的力气，知道自己还会继续长', key: 'A' },
      { value: 2, label: '比从前更安静的分寸', key: 'B' },
      { value: 1, label: '一层更硬的壳，先保证自己不会再碎', key: 'C' },
    ],
  },
];

export function shuffleSoultiQuestions(questions: SoultiQuestion[]): SoultiQuestion[] {
  // Rotate prompts inside each act and axis bucket, but keep the three-act journey intact.
  const buckets = new Map<string, SoultiQuestion[]>();

  for (const question of questions) {
    const key = `${question.act}:${question.dimension}`;
    const bucket = buckets.get(key) ?? [];
    bucket.push(question);
    buckets.set(key, bucket);
  }

  const sampled: SoultiQuestion[] = [];
  for (const act of [1, 2, 3] as const) {
    for (const dimension of SOULTI_DIMENSION_ORDER) {
      const key = `${act}:${dimension}`;
      const bucket = buckets.get(key) ?? [];
      const sampleCount = SOULTI_ACT_SAMPLE_COUNT[act];

      if (bucket.length < sampleCount) {
        throw new Error(`SoulTI question pool is missing enough questions for ${key}.`);
      }

      sampled.push(...shuffleArray(bucket).slice(0, sampleCount));
    }
  }

  return sampled;
}
