export type ApimartTaskState =
  | 'submitted'
  | 'pending'
  | 'processing'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type MirrorMode = 'beauty' | 'fortune' | 'color' | 'compare';
export type BeautyReportType = 'comprehensive' | 'hairstyle' | 'makeup' | 'fashion';

export interface BeautyMirrorTaskInput {
  imageDataUrl: string;
  vibe: string;
  hairConstraint: string;
  avoid: string;
  reportType?: BeautyReportType;
}

export interface FortuneMirrorTaskInput {
  imageDataUrl: string;
  analysisType: string;
  focusAreas: string;
  avoid: string;
}

export interface ColorMirrorTaskInput {
  imageDataUrl: string;
  seasonHint: string;
  analysisDepth: string;
  avoid: string;
}

export interface CompareMirrorTaskInput {
  imageDataUrl: string;
  compareStyles: string;
  avoid: string;
}

export type MirrorTaskInput = BeautyMirrorTaskInput | FortuneMirrorTaskInput | ColorMirrorTaskInput | CompareMirrorTaskInput;

export interface ApimartSubmitResult {
  taskId: string;
  status: ApimartTaskState;
  prompt: string;
}

export interface ApimartPollResult {
  status: ApimartTaskState;
  progress: number;
  imageUrl: string | null;
  expiresAt: number | null;
  errorMessage: string | null;
}

export class ApimartImageError extends Error {
  statusCode: number;
  providerCode: number | string | null;

  constructor(message: string, statusCode = 502, providerCode: number | string | null = null) {
    super(message);
    this.name = 'ApimartImageError';
    this.statusCode = statusCode;
    this.providerCode = providerCode;
  }
}

const DEFAULT_APIMART_BASE_URL = 'https://api.apimart.ai/v1';
const DEFAULT_MODEL = 'gpt-image-2';
const DEFAULT_SIZE = '4:5';
const DEFAULT_RESOLUTION = '1k';

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function clampPromptField(value: string, fallback: string): string {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return trimmed.length > 80 ? trimmed.slice(0, 80) : trimmed;
}

function getConfig() {
  const apiKey = process.env.APIMART_API_KEY?.trim();
  if (!apiKey) {
    throw new ApimartImageError('APIMart image service is not configured', 503);
  }

  const baseUrl = (
    process.env.APIMART_IMAGE_API_BASE ||
    process.env.APIMART_API_BASE ||
    DEFAULT_APIMART_BASE_URL
  ).replace(/\/$/, '');

  return {
    apiKey,
    baseUrl,
    model: process.env.APIMART_IMAGE_MODEL?.trim() || DEFAULT_MODEL,
    resolution: process.env.APIMART_IMAGE_RESOLUTION?.trim() || DEFAULT_RESOLUTION,
    officialFallback: process.env.APIMART_OFFICIAL_FALLBACK === 'true',
  };
}

export function isApimartConfigured(): boolean {
  return !!process.env.APIMART_API_KEY?.trim();
}

// ═══════════════════════════════════════════════════════════════════════════════
// Shared prompt constants
// ═══════════════════════════════════════════════════════════════════════════════

const VISUAL_STYLE = '视觉风格：精致、高级、女性向，像顶级时尚杂志的个人风格专栏。用柔和的金色细线、玫瑰陶土色、暮紫色、米白纸感做装饰。整体像小红书可保存的精致报告卡。';

const PERSON_RULE = '人物处理规则：保持面部骨骼结构、五官比例、面部轮廓不变。但可以大幅改变发型（长度/质感/颜色/造型）、妆容（眼妆/唇色/腮红/底妆质感）、肤色光泽度、服饰、配饰。变化要明显、戏剧性，让人一眼看出这是同一个人的不同风格演绎。';

const DISCLAIMER = '仅供审美参考，不做颜值评分、身份识别或命运判断。';

// ═══════════════════════════════════════════════════════════════════════════════
// Prompt builders — 综合变美报告
// ═══════════════════════════════════════════════════════════════════════════════

