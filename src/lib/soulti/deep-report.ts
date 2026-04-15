/**
 * Deep Mirror Report — 深度镜像报告
 *
 * Content data for:
 * 1. Axis cross-interpretations (轴间交叉解读)
 * 2. Repair prescriptions (修复处方)
 * 3. Soul letter seeds (灵魂长信种子)
 *
 * ⚠️ PAYMENT RESERVATION:
 * All content is currently served free. When payment is enabled,
 * gate access behind a paywall at the component level (SoultiDeepReport).
 * No data-layer changes needed — just wrap the UI in a payment check.
 */

// ────────────────────────────────────────────────────────────
//  1. Axis Cross-Interpretations · 轴间交叉解读
// ────────────────────────────────────────────────────────────

export interface AxisCrossReading {
  /** e.g. 'J3×J4' */
  axes: string;
  /** Display title */
  title: string;
  /** The two axis letters, e.g. ['O','F'] */
  combo: [string, string];
  /** Label for this combo */
  label: string;
  /** Short tagline */
  tagline: string;
  /** Deep interpretation paragraph */
  interpretation: string;
  /** Pattern name in relationships */
  relationalPattern: string;
}

/**
 * J3(界限) × J4(火焰) — 保护模式
 * Your boundary style + energy pattern = how you protect yourself in relationships
 */
const EDGE_SPARK_CROSS: AxisCrossReading[] = [
  {
    axes: 'J3×J4',
    title: '界限轴 × 火焰轴',
    combo: ['O', 'F'],
    label: '融 × 焰',
    tagline: '持续燃烧的共情者',
    interpretation:
      '你的边界是柔软的，火焰是持续的——这意味着你会不断地、稳定地为别人燃烧。你不会爆发式地付出然后消失，而是像壁炉一样，谁靠过来都能取暖。问题是：壁炉自己不会喊热。你的保护模式是"一直给，直到有一天突然发现自己已经空了很久了"。你需要学会的不是关上门，而是允许火焰有时候只为自己燃烧。',
    relationalPattern: '持续付出型 — 总是最后一个发现自己累了的人',
  },
  {
    axes: 'J3×J4',
    title: '界限轴 × 火焰轴',
    combo: ['O', 'E'],
    label: '融 × 烬',
    tagline: '爆发后沉默的温柔人',
    interpretation:
      '你的边界柔软，火焰却是间歇的——你会全情投入一段关系或一个人，倾尽所有，然后突然熄灭。不是不在意了，是烧完了。你的保护模式是"消失"：不是冷暴力，是真的没有能量了。周围的人可能会困惑——"她怎么突然就不理人了？"——但他们不知道你之前投入了多少。你需要学会的是：在火还亮着的时候就开始分配，不要等到烬才停。',
    relationalPattern: '燃尽消失型 — 全力以赴，然后突然隐身',
  },
  {
    axes: 'J3×J4',
    title: '界限轴 × 火焰轴',
    combo: ['B', 'F'],
    label: '壁 × 焰',
    tagline: '有原则的持续燃烧者',
    interpretation:
      '你的边界清晰，火焰持续——这是一种非常健康但容易被误解的模式。你知道自己的底线在哪里，也知道该给谁、给多少。你不会无差别付出，但对你决定在意的人，你的火不会灭。外人可能觉得你"冷"，但被你选中的人知道：你的温暖是最可靠的。你的保护模式是"筛选"——不是所有人都值得你的火，你很早就学会了这一点。',
    relationalPattern: '选择性深爱型 — 对多数人有壁，对少数人是永恒的炉火',
  },
  {
    axes: 'J3×J4',
    title: '界限轴 × 火焰轴',
    combo: ['B', 'E'],
    label: '壁 × 烬',
    tagline: '等到烧完了才允许自己离开',
    interpretation:
      '你的边界清晰，但火焰是间歇的——这创造了一种特殊的模式：你不轻易让人进来，但一旦让了，你会用尽全力。等到这股力量烧完了，你的壁又会升起来，而且比之前更高。你在关系中反复出现的循环是：筛选→全力投入→燃尽→筑更高的壁。每一次循环，进入你世界的门槛都更高一点。你需要学会的是：不是每段关系都需要你全部的火。',
    relationalPattern: '循环加壁型 — 每次烧完都把墙建得更高一点',
  },
];

