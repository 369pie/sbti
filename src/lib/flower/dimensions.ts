export interface FlowerDimension {
  id: string;
  name: string;
  model: FlowerModelType;
  description: string;
  poleA: string;
  poleB: string;
  poleALabel: string;
  poleBLabel: string;
  levels: {
    H: string;
    M: string;
    L: string;
  };
}

export type FlowerModelType = 'photosynthesis' | 'bloom' | 'root' | 'armor';
export type DimensionLevel = 'H' | 'M' | 'L';

export const FLOWER_MODEL_NAMES: Record<FlowerModelType, string> = {
  photosynthesis: '光合轴',
  bloom: '花期轴',
  root: '根系轴',
  armor: '铠甲轴',
};

export const FLOWER_MODEL_COLORS: Record<FlowerModelType, { base: string; light: string; bg: string }> = {
  photosynthesis: { base: '#f59e0b', light: '#fbbf24', bg: 'rgba(245,158,11,0.10)' },
  bloom: { base: '#ec4899', light: '#f9a8d4', bg: 'rgba(236,72,153,0.10)' },
  root: { base: '#10b981', light: '#6ee7b7', bg: 'rgba(16,185,129,0.10)' },
  armor: { base: '#e11d48', light: '#fb7185', bg: 'rgba(225,29,72,0.10)' },
};

export const FLOWER_DIMENSIONS: FlowerDimension[] = [
  {
    id: 'F1', name: '光合轴', model: 'photosynthesis',
    description: '你的能量从人群中来，还是从独处中来',
    poleA: 'H', poleB: 'S',
    poleALabel: '向光型', poleBLabel: '趋暗型',
    levels: {
      H: '人群是你的太阳——聚会完不但不累，反而越嗨越精神。',
      M: '看状态。有时候想嗨，有时候想一个人待着。',
      L: '充电方式：关门、关灯、关手机。独处是你最好的光合作用。',
    },
  },
  {
    id: 'F2', name: '花期轴', model: 'bloom',
    description: '你的情绪是写在脸上，还是藏在心底',
    poleA: 'B', poleB: 'L',
    poleALabel: '盛放型', poleBLabel: '蓄蕾型',
    levels: {
      H: '你的心情全写在脸上——开心炸了全世界都知道，不高兴了谁也别惹。',
      M: '有些情绪会表达，有些会咽下去，看场合。',
      L: '内心戏多到可以出全集，但表面上风平浪静。',
    },
  },
  {
    id: 'F3', name: '根系轴', model: 'root',
    description: '你的关系是深深扎根，还是四处蔓延',
    poleA: 'T', poleB: 'F',
    poleALabel: '主根型', poleBLabel: '须根型',
    levels: {
      H: '朋友不用多，三五个掏心窝的就够了。深度大于广度。',
      M: '有几个特别亲近的，也维护着更大的社交圈。',
      L: '交友范围极广，群聊30个随时在线，到处都有熟人。',
    },
  },
  {
    id: 'F4', name: '铠甲轴', model: 'armor',
    description: '你保护自己的方式是竖起刺，还是敞开怀',
    poleA: 'R', poleB: 'O',
    poleALabel: '带刺型', poleBLabel: '无刺型',
    levels: {
      H: '边界感极强，拒绝时毫不犹豫。谁也别想轻易越线。',
      M: '大部分时候开放友善，但触碰底线会立刻收紧。',
      L: '心门常开，信任先行。即使被伤过，下次还是选择相信。',
    },
  },
];

export function getFlowerDimensionById(id: string): FlowerDimension | undefined {
  return FLOWER_DIMENSIONS.find(d => d.id === id);
}
