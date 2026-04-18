/**
 * Mysti Tarot v2 · 29 人格化大阿卡纳（古籍博物笔记风）
 *
 * 视觉 DNA：medieval illuminated manuscript + Codex Seraphinianus + 现代 RWS 塔罗
 *  - 米黄羊皮纸底（少量做旧斑点 + 纸纹）
 *  - 主体角色/动物（手绘线 + 上色，饱和度比平均上半档）
 *  - 周围漂浮 2-3 个象征小图，每个配手写标签
 *  - 顶部：罗马数字 + · + 中文数字（IV · 肆）
 *  - 底部：英文牌名 + · + 中文牌名（THE EMPEROR · 君座）
 *  - 边角：手写小注释、装饰花纹边框
 *
 * 输出：public/images/mysti/tarot/v2/{slug}.png
 *
 * 跑法（低价渠道）：
 *   RUNNINGHUB_TEXT2IMG_ENDPOINT=/rhart-image-n-g31-flash/text-to-image \
 *     node scripts/generate-type-images.mjs mysti-tarot
 */

const STYLE_BASE =
  'medieval illuminated manuscript style tarot card illustration, ' +
  'aged parchment cream background with subtle paper grain, ink spots and faint stains, ' +
  'fine ink line drawing combined with painted color fills, ' +
  'rich saturated palette with vintage botanical encyclopedia warmth, ' +
  'hand-drawn ornamental border frame with floral corner motifs, ' +
  'in the style of Codex Seraphinianus meets Mystic Mondays Tarot, ' +
  'museum-quality 2:3 vertical card composition';

const TEXT_INSTRUCTION = (romanNum, chineseNum, enName, zhName) =>
  `top center inside an oval cartouche: bilingual numeral "${romanNum} · ${chineseNum}" rendered crisp in elegant serif. ` +
  `bottom center inside a rectangular nameplate: bilingual title "${enName} · ${zhName}" rendered crisp in clean serif. ` +
  `additional tiny handwritten labels in fine cursive next to each symbolic item. ` +
  `small illegible scribble notes in side margins for atmosphere. ` +
  `make ALL text sharp and readable, no garbled characters`;

function buildPrompt({ romanNum, chineseNum, enName, zhName, subject, symbols, accent }) {
  const symbolList = symbols
    .map((s) => `a small ${s.icon} labeled "${s.label}"`)
    .join(', ');
  return [
    STYLE_BASE + '.',
    `central subject: ${subject}.`,
    `surrounding the subject, floating: ${symbolList}.`,
    `accent color: ${accent}.`,
    TEXT_INSTRUCTION(romanNum, chineseNum, enName, zhName) + '.',
    'no other large text, no watermark, no logo.',
  ].join(' ');
}

const ARCANA = {
  Emperor:        { rn: 'IV',    cn: '肆' },
  Empress:        { rn: 'III',   cn: '叁' },
  Lovers:         { rn: 'VI',    cn: '陆' },
  Hermit:         { rn: 'IX',    cn: '玖' },
  Fool:           { rn: '0',     cn: '零' },
  Magician:       { rn: 'I',     cn: '壹' },
  Chariot:        { rn: 'VII',   cn: '柒' },
  Justice:        { rn: 'XI',    cn: '拾壹' },
  Judgement:      { rn: 'XX',    cn: '廿' },
  Devil:          { rn: 'XV',    cn: '拾伍' },
  Strength:       { rn: 'VIII',  cn: '捌' },
  Temperance:     { rn: 'XIV',   cn: '拾肆' },
  Star:           { rn: 'XVII',  cn: '拾柒' },
  WheelOfFortune: { rn: 'X',     cn: '拾' },
  Sun:            { rn: 'XIX',   cn: '拾玖' },
  HighPriestess:  { rn: 'II',    cn: '贰' },
  HangedMan:      { rn: 'XII',   cn: '拾贰' },
};

