// WTFTI 星图 · 星球卡 AI 生图 prompt 批次（W1 首批）
// 用途：批量提交到 RunningHub text2img 管线（默认官方稳定渠道）
// 资产分组：HOME（主星 16 张候选）、MOON（卫星 12 张候选）、SHADOW（暗面 5 桶 × 2 = 10 张候选）
// 命名约定：slug 与 src/components/galaxy 的 cardSlug 对齐

export function buildGalaxyPlanetPrompt({
  category,    // 'home' | 'moon' | 'shadow'
  name,
  code,
  tagline,
  accentColor,
  visualConcept,
  toneTags,
  quote,
}) {
  const categoryHeader = {
    home: 'A premium "home planet" personality atlas card from WTFTI multiverse galaxy.',
    moon: 'A "moon" satellite personality card orbiting a home planet, smaller and contextual.',
    shadow: 'A mysterious "shadow planet" card representing the user\'s subconscious default tendency. Cooler palette, slightly eerie but elegant.',
  }[category];

  return [
    '[Overall Style]',
    categoryHeader,
    'Vertical 3:4 portrait card composition, premium poster-quality digital painting, soft cinematic glow, female-friendly, romantic-cosmic atmosphere, dreamy nebula and stardust, subtle mist, highly shareable on small-red-book / instagram.',
    '伪 3D 星球视觉，单星球主视觉居中，宇宙夜空背景，星雾缭绕，霓虹反射，画面有呼吸感。',
    `[Primary accent color] ${accentColor}.`,
    '[Top Typography Zone]',
    'At the top, small refined text reading "WTFTI · 人格星图".',
    `Below it, large elegant Chinese title text reading "${name}".`,
    `Below the title, prominent code text reading "${code}".`,
    `Below that, one-line description text reading "${tagline}".`,
    'All Chinese typography must be accurate, elegant, readable, kerned, and free of garbling.',
    '[Center Planet Zone]',
    `A single hero planet floating in space. ${visualConcept}`,
    'The planet has soft atmospheric glow, faint orbital ring, and subtle particles drifting around it. Background is deep cosmic gradient with distant stars, nebula clouds, and soft volumetric light.',
    '[Bottom Tag Zone]',
    'Near the lower part of the card, three pill-shaped tags in one row, each containing one short Chinese tone word.',
    `Tag 1: ${toneTags[0] || ''}`,
    `Tag 2: ${toneTags[1] || ''}`,
    `Tag 3: ${toneTags[2] || ''}`,
    `At the bottom edge, one elegant translucent banner with italic Chinese quote: "${quote}".`,
    'Do not show label prefixes like 标题 / 标签 / quote. Render the actual text directly in the design.',
    'negative prompt: garbled text, unreadable Chinese, misspelled words, photorealistic skin, heavy 3D render, low poly, papercraft, cyberpunk, horror, gore, NSFW, watermark, logo, multiple planets, busy chaotic background',
  ].join('\n\n');
}

