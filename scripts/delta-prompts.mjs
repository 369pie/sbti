export const DELTA_SERIES_LABEL = '三角TI 战区宇宙';

// ─── STYLE: Inflatable Vinyl Toy × Delta Force Operator Archetypes ───
// 同源充气手办材质体系，角色参考切换为三角洲行动干员 + 战术行为模式映射。
// 网站用图：纯角色插画（无文字），文字由前端代码叠加
const DELTA_VINYL_STYLE =
  'An inflatable oversized vinyl toy figure, shiny smooth PVC plastic surface with glossy reflections and subtle seam lines where inflatable sections meet. ' +
  'The character has soft bulging proportions of a large air-filled balloon figure — chunky rounded limbs, slightly oversized head, everything looks pumped full of air. ' +
  'Smooth glossy plastic skin with bright highlight reflections. The material is clearly shiny inflatable vinyl/PVC, NOT matte, NOT fabric, NOT clay, NOT realistic skin. ' +
  'Vertical 3:4 format. Clean solid-color studio background with soft even lighting emphasizing the glossy vinyl surface reflections. ' +
  'Character centered, occupying roughly 60-70% of frame height, with clean space at top and bottom for text overlay later.';

const DELTA_VINYL_TONE =
  'A collectible designer toy figure for a social-media personality atlas, mapping modern military tactical shooter operator cues to modern gamer personality stereotypes. ' +
  'Each character should feel recognizably inspired by a Delta Force tactical operator or FPS player archetype while reading first as a specific gamer personality type. ' +
  'Use signature silhouette cues: tactical gear, body armor, helmets, goggles, comms equipment, weapon attachments, military accessories, operator patches, and faction color palettes. ' +
  'Two factions provide visual variety: GTI operators (clean, high-tech, blue-steel tones) and Haavk operators (rugged, weathered, earth-amber tones). ' +
  'Aim for "I want to collect all of them" energy, like a designer toy blind box series of cute-but-deadly tactical figures.';

const DELTA_VINYL_RULES =
  'Single character figure on clean studio background. Full body or three-quarter body, centered composition. ' +
  'Small inflatable accessories and props should float nearby or be held by the character — mixing tactical military items with modern gaming props (controller, energy drink, snack, phone), all in inflatable vinyl material. ' +
  'Keep 2-3 props maximum, do not clutter. Background should be a single clean color or simple gradient that complements the character palette. ' +
  'Military color palette emphasis: olive drab, gunmetal, sand camo, tactical black, warning orange. ' +
  'ABSOLUTELY ZERO TEXT of any kind in the image. No letters, no words, no captions, no labels, no Chinese characters, no English text, no numbers as text, no UI elements.';

const DELTA_VINYL_NEGATIVE =
  'negative prompt: text, typography, letters, words, Chinese characters, English words, numbers as labels, caption, title, label, watermark, logo, ' +
  'realistic human, photograph, low poly, flat 2D illustration, anime, cartoon drawing, matte surface, fabric texture, clay, knitted, paper craft, ' +
  'complex background, busy scene, multiple characters, horror, violent, ugly, deformed';

