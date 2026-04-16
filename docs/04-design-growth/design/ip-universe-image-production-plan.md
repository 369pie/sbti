# 三大 IP 宇宙首批生图计划

> Owner: Design + Content
> Status: Active Production Plan
> Priority: P1
> Last Updated: 2026-04-16
> Review Cadence: Before each IP production batch
> Next Decision: Decide which IP batch enters production after current universe priorities stabilize

> 范围：先完成原神 / 第五人格 / 火影忍者三个宇宙的图鉴主视觉生产，不接入页面、不实现路由、不改前端逻辑。

## 一、目标

- 直接复用现有 29 个 WTFTI 核心人格 slug，先把三套宇宙图鉴图全部产出来。
- 站内功能代码后置，等素材齐了之后再统一接入页面、测试页、结果页与图鉴馆。
- 优先保证三件事：一眼能认出 IP 气质、仍然像 SBTI 梗图、可以批量稳定生图。

## 二、统一生产规则与全局标准 Prompt (V3.0)

从今往后，所有新扩展宇宙的图鉴主视觉（不论是职场、修仙、游戏IP），**默认均采用这套「端到端 AIGC 文本排版+角色融合成图」的 V3.0 Prompt 架构**。该架构利用 Z坐标分层控制，解决了文字遮挡与主体占据画幅的矛盾。

### 2.1 全局标准图鉴生成 Prompt 模板

生图模型需支持精确的中英文双语生成（如 Nanobanana/Flux 等高精度排版模型）。每次切换宇宙时，只需灵活替换 `[Overall Style & Visual Hierarchy]` 中的画风约束词（例如：`low-poly`,`anime style`, `wuxia`, `realistic`, `inflatable vinyl toy`, `blind box toy`等）。

```text
[Overall Style & Visual Hierarchy]
A high-quality personality test result card, vertical format (3:4 ratio), 【此处替换目标宇宙基底画风，如：aesthetic minimalist editorial flat design style / inflatable oversized vinyl toy figure / vintage Chinese Wuxia style】. The background is a soft, solid light grey color. 
CRITICAL LAYER RULE (Z-INDEX): All typography (text) MUST be on the absolute top layer (foreground). The central character MUST be on the layer behind the text. The character is massive and occupies at least 50% to 60% of the canvas, BUT whenever the character and text intersect, the TEXT MUST CLEARY OVERLAY THE CHARACTER. The character must NEVER obscure, block, or hide any part of the text.

[Primary Visual - Dominant Subject]
Positioned boldly in the center: 【此处替换：角色的外貌与画面特征描述，如 a detailed flat-style Voldemort holding a wand】. Close-up or half-body shot, massive presence. It serves as a visual background for the typography above and below it.

[Typography Layer - Top Foreground]
ALL TEXT HERE MUST SURMOUNT THE CHARACTER'S HEAD IF THEY OVERLAP.
At the very top edge, small fine text reading "【宇宙名，如：社畜宇宙 / 原神宇宙】". 
Below it, massive, impactful, bold typography text reading "【主标题名字，如：无鼻狂怒尊者】". 
Below the title, stylized prominent text reading "【Code及翻译，如：N-O-S-E (No one smells everything)】".
Underneath, a short expressive tagline text reading "【一句话标签，如：你是那种...就算没有鼻子也要把别人的空气吸干的人】".
Ensure high contrast so the text remains 100% readable even if it covers the character's forehead or hair.

[Typography Layer - Bottom Foreground]
Layered intimately near the bottom of the canvas, vividly superimposed over the character's lower torso or clothes:
Three cleanly designed info-graphic boxes lined up horizontally. 
The first box: "【标签1内容】".
The second box: "【标签2内容】".
The third box: "【标签3内容】".
At the absolute bottom center edge, stylish elegant text serving as the punchline, reading: "【底部金句内容】".
```

### 2.2 资产入库标准

