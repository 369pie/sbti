import { buildCptiRelationshipAnimePrompt, CPTI_RELATIONSHIP_CARD_TYPES } from '../../cpti-relationship-prompts.mjs';

const cptiRelationshipImageModule = {
  displayName: 'CPTI 关系图鉴 · 日系乙女治愈漫',
  seriesLabel: 'CPTI 关系图鉴',
  outputPrefix: 'cpti-rel',
  outputSubdir: 'cpti/relationships',
  artStyle: 'shoujo-romance-card',
  cardMode: true,
  text2imgMode: true,
  themeColor: '#a855f7',
  seriesTone: '2.5次元生活化乙女漫关系图鉴，强调情绪共鸣与关系张力。整体像可截图分享的关系收藏卡，轻柔、克制、暧昧、治愈。',
  aspectRatio: '3:4',
  types: CPTI_RELATIONSHIP_CARD_TYPES.map((type) => ({
    slug: type.slug,
    concept: buildCptiRelationshipAnimePrompt({
      relationshipName: type.name,
      relationshipTagline: type.tagline,
      color: type.color,
      visualConcept: type.visualConcept,
    }),
    card: {
      name: type.name,
      code: type.code,
      tagline: type.tagline,
      tags: type.tags,
      quote: type.quote,
    },
  })),
};

export default cptiRelationshipImageModule;
