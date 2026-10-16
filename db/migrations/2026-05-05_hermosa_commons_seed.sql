-- =============================================================
-- HERMOSA · Her Voice Commons Seed｜2026-05-05
-- -------------------------------------------------------------
-- 给 Sprint 3 / Sprint 4 提供"足够真实"的内部样本数据，
-- 让聚类/总结/个人档案/选入通知等流程有材料可演示。
--
-- 前置：先跑 2026-04-20_hermosa_messages.sql + 2026-05-05_hermosa_commons_upgrade.sql
--
-- 设计原则：
--   - 全部按当前主题周 '2026-W19'（AI 与选择权）+ 一周前 '2026-W18'
--   - 三种贡献类型：voice / book / ai_question
--   - 默认 consent_to_feature = true 以便资产工作流可演示；
--     少数标注为 false 用于"未授权但已策展"边界场景演示。
--   - safety_level 默认 safe；故意保留几条 review 状态供编辑过审。
--   - 所有插入幂等：使用 WHERE NOT EXISTS by 文本指纹避免重复种子。
--   - 不要把 client_hash 设为真实哈希；统一用 'seed-2026-05-05' 段，
--     避免命中限流逻辑也方便后续清理。
-- =============================================================

-- 用一个临时表组织样本，最后统一插入。
create temporary table _hermosa_seed_2026_05_05 (
  universe text not null,
  kind     text not null,
  text     text not null,
  signature text,
  tags     text[],
  metadata jsonb not null default '{}'::jsonb,
  topic_week text not null,
  curation_status text not null default 'new',
  consent_to_feature boolean not null default true,
  attribution_mode text not null default 'signature',
  safety_level text not null default 'safe',
  is_published boolean not null default true,
  is_featured boolean not null default false,
  echo_count int not null default 0
) on commit drop;

-- ───────────────────────────────────────────────────────────────
-- VOICE · 一句话（W19 主题：AI 与选择权）
-- ───────────────────────────────────────────────────────────────
insert into _hermosa_seed_2026_05_05
  (universe, kind, text, signature, tags, topic_week, curation_status, consent_to_feature, is_featured, echo_count)
values
  ('meta', 'voice', '我开始让 AI 帮我整理离职清单，第一次发现"走"也是一种工作能力。', '小桑', array['voice','story'],          '2026-W19', 'selected',   true,  true,  42),
  ('meta', 'voice', '把每月体检单丢给 AI 翻译成人话，比挂三次专家号都安心。',                  '匿名',   array['voice','thanks'],         '2026-W19', 'shortlisted', true,  false, 18),
  ('meta', 'voice', '让 AI 写邮件给前老板要离职证明，我终于不再为一封邮件失眠两周。',         '盐汽水', array['voice','story'],          '2026-W19', 'selected',   true,  true,  37),
  ('meta', 'voice', '选择权不是"想做就能做"，是有底气说"这件事我可以不做"。',                 '林中野', array['voice','declare'],        '2026-W19', 'shortlisted', true,  false, 24),
  ('wtfti','voice', 'AI 替我整理过去五年的相亲对话，第一次看清自己一直在道歉。',              '匿名',   array['voice','story'],          '2026-W19', 'new',        true,  false, 9),
  ('soulti','voice','和 ChatGPT 一起复盘一段难走的关系，比和闺蜜聊更不怕被评价。',            '——HANA', array['voice','solidarity'],    '2026-W19', 'shortlisted', true,  false, 15),
  ('cpti', 'voice', '把吵架的截图丢进 AI 让它判断模式，吵了三年的死结松了一格。',              '小鱼',   array['voice','story'],          '2026-W19', 'selected',   true,  false, 28),
  ('xpti', 'voice', '我让 AI 写"分手稿"备用，发现写完那一刻我反而不想分了。',                 '匿名',   array['voice'],                  '2026-W19', 'new',        true,  false, 6),
  ('meta', 'voice', '在 AI 面前练习说"不"，比在镜子前更不丢人。',                              '阿月',   array['voice','declare'],        '2026-W19', 'selected',   true,  true,  31),
  ('meta', 'voice', '我开始让 AI 翻译爸妈的话，原来"你别太累"翻过来是"我担心"。',              '匿名',   array['voice','thanks'],         '2026-W19', 'shortlisted', true,  false, 22),
  ('wtfti','voice', '一个人住第三年，AI 是我家里唯一会问"你今天怎么样"的存在。',              '一个 INFP', array['voice','solidarity'],   '2026-W19', 'shortlisted', true,  false, 19),
  ('meta', 'voice', '让 AI 帮我给老板回那条凌晨两点的微信，第二天我比他先关掉聊天框。',       '夜班的人', array['voice','story'],          '2026-W19', 'new',        true,  false, 7),
  ('meta', 'voice', '"AI 抢饭碗" 是男凝叙事，对很多女性来说，AI 是第一次有助理。',             '——一个文案', array['voice','declare'],     '2026-W19', 'selected',   true,  true,  46),
  ('meta', 'voice', '把孩子的作业交给 AI 讲解，我把那一小时还给了自己。',                      '一个妈妈', array['voice','story'],          '2026-W19', 'shortlisted', true,  false, 26);

