export const BANTI_LAUNCH_SERIES_LABEL = '班TI 社畜宇宙';

// ─── STYLE: Inflatable Vinyl Toy × Wizarding Office Archetypes ───
// 延续已生成 8 张的光泽充气手办方向，继续做 HP 气质映射，
// 但最终仍然是 SBTI 的办公室人格梗图角色，而不是电影剧照复刻。
// 网站用图：纯角色插画（无文字），文字由前端代码叠加
const BANTI_VINYL_STYLE =
  'An inflatable oversized vinyl toy figure, shiny smooth PVC plastic surface with glossy reflections and subtle seam lines where inflatable sections meet. ' +
  'The character has soft bulging proportions of a large air-filled balloon figure — chunky rounded limbs, slightly oversized head, everything looks pumped full of air. ' +
  'Smooth glossy plastic skin with bright highlight reflections. The material is clearly shiny inflatable vinyl/PVC, NOT matte, NOT fabric, NOT clay, NOT realistic skin. ' +
  'Vertical 3:4 format. Clean solid-color studio background with soft even lighting emphasizing the glossy vinyl surface reflections. ' +
  'Character centered, occupying roughly 60-70% of frame height, with clean space at top and bottom for text overlay later.';

const BANTI_VINYL_TONE =
  'A collectible designer toy figure for a social-media personality atlas, mapping iconic wizard-school fantasy character cues to modern workplace stereotypes. ' +
  'Each character should feel recognizably inspired by a Harry Potter universe personality while still reading first as an office worker archetype. ' +
  'Use signature silhouette cues, hair, glasses, robes, props, and facial attitude so fans get the reference immediately, but keep the final image as an original collectible toy illustration. ' +
  'Aim for "I want to collect all of them" energy, like a designer toy blind box series.';

const BANTI_VINYL_RULES =
  'Single character figure on clean studio background. Full body or three-quarter body, centered composition. ' +
  'Small inflatable accessories and props should float nearby or be held by the character — mixing HP magical items with office props, all in inflatable vinyl material. ' +
  'Keep 2-3 props maximum, do not clutter. Background should be a single clean color or simple gradient that complements the character palette. ' +
  'ABSOLUTELY ZERO TEXT of any kind in the image. No letters, no words, no captions, no labels, no Chinese characters, no English text, no numbers as text, no UI elements.';

const BANTI_VINYL_NEGATIVE =
  'negative prompt: text, typography, letters, words, Chinese characters, English words, numbers as labels, caption, title, label, watermark, logo, ' +
  'realistic human, photograph, low poly, flat 2D illustration, anime, cartoon drawing, matte surface, fabric texture, clay, knitted, paper craft, ' +
  'complex background, busy scene, multiple characters, horror, violent, ugly, deformed';