export function buildBeautyMirrorPrompt(input: BeautyMirrorTaskInput): string {
  const vibe = clampPromptField(input.vibe, '原生自然、干净有气色');
  const hairConstraint = clampPromptField(input.hairConstraint, '可微调发型');
  const reportType = input.reportType || 'comprehensive';

  switch (reportType) {
    case 'hairstyle':
      return buildHairstylePrompt(vibe, hairConstraint);
    case 'makeup':
      return buildMakeupPrompt(vibe);
    case 'fashion':
      return buildFashionPrompt(vibe);
    default:
      return buildComprehensivePrompt(vibe, hairConstraint);
  }
}

function buildComprehensivePrompt(vibe: string, hairConstraint: string): string {
  return [
    '基于参考人像，生成一张中文「综合变美灵镜报告」海报。输出必须是一张完整的、视觉惊艳的海报图片。',
    '',
    '【核心要求】这张图要展示"变美后的效果"——对原图进行风格化改造，生成一张明显更精致、更有风格感的版本。',
    PERSON_RULE,
    '',
    '【版式布局】',
    '左半部分：原图或当前风格（标注"Before / 现在"）',
    '右半部分：变美后的效果（标注"After / 变美后"），要明显比左边更精致、更有风格感',
    '底部：3 个关键推荐卡片（发型 / 色彩 / 妆容各一个）',
    '',
    '【风格方向】',
    `用户偏好：${vibe}。`,
    `发型边界：${hairConstraint}。`,
    '',
    VISUAL_STYLE,
    DISCLAIMER,
    '中文标签简洁，像顶级时尚杂志的个人风格专栏。',
  ].join('\n');
}

function buildHairstylePrompt(vibe: string, hairConstraint: string): string {
  return [
    '基于参考人像，生成一张中文「发型专项报告」海报。输出必须是一张完整的、视觉惊艳的海报图片。',
    '',
    '【核心要求】展示 3 套完全不同的发型方案。每套方案都要有明显的视觉差异（长度/质感/颜色/造型都要不同）。',
    PERSON_RULE,
    '',
    '【版式布局】',
    '顶部：人物原图（小图，标注"当前发型"）',
    '主体：3 套发型方案，每套占 1/3 空间，包含：',
    '- 方案名称（如"法式慵懒锁骨发"、"韩系空气刘海短发"、"复古港风大波浪"）',
    '- 人物换上该发型后的效果图（要能看出是同一个人）',
    '- 3 个关键细节标注（长度/质感/颜色/分区/刘海等）',
    '',
    '【发型要求】',
    `- 3 套方案要风格差异大：一套偏${vibe}，一套偏酷感利落，一套偏浪漫柔美`,
    `- 每套发型要具体到可执行：长度（锁骨/下巴/腰际）、质感（柔顺/蓬松/微卷）、颜色（具体色号如焦糖棕/冷茶色/黑茶色）、刘海（空气/侧分/无）、造型（内扣/外翻/直发）`,
    `发型约束：${hairConstraint}。`,
    '',
    VISUAL_STYLE,
    '像专业发型师给客户的改造方案，具体到可以直接拿给 Tony 老师看。',
    DISCLAIMER,
  ].join('\n');
}

function buildMakeupPrompt(vibe: string): string {
  return [
    '基于参考人像，生成一张中文「妆容专项报告」海报。输出必须是一张完整的、视觉惊艳的海报图片。',
    '',
    '【核心要求】展示 3 套完全不同的妆容方案。每套妆容都要有明显的视觉差异（眼妆/唇色/腮红/底妆都要不同）。',
    PERSON_RULE,
    '',
    '【版式布局】',
    '顶部：素颜或淡妆状态（小图，标注"素颜基准"）',
    '主体：3 套妆容方案，每套占 1/3 空间，包含：',
    '- 妆容名称（如"日杂透明感妆"、"法式慵懒玫瑰妆"、"高级感职场妆"）',
    '- 人物化上该妆容后的效果图（要能看出是同一个人）',
    '- 4 个步骤卡片：底妆→眼妆→腮红→唇妆',
    '',
    '【妆容要求】',
    `- 3 套妆容要风格差异大：一套偏${vibe}，一套偏精致高级，一套偏日常实用`,
    '- 每套妆容要具体到可执行：底妆（哑光/水光/奶油肌）、眼影（具体色调如暖棕/冷灰/玫瑰粉）、眼线（内眼线/外眼线/无）、腮红（位置+颜色）、唇妆（质地+颜色）',
    '',
    VISUAL_STYLE,
    '像美妆博主的妆教图，具体到可以对着镜子一步步化。',
    DISCLAIMER,
  ].join('\n');
}

