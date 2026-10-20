/**
 * Server-side: build the full merged 「我和他」 report (includes paid pairing
 * notes from ./itc-pairing). Do not import from client components.
 */
import { enrichCoupleSide, type CoupleMergeResult } from './couple';
import { matchTensionPairing } from './itc-pairing';

export function buildCoupleMerge(
  inviter: { slug: string; dims: number[] },
  partner: { slug: string; dims: number[] },
): CoupleMergeResult {
  const a = enrichCoupleSide(inviter);
  const b = enrichCoupleSide(partner);
  const pairing = matchTensionPairing(a.signature, b.signature);
  return { inviter: a, partner: b, pairing };
}
