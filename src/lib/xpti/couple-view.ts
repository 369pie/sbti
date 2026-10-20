/**
 * Server-only: build the client view of a couple, gating the PAID part of the
 * 「我和他」 report. Every route/page that ships couple data must go through here.
 *
 * Free (locked) view = what the result page renders above the paywall:
 *   pairing.{id,label,english,oneLine,intensity}, both sides' slug/archetype/
 *   dims/signature/axes (radar, signature blocks, axis-by-axis).
 * Paid = pairing.longDescription, pairing.notes, and `deep`
 *   (dialogue scripts, 30-day practice, conflict rehearsals, love letter).
 */
import { coupleUnlockState } from '@/lib/member-access';
import type { CoupleMergeResult } from '@/lib/xpti/couple';
import type { XptiCoupleRow } from '@/lib/xpti/couple-server';
import type { CoupleDeepPayload, PublicCoupleView } from '@/lib/xpti/couple-client-api';
import {
  CONFLICT_SCRIPTS,
  PRACTICE_30DAYS,
  composeLoveLetter,
  getDialogueScriptsForPairing,
} from '@/lib/xpti/paid-content';

/** Paid keys — exported for tests. */
export const PAID_PAIRING_KEYS = ['longDescription', 'notes'] as const;

export function redactMerge(merge: CoupleMergeResult | null): CoupleMergeResult | null {
  if (!merge) return null;
  const { longDescription: _l, notes: _n, ...freePairing } = merge.pairing;
  void _l;
  void _n;
  return { ...merge, pairing: freePairing as CoupleMergeResult['pairing'] };
}

export function buildCoupleDeep(merge: CoupleMergeResult | null): CoupleDeepPayload | null {
  if (!merge) return null;
  const pairingId = merge.pairing.id;
  return {
    dialogues: getDialogueScriptsForPairing(pairingId),
    practice: PRACTICE_30DAYS[pairingId] ?? [],
    conflicts: CONFLICT_SCRIPTS[pairingId] ?? [],
    letter: composeLoveLetter({
      pairingId,
      fromNickname: null,
      toNickname: null,
      signatureFrom: merge.inviter.signature.label,
      signatureTo: merge.partner.signature.label,
    }),
  };
}

/** Gate a merged payload given an already-computed unlock decision. */
export function gateMerged(merge: CoupleMergeResult | null, unlocked: boolean) {
  return unlocked
    ? { merged: merge, deep: buildCoupleDeep(merge) }
    : { merged: redactMerge(merge), deep: null };
}

export async function buildCoupleView(
  couple: XptiCoupleRow,
  opts: { deviceId?: string | null } = {},
): Promise<PublicCoupleView> {
  const unlock = await coupleUnlockState(couple, opts);
  const gated = gateMerged(couple.merged_payload, unlock.unlocked);
  return {
    shareToken: couple.share_token,
    pairCode: couple.pair_code,
    status: couple.status,
    inviter: { slug: couple.inviter_slug, dims: couple.inviter_dims, nickname: couple.inviter_nickname },
    partner: couple.partner_slug
      ? { slug: couple.partner_slug, dims: couple.partner_dims ?? [], nickname: couple.partner_nickname }
      : null,
    merged: gated.merged,
    deep: gated.deep,
    unlocked: unlock.unlocked,
    unlockedVia: unlock.via,
    unlockedSku: couple.unlocked_sku,
    unlockedAt: couple.unlocked_at,
    completedAt: couple.completed_at,
    expiresAt: couple.expires_at,
    history: (couple.history ?? []) as PublicCoupleView['history'],
    practiceChecklist: (couple.practice_checklist as PublicCoupleView['practiceChecklist'] | null) ?? {},
  };
}
