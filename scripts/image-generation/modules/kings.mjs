// ─── 王者TI 峡谷人格图鉴 · 国潮电竞风 (New Chinese Gaming Style) ───
// 8 张首发卡面，文案烘焙在图里
// 使用 RunningHub text2img 低价渠道

import { buildKingsCardPrompt, KINGS_CARD_TYPES } from '../../kings-card-prompts.mjs';

const kingsImageModule = {
  displayName: '王者TI 峡谷人格图鉴 · 国潮电竞风',
  seriesLabel: '王者TI 峡谷人格图鉴',
  outputPrefix: 'kings',
  outputSubdir: 'kings-cards',
  text2imgMode: true,
  cardMode: false, // 使用自定义 prompt，不用 buildUniverseCardPrompt
  aspectRatio: '3:4',
  themeColor: '#f59e0b',
  seriesTone: '国潮新中式游戏风格图鉴卡，热血峡谷 × 社交梗图 × 截图分享。',
  types: KINGS_CARD_TYPES.map((type) => ({
    slug: type.slug,
    prompt: buildKingsCardPrompt(type),
  })),
};

export default kingsImageModule;