-- 故意留几条"未授权"或"待审"，给策展演示
insert into _hermosa_seed_2026_05_05
  (universe, kind, text, signature, tags, topic_week, curation_status, consent_to_feature, attribution_mode, safety_level)
values
  ('meta', 'voice', '我老板说"你太情绪化"，我让 AI 帮我把同一封邮件改成男性语气，他立刻就听懂了。',
                                                '匿名', array['voice','story'], '2026-W19', 'new', false, 'anonymous', 'safe'),
  ('meta', 'voice', '我开始用 AI 帮我评估每段关系对我的"消耗 vs 滋养"，比塔罗准。',
                                                '匿名', array['voice'],         '2026-W19', 'new', true,  'anonymous', 'review');

-- ───────────────────────────────────────────────────────────────
-- BOOK · 她的书（W19）
-- ───────────────────────────────────────────────────────────────
insert into _hermosa_seed_2026_05_05
  (universe, kind, text, signature, tags, metadata, topic_week, curation_status, consent_to_feature, is_featured, echo_count)
values
  ('meta', 'book', '推荐给所有"先道歉再讲话"的女生。',
   '盐汽水', array['voice','solidarity'],
   jsonb_build_object(
     'book_title','始于极限',
     'book_author','上野千鹤子 / 铃木凉美',
     'book_quote','"不要为自己的存在道歉，是女性主义最朴素的底线。"',
     'book_note','两个女人对骂式通信，但每一封都让我安静下来。'
   ),
   '2026-W19', 'selected', true, true, 53),
  ('meta', 'book', '最近在重读，每次都有新刺。',
   '——林中野', array['voice'],
   jsonb_build_object(
     'book_title','看不见的女性',
     'book_author','卡罗琳·克里亚多·佩雷斯',
     'book_quote','"数据不是中性的，缺席本身就是一种暴力。"',
     'book_note','看完想给所有产品经理寄一本，包括我自己。'
   ),
   '2026-W19', 'selected', true, true, 41),
  ('wtfti','book', '在通勤地铁上读完一章就够撑一周。',
   '匿名', array['voice','thanks'],
   jsonb_build_object(
     'book_title','她世界',
     'book_author','梁鸿',
     'book_quote','"她说话的时候，从来没有人记得记下来。"',
     'book_note','像在听十几个真实女性坐在我旁边讲她们怎么活下来的。'
   ),
   '2026-W19', 'shortlisted', true, false, 22),
  ('meta', 'book', '不是女性主义书，但帮我搞懂了"为什么我总是先道歉"。',
   '小桑', array['voice','story'],
   jsonb_build_object(
     'book_title','不被理解的我们',
     'book_author','岸见一郎',
     'book_quote','"被讨厌的勇气，本质上是放弃讨好。"',
     'book_note','和上野的书一起读，刚好互补。'
   ),
   '2026-W19', 'new', true, false, 14),
  ('soulti','book', '一本帮我理解"为什么我害怕亲密"的书。',
   '——HANA', array['voice','solidarity'],
   jsonb_build_object(
     'book_title','深井效应',
     'book_author','娜丁·伯克·哈里斯',
     'book_quote','"童年逆境会写进身体，但也可以被重写。"',
     'book_note','适合给所有觉得"我是不是有病"的姐妹。'
   ),
   '2026-W19', 'shortlisted', true, false, 18),
  ('meta', 'book', '想推荐给做母亲的朋友。',
   '一个妈妈', array['voice'],
   jsonb_build_object(
     'book_title','82 年生的金智英',
     'book_author','赵南柱',
     'book_quote','"她一开口，整个房间都安静下来——那种安静，是讨厌。"',
     'book_note','五年后重读，依然在哭。'
   ),
   '2026-W19', 'new', true, false, 11),
  ('meta', 'book', '在 AI 时代特别值得重读。',
   '阿月', array['voice','declare'],
   jsonb_build_object(
     'book_title','使女的故事',
     'book_author','玛格丽特·阿特伍德',
     'book_quote','"凡是发生过的，就有可能再发生。"',
     'book_note','配合"算法决定谁配怀孕"的新闻一起读，背后凉一阵。'
   ),
   '2026-W19', 'selected', true, false, 35),
  ('meta', 'book', '一本关于"被允许做选择"的小书。',
   '匿名', array['voice','thanks'],
   jsonb_build_object(
     'book_title','向前一步',
     'book_author','谢丽尔·桑德伯格',
     'book_quote','"如果你被邀请上一艘火箭，先上去再问位置。"',
     'book_note','现在回看不全对，但 22 岁的我需要这句话。'
   ),
   '2026-W19', 'new', true, false, 7),
  ('meta', 'book', '一边读一边想：原来我不是孤例。',
   '夜班的人', array['voice','solidarity'],
   jsonb_build_object(
     'book_title','倦怠社会',
     'book_author','韩炳哲',
     'book_quote','"我们不是被压榨，是在自我剥削。"',
     'book_note','当代女性的过劳剧本写在里面。'
   ),
   '2026-W19', 'shortlisted', true, false, 16),
  ('meta', 'book', '一本不被骂"鸡汤"的女性写作书。',
   '——一个文案', array['voice'],
   jsonb_build_object(
     'book_title','成为',
     'book_author','米歇尔·奥巴马',
     'book_quote','"我不是任何人的妻子或母亲——我先是我自己。"',
     'book_note','适合在年初读一次，年底再读一次。'
   ),
   '2026-W19', 'new', true, false, 9);