export const BANTI_LAUNCH_TYPES = [
  {
    slug: 'boss',
    workName: '人形甘特图',
    hpCharacter: 'Professor McGonagall',
    concept:
      'An inflatable vinyl toy figure of Professor McGonagall from Harry Potter, reimagined as a stern workplace meeting controller. ' +
      'Shiny PVC dark emerald green robes puffed up with air, pointed witch hat slightly tilted and inflatable. ' +
      'Square spectacles printed on the glossy vinyl face, tight-lipped stern expression comically softened by balloon proportions. ' +
      'One puffy hand holds a tiny inflatable wand pointing commandingly downward (assigning tasks), the other clutches a tiny inflatable schedule scroll. ' +
      'Floating inflatable props: a puffy vinyl clock, a shiny PVC red pen, a balloon-like checklist board. ' +
      'Clean warm beige studio background. Palette: dark emerald green, deep crimson accents, warm cream.',
  },
  {
    slug: 'ctrl',
    workName: '人形KPI',
    hpCharacter: 'Percy Weasley',
    concept:
      'An inflatable vinyl toy figure of Percy Weasley from Harry Potter, reimagined as a hyper-organized KPI perfectionist. ' +
      'Shiny PVC navy blue Ministry of Magic robes, puffed up stiffly. Round horn-rimmed glasses printed on the glossy vinyl face. Red Weasley hair rendered as smooth shiny PVC. ' +
      'Standing impossibly straight and rigid like an inflated ruler, posture unnaturally perfect. ' +
      'One puffy hand holds a tiny inflatable official parchment with a seal, the other grips a shiny plastic quill over a clipboard. ' +
      'Floating inflatable props: a puffy KPI dashboard scroll, a glossy vinyl Ministry badge, a balloon-like hourglass timer. ' +
      'Clean pale gray studio background. Palette: navy blue, amber gold accents, white.',
  },
  {
    slug: 'mum',
    workName: '操心项目办',
    hpCharacter: 'Molly Weasley',
    concept:
      'An inflatable vinyl toy figure of Molly Weasley from Harry Potter, reimagined as an exhausted caring project mom. ' +
      'Shiny PVC warm maroon knitted-pattern sweater (but rendered as smooth glossy vinyl, not actual knit), plump inflatable proportions. Curly red Weasley hair in puffy PVC. ' +
      'Both inflatable arms overloaded with tiny vinyl care items spilling over — too many things to carry. ' +
      'Expression: warm tired smile, genuine care visible even in balloon toy form. Her famous clock showing "mortal peril" reimagined as project deadlines. ' +
      'Floating inflatable props: puffy vinyl thermos, shiny PVC medicine box, a tiny inflatable Weasley clock, balloon meeting notes. ' +
      'Clean warm pink studio background. Palette: dusty rose, maroon, cream, soft coral.',
  },
  {
    slug: 'rebel',
    workName: 'HR头痛源',
    hpCharacter: 'Sirius Black',
    concept:
      'An inflatable vinyl toy figure of Sirius Black from Harry Potter, reimagined as a cool workplace rule-breaker. ' +
      'Shiny PVC black leather jacket-style robes, long dark hair rendered as smooth glossy vinyl waves. Handsome roguish face with casual defiance. ' +
      'Relaxed angular stance — one puffy foot resting on a tiny inflatable employee handbook / rule book. One hand gives a dismissive wave. ' +
      'Expression: calm cool defiance, made funnier by the puffy balloon proportions. ' +
      'Floating inflatable props: a torn vinyl regulation page, a crossed-out PVC Azkaban wanted poster, a puffy motorcycle keychain. ' +
      'Clean cool gray studio background. Palette: black, strong red accents, slate gray.',
  },
  {
    slug: 'party',
    workName: '茶水间情报局',
    hpCharacter: 'Rita Skeeter',
    concept:
      'An inflatable vinyl toy figure of Rita Skeeter from Harry Potter, reimagined as an office gossip information broker. ' +
      'Shiny PVC acid-green robes with puffy fur-trimmed collar, jeweled cat-eye glasses printed on the glossy vinyl face, tight blonde curls in shiny PVC. ' +
      'Leaning forward conspiratorially, one puffy hand holds a tiny inflatable Quick-Quotes Quill writing by itself, the other holds a shiny PVC coffee cup. ' +
      'Expression: bright predatory smile with sparkling gossip-radar eyes, amplified by the glossy balloon surface. ' +
      'Floating inflatable props: puffy vinyl quill with parchment, shiny chat bubble shapes, a tiny balloon camera. ' +
      'Clean light cyan studio background. Palette: acid green, teal, cream white, gold accents.',
  },
  {
    slug: 'shy',
    workName: '会议隐形人',
    hpCharacter: 'Neville Longbottom',
    concept:
      'An inflatable vinyl toy figure of young Neville Longbottom from Harry Potter, reimagined as a nearly invisible meeting attendee. ' +
      'Shiny PVC oversized Gryffindor robes that look too big, round nervous face with puffy cheeks. The balloon proportions make him look even more huddled and small. ' +
      'Shoulders drawn inward, hands clasped close to the puffy body, trying to take up zero space despite being an inflated balloon figure. ' +
      'Expression: nervous, wanting to speak but frozen — comically contradicting his inflated size. ' +
      'Floating inflatable props: a tiny muted vinyl Remembrall glowing red, a puffy miniature Trevor the toad, a deflated speech bubble. ' +
      'Clean pale misty blue studio background with generous empty space. Palette: misty gray-blue, Gryffindor scarlet, soft gold.',
  },
  {
    slug: 'chill',
    workName: '准点蒸发器',
    hpCharacter: 'Ron Weasley',
    concept:
      'An inflatable vinyl toy figure of Ron Weasley from Harry Potter, reimagined as a punctual 6PM office escapee. ' +
      'Shiny PVC Gryffindor robes slightly untucked and messy, bright red Weasley hair in smooth glossy vinyl, freckles printed on the balloon face. ' +
      'Already half-turned toward the edge as if leaving, one inflatable foot stepping forward with momentum. Puffy backpack already on. ' +
      'Expression: relieved and cool — not joy, just "I survived another day" — rendered in smooth plastic. ' +
      'Floating inflatable props: a puffy vinyl clock showing 6:00, a shiny Weasley sweater rolled up, a trailing balloon Hogwarts Express ticket. ' +
      'Clean warm orange studio background. Palette: Gryffindor scarlet, warm orange, cream.',
  },
  {
    slug: 'malo',
    workName: '班味代言人',
    hpCharacter: 'Severus Snape',
    concept:
      'An inflatable vinyl toy figure of Severus Snape from Harry Potter, reimagined as the ultimate burnt-out office worker. ' +
      'Shiny PVC flowing black robes, long greasy black hair rendered as droopy glossy vinyl. Hooked nose and deep-set eyes on the balloon face, looking perpetually exhausted. ' +
      'The vinyl surface has slightly less shine than others — as if even the plastic is tired. Holding a puffy laptop bag in one hand and a tiny inflatable potion vial (coffee) in the other. ' +
      'Expression: blank, numb, centuries of tiredness condensed into one balloon figure. The fatigue has become personality. ' +
      'Floating inflatable props: a wrinkled vinyl employee badge, a puffy cauldron-shaped coffee mug, a deflating Dark Mark that looks like a deadline reminder. ' +
      'Clean muted dark gray studio background. Palette: black, muted gray, washed-out green accent.',
  },
  {
    slug: 'nerd',
    workName: '人间搜索引擎',
    hpCharacter: 'Hermione Granger',
    concept:
      'An inflatable vinyl toy figure inspired by Hermione Granger from the Harry Potter universe, reimagined as an unstoppable workplace knowledge engine. ' +
      'Shiny PVC burgundy-and-gold academic robes adapted into neat officewear, bushy brown hair rendered as soft glossy vinyl volume, sharp intelligent eyes behind subtle determination. ' +
      'One puffy arm hugs an overflowing stack of tiny inflatable research folders and sticky-note bundles, the other points toward a floating blank search panel made of icon shapes only. ' +
      'Expression: mid-explanation, already three tabs ahead of everybody else. ' +
      'Floating inflatable props: a puffy hourglass time-turner style timer, a balloon laptop with many blank tabs, a glossy reference book bursting with color-coded markers. ' +
      'Clean parchment-ivory studio background. Palette: oxblood, antique gold, warm ivory.',
  },
  {
    slug: 'simp',
    workName: '职场舔王',
    hpCharacter: 'Dobby',
    concept:
      'An inflatable vinyl toy figure inspired by Dobby from the Harry Potter universe, reimagined as an eager people-pleasing office helper who can never say no. ' +
      'Shiny PVC oversized ears, huge glossy hopeful eyes, soft beige vinyl skin, dressed in a slightly too-formal borrowed shirt and crooked office tie. ' +
      'The pose is anxious but enthusiastic, leaning forward as if volunteering for one more impossible task. ' +
      'One puffy hand holds too many coffee cups and chargers, the other clutches an unstable pile of folders with grateful determination. ' +
      'Floating inflatable props: a shiny task ribbon looping around him, a balloon office lanyard, a puffy spare power bank. ' +
      'Clean pale oatmeal studio background. Palette: linen beige, dusty blue, soft brown.',
  },
  {
    slug: 'solo',
    workName: '工位结界',
    hpCharacter: 'Luna Lovegood',
    concept:
      'An inflatable vinyl toy figure inspired by Luna Lovegood from the Harry Potter universe, reimagined as an introverted office worker living inside a private workstation force field. ' +
      'Shiny PVC pale blonde hair, dreamy wide eyes, whimsical layered robes translated into quiet officewear, with signature eccentric glasses resting calmly on the glossy face. ' +
      'She stands slightly apart inside a subtle translucent inflatable bubble, posture relaxed and self-contained rather than unfriendly. ' +
      'One puffy hand holds a lunch box and the other a magazine-like folder, as if perfectly happy eating alone. ' +
      'Floating inflatable props: soft noise-cancelling headphones, a tiny tea cup, a translucent quiet-zone ring. ' +
      'Clean cool lavender studio background. Palette: pale lilac, moon blue, buttery cream.',
  },
  {
    slug: 'sleep',
    workName: '工位休眠仓',
    hpCharacter: 'Professor Trelawney',
    concept:
      'An inflatable vinyl toy figure inspired by Professor Trelawney from the Harry Potter universe, reimagined as a permanently drowsy desk sleeper. ' +
      'Shiny PVC layered shawls and floaty office cardigan shapes, oversized round spectacles on a half-awake glossy face, wild curly hair rendered as plush vinyl swirls. ' +
      'The whole body looks softly collapsed with sleepiness, as if she nodded off sitting upright and is only barely back online. ' +
      'One puffy hand hugs a giant coffee mug, the other rests on a sleepy crystal-ball-like desk orb used as a paperweight. ' +
      'Floating inflatable props: a cloud-shaped eye mask, a drooping alarm clock, a tiny drifting mug of coffee steam made from glossy vinyl. ' +
      'Clean dusty-plum studio background. Palette: plum, tea brown, smoke lavender, faded gold.',
  },
  {
    slug: 'game-r',
    workName: '永动加班机',
    hpCharacter: 'Oliver Wood',
    concept:
      'An inflatable vinyl toy figure inspired by Oliver Wood from the Harry Potter universe, reimagined as an overtime grinder who treats every project like a championship final. ' +
      'Shiny PVC dark sport-captain robes adapted into rolled-sleeve office gear, messy hair, laser-focused eyes, and the intense body language of someone who forgot it is midnight. ' +
      'He lunges slightly forward with competitive energy, as if about to run one more revision because quitting now would be dishonorable. ' +
      'One puffy hand grips a laptop and stylus like sports equipment, the other points at an invisible progress target off frame. ' +
      'Floating inflatable props: a glowing progress orb, a stopwatch, a cup noodle container converted into glossy PVC. ' +
      'Clean deep forest studio background. Palette: dark green, brass gold, storm gray.',
  },
  {
    slug: 'drunk',
    workName: '酒局外交官',
    hpCharacter: 'Horace Slughorn',
    concept:
      'An inflatable vinyl toy figure inspired by Horace Slughorn from the Harry Potter universe, reimagined as a master of client dinners and after-work relationship maintenance. ' +
      'Shiny PVC luxurious velvet-like robes translated into a slightly flashy business host outfit, curled moustache, rosy cheeks, and a smooth confident smile. ' +
      'The pose is warmly expansive, one arm lifted in a generous toast, the other inviting somebody into an exclusive club they never knew they wanted. ' +
      'Floating inflatable props: a glossy goblet, a handshake seal, a balloon invitation crest, all in elegant vinyl finish. ' +
      'Clean rich aubergine studio background. Palette: plum, burgundy, champagne gold, warm cream.',
  },
  {
    slug: 'oh-no',
    workName: '风控永动机',
    hpCharacter: 'Mad-Eye Moody',
    concept:
      'An inflatable vinyl toy figure inspired by Mad-Eye Moody from the Harry Potter universe, reimagined as a paranoid corporate risk-control machine. ' +
      'Shiny PVC weathered dark coat, scarred balloon face, one magical rotating eye exaggerated in glossy vinyl so it scans every direction for danger. ' +
      'The stance is defensive and alert, knees bent as if every project deck might explode at any second. ' +
      'One puffy hand raises a warning memo, the other grips a wand like an emergency pointer. ' +
      'Floating inflatable props: red alert triangles, a cracked deadline clock, a thick contingency binder. ' +
      'Clean burnt-orange studio background. Palette: rust orange, swamp green, gunmetal gray.',
  },
  {
    slug: 'thin-k',
    workName: '内耗打工人',
    hpCharacter: 'Remus Lupin',
    concept:
      'An inflatable vinyl toy figure inspired by Remus Lupin from the Harry Potter universe, reimagined as a chronically overthinking office worker. ' +
      'Shiny PVC worn tweed-like jacket translated into smooth vinyl, tired kind eyes, softly rumpled hair, and a face that looks like it has revised one email thirty times. ' +
      'The pose is folded inward and thoughtful, shoulders slightly raised, like he is replaying every conversation from the day. ' +
      'One puffy hand holds a half-edited parchment memo, the other presses lightly to his temple in quiet mental overdrive. ' +
      'Floating inflatable props: looping thought rings, a crumpled draft, a tiny tea cup, and a moon-shaped stress charm. ' +
      'Clean muted indigo studio background. Palette: dusty brown, midnight blue, parchment cream.',
  },
  {
    slug: 'drama',
    workName: '办公室气压计',
    hpCharacter: 'Lavender Brown',
    concept:
      'An inflatable vinyl toy figure inspired by Lavender Brown from the Harry Potter universe, reimagined as a wildly expressive office emotional barometer. ' +
      'Shiny PVC long wavy hair, polished school-uniform-inspired office look, bright animated eyes, and a face that swings from thrilled to devastated in one meeting. ' +
      'The body language is fully theatrical, one puffy hand pressed to the chest while the other flings outward in oversized reaction. ' +
      'Floating inflatable props: a glittering approval burst, a tiny broken-heart charm, and a dramatic spotlight star, all rendered in glossy PVC. ' +
      'Clean candy-rose studio background. Palette: rose pink, soft mauve, warm cream.',
  },
  {
    slug: 'emo',
    workName: '碎了又粘的打工人',
    hpCharacter: 'Moaning Myrtle',
    concept:
      'An inflatable vinyl toy figure inspired by Moaning Myrtle from the Harry Potter universe, reimagined as a fragile office worker who keeps breaking down and patching herself back together. ' +
      'Shiny PVC ghostly pale-blue body with soft translucent glow, bob haircut, oversized round glasses, watery eyes, and a mouth trying very hard not to wobble. ' +
      'The pose is defensive and fragile, shoulders hunched inward while still standing upright out of sheer professionalism. ' +
      'One puffy hand clutches tissues, the other holds a tiny repaired heart sticker sheet and a cracked office badge. ' +
      'Floating inflatable props: a teardrop charm, a bandage patch, a tiny bathroom mirror compact. ' +
      'Clean cool lilac-gray studio background. Palette: ghost blue, pale silver, muted violet.',
  },
  {
    slug: 'atm-er',
    workName: '职场充电宝',
    hpCharacter: 'Rubeus Hagrid',
    concept:
      'An inflatable vinyl toy figure inspired by Rubeus Hagrid from the Harry Potter universe, reimagined as the giant reliable office helper everyone drains for support. ' +
      'Shiny PVC oversized coat, enormous beard and hair rendered in sculpted glossy vinyl waves, warm exhausted eyes, and a giant soft body built to carry too much. ' +
      'The stance is solid and dependable, feet planted wide as if bracing under everyone else\'s responsibilities. ' +
      'One puffy hand is overloaded with parcels, cables, and coffee cups, the other holds a battered umbrella like a tool of last-resort support. ' +
      'Floating inflatable props: an extension cord loop, a giant thermos, a stack of delivery boxes, all in vinyl. ' +
      'Clean earthy teal studio background. Palette: forest brown, moss green, warm chestnut.',
  },
  {
    slug: 'dior-s',
    workName: '躺平先驱',
    hpCharacter: 'Professor Binns',
    concept:
      'An inflatable vinyl toy figure inspired by Professor Binns from the Harry Potter universe, reimagined as a fully dead-inside lying-flat survival expert who somehow remains on payroll forever. ' +
      'Shiny PVC ghostly elderly professor robes with a faint translucent glow, sleepy drooping mustache, half-lidded eyes, and the serene expression of somebody who stopped caring decades ago. ' +
      'He floats slightly above the ground instead of standing properly, suggesting maximum effort conservation. ' +
      'One puffy hand loosely holds a dusty file, the other hangs limp beside a barely-there office bag. ' +
      'Floating inflatable props: a cobwebbed clock, a nearly empty inbox tray, a faded cushion cloud, all rendered as glossy toy accessories. ' +
      'Clean taupe-gray studio background. Palette: dusty taupe, faded blue-gray, old parchment.',
  },
  {
    slug: 'sexy',
    workName: '办公室磁铁',
    hpCharacter: 'Cedric Diggory',
    concept:
      'An inflatable vinyl toy figure inspired by Cedric Diggory from the Harry Potter universe, reimagined as the effortlessly magnetic office favorite everybody notices immediately. ' +
      'Shiny PVC polished champion-style robes translated into a sleek office look, neat dark hair, gentle confident smile, and luminous good-guy energy. ' +
      'The pose is casual and unforced, one shoulder slightly angled, like attention keeps arriving even when he is just standing there. ' +
      'One puffy hand holds a coffee cup with relaxed elegance, the other hangs loosely beside a slim folder, never trying too hard. ' +
      'Floating inflatable props: subtle sparkle bursts, a champion-style badge, and soft orbiting attention rings. ' +
      'Clean cool sky-blue studio background. Palette: navy, gold, soft blue, white.',
  },
  {
    slug: 'fake',
    workName: '下班变脸王',
    hpCharacter: 'Nymphadora Tonks',
    concept:
      'An inflatable vinyl toy figure inspired by Nymphadora Tonks from the Harry Potter universe, reimagined as a shape-shifting office masker who looks cheerful at work and collapses emotionally off the clock. ' +
      'Shiny PVC half-pink half-muted-brown hair showing a visible mood-shift across the head, playful features on one side of the face and exhausted drooping features on the other. ' +
      'The body language captures a split performance: one puffy arm waving brightly, the other hanging heavy with burnout. ' +
      'One hand holds a polished work-smile mask like a prop, while the other grips a slouchy bag as if the real self is already heading home. ' +
      'Floating inflatable props: a peeled smile sticker, a compact mirror, a cracked star badge. ' +
      'Clean periwinkle studio background. Palette: periwinkle, dusty pink, smoke gray.',
  },
  {
    slug: 'luck-y',
    workName: '锦鲤本鲤',
    hpCharacter: 'Harry Potter',
    concept:
      'An inflatable vinyl toy figure inspired by Harry Potter from the Harry Potter universe, reimagined as a bafflingly lucky office golden child. ' +
      'Shiny PVC messy black hair, iconic round glasses, tiny lightning scar, and a modest expression that somehow makes the good fortune even more irritatingly charming. ' +
      'The stance is lightly surprised rather than smug, as if success keeps falling into his hands by accident. ' +
      'One puffy hand catches a glowing golden-snitch-like lucky orb, while the other holds a folder that looks like it should have failed but somehow won. ' +
      'Floating inflatable props: a four-leaf clover charm, confetti bursts, a tiny trophy cup, all in glossy vinyl. ' +
      'Clean bright gold studio background. Palette: golden yellow, midnight navy, warm cream.',
  },
  {
    slug: 'joker',
    workName: '团队气氛组',
    hpCharacter: 'Fred Weasley',
    concept:
      'An inflatable vinyl toy figure inspired by Fred Weasley from the Harry Potter universe, reimagined as the office mood-maker who keeps everyone laughing while secretly running on fumes. ' +
      'Shiny PVC bright red hair, mischievous grin, playful shopkeeper-chic robes adapted into fun officewear, eyes sparkling with comic timing but carrying a tiny trace of tiredness. ' +
      'The pose is animated and welcoming, one arm thrown out in a joke-selling flourish while the body leans forward to save another awkward room. ' +
      'One puffy hand holds a prank-box-style briefcase, the other tosses confetti-like office doodads into the air. ' +
      'Floating inflatable props: joke fireworks, emoji-like smile bursts, a tiny cracked comedy mask charm. ' +
      'Clean sunflower-yellow studio background. Palette: warm yellow, ginger red, sky blue accents.',
  },
  {
    slug: 'than-k',
    workName: '职场PUA接收器',
    hpCharacter: 'Colin Creevey',
    concept:
      'An inflatable vinyl toy figure inspired by Colin Creevey from the Harry Potter universe, reimagined as an overeager junior worker who gets exploited and still thinks it is an honor. ' +
      'Shiny PVC eager smile, bright enthusiastic eyes behind simple glasses, tidy schoolboy-like office shirt, and the energy of someone who says thank you after being overloaded. ' +
      'The pose is upright and approving, with both feet together and shoulders tense with anxious gratitude. ' +
      'One puffy hand clutches extra folders like prized opportunities, while the other gives an earnest thumbs-up holding a little camera-shaped office badge. ' +
      'Floating inflatable props: gold star stickers, an approval burst, and an extra task stack tied with ribbon. ' +
      'Clean pale yellow studio background. Palette: butter yellow, sky blue, warm gray.',
  },
  {
    slug: 'woc',
    workName: '吃瓜工位',
    hpCharacter: 'Argus Filch',
    concept:
      'An inflatable vinyl toy figure inspired by Argus Filch from the Harry Potter universe, reimagined as a nosy office chaos observer who always knows the latest drama. ' +
      'Shiny PVC stringy gray hair, narrow suspicious eyes, hunched shoulders, and a severe caretaker look translated into worn office janitor-chic. ' +
      'He leans slightly forward with scandalized fascination, visibly horrified yet unable to stop watching. ' +
      'One puffy hand grips a ring of keys and a tea cup, the other holds a mop-handle-like pointer aimed toward off-screen disaster. ' +
      'Floating inflatable props: a tiny cat-shaped charm, jagged exclamation bursts, and a trembling gossip scroll. ' +
      'Clean dusty brick-red studio background. Palette: rust red, charcoal gray, old parchment.',
  },
  {
    slug: 'love-r',
    workName: '办公室恋爱脑',
    hpCharacter: 'Cho Chang',
    concept:
      'An inflatable vinyl toy figure inspired by Cho Chang from the Harry Potter universe, reimagined as an office romantic who can build an entire love story from one tiny interaction. ' +
      'Shiny PVC long dark hair with soft glossy movement, elegant school-inspired office look, gentle dreamy eyes, and a face permanently one compliment away from daydream mode. ' +
      'The pose is slightly turned and wistful, like she is replaying a simple coffee handoff as a full cinematic montage. ' +
      'One puffy hand holds a coffee cup close to the chest, the other lightly touches a phone as if waiting for a message that means too much. ' +
      'Floating inflatable props: heart-shaped memo slips, a starry thought bubble, and a tiny folded paper crane. ' +
      'Clean blush-pink studio background. Palette: blush pink, midnight blue, pearl white.',
  },
  {
    slug: 'food-ie',
    workName: '外卖续命者',
    hpCharacter: 'Dudley Dursley',
    concept:
      'An inflatable vinyl toy figure inspired by Dudley Dursley from the Harry Potter universe, reimagined as a delivery-app obsessive who treats lunch planning as the real core work of the day. ' +
      'Shiny PVC round cheerful face, overstuffed office-casual layers, and an eager hungry expression that lights up more for snacks than for meetings. ' +
      'The stance is planted and satisfied, body leaning protectively over a mountain of takeaway as if guarding precious treasure. ' +
      'One puffy arm hugs multiple delivery bags and dessert boxes, while the other raises a giant milk-tea-like cup with triumphant relief. ' +
      'Floating inflatable props: pastry icons, takeaway containers, and a glossy spoon charm. ' +
      'Clean tangerine studio background. Palette: orange, cream, cocoa brown, strawberry pink accents.',
  },
  {
    slug: 'talk-er',
    workName: '工位话痨',
    hpCharacter: 'Gilderoy Lockhart',
    concept:
      'An inflatable vinyl toy figure inspired by Gilderoy Lockhart from the Harry Potter universe, reimagined as an unstoppable office talker who can turn a three-minute topic into a thirty-minute performance. ' +
      'Shiny PVC perfectly styled blond hair, dazzling smile, dramatic brows, and a flamboyant pastel office-robe look that begs for an audience. ' +
      'The pose is expansive and theatrical, one puffy hand gesturing endlessly while the torso leans into the story instead of the point. ' +
      'One hand holds a microphone-like quill, the other carries a stack of glossy self-promotional folders as if every conversation is a keynote. ' +
      'Floating inflatable props: swirling speech ribbons, a vanity mirror charm, a spotlight burst, all in smooth PVC. ' +
      'Clean bright aqua studio background. Palette: aqua blue, champagne gold, pastel lilac.',
  },
];

