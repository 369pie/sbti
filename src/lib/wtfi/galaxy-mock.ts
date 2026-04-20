/**
 * WTFTI 星图 · Mock 数据，用于 /wtfti/galaxy/preview 内部预览
 * 真数据接入前所有视觉/文案的"假人"。
 */

import type { GalaxyResult } from './galaxy-types';

export const MOCK_GALAXY_RESULT: GalaxyResult = {
  homePlanet: {
    code: 'WTFI-STH',
    name: '暴雨港湾',
    slug: 'home-storm-harbor',
    axesVector: { W: 1.4, T: -1.8, F: 0.6, I: 2.1 },
    headline: '你内心一直有海，外表只是港。',
    body: '你看上去稳，但心里有海。别人误读你的安静，是因为他们没在你心里开过船。',
    cardImageUrl: '/images/types/galaxy/home-storm-harbor.png',
  },
  moons: [
    {
      universeId: 'romance',
      code: 'MOON-ROM-A',
      name: '初春侍神',
      slug: 'moon-romance-spring',
      headline: '在恋爱里你像一场迟到的春天。',
      body: '你爱得不快，但你能记很久。',
      cardImageUrl: '/images/types/galaxy/moon-romance-spring.png',
    },
    {
      universeId: 'work',
      code: 'MOON-WRK-A',
      name: '激光侍神',
      slug: 'moon-work-laser',
      headline: '在工作里你像一束聚焦到痛的光。',
      body: '别讲故事，告诉我变量。',
      cardImageUrl: '/images/types/galaxy/moon-work-laser.png',
    },
    {
      universeId: 'late-night',
      code: 'MOON-NIT-A',
      name: '丝绒电台侍神',
      slug: 'moon-late-velvet-radio',
      headline: '深夜独处时你是个有人收听的电台。',
      body: '半夜的脑子比白天精彩。',
      cardImageUrl: '/images/types/galaxy/moon-late-velvet-radio.png',
    },
  ],
  shadow: {
    axisScore: 2.4,
    bucket: 'SHADOW-DRIFT-A',
    slug: 'shadow-drift-a-nameless-current',
    name: '无名洋流',
    headline: '你的脑子从不真正下班。',
    body: '凌晨 2 点你的大脑在为别人写剧本。',
    tooltip:
      '在 Default Mode Network 的研究里，这种"高自发联想 + 高画面化"的剖面常出现于高想象力人群。',
    cardImageUrl: '/images/types/galaxy/shadow-drift-a-nameless-current.png',
  },
  orbit: [
    { from: '暴雨港湾', to: '初春侍神', reason: '当你在恋爱里时，你会比平时温度高 2 度。' },
    { from: '暴雨港湾', to: '激光侍神', reason: '当你在工作时，你的港湾会切换成航空管制。' },
    { from: '暴雨港湾', to: '无名洋流', reason: '当你独处够久，你的港湾会被洋流接管。' },
  ],
  meta: {
    resultId: 'mock-galaxy-001',
    createdAt: '2026-04-19T00:00:00.000Z',
    testVersion: 'wtfti-galaxy-v1-mock',
  },
};
