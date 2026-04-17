// ─── Mysti Tarot v2 · 29 人格化塔罗大牌 ───
// 取代 generate-mysti-tarot-placeholders.mjs 输出的 emoji-style 占位
// 输出到 public/images/mysti/tarot/v2/{slug}.png（与旧的 root 占位并存，便于 A/B）
// 直接对应 src/lib/mysti/tarot-mapping.ts 中 29 个 personality slug
// 配色与主品牌 v3 老钱米对齐：暮光紫黑 + rose-clay #C07A8E 主色 + gold-leaf #C9A676

const TAROT_STYLE_SUFFIX =
  '一张竖版 2:3 高级感塔罗占卜卡牌封面（不显示任何文字、标题、数字、罗马字、签名、水印、UI 元素）。' +
  '气质是当代东亚都市灵性图鉴 + 古典塔罗象征 + 玫瑰金老钱美学的融合，' +
  '不是欧美中世纪复古塔罗，也不是廉价网红国风。' +
  '画面采用编辑画报式（editorial illustration）半写实笔触，主体是该人格原型的拟人化或象征物，' +
  '融合所对应的大阿卡纳象征（皇帝/皇后/恋人/隐士/愚人/魔术师/战车/正义/审判/恶魔/力量/节制/星星/太阳/女祭司/命运之轮/倒吊人 等）。' +
  '光源戏剧化、有月光或烛光质感；背景是暮光紫黑（deep twilight purple #1a1530 → #231A3A）渐变带星辉粒子。' +
  '边缘隐约有金箔（gold leaf #C9A676）几何装饰花纹（细线条几何/星图/月相），不是中世纪繁复纹样。' +
  '主体配色以玫瑰陶土（rose clay #C07A8E）为重点情绪口音，避免大红大紫，整体克制神秘。' +
  '画面留出上下边缘做塔罗框留白，主体居中、面对观众。' +
  '—— negative prompt: text, typography, letters, words, Chinese characters, English, Roman numerals, numbers, caption, label, watermark, logo, UI, ' +
  'cheap fortune-teller kitsch, generic Rider-Waite copy, anime cell-shading, low-poly, paper craft, ' +
  'multiple panels, busy collage, NSFW, gore, horror, deformed face, extra limbs.';

function tarot(slug, personaName, arcanaName, conceptZh) {
  return {
    slug,
    prompt:
      `一张「${personaName}」人格塔罗卡，对应大阿卡纳「${arcanaName}」原型。` +
      conceptZh +
      TAROT_STYLE_SUFFIX,
  };
}

