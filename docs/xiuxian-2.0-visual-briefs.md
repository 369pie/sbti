# 修仙 2.0 首发 12 人格视觉 Brief

## 1. 使用方式

这份文档用于两种场景：

- 直接把 prompt 复制给文生图模型
- 作为 RunningHub 批量出图前的统一风格母盘

当前项目现有的图生图链路仍然偏向旧风格参考图，所以修仙 2.0 不建议直接复用当前低多边形或灵兽参考图作为统一 ref。

建议先产出一张新的风格基准图，再用这 12 个 brief 批量展开。

## 2. 新风格定义

主风格名：仙门怪可爱

一句话定义：

> 古风 Q 偶人物，带一点嘴硬、失态、狼狈和社交尴尬感，像仙侠世界里被抓拍到最不体面的那一秒。

风格要求：

- 主体以人形仙偶为主，不做纯灵兽主视觉
- 2.5 头身左右，头大、四肢短、重心略不稳
- 白底单人物居中，留白大
- 线条圆润，表情夸张，情绪一眼可读
- 古风元素只加味，不要做成唯美国风海报
- 要有一点可怜、一点搞笑、一点硬撑体面

## 3. 统一正向 Prompt

```text
stylized chibi ancient chinese fantasy character, feminine but goofy, awkward posture, emotionally readable face, meme-worthy self-deprecating energy, white background, centered full body, clean silhouette, simplified hanfu or disciple robe, story props floating around the character, soft pastel palette with one strong accent, cute but slightly embarrassing, internet-native humor, not elegant, not perfect, not glamorous
古风Q偶人物插画，2.5头身，圆润轮廓，轻微笨拙站姿，白底居中全身像，表情夸张但可爱，带一点狼狈和嘴硬感，像仙门世界里被抓拍到最不体面的瞬间。服装是简化弟子服、道袍、发簪、腰牌，但穿得略微凌乱。角色周围漂浮能讲故事的小道具，画面要有强烈的“这不就是我吗”的自嘲感。
```

## 4. 统一负向 Prompt

```text
low poly, papercraft, origami, realistic 3d render, cinematic xianxia splash art, elegant immortal goddess, majestic hero poster, complex background, landscape scene, typography, watermark, photo realism, heavy ink wash, mascot animal only, luxury fashion editorial, hyper detailed armor, dark horror, pure cute sticker without human projection
不要低多边形，不要纸艺，不要写实3D，不要电影海报感，不要宏大场景，不要唯美仙女，不要全是灵兽吉祥物，不要复杂背景，不要标题文字，不要水墨大片，不要过于精致体面。
```

## 5. 基准种子图 Prompt

用于先做一张统一风格种子图，再喂给 RunningHub 做 img2img 批量扩展。

```text
stylized chibi ancient chinese fantasy young female cultivator, feminine but goofy, awkward standing pose, big head short limbs, expressive slightly embarrassed face, white background, centered full body, simplified pale jade disciple robe with crooked collar, one hairpin slightly loose, holding a cracked spirit talisman and a small floating lantern, soft blush, tired eyes, cute but not perfect, meme-worthy self-deprecating energy
古风Q偶女修，2.5头身，站姿有点别扭，像在强装没事。浅玉绿色弟子服，领口歪一点，头发有一根簪子快掉了，眼下有一点淡淡黑眼圈，脸红但嘴硬。手里拿着一张裂开的护身符，旁边漂着一盏小灵灯和两三张传音符。白底，单人物居中，整体是“体面快撑不住了但还是想装没事”的互联网情绪感。
```

## 6. 12 个首发人格

### 6.1 sexy

主名：无辜钓主

副标：本座真没撩

视觉要点：

- 角色是一个看起来很无辜的年轻女修
- 半遮脸团扇，眼神没有攻击性，但旁边已经飘出别人心动失控的符纸
- 站姿松弛，像真的不知道为什么所有人都在上头
- 不能画成艳俗狐妖，要画成“她没干嘛但你已经自己脑补完了”

配色：桃粉、奶白、淡金

直接 Prompt：

