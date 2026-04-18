/**
 * SoulTI · 32 自然原型 medium 图鉴（古籍博物笔记风）
 *
 * 视觉 DNA：与 mysti-tarot v2 同源（manuscript 古籍），但形态是「自然标本图鉴」：
 *  - 米黄羊皮纸底 + 纸纹 + 少量做旧斑点
 *  - 主体：自然意象本体（涌泉/冰川/萤火…），手绘 + 上色，饱和度上半档
 *  - 周围漂浮 2-3 个象征小物，每个配手写英文标签
 *  - 顶部：编号牌（#01/#02 …）+ 中英文双标（SPRING · 涌泉）
 *  - 底部：tagline 短句卡（中文 tagline）
 *  - 边角：手写小注释、装饰花纹边框
 *  - 不带塔罗罗马数字（自然图鉴 ≠ 塔罗）
 *
 * 输出: public/images/types/soulti/medium/{slug}.png
 *
 * 跑法（低价渠道）:
 *   RUNNINGHUB_TEXT2IMG_ENDPOINT=/rhart-image-n-g31-flash/text-to-image \
 *     node scripts/generate-type-images.mjs soulti-medium
 */

const STYLE_BASE =
  'medieval botanical encyclopedia plate, illuminated manuscript style natural specimen illustration, ' +
  'aged parchment cream background with subtle paper grain, ink spots and faint stains, ' +
  'fine ink line drawing combined with painted color washes, ' +
  'rich saturated palette with vintage botanical encyclopedia warmth, ' +
  'hand-drawn ornamental border frame with delicate corner motifs, ' +
  'in the style of Codex Seraphinianus meets Audubon nature plates, ' +
  'museum-quality square 1:1 composition';

const TEXT_INSTRUCTION = (number, enName, zhName, tagline) =>
  `top center inside an oval cartouche: catalog number "${number}" rendered crisp in elegant serif. ` +
  `directly below the cartouche: bilingual title "${enName} · ${zhName}" rendered crisp in clean serif. ` +
  `bottom center inside a small ribbon banner: Chinese tagline "${tagline}" rendered crisp. ` +
  `additional tiny handwritten labels in fine cursive next to each symbolic item. ` +
  `small illegible scribble notes in side margins for atmosphere. ` +
  `make ALL text sharp and readable, no garbled characters`;

function buildPrompt({ number, enName, zhName, tagline, subject, symbols, accent }) {
  const symbolList = symbols
    .map((s) => `a small ${s.icon} labeled "${s.label}"`)
    .join(', ');
  return [
    STYLE_BASE + '.',
    `central subject: ${subject}.`,
    `surrounding the subject, floating: ${symbolList}.`,
    `accent color: ${accent}.`,
    TEXT_INSTRUCTION(number, enName, zhName, tagline) + '.',
    'no other large text, no watermark, no logo.',
  ].join(' ');
}