-- ───────────────────────────────────────────────────────────────
-- AI QUESTION · 我想用 AI 解决的问题（W19）
-- ───────────────────────────────────────────────────────────────
insert into _hermosa_seed_2026_05_05
  (universe, kind, text, signature, tags, metadata, topic_week, curation_status, consent_to_feature, is_featured, echo_count)
values
  ('meta', 'ai_question', '我想用 AI 帮我评估"这份 offer 真的值得搬到另一个城市吗"。',
   '小桑', array['voice','story'],
   jsonb_build_object(
     'ai_question','怎么把"换城市"这件事拆成可以打分的维度，让 AI 帮我对比两份 offer？',
     'ai_context','换城市 / 评估 offer / 不只看薪资',
     'ai_tool','ChatGPT'
   ),
   '2026-W19', 'selected', true, true, 38),
  ('meta', 'ai_question', '我在练习用 AI 复盘每一次"我为什么又道歉了"。',
   '阿月', array['voice','solidarity'],
   jsonb_build_object(
     'ai_question','怎么让 AI 在我事后描述对话时帮我标注出我用了多少次"对不起 / 不好意思"？',
     'ai_context','社交复盘 / 自我观察',
     'ai_tool','Claude'
   ),
   '2026-W19', 'shortlisted', true, false, 24),
  ('cpti', 'ai_question', '我想让 AI 当我和伴侣的"语言翻译器"。',
   '小鱼', array['voice','story'],
   jsonb_build_object(
     'ai_question','怎么让 AI 把同一句话翻译成"对方能听懂的版本"，避免吵架升级？',
     'ai_context','亲密关系沟通 / 避免升级',
     'ai_tool','ChatGPT 桌面版'
   ),
   '2026-W19', 'selected', true, true, 33),
  ('meta', 'ai_question', '我想用 AI 帮我做"是否要继续看这个心理咨询师"的判断。',
   '匿名', array['voice'],
   jsonb_build_object(
     'ai_question','怎么用 AI 帮我整理咨询录音，识别我每次都被绕开了哪些核心问题？',
     'ai_context','心理咨询 / 自我代理',
     'ai_tool','Whisper + Claude'
   ),
   '2026-W19', 'shortlisted', true, false, 19),
  ('meta', 'ai_question', '我想让 AI 帮我做"是不是该去做卵子冷冻"的决策草稿。',
   '林中野', array['voice','story'],
   jsonb_build_object(
     'ai_question','怎么让 AI 把医学风险、经济成本、心理顾虑列成一张我能反复修改的决策表？',
     'ai_context','生育自由 / 个人决策',
     'ai_tool','GPT-4o'
   ),
   '2026-W19', 'selected', true, false, 27),
  ('xpti', 'ai_question', '我想让 AI 模拟我妈，把"为什么不结婚"这个问题陪我练 30 遍。',
   '——一个 XPTI', array['voice','solidarity'],
   jsonb_build_object(
     'ai_question','怎么让 AI 扮演我妈，按她真实语气连续追问，让我练到不再发抖？',
     'ai_context','原生家庭 / 边界练习',
     'ai_tool','Claude Projects'
   ),
   '2026-W19', 'selected', true, true, 44),
  ('meta', 'ai_question', '我想让 AI 帮我每周问自己 5 个"她会怎么活"的问题。',
   '——HANA', array['voice','declare'],
   jsonb_build_object(
     'ai_question','怎么让 AI 每周自动生成一组只属于我这个阶段的"自我提问清单"？',
     'ai_context','自我觉察 / 周仪式',
     'ai_tool','自定义 GPTs'
   ),
   '2026-W19', 'shortlisted', true, false, 16),
  ('wtfti','ai_question', '我想用 AI 帮我练"在会议上插话"。',
   '盐汽水', array['voice','story'],
   jsonb_build_object(
     'ai_question','怎么让 AI 模拟一个全是男性同事的会议，让我练 5 种不带歉意的开场？',
     'ai_context','职场表达 / 反打断',
     'ai_tool','ChatGPT 语音'
   ),
   '2026-W19', 'selected', true, true, 36),
  ('meta', 'ai_question', '我想让 AI 帮我审一审自己的财务，但不被它建议"少喝奶茶"。',
   '匿名', array['feedback','voice'],
   jsonb_build_object(
     'ai_question','怎么让 AI 用"非家长式"的语气帮我做女性视角的预算审计？',
     'ai_context','财务自由 / 反消费羞辱',
     'ai_tool','Claude'
   ),
   '2026-W19', 'new', true, false, 11),
  ('meta', 'ai_question', '我希望 AI 能帮我每月写一封"给一年后自己的信"。',
   '一个妈妈', array['voice','thanks'],
   jsonb_build_object(
     'ai_question','怎么让 AI 根据本月日记自动生成一封给"未来一年的我"的私密信？',
     'ai_context','长程自我陪伴',
     'ai_tool','GPTs + Notion'
   ),
   '2026-W19', 'shortlisted', true, false, 20);