- 抛弃原本复杂繁琐的前端 Canvas 字体绘制和坐标对齐，前端直接展示此 prompt 生成并经过筛选的最终结果图。
- 新宇宙输出统一落在 [public/images/types](../../../public/images/types) 的对应子目录内。
- 每张新图必须通过“文字图层是否叠底于上半身”、“角色主体占比是否达到至少 50%”的校对准则。

## 三、审图顺序

- 第一轮先看每个宇宙最能暴露风格偏差的 4 张：`boss`、`sleep`、`drama`、`shy`。
- 第二轮补看每个宇宙最依赖 IP 识别的 4 张：`drunk`、`rebel`、`sexy`、`joker`。
- 如果这 8 张成立，其余 21 张大概率只需要小修 prompt，不需要重写风格。

## 四、原神TI

### 视觉方向

- 关键词：提瓦特冒险者、元素符号、轻奇幻、干净高饱和、纸艺手办感。
- 重点：别做成官方立绘模仿秀，要像“原神角色气质穿进 WTFTI 的自嘲人格图鉴”。

| slug | WTFTI 内核 | 角色参考 | 审图重点 |
|---|---|---|---|
| boss | 人形方向盘 | 雷电将军 | 雷元素将军感、接管全场的压迫感 |
| nerd | 人间收藏夹 | 阿贝多 | 炼金手稿、学者气质、纸面笔记堆叠 |
| ctrl | 人形KPI | 刻晴 | 雷系执行官、效率狂、行动清单感 |
| mum | 操心破产户 | 诺艾尔 | 全能女仆骑士、照顾别人到爆炸 |
| simp | 倒贴甲方 | 托马 | 管家式随叫随到、后勤工具人 |
| solo | 一米结界 | 魈 | 仙人独狼、清冷、别靠近我 |
| sleep | 再睡五分钟 | 早柚 | 狸猫忍者、困到缩成团、睡意外溢 |
| game-r | 再来一把 | 达达利亚 | 打架上头、战斗成瘾、越打越来劲 |
| drunk | 酒后真人 | 温迪 | 诗人酒鬼、风元素、醉醺醺真话时刻 |
| rebel | 反骨仔 | 流浪者 | 叛逆、刻薄、我偏不、风帽轮廓 |
| oh-no | 我早说了吧 | 莫娜 | 占星预判、灾难直觉、早已算到 |
| thin-k | 内耗永动机 | 艾尔海森 | 冷面学霸、脑内会议过载 |
| drama | 情绪核弹 | 芙宁娜 | 舞台人格、情绪放大、戏剧灯光感 |
| chill | 佛到没电 | 钟离 | 岩系老干部、平静到像看破一切 |
| emo | 碎了又粘 | 申鹤 | 冷感、孤绝、压抑情绪往回吞 |
| atm-er | 行走提款机 | 多莉 | 钱袋子、到处供能、被人薅到空 |
| dior-s | 躺平先驱 | 枫原万叶 | 低欲望、随风漂、世界随便吧 |
| sexy | 被动钓鱼 | 八重神子 | 狐系钓感、看起来没使劲但全场上钩 |
| fake | 下班发疯 | 凯亚 | 白天体面、夜里藏事、双面人设 |
| malo | 班味永存 | 甘雨 | 加班仙兽、工位永生、眼下有班味 |
| luck-y | 欧气溢出 | 可莉 | 炸弹小福星、乱来但总能通关 |
| joker | JOKE-R | 荒泷一斗 | 夸张快乐小丑、嘴硬气氛组 |
| shy | 社恐晚期 | 砂糖 | 小心翼翼、实验宅、存在感过低 |
| party | 气氛焊接工 | 宵宫 | 烟花、热闹、社交点火器 |
| than-k | 谢谢你骂我 | 班尼特 | 倒霉但感恩、挨打还说没事 |
| woc | 吃瓜专业户 | 派蒙 | 全程围观、持续吐槽、飞行解说员 |
| love-r | 上头体质 | 神里绫华 | 心动过快、浪漫滤镜拉满 |
| food-ie | 卡路里文盲 | 香菱 | 锅巴、美食、边打边炫 |
| talk-er | 嘴巴关不上 | 菲谢尔 | 中二连发、台词停不下来 |