/**
 * J1(潮汐) × J2(锚定) — 核心表达方式
 * Your energy direction + certainty need = how you express your core self
 */
const TIDE_ROOT_CROSS: AxisCrossReading[] = [
  {
    axes: 'J1×J2',
    title: '潮汐轴 × 锚定轴',
    combo: ['T', 'R'],
    label: '涌 × 根',
    tagline: '有根基的行动派',
    interpretation:
      '你的能量向外涌动，同时需要确定感的锚——这意味着你是一个"有计划的冒险者"。你不会坐着等灵感，而是主动出击；但你会在出发之前就想好退路。你的存在方式是"稳定的扩张"：不是毫无方向地冲，而是每一步都把根扎得更深。你在人群中的角色是可靠的发起者——大家知道跟你走不会迷路。',
    relationalPattern: '稳定输出者 — 可以同时让人安心和兴奋',
  },
  {
    axes: 'J1×J2',
    title: '潮汐轴 × 锚定轴',
    combo: ['T', 'W'],
    label: '涌 × 风',
    tagline: '顺风而涌的自由灵魂',
    interpretation:
      '你的能量向外，也不需要锚——你是人群中最自由的存在。你走到哪里就在哪里生根（或者不生根也行）。你的生命力在于不断地遇到新的人、新的场景、新的可能。但你的挑战是：当风停了、当外界不再刺激，你可能会突然不知道自己是谁。你需要学会在没有风的日子里，也能找到自己的涌动。',
    relationalPattern: '永恒旅人型 — 你的热情随风而来，也随风而去',
  },
  {
    axes: 'J1×J2',
    title: '潮汐轴 × 锚定轴',
    combo: ['S', 'R'],
    label: '静 × 根',
    tagline: '深扎的沉思者',
    interpretation:
      '你的能量向内沉淀，也需要确定感——你是最稳定的存在。像一棵老树，扎根在同一个地方，用年轮记录一切。你不需要向外表达来确认自己的价值：你知道自己是谁，也知道自己站在哪里。你的挑战是：当被迫移动的时候（换城市、换工作、换关系），你会比别人痛苦得多。因为你的根和土地长在了一起。',
    relationalPattern: '不动如山型 — 你的安全感来自不变，你的脆弱也是',
  },
  {
    axes: 'J1×J2',
    title: '潮汐轴 × 锚定轴',
    combo: ['S', 'W'],
    label: '静 × 风',
    tagline: '安静的漫游者',
    interpretation:
      '你的能量向内，但不需要锚——你是最自洽的存在。你可以一个人待着，一个人走路，一个人在陌生的城市里逛一天也不觉得孤独。你的自由不是向外的奔跑，而是向内的辽阔。你不太需要别人来确认你的存在，也不太需要确定性来让你安心。你的挑战是：别人可能永远走不进你的世界，不是因为你有壁，而是因为你的世界太安静了，他们听不到入口。',
    relationalPattern: '自给自足型 — 你不孤独，但你可能让关心你的人无从下手',
  },
];

/**
 * J5(蜕变) × J3(界限) — 修复与边界互动
 * Your healing pattern + boundary style = how you recover and rebuild
 */