```text
stylized chibi ancient chinese fantasy young female cultivator, feminine but goofy, awkward relaxed pose, heart-stealing but innocent expression, white background, centered full body, pale pink disciple robe with soft gold trim, half-hiding behind a round fan, slightly tilted head, bright eyes with zero guilt, soft blush, around her float a few burning heart talismans, tangled red strings and one tiny demon-heart flame, cute but self-deprecating, meme-worthy energy, like everyone else fell first and she is confused
古风Q偶少女修士，桃粉色弟子服，半张脸被团扇挡住，头微微歪着，眼神很无辜，像根本不知道别人为什么会对她上头。她周围漂着几张已经烧起来的心动符、乱掉的红线和小小心火，暗示路过的人自己先走火入魔。白底，全身居中，重点是“她没撩，但别人已经脑补完一整部情劫剧”。
```

### 6.2 emo

主名：夜雨修士

副标：今日继续内耗

视觉要点：

- 不是阴暗恐怖，是眼眶红、嘴硬、情绪很满
- 袖口有点湿，像刚偷偷哭过又不承认
- 头顶小乌云，脚边是写了一半的情绪札记

配色：雾蓝、灰紫、冷白

直接 Prompt：

```text
stylized chibi ancient chinese fantasy young woman cultivator, emotional and self-deprecating, white background, centered full body, misty blue-gray robe, slightly hunched posture, red watery eyes, trying to look calm but obviously hurt, sleeves a little wet, tiny rain cloud floating over her head, scattered half-written mood scrolls and wilted petals near her feet, soft blush and dark under-eye tint, cute but fragile, internet-native sad girl humor
古风Q偶女修，雾蓝灰紫色长袍，含胸站着，眼眶微红，像刚偷偷哭过但嘴上还会说“没有啊我挺好的”。袖口有一点湿，头顶飘着一朵很小的乌云，脚边散落几张写了一半的情绪札记和蔫掉的花瓣。白底，全身像，重点是共情过载、嘴硬、内耗感。
```

### 6.3 shy

主名：一米结界仙

副标：能传音就别当面说

视觉要点：

- 社恐感靠姿态和结界表达，不靠把人画丑
- 身体微缩，脚尖内扣，像见人就想后退半步
- 透明结界球非常关键

配色：粉雾紫、奶白、浅青

直接 Prompt：

```text
stylized chibi ancient chinese fantasy introvert cultivator girl, white background, centered full body, soft lavender robe, shy posture with toes turned inward, both hands holding a stack of unopened messenger talismans close to chest, trapped inside a translucent spherical barrier, eyes looking up nervously, cheeks pink, tiny floating speech bubbles outside the barrier, cute but overwhelmed, socially anxious and very relatable
古风Q偶社恐女修，浅紫粉色弟子服，缩着肩膀站在透明结界球里，脚尖内扣，怀里抱着一叠还没回的传音符。她抬眼偷看外面，脸红但不敢开口，结界外面漂着几个聊天气泡。白底全身像，重点是“不是讨厌你，只是和人接触太耗灵力”。
```

### 6.4 solo

主名：闭关装死蛋

副标：不是不回，是还没想好怎么回

视觉要点：

- 人形为主，但外面套着半颗蛋壳或防护壳
- 眼神要有“看见了但不想面对”
- 地上堆满未处理传音符和邀请帖

配色：白、淡紫、冷灰

直接 Prompt：

```text
stylized chibi ancient chinese fantasy recluse cultivator, white background, centered full body, wrapped in a cracked egg-like protective shell over a pale robe, only face and hands partly visible, peeking out with a guilty but defensive expression, sitting or crouching slightly, surrounded by unread messenger talismans, invitation notes and a dim protective charm, cute but avoidant, looks like saw the message and decided to disappear first
古风Q偶独处型修士，白色和淡紫色为主，像把自己裹在半颗裂开的蛋壳结界里，只露出脸和一只手。眼神是“我看见消息了，但今天谁都别来碰我”，身边散落一堆未回传音符和邀约帖子。白底，单角色居中，要有很强的逃避现实但又有点愧疚的喜感。
```

### 6.5 mum

主名：宗门保姆仙

副标：大家都被照顾得很好，除了我

视觉要点：

- 温柔但疲惫，不要画成圣母
- 一手拿补灵丹，一手拿针线或绷带
- 身后挂着别人掉落的包袱、情绪、琐事

配色：米杏、豆沙粉、暖白

直接 Prompt：

