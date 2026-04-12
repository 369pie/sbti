export const XIUXIAN_V2_STYLE =
  'stylized chibi ancient chinese fantasy character, feminine but goofy, awkward posture, emotionally readable face, meme-worthy self-deprecating energy, white background, centered full body, clean silhouette, simplified hanfu or disciple robe, story props floating around the character, soft pastel palette with one strong accent, cute but slightly embarrassing, internet-native humor, not elegant, not perfect, not glamorous.' +
  '古风Q偶人物插画，2.5头身，圆润轮廓，轻微笨拙站姿，白底居中全身像，表情夸张但可爱，带一点狼狈和嘴硬感，像仙门世界里被抓拍到最不体面的瞬间。服装是简化弟子服、道袍、发簪、腰牌，但穿得略微凌乱。角色周围漂浮能讲故事的小道具，画面要有强烈的“这不就是我吗”的自嘲感。';

export const XIUXIAN_V2_NEGATIVE =
  'Avoid low poly, papercraft, origami, realistic 3d render, cinematic xianxia splash art, elegant immortal goddess, majestic hero poster, complex background, typography, watermark, photo realism, heavy ink wash, pure mascot animal with no human projection, dark horror, luxury fashion editorial.不要低多边形，不要纸艺，不要写实3D，不要电影海报感，不要宏大场景，不要唯美仙女，不要全是灵兽吉祥物，不要复杂背景，不要标题文字，不要水墨大片，不要过于精致体面。';

export const XIUXIAN_V2_SEED_PROMPT = [
  XIUXIAN_V2_STYLE,
  'stylized chibi ancient chinese fantasy young female cultivator, feminine but goofy, awkward standing pose, big head short limbs, expressive slightly embarrassed face, white background, centered full body, simplified pale jade disciple robe with crooked collar, one hairpin slightly loose, holding a cracked spirit talisman and a small floating lantern, soft blush, tired eyes, cute but not perfect, meme-worthy self-deprecating energy.',
  '古风Q偶女修，2.5头身，站姿有点别扭，像在强装没事。浅玉绿色弟子服，领口歪一点，头发有一根簪子快掉了，眼下有一点淡淡黑眼圈，脸红但嘴硬。手里拿着一张裂开的护身符，旁边漂着一盏小灵灯和两三张传音符。白底，单人物居中，整体是“体面快撑不住了但还是想装没事”的互联网情绪感。',
  XIUXIAN_V2_NEGATIVE,
].join('\n');

export function buildXiuxianV2Prompt(concept) {
  return [XIUXIAN_V2_STYLE, concept, XIUXIAN_V2_NEGATIVE].join('\n');
}

