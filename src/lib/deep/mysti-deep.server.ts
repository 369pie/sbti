/** SERVER ONLY — Mysti tarot paid content (soul-letter). */
import { getSoulLetter, type SoulLetter } from '@/lib/mysti/soul-letters';

export function buildMystiLetterPayload(slug: string): SoulLetter | null {
  return getSoulLetter(slug);
}