```text
stylized chibi ancient chinese fantasy caretaker cultivator woman, white background, centered full body, warm beige and dusty pink robe, gentle exhausted expression, one hand holding healing pills, the other carrying thread, bandages and small emergency charms, several little burdens, crying masks and broken accessories hanging behind her as if she picked up everyone else's mess, soft smile but tired eyes, comforting and heartbreaking at once
古风Q偶照顾型女修，米杏和豆沙粉配色，一只手拿补灵丹，一只手拿针线、绷带和护心符，像随时准备替别人收拾残局。她脸上是温柔的笑，但眼睛明显很累，背后还挂着别人掉下来的情绪包袱、碎发簪、小哭脸面具。白底全身像，重点是“她照顾了所有人，没人问她累不累”。
```

### 6.6 simp

主名：倒贴护法

副标：护到最后，护成路人甲

视觉要点：

- 不画成宠物犬，画成忠诚过头的人形护法
- 姿态要前倾，随时准备冲上去保护人
- 手里或嘴边要有对方留下的无用旧物

配色：暖黄、棕金、浅红

直接 Prompt：

```text
stylized chibi ancient chinese fantasy loyal guardian character, human-like young cultivator, white background, centered full body, warm golden robe with slightly worn edges, leaning forward eagerly, holding a healing pill, a broken jade token and an old ribbon that clearly belongs to someone else, eyes bright and painfully sincere, cheeks a little flushed, expression loyal and tragic at the same time, meme-worthy self-sacrificing energy
古风Q偶护法型角色，偏人形，暖黄色弟子服，动作微微前倾，像谁一喊就会立刻冲出去帮忙。手里拿着回魂丹、断掉的旧玉佩和别人不要的发带，眼神非常真诚，真诚到有点心酸。白底全身像，重点是“他不是深情，是深情到有点没出息”。
```

### 6.7 thin-k

主名：渡劫预案师

副标：雷还没来，我已经写完 18 版预案

视觉要点：

- 不是纯学霸，要有脑内爆炸感
- 卷轴、算盘、地图、待办签同时出现
- 发型轻微炸毛，眼下有熬夜痕迹

配色：靛蓝、纸卷米白、淡紫

直接 Prompt：

```text
stylized chibi ancient chinese fantasy overthinking strategist, white background, centered full body, indigo robe, messy hair, dark circles, stressed but determined face, holding a brush and an absurdly long contingency scroll, surrounded by floating plans, maps, abacus beads, crossed-out talismans and numbered strategy notes, posture tense and inward, cute but mentally overloaded
古风Q偶军师型修士，靛蓝色长袍，头发有点炸，眼下有明显熬夜痕迹，手里拿着超长的渡劫预案卷轴和笔。身边漂着算盘珠、地图、写着甲乙丙方案的纸条和被划掉的符纸。白底全身像，重点是“还没出事，她已经把最坏情况模拟到第十八层”。
```

### 6.8 chill

主名：随便道长

副标：都行，劈我也行

视觉要点：

- 松弛感不是高冷，是一种快睡着的佛系感
- 天雷、警报、消息都在旁边，但本人很稳
- 嘴角可以有一点似笑非笑

配色：灰绿、雾灰、浅青

直接 Prompt：

```text
stylized chibi ancient chinese fantasy chill cultivator, white background, centered full body, muted green-gray robe, sitting loosely on a meditation cushion, one hand lazily holding tea, eyes half open, tiny thunder cloud and warning talismans floating near the head but the character looks completely unbothered, relaxed slouch, soft sarcastic smile, cute detached energy
古风Q偶佛系修士，灰绿色长袍，松松垮垮坐在蒲团上，一只手端茶，一只手随便搭着。头顶旁边已经有小天雷、警示符和几张未读消息在飘，但他还是一脸“都行吧”。白底全身像，重点是松弛、淡淡疯感、什么都不太往心里去。
```

### 6.9 fake

主名：体面画皮仙

副标：见人说人话，回洞府才发疯

视觉要点：

- 面具非常重要，但不能完全遮脸
- 半边是营业笑，半边是真实疲惫
- 仪态要体面，细节要露馅

配色：奶白、淡紫、冷粉

直接 Prompt：

