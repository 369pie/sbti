/**
 * Mysti Tarot · 风格测试沙盒
 *
 * 6 张样图：方向 A (Mystic Mondays 极简) / 方向 C (水彩植物) / 方向 D (新中式工笔)
 *           × {boss 皇帝, love-r 恋人}
 *
 * 文字策略：本轮验证 nano-banana 模型的英文/中文/罗马数字渲染能力，所以 prompt
 *   里直接要求带 罗马数字 + 牌名 + 边框装饰，不再依赖前端叠字。
 *
 * 输出: public/images/mysti/_style-test/{slug}.png
 *
 * 跑法:
 *   RUNNINGHUB_TEXT2IMG_ENDPOINT=/rhart-image-n-g31-flash/text-to-image \
 *     node scripts/generate-type-images.mjs mysti-style-test
 */

const SHARED_FRAME =
  'tarot card layout with decorative border frame, top center showing roman numeral, ' +
  'bottom center showing card name in clear typography, vertical 2:3 card composition, ' +
  'sharp text rendering, no watermark';

export default {
  displayName: 'Mysti Tarot 风格测试 · 6 张',
  seriesLabel: 'Mysti 风格调研',
  outputPrefix: 'mysti-style',
  seriesTone: '6 张沙盒图，验证 A/C/D 三方向 × {boss, love-r}',
  text2imgMode: true,
  aspectRatio: '2:3',
  typesDir: '../public/images/mysti',
  outputSubdir: '_style-test',
  types: [
    // ─────────── 方向 A · Mystic Mondays 现代极简 ───────────
    {
      slug: 'A-boss',
      prompt:
        'modern minimalist tarot card illustration in the style of Mystic Mondays Tarot, ' +
        'flat geometric vector style, holographic pastel palette of warm ochre #C9A676 ' +
        'and rose clay #C07A8E on cream #FAF8F5 background, central symbol: a stylized ' +
        'golden mountain peak with a small crown floating above, surrounded by simple ' +
        'geometric sun rays, four tiny triangle motifs at the corners, subtle paper grain ' +
        'texture, decorative thin gold border frame, ' +
        'roman numeral "IV" rendered crisp at top center in elegant serif, ' +
        'card name "THE EMPEROR" in clean small-cap serif at bottom center, ' +
        'no characters, no other text, contemporary tarot deck aesthetic. ' + SHARED_FRAME,
    },
    {
      slug: 'A-lover',
      prompt:
        'modern minimalist tarot card illustration in the style of Mystic Mondays Tarot, ' +
        'flat geometric vector style, dreamy pastel palette of dusty rose #E5B5C0, ' +
        'sage green #B5C9A8 and cream #FAF8F5, central symbol: two interlocking abstract ' +
        'hands forming a heart, a small crescent moon and sun above, scattered tiny stars ' +
        'and dots around, subtle paper grain texture, decorative thin gold border frame, ' +
        'roman numeral "VI" rendered crisp at top center in elegant serif, ' +
        'card name "THE LOVERS" in clean small-cap serif at bottom center, ' +
        'no characters, no other text, contemporary tarot deck aesthetic. ' + SHARED_FRAME,
    },

    // ─────────── 方向 C · 水彩植物塔罗 ───────────
    {
      slug: 'C-boss',
      prompt:
        'delicate watercolor botanical tarot illustration in the style of Threads of Fate ' +
        'and Linestrider Tarot, soft transparent washes of warm ochre #C9A676 and deep ' +
        'forest green, single subject: a majestic ancient pine tree standing alone with ' +
        'small golden crown floating above its top, four tiny watercolor stars at corners, ' +
        'fine pencil outlines visible, lots of negative space on cream #FAF8F5 paper ' +
        'background, gold leaf accent on top right corner, hand-painted decorative thin ' +
        'border frame, roman numeral "IV" hand-lettered at top center in soft brown, ' +
        'card name "THE EMPEROR" hand-lettered in serif at bottom center, ' +
        'no characters, watercolor texture, museum botanical card aesthetic. ' + SHARED_FRAME,
    },
    {
      slug: 'C-lover',
      prompt:
        'delicate watercolor botanical tarot illustration in the style of Threads of Fate ' +
        'and Linestrider Tarot, soft transparent washes of dusty rose #C07A8E and pale ' +
        'sage, single subject: two intertwined peony stems forming a soft heart shape, ' +
        'a small watercolor crescent moon above, scattered tiny floating petals, fine ' +
        'pencil outlines, lots of negative space on cream #FAF8F5 paper background, ' +
        'gold leaf accent on bottom left corner, hand-painted decorative thin border ' +
        'frame, roman numeral "VI" hand-lettered at top center in soft rose, ' +
        'card name "THE LOVERS" hand-lettered in serif at bottom center, ' +
        'no characters, watercolor texture, museum botanical card aesthetic. ' + SHARED_FRAME,
    },

    // ─────────── 方向 D · 新中式小印工笔 ───────────
    {
      slug: 'D-boss',
      prompt:
        'contemporary Chinese gongbi-inspired tarot illustration, mineral pigment palette ' +
        'of azurite blue 石青, cinnabar red 朱砂 and gold leaf 描金, single subject: a ' +
        'lone crane standing on a stylized rocky peak under a small full moon, traditional ' +
        'cloud pattern 云纹 in corners, fine gold outline 描金线, silk-scroll cream ' +
        'background with subtle texture, decorative seal-square border frame in cinnabar ' +
        'red, roman numeral "肆" (Chinese numeral 4) rendered crisp at top center in ' +
        'seal script 篆书, card name "君座" rendered crisp at bottom center inside a ' +
        'small red seal square in seal script, ' +
        'no characters, no English text, museum-quality scroll painting aesthetic. ' + SHARED_FRAME,
    },
    {
      slug: 'D-lover',
      prompt:
        'contemporary Chinese gongbi-inspired tarot illustration, mineral pigment palette ' +
        'of cinnabar red 朱砂, azurite blue 石青 and gold leaf 描金, single subject: a ' +
        'pair of mandarin ducks 鸳鸯 swimming together among lotus flowers under a ' +
        'crescent moon, traditional cloud pattern 云纹 around, fine gold outline 描金线, ' +
        'silk-scroll cream background with subtle texture, decorative seal-square border ' +
        'frame in cinnabar red, roman numeral "陆" (Chinese numeral 6) rendered crisp ' +
        'at top center in seal script 篆书, card name "双生" rendered crisp at bottom ' +
        'center inside a small red seal square in seal script, ' +
        'no characters, no English text, museum-quality scroll painting aesthetic. ' + SHARED_FRAME,
    },
  ],
};
