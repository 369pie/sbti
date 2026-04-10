export interface DailyDimension {
  id: string;
  name: string;
  model: DailyModelType;
  description: string;
  levels: {
    H: string;
    M: string;
    L: string;
  };
}

export type DailyModelType = 'energy' | 'mood' | 'social' | 'focus' | 'stress';
export type DimensionLevel = 'H' | 'M' | 'L';

export const DAILY_MODEL_NAMES: Record<DailyModelType, string> = {
  energy: '能量值',
  mood: '心情指数',
  social: '社交电量',
  focus: '专注力',
  stress: '压力值',
};

export const DAILY_MODEL_COLORS: Record<DailyModelType, { base: string; light: string; bg: string }> = {
  energy: { base: '#ef4444', light: '#f87171', bg: 'rgba(239,68,68,0.1)' },
  mood: { base: '#f59e0b', light: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
  social: { base: '#06b6d4', light: '#22d3ee', bg: 'rgba(6,182,212,0.1)' },
  focus: { base: '#8b5cf6', light: '#a78bfa', bg: 'rgba(139,92,246,0.1)' },
  stress: { base: '#f43f5e', light: '#fb7185', bg: 'rgba(244,63,94,0.1)' },
};

export const DAILY_DIMENSIONS: DailyDimension[] = [
  {
    id: 'D1', name: '能量值', model: 'energy',
    description: '你今天有多少电',
    levels: {
      H: '今天你像刚充满电的充电宝，精力拉满。',
      M: '电量一般般，够用但别太折腾。',
      L: '今天你是低电量模式，能省则省。',
    },
  },
  {
    id: 'D2', name: '心情指数', model: 'mood',
    description: '今天你的情绪温度',
    levels: {
      H: '今日份快乐已到货，请签收。',
      M: '心情不好不坏，平平淡淡。',
      L: '今天情绪有点down，需要被温柔对待。',
    },
  },
  {
    id: 'D3', name: '社交电量', model: 'social',
    description: '你今天想不想跟人说话',
    levels: {
      H: '社交模式全开，今天想跟全世界聊天。',
      M: '选择性社交，熟人可以，生人算了。',
      L: '今天请勿打扰，社交电量已耗尽。',
    },
  },
  {
    id: 'D4', name: '专注力', model: 'focus',
    description: '你的大脑今天能集中多久',
    levels: {
      H: '今天脑子格外清醒，进入心流不是梦。',
      M: '能集中但容易飘，需要时不时拉回来。',
      L: '今天脑子像浆糊，思维到处乱飞。',
    },
  },
  {
    id: 'D5', name: '压力值', model: 'stress',
    description: '今天你背了多少包袱',
    levels: {
      H: '压力拉满，感觉肩膀上扛了一座山。',
      M: '有点压力但还hold住，小紧绷。',
      L: '今天很松弛，压力什么的不存在。',
    },
  },
];

export function getDailyDimensionById(id: string): DailyDimension | undefined {
  return DAILY_DIMENSIONS.find(d => d.id === id);
}