const META_EDGE_CROSS: AxisCrossReading[] = [
  {
    axes: 'J5×J3',
    title: '蜕变轴 × 界限轴',
    combo: ['G', 'O'],
    label: '生 × 融',
    tagline: '在伤口上开花的共情者',
    interpretation:
      '你受伤后会生长，边界又是柔软的——这意味着你的伤口永远是敞开的，但从里面会长出东西。你是那种"因为被伤过所以更懂别人的痛"的人。你不会因为受伤就关上门，反而会把门开得更大——"因为我知道那种被关在外面的感觉"。你的修复方式美丽但危险：如果你一直用受伤后的共情去疗愈别人，你自己的伤口什么时候闭合呢？',
    relationalPattern: '伤口共情型 — 你的温柔来自你的伤，但伤不能一直替你说话',
  },
  {
    axes: 'J5×J3',
    title: '蜕变轴 × 界限轴',
    combo: ['G', 'B'],
    label: '生 × 壁',
    tagline: '在保护中重生的人',
    interpretation:
      '你受伤后会生长，但你的边界是清晰的——这是最高效的修复方式。受伤了？你会先把壁升起来，给自己一个安全的空间，然后在壁的保护下安静地发芽。你不需要别人来拯救你，也不会在伤口未愈的时候就去照顾别人。你知道什么时候该关上门，什么时候打开。你的修复是有规划的重生。',
    relationalPattern: '自主重生型 — 受伤后回到自己的壳里，然后带着新的枝条回来',
  },
  {
    axes: 'J5×J3',
    title: '蜕变轴 × 界限轴',
    combo: ['K', 'O'],
    label: '矿 × 融',
    tagline: '变坚硬但依然敞开的矛盾体',
    interpretation:
      '你受伤后会结晶变硬，但边界依然柔软——这创造了一种微妙的矛盾：你的内核在变硬，但你的表面还是柔软的。别人可能看不出你变了，因为你还是会共情、还是会关心、还是会让人靠近。但你内心已经不一样了：你变得更小心了、更厚了、更不容易被真正触动了。你的挑战是：你可能会变成一个"看起来很温柔的人但谁也伤不到你"——这保护了你，但也隔绝了你。',
    relationalPattern: '微笑铠甲型 — 表面柔软不变，但每次受伤内核都硬一层',
  },
  {
    axes: 'J5×J3',
    title: '蜕变轴 × 界限轴',
    combo: ['K', 'B'],
    label: '矿 × 壁',
    tagline: '伤口凝固成城堡的人',
    interpretation:
      '你受伤后会结晶，边界也是清晰的——你是受伤后变化最大的人。每一次疼痛都会让你的壁更高、你的内核更硬。你不会重复犯同一个错误，因为每个教训都被你永久地编码进了防御系统。你的修复方式不是"好起来"，而是"变得更不可摧"。你的挑战是：城堡建得太坚固，有一天你可能会发现自己出不去了。',
    relationalPattern: '城堡建造者 — 每次受伤都在加固，直到固若金汤也孤立无援',
  },
];

/** All cross-readings indexed by axes pair */
export const AXIS_CROSS_READINGS: Record<string, AxisCrossReading[]> = {
  'J3×J4': EDGE_SPARK_CROSS,
  'J1×J2': TIDE_ROOT_CROSS,
  'J5×J3': META_EDGE_CROSS,
};

/** Get applicable cross-readings for a given personality code (e.g. 'TROFG') */
export function getCrossReadingsForCode(code: string): AxisCrossReading[] {
  if (code.length < 5) return [];
  // code: [T/S][R/W][O/B][F/E][G/K]
  //         J1    J2    J3    J4    J5
  const j1 = code[0]; // T or S
  const j2 = code[1]; // R or W
  const j3 = code[2]; // O or B
  const j4 = code[3]; // F or E
  const j5 = code[4]; // G or K

  const results: AxisCrossReading[] = [];

  // J3×J4: edge × spark
  const edgeSpark = EDGE_SPARK_CROSS.find(r => r.combo[0] === j3 && r.combo[1] === j4);
  if (edgeSpark) results.push(edgeSpark);

  // J1×J2: tide × root
  const tideRoot = TIDE_ROOT_CROSS.find(r => r.combo[0] === j1 && r.combo[1] === j2);
  if (tideRoot) results.push(tideRoot);

  // J5×J3: metamorphosis × edge
  const metaEdge = META_EDGE_CROSS.find(r => r.combo[0] === j5 && r.combo[1] === j3);
  if (metaEdge) results.push(metaEdge);

  return results;
}

// ────────────────────────────────────────────────────────────
//  2. Repair Prescriptions · 修复处方
// ────────────────────────────────────────────────────────────

