// WTFTI 经典宇宙 · 潮玩盲盒风 Prompt 体系 v2
// 风格：3D Chibi Vinyl Toy (Pop Mart × 互联网发疯)
// v2：大幅增强角色张力 — 表情/姿势/服装/道具极致夸张化

const WTFTI_VISUAL_STYLE =
  '3D render style, chibi POP MART designer toy collectible, high-quality matte vinyl finish, pristine toy texture, ' +
  '2 to 2.5 head-body ratio, big round head, small chubby limbs, EXTREMELY expressive facial emotion, ' +
  'clean solid white background, centered full body, soft diffused studio lighting, clean rim light, flawless silhouette, ' +
  'a few high-quality floating miniature props surrounding the character, ' +
  'bold color palette with strong accent color. ' +
  '3D渲染风格，Q版泡泡玛特设计师潮玩盲盒手办，极致高质量哑光树脂质感，无瑕疵玩具表面，2-2.5头身比例，大圆头小短胖手脚，极具表现力的面部情绪，' +
  '纯白干净背景，单角色居中全身像，柔和的影棚漫射光照明，干净的轮廓光，无瑕疵的剪影，保留第一版种子图的舒适质感，' +
  '角色周围漂浮着精致的高质量微缩道具，大胆的色彩搭配。';

const WTFTI_TONE =
  'CRITICAL: Ensure the toy material looks highly realistic and tactile like a premium POP MART figure. ' +
  'The character MUST be highly expressive with dynamic poses and distinct facial expressions clearly showing the personality trait ' +
  '(almost meme-worthy), but STRICTLY keeping the clean, premium collectible designer toy aesthetic. Keep the composition tidy. ' +
  'Clothing must be a stylish miniature costume. Props should be clearly defined, well-lit, and legible, NOT cluttered. ANY TEXT APPEARING IN THE IMAGE MUST BE IN CHINESE. NO ENGLISH TEXT. ' +
  '关键：确保玩具材质看起来极其真实且有触感，就像高级的泡泡玛特手办。' +
  '角色必须极具表现力，通过动态的姿势和鲜明的面部表情清晰展示人格特征（甚至有梗图感），' +
  '但必须严格保持干净、高级的收藏品潮玩美感。不要有过多的杂乱噪点，保持构图整洁。' +
  '服装必须是时尚的微缩戏服。道具应该清晰、打光漂亮且易读，绝不能杂乱。注意：图片中如果出现了文字，必须是纯中文，不允许出现英文！';

const WTFTI_TRANSFORM_RULES =
  'IMPORTANT TRANSFORMATION RULES: ' +
  'Redesign the character outfit, hairstyle, accessories, and pose to match the target personality perfectly. ' +
  'The seed image should provide the EXACT toy material quality, body proportion, and clean studio rendering style. ' +
  'Do not lose the smooth, comfortable vinyl texture of the seed. ' +
  '重点变形规则：根据目标人格重新设计服装、发型、配饰和姿势。' +
  '种子图只用于提供精准的手办材质、身体比例和干净的影棚渲染风格。' +
  '绝对不能丢失种子图那种光滑、舒适的树脂质感。';

const WTFTI_NEGATIVE =
  'low poly, papercraft, origami, flat 2D illustration, anime style, realistic human, photorealistic, ' +
  'cinematic lighting, complex background, landscape, text, typography, watermark, logo, ' +
  'dark horror, scary, violent, NSFW, multiple characters, split view, frame border, ' +
  'speech bubble, comic panel, pixel art, sketch, line art, ink wash, traditional painting, ' +
  'subtle expression, neutral pose, plain clothing, minimal props';

/**
 * 29 型角色视觉描述
 * 每个 type 包含: slug, code, wtftiName, concept (详细角色描述)
 */
