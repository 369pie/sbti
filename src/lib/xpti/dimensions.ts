export interface XptiDimension {
  id: string;
  name: string;
  model: XptiModelType;
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

export type XptiModelType = 'power' | 'sense' | 'focus' | 'imagine';
export type DimensionLevel = 'H' | 'M' | 'L';

export const XPTI_MODEL_NAMES: Record<XptiModelType, string> = {
  power: '权力轴',
  sense: '感知轴',
  focus: '专注轴',
  imagine: '想象轴',
};

export const XPTI_MODEL_COLORS: Record<XptiModelType, { base: string; light: string; bg: string }> = {
  power: { base: '#e8729c', light: '#f09cb8', bg: 'rgba(232,114,156,0.1)' },
  sense: { base: '#c084fc', light: '#d4a5fd', bg: 'rgba(192,132,252,0.1)' },
  focus: { base: '#f472b6', light: '#f9a8d4', bg: 'rgba(244,114,182,0.1)' },
  imagine: { base: '#a78bfa', light: '#c4b5fd', bg: 'rgba(167,139,250,0.1)' },
};

export const XPTI_DIMENSIONS: XptiDimension[] = [
  {
    id: 'X1', name: '权力轴', model: 'power',
    description: '你在关系里更倾向主导还是享受被安排',
    poleA: 'D', poleB: 'A',
    poleALabel: '女王体质', poleBLabel: '配合体质',
    levels: {
      H: '关系里你说了算，约会地点、吃什么、看什么全你定。',
      M: '看情况，有时你拿主意，有时也乐意被安排。',
      L: '你享受被带着走的感觉，"你说了算"是口头禅。',
    },
  },
  {
    id: 'X2', name: '感知轴', model: 'sense',
    description: '你的心动靠"五感仪式"还是"一瞬电击"',
    poleA: 'S', poleB: 'I',
    poleALabel: '氛围体质', poleBLabel: '直觉体质',
    levels: {
      H: '烛光、音乐、仪式感——你的心动需要被精心"布置"。',
      M: '仪式感和化学反应你都吃，看对方给哪种。',
      L: '一个眼神、一句话就能让你心跳加速，电到就够了。',
    },
  },
  {
    id: 'X3', name: '专注轴', model: 'focus',
    description: '你在感情里是"只看一个人"还是"来者不拒感"',
    poleA: 'P', poleB: 'C',
    poleALabel: '纯爱体质', poleBLabel: '反转体质',
    levels: {
      H: '认定了就是一辈子，别人再好也不看一眼。',
      M: '忠诚但不死板，偶尔也会被别人吸引一下下。',
      L: '你享受不确定性带来的刺激感，新鲜感是氧气。',
    },
  },
  {
    id: 'X4', name: '想象轴', model: 'imagine',
    description: '你的理想型活在脑子里还是Excel里',
    poleA: 'F', poleB: 'R',
    poleALabel: '脑补体质', poleBLabel: '务实体质',
    levels: {
      H: '他还没来，你已经想好了婚礼上的BGM。',
      M: '有幻想也有底线，浪漫和现实五五开。',
      L: '有车有房情绪稳定，你的理想型公式很明确。',
    },
  },
];

export function getXptiDimensionById(id: string): XptiDimension | undefined {
  return XPTI_DIMENSIONS.find(d => d.id === id);
}
