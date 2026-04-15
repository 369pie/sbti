// ─── XPTI 情欲人格图谱 · 暗黑唯美乙女风 (Dark Aesthetic) ───
// 12 种情欲人格，暗黑唯美乙女风 (Dark Aesthetic Otome)
// 微醺红/紫红色调为主，性张力与荷尔蒙氛围，女性向审美
// 使用 cardMode: 人格名、代号、标签、金句等文案烘焙在图里

function type(slug, prompt, card) {
  return { 
    slug, 
    ref: `xpti-${slug}.png`,
    concept: prompt, 
    card 
  };
}

const xptiImageModule = {
  displayName: 'XPTI 情欲人格图谱 Card Generator',
  seriesLabel: 'XPTI 情欲人格图谱',
  outputPrefix: 'xpti',
  outputSubdir: 'xpti',
  artStyle: 'dark-aesthetic', // Custom aesthetic flag
  cardMode: true,
  aspectRatio: '3:4',
  themeColor: '#722F37',
  seriesTone:
    '[Overall Style & Visual Hierarchy]\n' +
    'A premium personality atlas card, vertical 3:4 format, DARK YUMEJOSHI FASHION-ILLUSTRATION ANIME STYLE. ' +
    'CRITICAL: The character must be a 2D anime illustration with cel-shaded coloring, clean vector-like linework, and large expressive eyes. ABSOLUTELY NO photorealistic skin, NO 3D render, NO realistic human proportions, NO uncanny valley. ' +
    'The art style is polished, magazine-cover worthy, and alluring — like a high-end shoujo anime promotional illustration with modern fashion sensibility. ' +
    'Color palette is strictly deep wine red, dark violet, muted rose, and warm burgundy (#722F37). No cold blues or neon greens. ' +
    'Background is a smooth dark gradient with subtle glassmorphism light particles and soft breathing glow. Keep it simple and dark so the character pops. ' +
    'CRITICAL LAYER RULE (Z-INDEX): All typography (text) MUST be on the absolute top layer (foreground). The central anime character MUST be on the layer behind the text. The character is large and occupies 50% to 60% of the canvas, BUT whenever the character and text intersect, the TEXT MUST CLEARLY OVERLAY THE CHARACTER. The character must NEVER obscure, block, or hide any part of the text.',
  types: [
    type(
      'switch',
      'Centered: A stylish anime figure with an unmistakable dominant aura. Sharp, confident eyes staring directly at the viewer. Wearing a sleek dark high-collar coat or fitted uniform in deep burgundy and black. Holding a small chess piece or silver lighter near their face. Sharp cel-shaded lighting with a crisp rim light. Close-up to half-body composition. Clean linework, large expressive eyes, 2D illustration.',
      {
        name: '开关在我手里',
        code: 'XPTI-01',
        tagline: '全场你最大',
        tags: ['#掌控系', '#气场压制', '#节奏大师'],
        quote: '你负责感受，我来安排一切。',
      }
    ),
    type(
      'mind-theater',
      'Centered: A mysterious anime character with wistful, slightly obsessive eyes, surrounded by floating glowing film strips and translucent cinema tickets. Soft curls or messy elegant hair. Deep purple and crimson cel-shaded lighting. Half-body shot. Dreamy, introspective expression. Clean anime linework, no photorealism.',
      {
        name: '颅内放映厅',
        code: 'XPTI-02',
        tagline: '脑子里已经拍完八集',
        tags: ['#脑内剧场', '#深夜文学系', '#余震体质'],
        quote: '你还没开口，我脑子里的大结局已经写好了。',
      }
    ),
    type(
      'all-in',
      'Centered: An anime character leaning forward with intense dedication, holding a single glowing red poker chip or a burning playing card between their fingers. Eyes wide and luminous with emotion. Dark background with warm gold and red accent lighting. Half-body. Cel-shaded, fashion-illustration quality, large sparkling eyes.',
      {
        name: '全押型玩家',
        code: 'XPTI-03',
        tagline: '要么全部，要么不开始',
        tags: ['#极致投入', '#纯爱偏执', '#全情体质'],
        quote: '输赢都接受，但不接受"差不多"。',
      }
    ),
    type(
      'synesthete',
      'Centered: An ethereal anime figure with eyes gently closed, glowing fingertips brushing a flowing silk ribbon. Soft amber and deep rose cel-shaded highlights. Fragile yet dangerous vibe. Half-body. Clean vector-like anime lines, delicate facial features, serene expression. Dark simple background.',
      {
        name: '通感体质',
        code: 'XPTI-04',
        tagline: '碰一下手指全身都记住',
        tags: ['#五感全开', '#身体记忆', '#细节收集癖'],
        quote: '你的气味，我的手臂还记得。',
      }
    ),
    type(
      'charge',
      'Centered: An energetic anime character with restless, hungry eyes, bathed in vivid neon red and deep magenta cel-shaded light. Wearing modern dark streetwear with subtle glowing tech accessories like cables or earpieces. Three-quarter body. Dynamic pose. Sharp clean anime lines, no 3D render.',
      {
        name: '电量焦虑',
        code: 'XPTI-05',
        tagline: '永远在找下一个充电桩',
        tags: ['#快充体质', '#微波炉恋爱', '#刺激依赖'],
        quote: '不是不爱，是一个人根本不够充。',
      }
    ),
    type(
      'slow-burn',
      'Centered: An elegant anime figure holding a vintage hourglass or a slowly burning candle. Calm, patient eyes with a deeply intense underlying warmth. Warm amber and dark mahogany lighting. Half-body. Refined clothing in dark velvet tones. Clean anime illustration style, serene beautiful face.',
      {
        name: '慢火收藏家',
        code: 'XPTI-06',
        tagline: '越熟越沉越上头',
        tags: ['#慢热致命', '#深度成瘾', '#旧物偏执'],
        quote: '找到了就反复确认——每一次都比上一次更深。',
      }
    ),
    type(
      'night-writer',
      'Centered: An alluring anime character illuminated by the soft glow of a screen or moonlight against pure darkness. One hand touching a crisp white collar while their shadowed expression hints at something wild. Large expressive eyes with a hidden spark. Half-body. Cel-shaded, dual-personality vibe.',
      {
        name: '深夜编剧',
        code: 'XPTI-07',
        tagline: '外表平静脑子里全是R18',
        tags: ['#暗涌系', '#双重人格', '#文字型性感'],
        quote: '白天我是正经人，晚上的脑子你不敢看。',
      }
    ),
    type(
      'screamer',
      'Centered: A wild, expressive anime character holding a microphone or screaming silently with an ecstatic, joyful expression. Bright contrasting neon red and violet rim lights. Rock-chic dark outfit with accessories. High energy pose. Three-quarter body. Bold clean anime linework, dynamic hair movement.',
      {
        name: '尖叫机器',
        code: 'XPTI-08',
        tagline: '平淡是最高级的酷刑',
        tags: ['#感官过载', '#活在当下', '#刺激收集'],
        quote: '你不给我刺激我会死。（字面意思。）',
      }
    ),
    type(
      'sober-addict',
      'Centered: A flawless anime figure with cool, calculating eyes, but their hand is gripping a deep red rose too tightly. Contrast between absolute control and hidden passion. Medical or pure white clothing accents against a bleeding crimson background. Close-up to half-body. Clean sharp anime features.',
      {
        name: '清醒上瘾',
        code: 'XPTI-09',
        tagline: '知道在干什么但就是停不下来',
        tags: ['#理智沦陷', '#知行分裂', '#高功能上瘾'],
        quote: '我完全清楚这不理性，然后继续。',
      }
    ),
    type(
      'whatever',
      'Centered: A detached, effortlessly cool anime character lying back or leaning casually against a dark wall. Half-lidded large eyes, completely relaxed expression. Soft muted mauve and slate gray lighting. Simple dark cozy outfit. Half-body. Minimalist anime illustration, clean soft linework.',
      {
        name: '也行体质',
        code: 'XPTI-10',
        tagline: '你来我不拒你走我不追',
        tags: ['#佛系情欲', '#走留随意', '#无压感'],
        quote: '有你很好，没你也行。（真心的。）',
      }
    ),
    type(
      'masked',
      'Centered: A seductive anime character partially adjusting an elegant masquerade mask or holding a delicate fan. A sly, knowing smile with hypnotic large eyes. Sharp shadows emphasizing hidden vs revealed. Luxurious dark outfit with lace or ribbon details. Half-body. Clean anime illustration, no realism.',
      {
        name: '面具系玩家',
        code: 'XPTI-11',
        tagline: '你看到的是我的第三层',
        tags: ['#反差萌', '#表演型人格', '#层层解锁'],
        quote: '我有很多面——你能解锁几面取决于你的权限。',
      }
    ),
    type(
      'elastic',
      'Centered: A playful, flexible anime character tangling a piece of bright red yarn or elastic cord between elegant fingers. An inviting, open, slightly teasing expression with sparkling eyes. Dark background with subtle warm highlights. Half-body. Fashion-illustration anime quality, clean lines.',
      {
        name: '弹力边界',
        code: 'XPTI-12',
        tagline: '别问行不行，先试试再说',
        tags: ['#开放系', '#体验至上', '#什么都可聊'],
        quote: '没有什么是不能聊的，也没有什么是不能试的。',
      }
    )
  ]
};

export default xptiImageModule;