import { BANTI_PERSONALITIES, getBantiTypeThumbnailImage } from '@/lib/banti/personalities';
import { DAILY_STATUS_TYPES, getDailyTypeImage } from '@/lib/daily/statuses';
import { DRUNK_PERSONA_TYPES, getDrunkTypeImage } from '@/lib/drunk/personas';
import { DELTA_PERSONALITIES, getDeltaTypeThumbnailImage } from '@/lib/delta/personalities';
import { KINGS_PERSONALITIES, getKingsTypeThumbnailImage } from '@/lib/kings/personalities';
import { LOVE_PERSONALITY_TYPES, getLoveRarity, getLoveTypeImage } from '@/lib/love/personalities';
import { getRarity, getTypeImage, getXiuxianTypeImage, PERSONALITY_TYPES } from '@/lib/personalities';
import { WTFTI_PERSONALITIES, getWtftiTypeThumbnailImage } from '@/lib/wtfti-personalities';
import { getWorkRarity, getWorkTypeImage, WORK_PERSONALITY_TYPES } from '@/lib/work/personalities';
import { getXiuxianSkin } from '@/lib/xiuxian';
import { getXiuxianLaunchOnlyTypes } from '@/lib/xiuxian-v2';

export interface GalleryRarity {
  label: string;
  color: string;
  bgColor: string;
}

export interface GalleryItem {
  slug: string;
  code: string;
  name: string;
  tagline: string;
  color: string;
  emoji?: string;
  image: string;
  href: string;
  rarity?: GalleryRarity;
  isSpecial?: boolean;
}

export interface GalleryTab {
  id: string;
  label: string;
  emoji: string;
  accent: string;
  testHref: string;
  description: string;
  items: GalleryItem[];
}

export interface TypesGalleryData {
  standardSbtiTab: GalleryTab;
  xiuxianSbtiTab: GalleryTab;
  otherTabs: GalleryTab[];
  standardTotalCount: number;
  seriesCount: number;
}

const GALLERY_THUMBNAIL_EXTENSION = /\.(png|jpe?g)$/i;

function getGalleryCardImage(imagePath: string): string {
  if (!imagePath.includes('/images/types/')) {
    return imagePath;
  }

  return imagePath
    .replace('/images/types/', '/images/types/thumbs/')
    .replace(GALLERY_THUMBNAIL_EXTENSION, '.webp');
}

function buildSbtiTab(isXiuxian: boolean): GalleryTab {
  const sourceTypes = isXiuxian
    ? [...PERSONALITY_TYPES, ...getXiuxianLaunchOnlyTypes()]
    : PERSONALITY_TYPES;

  const items: GalleryItem[] = sourceTypes.map((personality) => {
    const rarity = getRarity(personality.slug);
    const xiuxianSkin = isXiuxian ? getXiuxianSkin(personality.slug) : undefined;

    return {
      slug: personality.slug,
      code: personality.code,
      name: xiuxianSkin?.displayName ?? personality.name,
      tagline: xiuxianSkin?.tagline ?? personality.tagline,
      color: xiuxianSkin?.color ?? personality.color,
      emoji: xiuxianSkin?.emoji ?? personality.emoji,
      image: getGalleryCardImage(
        isXiuxian ? getXiuxianTypeImage(personality.slug) : getTypeImage(personality.slug)
      ),
      href: isXiuxian ? `/result/${personality.slug}?skin=xiuxian` : `/result/${personality.slug}`,
      isSpecial: personality.isSpecial,
      rarity: { label: rarity.label, color: rarity.color, bgColor: rarity.bgColor },
    };
  });

  return {
    id: 'sbti',
    label: '人格图鉴',
    emoji: '🧬',
    accent: '#e8729c',
    testHref: isXiuxian ? '/test?skin=xiuxian' : '/test',
    description: isXiuxian
      ? `同一套核心模型，切成修仙世界观：${items.length} 张修仙结果卡，含首发隐藏卡。`
      : `五大模型十五维度交叉分析，${items.length} 张人设卡各有各的离谱逻辑。`,
    items,
  };
}