export const WTFTI_CLASSIC_TYPES = [
  {
    slug: 'boss',
    code: 'BOSS',
    wtftiName: '人形方向盘',
    concept:
      'POSE: power stance — one foot forward on a tiny podium, one hand pointing outward barking orders, other hand holding a megaphone. ' +
      'EXPRESSION: fierce piercing commander eyes with veins popping, wide-open mouth yelling, furrowed brows, teeth clenched in frustration. ' +
      'OUTFIT: military-style commander jacket with oversized gold epaulettes and medals, but wearing fuzzy pink bunny slippers below (dignified on top, given up on bottom). Red commander sash across chest. ' +
      'PROPS: giant floating whiteboard behind with battle strategy diagram, multiple crushed coffee cups scattered at feet, crumpled plans labeled "方案A" "方案B" "方案C" all rejected, a dramatic countdown timer showing 00:05, pointing baton in hand. ' +
      'ACCENT: deep crimson red with gold military accents.',
  },
  {
    slug: 'nerd',
    code: 'NERD',
    wtftiName: '人间收藏夹',
    concept:
      'POSE: sitting cross-legged ON TOP of a towering unstable stack of books that is about to topple, hunched over reading with magnifying glass inches from a tiny book. ' +
      'EXPRESSION: intense maniacal focus — spiral hypnotic eyes behind comically thick bottle-cap glasses, mouth wide open in a eureka moment, drooling slightly from concentration. ' +
      'OUTFIT: layered academic chaos — turtleneck sweater with a lab coat over it, multiple pens clipped everywhere, pocket protector overflowing with highlighters, reading glasses stacked on forehead. ' +
      'PROPS: MASSIVE tower of books at least 3x character height threatening to fall, floating mathematical formulas and chemical equations swirling around head, abandoned cold coffee with mold, magnifying glass, a globe, scattered sticky notes everywhere. ' +
      'ACCENT: deep navy blue with bright yellow knowledge-glow.',
  },
  {
    slug: 'ctrl',
    code: 'CTRL',
    wtftiName: '人形KPI',
    concept:
      'POSE: standing bolt upright like a soldier, clipboard in one hand, other hand checking a giant wristwatch, foot tapping impatiently. ' +
      'EXPRESSION: one eyebrow raised EXTREMELY high, perfectionist smirk, judgmental laser-beam eyes scanning everything, corner of mouth curled in disdain. ' +
      'OUTFIT: pristine crisp white shirt with PERFECTLY rolled sleeves at exact same height, tailored vest, smart watch on BOTH wrists, tie with ruler pattern, everything geometrically perfect. ' +
      'PROPS: giant floating Gantt chart behind showing tasks color-coded, massive checklist with AGGRESSIVE red check marks, tiny people figurines being arranged on a board, a giant clock, laser pointer, ruler, calculator, and a framed "永远的年度员工" award. ' +
      'ACCENT: amber gold and stark white with precision-blue accents.',
  },
  {
    slug: 'mum',
    code: 'MUM',
    wtftiName: '操心破产户',
    concept:
      'POSE: both arms OVERFLOWING with supplies — carrying lunchboxes, water bottles, umbrellas, snacks, tissues, ALL for other people. Leaning forward under the weight. ' +
      'EXPRESSION: warm loving smile but eyes are drooping with visible exhaustion, eyebags visible, one eye slightly twitching from tiredness but still smiling through it. ' +
      'OUTFIT: giant oversized mom-apron with 20+ pockets ALL stuffed full of supplies (snacks, tissues, medicine, hand sanitizer, hairpins, chargers), cozy cardigan underneath, house slippers. ' +
      'PROPS: carrying a towering pile of other people\'s belongings — lunchboxes, jackets, bags stacked higher than head, a hot water thermos in one hand, hand-knitted scarf draped ready to give away, multiple "代办事项" lists floating around. Tiny first aid kit on belt. ' +
      'ACCENT: dusty rose pink and warm cream.',
  },
  {
    slug: 'simp',
    code: 'SIMP',
    wtftiName: '倒贴甲方',
    concept:
      'POSE: on one knee in dramatic proposal pose, arms extended offering a giant glowing gift box upward, head tilted up with desperate pleading expression. ' +
      'EXPRESSION: giant sparkly puppy-dog eyes glistening, trembling lower lip, eyebrows raised in desperate hope, the face of someone who would do ANYTHING to be noticed. ' +
      'OUTFIT: knight-style armor but made of cardboard and tape (trying SO hard but resourceless), a makeshift cape from a towel, knee pads because always kneeling. ' +
      'PROPS: HUGE pile of rejected/returned gift boxes behind, floating chat bubbles all showing blue ticks with no reply, a phone screen showing "对方正在输入..." that never resolves, scattered broken gift ribbons, a tiny whiteflag of surrender, a loyalty stamp card (99/100). ' +
      'ACCENT: warm mustard yellow and melancholy gray.',
  },
  {
    slug: 'solo',
    code: 'SOLO',
    wtftiName: '一米结界',
    concept:
      'POSE: floating inside a giant translucent bubble/force field in lotus meditation pose, eyes peacefully closed, noise-canceling headphones on, completely isolated from chaos. ' +
      'EXPRESSION: pure zen bliss — eyes serenely closed, slight satisfied smirk, the calmest face in the universe, total inner peace. ' +
      'OUTFIT: maximum comfort cocoon — oversized fleece hoodie with hood UP, fluffy blanket wrapped around legs, premium noise-canceling headphones, fuzzy slippers, eye mask pushed up on forehead ready to deploy. ' +
      'PROPS: giant translucent force-field bubble surrounding the character, OUTSIDE the bubble: party invitations, phone calls, group chat notifications all BOUNCING OFF and deflecting away. Inside: cat curled on lap, remote control, warm beverage. A "请勿打扰" hologram sign floating outside bubble. ' +
      'ACCENT: misty icy blue-gray with soothing lavender.',
  },
  {
    slug: 'sleep',
    code: 'ZZZZ',
    wtftiName: '再睡五分钟',
    concept:
      'POSE: dramatically draped/melting over a giant fluffy cloud-pillow, limbs dangling lifelessly in all directions like a ragdoll, entire body surrendered to gravity. ' +
      'EXPRESSION: knocked-out-cold face — completely slack jaw with drool waterfall, eyes firmly shut with sleep mask, flushed peaceful cheeks, the deepest sleep imaginable. ' +
      'OUTFIT: ultimate sleep ensemble — puffy marshmallow onesie pajamas with star pattern, fluffy nightcap with pompom, sleep mask with printed "别喊我" text, one slipper on, one fallen off. ' +
      'PROPS: GIANT cloud-bed pillow beneath, DESTROYED alarm clock in pieces at bottom (smashed by fist), massive floating "呼噜" letters getting bigger, phone showing "15:00 PM" with 47 missed calls, scattered sleeping pills, a "快起床" sign that\'s been torn in half, a tiny moon and stars floating above. ' +
      'ACCENT: dreamy periwinkle purple and marshmallow white.',
  },
  {
    slug: 'game-r',
    code: 'GAME-R',
    wtftiName: '再来一把',
    concept:
      'POSE: hunched forward intensely — body leaning in aggressive gaming position, both hands white-knuckling a game controller, legs crossed tightly, entire body TENSE. ' +
      'EXPRESSION: unhinged gamer rage — eyes WIDE and bloodshot with dark circles, pupils dilated and glowing, teeth gritted, one eye twitching, veins on forehead, maniacal focus of someone on their 47th attempt. ' +
      'OUTFIT: gaming battle armor — LED-lit gaming headset glowing neon, hoodie with energy drink stains, fingerless gaming gloves, multi-colored RGB keyboard draped around neck like a medal. ' +
      'PROPS: giant HP bar floating above (dangerously at 1%), XP bar almost full, WALL of empty energy drink cans and instant noodle cups surrounding like a fortress, tangled charging cables everywhere, "游戏结束" 和 "重新开始？" signs flashing, stats screen showing "已游玩48小时", a cracked gaming monitor. ' +
      'ACCENT: electric neon purple and toxic neon green.',
  },
  {
    slug: 'drunk',
    code: 'DRUNK',
    wtftiName: '酒后真人',
    concept:
      'POSE: swaying dramatically to one side at 45-degree angle like about to fall over, one arm around invisible friend, other hand raising a wine glass high in a toast, legs wobbly. ' +
      'EXPRESSION: classic drunk face — deep crimson flushed cheeks and nose, one eye half-closed the other wide open, crooked lopsided grin, tongue slightly out, the face of someone about to confess everything. ' +
      'OUTFIT: party aftermath — once-nice shirt now untucked with buttons misaligned, tie loosened and wrapped around head like a headband, one shoe missing, jacket hanging off one shoulder. ' +
      'PROPS: wine glass tilted at dangerous angle (liquid defying gravity about to spill), floating truth-bomb speech bubbles spilling secrets, tiny KTV microphone in back pocket, empty bottles lined up behind, phone showing "凌晨2点给前任发消息", scattered karaoke songbook pages. ' +
      'ACCENT: deep burgundy wine red and warm amber orange.',
  },
  {
    slug: 'rebel',
    code: 'REBEL',
    wtftiName: '反骨仔',
    concept:
      'POSE: power stand with legs wide apart, one foot STOMPING on a torn rulebook, one hand making "talk to the hand" gesture, head tilted back defiantly. ' +
      'EXPRESSION: the ultimate rebel face — aggressive eye-roll so hard the eyes are almost white, DRAMATIC side-smirk, tongue sticking out slightly, one eyebrow raised in pure contempt, the face that says "and what are you gonna do about it?" ' +
      'OUTFIT: school uniform COMPLETELY destroyed — shirt untucked and torn, tie loosely knotted around waist instead of neck, collar popped up, skirt modified shorter, combat boots instead of school shoes, DIY patches and pins everywhere, leather jacket over uniform. ' +
      'PROPS: a giant TORN rulebook being ripped in half, upside-down authority signs, red flames erupting behind like an explosion, a "拒绝"印章, middle-finger peace sign, cracked "三好学生" trophy at feet, tiny authority figures running away in fear. ' +
      'ACCENT: aggressive hot red and jet black.',
  },
  {
    slug: 'oh-no',
    code: 'OH-NO',
    wtftiName: '我早说了吧',
    concept:
      'POSE: pure panic freeze — entire body shrunk and crouched, both hands gripping sides of head, knees bent, leaning backward as if everything is about to collapse. ' +
      'EXPRESSION: maximum anxiety face — eyes bulging out of head WIDE in terror, mouth stretched into perfect "O" of horror, eyebrows shot up to hairline, forehead drenched in sweat drops, trembling. ' +
      'OUTFIT: paranoid survival gear — bubble wrap padding all over body like armor, safety helmet with flashing light, knee pads, elbow pads, life vest over sweater, safety goggles pushed up, rubber gloves, everything protective imaginable. ' +
      'PROPS: chaotic disaster scene EVERYWHERE — glass of water tipping on table edge, dominos about to fall, banana peel on ground, tiny meteor approaching from above, giant exclamation marks "!!!" flooding overhead, emergency kit open with supplies spilling, "危险"警告带, a crystal ball showing doom. ' +
      'ACCENT: panic orange-red and caution yellow.',
  },
  {
    slug: 'thin-k',
    code: 'THIN-K',
    wtftiName: '内耗永动机',
    concept:
      'POSE: curled up in fetal position but FLOATING — knees hugged to chest, one hand pulling at own hair, head spinning with visible thought spirals, rocking back and forth. ' +
      'EXPRESSION: complete mental overload — spiral dizzy swirl eyes, biting nails down to nothing, forehead with actual steam/smoke rising, face contorted in an "I can\'t decide" grimace, visible stress lines. ' +
      'OUTFIT: wrapped in a blanket burrito like a cocoon — tangled mess of blankets as clothing, messy birds-nest hair going in every direction, pajamas underneath disheveled, missing one sock. ' +
      'PROPS: GIANT tangled ball of yarn/thread on top of head representing overthinking, floating miniature "brain meetings" — 8 tiny brain-shaped debate tables arguing, a phone showing "输入又删除100次", crumpled tissue mountain, a pros/cons list that\'s 10 pages long, hamster wheel spinning inside head visible through transparency. ' +
      'ACCENT: anxious lavender purple and stressed gray.',
  },
  {
    slug: 'drama',
    code: 'DRAMA',
    wtftiName: '情绪核弹',
    concept:
      'POSE: dramatic opera diva pose — one arm extended to the sky in theatrical agony, other hand on chest over heart, head thrown back, cape billowing dramatically as if wind is blowing. ' +
      'EXPRESSION: SPLIT face — literally half the face in ecstatic laughter (wide grin, eye squinting with joy) and the other half in dramatic sobbing (frown, eye welling up), two extreme emotions at once. ' +
      'OUTFIT: full theatrical costume — dramatic velvet cape flowing behind, crown tilted, one half sparkly/golden the other half dark/torn, theatrical ruffled collar, opera gloves, stage makeup visible. ' +
      'PROPS: giant comedy/tragedy theater masks flanking the character, a MASSIVE volume dial turned way past MAX to 11, dramatic spotlight beam from above, confetti AND tears falling simultaneously, scattered tissues, an applause meter exploding, stage curtains framing. ' +
      'ACCENT: rich theater crimson and stage gold.',
  },
  {
    slug: 'chill',
    code: 'CHILL',
    wtftiName: '佛到没电',
    concept:
      'POSE: lying completely flat and horizontal — ultimate couch-potato slump on a tiny recliner, body almost liquid, limbs dangling boneless over edges, zero muscle tension anywhere. ' +
      'EXPRESSION: absolute void — the flattest, most empty, zero-emotion face possible. Not sad, not happy, just NOTHING. Two dots for eyes. Horizontal line for mouth. The human equivalent of a loading screen that gave up. ' +
      'OUTFIT: the most generic, effort-free clothes possible — washed-out gray plain t-shirt, shapeless sweatpants, one sock, rubber sandals, everything wrinkled and faded to zero personality. ' +
      'PROPS: giant LOW BATTERY icon floating above (showing 1%), a cup of room-temperature plain water (not even tea), tiny white flag saying "随便吧", a knocked-over "成功学语录" book at feet, a turned-off phone, dust settling on the character, a tiny tumbleweed rolling by. ' +
      'ACCENT: desaturated ash gray and blanched off-white.',
  },
  {
    slug: 'emo',
    code: 'EMO',
    wtftiName: '碎了又粘',
    concept:
      'POSE: curled up in side-lying fetal position, hugging knees tightly, oversized headphones covering ears, body curved inward like a shrimp, head resting on arm. ' +
      'EXPRESSION: deep melancholy beautiful sadness — heavy-lidded drooping eyes gazing at nothing, pouty downturned lips, single sparkly dewdrop in corner of eye, wistful faraway look, the prettiest sadness. ' +
      'OUTFIT: oversized black hoodie three sizes too big with hood half-up, torn fishnet layer underneath, platform boots, chain accessories, dark nail polish, sleeves pulled way over hands into sweater paws, one earbud hanging out. ' +
      'PROPS: full-size over-ear headphones playing visible sound waves, a personal tiny rain cloud directly above but with a rainbow peeking through, black cat curled beside, bubble tea held with both hands for warmth, phone showing a melancholy lo-fi playlist, scattered journal pages with doodles, vinyl records floating nearby. ' +
      'ACCENT: deep midnight blue and smoky purple-gray.',
  },
  {
    slug: 'atm-er',
    code: 'ATM-er',
    wtftiName: '行走提款机',
    concept:
      'POSE: standing with BOTH arms extended outward like a living ATM/vending machine dispensing money — coins and bills POURING out of pockets, hands, and sleeves in a cascade. Leaning backward from the weight of everyone taking from them. ' +
      'EXPRESSION: forced exhausted smile through visible pain — eyes half-dead with massive dark circles, sweat drops, mouth forced into a grin but eyebrows showing suffering, the "I\'m fine" face of someone running on empty. ' +
      'OUTFIT: dress styled like an actual ATM machine — chunky boxy vest/armor designed to look like an ATM screen and keypad, with a card slot on chest, money dispensing slot at waist, LED display showing "BALANCE: ¥0.00". Or alternatively: shabby worn-out clothes with pockets turned inside-out showing emptiness. ' +
      'PROPS: WATERFALL of gold coins and paper money cascading out from the character, charging cables plugged into body with others charging FROM them, a giant battery gauge going from 100% to 0%, multiple hands reaching in from outside grabbing money/energy, takeout bags for 5 people in one hand, other people\'s shopping bags in other hand, a "FREE ATM" sign above head. ' +
      'ACCENT: money green and gold with exhaustion-brown.',
  },
  {
    slug: 'dior-s',
    code: 'Dior-s',
    wtftiName: '躺平先驱',
    concept:
      'POSE: ultimate lazy philosopher — reclining on a floating cloud/mini sofa like a Greek thinker, one leg crossed over knee, chin resting on hand in "The Thinker" pose but with ZERO effort. ' +
      'EXPRESSION: transcended bodhisattva face — half-asleep zen eyes with a knowing smirk, the look of someone who has figured out that wanting nothing IS the answer, subtle condescending wisdom. ' +
      'OUTFIT: monk meets slacker — plain white oversized t-shirt, baggy shorts, $2 rubber flip-flops, a tiny philosopher\'s laurel wreath on head (wilting), everything intentionally the cheapest possible. ' +
      'PROPS: reclining on a mini rocking chair/cloud, holding a tiny teacup with pinky out (the only luxury), STACK of unread self-help books being used as a footrest, a "success ladder" lying on its side ignoring it, meditation beads draped loose, a "materialism" sign in a trash can, floating yin-yang symbol. ' +
      'ACCENT: monk khaki and stone temple gray.',
  },
  {
    slug: 'sexy',
    code: 'SEXY',
    wtftiName: '被动钓鱼',
    concept:
      'POSE: casual model lean — hip cocked to one side, one hand in hair, slight head tilt with chin down looking upward through lashes, the classic "I didn\'t know I was being photographed" pose. ' +
      'EXPRESSION: devastatingly innocent — big doe eyes with natural sparkle, slight parted lips, barely-there Mona Lisa smile, raised eyebrow, the lethal combination of looking completely unaware of own attractiveness. ' +
      'OUTFIT: effortlessly alluring — off-shoulder oversized knit sweater slipping down one shoulder, fitted mini skirt, thigh-high socks with a slight gap of skin, delicate choker necklace, hair styled messy-on-purpose. Everything "accidentally" attractive. ' +
      'PROPS: multiple floating shattered/broken hearts from admirers scattered everywhere, an actual fishing rod with heart-shaped bait dangling BUT the character is NOT holding it (passive fishing), phone showing "99+" DMs and notifications, a mirror that the character is turned AWAY from (can\'t see own charm), rose petals drifting, small crowd of dazzled tiny figures in background. ' +
      'ACCENT: blush rose pink and seductive coral-red.',
  },
  {
    slug: 'fake',
    code: 'FAKE',
    wtftiName: '下班发疯',
    concept:
      'POSE: standing straight and proper from the front, but visible cracks forming all over body like porcelain about to shatter, one hand holding a smile-face mask over face. ' +
      'EXPRESSION: two faces — the mask shows a PERFECT professional smile, but through the cracks/behind the mask: total breakdown chaos. Eyes are screaming behind the mask. Visible crack lines running from forehead. ' +
      'OUTFIT: split personality outfit — front half is immaculate business attire (pressed blazer, crisp shirt, pearls), back half (visible from angle) reveals wrinkled pajamas, bedhead, chaos. The seam between the two halves is cracking. ' +
      'PROPS: a porcelain smile mask half-on half-off face, visible cracks spreading from mask across body, a "FINE" switch that\'s overheating and sparking/smoking, shattered mask fragments at feet, true emotion bubbles (screaming, crying, raging) floating behind, a crumbling "KEEPING IT TOGETHER" sign, duct tape patches visible trying to hold everything in place. ' +
      'ACCENT: porcelain Morandi pink and cracked gray-white.',
  },
  {
    slug: 'malo',
    code: 'MALO',
    wtftiName: '班味永存',
    concept:
      'POSE: zombie shuffle — body tilting forward at 15 degrees, arms hanging limp at sides, feet dragging, the classic "soul has left the building" commuter walk. ' +
      'EXPRESSION: COMPLETE soul-departure — hollow empty fish eyes (dots for pupils), mouth slightly agape in permanent "processing..." state, a tiny translucent ghost version of their soul floating out of their head. ' +
      'OUTFIT: embodiment of "ban wei" (office zombie) — hopelessly wrinkled dress shirt missing one button, employee badge lanyard so worn it\'s fraying, laptop bag strap digging into shoulder, coffee stain on shirt, tie at half-mast. ' +
      'PROPS: tiny translucent ghost/soul escaping upward from head, a floating "班味" neon sign above, miniature office cubicle walls closing in around feet, cold congealed takeout boxes stacked, work notification badge showing "999+", a wilted dying office desk plant, commute transit card dangling, briefcase with files overflowing, dark corporate cloud over head. ' +
      'ACCENT: soul-depleted gray-brown and fluorescent office green.',
  },
  {
    slug: 'luck-y',
    code: 'LUCK-Y',
    wtftiName: '欧气溢出',
    concept:
      'POSE: walking with arms wide open, chest out, face to the sky — as if bathing in golden light raining from above, every step lands perfectly, radiating main-character energy. ' +
      'EXPRESSION: pure innocent radiance — star-shaped sparkly eyes literally GLOWING with light, beatific angelic smile, rosy cheeks, a warm fuzzy golden aura emanating from entire face, the face of someone the universe personally favors. ' +
      'OUTFIT: casual but EVERYTHING magically looks perfect — simple clothes but golden four-leaf clovers appear as patterns, everything fits immaculately by pure luck, a tiny crown that just happened to land on head. ' +
      'PROPS: CASCADING shower of gold coins, red envelopes, lottery tickets, and four-leaf clovers raining from above, koi fish leaping around, golden halo behind head, rainbows arching overhead, a "JACKPOT" display, horseshoes, lucky dice all showing 6, a slot machine showing 777, everything the character touches turns gold. ' +
      'ACCENT: radiating gold and lucky emerald green.',
  },
  {
    slug: 'joker',
    code: 'JOKE-R',
    wtftiName: '陪笑护法',
    concept:
      'POSE: classic circus clown bow — exaggerated deep bow with one arm sweeping the floor, other arm behind back, full showmanship entertainment pose, like just finished a performance nobody asked for. ' +
      'EXPRESSION: FULL CLOWN — painted clown makeup with exaggerated red lips in giant forced grin, white face paint, red nose ball, one eye laughing wide open while the other eye has a single tear rolling down through the makeup (the crack in the performance). ' +
      'OUTFIT: full circus clown costume — colorful polka-dot ruffled collar, oversized clown shoes (3x too big), rainbow suspenders, too-big plaid pants, a tiny spinning propeller hat, flower lapel that squirts water, the whole nine yards of clown aesthetics. ' +
      'PROPS: balloon animals (one deflating sadly), juggling balls mid-air (one dropping), confetti scattered, a "LAUGH" sign being held up, rubber chicken, pie-in-the-face cream on shoulder, fake flowers, a tiny sign reading "Are you entertained?", real tears making the clown makeup run on one side. ' +
      'ACCENT: circus yellow, red, and melancholy blue.',
  },
  {
    slug: 'shy',
    code: 'SHY',
    wtftiName: '社恐晚期',
    concept:
      'POSE: full defensive shrink — body contracted to smallest possible size, shoulders hunched up to ears, knees bent inward, hiding 80% of body behind an oversized object (phone/book/bag), peeking out with one eye. ' +
      'EXPRESSION: peak social terror — wide fearful darting eyes (looking sideways for escape), deep crimson blush covering entire face to ears, mouth pressed into tiny anxious line, beads of sweat, trembling, the face of someone who accidentally made eye contact and is now internally combusting. ' +
      'OUTFIT: maximum concealment — oversized coat so huge only the top of head and fingertips are visible, bucket hat pulled down covering eyes, scarf wrapped up to nose, the human equivalent of hiding inside a turtle shell. ' +
      'PROPS: holding phone like a shield in front of face "pretending to text", a giant glowing "EXIT" sign that characters eyes are fixed on longingly, a social situation danger meter at MAX, tiny "safe zone" bedroom miniature they wish they were in, invisible/camouflage cloak partially draped over them, floating social invitations they\'re dodging Matrix-style. ' +
      'ACCENT: blushing pale pink and social-anxiety gray-blue.',
  },
  {
    slug: 'party',
    code: 'PARTY',
    wtftiName: '气氛焊接工',
    concept:
      'POSE: full party animal — standing on a table/speaker, one foot up on a chair, arms raised HIGH pointing to the sky like a DJ, mic in one hand, confetti cannon in other, MAXIMUM energy pose. ' +
      'EXPRESSION: PEAK hype face — mouth wide open in an ecstatic scream/laugh, eyes squeezed shut from pure joy intensity, veins popping from enthusiasm, cheeks puffed from shouting, the face of someone at 200% social energy. ' +
      'OUTFIT: party king/queen — glittery hawaiian shirt unbuttoned with neon tank top underneath, star-shaped sunglasses pushed up on head, glow sticks and bracelets covering both arms, party hat, light-up sneakers, a sash that says "VIBES". ' +
      'PROPS: confetti EXPLOSION in full blast, giant speakers with visible bass sound waves, karaoke microphone glowing, disco ball above, party poppers going off, stack of beer cups in pyramid, phone showing "999+ contacts", social calendar marked SOLID for weeks, emoji faces floating everywhere, a "PARTY DOESN\'T STOP" banner. ' +
      'ACCENT: electric party yellow and hot neon pink.',
  },
  {
    slug: 'than-k',
    code: 'THAN-K',
    wtftiName: '谢谢你骂我',
    concept:
      'POSE: devout gratitude monk — palms pressed together in prayer position raised HIGH above head, slight bow, floating slightly off ground as if lifted by thankfulness, a "namaste" pose taken to the extreme. ' +
      'EXPRESSION: aggressive thankfulness — eyes glistening with over-the-top grateful sparkle, reverent smile so wide it looks painful, slightly teary from gratitude, a halo above head (crooked), radiating "thank you" energy from every pore. ' +
      'OUTFIT: guru/monk aesthetic — simple warm-toned robes with a "THANKS" patch, gratitude beads necklace, a sash made of woven thank-you notes, sandals, everything humble and devout but EXTRA. ' +
      'PROPS: mountain pile of handwritten thank-you letters overflowing around feet, a giant "BRIGHT SIDE" magnifying glass in belt, a crushed pile of bad news/problems being physically stood upon and ignored, floating "THANK YOU" signs in multiple languages, tiny rainbow after every storm cloud, a trophy that says "Most Grateful Person Alive", blessing sparkles emanating. ' +
      'ACCENT: grateful warm sunshine yellow and pure white.',
  },
  {
    slug: 'woc',
    code: 'WOC!',
    wtftiName: '吃瓜专业户',
    concept:
      'POSE: classic spectator stance — sitting on a tiny folding stool, legs crossed leisurely, one hand cupping chin resting on knee, other hand holding phone recording, COMPLETELY relaxed while chaos happens around. ' +
      'EXPRESSION: the perfect "WTF" face — jaw DROPPED wide open in exaggerated shock, eyes HUGE and round as saucers, eyebrows maximally raised, but body language shows ZERO intention to help — pure spectator mode, "this is entertaining" shock. ' +
      'OUTFIT: casual internet bystander — plain white t-shirt, sweatpants, baseball cap with no logo, the most "I\'m just here to watch" outfit possible. Sunglasses pushed up on head. ' +
      'PROPS: giant "WOC!" text floating above in bold red, a bag of melon seeds (eating them = Chinese meme for spectating drama), tiny folding stool, phone recording video, popcorn box, binoculars, a tiny banner saying "Don\'t mind me", chaos/fire/drama happening in the background but character is sitting comfortably watching it all unfold. ' +
      'ACCENT: dramatic red and casual white.',
  },
  {
    slug: 'love-r',
    code: 'LOVE-R',
    wtftiName: '上头体质',
    concept:
      'POSE: spinning/twirling mid-air in lovestruck ecstasy — arms hugging self, one leg kicked up behind, head thrown back in swooning delight, floating off the ground carried by infatuation butterflies. ' +
      'EXPRESSION: MAXIMUM heart-eyes — literal star-shaped pupils, cheeks BLAZING neon pink, dopey lovestruck grin ear to ear, biting lower lip slightly, the face of someone who just fell head over heels 5 minutes ago for the 47th time this month. ' +
      'OUTFIT: romantic dreamy — soft pink cardigan with star patterns, cute pleated skirt, ribbon bow in hair, sparkly accessories, everything soft and romantic, blush-tinted everything. ' +
      'PROPS: EXPLOSION of floating stars, sparkles, and butterflies EVERYWHERE, hugging a star-shaped plush pillow tightly, phone screen showing 99+ messages with multiple contacts, spinning music box, floating candy and sweets, rose petals swirling in a vortex, a "crush counter" showing 47, tiny cupid arrows scattered, love letters flying around. ' +
      'ACCENT: hot cherry blossom pink and peach-coral.',
  },
  {
    slug: 'food-ie',
    code: 'FOOD-IE',
    wtftiName: '卡路里文盲',
    concept:
      'POSE: blissed-out food nirvana — sitting with legs spread, surrounded by a MOUNTAIN of food, both hands holding different foods (waffle in one, drumstick in other), head tilted back in food ecstasy. ' +
      'EXPRESSION: transcendent food orgasm — eyes rolled back in pure bliss, cheeks puffed full of food, sauce ALL over mouth and cheeks, drool visible, the face of someone experiencing flavors that changed their life, steam rising from satisfaction. ' +
      'OUTFIT: maximum foodie — oversized apron covered in food stains as a badge of honor, "Calories Don\'t Count" text on t-shirt, chef hat tilted sideways, belly slightly visible and round, chopsticks tucked behind ear like a pen. ' +
      'PROPS: MASSIVE spread of miniature foods EVERYWHERE — hotpot bubbling, boba tea, BBQ skewers, sushi, pizza slice, fried chicken, cake, ice cream, ramen bowl, ALL floating around in abundance. A diet plan paper that\'s been dramatically crossed out and set on fire, food delivery app showing 12 active orders, a scale covered by a towel (deliberately hidden), chopsticks grabbing everything. ' +
      'ACCENT: appetizing warm orange and creamy butter yellow.',
  },
  {
    slug: 'talk-er',
    code: 'TALK-ER',
    wtftiName: '嘴巴关不上',
    concept:
      'POSE: animated storyteller — one hand dramatically gesturing with index finger pointing, other hand cupped around mouth like a megaphone, leaning forward INTO the viewer\'s space, can\'t-be-contained energy. ' +
      'EXPRESSION: mid-sentence explosion — mouth COMICALLY wide open like entire head is a megaphone, eyes wild and animated with each word, eyebrows doing independent dances, veins on neck from volume, spraying tiny saliva sparkles, the face of someone 3 hours into a monologue and JUST getting started. ' +
      'OUTFIT: loud and attention-grabbing — bright patterned shirt with clashing stripes and polka dots simultaneously, stacked colorful bracelets on both wrists, statement earrings, everything LOUD to match the personality. ' +
      'PROPS: TSUNAMI of speech bubbles overflowing in ALL directions filling the entire space, phone call timer showing "5 hours 32 minutes", a broken "PAUSE" button near mouth, multiple people-figurines with hands over their ears, an hourglass that ran out ages ago, a "VOLUME: MAX" meter, sound wave vibes radiating from mouth, a queue of people waiting for their turn to speak (giving up and leaving). ' +
      'ACCENT: electric mint green and shout-level bright blue.',
  },
];

/**
 * 构建 WTFTI 经典宇宙完整 Prompt (v2 — 高张力版)
 * @param {string} characterConcept - 角色视觉描述（来自 WTFTI_CLASSIC_TYPES[].concept）
 * @returns {string} 完整生图 prompt
 */
export function buildWtftiClassicPrompt(characterConcept) {
  return [WTFTI_VISUAL_STYLE, WTFTI_TONE, WTFTI_TRANSFORM_RULES, characterConcept].join('\n\n');
}

export { WTFTI_VISUAL_STYLE, WTFTI_TONE, WTFTI_TRANSFORM_RULES, WTFTI_NEGATIVE };