export interface RepairPrescription {
  /** G (生型) or K (矿型) */
  metamorphosisType: 'G' | 'K';
  /** Display label */
  typeLabel: string;
  /** Core metaphor */
  metaphor: string;
  /** Prescriptions */
  strategies: {
    title: string;
    description: string;
  }[];
}

export const REPAIR_PRESCRIPTIONS: RepairPrescription[] = [
  {
    metamorphosisType: 'G',
    typeLabel: '生型修复',
    metaphor: '你的伤口是一颗种子——给它时间、土壤和水，它会长出你自己都想不到的东西。',
    strategies: [
      {
        title: '允许伤口保持打开',
        description: '不要急着"走出来"。你的修复方式需要伤口保持一段时间的开放，才能让新东西长出来。在伤口愈合之前强行闭合，等于掐断了发芽的可能。你可以痛着，同时也在生长。',
      },
      {
        title: '用创造替代反刍',
        description: '当脑子里反复播放那件事的时候，不要试图想明白——试着做点什么。写下来、画下来、走出去、做一道新菜。你是生型的人：你通过"创造新的东西"来消化旧的痛。',
      },
      {
        title: '找到一个安全的人说出来',
        description: '你的生长需要土壤，而"被听见"就是土壤。不需要建议、不需要分析，只需要一个人安静地听你讲完。如果暂时没有这个人，写给未来的自己也算。',
      },
      {
        title: '给自己设一个"发芽期"',
        description: '明确告诉自己：接下来两周是我的发芽期，我可以不好、可以反复、可以退步。把恢复当成一个季节而不是一个任务。你不需要deadline来治愈自己。',
      },
      {
        title: '观察新枝而不评判',
        description: '受伤之后你会变——可能突然想学一个新东西、可能突然不想见某些人、可能突然对以前不在意的事有了感觉。不要评判这些变化，它们是你在生长的证据。',
      },
      {
        title: '重访旧伤看生长',
        description: '回看一年前、三年前的伤口。你会发现那些曾经以为过不去的事，最终都在你身上长出了什么。记住这个证据：你不是第一次在伤口上开出花来。',
      },
    ],
  },
  {
    metamorphosisType: 'K',
    typeLabel: '矿型修复',
    metaphor: '你的疼痛不会消失——它会凝固成你身上最坚硬的部分。这不是冷漠，是你的铠甲在自我锻造。',
    strategies: [
      {
        title: '允许自己变硬',
        description: '不要因为"变得不那么好说话了"而内疚。你的凝固是保护机制在工作。在你准备好打开之前，你需要先变得坚硬。这不是退步，是你在给自己锻造盾牌。',
      },
      {
        title: '给"硬"找一个出口',
        description: '你的结晶能量需要物理形式的出口。运动、整理房间、做手工、敲键盘——任何让你的身体去"做"的事。你的修复不是在脑子里完成的，是在手上完成的。',
      },
      {
        title: '建一个小小的仪式',
        description: '矿型的人需要"完结感"。为那件事写一封不会寄出去的信、把相关的东西收进一个盒子、选一天正式和那段经历告别。你的凝固需要一个明确的"封印时刻"。',
      },
      {
        title: '在你的城堡里留一扇小窗',
        description: '你建的壁很好，它保护了你。但试着留一扇小窗——哪怕只对一个人。你不需要让所有人进来，但如果谁也进不来，你的城堡就变成了牢房。一扇窗就够了。',
      },
      {
        title: '收集你的矿石',
        description: '每一次受伤凝固的经验都是一块矿石。把它们收集起来：那些你学到的教训、你不会再犯的错误、你不再允许的对待方式。它们不是你的伤疤，是你的财富。',
      },
      {
        title: '定期检查铠甲的厚度',
        description: '偶尔问自己：我现在的壁，是在保护我，还是在困住我？如果发现自己已经很久没让任何情绪穿透过了，也许需要敲开一小块——不是为了别人，是为了让你自己能呼吸。',
      },
    ],
  },
];