export const DELTA_TYPES = [
  // ── 干员映射 (16) ──
  {
    slug: 'boss',
    heroName: '战术指挥部',
    heroRef: 'Shepherd',
    concept:
      'An inflatable vinyl toy figure of a veteran tactical squad leader. ' +
      'Shiny PVC olive-drab and gunmetal heavy tactical vest with multiple radio pouches, headset microphone curved near the mouth. ' +
      'One puffy hand holds a tiny inflatable tactical tablet showing a map, the other points forward in a commanding gesture. ' +
      'Stern focused gaze softened by comical balloon proportions, the "I already planned the whole op" energy. ' +
      'Floating inflatable props: a puffy vinyl comms headset, a shiny PVC minimap hologram, a tiny balloon whiteboard with arrows. ' +
      'Clean dark olive studio background. Palette: olive drab, gunmetal gray, muted gold accents.',
  },
  {
    slug: 'nerd',
    heroName: '武器百科全书',
    heroRef: 'Sineva',
    concept:
      'An inflatable vinyl toy figure of a meticulous military engineer obsessed with weapon specs. ' +
      'Shiny PVC navy blue and silver tactical engineer overalls, tool pouches everywhere, safety goggles pushed up on forehead. ' +
      'One puffy hand holds a tiny inflatable weapon blueprint scroll, the other adjusts a disassembled rifle part. ' +
      'Intense studious expression, like someone reciting bullet velocity stats mid-firefight. ' +
      'Floating inflatable props: a puffy vinyl ammunition chart, a shiny PVC weapon mod catalog, a tiny balloon scope lens. ' +
      'Clean steel-blue studio background. Palette: navy blue, brushed silver, tactical gray.',
  },
  {
    slug: 'ctrl',
    heroName: '推进永动机',
    heroRef: 'Tempest',
    concept:
      'An inflatable vinyl toy figure of a relentless assault operator who never stops pushing. ' +
      'Shiny PVC dark charcoal and warning-orange tactical armor, streamlined helmet with tinted visor. ' +
      'Aggressive forward-leaning stance, one puffy foot already stepping ahead, rifle shouldered and ready. ' +
      'Expression: laser-focused intensity, the kind of player who clears rooms before teammates even enter the building. ' +
      'Floating inflatable props: a puffy vinyl stopwatch reading "00:03", a shiny PVC breach charge, a tiny balloon checkpoint flag. ' +
      'Clean charcoal-orange gradient studio background. Palette: dark charcoal, warning orange, matte black.',
  },
  {
    slug: 'mum',
    heroName: '战地奶妈',
    heroRef: 'Vlinder',
    concept:
      'An inflatable vinyl toy figure of a combat medic who heals everyone but herself. ' +
      'Shiny PVC white and olive medical tactical vest with red cross patches, utility belt stuffed with med kits. ' +
      'Both puffy hands reaching outward in a healing gesture, slightly hunched from carrying too much support gear. ' +
      'Warm tired eyes — clearly been reviving teammates for the 15th time this round. ' +
      'Floating inflatable props: a puffy vinyl first-aid kit, a shiny PVC defibrillator, a tiny balloon HP bar at 15%. ' +
      'Clean soft olive-white studio background. Palette: medic white, olive, red cross accents.',
  },
  {
    slug: 'simp',
    heroName: '工具人小兵',
    heroRef: 'Branko',
    concept:
      'An inflatable vinyl toy figure of a heavy-duty support operator loaded down with team supplies. ' +
      'Shiny PVC tan and brown heavy-kit tactical gear, big backpack overflowing with ammo boxes and supply crates. ' +
      'Slightly bowing forward from the weight, eager-to-please expression, both puffy arms carrying resupply packs. ' +
      'Floating inflatable props: a puffy vinyl ammo crate, a shiny PVC "Need supplies?" speech bubble, a tiny balloon thumbs-up badge. ' +
      'Clean warm tan studio background. Palette: sand tan, warm brown, utility olive.',
  },
  {
    slug: 'solo',
    heroName: '独狼渗透者',
    heroRef: 'D-Wolf',
    concept:
      'An inflatable vinyl toy figure of a lone-wolf infiltrator who works alone. ' +
      'Shiny PVC matte black and dark gray stealth tactical suit, balaclava half-pulled, suppressed pistol in one hand. ' +
      'Cool detached stance, slightly turned away from viewer as if about to disappear into shadows. ' +
      'Floating inflatable props: a puffy vinyl "Squad invite declined" notification, a shiny PVC silencer attachment, a tiny balloon lone-wolf patch. ' +
      'Clean deep charcoal studio background. Palette: stealth black, dark gray, midnight blue accents.',
  },
  {
    slug: 'rebel',
    heroName: '不听指挥专业户',
    heroRef: 'Nox',
    concept:
      'An inflatable vinyl toy figure of a rogue operator who ignores every order. ' +
      'Shiny PVC dark red and black aggressive tactical gear with skull patches, visor cracked and pushed sideways. ' +
      'Arms crossed defiantly, chin tilted up in a "watch me" expression, standing opposite to the team\'s direction. ' +
      'Floating inflatable props: a puffy vinyl broken comms earpiece, a shiny PVC crossed-out order clipboard, a tiny balloon "Going solo" icon. ' +
      'Clean dark crimson studio background. Palette: dark red, tactical black, warning yellow accents.',
  },
  {
    slug: 'oh-no',
    heroName: '战场预言家',
    heroRef: 'Hackclaw',
    concept:
      'An inflatable vinyl toy figure of a recon hacker who always sees the ambush coming. ' +
      'Shiny PVC dark teal and cyber-green tactical hoodie under light armor, glowing HUD visor over one eye. ' +
      'One puffy hand raised in a "stop" warning gesture, the other holds a tiny inflatable drone controller. ' +
      'Expression: the tired patience of someone who warned the team three times before the wipe. ' +
      'Floating inflatable props: a puffy vinyl surveillance drone, a shiny PVC enemy radar ping, a tiny balloon "I told you" sign. ' +
      'Clean dark teal studio background. Palette: dark teal, cyber green, charcoal.',
  },
  {
    slug: 'thin-k',
    heroName: '配装困难症',
    heroRef: 'Gizmo',
    concept:
      'An inflatable vinyl toy figure of a gadget-obsessed engineer paralyzed by loadout choices. ' +
      'Shiny PVC khaki and copper tactical engineer vest covered in tool slots, goggles on forehead, chin-stroking pose. ' +
      'Surrounded by floating weapon attachments and gadget options, unable to pick, two puffy hands holding different guns comparing them. ' +
      'Floating inflatable props: a puffy vinyl loadout screen hologram, a shiny PVC spinning question mark, a tiny balloon timer running out. ' +
      'Clean warm khaki studio background. Palette: khaki, copper, utility gray.',
  },
  {
    slug: 'drama',
    heroName: '上头突击兵',
    heroRef: 'Vyron',
    concept:
      'An inflatable vinyl toy figure of an assault operator who gets emotionally invested in every fight. ' +
      'Shiny PVC bright red and gunmetal aggressive assault armor, helmet off and gripped in one hand, face flushed with intensity. ' +
      'Dynamic forward-charging pose, mouth open mid-battle-cry, made comical by the puffy balloon proportions. ' +
      'Floating inflatable props: a puffy vinyl explosion effect, a shiny PVC broken rage meter, a tiny balloon "PUSH NOW" banner. ' +
      'Clean aggressive red studio background. Palette: bright red, gunmetal, dark iron.',
  },
  {
    slug: 'emo',
    heroName: '极限拉枪王',
    heroRef: 'Stinger',
    concept:
      'An inflatable vinyl toy figure of a precision support gunner who always takes insane risks. ' +
      'Shiny PVC ice-blue and silver light tactical gear, sniper-style scope visor, tense crouched position. ' +
      'One puffy hand steadies a long-range rifle, the other clenches tight — the "one more shot" mentality personified. ' +
      'Floating inflatable props: a puffy vinyl crosshair scope, a shiny PVC bullet trajectory line, a tiny balloon heart-rate monitor spiking. ' +
      'Clean cool ice-blue studio background. Palette: ice blue, silver, steel gray.',
  },
  {
    slug: 'atm-er',
    heroName: '人肉沙袋',
    heroRef: 'Uluru',
    concept:
      'An inflatable vinyl toy figure of a massive heavy-armor operator who absorbs all the damage. ' +
      'Shiny PVC dark bronze and olive heavy ballistic armor, extra-large puffy build — the biggest figure in the series. ' +
      'Shield raised in one hand, standing firm with visible dent marks and bullet pock marks on the vinyl surface. ' +
      'Stoic resigned expression, arms spread wide in a protective barrier stance. ' +
      'Floating inflatable props: a puffy vinyl cracked riot shield, a shiny PVC damage counter "99999", a tiny balloon medal for "Most Hit". ' +
      'Clean dark bronze studio background. Palette: dark bronze, heavy olive, iron gray.',
  },
  {
    slug: 'sexy',
    heroName: '蹲点大师',
    heroRef: 'Luna',
    concept:
      'An inflatable vinyl toy figure of a patient recon sniper who camps with lethal elegance. ' +
      'Shiny PVC muted purple and dark silver stealth sniper suit, ghillie hood draped loosely, one eye looking through a scope. ' +
      'Relaxed crouching pose, completely still, the kind of operator you never see until it\'s too late. ' +
      'Floating inflatable props: a puffy vinyl "5 mins without moving" timer, a shiny PVC crosshair, a tiny balloon camouflage bush. ' +
      'Clean muted purple-gray studio background. Palette: muted purple, dark silver, shadow gray.',
  },
  {
    slug: 'luck-y',
    heroName: '盲狙欧皇',
    heroRef: 'Raptor',
    concept:
      'An inflatable vinyl toy figure of a wildly lucky recon operator who hits impossible shots. ' +
      'Shiny PVC bright amber and white tactical recon gear, rakish beret tilted at a cocky angle, confident grin with a wink. ' +
      'One puffy hand casually hip-firing a sniper rifle, the other doing a peace sign — pure luck energy. ' +
      'Floating inflatable props: a puffy vinyl "HEADSHOT" popup, a shiny PVC four-leaf clover scope charm, a tiny balloon dice showing all sixes. ' +
      'Clean bright amber studio background. Palette: bright amber, clean white, lucky gold.',
  },
  {
    slug: 'shy',
    heroName: '静音潜行者',
    heroRef: 'Morse',
    concept:
      'An inflatable vinyl toy figure of a silent communications operator who barely speaks. ' +
      'Shiny PVC muted gray-green and dark navy minimal tactical gear, high collar covering half the face, compact build. ' +
      'Hunched posture trying to be invisible, eyes averted, one hand holds a tiny inflatable signal jammer. ' +
      'Floating inflatable props: a puffy vinyl muted microphone icon, a shiny PVC encrypted message screen, a tiny balloon "..." speech bubble. ' +
      'Clean misty gray-green studio background. Palette: muted gray-green, dark navy, soft silver.',
  },
  {
    slug: 'woc',
    heroName: '战场旁观者',
    heroRef: 'Toxik',
    concept:
      'An inflatable vinyl toy figure of a support operator who watches everything unfold with detached commentary. ' +
      'Shiny PVC sandy brown and military green tactical observer gear, binoculars hanging around neck, notepad in hand. ' +
      'Relaxed leaning pose, not engaging the fight, just watching teammates wipe with a slight smirk. ' +
      'Floating inflatable props: a puffy vinyl popcorn bucket (tactical camo pattern), a shiny PVC binoculars, a tiny balloon "LOL" reaction icon. ' +
      'Clean sandy studio background. Palette: sandy brown, military green, warm khaki.',
  },

  // ── 行为模式映射 (13) ──
  {
    slug: 'sleep',
    heroName: '据点睡神',
    heroRef: '行为模式',
    concept:
      'An inflatable vinyl toy figure of a guard who fell asleep at their post. ' +
      'Shiny PVC olive drab and gray rumpled tactical gear, helmet tilted over eyes, body slumped against an inflatable sandbag wall. ' +
      'Completely asleep, tiny "zzz" clouds floating up, rifle propped loosely against the wall beside them. ' +
      'Floating inflatable props: a puffy vinyl alarm clock reading 03:00, a shiny PVC unfinished guard-duty checklist, a tiny balloon pillow. ' +
      'Clean sleepy dusk-gray studio background. Palette: muted olive, drowsy gray, soft blue.',
  },
  {
    slug: 'game-r',
    heroName: '匹配永动机',
    heroRef: '行为模式',
    concept:
      'An inflatable vinyl toy figure of an operator who hits "Ready" again the instant a match ends. ' +
      'Shiny PVC dark gunmetal and electric-green tactical gear, wired-up and ready, finger hovering over a puffy "READY" button. ' +
      'Wide-awake intense stare, surrounded by empty energy drink cans rendered in glossy vinyl. ' +
      'Floating inflatable props: a puffy vinyl glowing "MATCH FOUND" popup, a shiny PVC broken alarm clock, a tiny balloon match-counter showing "47". ' +
      'Clean electric-green studio background. Palette: dark gunmetal, electric green, energized yellow.',
  },
  {
    slug: 'drunk',
    heroName: '午夜行动组',
    heroRef: '行为模式',
    concept:
      'An inflatable vinyl toy figure of a late-night gamer operator, half-drunk and still queuing. ' +
      'Shiny PVC midnight-blue and amber rumpled tactical hoodie over loosened body armor, headset slightly askew. ' +
      'One puffy hand holds a tiny inflatable beer bottle, the other lazily grips a controller. Droopy happy grin. ' +
      'Floating inflatable props: a puffy vinyl clock showing 3 AM, a shiny PVC party hat with tactical camo print, a tiny balloon chat message "one more game?". ' +
      'Clean midnight-blue studio background. Palette: midnight blue, warm amber, hazy purple.',
  },
  {
    slug: 'chill',
    heroName: '佛系步兵',
    heroRef: '行为模式',
    concept:
      'An inflatable vinyl toy figure of a completely unbothered operator who barely tries. ' +
      'Shiny PVC light sage-green and cream casual-tactical hybrid gear, sleeves rolled up, rifle slung loosely over one shoulder. ' +
      'Relaxed leaning pose, one hand in pocket, half-closed eyes radiating "win or lose, same to me" energy. ' +
      'Floating inflatable props: a puffy vinyl tea cup, a shiny PVC scoreboard showing middle rank, a tiny balloon shrug emoji. ' +
      'Clean calm sage-green studio background. Palette: light sage, cream, warm beige.',
  },
  {
    slug: 'dior-s',
    heroName: '撤离观光客',
    heroRef: '行为模式',
    concept:
      'An inflatable vinyl toy figure of an operator who plays extraction mode like a sightseeing tour. ' +
      'Shiny PVC sand-yellow and tourist-blue light tactical vest with a camera hanging around the neck. ' +
      'Standing casually taking photos of the warzone, completely ignoring objectives, big relaxed smile. ' +
      'Floating inflatable props: a puffy vinyl tourist camera, a shiny PVC extraction helicopter being ignored, a tiny balloon selfie stick. ' +
      'Clean sandy-yellow studio background. Palette: sand yellow, tourist blue, warm cream.',
  },
  {
    slug: 'fake',
    heroName: '双面特工',
    heroRef: '行为模式',
    concept:
      'An inflatable vinyl toy figure depicting a two-faced spy operator — polite in team chat, toxic in DMs. ' +
      'Shiny PVC split down the middle: one side clean white tactical gentleman, the other side dark tactical shadow. ' +
      'One puffy hand holds a friendly thumbs-up, the other hides a tiny inflatable dagger behind the back. ' +
      'Floating inflatable props: a puffy vinyl happy mask and angry mask, a shiny PVC split personality mirror, a tiny balloon chat with conflicting messages. ' +
      'Clean split white/charcoal studio background. Palette: clean white, shadow charcoal, spy red accent.',
  },
  {
    slug: 'malo',
    heroName: '赛季苦工',
    heroRef: '行为模式',
    concept:
      'An inflatable vinyl toy figure of an exhausted operator grinding battle pass missions. ' +
      'Shiny PVC worn military-green and fatigue-gray tactical gear covered in mud and scratches. ' +
      'Slumped but still standing, dark circles visible on puffy face, holding a season pass card in one hand. ' +
      'Floating inflatable props: a puffy vinyl progress bar at 87%, a shiny PVC calendar with every day X-ed out, a tiny balloon coffee IV drip. ' +
      'Clean tired olive-gray studio background. Palette: worn military green, fatigue gray, dull bronze.',
  },
  {
    slug: 'joker',
    heroName: '快乐战损',
    heroRef: '行为模式',
    concept:
      'An inflatable vinyl toy figure of an operator who dies constantly but never stops laughing. ' +
      'Shiny PVC bright orange and yellow chaotic tactical gear covered in band-aids and comedy camo patches. ' +
      'Big goofy grin despite visible vinyl surface damage, arms spread wide in a "worth it!" gesture. ' +
      'Floating inflatable props: a puffy vinyl "KIA x47" dog tag, a shiny PVC clown nose in tactical olive, a tiny balloon party popper. ' +
      'Clean cheerful orange studio background. Palette: bright orange, happy yellow, camo green accents.',
  },
  {
    slug: 'party',
    heroName: '全服社牛',
    heroRef: '行为模式',
    concept:
      'An inflatable vinyl toy figure of the server\'s loudest social butterfly operator. ' +
      'Shiny PVC vibrant red and gold flashy tactical gear with speaker attachments on the shoulders. ' +
      'Both puffy arms raised in a hype-man pose, mouth wide open rallying the lobby, maximum extrovert energy. ' +
      'Floating inflatable props: a puffy vinyl megaphone, a shiny PVC friend-request flood notification, a tiny balloon fireworks burst. ' +
      'Clean vibrant red-gold studio background. Palette: vibrant red, gold, warm white.',
  },
  {
    slug: 'than-k',
    heroName: '背锅特种兵',
    heroRef: '行为模式',
    concept:
      'An inflatable vinyl toy figure of an operator who takes the blame for every team wipe. ' +
      'Shiny PVC muted blue-gray and silver sincere-looking tactical gear, one hand on chest in apology gesture. ' +
      'Slight bow posture, earnest eyes, wearing a "My fault" armband patch on one puffy arm. ' +
      'Floating inflatable props: a puffy vinyl blame arrow pointing at them, a shiny PVC apology letter, a tiny balloon loyal-teammate medal. ' +
      'Clean cool blue-gray studio background. Palette: muted blue-gray, silver, soft white.',
  },
  {
    slug: 'love-r',
    heroName: '换枪成瘾',
    heroRef: '行为模式',
    concept:
      'An inflatable vinyl toy figure of an operator addicted to switching weapons every match. ' +
      'Shiny PVC bright teal and chrome flashy tactical gear, surrounded by a rotating carousel of different guns. ' +
      'Starry-eyed excited expression, both puffy hands reaching for different weapons, unable to commit. ' +
      'Floating inflatable props: a puffy vinyl weapon wheel spinning, a shiny PVC "NEW GUN" sparkle badge, a tiny balloon shopping cart full of attachments. ' +
      'Clean bright teal studio background. Palette: bright teal, chrome, electric blue.',
  },
  {
    slug: 'food-ie',
    heroName: '边打边吃',
    heroRef: '行为模式',
    concept:
      'An inflatable vinyl toy figure of an operator eating snacks mid-combat. ' +
      'Shiny PVC warm brown and olive casual-tactical gear, one cheek puffed with food, crumbs on the tactical vest. ' +
      'One puffy hand holds a rifle loosely, the other clutches a bag of chips. Eyes squinting happily mid-chew. ' +
      'Floating inflatable props: a puffy vinyl takeout box, floating shiny PVC cup noodles, a tiny balloon energy bar wrapper. ' +
      'Clean warm brown studio background. Palette: warm brown, snack-pack orange, olive drab.',
  },
  {
    slug: 'talk-er',
    heroName: '全频道广播',
    heroRef: '行为模式',
    concept:
      'An inflatable vinyl toy figure of an operator who never stops talking on comms. ' +
      'Shiny PVC bold iron-gray and signal-yellow tactical gear with an oversized microphone headset. ' +
      'Mouth wide open mid-callout, one puffy hand pressing the comms button, the other gesturing wildly. ' +
      'Floating inflatable props: a puffy vinyl sound-wave blast, a shiny PVC overflowing chat log, a tiny balloon "MUTE" button that nobody presses. ' +
      'Clean bold iron-yellow studio background. Palette: iron gray, signal yellow, dark charcoal.',
  },
];

export function buildDeltaPrompt(entry) {
  return [
    DELTA_VINYL_STYLE,
    DELTA_VINYL_TONE,
    entry.concept,
    DELTA_VINYL_RULES,
    DELTA_VINYL_NEGATIVE,
  ].join('\n\n');
}

// Quick-access: generate all prompts
export function getAllDeltaPrompts() {
  return DELTA_TYPES.map(entry => ({
    slug: entry.slug,
    heroName: entry.heroName,
    heroRef: entry.heroRef,
    prompt: buildDeltaPrompt(entry),
  }));
}
