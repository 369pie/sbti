/**
 * HERMOSA · 她说·沙龙｜Talent 档案 · 浏览器本地存档
 *
 * Her Voice 是无账号系统：talent 档案的"编辑权"靠 (talent_id, edit_token) 二元组持有。
 * 浏览器丢失 = 档案进入只读状态（项目方仍可看 / 仍可被 Whisper），符合"不再营业"的现实语义。
 */

const PROFILE_KEY = 'hermosa.talent.profile.v1';

export interface TalentLocalProfile {
  id: string;
  edit_token: string;
  handle: string;
  pitch: string;
  skills: string[];
  contact_email: string | null;
  contact_note: string | null;
  is_open_to_collab: boolean;
  updated_at: string;
}

export function loadTalentProfile(): TalentLocalProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TalentLocalProfile>;
    if (
      typeof parsed?.id !== 'string' ||
      typeof parsed?.edit_token !== 'string' ||
      typeof parsed?.handle !== 'string' ||
      typeof parsed?.pitch !== 'string' ||
      !Array.isArray(parsed?.skills)
    ) {
      return null;
    }
    return {
      id: parsed.id,
      edit_token: parsed.edit_token,
      handle: parsed.handle,
      pitch: parsed.pitch,
      skills: parsed.skills.filter((x): x is string => typeof x === 'string').slice(0, 3),
      contact_email: typeof parsed.contact_email === 'string' ? parsed.contact_email : null,
      contact_note: typeof parsed.contact_note === 'string' ? parsed.contact_note : null,
      is_open_to_collab: parsed.is_open_to_collab !== false,
      updated_at: typeof parsed.updated_at === 'string' ? parsed.updated_at : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveTalentProfile(profile: TalentLocalProfile): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* quota */
  }
}

export function clearTalentProfile(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(PROFILE_KEY);
  } catch {
    /* ignore */
  }
}
