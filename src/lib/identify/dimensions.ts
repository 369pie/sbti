export interface IdentifyDimension {
  id: string;
  name: string;
  model: IdentifyModelType;
  description: string;
  levels: {
    H: string;
    M: string;
    L: string;
  };
}

export type IdentifyModelType = 'social' | 'emotion' | 'drive' | 'vibe' | 'loyalty';
export type DimensionLevel = 'H' | 'M' | 'L';

export const IDENTIFY_MODEL_NAMES: Record<IdentifyModelType, string> = {
  social: '社交能量',
  emotion: '情绪浓度',
  drive: '行动力',
  vibe: '氛围感',
  loyalty: '忠诚值',
};

export const IDENTIFY_MODEL_COLORS: Record<IdentifyModelType, { base: string; light: string; bg: string }> = {
  social:  { base: '#f59e0b', light: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
  emotion: { base: '#ef4444', light: '#f87171', bg: 'rgba(239,68,68,0.1)' },
  drive:   { base: '#8b5cf6', light: '#a78bfa', bg: 'rgba(139,92,246,0.1)' },
  vibe:    { base: '#06b6d4', light: '#22d3ee', bg: 'rgba(6,182,212,0.1)' },
  loyalty: { base: '#ec4899', light: '#f472b6', bg: 'rgba(236,72,153,0.1)' },
};

export const IDENTIFY_DIMENSIONS: IdentifyDimension[] = [
  {
    id: 'D1', name: '社交能量', model: 'social',
    description: 'ta 在人群中是发电机还是充电器',
    levels: {
      H: 'ta 是人群中的发电站，到哪都自带音响。',
      M: 'ta 看心情社交，有时嗨有时宅。',
      L: 'ta 的理想社交距离是一个太平洋。',
    },
  },
  {
    id: 'D2', name: '情绪浓度', model: 'emotion',
    description: 'ta 的情绪是矿泉水还是浓缩咖啡',
    levels: {
      H: 'ta 的喜怒哀乐全都加了十倍浓缩。',
      M: 'ta 有情绪但一般不外溢。',
      L: 'ta 的情绪波动跟心电图一样——一条直线。',
    },
  },
  {
    id: 'D3', name: '行动力', model: 'drive',
    description: 'ta 是说干就干还是说躺就躺',
    levels: {
      H: 'ta 说走就走，纠结是不存在的。',
      M: 'ta 犹豫一下，但最后还是会动。',
      L: 'ta 的行动力还在充电中，预计明天到货。',
    },
  },
  {
    id: 'D4', name: '氛围感', model: 'vibe',
    description: 'ta 给人的感觉是温暖阳光还是高冷禁欲',
    levels: {
      H: 'ta 走到哪都是小太阳，自带暖色滤镜。',
      M: 'ta 对熟人温暖，对生人客气。',
      L: 'ta 的气场写着"生人勿近"。',
    },
  },
  {
    id: 'D5', name: '忠诚值', model: 'loyalty',
    description: 'ta 对朋友是掏心掏肺还是点到为止',
    levels: {
      H: 'ta 对认定的人可以掏心掏肺掏肾。',
      M: 'ta 有分寸感，该帮的帮，不该扛的不扛。',
      L: 'ta 对所有人一视同仁地保持距离。',
    },
  },
];

export function getIdentifyDimensionById(id: string): IdentifyDimension | undefined {
  return IDENTIFY_DIMENSIONS.find(d => d.id === id);
}