## 五、庄园TI（第五人格）

### 视觉方向

- 关键词：哥特庄园、维多利亚纸艺、病态优雅、单角色白底、道具讲故事。
- 重点：要保留第五人格的庄园黑色幽默和角色职业感，但不能做成深色场景海报。

| slug | WTFTI 内核 | 角色参考 | 审图重点 |
|---|---|---|---|
| boss | 人形方向盘 | 大副 | 船长指挥感、秩序感、老练控场 |
| nerd | 人间收藏夹 | 囚徒 | 电路、草稿纸、研究过载 |
| ctrl | 人形KPI | 机械师 | 傀儡操控、极致安排、精密到可怕 |
| mum | 操心破产户 | 医生 | 医药箱、缝补感、照顾别人先于自己 |
| simp | 倒贴甲方 | 小女孩 | 贴人、黏人、永远想跟着别人跑 |
| solo | 一米结界 | 守墓人 | 地下独处、沉默、生人退散 |
| sleep | 再睡五分钟 | 入殓师 | 棺椁、困倦、安静到像睡着了一样 |
| game-r | 再来一把 | 杂技演员 | 上头表演型玩家、停不下来 |
| drunk | 酒后真人 | 调酒师 | 酒瓶、微醺、情绪一喝就全出来 |
| rebel | 反骨仔 | 击球手 | 运动反骨、你越管我越冲 |
| oh-no | 我早说了吧 | 先知 | 猫头鹰预警、我已经看见翻车了 |
| thin-k | 内耗永动机 | 心理学家 | 自我分析过度、脑内诊疗室 |
| drama | 情绪核弹 | 歌剧演员 | 舞台腔、拉满的情绪和仪式感 |
| chill | 佛到没电 | 祭司 | 神秘冷静、慢吞吞开门、情绪不起波澜 |
| emo | 碎了又粘 | 画家 | 艺术性敏感、忧郁、自我沉浸 |
| atm-er | 行走提款机 | 玩具商 | 道具分发机、资源给完自己见底 |
| dior-s | 躺平先驱 | 作曲家 | 慵懒艺术家、爱躺不爱卷 |
| sexy | 被动钓鱼 | 调香师 | 精致、危险、什么都没做但别人先上头 |
| fake | 下班发疯 | 杰克 | 白天绅士、夜里疯批、双面裂开 |
| malo | 班味永存 | 律师 | 公文包、疲惫、像刚被庄园通勤折磨完 |
| luck-y | 欧气溢出 | 幸运儿 | 运气本人、破局全靠抽到对的东西 |
| joker | JOKE-R | 小丑 | 夸张 clown 感、笑着把场子搅烂 |
| shy | 社恐晚期 | 盲女 | 低存在感、谨慎、把自己缩到最小 |
| party | 气氛焊接工 | 啦啦队员 | 拉满现场、应援、热闹点火器 |
| than-k | 谢谢你骂我 | 邮差 | 再委屈也认真送达、被说还道谢 |
| woc | 吃瓜专业户 | 记者 | 拿着小本围观全庄园的故事 |
| love-r | 上头体质 | 病患 | 关系一上头就直冲天花板 |
| food-ie | 卡路里文盲 | 野人 | 肉食、原始续命、边跑边吃 |
| talk-er | 嘴巴关不上 | 小说家 | 话多、解说多、脑内旁白更多 |

## 六、忍者TI（火影忍者）

### 视觉方向

- 关键词：忍村群像、卷轴、苦无、查克拉、热血和社死同时存在。
- 重点：做成“火影角色气质版人格梗图”，不是战斗海报，也不是热血同人插画。

