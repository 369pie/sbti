// WTFTI 人格神域 · 小红书策展封面 50 张批量 prompt
//
// 用途：
//   - 批量投喂 RunningHub / Midjourney / Nano Banana 管线
//   - 面向小红书女性用户的高 fono 首图（3:4 竖构图 · 封面钩子 + 主星视觉 + 情绪短句）
//
// 设计锚：
//   - 8 主神 × 4~7 情绪钩子 ≈ 50 张（8=40 保底 + 10 张节日/季节节点）
//   - 标题区：UPPERCASE eyebrow 0.4em · 拉丁古典 italic 大标题 · 最多 12 字中文
//   - 视觉：单主星 orb + 罗马数字章节 + 金色 hairline + 暮紫底 + 玫瑰光晕
//   - 风格关键词：editorial atelier, twilight museum, cosmic romance,
//     film grain, neo-mystic, 暮光博物笔记, 女性向奢华
//
// 数据出口：
//   buildAllXhsCoverPrompts() → [{ slug, prompt, hookZh, plate, homePlanet }]
//
// 命令行：
//   node scripts/galaxy-xhs-covers.mjs | head -n 120
//   node scripts/galaxy-xhs-covers.mjs --json > tmp/xhs-covers.json

const STYLE_BASE = [
  '[Style] Editorial atelier × twilight museum × cosmic romance. Vertical 3:4 portrait cover for Xiaohongshu / Rednote.',
  'Mood: female-leaning, literary, mystic, quietly luxurious. No AI-slop gradients, no generic dark-cosmic stock.',
  'Palette: deep twilight ink #1A1530 base, rose clay #C07A8E, gold leaf #C9A676, cream parchment #F5F0E8, violet halo #9C7CFF.',
  'Textures: soft film grain, subtle vignette, hand-placed stardust specks, thin gold hairlines, faint parchment paper.',
  'Composition: one hero planetary orb dead-center, soft double-ring orbit, small roman numeral chapter badge (I–VI).',
  'Typography: UPPERCASE English eyebrow with 0.4em letter-spacing at top; italic Cormorant Garamond / Noto Serif SC Chinese title mid-card; tiny monospaced slug at bottom.',
  'Accuracy: Chinese typography must be kerned, elegant, readable, no garbled glyphs. No low poly, no papercraft, no cyberpunk, no horror, no watermark, no logo.',
].join('\n');

function buildCoverPrompt({
  eyebrow,
  titleZh,
  titleEn,
  hookZh,
  orbDescription,
  sceneMotif,
  numeral,
  accent,
  accentSecondary,
  slug,
}) {
  return [
    STYLE_BASE,
    `[Eyebrow] Top text: "${eyebrow}" in uppercase, letter-spacing 0.42em, gold leaf #C9A676.`,
    `[Title] Center-upper title in Cormorant Garamond italic + Noto Serif SC: 英文 "${titleEn}" 堆叠其下中文 "${titleZh}". Chinese max 12 chars.`,
    `[Hook Line] Below title, one serif italic Chinese line: "${hookZh}". Color cream #F5F0E8 at 85% opacity.`,
    `[Hero Orb] A single planetary orb centered at 50% x 55%. ${orbDescription} Primary accent ${accent}. Secondary accent ${accentSecondary}. Faint double orbit ring in gold hairline #C9A676 at 30% opacity.`,
    `[Scene Motif] ${sceneMotif} All motif elements stay behind the orb as quiet background—never compete with the title.`,
    `[Chapter Badge] A small roman numeral "${numeral}" in italic gold, top-right corner, next to a thin 40px gold hairline.`,
    '[Bottom Zone] Thin gold hairline divider near the bottom. Below it, small cream text "WTFTI · 人格神域". Absolutely no URL, no QR, no social handle.',
    `[Meta slug] Tiny monospaced text at very bottom: "//${slug}" — cream #F5F0E8 at 40% opacity.`,
    '[Do NOT] No multi-planet crowding, no photoreal human face, no hands with broken fingers, no brand names, no western zodiac cliché, no heavy bokeh, no Instagram filter stock look.',
  ].join('\n\n');
}

// ────────────── 8 主神 × 情绪钩子矩阵（40 张） ──────────────
//
// 每条 hook 遵守：
//   - 女性情绪 keywords（内有海 / 等不归人 / 安静日 / 镀金缝纫机 / …）
//   - 12 字以内中文短句
//   - 与 home planet 视觉锚点统一

