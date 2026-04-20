-- HERMOSA seed: 30 starter messages so the wall isn't empty on launch.
-- Apply AFTER 2026-04-20_hermosa_messages.sql.
-- Safe to re-run: uses ON CONFLICT DO NOTHING via deterministic ids.

insert into public.hermosa_messages
  (id, universe, slug, code, text, signature, tags, status, is_published, is_featured)
values
  (gen_random_uuid(), 'wtfti', null, null, '90秒就拿到一个像我自己的神，第一次在测试结果里哭出来。', '匿名', array['voice','thanks'], 'shipped', true, true),
  (gen_random_uuid(), 'wtfti', null, null, '希望能有「把多个宇宙的我合并成一张档案」的导出功能。', '想做收藏夹的人', array['want','feature'], 'planned', true, true),
  (gen_random_uuid(), 'soulti', 'hana', 'HANA', '我是HANA思者，想说：思考不是冷漠，是另一种深爱。', '——一个 HANA', array['declare','voice'], 'shipped', true, true),
  (gen_random_uuid(), 'soulti', null, null, '深夜做完测试，被那句"安静地看见自己"击中。', '匿名', array['voice','thanks'], 'shipped', true, false),
  (gen_random_uuid(), 'soulti', null, null, '建议把灵魂镜像的报告做成可打印的 A4 收藏版。', null, array['want','feature'], 'planned', true, false),
  (gen_random_uuid(), 'cpti', null, null, '和对象一起做完 CPTI，吵架终于知道原因了。', '小鱼', array['thanks','voice'], 'shipped', true, false),
  (gen_random_uuid(), 'cpti', null, null, '想要 CPTI 的"复盘版"，半年后重新测一次对比变化。', null, array['want','feature'], 'heard', true, false),
  (gen_random_uuid(), 'xpti', null, null, 'XPTI 帮我看清自己在亲密关系里反复踩的那个坑。', '匿名', array['voice'], 'shipped', true, false),
  (gen_random_uuid(), 'xpti', null, null, '希望XPTI结果页能给一句"你今天可以试试做的小事"。', null, array['want','feedback'], 'heard', true, false),
  (gen_random_uuid(), 'hogti', null, null, '被分进雷文克劳那一刻我哭了，原来一直被理解。', '匿名', array['voice','thanks'], 'shipped', true, false),
  (gen_random_uuid(), 'hogti', null, null, '能不能加一个"我的守护神"动画？很期待。', '某个赫奇帕奇', array['want','feature'], 'planned', true, false),
  (gen_random_uuid(), 'fanrenti', null, null, '凡人TI让我重新审视"凡人也可以发光"这件事。', '匿名', array['voice'], 'shipped', true, false),
  (gen_random_uuid(), 'mysti', null, null, 'Mysti的塔罗 + 人格牌组合，是我每天早上的仪式。', '一个订阅者', array['thanks'], 'shipped', true, false),
  (gen_random_uuid(), 'mysti', null, null, '希望Mysti可以有月度复盘，看看一个月抽到的牌的趋势。', null, array['want','feature'], 'planned', true, true),
  (gen_random_uuid(), 'wtfcard', null, null, '收藏卡做得太美了，截屏发朋友圈被夸爆。', '匿名', array['thanks'], 'shipped', true, false),
  (gen_random_uuid(), 'meta', null, null, '建议加一个"上次结果对比"，看看我变了多少。', null, array['want','feature'], 'planned', true, false),
  (gen_random_uuid(), 'meta', null, null, '网站在地铁里加载有点慢，但每次结果出来都觉得值得。', null, array['feedback'], 'heard', true, false),
  (gen_random_uuid(), 'meta', null, null, '希望能有「悄悄分享给一个人」的私密链接，不公开。', '想给ta看的人', array['want','feature'], 'planned', true, true),
  (gen_random_uuid(), 'wtfti', null, null, '做了三遍才接受那个结果，但接受之后整个人都松了。', '匿名', array['voice'], 'shipped', true, false),
  (gen_random_uuid(), 'wtfti', null, null, '谢谢你们让"测试"这件事变得不那么廉价。', null, array['thanks'], 'shipped', true, false),
  (gen_random_uuid(), 'soulti', null, null, '希望SoulTI能加一个匿名留言箱，给未来的自己写一封信。', '想写信的人', array['want','feature'], 'planned', true, false),
  (gen_random_uuid(), 'cpti', null, null, '我宣布：我就是关系里那个先说"我累了"的人，不再装坚强。', '一个CPTI做完的人', array['declare','voice'], 'shipped', true, false),
  (gen_random_uuid(), 'xpti', null, null, '能不能把XPTI的人格做成可订阅的语音剧场？', null, array['want','feature'], 'planned', true, false),
  (gen_random_uuid(), 'meta', null, null, '我在留言板上看到了和我一样的人，原来不止我一个。', '匿名', array['voice','thanks'], 'shipped', true, true),
  (gen_random_uuid(), 'meta', null, null, '想要每周一封"她说"的精选信，挑10句最打动人的话。', null, array['want','feature'], 'planned', true, false),
  (gen_random_uuid(), 'hogti', null, null, '霍格沃茨TI的羊皮纸质感我可以盯着看一晚上。', '匿名', array['thanks'], 'shipped', true, false),
  (gen_random_uuid(), 'fanrenti', null, null, '"凡人也有道心"——这一句话让我决定继续走下去。', null, array['voice'], 'shipped', true, false),
  (gen_random_uuid(), 'mysti', null, null, '订阅Mysti是我对自己一年最值得的小小投资。', '一个仪式感患者', array['thanks','declare'], 'shipped', true, false),
  (gen_random_uuid(), 'wtfcard', null, null, '希望卡片可以做成实物寄到手上，会买。', null, array['want','feature'], 'planned', true, true),
  (gen_random_uuid(), 'meta', null, null, '在这里写下：我是一个被很多测试治愈过的人，谢谢。', '匿名', array['voice','thanks'], 'shipped', true, false)
on conflict (id) do nothing;