export const XIUXIAN_V2_TYPES = [
  {
    slug: 'sexy',
    title: '无辜钓主',
    concept:
      '古风Q偶少女修士，桃粉色弟子服，半张脸被团扇挡住，头微微歪着，眼神很无辜，像根本不知道别人为什么会对她上头。她周围漂着几张已经烧起来的心动符、乱掉的红线和小小心火，暗示路过的人自己先走火入魔。白底，全身居中，重点是“她没撩，但别人已经脑补完一整部情劫剧”。',
  },
  {
    slug: 'emo',
    title: '夜雨修士',
    concept:
      '古风Q偶女修，雾蓝灰紫色长袍，含胸站着，眼眶微红，像刚偷偷哭过但嘴上还会说“没有啊我挺好的”。袖口有一点湿，头顶飘着一朵很小的乌云，脚边散落几张写了一半的情绪札记和蔫掉的花瓣。白底，全身像，重点是共情过载、嘴硬、内耗感。',
  },
  {
    slug: 'shy',
    title: '一米结界仙',
    concept:
      '古风Q偶社恐女修，浅紫粉色弟子服，缩着肩膀站在透明结界球里，脚尖内扣，怀里抱着一叠还没回的传音符。她抬眼偷看外面，脸红但不敢开口，结界外面漂着几个聊天气泡。白底全身像，重点是“不是讨厌你，只是和人接触太耗灵力”。',
  },
  {
    slug: 'solo',
    title: '闭关装死蛋',
    concept:
      '古风Q偶独处型修士，白色和淡紫色为主，像把自己裹在半颗裂开的蛋壳结界里，只露出脸和一只手。眼神是“我看见消息了，但今天谁都别来碰我”，身边散落一堆未回传音符和邀约帖子。白底，单角色居中，要有很强的逃避现实但又有点愧疚的喜感。',
  },
  {
    slug: 'mum',
    title: '宗门保姆仙',
    concept:
      '古风Q偶照顾型女修，米杏和豆沙粉配色，一只手拿补灵丹，一只手拿针线、绷带和护心符，像随时准备替别人收拾残局。她脸上是温柔的笑，但眼睛明显很累，背后还挂着别人掉下来的情绪包袱、碎发簪、小哭脸面具。白底全身像，重点是“她照顾了所有人，没人问她累不累”。',
  },
  {
    slug: 'simp',
    title: '倒贴护法',
    concept:
      '古风Q偶护法型角色，偏人形，暖黄色弟子服，动作微微前倾，像谁一喊就会立刻冲出去帮忙。手里拿着回魂丹、断掉的旧玉佩和别人不要的发带，眼神非常真诚，真诚到有点心酸。白底全身像，重点是“不是深情，是深情到有点没出息”。',
  },
  {
    slug: 'thin-k',
    title: '渡劫预案师',
    concept:
      '古风Q偶策士型女修，靛蓝色长袍，头发略乱但表情很专注，手里抱着一卷写满备选方案的长卷和一支笔。身边漂着算盘珠、小地图、写着甲乙丙方案的纸条和整理好的符纸。白底全身像，重点是“事情还没开始，她已经把可能路线都排好了”。',
  },
  {
    slug: 'chill',
    title: '随便道长',
    concept:
      '古风Q偶佛系修士，灰绿色长袍，松松垮垮坐在蒲团上，一只手端茶，一只手随便搭着。头顶旁边已经有小天雷、警示符和几张未读消息在飘，但他还是一脸“都行吧”。白底全身像，重点是松弛、淡淡疯感、什么都不太往心里去。',
  },
  {
    slug: 'fake',
    title: '体面画皮仙',
    concept:
      '古风Q偶社交面具型角色，奶白和淡紫色衣服，站得很体面，像一个永远知道该说什么的门面弟子。她手里拿着一张标准营业笑面具，脸上真正的表情却已经很累了，面具有细小裂纹，一边漂着体面的问候符，另一边漂着揉皱的情绪废稿。白底全身像，重点是“外面精致得体，回家直接碎掉”。',
  },
  {
    slug: 'love-r',
    title: '情劫常驻户',
    concept:
      '古风Q偶恋爱脑修士，樱粉色长袍，发簪歪了一点，眼睛是亮晶晶的心形，怀里还抱着刚认定的天选对象小像。她整个人往前倾，像又要开始上头，身边飘满花瓣、爱心、发光红线和各种浪漫过量的符号。白底全身像，重点是“她不是故意的，她只是心动阈值太低”。',
  },
  {
    slug: 'rebel',
    title: '逆天小师妹',
    concept:
      '古风Q偶反骨小师妹，黑红配色弟子服，头发有点乱，一边眉毛挑起来，翻白眼，单手叉腰，另一只手还抓着被撕掉一半的门规。站姿往前顶，像下一秒就要专门去做别人不让她做的事。白底全身像，重点是“不是坏，她只是天生不爱被管”。',
  },
  {
    slug: 'joker',
    title: '陪笑护法',
    concept:
      '古风Q偶陪笑型角色，柔粉和奶黄色衣服，脸上是很标准的营业笑，眼睛却有一点点湿，像刚把所有情绪硬压下去。她一只手藏在袖子里，把纸符都攥皱了，旁边漂着开心面具、碎彩纸和一颗裂开的心形小挂件。白底全身像，重点是“场子热了，她自己也快碎了”。',
  },
];