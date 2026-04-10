const BASE_VISUAL_STYLE =
  '严格保留参考图的简洁低多边形纸艺插画风格(low-poly paper craft illustration)，保留方块头、圆眼睛、短四肢、呆萌比例。' +
  '不要照片感，不要高精度3D建模感，不要电影级光影，不要真实皮肤纹理，不要复杂背景，不要任何文字、标题或水印。' +
  '纯白背景，只保留一个居中的完整全身角色，颜色干净、造型简洁、轮廓明确。';

const BASE_SBTI_TONE =
  '这不是普通可爱吉祥物，而是 SBTI 世界观里会被截图转发的人格/状态拟人化角色。' +
  '气质要带明显的自嘲、搞怪、玩梗和一点点社死感，像“被说中但又很好笑”的梗图主角。' +
  '表情、肢体动作、道具和姿态都要夸张，第一眼就能看懂这个角色在讽刺什么、嘴硬什么、尴尬什么。' +
  '不要做成励志海报、唯美插画、治愈系海报或过于正经的人设图，宁可更抽象、更狼狈、更有槽点和传播张力。';

export function buildSbtiImagePrompt({ seriesLabel, seriesTone, concept, extraNotes }) {
  return [
    BASE_VISUAL_STYLE,
    `这是一个"${seriesLabel}"系列图鉴角色。`,
    BASE_SBTI_TONE,
    seriesTone,
    concept,
    extraNotes,
  ]
    .filter(Boolean)
    .join('');
}
