export interface CptiDimension {
  id: string;
  name: string;
  model: CptiModelType;
  description: string;
  levels: {
    H: string;
    M: string;
    L: string;
  };
}

export type CptiModelType = 'power' | 'express' | 'conflict' | 'care' | 'fusion';
export type DimensionLevel = 'H' | 'M' | 'L';

export const CPTI_MODEL_NAMES: Record<CptiModelType, string> = {
  power: '主导力',
  express: '表达力',
  conflict: '冲突力',
  care: '付出力',
  fusion: '融合度',
};

export const CPTI_MODEL_COLORS: Record<CptiModelType, { base: string; light: string; bg: string }> = {
  power: { base: '#e11d48', light: '#fb7185', bg: 'rgba(225,29,72,0.1)' },
  express: { base: '#f59e0b', light: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
  conflict: { base: '#ef4444', light: '#f87171', bg: 'rgba(239,68,68,0.1)' },
  care: { base: '#ec4899', light: '#f472b6', bg: 'rgba(236,72,153,0.1)' },
  fusion: { base: '#8b5cf6', light: '#a78bfa', bg: 'rgba(139,92,246,0.1)' },
};

export const CPTI_DIMENSIONS: CptiDimension[] = [
  {
    id: 'C1', name: '主导力', model: 'power',
    description: '这段关系里谁拿主意',
    levels: {
      H: '大事小事你说了算，约会地点、吵架节奏全由你掌控。',
      M: '看情况，有时主导有时配合，随心情切换。',
      L: '对方安排你就跟着走，\"你说了算\"是你的口头禅。',
    },
  },
  {
    id: 'C2', name: '表达力', model: 'express',
    description: '你的爱是说出来还是做出来',
    levels: {
      H: '\"我爱你\"挂嘴边，朋友圈天天秀恩爱，甜言蜜语不要钱。',
      M: '偶尔表达，重要时刻不缺席，但不会腻到发朋友圈。',
      L: '嘴上不说但默默做了很多，对方可能觉得你不够浪漫。',
    },
  },
  {
    id: 'C3', name: '冲突力', model: 'conflict',
    description: '吵架时你是爆炸还是沉默',
    levels: {
      H: '当场炸，想说什么说什么，绝不冷战留过夜。',
      M: '看事情大小，小事忍忍，大事还是要摊开说。',
      L: '沉默、冷处理、已读不回，等对方先来哄。',
    },
  },
  {
    id: 'C4', name: '付出力', model: 'care',
    description: '关系里谁照顾谁多一点',
    levels: {
      H: '你就是恋爱保姆，对方吃穿住行你全想操心。',
      M: '互相照顾，但你稍微多付出一点也无所谓。',
      L: '被宠是你的舒适区，撒娇是你的核心技能。',
    },
  },
  {
    id: 'C5', name: '融合度', model: 'fusion',
    description: '你俩在一起是融为一体还是各自精彩',
    levels: {
      H: '\"我们\"大于\"我\"，恨不得手机壳都用情侣款。',
      M: '在一起很甜，分开也能各自安好。',
      L: '有自己的圈子和时间，恋爱不影响独立生活。',
    },
  },
];

export function getCptiDimensionById(id: string): CptiDimension | undefined {
  return CPTI_DIMENSIONS.find(d => d.id === id);
}