| slug | WTFTI 内核 | 角色参考 | 审图重点 |
|---|---|---|---|
| boss | 人形方向盘 | 纲手 | 火影办公室压迫感、当场接管局面 |
| nerd | 人间收藏夹 | 大蛇丸 | 卷轴研究狂、知识囤积、实验室味道 |
| ctrl | 人形KPI | 千手扉间 | 严厉高效、规矩第一、流程管控 |
| mum | 操心破产户 | 春野樱 | 医疗忍者、照顾残局、嘴硬心软 |
| simp | 倒贴甲方 | 雏田 | 目光追随型、温柔上头、暗恋滤镜 |
| solo | 一米结界 | 佐助 | 独狼、冷脸、自己走自己那条线 |
| sleep | 再睡五分钟 | 卡卡西 | 懒散迟到、眼罩、能躺绝不卷 |
| game-r | 再来一把 | 洛克李 | 热血复读机、摔了继续练 |
| drunk | 酒后真人 | 自来也 | 酒、豪放、说多了全是真话 |
| rebel | 反骨仔 | 鸣人 | 叛逆热血、被说不行就更要冲 |
| oh-no | 我早说了吧 | 药师兜 | 预判翻车、战术阴影、我早知道 |
| thin-k | 内耗永动机 | 日向宁次 | 宿命脑、想太多、表面冷静内里翻涌 |
| drama | 情绪核弹 | 迪达拉 | 爆炸美学、情绪上头、越炸越爽 |
| chill | 佛到没电 | 我爱罗 | 冷静低电量、什么都不想多说 |
| emo | 碎了又粘 | 宇智波鼬 | 压抑、背负、沉默又破碎 |
| atm-er | 行走提款机 | 香燐 | 查克拉供给站、自己越用越空 |
| dior-s | 躺平先驱 | 鹿丸 | 麻烦死了、能不动就不动 |
| sexy | 被动钓鱼 | 小南 | 冷艳危险、没主动但别人会自己上钩 |
| fake | 下班发疯 | 带土 | 面具内外两个人、裂开式双面人生 |
| malo | 班味永存 | 大和 | 工地队长、任务班味、加班忍者 |
| luck-y | 欧气溢出 | 波风水门 | 速度、天赋、老天追着发糖 |
| joker | JOKE-R | 阿凯 | 夸张燃系 clown、越尴尬越认真 |
| shy | 社恐晚期 | 志乃 | 话少、边缘、存在感像被虫吃掉 |
| party | 气氛焊接工 | 奇拉比 | 节奏、热闹、现场嘴炮和说唱全开 |
| than-k | 谢谢你骂我 | 天天 | 认真、配合、被说了先反省自己 |
| woc | 吃瓜专业户 | 佐井 | 站在旁边默默观察全员社交事故 |
| love-r | 上头体质 | 井野 | 心动来得快、滤镜一秒开满 |
| food-ie | 卡路里文盲 | 丁次 | 薯片、团子、边打边吃 |
| talk-er | 嘴巴关不上 | 犬冢牙 | 吵、直、停不下来、越说越上头 |

## 七、执行命令

### Dry Run

```bash
node scripts/generate-type-images.mjs genshin boss sleep drama shy --dry-run
node scripts/generate-type-images.mjs idv boss sleep drama shy --dry-run
node scripts/generate-type-images.mjs naruto boss sleep drama shy --dry-run
```

### Full Batch

```bash
node scripts/generate-type-images.mjs genshin
node scripts/generate-type-images.mjs idv
node scripts/generate-type-images.mjs naruto
```

## 八、交付标准

- 每个宇宙 29 张主视觉图完整落盘。
- 每张图都必须一眼读出对应人格梗，不只是“像这个 IP 角色”。
- 如果单张图只像角色 cosplay，不像人格图鉴，算生成失败，需要重写 prompt。
- 如果单张图太像官方立绘或直接复制角色站姿，也算失败，需要加强“原创人格化”约束。