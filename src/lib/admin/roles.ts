export const ADMIN_USER_IDS_ENV = 'ADMIN_USER_IDS';

export function getAdminUserIds(): Set<string> {
  const raw = process.env[ADMIN_USER_IDS_ENV] ?? '';
  return new Set(raw.split(',').map((value) => value.trim()).filter(Boolean));
}

export function hasConfiguredAdminUsers(): boolean {
  return getAdminUserIds().size > 0;
}

export function isAdminUserId(userId: string | null | undefined): boolean {
  if (!userId) return false;
  return getAdminUserIds().has(userId);
}