function buildFashionPrompt(vibe: string): string {
  return [
    '基于参考人像，生成一张中文「服饰配饰报告」海报。输出必须是一张完整的、视觉惊艳的海报图片。',
    '',
    '【核心要求】展示 3 套完全不同的穿搭方案。每套穿搭都要有明显的风格差异。',
    PERSON_RULE,
    '',
    '【版式布局】',
    '主体：3 套穿搭方案，每套占 1/3 空间，包含：',
    '- 穿搭名称（如"法式通勤"、"韩系约会"、"日杂休闲"）',
    '- 人物穿上该穿搭的效果图（要能看出是同一个人）',
    '- 穿搭单品卡：上装 / 下装 / 鞋 / 包 / 配饰',
    '',
    '【穿搭要求】',
    `- 3 套穿搭要风格差异大：一套偏${vibe}，一套偏精致通勤，一套偏休闲日常`,
    '- 每套穿搭要具体到可执行：上装（款式+颜色+材质）、下装（款式+颜色）、鞋（款式）、包（款式+大小）、配饰（项链/耳环/手表等）',
    '- 色彩搭配要和谐，给出配色公式',
    '',
    VISUAL_STYLE,
    '像时尚杂志的穿搭专栏，具体到可以直接照着买。',
    DISCLAIMER,
  ].join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Prompt builders — 命纹灵镜
// ═══════════════════════════════════════════════════════════════════════════════

export function buildFortuneMirrorPrompt(input: FortuneMirrorTaskInput): string {
  const analysisType = clampPromptField(input.analysisType, '面相与气质综合分析');
  const focusAreas = clampPromptField(input.focusAreas, '五官比例、脸型轮廓、气场特质');
  const avoid = clampPromptField(input.avoid, '避免负面定论、恐吓性预言');

  return [
    '基于参考人像，生成一张中文「灵镜命纹报告」海报。输出必须是一张完整的、视觉惊艳的海报图片。',
    '本报告仅供娱乐与自我观察，不构成专业心理诊断或人生决策依据。',
    '',
    '【核心要求】通过面相学、气质分析等维度，给出有趣、精准、让用户觉得"好准"的性格解读。',
    '',
    '【版式布局】',
    '主体：人物面部特写，用金色细线标注 3-5 个关键分析点',
    '每个标注点：线条 + 关键词 + 简短解读（2-3 句）',
    '底部：气质总结卡片',
    '',
    '【分析维度】',
    `分析类型：${analysisType}。`,
    `关注维度：${focusAreas}。`,
    '- 分析要具体、有洞察感，不要泛泛而谈',
    '- 用"你的XX说明..."句式，让用户觉得被看透',
    '- 每个分析点要配线条标注在面部对应位置',
    '',
    VISUAL_STYLE,
    DISCLAIMER,
  ].join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Prompt builders — 色彩诊断
// ═══════════════════════════════════════════════════════════════════════════════

export function buildColorMirrorPrompt(input: ColorMirrorTaskInput): string {
  const seasonHint = clampPromptField(input.seasonHint, '自动判断');
  const analysisDepth = clampPromptField(input.analysisDepth, '完整报告');

  return [
    '基于参考人像，生成一张中文「个人色彩诊断报告」海报。输出必须是一张完整的、视觉惊艳的海报图片。',
    '',
    '【核心要求】给出专业、具体、可执行的色彩诊断结果。',
    '',
    '【版式布局】',
    '左上：人物小图 + 色彩季节判断（如"暖秋型 Warm Autumn"）',
    '右上：9 色专属色卡（每个色块标注颜色名称）',
    '中左：妆容配色方案（眼影/腮红/唇色各 3 个推荐色）',
    '中右：发色推荐（3 个适合的发色色块）',
    '底部：穿搭配色公式（3 套配色方案，每套 3 个颜色组合）',
    '',
    '【色彩要求】',
    `季节提示：${seasonHint}。如果用户有倾向可以参考，否则根据肤色/发色/瞳孔色自主判断。`,
    `分析深度：${analysisDepth}。`,
    '- 色彩季节要精确到子类型（如暖春/冷夏/深秋/亮冬）',
    '- 色卡颜色要具体（如"驼色 #C19A6B"而非"棕色"）',
    '- 妆容配色要具体到产品类型（如"哑光暖棕眼影"）',
    '',
    VISUAL_STYLE,
    DISCLAIMER,
  ].join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Prompt builders — 风格对比
// ═══════════════════════════════════════════════════════════════════════════════

export function buildCompareMirrorPrompt(input: CompareMirrorTaskInput): string {
  const styles = clampPromptField(input.compareStyles, '原生自然,暗黑辣妹');
  const styleList = styles.split(/[,，、]/).map(s => s.trim()).filter(Boolean);
  const styleCount = Math.min(styleList.length, 3);

  const styleDetails: Record<string, string> = {
    '原生自然': '裸妆感底妆、柔顺自然发色（深棕/黑茶）、空气感碎发、无眼线或内眼线、裸色唇、简约金属细项链、白色/米色/浅驼色基础款服饰',
    '清冷通勤': '雾面哑光底妆、利落低马尾或法式盘发、冷调灰棕眼影、细长眼线、豆沙玫瑰唇、珍珠耳钉、结构感西装或衬衫+阔腿裤',
    '约会玫瑰': '水光奶油肌、微卷披肩发、玫瑰粉眼影+卧蚕提亮、自然卷翘睫毛、玫瑰豆沙唇、小巧耳环、碎花裙或针织开衫',
    '暗黑辣妹': '哑光冷白皮底妆、黑色长直发或高马尾、烟熏眼妆（深棕/酒红/黑色眼影大面积晕染）、上挑眼线、深色唇（姨妈色/浆果色/深酒红）、银色链条耳环/chocker、黑色皮衣/紧身上衣+高腰裤/短裙',
  };

  const styleDescriptions = styleList.map(s => {
    const detail = styleDetails[s] || '独特风格，大胆尝试';
    return `【${s}】${detail}`;
  }).join('\n');

  return [
    `基于参考人像，生成一张中文「风格对比报告」海报。输出必须是一张完整的、视觉惊艳的海报图片。`,
    '',
    `【核心要求】展示同一个人在 ${styleCount} 种风格下的戏剧性对比。每种风格的变化要最大化——发型、妆容、肤色质感、服饰、配饰、整体气质都要完全不同。`,
    PERSON_RULE,
    '',
    '【版式布局】',
    `${styleCount} 个风格方案并排展示，每个占 ${styleCount === 2 ? '50%' : '33%'} 宽度：`,
    '- 每个方案：人物换上该风格后的效果图（要能看出是同一个人，但风格完全不同）',
    '- 风格名称 + 3 个关键词标签',
    '- 底部：一句话点评（"最适合你的风格是..."）',
    '',
    '【风格细节】',
    styleDescriptions,
    '',
    '【关键】',
    '- 每种风格之间的差异要最大化、戏剧性，让人一眼就能区分',
    '- 暗黑辣妹要足够暗黑、足够辣——烟熏眼妆、深色唇、银色配饰、黑色服饰',
    '- 原生自然要足够清新、干净——裸妆、自然发色、简约配饰',
    '- 不要所有风格都长得差不多，要有强烈反差',
    '',
    VISUAL_STYLE,
    DISCLAIMER,
  ].join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// API interaction
// ═══════════════════════════════════════════════════════════════════════════════

async function readProviderJson(response: Response): Promise<JsonRecord> {
  const text = await response.text();
  if (!text) return {};

  try {
    const parsed: unknown = JSON.parse(text);
    return isRecord(parsed) ? parsed : { raw: parsed };
  } catch {
    return { message: text.slice(0, 400) };
  }
}

function providerMessage(json: JsonRecord): string {
  const direct =
    asString(json.message) ||
    asString(json.error) ||
    asString(json.msg) ||
    asString(json.detail);

  if (direct) return direct;

  if (isRecord(json.error)) {
    return (
      asString(json.error.message) ||
      asString(json.error.type) ||
      'APIMart provider returned an error'
    );
  }

  if (isRecord(json.data) && isRecord(json.data.error)) {
    return asString(json.data.error.message) || 'APIMart task failed';
  }

  return 'APIMart provider returned an unexpected response';
}

function parseTaskState(value: unknown, fallback: ApimartTaskState): ApimartTaskState {
  const status = asString(value);
  if (
    status === 'submitted' ||
    status === 'pending' ||
    status === 'processing' ||
    status === 'in_progress' ||
    status === 'completed' ||
    status === 'failed' ||
    status === 'cancelled'
  ) {
    return status;
  }
  return fallback;
}

export async function submitMirrorTask(mode: MirrorMode, input: MirrorTaskInput): Promise<ApimartSubmitResult> {
  const config = getConfig();
  let prompt: string;

  switch (mode) {
    case 'fortune':
      prompt = buildFortuneMirrorPrompt(input as FortuneMirrorTaskInput);
      break;
    case 'color':
      prompt = buildColorMirrorPrompt(input as ColorMirrorTaskInput);
      break;
    case 'compare':
      prompt = buildCompareMirrorPrompt(input as CompareMirrorTaskInput);
      break;
    default:
      prompt = buildBeautyMirrorPrompt(input as BeautyMirrorTaskInput);
      break;
  }

  const body: JsonRecord = {
    model: config.model,
    prompt,
    n: 1,
    size: DEFAULT_SIZE,
    resolution: config.resolution,
    image_urls: [input.imageDataUrl],
  };

  if (config.officialFallback) {
    body.official_fallback = true;
  }

  const response = await fetch(`${config.baseUrl}/images/generations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const json = await readProviderJson(response);
  const providerCode = asNumber(json.code);
  if (!response.ok || (providerCode !== null && providerCode !== 200)) {
    throw new ApimartImageError(providerMessage(json), response.status || 502, providerCode);
  }

  const data = Array.isArray(json.data) ? json.data[0] : json.data;
  if (!isRecord(data)) {
    throw new ApimartImageError('APIMart did not return a task payload');
  }

  const taskId = asString(data.task_id) || asString(data.id);
  if (!taskId) {
    throw new ApimartImageError('APIMart did not return task_id');
  }

  return {
    taskId,
    status: parseTaskState(data.status, 'submitted'),
    prompt,
  };
}

// Backward-compatible alias
export const submitBeautyMirrorTask = (input: BeautyMirrorTaskInput) =>
  submitMirrorTask('beauty', input);

function extractImageUrl(task: JsonRecord): { imageUrl: string | null; expiresAt: number | null } {
  const result = isRecord(task.result) ? task.result : null;
  const images = Array.isArray(result?.images) ? result.images : [];
  const first = images.find(isRecord);
  if (!first) {
    return { imageUrl: null, expiresAt: null };
  }

  const rawUrl = first.url;
  const imageUrl = Array.isArray(rawUrl) ? asString(rawUrl[0]) : asString(rawUrl);
  const expiresAt = asNumber(first.expires_at);
  return { imageUrl, expiresAt };
}

export async function pollApimartTask(taskId: string): Promise<ApimartPollResult> {
  const config = getConfig();
  const response = await fetch(
    `${config.baseUrl}/tasks/${encodeURIComponent(taskId)}?language=zh`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${config.apiKey}` },
      cache: 'no-store',
    },
  );

  const json = await readProviderJson(response);
  const providerCode = asNumber(json.code);
  if (!response.ok || (providerCode !== null && providerCode !== 200)) {
    throw new ApimartImageError(providerMessage(json), response.status || 502, providerCode);
  }

  const task = isRecord(json.data) ? json.data : json;
  const status = parseTaskState(task.status, 'processing');
  const progress = Math.max(0, Math.min(100, asNumber(task.progress) ?? 0));
  const { imageUrl, expiresAt } = extractImageUrl(task);
  const errorMessage = status === 'failed' ? providerMessage(task) : null;

  return { status, progress, imageUrl, expiresAt, errorMessage };
}