```text
stylized chibi ancient chinese fantasy masked social character, white background, centered full body, pale cream robe with soft lilac accents, upright polite posture, holding a smiling half-mask near the face, real face underneath looks tired and emotionally drained, tiny cracks in the mask, several polished greeting talismans floating on one side and crumpled vent notes floating on the other, cute but painfully relatable social facade
古风Q偶社交面具型角色，奶白和淡紫色衣服，站得很体面，像一个永远知道该说什么的门面弟子。她手里拿着一张标准营业笑面具，脸上真正的表情却已经很累了，面具有细小裂纹，一边漂着体面的问候符，另一边漂着揉皱的情绪废稿。白底全身像，重点是“外面精致得体，回家直接碎掉”。
```

### 6.10 love-r

主名：情劫常驻户

副标：我不是恋爱脑，我只是见谁都心动

视觉要点：

- 不是纯甜妹，要有“又来了我又上头了”的失控感
- 发簪歪掉、心形眼、手里抱着小像或信物
- 画面里要体现过载的心动元素

配色：樱粉、暖白、浅金

直接 Prompt：

```text
stylized chibi ancient chinese fantasy romantic daydreamer, white background, centered full body, cherry pink robe, hairpin slightly loose, sparkling heart eyes, hugging a tiny portrait charm of the latest crush, posture leaning forward with unstoppable excitement, surrounded by blooming petals, floating hearts, glowing thread bonds and over-the-top romantic symbols, cute but obviously too easy to fall for people
古风Q偶恋爱脑修士，樱粉色长袍，发簪歪了一点，眼睛是亮晶晶的心形，怀里还抱着刚认定的天选对象小像。她整个人往前倾，像又要开始上头，身边飘满花瓣、爱心、发光红线和各种浪漫过量的符号。白底全身像，重点是“她不是故意的，她只是心动阈值太低”。
```

### 6.11 rebel

主名：逆天小师妹

副标：你让我别去，我现在就去

视觉要点：

- 叛逆是可爱的，不是中二反派
- 白眼、撇嘴、叉腰、门规碎片都是关键
- 表情要有“你越不让我做我越来劲”

配色：黑、暗红、炭灰

直接 Prompt：

```text
stylized chibi ancient chinese fantasy rebellious junior sister, white background, centered full body, dark robe with red accents, slightly messy hair, one eyebrow raised, eyes rolling upward, hand on hip, other hand holding torn sect rules, stance leaning forward as if about to ignore advice on purpose, small sparks and forbidden talisman scraps floating around, cute but provocatively stubborn
古风Q偶反骨小师妹，黑红配色弟子服，头发有点乱，一边眉毛挑起来，翻白眼，单手叉腰，另一只手还抓着被撕掉一半的门规。站姿往前顶，像下一秒就要专门去做别人不让她做的事。白底全身像，重点是“不是坏，她只是天生不爱被管”。
```

### 6.12 joker

主名：陪笑护法

副标：你们开心就好，我先碎掉

视觉要点：

- 假开心是核心，不能画成单纯 clown
- 表面笑得标准，手却在袖子里攥皱纸符
- 有一点营业型情绪劳动感

配色：柔粉、奶黄、浅蓝

直接 Prompt：

```text
stylized chibi ancient chinese fantasy emotional labor character, white background, centered full body, pastel robe with soft pink and pale yellow, performing a perfect cheerful smile, eyes slightly watery, one sleeve hiding a crumpled talisman squeezed too hard, around the character float happy masks, confetti bits and one tiny cracked heart charm, cute, funny and quietly sad at the same time
古风Q偶陪笑型角色，柔粉和奶黄色衣服，脸上是很标准的营业笑，眼睛却有一点点湿，像刚把所有情绪硬压下去。她一只手藏在袖子里，把纸符都攥皱了，旁边漂着开心面具、碎彩纸和一颗裂开的心形小挂件。白底全身像，重点是“场子热了，她自己也快碎了”。
```

## 7. 第一轮测试建议

第一轮不建议直接量产 12 张定稿。

建议每个角色先出 3 个方向：

- 更像真实人
- 更像怪可爱 IP
- 更像情绪梗图

对比标准只看三件事：

- 第一眼能不能读懂情绪
- 用户会不会说「这就是我」
- 用户会不会想转发给朋友

如果一个图只是“很可爱”，但不够“很像某种人”，就不够格进入第二轮。