// ─── 花TI 花格鉴定 · 水彩植物画风格 ───
// 16 种花格类型，每朵花一张水彩植物学插画
// 风格：柔和水彩、植物图鉴美学、文艺审美
// 纯文生图模式（text2imgMode），无需参考图

const BASE_STYLE =
  'Elegant watercolor botanical illustration. Painted in soft luminous watercolor with delicate wet-on-wet technique, ' +
  'gentle color bleeding at petal edges. Single flower stem or small cluster centered on clean warm cream-white background. ' +
  'Soft natural light from above-left creating gentle petal translucency. ' +
  'Style reference: vintage Royal Botanical Gardens plate meets modern editorial watercolor. ' +
  'Subtle off-white paper texture visible through the paint. Rich yet gentle tones. ' +
  'Absolutely no text, no labels, no captions, no watermarks, no frame, no border. ' +
  'No vase, no pot, no human hands. Just the flower in its natural beauty.';

const NEGATIVE =
  'text, typography, words, labels, watermark, logo, stamp, frame, border, vase, pot, hand, person, ' +
  'busy background, photorealistic, 3D render, cartoon, anime, low poly, plastic, vinyl, inflatable, ' +
  'clay, neon colors, harsh shadows, overprocessed, blurry, ugly, deformed';

function flower(slug, prompt) {
  return {
    slug,
    ref: 'none', // text2img mode, no reference image needed
    prompt: `${BASE_STYLE}\n\n${prompt}\n\nnegative prompt: ${NEGATIVE}`,
  };
}