const HOME_HOOKS = [
  // ───── I · 暴雨港湾 × 5
  {
    slug: 'xhs-stormharbor-01',
    homePlanet: 'home-storm-harbor',
    numeral: 'I',
    accent: '#C07A8E',
    accentSecondary: '#9DC9FF',
    eyebrow: 'PERSEPHONE RETURNS',
    titleEn: 'Storm Harbor',
    titleZh: '暴雨港湾',
    hookZh: '我内心一直有海，外表只是港。',
    orbDescription:
      'Deep indigo-rose orb half-wrapped in slow rain-clouds, a thin silver horizon line suggests a distant harbor; cool inside, warm only at the core.',
    sceneMotif:
      'Distant silhouette of wet pier posts, two seagulls as tiny stardust marks, one single blue-white star (Vega) above the orb.',
  },
  {
    slug: 'xhs-stormharbor-02',
    homePlanet: 'home-storm-harbor',
    numeral: 'I',
    accent: '#C07A8E',
    accentSecondary: '#F5F0E8',
    eyebrow: 'WAITING · VIGIL · RETURN',
    titleEn: 'The One Who Waits',
    titleZh: '等不归人',
    hookZh: '我等的不是结果，是那盏没熄的灯。',
    orbDescription:
      'Same indigo harbor orb, but tilted 20° with a faint warm amber window glow at its equator — the only "on" light in the whole composition.',
    sceneMotif: 'A single rose lamp glyph on the hairline; a handwritten Chinese character "归" in faint gold at 12% opacity behind the orb.',
  },
  {
    slug: 'xhs-stormharbor-03',
    homePlanet: 'home-storm-harbor',
    numeral: 'I',
    accent: '#9DC9FF',
    accentSecondary: '#C07A8E',
    eyebrow: 'INNER SEA · OUTER PORT',
    titleEn: 'Interior Storm',
    titleZh: '情绪深海',
    hookZh: '你看到的风平浪静，是我自己摁住的海。',
    orbDescription:
      'Cross-section orb, upper half calm night sea surface with moon reflection, lower half swirling deep-sea currents and bioluminescent rose particles.',
    sceneMotif: 'Thin contour line dividing sea and sky runs across the card as a second gold hairline — doubles as design accent.',
  },
  {
    slug: 'xhs-stormharbor-04',
    homePlanet: 'home-storm-harbor',
    numeral: 'I',
    accent: '#C07A8E',
    accentSecondary: '#C9A676',
    eyebrow: 'SIREN · UNHEARD',
    titleEn: 'Siren',
    titleZh: '塞壬 · 海妖',
    hookZh: '我唱的不是歌，是你听不见的那部分自己。',
    orbDescription:
      'Black-rose orb veiled in mist, faint pearl-chain orbital ring, whispers rendered as faint sound-wave curves radiating outward.',
    sceneMotif: 'Background watercolor of an ocean page from an ancient myth book; a single feather falling along the right edge.',
  },
  {
    slug: 'xhs-stormharbor-05',
    homePlanet: 'home-storm-harbor',
    numeral: 'I',
    accent: '#C07A8E',
    accentSecondary: '#9C7CFF',
    eyebrow: 'HARBOR LIGHT · 22:47',
    titleEn: '22:47 Pier',
    titleZh: '深夜码头',
    hookZh: '我不是归人，是个过客。',
    orbDescription:
      'Small rose-indigo orb offset to upper-right, surrounded by dense rainfall lines; a narrow vertical pier shape in gold anchors the lower third.',
    sceneMotif: 'Two overlapping orbits suggesting a ticket stub shape; a faint timestamp "22:47" in monospace at bottom-left.',
  },

  // ───── II · 极光客厅 × 5
  {
    slug: 'xhs-aurora-01',
    homePlanet: 'home-aurora-parlour',
    numeral: 'II',
    accent: '#D4B58A',
    accentSecondary: '#C07A8E',
    eyebrow: 'APHRODITE · PARLOUR',
    titleEn: 'Aurora Parlour',
    titleZh: '极光客厅',
    hookZh: '我把每一次相遇都布置成展览。',
    orbDescription:
      'Cream-gold orb with translucent aurora curtains draped like silk, warm interior window lights glowing from inside as if someone is hosting an exhibition.',
    sceneMotif: 'Tiny gold picture-frame glyphs orbiting the planet; cassiopeia five-point W constellation faintly drawn across the sky.',
  },
  {
    slug: 'xhs-aurora-02',
    homePlanet: 'home-aurora-parlour',
    numeral: 'II',
    accent: '#D4B58A',
    accentSecondary: '#F5F0E8',
    eyebrow: 'CURATED ENCOUNTERS',
    titleEn: 'The Curator',
    titleZh: '策展型温柔',
    hookZh: '我们生而破碎，用活着来修修补补。',
    orbDescription:
      'Warm parlour orb with a single tall window cutaway, soft candlelight glow, one cup of tea silhouette inside visible as a tiny dark dot.',
    sceneMotif: 'Gold-thread constellation lines forming a "W" (Cassiopeia) behind the orb.',
  },
  {
    slug: 'xhs-aurora-03',
    homePlanet: 'home-aurora-parlour',
    numeral: 'II',
    accent: '#D4B58A',
    accentSecondary: '#9C7CFF',
    eyebrow: 'HIGH-EQ LIGHTHOUSE',
    titleEn: 'High Touch',
    titleZh: '高情商灯塔',
    hookZh: '你不是会说话，是知道什么时候不说。',
    orbDescription:
      'Soft gold orb with a subtle silk-pleat texture spiraling its surface, a single thin beam of warm light gently sweeping outward.',
    sceneMotif: 'Background of handwritten editorial margin notes in very low-contrast sepia.',
  },
  {
    slug: 'xhs-aurora-04',
    homePlanet: 'home-aurora-parlour',
    numeral: 'II',
    accent: '#C07A8E',
    accentSecondary: '#D4B58A',
    eyebrow: 'SOCIAL GRAVITY',
    titleEn: 'Social Gravity',
    titleZh: '气场引力',
    hookZh: '你走过去，整个场就活了。',
    orbDescription:
      'Warm rose-gold orb at the center of converging orbital lines that swirl toward it as if people gravitate inward.',
    sceneMotif: 'Dozens of tiny dot-particles orbiting at different radii — feels like a social constellation map.',
  },
  {
    slug: 'xhs-aurora-05',
    homePlanet: 'home-aurora-parlour',
    numeral: 'II',
    accent: '#D4B58A',
    accentSecondary: '#C07A8E',
    eyebrow: 'THE HOSTESS · LEGACY',
    titleEn: 'Hostess Note',
    titleZh: '请客笔记',
    hookZh: '我请你，不是客套，是策展。',
    orbDescription:
      'Cream orb with a cutaway slice revealing a miniature candlelit dinner scene as the planet\'s core — surreal editorial.',
    sceneMotif: 'Gold-leaf italic "R.S.V.P." in the bottom gutter; faint typewriter header tape on one side.',
  },

  // ───── III · 镀金缝纫机 × 5
  {
    slug: 'xhs-gilded-01',
    homePlanet: 'home-gilded-loom',
    numeral: 'III',
    accent: '#C9A676',
    accentSecondary: '#C07A8E',
    eyebrow: 'GILDED LOOM',
    titleEn: 'Gilded Loom',
    titleZh: '镀金缝纫机',
    hookZh: '你把所有情感都缝成可以穿出门的外套。',
    orbDescription:
      'Burnished gold orb wrapped in thin gold threads orbiting like loom filaments, an ornate sewing-machine wheel embedded into its equator.',
    sceneMotif: 'A silver bridge of light (magpie bridge) connecting two bright stars (Altair × Vega) across the sky.',
  },
  {
    slug: 'xhs-gilded-02',
    homePlanet: 'home-gilded-loom',
    numeral: 'III',
    accent: '#C9A676',
    accentSecondary: '#F5F0E8',
    eyebrow: 'LONG LOVE · SLOW CRAFT',
    titleEn: 'Long Love',
    titleZh: '长情手艺人',
    hookZh: '我爱得不快，但能记很久。',
    orbDescription:
      'Gold orb half-wrapped in vintage lace pattern, tiny needle marks tracing galaxies on its surface.',
    sceneMotif: 'Faint printed "蓝墨水的上游，是星河" in the background as watermark text.',
  },
  {
    slug: 'xhs-gilded-03',
    homePlanet: 'home-gilded-loom',
    numeral: 'III',
    accent: '#C9A676',
    accentSecondary: '#9DC9FF',
    eyebrow: 'LONG-DISTANCE EXPERT',
    titleEn: 'Tele-Thread',
    titleZh: '远距离专家',
    hookZh: '我不在场，但我提前一周就缝好了。',
    orbDescription:
      'Gold orb with a single golden thread stretching across the entire card from upper-left corner to lower-right edge.',
    sceneMotif: 'The thread passes through a tiny needle icon and disappears into faint envelope silhouettes.',
  },
  {
    slug: 'xhs-gilded-04',
    homePlanet: 'home-gilded-loom',
    numeral: 'III',
    accent: '#C9A676',
    accentSecondary: '#C07A8E',
    eyebrow: 'MAGPIE BRIDGE · 2026',
    titleEn: 'Magpie Bridge',
    titleZh: '鹊桥当代记',
    hookZh: '银河这么大，我还是对得上你那颗星。',
    orbDescription:
      'Two small orbs separated by a silver bridge of light, gold-thread stitching the bridge together like craft.',
    sceneMotif: 'Faint Chinese character "织" at 10% opacity behind the bridge.',
  },
  {
    slug: 'xhs-gilded-05',
    homePlanet: 'home-gilded-loom',
    numeral: 'III',
    accent: '#C9A676',
    accentSecondary: '#D4B58A',
    eyebrow: 'DAILY RITUAL · FIBER',
    titleEn: 'Daily Fiber',
    titleZh: '日常缝纫',
    hookZh: '我把日子织出来，不是捱过去。',
    orbDescription:
      'Small amber orb at bottom-third with thick stitched fibers wrapping it like a beloved cushion.',
    sceneMotif: 'Top half of card is blank gold-leaf parchment texture — extremely editorial magazine vibe.',
  },

  // ───── IV · 沉默灯塔 × 5
  {
    slug: 'xhs-lighthouse-01',
    homePlanet: 'home-silent-lighthouse',
    numeral: 'IV',
    accent: '#9DC9FF',
    accentSecondary: '#F5F0E8',
    eyebrow: 'POLARIS · STILL',
    titleEn: 'Silent Lighthouse',
    titleZh: '沉默灯塔',
    hookZh: '我不动，但所有人都用我定位。',
    orbDescription:
      'Ice-blue orb with a single tall lighthouse beam rotating slowly, anchored beneath Polaris — the only unmoving star.',
    sceneMotif: 'Aurora drifting at poles; frosted glass reflection near bottom.',
  },
  {
    slug: 'xhs-lighthouse-02',
    homePlanet: 'home-silent-lighthouse',
    numeral: 'IV',
    accent: '#9DC9FF',
    accentSecondary: '#C9A676',
    eyebrow: 'LOW DENSITY · HIGH PRESENCE',
    titleEn: 'Anchor',
    titleZh: '锚点型',
    hookZh: '你的安静不是缺席，是先把自己看清。',
    orbDescription:
      'Pale ice orb with a cross-shape anchor glyph etched into its surface in gold.',
    sceneMotif: 'Very long thin gold hairline cutting across entire card — like a sextant horizon.',
  },
  {
    slug: 'xhs-lighthouse-03',
    homePlanet: 'home-silent-lighthouse',
    numeral: 'IV',
    accent: '#9DC9FF',
    accentSecondary: '#9C7CFF',
    eyebrow: 'HESTIA · HEARTH',
    titleEn: 'Inner Hearth',
    titleZh: '炉火不语',
    hookZh: '万物由我而出，我又复归于万物。',
    orbDescription:
      'Ice-blue orb with a tiny warm amber hearth glow at its exact core — visible through a thin vertical cross-section.',
    sceneMotif: 'Minimal stars; absolute calm. 95% empty space feel.',
  },
  {
    slug: 'xhs-lighthouse-04',
    homePlanet: 'home-silent-lighthouse',
    numeral: 'IV',
    accent: '#9DC9FF',
    accentSecondary: '#D4B58A',
    eyebrow: 'LOW-DENSITY COMMS',
    titleEn: 'Less Is More',
    titleZh: '低话密度',
    hookZh: '我不是冷，我只是懒得重复废话。',
    orbDescription:
      'Pale blue orb half-hidden behind a long vertical slit of light — like a slightly-open door to monastic silence.',
    sceneMotif: 'A single dot · dot · dash morse pattern floating nearby.',
  },
  {
    slug: 'xhs-lighthouse-05',
    homePlanet: 'home-silent-lighthouse',
    numeral: 'IV',
    accent: '#F5F0E8',
    accentSecondary: '#9DC9FF',
    eyebrow: 'NORTH · FIXED POINT',
    titleEn: 'Fixed Point',
    titleZh: '北极定点',
    hookZh: '我不闪烁，你才能校准方向。',
    orbDescription:
      'Very small ice orb placed high at 40% y-axis; the rest of the card is deep twilight emptiness with only Polaris shining above.',
    sceneMotif: 'Faint grid-like celestial coordinates in very low contrast.',
  },

  // ───── V · 慢银河 × 5
  {
    slug: 'xhs-slowgalaxy-01',
    homePlanet: 'home-slow-galaxy',
    numeral: 'V',
    accent: '#9C7CFF',
    accentSecondary: '#F5F0E8',
    eyebrow: 'SLOW LIGHT',
    titleEn: 'Slow Galaxy',
    titleZh: '慢银河',
    hookZh: '我说的话比别人晚到三秒，但更准。',
    orbDescription:
      'Soft lilac orb half-wrapped in a wide milky-white galactic band flowing like spilt milk, dust stars suspended in slow-motion.',
    sceneMotif: 'Long motion-blur trails of light behind the planet as if time runs at half speed.',
  },
  {
    slug: 'xhs-slowgalaxy-02',
    homePlanet: 'home-slow-galaxy',
    numeral: 'V',
    accent: '#9C7CFF',
    accentSecondary: '#C9A676',
    eyebrow: 'DELAYED · DELIBERATE',
    titleEn: 'Slow Reply',
    titleZh: '慢回型',
    hookZh: '不是不回，是想回得准。',
    orbDescription:
      'Lilac orb with a tiny clock glyph embedded, hands moving visibly slow, gold second-hand trailing stardust.',
    sceneMotif: 'Background of aged parchment with watermark of time units (chronos).',
  },
  {
    slug: 'xhs-slowgalaxy-03',
    homePlanet: 'home-slow-galaxy',
    numeral: 'V',
    accent: '#9C7CFF',
    accentSecondary: '#C07A8E',
    eyebrow: 'COSMIC MATERNAL',
    titleEn: 'Cosmic Mother',
    titleZh: '像母亲一样的宇宙',
    hookZh: '我看见的星光都是亿万年前的事。',
    orbDescription:
      'Soft violet orb cradled in a faint spiral arm that wraps around like an embracing forearm.',
    sceneMotif: 'Floating Chinese character "慢" at 12% opacity behind the galaxy band.',
  },
  {
    slug: 'xhs-slowgalaxy-04',
    homePlanet: 'home-slow-galaxy',
    numeral: 'V',
    accent: '#9C7CFF',
    accentSecondary: '#D4B58A',
    eyebrow: 'BANDWIDTH · DEEP',
    titleEn: 'Deep Bandwidth',
    titleZh: '高带宽情绪',
    hookZh: '你能听懂我没说出口的那一层。',
    orbDescription:
      'Violet orb with gentle concentric sound-wave rings expanding outward — very slow, meditative.',
    sceneMotif: 'Thin gold treble-clef glyph barely visible in background.',
  },
  {
    slug: 'xhs-slowgalaxy-05',
    homePlanet: 'home-slow-galaxy',
    numeral: 'V',
    accent: '#9C7CFF',
    accentSecondary: '#F5F0E8',
    eyebrow: 'LATE BUT TRUE',
    titleEn: 'Late Arrival',
    titleZh: '迟到的真话',
    hookZh: '我的那一句，值得你等。',
    orbDescription:
      'Lilac orb slightly tilted, with a single bright beam of light arriving "late" from off-frame upper-right.',
    sceneMotif: 'A soft editorial page number "p. 47" in the corner.',
  },

  // ───── VI · 漂流冰川 × 5
  {
    slug: 'xhs-drift-01',
    homePlanet: 'home-drift-glacier',
    numeral: 'VI',
    accent: '#7AC8E0',
    accentSecondary: '#C9A676',
    eyebrow: 'DELPHINUS · DRIFT',
    titleEn: 'Drift Glacier',
    titleZh: '漂流冰川',
    hookZh: '我不是冷，我只是漂在两个海域之间。',
    orbDescription:
      'Turquoise-white orb half-covered by floating glacial islands, a small dolphin-diamond constellation sparkling above.',
    sceneMotif: 'Gentle current streams flowing across card diagonals.',
  },
  {
    slug: 'xhs-drift-02',
    homePlanet: 'home-drift-glacier',
    numeral: 'VI',
    accent: '#7AC8E0',
    accentSecondary: '#F5F0E8',
    eyebrow: 'TRAVELLING HEART',
    titleEn: 'Gentle Nomad',
    titleZh: '温柔漂泊者',
    hookZh: '我寄愁心与明月，随风直到夜郎西。',
    orbDescription:
      'Pale aqua orb with a small paper-boat silhouette orbiting it at a wide loose radius.',
    sceneMotif: 'A very thin crescent moon high on the card; faint classical Chinese poem watermark.',
  },
  {
    slug: 'xhs-drift-03',
    homePlanet: 'home-drift-glacier',
    numeral: 'VI',
    accent: '#7AC8E0',
    accentSecondary: '#9C7CFF',
    eyebrow: 'LETTERS FROM AFAR',
    titleEn: 'Distant Letter',
    titleZh: '远方寄信人',
    hookZh: '我没忘，我只是很远的时候才回。',
    orbDescription:
      'Aqua-white orb with envelopes drifting around like slow satellites, wax seals visible as tiny rose dots.',
    sceneMotif: 'One envelope in the foreground bears a gold-wax "R" seal.',
  },
  {
    slug: 'xhs-drift-04',
    homePlanet: 'home-drift-glacier',
    numeral: 'VI',
    accent: '#7AC8E0',
    accentSecondary: '#C9A676',
    eyebrow: 'EMOTIONAL NOMAD',
    titleEn: 'Emotional Nomad',
    titleZh: '情感游牧',
    hookZh: '我会靠岸，但不会被圈养。',
    orbDescription:
      'Slightly drifting orb offset to the left third, a single long trailing iceberg shadow behind it.',
    sceneMotif: 'Aurora strand moving horizontally as a subtle second hairline.',
  },
  {
    slug: 'xhs-drift-05',
    homePlanet: 'home-drift-glacier',
    numeral: 'VI',
    accent: '#7AC8E0',
    accentSecondary: '#D4B58A',
    eyebrow: 'BETWEEN TWO SEAS',
    titleEn: 'Between Seas',
    titleZh: '两海之间',
    hookZh: '不是冷漠，是我在两种温度里。',
    orbDescription:
      'Orb split vertically: left side warm rose tint, right side icy teal — one body, two climates.',
    sceneMotif: 'A diagonal gold seam cutting the orb like a tailor\'s stitch.',
  },

  // ───── VII · 黑曜钟楼 × 5
  {
    slug: 'xhs-obsidian-01',
    homePlanet: 'home-obsidian-belfry',
    numeral: 'VII',
    accent: '#5C4A8A',
    accentSecondary: '#C9A676',
    eyebrow: 'HECATE · OBSIDIAN',
    titleEn: 'Obsidian Belfry',
    titleZh: '黑曜钟楼',
    hookZh: '我不响则已，一响就是预言。',
    orbDescription:
      'Glossy obsidian-black orb with a tall gothic bell-tower rising from its surface; Sirius shining like a beacon directly above the spire.',
    sceneMotif: 'Egyptian/Sothic motifs faintly etched into the orb\'s rings.',
  },
  {
    slug: 'xhs-obsidian-02',
    homePlanet: 'home-obsidian-belfry',
    numeral: 'VII',
    accent: '#5C4A8A',
    accentSecondary: '#F5F0E8',
    eyebrow: 'QUIET AUTHORITY',
    titleEn: 'Low Voice',
    titleZh: '少话权威',
    hookZh: '我话不多，你得听完。',
    orbDescription:
      'Black orb with only a thin silver rim of light, embossed tarot-card motifs on its surface.',
    sceneMotif: 'Occult geometry lines forming a faint pentagon in the background.',
  },
  {
    slug: 'xhs-obsidian-03',
    homePlanet: 'home-obsidian-belfry',
    numeral: 'VII',
    accent: '#5C4A8A',
    accentSecondary: '#9C7CFF',
    eyebrow: 'ORACLE · PROPHECY',
    titleEn: 'Oracle Tone',
    titleZh: '预言式洞察',
    hookZh: '我必须经过的地方，没人替我去走。',
    orbDescription:
      'Dark violet orb with a keyhole slit glowing gold at its core, suggesting a sealed prophecy inside.',
    sceneMotif: 'Three small tarot-card silhouettes behind the orb.',
  },
  {
    slug: 'xhs-obsidian-04',
    homePlanet: 'home-obsidian-belfry',
    numeral: 'VII',
    accent: '#5C4A8A',
    accentSecondary: '#C07A8E',
    eyebrow: 'INNER ORDER',
    titleEn: 'Inner Order',
    titleZh: '内嵌秩序感',
    hookZh: '我看起来不讲逻辑，但结构全在里面。',
    orbDescription:
      'Matte black orb with hexagonal tessellation faintly revealed by a sidelight; rose-gold glinting on the edges.',
    sceneMotif: 'Faint schematic blueprint in the background parchment.',
  },
  {
    slug: 'xhs-obsidian-05',
    homePlanet: 'home-obsidian-belfry',
    numeral: 'VII',
    accent: '#9C7CFF',
    accentSecondary: '#5C4A8A',
    eyebrow: 'MIDNIGHT BELL',
    titleEn: 'Midnight Bell',
    titleZh: '子夜之钟',
    hookZh: '我敲一声，白天就整齐了。',
    orbDescription:
      'Obsidian orb with a single bronze bell glyph suspended in front; sound rings faintly expand outward as concentric gold lines.',
    sceneMotif: 'A roman numeral "XII" subtly echoing the chapter numeral.',
  },

  // ───── VIII · 火星玫瑰园 × 5
  {
    slug: 'xhs-mars-01',
    homePlanet: 'home-mars-rose-garden',
    numeral: 'VIII',
    accent: '#E04E6B',
    accentSecondary: '#C9A676',
    eyebrow: 'ARES × APHRODITE',
    titleEn: 'Mars Rose Garden',
    titleZh: '火星玫瑰园',
    hookZh: '你的爱和怒火本来就是同一个温度。',
    orbDescription:
      'Scarlet-coral orb covered in geometric rose blossoms growing from Martian craters; a pink-red nebula shaped like a giant rose bloom behind it.',
    sceneMotif: 'Rose motif repeated as a faint orbital ring.',
  },
  {
    slug: 'xhs-mars-02',
    homePlanet: 'home-mars-rose-garden',
    numeral: 'VIII',
    accent: '#E04E6B',
    accentSecondary: '#F5F0E8',
    eyebrow: 'FIERCELY TENDER',
    titleEn: 'Fierce Tender',
    titleZh: '炽热守护者',
    hookZh: '我对你温柔，是我收紧了一次剑。',
    orbDescription:
      'Deep red orb with a faint sword silhouette embedded in its equator, tip pointing skyward; rose petals falling around.',
    sceneMotif: 'A small heart-shaped ember floating above the orb.',
  },
  {
    slug: 'xhs-mars-03',
    homePlanet: 'home-mars-rose-garden',
    numeral: 'VIII',
    accent: '#E04E6B',
    accentSecondary: '#9C7CFF',
    eyebrow: 'LOVE = WAR HEAT',
    titleEn: 'Same Temperature',
    titleZh: '同温度',
    hookZh: 'Rose is a rose is a rose is a rose.',
    orbDescription:
      'Coral orb split vertically: left half roses in bloom, right half small flame tongues — one body, one heat.',
    sceneMotif: 'Gertrude Stein quote as faint watermark across background.',
  },
  {
    slug: 'xhs-mars-04',
    homePlanet: 'home-mars-rose-garden',
    numeral: 'VIII',
    accent: '#E04E6B',
    accentSecondary: '#D4B58A',
    eyebrow: 'UNFLINCHING SOFT',
    titleEn: 'Soft & Fierce',
    titleZh: '不退让的温柔',
    hookZh: '我温柔，但不是让。',
    orbDescription:
      'Rose orb with an inner glow of white-hot core; fine thorn-pattern threads orbiting at a tight radius.',
    sceneMotif: 'Arrow-tip glyph peeking from behind the orb as a half-shape.',
  },
  {
    slug: 'xhs-mars-05',
    homePlanet: 'home-mars-rose-garden',
    numeral: 'VIII',
    accent: '#E04E6B',
    accentSecondary: '#C07A8E',
    eyebrow: 'ROSETTE NEBULA',
    titleEn: 'Rosette',
    titleZh: '玫瑰星云',
    hookZh: '我是星云，不是你家花瓶。',
    orbDescription:
      'Small coral orb nestled inside the center of an enormous rose-shaped nebula that fills the entire background.',
    sceneMotif: 'Very thin gold vein running through the nebula like a petal.',
  },
];

