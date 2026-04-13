export const KINGS_SERIES_LABEL = '王者TI 峡谷宇宙';

// ─── STYLE: Inflatable Vinyl Toy × Honor of Kings Archetypes ───
// 同源充气手办材质体系，角色参考切换为王者荣耀英雄气质映射。
// 网站用图：纯角色插画（无文字），文字由前端代码叠加
const KINGS_VINYL_STYLE =
  'An inflatable oversized vinyl toy figure, shiny smooth PVC plastic surface with glossy reflections and subtle seam lines where inflatable sections meet. ' +
  'The character has soft bulging proportions of a large air-filled balloon figure — chunky rounded limbs, slightly oversized head, everything looks pumped full of air. ' +
  'Smooth glossy plastic skin with bright highlight reflections. The material is clearly shiny inflatable vinyl/PVC, NOT matte, NOT fabric, NOT clay, NOT realistic skin. ' +
  'Vertical 3:4 format. Clean solid-color studio background with soft even lighting emphasizing the glossy vinyl surface reflections. ' +
  'Character centered, occupying roughly 60-70% of frame height, with clean space at top and bottom for text overlay later.';

const KINGS_VINYL_TONE =
  'A collectible designer toy figure for a social-media personality atlas, mapping iconic Honor of Kings (王者荣耀) hero character cues to modern gaming personality stereotypes. ' +
  'Each character should feel recognizably inspired by a classic Chinese hero/historical figure while reading first as a specific gamer personality archetype. ' +
  'Use signature silhouette cues, weapons, armor, hair styles, color palettes and character attitudes so fans get the reference immediately, but keep the final image as an original collectible toy illustration. ' +
  'Aim for "I want to collect all of them" energy, like a designer toy blind box series.';

const KINGS_VINYL_RULES =
  'Single character figure on clean studio background. Full body or three-quarter body, centered composition. ' +
  'Small inflatable accessories and props should float nearby or be held by the character — mixing ancient Chinese warrior/mage items with modern gaming props (controllers, phone, snacks, energy drink), all in inflatable vinyl material. ' +
  'Keep 2-3 props maximum, do not clutter. Background should be a single clean color or simple gradient that complements the character palette. ' +
  'ABSOLUTELY ZERO TEXT of any kind in the image. No letters, no words, no captions, no labels, no Chinese characters, no English text, no numbers as text, no UI elements.';

const KINGS_VINYL_NEGATIVE =
  'negative prompt: text, typography, letters, words, Chinese characters, English words, numbers as labels, caption, title, label, watermark, logo, ' +
  'realistic human, photograph, low poly, flat 2D illustration, anime, cartoon drawing, matte surface, fabric texture, clay, knitted, paper craft, ' +
  'complex background, busy scene, multiple characters, horror, violent, ugly, deformed';

