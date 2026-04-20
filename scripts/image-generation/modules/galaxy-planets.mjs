import {
  buildAllGalaxyPrompts,
  HOME_PLANETS,
  MOON_PLANETS,
  SHADOW_PLANETS,
} from '../../galaxy-planet-prompts.mjs';

/**
 * RunningHub 图鉴模块 · WTFTI 多宇宙星图
 * 19 张：8 主星 + 6 卫星 + 5 暗面
 *
 * 跑法（默认走官方稳定渠道）：
 *   node scripts/runninghub-image-generator.mjs --module galaxy-planets
 *
 * 输出位置：public/images/types/galaxy/{slug}.png
 */
const galaxyPlanetsModule = {
  displayName: 'WTFTI 多宇宙星图 · 主星 / 卫星 / 暗面',
  seriesLabel: 'WTFTI 人格星图',
  outputPrefix: 'galaxy',
  outputSubdir: 'galaxy',
  text2imgMode: true,
  seriesTone:
    '伪 3D 星球图鉴卡，宇宙夜空 + 星雾 + 霓虹反射，单星球主视觉居中，文案直接烘焙在卡面里，可截图分享，女性向轻娱乐审美。',
  aspectRatio: '3:4',
  types: buildAllGalaxyPrompts().map(({ slug, prompt }) => ({ slug, prompt })),
};

// 便于其他模块按角色取列表
export const GALAXY_HOME_SLUGS = HOME_PLANETS.map((p) => p.slug);
export const GALAXY_MOON_SLUGS = MOON_PLANETS.map((p) => p.slug);
export const GALAXY_SHADOW_SLUGS = SHADOW_PLANETS.map((p) => p.slug);

export default galaxyPlanetsModule;