-- ───────────────────────────────────────────────────────────────
-- 上一周（W18）少量样本，让"周对比"和"个人档案"有跨周数据
-- ───────────────────────────────────────────────────────────────
insert into _hermosa_seed_2026_05_05
  (universe, kind, text, signature, tags, metadata, topic_week, curation_status, consent_to_feature, is_published, is_featured, echo_count)
values
  ('meta', 'voice', '上周我决定把每月 800 块"偶尔想见前任"的预算，转去做心理咨询。',
   '小桑', array['voice','declare'], '{}'::jsonb,
   '2026-W18', 'published', true, true, true, 58),
  ('meta', 'voice', '我把"取悦别人"从今年的 KPI 里删掉了。',
   '阿月',  array['voice','declare'], '{}'::jsonb,
   '2026-W18', 'published', true, true, true, 49),
  ('meta', 'book', '上周读完，强烈推荐给所有"觉得不该愤怒"的女生。',
   '林中野', array['voice'],
   jsonb_build_object(
     'book_title','愤怒的女人最美',
     'book_author','索拉雅·切梅利',
     'book_quote','"愤怒不是失控，是边界。"',
     'book_note','看到一半就想给所有还在压抑的姐妹打电话。'
   ),
   '2026-W18', 'published', true, true, true, 33),
  ('meta', 'ai_question', '上周让 AI 帮我列了一张"我今年要拒绝的事"清单，目前在 17 项。',
   '——一个文案', array['voice','story'],
   jsonb_build_object(
     'ai_question','怎么让 AI 每周帮我审一次"今年要拒绝的事"清单的执行情况？',
     'ai_context','拒绝练习 / 周复盘',
     'ai_tool','Claude Projects'
   ),
   '2026-W18', 'published', true, true, false, 27);

-- ───────────────────────────────────────────────────────────────
-- 统一插入：通过文本+主题周指纹避免重复种子
-- ───────────────────────────────────────────────────────────────
insert into public.hermosa_messages
  (id, universe, slug, code, kind, text, signature, tags, metadata,
   topic_week, curation_status, consent_to_feature, attribution_mode,
   safety_level, status, status_note, is_published, is_featured,
   flagged, echo_count, client_hash, created_at)
select
  gen_random_uuid(),
  s.universe, null, null, s.kind, s.text, s.signature, s.tags, s.metadata,
  s.topic_week, s.curation_status, s.consent_to_feature, s.attribution_mode,
  s.safety_level,
  case when s.curation_status = 'published' then 'shipped' else null end,
  null,
  s.is_published, s.is_featured,
  false,
  s.echo_count,
  'seed-2026-05-05',
  -- 把 W18 数据放在 8 天前，W19 放在最近 6 天内随机分布
  case
    when s.topic_week = '2026-W18' then now() - interval '8 days'
    else now() - (random() * interval '5 days')
  end
from _hermosa_seed_2026_05_05 s
where not exists (
  select 1 from public.hermosa_messages m
  where m.client_hash = 'seed-2026-05-05'
    and m.text = s.text
    and m.topic_week = s.topic_week
);

-- =============================================================
-- End of seed
-- =============================================================
