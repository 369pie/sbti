/**
 * WTFTI · Signature Perfume × Soul Crystal
 *
 * 灵感参考：小红书「你是哪一瓶香水？」病毒测试 + Editorial Atelier × 暮光博物笔记的语气。
 *
 * 每个主神（home planet）配对一支真实香水（年代 / 调性 / 情感故事）和一颗灵魂结晶（水晶）。
 * 这个映射是确定性的（按 home planet slug），所以无 soul probe 的预览也能呈现，
 * 真实测试用户若选了 scent，会附带一句"你嗅觉档案的延伸"作为个性化呼应。
 *
 * 战略：女性向情感共鸣 · 高分享 · 不靠数据靠香水 + 水晶建立"被看见"的瞬间。
 */

import type { HomePlanetSlug } from './constellation-anchors';
import { getSoulPerfume, getSoulTexture } from './sense-profile';
import type { SoulAnswers } from './soul-resonance';

export interface SoulCrystal {
  /** 中文名 · 罗曼蒂克命名 */
  name: string;
  /** 拉丁/英文名（小标题用） */
  latin: string;
  /** 主色 hex（与 perfume 协调） */
  color: string;
  /** 一句寓意（≤22 字） */
  hint: string;
  /** ≤6 字标签（疗愈面） */
  tag: string;
}

export interface SignaturePerfume {
  /** 香水屋大写名 */
  house: string;
  /** 香水名 · 用 Cormorant italic 显示 */
  name: string;
  /** 创制年份或代表年份 */
  year: string;
  /** ≤24 字浪漫定位（性别 · 价位 · 调系） */
  positioning: string;
  /** 三组调性 chip（最多 3 个） */
  toneChips: string[];
  /** 调香金字塔 */
  pyramid: {
    top: string;
    heart: string;
    base: string;
  };
  /** 编辑式故事段（2–3 句） */
  story: string;
  /** 适合季节 / 场合 chips */
  occasion: string[];
  /** 与神域人格呼应的一句话（编辑视角） */
  whisper: string;
  /** 主色 hex（用于卡片描边 + 高光） */
  accent: string;
  /** 配对水晶 */
  crystal: SoulCrystal;
}

