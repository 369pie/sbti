const BASE_VISUAL_STYLE_CLASSIC =
  '严格保留参考图的简洁低多边形纸艺插画风格(low-poly paper craft illustration)，保留方块头、圆眼睛、短四肢、呆萌比例。' +
  '不要照片感，不要高精度3D建模感，不要电影级光影，不要真实皮肤纹理，不要复杂背景，不要任何文字、标题或水印。' +
  '纯白背景，只保留一个居中的完整全身角色，颜色干净、造型简洁、轮廓明确。';

const BASE_VISUAL_STYLE_INFLATABLE =
  'An inflatable oversized vinyl toy figure, shiny smooth PVC plastic surface with glossy reflections and subtle seam lines where inflatable sections meet. ' +
  'The character has soft bulging proportions of a large air-filled balloon figure — chunky rounded limbs, slightly oversized head, everything looks pumped full of air. ' +
  'Smooth glossy plastic skin with bright highlight reflections. The material is clearly shiny inflatable vinyl/PVC, NOT matte, NOT fabric, NOT clay, NOT realistic skin. ' +
  'Single character figure on clean studio background. Full body or three-quarter body, centered composition. ' +
  'Small inflatable accessories and props should float nearby or be held by the character — all in inflatable vinyl material. ' +
  'Keep 2-3 props maximum, do not clutter. Background should be a single clean color or simple gradient. ' +
  'ABSOLUTELY ZERO TEXT of any kind in the image. No letters, no words, no captions, no labels, no Chinese characters, no English text, no numbers, no UI elements.';

const BASE_SBTI_TONE_CLASSIC =
  '这不是普通可爱吉祥物，而是 SBTI 世界观里会被截图转发的人格/状态拟人化角色。' +
  '气质要带明显的自嘲、搞怪、玩梗和一点点社死感，像“被说中但又很好笑”的梗图主角 。' +
  '表情、肢体动作、道具和姿态都要夸张，第一眼就能看懂这个角色在讽刺什么、嘴硬什么、尴尬什么。' +
  '不要做成励志海报、唯美插画、治愈系海报或过于正经的人设图，宁可更抽象、更狼狈、更有槽点和传播张力。';

const BASE_SBTI_TONE_INFLATABLE =
  'A collectible designer toy figure for a social-media personality atlas. ' +
  'This is NOT a generic mascot, but a meme-able, self-deprecating representation of an original personality type in the SBTI universe. ' +
  'The expression, posture, and props MUST be exaggerated to communicate the specific satirical or embarrassing essence of the archetype. ' +
  'It should feel like a designer toy blind box series that fans want to collect immediately.';

export function buildSbtiImagePrompt({ seriesLabel, seriesTone, concept, extraNotes, artStyle }) {
  const isVinyl = artStyle === 'inflatable-vinyl';

  return [
    isVinyl ? BASE_VISUAL_STYLE_INFLATABLE : BASE_VISUAL_STYLE_CLASSIC,
    `这是一个"${seriesLabel}"系列图鉴角色。`,
    isVinyl ? BASE_SBTI_TONE_INFLATABLE : BASE_SBTI_TONE_CLASSIC,
    seriesTone,
    concept,
    extraNotes,
    isVinyl ? 'negative prompt: text, typography, letters, words, Chinese characters, English words, numbers as labels, caption, title, label, watermark, logo, ' + 'realistic human, photograph, low poly, flat 2D illustration, anime, cartoon drawing, matte surface, fabric texture, clay, knitted, paper craft, ' + 'complex background, busy scene, multiple characters, horror, violent, ugly, deformed' : ''
  ]
    .filter(Boolean)
    .join(isVinyl ? '\n\n' : '');
}

// ─── Card Mode: 图鉴卡面模式 (文案烘焙进图片) ───

export function buildUniverseCardPrompt({ seriesLabel, concept, card, themeColor }) {
  const { name, number, code, backronym, tagline, tags, quote } = card;

  const tagTexts = tags.map(t => t.replace(/^[\p{Emoji_Presentation}\p{Emoji}\uFE0F\u200D]+\s*/u, '').trim());
  const tagEmojis = tags.map(t => {
    const m = t.match(/^([\p{Emoji_Presentation}\p{Emoji}\uFE0F\u200D]+)/u);
    return m ? m[1] : '';
  });
  const cleanQuote = quote.replace(/^["「"]+|["」"]+$/g, '');

  return `一张竖版3:4人格图鉴收藏卡片。卡片从上到下分三个区域：

【上方白底文字区】
左上角小字「${seriesLabel}」
大号加粗标题「${number}（${name}）」
下方英文「${code}（${backronym}）」
一行小字「你是那种……${tagline}」

【中间角色区，${themeColor || '主题色'}渐变背景】
充气乙烯PVC手办角色，光泽圆鼓鼓气球质感，亮面反光。${concept}
角色居中，周围留白干净。

【底部深色区】
三个圆角胶囊标签横向一排：「${tagEmojis[0]} ${tagTexts[0]}」「${tagEmojis[1]} ${tagTexts[1]}」「${tagEmojis[2]} ${tagTexts[2]}」
最底部深色圆角横幅金色字：「${cleanQuote}」

注意：文字区域直接显示内容文字，不要出现"标题："、"标签："、"描述："等标签前缀词。所有中文逐字正确无乱码，英文拼写正确。整体风格像高级盲盒收藏卡，适合截图分享。

negative prompt: 错别字, 乱码, 模糊文字, label prefix, deformed, realistic human, photograph, low poly, flat 2D, anime, matte, fabric, clay, paper craft, busy background, horror, violent, ugly`;
}
