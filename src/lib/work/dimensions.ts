export interface WorkDimension {
  id: string;
  name: string;
  model: WorkModelType;
  description: string;
  levels: {
    H: string;
    M: string;
    L: string;
  };
}

export type WorkModelType = 'drive' | 'social' | 'stress' | 'slack' | 'ambition';
export type DimensionLevel = 'H' | 'M' | 'L';

export const WORK_MODEL_NAMES: Record<WorkModelType, string> = {
  drive: '工作驱动力',
  social: '职场社交',
  stress: '抗压能力',
  slack: '摸鱼指数',
  ambition: '野心指数',
};

export const WORK_MODEL_COLORS: Record<WorkModelType, { base: string; light: string; bg: string }> = {
  drive: { base: '#ef4444', light: '#f87171', bg: 'rgba(239,68,68,0.1)' },
  social: { base: '#06b6d4', light: '#22d3ee', bg: 'rgba(6,182,212,0.1)' },
  stress: { base: '#10b981', light: '#34d399', bg: 'rgba(16,185,129,0.1)' },
  slack: { base: '#8b5cf6', light: '#a78bfa', bg: 'rgba(139,92,246,0.1)' },
  ambition: { base: '#f59e0b', light: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
};

export const WORK_DIMENSIONS: WorkDimension[] = [
  {
    id: 'W1', name: '工作驱动力', model: 'drive',
    description: '你干活到底靠什么在推',
    levels: {
      H: '自驱力拉满，不用催就能自循环运转。',
      M: '有时自推有时被推，取决于这件事你爱不爱干。',
      L: '主要靠deadline和领导催，自驱系统基本离线。',
    },
  },
  {
    id: 'W2', name: '职场社交', model: 'social',
    description: '在公司你是社牛还是社恐',
    levels: {
      H: '全公司没有你不认识的人，茶水间就是你的主场。',
      M: '和熟人能聊，和生人也能应付，看心情。',
      L: '能不说话就不说话，最怕突然被cue到。',
    },
  },
  {
    id: 'W3', name: '抗压能力', model: 'stress',
    description: '扛得住压还是一碰就碎',
    levels: {
      H: '压力就像弹簧，压得越狠你弹得越高。',
      M: '普通压力能扛，连环暴击可能会有点摇。',
      L: '压力一大就想躲，情绪垃圾桶容量有限。',
    },
  },
  {
    id: 'W4', name: '摸鱼指数', model: 'slack',
    description: '你在上班还是在上班摸鱼',
    levels: {
      H: '摸鱼已经是一门艺术，你是行为艺术家。',
      M: '忙的时候干活，闲的时候摸，动态平衡。',
      L: '老老实实干活，摸鱼的胆子都不太有。',
    },
  },
  {
    id: 'W5', name: '野心指数', model: 'ambition',
    description: '你对职业的期望值有多高',
    levels: {
      H: '升职加薪是基操，目标直指人生巅峰。',
      M: '有点追求但不至于拼命，差不多就行。',
      L: '活着就好别裁我，不求上进但求安稳。',
    },
  },
];

export function getWorkDimensionById(id: string): WorkDimension | undefined {
  return WORK_DIMENSIONS.find(d => d.id === id);
}