// ─────────────────── 32 自然原型 ───────────────────
const SOULTI_DATA = [
  { slug: 'spring', n: '#01', en: 'SPRING', zh: '涌泉', tag: '涌向世界，也涌出新的自己',
    subject: 'a clear spring of water bubbling up from a moss-covered stone basin, fresh droplets catching light, gentle ripples spreading outward',
    symbols: [{ icon: 'water droplet', label: 'DROP' }, { icon: 'fern frond', label: 'FERN' }, { icon: 'small fish', label: 'KOI' }],
    accent: 'fresh emerald green and silvery turquoise' },
  { slug: 'glacier', n: '#02', en: 'GLACIER', zh: '冰川', tag: '涌向世界，然后凝固成山',
    subject: 'a massive cracked blue glacier rising from dark sea, internal cyan light glowing from deep crevasses, floating ice fragments below',
    symbols: [{ icon: 'snowflake', label: 'SNOW' }, { icon: 'fossilized shell', label: 'AGE' }, { icon: 'compass', label: 'NORTH' }],
    accent: 'arctic ice blue and pale silver' },
  { slug: 'firefly', n: '#03', en: 'FIREFLY', zh: '萤火', tag: '明灭之间，长出了新的光',
    subject: 'a single firefly suspended in midair on a deep blue summer night, bioluminescent abdomen glowing warm gold, delicate translucent wings',
    symbols: [{ icon: 'candle flame', label: 'FLAME' }, { icon: 'lotus leaf', label: 'LEAF' }, { icon: 'tiny lantern', label: 'LIGHT' }],
    accent: 'warm gold and deep night indigo' },
  { slug: 'amber', n: '#04', en: 'AMBER', zh: '琥珀', tag: '明灭之间，凝固了最好的瞬间',
    subject: 'a translucent honey-amber teardrop containing a perfectly preserved ancient insect with detailed wings, light shining through from behind',
    symbols: [{ icon: 'pine resin drip', label: 'RESIN' }, { icon: 'fossil leaf', label: 'FOSSIL' }, { icon: 'hourglass', label: 'TIME' }],
    accent: 'rich honey gold and warm caramel' },
  { slug: 'sprout', n: '#05', en: 'SPROUT', zh: '新芽', tag: '温柔地切开，然后长出来',
    subject: 'a tender green sprout pushing through a crack in dark soil, two delicate cotyledons unfurling, single dewdrop on the leaf tip',
    symbols: [{ icon: 'seed', label: 'SEED' }, { icon: 'cracked shell', label: 'BREAK' }, { icon: 'sun ray', label: 'LIGHT' }],
    accent: 'tender spring green and warm earth brown' },
  { slug: 'obsidian', n: '#06', en: 'OBSIDIAN', zh: '黑曜石', tag: '温柔地切开，然后变得更锋利',
    subject: 'a polished obsidian arrowhead with razor-sharp edges, mirror-black surface reflecting starlight, resting on dark velvet',
    symbols: [{ icon: 'volcano cone', label: 'VOLCANO' }, { icon: 'arrowhead', label: 'BLADE' }, { icon: 'black mirror', label: 'MIRROR' }],
    accent: 'deep obsidian black and metallic silver gleam' },
  { slug: 'rainbow', n: '#07', en: 'RAINBOW', zh: '虹', tag: '折射了所有光，然后长出自己的颜色',
    subject: 'a vivid rainbow arc rising from misty hills, each color band richly saturated, gentle rain drizzling on one side with sun on the other',
    symbols: [{ icon: 'water prism', label: 'PRISM' }, { icon: 'cloud', label: 'CLOUD' }, { icon: 'rain droplet', label: 'RAIN' }],
    accent: 'full spectrum chromatic with cream parchment' },
  { slug: 'geode', n: '#08', en: 'GEODE', zh: '晶洞', tag: '折射了所有光，然后在暗处结晶',
    subject: 'a cracked-open geode revealing a cavern of brilliant amethyst purple crystals inside dull rocky exterior, internal glow visible',
    symbols: [{ icon: 'pickaxe', label: 'PICKAXE' }, { icon: 'crystal cluster', label: 'CRYSTAL' }, { icon: 'eye', label: 'INNER' }],
    accent: 'deep amethyst purple and warm rock ochre' },
  { slug: 'dandelion', n: '#09', en: 'DANDELION', zh: '蒲公英', tag: '你的飞翔会在某处生根',
    subject: 'a dandelion clock mid-puff, dozens of tiny seed parachutes drifting away on a soft breeze, single bare stem remaining',
    symbols: [{ icon: 'wind swirl', label: 'WIND' }, { icon: 'seed parachute', label: 'SEED' }, { icon: 'compass rose', label: 'DRIFT' }],
    accent: 'warm cream white and golden meadow' },
  { slug: 'fossil', n: '#10', en: 'FOSSIL', zh: '化石', tag: '你的飞翔凝固成永恒的印记',
    subject: 'a perfectly preserved ammonite spiral fossil embedded in a slab of cream sandstone, fine geometric ridges catching shadow',
    symbols: [{ icon: 'magnifying glass', label: 'STUDY' }, { icon: 'feather imprint', label: 'IMPRINT' }, { icon: 'hourglass', label: 'AGE' }],
    accent: 'warm sandstone beige and deep umber' },
  { slug: 'dew', n: '#11', en: 'DEW', zh: '露', tag: '你在，但你选择化开',
    subject: 'a single perfect spherical dewdrop balanced on the edge of a curved green leaf, refracting the entire morning landscape inside it',
    symbols: [{ icon: 'morning sun', label: 'DAWN' }, { icon: 'spider web strand', label: 'WEB' }, { icon: 'small petal', label: 'PETAL' }],
    accent: 'pale dawn pink and crystal clear' },
  { slug: 'frost', n: '#12', en: 'FROST', zh: '霜', tag: '你在，但你选择凝住',
    subject: 'intricate fractal frost crystals spreading across a window pane, geometric ice patterns radiating from a central point',
    symbols: [{ icon: 'snowflake', label: 'CRYSTAL' }, { icon: 'pine needle', label: 'PINE' }, { icon: 'still moon', label: 'MOON' }],
    accent: 'icy white and pale steel blue' },
  { slug: 'coral', n: '#13', en: 'CORAL', zh: '珊瑚', tag: '你只为自己抛锚，然后长成礁石',
    subject: 'a vibrant coral reef cluster in jewel-tone pink and orange, growing on an underwater rock with small fish darting around',
    symbols: [{ icon: 'sea anchor', label: 'ANCHOR' }, { icon: 'starfish', label: 'STAR' }, { icon: 'pearl shell', label: 'SHELL' }],
    accent: 'coral pink and deep sea teal' },
  { slug: 'stalactite', n: '#14', en: 'STALACTITE', zh: '钟乳石', tag: '你只为自己抛锚，然后凝成洞穴',
    subject: 'long pointed stalactites hanging from a dark cavern ceiling, mineral water droplets forming at their tips, soft inner glow',
    symbols: [{ icon: 'water droplet', label: 'DROP' }, { icon: 'cave bat', label: 'BAT' }, { icon: 'glowing crystal', label: 'GLOW' }],
    accent: 'mineral cream and deep cavern bronze' },
  { slug: 'mountainspring', n: '#15', en: 'MOUNTAIN SPRING', zh: '山泉', tag: '空旷的山谷里，你长出了水声',
    subject: 'a clear mountain spring cascading down mossy rocks in an empty pine valley, gentle white foam, single deer drinking from below',
    symbols: [{ icon: 'pine tree', label: 'PINE' }, { icon: 'stone', label: 'ROCK' }, { icon: 'crane bird', label: 'CRANE' }],
    accent: 'fresh moss green and clear stream silver' },
  { slug: 'vein', n: '#16', en: 'VEIN', zh: '矿脉', tag: '空旷的山谷里，你凝固成了地层',
    subject: 'a cross-section view of underground rock strata revealing veins of glittering gold ore running through dark stone',
    symbols: [{ icon: 'gold nugget', label: 'GOLD' }, { icon: 'pickaxe', label: 'MINE' }, { icon: 'pendulum', label: 'DOWSE' }],
    accent: 'metallic gold and deep stone gray' },
  { slug: 'mycelium', n: '#17', en: 'MYCELIUM', zh: '菌丝', tag: '你在看不见的地方连接一切',
    subject: 'a network of glowing white mycelium threads spreading through dark forest soil beneath a single mushroom cap visible above',
    symbols: [{ icon: 'mushroom cap', label: 'FRUIT' }, { icon: 'tree root', label: 'ROOT' }, { icon: 'web node', label: 'NETWORK' }],
    accent: 'glowing pearl white and deep forest brown' },
  { slug: 'rings', n: '#18', en: 'RINGS', zh: '树轮', tag: '你在看不见的地方记录一切',
    subject: 'a clean cross-section of an ancient tree trunk revealing concentric growth rings, each ring meticulously rendered with subtle color variation',
    symbols: [{ icon: 'measuring caliper', label: 'MEASURE' }, { icon: 'pencil', label: 'RECORD' }, { icon: 'oak leaf', label: 'LEAF' }],
    accent: 'warm wood brown and aged amber' },
  { slug: 'bamboo', n: '#19', en: 'BAMBOO SHOOT', zh: '竹笋', tag: '还没发芽，但已经准备好爆发',
    subject: 'a young bamboo shoot pushing up powerfully through dark earth, segmented form already strong, surrounded by mature bamboo grove silhouettes',
    symbols: [{ icon: 'bamboo node', label: 'NODE' }, { icon: 'panda paw print', label: 'TRACK' }, { icon: 'ink brush', label: 'BRUSH' }],
    accent: 'bright bamboo green and warm earth' },
  { slug: 'pearl', n: '#20', en: 'PEARL', zh: '珍珠', tag: '还没发芽，但已经在暗处凝成宝石',
    subject: 'a single luminous pearl resting inside an open oyster shell, soft iridescent glow on its surface, deep blue water around',
    symbols: [{ icon: 'oyster shell', label: 'SHELL' }, { icon: 'sea wave', label: 'WAVE' }, { icon: 'small fish', label: 'FISH' }],
    accent: 'iridescent pearl white and deep ocean blue' },
  { slug: 'lake', n: '#21', en: 'LAKE', zh: '湖面', tag: '你是别人认识自己的方式，也是自己的',
    subject: 'a perfectly still mountain lake reflecting the sky and surrounding mountains like a flawless mirror, single white crane standing at the shore',
    symbols: [{ icon: 'lotus flower', label: 'LOTUS' }, { icon: 'small boat', label: 'BOAT' }, { icon: 'mirror', label: 'MIRROR' }],
    accent: 'still mirror silver and soft mountain blue' },
  { slug: 'basalt', n: '#22', en: 'BASALT', zh: '玄武岩', tag: '你是别人认识自己的方式，坚硬如石',
    subject: 'hexagonal columnar basalt formations rising from a coastline, dark volcanic rock pillars in geometric perfection, sea waves crashing at base',
    symbols: [{ icon: 'volcano', label: 'VOLCANO' }, { icon: 'sea wave', label: 'WAVE' }, { icon: 'compass', label: 'NORTH' }],
    accent: 'deep volcanic black and ocean steel blue' },
  { slug: 'butterfly', n: '#23', en: 'BUTTERFLY', zh: '蝶', tag: '破茧的方式是长出翅膀',
    subject: 'a luminescent butterfly emerging from a translucent chrysalis, wings half unfurled showing intricate patterns, soft morning light',
    symbols: [{ icon: 'chrysalis', label: 'COCOON' }, { icon: 'flower', label: 'NECTAR' }, { icon: 'wind swirl', label: 'WIND' }],
    accent: 'iridescent peach and pale lavender' },
  { slug: 'shale', n: '#24', en: 'SHALE', zh: '千层岩', tag: '破不破，都已经是一部书了',
    subject: 'horizontal layered shale rock cliff, each thin sediment band a different earthy color, like pages of an ancient book',
    symbols: [{ icon: 'open book', label: 'BOOK' }, { icon: 'feather imprint', label: 'PAGE' }, { icon: 'pen nib', label: 'NIB' }],
    accent: 'layered earth tones from sienna to slate' },
  { slug: 'soil', n: '#25', en: 'SOIL', zh: '泥土', tag: '溶解在每段关系里，然后长出花',
    subject: 'a cross-section view of fertile dark soil with various roots intertwining, a vibrant flower blooming from the surface above',
    symbols: [{ icon: 'earthworm', label: 'WORM' }, { icon: 'flower bud', label: 'BLOOM' }, { icon: 'tree root', label: 'ROOT' }],
    accent: 'rich loam brown and bright bloom pink' },
  { slug: 'rocksalt', n: '#26', en: 'ROCK SALT', zh: '岩盐', tag: '溶解在每段关系里，最终凝成晶体',
    subject: 'a cluster of perfectly cubic transparent rock salt crystals stacked together, soft pink himalayan tones, salt mine background',
    symbols: [{ icon: 'salt grain', label: 'GRAIN' }, { icon: 'water droplet', label: 'BRINE' }, { icon: 'crystal cube', label: 'CUBE' }],
    accent: 'himalayan pink and warm salt cream' },
  { slug: 'petal', n: '#27', en: 'PETAL', zh: '落花', tag: '开不开你说了算，落下去也能生根',
    subject: 'a single fallen pink peony petal floating on the surface of clear water, ripples spreading from where it landed',
    symbols: [{ icon: 'water ripple', label: 'RIPPLE' }, { icon: 'flower stem', label: 'STEM' }, { icon: 'butterfly', label: 'BUTTERFLY' }],
    accent: 'soft peony pink and clear water silver' },
  { slug: 'driedflower', n: '#28', en: 'DRIED FLOWER', zh: '干花', tag: '开不开你说了算，凋谢了也依然美丽',
    subject: 'a beautifully preserved bouquet of dried lavender and wheat tied with a satin ribbon, hung upside down against parchment',
    symbols: [{ icon: 'satin ribbon', label: 'RIBBON' }, { icon: 'pressed leaf', label: 'PRESS' }, { icon: 'bottle', label: 'JAR' }],
    accent: 'dusty mauve and warm wheat gold' },
  { slug: 'hotspring', n: '#29', en: 'HOTSPRING', zh: '地热', tag: '水面平静，地底涌出热泉',
    subject: 'a tranquil natural hot spring with rising steam vapor, surrounded by snowy rocks, a single Japanese macaque relaxing in the water',
    symbols: [{ icon: 'steam swirl', label: 'STEAM' }, { icon: 'volcano', label: 'GEO' }, { icon: 'snowflake', label: 'SNOW' }],
    accent: 'warm steam white and deep volcanic teal' },
  { slug: 'darkriver', n: '#30', en: 'DARK RIVER', zh: '暗河', tag: '水面平静，水下凝成了永不枯竭的暗河',
    subject: 'a hidden underground river flowing through a deep dark cavern, only single shaft of light hitting the water surface from above',
    symbols: [{ icon: 'cave entrance', label: 'CAVE' }, { icon: 'compass', label: 'COMPASS' }, { icon: 'small fish', label: 'FISH' }],
    accent: 'deep cavern black and luminous teal water' },
  { slug: 'aurora', n: '#31', en: 'AURORA', zh: '极光', tag: '你的距离感长出了最温柔的光',
    subject: 'shimmering green and purple aurora borealis dancing across a starry arctic sky above a still frozen lake, mountains silhouetted below',
    symbols: [{ icon: 'star', label: 'STAR' }, { icon: 'pine silhouette', label: 'PINE' }, { icon: 'compass north', label: 'NORTH' }],
    accent: 'aurora green and twilight purple' },
  { slug: 'starcore', n: '#32', en: 'STAR CORE', zh: '星核', tag: '你的距离感凝固成了最坚硬的核心',
    subject: 'a brilliant white-hot star core cross-section diagram, concentric layers of fusion glowing through, set against deep cosmic black',
    symbols: [{ icon: 'small planet', label: 'ORBIT' }, { icon: 'ring of fire', label: 'CORONA' }, { icon: 'iron atom', label: 'IRON' }],
    accent: 'incandescent white-gold and cosmic indigo' },
];

const types = SOULTI_DATA.map((item) => ({
  slug: item.slug,
  prompt: buildPrompt({
    number: item.n,
    enName: item.en,
    zhName: item.zh,
    tagline: item.tag,
    subject: item.subject,
    symbols: item.symbols,
    accent: item.accent,
  }),
}));

export default {
  displayName: 'SoulTI · 32 古籍博物笔记图鉴',
  seriesLabel: 'SoulTI 灵魂图鉴',
  outputPrefix: 'soulti-medium',
  seriesTone: '中世纪手抄本 + 博物自然标本，米黄羊皮纸 + 自然主体 + 象征物 + 中英双标 + tagline 卡',
  text2imgMode: true,
  aspectRatio: '1:1',
  outputSubdir: 'soulti/medium',
  types,
};