const mystiTarotModule = {
  displayName: 'Mysti Tarot v2 · 29 人格化大阿卡纳',
  seriesLabel: 'Mysti 灵鉴',
  outputPrefix: 'mysti-tarot', // 实际不使用，因为有 outputSubdir
  outputSubdir: 'tarot/v2',
  text2imgMode: true,
  aspectRatio: '2:3',
  seriesTone: '暮光紫黑 + 玫瑰金 + 月相星图金箔，当代都市灵性塔罗图鉴。',
  typesDir: '../public/images/mysti', // 输出落到 public/images/mysti/tarot/v2/
  types: [
    // ─── Group I · 控制组 → The Emperor ───
    tarot('boss',     '人形方向盘 BOSS',  'The Emperor',
      '画面：一位端坐高背王座的当代都市女性背影，手持一根细金权杖，王座靠背是简约几何的山形纹章，脚下是大理石地板的反光，远景是夜色中俯瞰城市的玻璃落地窗。气质：掌控、清醒、不动声色的统治。'),
    tarot('ctrl',     '人形 KPI CTRL',    'The Emperor',
      '画面：一位身穿米色 high-waisted 西装的女性侧面剪影，手中握着一支极细的金色尺规，前方悬浮着规整发光的网格线条，地面延伸出整齐的大理石棋盘格。气质：边界分明、把规则刻进骨子里。'),
    tarot('oh-no',    '应激选手 OH-NO',  'The Emperor',
      '画面：一位绷紧肩颈的女性正面像，双手悬在半空像在守住一个透明球体，球体表面正在出现细微裂痕，背景是即将崩塌的几何高塔轮廓。气质：紧绷到极限的控制。'),
    tarot('thin-k',   '过度脑补 THIN-K', 'The Emperor',
      '画面：一位戴着金色细框眼镜的女性低头托腮，头部周围悬浮着无数透明的几何线框与逻辑流程箭头，金线在头顶交织成一座细密的塔。气质：用逻辑筑墙的智性帝王。'),

    // ─── Group II · 情感组 → The Empress / The Lovers ───
    tarot('mum',      '操心破产户 MUM',  'The Empress',
      '画面：一位坐在繁茂藤蔓与草本植物中的丰盈女性，怀中托着一只发光的小光球，手指间缠绕着花根，温暖金光从胸口流向四周植物。气质：天生的滋养者。'),
    tarot('simp',     '倒贴甲方 SIMP',   'The Empress',
      '画面：一位单膝跪地、双手捧出一颗自己心脏发光物的女性，金色血脉从胸口拉出长长的细线连接远方一个模糊的剪影，地面是凋谢的玫瑰花瓣。气质：单向流出的丰盈。'),
    tarot('atm-er',   '人形 ATM',         'The Empress',
      '画面：一位优雅站立的女性，胸前敞开形成一个发光的金色拱门，从中流出金币、玫瑰、信封等丰盛物，但她的脸隐在阴影中。气质：用资源换连接的丰盛。'),
    tarot('than-k',   '记账感恩 THAN-K', 'The Empress',
      '画面：一位双手合十微微低头的女性，掌心间漂浮着一朵金色细线编织的花，背后悬浮着一本翻开的发光账册，记录着无数细小的恩情。气质：温柔却负重的回馈。'),
    tarot('love-r',   '深陷恋人 LOVE-R', 'The Lovers',
      '画面：两个剪影在暮色中相对而立，他们之间漂浮着一颗发光的玫瑰心脏，金色的血脉同时连接两人的胸口，背景是融合的双月。气质：深爱中的合一与迷失。'),

    // ─── Group III · 独处组 → The Hermit ───
    tarot('solo',     '一米结界 SOLO',   'The Hermit',
      '画面：一位独自坐在山顶岩石上的女性背影，手中提着一盏小小的金色月光灯，脚边是一圈柔和发光的光晕结界，远方是星河与云海。气质：自足的隐者。'),
    tarot('nerd',     '人间收藏夹 NERD',  'The Hermit',
      '画面：一位侧面坐在悬浮书堆中的女性，手中提着一盏带有六边形几何灯罩的金色提灯，灯光照亮无数古籍与符号，头顶是星图。气质：在知识深渊中独自发光的求知者。'),
    tarot('shy',      '自带结界 SHY',     'The Hermit',
      '画面：一位将自己半隐在长发与暮色中的女性侧脸，手中提着一盏极小的萤火灯，身周漂浮着几片飘落的秋叶与一圈淡淡光晕。气质：观察者的退缩与敏锐。'),

    // ─── Group IV · 表达组 → The Fool / Magician / Chariot ───
    tarot('drama',    '人形舞台剧 DRAMA','The Fool',
      '画面：一位张开双臂在悬崖边缘起舞的女性，身后是飘扬的玫瑰金色长袍，脚边一只小白犬正欢快跳跃，背景是日出的紫粉色云海。气质：戏剧化的纯粹释放。'),
    tarot('party',    '蹦迪人格 PARTY',   'The Fool',
      '画面：一位双臂高举头微仰的女性剪影，身边漂浮着无数发光的玫瑰金粒子与碎光带，脚下是悬浮的玻璃台，远景是星夜下的城市天际线。气质：当下狂欢、拥抱悬崖。'),
    tarot('talk-er',  '万能嘴替 TALK-ER','The Magician',
      '画面：一位单手指天单手指地的女性立像，手中漂浮着一支金色羽毛笔与一根魔杖，身周环绕着透明的语言波纹与符号，背景是月相循环。气质：语言显化的魔术师。'),
    tarot('joker',    '解构小丑 JOKER',   'The Fool',
      '画面：一位戴着半透明笑脸面具的女性，一手轻抬另一手垂落，面具背后露出真实平静的表情，脚下散落着几张扑克牌。气质：用幽默解构世界的智者。'),
    tarot('drunk',    '酒后真人 DRUNK',  'The Chariot',
      '画面：一位倚靠在金色双轮战车上的女性，手中倾倒着一只酒杯，金色酒液与星河流淌至地面，战车两侧是一黑一白两只朦胧的兽影，缰绳松垮。气质：失去缰绳的意志力。'),

    // ─── Group V · 反叛组 → Justice / Judgement ───
    tarot('rebel',    '人形质疑机 REBEL','Justice',
      '画面：一位单手举起一柄发光金色天秤的女性，另一手垂于身侧握着一柄极细的剑，眼神坚定向前，背景是石柱之间洒下的光。气质：天生的衡平者。'),
    tarot('woc',      '粗口审判官 WOC',  'Judgement',
      '画面：一位仰头吹响金色长号的女性，号声化作发光的弧形声波撕裂前方的雾，她身后浮现出无数小小的觉醒人影，背景是云层裂开的光柱。气质：粗暴而真诚的真相号角。'),

    // ─── Group VI · 沉溺组 → The Devil / Strength / Temperance / The Star ───
    tarot('game-r',   '电子斯德 GAME-R', 'The Devil',
      '画面：一位坐在悬浮发光屏幕前的女性，手中握着一只金色游戏手柄，柄连出的金色细链轻轻缠绕在她的手腕上，屏幕里是一座倒映她的虚拟王国。气质：在虚拟里建立掌控。'),
    tarot('food-ie',  '味觉先锋 FOOD-IE','Strength',
      '画面：一位优雅举起一只发光石榴或金色梨的女性，另一手温柔抚摸一只匍匐在脚边的小狮子，背景是繁茂的果实藤蔓。气质：驯服欲望的力量牌。'),
    tarot('sexy',     '性感本能 SEXY',    'The Devil',
      '画面：一位从镜中走出的女性背影，肩上披着深红丝绸，手指轻拨自己的脖颈，脚下漂浮着金色锁链与一面破碎的镜子。气质：身体即权力，也是束缚。'),
    tarot('malo',     '佛系躺平 MALO',    'Temperance',
      '画面：一位侧躺在浮于水面的莲叶上的女性，一手将一杯水缓缓倒入下方另一只杯，水流形成无尽循环，背景是日落的金粉色天空。气质：无为而平衡的中道。'),
    tarot('fake',     '人形面具 FAKE',    'The Devil',
      '画面：一位手持多张不同表情的金色半透明面具的女性，她正取下其中一张面具但脸上仍是另一张的表情，背景是层层叠叠的镜面。气质：完美面具下的空心。'),
    tarot('sleep',    '困困选手 SLEEP',  'The Star',
      '画面：一位裸足跪在水边低头注水的女性，一壶水流入池塘一壶倒在大地，头顶悬浮着一颗大金星与若干小星辰，远方是宁静夜空。气质：温柔疗愈的星星。'),

    // ─── Group VII · 幸运组 → Wheel of Fortune / The Sun ───
    tarot('chill',    '随缘选手 CHILL',  'Wheel of Fortune',
      '画面：一位悠然坐在巨大金色命运之轮中央的女性，身边漂浮着发光的塔罗符号（剑杯钱币权杖），轮子缓缓转动，她神情松弛。气质：顺势而为的天命之子。'),
    tarot('luck-y',   '锦鲤本鲤 LUCK-Y', 'The Sun',
      '画面：一位站在花丛中迎着金色阳光张开双臂的女性，头顶是大大的发光金色太阳，脚下是一匹小白马与盛开的向日葵。气质：自带光环的太阳。'),

    // ─── Group VIII · 敏感组 → The High Priestess ───
    tarot('emo',      'EMO 之神',         'The High Priestess',
      '画面：一位端坐于黑白双柱之间的女性，膝上摊开一卷发光的羊皮卷轴，头顶是月相图案，身后是深蓝色帷幕上无数细小星点。气质：深井般的直觉与情绪。'),

    // ─── Group IX · 躺平组 → The Hanged Man ───
    tarot('dior-s',   '已读不回 DIOR-S', 'The Hanged Man',
      '画面：一位从一根金色横枝上倒挂着的女性，一腿伸直一腿弯成数字 4 形状，长发垂落，头顶有金色光晕，神情却异常平静。气质：主动倒挂、看见不一样的天空。'),
  ],
};

export default mystiTarotModule;
