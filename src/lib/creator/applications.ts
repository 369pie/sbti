export type CreatorApplicationStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'approved'
  | 'rejected'
  | 'archived';

export const CREATOR_APPLICATIONS_TABLE = 'creator_applications';
export const CREATOR_APPLICATIONS_SCHEMA_DOC = 'src/lib/ugc/schema.sql';
export const CREATOR_APPLICATIONS_SETUP_DOC = 'docs/05-operations/infra/creator-applications-schema.sql';

export interface CreatorApplicationInput {
  name: string;
  email: string;
  phone?: string;
  wechatId?: string;
  xiaohongshuHandle?: string;
  contentVertical?: string;
  wantsFree: boolean;
  wantsPaid: boolean;
  intro?: string;
  sourcePage?: string;
}

export interface CreatorApplicationRecord extends CreatorApplicationInput {
  id: string;
  status: CreatorApplicationStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export const CREATOR_APPLICATION_STATUS_META: Record<
  CreatorApplicationStatus,
  { label: string; description: string }
> = {
  new: {
    label: '已提交',
    description: '申请已收到，正在排队审核。',
  },
  contacted: {
    label: '待沟通',
    description: '我们准备进一步联系你确认内容方向与合作方式。',
  },
  qualified: {
    label: '已通过初筛',
    description: '基础审核已通过，正在等待最终确认与开通排期。',
  },
  approved: {
    label: '已通过',
    description: '你已经进入创作者内测名单，我们会继续发送后续开通指引。',
  },
  rejected: {
    label: '暂未通过',
    description: '本轮内测暂未通过，你可以后续补充资料后再次提交。',
  },
  archived: {
    label: '已归档',
    description: '当前申请已归档，如需继续参与可以重新提交资料。',
  },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+0-9\-()\s]{6,30}$/;

function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function sanitizeOptional(value: unknown, maxLength: number): string | undefined {
  const normalized = sanitizeText(value, maxLength);
  return normalized.length > 0 ? normalized : undefined;
}

export function normalizeCreatorApplicationInput(raw: unknown): CreatorApplicationInput {
  const body = (raw ?? {}) as Record<string, unknown>;

  return {
    name: sanitizeText(body.name, 80),
    email: sanitizeText(body.email, 160).toLowerCase(),
    phone: sanitizeOptional(body.phone, 40),
    wechatId: sanitizeOptional(body.wechatId, 80),
    xiaohongshuHandle: sanitizeOptional(body.xiaohongshuHandle, 80),
    contentVertical: sanitizeOptional(body.contentVertical, 200),
    wantsFree: Boolean(body.wantsFree),
    wantsPaid: Boolean(body.wantsPaid),
    intro: sanitizeOptional(body.intro, 3000),
    sourcePage: sanitizeOptional(body.sourcePage, 200),
  };
}

export function validateCreatorApplicationInput(data: CreatorApplicationInput): string | null {
  if (!data.name) return '请填写称呼';
  if (!data.email || !EMAIL_RE.test(data.email)) return '请填写有效邮箱';
  if (data.phone && !PHONE_RE.test(data.phone)) return '手机号格式不正确';
  if (!data.wantsFree && !data.wantsPaid) return '请至少选择一种发布模式（免费或付费）';
  return null;
}

export const CREATOR_APPLICATION_STATUS_OPTIONS: CreatorApplicationStatus[] = [
  'new',
  'contacted',
  'qualified',
  'approved',
  'rejected',
  'archived',
];

export function isCreatorApplicationStatus(value: unknown): value is CreatorApplicationStatus {
  return typeof value === 'string' && CREATOR_APPLICATION_STATUS_OPTIONS.includes(value as CreatorApplicationStatus);
}

export function isCreatorApplicationsTableMissing(error: unknown): error is { code?: string } {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { code?: string; message?: string };
  if (candidate.code === 'PGRST205') return true;
  if (candidate.code === '42703' && candidate.message?.includes('creator_applications.user_id')) return true;
  return false;
}

export function getCreatorApplicationsSchemaDetails(): string {
  return (
    `Missing table or required columns on public.${CREATOR_APPLICATIONS_TABLE}. ` +
    `Run the latest ${CREATOR_APPLICATIONS_SCHEMA_DOC} or ${CREATOR_APPLICATIONS_SETUP_DOC} in Supabase SQL Editor.`
  );
}
