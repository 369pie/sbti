export type CreatorApplicationStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'approved'
  | 'rejected'
  | 'archived';

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

export function getAdminTokenFromRequest(req: Request): string | null {
  const headerToken = req.headers.get('x-admin-token')?.trim();
  if (headerToken) return headerToken;

  const auth = req.headers.get('authorization')?.trim();
  if (auth?.toLowerCase().startsWith('bearer ')) {
    const bearer = auth.slice(7).trim();
    if (bearer) return bearer;
  }

  const url = new URL(req.url);
  const queryToken = url.searchParams.get('token')?.trim();
  if (queryToken) return queryToken;

  return null;
}

export function isCreatorAdminTokenValid(token: string | null): boolean {
  const configured = process.env.CREATOR_ADMIN_TOKEN?.trim();
  if (!configured) return false;
  return token === configured;
}
