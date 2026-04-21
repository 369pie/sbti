import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export interface InviteLoopbackNotification {
  id: string;
  relationshipSlug: string;
  openedAt: string;
  createdAt: string;
}

interface InviteLoopbackRow {
  id: string;
  share_token: string;
  inviter_user_id: string;
  relationship_slug: string;
  opened_at: string | null;
  viewed_at: string | null;
  created_at: string;
}

function admin() {
  return createAdminSupabaseClient();
}

export async function createInviteLoopback(input: {
  inviterUserId: string;
  relationshipSlug: string;
}): Promise<{ shareToken: string }> {
  const shareToken = crypto.randomUUID();
  const { data, error } = await admin()
    .from('cpti_invite_loopbacks')
    .insert({
      share_token: shareToken,
      inviter_user_id: input.inviterUserId,
      relationship_slug: input.relationshipSlug,
    })
    .select('share_token')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'create_invite_loopback_failed');
  }

  return { shareToken: data.share_token as string };
}

export async function consumeInviteLoopback(input: {
  shareToken: string;
  openedByUserId: string;
}): Promise<{ ok: true; ignored: boolean; alreadyOpened: boolean }> {
  const { data, error } = await admin()
    .from('cpti_invite_loopbacks')
    .select('id, inviter_user_id, opened_at')
    .eq('share_token', input.shareToken)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    return { ok: true, ignored: true, alreadyOpened: false };
  }
  if ((data.inviter_user_id as string) === input.openedByUserId) {
    return { ok: true, ignored: true, alreadyOpened: false };
  }
  if (data.opened_at) {
    return { ok: true, ignored: false, alreadyOpened: true };
  }

  const { error: updateError } = await admin()
    .from('cpti_invite_loopbacks')
    .update({
      opened_at: new Date().toISOString(),
      opened_by_user_id: input.openedByUserId,
    })
    .eq('id', data.id as string)
    .is('opened_at', null);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return { ok: true, ignored: false, alreadyOpened: false };
}

export async function listPendingInviteLoopbacks(
  inviterUserId: string,
): Promise<InviteLoopbackNotification[]> {
  const { data, error } = await admin()
    .from('cpti_invite_loopbacks')
    .select('id, relationship_slug, opened_at, viewed_at, created_at')
    .eq('inviter_user_id', inviterUserId)
    .not('opened_at', 'is', null)
    .is('viewed_at', null)
    .order('opened_at', { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as InviteLoopbackRow[]).map((row) => ({
    id: row.id,
    relationshipSlug: row.relationship_slug,
    openedAt: row.opened_at ?? row.created_at,
    createdAt: row.created_at,
  }));
}

export async function markInviteLoopbacksSeen(inviterUserId: string): Promise<void> {
  const { error } = await admin()
    .from('cpti_invite_loopbacks')
    .update({ viewed_at: new Date().toISOString() })
    .eq('inviter_user_id', inviterUserId)
    .not('opened_at', 'is', null)
    .is('viewed_at', null);

  if (error) {
    throw new Error(error.message);
  }
}