// ────────────── 节日/季节节点 10 张（用 Xiaohongshu 节点逻辑：情人节 / 七夕 / 冬至 / 立春 / 跨年 / …） ──────────────

const SEASONAL_HOOKS = [
  {
    slug: 'xhs-seasonal-qixi-01',
    homePlanet: 'home-gilded-loom',
    numeral: 'III',
    accent: '#C9A676',
    accentSecondary: '#C07A8E',
    eyebrow: 'QIXI · MAGPIE BRIDGE',
    titleEn: 'Qixi Vow',
    titleZh: '七夕许愿',
    hookZh: '银河再大，也能对上一颗你的星。',
    orbDescription:
      'Gold orb with a long silver magpie-bridge light stretching across the sky, two bright lovers-stars on opposite ends.',
    sceneMotif: 'A tiny pair of lanterns floating up from the card\'s lower edge.',
  },
  {
    slug: 'xhs-seasonal-valentine-02',
    homePlanet: 'home-mars-rose-garden',
    numeral: 'VIII',
    accent: '#E04E6B',
    accentSecondary: '#C9A676',
    eyebrow: 'VALENTINE · ROSE',
    titleEn: 'Valentine Orb',
    titleZh: '情人节玫瑰',
    hookZh: '我送你的不是玫瑰，是我挑出的那颗星。',
    orbDescription:
      'Red-rose orb with one single long-stem rose behind it — stem becomes the orbital line.',
    sceneMotif: 'A tiny handwritten "R." wax seal in corner.',
  },
  {
    slug: 'xhs-seasonal-midautumn-03',
    homePlanet: 'home-slow-galaxy',
    numeral: 'V',
    accent: '#9C7CFF',
    accentSecondary: '#F5F0E8',
    eyebrow: 'MID-AUTUMN · MOON',
    titleEn: 'Mid-Autumn Moon',
    titleZh: '中秋月相',
    hookZh: '但愿人长久，千里共一个神域。',
    orbDescription:
      'Lilac orb paired with a large pale moon right beside it, slightly overlapping — two satellites sharing one sky.',
    sceneMotif: 'Faint mooncake lattice pattern in the background parchment.',
  },
  {
    slug: 'xhs-seasonal-newyear-04',
    homePlanet: 'home-aurora-parlour',
    numeral: 'II',
    accent: '#D4B58A',
    accentSecondary: '#C07A8E',
    eyebrow: 'NEW YEAR · RESET',
    titleEn: 'Opening Credits',
    titleZh: '新年开场',
    hookZh: '新的一年我只留得下对的人。',
    orbDescription:
      'Cream-gold orb with warm hearth-light from within; a thin gold hairline forms a horizontal "year marker".',
    sceneMotif: 'Faint roman numeral "MMXXVI" barely visible top-left.',
  },
  {
    slug: 'xhs-seasonal-solstice-05',
    homePlanet: 'home-silent-lighthouse',
    numeral: 'IV',
    accent: '#9DC9FF',
    accentSecondary: '#C9A676',
    eyebrow: 'WINTER SOLSTICE',
    titleEn: 'Longest Night',
    titleZh: '最长夜',
    hookZh: '最长的夜，你还有我这盏灯。',
    orbDescription:
      'Cold ice-blue orb with a single warm amber beam cutting horizontally through the deep night.',
    sceneMotif: 'Faint snow specks drifting horizontally.',
  },
  {
    slug: 'xhs-seasonal-spring-06',
    homePlanet: 'home-storm-harbor',
    numeral: 'I',
    accent: '#C07A8E',
    accentSecondary: '#F5F0E8',
    eyebrow: 'LICHUN · THAW',
    titleEn: 'Thaw Coming',
    titleZh: '立春回港',
    hookZh: '风一换向，我就知道该靠岸了。',
    orbDescription:
      'Indigo-rose orb with a first thaw crack in its ice, warm rose glow leaking out.',
    sceneMotif: 'Small cherry-blossom petal drifting inward.',
  },
  {
    slug: 'xhs-seasonal-midnight-07',
    homePlanet: 'home-obsidian-belfry',
    numeral: 'VII',
    accent: '#5C4A8A',
    accentSecondary: '#9C7CFF',
    eyebrow: 'NEW MOON · ORACLE',
    titleEn: 'New Moon Oracle',
    titleZh: '新月启示',
    hookZh: '新月的第一个念头，通常是真的。',
    orbDescription:
      'Obsidian orb and a slim crescent side by side; gold hairline beneath implies an opening page.',
    sceneMotif: 'A faint hand drawing a rune in the background.',
  },
  {
    slug: 'xhs-seasonal-galileo-08',
    homePlanet: 'home-slow-galaxy',
    numeral: 'V',
    accent: '#9C7CFF',
    accentSecondary: '#D4B58A',
    eyebrow: 'PERSEID SHOWER',
    titleEn: 'Perseid Wish',
    titleZh: '英仙许愿',
    hookZh: '今年我只许一个不俗气的愿。',
    orbDescription:
      'Lilac orb with streaking perseid meteors falling at 20° across the card.',
    sceneMotif: 'Tiny handwritten Chinese "愿" at the falling trail tip.',
  },
  {
    slug: 'xhs-seasonal-rainseason-09',
    homePlanet: 'home-storm-harbor',
    numeral: 'I',
    accent: '#C07A8E',
    accentSecondary: '#9DC9FF',
    eyebrow: 'RAINY · HARBOR',
    titleEn: 'Rainy Harbor',
    titleZh: '雨季港湾',
    hookZh: '整个城市在哭，我家厨房还亮。',
    orbDescription:
      'Rose-indigo orb in the rain with one warm kitchen window glowing inside.',
    sceneMotif: 'Rain-droplet patterns on the parchment edges.',
  },
  {
    slug: 'xhs-seasonal-glacier-10',
    homePlanet: 'home-drift-glacier',
    numeral: 'VI',
    accent: '#7AC8E0',
    accentSecondary: '#C9A676',
    eyebrow: 'POLAR · AURORA',
    titleEn: 'Polar Aurora',
    titleZh: '极地极光',
    hookZh: '极光不为谁出场，我也是。',
    orbDescription:
      'Aqua-white orb with an aurora curtain draped diagonally over the top, pale green and pink tones accented in gold.',
    sceneMotif: 'Ice shards floating quietly.',
  },
];

const ALL_COVER_ENTRIES = [...HOME_HOOKS, ...SEASONAL_HOOKS];

export function buildAllXhsCoverPrompts() {
  return ALL_COVER_ENTRIES.map((e) => ({
    slug: e.slug,
    homePlanet: e.homePlanet,
    numeral: e.numeral,
    hookZh: e.hookZh,
    titleZh: e.titleZh,
    titleEn: e.titleEn,
    plate: {
      accent: e.accent,
      accentSecondary: e.accentSecondary,
    },
    prompt: buildCoverPrompt(e),
  }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const all = buildAllXhsCoverPrompts();
  if (process.argv.includes('--json')) {
    process.stdout.write(JSON.stringify(all, null, 2));
  } else {
    console.log(`# Generated ${all.length} Xiaohongshu cover prompts\n`);
    for (const item of all) {
      console.log(`## ${item.slug}  ·  ${item.homePlanet}  ·  ${item.hookZh}\n`);
      console.log(item.prompt);
      console.log('\n---\n');
    }
  }
}