function buildOtherTabs(): GalleryTab[] {
  const loveItems: GalleryItem[] = LOVE_PERSONALITY_TYPES.map((personality) => {
    const rarity = getLoveRarity(personality.slug);

    return {
      slug: personality.slug,
      code: personality.code,
      name: personality.name,
      tagline: personality.tagline,
      color: personality.color,
      emoji: personality.emoji,
      image: getGalleryCardImage(getLoveTypeImage(personality.slug)),
      href: `/love/result/${personality.slug}`,
      rarity: { label: rarity.label, color: rarity.color, bgColor: rarity.bgColor },
    };
  });

  const workItems: GalleryItem[] = WORK_PERSONALITY_TYPES.map((personality) => {
    const rarity = getWorkRarity(personality.slug);

    return {
      slug: personality.slug,
      code: personality.code,
      name: personality.name,
      tagline: personality.tagline,
      color: personality.color,
      emoji: personality.emoji,
      image: getGalleryCardImage(getWorkTypeImage(personality.slug)),
      href: `/work/result/${personality.slug}`,
      rarity: { label: rarity.label, color: rarity.color, bgColor: rarity.bgColor },
    };
  });

  const dailyItems: GalleryItem[] = DAILY_STATUS_TYPES.map((status) => ({
    slug: status.slug,
    code: status.code,
    name: status.name,
    tagline: status.tagline,
    color: status.color,
    emoji: status.emoji,
    image: getGalleryCardImage(getDailyTypeImage(status.slug)),
    href: `/daily/result/${status.slug}`,
  }));

  const drunkItems: GalleryItem[] = DRUNK_PERSONA_TYPES.map((persona) => ({
    slug: persona.slug,
    code: persona.code,
    name: persona.name,
    tagline: persona.tagline,
    color: persona.color,
    emoji: persona.emoji,
    image: getGalleryCardImage(getDrunkTypeImage(persona.slug)),
    href: `/drunk/result/${persona.slug}`,
  }));

  const wtftiItems: GalleryItem[] = WTFTI_PERSONALITIES.map((personality) => ({
    slug: personality.slug,
    code: personality.number,
    name: personality.wtftiName,
    tagline: personality.tagline,
    color: personality.color,
    emoji: personality.emoji,
    image: getWtftiTypeThumbnailImage(personality.slug),
    href: `/wtfti/result/${personality.slug}/`,
  }));

  const bantiItems: GalleryItem[] = BANTI_PERSONALITIES.map((personality) => ({
    slug: personality.slug,
    code: personality.number,
    name: personality.workName,
    tagline: personality.tagline,
    color: personality.color,
    emoji: personality.emoji,
    image: getBantiTypeThumbnailImage(personality.slug),
    href: `/wtfti/work/result/${personality.slug}/`,
  }));

  const kingsItems: GalleryItem[] = KINGS_PERSONALITIES.map((personality) => ({
    slug: personality.slug,
    code: personality.number,
    name: personality.heroName,
    tagline: personality.tagline,
    color: personality.color,
    emoji: personality.emoji,
    image: getKingsTypeThumbnailImage(personality.slug),
    href: `/wtfti/kings/result/${personality.slug}/`,
  }));

  const deltaItems: GalleryItem[] = DELTA_PERSONALITIES.map((personality) => ({
    slug: personality.slug,
    code: personality.number,
    name: personality.heroName,
    tagline: personality.tagline,
    color: personality.color,
    emoji: personality.emoji,
    image: getDeltaTypeThumbnailImage(personality.slug),
    href: `/wtfti/delta/result/${personality.slug}/`,
  }));

  return [
    {
      id: 'wtfti',
      label: 'WTFTI',
      emoji: '🤯',
      accent: '#ef4444',
      testHref: '/wtfti/test/',
      description: `同一套 15 维度模型，切进另一个命名宇宙：${wtftiItems.length} 张 WTF 人格图鉴，张张都像在当面拆你。`,
      items: wtftiItems,
    },
    {
      id: 'banti',
      label: '班TI',
      emoji: '💼',
      accent: '#0ea5e9',
      testHref: '/wtfti/work/test/',
      description: `同一套 15 维度模型，翻译成办公室语境：${bantiItems.length} 张班TI 职场图鉴卡，专门描述你在工位上的样子。`,
      items: bantiItems,
    },
    {
      id: 'kings',
      label: '王者TI',
      emoji: '⚔️',
      accent: '#f59e0b',
      testHref: '/wtfti/kings/test/',
      description: `同一套 15 维度模型，翻译成王者峡谷语境：${kingsItems.length} 张峡谷人格图鉴卡，你在游戏里是哪种队友。`,
      items: kingsItems,
    },
    {
      id: 'delta',
      label: '三角TI',
      emoji: '🎯',
      accent: '#84cc16',
      testHref: '/wtfti/delta/test/',
      description: `同一套 15 维度模型，翻译成三角洲行动战区语境：${deltaItems.length} 张干员人格图鉴卡，你在战场上是哪种兵。`,
      items: deltaItems,
    },
    {
      id: 'love',
      label: '恋爱人格',
      emoji: '💕',
      accent: '#f472b6',
      testHref: '/love',
      description: '亲密关系里你不知道的一面——16 种恋爱人格画像。',
      items: loveItems,
    },
    {
      id: 'work',
      label: '职场人格',
      emoji: '💼',
      accent: '#818cf8',
      testHref: '/work',
      description: '打工人在工位上的 16 种灵魂状态，总有一款是你。',
      items: workItems,
    },
    {
      id: 'daily',
      label: '今日状态',
      emoji: '📅',
      accent: '#34d399',
      testHref: '/daily',
      description: '今天你是电量暴走还是尸体开机？12 种每日状态。',
      items: dailyItems,
    },
    {
      id: 'drunk',
      label: '酒后人设',
      emoji: '🍻',
      accent: '#f59e0b',
      testHref: '/drunk',
      description: '喝多了你是哪种人？12 种酒后人格解剖报告。',
      items: drunkItems,
    },
  ];
}

export function getTypesGalleryData(): TypesGalleryData {
  const standardSbtiTab = buildSbtiTab(false);
  const xiuxianSbtiTab = buildSbtiTab(true);
  const otherTabs = buildOtherTabs();
  const standardTotalCount = [standardSbtiTab, ...otherTabs].reduce(
    (sum, tab) => sum + tab.items.length,
    0
  );

  return {
    standardSbtiTab,
    xiuxianSbtiTab,
    otherTabs,
    standardTotalCount,
    seriesCount: otherTabs.length + 1,
  };
}