const TAROT_DATA = [
  // Group I · 控制组 → The Emperor
  { slug: 'boss', arcana: 'Emperor', zhName: '君座',
    subject: 'a regal majestic lion wearing a crown sitting on a stone throne with ram-head armrests, gazing forward with absolute authority',
    symbols: [{ icon: 'golden scepter', label: 'SCEPTER' }, { icon: 'mountain peak', label: 'MOUNTAINS' }, { icon: 'radiant sun', label: 'SUN' }],
    accent: 'warm rose-clay #C07A8E and gold #C9A676' },
  { slug: 'ctrl', arcana: 'Emperor', zhName: '律者',
    subject: 'a stern mountain goat with curved horns standing inside a square geometric frame of brick walls, facing forward, embodying boundaries',
    symbols: [{ icon: 'iron key', label: 'KEY' }, { icon: 'measuring compass', label: 'COMPASS' }, { icon: 'square brick', label: 'BRICK' }],
    accent: 'slate gray and burnt sienna' },
  { slug: 'oh-no', arcana: 'Emperor', zhName: '紧弦',
    subject: 'a tightly drawn longbow with a single arrow nocked, the string visibly trembling, suspended in air with subtle motion lines',
    symbols: [{ icon: 'hourglass', label: 'TIME' }, { icon: 'broken chain link', label: 'BREAK' }, { icon: 'taut rope', label: 'TENSION' }],
    accent: 'tense crimson and parchment beige' },
  { slug: 'thin-k', arcana: 'Emperor', zhName: '思者',
    subject: 'an owl perched atop an open ancient book, feathers catching candlelight, eyes glowing with cold logic',
    symbols: [{ icon: 'quill pen', label: 'QUILL' }, { icon: 'glowing brain diagram', label: 'MIND' }, { icon: 'spectacles', label: 'LENS' }],
    accent: 'midnight blue and aged gold' },

  // Group II · 情感组 → Empress / Lovers
  { slug: 'mum', arcana: 'Empress', zhName: '丰盈',
    subject: 'a serene woman crowned with stars cradling a basket of ripe fruits, surrounded by lush wheat field and blooming roses',
    symbols: [{ icon: 'pomegranate', label: 'FRUIT' }, { icon: 'wheat sheaf', label: 'WHEAT' }, { icon: 'dove', label: 'DOVE' }],
    accent: 'deep rose pink and forest green' },
  { slug: 'simp', arcana: 'Empress', zhName: '溺者',
    subject: 'a soft white moth flying toward a single candle flame, wings already singed, beautiful and tragic',
    symbols: [{ icon: 'candle flame', label: 'FLAME' }, { icon: 'broken heart', label: 'HEART' }, { icon: 'silken thread', label: 'BIND' }],
    accent: 'pale rose and warm candlelight amber' },
  { slug: 'atm-er', arcana: 'Empress', zhName: '金匙',
    subject: 'an ornate brass key shaped like a peacock feather, lying on a velvet cushion next to scattered gold coins',
    symbols: [{ icon: 'gold coin', label: 'COIN' }, { icon: 'gift box', label: 'GIFT' }, { icon: 'measuring scale', label: 'EXCHANGE' }],
    accent: 'rich gold and emerald green' },
  { slug: 'than-k', arcana: 'Empress', zhName: '回响',
    subject: 'two cupped hands gently passing a tiny glowing seed to one another, set against a soft halo of morning light',
    symbols: [{ icon: 'envelope', label: 'LETTER' }, { icon: 'sprouting seed', label: 'SEED' }, { icon: 'small bell', label: 'BELL' }],
    accent: 'warm peach and sage green' },
  { slug: 'love-r', arcana: 'Lovers', zhName: '双生',
    subject: 'two intertwined swans forming a perfect heart shape on still water, a small angel hovering above blessing them',
    symbols: [{ icon: 'crescent moon', label: 'MOON' }, { icon: 'radiant sun', label: 'SUN' }, { icon: 'red apple', label: 'APPLE' }],
    accent: 'dusty rose pink and sage green' },

  // Group III · 独处组 → Hermit
  { slug: 'solo', arcana: 'Hermit', zhName: '独行',
    subject: 'a hooded figure walking alone on a snowy mountain path holding a glowing six-pointed-star lantern, only their silhouette visible',
    symbols: [{ icon: 'glowing lantern', label: 'LANTERN' }, { icon: 'walking staff', label: 'STAFF' }, { icon: 'snowflake', label: 'SNOW' }],
    accent: 'deep midnight blue and warm lantern gold' },
  { slug: 'nerd', arcana: 'Hermit', zhName: '钻者',
    subject: 'a fox sitting in a cluttered scholar studio surrounded by towering stacks of books, magnifying glass in paw, lost in study',
    symbols: [{ icon: 'open scroll', label: 'SCROLL' }, { icon: 'magnifying glass', label: 'LENS' }, { icon: 'inkwell', label: 'INK' }],
    accent: 'warm sepia and forest green' },
  { slug: 'shy', arcana: 'Hermit', zhName: '隐影',
    subject: 'a deer with delicate antlers half-hidden behind a curtain of long grass, only its watchful eyes visible peering out',
    symbols: [{ icon: 'fern leaf', label: 'FERN' }, { icon: 'small mirror', label: 'MIRROR' }, { icon: 'eye', label: 'GAZE' }],
    accent: 'muted moss green and soft dove gray' },

  // Group IV · 表达组 → Fool / Magician / Chariot
  { slug: 'drama', arcana: 'Fool', zhName: '风暴',
    subject: 'a peacock with fully spread tail standing on a tiny stage under a spotlight, theatrical mask half covering its face',
    symbols: [{ icon: 'comedy-tragedy mask', label: 'MASK' }, { icon: 'red rose', label: 'ROSE' }, { icon: 'lightning bolt', label: 'STORM' }],
    accent: 'iridescent peacock teal and gold' },
  { slug: 'party', arcana: 'Fool', zhName: '狂欢',
    subject: 'a young fool figure with a tiny dog dancing on the edge of a cliff, confetti flying around, sun rising behind',
    symbols: [{ icon: 'champagne glass', label: 'GLASS' }, { icon: 'tiny dog', label: 'COMPANION' }, { icon: 'butterfly', label: 'JOY' }],
    accent: 'sunshine yellow and coral pink' },
  { slug: 'talk-er', arcana: 'Magician', zhName: '言术',
    subject: 'a magician figure standing at a wooden table with arms raised, words and runes spiraling out of their mouth as glowing ribbons',
    symbols: [{ icon: 'feather quill', label: 'QUILL' }, { icon: 'bell', label: 'BELL' }, { icon: 'scroll', label: 'WORD' }],
    accent: 'royal purple and bright gold' },
  { slug: 'joker', arcana: 'Fool', zhName: '解构',
    subject: 'a court jester holding two masks one laughing one crying, juggling them with skill, multicolored harlequin outfit',
    symbols: [{ icon: 'jester bells', label: 'BELLS' }, { icon: 'playing card', label: 'CARD' }, { icon: 'mirror shard', label: 'MIRROR' }],
    accent: 'harlequin red and yellow' },
  { slug: 'drunk', arcana: 'Chariot', zhName: '冲撞',
    subject: 'a runaway chariot pulled by two wild horses one black one white galloping in opposite directions, driver figure barely holding on',
    symbols: [{ icon: 'wine cup', label: 'CUP' }, { icon: 'spinning wheel', label: 'WHEEL' }, { icon: 'broken reins', label: 'REINS' }],
    accent: 'wine red and storm gray' },

  // Group V · 反叛组 → Justice / Judgement
  { slug: 'rebel', arcana: 'Justice', zhName: '叛者',
    subject: 'a blindfolded figure holding a sword and balanced scales, but the scales are visibly tilted because she has cut one side off',
    symbols: [{ icon: 'broken scales', label: 'SCALES' }, { icon: 'raised sword', label: 'SWORD' }, { icon: 'red flag', label: 'FLAG' }],
    accent: 'cold steel and crimson red' },
  { slug: 'woc', arcana: 'Judgement', zhName: '号角',
    subject: 'an angel figure blowing a great trumpet from above the clouds, sound waves visualized as breaking glass and tongues of fire',
    symbols: [{ icon: 'trumpet', label: 'HORN' }, { icon: 'flame', label: 'FIRE' }, { icon: 'shattering glass', label: 'BREAK' }],
    accent: 'fire orange and storm purple' },

  // Group VI · 沉溺组 → Devil / Strength / Temperance / Star
  { slug: 'game-r', arcana: 'Devil', zhName: '虚境',
    subject: 'a horned devil figure crowned with pixel cubes sitting on a throne of glowing screens, two small figures chained at its feet',
    symbols: [{ icon: 'arcade joystick', label: 'CONTROL' }, { icon: 'glowing screen', label: 'SCREEN' }, { icon: 'broken chain', label: 'CHAIN' }],
    accent: 'neon magenta and electric cyan' },
  { slug: 'food-ie', arcana: 'Strength', zhName: '驯欲',
    subject: 'a serene woman gently holding open the jaws of a great lion, a fruit bowl beside her, lion appearing tame and happy',
    symbols: [{ icon: 'apple', label: 'FRUIT' }, { icon: 'infinity symbol', label: 'INFINITY' }, { icon: 'wine grape', label: 'GRAPE' }],
    accent: 'warm amber and forest green' },
  { slug: 'sexy', arcana: 'Devil', zhName: '蛇媚',
    subject: 'an elegant serpent coiled around a hand mirror, its body forming the shape of a sensual silhouette, scales catching light',
    symbols: [{ icon: 'red lips', label: 'LIPS' }, { icon: 'silver chain', label: 'CHAIN' }, { icon: 'hand mirror', label: 'MIRROR' }],
    accent: 'deep ruby red and obsidian black' },
  { slug: 'malo', arcana: 'Temperance', zhName: '无为',
    subject: 'a sloth lying peacefully in a hammock between two trees, one foot dangling, surrounded by gently falling leaves',
    symbols: [{ icon: 'tea cup', label: 'TEA' }, { icon: 'feather', label: 'FEATHER' }, { icon: 'cloud', label: 'CLOUD' }],
    accent: 'soft sage green and warm cream' },
  { slug: 'fake', arcana: 'Devil', zhName: '面具',
    subject: 'a figure in elegant clothing holding up multiple masks of different expressions in a fan shape, true face hidden behind them',
    symbols: [{ icon: 'theater mask', label: 'MASK' }, { icon: 'cracked mirror', label: 'MIRROR' }, { icon: 'masquerade ribbon', label: 'RIBBON' }],
    accent: 'deep eggplant purple and antique gold' },
  { slug: 'sleep', arcana: 'Star', zhName: '安眠',
    subject: 'a maiden lying asleep beside a still pond under a sky full of seven stars, dream butterflies floating from her hair',
    symbols: [{ icon: 'crescent moon', label: 'MOON' }, { icon: 'dream butterfly', label: 'DREAM' }, { icon: 'star', label: 'STAR' }],
    accent: 'midnight blue and silvery starlight' },

  // Group VII · 幸运组 → Wheel / Sun / High Priestess / Hanged Man
  { slug: 'chill', arcana: 'WheelOfFortune', zhName: '顺流',
    subject: 'a great wheel of fortune turning slowly, river water flowing through it, lotus flowers carried by the current, a relaxed cat resting nearby',
    symbols: [{ icon: 'lotus flower', label: 'LOTUS' }, { icon: 'flowing water', label: 'FLOW' }, { icon: 'lazy cat', label: 'CAT' }],
    accent: 'warm peach and soft turquoise' },
  { slug: 'luck-y', arcana: 'Sun', zhName: '日耀',
    subject: 'a child riding a white horse under a giant radiant sun, sunflowers blooming at the horse hooves, joyful expression',
    symbols: [{ icon: 'sunflower', label: 'SUNFLOWER' }, { icon: 'red banner', label: 'BANNER' }, { icon: 'gold coin', label: 'FORTUNE' }],
    accent: 'brilliant golden yellow and sky blue' },
  { slug: 'emo', arcana: 'HighPriestess', zhName: '潮汐',
    subject: 'a veiled priestess seated between two pillars one black one white, holding an open scroll, full moon at her crown, water flowing at her feet',
    symbols: [{ icon: 'crescent moon', label: 'MOON' }, { icon: 'pomegranate', label: 'POMEGRANATE' }, { icon: 'water wave', label: 'TIDE' }],
    accent: 'deep ocean blue and silver' },
  { slug: 'dior-s', arcana: 'HangedMan', zhName: '倒看',
    subject: 'a serene figure suspended upside down by one foot from a tree branch, halo around head, expression peaceful and accepting',
    symbols: [{ icon: 'hourglass', label: 'PAUSE' }, { icon: 'tree leaf', label: 'LEAF' }, { icon: 'halo ring', label: 'HALO' }],
    accent: 'deep teal and warm gold' },
];

const types = TAROT_DATA.map((card) => {
  const { rn, cn } = ARCANA[card.arcana];
  const arcanaName = card.arcana === 'WheelOfFortune'
    ? 'Wheel of Fortune'
    : card.arcana === 'HighPriestess'
      ? 'The High Priestess'
      : card.arcana === 'HangedMan'
        ? 'The Hanged Man'
        : `The ${card.arcana}`;
  return {
    slug: card.slug,
    prompt: buildPrompt({
      romanNum: rn,
      chineseNum: cn,
      enName: arcanaName.toUpperCase(),
      zhName: card.zhName,
      subject: card.subject,
      symbols: card.symbols,
      accent: card.accent,
    }),
  };
});

export default {
  displayName: 'Mysti Tarot v2 · 29 古籍博物笔记塔罗',
  seriesLabel: 'Mysti 灵鉴',
  outputPrefix: 'mysti-tarot-v2',
  seriesTone: '中世纪手抄本 + Codex Seraphinianus + 现代塔罗，米黄羊皮纸 + 主体 + 象征物 + 中英双标',
  text2imgMode: true,
  aspectRatio: '2:3',
  typesDir: '../public/images/mysti',
  outputSubdir: 'tarot/v2',
  types,
};