/** Get repair prescription for a given J5 letter */
export function getRepairPrescription(j5Letter: string): RepairPrescription | undefined {
  return REPAIR_PRESCRIPTIONS.find(p => p.metamorphosisType === j5Letter);
}

/** Get repair prescription from a full personality code */
export function getRepairForCode(code: string): RepairPrescription | undefined {
  if (code.length < 5) return undefined;
  return getRepairPrescription(code[4]);
}

// ────────────────────────────────────────────────────────────
//  3. Soul Letter Seeds · 写给你的长信
// ────────────────────────────────────────────────────────────

export interface SoulLetter {
  /** Opening line */
  opening: string;
  /** Core paragraphs */
  body: string[];
  /** Closing line */
  closing: string;
}

/**
 * Soul letters are keyed by the combination of the two most
 * emotionally significant axes: J3(界限) and J5(蜕变).
 * This gives us 4 core letters that feel deeply personal.
 *
 * The letter addresses "你" directly, in second person.
 */
export const SOUL_LETTERS: Record<string, SoulLetter> = {
  // O+G: 融+生 — open & growing
  'OG': {
    opening: '亲爱的你，',
    body: [
      '我知道你又在照顾别人了。你总是这样——自己还在疼着，就已经开始心疼别人了。你怕封闭吗？你一定很怕。因为你见过那些把自己关起来的人是什么样子，你不想变成那样。所以你选择一直打开着，即使打开意味着一次又一次地受伤。',
      '但我想告诉你一件你可能已经忘了的事：你每次受伤之后，都长出了新的东西。你可能没注意到，但我替你数了——那些年你长出的枝条，已经够遮荫一整个院子了。',
      '你不需要变得"更强"。强从来不是你的课题。你的课题是：允许自己在还没好的时候说"我还没好"。不是每一道伤口都需要马上开出花来。有些伤可以只是伤，让它痛着，让它慢慢来。',
      '你是伤口上开花的人。但偶尔，请让花为你自己开一次。',
    ],
    closing: '你已经很好了。不是"好起来了"的好——是本来就好。',
  },
  // O+K: 融+矿 — open & hardening
  'OK': {
    opening: '嘿，我知道你在假装没事。',
    body: [
      '你是一个很奇怪的矛盾体：你的表面还是那么柔软，对谁都温温的，让人觉得你好像什么都能承受。但你自己知道——里面不一样了。每一次受伤，你的内核都硬了一层。',
      '你不是变冷了，你是变沉了。你还是会关心别人，但不会再毫无保留地交出自己了。你开始在温柔的表面下放了一层看不见的玻璃。谁碰到都不会知道——因为你笑起来还是那么好看。',
      '我想说的是：你不需要为这种变化感到愧疚。保护自己不是自私，结晶不是冷酷。你只是在用你的方式学会了一件所有人迟早都要学会的事——不是所有人都值得你全部的柔软。',
      '但我有一个小小的请求：偶尔敲开一小块你的矿石，看看里面是不是还有你最初的温热。如果还有，就好。如果没有了，也没关系——你可以生出新的。',
    ],
    closing: '你的温柔不会因为你变硬而消失。它只是找到了更安全的住所。',
  },
  // B+G: 壁+生 — boundaried & growing
  'BG': {
    opening: '你好，总是很快就能站起来的你。',
    body: [
      '你处理伤痛的效率让身边的人印象深刻——受伤、退回自己的壳里、安静地修复、然后带着新的力量回来。你是自己最好的医生，对吧？你很少需要别人帮你疗伤，因为你总是能在独处中找到答案。',
      '我尊重你的方式。但我偶尔会想：当你一个人在壁的后面默默生长的时候，有没有哪一刻，其实是想有人陪着的？不需要他们做什么——就只是在。',
      '你很早就学会了自己照顾自己。这是你的超能力，也是你的保护色。但"我可以一个人搞定"有时候不是力量——是一种习惯性的放弃：放弃了被照顾的可能。',
      '下一次伤口发芽的时候，试着让一个人看见那个过程。不是因为你需要帮助，而是因为被看见这件事本身就是一种营养。你值得这份多余的温暖。',
    ],
    closing: '你不需要一个人扛。你只是还没习惯不用一个人扛。',
  },
  // B+K: 壁+矿 — boundaried & hardening
  'BK': {
    opening: '城堡里的你，还好吗？',
    body: [
      '你建了一座很好的城堡。每一块砖都是一次教训，每一面壁都是一次你决定不再受伤的决定。你的城堡很坚固，你在里面很安全。没有人可以随便伤到你了。',
      '但今天我想来敲敲你的门——不是要闯进去，只是想让你知道外面还有人。你的城堡建得太好了，好到有时候你也许忘了门在哪里。不是你出不去，是你太久没出去过了。',
      '你知道吗？你的坚硬让人尊敬。不是每个人都有你这种把痛苦变成铠甲的能力。你的矿石是你一生的作品——每一块都刻着"我活过来了"。',
      '但铠甲太重了会走不动的。偶尔可以卸下一小块，只是一小块——不是为了给别人看到你的脆弱，是为了让阳光照进来。你的城堡需要光，植物才能活。你的城堡里需要有活着的东西。',
    ],
    closing: '你不用拆掉城堡。你只需要打开一扇窗。阳光不会伤害你，我保证。',
  },
};

