// ─── 鸟TI · 鸟类宇宙 · Low-Poly 纸艺风格图鉴 ───
// 29 种鸟格映射，低多边形几何纸艺风格
// 纯 text2img 模式，无需参考图
// 每只鸟基于真实鸟类外观 + low-poly 几何化处理

const BIRD_STYLE_SUFFIX =
  'Low-poly paper craft style, geometric faceted triangular surfaces, ' +
  'clean sharp edges, minimal triangle count but highly recognizable bird silhouette. ' +
  'Cute proportions with slightly oversized head, round expressive stylized eyes. ' +
  'Standing or perching pose, facing slightly left at 3/4 angle. ' +
  'Pure white background, full body visible including feet/claws and tail. ' +
  'Soft ambient lighting with subtle shadow underneath. ' +
  'Digital illustration, no text, no watermark, no background elements, no humans.';

function bird(slug, concept) {
  return {
    slug,
    ref: 'boss.png',
    prompt: concept + ' ' + BIRD_STYLE_SUFFIX,
  };
}

const birdImageModule = {
  displayName: '鸟TI · 鸟格图鉴 Low-Poly Generator',
  seriesLabel: '鸟TI 鸟格图鉴',
  outputPrefix: 'bird',
  outputSubdir: 'bird',
  text2imgMode: true,
  aspectRatio: '1:1',
  seriesTone: 'Low-poly 几何纸艺风格鸟类图鉴，每只鸟基于真实配色的几何化处理，干净辨识度高。',
  types: [
    bird('boss',
      'A majestic eagle (鹰) in low-poly geometric style. Dark brown and golden-brown faceted body, ' +
      'powerful hooked beak, piercing golden eyes with intense gaze, broad angular wings slightly folded, ' +
      'strong talons gripping a minimal perch. Body language radiates authority and dominance. ' +
      'Color palette: deep brown (#7C3A1C), golden amber accents.'),

    bird('nerd',
      'A wise great horned owl (猫头鹰) in low-poly geometric style. Rich brown and beige faceted feathers, ' +
      'enormous round yellow eyes that seem to analyze everything, distinctive ear tufts made of angular triangles, ' +
      'slightly tilted head suggesting curiosity. Sitting upright on a branch with dignified posture. ' +
      'Color palette: deep brown (#4A3728), warm beige accents.'),

    bird('ctrl',
      'A fussy mother hen (母鸡) in low-poly geometric style. Warm golden-brown and cream faceted feathers, ' +
      'small alert eyes with a slightly judgmental expression, red geometric comb on top, ' +
      'body posture leaning forward as if about to scold someone. Wings slightly raised in a protective gesture. ' +
      'Color palette: golden brown (#B8860B), red comb, cream body.'),

    bird('mum',
      'A generous pelican (鹈鹕) in low-poly geometric style. White and warm cream faceted body, ' +
      'enormous geometric throat pouch that looks like it could hold everything, long flat beak, ' +
      'kind gentle eyes with a slightly tired but caring expression. Standing with pouch slightly open. ' +
      'Color palette: warm amber (#E8A042), white body, pale orange pouch.'),

    bird('simp',
      'A stunning peacock (孔雀) in low-poly geometric style. Iridescent teal-blue and emerald green faceted body, ' +
      'tail feathers fanned out in full display showing geometric eye patterns in blue-green-gold, ' +
      'proud upright posture, small crown-like crest on head. Expression is pure "look at me" confidence. ' +
      'Color palette: teal (#0E7490), emerald green, gold accents.'),

    bird('solo',
      'An elegant black swan (黑天鹅) in low-poly geometric style. Sleek jet-black faceted body, ' +
      'long curved S-shaped neck, striking red-orange beak with geometric detail, ' +
      'cool aloof expression with half-lidded eyes. Standing tall with wings slightly tucked, radiating unapproachability. ' +
      'Color palette: deep black-blue (#1C1C2E), red beak accent.'),

    bird('sleep',
      'A sleepy brown wood owl (褐林鸮) in low-poly geometric style. Soft brown and tan faceted feathers, ' +
      'large round eyes that are half-closed in a drowsy expression, fluffy round body shape, ' +
      'head slightly tilted and drooping. Sitting on a branch looking like it might fall asleep any second. ' +
      'Color palette: warm brown (#5C4033), tan and cream.'),

    bird('game-r',
      'A hoarding Eurasian jay (松鸦) in low-poly geometric style. Beautiful blue-wing patches with black barring, ' +
      'pinkish-brown body, black mustache stripe, raised crest feathers showing excitement. ' +
      'Clutching something small in its beak with possessive bright eyes. Alert, energetic stance. ' +
      'Color palette: blue (#3B7DD8), pinkish-brown, black accents.'),

    bird('drunk',
      'A chatty sun parakeet (太阳鹦鹉) in low-poly geometric style. Vivid golden-yellow and orange faceted body, ' +
      'green wing tips, bright eyes wide open, beak open as if mid-squawk. ' +
      'Animated energetic posture with feathers slightly ruffled from excitement. Radiates loudness. ' +
      'Color palette: golden yellow (#F59E0B), orange, green accents.'),

    bird('rebel',
      'A rebellious penguin (企鹅) in low-poly geometric style. Classic black and white faceted body, ' +
      'stubby wings held at sides in a "I don\'t care" pose, slightly defiant tilt to the head, ' +
      'beak slightly raised with an attitude. Standing firmly with flippers out. Expression says "nope". ' +
      'Color palette: deep navy (#1E293B), white chest, orange beak and feet.'),

    bird('oh-no',
      'A composed duck (鸭子) in low-poly geometric style. Green iridescent head (mallard), brown-olive body, ' +
      'flat orange beak, calm dignified expression on face but feet positioned as if paddling frantically. ' +
      'Surface composure hiding inner chaos. Floating posture with visible orange feet below. ' +
      'Color palette: olive green (#4B7A4B), iridescent green head, orange beak/feet.'),

    bird('thin-k',
      'A dramatic flamingo (火烈鸟) in low-poly geometric style. Vibrant hot pink faceted body, ' +
      'long curved neck in an elegant S-shape, standing on one leg in classic pose, ' +
      'expressive eyes with a theatrical look. Geometric pink triangles creating flowing body shape. ' +
      'Color palette: hot pink (#E0458B), coral accents, black beak tip.'),

    bird('drama',
      'A determined woodpecker (啄木鸟) in low-poly geometric style. Black and white patterned faceted body, ' +
      'striking red crest on top of head, strong pointed beak, focused intense eyes. ' +
      'Clinging to the side of a minimal geometric tree trunk, head pulled back ready to peck. ' +
      'Color palette: red (#B91C1C), black and white body.'),

    bird('chill',
      'A chill pigeon (鸽子) in low-poly geometric style. Soft grey and white faceted body, ' +
      'iridescent green-purple neck sheen, round plump body shape suggesting comfort, ' +
      'half-lidded relaxed eyes, slightly puffed up chest. Standing on ground in a completely unbothered pose. ' +
      'Color palette: grey (#6B7280), purple-green neck iridescence.'),

    bird('emo',
      'A moody nightjar (夜鹰) in low-poly geometric style. Dark mottled brown and grey faceted feathers, ' +
      'enormous dark eyes adapted for night vision, wide flat head, tiny beak. ' +
      'Hunched posture sitting on ground with a brooding melancholic expression. Mysterious and dark. ' +
      'Color palette: deep indigo (#312E81), dark brown, grey.'),

    bird('than-k',
      'A cheerful European robin (知更鸟) in low-poly geometric style. Warm brown back feathers, ' +
      'distinctive bright orange-red breast patch, round fluffy body shape, bright sparkly eyes, ' +
      'tiny beak slightly open as if singing happily. Perched upright with an irrepressibly positive vibe. ' +
      'Color palette: orange (#EA580C), warm brown, cream.'),

    bird('woc',
      'A street-smart crow (乌鸦) in low-poly geometric style. Sleek jet-black faceted body, ' +
      'sharp intelligent eyes with a knowing sideways glance, strong dark beak slightly open in a smirk, ' +
      'confident upright posture radiating "I know what\'s up" energy. Feathers have subtle blue-purple iridescence. ' +
      'Small puff of breath/steam from beak suggesting a dismissive "hmph". Tough and streetwise aura. ' +
      'Color palette: blue-black (#1D4ED8 tinted), dark iridescent purple highlights.'),

    bird('party',
      'A loud Asian koel/噪鹃 in low-poly geometric style. Sleek dark blue-black faceted body for male koel, ' +
      'bright red eyes, beak wide open in a dramatic call, throat feathers ruffled with effort. ' +
      'Dynamic pose as if producing an impossibly loud sound. Full of energy and noise. ' +
      'Color palette: deep purple (#7C3AED), blue-black, red eyes.'),

    bird('talk-er',
      'A friendly budgerigar/虎皮鹦鹉 in low-poly geometric style. Bright lime green and yellow faceted body, ' +
      'distinctive black scalloped wing markings, small cute face with blue cere (nose), ' +
      'perched close and leaning forward eagerly as if greeting someone. Radiates friendliness. ' +
      'Color palette: lime green (#16A34A), yellow, black wing bars.'),

    bird('love-r',
      'A devoted white swan (天鹅) in low-poly geometric style. Pure white faceted body with elegant curves, ' +
      'long graceful neck forming a heart shape when combined with reflection, orange-black beak, ' +
      'gentle loving eyes. Standing in shallow water with serene devotion. Romantic aura. ' +
      'Color palette: pure white (#F9FAFB), orange beak, soft grey shadows.'),

    bird('food-ie',
      'A well-fed emperor penguin (帝企鹅) in low-poly geometric style. Large round plump body, ' +
      'golden-yellow ear patches and upper chest gradient, blue-grey back, white belly that looks very full, ' +
      'content satisfied expression, small flippers at sides. Slightly wider/rounder than typical penguin. ' +
      'Color palette: orange (#F97316), golden-yellow, blue-grey, white.'),

    bird('atm-er',
      'A hyperactive hummingbird (蜂鸟) in low-poly geometric style. Tiny iridescent body with emerald green ' +
      'and ruby red throat patch, long thin beak, wings shown as a blur of geometric motion lines. ' +
      'Hovering in mid-air with incredible energy. Dynamic pose suggesting constant movement. ' +
      'Color palette: cyan (#06B6D4), emerald green, ruby red throat.'),

    bird('dior-s',
      'A vain bird of paradise (极乐鸟) in low-poly geometric style. Spectacular violet-purple body, ' +
      'elaborate decorative tail feathers with geometric wire-like extensions, iridescent blue breast shield, ' +
      'posing as if mid-mating-dance. Expression is pure vanity and self-admiration. Fabulous. ' +
      'Color palette: purple (#A855F7), iridescent blue, yellow accents.'),

    bird('sexy',
      'A gorgeous mandarin duck (鸳鸯) in low-poly geometric style. Male plumage: orange sail feathers, ' +
      'purple crest, green and copper metallic head, white eye stripe, multicolored body. ' +
      'The most colorful duck, floating on water with natural effortless beauty. ' +
      'Color palette: red (#DC2626), orange, purple, green, copper — full spectrum.'),

    bird('fake',
      'A cunning cuckoo (杜鹃) in low-poly geometric style. Sleek grey faceted body with barred underparts, ' +
      'long tail, slightly shifty sideways-glancing eyes, unremarkable appearance that helps it blend in. ' +
      'Sitting on a branch near another bird\'s nest with a calculated casual expression. ' +
      'Color palette: warm grey (#78716C), barred white-grey belly.'),

    bird('malo',
      'A stoic eagle owl (雕鸮) in low-poly geometric style. Large imposing body, brown and cream mottled facets, ' +
      'enormous orange eyes with an absolutely deadpan expression that never changes, prominent ear tufts, ' +
      'sitting perfectly still staring directly at viewer. Pure poker face energy. ' +
      'Color palette: warm stone (#57534E), orange eyes, cream chest.'),

    bird('luck-y',
      'A lucky magpie (喜鹊) in low-poly geometric style. Striking black and white faceted body, ' +
      'iridescent blue-green sheen on wings and long tail, alert cheerful expression, ' +
      'perched proudly with tail raised. Chinese symbol of good fortune. Energetic upbeat pose. ' +
      'Color palette: blue (#2563EB), blue-black, white, iridescent green.'),

    bird('joke-r',
      'A goofy sulphur-crested cockatoo (凤头鹦鹉) in low-poly geometric style. Pure white faceted body, ' +
      'dramatic yellow crest feathers fanned out, playful mischievous expression, head tilted at funny angle, ' +
      'one foot raised in a dancing pose. Radiates comedy and fun. ' +
      'Color palette: rose pink (#F43F5E accent), white body, yellow crest.'),

    bird('shy',
      'A shy barn owl (仓鸮) in low-poly geometric style. Distinctive heart-shaped white facial disc, ' +
      'golden-buff and grey faceted body, enormous dark eyes in the white face, ' +
      'hunched small posture trying to make itself invisible. Pressed against a surface as if hiding. ' +
      'Color palette: warm cream (#D4C5A9), white face, golden-buff body.'),
  ],
};

export default birdImageModule;