const flowerImageModule = {
  displayName: '花TI 花格鉴定 Botanical Illustration',
  seriesLabel: '花TI 花格鉴定',
  outputPrefix: 'flower',
  outputSubdir: 'flower',
  text2imgMode: true,
  aspectRatio: '1:1',
  seriesTone: '水彩植物学插画风格，文艺审美，柔和温暖',
  types: [
    flower(
      'rose',
      'A lush garden rose in full bloom. Deep crimson to rich scarlet petals layered in classic ' +
      'spiral form, each petal edge softly bleeding into the cream background. A few smaller buds ' +
      'on the same thorny stem with dark green leaves. The red is saturated and confident — ' +
      'this is a rose that commands the room. Warm golden undertones in the shadows.',
    ),
    flower(
      'sunflower',
      'A radiant sunflower at peak bloom, face turned slightly upward. Bright golden-yellow ray petals ' +
      'surrounding a rich brown-amber disc floret center with visible seed pattern. Thick sturdy green stem ' +
      'with large textured leaves. The yellow glows warm like captured sunlight. Joyful, abundant energy ' +
      'radiates from every petal. Some petals slightly curled at edges showing natural charm.',
    ),
    flower(
      'poppy',
      'A wild field poppy (Papaver rhoeas) with tissue-paper-thin petals in vivid vermilion red-orange. ' +
      'The petals are translucent and delicate, almost crinkled, with a dark velvety black-purple center. ' +
      'Slender hairy stem bends gracefully under the flower\'s weight. One or two seed pods nearby. ' +
      'The watercolor captures the papery fragile quality perfectly — beautiful but ephemeral. ' +
      'Warm orange undertones bleeding softly into the background.',
    ),
    flower(
      'sakura',
      'A branch of Japanese cherry blossoms (Prunus serrulata) in delicate clusters. Soft blush pink ' +
      'to pale shell-pink five-petal flowers, some fully open with visible stamens, some still in bud. ' +
      'Dark reddish-brown bark of the branch provides contrast. A few petals gently falling. ' +
      'The pink is soft and ethereal, never bright — like a watercolor wash barely touching the paper. ' +
      'Captures the fleeting, romantic quality of sakura in spring.',
    ),
    flower(
      'tulip',
      'A single elegant tulip with a smooth cup-shaped bloom. Rich but understated color — deep dusty rose ' +
      'with mauve undertones, the kind of sophisticated muted pink that suggests restraint and taste. ' +
      'Satiny petals with subtle striations visible through the watercolor wash. Strong straight green stem ' +
      'with one broad curving leaf. Minimal, architectural, like a fashion editorial. ' +
      'The elegance is in the simplicity.',
    ),
    flower(
      'daisy',
      'A cheerful cluster of common daisies (Bellis perennis). Pure white petals radiating from ' +
      'sunny golden-yellow button centers. Several flowers at different stages — some fully open, ' +
      'one in profile, a tiny bud. Short stems with rounded green leaves at the base. ' +
      'The white petals are painted with the lightest touch, nearly the paper itself, ' +
      'with soft blue-grey shadows. Simple, honest, and radiantly happy.',
    ),
    flower(
      'dandelion',
      'A dandelion in its magical seed-head stage — a perfect translucent sphere of feathery seeds (achenes). ' +
      'Some seeds are just beginning to detach and drift upward, caught in an invisible breeze. ' +
      'Each tiny seed parachute is painted with extraordinary delicate detail. The stem is slender and ' +
      'slightly curved to one side. A sense of lightness, freedom, and letting go. ' +
      'Soft warm light catches the gossamer seed filaments making them glow.',
    ),
    flower(
      'baby-breath',
      'An airy cloud of baby\'s breath (Gypsophila). Masses of tiny pure white flowers on delicate ' +
      'branching stems creating a soft misty volume. The overall effect is like a gentle white cloud ' +
      'or morning fog. Individual five-petal florets are just barely suggested. Slender pale green stems ' +
      'visible through the mass. Dreamy, ethereal, atmospheric — like painting breath itself. ' +
      'Extremely soft and diffused watercolor technique, almost impressionistic.',
    ),
    flower(
      'red-spider',
      'A red spider lily (Lycoris radiata) with dramatically curling petals that sweep backward ' +
      'like flames. Intense scarlet red with an almost supernatural glow. Long protruding stamens ' +
      'extend far beyond the petals like reaching fingers. The bloom sits atop a single naked stem — ' +
      'no leaves (they don\'t appear with the flowers). Striking, otherworldly, with gothic beauty. ' +
      'The red bleeds dramatically into the paper. Small pool of darker crimson at the center.',
    ),
    flower(
      'lotus',
      'A sacred lotus (Nelumbo nucifera) in serene pink-to-white gradient. Broad cupping petals ' +
      'transition from soft rose-pink at the base to creamy white at the tips. A golden seedpod center ' +
      'with yellow stamens. One large round lotus leaf in muted blue-green behind, with visible veining ' +
      'and a few water droplets beading on its surface. Calm, meditative atmosphere. ' +
      'The watercolor is luminous and clean, with zen-like restraint.',
    ),
    flower(
      'morning-glory',
      'A morning glory vine (Ipomoea) with trumpet-shaped blooms in gradient violet-to-indigo blue, ' +
      'with a white star pattern radiating from the deep throat. Heart-shaped green leaves and delicate ' +
      'curling tendrils wrapping around an invisible support. One fully open flower catching the light, ' +
      'one partially unfurling, one closed bud. The blue-purple watercolor is rich and deep but ' +
      'lightens beautifully toward the edges. A flower that opens with the dawn.',
    ),
    flower(
      'jasmine',
      'A spray of jasmine (Jasminum) with small star-shaped pure white flowers and glossy dark green leaves. ' +
      'The flowers have five rounded petals each, waxy and pristine. Some buds are still closed, ' +
      'showing a faint blush of pink before they open white. Slender woody stem with opposite leaves. ' +
      'The white flowers are painted with minimal pigment — mostly negative space and soft shadow. ' +
      'Quietly beautiful, unassuming. You can almost smell the sweet fragrance from the painting.',
    ),
    flower(
      'cactus',
      'A surprising bloom emerging from a small round cactus (Echinopsis). A large, spectacular flower ' +
      'in hot pink-to-magenta with a luminous white center, disproportionately grand compared to its ' +
      'spiny host. The cactus body is painted in muted sage green with neat rows of spines. ' +
      'The contrast between the tough, defensive exterior and the extravagantly beautiful flower is the story. ' +
      'Warm desert light. The pink petals are soft and silky against the hard geometry of the cactus.',
    ),
    flower(
      'orchid',
      'An elegant moth orchid (Phalaenopsis) with graceful arching stem bearing multiple blooms. ' +
      'Soft ivory-white petals with the faintest blush of lavender-pink, darker spotted lip (labellum) ' +
      'in magenta and gold. The flowers cascade downward in a natural arc. Thick aerial roots ' +
      'suggest independence. Refined, exotic, aristocratic beauty that thrives in solitude. ' +
      'The watercolor is precise yet soft — every vein and spot is delicately rendered.',
    ),
    flower(
      'lavender',
      'A small bouquet of lavender (Lavandula) spikes. Purple-violet tiny florets densely packed ' +
      'on slender upright stems, grey-green narrow aromatic leaves below. Multiple stems at slightly ' +
      'different heights creating a natural cluster. The purple ranges from deep violet in tight buds ' +
      'to soft lilac in open flowers. A calming, meditative presence. The watercolor has a slightly ' +
      'hazy quality, as if the air around the lavender is perfumed and warm.',
    ),
    flower(
      'lily-valley',
      'A dainty stem of lily of the valley (Convallaria majalis). Tiny white bell-shaped flowers ' +
      'hanging in a graceful one-sided raceme, each bell perfectly formed with scalloped edges. ' +
      'Two broad, dark green basal leaves wrap protectively around the flower stem. ' +
      'The flowers are luminously white with the faintest green tinge. Delicate, innocent, woodland beauty — ' +
      'but with a subtle sense of hidden depth (the plant is poisonous). Soft dappled light ' +
      'suggesting a forest floor.',
    ),
  ],
};

export default flowerImageModule;