// ───────────────────────── HOME PLANETS · 主星 8 张（cosmic-romance canon · 与 constellation-anchors.ts 对齐）
// 文档：docs/01-strategy/wtfti-cosmic-romance-narrative-2026-04-19.md §1 主星 ↔ 星座映射
export const HOME_PLANETS = [
  {
    slug: 'home-storm-harbor',
    name: '暴雨港湾',
    code: 'WTFI-STH',
    constellation: 'Lyra · Vega 织女座',
    accentColor: '#C07A8E',
    tagline: '你内心一直有海，外表只是港。',
    visualConcept:
      'A deep indigo planet with a calm port silhouette on its night side, faint lightning veins under thick cloud cover, a single distant blue-white star (Vega) shining above as the planet\'s anchor, electric rose-blue atmospheric glow, melancholic harbor mood.',
    toneTags: ['情绪深海', '高密度', '安全感引擎'],
    quote: '我不是归人，是个过客。',
  },
  {
    slug: 'home-aurora-parlour',
    name: '极光客厅',
    code: 'WTFI-AUR',
    constellation: 'Cassiopeia 仙后座',
    accentColor: '#D4B58A',
    tagline: 'ta 把每一次相遇都布置成展览。',
    visualConcept:
      'A warm cream-gold planet with translucent aurora curtains shaped like a five-point W draped across its sky, cozy interior lights leaking through tall windows, very feminine parlour mood, faint constellation map painted on its atmosphere.',
    toneTags: ['策展型温柔', '社交气场', '高情商灯塔'],
    quote: '我们生而破碎，用活着来修修补补。',
  },
  {
    slug: 'home-gilded-loom',
    name: '镀金缝纫机',
    code: 'WTFI-GLD',
    constellation: 'Altair × Vega 牛郎织女',
    accentColor: '#C9A676',
    tagline: '你把所有情感都缝成了一件可以穿出门的外套。',
    visualConcept:
      'A burnished gold planet with golden thread orbits looping like a giant loom around it, two bright stars on opposite sides connected by a fine silver bridge of light (the magpie bridge), ornate sewing-machine wheel embedded into its equator, romantic-craftsmanship aesthetic.',
    toneTags: ['长情手艺人', '远距离专家', '把日子织出来'],
    quote: '蓝墨水的上游，是黄河；黄河的上游，是星河。',
  },
  {
    slug: 'home-silent-lighthouse',
    name: '沉默灯塔',
    code: 'WTFI-LIT',
    constellation: 'Polaris · 北极星',
    accentColor: '#9DC9FF',
    tagline: '你不动，但所有人都用你定位。',
    visualConcept:
      'A pale ice-blue planet with a single tall lighthouse beam rotating slowly across its frozen seas, anchored beneath a single bright unmoving star (Polaris), Northern aurora drifting at the poles, hushed monastic atmosphere.',
    toneTags: ['锚点型', '低话密度', '高在场感'],
    quote: '万物由我而出，我又复归于万物。',
  },
  {
    slug: 'home-slow-galaxy',
    name: '慢银河',
    code: 'WTFI-SLW',
    constellation: 'Milky Way 银河',
    accentColor: '#9C7CFF',
    tagline: '你说的每句话都比别人晚到三秒，但更准。',
    visualConcept:
      'A soft lilac planet half-wrapped by a wide milky-white galactic band flowing across its sky like spilt milk, billions of distant stars dusted across the band, dreamy slow-motion mood, planet rotation visibly very slow.',
    toneTags: ['慢思考', '高带宽', '像母亲一样的宇宙'],
    quote: '我看见的星光都是亿万年前的事，我等的人只是迟到了一会儿。',
  },
  {
    slug: 'home-drift-glacier',
    name: '漂流冰川',
    code: 'WTFI-DRF',
    constellation: 'Delphinus 海豚座',
    accentColor: '#7AC8E0',
    tagline: '你不是冷，你只是漂在两个海域之间。',
    visualConcept:
      'A turquoise-white planet half-covered in floating glacial islands, a small dolphin-shaped diamond constellation sparkling above it, gentle currents drifting across the surface, lonely-poetic traveller mood.',
    toneTags: ['温柔漂泊者', '情感游牧', '远方寄信人'],
    quote: '我寄愁心与明月，随风直到夜郎西。',
  },
  {
    slug: 'home-obsidian-belfry',
    name: '黑曜钟楼',
    code: 'WTFI-OBS',
    constellation: 'Sirius 天狼星',
    accentColor: '#5C4A8A',
    tagline: 'ta 不响则已，一响就是预言。',
    visualConcept:
      'A glossy obsidian-black planet with a tall gothic bell-tower rising from its surface, the brightest star in the sky (Sirius) shining like a beacon directly above the spire, faint Egyptian/Sothic motifs etched into the planet\'s rings, mysterious oracular mood.',
    toneTags: ['少话权威', '预言式洞察', '内嵌秩序感'],
    quote: '我必须经过的地方，没人替我去走。',
  },
  {
    slug: 'home-mars-rose-garden',
    name: '火星玫瑰园',
    code: 'WTFI-MRS',
    constellation: 'Mars · Rosette Nebula 玫瑰星云',
    accentColor: '#E04E6B',
    tagline: '你的爱和怒火本来就是同一个温度。',
    visualConcept:
      'A scarlet-coral planet covered in glowing rose blossoms growing in geometric Martian craters, an enormous pink-red nebula shaped like a single rose blooming across the entire night sky behind it, fiercely romantic and slightly dangerous mood.',
    toneTags: ['炽热守护者', '爱与战神同体', '不退让的温柔'],
    quote: 'Rose is a rose is a rose is a rose.',
  },
];