export const KINGS_TYPES = [
  // ── 首发 8 张 ──
  {
    slug: 'boss',
    heroName: '峡谷指挥官',
    heroRef: '曹操',
    concept:
      'An inflatable vinyl toy figure inspired by a powerful ancient Chinese warlord general. ' +
      'Shiny PVC dark crimson and gold armor, puffed up with air, with a sweeping dark cape rendered in glossy vinyl. ' +
      'Strong square jaw, fierce commanding gaze softened by balloon proportions. ' +
      'One puffy hand holds a tiny inflatable broadsword pointing forward (commanding charge), the other holds a shiny PVC battle flag. ' +
      'Floating inflatable props: a puffy vinyl gaming headset with microphone, a shiny PVC mini map tablet, a tiny balloon strategy scroll. ' +
      'Clean warm dark red studio background. Palette: dark crimson, burnished gold, charcoal black.',
  },
  {
    slug: 'simp',
    heroName: '送人头天使',
    heroRef: '妲己',
    concept:
      'An inflatable vinyl toy figure inspired by a cute fox-spirit enchantress from Chinese mythology. ' +
      'Shiny PVC pink-purple flowing dress puffed with air, fluffy fox ear accessories rendered in glossy vinyl. ' +
      'Oversized sparkly eyes gazing upward with an eager-to-please expression, small heart-shaped blush on puffy cheeks. ' +
      'Both puffy hands clasped together in a pleading/offering gesture, slightly bowing forward. ' +
      'Floating inflatable props: a tiny glowing pink heart, a puffy vinyl approval stamp, a small bubble tea cup in shiny PVC. ' +
      'Clean soft pink-lavender gradient studio background. Palette: pink-purple, soft lavender, warm cream.',
  },
  {
    slug: 'thin-k',
    heroName: '出装困难症',
    heroRef: '司马懿',
    concept:
      'An inflatable vinyl toy figure inspired by a scheming ancient Chinese dark strategist/advisor. ' +
      'Shiny PVC deep purple and shadow-black robes, hood partially up casting dramatic shadows on the glossy vinyl face. ' +
      'Furrowed brow in deep calculation, one finger on chin in classic thinking pose — made comical by puffy balloon proportions. ' +
      'One puffy hand holds a tiny inflatable scroll covered in strategy diagrams, the other strokes chin uncertainly. ' +
      'Floating inflatable props: a hovering vinyl equipment shop menu screen, spinning question marks in shiny PVC, a tiny deflated hourglass. ' +
      'Clean deep indigo studio background. Palette: deep purple, midnight blue, silver accents.',
  },
  {
    slug: 'rebel',
    heroName: '秒选狂魔',
    heroRef: '韩信',
    concept:
      'An inflatable vinyl toy figure inspired by a legendary Chinese rogue general with a long spear. ' +
      'Shiny PVC ice-blue and silver armor, swept-back hair rendered in glossy vinyl, cocky confident smirk. ' +
      'Relaxed angular stance — one puffy foot forward as if already charging in, spear casually over one shoulder. ' +
      'Expression: confident to the point of arrogance, made funnier by the puffy balloon proportions. ' +
      'Floating inflatable props: a puffy vinyl hero-select lock icon (glowing red), a shiny PVC broken "fill position" sign, a tiny balloon jungle monster. ' +
      'Clean cool ice-blue studio background. Palette: ice blue, silver, dark navy accents.',
  },
  {
    slug: 'joker',
    heroName: '输了还在笑',
    heroRef: '鲁班七号',
    concept:
      'An inflatable vinyl toy figure inspired by a tiny cute inventor boy with mechanical bird companion. ' +
      'Shiny PVC bright orange overalls puffed with air, oversized goggles pushed up on forehead in glossy vinyl. ' +
      'Big cheerful grin despite visible bandages and comedic damage marks on the puffy body. Tiny proportions — the smallest figure in the series. ' +
      'One puffy hand waves happily, the other tries to hold together a cracked shiny PVC mechanical bird. ' +
      'Floating inflatable props: a shiny vinyl speech bubble with "稳住" crossed out, puffy gears and screws, a tiny balloon thumbs-up sign. ' +
      'Clean bright warm yellow studio background. Palette: cheerful orange, warm yellow, steel blue accents.',
  },
  {
    slug: 'drunk',
    heroName: '深夜开黑王',
    heroRef: '李白',
    concept:
      'An inflatable vinyl toy figure inspired by a romantic wandering swordsman poet in flowing white robes, from Chinese mythology. ' +
      'Shiny PVC moon-white and pale blue flowing robes billowing with air, elegant long hair rendered in glossy vinyl. ' +
      'Eyes half-closed in a dreamy/tipsy expression, a serene smile — the kind of beauty that comes from not caring. ' +
      'One puffy hand holds a tiny inflatable moonlit sword elegantly, the other cradles a shiny PVC wine gourd. ' +
      'Floating inflatable props: a puffy vinyl crescent moon, a glowing phone screen showing "3:00 AM", a tiny balloon party invite. ' +
      'Clean misty moonlit blue studio background. Palette: moon white, pale ice blue, silver, touch of warm gold.',
  },
  {
    slug: 'dior-s',
    heroName: '峡谷观光客',
    heroRef: '刘禅',
    concept:
      'An inflatable vinyl toy figure inspired by a chubby lazy young prince riding a giant panda mount. ' +
      'Shiny PVC bright imperial yellow and white robes loose and untucked, a tiny crown sitting crooked on puffy round head. ' +
      'Sitting sideways on a chunky inflatable panda companion, completely relaxed, legs dangling. ' +
      'Expression: completely unbothered, half-smile, eyes slightly droopy with peaceful laziness. ' +
      'Floating inflatable props: a puffy vinyl scenic camera/selfie stick, a shiny PVC tourist hat, a tiny balloon "Away from keyboard" sign. ' +
      'Clean soft sage green studio background. Palette: imperial yellow, cream white, panda black-white, soft sage.',
  },
  {
    slug: 'food-ie',
    heroName: '边打边吃',
    heroRef: '猪八戒',
    concept:
      'An inflatable vinyl toy figure inspired by a lovable rotund pig warrior from Chinese mythology Journey to the West. ' +
      'Shiny PVC warm brown and olive armor stretched over an extra-puffy belly (even more inflated than other figures). Big floppy pig ears in glossy vinyl. ' +
      'One cheek puffed out with food, eyes squinting happily in mid-chew satisfaction. ' +
      'One puffy hand holds a tiny inflatable nine-tooth rake weapon, the other clutches a shiny PVC steaming bun / bowl of noodles. ' +
      'Floating inflatable props: a puffy vinyl takeout bag, floating shiny PVC dumplings, a tiny balloon energy drink can. ' +
      'Clean warm honey-brown studio background. Palette: warm brown, olive, cream, rosy cheek accents.',
  },

  // ── 第二批 21 张 ──
  {
    slug: 'nerd',
    heroName: '峡谷百科',
    heroRef: '诸葛亮',
    concept:
      'An inflatable vinyl toy figure inspired by a brilliant ancient Chinese strategist with a feather fan. ' +
      'Shiny PVC deep indigo and gold scholar robes, a puffy tall scholar hat, elegant feather fan in one hand. ' +
      'Calm intellectual expression, eyes sharp and calculating behind glossy vinyl surface. ' +
      'Floating inflatable props: a puffy vinyl star chart / constellation map, a shiny PVC tier-list scroll, a tiny balloon strategy book. ' +
      'Clean deep navy studio background. Palette: deep indigo, gold, ivory.',
  },
  {
    slug: 'ctrl',
    heroName: '节奏怪',
    heroRef: '武则天',
    concept:
      'An inflatable vinyl toy figure inspired by a powerful ancient Chinese empress in imperial regalia. ' +
      'Shiny PVC rich purple and gold imperial robes, phoenix crown headpiece rendered in glossy vinyl. ' +
      'Stern authoritative expression, one hand raised in a global command gesture. ' +
      'Floating inflatable props: a puffy vinyl stopwatch, a shiny PVC minimap with pings, a tiny balloon efficiency chart. ' +
      'Clean regal purple studio background. Palette: imperial purple, burnished gold, deep crimson.',
  },
  {
    slug: 'mum',
    heroName: '峡谷老妈子',
    heroRef: '蔡文姬',
    concept:
      'An inflatable vinyl toy figure inspired by a gentle ancient Chinese musician healer girl with a guqin/zither. ' +
      'Shiny PVC soft pink and white flowing hanfu dress, hair in gentle buns with ribbon accessories in glossy vinyl. ' +
      'Warm caring expression, slightly tired eyes, both hands reaching outward as if healing someone. ' +
      'Floating inflatable props: a puffy vinyl healing circle glow, a shiny PVC guqin instrument, a tiny balloon first aid kit. ' +
      'Clean soft pink studio background. Palette: soft pink, cream white, gentle lavender.',
  },
  {
    slug: 'solo',
    heroName: '单机玩家',
    heroRef: '庄周',
    concept:
      'An inflatable vinyl toy figure inspired by a serene ancient Chinese philosopher riding a giant fish/whale. ' +
      'Shiny PVC teal and aqua flowing robes, peaceful meditation pose on a chunky inflatable koi/whale companion. ' +
      'Eyes closed in tranquil meditation, completely ignoring everything around. ' +
      'Floating inflatable props: puffy vinyl butterflies, a shiny PVC "Do Not Disturb" sign, a tiny balloon fishing rod. ' +
      'Clean serene teal studio background. Palette: teal, aqua, soft green, cream.',
  },
  {
    slug: 'sleep',
    heroName: '泉水常驻',
    heroRef: '嫦娥',
    concept:
      'An inflatable vinyl toy figure inspired by a ethereal moon goddess from Chinese mythology. ' +
      'Shiny PVC icy blue and silver flowing celestial robes, long flowing hair with a crescent headpiece in glossy vinyl. ' +
      'Eyes heavy-lidded and nearly closed, head tilted in a drowsy nap pose — sleepy even as a balloon toy. ' +
      'Floating inflatable props: a puffy vinyl moon rabbit sleeping, a shiny PVC crescent moon pillow, a tiny balloon "ZZZ" cloud. ' +
      'Clean cool moonlit lavender studio background. Palette: icy lavender, silver, pale blue, cool white.',
  },
  {
    slug: 'game-r',
    heroName: '排位永动机',
    heroRef: '铠',
    concept:
      'An inflatable vinyl toy figure inspired by a fierce dark-armored lone warrior with demonic energy. ' +
      'Shiny PVC dark gunmetal and crimson armor with glowing red cracks, intense determined eyes behind visor. ' +
      'Power stance, one hand gripping a massive inflatable dark sword, the other clenched in a fist. ' +
      'Floating inflatable props: a puffy vinyl "再来一把" battle banner, a shiny PVC rank badge, a tiny balloon broken alarm clock. ' +
      'Clean deep crimson-black studio background. Palette: gunmetal, dark crimson, black, ember glow.',
  },
  {
    slug: 'oh-no',
    heroName: '峡谷预言家',
    heroRef: '鬼谷子',
    concept:
      'An inflatable vinyl toy figure inspired by a mysterious masked ancient Chinese sage in dark robes. ' +
      'Shiny PVC deep purple-black flowing robes with mysterious rune patterns, half-face mask in glossy vinyl. ' +
      'One visible eye gleaming with knowing foresight, arms crossed in an "I told you so" pose. ' +
      'Floating inflatable props: a puffy vinyl all-seeing eye, a shiny PVC minimap with highlighted danger zones, a tiny balloon warning sign. ' +
      'Clean dark violet studio background. Palette: deep purple-black, dark violet, silver gleam.',
  },
  {
    slug: 'drama',
    heroName: '上头战士',
    heroRef: '甄姬',
    concept:
      'An inflatable vinyl toy figure inspired by a beautiful but emotionally volatile ancient Chinese sorceress of ice and water. ' +
      'Shiny PVC ice-blue and lavender flowing robes with swirling water/ice effects in glossy vinyl. ' +
      'Expression dramatically intense — between fury and tears — made comical by puffy balloon proportions. ' +
      'Floating inflatable props: puffy vinyl ice crystals mid-shatter, a shiny PVC broken heart, a tiny balloon rage emoji. ' +
      'Clean icy lavender studio background. Palette: ice blue, lavender purple, frost white, angry red accents.',
  },
  {
    slug: 'chill',
    heroName: '佛系上分',
    heroRef: '老夫子',
    concept:
      'An inflatable vinyl toy figure inspired by a wise old Chinese master/teacher with a walking staff. ' +
      'Shiny PVC earthy brown and beige scholar robes, long white beard rendered in smooth glossy vinyl, kind tired eyes. ' +
      'Relaxed leaning on a puffy walking staff, posture communicating "been there done that" calmness. ' +
      'Floating inflatable props: a puffy vinyl ancient book, a shiny PVC tea cup, a tiny balloon "差不多得了" scroll. ' +
      'Clean warm earth-tone studio background. Palette: earthy brown, warm beige, sage green, cream.',
  },
  {
    slug: 'emo',
    heroName: '越塔拼命三郎',
    heroRef: '貂蝉',
    concept:
      'An inflatable vinyl toy figure inspired by a beautiful tragic ancient Chinese dancing warrior woman. ' +
      'Shiny PVC deep rose and crimson dance robes flowing dynamically, elegant hair accessories in glossy vinyl. ' +
      'Mid-dance pose but leaning forward aggressively as if charging into danger, tearful yet determined eyes. ' +
      'Floating inflatable props: puffy vinyl rose petals and dance ribbons, a shiny PVC cracked mirror, a tiny balloon tower icon with danger sign. ' +
      'Clean dramatic rose studio background. Palette: deep rose, crimson, dusty pink, gold accents.',
  },
  {
    slug: 'atm-er',
    heroName: '人肉沙包',
    heroRef: '牛魔',
    concept:
      'An inflatable vinyl toy figure inspired by a massive bull demon warrior from Chinese mythology. ' +
      'Shiny PVC dark brown and iron-gray heavy armor, oversized horns rendered in glossy vinyl. Extra-large puffy build — the biggest figure in the series. ' +
      'Stoic resigned expression, arms spread wide in a protective shield stance, multiple dent marks visible on the vinyl surface. ' +
      'Floating inflatable props: a puffy vinyl cracked shield, a shiny PVC damage number "99999", a tiny balloon "MVP?" with a question mark. ' +
      'Clean dark bronze studio background. Palette: dark brown, iron gray, bronze, worn gold.',
  },
  {
    slug: 'sexy',
    heroName: '偷塔之王',
    heroRef: '西施',
    concept:
      'An inflatable vinyl toy figure inspired by a graceful ancient Chinese beauty with delicate lotus flower motifs. ' +
      'Shiny PVC soft pink and pearl-white flowing hanfu, gentle lotus accessories in glossy vinyl. ' +
      'Innocent expression with a mischievous glint in the eyes, tiptoeing sneakily on puffy feet. ' +
      'Floating inflatable props: puffy vinyl lotus petals as cover/camouflage, a shiny PVC crumbling tower model, a tiny balloon stealth icon. ' +
      'Clean soft peach studio background. Palette: soft pink, pearl white, peach, jade green accents.',
  },
  {
    slug: 'fake',
    heroName: '双面玩家',
    heroRef: '元歌',
    concept:
      'An inflatable vinyl toy figure inspired by a mysterious puppeteer controlling a duplicate marionette of himself. ' +
      'Shiny PVC deep violet and black theatrical robes, half-face visible with a sly grin, puppet strings connecting to a mini clone. ' +
      'The mini puppet version is slightly different (brighter, friendlier) creating a visual "two personalities" effect. ' +
      'Floating inflatable props: puffy vinyl puppet control cross, a shiny PVC theater mask (comedy/tragedy), a tiny balloon split personality icon. ' +
      'Clean deep violet-black studio background. Palette: deep violet, black, gold string accents, contrasting bright blue for puppet.',
  },
  {
    slug: 'malo',
    heroName: '赛季苦工',
    heroRef: '程咬金',
    concept:
      'An inflatable vinyl toy figure inspired by a tired but unkillable axe-wielding warrior from Chinese history. ' +
      'Shiny PVC military green and worn bronze armor, covered in battle scars rendered as glossy vinyl scratches. ' +
      'Exhausted expression, shoulders slumped, but still standing — the embodiment of "not dead yet". ' +
      'Floating inflatable props: a puffy vinyl health bar nearly empty but regenerating, a shiny PVC season pass card, a tiny balloon calendar with X marks. ' +
      'Clean tired olive-green studio background. Palette: military green, worn bronze, fatigue gray, dull red.',
  },
  {
    slug: 'luck-y',
    heroName: '天选之人',
    heroRef: '孙尚香',
    concept:
      'An inflatable vinyl toy figure inspired by a cheerful young warrior princess with dual crossbows. ' +
      'Shiny PVC bright red and gold war dress, energetic pose mid-tumble/dodge, hair flying with momentum in glossy vinyl. ' +
      'Lucky grin with a wink, dodging imaginary projectiles with effortless grace despite puffy proportions. ' +
      'Floating inflatable props: puffy vinyl arrows missing her by inches, a shiny PVC four-leaf clover, a tiny balloon "1% HP" survival badge. ' +
      'Clean lucky bright red studio background. Palette: bright red, gold, cream white, green accents.',
  },
  {
    slug: 'shy',
    heroName: '隐身辅助',
    heroRef: '明世隐',
    concept:
      'An inflatable vinyl toy figure inspired by a mysterious fortune-teller/diviner with a compass and talisman. ' +
      'Shiny PVC muted gray and white flowing robes, partially transparent/ghostly effect in the glossy vinyl material. ' +
      'Hunched posture trying to be invisible, eyes averted downward, one hand points a link tether toward an unseen ally. ' +
      'Floating inflatable props: a puffy vinyl divination compass, a shiny PVC invisibility cloak edge, a tiny balloon muted microphone icon. ' +
      'Clean misty gray studio background with extra empty space. Palette: muted gray, ghost white, soft silver, hint of teal.',
  },
  {
    slug: 'party',
    heroName: '全场MVP制造机',
    heroRef: '孙悟空',
    concept:
      'An inflatable vinyl toy figure inspired by the Monkey King from Journey to the West — golden armor, magic staff, cloud-riding. ' +
      'Shiny PVC bright gold and flame-red armor with tiger-skin accents, wild spiky hair rendered in glossy vinyl. ' +
      'Dynamic celebratory pose — mid-leap on a puffy cloud, staff spinning overhead, huge confident grin showing fangs. ' +
      'Floating inflatable props: a puffy vinyl golden crown/headband, a shiny PVC spinning Ruyi Jingu Bang staff, a tiny balloon fireworks burst. ' +
      'Clean vibrant gold-red studio background. Palette: bright gold, flame red, tiger orange, cloud white.',
  },
  {
    slug: 'than-k',
    heroName: '背锅侠',
    heroRef: '杨戬',
    concept:
      'An inflatable vinyl toy figure inspired by a loyal three-eyed divine warrior from Chinese mythology. ' +
      'Shiny PVC silver-blue and white celestial armor, third eye on forehead glowing subtly in glossy vinyl. ' +
      'Slight bow posture, one hand on chest in apologetic gesture, earnest faithful expression. ' +
      'Floating inflatable props: a puffy vinyl blame arrow pointing at him, a shiny PVC apology scroll, a tiny balloon loyal dog companion. ' +
      'Clean cool silver-blue studio background. Palette: silver-blue, celestial white, soft gold, touch of warm red.',
  },
  {
    slug: 'woc',
    heroName: '视野刺客',
    heroRef: '百里守约',
    concept:
      'An inflatable vinyl toy figure inspired by a lone desert sniper/marksman in military-style ancient Chinese gear. ' +
      'Shiny PVC sandy brown and military green tactical robes with a scope/eyepiece, half-face covered by a scarf in glossy vinyl. ' +
      'One eye visible through a sniper scope, relaxed prone-like leaning pose, observing rather than engaging. ' +
      'Floating inflatable props: a puffy vinyl telescope/scope, a shiny PVC popcorn bucket (watching the show), a tiny balloon ward/eye icon. ' +
      'Clean sandy desert studio background. Palette: sandy brown, military green, warm khaki, bronze.',
  },
  {
    slug: 'love-r',
    heroName: '一见钟情选手',
    heroRef: '公孙离',
    concept:
      'An inflatable vinyl toy figure inspired by a graceful dancing girl with a paper umbrella from Chinese opera aesthetics. ' +
      'Shiny PVC bright pink and cherry-blossom-white dance costume, twirling with a paper umbrella in glossy vinyl. ' +
      'Starry-eyed expression of fresh excitement, mid-spin dance move, surrounded by floating cherry petals. ' +
      'Floating inflatable props: puffy vinyl cherry blossom petals, a shiny PVC heart-shaped "NEW" badge, a tiny balloon hero rotating selector. ' +
      'Clean cherry blossom pink studio background. Palette: bright pink, cherry white, soft red, gold accents.',
  },
  {
    slug: 'talk-er',
    heroName: '全频道广播',
    heroRef: '张飞',
    concept:
      'An inflatable vinyl toy figure inspired by a massive bellowing warrior general from Chinese Three Kingdoms lore. ' +
      'Shiny PVC dark iron and black heavy armor, wild bristly beard rendered in glossy vinyl, mouth wide open mid-shout. ' +
      'Both puffy arms spread wide, head thrown back in a battle cry that looks comedical on a balloon toy. ' +
      'Floating inflatable props: a puffy vinyl sound wave blast, a shiny PVC megaphone/horn, a tiny balloon chat bubble overflowing with text. ' +
      'Clean bold dark iron studio background. Palette: dark iron, black, red accents, sound-wave yellow-white.',
  },
];

export function buildKingsPrompt(entry) {
  return [
    KINGS_VINYL_STYLE,
    KINGS_VINYL_TONE,
    entry.concept,
    KINGS_VINYL_RULES,
    KINGS_VINYL_NEGATIVE,
  ].join('\n\n');
}

// Quick-access: generate all prompts
export function getAllKingsPrompts() {
  return KINGS_TYPES.map(entry => ({
    slug: entry.slug,
    heroName: entry.heroName,
    heroRef: entry.heroRef,
    prompt: buildKingsPrompt(entry),
  }));
}