/** Get the soul letter for a given personality code */
export function getSoulLetterForCode(code: string): SoulLetter | undefined {
  if (code.length < 5) return undefined;
  const j3 = code[2]; // O or B
  const j5 = code[4]; // G or K
  return SOUL_LETTERS[`${j3}${j5}`];
}

// ────────────────────────────────────────────────────────────
//  4. Weekly Mirror Data · 每周镜像回看
// ────────────────────────────────────────────────────────────

export interface WeeklyMirrorPrompt {
  /** Week number (1-52, cycles) */
  week: number;
  /** Brief reflection prompt */
  prompt: string;
  /** Related axis */
  axis: string;
}

/** 12 weekly prompts (one quarter, then cycle) */
export const WEEKLY_MIRROR_PROMPTS: WeeklyMirrorPrompt[] = [
  { week: 1,  axis: 'J3', prompt: '这周有没有一个你说了"好"但其实想说"不"的时刻？' },
  { week: 2,  axis: 'J4', prompt: '你这周的能量，更像持续燃烧的壁炉，还是偶尔闪烁的烟花？' },
  { week: 3,  axis: 'J1', prompt: '这周你充电的方式是靠人群还是靠独处？和你以为的一样吗？' },
  { week: 4,  axis: 'J5', prompt: '最近有什么让你受伤的事吗？你是在伤口上长出了新东西，还是变硬了一点？' },
  { week: 5,  axis: 'J2', prompt: '这周有没有一个"计划外"的事情让你开心了——还是让你焦虑了？' },
  { week: 6,  axis: 'J3', prompt: '这周你照顾了谁？有人照顾你吗？' },
  { week: 7,  axis: 'J4', prompt: '你这周对什么事投入了超出预期的能量？值得吗？' },
  { week: 8,  axis: 'J1', prompt: '如果这周只能做一件让自己开心的事，你做了吗？' },
  { week: 9,  axis: 'J5', prompt: '想一想上个月你受的伤。它现在是长出了什么，还是硬成了什么？' },
  { week: 10, axis: 'J2', prompt: '你的生活里，最近有增加"确定感"还是"不确定感"？你现在更需要哪一种？' },
  { week: 11, axis: 'J3', prompt: '这周有没有人越过了你的边界？你是怎么处理的？下次呢？' },
  { week: 12, axis: 'J4', prompt: '如果给你这周的内在能量打个分（1-10），你给几分？比上周高还是低？' },
];

/** Get the mirror prompt for the current week */
export function getCurrentWeeklyPrompt(): WeeklyMirrorPrompt {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  const idx = (weekNum - 1) % WEEKLY_MIRROR_PROMPTS.length;
  return WEEKLY_MIRROR_PROMPTS[idx];
}