// 旧的额外候选（保留以备后续扩展，但默认不参与生成）
const _LEGACY_HOME_CANDIDATES = [
  {
    slug: 'home-mirror-lake',
    name: '镜面湖',
    code: 'WTFI-MRL',
    accentColor: '#7FBCC4',
    tagline: '你是先把自己摆稳，再去回应世界的人。',
    visualConcept: 'A pale teal planet whose surface is one continuous mirror lake reflecting clouds and stars perfectly, faint mist hanging above, tranquil minimal scene.',
    toneTags: ['内观型', '稳态', '反射式表达'],
    quote: '我的安静不是缺席，是我先把自己看清。',
  },
  {
    slug: 'home-neon-bazaar',
    name: '霓虹集市',
    code: 'WTFI-NBZ',
    accentColor: '#FF4D8D',
    tagline: '你走过去，整条街就活了。',
    visualConcept: 'A vibrant magenta planet with a giant neon-lit night market wrapping around it, paper lanterns floating in space around it, glowing streets, festive cosmic carnival mood.',
    toneTags: ['场域中心', '能量发射器', '即兴主义'],
    quote: '我不是怕安静，我只是更适合被看见。',
  },
  {
    slug: 'home-shoji-room',
    name: '纸屏书斋',
    code: 'WTFI-SJR',
    accentColor: '#B6A37E',
    tagline: '你的安静是有体系的，不是没话说。',
    visualConcept: 'A warm beige planet whose surface is dressed like a tatami study room with soft shoji-paper light panels, ink stains, brushes floating around, very serene.',
    toneTags: ['有序内倾', '深度学习者', '价值优先'],
    quote: '我不是冷淡，是我对真东西更有耐心。',
  },
  {
    slug: 'home-ember-foundry',
    name: '余烬工坊',
    code: 'WTFI-EMF',
    accentColor: '#E04C2A',
    tagline: '你是把别人放弃的东西重新点着的人。',
    visualConcept: 'A dark amber planet with glowing forge embers across its surface, sparks rising into space, industrial-romantic vibe, hot iron texture under cool night sky.',
    toneTags: ['修复型', '硬核温柔', '执拗续命'],
    quote: '我没有放弃过任何一段值得的火。',
  },
  {
    slug: 'home-paper-airline',
    name: '纸飞机航线',
    code: 'WTFI-PFA',
    accentColor: '#9DC9FF',
    tagline: '你做决定像在折一架第二天才会飞的纸飞机。',
    visualConcept: 'A pale sky-blue planet wrapped in long curving paper-plane flight trails as orbital lines, floating notebook pages drifting in its atmosphere, very dreamy.',
    toneTags: ['理想主义', '低声行动派', '远程关怀'],
    quote: '我不在场，但我提前一周就把事安排好了。',
  },
];

// ───────────────────────── MOON PLANETS · 卫星候选 12 张（首批先做 6 张）
export const MOON_PLANETS = [
  {
    slug: 'moon-romance-spring',
    name: '初春卫星',
    code: 'MOON-ROM-A',
    accentColor: '#FFB7C5',
    tagline: '在恋爱里你像一场迟到的春天。',
    visualConcept: 'A small soft pink moon with faint cherry-blossom particles around it, gentle morning light, romantic tender atmosphere, orbiting line implied.',
    toneTags: ['慢热回应', '细节记忆', '回甘型'],
    quote: '我爱得不快，但你能记很久。',
  },
  {
    slug: 'moon-romance-tide',
    name: '潮汐卫星',
    code: 'MOON-ROM-B',
    accentColor: '#5A8FFF',
    tagline: '在恋爱里你像一段稳定但有起伏的潮。',
    visualConcept: 'A pale ocean-blue moon with circular tide patterns over its surface, faint shimmer, twin tide lines glowing.',
    toneTags: ['周期型情绪', '不黏但在', '退潮也在等'],
    quote: '我有节奏，你别误读成距离。',
  },
  {
    slug: 'moon-work-laser',
    name: '激光卫星',
    code: 'MOON-WRK-A',
    accentColor: '#3DD6A6',
    tagline: '在工作里你像一束聚焦到痛的光。',
    visualConcept: 'A sleek mint-green moon with one sharp laser line crossing its surface, modern minimal sci-fi vibe, faint grid texture.',
    toneTags: ['锁问题', '执行机器', '冷感专业'],
    quote: '别讲故事，告诉我变量。',
  },
  {
    slug: 'moon-work-greenhouse',
    name: '温室卫星',
    code: 'MOON-WRK-B',
    accentColor: '#A8D58A',
    tagline: '在工作里你是那个让团队不窒息的人。',
    visualConcept: 'A soft sage-green moon shaped like a small greenhouse dome, faint plants growing on its surface, warm interior light leaking out.',
    toneTags: ['情绪缓冲带', '协作粘合剂', '隐形 leader'],
    quote: '我不是没野心，我只是先让大家活着。',
  },
  {
    slug: 'moon-late-velvet-radio',
    name: '丝绒电台卫星',
    code: 'MOON-NIT-A',
    accentColor: '#9C7CFF',
    tagline: '深夜独处时你是个有人收听的电台。',
    visualConcept: 'A deep violet moon shaped like a vintage radio orb, soft sound-wave rings emitting outward, low light cozy feel.',
    toneTags: ['夜聊体质', '内心广播员', '走神远'],
    quote: '我半夜的脑子比白天精彩。',
  },
  {
    slug: 'moon-late-still-water',
    name: '止水卫星',
    code: 'MOON-NIT-B',
    accentColor: '#7AA3B0',
    tagline: '深夜独处时你比谁都安静。',
    visualConcept: 'A pale slate-blue moon with a perfectly still water surface reflecting one single star, almost zen, minimal.',
    toneTags: ['真休眠', '无内耗', '低响应'],
    quote: '别人脑内开会，我是真的关灯。',
  },
];