export const SIGNATURE_PERFUMES: Record<HomePlanetSlug, SignaturePerfume> = {
  'home-storm-harbor': {
    house: 'GUERLAIN',
    name: 'Mitsouko',
    year: '1919',
    positioning: '东方西普 · 女 · S$220–320',
    toneChips: ['西普', '桃心', '克制'],
    pyramid: {
      top: '佛手柑 香柠檬 桃子',
      heart: '玫瑰 茉莉 鸢尾',
      base: '橡苔 香根草 沉香',
    },
    story:
      '1919 年 Jacques Guerlain 为一段战时未尽的爱写下 Mitsouko，意为"神秘"。它是一整片潮湿的果园在退潮后还留着的香——不喧哗，但久。',
    occasion: ['秋', '冬', '雨夜', '一个人写信'],
    whisper: '你内心有海，外表只是港。Mitsouko 把那片潮汐写在了瓶子里。',
    accent: '#C07A8E',
    crystal: {
      name: '海蓝宝',
      latin: 'Aquamarine',
      color: '#7DB6C4',
      hint: '让你不必把潮汐藏起来。',
      tag: '稳潮汐',
    },
  },

  'home-aurora-parlour': {
    house: 'LE LABO',
    name: 'Santal 33',
    year: '2011',
    positioning: '中性木质 · 中性 · S$320–430',
    toneChips: ['雪松', '皮革', '篝火'],
    pyramid: {
      top: '小豆蔻 紫罗兰',
      heart: '鸢尾 雪松',
      base: '檀香 皮革 麝香',
    },
    story:
      '一支让整个房间都记得你刚刚来过的香。Santal 33 像一盏永远亮着的客厅灯——所有路过的人都觉得自己被记得。',
    occasion: ['四季', '布展', '夜晚的客厅', '招待远方朋友'],
    whisper: '你把每一次相遇都布置成展览。Santal 33 是展览开幕时点亮的那支蜡。',
    accent: '#D4B58A',
    crystal: {
      name: '黄水晶',
      latin: 'Citrine',
      color: '#E2B85C',
      hint: '让你的暖意有储存罐。',
      tag: '蓄暖意',
    },
  },

  'home-gilded-loom': {
    house: 'HERMÈS',
    name: 'Eau des Merveilles',
    year: '2004',
    positioning: '中性琥珀 · 中性 · S$180–260',
    toneChips: ['琥珀', '盐', '木'],
    pyramid: {
      top: '橙子 柚子 粉胡椒',
      heart: '埃尔默乌斯 龙涎香 安息香',
      base: '橡苔 雪松 香根草',
    },
    story:
      '"Merveilles"——奇迹。它不是一朵盛开的花，而是一整匹海风在老木头上慢慢留下的盐迹。像你把日子织成可以穿出门的外套。',
    occasion: ['春', '秋', '远距离寄信日', '老朋友重聚'],
    whisper: '你不靠激情维持关系，你靠时间。这支琥珀和你一样越穿越熟。',
    accent: '#C9A676',
    crystal: {
      name: '金发晶',
      latin: 'Rutilated Quartz',
      color: '#C9A676',
      hint: '让长情有金色的纹路。',
      tag: '理金线',
    },
  },

  'home-silent-lighthouse': {
    house: 'DIPTYQUE',
    name: 'Philosykos',
    year: '1996',
    positioning: '清新木质 · 中性 · S$170–230',
    toneChips: ['无花果', '雪松', '海风'],
    pyramid: {
      top: '无花果叶',
      heart: '无花果 椰青',
      base: '雪松 麝香',
    },
    story:
      '调香师 Olivia Giacobetti 把希腊小岛上一棵无花果树的整一天写进了瓶子——叶子、果肉、晒过太阳的木头。安静，但所有人都靠它定位。',
    occasion: ['夏', '清晨', '海边读书', '一个人散步'],
    whisper: '你不需要发光，你只是恰好在那儿。这支无花果是岛上最旧的那盏灯。',
    accent: '#9DC9FF',
    crystal: {
      name: '月光石',
      latin: 'Moonstone',
      color: '#C9D6E8',
      hint: '让安静本身成为坐标。',
      tag: '稳坐标',
    },
  },

  'home-slow-galaxy': {
    house: 'MAISON MARGIELA',
    name: 'Replica · By the Fireplace',
    year: '2015',
    positioning: '甜美木质 · 中性 · S$190–280',
    toneChips: ['烤栗子', '丁香', '香草'],
    pyramid: {
      top: '粉红胡椒 橙花 丁香',
      heart: '栗子 愈创木 椴树',
      base: '香草 安息香 雪松',
    },
    story:
      '一整个壁炉的暖意被锁进瓶子里。它不催促任何回应，像一位慢慢说话但每句话都准的母亲。',
    occasion: ['冬', '深夜', '写完一段长信', '把别人哄睡之后'],
    whisper: '你说的每句话都比别人晚到三秒，但更准。这支壁炉就是为你这种节奏写的。',
    accent: '#9C7CFF',
    crystal: {
      name: '紫水晶',
      latin: 'Amethyst',
      color: '#9C7CFF',
      hint: '让慢思考有自己的温度。',
      tag: '稳慢板',
    },
  },

  'home-drift-glacier': {
    house: 'ACQUA DI PARMA',
    name: 'Mirto di Panarea',
    year: '2010',
    positioning: '海洋香草 · 中性 · S$170–240',
    toneChips: ['桃金娘', '海风', '柠檬'],
    pyramid: {
      top: '柠檬 香柠檬',
      heart: '桃金娘 乳香树脂',
      base: '岩兰草 雪松',
    },
    story:
      'Panarea 是地中海上一座只在夏天热闹的小岛。这支香把"在两个海域之间漂流"的温柔做成了瓶子——你在哪里都不算外人。',
    occasion: ['夏', '海边', '机场', '寄一张明信片'],
    whisper: '你不是冷，你只是漂在两个海域之间。这片海风替你写完了那封迟到的信。',
    accent: '#7AC8E0',
    crystal: {
      name: '拉长石',
      latin: 'Labradorite',
      color: '#7AC8E0',
      hint: '让漂泊也有反光。',
      tag: '稳两岸',
    },
  },

  'home-obsidian-belfry': {
    house: 'SERGE LUTENS',
    name: 'Ambre Sultan',
    year: '2000',
    positioning: '神秘东方 · 中性 · S$240–340',
    toneChips: ['琥珀', '没药', '迷迭香'],
    pyramid: {
      top: '迷迭香 月桂',
      heart: '安息香 没药',
      base: '琥珀 香脂 麝香'
    },
    story:
      'Serge Lutens 在马拉喀什的庭院里写下了 Ambre Sultan——黄昏后教堂钟声那一刻的味道。它不响则已，一响就是预言。',
    occasion: ['秋', '冬', '夜晚仪式', '独自走进一座旧建筑'],
    whisper: 'ta 不响则已，一响就是预言。这支琥珀就是钟楼里那只从不开口的钟。',
    accent: '#5C4A8A',
    crystal: {
      name: '黑曜石',
      latin: 'Obsidian',
      color: '#3C2F5C',
      hint: '让预言不必解释自己。',
      tag: '收余响',
    },
  },

  'home-mars-rose-garden': {
    house: 'FRÉDÉRIC MALLE',
    name: 'Portrait of a Lady',
    year: '2010',
    positioning: '炽烈玫瑰 · 女 · S$420–560',
    toneChips: ['土耳其玫瑰', '广藿香', '熏香'],
    pyramid: {
      top: '黑加仑 树莓 丁香',
      heart: '土耳其玫瑰 肉桂',
      base: '广藿香 乳香 檀香 麝香',
    },
    story:
      '调香师 Dominique Ropion 写过：「我想做一支让女人在房间里被认出来的玫瑰。」于是有了 Portrait of a Lady——一支炽烈、不收敛、占据所有空间的玫瑰。',
    occasion: ['秋', '冬', '战袍夜晚', '不打算妥协的一天'],
    whisper: '你的爱和怒火本来就是同一个温度。这支玫瑰就是你那束从未熄灭的火。',
    accent: '#E04E6B',
    crystal: {
      name: '红碧玺',
      latin: 'Red Tourmaline',
      color: '#E04E6B',
      hint: '让炽烈也是一种秩序。',
      tag: '驯火心',
    },
  },
};

export function getSignaturePerfume(homeSlug: string): SignaturePerfume | null {
  return (SIGNATURE_PERFUMES as Record<string, SignaturePerfume | undefined>)[homeSlug] ?? null;
}

/**
 * 把 soul probe 答案变成"你嗅觉档案的延伸"一行（如果用户做过 S 轴）。
 * 没有就返回 null。
 */
export function getPerfumeAnnotation(answers?: SoulAnswers | null): string | null {
  if (!answers) return null;
  const perfume = getSoulPerfume(answers);
  const texture = getSoulTexture(answers);
  if (!perfume && !texture) return null;
  const parts: string[] = [];
  if (perfume) parts.push(`你的嗅觉档案是 ${perfume.name} · ${perfume.hint}`);
  if (texture) parts.push(`触感是 ${texture.name} · ${texture.verb}`);
  return parts.join('；');
}