// ─── 网站用：纯角色插画（无文字） ───
export function buildBantiLaunchPrompt(typeOrConcept) {
  const concept = typeof typeOrConcept === 'string' ? typeOrConcept : typeOrConcept.concept;

  return [
    BANTI_VINYL_STYLE,
    `Character for the "${BANTI_LAUNCH_SERIES_LABEL}" personality atlas — a collectible inflatable vinyl toy series mapping wizard-school fantasy archetypes to workplace stereotypes.`,
    BANTI_VINYL_TONE,
    BANTI_VINYL_RULES,
    concept,
    BANTI_VINYL_NEGATIVE,
  ].join('\n\n');
}

// ─── 小红书用：HPTI 全卡面（文字烘焙在图里） ───
export function buildBantiCardPrompt(type, personality) {
  const cardLayout = `A personality atlas card design, vertical 3:4 format, featuring an inflatable vinyl toy character in the center.

CARD LAYOUT from top to bottom:
— Top section on light warm beige background:
  Large bold Chinese title "${personality.workName}" in top-left area
  Below the title: "${personality.code}" in accent letters, followed by smaller text "(${personality.backronym})"
  Below that: a one-line description "你是那种…${personality.tagline}"

— Center section:
  ${type.concept}

— Bottom section with slightly darker overlay:
  Three small rounded cards in a row, each with an emoji icon on top and short Chinese text below:
    Card 1: ${personality.tags[0]}
    Card 2: ${personality.tags[1]}
    Card 3: ${personality.tags[2]}
  
  Below the three cards: a dark rounded banner bar containing the quote in light text: ${personality.quote}

VISUAL STYLE: Clean modern card design, the character is an inflatable vinyl toy with shiny PVC surface, visually echoing the signature traits of ${type.hpCharacter}. Background is warm beige, clean and minimal. Typography is clean, modern sans-serif for Chinese text, monospace for the English code.`;

  return cardLayout + '\n\nnegative prompt: blurry text, misspelled text, extra fingers, deformed hands, realistic human, photograph, low poly, anime, complex busy background, horror, violent';
}

export function getBantiLaunchType(slug) {
  return BANTI_LAUNCH_TYPES.find((type) => type.slug === slug);
}