// ───────────────────────── SHADOW PLANETS · 暗面 5 桶 × 2 = 10 张（首批先做 5 张，每桶 1 张）
export const SHADOW_PLANETS = [
  {
    slug: 'shadow-drift-a-nameless-current',
    name: '无名洋流',
    code: 'SHADOW-DRIFT-A',
    accentColor: '#FF6FA3',
    tagline: '你的脑子从不真正下班。',
    visualConcept: 'A misty rose-pink planet half-shrouded in drifting cosmic currents, distant city lights faintly visible through fog, ethereal and slightly haunting.',
    toneTags: ['夜班大脑', '想得远', '画面感强'],
    quote: '凌晨 2 点我的大脑在为别人写剧本。',
  },
  {
    slug: 'shadow-drift-b-floating-postoffice',
    name: '漂浮邮局',
    code: 'SHADOW-DRIFT-B',
    accentColor: '#C9B6FF',
    tagline: '你白天在场，夜里在飘。',
    visualConcept: 'A pastel-violet planet with floating envelopes drifting around it like satellites, warm interior window light, dreamy postal mood.',
    toneTags: ['延迟回信', '情绪存档', '梦记得住'],
    quote: '我没忘，我只是夜里才回。',
  },
  {
    slug: 'shadow-neutral-midline-lighthouse',
    name: '中线灯塔',
    code: 'SHADOW-NEUTRAL',
    accentColor: '#B6CFD6',
    tagline: '你的潜意识比大多数人安静。',
    visualConcept: 'A pale gray-blue planet with a tall lighthouse beam rotating slowly across its surface, calm steady mood, minimal stars.',
    toneTags: ['默认平静', '低噪音', '稳定走神'],
    quote: '我没有特别想说的，也没什么不想说的。',
  },
  {
    slug: 'shadow-anchor-b-zero-workshop',
    name: '归零工坊',
    code: 'SHADOW-ANCHOR-B',
    accentColor: '#9FB69E',
    tagline: '一旦没事做，你的大脑会真的休息。',
    visualConcept: 'A muted olive-green planet with a clean workshop interior visible through cutaway, tools neatly racked, white walls, very orderly.',
    toneTags: ['真休息', '关灯式', '低想象'],
    quote: '我不是麻木，我是真的会下班。',
  },
  {
    slug: 'shadow-anchor-a-deep-archive',
    name: '深井档案室',
    code: 'SHADOW-ANCHOR-A',
    accentColor: '#5C6675',
    tagline: '你的脑子是个有秩序的硬盘。',
    visualConcept: 'A dark slate planet with a vertical shaft going deep into its core, rows of glowing index cards lining the shaft walls, archival sci-fi atmosphere.',
    toneTags: ['结构化', '抗噪', '深度归档'],
    quote: '别问我感觉，我先给你版本号。',
  },
];

// ───────────────────────── 入口：把所有 prompt 打平为 RunningHub 可消费列表
export function buildAllGalaxyPrompts() {
  const out = [];
  for (const p of HOME_PLANETS) out.push({ slug: p.slug, prompt: buildGalaxyPlanetPrompt({ category: 'home', ...p }) });
  for (const p of MOON_PLANETS) out.push({ slug: p.slug, prompt: buildGalaxyPlanetPrompt({ category: 'moon', ...p }) });
  for (const p of SHADOW_PLANETS) out.push({ slug: p.slug, prompt: buildGalaxyPlanetPrompt({ category: 'shadow', ...p }) });
  return out;
}

// 命令行预览：node scripts/galaxy-planet-prompts.mjs | head -n 80
if (import.meta.url === `file://${process.argv[1]}`) {
  const all = buildAllGalaxyPrompts();
  console.log(`# Generated ${all.length} galaxy planet prompts\n`);
  for (const item of all) {
    console.log(`## ${item.slug}\n`);
    console.log(item.prompt);
    console.log('\n---\n');
  }
}
