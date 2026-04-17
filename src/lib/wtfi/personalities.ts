/**
 * WTFTI 4 轴原生人格池（v0 · 12 个原型）
 *
 * 不再用旧 27 型；这是一组按"4 轴象限组合"派生的原生人格，
 * 每个人格用 4 轴 profile 表达（-3..+3），匹配走最近邻。
 *
 * 命名延续 SBTI 荒诞文学传统："恭喜您，您是…"
 */

import type { WtfiAxis } from './axes';

export interface WtfiPersonality {
  slug: string;
  /** 4 字母代号（高低极组合，便于品牌化记忆） */
  code: string;
  name: string;
  tagline: string;
  description: string;
  /** -3..+3 profile */
  profile: Record<WtfiAxis, number>;
  /** 主调色 */
  color: string;
  /** rarity tier */
  rarity: 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';
  /** 一句"在每个宇宙里你大概会变成什么" */
  universeHint?: string;
}

/**
 * code 命名规则：
 *  W± T± F± I±   → 4 字母："w"="易点燃" / "k"="钝感"; "t"="外倾" / "n"="内倾"; "x"="可塑" / "s"="稳定"; "i"="自洽" / "r"="关系"
 *  例：WTFi = 易点燃·外倾·可塑·关系型
 */
export const WTFI_PERSONALITIES: WtfiPersonality[] = [
  {
    slug: 'firework',
    code: 'WTXI',
    name: '烟火型',
    tagline: '一点就着，烧完就睡',
    description:
      '恭喜您，您是烟火型人格。任何风吹草动都能点燃您，且燃完之后切换速度比 4G 还快。您不是不深刻，您只是把所有深刻都用光速燃烧掉了。',
    profile: { W: 2.5, T: 2, F: 2, I: 1 },
    color: '#E0727B',
    rarity: 'rare',
    universeHint: '修仙宇宙：散修烟花派；恋爱宇宙：闪电式心动者',
  },
  {
    slug: 'thunder',
    code: 'WnSi',
    name: '雷暴型',
    tagline: '外面平静，里面正在打雷',
    description:
      '恭喜您，您是雷暴型人格。一切刺激都能引起您内部的剧烈反应，但您选择把它们全部存进脑子里反复播放。您可能从来没有真正"过去"过任何一件事。',
    profile: { W: 2.5, T: -2.5, F: -1, I: 1 },
    color: '#7A6FA8',
    rarity: 'epic',
    universeHint: 'SoulTI 宇宙：深夜雷暴学家；班 TI 宇宙：内耗型主力',
  },
  {
    slug: 'sun',
    code: 'KTxR',
    name: '阳光型',
    tagline: '钝感外向人见人爱',
    description:
      '恭喜您，您是阳光型人格。不是您事少，是您屏蔽噪音的能力是天赋。您没有被世界温柔以待，是您温柔以待了世界。',
    profile: { W: -1.5, T: 2.5, F: 1.5, I: -1 },
    color: '#F2B85A',
    rarity: 'rare',
    universeHint: 'Hogti：赫奇帕奇；恋爱宇宙：稳定情绪供给型',
  },
  {
    slug: 'deep-sea',
    code: 'KnSi',
    name: '深海型',
    tagline: '不是没反应，是反应在 3 公里深处',
    description:
      '恭喜您，您是深海型人格。表面波澜不惊，海床里全是文物。您不是冷，您只是消化得太慢、又不愿意拉别人下水。',
    profile: { W: -2, T: -2, F: -1, I: 2 },
    color: '#4A6B82',
    rarity: 'uncommon',
    universeHint: '修仙宇宙：洞府闭关常驻；SoulTI：深海回响者',
  },
  {
    slug: 'mercury',
    code: 'WtxI',
    name: '流体侠',
    tagline: '没有形状就是最好的形状',
    description:
      '恭喜您，您是流体侠人格。环境一变您就跟着变，但您的内核反而非常稳——因为您把"会变"本身当成了内核。这是一种很高级的稳定。',
    profile: { W: 1.5, T: 1, F: 3, I: 2 },
    color: '#7B9E89',
    rarity: 'legendary',
    universeHint: 'WTFTI 毒舌宇宙：变形虫型；班 TI：跨部门救火队',
  },
  {
    slug: 'kaleido',
    code: 'WtxR',
    name: '万花镜',
    tagline: '在每段关系里都是不同的我',
    description:
      '恭喜您，您是万花镜人格。同一个您，在不同人面前是 12 种皮肤。您不是不真诚，您只是把"应对"做成了艺术。代价：偶尔自己也会忘了哪个是底色。',
    profile: { W: 2, T: 2, F: 2.5, I: -2 },
    color: '#C07A8E',
    rarity: 'epic',
    universeHint: 'CPTI：关系适配大师；XPTI：钓系暧昧体质',
  },
  {
    slug: 'mountain',
    code: 'KnSi-2',
    name: '山岳型',
    tagline: '稳定到让人怀疑您是不是活的',
    description:
      '恭喜您，您是山岳型人格。任你风吹雨打，我自岿然不动。优点是别人都靠您；缺点是您也很久没让自己倒一次了。',
    profile: { W: -1.5, T: -0.5, F: -2.5, I: 2.5 },
    color: '#6B7355',
    rarity: 'epic',
    universeHint: '班 TI：定海神针型主管；修仙：稳健派老祖宗',
  },
  {
    slug: 'temple-keeper',
    code: 'KnSr',
    name: '守庙人',
    tagline: '为他人的信念稳稳守了一辈子',
    description:
      '恭喜您，您是守庙人人格。您把锚点交给了一段关系 / 一个集体 / 一个理想，并且认认真真守它一辈子。世界需要您这种人，但请偶尔也守一下自己。',
    profile: { W: -1, T: -1, F: -2, I: -2.5 },
    color: '#A85C64',
    rarity: 'uncommon',
    universeHint: 'SoulTI：祭司型；班 TI：忠诚老员工',
  },
  {
    slug: 'cat-walker',
    code: 'KtxI',
    name: '猫步型',
    tagline: '看上去没在用力，其实步步精算',
    description:
      '恭喜您，您是猫步型人格。钝感、外倾、可塑、自洽——四个高级品质同时点亮。您不是不在乎，您只是把在乎藏在了无所谓的姿势里。',
    profile: { W: -1, T: 1.5, F: 2, I: 2.5 },
    color: '#B8905A',
    rarity: 'legendary',
    universeHint: 'XPTI：天选钓系；Hogti：拉文克劳隐藏款',
  },
  {
    slug: 'paper-tiger',
    code: 'WtSr',
    name: '纸老虎',
    tagline: '炸毛三秒，回家秒怂',
    description:
      '恭喜您，您是纸老虎人格。在外人面前一点就炸，但回到房间立刻怀疑自己是不是反应过度。您的内心戏每天能拍一部电视剧。',
    profile: { W: 2.5, T: 1, F: -2, I: -2 },
    color: '#D88A6A',
    rarity: 'common',
    universeHint: '毒舌 WTFTI：嘴硬心软主力军；Drunk 宇宙：酒前嘴炮酒后哭',
  },
  {
    slug: 'observer',
    code: 'KnxI',
    name: '观察员',
    tagline: '看了三轮才出手，出手就是终局',
    description:
      '恭喜您，您是观察员人格。世界在打闹，您在做笔记。您不是冷漠，您只是相信"看清再动"比"动了再说"性价比高得多。',
    profile: { W: -2, T: -0.5, F: 2, I: 2 },
    color: '#5C7385',
    rarity: 'rare',
    universeHint: '修仙：旁观渡劫的散修；CPTI：关系局外人',
  },
  {
    slug: 'mirror',
    code: 'WnxR',
    name: '镜面型',
    tagline: '别人是什么样，您就成为什么样',
    description:
      '恭喜您，您是镜面型人格。您的反应模式由对面那个人决定，您比 ta 自己更懂 ta 想要什么。这是天赋，但请记得：您也值得被照见。',
    profile: { W: 2, T: -1.5, F: 2.5, I: -2.5 },
    color: '#8FA1B5',
    rarity: 'epic',
    universeHint: 'CPTI：关系镜像；恋爱宇宙：高敏共情型',
  },
];

/**
 * 在 WTFI 4 轴 profile 中找最近邻人格
 */
export function matchWtfiPersonality(
  axes: Record<WtfiAxis, number>,
): WtfiPersonality {
  let best = WTFI_PERSONALITIES[0];
  let bestDist = Infinity;
  for (const p of WTFI_PERSONALITIES) {
    let d = 0;
    for (const a of ['W', 'T', 'F', 'I'] as WtfiAxis[]) {
      const diff = axes[a] - p.profile[a];
      d += diff * diff;
    }
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  return best;
}
